# Mission BOS – Test Report Build 013M.9

## Statusübersicht
- Root-Cause-Reproduktion 013M.8: **REPRODUCED**
- Mission-004 Plan Validator: **PASSED**
- Ambulance Corridor Validator: **PASSED**
- Build 013M.9 Source Regression: **PASSED**
- Technischer echter Ambulance+Pedestrian-Renderer-Lauf: **PASSED**
- Technische Completion Trace: **PASSED**
- Reale Browser/WebGL-Sichtabnahme: **NOT EXECUTED / PENDING**
- Formale Release-Candidate-Freigabe: **NICHT ERTEILT**

## A – Root Cause auf unveränderter 013M.8-Basis
Mit `reference-013m8-hospital-corridor-analysis.js`:
- `PED_HEALTH_01` Minimum: **0.600428 m**
- `PED_HEALTH_02` Minimum: **0.400641 m**
- Stop distance: **0.72 m**
- `PED_HEALTH_01`: **1200 / 1200** Konfliktphasen
- `PED_HEALTH_02`: **1200 / 1200** Konfliktphasen
- mindestens ein Konflikt: **1200 / 1200**
- Status: **REPRODUCED**

## B – Neue Krankenhauskorridor-Geometrie
Frozen Corridor Validator:
- Route: `AMBULANCE_M004_TO_HOSPITAL_ROUTE`
- Länge: **75.513595 m**
- Speed: **5.65 m/s**
- Referenz-Fahrzeit: **13.365 s**
- `HOSPITAL_FORECOURT`: **nicht verwendet**
- `PED_HEALTH_01` Minimum: **2.522400 m**
- `PED_HEALTH_02` Minimum: **4.000001 m**
- `surfaceErrors`: **0**
- `obstacleErrors`: **0**
- `pedestrianErrors`: **0**
- `trafficReleaseContractErrors`: **0**
- `returnRegressionErrors`: **0**
- Status: **PASSED**

## C – Echter Renderer-/Pedestrian-Runtime-Test (technisch, kein Browserersatz)
Ausgeführt mit den unveränderten produktiven Dateien `city-pedestrian-renderer.js` und `city-ambulance-renderer.js` sowie den echten Plan-/Validatorquellen. Die Three.js-Objektschicht wurde im Node-Harness ohne Rendering-Ausgabe bereitgestellt; die produktive Ambulanz- und Pedestrian-Safety selbst lief unverändert.

Ergebnis:
- Pedestrian Runtime Safety: **PASSED**
- Ambulance Runtime Safety: **PASSED**
- `TO_HOSPITAL -> AT_HOSPITAL`: **13.40 s**
- beobachtete Mindestdistanz zu `PED_HEALTH_01`: **3.001383 m**
- beobachtete Mindestdistanz zu `PED_HEALTH_02`: **4.001447 m**
- Hospital Hold: **2.50 s**
- `RETURNING -> AT_STATION`: **3.10 s**
- finaler Ambulanz-State: **AT_STATION**
- Hospital route id: `AMBULANCE_M004_TO_HOSPITAL_ROUTE`
- Return route id: `AMBULANCE_M004_HOSPITAL_TO_STATION_ROUTE`

## D – Technische Completion Trace
Datei: `MISSION_004_AMBULANCE_COMPLETION_TECHNICAL_TRACE_013M_9.json`
- Samples: **384**
- Ambulance Safety FAILED Samples: **0**
- Hospital transport: **13.40 s**
- Hospital -> real RETURNING: **2.50 s**
- RETURNING -> AT_STATION: **3.10 s**
- final: `missionState = READY`
- final: `ambulanceState = AT_STATION`
- final: `ambulanceSafetyStatus = PASSED`
- Frozen `MissionBosMission004AmbulanceCompletionTraceValidator`: **PASSED**

Wichtig: Dies ist eine technische Renderer-/Controller-Trace und wird ausdrücklich **nicht** als reale Browser-Trace ausgegeben.

## E – Ring-Traffic-Release-Gate
Echter `city-mission-004-response-controller.js` mit kontrollierten Runtimezuständen:
- während `TO_HOSPITAL`: CAR_RING_01–03 weiterhin yielded: **PASSED**
- keine Freigabe allein aufgrund `ambulanceOutsideClosureZone()`: **PASSED**
- bei realem `AT_HOSPITAL`: Ring-Yields freigegeben, sofern Fire/Police an Basis und Scene cleared: **PASSED**
- Response Safety: **PASSED**

## F – Bestehende Mission-004-Regressionen
- Correction Contract: **PASSED**
- Traffic Swept Path: **4428 Samples, 0 Crossing-, 0 Trajectory-, 0 Wrap-Fehler**
- Traffic Closure: **237 Startphasen**, max. Dispatch-ready **5.369 s**, **PASSED**
- Fire/Police Return: `baselineTurningCollisionDetected = true`, erste Baseline-Kollision **0.05 s**, konfiguriert **0 Kollisionen**, Fire Gate **3.34 s**, Police Turn **4.00 s**, Total Return **28.80 s**, **PASSED**
- Downtown Return Corridor: Baseline **897 / 1201** Konfliktphasen, alle Holds **0 Kollisionen**, **PASSED**
- Network Timing: Ambulance **14.70 s**, Incident 100 % **15.15 s**, Auto Priority **15.35 s**, Fire **36.95 s**, Police **37.95 s**, **PASSED**
- 013M.8 Ambulance Return Contract Compatibility: **PASSED**
- 013M.7 Fire/Police Return Maneuver Compatibility: **PASSED**
- 013M.7 Mission-004 Polish Compatibility: **PASSED**

## G – Source-/Regression-Schutz
- Preparation Protected Baseline Hashes: **20 / 20 unverändert**
- Mission-001/002/003-Dateien: **34 / 34 byteidentisch** zur 013M.8-Basis
- 013M.9 Frozen Dateien: **7 / 7 byteidentisch** zur Preparation
- `build-013m9-source-regression-validator.js`: **PASSED**

## H – Reale Browser-/WebGL-Abnahme
**NOT EXECUTED / PENDING.**

Der lokale Chromium-Prozess konnte den finalen Build in dieser Sandbox nicht laden: Der lokale HTTP-Server erhielt keinen Seitenrequest, `--dump-dom` lieferte keinen App-DOM und Chromium blieb bis zum externen Timeout hängen. Es wird daher kein Browser-PASS behauptet.

Die zwingende Endabnahme bleibt lokal/GitHub:
`READY -> Einsatz -> COMPLETED -> TO_HOSPITAL -> AT_HOSPITAL -> RETURNING -> AT_STATION -> READY`, durchgehend Ambulance Runtime Safety `PASSED`.

## I – Finale Buildintegrität
- JavaScript Syntax (`node --check`): **160 / 160 PASSED**
- lokale `<script src>`-Referenzen aus `index.html`: **154 / 154 vorhanden**
- Duplicate DOM IDs: **0**
- Dashboard Buildreferenz: **Build 013M.9**
- interne `SHA256SUMS.txt`: **237 / 237 verifiziert**
- ZIP-/Archivprüfung: siehe finale Paketprüfung.
