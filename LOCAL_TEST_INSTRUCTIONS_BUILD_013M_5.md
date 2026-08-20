# Mission BOS – Local Test Instructions Build 013M.5

## Ziel
Diese Prüfung ist die noch offene reale Browser-Sichtabnahme des maneuver-aware Mission-004-Rücklaufs. Sie darf nicht durch den statischen Validator oder den technischen Renderer-Harness ersetzt werden.

## Vorbereitung
1. `Mission-BOS-Build-013M.5.zip` entpacken.
2. Über denselben lokalen Webserver- oder internen GitHub-Pages-Weg starten, der für die Präsentation vorgesehen ist.
3. Browser-Konsole öffnen.
4. Prüfen, dass beim Start keine JavaScript-Fehler auftreten.
5. Mission 004 auswählen; keine automatische Missionsauswahl/-auslösung verwenden.

## Pflichtlauf – vollständige Mission 004
Mission 004 regulär bis `COMPLETED` durchlaufen lassen. Vor der Finish-Aktion folgende Stage-Positionen visuell bzw. über die bestehende Runtime bestätigen:
- Feuerwehr ungefähr x=26.0 / z=39.7
- Polizei ungefähr x=24.0 / z=42.0
- Rettungswagen ungefähr x=28.0 / z=42.0

Diese Stage-Positionen dürfen nicht verschoben sein.

## Rücklauf-Sichtkriterien
Nach der manuellen Finish-Aktion müssen alle Punkte sichtbar erfüllt sein:
1. Feuerwehr setzt **zuerst** zurück.
2. Die ersten ungefähr 6 m bewegt sich die Feuerwehr langsam rückwärts/rangierend mit ihrer bisherigen Outbound-Ausrichtung.
3. Während dieser Backout-Phase dreht die Feuerwehr nicht vorzeitig auf Reverse Heading.
4. Polizei bleibt stehen.
5. Erst nach dem 6-m-Freiraum beginnt die Feuerwehr ihre geglättete Drehung.
6. Während der kompletten Feuerwehrdrehung gibt es keine sichtbare Fahrzeugüberschneidung und keinen Safety-Stop.
7. Nach abgeschlossener Feuerwehrdrehung wird das Fire-Clearance-Gate erreicht.
8. Polizei startet frühestens nach Gate und mindestens 4.0 s Return-Zeit mit ihrer Drehung.
9. Die Polizeidrehung erfolgt ohne Kontakt zur Feuerwehr.
10. Beide Fahrzeuge fahren anschließend auf ihren bestehenden Rückrouten zu ihren Basen.
11. Keine sichtbare Überlappung, Blockade oder Safety-Halt.
12. Beide Fahrzeuge erreichen ihre Stationen.
13. Mission 004 kann den bestehenden Abschluss-/Resetpfad regulär fortsetzen und wieder `READY` erreichen.
14. Ziviler Ringverkehr bleibt bis zu den bereits in 013M.4 definierten sicheren Freigabebedingungen geschützt.

## Runtime-Status kontrollieren
Während bzw. nach dem Rücklauf kann die bestehende Mission-004-Response-Runtime über die Browserkonsole geprüft werden. Je nach im App-Scope verfügbarer Runtime-Referenz soll `getReturnManeuverStatus()` mindestens folgende Werte liefern:

```text
strategy = FIRE_BACKOUT_TURN_THEN_POLICE_GATE
fireBackoutDistanceMeters = 6
fireBackoutSpeedMetersPerSecond = 2
fireReturnDelaySeconds = 0
policeReturnDelaySeconds = 4
policeMinimumReleaseDelaySeconds = 4
fireClearanceGateId = M004_FIRE_CLEARANCE_TURN_COMPLETE
```

Am Ende:
```text
fireSubphase = AT_STATION
policeSubphase = AT_STATION
fireClearanceGate = true
```

Die vorhandene Response-Safety muss weiterhin `PASSED` melden.

## Empfohlene Wiederholung
Für die interne Freigabe den vollständigen Mission-004-Rücklauf **mindestens fünfmal** neu starten und in jedem Lauf dieselben Sichtkriterien prüfen. Die Backout-/Turn-Sequenz ist deterministisch; dennoch sollen fünf reale Fahrten Render-Timing, Frame-Interpolation und Reset-Wiederholbarkeit absichern.

Protokollvorlage:

| Lauf | Fire Backout sichtbar | Fire Turn kollisionsfrei | Police wartet | Police Turn kollisionsfrei | Beide Station | Safety Stop | Ergebnis |
|---|---|---|---|---|---|---|---|
| 1 |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |
| 4 |  |  |  |  |  |  |  |
| 5 |  |  |  |  |  |  |  |

## Freigaberegel
Build 013M.5 darf erst als **interner Release Candidate** bezeichnet werden, wenn die reale Browser-Sichtabnahme des vollständigen Rücklaufs bestanden ist. Für die empfohlene interne Abnahme bedeutet das: **5/5 vollständige Rückläufe ohne sichtbaren Kontakt, Blockade oder Safety-Stop**.
