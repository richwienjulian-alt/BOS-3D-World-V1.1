# Mission BOS – Test Report Build 013M.8

## 1. Teststatus

```text
Implementierung:                         COMPLETE
Frozen Contract Tests:                  PASSED
Technischer Ambulanz-Renderer-Test:     PASSED
Technischer Response-/Mission-Test:     PASSED
Mission 001–003 Controller-Smokes:      PASSED
Geschützte Mission-004 Regressionen:    PASSED
Source Regression:                      PASSED
Echter WebGL-/Browser-Trace:            NOT EXECUTED
Visuelle 5-Läufe-Sichtabnahme:          NOT EXECUTED
Formaler Release Candidate:             NO
```

Der Browserstatus wird ausdrücklich getrennt geführt. Kein Node-/Mock-Three-/Controller-Harness wird als Ersatz für die vorgeschriebene reale WebGL-Sichtfahrt bezeichnet.

## 2. Basisverifikation

```text
Basis: Mission-BOS-Build-013M.7
SHA-256: ca554c9a64d1d9e9446b3bada499b450f6d4b656c7ad652399daa1dc316091d4
Ergebnis: PASSED
```

## 3. Statische / Frozen Contracts

| Prüfung | Ergebnis |
|---|---|
| Mission 004 Plan Validation | PASSED |
| Mission 004 Polish Contract Compatibility | PASSED |
| Mission 004 Return Maneuver Contract | PASSED |
| Mission 004 Ambulance Return Contract | PASSED |
| Initial Camera Spawn | PASSED |
| Presenter & Demo Control Validation | PASSED |
| Build 013M.8 Source Regression | PASSED |

Initial Camera:

```text
Position: (0.78, 9.00, 46.00)
FOV: 56
Nearest building: I05
Horizontal clearance: 10.171214 m
Required clearance: >= 3.0 m
Height range: 8–12 m
STATUS: PASSED
```

## 4. Technischer Ambulanz-Renderer-Test

Ausgeführt mit dem echten `MissionBosAmbulanceRenderer` und dem finalen Mission-004-Profil. Die Three.js-Darstellung wird im Harness minimal bereitgestellt; Bewegung, Routenaufbereitung und Renderer-State-Machine stammen aus der Produktionsdatei.

```text
Profile: MISSION_004_AMBULANCE_PROFILE
Hospital return route: AMBULANCE_M004_HOSPITAL_TO_STATION_ROUTE
Route reference length: 16.037019 m
Return speed: 5.25 m/s
Measured return duration: 3.10 s
Final ambulance state: AT_STATION
Ambulance Safety: PASSED
```

Kein Teleport und kein Force-Complete wurden verwendet.

## 5. Technischer Response-/Ambulanz-State-Trace

Ausgeführt mit echtem Mission-004-Response-Controller plus echtem Ambulanz-Renderer.

```text
First AT_HOSPITAL: 17.95 s
First RETURNING:   20.40 s
First AT_STATION:  23.50 s
Hospital -> RETURNING sampled delta: 2.45 s
RETURNING -> AT_STATION:              3.10 s
Successful return commands:           1
Final response state:                  COMPLETE
Final ambulance state:                 AT_STATION
Frozen Trace Validator:                PASSED
Response Safety:                       PASSED
```

Die 2,45-s-Samplingdifferenz entsteht durch die 0,05-s-Abtastung um den konfigurierten 2,5-s-Hold. Der Produktionswert bleibt unverändert 2,5 s.

## 6. Watchdog-Negativtests

### Return-Command-State-Watchdog

Simulierter Fehler: erfolgreicher Return-Command, Ambulanz bleibt jedoch am Krankenhaus.

```text
Deadline: 0.35 s
Erwartung: diagnostischer FAILED-State statt stilles Hängen
Ergebnis: PASSED
```

### Return-Duration-Watchdog

Simulierter Fehler: Ambulanz verbleibt dauerhaft in `RETURNING`.

```text
Deadline: 6.0 s
Erwartung: diagnostischer FAILED-State statt endloses RETURNING
Ergebnis: PASSED
```

## 7. Vollständige technische Mission-004-Controllerzyklen

10 vollständige technische Zyklen wurden mit dem echten Ambulanz-Renderer, echten Mission-004-Response-Controller und echten Mission-004-Mission-Controller ausgeführt. Network-/Scene-/FirePolice-Abhängigkeiten wurden deterministisch bereitgestellt; dies ist ein Controller-/Renderer-Test und keine WebGL-Sichtabnahme.

Alle 10 Läufe:

```text
Mission: READY -> ... -> COMPLETED -> Finish -> TRANSPORTING -> AT_HOSPITAL -> RETURNING -> READY
AMBULANCE_01: AT_HOSPITAL -> RETURNING -> AT_STATION
Return command count: 1
Fire/Police return command count: 1
network.endMission count: 1
Frozen Ambulance Return Trace Validator: PASSED
Response Safety: PASSED
Mission Safety: PASSED
```

Repräsentative Zeitwerte pro Lauf:

```text
Finish command:      23.20 s
AT_HOSPITAL:         34.75 s
RETURNING:           37.20 s
AT_STATION:          40.30 s
Mission READY:       40.30 s
Ambulance return:     3.10 s
```

## 8. Fire/Police- und Traffic-Regressionen

Unveränderte 013M.7-Schutzwerte:

```text
Traffic Swept Path samples: 4428
Incident crossing errors:   0
Trajectory errors:          0
Wrap errors:                0
STATUS:                     PASSED

Fire/Police configured collisions: 0
Fire clearance gate:              3.34 s
Police turn:                      4.00 s
Total response return:           28.80 s
STATUS:                           PASSED

Return Corridor baseline collision phase samples: 897
South hold collisions: 0
East hold collisions:  0
North hold collisions: 0
STATUS: PASSED
```

Zusätzlich wurde das Ambulanz-Hospital-Return gemeinsam mit dem echten Response-Vehicle-Renderer für Fire/Police-Return-Startverzögerungen von 0,0 / 2,0 / 4,0 / 6,6 s technisch geprüft. Ambulanz- und Response-Safety blieben jeweils `PASSED`.

## 9. Network Regression

Die vorhandene Mission-004-Netzsequenz bleibt unverändert:

```text
Ambulance milestone: 14.70 s
Incident Cell 100 %: 15.15 s
Auto Priority:        15.35 s
Fire arrival:         36.95 s
Police arrival:       37.95 s
STATUS: PASSED
```

Es wurde keine feste Tower-Zuweisung eingeführt.

## 10. Mission-002 Ambulanz-Rückwärtskompatibilität

```text
Profile: MISSION_002_DEFAULT
Return route: AMBULANCE_HOSPITAL_TO_STATION_ROUTE
Final state: AT_STATION
Ambulance Safety: PASSED
```

Die neue `hospitalReturnRoute`-Unterstützung ist optional und verändert den Mission-002-Defaultpfad nicht.

## 11. Missionen 001–003 – vollständige technische Controller-Smokes

```text
Mission 001: READY -> ... -> READY | 9.60 s  | PASSED
Mission 002: READY -> ... -> READY | 15.95 s | Ambulance AT_STATION | PASSED
Mission 003: READY -> ... -> READY | 20.70 s | PASSED
```

Diese Tests sind technische Controller-Smokes; die visuelle WebGL-Regressionsabnahme bleibt separat offen.

## 12. Reale `app.js` Runtime-Trace

Die finale `app.js` enthält die geforderte reale Trace-Instrumentierung:

```text
window.MissionBosMission004AmbulanceReturnTrace
window.MissionBosMission004AmbulanceReturnTraceValidation
```

Sampling: 0,05 s. Die Trace wird nach den realen Ambulanz-/Response-/Mission-Updates aufgebaut und kann nach einem vollständigen Browserlauf durch den Frozen Trace Validator bewertet werden.

### Browser-Ausführung in dieser Build-Umgebung

**NOT EXECUTED.** DevTools bestätigt für die Navigation auf den erfolgreichen lokalen HTTP-Endpunkt:

```text
location.href = chrome-error://chromewebdata/
document.body.innerText =
127.0.0.1 is blocked
Your organization doesn’t allow you to view this site

typeof THREE = undefined
typeof MissionBosMission004Controller = undefined
canvas count = 0
```

Damit wurde in dieser Umgebung kein echter WebGL-Lauf erzeugt und folglich auch kein echter Browser-Trace künstlich nachgestellt.

## 13. Visuelle Browser-Sichtabnahme

Gefordert: mindestens fünf vollständige Mission-004-WebGL-Läufe inklusive sichtbarer Krankenhaus-Rückfahrt und niedriger Startkamera.

```text
Ausgeführt: 0 / 5
Status: NOT EXECUTED
Grund: verwaltete Chromium-Policy blockiert lokalen Build vor dem Laden von Three.js/App-Runtime
```

Die lokale Abnahme ist in `LOCAL_TEST_INSTRUCTIONS_BUILD_013M_8.md` beschrieben.

## 14. Gesamtbewertung

Technische Implementierung und Regressionen: **PASSED**.

Formale Build-Abnahme gemäß Auftrag: **PENDING**, da die reale Browser-/WebGL-Sichtabnahme und der daraus stammende echte `window.MissionBosMission004AmbulanceReturnTrace` in dieser Umgebung nicht ausgeführt werden konnten.
