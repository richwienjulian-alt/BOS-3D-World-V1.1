/* Mission BOS - Build 013M.6 preparation
   Browser DOM acceptance validator for the implemented customer dashboard.
   Load after the dashboard markup exists.
*/
(function (root) {
  "use strict";

  function validateCustomerDashboardDom(doc) {
    var errors = [];
    var warnings = [];
    var contract = root.MISSION_BOS_CUSTOMER_DASHBOARD_CONTRACT;
    if (!contract) return { status: "FAILED", errors: ["dashboard contract missing"], warnings: [] };
    if (!doc || typeof doc.getElementById !== "function") {
      return { status: "FAILED", errors: ["document unavailable"], warnings: [] };
    }

    function required(id) {
      var element = doc.getElementById(id);
      if (!element) errors.push("missing #" + id);
      return element;
    }

    var infoPanel = required(contract.dom.infoPanelId);
    if (infoPanel && !infoPanel.classList.contains(contract.dom.requiredInfoPanelClass)) {
      errors.push("#info-panel missing .customer-dashboard");
    }

    contract.dom.requiredNewIds.forEach(required);

    var technical = doc.getElementById("technical-details-panel");
    if (technical && technical.tagName !== "DETAILS") errors.push("#technical-details-panel must be <details>");
    if (technical && technical.open) errors.push("technical details must be collapsed by default");

    var cameraControls = required("camera-control-panel");
    if (cameraControls && cameraControls.tagName !== "DETAILS") errors.push("#camera-control-panel must be <details>");
    if (cameraControls && cameraControls.open) errors.push("camera controls must be collapsed by default");
    ["camera-control-forward", "camera-control-backward", "camera-control-left", "camera-control-right", "camera-control-rotate-left", "camera-control-rotate-right", "camera-control-zoom-out", "camera-control-zoom-in", "camera-control-home"].forEach(required);

    var brandLogo = required("customer-brand-logo");
    if (brandLogo && brandLogo.tagName !== "IMG") errors.push("#customer-brand-logo must be <img>");
    if (brandLogo && brandLogo.getAttribute("src") !== "assets/telekom-logo-current.png") errors.push("customer logo source mismatch");
    if (brandLogo && brandLogo.getAttribute("alt") !== "Telekom") errors.push("customer logo alt mismatch");
    var eyebrow = infoPanel ? infoPanel.querySelector(".customer-dashboard-header .eyebrow") : null;
    if (!eyebrow || String(eyebrow.textContent || "").trim() !== "T MISSION") errors.push("visible header eyebrow must be T MISSION");
    if (doc.title !== "T Mission | Connected Response") errors.push("browser title mismatch");

    var presenter = doc.getElementById("presenter-panel");
    if (presenter && presenter.tagName !== "DETAILS") errors.push("#presenter-panel must remain <details>");
    if (presenter && presenter.open) errors.push("presenter panel must be collapsed by default");
    if (technical && cameraControls && presenter && technical.compareDocumentPosition &&
        !(technical.compareDocumentPosition(cameraControls) & 4 && cameraControls.compareDocumentPosition(presenter) & 4)) {
      errors.push("camera controls must be placed between technical details and presenter controls");
    }

    var overload = doc.getElementById("overload-button");
    if (overload && presenter && !presenter.contains(overload)) errors.push("#overload-button must be inside #presenter-panel");

    var bosButton = doc.getElementById("bos-button");
    if (bosButton && presenter && !presenter.contains(bosButton)) errors.push("#bos-button must be inside #presenter-panel");

    var primaryActions = doc.getElementById("customer-primary-actions");
    var missionButton = doc.getElementById("mission-button");
    if (missionButton && primaryActions && !primaryActions.contains(missionButton)) {
      errors.push("#mission-button must be inside #customer-primary-actions");
    }

    var bodyText = doc.body ? String(doc.body.textContent || "") : "";
    contract.content.forbiddenVisibleVersionFragments.forEach(function (fragment) {
      if (bodyText.indexOf(fragment) >= 0) errors.push("stale visible version text: " + fragment);
    });

    contract.content.requiredSectionHeadings.forEach(function (heading) {
      if (bodyText.indexOf(heading) < 0) errors.push("missing customer heading: " + heading);
    });

    var allWithId = Array.prototype.slice.call(doc.querySelectorAll("[id]"));
    var counts = {};
    allWithId.forEach(function (element) {
      counts[element.id] = (counts[element.id] || 0) + 1;
    });
    Object.keys(counts).forEach(function (id) {
      if (counts[id] > 1) errors.push("duplicate id #" + id);
    });

    var story = doc.getElementById("customer-network-story");
    if (story && !story.getAttribute("aria-live")) warnings.push("customer network story should expose aria-live");

    var result = Object.freeze({
      status: errors.length ? "FAILED" : "PASSED",
      errors: Object.freeze(errors.slice()),
      warnings: Object.freeze(warnings.slice())
    });
    root.MISSION_BOS_CUSTOMER_DASHBOARD_DOM_VALIDATION = result;
    return result;
  }

  root.validateMissionBosCustomerDashboardDom = validateCustomerDashboardDom;

  if (typeof document !== "undefined" && document.body) {
    validateCustomerDashboardDom(document);
  }
})(typeof window !== "undefined" ? window : globalThis);
