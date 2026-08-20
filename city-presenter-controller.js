/* Mission BOS - Build 008R.11
   Validated Presenter & Demo Control.
   No modules. No fetch. No automatic camera takeover or mission action.
*/
(function () {
  "use strict";

  var CAMERA_STATE = Object.freeze({
    FREE: "FREE",
    TRANSITION: "TRANSITION",
    BOOKMARK: "BOOKMARK"
  });

  function finite(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function easeInOutCubic(value) {
    var t = clamp(value, 0, 1);
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function normalizeAngle(angle) {
    var value = angle;
    while (value > Math.PI) value -= Math.PI * 2;
    while (value < -Math.PI) value += Math.PI * 2;
    return value;
  }

  function lerpAngle(start, end, amount) {
    return start + normalizeAngle(end - start) * amount;
  }

  function copyPose(pose) {
    return {
      position: {
        x: finite(pose && pose.position && pose.position.x, 0),
        y: finite(pose && pose.position && pose.position.y, 8),
        z: finite(pose && pose.position && pose.position.z, 0)
      },
      yaw: finite(pose && pose.yaw, 0),
      pitch: finite(pose && pose.pitch, -0.28),
      fov: finite(pose && pose.fov, 65)
    };
  }

  function poseFromBookmark(bookmark) {
    var dx = Number(bookmark.target.x) - Number(bookmark.position.x);
    var dy = Number(bookmark.target.y) - Number(bookmark.position.y);
    var dz = Number(bookmark.target.z) - Number(bookmark.position.z);
    var horizontal = Math.sqrt(dx * dx + dz * dz);
    return {
      position: {
        x: Number(bookmark.position.x),
        y: Number(bookmark.position.y),
        z: Number(bookmark.position.z)
      },
      yaw: Math.atan2(-dx, -dz),
      pitch: Math.atan2(dy, Math.max(horizontal, 0.000001)),
      fov: Number(bookmark.fov)
    };
  }

  function findById(items, id) {
    var list = items || [];
    for (var i = 0; i < list.length; i += 1) {
      if (list[i] && list[i].id === id) return list[i];
    }
    return null;
  }

  function create(options) {
    options = options || {};

    var layout = options.layout;
    var missionPlan = options.missionPlan;
    var plan = options.plan;
    var validator = options.validator;
    var missionRuntime = options.missionRuntime;
    var cameraAdapter = options.cameraAdapter;
    var resetAdapter = options.resetAdapter;
    var elements = options.elements || {};

    if (!validator || typeof validator.validate !== "function" || typeof validator.logResult !== "function") {
      console.error("MISSION BOS PRESENTER: Presenter validator is missing.");
      return createFailedRuntime("Presenter validator is missing.");
    }

    var validation = validator.validate(layout, missionPlan, plan);
    validator.logResult(validation);

    var requiredElementNames = [
      "panel", "modeButton", "hintTitle", "hintMessage", "cameraButtons",
      "nextButton", "resetButton", "status"
    ];
    var missingElements = requiredElementNames.filter(function (key) { return !elements[key]; });
    var missionAvailable = missionRuntime &&
      typeof missionRuntime.getState === "function" &&
      typeof missionRuntime.start === "function" &&
      typeof missionRuntime.activateBOS === "function" &&
      typeof missionRuntime.finishAndReturn === "function";
    var cameraAvailable = cameraAdapter &&
      typeof cameraAdapter.getPose === "function" &&
      typeof cameraAdapter.applyPose === "function" &&
      typeof cameraAdapter.releaseToFree === "function" &&
      typeof cameraAdapter.stopVelocity === "function";
    var resetAvailable = resetAdapter && typeof resetAdapter.resetReadyBaseline === "function";

    if (
      !validation || validation.status !== "PASSED" ||
      !plan || missingElements.length || !missionAvailable || !cameraAvailable || !resetAvailable
    ) {
      if (missingElements.length) {
        console.error("MISSION BOS PRESENTER: Missing DOM elements: " + missingElements.join(", "));
      }
      if (!missionAvailable) console.error("MISSION BOS PRESENTER: Mission runtime is unavailable.");
      if (!cameraAvailable) console.error("MISSION BOS PRESENTER: Camera adapter is unavailable.");
      if (!resetAvailable) console.error("MISSION BOS PRESENTER: Reset adapter is unavailable.");
      if (elements.panel) elements.panel.hidden = true;
      return createFailedRuntime("Presenter dependencies or validation failed.", validation);
    }

    var bookmarks = (plan.camera && plan.camera.bookmarks) || [];
    var missionCameraProfiles = (plan.camera && plan.camera.missionCameraProfiles) || {};
    var hints = plan.stateHints || {};
    var panelConfig = plan.presenterPanel || {};
    var actionPolicy = plan.actionPolicy || {};
    var allowedActions = actionPolicy.allowedActionsByState || {};
    var resetBehavior = actionPolicy.resetBehavior || {};
    var transitionSeconds = Math.max(0.2, finite(plan.camera.transitionSeconds, 1.15));
    var manualReleaseKeys = (plan.camera.manualReleaseKeys || []).slice();

    var guidedMode = panelConfig.defaultGuidedMode !== false;
    var cameraState = CAMERA_STATE.FREE;
    var activeBookmarkId = null;
    var transitionElapsed = 0;
    var transitionStart = null;
    var transitionEnd = null;
    var lastMissionState = null;
    var lastMissionProfileId = null;
    var resetPending = false;
    var disposed = false;
    var automaticCameraTransitions = 0;
    var automaticMissionActions = 0;
    var unauthorizedActionAttempts = 0;
    var listeners = [];
    var buttonsById = Object.create(null);

    elements.panel.hidden = panelConfig.defaultVisible === false;
    elements.panel.dataset.presenterState = "ready";
    elements.cameraButtons.innerHTML = "";

    bookmarks.forEach(function (bookmark) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "presenter-camera-button";
      button.textContent = bookmark.shortLabel;
      button.title = bookmark.label + " – " + bookmark.purpose;
      button.dataset.bookmarkId = bookmark.id;
      button.setAttribute("aria-label", bookmark.label);
      addListener(button, "click", function () {
        selectBookmark(bookmark.id, "button");
      });
      buttonsById[bookmark.id] = button;
      elements.cameraButtons.appendChild(button);
    });

    addListener(elements.modeButton, "click", toggleGuidedMode);
    addListener(elements.nextButton, "click", executeNextAction);
    addListener(elements.resetButton, "click", requestReset);

    function addListener(target, type, handler) {
      target.addEventListener(type, handler);
      listeners.push({ target: target, type: type, handler: handler });
    }

    function getMissionState() {
      var state = missionRuntime.getState();
      if (missionRuntime && typeof missionRuntime.getPresenterContext === "function") return state || "FAILED";
      return hints[state] ? state : "FAILED";
    }

    function getMissionProfileId() {
      if (missionRuntime && typeof missionRuntime.getPresenterContext === "function") {
        var liveContext = missionRuntime.getPresenterContext();
        if (liveContext && liveContext.missionId && missionCameraProfiles[liveContext.missionId]) return liveContext.missionId;
      }
      return missionCameraProfiles.MISSION_001 ? "MISSION_001" : null;
    }

    function getMissionCameraProfile() {
      var missionId = getMissionProfileId();
      return missionId ? missionCameraProfiles[missionId] || null : null;
    }

    function resolveBookmark(bookmarkId) {
      var base = findById(bookmarks, bookmarkId);
      if (!base) return null;
      var profile = getMissionCameraProfile();
      var overrides = profile && profile.bookmarkOverrides ? profile.bookmarkOverrides : null;
      var override = overrides && overrides[bookmarkId] ? overrides[bookmarkId] : null;
      if (!override) return base;
      return {
        id: base.id,
        label: override.label || base.label,
        shortLabel: override.shortLabel || base.shortLabel,
        keyCode: override.keyCode || base.keyCode,
        position: override.position || base.position,
        target: override.target || base.target,
        fov: Number(override.fov) || Number(base.fov),
        purpose: override.purpose || base.purpose
      };
    }

    function applyMissionCameraRecommendation(state, hint) {
      var profile = getMissionCameraProfile();
      var map = profile && profile.recommendedBookmarkByState ? profile.recommendedBookmarkByState : null;
      var recommended = map && map[state] ? map[state] : null;
      if (!recommended || !resolveBookmark(recommended)) return hint;
      return {
        title: hint.title,
        message: hint.message,
        recommendedBookmarkId: recommended,
        nextAction: hint.nextAction,
        nextActionLabel: hint.nextActionLabel
      };
    }

    function updateCameraButtonMetadata() {
      Object.keys(buttonsById).forEach(function (bookmarkId) {
        var bookmark = resolveBookmark(bookmarkId);
        var button = buttonsById[bookmarkId];
        if (!bookmark || !button) return;
        button.title = bookmark.label + " – " + bookmark.purpose;
        button.setAttribute("aria-label", bookmark.label);
      });
      var profileId = getMissionProfileId();
      elements.cameraButtons.dataset.missionCameraProfile = profileId || "LEGACY";
    }

    function releaseBookmarkForMissionProfileChange() {
      if (cameraState === CAMERA_STATE.FREE) return;
      cameraAdapter.releaseToFree();
      cameraState = CAMERA_STATE.FREE;
      activeBookmarkId = null;
      transitionStart = null;
      transitionEnd = null;
      transitionElapsed = 0;
      updateCameraButtonClasses();
    }

    function getHint(state) {
      var hint = null;
      if (missionRuntime && typeof missionRuntime.getPresenterContext === "function") {
        var liveContext = missionRuntime.getPresenterContext();
        if (liveContext && liveContext.hint) hint = liveContext.hint;
      }
      if (!hint) {
        hint = hints[state] || hints.FAILED || {
          title: "Sicherheitsstopp",
          message: "Presenter-Hinweis ist nicht verfügbar.",
          recommendedBookmarkId: plan.camera.defaultBookmarkId,
          nextAction: "NONE",
          nextActionLabel: "Nicht verfügbar"
        };
      }
      if (hint.nextAction === "ACTIVATE_BOS") {
        hint = {
          title: hint.title,
          message: hint.message + " Die BOS-Spur aktiviert sich automatisch, sobald Rot und ein BOS-Endpunkt in derselben Zelle bestätigt sind.",
          recommendedBookmarkId: hint.recommendedBookmarkId,
          nextAction: "NONE",
          nextActionLabel: "Automatische BOS-Spur"
        };
      }
      return applyMissionCameraRecommendation(state, hint);
    }

    function isActionAllowed(state, actionId) {
      if (missionRuntime && typeof missionRuntime.isPresenterActionAllowed === "function") {
        return missionRuntime.isPresenterActionAllowed(actionId) === true;
      }
      var allowed = allowedActions[state] || [];
      return allowed.length === 1 && allowed[0] === actionId;
    }

    function selectBookmark(bookmarkId, source) {
      if (disposed) return false;
      var bookmark = resolveBookmark(bookmarkId);
      if (!bookmark) return false;
      var manualSource = source || "api";
      if (manualSource !== "button" && manualSource !== "keyboard" && manualSource !== "reset" && manualSource !== "api") {
        automaticCameraTransitions += 1;
        updatePanel(true);
        return false;
      }

      transitionStart = copyPose(cameraAdapter.getPose());
      transitionEnd = poseFromBookmark(bookmark);
      transitionElapsed = 0;
      activeBookmarkId = bookmark.id;
      cameraState = CAMERA_STATE.TRANSITION;
      cameraAdapter.stopVelocity();
      updateCameraButtonClasses();
      updateStatusText();
      return true;
    }

    function updateCamera(delta) {
      if (disposed || cameraState === CAMERA_STATE.FREE) return false;

      if (cameraState === CAMERA_STATE.TRANSITION) {
        transitionElapsed += Math.max(0, finite(delta, 0));
        var progress = clamp(transitionElapsed / transitionSeconds, 0, 1);
        var eased = easeInOutCubic(progress);
        var pose = {
          position: {
            x: transitionStart.position.x + (transitionEnd.position.x - transitionStart.position.x) * eased,
            y: transitionStart.position.y + (transitionEnd.position.y - transitionStart.position.y) * eased,
            z: transitionStart.position.z + (transitionEnd.position.z - transitionStart.position.z) * eased
          },
          yaw: lerpAngle(transitionStart.yaw, transitionEnd.yaw, eased),
          pitch: transitionStart.pitch + (transitionEnd.pitch - transitionStart.pitch) * eased,
          fov: transitionStart.fov + (transitionEnd.fov - transitionStart.fov) * eased
        };
        cameraAdapter.applyPose(pose);
        if (progress >= 1) {
          cameraState = CAMERA_STATE.BOOKMARK;
          cameraAdapter.applyPose(transitionEnd);
          updateStatusText();
        }
        return true;
      }

      if (cameraState === CAMERA_STATE.BOOKMARK && transitionEnd) {
        cameraAdapter.applyPose(transitionEnd);
        return true;
      }

      return false;
    }

    function notifyManualInput(inputCode) {
      if (disposed) return false;
      var isReleaseInput = inputCode === "MOUSE_MOVE" || inputCode === "MOUSE_WHEEL" || manualReleaseKeys.indexOf(inputCode) >= 0;
      if (!isReleaseInput || cameraState === CAMERA_STATE.FREE) return false;

      cameraAdapter.releaseToFree();
      cameraState = CAMERA_STATE.FREE;
      activeBookmarkId = null;
      transitionStart = null;
      transitionEnd = null;
      transitionElapsed = 0;
      updateCameraButtonClasses();
      updateStatusText();
      return true;
    }

    function toggleGuidedMode() {
      if (disposed) return false;
      guidedMode = !guidedMode;
      if (guidedMode) {
        var state = getMissionState();
        var hint = getHint(state);
        if (hint.nextAction === "START_MISSION" && isActionAllowed(state, "START_MISSION")) {
          missionRuntime.start();
        }
      }
      updatePanel(true);
      return guidedMode;
    }

    function executeNextAction() {
      if (disposed || !guidedMode) return false;
      var state = getMissionState();
      var hint = getHint(state);
      var actionId = hint.nextAction;
      if (actionId === "NONE" || !isActionAllowed(state, actionId)) {
        unauthorizedActionAttempts += 1;
        updatePanel(true);
        return false;
      }

      var result = false;
      if (actionId === "START_MISSION") result = missionRuntime.start();
      // ACTIVATE_BOS is intentionally not executed in Build 011N.1; activation is automatic.
      if (actionId === "FINISH_AND_RETURN") result = missionRuntime.finishAndReturn();
      updatePanel(true);
      return result === true;
    }

    function requestReset() {
      if (disposed) return false;
      var state = getMissionState();
      var behavior = state === "READY"
        ? resetBehavior.READY
        : state === "COMPLETED"
          ? resetBehavior.COMPLETED
          : state === "RETURNING"
            ? resetBehavior.RETURNING
            : resetBehavior.ACTIVE_OTHER;

      if (behavior === "RESET_VIEW_AND_BASELINE") {
        if (!resetAdapter.resetReadyBaseline()) return false;
        resetPending = false;
        selectBookmark(plan.camera.defaultBookmarkId, "reset");
        updatePanel(true);
        return true;
      }

      if (behavior === "FINISH_AND_RETURN") {
        var accepted = missionRuntime.finishAndReturn();
        if (accepted) resetPending = true;
        updatePanel(true);
        return accepted === true;
      }

      updatePanel(true);
      return false;
    }

    function update(delta, elapsed) {
      if (disposed) return;
      var state = getMissionState();
      var missionProfileId = getMissionProfileId();
      if (missionProfileId !== lastMissionProfileId) {
        lastMissionProfileId = missionProfileId;
        releaseBookmarkForMissionProfileChange();
        updateCameraButtonMetadata();
        updatePanel(true);
      } else if (state !== lastMissionState) {
        lastMissionState = state;
        updatePanel(true);
      } else {
        updatePanel(false);
      }
      if (resetPending && state === "READY") {
        resetPending = false;
        updatePanel(true);
      }
      void delta;
      void elapsed;
    }

    function updatePanel(force) {
      if (disposed) return;
      var state = getMissionState();
      var hint = getHint(state);
      var actionable = hint.nextAction !== "NONE" && isActionAllowed(state, hint.nextAction);

      elements.panel.dataset.presenterState = state.toLowerCase();
      elements.panel.dataset.guided = guidedMode ? "true" : "false";
      elements.modeButton.textContent = guidedMode
        ? panelConfig.modeLabel
        : panelConfig.freeModeLabel;
      elements.modeButton.classList.toggle("active", guidedMode);
      elements.modeButton.setAttribute("aria-pressed", guidedMode ? "true" : "false");
      elements.hintTitle.textContent = hint.title;
      elements.hintMessage.textContent = hint.message;
      elements.nextButton.textContent = hint.nextActionLabel;
      elements.nextButton.disabled = !guidedMode || !actionable;
      elements.nextButton.classList.toggle("available", guidedMode && actionable);

      var resetBehaviorId = state === "READY"
        ? resetBehavior.READY
        : state === "COMPLETED"
          ? resetBehavior.COMPLETED
          : state === "RETURNING"
            ? resetBehavior.RETURNING
            : resetBehavior.ACTIVE_OTHER;

      if (resetBehaviorId === "RESET_VIEW_AND_BASELINE") {
        elements.resetButton.textContent = panelConfig.resetLabel;
        elements.resetButton.disabled = false;
      } else if (resetBehaviorId === "FINISH_AND_RETURN") {
        elements.resetButton.textContent = "Rückfahrt & Reset";
        elements.resetButton.disabled = false;
      } else if (resetBehaviorId === "WAIT_FOR_CONTROLLED_RESET") {
        elements.resetButton.textContent = "Reset läuft";
        elements.resetButton.disabled = true;
      } else {
        elements.resetButton.textContent = "Reset nach Einsatzabschluss";
        elements.resetButton.disabled = true;
      }

      updateCameraButtonMetadata();
      Object.keys(buttonsById).forEach(function (bookmarkId) {
        buttonsById[bookmarkId].classList.toggle(
          "recommended",
          guidedMode && bookmarkId === hint.recommendedBookmarkId
        );
      });
      updateCameraButtonClasses();
      updateStatusText();
      if (force) logRuntimeSafety(false);
    }

    function updateCameraButtonClasses() {
      Object.keys(buttonsById).forEach(function (bookmarkId) {
        buttonsById[bookmarkId].classList.toggle(
          "active",
          bookmarkId === activeBookmarkId && cameraState !== CAMERA_STATE.FREE
        );
      });
    }

    function updateStatusText() {
      var state = getMissionState();
      var hint = getHint(state);
      var cameraText = "Freie Kamera";
      if (cameraState === CAMERA_STATE.TRANSITION) cameraText = "Kamerafahrt aktiv";
      if (cameraState === CAMERA_STATE.BOOKMARK) {
        var active = resolveBookmark(activeBookmarkId);
        cameraText = active ? active.label : "Lesezeichen aktiv";
      }
      var recommended = resolveBookmark(hint.recommendedBookmarkId);
      elements.status.textContent = cameraText +
        " · Empfehlung: " + (recommended ? recommended.shortLabel : "-") +
        " · " + (guidedMode ? panelConfig.modeLabel : panelConfig.freeModeLabel);
    }

    function getManifest() {
      var expected = plan.expectedCounts || {};
      var actual = {
        cameraBookmarks: Object.keys(buttonsById).length,
        stateHints: Object.keys(hints).length,
        actionableStates: Object.keys(allowedActions).length,
        automaticCameraTransitions: automaticCameraTransitions,
        automaticMissionActions: automaticMissionActions
      };
      var passed = validation.status === "PASSED" &&
        actual.cameraBookmarks === Number(expected.cameraBookmarks) &&
        actual.stateHints === Number(expected.stateHints) &&
        actual.actionableStates === Number(expected.actionableStates) &&
        actual.automaticCameraTransitions === Number(expected.automaticCameraTransitions) &&
        actual.automaticMissionActions === Number(expected.automaticMissionActions);
      return {
        title: "MISSION BOS PRESENTER & DEMO CONTROL MANIFEST",
        status: passed ? "PASSED" : "FAILED",
        actual: actual,
        expected: expected
      };
    }

    function getSafetyStatus() {
      var manifest = getManifest();
      var passed = validation.status === "PASSED" &&
        !missingElements.length && missionAvailable && cameraAvailable && resetAvailable &&
        automaticCameraTransitions === 0 && automaticMissionActions === 0 &&
        unauthorizedActionAttempts === 0 && manifest.status === "PASSED";
      return {
        status: passed ? "PASSED" : "FAILED",
        planValidation: validation.status,
        domElements: missingElements.length ? "FAILED" : "PASSED",
        missionRuntime: missionAvailable ? "PASSED" : "FAILED",
        cameraAdapter: cameraAvailable ? "PASSED" : "FAILED",
        automaticCameraTransitions: automaticCameraTransitions,
        automaticMissionActions: automaticMissionActions,
        unauthorizedActionAttempts: unauthorizedActionAttempts,
        cameraState: cameraState,
        guidedMode: guidedMode,
        activeMissionCameraProfile: getMissionProfileId()
      };
    }

    function logManifest() {
      var manifest = getManifest();
      var method = manifest.status === "PASSED" ? "log" : "error";
      console.group(manifest.title);
      console[method]("Camera bookmarks: " + manifest.actual.cameraBookmarks + " / " + manifest.expected.cameraBookmarks);
      console[method]("State hints: " + manifest.actual.stateHints + " / " + manifest.expected.stateHints);
      console[method]("Actionable states: " + manifest.actual.actionableStates + " / " + manifest.expected.actionableStates);
      console[method]("Automatic camera transitions: " + manifest.actual.automaticCameraTransitions + " / " + manifest.expected.automaticCameraTransitions);
      console[method]("Automatic mission actions: " + manifest.actual.automaticMissionActions + " / " + manifest.expected.automaticMissionActions);
      console[method]("STATUS: " + manifest.status);
      console.groupEnd();
    }

    function logRuntimeSafety(force) {
      var safety = getSafetyStatus();
      if (!force && safety.status === "PASSED") return;
      var method = safety.status === "PASSED" ? "log" : "error";
      console.group("MISSION BOS PRESENTER & DEMO CONTROL RUNTIME SAFETY");
      console[method]("Plan validation: " + safety.planValidation);
      console[method]("DOM elements: " + safety.domElements);
      console[method]("Mission runtime: " + safety.missionRuntime);
      console[method]("Camera adapter: " + safety.cameraAdapter);
      console[method]("Automatic camera transitions: " + safety.automaticCameraTransitions);
      console[method]("Automatic mission actions: " + safety.automaticMissionActions);
      console[method]("Unauthorized actions: " + safety.unauthorizedActionAttempts);
      console[method]("STATUS: " + safety.status);
      console.groupEnd();
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      listeners.forEach(function (entry) {
        entry.target.removeEventListener(entry.type, entry.handler);
      });
      listeners.length = 0;
      elements.cameraButtons.innerHTML = "";
    }

    lastMissionProfileId = getMissionProfileId();
    updateCameraButtonMetadata();
    updatePanel(true);
    logManifest();
    logRuntimeSafety(true);

    return {
      validation: validation,
      update: update,
      updateCamera: updateCamera,
      notifyManualInput: notifyManualInput,
      selectBookmark: selectBookmark,
      toggleGuidedMode: toggleGuidedMode,
      executeNextAction: executeNextAction,
      requestReset: requestReset,
      getManifest: getManifest,
      getSafetyStatus: getSafetyStatus,
      getGuidedMode: function () { return guidedMode; },
      getCameraState: function () { return cameraState; },
      getActiveBookmarkId: function () { return activeBookmarkId; },
      dispose: dispose
    };
  }

  function createFailedRuntime(message, validation) {
    return {
      validation: validation || null,
      update: function () {},
      updateCamera: function () { return false; },
      notifyManualInput: function () { return false; },
      selectBookmark: function () { return false; },
      toggleGuidedMode: function () { return false; },
      executeNextAction: function () { return false; },
      requestReset: function () { return false; },
      getManifest: function () {
        return { status: "FAILED", message: message || "Presenter unavailable." };
      },
      getSafetyStatus: function () {
        return { status: "FAILED", message: message || "Presenter unavailable." };
      },
      getGuidedMode: function () { return false; },
      getCameraState: function () { return CAMERA_STATE.FREE; },
      getActiveBookmarkId: function () { return null; },
      dispose: function () {}
    };
  }

  window.MissionBosPresenterController = {
    create: create
  };
})();
