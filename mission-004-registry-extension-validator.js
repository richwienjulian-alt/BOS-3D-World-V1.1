/* Mission BOS - Build 013M.2 preparation registry-extension validator. */
(function () {
  "use strict";
  function validate(extension) {
    var r = { title: "MISSION BOS FOUR-MISSION REGISTRY VALIDATION", dependencyErrors: 0, definitionErrors: 0, runtimeContractErrors: 0, countErrors: 0, policyErrors: 0, status: "PASSED", errors: [] };
    function add(k, m) { r[k] += 1; r.errors.push(m); }
    if (!extension || !extension.extendedPlan) add("dependencyErrors", "Mission 004 registry extension is unavailable.");
    if (!r.errors.length) {
      var plan = extension.extendedPlan, missions = plan.missions || [], ids = missions.map(function (m) { return m.id; }), contract = plan.runtimeContract || {}, counts = plan.expectedCounts || {};
      if (JSON.stringify(ids) !== JSON.stringify(["MISSION_001", "MISSION_002", "MISSION_003", "MISSION_004"])) add("definitionErrors", "Registry mission order must be 001, 002, 003, 004.");
      var m4 = missions.filter(function (m) { return m.id === "MISSION_004"; })[0];
      if (!m4 || m4.selectable !== true || m4.startable !== true || m4.runtimeKey !== "MISSION_004") add("definitionErrors", "Mission 004 registry definition is invalid.");
      if (JSON.stringify(contract.requiredMissionIds) !== JSON.stringify(["MISSION_001", "MISSION_002", "MISSION_003"]) || JSON.stringify(contract.failSoftMissionIds) !== JSON.stringify(["MISSION_004"]) || contract.acceptedBuildRequiresAllFourRuntimes !== true) add("runtimeContractErrors", "Four-mission runtime contract is invalid.");
      if (counts.missions !== 4 || counts.registeredRuntimesAfterFinalization !== 4 || counts.mission004Runtimes !== 1) add("countErrors", "Four-mission expected counts are invalid.");
      if ((plan.policy || {}).automaticMissionSelectionAllowed !== false || plan.policy.automaticMissionStartAllowed !== false || plan.policy.automaticMissionFinishAllowed !== false) add("policyErrors", "Automatic registry actions must remain disabled.");
    }
    if (r.errors.length) r.status = "FAILED";
    return r;
  }
  function logResult(r) { console.group(r.title); Object.keys(r).filter(function (k) { return /Errors$/.test(k); }).forEach(function (k) { console.log(k + ": " + r[k]); }); console[r.status === "PASSED" ? "log" : "error"]("STATUS: " + r.status); if (r.errors.length) console.error(r.errors); console.groupEnd(); }
  window.MissionBosMission004RegistryExtensionValidator = { validate: validate, logResult: logResult };
})();
