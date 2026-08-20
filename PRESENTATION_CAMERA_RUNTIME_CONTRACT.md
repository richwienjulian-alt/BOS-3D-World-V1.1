# Presentation Camera Runtime Contract - Build 013M.17

## Verbindliches Verhalten

1. Die Praesentationssteuerung besitzt weiterhin exakt vier Kamera-Tasten.
2. Die sichtbaren Kurzlabels bleiben `0 · Start`, `1 · Stadt`, `2 · Einsatz`, `3 · Netz`.
3. Die aktuelle Mission wird ueber den bestehenden Cross-Mission-Presenter-Kontext bestimmt.
4. Jede Kamera-Taste wird gegen das Profil der aktuellen Mission aufgeloest.
5. Wechsel der Mission bewegt die Kamera nicht automatisch.
6. Ein aktives altes Bookmark wird bei Missionswechsel nur freigegeben.
7. Manuelle Eingaben inklusive Mausrad loesen das Bookmark weiterhin wie in Build 013M.16.
8. Die Tastaturkuerzel 0 bis 3 bleiben kompatibel und verwenden ebenfalls das aktuelle Missionsprofil.
9. Tooltips und ARIA-Labels werden dynamisch auf das Missionsprofil aktualisiert.
10. Der Empfehlungsmarker in der Demo-Steuerung wird missions- und zustandsspezifisch gesetzt.

## Verboten

- keine automatische Kamerauebernahme durch Mission State Changes,
- keine automatische Kamerafahrt beim Auswaehlen einer Mission,
- keine Aenderung von Mission State Machines,
- keine Aenderung von Verkehrs-, Response-, Netz- oder BOS-Logik,
- keine neue UI-Komplexitaet mit zusaetzlichen Kamera-Buttons.
