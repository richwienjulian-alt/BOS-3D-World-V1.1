/* Mission BOS - Build 012M.4 preparation
   Structural and runtime validator for Mission 003 connectivity recovery.
*/
(function () {
  "use strict";

  function copy(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function finite(value, fallback) { value = Number(value); return isFinite(value) ? value : fallback; }
  function list(value) { return Array.isArray(value) ? value : []; }

  function baseResult(title) {
    return {
      title: title,
      dependencyErrors: 0,
      policyErrors: 0,
      endpointErrors: 0,
      priorityErrors: 0,
      visualLifecycleErrors: 0,
      failSoftErrors: 0,
      returnCompletionErrors: 0,
      ownershipErrors: 0,
      expectedCountErrors: 0,
      fixedTowerErrors: 0,
      runtimeErrors: 0,
      status: "PASSED",
      errors: []
    };
  }

  function add(result, key, message) {
    result[key] += 1;
    result.errors.push(message);
  }

  function finish(result) {
    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }

  function validatePlan(plan) {
    var result = baseResult("MISSION BOS MISSION 003 CONNECTIVITY RECOVERY PLAN VALIDATION");
    if (!plan) {
      add(result, "dependencyErrors", "Recovery plan is missing.");
      return finish(result);
    }

    var policy = plan.policy || {};
    [
      "cityGeometryChangesAllowed", "routeChangesAllowed", "mission001ChangesAllowed",
      "mission002ChangesAllowed", "fixedServingTowerAllowed", "duplicateOperationalPathAllowed",
      "visualRuntimeMayGateMissionCompletion", "recoverableSafetyMayFreezeAssociation",
      "recoverableSafetyMayFreezeCellLoad"
    ].forEach(function (key) {
      if (policy[key] !== false) add(result, "policyErrors", key + " must be false.");
    });
    if (policy.directVehicleRenderAnchorsRequired !== true || policy.worldOcclusionRequired !== true) {
      add(result, "policyErrors", "Direct live anchors and world occlusion are required.");
    }

    var endpoints = list(plan.operationalEndpoints);
    var ids = endpoints.map(function (entry) { return entry.endpointId; });
    var expectedIds = ["NET_FIRE_01", "NET_POLICE_01", "NET_AMBULANCE_01", "NET_STADTWERKE_01"];
    expectedIds.forEach(function (id) {
      if (ids.indexOf(id) < 0) add(result, "endpointErrors", "Operational endpoint missing: " + id);
    });
    if (new Set(ids).size !== ids.length) add(result, "endpointErrors", "Duplicate operational endpoint definition.");
    endpoints.forEach(function (entry) {
      if (entry.permanentConnection !== true || !entry.directAnchorSource) {
        add(result, "endpointErrors", "Permanent direct anchor missing: " + entry.endpointId);
      }
      if (Object.prototype.hasOwnProperty.call(entry, "servingTowerId") ||
          Object.prototype.hasOwnProperty.call(entry, "towerId") ||
          Object.prototype.hasOwnProperty.call(entry, "fixedTowerId")) {
        add(result, "fixedTowerErrors", "Fixed serving tower detected: " + entry.endpointId);
      }
    });

    var priority = plan.mission003Priority || {};
    var priorityIds = list(priority.endpointIds);
    ["NET_FIRE_01", "NET_POLICE_01", "NET_STADTWERKE_01"].forEach(function (id) {
      if (priorityIds.indexOf(id) < 0) add(result, "priorityErrors", "Mission 003 priority endpoint missing: " + id);
    });
    if (priorityIds.indexOf("NET_AMBULANCE_01") >= 0) add(result, "priorityErrors", "Ambulance must not join Mission 003 priority group.");
    if (priority.validMissionId !== "MISSION_003" || priority.utilityPriorityOutsideMission003 !== false) {
      add(result, "priorityErrors", "Mission-scoped Stadtwerke priority contract is invalid.");
    }
    if (finite(priority.activationThresholdPercent, -1) !== 90 || finite(priority.releaseThresholdPercent, -1) !== 85) {
      add(result, "priorityErrors", "Priority thresholds must remain 90/85.");
    }
    if (finite(priority.fixedServingTowerDefinitions, -1) !== 0 || priority.priorityMayTriggerHandover !== false) {
      add(result, "fixedTowerErrors", "Priority must be dynamic and may not trigger handover.");
    }

    var visual = plan.visualLifecycle || {};
    if (finite(visual.packetsPerPath, 0) !== 4 || finite(visual.forwardPacketsPerPath, 0) !== 2 ||
        finite(visual.reversePacketsPerPath, 0) !== 2) {
      add(result, "visualLifecycleErrors", "Bidirectional four-packet contract changed.");
    }
    if (visual.anchorUpdateFrequency !== "EVERY_RENDER_FRAME" || visual.returnPathMustFollowVehicle !== true ||
        visual.standbyConnectionAfterReturn !== true || visual.staleScenePathAllowed !== false ||
        visual.depthTest !== true || visual.depthWrite !== false) {
      add(result, "visualLifecycleErrors", "Visual lifecycle contract is incomplete.");
    }

    var failSoft = plan.failSoftRuntime || {};
    if (failSoft.recoverableConditionStopsGlobalUpdate !== false ||
        failSoft.retryRecoverableConditionNextFrame !== true ||
        failSoft.unrelatedEndpointsContinueUpdating !== true ||
        failSoft.loadReleaseContinuesDuringWarning !== true) {
      add(result, "failSoftErrors", "Recoverable warnings must not freeze the network runtime.");
    }

    var completion = plan.returnAndCompletion || {};
    if (completion.disableSaturationImmediately !== true || completion.keepVehiclePathsLive !== true ||
        finite(completion.requiredReleaseThresholdPercent, -1) !== 85 ||
        finite(completion.readyMaximumNetworkLoadPercent, -1) !== 55 ||
        completion.requireAllVehiclesAtBase !== true || completion.requireNoActivePriority !== true ||
        completion.rendererStateMayBlockReady !== false || completion.expectedFinalState !== "READY") {
      add(result, "returnCompletionErrors", "Return and completion contract is invalid.");
    }

    var ownership = plan.ownership || {};
    if (ownership.unifiedRuntimeOwnsOperationalVehiclePaths !== true ||
        ownership.mission003RendererOwnsCivilianPathsOnly !== true ||
        ownership.legacyAmbulanceRuntimeActive !== false ||
        ownership.separateUtilityVehicleConnectivityRuntimeActive !== false) {
      add(result, "ownershipErrors", "Operational path ownership is not exclusive.");
    }

    var expected = plan.expected || {};
    if (finite(expected.operationalEndpoints, 0) !== 4 || finite(expected.mission003ResponseEndpoints, 0) !== 3 ||
        finite(expected.mission003PriorityEndpoints, 0) !== 3 || finite(expected.permanentOperationalPaths, 0) !== 4 ||
        finite(expected.totalOperationalPackets, 0) !== 16 || finite(expected.fixedServingTowerDefinitions, -1) !== 0 ||
        finite(expected.duplicateOperationalPaths, -1) !== 0 || finite(expected.stalePathsAfterReturn, -1) !== 0) {
      add(result, "expectedCountErrors", "Expected recovery counts changed.");
    }

    return finish(result);
  }

  function validateRuntime(options) {
    options = options || {};
    var result = baseResult("MISSION BOS MISSION 003 CONNECTIVITY RECOVERY RUNTIME VALIDATION");
    var plan = options.plan || window.MISSION_BOS_MISSION_003_CONNECTIVITY_RECOVERY_PLAN;
    var mission = options.mission003Runtime;
    var response = options.responseRuntime;
    var association = options.associationRuntime;
    var priority = options.priorityRuntime;
    var load = options.cellLoadRuntime;
    var capacity = options.capacityRuntime;
    var unified = options.unifiedConnectivityRuntime;
    var utility = options.stadtwerkeRuntime;

    var planResult = validatePlan(plan);
    if (planResult.status !== "PASSED") add(result, "dependencyErrors", "Recovery plan validation failed.");
    [mission, response, association, priority, load, capacity, unified, utility].forEach(function (runtime, index) {
      if (!runtime) add(result, "dependencyErrors", "Runtime dependency missing at index " + index + ".");
    });
    if (result.dependencyErrors) return finish(result);

    var unifiedManifest = unified.getManifest && unified.getManifest();
    var unifiedSafety = unified.getSafetyStatus && unified.getSafetyStatus();
    if (!unifiedManifest || unifiedManifest.status !== "PASSED" || !unifiedSafety || unifiedSafety.status !== "PASSED") {
      add(result, "runtimeErrors", "Unified connectivity runtime is not safe.");
    }

    var snapshots = {};
    list(plan.operationalEndpoints).forEach(function (entry) {
      var snapshot = unified.getEndpointSnapshot && unified.getEndpointSnapshot(entry.endpointId);
      snapshots[entry.endpointId] = snapshot;
      if (!snapshot || snapshot.visible !== true || finite(snapshot.visiblePackets, 0) !== 4 ||
          finite(snapshot.forwardPackets, 0) !== 2 || finite(snapshot.reversePackets, 0) !== 2) {
        add(result, "runtimeErrors", "Operational path is incomplete: " + entry.endpointId);
      }
      var associationState = association.getAssociation && association.getAssociation(entry.endpointId);
      if (!associationState || associationState.active !== true || !associationState.position || !associationState.servingTowerId) {
        add(result, "runtimeErrors", "Operational association is incomplete: " + entry.endpointId);
      }
    });

    var missionState = mission.getState && mission.getState();
    if (missionState === "BOS_ACTIVE" || missionState === "COMMS_STABLE" || missionState === "WATER_ISOLATED" ||
        missionState === "REPAIRING" || missionState === "COMPLETED") {
      ["NET_FIRE_01", "NET_POLICE_01", "NET_STADTWERKE_01"].forEach(function (id) {
        if (!snapshots[id] || snapshots[id].priorityActive !== true) {
          add(result, "priorityErrors", "Mission 003 active priority style missing: " + id);
        }
      });
    }

    if (missionState === "RETURNING") {
      if (!response || typeof response.allAtBase !== "function") add(result, "returnCompletionErrors", "Response return state unavailable.");
      if (load.getSaturationSnapshot && (load.getSaturationSnapshot() || {}).active === true) {
        add(result, "returnCompletionErrors", "Mission 003 saturation remains active during RETURNING.");
      }
    }

    var utilityState = utility.getState && utility.getState();
    if (missionState === "READY" && utilityState === "PARKED" && snapshots.NET_STADTWERKE_01 && snapshots.NET_STADTWERKE_01.priorityActive === true) {
      add(result, "priorityErrors", "Stadtwerke priority leaked into READY.");
    }

    return finish(result);
  }

  function logResult(result) {
    result = result || { title: "MISSION BOS MISSION 003 CONNECTIVITY RECOVERY VALIDATION", status: "FAILED", errors: ["No result."] };
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    console[method]("Dependency errors: " + finite(result.dependencyErrors, 0));
    console[method]("Policy errors: " + finite(result.policyErrors, 0));
    console[method]("Endpoint errors: " + finite(result.endpointErrors, 0));
    console[method]("Priority errors: " + finite(result.priorityErrors, 0));
    console[method]("Visual lifecycle errors: " + finite(result.visualLifecycleErrors, 0));
    console[method]("Fail-soft errors: " + finite(result.failSoftErrors, 0));
    console[method]("Return/completion errors: " + finite(result.returnCompletionErrors, 0));
    console[method]("Runtime errors: " + finite(result.runtimeErrors, 0));
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosMission003ConnectivityRecoveryValidator = {
    validatePlan: validatePlan,
    validateRuntime: validateRuntime,
    logResult: logResult
  };
})();
