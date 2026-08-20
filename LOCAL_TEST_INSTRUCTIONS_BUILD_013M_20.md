# Local Test Instructions – Build 013M.20

## 1. Start

Build über einen lokalen HTTP-Server öffnen, nicht nur per Dateidoppelklick.

Beispiel:

```bash
python3 -m http.server 8000
```

Danach `http://localhost:8000/` im Zielbrowser öffnen.

## 2. Presenter Cleanup

`Präsentationssteuerung` öffnen und prüfen:

- Modusumschaltung sichtbar
- vier Kameratasten sichtbar
- Hinweis und Status sichtbar
- keine Aktions-/Next-Step-Kachel sichtbar
- keine Reset-Kachel sichtbar
- kein `NETZ-DEMO`
- kein `Netzlast simulieren`
- kein sichtbarer `BOS-Spur`-Button

## 3. Kameraabnahme

Für Mission 001, 002, 003 und 004 jeweils auswählen und manuell prüfen:

- `0 · Start`
- `1 · Stadt`
- `2 · Einsatz`
- `3 · Netz`

Für `Stadt/Einsatz/Netz` prüfen, ob das zentrale Motiv nicht unbrauchbar verdeckt wird und die Perspektive fachlich verständlich ist.

Mission 002 besonders prüfen:

- Stadt: Arena, Rettungsweg und Gesundheitsquartier zusammen verständlich
- Einsatz: Patient, Rettungswagen, Arena-Vorplatz
- Netz: MAST_E und Arena gemeinsam sichtbar

Ein Missionswechsel darf keine automatische Kamerafahrt auslösen.

## 4. Regression

- Mission 001 vollständig
- Mission 002 vollständig
- Mission 003 vollständig
- Mission 004 vollständig bis READY
- danach Mission 002 ohne Reload auswählen und starten
- Maus, Mausrad, WASD, Q/E
- Touch Pan / Pinch / Tap
- Dashboard Pan / Rotation / Zoom / Home
- T-Mission-Branding und Telekom-Logo

## 5. Freigabe

`ACCEPTANCE_CHECKLIST_BUILD_013M_20.md` erst nach realer WebGL-Sichtprüfung abhaken. Technische Harnesses ersetzen die Kamera-Sichtabnahme nicht.
