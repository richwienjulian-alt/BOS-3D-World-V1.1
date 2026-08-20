/* Mission BOS - Build 009N.5
   Frozen candidate and confirmed handover visualization plan.
   No modules. No fetch. No runtime randomization.
*/

window.MISSION_BOS_HANDOVER_VISUALIZATION_PLAN = {
  "schemaVersion": "2.0",
  "project": "Mission BOS – Connected Response",
  "buildBase": "009N.4 PASSED",
  "phase": "009N.5 Realistic Handover Decision Visualization",
  "sourceBuild": "Mission-BOS-Build-009N.4",
  "sourceFiles": {
    "city-layout-recovery.js": "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17",
    "city-response-vehicle-plan.js": "484eb5908a62b4916a01ba7c7939b3fa34cb5fccf1b7e9a7a5c86c4642ba5796",
    "city-incident-response-plan.js": "ae9fb7cd3ed3b97509cb9c5e3cac8ede9febef6f435c50c43cb67ff56d1f396e",
    "city-mission-001-plan.js": "83a6c387c9f34380010de403a8afb29bb80961367eb30d411523d6c9b4fbc5ab",
    "city-mission-001-scene-plan.js": "79e9728d6b071655a6c0f3309c638fdcb5ac8f4cba01fc457828e13347390930",
    "city-cell-load-plan.js": "2fe4906a8cc720e0b7c67cd3f3c7a6771973882ace98f67a4dafda3ea86edb3d",
    "city-cell-load-controller.js": "9aa3ac1b567a8fb87ca7d69bdffd1406ac06e7aae02c43f8d2cd8a0f99534d5a",
    "city-network-association-plan.js": "4e3da70af3cb4c0a16535ab636904314970761b5d3f06e377a973f6150eb2017",
    "city-network-association-controller.js": "2bdc3907036b721b3eeaae4ef4cb876de9c73053810b2ee9cfda4baac176b587",
    "network-association-validator.js": "e51cc1a8cd518130ce7b931592c01ea337646cb74f02e08e84b5f64a78e77019",
    "city-handover-visualization-plan.js": "097bc6575e748907c9b10bae02a61a0ffa63ebed01d5e307ddac1e0a4ac9ad6e",
    "city-handover-visualization-renderer.js": "4d1101c49e7de4e1e0441f08316d9ce0bb779aa33e5db4627bce8005a4341508",
    "handover-visualization-validator.js": "a73b1c796bcf8efb362d749b456a00e109ccb13739b40130256f480c39129529",
    "city-telekom-communication-plan.js": "4af720a8b8d2d8a936ea349e86ad62bf45a0603fc9aeed3a3f4fa84e33f21fb6",
    "city-telekom-communication-renderer.js": "cef5d1ed20449a79dede5b9be6bcb3cf3bee444bad6cd03da8db67603bd063a4",
    "telekom-communication-validator.js": "57b390cab8e04778b201e3da613419285dad6534cacbbd14cca7347768174d6c",
    "city-exploration-interface-plan.js": "01174795ec829cbc17c48af38aa10f7dacdb8bfee618b8438449de3640276f82",
    "city-exploration-interface-controller.js": "fea8f2c19c5993472cbfa4308f46fccb0f904342761662cc7f8eba1338327f7b",
    "exploration-interface-validator.js": "77a14ad87f036d79469d5eabda6cb49b6cbfa31f24012ef275ee1a1f8420cbd2",
    "app.js": "30fbd6f1fcb221025dee370a0e35d26ac4256603ff11f08d1455be735ca1eb17",
    "index.html": "27837f92aa57577dceff9fdfd979a762ec3d8b552d27b62913683482df40914a",
    "style.css": "1ee6f0203afec169491f146e2f265e00ab4e63072994f162f27229ca2458bc1b"
  },
  "policy": {
    "visualizationOnly": true,
    "cityGeometryChangesAllowed": false,
    "staticPropChangesAllowed": false,
    "trafficChangesAllowed": false,
    "pedestrianChangesAllowed": false,
    "responseVehicleChangesAllowed": false,
    "missionStateChangesAllowed": false,
    "associationAlgorithmChangesAllowed": true,
    "cellLoadValuesChangesAllowed": false,
    "automaticBOSActivationAllowed": false,
    "automaticCameraMovementAllowed": false,
    "newPhysicalActorsAllowed": false,
    "inventedIndividualNetworkEndpointsAllowed": false,
    "fixedServingTowerAllowed": false,
    "fullRadioPlanningClaimed": false,
    "visualizationIsSimplifiedAndSymbolic": true,
    "rightDashboardMustRemain": true,
    "newStandalonePanelAllowed": false,
    "fileProtocolRequired": true,
    "runtimeRandomization": false
  },
  "handoverVisualization": {
    "eventSource": "MissionBosNetworkAssociationController.getHandoverHistory",
    "trackedEndpointIds": [
      "NET_FIRE_01",
      "NET_POLICE_01"
    ],
    "crossFadeSeconds": 0.9,
    "towerPulseSeconds": 1.25,
    "dashboardEmphasisSeconds": 1.8,
    "maxConcurrentEffects": 2,
    "consumeEachEventOnce": true,
    "clearEffectsOnMissionReset": true,
    "oldServingLink": {
      "visible": true,
      "startOpacity": 0.68,
      "endOpacity": 0,
      "color": "#ffb347"
    },
    "newServingLink": {
      "usesExistingValidatedCommunicationLink": true,
      "startEmphasis": 0.35,
      "endEmphasis": 1,
      "color": "#00d4ff"
    },
    "towerTransitionPulse": {
      "oldTowerColor": "#ffb347",
      "newTowerColor": "#e20074",
      "oldTowerFades": true,
      "newTowerBuilds": true
    },
    "expectedSequences": [
      {
        "id": "FIRE_OUTBOUND_REFERENCE",
        "endpointId": "NET_FIRE_01",
        "routeId": "FIRE_INCIDENT_ACCESS_ROUTE",
        "direction": "outbound",
        "loadState": "ENROUTE",
        "expectedSequence": [
          "MAST_D",
          "MAST_B",
          "MAST_A"
        ],
        "expectedConfirmedHandovers": 2
      },
      {
        "id": "FIRE_RETURN_REFERENCE",
        "endpointId": "NET_FIRE_01",
        "routeId": "FIRE_INCIDENT_ACCESS_ROUTE",
        "direction": "return",
        "loadState": "OVERLOADED",
        "expectedSequence": [
          "MAST_A",
          "MAST_B",
          "MAST_D"
        ],
        "expectedConfirmedHandovers": 2
      },
      {
        "id": "POLICE_OUTBOUND_REFERENCE",
        "endpointId": "NET_POLICE_01",
        "routeId": "POLICE_INCIDENT_ACCESS_ROUTE",
        "direction": "outbound",
        "loadState": "ENROUTE",
        "expectedSequence": [
          "MAST_D",
          "MAST_B",
          "MAST_A"
        ],
        "expectedConfirmedHandovers": 2
      },
      {
        "id": "POLICE_RETURN_REFERENCE",
        "endpointId": "NET_POLICE_01",
        "routeId": "POLICE_INCIDENT_ACCESS_ROUTE",
        "direction": "return",
        "loadState": "OVERLOADED",
        "expectedSequence": [
          "MAST_A",
          "MAST_B",
          "MAST_D"
        ],
        "expectedConfirmedHandovers": 2
      }
    ],
    "candidateSource": "MissionBosNetworkAssociationController.getCandidateState"
  },
  "ambientCivilianLoadVisualization": {
    "enabled": true,
    "source": "MissionBosCellLoadController",
    "towerIds": [
      "MAST_A",
      "MAST_B",
      "MAST_C",
      "MAST_D",
      "MAST_E"
    ],
    "meaning": "Aggregierte lokale zivile Umfeldlast; keine zusätzlichen individuell modellierten Endgeräte.",
    "fixedParticlesPerTower": 12,
    "totalParticleMeshes": 60,
    "visibleParticlesByStatus": {
      "NORMAL": 4,
      "HIGH_LOAD": 8,
      "OVERLOADED": 12,
      "FAILED": 0
    },
    "deterministicPlacement": true,
    "particleMotion": "deterministic-orbit-and-uplink",
    "radiusMin": 2.4,
    "radiusMax": 5.2,
    "heightMin": 1,
    "heightMax": 4.8,
    "normalColor": "#55c7ff",
    "highLoadColor": "#ffc15c",
    "overloadedColor": "#ff5c5c",
    "priorityColor": "#e20074",
    "civilianLoadMustRemainVisibleAfterBOS": true,
    "noLinesToInventedEndpoints": true,
    "missionPeakOverloadedTowerIds": [
      "MAST_A",
      "MAST_B"
    ]
  },
  "priorityStory": {
    "bosEndpointIds": [
      "NET_FIRE_01",
      "NET_POLICE_01"
    ],
    "incidentServingTowerId": "MAST_A",
    "incidentServingTowerMustBeOverloaded": true,
    "spectatorPhoneServingTowerId": null,
    "visibleSpectatorPhoneCount": 6,
    "explanation": "Feuerwehr und Polizei teilen MAST_A mit zwei sichtbaren Zuschauer-Smartphones und zusätzlicher aggregierter ziviler Umfeldlast. Vier weitere sichtbare Smartphones nutzen MAST_B. Beide Zellen bleiben bei Überlast sichtbar belastet.",
    "priorityFollowsCurrentServingCell": true,
    "civilianLoadReductionAfterBOS": 0,
    "showBOSStableWhileCivilianLoadRemainsHigh": true,
    "visibleCivilianEndpointsAtIncidentServingTower": 2,
    "visibleCivilianEndpointsAtSecondaryTower": 4
  },
  "visibilityPolicy": {
    "READY": {
      "handoverEffects": false,
      "ambientLoadFields": true
    },
    "CALL_RECEIVED": {
      "handoverEffects": false,
      "ambientLoadFields": true
    },
    "CLEARING_CORRIDOR": {
      "handoverEffects": false,
      "ambientLoadFields": true
    },
    "DISPATCHING": {
      "handoverEffects": false,
      "ambientLoadFields": true
    },
    "ENROUTE": {
      "handoverEffects": true,
      "ambientLoadFields": true
    },
    "ON_SCENE": {
      "handoverEffects": true,
      "ambientLoadFields": true
    },
    "OVERLOADED": {
      "handoverEffects": true,
      "ambientLoadFields": true
    },
    "BOS_ACTIVE": {
      "handoverEffects": true,
      "ambientLoadFields": true
    },
    "COMMS_STABLE": {
      "handoverEffects": true,
      "ambientLoadFields": true
    },
    "COMPLETED": {
      "handoverEffects": true,
      "ambientLoadFields": true
    },
    "RETURNING": {
      "handoverEffects": true,
      "ambientLoadFields": true
    },
    "FAILED": {
      "handoverEffects": false,
      "ambientLoadFields": false
    }
  },
  "dashboard": {
    "placement": "inside-existing-right-dashboard",
    "reuseExistingLastHandoverField": true,
    "newStandalonePanelAllowed": false,
    "dashboardRedesignAllowed": false,
    "compactEventEmphasisAllowed": true,
    "symbolicHint": "Linien = sichtbare Geräte · Lastfeld = zusätzliche lokale Umfeldlast.",
    "permanentNewExplanationBlocksAllowed": false
  },
  "renderManifest": {
    "handoverEffectSlots": 2,
    "ambientCellFields": 5,
    "ambientParticleMeshes": 60,
    "newPhysicalActors": 0,
    "newIndividualNetworkEndpoints": 0,
    "newStandalonePanels": 0
  },
  "expectedCounts": {
    "trackedEndpoints": 2,
    "sequenceDefinitions": 4,
    "outboundSequences": 2,
    "returnSequences": 2,
    "ambientCellFields": 5,
    "ambientParticleMeshes": 60,
    "missionPeakOverloadedCells": 2,
    "visibleSpectatorPhones": 6,
    "bosEndpointsAtOverloadedIncidentCell": 2,
    "fixedServingTowerDefinitions": 0,
    "automaticBOSActivations": 0,
    "automaticCameraMovements": 0,
    "newStandalonePanels": 0,
    "newPhysicalActors": 0,
    "newIndividualNetworkEndpoints": 0,
    "candidateEffectSlots": 2,
    "sharedCellVisibleCivilianEndpoints": 2,
    "secondaryCellVisibleCivilianEndpoints": 4,
    "confirmedHandoverEventsPerFullMissionCycle": 8
  },
  "decisionVisualization": {
    "candidateSource": "MissionBosNetworkAssociationController.getCandidateState",
    "confirmedEventSource": "MissionBosNetworkAssociationController.getHandoverHistory",
    "candidateIsNotConfirmedHandover": true,
    "candidateLine": {
      "visibleAfterProgress": 0.25,
      "maximumOpacity": 0.32,
      "style": "thin-dashed-pulse",
      "color": "#9bdfff",
      "mustDisappearIfCandidateResets": true
    },
    "servingLineDuringCandidate": {
      "remainsPrimary": true,
      "minimumOpacity": 0.82
    },
    "confirmedTransition": {
      "oldLinkFadeSeconds": 0.9,
      "newLinkBuildSeconds": 0.9,
      "towerPulseSeconds": 1.25,
      "dashboardEmphasisSeconds": 1.8,
      "dashboardUpdatesOnlyAfterConfirmation": true
    },
    "noDualFullStrengthLinks": true,
    "clearAllCandidateVisualsOnReset": true
  }
};
