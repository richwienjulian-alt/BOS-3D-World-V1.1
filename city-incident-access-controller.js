/* Mission BOS - Build 008R.7
   Validated Incident Access & Yielding Foundation.

   Orchestrates deterministic traffic clearance, validated response dispatch,
   holding, return and civilian traffic release. No route generation, no
   coordinate correction and no mission visuals.
*/
(function () {
  "use strict";

  var STATES = Object.freeze({
    AT_STATIONS: "AT_STATIONS",
    CLEARING_CORRIDOR: "CLEARING_CORRIDOR",
    DISPATCHING: "DISPATCHING",
    ENROUTE: "ENROUTE",
    HOLDING: "HOLDING",
    RETURNING: "RETURNING",
    FAILED: "FAILED"
  });

  function createFailedRuntime(message) {
    var failure = {
      status: "FAILED",
      state: STATES.FAILED,
      corridorCleared: false,
      trafficYieldStatus: "FAILED",
      trafficSafety: "FAILED",
      responseSafety: "FAILED",
      failed: true,
      message: message || "Incident access controller failed."
    };
    console.error("MISSION BOS INCIDENT ACCESS CONTROLLER ABORTED: " + failure.message);
    return {
      start: function () { return false; },
      returnToStations: function () { return false; },
      update: function () {},
      reset: function () { return false; },
      getState: function () { return STATES.FAILED; },
      getStatusLabel: function () { return "Fehlgeschlagen"; },
      getDescription: function () { return "Sicherheitsprüfung hat die Bewegung angehalten."; },
      getClearanceStatus: function () { return copyStatus(failure); },
      getSafetyStatus: function () { return copyStatus(failure); }
    };
  }

  function create(options) {
    options = options || {};
    var trafficRuntime = options.trafficRuntime;
    var responseRuntime = options.responseRuntime;
    var plan = options.plan;

    if (!trafficRuntime || !responseRuntime || !plan) {
      return createFailedRuntime("Traffic runtime, response runtime or incident plan is missing.");
    }

    var requiredTrafficMethods = [
      "requestYieldAtDistance",
      "releaseYield",
      "releaseAllYields",
      "isVehicleYielded",
      "getYieldStatus",
      "getSafetyStatus"
    ];
    var requiredResponseMethods = [
      "dispatch",
      "returnToStations",
      "reset",
      "getState",
      "getSafetyStatus"
    ];

    for (var i = 0; i < requiredTrafficMethods.length; i += 1) {
      if (typeof trafficRuntime[requiredTrafficMethods[i]] !== "function") {
        return createFailedRuntime("Traffic runtime is missing method: " + requiredTrafficMethods[i]);
      }
    }
    for (var j = 0; j < requiredResponseMethods.length; j += 1) {
      if (typeof responseRuntime[requiredResponseMethods[j]] !== "function") {
        return createFailedRuntime("Response runtime is missing method: " + requiredResponseMethods[j]);
      }
    }

    var control = plan.trafficControl || {};
    var yieldRequests = control.yieldRequests || [];
    var maxClearanceWaitSeconds = finiteNumber(control.maxClearanceWaitSeconds, 20);
    var state = STATES.AT_STATIONS;
    var clearanceElapsed = 0;
    var corridorCleared = false;
    var failureMessage = "";
    var lastLoggedState = null;

    function fail(message) {
      if (state === STATES.FAILED) return false;
      state = STATES.FAILED;
      corridorCleared = false;
      failureMessage = message || "Incident access safety failed.";
      console.error("MISSION BOS INCIDENT ACCESS FAILED: " + failureMessage);
      logRuntimeStatus(true);
      return false;
    }

    function getTrafficSafety() {
      var value = trafficRuntime.getSafetyStatus();
      return value && value.status ? value.status : "FAILED";
    }

    function getResponseSafety() {
      var value = responseRuntime.getSafetyStatus();
      return value && value.status ? value.status : "FAILED";
    }

    function getCombinedYieldStatus() {
      if (!yieldRequests.length) return state === STATES.AT_STATIONS ? "NOT_REQUESTED" : "FAILED";
      var allYielded = true;
      for (var i = 0; i < yieldRequests.length; i += 1) {
        var status = trafficRuntime.getYieldStatus(yieldRequests[i].vehicleId);
        if (!status) return "FAILED";
        if (status.status === "FAILED" || status.status === "INVALID") return "FAILED";
        if (!status.yielded) allYielded = false;
      }
      return allYielded ? "YIELDED" : "CLEARING";
    }

    function ensureRuntimeSafety() {
      var trafficSafety = getTrafficSafety();
      var responseSafety = getResponseSafety();
      if (trafficSafety !== "PASSED") {
        return fail("Civilian traffic runtime safety is " + trafficSafety + ".");
      }
      if (responseSafety !== "PASSED") {
        return fail("Response vehicle runtime safety is " + responseSafety + ".");
      }
      if (state !== STATES.AT_STATIONS && getCombinedYieldStatus() === "FAILED") {
        return fail("Yield runtime status is invalid.");
      }
      return true;
    }

    function requestClearance() {
      for (var i = 0; i < yieldRequests.length; i += 1) {
        var request = yieldRequests[i];
        if (!trafficRuntime.requestYieldAtDistance(request.vehicleId, request.holdDistance)) {
          trafficRuntime.releaseAllYields();
          return fail("Yield request failed for " + request.vehicleId + ".");
        }
      }
      return true;
    }

    function start() {
      if (state !== STATES.AT_STATIONS) return false;
      if (!ensureRuntimeSafety()) return false;
      if (responseRuntime.getState() !== STATES.AT_STATIONS) {
        return fail("Response runtime is not at stations before clearance request.");
      }
      clearanceElapsed = 0;
      corridorCleared = false;
      failureMessage = "";
      if (!requestClearance()) return false;
      state = STATES.CLEARING_CORRIDOR;
      logRuntimeStatus(false);
      return true;
    }

    function returnToStations() {
      if (state !== STATES.HOLDING) return false;
      if (!ensureRuntimeSafety()) return false;
      if (!responseRuntime.returnToStations()) {
        return fail("Response runtime rejected the return command.");
      }
      state = STATES.RETURNING;
      logRuntimeStatus(false);
      return true;
    }

    function reset() {
      if (state !== STATES.AT_STATIONS) return false;
      trafficRuntime.releaseAllYields();
      corridorCleared = false;
      clearanceElapsed = 0;
      failureMessage = "";
      return responseRuntime.reset();
    }

    function mirrorResponseState() {
      var responseState = responseRuntime.getState();
      if (responseState === STATES.FAILED) {
        fail("Response runtime entered FAILED state.");
        return;
      }
      if (responseState === STATES.DISPATCHING) state = STATES.DISPATCHING;
      else if (responseState === STATES.ENROUTE) state = STATES.ENROUTE;
      else if (responseState === STATES.HOLDING) state = STATES.HOLDING;
      else if (responseState === STATES.RETURNING) state = STATES.RETURNING;
      else if (responseState === STATES.AT_STATIONS && state === STATES.RETURNING) {
        trafficRuntime.releaseAllYields();
        corridorCleared = false;
        clearanceElapsed = 0;
        state = STATES.AT_STATIONS;
      }
    }

    function update(delta) {
      if (state === STATES.FAILED || state === STATES.AT_STATIONS) return;
      if (!ensureRuntimeSafety()) return;

      var safeDelta = Math.max(0, finiteNumber(delta, 0));

      if (state === STATES.CLEARING_CORRIDOR) {
        clearanceElapsed += safeDelta;
        var allYielded = yieldRequests.length > 0 && yieldRequests.every(function (request) {
          return trafficRuntime.isVehicleYielded(request.vehicleId);
        });

        if (allYielded) {
          corridorCleared = true;
          if (!responseRuntime.dispatch()) {
            fail("Response dispatch was rejected after confirmed corridor clearance.");
            return;
          }
          state = STATES.DISPATCHING;
          logRuntimeStatus(false);
          return;
        }

        if (clearanceElapsed > maxClearanceWaitSeconds) {
          fail("Maximum corridor clearance wait time exceeded.");
        }
        return;
      }

      mirrorResponseState();
      if (state !== lastLoggedState) logRuntimeStatus(false);
    }

    function getStatusLabel() {
      var labels = {
        AT_STATIONS: "Bereit",
        CLEARING_CORRIDOR: "Einsatzkorridor wird geräumt",
        DISPATCHING: "Alarmierung",
        ENROUTE: "Anfahrt",
        HOLDING: "Bereitstellung erreicht",
        RETURNING: "Rückfahrt",
        FAILED: "Fehlgeschlagen"
      };
      return labels[state] || "Fehlgeschlagen";
    }

    function getDescription() {
      var descriptions = {
        AT_STATIONS: "Einsatzanfahrt zu W14 ist vorbereitet.",
        CLEARING_CORRIDOR: "Ein ziviles Fahrzeug räumt den gemeinsam genutzten BOS-Boulevard.",
        DISPATCHING: "Der Einsatzkorridor ist frei. Polizei und Feuerwehr werden alarmiert.",
        ENROUTE: "Validierte Einsatzfahrzeuge fahren auf dem BOS-Boulevard zu W14.",
        HOLDING: "Feuerwehr steht neben W14, Polizei sichert den nördlichen Abschnitt.",
        RETURNING: "Einsatzfahrzeuge kehren kontrolliert zu ihren Stationen zurück.",
        FAILED: "Sicherheitsprüfung hat die Bewegung angehalten."
      };
      return descriptions[state] || descriptions.FAILED;
    }

    function getClearanceStatus() {
      return {
        state: state,
        corridorCleared: corridorCleared,
        clearanceElapsed: clearanceElapsed,
        maxClearanceWaitSeconds: maxClearanceWaitSeconds,
        trafficYieldStatus: state === STATES.AT_STATIONS ? "NOT_REQUESTED" : getCombinedYieldStatus(),
        yieldRequests: yieldRequests.map(function (request) {
          return trafficRuntime.getYieldStatus(request.vehicleId);
        })
      };
    }

    function getSafetyStatus() {
      return {
        status: state === STATES.FAILED ? "FAILED" : "PASSED",
        state: state,
        corridorCleared: corridorCleared,
        trafficYieldStatus: state === STATES.AT_STATIONS ? "NOT_REQUESTED" : getCombinedYieldStatus(),
        trafficSafety: getTrafficSafety(),
        responseSafety: getResponseSafety(),
        failed: state === STATES.FAILED,
        message: failureMessage
      };
    }

    function logRuntimeStatus(failed) {
      if (!failed && lastLoggedState === state) return;
      lastLoggedState = state;
      var status = getSafetyStatus();
      var method = failed ? "error" : "log";
      console.group("MISSION BOS INCIDENT ACCESS SAFETY");
      console[method]("State: " + status.state);
      console[method]("Corridor cleared: " + status.corridorCleared);
      console[method]("Traffic yield status: " + status.trafficYieldStatus);
      console[method]("Traffic safety: " + status.trafficSafety);
      console[method]("Response safety: " + status.responseSafety);
      console[method]("STATUS: " + status.status);
      if (status.message) console.error(status.message);
      console.groupEnd();
    }

    logRuntimeStatus(false);

    return {
      start: start,
      returnToStations: returnToStations,
      update: update,
      reset: reset,
      getState: function () { return state; },
      getStatusLabel: getStatusLabel,
      getDescription: getDescription,
      getClearanceStatus: getClearanceStatus,
      getSafetyStatus: getSafetyStatus
    };
  }

  function finiteNumber(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function copyStatus(value) {
    var result = {};
    Object.keys(value || {}).forEach(function (key) { result[key] = value[key]; });
    return result;
  }

  window.MissionBosIncidentAccessController = {
    create: create,
    STATES: STATES
  };
})();
