/* Mission BOS - Build 010P.5
   Read-only startup validation for the recovered dual-mission runtime.
*/
(function () {
  "use strict";
  function copy(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function methods(runtime, names) {
    return (names || []).every(function (name) { return runtime && typeof runtime[name] === "function"; });
  }
  function forbidden(value) {
    var total = 0;
    function walk(node) {
      if (!node || typeof node !== "object") return;
      Object.keys(node).forEach(function (key) {
        var normalized = String(key).toLowerCase();
        if (normalized === "servingtowerid" || normalized === "servingcellid" ||
            normalized === "fixedtowerid" || normalized === "missiontowerid") total += 1;
        walk(node[key]);
      });
    }
    walk(value);
    return total;
  }
  function validate(options) {
    options = options || {};
    var plan = options.plan;
    var registry = options.registryRuntime;
    var mission001 = options.mission001Runtime;
    var mission002 = options.mission002Runtime;
    var mission002Scene = options.mission002SceneRuntime;
    var mission002Plan = options.mission002Plan;
    var arena = options.arenaEventRuntime;
    var ambulanceTest = options.ambulanceFoundationRuntime;
    var errors = [];
    function add(code, detail) { errors.push({ code: code, detail: detail }); }

    if (!plan) add("PLAN_MISSING", null);
    var required = plan ? plan.requiredRuntimeMethods : [];
    if (!methods(mission001, required)) add("MISSION_001_CONTRACT", null);
    if (!methods(mission002, required)) add("MISSION_002_CONTRACT", null);

    var registryManifest = registry && registry.getManifest ? registry.getManifest() : null;
    var registrySafety = registry && registry.getSafetyStatus ? registry.getSafetyStatus() : null;
    if (!registryManifest || registryManifest.status !== "PASSED") add("REGISTRY_MANIFEST", registryManifest);
    if (!registrySafety || registrySafety.status !== "PASSED") add("REGISTRY_SAFETY", registrySafety);
    if (!registryManifest || registryManifest.registeredRuntimes !== 2 || registryManifest.registrationFinalized !== true) {
      add("REGISTRY_NOT_FINALIZED", registryManifest);
    }
    if (registry && registry.getSelectedMissionId && registry.getSelectedMissionId() !== "MISSION_001") {
      add("INITIAL_SELECTION", registry.getSelectedMissionId());
    }
    if (registry && registry.getActiveMissionId && registry.getActiveMissionId() !== null) {
      add("ACTIVE_MISSION_AT_STARTUP", registry.getActiveMissionId());
    }

    if (mission001 && mission001.getState && mission001.getState() !== "READY") add("MISSION_001_NOT_READY", mission001.getState());
    if (mission002 && mission002.getState && mission002.getState() !== "READY") add("MISSION_002_NOT_READY", mission002.getState());

    var sceneManifest = mission002Scene && mission002Scene.getManifest ? mission002Scene.getManifest() : null;
    var sceneSafety = mission002Scene && mission002Scene.getSafetyStatus ? mission002Scene.getSafetyStatus() : null;
    if (!sceneManifest || sceneManifest.status !== "PASSED") add("MISSION_002_SCENE_MANIFEST", sceneManifest);
    if (!sceneSafety || sceneSafety.status !== "PASSED") add("MISSION_002_SCENE_SAFETY", sceneSafety);
    if (sceneManifest && sceneManifest.actual) {
      if (sceneManifest.actual.sceneActors !== 3) add("MISSION_002_SCENE_ACTORS", sceneManifest.actual.sceneActors);
      if (sceneManifest.actual.patients !== 1) add("MISSION_002_PATIENTS", sceneManifest.actual.patients);
      if (sceneManifest.actual.paramedics !== 2) add("MISSION_002_PARAMEDICS", sceneManifest.actual.paramedics);
      if (sceneManifest.actual.sceneProps !== 1) add("MISSION_002_SCENE_PROPS", sceneManifest.actual.sceneProps);
    }

    if (arena && arena.isActive && arena.isActive()) add("ARENA_ACTIVE_AT_STARTUP", true);
    if (ambulanceTest && ambulanceTest.isActive && ambulanceTest.isActive()) add("AMBULANCE_TEST_ACTIVE_AT_STARTUP", true);
    if (forbidden(mission002Plan) !== 0) add("FIXED_SERVING_TOWER", forbidden(mission002Plan));

    return {
      title: "MISSION BOS DUAL-MISSION RECOVERY VALIDATION",
      registeredRuntimes: registryManifest ? registryManifest.registeredRuntimes : 0,
      registrationFinalized: registryManifest ? registryManifest.registrationFinalized : false,
      mission001State: mission001 && mission001.getState ? mission001.getState() : "MISSING",
      mission002State: mission002 && mission002.getState ? mission002.getState() : "MISSING",
      errors: errors,
      status: errors.length ? "FAILED" : "PASSED"
    };
  }
  function logResult(result) {
    var method = result && result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    console[method]("Registered runtimes: " + result.registeredRuntimes + " / 2");
    console[method]("Registration finalized: " + result.registrationFinalized);
    console[method]("Mission 001 state: " + result.mission001State);
    console[method]("Mission 002 state: " + result.mission002State);
    console[method]("Errors: " + result.errors.length);
    console[method]("STATUS: " + result.status);
    if (result.errors.length) console.error(result.errors);
    console.groupEnd();
  }
  window.MissionBosDualMissionRecoveryValidator = {
    validate: validate,
    logResult: logResult,
    copy: copy
  };
})();
