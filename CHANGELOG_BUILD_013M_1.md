# Mission BOS – Build 013M.1 Changelog

## Basis

- Ausschließliche Implementierungsbasis: `Mission-BOS-Build-012M.4`
- Verifizierte ZIP-SHA-256: `cb03ba4df4f13cd1b3156de7497b77256440fff5420e58c20262670d16eb815f`
- `Mission-BOS-Build-012P.1.zip` wurde weder verwendet noch benötigt.

## Neu – unverändert aus dem Vorbereitungspaket

- `city-bos-activation-impact-plan.js` – schreibgeschützter Vertrag für den einmaligen visuellen Priority-Impuls.
- `bos-activation-impact-validator.js` – schreibgeschützter Planvalidator.
- `city-mission-004-foundation-plan.js` – schreibgeschützter Unfallstellen-, Routen- und Verkehrsvertrag.
- `mission-004-foundation-validator.js` – schreibgeschützter Foundation-Validator.
- `build-013m1-combined-validator.js` – schreibgeschützter kombinierter Buildvertrag.

## Neu – Produktionsruntime

- `city-bos-activation-impact-renderer.js` – erkennt ausschließlich die zelllokale Kante `active:false -> true` und rendert Mastimpuls, einmaligen Weltring sowie den kurzzeitigen Dashboard-Hinweis. Keine Missions-, Netz-, Last-, Kamera- oder Routensteuerung.
- `city-mission-004-scene-renderer.js` – versteckte additive Unfallstellen-Foundation mit zwei Unfallfahrzeugen, Patient, Einsatzkräften, Zuschauern, Absicherung, Trümmern und vier vorbereiteten Routen. Keine Mission-004-Registrierung oder Nutzeraktion.

## Kontrolliert geändert

- `index.html` – Buildbezeichnung 013M.1, neue Plan-/Validator-/Renderer-Skripte vor `app.js`, kurzer eingebetteter Aktivierungshinweis ohne neues Panel.
- `app.js` – getrennte Planvalidierung, fail-soft Initialisierung beider Runtimes, Activation-Update direkt nach dem Priority-Update sowie getrennte Reset-/Dispose-/Diagnosepfade.
- `style.css` – ausschließlich endliche Banner- und Zellzeilen-Pulsanimationen; kein dauerhaftes Blinken und keine Dashboard-Strukturänderung.
- `city-tower-load-indicator-renderer.js` – lokaler Bounce-/Outline-Impuls mit maximal 115 % Skalierung. Lastanzeige, 85-%-Prioritätssegment und Dauerzustände bleiben unverändert.

## Routenkontrolle

Die gefrorenen Routenpunkte wurden nicht verändert. Bei der Krankenhausroute berücksichtigt die technische Footprint-Prüfung zusätzlich den bereits vorhandenen `HOSPITAL_AMBULANCE_ACCESS` als terminale Anschlussfläche, weil der freigegebene Zielpunkt `x=21.55, z=29.70` auf diesem bestehenden Zugang liegt.

## Schutz

Nicht verändert wurden insbesondere Missionen 001–003, Registry, Funkmodell, Association, Handover, Zelllast, Kapazität, Prioritätscontroller, Unified Connectivity, Backhaul, Fahrzeugmodelle, Routen der bestehenden Missionen, Stadtgeometrie, Straßen und Kamera.
