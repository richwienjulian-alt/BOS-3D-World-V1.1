/* Mission BOS - Build 013M.9 compatibility validator for frozen 013M.7 return-maneuver contract. */
(function () {
  "use strict";
  function finite(v, f) { v = Number(v); return isFinite(v) ? v : f; }
  function validate(contract, plan) {
    var r = { title: "MISSION BOS MISSION 004 RETURN MANEUVER CONTRACT VALIDATION", dependencyErrors: 0, sourceErrors: 0, planErrors: 0, fireErrors: 0, policeErrors: 0, protectionErrors: 0, status: "PASSED", errors: [] };
    function add(k, m) { r[k] += 1; r.errors.push(m); }
    if (!contract || !plan) add("dependencyErrors", "Mission 004 return maneuver contract or plan is unavailable.");
    if (!r.errors.length) {
      if (contract.build !== "013M.7" || contract.sourceBuildRequired !== "Mission-BOS-Build-013M.6" ||
          contract.sourceArchiveSha256Required !== "15a305fd6ea10cad70e39837ca45dda47240614afe5c4ff89bb849c4a4a3691e") {
        add("sourceErrors", "Build 013M.7 return maneuver source identity is invalid.");
      }
      var seq = (plan.response || {}).returnSequencing || {};
      if (plan.build !== "013M.9" || seq.strategy !== "FIRE_BACKOUT_TURN_THEN_POLICE_GATE" || contract.stagePositionsMustRemainUnchangedFrom013M4 !== true) {
        add("planErrors", "Mission 004 plan does not expose the frozen return strategy.");
      }
      var fire = contract.fire || {};
      if (fire.vehicleId !== "RESPONSE_FIRE_01" || finite(fire.backoutDistanceMeters, 0) < 6.0 || finite(fire.backoutSpeedMetersPerSecond, 0) <= 0 ||
          fire.keepOutboundHeadingDuringBackout !== true || fire.turnOnlyAfterBackout !== true || fire.clearanceGateId !== "M004_FIRE_CLEARANCE_TURN_COMPLETE") {
        add("fireErrors", "Fire clearance maneuver is incomplete.");
      }
      var police = contract.police || {};
      if (police.vehicleId !== "RESPONSE_POLICE_01" || finite(police.minimumReturnDelaySeconds, 0) < 4.0 || police.waitForVehicleId !== "RESPONSE_FIRE_01" ||
          police.waitForGateId !== "M004_FIRE_CLEARANCE_TURN_COMPLETE" || police.mayNotRotateBeforeGate !== true) {
        add("policeErrors", "Police release gate is incomplete.");
      }
      var requiredResponseMethods = ((plan.runtimeContract || {}).requiredResponseMethods || []);
      if (requiredResponseMethods.indexOf("getReturnManeuverStatus") < 0) add("planErrors", "Response runtime contract must expose getReturnManeuverStatus for integration validation.");
      var protectedBehavior = contract.protected013M4Behavior || {};
      if (protectedBehavior.trafficNoCrossMustRemainPassed !== true || protectedBehavior.ambulanceTriggeredEarlyOverloadMustRemainPassed !== true ||
          protectedBehavior.dynamicIncidentCellRequired !== true || protectedBehavior.automaticBosPriorityRequired !== true || protectedBehavior.fixedServingTowerAllowed !== false) {
        add("protectionErrors", "Build 013M.4 traffic/network behavior is not fully protected.");
      }
    }
    if (r.errors.length) r.status = "FAILED";
    return r;
  }
  function logResult(r) {
    console.group(r.title);
    Object.keys(r).filter(function (k) { return /Errors$/.test(k); }).forEach(function (k) { console.log(k + ": " + r[k]); });
    console[r.status === "PASSED" ? "log" : "error"]("STATUS: " + r.status);
    if (r.errors.length) console.error(r.errors);
    console.groupEnd();
  }
  window.MissionBosMission004ReturnManeuverContractValidator = { validate: validate, logResult: logResult };
})();
