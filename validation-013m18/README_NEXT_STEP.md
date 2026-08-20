# Mission BOS – Build 013M.18 Preparation

## Zweck
Dieses Paket ist **nur die technische und UX-seitige Vorbereitung** für einen späteren Implementierungsbuild.
Es enthält bewusst **keinen Produktionspatch** und verändert Build 013M.17 nicht.

## Verbindliche Basis
- Archiv: `Mission-BOS-Build-013M.17(1).zip`
- SHA-256: `ea46e0102b346fa8ca21990da6e090e58a721686d76a948b485ab1c0372e4b92`

## Vorbereitete Themen
1. Touch-/Tablet-Steuerung parallel zur bestehenden Desktop-Steuerung
2. Einklappbare Dashboard-`Kamerasteuerung`
3. Touch-Auswahl bereits interaktiver Kartenobjekte
4. Missionsübergreifend einheitliche Customer-Presentation-Layer für `Einsatzlage`
5. Einheitliche Sprache, Statusbegriffe und visuelle Hierarchie für Mission 001–004

## Nächster Schritt
Für die Umsetzung im Lead-Software-Engineer-Chat:
1. Basis-ZIP und diese Preparation-ZIP bereitstellen.
2. `DEVELOPMENT_PROMPT_BUILD_013M_18.md` vollständig als verbindlichen Auftrag verwenden.
3. Die Umsetzung erst nach Prüfung der Specs durchführen.

## Wichtiger Freeze
Missionslogik, Routen, Mobilfunkmodell, BOS-Priorisierung und die missionsspezifischen Presenter-Kameras aus 013M.17 sind nicht Teil dieses UX-Builds.
