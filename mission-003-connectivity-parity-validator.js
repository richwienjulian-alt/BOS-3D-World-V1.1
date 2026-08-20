/* Mission BOS - Build 012M.4
   Structural and runtime validator for Mission 003 operational connectivity parity.
*/
(function () {
  "use strict";
  function add(result, key, message) { result[key] += 1; result.errors.push(message); }
  function same(actual, expected) { return Array.isArray(actual) && actual.join("|") === expected.join("|"); }
  function copy(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }

  function validatePlan(plan, unifiedPlan, recoveryPlan) {
    var result = {
      title: "MISSION BOS MISSION 003 CONNECTIVITY PARITY 012M.4 PLAN VALIDATION",
      dependencyErrors: 0,
      baselineErrors: 0,
      endpointErrors: 0,
      visualErrors: 0,
      mission003Errors: 0,
      expectedCountErrors: 0,
      status: "PASSED",
      errors: []
    };
    if (!plan || !unifiedPlan || !recoveryPlan) {
      add(result, "dependencyErrors", "Connectivity parity or recovery plans are missing.");
      result.status = "FAILED";
      return result;
    }
    if (plan.sourceBuild !== "Mission-BOS-Build-012M.2" || plan.build !== "012M.3") {
      add(result, "baselineErrors", "Unexpected source or target build.");
    }
    if (!same(plan.requiredOperationalEndpoints, ["NET_FIRE_01", "NET_POLICE_01", "NET_STADTWERKE_01"]) ||
        plan.protectedReferenceEndpoint !== "NET_AMBULANCE_01" ||
        !same(plan.priorityEligibleEndpoints, ["NET_FIRE_01", "NET_POLICE_01"]) ||
        !same(plan.priorityForbiddenEndpoints, ["NET_STADTWERKE_01"]) ||
        !same(plan.permanentEndpointIds, ["NET_FIRE_01", "NET_POLICE_01", "NET_AMBULANCE_01", "NET_STADTWERKE_01"])) {
      add(result, "endpointErrors", "Operational endpoint contract is invalid.");
    }
    var visual = plan.visualContract || {};
    ["sameFactoryForAllOperationalVehicles", "samePacketGeometryForAllOperationalVehicles", "updateEveryRenderFrame",
      "depthTest", "handoverUsesConfirmedServingCell", "noMissionSpecificDuplicatePaths", "noStaleObjectsAfterHandover"].forEach(function (key) {
      if (visual[key] !== true) add(result, "visualErrors", "Visual rule must be true: " + key);
    });
    if (visual.depthWrite !== false || Number(visual.packetsPerPath) !== 4 ||
        Number(visual.forwardPackets) !== 2 || Number(visual.reversePackets) !== 2) {
      add(result, "visualErrors", "Packet or depth contract is invalid.");
    }
    var mission = plan.mission003Contract || {};
    if (mission.fireAndPolicePriorityStyleMatchesMission002Reference !== true ||
        mission.utilityStandbyStyleMatchesOperationalStandbyReference !== true ||
        mission.utilityPriorityMustRemainFalse !== true || mission.fireAndPoliceBackhaulToB01Visible !== true ||
        mission.utilityVehicleToCellVisibleWithoutMission !== true ||
        Number(mission.mission003CivilianRendererUtilityPaths) !== 0 ||
        Number(mission.mission003CivilianRendererCivilianPaths) !== 6) {
      add(result, "mission003Errors", "Mission 003 parity contract is invalid.");
    }
    var recoveryPriority = recoveryPlan.mission003Priority || {};
    if ((recoveryPriority.endpointIds || []).join("|") !== "NET_FIRE_01|NET_POLICE_01|NET_STADTWERKE_01" ||
        recoveryPriority.validMissionId !== "MISSION_003" || recoveryPriority.utilityPriorityOutsideMission003 !== false ||
        Number(recoveryPriority.activationThresholdPercent) !== 90 || Number(recoveryPriority.releaseThresholdPercent) !== 85) {
      add(result, "mission003Errors", "Mission-scoped Stadtwerke recovery priority contract is invalid.");
    }
    var acceptance = plan.runtimeAcceptance || {};
    if (Number(acceptance.unifiedManifestEndpoints) !== 4 || Number(acceptance.unifiedManifestPaths) !== 4 ||
        Number(acceptance.unifiedManifestPackets) !== 16 ||
        Number(acceptance.requiredVisiblePacketsPerOperationalPath) !== 4 ||
        Number(acceptance.requiredForwardPacketsPerOperationalPath) !== 2 ||
        Number(acceptance.requiredReversePacketsPerOperationalPath) !== 2 ||
        Number(acceptance.maximumDuplicateOperationalPaths) !== 0 ||
        Number(acceptance.maximumUtilityPriorityPaths) !== 0 ||
        Number(acceptance.fixedServingTowerDefinitions) !== 0) {
      add(result, "expectedCountErrors", "Runtime acceptance counts are invalid.");
    }
    if (!unifiedPlan.expected || Number(unifiedPlan.expected.operationalVehicleEndpoints) !== 4) {
      add(result, "expectedCountErrors", "Unified plan does not expose four operational endpoints.");
    }
    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }

  function validateRuntime(options) {
    options = options || {};
    var result = {
      title: "MISSION BOS MISSION 003 CONNECTIVITY PARITY 012M.4 RUNTIME VALIDATION",
      dependencyErrors: 0,
      manifestErrors: 0,
      associationErrors: 0,
      vehiclePathErrors: 0,
      utilityPriorityErrors: 0,
      civilianOwnershipErrors: 0,
      backhaulErrors: 0,
      missionContractErrors: 0,
      status: "PASSED",
      errors: []
    };
    var unified = options.unifiedRuntime;
    var association = options.associationRuntime;
    var mission003Connectivity = options.mission003ConnectivityRuntime;
    var backhaul = options.backhaulRuntime;
    var mission003 = options.mission003Runtime;
    if (!unified || !association || !mission003Connectivity || !backhaul || !mission003) {
      add(result, "dependencyErrors", "Required runtime dependency is missing.");
      result.status = "FAILED";
      return result;
    }
    var manifest = unified.getManifest && unified.getManifest();
    var safety = unified.getSafetyStatus && unified.getSafetyStatus();
    if (!manifest || manifest.status !== "PASSED" || Number(manifest.endpoints) !== 4 ||
        Number(manifest.vehiclePaths) !== 4 || Number(manifest.totalVehiclePackets) !== 16 ||
        !safety || safety.status !== "PASSED") {
      add(result, "manifestErrors", "Unified operational runtime manifest or safety is invalid.");
    }
    ["NET_FIRE_01", "NET_POLICE_01", "NET_AMBULANCE_01", "NET_STADTWERKE_01"].forEach(function (endpointId) {
      var associationSnapshot = association.getAssociation && association.getAssociation(endpointId);
      if (!associationSnapshot || associationSnapshot.active !== true || !associationSnapshot.servingTowerId) {
        add(result, "associationErrors", "Permanent association unavailable: " + endpointId);
      }
      var snapshot = unified.getEndpointSnapshot && unified.getEndpointSnapshot(endpointId);
      if (!snapshot || snapshot.visible !== true || !snapshot.servingTowerId ||
          Number(snapshot.visiblePackets) !== 4 || Number(snapshot.forwardPackets) !== 2 ||
          Number(snapshot.reversePackets) !== 2) {
        add(result, "vehiclePathErrors", "Operational path is unavailable or incomplete: " + endpointId);
      }
      if (endpointId === "NET_STADTWERKE_01" && snapshot) {
        var missionState = mission003.getState && mission003.getState();
        var validPriorityState = ["ON_SCENE", "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "WATER_ISOLATED", "REPAIRING", "COMPLETED", "RETURNING"].indexOf(missionState) >= 0;
        if (snapshot.priorityActive === true && !validPriorityState) {
          add(result, "utilityPriorityErrors", "Stadtwerke mission-scoped priority leaked outside Mission 003.");
        }
      }
    });
    var mission003ConnectivityManifest = mission003Connectivity.getManifest && mission003Connectivity.getManifest();
    var actual = mission003ConnectivityManifest && mission003ConnectivityManifest.actual;
    if (!mission003ConnectivityManifest || mission003ConnectivityManifest.status !== "PASSED" ||
        Number((actual || {}).utilityLines) !== 0 || Number((actual || {}).civilianLines) !== 6 ||
        Number((actual || {}).totalLines) !== 6) {
      add(result, "civilianOwnershipErrors", "Mission 003 civilian renderer still owns a utility path or has invalid counts.");
    }
    var backhaulManifest = backhaul.getManifest && backhaul.getManifest();
    var backhaulSafety = backhaul.getSafetyStatus && backhaul.getSafetyStatus();
    var backhaulPaths = backhaul.getRuntimeSnapshot && backhaul.getRuntimeSnapshot();
    if (!backhaulManifest || backhaulManifest.status !== "PASSED" || !backhaulSafety || backhaulSafety.status !== "PASSED") {
      add(result, "backhaulErrors", "B01/G02 backhaul runtime is unavailable or unsafe.");
    }
    if (!Array.isArray(backhaulPaths)) {
      add(result, "backhaulErrors", "Backhaul runtime snapshot is unavailable.");
    } else {
      ["NET_FIRE_01", "NET_POLICE_01"].forEach(function (endpointId) {
        var covered = backhaulPaths.some(function (path) {
          return path && path.buildingId === "B01" && Array.isArray(path.endpointIds) &&
            path.endpointIds.indexOf(endpointId) >= 0;
        });
        if (!covered) add(result, "backhaulErrors", "B01 backhaul does not cover: " + endpointId);
      });
      var ambulanceCovered = backhaulPaths.some(function (path) {
        return path && path.buildingId === "G02" && Array.isArray(path.endpointIds) &&
          path.endpointIds.indexOf("NET_AMBULANCE_01") >= 0;
      });
      if (!ambulanceCovered) add(result, "backhaulErrors", "G02 backhaul does not cover NET_AMBULANCE_01.");
      var utilityBackhaul = backhaulPaths.some(function (path) {
        return path && Array.isArray(path.endpointIds) && path.endpointIds.indexOf("NET_STADTWERKE_01") >= 0;
      });
      if (utilityBackhaul) add(result, "backhaulErrors", "Unexpected Stadtwerke backhaul path detected.");
    }
    var bosIds = mission003.getBosEndpointIds && mission003.getBosEndpointIds();
    if (!same(bosIds, ["NET_FIRE_01", "NET_POLICE_01", "NET_STADTWERKE_01"])) {
      add(result, "missionContractErrors", "Mission 003 active priority endpoint contract is incomplete.");
    }
    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }

  function logResult(result) {
    result = result || { title: "MISSION BOS MISSION 003 CONNECTIVITY PARITY VALIDATION", status: "FAILED", errors: ["No result."] };
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    Object.keys(result).filter(function (key) { return /Errors$/.test(key); }).forEach(function (key) {
      console[method](key + ": " + Number(result[key] || 0));
    });
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosMission003ConnectivityParityValidator = {
    validatePlan: validatePlan,
    validateRuntime: validateRuntime,
    logResult: logResult,
    copy: copy
  };
})();
