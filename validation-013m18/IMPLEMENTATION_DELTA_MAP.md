# Erwartete Implementierungs-Delta-Map – Build 013M.18

> Diese Preparation enthält noch keinen Produktionspatch. Die Liste ist die empfohlene Änderungsgrenze für den späteren Build.

## Touch/Tablet – neue Dateien
- `city-touch-camera-plan.js`
- `touch-camera-validator.js`
- `city-touch-camera-controller.js`

## Touch/Tablet – voraussichtlich bestehende Dateien
- `app.js` – kleiner Kamera-Command-Adapter + Controller-Wiring
- `index.html` – neue `Kamerasteuerung` und Script-Reihenfolge
- `style.css` – Touch-Actions, Touch-Targets, Kamerasteuerungs-Layout
- `city-network-inspection-controller.js` – koordinatenbasierte Select-API addieren
- `city-network-exploration-plan.js` – Touch-Auswahl als zusätzliche erlaubte Eingabe deklarieren
- `network-exploration-validator.js` – neue API/Policy validieren
- `city-customer-dashboard-plan.js` – neuen geschlossenen Kamerabereich deklarieren
- `customer-dashboard-contract-validator.js`
- `customer-dashboard-dom-validator.js`

## Einsatzlage – neue Dateien
- `city-customer-incident-presentation-plan.js`
- `customer-incident-presentation-validator.js`

## Einsatzlage – bestehende Dateien
- `app.js` – Customer-Copy-Layer im `updateMissionPanel()` verwenden
- `index.html` – Script-Referenzen, ansonsten Struktur möglichst erhalten
- `style.css` – nur falls für identische Abstände nötig

## Ausdrücklich nicht ändern
- Missionscontroller 001–004
- Missions-State-Machines
- Missionsrouten und Fahrzeugrenderer
- Cell Load / Capacity / Association / BOS-Priority
- Presenter-Kamera-Profile aus 013M.17
- bestehende Desktop-`bindControls()`-Semantik
