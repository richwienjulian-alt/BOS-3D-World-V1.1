/* Mission BOS - Build 013M.6 preparation
   Frozen runtime/DOM contract for the customer-facing dashboard polish.
*/
(function (root) {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  root.MISSION_BOS_CUSTOMER_DASHBOARD_CONTRACT = deepFreeze({
    schemaVersion: "1.0.0",
    build: "013M.6",
    sourceBuildRequired: "Mission-BOS-Build-013M.5",
    sourceArchiveSha256Required: "bec6e55862d0269e79acae52ddd5fae2a5df433960aa585709597de645042609",

    dom: {
      infoPanelId: "info-panel",
      requiredInfoPanelClass: "customer-dashboard",
      requiredNewIds: [
        "customer-summary-strip",
        "customer-max-cell-load",
        "customer-network-story",
        "customer-network-story-title",
        "customer-network-story-text",
        "technical-details-panel",
        "dashboard-build-reference",
        "customer-primary-actions"
      ],
      existingIdsMustRemainUnique: true,
      technicalDetailsMustBeDetailsElement: true,
      technicalDetailsOpenByDefault: false,
      presenterPanelOpenByDefault: false,
      presenterPanelMustFollowTechnicalDetails: true,
      primaryActionMustFollowPresenterPanel: true,
      overloadButtonMustBeInsidePresenterPanel: true,
      bosButtonMustBeInsidePresenterPanel: true,
      missionButtonMustBeInsideCustomerPrimaryActions: true
    },

    content: {
      requiredSectionHeadings: ["Missionen", "Einsatzlage", "Netz & Priorisierung"],
      requiredDetailsHeadings: ["Technische Details", "Präsentationssteuerung"],
      forbiddenPrimaryLabels: ["Betriebsmodus"],
      forbiddenVisibleVersionFragments: ["Build 013M.1", "Activation Impact & Mission 004 Foundation"],
      requiredBuildReference: "Build 013M.6",
      customerSummaryLabels: ["Einsatzphase", "Netzlage", "Höchste Zelllast"],
      customerStoryMustUseExistingRuntimeState: true,
      customerStoryMustNotUseHardCodedTower: true
    },

    style: {
      brandAccentHex: "#e20074",
      brandAccentRequiredOnSelectedMission: true,
      brandAccentRequiredOnMissionAction: true,
      bosBlueMustRemainDistinctFromBrandMagenta: true,
      panelDesktopWidthMinPx: 410,
      panelDesktopWidthMaxPx: 440,
      horizontalOverflowAllowed: false,
      primaryActionStickyRequired: true,
      towerLoadProgressTrackRequired: true,
      fullPanelRedOrBlueFloodForbidden: true
    },

    runtime: {
      maxCellLoadDerivedFromCellLoadSnapshot: true,
      maxCellLoadMustUpdateWithDashboard: true,
      missionButtonBehaviorMustRemainExisting: true,
      overloadButtonBehaviorMustRemainExisting: true,
      bosButtonBehaviorMustRemainStatusOnly: true,
      missionSelectionBehaviorMustRemainExisting: true,
      noNewNetworkAlgorithm: true,
      noMissionStateMachineChange: true,
      noNewAutomaticAction: true
    },

    regression: {
      missionsRequired: ["MISSION_001", "MISSION_002", "MISSION_003", "MISSION_004"],
      mission004ReturnContractMustRemainPassed: true,
      mission004TrafficSweptPathMustRemainPassed: true,
      mission004NetworkTimingMustRemainPassed: true,
      missionRegistryMustRemainPassed: true,
      cellLoadMustRemainPassed: true,
      cellCapacityMustRemainPassed: true,
      automaticBosPriorityMustRemainPassed: true
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
