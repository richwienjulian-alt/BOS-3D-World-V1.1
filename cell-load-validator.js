/* Mission BOS - Build 010P.4
   Structural validator for deterministic local cell load and V3 association compatibility.
   Uses MissionBosNetworkRadioModel for all route and incident reference checks.
*/
(function () {
  "use strict";

  var EPSILON = 1e-9;

  function finite(value) {
    var number = Number(value);
    return isFinite(number) ? number : null;
  }

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      var item = items[i];
      if (item && (item.id === id || item.towerId === id || item.referenceId === id)) return item;
    }
    return null;
  }

  function uniqueIds(items, key) {
    var seen = Object.create(null);
    var duplicates = [];
    (items || []).forEach(function (item) {
      var id = item && item[key || "id"];
      if (!id) return;
      if (seen[id]) duplicates.push(id);
      seen[id] = true;
    });
    return duplicates;
  }

  function addError(errors, counts, key, id, detail) {
    counts[key] += 1;
    errors.push({ category: key, id: id || "", detail: detail || null });
  }

  function profileByState(plan, stateId) {
    return (plan.missionStateProfiles || []).filter(function (profile) {
      return profile && profile.stateId === stateId;
    })[0] || null;
  }

  function buildTowerRecords(layout, associationPlan) {
    return (associationPlan.towers || []).map(function (definition) {
      var source = findById(layout.mobileTowers || [], definition.referenceId);
      if (!source || !source.worldRect) return null;
      return {
        id: definition.referenceId,
        available: definition.available === true,
        siteCalibrationOffset: Number(definition.siteCalibrationOffset || 0),
        coverageInfluences: definition.coverageInfluences || [],
        position: { x: Number(source.worldRect.x), z: Number(source.worldRect.z) }
      };
    }).filter(Boolean);
  }

  function routePoints(route, direction) {
    var points = (route.points || []).map(function (point) {
      return { x: Number(point.x), z: Number(point.z) };
    });
    if (direction === "return") points.reverse();
    return points;
  }

  function sampleSegment(a, b, distance) {
    var dx = b.x - a.x;
    var dz = b.z - a.z;
    var length = Math.sqrt(dx * dx + dz * dz);
    var t = length > 0 ? Math.max(0, Math.min(1, distance / length)) : 0;
    return { x: a.x + dx * t, z: a.z + dz * t };
  }

  function simulateRoute(route, vehicle, direction, towers, loads, model, radioModel) {
    var points = routePoints(route, direction);
    var speed = Number(direction === "return" ? vehicle.returnSpeed : vehicle.outboundSpeed);
    var dt = Number(model.evaluationIntervalSeconds);
    var state = radioModel.createDecisionState();
    var sequence = [];
    var events = [];
    var time = 0;

    for (var segmentIndex = 0; segmentIndex < points.length - 1; segmentIndex += 1) {
      var a = points[segmentIndex];
      var b = points[segmentIndex + 1];
      var dx = b.x - a.x;
      var dz = b.z - a.z;
      var length = Math.sqrt(dx * dx + dz * dz);
      var traveled = 0;
      while (traveled < length - EPSILON) {
        var position = sampleSegment(a, b, traveled);
        var result = radioModel.updateDecision(state, {
          time: time,
          position: position,
          towers: towers,
          loadsByTowerId: loads,
          model: model
        });
        if (sequence.length === 0 && state.servingTowerId) sequence.push(state.servingTowerId);
        if (result.event) {
          sequence.push(result.event.toTowerId);
          events.push({
            time: time,
            x: position.x,
            z: position.z,
            fromTowerId: result.event.fromTowerId,
            toTowerId: result.event.toTowerId,
            advantage: result.event.candidateAdvantage
          });
        }
        traveled = Math.min(length, traveled + speed * dt);
        time += dt;
      }
    }

    var end = points[points.length - 1];
    var holdUntil = time + Math.max(1, Number(model.timeToTriggerSeconds) + Number(model.evaluationIntervalSeconds));
    while (time <= holdUntil + EPSILON) {
      var holdResult = radioModel.updateDecision(state, {
        time: time,
        position: end,
        towers: towers,
        loadsByTowerId: loads,
        model: model
      });
      if (sequence.length === 0 && state.servingTowerId) sequence.push(state.servingTowerId);
      if (holdResult.event) {
        sequence.push(holdResult.event.toTowerId);
        events.push({
          time: time,
          x: end.x,
          z: end.z,
          fromTowerId: holdResult.event.fromTowerId,
          toTowerId: holdResult.event.toTowerId,
          advantage: holdResult.event.candidateAdvantage
        });
      }
      time += dt;
    }
    return { sequence: sequence, events: events };
  }

  function arraysEqual(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
    return true;
  }

  function resolveReferencePosition(endpointId, incidentPlan, scenePlan, associationPlan) {
    if (endpointId === "NET_FIRE_01") return incidentPlan.incident && incidentPlan.incident.fireStaging;
    if (endpointId === "NET_POLICE_01") return incidentPlan.incident && incidentPlan.incident.policeStaging;
    var endpoint = findById(associationPlan.mobileEndpoints || [], endpointId);
    var actor = endpoint ? findById(scenePlan.actors || [], endpoint.referenceId) : null;
    return actor && actor.position;
  }

  function validate(layout, missionPlan, scenePlan, incidentPlan, associationPlan, cellLoadPlan) {
    var errors = [];
    var counts = {
      sourceDependencyErrors: 0,
      sourcePhaseErrors: 0,
      policyErrors: 0,
      loadModelErrors: 0,
      cellDefinitionErrors: 0,
      cellReferenceErrors: 0,
      duplicateIdErrors: 0,
      stateProfileErrors: 0,
      loadRangeErrors: 0,
      bosPriorityPolicyErrors: 0,
      associationIntegrationErrors: 0,
      routeExpectationErrors: 0,
      incidentAssignmentErrors: 0,
      dashboardPolicyErrors: 0,
      expectedCountErrors: 0
    };
    var radioModel = window.MissionBosNetworkRadioModel;

    if (!layout || !missionPlan || !scenePlan || !incidentPlan || !associationPlan || !cellLoadPlan || !radioModel) {
      addError(errors, counts, "sourceDependencyErrors", "root", "One or more required plans or the shared radio model are missing.");
      return createResult(errors, counts, {}, []);
    }

    if (cellLoadPlan.buildBase !== "010P.3 PASSED" || cellLoadPlan.phase !== "009N.5 Local Cell Load Compatibility" ||
        cellLoadPlan.dualMissionPhase !== "010P.4 Dual-Mission Local Cell Load Compatibility" ||
        associationPlan.buildBase !== "009N.4 PASSED" || associationPlan.phase !== "009N.5 Realistic Association, Handover & Same-Cell Calibration") {
      addError(errors, counts, "sourcePhaseErrors", "phase", {
        cellLoadBuild: cellLoadPlan.buildBase,
        cellLoadPhase: cellLoadPlan.phase,
        associationBuild: associationPlan.buildBase,
        associationPhase: associationPlan.phase
      });
    }

    var policy = cellLoadPlan.policy || {};
    ["runtimeRandomization", "cityGeometryChangesAllowed", "staticPropChangesAllowed", "trafficRouteChangesAllowed",
      "pedestrianRouteChangesAllowed", "responseRouteChangesAllowed", "missionStateChangesAllowed",
      "globalMissionLoadControllerChangesAllowed", "civilianLoadMayDropAfterBOSActivation",
      "automaticBOSActivationAllowed", "towerOutageSimulationAllowedInThisBuild", "fullRadioPlanningClaimed",
      "newStandaloneDashboardAllowed"].forEach(function (key) {
      if (policy[key] !== false) addError(errors, counts, "policyErrors", key, policy[key]);
    });
    ["localCellLoadLayerRequired", "localCellLoadMayInfluenceAssociation", "visualizationIsSimplifiedAndSymbolic",
      "rightDashboardMustRemain", "fileProtocolRequired"].forEach(function (key) {
      if (policy[key] !== true) addError(errors, counts, "policyErrors", key, policy[key]);
    });

    var loadModel = cellLoadPlan.loadModel || {};
    if (!loadModel.id || finite(loadModel.rangeMin) === null || Number(loadModel.rangeMin) !== 0 ||
        finite(loadModel.rangeMax) === null || Number(loadModel.rangeMax) !== 100 ||
        !(Number(loadModel.normalBelow) < Number(loadModel.highLoadBelow)) ||
        Number(loadModel.highLoadBelow) !== Number(loadModel.overloadedAtOrAbove) ||
        finite(loadModel.riseRatePerSecond) === null || Number(loadModel.riseRatePerSecond) <= 0 ||
        finite(loadModel.fallRatePerSecond) === null || Number(loadModel.fallRatePerSecond) <= 0 ||
        finite(loadModel.evaluationIntervalSeconds) === null || Number(loadModel.evaluationIntervalSeconds) <= 0) {
      addError(errors, counts, "loadModelErrors", loadModel.id, loadModel);
    }

    uniqueIds(cellLoadPlan.cells || [], "id").forEach(function (id) {
      addError(errors, counts, "duplicateIdErrors", id, "Duplicate cell id.");
    });
    uniqueIds(cellLoadPlan.cells || [], "towerId").forEach(function (id) {
      addError(errors, counts, "duplicateIdErrors", id, "Duplicate tower reference.");
    });

    var layoutTowers = layout.mobileTowers || [];
    var associationTowers = associationPlan.towers || [];
    (cellLoadPlan.cells || []).forEach(function (cell) {
      if (!cell || !cell.id || !cell.towerId || !cell.label || finite(cell.baseLoad) === null) {
        addError(errors, counts, "cellDefinitionErrors", cell && cell.id, cell);
        return;
      }
      if (Number(cell.baseLoad) < 0 || Number(cell.baseLoad) > 100) {
        addError(errors, counts, "loadRangeErrors", cell.id, cell.baseLoad);
      }
      if (!findById(layoutTowers, cell.towerId) || !findById(associationTowers, cell.towerId)) {
        addError(errors, counts, "cellReferenceErrors", cell.id, cell.towerId);
      }
    });

    var stateOrder = missionPlan.stateOrder || [];
    var profiles = cellLoadPlan.missionStateProfiles || [];
    if (profiles.length !== stateOrder.length) {
      addError(errors, counts, "stateProfileErrors", "profileCount", { expected: stateOrder.length, actual: profiles.length });
    }
    stateOrder.forEach(function (stateId) {
      var profile = profileByState(cellLoadPlan, stateId);
      if (!profile || finite(profile.expectedGlobalLoad) === null || !profile.targets) {
        addError(errors, counts, "stateProfileErrors", stateId, profile);
        return;
      }
      (cellLoadPlan.cells || []).forEach(function (cell) {
        var value = finite(profile.targets[cell.towerId]);
        if (value === null) addError(errors, counts, "stateProfileErrors", stateId + ":" + cell.towerId, null);
        else if (value < 0 || value > 100) addError(errors, counts, "loadRangeErrors", stateId + ":" + cell.towerId, value);
      });
    });

    var overloaded = profileByState(cellLoadPlan, "OVERLOADED");
    ["BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"].forEach(function (stateId) {
      var profile = profileByState(cellLoadPlan, stateId);
      if (!profile || !overloaded || JSON.stringify(profile.targets) !== JSON.stringify(overloaded.targets)) {
        addError(errors, counts, "bosPriorityPolicyErrors", stateId, "Civilian loads changed after BOS activation.");
      }
    });
    var priority = cellLoadPlan.bosPriority || {};
    if (priority.activationSource !== "existing-network-manager-bos-state" ||
        priority.followsCurrentServingCell !== true || priority.priorityCellsAreDerivedAtRuntime !== true ||
        Number(priority.civilianLoadReduction) !== 0 || priority.priorityDoesNotCreateAdditionalCapacityClaim !== true ||
        !Array.isArray(priority.eligibleAssociationEndpointIds) || priority.eligibleAssociationEndpointIds.length !== 3 ||
        priority.eligibleAssociationEndpointIds.indexOf("NET_AMBULANCE_01") < 0) {
      addError(errors, counts, "bosPriorityPolicyErrors", "bosPriority", priority);
    }

    var integration = cellLoadPlan.associationIntegration || {};
    var selection = associationPlan.selectionModel || {};
    if (selection.id !== integration.requiredSelectionModelId ||
        selection.radioModelProvider !== "MissionBosNetworkRadioModel" ||
        integration.radioModelProvider !== "MissionBosNetworkRadioModel" ||
        selection.localCellLoadProvider !== "MissionBosCellLoadController" ||
        finite(selection.localCellLoadPenaltyPerPercent) === null ||
        Math.abs(Number(selection.localCellLoadPenaltyPerPercent) - Number(integration.localCellLoadPenaltyPerPercent)) > EPSILON ||
        Number(selection.localCellLoadPenaltyPerPercent) <= 0) {
      addError(errors, counts, "associationIntegrationErrors", "selectionModel", selection);
    }

    var towers = buildTowerRecords(layout, associationPlan);
    var routeResults = [];
    var calibration = associationPlan.referenceCalibration || {};
    (calibration.routeScenarios || []).forEach(function (scenario) {
      var endpoint = findById(associationPlan.mobileEndpoints || [], scenario.endpointId);
      var vehicle = endpoint ? findById(incidentPlan.vehicles || [], endpoint.referenceId) : null;
      var route = vehicle ? findById(incidentPlan.routes || [], vehicle.routeId) : null;
      var profile = profileByState(cellLoadPlan, scenario.loadState);
      if (!endpoint || !vehicle || !route || route.id !== scenario.routeId || !profile) {
        addError(errors, counts, "routeExpectationErrors", scenario.id, "Reference route dependencies are missing.");
        return;
      }
      var result = simulateRoute(route, vehicle, scenario.direction, towers, profile.targets, selection, radioModel);
      routeResults.push({ id: scenario.id, sequence: result.sequence, events: result.events });
      if (!arraysEqual(result.sequence, scenario.expectedSequence) || result.events.length !== Number(scenario.expectedConfirmedHandovers)) {
        addError(errors, counts, "routeExpectationErrors", scenario.id, { expected: scenario.expectedSequence, actual: result.sequence, events: result.events });
      }
    });

    var peakProfile = profileByState(cellLoadPlan, "OVERLOADED");
    var expectedAssignments = integration.expectedIncidentAssignments || {};
    Object.keys(expectedAssignments).forEach(function (endpointId) {
      var position = resolveReferencePosition(endpointId, incidentPlan, scenePlan, associationPlan);
      var ranked = position && peakProfile ? radioModel.rankTowers(position, towers, peakProfile.targets, selection) : [];
      var actualTower = ranked.length ? ranked[0].towerId : null;
      if (actualTower !== expectedAssignments[endpointId]) {
        addError(errors, counts, "incidentAssignmentErrors", endpointId, { expected: expectedAssignments[endpointId], actual: actualTower });
      }
    });

    var dashboard = cellLoadPlan.dashboard || {};
    if (dashboard.placement !== "inside-existing-right-dashboard" ||
        dashboard.preserveExistingGlobalLoadMeter !== true || dashboard.preserveExistingAssociationRows !== true ||
        dashboard.newStandalonePanelAllowed !== false || dashboard.showPercent !== true ||
        dashboard.showStatus !== true || dashboard.showBosPriorityBadge !== true || dashboard.showCriticalCell !== true ||
        !Array.isArray(dashboard.rows) || dashboard.rows.length !== 5) {
      addError(errors, counts, "dashboardPolicyErrors", "dashboard", dashboard);
    }

    var peakOverloadedCount = 0;
    (cellLoadPlan.cells || []).forEach(function (cell) {
      if (Number(overloaded.targets[cell.towerId]) >= Number(loadModel.overloadedAtOrAbove)) peakOverloadedCount += 1;
    });
    var actual = {
      cells: (cellLoadPlan.cells || []).length,
      missionStateProfiles: profiles.length,
      manualProfileCells: Object.keys((cellLoadPlan.manualLoadProfile || {}).peakTargets || {}).length,
      priorityEligibleEndpoints: (priority.eligibleAssociationEndpointIds || []).length,
      overloadedCellsAtMissionPeak: peakOverloadedCount,
      dashboardRows: (dashboard.rows || []).length,
      automaticBOSActivations: policy.automaticBOSActivationAllowed === true ? 1 : 0,
      towerOutages: policy.towerOutageSimulationAllowedInThisBuild === true ? 1 : 0,
      civilianLoadReductionsAfterBOS: Number(priority.civilianLoadReduction || 0) !== 0 ? 1 : 0
    };
    Object.keys(cellLoadPlan.expectedCounts || {}).forEach(function (key) {
      if (Number(actual[key]) !== Number(cellLoadPlan.expectedCounts[key])) {
        addError(errors, counts, "expectedCountErrors", key, { expected: cellLoadPlan.expectedCounts[key], actual: actual[key] });
      }
    });

    return createResult(errors, counts, actual, routeResults);
  }

  function createResult(errors, counts, actual, routeResults) {
    return {
      title: "MISSION BOS CELL LOAD DUAL-MISSION VALIDATION",
      counts: counts,
      actual: actual || {},
      routeResults: routeResults || [],
      errors: errors,
      status: errors.length === 0 ? "PASSED" : "FAILED"
    };
  }

  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    Object.keys(result.counts || {}).forEach(function (key) { console[method](key + ": " + result.counts[key]); });
    (result.routeResults || []).forEach(function (route) { console[method](route.id + ": " + route.sequence.join(" -> ")); });
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosCellLoadValidator = { validate: validate, logResult: logResult };
})();
