/* Mission BOS - Build 013M.5 preparation
   Runtime-faithful fire/police return validator. Unlike the 013M.4 validator,
   this validates intermediate turn angles, the fire backout maneuver and the police release gate.
*/
(function () {
  "use strict";
  function finite(v, f) { v = Number(v); return isFinite(v) ? v : f; }
  function copy(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function normalizeAngle(angle) {
    var value = Number(angle) || 0;
    while (value > Math.PI) value -= Math.PI * 2;
    while (value < -Math.PI) value += Math.PI * 2;
    return value;
  }
  function shortestAngleDifference(from, to) { return normalizeAngle(to - from); }
  function lerpAngle(from, to, amount) {
    return normalizeAngle(from + shortestAngleDifference(from, to) * Math.max(0, Math.min(1, amount)));
  }
  function prefixPoints(routeDefinition, prefixEnd) {
    var points = (routeDefinition && routeDefinition.points ? routeDefinition.points : []).map(function (p) { return { x: Number(p.x), z: Number(p.z) }; });
    var bestIndex = 0, bestDistance = Infinity;
    points.forEach(function (p, index) {
      var dx = p.x - Number(prefixEnd.x), dz = p.z - Number(prefixEnd.z), d = dx * dx + dz * dz;
      if (d < bestDistance) { bestDistance = d; bestIndex = index; }
    });
    return points.slice(0, bestIndex + 1);
  }
  function validate(options) {
    options = options || {};
    var plan = options.missionPlan, responsePlan = options.responsePlan, validator = options.responseValidator;
    var r = {
      title: "MISSION BOS MISSION 004 RETURN MANEUVER REGRESSION",
      dependencyErrors: 0, routeErrors: 0, contractErrors: 0, collisionErrors: 0, completionErrors: 0,
      baselineTurningCollisionDetected: false, baselineFirstCollisionTimeSeconds: null,
      configuredCollisionCount: 0, configuredFirstCollisionTimeSeconds: null,
      fireBackoutDistanceMeters: null, fireBackoutSpeedMetersPerSecond: null,
      fireGateTimeSeconds: null, policeTurnStartTimeSeconds: null, totalReturnTimeSeconds: null,
      minimumStaticFireBackoutForSafeTurnMeters: null, status: "PASSED", errors: []
    };
    function add(k, m) { r[k] += 1; r.errors.push(m); }
    if (!plan || !responsePlan || !validator || typeof validator.prepareOpenRoute !== "function" ||
        typeof validator.sampleOpenRoute !== "function" || typeof validator.rectangleCorners !== "function" ||
        typeof validator.polygonsOverlapSAT !== "function") {
      add("dependencyErrors", "Mission 004 return maneuver validation dependencies are incomplete.");
      r.status = "FAILED"; return copy(r);
    }
    var response = plan.response || {}, fireProfile = response.fireRoute || {}, policeProfile = response.policeRoute || {}, seq = response.returnSequencing || {};
    function build(profile, id) {
      var baseline = (responsePlan.routes || []).filter(function (route) { return route.id === profile.baselinePrefixRouteId; })[0];
      if (!baseline) return null;
      return validator.prepareOpenRoute({ id: "M004_RETURN_" + id, points: prefixPoints(baseline, profile.baselinePrefixEnd).concat((profile.extensionWaypoints || []).map(function (p) { return { x: Number(p.x), z: Number(p.z) }; })), closed: false });
    }
    var fireRoute = build(fireProfile, "FIRE"), policeRoute = build(policeProfile, "POLICE");
    var fireVehicle = (responsePlan.vehicles || []).filter(function (v) { return v.id === "RESPONSE_FIRE_01"; })[0];
    var policeVehicle = (responsePlan.vehicles || []).filter(function (v) { return v.id === "RESPONSE_POLICE_01"; })[0];
    if (!fireRoute || !policeRoute || !fireVehicle || !policeVehicle) {
      add("routeErrors", "Fire/police Mission 004 routes or vehicle footprints are missing."); r.status = "FAILED"; return copy(r);
    }
    if (seq.strategy !== "FIRE_BACKOUT_TURN_THEN_POLICE_GATE" || seq.fireBackoutKeepsOutboundHeading !== true || seq.fireTurnsOnlyAfterBackout !== true ||
        seq.policeMayNotRotateBeforeGate !== true || seq.fireGateId !== seq.policeGateId || seq.policeGateVehicleId !== "RESPONSE_FIRE_01") {
      add("contractErrors", "Build 013M.5 maneuver strategy or release gate is missing.");
    }
    var simulation = responsePlan.simulation || {};
    var margin = finite(seq.collisionSafetyMarginMeters, finite(simulation.collisionSafetyMargin, 0.05));
    var step = Math.min(0.01, Math.max(0.001, finite(seq.runtimeValidationStepSeconds, 0.01)));
    var turnSmoothing = finite(simulation.turnSmoothing, 10.0);
    var fireBackout = finite(seq.fireBackoutDistanceMeters, 0);
    var fireBackoutSpeed = finite(seq.fireBackoutSpeedMetersPerSecond, 0);
    var policeDelay = Math.max(finite(policeProfile.returnDelaySeconds, 0), finite(seq.policeMinimumReleaseDelaySeconds, 0));
    r.fireBackoutDistanceMeters = fireBackout;
    r.fireBackoutSpeedMetersPerSecond = fireBackoutSpeed;
    function polygon(pose, vehicle) {
      return validator.rectangleCorners(pose, finite(vehicle.footprintLength, 0), finite(vehicle.footprintWidth, 0), margin);
    }
    function overlap(firePose, policePose) {
      return validator.polygonsOverlapSAT(polygon(firePose, fireVehicle), polygon(policePose, policeVehicle));
    }
    var fireEnd = validator.sampleOpenRoute(fireRoute, fireRoute.length, false);
    var policeEnd = validator.sampleOpenRoute(policeRoute, policeRoute.length, false);

    /* Prove that the 013M.4 runtime gap is real: intermediate fire rotation at the old endpoint collides. */
    (function detectBaselineTurnCollision() {
      var fireAngle = normalizeAngle(fireEnd.angle), elapsed = 0;
      while (elapsed <= 1.5 + 1e-9) {
        elapsed += step;
        var target = normalizeAngle(validator.sampleOpenRoute(fireRoute, fireRoute.length, true).angle);
        fireAngle = lerpAngle(fireAngle, target, 1 - Math.exp(-turnSmoothing * step));
        if (overlap({ x: fireEnd.x, z: fireEnd.z, angle: fireAngle }, policeEnd)) {
          r.baselineTurningCollisionDetected = true;
          r.baselineFirstCollisionTimeSeconds = Math.round(elapsed * 1000) / 1000;
          return;
        }
      }
    })();
    if (!r.baselineTurningCollisionDetected) add("contractErrors", "Regression geometry no longer reproduces the known 013M.4 turn-sweep gap; review calibration before accepting this validator.");

    /* Static calibration reference: minimum fire backout that permits the full 180-degree turn beside stationary police. */
    for (var clearance = 0; clearance <= 10 + 1e-9; clearance += 0.25) {
      var distance = Math.max(0, fireRoute.length - clearance);
      var basePose = validator.sampleOpenRoute(fireRoute, distance, false);
      var safe = true;
      for (var degree = 0; degree <= 180; degree += 1) {
        if (overlap({ x: basePose.x, z: basePose.z, angle: basePose.angle + degree * Math.PI / 180 }, policeEnd)) { safe = false; break; }
      }
      if (safe) { r.minimumStaticFireBackoutForSafeTurnMeters = Math.round(clearance * 100) / 100; break; }
    }
    if (r.minimumStaticFireBackoutForSafeTurnMeters === null || fireBackout + 1e-9 < r.minimumStaticFireBackoutForSafeTurnMeters || fireBackout < 6.0 - 1e-9) {
      add("contractErrors", "Configured fire backout is below the validated turn-clearance requirement.");
    }
    if (!(fireBackoutSpeed > 0) || policeDelay < 4.0 - 1e-9) add("contractErrors", "Backout speed or police minimum release delay is invalid.");

    var fire = { distance: fireRoute.length, angle: normalizeAngle(fireEnd.angle), phase: "BACKOUT" };
    var police = { distance: policeRoute.length, angle: normalizeAngle(policeEnd.angle), phase: "WAITING" };
    var elapsed = 0, fireGate = false, maxDuration = 90;
    while (elapsed <= maxDuration + 1e-9) {
      elapsed += step;
      if (fire.phase === "BACKOUT") {
        fire.distance = Math.max(fireRoute.length - fireBackout, fire.distance - fireBackoutSpeed * step);
        var fireBackPose = validator.sampleOpenRoute(fireRoute, fire.distance, false);
        fire.angle = normalizeAngle(fireBackPose.angle);
        if (fire.distance <= fireRoute.length - fireBackout + 1e-9) fire.phase = "TURNING";
      } else if (fire.phase === "TURNING") {
        var fireTurnPose = validator.sampleOpenRoute(fireRoute, fire.distance, true);
        var fireTarget = normalizeAngle(fireTurnPose.angle);
        var fireDifference = Math.abs(shortestAngleDifference(fire.angle, fireTarget));
        fire.angle = lerpAngle(fire.angle, fireTarget, 1 - Math.exp(-turnSmoothing * step));
        if (fireDifference <= 0.12) {
          fire.angle = fireTarget;
          fire.phase = "RETURNING";
          fireGate = true;
          r.fireGateTimeSeconds = Math.round(elapsed * 1000) / 1000;
        }
      } else if (fire.phase === "RETURNING") {
        fire.distance = Math.max(0, fire.distance - finite(fireProfile.returnSpeed, 1) * step);
        var fireReturnPose = validator.sampleOpenRoute(fireRoute, fire.distance, true);
        fire.angle = normalizeAngle(fireReturnPose.angle);
        if (fire.distance <= 1e-9) fire.phase = "AT_STATION";
      }

      if (police.phase === "WAITING" && fireGate && elapsed + 1e-9 >= policeDelay) {
        police.phase = "TURNING";
        r.policeTurnStartTimeSeconds = Math.round(elapsed * 1000) / 1000;
      } else if (police.phase === "TURNING") {
        var policeTurnPose = validator.sampleOpenRoute(policeRoute, police.distance, true);
        var policeTarget = normalizeAngle(policeTurnPose.angle);
        var policeDifference = Math.abs(shortestAngleDifference(police.angle, policeTarget));
        police.angle = lerpAngle(police.angle, policeTarget, 1 - Math.exp(-turnSmoothing * step));
        if (policeDifference <= 0.12) { police.angle = policeTarget; police.phase = "RETURNING"; }
      } else if (police.phase === "RETURNING") {
        police.distance = Math.max(0, police.distance - finite(policeProfile.returnSpeed, 1) * step);
        var policeReturnPose = validator.sampleOpenRoute(policeRoute, police.distance, true);
        police.angle = normalizeAngle(policeReturnPose.angle);
        if (police.distance <= 1e-9) police.phase = "AT_STATION";
      }

      var firePosition = validator.sampleOpenRoute(fireRoute, fire.distance, false);
      var policePosition = validator.sampleOpenRoute(policeRoute, police.distance, false);
      var firePose = { x: firePosition.x, z: firePosition.z, angle: fire.angle };
      var policePose = { x: policePosition.x, z: policePosition.z, angle: police.angle };
      if (overlap(firePose, policePose)) {
        r.configuredCollisionCount += 1;
        r.configuredFirstCollisionTimeSeconds = Math.round(elapsed * 1000) / 1000;
        add("collisionErrors", "Configured Build 013M.5 return maneuver produces a fire/police SAT overlap including intermediate turn angles.");
        break;
      }
      if (fire.phase === "AT_STATION" && police.phase === "AT_STATION") {
        r.totalReturnTimeSeconds = Math.round(elapsed * 1000) / 1000;
        break;
      }
    }
    if (fire.phase !== "AT_STATION" || police.phase !== "AT_STATION") add("completionErrors", "Fire and police did not both reach station within the runtime-faithful return simulation.");
    if (r.errors.length) r.status = "FAILED";
    return copy(r);
  }
  function logResult(r) {
    console.group(r.title);
    console.log("baselineTurningCollisionDetected: " + r.baselineTurningCollisionDetected);
    console.log("baselineFirstCollisionTimeSeconds: " + r.baselineFirstCollisionTimeSeconds);
    console.log("minimumStaticFireBackoutForSafeTurnMeters: " + r.minimumStaticFireBackoutForSafeTurnMeters);
    console.log("fireBackoutDistanceMeters: " + r.fireBackoutDistanceMeters);
    console.log("fireGateTimeSeconds: " + r.fireGateTimeSeconds);
    console.log("policeTurnStartTimeSeconds: " + r.policeTurnStartTimeSeconds);
    console.log("configuredCollisionCount: " + r.configuredCollisionCount);
    console.log("totalReturnTimeSeconds: " + r.totalReturnTimeSeconds);
    console[r.status === "PASSED" ? "log" : "error"]("STATUS: " + r.status);
    if (r.errors.length) console.error(r.errors);
    console.groupEnd();
  }
  window.MissionBosMission004ReturnRouteValidator = { validate: validate, logResult: logResult };
})();
