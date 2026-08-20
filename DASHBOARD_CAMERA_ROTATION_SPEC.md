# Dashboard Camera Rotation Spec – Build 013M.19

## Scope
Nur Dashboard-Kamerasteuerung. Keine neue Geste auf dem 3D-Canvas.

## Controls
- `camera-control-rotate-left` → 15° gegen den Uhrzeigersinn / gleiche Drehrichtung wie Q
- `camera-control-rotate-right` → 15° im Uhrzeigersinn / gleiche Drehrichtung wie E

## Placement
Zwischen D-Pad und Zoom-Zeile:

`↶  Drehen  ↷`

## Runtime Contract
`presenterCameraAdapter.rotateYaw(deltaRadians, reason)`

- stoppt laufende Translationsgeschwindigkeit
- löst Presenter-Kamera über bestehenden Manual-Input-Pfad
- verändert `targetYaw`, nicht Pitch/FOV/Höhe
- vorhandenes Lerp übernimmt weiche Drehung
- keine Modusumschaltung

## Frozen values
- step: 15°
- minimum button target: 44 px
- direct touch rotation gesture: disabled
- Q/E keyboard rotation: unchanged
