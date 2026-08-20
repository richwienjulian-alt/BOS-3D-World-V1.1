# Mission BOS – Lokale Sichtabnahme Build 013M.7

## Ziel
Diese Sichtabnahme schließt die in der isolierten Build-Umgebung nicht ausführbare vollständige WebGL-Prüfung ab. Erst nach erfolgreichem Abschluss aller Punkte darf 013M.7 als interner Release Candidate bezeichnet werden.

## Start
1. `Mission-BOS-Build-013M.7.zip` in einen neuen Ordner entpacken.
2. Über einen normalen lokalen HTTP-Server oder die bestehende GitHub-Testseite öffnen. Nicht direkt aus einer alten Browsercache-Version testen.
3. Hard Refresh durchführen.
4. In `Technische Details` die kleine Referenz `Build 013M.7` kontrollieren.

## A – Startkamera
Direkt nach Laden, noch ohne Mission:
- Kamera zeigt die Stadt aus einer freien Übersicht.
- Kamera befindet sich nicht in/unter einem Gebäude.
- keine automatische Kamerafahrt oder automatische Mission startet.

Erwartete technische Pose:

```text
position x=0 / y=40 / z=50
fov=54
yaw=0
pitch=-0.6561787179913949
```

## B – Mission-004-CTA
Mission 004 auswählen.

Erwartung im READY-Zustand:

```text
Mission 004 starten
```

Nicht akzeptieren: `Mission starten`.

## C – Unfallfahrzeug-Grounding
Mission 004 starten und die Unfallstelle betrachten:
- beide beschädigten Pkw stehen sichtbar auf der Straße;
- Reifenunterkante liegt am Straßenniveau;
- kein sichtbares Schweben;
- X/Z-/Rotationslage der bisherigen Unfallstelle bleibt erhalten.

## D – Einsatzlagenkarte
Mission 004 vollständig beobachten. Besonders prüfen:

```text
EXTRICATION
TRANSPORTING
RETURNING
```

Erwartung:
- `Verkehrsunfall` bleibt sauber lesbar und wird nicht buchstabenweise umgebrochen;
- Header-Badge bleibt kurz (`Rettung`, `Transport`, `Rückfahrt` etc.);
- Phase steht separat in `Aktuelle Phase`;
- Beschreibung bleibt vollständiger verständlicher Runtime-Text;
- keine horizontale Dashboard-Überbreite.

## E – Rücklauf – zehn reale Browserläufe
Mission 004 mindestens zehnmal vollständig ausführen. Zwischen den Läufen unterschiedliche aktuelle zivile Traffic-Phasen abwarten, sodass `CAR_DOWNTOWN_01` an unterschiedlichen Stellen des `DOWNTOWN_LOOP` steht.

Für jeden Lauf:
1. Mission bis `COMPLETED` durchlaufen lassen.
2. Finish manuell auslösen.
3. Rettungswagen darf sofort Richtung Krankenhaus starten.
4. Feuerwehr und Polizei müssen zunächst an der Einsatzstelle warten, bis der Downtown-Korridor reserviert ist.
5. `CAR_DOWNTOWN_01` fährt nur bis zu einem sicheren Hold und hält dort.
6. Feuerwehr beginnt anschließend die vorhandene 6-m-Rangiersequenz.
7. Polizei folgt nach dem Fire-Clearance-Gate.
8. Keine Response-/Response-Kollision.
9. Keine Response-/Civilian-Kollision.
10. Kein Safety Halt im normalen erfolgreichen Lauf.
11. Feuerwehr und Polizei erreichen vollständig ihre Basen.
12. Downtown-Fahrzeug wird erst nach Fire/Police-Base freigegeben.
13. Ring-Nord-Yields werden nach den bestehenden Bedingungen freigegeben.
14. Rettungswagen erreicht wieder seine Basis.
15. Mission wechselt nach normalem Network Settlement zurück zu `READY`.
16. Kein dauerhaftes `RETURNING`, kein auf der Straße stehengebliebenes Response-Fahrzeug.

## F – Netzwerk-/BOS-Regressionssicht
Während Mission 004 zusätzlich prüfen:
- frühe hohe Incident-Cell-Last vor Ambulance-Ankunft;
- 100 % mit bestätigtem Rettungswagen-Eintreffen;
- automatische blaue BOS-Priority-Spur;
- Feuerwehr und Polizei fahren danach in die bereits überlastete Incident Cell;
- keine feste Serving Cell / kein sichtbarer erzwungener Handover.

## G – Missionen 001–003 / Dashboard
Je Mission mindestens einmal starten und den bekannten Ablauf kurz prüfen:
- Mission 001 startet und läuft wie in 013M.6.
- Mission 002 startet und läuft wie in 013M.6.
- Mission 003 startet und läuft wie in 013M.6.
- Mission-Auswahl bleibt funktionsfähig.
- Customer Dashboard aus 013M.6 behält seine Informationshierarchie.
- Magenta bleibt Marke/Auswahl/CTA, BOS bleibt Blau/Cyan.

## Freigabeprotokoll
Nur wenn alle Punkte sichtbar bestanden wurden:

```text
A Startkamera: PASSED
B Mission-004-CTA: PASSED
C Unfallfahrzeug-Grounding: PASSED
D Einsatzlagenkarte: PASSED
E 10/10 reale Mission-004-Rückläufe: PASSED
F Netzwerk-/BOS-Regressionssicht: PASSED
G Missionen 001–003 / Dashboard: PASSED
```

Dann kann der bisher offene Eintrag `Full WebGL Browser Acceptance` auf `PASSED` gesetzt und 013M.7 als interner Release Candidate bewertet werden.
