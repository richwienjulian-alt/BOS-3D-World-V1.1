# Mission BOS – Build 012M.3 lokale Testanleitung

1. ZIP vollständig entpacken und `index.html` per Doppelklick öffnen.
2. 60 Sekunden keine Mission starten.
3. Prüfen, dass Feuerwehr, Polizei, Rettungswagen und Stadtwerke dauerhaft hellblau verbunden sind.
4. Je Fahrzeug vier bewegte Pakete prüfen: zwei Fahrzeug → Mast und zwei Mast → Fahrzeug.
5. Sicherstellen, dass Stadtwerke weder Magenta noch einen Priority-Stil verwendet.
6. Mission 003 starten und alle drei Einsatzfahrzeugpfade während Alarmierung, Anfahrt und Einsatz beobachten.
7. Bei aktiver BOS-Priorisierung prüfen: Feuerwehr und Polizei blau/magenta; Stadtwerke weiterhin hellblau.
8. B01-Pfade für Feuerwehr/Polizei kontrollieren. Es darf keinen erfundenen Stadtwerke-Gebäudebackhaul geben.
9. Mission 003 vollständig bis `READY` beenden und unmittelbar erneut starten.
10. Mission 001 vollständig durchführen, Reset ausführen, danach Mission 002 vollständig durchführen.
11. Bei Handovers prüfen, dass der vorhandene Pfad im selben Frame zum neuen Mast-Beacon springt und keine Linie oder Pakete am alten Mast verbleiben.
12. Mehrere Kamerapositionen mit Gebäuden zwischen Kamera und Pfad wählen: Linien und Pakete müssen hinter Fassaden verschwinden.
13. In der Browserkonsole kontrollieren:

```text
Unified Operational Connectivity Validation: PASSED
Mission 003 Connectivity Parity Plan Validation: PASSED
Mission 003 Connectivity Parity Runtime Validation: PASSED
Mission 003 Integration Validation: PASSED
```

14. Abschließend Reset ausführen und prüfen, dass alle vier permanenten Fahrzeugpfade wieder sichtbar sind.
