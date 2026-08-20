# Mission BOS – Build 013M.14 Local Test Instructions

## Release-blockierende Browserabnahme
Verwende den realen Zielbrowser bzw. die interne/GitHub-Testseite. Kein Stub-Harness ersetzt diese Prüfung.

### A. Mission 004 Completion – 10 Läufe
Für jeden Lauf:
1. Seite frisch bzw. Mission 004 im Zustand READY.
2. Mission 004 auswählen und starten.
3. Mission vollständig durchführen.
4. Einsatzabschluss manuell auslösen.
5. Sichtbar prüfen: Feuerwehr/Polizei/Rettungswagen kehren sicher zurück; kein Safety Stop.
6. Prüfen: Mission 004 wechselt automatisch auf READY.
7. Notiere Settlement-Dauer, letzte Blocker und ob der Deterministic Fallback genutzt wurde (`getCompletionSettlementStatus()`).

Erwartung: 10/10 READY, kein Completion-/Network-Settlement-Safety-Stop.

### B. M004 -> M002 – direkt nach jedem Lauf
1. Unmittelbar nach M004 READY Mission 002 auswählen.
2. Kein Reload, kein Presenter-Reset, keine Zusatzwartezeit.
3. `Mission 002 starten` ausführen.

Erwartung: 10/10 erfolgreich.

### C. Fresh Mission 002
Nach frischem Reload Mission 002 auswählen und starten.
Erwartung: 5/5 erfolgreich.

### D. Response Regression
- Mission 003 mindestens 3 Anfahrten: keine Fire/Police-Kollision, kein Response Safety Stop.
- Mission 004 mindestens 3 Anfahrten: gleiche Erwartung.

### E. Dashboard
Während aller zehn M004-Läufe muss `Netz & Priorisierung` sichtbar bleiben.

## Evidence
`BROWSER_ACCEPTANCE_EVIDENCE_013M_14.txt` pro realem Lauf ausfüllen mit:
- Browser/Version
- Startzeit
- M004-Endstatus
- Fallback ja/nein
- Settlement-Dauer
- letzte Blocker
- M002-Start danach ja/nein

Erst nach vollständigem 10/10 + 10/10 + 5/5 darf der Build als finaler Kandidat bezeichnet werden.
