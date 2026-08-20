# Mission BOS – Build 012M.1 Test Report

## Statische Integrität

- JavaScript: 105/105 Syntaxprüfungen bestanden.
- 104 lokale Scriptreferenzen vorhanden; 0 fehlend; 0 doppelt.
- 65 HTML-IDs; 0 doppelt.
- ES-Module: 0.
- Runtime-`fetch()`: 0.
- feste Serving-Tower-Schlüssel in den neuen Konfigurationen: 0.
- schreibgeschützte Dateien: 9/9 bytegenau.

## Validatoren

29/29 strukturelle Validatoren bestanden: Geometry, Static Props, Traffic, Pedestrians, Response Vehicle, Incident Response, Ambulance, Mission 001, Mission 001 Scene, Arena Event, Mission 002, Cell Load, Network Association, Cell Capacity, Telekom Communication, Handover Visualization, Presenter, Exploration Interface, Network Exploration, Mission Registry, Network Realism, Mission 001 Network Polish, Network Recovery, Mission 001 Connectivity Parity, Stadtwerke Foundation sowie die vier neuen Mission-003-Planvalidatoren.

Der neue Runtime-Integrationsvalidator meldete:

```text
Registry finalized: true
Registered runtimes: 3
Unavailable missions: 0
Mission 001 state: READY
Mission 002 state: READY
Mission 003 state: READY
Network endpoints: 41
Non-BOS endpoints: 38
STATUS: PASSED
```

## Fahrzeug- und Szenenlauf

- reale Feuerwehr-, Polizei- und Stadtwerke-Anfahrt: PASSED.
- reale Rückfahrt aller drei Fahrzeuge: PASSED.
- maximale Strecke je 0,05-s-Frame: Feuerwehr 0,25; Polizei 0,23; Stadtwerke 0,21 Einheiten.
- effektive sichere Dispatchverzögerung: Feuerwehr 0,0 s; Polizei 4,6 s; Stadtwerke gemäß eingefrorenem Plan 1,4 s.
- Verkehrsfreigabe erst nach allen Basen: PASSED.
- Defaultprofil `MISSION_001_DEFAULT` wiederhergestellt: PASSED.
- Szenenzahlen: 4 Einsatzkräfte, 6 Passanten, 2 Absperrungen, 6 Leitkegel, 1 Wasserstrahl, 1 Wasserfläche, 1 Reparaturfläche.
- Wasserstrahl-Ausblendung in `WATER_ISOLATED`: 1,2 s.

## Netzwerklauf

- Association-Manifest: 41 Endpunkte, 3 BOS, 38 Nicht-BOS, 13 zivile Dauerendpunkte, 1 Utility, 6 Mission-003-Endpunkte.
- READY: 17 aktive permanente Endpunkte.
- `ON_SCENE` Mission 003: 23 aktive Endpunkte, davon 6 Mission-003-Smartphones.
- Stadtwerke-Handover im Referenzlauf: `MAST_D → MAST_C` nach realer Positionsänderung.
- Funkbewertungsintervall: unverändert 0,25 s.
- Sättigung: exakt 98–100 %, 100 % erreicht, keine Priority-Drops.
- Aktivierung/Freigabe: unverändert 90 % / 85 %.
- Capacity: 38 Nicht-BOS-Endpunkte; im Referenzlauf 3 sichtbar betroffene Sitzungen; Utility `BEST_EFFORT`.
- `RETURNING`: Sättigung im ersten Update beendet; finale Referenzlast 42 %; Priorität freigegeben.

## Konnektivität

- 60 Sekunden Utility-Standby: 3.600 Frames, Verbindung durchgehend sichtbar, 1.304 unterschiedliche Paketpositionen, 0 BOS-Farbleaks.
- Mission 003: 6 zivile Missionslinien plus 1 Utility-Linie sichtbar.
- 20-Minuten-Renderer-Stabilität: 24.000 Schritte, Objektzahl konstant.
- bestehende permanente BOS-Verbindungen: 3.600/3.600 bewegte Standby-Frames; keine Priority-Leaks.

## Missionsregression

- Mission 001: 4 vollständige Bestandszyklen bestanden.
- Mission 002: 2 vollständige Bestandszyklen bestanden.
- Mission 003: 2 vollständige reale Fahrzeug-/Szenenzyklen und 2 zusätzliche Controller-Sequenzzyklen bestanden.
- Pflichtreihenfolge M1 → M2 → M3 → M1 → M3: PASSED.
- Endzustand: M1 READY, M2 READY, M3 READY.
- Konsolenfehler in den finalen automatisierten Testläufen: 0.

## 20-Minuten-Stabilität

- 1.200 Sekunden, 24.000 Netzwerkschritte und 4.800 Safety-Prüfungen.
- Sättigung 98–100 %, 100 % wiederholt erreicht.
- Priority-Drops: 0.
- Last- und Capacity-Safety: PASSED.
- keine wachsende Renderer-Objektzahl.

## Schutzprüfung

24/24 ausdrücklich geschützte Dateien sind bytegenau unverändert.

## Visuelle Prüfung

Eine erfolgreiche screenshotbasierte WebGL-Browserprüfung wird nicht behauptet. Die lokale Sichtprüfung ist anhand von `LOCAL_TEST_INSTRUCTIONS_BUILD_012M_1.md` durchzuführen.
