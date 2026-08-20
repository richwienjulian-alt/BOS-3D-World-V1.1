/* Mission BOS - Build 013M.1 consolidated preparation
   Frozen visual-only contract for a clear BOS priority activation moment.
   This plan changes no mission, radio, capacity, association or threshold logic.
*/
(function () {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  window.MISSION_BOS_BOS_ACTIVATION_IMPACT_PLAN = deepFreeze({
    schemaVersion: "1.0.0",
    project: "Mission BOS - Connected Response",
    build: "013M.1",
    sourceBuild: "Mission-BOS-Build-012M.4",
    title: "BOS Activation Impact Polish",
    policy: {
      visualOnly: true,
      missionLogicChangesAllowed: false,
      radioModelChangesAllowed: false,
      associationChangesAllowed: false,
      cellLoadChangesAllowed: false,
      capacityPolicyChangesAllowed: false,
      thresholdChangesAllowed: false,
      automaticCameraMovementAllowed: false,
      soundAllowed: false,
      fullScreenFlashAllowed: false,
      persistentBlinkingAllowed: false,
      newFloatingPanelAllowed: false,
      existingDashboardHostRequired: true,
      fixedServingTowerAllowed: false
    },
    triggerContract: {
      sourceRuntime: "MissionBosAutomaticBOSPriorityController",
      sourceMethod: "getAllCellStates",
      triggerEdge: "ACTIVE_FALSE_TO_TRUE",
      validTransitionReason: "STABLE_OVERLOAD_WITH_BOS",
      activationThresholdPercent: 90,
      releaseThresholdPercent: 85,
      retriggerWhileActiveAllowed: false,
      retriggerOnLoadBreathingAllowed: false,
      retriggerAfterConfirmedReleaseAllowed: true,
      oneEffectPerTowerTransition: true,
      simultaneousDifferentTowerTransitionsAllowed: true
    },
    towerImpact: {
      indicatorFlashSeconds: 0.18,
      indicatorBounceSeconds: 0.65,
      indicatorMaximumScale: 1.15,
      indicatorFlashColor: "#EAF7FF",
      indicatorOutlineColor: "#4DB3FF",
      worldRingSeconds: 0.95,
      worldRingStartRadius: 0.9,
      worldRingEndRadius: 5.8,
      worldRingColor: "#168BFF",
      worldRingStartOpacity: 0.72,
      worldRingEndOpacity: 0,
      beaconGlowSeconds: 0.55,
      beaconGlowColor: "#8FD3FF",
      depthTest: true,
      depthWrite: false
    },
    dashboardImpact: {
      hostSelector: ".communication-card",
      bannerId: "bos-activation-impact",
      bannerText: "BOS-SPUR AKTIVIERT",
      bannerLiveRegion: "polite",
      bannerVisibleSeconds: 1.4,
      bannerColor: "#0066CC",
      bannerAccentColor: "#4DB3FF",
      activeCellRowPulseClass: "bos-activation-pulse",
      activeCellRowPulseSeconds: 1.2,
      persistentBadgeRemainsOwnedByExistingDashboard: true
    },
    runtimeContract: {
      global: "MissionBosBOSActivationImpactRenderer",
      requiredMethods: [
        "update", "reset", "getManifest", "getSafetyStatus", "dispose"
      ],
      stateOwnership: "VISUAL_ONLY",
      mustNotCallMissionActions: true,
      mustNotCallPriorityActions: true,
      mustNotModifyCellLoad: true,
      mustNotModifyAssociations: true
    },
    expectedCounts: {
      towerCandidates: 5,
      dashboardBanners: 1,
      newMissionStates: 0,
      newNetworkEndpoints: 0,
      newUserActions: 0,
      automaticCameraMovements: 0,
      soundEffects: 0,
      fixedServingTowerDefinitions: 0
    }
  });
})();
