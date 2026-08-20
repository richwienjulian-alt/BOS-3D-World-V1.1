/* Mission BOS - Build 011N.4
   Structural validator for the future Mission 003 Stadtwerke vehicle foundation.
*/
(function () {
  "use strict";

  function add(result, key, message) {
    result[key] += 1;
    result.errors.push(message);
  }

  function finite(value) {
    return typeof value === "number" && isFinite(value);
  }

  function validate(plan, layout) {
    var result = {
      title: "MISSION BOS MISSION 003 STADTWERKE FOUNDATION 011N.4 VALIDATION",
      dependencyErrors: 0,
      baselineErrors: 0,
      policyErrors: 0,
      parkingErrors: 0,
      vehicleErrors: 0,
      visualErrors: 0,
      runtimeErrors: 0,
      expectedCountErrors: 0,
      status: "PASSED",
      errors: []
    };

    if (!plan || !layout) {
      add(result, "dependencyErrors", "Foundation plan or layout is missing.");
      result.status = "FAILED";
      return result;
    }

    if (plan.sourceBuild !== "Mission-BOS-Build-011N.3R.1") {
      add(result, "baselineErrors", "Unexpected source build.");
    }

    var policy = plan.policy || {};
    [
      "missionRegistrationAllowed",
      "routeCreationAllowed",
      "movementAllowed",
      "networkRegistrationAllowed",
      "networkDemandAllowed",
      "dashboardCardAllowed",
      "cityGeometryChangesAllowed",
      "existingRouteChangesAllowed",
      "externalAssetsAllowed",
      "runtimeRandomizationAllowed"
    ].forEach(function (key) {
      if (policy[key] !== false) add(result, "policyErrors", "Policy must be false: " + key);
    });

    var areas = layout.parkingAreas || [];
    var area = null;
    for (var i = 0; i < areas.length; i += 1) {
      if (areas[i] && areas[i].id === plan.parkingAreaId) area = areas[i];
    }
    if (!area || !area.worldRect) {
      add(result, "parkingErrors", "B06_READY_AREA is unavailable.");
    }

    var vehicle = plan.vehicle || {};
    var position = vehicle.position || {};
    var dimensions = vehicle.dimensions || {};
    if (vehicle.id !== "STADTWERKE_01" ||
        vehicle.state !== "PARKED" ||
        !finite(position.x) || !finite(position.y) || !finite(position.z) ||
        !finite(vehicle.rotationY)) {
      add(result, "vehicleErrors", "Vehicle identity or transform is invalid.");
    }
    if (Number(position.x) !== -7.32 || Number(position.y) !== 0.42 ||
        Number(position.z) !== -34.80 ||
        Math.abs(Number(vehicle.rotationY) - Math.PI / 2) > 1e-12) {
      add(result, "vehicleErrors", "Vehicle transform differs from the approved placement.");
    }
    if (Number(dimensions.length) !== 4.40 ||
        Number(dimensions.width) !== 1.85 ||
        Number(dimensions.height) !== 2.05 ||
        Number(dimensions.footprintLength) !== 4.60 ||
        Number(dimensions.footprintWidth) !== 1.95) {
      add(result, "vehicleErrors", "Vehicle dimensions are invalid.");
    }

    if (area && area.worldRect) {
      var r = area.worldRect;
      var halfX = Number(dimensions.footprintLength) / 2;
      var halfZ = Number(dimensions.footprintWidth) / 2;
      var minX = Number(position.x) - halfX;
      var maxX = Number(position.x) + halfX;
      var minZ = Number(position.z) - halfZ;
      var maxZ = Number(position.z) + halfZ;
      var areaMinX = Number(r.x) - Number(r.width) / 2;
      var areaMaxX = Number(r.x) + Number(r.width) / 2;
      var areaMinZ = Number(r.z) - Number(r.depth) / 2;
      var areaMaxZ = Number(r.z) + Number(r.depth) / 2;
      if (minX < areaMinX || maxX > areaMaxX || minZ < areaMinZ || maxZ > areaMaxZ) {
        add(result, "parkingErrors", "Vehicle footprint is outside B06_READY_AREA.");
      }
    }

    var colors = vehicle.colors || {};
    var markings = vehicle.markings || {};
    var equipment = vehicle.equipment || {};
    if (colors.body !== "#F7F7F7" || colors.accent !== "#0086A8" ||
        colors.beacon !== "#F5A623" ||
        markings.sideText !== "STADTWERKE" ||
        Number(markings.sideLabels) !== 2 ||
        markings.localCanvasTextureRequired !== true ||
        Number(equipment.wheels) !== 4 ||
        Number(equipment.amberBeacons) !== 1 ||
        Number(equipment.blueEmergencyLights) !== 0 ||
        equipment.beaconFlashingInStandby !== false) {
      add(result, "visualErrors", "Vehicle visual contract is invalid.");
    }

    var runtime = plan.runtimeContract || {};
    [
      "visibleAtStartup",
      "staticPositionRequired",
      "vehiclesByIdRequired",
      "futureCommsPositionRequired",
      "updateMethodRequired",
      "manifestRequired",
      "safetyRequired",
      "disposeRequired"
    ].forEach(function (key) {
      if (runtime[key] !== true) add(result, "runtimeErrors", "Runtime contract must be true: " + key);
    });

    var expected = plan.expected || {};
    if (Number(expected.vehicles) !== 1 ||
        Number(expected.wheels) !== 4 ||
        Number(expected.sideLabels) !== 2 ||
        Number(expected.amberBeacons) !== 1 ||
        Number(expected.routes) !== 0 ||
        Number(expected.networkEndpoints) !== 0 ||
        Number(expected.missionRegistrations) !== 0) {
      add(result, "expectedCountErrors", "Expected foundation counts are invalid.");
    }

    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }

  function logResult(result) {
    result = result || {
      title: "MISSION BOS MISSION 003 STADTWERKE FOUNDATION 011N.4 VALIDATION",
      status: "FAILED",
      errors: ["No result."]
    };
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    [
      "dependencyErrors", "baselineErrors", "policyErrors", "parkingErrors",
      "vehicleErrors", "visualErrors", "runtimeErrors", "expectedCountErrors"
    ].forEach(function (key) {
      console[method](key + ": " + Number(result[key] || 0));
    });
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosMission003StadtwerkeFoundationValidator = {
    validate: validate,
    logResult: logResult
  };
})();
