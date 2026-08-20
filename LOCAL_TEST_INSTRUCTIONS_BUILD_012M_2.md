# Mission BOS – Build 012M.2 lokale Endabnahme

1. ZIP vollständig entpacken und `index.html` per Doppelklick öffnen.
2. Konsole öffnen und prüfen, dass Unified-BOS- und Stadtwerke-Beacon-Planvalidator `PASSED` melden.
3. 60 Sekunden ohne Mission beobachten:
   - Feuerwehr, Polizei und Rettungswagen besitzen identische hellblaue Standby-Pfade.
   - je Pfad bewegen sich vier Pakete, zwei in jede Richtung.
   - es gibt keine zweite Rettungswagenlinie und keine Magenta-Pakete.
4. Kamera so positionieren, dass jeweils ein Gebäude zwischen Kamera und Fahrzeug-/Mastpfad liegt:
   - Core, Glow und Pakete müssen hinter der Fassade verschwinden.
   - nach Verlassen der Verdeckung müssen sie wieder sichtbar sein.
   - dieselbe Prüfung für einen B01- und den G02-Pfad durchführen.
5. Mission 001 vollständig bis `READY` durchführen und unmittelbar erneut starten:
   - Feuerwehr und Polizei müssen durchgehend dieselbe Shared-Darstellung verwenden.
   - bei Priorisierung Blau/Magenta, nach Freigabe wieder hellblau.
6. Mission 002 vollständig durchführen:
   - Rettungswagenroute, Arena, Krankenhaus-Handover und BOS-Priorität unverändert.
   - nur die Gebäude-Occlusion ist neu.
7. Mission 003 vollständig durchführen:
   - Feuerwehr und Polizei weiterhin Unified.
   - Stadtwerke-Kommunikation bleibt rot/UTILITY.
   - Amber-Leuchte ab Vorbereitung aktiv, mit ruhigem Halo.
   - nach Rückkehr wieder inaktiv.
8. Wechseltest M1 → Reset → M2 → Reset → M3 → Reset → M1 durchführen.
9. Nach Handovers prüfen, dass keine Linie und kein Paket am vorherigen Mast zurückbleibt.
10. Nach jedem Reset auf doppelte Linien, zusätzliche Pakete oder wachsende Objektzahlen achten.
