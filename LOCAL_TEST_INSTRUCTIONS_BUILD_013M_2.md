# Mission BOS – Build 013M.2 Lokale Testanleitung

## Start

1. ZIP vollständig entpacken.
2. Entweder `index.html` per Doppelklick öffnen oder den Inhalt unverändert über GitHub Pages bereitstellen.
3. Netzwerkzugriff auf die bereits bestehende Three.js-CDN-Abhängigkeit sicherstellen.
4. Browser-Entwicklertools öffnen und die Konsole während des gesamten Tests beobachten.

## 1. Startbild / Registry

Die Missionsauswahl muss exakt enthalten:

```text
001 · Wohnungsbrand
002 · Arena-Notfall
003 · Wasserleitungsleck
004 · Verkehrsunfall
```

Alle vier Zeilen müssen auswählbar sein. Es darf immer nur eine Mission gleichzeitig aktiv sein.

## 2. Mission 004 – vollständiger Lauf

1. `004 · Verkehrsunfall` wählen und starten.
2. Prüfen, dass Ring-Nord-Verkehr kontrolliert anhält und kein Fahrzeug teleportiert.
3. Prüfen, dass exakt die vorhandenen Feuerwehr-, Polizei- und Rettungswagenfahrzeuge ausrücken.
4. Prüfen, dass `ON_SCENE` erst erreicht wird, wenn alle drei Fahrzeuge angekommen sind.
5. Einsatzpositionen visuell kontrollieren: Polizei ungefähr `(24,42)`, Feuerwehr `(26,39.7)`, Rettungswagen `(28,42)`.
6. Acht sichtbare Unfall-Smartphone-Verbindungen prüfen.
7. Prüfen, dass alle drei BOS-Fahrzeugverbindungen der Unified-Runtime den Fahrzeugen framegenau folgen.
8. Prüfen, dass die Fahrzeuge dynamisch dieselbe Einsatzfunkzelle wählen; keine feste Mastzuweisung erzwingen.
9. Last der betroffenen Zelle muss 98–100 % erreichen.
10. BOS-Spur muss automatisch ab der bestehenden 90-%-Schwelle aktiv werden.
11. Activation Impact darf beim Aktivieren genau einmal erscheinen und bei 98–100-%-Schwankungen nicht erneut triggern.
12. Bis `COMPLETED` laufen lassen. Ohne Klick auf Einsatzabschluss darf kein Transport starten.
13. Einsatzabschluss manuell starten.
14. Patient muss beim Beginn von `TRANSPORTING` verschwinden.
15. Unfallstelle muss sich innerhalb ungefähr 1,2 s kontrolliert räumen.
16. Rettungswagen bis Krankenhaus und anschließend automatisch zur Rettungswache verfolgen.
17. Feuerwehr und Polizei müssen zu ihren Wachen zurückkehren.
18. Verkehr muss vollständig freigegeben werden.
19. BOS-Priorisierung muss nach Entlastung unter 85 % zurückfallen.
20. Vor `READY` muss die Zelllast höchstens 55 % betragen.
21. Mission 004 unmittelbar erneut vollständig durchführen.

## 3. Regressionsfolge

Jeweils vollständig bis `READY`, einschließlich vollständigem Reset:

```text
Mission 001 vollständig
→ Mission 002 vollständig
→ Mission 003 vollständig
→ Mission 004 vollständig
→ Mission 004 erneut vollständig
→ Mission 001 erneut vollständig
```

Danach zusätzlich:

```text
001 → 004 → 002 → 003 → 004
```

Nach jedem Lauf prüfen:

- keine Konsolenfehler,
- keine stehen gebliebenen Linien/Pakete,
- keine sichtbare Unfallfoundation,
- keine gesperrten zivilen Fahrzeuge,
- keine aktive BOS-Priorisierung nach vollständiger Entlastung,
- alle benötigten Fahrzeuge wieder an ihren Basen.

## 4. Mission-002-Rettungswagenregression

Besonders prüfen, dass Mission 002 weiterhin unverändert funktioniert:

- Korridorfreigabe,
- Fahrt zur Arena,
- Patiententransport zum Krankenhaus,
- automatische Rückkehr zur Rettungswache,
- anschließender Start von Mission 004 ohne falsches Routenprofil.

Nach Mission 004 anschließend Mission 002 erneut starten und sicherstellen, dass das Standardprofil wieder aktiv ist.

## 5. 20-Minuten-Stabilität

Mindestens 20 Minuten kombiniert Missionen starten, abschließen, zurücksetzen und zwischen den Missionen wechseln. Dabei prüfen:

- keine wachsende Zahl sichtbarer Objekte,
- keine stehen gebliebenen Funklinien oder Datenpakete,
- keine dauerhaft sichtbaren Mission-004-Objekte,
- keine dauerhaft angeforderten Yields,
- keine wiederkehrenden Activation-Impact-Effekte ohne echte neue Aktivierungskante,
- keine Konsolenfehler.

## 6. GitHub-Pages-Check

Nach lokalem Bestehen denselben Build unverändert auf GitHub Pages öffnen und mindestens Mission 004 einmal vollständig bis `READY` testen. Dadurch werden auch Pfade, Script-Reihenfolge und CDN-Ladung im Zielhosting geprüft.
