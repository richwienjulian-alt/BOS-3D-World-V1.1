# Touch, Responsive & Accessibility

## Touch-Flächen
- Kamera-Buttons mindestens 44 × 44 CSS-Pixel
- ausreichender Abstand zwischen Pfeiltasten
- keine Aktion ausschließlich über Hover
- sichtbarer `:focus-visible`-Zustand für Tastaturbedienung

## Dashboard-Scroll
`#info-panel` muss auf Touch vertikal scrollbar bleiben. Die neue Canvas-Gestenlogik darf keine Events vom Dashboard abfangen.

Empfohlen:
- Canvas: `touch-action: none; overscroll-behavior: contain;`
- Dashboard: `touch-action: pan-y; overscroll-behavior-y: contain;`

## Responsive
Der bestehende Breakpoint unter 980 px bleibt. In diesem Build keine grundlegende Dashboard-Neupositionierung.

Die neue Kamerasteuerung muss funktionieren bei mindestens:
- 1366 × 768 Desktop
- 1180 × 720 bestehende Mindestbreite
- 1024 × 768 Tablet Landscape
- 820 × 1180 Tablet Portrait

Portrait darf Scrollen erfordern; horizontaler Overflow ist nicht zulässig.

## ARIA
Empfohlene Labels:
- `Kamera nach vorne bewegen`
- `Kamera nach hinten bewegen`
- `Kamera nach links bewegen`
- `Kamera nach rechts bewegen`
- `Hineinzoomen`
- `Herauszoomen`
- `Kamera auf Ausgangsansicht zentrieren`
