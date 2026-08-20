# Mission BOS – Build 013M.2 Changelog

## Buildidentität

- Titel: **Mission 004 – Vollständige Runtime, Netzintegration und Vier-Missionen-Registry**
- Implementierungsbasis ausschließlich: `Mission-BOS-Build-013M.1`
- verifizierter Basis-SHA-256: `5e36d6c493a1f9155fd02350d135debeda934e2b6e4d5c78b7d9232b0d79890e`

## Neue Produktionsdateien

- `city-mission-004-controller.js` – alleinige Mission-004-State-Machine und fachliche Zustandsübergänge.
- `city-mission-004-response-controller.js` – Verkehrs-Yields, vorhandene Feuerwehr-/Polizei-/Rettungswagenprofile, Anfahrt, Krankenhausfahrt, Rückfahrt und Freigabeprüfung.
- `city-mission-004-connectivity-renderer.js` – ausschließlich die acht zivilen Unfall-Smartphone-Verbindungen; keine BOS-Fahrzeuglinks.

## Geänderte Produktionsdateien

- `app.js` – Mission-004-Initialisierung, Validatoren, Registry-Registrierung/finalisierung, aktiver Runtime-Kontext, Update/Reset/Dispose, Dashboard-/Diagnosedaten und Nutzeraktionen Start/Finish/Reset.
- `index.html` – erforderliche Mission-004-Skripte in abhängigkeitssicherer Reihenfolge vor `app.js` ergänzt.
- `city-mission-004-scene-renderer.js` – verborgene Foundation zu missionszustandsabhängigem Renderer erweitert; Patient/Responder/Szenenräumung und vollständige Lifecycle-API.
- `city-ambulance-renderer.js` – additiv um `setRouteProfile`, `restoreDefaultRouteProfile` und `dispatchToIncident` sowie Mission-004-Hin-/Krankenhaus-/Rückroute erweitert. Alle Mission-002-Methoden bleiben erhalten.
- `city-network-association-controller.js` – acht Mission-004-Endpunkte und dynamische Szenenpositionen in die bestehende Association-Runtime aufgenommen; keine feste Serving Cell.
- `city-civilian-connectivity-controller.js` – Mission-004-Zivilteilnehmer und deren dynamische Lastquelle additiv aufgenommen.
- `city-cell-load-controller.js` – Mission-004-Sättigung auf der real gemeinsam assoziierten Einsatzfunkzelle von `ON_SCENE` bis einschließlich `COMPLETED`; sofortiges Ende bei `TRANSPORTING`.
- `city-cell-capacity-controller.js` – **zwingend erforderliche optionale Änderung**: Mission-004-Zivilendpunkte werden in die zentrale Endpunktmenge aufgenommen, damit die Kapazitätsruntime die geforderten 46 Nicht-BOS-Endpunkte bzw. 49 Netzendpunkte korrekt sieht. Keine Kapazitätspolitik oder BOS-Hysterese wurde geändert.

## Bytegenau übernommene Vorbereitungsvorgaben

Folgende Dateien wurden unverändert aus dem Vorbereitungspaket übernommen:

- `city-mission-004-plan.js`
- `mission-004-validator.js`
- `city-mission-004-network-extension.js`
- `mission-004-network-extension-validator.js`
- `city-mission-004-registry-extension.js`
- `mission-004-registry-extension-validator.js`
- `city-mission-004-integration-contract.js`
- `mission-004-integration-validator.js`

## Geschützte Dateien

Die zehn ausdrücklich geschützten Dateien einschließlich Radio-Modell, Auto-Priority, Unified-BOS-Connectivity, Activation Impact, Mission-001/002/003-Controller und `style.css` sind byte-identisch zu Build 013M.1.

## Mission 004

Implementierter Ablauf:

```text
READY
→ CALL_RECEIVED
→ ALARMING
→ ROAD_CLOSURE
→ ENROUTE
→ ON_SCENE
→ OVERLOADED
→ BOS_ACTIVE
→ COMMS_STABLE
→ EXTRICATION
→ PATIENT_READY
→ COMPLETED
→ TRANSPORTING
→ AT_HOSPITAL
→ RETURNING
→ READY
```

`FAILED` bleibt Fail-safe-Zustand. `COMPLETED → TRANSPORTING` erfolgt ausschließlich über den manuellen Einsatzabschluss.
