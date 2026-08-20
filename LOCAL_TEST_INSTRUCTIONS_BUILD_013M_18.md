# Mission BOS - Build 013M.18 Local Acceptance Instructions

Use the exact packaged build. Serve it through a local HTTP server rather than opening `index.html` directly.

## 1. Desktop regression
At 1920x1080 and 1366x768 verify WASD, Q/E, mouse drag, wheel zoom, Presenter 0/1/2/3 and F network inspection. Change selected missions while a Presenter bookmark is active and verify the camera does not automatically fly anywhere.

## 2. Tablet landscape 1024x768
Repeat each at least 10 times:
- one-finger pan, slow and fast;
- pinch in and pinch out;
- pan -> pinch -> pan;
- pointer/finger leaving canvas and cancellation;
- scroll the dashboard by touch and confirm camera remains fixed;
- tap a mast, a BOS vehicle and a civilian target;
- pan and lift, confirming no accidental selection.

## 3. Tablet portrait 820x1180
Repeat the same gesture set. Confirm no horizontal dashboard overflow and all camera buttons remain comfortably touchable.

## 4. Dashboard camera control
Open `Kamerasteuerung`. Check all four arrows 10 times, zoom to both FOV limits, and Home 10 times from different positions. Home must return to x=0.78, y=9, z=46 and FOV 56. With a Presenter bookmark active, each manual camera action must release the bookmark and must not start a mission.

## 5. Einsatzlage
Run every mission through all reachable states. For each state verify the same visible order: mission title + compact status, `Aktuelle Phase`, one clear situation/status sentence, progress. Mission numbers may remain in the mission selector/start button but not in status pill, phase or description.

## 6. Full mission regression
Complete Mission 001, 002, 003 and 004. Then select and start Mission 002 immediately after Mission 004 without reload. `Netz & Priorisierung` must remain visible throughout.

Record results in `ACCEPTANCE_CHECKLIST_BUILD_013M_18.md`. Only after all real checks pass may the build status be changed from `REAL TABLET/BROWSER ACCEPTANCE NOT EXECUTED` to PASSED.
