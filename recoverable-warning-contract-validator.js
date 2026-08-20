/* Node/browser validator for the frozen 013M.11 contract. */
(function () {
  "use strict";
  function validate(contract) {
    var errors = [];
    if (!contract) errors.push("Contract missing.");
    else {
      if (contract.buildId !== "Mission-BOS-Build-013M.11") errors.push("Unexpected buildId.");
      if (!contract.mission002 || contract.mission002.recoverableDependencyPolicy !== "ALLOW_NON_FATAL_CELL_LOAD_AND_CAPACITY_WARNINGS") errors.push("Mission 002 recoverable-warning policy invalid.");
      if (!contract.networkReadiness || Number(contract.networkReadiness.maximumBaseLoadDeviation) !== 4) errors.push("Network readiness tolerance invalid.");
      if (contract.networkReadiness && contract.networkReadiness.validatedMissionResettingMustBeFalse !== true) errors.push("Resetting guard missing.");
      if (!contract.dashboard || contract.dashboard.customerNetworkSectionPersistent !== true) errors.push("Persistent network section requirement missing.");
      if (contract.dashboard && contract.dashboard.hideOnRecoverableWarning !== false) errors.push("Recoverable warning may hide dashboard.");
      if (contract.dashboard && contract.dashboard.retainLastKnownGoodSnapshotAsFallback !== true) errors.push("Last-known-good fallback missing.");
      if (!contract.protected || contract.protected.mission004OperationalSequence !== true || contract.protected.mission003And004OutboundSequencing !== true) errors.push("Protected mission behavior missing.");
    }
    return { title: "MISSION BOS 013M.11 RECOVERABLE WARNING CONTRACT VALIDATION", errors: errors, status: errors.length ? "FAILED" : "PASSED" };
  }
  var result = validate(typeof window !== "undefined" ? window.MISSION_BOS_013M11_RECOVERABLE_WARNING_CONTRACT : null);
  if (typeof window !== "undefined") window.MissionBos013M11RecoverableWarningContractValidation = result;
  if (typeof module !== "undefined") {
    module.exports = { validate: validate };
    if (require.main === module) {
      var fs = require("fs"), vm = require("vm"), path = require("path");
      var contractFile = path.join(__dirname, "city-runtime-recoverable-warning-contract.js");
      var context = { window: {} };
      vm.createContext(context);
      vm.runInContext(fs.readFileSync(contractFile, "utf8"), context);
      var nodeResult = validate(context.window.MISSION_BOS_013M11_RECOVERABLE_WARNING_CONTRACT);
      console.log(nodeResult.title);
      if (nodeResult.errors.length) nodeResult.errors.forEach(function (error) { console.error(error); });
      console.log("STATUS: " + nodeResult.status);
      if (nodeResult.status !== "PASSED") process.exit(1);
    }
  }
})();
