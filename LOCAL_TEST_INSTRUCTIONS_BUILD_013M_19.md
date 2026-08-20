# Mission BOS – Build 013M.19 Local Acceptance

Serve the unpacked build through the normal local/GitHub environment and use the actual customer browser/tablet setup.

## 1. Branding
1. Fresh-load the page.
2. Confirm browser title `T Mission | Connected Response`.
3. Confirm the dashboard header shows the supplied Telekom logo, `T MISSION`, `Connected Response` and the unchanged `LIVE DEMO` badge.
4. Check desktop, tablet landscape and tablet portrait widths. The logo must remain visible, undistorted and unfiltered; header text must not overlap or wrap awkwardly.

## 2. Dashboard rotation
1. Open `Kamerasteuerung`.
2. Confirm `↶  Drehen  ↷` appears between the D-pad and zoom row.
3. Left once: exactly 15° in the same direction as Q.
4. Right once: exactly 15° in the same direction as E.
5. Perform 24 left taps: one complete 360° turn without drift/error.
6. Perform 24 right taps: one complete 360° turn in the opposite direction.
7. During rotation verify no pitch, height or FOV change.
8. Activate a presenter camera bookmark, then use dashboard rotation. The bookmark must release into manual camera control while Demo/Freie-Erkundung mode itself remains unchanged.
9. Recheck Q/E, mouse drag, wheel zoom, dashboard pan/zoom/Home, one-finger pan, pinch zoom and tap selection.
10. Confirm there is no two-finger twist rotation gesture.

## 3. Mission regression
- Mission 001 start/finish: 3/3.
- Mission 002 start/finish: 3/3.
- Mission 003 start/finish: 3/3.
- Mission 004 start/finish: 3/3.
- Mission 004 -> Mission 002 without reload: 5/5.
- For all four missions verify presenter Stadt/Einsatz/Netz camera slots.
- Confirm `Netz & Priorisierung` remains visible and automatic BOS priority behavior is unchanged.

Only after all checks pass should Build 013M.19 be marked PASSED.
