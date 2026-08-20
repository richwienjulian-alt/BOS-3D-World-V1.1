# Changelog – Mission BOS Build 011N.3R.1

## Baseline and recovery decision

This build was created from a fresh extraction of `Mission-BOS-Build-011N.2(1).zip` with SHA-256 `bd0c768f82eb0cafba7d563bfdd4744e3fae75abdc44858bf0875ed0f8a8b261`.

The rejected Build 011N.3 was not used, copied, patched, merged or inspected as a code source. Build 011N.3R.1 replaces it completely.

## New files

- `city-network-recovery-plan.js` – byte-identical frozen recovery contract from the preparation package.
- `network-recovery-validator.js` – byte-identical structural validator from the preparation package.
- `CHANGELOG_BUILD_011N_3R_1.md` – exact change scope and clean-rebuild statement.
- `TEST_REPORT_BUILD_011N_3R_1.md` – recorded automated checks and limitations.
- `LOCAL_TEST_INSTRUCTIONS_BUILD_011N_3R_1.md` – local visual acceptance sequence.

## Changed files

- `index.html` – loads the frozen recovery plan and validator before `app.js`; updates the visible build label.
- `app.js` – runs fail-soft recovery validation, passes recovery contracts to network runtimes, supplies actual mission context to deterministic saturation, and renders four-stage dashboard severity in the existing panel.
- `style.css` – adds severity point/bar, percentage pill, readable row tint and blue BOS badge without changing dashboard width or adding a panel.
- `city-network-realism-plan.js` – marks all three BOS endpoints always-associated and applies the approved standby/priority packet and civilian visibility values.
- `network-realism-validator.js` – validates the recovered permanent BOS endpoints, four packets per path and approved visual values.
- `city-mission-001-network-polish-plan.js` – documents permanent B01/G02 connectivity and both visual states for all BOS paths.
- `mission-001-network-polish-validator.js` – validates the recovered permanent connectivity and bidirectional packet contract.
- `city-cell-load-controller.js` – derives the active hotspot from confirmed associations, applies deterministic eight-second 98–100/96–100 breathing to actual `currentLoad`, stops breathing in `RETURNING`, and exposes dashboard severity.
- `city-telekom-communication-renderer.js` – permanent fire/police links, four independent bidirectional packets per path, continuous global-render-time animation and cell-local priority styling.
- `city-ambulance-connectivity-renderer.js` – permanent ambulance link with the same continuous standby/priority state machine and four packets.
- `city-bos-backhaul-renderer.js` – permanent deduplicated B01 paths and G02 path, each with four independent bidirectional packets and immediate stale-path cleanup.
- `city-civilian-connectivity-renderer.js` – uses the approved 0.075/0.14/0.18 civilian line opacities.
- `city-arena-event-connectivity-renderer.js` – uses the same approved civilian visibility values for arena endpoints.
- `RELEASE_NOTES.md` – replaces stale 011N.1 release notes with the clean-recovery scope and protected behavior.
- `REGRESSION_REPORT.md` – records the final syntax, validator, mission, handover and stability results.
- `KNOWN_LIMITATIONS.md` – records the unchanged CDN dependency, simulation scope and unavailable sandbox WebGL acceptance.
- `SHA256SUMS.txt` – regenerated for the final 011N.3R.1 archive contents.

No city geometry, building, prop, road, traffic route, pedestrian route, vehicle model, response route, mission scene, mission controller or mission registry structure was changed.
