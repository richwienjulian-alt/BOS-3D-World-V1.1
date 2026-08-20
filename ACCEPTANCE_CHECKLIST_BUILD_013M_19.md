# Acceptance Checklist – Build 013M.19

## Source
- [ ] Only `Mission-BOS-Build-013M.18(1).zip` used.
- [ ] Source SHA matches `97147af448390db29d8028a6c0353e37783a1eb71839a4acc0c1ba5224d12cd0`.

## Camera rotation
- [ ] Rotate-left button present.
- [ ] Rotate-right button present.
- [ ] Buttons are touch-friendly (>=44 px).
- [ ] Each tap rotates exactly 15°.
- [ ] Left follows Q direction; right follows E direction.
- [ ] Rotation is smooth via targetYaw/currentYaw.
- [ ] Pitch/FOV/height unchanged by rotate command.
- [ ] Direct touch twist remains disabled.
- [ ] Q/E unchanged.
- [ ] One-finger pan unchanged.
- [ ] Pinch zoom unchanged.
- [ ] Tap selection unchanged.
- [ ] Home unchanged.

## T Mission branding
- [ ] Eyebrow says `T MISSION`.
- [ ] `Connected Response` unchanged.
- [ ] Exact supplied Telekom logo visible.
- [ ] Production logo SHA matches preparation logo SHA.
- [ ] LIVE DEMO unchanged.
- [ ] Header responsive on desktop/tablet.
- [ ] Browser title is `T Mission | Connected Response`.
- [ ] Internal technical Mission BOS identifiers are not renamed.

## Regression
- [ ] Missions 001–004 each complete 3/3.
- [ ] Mission 004 -> Mission 002 works 5/5 without reload.
- [ ] Presenter camera slots work for all four missions.
- [ ] Mouse wheel zoom still works.
- [ ] Dashboard Netz & Priorisierung remains persistent.
