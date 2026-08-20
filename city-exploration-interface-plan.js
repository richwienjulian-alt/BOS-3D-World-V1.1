/* Mission BOS - Build 009N.4
   Compact Dashboard & Exploration Integration plan.
   Copy unchanged into the build. No modules. No fetch.
*/
window.MISSION_BOS_EXPLORATION_INTERFACE_PLAN = {
  schemaVersion: "1.0",
  project: "Mission BOS - Connected Response",
  buildBase: "009N.3",
  phase: "009N.4 Compact Dashboard & Exploration Integration",
  sourcePhase: "009N.3 Communication & Handover Visualization",
  sourceFiles: {
    "index.html": "0d26f5fb5a11a8aa5486c06cfc006cdb72a1075c515cee833d726034f4fd07ea",
    "style.css": "6992da0f48370649b062fa85f4d7424c23a3fafe29ba2001f83f1f7226b831ed",
    "app.js": "450bd80ba91e1e40332fea29916d68d4e8c421438e7e928365b08bff671d5ec2",
    "city-presenter-plan.js": "7b6020798f0dfaf68f93e5b78af3ad4e68e7f211dfda38736e97d35505b24984",
    "presenter-validator.js": "c857c4166425f441307e664c67f18880cf07d0557c00228590c2347d12a61f06",
    "city-presenter-controller.js": "2f30d76d1de4afb700dc167af55d23b9ff154e40db138b1af946b3de5383aeb1",
    "city-cell-load-plan.js": "2fe4906a8cc720e0b7c67cd3f3c7a6771973882ace98f67a4dafda3ea86edb3d",
    "city-network-association-plan.js": "4e3da70af3cb4c0a16535ab636904314970761b5d3f06e377a973f6150eb2017",
    "city-telekom-communication-plan.js": "4af720a8b8d2d8a936ea349e86ad62bf45a0603fc9aeed3a3f4fa84e33f21fb6",
    "city-handover-visualization-plan.js": "097bc6575e748907c9b10bae02a61a0ffa63ebed01d5e307ddac1e0a4ac9ad6e"
  },
  policy: {
    fileProtocolRequired: true,
    existingRightDashboardMustRemain: true,
    infoPanelIdMustRemain: true,
    infoPanelDesktopWidthMustRemainPx: 390,
    presenterControlsMustMoveIntoRightDashboard: true,
    floatingPresenterOverlayAllowed: false,
    newFloatingPanelAllowed: false,
    secondDashboardAllowed: false,
    defaultFreeExplorationRequired: true,
    demoControlsDefaultExpanded: false,
    existingPresenterElementIdsMustRemain: true,
    existingMissionButtonsMustRemain: true,
    existingNetworkRowsMustRemain: true,
    automaticCameraTakeoverAllowed: false,
    automaticMissionActionAllowed: false,
    automaticBOSActivationAllowed: false,
    cityGeometryChangesAllowed: false,
    staticPropChangesAllowed: false,
    trafficChangesAllowed: false,
    pedestrianChangesAllowed: false,
    responseVehicleChangesAllowed: false,
    missionLogicChangesAllowed: false,
    networkAssociationChangesAllowed: false,
    cellLoadChangesAllowed: false,
    communicationLogicChangesAllowed: false,
    handoverLogicChangesAllowed: false,
    presenterBookmarksChangesAllowed: false,
    presenterStateHintsChangesAllowed: false,
    presenterActionPolicyChangesAllowed: false
  },
  dashboard: {
    appId: "app",
    sceneContainerId: "scene-container",
    infoPanelId: "info-panel",
    desktopWidthPx: 390,
    demoControlSectionId: "presenter-panel",
    demoControlElementType: "details",
    demoControlSummaryId: "exploration-control-summary",
    demoControlSummaryStateId: "exploration-control-summary-state",
    demoControlSummaryLabel: "Demo & Kamera",
    demoControlSummaryOptionalLabel: "optional",
    defaultOpen: false,
    placement: "inside-info-panel-after-load-section",
    actionCardMustRemainInsideInfoPanel: true,
    horizontalOverflowAllowed: false,
    sceneOverlayPanelCount: 0
  },
  presenterTarget: {
    title: "Demo & Kamera",
    modeLabel: "Demo-Steuerung",
    freeModeLabel: "Freie Erkundung",
    defaultGuidedMode: false,
    preserveCameraBookmarkIds: [
      "CAM_CITY_OVERVIEW",
      "CAM_INCIDENT_W14",
      "CAM_COMMUNICATION_MAST_B"
    ],
    preserveActionableStates: ["READY", "OVERLOADED", "COMPLETED"],
    preserveElementIds: [
      "presenter-panel",
      "presenter-mode-button",
      "presenter-hint-title",
      "presenter-hint-message",
      "presenter-camera-buttons",
      "presenter-next-button",
      "presenter-reset-button",
      "presenter-status"
    ]
  },
  compactness: {
    hidePermanentManualNote: true,
    keepStateHintInsideExpandableSection: true,
    cameraButtonsInSingleThreeColumnRow: true,
    actionButtonsInTwoColumnRowWhereSpaceAllows: true,
    noDashboardWidthIncrease: true,
    noSceneCanvasReductionBeyondExistingRightPanel: true,
    noLargeHelpText: true,
    noNewStartScreen: true,
    noGuidedTour: true
  },
  runtime: {
    controllerGlobal: "MissionBosExplorationInterface",
    createMethod: "create",
    requiredMethods: [
      "update",
      "getManifest",
      "getSafetyStatus",
      "dispose"
    ],
    summaryStateValues: [
      "Freie Erkundung",
      "Demo-Steuerung",
      "Kamerafahrt aktiv",
      "Lesezeichen aktiv"
    ]
  },
  expectedCounts: {
    infoPanels: 1,
    sceneOverlayPanels: 0,
    presenterPanels: 1,
    presenterRequiredElements: 8,
    cameraBookmarks: 3,
    actionableStates: 3,
    newMissionButtons: 0,
    newNetworkPanels: 0,
    automaticCameraTransitions: 0,
    automaticMissionActions: 0
  }
};
