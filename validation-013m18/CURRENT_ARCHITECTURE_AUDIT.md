# Current Architecture Audit

## 1. Kamera und Input
`app.js` hält derzeit die eigentliche freie Kamera. Die Desktop-Steuerung ist direkt in `bindControls()` angebunden:
- `keydown/keyup` für WASD sowie Q/E
- `mousedown/mousemove/mouseup` für Blickrichtung
- `wheel` für FOV-Zoom

Die Presenter-Steuerung greift nicht direkt auf Three.js zu, sondern über `presenterCameraAdapter`. Das ist der richtige Integrationspunkt, um neue manuelle Eingaben sauber aus einem aktiven Bookmark zu lösen.

### Konsequenz für Touch
Die Desktop-Handler sollten **nicht in diesem Build refaktoriert oder ersetzt** werden. Die risikoärmste Lösung ist eine additive Touch-/Pointer-Schicht mit einem kleinen Kamera-Command-Adapter in `app.js`.

## 2. Interaktive Kartenobjekte
`city-network-inspection-controller.js` besitzt bereits die komplette Auswahl-/Darstellungslogik für zwölf definierte Netzobjekte. Aktuell wird ausschließlich aus der Bildschirmmitte geraycastet (`F`).

### Konsequenz für Touch
Keine zweite Selektionslogik bauen. Stattdessen dieselbe Raycast-Pipeline um eine öffentliche Methode für Bildschirmkoordinaten erweitern und Touch-Taps dorthin routen.

## 3. Dashboard
Die rechte Seitenleiste besitzt bereits zwei einklappbare Bereiche:
- `Technische Details`
- `Präsentationssteuerung`

Ein dritter, standardmäßig geschlossener Bereich `Kamerasteuerung` kann dort additiv eingefügt werden. Auf kleineren Viewports wird das Dashboard bereits als Overlay dargestellt.

## 4. Einsatzlage
Das DOM ist bereits grundsätzlich einheitlich:
1. `EINSATZLAGE`
2. Missionstitel + Statuspill
3. `Aktuelle Phase`
4. Beschreibung
5. `Einsatzfortschritt`

Die Inkonsistenz entsteht hauptsächlich aus den unterschiedlichen Missionsdaten:
- Titel stammen aus unterschiedlichen Planstrukturen.
- Statuslabels enthalten teilweise Missionsnummern und teilweise nicht.
- `phaseLabel`, `stageLabel` und Beschreibungen folgen unterschiedlichen Sprachmustern.
- Nur Mission 004 besitzt bereits eine eigene Customer-Presentation-Mapping-Schicht für kompakte Badges.

### Konsequenz
Die vier Missionscontroller nicht textlich umbauen. Eine neue reine Customer-Presentation-Layer soll die sichtbare Darstellung normalisieren und die bisherigen Runtime-Texte unverändert lassen.
