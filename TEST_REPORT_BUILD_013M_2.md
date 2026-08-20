# Mission BOS – Build 013M.2 Testbericht

## Baseline und Integrität

- Basis-ZIP: `Mission-BOS-Build-013M.1`
- geforderter und gemessener SHA-256: `5e36d6c493a1f9155fd02350d135debeda934e2b6e4d5c78b7d9232b0d79890e` – **PASSED**
- 8/8 Vorbereitungsskripte bytegenau – **PASSED**
- 10/10 ausdrücklich geschützte Dateien unverändert – **PASSED**

## Statische Prüfungen

| Prüfung | Ergebnis |
|---|---:|
| JavaScript-Syntax mit `node --check` | 133/133 PASSED |
| lokale HTML-Skripte | 130 vorhanden, 0 fehlend |
| doppelte HTML-IDs | 0 |
| ES-Module | 0 |
| produktive `fetch()`-Aufrufe | 0 |
| Mission-004-Skripte vor `app.js` | PASSED |

Der Texttreffer `kein fetch()` in `app.js` ist ausschließlich ein Kommentar und kein Funktionsaufruf.

## Plan- und Strukturvalidatoren

**38/38 PASSED.** Damit sind alle 35 Validatoren des Build-013M.1-Regressionssets sowie die drei neuen Mission-004-Plan-/Extension-Validatoren erneut erfolgreich gelaufen:

1. Geometry
2. Static Props
3. Traffic
4. Pedestrians
5. Response Vehicle
6. Incident Response
7. Mission 001
8. Mission 001 Scene
9. Ambulance
10. Network Association
11. Cell Load
12. Cell Capacity
13. Telekom Communication
14. Handover Visualization
15. Presenter
16. Exploration Interface
17. Network Exploration
18. Mission Registry
19. Arena Event
20. Mission 002
21. Network Realism
22. Mission 001 Network Polish
23. Network Recovery
24. Unified Operational Connectivity
25. Stadtwerke Beacon Polish
26. Mission 003 Foundation
27. Mission 003 Response
28. Mission 003 Water Leak
29. Mission 003 Network Extension
30. Mission 003 Registry Extension
31. Mission 003 Connectivity Parity
32. Mission 003 Connectivity Recovery
33. BOS Activation Impact
34. Mission 004 Foundation
35. Build 013M.1 Combined
36. Mission 004 Full Plan
37. Mission 004 Network Extension
38. Mission 004 Registry Extension

Historische Validatoren werden wie im Produkt gegen ihre eingefrorenen Baseline-Snapshots ausgeführt; die live erweiterten 013M.2-Pläne bleiben davon unberührt.

## Mission-004-State-Machine und Wiederholbarkeit

Deterministische Prüfung mit den echten neuen Mission-004-Controllern:

- kompletter Sollzustandsablauf – **PASSED**
- `COMPLETED` bleibt ohne Nutzeraktion stehen – **PASSED**
- manueller Finish-Aufruf startet Transport – **PASSED**
- alle drei Verkehrs-Yields werden angefordert – **PASSED**
- vor Alarmfahrt wird nur auf `CAR_RING_01` gewartet – **PASSED**
- alle Yields vor `READY` freigegeben – **PASSED**
- Feuerwehr/Polizei/Rettungswagen bleiben dieselben persistenten Instanzen – **PASSED**
- Standardprofile nach vollständiger Rückkehr wiederhergestellt – **PASSED**
- Mission-004-Integrationsvalidator – **PASSED**

Zusätzlich: **60 vollständige Mission-004-Zyklen** in einer wiederverwendeten Runtime, insgesamt **1.536 simulierte Sekunden (25,6 Minuten)**. Ergebnis: 60/60 bis `READY`, 180 Yield-Anforderungen und 180 Freigaben, keine Zustands- oder Resetfehler.

## Rettungswagen-Kompatibilität

Mit dem echten `city-ambulance-renderer.js` und den bestehenden Route-/Layout-Helfern:

- Mission-002-Altpfad `startClearingCorridor → dispatchToArena → transportToHospital → returnToStation → reset` – **PASSED**
- Mission-004-Profil `setRouteProfile → dispatchToIncident → transportToHospital → returnToStation → restoreDefaultRouteProfile/reset` – **PASSED**
- Runtime-Safety – **PASSED**
- finales Profil `MISSION_002_DEFAULT` – **PASSED**

Die Mission-004-Routen selbst wurden nicht verändert. Für ihre explizit freigegebenen Terminalzufahrten nutzt die Runtime die vorhandenen Zufahrtsflächen; am eng passierten Mobilfunkmast wird gegen die physisch gerenderten Bodenobjekte statt gegen das größere Karten-Auswahlrechteck geprüft. Die Legacy-Mission-002-Sicherheitsprüfung bleibt unverändert konservativ.

## Szene und Routen

Echte Mission-004-Szenenruntime mit Test-THREE-Harness:

- `READY` vollständig verborgen – **PASSED**
- Unfallobjekte/Patient/Zuschauer ab Missionsbeginn – **PASSED**
- Einsatzkräfte ab `ON_SCENE` – **PASSED**
- Patient ab `TRANSPORTING` verborgen – **PASSED**
- Szenenräumung nach ca. 1,2 s – **PASSED**
- Reset ohne sichtbare Restobjekte – **PASSED**
- 4 vorbereitete Routen, vorwärts/rückwärts 8/8 – **PASSED**
- Gebäude-/Zielkollisionen 0, Teleports 0 – **PASSED**
- kein Feuer/Rauch – vertraglich und strukturell **PASSED**

## Netz, Association, Last, Kapazität

- 49 Netzendpunkte gesamt – **PASSED**
- 3 BOS-Endpunkte – **PASSED**
- 46 Nicht-BOS-Endpunkte einschließlich Utility – **PASSED**
- 8 Mission-004-Unfall-Smartphones – **PASSED**
- feste Serving-Cell-Definitionen – **0 / PASSED**
- kalibrierte Einsatzpositionen wählen mit dem geschützten Radio-Modell dynamisch dieselbe Zelle – **PASSED**
- Mission-004-Sättigung nur bei bestätigter gemeinsamer Association – **PASSED**
- Lastziel während `ON_SCENE … COMPLETED`: 98–100 % – **PASSED**
- Sättigung bei `TRANSPORTING` sofort beendet – **PASSED**
- Capacity-Manifest: 5 Zellen, 3 BOS, 46 Nicht-BOS – **PASSED**

## BOS-Priority und Activation Impact

Mit dem unveränderten echten Auto-Priority-Controller und dem unveränderten Activation-Impact-Renderer:

- Aktivierungsgrenze 90 % – **PASSED**
- Freigabegrenze 85 % – **PASSED**
- Aktivierung ausschließlich bei bestätigtem BOS-Endpunkt in der überlasteten Zelle – **PASSED**
- eine echte `false → true`-Aktivierungskante – **1**
- Activation-Impact-Ereignisse – **1**
- Tower-Indicator-Trigger – **1**
- Retrigger während Lastschwankung oberhalb der Schwelle – **0**
- bestätigte Release-Kante nach Hysterese – **1**

## Mission-004-Connectivity

- zivile Linien – 8/8
- operative/BOS-Fahrzeuglinien – 0/0
- Paketruntime – 8/8
- Manifest/Safety – **PASSED**

Damit bleiben `NET_FIRE_01`, `NET_POLICE_01` und `NET_AMBULANCE_01` ausschließlich Eigentum der unveränderten Unified-BOS-Connectivity-Runtime.

## Vier-Missionen-Registry

Mit dem echten bestehenden Registry-Controller:

```text
001 · Wohnungsbrand
002 · Arena-Notfall
003 · Wasserleitungsleck
004 · Verkehrsunfall
```

- 4/4 Runtimes registrierbar/finalisierbar – **PASSED**
- immer nur eine Mission aktiv – **PASSED**
- Auswahl-/Startfolge `001 → 004 → 002 → 003` im Registry-Harness – **PASSED**
- Mission-004-Fail-soft: 001–003 bleiben registriert/verfügbar – **PASSED**

## 20-Minuten-Stabilität der neuen Visual-Runtimes

Mission-004-Szene und Mission-004-Connectivity wurden über **1.200 simulierte Sekunden / 12.000 Frames** aktualisiert und wiederholt zurückgesetzt:

- Objektzahl initial: 177
- Objektzahl final: 177
- Objektwachstum: 0
- sichtbare Reset-Reste: 0
- Scene Safety: PASSED
- Connectivity Safety: PASSED

## Browser-/WebGL-Abnahmegrenze

Die isolierte Testumgebung kann die bereits in 013M.1 verwendete externe Three.js-CDN-URL nicht auflösen. Deshalb konnte hier **keine vollständige produktive WebGL-Browserfahrt** der geforderten Reihenfolgen `001 → 004 → 002 → 003 → 004` bzw. der Einzelmissionen mit realem Rendering durchgeführt werden.

Diese Einschränkung betrifft die Testumgebung, nicht eine neu eingeführte Produktabhängigkeit. Der Build behält bewusst die bestehende Three.js-Ladung von 013M.1 bei. Die vollständige lokale Browser-/GitHub-Pages-Abnahme, einschließlich des kombinierten 20-Minuten-Sichtlaufs, ist in `LOCAL_TEST_INSTRUCTIONS_BUILD_013M_2.md` beschrieben und bleibt der letzte manuelle Release-Check.
