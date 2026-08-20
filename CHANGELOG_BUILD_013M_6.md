# Mission BOS – Build 013M.6
## Customer Dashboard Polish – kundentaugliche Informationshierarchie im Telekom-Touch

**Datum:** 2026-08-10  
**Implementierungsbasis:** `Mission-BOS-Build-013M.5`  
**Basis-SHA-256:** `bec6e55862d0269e79acae52ddd5fae2a5df433960aa585709597de645042609`

## Umfang
Build 013M.6 ist ausschließlich ein Customer-UI-Polish des bestehenden rechten Dashboards. Missionslogik, Fahrzeugbewegung, Mission-004-Rückfahrmanöver, No-Cross-Verkehrslogik sowie die gemeinsame Mobilfunk-/Association-/Cell-Load-/Capacity-/Auto-BOS-Priority-Architektur wurden nicht geändert.

## Neue Informationshierarchie
Das rechte Panel folgt nun dieser sichtbaren Reihenfolge:

1. Header
2. Live Summary
3. Missionen
4. Einsatzlage
5. Netz & Priorisierung
6. Technische Details – standardmäßig geschlossen
7. Präsentationssteuerung – standardmäßig geschlossen
8. Primäre Missionsaktion

## Header und Live Summary
- Browser-Titel auf `Mission BOS | Connected Response` aktualisiert.
- Header behält `MISSION BOS` und `Connected Response` und ergänzt einen dezenten Telekom-Magenta-Akzent sowie `LIVE DEMO`.
- Eine dominante Buildnummer wurde aus dem Header entfernt.
- Die sichtbare Buildreferenz steht ausschließlich klein unter `Technische Details` als `Build 013M.6`.
- Der Live-Summary-Strip zeigt nur noch:
  - Einsatzphase (`#mission-phase-value`)
  - Netzlage (`#network-status`)
  - Höchste Zelllast (`#customer-max-cell-load`)
- `#active-mode` und `#load-value` bleiben technisch vorhanden, wurden aber aus der primären Kundenübersicht in die technischen Details verschoben.

## Missionsauswahl und Einsatzlage
- Alle vier bestehenden Missionen bleiben sichtbar und verwenden unverändert die bestehende Registry-/Locking-Logik.
- Auswahl/Aktivstatus wird dezent mit Telekom-Magenta hervorgehoben.
- Einsatzlage konzentriert sich sichtbar auf Missionstitel, Status, aktuelle Phase, Beschreibung und Einsatzfortschritt.
- `#fire-unit-status` und `#city-status` wurden ohne Änderung ihrer Datenquellen in die technischen Details verschoben.

## Netz & Priorisierung
- Bestehende Cell-Load-Zeilen wurden visuell verfeinert: Tower-ID/Bezeichnung, Prozentwert, textlicher Status, horizontaler Load-Track und bestehende Severity-Semantik.
- `BOS aktiv` erscheint nur bei tatsächlich aktivem Priority-Zustand und bleibt blau/cyan statt magenta.
- `#customer-max-cell-load` wird dynamisch aus `getValidatedCellLoadSnapshot().rows` als Maximum der tatsächlichen Zellzeilen ermittelt. Es gibt keine neue feste Tower-Zuweisung.
- Neue Runtime-abgeleitete Customer Story:
  - NORMAL: `Netz im Normalbetrieb`
  - HIGH LOAD: `Zivile Nachfrage steigt`
  - OVERLOADED: `Funkzelle ausgelastet`
  - BOS ACTIVE: `BOS-Kommunikation priorisiert`
- Es wurden keine neuen Latenz-, Bandbreiten-, SLA- oder Qualitäts-KPIs eingeführt.

## Technische Details und Präsentationssteuerung
- Neues geschlossenes `<details id="technical-details-panel">` bündelt Kommunikationspfad, Detailstatus, Serving Cells, Handover, Kapazitätswirkung, Infrastrukturwerte, bestehende symbolische Hinweise und Buildreferenz.
- `#presenter-panel` bleibt ein `<details>`, wurde hinter die technischen Details verschoben und ist standardmäßig geschlossen.
- `#overload-button` und `#bos-button` liegen nun innerhalb der Präsentationssteuerung; ihre bestehende Logik wurde nicht geändert.

## Primäre Aktion
- Neuer Container `#customer-primary-actions` enthält ausschließlich `#mission-button` als große primäre Aktion.
- Missionsbutton-Logik und bestehende Zustands-/Buttontexte bleiben unverändert.
- Auf großen Desktop-Höhen ist die Aktion sticky; bei kompakten Höhen bis 900 px wird sie in den normalen Dokumentfluss gesetzt, um Inhalte nicht zu überdecken.

## Visuelle Leitlinien
- Bestehender dunkler Navy-Look erhalten.
- `#E20074` gezielt für Marke, Auswahl und Primary Action verwendet.
- BOS/Connectivity bleibt blau/cyan.
- Grün/Amber/Rot bleiben semantische Lastzustände.
- Kein neues Logo, keine Webfont, keine Bibliothek und kein externes Asset hinzugefügt.
- Desktop-Panelbreite: ca. 420 px; kompakte Desktop-Ansicht 390 px.

## Geänderte Produktionsdateien
- `index.html`
- `style.css`
- `app.js`

## Unverändert übernommene Frozen Preparation-Dateien
- `city-customer-dashboard-plan.js`
- `city-customer-dashboard-contract.js`
- `customer-dashboard-contract-validator.js`
- `customer-dashboard-dom-validator.js`

## Nicht geändert
Insbesondere unverändert gegenüber Build 013M.5:
- Mission-001/002/003/004-Quelldateien
- `city-response-vehicle-renderer.js`
- `city-mission-004-response-controller.js`
- `city-mission-004-controller.js`
- `city-network-radio-model.js`
- `city-network-association-controller.js`
- `city-cell-load-controller.js`
- `city-cell-capacity-controller.js`
- `city-auto-bos-priority-controller.js`
- `city-traffic-plan.js`
- `city-layout-recovery.js`

## Freigabestatus
Technische, Contract-, DOM- und responsive Browser-Layout-Abnahmen sind bestanden. Die vollständige reale WebGL-Missions-Sichtabnahme konnte in der isolierten Build-Umgebung wegen einer Chromium-Administrator-Policy für lokale Seiten nicht ausgeführt werden. Build 013M.6 wird daher noch nicht als formal freigegebener interner Release Candidate bezeichnet.
