# Mission BOS – Build 013M.11 – Lokale Browserabnahme

## Vorbereitung
1. Build über lokalen HTTP-Server oder die interne GitHub-Testseite öffnen.
2. DevTools-Konsole öffnen und sicherstellen, dass keine JavaScript-Fehler auftreten.
3. Keine automatische Mission starten; Tests ausschließlich über die vorhandene Mission-Auswahl und den Missionsbutton durchführen.

## A – Mission 002 Fresh Reload – 5 Läufe
Für jeden Lauf:
1. Seite vollständig neu laden.
2. Mission 002 auswählen.
3. Prüfen: `Mission 002 starten` ist aktiv.
4. Sofort klicken.
5. Erwartung: Mission wechselt unmittelbar auf Arena/Event-Start; keine zusätzliche Wartezeit und keine Startablehnung.

Abnahme: **5/5 erfolgreich**.

## B – Mission 004 -> READY -> Mission 002 – 5 komplette Sequenzen
Für jeden Lauf:
1. Mission 004 vollständig starten und normal bis `COMPLETED` durchführen.
2. Einsatzabschluss manuell auslösen.
3. Ambulanz-/Fire-/Police-Rücklauf vollständig beobachten.
4. Warten, bis Mission 004 sichtbar `READY` meldet.
5. Ohne zusätzliche Wartezeit Mission 002 auswählen.
6. `Mission 002 starten` sofort klicken.
7. Erwartung: Mission 002 startet unmittelbar.

Abnahme: **5/5 erfolgreich**.

## C – Netz & Priorisierung persistent – 10 Mission-004-Läufe
Während jedes vollständigen Laufs insbesondere prüfen:
- Handover-/Lastaufbau,
- 100-%-Incident-Cell,
- automatische BOS-Priorisierung,
- Transport zum Krankenhaus,
- Rücklauf,
- Network Settlement.

Erwartung in jedem Frame:
- Bereich `Netz & Priorisierung` bleibt sichtbar.
- Funkzellen-Zeilen verschwinden bei temporären recoverable Warnungen nicht.
- Kein abruptes Zusammenfallen der Netzkarte.
- Fataler Zustand darf als Fehler erkennbar sein, die Karte bleibt aber im Layout.

Abnahme: **10/10 vollständig sichtbar**.

## D – Mission 004 Regression – 5 Läufe
Je Lauf prüfen:
- Fire/Police Outbound ohne Kollision/Blockade.
- Ambulanzkorridor zum Krankenhaus sicher.
- Krankenhaus-Hold und Ambulanz-Rückfahrt funktionieren.
- Fire/Police-Return und Downtown-Corridor funktionieren.
- Mission kehrt zu `READY` zurück.

Abnahme: **5/5**.

## E – Mission 003/004 Outbound Safety
Mission 003 und 004 jeweils mehrfach starten. Erwartung:
- Feuerwehr startet vor Polizei.
- Polizei startet mit ca. 5-s-effektivem Delay.
- Kein Response-Safety-Halt.
- Kein sichtbares Ineinanderfahren.

## F – Fatal-Test
Nur im Test-Harness/Dev-Setup einen `fatal:true`-Cell-Load-Zustand erzeugen.
Erwartung:
- Mission 002 bleibt blockiert.
- Netzkarte bleibt im Layout sichtbar.
- Safety wird nicht abgeschaltet oder umgangen.
