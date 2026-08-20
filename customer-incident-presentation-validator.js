/* Mission BOS - Build 013M.18
   Validates the pure customer-facing incident presentation layer.
*/
(function (root) {
  "use strict";

  function validate(plan) {
    var errors = [];
    var warnings = [];
    var requiredMissions = ["MISSION_001", "MISSION_002", "MISSION_003", "MISSION_004"];
    var forbidden = [/\bW14\b/i, /validierte Routen/i, /\bRuntime\b/i, /\bState\b/i, /Simulationseinheiten/i, /zivile Sitzungen/i, /Mission 00[1-4]/i];
    if (!plan) errors.push("incident presentation plan missing");
    else {
      if (plan.build !== "013M.18") errors.push("build mismatch");
      if (plan.mode !== "CUSTOMER_PRESENTATION_ONLY") errors.push("presentation-only mode missing");
      if (!plan.fallbackPolicy || plan.fallbackPolicy.mustNeverFailMission !== true) errors.push("safe fallback policy missing");
      requiredMissions.forEach(function (missionId) {
        var mission = plan.missions && plan.missions[missionId];
        if (!mission || !mission.title || !mission.states || !mission.states.READY || !mission.states.FAILED) {
          errors.push("mission/state coverage missing: " + missionId);
          return;
        }
        Object.keys(mission.states).forEach(function (stateId) {
          var item = mission.states[stateId] || {};
          ["summaryPhase", "statusBadge", "stage", "description"].forEach(function (key) {
            if (!item[key]) errors.push(missionId + "/" + stateId + " missing " + key);
          });
          if (item.statusBadge && item.statusBadge.length > 16) errors.push(missionId + "/" + stateId + " status badge too long");
          if (item.stage && item.stage.length > 36) errors.push(missionId + "/" + stateId + " stage too long");
          if (item.description && item.description.length > 150) errors.push(missionId + "/" + stateId + " description too long");
          if (item.description && !/[.!?]$/.test(item.description)) errors.push(missionId + "/" + stateId + " description punctuation missing");
          forbidden.forEach(function (pattern) {
            if (pattern.test(String(item.summaryPhase || "")) || pattern.test(String(item.statusBadge || "")) ||
                pattern.test(String(item.stage || "")) || pattern.test(String(item.description || ""))) {
              errors.push(missionId + "/" + stateId + " forbidden customer term " + pattern);
            }
          });
        });
      });
    }
    return Object.freeze({ status: errors.length ? "FAILED" : "PASSED", errors: Object.freeze(errors.slice()), warnings: Object.freeze(warnings.slice()) });
  }

  root.MissionBosCustomerIncidentPresentationValidator = { validate: validate };
  root.MISSION_BOS_CUSTOMER_INCIDENT_PRESENTATION_VALIDATION = validate(root.MISSION_BOS_CUSTOMER_INCIDENT_PRESENTATION_PLAN);
})(typeof window !== "undefined" ? window : globalThis);
