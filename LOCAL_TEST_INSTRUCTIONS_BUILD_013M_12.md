# Mission BOS – Build 013M.12 – Lokale Endabnahme

## A. Fresh Mission 002 – 5 Läufe
Für jeden Lauf:
1. Seite neu laden.
2. Mission 002 auswählen.
3. Prüfen, dass der CTA `Mission 002 starten` sofort aktiv ist.
4. Mission 002 starten.
5. Ergebnis notieren.

Erwartung: **5/5 startbar**.

## B. Mission 004 → Mission 002 – 10 Läufe ohne Reload
Für jeden Lauf:
1. Mission 004 auswählen und vollständig starten.
2. Mission bis `COMPLETED` durchführen.
3. Einsatzabschluss auslösen.
4. Rückläufe vollständig beobachten.
5. Warten, bis Mission 004 sichtbar `Bereit` / READY meldet.
6. **Keinen Reload und keinen Presenter-Reset durchführen.**
7. Mission 002 auswählen.
8. Der CTA muss unmittelbar `Mission 002 starten` anbieten.
9. Mission 002 sofort starten.
10. Sequenz insgesamt zehnmal wiederholen.

Erwartung: **10/10 erfolgreich**; keine zusätzliche Wartezeit nach M004 READY erforderlich.

## C. Bei einem Fehler in der Browserkonsole erfassen
Unmittelbar vor dem M002-Start:
```text
validatedMission004.getState()
validatedAmbulance.getState()
validatedAmbulance.getRouteProfileId()
validatedAmbulance.getSafetyStatus()
validatedMission002.getSharedStartBaselineStatus()
validatedMission002.canStart()
networkManager.validatedMissionResetting
networkLoad
```

Zusätzlich, sofern zugänglich:
```text
validatedMission004Response.getCrossMissionHandoffStatus()
```

Keine Safety per DevTools überschreiben.

## D. Erwarteter Handoff
```text
Mission 004 = READY
Ambulance = AT_STATION
Ambulance Profile = MISSION_002_DEFAULT
Ambulance Safety = PASSED
Fire/Police = AT_STATIONS
Fire/Police Profile = MISSION_001_DEFAULT
Shared Network = startbereit
Mission 002 Shared Baseline = ready:true
```
