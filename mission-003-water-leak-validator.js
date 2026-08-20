/* Mission BOS - Build 012M.1 preparation
   Structural validator for Mission 003 Water Main Leak.
*/
(function () {
  "use strict";

  function add(result, key, message) { result[key] += 1; result.errors.push(message); }
  function find(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) if (items[i] && items[i].id === id) return items[i];
    return null;
  }
  function finite(value) { return typeof value === "number" && isFinite(value); }
  function hasForbiddenTowerKey(value) {
    var count = 0;
    function walk(node) {
      if (!node || typeof node !== "object") return;
      Object.keys(node).forEach(function (key) {
        var k = String(key).toLowerCase();
        if (k === "servingtowerid" || k === "fixedtowerid" || k === "missiontowerid") count += 1;
        walk(node[key]);
      });
    }
    walk(value);
    return count;
  }
  function expectedStateIds() {
    return ["READY", "CALL_RECEIVED", "ALARMING", "CLEARING_CORRIDOR", "ENROUTE", "ON_SCENE",
      "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "WATER_ISOLATED",
      "REPAIRING", "COMPLETED", "RETURNING", "FAILED"];
  }

  function validate(plan, responsePlan, layout, networkAssociationPlan, networkRealismPlan, radioModel) {
    var result = {
      title: "MISSION BOS MISSION 003 WATER LEAK 012M.1 VALIDATION",
      dependencyErrors: 0,
      sourceBuildErrors: 0,
      policyErrors: 0,
      registryErrors: 0,
      stateErrors: 0,
      sequenceErrors: 0,
      networkErrors: 0,
      sceneErrors: 0,
      runtimeContractErrors: 0,
      expectedCountErrors: 0,
      referenceCellErrors: 0,
      fixedTowerErrors: 0,
      status: "PASSED",
      errors: []
    };

    if (!plan || !responsePlan || !layout || !networkAssociationPlan || !networkRealismPlan || !radioModel) {
      add(result, "dependencyErrors", "Mission 003 validation dependencies are incomplete.");
      result.status = "FAILED";
      return result;
    }
    if (plan.sourceBuild !== "Mission-BOS-Build-011N.4" || responsePlan.sourceBuild !== "Mission-BOS-Build-011N.4") {
      add(result, "sourceBuildErrors", "Mission 003 must be built only on Build 011N.4.");
    }

    var policy = plan.policy || {};
    if (policy.fileProtocolRequired !== true || policy.runtimeRandomizationAllowed !== false ||
        policy.cityGeometryChangesAllowed !== false || policy.existingMissionChangesAllowed !== false ||
        policy.fixedServingTowerAllowed !== false || policy.automaticCameraMovementAllowed !== false ||
        policy.automaticMissionStartAllowed !== false || policy.automaticMissionFinishAllowed !== false ||
        policy.manualBosActivationAllowed !== false || policy.onlyMobileCommunicationInThisBuild !== true ||
        policy.videoOrSensorCommunicationAllowed !== false || policy.ambulanceIncluded !== false ||
        policy.utilityVehicleIsBosEndpoint !== false || policy.utilityVehicleUsesBluePriorityLane !== false ||
        policy.existingRightDashboardMustRemain !== true || policy.newStandalonePanelAllowed !== false) {
      add(result, "policyErrors", "Mission 003 policy is invalid.");
    }

    var registry = plan.registryUpgrade || {};
    if (registry.id !== "MISSION_003" || registry.number !== "003" || registry.selectable !== true || registry.startable !== true ||
        registry.runtimeKey !== "MISSION_003" || registry.planGlobal !== "MISSION_BOS_MISSION_003_PLAN" ||
        registry.controllerGlobal !== "MissionBosMission003Controller") {
      add(result, "registryErrors", "Mission 003 registry upgrade is invalid.");
    }

    var ids = (plan.states || []).map(function (state) { return state.id; });
    var expectedIds = expectedStateIds();
    if ((plan.stateOrder || []).join("|") !== expectedIds.join("|") || ids.join("|") !== expectedIds.join("|")) {
      add(result, "stateErrors", "Mission 003 state order differs from the approved 15-state flow.");
    }
    (plan.states || []).forEach(function (state) {
      if (!state || !state.id || !finite(Number(state.progress)) || Number(state.progress) < 0 || Number(state.progress) > 100 ||
          !finite(Number(state.globalNetworkTarget)) || Number(state.globalNetworkTarget) < 0 || Number(state.globalNetworkTarget) > 100) {
        add(result, "stateErrors", "Invalid state values in " + (state && state.id) + ".");
      }
    });

    var sequence = plan.sequence || {};
    if (sequence.initialState !== "READY" || sequence.dispatchRequiresConfirmedTrafficYield !== true ||
        sequence.onSceneRequiresAllThreeVehicles !== true || sequence.automaticBosActivationState !== "OVERLOADED" ||
        sequence.finishAction !== "FINISH_AND_RETURN" || sequence.finishRequiresState !== "COMPLETED" ||
        sequence.waterMustBeOffBeforeReturn !== true || sequence.resetRequiresAllVehiclesAtBase !== true ||
        sequence.resetRequiresTrafficYieldReleased !== true) {
      add(result, "sequenceErrors", "Mission 003 sequence contract is invalid.");
    }

    var network = plan.network || {};
    if (Number(network.baseLoad) !== 38 || Number(network.saturationMinimumLoad) !== 98 || Number(network.saturationMaximumLoad) !== 100 ||
        Number(network.saturationCycleSeconds) !== 8 || Number(network.priorityActivationThreshold) !== 90 ||
        Number(network.priorityReleaseThreshold) !== 85 ||
        (network.activeBosEndpointIds || []).join("|") !== "NET_FIRE_01|NET_POLICE_01|NET_STADTWERKE_01" ||
        (network.organizationalBosEndpointIds || []).join("|") !== "NET_FIRE_01|NET_POLICE_01" ||
        (network.missionScopedPriorityEndpointIds || []).join("|") !== "NET_FIRE_01|NET_POLICE_01|NET_STADTWERKE_01" ||
        network.missionScopedUtilityPriorityEndpointId !== "NET_STADTWERKE_01" ||
        !network.utilityEndpoint || network.utilityEndpoint.id !== "NET_STADTWERKE_01" ||
        network.utilityEndpoint.channel !== "UTILITY" || network.utilityEndpoint.priorityEligible !== false ||
        network.utilityEndpoint.connectionVisibleAlways !== true ||
        (network.dynamicLoadSources || []).length !== 2 ||
        (network.missionCivilianEndpointIds || []).length !== 6 || network.sameCellCompetitionRequired !== true ||
        network.priorityMustFollowConfirmedServingCell !== true || network.priorityMayNotTriggerHandover !== true ||
        network.utilityConnectionMustRemainNonBos !== true) {
      add(result, "networkErrors", "Mission 003 network contract is invalid.");
    }

    var scene = plan.scene || {};
    var road = find(layout.roadSurfaces, scene.allowedSurfaceId);
    var square = find(layout.pavedAreas, scene.landmarkId);
    if (!road || !square || !scene.incidentPosition || Number(scene.incidentPosition.x) !== -7.26 || Number(scene.incidentPosition.z) !== 6.36 ||
        (scene.waterJetStates || []).indexOf("COMMS_STABLE") < 0 || scene.waterJetMustFadeDuringState !== "WATER_ISOLATED" ||
        Number(scene.waterJetFadeSeconds) !== 1.2 || (scene.bystanders || []).length !== 6 ||
        (scene.crew || []).length !== 4 || (scene.barriers || []).length !== 2 || (scene.cones || []).length !== 6 ||
        !scene.visibilitySchedule || (scene.visibilitySchedule.responseCrewVisibleStates || []).indexOf("ON_SCENE") < 0 ||
        (scene.visibilitySchedule.bystandersVisibleStates || []).indexOf("COMPLETED") < 0) {
      add(result, "sceneErrors", "Mission 003 scene contract is invalid.");
    }

    var runtime = plan.runtimeContract || {};
    ["start", "activateBOS", "finishAndReturn", "update", "reset", "getState", "getNetworkState",
      "getCellLoadProfileState", "getBosEndpointIds", "getPhaseLabel", "getStageLabel", "getStatusLabel",
      "getDescription", "getProgress", "isActive", "isCompleted", "canStart", "canActivateBOS", "canFinish",
      "getManifest", "getSafetyStatus", "dispose"].forEach(function (method) {
      if ((runtime.requiredControllerMethods || []).indexOf(method) < 0) add(result, "runtimeContractErrors", "Missing controller method: " + method);
    });
    if (runtime.controllerGlobal !== "MissionBosMission003Controller" || runtime.rendererGlobal !== "MissionBosMission003SceneRenderer") {
      add(result, "runtimeContractErrors", "Mission 003 runtime globals are invalid.");
    }

    var expected = plan.expectedCounts || {};
    if (Number(expected.states) !== 15 || Number(expected.alarmedOrganizations) !== 3 || Number(expected.responseVehicles) !== 3 ||
        Number(expected.bosEndpoints) !== 2 || Number(expected.utilityEndpoints) !== 1 || Number(expected.missionCivilianEndpoints) !== 6 || Number(expected.missionScopedPriorityEndpoints) !== 3 ||
        Number(expected.sceneCrew) !== 4 || Number(expected.bystanders) !== 6 || Number(expected.barriers) !== 2 ||
        Number(expected.cones) !== 6 || Number(expected.waterJets) !== 1 || Number(expected.puddles) !== 1 ||
        Number(expected.repairPatches) !== 1 || Number(expected.fixedServingTowerDefinitions) !== 0 ||
        Number(expected.automaticMissionStarts) !== 0 || Number(expected.automaticMissionFinishes) !== 0 ||
        Number(expected.manualBosActivations) !== 0 || Number(expected.newStandalonePanels) !== 0) {
      add(result, "expectedCountErrors", "Mission 003 expected counts are invalid.");
    }

    try {
      var towers = (networkAssociationPlan.towers || []).map(function (tower) {
        var layoutTower = find(layout.mobileTowers, tower.referenceId);
        return {
          id: tower.id,
          referenceId: tower.referenceId,
          available: tower.available,
          siteCalibrationOffset: tower.siteCalibrationOffset,
          coverageInfluences: tower.coverageInfluences,
          position: { x: layoutTower.worldRect.x, z: layoutTower.worldRect.z }
        };
      });
      var loads = Object.create(null);
      towers.forEach(function (tower) { loads[tower.id] = 50; });
      var ranked = radioModel.rankTowers(scene.incidentPosition, towers, loads, networkAssociationPlan.selectionModel);
      if (!ranked.length || ranked[0].tower.referenceId !== "MAST_B") {
        add(result, "referenceCellErrors", "Generic radio model does not select MAST_B at the incident reference point.");
      }
    } catch (error) {
      add(result, "referenceCellErrors", "Reference-cell validation failed: " + error.message);
    }

    if (hasForbiddenTowerKey(plan) !== 0 || hasForbiddenTowerKey(responsePlan) !== 0) {
      add(result, "fixedTowerErrors", "Fixed serving-tower definition detected.");
    }

    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }

  function logResult(result) {
    var method = result && result.status === "PASSED" ? "log" : "error";
    console.group((result && result.title) || "MISSION BOS MISSION 003 VALIDATION");
    ["dependencyErrors", "sourceBuildErrors", "policyErrors", "registryErrors", "stateErrors", "sequenceErrors",
      "networkErrors", "sceneErrors", "runtimeContractErrors", "expectedCountErrors", "referenceCellErrors",
      "fixedTowerErrors"].forEach(function (key) { console[method](key + ": " + Number((result && result[key]) || 0)); });
    console[method]("STATUS: " + ((result && result.status) || "FAILED"));
    if (result && result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosMission003WaterLeakValidator = { validate: validate, logResult: logResult };
})();
