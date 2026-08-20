# Mission BOS - Build 013M.17 Local Acceptance

Run the build through the same browser/output path intended for the demonstration.

For each mission 001 through 004:
1. Select the mission.
2. Open Präsentationssteuerung and use Demo-Steuerung.
3. Click `1 · Stadt`, `2 · Einsatz`, and `3 · Netz` manually.
4. Confirm the frame matches `CAMERA_PROFILE_MATRIX.md` and the visible tooltip/ARIA meaning matches the selected mission.
5. While a bookmark is active, change mission. Confirm the camera does not fly to a new pose and returns to free-camera state.
6. Select a new camera slot manually and confirm it now uses the new mission profile.
7. Test keyboard 0/1/2/3.
8. Use the mouse wheel while a bookmark is active. Confirm the bookmark releases and FOV zoom remains within 36..78 degrees.

Special checks:
- M001 Einsatz = Wohnungsbrand; Netz = MAST_B.
- M002 Stadt/Einsatz = Arena; Netz = MAST_E; no W14/wrong MAST_B visible metadata.
- M003 Stadt/Einsatz = Wasserleck; Netz = MAST_B.
- M004 Stadt/Einsatz = Verkehrsunfall; Netz = MAST_C; no W14/wrong MAST_B visible metadata.

Regression:
- Complete Mission 003 and verify the VAN_SUPPORT traffic fix.
- Complete Mission 004 and verify the downtown outbound/return traffic behavior.
- After Mission 004 READY, start Mission 002 without reload.

Record the result in `BROWSER_ACCEPTANCE_EVIDENCE_013M_17.txt`. Only after every browser item passes may Build 013M.17 be marked PASSED.
