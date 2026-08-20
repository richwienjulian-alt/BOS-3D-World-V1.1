# Mission BOS – Changelog Build 013M.7
## Mission 004 Final Polish

**Datum:** 2026-08-11  
**Basis:** `Mission-BOS-Build-013M.6`  
**Basis-SHA-256:** `15a305fd6ea10cad70e39837ca45dda47240614afe5c4ff89bb849c4a4a3691e`

## Scope
Build 013M.7 ist ein eng begrenzter Mission-004-Final-Polish. Die Customer-Dashboard-Informationsarchitektur aus 013M.6, Missionen 001–003 sowie die Mobilfunk-/Association-/Capacity-/Priority-Grundarchitektur bleiben geschützt.

## Änderungen

### 1. Mission-004-CTA
- Frozen `city-mission-004-plan.js` aus der 013M.7-Preparation bytegenau übernommen.
- `controls.missionButtonLabels.READY` liefert nun planbasiert `Mission 004 starten`.
- Keine missionsspezifische Button-Sonderabfrage in `app.js` ergänzt.

### 2. Unfallfahrzeuge auf Straßenniveau
Nur die lokale Y-Geometrie der zwei Unfall-Pkw in `city-mission-004-scene-renderer.js` wurde korrigiert:

```text
Group/root Y: 0.42 unverändert
Wheel local Y: -0.20
Wheel radius: 0.22
Body local Y: 0.28
Cabin local Y: 0.70
Crushed local Y: 0.27
Wheel world bottom: 0.00
```

X/Z, RotationY, Footprints, Exclusion-Zone und Incident-/Radio-Kalibrierung bleiben unverändert.

### 3. Stabile Customer-Einsatzlage
- Mission 004 nutzt in `updateMissionPanel()` den Frozen Mappingblock `customerPresentation.statusBadgeByState` für kurze Header-Badges.
- `#mission-stage` bleibt die fachliche Phase.
- `#mission-description` bleibt der vollständige Runtime-Text.
- CSS stabilisiert ausschließlich die bestehende Customer-Incident-Karte: Mindestbreite für Missionstitel, normaler Wortumbruch, `nowrap` für Statusbadge, robuste Stage-Spalten.
- Das 013M.6-Dashboarddesign wurde nicht neu strukturiert.

### 4. Return-Corridor-Reservation
- Vor Feuerwehr-/Polizeirückfahrt wird `CAR_DOWNTOWN_01` auf `DOWNTOWN_LOOP` am nächsten vorwärts erreichbaren sicheren Hold aus `[4.0, 27.0, 50.0]` reserviert.
- Rettungswagen darf sofort Richtung Krankenhaus starten.
- Feuerwehr/Polizei bleiben vollständig stationär, bis `yielded === true` bestätigt ist.
- Erst danach wird einmalig die unveränderte 6-m-Feuerwehr-Backout-/Turn-/Police-Gate-Sequenz ausgelöst.
- Downtown-Yield wird erst nach Rückkehr von Feuerwehr und Polizei zur Basis freigegeben.
- `isTrafficReleased()` berücksichtigt jetzt zusätzlich diese temporäre Return-Corridor-Reservation.
- Neue öffentliche Read-only-Statusmethoden: `getReturnCorridorStatus()` und `isReturnCorridorReady()`.
- Response-SAT-Safety bleibt aktiv; `city-response-vehicle-renderer.js` wurde nicht geändert.

### 5. Begrenzter Abschluss-/Settlement-Pfad
- `network.endMission()` wird nach operativ vollständigem Rücklauf genau einmal ausgelöst.
- Normales Load-/Cell-/Priority-Settlement erhält maximal 8 s.
- Bei erfolgreichem Settlement werden Response und Scene zurückgesetzt und Mission 004 wechselt zu `READY`.
- Bei Corridor- oder Network-Settlement-Timeout erfolgt ein diagnostischer Safety Stop statt endlosem `RETURNING`.

### 6. Sichere Startkamera
Initialpose auf den validierten Presenter-Overview-Wert umgestellt:

```text
position: x=0, y=40, z=50
fov: 54
yaw: 0
pitch: -0.6561787179913949
freeCameraHeight: 40
```

Keine automatische Kamerafahrt und kein automatischer Bookmark-Wechsel wurden hinzugefügt.

### 7. Technische Buildreferenz
Die kleine, eingeklappte Dashboard-Buildreferenz wurde von `Build 013M.6` auf `Build 013M.7` aktualisiert. Keine weitere Dashboardstruktur wurde verändert.

## Frozen Preparation
Folgende neun Dateien wurden bytegenau übernommen:

```text
city-mission-004-plan.js
mission-004-validator.js
city-mission-004-polish-contract.js
mission-004-polish-contract-validator.js
mission-004-return-corridor-validator.js
mission-004-customer-ui-validator.js
initial-camera-spawn-validator.js
city-mission-004-return-maneuver-contract.js
mission-004-return-maneuver-contract-validator.js
```

## Bewusst unverändert
Unter anderem bytegleich zur verifizierten 013M.6-Basis:

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
alle Mission-001/002/003-Produktionsquellen
```
