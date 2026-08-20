/* Mission BOS - Build 012M.2
   Structural validator for the Stadtwerke amber-beacon polish contract.
*/
(function () {
  "use strict";

  function add(result, key, message) {
    result[key] += 1;
    result.errors.push(message);
  }

  function validate(plan) {
    var result = {
      title: "MISSION BOS STADTWERKE BEACON POLISH 012M.2 VALIDATION",
      dependencyErrors: 0,
      baselineErrors: 0,
      policyErrors: 0,
      beaconErrors: 0,
      haloErrors: 0,
      behaviorErrors: 0,
      expectedCountErrors: 0,
      status: "PASSED",
      errors: []
    };

    if (!plan) {
      add(result, "dependencyErrors", "Stadtwerke beacon polish plan is missing.");
      result.status = "FAILED";
      return result;
    }
    if (plan.sourceBuild !== "Mission-BOS-Build-012M.1" || plan.build !== "012M.2") {
      add(result, "baselineErrors", "Unexpected source build or target build.");
    }

    var policy = plan.policy || {};
    ["vehicleGeometryRedesignAllowed", "routeChangesAllowed", "mission003StateChangesAllowed",
      "blueEmergencyLightAllowed", "additionalVehicleAllowed", "beaconMayRenderThroughBuildings"].forEach(function (key) {
      if (policy[key] !== false) add(result, "policyErrors", "Policy must be false: " + key);
    });

    var beacon = plan.beacon || {};
    if (beacon.color !== "#FFB000" || Number(beacon.activeEmissiveMinimum) < 1 ||
        Number(beacon.activeEmissiveMaximum) <= Number(beacon.activeEmissiveMinimum) ||
        Number(beacon.activeOpacityMinimum) < 0.8 || Number(beacon.activeOpacityMaximum) !== 1 ||
        Number(beacon.pulseCyclesPerSecond) < 1 || Number(beacon.pulseCyclesPerSecond) > 2.5 ||
        Number(beacon.maximumLensRadius) > 0.20 || Number(beacon.maximumLensHeight) > 0.30) {
      add(result, "beaconErrors", "Beacon visibility contract is invalid.");
    }

    var halo = plan.halo || {};
    if (halo.required !== true || halo.color !== "#FFC247" ||
        Number(halo.maximumRadius) > 0.30 || halo.depthTest !== true ||
        halo.depthWrite !== false || halo.externalTextureRequired !== false) {
      add(result, "haloErrors", "Beacon halo contract is invalid.");
    }

    var behavior = plan.behavior || {};
    ["inactiveWhileParked", "activeFromMission003PreparationUntilReturnComplete",
      "followsVehicleRoot", "visibleFromPresentationCamera", "noMissionTransitionDependency"].forEach(function (key) {
      if (behavior[key] !== true) add(result, "behaviorErrors", "Behavior rule must be true: " + key);
    });

    var expected = plan.expected || {};
    if (Number(expected.stadtwerkeVehicles) !== 1 || Number(expected.amberBeaconLenses) !== 1 ||
        Number(expected.amberBeaconHalos) !== 1 || Number(expected.blueBeaconObjects) !== 0 ||
        Number(expected.routeChanges) !== 0) {
      add(result, "expectedCountErrors", "Expected counts are invalid.");
    }

    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }

  function logResult(result) {
    result = result || { title: "MISSION BOS STADTWERKE BEACON POLISH 012M.2 VALIDATION", status: "FAILED", errors: ["No result."] };
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    ["dependencyErrors", "baselineErrors", "policyErrors", "beaconErrors", "haloErrors", "behaviorErrors", "expectedCountErrors"].forEach(function (key) {
      console[method](key + ": " + Number(result[key] || 0));
    });
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosStadtwerkeBeaconPolishValidator = {
    validate: validate,
    logResult: logResult
  };
})();
