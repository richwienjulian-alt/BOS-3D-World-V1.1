# Mission BOS – Build 013M.1 Foundation- und Routenbericht

## Foundation-Vertrag

Mission 004 bleibt in diesem Build eine ausschließlich technische, standardmäßig unsichtbare Foundation. Es existieren:

- keine State-Machine,
- keine vierte Registry-Zeile,
- keine Startaktion,
- keine Zelllast,
- keine Funkendpunkte,
- keine dauerhafte Straßensperre.

## Unfallstelle Ring Nord

Die additive Szene liegt auf `RING_NORTH` am freigegebenen Zentrum `x=31.60, z=40.30`. Stadt-, Straßen- und Gebäudegeometrie wurden nicht verändert.

| Objektgruppe | Anzahl | Prüfung |
|---|---:|---:|
| Unfallfahrzeuge | 2 | PASSED |
| Patient | 1 | PASSED |
| Einsatzkräfte | 4 | PASSED |
| Zuschauer | 8 | PASSED |
| Leitkegel | 8 | PASSED |
| Barrieren | 2 | PASSED |
| Warndreiecke | 2 | PASSED |
| Trümmer | 6 | PASSED |

## Routen

| Route | Fahrzeug | Länge | Vorwärts | Rückwärts | Oberflächenfehler | Gebäudekollisionen | Teleports |
|---|---|---:|---:|---:|---:|---:|---:|
| `M004_FIRE_STATION_TO_RING_NORTH_ROUTE` | Feuerwehr | 138.464 | PASSED | PASSED | 0 | 0 | 0 |
| `M004_POLICE_STATION_TO_RING_NORTH_ROUTE` | Polizei | 115.246 | PASSED | PASSED | 0 | 0 | 0 |
| `AMBULANCE_STATION_TO_M004_ROUTE` | Rettungswagen | 31.070 | PASSED | PASSED | 0 | 0 | 0 |
| `AMBULANCE_M004_TO_HOSPITAL_ROUTE` | Rettungswagen | 67.814 | PASSED | PASSED | 0 | 0 | 0 |

Die Prüfung sampelte die Routen im Abstand von 0,20 Welteinheiten mit den vorhandenen Footprint- und SAT-Kollisionshelfern. Die Krankenhausroute nutzt am Ziel den bestehenden `HOSPITAL_AMBULANCE_ACCESS`; keine Route und keine Stadtfläche wurde dafür verändert.

## Verkehrsvertrag

Der vorbereitete Vertrag enthält die freigegebene technische Sperrzone auf `OUTER_RING_ONE_WAY`. In 013M.1 wird diese außerhalb einer technischen Foundation-Prüfung nicht aktiviert. Es verbleibt keine Sperre nach `reset()`.

## Fahrzeugschutz

Die Foundation erstellt keine Feuerwehr-, Polizei- oder Rettungswageninstanz. Sie stellt ausschließlich Route-Definitionen für die bestehenden Fahrzeugruntimes bereit.
