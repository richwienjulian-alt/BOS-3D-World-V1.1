/* Mission BOS - Build 012M.4
   Runtime integration validator for the accepted three-mission build,
   including operational connectivity parity and explicit renderer ownership.
*/
(function () {
  "use strict";

  function add(result, key, message) {
    result[key] += 1;
    result.errors.push(message);
  }

  function methods(runtime, names) {
    return !!runtime && (names || []).every(function (name) {
      return typeof runtime[name] === "function";
    });
  }

  function manifest(runtime) {
    return runtime && typeof runtime.getManifest === "function" ? runtime.getManifest() : null;
  }

  function safety(runtime) {
    return runtime && typeof runtime.getSafetyStatus === "function" ? runtime.getSafetyStatus() : null;
  }

  function validate(options) {
    options = options || {};
    var result = {
      title: "MISSION BOS MISSION 003 012M.4 RUNTIME INTEGRATION VALIDATION",
      planValidationErrors: 0,
      connectivityParityPlanErrors: 0,
      connectivityParityRuntimeErrors: 0,
      connectivityRecoveryPlanErrors: 0,
      connectivityRecoveryRuntimeErrors: 0,
      registryErrors: 0,
      missionRuntimeErrors: 0,
      sceneRuntimeErrors: 0,
      responseRuntimeErrors: 0,
      vehicleRuntimeErrors: 0,
      operationalConnectivityErrors: 0,
      civilianConnectivityErrors: 0,
      backhaulErrors: 0,
      networkRuntimeErrors: 0,
      loadRuntimeErrors: 0,
      capacityRuntimeErrors: 0,
      readyStateErrors: 0,
      failSoftContractErrors: 0,
      status: "PASSED",
      errors: []
    };

    [
      options.responsePlanValidation,
      options.missionPlanValidation,
      options.networkExtensionValidation,
      options.registryExtensionValidation
    ].forEach(function (validation, index) {
      if (!validation || validation.status !== "PASSED") {
        add(result, "planValidationErrors", "Preparation validation failed at index " + index + ".");
      }
    });

    if (!options.connectivityParityPlanValidation ||
        options.connectivityParityPlanValidation.status !== "PASSED") {
      add(result, "connectivityParityPlanErrors", "Mission 003 connectivity parity plan validation failed.");
    }

    var parityRuntimeValidation = options.connectivityParityRuntimeValidation;
    if ((!parityRuntimeValidation || parityRuntimeValidation.status !== "PASSED") &&
        window.MissionBosMission003ConnectivityParityValidator &&
        typeof window.MissionBosMission003ConnectivityParityValidator.validateRuntime === "function") {
      parityRuntimeValidation = window.MissionBosMission003ConnectivityParityValidator.validateRuntime({
        unifiedRuntime: options.unifiedRuntime,
        associationRuntime: options.associationRuntime,
        mission003ConnectivityRuntime: options.mission003ConnectivityRuntime,
        backhaulRuntime: options.backhaulRuntime,
        mission003Runtime: options.mission003Runtime
      });
    }
    if (!parityRuntimeValidation || parityRuntimeValidation.status !== "PASSED") {
      add(result, "connectivityParityRuntimeErrors", "Mission 003 connectivity parity runtime validation failed.");
    }

    if (!options.connectivityRecoveryPlanValidation ||
        options.connectivityRecoveryPlanValidation.status !== "PASSED") {
      add(result, "connectivityRecoveryPlanErrors", "Mission 003 connectivity recovery plan validation failed.");
    }
    if (!options.connectivityRecoveryRuntimeValidation ||
        options.connectivityRecoveryRuntimeValidation.status !== "PASSED") {
      add(result, "connectivityRecoveryRuntimeErrors", "Mission 003 connectivity recovery runtime validation failed.");
    }

    var registry = options.registryRuntime;
    var registryManifest = manifest(registry);
    var registrySafety = safety(registry);
    if (!methods(registry, [
      "registerRuntime", "registerUnavailable", "finalizeRuntimeRegistration", "getSelectedRuntime",
      "startSelected", "finishSelected", "reset", "getManifest", "getSafetyStatus"
    ]) || !registryManifest || registryManifest.status !== "PASSED" ||
        registryManifest.registrationFinalized !== true ||
        Number(registryManifest.registeredRuntimes) !== 3 ||
        Number(registryManifest.unavailableMissions || 0) !== 0 ||
        !registrySafety || registrySafety.status !== "PASSED") {
      add(result, "registryErrors", "The accepted build requires a finalized safe registry with three runtimes.");
    }

    var missionMethods = [
      "start", "activateBOS", "finishAndReturn", "update", "reset", "getState", "getPhaseLabel",
      "getStageLabel", "getStatusLabel", "getDescription", "getProgress", "isActive", "isCompleted",
      "canStart", "canActivateBOS", "canFinish", "getSafetyStatus"
    ];
    [options.mission001Runtime, options.mission002Runtime, options.mission003Runtime].forEach(function (runtime, index) {
      var runtimeSafety = safety(runtime);
      if (!methods(runtime, missionMethods) || !runtimeSafety || runtimeSafety.status !== "PASSED") {
        add(result, "missionRuntimeErrors", "Mission runtime is missing or unsafe at index " + index + ".");
      }
    });

    var mission003 = options.mission003Runtime;
    if (!mission003 || typeof mission003.getState !== "function" || mission003.getState() !== "READY") {
      add(result, "readyStateErrors", "Mission 003 must initialize in READY.");
    }
    var mission003PriorityIds = mission003 && typeof mission003.getBosEndpointIds === "function"
      ? mission003.getBosEndpointIds() : [];
    if (!Array.isArray(mission003PriorityIds) ||
        mission003PriorityIds.slice().sort().join("|") !==
          ["NET_FIRE_01", "NET_POLICE_01", "NET_STADTWERKE_01"].sort().join("|")) {
      add(result, "missionRuntimeErrors", "Mission 003 priority participant group is incomplete.");
    }
    if (options.mission001Runtime && options.mission001Runtime.getState() !== "READY") {
      add(result, "readyStateErrors", "Mission 001 is not READY.");
    }
    if (options.mission002Runtime && options.mission002Runtime.getState() !== "READY") {
      add(result, "readyStateErrors", "Mission 002 is not READY.");
    }

    var scene = options.mission003SceneRuntime;
    var sceneManifest = manifest(scene);
    var sceneSafety = safety(scene);
    if (!methods(scene, [
      "setState", "update", "reset", "getEndpointPosition", "getManifest", "getSafetyStatus", "dispose"
    ]) || !sceneManifest || sceneManifest.status !== "PASSED" ||
        !sceneSafety || sceneSafety.status !== "PASSED") {
      add(result, "sceneRuntimeErrors", "Mission 003 scene runtime is unavailable or unsafe.");
    }

    var response = options.mission003ResponseRuntime;
    var responseSafety = safety(response);
    if (!methods(response, [
      "prepare", "dispatch", "returnToBases", "update", "reset", "getState", "allAtScene", "allAtBase", "getSafetyStatus"
    ]) || !responseSafety || responseSafety.status !== "PASSED") {
      add(result, "responseRuntimeErrors", "Mission 003 multi-agency response runtime is unavailable or unsafe.");
    }

    var utility = options.stadtwerkeRuntime;
    var utilityManifest = manifest(utility);
    var utilitySafety = safety(utility);
    if (!utility || !utility.vehiclesById || !utility.vehiclesById.STADTWERKE_01 ||
        !methods(utility, ["update", "getCommsPosition", "getManifest", "getSafetyStatus", "dispose"]) ||
        !utilityManifest || utilityManifest.status !== "PASSED" ||
        !utilitySafety || utilitySafety.status !== "PASSED") {
      add(result, "vehicleRuntimeErrors", "STADTWERKE_01 is unavailable or unsafe.");
    }

    var unified = options.unifiedRuntime;
    var unifiedManifest = manifest(unified);
    var unifiedSafety = safety(unified);
    if (!unifiedManifest || unifiedManifest.status !== "PASSED" ||
        Number(unifiedManifest.endpoints) !== 4 || Number(unifiedManifest.vehiclePaths) !== 4 ||
        Number(unifiedManifest.totalVehiclePackets) !== 16 ||
        Number(unifiedManifest.forwardPackets) !== 8 || Number(unifiedManifest.reversePackets) !== 8 ||
        Number(unifiedManifest.utilityPriorityPaths || 0) !== 0 ||
        !unifiedSafety || unifiedSafety.status !== "PASSED") {
      add(result, "operationalConnectivityErrors", "Unified four-vehicle connectivity runtime is unavailable or unsafe.");
    }

    ["NET_FIRE_01", "NET_POLICE_01", "NET_AMBULANCE_01", "NET_STADTWERKE_01"].forEach(function (endpointId) {
      var snapshot = unified && typeof unified.getEndpointSnapshot === "function"
        ? unified.getEndpointSnapshot(endpointId) : null;
      if (!snapshot || snapshot.visible !== true || !snapshot.servingTowerId ||
          Number(snapshot.visiblePackets) !== 4 || Number(snapshot.forwardPackets) !== 2 ||
          Number(snapshot.reversePackets) !== 2) {
        add(result, "operationalConnectivityErrors", "Operational endpoint path is incomplete: " + endpointId);
      }
      if (endpointId === "NET_STADTWERKE_01" && snapshot && snapshot.priorityActive === true &&
          mission003 && mission003.getState && mission003.getState() === "READY") {
        add(result, "operationalConnectivityErrors", "STADTWERKE_01 priority leaked into READY.");
      }
    });

    var mission003Connectivity = options.mission003ConnectivityRuntime;
    var mission003ConnectivityManifest = manifest(mission003Connectivity);
    var mission003ConnectivitySafety = safety(mission003Connectivity);
    var actualConnectivity = mission003ConnectivityManifest && mission003ConnectivityManifest.actual || {};
    if (!mission003ConnectivityManifest || mission003ConnectivityManifest.status !== "PASSED" ||
        Number(actualConnectivity.utilityLines) !== 0 || Number(actualConnectivity.civilianLines) !== 6 ||
        Number(actualConnectivity.totalLines) !== 6 || Number(actualConnectivity.dataPoints) !== 6 ||
        !mission003ConnectivitySafety || mission003ConnectivitySafety.status !== "PASSED") {
      add(result, "civilianConnectivityErrors", "Mission 003 connectivity runtime must own exactly six civilian paths and no utility path.");
    }

    var backhaul = options.backhaulRuntime;
    var backhaulManifest = manifest(backhaul);
    var backhaulSafety = safety(backhaul);
    var backhaulSnapshot = backhaul && typeof backhaul.getRuntimeSnapshot === "function"
      ? backhaul.getRuntimeSnapshot() : null;
    if (!backhaulManifest || backhaulManifest.status !== "PASSED" ||
        !backhaulSafety || backhaulSafety.status !== "PASSED" || !Array.isArray(backhaulSnapshot)) {
      add(result, "backhaulErrors", "B01/G02 backhaul runtime is unavailable or unsafe.");
    } else {
      ["NET_FIRE_01", "NET_POLICE_01"].forEach(function (endpointId) {
        var covered = backhaulSnapshot.some(function (path) {
          return path && path.buildingId === "B01" && Array.isArray(path.endpointIds) &&
            path.endpointIds.indexOf(endpointId) >= 0;
        });
        if (!covered) add(result, "backhaulErrors", "B01 backhaul does not cover: " + endpointId);
      });
      var ambulanceCovered = backhaulSnapshot.some(function (path) {
        return path && path.buildingId === "G02" && Array.isArray(path.endpointIds) &&
          path.endpointIds.indexOf("NET_AMBULANCE_01") >= 0;
      });
      if (!ambulanceCovered) add(result, "backhaulErrors", "G02 backhaul does not cover NET_AMBULANCE_01.");
      var utilityBackhaul = backhaulSnapshot.some(function (path) {
        return path && Array.isArray(path.endpointIds) && path.endpointIds.indexOf("NET_STADTWERKE_01") >= 0;
      });
      if (utilityBackhaul) add(result, "backhaulErrors", "Unexpected Stadtwerke backhaul path detected.");
    }

    var association = options.associationRuntime;
    var associationManifest = manifest(association);
    var associationSafety = safety(association);
    var utilityAssociation = association && typeof association.getAssociation === "function"
      ? association.getAssociation("NET_STADTWERKE_01") : null;
    if (!associationManifest || associationManifest.status !== "PASSED" ||
        Number(((associationManifest.actual || {}).mobileEndpoints)) !== 41 ||
        !associationSafety || associationSafety.status !== "PASSED" ||
        !utilityAssociation || utilityAssociation.channel !== "UTILITY" || utilityAssociation.active !== true) {
      add(result, "networkRuntimeErrors", "Extended 41-endpoint association runtime is unavailable or utility association is invalid.");
    }

    var loadManifest = manifest(options.cellLoadRuntime);
    var loadSafety = safety(options.cellLoadRuntime);
    if (!loadManifest || loadManifest.status !== "PASSED" || !loadSafety || loadSafety.status !== "PASSED") {
      add(result, "loadRuntimeErrors", "Cell-load runtime is unavailable or unsafe.");
    }

    var capacityManifest = manifest(options.capacityRuntime);
    var capacitySafety = safety(options.capacityRuntime);
    if (!capacityManifest || capacityManifest.status !== "PASSED" ||
        Number(((capacityManifest.actual || {}).visibleCivilianEndpoints)) !== 38 ||
        !capacitySafety || capacitySafety.status !== "PASSED") {
      add(result, "capacityRuntimeErrors", "Capacity runtime must include all 38 non-BOS endpoints.");
    }

    var registryPlan = options.registryPlan || {};
    var contract = registryPlan.runtimeContract || {};
    if ((contract.requiredMissionIds || []).join("|") !== "MISSION_001|MISSION_002" ||
        (contract.failSoftMissionIds || []).join("|") !== "MISSION_003" ||
        contract.finalizationRequiresEveryDefinitionResolved !== true) {
      add(result, "failSoftContractErrors", "Mission 003 fail-soft registry contract is missing.");
    }

    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }

  function logResult(result) {
    var method = result && result.status === "PASSED" ? "log" : "error";
    console.group((result && result.title) || "MISSION BOS MISSION 003 RUNTIME INTEGRATION VALIDATION");
    [
      "planValidationErrors", "connectivityParityPlanErrors", "connectivityParityRuntimeErrors",
      "connectivityRecoveryPlanErrors", "connectivityRecoveryRuntimeErrors",
      "registryErrors", "missionRuntimeErrors", "sceneRuntimeErrors", "responseRuntimeErrors",
      "vehicleRuntimeErrors", "operationalConnectivityErrors", "civilianConnectivityErrors",
      "backhaulErrors", "networkRuntimeErrors", "loadRuntimeErrors", "capacityRuntimeErrors",
      "readyStateErrors", "failSoftContractErrors"
    ].forEach(function (key) {
      console[method](key + ": " + Number((result && result[key]) || 0));
    });
    console[method]("STATUS: " + ((result && result.status) || "FAILED"));
    if (result && result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosMission003IntegrationValidator = {
    validate: validate,
    logResult: logResult
  };
})();
