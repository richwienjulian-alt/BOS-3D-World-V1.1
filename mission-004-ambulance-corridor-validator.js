/* Mission BOS - Build 013M.9 preparation
   Static geometry gate for the corrected Mission 004 ambulance hospital corridor.
*/
(function () {
  "use strict";
  function finite(v, fallback) { v = Number(v); return isFinite(v) ? v : fallback; }
  function copy(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function makeResult() {
    return {
      title: "MISSION BOS MISSION 004 AMBULANCE CORRIDOR VALIDATION",
      dependencyErrors: 0, identityErrors: 0, routeErrors: 0, surfaceErrors: 0,
      obstacleErrors: 0, pedestrianErrors: 0, trafficReleaseContractErrors: 0,
      returnRegressionErrors: 0, status: "PASSED", errors: [], metrics: {}
    };
  }
  function add(r, key, message) { r[key] += 1; r.errors.push(message); }
  function finish(r) { if (r.errors.length) r.status = "FAILED"; return r; }
  function sameArray(a, b) { return JSON.stringify(a || []) === JSON.stringify(b || []); }
  function dist(a, b) { var dx = Number(a.x) - Number(b.x), dz = Number(a.z) - Number(b.z); return Math.sqrt(dx * dx + dz * dz); }
  function rectFrom(item) {
    var q = item && (item.worldRect || item.validationRect);
    return q ? { id: item.id, x: Number(q.x), z: Number(q.z), width: Number(q.width), depth: Number(q.depth) } : null;
  }
  function pointInRect(rect, p) {
    return p.x >= rect.x - rect.width / 2 && p.x <= rect.x + rect.width / 2 &&
      p.z >= rect.z - rect.depth / 2 && p.z <= rect.z + rect.depth / 2;
  }
  function routeSamples(prepared, validator, step) {
    var out = [], d;
    for (d = 0; d <= prepared.length + 1e-9; d += step) {
      out.push(validator.sampleOpenRoute(prepared, Math.min(d, prepared.length), false));
    }
    if (!out.length || dist(out[out.length - 1], validator.sampleOpenRoute(prepared, prepared.length, false)) > 1e-5) {
      out.push(validator.sampleOpenRoute(prepared, prepared.length, false));
    }
    return out;
  }
  function minCenterlineDistance(ambulanceSamples, pedestrianRoute, pedestrianValidator, step) {
    var best = Infinity, d, p, i, current;
    for (d = 0; d <= pedestrianRoute.length + 1e-9; d += step) {
      p = pedestrianValidator.samplePathDistance(pedestrianRoute, Math.min(d, pedestrianRoute.length));
      for (i = 0; i < ambulanceSamples.length; i += 1) {
        current = dist(ambulanceSamples[i], p);
        if (current < best) best = current;
      }
    }
    return best;
  }
  function validate(plan, contract, layout, staticProps, ambulancePlan, pedestrianPlan, responseValidator, pedestrianValidator) {
    var r = makeResult();
    if (!plan || !contract || !layout || !staticProps || !ambulancePlan || !pedestrianPlan || !responseValidator || !pedestrianValidator) {
      add(r, "dependencyErrors", "Mission 004 plan/contract or geometry validator dependency is missing.");
      return finish(r);
    }
    if (plan.build !== "013M.9" || plan.sourceBuildRequired !== contract.sourceBuildRequired ||
        plan.sourceArchiveSha256Required !== contract.sourceArchiveSha256Required) {
      add(r, "identityErrors", "Build/source identity does not match the frozen 013M.9 correction contract.");
    }
    var target = contract.targetHospitalRoute || {}, route = (plan.response || {}).ambulanceHospitalRoute || {};
    if (route.id !== target.id || !Array.isArray(route.points) || route.points.length < 10 ||
        finite(route.speed, -1) !== finite(target.speedMetersPerSecond, -2) ||
        !sameArray(route.allowedSurfaceIds, target.allowedSurfaceIds) ||
        (target.forbiddenSurfaceIds || []).some(function (id) { return (route.allowedSurfaceIds || []).indexOf(id) >= 0; })) {
      add(r, "routeErrors", "Corrected incident-to-hospital route definition is incomplete or still uses HOSPITAL_FORECOURT.");
    }
    if (route.points && route.points.length) {
      if (dist(route.points[0], target.start) > 0.01 || dist(route.points[route.points.length - 1], target.end) > 0.01) {
        add(r, "routeErrors", "Corrected hospital route start/end changed.");
      }
    }
    var prepared = responseValidator.prepareOpenRoute(route);
    if (!prepared || !isFinite(prepared.length) || prepared.length <= 0) {
      add(r, "routeErrors", "Corrected hospital route could not be prepared.");
      return finish(r);
    }
    r.metrics.routeLengthMeters = Number(prepared.length.toFixed(6));
    r.metrics.travelTimeSeconds = Number((prepared.length / finite(route.speed, 1)).toFixed(3));
    if (Math.abs(prepared.length - finite(target.referenceLengthMeters, prepared.length)) > 0.05) {
      add(r, "routeErrors", "Corrected hospital route length differs from the frozen reference.");
    }

    var surfaces = [];
    (layout.roadSurfaces || []).concat(layout.pavedAreas || []).forEach(function (item) {
      if ((route.allowedSurfaceIds || []).indexOf(item.id) >= 0 && item.worldRect) surfaces.push(rectFrom(item));
    });
    (ambulancePlan.accessSurfaces || []).forEach(function (item) {
      if ((route.allowedSurfaceIds || []).indexOf(item.id) >= 0 && item.validationRect) surfaces.push(rectFrom(item));
    });
    var vehicle = ambulancePlan.vehicle || {};
    var samples = routeSamples(prepared, responseValidator, 0.02);
    samples.some(function (pose) {
      var corners = responseValidator.rectangleCorners(pose, Number(vehicle.footprintLength), Number(vehicle.footprintWidth), 0.05);
      if (corners.some(function (corner) { return !surfaces.some(function (surface) { return pointInRect(surface, corner); }); })) {
        add(r, "surfaceErrors", "Ambulance footprint leaves the strict allowed-surface union on the corrected hospital route.");
        return true;
      }
      return false;
    });

    var obstacles = [];
    (layout.buildings || []).concat(layout.mobileTowers || []).concat(staticProps.props || []).forEach(function (item) {
      var rect = rectFrom(item); if (rect) obstacles.push(rect);
    });
    samples.some(function (pose) {
      var poly = responseValidator.rectangleCorners(pose, Number(vehicle.footprintLength), Number(vehicle.footprintWidth), 0.05);
      var hit = obstacles.find(function (obstacle) {
        var other = responseValidator.rectangleCorners({ x: obstacle.x, z: obstacle.z, angle: 0 }, obstacle.depth, obstacle.width, 0);
        return responseValidator.polygonsOverlapSAT(poly, other);
      });
      if (hit) { add(r, "obstacleErrors", "Corrected hospital route intersects " + hit.id + "."); return true; }
      return false;
    });

    var pedRoutes = Object.create(null);
    (pedestrianPlan.routes || []).forEach(function (definition) { pedRoutes[definition.id] = pedestrianValidator.prepareOpenRoute(definition); });
    var healthIds = (contract.rootCause && contract.rootCause.conflictingPedestrians) || [];
    var pedById = Object.create(null);
    (pedestrianPlan.pedestrians || []).forEach(function (p) { pedById[p.id] = p; });
    healthIds.forEach(function (id) {
      var ped = pedById[id], pRoute = ped && pedRoutes[ped.routeId];
      if (!ped || !pRoute) { add(r, "dependencyErrors", "Missing health pedestrian " + id + "."); return; }
      var minimum = minCenterlineDistance(samples, pRoute, pedestrianValidator, 0.05);
      r.metrics[id + "MinimumCenterlineMeters"] = Number(minimum.toFixed(6));
      if (minimum + 1e-9 < finite(target.minimumHealthPedestrianRouteClearanceMeters, 2.52)) {
        add(r, "pedestrianErrors", id + " remains too close to the corrected ambulance route: " + minimum.toFixed(3) + " m.");
      }
      if (minimum <= finite(contract.rootCause.runtimePedestrianStopDistanceMeters, 0.72)) {
        add(r, "pedestrianErrors", id + " still violates the real ambulance runtime pedestrian stop distance.");
      }
    });

    var sequence = plan.sequence || {}, corridor = ((plan.response || {}).returnCorridorReservation || {}), traffic = contract.trafficRelease || {};
    if (sequence.outerRingTrafficReleaseRequiresAmbulanceAtHospital !== true ||
        corridor.outerRingYieldsRemainActiveDuringHospitalTransport !== true ||
        corridor.releaseRequiresAmbulanceAtHospitalOrBeyond !== true ||
        traffic.ambulanceOutsideIncidentClosureAloneMayNotReleaseRingTraffic !== true) {
      add(r, "trafficReleaseContractErrors", "Outer-ring civilian traffic release is not gated until the ambulance has cleared the hospital transport leg.");
    }
    var ret = (plan.response || {}).ambulanceReturnRoute || {}, rc = contract.returnLeg || {};
    if (ret.id !== rc.routeId || finite(sequence.hospitalHoldSeconds, -1) !== finite(rc.hospitalHoldSeconds, -2) ||
        finite(sequence.ambulanceReturnCommandStateDeadlineSeconds, -1) !== finite(rc.returnCommandStateDeadlineSeconds, -2) ||
        finite(sequence.ambulanceReturnMaximumSeconds, -1) !== finite(rc.returnMaximumSeconds, -2)) {
      add(r, "returnRegressionErrors", "The already-correct 013M.8 hospital-to-station return contract changed.");
    }
    return finish(r);
  }
  function logResult(r) {
    var fn = r.status === "PASSED" ? "log" : "error";
    console.group(r.title); console[fn]("STATUS: " + r.status); console[fn](r.metrics); if (r.errors.length) console.error(r.errors); console.groupEnd();
  }
  window.MissionBosMission004AmbulanceCorridorValidator = { validate: validate, logResult: logResult };
})();
