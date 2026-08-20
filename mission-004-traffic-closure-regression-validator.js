/* Mission BOS - Build 013M.4
   Regression validator for Mission 004 traffic closure calibration.
   Verifies arbitrary traffic phases, protected-corridor clearance timing,
   queue geometry and the ambulance downstream safety point.
*/
(function () {
  "use strict";

  function finite(value, fallback) {
    value = Number(value);
    return isFinite(value) ? value : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function routePrefixPoints(routeDefinition, prefixEnd) {
    var points = (routeDefinition && routeDefinition.points ? routeDefinition.points : []).map(function (point) {
      return { x: Number(point.x), z: Number(point.z) };
    });
    var bestIndex = 0;
    var bestDistance = Infinity;
    points.forEach(function (point, index) {
      var dx = point.x - Number(prefixEnd.x);
      var dz = point.z - Number(prefixEnd.z);
      var distance = dx * dx + dz * dz;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return points.slice(0, bestIndex + 1);
  }

  function validate(options) {
    options = options || {};
    var missionPlan = options.missionPlan;
    var trafficPlan = options.trafficPlan;
    var responsePlan = options.responsePlan;
    var ambulancePlan = options.ambulancePlan;
    var trafficValidator = options.trafficValidator;
    var responseValidator = options.responseValidator;
    var responseController = options.responseController;
    var sweptPathValidator = options.sweptPathValidator || null;
    var result = {
      title: "MISSION BOS MISSION 004 TRAFFIC CLOSURE REGRESSION",
      dependencyErrors: 0,
      queueGeometryErrors: 0,
      downstreamGeometryErrors: 0,
      assignmentErrors: 0,
      wrapErrors: 0,
      timingErrors: 0,
      sweptPathErrors: 0,
      sampledMissionStartPhases: 0,
      maximumDispatchReadySeconds: 0,
      status: "PASSED",
      errors: []
    };

    function add(key, message) {
      result[key] += 1;
      result.errors.push(message);
    }

    if (!missionPlan || !trafficPlan || !responsePlan || !ambulancePlan || !trafficValidator || !responseValidator ||
        !responseController || typeof responseController.computeSafeHoldAssignment !== "function") {
      add("dependencyErrors", "Mission 004 traffic-closure regression dependencies are incomplete.");
      result.status = "FAILED";
      return copy(result);
    }

    var closure = missionPlan.trafficClosure || {};
    var ringDefinition = (trafficPlan.routes || []).filter(function (route) { return route.id === closure.routeId; })[0];
    var ring = ringDefinition && trafficValidator.prepareRoute(ringDefinition);
    var ringVehicles = (trafficPlan.vehicles || []).filter(function (vehicle) {
      return (closure.affectedVehicleIds || []).indexOf(vehicle.id) >= 0;
    });
    var responseById = {};
    (responsePlan.vehicles || []).forEach(function (vehicle) { responseById[vehicle.id] = vehicle; });
    if (!ring || ringVehicles.length !== 3) {
      add("dependencyErrors", "Ring route or affected traffic vehicles are missing.");
      result.status = "FAILED";
      return copy(result);
    }

    function prepareResponseRoute(profile, vehicleId) {
      var baseline = (responsePlan.routes || []).filter(function (route) { return route.id === profile.baselinePrefixRouteId; })[0];
      if (!baseline) return null;
      var points = routePrefixPoints(baseline, profile.baselinePrefixEnd)
        .concat((profile.extensionWaypoints || []).map(function (point) { return { x: Number(point.x), z: Number(point.z) }; }));
      return responseValidator.prepareOpenRoute({ id: "M004_REGRESSION_" + vehicleId, points: points, closed: false });
    }

    var fireRoute = prepareResponseRoute(missionPlan.response.fireRoute, "RESPONSE_FIRE_01");
    var policeRoute = prepareResponseRoute(missionPlan.response.policeRoute, "RESPONSE_POLICE_01");
    var ambulanceHospitalRoute = responseValidator.prepareOpenRoute(missionPlan.response.ambulanceHospitalRoute);
    var ambulanceVehicle = ambulancePlan.vehicle || {};

    function stationaryVehicleCollidesWithRoute(civilianPose, civilian, route, responder) {
      if (!route || !responder) return true;
      var civilianPolygon = responseValidator.rectangleCorners(
        civilianPose,
        finite(civilian.footprintLength, 0),
        finite(civilian.footprintWidth, 0),
        0.05
      );
      for (var distance = 0; distance <= route.length + 1e-9; distance += 0.05) {
        var pose = responseValidator.sampleOpenRoute(route, Math.min(distance, route.length), false);
        var responsePolygon = responseValidator.rectangleCorners(
          pose,
          finite(responder.footprintLength, 0),
          finite(responder.footprintWidth, 0),
          0.05
        );
        if (responseValidator.polygonsOverlapSAT(civilianPolygon, responsePolygon)) return true;
      }
      return false;
    }

    (closure.queueHoldDistances || []).forEach(function (holdDistance, index) {
      var civilian = ringVehicles[index];
      var pose = trafficValidator.sampleRoute(ring, holdDistance);
      if (stationaryVehicleCollidesWithRoute(pose, civilian, fireRoute, responseById.RESPONSE_FIRE_01) ||
          stationaryVehicleCollidesWithRoute(pose, civilian, policeRoute, responseById.RESPONSE_POLICE_01)) {
        add("queueGeometryErrors", "Queue hold " + holdDistance + " intersects a fire/police response route.");
      }
    });

    var downstreamPose = trafficValidator.sampleRoute(ring, closure.downstreamClearHoldDistance);
    ringVehicles.forEach(function (civilian) {
      if (stationaryVehicleCollidesWithRoute(downstreamPose, civilian, ambulanceHospitalRoute, ambulanceVehicle)) {
        add("downstreamGeometryErrors", "Downstream clear hold intersects the ambulance hospital route.");
      }
    });

    var range = closure.protectedCorridorDistanceRange || {};
    var corridorMin = finite(range.min, 0);
    var corridorMax = finite(range.max, 0);
    var tolerance = finite(closure.holdPositionTolerance, 0.15);
    var waitLimit = finite((missionPlan.sequence || {}).roadClosureMaximumWaitSeconds, 0);

    for (var vehicleIndex = 0; vehicleIndex < ringVehicles.length; vehicleIndex += 1) {
      for (var sampleDistance = 0; sampleDistance < ring.length; sampleDistance += 0.25) {
        var assignment = responseController.computeSafeHoldAssignment(closure, sampleDistance, vehicleIndex);
        if (!assignment || assignment.status !== "PASSED") {
          add("assignmentErrors", "Hold assignment failed at distance " + sampleDistance.toFixed(2) + ".");
          continue;
        }
        if (assignment.mode === "CLEAR_PROTECTED_CORRIDOR") {
          if (!(assignment.currentDistance > finite(closure.downstreamClearAllowedOnlyAfterDistance, 88.0) &&
              assignment.currentDistance <= corridorMax + tolerance) || assignment.holdDistance <= corridorMax) {
            add("assignmentErrors", "Downstream protected-corridor assignment is inconsistent at distance " + sampleDistance.toFixed(2) + ".");
          }
        } else if (assignment.mode === "NON_CROSSING_ESCAPE") {
          var critical = closure.criticalApproachDistanceRange || {};
          if (!(assignment.currentDistance >= finite(critical.min, 30.5) - tolerance &&
              assignment.currentDistance <= finite(critical.max, 88.0) + tolerance)) {
            add("assignmentErrors", "Non-crossing escape assigned outside the critical approach.");
          }
        } else if (assignment.mode === "UPSTREAM_QUEUE") {
          if (!(assignment.holdDistance < corridorMin)) add("wrapErrors", "Upstream queue hold enters the protected corridor.");
        } else if (assignment.forwardDistance > 0.001) {
          add("wrapErrors", "Immediate hold requires forward travel at distance " + sampleDistance.toFixed(2) + ".");
        }
      }
    }

    var speed = finite(ringVehicles[0] && ringVehicles[0].speed, 6.25);
    var lapSeconds = ring.length / Math.max(0.01, speed);
    var phaseStep = 0.25;
    for (var t = 0; t < lapSeconds; t += phaseStep) {
      var readiness = 0;
      ringVehicles.forEach(function (vehicle, index) {
        var currentDistance = (finite(vehicle.startDistance, 0) + speed * t) % ring.length;
        var assignment = responseController.computeSafeHoldAssignment(closure, currentDistance, index);
        if (!assignment || assignment.status !== "PASSED") {
          add("assignmentErrors", "Mission-start phase assignment failed at t=" + t.toFixed(2) + "s for " + vehicle.id + ".");
          return;
        }
        var travelSeconds = assignment.mode === "NON_CROSSING_ESCAPE"
          ? finite(assignment.estimatedClearanceSeconds, 1.6)
          : assignment.forwardDistance / Math.max(0.01, finite(vehicle.speed, speed));
        if (vehicle.id === closure.leadVehicleId || assignment.mode === "CLEAR_PROTECTED_CORRIDOR" || assignment.mode === "NON_CROSSING_ESCAPE") {
          readiness = Math.max(readiness, travelSeconds);
        }
      });
      result.sampledMissionStartPhases += 1;
      result.maximumDispatchReadySeconds = Math.max(result.maximumDispatchReadySeconds, readiness);
      if (readiness > waitLimit + 1e-9) {
        add("timingErrors", "A mission-start phase needs " + readiness.toFixed(2) + "s before safe dispatch, above the configured limit.");
        break;
      }
    }

    if (sweptPathValidator && typeof sweptPathValidator.validate === "function") {
      var sweptResult = sweptPathValidator.validate({
        missionPlan: missionPlan,
        trafficPlan: trafficPlan,
        trafficValidator: trafficValidator,
        responseValidator: responseValidator,
        responseController: responseController
      });
      result.sweptPathValidation = sweptResult;
      if (!sweptResult || sweptResult.status !== "PASSED") add("sweptPathErrors", "Dedicated swept-path validation failed.");
    } else {
      add("sweptPathErrors", "Dedicated swept-path validator was not supplied.");
    }
    result.maximumDispatchReadySeconds = Math.round(result.maximumDispatchReadySeconds * 1000) / 1000;
    if (result.errors.length) result.status = "FAILED";
    return copy(result);
  }

  function logResult(result) {
    console.group(result.title);
    console.log("sampledMissionStartPhases: " + result.sampledMissionStartPhases);
    console.log("maximumDispatchReadySeconds: " + result.maximumDispatchReadySeconds);
    console[result.status === "PASSED" ? "log" : "error"]("STATUS: " + result.status);
    if (result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosMission004TrafficClosureRegressionValidator = {
    validate: validate,
    logResult: logResult
  };
})();
