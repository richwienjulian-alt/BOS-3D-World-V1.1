/* Mission BOS - Build 013M.7 preparation
   Browser target-build validator for the Mission 004 customer incident card and CTA.
*/
(function () {
  "use strict";
  function copy(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function validate(options) {
    options = options || {};
    var plan = options.missionPlan || window.MISSION_BOS_MISSION_004_PLAN;
    var contract = options.contract || window.MISSION_BOS_MISSION_004_POLISH_CONTRACT;
    var root = options.root || document;
    var r = {
      title: "MISSION BOS MISSION 004 CUSTOMER UI VALIDATION",
      dependencyErrors: 0, ctaErrors: 0, incidentCardErrors: 0, wrappingErrors: 0,
      measuredTitleWidthPixels: null, statusWhiteSpace: null, titleOverflowWrap: null, titleWordBreak: null,
      status: "PASSED", errors: []
    };
    function add(k, m) { r[k] += 1; r.errors.push(m); }
    if (!plan || !contract || !root || typeof root.getElementById !== "function") {
      add("dependencyErrors", "Mission plan, polish contract or DOM root is missing.");
      r.status = "FAILED"; return copy(r);
    }
    var title = root.getElementById("mission-title"), status = root.getElementById("mission-status"), stage = root.getElementById("mission-stage");
    var description = root.getElementById("mission-description"), button = root.getElementById("mission-button");
    if (!title || !status || !stage || !description || !button) {
      add("dependencyErrors", "Required Mission 004 customer dashboard elements are missing.");
      r.status = "FAILED"; return copy(r);
    }
    if (!plan.controls || !plan.controls.missionButtonLabels || plan.controls.missionButtonLabels.READY !== contract.missionButton.readyLabel) {
      add("ctaErrors", "Mission 004 plan does not define the required READY CTA.");
    }
    var presentation = plan.customerPresentation || {};
    if (!presentation.statusBadgeByState || presentation.statusBadgeByState.RETURNING !== "Rückfahrt" || presentation.headerBadgeUsesCompactStatus !== true) {
      add("incidentCardErrors", "Compact Mission 004 status badge mapping is missing.");
    }

    if (typeof window.getComputedStyle === "function") {
      var oldTitle = title.textContent, oldStatus = status.textContent, oldStage = stage.textContent;
      title.textContent = "Verkehrsunfall";
      status.textContent = "Feuerwehr und Rettungsdienst befreien und versorgen den Patienten";
      stage.textContent = "Rettungswagen zum Krankenhaus";
      var titleStyle = window.getComputedStyle(title), statusStyle = window.getComputedStyle(status);
      r.titleOverflowWrap = titleStyle.overflowWrap;
      r.titleWordBreak = titleStyle.wordBreak;
      r.statusWhiteSpace = statusStyle.whiteSpace;
      r.measuredTitleWidthPixels = Math.round(title.getBoundingClientRect().width * 100) / 100;
      if (titleStyle.overflowWrap === "anywhere" || titleStyle.wordBreak === "break-all") add("wrappingErrors", "Mission title still permits character-by-character wrapping.");
      if (r.measuredTitleWidthPixels < Number(contract.incidentCard.titleMinimumUsableWidthPixelsAt420Panel || 150)) add("wrappingErrors", "Mission title loses too much width when a long status string is present.");
      if (statusStyle.whiteSpace !== "nowrap") add("wrappingErrors", "Mission status badge must remain a compact single-line badge.");
      title.textContent = oldTitle; status.textContent = oldStatus; stage.textContent = oldStage;
    }

    if (r.errors.length) r.status = "FAILED";
    return copy(r);
  }
  function logResult(r) {
    console.group(r.title);
    console.log("measuredTitleWidthPixels: " + r.measuredTitleWidthPixels);
    console.log("titleOverflowWrap: " + r.titleOverflowWrap);
    console.log("titleWordBreak: " + r.titleWordBreak);
    console.log("statusWhiteSpace: " + r.statusWhiteSpace);
    console[r.status === "PASSED" ? "log" : "error"]("STATUS: " + r.status);
    if (r.errors.length) console.error(r.errors);
    console.groupEnd();
  }
  window.MissionBosMission004CustomerUiValidator = { validate: validate, logResult: logResult };
})();
