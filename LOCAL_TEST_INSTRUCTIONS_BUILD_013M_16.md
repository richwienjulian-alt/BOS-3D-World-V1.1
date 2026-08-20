# Local Test Instructions – Build 013M.16

## Automated validators
From the build directory:

```bash
node validators/build-013m16-contract-validator.js build-013m16-contract.js
node validators/mission-003-utility-traffic-collision-validator.js .
node validators/mission-003-support-yield-source-validator.js .
node validators/mission-004-downtown-outbound-collision-validator.js .
node validators/mission-004-outbound-yield-source-validator.js .
node validators/cross-mission-presenter-validator.js .
node validators/dashboard-typography-validator.js .
node validators/mouse-wheel-zoom-validator.js .
node validators/build-013m16-protected-source-regression-validator.js . PROTECTED_SOURCE_HASHES.txt
node response-outbound-collision-validator.js .
node mission-002-post-m004-start-validator.js . ./city-arena-event-controller.js
node customer-network-persistence-validator.js .
```

All commands above must report `PASSED`.

## Real browser acceptance
Use `BROWSER_ACCEPTANCE_EVIDENCE_013M_16.txt` and complete every row in the real browser output.

Key observations:
1. Mission 003: `VAN_SUPPORT_01` visibly yields before the shared utility corridor; Stadtwerke/response vehicles remain collision-free; both civilian yields release after return.
2. Mission 004: green downtown car yields before initial dispatch, is released after fire/police arrive, and is reserved again later by the existing return corridor.
3. Presenter: for each selected READY mission, clicking Free Exploration → Demo Control starts only that selected mission. Intermediate states are observational; COMPLETED permits finish/return.
4. Typography: “Technische Details” and “Präsentationssteuerung” have visibly identical 11px/800/1.2 summary text and 14px plus markers.
5. Wheel zoom: 10 zoom-in and 10 zoom-out inputs; FOV never leaves 36..78; page does not scroll while the pointer is over the 3D canvas; manual wheel input releases any presenter bookmark; WASD/mouse controls continue to work.

Do not mark the build PASSED until all browser rows pass.
