/* Mission BOS - Build 008R.6
   Validated Response Vehicle Foundation - frozen deterministic response plan.
   Do not alter routes, access surfaces, vehicle dimensions or dispatch timing at runtime.
*/

window.MISSION_BOS_RESPONSE_VEHICLE_PLAN = {
  "schemaVersion": "1.0",
  "project": "Mission BOS – Connected Response",
  "buildBase": "008R.5",
  "phase": "008R.6 Validated Response Vehicle Foundation",
  "sourceLayoutPhase": "008R.1.1 MAST_B Site Alignment Correction",
  "sourcePropsPhase": "008R.3 Static World Detailing",
  "sourceTrafficPhase": "008R.4 Validated Traffic Foundation",
  "sourcePedestrianPhase": "008R.5 Validated Pedestrian Foundation",
  "sourceFiles": {
    "layout": {
      "name": "city-layout-recovery.js",
      "sha256": "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17"
    },
    "propsPlan": {
      "name": "city-static-props-plan.js",
      "sha256": "e31ad502cf411bd586dad47d2e5c00f7e845ee2be0422d8c1966cd7b07ca96f8"
    },
    "trafficPlan": {
      "name": "city-traffic-plan.js",
      "sha256": "617b4ffa560859e0a11e54b009e159f34b73b71f7201617f92a1611568b54a65"
    },
    "pedestrianPlan": {
      "name": "city-pedestrian-plan.js",
      "sha256": "ca979d6b379bb7d8c3fc3a0f522617f4029a296333680b10fb2c2301cb8a44b7"
    }
  },
  "responsePolicy": {
    "runtimeRandomization": false,
    "foundationMode": "manual-dispatch-hold-return",
    "legacyResponseVehiclesAllowed": false,
    "missionVisualsAllowed": false,
    "directMissionTargetMovementAllowed": false,
    "civilianTrafficYieldingRequired": false,
    "roadCrossingsByPedestriansIntroduced": false,
    "routeInterpolation": "open-linear-with-pre-rounded-corners",
    "vehicleRoutesRemainSpatiallySeparatedFromCivilTraffic": true,
    "vehicleRoutesRemainSpatiallySeparatedFromPedestrians": true,
    "stationAccessSurfacesRendered": true
  },
  "simulation": {
    "maxDeltaSeconds": 0.05,
    "vehicleY": 0.42,
    "routeSampleStep": 0.05,
    "footprintLengthSamples": 11,
    "footprintWidthSamples": 7,
    "collisionSafetyMargin": 0.05,
    "runtimeSafetyCheckInterval": 0.2,
    "validationStep": 0.05,
    "blueLightFlashHz": 4.5,
    "turnSmoothing": 10.0,
    "minimumStationarySeparation": 0.25
  },
  "accessSurfaces": [
    {
      "id": "FIRE_STATION_ACCESS",
      "type": "response-access",
      "stationBuildingId": "B04",
      "validationRect": {
        "x": -17.37,
        "z": -34.05,
        "width": 4.14,
        "depth": 6.5
      },
      "renderRect": {
        "x": -18.96,
        "z": -35.76,
        "width": 0.96,
        "depth": 2.4
      },
      "color": "#343b43",
      "markingColor": "#f0f3f5"
    },
    {
      "id": "POLICE_STATION_ACCESS",
      "type": "response-access",
      "stationBuildingId": "B02",
      "validationRect": {
        "x": -18.96,
        "z": -23.3,
        "width": 0.96,
        "depth": 2.2
      },
      "renderRect": {
        "x": -18.96,
        "z": -23.3,
        "width": 0.96,
        "depth": 2.2
      },
      "color": "#343b43",
      "markingColor": "#f0f3f5"
    }
  ],
  "routes": [
    {
      "id": "FIRE_FOUNDATION_ROUTE",
      "vehicleId": "RESPONSE_FIRE_01",
      "closed": false,
      "mode": "station-to-staging-and-return",
      "stationSurfaceId": "FIRE_APRON",
      "stagingSurfaceId": "BOS_BOULEVARD",
      "allowedSurfaceIds": [
        "FIRE_APRON",
        "FIRE_STATION_ACCESS",
        "BOS_BOULEVARD"
      ],
      "points": [
        {
          "x": -43.0,
          "z": -35.76
        },
        {
          "x": -20.6,
          "z": -35.76
        },
        {
          "x": -20.359,
          "z": -35.748
        },
        {
          "x": -20.111,
          "z": -35.712
        },
        {
          "x": -19.858,
          "z": -35.654
        },
        {
          "x": -19.603,
          "z": -35.574
        },
        {
          "x": -19.347,
          "z": -35.472
        },
        {
          "x": -19.094,
          "z": -35.349
        },
        {
          "x": -18.845,
          "z": -35.206
        },
        {
          "x": -18.603,
          "z": -35.045
        },
        {
          "x": -18.37,
          "z": -34.864
        },
        {
          "x": -18.148,
          "z": -34.666
        },
        {
          "x": -17.94,
          "z": -34.451
        },
        {
          "x": -17.748,
          "z": -34.219
        },
        {
          "x": -17.574,
          "z": -33.972
        },
        {
          "x": -17.42,
          "z": -33.71
        },
        {
          "x": -17.289,
          "z": -33.434
        },
        {
          "x": -17.184,
          "z": -33.144
        },
        {
          "x": -17.105,
          "z": -32.841
        },
        {
          "x": -17.057,
          "z": -32.526
        },
        {
          "x": -17.04,
          "z": -32.2
        },
        {
          "x": -17.04,
          "z": -14.4
        }
      ],
      "length": 45.724395,
      "startLabel": "Feuerwehr-Aufstellfläche",
      "endLabel": "Feuerwehr-Bereitstellung BOS-Boulevard"
    },
    {
      "id": "POLICE_FOUNDATION_ROUTE",
      "vehicleId": "RESPONSE_POLICE_01",
      "closed": false,
      "mode": "station-to-staging-and-return",
      "stationSurfaceId": "BOS_FORECOURT",
      "stagingSurfaceId": "BOS_BOULEVARD",
      "allowedSurfaceIds": [
        "BOS_FORECOURT",
        "POLICE_STATION_ACCESS",
        "LOGISTIKSPANGE",
        "BOS_BOULEVARD"
      ],
      "points": [
        {
          "x": -35.4,
          "z": -21.85
        },
        {
          "x": -29.2,
          "z": -21.85
        },
        {
          "x": -28.779,
          "z": -21.857
        },
        {
          "x": -28.353,
          "z": -21.875
        },
        {
          "x": -27.921,
          "z": -21.905
        },
        {
          "x": -27.484,
          "z": -21.945
        },
        {
          "x": -27.044,
          "z": -21.994
        },
        {
          "x": -26.602,
          "z": -22.051
        },
        {
          "x": -26.157,
          "z": -22.114
        },
        {
          "x": -25.71,
          "z": -22.182
        },
        {
          "x": -25.264,
          "z": -22.254
        },
        {
          "x": -24.817,
          "z": -22.329
        },
        {
          "x": -24.372,
          "z": -22.406
        },
        {
          "x": -23.929,
          "z": -22.484
        },
        {
          "x": -23.488,
          "z": -22.561
        },
        {
          "x": -23.05,
          "z": -22.636
        },
        {
          "x": -22.617,
          "z": -22.708
        },
        {
          "x": -22.189,
          "z": -22.776
        },
        {
          "x": -21.767,
          "z": -22.839
        },
        {
          "x": -21.351,
          "z": -22.896
        },
        {
          "x": -20.943,
          "z": -22.945
        },
        {
          "x": -20.543,
          "z": -22.985
        },
        {
          "x": -20.152,
          "z": -23.015
        },
        {
          "x": -19.771,
          "z": -23.033
        },
        {
          "x": -19.4,
          "z": -23.04
        },
        {
          "x": -18.4,
          "z": -23.04
        },
        {
          "x": -18.252,
          "z": -23.032
        },
        {
          "x": -18.109,
          "z": -23.01
        },
        {
          "x": -17.971,
          "z": -22.973
        },
        {
          "x": -17.839,
          "z": -22.922
        },
        {
          "x": -17.714,
          "z": -22.859
        },
        {
          "x": -17.597,
          "z": -22.784
        },
        {
          "x": -17.489,
          "z": -22.698
        },
        {
          "x": -17.391,
          "z": -22.602
        },
        {
          "x": -17.303,
          "z": -22.496
        },
        {
          "x": -17.226,
          "z": -22.381
        },
        {
          "x": -17.161,
          "z": -22.258
        },
        {
          "x": -17.109,
          "z": -22.127
        },
        {
          "x": -17.071,
          "z": -21.99
        },
        {
          "x": -17.048,
          "z": -21.848
        },
        {
          "x": -17.04,
          "z": -21.7
        },
        {
          "x": -17.04,
          "z": -9.2
        }
      ],
      "length": 31.706153,
      "startLabel": "Polizei-Bereitstellungsfläche",
      "endLabel": "Polizei-Bereitstellung BOS-Boulevard"
    }
  ],
  "vehicles": [
    {
      "id": "RESPONSE_FIRE_01",
      "kind": "fire-truck",
      "label": "HLF 20 – Feuerwehr",
      "stationBuildingId": "B04",
      "routeId": "FIRE_FOUNDATION_ROUTE",
      "dispatchDelaySeconds": 2.5,
      "outboundSpeed": 5.0,
      "returnSpeed": 5.5,
      "bodyLength": 4.2,
      "bodyWidth": 1.75,
      "footprintLength": 4.6,
      "footprintWidth": 2.0,
      "wheelCount": 4,
      "bodyColor": "#c51f1a",
      "cabinColor": "#e14137",
      "glassColor": "#bfe6ff",
      "lightColor": "#1e9bff",
      "ladderColor": "#e7edf2",
      "modelDetails": {
        "windshields": 1,
        "lightbars": 1,
        "ladders": 1,
        "wheels": 4
      }
    },
    {
      "id": "RESPONSE_POLICE_01",
      "kind": "police-car",
      "label": "FuStW – Polizei",
      "stationBuildingId": "B02",
      "routeId": "POLICE_FOUNDATION_ROUTE",
      "dispatchDelaySeconds": 0.0,
      "outboundSpeed": 4.6,
      "returnSpeed": 4.8,
      "bodyLength": 2.8,
      "bodyWidth": 1.35,
      "footprintLength": 3.2,
      "footprintWidth": 1.45,
      "wheelCount": 4,
      "bodyColor": "#f1f5f9",
      "stripeColor": "#1f73c9",
      "glassColor": "#bfe6ff",
      "lightColor": "#1e9bff",
      "modelDetails": {
        "stripes": 1,
        "lightbars": 1,
        "wheels": 4
      }
    }
  ],
  "testSequence": {
    "initialState": "AT_STATIONS",
    "firstAction": "DISPATCH",
    "holdingState": "HOLDING",
    "secondAction": "RETURN",
    "returnStartsSimultaneously": true,
    "redispatchAllowedOnlyAtStations": true,
    "missionButtonLabels": {
      "AT_STATIONS": "Einsatzfahrzeuge testen",
      "DISPATCHING": "Alarmierung läuft",
      "ENROUTE": "Einsatzfahrzeuge unterwegs",
      "HOLDING": "Einsatzfahrzeuge zurückrufen",
      "RETURNING": "Rückfahrt läuft",
      "FAILED": "Einsatzfahrzeugprüfung fehlgeschlagen"
    }
  },
  "expectedCounts": {
    "accessSurfaces": 2,
    "routes": 2,
    "vehicles": 2,
    "fireTrucks": 1,
    "policeCars": 1,
    "wheels": 8,
    "lightbars": 2,
    "ladders": 1
  }
};
