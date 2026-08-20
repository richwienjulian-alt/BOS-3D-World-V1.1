/* Mission BOS - Build 013M.3
   Mission 004 state machine. Vehicle motion, traffic, rendering, association,
   cell load and automatic priority remain owned by their shared runtimes.
*/
(function () {
  "use strict";

  function finite(value, fallback) {
    value = Number(value);
    return isFinite(value) ? value : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function failedRuntime(plan, message) {
    var safety = {
      title: "MISSION BOS MISSION 004 RUNTIME SAFETY",
      state: "FAILED",
      dependencyErrors: 1,
      transitionErrors: 0,
      responseErrors: 0,
      networkErrors: 0,
      sceneErrors: 0,
      missionConflictErrors: 0,
      resetErrors: 0,
      status: "FAILED",
      errors: [message || "Mission 004 dependencies are incomplete."]
    };
    return {
      start: function () { return false; }, activateBOS: function () { return false; },
      finishAndReturn: function () { return false; }, update: function () {}, reset: function () { return false; },
      getState: function () { return "FAILED"; }, getNetworkState: function () { return "FAILED"; },
      getCellLoadProfileState: function () { return "FAILED"; }, getBosEndpointIds: function () { return []; },
      getPhaseLabel: function () { return "Fehler"; }, getStageLabel: function () { return "Sicherheitsstopp"; },
      getStatusLabel: function () { return "Mission 004 nicht verfügbar"; }, getDescription: function () { return safety.errors[0]; },
      getProgress: function () { return 0; }, isActive: function () { return false; }, isCompleted: function () { return false; },
      canStart: function () { return false; }, canActivateBOS: function () { return false; }, canFinish: function () { return false; },
      getManifest: function () { return { title: "MISSION BOS MISSION 004 RUNTIME MANIFEST", missionId: "MISSION_004", status: "FAILED" }; },
      getSafetyStatus: function () { return copy(safety); }, dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var plan = options.plan || window.MISSION_BOS_MISSION_004_PLAN;
    var validation = options.validation;
    var scene = options.sceneRuntime;
    var response = options.responseRuntime;
    var network = options.networkAdapter;
    var association = options.associationRuntime;
    var load = options.cellLoadRuntime;
    var capacity = options.capacityRuntime;
    var priority = options.priorityRuntime;
    var mission001 = options.mission001Runtime;
    var mission002 = options.mission002Runtime;
    var mission003 = options.mission003Runtime;
    var registry = options.missionRegistryRuntime;

    if (!plan || !validation || validation.status !== "PASSED" || !scene || !response || !network || !association ||
        !load || !capacity || !priority || !mission001 || !mission002 || !mission003 || !registry) {
      return failedRuntime(plan, "Mission 004 dependencies are incomplete.");
    }

    var states = Object.create(null);
    (plan.states || []).forEach(function (definition) { states[definition.id] = definition; });
    var sequence = plan.sequence || {};
    var state = sequence.initialState || "READY";
    var stateElapsed = 0;
    var disposed = false;
    var finishIssued = false;
    var networkEnded = false;
    var completionSettlementStarted = false;
    var completionSettlementElapsed = 0;
    var completionSettlementBlockers = [];
    var completionSettlementFallbackIssued = false;
    var completionSettlementFallbackResult = null;
    var completionPostCommitMission002Baseline = null;
    var failure = "";

    var manifestBase = {
      title: "MISSION BOS MISSION 004 RUNTIME MANIFEST",
      missionId: "MISSION_004",
      states: (plan.states || []).length,
      responseVehicles: finite((plan.expectedCounts || {}).responseVehicles, 0),
      bosEndpoints: (plan.network.activeBosEndpointIds || []).length,
      civilianEndpoints: (plan.network.missionCivilianEndpointIds || []).length,
      automaticMissionStarts: 0,
      automaticMissionFinishes: 0,
      manualBosActivations: 0,
      status: (plan.states || []).length === 16 ? "PASSED" : "FAILED"
    };

    function definition() {
      return states[state] || states.READY || {};
    }

    function setState(next) {
      if (!states[next]) return false;
      state = next;
      stateElapsed = 0;
      if (typeof scene.setState === "function") scene.setState(next);
      if (next !== "READY" && next !== "FAILED" && !networkEnded) {
        network.setTargetLoad(finite((states[next] || {}).globalNetworkTarget, 38));
      }
      return true;
    }

    function selected() {
      return !registry.getSelectedMissionId || registry.getSelectedMissionId() === "MISSION_004";
    }

    function otherMissionsReady() {
      return mission001.getState() === "READY" && mission002.getState() === "READY" && mission003.getState() === "READY";
    }

    function runtimeSafe(runtime) {
      var status = runtime && runtime.getSafetyStatus ? runtime.getSafetyStatus() : null;
      return !!status && status.status === "PASSED" && status.fatal !== true;
    }

    function noPriorityActive() {
      if (!priority || typeof priority.getAllCellStates !== "function") return false;
      return !priority.getAllCellStates().some(function (cell) { return cell && cell.active === true; });
    }

    function settlementContextActive() {
      return completionSettlementStarted === true && state === "RETURNING";
    }

    function getCompletionSettlementStatus() {
      return {
        active: settlementContextActive(),
        elapsedSeconds: completionSettlementElapsed,
        blockers: completionSettlementBlockers.slice(),
        fallbackIssued: completionSettlementFallbackIssued,
        fallbackResult: completionSettlementFallbackResult,
        postCommitMission002Baseline: copy(completionPostCommitMission002Baseline),
        cellLoadProfileState: settlementContextActive() ? "READY" : state,
        networkState: settlementContextActive() ? "READY" : state,
        bosEndpointIds: settlementContextActive() ? [] : (plan.network.activeBosEndpointIds || []).slice()
      };
    }

    function commonIncidentTowerId() {
      var ids = plan.network.activeBosEndpointIds || [];
      var towerId = null;
      for (var i = 0; i < ids.length; i += 1) {
        var current = association.getAssociation(ids[i]);
        if (!current || current.active !== true || !current.servingTowerId) return null;
        if (towerId == null) towerId = current.servingTowerId;
        else if (towerId !== current.servingTowerId) return null;
      }
      return towerId;
    }

    function incidentCellLoad() {
      var towerId = commonIncidentTowerId();
      var value = towerId ? load.getCellLoad(towerId) : null;
      return isFinite(Number(value)) ? Number(value) : 0;
    }

    function allCellLoadsAtOrBelow(limit) {
      if (!load || typeof load.getAllCells !== "function") return false;
      return load.getAllCells().every(function (cell) { return finite(cell.currentLoad, 101) <= limit + 1e-9; });
    }

    function finalizeSharedSettlementBaseline() {
      var result = { ok: false, priority: null, capacity: null, load: null, network: null };
      if (!settlementContextActive()) return result;
      var handoff = response.getCrossMissionHandoffStatus ? response.getCrossMissionHandoffStatus() : null;
      if (!handoff || handoff.ready !== true) return result;

      result.priority = priority && typeof priority.reset === "function" ? priority.reset() : false;
      if (result.priority !== true) return result;
      result.capacity = capacity && typeof capacity.reset === "function" ? capacity.reset() : false;
      if (result.capacity !== true) return result;
      result.load = load && typeof load.reset === "function" ? load.reset() : false;
      if (result.load !== true) return result;
      result.network = network && typeof network.finalizeMissionSettlement === "function"
        ? network.finalizeMissionSettlement()
        : false;
      result.ok = result.network === true;
      return result;
    }

    function canStart() {
      return !disposed && state === "READY" && selected() && otherMissionsReady() && response.allAtBase() &&
        runtimeSafe(response) && runtimeSafe(scene) && runtimeSafe(network) && runtimeSafe(association) &&
        runtimeSafe(load) && runtimeSafe(capacity) && runtimeSafe(priority);
    }

    function start() {
      if (!canStart()) return false;
      if (!network.beginMission(finite(states.CALL_RECEIVED.globalNetworkTarget, 52))) return false;
      networkEnded = false;
      completionSettlementStarted = false;
      completionSettlementElapsed = 0;
      completionSettlementBlockers = [];
      completionSettlementFallbackIssued = false;
      completionSettlementFallbackResult = null;
      completionPostCommitMission002Baseline = null;
      finishIssued = false;
      failure = "";
      if (!scene.reset() || !response.reset()) {
        network.endMission();
        networkEnded = true;
        return fail("Mission 004 reset preparation failed.");
      }
      // Build 013M.4: establish the no-cross traffic closure while the incident scene is still hidden.
      // This allows a vehicle already inside the future exclusion footprint to be safely relocated
      // before CALL_RECEIVED makes the accident visible.
      if (!response.prepare()) {
        network.endMission();
        networkEnded = true;
        return fail("Mission 004 pre-visibility traffic preparation failed.");
      }
      return setState("CALL_RECEIVED");
    }

    function canActivateBOS() {
      return ["BOS_ACTIVE", "COMMS_STABLE", "EXTRICATION", "PATIENT_READY", "COMPLETED"].indexOf(state) >= 0;
    }

    function activateBOS() {
      return canActivateBOS() && network.isBOSActive() === true;
    }

    function canFinish() {
      return state === "COMPLETED" && response.allAtScene();
    }

    function finishAndReturn() {
      if (!canFinish()) return false;
      if (!response.beginReturnAndTransport()) return false;
      finishIssued = true;
      return setState("TRANSPORTING");
    }

    function transitionByTime(next, seconds) {
      if (stateElapsed + 1e-9 < finite(seconds, 0)) return false;
      return setState(next);
    }

    function update(delta) {
      if (disposed || state === "READY" || state === "FAILED") return;
      stateElapsed += Math.max(0, Math.min(finite(delta, 0), 0.1));

      if (["TRANSPORTING", "AT_HOSPITAL", "RETURNING"].indexOf(state) >= 0) {
        var activeResponseSafety = response.getSafetyStatus ? response.getSafetyStatus() : null;
        if (!activeResponseSafety || activeResponseSafety.status !== "PASSED") {
          fail("Mission 004 return safety stopped: " + ((activeResponseSafety && activeResponseSafety.errors && activeResponseSafety.errors[0]) || "response runtime unsafe"));
          return;
        }
      }

      if (state === "CALL_RECEIVED") {
        transitionByTime("ALARMING", sequence.callDurationSeconds);
      } else if (state === "ALARMING" && stateElapsed + 1e-9 >= finite(sequence.alarmDurationSeconds, 1.5)) {
        if (!response.isPrepared || !response.isPrepared()) {
          if (!response.prepare()) { fail("Mission 004 response preparation failed."); return; }
        }
        setState("ROAD_CLOSURE");
      } else if (state === "ROAD_CLOSURE") {
        if (response.dispatch()) setState("ENROUTE");
        else if (stateElapsed + 1e-9 >= finite(sequence.roadClosureMaximumWaitSeconds, 18)) fail("Protected Ring North traffic corridor did not clear within the safety window.");
      } else if (state === "ENROUTE" && response.allAtScene()) {
        setState("ON_SCENE");
      } else if (state === "ON_SCENE" && stateElapsed + 1e-9 >= finite(sequence.onSceneHoldSeconds, 2.2) && incidentCellLoad() >= 90) {
        setState("OVERLOADED");
      } else if (state === "OVERLOADED" && network.isBOSActive() === true) {
        setState("BOS_ACTIVE");
      } else if (state === "BOS_ACTIVE" && stateElapsed + 1e-9 >= finite(sequence.bosActiveToStableSeconds, 2.0) &&
          (!network.isCapacityPrioritySettled || network.isCapacityPrioritySettled())) {
        setState("COMMS_STABLE");
      } else if (state === "COMMS_STABLE") {
        transitionByTime("EXTRICATION", sequence.stableToExtricationSeconds);
      } else if (state === "EXTRICATION") {
        transitionByTime("PATIENT_READY", sequence.extricationSeconds);
      } else if (state === "PATIENT_READY") {
        transitionByTime("COMPLETED", sequence.patientReadySeconds);
      } else if (state === "TRANSPORTING" && response.ambulanceAtHospital()) {
        setState("AT_HOSPITAL");
      } else if (state === "AT_HOSPITAL" && response.isAmbulanceReturning && response.isAmbulanceReturning()) {
        setState("RETURNING");
      } else if (state === "RETURNING") {
        var operationalComplete = response.allAtBase() && response.firePoliceAtBase() &&
          response.isTrafficReleased() && response.isSceneCleared();
        var preSettlementHandoff = response.getCrossMissionHandoffStatus ? response.getCrossMissionHandoffStatus() : null;
        if (operationalComplete && preSettlementHandoff && preSettlementHandoff.ready === true && !completionSettlementStarted) {
          var endResult = network.endMission();
          if (endResult === false) { fail("Mission 004 network settlement could not be started."); return; }
          networkEnded = true;
          completionSettlementStarted = true;
          completionSettlementElapsed = 0;
          completionSettlementBlockers = [];
        }
        if (completionSettlementStarted) {
          completionSettlementElapsed += Math.max(0, Math.min(finite(delta, 0), 0.1));
          var readyLoad = finite(sequence.resetRequiresNetworkLoadAtOrBelow, 55);
          var sharedNetworkReady = typeof network.isReadyForMissionStart === "function"
            ? network.isReadyForMissionStart() === true
            : network.getLoad() <= finite((plan.network || {}).baseLoad, 38) + 4;
          var cellLoadsReady = allCellLoadsAtOrBelow(readyLoad);
          var priorityReady = noPriorityActive();
          var responseHandoff = response.getCrossMissionHandoffStatus ? response.getCrossMissionHandoffStatus() : null;
          var responseHandoffReady = !!responseHandoff && responseHandoff.ready === true;

          completionSettlementBlockers = [];
          if (!sharedNetworkReady) completionSettlementBlockers.push("SHARED_NETWORK_NOT_READY");
          if (!priorityReady) completionSettlementBlockers.push("BOS_PRIORITY_NOT_RELEASED");
          if (!responseHandoffReady) completionSettlementBlockers.push("RESPONSE_HANDOFF_NOT_READY");
          if (!cellLoadsReady) completionSettlementBlockers.push("CELL_LOADS_STILL_EASING_NON_BLOCKING");

          var maximumSeconds = finite(sequence.completionSettlementMaximumSeconds, 8.0);
          var deterministicFinalizeAt = Math.max(1.0, Math.min(6.0, maximumSeconds - 1.0));
          if ((!sharedNetworkReady || !priorityReady) && responseHandoffReady &&
              completionSettlementElapsed + 1e-9 >= deterministicFinalizeAt &&
              completionSettlementFallbackIssued !== true) {
            completionSettlementFallbackIssued = true;
            completionSettlementFallbackResult = finalizeSharedSettlementBaseline();
            sharedNetworkReady = typeof network.isReadyForMissionStart === "function"
              ? network.isReadyForMissionStart() === true
              : network.getLoad() <= finite((plan.network || {}).baseLoad, 38) + 4;
            priorityReady = noPriorityActive();
            cellLoadsReady = allCellLoadsAtOrBelow(readyLoad);
            completionSettlementBlockers = [];
            if (!sharedNetworkReady) completionSettlementBlockers.push("SHARED_NETWORK_NOT_READY");
            if (!priorityReady) completionSettlementBlockers.push("BOS_PRIORITY_NOT_RELEASED");
            if (!responseHandoffReady) completionSettlementBlockers.push("RESPONSE_HANDOFF_NOT_READY");
            if (!cellLoadsReady) completionSettlementBlockers.push("CELL_LOADS_STILL_EASING_NON_BLOCKING");
            if (!completionSettlementFallbackResult || completionSettlementFallbackResult.ok !== true) {
              completionSettlementBlockers.push("DETERMINISTIC_BASELINE_FINALIZATION_REJECTED");
            }
          }

          if (sharedNetworkReady && priorityReady && responseHandoffReady) {
            if (!response.finalizeForSharedHandoff || response.finalizeForSharedHandoff() !== true) {
              fail("Mission 004 shared response handoff finalization failed.");
              return;
            }
            if (!scene.reset()) { fail("Mission 004 scene reset failed before READY."); return; }
            completionPostCommitMission002Baseline = mission002.getSharedStartBaselineStatus
              ? mission002.getSharedStartBaselineStatus()
              : null;
            finishIssued = false;
            setState("READY");
            networkEnded = false;
            completionSettlementStarted = false;
            completionSettlementElapsed = 0;
            completionSettlementBlockers = [];
          } else if (completionSettlementElapsed + 1e-9 >= maximumSeconds) {
            if (!responseHandoffReady) {
              fail("Mission 004 shared response handoff did not become safe before the completion deadline. Pending: " +
                (completionSettlementBlockers.length ? completionSettlementBlockers.join(", ") : "UNKNOWN"));
              return;
            }
            fail("Mission 004 deterministic shared baseline finalization failed. Pending: " +
              (completionSettlementBlockers.length ? completionSettlementBlockers.join(", ") : "UNKNOWN"));
          }
        }
      }
    }

    function fail(message) {
      failure = message || "Mission 004 safety stop.";
      if (!networkEnded) {
        network.endMission();
        networkEnded = true;
      }
      state = "FAILED";
      stateElapsed = 0;
      if (scene && typeof scene.setState === "function") scene.setState("FAILED");
      return false;
    }

    function reset() {
      if (disposed || (state !== "READY" && state !== "FAILED")) return false;
      if (!response.allAtBase()) return false;
      if (!response.reset() || !scene.reset()) return false;
      if (!networkEnded && state === "FAILED") network.endMission();
      state = "READY";
      stateElapsed = 0;
      finishIssued = false;
      networkEnded = false;
      completionSettlementStarted = false;
      completionSettlementElapsed = 0;
      completionSettlementBlockers = [];
      completionSettlementFallbackIssued = false;
      completionSettlementFallbackResult = null;
      completionPostCommitMission002Baseline = null;
      failure = "";
      return true;
    }

    function getManifest() {
      var result = copy(manifestBase);
      result.state = state;
      result.responseState = response.getState ? response.getState() : null;
      result.allAtScene = response.allAtScene();
      result.allAtBase = response.allAtBase();
      result.trafficReleased = response.isTrafficReleased();
      result.sceneCleared = response.isSceneCleared();
      result.incidentServingTowerId = commonIncidentTowerId();
      result.incidentCellLoad = incidentCellLoad();
      return result;
    }

    function getSafetyStatus() {
      var result = {
        title: "MISSION BOS MISSION 004 RUNTIME SAFETY",
        state: state,
        dependencyErrors: 0,
        transitionErrors: 0,
        responseErrors: 0,
        networkErrors: 0,
        sceneErrors: 0,
        missionConflictErrors: 0,
        resetErrors: 0,
        status: "PASSED",
        fatal: false,
        errors: []
      };
      var responseSafety = response.getSafetyStatus();
      var sceneSafety = scene.getSafetyStatus();
      var associationSafety = association.getSafetyStatus();
      var loadSafety = load.getSafetyStatus();
      var capacitySafety = capacity.getSafetyStatus();
      if (!responseSafety || responseSafety.status !== "PASSED") { result.responseErrors += 1; result.errors.push("Response runtime unsafe."); }
      if (!sceneSafety || sceneSafety.status !== "PASSED") { result.sceneErrors += 1; result.errors.push("Scene runtime unsafe."); }
      if (!associationSafety || associationSafety.fatal === true || !loadSafety || loadSafety.fatal === true || !capacitySafety || capacitySafety.fatal === true) {
        result.networkErrors += 1; result.errors.push("Shared network runtime has a fatal error."); result.fatal = true;
      }
      if (state !== "READY" && state !== "FAILED" && !otherMissionsReady()) {
        result.missionConflictErrors += 1; result.errors.push("Another mission left READY during Mission 004.");
      }
      if (state === "TRANSPORTING" && !finishIssued) {
        result.transitionErrors += 1; result.errors.push("TRANSPORTING entered without the manual finish command.");
      }
      if (state === "READY" && (!response.allAtBase() || !response.isTrafficReleased())) {
        result.resetErrors += 1; result.errors.push("Mission 004 READY baseline is incomplete.");
      }
      if (result.errors.length) result.status = "FAILED";
      return result;
    }

    function description() {
      if (state === "FAILED") return failure || "Mission 004 wurde sicher angehalten.";
      return definition().statusLabel || plan.description || "";
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      if (state !== "READY" && !networkEnded) network.endMission();
    }

    scene.setState("READY");
    console.group(manifestBase.title);
    console.log("States: " + manifestBase.states + " / 16");
    console.log("BOS endpoints: " + manifestBase.bosEndpoints + " / 3");
    console.log("Civilian endpoints: " + manifestBase.civilianEndpoints + " / 8");
    console.log("STATUS: " + manifestBase.status);
    console.groupEnd();

    return {
      start: start,
      activateBOS: activateBOS,
      finishAndReturn: finishAndReturn,
      update: update,
      reset: reset,
      getState: function () { return state; },
      getNetworkState: function () { return settlementContextActive() ? "READY" : state; },
      getCellLoadProfileState: function () { return settlementContextActive() ? "READY" : state; },
      getBosEndpointIds: function () { return settlementContextActive() ? [] : (plan.network.activeBosEndpointIds || []).slice(); },
      getCompletionSettlementStatus: getCompletionSettlementStatus,
      getPhaseLabel: function () { return definition().phaseLabel || "Bereitschaft"; },
      getStageLabel: function () { return definition().stageLabel || "Bereit"; },
      getStatusLabel: function () { return definition().statusLabel || "Bereit"; },
      getDescription: description,
      getProgress: function () { return finite(definition().progress, 0); },
      isActive: function () { return state !== "READY" && state !== "FAILED"; },
      isCompleted: function () { return state === "COMPLETED"; },
      canStart: canStart,
      canActivateBOS: canActivateBOS,
      canFinish: canFinish,
      getManifest: getManifest,
      getSafetyStatus: getSafetyStatus,
      dispose: dispose
    };
  }

  window.MissionBosMission004Controller = { create: create };
})();
