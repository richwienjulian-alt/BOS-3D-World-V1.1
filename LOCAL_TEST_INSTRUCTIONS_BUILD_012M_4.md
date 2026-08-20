# Mission BOS – Build 012M.4 lokale Testanleitung

## Start

1. ZIP vollständig entpacken.
2. `index.html` per Doppelklick öffnen.
3. Browserkonsole öffnen und prüfen, dass die Recovery-Plan- und Runtime-Validierungen `STATUS: PASSED` melden.

## Bereitschaft – mindestens 60 Sekunden

- Feuerwehr, Polizei, Rettungswagen und Stadtwerke bleiben sichtbar mit ihren dynamischen Funkzellen verbunden.
- Jeder Fahrzeugpfad besitzt vier bewegte Pakete, zwei je Richtung.
- Keine Verbindung steht an einer alten Fahrzeugposition.
- Keine Zelle zeigt ohne aktive Mission eine Stadtwerke-Priorität.

## Mission 003 – erster Durchlauf

1. Mission 003 manuell starten.
2. Während der Anfahrt prüfen, dass Feuerwehr-, Polizei- und Stadtwerke-Pfade flüssig mitfahren.
3. Handovers beobachten: Der vorhandene Pfad muss im gleichen Frame auf den neuen Mast-Beacon wechseln; keine alte Linie oder Geisterpakete dürfen verbleiben.
4. An der Einsatzstelle auf die 98–100-Prozent-Sättigung warten.
5. Prüfen, dass Feuerwehr, Polizei und Stadtwerke kräftig blau mit schnellen magentafarbenen Paketen dargestellt werden.
6. Prüfen, dass Feuerwehr und Polizei weiterhin über die dynamischen B01-Backhaul-Pfade verfügen. Für Stadtwerke darf kein erfundener Gebäudebackhaul erscheinen.
7. Mission bis `COMPLETED` laufen lassen und „Einsatz beenden und zurückfahren“ auslösen.
8. Während der Rückfahrt prüfen, dass alle drei Linien und Pakete den Fahrzeugen folgen.
9. Prüfen, dass die Last sichtbar fällt und die aktive Priority unter 85 Prozent nach der vorhandenen Verzögerung freigegeben wird.
10. Die drei Fahrzeugpfade müssen ohne Verschwinden in den hellblauen Standby-Stil wechseln.
11. Warten, bis alle Fahrzeuge an den Basen stehen und Mission 003 wieder `READY` meldet.
12. Mission 003 unmittelbar erneut vollständig ausführen.

## Regression

Anschließend vollständig durchführen:

```text
Mission 001 → READY
Mission 002 → READY
Mission 003 → READY
```

Besonders prüfen:

- Mission-001- und Mission-002-Abläufe unverändert
- Rettungswagenroute und Krankenhaus-Handover unverändert
- Aktivierungs-/Freigabeschwellen weiterhin 90/85 Prozent
- World-Occlusion weiterhin aktiv
- keine doppelten Pfade oder wachsende Objektzahl
- keine aktive BOS-Spur nach vollständiger Rückstellung
