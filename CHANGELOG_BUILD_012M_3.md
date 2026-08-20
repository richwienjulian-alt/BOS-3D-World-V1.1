# Mission BOS – Build 012M.3 Changelog

## Basis

Build 012M.3 wurde ausschließlich aus `Mission-BOS-Build-012M.2(2).zip` erstellt. Die geprüfte Baseline-SHA-256 lautet:

`b7b11688500c2d3a19649756eab2efee5357a7d37501f506c4bfacb5971ebe34`

Es wurden keine Dateien aus älteren oder verworfenen Builds als Codequelle verwendet.

## Neue Dateien

| Datei | Begründung |
|---|---|
| `city-mission-003-connectivity-parity-plan.js` | Schreibgeschützter 012M.3-Vertrag für permanente Mission-003-Fahrzeugkonnektivität und eindeutiges Renderer-Ownership. Bytegenau aus dem Vorbereitungspaket übernommen. |
| `mission-003-connectivity-parity-validator.js` | Schreibgeschützter Plan- und Runtime-Validator für vier Fahrzeugpfade, 16 Pakete, Utility-Non-BOS und sechs M3-Zivilpfade. Bytegenau übernommen. |
| `CHANGELOG_BUILD_012M_3.md` | Dokumentiert jede neue und geänderte Datei. |
| `TEST_REPORT_BUILD_012M_3.md` | Dokumentiert Validatoren, Missionsfolge, Standby-, Priority-, Handover- und Stabilitätstests. |
| `FINAL_REPORT_BUILD_012M_3.md` | Kompakter technischer Abschlussbericht. |
| `LOCAL_TEST_INSTRUCTIONS_BUILD_012M_3.md` | Lokale Sicht- und Funktionsabnahme per Doppelklick auf `index.html`. |

## Ersetzte schreibgeschützte Dateien

| Datei | Begründung |
|---|---|
| `city-unified-bos-connectivity-plan.js` | Durch die unveränderte 012M.3-Fassung ersetzt; der Plan definiert nun vier Betriebsfahrzeuge einschließlich `NET_STADTWERKE_01`. |
| `unified-bos-connectivity-validator.js` | Durch die unveränderte 012M.3-Fassung ersetzt; erwartet 4 Pfade, 16 Pakete, 8/8 Richtungen und 0 Utility-Priority-Pfade. |

## Geänderte Produktions- und Integrationsdateien

| Datei | Begründung |
|---|---|
| `city-unified-bos-connectivity-renderer.js` | Liest sämtliche Endpunkte planbasiert, besitzt genau vier Fahrzeugpfade und wendet Priority nur bei `priorityEligible`, aktiver Zelle und BOS-Mitgliedschaft an. Stadtwerke bleibt dauerhaft Standby/UTILITY. |
| `city-mission-003-connectivity-renderer.js` | Entfernt den Utility-Pfad vollständig aus dieser Runtime. Sie besitzt nur noch sechs Wasserleck-Smartphones und sechs Datenpunkte. |
| `mission-003-integration-validator.js` | Führt die Paritäts-Runtimevalidierung in die finale M3-Integration ein und prüft Unified Runtime, M3-Zivilrenderer, B01/G02-Backhaul, 41 Endpunkte und 38 Nicht-BOS-Endpunkte. |
| `app.js` | Validiert beide 012M.3-Verträge, erstellt die Vier-Endpunkte-Runtime genau einmal, führt die Paritätsprüfung erst nach Backhaul-Erstellung aus und finalisiert anschließend die Mission-003-Integration. |
| `index.html` | Bindet Paritätsplan und -validator in klassischer Script-Reihenfolge vor Runtime und `app.js` ein; Buildbezeichnung auf 012M.3 aktualisiert. |
| `presentation-polish-validator.js` | Aktualisiert die aktive Präsentationsprüfung von 3/12 auf 4/16 Unified-Objekte und prüft zusätzlich `utilityPriorityPaths === 0`. |
| `release-validator.js` | Ergänzt die aktuellen optionalen Runtimechecks für Paritätsplan, Paritätsruntime und Stadtwerke-Endpunktsnapshot. Der historische 008R.12-Audit bleibt in der App deaktiviert. |
| `RELEASE_NOTES.md` | Auf den Inhalt von Build 012M.3 aktualisiert. |
| `REGRESSION_REPORT.md` | Auf die finale 012M.3-Prüfmatrix aktualisiert. |
| `KNOWN_LIMITATIONS.md` | Dokumentiert die verbleibende lokale visuelle Browserabnahme. |
| `SHA256SUMS.txt` | Nach Abschluss aller Änderungen vollständig neu erzeugt. |

## Nicht geändert

Insbesondere unverändert blieben Shared-Link-Factory, BOS-Backhaul, Stadtwerke-Fahrzeugmodell, Mission-001-/002-/003-Controller, Wasserleck-Szene, Fahrzeugrouten, Funkmodell, Association, Handover-Parameter, Zelllast, Kapazität, 90-/85-Prozent-Hysterese, Dashboard und Mastanzeigen.
