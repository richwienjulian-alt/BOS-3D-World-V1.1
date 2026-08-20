# Mission BOS – Local Test Instructions Build 013M.8

## Zweck

Diese Anleitung schließt die in der Build-Sandbox nicht mögliche reale Browser-/WebGL-Abnahme ab. Erst nach erfolgreicher Sichtprüfung darf Build 013M.8 als formaler Präsentations-/Release Candidate bewertet werden.

## 1. Build starten

ZIP entpacken und den Ordner über einen lokalen HTTP-Server oder die bestehende GitHub-Testseite öffnen. Beispiel:

```bash
python3 -m http.server 8080
```

Dann im Browser die lokale Seite öffnen.

## 2. Startkamera prüfen

Direkt nach Page Load, ohne Presenter-Bookmark und ohne Missionstart:

- Kamera startet niedrig und schräg, nicht aus Vogelperspektive;
- gewünschte Pose liegt ungefähr bei `(0.78, 9, 46)`;
- Blick entlang der Stadtachse;
- Kamera steht sichtbar nicht in einem Gebäude;
- kein automatischer Kameraflug startet;
- keine Mission startet automatisch.

Danach `Demo zurücksetzen` prüfen: Der Reset muss wieder auf den niedrigen Kundenstart führen. Die hohe Stadtübersicht muss weiterhin manuell wählbar bleiben.

## 3. Mission 004 – fünf vollständige Sichtläufe

Mission 004 mindestens fünfmal vollständig ausführen. Pro Lauf:

1. `Mission 004 starten` auslösen.
2. Mission regulär bis `COMPLETED` laufen lassen.
3. Finish/Rücklauf manuell auslösen.
4. Prüfen, dass der Rettungswagen sichtbar zum Krankenhaus fährt.
5. Ca. 2,5 s Patientenübergabe beobachten.
6. Prüfen, dass der Rettungswagen sichtbar wieder anfährt – kein Teleport.
7. Prüfen, dass er vom Krankenhaus zur Rettungswache fährt.
8. Prüfen, dass Feuerwehr und Polizei ohne Kollision zu ihren Basen fahren.
9. Prüfen, dass der zivile Verkehr sauber freigegeben wird.
10. Prüfen, dass Mission 004 zurück zu `READY` geht und erneut startbar ist.

Nicht zulässig:

- Ambulanz bleibt am Krankenhaus stehen;
- endloses `RETURNING`;
- Teleport zur Wache;
- Mission `READY`, obwohl die Ambulanz sichtbar am Krankenhaus steht;
- Fire/Police-Regression oder Downtown-Corridor-Kollision.

## 4. Reale Ambulanz-Trace nach jedem Lauf prüfen

Nach jedem vollständigen Lauf in der Browser-Konsole:

```js
window.MissionBosMission004AmbulanceReturnTraceValidation
```

Erwartung:

```text
status = PASSED
```

Bei Bedarf explizit neu validieren:

```js
MissionBosMission004AmbulanceReturnTraceValidator.validate(
  window.MissionBosMission004AmbulanceReturnTrace,
  window.MISSION_BOS_MISSION_004_AMBULANCE_RETURN_CONTRACT
)
```

Zwingende Reihenfolge im Trace:

```text
AT_HOSPITAL -> RETURNING -> AT_STATION
```

Letzter relevanter Zustand:

```text
Mission 004 = READY
AMBULANCE_01 = AT_STATION
```

Zusätzlich prüfen:

- Sampleabstand höchstens 0,10 s;
- Hospital-Hold ca. 2,5 s;
- nach erfolgreichem Return-Command zeitnah echter `RETURNING`-State;
- `AT_STATION` deutlich unter dem 6,0-s-Watchdog.

## 5. Missionen 001–003 Browser-Smoke

Je Mission einmal vollständig ausführen:

- Mission 001 bis Rückkehr `READY`;
- Mission 002 inklusive bestehender Ambulanz-Hospital-Rückfahrt bis `READY`;
- Mission 003 inklusive Rücklauf bis `READY`.

Dabei Dashboard, Netzlast, BOS-Priorisierung und Mission-Auswahl auf sichtbare Regressionen prüfen.

## 6. Mission-004-Schutzpunkte erneut beobachten

Mindestens einmal gezielt prüfen:

- Unfallfahrzeuge stehen auf Straßenniveau;
- Customer-Einsatzlage bleibt lesbar;
- No-Cross-Verkehr fährt nicht durch die Unfallstelle;
- frühe Incident-Cell-Überlastung / Auto-BOS-Priority bleibt erhalten;
- Fire 6-m-Backout bleibt sichtbar;
- Polizei wartet auf das Clearance-Gate;
- Downtown-Verkehr blockiert den Rücklauf nicht.

## 7. Freigabe

Nur wenn alle fünf Mission-004-Sichtläufe, alle fünf Trace-Validierungen und die Mission-001–003-Smokes erfolgreich sind:

```text
Real Browser Trace: PASSED
Mission 004 Five-Run Visual Acceptance: PASSED
Build 013M.8: PASSED / Presentation Candidate
```
