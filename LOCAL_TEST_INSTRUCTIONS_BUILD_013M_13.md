# Mission BOS – Local Test Instructions – Build 013M.13

## Start
Den Build über die gleiche lokale/GitHub-Testumgebung öffnen, in der die reale WebGL-Demo normalerweise ausgeführt wird.

## A – Fresh Mission 002
Fünfmal mit frischem Seitenstart:
1. Mission 002 auswählen.
2. Prüfen, dass `Mission 002 starten` verfügbar ist.
3. Mission starten.
4. Keine fatale Safety darf umgangen werden.

Erwartung: 5/5 startbar.

## B – Mission 004 Completion
Zehn vollständige Läufe:
1. Mission 004 starten und vollständig durchführen.
2. Einsatz manuell abschließen.
3. Alle Fahrzeuge bis zur sicheren Rückkehr beobachten.
4. Während des finalen Settlement muss Mission 004 intern weiter in Rückstellung bleiben, ohne Safety-Stop.
5. `Netz & Priorisierung` muss sichtbar bleiben.
6. Prüfen, dass Mission 004 automatisch `READY/Bereit` erreicht.

Erwartung: 10/10 ohne Completion-Settlement-Safety-Stop.

## C – Mission 004 → Mission 002
Direkt nach jedem der zehn Läufe aus B:
1. Sobald Mission 004 `Bereit` zeigt, Mission 002 auswählen.
2. Kein Reload.
3. Kein Presenter-Reset.
4. Keine zusätzliche Wartezeit.
5. Mission 002 sofort starten.

Erwartung: 10/10 erfolgreich.

## D – Diagnose bei Abweichung
In der Browserkonsole auslesen:
```js
window.MissionBosMission004Runtime?.getCompletionSettlementStatus?.()
```

Erwartete Blockerwerte bei noch laufendem Settlement können sein:
- `SHARED_NETWORK_NOT_READY`
- `CELL_LOADS_NOT_BASELINE`
- `BOS_PRIORITY_NOT_RELEASED`
- `RESPONSE_HANDOFF_NOT_READY`
- `MISSION_002_BASELINE_NOT_READY`

Ein Timeout darf nicht nur einen generischen „network settlement“-Text zeigen, sondern muss die tatsächlich noch offenen Blocker nennen.
