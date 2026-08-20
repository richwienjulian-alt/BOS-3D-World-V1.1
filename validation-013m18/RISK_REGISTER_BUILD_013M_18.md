# Risk Register – Build 013M.18

| Risiko | Auswirkung | Gegenmaßnahme |
|---|---|---|
| Touch-Pan kollidiert mit Tap-Auswahl | unbeabsichtigte Auswahl | 8-px Drag-Schwelle, Auswahl erst auf `pointerup` |
| Pinch erzeugt Browser-Zoom | Seite springt/zoomt | `touch-action:none` nur auf Canvas |
| Dashboard-Touch bewegt die Stadt | schlechte Tablet-UX | Input ausschließlich an Canvas binden |
| Presenter-Bookmark überschreibt Touch | Kamera springt zurück | jede manuelle Touch-/Button-Eingabe über Presenter-Release routen |
| Desktop-Steuerung regressiert | Präsentationsrisiko | Desktop-Handler nicht refaktorieren; Regressionstests WASD/Maus/Wheel |
| Kamera verlässt Weltgrenzen | leere/fehlerhafte Sicht | bestehende x/z-Clamps wiederverwenden |
| FOV-Zoom wird zu extrem | unbrauchbare Perspektive | bestehende 36–78° Grenzen übernehmen |
| Neuer Kamerabereich überfüllt Sidebar | Scroll-/Layoutproblem | `<details>` standardmäßig geschlossen, 44-px Grid, kein horizontaler Overflow |
| Einsatzlage-Copy beeinflusst State Machine | Missionsregression | reine Presentation-Layer, kein Controller-Umbau |
| Copy-Mapping unvollständig | leere Texte | Validator + Fallback auf Runtime-Texte |
| Missionsnummern tauchen inkonsistent auf | uneinheitliches Kundenbild | Nummern nur in Selector/CTA/Technik, nicht in Statuspill/Phase |
