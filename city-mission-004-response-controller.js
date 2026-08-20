/* Mission BOS - Build 013M.4
   Mission 004 response orchestration. Reuses the persistent fire, police and
   ambulance instances and owns traffic yields plus route-profile commands only.
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

  function normalizeDistance(value, routeLength) {
    if (!isFinite(value) || !isFinite(routeLength) || routeLength <= 0) return null;
    return ((Number(value) % routeLength) + routeLength) % routeLength;
  }

  function computeSafeHoldAssignment(config, currentDistance, vehicleIndex) {
    config = config || {};
    var routeLength = finite(config.routeLength, 0);
    var numericCurrent = currentDistance == null ? NaN : Number(currentDistance);
    var current = normalizeDistance(numericCurrent, routeLength);
    var range = config.protectedCorridorDistanceRange || {};
    var critical = config.criticalApproachDistanceRange || {};
    var corridorMin = finite(range.min, 30.5);
    var corridorMax = finite(range.max, 118.0);
    var criticalMax = finite(critical.max, 88.0);
    var downstreamGate = finite(config.downstreamClearAllowedOnlyAfterDistance, 88.0);
    var downstreamHold = finite(config.downstreamClearHoldDistance, 122.0);
    var tolerance = Math.max(0.01, finite(config.holdPositionTolerance, 0.15));
    var queueHolds = config.queueHoldDistances || [];
    var index = Math.max(0, Math.floor(finite(vehicleIndex, 0)));
    var preferredQueueHold = finite(queueHolds[index], NaN);

    if (current === null || !(corridorMin > 0) || !(criticalMax >= corridorMin) || !(corridorMax > criticalMax) ||
        !(downstreamGate >= criticalMax) || !(downstreamHold > corridorMax) || !(downstreamHold < routeLength)) {
      return { status: "FAILED", reason: "INVALID_TRAFFIC_CLOSURE_GEOMETRY" };
    }

    var holdDistance = current;
    var mode = "OUTSIDE_CORRIDOR_IMMEDIATE_HOLD";
    var estimatedClearanceSeconds = 0;

    if (current < corridorMin - tolerance) {
      if (isFinite(preferredQueueHold) && preferredQueueHold >= current && preferredQueueHold < corridorMin - tolerance) {
        holdDistance = preferredQueueHold;
        mode = "UPSTREAM_QUEUE";
      } else {
        holdDistance = current;
        mode = "UPSTREAM_IMMEDIATE_HOLD";
      }
    } else if (current <= criticalMax + 1e-9) {
      holdDistance = current;
      mode = "NON_CROSSING_ESCAPE";
      estimatedClearanceSeconds = 1.6;
    } else if (current <= corridorMax + tolerance) {
      holdDistance = downstreamHold;
      mode = "CLEAR_PROTECTED_CORRIDOR";
    }

    var forwardDistance = ((holdDistance - current) % routeLength + routeLength) % routeLength;
    if (mode === "NON_CROSSING_ESCAPE") forwardDistance = 0;
    if (mode !== "CLEAR_PROTECTED_CORRIDOR" && mode !== "UPSTREAM_QUEUE" && mode !== "NON_CROSSING_ESCAPE" &&
        forwardDistance > Math.max(0.5, tolerance * 4)) {
      return { status: "FAILED", reason: "UNSAFE_WRAP_TO_HOLD" };
    }

    return {
      status: "PASSED",
      mode: mode,
      currentDistance: current,
      holdDistance: holdDistance,
      forwardDistance: forwardDistance,
      estimatedClearanceSeconds: estimatedClearanceSeconds,
      corridorMin: corridorMin,
      corridorMax: corridorMax,
      criticalMax: criticalMax,
      downstreamGate: downstreamGate,
      routeLength: routeLength
    };
  }

  function escapeTrajectoryFromPose(config, currentDistance, startPose) {
    if (!startPose) return null;
    var zone = config.closureZone || {};
    var targetZ = Math.max(finite(zone.zMax, 43.2) + 2.0, 45.2);
    var target = { x: Number(startPose.x), z: targetZ, angle: Number(startPose.angle) };
    var expandedXMin = finite(zone.xMin, 28.4) - 1.5;
    var expandedXMax = finite(zone.xMax, 35.2) + 1.5;
    var expandedZMin = finite(zone.zMin, 39.0) - 1.0;
    var expandedZMax = finite(zone.zMax, 43.2) + 1.0;
    var insideExpandedIncident = Number(startPose.x) >= expandedXMin && Number(startPose.x) <= expandedXMax &&
      Number(startPose.z) >= expandedZMin && Number(startPose.z) <= expandedZMax;
    if (insideExpandedIncident) return { preSceneRelocation: true, poses: [target] };
    var poses = [];
    var dz = target.z - Number(startPose.z);
    var steps = Math.max(1, Math.ceil(Math.abs(dz) / 0.25));
    for (var i = 0; i <= steps; i += 1) {
      var t = i / steps;
      poses.push({ x: Number(startPose.x), z: Number(startPose.z) + dz * t, angle: Number(startPose.angle) });
    }
    return { preSceneRelocation: false, poses: poses };
  }

  function getTrafficClearanceTrajectory(config, currentDistance, vehicleIndex, assignment, ring, trafficValidator) {
    if (!assignment || assignment.mode !== "NON_CROSSING_ESCAPE" || !ring || !trafficValidator || typeof trafficValidator.sampleRoute !== "function") return null;
    var startPose = trafficValidator.sampleRoute(ring, currentDistance);
    var result = escapeTrajectoryFromPose(config || {}, currentDistance, startPose);
    return result ? result.poses : null;
  }

  function computeReturnCorridorAssignment(config, currentDistance) {
    config = config || {};
    var holds = (config.safeHoldDistances || []).map(Number).filter(isFinite).sort(function (a, b) { return a - b; });
    if (!holds.length || !isFinite(Number(currentDistance))) return { status: "FAILED", reason: "INVALID_RETURN_CORRIDOR_INPUT" };
    var maxForward = finite(config.maximumForwardTravelToHoldMeters, 0);
    var routeLength = holds[holds.length - 1] + maxForward - holds[0];
    if (!(routeLength > holds[holds.length - 1])) return { status: "FAILED", reason: "INVALID_RETURN_CORRIDOR_LENGTH" };
    var current = normalizeDistance(Number(currentDistance), routeLength);
    var best = null;
    holds.forEach(function (hold) {
      var forward = ((hold - current) % routeLength + routeLength) % routeLength;
      if (!best || forward < best.forwardDistance - 1e-9 || (Math.abs(forward - best.forwardDistance) <= 1e-9 && hold < best.holdDistance)) {
        best = { holdDistance: hold, forwardDistance: forward };
      }
    });
    if (!best || best.forwardDistance > maxForward + 0.01) return { status: "FAILED", reason: "RETURN_CORRIDOR_FORWARD_LIMIT" };
    return {
      status: "PASSED",
      currentDistance: current,
      holdDistance: best.holdDistance,
      forwardDistance: best.forwardDistance,
      routeLength: routeLength
    };
  }

  function failedRuntime(message) {
    var safety = {
      title: "MISSION BOS MISSION 004 RESPONSE RUNTIME SAFETY",
      dependencyErrors: 1,
      trafficYieldErrors: 0,
      profileErrors: 0,
      dispatchErrors: 0,
      returnErrors: 0,
      ambulanceReturnWatchdogErrors: 0,
      releaseErrors: 0,
      resetErrors: 0,
      status: "FAILED",
      failed: true,
      errors: [message || "Mission 004 response dependencies are incomplete."]
    };
    return {
      prepare: function () { return false; },
      dispatch: function () { return false; },
      beginReturnAndTransport: function () { return false; },
      update: function () {},
      reset: function () { return false; },
      allAtScene: function () { return false; },
      firePoliceAtBase: function () { return false; },
      ambulanceAtHospital: function () { return false; },
      allAtBase: function () { return false; },
      isTrafficReleased: function () { return false; },
      isSceneCleared: function () { return false; },
      isPrepared: function () { return false; },
      isLeadVehicleYielded: function () { return false; },
      isProtectedCorridorClear: function () { return false; },
      getTrafficClosureStatus: function () { return { status: "FAILED", corridorClear: false, vehicles: [] }; },
      ambulanceAtScene: function () { return false; },
      getTrafficClearanceTrajectory: function () { return null; },
      getReturnManeuverStatus: function () { return { strategy: "UNAVAILABLE", fireSubphase: "FAILED", policeSubphase: "FAILED", fireClearanceGate: false }; },
      getReturnCorridorStatus: function () { return { strategy: "UNAVAILABLE", requested: false, yielded: false, firePoliceReturnIssued: false, released: false, status: "FAILED" }; },
      isReturnCorridorReady: function () { return false; },
      isAmbulanceReturning: function () { return false; },
      getAmbulanceReturnStatus: function () { return { commandIssued: false, commandSequence: 0, lastCommandResult: false, returningConfirmed: false, completedAtStation: false, ambulanceState: "FAILED", routeId: null, distance: null }; },
      getState: function () { return "FAILED"; },
      getSafetyStatus: function () { return copy(safety); }
    };
  }

  function create(options) {
    options = options || {};
    var plan = options.plan || window.MISSION_BOS_MISSION_004_PLAN;
    var validation = options.validation;
    var traffic = options.trafficRuntime;
    var response = options.responseVehicleRuntime;
    var ambulance = options.ambulanceRuntime;
    var scene = options.sceneRuntime;

    if (!plan || !validation || validation.status !== "PASSED" || !traffic || !response || !ambulance || !scene ||
        typeof traffic.requestYieldAtDistance !== "function" || typeof traffic.requestMissionRelocation !== "function" ||
        typeof traffic.releaseYield !== "function" || typeof traffic.getYieldStatus !== "function" ||
        typeof traffic.getRoutePose !== "function" ||
        typeof response.setRouteProfile !== "function" || typeof response.restoreDefaultRouteProfile !== "function" ||
        typeof response.dispatch !== "function" || typeof response.returnToStations !== "function" || typeof response.getReturnManeuverStatus !== "function" ||
        typeof ambulance.setRouteProfile !== "function" || typeof ambulance.restoreDefaultRouteProfile !== "function" ||
        typeof ambulance.dispatchToIncident !== "function" || typeof ambulance.transportToHospital !== "function" ||
        typeof ambulance.returnToStation !== "function" || typeof scene.isSceneCleared !== "function") {
      return failedRuntime("Mission 004 response dependencies are incomplete.");
    }

    var responsePlan = plan.response || {};
    var trafficPlan = plan.trafficClosure || {};
    var outboundCorridorPlan = responsePlan.outboundCorridorReservation || responsePlan.returnCorridorReservation || {};
    var returnCorridorPlan = responsePlan.returnCorridorReservation || {};
    var sequence = plan.sequence || {};
    var state = "IDLE";
    var yieldRequested = Object.create(null);
    var assignedHolds = Object.create(null);
    var trafficReleased = true;
    var outboundCorridor = {
      vehicleId: outboundCorridorPlan.vehicleId || null,
      holdDistance: null,
      requested: false,
      yielded: false,
      released: true,
      status: "IDLE"
    };
    var returnCorridor = {
      strategy: returnCorridorPlan.strategy || "UNCONFIGURED",
      vehicleId: returnCorridorPlan.vehicleId || null,
      holdDistance: null,
      requested: false,
      yielded: false,
      waitElapsedSeconds: 0,
      firePoliceReturnIssued: false,
      released: true,
      status: "IDLE"
    };
    var responseProfilePrepared = false;
    var ambulanceProfilePrepared = false;
    var dispatchIssued = false;
    var returnIssued = false;
    var ambulanceReturnIssued = false;
    var ambulanceReturnCommandSequence = 0;
    var ambulanceReturnCommandResult = null;
    var ambulanceReturnCommandStateElapsed = 0;
    var ambulanceReturnStateConfirmed = false;
    var ambulanceReturnElapsed = 0;
    var ambulanceReturnCompleted = false;
    var hospitalElapsed = 0;
    var disposed = false;

    var safety = {
      title: "MISSION BOS MISSION 004 RESPONSE RUNTIME SAFETY",
      dependencyErrors: 0,
      trafficYieldErrors: 0,
      profileErrors: 0,
      dispatchErrors: 0,
      returnErrors: 0,
      ambulanceReturnWatchdogErrors: 0,
      releaseErrors: 0,
      resetErrors: 0,
      status: "PASSED",
      failed: false,
      errors: []
    };

    function addError(key, message) {
      safety[key] += 1;
      safety.errors.push(message);
      safety.failed = true;
      safety.status = "FAILED";
    }

    function responseAtScene() {
      return response.getState && response.getState() === "HOLDING";
    }

    function firePoliceAtBase() {
      return !!(response.allAtBase && response.allAtBase());
    }

    function ambulanceAtScene() {
      return ambulance.getState && ambulance.getState() === "AT_INCIDENT";
    }

    function ambulanceAtHospital() {
      return ambulance.getState && ambulance.getState() === "AT_HOSPITAL";
    }

    function ambulanceAtStation() {
      return ambulance.getState && ambulance.getState() === "AT_STATION";
    }

    function allAtScene() {
      return responseAtScene() && ambulanceAtScene();
    }

    function allAtBase() {
      return firePoliceAtBase() && ambulanceAtStation();
    }

    function isLeadVehicleYielded() {
      var leadId = trafficPlan.leadVehicleId;
      if (typeof traffic.isYielded === "function") return traffic.isYielded(leadId) === true;
      if (typeof traffic.isVehicleYielded === "function") return traffic.isVehicleYielded(leadId) === true;
      var status = typeof traffic.getYieldStatus === "function" ? traffic.getYieldStatus(leadId) : null;
      return !!status && status.yielded === true;
    }

    function currentTrafficDistance(vehicleId) {
      var status = traffic.getYieldStatus(vehicleId);
      return status && isFinite(Number(status.currentDistance)) ? Number(status.currentDistance) : null;
    }

    function isProtectedCorridorClear() {
      var ids = trafficPlan.affectedVehicleIds || [];
      var range = trafficPlan.protectedCorridorDistanceRange || {};
      var min = finite(range.min, 30.5);
      var max = finite(range.max, 118.0);
      var tolerance = Math.max(0.01, finite(trafficPlan.holdPositionTolerance, 0.15));
      return ids.every(function (vehicleId) {
        var runtimeStatus = traffic.getYieldStatus(vehicleId);
        if (runtimeStatus && runtimeStatus.missionRelocated === true && runtimeStatus.yielded === true) return true;
        var distance = runtimeStatus && isFinite(Number(runtimeStatus.currentDistance)) ? Number(runtimeStatus.currentDistance) : null;
        return distance !== null && (distance < min - tolerance || distance > max + tolerance);
      });
    }

    function getTrafficClosureStatus() {
      var ids = trafficPlan.affectedVehicleIds || [];
      return {
        status: safety.status,
        corridorClear: isProtectedCorridorClear(),
        vehicles: ids.map(function (vehicleId) {
          var runtimeStatus = traffic.getYieldStatus(vehicleId);
          return {
            vehicleId: vehicleId,
            assigned: copy(assignedHolds[vehicleId] || null),
            runtime: copy(runtimeStatus)
          };
        })
      };
    }

    function requestTrafficYields() {
      var ids = trafficPlan.affectedVehicleIds || [];
      for (var i = 0; i < ids.length; i += 1) {
        var currentDistance = currentTrafficDistance(ids[i]);
        var assignment = computeSafeHoldAssignment(trafficPlan, currentDistance, i);
        if (!assignment || assignment.status !== "PASSED") {
          addError("trafficYieldErrors", "Safe traffic hold assignment failed for " + ids[i] + ".");
          return false;
        }
        if (assignment.mode === "NON_CROSSING_ESCAPE") {
          var startPose = traffic.getRoutePose(ids[i], currentDistance);
          var escape = escapeTrajectoryFromPose(trafficPlan, currentDistance, startPose);
          if (!escape || !traffic.requestMissionRelocation(ids[i], escape.poses, {
            preSceneRelocation: escape.preSceneRelocation,
            speed: 3.6,
            rejoinSpeed: 3.6
          })) {
            addError("trafficYieldErrors", "Mission 004 non-crossing relocation failed for " + ids[i] + ".");
            return false;
          }
          assignment.preSceneRelocation = escape.preSceneRelocation;
        } else if (!traffic.requestYieldAtDistance(ids[i], assignment.holdDistance)) {
          addError("trafficYieldErrors", "Traffic yield request failed for " + ids[i] + ".");
          return false;
        }
        assignedHolds[ids[i]] = assignment;
        yieldRequested[ids[i]] = true;
      }
      trafficReleased = false;
      return true;
    }

    function releaseTrafficYields() {
      var ids = trafficPlan.affectedVehicleIds || [];
      var ok = true;
      ids.forEach(function (vehicleId) {
        if (!yieldRequested[vehicleId]) return;
        var before = traffic.getYieldStatus(vehicleId);
        if (before && before.status !== "REJOINING" && !traffic.releaseYield(vehicleId)) {
          ok = false;
          addError("releaseErrors", "Traffic yield release failed for " + vehicleId + ".");
          return;
        }
        var after = traffic.getYieldStatus(vehicleId);
        if (!after || after.requested !== true) yieldRequested[vehicleId] = false;
      });
      if (ok) trafficReleased = ids.every(function (vehicleId) {
        var status = traffic.getYieldStatus(vehicleId);
        return !yieldRequested[vehicleId] && (!status || status.requested !== true);
      });
      return ok;
    }

    function requestOutboundCorridorReservation() {
      var vehicleId = outboundCorridorPlan.vehicleId;
      var runtimeStatus = vehicleId ? traffic.getYieldStatus(vehicleId) : null;
      var assignment = computeReturnCorridorAssignment(outboundCorridorPlan, runtimeStatus && runtimeStatus.currentDistance);
      if (!vehicleId || !runtimeStatus || !assignment || assignment.status !== "PASSED") {
        addError("trafficYieldErrors", "Mission 004 downtown outbound-corridor assignment failed.");
        outboundCorridor.status = "FAILED";
        return false;
      }
      if (!traffic.requestYieldAtDistance(vehicleId, assignment.holdDistance)) {
        addError("trafficYieldErrors", "Mission 004 downtown outbound-corridor yield request failed.");
        outboundCorridor.status = "FAILED";
        return false;
      }
      outboundCorridor.holdDistance = assignment.holdDistance;
      outboundCorridor.requested = true;
      outboundCorridor.yielded = false;
      outboundCorridor.released = false;
      outboundCorridor.status = "WAITING_FOR_YIELD";
      return true;
    }

    function updateOutboundCorridor() {
      if (!outboundCorridor.requested || outboundCorridor.released || outboundCorridor.status === "FAILED") return;
      var runtimeStatus = traffic.getYieldStatus(outboundCorridor.vehicleId);
      outboundCorridor.yielded = !!(runtimeStatus && runtimeStatus.yielded === true);
      outboundCorridor.status = outboundCorridor.yielded ? "CLEAR" : "WAITING_FOR_YIELD";
    }

    function releaseOutboundCorridorReservation() {
      if (!outboundCorridor.requested || outboundCorridor.released) return true;
      if (!responseAtScene()) return false;
      if (!traffic.releaseYield(outboundCorridor.vehicleId)) {
        addError("releaseErrors", "Mission 004 downtown outbound-corridor release failed.");
        return false;
      }
      outboundCorridor.requested = false;
      outboundCorridor.yielded = false;
      outboundCorridor.released = true;
      outboundCorridor.status = "RELEASED";
      return true;
    }

    function requestReturnCorridorReservation() {
      var vehicleId = returnCorridorPlan.vehicleId;
      var runtimeStatus = vehicleId ? traffic.getYieldStatus(vehicleId) : null;
      var assignment = computeReturnCorridorAssignment(returnCorridorPlan, runtimeStatus && runtimeStatus.currentDistance);
      if (!vehicleId || !runtimeStatus || !assignment || assignment.status !== "PASSED") {
        addError("returnErrors", "Mission 004 return corridor assignment failed.");
        returnCorridor.status = "FAILED";
        state = "FAILED";
        return false;
      }
      if (!traffic.requestYieldAtDistance(vehicleId, assignment.holdDistance)) {
        addError("returnErrors", "Mission 004 downtown return-corridor yield request failed.");
        returnCorridor.status = "FAILED";
        state = "FAILED";
        return false;
      }
      returnCorridor.holdDistance = assignment.holdDistance;
      returnCorridor.requested = true;
      returnCorridor.yielded = false;
      returnCorridor.waitElapsedSeconds = 0;
      returnCorridor.firePoliceReturnIssued = false;
      returnCorridor.released = false;
      returnCorridor.status = "WAITING_FOR_YIELD";
      return true;
    }

    function releaseReturnCorridorReservation() {
      if (!returnCorridor.requested || returnCorridor.released) return true;
      if (!firePoliceAtBase()) return false;
      if (!traffic.releaseYield(returnCorridor.vehicleId)) {
        addError("releaseErrors", "Mission 004 downtown return-corridor yield release failed.");
        return false;
      }
      var status = traffic.getYieldStatus(returnCorridor.vehicleId);
      if (!status || status.requested !== true) {
        returnCorridor.released = true;
        returnCorridor.requested = false;
        returnCorridor.yielded = false;
        returnCorridor.status = "RELEASED";
        return true;
      }
      return false;
    }

    function updateReturnCorridor(step) {
      if (!returnCorridor.requested || returnCorridor.released || returnCorridor.status === "FAILED") return;
      var runtimeStatus = traffic.getYieldStatus(returnCorridor.vehicleId);
      returnCorridor.yielded = !!(runtimeStatus && runtimeStatus.yielded === true);
      if (!returnCorridor.firePoliceReturnIssued) {
        returnCorridor.waitElapsedSeconds += step;
        if (returnCorridor.yielded) {
          returnCorridor.status = "CLEAR";
          if (!response.returnToStations()) {
            addError("returnErrors", "Fire/police return command failed after return-corridor clearance.");
            returnCorridor.status = "FAILED";
            state = "FAILED";
            return;
          }
          returnIssued = true;
          returnCorridor.firePoliceReturnIssued = true;
          returnCorridor.status = "FIRE_POLICE_RETURNING";
        } else if (returnCorridor.waitElapsedSeconds + 1e-9 >= finite(returnCorridorPlan.maximumWaitSeconds, 8.0)) {
          addError("returnErrors", "Downtown return-corridor yield did not clear within the 8 second safety window.");
          returnCorridor.status = "FAILED";
          state = "FAILED";
        }
      } else if (firePoliceAtBase() && !returnCorridor.released) {
        releaseReturnCorridorReservation();
      }
    }

    function isReturnCorridorReady() {
      return returnCorridor.requested === true && returnCorridor.yielded === true && returnCorridor.status !== "FAILED";
    }

    function getReturnCorridorStatus() {
      var result = copy(returnCorridor);
      var runtimeStatus = returnCorridor.vehicleId ? traffic.getYieldStatus(returnCorridor.vehicleId) : null;
      result.runtime = copy(runtimeStatus);
      return result;
    }

    function getOutboundCorridorStatus() {
      var result = copy(outboundCorridor);
      var runtimeStatus = outboundCorridor.vehicleId ? traffic.getYieldStatus(outboundCorridor.vehicleId) : null;
      result.runtime = copy(runtimeStatus);
      return result;
    }

    function isTrafficReleased() {
      var corridorDone = returnCorridor.released === true || returnCorridor.status === "IDLE";
      return trafficReleased === true && corridorDone;
    }

    function buildResponseProfile() {
      return {
        id: responsePlan.responseVehicleRouteProfileId,
        returnManeuver: copy(responsePlan.returnSequencing || null),
        vehicles: [
          Object.assign({ vehicleId: "RESPONSE_FIRE_01" }, copy(responsePlan.fireRoute || {})),
          Object.assign({ vehicleId: "RESPONSE_POLICE_01" }, copy(responsePlan.policeRoute || {}))
        ]
      };
    }

    function buildAmbulanceProfile() {
      return {
        id: responsePlan.ambulanceRouteProfileId,
        incidentOutboundRoute: copy(responsePlan.ambulanceOutboundRoute),
        incidentHospitalRoute: copy(responsePlan.ambulanceHospitalRoute),
        hospitalReturnRouteId: responsePlan.ambulanceReturnRouteId,
        hospitalReturnRoute: copy(responsePlan.ambulanceReturnRoute)
      };
    }

    function prepare() {
      if (disposed || state !== "IDLE" || !allAtBase()) return false;
      if (!response.setRouteProfile(responsePlan.responseVehicleRouteProfileId, buildResponseProfile())) {
        addError("profileErrors", "Fire/police Mission 004 route profile could not be prepared.");
        return false;
      }
      responseProfilePrepared = true;
      if (!ambulance.setRouteProfile(responsePlan.ambulanceRouteProfileId, buildAmbulanceProfile())) {
        addError("profileErrors", "Ambulance Mission 004 route profile could not be prepared.");
        response.restoreDefaultRouteProfile();
        responseProfilePrepared = false;
        return false;
      }
      ambulanceProfilePrepared = true;
      if (!requestTrafficYields()) {
        releaseTrafficYields();
        ambulance.restoreDefaultRouteProfile();
        response.restoreDefaultRouteProfile();
        ambulanceProfilePrepared = false;
        responseProfilePrepared = false;
        return false;
      }
      if (!requestOutboundCorridorReservation()) {
        releaseTrafficYields();
        ambulance.restoreDefaultRouteProfile();
        response.restoreDefaultRouteProfile();
        ambulanceProfilePrepared = false;
        responseProfilePrepared = false;
        return false;
      }
      state = "PREPARING";
      return true;
    }

    function dispatch() {
      updateOutboundCorridor();
      if (disposed || state !== "PREPARING" || !isLeadVehicleYielded() || !isProtectedCorridorClear() || outboundCorridor.yielded !== true) return false;
      if (!response.dispatch()) {
        addError("dispatchErrors", "Fire/police dispatch failed.");
        return false;
      }
      if (!ambulance.dispatchToIncident()) {
        addError("dispatchErrors", "Ambulance incident dispatch failed.");
        return false;
      }
      dispatchIssued = true;
      state = "ENROUTE";
      return true;
    }

    function beginReturnAndTransport() {
      if (disposed || state !== "AT_SCENE" || !allAtScene()) return false;
      if (!requestReturnCorridorReservation()) return false;
      if (!ambulance.transportToHospital()) {
        addError("returnErrors", "Ambulance hospital transport command failed.");
        traffic.releaseYield(returnCorridor.vehicleId);
        returnCorridor.requested = false;
        returnCorridor.released = true;
        returnCorridor.status = "FAILED";
        state = "FAILED";
        return false;
      }
      hospitalElapsed = 0;
      state = "RETURNING";
      return true;
    }

    function ambulanceOutsideClosureZone() {
      var position = ambulance.getCommsPosition && ambulance.getCommsPosition();
      var zone = trafficPlan.closureZone || {};
      if (!position) return false;
      return !(Number(position.x) >= finite(zone.xMin, Infinity) && Number(position.x) <= finite(zone.xMax, -Infinity) &&
        Number(position.z) >= finite(zone.zMin, Infinity) && Number(position.z) <= finite(zone.zMax, -Infinity));
    }

    function ambulanceAtHospitalOrBeyond() {
      var current = ambulance.getState ? ambulance.getState() : null;
      return ["AT_HOSPITAL", "RETURNING", "AT_STATION"].indexOf(current) >= 0;
    }

    function isSceneCleared() {
      return scene.isSceneCleared() === true;
    }

    function restoreProfilesAtBase() {
      if (!allAtBase()) return false;
      var ok = true;
      if (responseProfilePrepared && response.getRouteProfileId && response.getRouteProfileId() !== "MISSION_001_DEFAULT") {
        ok = response.restoreDefaultRouteProfile() && ok;
      }
      if (ambulanceProfilePrepared && ambulance.getRouteProfileId && ambulance.getRouteProfileId() !== "MISSION_002_DEFAULT") {
        ok = ambulance.restoreDefaultRouteProfile() && ok;
      }
      if (!ok) addError("profileErrors", "Default response profiles could not be restored after Mission 004.");
      if (ok) {
        responseProfilePrepared = false;
        ambulanceProfilePrepared = false;
      }
      return ok;
    }

    function update(delta) {
      if (disposed || state === "FAILED") return;
      var step = Math.max(0, Math.min(finite(delta, 0), 0.25));
      if (state === "PREPARING" || state === "ENROUTE") updateOutboundCorridor();
      if (state === "ENROUTE" && responseAtScene() && outboundCorridor.requested) releaseOutboundCorridorReservation();
      if (state === "ENROUTE" && allAtScene()) {
        if (outboundCorridor.requested) releaseOutboundCorridorReservation();
        state = "AT_SCENE";
      }
      if (state !== "RETURNING") return;

      updateReturnCorridor(step);
      if (state === "FAILED") return;

      if (!trafficReleased && returnIssued && firePoliceAtBase() && isSceneCleared() &&
          ambulanceOutsideClosureZone() && ambulanceAtHospitalOrBeyond()) {
        releaseTrafficYields();
      }

      var ambulanceRuntimeState = ambulance.getState ? ambulance.getState() : null;
      if (ambulanceRuntimeState === "AT_HOSPITAL" && !ambulanceReturnIssued) {
        hospitalElapsed += step;
        if (hospitalElapsed + 1e-9 >= finite(sequence.hospitalHoldSeconds, 2.5)) {
          ambulanceReturnCommandResult = ambulance.returnToStation() === true;
          ambulanceReturnCommandSequence += 1;
          if (ambulanceReturnCommandResult) {
            ambulanceReturnIssued = true;
            ambulanceReturnCommandStateElapsed = 0;
          } else {
            addError("returnErrors", "Ambulance automatic return to station failed.");
            state = "FAILED";
            return;
          }
        }
      }

      ambulanceRuntimeState = ambulance.getState ? ambulance.getState() : null;
      if (ambulanceReturnIssued && !ambulanceReturnStateConfirmed) {
        if (ambulanceRuntimeState === "RETURNING") {
          ambulanceReturnStateConfirmed = true;
          ambulanceReturnCommandStateElapsed = 0;
          ambulanceReturnElapsed = 0;
        } else if (ambulanceRuntimeState === "AT_STATION") {
          addError("ambulanceReturnWatchdogErrors", "Ambulance reached AT_STATION without an observed RETURNING runtime state.");
          state = "FAILED";
          return;
        } else {
          ambulanceReturnCommandStateElapsed += step;
          if (ambulanceReturnCommandStateElapsed + 1e-9 >= finite(sequence.ambulanceReturnCommandStateDeadlineSeconds, 0.35)) {
            addError("ambulanceReturnWatchdogErrors", "Ambulance did not enter real RETURNING state within the 0.35 second deadline.");
            state = "FAILED";
            return;
          }
        }
      }

      if (ambulanceReturnStateConfirmed && !ambulanceReturnCompleted) {
        if (ambulanceRuntimeState === "RETURNING") {
          ambulanceReturnElapsed += step;
          if (ambulanceReturnElapsed + 1e-9 >= finite(sequence.ambulanceReturnMaximumSeconds, 6.0)) {
            addError("ambulanceReturnWatchdogErrors", "Ambulance remained in RETURNING beyond the 6.0 second safety deadline.");
            state = "FAILED";
            return;
          }
        } else if (ambulanceRuntimeState === "AT_STATION") {
          ambulanceReturnCompleted = true;
        } else {
          addError("ambulanceReturnWatchdogErrors", "Ambulance left RETURNING without reaching AT_STATION.");
          state = "FAILED";
          return;
        }
      }

      if (allAtBase() && isTrafficReleased() && isSceneCleared()) {
        if (restoreProfilesAtBase()) state = "COMPLETE";
      }
    }

    function runtimeReadyForSharedHandoff(runtime) {
      var status = runtime && runtime.getSafetyStatus ? runtime.getSafetyStatus() : null;
      return !!status && status.status === "PASSED" && status.fatal !== true;
    }

    function getCrossMissionHandoffStatus() {
      var responseState = response.getState ? response.getState() : null;
      var ambulanceState = ambulance.getState ? ambulance.getState() : null;
      var responseProfile = response.getRouteProfileId ? response.getRouteProfileId() : null;
      var ambulanceProfile = ambulance.getRouteProfileId ? ambulance.getRouteProfileId() : null;
      var blockers = [];
      if (state !== "COMPLETE") blockers.push("MISSION_004_RESPONSE_NOT_COMPLETE");
      if (!allAtBase()) blockers.push("VEHICLES_NOT_AT_BASE");
      if (!isTrafficReleased()) blockers.push("TRAFFIC_NOT_RELEASED");
      if (!isSceneCleared()) blockers.push("SCENE_NOT_CLEARED");
      if (responseState !== "AT_STATIONS") blockers.push("FIRE_POLICE_RUNTIME_NOT_AT_STATIONS");
      if (ambulanceState !== "AT_STATION") blockers.push("AMBULANCE_RUNTIME_NOT_AT_STATION");
      if (responseProfile !== "MISSION_001_DEFAULT") blockers.push("FIRE_POLICE_PROFILE_NOT_DEFAULT");
      if (ambulanceProfile !== "MISSION_002_DEFAULT") blockers.push("AMBULANCE_PROFILE_NOT_DEFAULT");
      if (!runtimeReadyForSharedHandoff(response)) blockers.push("FIRE_POLICE_RUNTIME_UNSAFE");
      if (!runtimeReadyForSharedHandoff(ambulance)) blockers.push("AMBULANCE_RUNTIME_UNSAFE");
      return {
        ready: blockers.length === 0,
        blockers: blockers,
        responseState: responseState,
        ambulanceState: ambulanceState,
        responseProfileId: responseProfile,
        ambulanceProfileId: ambulanceProfile
      };
    }

    function clearMission004LocalReturnState() {
      yieldRequested = Object.create(null);
      assignedHolds = Object.create(null);
      trafficReleased = true;
      outboundCorridor = {
        vehicleId: outboundCorridorPlan.vehicleId || null,
        holdDistance: null, requested: false, yielded: false, released: true, status: "IDLE"
      };
      returnCorridor = {
        strategy: returnCorridorPlan.strategy || "UNCONFIGURED",
        vehicleId: returnCorridorPlan.vehicleId || null,
        holdDistance: null, requested: false, yielded: false, waitElapsedSeconds: 0,
        firePoliceReturnIssued: false, released: true, status: "IDLE"
      };
      responseProfilePrepared = false;
      ambulanceProfilePrepared = false;
      dispatchIssued = false;
      returnIssued = false;
      ambulanceReturnIssued = false;
      ambulanceReturnCommandSequence = 0;
      ambulanceReturnCommandResult = null;
      ambulanceReturnCommandStateElapsed = 0;
      ambulanceReturnStateConfirmed = false;
      ambulanceReturnElapsed = 0;
      ambulanceReturnCompleted = false;
      hospitalElapsed = 0;
      state = "IDLE";
    }

    function finalizeForSharedHandoff() {
      var handoff = getCrossMissionHandoffStatus();
      if (!handoff.ready) return false;
      // Do not call response.reset() or ambulance.reset() here. Both shared runtimes
      // are already physically back at base with their default profiles restored.
      // Re-running dynamic collision safety in this exact handoff frame can poison
      // the reusable Mission 002 ambulance runtime after Mission 004 has completed.
      clearMission004LocalReturnState();
      return true;
    }

    function reset() {
      if (disposed) return false;
      if (state !== "IDLE" && state !== "COMPLETE" && !allAtBase()) return false;
      if (outboundCorridor.requested && !outboundCorridor.released && !traffic.releaseYield(outboundCorridor.vehicleId)) return false;
      if (!releaseTrafficYields()) return false;
      if (returnCorridor.requested && !returnCorridor.released) {
        if (!firePoliceAtBase() || !traffic.releaseYield(returnCorridor.vehicleId)) return false;
      }
      var responseRuntimeState = response.getState ? response.getState() : null;
      if ((responseRuntimeState === "AT_STATIONS" || responseRuntimeState === "FAILED") && response.reset && response.reset() !== true) return false;
      var ambulanceRuntimeState = ambulance.getState ? ambulance.getState() : null;
      if ((ambulanceRuntimeState === "AT_STATION" || ambulanceRuntimeState === "FAILED") && ambulance.reset && ambulance.reset() !== true) return false;
      if (response.getRouteProfileId && response.getRouteProfileId() !== "MISSION_001_DEFAULT" && !response.restoreDefaultRouteProfile()) {
        addError("resetErrors", "Fire/police default route profile was not restored during reset.");
        return false;
      }
      if (ambulance.getRouteProfileId && ambulance.getRouteProfileId() !== "MISSION_002_DEFAULT" && !ambulance.restoreDefaultRouteProfile()) {
        addError("resetErrors", "Ambulance default route profile was not restored during reset.");
        return false;
      }
      clearMission004LocalReturnState();
      return safety.status === "PASSED";
    }

    function getSafetyStatus() {
      var result = copy(safety);
      var responseSafety = response.getSafetyStatus && response.getSafetyStatus();
      var ambulanceSafety = ambulance.getSafetyStatus && ambulance.getSafetyStatus();
      if (!responseSafety || responseSafety.status !== "PASSED") {
        result.status = "FAILED";
        result.failed = true;
        result.dependencyErrors += 1;
        result.errors.push("Fire/police response runtime is unsafe.");
      }
      if (!ambulanceSafety || ambulanceSafety.status !== "PASSED") {
        result.status = "FAILED";
        result.failed = true;
        result.dependencyErrors += 1;
        result.errors.push("Ambulance runtime is unsafe.");
      }
      return result;
    }

    return {
      prepare: prepare,
      dispatch: dispatch,
      beginReturnAndTransport: beginReturnAndTransport,
      update: update,
      reset: reset,
      allAtScene: allAtScene,
      firePoliceAtBase: firePoliceAtBase,
      ambulanceAtHospital: ambulanceAtHospital,
      allAtBase: allAtBase,
      isTrafficReleased: isTrafficReleased,
      isSceneCleared: isSceneCleared,
      isPrepared: function () { return state !== "IDLE"; },
      isLeadVehicleYielded: isLeadVehicleYielded,
      isProtectedCorridorClear: isProtectedCorridorClear,
      getTrafficClosureStatus: getTrafficClosureStatus,
      ambulanceAtScene: ambulanceAtScene,
      getTrafficClearanceTrajectory: function (currentDistance, vehicleIndex, assignment, ring, trafficValidator) {
        return getTrafficClearanceTrajectory(trafficPlan, currentDistance, vehicleIndex, assignment, ring, trafficValidator);
      },
      getReturnManeuverStatus: function () {
        return response.getReturnManeuverStatus();
      },
      getOutboundCorridorStatus: getOutboundCorridorStatus,
      getReturnCorridorStatus: getReturnCorridorStatus,
      isReturnCorridorReady: isReturnCorridorReady,
      isAmbulanceReturning: function () { return !!(ambulance.getState && ambulance.getState() === "RETURNING"); },
      getAmbulanceReturnStatus: function () {
        var vehicle = ambulance.vehiclesById && ambulance.vehiclesById.AMBULANCE_01;
        return {
          hospitalHoldSeconds: finite(sequence.hospitalHoldSeconds, 2.5),
          commandIssued: ambulanceReturnIssued,
          commandSequence: ambulanceReturnCommandSequence,
          lastCommandResult: ambulanceReturnCommandResult,
          commandStateElapsedSeconds: ambulanceReturnCommandStateElapsed,
          returningConfirmed: ambulanceReturnStateConfirmed,
          returningElapsedSeconds: ambulanceReturnElapsed,
          completedAtStation: ambulanceReturnCompleted,
          ambulanceState: ambulance.getState ? ambulance.getState() : null,
          routeId: vehicle ? vehicle.routeId : null,
          distance: vehicle ? finite(vehicle.distance, 0) : null
        };
      },
      getState: function () { return state; },
      getCrossMissionHandoffStatus: getCrossMissionHandoffStatus,
      finalizeForSharedHandoff: finalizeForSharedHandoff,
      getSafetyStatus: getSafetyStatus
    };
  }

  window.MissionBosMission004ResponseController = {
    create: create,
    computeSafeHoldAssignment: computeSafeHoldAssignment,
    getTrafficClearanceTrajectory: getTrafficClearanceTrajectory,
    computeReturnCorridorAssignment: computeReturnCorridorAssignment
  };
})();
