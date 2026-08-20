# Dashboard – Kamerasteuerung

## Position
Neuer standardmäßig geschlossener `<details>`-Bereich im rechten Dashboard:

1. Technische Details
2. **Kamerasteuerung**
3. Präsentationssteuerung
4. Primärer Missionsbutton

Die Kamerasteuerung ist eine manuelle Präzisionshilfe und keine zweite Presenter-Steuerung.

## Empfohlenes Layout

```text
Kamerasteuerung

        ↑
    ←   ●   →
        ↓

    −   Zoom   +

    Home / Zentrieren
```

Der Mittelpunkt `●` ist in Version 1 nur visuell/leer; kein zusätzlicher Modusbutton.

## Verhalten
### Pfeiltasten
- kamerarelativ, entsprechend WASD
- Tap: definierter kleiner Schritt (Startkalibrierung 2,0 m)
- optional Hold: kontinuierliche Bewegung nach 300 ms, ohne Browser-Textselektion

### Zoom − / +
- verändert FOV
- Einzelschritt: 4°
- Grenzen weiterhin 36–78°

### Home / Zentrieren
Verwendet die bestehende sichere Kunden-Ausgangsansicht:
- Position 0.78 / 9 / 46
- Ziel 0.78 / 2.5 / 10
- FOV 56

Primärquelle: `MISSION_BOS_INITIAL_CAMERA_CONTRACT_013M8.initialPose`.
Fallback: Presenter-Slot `0 · Start`.

## Presenter-Interaktion
Jeder Kamerasteuerungsbefehl ist eine **manuelle Kamerainteraktion**. Falls ein Presenter-Bookmark aktiv ist, wird dieser vor der Bewegung freigegeben. Der Demo-Modus selbst muss nicht deaktiviert werden.

## Touch Targets
Alle Tasten mindestens 44 × 44 CSS-Pixel, bevorzugt 46–48 px auf Tablet.

## Rotation
Keine Rotationsbuttons im ersten Build. Die Oberfläche bleibt dadurch kompakt und fehlbedienungssicher.
