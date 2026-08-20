# Lokale Testanleitung – Build 012M.1

## Start

1. ZIP vollständig entpacken.
2. `index.html` per Doppelklick öffnen.
3. Browserkonsole öffnen und prüfen, dass alle Validatoren einschließlich `MISSION BOS MISSION 003 012M.1 RUNTIME INTEGRATION VALIDATION` mit `STATUS: PASSED` enden.
4. Im rechten Dashboard drei kompakte Missionszeilen 001, 002 und 003 prüfen.

## 60 Sekunden Bereitschaft

- Keine Mission starten.
- Feuerwehr, Polizei und Rettungswagen müssen permanent verbunden bleiben.
- `STADTWERKE_01` muss auf B06 stehen und eine rote, langsame Utility-Verbindung besitzen.
- Keine aktive BOS-Spur allein aufgrund des Stadtwerke-Endpunkts.
- Keine doppelten Linien, Geisterpunkte oder wachsende Objektzahl.

## Mission 001

- Mission 001 vollständig bis `READY` durchführen.
- Feuerwehr-/Polizeikommunikation, B01-Backhaul, automatische Priorität, Rückfahrt und Freigabe unverändert prüfen.
- Reset beziehungsweise Bereitschaft abwarten.

## Mission 002

- Mission 002 vollständig bis `READY` durchführen.
- Rettungswagenroute zur Arena, zum Krankenhaus und zurück prüfen.
- Handover zum Gesundheitsmast und G02-Backhaul müssen unverändert funktionieren.
- Reset beziehungsweise Bereitschaft abwarten.

## Mission 003

1. Mission 003 manuell auswählen und starten.
2. Zustände prüfen: `READY → CALL_RECEIVED → ALARMING → CLEARING_CORRIDOR → ENROUTE`.
3. `CAR_DOWNTOWN_01` muss vor Dispatch kontrolliert warten.
4. Stadtwerke, Feuerwehr und Polizei fahren sichtbar auf Straßen; kein Teleport und keine Luftlinie.
5. Am Einsatzort Wasserstrahl, wachsende Wasserfläche, Reparaturfläche, zwei Absperrungen, sechs Leitkegel, vier Einsatzkräfte und sechs Passanten prüfen.
6. Ab `ON_SCENE` muss die dynamisch gemeinsam genutzte Zelle ruhig zwischen 98 und 100 Prozent arbeiten und 100 Prozent erreichen.
7. Feuerwehr und Polizei erhalten automatisch BOS-Priorisierung. Stadtwerke und zivile Geräte bleiben rot und können depriorisiert werden.
8. `WATER_ISOLATED`: Wasserstrahl innerhalb 1,2 Sekunden ausblenden.
9. `REPAIRING` und `COMPLETED`: Wasserstrahl vollständig aus; Wasserfläche darf sichtbar bleiben.
10. `FINISH_AND_RETURN` auslösen.
11. Verkehr darf erst freigegeben werden, wenn alle drei Fahrzeuge wieder an ihren Basen stehen.
12. Stadtwerke muss exakt auf `B06_READY_AREA` stehen; Feuerwehr und Polizei müssen das Mission-001-Defaultprofil wieder verwenden.
13. Last muss sinken, Priorität unter 85 Prozent nach der bestehenden Verzögerung freigegeben werden und Mission 003 zu `READY` zurückkehren.
14. Mission 003 unmittelbar erneut starten und vollständig wiederholen.

## Wechsel- und Langzeittest

- Reihenfolge: Mission 001 → Reset/Bereitschaft → Mission 002 → Reset/Bereitschaft → Mission 003 → Reset/Bereitschaft → Mission 001 → Mission 003.
- Anschließend mindestens 20 Minuten beobachten.
- Prüfen: keine eingefrorenen Pakete, keine stale Linien, keine steigende Objektzahl, keine Konsolenfehler, alle drei Missionen weiterhin startbar.
