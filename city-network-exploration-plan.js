/* Mission BOS - Build 009N.7
   Frozen plan for representative civilian connectivity and compact network inspection.
   No Three.js dependency. No modules. No fetch.
*/
(function () {
  "use strict";

  window.MISSION_BOS_NETWORK_EXPLORATION_PLAN = {
    schemaVersion: "1.0",
    project: "Mission BOS - Connected Response",
    buildBase: "009N.6 PASSED",
    phase: "009N.7 Interactive Network Inspection & Representative Civilian Connectivity",
    sourceRelease: "Mission-BOS-Build-009N.6",
    sourceFiles: {
      "city-layout-recovery.js": "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17",
      "city-traffic-plan.js": "617b4ffa560859e0a11e54b009e159f34b73b71f7201617f92a1611568b54a65",
      "city-pedestrian-plan.js": "ca979d6b379bb7d8c3fc3a0f522617f4029a296333680b10fb2c2301cb8a44b7",
      "city-network-association-plan.js": "dea2e31b8bbc8f820d65c8d2f4a181c9a6afc83bd50a47b98adf70257f286dc4",
      "city-network-radio-model.js": "d41607faa2c1d36419f070033f727376b2a8445bd9c93c35abc5148071142294",
      "city-cell-load-plan.js": "73d5b8b36673bad5d8f998b146710a44d17fccd9d3f938326df30325828d0524",
      "city-cell-capacity-plan.js": "9d4d85c9c15a1b9e9407d10d8174eca7ec8272e6da0e3abce1e74c76e95008e4",
      "city-exploration-interface-plan.js": "01174795ec829cbc17c48af38aa10f7dacdb8bfee618b8438449de3640276f82"
    },

    policy: {
      cityGeometryChangesAllowed: false,
      staticPropChangesAllowed: false,
      trafficRouteChangesAllowed: false,
      pedestrianRouteChangesAllowed: false,
      responseVehicleChangesAllowed: false,
      missionStateChangesAllowed: false,
      associationModelChangesAllowed: false,
      radioModelChangesAllowed: false,
      handoverParameterChangesAllowed: false,
      capacityFormulaChangesAllowed: false,
      missionSpecificServingTowerAllowed: false,
      fixedServingTowerAllowed: false,
      newStandalonePanelAllowed: false,
      cameraAutomationAllowed: false,
      representativeCivilianConnectivityRequired: true,
      dynamicCivilianLoadRequired: true,
      weakCivilianLinesRequired: true,
      rightDashboardOnly: true,
      freeExplorationRemainsDefault: true,
      visualizationIsSimplifiedAndSymbolic: true,
      fileProtocolRequired: true
    },

    representativeConnectivity: {
      associationModelSource: "MISSION_BOS_NETWORK_ASSOCIATION_PLAN.selectionModel",
      towerDefinitionSource: "MISSION_BOS_NETWORK_ASSOCIATION_PLAN.towers",
      radioModelProvider: "MissionBosNetworkRadioModel",
      evaluationIntervalSeconds: 0.25,
      maximumDeltaSeconds: 0.25,
      contributionSourceId: "REPRESENTATIVE_CIVILIAN_ENDPOINTS",
      dynamicLoadApplication: "effective-local-cell-load",
      effectiveLoadFormula: "clamp(baseLocalLoad + representativeDynamicLoad, 0, 100)",
      baseMissionProfilesRemainUnchanged: true,
      totalDynamicDemandUnits: 6,
      endpoints: [
        {
          id: "NET_CAR_RING_01",
          kind: "civilian-vehicle",
          referenceId: "CAR_RING_01",
          label: "Ziviles Fahrzeug Ring 01",
          channel: "CIVILIAN",
          demandUnits: 2,
          activityLabel: "Navigation",
          active: true
        },
        {
          id: "NET_CAR_DOWNTOWN_01",
          kind: "civilian-vehicle",
          referenceId: "CAR_DOWNTOWN_01",
          label: "Ziviles Fahrzeug Innenstadt 01",
          channel: "CIVILIAN",
          demandUnits: 2,
          activityLabel: "Navigation",
          active: true
        },
        {
          id: "NET_PED_RES_01",
          kind: "civilian-pedestrian",
          referenceId: "PED_RES_01",
          label: "Ziviles Endgerät Wohngebiet 01",
          channel: "CIVILIAN",
          demandUnits: 1,
          activityLabel: "Messaging",
          active: true
        },
        {
          id: "NET_PED_ARENA_01",
          kind: "civilian-pedestrian",
          referenceId: "PED_ARENA_01",
          label: "Ziviles Endgerät Arena 01",
          channel: "CIVILIAN",
          demandUnits: 1,
          activityLabel: "Messaging",
          active: true
        }
      ],
      referenceScenarios: [
        {
          id: "READY_240_SECONDS",
          missionState: "READY",
          durationSeconds: 240,
          sampleIntervalSeconds: 0.25,
          expectedInitialContributions: { MAST_A: 3, MAST_B: 2, MAST_C: 0, MAST_D: 0, MAST_E: 1 },
          expectedEffectiveLoadRanges: {
            MAST_A: { min: 35, max: 37 },
            MAST_B: { min: 44, max: 46 },
            MAST_C: { min: 28, max: 30 },
            MAST_D: { min: 36, max: 38 },
            MAST_E: { min: 31, max: 33 }
          }
        },
        {
          id: "OVERLOADED_240_SECONDS",
          missionState: "OVERLOADED",
          durationSeconds: 240,
          sampleIntervalSeconds: 0.25,
          expectedInitialContributions: { MAST_A: 3, MAST_B: 2, MAST_C: 0, MAST_D: 0, MAST_E: 1 },
          expectedEffectiveLoadRanges: {
            MAST_A: { min: 93, max: 95 },
            MAST_B: { min: 98, max: 100 },
            MAST_C: { min: 32, max: 34 },
            MAST_D: { min: 44, max: 46 },
            MAST_E: { min: 35, max: 37 }
          }
        }
      ],
      endpointReferenceExpectations: {
        NET_CAR_RING_01: {
          expectedInitialTowerId: "MAST_A",
          minimumDistinctTowers: 5,
          minimumHandoversPer240Seconds: 18,
          maximumHandoversPer240Seconds: 22,
          stationaryExpected: false
        },
        NET_CAR_DOWNTOWN_01: {
          expectedInitialTowerId: "MAST_B",
          minimumDistinctTowers: 1,
          minimumHandoversPer240Seconds: 0,
          maximumHandoversPer240Seconds: 0,
          stationaryExpected: false
        },
        NET_PED_RES_01: {
          expectedInitialTowerId: "MAST_A",
          minimumDistinctTowers: 1,
          minimumHandoversPer240Seconds: 0,
          maximumHandoversPer240Seconds: 0,
          stationaryExpected: false
        },
        NET_PED_ARENA_01: {
          expectedInitialTowerId: "MAST_E",
          minimumDistinctTowers: 1,
          minimumHandoversPer240Seconds: 0,
          maximumHandoversPer240Seconds: 0,
          stationaryExpected: false
        }
      }
    },

    visualization: {
      defaultVisible: true,
      maximumSimultaneousLines: 4,
      defaultOpacity: 0.09,
      selectedOpacity: 0.58,
      unselectedOpacityWhileSelectionActive: 0.045,
      lineColor: "#9db8c8",
      selectedLineColor: "#d8f4ff",
      lineHeightOffset: 1.35,
      towerEndpointHeightOffset: 10.8,
      particlesAllowed: false,
      candidateLinesAllowed: false,
      labelsInWorldAllowed: false,
      linePulseAllowed: false,
      meaning: "Sehr dezente symbolische Verbindung eines repräsentativen zivilen Endgeräts zur aktuell versorgenden Funkzelle."
    },

    cellLoadRuntimeExtension: {
      requiredMethod: "setDynamicCivilianContributions",
      methodSignature: "setDynamicCivilianContributions(sourceId, contributionsByTowerId)",
      requiredSnapshotFields: ["baseLoad", "dynamicCivilianLoad", "currentLoad"],
      existingPublicMethodsMustRemain: [
        "update", "getCell", "getCellLoad", "getAllCells", "getCriticalCell",
        "getPriorityCells", "getDashboardSnapshot", "reset", "getManifest",
        "getSafetyStatus", "dispose"
      ],
      contributionRules: {
        nonNegativeOnly: true,
        knownTowerIdsOnly: true,
        maximumTotalUnits: 6,
        clearOnDispose: true,
        resetMustNotMutateMissionProfiles: true
      }
    },

    inspection: {
      activationKeyCode: "KeyF",
      clearKeyCode: "Escape",
      reasonForKeyChoice: "KeyE remains reserved for camera yaw in the existing free-exploration controls.",
      raycastOrigin: "camera-center-crosshair",
      coordinateSelectionApi: "selectAtClientPoint",
      allowedInputMethods: ["keyboard-center-crosshair", "touch-client-point"],
      maximumDistance: 80,
      cameraMovementAllowed: false,
      autoSelectionAllowed: false,
      autoOpenDashboardSectionOnSelection: true,
      selectionClearsOnEmptyRaycast: false,
      selectableTargets: [
        { id: "INSPECT_MAST_A", kind: "tower", referenceId: "MAST_A", label: "MAST_A · Wohngebiet" },
        { id: "INSPECT_MAST_B", kind: "tower", referenceId: "MAST_B", label: "MAST_B · Innenstadt" },
        { id: "INSPECT_MAST_C", kind: "tower", referenceId: "MAST_C", label: "MAST_C · Gesundheit" },
        { id: "INSPECT_MAST_D", kind: "tower", referenceId: "MAST_D", label: "MAST_D · BOS-Campus" },
        { id: "INSPECT_MAST_E", kind: "tower", referenceId: "MAST_E", label: "MAST_E · Arena" },
        { id: "INSPECT_FIRE_01", kind: "response-vehicle", referenceId: "RESPONSE_FIRE_01", endpointId: "NET_FIRE_01", label: "Feuerwehr 01" },
        { id: "INSPECT_POLICE_01", kind: "response-vehicle", referenceId: "RESPONSE_POLICE_01", endpointId: "NET_POLICE_01", label: "Polizei 01" },
        { id: "INSPECT_CAR_RING_01", kind: "civilian-vehicle", referenceId: "CAR_RING_01", endpointId: "NET_CAR_RING_01", label: "Ziviles Fahrzeug Ring 01" },
        { id: "INSPECT_CAR_DOWNTOWN_01", kind: "civilian-vehicle", referenceId: "CAR_DOWNTOWN_01", endpointId: "NET_CAR_DOWNTOWN_01", label: "Ziviles Fahrzeug Innenstadt 01" },
        { id: "INSPECT_PED_RES_01", kind: "civilian-pedestrian", referenceId: "PED_RES_01", endpointId: "NET_PED_RES_01", label: "Ziviles Endgerät Wohngebiet 01" },
        { id: "INSPECT_PED_ARENA_01", kind: "civilian-pedestrian", referenceId: "PED_ARENA_01", endpointId: "NET_PED_ARENA_01", label: "Ziviles Endgerät Arena 01" },
        { id: "INSPECT_INCIDENT_W14", kind: "incident-building", referenceId: "W14", label: "Mission 001 · Einsatzgebäude W14" }
      ],
      dashboard: {
        placement: "inside-existing-right-dashboard",
        parentSectionId: "communication-comparison",
        containerId: "network-inspection-panel",
        title: "Netzinspektion",
        hiddenWithoutSelection: true,
        widthChangeAllowed: false,
        standalonePanelAllowed: false,
        compactControlHint: "F · Netzobjekt prüfen · Esc · Auswahl schließen",
        fieldIds: {
          objectName: "network-inspection-name",
          objectType: "network-inspection-type",
          servingCell: "network-inspection-serving-cell",
          cellLoad: "network-inspection-cell-load",
          serviceState: "network-inspection-service-state",
          lastHandover: "network-inspection-last-handover",
          note: "network-inspection-note"
        }
      }
    },

    expectedCounts: {
      representativeEndpoints: 4,
      representativeVehicles: 2,
      representativePedestrians: 2,
      totalDynamicDemandUnits: 6,
      defaultWeakLines: 4,
      inspectionTargets: 12,
      inspectionTowers: 5,
      inspectionResponseVehicles: 2,
      inspectionCivilianVehicles: 2,
      inspectionCivilianPedestrians: 2,
      inspectionIncidentBuildings: 1,
      newStandalonePanels: 0,
      missionSpecificServingTowerDefinitions: 0
    }
  };
})();
