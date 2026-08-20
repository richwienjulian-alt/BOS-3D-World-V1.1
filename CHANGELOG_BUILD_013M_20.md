# Mission BOS – Build 013M.20

## Presenter Cleanup & Mission Camera Reframing

Basis: `Mission-BOS-Build-013M.19`  
SHA-256: `bd5842709bb3819724ed5a0a7f37b5f4911d053347ae0ddba4eead028176562f`

## Produktionsdelta

Ausschließlich zwei bestehende Produktionsdateien wurden geändert:

- `city-presenter-plan.js`
- `index.html`

`app.js`, `city-presenter-controller.js`, `style.css`, Touch-/Dashboard-Kamera, Missionen, Traffic-/Response-/Ambulanz-Runtimes und Netzwerklogik bleiben unverändert.

## Presenter UI

Sichtbar entfernt wurden:

- phasenabhängige Aktionskachel / `Nächster Schritt`
- Reset-Kachel
- kompletter sichtbarer `NETZ-DEMO`-Bereich
- `Netzlast simulieren`
- `BOS-Spur aktiv` / `BOS-Spur: automatisch`

Die vorhandenen IDs bleiben als `hidden`, `aria-hidden="true"`, `tabindex="-1"` Compatibility Controls bestehen. Sichtbar bleiben Modus, vier Kameratasten, Presenter-Hinweis und kompakte Statuszeile.

## Kamera-Reframing

Die gemeinsame Startansicht bleibt unverändert. Für Mission 001–004 wurden ausschließlich die missionsspezifischen Slots `Stadt`, `Einsatz` und `Netz` gemäß `CAMERA_PROFILE_MATRIX_BUILD_013M_20.md` neu kalibriert.

Es wurden keine automatischen Kamerafahrten eingeführt.
