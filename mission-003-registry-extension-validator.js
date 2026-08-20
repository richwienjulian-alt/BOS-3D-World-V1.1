/* Mission BOS - Build 012M.1 preparation
   Structural validator for the three-mission registry extension.
*/
(function () {
  "use strict";

  function add(result, key, message) { result[key] += 1; result.errors.push(message); }
  function find(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) if (items[i] && items[i].id === id) return items[i];
    return null;
  }
  function forbidden(value) {
    var count = 0;
    function walk(node) {
      if (!node || typeof node !== "object") return;
      Object.keys(node).forEach(function (key) {
        var normalized = String(key).toLowerCase();
        if (normalized === "servingtowerid" || normalized === "servingcellid" || normalized === "fixedtowerid" || normalized === "missiontowerid") count += 1;
        walk(node[key]);
      });
    }
    walk(value);
    return count;
  }

  function validate(extension, plan, mission001Plan, mission002Plan, mission003Plan) {
    var result = {
      title: "MISSION BOS THREE-MISSION REGISTRY 012M.1 VALIDATION",
      dependencyErrors: 0,
      baselineErrors: 0,
      missionDefinitionErrors: 0,
      policyErrors: 0,
      runtimeContractErrors: 0,
      failSoftErrors: 0,
      expectedCountErrors: 0,
      fixedTowerErrors: 0,
      status: "PASSED",
      errors: []
    };
    if (!extension || !plan || !mission001Plan || !mission002Plan || !mission003Plan) {
      add(result, "dependencyErrors", "Three-mission registry dependencies are incomplete.");
      result.status = "FAILED";
      return result;
    }
    if (!extension.baselinePlan || Number(((extension.baselinePlan.expectedCounts || {}).missions)) !== 2 ||
        plan.sourceBuild !== "Mission-BOS-Build-011N.4") {
      add(result, "baselineErrors", "The protected two-mission 011N.4 registry baseline is unavailable.");
    }
    var missions = plan.missions || [];
    var m1 = find(missions, "MISSION_001");
    var m2 = find(missions, "MISSION_002");
    var m3 = find(missions, "MISSION_003");
    if (missions.length !== 3 || !m1 || !m2 || !m3 || m1.runtimeKey !== "MISSION_001" ||
        m2.runtimeKey !== "MISSION_002" || m3.runtimeKey !== "MISSION_003" ||
        m3.planGlobal !== "MISSION_BOS_MISSION_003_PLAN" || m3.controllerGlobal !== "MissionBosMission003Controller" ||
        m3.selectable !== true || m3.startable !== true) {
      add(result, "missionDefinitionErrors", "Registry must contain exactly three startable mission definitions.");
    }
    if ((mission002Plan.references || {}).missionId !== "MISSION_002" || mission003Plan.missionId !== "MISSION_003" ||
        !mission001Plan.stateOrder || mission001Plan.stateOrder.indexOf("COMPLETED") < 0) {
      add(result, "missionDefinitionErrors", "Mission plan compatibility is invalid.");
    }
    var policy = plan.policy || {};
    if (policy.onlyOneActiveMissionAllowed !== true || policy.mission003RuntimeRequiredInAcceptedBuild !== true ||
        policy.mission003FailSoftMayNotBlockMission001OrMission002 !== true ||
        policy.automaticMissionSelectionAllowed !== false || policy.automaticMissionStartAllowed !== false ||
        policy.automaticMissionFinishAllowed !== false) {
      add(result, "policyErrors", "Three-mission policy is invalid.");
    }
    var runtime = plan.runtimeContract || {};
    var requiredMethods = ["selectMission", "registerRuntime", "registerUnavailable", "finalizeRuntimeRegistration",
      "getSelectedMissionId", "getSelectedDefinition", "getSelectedRuntime", "getActiveMissionId", "startSelected",
      "activateBOS", "finishSelected", "reset", "update", "getManifest", "getSafetyStatus"];
    if ((runtime.requiredRegistryMethods || []).join("|") !== requiredMethods.join("|") ||
        (runtime.requiredMissionIds || []).join("|") !== "MISSION_001|MISSION_002" ||
        (runtime.failSoftMissionIds || []).join("|") !== "MISSION_003" ||
        runtime.finalizationRequiresEveryDefinitionResolved !== true || runtime.acceptedBuildRequiresAllThreeRuntimes !== true) {
      add(result, "runtimeContractErrors", "Registry runtime contract is invalid.");
    }
    if (policy.mission003IsOnlyOptionalDuringInitializationFailure !== true ||
        Number((plan.expectedCounts || {}).maximumUnavailableMissionsInFailSoftMode) !== 1) {
      add(result, "failSoftErrors", "Mission 003 fail-soft boundary is invalid.");
    }
    var expected = plan.expectedCounts || {};
    if (Number(expected.missions) !== 3 || Number(expected.availableMissions) !== 3 ||
        Number(expected.selectableMissions) !== 3 || Number(expected.startableMissions) !== 3 ||
        Number(expected.registeredRuntimesAfterFinalization) !== 3 || Number(expected.mission002Runtimes) !== 1 ||
        Number(expected.mission003Runtimes) !== 1 || Number(expected.newStandalonePanels) !== 0) {
      add(result, "expectedCountErrors", "Three-mission registry counts are invalid.");
    }
    if (forbidden(plan) !== 0) add(result, "fixedTowerErrors", "Fixed serving-tower definition detected.");
    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }

  function logResult(result) {
    var method = result && result.status === "PASSED" ? "log" : "error";
    console.group((result && result.title) || "MISSION BOS THREE-MISSION REGISTRY VALIDATION");
    ["dependencyErrors", "baselineErrors", "missionDefinitionErrors", "policyErrors", "runtimeContractErrors",
      "failSoftErrors", "expectedCountErrors", "fixedTowerErrors"].forEach(function (key) {
      console[method](key + ": " + Number((result && result[key]) || 0));
    });
    console[method]("STATUS: " + ((result && result.status) || "FAILED"));
    if (result && result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosMission003RegistryExtensionValidator = { validate: validate, logResult: logResult };
})();
