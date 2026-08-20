# Mission BOS – Build 012M.1 Changelog

## Basis

Build 012M.1 wurde ausschließlich aus `Mission-BOS-Build-011N.4(1).zip` aufgebaut. Es wurden keine Dateien aus anderen Builds übernommen.

## Neue schreibgeschützte Vorgaben

Die folgenden Dateien wurden bytegenau aus dem Vorbereitungspaket übernommen:

- `city-mission-003-response-plan.js`
- `mission-003-response-validator.js`
- `city-mission-003-water-leak-plan.js`
- `mission-003-water-leak-validator.js`
- `city-mission-003-network-extension.js`
- `mission-003-network-extension-validator.js`
- `city-mission-003-registry-extension.js`
- `mission-003-registry-extension-validator.js`
- `mission-003-integration-validator.js`

## Neue Produktionsdateien

- `city-mission-003-scene-renderer.js` – rendert Wasserstrahl, Wasserfläche, Reparaturfläche, Absperrungen, Leitkegel, Einsatzpersonal, sechs Passanten und deren Endgeräte.
- `city-mission-003-response-controller.js` – koordiniert Yield, Routenprofil, zeitversetzten Drei-Fahrzeug-Dispatch, Rückfahrt, Verkehrsfreigabe und Profilwiederherstellung.
- `city-mission-003-connectivity-renderer.js` – visualisiert den permanenten Utility-Link und sechs missionsgebundene zivile Verbindungen ausschließlich aus Association- und Capacity-Zuständen.
- `city-mission-003-controller.js` – implementiert die 15 Zustände der Mission und verwendet ausschließlich automatische zellbezogene BOS-Priorisierung.

## Geänderte Produktionsdateien

- `index.html` – bindet alle neuen Pläne, Validatoren und Runtimes in klassischer `file://`-Reihenfolge vor `app.js` ein.
- `app.js` – validiert und initialisiert Mission 003, erweitert Runtime-Kontext, Update/Reset/Dispose, Netzwerkprovider, Dashboard und die stufenweise Registry-Finalisierung.
- `city-response-vehicle-renderer.js` – ergänzt das validierte Profil `MISSION_003_WATER_LEAK_PROFILE` für die bestehenden Feuerwehr- und Polizeimodelle. Eine deterministische Footprint-Sicherheitskalibrierung erhöht nur den späteren Startzeitpunkt, wenn die realen Fahrzeugflächen sonst kollidieren; Route und Geschwindigkeit bleiben unverändert.
- `city-stadtwerke-vehicle-renderer.js` – macht die einzige Instanz `STADTWERKE_01` entlang der eingefrorenen Mission-003-Route beweglich und stellt sie anschließend exakt auf `B06_READY_AREA` zurück.
- `city-network-association-controller.js` – verarbeitet Utility und sechs Mission-003-Endpunkte im gemeinsamen V3-Funkmodell. Die Utility-Klassifizierung wird getrennt von den 13 zivilen Dauerendpunkten gezählt.
- `network-realism-validator.js` – validiert 41 Endpunkte, 38 Nicht-BOS-Endpunkte, einen Utility-Endpunkt und sechs Mission-003-Endpunkte.
- `city-civilian-connectivity-controller.js` – verteilt Utility- und Mission-003-Nachfrage über bestätigte Serving Cells ohne neue Funklogik.
- `city-cell-load-controller.js` – ergänzt das dynamisch abgeleitete Mission-003-Sättigungsprofil 98–100 Prozent und beendet es sofort bei `RETURNING`.
- `city-cell-capacity-controller.js` – berücksichtigt alle 38 Nicht-BOS-Endpunkte in der bestehenden deterministischen Kapazitätsverteilung.
- `city-mission-registry-controller.js` – unterstützt drei Definitionen, `registerUnavailable`, stufenweise Registrierung und generische Finalisierung. Der erwartete Registrierungszustand vor Finalisierung erzeugt keine falschen Konsolenfehler mehr.
- `mission-registry-validator.js` – validiert die additive Drei-Missions-Registry und deren Fail-soft-Vertrag.

## Dokumentation

- `RELEASE_NOTES.md`
- `REGRESSION_REPORT.md`
- `KNOWN_LIMITATIONS.md`
- `CHANGELOG_BUILD_012M_1.md`
- `TEST_REPORT_BUILD_012M_1.md`
- `LOCAL_TEST_INSTRUCTIONS_BUILD_012M_1.md`
- `FINAL_REPORT_BUILD_012M_1.md`
- `SHA256SUMS.txt`

## Geschützte Systeme

Die 24 ausdrücklich geschützten Dateien wurden per SHA-256 mit Build 011N.4 verglichen. Abweichungen: 0. Mission-001-/002-Controller, Stadt, Straßen, Gebäude, Routen, Funkmodell, BOS-Hysterese, Mastanzeigen und B01/G02-Backhaul blieben unverändert.
