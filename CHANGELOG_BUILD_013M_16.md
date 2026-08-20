# Mission BOS – Build 013M.16 Changelog

## Scope
Build 013M.16 is based exclusively on Mission-BOS-Build-013M.15 (SHA-256 `a1d3a21a280a8d0d5bbc9e7947926893662820bdcb5c1e24f80233a31e4311ac`). It is limited to five requested safety/UX corrections.

## Production changes
- `city-mission-003-response-plan.js`: adds phase-dependent `VAN_SUPPORT_01` yield reservation using safe holds 4/25/43 m.
- `mission-003-response-validator.js`: validates the additional support-traffic yield contract.
- `city-mission-003-response-controller.js`: requests both M003 civilian yields, blocks dispatch until both are confirmed, releases both only after all M003 responders return.
- `city-mission-004-plan.js`: adds the outbound `CAR_DOWNTOWN_01` reservation using safe holds 4/27/50 m while preserving the existing return corridor.
- `city-mission-004-response-controller.js`: blocks M004 dispatch until the outbound downtown yield is confirmed and releases it after fire/police safely reach the scene; later return reservation remains separate.
- `city-presenter-controller.js`: cross-mission dynamic presenter context, manual READY start when switching to Demo-Steuerung, registry-delegated actions, `MOUSE_WHEEL` bookmark release.
- `app.js`: cross-mission presenter adapter and manual canvas FOV wheel zoom.
- `style.css`: aligns the two dashboard summary typography treatments only.

No route speeds, Mission 001/002 state machines, Mission 003 state machine, Mission 004 state machine/finalization, network algorithms, traffic routes, ambulance route, camera start pose, HTML structure, or dashboard content were changed.
