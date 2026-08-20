/* Mission BOS - Build 012M.1 preparation
   Structural validator for the additive Mission 003 network extension.
*/
(function () {
  "use strict";

  function add(result, key, message) { result[key] += 1; result.errors.push(message); }
  function sum(items) { return (items || []).reduce(function (total, item) { return total + Number((item && item.demandUnits) || 0); }, 0); }
  function forbidden(value) {
    var count = 0;
    function walk(node) {
      if (!node || typeof node !== "object") return;
      Object.keys(node).forEach(function (key) {
        var normalized = String(key).toLowerCase();
        if (normalized === "servingtowerid" || normalized === "fixedtowerid" || normalized === "missiontowerid") count += 1;
        walk(node[key]);
      });
    }
    walk(value);
    return count;
  }

  function validate(extension, plan, missionPlan) {
    var result = {
      title: "MISSION BOS MISSION 003 NETWORK EXTENSION 012M.1 VALIDATION",
      dependencyErrors: 0,
      baselineErrors: 0,
      utilityErrors: 0,
      civilianEndpointErrors: 0,
      demandAccountingErrors: 0,
      sameCellErrors: 0,
      expectedCountErrors: 0,
      fixedTowerErrors: 0,
      status: "PASSED",
      errors: []
    };
    if (!extension || !plan || !missionPlan) {
      add(result, "dependencyErrors", "Mission 003 network extension dependencies are missing.");
      result.status = "FAILED";
      return result;
    }
    if (!extension.baselinePlan || Number(((extension.baselinePlan.expectedCounts || {}).allNetworkEndpoints)) !== 34 ||
        plan.sourceBuild !== "Mission-BOS-Build-011N.4") {
      add(result, "baselineErrors", "The protected 011N.4 network baseline is unavailable.");
    }
    var participants = plan.participants || {};
    var utility = participants.utility || [];
    if (utility.length !== 1 || utility[0].id !== "NET_STADTWERKE_01" || utility[0].channel !== "UTILITY" ||
        utility[0].activeMode !== "always" || utility[0].priorityEligible !== false || Number(utility[0].demandUnits) !== 1.5) {
      add(result, "utilityErrors", "The Stadtwerke endpoint must remain always-on and non-BOS.");
    }
    var mission003 = participants.mission003Civilian || [];
    var ids = Object.create(null);
    mission003.forEach(function (endpoint) {
      if (!endpoint || !endpoint.id || !endpoint.referenceId || endpoint.channel !== "CIVILIAN" ||
          endpoint.activeMode !== "mission-003-scene" || Number(endpoint.demandUnits) !== 1 || ids[endpoint.id]) {
        add(result, "civilianEndpointErrors", "Invalid or duplicate Mission 003 civilian endpoint.");
      }
      if (endpoint && endpoint.id) ids[endpoint.id] = true;
    });
    if (mission003.length !== 6 || (missionPlan.network.missionCivilianEndpointIds || []).some(function (id) { return !ids[id]; })) {
      add(result, "civilianEndpointErrors", "Exactly six approved Mission 003 phone endpoints are required.");
    }
    var accounting = participants.demandAccounting || {};
    if (Math.abs(sum(utility) - Number(accounting.utilityAlwaysOnUnits)) > 1e-9 ||
        Math.abs(sum(mission003) - Number(accounting.mission003VisibleTotalUnits)) > 1e-9 ||
        accounting.mission003VisibleDemandIsSubtractedFromSaturationBase !== true) {
      add(result, "demandAccountingErrors", "Mission 003 demand accounting would double count or omit demand.");
    }
    var sameCell = (plan.sameCellCompetition || {}).mission003 || {};
    if (sameCell.required !== true || Number(sameCell.minimumBosEndpoints) < 1 ||
        Number(sameCell.minimumCivilianEndpoints) < 2 || Number(sameCell.minimumCellLoad) !== 90 ||
        sameCell.utilityEndpointIsNotBos !== true) {
      add(result, "sameCellErrors", "Mission 003 same-cell competition contract is invalid.");
    }
    var expected = plan.expectedCounts || {};
    if (Number(expected.bosEndpoints) !== 3 || Number(expected.utilityEndpoints) !== 1 ||
        Number(expected.alwaysOnCivilianEndpoints) !== 13 || Number(expected.mission001CivilianEndpoints) !== 6 ||
        Number(expected.arenaCivilianEndpoints) !== 12 || Number(expected.mission003CivilianEndpoints) !== 6 ||
        Number(expected.allCivilianEndpoints) !== 38 || Number(expected.allNonBosEndpoints) !== 38 ||
        Number(expected.allNetworkEndpoints) !== 41 || Number(expected.fixedServingTowerDefinitions) !== 0) {
      add(result, "expectedCountErrors", "Extended network endpoint counts are invalid.");
    }
    if (forbidden(plan) !== 0) add(result, "fixedTowerErrors", "Fixed serving-tower definition detected.");
    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }

  function logResult(result) {
    var method = result && result.status === "PASSED" ? "log" : "error";
    console.group((result && result.title) || "MISSION BOS MISSION 003 NETWORK EXTENSION VALIDATION");
    ["dependencyErrors", "baselineErrors", "utilityErrors", "civilianEndpointErrors", "demandAccountingErrors",
      "sameCellErrors", "expectedCountErrors", "fixedTowerErrors"].forEach(function (key) {
      console[method](key + ": " + Number((result && result[key]) || 0));
    });
    console[method]("STATUS: " + ((result && result.status) || "FAILED"));
    if (result && result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosMission003NetworkExtensionValidator = { validate: validate, logResult: logResult };
})();
