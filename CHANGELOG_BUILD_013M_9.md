# Mission BOS – Build 013M.9 Changelog

## Titel
Mission 004 Final Completion Hotfix – sicherer Krankenhauskorridor und verlässlicher Rettungswagen-Rücklauf

## Basis
- Einzige Implementierungsbasis: Mission-BOS-Build-013M.8
- Basis-SHA-256: `b2a230e8ed98928538153f1476dd86c29501d7ccd033e9475050154f03fa2409`

## Änderungen
1. Frozen `city-mission-004-plan.js` aus der 013M.9-Preparation übernommen.
2. `AMBULANCE_M004_TO_HOSPITAL_ROUTE` führt nicht mehr durch `HOSPITAL_FORECOURT`, sondern über `RING_NORTH -> RING_EAST -> NORTH_CONNECTOR -> KLINIKALLEE -> HOSPITAL_AMBULANCE_ACCESS`.
3. Die Mission-004-Ringfahrzeuge bleiben während des vollständigen Krankenhaus-Transports yielded. Freigabe erst ab realem Ambulanz-State `AT_HOSPITAL`, `RETURNING` oder `AT_STATION` sowie weiterhin erfüllten Fire/Police-/Scene-Bedingungen.
4. Die bestehende reale Ambulanz-Trace wurde um `ambulanceSafetyStatus` und `ambulanceSafetyErrors` erweitert und auf den neuen Completion-Trace-Validator umgestellt.
5. Neue Frozen 013M.9 Corridor-/Completion-/Source-Validatoren integriert.
6. Alte 013M.7/013M.8-Kompatibilitätsvalidatoren akzeptieren die neue 013M.9-Planidentität, während ihre bisherigen Return-/Polish-Kriterien unverändert bleiben.
7. Kleine technische Dashboard-Buildreferenz auf `Build 013M.9` aktualisiert.

## Unverändert geschützt
- `city-ambulance-renderer.js` und dessen 0,72-m-Pedestrian-Safety
- `city-ambulance-plan.js`
- `city-pedestrian-plan.js`
- `city-pedestrian-renderer.js`
- `city-response-vehicle-renderer.js`
- `city-mission-004-controller.js`
- Hospital-to-Station-Return-Route aus 013M.8
- Fire/Police 6-m-Backout, Gate und Downtown-Return-Corridor
- Missionen 001–003
- Customer Dashboard
- Startkamera
- Mobilfunk/Association/Cell Load/Capacity/Auto-BOS-Priority
