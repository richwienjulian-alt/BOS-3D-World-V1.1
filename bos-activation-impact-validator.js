/* Mission BOS - Build 013M.1 consolidated preparation validator */
(function () {
  "use strict";
  function finite(value, fallback) { value = Number(value); return isFinite(value) ? value : fallback; }
  function copy(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function validate(plan, networkPlan) {
    var result = {
      title: "MISSION BOS BOS ACTIVATION IMPACT PLAN VALIDATION",
      dependencyErrors: 0,
      policyErrors: 0,
      triggerErrors: 0,
      durationErrors: 0,
      dashboardErrors: 0,
      thresholdErrors: 0,
      fixedTowerErrors: 0,
      countErrors: 0,
      status: "PASSED",
      errors: []
    };
    if (!plan || !networkPlan || !networkPlan.automaticBOSPriority) {
      result.dependencyErrors += 1;
      result.errors.push("Activation-impact plan or network-realism plan is missing.");
    } else {
      var p = plan.policy || {};
      if (p.visualOnly !== true || p.missionLogicChangesAllowed !== false ||
          p.radioModelChangesAllowed !== false || p.cellLoadChangesAllowed !== false ||
          p.capacityPolicyChangesAllowed !== false || p.automaticCameraMovementAllowed !== false ||
          p.soundAllowed !== false || p.fullScreenFlashAllowed !== false) {
        result.policyErrors += 1;
        result.errors.push("The build must remain a visual-only polish without camera, sound or logic changes.");
      }
      var trigger = plan.triggerContract || {};
      if (trigger.triggerEdge !== "ACTIVE_FALSE_TO_TRUE" ||
          trigger.retriggerWhileActiveAllowed !== false ||
          trigger.retriggerOnLoadBreathingAllowed !== false ||
          trigger.retriggerAfterConfirmedReleaseAllowed !== true) {
        result.triggerErrors += 1;
        result.errors.push("Activation must be edge-triggered exactly once until confirmed release.");
      }
      var automatic = networkPlan.automaticBOSPriority || {};
      if (finite(trigger.activationThresholdPercent, -1) !== finite(automatic.overloadThreshold, 90) ||
          finite(trigger.releaseThresholdPercent, -1) !== finite(automatic.releaseThreshold, 85)) {
        result.thresholdErrors += 1;
        result.errors.push("Activation-impact thresholds must mirror the existing 90/85 priority hysteresis.");
      }
      var tower = plan.towerImpact || {};
      [tower.indicatorFlashSeconds, tower.indicatorBounceSeconds, tower.worldRingSeconds,
       tower.beaconGlowSeconds].forEach(function (value) {
        if (!(finite(value, 0) > 0 && finite(value, 0) <= 2.0)) {
          result.durationErrors += 1;
          result.errors.push("Every activation effect must be brief and bounded to two seconds.");
        }
      });
      if (!(finite(tower.indicatorMaximumScale, 0) >= 1.05 && finite(tower.indicatorMaximumScale, 0) <= 1.2)) {
        result.durationErrors += 1;
        result.errors.push("Indicator bounce scale must remain between 1.05 and 1.20.");
      }
      var dashboard = plan.dashboardImpact || {};
      if (dashboard.hostSelector !== ".communication-card" || !dashboard.bannerId ||
          finite(dashboard.bannerVisibleSeconds, 0) <= 0 ||
          dashboard.persistentBadgeRemainsOwnedByExistingDashboard !== true) {
        result.dashboardErrors += 1;
        result.errors.push("The activation notice must live inside the existing communication card.");
      }
      if (/MAST_[A-E]/.test(JSON.stringify(plan.triggerContract || {}))) {
        result.fixedTowerErrors += 1;
        result.errors.push("No tower may be hard-coded as the activation target.");
      }
      var expected = plan.expectedCounts || {};
      if (finite(expected.towerCandidates, 0) !== 5 || finite(expected.dashboardBanners, 0) !== 1 ||
          finite(expected.newMissionStates, -1) !== 0 || finite(expected.newNetworkEndpoints, -1) !== 0 ||
          finite(expected.fixedServingTowerDefinitions, -1) !== 0) {
        result.countErrors += 1;
        result.errors.push("Activation-impact expected counts are inconsistent.");
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
  window.MissionBosBOSActivationImpactValidator = { validate: validate, logResult: logResult, copy: copy };
})();
