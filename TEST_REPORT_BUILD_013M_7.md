# Mission BOS – Test Report Build 013M.7
## Mission 004 Final Polish

**Datum:** 2026-08-11  
**Basis:** `Mission-BOS-Build-013M.6`  
**Basis-SHA-256:** `15a305fd6ea10cad70e39837ca45dda47240614afe5c4ff89bb849c4a4a3691e`

## Ergebnisübersicht

```text
A) Mission 004 READY CTA: PASSED
B) Accident Vehicle Grounding – deterministic geometry: PASSED
C) Mission 004 Customer Incident Card / Chromium DOM: PASSED
D) Return Corridor Frozen SAT Regression: PASSED
E) Dense/Random Return-Corridor Assignment Sweep: PASSED
F) 10 Full Technical Mission-004 Controller Cycles: PASSED
G) Return/Settlement Watchdogs: PASSED
H) Initial Camera Spawn Validator: PASSED
I) Mission-004 Existing Regressions: PASSED
J) Mission-001/002/003 Source Regression: PASSED – byte-identical to validated 013M.6 basis
K) Customer Dashboard 013M.6 DOM Regression: PASSED
L) Full WebGL Browser Visual Acceptance: NOT EXECUTED – environment blocked
FORMAL RELEASE CANDIDATE: NO
```

Die offene WebGL-Sichtabnahme ist keine angenommene Produktregression. Chromium blockiert die Navigation zur vollständigen lokalen Anwendung per Administrator-Policy. Die nicht ausgeführte Pflichtsichtprüfung wird deshalb ausdrücklich nicht als `PASSED` gewertet.

## 1. Source Identity / Frozen Preparation

```text
Input ZIP SHA-256:
15a305fd6ea10cad70e39837ca45dda47240614afe5c4ff89bb849c4a4a3691e
Expected SHA-256:
15a305fd6ea10cad70e39837ca45dda47240614afe5c4ff89bb849c4a4a3691e
Result: PASSED

Frozen Preparation JS: 9 / 9 byte-identical
```

## 2. Mission-004 Frozen Plan / Polish Contract

```text
Mission 004 Plan Validator: PASSED
Dependency errors: 0
Policy errors: 0
State errors: 0
Response errors: 0
Route errors: 0
Return sequence errors: 0
Traffic errors: 0
Scene errors: 0
Network errors: 0
Fixed tower errors: 0
Runtime contract errors: 0

Mission 004 Polish Contract Validator: PASSED
Identity errors: 0
Button errors: 0
Grounding errors: 0
Incident card errors: 0
Return corridor errors: 0
Completion errors: 0
Camera errors: 0
Protection errors: 0
```

## 3. Punkt 1 – READY CTA
Frozen Plan und echte Chromium-DOM-Prüfung:

```text
MISSION_004 READY CTA: Mission 004 starten
Customer UI Validator: PASSED
```

`app.js` verwendet weiterhin die allgemeine planbasierte Buttonlogik; für Mission 004 wurde keine neue `missionId === MISSION_004`-Sonderbehandlung für den CTA eingeführt.

## 4. Punkt 2 – Unfallfahrzeug-Grounding
Deterministische finale Geometrie:

```text
Group/root Y: 0.42
Wheel local Y: -0.20
Wheel radius: 0.22
Wheel world bottom: 0.00
Body local Y: 0.28
Cabin local Y: 0.70
Crushed local Y: 0.27
Grounding contract: PASSED
```

Die X/Z-/Rotation-/Footprint-/Exclusion-Werte wurden nicht über diesen visuellen Fix verändert. Eine reale WebGL-Sichtfahrt ist aufgrund der Browser-Policy offen; daher wird „sichtbar auf Straße“ formal erst lokal final abgenommen.

## 5. Punkt 3 – Einsatzlagenkarte / Customer UI
Frozen `mission-004-customer-ui-validator.js` im echten Chromium-DOM:

```text
STATUS: PASSED
CTA errors: 0
Incident card errors: 0
Wrapping errors: 0
Measured minimum title width: 150 px
Status white-space: nowrap
Title overflow-wrap: normal
Title word-break: normal
Customer Dashboard DOM: PASSED
Horizontal overflow: false
```

Gezielt geprüft:

```text
EXTRICATION: title width 295.22 px / one-line height 16.8 px
TRANSPORTING: title width 286.88 px / one-line height 16.8 px
RETURNING: title width 286.31 px / one-line height 16.8 px
```

Missionstitel `Verkehrsunfall` bleibt bei diesen kritischen Zuständen lesbar und wird nicht buchstabenweise zusammengedrückt.

## 6. Punkt 4 – Return-Corridor Frozen SAT Regression
Frozen `mission-004-return-corridor-validator.js`:

```text
STATUS: PASSED
Downtown route length: 73.876551 m
Downtown loop period: 17.382718 s
Baseline phase samples: 1201
Baseline collision phase samples: 897
Baseline first collision time: 13.55 s
Baseline first response vehicle: RESPONSE_FIRE_01
Safe hold 4.0 m collision count: 0
Safe hold 27.0 m collision count: 0
Safe hold 50.0 m collision count: 0
Maximum forward travel to hold: 27.876551 m
```

Damit reproduziert der Validator die reale 013M.6-Lücke und weist für alle drei Frozen Holds 0 SAT-Kollisionen gegen die konfigurierte Feuerwehr-/Polizeirückfahrt nach.

## 7. Dense / randomisierte Corridor-Zuweisungen
Finale `computeReturnCorridorAssignment()` gegen dichte und deterministisch randomisierte Startdistanzen:

```text
Samples: 8388
Assignment errors: 0
Maximum observed forward travel: 27.866551 m
Allowed maximum: 27.876551 m
STATUS: PASSED
```

## 8. Bestehendes Fire-/Police-Return-Manöver geschützt
Der aktualisierte Frozen Return-Maneuver-Vertrag und der bestehende Maneuver-Validator bleiben grün:

```text
Return Maneuver Contract: PASSED
Baseline turning collision detected: true
Baseline first turning collision: 0.05 s
Minimum static fire backout for safe turn: 6.0 m
Configured fire backout: 6.0 m
Fire backout speed: 2.0 m/s
Fire clearance gate: 3.34 s
Police turn start: 4.00 s
Configured collision count: 0
Total fire/police return time: 28.80 s
STATUS: PASSED
```

`city-response-vehicle-renderer.js` ist bytegleich zu Build 013M.6.

## 9. Zehn vollständige technische Mission-004-Controllerzyklen
Die finale Mission-/Response-Controller-Implementierung wurde mit zehn unterschiedlichen `CAR_DOWNTOWN_01`-Startdistanzen vom `READY`-Start bis zurück zu `READY` ausgeführt:

```text
Start distances:
0.00, 3.99, 4.01, 13.50, 26.99,
27.01, 38.40, 49.99, 50.01, 73.70 m

Runs to READY: 10 / 10
Invalid hold assignments: 0
Fire/police return before confirmed yield: 0
response.returnToStations() calls per run: exactly 1
network.endMission() calls per run: exactly 1
All vehicles at base at READY: 10 / 10
All Mission-004 yields released at READY: 10 / 10
Worst observed corridor wait: 6.60 s
Corridor watchdog: 8.00 s
STATUS: PASSED
```

Diese zehn Läufe sind technische Controller-/Runtime-Harness-Läufe mit der finalen Implementierung. Sie sind kein Ersatz für die vorgeschriebene reale WebGL-Sichtabnahme.

## 10. Safety-Watchdogs
Absichtliche Fehlerfälle gegen die finale Runtime:

### Downtown-Corridor erreicht Hold nie
```text
Mission result: FAILED / diagnostic Safety Stop
Corridor status: FAILED
Wait: ~8.00 s
Fire/police return commands before failure: 0
Endless RETURNING: no
STATUS: PASSED
```

### Network Settlement beendet sich nicht
```text
Mission result: FAILED / diagnostic Safety Stop
Diagnostic: network settlement exceeded 8 second safety deadline
network.endMission() calls: exactly 1
Endless RETURNING: no
STATUS: PASSED
```

## 11. Punkt 5 – Initial Camera Spawn
Frozen `initial-camera-spawn-validator.js`:

```text
STATUS: PASSED
position: x=0, y=40, z=50
yaw: 0
pitch: -0.6561787179913949
fov: 54
freeCameraHeight: 40
nearest building: W15
nearest X/Z building clearance: 14.125 m
building clearance errors: 0
world bounds errors: 0
orientation errors: 0
```

Es wurde keine automatische Kamerafahrt bzw. Missions-/Bookmark-Aktion ergänzt.

## 12. Bestehende Mission-004-Regressionen

```text
Foundation: PASSED
Traffic Swept Path: PASSED
  sampled distances: 4428
  incident crossing errors: 0
  trajectory errors: 0
  wrap errors: 0
Traffic Closure: PASSED
  sampled mission start phases: 237
  max dispatch-ready time: 5.369 s
Return Maneuver Route: PASSED
Network Timing: PASSED
  ambulance confirmed arrival: 14.70 s
  incident cell 100 %: 15.15 s
  auto priority: 15.35 s
  fire arrival: 36.95 s
  police arrival: 37.95 s
Network Extension: PASSED
Four-Mission Registry Extension: PASSED
Mission-004 Integration: PASSED
```

Die Response-Controller-Fassade stellt im finalen Build bereit:

```text
getReturnCorridorStatus(): function
isReturnCorridorReady(): function
getReturnManeuverStatus(): function
```

## 13. Regression Mission 001–003 / geschützte Architektur
Bytegenauer Vergleich gegen die verifizierte 013M.6-Basis:

```text
Protected production files checked: 45
Protected production files unchanged: 45
Failures: 0
```

Darunter alle Mission-001/002/003-Produktionsquellen sowie:

```text
city-response-vehicle-renderer.js
city-traffic-renderer.js
city-traffic-plan.js
city-response-vehicle-plan.js
city-presenter-plan.js
city-network-radio-model.js
city-network-association-controller.js
city-cell-load-controller.js
city-cell-capacity-controller.js
city-auto-bos-priority-controller.js
city-layout-recovery.js
```

Damit wurde an diesen bereits 013M.6-validierten Runtimes keine Quelländerung eingeführt.

## 14. Finaler statischer Buildcheck

```text
Frozen Preparation files: 9 / 9 byte-identical
Protected production sources: 45 / 45 byte-identical
JavaScript syntax: 150 / 150 valid
Local script references: 147 / 147 present
Duplicate DOM IDs: 0
New fixed tower references in modified Mission-004 controllers: 0
Dashboard technical build reference: Build 013M.7
STATUS: PASSED
```

## 15. Reale Browser-Sichtabnahme – offen
Ein lokaler HTTP-Endpunkt des finalen Builds liefert außerhalb Chromium `200 OK`. Die Navigation im verfügbaren Chromium endet jedoch mit:

```text
net::ERR_BLOCKED_BY_ADMINISTRATOR
chrome-error://chromewebdata/
Your organization doesn’t allow you to view this site
```

Dadurch werden `THREE`, App-Runtime und Canvas nicht geladen. Folgende verpflichtende Sichtpunkte konnten deshalb nicht seriös als bestanden markiert werden:
- Unfall-Pkw tatsächlich in der vollständigen WebGL-Szene auf Straßenniveau betrachten;
- Mission 004 zehnmal als echte sichtbare Browserfahrt mit realem 3D-Traffic ausführen;
- vollständigen sichtbaren Feuerwehr-/Polizei-/Downtown-Rücklauf beobachten;
- sichtbaren Wechsel bis zurück zu `READY` im vollständig instanziierten WebGL-Build bestätigen;
- Startkamera in der echten 3D-Stadt visuell abnehmen.

Die Customer-UI selbst wurde separat im echten Chromium-DOM geprüft und ist `PASSED`; diese Prüfung wird ausdrücklich nicht als Ersatz für die WebGL-Missionssichtfahrt ausgegeben.

## Gesamtstatus

```text
IMPLEMENTATION: COMPLETE
FROZEN PLAN / CONTRACT: PASSED
CTA: PASSED
GROUNDING GEOMETRY: PASSED
CUSTOMER INCIDENT CARD / CHROMIUM DOM: PASSED
RETURN CORRIDOR SAT: PASSED
10 TECHNICAL FULL CONTROLLER CYCLES: PASSED
RETURN / SETTLEMENT WATCHDOGS: PASSED
INITIAL CAMERA VALIDATOR: PASSED
TECHNICAL REGRESSION: PASSED
FULL WEBGL VISUAL ACCEPTANCE: PENDING
FORMAL BUILD ACCEPTANCE: NOT YET PASSED
INTERNAL RELEASE CANDIDATE: NO
```
