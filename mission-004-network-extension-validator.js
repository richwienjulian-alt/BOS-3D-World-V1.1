/* Mission BOS - Build 013M.2 preparation network-extension validator. */
(function () {
  "use strict";
  function validate(extension, mission) {
    var r = { title: "MISSION BOS MISSION 004 NETWORK EXTENSION VALIDATION", dependencyErrors: 0, endpointErrors: 0, demandErrors: 0, countErrors: 0, policyErrors: 0, fixedTowerErrors: 0, status: "PASSED", errors: [] };
    function add(k, m) { r[k] += 1; r.errors.push(m); }
    if (!extension || !mission || !extension.extendedPlan) add("dependencyErrors", "Mission 004 network extension is unavailable.");
    if (!r.errors.length) {
      var plan = extension.extendedPlan, participants = plan.participants || {}, endpoints = participants.mission004Civilian || [], expected = plan.expectedCounts || {}, demand = participants.demandAccounting || {};
      if (endpoints.length !== 8 || endpoints.some(function (e) { return e.channel !== "CIVILIAN" || e.activeMode !== "mission-004-scene" || Number(e.demandUnits) !== 1; })) add("endpointErrors", "Mission 004 must add eight one-unit civilian endpoints.");
      if (Number(demand.mission004VisibleTotalUnits) !== 8) add("demandErrors", "Mission 004 visible demand must total eight units.");
      if (expected.mission004CivilianEndpoints !== 8 || expected.allCivilianEndpoints !== 46 || expected.allNetworkEndpoints !== 49 || expected.fixedServingTowerDefinitions !== 0) add("countErrors", "Mission 004 network expected counts are invalid.");
      if (!plan.sameCellCompetition || !plan.sameCellCompetition.mission004 || plan.sameCellCompetition.mission004.minimumBosEndpoints !== 3) add("policyErrors", "Mission 004 same-cell competition contract is missing.");
      if (/servingTower(Id)?\s*[:=]/i.test(JSON.stringify(endpoints))) add("fixedTowerErrors", "A Mission 004 endpoint contains a fixed serving tower.");
    }
    if (r.errors.length) r.status = "FAILED";
    return r;
  }
  function logResult(r) { console.group(r.title); Object.keys(r).filter(function (k) { return /Errors$/.test(k); }).forEach(function (k) { console.log(k + ": " + r[k]); }); console[r.status === "PASSED" ? "log" : "error"]("STATUS: " + r.status); if (r.errors.length) console.error(r.errors); console.groupEnd(); }
  window.MissionBosMission004NetworkExtensionValidator = { validate: validate, logResult: logResult };
})();
