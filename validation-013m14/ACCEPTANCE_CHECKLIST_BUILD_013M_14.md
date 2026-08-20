# Acceptance Checklist – Build 013M.14

## Source
- [ ] Einzige Basis ist `Mission-BOS-Build-013M.13(1).zip`.
- [ ] SHA-256 Basis = `5783108e6d7b96e1b77859a9bdc90a5c549b1ea8621912df950fb54d48532d1f`.
- [ ] Bestehende Produktionsänderungen nur in `app.js` und `city-mission-004-controller.js`.
- [ ] Alle Dateien aus `PROTECTED_SHA256_BASELINE.json` unverändert.

## Mission 004 Finalization
- [ ] Network Settlement startet erst nach echtem Response-Handoff.
- [ ] `network.endMission()` exakt einmal pro Lauf.
- [ ] Neutraler Settlement-Kontext aus 013M.13 bleibt erhalten.
- [ ] Mission-002-Baseline ist kein M004-Pre-Commit-Gate mehr.
- [ ] Cell-Load <=55 % ist kein M004-Pre-Commit-Gate mehr.
- [ ] Normaler Settlement läuft zuerst.
- [ ] Deterministic Finalizer frühestens nach 6,0 s Settlement.
- [ ] Deterministic Finalizer nur bei Response-Handoff ready.
- [ ] Priority/Capacity/Load/Network werden beim Fallback exakt einmal normalisiert.
- [ ] Kein Shared-Vehicle-Reset im finalen Handoff.
- [ ] 8-s-Safety-Grenze nicht einfach erhöht.

## Real Browser
- [ ] Mission 004 Completion 10/10.
- [ ] Kein Completion-Safety-Stop 10/10.
- [ ] M004 -> M002 sofort startbar 10/10.
- [ ] Fresh M002 5/5.
- [ ] M003 Anfahrt mindestens 3/3 kollisionsfrei.
- [ ] M004 Anfahrt mindestens 3/3 kollisionsfrei.
- [ ] Netz & Priorisierung bleibt 10/10 sichtbar.
- [ ] `BROWSER_ACCEPTANCE_EVIDENCE_013M_14.txt` enthält echte Laufdaten.

## Release Gate
- [ ] Kein `PASSED`, wenn Browser-Evidence `NOT EXECUTED` enthält.
- [ ] Kein Release Candidate bei irgendeinem M004-Completion-Fehler.
