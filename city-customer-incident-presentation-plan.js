/* Mission BOS - Build 013M.18
   Pure customer-facing incident presentation layer. No mission state or timing logic.
*/
(function (root) {
  "use strict";
  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }
  root.MISSION_BOS_CUSTOMER_INCIDENT_PRESENTATION_PLAN = deepFreeze({
  "build": "013M.18",
  "sourceBuildRequired": "Mission-BOS-Build-013M.17",
  "sourceArchiveSha256Required": "ea46e0102b346fa8ca21990da6e090e58a721686d76a948b485ab1c0372e4b92",
  "mode": "CUSTOMER_PRESENTATION_ONLY",
  "structure": [
    "eyebrow",
    "title+statusBadge",
    "currentPhase",
    "description",
    "progress"
  ],
  "missions": {
    "MISSION_001": {
      "title": "Wohnungsbrand Innenstadt",
      "states": {
        "READY": {
          "summaryPhase": "Bereitschaft",
          "statusBadge": "Bereit",
          "stage": "Einsatzbereit",
          "description": "Feuerwehr und Polizei stehen für den Einsatz bereit."
        },
        "CALL_RECEIVED": {
          "summaryPhase": "Notruf",
          "statusBadge": "Aktiv",
          "stage": "Notruf eingegangen",
          "description": "Ein Wohnungsbrand in der Innenstadt wurde über 112 gemeldet."
        },
        "CLEARING_CORRIDOR": {
          "summaryPhase": "Alarmierung",
          "statusBadge": "Alarmierung",
          "stage": "Einsatzweg wird geräumt",
          "description": "Der Einsatzweg wird für die anrückenden Kräfte freigemacht."
        },
        "DISPATCHING": {
          "summaryPhase": "Alarmierung",
          "statusBadge": "Alarmierung",
          "stage": "Kräfte werden alarmiert",
          "description": "Feuerwehr und Polizei werden zur Einsatzstelle alarmiert."
        },
        "ENROUTE": {
          "summaryPhase": "Anfahrt",
          "statusBadge": "Anfahrt",
          "stage": "Einsatzkräfte unterwegs",
          "description": "Feuerwehr und Polizei fahren zum Wohnungsbrand."
        },
        "ON_SCENE": {
          "summaryPhase": "Einsatzstelle",
          "statusBadge": "Vor Ort",
          "stage": "Lageerkundung vor Ort",
          "description": "Die Einsatzkräfte sichern die Einsatzstelle und beginnen mit der Lageerkundung."
        },
        "OVERLOADED": {
          "summaryPhase": "Netzbelastung",
          "statusBadge": "Netzlast",
          "stage": "Funkzelle überlastet",
          "description": "Die hohe zivile Nutzung überlastet die Funkzelle im Einsatzgebiet."
        },
        "BOS_ACTIVE": {
          "summaryPhase": "Priorisierung",
          "statusBadge": "Priorisiert",
          "stage": "Priorisierung aktiv",
          "description": "Die Kommunikation der Einsatzkräfte wird automatisch priorisiert."
        },
        "COMMS_STABLE": {
          "summaryPhase": "Stabilisierung",
          "statusBadge": "Stabil",
          "stage": "Kommunikation stabil",
          "description": "Die priorisierte Einsatzkommunikation läuft trotz hoher Netzlast stabil."
        },
        "COMPLETED": {
          "summaryPhase": "Abschluss",
          "statusBadge": "Abschluss",
          "stage": "Einsatzphase abgeschlossen",
          "description": "Die Kommunikationslage ist stabil und die Einsatzphase kann beendet werden."
        },
        "RETURNING": {
          "summaryPhase": "Rückfahrt",
          "statusBadge": "Rückfahrt",
          "stage": "Einsatzkräfte auf Rückfahrt",
          "description": "Feuerwehr und Polizei kehren zu ihren Ausgangsstandorten zurück."
        },
        "FAILED": {
          "summaryPhase": "Sicherheitsstopp",
          "statusBadge": "Stopp",
          "stage": "Sicherheitsstopp",
          "description": "Die Mission wurde aus Sicherheitsgründen kontrolliert angehalten."
        }
      }
    },
    "MISSION_002": {
      "title": "Medizinischer Notfall an der Arena",
      "states": {
        "READY": {
          "summaryPhase": "Bereitschaft",
          "statusBadge": "Bereit",
          "stage": "Einsatzbereit",
          "description": "Arena-Veranstaltung und Rettungsdienst sind einsatzbereit."
        },
        "EVENT_ACTIVE": {
          "summaryPhase": "Veranstaltung",
          "statusBadge": "Veranstaltung",
          "stage": "Veranstaltung läuft",
          "description": "Die Arena-Veranstaltung läuft und erzeugt bereits eine hohe zivile Netzlast."
        },
        "CALL_RECEIVED": {
          "summaryPhase": "Notruf",
          "statusBadge": "Aktiv",
          "stage": "Notfall gemeldet",
          "description": "Ein medizinischer Notfall im Arena-Bereich wurde gemeldet."
        },
        "CLEARING_CORRIDOR": {
          "summaryPhase": "Alarmierung",
          "statusBadge": "Alarmierung",
          "stage": "Rettungsweg wird freigegeben",
          "description": "Der Rettungsweg zur Arena wird für den Rettungswagen freigehalten."
        },
        "ENROUTE": {
          "summaryPhase": "Anfahrt",
          "statusBadge": "Anfahrt",
          "stage": "Rettungswagen unterwegs",
          "description": "Der Rettungswagen fährt zur Arena und bleibt mobilfunkseitig verbunden."
        },
        "ON_SCENE": {
          "summaryPhase": "Einsatzstelle",
          "statusBadge": "Vor Ort",
          "stage": "Versorgung beginnt",
          "description": "Der Rettungsdienst erreicht den Patienten und beginnt mit der Versorgung."
        },
        "OVERLOADED": {
          "summaryPhase": "Netzbelastung",
          "statusBadge": "Netzlast",
          "stage": "Funkzelle überlastet",
          "description": "Die hohe Arena-Nutzung überlastet die Funkzelle am Einsatzort."
        },
        "BOS_ACTIVE": {
          "summaryPhase": "Priorisierung",
          "statusBadge": "Priorisiert",
          "stage": "Priorisierung aktiv",
          "description": "Die Kommunikation des Rettungsdienstes wird automatisch priorisiert."
        },
        "COMMS_STABLE": {
          "summaryPhase": "Stabilisierung",
          "statusBadge": "Stabil",
          "stage": "Kommunikation stabil",
          "description": "Die priorisierte Rettungsdienst-Kommunikation bleibt trotz hoher Netzlast stabil."
        },
        "TREATMENT": {
          "summaryPhase": "Versorgung",
          "statusBadge": "Versorgung",
          "stage": "Patient wird versorgt",
          "description": "Der Patient wird vor Ort medizinisch versorgt."
        },
        "COMPLETED": {
          "summaryPhase": "Transport",
          "statusBadge": "Transport",
          "stage": "Patient transportbereit",
          "description": "Der Patient ist transportbereit und kann ins Krankenhaus gebracht werden."
        },
        "TRANSPORTING": {
          "summaryPhase": "Transport",
          "statusBadge": "Transport",
          "stage": "Fahrt zum Krankenhaus",
          "description": "Der Rettungswagen transportiert den Patienten zum Krankenhaus."
        },
        "AT_HOSPITAL": {
          "summaryPhase": "Übergabe",
          "statusBadge": "Übergabe",
          "stage": "Patientenübergabe",
          "description": "Der Patient wird am Krankenhaus an das medizinische Personal übergeben."
        },
        "RETURNING": {
          "summaryPhase": "Rückfahrt",
          "statusBadge": "Rückfahrt",
          "stage": "Rettungswagen auf Rückfahrt",
          "description": "Der Rettungswagen kehrt zur Rettungswache zurück."
        },
        "FAILED": {
          "summaryPhase": "Sicherheitsstopp",
          "statusBadge": "Stopp",
          "stage": "Sicherheitsstopp",
          "description": "Die Mission wurde aus Sicherheitsgründen kontrolliert angehalten."
        }
      }
    },
    "MISSION_003": {
      "title": "Wasserleitungsleck Innenstadt",
      "states": {
        "READY": {
          "summaryPhase": "Bereitschaft",
          "statusBadge": "Bereit",
          "stage": "Einsatzbereit",
          "description": "Stadtwerke, Feuerwehr und Polizei stehen für den Einsatz bereit."
        },
        "CALL_RECEIVED": {
          "summaryPhase": "Störungsmeldung",
          "statusBadge": "Aktiv",
          "stage": "Störung gemeldet",
          "description": "Ein Wasserleitungsleck in der Innenstadt wurde gemeldet."
        },
        "ALARMING": {
          "summaryPhase": "Alarmierung",
          "statusBadge": "Alarmierung",
          "stage": "Kräfte werden alarmiert",
          "description": "Stadtwerke, Feuerwehr und Polizei werden gemeinsam alarmiert."
        },
        "CLEARING_CORRIDOR": {
          "summaryPhase": "Verkehr",
          "statusBadge": "Verkehr",
          "stage": "Einsatzweg wird freigehalten",
          "description": "Der Verkehr wird kontrolliert angehalten und der Einsatzweg freigehalten."
        },
        "ENROUTE": {
          "summaryPhase": "Anfahrt",
          "statusBadge": "Anfahrt",
          "stage": "Einsatzkräfte unterwegs",
          "description": "Stadtwerke, Feuerwehr und Polizei fahren zur Einsatzstelle."
        },
        "ON_SCENE": {
          "summaryPhase": "Einsatzstelle",
          "statusBadge": "Vor Ort",
          "stage": "Einsatzstelle gesichert",
          "description": "Die Einsatzkräfte sichern den Bereich rund um das Wasserleitungsleck."
        },
        "LEAK_ESCALATING": {
          "summaryPhase": "Lageentwicklung",
          "statusBadge": "Lage",
          "stage": "Lage verschärft sich",
          "description": "Der zunehmende Einsatzbetrieb erhöht die lokale Netzlast."
        },
        "OVERLOADED": {
          "summaryPhase": "Netzbelastung",
          "statusBadge": "Netzlast",
          "stage": "Funkzelle überlastet",
          "description": "Die hohe Nutzung überlastet die Funkzelle im Innenstadtbereich."
        },
        "BOS_ACTIVE": {
          "summaryPhase": "Priorisierung",
          "statusBadge": "Priorisiert",
          "stage": "Priorisierung aktiv",
          "description": "Die Kommunikation von Feuerwehr und Polizei wird automatisch priorisiert."
        },
        "COMMS_STABLE": {
          "summaryPhase": "Stabilisierung",
          "statusBadge": "Stabil",
          "stage": "Kommunikation stabil",
          "description": "Die Einsatzkoordination bleibt trotz hoher Netzlast stabil."
        },
        "WATER_ISOLATED": {
          "summaryPhase": "Absperrung",
          "statusBadge": "Absperrung",
          "stage": "Leitung abgesperrt",
          "description": "Die betroffene Wasserleitung ist abgesperrt und der Austritt gestoppt."
        },
        "REPAIRING": {
          "summaryPhase": "Reparatur",
          "statusBadge": "Reparatur",
          "stage": "Leitung wird repariert",
          "description": "Die Stadtwerke sichern und reparieren die beschädigte Leitung."
        },
        "COMPLETED": {
          "summaryPhase": "Abschluss",
          "statusBadge": "Abschluss",
          "stage": "Einsatzphase abgeschlossen",
          "description": "Die Leitung ist gesichert und der Einsatz kann beendet werden."
        },
        "RETURNING": {
          "summaryPhase": "Rückfahrt",
          "statusBadge": "Rückfahrt",
          "stage": "Einsatzkräfte auf Rückfahrt",
          "description": "Stadtwerke, Feuerwehr und Polizei kehren zu ihren Standorten zurück."
        },
        "FAILED": {
          "summaryPhase": "Sicherheitsstopp",
          "statusBadge": "Stopp",
          "stage": "Sicherheitsstopp",
          "description": "Die Mission wurde aus Sicherheitsgründen kontrolliert angehalten."
        }
      }
    },
    "MISSION_004": {
      "title": "Verkehrsunfall Ringstraße Nord",
      "states": {
        "READY": {
          "summaryPhase": "Bereitschaft",
          "statusBadge": "Bereit",
          "stage": "Einsatzbereit",
          "description": "Feuerwehr, Polizei und Rettungsdienst stehen für den Einsatz bereit."
        },
        "CALL_RECEIVED": {
          "summaryPhase": "Notruf",
          "statusBadge": "Aktiv",
          "stage": "Unfall gemeldet",
          "description": "Ein Verkehrsunfall auf der Ringstraße Nord wurde gemeldet."
        },
        "ALARMING": {
          "summaryPhase": "Alarmierung",
          "statusBadge": "Alarmierung",
          "stage": "Kräfte werden alarmiert",
          "description": "Feuerwehr, Polizei und Rettungsdienst werden gemeinsam alarmiert."
        },
        "ROAD_CLOSURE": {
          "summaryPhase": "Verkehr",
          "statusBadge": "Verkehr",
          "stage": "Anfahrtsachse wird gesichert",
          "description": "Der Verkehr wird kontrolliert angehalten und die Anfahrtsachse freigehalten."
        },
        "ENROUTE": {
          "summaryPhase": "Anfahrt",
          "statusBadge": "Anfahrt",
          "stage": "Einsatzkräfte unterwegs",
          "description": "Die drei Einsatzfahrzeuge fahren zur Unfallstelle."
        },
        "ON_SCENE": {
          "summaryPhase": "Einsatzstelle",
          "statusBadge": "Vor Ort",
          "stage": "Unfallstelle gesichert",
          "description": "Die Einsatzkräfte sichern die Unfallstelle und versorgen den Patienten."
        },
        "OVERLOADED": {
          "summaryPhase": "Netzbelastung",
          "statusBadge": "Netzlast",
          "stage": "Funkzelle überlastet",
          "description": "Die hohe Nutzung überlastet die Funkzelle im Bereich der Unfallstelle."
        },
        "BOS_ACTIVE": {
          "summaryPhase": "Priorisierung",
          "statusBadge": "Priorisiert",
          "stage": "Priorisierung aktiv",
          "description": "Die Kommunikation aller Einsatzkräfte wird automatisch priorisiert."
        },
        "COMMS_STABLE": {
          "summaryPhase": "Stabilisierung",
          "statusBadge": "Stabil",
          "stage": "Kommunikation stabil",
          "description": "Die gemeinsame Einsatzkommunikation bleibt trotz hoher Netzlast stabil."
        },
        "EXTRICATION": {
          "summaryPhase": "Rettung",
          "statusBadge": "Rettung",
          "stage": "Technische Rettung",
          "description": "Feuerwehr und Rettungsdienst befreien und versorgen den Patienten."
        },
        "PATIENT_READY": {
          "summaryPhase": "Transport",
          "statusBadge": "Transport",
          "stage": "Patient transportbereit",
          "description": "Der Patient ist für den Transport zum Krankenhaus vorbereitet."
        },
        "COMPLETED": {
          "summaryPhase": "Abschluss",
          "statusBadge": "Abschluss",
          "stage": "Einsatzphase abgeschlossen",
          "description": "Die Rettung ist abgeschlossen und Transport sowie Rückfahrt können beginnen."
        },
        "TRANSPORTING": {
          "summaryPhase": "Transport",
          "statusBadge": "Transport",
          "stage": "Fahrt zum Krankenhaus",
          "description": "Der Rettungswagen fährt zum Krankenhaus; Feuerwehr und Polizei räumen die Unfallstelle."
        },
        "AT_HOSPITAL": {
          "summaryPhase": "Übergabe",
          "statusBadge": "Übergabe",
          "stage": "Patientenübergabe",
          "description": "Der Patient wird am Krankenhaus an das medizinische Personal übergeben."
        },
        "RETURNING": {
          "summaryPhase": "Rückfahrt",
          "statusBadge": "Rückfahrt",
          "stage": "Einsatzkräfte auf Rückfahrt",
          "description": "Alle Einsatzfahrzeuge kehren zu ihren Ausgangsstandorten zurück."
        },
        "FAILED": {
          "summaryPhase": "Sicherheitsstopp",
          "statusBadge": "Stopp",
          "stage": "Sicherheitsstopp",
          "description": "Die Mission wurde aus Sicherheitsgründen kontrolliert angehalten."
        }
      }
    }
  },
  "fallbackPolicy": {
    "missingMission": "RUNTIME",
    "missingState": "RUNTIME",
    "mustNeverFailMission": true
  }
});
})(typeof window !== "undefined" ? window : globalThis);
