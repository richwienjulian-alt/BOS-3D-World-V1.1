/* Mission BOS - Build 008R.11
   Structural validator for the deterministic presenter plan.
   No Three.js dependency. No modules. No fetch.
*/
(function () {
  "use strict";

  var REQUIRED_STATES = [
    "READY", "CALL_RECEIVED", "CLEARING_CORRIDOR", "DISPATCHING",
    "ENROUTE", "ON_SCENE", "OVERLOADED", "BOS_ACTIVE",
    "COMMS_STABLE", "COMPLETED", "RETURNING", "FAILED"
  ];
  var VALID_ACTIONS = ["NONE", "START_MISSION", "ACTIVATE_BOS", "FINISH_AND_RETURN"];

  function finite(value) {
    var number = Number(value);
    return isFinite(number) ? number : null;
  }

  function addError(errors, category, id, detail) {
    errors.push({ category: category, id: id || "", detail: detail || null });
  }

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      if (items[i] && items[i].id === id) return items[i];
    }
    return null;
  }

  function pointInsideRect(point, rect, padding) {
    var p = Number(padding) || 0;
    return point.x >= Number(rect.x) - Number(rect.width) / 2 - p &&
      point.x <= Number(rect.x) + Number(rect.width) / 2 + p &&
      point.z >= Number(rect.z) - Number(rect.depth) / 2 - p &&
      point.z <= Number(rect.z) + Number(rect.depth) / 2 + p;
  }

  function validate(layout, missionPlan, presenterPlan) {
    var errors = [];
    var counts = {
      sourceDependencyErrors: 0,
      sourcePhaseErrors: 0,
      policyErrors: 0,
      bookmarkDefinitionErrors: 0,
      bookmarkBoundsErrors: 0,
      bookmarkObstacleErrors: 0,
      bookmarkDuplicateErrors: 0,
      stateHintErrors: 0,
      actionPolicyErrors: 0,
      resetPolicyErrors: 0,
      expectedCountErrors: 0
    };

    if (!layout || !missionPlan || !presenterPlan) {
      addError(errors, "Source dependency", "root", "Layout, mission plan or presenter plan missing.");
      counts.sourceDependencyErrors += 1;
      return createResult(errors, counts, {});
    }

    if (presenterPlan.buildBase !== "008R.10" || presenterPlan.sourcePhase !== "008R.10 Validated Telekom Communication Experience") {
      addError(errors, "Source phase", "buildBase/sourcePhase", {
        buildBase: presenterPlan.buildBase,
        sourcePhase: presenterPlan.sourcePhase
      });
      counts.sourcePhaseErrors += 1;
    }

    var policy = presenterPlan.policy || {};
    var requiredFalse = [
      "automaticCameraTakeoverAllowed", "automaticMissionStartAllowed",
      "automaticBOSActivationAllowed", "automaticMissionFinishAllowed",
      "hardResetDuringActiveMissionAllowed", "missionStateChangesAllowed",
      "networkPolicyChangesAllowed", "cityGeometryChangesAllowed",
      "staticPropChangesAllowed", "trafficChangesAllowed", "pedestrianChangesAllowed",
      "responseVehicleChangesAllowed", "communicationExperienceChangesAllowed"
    ];
    requiredFalse.forEach(function (key) {
      if (policy[key] !== false) {
        addError(errors, "Policy", key, policy[key]);
        counts.policyErrors += 1;
      }
    });
    if (policy.fileProtocolRequired !== true || policy.freeCameraMustRemainAvailable !== true || policy.manualInputReleasesCameraBookmark !== true) {
      addError(errors, "Policy", "requiredTruePolicies", policy);
      counts.policyErrors += 1;
    }

    var camera = presenterPlan.camera || {};
    var bounds = camera.worldBounds || {};
    var bookmarks = camera.bookmarks || [];
    var ids = Object.create(null);
    var keys = Object.create(null);
    var buildings = layout.buildings || [];
    var towers = layout.mobileTowers || [];

    bookmarks.forEach(function (bookmark) {
      if (!bookmark || !bookmark.id || !bookmark.label || !bookmark.shortLabel || !bookmark.keyCode || !bookmark.position || !bookmark.target) {
        addError(errors, "Bookmark definition", bookmark && bookmark.id, bookmark);
        counts.bookmarkDefinitionErrors += 1;
        return;
      }
      if (ids[bookmark.id] || keys[bookmark.keyCode]) {
        addError(errors, "Bookmark duplicate", bookmark.id, bookmark.keyCode);
        counts.bookmarkDuplicateErrors += 1;
      }
      ids[bookmark.id] = true;
      keys[bookmark.keyCode] = true;

      var position = {
        x: finite(bookmark.position.x), y: finite(bookmark.position.y), z: finite(bookmark.position.z)
      };
      var target = {
        x: finite(bookmark.target.x), y: finite(bookmark.target.y), z: finite(bookmark.target.z)
      };
      var fov = finite(bookmark.fov);
      if (position.x === null || position.y === null || position.z === null || target.x === null || target.y === null || target.z === null || fov === null || fov < 35 || fov > 75) {
        addError(errors, "Bookmark definition", bookmark.id, { position: position, target: target, fov: fov });
        counts.bookmarkDefinitionErrors += 1;
        return;
      }
      if (
        position.x < Number(bounds.xMin) || position.x > Number(bounds.xMax) ||
        position.z < Number(bounds.zMin) || position.z > Number(bounds.zMax) ||
        position.y < Number(bounds.yMin) || position.y > Number(bounds.yMax) ||
        target.x < Number(bounds.xMin) || target.x > Number(bounds.xMax) ||
        target.z < Number(bounds.zMin) || target.z > Number(bounds.zMax)
      ) {
        addError(errors, "Bookmark bounds", bookmark.id, { position: position, target: target, bounds: bounds });
        counts.bookmarkBoundsErrors += 1;
      }
      if (position.y < 20) {
        buildings.forEach(function (building) {
          if (building.worldRect && pointInsideRect(position, building.worldRect, 1.0)) {
            addError(errors, "Bookmark obstacle", bookmark.id, { buildingId: building.id });
            counts.bookmarkObstacleErrors += 1;
          }
        });
        towers.forEach(function (tower) {
          if (tower.worldRect && pointInsideRect(position, tower.worldRect, 1.0)) {
            addError(errors, "Bookmark obstacle", bookmark.id, { towerId: tower.id });
            counts.bookmarkObstacleErrors += 1;
          }
        });
      }
    });

    if (!findById(bookmarks, camera.defaultBookmarkId)) {
      addError(errors, "Bookmark definition", "defaultBookmarkId", camera.defaultBookmarkId);
      counts.bookmarkDefinitionErrors += 1;
    }
    var transitionSeconds = finite(camera.transitionSeconds);
    if (transitionSeconds === null || transitionSeconds < 0.2 || transitionSeconds > 3.0) {
      addError(errors, "Bookmark definition", "transitionSeconds", camera.transitionSeconds);
      counts.bookmarkDefinitionErrors += 1;
    }

    var hints = presenterPlan.stateHints || {};
    REQUIRED_STATES.forEach(function (stateId) {
      var hint = hints[stateId];
      if (!hint || !hint.title || !hint.message || !hint.recommendedBookmarkId || VALID_ACTIONS.indexOf(hint.nextAction) < 0 || !hint.nextActionLabel) {
        addError(errors, "State hint", stateId, hint);
        counts.stateHintErrors += 1;
        return;
      }
      if (!findById(bookmarks, hint.recommendedBookmarkId)) {
        addError(errors, "State hint", stateId, { missingBookmark: hint.recommendedBookmarkId });
        counts.stateHintErrors += 1;
      }
    });
    Object.keys(hints).forEach(function (stateId) {
      if (REQUIRED_STATES.indexOf(stateId) < 0) {
        addError(errors, "State hint", stateId, "Unknown state.");
        counts.stateHintErrors += 1;
      }
    });

    var allowed = (presenterPlan.actionPolicy || {}).allowedActionsByState || {};
    var exactAllowed = {
      READY: ["START_MISSION"],
      OVERLOADED: ["ACTIVATE_BOS"],
      COMPLETED: ["FINISH_AND_RETURN"]
    };
    Object.keys(exactAllowed).forEach(function (stateId) {
      var actual = allowed[stateId] || [];
      if (actual.length !== 1 || actual[0] !== exactAllowed[stateId][0]) {
        addError(errors, "Action policy", stateId, actual);
        counts.actionPolicyErrors += 1;
      }
    });
    Object.keys(allowed).forEach(function (stateId) {
      if (!exactAllowed[stateId]) {
        addError(errors, "Action policy", stateId, allowed[stateId]);
        counts.actionPolicyErrors += 1;
      }
    });

    if (hints.READY && hints.READY.nextAction !== "START_MISSION") counts.actionPolicyErrors += 1;
    if (hints.OVERLOADED && hints.OVERLOADED.nextAction !== "ACTIVATE_BOS") counts.actionPolicyErrors += 1;
    if (hints.COMPLETED && hints.COMPLETED.nextAction !== "FINISH_AND_RETURN") counts.actionPolicyErrors += 1;
    REQUIRED_STATES.forEach(function (stateId) {
      if (stateId !== "READY" && stateId !== "OVERLOADED" && stateId !== "COMPLETED" && hints[stateId] && hints[stateId].nextAction !== "NONE") {
        addError(errors, "Action policy", stateId, hints[stateId].nextAction);
        counts.actionPolicyErrors += 1;
      }
    });

    var reset = (presenterPlan.actionPolicy || {}).resetBehavior || {};
    if (reset.READY !== "RESET_VIEW_AND_BASELINE" || reset.COMPLETED !== "FINISH_AND_RETURN" || reset.RETURNING !== "WAIT_FOR_CONTROLLED_RESET" || reset.ACTIVE_OTHER !== "DISABLED") {
      addError(errors, "Reset policy", "resetBehavior", reset);
      counts.resetPolicyErrors += 1;
    }

    var actualCounts = {
      cameraBookmarks: bookmarks.length,
      stateHints: Object.keys(hints).length,
      actionableStates: Object.keys(allowed).length,
      automaticCameraTransitions: policy.automaticCameraTakeoverAllowed === true ? 1 : 0,
      automaticMissionActions: (
        policy.automaticMissionStartAllowed === true ||
        policy.automaticBOSActivationAllowed === true ||
        policy.automaticMissionFinishAllowed === true
      ) ? 1 : 0
    };
    var expected = presenterPlan.expectedCounts || {};
    Object.keys(expected).forEach(function (key) {
      if (Number(actualCounts[key]) !== Number(expected[key])) {
        addError(errors, "Expected count", key, { expected: expected[key], actual: actualCounts[key] });
        counts.expectedCountErrors += 1;
      }
    });

    return createResult(errors, counts, actualCounts);
  }

  function createResult(errors, counts, actual) {
    return {
      title: "MISSION BOS PRESENTER & DEMO CONTROL VALIDATION",
      counts: counts,
      actual: actual || {},
      errors: errors,
      status: errors.length === 0 ? "PASSED" : "FAILED"
    };
  }

  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    Object.keys(result.counts || {}).forEach(function (key) {
      console[method](key + ": " + result.counts[key]);
    });
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosPresenterValidator = {
    validate: validate,
    logResult: logResult
  };
})();
