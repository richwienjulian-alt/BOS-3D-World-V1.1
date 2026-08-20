/* Mission BOS - Build 008R.11
   Validated Presenter & Demo Control plan.
   Copy unchanged into the build. No modules. No fetch. No automatic camera takeover.
*/
window.MISSION_BOS_PRESENTER_PLAN = {
  schemaVersion: "1.0",
  project: "Mission BOS – Connected Response",
  buildBase: "008R.10",
  phase: "008R.11 Validated Presenter & Demo Control",
  sourcePhase: "008R.10 Validated Telekom Communication Experience",
  sourceFiles: {
    "city-layout-recovery.js": "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17",
    "city-static-props-plan.js": "e31ad502cf411bd586dad47d2e5c00f7e845ee2be0422d8c1966cd7b07ca96f8",
    "city-traffic-plan.js": "617b4ffa560859e0a11e54b009e159f34b73b71f7201617f92a1611568b54a65",
    "city-pedestrian-plan.js": "ca979d6b379bb7d8c3fc3a0f522617f4029a296333680b10fb2c2301cb8a44b7",
    "city-response-vehicle-plan.js": "484eb5908a62b4916a01ba7c7939b3fa34cb5fccf1b7e9a7a5c86c4642ba5796",
    "city-incident-response-plan.js": "ae9fb7cd3ed3b97509cb9c5e3cac8ede9febef6f435c50c43cb67ff56d1f396e",
    "city-mission-001-plan.js": "83a6c387c9f34380010de403a8afb29bb80961367eb30d411523d6c9b4fbc5ab",
    "city-mission-001-scene-plan.js": "79e9728d6b071655a6c0f3309c638fdcb5ac8f4cba01fc457828e13347390930",
    "city-telekom-communication-plan.js": "4998773c4e4dabdd7d5984b62fe8ef757f04bbecf8a2ac66e62fc567a083499b"
  },
  policy: {
    fileProtocolRequired: true,
    automaticCameraTakeoverAllowed: false,
    automaticMissionStartAllowed: false,
    automaticBOSActivationAllowed: false,
    automaticMissionFinishAllowed: false,
    hardResetDuringActiveMissionAllowed: false,
    missionStateChangesAllowed: false,
    networkPolicyChangesAllowed: false,
    cityGeometryChangesAllowed: false,
    staticPropChangesAllowed: false,
    trafficChangesAllowed: false,
    pedestrianChangesAllowed: false,
    responseVehicleChangesAllowed: false,
    communicationExperienceChangesAllowed: false,
    freeCameraMustRemainAvailable: true,
    manualInputReleasesCameraBookmark: true
  },
  camera: {
    worldBounds: { xMin: -54, xMax: 54, zMin: -54, zMax: 54, yMin: 6, yMax: 48 },
    defaultBookmarkId: "CAM_CUSTOMER_START",
    transitionSeconds: 1.15,
    manualReleaseKeys: ["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE", "ShiftLeft", "ShiftRight"],
    bookmarks: [
      {
        id: "CAM_CUSTOMER_START",
        label: "Kundenstart",
        shortLabel: "0 · Start",
        keyCode: "Digit0",
        position: { x: 0.78, y: 9.0, z: 46.0 },
        target: { x: 0.78, y: 2.5, z: 10.0 },
        fov: 56,
        purpose: "Niedrige sichere Startperspektive für den Kundeneinstieg und Demo-Reset."
      },
      {
        id: "CAM_CITY_OVERVIEW",
        label: "Stadtübersicht",
        shortLabel: "1 · Stadt",
        keyCode: "Digit1",
        position: { x: 0, y: 40, z: 50 },
        target: { x: 0, y: 1.5, z: 0 },
        fov: 54,
        purpose: "Gesamtstruktur, Bezirke und Einsatzkontext zeigen."
      },
      {
        id: "CAM_INCIDENT_W14",
        label: "Einsatzstelle W14",
        shortLabel: "2 · Einsatz",
        keyCode: "Digit2",
        position: { x: -27, y: 11, z: 46 },
        target: { x: -10.68, y: 4.8, z: 33.9 },
        fov: 58,
        purpose: "Feuer, Einsatzfahrzeuge, Einsatzkräfte, Absperrung und Zuschauer zeigen."
      },
      {
        id: "CAM_COMMUNICATION_MAST_B",
        label: "Kommunikation & MAST_B",
        shortLabel: "3 · Netz",
        keyCode: "Digit3",
        position: { x: 29, y: 14, z: 30 },
        target: { x: 3, y: 5.2, z: 23 },
        fov: 61,
        purpose: "MAST_B, Smartphone-Last und priorisierte BOS-Kommunikation erklären."
      }
    ],
    missionCameraProfiles: {
      MISSION_001: {
        number: "001",
        title: "Wohnungsbrand",
        networkTowerId: "MAST_B",
        incidentReference: { x: -12.4, y: 5.8, z: 33.9 },
        bookmarkOverrides: {
          CAM_CUSTOMER_START: {
            label: "Kundenstart – Mission 001",
            purpose: "Neutraler Einstieg vor der gef\u00fchrten Wohnungsbrand-Demo."
          },
          CAM_CITY_OVERVIEW: {
            label: "Wohnquartier & Anfahrtsraum",
            position: { x: -34, y: 16, z: 49 },
            target: { x: -10.68, y: 3.2, z: 33.9 },
            fov: 60,
            purpose: "Wohnquartier, Ring Nord und die Anfahrt zum Wohnungsbrand in einem verständlichen Kontext zeigen."
          },
          CAM_INCIDENT_W14: {
            label: "Einsatzstelle Wohnungsbrand",
            position: { x: -25, y: 10, z: 47 },
            target: { x: -10.68, y: 4.8, z: 33.9 },
            fov: 54,
            purpose: "Brandobjekt, Einsatzkräfte, Absperrung und Zuschauer klar und ohne unnötige Distanz zeigen."
          },
          CAM_COMMUNICATION_MAST_B: {
            label: "Netzwirkung Wohnungsbrand & MAST_B",
            position: { x: 22, y: 16, z: 46 },
            target: { x: 3, y: 7.0, z: 24 },
            fov: 66,
            purpose: "MAST_B und den betroffenen Innenstadt-/Wohnbereich gemeinsam zeigen, damit Zelllast und BOS-Priorisierung räumlich nachvollziehbar sind."
          }
        },
        recommendedBookmarkByState: {
          READY: "CAM_CITY_OVERVIEW",
          CALL_RECEIVED: "CAM_CITY_OVERVIEW",
          CLEARING_CORRIDOR: "CAM_CITY_OVERVIEW",
          DISPATCHING: "CAM_CITY_OVERVIEW",
          ENROUTE: "CAM_INCIDENT_W14",
          ON_SCENE: "CAM_INCIDENT_W14",
          OVERLOADED: "CAM_COMMUNICATION_MAST_B",
          BOS_ACTIVE: "CAM_COMMUNICATION_MAST_B",
          COMMS_STABLE: "CAM_COMMUNICATION_MAST_B",
          COMPLETED: "CAM_INCIDENT_W14",
          RETURNING: "CAM_CITY_OVERVIEW",
          FAILED: "CAM_CITY_OVERVIEW"
        }
      },
      MISSION_002: {
        number: "002",
        title: "Arena-Notfall",
        networkTowerId: "MAST_E",
        incidentReference: { x: 41.15, y: 1.6, z: -26.65 },
        bookmarkOverrides: {
          CAM_CUSTOMER_START: {
            label: "Kundenstart – Mission 002",
            purpose: "Neutraler Einstieg vor der gef\u00fchrten Arena-Demo."
          },
          CAM_CITY_OVERVIEW: {
            label: "Arena, Rettungsweg & Gesundheitsquartier",
            position: { x: 53, y: 21, z: 8 },
            target: { x: 36, y: 2.5, z: 3 },
            fov: 72,
            purpose: "Arena, Rettungsweg in Richtung Norden und das Gesundheitsquartier als zusammenhängenden Einsatzraum zeigen."
          },
          CAM_INCIDENT_W14: {
            label: "Einsatzstelle Arena-Notfall",
            position: { x: 50, y: 9, z: -41 },
            target: { x: 41.15, y: 1.6, z: -26.65 },
            fov: 52,
            purpose: "Patient, Rettungswagen und Arena-Vorplatz in einer ruhigen, klaren Einsatzperspektive zeigen."
          },
          CAM_COMMUNICATION_MAST_B: {
            label: "Arena-Netz & MAST_E",
            position: { x: 11, y: 15, z: -4 },
            target: { x: 31, y: 6.0, z: -18 },
            fov: 62,
            purpose: "MAST_E und Arena gemeinsam im Bild halten, damit hohe Veranstaltungszelllast und Rettungsdienst-Priorisierung verständlich erklärt werden können."
          }
        },
        recommendedBookmarkByState: {
          READY: "CAM_CITY_OVERVIEW",
          EVENT_ACTIVE: "CAM_CITY_OVERVIEW",
          CALL_RECEIVED: "CAM_INCIDENT_W14",
          CLEARING_CORRIDOR: "CAM_CITY_OVERVIEW",
          ENROUTE: "CAM_INCIDENT_W14",
          ON_SCENE: "CAM_INCIDENT_W14",
          OVERLOADED: "CAM_COMMUNICATION_MAST_B",
          BOS_ACTIVE: "CAM_COMMUNICATION_MAST_B",
          COMMS_STABLE: "CAM_COMMUNICATION_MAST_B",
          TREATMENT: "CAM_INCIDENT_W14",
          COMPLETED: "CAM_INCIDENT_W14",
          TRANSPORTING: "CAM_CITY_OVERVIEW",
          AT_HOSPITAL: "CAM_CITY_OVERVIEW",
          RETURNING: "CAM_CITY_OVERVIEW",
          FAILED: "CAM_CITY_OVERVIEW"
        }
      },
      MISSION_003: {
        number: "003",
        title: "Wasserleitungsleck",
        networkTowerId: "MAST_B",
        incidentReference: { x: -7.26, y: 1.8, z: 6.36 },
        bookmarkOverrides: {
          CAM_CUSTOMER_START: {
            label: "Kundenstart – Mission 003",
            purpose: "Neutraler Einstieg vor der gef\u00fchrten Stadtwerke-Demo."
          },
          CAM_CITY_OVERVIEW: {
            label: "Innenstadt & Stadtwerke-Anfahrt",
            position: { x: -29, y: 16, z: 25 },
            target: { x: -7.26, y: 2.0, z: 6.36 },
            fov: 60,
            purpose: "Innenstadt, Hauptachse und Einsatzumfeld des Wasserlecks in einem zusammenhängenden Stadtbild zeigen."
          },
          CAM_INCIDENT_W14: {
            label: "Einsatzstelle Wasserleck",
            position: { x: -21, y: 9, z: 16 },
            target: { x: -7.26, y: 1.8, z: 6.36 },
            fov: 52,
            purpose: "Wasseraustritt, Stadtwerke, Feuerwehr und Polizei kompakt und gut lesbar im direkten Einsatzbild zeigen."
          },
          CAM_COMMUNICATION_MAST_B: {
            label: "Innenstadt-Netz & MAST_B",
            position: { x: 27, y: 15, z: -3 },
            target: { x: 4, y: 5.0, z: 10 },
            fov: 62,
            purpose: "MAST_B und den Innenstadt-Einsatzbereich gemeinsam zeigen, um Lastanstieg und BOS-Priorisierung räumlich einzuordnen."
          }
        },
        recommendedBookmarkByState: {
          READY: "CAM_CITY_OVERVIEW",
          CALL_RECEIVED: "CAM_INCIDENT_W14",
          ALARMING: "CAM_CITY_OVERVIEW",
          CLEARING_CORRIDOR: "CAM_CITY_OVERVIEW",
          ENROUTE: "CAM_INCIDENT_W14",
          ON_SCENE: "CAM_INCIDENT_W14",
          LEAK_ESCALATING: "CAM_INCIDENT_W14",
          OVERLOADED: "CAM_COMMUNICATION_MAST_B",
          BOS_ACTIVE: "CAM_COMMUNICATION_MAST_B",
          COMMS_STABLE: "CAM_COMMUNICATION_MAST_B",
          WATER_ISOLATED: "CAM_INCIDENT_W14",
          REPAIRING: "CAM_INCIDENT_W14",
          COMPLETED: "CAM_INCIDENT_W14",
          RETURNING: "CAM_CITY_OVERVIEW",
          FAILED: "CAM_CITY_OVERVIEW"
        }
      },
      MISSION_004: {
        number: "004",
        title: "Verkehrsunfall",
        networkTowerId: "MAST_C",
        incidentReference: { x: 31.6, y: 1.8, z: 40.3 },
        bookmarkOverrides: {
          CAM_CUSTOMER_START: {
            label: "Kundenstart – Mission 004",
            purpose: "Neutraler Einstieg vor der gef\u00fchrten Verkehrsunfall-Demo."
          },
          CAM_CITY_OVERVIEW: {
            label: "Ring Nord & Gesundheitsquartier",
            position: { x: 7, y: 16, z: 53 },
            target: { x: 31.6, y: 2.0, z: 40.3 },
            fov: 61,
            purpose: "Ring Nord, Unfallbereich und Gesundheitsquartier gemeinsam zeigen, ohne in eine zu hohe Vogelperspektive zu wechseln."
          },
          CAM_INCIDENT_W14: {
            label: "Einsatzstelle Verkehrsunfall",
            position: { x: 18, y: 9, z: 52 },
            target: { x: 31.6, y: 1.8, z: 40.3 },
            fov: 52,
            purpose: "Unfallfahrzeuge, Patient, Zuschauer und Einsatzkräfte aus einer nahen, stabilen Präsentationsperspektive zeigen."
          },
          CAM_COMMUNICATION_MAST_B: {
            label: "Unfallzelle & MAST_C",
            position: { x: 53, y: 16, z: 53 },
            target: { x: 43, y: 7.0, z: 38 },
            fov: 62,
            purpose: "MAST_C und den Unfallbereich gemeinsam zeigen, damit frühe Überlastung und anschließende BOS-Priorisierung direkt nachvollziehbar sind."
          }
        },
        recommendedBookmarkByState: {
          READY: "CAM_CITY_OVERVIEW",
          CALL_RECEIVED: "CAM_INCIDENT_W14",
          ALARMING: "CAM_CITY_OVERVIEW",
          ROAD_CLOSURE: "CAM_INCIDENT_W14",
          ENROUTE: "CAM_INCIDENT_W14",
          ON_SCENE: "CAM_INCIDENT_W14",
          OVERLOADED: "CAM_COMMUNICATION_MAST_B",
          BOS_ACTIVE: "CAM_COMMUNICATION_MAST_B",
          COMMS_STABLE: "CAM_COMMUNICATION_MAST_B",
          EXTRICATION: "CAM_INCIDENT_W14",
          PATIENT_READY: "CAM_INCIDENT_W14",
          COMPLETED: "CAM_INCIDENT_W14",
          TRANSPORTING: "CAM_CITY_OVERVIEW",
          AT_HOSPITAL: "CAM_CITY_OVERVIEW",
          RETURNING: "CAM_CITY_OVERVIEW",
          FAILED: "CAM_CITY_OVERVIEW"
        }
      }
    },
    missionCameraProfileExpectedCounts: {
      missions: 4,
      bookmarksPerMission: 4,
      resolvedBookmarks: 16
    }
  },
  presenterPanel: {
    title: "Demo & Kamera",
    modeLabel: "Demo-Steuerung",
    freeModeLabel: "Freie Erkundung",
    nextActionLabel: "Nächster Schritt",
    resetLabel: "Demo zurücksetzen",
    cameraLabel: "Kamera",
    symbolicHint: "Kamerawahlen und Aktionen erfolgen ausschließlich manuell.",
    defaultVisible: true,
    defaultGuidedMode: false
  },
  stateHints: {
    READY: {
      title: "Bereitschaft",
      message: "Stadt und BOS-Infrastruktur kurz einordnen. Danach Mission 001 manuell starten.",
      recommendedBookmarkId: "CAM_CITY_OVERVIEW",
      nextAction: "START_MISSION",
      nextActionLabel: "Mission 001 starten"
    },
    CALL_RECEIVED: {
      title: "112-Meldung",
      message: "Die Leitstelle nimmt den Wohnungsbrand an W14 auf. Der Ablauf läuft kontrolliert weiter.",
      recommendedBookmarkId: "CAM_CITY_OVERVIEW",
      nextAction: "NONE",
      nextActionLabel: "Alarmierung läuft"
    },
    CLEARING_CORRIDOR: {
      title: "Korridor räumen",
      message: "Das zivile Fahrzeug räumt den gemeinsam genutzten BOS-Boulevard.",
      recommendedBookmarkId: "CAM_CITY_OVERVIEW",
      nextAction: "NONE",
      nextActionLabel: "Korridor wird geräumt"
    },
    DISPATCHING: {
      title: "Alarmierung",
      message: "Feuerwehr und Polizei werden nach bestätigter Korridorräumung entsandt.",
      recommendedBookmarkId: "CAM_CITY_OVERVIEW",
      nextAction: "NONE",
      nextActionLabel: "Einsatzkräfte starten"
    },
    ENROUTE: {
      title: "Einsatzanfahrt",
      message: "Die Einsatzfahrzeuge folgen der validierten Route zu W14.",
      recommendedBookmarkId: "CAM_INCIDENT_W14",
      nextAction: "NONE",
      nextActionLabel: "Anfahrt beobachten"
    },
    ON_SCENE: {
      title: "Einsatzstelle",
      message: "Einsatzkräfte, Absperrung und Zuschauer werden sichtbar. Die zivile Nutzung steigt.",
      recommendedBookmarkId: "CAM_INCIDENT_W14",
      nextAction: "NONE",
      nextActionLabel: "Einsatzstelle erklären"
    },
    OVERLOADED: {
      title: "Netzüberlast",
      message: "Zuschauer filmen weiter. Die BOS-Kommunikation ist instabil. BOS-Spur jetzt manuell aktivieren.",
      recommendedBookmarkId: "CAM_COMMUNICATION_MAST_B",
      nextAction: "ACTIVATE_BOS",
      nextActionLabel: "BOS-Spur aktivieren"
    },
    BOS_ACTIVE: {
      title: "Priorisierung aktiv",
      message: "Die priorisierte BOS-Verbindung baut sich auf; die zivile Netzlast bleibt hoch.",
      recommendedBookmarkId: "CAM_COMMUNICATION_MAST_B",
      nextAction: "NONE",
      nextActionLabel: "Priorisierung wird aufgebaut"
    },
    COMMS_STABLE: {
      title: "BOS-Kommunikation stabil",
      message: "Leitstelle, Mast, Feuerwehr und Polizei bleiben stabil verbunden, obwohl die zivile Last hoch bleibt.",
      recommendedBookmarkId: "CAM_COMMUNICATION_MAST_B",
      nextAction: "NONE",
      nextActionLabel: "Telekom-Effekt erklären"
    },
    COMPLETED: {
      title: "Einsatz unter Kontrolle",
      message: "Kernaussage zusammenfassen und anschließend die kontrollierte Rückfahrt starten.",
      recommendedBookmarkId: "CAM_INCIDENT_W14",
      nextAction: "FINISH_AND_RETURN",
      nextActionLabel: "Einsatz beenden"
    },
    RETURNING: {
      title: "Rückfahrt & Reset",
      message: "Einsatzfahrzeuge kehren zurück. Danach werden Netzlast, BOS und Mission automatisch auf Bereitschaft gesetzt.",
      recommendedBookmarkId: "CAM_CITY_OVERVIEW",
      nextAction: "NONE",
      nextActionLabel: "Reset läuft"
    },
    FAILED: {
      title: "Sicherheitsstopp",
      message: "Die Demo wurde durch eine Sicherheitsprüfung angehalten. Keine weiteren Aktionen ausführen.",
      recommendedBookmarkId: "CAM_CITY_OVERVIEW",
      nextAction: "NONE",
      nextActionLabel: "Prüfung erforderlich"
    }
  },
  actionPolicy: {
    allowedActionsByState: {
      READY: ["START_MISSION"],
      OVERLOADED: ["ACTIVATE_BOS"],
      COMPLETED: ["FINISH_AND_RETURN"]
    },
    resetBehavior: {
      READY: "RESET_VIEW_AND_BASELINE",
      COMPLETED: "FINISH_AND_RETURN",
      RETURNING: "WAIT_FOR_CONTROLLED_RESET",
      ACTIVE_OTHER: "DISABLED"
    }
  },
  expectedCounts: {
    cameraBookmarks: 4,
    stateHints: 12,
    actionableStates: 3,
    automaticCameraTransitions: 0,
    automaticMissionActions: 0
  }
};
