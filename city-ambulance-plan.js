/* Mission BOS - Build 010P.2
   Validated Ambulance Foundation plan.
   Copy unchanged into the build. No modules. No fetch.
*/
(function () {
  "use strict";
  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }
  window.MISSION_BOS_AMBULANCE_PLAN = deepFreeze({
  "schemaVersion": "1.0.0",
  "project": "Mission BOS – Connected Response",
  "buildBase": "010P.1 PASSED",
  "phase": "010P.2 Validated Ambulance Foundation",
  "sourceBuild": "Mission-BOS-Build-010P.1",
  "sourceFiles": [
    {
      "name": "city-layout-recovery.js",
      "sha256": "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17"
    },
    {
      "name": "city-static-props-plan.js",
      "sha256": "e31ad502cf411bd586dad47d2e5c00f7e845ee2be0422d8c1966cd7b07ca96f8"
    },
    {
      "name": "city-traffic-plan.js",
      "sha256": "617b4ffa560859e0a11e54b009e159f34b73b71f7201617f92a1611568b54a65"
    },
    {
      "name": "city-pedestrian-plan.js",
      "sha256": "ca979d6b379bb7d8c3fc3a0f522617f4029a296333680b10fb2c2301cb8a44b7"
    },
    {
      "name": "city-network-association-plan.js",
      "sha256": "dea2e31b8bbc8f820d65c8d2f4a181c9a6afc83bd50a47b98adf70257f286dc4"
    },
    {
      "name": "city-network-radio-model.js",
      "sha256": "d41607faa2c1d36419f070033f727376b2a8445bd9c93c35abc5148071142294"
    },
    {
      "name": "city-cell-load-plan.js",
      "sha256": "73d5b8b36673bad5d8f998b146710a44d17fccd9d3f938326df30325828d0524"
    },
    {
      "name": "city-mission-registry-plan.js",
      "sha256": "911dc8e8a2703ebc5de5c7d5c8380e2667e6be7b274db487abbae9c7f06e0c10"
    },
    {
      "name": "city-mission-001-plan.js",
      "sha256": "83a6c387c9f34380010de403a8afb29bb80961367eb30d411523d6c9b4fbc5ab"
    }
  ],
  "policy": {
    "runtimeRandomization": false,
    "fileProtocolRequired": true,
    "cityGeometryChangesAllowed": false,
    "staticPropChangesAllowed": false,
    "civilianTrafficRouteChangesAllowed": false,
    "pedestrianRouteChangesAllowed": false,
    "mission001ChangesAllowed": false,
    "mission002RuntimeAllowed": false,
    "mission002SceneAllowed": false,
    "arenaCrowdAllowed": false,
    "arenaLoadProfileAllowed": false,
    "automaticMissionStartAllowed": false,
    "automaticBOSActivationAllowed": false,
    "fixedServingTowerAllowed": false,
    "sharedRadioModelRequired": true,
    "networkBaselineControllerMayBeRewritten": false,
    "existingResponseVehicleRuntimeMayBeModified": false,
    "singleAmbulanceOnly": true,
    "controlledYieldRequired": true,
    "newStandaloneDashboardAllowed": false,
    "rightDashboardMustRemain": true,
    "ambulanceTestControlTemporary": true
  },
  "simulation": {
    "maxDeltaSeconds": 0.05,
    "vehicleY": 0.42,
    "routeSampleStep": 0.05,
    "footprintLengthSamples": 11,
    "footprintWidthSamples": 7,
    "collisionSafetyMargin": 0.05,
    "runtimeSafetyCheckInterval": 0.2,
    "turnSmoothing": 10,
    "blueLightFlashHz": 4.5
  },
  "references": {
    "stationBuildingId": "G02",
    "hospitalBuildingId": "G01",
    "arenaBuildingId": "E01",
    "primaryRoadSurfaceId": "KLINIKALLEE",
    "arenaForecourtId": "ARENA_FORECOURT",
    "hospitalForecourtId": "HOSPITAL_FORECOURT"
  },
  "accessSurfaces": [
    {
      "id": "EMS_AMBULANCE_ACCESS",
      "type": "ambulance-access",
      "referenceBuildingId": "G02",
      "validationRect": {
        "x": 20.25,
        "z": 18.78,
        "width": 6.4,
        "depth": 5.4
      },
      "renderRect": {
        "x": 21.0,
        "z": 18.78,
        "width": 4.8,
        "depth": 3.2
      },
      "color": "#343b43",
      "markingColor": "#f0f3f5"
    },
    {
      "id": "ARENA_AMBULANCE_ACCESS",
      "type": "ambulance-access",
      "referenceBuildingId": "E01",
      "validationRect": {
        "x": 20.25,
        "z": -26.95,
        "width": 6.4,
        "depth": 4.2
      },
      "renderRect": {
        "x": 20.65,
        "z": -26.95,
        "width": 5.5,
        "depth": 1.8
      },
      "color": "#343b43",
      "markingColor": "#f0f3f5"
    },
    {
      "id": "HOSPITAL_AMBULANCE_ACCESS",
      "type": "ambulance-access",
      "referenceBuildingId": "G01",
      "validationRect": {
        "x": 20.25,
        "z": 29.7,
        "width": 6.4,
        "depth": 3.0
      },
      "renderRect": {
        "x": 21.0,
        "z": 29.7,
        "width": 4.8,
        "depth": 1.8
      },
      "color": "#343b43",
      "markingColor": "#f0f3f5"
    }
  ],
  "routes": [
    {
      "id": "AMBULANCE_STATION_TO_ARENA_ROUTE",
      "vehicleId": "AMBULANCE_01",
      "closed": false,
      "mode": "station-to-arena",
      "allowedSurfaceIds": [
        "EMS_AMBULANCE_ACCESS",
        "KLINIKALLEE",
        "ARENA_AMBULANCE_ACCESS",
        "ARENA_FORECOURT"
      ],
      "points": [
        {
          "x": 21.55,
          "z": 18.78
        },
        {
          "x": 19.633,
          "z": 18.78
        },
        {
          "x": 19.416,
          "z": 18.767
        },
        {
          "x": 19.225,
          "z": 18.729
        },
        {
          "x": 19.059,
          "z": 18.665
        },
        {
          "x": 18.919,
          "z": 18.576
        },
        {
          "x": 18.804,
          "z": 18.461
        },
        {
          "x": 18.715,
          "z": 18.321
        },
        {
          "x": 18.651,
          "z": 18.155
        },
        {
          "x": 18.613,
          "z": 17.964
        },
        {
          "x": 18.6,
          "z": 17.748
        },
        {
          "x": 18.6,
          "z": -25.75
        },
        {
          "x": 18.615,
          "z": -26.002
        },
        {
          "x": 18.659,
          "z": -26.224
        },
        {
          "x": 18.733,
          "z": -26.417
        },
        {
          "x": 18.837,
          "z": -26.58
        },
        {
          "x": 18.97,
          "z": -26.713
        },
        {
          "x": 19.133,
          "z": -26.817
        },
        {
          "x": 19.326,
          "z": -26.891
        },
        {
          "x": 19.548,
          "z": -26.935
        },
        {
          "x": 19.8,
          "z": -26.95
        },
        {
          "x": 45.5,
          "z": -26.95
        }
      ],
      "length": 74.734234
    },
    {
      "id": "AMBULANCE_ARENA_TO_HOSPITAL_ROUTE",
      "vehicleId": "AMBULANCE_01",
      "closed": false,
      "mode": "arena-to-hospital",
      "allowedSurfaceIds": [
        "ARENA_FORECOURT",
        "ARENA_AMBULANCE_ACCESS",
        "KLINIKALLEE",
        "HOSPITAL_AMBULANCE_ACCESS",
        "HOSPITAL_FORECOURT"
      ],
      "points": [
        {
          "x": 45.5,
          "z": -26.95
        },
        {
          "x": 19.8,
          "z": -26.95
        },
        {
          "x": 19.548,
          "z": -26.935
        },
        {
          "x": 19.326,
          "z": -26.891
        },
        {
          "x": 19.133,
          "z": -26.817
        },
        {
          "x": 18.97,
          "z": -26.713
        },
        {
          "x": 18.837,
          "z": -26.58
        },
        {
          "x": 18.733,
          "z": -26.417
        },
        {
          "x": 18.659,
          "z": -26.224
        },
        {
          "x": 18.615,
          "z": -26.002
        },
        {
          "x": 18.6,
          "z": -25.75
        },
        {
          "x": 18.6,
          "z": 28.668
        },
        {
          "x": 18.613,
          "z": 28.884
        },
        {
          "x": 18.651,
          "z": 29.075
        },
        {
          "x": 18.715,
          "z": 29.241
        },
        {
          "x": 18.804,
          "z": 29.381
        },
        {
          "x": 18.919,
          "z": 29.496
        },
        {
          "x": 19.059,
          "z": 29.585
        },
        {
          "x": 19.225,
          "z": 29.649
        },
        {
          "x": 19.416,
          "z": 29.687
        },
        {
          "x": 19.633,
          "z": 29.7
        },
        {
          "x": 21.55,
          "z": 29.7
        }
      ],
      "length": 85.654234
    },
    {
      "id": "AMBULANCE_HOSPITAL_TO_STATION_ROUTE",
      "vehicleId": "AMBULANCE_01",
      "closed": false,
      "mode": "hospital-to-station",
      "allowedSurfaceIds": [
        "HOSPITAL_AMBULANCE_ACCESS",
        "KLINIKALLEE",
        "EMS_AMBULANCE_ACCESS"
      ],
      "points": [
        {
          "x": 21.55,
          "z": 29.7
        },
        {
          "x": 19.633,
          "z": 29.7
        },
        {
          "x": 19.416,
          "z": 29.687
        },
        {
          "x": 19.225,
          "z": 29.649
        },
        {
          "x": 19.059,
          "z": 29.585
        },
        {
          "x": 18.919,
          "z": 29.496
        },
        {
          "x": 18.804,
          "z": 29.381
        },
        {
          "x": 18.715,
          "z": 29.241
        },
        {
          "x": 18.651,
          "z": 29.075
        },
        {
          "x": 18.613,
          "z": 28.884
        },
        {
          "x": 18.6,
          "z": 28.668
        },
        {
          "x": 18.6,
          "z": 19.813
        },
        {
          "x": 18.613,
          "z": 19.596
        },
        {
          "x": 18.651,
          "z": 19.405
        },
        {
          "x": 18.715,
          "z": 19.239
        },
        {
          "x": 18.804,
          "z": 19.099
        },
        {
          "x": 18.919,
          "z": 18.984
        },
        {
          "x": 19.059,
          "z": 18.895
        },
        {
          "x": 19.225,
          "z": 18.831
        },
        {
          "x": 19.416,
          "z": 18.793
        },
        {
          "x": 19.633,
          "z": 18.78
        },
        {
          "x": 21.55,
          "z": 18.78
        }
      ],
      "length": 16.037019
    }
  ],
  "vehicle": {
    "id": "AMBULANCE_01",
    "kind": "ambulance",
    "label": "Rettungswagen 01",
    "stationBuildingId": "G02",
    "bodyLength": 3.15,
    "bodyWidth": 1.1,
    "footprintLength": 3.4,
    "footprintWidth": 1.35,
    "wheelCount": 4,
    "lightbarCount": 1,
    "outboundSpeed": 5.25,
    "transportSpeed": 5.6,
    "returnSpeed": 5.25,
    "bodyColor": "#f4f6f8",
    "accentColor": "#d62828",
    "emergencyColor": "#1e90ff",
    "windowColor": "#1b2a38",
    "startPosition": {
      "x": 21.55,
      "y": 0.42,
      "z": 18.78
    },
    "startHeading": "west",
    "reflectiveColor": "#f6c945"
  },
  "yielding": {
    "required": true,
    "trafficVehicleId": "VAN_SUPPORT_01",
    "trafficRouteId": "SOUTH_SUPPORT_LOOP",
    "holdDistance": 37.44,
    "holdPointReference": {
      "x": 14.498,
      "z": -23.04
    },
    "holdUntilAmbulanceReturnsToStation": true,
    "teleportationAllowed": false,
    "releaseOnReset": true
  },
  "testSequence": {
    "mode": "manual-three-leg-foundation-test",
    "states": [
      "AT_STATION",
      "CLEARING_CORRIDOR",
      "TO_ARENA",
      "AT_ARENA",
      "TO_HOSPITAL",
      "AT_HOSPITAL",
      "RETURNING",
      "AT_STATION",
      "FAILED"
    ],
    "buttonId": "ambulance-test-button",
    "statusId": "ambulance-test-status",
    "labels": {
      "AT_STATION": "Rettungswagen testen",
      "AT_ARENA": "Transport zum Krankenhaus",
      "AT_HOSPITAL": "Rückfahrt zur Rettungswache",
      "MOVING": "Rettungswagen unterwegs"
    },
    "automaticLegTransitions": false,
    "mission002RuntimeCreated": false
  },
  "networkExtension": {
    "extensionGlobal": "MISSION_BOS_AMBULANCE_NETWORK_EXTENSION",
    "baselineBackupGlobal": "MISSION_BOS_NETWORK_ASSOCIATION_PLAN_009N7_BASELINE",
    "associationEndpointId": "NET_AMBULANCE_01",
    "kind": "response-vehicle",
    "referenceId": "AMBULANCE_01",
    "label": "Rettungsdienst",
    "channel": "BOS",
    "active": true,
    "fixedServingTowerId": null,
    "expectedReadyRouteSequences": {
      "stationToArena": [
        "MAST_B",
        "MAST_E"
      ],
      "arenaToHospital": [
        "MAST_E",
        "MAST_B",
        "MAST_C"
      ],
      "hospitalToStation": [
        "MAST_C",
        "MAST_B"
      ]
    },
    "expectedCountsAfterExtension": {
      "towers": 5,
      "mobileEndpoints": 9,
      "responseVehicleEndpoints": 3,
      "missionPhoneEndpoints": 6
    }
  },
  "runtimeContract": {
    "rendererGlobal": "MissionBosAmbulanceRenderer",
    "controllerGlobal": "MissionBosAmbulanceFoundationController",
    "connectivityRendererGlobal": "MissionBosAmbulanceConnectivityRenderer",
    "requiredRendererMethods": [
      "update",
      "dispatchToArena",
      "transportToHospital",
      "returnToStation",
      "reset",
      "getState",
      "getVehicleStatus",
      "getCommsPosition",
      "getManifest",
      "getSafetyStatus",
      "dispose"
    ],
    "requiredControllerMethods": [
      "update",
      "advanceTest",
      "reset",
      "getState",
      "getManifest",
      "getSafetyStatus",
      "dispose"
    ],
    "vehiclesByIdRequired": true,
    "combinedNetworkVehicleRuntimeRequired": true,
    "combinedAssociationReferencePlanRequired": true
  },
  "dashboard": {
    "placement": "inside-existing-right-dashboard",
    "parentSectionSelector": ".mission-card",
    "testButtonId": "ambulance-test-button",
    "statusId": "ambulance-test-status",
    "servingCellElementId": "ambulance-serving-cell",
    "newStandalonePanelAllowed": false,
    "temporaryFoundationControl": true
  },
  "expectedCounts": {
    "accessSurfaces": 3,
    "routes": 3,
    "ambulances": 1,
    "wheels": 4,
    "lightbars": 1,
    "controlledCivilianTrafficConflicts": 1,
    "pedestrianRouteConflicts": 0,
    "buildingConflicts": 0,
    "towerConflicts": 0,
    "technologyPlotConflicts": 0,
    "staticPropConflicts": 0,
    "fixedServingTowerDefinitions": 0,
    "mission002Runtimes": 0,
    "mission002Actors": 0,
    "mission002LoadProfiles": 0,
    "newStandalonePanels": 0
  }
});
})();
