/* Mission BOS - Build 011N.1
   Mobile Network Realism Overhaul presentation contract.
   No modules. No fetch. No runtime randomization.
*/
(function () {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  window.MISSION_BOS_PRESENTATION_POLISH_PLAN = deepFreeze({
    schemaVersion: "1.1.0",
    project: "Mission BOS – Connected Response",
    buildBase: "010P.7",
    phase: "011N.1 Mobile Network Realism Overhaul",
    sourceArchive: "Mission-BOS-Build-010P.7(5).zip",
    sourceFiles: {
      "app.js": "59c6896e24fa6134b68225ab15d7d347a65fe15397c716fa9af6e737c9aa4c1e",
      "index.html": "ca1281881c4f5c5844235c1b382eab1d8639e081ea70089b179ca4be9eddf6a0",
      "style.css": "031ec2e4fed8d8326b6bf6e6313674c18675de03ff43c903d86ec3f940241524",
      "city-telekom-communication-plan.js": "fb320700a0f9d794aa94908584cc1596dcc791b6db5bc94fb3728ed8c2ed8446",
      "city-telekom-communication-renderer.js": "1876e6c72d91f0d9f924d4cdbddf220ad0db603e49af55ea28c7c73f612b7d2d",
      "city-ambulance-connectivity-renderer.js": "7d4e44890327b0dfa60f97dbf3d6cd465f15ebfee6f62f58ad43b1f3f4b571d5",
      "city-arena-event-connectivity-renderer.js": "71160414352e8e0ae1dcb87e75a50573832a5eabde6b3c24f69d274aec71700a",
      "city-mission-001-plan.js": "c3b54c1d81e0ec34c5a95027a419e191a70bc1b0e5a11c872efc814de13a618a",
      "city-mission-002-plan.js": "53fb4ea72002871424b170b33425a63bd9fe58cfddaf26fd779fb244b9daa2c8",
      "city-network-association-plan.js": "dea2e31b8bbc8f820d65c8d2f4a181c9a6afc83bd50a47b98adf70257f286dc4",
      "city-network-radio-model.js": "d41607faa2c1d36419f070033f727376b2a8445bd9c93c35abc5148071142294",
      "city-layout-recovery.js": "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17"
    },
    policy: {
      fileProtocolRequired: true,
      runtimeRandomizationAllowed: false,
      cityGeometryChangesAllowed: false,
      staticPropChangesAllowed: false,
      trafficRouteChangesAllowed: false,
      pedestrianRouteChangesAllowed: false,
      responseVehicleRouteChangesAllowed: false,
      ambulanceRouteChangesAllowed: false,
      missionStateSequenceChangesAllowed: false,
      automaticMissionStartAllowed: false,
      automaticBOSActivationAllowed: true,
      automaticCameraMovementAllowed: false,
      fixedServingTowerAllowed: false,
      sharedRadioModelRequired: true,
      mission001RegressionRequired: true,
      mission002RegressionRequired: true,
      rightDashboardMustRemain: true,
      dashboardWidthPx: 390,
      newStandalonePanelAllowed: false,
      externalFontFilesAllowed: false,
      externalBrandAssetsAllowed: false,
      networkInspectionPresentationUiEnabled: false,
      temporaryFoundationControlsVisible: false,
      designClaim: "Telekom-inspired light presentation polish based on the existing project palette; no formal corporate-design certification is claimed."
    },
    preserved010P6Requirements: {
      mission001ReturningFireVisible: false,
      mission001ReturningSmokeVisible: false,
      ambulanceConnectivityVisible: true,
      arenaPhoneConnectivityVisible: true,
      hospitalServingTowerExpected: "MAST_C",
      noFixedHospitalTowerAssignment: true,
      temporaryTestCardsVisible: false,
      networkInspectionPresentationUiEnabled: false,
      registeredMissionRuntimes: 2
    },
    dashboardPolish: {
      placement: "existing-right-dashboard",
      widthPx: 390,
      headerEyebrow: "Mission BOS",
      headerTitle: "Connected Response",
      buildLabel: "Build 011N.1 · Mobile Network Realism Overhaul",
      theme: "light-neutral",
      panelBackground: "light-gray",
      cardBackground: "white",
      cssTokens: {
        "--telekom-magenta": "#e20074",
        "--telekom-magenta-dark": "#b0005a",
        "--dashboard-bg": "#f2f3f5",
        "--dashboard-card": "#ffffff",
        "--dashboard-card-strong": "#e9edf1",
        "--dashboard-text": "#1d2733",
        "--dashboard-muted": "#5f6b76",
        "--dashboard-border": "#d5dbe1",
        "--network-cyan": "#00a6d6",
        "--warning-amber": "#d98600",
        "--critical-red": "#d94242"
      },
      bosActiveFillColor: "#e20074",
      bosStableFillColor: "#e20074",
      missionSelectedColor: "#e20074",
      noHorizontalScrollbar: true,
      freeExplorationRemainsDefault: true,
      noGuidedTourAdded: true,
      noLongHelpTextAdded: true,
      requiredElementIds: [
        "info-panel",
        "mission-registry-panel",
        "mission-button",
        "overload-button",
        "bos-button",
        "fire-serving-cell",
        "police-serving-cell",
        "ambulance-serving-cell",
        "last-handover",
        "cell-load-rows"
      ]
    },
    bosVisualPersistence: {
      activeColor: "#e20074",
      priorityColor: "#e20074",
      stableColor: "#e20074",
      appliesTo: [
        "dashboard-bos-channel-fill",
        "dashboard-bos-load-fill",
        "bos-status-button"
      ],
      worldBOSColor: "#0066CC",
      worldBOSHighlightColor: "#4DB3FF",
      activeMissionStates: [
        "BOS_ACTIVE",
        "COMMS_STABLE",
        "TREATMENT",
        "COMPLETED",
        "TRANSPORTING",
        "AT_HOSPITAL",
        "RETURNING"
      ],
      resetRestoresStandbyPalette: true,
      civilianConnectionsRemainNonMagenta: true,
      networkCyanReservedForNonBosNeutralVisuals: true
    },
    arenaPhoneConnectivity: {
      endpointCount: 12,
      followsConfirmedServingTower: true,
      fixedServingTowerDefinitions: 0,
      towerAnchorMode: "BEACON_CENTER",
      towerBeaconYOffset: 0.35,
      towerAnchorFormula: "tower.height + 0.35",
      targetXZSource: "tower.worldRect center",
      sourcePositionSource: "eventRenderer.getPhonePosition(endpointId)",
      depthTest: false,
      requireVisibleCoreAndGlow: true,
      requireAllTargetsAtTowerBeacon: true,
      referenceImage: "references/arena_phone_links_too_low.png"
    },
    expectedRuntime: {
      registeredMissionRuntimes: 2,
      mission001InitialState: "READY",
      mission002InitialState: "READY",
      activeMissionAtStartup: null,
      networkInspectionRuntime: null,
      temporaryTestButtons: 0,
      fixedServingTowerDefinitions: 0,
      automaticMissionStarts: 0,
      automaticBOSActivations: 0,
      arenaPhoneConnectionTargets: 12,
      arenaPhoneTargetAnchorErrors: 0
    }
  });
})();
