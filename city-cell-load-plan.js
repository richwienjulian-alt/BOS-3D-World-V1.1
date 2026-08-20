/* Mission BOS - Build 010P.4
   Frozen deterministic local cell-load plan.
   No modules. No fetch. No runtime randomization.
*/

window.MISSION_BOS_CELL_LOAD_PLAN = {
  "schemaVersion": "1.0",
  "project": "Mission BOS – Connected Response",
  "buildBase": "010P.3 PASSED",
  "phase": "009N.5 Local Cell Load Compatibility",
  "dualMissionPhase": "010P.4 Dual-Mission Local Cell Load Compatibility",
  "sourceBuild": "Mission-BOS-Build-009N.1",
  "sourceFiles": {
    "city-layout-recovery.js": "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17",
    "city-mission-001-plan.js": "83a6c387c9f34380010de403a8afb29bb80961367eb30d411523d6c9b4fbc5ab",
    "city-mission-001-scene-plan.js": "79e9728d6b071655a6c0f3309c638fdcb5ac8f4cba01fc457828e13347390930",
    "city-incident-response-plan.js": "ae9fb7cd3ed3b97509cb9c5e3cac8ede9febef6f435c50c43cb67ff56d1f396e",
    "city-network-association-plan.js": "0262ba161b03e17bf2ad4cf652bfec6e7325908ce383b13a9eeba1fe0e1800b0",
    "city-network-association-controller.js": "c69fcf60d7b7a77ffc92a16729cbb806a71784316817ec1fbe06e38e6f0fe43f",
    "network-association-validator.js": "5d66847462a158f5adaf23955cfc2c6f905f01e7f693b07cb937cc0995ca5c2a",
    "city-telekom-communication-plan.js": "c46b27c506d78e1cad3e5089b18cf983b16f8714298dbd969bedbaa2f61b70c9",
    "city-telekom-communication-renderer.js": "c31c351ed09849771bad56e107915acbcf1b839b4151634fe1038781b1d8ff7e",
    "telekom-communication-validator.js": "1db37f02ef281a7cd8989a8b42ab215abd91259e16a64d81ba6a5f1b8b504d63",
    "app.js": "f1ea0342fcb8ae378b527d7d27bf04167e5676a99d26b787b66bfacfd89d26fe",
    "index.html": "00e4cb1873e6744cb59ff0eccd25c877ae37a7072ed0c739ce385b8e676eb821",
    "style.css": "f20320d87097bf39dd3f3b1d689a2ee559a796619c74773531a226aa46019557"
  },
  "policy": {
    "runtimeRandomization": false,
    "cityGeometryChangesAllowed": false,
    "staticPropChangesAllowed": false,
    "trafficRouteChangesAllowed": false,
    "pedestrianRouteChangesAllowed": false,
    "responseRouteChangesAllowed": false,
    "missionStateChangesAllowed": false,
    "globalMissionLoadControllerChangesAllowed": false,
    "localCellLoadLayerRequired": true,
    "localCellLoadMayInfluenceAssociation": true,
    "civilianLoadMayDropAfterBOSActivation": false,
    "automaticBOSActivationAllowed": false,
    "towerOutageSimulationAllowedInThisBuild": false,
    "fullRadioPlanningClaimed": false,
    "visualizationIsSimplifiedAndSymbolic": true,
    "rightDashboardMustRemain": true,
    "newStandaloneDashboardAllowed": false,
    "fileProtocolRequired": true
  },
  "loadModel": {
    "id": "DETERMINISTIC_LOCAL_CELL_LOAD_V1",
    "rangeMin": 0,
    "rangeMax": 100,
    "normalBelow": 55,
    "highLoadBelow": 90,
    "overloadedAtOrAbove": 90,
    "riseRatePerSecond": 10,
    "fallRatePerSecond": 12,
    "evaluationIntervalSeconds": 0.1,
    "aggregateDisplayPolicy": "existing-global-load-remains-primary",
    "criticalCellPolicy": "highest-current-civilian-load",
    "stateInterpolation": "base-to-state-target-using-current-global-load",
    "returnInterpolation": "peak-to-base-using-current-global-load",
    "description": "Deterministische lokale Auslastung je Funkzelle. Der bestehende globale Lastwert bleibt zur Missionssteuerung unverändert."
  },
  "cells": [
    {
      "id": "CELL_A",
      "towerId": "MAST_A",
      "label": "Wohngebiet",
      "baseLoad": 34
    },
    {
      "id": "CELL_B",
      "towerId": "MAST_B",
      "label": "Innenstadt",
      "baseLoad": 42
    },
    {
      "id": "CELL_C",
      "towerId": "MAST_C",
      "label": "Gesundheit",
      "baseLoad": 28
    },
    {
      "id": "CELL_D",
      "towerId": "MAST_D",
      "label": "BOS-Campus",
      "baseLoad": 36
    },
    {
      "id": "CELL_E",
      "towerId": "MAST_E",
      "label": "Arena",
      "baseLoad": 30
    }
  ],
  "manualLoadProfile": {
    "activationAboveGlobalLoad": 44,
    "referenceGlobalBase": 38,
    "referenceGlobalPeak": 98,
    "peakTargets": {
      "MAST_A": 86,
      "MAST_B": 98,
      "MAST_C": 80,
      "MAST_D": 88,
      "MAST_E": 83
    },
    "description": "Bei manueller Netzlastsimulation entstehen unterschiedliche lokale Auslastungen; MAST_B bleibt der stärkste zivile Hotspot."
  },
  "missionStateProfiles": [
    {
      "stateId": "READY",
      "expectedGlobalLoad": 38,
      "mode": "mission-state",
      "targets": {
        "MAST_A": 34,
        "MAST_B": 42,
        "MAST_C": 28,
        "MAST_D": 36,
        "MAST_E": 30
      }
    },
    {
      "stateId": "CALL_RECEIVED",
      "expectedGlobalLoad": 42,
      "mode": "mission-state",
      "targets": {
        "MAST_A": 35,
        "MAST_B": 44,
        "MAST_C": 28,
        "MAST_D": 40,
        "MAST_E": 30
      }
    },
    {
      "stateId": "CLEARING_CORRIDOR",
      "expectedGlobalLoad": 48,
      "mode": "mission-state",
      "targets": {
        "MAST_A": 36,
        "MAST_B": 46,
        "MAST_C": 28,
        "MAST_D": 48,
        "MAST_E": 30
      }
    },
    {
      "stateId": "DISPATCHING",
      "expectedGlobalLoad": 55,
      "mode": "mission-state",
      "targets": {
        "MAST_A": 40,
        "MAST_B": 52,
        "MAST_C": 29,
        "MAST_D": 56,
        "MAST_E": 31
      }
    },
    {
      "stateId": "ENROUTE",
      "expectedGlobalLoad": 70,
      "mode": "mission-state",
      "targets": {
        "MAST_A": 55,
        "MAST_B": 68,
        "MAST_C": 30,
        "MAST_D": 62,
        "MAST_E": 32
      }
    },
    {
      "stateId": "ON_SCENE",
      "expectedGlobalLoad": 84,
      "mode": "mission-state",
      "targets": {
        "MAST_A": 78,
        "MAST_B": 86,
        "MAST_C": 31,
        "MAST_D": 50,
        "MAST_E": 33
      }
    },
    {
      "stateId": "OVERLOADED",
      "expectedGlobalLoad": 96,
      "mode": "mission-state",
      "targets": {
        "MAST_A": 92,
        "MAST_B": 96,
        "MAST_C": 32,
        "MAST_D": 44,
        "MAST_E": 34
      }
    },
    {
      "stateId": "BOS_ACTIVE",
      "expectedGlobalLoad": 96,
      "mode": "mission-state",
      "targets": {
        "MAST_A": 92,
        "MAST_B": 96,
        "MAST_C": 32,
        "MAST_D": 44,
        "MAST_E": 34
      }
    },
    {
      "stateId": "COMMS_STABLE",
      "expectedGlobalLoad": 96,
      "mode": "mission-state",
      "targets": {
        "MAST_A": 92,
        "MAST_B": 96,
        "MAST_C": 32,
        "MAST_D": 44,
        "MAST_E": 34
      }
    },
    {
      "stateId": "COMPLETED",
      "expectedGlobalLoad": 96,
      "mode": "mission-state",
      "targets": {
        "MAST_A": 92,
        "MAST_B": 96,
        "MAST_C": 32,
        "MAST_D": 44,
        "MAST_E": 34
      }
    },
    {
      "stateId": "RETURNING",
      "expectedGlobalLoad": 70,
      "mode": "recovering",
      "targets": {
        "MAST_A": 92,
        "MAST_B": 96,
        "MAST_C": 32,
        "MAST_D": 44,
        "MAST_E": 34
      }
    },
    {
      "stateId": "FAILED",
      "expectedGlobalLoad": 38,
      "mode": "failed-baseline",
      "targets": {
        "MAST_A": 34,
        "MAST_B": 42,
        "MAST_C": 28,
        "MAST_D": 36,
        "MAST_E": 30
      }
    }
  ],
  "bosPriority": {
    "activationSource": "existing-network-manager-bos-state",
    "eligibleAssociationEndpointIds": [
      "NET_FIRE_01",
      "NET_POLICE_01",
      "NET_AMBULANCE_01"
    ],
    "followsCurrentServingCell": true,
    "priorityCellsAreDerivedAtRuntime": true,
    "civilianLoadReduction": 0,
    "loadValuesRemainUnchangedInStates": [
      "OVERLOADED",
      "BOS_ACTIVE",
      "COMMS_STABLE",
      "COMPLETED"
    ],
    "priorityDoesNotCreateAdditionalCapacityClaim": true,
    "description": "BOS-Priorität wird an den aktuell bedienenden Funkzellen der BOS-Endpunkte sichtbar. Die zivile Zelllast bleibt unverändert."
  },
  "associationIntegration": {
    "requiredSelectionModelId": "SIMPLIFIED_RADIO_HANDOVER_V3",
    "localCellLoadPenaltyPerPercent": 0.015,
    "radioModelProvider": "MissionBosNetworkRadioModel",
    "scoreFormula": "referenceScore - logDistancePathLoss - localCellLoad * localCellLoadPenaltyPerPercent + siteCalibrationOffset + spatialPropagationInfluence",
    "loadProviderGlobal": "MissionBosCellLoadController",
    "expectedOutboundSequence": [
      "MAST_D",
      "MAST_B",
      "MAST_A"
    ],
    "expectedReturnSequence": [
      "MAST_A",
      "MAST_B",
      "MAST_D"
    ],
    "expectedIncidentAssignments": {
      "NET_FIRE_01": "MAST_A",
      "NET_POLICE_01": "MAST_A",
      "NET_PHONE_01": "MAST_A",
      "NET_PHONE_02": "MAST_A",
      "NET_PHONE_03": "MAST_B",
      "NET_PHONE_04": "MAST_B",
      "NET_PHONE_05": "MAST_B",
      "NET_PHONE_06": "MAST_B"
    }
  },
  "visualization": {
    "towerHalosReflectLocalLoad": true,
    "priorityRingForActiveBosCells": true,
    "normalColor": "#55c7ff",
    "highLoadColor": "#ffc15c",
    "overloadedColor": "#ff5c5c",
    "bosPriorityColor": "#e20074",
    "noNewWorldGeometry": true,
    "noPermanentAllConnectionOverlay": true
  },
  "dashboard": {
    "placement": "inside-existing-right-dashboard",
    "sectionTitle": "Funkzellen-Auslastung",
    "rows": [
      "MAST_A",
      "MAST_B",
      "MAST_C",
      "MAST_D",
      "MAST_E"
    ],
    "showPercent": true,
    "showStatus": true,
    "showBosPriorityBadge": true,
    "showCriticalCell": true,
    "preserveExistingGlobalLoadMeter": true,
    "preserveExistingAssociationRows": true,
    "newStandalonePanelAllowed": false
  },
  "expectedCounts": {
    "cells": 5,
    "missionStateProfiles": 12,
    "manualProfileCells": 5,
    "priorityEligibleEndpoints": 3,
    "overloadedCellsAtMissionPeak": 2,
    "dashboardRows": 5,
    "automaticBOSActivations": 0,
    "towerOutages": 0,
    "civilianLoadReductionsAfterBOS": 0
  }
};
