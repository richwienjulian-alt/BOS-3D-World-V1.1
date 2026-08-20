# Mission BOS – Build 013M.4 Changelog

## Titel
Mission 004 – No-Cross-Unfallstellensicherung, kollisionsfreier Rücklauf und frühe Rettungswagen-Überlastung

## Implementierungsbasis
- Quelle: `Mission-BOS-Build-013M.3`
- Verifizierter Quellarchiv-SHA-256: `03388ae6b1fde38a9bb622622afdc7434ba4fb648f3ba2f378c06c48e2bf975b`
- Ältere Builds wurden nicht als Implementierungsquelle verwendet.

## Verbindliche Preparation-Dateien
Folgende Dateien wurden bytegenau aus dem Preparation-Paket übernommen und nicht verändert:
- `city-mission-004-plan.js`
- `mission-004-validator.js`
- `city-mission-004-correction-contract.js`
- `mission-004-correction-contract-validator.js`
- `mission-004-traffic-swept-path-validator.js`
- `mission-004-return-route-validator.js`
- `mission-004-network-timing-validator.js`

## Korrektur A – ziviler Ringverkehr / No-Cross
- `computeSafeHoldAssignment()` unterscheidet jetzt Upstream, Critical Approach und sicheren Downstream.
- Fahrzeuge im Critical Approach `30.5 ... 88.0` werden nicht mehr über die Unfallstelle zum Downstream-Hold geführt.
- Für Critical-Approach-Fahrzeuge existiert die deterministische Clearance-Art `NON_CROSSING_ESCAPE`.
- `city-traffic-renderer.js` besitzt dafür eine additive Mission-004-Relocation-API mit seitlicher Escape-/Hold-/Rejoin-Trajektorie.
- Befindet sich ein Fahrzeug beim Missionsstart bereits im künftigen Incident-Footprint, wird die geometrisch validierte Relocation noch vor dem ersten sichtbaren Unfallstellen-Frame ausgeführt. Es gibt keinen sichtbaren Sprung durch die Unfallstelle.
- `MissionBosMission004ResponseController.getTrafficClearanceTrajectory()` stellt die finale deterministische Clearance-Trajektorie für den Frozen Swept-Path-Validator bereit.
- Dispatch bleibt an die vollständige Freigabe des geschützten BOS-Korridors gekoppelt.
- Die 013M.3-Rücklauf-Freigabeschränkung bleibt erhalten: ziviler Verkehr wird erst nach sicherer Feuerwehr-/Polizeirückkehr, Szenenräumung und Verlassen der Closure Zone durch den Rettungswagen freigegeben.

## Korrektur B – Feuerwehr/Polizei Rücklauf
- Feuerwehr: `returnDelaySeconds = 0.0`.
- Polizei: `returnDelaySeconds = 1.5`.
- `city-response-vehicle-renderer.js` validiert Mission-004-Routenprofile jetzt zusätzlich über den vollständigen RETURN mit Return-Delay, Return-Speed, Reverse Heading, Fahrzeug-Footprints und Safety Margin.
- Mission-004-Routenprofile werden abgelehnt, wenn die Rückfahrt kollidiert.

## Korrektur C – frühe Incident-Cell-Überlastung
- Mission 004 verwendet weiterhin ausschließlich die bestehende dynamische Association-/Radio-Runtime.
- Incident Cell wird aus den realen Mission-004-Zuschauer-Associations abgeleitet; keine feste Tower-Zuweisung wurde ergänzt.
- Load-Phasen: CALL_RECEIVED ~62 %, ALARMING ~70 %, ROAD_CLOSURE ~80 %, ENROUTE vor bestätigtem Ambulance-Milestone ~88 %.
- Der Ambulance-Milestone ist in `app.js` die Kombination aus realem `AMBULANCE_01 = AT_INCIDENT` und bestätigter Serving Cell = dynamisch ermittelter Incident Cell.
- Erst danach erhält die Incident Cell das 100-%-Ziel.
- Die bestehende zentrale Auto-BOS-Priority bleibt alleiniger Priority-Aktor; Mission 004 setzt Priority nicht direkt.
- Die gemeinsame Update-Reihenfolge bleibt: Association -> Cell Load -> Auto BOS Priority -> Capacity.
- Für das bestehende Handover-Margin von Feuerwehr/Polizei wird nach bestätigtem Ambulance-Milestone deren jeweils tatsächlich genutzte Anfahrtszelle dynamisch nur bis 88 % gestützt. Dadurch bleibt der Wechsel in die 100-%-Incident-Cell mit unverändertem Radio-/TTT-/Hysterese-Modell möglich. Es gibt keine feste Vorzellen- oder Incident-Tower-Zuweisung.
- `app.js` zeichnet eine echte Controller-Runtime-Trace auf und stellt `validateMission004NetworkTimingTrace()` bereit.

## Betroffene Produktionsdateien
- `city-traffic-renderer.js`
- `city-mission-004-response-controller.js`
- `city-mission-004-controller.js`
- `city-response-vehicle-renderer.js`
- `city-cell-load-controller.js`
- `app.js`
- `index.html`
- `mission-004-traffic-closure-regression-validator.js`

## Geschützte Bereiche
Die Hash-Prüfung bestätigt unveränderte geschützte Kernquellen, u. a. Missionen 001–003, `city-network-radio-model.js`, `city-network-association-controller.js`, Unified BOS Connectivity, Tower Load Indicator, BOS Activation Impact, Stadtlayout und Traffic-Plan.

## Abnahmestatus
Die deterministischen technischen Prüfungen sind PASSED. Die verpflichtenden fünf Browser-Sichtfahrten konnten in der isolierten Build-Umgebung wegen Browser-Policy/CDN-Ladebeschränkung nicht ausgeführt werden. Build 013M.4 wird daher noch **nicht als vollständig freigegebener interner Release Candidate** bezeichnet.
