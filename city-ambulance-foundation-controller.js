/* Mission BOS - Build 010P.6
   Manual three-leg ambulance foundation controller.
   Headless-capable for the presentation build; no automatic mission or BOS action.
*/
(function () {
  "use strict";

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function createFailedRuntime(message, plan, ui) {
    ui = ui || {};
    if (ui.button) ui.button.disabled = true;
    if (ui.status) ui.status.textContent = "Rettungswagentest nicht verfügbar";
    var manifest = {
      title: "MISSION BOS AMBULANCE FOUNDATION CONTROLLER",
      yieldVehicleId: plan && plan.yielding ? plan.yielding.trafficVehicleId : null,
      mission002Runtimes: 0,
      automaticLegTransitions: 0,
      headlessUiSupported: true,
      status: "FAILED"
    };
    var safety = {
      title: "MISSION BOS AMBULANCE FOUNDATION CONTROLLER SAFETY",
      dependencyErrors: 1,
      invalidActionErrors: 0,
      missionProtectionErrors: 0,
      yieldErrors: 0,
      automaticMissionActions: 0,
      automaticBOSActivations: 0,
      mission002RuntimeErrors: 0,
      status: "FAILED",
      errors: [message || "Ambulance foundation controller failed."]
    };
    console.error(safety.errors[0]);
    return {
      update: function () {},
      advanceTest: function () { return false; },
      reset: function () { return false; },
      isActive: function () { return false; },
      getState: function () { return "FAILED"; },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var plan = options.plan;
    var ambulanceRuntime = options.ambulanceRuntime;
    var trafficRuntime = options.trafficRuntime;
    var mission001Runtime = options.mission001Runtime;
    var missionRegistryRuntime = options.missionRegistryRuntime;
    var associationRuntime = options.associationRuntime;
    var ui = options.ui || {};

    if (!plan || !ambulanceRuntime || !trafficRuntime || !mission001Runtime || !missionRegistryRuntime) {
      return createFailedRuntime("Ambulance foundation dependencies are incomplete.", plan, ui);
    }
    var rendererMethods = (plan.runtimeContract && plan.runtimeContract.requiredRendererMethods) || [];
    var rendererContractValid = rendererMethods.every(function (method) {
      return typeof ambulanceRuntime[method] === "function";
    });
    if (!rendererContractValid || typeof ambulanceRuntime.startClearingCorridor !== "function" ||
        typeof trafficRuntime.requestYieldAtDistance !== "function" ||
        typeof trafficRuntime.isVehicleYielded !== "function" ||
        typeof trafficRuntime.getYieldStatus !== "function" ||
        typeof trafficRuntime.releaseYield !== "function") {
      return createFailedRuntime("Ambulance or traffic runtime contract is incomplete.", plan, ui);
    }

    var yieldDefinition = plan.yielding;
    var disposed = false;
    var active = false;
    var yieldRequested = false;
    var failed = false;
    var invalidActionAttempts = 0;
    var buttonHandler = function () { advanceTest(); };
    if (ui.button && typeof ui.button.addEventListener === "function") {
      ui.button.addEventListener("click", buttonHandler);
    }

    var manifest = {
      title: "MISSION BOS AMBULANCE FOUNDATION CONTROLLER",
      yieldVehicleId: yieldDefinition.trafficVehicleId,
      mission002Runtimes: 0,
      automaticLegTransitions: 0,
      headlessUiSupported: true,
      visibleTestControlsRequired: false,
      status: "PASSED"
    };

    function logManifest() {
      console.group(manifest.title);
      console.log("Yield vehicle: " + manifest.yieldVehicleId);
      console.log("Mission 002 runtimes: " + manifest.mission002Runtimes);
      console.log("Automatic leg transitions between destinations: " + manifest.automaticLegTransitions);
      console.log("Headless UI supported: " + manifest.headlessUiSupported);
      console.log("STATUS: " + manifest.status);
      console.groupEnd();
    }

    var safety = {
      title: "MISSION BOS AMBULANCE FOUNDATION CONTROLLER SAFETY",
      dependencyErrors: 0,
      invalidActionErrors: 0,
      missionProtectionErrors: 0,
      yieldErrors: 0,
      automaticMissionActions: 0,
      automaticBOSActivations: 0,
      mission002RuntimeErrors: 0,
      status: "PASSED",
      errors: []
    };

    function missionIsReady() {
      var activeMissionId = typeof missionRegistryRuntime.getActiveMissionId === "function"
        ? missionRegistryRuntime.getActiveMissionId()
        : null;
      return mission001Runtime.getState() === "READY" && !activeMissionId;
    }

    function releaseYield() {
      if (!yieldRequested) return true;
      var released = trafficRuntime.releaseYield(yieldDefinition.trafficVehicleId);
      if (released) yieldRequested = false;
      return released;
    }

    function fail(message) {
      failed = true;
      active = false;
      releaseYield();
      safety.status = "FAILED";
      safety.errors.push(message);
      console.error("MISSION BOS AMBULANCE FOUNDATION FAILED: " + message);
      updateUI();
    }

    function isMovingOrClearing(state) {
      return state === "CLEARING_CORRIDOR" || state === "TO_ARENA" ||
        state === "TO_HOSPITAL" || state === "RETURNING";
    }

    function updateUI() {
      var state = ambulanceRuntime.getState();
      var labels = plan.testSequence.labels || {};
      var serving = associationRuntime && typeof associationRuntime.getServingTowerId === "function"
        ? associationRuntime.getServingTowerId(plan.networkExtension.associationEndpointId)
        : null;
      if (ui.servingCell) ui.servingCell.textContent = serving || "Wird ermittelt";
      if (ui.status) ui.status.textContent = ambulanceRuntime.getVehicleStatus();
      if (!ui.button) return;

      ui.button.classList.toggle("active", active);
      if (failed || state === "FAILED") {
        ui.button.disabled = true;
        ui.button.textContent = "Rettungswagentest fehlgeschlagen";
        return;
      }
      if (state === "AT_STATION") {
        ui.button.textContent = labels.AT_STATION || "Rettungswagen testen";
        ui.button.disabled = !missionIsReady();
        if (!missionIsReady() && ui.status) ui.status.textContent = "Mission muss bereit sein";
      } else if (state === "AT_ARENA") {
        ui.button.textContent = labels.AT_ARENA || "Transport zum Krankenhaus";
        ui.button.disabled = false;
      } else if (state === "AT_HOSPITAL") {
        ui.button.textContent = labels.AT_HOSPITAL || "Rückfahrt zur Rettungswache";
        ui.button.disabled = false;
      } else {
        ui.button.textContent = labels.MOVING || "Rettungswagen unterwegs";
        ui.button.disabled = true;
      }
    }

    function advanceTest() {
      if (disposed || failed) return false;
      var state = ambulanceRuntime.getState();
      if (state === "AT_STATION") {
        if (!missionIsReady()) {
          invalidActionAttempts += 1;
          updateUI();
          return false;
        }
        var requested = trafficRuntime.requestYieldAtDistance(
          yieldDefinition.trafficVehicleId,
          Number(yieldDefinition.holdDistance)
        );
        if (!requested || !ambulanceRuntime.startClearingCorridor()) {
          safety.yieldErrors += 1;
          fail("The controlled civilian-traffic yield could not be requested.");
          return false;
        }
        yieldRequested = true;
        active = true;
        updateUI();
        return true;
      }
      if (state === "AT_ARENA") {
        var hospitalStarted = ambulanceRuntime.transportToHospital();
        if (!hospitalStarted) invalidActionAttempts += 1;
        updateUI();
        return hospitalStarted;
      }
      if (state === "AT_HOSPITAL") {
        var returnStarted = ambulanceRuntime.returnToStation();
        if (!returnStarted) invalidActionAttempts += 1;
        updateUI();
        return returnStarted;
      }
      invalidActionAttempts += 1;
      updateUI();
      return false;
    }

    function update() {
      if (disposed || failed) return;
      var state = ambulanceRuntime.getState();
      var ambulanceSafety = ambulanceRuntime.getSafetyStatus();
      if (!ambulanceSafety || ambulanceSafety.status !== "PASSED" || state === "FAILED") {
        fail("The ambulance runtime reported a safety failure.");
        return;
      }
      if (active && mission001Runtime.getState() !== "READY") {
        safety.missionProtectionErrors += 1;
        fail("Mission 001 changed state during the isolated ambulance foundation test.");
        return;
      }
      if (state === "CLEARING_CORRIDOR" && trafficRuntime.isVehicleYielded(yieldDefinition.trafficVehicleId)) {
        if (!ambulanceRuntime.dispatchToArena()) {
          safety.yieldErrors += 1;
          fail("The ambulance could not start after confirmed yielding.");
          return;
        }
      }
      if (active && state === "AT_STATION") {
        if (!releaseYield()) {
          safety.yieldErrors += 1;
          fail("The civilian yield could not be released after ambulance return.");
          return;
        }
        active = false;
      }
      var yieldStatus = trafficRuntime.getYieldStatus(yieldDefinition.trafficVehicleId);
      if (yieldRequested && (!yieldStatus || yieldStatus.status === "NOT_REQUESTED")) {
        safety.yieldErrors += 1;
        fail("The required civilian yield was lost during the test sequence.");
        return;
      }
      safety.invalidActionErrors = invalidActionAttempts;
      updateUI();
    }

    function reset() {
      if (disposed || failed) return false;
      var state = ambulanceRuntime.getState();
      if (isMovingOrClearing(state) || active) return false;
      releaseYield();
      var resetResult = ambulanceRuntime.reset();
      active = false;
      updateUI();
      return resetResult;
    }

    function dispose() {
      disposed = true;
      releaseYield();
      if (ui.button && typeof ui.button.removeEventListener === "function") {
        ui.button.removeEventListener("click", buttonHandler);
      }
    }

    logManifest();
    updateUI();

    return {
      update: update,
      advanceTest: advanceTest,
      reset: reset,
      isActive: function () { return active; },
      getState: function () { return ambulanceRuntime.getState(); },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () {
        safety.invalidActionErrors = invalidActionAttempts;
        return copy(safety);
      },
      dispose: dispose
    };
  }

  window.MissionBosAmbulanceFoundationController = { create: create };
})();
