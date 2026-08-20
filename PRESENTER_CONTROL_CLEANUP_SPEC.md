# Presenter Control Cleanup Spec – Build 013M.20

## Ziel

Die Präsentationssteuerung soll nur Bedienelemente zeigen, die im Kundentermin tatsächlich sinnvoll verwendet werden.

## Sichtbar zu entfernen

Aus dem geöffneten Bereich `Präsentationssteuerung` werden vollständig entfernt:

- `Nächster Schritt` / phasenabhängige Varianten wie `Rückstellung läuft`
- `Demo zurücksetzen` / Varianten wie `Reset nach Einsatzabschluss`
- kompletter Bereich `NETZ-DEMO`
- `Netzlast simulieren`
- `BOS-Spur aktiv` / `BOS-Spur: automatisch`

Diese Elemente haben für die aktuelle kundenseitige Demo keinen sinnvollen Bedienwert und erzeugen unnötige visuelle Komplexität.

## Sichtbar erhalten

- Modusumschaltung `Freie Erkundung` / `Demo-Steuerung`
- vier Kameratasten `0 · Start`, `1 · Stadt`, `2 · Einsatz`, `3 · Netz`
- missionsspezifischer Hinweistext
- kompakte Status-/Empfehlungszeile

## Funktionsprinzip

Der Missionsstart erfolgt weiterhin über den vorhandenen Hauptbutton bzw. beim bewussten Wechsel in die Demo-Steuerung gemäß bestehender 013M.16/17-Logik. Missionsabschluss, automatische BOS-Priorisierung und Netzlast bleiben Eigentum der bestehenden Missions-/Netzlogik.

## Risikoarme Kompatibilitätsstrategie

Die bestehenden internen DOM-IDs für `presenter-next-button`, `presenter-reset-button`, `overload-button` und `bos-button` dürfen in Build 013M.20 als **hidden compatibility controls** erhalten bleiben, damit keine unnötige Änderung in `app.js` oder `city-presenter-controller.js` erforderlich wird.

Vorgaben:

- `hidden`
- `aria-hidden="true"`
- `tabindex="-1"`
- außerhalb des sichtbaren Presenter-Layouts
- keine sichtbaren Kacheln oder Layoutfläche

Dies ist ausdrücklich eine interne Kompatibilitätsmaßnahme, kein sichtbares Feature.
