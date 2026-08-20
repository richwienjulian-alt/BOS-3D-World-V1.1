/* Mission BOS - Build 009N.5
   Frozen deterministic realistic association and handover calibration plan.
   No modules. No fetch. No runtime randomization.
*/

window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN = {
  "schemaVersion": "2.0",
  "project": "Mission BOS – Connected Response",
  "buildBase": "009N.4 PASSED",
  "phase": "009N.5 Realistic Association, Handover & Same-Cell Calibration",
  "sourceRelease": "Mission-BOS-Build-009N.4",
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
    "runtimeRandomization": false,
    "cityGeometryChangesAllowed": false,
    "staticPropChangesAllowed": false,
    "trafficRouteChangesAllowed": false,
    "pedestrianRouteChangesAllowed": false,
    "responseRouteChangesAllowed": false,
    "missionStateChangesAllowed": false,
    "networkLoadChangesAllowedInThisBuild": false,
    "fixedServingTowerAllowed": false,
    "automaticBOSActivationAllowed": false,
    "automaticCameraMovementAllowed": false,
    "towerOutageSimulationAllowedInThisBuild": false,
    "fullRadioPlanningClaimed": false,
    "visualizationIsSimplifiedAndSymbolic": true,
    "rightDashboardMustRemain": true,
    "dashboardRedesignAllowed": false,
    "fileProtocolRequired": true,
    "localCellLoadRequired": true,
    "globalMissionLoadControllerChangesAllowed": false,
    "associationAlgorithmChangesAllowedInThisBuild": true,
    "handoverVisualizationChangesAllowedInThisBuild": true,
    "sameCellCalibrationRequired": true,
    "endpointSpecificTowerBiasAllowed": false,
    "missionStateForcedTowerAllowed": false,
    "hardCodedHandoverCoordinatesAllowed": false,
    "capacityDeprioritizationChangesAllowedInThisBuild": false
  },
  "selectionModel": {
    "id": "SIMPLIFIED_RADIO_HANDOVER_V3",
    "label": "Beste verfügbare Funkzelle mit vereinfachtem Funkmodell und zustandsbehaftetem Handover",
    "distanceMetric": "euclidean-xz",
    "availabilityMode": "binary",
    "localCellLoadProvider": "MissionBosCellLoadController",
    "radioModelProvider": "MissionBosNetworkRadioModel",
    "referenceScore": 0,
    "referenceDistance": 1,
    "pathLossExponent": 2.05,
    "localCellLoadPenaltyPerPercent": 0.015,
    "maxServiceDistance": 90,
    "evaluationIntervalSeconds": 0.25,
    "initialAttach": "immediate-best-radio-score",
    "tieBreak": "tower-id-ascending",
    "noServicePolicy": "UNSERVED",
    "handoverMargin": 1.2,
    "timeToTriggerSeconds": 0.75,
    "minimumDwellSeconds": 3.0,
    "candidateResetBelowMargin": true,
    "candidateMustRemainSameTower": true,
    "confirmedEventOnlyAfterTimeToTrigger": true,
    "scoreUnit": "relative-radio-score-not-dBm",
    "description": "Deterministisches vereinfachtes Funkmodell. Entfernung bleibt der wichtigste Faktor; standortspezifische Kalibrierung bildet symbolisch Antennenausrichtung und urbane Ausbreitung ab. Ein Handover wird erst nach Margin, Time-to-Trigger und Mindesthaltezeit bestätigt."
  },
  "towers": [
    {
      "id": "CELL_A",
      "referenceId": "MAST_A",
      "label": "Funkzelle Wohngebiet",
      "available": true,
      "siteCalibrationOffset": 0.9,
      "coverageInfluences": [
        {
          "id": "A_EAST_RESIDENTIAL_OVERLAP",
          "type": "ellipse",
          "center": {
            "x": -17,
            "z": 35
          },
          "radiusX": 34,
          "radiusZ": 16,
          "peakGain": 1.2,
          "meaning": "Vereinfachter ostgerichteter Versorgungsanteil und urbane Ausbreitung im Übergang Wohngebiet/Innenstadt."
        }
      ]
    },
    {
      "id": "CELL_B",
      "referenceId": "MAST_B",
      "label": "Funkzelle Innenstadt",
      "available": true,
      "siteCalibrationOffset": 0.1,
      "coverageInfluences": [
        {
          "id": "B_DOWNTOWN_BOULEVARD",
          "type": "ellipse",
          "center": {
            "x": -17,
            "z": 10
          },
          "radiusX": 12,
          "radiusZ": 32,
          "peakGain": 2.6,
          "meaning": "Vereinfachter Versorgungsanteil entlang Innenstadt und BOS-Boulevard."
        }
      ]
    },
    {
      "id": "CELL_C",
      "referenceId": "MAST_C",
      "label": "Funkzelle Gesundheit",
      "available": true,
      "siteCalibrationOffset": 0.0,
      "coverageInfluences": []
    },
    {
      "id": "CELL_D",
      "referenceId": "MAST_D",
      "label": "Funkzelle BOS-Campus",
      "available": true,
      "siteCalibrationOffset": 0.15,
      "coverageInfluences": [
        {
          "id": "D_BOS_CAMPUS",
          "type": "ellipse",
          "center": {
            "x": -25,
            "z": -18
          },
          "radiusX": 22,
          "radiusZ": 25,
          "peakGain": 0.2,
          "meaning": "Vereinfachte lokale Versorgung des BOS-Campus."
        }
      ]
    },
    {
      "id": "CELL_E",
      "referenceId": "MAST_E",
      "label": "Funkzelle Arena",
      "available": true,
      "siteCalibrationOffset": 0.0,
      "coverageInfluences": []
    }
  ],
  "mobileEndpoints": [
    {
      "id": "NET_FIRE_01",
      "kind": "response-vehicle",
      "referenceId": "RESPONSE_FIRE_01",
      "label": "Feuerwehr",
      "channel": "BOS",
      "active": true
    },
    {
      "id": "NET_POLICE_01",
      "kind": "response-vehicle",
      "referenceId": "RESPONSE_POLICE_01",
      "label": "Polizei",
      "channel": "BOS",
      "active": true
    },
    {
      "id": "NET_PHONE_01",
      "kind": "mission-phone",
      "referenceId": "MISSION_SPECTATOR_01",
      "label": "Zuschauer-Smartphone 1",
      "channel": "CIVILIAN",
      "activeStates": [
        "ON_SCENE",
        "OVERLOADED",
        "BOS_ACTIVE",
        "COMMS_STABLE",
        "COMPLETED"
      ]
    },
    {
      "id": "NET_PHONE_02",
      "kind": "mission-phone",
      "referenceId": "MISSION_SPECTATOR_02",
      "label": "Zuschauer-Smartphone 2",
      "channel": "CIVILIAN",
      "activeStates": [
        "ON_SCENE",
        "OVERLOADED",
        "BOS_ACTIVE",
        "COMMS_STABLE",
        "COMPLETED"
      ]
    },
    {
      "id": "NET_PHONE_03",
      "kind": "mission-phone",
      "referenceId": "MISSION_SPECTATOR_03",
      "label": "Zuschauer-Smartphone 3",
      "channel": "CIVILIAN",
      "activeStates": [
        "ON_SCENE",
        "OVERLOADED",
        "BOS_ACTIVE",
        "COMMS_STABLE",
        "COMPLETED"
      ]
    },
    {
      "id": "NET_PHONE_04",
      "kind": "mission-phone",
      "referenceId": "MISSION_SPECTATOR_04",
      "label": "Zuschauer-Smartphone 4",
      "channel": "CIVILIAN",
      "activeStates": [
        "ON_SCENE",
        "OVERLOADED",
        "BOS_ACTIVE",
        "COMMS_STABLE",
        "COMPLETED"
      ]
    },
    {
      "id": "NET_PHONE_05",
      "kind": "mission-phone",
      "referenceId": "MISSION_SPECTATOR_05",
      "label": "Zuschauer-Smartphone 5",
      "channel": "CIVILIAN",
      "activeStates": [
        "ON_SCENE",
        "OVERLOADED",
        "BOS_ACTIVE",
        "COMMS_STABLE",
        "COMPLETED"
      ]
    },
    {
      "id": "NET_PHONE_06",
      "kind": "mission-phone",
      "referenceId": "MISSION_SPECTATOR_06",
      "label": "Zuschauer-Smartphone 6",
      "channel": "CIVILIAN",
      "activeStates": [
        "ON_SCENE",
        "OVERLOADED",
        "BOS_ACTIVE",
        "COMMS_STABLE",
        "COMPLETED"
      ]
    }
  ],
  "communicationIntegration": {
    "fixedTowerEndpointMustBeRemoved": true,
    "allFiveTowerPositionsMustBeResolvable": true,
    "dispatchBuildingId": "B01",
    "responseLinksFollowServingTower": true,
    "phoneLinksFollowServingTower": true,
    "handoverVisualPolishDeferredTo": "009N.3 Communication & Handover Visualization",
    "localCellLoadDeferredTo": null,
    "legacyServingTowerIdMayExistOnlyAsDocumentedFallback": false,
    "localCellLoadRuntimeRequired": true,
    "bosPriorityFollowsServingCell": true,
    "radioModelProviderRequired": "MissionBosNetworkRadioModel",
    "candidateStateMayBeVisualized": true,
    "confirmedHandoverOnlyUpdatesDashboard": true,
    "sameCellCivilianAndBosRequiredAtIncident": true
  },
  "dashboardPolicy": {
    "preserveExistingRightDashboard": true,
    "compactExistingSectionsOnlyWhenExplicitlyRequested": false,
    "newStandaloneDemoBoardAllowed": false,
    "futureExplorationBoardPlacement": "inside-existing-right-dashboard",
    "requiredDynamicFields": [
      "fire-serving-cell",
      "police-serving-cell",
      "last-handover",
      "cell-load",
      "cell-status",
      "bos-priority",
      "handover-candidate-status"
    ]
  },
  "expectedCounts": {
    "towers": 5,
    "mobileEndpoints": 8,
    "responseVehicleEndpoints": 2,
    "missionPhoneEndpoints": 6,
    "staticReferenceScenarios": 6,
    "routeExpectations": 4,
    "expectedOutboundHandoversPerVehicle": 2,
    "expectedReturnHandoversPerVehicle": 2,
    "fixedServingTowerDefinitions": 0,
    "localCellLoadProviders": 1,
    "referenceRouteScenarios": 4,
    "referenceIncidentAssignments": 8,
    "sharedIncidentBosEndpoints": 2,
    "sharedIncidentCivilianEndpoints": 2
  },
  "referenceCalibration": {
    "runtimeEnforcement": false,
    "purpose": "Validator-only calibration of the shared generic radio model; no mission code may force these assignments.",
    "routeScenarios": [
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
    "incidentAssignments": {
      "NET_FIRE_01": "MAST_A",
      "NET_POLICE_01": "MAST_A",
      "NET_PHONE_01": "MAST_A",
      "NET_PHONE_02": "MAST_A",
      "NET_PHONE_03": "MAST_B",
      "NET_PHONE_04": "MAST_B",
      "NET_PHONE_05": "MAST_B",
      "NET_PHONE_06": "MAST_B"
    },
    "sharedCellRequirements": {
      "incidentBosCellId": "MAST_A",
      "minimumBosEndpointsAtCell": 2,
      "minimumVisibleCivilianEndpointsAtSameCell": 2,
      "secondaryCivilianCellId": "MAST_B",
      "minimumVisibleCivilianEndpointsAtSecondaryCell": 2,
      "bothCellsMustBeOverloadedInState": "OVERLOADED"
    },
    "stationaryStability": {
      "holdSeconds": 30,
      "maximumConfirmedHandoversPerEndpoint": 0,
      "testStates": [
        "OVERLOADED",
        "BOS_ACTIVE",
        "COMMS_STABLE"
      ]
    }
  }
};
