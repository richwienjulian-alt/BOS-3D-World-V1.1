# Mission BOS – Build 012M.2 Changelog

## Grundlage

Einzige Implementierungsbasis war `Mission-BOS-Build-012M.1(2).zip` mit der bestätigten SHA-256-Prüfsumme `9033bc20f236c0b1aa396d179926f67c060fa4a439dd9e4368de9f67e39edeeb`. Es wurden keine Dateien aus anderen Builds als Codequelle verwendet.

## Neue Dateien

- `city-unified-bos-connectivity-plan.js` – unverändert übernommener, schreibgeschützter Vertrag für die drei gemeinsamen BOS-Fahrzeugpfade.
- `unified-bos-connectivity-validator.js` – unverändert übernommener Planvalidator.
- `city-stadtwerke-beacon-polish-plan.js` – unverändert übernommener Beacon-Vertrag.
- `stadtwerke-beacon-polish-validator.js` – unverändert übernommener Beacon-Validator.
- `city-bos-link-visual-factory.js` – gemeinsame Link-Primitive mit Core, Glow, vier bidirektionalen Paketen, phasenerhaltender globaler Renderzeit und World-Occlusion.
- `city-unified-bos-connectivity-renderer.js` – einzige Produktionsruntime für `NET_FIRE_01`, `NET_POLICE_01` und `NET_AMBULANCE_01`.
- `CHANGELOG_BUILD_012M_2.md` – diese Änderungsdokumentation.
- `TEST_REPORT_BUILD_012M_2.md` – automatisierter Prüfbericht.
- `FINAL_REPORT_BUILD_012M_2.md` – technischer Abschlussbericht.
- `LOCAL_TEST_INSTRUCTIONS_BUILD_012M_2.md` – lokale visuelle Endabnahme.

## Geänderte Produktionsdateien

- `index.html` – neue Pläne, Validatoren, Shared Factory und Unified Runtime in klassischer Script-Reihenfolge eingebunden; historische Mission-001-Paritätsdateien nicht mehr als aktiver Buildvertrag geladen; Buildbezeichnung aktualisiert.
- `app.js` – neue Planvalidierungen, genau eine Unified-Runtime-Instanz, genau ein Update pro Render-Frame, Ambulanz-Kompatibilitätsfassade ohne eigene Szeneobjekte, gemeinsamer Reset/Dispose und erweiterte Auditdaten.
- `city-telekom-communication-renderer.js` – auf sechs zivile Mission-001-Verbindungen begrenzt; besitzt keine Feuerwehr-, Polizei- oder Rettungswagenobjekte mehr; Dashboarddaten werden weiterhin aus Association/Priority beziehungsweise Unified Runtime abgeleitet.
- `city-bos-backhaul-renderer.js` – B01- und G02-Pfade verwenden dieselbe Shared-Link-Primitive; Deduplizierung, dynamische Serving Cells und zelllokale Priorität bleiben erhalten.
- `city-stadtwerke-vehicle-renderer.js` – ausschließlich Amber-Linse und Halo gemäß schreibgeschütztem Polish-Plan überarbeitet; Route, Geschwindigkeit, Abmessungen, Beschriftung und Mission-003-API unverändert.
- `presentation-polish-validator.js` – akzeptiert die objektfreie Ambulanzfassade, prüft die Unified Runtime und erwartet die finalisierte Drei-Missionen-Registry.
- `release-validator.js` – optionaler historischer Audit um Unified-/Beacon-Validierung, Fahrzeug-Snapshots und Backhaul-Manifest/Safety ergänzt; der alte Audit bleibt weiterhin deaktiviert.

## Aktualisierte Dokumentation

- `RELEASE_NOTES.md`
- `REGRESSION_REPORT.md`
- `KNOWN_LIMITATIONS.md`
- `SHA256SUMS.txt`

## Nicht mehr eigenständig instanziierte Renderer

- `city-ambulance-connectivity-renderer.js` bleibt als historische Referenzdatei im Archiv, wird in `app.js` jedoch nicht mehr erzeugt.
- Die Ambulanz-Kompatibilität wird über `validatedUnifiedBosConnectivity.getEndpointRuntime("NET_AMBULANCE_01")` bereitgestellt. Diese Fassade erzeugt und entsorgt keine eigenen Three.js-Objekte.
- `city-telekom-communication-renderer.js` bleibt aktiv, besitzt aber ausschließlich die sechs zivilen Mission-001-Pfade.

## Geschützte Systeme

Unverändert blieben sämtliche Stadt-, Straßen-, Gebäude-, Verkehrs-, Fußgänger-, Fahrzeug-, Routen-, Missions-, Association-, Funkmodell-, Last-, Kapazitäts-, Prioritäts- und Mastanzeigen-Dateien, die im Auftrag als funktional eingefroren aufgeführt sind.
