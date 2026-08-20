# Mission BOS – Build 013M.18

## Titel
Touch-/Tablet-Steuerung & missionsübergreifende Einsatzlage-Konsistenz

## Ausgangslage
Einzige Implementierungsbasis:
`Mission-BOS-Build-013M.17(1).zip`

Verbindliche SHA-256:
`ea46e0102b346fa8ca21990da6e090e58a721686d76a948b485ab1c0372e4b92`

Keine ältere ZIP verwenden oder mit der Basis vermischen.

## Ziel
Zwei zusammengehörige UX-Themen umsetzen, ohne Missionen oder Netzlogik funktional zu verändern:

1. Maus/Tastatur und Touch parallel nutzbar machen – **ohne separaten Touchmodus**.
2. Das Customer-Dashboard-Feld `Einsatzlage` für Mission 001–004 auf eine gemeinsame Informations- und Sprachlogik bringen.

## Wichtigster Architekturgrundsatz
Dieser Build ist ein UX-/Input-Build. Keine Missions-State-Machine, keine Route, kein Fahrzeugtiming, kein Funkmodell und keine automatische BOS-Priorisierung dürfen neu interpretiert werden.

---

# TEIL A – Touch und Tablet

## Bestehende Desktop-Bedienung schützen
Unverändert erhalten:
- WASD
- Q/E
- Mausziehen
- Mausrad-Zoom
- Presenter 0/1/2/3
- F-Netzinspektion

Desktop-Handler nicht im selben Build auf Pointer Events refaktorieren. Touch additiv ergänzen.

## Touch-Gesten
### Ein Finger
Map-/Grab-Pan über die Stadt auf der Bodenebene.
Keine Rotation und keine Höhenänderung.

### Zwei Finger
Pinch-to-Zoom über dasselbe FOV-Modell wie das Mausrad.
Grenzen 36–78°.
Keine Zwei-Finger-Rotation in diesem Build.

### Tap
Tap auf ein bereits interaktives Kartenobjekt selektiert es über die bestehende Network-Inspection-Logik.
Kein paralleler zweiter Raycaster/Selektionszustand.

## Presenter-Verhalten
Jede Touch-/Dashboard-Kamerabewegung ist manuelle Eingabe und muss einen aktiven Presenter-Bookmark sauber freigeben. Keine automatische Kamerafahrt und kein automatischer Missionsstart.

## Neue Dashboard-Kamerasteuerung
Neuer standardmäßig geschlossener Bereich `Kamerasteuerung` zwischen `Technische Details` und `Präsentationssteuerung`.

Enthält:
- ↑ ↓ ← →
- − / + Zoom
- Home/Zentrieren

Mindestgröße 44×44 CSS-Pixel.
Home nutzt die bestehende sichere Ausgangsansicht aus `MISSION_BOS_INITIAL_CAMERA_CONTRACT_013M8`.

Die Spezifikationen `TOUCH_*`, `DASHBOARD_CAMERA_CONTROL_SPEC.md` und `INTERACTIVE_MAP_TAP_SELECTION_SPEC.md` sind verbindlich.

---

# TEIL B – Einsatzlage

## Sichtbare Struktur – für alle Missionen identisch
1. EINSATZLAGE
2. Missionsbezeichnung + kompakter Status
3. Aktuelle Phase
4. ein missionsspezifischer Lage-/Statussatz
5. Einsatzfortschritt

## Architektur
Keine Copy-Umbauten in den vier Missionscontrollern.
Stattdessen neue reine Presentation-Layer:
- `city-customer-incident-presentation-plan.js`
- `customer-incident-presentation-validator.js`

`app.js` rendert Customer-Titel, Summary-Phase, Statuspill, Stage und Beschreibung aus diesem Plan. Fehlende Presentation-Daten fallen auf die bestehenden Runtime-Werte zurück und dürfen niemals eine Mission technisch auf FAILED setzen.

Die Inhalte in `EINSATZLAGE_COPY_MATRIX.md` sind die verbindliche Ziel-Copy.

## Nummernlogik
Missionsnummern bleiben in Missionsauswahl und Startbutton.
Keine Formen wie `Mission 003 bereit` in Statuspill/Phase/Beschreibung.

---

# Voraussichtliche Änderungsgrenze
Siehe `IMPLEMENTATION_DELTA_MAP.md`.

Insbesondere keine Änderungen an:
- `city-mission-001-controller.js`
- `city-mission-002-controller.js`
- `city-mission-003-controller.js`
- `city-mission-004-controller.js`
- Response-/Ambulance-Routen und Renderer
- Cell Load / Capacity / Association / BOS Priority
- `city-presenter-plan.js` und missionsspezifischen 013M.17-Kameraposen

---

# Abnahme
Die Implementierung ist erst bestanden, wenn:
- alle Desktop-Regressionsprüfungen weiterhin PASSED sind,
- Tablet Landscape und Portrait mit echten Pointer-/Touch-Gesten geprüft wurden,
- Dashboard scrollt ohne Kamerabewegung,
- Tap/Pan/Pinch sauber getrennt sind,
- alle vier Einsatzlage-Karten über sämtliche erreichbaren States die gemeinsame Struktur/Copy verwenden,
- alle vier Missionen vollständig durchlaufen,
- Mission 004 → Mission 002 weiterhin ohne Reload funktioniert.

`VALIDATION_PLAN_BUILD_013M_18.md` und `ACCEPTANCE_CHECKLIST_BUILD_013M_18.md` sind verbindlich.
