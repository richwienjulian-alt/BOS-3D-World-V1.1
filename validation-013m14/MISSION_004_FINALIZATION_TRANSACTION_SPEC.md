# Mission 004 – Finalization Transaction Spec

## Phase 1 – Operational Return
Keine Änderung zu 013M.13.

Erforderlich:
- Ambulanz an Rettungswache,
- Feuerwehr/Polizei an Stationen,
- Default-Route-Profile wiederhergestellt,
- Traffic freigegeben,
- Szene geräumt,
- Shared-Response-Safety PASSED.

## Phase 2 – Natural Settlement
- `network.endMission()` exakt einmal.
- Lifecycle bleibt intern `RETURNING`.
- Network-/Cell-Load-Kontext wird `READY`.
- Mission-004-BOS-Endpunkte werden `[]`.
- Bis 6,0 Sekunden normale Konvergenz ohne Eingriff.

## Phase 3 – Deterministic Shared Baseline Finalization
Nur falls nach >=6,0 Sekunden Network oder Priority noch nicht ready sind UND der Response-Handoff weiterhin ready ist.

Reihenfolge:
1. Auto BOS Priority reset
2. Cell Capacity reset
3. Cell Load reset
4. Validated Mission Network finalize

Genau einmal.

## Phase 4 – Atomic Mission Commit
Harte Bedingungen:
- Shared Network ready
- BOS Priority released
- Response Handoff ready

Dann:
- response finalisieren,
- Szene resetten,
- Mission 004 READY.

Nicht blockierend:
- Cell-Load-Easing
- Mission-002-Shared-Baseline

## Phase 5 – Cross Mission Acceptance
Nach M004 READY:
- M002 auswählen
- M002 sofort starten
- kein Reload / Presenter Reset.
