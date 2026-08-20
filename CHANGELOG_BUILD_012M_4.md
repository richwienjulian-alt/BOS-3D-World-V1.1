# Mission BOS – Build 012M.4 Changelog

## Zweck

Build 012M.4 behebt ausschließlich den in der visuellen Referenz bestätigten Mission-003-Verbindungs- und Rückkehrfehler. Die Implementierung basiert ausschließlich auf `Mission-BOS-Build-012M.3`.

## Neue Dateien

- `city-mission-003-connectivity-recovery-plan.js` – unverändert aus dem Vorbereitungspaket übernommener, schreibgeschützter Recovery-Vertrag.
- `mission-003-connectivity-recovery-validator.js` – unverändert übernommener Plan- und Runtime-Validator.
- `CHANGELOG_BUILD_012M_4.md` – vollständige Änderungsbegründung.
- `TEST_REPORT_BUILD_012M_4.md` – automatisierte Prüf- und Regressionsergebnisse.
- `FINAL_REPORT_BUILD_012M_4.md` – technischer Abschlussbericht.
- `LOCAL_TEST_INSTRUCTIONS_BUILD_012M_4.md` – lokale Sicht- und Missionsabnahme.

## Geänderte Produktions- und Validator-Dateien

- `index.html` – lädt Recovery-Plan und Recovery-Validator vor `app.js` und kennzeichnet Build 012M.4.
- `app.js` – integriert Recovery-Planvalidierung, direkte Fahrzeug-Runtime-Quellen, missionsbezogenen Priority-Kontext und den neuen Runtime-Validator in der korrekten Initialisierungsreihenfolge.
- `city-unified-bos-connectivity-plan.js` – beschreibt direkte Live-Anker für alle vier operativen Fahrzeuge und die ausschließlich missionsgebundene Stadtwerke-Prioritätsberechtigung.
- `unified-bos-connectivity-validator.js` – validiert die neuen direkten Anchor-Quellen und den Mission-003-Priority-Vertrag.
- `city-unified-bos-connectivity-renderer.js` – liest sichtbare Startanker in jedem Frame direkt aus Feuerwehr-, Polizei-, Rettungswagen- und Stadtwerke-Runtimes; Association liefert nur Serving Cell und Handover. Recoverable Diagnosezustände frieren die Runtime nicht mehr ein.
- `city-network-association-controller.js` – trennt fatale Initialisierungs-/Datenfehler von kurzzeitig auflösbaren Endpoint- und Handover-Zuständen. Nur fatale Fehler stoppen die Auswertung.
- `city-cell-load-controller.js` – wendet Mission-003-Sättigung auf die tatsächlich genutzten Einsatzfahrzeugzellen an, beendet das Profil sofort bei `RETURNING` und lässt die Last kontrolliert auf Grundwerte fallen.
- `city-auto-bos-priority-controller.js` – erlaubt `NET_STADTWERKE_01` ausschließlich während gültiger Mission-003-Zustände als missionsgebundenen Priority-Teilnehmer; 90-/85-Prozent-Hysterese und Verzögerungen bleiben unverändert.
- `city-cell-capacity-controller.js` – berücksichtigt Stadtwerke nur während aktiver Mission-003-Einsatzpriorität in der zelllokalen Priority-Zuteilung und behandelt recoverable Runtime-Zustände fail-soft.
- `city-mission-003-water-leak-plan.js` – definiert Feuerwehr, Polizei und Stadtwerke als aktive Mission-003-Einsatzkommunikationsgruppe, ohne Stadtwerke organisatorisch als BOS-Endpunkt umzuklassifizieren.
- `mission-003-water-leak-validator.js` – prüft drei Mission-003-Priority-Teilnehmer bei weiterhin zwei organisatorischen BOS-Endpunkten und unverändertem Utility-Kanal.
- `city-mission-003-controller.js` – akzeptiert recoverable Netzdiagnosen, blockiert Transitionen nur bei fatalen Integritätsfehlern und wartet in `RETURNING` weiterhin auf Basisrückkehr, Lastabbau und Priority-Freigabe.
- `mission-003-connectivity-parity-validator.js` – prüft die missionsgebundene Utility-Priorität und verbietet sie außerhalb gültiger Mission-003-Zustände.
- `mission-003-integration-validator.js` – integriert Recovery-Plan- und Runtime-Ergebnis in die abschließende Mission-003-Freigabe.
- `presentation-polish-validator.js` – akzeptiert ausschließlich die neue Buildkennzeichnung; übrige Präsentationsprüfungen bleiben unverändert.
- `RELEASE_NOTES.md` – beschreibt den freigegebenen Recovery-Umfang.
- `REGRESSION_REPORT.md` – aktualisiert die abschließende Testmatrix.
- `KNOWN_LIMITATIONS.md` – dokumentiert die Grenzen der automatisierten visuellen Abnahme.
- `SHA256SUMS.txt` – wird für den finalen Paketstand vollständig neu erzeugt.

## Bewusst unverändert

- Mission-001- und Mission-002-Abläufe und Szenen
- Mission-003-Route, Wasserleck-Szene und Fahrzeuggeometrien
- Stadt, Straßen, Gebäude, Parkflächen und Mastgeometrien
- Rettungswagenroute und Krankenhaus-Handover
- Funkmodell und Handover-Parameter
- Aktivierung ab 90 Prozent und Freigabe unter 85 Prozent
- Shared-Link-Primitive, World-Occlusion und B01/G02-Backhaul
- Dashboardlayout und `style.css`
