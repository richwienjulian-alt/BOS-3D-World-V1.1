/* Mission BOS - Build 013M.1 preparation validator */
(function () {
  "use strict";
  function finite(value, fallback) { value = Number(value); return isFinite(value) ? value : fallback; }
  function validate(layout, plan) {
    var result = {
      title: "MISSION BOS MISSION 004 FOUNDATION PLAN VALIDATION",
      dependencyErrors: 0,
      policyErrors: 0,
      incidentErrors: 0,
      sceneErrors: 0,
      routeErrors: 0,
      trafficErrors: 0,
      networkErrors: 0,
      duplicateIdErrors: 0,
      fixedTowerErrors: 0,
      countErrors: 0,
      status: "PASSED",
      errors: []
    };
    if (!layout || !plan) {
      result.dependencyErrors += 1;
      result.errors.push("City layout or Mission 004 foundation plan is missing.");
    } else {
      var policy = plan.policy || {};
      if (policy.cityGeometryChangesAllowed !== false || policy.existingMissionChangesAllowed !== false ||
          policy.existingVehicleDuplicationAllowed !== false || policy.fixedServingTowerAllowed !== false ||
          policy.automaticCameraMovementAllowed !== false || policy.automaticMissionStartAllowed !== false) {
        result.policyErrors += 1;
        result.errors.push("Mission 004 must be additive and may not change the protected city or existing missions.");
      }
      var ring = (layout.roadSurfaces || []).filter(function (item) { return item.id === "RING_NORTH"; })[0];
      var incident = plan.incident || {};
      if (!ring || !incident.position) {
        result.incidentErrors += 1;
        result.errors.push("Ring North or incident position is missing.");
      } else {
        var r = ring.worldRect, p = incident.position;
        if (p.x < r.x - r.width / 2 || p.x > r.x + r.width / 2 ||
            p.z < r.z - r.depth / 2 || p.z > r.z + r.depth / 2) {
          result.incidentErrors += 1;
          result.errors.push("Mission 004 incident is not located on Ring North.");
        }
      }
      var scene = plan.scene || {}, ids = Object.create(null);
      function addId(id) {
        if (!id || ids[id]) { result.duplicateIdErrors += 1; result.errors.push("Duplicate or missing Mission 004 id: " + id); }
        ids[id] = true;
      }
      (scene.collisionVehicles || []).forEach(function (item) { addId(item.id); });
      if (scene.patient) addId(scene.patient.id);
      (scene.responders || []).forEach(function (item) { addId(item.id); });
      (scene.bystanders || []).forEach(function (item) { addId(item.id); addId(item.endpointId); });
      if ((scene.collisionVehicles || []).length !== 2 || !scene.patient ||
          (scene.responders || []).length !== 4 || (scene.bystanders || []).length !== 8) {
        result.sceneErrors += 1;
        result.errors.push("Mission 004 scene counts are incomplete.");
      }
      var response = plan.response || {};
      if ((response.activeVehicleIds || []).join("|") !== "RESPONSE_FIRE_01|RESPONSE_POLICE_01|AMBULANCE_01" ||
          !response.fireRoute || !response.policeRoute || !response.ambulanceOutboundRoute || !response.ambulanceHospitalRoute) {
        result.routeErrors += 1;
        result.errors.push("Fire, police and ambulance route contracts are required.");
      }
      [response.fireRoute, response.policeRoute, response.ambulanceOutboundRoute, response.ambulanceHospitalRoute].forEach(function (route) {
        var points = route && (route.points || route.extensionWaypoints);
        if (!route || !Array.isArray(points) || points.length < 2 || points.some(function (p) { return !isFinite(Number(p.x)) || !isFinite(Number(p.z)); })) {
          result.routeErrors += 1;
          result.errors.push("A Mission 004 route contains invalid points.");
        }
      });
      var traffic = plan.trafficClosure || {};
      if (traffic.routeId !== "OUTER_RING_ONE_WAY" || (traffic.affectedVehicleIds || []).length !== 3 ||
          (traffic.queueHoldDistances || []).length !== 3 || traffic.dispatchMayWaitOnlyForLeadVehicle !== true) {
        result.trafficErrors += 1;
        result.errors.push("The deterministic Ring North traffic-closure contract is incomplete.");
      }
      var future = plan.futureRuntime || {};
      if ((future.activeBosEndpointIds || []).join("|") !== "NET_FIRE_01|NET_POLICE_01|NET_AMBULANCE_01" ||
          (future.missionCivilianEndpointIds || []).length !== 8 ||
          finite(future.activationThresholdPercent, -1) !== 90 || finite(future.releaseThresholdPercent, -1) !== 85) {
        result.networkErrors += 1;
        result.errors.push("Mission 004 must reuse the shared three-vehicle BOS priority contract and 90/85 hysteresis.");
      }
      var fixedScan = JSON.stringify({ response: response, trafficClosure: traffic, futureRuntime: future });
      if (/servingTowerId|fixedServingTower|forcedTower/.test(fixedScan)) {
        result.fixedTowerErrors += 1;
        result.errors.push("No serving tower may be fixed in Mission 004.");
      }
      var expected = plan.expectedCounts || {};
      if (finite(expected.collisionVehicles, 0) !== 2 || finite(expected.patients, 0) !== 1 ||
          finite(expected.responders, 0) !== 4 || finite(expected.bystanders, 0) !== 8 ||
          finite(expected.responseVehicles, 0) !== 3 || finite(expected.bosEndpoints, 0) !== 3 ||
          finite(expected.registryMissionsAfterFullIntegration, 0) !== 4 ||
          finite(expected.fixedServingTowerDefinitions, -1) !== 0) {
        result.countErrors += 1;
        result.errors.push("Mission 004 expected counts are inconsistent.");
      }
    }
    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }
  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    Object.keys(result).filter(function (key) { return /Errors$/.test(key); }).forEach(function (key) { console[method](key + ": " + result[key]); });
    console[method]("STATUS: " + result.status);
    if (result.errors.length) console.error(result.errors);
    console.groupEnd();
  }
  window.MissionBosMission004FoundationValidator = { validate: validate, logResult: logResult };
})();
