# Acceptance Checklist - Build 013M.17

## Statisch

- [ ] Basis ist ausschliesslich Build 013M.16 mit dem dokumentierten SHA-256.
- [ ] Nur `city-presenter-plan.js` und `city-presenter-controller.js` wurden veraendert.
- [ ] 184 geschuetzte JS/HTML/CSS-Dateien sind bytegleich.
- [ ] Alle 4 Missionsprofile sind vorhanden.
- [ ] Alle 16 aufgeloesten Kamera-Slots sind innerhalb der Weltgrenzen.
- [ ] Keine niedrige Kamera liegt in Gebaeude oder Mast.
- [ ] Mission 002 Netzprofil zeigt MAST_E, Mission 004 Netzprofil MAST_C.
- [ ] Freie Erkundung und Mausrad-Zoom bleiben erhalten.

## Browser - Mission 001

- [ ] Mission 001 auswaehlen.
- [ ] Demo-Steuerung aktivieren.
- [ ] `2 · Einsatz` zeigt weiterhin Wohnungsbrand W14 sinnvoll.
- [ ] `3 · Netz` zeigt weiterhin MAST_B und Mission-001-Netzwirkung sinnvoll.

## Browser - Mission 002

- [ ] `1 · Stadt` zeigt Arena-Quartier.
- [ ] `2 · Einsatz` zeigt Patient / Rettungsdienst am Arena-Vorplatz.
- [ ] `3 · Netz` zeigt Arena und MAST_E sinnvoll gemeinsam.
- [ ] Kein sichtbarer Text verweist auf W14 oder MAST_B.

## Browser - Mission 003

- [ ] `1 · Stadt` zeigt Innenstadt / Wasserleck-Kontext.
- [ ] `2 · Einsatz` zeigt Wasserleck und beteiligte Organisationen.
- [ ] `3 · Netz` zeigt Leck-Kontext und MAST_B.

## Browser - Mission 004

- [ ] `1 · Stadt` zeigt Ringstrasse / Gesundheitsquartier.
- [ ] `2 · Einsatz` zeigt die Unfallstelle.
- [ ] `3 · Netz` zeigt Unfallstelle und MAST_C.
- [ ] Kein sichtbarer Text verweist auf W14 oder MAST_B.

## Interaktion

- [ ] Missionswechsel verursacht keine automatische Kamerafahrt.
- [ ] Ein aktives Bookmark wird beim Missionswechsel freigegeben.
- [ ] Klick auf Kamera-Slot bewegt erst danach zur neuen missionsspezifischen Pose.
- [ ] Tastatur 0/1/2/3 nutzt die gleichen missionsspezifischen Posen.
- [ ] Mausrad loest Bookmark und zoomt weiterhin.

## Regression

- [ ] Mission 003 Verkehrsregression PASSED.
- [ ] Mission 004 Verkehrsregression PASSED.
- [ ] Mission 004 -> Mission 002 Startregression PASSED.
- [ ] Netz-/Dashboard-Persistenz PASSED.
