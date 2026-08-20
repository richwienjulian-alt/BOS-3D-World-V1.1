/* Mission BOS - Build 013M.3 production integration contract. */
(function () {
  "use strict";
  function deepFreeze(v) { if (!v || typeof v !== "object" || Object.isFrozen(v)) return v; Object.keys(v).forEach(function (k) { deepFreeze(v[k]); }); return Object.freeze(v); }
  window.MISSION_BOS_MISSION_004_INTEGRATION_CONTRACT = deepFreeze({
    build: "013M.3",
    sourceBuild: "Mission-BOS-Build-013M.2",
    requiredNewProductionFiles: ["city-mission-004-controller.js", "city-mission-004-response-controller.js", "city-mission-004-connectivity-renderer.js"],
    requiredModifiedProductionFiles: ["app.js", "index.html", "city-mission-004-scene-renderer.js", "city-ambulance-renderer.js", "city-network-association-controller.js", "city-civilian-connectivity-controller.js", "city-cell-load-controller.js"],
    protectedFiles: ["city-network-radio-model.js", "city-auto-bos-priority-controller.js", "city-unified-bos-connectivity-renderer.js", "city-bos-link-visual-factory.js", "city-bos-activation-impact-renderer.js", "city-tower-load-indicator-renderer.js", "city-mission-001-controller.js", "city-mission-002-controller.js", "city-mission-003-controller.js", "style.css"],
    runtimeOwnership: {
      missionControllerOwnsStateTransitions: true,
      responseControllerOwnsTrafficAndVehicleCommands: true,
      sceneRendererOwnsOnlySceneVisibilityAndAnimation: true,
      unifiedConnectivityOwnsAllThreeOperationalVehicleLinks: true,
      mission004ConnectivityOwnsOnlyEightBystanderLinks: true,
      associationRuntimeOwnsServingCellDecisions: true,
      priorityRuntimeOwnsPriorityActivation: true,
      appOwnsRuntimeUpdateOrder: true
    },
    ambulanceCompatibility: {
      existingMission002MethodsMustRemain: ["startClearingCorridor", "dispatchToArena", "transportToHospital", "returnToStation", "reset"],
      newGenericProfileMethodsRequired: ["setRouteProfile", "restoreDefaultRouteProfile", "dispatchToIncident"],
      noSecondAmbulanceRuntime: true,
      mission002DefaultProfileUnchanged: true
    },
    acceptance: {
      registeredRuntimes: 4,
      allFourReadyAfterFinalization: true,
      mission004CanRepeat: true,
      trafficYieldsReleasedAfterMission004: true,
      protectedTrafficCorridorClearedBeforeDispatch: true,
      allThreeBosLinksFollowVehiclesEveryFrame: true,
      mission004BystanderLinks: 8,
      fixedServingTowerDefinitions: 0,
      automaticMissionStarts: 0,
      automaticMissionFinishes: 0,
      automaticCameraMovements: 0
    }
  });
})();
