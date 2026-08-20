/* Mission BOS - Build 013M.7 preparation
   Deterministic Mission 004 return-corridor validator.
   Detects the Build 013M.6 CAR_DOWNTOWN_01 conflict and validates the two frozen safe holds.
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
      var dx = p.x - Number(prefixEnd.x), dz = p.z - Number(prefixEnd.z), distance = dx * dx + dz * dz;
      if (distance < bestDistance) { bestDistance = distance; bestIndex = index; }
    });
    return points.slice(0, bestIndex + 1);
  }

  function validate(options) {
    options = options || {};
    var missionPlan = options.missionPlan, responsePlan = options.responsePlan, trafficPlan = options.trafficPlan;
    var responseValidator = options.responseValidator, trafficValidator = options.trafficValidator;
    var r = {
      title: "MISSION BOS MISSION 004 RETURN CORRIDOR REGRESSION",
      dependencyErrors: 0, contractErrors: 0, geometryErrors: 0, collisionErrors: 0, completionErrors: 0,
      downtownRouteLengthMeters: null, downtownLoopPeriodSeconds: null,
      baselinePhaseSamples: 0, baselineCollisionPhaseSamples: 0, baselineFirstCollision: null,
      southHoldDistance: null, eastHoldDistance: null, northHoldDistance: null, southHoldPose: null, eastHoldPose: null, northHoldPose: null,
      southHoldCollisionCount: 0, eastHoldCollisionCount: 0, northHoldCollisionCount: 0, maximumForwardTravelToHoldMeters: null,
      status: "PASSED", errors: []
    };
    function add(k, m) { r[k] += 1; r.errors.push(m); }
    if (!missionPlan || !responsePlan || !trafficPlan || !responseValidator || !trafficValidator ||
        typeof responseValidator.prepareOpenRoute !== "function" || typeof responseValidator.sampleOpenRoute !== "function" ||
        typeof responseValidator.rectangleCorners !== "function" || typeof responseValidator.polygonsOverlapSAT !== "function" ||
        typeof trafficValidator.prepareRoute !== "function" || typeof trafficValidator.sampleRoute !== "function") {
      add("dependencyErrors", "Return-corridor validation dependencies are incomplete.");
      r.status = "FAILED"; return copy(r);
    }

    var response = missionPlan.response || {}, reservation = response.returnCorridorReservation || {}, sequence = response.returnSequencing || {};
    var fireProfile = response.fireRoute || {}, policeProfile = response.policeRoute || {};
    if (reservation.strategy !== "YIELD_DOWNTOWN_BEFORE_FIRE_POLICE_RETURN" || reservation.vehicleId !== "CAR_DOWNTOWN_01" ||
        reservation.routeId !== "DOWNTOWN_LOOP" || reservation.firePoliceReturnRequiresConfirmedYield !== true ||
        reservation.firePoliceRemainStationaryUntilConfirmedYield !== true || reservation.releaseMayNotDisableRuntimeCollisionSafety !== true) {
      add("contractErrors", "Frozen downtown return-corridor strategy is missing or incomplete.");
    }

    function buildResponseRoute(profile, id) {
      var baseline = (responsePlan.routes || []).filter(function (route) { return route.id === profile.baselinePrefixRouteId; })[0];
      if (!baseline) return null;
      return responseValidator.prepareOpenRoute({
        id: id,
        points: prefixPoints(baseline, profile.baselinePrefixEnd).concat((profile.extensionWaypoints || []).map(function (p) { return { x: Number(p.x), z: Number(p.z) }; }))
      });
    }
    var fireRoute = buildResponseRoute(fireProfile, "M004_RETURN_FIRE");
    var policeRoute = buildResponseRoute(policeProfile, "M004_RETURN_POLICE");
    var fireVehicle = (responsePlan.vehicles || []).filter(function (v) { return v.id === "RESPONSE_FIRE_01"; })[0];
    var policeVehicle = (responsePlan.vehicles || []).filter(function (v) { return v.id === "RESPONSE_POLICE_01"; })[0];
    var downtownVehicle = (trafficPlan.vehicles || []).filter(function (v) { return v.id === reservation.vehicleId; })[0];
    var downtownDefinition = (trafficPlan.routes || []).filter(function (route) { return route.id === reservation.routeId; })[0];
    var downtownRoute = downtownDefinition && trafficValidator.prepareRoute(downtownDefinition);
    if (!fireRoute || !policeRoute || !fireVehicle || !policeVehicle || !downtownVehicle || !downtownRoute) {
      add("geometryErrors", "Fire, police or downtown validation geometry is missing.");
      r.status = "FAILED"; return copy(r);
    }
    r.downtownRouteLengthMeters = Math.round(downtownRoute.length * 1000000) / 1000000;
    r.downtownLoopPeriodSeconds = Math.round((downtownRoute.length / finite(downtownVehicle.speed, 1)) * 1000000) / 1000000;
    r.southHoldDistance = finite(reservation.southApproachHoldDistance, -1);
    r.eastHoldDistance = finite(reservation.eastBypassHoldDistance, -1);
    r.northHoldDistance = finite(reservation.northExitHoldDistance, -1);
    var safeHolds = (reservation.safeHoldDistances || [r.northHoldDistance, r.eastHoldDistance, r.southHoldDistance]).map(Number).sort(function (a, b) { return a - b; });
    var gaps = [];
    for (var gapIndex = 0; gapIndex < safeHolds.length; gapIndex += 1) {
      var here = safeHolds[gapIndex], next = gapIndex + 1 < safeHolds.length ? safeHolds[gapIndex + 1] : safeHolds[0] + downtownRoute.length;
      gaps.push(next - here);
    }
    r.maximumForwardTravelToHoldMeters = Math.round(Math.max.apply(Math, gaps) * 1000000) / 1000000;
    r.southHoldPose = trafficValidator.sampleRoute(downtownRoute, r.southHoldDistance);
    r.eastHoldPose = trafficValidator.sampleRoute(downtownRoute, r.eastHoldDistance);
    r.northHoldPose = trafficValidator.sampleRoute(downtownRoute, r.northHoldDistance);
    if (!(r.southHoldDistance >= 0 && r.southHoldDistance < downtownRoute.length && r.eastHoldDistance >= 0 && r.eastHoldDistance < downtownRoute.length && r.northHoldDistance >= 0 && r.northHoldDistance < downtownRoute.length)) {
      add("contractErrors", "Return-corridor hold distances are outside DOWNTOWN_LOOP.");
    }
    if (r.maximumForwardTravelToHoldMeters > finite(reservation.maximumForwardTravelToHoldMeters, 0) + 0.01 ||
        r.maximumForwardTravelToHoldMeters / finite(downtownVehicle.speed, 1) > finite(reservation.maximumWaitSeconds, 0) + 1e-9) {
      add("contractErrors", "Return-corridor maximum forward travel/wait contract is too small.");
    }

    var margin = finite(sequence.collisionSafetyMarginMeters, finite(responsePlan.simulation && responsePlan.simulation.collisionSafetyMargin, 0.05));
    var turnSmoothing = finite(responsePlan.simulation && responsePlan.simulation.turnSmoothing, 10);
    var simStep = 0.05;
    function overlap(responsePose, responseVehicle, civilianPose) {
      return responseValidator.polygonsOverlapSAT(
        responseValidator.rectangleCorners(responsePose, finite(responseVehicle.footprintLength, 0), finite(responseVehicle.footprintWidth, 0), margin),
        responseValidator.rectangleCorners(civilianPose, finite(downtownVehicle.footprintLength, 0), finite(downtownVehicle.footprintWidth, 0), margin)
      );
    }

    function simulate(downtownMode, phaseOffsetSeconds) {
      var fireEnd = responseValidator.sampleOpenRoute(fireRoute, fireRoute.length, false);
      var policeEnd = responseValidator.sampleOpenRoute(policeRoute, policeRoute.length, false);
      var fire = { distance: fireRoute.length, angle: normalizeAngle(fireEnd.angle), phase: "BACKOUT" };
      var police = { distance: policeRoute.length, angle: normalizeAngle(policeEnd.angle), phase: "WAITING" };
      var fireGate = false;
      for (var elapsed = simStep; elapsed <= 60 + 1e-9; elapsed += simStep) {
        if (fire.phase === "BACKOUT") {
          fire.distance = Math.max(fireRoute.length - finite(sequence.fireBackoutDistanceMeters, 0), fire.distance - finite(sequence.fireBackoutSpeedMetersPerSecond, 1) * simStep);
          fire.angle = normalizeAngle(responseValidator.sampleOpenRoute(fireRoute, fire.distance, false).angle);
          if (fire.distance <= fireRoute.length - finite(sequence.fireBackoutDistanceMeters, 0) + 1e-9) fire.phase = "TURNING";
        } else if (fire.phase === "TURNING") {
          var fireTurn = responseValidator.sampleOpenRoute(fireRoute, fire.distance, true), fireTarget = normalizeAngle(fireTurn.angle);
          var fireDiff = Math.abs(shortestAngleDifference(fire.angle, fireTarget));
          fire.angle = lerpAngle(fire.angle, fireTarget, 1 - Math.exp(-turnSmoothing * simStep));
          if (fireDiff <= 0.12) { fire.angle = fireTarget; fire.phase = "RETURNING"; fireGate = true; }
        } else if (fire.phase === "RETURNING") {
          fire.distance = Math.max(0, fire.distance - finite(fireProfile.returnSpeed, 1) * simStep);
          fire.angle = normalizeAngle(responseValidator.sampleOpenRoute(fireRoute, fire.distance, true).angle);
          if (fire.distance <= 1e-9) fire.phase = "AT_STATION";
        }

        if (police.phase === "WAITING" && fireGate && elapsed + 1e-9 >= finite(sequence.policeMinimumReleaseDelaySeconds, 4)) {
          police.phase = "TURNING";
        } else if (police.phase === "TURNING") {
          var policeTurn = responseValidator.sampleOpenRoute(policeRoute, police.distance, true), policeTarget = normalizeAngle(policeTurn.angle);
          var policeDiff = Math.abs(shortestAngleDifference(police.angle, policeTarget));
          police.angle = lerpAngle(police.angle, policeTarget, 1 - Math.exp(-turnSmoothing * simStep));
          if (policeDiff <= 0.12) { police.angle = policeTarget; police.phase = "RETURNING"; }
        } else if (police.phase === "RETURNING") {
          police.distance = Math.max(0, police.distance - finite(policeProfile.returnSpeed, 1) * simStep);
          police.angle = normalizeAngle(responseValidator.sampleOpenRoute(policeRoute, police.distance, true).angle);
          if (police.distance <= 1e-9) police.phase = "AT_STATION";
        }

        var fp = responseValidator.sampleOpenRoute(fireRoute, fire.distance, false);
        var pp = responseValidator.sampleOpenRoute(policeRoute, police.distance, false);
        var firePose = { x: fp.x, z: fp.z, angle: fire.angle }, policePose = { x: pp.x, z: pp.z, angle: police.angle };
        var civilianPose = downtownMode === "SOUTH_HOLD" ? r.southHoldPose :
          (downtownMode === "EAST_HOLD" ? r.eastHoldPose :
          (downtownMode === "NORTH_HOLD" ? r.northHoldPose : trafficValidator.sampleRoute(downtownRoute,
            finite(downtownVehicle.startDistance, 0) + finite(downtownVehicle.speed, 0) * (finite(phaseOffsetSeconds, 0) + elapsed))));
        if (overlap(firePose, fireVehicle, civilianPose)) return { hit: true, time: Math.round(elapsed * 100) / 100, responseVehicleId: fireVehicle.id, civilianPose: civilianPose, responsePose: firePose };
        if (overlap(policePose, policeVehicle, civilianPose)) return { hit: true, time: Math.round(elapsed * 100) / 100, responseVehicleId: policeVehicle.id, civilianPose: civilianPose, responsePose: policePose };
        if (fire.phase === "AT_STATION" && police.phase === "AT_STATION") return { hit: false, time: Math.round(elapsed * 100) / 100 };
      }
      return { hit: false, time: 60, incomplete: true };
    }

    var phaseStep = finite(reservation.phaseSweepStepSeconds, 0.25), phaseDuration = finite(reservation.phaseSweepDurationSeconds, 300);
    for (var offset = 0; offset <= phaseDuration + 1e-9; offset += phaseStep) {
      r.baselinePhaseSamples += 1;
      var baseline = simulate("MOVING", offset);
      if (baseline.hit) {
        r.baselineCollisionPhaseSamples += 1;
        if (!r.baselineFirstCollision) r.baselineFirstCollision = { phaseOffsetSeconds: Math.round(offset * 100) / 100, collision: baseline };
      }
    }
    if (r.baselineCollisionPhaseSamples <= 0) add("collisionErrors", "Build 013M.6 moving downtown conflict was not reproduced; calibration must be reviewed.");

    var south = simulate("SOUTH_HOLD", 0), east = simulate("EAST_HOLD", 0), north = simulate("NORTH_HOLD", 0);
    if (south.hit) { r.southHoldCollisionCount = 1; add("collisionErrors", "South return-corridor hold overlaps fire/police return."); }
    if (east.hit) { r.eastHoldCollisionCount = 1; add("collisionErrors", "East return-corridor hold overlaps fire/police return."); }
    if (north.hit) { r.northHoldCollisionCount = 1; add("collisionErrors", "North return-corridor hold overlaps fire/police return."); }
    if (south.incomplete || east.incomplete || north.incomplete) add("completionErrors", "Reference fire/police return did not complete within 60 seconds.");

    if (r.errors.length) r.status = "FAILED";
    return copy(r);
  }

  function logResult(r) {
    console.group(r.title);
    console.log("baselinePhaseSamples: " + r.baselinePhaseSamples);
    console.log("baselineCollisionPhaseSamples: " + r.baselineCollisionPhaseSamples);
    console.log("baselineFirstCollision: ", r.baselineFirstCollision);
    console.log("southHoldDistance: " + r.southHoldDistance + " collisions=" + r.southHoldCollisionCount);
    console.log("eastHoldDistance: " + r.eastHoldDistance + " collisions=" + r.eastHoldCollisionCount);
    console.log("northHoldDistance: " + r.northHoldDistance + " collisions=" + r.northHoldCollisionCount);
    console.log("maximumForwardTravelToHoldMeters: " + r.maximumForwardTravelToHoldMeters);
    console[r.status === "PASSED" ? "log" : "error"]("STATUS: " + r.status);
    if (r.errors.length) console.error(r.errors);
    console.groupEnd();
  }

  window.MissionBosMission004ReturnCorridorValidator = { validate: validate, logResult: logResult };
})();
