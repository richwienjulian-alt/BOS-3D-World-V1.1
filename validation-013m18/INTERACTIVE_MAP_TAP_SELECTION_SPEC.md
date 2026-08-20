# Antippen interaktiver Kartenobjekte

## Bestehende Grundlage
`city-network-inspection-controller.js` besitzt bereits:
- aufgelöste Target-Roots
- Raycaster
- Auswahlzustand
- Visual Selection
- Dashboard-Details
- `selectTargetById()`

Aktuell ist nur `performRaycast()` aus der Bildschirmmitte über Taste `F` verfügbar.

## Ziel-API
Den Controller um eine input-neutrale Methode ergänzen, z. B.:

`selectAtNormalizedDeviceCoordinates(x, y)`

oder

`selectAtClientPoint(clientX, clientY, canvasRect)`

Die interne Auswahlpipeline muss identisch bleiben.

## Schutzregeln
- `F` + Crosshair bleibt vollständig funktionsfähig.
- Keine Mission wird durch Tap gestartet oder verändert.
- Keine Kamera wird durch Objektselektion bewegt.
- Leerer Tap löscht die bestehende Auswahl standardmäßig **nicht**, entsprechend der aktuellen Policy `selectionClearsOnEmptyRaycast: false`.
- Kein Hover darf für Funktionalität erforderlich sein.

## Touch-Konfliktlösung
Die Objektauswahl wird erst auf `pointerup` ausgelöst, wenn der Pointer als Tap klassifiziert wurde. Ein Pan oder Pinch darf niemals gleichzeitig eine Auswahl erzeugen.
