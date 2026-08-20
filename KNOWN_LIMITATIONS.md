# Known Limitations – Build 013M.20

- Real WebGL/browser visual acceptance could not be executed in the build sandbox. Chromium 144.0.7559.96 did not navigate to the local HTTP server although curl returned HTTP 200.
- The twelve mission-specific `Stadt/Einsatz/Netz` compositions therefore still require visual confirmation in the target browser.
- No camera fine-tuning inside the allowed tolerance was performed because the actual WebGL composition could not be inspected here.
- Build 013M.20 must not be called PASSED until the mandatory browser checklist is completed.
