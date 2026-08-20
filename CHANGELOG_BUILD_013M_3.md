# Mission BOS – Build 013M.3 Changelog

## Basis

Einzige Implementierungsbasis dieser Korrektur war das vom Nutzer bereitgestellte Archiv `Mission-BOS-Build-013M.2(3).zip`.

- SHA-256 Basisarchiv: `ab32a8afb9753a6d0f1af624da6a80bc86a9c0d64b5848704d3fba09b5a2ac96`
- Zielbuild: `Mission-BOS-Build-013M.3`

## Behobener Fehler

Mission 004 konnte abhängig von der aktuellen Position der Ringstraßen-Dummyfahrzeuge blockieren oder in den Safety-Stop laufen.

Es bestanden zwei Ursachen:

1. Der bisherige Lead-Haltepunkt bei Routendistanz `76.2` liegt bei ca. `x=25.05 / z=40.30` und überschneidet sich geometrisch mit der Mission-004-Endposition des Feuerwehrfahrzeugs bei ca. `x=26.0 / z=39.7`.
2. Feste Haltepunkte wurden vom Traffic-Runtime immer in Fahrtrichtung angefahren. War ein Fahrzeug beim Missionsstart bereits am Haltepunkt vorbei, musste es nahezu eine komplette Runde fahren und konnte erneut in die BOS-Anfahrtsachse gelangen.

## Neue Traffic-Closure-Kalibrierung

### Sichere Queue-Punkte westlich der BOS-Einfahrt

- `28.0` → ca. `x=-23.15 / z=40.30`
- `24.0` → ca. `x=-27.15 / z=40.30`
- `20.0` → ca. `x=-31.15 / z=40.30`

Alle drei Punkte liegen vor der Feuerwehr-/Polizeieinfahrt auf Ring Nord und schneiden weder die Feuerwehr- noch die Polizeiroute.

### Geschützter BOS-Korridor

- Routendistanz: `30.5 … 118.0`
- Fahrzeuge, die sich beim Missionsstart bereits in diesem Bereich befinden, räumen den Korridor vor der Alarmfahrt nach vorne.
- Räumpunkt: Routendistanz `122.0` → ca. `x=52.36 / z=21.31`
- Der Räumpunkt liegt außerhalb der späteren Rettungswagenroute zum Krankenhaus.

### Laufzeitabhängiger Halt

- Fahrzeuge außerhalb des geschützten Korridors dürfen an ihrer aktuellen sicheren Position anhalten.
- Ein bereits überfahrener Queue-Punkt wird nicht mehr durch eine komplette Ringrunde erneut angefahren.
- Mission 004 startet die Einsatzfahrzeuge erst, wenn der Lead-Verkehrsteilnehmer yielded **und** der geschützte Korridor frei ist.
- Sicherheitsfenster der Straßensperrung: `18 s`.

## Rücklauf-Schutz

Die zivile Ringstraßenfreigabe erfolgt jetzt erst, wenn:

- der Rücklauf von Feuerwehr und Polizei ausgelöst wurde,
- Feuerwehr und Polizei wieder an ihren Basen sind,
- die Unfallstelle geräumt ist,
- der Rettungswagen die Unfallzone verlassen hat.

Damit können freigegebene Dummyfahrzeuge nicht frontal in die zurückfahrenden Einsatzfahrzeuge laufen.

## Neue Regression

Neu hinzugefügt:

- `mission-004-traffic-closure-regression-validator.js`

Der Validator prüft Queue-Geometrie, Räumpunkt, Hold-Assignment, Wrap-around-Vermeidung und viele mögliche Verkehrsphasen beim Start von Mission 004.

## Unverändert geschützt

Nicht verändert wurden insbesondere:

- Mission 001
- Mission 002
- Mission 003
- Stadt-/Straßengeometrie
- Radio-Modell
- Network Association
- Cell Load / Cell Capacity
- automatische BOS-Priority
- Unified BOS Connectivity
- Tower Load / Activation Impact Visualisierung
