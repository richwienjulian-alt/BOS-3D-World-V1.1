# Mission BOS – Build 013M.10 – Lokale Endabnahme

## Vorbereitung
1. Build lokal oder auf der internen Test-/GitHub-Seite öffnen.
2. Browser-Konsole geöffnet lassen.
3. Sicherstellen, dass keine alte Build-Version aus dem Cache geladen wird.

## Mission 003 – 10 Anfahrten
Für jeden Lauf:
1. Mission 003 auswählen und starten.
2. Feuerwehr muss zuerst starten.
3. Polizei muss sichtbar länger warten und erst ungefähr nach 5 s losfahren.
4. Im gemeinsamen BOS-Boulevard-/Merge-Bereich darf es keine Überlappung, Blockade oder Safety-Halt geben.
5. Feuerwehr und Polizei müssen ihre Einsatzpositionen/HOLDING erreichen.
6. Stadtwerke-Fahrzeug und dessen Timing unverändert beobachten.
7. Mission muss danach normal fortsetzen.

Erwartung: **10/10 PASSED**.

## Mission 004 – 10 Anfahrten
Für jeden Lauf:
1. Mission 004 auswählen und starten.
2. Feuerwehr startet zuerst.
3. Rettungswagen bleibt unter seiner bestehenden Ambulanz-Runtime.
4. Polizei folgt erst nach dem sicher kalibrierten Abstand (~5 s).
5. Kein sichtbarer Kontakt und kein Response-Safety-Halt.
6. Feuerwehr und Polizei erreichen HOLDING; Rettungswagen erreicht die Unfallstelle normal.

Erwartung: **10/10 PASSED**.

## Mission 004 – kompletter Regressionslauf
Mindestens einen der zehn Läufe vollständig fortsetzen:
`Unfallstelle -> COMPLETED -> Krankenhaus -> 2.5-s-Hold -> Rettungswache -> Fire/Police Basen -> Traffic Release -> Network Settlement -> READY`.

Dabei müssen die 013M.9-Ambulanzroute, Downtown-Return-Reservation, Fire-Backout/Police-Gate und die automatische BOS-Priorisierung unverändert funktionieren.

## Freigabe
Erst wenn 10/10 M003, 10/10 M004 und der vollständige M004-Zyklus sichtbar bestanden sind, kann Build 013M.10 als Abnahmekandidat bewertet werden.
