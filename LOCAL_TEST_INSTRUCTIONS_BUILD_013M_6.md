# Mission BOS – Lokale Browser-Abnahme Build 013M.6

Diese Prüfung schließt die in der isolierten Build-Umgebung nicht ausführbare reale WebGL-Sichtabnahme ab.

## 1. Build starten
Entpacke `Mission-BOS-Build-013M.6.zip` in einen neuen Ordner. Verwende keine Dateien eines älteren Builds.

Starte die Seite mit der für das Projekt bisher verwendeten lokalen Browser-/GitHub-Pages-Methode. Öffne die Entwicklerkonsole und stelle sicher, dass beim Laden keine JavaScript-Fehler erscheinen.

## 2. Desktop 1920 × 1080
Prüfe ohne Scrollen zunächst den ersten Kundenblick:

- Header `MISSION BOS / Connected Response` und `LIVE DEMO` sichtbar.
- Live Summary zeigt Einsatzphase, Netzlage und höchste Zelllast.
- alle vier Missionen sichtbar und klickbar, solange die Registry READY ist.
- Einsatzlage verständlich und Einsatzfortschritt sichtbar.
- Funkzellen-Auslastung und Network Story sichtbar.
- Haupt-Missionsbutton sichtbar.
- keine horizontale Scrollbar.
- keine Dashboard-Karte überdeckt die 3D-Stadt über die vorgesehene Panelbreite hinaus.
- Magenta = Marke/Auswahl/Aktion; BOS = Blau/Cyan.

## 3. Desktop 1536 × 864
Prüfe:

- Panel ungefähr 410 px breit.
- keine horizontale Scrollbar.
- Missionen und primäre Inhalte bleiben lesbar.
- vertikales Panel-Scrolling funktioniert ruhig.
- Primary Action überdeckt keine Cell-Load-Zeile oder Network Story.

## 4. Desktop 1366 × 768
Prüfe:

- Panel ungefähr 390 px breit.
- keine horizontale Scrollbar.
- alle vier Missionen bleiben klickbar.
- Zelllastzeilen bleiben verständlich und Prozentwerte sauber rechts ausgerichtet.
- vertikales Scrollen erreicht Network Story, Details, Presenter und Missionsbutton.
- keine Sticky-CTA-Überdeckung.

## 5. Technische Details / Presenter
Öffne `Technische Details`:

- Buildreferenz zeigt klein `Build 013M.6`.
- keine sichtbare Referenz `Build 013M.1 · Activation Impact & Mission 004 Foundation`.
- Kommunikationspfad, Serving Cells, Handover, Kapazitätswirkung und Infrastrukturdetails bleiben aktuell.
- lange Mission-004-Fahrzeugtexte umbrechen innerhalb des Panels.

Schließe Technische Details und öffne `Präsentationssteuerung`:

- `Netzlast simulieren` befindet sich hier.
- `BOS-Spur` befindet sich hier und bleibt Status-only/automatisch.
- keine der beiden Funktionen erscheint als zweite primäre Hauptaktion.

## 6. Dynamische Zelllastgeschichte
Beobachte bei normaler Netzlage, steigender Last, Überlastung und BOS-Priorisierung:

- `Höchste Zelllast` folgt immer der tatsächlich höchsten angezeigten Funkzelle.
- keine fest verdrahtete Mast-ID.
- NORMAL: `Netz im Normalbetrieb`.
- HIGH LOAD: `Zivile Nachfrage steigt`.
- OVERLOADED: `Funkzelle ausgelastet`.
- BOS ACTIVE: `BOS-Kommunikation priorisiert`.
- textliche Zustände bleiben auch ohne alleinige Farberkennung verständlich.

## 7. Mission 001 – vollständiger Lauf
- Mission 001 auswählen.
- Mission starten.
- Dashboardzustände beobachten.
- Mission vollständig abschließen/zurücksetzen.
- prüfen, dass Missionsauswahl danach wieder möglich ist.

Erwartung: keine Verhaltensänderung gegenüber 013M.5.

## 8. Mission 002 – vollständiger Lauf
Wie Mission 001 vollständig durchlaufen. Arena-, Ambulance- und Netzzustände dürfen sich durch den Dashboard-Umbau nicht verändert haben.

## 9. Mission 003 – vollständiger Lauf
Mission vollständig starten, ausführen, abschließen und zurücksetzen. Response-/Stadtwerke-/Netzlogik muss unverändert funktionieren.

## 10. Mission 004 – vollständiger Lauf einschließlich Rücklauf
Mission 004 vollständig durchlaufen und insbesondere erneut prüfen:

- zivile Fahrzeuge fahren nicht durch die Unfallstelle;
- Rettungswagen-/Netzüberlastungsstory aus 013M.4 bleibt korrekt;
- automatische BOS-Priorisierung bleibt automatisch;
- Stage-Positionen unverändert;
- beim Abschluss setzt die Feuerwehr zuerst langsam 6.0 m zurück;
- Feuerwehr dreht erst nach dem Backout;
- Polizei wartet auf Fire-Clearance-Gate und Mindestdelay;
- keine sichtbare Kollision/Blockade/Safety-Stop;
- beide Fahrzeuge erreichen ihre Basen;
- ziviler Verkehr wird erst anschließend freigegeben;
- Mission erreicht wieder READY.

## 11. Freigabe
Build 013M.6 erst als `PASSED` / internen Release Candidate behandeln, wenn:

```text
1920x1080 Dashboard: PASSED
1536x864 Dashboard: PASSED
1366x768 Dashboard: PASSED
Mission 001 full browser run: PASSED
Mission 002 full browser run: PASSED
Mission 003 full browser run: PASSED
Mission 004 full browser run: PASSED
Mission 004 return browser acceptance: PASSED
JavaScript console errors: 0
```
