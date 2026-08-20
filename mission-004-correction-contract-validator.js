/* Mission BOS - Build 013M.4 preparation correction-contract validator. */
(function () {
  "use strict";
  function finite(v, f) { v = Number(v); return isFinite(v) ? v : f; }
  function validate(contract, plan) {
    var r = { title: "MISSION BOS MISSION 004 CORRECTION CONTRACT VALIDATION", dependencyErrors: 0, sourceErrors: 0, trafficErrors: 0, returnErrors: 0, networkErrors: 0, validatorErrors: 0, status: "PASSED", errors: [] };
    function add(k, m) { r[k] += 1; r.errors.push(m); }
    if (!contract || !plan) add("dependencyErrors", "Mission 004 correction contract or plan is unavailable.");
    if (!r.errors.length) {
      if (contract.build !== "013M.4" || contract.sourceBuildRequired !== "Mission-BOS-Build-013M.3" || contract.sourceArchiveSha256Required !== "03388ae6b1fde38a9bb622622afdc7434ba4fb648f3ba2f378c06c48e2bf975b") add("sourceErrors", "Correction contract source identity is invalid.");
      var t = contract.traffic || {}, pt = plan.trafficClosure || {};
      if (t.noVisibleIncidentCrossingRequired !== true || t.continuousSweptFootprintValidationRequired !== true || pt.protectedCorridorMayNotBeClearedThroughIncident !== true || pt.visibleTeleportThroughIncidentAllowed !== false) add("trafficErrors", "No-cross traffic contract is incomplete.");
      var rs = contract.returnSequence || {}, pr = (plan.response || {}).returnSequencing || {};
      if (rs.fireFirstRequired !== true || finite(pr.fireReturnDelaySeconds, -1) !== 0 || finite(pr.policeReturnDelaySeconds, -1) < finite(rs.acceptanceMinimumPoliceDelaySeconds, 1.1)) add("returnErrors", "Return sequencing does not meet the frozen safe-headway contract.");
      var n = contract.network || {}, pn = plan.network || {};
      if (n.incidentCellMustBeDynamic !== true || n.referenceTowerMayNotBeAssigned !== true || finite(pn.ambulanceArrivalOverloadDeadlineSeconds, 99) > finite(n.ambulanceArrivalDeadlineSeconds, 0.75) || pn.ambulanceArrivalRequiredForSaturation !== true || pn.sameCellCompetitionRequiredForInitialOverload !== false) add("networkErrors", "Ambulance-triggered dynamic incident-cell overload contract is incomplete.");
      if ((contract.requiredNewValidators || []).length !== 3) add("validatorErrors", "Three dedicated Build 013M.4 validators are required.");
    }
    if (r.errors.length) r.status = "FAILED";
    return r;
  }
  function logResult(r) { console.group(r.title); Object.keys(r).filter(function (k) { return /Errors$/.test(k); }).forEach(function (k) { console.log(k + ": " + r[k]); }); console[r.status === "PASSED" ? "log" : "error"]("STATUS: " + r.status); if (r.errors.length) console.error(r.errors); console.groupEnd(); }
  window.MissionBosMission004CorrectionContractValidator = { validate: validate, logResult: logResult };
})();
