# Validation Plan – Build 013M.19

## Static
1. Check source archive SHA.
2. Check exact logo asset SHA.
3. Verify new DOM IDs exist.
4. Verify direct touch rotation remains disabled.
5. Verify rotation step is 15°.
6. Verify browser title and visible eyebrow.
7. JS syntax check all changed JS files.

## Runtime camera
1. Open `Kamerasteuerung`.
2. Rotate left once: +15° equivalent to Q direction.
3. Rotate right once: return to original heading.
4. 24 left presses = 360°.
5. Pan/zoom/home after rotation.
6. Enter Demo-Steuerung camera preset, then rotate: presenter bookmark releases, manual camera remains controllable.
7. Verify Q/E and mouse drag remain unchanged.
8. Verify touch pan/pinch/tap remain unchanged.

## Branding visual
1. Desktop dashboard width.
2. Tablet portrait dashboard width.
3. Tablet landscape dashboard width.
4. Confirm exact logo asset, no distortion/recoloring.
5. Confirm T MISSION + Connected Response + LIVE DEMO fit without overlap.

## Regression
Run mission completion and cross-mission checks from Acceptance Checklist.
