/* Mission BOS - Build 011N.1
   Mission 002 Arena Medical Emergency orchestration.
   Owns no vehicle movement, radio decision, capacity formula or crowd placement.
*/
(function () {
  "use strict";

  function finite(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function createFailedRuntime(plan, message) {
    var manifest = {
      title: "MISSION BOS MISSION 002 RUNTIME MANIFEST",
      states: plan && plan.states ? plan.states.length : 0,
      sceneActors: plan && plan.scene && plan.scene.actors ? plan.scene.actors.length : 0,
      patients: plan && plan.scene ? plan.scene.actors.filter(function (actor) { return actor.role === "patient"; }).length : 0,
      paramedics: plan && plan.scene ? plan.scene.actors.filter(function (actor) { return actor.role === "paramedic"; }).length : 0,
      activeBosEndpoints: plan && plan.network ? plan.network.activeBosEndpointIds.length : 0,
      automaticMissionStarts: 0,
      automaticBOSActivations: 0,
      status: "FAILED"
    };
    var safety = {
      title: "MISSION BOS MISSION 002 RUNTIME SAFETY",
      state: "FAILED",
      dependencyErrors: 1,
      invalidTransitionErrors: 0,
      yieldErrors: 0,
      arenaOwnershipErrors: 0,
      ambulanceStateErrors: 0,
      networkErrors: 0,
      sceneErrors: 0,
      missionConflictErrors: 0,
      automaticActionErrors: 0,
      resetLeakErrors: 0,
      status: "FAILED",
      errors: [message || "Mission 002 initialization failed."]
    };
    console.error("MISSION BOS MISSION 002 FAILED: " + safety.errors[0]);
    return {
      start: function () { return false; },
      activateBOS: function () { return false; },
      finishAndReturn: function () { return false; },
      update: function () {},
      reset: function () { return false; },
      getState: function () { return "FAILED"; },
      getNetworkState: function () { return "FAILED"; },
      getCellLoadProfileState: function () { return "READY"; },
      getBosEndpointIds: function () { return []; },
      getPhaseLabel: function () { return "Fehler"; },
      getStageLabel: function () { return "Sicherheitsstopp"; },
      getStatusLabel: function () { return "Mission angehalten"; },
      getDescription: function () { return safety.errors[0]; },
      getProgress: function () { return 0; },
      isActive: function () { return false; },
      isCompleted: function () { return false; },
      canStart: function () { return false; },
      canActivateBOS: function () { return false; },
      canFinish: function () { return false; },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var plan = options.plan;
    var validation = options.validation;
    var sceneRuntime = options.sceneRuntime;
    var arenaEventRuntime = options.arenaEventRuntime;
    var ambulanceRuntime = options.ambulanceRuntime;
    var trafficRuntime = options.trafficRuntime;
    var mission001Runtime = options.mission001Runtime;
    var registryRuntime = options.missionRegistryRuntime;
    var ambulanceFoundationRuntime = options.ambulanceFoundationRuntime;
    var networkAdapter = options.networkAdapter;
    var cellLoadRuntime = options.cellLoadRuntime;
    var capacityRuntime = options.capacityRuntime;

    if (!plan || !validation || validation.status !== "PASSED" || !sceneRuntime || !arenaEventRuntime ||
        !ambulanceRuntime || !trafficRuntime || !mission001Runtime || !registryRuntime ||
        !ambulanceFoundationRuntime || !networkAdapter || !cellLoadRuntime || !capacityRuntime) {
      return createFailedRuntime(plan, "Mission 002 dependencies are incomplete or unsafe.");
    }

    var required = plan.runtimeContract || {};
    function contract(runtime, methods) {
      return (methods || []).every(function (method) { return runtime && typeof runtime[method] === "function"; });
    }
    if (!contract(sceneRuntime, required.requiredSceneMethods) ||
        !contract(arenaEventRuntime, required.requiredArenaEventMethods) ||
        !contract(ambulanceRuntime, required.requiredAmbulanceMethods) ||
        !contract(trafficRuntime, required.requiredTrafficMethods) ||
        !contract(networkAdapter, required.requiredNetworkAdapterMethods)) {
      return createFailedRuntime(plan, "Mission 002 runtime contract is incomplete.");
    }

    var statesById = Object.create(null);
    (plan.states || []).forEach(function (definition) { statesById[definition.id] = definition; });
    var state = (plan.sequence || {}).initialState || "READY";
    var stateElapsed = 0;
    var yieldRequested = false;
    var networkResetStarted = false;
    var returnIssued = false;
    var disposed = false;
    var failureMessage = "";
    var lastLoggedState = null;
    var automaticMissionStarts = 0;
    var automaticBOSActivations = 0;

    var manifest = {
      title: "MISSION BOS MISSION 002 RUNTIME MANIFEST",
      states: (plan.states || []).length,
      sceneActors: (plan.scene.actors || []).length,
      patients: (plan.scene.actors || []).filter(function (actor) { return actor.role === "patient"; }).length,
      paramedics: (plan.scene.actors || []).filter(function (actor) { return actor.role === "paramedic"; }).length,
      sceneProps: (plan.scene.props || []).length,
      activeBosEndpoints: (plan.network.activeBosEndpointIds || []).length,
      automaticMissionStarts: 0,
      automaticBOSActivations: 0,
      status: "PASSED"
    };

    function logManifest() {
      console.group(manifest.title);
      console.log("States: " + manifest.states + " / 15");
      console.log("Scene actors: " + manifest.sceneActors + " / 3");
      console.log("Patients: " + manifest.patients + " / 1");
      console.log("Paramedics: " + manifest.paramedics + " / 2");
      console.log("Scene props: " + manifest.sceneProps + " / 1");
      console.log("Active BOS endpoints: " + manifest.activeBosEndpoints + " / 1");
      console.log("Automatic mission starts: 0 / 0");
      console.log("Automatic BOS activations: 0 / 0");
      console.log("STATUS: " + manifest.status);
      console.groupEnd();
    }

    function runtimeStatus(runtime) {
      if (!runtime || typeof runtime.getSafetyStatus !== "function") return "FAILED";
      var result = runtime.getSafetyStatus();
      return result && result.status ? result.status : "FAILED";
    }

    function runtimeSafety(runtime) {
      if (!runtime || typeof runtime.getSafetyStatus !== "function") return null;
      return runtime.getSafetyStatus();
    }

    function runtimeUsable(runtime, allowRecoverableWarning) {
      var result = runtimeSafety(runtime);
      if (!result) return false;
      if (result.status === "PASSED") return true;
      return allowRecoverableWarning === true && result.fatal !== true;
    }

    function getDefinition() {
      return statesById[state] || statesById.READY || {};
    }

    function activeRegistryMission() {
      return registryRuntime && typeof registryRuntime.getActiveMissionId === "function"
        ? registryRuntime.getActiveMissionId() : null;
    }

    function selectedRegistryMission() {
      return registryRuntime && typeof registryRuntime.getSelectedMissionId === "function"
        ? registryRuntime.getSelectedMissionId() : null;
    }

    function getSafetyStatus() {
      var safety = {
        title: "MISSION BOS MISSION 002 RUNTIME SAFETY",
        state: state,
        dependencyErrors: 0,
        invalidTransitionErrors: 0,
        yieldErrors: 0,
        arenaOwnershipErrors: 0,
        ambulanceStateErrors: 0,
        networkErrors: 0,
        sceneErrors: 0,
        missionConflictErrors: 0,
        automaticActionErrors: 0,
        resetLeakErrors: 0,
        recoverableWarnings: 0,
        status: "PASSED",
        errors: [],
        warnings: []
      };
      if (!runtimeUsable(sceneRuntime, false) || !runtimeUsable(arenaEventRuntime, false) ||
          !runtimeUsable(ambulanceRuntime, false) || !runtimeUsable(networkAdapter, false) ||
          !runtimeUsable(cellLoadRuntime, true) || !runtimeUsable(capacityRuntime, true)) {
        safety.dependencyErrors += 1;
        safety.errors.push("One or more Mission 002 dependencies are unsafe.");
      }
      [
        { name: "Cell-load", runtime: cellLoadRuntime },
        { name: "Capacity", runtime: capacityRuntime }
      ].forEach(function (entry) {
        var dependencySafety = runtimeSafety(entry.runtime);
        if (dependencySafety && dependencySafety.status !== "PASSED" && dependencySafety.fatal !== true) {
          safety.recoverableWarnings += 1;
          safety.warnings.push(entry.name + " runtime reported a recoverable warning.");
        }
      });
      if (state !== "READY" && state !== "FAILED" && mission001Runtime.getState() !== "READY") {
        safety.missionConflictErrors += 1;
        safety.errors.push("Mission 001 changed state during Mission 002.");
      }
      var finalNetworkResetWithoutArenaOwnership = state === "RETURNING" && networkResetStarted === true &&
        ambulanceRuntime.getState() === "AT_STATION" && arenaEventRuntime.isActive() !== true;
      if (state !== "READY" && state !== "FAILED" && !finalNetworkResetWithoutArenaOwnership &&
          arenaEventRuntime.getOwnerMissionId() !== "MISSION_002") {
        safety.arenaOwnershipErrors += 1;
        safety.errors.push("Arena event ownership is missing during Mission 002.");
      }
      if (automaticMissionStarts !== 0 || automaticBOSActivations !== 0) {
        safety.automaticActionErrors += 1;
        safety.errors.push("An automatic user-gated action was detected.");
      }
      safety.status = safety.errors.length ? "FAILED" : "PASSED";
      return safety;
    }

    function logSafety(force) {
      if (!force && lastLoggedState === state) return;
      lastLoggedState = state;
      var safety = getSafetyStatus();
      var method = safety.status === "PASSED" ? "log" : "error";
      console.group(safety.title);
      console[method]("State: " + state);
      Object.keys(safety).filter(function (key) { return /Errors$/.test(key); }).forEach(function (key) {
        console[method](key + ": " + safety[key]);
      });
      console[method]("STATUS: " + safety.status);
      if (safety.errors.length) console.error(safety.errors);
      console.groupEnd();
    }

    function fail(message) {
      if (state === "FAILED") return false;
      failureMessage = message || "Mission 002 safety failed.";
      state = "FAILED";
      stateElapsed = 0;
      sceneRuntime.setState("FAILED");
      networkAdapter.setTargetLoad(38);
      if (yieldRequested) {
        trafficRuntime.releaseYield(plan.references.yieldVehicleId);
        yieldRequested = false;
      }
      console.error("MISSION BOS MISSION 002 FAILED: " + failureMessage);
      logSafety(true);
      return false;
    }

    function transition(nextState) {
      if (!statesById[nextState]) return fail("Unknown Mission 002 state: " + nextState);
      state = nextState;
      stateElapsed = 0;
      sceneRuntime.setState(nextState);
      if (!networkAdapter.setTargetLoad(finite(statesById[nextState].globalNetworkTarget, 38))) {
        return fail("Network adapter rejected Mission 002 target state " + nextState + ".");
      }
      logSafety(true);
      return true;
    }

    function getSharedStartBaselineStatus() {
      var networkReady = typeof networkAdapter.isReadyForMissionStart === "function"
        ? networkAdapter.isReadyForMissionStart() === true
        : (networkAdapter.isBOSActive() !== true &&
          Math.abs(networkAdapter.getLoad() - finite(plan.network.baseLoad, 38)) <= 4);
      var safetyStatus = getSafetyStatus();
      var blockers = [];
      if (disposed) blockers.push("DISPOSED");
      if (state !== "READY") blockers.push("MISSION_002_NOT_READY");
      if (mission001Runtime.getState() !== "READY") blockers.push("MISSION_001_NOT_READY");
      if (ambulanceRuntime.getState() !== "AT_STATION") blockers.push("AMBULANCE_NOT_AT_STATION");
      if (ambulanceFoundationRuntime.isActive()) blockers.push("AMBULANCE_FOUNDATION_ACTIVE");
      if (arenaEventRuntime.isActive()) blockers.push("ARENA_EVENT_ACTIVE");
      if (!networkReady) blockers.push("SHARED_NETWORK_NOT_READY");
      if (!safetyStatus || safetyStatus.status !== "PASSED") blockers.push("MISSION_002_DEPENDENCY_SAFETY");
      return {
        ready: blockers.length === 0,
        blockers: blockers,
        ambulanceState: ambulanceRuntime.getState(),
        networkReady: networkReady,
        safetyStatus: safetyStatus && safetyStatus.status || "FAILED"
      };
    }

    function canStart() {
      var baseline = getSharedStartBaselineStatus();
      return baseline.ready && selectedRegistryMission() === "MISSION_002" && !activeRegistryMission();
    }

    function start() {
      if (!canStart()) return false;
      failureMessage = "";
      yieldRequested = false;
      networkResetStarted = false;
      returnIssued = false;
      if (!arenaEventRuntime.activateForMission("MISSION_002")) return fail("Arena event could not be acquired by Mission 002.");
      var initialTarget = finite(statesById.EVENT_ACTIVE.globalNetworkTarget, 72);
      if (!networkAdapter.beginMission(initialTarget)) {
        arenaEventRuntime.deactivateForMission("MISSION_002");
        return fail("Network adapter rejected Mission 002 start.");
      }
      state = "EVENT_ACTIVE";
      stateElapsed = 0;
      sceneRuntime.setState(state);
      logSafety(true);
      return true;
    }

    function canActivateBOS() {
      // Status-only compatibility surface; no manual action is available in Build 011N.1.
      return false;
    }

    function activateBOS() {
      // Build 011N.1 compatibility method: BOS priority is automatic and cell-local.
      return state === "BOS_ACTIVE" || networkAdapter.isBOSActive() === true;
    }

    function canFinish() {
      return state === "COMPLETED" && ambulanceRuntime.getState() === "AT_ARENA" && getSafetyStatus().status === "PASSED";
    }

    function finishAndReturn() {
      if (!canFinish()) return false;
      sceneRuntime.setState("TRANSPORTING");
      if (!ambulanceRuntime.transportToHospital()) return fail("Ambulance rejected transport to hospital.");
      return transition("TRANSPORTING");
    }

    function releaseYield() {
      if (!yieldRequested) return true;
      var result = trafficRuntime.releaseYield(plan.references.yieldVehicleId);
      if (result) yieldRequested = false;
      return result;
    }

    function update(delta) {
      if (disposed || state === "READY" || state === "FAILED") return;
      var safeDelta = Math.max(0, Math.min(finite(delta, 0), 0.25));
      stateElapsed += safeDelta;
      var safety = getSafetyStatus();
      if (safety.status !== "PASSED") {
        fail(safety.errors[0]);
        return;
      }

      if (state === "EVENT_ACTIVE") {
        if (stateElapsed >= finite(plan.sequence.eventLeadInSeconds, 1.5)) transition("CALL_RECEIVED");
        return;
      }
      if (state === "CALL_RECEIVED") {
        if (stateElapsed >= finite(plan.sequence.callDurationSeconds, 1.5)) {
          var requested = trafficRuntime.requestYieldAtDistance(
            plan.references.yieldVehicleId,
            finite(window.MISSION_BOS_AMBULANCE_PLAN.yielding.holdDistance, 37.44)
          );
          if (!requested || !ambulanceRuntime.startClearingCorridor()) {
            fail("Controlled Arena corridor yielding could not be started.");
            return;
          }
          yieldRequested = true;
          transition("CLEARING_CORRIDOR");
        }
        return;
      }
      if (state === "CLEARING_CORRIDOR") {
        if (trafficRuntime.isVehicleYielded(plan.references.yieldVehicleId)) {
          if (!ambulanceRuntime.dispatchToArena()) {
            fail("Ambulance could not dispatch after confirmed yielding.");
            return;
          }
          transition("ENROUTE");
        }
        return;
      }
      if (state === "ENROUTE") {
        if (ambulanceRuntime.getState() === "FAILED") { fail("Ambulance failed during Arena response."); return; }
        if (ambulanceRuntime.getState() === "AT_ARENA") transition("ON_SCENE");
        return;
      }
      if (state === "ON_SCENE") {
        if (ambulanceRuntime.getState() !== "AT_ARENA") { fail("Ambulance left Arena during ON_SCENE."); return; }
        if (stateElapsed >= finite(plan.sequence.onSceneHoldSeconds, 2)) transition("OVERLOADED");
        return;
      }
      if (state === "OVERLOADED") {
        if (networkAdapter.isBOSActive() === true) transition("BOS_ACTIVE");
        return;
      }
      if (state === "BOS_ACTIVE") {
        var capacitySettled = typeof networkAdapter.isCapacityPrioritySettled === "function"
          ? networkAdapter.isCapacityPrioritySettled()
          : stateElapsed >= finite(plan.sequence.bosActiveToStableSeconds, 2.5);
        if (capacitySettled) transition("COMMS_STABLE");
        return;
      }
      if (state === "COMMS_STABLE") {
        if (stateElapsed >= finite(plan.sequence.stableToTreatmentSeconds, 2.5)) transition("TREATMENT");
        return;
      }
      if (state === "TREATMENT") {
        if (stateElapsed >= finite(plan.sequence.treatmentSeconds, 4)) transition("COMPLETED");
        return;
      }
      if (state === "TRANSPORTING") {
        if (ambulanceRuntime.getState() === "FAILED") { fail("Ambulance failed during patient transport."); return; }
        if (ambulanceRuntime.getState() === "AT_HOSPITAL") transition("AT_HOSPITAL");
        return;
      }
      if (state === "AT_HOSPITAL") {
        if (stateElapsed >= finite(plan.sequence.hospitalHoldSeconds, 2.5) && !returnIssued) {
          returnIssued = true;
          if (!ambulanceRuntime.returnToStation()) { fail("Ambulance rejected automatic return to station."); return; }
          transition("RETURNING");
        }
        return;
      }
      if (state === "RETURNING") {
        if (ambulanceRuntime.getState() === "FAILED") { fail("Ambulance failed during return to station."); return; }
        if (ambulanceRuntime.getState() === "AT_STATION") {
          if (!releaseYield()) { fail("Civilian yield could not be released after Mission 002."); return; }
          if (arenaEventRuntime.isActive() && !arenaEventRuntime.deactivateForMission("MISSION_002")) {
            fail("Arena event could not be released by Mission 002."); return;
          }
          sceneRuntime.reset();
          if (!networkResetStarted) {
            networkResetStarted = true;
            networkAdapter.endMission();
          }
          if (Math.abs(networkAdapter.getLoad() - finite(plan.network.baseLoad, 38)) <= 0.001 &&
              !networkAdapter.isBOSActive() && !arenaEventRuntime.isActive()) {
            state = "READY";
            stateElapsed = 0;
            networkResetStarted = false;
            returnIssued = false;
            failureMessage = "";
            sceneRuntime.setState("READY");
            logSafety(true);
          }
        }
      }
    }

    function reset() {
      if (disposed) return false;
      if (state !== "READY") return false;
      releaseYield();
      sceneRuntime.reset();
      if (arenaEventRuntime.getOwnerMissionId() === "MISSION_002") arenaEventRuntime.deactivateForMission("MISSION_002");
      stateElapsed = 0;
      networkResetStarted = false;
      returnIssued = false;
      failureMessage = "";
      sceneRuntime.setState("READY");
      return true;
    }

    function dispose() {
      if (disposed) return;
      releaseYield();
      if (arenaEventRuntime.getOwnerMissionId() === "MISSION_002") arenaEventRuntime.deactivateForMission("MISSION_002");
      sceneRuntime.dispose();
      disposed = true;
    }

    function description() {
      var descriptions = {
        READY: "Arena-Veranstaltung und Rettungsdienst sind einsatzbereit.",
        EVENT_ACTIVE: "Die Großveranstaltung läuft; die Arena-Zelle trägt hohe zivile Nachfrage.",
        CALL_RECEIVED: "Ein medizinischer Notfall wurde gemeldet.",
        CLEARING_CORRIDOR: "Der Rettungsweg wird kontrolliert freigegeben.",
        ENROUTE: "Der Rettungswagen fährt zur Arena und wechselt dynamisch die Funkzelle.",
        ON_SCENE: "Rettungsdienst und Patientenszene sind an der Arena sichtbar.",
        OVERLOADED: "BOS-Kommunikation teilt eine stark belastete Arena-Zelle mit zivilen Sitzungen.",
        BOS_ACTIVE: "Die automatische BOS-Priorisierung wird aufgebaut.",
        COMMS_STABLE: "Die Rettungsdienst-Kommunikation ist priorisiert; zivile Nachfrage bleibt hoch.",
        TREATMENT: "Der Patient wird symbolisch versorgt.",
        COMPLETED: "Der Patient ist transportbereit.",
        TRANSPORTING: "Der Rettungswagen transportiert den Patienten zum Krankenhaus.",
        AT_HOSPITAL: "Kurze Patientenübergabe am Krankenhaus.",
        RETURNING: "Der Rettungswagen kehrt automatisch zur Rettungswache zurück.",
        FAILED: failureMessage || "Mission 002 wurde sicher angehalten."
      };
      return descriptions[state] || "";
    }

    logManifest();
    sceneRuntime.setState("READY");
    logSafety(true);

    return {
      start: start,
      activateBOS: activateBOS,
      finishAndReturn: finishAndReturn,
      update: update,
      reset: reset,
      getState: function () { return state; },
      getNetworkState: function () { return state; },
      getCellLoadProfileState: function () { return "READY"; },
      getBosEndpointIds: function () { return (plan.network.activeBosEndpointIds || []).slice(); },
      getPhaseLabel: function () { return getDefinition().phaseLabel || "Bereitschaft"; },
      getStageLabel: function () { return getDefinition().stageLabel || "Bereit"; },
      getStatusLabel: function () { return getDefinition().statusLabel || "Bereit"; },
      getDescription: description,
      getProgress: function () { return finite(getDefinition().progress, 0); },
      isActive: function () { return state !== "READY" && state !== "FAILED"; },
      isCompleted: function () { return state === "COMPLETED"; },
      canStart: canStart,
      getSharedStartBaselineStatus: getSharedStartBaselineStatus,
      canActivateBOS: canActivateBOS,
      canFinish: canFinish,
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: getSafetyStatus,
      dispose: dispose
    };
  }

  window.MissionBosMission002Controller = { create: create };
})();
