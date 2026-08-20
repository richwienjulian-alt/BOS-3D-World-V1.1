# Baseline Verification – Build 013M.17

## Archividentität
`Mission-BOS-Build-013M.17(1).zip`

SHA-256:
`ea46e0102b346fa8ca21990da6e090e58a721686d76a948b485ab1c0372e4b92`

## Ergebnis der Bestandsprüfung
Die vorhandenen Build-Dokumente melden die statische/technische 013M.17-Validierung als bestanden. Die reale Browser-Abnahme der neuen missionsspezifischen Kameraperspektiven wurde im Build-Bericht selbst als **nicht im Sandbox-Chromium ausgeführt** dokumentiert. Das ist kein Hindernis für diese Konzeptarbeit, muss aber bei einer späteren Release-Abnahme berücksichtigt werden.

## Relevante Architektur-Fakten
- Desktop-Bewegung: WASD
- Desktop-Drehung: Mausziehen sowie Q/E
- Mausrad-Zoom: FOV 36–78°
- Presenter-Kamera: `presenterCameraAdapter` mit `getPose/applyPose/releaseToFree/stopVelocity`
- Netzobjekt-Auswahl: bisher `F` + Raycast aus Bildschirmmitte
- Rechte Seitenleiste: bestehender responsiver Overlay-Modus unter 980 px
- `Einsatzlage`: ein gemeinsames DOM, aber uneinheitliche Datenquellen/Copy in den vier Missionsruntimes

## Baseline-Hashes wichtiger Dateien
- `app.js`: `64bc51c53bb12b43eb33443a48bf61f01c0e5a080c98220b9f66663a58752fe2`
- `index.html`: `b78b4cb0938fc4b083e028717577d64d02d3bda24370a84aba3bd4bba2f58f53`
- `style.css`: `0ec4a37b12f2538345544cf4fd8705f2077b83c178ace17dd45d2c4f7d182cba`
- `city-presenter-plan.js`: `1a84d8813d01839c622502bd42b738833efab04e6d6199bbea14ed95a17688b3`
- `city-presenter-controller.js`: `f10dd2540cd6267418b605eb082ab1de04ee239c3c4ac20cfd6c63c324a0b693`
- `city-network-inspection-controller.js`: `b08fbd5413028f55fed783022aaabb8d4e32ddf9f96d23d150035f6d7f155ebf`
- `city-network-exploration-plan.js`: `b5b0fda9c555657de9e8bb0eff9353b6d9202b76dab4e23b75651a5f23eee783`
- `network-exploration-validator.js`: `38079dfe1b1f5f71aabbc34f692ce1674cc2f3eaef2380d448efe004beb67754`
- `city-customer-dashboard-plan.js`: `6006d4d94472f55b18464d09d690914ad3617744de51db93f343258eae05f52c`
- `customer-dashboard-contract-validator.js`: `77d9376450a685ada6b5952e5d09d8e7f3a71e88e35039273e3d682561f5874b`
- `customer-dashboard-dom-validator.js`: `20db19784cea1d7e71e042c69824026186dc155e96a1fac2a85ee11ba6070d35`
- `city-mission-001-plan.js`: `c3b54c1d81e0ec34c5a95027a419e191a70bc1b0e5a11c872efc814de13a618a`
- `city-mission-001-controller.js`: `96f753267f4fe3bb398faf954103ffd911de104d0ea096422e68464c5ddc9bfc`
- `city-mission-002-plan.js`: `53fb4ea72002871424b170b33425a63bd9fe58cfddaf26fd779fb244b9daa2c8`
- `city-mission-002-controller.js`: `34e2611cb05229919540e9918e89ca0c5b21d24d44e814586644db03c36678ba`
- `city-mission-003-water-leak-plan.js`: `adf8f149c2f6b0fae2142f4dbc8b140f43dac7102464b677716627704637a8f2`
- `city-mission-003-controller.js`: `bd084223be8e8e12288e21df32b8e38fe631dc27c0c64071902e5a94cfa266b3`
- `city-mission-004-plan.js`: `aa1bc0d1d8280eb5a623b329e15414b710870d723df4e5851e4adaa306f46769`
- `city-mission-004-controller.js`: `0d14d100d2be586b3ec37366d04ac6ade7550f70f830e60569dce82d5bad3a94`
- `city-mission-registry-controller.js`: `64a04248b99daf645998f72d265cf3e528295a4e31efe8a447e5c4277c2aaa7a`
- `city-initial-camera-contract.js`: `ac02a6bc7726418433c245ba3756a35ca8492045de6b7f003f50d8126e7b67de`
