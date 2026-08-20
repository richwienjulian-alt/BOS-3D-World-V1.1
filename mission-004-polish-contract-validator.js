/* Mission BOS - Build 013M.9 compatibility validator for frozen 013M.7 polish contract
   Static validator for the frozen Mission 004 polish contract and frozen plan.
*/
(function () {
  "use strict";
  function finite(v, f) { v = Number(v); return isFinite(v) ? v : f; }
  function copy(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function validate(plan, contract) {
    var r = {
      title: "MISSION BOS MISSION 004 POLISH CONTRACT VALIDATION",
      identityErrors: 0, buttonErrors: 0, groundingErrors: 0, incidentCardErrors: 0,
      returnCorridorErrors: 0, completionErrors: 0, cameraErrors: 0, protectionErrors: 0,
      status: "PASSED", errors: []
    };
    function add(key, message) { r[key] += 1; r.errors.push(message); }
    if (!plan || !contract) {
      add("identityErrors", "Mission 004 plan or polish contract is missing.");
      r.status = "FAILED"; return copy(r);
    }
    if (plan.build !== "013M.9" || contract.build !== "013M.7" ||
        plan.sourceBuildRequired !== "Mission-BOS-Build-013M.8" || contract.sourceBuildRequired !== "Mission-BOS-Build-013M.6" ||
        plan.sourceArchiveSha256Required !== "b2a230e8ed98928538153f1476dd86c29501d7ccd033e9475050154f03fa2409" ||
        contract.sourceArchiveSha256Required !== "15a305fd6ea10cad70e39837ca45dda47240614afe5c4ff89bb849c4a4a3691e") {
      add("identityErrors", "Build/source identity mismatch.");
    }

    var controls = plan.controls || {}, labels = controls.missionButtonLabels || {};
    if (contract.missionButton.readyLabel !== "Mission 004 starten" || labels.READY !== contract.missionButton.readyLabel) {
      add("buttonErrors", "Mission 004 READY CTA is not frozen to 'Mission 004 starten'.");
    }

    var pg = plan.scene && plan.scene.collisionVehicleVisualGrounding || {}, cg = contract.accidentVehicles || {};
    if (finite(pg.preserveRootY, -1) !== finite(cg.rootY, -2) || finite(pg.wheelLocalY, 9) !== finite(cg.wheelLocalY, 8) ||
        finite(pg.wheelRadius, -1) !== finite(cg.wheelRadius, -2) || Math.abs(finite(pg.expectedWheelWorldBottomY, 9)) > 0.001 ||
        pg.preserveXZAndRotation !== true || pg.visualOnlyNoCollisionGeometryChange !== true || cg.preserveCollisionFootprints !== true) {
      add("groundingErrors", "Accident-vehicle road-grounding contract mismatch.");
    }

    var pp = plan.customerPresentation || {}, pc = contract.incidentCard || {};
    if (pp.headerBadgeUsesCompactStatus !== true || pp.fullStatusLabelRemainsDescriptionSource !== true ||
        pp.longStatusMayNotOccupyHeaderPill !== true || pp.titleUsesNormalWordWrapping !== true ||
        !pp.statusBadgeByState || pp.statusBadgeByState.RETURNING !== pc.compactBadgeByState.RETURNING ||
        pp.statusBadgeByState.FAILED !== pc.compactBadgeByState.FAILED) {
      add("incidentCardErrors", "Mission 004 compact incident-card contract mismatch.");
    }

    var pr = plan.response && plan.response.returnCorridorReservation || {}, cr = contract.returnCorridor || {};
    if (pr.vehicleId !== cr.civilianVehicleId || pr.routeId !== cr.civilianRouteId ||
        finite(pr.southApproachHoldDistance, -1) !== finite(cr.southApproachHoldDistance, -2) ||
        finite(pr.northExitHoldDistance, -1) !== finite(cr.northExitHoldDistance, -2) ||
        finite(pr.eastBypassHoldDistance, -1) !== finite(cr.eastBypassHoldDistance, -2) ||
        JSON.stringify(pr.safeHoldDistances || []) !== JSON.stringify(cr.safeHoldDistances || []) ||
        pr.assignmentRule !== cr.assignmentRule || pr.firePoliceReturnRequiresConfirmedYield !== true ||
        pr.firePoliceRemainStationaryUntilConfirmedYield !== true || pr.ambulanceTransportMayStartBeforeReservation !== true ||
        pr.releaseRequiresFirePoliceAtBase !== true || pr.releaseMayNotDisableRuntimeCollisionSafety !== true ||
        pr.visibleTeleportAllowed !== false || finite(pr.maximumWaitSeconds, 99) > finite(cr.maximumReservationWaitSeconds, 8)) {
      add("returnCorridorErrors", "Return-corridor reservation contract mismatch.");
    }

    var seq = plan.sequence || {}, cc = contract.completion || {};
    if (seq.operationalReturnCompletionEndsNetworkMission !== true || seq.readyRequiresBoundedNetworkSettlement !== true ||
        finite(seq.completionSettlementMaximumSeconds, 99) > finite(cc.maximumNetworkSettlementSeconds, 8) ||
        seq.firePoliceReturnWaitsForReturnCorridorReservation !== true || seq.ambulanceTransportStartsImmediatelyOnFinish !== true) {
      add("completionErrors", "Bounded return-completion contract mismatch.");
    }

    var cam = contract.startupCamera || {};
    if (cam.sourceBookmarkId !== "CAM_CITY_OVERVIEW" || finite(cam.position && cam.position.x, 99) !== 0 ||
        finite(cam.position && cam.position.y, 0) !== 40 || finite(cam.position && cam.position.z, 0) !== 50 ||
        finite(cam.target && cam.target.x, 99) !== 0 || finite(cam.target && cam.target.y, 0) !== 1.5 ||
        finite(cam.target && cam.target.z, 99) !== 0 || finite(cam.fov, 0) !== 54 ||
        Math.abs(finite(cam.expectedYaw, 99)) > 1e-9 || Math.abs(finite(cam.expectedPitch, 99) - (-0.6561787179913949)) > 1e-9 ||
        finite(cam.initialFreeCameraHeight, 0) !== 40 || cam.initialAnimationAllowed !== false ||
        cam.automaticBookmarkSelectionAllowed !== false || cam.freeCameraMustRemainAvailable !== true) {
      add("cameraErrors", "Startup-camera contract mismatch.");
    }

    var s = contract.scope || {};
    if (s.preserveCustomerDashboard013M6 !== true || s.preserveMission001 !== true || s.preserveMission002 !== true ||
        s.preserveMission003 !== true || s.preserveNetworkAssociationLoadCapacityPriority !== true || s.noNewExternalDependencies !== true) {
      add("protectionErrors", "Protected Build 013M.6 scope is incomplete.");
    }

    if (r.errors.length) r.status = "FAILED";
    return copy(r);
  }
  function logResult(r) {
    console.group(r.title);
    Object.keys(r).filter(function (k) { return /Errors$/.test(k); }).forEach(function (k) { console.log(k + ": " + r[k]); });
    console[r.status === "PASSED" ? "log" : "error"]("STATUS: " + r.status);
    if (r.errors.length) console.error(r.errors);
    console.groupEnd();
  }
  window.MissionBosMission004PolishContractValidator = { validate: validate, logResult: logResult };
})();
