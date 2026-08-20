# Mission BOS – Build 013M.10 – Changelog

## Titel
Gemeinsame BOS-Anfahrtssequenz – kollisionsfreie Feuerwehr-/Polizei-Anfahrt für Mission 003 und Mission 004

## Implementierungsbasis
- Source: `Mission-BOS-Build-013M.9`
- Source SHA-256: `faa562ef67e48ac5613704dc1f200a0855304105e469064f9198b84b0bfd2d7f`

## Änderung
Ausschließlich die gemeinsame temporäre Response-Route-Profile-Kalibrierung in `city-response-vehicle-renderer.js` wurde geändert.

- `calibrateMission003DispatchDelays()` wurde durch das generische `calibrateOutboundDispatchDelays()` ersetzt.
- Strict Outbound SAT: 0.005 s Zeitschritt.
- Kalibrierreserve: mindestens 0.25 m.
- Delay-Suchschritt: 0.05 s.
- Nach erstem strikten Safe-Delay: zusätzliche 0.20 s Dispatch-Reserve.
- Maximales Suchfenster: 8.0 s.
- Finaler Delay wird nochmals mit derselben Strict-SAT-Prüfung validiert.
- Existiert innerhalb des Fensters kein sicherer Wert, wird das Route Profile kontrolliert abgelehnt.

Für die unveränderte Geometrie ergibt sich:
- Mission 003: Fire 0.00 s / Police 5.00 s.
- Mission 004: Fire 0.00 s / Police 5.00 s.

## Neu aufgenommen
- `city-response-outbound-sequencing-contract.js`
- `response-outbound-sequencing-contract-validator.js`
- `response-outbound-collision-validator.js`
- `build-013m10-source-regression-validator.js`
- `MISSION_003_OUTBOUND_RUNTIME_TRACE_013M_10.json`
- `MISSION_004_OUTBOUND_RUNTIME_TRACE_013M_10.json`
- `OUTBOUND_RUNTIME_HARNESS_RESULTS_013M_10.json`

## Nicht geändert
Mission-003-/004-Routen, Einsatzstellen, Geschwindigkeiten, Footprints, Stadtwerke-Timing, Mission-004-Ambulanzkorridor, Mission-004-Rücklauf, Downtown-Return-Corridor, Dashboard, Kamera, Verkehr, Fußgänger und Netzwerk-/Priority-Architektur.
