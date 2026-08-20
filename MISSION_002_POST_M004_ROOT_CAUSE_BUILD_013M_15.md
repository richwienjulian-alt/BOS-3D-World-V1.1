# Mission BOS – Build 013M.15
## Root Cause: Mission 002 nach Mission 004 nicht startbar

### Reproduzierter Fehler
Build 013M.14 enthält bereits die richtige direkte Behandlung von recoverable Cell-Load-Warnungen in `city-mission-002-controller.js`. Trotzdem kann Mission 002 nach einem vollständigen Mission-004-Lauf nicht gestartet werden.

Die fehlende Ebene ist `city-arena-event-controller.js`.

Der Arena-Event-Controller läuft auch im Zustand `INACTIVE` weiter und führt alle 0,25 s seinen Safety-Check aus. Dort wird aktuell jede Cell-Load-Safety ungleich `PASSED` als harter Dependency-Fehler behandelt:

- Cell Load kann während dynamischer Association/Handover korrekt `status: FAILED` und gleichzeitig `fatal: false` melden.
- Das ist eine recoverable Warnung und kein struktureller Fehler.
- Der inaktive Arena-Event-Controller behandelt sie in 013M.14 trotzdem als fatal.
- `fail()` setzt den Arena-Runtime dauerhaft auf `FAILED`.
- Dieser Zustand bleibt auch dann bestehen, wenn Mission 004 vollständig beendet und das Netz wieder normal ist.
- Mission 002 prüft vor dem Start die Arena-Event-Safety und blockiert anschließend korrekt, weil diese Runtime bereits vergiftet ist.

Damit erklärt sich das sichtbare Verhalten exakt:

`Mission 002 ausgewählt` + `Mission 002 starten` sichtbar + Button intern disabled.

### Reproduktion gegen 013M.14
Der beigefügte Runtime-Harness injiziert exakt einen nicht-fatalen Cell-Load-Warnzustand:

```text
cellLoadSafety.status = FAILED
cellLoadSafety.fatal = false
```

Ergebnis mit Original-013M.14:

```text
Arena state after warning: FAILED
Arena safety: FAILED
Mission-002 activation allowed: false
```

### Zielverhalten 013M.15
Recoverable Cell-Load-/Association-Warnungen dürfen den inaktiven Arena-Runtime nicht dauerhaft zerstören.

```text
FAILED + fatal:false
=> Warning protokollieren
=> Arena Runtime bleibt verwendbar
=> Mission 002 darf starten

FAILED + fatal:true
=> weiterhin harter Fehler
=> Arena Runtime FAILED
=> Mission 002 bleibt blockiert
```

Die Safety wird nicht abgeschaltet. Nur die bereits im Cell-Load-Controller vorhandene `fatal`-Semantik wird am transitive Consumer korrekt weiterverwendet.
