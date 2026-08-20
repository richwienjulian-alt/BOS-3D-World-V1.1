/* Mission BOS - Build 011N.1
   Validated Mission 001 deterministic orchestration.
   Owns no vehicle, pedestrian, road or yield movement.
*/
(function () {
  "use strict";

  function create(options) {
    options = options || {};
    var incidentAccessRuntime = options.incidentAccessRuntime;
    var pedestrianRuntime = options.pedestrianRuntime;
    var networkAdapter = options.networkAdapter;
    var visualsRuntime = options.visualsRuntime;
    var plan = options.plan;

    var required = {
      incidentAccessRuntime: incidentAccessRuntime,
      pedestrianRuntime: pedestrianRuntime,
      networkAdapter: networkAdapter,
      visualsRuntime: visualsRuntime,
      plan: plan
    };
    var missing = Object.keys(required).filter(function (key) { return !required[key]; });
    if (missing.length) {
      console.error("MISSION BOS MISSION 001 CONTROLLER: Missing dependencies: " + missing.join(", "));
      return createFailedRuntime(plan, "Missing dependencies: " + missing.join(", "));
    }

    var stateDefinitions = Object.create(null);
    (plan.states || []).forEach(function (definition) {
      if (definition && definition.id) stateDefinitions[definition.id] = definition;
    });

    var state = plan.sequence.initialState || "READY";
    var stateElapsed = 0;
    var accessStartIssued = false;
    var networkResetStarted = false;
    var failureMessage = "";
    var lastSafetyLogState = null;

    function statusOf(runtime) {
      if (!runtime || typeof runtime.getSafetyStatus !== "function") return "FAILED";
      var value = runtime.getSafetyStatus();
      return value && value.status ? value.status : "FAILED";
    }

    function getSafetyStatus() {
      var incidentSafety = statusOf(incidentAccessRuntime);
      var pedestrianSafety = statusOf(pedestrianRuntime);
      var networkSafety = statusOf(networkAdapter);
      var visualSafety = statusOf(visualsRuntime);
      var passed = state !== "FAILED" &&
        incidentSafety === "PASSED" &&
        pedestrianSafety === "PASSED" &&
        networkSafety === "PASSED" &&
        visualSafety === "PASSED";
      return {
        status: passed ? "PASSED" : "FAILED",
        state: state,
        incidentAccessSafety: incidentSafety,
        pedestrianSafety: pedestrianSafety,
        networkSafety: networkSafety,
        visualSafety: visualSafety,
        message: failureMessage
      };
    }

    function logSafety(force) {
      if (!force && lastSafetyLogState === state) return;
      lastSafetyLogState = state;
      var safety = getSafetyStatus();
      var method = safety.status === "PASSED" ? "log" : "error";
      console.group("MISSION BOS MISSION 001 RUNTIME SAFETY");
      console[method]("State: " + state);
      console[method]("Incident access safety: " + safety.incidentAccessSafety);
      console[method]("Pedestrian safety: " + safety.pedestrianSafety);
      console[method]("Network safety: " + safety.networkSafety);
      console[method]("Visual safety: " + safety.visualSafety);
      console[method]("STATUS: " + safety.status);
      if (safety.message) console.error(safety.message);
      console.groupEnd();
    }

    function fail(message) {
      if (state === "FAILED") return false;
      failureMessage = message || "Mission 001 safety failed.";
      state = "FAILED";
      stateElapsed = 0;
      visualsRuntime.setState("FAILED");
      networkAdapter.setTargetLoad(stateDefinitions.FAILED ? stateDefinitions.FAILED.networkTarget : 38);
      console.error("MISSION BOS MISSION 001 FAILED: " + failureMessage);
      logSafety(true);
      return false;
    }

    function ensureSafety() {
      var safety = getSafetyStatus();
      if (safety.status !== "PASSED") {
        return fail(
          "Safety dependency failed: incident=" + safety.incidentAccessSafety +
          ", pedestrian=" + safety.pedestrianSafety +
          ", network=" + safety.networkSafety +
          ", visual=" + safety.visualSafety
        );
      }
      return true;
    }

    function transition(nextState) {
      if (!stateDefinitions[nextState]) return fail("Unknown mission state: " + nextState);
      state = nextState;
      stateElapsed = 0;
      visualsRuntime.setState(nextState);
      networkAdapter.setTargetLoad(stateDefinitions[nextState].networkTarget);
      logSafety(true);
      return true;
    }

    function start() {
      if (!canStart()) return false;
      failureMessage = "";
      accessStartIssued = false;
      networkResetStarted = false;
      var initialTarget = stateDefinitions.CALL_RECEIVED.networkTarget;
      if (!networkAdapter.beginMission(initialTarget)) {
        return fail("Network adapter rejected Mission 001 start.");
      }
      state = "CALL_RECEIVED";
      stateElapsed = 0;
      visualsRuntime.setState(state);
      logSafety(true);
      return true;
    }

    function activateBOS() {
      // Build 011N.1 compatibility method: BOS priority is automatic and cell-local.
      return state === "BOS_ACTIVE" || networkAdapter.isBOSActive() === true;
    }

    function finishAndReturn() {
      if (!canFinish()) return false;
      if (!incidentAccessRuntime.returnToStations()) {
        return fail("Incident access runtime rejected controlled return.");
      }
      networkResetStarted = false;
      return transition("RETURNING");
    }

    function reset() {
      if (incidentAccessRuntime.getState() !== "AT_STATIONS") return false;
      visualsRuntime.reset();
      networkAdapter.endMission();
      failureMessage = "";
      accessStartIssued = false;
      networkResetStarted = true;
      state = "RETURNING";
      stateElapsed = 0;
      return true;
    }

    function mapIncidentState(accessState) {
      if (accessState === "CLEARING_CORRIDOR") return "CLEARING_CORRIDOR";
      if (accessState === "DISPATCHING") return "DISPATCHING";
      if (accessState === "ENROUTE") return "ENROUTE";
      if (accessState === "HOLDING") return "ON_SCENE";
      if (accessState === "RETURNING") return "RETURNING";
      if (accessState === "FAILED") return "FAILED";
      return null;
    }

    function update(delta) {
      if (state === "READY" || state === "FAILED") return;
      if (!ensureSafety()) return;

      var safeDelta = Math.max(0, finiteNumber(delta, 0));
      stateElapsed += safeDelta;

      if (state === "CALL_RECEIVED") {
        var startAfter = finiteNumber(plan.sequence.incidentAccessStartAfterSeconds, 1.5);
        if (!accessStartIssued && stateElapsed >= startAfter) {
          accessStartIssued = true;
          if (!incidentAccessRuntime.start()) {
            fail("Incident access runtime rejected Mission 001 start.");
            return;
          }
          var firstMappedState = mapIncidentState(incidentAccessRuntime.getState());
          if (!firstMappedState || firstMappedState === "FAILED") {
            fail("Incident access did not enter a valid clearance state.");
            return;
          }
          transition(firstMappedState);
        }
        return;
      }

      if (state === "CLEARING_CORRIDOR" || state === "DISPATCHING" || state === "ENROUTE") {
        var accessState = incidentAccessRuntime.getState();
        var mapped = mapIncidentState(accessState);
        if (mapped === "FAILED") {
          fail("Incident access runtime entered FAILED.");
          return;
        }
        if (mapped && mapped !== state) transition(mapped);
        return;
      }

      if (state === "ON_SCENE") {
        if (incidentAccessRuntime.getState() !== "HOLDING") {
          fail("Incident access left HOLDING during ON_SCENE.");
          return;
        }
        if (stateElapsed >= finiteNumber(plan.sequence.onSceneHoldSeconds, 2.5)) {
          transition("OVERLOADED");
        }
        return;
      }

      if (state === "OVERLOADED") {
        if (networkAdapter.isBOSActive() === true) transition("BOS_ACTIVE");
        return;
      }

      if (state === "BOS_ACTIVE") {
        var capacitySettled = typeof networkAdapter.isCapacityPrioritySettled === "function"
          ? networkAdapter.isCapacityPrioritySettled()
          : stateElapsed >= finiteNumber(plan.sequence.bosActiveToStableSeconds, 3.0);
        if (capacitySettled) transition("COMMS_STABLE");
        return;
      }

      if (state === "COMMS_STABLE") {
        if (stateElapsed >= finiteNumber(plan.sequence.stableToCompletedSeconds, 4.5)) {
          transition("COMPLETED");
        }
        return;
      }

      if (state === "RETURNING") {
        var currentAccessState = incidentAccessRuntime.getState();
        if (currentAccessState === "FAILED") {
          fail("Incident access failed during return.");
          return;
        }
        if (currentAccessState === "AT_STATIONS") {
          if (!networkResetStarted) {
            networkResetStarted = true;
            visualsRuntime.reset();
            networkAdapter.endMission();
          }
          var baseLoad = finiteNumber(plan.network.baseLoad, 38);
          if (Math.abs(networkAdapter.getLoad() - baseLoad) <= 0.001 && !networkAdapter.isBOSActive()) {
            state = "READY";
            stateElapsed = 0;
            accessStartIssued = false;
            networkResetStarted = false;
            failureMessage = "";
            visualsRuntime.setState("READY");
            logSafety(true);
          }
        }
      }
    }

    function getDefinition() {
      return stateDefinitions[state] || stateDefinitions.READY || {};
    }

    function canStart() {
      return state === "READY" &&
        incidentAccessRuntime.getState() === "AT_STATIONS" &&
        getSafetyStatus().status === "PASSED" &&
        Math.abs(networkAdapter.getLoad() - finiteNumber(plan.network.baseLoad, 38)) <= 4.0 &&
        !networkAdapter.isBOSActive();
    }

    function canActivateBOS() {
      // Status-only compatibility surface; no manual action is available in Build 011N.1.
      return false;
    }

    function canFinish() {
      return state === "COMPLETED" && getSafetyStatus().status === "PASSED";
    }

    visualsRuntime.setState("READY");
    logSafety(true);

    return {
      start: start,
      activateBOS: activateBOS,
      finishAndReturn: finishAndReturn,
      update: update,
      reset: reset,
      getState: function () { return state; },
      getPhaseLabel: function () { return getDefinition().phaseLabel || "Bereitschaft"; },
      getStageLabel: function () { return getDefinition().stageLabel || "Bereit"; },
      getStatusLabel: function () { return getDefinition().statusLabel || "Bereit"; },
      getDescription: function () { return (plan.descriptions || {})[state] || ""; },
      getProgress: function () { return finiteNumber(getDefinition().progress, 0); },
      isActive: function () { return state !== "READY" && state !== "FAILED"; },
      isCompleted: function () { return state === "COMPLETED"; },
      canStart: canStart,
      canActivateBOS: canActivateBOS,
      canFinish: canFinish,
      getSafetyStatus: getSafetyStatus
    };
  }

  function createFailedRuntime(plan, message) {
    var descriptions = plan && plan.descriptions ? plan.descriptions : {};
    return {
      start: function () { return false; },
      activateBOS: function () { return false; },
      finishAndReturn: function () { return false; },
      update: function () {},
      reset: function () { return false; },
      getState: function () { return "FAILED"; },
      getPhaseLabel: function () { return "Fehler"; },
      getStageLabel: function () { return "Sicherheitsstopp"; },
      getStatusLabel: function () { return "Mission angehalten"; },
      getDescription: function () { return descriptions.FAILED || message || "Mission nicht verfügbar."; },
      getProgress: function () { return 0; },
      isActive: function () { return false; },
      isCompleted: function () { return false; },
      canStart: function () { return false; },
      canActivateBOS: function () { return false; },
      canFinish: function () { return false; },
      getSafetyStatus: function () { return { status: "FAILED", state: "FAILED", message: message || "Mission controller failed." }; }
    };
  }

  function finiteNumber(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  window.MissionBosMission001Controller = { create: create };
})();
