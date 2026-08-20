# Mission BOS – Build 011N.4 Lokale Testanleitung

## Vorbereitung

1. `Mission-BOS-Build-011N.4.zip` vollständig entpacken.
2. `index.html` per Doppelklick öffnen.
3. Browserkonsole öffnen und prüfen, dass die vorhandenen Validatoren sowie
   - `MISSION BOS 011N.4 MISSION 001 CONNECTIVITY PARITY VALIDATION`
   - `MISSION BOS 011N.4 MISSION 003 STADTWERKE FOUNDATION VALIDATION`
   jeweils `STATUS: PASSED` melden.
4. Prüfen, dass keine rote JavaScript-Fehlermeldung erscheint.

## 1. Standby ohne aktive Mission – mindestens 60 Sekunden

Prüfen:

- Feuerwehr, Polizei und Rettungswagen sind dauerhaft mit ihren dynamischen Funkzellen verbunden.
- Alle drei Fahrzeugpfade sind hellblau und besitzen einen schwachen Glow.
- Je Fahrzeugpfad sind vier hellblaue Pakete sichtbar.
- Zwei Pakete laufen zum Mast, zwei zurück zum Fahrzeug.
- Kein Paket friert ein.
- Keine magentafarbenen Pakete und keine aktive blaue Mastspur erscheinen.
- B01- und G02-Backhaul bleiben sichtbar.
- Nach einem Handover bleibt kein Punkt an der alten Funkzelle zurück.

## 2. Stadtwerke-Fahrzeug

Auf der Parkfläche `B06_READY_AREA` neben B06 prüfen:

- genau ein kompakter Transporter,
- weiße Karosserie,
- blau-türkise Seitenmarkierung,
- `STADTWERKE` auf beiden Fahrzeugseiten,
- vier Räder,
- dunkle Scheiben,
- eine orange Dachwarnleuchte,
- Warnleuchte blinkt nicht,
- keine blaue BOS-Sondersignalanlage,
- Fahrzeug bewegt sich nicht.

Zusätzlich prüfen:

- kein Missionsbutton „Mission 003“,
- keine Stadtwerke-Funklinie,
- keine neue Zelllast durch das Fahrzeug,
- keine Dashboard-Missionskarte,
- Gesamtfahrzeugzahl ist gegenüber Build 011N.3R.1 um genau eins erhöht.

## 3. Mission 001

Mission vollständig durchführen:

```text
READY
→ CALL_RECEIVED
→ CLEARING_CORRIDOR
→ DISPATCHING
→ ENROUTE
→ ON_SCENE
→ OVERLOADED
→ BOS_ACTIVE
→ COMMS_STABLE
→ COMPLETED
→ RETURNING
→ READY
```

Vor der Priorisierung:

- Feuerwehr- und Polizeipfad entsprechen optisch der Rettungswagen-Standby-Verbindung.
- Pakete sind gleich groß wie beim Rettungswagen.
- Vier hellblaue Pakete laufen durchgehend in beide Richtungen.

Bei aktiver Priorisierung:

- Linien werden satt blau.
- Pakete werden Telekom-Magenta und bewegen sich schneller.
- Je Fahrzeugpfad bleiben vier Pakete sichtbar.
- B01-Backhaul besitzt ebenfalls bidirektionale Pakete.
- Nutzen Feuerwehr und Polizei dieselbe Funkzelle, existiert nur ein gemeinsamer B01-Backhaul.

Bei Handover und Rückfahrt:

- Linien- und Paketanker wechseln ohne Geisterpunkte zur bestätigten Serving Cell.
- Unter der bestehenden Freigabegrenze kehren die Pfade zum hellblauen Standby-Stil zurück.
- Mission erreicht `READY`.
- Mission unmittelbar ein zweites Mal starten und vollständig beenden.

## 4. Mission 002 als Referenzregression

Mission 002 vollständig durchführen und prüfen:

- Rettungswagenmodell und Rettungswagenverbindung sind unverändert.
- Arena-Zuschauer und BOS-Spur verhalten sich unverändert.
- Handover zum Gesundheitsmast `MAST_C` bleibt erhalten.
- Keine zusätzliche oder doppelte Rettungswagenlinie entsteht.
- Mission erreicht wieder `READY`.

## 5. Wechseltest

In dieser Reihenfolge testen:

```text
Mission 001 vollständig
→ Reset
→ Mission 002 vollständig
→ Reset
→ Mission 001 vollständig
```

Nach jedem Reset auf doppelte Linien, verbliebene Pakete, aktive Prioritätsreste und blockierte Missionsbuttons prüfen.

## 6. Langzeitprüfung – mindestens 20 Minuten

Während freier Beobachtung und Missionswechseln prüfen:

- keine Paketanimation friert ein,
- keine Linie dupliziert sich,
- keine Geisterpunkte verbleiben,
- sichtbare Objektzahl wächst nicht stetig,
- Stadtwerke-Fahrzeug bleibt exakt am Stellplatz,
- Mission 001 und Mission 002 bleiben startbar,
- keine Console Errors.
