# Mission BOS – Local Test Instructions Build 013M.9

## Ziel
Die reale WebGL-Endabnahme muss den technischen Fix mit echter sichtbarer Ambulanz-/Pedestrian-Safety bestätigen.

## Vorbereitung
1. Build über denselben lokalen/GitHub-Webserver starten, der auch für Präsentationen genutzt wird.
2. Browser-Konsole öffnen.
3. Mission 004 auswählen.

## Pflichtlauf Mission 004
1. Prüfen: READY-CTA `Mission 004 starten`.
2. Mission starten und regulär bis `COMPLETED` laufen lassen.
3. Einsatzabschluss manuell auslösen.
4. Beobachten: Rettungswagen verlässt die Unfallstelle nach Osten.
5. Beobachten: Fahrt folgt Ring Nord/Ring Ost und anschließend Connector/Klinikallee/Krankenwagenzugang – nicht quer durch die Health-Fußgängerfläche.
6. Es darf zu keinem Zeitpunkt `Ambulance runtime is unsafe` erscheinen.
7. Rettungswagen muss `AT_HOSPITAL` erreichen.
8. Nach ca. 2,5 s muss er sichtbar mit der unveränderten Return-Route wieder losfahren.
9. Rettungswagen muss die Rettungswache und `AT_STATION` erreichen.
10. Feuerwehr und Polizei müssen an ihren Basen sein.
11. Ring- und Downtown-Traffic müssen anschließend sauber freigegeben werden.
12. Network Settlement abwarten.
13. Mission 004 muss wieder `READY` erreichen und erneut startbar sein.

## Trace prüfen
In der Konsole:
```js
window.MissionBosMission004AmbulanceReturnTrace
window.MissionBosMission004AmbulanceReturnTraceValidation
```
Erwartung:
- Trace enthält `TO_HOSPITAL -> AT_HOSPITAL -> RETURNING -> AT_STATION`.
- letzter relevanter Sample: `missionState === "READY"` und `ambulanceState === "AT_STATION"`.
- alle Samples: `ambulanceSafetyStatus === "PASSED"`.
- alle Samples: `ambulanceSafetyErrors.length === 0`.
- `window.MissionBosMission004AmbulanceReturnTraceValidation.status === "PASSED"`.

## Wiederholung
Mindestens fünf vollständige Mission-004-Läufe mit unterschiedlichen aktuellen Fußgänger-/Traffic-Phasen durchführen.

## Regression
Danach Mission 001, 002 und 003 jeweils einmal starten/abschließen und Dashboard, Kamera sowie Funkzellen-/BOS-Priority-Darstellung prüfen.
