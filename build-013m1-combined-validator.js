/* Mission BOS - Build 013M.1 consolidated preparation validator */
(function () {
  "use strict";
  function validate(activationPlan, foundationPlan) {
    var result = {
      title: "MISSION BOS BUILD 013M.1 COMBINED PREPARATION VALIDATION",
      dependencyErrors: 0,
      sourceErrors: 0,
      separationErrors: 0,
      scopeErrors: 0,
      status: "PASSED",
      errors: []
    };
    if (!activationPlan || !foundationPlan) {
      result.dependencyErrors += 1;
      result.errors.push("Activation-impact plan and Mission 004 foundation plan are both required.");
    } else {
      if (activationPlan.sourceBuild !== "Mission-BOS-Build-012M.4" ||
          foundationPlan.sourceBuildRequired !== "Mission-BOS-Build-012M.4" ||
          foundationPlan.sourceArchiveSha256Required !== "cb03ba4df4f13cd1b3156de7497b77256440fff5420e58c20262670d16eb815f") {
        result.sourceErrors += 1;
        result.errors.push("Both work packages must build directly on the verified 012M.4 baseline.");
      }
      var ap = activationPlan.policy || {};
      var fp = foundationPlan.policy || {};
      if (ap.visualOnly !== true || ap.missionLogicChangesAllowed !== false ||
          ap.radioModelChangesAllowed !== false || ap.cellLoadChangesAllowed !== false ||
          fp.foundationMustRemainHiddenUntilMissionRuntimeOwnsIt !== true ||
          fp.existingMissionChangesAllowed !== false || fp.existingNetworkAlgorithmChangesAllowed !== false) {
        result.separationErrors += 1;
        result.errors.push("Activation polish and Mission 004 foundation must remain isolated from mission and network logic.");
      }
      if (foundationPlan.includesBOSActivationImpactPolish !== true ||
          foundationPlan.build !== "013M.1" || activationPlan.build !== "013M.1") {
        result.scopeErrors += 1;
        result.errors.push("The consolidated 013M.1 scope is incomplete or mislabeled.");
      }
    }
    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }
  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    Object.keys(result).filter(function (key) { return /Errors$/.test(key); }).forEach(function (key) {
      console[method](key + ": " + result[key]);
    });
    console[method]("STATUS: " + result.status);
    if (result.errors.length) console.error(result.errors);
    console.groupEnd();
  }
  window.MissionBosBuild013M1CombinedValidator = { validate: validate, logResult: logResult };
})();
