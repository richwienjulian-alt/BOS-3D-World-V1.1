# Customer Incident Presentation Layer

## Ziel
Die sichtbare Einsatzlage vereinheitlichen, ohne die vier Missionscontroller oder State Machines zu verändern.

## Neue additive Dateien
- `city-customer-incident-presentation-plan.js`
- `customer-incident-presentation-validator.js`

## Datenmodell
Pro Mission:
- `title`
- `states[stateId].summaryPhase`
- `states[stateId].statusBadge`
- `states[stateId].stage`
- `states[stateId].description`

## App-Integration
`app.js -> updateMissionPanel()` soll für die Customer-Darstellung bevorzugt diese Presentation-Layer verwenden.
Fallback bei fehlendem Mapping:
1. bestehende Runtime-Werte
2. bestehender Missionstitel

Ein fehlender Customer-Copy-Eintrag darf niemals die Mission selbst auf `FAILED` setzen.

## Nicht verändern
- `getState()`
- State-Übergänge
- `getProgress()`
- Missionsstart/-abschluss
- Network State/Profile
- BOS Endpoint IDs
- Fahrzeug-/Verkehrsruntime

## Visuelle Regeln
Das bestehende DOM kann erhalten bleiben. Nur konsistente Abstände/Typografie ergänzen, falls nötig:
- Titel immer gleiche Schriftgröße/Zeilenhöhe
- Statuspill top-aligned
- `Aktuelle Phase` überall gleiche Zeilenhöhe
- Beschreibung immer derselbe Margin/Padding-Stil
- kein zeichenweises Umbrechen langer Titel
