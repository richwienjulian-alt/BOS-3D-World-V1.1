/* Mission BOS - Build 009N.4
   Structural validator for Compact Dashboard & Exploration Integration.
   No Three.js dependency. No modules. No fetch.
*/
(function () {
  "use strict";

  function addError(errors, category, id, detail) {
    errors.push({ category: category, id: id || "", detail: detail || null });
  }

  function ids(items) {
    return (items || []).map(function (item) { return item && item.id; });
  }

  function sameStringArray(actual, expected) {
    if (!Array.isArray(actual) || !Array.isArray(expected) || actual.length !== expected.length) return false;
    for (var i = 0; i < expected.length; i += 1) {
      if (actual[i] !== expected[i]) return false;
    }
    return true;
  }

  function validate(layout, missionPlan, presenterPlan, associationPlan, cellLoadPlan, handoverPlan, plan) {
    var errors = [];
    var counts = {
      sourceDependencyErrors: 0,
      sourcePhaseErrors: 0,
      policyErrors: 0,
      dashboardDefinitionErrors: 0,
      presenterTargetErrors: 0,
      presenterCompatibilityErrors: 0,
      networkCompatibilityErrors: 0,
      runtimeContractErrors: 0,
      expectedCountErrors: 0
    };

    if (!layout || !missionPlan || !presenterPlan || !associationPlan || !cellLoadPlan || !handoverPlan || !plan) {
      addError(errors, "Source dependency", "root", "One or more required plans are missing.");
      counts.sourceDependencyErrors += 1;
      return createResult(errors, counts, {});
    }

    if (plan.buildBase !== "009N.3" || plan.sourcePhase !== "009N.3 Communication & Handover Visualization") {
      addError(errors, "Source phase", "buildBase/sourcePhase", {
        buildBase: plan.buildBase,
        sourcePhase: plan.sourcePhase
      });
      counts.sourcePhaseErrors += 1;
    }

    var policy = plan.policy || {};
    var requiredTrue = [
      "fileProtocolRequired",
      "existingRightDashboardMustRemain",
      "infoPanelIdMustRemain",
      "presenterControlsMustMoveIntoRightDashboard",
      "defaultFreeExplorationRequired",
      "existingPresenterElementIdsMustRemain",
      "existingMissionButtonsMustRemain",
      "existingNetworkRowsMustRemain"
    ];
    var requiredFalse = [
      "floatingPresenterOverlayAllowed",
      "newFloatingPanelAllowed",
      "secondDashboardAllowed",
      "demoControlsDefaultExpanded",
      "automaticCameraTakeoverAllowed",
      "automaticMissionActionAllowed",
      "automaticBOSActivationAllowed",
      "cityGeometryChangesAllowed",
      "staticPropChangesAllowed",
      "trafficChangesAllowed",
      "pedestrianChangesAllowed",
      "responseVehicleChangesAllowed",
      "missionLogicChangesAllowed",
      "networkAssociationChangesAllowed",
      "cellLoadChangesAllowed",
      "communicationLogicChangesAllowed",
      "handoverLogicChangesAllowed",
      "presenterBookmarksChangesAllowed",
      "presenterStateHintsChangesAllowed",
      "presenterActionPolicyChangesAllowed"
    ];

    requiredTrue.forEach(function (key) {
      if (policy[key] !== true) {
        addError(errors, "Policy", key, policy[key]);
        counts.policyErrors += 1;
      }
    });
    requiredFalse.forEach(function (key) {
      if (policy[key] !== false) {
        addError(errors, "Policy", key, policy[key]);
        counts.policyErrors += 1;
      }
    });
    if (Number(policy.infoPanelDesktopWidthMustRemainPx) !== 390) {
      addError(errors, "Policy", "infoPanelDesktopWidthMustRemainPx", policy.infoPanelDesktopWidthMustRemainPx);
      counts.policyErrors += 1;
    }

    var dashboard = plan.dashboard || {};
    if (
      dashboard.appId !== "app" ||
      dashboard.sceneContainerId !== "scene-container" ||
      dashboard.infoPanelId !== "info-panel" ||
      Number(dashboard.desktopWidthPx) !== 390 ||
      dashboard.demoControlSectionId !== "presenter-panel" ||
      dashboard.demoControlElementType !== "details" ||
      dashboard.defaultOpen !== false ||
      dashboard.sceneOverlayPanelCount !== 0 ||
      dashboard.horizontalOverflowAllowed !== false
    ) {
      addError(errors, "Dashboard definition", "dashboard", dashboard);
      counts.dashboardDefinitionErrors += 1;
    }

    var target = plan.presenterTarget || {};
    if (
      target.title !== "Demo & Kamera" ||
      target.modeLabel !== "Demo-Steuerung" ||
      target.freeModeLabel !== "Freie Erkundung" ||
      target.defaultGuidedMode !== false
    ) {
      addError(errors, "Presenter target", "labels/default", target);
      counts.presenterTargetErrors += 1;
    }

    var expectedBookmarkIds = [
      "CAM_CITY_OVERVIEW",
      "CAM_INCIDENT_W14",
      "CAM_COMMUNICATION_MAST_B"
    ];
    if (!sameStringArray(target.preserveCameraBookmarkIds, expectedBookmarkIds)) {
      addError(errors, "Presenter target", "bookmarkIds", target.preserveCameraBookmarkIds);
      counts.presenterTargetErrors += 1;
    }

    var expectedPresenterElementIds = [
      "presenter-panel",
      "presenter-mode-button",
      "presenter-hint-title",
      "presenter-hint-message",
      "presenter-camera-buttons",
      "presenter-next-button",
      "presenter-reset-button",
      "presenter-status"
    ];
    if (!sameStringArray(target.preserveElementIds, expectedPresenterElementIds)) {
      addError(errors, "Presenter target", "elementIds", target.preserveElementIds);
      counts.presenterTargetErrors += 1;
    }

    var currentBookmarkIds = ids((presenterPlan.camera || {}).bookmarks || []);
    if (!sameStringArray(currentBookmarkIds, expectedBookmarkIds)) {
      addError(errors, "Presenter compatibility", "cameraBookmarks", currentBookmarkIds);
      counts.presenterCompatibilityErrors += 1;
    }

    var allowedStates = Object.keys(((presenterPlan.actionPolicy || {}).allowedActionsByState) || {});
    var expectedStates = ["READY", "OVERLOADED", "COMPLETED"];
    if (!sameStringArray(allowedStates, expectedStates)) {
      addError(errors, "Presenter compatibility", "actionableStates", allowedStates);
      counts.presenterCompatibilityErrors += 1;
    }

    if (
      !associationPlan.expectedCounts || Number(associationPlan.expectedCounts.mobileEndpoints) !== 8 ||
      !cellLoadPlan.expectedCounts || Number(cellLoadPlan.expectedCounts.cells) !== 5 ||
      !handoverPlan.expectedCounts || Number(handoverPlan.expectedCounts.trackedEndpoints) !== 2
    ) {
      addError(errors, "Network compatibility", "expectedCounts", {
        association: associationPlan.expectedCounts,
        cellLoad: cellLoadPlan.expectedCounts,
        handover: handoverPlan.expectedCounts
      });
      counts.networkCompatibilityErrors += 1;
    }

    var runtime = plan.runtime || {};
    if (
      runtime.controllerGlobal !== "MissionBosExplorationInterface" ||
      runtime.createMethod !== "create" ||
      !sameStringArray(runtime.requiredMethods, ["update", "getManifest", "getSafetyStatus", "dispose"])
    ) {
      addError(errors, "Runtime contract", "runtime", runtime);
      counts.runtimeContractErrors += 1;
    }

    var expected = plan.expectedCounts || {};
    var actual = {
      infoPanels: 1,
      sceneOverlayPanels: dashboard.sceneOverlayPanelCount,
      presenterPanels: 1,
      presenterRequiredElements: target.preserveElementIds ? target.preserveElementIds.length : 0,
      cameraBookmarks: currentBookmarkIds.length,
      actionableStates: allowedStates.length,
      newMissionButtons: 0,
      newNetworkPanels: 0,
      automaticCameraTransitions: 0,
      automaticMissionActions: 0
    };
    Object.keys(expected).forEach(function (key) {
      if (Number(actual[key]) !== Number(expected[key])) {
        addError(errors, "Expected count", key, { expected: expected[key], actual: actual[key] });
        counts.expectedCountErrors += 1;
      }
    });

    return createResult(errors, counts, actual);
  }

  function createResult(errors, counts, actual) {
    var status = errors.length === 0 ? "PASSED" : "FAILED";
    return {
      title: "MISSION BOS EXPLORATION INTERFACE PLAN VALIDATION",
      status: status,
      counts: counts,
      actualCounts: actual,
      errors: errors,
      lines: [
        "MISSION BOS EXPLORATION INTERFACE PLAN VALIDATION",
        "Source dependency errors: " + counts.sourceDependencyErrors,
        "Source phase errors: " + counts.sourcePhaseErrors,
        "Policy errors: " + counts.policyErrors,
        "Dashboard definition errors: " + counts.dashboardDefinitionErrors,
        "Presenter target errors: " + counts.presenterTargetErrors,
        "Presenter compatibility errors: " + counts.presenterCompatibilityErrors,
        "Network compatibility errors: " + counts.networkCompatibilityErrors,
        "Runtime contract errors: " + counts.runtimeContractErrors,
        "Expected count errors: " + counts.expectedCountErrors,
        "STATUS: " + status
      ]
    };
  }

  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    result.lines.slice(1).forEach(function (line) { console[method](line); });
    if (result.errors.length) {
      console.group("Affected interface definitions");
      result.errors.forEach(function (error) { console.error(error.category + ": " + error.id, error); });
      console.groupEnd();
    }
    console.groupEnd();
  }

  window.MissionBosExplorationInterfaceValidator = {
    validate: validate,
    logResult: logResult
  };
})();
