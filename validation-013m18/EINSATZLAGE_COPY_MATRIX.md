# Einsatzlage – Copy Matrix Mission 001–004

Diese Matrix ist die vorgeschlagene sichtbare Customer-Presentation-Layer. State-IDs bleiben technische Schlüssel und werden nicht im Dashboard angezeigt.

## 001 – Wohnungsbrand Innenstadt

| State | Einsatzphase | Statuspill | Aktuelle Phase | Beschreibung |
| --- | --- | --- | --- | --- |
| READY | Bereitschaft | Bereit | Einsatzbereit | Feuerwehr und Polizei stehen für den Einsatz bereit. |
| CALL_RECEIVED | Notruf | Aktiv | Notruf eingegangen | Ein Wohnungsbrand in der Innenstadt wurde über 112 gemeldet. |
| CLEARING_CORRIDOR | Alarmierung | Alarmierung | Einsatzweg wird geräumt | Der Einsatzweg wird für die anrückenden Kräfte freigemacht. |
| DISPATCHING | Alarmierung | Alarmierung | Kräfte werden alarmiert | Feuerwehr und Polizei werden zur Einsatzstelle alarmiert. |
| ENROUTE | Anfahrt | Anfahrt | Einsatzkräfte unterwegs | Feuerwehr und Polizei fahren zum Wohnungsbrand. |
| ON_SCENE | Einsatzstelle | Vor Ort | Lageerkundung vor Ort | Die Einsatzkräfte sichern die Einsatzstelle und beginnen mit der Lageerkundung. |
| OVERLOADED | Netzbelastung | Netzlast | Funkzelle überlastet | Die hohe zivile Nutzung überlastet die Funkzelle im Einsatzgebiet. |
| BOS_ACTIVE | Priorisierung | Priorisiert | Priorisierung aktiv | Die Kommunikation der Einsatzkräfte wird automatisch priorisiert. |
| COMMS_STABLE | Stabilisierung | Stabil | Kommunikation stabil | Die priorisierte Einsatzkommunikation läuft trotz hoher Netzlast stabil. |
| COMPLETED | Abschluss | Abschluss | Einsatzphase abgeschlossen | Die Kommunikationslage ist stabil und die Einsatzphase kann beendet werden. |
| RETURNING | Rückfahrt | Rückfahrt | Einsatzkräfte auf Rückfahrt | Feuerwehr und Polizei kehren zu ihren Ausgangsstandorten zurück. |
| FAILED | Sicherheitsstopp | Stopp | Sicherheitsstopp | Die Mission wurde aus Sicherheitsgründen kontrolliert angehalten. |

## 002 – Medizinischer Notfall an der Arena

| State | Einsatzphase | Statuspill | Aktuelle Phase | Beschreibung |
| --- | --- | --- | --- | --- |
| READY | Bereitschaft | Bereit | Einsatzbereit | Arena-Veranstaltung und Rettungsdienst sind einsatzbereit. |
| EVENT_ACTIVE | Veranstaltung | Veranstaltung | Veranstaltung läuft | Die Arena-Veranstaltung läuft und erzeugt bereits eine hohe zivile Netzlast. |
| CALL_RECEIVED | Notruf | Aktiv | Notfall gemeldet | Ein medizinischer Notfall im Arena-Bereich wurde gemeldet. |
| CLEARING_CORRIDOR | Alarmierung | Alarmierung | Rettungsweg wird freigegeben | Der Rettungsweg zur Arena wird für den Rettungswagen freigehalten. |
| ENROUTE | Anfahrt | Anfahrt | Rettungswagen unterwegs | Der Rettungswagen fährt zur Arena und bleibt mobilfunkseitig verbunden. |
| ON_SCENE | Einsatzstelle | Vor Ort | Versorgung beginnt | Der Rettungsdienst erreicht den Patienten und beginnt mit der Versorgung. |
| OVERLOADED | Netzbelastung | Netzlast | Funkzelle überlastet | Die hohe Arena-Nutzung überlastet die Funkzelle am Einsatzort. |
| BOS_ACTIVE | Priorisierung | Priorisiert | Priorisierung aktiv | Die Kommunikation des Rettungsdienstes wird automatisch priorisiert. |
| COMMS_STABLE | Stabilisierung | Stabil | Kommunikation stabil | Die priorisierte Rettungsdienst-Kommunikation bleibt trotz hoher Netzlast stabil. |
| TREATMENT | Versorgung | Versorgung | Patient wird versorgt | Der Patient wird vor Ort medizinisch versorgt. |
| COMPLETED | Transport | Transport | Patient transportbereit | Der Patient ist transportbereit und kann ins Krankenhaus gebracht werden. |
| TRANSPORTING | Transport | Transport | Fahrt zum Krankenhaus | Der Rettungswagen transportiert den Patienten zum Krankenhaus. |
| AT_HOSPITAL | Übergabe | Übergabe | Patientenübergabe | Der Patient wird am Krankenhaus an das medizinische Personal übergeben. |
| RETURNING | Rückfahrt | Rückfahrt | Rettungswagen auf Rückfahrt | Der Rettungswagen kehrt zur Rettungswache zurück. |
| FAILED | Sicherheitsstopp | Stopp | Sicherheitsstopp | Die Mission wurde aus Sicherheitsgründen kontrolliert angehalten. |

## 003 – Wasserleitungsleck Innenstadt

| State | Einsatzphase | Statuspill | Aktuelle Phase | Beschreibung |
| --- | --- | --- | --- | --- |
| READY | Bereitschaft | Bereit | Einsatzbereit | Stadtwerke, Feuerwehr und Polizei stehen für den Einsatz bereit. |
| CALL_RECEIVED | Störungsmeldung | Aktiv | Störung gemeldet | Ein Wasserleitungsleck in der Innenstadt wurde gemeldet. |
| ALARMING | Alarmierung | Alarmierung | Kräfte werden alarmiert | Stadtwerke, Feuerwehr und Polizei werden gemeinsam alarmiert. |
| CLEARING_CORRIDOR | Verkehr | Verkehr | Einsatzweg wird freigehalten | Der Verkehr wird kontrolliert angehalten und der Einsatzweg freigehalten. |
| ENROUTE | Anfahrt | Anfahrt | Einsatzkräfte unterwegs | Stadtwerke, Feuerwehr und Polizei fahren zur Einsatzstelle. |
| ON_SCENE | Einsatzstelle | Vor Ort | Einsatzstelle gesichert | Die Einsatzkräfte sichern den Bereich rund um das Wasserleitungsleck. |
| LEAK_ESCALATING | Lageentwicklung | Lage | Lage verschärft sich | Der zunehmende Einsatzbetrieb erhöht die lokale Netzlast. |
| OVERLOADED | Netzbelastung | Netzlast | Funkzelle überlastet | Die hohe Nutzung überlastet die Funkzelle im Innenstadtbereich. |
| BOS_ACTIVE | Priorisierung | Priorisiert | Priorisierung aktiv | Die Kommunikation von Feuerwehr und Polizei wird automatisch priorisiert. |
| COMMS_STABLE | Stabilisierung | Stabil | Kommunikation stabil | Die Einsatzkoordination bleibt trotz hoher Netzlast stabil. |
| WATER_ISOLATED | Absperrung | Absperrung | Leitung abgesperrt | Die betroffene Wasserleitung ist abgesperrt und der Austritt gestoppt. |
| REPAIRING | Reparatur | Reparatur | Leitung wird repariert | Die Stadtwerke sichern und reparieren die beschädigte Leitung. |
| COMPLETED | Abschluss | Abschluss | Einsatzphase abgeschlossen | Die Leitung ist gesichert und der Einsatz kann beendet werden. |
| RETURNING | Rückfahrt | Rückfahrt | Einsatzkräfte auf Rückfahrt | Stadtwerke, Feuerwehr und Polizei kehren zu ihren Standorten zurück. |
| FAILED | Sicherheitsstopp | Stopp | Sicherheitsstopp | Die Mission wurde aus Sicherheitsgründen kontrolliert angehalten. |

## 004 – Verkehrsunfall Ringstraße Nord

| State | Einsatzphase | Statuspill | Aktuelle Phase | Beschreibung |
| --- | --- | --- | --- | --- |
| READY | Bereitschaft | Bereit | Einsatzbereit | Feuerwehr, Polizei und Rettungsdienst stehen für den Einsatz bereit. |
| CALL_RECEIVED | Notruf | Aktiv | Unfall gemeldet | Ein Verkehrsunfall auf der Ringstraße Nord wurde gemeldet. |
| ALARMING | Alarmierung | Alarmierung | Kräfte werden alarmiert | Feuerwehr, Polizei und Rettungsdienst werden gemeinsam alarmiert. |
| ROAD_CLOSURE | Verkehr | Verkehr | Anfahrtsachse wird gesichert | Der Verkehr wird kontrolliert angehalten und die Anfahrtsachse freigehalten. |
| ENROUTE | Anfahrt | Anfahrt | Einsatzkräfte unterwegs | Die drei Einsatzfahrzeuge fahren zur Unfallstelle. |
| ON_SCENE | Einsatzstelle | Vor Ort | Unfallstelle gesichert | Die Einsatzkräfte sichern die Unfallstelle und versorgen den Patienten. |
| OVERLOADED | Netzbelastung | Netzlast | Funkzelle überlastet | Die hohe Nutzung überlastet die Funkzelle im Bereich der Unfallstelle. |
| BOS_ACTIVE | Priorisierung | Priorisiert | Priorisierung aktiv | Die Kommunikation aller Einsatzkräfte wird automatisch priorisiert. |
| COMMS_STABLE | Stabilisierung | Stabil | Kommunikation stabil | Die gemeinsame Einsatzkommunikation bleibt trotz hoher Netzlast stabil. |
| EXTRICATION | Rettung | Rettung | Technische Rettung | Feuerwehr und Rettungsdienst befreien und versorgen den Patienten. |
| PATIENT_READY | Transport | Transport | Patient transportbereit | Der Patient ist für den Transport zum Krankenhaus vorbereitet. |
| COMPLETED | Abschluss | Abschluss | Einsatzphase abgeschlossen | Die Rettung ist abgeschlossen und Transport sowie Rückfahrt können beginnen. |
| TRANSPORTING | Transport | Transport | Fahrt zum Krankenhaus | Der Rettungswagen fährt zum Krankenhaus; Feuerwehr und Polizei räumen die Unfallstelle. |
| AT_HOSPITAL | Übergabe | Übergabe | Patientenübergabe | Der Patient wird am Krankenhaus an das medizinische Personal übergeben. |
| RETURNING | Rückfahrt | Rückfahrt | Einsatzkräfte auf Rückfahrt | Alle Einsatzfahrzeuge kehren zu ihren Ausgangsstandorten zurück. |
| FAILED | Sicherheitsstopp | Stopp | Sicherheitsstopp | Die Mission wurde aus Sicherheitsgründen kontrolliert angehalten. |
