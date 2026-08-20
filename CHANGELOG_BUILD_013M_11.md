# Mission BOS – Build 013M.11 – Changelog

## Titel
Mission 002 Start Recovery, persistente Netzkarte und synchroner Cross-Mission-Network-Handoff

## Implementierungsbasis
- Source: `Mission-BOS-Build-013M.10`
- Source ZIP SHA-256: `73accf8f8f262a0bbfef01d6759f4b64c3d467ded71d41bdf4472f6afa3c62ee`

## Produktionsänderungen

### `app.js`
- Shared Mission-Network-Adapter um `isReadyForMissionStart()` erweitert.
- Startreadiness verlangt zusätzlich, dass kein `validatedMissionResetting`, keine validierte/Legacy-/manuelle Missionslast und keine BOS-Priorisierung aktiv ist und die Last maximal 4 Prozentpunkte von der Basislast abweicht.
- Recoverable Cell-Load-Safety (`FAILED`, `fatal:false`) verwirft den Live-Snapshot nicht mehr.
- Letzten gültigen Cell-Load-Snapshot als Last-Known-Good-Fallback eingeführt.
- `#cell-load-section` bleibt permanent sichtbar; bei noch fehlender Telemetrie wird `Netzdaten werden geprüft` angezeigt.

### `city-mission-002-controller.js`
- Cell Load und Capacity unterscheiden jetzt fatal und recoverable korrekt.
- `FAILED + fatal:false` bleibt verwendbar und wird als `recoverableWarnings` protokolliert.
- `fatal:true` blockiert Mission 002 weiterhin.
- `canStart()` bleibt die einzige Startautorität und verlangt jetzt Shared-Network-Readiness.

### `city-mission-004-controller.js`
- Der finale Übergang `RETURNING -> READY` verlangt zusätzlich `network.isReadyForMissionStart() === true`.
- Alle bisherigen operativen Return-, Traffic-, Cell-Load- und Priority-Bedingungen bleiben bestehen.

## Neue Preparation-/Validierungsdateien
- `city-runtime-recoverable-warning-contract.js`
- `recoverable-warning-contract-validator.js`
- `mission-002-start-recovery-validator.js`
- `customer-network-persistence-validator.js`
- `cross-mission-readiness-validator.js`
- `build-013m11-source-regression-validator.js`
- `reference-013m10-recoverable-warning-analysis.js`
- aktualisierte `REFERENCE_IMPLEMENTATION_DELTA.patch`

## Nicht verändert
Insbesondere unverändert: Response-Renderer und 013M.10-Outbound-Sequencing, Mission-004-Response/Plan, Ambulanz-Renderer, Cell-Load-Controller, Association, Auto-BOS-Priority, Mission-002-Plan, Registry, Mission-003-Controller/Response-Plan, `index.html`, `style.css` und Customer-Dashboard-Struktur.
