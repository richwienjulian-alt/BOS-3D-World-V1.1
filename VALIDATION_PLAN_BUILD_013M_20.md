# Validation Plan – Build 013M.20

## Statisch

1. Presenter UI Cleanup Validator
2. Mission Camera Profile 013M.20 Validator
3. bestehender `mission-specific-camera-profile-validator.js`
4. bestehender `legacy-presenter-plan-compatibility-validator.js`
5. bestehender `cross-mission-presenter-validator.js`
6. Protected Source Hash Check
7. JavaScript syntax check
8. Reference patch dry-run + byte match

## Browser-Sichtabnahme

### Presenter UI
- Präsentationssteuerung öffnen
- keine sichtbaren Kacheln `Rückstellung läuft`, `Reset nach Einsatzabschluss`, `Netzlast simulieren`, `BOS-Spur aktiv`
- kein sichtbarer `NETZ-DEMO`-Block
- Modus, Kamera, Hinweis und Status bleiben sichtbar

### Kameras
Für Mission 001–004:
- `0 · Start`
- `1 · Stadt`
- `2 · Einsatz`
- `3 · Netz`

Prüfen:
- Blick ist verständlich und kundentauglich
- kein Gebäude verdeckt das zentrale Motiv unbrauchbar
- `Stadt` erklärt den Mission-Kontext
- `Einsatz` zeigt die relevante Szene
- `Netz` verbindet Mast und Einsatz-/Lastzone
- keine automatische Kamerafahrt
- manuelle Maus-/Touch-/Dashboard-Steuerung bleibt möglich

## Regression

Mindestens ein kompletter Lauf aller vier Missionen nach Kameraänderung. Mission 004 → Mission 002 zusätzlich einmal ohne Reload prüfen.
