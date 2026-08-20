/* Mission BOS - Build 013M.4 preparation
   Event-trace validator for early Mission 004 incident-cell overload timing.
*/
(function () {
  "use strict";
  function finite(v, f) { v = Number(v); return isFinite(v) ? v : f; }
  function copy(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function validate(options) {
    options = options || {};
    var plan = options.missionPlan, trace = Array.isArray(options.trace) ? options.trace.slice() : [];
    var r = { title: "MISSION BOS MISSION 004 NETWORK TIMING REGRESSION", dependencyErrors: 0, traceErrors: 0, preArrivalLoadErrors: 0, overloadTimingErrors: 0, responderEntryErrors: 0, priorityErrors: 0, dynamicCellErrors: 0, ambulanceArrivalTime: null, overloadTime: null, priorityTime: null, fireArrivalTime: null, policeArrivalTime: null, status: "PASSED", errors: [] };
    function add(k, m) { r[k] += 1; r.errors.push(m); }
    if (!plan || trace.length < 2) { add("dependencyErrors", "Mission 004 network timing requires the frozen plan and a chronological runtime trace."); r.status = "FAILED"; return copy(r); }
    trace.sort(function (a, b) { return finite(a.time, 0) - finite(b.time, 0); });
    var n = plan.network || {}, deadline = finite(n.ambulanceArrivalOverloadDeadlineSeconds, 0.75), preMax = finite(n.preAmbulanceMaximumLoad, 89);
    var ambulanceIndex = -1, fireIndex = -1, policeIndex = -1;
    for (var i = 0; i < trace.length; i += 1) {
      if (ambulanceIndex < 0 && trace[i].ambulanceState === "AT_INCIDENT") ambulanceIndex = i;
      if (fireIndex < 0 && trace[i].fireAtScene === true) fireIndex = i;
      if (policeIndex < 0 && trace[i].policeAtScene === true) policeIndex = i;
    }
    if (ambulanceIndex < 0) { add("traceErrors", "Trace never records AMBULANCE_01 = AT_INCIDENT."); r.status = "FAILED"; return copy(r); }
    r.ambulanceArrivalTime = finite(trace[ambulanceIndex].time, 0);
    var preWindow = trace.filter(function (s) { var t = finite(s.time, 0); return t < r.ambulanceArrivalTime && t >= r.ambulanceArrivalTime - 1.5; });
    if (!preWindow.length) add("traceErrors", "Trace has no pre-arrival load window.");
    if (preWindow.length) {
      var preLoads = preWindow.map(function (s) { return finite(s.incidentLoad, -1); });
      var prePeak = Math.max.apply(Math, preLoads), preTail = preLoads[preLoads.length - 1];
      if (prePeak >= 90 - 1e-9) add("preArrivalLoadErrors", "Incident cell overloads before ambulance arrival; pre-arrival load must remain below 90%.");
      if (preTail < 85 - 1e-9 || preTail > preMax + 1e-9) add("preArrivalLoadErrors", "Immediately before ambulance arrival the incident cell must be in the 85-89% range.");
    }
    for (var j = ambulanceIndex; j < trace.length; j += 1) {
      if (finite(trace[j].incidentLoad, 0) >= 99.999) { r.overloadTime = finite(trace[j].time, 0); break; }
    }
    if (r.overloadTime === null || r.overloadTime - r.ambulanceArrivalTime > deadline + 1e-9) add("overloadTimingErrors", "Incident cell did not reach 100% within the ambulance-arrival deadline.");
    if (fireIndex >= 0) r.fireArrivalTime = finite(trace[fireIndex].time, 0); else add("traceErrors", "Trace never records fire at scene.");
    if (policeIndex >= 0) r.policeArrivalTime = finite(trace[policeIndex].time, 0); else add("traceErrors", "Trace never records police at scene.");
    function validateResponder(index, label) {
      if (index < 0 || r.overloadTime === null) return;
      var s = trace[index];
      if (finite(s.time, 0) <= r.overloadTime + 1e-9) add("responderEntryErrors", label + " must arrive after the incident cell has already overloaded.");
      if (finite(s.incidentLoad, 0) < 98 - 1e-9) add("responderEntryErrors", label + " enters with incident-cell load below 98%.");
      if (s.incidentTowerId && s[label === "Fire" ? "fireServingTowerId" : "policeServingTowerId"] && s.incidentTowerId !== s[label === "Fire" ? "fireServingTowerId" : "policeServingTowerId"]) add("dynamicCellErrors", label + " is not dynamically associated with the incident cell at scene arrival.");
    }
    validateResponder(fireIndex, "Fire"); validateResponder(policeIndex, "Police");
    for (var k = ambulanceIndex; k < trace.length; k += 1) {
      if (trace[k].priorityActive === true) { r.priorityTime = finite(trace[k].time, 0); break; }
    }
    if (r.priorityTime === null) add("priorityErrors", "Automatic BOS priority never activates after ambulance-triggered overload.");
    else if (r.overloadTime !== null && r.priorityTime - r.overloadTime > 1.5 + 1e-9) add("priorityErrors", "Automatic BOS priority activates too late after overload.");
    var arrival = trace[ambulanceIndex];
    if (!arrival.incidentTowerId || !arrival.ambulanceServingTowerId || arrival.incidentTowerId !== arrival.ambulanceServingTowerId) add("dynamicCellErrors", "At ambulance arrival, its confirmed serving cell must equal the dynamically derived incident hotspot cell.");
    if ((n.referenceIncidentCellIdForValidationOnly || "") === (arrival.incidentTowerId || "") && options.fixedTowerAssignmentDetected === true) add("dynamicCellErrors", "Reference MAST_C was used as a fixed serving-tower assignment.");
    if (r.errors.length) r.status = "FAILED";
    return copy(r);
  }
  function logResult(r) { console.group(r.title); ["ambulanceArrivalTime", "overloadTime", "priorityTime", "fireArrivalTime", "policeArrivalTime"].forEach(function (k) { console.log(k + ": " + r[k]); }); console[r.status === "PASSED" ? "log" : "error"]("STATUS: " + r.status); if (r.errors.length) console.error(r.errors); console.groupEnd(); }
  window.MissionBosMission004NetworkTimingValidator = { validate: validate, logResult: logResult };
})();
