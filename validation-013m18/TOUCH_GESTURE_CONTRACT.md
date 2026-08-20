# Touch Gesture Contract

## Ein Finger – Karte verschieben
**Semantik:** klassische Map-/Grab-Geste. Die Stadt folgt dem Finger; die Kamera wird parallel zur Bodenebene verschoben.

Regeln:
- nur `x/z`, keine Höhenänderung
- Richtung aus aktueller Kamera-Yaw ableiten
- Pitch bleibt unverändert
- Bewegung erst nach Drag-Schwelle aktivieren
- Startwert für Drag-Schwelle: 8 CSS-Pixel
- `pointercancel` und verlorener Pointer-Capture müssen sauber abbrechen

## Tap – interaktives Objekt auswählen
Ein Touch gilt als Tap, wenn:
- genau ein Pointer beteiligt war
- Gesamtbewegung <= 8 CSS-Pixel
- keine Pinch-Geste begonnen hat
- Dauer <= 350 ms

Der Tap nutzt die vorhandene Netzinspektions-Raycastlogik mit der echten Tap-Position. Es werden **nur bereits definierte interaktive Targets** selektiert; dieser Build erweitert nicht automatisch die fachliche Target-Liste.

## Zwei Finger – Pinch-to-Zoom
Erste Version: **nur FOV-Zoom**, keine Kamerahöhe und keine Rotation.

Gründe:
- entspricht dem bereits etablierten Mausrad-Zoom
- vermeidet Gebäude-/Höhenkollisionen
- reduziert versehentliche Perspektivwechsel
- Presenter-Perspektiven bleiben verständlich

Regeln:
- Pinch auseinander => hineinzoomen => FOV kleiner
- Pinch zusammen => herauszoomen => FOV größer
- bestehende Grenzen 36–78° weiterverwenden
- beim Übergang 1 Finger -> 2 Finger darf kein Tap ausgelöst werden

## Touch-Rotation
Für den ersten Build **nicht vorsehen**. Desktop-Maus und Q/E bleiben die Rotationsmechanismen. Erst nach realem Tablet-Usability-Test optional ergänzen.

## Gleichzeitige Eingaben
- Sobald Touch aktiv ist, Maus-Events werden nicht künstlich deaktiviert.
- Ein Touch-Controller verarbeitet nur Pointer vom Typ `touch`/`pen`.
- Maus bleibt bei den bestehenden Desktop-Handlern.
