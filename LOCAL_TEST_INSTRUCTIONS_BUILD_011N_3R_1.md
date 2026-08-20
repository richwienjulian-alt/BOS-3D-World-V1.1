# Local Test Instructions – Build 011N.3R.1

1. Extract the ZIP completely and open `index.html` by double-clicking it.
2. Observe 60 seconds without a mission: fire, police and ambulance must show light-blue links and two packets in each direction; B01 and G02 backhaul must remain visible; no magenta packets or tower priority lane may appear.
3. Start Mission 001. During approach, all BOS paths remain light blue. From `ON_SCENE`, the shared hotspot ramps smoothly into 98–100 percent and regularly reaches 100 percent.
4. Confirm automatic priority: vehicle links and every visible B01 backhaul turn saturated blue and show four fast magenta packets, two in each direction.
5. Continue through `COMMS_STABLE` and `COMPLETED`, start return, and confirm that breathing ends immediately. Below 85 percent plus release delay, blue/magenta returns to light-blue standby while links remain visible.
6. Wait for `READY`, then start Mission 001 again without reloading.
7. Reset, run Mission 002 completely, and verify permanent ambulance/G02 standby, 96–100 percent event load without premature priority, 98–100 percent with the ambulance in the shared cell, and the unchanged hospital handover.
8. Run `M1 → Reset → M2 → Reset → M1` and observe all BOS handovers for stale lines or packets.
9. In the existing right dashboard, verify green/yellow/orange/red rows, matching percentage pills, red overload tint and an additional blue `BOS aktiv` badge.
10. Check the browser console for `MISSION BOS NETWORK RECOVERY 011N.3R.1 VALIDATION` and `STATUS: PASSED`.
