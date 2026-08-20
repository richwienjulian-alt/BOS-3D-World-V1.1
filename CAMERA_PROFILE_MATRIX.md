# Camera Profile Matrix - Build 013M.17

Alle Koordinaten sind Frozen-Referenzwerte fuer die Implementierung und Abnahme.

| Mission | Slot | Kamera (x / y / z) | Ziel (x / y / z) | FOV | Fokus |
|---|---|---|---|---:|---|
| 001 | 0 Start | 0.78 / 9 / 46 | 0.78 / 2.5 / 10 | 56 | Kundenstart |
| 001 | 1 Stadt | 0 / 40 / 50 | 0 / 1.5 / 0 | 54 | Gesamtstadt |
| 001 | 2 Einsatz | -27 / 11 / 46 | -10.68 / 4.8 / 33.9 | 58 | Wohnungsbrand W14 |
| 001 | 3 Netz | 29 / 14 / 30 | 3 / 5.2 / 23 | 61 | Mission 001 + MAST_B |
| 002 | 0 Start | 0.78 / 9 / 46 | 0.78 / 2.5 / 10 | 56 | Kundenstart |
| 002 | 1 Stadt | 51 / 18 / -5 | 38 / 2.5 / -23.5 | 60 | Arena-Quartier |
| 002 | 2 Einsatz | 52 / 10 / -38 | 41.15 / 1.6 / -26.65 | 55 | Patient / Arena |
| 002 | 3 Netz | 47 / 15 / -7 | 33.5 / 6.5 / -20.5 | 66 | Arena + MAST_E |
| 003 | 0 Start | 0.78 / 9 / 46 | 0.78 / 2.5 / 10 | 56 | Kundenstart |
| 003 | 1 Stadt | -30 / 18 / 30 | -7.26 / 2 / 6.36 | 60 | Innenstadt / Leck |
| 003 | 2 Einsatz | -24 / 10 / 18 | -7.26 / 1.8 / 6.36 | 55 | Wasserleck |
| 003 | 3 Netz | 26 / 14 / 2 | 4 / 5 / 10 | 64 | Leck + MAST_B |
| 004 | 0 Start | 0.78 / 9 / 46 | 0.78 / 2.5 / 10 | 56 | Kundenstart |
| 004 | 1 Stadt | 16 / 18 / 52 | 33 / 2 / 36 | 60 | Ringstrasse / Gesundheitsquartier |
| 004 | 2 Einsatz | 18 / 10 / 51 | 31.6 / 1.8 / 40.3 | 55 | Verkehrsunfall |
| 004 | 3 Netz | 52 / 14 / 50 | 40.8 / 6.5 / 37.6 | 66 | Unfall + MAST_C |

## Geometrische Vorpruefung

Alle 16 aufgeloesten Kamera-Slots liegen innerhalb der bestehenden Weltgrenzen. Keine niedrige Kameraposition liegt innerhalb eines Gebaeudes oder Mobilfunkmastes.

Die Netzkameras wurden so gewaehlt, dass Incident und relevante Funkzelle gemeinsam erklaerbar bleiben. Gemessene Winkelabstaende Incident <-> Mast aus Kamerasicht:

- Mission 001: 54.80 Grad
- Mission 002: 60.09 Grad
- Mission 003: 49.34 Grad
- Mission 004: 63.57 Grad
