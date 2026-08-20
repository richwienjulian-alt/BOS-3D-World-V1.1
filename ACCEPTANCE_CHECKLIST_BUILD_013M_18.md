# Acceptance Checklist - Build 013M.18

Current execution status: **REAL TABLET/BROWSER ACCEPTANCE NOT EXECUTED**

## Touch/Tablet
- [ ] No visible touch mode required
- [ ] Desktop controls fully preserved in real browser
- [ ] One-finger pan works on canvas
- [ ] Pinch-to-zoom works within 36-78 degree FOV
- [ ] Tap selects existing interactive map objects
- [ ] Pan/pinch do not cause accidental selection
- [ ] Dashboard touch scrolls dashboard only
- [ ] No required interaction depends on hover

## Dashboard camera control
- [ ] Closed `Kamerasteuerung` section visible between Technical Details and Presenter
- [ ] Four arrows are at least 44x44 CSS px
- [ ] Zoom - / + works
- [ ] Home/Zentrieren returns to the frozen safe start view
- [ ] No rotation controls
- [ ] Manual control releases active Presenter bookmark

## Einsatzlage
- [ ] All four missions use the same visible structure
- [ ] Mission title position consistent
- [ ] Status pill vocabulary consistent
- [ ] `Aktuelle Phase` used consistently
- [ ] Exactly one clear description sentence
- [ ] No inconsistent mission numbers in pill/phase/description
- [ ] No internal IDs/developer terms in customer field
- [ ] Spacing/typography visually consistent

## Regression
- [ ] Mission 001 complete
- [ ] Mission 002 complete
- [ ] Mission 003 complete
- [ ] Mission 004 complete
- [ ] Mission 004 -> Mission 002 without reload
- [ ] Presenter cameras 001-004 unchanged in real browser
- [ ] Mouse-wheel zoom unchanged in real browser
- [ ] `Netz & Priorisierung` remains visible

Technical/source validators for all corresponding items are PASSED; these unchecked items require real rendered browser/tablet evidence.
