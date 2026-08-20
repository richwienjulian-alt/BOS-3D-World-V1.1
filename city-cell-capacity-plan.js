/* Mission BOS - Build 010P.4
   Frozen symbolic shared-cell capacity, civilian deprioritization and BOS-priority plan.
   No modules. No fetch. No runtime randomness.
*/
(function () {
  "use strict";

  window.MISSION_BOS_CELL_CAPACITY_PLAN = {
    schemaVersion: "1.0",
    project: "Mission BOS – Connected Response",
    buildBase: "010P.3 PASSED",
    phase: "009N.6 Capacity Allocation, Civilian Deprioritization & BOS Priority",
    dualMissionPhase: "010P.4 Dual-Mission Cell Capacity Compatibility",
    sourceBuild: "Mission-BOS-Build-010P.3",

    sourceFiles: {
      "city-layout-recovery.js": "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17",
      "city-cell-load-plan.js": "73d5b8b36673bad5d8f998b146710a44d17fccd9d3f938326df30325828d0524",
      "city-cell-load-controller.js": "9aa3ac1b567a8fb87ca7d69bdffd1406ac06e7aae02c43f8d2cd8a0f99534d5a",
      "city-network-association-plan.js": "dea2e31b8bbc8f820d65c8d2f4a181c9a6afc83bd50a47b98adf70257f286dc4",
      "city-network-radio-model.js": "d41607faa2c1d36419f070033f727376b2a8445bd9c93c35abc5148071142294",
      "city-network-association-controller.js": "2aca059f69cfab73fc8a15f455d2948a01caaa32999ef8d549f941fcace4fdcc",
      "city-telekom-communication-plan.js": "fb320700a0f9d794aa94908584cc1596dcc791b6db5bc94fb3728ed8c2ed8446",
      "city-telekom-communication-renderer.js": "cef5d1ed20449a79dede5b9be6bcb3cf3bee444bad6cd03da8db67603bd063a4",
      "telekom-communication-validator.js": "30259bae74b5e5587b380940376d0ddb80298bc36955c5a513b5d0585a616063",
      "city-handover-visualization-plan.js": "6124a84b19de2484909463de771ea08f263076e0d99ec407a8c6c6ff66261ca2",
      "city-handover-visualization-renderer.js": "3c4dc64790171001d6f0072c276093de2d9711f6141180373ebe4c8de9cad842",
      "handover-visualization-validator.js": "e85c64b11fa46b514be4dd2ec7fe6e0ab12d65f2818f75aa2dcd700ae8357f3a",
      "city-mission-001-plan.js": "83a6c387c9f34380010de403a8afb29bb80961367eb30d411523d6c9b4fbc5ab",
      "city-mission-001-scene-plan.js": "79e9728d6b071655a6c0f3309c638fdcb5ac8f4cba01fc457828e13347390930",
      "app.js": "adf7303d54545d6ac7ba9a090516044c15d5b489f6eb6dba120091caed224c1b",
      "index.html": "a35830631d10dca7afdbed1b6428cd1636a43427e5c16010d1270a0705d8e58b",
      "style.css": "1ee6f0203afec169491f146e2f265e00ab4e63072994f162f27229ca2458bc1b"
    },

    policy: {
      runtimeRandomization: false,
      cityGeometryChangesAllowed: false,
      staticPropChangesAllowed: false,
      trafficChangesAllowed: false,
      pedestrianChangesAllowed: false,
      responseVehicleChangesAllowed: false,
      missionStateChangesAllowed: false,
      associationAlgorithmChangesAllowed: false,
      handoverParameterChangesAllowed: false,
      localCellLoadValueChangesAllowed: false,
      automaticBOSActivationAllowed: false,
      priorityTriggeredReassociationAllowed: false,
      priorityTriggeredHandoverAllowed: false,
      civilianActorsMayBeRemoved: false,
      civilianDevicesMayBeHidden: false,
      explicitCivilianDeprioritizationRequired: true,
      sameCellCivilianAndBosRequired: true,
      civilianDemandMustRemainHighAfterPriority: true,
      rightDashboardMustRemain: true,
      newStandalonePanelAllowed: false,
      fullRadioPlanningClaimed: false,
      technicalPerformanceClaimed: false,
      visualizationIsSimplifiedAndSymbolic: true,
      fileProtocolRequired: true
    },

    capacityModel: {
      id: "SYMBOLIC_SHARED_CELL_CAPACITY_V1",
      unitLabel: "Sim.-Einheiten",
      cellCapacityUnits: 100,
      civilianDemandSource: "current-local-cell-load-percent",
      bosDemandPerEligibleEndpointUnits: 12,
      eligibleBosEndpointIds: ["NET_FIRE_01", "NET_POLICE_01", "NET_AMBULANCE_01"],
      baseVisibleCivilianEndpointIds: [
        "NET_PHONE_01", "NET_PHONE_02", "NET_PHONE_03",
        "NET_PHONE_04", "NET_PHONE_05", "NET_PHONE_06"
      ],
      additionalVisibleCivilianEndpointIds: [
        "ARENA_PHONE_01", "ARENA_PHONE_02", "ARENA_PHONE_03", "ARENA_PHONE_04",
        "ARENA_PHONE_05", "ARENA_PHONE_06", "ARENA_PHONE_07", "ARENA_PHONE_08"
      ],
      visibleCivilianEndpointIds: [
        "NET_PHONE_01", "NET_PHONE_02", "NET_PHONE_03", "NET_PHONE_04", "NET_PHONE_05", "NET_PHONE_06",
        "ARENA_PHONE_01", "ARENA_PHONE_02", "ARENA_PHONE_03", "ARENA_PHONE_04",
        "ARENA_PHONE_05", "ARENA_PHONE_06", "ARENA_PHONE_07", "ARENA_PHONE_08"
      ],
      associationProviders: [
        { id: "PRIMARY_ASSOCIATION", endpointIds: ["NET_PHONE_01", "NET_PHONE_02", "NET_PHONE_03", "NET_PHONE_04", "NET_PHONE_05", "NET_PHONE_06", "NET_FIRE_01", "NET_POLICE_01", "NET_AMBULANCE_01"] },
        { id: "ARENA_EVENT", endpointIds: ["ARENA_PHONE_01", "ARENA_PHONE_02", "ARENA_PHONE_03", "ARENA_PHONE_04", "ARENA_PHONE_05", "ARENA_PHONE_06", "ARENA_PHONE_07", "ARENA_PHONE_08"] }
      ],
      priorityStates: ["BOS_ACTIVE", "COMMS_STABLE", "TREATMENT", "COMPLETED", "TRANSPORTING", "AT_HOSPITAL", "RETURNING"],
      prePriorityCongestionState: "OVERLOADED",
      activationRampSeconds: 0.8,
      evaluationIntervalSeconds: 0.1,
      maximumDeltaSeconds: 0.25,
      explicitImpactUnitsPerVisibleSession: 8,
      maximumExplicitAffectedSessionsPerCell: 2,
      affectedEndpointSelection: "association-endpoint-id-ascending",
      impactModesInOrder: ["DEPRIORITIZED", "DEFERRED"],
      formulaBeforePriority: {
        civilianServed: "min(civilianDemand, capacity)",
        remainingCapacity: "max(0, capacity - civilianServed)",
        bosServed: "min(bosDemand, remainingCapacity)",
        bosUnserved: "max(0, bosDemand - bosServed)",
        civilianUnserved: "0"
      },
      formulaAfterPriority: {
        bosReserved: "min(bosDemand, capacity)",
        civilianServed: "min(civilianDemand, max(0, capacity - bosReserved))",
        civilianUnserved: "max(0, civilianDemand - civilianServed)",
        bosServed: "bosReserved",
        bosUnserved: "0"
      },
      interpretation: "Die Zelllast beschreibt zivile Nachfrage. BOS-Bedarf kommt zusätzlich hinzu. Nach manueller Aktivierung wird BOS-Kapazität bevorzugt bedient; zivile Nachfrage bleibt hoch und wird teilweise zurückgestellt.",
      disclaimer: "Symbolische Simulationseinheiten; keine technische Leistungs-, Bandbreiten- oder Verfügbarkeitskennzahl."
    },

    statePolicy: {
      READY: { capacityVisible: false, priorityApplied: false, civilianImpactVisible: false },
      CALL_RECEIVED: { capacityVisible: false, priorityApplied: false, civilianImpactVisible: false },
      CLEARING_CORRIDOR: { capacityVisible: false, priorityApplied: false, civilianImpactVisible: false },
      DISPATCHING: { capacityVisible: false, priorityApplied: false, civilianImpactVisible: false },
      ENROUTE: { capacityVisible: false, priorityApplied: false, civilianImpactVisible: false },
      ON_SCENE: { capacityVisible: true, priorityApplied: false, civilianImpactVisible: false },
      OVERLOADED: { capacityVisible: true, priorityApplied: false, civilianImpactVisible: false },
      BOS_ACTIVE: { capacityVisible: true, priorityApplied: true, civilianImpactVisible: true },
      COMMS_STABLE: { capacityVisible: true, priorityApplied: true, civilianImpactVisible: true },
      COMPLETED: { capacityVisible: true, priorityApplied: true, civilianImpactVisible: true },
      TREATMENT: { capacityVisible: true, priorityApplied: true, civilianImpactVisible: true },
      TRANSPORTING: { capacityVisible: true, priorityApplied: true, civilianImpactVisible: true },
      AT_HOSPITAL: { capacityVisible: true, priorityApplied: true, civilianImpactVisible: true },
      RETURNING: { capacityVisible: true, priorityApplied: true, civilianImpactVisible: true },
      FAILED: { capacityVisible: false, priorityApplied: false, civilianImpactVisible: false }
    },

    incidentReference: {
      sharedCellId: "MAST_A",
      neighboringHotspotCellId: "MAST_B",
      expectedBosEndpointIdsOnSharedCell: ["NET_FIRE_01", "NET_POLICE_01"],
      expectedCivilianEndpointIdsOnSharedCell: ["NET_PHONE_01", "NET_PHONE_02"],
      expectedCivilianEndpointIdsOnNeighborCell: ["NET_PHONE_03", "NET_PHONE_04", "NET_PHONE_05", "NET_PHONE_06"],
      overloadedCivilianDemandByTowerId: {
        MAST_A: 92,
        MAST_B: 96,
        MAST_C: 32,
        MAST_D: 44,
        MAST_E: 34
      },
      expectedSettledAllocations: {
        OVERLOADED: {
          MAST_A: {
            civilianDemand: 92,
            bosDemand: 24,
            civilianServed: 92,
            civilianUnserved: 0,
            bosServed: 8,
            bosUnserved: 16,
            affectedVisibleCivilianSessions: 0
          },
          MAST_B: {
            civilianDemand: 96,
            bosDemand: 0,
            civilianServed: 96,
            civilianUnserved: 0,
            bosServed: 0,
            bosUnserved: 0,
            affectedVisibleCivilianSessions: 0
          }
        },
        BOS_ACTIVE: {
          MAST_A: {
            civilianDemand: 92,
            bosDemand: 24,
            civilianServed: 76,
            civilianUnserved: 16,
            bosServed: 24,
            bosUnserved: 0,
            affectedVisibleCivilianSessions: 2
          },
          MAST_B: {
            civilianDemand: 96,
            bosDemand: 0,
            civilianServed: 96,
            civilianUnserved: 0,
            bosServed: 0,
            bosUnserved: 0,
            affectedVisibleCivilianSessions: 0
          }
        },
        COMMS_STABLE: {
          MAST_A: {
            civilianDemand: 92,
            bosDemand: 24,
            civilianServed: 76,
            civilianUnserved: 16,
            bosServed: 24,
            bosUnserved: 0,
            affectedVisibleCivilianSessions: 2
          }
        }
      }
    },

    arenaReference: {
      sharedCellId: "MAST_E",
      expectedBosEndpointIdsOnSharedCell: ["NET_AMBULANCE_01"],
      expectedCivilianEndpointIdsOnSharedCell: [
        "ARENA_PHONE_01", "ARENA_PHONE_02", "ARENA_PHONE_03", "ARENA_PHONE_04",
        "ARENA_PHONE_05", "ARENA_PHONE_06", "ARENA_PHONE_07", "ARENA_PHONE_08"
      ],
      expectedCivilianDemandMin: 92,
      expectedCivilianDemandMax: 94,
      expectedBosDemand: 12,
      expectedBosUnservedBeforePriorityMin: 4,
      expectedBosUnservedBeforePriorityMax: 6,
      expectedCivilianUnservedAfterPriorityMin: 4,
      expectedCivilianUnservedAfterPriorityMax: 6,
      minimumAffectedVisibleCivilianSessions: 1
    },

    civilianImpact: {
      keepActorVisible: true,
      keepPhoneVisible: true,
      keepAssociationUnchanged: true,
      states: {
        NORMAL: {
          label: "Normal",
          lineOpacityScale: 1,
          glowOpacityScale: 1,
          packetSpeedScale: 1,
          packetDutyCycle: 1,
          dashed: false
        },
        CONGESTED: {
          label: "Überlastet",
          lineOpacityScale: 1,
          glowOpacityScale: 1,
          packetSpeedScale: 0.75,
          packetDutyCycle: 1,
          dashed: false
        },
        DEPRIORITIZED: {
          label: "Depriorisiert",
          lineOpacityScale: 0.38,
          glowOpacityScale: 0.25,
          packetSpeedScale: 0.35,
          packetDutyCycle: 0.62,
          dashed: true
        },
        DEFERRED: {
          label: "Zurückgestellt",
          lineOpacityScale: 0.18,
          glowOpacityScale: 0.12,
          packetSpeedScale: 0.12,
          packetDutyCycle: 0.22,
          dashed: true
        }
      },
      deterministicPacketDutyFrequency: 2.4,
      activationTransferPulseSeconds: 1.2,
      activationTransferPulseColor: "#e20074",
      description: "Nur die Datenverbindung wird sichtbar eingeschränkt. Personen, Smartphones und Funkzellenzuordnung bleiben bestehen."
    },

    dashboard: {
      placement: "inside-existing-right-dashboard",
      parentSectionId: "cell-load-section",
      containerId: "capacity-allocation-summary",
      title: "Kapazitätswirkung",
      maxVisibleCellRows: 2,
      showOnlyOverloadedOrPriorityCells: true,
      labels: {
        civilianDemand: "Zivile Nachfrage",
        civilianServed: "Zivil bedient",
        civilianUnserved: "Zurückgestellt",
        bosServed: "BOS priorisiert",
        bosUnserved: "BOS nicht bedient"
      },
      beforePriorityText: "Keine BOS-Priorität: zivile Nachfrage belegt die gemeinsame Zellkapazität.",
      afterPriorityText: "BOS priorisiert: zivile Nachfrage bleibt hoch, einzelne Datensitzungen werden zurückgestellt.",
      symbolicHint: "Symbolische Simulationseinheiten; keine technische Leistungskennzahl.",
      newStandalonePanelAllowed: false
    },

    runtime: {
      controllerGlobal: "MissionBosCellCapacityController",
      createMethod: "create",
      requiredMethods: [
        "update",
        "registerAssociationProvider",
        "getCell",
        "getAllCells",
        "getEndpointServiceState",
        "getAffectedCivilianEndpoints",
        "getDashboardSnapshot",
        "reset",
        "getManifest",
        "getSafetyStatus",
        "dispose"
      ],
      requiredUpdateOrder: [
        "cell-load",
        "network-association",
        "cell-capacity",
        "telekom-communication",
        "handover-visualization"
      ]
    },

    expectedCounts: {
      cells: 5,
      eligibleBosEndpoints: 3,
      visibleCivilianEndpoints: 14,
      statePolicies: 15,
      priorityStates: 7,
      impactModes: 4,
      sameCellBosEndpointsAtIncident: 2,
      sameCellCivilianEndpointsAtIncident: 2,
      affectedVisibleCivilianSessionsAtIncident: 2,
      automaticBOSActivations: 0,
      priorityTriggeredReassociations: 0,
      removedCivilianActors: 0,
      standalonePanels: 0
    }
  };
})();
