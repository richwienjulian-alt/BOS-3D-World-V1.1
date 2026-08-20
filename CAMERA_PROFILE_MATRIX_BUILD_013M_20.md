# Camera Profile Matrix – Build 013M.20

Alle Werte sind verbindliche Referenzwerte für die Implementierung. Die finale Browser-Sichtabnahme bleibt trotzdem Pflicht.

## Gemeinsame Startansicht – alle Missionen

| Taste | Position | Ziel | FOV | Zweck |
|---|---|---|---:|---|
| `0 · Start` | `(0.78, 9.0, 46.0)` | `(0.78, 2.5, 10.0)` | 56 | neutrale niedrige Kundeneinstiegsperspektive |

## Mission 001 – Wohnungsbrand

| Taste | Position | Ziel | FOV | Zweck |
|---|---|---|---:|---|
| `1 · Stadt` | `(-34, 16, 49)` | `(-10.68, 3.2, 33.9)` | 60 | Wohnquartier, Ring Nord und Anfahrtsraum |
| `2 · Einsatz` | `(-25, 10, 47)` | `(-10.68, 4.8, 33.9)` | 54 | W14, Kräfte, Absperrung, Zuschauer |
| `3 · Netz` | `(22, 16, 46)` | `(3, 7, 24)` | 66 | MAST_B und betroffener Wohn-/Innenstadtbereich |

## Mission 002 – Arena-Notfall

| Taste | Position | Ziel | FOV | Zweck |
|---|---|---|---:|---|
| `1 · Stadt` | `(53, 21, 8)` | `(36, 2.5, 3)` | 72 | Arena, Rettungsweg und Gesundheitsquartier in einem zusammenhängenden Stadtbild |
| `2 · Einsatz` | `(50, 9, -41)` | `(41.15, 1.6, -26.65)` | 52 | Patient, Rettungswagen und Arena-Vorplatz |
| `3 · Netz` | `(11, 15, -4)` | `(31, 6, -18)` | 62 | MAST_E und Arena im selben Erklärbild |

**Wichtig für Mission 002:** Die neue Stadtperspektive ist bewusst breiter als die alte. Sie soll nicht nur die Arena isoliert zeigen, sondern den Einsatzraum Arena → Rettungsweg → Gesundheitsquartier verständlich machen.

## Mission 003 – Wasserleitungsleck

| Taste | Position | Ziel | FOV | Zweck |
|---|---|---|---:|---|
| `1 · Stadt` | `(-29, 16, 25)` | `(-7.26, 2, 6.36)` | 60 | Innenstadt, Hauptachse und Stadtwerke-Anfahrt |
| `2 · Einsatz` | `(-21, 9, 16)` | `(-7.26, 1.8, 6.36)` | 52 | Wasserleck, Stadtwerke, Feuerwehr und Polizei |
| `3 · Netz` | `(27, 15, -3)` | `(4, 5, 10)` | 62 | MAST_B und Innenstadt-Einsatzbereich |

## Mission 004 – Verkehrsunfall

| Taste | Position | Ziel | FOV | Zweck |
|---|---|---|---:|---|
| `1 · Stadt` | `(7, 16, 53)` | `(31.6, 2, 40.3)` | 61 | Ring Nord, Unfallbereich und Gesundheitsquartier |
| `2 · Einsatz` | `(18, 9, 52)` | `(31.6, 1.8, 40.3)` | 52 | Unfallfahrzeuge, Patient, Zuschauer und Einsatzkräfte |
| `3 · Netz` | `(53, 16, 53)` | `(43, 7, 38)` | 62 | MAST_C und Unfallbereich im selben Erklärbild |

## Visuelle Abnahme

Für jede Mission sind `Stadt`, `Einsatz` und `Netz` in der echten Browserdarstellung einzeln zu prüfen. Wenn ein statisch gültiger Wert in der WebGL-Sicht durch ein Gebäude ungünstig verdeckt wird, darf der Lead Software Engineer **nur innerhalb ±2 m X/Z, ±1.5 m Y und ±4° FOV** feinjustieren. Jede Feinjustierung ist im Testreport zu dokumentieren und erneut gegen den Geometrievalidator zu prüfen.
