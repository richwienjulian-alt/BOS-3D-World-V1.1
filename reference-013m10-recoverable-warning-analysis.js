/* Pure reference analysis for Build 013M.10 behavior. Node runnable. */
(function () {
  "use strict";
  function baselineDashboardSnapshot(safety, snapshot) {
    if (!safety || safety.status !== "PASSED") return null;
    return snapshot;
  }
  function proposedDashboardSnapshot(safety, snapshot) {
    if (!safety || safety.fatal === true) return null;
    return snapshot;
  }
  function baselineMission002DependencyUsable(safety) {
    return !!safety && safety.status === "PASSED";
  }
  function proposedMission002DependencyUsable(safety) {
    return !!safety && (safety.status === "PASSED" || safety.fatal !== true);
  }
  var recoverable = { status: "FAILED", fatal: false, recoverableWarnings: 1 };
  var fatal = { status: "FAILED", fatal: true };
  var sampleSnapshot = { rows: [{ towerId: "MAST_C", currentLoad: 100 }] };
  var sourceEvidence = null;
  if (typeof require !== "undefined" && typeof process !== "undefined" && process.argv[2]) {
    var fs = require("fs"), path = require("path");
    var sourceRoot = path.resolve(process.argv[2]);
    var appSource = fs.readFileSync(path.join(sourceRoot, "app.js"), "utf8");
    var mission002Source = fs.readFileSync(path.join(sourceRoot, "city-mission-002-controller.js"), "utf8");
    sourceEvidence = {
      appRejectsAnyNonPassedSafety: /safety\.status\s*!==\s*["']PASSED["']/.test(appSource.slice(appSource.indexOf("function getValidatedCellLoadSnapshot"), appSource.indexOf("function getValidatedCellCapacitySnapshot"))),
      appHidesCellLoadSectionOnMissingSnapshot: /cellLoadSection\.hidden\s*=\s*true/.test(appSource),
      mission002StrictlyRequiresCellLoadPassed: /runtimeStatus\(cellLoadRuntime\)\s*!==\s*["']PASSED["']/.test(mission002Source),
      mission002StrictlyRequiresCapacityPassed: /runtimeStatus\(capacityRuntime\)\s*!==\s*["']PASSED["']/.test(mission002Source)
    };
  }
  var result = {
    title: "MISSION BOS 013M.10 RECOVERABLE WARNING ROOT CAUSE",
    sourceEvidence: sourceEvidence,
    recoverableWarning: {
      baselineDashboardAvailable: !!baselineDashboardSnapshot(recoverable, sampleSnapshot),
      proposedDashboardAvailable: !!proposedDashboardSnapshot(recoverable, sampleSnapshot),
      baselineMission002DependencyUsable: baselineMission002DependencyUsable(recoverable),
      proposedMission002DependencyUsable: proposedMission002DependencyUsable(recoverable)
    },
    fatalWarning: {
      proposedDashboardLiveSnapshotAvailable: !!proposedDashboardSnapshot(fatal, sampleSnapshot),
      proposedMission002DependencyUsable: proposedMission002DependencyUsable(fatal)
    }
  };
  var sourcePassed = !sourceEvidence || Object.keys(sourceEvidence).every(function (key) { return sourceEvidence[key] === true; });
  var passed = sourcePassed && result.recoverableWarning.baselineDashboardAvailable === false &&
    result.recoverableWarning.proposedDashboardAvailable === true &&
    result.recoverableWarning.baselineMission002DependencyUsable === false &&
    result.recoverableWarning.proposedMission002DependencyUsable === true &&
    result.fatalWarning.proposedDashboardLiveSnapshotAvailable === false &&
    result.fatalWarning.proposedMission002DependencyUsable === false;
  result.status = passed ? "REPRODUCED" : "FAILED";
  if (typeof console !== "undefined") {
    console.log(result.title);
    console.log(JSON.stringify(result, null, 2));
  }
  if (typeof module !== "undefined") module.exports = result;
})();
