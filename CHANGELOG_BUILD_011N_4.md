# Mission BOS – Build 011N.4 Changelog

## Titel

**Mission 001 Communication Parity & Mission 003 Stadtwerke Vehicle Foundation**

## Ausgangsbasis

Build 011N.4 wurde ausschließlich auf einer frisch kopierten Fassung von `Mission-BOS-Build-011N.3R.1(1).zip` mit der verifizierten SHA-256-Prüfsumme

```text
8038b8fa30d8b99543383cfa8826be4b917de2a09e53c0078ef274c9f1ad1438
```

erstellt. Der verworfene Build 011N.3 wurde nicht als Codequelle verwendet.

## Neue Dateien

| Datei | Begründung |
|---|---|
| `city-mission-001-connectivity-parity-plan.js` | Schreibgeschützter Vertrag für die Darstellungsparität zwischen Feuerwehr/Polizei und der unveränderten Rettungswagenreferenz. Bytegenau aus dem Vorbereitungspaket übernommen. |
| `mission-001-connectivity-parity-validator.js` | Schreibgeschützter Strukturvalidator für Paketgeometrie, Richtungen, Offsets, Layering und permanente dynamische Verbindung. Bytegenau übernommen. |
| `city-mission-003-stadtwerke-foundation-plan.js` | Schreibgeschützter Vertrag für das einzelne statische Stadtwerke-Servicefahrzeug und den freigegebenen Stellplatz. Bytegenau übernommen. |
| `mission-003-stadtwerke-foundation-validator.js` | Schreibgeschützter Foundation-Validator für Standort, Erscheinungsbild, Isolation von Mission und Netz sowie Runtime-Schnittstelle. Bytegenau übernommen. |
| `city-stadtwerke-vehicle-renderer.js` | Erzeugt genau ein statisches `STADTWERKE_01` mit vier Rädern, lokaler Canvas-Beschriftung auf beiden Seiten, blau-türkiser Markierung und einer nicht blinkenden orangefarbenen Warnleuchte. Stellt Manifest, Safety und zukünftigen Kommunikationsanker bereit, registriert aber weder Mission, Route noch Netzlast. |
| `CHANGELOG_BUILD_011N_4.md` | Dokumentiert Basis, Umfang und Begründung jeder Änderung. |
| `TEST_REPORT_BUILD_011N_4.md` | Dokumentiert Syntax-, Validator-, Renderer-, Missions-, Stabilitäts- und Schutzprüfungen. |
| `LOCAL_TEST_INSTRUCTIONS_BUILD_011N_4.md` | Beschreibt die lokale visuelle und funktionale Endabnahme. |

## Geänderte Produktdateien

| Datei | Begründung |
|---|---|
| `city-telekom-communication-renderer.js` | Gleicht ausschließlich die Fahrzeugpfade von `NET_FIRE_01` und `NET_POLICE_01` an die unveränderte Rettungswagenreferenz an: `SphereGeometry(0.15, 8, 6)`, vier unabhängige Pakete, Richtungen `[1,1,-1,-1]`, Offsets `[0,0.5,0.25,0.75]`, `depthTest:false`, `depthWrite:false`, Renderreihenfolge Glow/Core/Pakete `40/41/42` und deaktiviertes Frustum-Culling der Pakete. Die sechs zivilen Mission-001-Pfade und die Funklogik bleiben unverändert. |
| `app.js` | Validiert beide neuen Pläne fail-soft, erzeugt das Stadtwerke-Fahrzeug ausschließlich nach erfolgreicher Foundation-Validierung, prüft Manifest und Runtime-Safety, aktualisiert und entsorgt den Renderer und erhöht die bestehende Gesamtfahrzeugzahl um genau eins. Mission 003 wird nicht registriert. |
| `index.html` | Lädt die vier schreibgeschützten Plan-/Validator-Dateien und den neuen Renderer in klassischer Script-Reihenfolge vor `app.js`; aktualisiert die sichtbare Build-Bezeichnung. |

## Aktualisierte Release-Dokumentation

| Datei | Begründung |
|---|---|
| `RELEASE_NOTES.md` | Beschreibt Build 011N.4 und den begrenzten Funktionsumfang. |
| `REGRESSION_REPORT.md` | Fasst die aktuelle Schutz- und Missionsregression zusammen. |
| `KNOWN_LIMITATIONS.md` | Dokumentiert weiterhin geltende Modell- und Browsergrenzen sowie den Foundation-Status von Mission 003. |
| `SHA256SUMS.txt` | Enthält die finalen SHA-256-Prüfsummen des auszuliefernden Builds. |

## Nicht verändert

Insbesondere unverändert blieben:

- `city-ambulance-connectivity-renderer.js` als verbindliche Qualitätsreferenz,
- `city-bos-backhaul-renderer.js`,
- `style.css`,
- sämtliche Funk-, Handover-, Last-, Kapazitäts- und Prioritätscontroller,
- Mission-001- und Mission-002-Controller, Szenen und Erzählung,
- Rettungswagenmodell und Krankenhaus-Handover,
- Stadt, Straßen, Gebäude, Mobilfunkmasten, Verkehr, Fußgänger und alle bestehenden Routen,
- Mission Registry und Dashboard-Struktur.
