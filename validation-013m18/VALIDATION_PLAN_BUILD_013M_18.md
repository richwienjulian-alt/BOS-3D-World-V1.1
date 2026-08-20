# Validation Plan – Build 013M.18

## A. Desktop Regression
- WASD vorwärts/rückwärts/seitwärts
- Q/E Rotation
- Mausziehen Blickrichtung
- Mausrad FOV 36–78°
- Presenter 0/1/2/3 Mission 001–004
- Missionwechsel bewegt Kamera nicht automatisch

## B. Touch – Tablet Landscape & Portrait
Je mindestens 10 Wiederholungen:
- Ein-Finger-Pan
- langsamer und schneller Pan
- Pinch in/out
- Wechsel Pan -> Pinch -> Pan
- PointerCancel / Finger außerhalb Canvas
- Dashboard scrollen ohne Kamerabewegung
- Tap auf mindestens Mast, BOS-Fahrzeug und ziviles Target
- Tap nach Pan löst keine Auswahl aus

## C. Dashboard-Kamerasteuerung
- alle vier Pfeile je 10x
- Zoom + / − bis an beide Grenzen
- Home 10x aus unterschiedlichen Positionen
- Bedienung während aktivem Presenter-Bookmark löst Bookmark sauber und bewegt danach manuell
- keine horizontale Sidebar-Überbreite

## D. Einsatzlage
Für jede Mission jeden erreichbaren State prüfen:
- Titel vorhanden
- Statuspill aus kontrolliertem Vokabular
- `Aktuelle Phase` vorhanden
- genau ein Beschreibungssatz
- keine internen IDs/Runtime-/Validatorbegriffe
- keine Missionsnummer in Pill/Phase/Beschreibung
- keine zeichenweisen Wortumbrüche

## E. Cross-Mission Regression
- 001 komplett
- 002 komplett
- 003 komplett
- 004 komplett
- 004 -> 002 ohne Reload
- Netz & Priorisierung bleibt sichtbar

## F. Geräte-/Viewport-Abnahme
Mindestens:
- Desktop 1920×1080
- Desktop 1366×768
- Tablet 1024×768 Landscape
- Tablet 820×1180 Portrait

Echte Touch-Hardware oder Browser-Device-Emulation mit Pointer Events erforderlich; reine Controller-Harnesses reichen für finale UX-Abnahme nicht aus.
