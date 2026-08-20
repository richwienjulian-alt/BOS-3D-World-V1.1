# Mission BOS – Build 012M.2 Test Report

## Statische Integrität

- JavaScript-Syntax: 111/111 Dateien `PASSED`.
- lokale Scriptreferenzen in `index.html`: 108.
- fehlende lokale Scripts: 0.
- doppelte lokale Scripts: 0.
- doppelte HTML-IDs: 0.
- ES-Module: 0.
- produktive lokale `fetch()`-Aufrufe: 0.
- neue schreibgeschützte Dateien: 4/4 bytegenau zum Vorbereitungspaket.
- alte Mission-001-Paritätsdateien im Archiv, aber nicht mehr als aktiver Scriptvertrag geladen.
- eigenständige Instanziierungen des historischen Ambulanz-Konnektivitätsrenderers: 0.
- Unified-Runtime-Erzeugungen in `app.js`: 1.
- Unified-Runtime-Updates pro Render-Frame: 1.

## Plan- und Strukturvalidatoren

30/30 Validatoren meldeten `PASSED`:

Geometry, Static Props, Traffic, Pedestrians, Response Vehicle, Incident Response, Ambulance, Mission 001, Mission 001 Scene, Arena Event, Mission 002, Cell Load, Network Association, Cell Capacity, Telekom Communication, Handover Visualization, Presenter, Exploration Interface, Network Exploration, Mission Registry, Network Realism, Mission 001 Network Polish, Network Recovery, Stadtwerke Foundation, Mission 003 Response, Mission 003 Water Leak, Mission 003 Network Extension, Mission 003 Registry Extension, Unified BOS Connectivity und Stadtwerke Beacon Polish.

Zusätzliche Runtime-Integrationsvalidatoren:

- Dual Mission Recovery: `PASSED`.
- Presentation Polish: `PASSED`.
- Mission 003 Runtime Integration: `PASSED`.
- Registry finalized: `true`.
- registrierte Runtimes: 3.
- unavailable Missions: 0.
- Netzendpunkte: 41.
- Nicht-BOS-Endpunkte: 38.

## Shared-Link-Primitive

- Core-Linien je Pfad: 1.
- Glow-Linien je Pfad: 1.
- Pakete je Pfad: 4.
- Hin-/Rückrichtung: 2/2.
- Paketgeometrie: `SphereGeometry(0.15, 8, 6)`.
- Offsets: `0`, `0.5`, `0.25`, `0.75`.
- Richtungen: `1`, `1`, `-1`, `-1`.
- Standby-Linie: `#9BDFFF`.
- Standby-Pakete: `#B9E6FF`.
- Priority-Linie: `#0066CC`.
- Priority-Pakete: `#E20074`.
- Phase beim Standby-/Priority-Wechsel erhalten: `PASSED`.
- Phase beim Serving-Cell-Wechsel erhalten: `PASSED`.
- `depthTest:true` und `depthWrite:false` für Core, Glow und alle Pakete: `PASSED`.
- Always-on-top-Pfade: 0.

## Unified Runtime

Manifest:

```text
Endpoints:             3
Vehicle paths:         3
Packets per path:      4
Total vehicle packets: 12
Forward/reverse:       6 / 6
Duplicate paths:       0
Always-on-top paths:   0
```

- Feuerwehr, Polizei und Rettungswagen lesen dieselbe Association-Quelle.
- Live-Anker und Tower-Beacon werden in jedem Render-Frame aktualisiert.
- Priority-Stil wurde ausschließlich bei aktiver zelllokaler Priorisierung und Endpoint-Mitgliedschaft aktiviert.
- Handover änderte das Ziel im gleichen Frame, ohne zweite Linie oder Altanker.
- Ambulanz-Kompatibilitätsfassade besitzt keine Szeneobjekte.

## Telekom- und Backhaul-Runtimes

Telekom Communication:

```text
Mission-001 civilian links:                 6
Mission-001 civilian packets:               6
BOS vehicle paths owned by this renderer:   0
BOS vehicle packets owned by this renderer: 0
```

Backhaul:

- ein gemeinsamer B01-Pfad bei gleicher Feuerwehr-/Polizeizelle: `PASSED`.
- maximal zwei B01-Pfade bei unterschiedlichen Zellen: `PASSED`.
- genau ein G02-Pfad: `PASSED`.
- vier Pakete pro sichtbarem Pfad, 2/2 Richtungen: `PASSED`.
- Shared Factory und World-Occlusion-Materialvertrag: `PASSED`.
- veraltete Pfade nach Handover: 0.

## 60-Sekunden-Leerlauf

- simulierte Render-Frames: 3.600.
- dauerhaft sichtbare Fahrzeugpfade: 3/3.
- sichtbare Pakete: 4 je Pfad.
- Paketbewegung in beide Richtungen: `PASSED`.
- doppelte Fahrzeugpfade: 0.
- eingefrorene Paketfolgen: 0.
- unberechtigter Magenta-/Priority-Zustand: 0.

## Stadtwerke-Beacon

- Amber-Farbe: `#FFB000`.
- aktive Emissive-Untergrenze: mindestens 1,15.
- Halo-Opazität aktiv: mindestens 0,10.
- Linse und Halo als Kinder des Fahrzeug-Roots: `PASSED`.
- Linse und Halo mit aktivem Tiefentest: `PASSED`.
- geparkter Zustand inaktiv: `PASSED`.
- `PREPARED` bis Rückfahrt aktiv: `PASSED`.
- nach Rückkehr wieder inaktiv: `PASSED`.
- blaue Leuchtenobjekte: 0.
- Route, Geschwindigkeit und Rückkehr an die Basis: `PASSED`.

## Missionsregression

Ausgeführte Wechselreihenfolge:

```text
Mission 001 -> Reset
Mission 002 -> Reset
Mission 003 -> Reset
Mission 001 erneut
```

Ergebnisse:

- Mission 001: 4 vollständige Controllerzyklen bis `READY`, einschließlich unmittelbarer Wiederstarts.
- Mission 002: vollständiger Zyklus über Arena, Behandlung, Krankenhaus und Rückkehr bis `READY`.
- Mission 003: vollständiger Zyklus über Wasserleck, automatische Priorisierung, Reparatur und Rückkehr bis `READY`.
- unerwartete Konsolenfehler: 0.
- alle drei Missionen im Endzustand `READY`.
- Missionscontroller, Routen, Lastkurven und Prioritätshysterese gegenüber 012M.1 unverändert.

## 20-Minuten-Stabilität

- simulierte Dauer: 1.200 Sekunden.
- Schritte: 24.000.
- geprüfte aufeinanderfolgende Paketframes: 71.997.
- bewegte Paketframes: 71.997.
- simulierte bestätigte Handovers: 30.
- Unified-/Backhaul-Resets: 4.
- Frames mit aktivem Priority-Stil: 12.000.
- Szeneobjekte Beginn/Ende: 59/59.
- wachsende Unified-Objektzahl: 0.
- wachsende Backhaul-Objektzahl: 0.
- stehende Pakete: 0.
- stale Tower-Ziele: 0.
- Depth-Policy-Fehler: 0.
- Runtime-Safety Unified/Backhaul: `PASSED`.

## Occlusion-Abnahme

Automatisiert nachgewiesen wurden für alle drei Fahrzeugpfade und alle B01-/G02-Pfade:

- `depthTest:true`.
- `depthWrite:false`.
- keine Always-on-top-Materialien.
- kein `clearDepth()`.
- keine Overlay-Szene.
- keine kamerabasierten Sichtbarkeitsausnahmen.

Eine pixelbasierte Kamera-/Gebäudeverdeckungsprüfung in Chromium konnte in der isolierten Testumgebung nicht abgeschlossen werden: Die produktive Seite lädt Three.js per CDN, während die Sandbox den CDN-Host nicht auflösen konnte; der Headless-Browser lieferte deshalb keine nutzbare WebGL-Seite. Eine erfolgreiche visuelle Browserprüfung wird ausdrücklich nicht behauptet. Die lokale Sichtprüfung ist in `LOCAL_TEST_INSTRUCTIONS_BUILD_012M_2.md` beschrieben.
