# Mission BOS – Build 013M.8 Changelog

## Titel
**Mission 004 Final Completion – verbindlicher Rettungswagen-Rücklauf und niedrige sichere Startkamera**

## Implementierungsbasis

- Basis: `Mission-BOS-Build-013M.7`
- Verifizierter Basis-SHA-256: `ca554c9a64d1d9e9446b3bada499b450f6d4b656c7ad652399daa1dc316091d4`
- Keine ältere Build-ZIP wurde als Implementierungsquelle verwendet.

## Änderung 1 – Mission-004-Rettungswagen-Rücklauf

- Der Frozen Plan aus der 013M.8-Preparation ersetzt den 013M.7-Planstand.
- Mission 004 führt jetzt die vollständige Route `AMBULANCE_M004_HOSPITAL_TO_STATION_ROUTE` im aktiven Ambulanzprofil.
- `city-ambulance-renderer.js` akzeptiert optional `hospitalReturnRoute`, bereitet sie mit dem bestehenden Open-Route-Verfahren vor und registriert sie im aktiven Profil.
- `returnToStation()` verwendet bei Mission 004 die explizite Profilroute mit 5,25 m/s; der Mission-002-Defaultpfad bleibt erhalten.
- `city-mission-004-response-controller.js` akzeptiert für die Missionstransition ausschließlich den echten Ambulanz-State `RETURNING`; ein Return-Command-Flag gilt nicht mehr als Bewegungsbeweis.
- Krankenhaus-Hold bleibt 2,5 s.
- Neuer Safety-Watchdog: maximal 0,35 s vom erfolgreichen Return-Command bis zum realen State `RETURNING`.
- Neuer Safety-Watchdog: maximal 6,0 s vom realen `RETURNING` bis `AT_STATION`.
- Kein Teleport, kein Force-Complete und kein künstliches Setzen von `AT_STATION`.
- Fire/Police-Backout, Police-Gate und Downtown-Return-Corridor bleiben unverändert.

## Änderung 2 – reale technische Ambulanz-Trace in `app.js`

Mission 004 führt während Transport/Rücklauf die unsichtbare Runtime-Trace:

```text
window.MissionBosMission004AmbulanceReturnTrace
```

Sampling: 0,05 s. Erfasst werden mindestens:

- `time`
- `missionState`
- `responseState`
- `ambulanceState`
- `routeId`
- `distance`
- `returnCommandResult` am Command-Sample

Nach einem echten Lauf kann der Frozen `MissionBosMission004AmbulanceReturnTraceValidator` die Sequenz `AT_HOSPITAL -> RETURNING -> AT_STATION` bis zum finalen `READY / AT_STATION` prüfen.

## Änderung 3 – niedrige sichere Startkamera

Automatischer Start und normaler Demo-Reset verwenden jetzt:

```text
Position: (0.78, 9.00, 46.00)
Target:   (0.78, 2.50, 10.00)
Yaw:      0.0
Pitch:   -0.17863100651394934
FOV:      56
freeCameraHeight: 9
```

Die bisherige hohe Stadtübersicht bleibt als manuell auswählbare Kameraoption erhalten. Es wurde kein automatischer Kameraflug hinzugefügt.

## Geänderte Produktionsdateien

- `city-mission-004-plan.js` – Frozen 013M.8 Planstand
- `city-mission-004-response-controller.js`
- `city-ambulance-renderer.js`
- `app.js`
- `city-presenter-plan.js` – ausschließlich für niedrigen Demo-Reset bei Erhalt der manuellen Stadtübersicht
- `index.html` – 013M.8 Contracts/Validatoren und Buildreferenz

## Neu integrierte Frozen Dateien

- `city-mission-004-ambulance-return-contract.js`
- `mission-004-ambulance-return-contract-validator.js`
- `mission-004-ambulance-return-trace-validator.js`
- `city-initial-camera-contract.js`
- `initial-camera-spawn-validator.js`
- `build-013m8-source-regression-validator.js`

Zusätzlich wurden die von der Preparation gelieferten aktualisierten Mission-004-Validatoren übernommen.

## Geschützt / unverändert

Insbesondere unverändert blieben:

- Mission 001–003 Produktionsquellen
- Customer Dashboard und `style.css`
- `city-response-vehicle-renderer.js`
- Traffic Closure / Swept Path
- Fire/Police 6-m-Backout und 4-s-Gate
- Downtown Return Corridor Reservation
- Radio-/Association-/Cell-Load-/Capacity-/Auto-Priority-Grundarchitektur
- Stadtgeometrie und Towerpositionen

## Freigabestatus

Technische Implementierung und technische Regression: **PASSED**.

Die vorgeschriebenen fünf echten WebGL-Sichtläufe konnten in der isolierten Build-Umgebung nicht ausgeführt werden, weil der verwaltete Chromium lokale HTTP-Navigation durch Administrator-Policy blockiert. Build 013M.8 wird daher in diesem Paket **noch nicht als formaler Release Candidate** bezeichnet.
