# Mission BOS – Build 011N.1 Lokale Testanleitung

## 1. Vorbereitung

1. `Mission-BOS-Build-011N.1.zip` vollständig entpacken.
2. Sicherstellen, dass der Rechner Internetzugang für die bestehende Three.js-CDN-Datei besitzt.
3. `index.html` per Doppelklick in einem aktuellen Desktop-Browser öffnen.
4. Browserkonsole öffnen.
5. Prüfen, dass keine rote JavaScript-Fehlermeldung erscheint und die relevanten Validatoren `PASSED` melden.

## 2. Freie Stadtbeobachtung – mindestens fünf Minuten

1. Keine Mission starten.
2. Fünf Minuten lang Stadt, Verkehr und Fußgänger beobachten.
3. Über jedem der fünf Funkmasten muss genau eine Lastanzeige sichtbar sein.
4. Prozentwert und Farbe müssen der jeweiligen lokalen Zelllast folgen.
5. Alle fünf zivilen Fahrzeuge und acht Basispas­santen müssen eine sehr dezente, durchgehende Verbindung zu ihrer dynamisch gewählten Zelle besitzen.
6. Jede zivile Verbindung besitzt genau einen langsam wandernden Datenpunkt.
7. Bei Handovers darf die Linie erst nach bestätigtem Wechsel auf den neuen Mast springen.
8. Es dürfen keine schnellen Hin-und-her-Wechsel, doppelten Linien oder zurückbleibenden Partikel auftreten.

## 3. Mission 001 – drei vollständige Zyklen

Für jeden Zyklus:

1. Mission 001 auswählen und starten.
2. Bis `OVERLOADED` laufen lassen.
3. Keine BOS-Schaltfläche anklicken. Der Button muss deaktiviert und als Statusanzeige erkennbar sein.
4. Die rote Einsatz-Zelle mindestens 30 Sekunden beobachten.
5. Prüfen:
   - Feuerwehr und Polizei sind blau mit der dynamisch gewählten Zelle verbunden.
   - Jede aktive BOS-Verbindung besitzt zwei schnellere blaue Datenpunkte und einen dezenten Glow.
   - Mindestens zwei zivile Endpunkte teilen dieselbe rote Zelle.
   - Der blaue Mittelstreifen erscheint automatisch und wird nach stabiler Überlast aktiv.
   - Mindestens eine zivile Sitzung wird sichtbar langsamer, depriorisiert oder angehalten.
   - Kein Teilnehmer verschwindet und die Prozentlast fällt nicht künstlich ab.
6. Prüfen, dass die Mission automatisch von `OVERLOADED` zu `BOS_ACTIVE` und danach zu `COMMS_STABLE` wechselt.
7. Mission abschließen und kontrollierte Rückfahrt bis `READY` abwarten.
8. Nach Rückkehr dürfen keine Linien oder Partikel doppelt vorhanden sein.

## 4. Mission 002 – drei vollständige Zyklen

Für jeden Zyklus:

1. Mission 002 auswählen und starten.
2. Bis `OVERLOADED` laufen lassen.
3. Die rote Arena-Zelle mindestens 30 Sekunden beobachten.
4. Prüfen:
   - Rettungswagen und mindestens sechs, idealerweise alle zwölf, Arena-Endpunkte teilen dieselbe rote Zelle.
   - der Rettungswagen ist ausschließlich blau verbunden und besitzt zwei schnelle Datenpunkte.
   - alle zwölf Arena-Verbindungen sind durchgehend und besitzen je einen zivilen Datenpunkt.
   - mindestens eine Arena-Sitzung wird sichtbar abgestuft.
   - blaue BOS-Spur aktiviert sich automatisch; keine manuelle Aktion ist erforderlich.
5. Mission über Behandlung, Transport, Krankenhaus und Rückfahrt vollständig bis `READY` abschließen.
6. Nach Reset dürfen Arena-Linien und Partikel nicht sichtbar oder doppelt vorhanden sein.

## 5. Pflichtreihenfolge

Mindestens einmal exakt ausführen:

`Mission 001 → Mission 002 → Mission 001`

Zwischen den Missionen jeweils vollständig bis `READY` und zurückgekehrte Fahrzeuge warten.

## 6. Laststufen gezielt prüfen

Während der Missionsabläufe kontrollieren:

- 0–54 %: Grün
- 55–74 %: Gelb
- 75–89 %: Orange
- 90–100 %: Rot
- ab Rot: blauer Mittelstreifen
- Rot ohne BOS-Endpunkt: blauer Streifen gedimmt
- Rot mit BOS-Endpunkt: kräftig blau und dezent aktiv

## 7. Reset- und Duplikatprüfung

1. Nach jedem vollständigen Zyklus Reset verwenden, soweit der Zustand dies zulässt.
2. Prüfen, dass Prioritätsstatus sofort gelöscht wird.
3. Nacheinander M001, M002 und erneut M001 durchführen.
4. Nach jedem Lauf Anzahl und Erscheinungsbild der Verbindungen vergleichen.
5. Es dürfen keine zusätzlichen Linien, Glow-Linien, Lastanzeigen oder Datenpunkte anwachsen.

## 8. Erwartetes Endergebnis

Der Build ist lokal freigegeben, wenn:

- alle fünf Lastanzeigen vorhanden und korrekt sind,
- BOS ausschließlich blau dargestellt wird,
- zivile Verbindungen durchgehend rot codiert bleiben,
- automatische Priorisierung ohne Klick funktioniert,
- beide Missionen vollständig bis `READY` zurückkehren,
- gemeinsame Zellnutzung sichtbar ist,
- keine Ping-Pong-Handovers, Duplikate oder Reset-Leaks auftreten,
- Stadt, Verkehr, Fußgänger, Fahrzeugrouten, Einsatzorte und Dashboard-Grundstruktur unverändert funktionieren.
