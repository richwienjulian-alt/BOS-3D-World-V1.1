# Mission BOS - Build 013M.17 Changelog

## Scope
Presenter-camera-only build based exclusively on Mission-BOS-Build-013M.16 SHA-256 `400dc27e1a7c6f0dc4ea7a815914a88790d7a330cda9b1b0f7e30519a6f8f16b`.

## Production changes
Only two existing production files changed:
- `city-presenter-plan.js`
- `city-presenter-controller.js`

## Camera profiles
The four stable camera slots remain `0 Start`, `1 Stadt`, `2 Einsatz`, `3 Netz`. Their visible metadata and camera poses now resolve from the active/selected mission presenter context.

- Mission 001 retains its established city / W14 / MAST_B views.
- Mission 002 uses Arena / patient / MAST_E views.
- Mission 003 uses Innenstadt / water-leak / MAST_B views.
- Mission 004 uses Ringstrasse / accident / MAST_C views.

Mission changes never trigger automatic camera movement. If a bookmark is active, it is released to free camera and the next camera movement requires an explicit user selection.

Mission-specific recommended camera slots are presentation hints only; they do not move the camera automatically.

## Protected behavior
No changes were made to app.js, HTML/CSS, missions, traffic, response runtimes, ambulance, network/Cell Load/Capacity/BOS Priority, mouse-wheel zoom, or the Build 013M.16 demo start/finish logic.
