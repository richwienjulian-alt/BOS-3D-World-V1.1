/* Mission BOS - Build 012M.1 preparation
   Structural validator for Mission 003 response routes.
*/
(function () {
  "use strict";

  var EPSILON = 1e-6;

  function finite(value) { return typeof value === "number" && isFinite(value); }
  function add(result, key, message) { result[key] += 1; result.errors.push(message); }
  function find(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      if (items[i] && items[i].id === id) return items[i];
    }
    return null;
  }
  function rect(item) {
    var r = item && (item.worldRect || item.validationRect || item.renderRect || item);
    if (!r || !finite(Number(r.x)) || !finite(Number(r.z)) || !finite(Number(r.width)) || !finite(Number(r.depth))) return null;
    return {
      minX: Number(r.x) - Number(r.width) / 2,
      maxX: Number(r.x) + Number(r.width) / 2,
      minZ: Number(r.z) - Number(r.depth) / 2,
      maxZ: Number(r.z) + Number(r.depth) / 2
    };
  }
  function inside(point, r, margin) {
    margin = Number(margin || 0);
    return !!point && !!r && Number(point.x) >= r.minX - margin && Number(point.x) <= r.maxX + margin &&
      Number(point.z) >= r.minZ - margin && Number(point.z) <= r.maxZ + margin;
  }
  function distance(a, b) { return Math.sqrt(Math.pow(Number(a.x) - Number(b.x), 2) + Math.pow(Number(a.z) - Number(b.z), 2)); }
  function hasForbiddenTowerKey(value) {
    var count = 0;
    function walk(node) {
      if (!node || typeof node !== "object") return;
      Object.keys(node).forEach(function (key) {
        var k = String(key).toLowerCase();
        if (k === "servingtowerid" || k === "fixedtowerid" || k === "missiontowerid") count += 1;
        walk(node[key]);
      });
    }
    walk(value);
    return count;
  }

  function validate(plan, layout, responsePlan, trafficPlan, stadtwerkeFoundationPlan) {
    var result = {
      title: "MISSION BOS MISSION 003 RESPONSE PLAN 012M.1 VALIDATION",
      dependencyErrors: 0,
      sourceBuildErrors: 0,
      policyErrors: 0,
      incidentErrors: 0,
      accessSurfaceErrors: 0,
      trafficYieldErrors: 0,
      vehicleErrors: 0,
      routeErrors: 0,
      stagingErrors: 0,
      returnErrors: 0,
      expectedCountErrors: 0,
      fixedTowerErrors: 0,
      status: "PASSED",
      errors: []
    };

    if (!plan || !layout || !responsePlan || !trafficPlan || !stadtwerkeFoundationPlan) {
      add(result, "dependencyErrors", "Response plan dependencies are incomplete.");
      result.status = "FAILED";
      return result;
    }
    if (plan.sourceBuild !== "Mission-BOS-Build-011N.4") add(result, "sourceBuildErrors", "Unexpected source build.");

    var policy = plan.policy || {};
    if (policy.runtimeRandomizationAllowed !== false || policy.cityGeometryChangesAllowed !== false ||
        policy.existingRouteMutationAllowed !== false || policy.duplicateResponseVehicleModelsAllowed !== false ||
        policy.fixedServingTowerAllowed !== false || policy.automaticCameraMovementAllowed !== false ||
        policy.routeProfilesMustUseExistingVehicleRoots !== true || policy.routeProfileSelectionOnlyAtBase !== true ||
        policy.trafficYieldRequiredBeforeDispatch !== true) {
      add(result, "policyErrors", "Response policy differs from the approved recovery-safe contract.");
    }

    var incident = plan.incident || {};
    var incidentSurface = find(layout.roadSurfaces, incident.surfaceId);
    var landmark = find(layout.pavedAreas, incident.landmarkId);
    if (incident.id !== "MISSION_003_WATER_MAIN_LEAK" || !incidentSurface || !landmark ||
        !inside(incident.position, rect(incidentSurface), 0.001) || distance(incident.position, { x: landmark.worldRect.x, z: landmark.worldRect.z }) > 4.5) {
      add(result, "incidentErrors", "Water-leak incident is not correctly placed on STADTALLEE near the town hall square.");
    }

    var access = plan.customAccessSurfaces || [];
    if (access.length !== 1 || access[0].id !== "STADTWERKE_DEPOT_ACCESS" || !rect(access[0].worldRect)) {
      add(result, "accessSurfaceErrors", "Exactly one validated Stadtwerke depot access surface is required.");
    } else {
      var a = rect(access[0].worldRect);
      var ready = rect(find(layout.parkingAreas, "B06_READY_AREA"));
      var ring = rect(find(layout.roadSurfaces, "RING_SOUTH"));
      if (!ready || !ring || a.minZ > ready.maxZ + EPSILON || a.maxZ < ring.minZ - EPSILON ||
          Number(access[0].worldRect.x) !== -7.32) {
        add(result, "accessSurfaceErrors", "Stadtwerke depot access does not bridge B06_READY_AREA and RING_SOUTH.");
      }
    }

    var yieldPlan = plan.trafficYield || {};
    var yieldVehicle = find(trafficPlan.vehicles, yieldPlan.vehicleId);
    var yieldRoute = find(trafficPlan.routes, yieldPlan.routeId);
    if (!yieldVehicle || !yieldRoute || yieldVehicle.routeId !== yieldRoute.id || Number(yieldPlan.holdDistance) !== 31.9 ||
        yieldPlan.mustBeConfirmedBeforeDispatch !== true || yieldPlan.releaseOnlyAfterAllRespondersAtBase !== true) {
      add(result, "trafficYieldErrors", "Controlled yielding for CAR_DOWNTOWN_01 is invalid.");
    }

    var supportYield = plan.supportTrafficYield || {};
    var supportVehicle = find(trafficPlan.vehicles, supportYield.vehicleId);
    var supportRoute = find(trafficPlan.routes, supportYield.routeId);
    var supportHolds = supportYield.safeHoldDistances || [];
    if (!supportVehicle || !supportRoute || supportVehicle.routeId !== supportRoute.id ||
        supportVehicle.id !== "VAN_SUPPORT_01" || supportRoute.id !== "SOUTH_SUPPORT_LOOP" ||
        supportHolds.length !== 3 || Number(supportHolds[0]) !== 4 || Number(supportHolds[1]) !== 25 || Number(supportHolds[2]) !== 43 ||
        Number(supportYield.maximumForwardTravelToHoldMeters) < 29.11 || Number(supportYield.maximumWaitSeconds) !== 8 ||
        supportYield.mustBeConfirmedBeforeDispatch !== true || supportYield.releaseOnlyAfterAllRespondersAtBase !== true) {
      add(result, "trafficYieldErrors", "Controlled yielding for VAN_SUPPORT_01 is invalid.");
    }

    var vehicles = ((plan.routeProfile || {}).vehicles || []);
    var ids = vehicles.map(function (item) { return item.vehicleId; }).sort();
    if (vehicles.length !== 3 || ids.join("|") !== ["RESPONSE_FIRE_01", "RESPONSE_POLICE_01", "STADTWERKE_01"].sort().join("|")) {
      add(result, "vehicleErrors", "Mission 003 must use exactly the existing fire, police and Stadtwerke vehicles.");
    }
    var baselineVehicleIds = (responsePlan.vehicles || []).map(function (item) { return item.id; });
    if (baselineVehicleIds.indexOf("RESPONSE_FIRE_01") < 0 || baselineVehicleIds.indexOf("RESPONSE_POLICE_01") < 0 ||
        !stadtwerkeFoundationPlan.vehicle || stadtwerkeFoundationPlan.vehicle.id !== "STADTWERKE_01") {
      add(result, "vehicleErrors", "Baseline vehicle references are unavailable.");
    }

    vehicles.forEach(function (vehicle) {
      if (!finite(Number(vehicle.outboundSpeed)) || !finite(Number(vehicle.returnSpeed)) ||
          Number(vehicle.outboundSpeed) <= 0 || Number(vehicle.returnSpeed) <= 0 ||
          !finite(Number(vehicle.dispatchDelaySeconds)) || !finite(Number(vehicle.returnDelaySeconds)) ||
          !vehicle.stagePosition) add(result, "routeErrors", "Invalid route timing or stage data for " + vehicle.vehicleId + ".");
      (vehicle.allowedSurfaceIds || []).forEach(function (surfaceId) {
        var exists = find(layout.roadSurfaces, surfaceId) || find(layout.pavedAreas, surfaceId) ||
          find(layout.parkingAreas, surfaceId) || find(responsePlan.accessSurfaces, surfaceId) ||
          find(access, surfaceId);
        if (!exists) add(result, "routeErrors", "Unknown allowed surface " + surfaceId + " for " + vehicle.vehicleId + ".");
      });
      if (vehicle.vehicleId === "STADTWERKE_01") {
        var waypoints = vehicle.routeWaypoints || [];
        if (waypoints.length !== 5 || waypoints[0].x !== -7.32 || waypoints[0].z !== -34.8 ||
            waypoints[waypoints.length - 1].x !== -3.7 || waypoints[waypoints.length - 1].z !== 6.36) {
          add(result, "routeErrors", "Stadtwerke route waypoints are invalid.");
        }
      } else if (!vehicle.baselinePrefixRouteId || !(vehicle.extensionWaypoints || []).length) {
        add(result, "routeErrors", "Existing response route prefix and extension are required for " + vehicle.vehicleId + ".");
      }
    });

    var byId = Object.create(null);
    vehicles.forEach(function (vehicle) { byId[vehicle.vehicleId] = vehicle; });
    if (!byId.RESPONSE_FIRE_01 || !byId.RESPONSE_POLICE_01 || !byId.STADTWERKE_01) {
      add(result, "stagingErrors", "Stage records are incomplete.");
    } else {
      var fire = byId.RESPONSE_FIRE_01.stagePosition;
      var police = byId.RESPONSE_POLICE_01.stagePosition;
      var utility = byId.STADTWERKE_01.stagePosition;
      if (distance(fire, incident.position) < 3.0 || distance(utility, incident.position) < 3.0 || distance(police, fire) < 4.0) {
        add(result, "stagingErrors", "Vehicle staging clearances are too small.");
      }
      [fire, police, utility].forEach(function (stage) {
        if (!inside(stage, rect(incidentSurface), 0.001)) add(result, "stagingErrors", "A stage position is outside STADTALLEE.");
      });
    }

    var arrival = plan.arrivalContract || {};
    var ret = plan.returnContract || {};
    if (arrival.allThreeVehiclesRequired !== true || arrival.responseRuntimeMustRemainSingleInstance !== true ||
        arrival.permanentNetworkAssociationsMustFollowLiveVehicleRoots !== true) add(result, "stagingErrors", "Arrival contract is invalid.");
    if (ret.reverseValidatedRoutes !== true || ret.policeLeavesBeforeFire !== true || ret.utilityReturnsIndependently !== true ||
        ret.restoreMission001RouteProfileAfterReturn !== true || ret.allVehiclesAtBaseRequiredBeforeReady !== true || ret.noTeleportAllowed !== true) {
      add(result, "returnErrors", "Return contract is invalid.");
    }

    var expected = plan.expectedCounts || {};
    if (Number(expected.responseVehicles) !== 3 || Number(expected.existingBosVehicles) !== 2 ||
        Number(expected.utilityVehicles) !== 1 || Number(expected.newVehicleModels) !== 0 ||
        Number(expected.customAccessSurfaces) !== 1 || Number(expected.yieldedCivilianVehicles) !== 2 ||
        Number(expected.routeProfiles) !== 1 || Number(expected.fixedServingTowerDefinitions) !== 0) {
      add(result, "expectedCountErrors", "Expected response counts are invalid.");
    }
    if (hasForbiddenTowerKey(plan) !== 0) add(result, "fixedTowerErrors", "Fixed serving-tower definition detected.");

    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }

  function logResult(result) {
    var method = result && result.status === "PASSED" ? "log" : "error";
    console.group((result && result.title) || "MISSION BOS MISSION 003 RESPONSE VALIDATION");
    ["dependencyErrors", "sourceBuildErrors", "policyErrors", "incidentErrors", "accessSurfaceErrors",
      "trafficYieldErrors", "vehicleErrors", "routeErrors", "stagingErrors", "returnErrors",
      "expectedCountErrors", "fixedTowerErrors"].forEach(function (key) {
      console[method](key + ": " + Number((result && result[key]) || 0));
    });
    console[method]("STATUS: " + ((result && result.status) || "FAILED"));
    if (result && result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosMission003ResponseValidator = { validate: validate, logResult: logResult };
})();
