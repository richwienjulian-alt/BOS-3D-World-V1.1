# Mission BOS – Local Test Instructions Build 013M.4

## Ziel
Diese Prüfung schließt die in der Build-Sandbox nicht ausführbare verpflichtende Browser-Sichtabnahme ab.

## Vorbereitung
1. Build entpacken und über denselben lokalen Webserver- oder GitHub-Pages-Weg starten, der auch für interne Präsentationen verwendet wird.
2. Browser-Konsole öffnen.
3. Sicherstellen, dass keine JavaScript-Fehler beim Start auftreten.
4. Mission 004 auswählen, aber noch nicht starten.

## Fünf Pflichtläufe
Mission 004 fünfmal starten. Vor jedem Start die Ringfahrzeuge unterschiedlich lange frei fahren lassen, z. B. ungefähr:
- Lauf 1: sofort
- Lauf 2: nach 5 s
- Lauf 3: nach 15 s
- Lauf 4: nach 30 s
- Lauf 5: nach 45 s

Nach jedem Lauf Mission vollständig abschließen und erst erneut starten, wenn `READY` erreicht wurde.

## Visuelle Kriterien pro Lauf
Alle folgenden Punkte müssen in **jedem** der fünf Läufe erfüllt sein:
- Unfallstelle erscheint regulär.
- Kein `CAR_RING_01 ... 03` fährt durch Unfallfahrzeuge oder sichtbare Incident Exclusion Zone.
- Kein ziviles Ringfahrzeug fährt eine vollständige Ringrunde, um einen Hold zu erreichen.
- Critical-Approach-Fahrzeuge weichen sichtbar seitlich aus bzw. befinden sich beim ersten sichtbaren Incident-Frame bereits geometrisch sicher außerhalb der Exclusion Zone.
- BOS-Anfahrtskorridor ist frei, bevor Feuerwehr/Polizei freigegeben werden.
- Rettungswagen erreicht die Unfallstelle als erstes BOS-Fahrzeug.
- Incident Cell liegt unmittelbar vor dem bestätigten Rettungswagen-Milestone bei 85–89 %.
- Mit bestätigtem Rettungswagen-Milestone steigt die Incident Cell binnen <=0.75 s auf 100 %.
- Blaue Auto-BOS-Priority-Spur erscheint ohne manuelle Aktivierung.
- Feuerwehr fährt danach in die bereits überlastete Incident Cell.
- Polizei fährt danach in die bereits überlastete Incident Cell.
- Mission erreicht `COMPLETED`.
- Nach manueller Finish-Aktion fährt Feuerwehr zuerst zurück.
- Polizei folgt mit sichtbarem sicherem Abstand.
- Keine Kollision, Blockade oder Safety-Stop im Rücklauf.
- Ziviler Ringverkehr wird erst nach sicherer Feuerwehr-/Polizeirückkehr, Szenenräumung und Verlassen der Closure Zone durch den Rettungswagen freigegeben.
- Mission erreicht wieder `READY`; kein Ringfahrzeug bleibt dauerhaft stehen.

## Runtime-Timing aus der echten Browserfahrt prüfen
Nach einem vollständigen Lauf in der Browser-Konsole ausführen:

```js
validateMission004NetworkTimingTrace()
```

Erwartung:
- `status: "PASSED"`
- `preArrivalLoadErrors: 0`
- `overloadTimingErrors: 0`
- `responderEntryErrors: 0`
- `priorityErrors: 0`
- `dynamicCellErrors: 0`

Zusätzlich kann die aufgezeichnete Trace geprüft werden:

```js
MissionBosMission004NetworkTimingTrace
```

## Abschluss
Nur wenn **5/5 Sichtläufe** und `validateMission004NetworkTimingTrace()` PASSED sind, darf Build 013M.4 als Kandidat für die nächste interne Präsentations-/Releaseprüfung bezeichnet werden.
