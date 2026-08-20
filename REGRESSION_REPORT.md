# Mission BOS – Regression Report Build 013M.2

## Automatisierte Regression

- 35/35 bereits in Build 013M.1 geführte Plan-/Strukturvalidatoren erneut PASSED.
- zusätzlich 3/3 Mission-004-Plan-/Extension-Validatoren PASSED.
- Mission-004-Integrationsvalidator PASSED.
- zehn geschützte Dateien einschließlich Mission-001/002/003-Controller byte-identisch zu 013M.1.
- bestehende Mission-002-Rettungswagenmethoden vollständig durchlaufen – PASSED.
- Mission-004-Routenprofil und Wiederherstellung von `MISSION_002_DEFAULT` – PASSED.
- Network Association: 49 Endpunkte, 0 feste Serving Cells – PASSED.
- Cell Capacity: 5 Zellen, 3 BOS, 46 Nicht-BOS – PASSED.
- M4-Zelllast 98–100 % nur `ON_SCENE … COMPLETED`, Ende bei `TRANSPORTING` – PASSED.
- automatische 90/85-Priority unverändert – PASSED.
- Activation Impact: 1 Aktivierungskante → 1 Effekt, 0 Breathing-Retrigger – PASSED.
- Mission-004-Registry 4/4 plus Fail-soft – PASSED.
- Mission 004: 60 vollständige Wiederholungszyklen bis `READY` – PASSED.
- Mission-004-Visuals: 1.200 simulierte Sekunden, Objektzahl 177 → 177 – PASSED.

## Manuell noch zu bestätigen

Die vollständigen gerenderten Missionsreihenfolgen

```text
001 vollständig → 002 vollständig → 003 vollständig → 004 vollständig → 004 erneut → 001 erneut
```

und

```text
001 → 004 → 002 → 003 → 004
```

sowie der kombinierte reale 20-Minuten-Browserlauf sind in der isolierten Umgebung wegen der nicht erreichbaren bestehenden Three.js-CDN-Abhängigkeit nicht produktiv im WebGL-Browser ausgeführt worden. Sie bilden den lokalen finalen Sicht-/Releasecheck.
