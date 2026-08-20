/* Mission BOS - Build 011N.2
   Network-recovery plan integration with permanent BOS connectivity, continuous bidirectional packets and deterministic saturation.
   No modules. No fetch. No runtime randomization.
*/
(function(){"use strict";window.MISSION_BOS_NETWORK_REALISM_PLAN=Object.freeze({
  "schemaVersion": "1.0",
  "project": "Mission BOS – Connected Response",
  "buildBase": "010P.7 PRESENTATION BASELINE",
  "phase": "011N.1 Mobile Network Realism Overhaul",
  "sourceBuild": "Mission-BOS-Build-010P.7",
  "sourceFiles": {
    "city-layout-recovery.js": "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17",
    "city-traffic-plan.js": "617b4ffa560859e0a11e54b009e159f34b73b71f7201617f92a1611568b54a65",
    "city-pedestrian-plan.js": "ca979d6b379bb7d8c3fc3a0f522617f4029a296333680b10fb2c2301cb8a44b7",
    "city-response-vehicle-plan.js": "484eb5908a62b4916a01ba7c7939b3fa34cb5fccf1b7e9a7a5c86c4642ba5796",
    "city-ambulance-plan.js": "5bf854db7dc2a39da577c4e9f18fd7caf4bf7256ae13fae82e66dc400a93adda",
    "city-mission-001-scene-plan.js": "79e9728d6b071655a6c0f3309c638fdcb5ac8f4cba01fc457828e13347390930",
    "city-arena-event-plan.js": "2e62a21e5577ff52e864a73c2d9bd1430bc53a5968dc2948402130571be73d72",
    "city-network-association-plan.js": "dea2e31b8bbc8f820d65c8d2f4a181c9a6afc83bd50a47b98adf70257f286dc4",
    "city-network-radio-model.js": "d41607faa2c1d36419f070033f727376b2a8445bd9c93c35abc5148071142294",
    "city-network-association-controller.js": "2aca059f69cfab73fc8a15f455d2948a01caaa32999ef8d549f941fcace4fdcc",
    "city-cell-load-plan.js": "f05f7d9a378f185ce4db356831338efcf230e29e469cb5d39d5e8ece0e74c4af",
    "city-cell-load-controller.js": "0e0b63bf860eed5b9bbec7403fc070bb967d7edfb618b8c0e2009a313b2c25fe",
    "city-cell-capacity-plan.js": "d5ec14518ec6a51fa4f6141f944455bffceb6b07195154c25b9e71d4321ea640",
    "city-cell-capacity-controller.js": "0e41d9cebaae77393f5bc0492e3879459c379896137c1830ab841be4dceed3d0",
    "city-telekom-communication-plan.js": "022ec7ca3f814596e13844c4b3351fe18d60b90fade4dc6848e1a7e40469f0b4",
    "city-telekom-communication-renderer.js": "1876e6c72d91f0d9f924d4cdbddf220ad0db603e49af55ea28c7c73f612b7d2d",
    "city-civilian-connectivity-controller.js": "5e618dbeb4368f154df4e61854ae489bb8d85186c0fe299493d0a4e419b43138",
    "city-civilian-connectivity-renderer.js": "dc4e288cd5a29d28b3417023a9d86ce20336787678fa5501cb09e7c08fcfbc02",
    "city-arena-event-connectivity-renderer.js": "90f6d061e82c6636a61a44b29d8a6adf707da7fa952d2c0194e060c2c05acc3c",
    "city-ambulance-connectivity-renderer.js": "1722baf375bae39c4db4acc07ad55039500618213c7d194e795112532a000722",
    "city-mission-001-plan.js": "c3b54c1d81e0ec34c5a95027a419e191a70bc1b0e5a11c872efc814de13a618a",
    "city-mission-001-controller.js": "4ffaef0c071b26377ce997ec898609a3b4f6fe7c40515bc2940417c6ddd957ee",
    "city-mission-002-plan.js": "53fb4ea72002871424b170b33425a63bd9fe58cfddaf26fd779fb244b9daa2c8",
    "city-mission-002-controller.js": "b5a1f16f969ffdb0f2e0211e95f53b133a6a4a7c228f8b7fc35238e740fdf46e",
    "city-mission-registry-controller.js": "f688bcb07b0218867e4bf15fc6184454f3d428b67dde5be5214bd23be757e98e",
    "city-presenter-plan.js": "c0d98d6f1ce099d47ac8dc47c30464a1054a04b3045ca02a1cd77d1be8a73a77",
    "city-presenter-controller.js": "2f30d76d1de4afb700dc167af55d23b9ff154e40db138b1af946b3de5383aeb1",
    "app.js": "69530c7185326ced45d08277771ea20adb97a5965ea9a37159f47b536f598153",
    "index.html": "e99d82a4751dde806b0483e4716c29384a37eb9ef6f8fa3ac1a3f64f2f4cd1f6",
    "style.css": "23cb90a48828a0c5926010f860b6170055adb78652810e096e5bffea193e83b2"
  },
  "policy": {
    "runtimeRandomization": false,
    "fileProtocolRequired": true,
    "cityGeometryChangesAllowed": false,
    "staticPropChangesAllowed": false,
    "trafficRouteChangesAllowed": false,
    "pedestrianRouteChangesAllowed": false,
    "responseRouteChangesAllowed": false,
    "missionIncidentContentChangesAllowed": false,
    "newCommunicationTypesAllowed": false,
    "fullPhysicalRadioPlanningClaimed": false,
    "visualizationIsSimplifiedAndSymbolic": true,
    "allVisibleParticipantsUseSharedRadioModel": true,
    "fixedServingTowerAllowed": false,
    "missionSpecificServingTowerAllowed": false,
    "automaticBOSPriorityRequired": true,
    "manualBOSActivationAllowed": false,
    "civilianLoadMayArtificiallyDropAfterBOS": false,
    "forcedCivilianHandoverForPriorityAllowed": false,
    "rightDashboardMustRemain": true,
    "newStandaloneDashboardAllowed": false,
    "telekomMagentaRemainsBrandAccent": true,
    "bosTechnicalSemanticColorIsBlue": true
  },
  "loadIndicator": {
    "visibleOnAllTowers": true,
    "anchor": "tower-beacon",
    "billboardToCamera": true,
    "widthWorldUnits": 6.4,
    "heightWorldUnits": 1.05,
    "verticalOffsetAboveBeacon": 2.2,
    "showPercentage": true,
    "thresholds": [
      {
        "state": "NORMAL",
        "min": 0,
        "maxExclusive": 55,
        "color": "#2FB344"
      },
      {
        "state": "HIGH_LOAD",
        "min": 55,
        "maxExclusive": 75,
        "color": "#F2C94C"
      },
      {
        "state": "CRITICAL",
        "min": 75,
        "maxExclusive": 90,
        "color": "#F2994A"
      },
      {
        "state": "OVERLOADED",
        "min": 90,
        "maxInclusive": 100,
        "color": "#D63031"
      }
    ],
    "priorityLane": {
      "color": "#0066CC",
      "highlightColor": "#4DB3FF",
      "relativeWidth": 0.22,
      "visibleAtOrAboveLoad": 90,
      "prioritySegmentStartPercent": 85,
      "visibleOnlyWhenPriorityActive": true,
      "availableOpacityWithoutBosEndpoint": 0.0,
      "activeOpacityWithBosEndpoint": 1.0,
      "activePulse": true,
      "meaning": "Symbolische Rettungsgasse innerhalb einer überlasteten Funkzelle."
    }
  },
  "automaticBOSPriority": {
    "mode": "automatic-per-cell",
    "overloadThreshold": 90,
    "activationDelaySeconds": 0.6,
    "releaseThreshold": 85,
    "releaseDelaySeconds": 1.5,
    "laneVisibleWhenOverloaded": true,
    "priorityActiveRequiresBosEndpointInCell": true,
    "priorityFollowsConfirmedHandover": true,
    "manualButtonBehavior": "status-only-disabled",
    "missionTransitionMode": "runtime-detects-active-priority",
    "resetClearsImmediately": true,
    "overloadedStateMinimumVisibleSeconds": 0.8
  },
  "participants": {
    "bos": [
      {
        "id": "NET_FIRE_01",
        "kind": "response-vehicle",
        "referenceId": "RESPONSE_FIRE_01",
        "label": "Feuerwehr 01",
        "channel": "BOS",
        "demandUnits": 12,
        "activeMode": "always"
      },
      {
        "id": "NET_POLICE_01",
        "kind": "response-vehicle",
        "referenceId": "RESPONSE_POLICE_01",
        "label": "Polizei 01",
        "channel": "BOS",
        "demandUnits": 12,
        "activeMode": "always"
      },
      {
        "id": "NET_AMBULANCE_01",
        "kind": "ambulance",
        "referenceId": "AMBULANCE_01",
        "label": "Rettungswagen 01",
        "channel": "BOS",
        "demandUnits": 12,
        "activeMode": "always"
      }
    ],
    "alwaysOnCivilian": [
      {
        "id": "NET_CAR_RING_01",
        "kind": "civilian-vehicle",
        "referenceId": "CAR_RING_01",
        "label": "Pkw Ring 01",
        "channel": "CIVILIAN",
        "demandUnits": 0.8,
        "activity": "navigation",
        "activeMode": "always"
      },
      {
        "id": "NET_CAR_RING_02",
        "kind": "civilian-vehicle",
        "referenceId": "CAR_RING_02",
        "label": "Pkw Ring 02",
        "channel": "CIVILIAN",
        "demandUnits": 0.8,
        "activity": "navigation",
        "activeMode": "always"
      },
      {
        "id": "NET_CAR_RING_03",
        "kind": "civilian-vehicle",
        "referenceId": "CAR_RING_03",
        "label": "Pkw Ring 03",
        "channel": "CIVILIAN",
        "demandUnits": 0.8,
        "activity": "navigation",
        "activeMode": "always"
      },
      {
        "id": "NET_CAR_DOWNTOWN_01",
        "kind": "civilian-vehicle",
        "referenceId": "CAR_DOWNTOWN_01",
        "label": "Pkw Innenstadt 01",
        "channel": "CIVILIAN",
        "demandUnits": 0.8,
        "activity": "navigation",
        "activeMode": "always"
      },
      {
        "id": "NET_VAN_SUPPORT_01",
        "kind": "civilian-vehicle",
        "referenceId": "VAN_SUPPORT_01",
        "label": "Lieferwagen Süd 01",
        "channel": "CIVILIAN",
        "demandUnits": 0.8,
        "activity": "navigation",
        "activeMode": "always"
      },
      {
        "id": "NET_PED_RES_01",
        "kind": "civilian-pedestrian",
        "referenceId": "PED_RES_01",
        "label": "Passant Wohngebiet 01",
        "channel": "CIVILIAN",
        "demandUnits": 0.25,
        "activity": "messaging",
        "activeMode": "always"
      },
      {
        "id": "NET_PED_RES_02",
        "kind": "civilian-pedestrian",
        "referenceId": "PED_RES_02",
        "label": "Passant Wohngebiet 02",
        "channel": "CIVILIAN",
        "demandUnits": 0.25,
        "activity": "messaging",
        "activeMode": "always"
      },
      {
        "id": "NET_PED_DOWNTOWN_01",
        "kind": "civilian-pedestrian",
        "referenceId": "PED_DOWNTOWN_01",
        "label": "Passant Innenstadt 01",
        "channel": "CIVILIAN",
        "demandUnits": 0.25,
        "activity": "messaging",
        "activeMode": "always"
      },
      {
        "id": "NET_PED_HEALTH_01",
        "kind": "civilian-pedestrian",
        "referenceId": "PED_HEALTH_01",
        "label": "Passant Gesundheit 01",
        "channel": "CIVILIAN",
        "demandUnits": 0.25,
        "activity": "messaging",
        "activeMode": "always"
      },
      {
        "id": "NET_PED_HEALTH_02",
        "kind": "civilian-pedestrian",
        "referenceId": "PED_HEALTH_02",
        "label": "Passant Gesundheit 02",
        "channel": "CIVILIAN",
        "demandUnits": 0.25,
        "activity": "messaging",
        "activeMode": "always"
      },
      {
        "id": "NET_PED_BOS_01",
        "kind": "civilian-pedestrian",
        "referenceId": "PED_BOS_01",
        "label": "Passant BOS-Campus 01",
        "channel": "CIVILIAN",
        "demandUnits": 0.25,
        "activity": "messaging",
        "activeMode": "always"
      },
      {
        "id": "NET_PED_ARENA_01",
        "kind": "civilian-pedestrian",
        "referenceId": "PED_ARENA_01",
        "label": "Passant Arena 01",
        "channel": "CIVILIAN",
        "demandUnits": 0.25,
        "activity": "messaging",
        "activeMode": "always"
      },
      {
        "id": "NET_PED_ARENA_02",
        "kind": "civilian-pedestrian",
        "referenceId": "PED_ARENA_02",
        "label": "Passant Arena 02",
        "channel": "CIVILIAN",
        "demandUnits": 0.25,
        "activity": "messaging",
        "activeMode": "always"
      }
    ],
    "mission001Civilian": [
      {
        "id": "NET_PHONE_01",
        "kind": "mission-phone",
        "referenceId": "MISSION_SPECTATOR_01",
        "label": "Zuschauer-Smartphone 1",
        "channel": "CIVILIAN",
        "demandUnits": 1.0,
        "activity": "upload",
        "activeMode": "mission-001-scene"
      },
      {
        "id": "NET_PHONE_02",
        "kind": "mission-phone",
        "referenceId": "MISSION_SPECTATOR_02",
        "label": "Zuschauer-Smartphone 2",
        "channel": "CIVILIAN",
        "demandUnits": 1.0,
        "activity": "upload",
        "activeMode": "mission-001-scene"
      },
      {
        "id": "NET_PHONE_03",
        "kind": "mission-phone",
        "referenceId": "MISSION_SPECTATOR_03",
        "label": "Zuschauer-Smartphone 3",
        "channel": "CIVILIAN",
        "demandUnits": 1.0,
        "activity": "upload",
        "activeMode": "mission-001-scene"
      },
      {
        "id": "NET_PHONE_04",
        "kind": "mission-phone",
        "referenceId": "MISSION_SPECTATOR_04",
        "label": "Zuschauer-Smartphone 4",
        "channel": "CIVILIAN",
        "demandUnits": 1.0,
        "activity": "upload",
        "activeMode": "mission-001-scene"
      },
      {
        "id": "NET_PHONE_05",
        "kind": "mission-phone",
        "referenceId": "MISSION_SPECTATOR_05",
        "label": "Zuschauer-Smartphone 5",
        "channel": "CIVILIAN",
        "demandUnits": 1.0,
        "activity": "upload",
        "activeMode": "mission-001-scene"
      },
      {
        "id": "NET_PHONE_06",
        "kind": "mission-phone",
        "referenceId": "MISSION_SPECTATOR_06",
        "label": "Zuschauer-Smartphone 6",
        "channel": "CIVILIAN",
        "demandUnits": 1.0,
        "activity": "upload",
        "activeMode": "mission-001-scene"
      }
    ],
    "arenaCivilian": [
      {
        "id": "ARENA_PHONE_01",
        "kind": "arena-phone",
        "referenceId": "ARENA_VISITOR_01",
        "label": "Arena-Smartphone 1",
        "channel": "CIVILIAN",
        "demandUnits": 0.875,
        "activity": "upload",
        "activeMode": "arena-event"
      },
      {
        "id": "ARENA_PHONE_02",
        "kind": "arena-phone",
        "referenceId": "ARENA_VISITOR_03",
        "label": "Arena-Smartphone 2",
        "channel": "CIVILIAN",
        "demandUnits": 0.875,
        "activity": "upload",
        "activeMode": "arena-event"
      },
      {
        "id": "ARENA_PHONE_03",
        "kind": "arena-phone",
        "referenceId": "ARENA_VISITOR_04",
        "label": "Arena-Smartphone 3",
        "channel": "CIVILIAN",
        "demandUnits": 0.875,
        "activity": "upload",
        "activeMode": "arena-event"
      },
      {
        "id": "ARENA_PHONE_04",
        "kind": "arena-phone",
        "referenceId": "ARENA_VISITOR_06",
        "label": "Arena-Smartphone 4",
        "channel": "CIVILIAN",
        "demandUnits": 0.875,
        "activity": "upload",
        "activeMode": "arena-event"
      },
      {
        "id": "ARENA_PHONE_05",
        "kind": "arena-phone",
        "referenceId": "ARENA_VISITOR_07",
        "label": "Arena-Smartphone 5",
        "channel": "CIVILIAN",
        "demandUnits": 0.875,
        "activity": "upload",
        "activeMode": "arena-event"
      },
      {
        "id": "ARENA_PHONE_06",
        "kind": "arena-phone",
        "referenceId": "ARENA_VISITOR_09",
        "label": "Arena-Smartphone 6",
        "channel": "CIVILIAN",
        "demandUnits": 0.875,
        "activity": "upload",
        "activeMode": "arena-event"
      },
      {
        "id": "ARENA_PHONE_07",
        "kind": "arena-phone",
        "referenceId": "ARENA_VISITOR_10",
        "label": "Arena-Smartphone 7",
        "channel": "CIVILIAN",
        "demandUnits": 0.875,
        "activity": "upload",
        "activeMode": "arena-event"
      },
      {
        "id": "ARENA_PHONE_08",
        "kind": "arena-phone",
        "referenceId": "ARENA_VISITOR_11",
        "label": "Arena-Smartphone 8",
        "channel": "CIVILIAN",
        "demandUnits": 0.875,
        "activity": "upload",
        "activeMode": "arena-event"
      },
      {
        "id": "ARENA_DEVICE_02",
        "kind": "arena-idle-device",
        "referenceId": "ARENA_VISITOR_02",
        "label": "Arena-Endgerät 2",
        "channel": "CIVILIAN",
        "demandUnits": 0.25,
        "activity": "background-sync",
        "activeMode": "arena-event"
      },
      {
        "id": "ARENA_DEVICE_05",
        "kind": "arena-idle-device",
        "referenceId": "ARENA_VISITOR_05",
        "label": "Arena-Endgerät 5",
        "channel": "CIVILIAN",
        "demandUnits": 0.25,
        "activity": "background-sync",
        "activeMode": "arena-event"
      },
      {
        "id": "ARENA_DEVICE_08",
        "kind": "arena-idle-device",
        "referenceId": "ARENA_VISITOR_08",
        "label": "Arena-Endgerät 8",
        "channel": "CIVILIAN",
        "demandUnits": 0.25,
        "activity": "background-sync",
        "activeMode": "arena-event"
      },
      {
        "id": "ARENA_DEVICE_12",
        "kind": "arena-idle-device",
        "referenceId": "ARENA_VISITOR_12",
        "label": "Arena-Endgerät 12",
        "channel": "CIVILIAN",
        "demandUnits": 0.25,
        "activity": "background-sync",
        "activeMode": "arena-event"
      }
    ],
    "demandAccounting": {
      "alwaysOnTotalUnits": 6.0,
      "mission001VisibleTotalUnits": 6.0,
      "arenaVisibleTotalUnits": 8.0,
      "arenaAggregateUnitsRemain": 53,
      "arenaTotalEventDemandRemains": 61,
      "rule": "Visible endpoints explain and redistribute existing demand. Do not double-count existing mission aggregate demand."
    }
  },
  "visualLanguage": {
    "civilian": {
      "lineGeometry": "continuous-solid",
      "defaultColor": "#7A263A",
      "loadedColor": "#B33A3A",
      "deprioritizedColor": "#E56B6F",
      "deferredColor": "#8F1D2C",
      "defaultOpacity": 0.075,
      "overloadedOpacity": 0.14,
      "deprioritizedOpacity": 0.18,
      "selectedOpacity": 0.55,
      "depthTest": true,
      "depthWrite": false,
      "particleCountPerConnection": 1,
      "normalParticleCyclesPerSecond": 0.18,
      "loadedParticleCyclesPerSecond": 0.1,
      "deprioritizedParticleCyclesPerSecond": 0.045,
      "deferredParticleCyclesPerSecond": 0.0,
      "lineMustNeverBeDashed": true
    },
    "bos": {
      "lineGeometry": "continuous-solid",
      "color": "#0066CC",
      "highlightColor": "#4DB3FF",
      "packetColor": "#E20074",
      "defaultOpacity": 0.72,
      "glowOpacity": 0.18,
      "depthTest": false,
      "depthWrite": false,
      "particleCountPerConnection": 4,
      "particleCyclesPerSecond": 0.95,
      "priorityLineVisibleOnlyForActiveBosEndpoints": true,
      "prePriority": {
        "lineColor": "#9BDFFF",
        "glowColor": "#9BDFFF",
        "lineOpacity": 0.46,
        "glowOpacity": 0.11,
        "packetColor": "#B9E6FF",
        "packetOpacity": 0.70,
        "packetCyclesPerSecond": 0.25,
        "packetCountPerVisiblePath": 4,
        "packetsPerDirection": 2,
        "magentaPacketsVisible": false
      },
      "activePriority": {
        "lineColor": "#0066CC",
        "highlightColor": "#4DB3FF",
        "packetColor": "#E20074",
        "lineOpacity": 0.88,
        "glowOpacity": 0.21,
        "packetOpacity": 0.95,
        "packetCyclesPerSecond": 0.95,
        "packetCountPerVisiblePath": 4,
        "packetsPerDirection": 2
      }
    },
    "anchors": {
      "participantHeightMode": "existing-object-anchor",
      "towerTarget": "beacon-center",
      "towerBeaconYOffset": 0.35
    },
    "clutterControl": {
      "normalCivilianLinesRemainWeak": true,
      "selectedEndpointMayHighlight": true,
      "maximumWorldLabels": 0,
      "allActiveConnectionsStillRendered": true
    }
  },
  "capacityAllocation": {
    "cellCapacityUnits": 100,
    "bosDemandPerEndpointUnits": 12,
    "allocationOrder": [
      "BOS",
      "CIVILIAN"
    ],
    "civilianSessionStates": [
      "SERVED",
      "BEST_EFFORT",
      "DEPRIORITIZED",
      "DEFERRED"
    ],
    "deterministicAffectedEndpointOrder": [
      "background-sync",
      "navigation",
      "messaging",
      "upload"
    ],
    "minimumVisibleAffectedCivilianSessionsPerActivePriorityCell": 1,
    "civilianDemandRemainsVisible": true,
    "loadPercentageMustNotArtificiallyDrop": true,
    "participantsMustRemainVisible": true,
    "devicesMustRemainVisible": true,
    "priorityDoesNotForceHandover": true,
    "releaseVisualization": [
      "slower-data-points",
      "lighter-red-line",
      "paused-data-point-for-deferred"
    ]
  },
  "sameCellCompetition": {
    "mission001": {
      "required": true,
      "minimumBosEndpoints": 1,
      "minimumCivilianEndpoints": 2,
      "minimumCellLoad": 90
    },
    "mission002": {
      "required": true,
      "minimumBosEndpoints": 1,
      "minimumCivilianEndpoints": 6,
      "minimumCellLoad": 90
    },
    "validationRule": "Requirement must emerge from positions and shared radio model, never fixed serving-tower assignments."
  },
  "missionIntegration": {
    "mission001StatesPreserved": true,
    "mission002StatesPreserved": true,
    "manualActivationStateActionRemoved": true,
    "overloadedToBosActiveTrigger": "automatic priority runtime active for mission BOS endpoint cell",
    "bosActiveToCommsStableTrigger": "capacity priority settled",
    "presenterActionAtOverload": "none-automatic",
    "missionButtonAndResetBehaviorUnchanged": true
  },
  "runtimeContract": {
    "requiredNewGlobals": [
      "MISSION_BOS_NETWORK_REALISM_PLAN",
      "MissionBosNetworkRealismValidator",
      "MissionBosTowerLoadIndicatorRenderer",
      "MissionBosAutomaticBOSPriorityController"
    ],
    "requiredAutomaticControllerMethods": [
      "update",
      "reset",
      "getCellState",
      "getAllCellStates",
      "getSafetyStatus",
      "dispose"
    ],
    "requiredTowerIndicatorMethods": [
      "update",
      "reset",
      "getManifest",
      "getSafetyStatus",
      "dispose"
    ],
    "existingAssociationModelMustRemain": "SIMPLIFIED_RADIO_HANDOVER_V3",
    "existingHandoverParametersRemainInitialBaseline": true
  },
  "expectedCounts": {
    "towerIndicators": 5,
    "bosEndpoints": 3,
    "alwaysOnCivilianEndpoints": 13,
    "mission001CivilianEndpoints": 6,
    "arenaCivilianEndpoints": 12,
    "allCivilianEndpoints": 31,
    "allNetworkEndpoints": 34,
    "maximumCivilianLines": 31,
    "maximumBosLines": 3,
    "fixedServingTowerDefinitions": 0
  }
});})();
