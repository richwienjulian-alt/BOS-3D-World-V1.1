/* Mission BOS - Build 008R.4
   Validated Traffic Foundation - frozen deterministic traffic plan.
   Do not alter routes or vehicle start positions at runtime.
*/

window.MISSION_BOS_TRAFFIC_PLAN = {
  "schemaVersion": "1.0",
  "project": "Mission BOS – Connected Response",
  "buildBase": "008R.3",
  "phase": "008R.4 Validated Traffic Foundation",
  "sourceLayoutPhase": "008R.1.1 MAST_B Site Alignment Correction",
  "sourcePropsPhase": "008R.3 Static World Detailing",
  "sourceFiles": {
    "layout": {
      "name": "city-layout-recovery.js",
      "sha256": "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17"
    },
    "propsPlan": {
      "name": "city-static-props-plan.js",
      "sha256": "e31ad502cf411bd586dad47d2e5c00f7e845ee2be0422d8c1966cd7b07ca96f8"
    }
  },
  "trafficPolicy": {
    "outerRingDirection": "clockwise-one-way",
    "sharedRouteVehiclesUseIdenticalSpeed": true,
    "crossingRoutesAllowed": false,
    "minimumSameRouteStartSeparation": 20.0
  },
  "runtimeRandomization": false,
  "simulation": {
    "maxDeltaSeconds": 0.05,
    "collisionSafetyMargin": 0.05,
    "vehicleY": 0.42,
    "trafficStateSpeedFactors": {
      "NORMAL": 1.0,
      "HIGH_LOAD": 0.96,
      "OVERLOADED": 0.9,
      "BOS_ACTIVE": 1.0
    },
    "microLaneWobble": 0.0,
    "routeInterpolation": "linear-segmented-with-pre-rounded-corners"
  },
  "routes": [
    {
      "id": "OUTER_RING_ONE_WAY",
      "closed": true,
      "points": [
        {
          "x": -51.15,
          "z": 40.3
        },
        {
          "x": 51.21,
          "z": 40.3
        },
        {
          "x": 51.39,
          "z": 40.286
        },
        {
          "x": 51.565,
          "z": 40.244
        },
        {
          "x": 51.732,
          "z": 40.175
        },
        {
          "x": 51.886,
          "z": 40.08
        },
        {
          "x": 52.023,
          "z": 39.963
        },
        {
          "x": 52.14,
          "z": 39.826
        },
        {
          "x": 52.235,
          "z": 39.672
        },
        {
          "x": 52.304,
          "z": 39.505
        },
        {
          "x": 52.346,
          "z": 39.33
        },
        {
          "x": 52.36,
          "z": 39.15
        },
        {
          "x": 52.36,
          "z": -39.33
        },
        {
          "x": 52.346,
          "z": -39.51
        },
        {
          "x": 52.304,
          "z": -39.685
        },
        {
          "x": 52.235,
          "z": -39.852
        },
        {
          "x": 52.14,
          "z": -40.006
        },
        {
          "x": 52.023,
          "z": -40.143
        },
        {
          "x": 51.886,
          "z": -40.26
        },
        {
          "x": 51.732,
          "z": -40.355
        },
        {
          "x": 51.565,
          "z": -40.424
        },
        {
          "x": 51.39,
          "z": -40.466
        },
        {
          "x": 51.21,
          "z": -40.48
        },
        {
          "x": -51.15,
          "z": -40.48
        },
        {
          "x": -51.33,
          "z": -40.466
        },
        {
          "x": -51.505,
          "z": -40.424
        },
        {
          "x": -51.672,
          "z": -40.355
        },
        {
          "x": -51.826,
          "z": -40.26
        },
        {
          "x": -51.963,
          "z": -40.143
        },
        {
          "x": -52.08,
          "z": -40.006
        },
        {
          "x": -52.175,
          "z": -39.852
        },
        {
          "x": -52.244,
          "z": -39.685
        },
        {
          "x": -52.286,
          "z": -39.51
        },
        {
          "x": -52.3,
          "z": -39.33
        },
        {
          "x": -52.3,
          "z": 39.15
        },
        {
          "x": -52.286,
          "z": 39.33
        },
        {
          "x": -52.244,
          "z": 39.505
        },
        {
          "x": -52.175,
          "z": 39.672
        },
        {
          "x": -52.08,
          "z": 39.826
        },
        {
          "x": -51.963,
          "z": 39.963
        },
        {
          "x": -51.826,
          "z": 40.08
        },
        {
          "x": -51.672,
          "z": 40.175
        },
        {
          "x": -51.505,
          "z": 40.244
        },
        {
          "x": -51.33,
          "z": 40.286
        },
        {
          "x": -51.15,
          "z": 40.3
        }
      ],
      "length": 368.898496
    },
    {
      "id": "DOWNTOWN_LOOP",
      "closed": true,
      "points": [
        {
          "x": -16.32,
          "z": 26.1
        },
        {
          "x": 0.06,
          "z": 26.1
        },
        {
          "x": 0.2,
          "z": 26.086
        },
        {
          "x": 0.336,
          "z": 26.045
        },
        {
          "x": 0.46,
          "z": 25.979
        },
        {
          "x": 0.569,
          "z": 25.889
        },
        {
          "x": 0.659,
          "z": 25.78
        },
        {
          "x": 0.725,
          "z": 25.656
        },
        {
          "x": 0.766,
          "z": 25.52
        },
        {
          "x": 0.78,
          "z": 25.38
        },
        {
          "x": 0.78,
          "z": 7.08
        },
        {
          "x": 0.766,
          "z": 6.94
        },
        {
          "x": 0.725,
          "z": 6.804
        },
        {
          "x": 0.659,
          "z": 6.68
        },
        {
          "x": 0.569,
          "z": 6.571
        },
        {
          "x": 0.46,
          "z": 6.481
        },
        {
          "x": 0.336,
          "z": 6.415
        },
        {
          "x": 0.2,
          "z": 6.374
        },
        {
          "x": 0.06,
          "z": 6.36
        },
        {
          "x": -16.32,
          "z": 6.36
        },
        {
          "x": -16.46,
          "z": 6.374
        },
        {
          "x": -16.596,
          "z": 6.415
        },
        {
          "x": -16.72,
          "z": 6.481
        },
        {
          "x": -16.829,
          "z": 6.571
        },
        {
          "x": -16.919,
          "z": 6.68
        },
        {
          "x": -16.985,
          "z": 6.804
        },
        {
          "x": -17.026,
          "z": 6.94
        },
        {
          "x": -17.04,
          "z": 7.08
        },
        {
          "x": -17.04,
          "z": 25.38
        },
        {
          "x": -17.026,
          "z": 25.52
        },
        {
          "x": -16.985,
          "z": 25.656
        },
        {
          "x": -16.919,
          "z": 25.78
        },
        {
          "x": -16.829,
          "z": 25.889
        },
        {
          "x": -16.72,
          "z": 25.979
        },
        {
          "x": -16.596,
          "z": 26.045
        },
        {
          "x": -16.46,
          "z": 26.086
        },
        {
          "x": -16.32,
          "z": 26.1
        }
      ],
      "length": 73.876551
    },
    {
      "id": "SOUTH_SUPPORT_LOOP",
      "closed": true,
      "points": [
        {
          "x": 1.5,
          "z": -6.18
        },
        {
          "x": 17.88,
          "z": -6.18
        },
        {
          "x": 18.02,
          "z": -6.194
        },
        {
          "x": 18.156,
          "z": -6.235
        },
        {
          "x": 18.28,
          "z": -6.301
        },
        {
          "x": 18.389,
          "z": -6.391
        },
        {
          "x": 18.479,
          "z": -6.5
        },
        {
          "x": 18.545,
          "z": -6.624
        },
        {
          "x": 18.586,
          "z": -6.76
        },
        {
          "x": 18.6,
          "z": -6.9
        },
        {
          "x": 18.6,
          "z": -22.32
        },
        {
          "x": 18.586,
          "z": -22.46
        },
        {
          "x": 18.545,
          "z": -22.596
        },
        {
          "x": 18.479,
          "z": -22.72
        },
        {
          "x": 18.389,
          "z": -22.829
        },
        {
          "x": 18.28,
          "z": -22.919
        },
        {
          "x": 18.156,
          "z": -22.985
        },
        {
          "x": 18.02,
          "z": -23.026
        },
        {
          "x": 17.88,
          "z": -23.04
        },
        {
          "x": 1.5,
          "z": -23.04
        },
        {
          "x": 1.36,
          "z": -23.026
        },
        {
          "x": 1.224,
          "z": -22.985
        },
        {
          "x": 1.1,
          "z": -22.919
        },
        {
          "x": 0.991,
          "z": -22.829
        },
        {
          "x": 0.901,
          "z": -22.72
        },
        {
          "x": 0.835,
          "z": -22.596
        },
        {
          "x": 0.794,
          "z": -22.46
        },
        {
          "x": 0.78,
          "z": -22.32
        },
        {
          "x": 0.78,
          "z": -6.9
        },
        {
          "x": 0.794,
          "z": -6.76
        },
        {
          "x": 0.835,
          "z": -6.624
        },
        {
          "x": 0.901,
          "z": -6.5
        },
        {
          "x": 0.991,
          "z": -6.391
        },
        {
          "x": 1.1,
          "z": -6.301
        },
        {
          "x": 1.224,
          "z": -6.235
        },
        {
          "x": 1.36,
          "z": -6.194
        },
        {
          "x": 1.5,
          "z": -6.18
        }
      ],
      "length": 68.116551
    }
  ],
  "vehicles": [
    {
      "id": "CAR_RING_01",
      "routeId": "OUTER_RING_ONE_WAY",
      "speed": 6.25,
      "bodyLength": 2.35,
      "bodyWidth": 1.02,
      "footprintLength": 2.35,
      "footprintWidth": 1.2,
      "kind": "car",
      "color": "#e8a23a",
      "wheelCount": 4,
      "startDistance": 0.0
    },
    {
      "id": "CAR_RING_02",
      "routeId": "OUTER_RING_ONE_WAY",
      "speed": 6.25,
      "bodyLength": 2.45,
      "bodyWidth": 1.04,
      "footprintLength": 2.45,
      "footprintWidth": 1.22,
      "kind": "car",
      "color": "#4d8ccf",
      "wheelCount": 4,
      "startDistance": 122.966042
    },
    {
      "id": "CAR_RING_03",
      "routeId": "OUTER_RING_ONE_WAY",
      "speed": 6.25,
      "bodyLength": 2.4,
      "bodyWidth": 1.03,
      "footprintLength": 2.4,
      "footprintWidth": 1.21,
      "kind": "car",
      "color": "#d6d6d2",
      "wheelCount": 4,
      "startDistance": 245.932454
    },
    {
      "id": "CAR_DOWNTOWN_01",
      "routeId": "DOWNTOWN_LOOP",
      "speed": 4.25,
      "bodyLength": 2.25,
      "bodyWidth": 0.98,
      "footprintLength": 2.25,
      "footprintWidth": 1.16,
      "kind": "car",
      "color": "#4caf50",
      "wheelCount": 4,
      "startDistance": 8.865186
    },
    {
      "id": "VAN_SUPPORT_01",
      "routeId": "SOUTH_SUPPORT_LOOP",
      "speed": 3.75,
      "bodyLength": 2.85,
      "bodyWidth": 1.05,
      "footprintLength": 2.85,
      "footprintWidth": 1.23,
      "kind": "van",
      "color": "#7b8794",
      "wheelCount": 4,
      "startDistance": 23.840793
    }
  ],
  "expectedCounts": {
    "routes": 3,
    "vehicles": 5,
    "cars": 4,
    "vans": 1,
    "wheels": 20
  }
};
