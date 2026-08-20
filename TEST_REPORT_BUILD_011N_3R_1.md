# Test Report – Mission BOS Build 011N.3R.1

## Clean baseline

- Implementation baseline: freshly extracted `Mission-BOS-Build-011N.2(3).zip`.
- Baseline SHA-256: `bd0c768f82eb0cafba7d563bfdd4744e3fae75abdc44858bf0875ed0f8a8b261`.
- This checksum exactly matches the 011N.2 baseline recorded by the frozen recovery preparation package.
- No file from rejected Build 011N.3 was copied, patched, merged or used as a source.

## Static integrity

- JavaScript syntax: 87/87 files passed `node --check`.
- Local scripts referenced by `index.html`: complete, no missing or duplicate entries.
- Duplicate HTML IDs: 0.
- ES modules: 0.
- Runtime `fetch()`: 0.
- Fixed Serving Cell assignments in the recovery configuration: 0.
- Frozen recovery plan and validator: byte-identical to the preparation package.
- Direct `file://` execution architecture remains unchanged.

## Validators

All 25 active structural, mission, network and presentation validators passed, including:

- geometry, props, traffic and pedestrians;
- response vehicles, incident response and ambulance;
- Mission 001, Mission 001 scene, Mission 002 and arena event;
- network association, local cell load, capacity, Telekom communication and handover visualization;
- presenter, exploration interface, network exploration and mission registry;
- network realism, Mission-001 network polish, dual-mission recovery and presentation polish;
- new Network Recovery Validator.

The historical release audit already disabled in the 011N.2 baseline remains disabled and was not reintroduced.

## Permanent BOS connectivity and packet animation

- No-mission observation: 60 simulated seconds / 1,200 render frames.
- Fire, police and ambulance remained permanently associated with dynamically selected cells.
- Fire/police B01 backhaul and ambulance G02 backhaul remained present.
- Every BOS path used four independent packet meshes: two in each direction.
- Standby packet movement stalls: 0 on vehicle, ambulance and backhaul paths.
- Standby packet colour: `#B9E6FF`; magenta packet leaks: 0.
- Active-priority packet colour: `#E20074` on all relevant paths.
- After release, all paths returned to light-blue standby without disappearing.
- Stale lines or packets after confirmed handover: 0.

## Association and handover

- Live-position test: 60 seconds / 1,200 frames.
- Frame-position checks for the three BOS vehicles: 3,600; mismatches: 0.
- Radio evaluation interval: unchanged at 0.25 seconds.
- Expected and actual radio-decision calls matched exactly.
- Ping-pong handovers: 0.
- Confirmed route sequences:
  - Fire: `MAST_D → MAST_B → MAST_A`.
  - Police: `MAST_D → MAST_B → MAST_A`.
  - Ambulance: `MAST_B → MAST_E → MAST_B → MAST_C → MAST_B`.
- Ambulance handover to the health cell `MAST_C`: passed.

## Saturation and priority lifecycle

- Mission 001 after ramp: 98–100%, regularly reaching 100%.
- Priority drops during 98–100% breathing: 0.
- `RETURNING` ended saturation on the first update.
- Return load declined to 34%; priority released under 85% after the existing delay.
- Mission 002 event without co-located ambulance: 96–100%, unauthorized priority activations: 0.
- Mission 002 with ambulance in the shared cell: 98–100%, priority drops: 0.
- Activation/release policy remains 90% / 85% with existing 0.6s / 1.5s delays.

## Dashboard severity

Runtime threshold checks passed:

- Normal / green: 48.53%, `#1E9E55`.
- High / yellow: 67.20%, `#D6A400`.
- Very high / orange: 83.07%, `#E67E22`.
- Overloaded / red: 96.13%, `#D63031`.
- A red cell without active priority did not display a BOS-active state.
- The existing dashboard panel renders the blue BOS badge in addition to, not instead of, red overload severity.

## Mission regression

Executed full controller sequences:

- Mission 001: four complete cycles, including one immediate restart without page reload.
- Mission 002: two complete cycles.
- Required switch sequence `M1 → Reset → M2 → Reset → M1`: passed.
- Every Mission-001 cycle reached `COMMS_STABLE`, `COMPLETED`, `RETURNING` and `READY`.
- Every Mission-002 cycle reached treatment, hospital transport, return and `READY`.
- Final state: both missions `READY`, response vehicles at stations, arena inactive, load 38%, priority inactive.
- Mission, load and priority safety states: passed.

## 20-minute stability simulation

- Duration: 1,200 deterministic seconds.
- Steps: 24,000.
- Runtime safety checks: 1,200.
- Standby priority leaks: 0.
- Mission-001 range: 98–100%, 1,532 visible 100% samples, no priority drop.
- Mission-002 event range: 96–100%, 1,314 visible 100% samples, no unauthorized priority.
- Mission-002 BOS range: 98–100%, 1,534 visible 100% samples, no priority drop.
- Both return phases stopped saturation immediately and released priority below 85%.
- Final load: 34%; final priority: inactive; final saturation: inactive.
- Recorded test-console errors: 0.

## Visual browser limitation

A Chromium WebGL screenshot test was attempted. The sandbox Chromium GPU process could not initialize its permitted GL/ANGLE implementation, so no valid visual WebGL browser acceptance is claimed. The final local visual checklist is included in `LOCAL_TEST_INSTRUCTIONS_BUILD_011N_3R_1.md`.
