/* Mission BOS - Build 013M.4 preparation
   Swept-path validator for Mission 004 civilian Ring North clearance.
   Final implementation must expose a deterministic non-crossing trajectory for
   every special escape assignment via getTrafficClearanceTrajectory().
*/
(function () {
  "use strict";
  function finite(v, f) { v = Number(v); return isFinite(v) ? v : f; }
  function copy(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function zonePolygon(zone) {
    return [
      { x: Number(zone.xMin), z: Number(zone.zMin) }, { x: Number(zone.xMax), z: Number(zone.zMin) },
      { x: Number(zone.xMax), z: Number(zone.zMax) }, { x: Number(zone.xMin), z: Number(zone.zMax) }
    ];
  }
  function validate(options) {
    options = options || {};
    var plan = options.missionPlan, trafficPlan = options.trafficPlan, trafficValidator = options.trafficValidator, responseValidator = options.responseValidator, responseController = options.responseController;
    var r = { title: "MISSION BOS MISSION 004 TRAFFIC SWEPT PATH REGRESSION", dependencyErrors: 0, assignmentErrors: 0, incidentCrossingErrors: 0, trajectoryErrors: 0, wrapErrors: 0, sampledDistances: 0, status: "PASSED", errors: [] };
    function add(k, m) { r[k] += 1; r.errors.push(m); }
    if (!plan || !trafficPlan || !trafficValidator || !responseValidator || !responseController || typeof responseController.computeSafeHoldAssignment !== "function") {
      add("dependencyErrors", "Mission 004 swept-path validation dependencies are incomplete."); r.status = "FAILED"; return copy(r);
    }
    var closure = plan.trafficClosure || {}, ringDefinition = (trafficPlan.routes || []).filter(function (route) { return route.id === closure.routeId; })[0];
    var ring = ringDefinition && trafficValidator.prepareRoute(ringDefinition), vehicles = (trafficPlan.vehicles || []).filter(function (vehicle) { return (closure.affectedVehicleIds || []).indexOf(vehicle.id) >= 0; });
    if (!ring || vehicles.length !== 3) { add("dependencyErrors", "Ring route or Mission 004 civilian vehicles are unavailable."); r.status = "FAILED"; return copy(r); }
    var zone = zonePolygon(closure.closureZone || {}), routeLength = finite(closure.routeLength, ring.length), step = Math.min(0.05, Math.max(0.01, finite(closure.sweptPathValidationStep, 0.05)));
    var critical = closure.criticalApproachDistanceRange || {}, criticalMin = finite(critical.min, 30.5), criticalMax = finite(critical.max, 88.0), downstreamGate = finite(closure.downstreamClearAllowedOnlyAfterDistance, 88.0);
    function footprintHitsZone(vehicle, pose) {
      return responseValidator.polygonsOverlapSAT(responseValidator.rectangleCorners(pose, finite(vehicle.footprintLength, 0), finite(vehicle.footprintWidth, 0), 0.05), zone);
    }
    function routeTrajectory(current, assignment) {
      var out = [], travel = Math.max(0, finite(assignment.forwardDistance, 0));
      for (var d = 0; d <= travel + 1e-9; d += step) out.push(trafficValidator.sampleRoute(ring, current + Math.min(d, travel)));
      if (!out.length) out.push(trafficValidator.sampleRoute(ring, current));
      return out;
    }
    vehicles.forEach(function (vehicle, vehicleIndex) {
      for (var current = 0; current < routeLength; current += 0.25) {
        r.sampledDistances += 1;
        var assignment = responseController.computeSafeHoldAssignment(closure, current, vehicleIndex);
        if (!assignment || assignment.status !== "PASSED") { add("assignmentErrors", "Hold assignment failed at route distance " + current.toFixed(2) + " for " + vehicle.id + "."); continue; }
        if (assignment.forwardDistance > routeLength * 0.5 && assignment.mode !== "NON_CROSSING_ESCAPE") add("wrapErrors", "Unsafe wrap-around trajectory at " + current.toFixed(2) + " for " + vehicle.id + ".");
        if (current >= criticalMin - 1e-9 && current < downstreamGate - 1e-9 && assignment.holdDistance > downstreamGate + 1e-9 && assignment.mode !== "NON_CROSSING_ESCAPE") {
          add("incidentCrossingErrors", "Critical-approach vehicle is still routed forward through the incident at " + current.toFixed(2) + ".");
        }
        var trajectory = null;
        if (typeof responseController.getTrafficClearanceTrajectory === "function") trajectory = responseController.getTrafficClearanceTrajectory(closure, current, vehicleIndex, assignment, ring, trafficValidator);
        if (!Array.isArray(trajectory) || !trajectory.length) {
          if (assignment.mode === "NON_CROSSING_ESCAPE") { add("trajectoryErrors", "NON_CROSSING_ESCAPE lacks a deterministic validation trajectory at " + current.toFixed(2) + "."); continue; }
          trajectory = routeTrajectory(current, assignment);
        }
        for (var i = 0; i < trajectory.length; i += 1) {
          var pose = trajectory[i];
          if (!pose || !isFinite(Number(pose.x)) || !isFinite(Number(pose.z)) || !isFinite(Number(pose.angle))) { add("trajectoryErrors", "Invalid trajectory pose for " + vehicle.id + "."); break; }
          if (footprintHitsZone(vehicle, pose) && current < downstreamGate - 1e-9) { add("incidentCrossingErrors", vehicle.id + " swept footprint intersects the visible incident exclusion zone from start distance " + current.toFixed(2) + "."); break; }
        }
        if (current >= criticalMin - 1e-9 && current <= criticalMax + 1e-9 && assignment.mode === "CLEAR_PROTECTED_CORRIDOR") add("incidentCrossingErrors", "Legacy CLEAR_PROTECTED_CORRIDOR mode is forbidden inside the critical approach range.");
      }
    });
    if (r.errors.length) r.status = "FAILED";
    return copy(r);
  }
  function logResult(r) { console.group(r.title); console.log("sampledDistances: " + r.sampledDistances); console.log("incidentCrossingErrors: " + r.incidentCrossingErrors); console.log("trajectoryErrors: " + r.trajectoryErrors); console[r.status === "PASSED" ? "log" : "error"]("STATUS: " + r.status); if (r.errors.length) console.error(r.errors.slice(0, 30)); console.groupEnd(); }
  window.MissionBosMission004TrafficSweptPathValidator = { validate: validate, logResult: logResult };
})();
