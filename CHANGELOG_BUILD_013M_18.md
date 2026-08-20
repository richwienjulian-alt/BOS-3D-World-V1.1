# Mission BOS - Build 013M.18 Changelog

## Scope
Build 013M.18 is an additive UX/input and customer-presentation build based exclusively on Mission-BOS-Build-013M.17 (SHA-256 `ea46e0102b346fa8ca21990da6e090e58a721686d76a948b485ab1c0372e4b92`). Mission state machines, vehicle routes/timing, cellular algorithms, automatic BOS priority and the 013M.17 presenter camera profiles remain protected.

## Touch / Tablet
- Added `city-touch-camera-plan.js`, `touch-camera-validator.js` and `city-touch-camera-controller.js`.
- Touch/pen pointer handling is additive on the WebGL canvas; existing desktop mouse/keyboard handlers are not replaced.
- One finger performs ground-plane pan only.
- Two fingers perform FOV pinch zoom only, clamped to 36-78 degrees.
- Tap uses the existing Network Inspection raycaster and selection state through a new coordinate selection API.
- Added clean pointercancel/lost-pointer-capture handling.
- Manual touch/dashboard camera actions release an active Presenter bookmark without changing guided/demo mode or starting a mission.
- Added the collapsed `Kamerasteuerung` panel between `Technische Details` and `Präsentationssteuerung` with four pan buttons, zoom -/+, and Home/Zentrieren.
- Home uses the frozen 013M.8 customer start camera pose.
- Canvas uses `touch-action: none`; dashboard uses `touch-action: pan-y`.

## Network Inspection UX
- Activated the already existing Network Inspection runtime so both `F` and touch taps use the same inspection pipeline.
- Added coordinate-based selection to the existing inspection controller; no second raycaster or selection state was introduced.
- Added the existing inspection information surface to `Technische Details`.
- Recoverable `fatal:false` cell-load warnings remain usable for inspection; fatal safety still blocks.

## Einsatzlage Presentation
- Added `city-customer-incident-presentation-plan.js` and `customer-incident-presentation-validator.js`.
- `app.js` now renders mission title, summary phase, status badge, stage and one-sentence description from the pure presentation layer when available.
- Missing presentation data falls back to existing runtime labels and cannot fail a mission.
- Frozen copy matrix covers 58 mission/state combinations across Mission 001-004.

## Existing production files changed
- `app.js`
- `index.html`
- `style.css`
- `city-network-inspection-controller.js`
- `city-network-exploration-plan.js`
- `network-exploration-validator.js`
- `city-customer-dashboard-plan.js`
- `customer-dashboard-contract-validator.js`
- `customer-dashboard-dom-validator.js`

All other existing JS/HTML/CSS files are protected against the exact 013M.17 baseline by the Build 013M.18 source-regression gate.
