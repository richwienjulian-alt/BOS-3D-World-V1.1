/* Mission BOS - Build 013M.9 compatibility validator for frozen 013M.8 ambulance-return contract */
(function () {
  "use strict";
  function finite(v) { v = Number(v); return isFinite(v) ? v : null; }
  function dist(a, b) { return Math.hypot(Number(a.x) - Number(b.x), Number(a.z) - Number(b.z)); }
  function routeLength(points) {
    var total = 0;
    for (var i = 1; i < (points || []).length; i += 1) total += dist(points[i - 1], points[i]);
    return total;
  }
  function sameArray(a, b) { return JSON.stringify(a || []) === JSON.stringify(b || []); }
  function validate(contract, plan) {
    var r = { title: "MISSION BOS 013M.8 AMBULANCE RETURN CONTRACT", dependencyErrors: 0, identityErrors: 0, routeErrors: 0, timingErrors: 0, protectionErrors: 0, status: "PASSED", errors: [] };
    function add(k, m) { r[k] += 1; r.errors.push(m); r.status = "FAILED"; }
    if (!contract || !plan) { add("dependencyErrors", "Contract or Mission 004 plan missing."); return r; }
    if (contract.build !== "013M.8" || plan.build !== "013M.9" || plan.sourceBuildRequired !== "Mission-BOS-Build-013M.8" ||
        plan.sourceArchiveSha256Required !== "b2a230e8ed98928538153f1476dd86c29501d7ccd033e9475050154f03fa2409") add("identityErrors", "Build/source identity mismatch.");
    var response = plan.response || {}, sequence = plan.sequence || {}, route = response.ambulanceReturnRoute || {};
    if (response.ambulanceReturnRouteId !== contract.routeProfile.returnRouteId || route.id !== contract.routeProfile.returnRouteId) add("routeErrors", "Mission-scoped ambulance return route id missing.");
    if (!Array.isArray(route.points) || route.points.length < 2) add("routeErrors", "Full hospital return route definition missing.");
    if (route.points && route.points.length) {
      if (dist(route.points[0], contract.routeProfile.routeStart) > 0.02) add("routeErrors", "Return route start does not match hospital endpoint.");
      if (dist(route.points[route.points.length - 1], contract.routeProfile.routeEnd) > 0.02) add("routeErrors", "Return route end does not match ambulance station.");
      var len = routeLength(route.points);
      if (Math.abs(len - contract.routeProfile.lengthReferenceMeters) > 0.03) add("routeErrors", "Return route length differs from frozen reference: " + len.toFixed(6));
    }
    if (!sameArray(route.allowedSurfaceIds, contract.routeProfile.allowedSurfaceIds)) add("routeErrors", "Return route allowed surfaces changed.");
    if (finite(route.speed) !== contract.routeProfile.speedMetersPerSecond) add("routeErrors", "Return route speed changed.");
    if (route.mustBePreparedInsideMissionRouteProfile !== true || route.mayNotDependOnMission002FoundationController !== true) add("routeErrors", "Mission-owned route-profile requirements missing.");
    if (finite(sequence.hospitalHoldSeconds) !== contract.stateMachine.hospitalHoldSeconds || finite(sequence.ambulanceReturnCommandStateDeadlineSeconds) !== contract.stateMachine.returnCommandStateDeadlineSeconds || finite(sequence.ambulanceReturnMaximumSeconds) !== contract.stateMachine.returnMaximumSeconds || sequence.ambulanceReturnRequiresActualRuntimeState !== true || sequence.ambulanceReturnTraceRequired !== true) add("timingErrors", "Ambulance return timing/runtime requirements changed.");
    var seq = contract.stateMachine.requiredObservedSequence || [];
    if (!sameArray(seq, ["AT_HOSPITAL", "RETURNING", "AT_STATION"])) add("timingErrors", "Required runtime state sequence changed.");
    if (!contract.protectedBehavior || contract.protectedBehavior.fireBackoutDistanceMeters !== 6.0 || contract.protectedBehavior.policeMinimumReleaseDelaySeconds !== 4.0 || contract.protectedBehavior.downtownReturnCorridorMustRemain !== true) add("protectionErrors", "Existing Mission 004 return protection changed.");
    return r;
  }
  function logResult(r) {
    var method = r.status === "PASSED" ? "log" : "error";
    console.group(r.title); Object.keys(r).filter(function(k){return /Errors$/.test(k);}).forEach(function(k){console.log(k + ": " + r[k]);}); console[method]("STATUS: " + r.status); if (r.errors.length) console.error(r.errors); console.groupEnd();
  }
  window.MissionBosMission004AmbulanceReturnContractValidator = { validate: validate, logResult: logResult };
})();
