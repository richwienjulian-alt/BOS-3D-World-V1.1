/* Mission BOS - Build 009N.7
   Structural and deterministic reference validator for representative civilian
   connectivity, dynamic local load contribution and compact network inspection.
   No Three.js dependency. No modules. No fetch.
*/
(function () {
  "use strict";

  var EPSILON = 1e-9;

  function finite(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function addError(errors, counts, key, id, detail) {
    counts[key] += 1;
    errors.push({ category: key, id: id || "", detail: detail == null ? null : detail });
  }

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      var item = items[i];
      if (item && (item.id === id || item.towerId === id || item.referenceId === id)) return item;
    }
    return null;
  }

  function profileByState(cellLoadPlan, stateId) {
    return ((cellLoadPlan && cellLoadPlan.missionStateProfiles) || []).filter(function (profile) {
      return profile && profile.stateId === stateId;
    })[0] || null;
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

  function buildTowerRecords(layout, associationPlan) {
    return (associationPlan.towers || []).map(function (definition) {
      var source = findById(layout.mobileTowers || [], definition.referenceId);
      if (!source || !source.worldRect) return null;
      return {
        id: definition.referenceId,
        available: definition.available === true,
        siteCalibrationOffset: finite(definition.siteCalibrationOffset, 0),
        coverageInfluences: copy(definition.coverageInfluences || []),
        position: { x: Number(source.worldRect.x), z: Number(source.worldRect.z) }
      };
    }).filter(Boolean);
  }

  function buildEndpointSamplers(trafficPlan, pedestrianPlan, representativePlan, trafficValidator, pedestrianValidator) {
    var trafficRoutes = Object.create(null);
    var pedestrianRoutes = Object.create(null);
    var trafficById = Object.create(null);
    var pedestrianById = Object.create(null);

    (trafficPlan.routes || []).forEach(function (route) {
      trafficRoutes[route.id] = trafficValidator.prepareRoute(route);
    });
    (pedestrianPlan.routes || []).forEach(function (route) {
      pedestrianRoutes[route.id] = pedestrianValidator.prepareOpenRoute(route);
    });
    (trafficPlan.vehicles || []).forEach(function (vehicle) { trafficById[vehicle.id] = vehicle; });
    (pedestrianPlan.pedestrians || []).forEach(function (pedestrian) { pedestrianById[pedestrian.id] = pedestrian; });

    var samplers = Object.create(null);
    (representativePlan.endpoints || []).forEach(function (endpoint) {
      if (endpoint.kind === "civilian-vehicle") {
        var vehicle = trafficById[endpoint.referenceId];
        var route = vehicle ? trafficRoutes[vehicle.routeId] : null;
        if (!vehicle || !route) return;
        samplers[endpoint.id] = function (time) {
          return trafficValidator.sampleRoute(route, Number(vehicle.startDistance) + Number(vehicle.speed) * time);
        };
      } else if (endpoint.kind === "civilian-pedestrian") {
        var pedestrian = pedestrianById[endpoint.referenceId];
        var pedestrianRoute = pedestrian ? pedestrianRoutes[pedestrian.routeId] : null;
        if (!pedestrian || !pedestrianRoute) return;
        samplers[endpoint.id] = function (time) {
          return pedestrianValidator.samplePingPong(
            pedestrianRoute,
            Number(pedestrian.startDistance) + Number(pedestrian.initialDirection) * Number(pedestrian.speed) * time,
            Number(pedestrian.initialDirection)
          );
        };
      }
    });
    return samplers;
  }

  function simulateScenario(layout, trafficPlan, pedestrianPlan, associationPlan, cellLoadPlan, plan, scenario) {
    var trafficValidator = window.MissionBosTrafficValidator;
    var pedestrianValidator = window.MissionBosPedestrianValidator;
    var radioModel = window.MissionBosNetworkRadioModel;
    var representative = plan.representativeConnectivity || {};
    var endpoints = representative.endpoints || [];
    var profile = profileByState(cellLoadPlan, scenario.missionState);
    var baseLoads = profile ? copy(profile.targets || {}) : null;
    var towers = buildTowerRecords(layout, associationPlan);
    var samplers = buildEndpointSamplers(
      trafficPlan,
      pedestrianPlan,
      representative,
      trafficValidator,
      pedestrianValidator
    );
    var states = Object.create(null);
    var events = Object.create(null);
    var visited = Object.create(null);
    var contributions = Object.create(null);
    var initialContributions = null;
    var minLoads = Object.create(null);
    var maxLoads = Object.create(null);
    var dt = finite(scenario.sampleIntervalSeconds, 0.25);
    var duration = finite(scenario.durationSeconds, 240);
    var model = associationPlan.selectionModel || {};

    endpoints.forEach(function (endpoint) {
      states[endpoint.id] = radioModel.createDecisionState();
      events[endpoint.id] = [];
      visited[endpoint.id] = Object.create(null);
    });

    for (var time = 0; time <= duration + EPSILON; time += dt) {
      var effectiveBefore = copy(baseLoads || {});
      Object.keys(contributions).forEach(function (towerId) {
        effectiveBefore[towerId] = Math.min(100, finite(effectiveBefore[towerId], 0) + finite(contributions[towerId], 0));
      });

      var nextContributions = Object.create(null);
      endpoints.forEach(function (endpoint) {
        var sampler = samplers[endpoint.id];
        if (!sampler) return;
        var position = sampler(time);
        var result = radioModel.updateDecision(states[endpoint.id], {
          time: time,
          position: position,
          towers: towers,
          loadsByTowerId: effectiveBefore,
          model: model
        });
        var servingTowerId = states[endpoint.id].servingTowerId;
        if (servingTowerId) {
          visited[endpoint.id][servingTowerId] = true;
          nextContributions[servingTowerId] = finite(nextContributions[servingTowerId], 0) + finite(endpoint.demandUnits, 0);
        }
        if (result.event) events[endpoint.id].push(copy(result.event));
      });

      contributions = nextContributions;
      if (initialContributions === null) initialContributions = copy(contributions);

      Object.keys(baseLoads || {}).forEach(function (towerId) {
        var effective = Math.min(100, finite(baseLoads[towerId], 0) + finite(contributions[towerId], 0));
        minLoads[towerId] = minLoads[towerId] == null ? effective : Math.min(minLoads[towerId], effective);
        maxLoads[towerId] = maxLoads[towerId] == null ? effective : Math.max(maxLoads[towerId], effective);
      });
    }

    var endpointResults = Object.create(null);
    endpoints.forEach(function (endpoint) {
      endpointResults[endpoint.id] = {
        initialTowerId: (function () {
          var sampler = samplers[endpoint.id];
          if (!sampler) return null;
          var initialState = radioModel.createDecisionState();
          radioModel.updateDecision(initialState, {
            time: 0,
            position: sampler(0),
            towers: towers,
            loadsByTowerId: baseLoads,
            model: model
          });
          return initialState.servingTowerId;
        })(),
        handovers: events[endpoint.id].length,
        distinctTowers: Object.keys(visited[endpoint.id]).length,
        eventList: copy(events[endpoint.id])
      };
    });

    return {
      scenarioId: scenario.id,
      missionState: scenario.missionState,
      initialContributions: initialContributions || {},
      minLoads: minLoads,
      maxLoads: maxLoads,
      endpointResults: endpointResults
    };
  }

  function validate(layout, trafficPlan, pedestrianPlan, associationPlan, cellLoadPlan, capacityPlan, explorationInterfacePlan, plan) {
    var keys = [
      "sourceDependencyErrors", "sourcePhaseErrors", "policyErrors", "endpointDefinitionErrors",
      "endpointReferenceErrors", "duplicateIdErrors", "radioModelErrors", "dynamicLoadPolicyErrors",
      "visualizationPolicyErrors", "inspectionPolicyErrors", "inspectionReferenceErrors",
      "dashboardPolicyErrors", "runtimeContractErrors", "referenceSimulationErrors",
      "fixedServingTowerErrors", "expectedCountErrors"
    ];
    var counts = {};
    keys.forEach(function (key) { counts[key] = 0; });
    var errors = [];
    var simulations = [];

    var trafficValidator = window.MissionBosTrafficValidator;
    var pedestrianValidator = window.MissionBosPedestrianValidator;
    var radioModel = window.MissionBosNetworkRadioModel;

    if (!layout || !trafficPlan || !pedestrianPlan || !associationPlan || !cellLoadPlan ||
        !capacityPlan || !explorationInterfacePlan || !plan || !trafficValidator ||
        !pedestrianValidator || !radioModel) {
      addError(errors, counts, "sourceDependencyErrors", "root", "One or more required plans or shared validators are missing.");
      return createResult(errors, counts, simulations, plan);
    }

    if (plan.buildBase !== "009N.6 PASSED" ||
        plan.phase !== "009N.7 Interactive Network Inspection & Representative Civilian Connectivity" ||
        associationPlan.phase !== "009N.5 Realistic Association, Handover & Same-Cell Calibration" ||
        cellLoadPlan.phase !== "009N.5 Local Cell Load Compatibility" ||
        capacityPlan.phase !== "009N.6 Capacity Allocation, Civilian Deprioritization & BOS Priority" ||
        explorationInterfacePlan.phase !== "009N.4 Compact Dashboard & Exploration Integration") {
      addError(errors, counts, "sourcePhaseErrors", "phase", {
        plan: plan.phase,
        association: associationPlan.phase,
        cellLoad: cellLoadPlan.phase,
        capacity: capacityPlan.phase,
        exploration: explorationInterfacePlan.phase
      });
    }

    var policy = plan.policy || {};
    [
      "cityGeometryChangesAllowed", "staticPropChangesAllowed", "trafficRouteChangesAllowed",
      "pedestrianRouteChangesAllowed", "responseVehicleChangesAllowed", "missionStateChangesAllowed",
      "associationModelChangesAllowed", "radioModelChangesAllowed", "handoverParameterChangesAllowed",
      "capacityFormulaChangesAllowed", "missionSpecificServingTowerAllowed", "fixedServingTowerAllowed",
      "newStandalonePanelAllowed", "cameraAutomationAllowed"
    ].forEach(function (key) {
      if (policy[key] !== false) addError(errors, counts, "policyErrors", key, policy[key]);
    });
    [
      "representativeCivilianConnectivityRequired", "dynamicCivilianLoadRequired",
      "weakCivilianLinesRequired", "rightDashboardOnly", "freeExplorationRemainsDefault",
      "visualizationIsSimplifiedAndSymbolic", "fileProtocolRequired"
    ].forEach(function (key) {
      if (policy[key] !== true) addError(errors, counts, "policyErrors", key, policy[key]);
    });

    var representative = plan.representativeConnectivity || {};
    var endpoints = representative.endpoints || [];
    if (representative.associationModelSource !== "MISSION_BOS_NETWORK_ASSOCIATION_PLAN.selectionModel" ||
        representative.radioModelProvider !== "MissionBosNetworkRadioModel" ||
        Number(representative.evaluationIntervalSeconds) !== Number((associationPlan.selectionModel || {}).evaluationIntervalSeconds) ||
        representative.baseMissionProfilesRemainUnchanged !== true) {
      addError(errors, counts, "radioModelErrors", "representativeConnectivity", representative);
    }

    var trafficIds = (trafficPlan.vehicles || []).map(function (vehicle) { return vehicle.id; });
    var pedestrianIds = (pedestrianPlan.pedestrians || []).map(function (pedestrian) { return pedestrian.id; });
    var existingAssociationIds = (associationPlan.mobileEndpoints || []).map(function (endpoint) { return endpoint.id; });
    var endpointIds = [];
    var demandTotal = 0;
    endpoints.forEach(function (endpoint) {
      endpointIds.push(endpoint.id);
      demandTotal += finite(endpoint.demandUnits, 0);
      if (!endpoint.id || !endpoint.referenceId || endpoint.channel !== "CIVILIAN" || endpoint.active !== true ||
          ["civilian-vehicle", "civilian-pedestrian"].indexOf(endpoint.kind) < 0 ||
          !isFinite(Number(endpoint.demandUnits)) || Number(endpoint.demandUnits) <= 0) {
        addError(errors, counts, "endpointDefinitionErrors", endpoint.id, endpoint);
      }
      if (endpoint.kind === "civilian-vehicle" && trafficIds.indexOf(endpoint.referenceId) < 0) {
        addError(errors, counts, "endpointReferenceErrors", endpoint.id, "Unknown traffic vehicle: " + endpoint.referenceId);
      }
      if (endpoint.kind === "civilian-pedestrian" && pedestrianIds.indexOf(endpoint.referenceId) < 0) {
        addError(errors, counts, "endpointReferenceErrors", endpoint.id, "Unknown pedestrian: " + endpoint.referenceId);
      }
      if (existingAssociationIds.indexOf(endpoint.id) >= 0) {
        addError(errors, counts, "duplicateIdErrors", endpoint.id, "Representative endpoint duplicates an existing association endpoint.");
      }
      if (Object.prototype.hasOwnProperty.call(endpoint, "servingTowerId") ||
          Object.prototype.hasOwnProperty.call(endpoint, "towerId") ||
          Object.prototype.hasOwnProperty.call(endpoint, "fixedTowerId")) {
        addError(errors, counts, "fixedServingTowerErrors", endpoint.id, endpoint);
      }
    });
    uniqueIds(endpoints, "id").forEach(function (id) {
      addError(errors, counts, "duplicateIdErrors", id, "Duplicate representative endpoint ID.");
    });
    if (demandTotal !== Number(representative.totalDynamicDemandUnits)) {
      addError(errors, counts, "dynamicLoadPolicyErrors", "totalDynamicDemandUnits", { expected: representative.totalDynamicDemandUnits, actual: demandTotal });
    }

    var loadExtension = plan.cellLoadRuntimeExtension || {};
    if (loadExtension.requiredMethod !== "setDynamicCivilianContributions" ||
        loadExtension.methodSignature !== "setDynamicCivilianContributions(sourceId, contributionsByTowerId)" ||
        !Array.isArray(loadExtension.requiredSnapshotFields) ||
        loadExtension.requiredSnapshotFields.indexOf("baseLoad") < 0 ||
        loadExtension.requiredSnapshotFields.indexOf("dynamicCivilianLoad") < 0 ||
        loadExtension.requiredSnapshotFields.indexOf("currentLoad") < 0 ||
        Number(((loadExtension.contributionRules || {}).maximumTotalUnits)) !== demandTotal ||
        (loadExtension.contributionRules || {}).knownTowerIdsOnly !== true ||
        (loadExtension.contributionRules || {}).nonNegativeOnly !== true) {
      addError(errors, counts, "runtimeContractErrors", "cellLoadRuntimeExtension", loadExtension);
    }

    var visualization = plan.visualization || {};
    if (visualization.defaultVisible !== true ||
        Number(visualization.maximumSimultaneousLines) !== endpoints.length ||
        Number(visualization.defaultOpacity) <= 0 || Number(visualization.defaultOpacity) > 0.18 ||
        Number(visualization.selectedOpacity) < 0.4 || Number(visualization.selectedOpacity) > 0.7 ||
        Number(visualization.unselectedOpacityWhileSelectionActive) < 0 ||
        Number(visualization.unselectedOpacityWhileSelectionActive) >= Number(visualization.defaultOpacity) ||
        visualization.particlesAllowed !== false || visualization.candidateLinesAllowed !== false ||
        visualization.labelsInWorldAllowed !== false || visualization.linePulseAllowed !== false) {
      addError(errors, counts, "visualizationPolicyErrors", "visualization", visualization);
    }

    var inspection = plan.inspection || {};
    if (inspection.activationKeyCode !== "KeyF" || inspection.clearKeyCode !== "Escape" ||
        inspection.activationKeyCode === "KeyE" || inspection.raycastOrigin !== "camera-center-crosshair" ||
        inspection.coordinateSelectionApi !== "selectAtClientPoint" ||
        !Array.isArray(inspection.allowedInputMethods) ||
        inspection.allowedInputMethods.indexOf("keyboard-center-crosshair") < 0 ||
        inspection.allowedInputMethods.indexOf("touch-client-point") < 0 ||
        inspection.cameraMovementAllowed !== false || inspection.autoSelectionAllowed !== false ||
        Number(inspection.maximumDistance) <= 0 || Number(inspection.maximumDistance) > 100) {
      addError(errors, counts, "inspectionPolicyErrors", "inspection", inspection);
    }

    var targets = inspection.selectableTargets || [];
    uniqueIds(targets, "id").forEach(function (id) {
      addError(errors, counts, "duplicateIdErrors", id, "Duplicate inspection target ID.");
    });
    var towerIds = (layout.mobileTowers || []).map(function (tower) { return tower.id; });
    var buildingIds = (layout.buildings || []).map(function (building) { return building.id; });
    var responseIds = ["RESPONSE_FIRE_01", "RESPONSE_POLICE_01"];
    targets.forEach(function (target) {
      if (target.kind === "tower" && towerIds.indexOf(target.referenceId) < 0) {
        addError(errors, counts, "inspectionReferenceErrors", target.id, "Unknown tower target.");
      } else if (target.kind === "incident-building" && buildingIds.indexOf(target.referenceId) < 0) {
        addError(errors, counts, "inspectionReferenceErrors", target.id, "Unknown building target.");
      } else if (target.kind === "response-vehicle" && responseIds.indexOf(target.referenceId) < 0) {
        addError(errors, counts, "inspectionReferenceErrors", target.id, "Unknown response vehicle target.");
      } else if ((target.kind === "civilian-vehicle" || target.kind === "civilian-pedestrian") &&
                 endpointIds.indexOf(target.endpointId) < 0) {
        addError(errors, counts, "inspectionReferenceErrors", target.id, "Unknown representative endpoint target.");
      }
    });

    var dashboard = inspection.dashboard || {};
    if (dashboard.placement !== "inside-existing-right-dashboard" ||
        dashboard.parentSectionId !== "communication-comparison" ||
        dashboard.containerId !== "network-inspection-panel" ||
        dashboard.hiddenWithoutSelection !== true || dashboard.widthChangeAllowed !== false ||
        dashboard.standalonePanelAllowed !== false || !dashboard.compactControlHint ||
        !dashboard.fieldIds || Object.keys(dashboard.fieldIds).length !== 7) {
      addError(errors, counts, "dashboardPolicyErrors", "dashboard", dashboard);
    }

    (representative.referenceScenarios || []).forEach(function (scenario) {
      var simulation = simulateScenario(layout, trafficPlan, pedestrianPlan, associationPlan, cellLoadPlan, plan, scenario);
      simulations.push(simulation);
      var expectedInitial = scenario.expectedInitialContributions || {};
      (layout.mobileTowers || []).forEach(function (tower) {
        var towerId = tower.id;
        if (finite(simulation.initialContributions[towerId], 0) !== finite(expectedInitial[towerId], 0)) {
          addError(errors, counts, "referenceSimulationErrors", scenario.id + ":initial:" + towerId, {
            expected: finite(expectedInitial[towerId], 0),
            actual: finite(simulation.initialContributions[towerId], 0)
          });
        }
        var range = (scenario.expectedEffectiveLoadRanges || {})[towerId];
        if (range && (simulation.minLoads[towerId] < Number(range.min) - EPSILON ||
                      simulation.maxLoads[towerId] > Number(range.max) + EPSILON)) {
          addError(errors, counts, "referenceSimulationErrors", scenario.id + ":range:" + towerId, {
            expected: range,
            actual: { min: simulation.minLoads[towerId], max: simulation.maxLoads[towerId] }
          });
        }
      });

      Object.keys(representative.endpointReferenceExpectations || {}).forEach(function (endpointId) {
        var expected = representative.endpointReferenceExpectations[endpointId];
        var actual = simulation.endpointResults[endpointId];
        if (!actual || actual.initialTowerId !== expected.expectedInitialTowerId ||
            actual.distinctTowers < Number(expected.minimumDistinctTowers) ||
            actual.handovers < Number(expected.minimumHandoversPer240Seconds) ||
            actual.handovers > Number(expected.maximumHandoversPer240Seconds)) {
          addError(errors, counts, "referenceSimulationErrors", scenario.id + ":" + endpointId, {
            expected: expected,
            actual: actual
          });
        }
        if (actual) {
          for (var i = 1; i < actual.eventList.length; i += 1) {
            var previous = actual.eventList[i - 1];
            var current = actual.eventList[i];
            if (current.toTowerId === previous.fromTowerId &&
                Number(current.time) - Number(previous.time) + EPSILON < Number((associationPlan.selectionModel || {}).minimumDwellSeconds)) {
              addError(errors, counts, "referenceSimulationErrors", scenario.id + ":ping-pong:" + endpointId, {
                previous: previous,
                current: current
              });
            }
          }
        }
      });
    });

    var expected = plan.expectedCounts || {};
    var kindCounts = {
      vehicles: endpoints.filter(function (endpoint) { return endpoint.kind === "civilian-vehicle"; }).length,
      pedestrians: endpoints.filter(function (endpoint) { return endpoint.kind === "civilian-pedestrian"; }).length,
      towers: targets.filter(function (target) { return target.kind === "tower"; }).length,
      response: targets.filter(function (target) { return target.kind === "response-vehicle"; }).length,
      civilianVehicles: targets.filter(function (target) { return target.kind === "civilian-vehicle"; }).length,
      civilianPedestrians: targets.filter(function (target) { return target.kind === "civilian-pedestrian"; }).length,
      buildings: targets.filter(function (target) { return target.kind === "incident-building"; }).length
    };
    if (endpoints.length !== Number(expected.representativeEndpoints) ||
        kindCounts.vehicles !== Number(expected.representativeVehicles) ||
        kindCounts.pedestrians !== Number(expected.representativePedestrians) ||
        demandTotal !== Number(expected.totalDynamicDemandUnits) ||
        Number(visualization.maximumSimultaneousLines) !== Number(expected.defaultWeakLines) ||
        targets.length !== Number(expected.inspectionTargets) ||
        kindCounts.towers !== Number(expected.inspectionTowers) ||
        kindCounts.response !== Number(expected.inspectionResponseVehicles) ||
        kindCounts.civilianVehicles !== Number(expected.inspectionCivilianVehicles) ||
        kindCounts.civilianPedestrians !== Number(expected.inspectionCivilianPedestrians) ||
        kindCounts.buildings !== Number(expected.inspectionIncidentBuildings) ||
        Number(expected.newStandalonePanels) !== 0 ||
        Number(expected.missionSpecificServingTowerDefinitions) !== 0) {
      addError(errors, counts, "expectedCountErrors", "expectedCounts", { expected: expected, actual: kindCounts, demandTotal: demandTotal, targets: targets.length });
    }

    return createResult(errors, counts, simulations, plan);
  }

  function createResult(errors, counts, simulations, plan) {
    var status = errors.length === 0 ? "PASSED" : "FAILED";
    var result = {
      title: "MISSION BOS NETWORK EXPLORATION VALIDATION",
      status: status,
      counts: counts,
      errors: errors,
      simulations: simulations,
      metadata: {
        representativeEndpoints: (((plan || {}).representativeConnectivity || {}).endpoints || []).length,
        inspectionTargets: (((plan || {}).inspection || {}).selectableTargets || []).length
      },
      lines: []
    };
    result.lines = [
      result.title,
      "Source dependency errors: " + counts.sourceDependencyErrors,
      "Source phase errors: " + counts.sourcePhaseErrors,
      "Policy errors: " + counts.policyErrors,
      "Endpoint definition errors: " + counts.endpointDefinitionErrors,
      "Endpoint reference errors: " + counts.endpointReferenceErrors,
      "Duplicate ID errors: " + counts.duplicateIdErrors,
      "Radio model errors: " + counts.radioModelErrors,
      "Dynamic load policy errors: " + counts.dynamicLoadPolicyErrors,
      "Visualization policy errors: " + counts.visualizationPolicyErrors,
      "Inspection policy errors: " + counts.inspectionPolicyErrors,
      "Inspection reference errors: " + counts.inspectionReferenceErrors,
      "Dashboard policy errors: " + counts.dashboardPolicyErrors,
      "Runtime contract errors: " + counts.runtimeContractErrors,
      "Reference simulation errors: " + counts.referenceSimulationErrors,
      "Fixed serving tower errors: " + counts.fixedServingTowerErrors,
      "Expected count errors: " + counts.expectedCountErrors,
      "STATUS: " + status
    ];
    return result;
  }

  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    result.lines.slice(1).forEach(function (line) { console[method](line); });
    if (result.errors.length) {
      console.group("Affected network exploration definitions");
      result.errors.forEach(function (error) { console.error(error.category + ": " + error.id, error.detail); });
      console.groupEnd();
    }
    console.groupEnd();
  }

  window.MissionBosNetworkExplorationValidator = {
    validate: validate,
    logResult: logResult,
    simulateScenario: simulateScenario
  };
})();
