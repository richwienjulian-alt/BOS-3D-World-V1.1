/* Mission BOS - Build 009N.5
   Structural and deterministic reference validator for realistic association.
   Uses the same pure radio model as the runtime controller.
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
      if (items[i] && (items[i].id === id || items[i].referenceId === id || items[i].towerId === id)) return items[i];
    }
    return null;
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
    var points = (route.points || []).map(function (point) { return { x: Number(point.x), z: Number(point.z) }; });
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
    return { sequence: sequence, events: events, state: state };
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

  function validate(layout, responsePlan, incidentPlan, scenePlan, associationPlan, cellLoadPlan) {
    var errors = [];
    var counts = {
      sourceDependencyErrors: 0,
      sourcePhaseErrors: 0,
      policyErrors: 0,
      radioModelErrors: 0,
      towerDefinitionErrors: 0,
      endpointReferenceErrors: 0,
      fixedServingTowerErrors: 0,
      routeReferenceErrors: 0,
      incidentCalibrationErrors: 0,
      sameCellStoryErrors: 0,
      stationaryStabilityErrors: 0,
      expectedCountErrors: 0
    };

    var radioModel = window.MissionBosNetworkRadioModel;
    if (!layout || !responsePlan || !incidentPlan || !scenePlan || !associationPlan || !cellLoadPlan || !radioModel) {
      addError(errors, counts, "sourceDependencyErrors", "root", "One or more plans or the shared radio model are missing.");
      return createResult(errors, counts, {}, []);
    }
    if (associationPlan.buildBase !== "009N.4 PASSED" || associationPlan.phase !== "009N.5 Realistic Association, Handover & Same-Cell Calibration") {
      addError(errors, counts, "sourcePhaseErrors", "associationPlan", associationPlan.phase);
    }

    var policy = associationPlan.policy || {};
    ["runtimeRandomization","cityGeometryChangesAllowed","staticPropChangesAllowed","trafficRouteChangesAllowed","pedestrianRouteChangesAllowed","responseRouteChangesAllowed","missionStateChangesAllowed","fixedServingTowerAllowed","automaticBOSActivationAllowed","automaticCameraMovementAllowed","fullRadioPlanningClaimed","dashboardRedesignAllowed","globalMissionLoadControllerChangesAllowed","networkLoadChangesAllowedInThisBuild","endpointSpecificTowerBiasAllowed","missionStateForcedTowerAllowed","hardCodedHandoverCoordinatesAllowed","capacityDeprioritizationChangesAllowedInThisBuild"].forEach(function (key) {
      if (policy[key] !== false) addError(errors, counts, "policyErrors", key, policy[key]);
    });
    ["associationAlgorithmChangesAllowedInThisBuild","handoverVisualizationChangesAllowedInThisBuild","sameCellCalibrationRequired","localCellLoadRequired","visualizationIsSimplifiedAndSymbolic","rightDashboardMustRemain","fileProtocolRequired"].forEach(function (key) {
      if (policy[key] !== true) addError(errors, counts, "policyErrors", key, policy[key]);
    });

    var model = associationPlan.selectionModel || {};
    if (model.id !== "SIMPLIFIED_RADIO_HANDOVER_V3" || model.radioModelProvider !== "MissionBosNetworkRadioModel" ||
        finite(model.pathLossExponent) === null || Number(model.pathLossExponent) <= 1 ||
        finite(model.localCellLoadPenaltyPerPercent) === null || Number(model.localCellLoadPenaltyPerPercent) <= 0 ||
        finite(model.handoverMargin) === null || Number(model.handoverMargin) <= 0 ||
        finite(model.timeToTriggerSeconds) === null || Number(model.timeToTriggerSeconds) <= 0 ||
        finite(model.minimumDwellSeconds) === null || Number(model.minimumDwellSeconds) <= Number(model.timeToTriggerSeconds) ||
        finite(model.evaluationIntervalSeconds) === null || Number(model.evaluationIntervalSeconds) <= 0 ||
        model.confirmedEventOnlyAfterTimeToTrigger !== true || model.candidateMustRemainSameTower !== true) {
      addError(errors, counts, "radioModelErrors", model.id, model);
    }

    var towers = buildTowerRecords(layout, associationPlan);
    if (towers.length !== 5) addError(errors, counts, "towerDefinitionErrors", "towerCount", towers.length);
    (associationPlan.towers || []).forEach(function (tower) {
      if (!tower || !findById(layout.mobileTowers || [], tower.referenceId) || finite(tower.siteCalibrationOffset) === null || !Array.isArray(tower.coverageInfluences)) {
        addError(errors, counts, "towerDefinitionErrors", tower && tower.id, tower);
      }
      (tower.coverageInfluences || []).forEach(function (influence) {
        if (!influence || influence.type !== "ellipse" || !influence.center || finite(influence.center.x) === null || finite(influence.center.z) === null || finite(influence.radiusX) === null || finite(influence.radiusZ) === null || finite(influence.peakGain) === null || Number(influence.radiusX) <= 0 || Number(influence.radiusZ) <= 0) {
          addError(errors, counts, "towerDefinitionErrors", tower && tower.id, influence);
        }
      });
    });

    (associationPlan.mobileEndpoints || []).forEach(function (endpoint) {
      if (!endpoint || !endpoint.id || !endpoint.referenceId || !endpoint.kind) {
        addError(errors, counts, "endpointReferenceErrors", endpoint && endpoint.id, endpoint);
      } else if (endpoint.kind === "response-vehicle" && !findById(incidentPlan.vehicles || responsePlan.vehicles || [], endpoint.referenceId)) {
        addError(errors, counts, "endpointReferenceErrors", endpoint.id, endpoint.referenceId);
      } else if (endpoint.kind === "mission-phone") {
        var actor = findById(scenePlan.actors || [], endpoint.referenceId);
        if (!actor || actor.role !== "spectator" || actor.phone !== true) addError(errors, counts, "endpointReferenceErrors", endpoint.id, endpoint.referenceId);
      }
      if (endpoint && (endpoint.expectedTowerId || endpoint.expectedInitialTowerId || endpoint.expectedIncidentTowerId || endpoint.servingTowerId || endpoint.fixedTowerId)) {
        addError(errors, counts, "fixedServingTowerErrors", endpoint.id, endpoint);
      }
    });

    var calibration = associationPlan.referenceCalibration || {};
    if (calibration.runtimeEnforcement !== false || !Array.isArray(calibration.routeScenarios)) {
      addError(errors, counts, "routeReferenceErrors", "referenceCalibration", calibration);
    }
    var routeResults = [];
    (calibration.routeScenarios || []).forEach(function (scenario) {
      var endpoint = findById(associationPlan.mobileEndpoints || [], scenario.endpointId);
      var vehicle = endpoint ? findById(incidentPlan.vehicles || [], endpoint.referenceId) : null;
      var route = vehicle ? findById(incidentPlan.routes || [], vehicle.routeId) : null;
      var profile = profileByState(cellLoadPlan, scenario.loadState);
      if (!endpoint || !vehicle || !route || route.id !== scenario.routeId || !profile) {
        addError(errors, counts, "routeReferenceErrors", scenario.id, "Reference route dependencies are missing.");
        return;
      }
      var result = simulateRoute(route, vehicle, scenario.direction, towers, profile.targets, model, radioModel);
      routeResults.push({ id: scenario.id, sequence: result.sequence, events: result.events });
      if (!arraysEqual(result.sequence, scenario.expectedSequence) || result.events.length !== Number(scenario.expectedConfirmedHandovers)) {
        addError(errors, counts, "routeReferenceErrors", scenario.id, { expected: scenario.expectedSequence, actual: result.sequence, events: result.events });
      }
    });

    var peak = profileByState(cellLoadPlan, "OVERLOADED");
    var assignments = {};
    Object.keys(calibration.incidentAssignments || {}).forEach(function (endpointId) {
      var position = resolveReferencePosition(endpointId, incidentPlan, scenePlan, associationPlan);
      if (!position || !peak) {
        addError(errors, counts, "incidentCalibrationErrors", endpointId, "Position or peak load unavailable.");
        return;
      }
      var ranked = radioModel.rankTowers(position, towers, peak.targets, model);
      var actual = ranked.length ? ranked[0].towerId : null;
      assignments[endpointId] = actual;
      if (actual !== calibration.incidentAssignments[endpointId]) {
        addError(errors, counts, "incidentCalibrationErrors", endpointId, { expected: calibration.incidentAssignments[endpointId], actual: actual });
      }
    });

    var shared = calibration.sharedCellRequirements || {};
    var bosAtShared = ["NET_FIRE_01","NET_POLICE_01"].filter(function (id) { return assignments[id] === shared.incidentBosCellId; }).length;
    var civilAtShared = Object.keys(assignments).filter(function (id) { return id.indexOf("NET_PHONE_") === 0 && assignments[id] === shared.incidentBosCellId; }).length;
    var civilAtSecondary = Object.keys(assignments).filter(function (id) { return id.indexOf("NET_PHONE_") === 0 && assignments[id] === shared.secondaryCivilianCellId; }).length;
    if (bosAtShared < Number(shared.minimumBosEndpointsAtCell) || civilAtShared < Number(shared.minimumVisibleCivilianEndpointsAtSameCell) || civilAtSecondary < Number(shared.minimumVisibleCivilianEndpointsAtSecondaryCell)) {
      addError(errors, counts, "sameCellStoryErrors", "incident", { assignments: assignments, bosAtShared: bosAtShared, civilAtShared: civilAtShared, civilAtSecondary: civilAtSecondary });
    }
    if (!peak || Number(peak.targets[shared.incidentBosCellId]) < 90 || Number(peak.targets[shared.secondaryCivilianCellId]) < 90) {
      addError(errors, counts, "sameCellStoryErrors", "overloadedCells", peak && peak.targets);
    }

    var stability = calibration.stationaryStability || {};
    Object.keys(assignments).forEach(function (endpointId) {
      var position = resolveReferencePosition(endpointId, incidentPlan, scenePlan, associationPlan);
      var state = radioModel.createDecisionState();
      var time = 0;
      var initialTower = null;
      var confirmed = 0;
      while (time <= Number(stability.holdSeconds || 30) + EPSILON) {
        var result = radioModel.updateDecision(state, { time: time, position: position, towers: towers, loadsByTowerId: peak.targets, model: model });
        if (initialTower === null) initialTower = state.servingTowerId;
        if (result.event) confirmed += 1;
        time += Number(model.evaluationIntervalSeconds);
      }
      if (confirmed > Number(stability.maximumConfirmedHandoversPerEndpoint || 0) || state.servingTowerId !== initialTower) {
        addError(errors, counts, "stationaryStabilityErrors", endpointId, { initial: initialTower, final: state.servingTowerId, handovers: confirmed });
      }
    });

    var actualCounts = {
      towers: (associationPlan.towers || []).length,
      mobileEndpoints: (associationPlan.mobileEndpoints || []).length,
      responseVehicleEndpoints: (associationPlan.mobileEndpoints || []).filter(function (item) { return item.kind === "response-vehicle"; }).length,
      missionPhoneEndpoints: (associationPlan.mobileEndpoints || []).filter(function (item) { return item.kind === "mission-phone"; }).length,
      referenceRouteScenarios: (calibration.routeScenarios || []).length,
      referenceIncidentAssignments: Object.keys(calibration.incidentAssignments || {}).length,
      sharedIncidentBosEndpoints: bosAtShared,
      sharedIncidentCivilianEndpoints: civilAtShared,
      fixedServingTowerDefinitions: 0
    };
    Object.keys(associationPlan.expectedCounts || {}).forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(actualCounts, key) && Number(actualCounts[key]) !== Number(associationPlan.expectedCounts[key])) {
        addError(errors, counts, "expectedCountErrors", key, { expected: associationPlan.expectedCounts[key], actual: actualCounts[key] });
      }
    });

    return createResult(errors, counts, actualCounts, routeResults, assignments);
  }

  function createResult(errors, counts, actual, routeResults, assignments) {
    return {
      title: "MISSION BOS REALISTIC NETWORK ASSOCIATION V3 VALIDATION",
      counts: counts,
      actual: actual || {},
      routeResults: routeResults || [],
      incidentAssignments: assignments || {},
      errors: errors,
      status: errors.length === 0 ? "PASSED" : "FAILED"
    };
  }

  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    Object.keys(result.counts || {}).forEach(function (key) { console[method](key + ": " + result.counts[key]); });
    (result.routeResults || []).forEach(function (route) { console[method](route.id + ": " + route.sequence.join(" -> ")); });
    console[method]("Incident assignments: " + JSON.stringify(result.incidentAssignments || {}));
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosNetworkAssociationValidator = {
    validate: validate,
    logResult: logResult
  };
})();
