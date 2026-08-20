# Lokale Testanleitung – Build 013M.1

1. ZIP vollständig entpacken und `index.html` per Doppelklick öffnen.
2. Konsole prüfen: BOS-Activation-, Mission-004-Foundation- und Combined-Validator müssen `PASSED` melden.
3. Mission 001 vollständig ausführen. Beim erstmaligen Aktivieren der BOS-Priorität prüfen:
   - genau ein kurzer Mastimpuls,
   - genau ein sich ausbreitender blauer Ring,
   - kurzer Hinweis `BOS-SPUR AKTIVIERT`,
   - einmaliger Puls nur in der betroffenen Mastzeile.
4. Während des 98–100-%-Lastatmens prüfen, dass der Effekt nicht erneut ausgelöst wird.
5. Rückfahrt bis unter 85 % und vollständige Freigabe abwarten.
6. Mission 002 und Mission 003 vollständig wiederholen; die gleiche Einmal-Logik prüfen.
7. Mission 001 erneut starten und den erneut korrekt bewaffneten Effekt prüfen.
8. Kontrollieren, dass Verbindungen, Pakete, Handovers, Dashboard-Dauerzustände und Missionsabschlüsse unverändert funktionieren.
9. Mission 004 darf weder im Registry-Dashboard noch als Aktion erscheinen. Die Unfallstelle muss im normalen Betrieb unsichtbar sein.
10. Für eine technische Foundation-Prüfung in der Browserkonsole:

```js
MissionBosMission004FoundationRuntime.setTechnicalTestActive(true)
```

11. Unfallstelle, Objektzahlen und World-Occlusion prüfen. Anschließend vollständig zurücksetzen:

```js
MissionBosMission004FoundationRuntime.reset()
```

12. Prüfen, dass keine Unfallobjekte und keine Straßensperre sichtbar bleiben.
13. Optional Route-/Safety-Berichte abrufen:

```js
MissionBosMission004FoundationRuntime.getRouteReport()
MissionBosMission004FoundationRuntime.getSafetyStatus()
```

Die technische Konsolenaktivierung ist ausschließlich eine Foundation-Prüfung und keine startbare Mission 004.
