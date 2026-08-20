/* Mission BOS - Build 013M.6 preparation
   Frozen customer-facing right dashboard plan.
   This file is a specification contract, not the dashboard implementation.
*/
(function (root) {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  root.MISSION_BOS_CUSTOMER_DASHBOARD_PLAN = deepFreeze({
    schemaVersion: "1.0.0",
    build: "013M.6",
    title: "Customer Dashboard Polish",
    sourceBuildRequired: "Mission-BOS-Build-013M.5",
    sourceArchiveSha256Required: "bec6e55862d0269e79acae52ddd5fae2a5df433960aa585709597de645042609",
    product: "Mission BOS - Connected Response",

    objective: {
      customerAppointmentReady: true,
      primaryStory: [
        "Welche Mission ist ausgewählt oder aktiv?",
        "Wie ist die aktuelle Netzlage?",
        "Welche Funkzelle ist am stärksten belastet?",
        "Ist die automatische BOS-Priorisierung aktiv?",
        "Welche Wirkung hat die Priorisierung für die Einsatzkommunikation?"
      ],
      visualCharacter: "clean-dark-telekom-touch",
      newFrameworkAllowed: false,
      externalFontAllowed: false,
      externalAssetRequired: true
    },

    protectedRuntime: {
      missions: ["MISSION_001", "MISSION_002", "MISSION_003", "MISSION_004"],
      missionStateMachinesMustRemainUnchanged: true,
      responseRoutesMustRemainUnchanged: true,
      mission004ReturnManeuverMustRemainUnchanged: true,
      trafficLogicMustRemainUnchanged: true,
      networkRadioModelMustRemainUnchanged: true,
      networkAssociationMustRemainUnchanged: true,
      cellLoadModelMustRemainUnchanged: true,
      cellCapacityModelMustRemainUnchanged: true,
      automaticBosPriorityMustRemainUnchanged: true,
      towerLoadIndicatorsMustRemainUnchangedInScene: true,
      noAutomaticMissionStart: true,
      noAutomaticCameraMovement: true
    },

    visualTokens: {
      baseBackground: "existing dark navy",
      brandAccent: "#E20074",
      brandAccentRole: ["header accent", "selected mission", "primary action", "small focus details"],
      bosConnectivityAccent: "existing cyan/blue",
      bosConnectivityRole: ["BOS priority", "connectivity", "stable priority story"],
      stateColors: {
        stable: "green",
        highLoad: "amber",
        overloaded: "red",
        bosPriority: "blue"
      },
      panelWidthDesktopPx: { min: 410, preferred: 420, max: 440 },
      panelWidthCompactPx: { min: 380, max: 400 },
      cardRadiusPx: { min: 10, max: 14 },
      primarySpacingPx: 12,
      avoidFullPanelStateTint: true,
      avoidExcessGlow: true,
      avoidGradientButtonStack: true
    },

    sectionOrder: [
      "HEADER",
      "LIVE_SUMMARY",
      "MISSION_SELECTION",
      "INCIDENT_OVERVIEW",
      "NETWORK_AND_PRIORITY",
      "TECHNICAL_DETAILS_COLLAPSED",
      "PRESENTER_CONTROLS_COLLAPSED",
      "PRIMARY_ACTION"
    ],

    header: {
      eyebrow: "T MISSION",
      title: "Connected Response",
      logoAsset: "assets/telekom-logo-current.png",
      logoAlt: "Telekom",
      liveBadge: "LIVE DEMO",
      showBuildVersionProminently: false,
      buildReferenceLocation: "TECHNICAL_DETAILS_COLLAPSED",
      browserTitle: "T Mission | Connected Response",
      staleVersionTextForbidden: [
        "Build 013M.1",
        "Activation Impact & Mission 004 Foundation"
      ]
    },

    liveSummary: {
      requiredMetrics: [
        { id: "mission-phase-value", label: "Einsatzphase" },
        { id: "network-status", label: "Netzlage" },
        { id: "customer-max-cell-load", label: "Höchste Zelllast" }
      ],
      hiddenFromPrimarySummary: ["active-mode", "load-value"],
      maxCellLoadSource: "validated cell-load snapshot rows; dynamic maximum; never a fixed tower",
      maxCellLoadFormat: "<percent>% · <towerId>"
    },

    missionSelection: {
      heading: "Missionen",
      keepExistingRegistry: true,
      keepMissionIdsAndSelectionLogic: true,
      selectionAccent: "telekom-magenta",
      selectedRowMustRemainImmediatelyRecognizable: true,
      keepAllFourMissionsVisible: true,
      compactRows: true
    },

    incidentOverview: {
      heading: "Einsatzlage",
      visibleFields: ["mission-title", "mission-stage", "mission-status", "mission-description", "mission-progress-fill"],
      moveToTechnicalDetails: ["fire-unit-status", "city-status"],
      missionProgressMustHaveVisibleLabel: true,
      missionProgressLabel: "Einsatzfortschritt"
    },

    networkAndPriority: {
      heading: "Netz & Priorisierung",
      cellLoadSectionMustRemainPrimary: true,
      cellLoadRowsMustRemainDynamic: true,
      cellLoadRowEnhancement: {
        progressTrackRequired: true,
        percentPillRequired: true,
        severityColorRequired: true,
        bosBadgeWhenPriorityActive: true
      },
      customerStoryRequired: true,
      customerStoryIds: ["customer-network-story", "customer-network-story-title", "customer-network-story-text"],
      customerStoryStates: {
        normal: {
          title: "Netz im Normalbetrieb",
          text: "Die automatische BOS-Priorisierung steht für kritische Zelllast bereit."
        },
        highLoad: {
          title: "Zivile Nachfrage steigt",
          text: "Die lokale Funkzelle nähert sich ihrer Kapazitaetsgrenze."
        },
        overloaded: {
          title: "Funkzelle ausgelastet",
          text: "Die automatische BOS-Priorisierung wird durch die bestehende Netzlogik ausgelöst."
        },
        bosActive: {
          title: "BOS-Kommunikation priorisiert",
          text: "Einsatzkräfte bleiben auch bei hoher ziviler Zelllast priorisiert verbunden."
        }
      },
      mainViewTechnicalItemsToCollapse: [
        "communication-path",
        "communication-status",
        "mobile-status",
        "priority-status",
        "priority-value",
        "fire-serving-cell",
        "police-serving-cell",
        "ambulance-serving-cell",
        "last-handover",
        "capacity-allocation-summary",
        "communication-symbolic-hint",
        "bos-explanation"
      ],
      noInventedKpis: true,
      noClaimedLatencyOrBandwidthValues: true,
      symbolicSimulationDisclaimerMustRemainAvailable: true
    },

    technicalDetails: {
      id: "technical-details-panel",
      heading: "Technische Details",
      element: "details",
      openByDefault: false,
      contains: [
        "communication path",
        "serving cells and handover",
        "capacity allocation details",
        "infrastructure counts",
        "symbolic simulation disclaimer",
        "build reference"
      ]
    },

    cameraControls: {
      id: "camera-control-panel",
      heading: "Kamerasteuerung",
      element: "details",
      openByDefault: false,
      placement: "between-technical-details-and-presenter",
      minimumTargetCssPx: 44,
      controls: [
        "camera-control-forward",
        "camera-control-backward",
        "camera-control-left",
        "camera-control-right",
        "camera-control-rotate-left",
        "camera-control-rotate-right",
        "camera-control-zoom-out",
        "camera-control-zoom-in",
        "camera-control-home"
      ],
      noRotationControls: false,
      rotationControls: {
        enabled: true,
        rotateStepDegrees: 15,
        rotateLeftId: "camera-control-rotate-left",
        rotateRightId: "camera-control-rotate-right",
        directTouchRotationEnabled: false
      },
      noAutomaticCameraMovement: true
    },

    presenterControls: {
      existingId: "presenter-panel",
      heading: "Präsentationssteuerung",
      openByDefault: false,
      moveAfterTechnicalDetails: true,
      moveOverloadButtonHere: true,
      keepBosButtonAsStatusOnlyControlHere: true,
      noCustomerPrimaryActionRole: true
    },

    primaryAction: {
      containerId: "customer-primary-actions",
      keepMissionButtonId: "mission-button",
      missionButtonIsOnlyPrimaryFullWidthAction: true,
      useBrandAccent: true,
      stickyWithinPanel: true,
      keepExistingMissionButtonStateLogic: true
    },

    existingElementIdsThatMustSurvive: [
      "info-panel", "mission-registry-panel", "mission-registry-list", "mission-registry-status",
      "mission-button", "overload-button", "bos-button", "mission-phase-value", "mission-stage",
      "network-status", "load-value", "load-fill", "mission-progress-fill", "mission-title",
      "mission-status", "mission-description", "fire-unit-status", "city-status", "communication-path",
      "communication-status", "mobile-status", "priority-status", "priority-value", "bos-explanation",
      "dispatch-link-status", "civilian-channel-status", "civilian-channel-fill", "bos-channel-status",
      "bos-channel-fill", "fire-serving-cell-row", "police-serving-cell-row", "ambulance-serving-cell-row",
      "fire-serving-cell", "police-serving-cell", "ambulance-serving-cell", "last-handover",
      "cell-load-section", "cell-load-rows", "critical-cell-value", "capacity-allocation-summary",
      "capacity-allocation-state", "capacity-allocation-rows", "capacity-allocation-note",
      "capacity-allocation-hint", "dispatch-status", "station-status", "vehicle-count", "pedestrian-count",
      "presenter-panel"
    ],

    accessibilityAndResponsive: {
      keyboardReachableDetails: true,
      visibleFocusStateRequired: true,
      colorMustNotBeOnlyStatusSignal: true,
      ariaLabelsRequiredForDynamicStatusAreas: true,
      minimumBodyTextPx: 11,
      preferredBodyTextPx: 12,
      primaryCustomerViewFitsAt1080pWithoutMandatoryScroll: true,
      verticalScrollStillAllowed: true,
      noHorizontalScroll: true,
      minimumSupportedViewport: { width: 1180, height: 720 }
    },

    acceptance: {
      customerCanUnderstandPrimaryStoryWithinSeconds: 5,
      primaryVisibleSectionsMaximum: 5,
      onlyOnePrimaryActionVisible: true,
      technicalDetailsCollapsedByDefault: true,
      presenterControlsCollapsedByDefault: true,
      sourceBuildFunctionsMustRegressionPass: true,
      mission004FiveRunBrowserAcceptanceMustRemainPassed: true
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
