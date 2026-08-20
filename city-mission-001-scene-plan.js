/* Mission BOS - Build 008R.9
   Validated Incident Scene & Crowd Load Foundation - frozen deterministic plan.
   Copy unchanged into the build. No modules. No fetch. No random placement.
*/

window.MISSION_BOS_MISSION_001_SCENE_PLAN = {
  "schemaVersion": "1.0",
  "project": "Mission BOS – Connected Response",
  "buildBase": "008R.8",
  "phase": "008R.9 Validated Incident Scene & Crowd Load Foundation",
  "sourceMissionPhase": "008R.8 Validated Mission 001 Core Activation",
  "sourceFiles": {
    "city-layout-recovery.js": "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17",
    "city-static-props-plan.js": "e31ad502cf411bd586dad47d2e5c00f7e845ee2be0422d8c1966cd7b07ca96f8",
    "city-traffic-plan.js": "617b4ffa560859e0a11e54b009e159f34b73b71f7201617f92a1611568b54a65",
    "city-pedestrian-plan.js": "ca979d6b379bb7d8c3fc3a0f522617f4029a296333680b10fb2c2301cb8a44b7",
    "city-response-vehicle-plan.js": "484eb5908a62b4916a01ba7c7939b3fa34cb5fccf1b7e9a7a5c86c4642ba5796",
    "city-incident-response-plan.js": "ae9fb7cd3ed3b97509cb9c5e3cac8ede9febef6f435c50c43cb67ff56d1f396e",
    "city-mission-001-plan.js": "83a6c387c9f34380010de403a8afb29bb80961367eb30d411523d6c9b4fbc5ab"
  },
  "scenePolicy": {
    "runtimeRandomization": false,
    "legacyMissionPedestriansAllowed": false,
    "directTargetMovementAllowed": false,
    "roadCrossingAllowed": false,
    "actorTeleportationAllowed": false,
    "cameraTakeoverAllowed": false,
    "cityGeometryChangesAllowed": false,
    "staticPropChangesAllowed": false,
    "civilianRouteChangesAllowed": false,
    "responseRouteChangesAllowed": false,
    "missionActorsRemainStationary": true,
    "roadClosureVisibleOnlyWhenResponseVehiclesHold": true,
    "roadClosureHiddenBeforeReturn": true,
    "spectatorPhonesExplainLoadRise": true,
    "spectatorPhoneScreensRemainActiveAfterBOS": true,
    "bosDoesNotRemoveSpectators": true
  },
  "incidentReference": {
    "missionId": "MISSION_001_W14_FIRE",
    "buildingId": "W14",
    "buildingName": "Wohnblock W14",
    "responseRoadId": "BOS_BOULEVARD",
    "facade": "west",
    "facadeAnchor": { "x": -12.62, "y": 6.8, "z": 33.9 },
    "fireStaging": { "x": -17.04, "z": 32.5 },
    "policeStaging": { "x": -17.04, "z": 37.5 }
  },
  "zones": [
    {
      "id": "FIRE_OPERATION_ZONE",
      "kind": "actor-zone",
      "role": "firefighter",
      "worldRect": { "x": -13.55, "z": 33.65, "width": 1.55, "depth": 4.1 }
    },
    {
      "id": "POLICE_NORTH_ZONE",
      "kind": "actor-zone",
      "role": "police",
      "worldRect": { "x": -14.15, "z": 37.15, "width": 1.2, "depth": 0.9 }
    },
    {
      "id": "POLICE_SOUTH_ZONE",
      "kind": "actor-zone",
      "role": "police",
      "worldRect": { "x": -14.15, "z": 29.35, "width": 1.2, "depth": 0.9 }
    },
    {
      "id": "SPECTATOR_NORTH_ZONE",
      "kind": "actor-zone",
      "role": "spectator",
      "worldRect": { "x": -4.8, "z": 37.2, "width": 11.6, "depth": 0.8 }
    },
    {
      "id": "SOUTH_ROAD_CLOSURE_ZONE",
      "kind": "road-closure-zone",
      "roadSurfaceId": "BOS_BOULEVARD",
      "worldRect": { "x": -17.04, "z": 29.0, "width": 2.88, "depth": 1.4 }
    }
  ],
  "actors": [
    {
      "id": "MISSION_FIREFIGHTER_LEAD",
      "role": "firefighter",
      "label": "Gruppenführer",
      "zoneId": "FIRE_OPERATION_ZONE",
      "position": { "x": -13.55, "y": 0.0, "z": 32.55 },
      "footprint": { "width": 0.55, "depth": 0.55 },
      "heading": "east",
      "heightScale": 1.04,
      "visibleStates": ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"]
    },
    {
      "id": "MISSION_FIREFIGHTER_01",
      "role": "firefighter",
      "label": "Angriffstrupp 1",
      "zoneId": "FIRE_OPERATION_ZONE",
      "position": { "x": -13.55, "y": 0.0, "z": 33.65 },
      "footprint": { "width": 0.55, "depth": 0.55 },
      "heading": "east",
      "heightScale": 1.0,
      "visibleStates": ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"]
    },
    {
      "id": "MISSION_FIREFIGHTER_02",
      "role": "firefighter",
      "label": "Angriffstrupp 2",
      "zoneId": "FIRE_OPERATION_ZONE",
      "position": { "x": -13.55, "y": 0.0, "z": 34.75 },
      "footprint": { "width": 0.55, "depth": 0.55 },
      "heading": "east",
      "heightScale": 0.98,
      "visibleStates": ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"]
    },
    {
      "id": "MISSION_POLICE_NORTH",
      "role": "police",
      "label": "Polizei Nord",
      "zoneId": "POLICE_NORTH_ZONE",
      "position": { "x": -14.15, "y": 0.0, "z": 37.15 },
      "footprint": { "width": 0.55, "depth": 0.55 },
      "heading": "south",
      "heightScale": 1.02,
      "visibleStates": ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"]
    },
    {
      "id": "MISSION_POLICE_SOUTH",
      "role": "police",
      "label": "Polizei Absperrung",
      "zoneId": "POLICE_SOUTH_ZONE",
      "position": { "x": -14.15, "y": 0.0, "z": 29.35 },
      "footprint": { "width": 0.55, "depth": 0.55 },
      "heading": "west",
      "heightScale": 1.0,
      "visibleStates": ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"]
    },
    {
      "id": "MISSION_SPECTATOR_01",
      "role": "spectator",
      "label": "Zuschauer 1",
      "zoneId": "SPECTATOR_NORTH_ZONE",
      "position": { "x": -9.65, "y": 0.0, "z": 37.2 },
      "footprint": { "width": 0.5, "depth": 0.5 },
      "heading": "south",
      "heightScale": 0.98,
      "phone": true,
      "visibleStates": ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"]
    },
    {
      "id": "MISSION_SPECTATOR_02",
      "role": "spectator",
      "label": "Zuschauer 2",
      "zoneId": "SPECTATOR_NORTH_ZONE",
      "position": { "x": -8.55, "y": 0.0, "z": 37.2 },
      "footprint": { "width": 0.5, "depth": 0.5 },
      "heading": "southwest",
      "heightScale": 1.03,
      "phone": true,
      "visibleStates": ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"]
    },
    {
      "id": "MISSION_SPECTATOR_03",
      "role": "spectator",
      "label": "Zuschauer 3",
      "zoneId": "SPECTATOR_NORTH_ZONE",
      "position": { "x": -5.25, "y": 0.0, "z": 37.2 },
      "footprint": { "width": 0.5, "depth": 0.5 },
      "heading": "southwest",
      "heightScale": 1.0,
      "phone": true,
      "visibleStates": ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"]
    },
    {
      "id": "MISSION_SPECTATOR_04",
      "role": "spectator",
      "label": "Zuschauer 4",
      "zoneId": "SPECTATOR_NORTH_ZONE",
      "position": { "x": -4.15, "y": 0.0, "z": 37.2 },
      "footprint": { "width": 0.5, "depth": 0.5 },
      "heading": "southwest",
      "heightScale": 0.96,
      "phone": true,
      "visibleStates": ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"]
    },
    {
      "id": "MISSION_SPECTATOR_05",
      "role": "spectator",
      "label": "Zuschauer 5",
      "zoneId": "SPECTATOR_NORTH_ZONE",
      "position": { "x": -2.8, "y": 0.0, "z": 37.2 },
      "footprint": { "width": 0.5, "depth": 0.5 },
      "heading": "southwest",
      "heightScale": 1.05,
      "phone": true,
      "visibleStates": ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"]
    },
    {
      "id": "MISSION_SPECTATOR_06",
      "role": "spectator",
      "label": "Zuschauer 6",
      "zoneId": "SPECTATOR_NORTH_ZONE",
      "position": { "x": -1.7, "y": 0.0, "z": 37.2 },
      "footprint": { "width": 0.5, "depth": 0.5 },
      "heading": "southwest",
      "heightScale": 0.99,
      "phone": true,
      "visibleStates": ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"]
    }
  ],
  "roadClosure": {
    "zoneId": "SOUTH_ROAD_CLOSURE_ZONE",
    "visibleStates": ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"],
    "barriers": [
      {
        "id": "MISSION_BARRIER_SOUTH_01",
        "position": { "x": -17.76, "y": 0.0, "z": 29.25 },
        "footprint": { "width": 1.1, "depth": 0.25 },
        "rotation": 0
      },
      {
        "id": "MISSION_BARRIER_SOUTH_02",
        "position": { "x": -16.32, "y": 0.0, "z": 29.25 },
        "footprint": { "width": 1.1, "depth": 0.25 },
        "rotation": 0
      }
    ],
    "cones": [
      {
        "id": "MISSION_CONE_SOUTH_01",
        "position": { "x": -18.25, "y": 0.0, "z": 28.75 },
        "footprint": { "width": 0.24, "depth": 0.24 }
      },
      {
        "id": "MISSION_CONE_SOUTH_02",
        "position": { "x": -17.45, "y": 0.0, "z": 28.75 },
        "footprint": { "width": 0.24, "depth": 0.24 }
      },
      {
        "id": "MISSION_CONE_SOUTH_03",
        "position": { "x": -16.65, "y": 0.0, "z": 28.75 },
        "footprint": { "width": 0.24, "depth": 0.24 }
      },
      {
        "id": "MISSION_CONE_SOUTH_04",
        "position": { "x": -15.85, "y": 0.0, "z": 28.75 },
        "footprint": { "width": 0.24, "depth": 0.24 }
      }
    ]
  },
  "hoseLine": {
    "id": "MISSION_FIRE_HOSE_01",
    "visibleStates": ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"],
    "radius": 0.065,
    "color": "#24394f",
    "points": [
      { "x": -15.95, "y": 0.12, "z": 32.5 },
      { "x": -14.65, "y": 0.12, "z": 32.7 },
      { "x": -13.7, "y": 0.12, "z": 33.1 },
      { "x": -12.72, "y": 0.12, "z": 33.4 }
    ]
  },
  "statePresentation": {
    "READY": { "sceneVisible": false, "phoneGlow": 0.0 },
    "CALL_RECEIVED": { "sceneVisible": false, "phoneGlow": 0.0 },
    "CLEARING_CORRIDOR": { "sceneVisible": false, "phoneGlow": 0.0 },
    "DISPATCHING": { "sceneVisible": false, "phoneGlow": 0.0 },
    "ENROUTE": { "sceneVisible": false, "phoneGlow": 0.0 },
    "ON_SCENE": { "sceneVisible": true, "phoneGlow": 0.28 },
    "OVERLOADED": { "sceneVisible": true, "phoneGlow": 1.0 },
    "BOS_ACTIVE": { "sceneVisible": true, "phoneGlow": 1.0 },
    "COMMS_STABLE": { "sceneVisible": true, "phoneGlow": 0.9 },
    "COMPLETED": { "sceneVisible": true, "phoneGlow": 0.7 },
    "RETURNING": { "sceneVisible": false, "phoneGlow": 0.0 },
    "FAILED": { "sceneVisible": false, "phoneGlow": 0.0 }
  },
  "expectedCounts": {
    "zones": 5,
    "actors": 11,
    "firefighters": 3,
    "policeOfficers": 2,
    "spectators": 6,
    "phones": 6,
    "barriers": 2,
    "cones": 4,
    "hoseLines": 1,
    "missionVisibleStates": 5,
    "returnVisibleMissionObjects": 0
  }
};
