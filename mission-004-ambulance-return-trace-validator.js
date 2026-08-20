/* Mission BOS - Build 013M.8 preparation - actual-runtime trace validator */
(function () {
  "use strict";
  function finite(v, f) { v = Number(v); return isFinite(v) ? v : f; }
  function validate(trace, contract) {
    trace = Array.isArray(trace) ? trace : [];
    contract = contract || {};
    var sm = contract.stateMachine || {};
    var r = { title: "MISSION BOS 013M.8 REAL AMBULANCE RETURN TRACE", sampleErrors: 0, sequenceErrors: 0, commandErrors: 0, timingErrors: 0, completionErrors: 0, status: "PASSED", errors: [] };
    function add(k, m) { r[k] += 1; r.errors.push(m); r.status = "FAILED"; }
    if (!trace.length) { add("sampleErrors", "No real Mission 004 ambulance return trace supplied."); return r; }
    var firstHospital = -1, firstReturning = -1, firstStationAfterReturn = -1, successfulCommands = 0;
    for (var i = 0; i < trace.length; i += 1) {
      var s = trace[i] || {};
      if (!isFinite(Number(s.time)) || typeof s.ambulanceState !== "string") add("sampleErrors", "Invalid trace sample at index " + i + ".");
      if (firstHospital < 0 && s.ambulanceState === "AT_HOSPITAL") firstHospital = i;
      if (firstHospital >= 0 && firstReturning < 0 && s.ambulanceState === "RETURNING") firstReturning = i;
      if (firstReturning >= 0 && firstStationAfterReturn < 0 && s.ambulanceState === "AT_STATION") firstStationAfterReturn = i;
      if (s.returnCommandResult === true) successfulCommands += 1;
    }
    if (firstHospital < 0 || firstReturning < 0 || firstStationAfterReturn < 0 || !(firstHospital < firstReturning && firstReturning < firstStationAfterReturn)) add("sequenceErrors", "Actual ambulance runtime did not show AT_HOSPITAL -> RETURNING -> AT_STATION in order.");
    if (sm.exactlyOneSuccessfulReturnCommand === true && successfulCommands !== 1) add("commandErrors", "Expected exactly one successful ambulance return command, got " + successfulCommands + ".");
    if (firstHospital >= 0 && firstReturning >= 0) {
      var hospitalT = finite(trace[firstHospital].time, 0), returningT = finite(trace[firstReturning].time, 0);
      var maxCommandTransition = finite(sm.hospitalHoldSeconds, 2.5) + finite(sm.returnCommandStateDeadlineSeconds, 0.35) + 0.15;
      if (returningT - hospitalT > maxCommandTransition) add("timingErrors", "Ambulance remained at hospital too long before real RETURNING state: " + (returningT - hospitalT).toFixed(2) + " s.");
    }
    if (firstReturning >= 0 && firstStationAfterReturn >= 0) {
      var returnT = finite(trace[firstReturning].time, 0), stationT = finite(trace[firstStationAfterReturn].time, 0);
      if (stationT - returnT > finite(sm.returnMaximumSeconds, 6.0) + 0.25) add("timingErrors", "Ambulance return exceeded maximum runtime: " + (stationT - returnT).toFixed(2) + " s.");
    }
    var last = trace[trace.length - 1] || {};
    if (last.missionState !== "READY" || last.ambulanceState !== "AT_STATION") add("completionErrors", "Trace did not finish with Mission 004 READY and ambulance AT_STATION.");
    return r;
  }
  function logResult(r) { var m=r.status === "PASSED" ? "log" : "error"; console.group(r.title); console[m]("STATUS: " + r.status); if(r.errors.length) console.error(r.errors); console.groupEnd(); }
  window.MissionBosMission004AmbulanceReturnTraceValidator = { validate: validate, logResult: logResult };
})();
