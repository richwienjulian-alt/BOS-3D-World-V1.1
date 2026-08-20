/* Mission BOS - Build 009N.4
   Compact Dashboard & Exploration Integration runtime.
   Structural UI integration only. No modules. No fetch. No automatic actions.
*/
(function () {
  "use strict";

  function create(options) {
    options = options || {};
    var plan = options.plan;
    var validator = options.validator;
    var elements = options.elements || {};
    var presenterRuntime = options.presenterRuntime;

    if (!plan || !validator || typeof validator.validate !== "function" || typeof validator.logResult !== "function") {
      console.error("Mission BOS exploration interface plan or validator is missing.");
      return createFailedRuntime("Exploration interface plan or validator missing.", null);
    }

    var validation = validator.validate(
      options.layout,
      options.missionPlan,
      options.presenterPlan,
      options.associationPlan,
      options.cellLoadPlan,
      options.handoverPlan,
      plan
    );
    validator.logResult(validation);

    if (!validation || validation.status !== "PASSED") {
      console.error("Mission BOS exploration interface validation failed. No fallback overlay is created.", validation);
      return createFailedRuntime("Exploration interface validation failed.", validation);
    }

    var requiredElements = (plan.presenterTarget && plan.presenterTarget.preserveElementIds) || [];
    var initialDefaultClosed = !!elements.presenterPanel &&
      String(elements.presenterPanel.tagName || "").toUpperCase() === "DETAILS" &&
      elements.presenterPanel.open !== true &&
      !elements.presenterPanel.hasAttribute("open");
    var disposed = false;
    var safetyTimer = 0;
    var lastSafetyStatus = null;

    function getUniqueElementCount(id) {
      if (!id || typeof document === "undefined" || !document.querySelectorAll) return 0;
      return document.querySelectorAll("#" + id).length;
    }

    function getPresenterSafety() {
      if (!presenterRuntime || typeof presenterRuntime.getSafetyStatus !== "function") {
        return { status: "FAILED", automaticCameraTransitions: 0, automaticMissionActions: 0 };
      }
      return presenterRuntime.getSafetyStatus() || { status: "FAILED" };
    }

    function getSummaryState() {
      var cameraState = presenterRuntime && typeof presenterRuntime.getCameraState === "function"
        ? presenterRuntime.getCameraState()
        : "FREE";
      if (cameraState === "TRANSITION") return "Kamerafahrt aktiv";
      if (cameraState === "BOOKMARK") return "Lesezeichen aktiv";
      var guided = presenterRuntime && typeof presenterRuntime.getGuidedMode === "function"
        ? presenterRuntime.getGuidedMode()
        : false;
      return guided ? "Demo-Steuerung" : "Freie Erkundung";
    }

    function updateSummary() {
      if (!elements.summaryState) return;
      var value = getSummaryState();
      var allowed = (plan.runtime && plan.runtime.summaryStateValues) || [];
      elements.summaryState.textContent = allowed.indexOf(value) >= 0 ? value : "Freie Erkundung";
    }

    function hasHorizontalOverflow() {
      if (!elements.infoPanel) return true;
      var clientWidth = Number(elements.infoPanel.clientWidth) || 0;
      var scrollWidth = Number(elements.infoPanel.scrollWidth) || 0;
      if (clientWidth <= 0 || scrollWidth <= 0) return false;
      return scrollWidth > clientWidth + 2;
    }

    function getManifest() {
      var expected = plan.expectedCounts || {};
      var presenterSafety = getPresenterSafety();
      var requiredFound = 0;
      requiredElements.forEach(function (id) {
        if (getUniqueElementCount(id) === 1) requiredFound += 1;
      });
      var actual = {
        infoPanels: getUniqueElementCount(plan.dashboard.infoPanelId),
        sceneOverlayPanels: elements.sceneContainer && elements.presenterPanel &&
          elements.sceneContainer.contains(elements.presenterPanel) ? 1 : 0,
        presenterPanels: getUniqueElementCount(plan.dashboard.demoControlSectionId),
        presenterRequiredElements: requiredFound,
        cameraBookmarks: (((options.presenterPlan || {}).camera || {}).bookmarks || []).length,
        actionableStates: Object.keys((((options.presenterPlan || {}).actionPolicy || {}).allowedActionsByState) || {}).length,
        newMissionButtons: typeof document !== "undefined"
          ? document.querySelectorAll("[data-exploration-mission-button='true']").length
          : 0,
        newNetworkPanels: typeof document !== "undefined"
          ? document.querySelectorAll("[data-exploration-network-panel='true']").length
          : 0,
        automaticCameraTransitions: Number(presenterSafety.automaticCameraTransitions) || 0,
        automaticMissionActions: Number(presenterSafety.automaticMissionActions) || 0
      };
      var passed = validation.status === "PASSED";
      Object.keys(expected).forEach(function (key) {
        if (Number(actual[key]) !== Number(expected[key])) passed = false;
      });
      return {
        title: "MISSION BOS EXPLORATION INTERFACE RUNTIME MANIFEST",
        status: passed ? "PASSED" : "FAILED",
        actual: actual,
        expected: expected
      };
    }

    function getSafetyStatus() {
      var presenterSafety = getPresenterSafety();
      var insideInfo = !!elements.infoPanel && !!elements.presenterPanel &&
        elements.infoPanel.contains(elements.presenterPanel);
      var outsideScene = !!elements.sceneContainer && !!elements.presenterPanel &&
        !elements.sceneContainer.contains(elements.presenterPanel);
      var correctElementType = !!elements.presenterPanel &&
        String(elements.presenterPanel.tagName || "").toUpperCase() === "DETAILS";
      var horizontalOverflow = hasHorizontalOverflow();
      var manifest = getManifest();
      var passed = validation.status === "PASSED" &&
        insideInfo && outsideScene && correctElementType && initialDefaultClosed &&
        presenterSafety.status === "PASSED" && !horizontalOverflow &&
        manifest.status === "PASSED";
      return {
        status: passed ? "PASSED" : "FAILED",
        presenterInsideInfoPanel: insideInfo ? "PASSED" : "FAILED",
        presenterOutsideSceneContainer: outsideScene ? "PASSED" : "FAILED",
        detailsElement: correctElementType ? "PASSED" : "FAILED",
        detailsDefaultClosed: initialDefaultClosed ? "PASSED" : "FAILED",
        presenterRuntime: presenterSafety.status === "PASSED" ? "PASSED" : "FAILED",
        horizontalOverflow: horizontalOverflow ? "FAILED" : "PASSED",
        automaticCameraTransitions: Number(presenterSafety.automaticCameraTransitions) || 0,
        automaticMissionActions: Number(presenterSafety.automaticMissionActions) || 0
      };
    }

    function logManifest() {
      var manifest = getManifest();
      var method = manifest.status === "PASSED" ? "log" : "error";
      console.group(manifest.title);
      console[method]("Info panels: " + manifest.actual.infoPanels + " / " + manifest.expected.infoPanels);
      console[method]("Scene overlay panels: " + manifest.actual.sceneOverlayPanels + " / " + manifest.expected.sceneOverlayPanels);
      console[method]("Presenter panels: " + manifest.actual.presenterPanels + " / " + manifest.expected.presenterPanels);
      console[method]("Presenter required elements: " + manifest.actual.presenterRequiredElements + " / " + manifest.expected.presenterRequiredElements);
      console[method]("Camera bookmarks: " + manifest.actual.cameraBookmarks + " / " + manifest.expected.cameraBookmarks);
      console[method]("Actionable states: " + manifest.actual.actionableStates + " / " + manifest.expected.actionableStates);
      console[method]("New mission buttons: " + manifest.actual.newMissionButtons + " / " + manifest.expected.newMissionButtons);
      console[method]("New network panels: " + manifest.actual.newNetworkPanels + " / " + manifest.expected.newNetworkPanels);
      console[method]("Automatic camera transitions: " + manifest.actual.automaticCameraTransitions + " / " + manifest.expected.automaticCameraTransitions);
      console[method]("Automatic mission actions: " + manifest.actual.automaticMissionActions + " / " + manifest.expected.automaticMissionActions);
      console[method]("STATUS: " + manifest.status);
      console.groupEnd();
    }

    function logSafety(force) {
      var safety = getSafetyStatus();
      if (!force && safety.status === lastSafetyStatus && safety.status === "PASSED") return;
      lastSafetyStatus = safety.status;
      var method = safety.status === "PASSED" ? "log" : "error";
      console.group("MISSION BOS EXPLORATION INTERFACE RUNTIME SAFETY");
      console[method]("Presenter inside info panel: " + safety.presenterInsideInfoPanel);
      console[method]("Presenter outside scene container: " + safety.presenterOutsideSceneContainer);
      console[method]("Details element: " + safety.detailsElement);
      console[method]("Details default closed: " + safety.detailsDefaultClosed);
      console[method]("Presenter runtime: " + safety.presenterRuntime);
      console[method]("Horizontal overflow: " + safety.horizontalOverflow);
      console[method]("STATUS: " + safety.status);
      console.groupEnd();
    }

    function update(delta, elapsed) {
      if (disposed) return;
      updateSummary();
      safetyTimer += Math.max(0, Number(delta) || 0);
      if (safetyTimer >= 0.25) {
        safetyTimer = 0;
        logSafety(false);
      }
      void elapsed;
    }

    function dispose() {
      disposed = true;
    }

    updateSummary();
    logManifest();
    logSafety(true);

    return {
      validation: validation,
      update: update,
      getManifest: getManifest,
      getSafetyStatus: getSafetyStatus,
      dispose: dispose
    };
  }

  function createFailedRuntime(message, validation) {
    return {
      validation: validation || null,
      update: function () {},
      getManifest: function () { return { status: "FAILED", message: message }; },
      getSafetyStatus: function () { return { status: "FAILED", message: message }; },
      dispose: function () {}
    };
  }

  window.MissionBosExplorationInterface = {
    create: create
  };
})();
