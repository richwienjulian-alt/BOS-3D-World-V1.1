/* Mission BOS - Build 008R.5
   Validated Pedestrian Foundation - frozen deterministic pedestrian plan.
   Do not alter routes or start positions at runtime.
*/

window.MISSION_BOS_PEDESTRIAN_PLAN = {
  "schemaVersion": "1.0",
  "project": "Mission BOS – Connected Response",
  "buildBase": "008R.4",
  "phase": "008R.5 Validated Pedestrian Foundation",
  "sourceLayoutPhase": "008R.1.1 MAST_B Site Alignment Correction",
  "sourcePropsPhase": "008R.3 Static World Detailing",
  "sourceTrafficPhase": "008R.4 Validated Traffic Foundation",
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
    }
  },
  "pedestrianPolicy": {
    "runtimeRandomization": false,
    "movementMode": "open-route-ping-pong",
    "roadCrossingsAllowed": false,
    "directMissionTargetMovementAllowed": false,
    "allowedSurfaceKinds": [
      "sidewalk-corridor",
      "paved-area"
    ],
    "pedestriansRemainOutsideTrafficLanes": true,
    "onePedestrianPerRoute": true
  },
  "simulation": {
    "maxDeltaSeconds": 0.05,
    "pedestrianY": 0.0,
    "routeSampleStep": 0.1,
    "footprintAngularSamples": 24,
    "footprintRadialRings": 3,
    "roadSafetyClearance": 0.04,
    "obstacleSafetyClearance": 0.04,
    "collisionSafetyMargin": 0.04,
    "runtimeSafetyCheckInterval": 0.25,
    "validationSeconds": 240,
    "validationStep": 0.1,
    "trafficSpeedFactorsToValidate": [
      1.0,
      0.96,
      0.9
    ],
    "gaitFrequencyScale": 6.4,
    "turnSmoothing": 8.0
  },
  "routes": [
    {
      "id": "RESIDENTIAL_NORTH_PROMENADE",
      "mode": "ping-pong",
      "surfaceKind": "sidewalk-corridor",
      "allowedSurfaceIds": [
        "C_NORTH_CONNECTOR"
      ],
      "points": [
        {
          "x": -47.5,
          "z": 24.45
        },
        {
          "x": -20.5,
          "z": 24.45
        }
      ],
      "length": 27.0
    },
    {
      "id": "RESIDENTIAL_SOUTH_PROMENADE",
      "mode": "ping-pong",
      "surfaceKind": "sidewalk-corridor",
      "allowedSurfaceIds": [
        "C_STADTALLEE"
      ],
      "points": [
        {
          "x": -47.5,
          "z": 4.5
        },
        {
          "x": -20.5,
          "z": 4.5
        }
      ],
      "length": 27.0
    },
    {
      "id": "TOWN_HALL_SQUARE_WALK",
      "mode": "ping-pong",
      "surfaceKind": "paved-area",
      "allowedSurfaceIds": [
        "TOWN_HALL_SQUARE"
      ],
      "points": [
        {
          "x": -12.4,
          "z": 9.72
        },
        {
          "x": -2.2,
          "z": 9.72
        }
      ],
      "length": 10.2
    },
    {
      "id": "HOSPITAL_FORECOURT_WEST",
      "mode": "ping-pong",
      "surfaceKind": "paved-area",
      "allowedSurfaceIds": [
        "HOSPITAL_FORECOURT"
      ],
      "points": [
        {
          "x": 24.0,
          "z": 29.1
        },
        {
          "x": 34.0,
          "z": 29.1
        }
      ],
      "length": 10.0
    },
    {
      "id": "HOSPITAL_FORECOURT_EAST",
      "mode": "ping-pong",
      "surfaceKind": "paved-area",
      "allowedSurfaceIds": [
        "HOSPITAL_FORECOURT"
      ],
      "points": [
        {
          "x": 35.5,
          "z": 30.1
        },
        {
          "x": 44.3,
          "z": 30.1
        }
      ],
      "length": 8.8
    },
    {
      "id": "BOS_FORECOURT_WALK",
      "mode": "ping-pong",
      "surfaceKind": "paved-area",
      "allowedSurfaceIds": [
        "BOS_FORECOURT"
      ],
      "points": [
        {
          "x": -47.0,
          "z": -23.2
        },
        {
          "x": -29.0,
          "z": -23.2
        }
      ],
      "length": 18.0
    },
    {
      "id": "ARENA_FORECOURT_WEST",
      "mode": "ping-pong",
      "surfaceKind": "paved-area",
      "allowedSurfaceIds": [
        "ARENA_FORECOURT"
      ],
      "points": [
        {
          "x": 24.0,
          "z": -28.3
        },
        {
          "x": 35.0,
          "z": -28.3
        }
      ],
      "length": 11.0
    },
    {
      "id": "ARENA_FORECOURT_EAST",
      "mode": "ping-pong",
      "surfaceKind": "paved-area",
      "allowedSurfaceIds": [
        "ARENA_FORECOURT"
      ],
      "points": [
        {
          "x": 37.0,
          "z": -30.7
        },
        {
          "x": 48.0,
          "z": -30.7
        }
      ],
      "length": 11.0
    }
  ],
  "pedestrians": [
    {
      "id": "PED_RES_01",
      "routeId": "RESIDENTIAL_NORTH_PROMENADE",
      "speed": 1.08,
      "startDistance": 2.8,
      "initialDirection": 1,
      "footprintRadius": 0.28,
      "personalSpaceRadius": 0.5,
      "heightScale": 0.98,
      "bodyColor": "#2d7dd2",
      "trouserColor": "#263142",
      "skinColor": "#efc09a",
      "hairColor": "#4b342b"
    },
    {
      "id": "PED_RES_02",
      "routeId": "RESIDENTIAL_SOUTH_PROMENADE",
      "speed": 0.94,
      "startDistance": 18.5,
      "initialDirection": -1,
      "footprintRadius": 0.28,
      "personalSpaceRadius": 0.5,
      "heightScale": 1.03,
      "bodyColor": "#e85d75",
      "trouserColor": "#303c50",
      "skinColor": "#e2b18d",
      "hairColor": "#5c4033"
    },
    {
      "id": "PED_DOWNTOWN_01",
      "routeId": "TOWN_HALL_SQUARE_WALK",
      "speed": 1.02,
      "startDistance": 3.4,
      "initialDirection": 1,
      "footprintRadius": 0.28,
      "personalSpaceRadius": 0.5,
      "heightScale": 1.0,
      "bodyColor": "#4caf50",
      "trouserColor": "#283341",
      "skinColor": "#d9a77f",
      "hairColor": "#3b2b24"
    },
    {
      "id": "PED_HEALTH_01",
      "routeId": "HOSPITAL_FORECOURT_WEST",
      "speed": 0.88,
      "startDistance": 6.1,
      "initialDirection": -1,
      "footprintRadius": 0.28,
      "personalSpaceRadius": 0.5,
      "heightScale": 0.97,
      "bodyColor": "#f2a65a",
      "trouserColor": "#314056",
      "skinColor": "#f0c59b",
      "hairColor": "#6b4a35"
    },
    {
      "id": "PED_HEALTH_02",
      "routeId": "HOSPITAL_FORECOURT_EAST",
      "speed": 1.0,
      "startDistance": 1.7,
      "initialDirection": 1,
      "footprintRadius": 0.28,
      "personalSpaceRadius": 0.5,
      "heightScale": 1.05,
      "bodyColor": "#6a4c93",
      "trouserColor": "#263142",
      "skinColor": "#c98f74",
      "hairColor": "#2d2522"
    },
    {
      "id": "PED_BOS_01",
      "routeId": "BOS_FORECOURT_WALK",
      "speed": 0.92,
      "startDistance": 11.0,
      "initialDirection": -1,
      "footprintRadius": 0.28,
      "personalSpaceRadius": 0.5,
      "heightScale": 1.02,
      "bodyColor": "#3d405b",
      "trouserColor": "#202b3a",
      "skinColor": "#e2b18d",
      "hairColor": "#4c3326"
    },
    {
      "id": "PED_ARENA_01",
      "routeId": "ARENA_FORECOURT_WEST",
      "speed": 1.12,
      "startDistance": 4.6,
      "initialDirection": 1,
      "footprintRadius": 0.28,
      "personalSpaceRadius": 0.5,
      "heightScale": 0.99,
      "bodyColor": "#008f8c",
      "trouserColor": "#263142",
      "skinColor": "#efc09a",
      "hairColor": "#3b2b24"
    },
    {
      "id": "PED_ARENA_02",
      "routeId": "ARENA_FORECOURT_EAST",
      "speed": 0.86,
      "startDistance": 7.5,
      "initialDirection": -1,
      "footprintRadius": 0.28,
      "personalSpaceRadius": 0.5,
      "heightScale": 1.04,
      "bodyColor": "#b85c38",
      "trouserColor": "#303c50",
      "skinColor": "#d9a77f",
      "hairColor": "#5a3a2d"
    }
  ],
  "expectedCounts": {
    "routes": 8,
    "pedestrians": 8,
    "heads": 8,
    "bodies": 8,
    "arms": 16,
    "legs": 16
  }
};
