/* Mission BOS - Build 008R.8
   Validated Mission 001 Core Activation - frozen deterministic plan.
   Copy unchanged into the build. No modules. No fetch.
*/

window.MISSION_BOS_MISSION_001_PLAN = {
  "schemaVersion": "1.0",
  "project": "Mission BOS – Connected Response",
  "buildBase": "008R.7",
  "phase": "008R.8 Validated Mission 001 Core Activation",
  "sourceIncidentPhase": "008R.7 Validated Incident Access & Yielding Foundation",
  "sourceFiles": {
    "city-layout-recovery.js": {
      "name": "city-layout-recovery.js",
      "sha256": "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17"
    },
    "city-static-props-plan.js": {
      "name": "city-static-props-plan.js",
      "sha256": "e31ad502cf411bd586dad47d2e5c00f7e845ee2be0422d8c1966cd7b07ca96f8"
    },
    "city-traffic-plan.js": {
      "name": "city-traffic-plan.js",
      "sha256": "617b4ffa560859e0a11e54b009e159f34b73b71f7201617f92a1611568b54a65"
    },
    "city-pedestrian-plan.js": {
      "name": "city-pedestrian-plan.js",
      "sha256": "ca979d6b379bb7d8c3fc3a0f522617f4029a296333680b10fb2c2301cb8a44b7"
    },
    "city-response-vehicle-plan.js": {
      "name": "city-response-vehicle-plan.js",
      "sha256": "484eb5908a62b4916a01ba7c7939b3fa34cb5fccf1b7e9a7a5c86c4642ba5796"
    },
    "city-incident-response-plan.js": {
      "name": "city-incident-response-plan.js",
      "sha256": "ae9fb7cd3ed3b97509cb9c5e3cac8ede9febef6f435c50c43cb67ff56d1f396e"
    },
    "city-incident-access-controller.js": {
      "name": "city-incident-access-controller.js",
      "sha256": "03c0ffd6735883f9ee07421c4f8149ce0490c3079bd1147e6e1de444e98e89fb"
    },
    "incident-response-validator.js": {
      "name": "incident-response-validator.js",
      "sha256": "4a764bfdaaeb0f7ede82c8d5d135d34bd27559b6ca60701292c2539b7ec32155"
    },
    "city-response-vehicle-renderer.js": {
      "name": "city-response-vehicle-renderer.js",
      "sha256": "e27f9c676dbd7e217db0414b6f4eac2344157db397614718d69ed0f86c3b685f"
    },
    "city-traffic-renderer.js": {
      "name": "city-traffic-renderer.js",
      "sha256": "332ed163765bf496e29e6123a548ae057fe217a0a4ed0dce5867fc2d6e0287b9"
    },
    "app.js": {
      "name": "app.js",
      "sha256": "a0e4508125b305b745f66764ed1d8ec4defc983376b61757e754b7a66cb466a9"
    },
    "index.html": {
      "name": "index.html",
      "sha256": "5f67af18dada0dec99358ddeab745dc77b874f4ff066d8e5ba1e44a519a37845"
    }
  },
  "missionPolicy": {
    "runtimeRandomization": false,
    "legacyMissionManagerAllowed": false,
    "legacyMissionVisualsAllowed": false,
    "legacyPedestrianMissionBehaviorAllowed": false,
    "directMissionTargetMovementAllowed": false,
    "automaticBOSActivationAllowed": false,
    "manualBOSActivationRequired": true,
    "civilianNetworkLoadMayDropAfterBOSActivation": false,
    "cameraTakeoverAllowed": false,
    "cityGeometryChangesAllowed": false,
    "staticPropChangesAllowed": false,
    "trafficRouteChangesAllowed": false,
    "pedestrianRouteChangesAllowed": false,
    "responseRouteChangesAllowed": false,
    "groundIncidentPropsAllowed": false,
    "missionVisualsRestrictedToIncidentBuilding": true
  },
  "dependencies": {
    "incidentAccessPlanGlobal": "MISSION_BOS_INCIDENT_RESPONSE_PLAN",
    "incidentAccessControllerGlobal": "MissionBosIncidentAccessController",
    "missionPlanGlobal": "MISSION_BOS_MISSION_001_PLAN",
    "missionValidatorGlobal": "MissionBosMission001Validator",
    "missionControllerGlobal": "MissionBosMission001Controller",
    "missionVisualsGlobal": "MissionBosMission001Visuals"
  },
  "incidentReference": {
    "incidentId": "MISSION_001_W14_FIRE",
    "missionId": "fire",
    "title": "Wohnungsbrand Innenstadt",
    "buildingId": "W14",
    "buildingName": "Wohnblock W14",
    "facade": "west",
    "facadeAnchor": {
      "x": -12.62,
      "y": 6.8,
      "z": 33.9
    },
    "roofSmokeAnchor": {
      "x": -10.68,
      "y": 12.35,
      "z": 33.9
    },
    "cameraFocus": {
      "x": -12.4,
      "y": 5.8,
      "z": 33.9
    },
    "fireStaging": {
      "x": -17.04,
      "z": 32.5,
      "heading": "north"
    },
    "policeStaging": {
      "x": -17.04,
      "z": 37.5,
      "heading": "north"
    }
  },
  "stateOrder": [
    "READY",
    "CALL_RECEIVED",
    "CLEARING_CORRIDOR",
    "DISPATCHING",
    "ENROUTE",
    "ON_SCENE",
    "OVERLOADED",
    "BOS_ACTIVE",
    "COMMS_STABLE",
    "COMPLETED",
    "RETURNING",
    "FAILED"
  ],
  "states": [
    {
      "id": "READY",
      "phaseLabel": "Bereitschaft",
      "stageLabel": "Bereit",
      "statusLabel": "Bereit",
      "progress": 0,
      "networkTarget": 38,
      "smokeVisible": false,
      "fireVisible": false,
      "communicationMode": "normal",
      "userGate": "START"
    },
    {
      "id": "CALL_RECEIVED",
      "phaseLabel": "Notruf",
      "stageLabel": "112-Meldung",
      "statusLabel": "Einsatz gemeldet",
      "progress": 8,
      "networkTarget": 42,
      "smokeVisible": true,
      "fireVisible": false,
      "communicationMode": "normal",
      "minimumDurationSeconds": 1.5
    },
    {
      "id": "CLEARING_CORRIDOR",
      "phaseLabel": "Alarmierung",
      "stageLabel": "Korridor räumen",
      "statusLabel": "Einsatzkorridor wird geräumt",
      "progress": 18,
      "networkTarget": 48,
      "smokeVisible": true,
      "fireVisible": true,
      "communicationMode": "normal",
      "mirrorsIncidentAccessState": "CLEARING_CORRIDOR"
    },
    {
      "id": "DISPATCHING",
      "phaseLabel": "Alarmierung",
      "stageLabel": "Ausfahrt",
      "statusLabel": "Kräfte werden alarmiert",
      "progress": 28,
      "networkTarget": 55,
      "smokeVisible": true,
      "fireVisible": true,
      "communicationMode": "high-load",
      "mirrorsIncidentAccessState": "DISPATCHING"
    },
    {
      "id": "ENROUTE",
      "phaseLabel": "Anfahrt",
      "stageLabel": "Einsatzfahrt",
      "statusLabel": "Kräfte auf Anfahrt",
      "progress": 42,
      "networkTarget": 70,
      "smokeVisible": true,
      "fireVisible": true,
      "communicationMode": "high-load",
      "mirrorsIncidentAccessState": "ENROUTE"
    },
    {
      "id": "ON_SCENE",
      "phaseLabel": "Einsatzstelle",
      "stageLabel": "Lageerkundung",
      "statusLabel": "Kräfte vor Ort",
      "progress": 58,
      "networkTarget": 84,
      "smokeVisible": true,
      "fireVisible": true,
      "communicationMode": "high-load",
      "minimumDurationSeconds": 2.5,
      "requiresIncidentAccessState": "HOLDING"
    },
    {
      "id": "OVERLOADED",
      "phaseLabel": "Kommunikation",
      "stageLabel": "Netzüberlast",
      "statusLabel": "BOS-Kommunikation instabil",
      "progress": 72,
      "networkTarget": 96,
      "smokeVisible": true,
      "fireVisible": true,
      "communicationMode": "overloaded",
      "userGate": "ACTIVATE_BOS"
    },
    {
      "id": "BOS_ACTIVE",
      "phaseLabel": "BOS-Spur",
      "stageLabel": "Priorisierung",
      "statusLabel": "BOS-Priorisierung aktiv",
      "progress": 84,
      "networkTarget": 96,
      "smokeVisible": true,
      "fireVisible": true,
      "communicationMode": "bos",
      "minimumDurationSeconds": 3.0
    },
    {
      "id": "COMMS_STABLE",
      "phaseLabel": "BOS-Spur",
      "stageLabel": "Stabilisierung",
      "statusLabel": "BOS-Kommunikation stabil",
      "progress": 94,
      "networkTarget": 96,
      "smokeVisible": true,
      "fireVisible": true,
      "communicationMode": "bos",
      "minimumDurationSeconds": 4.5
    },
    {
      "id": "COMPLETED",
      "phaseLabel": "Mission 001",
      "stageLabel": "Kommunikationsziel erreicht",
      "statusLabel": "Mission abgeschlossen",
      "progress": 100,
      "networkTarget": 96,
      "smokeVisible": true,
      "fireVisible": true,
      "communicationMode": "bos",
      "userGate": "FINISH_AND_RETURN"
    },
    {
      "id": "RETURNING",
      "phaseLabel": "Rückstellung",
      "stageLabel": "Rückfahrt",
      "statusLabel": "Kräfte kehren zurück",
      "progress": 100,
      "networkTarget": 70,
      "smokeVisible": false,
      "fireVisible": false,
      "communicationMode": "normal",
      "mirrorsIncidentAccessState": "RETURNING"
    },
    {
      "id": "FAILED",
      "phaseLabel": "Fehler",
      "stageLabel": "Sicherheitsstopp",
      "statusLabel": "Mission angehalten",
      "progress": 0,
      "networkTarget": 38,
      "smokeVisible": false,
      "fireVisible": false,
      "communicationMode": "normal"
    }
  ],
  "sequence": {
    "initialState": "READY",
    "startAction": "START_MISSION",
    "incidentAccessStartAfterSeconds": 1.5,
    "dispatchRequiresYieldConfirmation": true,
    "onSceneStateRequiresIncidentAccessHolding": true,
    "onSceneHoldSeconds": 2.5,
    "bosActivationState": "OVERLOADED",
    "bosActivationAction": "ACTIVATE_BOS",
    "bosActiveToStableSeconds": 3.0,
    "stableToCompletedSeconds": 4.5,
    "finishAction": "FINISH_AND_RETURN",
    "finishRequiresState": "COMPLETED",
    "returnUsesIncidentAccessController": true,
    "resetWhenIncidentAccessState": "AT_STATIONS",
    "releaseYieldOwnedByIncidentAccessController": true
  },
  "network": {
    "baseLoad": 38,
    "maximumLoad": 96,
    "minimumOverloadLoad": 90,
    "riseRatePerSecond": 7.0,
    "resetRatePerSecond": 12.0,
    "bosActivationDoesNotReduceCivilianLoad": true,
    "manualLoadControlDisabledWhileMissionActive": true,
    "bosMayBeActivatedOnlyInState": "OVERLOADED",
    "bosMayNotBeDeactivatedDuringMission": true,
    "resetBOSAfterReturn": true
  },
  "visuals": {
    "rendererMode": "deterministic-building-attached-only",
    "incidentBuildingId": "W14",
    "facadeAnchor": {
      "x": -12.62,
      "y": 6.8,
      "z": 33.9
    },
    "roofSmokeAnchor": {
      "x": -10.68,
      "y": 12.35,
      "z": 33.9
    },
    "groundProps": [],
    "smoke": {
      "count": 7,
      "geometry": "dodecahedron",
      "baseColor": "#5f6670",
      "maxOpacity": 0.48,
      "verticalSpan": 5.4,
      "horizontalRadius": 1.25,
      "randomization": false
    },
    "flames": {
      "count": 4,
      "geometry": "cone",
      "outerColor": "#ff5a1f",
      "innerColor": "#ffcf4a",
      "maxOpacity": 0.92,
      "randomization": false
    },
    "windowGlow": {
      "count": 1,
      "color": "#ff6a2d",
      "maxOpacity": 0.42
    },
    "incidentMarker": {
      "enabled": false
    },
    "barriers": {
      "enabled": false
    },
    "cameraMovement": {
      "enabled": false
    }
  },
  "controls": {
    "missionButtonLabels": {
      "READY": "Mission 001 starten",
      "CALL_RECEIVED": "Notruf wird aufgenommen",
      "CLEARING_CORRIDOR": "Einsatzkorridor wird geräumt",
      "DISPATCHING": "Alarmierung läuft",
      "ENROUTE": "Einsatzkräfte auf Anfahrt",
      "ON_SCENE": "Lage wird erkundet",
      "OVERLOADED": "BOS-Spur aktivieren",
      "BOS_ACTIVE": "BOS-Priorisierung läuft",
      "COMMS_STABLE": "Kommunikation stabilisiert",
      "COMPLETED": "Einsatz abschließen",
      "RETURNING": "Rückfahrt läuft",
      "FAILED": "Mission fehlgeschlagen"
    },
    "bosButtonLabels": {
      "LOCKED": "BOS-Spur ab Netzüberlast verfügbar",
      "AVAILABLE": "BOS-Spur aktivieren",
      "ACTIVE": "BOS-Spur aktiv"
    },
    "missionButtonEnabledStates": [
      "READY",
      "COMPLETED"
    ],
    "bosButtonEnabledStates": [
      "OVERLOADED"
    ],
    "manualOverloadDisabledStates": [
      "CALL_RECEIVED",
      "CLEARING_CORRIDOR",
      "DISPATCHING",
      "ENROUTE",
      "ON_SCENE",
      "OVERLOADED",
      "BOS_ACTIVE",
      "COMMS_STABLE",
      "COMPLETED",
      "RETURNING"
    ]
  },
  "descriptions": {
    "READY": "BOS-Infrastruktur bereit. Mission 001 kann gestartet werden.",
    "CALL_RECEIVED": "Ein Wohnungsbrand in W14 wird über 112 gemeldet.",
    "CLEARING_CORRIDOR": "Ein ziviles Fahrzeug räumt den gemeinsam genutzten BOS-Boulevard.",
    "DISPATCHING": "Der Korridor ist frei. Feuerwehr und Polizei werden alarmiert.",
    "ENROUTE": "Die Einsatzkräfte fahren auf validierten Routen zu W14.",
    "ON_SCENE": "Feuerwehr und Polizei sind vor Ort. Die mobile Nutzung im Umfeld steigt.",
    "OVERLOADED": "Die zivile Netzlast ist kritisch. Die BOS-Kommunikation wird sichtbar instabil.",
    "BOS_ACTIVE": "Die BOS-Spur priorisiert die Kommunikation, obwohl die zivile Netzlast hoch bleibt.",
    "COMMS_STABLE": "Priorisierte Datenpakete erreichen Leitstelle und Feuerwehr wieder stabil.",
    "COMPLETED": "Das Kommunikationsziel ist erreicht. Der Einsatz kann kontrolliert beendet werden.",
    "RETURNING": "Die Einsatzfahrzeuge kehren zurück; der zivile Verkehr bleibt bis zur Freigabe angehalten.",
    "FAILED": "Eine Sicherheitsprüfung hat die Mission kontrolliert angehalten."
  },
  "expectedCounts": {
    "states": 12,
    "interactiveMissionStates": 2,
    "bosActivationStates": 1,
    "incidentBuildings": 1,
    "smokePuffs": 7,
    "flames": 4,
    "windowGlows": 1,
    "groundIncidentProps": 0,
    "pedestrianMissionBehaviors": 0,
    "automaticBOSActivations": 0
  }
};
