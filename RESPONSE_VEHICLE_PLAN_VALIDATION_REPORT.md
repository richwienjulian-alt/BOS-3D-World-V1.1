# Mission BOS – Build 008R.6 Response Vehicle Plan Validation

## Ziel

Vorabprüfung einer deterministischen Einsatzfahrzeuggrundlage für:

- ein Feuerwehrfahrzeug,
- ein Polizeifahrzeug,
- zwei feste Stationszufahrten,
- zwei feste Anfahrts- und Rückfahrtrouten.

Die Routen führen in diesem Foundation-Build bewusst nur zu getrennten Bereitstellungspunkten auf dem südlichen BOS-Boulevard. Sie binden noch keine Mission und keine Einsatzstelle an.

## Geprüfte Quellen

```text
city-layout-recovery.js
city-static-props-plan.js
city-traffic-plan.js
city-pedestrian-plan.js
city-response-vehicle-plan.js
```

## Routen

```text
FIRE_FOUNDATION_ROUTE
Länge: 45.724395
Start: Feuerwehr-Aufstellfläche
Ziel: Feuerwehr-Bereitstellung BOS-Boulevard

POLICE_FOUNDATION_ROUTE
Länge: 31.706153
Start: Polizei-Bereitstellungsfläche
Ziel: Polizei-Bereitstellung BOS-Boulevard
```

## Fahrzeuge

```text
RESPONSE_FIRE_01
Typ: fire-truck
Reifen: 4
Startverzögerung: 2.5 Sekunden
Anfahrt: 5.0 Welteinheiten/Sekunde
Rückfahrt: 5.5 Welteinheiten/Sekunde

RESPONSE_POLICE_01
Typ: police-car
Reifen: 4
Startverzögerung: 0.0 Sekunden
Anfahrt: 4.6 Welteinheiten/Sekunde
Rückfahrt: 4.8 Welteinheiten/Sekunde
```

## Validierungsergebnis

```text
MISSION BOS RESPONSE VEHICLE VALIDATION
Access surface definition errors: 0
Access surface / obstacle overlap errors: 0
Route definition errors: 0
Route surface reference errors: 0
Response footprint outside allowed surface errors: 0
Response / building overlap errors: 0
Response / tower overlap errors: 0
Response / technology plot overlap errors: 0
Response / parking overlap errors: 0
Response / green overlap errors: 0
Response / static prop overlap errors: 0
Response / civilian traffic swept-path conflicts: 0
Response / pedestrian swept-path conflicts: 0
Initial response vehicle overlap errors: 0
Simulated response vehicle collision errors: 0
Invalid response vehicle specification errors: 0
Expected count errors: 0
Source phase errors: 0
STATUS: PASSED
```

## Stärke der Prüfung

Die Einsatzfahrzeugrouten wurden nicht nur gegen die aktuellen Startpositionen von Zivilverkehr und Fußgängern geprüft.

Zusätzlich wurde ausgeschlossen, dass sich die räumlich belegten Fahrkorridore der Einsatzfahrzeuge mit irgendeiner möglichen Position der vorhandenen zivilen Fahrzeuge oder Fußgänger überschneiden. Dadurch ist die Grundlage unabhängig vom Zeitpunkt, zu dem der Nutzer den Routentest startet.

Die deterministische gemeinsame Anfahrt und Rückfahrt von Feuerwehr und Polizei wurde mit einer Schrittweite von `0.05` Sekunden simuliert.

```text
Simulierte Anfahrtsdauer: ca. 11.65 Sekunden
Simulierte maximale Rückfahrtdauer: ca. 8.32 Sekunden
```

## Ergebnis

Der Plan ist als verbindliche Eingabe für Build 008R.6 freigegeben.

Die Koordinaten, Fahrzeugabmessungen, Geschwindigkeiten, Startverzögerungen und Zufahrtsflächen dürfen bei der Implementierung nicht neu interpretiert werden.
