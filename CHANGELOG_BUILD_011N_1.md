# Mission BOS – Build 011N.1 Changelog

Jede gegenüber `Mission-BOS-Build-010P.7` neue oder geänderte Datei ist nachfolgend einzeln begründet.

## Neue Quelldateien

| Datei | Begründung |
|---|---|
| `city-auto-bos-priority-controller.js` | Implementiert die verbindliche zellbezogene Automatik mit 90-%-Schwelle, 0,6 Sekunden Aktivierungsverzögerung, BOS-Endpunktbedingung, 85-%-/1,5-Sekunden-Freigabe, bestätigten Handovers und sofortigem Reset. |
| `city-tower-load-indicator-renderer.js` | Erzeugt genau fünf kameragerichtete Lastanzeigen an den tatsächlichen oberen Mast-Beacons einschließlich Prozentwert, exakter Farbstufen und automatischer blauer BOS-Spur. |
| `city-network-realism-plan.js` | Unverändert und bytegenau aus dem Vorbereitungspaket übernommen; verbindlicher schreibgeschützter Daten- und Policy-Vertrag für 011N.1. |
| `network-realism-validator.js` | Unverändert und bytegenau aus dem Vorbereitungspaket übernommen; verbindlicher schreibgeschützter Validator für Plan, Zählungen, Nachfrage und feste Mastzuweisungen. |

## Geänderte Quelldateien

| Datei | Begründung |
|---|---|
| `app.js` | Integriert die gemeinsame Verarbeitungskette Association → zivile Nachfrage → Zelllast → automatische Priorisierung → Kapazität → Renderer, bindet alle neuen Runtimes ein, leitet den globalen BOS-Status ausschließlich aus der Automatik ab und erweitert Reset sowie Validierung. |
| `city-network-association-controller.js` | Erweitert die bestehende gemeinsame Serving-Cell-Instanz auf alle 34 Endpunkte und löst Positionen aus den vorhandenen Fahrzeug-, Fußgänger-, Missions- und Arena-Runtimes auf, ohne feste Mast-ID. |
| `city-civilian-connectivity-controller.js` | Ersetzt die Vier-Endpunkte-Repräsentation durch exakt 31 zivile Endpunkte, delegiert alle Handovers an die gemeinsame Association und bewahrt sechs Einheiten permanente Basislast. |
| `city-cell-load-controller.js` | Verarbeitet die positionsabhängigen Beiträge aller Endpunkte, verteilt die sechs Mission-001-Einheiten als Nullsumme um und hält die Arena-Nachfrage bei 61 Einheiten ohne Doppelzählung. |
| `city-cell-capacity-controller.js` | Erweitert die Kapazitätsverteilung auf alle 31 zivilen und drei BOS-Endpunkte, bedient BOS zuerst und stuft zivile Sitzungen deterministisch ab, ohne Last oder Handover zu manipulieren. |
| `city-civilian-connectivity-renderer.js` | Rendert alle 13 immer aktiven zivilen Endpunkte mit durchgehenden roten Linien, einem Datenpunkt und serviceabhängiger Geschwindigkeit/Deckkraft. |
| `city-arena-event-controller.js` | Registriert alle zwölf Arena-Geräte im gemeinsamen Funkmodell und verteilt unverändert acht sichtbare sowie 53 aggregierte Einheiten. |
| `city-arena-event-connectivity-renderer.js` | Erweitert die Arena-Darstellung von acht auf zwölf durchgehende zivile Verbindungen mit jeweils einem Datenpunkt zum tatsächlichen Serving-Cell-Beacon. |
| `city-telekom-communication-renderer.js` | Stellt sechs Mission-001-Zuschauer zivil rot und Feuerwehr/Polizei ausschließlich blau mit Glow und je zwei schnellen Datenpunkten dar; alle Endpunkte folgen der dynamischen Serving Cell. |
| `city-ambulance-connectivity-renderer.js` | Stellt den Rettungswagen ausschließlich blau mit Glow und zwei Datenpunkten zum tatsächlichen Beacon seiner bestätigten Serving Cell dar. |
| `city-mission-001-controller.js` | Entfernt die manuelle BOS-Freigabe aus dem Ablauf und wechselt aus `OVERLOADED` automatisch weiter, sobald die zellbezogene Priorisierung aktiv ist. |
| `city-mission-002-controller.js` | Entfernt die manuelle BOS-Freigabe aus dem Ablauf und wechselt aus `OVERLOADED` automatisch weiter, sobald die zellbezogene Priorisierung aktiv ist. |
| `city-mission-registry-controller.js` | Behält Kompatibilitätsschnittstellen, verhindert aber jede manuelle `ACTIVATE_BOS`-Auslösung und behandelt die BOS-Spur als automatisch. |
| `city-presenter-controller.js` | Wandelt den bisherigen BOS-Aktionsschritt in eine automatische Warte-/Statusphase um und löst keine manuelle Priorisierung mehr aus. |
| `city-presentation-polish-plan.js` | Aktualisiert Build-Kennung, Arena-Zählung, automatische BOS-Anforderung und die Trennung zwischen magentafarbener UI und blauer BOS-Weltvisualisierung. |
| `presentation-polish-validator.js` | Prüft die 12 Arena-Endpunkte, blaue BOS-Weltvisualisierung und die automatische Prioritätsruntime statt des historischen manuellen Vertrags. |
| `index.html` | Aktualisiert Build-Titel und bindet die beiden schreibgeschützten Vorgaben sowie die zwei neuen Runtimes in klassischer `file://`-kompatibler Reihenfolge ein. |
| `style.css` | Kennzeichnet den bestehenden BOS-Button dauerhaft als nicht klickbare, dennoch klar lesbare Statusanzeige; Telekom-Magenta bleibt UI-Farbe. |

## Geänderte Release-Dokumentation

| Datei | Begründung |
|---|---|
| `RELEASE_NOTES.md` | Ersetzt die veralteten 008R.12-Hinweise durch den tatsächlichen 011N.1-Umfang, Endpoint-Zählung, Lastbilanz, Automatik und Startanleitung. |
| `REGRESSION_REPORT.md` | Dokumentiert sämtliche finalen 011N.1-Validator-, Controller-, Missions-, Handover-, Soak- und Schutzprüfungen samt Aussagegrenze. |
| `KNOWN_LIMITATIONS.md` | Aktualisiert die sachlichen Grenzen auf Mission 001 und 002, automatisches Funkmodell, symbolische Simulation sowie die nicht automatisierbare CDN-WebGL-Sichtprüfung. |
| `CHANGELOG_BUILD_011N_1.md` | Liefert die geforderte exakte Einzelbegründung jeder neuen und geänderten Datei. |
| `LOCAL_TEST_INSTRUCTIONS_BUILD_011N_1.md` | Liefert die geforderte reproduzierbare lokale Sicht-, Missions-, Handover-, Reset- und Duplikatabnahme. |
| `SHA256SUMS.txt` | Wird für den finalen 011N.1-Ordner neu erzeugt, damit alle ausgelieferten Dateien mit aktuellen Prüfsummen abgesichert sind. |

## Unveränderte Schutzbereiche

Bytegenau unverändert blieben insbesondere:

- Stadtgeometrie und Layout
- Gebäude, Straßen, Grundstücke und Props
- Fahrzeugmodelle und Reifen
- Verkehrs- und Fußgängerrouten
- Feuerwehr-, Polizei- und Rettungswagenrouten
- Einsatzorte
- Feuer-, Rauch-, Patienten- und Behandlungsinhalte
- Dashboard-Breite und Grundstruktur
