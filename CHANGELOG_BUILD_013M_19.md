# Mission BOS – Build 013M.19 Changelog

## Scope
Small UX/branding pass on the verified Build 013M.18 base.

## Changed production files
- `index.html`
- `style.css`
- `app.js`
- `city-touch-camera-plan.js`
- `city-touch-camera-controller.js`
- `touch-camera-validator.js`
- `city-customer-dashboard-plan.js`
- `customer-dashboard-dom-validator.js`
- `customer-dashboard-contract-validator.js`

## Added asset
- `assets/telekom-logo-current.png`
  - byte-identical to the user-provided Preparation asset
  - SHA-256 `230eb275ac48962b6a555ef886bad448e75741fd34336e8ffe9a80c5b0e62d0d`

## Dashboard camera rotation
- Added `camera-control-rotate-left` and `camera-control-rotate-right` between D-pad and zoom.
- Added `presenterCameraAdapter.rotateYaw(deltaRadians, reason)`.
- Left uses the existing Q direction (`+15°`); right uses the existing E direction (`-15°`).
- Only `targetYaw` changes; pitch, camera height and FOV are untouched.
- Existing targetYaw/currentYaw interpolation provides smooth rotation.
- Direct touch twist remains disabled.
- Existing Q/E, wheel zoom, one-finger pan, pinch zoom, tap selection and Home remain unchanged.

## T Mission branding
- Browser title: `T Mission | Connected Response`.
- Visible dashboard eyebrow: `T MISSION`.
- `Connected Response` and `LIVE DEMO` remain unchanged.
- Added exact supplied Telekom logo in a 36 px desktop / 30 px narrow-tablet frame.
- Technical architecture and internal Mission BOS identifiers remain unchanged.

## Status
Implementation complete and technically validated. Real browser/tablet acceptance was not executable in this environment and remains pending.
