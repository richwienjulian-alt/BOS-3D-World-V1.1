# Mission BOS – Build 013M.15 Local Test Instructions

## Release-Blocker: reale Browsersequenz

### A. Mission 004 -> Mission 002, zehn Wiederholungen
Für jeden Lauf:
1. Seite frisch laden.
2. Mission 004 auswählen.
3. Mission 004 vollständig starten und bis `READY` abschließen.
4. Ohne Reload und ohne Presenter Reset Mission 002 auswählen.
5. Prüfen, dass der Button `Mission 002 starten` enabled ist.
6. Button klicken.
7. Prüfen, dass Mission 002 tatsächlich startet und in `EVENT_ACTIVE` bzw. einen laufenden Mission-002-State wechselt.
8. Prüfen, dass keine fatale Arena-/Cell-Load-Safety ausgelöst wird.

Erwartung: **10/10 erfolgreich**.

### B. Fresh Mission 002, fünf Wiederholungen
1. Seite frisch laden.
2. Mission 002 auswählen.
3. `Mission 002 starten` klicken.
4. Start bis `EVENT_ACTIVE` bestätigen.

Erwartung: **5/5 erfolgreich**.

### C. Regression
- Mission 004 weiterhin vollständig bis READY.
- Mission 001 und Mission 003 weiterhin startbar und funktional.
- Mission 003/004 Outbound ohne Response-Safety-Halt.
- Netz & Priorisierung bleibt sichtbar.
- Ein echter fataler Cell-Load-Fehler muss Mission 002 weiterhin blockieren.

## Evidence
Die Ergebnisse pro Lauf in `BROWSER_ACCEPTANCE_EVIDENCE_013M_15.txt` dokumentieren. Erst nach vollständigem realem PASS darf der Build als Release Candidate bezeichnet werden.
