/* Mission BOS - Build 008R.8
   Structural validator for the deterministic Mission 001 activation plan.
   No Three.js dependency. No modules. No fetch.
*/
(function () {
  "use strict";

  var REQUIRED_STATE_ORDER = [
    "READY",
    "CALL_RECEIVED",
    "CLEARING_CORRIDOR",
    "DISPATCHING",
    "ENROUTE",
    "ON_SCENE",
    "OVERLOADED",
    "BOS_ACTIVE",
    "COMMS_STABLE",
    "COMPLETED",
    "RETURNING",
    "FAILED"
  ];

  function finiteNumber(value) {
    var number = Number(value);
    return isFinite(number) ? number : null;
  }

  function sameNumber(a, b, tolerance) {
    var left = finiteNumber(a);
    var right = finiteNumber(b);
    if (left === null || right === null) return false;
    return Math.abs(left - right) <= (tolerance || 0.0001);
  }

  function samePoint(a, b) {
    if (!a || !b) return false;
    return sameNumber(a.x, b.x, 0.001) &&
      sameNumber(a.y || 0, b.y || 0, 0.001) &&
      sameNumber(a.z, b.z, 0.001);
  }

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      if (items[i] && items[i].id === id) return items[i];
    }
    return null;
  }

  function countBy(items, predicate) {
    var count = 0;
    for (var i = 0; i < (items || []).length; i += 1) {
      if (predicate(items[i])) count += 1;
    }
    return count;
  }

  function validate(layout, incidentPlan, missionPlan) {
    var errors = [];

    if (!layout || !incidentPlan || !missionPlan) {
      errors.push({
        check: "Source dependency",
        data: {
          layout: !!layout,
          incidentPlan: !!incidentPlan,
          missionPlan: !!missionPlan
        }
      });
      return createResult(errors, {}, {});
    }

    if (missionPlan.buildBase !== "008R.7") {
      errors.push({ check: "Source phase", data: { key: "buildBase", expected: "008R.7", actual: missionPlan.buildBase } });
    }
    if (missionPlan.sourceIncidentPhase !== incidentPlan.phase) {
      errors.push({ check: "Source phase", data: { key: "sourceIncidentPhase", expected: incidentPlan.phase, actual: missionPlan.sourceIncidentPhase } });
    }

    var incident = incidentPlan.incident || {};
    var reference = missionPlan.incidentReference || {};
    var incidentBuilding = findById(layout.buildings, reference.buildingId);

    if (!incidentBuilding) {
      errors.push({ check: "Incident reference", data: { buildingId: reference.buildingId, issue: "building missing from recovery layout" } });
    }

    ["incidentId", "missionId", "title", "buildingId", "buildingName", "facade"].forEach(function (key) {
      var sourceKey = key === "incidentId" ? "id" : key;
      if (reference[key] !== incident[sourceKey]) {
        errors.push({ check: "Incident reference", data: { key: key, expected: incident[sourceKey], actual: reference[key] } });
      }
    });

    ["facadeAnchor", "roofSmokeAnchor", "cameraFocus", "fireStaging", "policeStaging"].forEach(function (key) {
      if (!samePoint(reference[key], incident[key])) {
        errors.push({ check: "Incident anchor", data: { key: key, expected: incident[key], actual: reference[key] } });
      }
    });

    var stateOrder = missionPlan.stateOrder || [];
    var states = missionPlan.states || [];
    var stateIds = states.map(function (state) { return state && state.id; });
    var unique = Object.create(null);

    if (JSON.stringify(stateOrder) !== JSON.stringify(REQUIRED_STATE_ORDER)) {
      errors.push({ check: "State order", data: { expected: REQUIRED_STATE_ORDER, actual: stateOrder } });
    }
    if (JSON.stringify(stateIds) !== JSON.stringify(REQUIRED_STATE_ORDER)) {
      errors.push({ check: "State definition", data: { expected: REQUIRED_STATE_ORDER, actual: stateIds } });
    }

    states.forEach(function (state) {
      if (!state || !state.id) {
        errors.push({ check: "State definition", data: { issue: "state without id" } });
        return;
      }
      if (unique[state.id]) {
        errors.push({ check: "State definition", data: { id: state.id, issue: "duplicate state" } });
      }
      unique[state.id] = true;

      var progress = finiteNumber(state.progress);
      var networkTarget = finiteNumber(state.networkTarget);
      if (progress === null || progress < 0 || progress > 100) {
        errors.push({ check: "State progress", data: { id: state.id, value: state.progress } });
      }
      if (networkTarget === null || networkTarget < 0 || networkTarget > 100) {
        errors.push({ check: "Network target", data: { id: state.id, value: state.networkTarget } });
      }
      if (state.minimumDurationSeconds !== undefined) {
        var duration = finiteNumber(state.minimumDurationSeconds);
        if (duration === null || duration <= 0) {
          errors.push({ check: "State timing", data: { id: state.id, value: state.minimumDurationSeconds } });
        }
      }
    });

    var lastProgress = -1;
    states.forEach(function (state) {
      if (!state || state.id === "FAILED") return;
      var progress = finiteNumber(state.progress);
      if (progress !== null && progress < lastProgress) {
        errors.push({ check: "State progress", data: { id: state.id, issue: "progress decreases", previous: lastProgress, actual: progress } });
      }
      if (progress !== null) lastProgress = progress;
    });

    var sequence = missionPlan.sequence || {};
    var requiredSequence = {
      initialState: "READY",
      bosActivationState: "OVERLOADED",
      finishRequiresState: "COMPLETED",
      resetWhenIncidentAccessState: "AT_STATIONS"
    };
    Object.keys(requiredSequence).forEach(function (key) {
      if (sequence[key] !== requiredSequence[key]) {
        errors.push({ check: "Sequence", data: { key: key, expected: requiredSequence[key], actual: sequence[key] } });
      }
    });
    if (sequence.dispatchRequiresYieldConfirmation !== true || sequence.onSceneStateRequiresIncidentAccessHolding !== true || sequence.returnUsesIncidentAccessController !== true || sequence.releaseYieldOwnedByIncidentAccessController !== true) {
      errors.push({ check: "Sequence", data: { issue: "required safety gates are not all enabled" } });
    }

    var policy = missionPlan.missionPolicy || {};
    var forbiddenTrue = [
      "runtimeRandomization",
      "legacyMissionManagerAllowed",
      "legacyMissionVisualsAllowed",
      "legacyPedestrianMissionBehaviorAllowed",
      "directMissionTargetMovementAllowed",
      "automaticBOSActivationAllowed",
      "civilianNetworkLoadMayDropAfterBOSActivation",
      "cameraTakeoverAllowed",
      "cityGeometryChangesAllowed",
      "staticPropChangesAllowed",
      "trafficRouteChangesAllowed",
      "pedestrianRouteChangesAllowed",
      "responseRouteChangesAllowed",
      "groundIncidentPropsAllowed"
    ];
    forbiddenTrue.forEach(function (key) {
      if (policy[key] !== false) {
        errors.push({ check: "Mission policy", data: { key: key, expected: false, actual: policy[key] } });
      }
    });
    if (policy.manualBOSActivationRequired !== true || policy.missionVisualsRestrictedToIncidentBuilding !== true) {
      errors.push({ check: "Mission policy", data: { issue: "manual BOS or building-only visuals policy missing" } });
    }

    var network = missionPlan.network || {};
    if (!sameNumber(network.baseLoad, 38) || !sameNumber(network.maximumLoad, 96) || finiteNumber(network.minimumOverloadLoad) < 90) {
      errors.push({ check: "Network policy", data: { issue: "base, maximum or overload threshold invalid", network: network } });
    }
    if (network.bosActivationDoesNotReduceCivilianLoad !== true || network.bosMayBeActivatedOnlyInState !== "OVERLOADED" || network.bosMayNotBeDeactivatedDuringMission !== true) {
      errors.push({ check: "Network policy", data: { issue: "BOS priority semantics invalid" } });
    }

    var overloaded = findById(states, "OVERLOADED");
    var bosActive = findById(states, "BOS_ACTIVE");
    var stable = findById(states, "COMMS_STABLE");
    var completed = findById(states, "COMPLETED");
    [overloaded, bosActive, stable, completed].forEach(function (state) {
      if (!state || finiteNumber(state.networkTarget) < finiteNumber(network.minimumOverloadLoad)) {
        errors.push({ check: "Network target", data: { id: state && state.id, issue: "load must remain overloaded through BOS stabilization and completion" } });
      }
    });

    var visuals = missionPlan.visuals || {};
    if (visuals.incidentBuildingId !== reference.buildingId || !samePoint(visuals.facadeAnchor, reference.facadeAnchor) || !samePoint(visuals.roofSmokeAnchor, reference.roofSmokeAnchor)) {
      errors.push({ check: "Visual anchor", data: { issue: "visuals do not use the frozen incident reference" } });
    }
    if ((visuals.groundProps || []).length !== 0 || visuals.rendererMode !== "deterministic-building-attached-only") {
      errors.push({ check: "Visual policy", data: { issue: "ground props or non-deterministic visual mode detected" } });
    }
    if (visuals.smoke && visuals.smoke.randomization !== false) {
      errors.push({ check: "Visual policy", data: { issue: "smoke randomization must be false" } });
    }
    if (visuals.flames && visuals.flames.randomization !== false) {
      errors.push({ check: "Visual policy", data: { issue: "flame randomization must be false" } });
    }
    if (visuals.cameraMovement && visuals.cameraMovement.enabled !== false) {
      errors.push({ check: "Visual policy", data: { issue: "camera movement must remain disabled" } });
    }

    var controls = missionPlan.controls || {};
    if (JSON.stringify(controls.missionButtonEnabledStates || []) !== JSON.stringify(["READY", "COMPLETED"])) {
      errors.push({ check: "Control policy", data: { key: "missionButtonEnabledStates", actual: controls.missionButtonEnabledStates } });
    }
    if (JSON.stringify(controls.bosButtonEnabledStates || []) !== JSON.stringify(["OVERLOADED"])) {
      errors.push({ check: "Control policy", data: { key: "bosButtonEnabledStates", actual: controls.bosButtonEnabledStates } });
    }

    var expected = missionPlan.expectedCounts || {};
    var actual = {
      states: states.length,
      interactiveMissionStates: (controls.missionButtonEnabledStates || []).length,
      bosActivationStates: (controls.bosButtonEnabledStates || []).length,
      incidentBuildings: incidentBuilding ? 1 : 0,
      smokePuffs: visuals.smoke ? Number(visuals.smoke.count || 0) : 0,
      flames: visuals.flames ? Number(visuals.flames.count || 0) : 0,
      windowGlows: visuals.windowGlow ? Number(visuals.windowGlow.count || 0) : 0,
      groundIncidentProps: (visuals.groundProps || []).length,
      pedestrianMissionBehaviors: policy.legacyPedestrianMissionBehaviorAllowed ? 1 : 0,
      automaticBOSActivations: policy.automaticBOSActivationAllowed ? 1 : 0
    };
    Object.keys(expected).forEach(function (key) {
      if (Number(expected[key]) !== Number(actual[key])) {
        errors.push({ check: "Expected counts", data: { key: key, expected: Number(expected[key]), actual: Number(actual[key]) } });
      }
    });

    return createResult(errors, actual, expected);
  }

  function createResult(errors, actual, expected) {
    var counts = {
      sourceDependencyErrors: countBy(errors, function (e) { return e.check === "Source dependency"; }),
      sourcePhaseErrors: countBy(errors, function (e) { return e.check === "Source phase"; }),
      incidentReferenceErrors: countBy(errors, function (e) { return e.check === "Incident reference"; }),
      incidentAnchorErrors: countBy(errors, function (e) { return e.check === "Incident anchor"; }),
      stateDefinitionErrors: countBy(errors, function (e) { return e.check === "State order" || e.check === "State definition"; }),
      stateProgressErrors: countBy(errors, function (e) { return e.check === "State progress"; }),
      stateTimingErrors: countBy(errors, function (e) { return e.check === "State timing"; }),
      sequenceErrors: countBy(errors, function (e) { return e.check === "Sequence"; }),
      missionPolicyErrors: countBy(errors, function (e) { return e.check === "Mission policy"; }),
      networkPolicyErrors: countBy(errors, function (e) { return e.check === "Network policy" || e.check === "Network target"; }),
      visualPolicyErrors: countBy(errors, function (e) { return e.check === "Visual anchor" || e.check === "Visual policy"; }),
      controlPolicyErrors: countBy(errors, function (e) { return e.check === "Control policy"; }),
      expectedCountErrors: countBy(errors, function (e) { return e.check === "Expected counts"; })
    };

    return {
      title: "MISSION BOS MISSION 001 PLAN VALIDATION",
      status: errors.length === 0 ? "PASSED" : "FAILED",
      counts: counts,
      actual: actual,
      expected: expected,
      errors: errors
    };
  }

  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    Object.keys(result.counts).forEach(function (key) {
      console[method](key + ": " + result.counts[key]);
    });
    console[method]("STATUS: " + result.status);
    (result.errors || []).forEach(function (error) {
      console.error(error.check, error.data);
    });
    console.groupEnd();
  }

  window.MissionBosMission001Validator = {
    validate: validate,
    logResult: logResult,
    REQUIRED_STATE_ORDER: REQUIRED_STATE_ORDER.slice()
  };
})();
