# Mission BOS – Build 013M.3 Lokale Endabnahme

## Start

Im entpackten Build-Verzeichnis beispielsweise:

```bash
python3 -m http.server 8080
```

Danach `http://localhost:8080/` im Browser öffnen.

## 1. Mission 004 nicht sofort starten

- Seite zunächst 10–20 Sekunden laufen lassen, damit die drei Ringstraßenfahrzeuge nicht mehr an ihren Startpositionen stehen.
- Mission 004 auswählen und starten.

Erwartung:

- Dummyfahrzeuge fahren nicht unkontrolliert in die Einsatzachse.
- Fahrzeuge westlich der BOS-Achse stoppen vor der Einfahrt.
- Ein Fahrzeug, das beim Start bereits im geschützten Abschnitt steht, räumt diesen nach Osten und stoppt außerhalb der Einsatz-/Hospitalroute.
- Feuerwehr, Polizei und Rettungswagen starten danach ohne Kollision.

## 2. Mission vollständig durchlaufen lassen

Prüfen:

- `ROAD_CLOSURE` wechselt zuverlässig nach `ENROUTE`.
- alle drei BOS-Fahrzeuge erreichen die Unfallstelle.
- Mission erreicht `ON_SCENE`, `OVERLOADED`, `BOS_ACTIVE`, `COMMS_STABLE`, `EXTRICATION`, `PATIENT_READY`, `COMPLETED`.
- anschließend Finish/Return auslösen.

## 3. Rücklauf beobachten

Erwartung:

- zivile Ringstraßenfahrzeuge bleiben während des Feuerwehr-/Polizei-Rücklaufs angehalten.
- keine zivile Gegenfahrt trifft Feuerwehr oder Polizei auf Ring Nord.
- nach Rückkehr von Feuerwehr und Polizei und geräumter Unfallstelle wird der Verkehr wieder freigegeben.
- Mission kehrt anschließend zu `READY` zurück.

## 4. Wiederholung

Mission 004 mindestens fünfmal wiederholen, jeweils nach unterschiedlich langer Wartezeit vor dem Start, z. B.:

- sofort
- nach ca. 5 s
- nach ca. 15 s
- nach ca. 30 s
- nach ca. 45 s

Jeder Lauf muss ohne `FAILED` und ohne festgefahrene Einsatzfahrzeuge zu `READY` zurückkehren.

## 5. Regression Missionen 001–003

Je einen kurzen vollständigen Lauf von Mission 001, 002 und 003 durchführen. Es dürfen keine neuen Änderungen an Verhalten, Funk oder BOS-Priority sichtbar sein.
