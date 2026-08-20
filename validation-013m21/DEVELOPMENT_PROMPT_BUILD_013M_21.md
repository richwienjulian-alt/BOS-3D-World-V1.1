# T Mission – Build 013M.21

## Titel
**Final Header Rename & Version 1.1 Release Candidate**

## Verbindliche Ausgangsbasis

Einzige Implementierungsbasis:

`Mission-BOS-Build-013M.20(1).zip`

SHA-256:

`b07248cb5c88d136fecb844b126181c7e4bb1b26edd88beed7bd7a7b532930e3`

Keine ältere ZIP verwenden und keine Dateien aus älteren Builds einmischen.

## Ziel

Dies ist der letzte, bewusst minimale Präsentations-Pass vor der Freigabe von **Version 1.1**.

Im sichtbaren Header muss ausschließlich die Produktbezeichnung geändert werden:

`Connected Response`

wird zu:

`BOS-Spur-Simulator`

Der Header soll danach sichtbar lauten:

**T MISSION**  
**BOS-Spur-Simulator**

Das vorhandene Telekom-Logo und der Badge **LIVE DEMO** bleiben unverändert.

Zusätzlich wird der Browser-Titel konsistent angepasst auf:

`T Mission | BOS-Spur-Simulator`

## Verbindlicher Produktionsumfang

Es darf ausschließlich folgende bestehende Produktionsdatei geändert werden:

`index.html`

Keine Änderung an:

- JavaScript
- CSS
- Telekom-Logo oder anderen Assets
- Missionen 001–004
- Missionszuständen
- Verkehrslogik
- Fahrzeugen
- Mobilfunkmodell
- BOS-Priorisierung
- Touch-/Tablet-Steuerung
- Dashboard-Kamerasteuerung
- Präsentationskameras
- Präsentationssteuerung
- Einsatzlage
- Mission-004→Mission-002-Recovery

## Exakte Änderung

In `index.html`:

1. `<h1>Connected Response</h1>` ersetzen durch  
   `<h1>BOS-Spur-Simulator</h1>`

2. `<title>T Mission | Connected Response</title>` ersetzen durch  
   `<title>T Mission | BOS-Spur-Simulator</title>`

Keine weiteren sichtbaren Texte ändern.

## Branding-Schutz

Unverändert beibehalten:

- Eyebrow: `T MISSION`
- aktuelles Telekom-Logo: `assets/telekom-logo-current.png`
- `LIVE DEMO`-Badge
- Magenta-Akzentlinie
- bestehende Header-Geometrie, Abstände und Typografie

Das Telekom-Logo darf nicht ersetzt, nachgezeichnet, verändert oder neu exportiert werden.

## Responsive Prüfung

Die neue Bezeichnung muss in den bereits unterstützten Dashboard-Breiten ohne Überlagerung mit Logo oder `LIVE DEMO` funktionieren.

Da `BOS-Spur-Simulator` in der bestehenden Headerbreite voraussichtlich ohne CSS-Anpassung passt, ist **keine CSS-Änderung vorgesehen**.

Falls der reale Browsertest unerwartet einen Overflow zeigt, nicht eigenmächtig das Layout neu gestalten. Den Befund dokumentieren und nur nach ausdrücklicher Freigabe eine minimale Typografieanpassung vornehmen.

## Version 1.1

Nach erfolgreicher Umsetzung und realer Browserabnahme ist dieser Build der technische Kandidat für:

`T Mission – BOS-Spur-Simulator – Version 1.1`

Empfohlenes finales Übergabeartefakt:

`T-Mission-BOS-Spur-Simulator-Version-1.1.zip`

## Pflichtabnahme

Vor Freigabe:

1. Header zeigt `T MISSION`.
2. Haupttitel zeigt exakt `BOS-Spur-Simulator`.
3. Telekom-Logo unverändert sichtbar.
4. `LIVE DEMO` unverändert sichtbar.
5. Kein Überlappen oder Abschneiden im Dashboard-Header.
6. Browser-Titel lautet `T Mission | BOS-Spur-Simulator`.
7. Mission 001 startet.
8. Mission 002 startet.
9. Mission 003 startet.
10. Mission 004 startet und beendet sich vollständig.
11. Direkt nach Mission 004 ist Mission 002 weiterhin startbar.
12. Touch-/Tablet- und Presenter-Steuerung funktionieren unverändert.

Erst danach darf die Fassung als **Version 1.1 präsentationsreif** bezeichnet werden.
