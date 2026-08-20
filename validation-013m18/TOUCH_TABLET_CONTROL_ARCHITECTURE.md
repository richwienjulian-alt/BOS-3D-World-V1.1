# Touch-/Tablet-Steuerung – Architektur

## Zielbild
Maus/Tastatur und Touch funktionieren parallel. Es gibt **keinen sichtbaren Touchmodus** und keinen Schalter zwischen Eingabearten.

## Empfohlene Architektur
Additiv neue Module:
- `city-touch-camera-plan.js`
- `touch-camera-validator.js`
- `city-touch-camera-controller.js`

`app.js` liefert dem Controller nur einen schmalen Kamera-Command-Adapter und vorhandene Runtimes. Die bestehende Desktop-`bindControls()`-Logik bleibt unangetastet.

## Kamera-Command-Adapter
Empfohlene Methoden:
- `panGround(forwardMeters, rightMeters)`
- `setFov(nextFov)`
- `getFov()`
- `getPose()`
- `goHome()`
- `stopVelocity()`
- `releasePresenterCamera(reason)`

Die Bewegung bleibt in den bestehenden Weltgrenzen (`x/z -54..54`).

## Event-Grenzen
Touch-Events werden ausschließlich auf dem Three.js-Canvas verarbeitet.
- Canvas: `touch-action: none`
- Dashboard: normale vertikale Touch-Scrollbarkeit erhalten
- Dashboard-Touches dürfen niemals die Stadt bewegen.

## Presenter-Verträglichkeit
Jede direkte manuelle Kamerabewegung durch Touch oder Dashboard-Kameratasten muss zuerst denselben manuellen Release-Mechanismus auslösen wie Mausrad/Mausbewegung. Ein aktiver Presenter-Bookmark darf anschließend nicht gegen die Touch-Eingabe zurückspringen.

## Kein Umbau der Desktop-Steuerung
Unverändert schützen:
- WASD
- Q/E
- Mausziehen
- Mausrad-Zoom
- 0/1/2/3 Presenter-Kameras
- missionsspezifische Kamera-Profile aus 013M.17
