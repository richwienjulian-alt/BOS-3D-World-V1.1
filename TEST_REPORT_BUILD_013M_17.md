# Mission BOS - Build 013M.17 Test Report

## Base verification
- Required base SHA-256: `400dc27e1a7c6f0dc4ea7a815914a88790d7a330cda9b1b0f7e30519a6f8f16b`
- Result: PASSED

## Build 013M.17 camera validation
- Build contract: PASSED
- Mission-specific camera profile validator: PASSED
- Profiles: 4
- Stable base slots: 4
- Resolved camera slots: 16
- Mission camera controller source validator: PASSED
- Mission camera runtime harness: PASSED
- Legacy presenter-plan compatibility: PASSED
- Protected source regression: PASSED (184 protected files)

## Relevant Build 013M.16 regressions
- Cross-mission presenter: PASSED
- Mouse-wheel FOV zoom: PASSED (36..78 degrees, sensitivity 0.025)
- Mission 003 utility/support traffic collision validator: PASSED
  - baseline conflicting phases reproduced: 64
  - safe holds: 4 / 25 / 43 m
  - max wait: 7.764414 s
- Mission 003 support-yield source: PASSED
- Mission 004 downtown outbound collision validator: PASSED
  - baseline conflicting phases reproduced: 92
  - safe holds: 4 / 27 / 50 m
  - max wait: 6.559188 s
  - return corridor preserved: true
- Mission 004 outbound-yield source: PASSED
- Strict response outbound collision validation: PASSED
  - Mission 003 Fire 0.00 s / Police 5.00 s / CLEAR
  - Mission 004 Fire 0.00 s / Police 5.00 s / CLEAR
- Mission 004 -> Mission 002 start regression: PASSED
- Customer network persistence: PASSED
- Arena recoverable warning regression: PASSED

## Source / package integrity before archive
- Existing JS/HTML/CSS production diff: exactly 2 files (`city-presenter-plan.js`, `city-presenter-controller.js`)
- JavaScript syntax: 214/214 PASSED
- Local script references: 154/154 present
- Duplicate DOM IDs: 0

## Browser acceptance
Status: NOT EXECUTED.

A real Chromium/WebGL acceptance was attempted. The local HTTP server returned HTTP 200 to curl, while Chromium issued no request to the loopback server and produced 0 DOM bytes before timeout. The mandatory visual camera-framing acceptance therefore remains open and is not replaced by the runtime harness.
