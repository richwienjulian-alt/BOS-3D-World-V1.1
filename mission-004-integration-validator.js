/* Mission BOS - Build 013M.2 preparation runtime integration validator. */
(function () {
  "use strict";
  function copy(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function validate(options) {
    options = options || {};
    var c = options.contract, mission = options.mission004Runtime, response = options.responseRuntime, scene = options.sceneRuntime, connectivity = options.connectivityRuntime, registry = options.registryRuntime, association = options.associationRuntime, load = options.cellLoadRuntime, capacity = options.capacityRuntime, ambulance = options.ambulanceRuntime;
    var r = { title: "MISSION BOS MISSION 004 INTEGRATION VALIDATION", dependencyErrors: 0, registryErrors: 0, runtimeContractErrors: 0, responseErrors: 0, sceneErrors: 0, connectivityErrors: 0, networkErrors: 0, ambulanceCompatibilityErrors: 0, ownershipErrors: 0, status: "PASSED", errors: [] };
    function add(k, m) { r[k] += 1; r.errors.push(m); }
    if (!c || !mission || !response || !scene || !connectivity || !registry || !association || !load || !capacity || !ambulance) add("dependencyErrors", "One or more Mission 004 integration dependencies are missing.");
    function methods(runtime, names, key, label) { (names || []).forEach(function (name) { if (!runtime || typeof runtime[name] !== "function") add(key, label + " is missing " + name + "."); }); }
    if (!r.errors.length) {
      methods(mission, (window.MISSION_BOS_MISSION_004_PLAN.runtimeContract || {}).requiredMissionMethods, "runtimeContractErrors", "Mission runtime");
      methods(response, (window.MISSION_BOS_MISSION_004_PLAN.runtimeContract || {}).requiredResponseMethods, "responseErrors", "Response runtime");
      methods(scene, (window.MISSION_BOS_MISSION_004_PLAN.runtimeContract || {}).requiredSceneMethods, "sceneErrors", "Scene runtime");
      methods(ambulance, (c.ambulanceCompatibility || {}).existingMission002MethodsMustRemain, "ambulanceCompatibilityErrors", "Ambulance compatibility");
      methods(ambulance, (c.ambulanceCompatibility || {}).newGenericProfileMethodsRequired, "ambulanceCompatibilityErrors", "Ambulance profile API");
      var registryManifest = registry.getManifest && registry.getManifest();
      if (!registryManifest || registryManifest.registrationFinalized !== true || registryManifest.registeredRuntimes !== 4) add("registryErrors", "Registry is not finalized with four runtimes.");
      var missionManifest = mission.getManifest && mission.getManifest();
      if (!missionManifest || missionManifest.status !== "PASSED") add("runtimeContractErrors", "Mission 004 manifest is not PASSED.");
      var sceneManifest = scene.getManifest && scene.getManifest();
      if (!sceneManifest || sceneManifest.status !== "PASSED") add("sceneErrors", "Mission 004 scene manifest is not PASSED.");
      var connectivityManifest = connectivity.getManifest && connectivity.getManifest();
      if (!connectivityManifest || connectivityManifest.status !== "PASSED" || Number((connectivityManifest.actual || {}).civilianLines) !== 8) add("connectivityErrors", "Mission 004 civilian connectivity is incomplete.");
      var associationSafety = association.getSafetyStatus && association.getSafetyStatus(), loadSafety = load.getSafetyStatus && load.getSafetyStatus(), capacitySafety = capacity.getSafetyStatus && capacity.getSafetyStatus();
      if (!associationSafety || associationSafety.status !== "PASSED" || !loadSafety || loadSafety.status !== "PASSED" || !capacitySafety || capacitySafety.status !== "PASSED") add("networkErrors", "Association, load or capacity runtime is unsafe.");
      if (connectivityManifest && Number((connectivityManifest.actual || {}).operationalVehicleLines || 0) !== 0) add("ownershipErrors", "Mission 004 civilian renderer must not own operational-vehicle links.");
    }
    if (r.errors.length) r.status = "FAILED";
    return copy(r);
  }
  function logResult(r) { console.group(r.title); Object.keys(r).filter(function (k) { return /Errors$/.test(k); }).forEach(function (k) { console.log(k + ": " + r[k]); }); console[r.status === "PASSED" ? "log" : "error"]("STATUS: " + r.status); if (r.errors.length) console.error(r.errors); console.groupEnd(); }
  window.MissionBosMission004IntegrationValidator = { validate: validate, logResult: logResult };
})();
