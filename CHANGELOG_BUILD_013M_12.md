# Mission BOS – Build 013M.12 – Changelog

## Titel
Mission 004 → Mission 002 – Deterministischer Shared-Runtime-Handoff

## Basis
- einzige Implementierungsbasis: `Mission-BOS-Build-013M.11`
- SHA-256 der Basis: `4288014fff77489bc49e42c90b4e4219f3cb84ee9686826d521fb4b91eedeb7f`

## Korrektur
### Mission 002
- `getSharedStartBaselineStatus()` ergänzt.
- Die Shared-Baseline-Prüfung ist unabhängig von der aktuell ausgewählten Mission.
- `canStart()` bleibt user-gated: Mission 002 muss ausgewählt sein und es darf keine aktive Mission geben.
- Recoverable Cell-Load-/Capacity-Warnungen bleiben gemäß 013M.11 verwendbar; fatale Safety blockiert weiterhin.

### Mission 004 Response
- `getCrossMissionHandoffStatus()` ergänzt.
- `finalizeForSharedHandoff()` ergänzt.
- Am finalen M004→READY-Handoff werden bereits sichere Shared Vehicle Runtimes nicht erneut `reset()`-tet.
- Fire/Police müssen explizit `AT_STATIONS` mit Profil `MISSION_001_DEFAULT` sein.
- Ambulanz muss explizit `AT_STATION` mit Profil `MISSION_002_DEFAULT` sein.
- Shared Runtime Safety muss jeweils `PASSED` und nicht fatal sein.
- Standard-`reset()` prüft die Rückgabewerte von Fire/Police- und Ambulanz-Reset verbindlich; stille Resetfehler sind nicht mehr zulässig.

### Mission 004 Controller
- Der finale READY-Übergang verlangt zusätzlich den echten Response-Handoff und `Mission 002 getSharedStartBaselineStatus().ready === true`.
- Der bisherige finale Full-Response-Reset wurde durch `finalizeForSharedHandoff()` ersetzt.
- Shared Network Readiness, Cell-Load-Grenze und inaktive Priority bleiben weiterhin Pflicht.

## Nicht geändert
Keine Änderung an `app.js`, HTML/CSS, Dashboard, Kamera, Fahrzeugrouten, Response-Renderer, Ambulanz-Renderer, Cell Load, Capacity, Association, Auto-BOS-Priority oder Mission 001/003.
