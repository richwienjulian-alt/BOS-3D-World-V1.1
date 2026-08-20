/* Mission BOS - Build 008R.12
   Non-mutating release-plan and runtime audit.
   No modules. No fetch. No state changes.
*/
(function () {
  "use strict";

  function addError(errors, category, id, detail) {
    errors.push({ category: category, id: id || "", detail: detail || null });
  }

  function arrayLength(value) {
    return Array.isArray(value) ? value.length : -1;
  }

  function sameArray(actual, expected) {
    if (!Array.isArray(actual) || !Array.isArray(expected) || actual.length !== expected.length) return false;
    for (var i = 0; i < expected.length; i += 1) {
      if (actual[i] !== expected[i]) return false;
    }
    return true;
  }

  function objectStatus(value) {
    if (!value) return "MISSING";
    if (typeof value.status === "string") return value.status;
    if (typeof value.getSafetyStatus === "function") {
      var safety = value.getSafetyStatus();
      return safety && safety.status ? safety.status : "MISSING";
    }
    if (typeof value.getManifest === "function") {
      var manifest = value.getManifest();
      return manifest && manifest.status ? manifest.status : "MISSING";
    }
    return "MISSING";
  }

  function validate(options) {
    options = options || {};
    var plan = options.plan;
    var sources = options.sources || {};
    var config = options.config || {};
    var documentRef = options.documentRef || (typeof document !== "undefined" ? document : null);
    var runtimeChecks = options.runtimeChecks || {};
    var errors = [];
    var counts = {
      sourceDependencyErrors: 0,
      sourcePhaseErrors: 0,
      releasePolicyErrors: 0,
      sourceCountErrors: 0,
      missionStateErrors: 0,
      configErrors: 0,
      domErrors: 0,
      hashDeclarationErrors: 0,
      runtimeCheckErrors: 0,
      presenterPolicyErrors: 0,
      expectedCountErrors: 0
    };

    if (!plan) {
      addError(errors, "Source dependency", "MISSION_BOS_RELEASE_PLAN", "Release plan missing.");
      counts.sourceDependencyErrors += 1;
      return createResult(errors, counts, {});
    }

    var requiredSources = [
      "layout", "staticProps", "traffic", "pedestrians", "response", "incident",
      "mission", "missionScene", "communication", "presenter"
    ];
    requiredSources.forEach(function (key) {
      if (!sources[key]) {
        addError(errors, "Source dependency", key, "Frozen source plan missing.");
        counts.sourceDependencyErrors += 1;
      }
    });

    if (plan.buildBase !== "008R.11" || plan.sourcePhase !== "008R.11 Validated Presenter & Demo Control") {
      addError(errors, "Source phase", "buildBase/sourcePhase", {
        buildBase: plan.buildBase,
        sourcePhase: plan.sourcePhase
      });
      counts.sourcePhaseErrors += 1;
    }

    var policy = plan.policy || {};
    var forbiddenTrue = [
      "newFeaturesAllowed", "cityGeometryChangesAllowed", "staticPropChangesAllowed", "trafficChangesAllowed",
      "pedestrianChangesAllowed", "responseVehicleChangesAllowed", "incidentAccessChangesAllowed",
      "missionLogicChangesAllowed", "networkPolicyChangesAllowed", "communicationExperienceChangesAllowed",
      "presenterBehaviorChangesAllowed", "automaticCameraTakeoverAllowed", "automaticMissionStartAllowed",
      "automaticBOSActivationAllowed", "automaticMissionFinishAllowed", "hardResetDuringActiveMissionAllowed",
      "releaseAuditMayMutateRuntime"
    ];
    forbiddenTrue.forEach(function (key) {
      if (policy[key] !== false) {
        addError(errors, "Release policy", key, policy[key]);
        counts.releasePolicyErrors += 1;
      }
    });
    if (policy.fileProtocolRequired !== true || policy.externalRuntimeDependency !== "Three.js CDN only") {
      addError(errors, "Release policy", "portability", policy);
      counts.releasePolicyErrors += 1;
    }

    var expected = plan.expectedCounts || {};
    var actualCounts = {};
    if (sources.layout) {
      actualCounts.districts = arrayLength(sources.layout.districts);
      actualCounts.roadCorridors = arrayLength(sources.layout.noBuildCorridors);
      actualCounts.roadSurfaces = arrayLength(sources.layout.roadSurfaces);
      actualCounts.buildings = arrayLength(sources.layout.buildings);
      actualCounts.mobileTowers = arrayLength(sources.layout.mobileTowers);
      actualCounts.technologyPlots = arrayLength(sources.layout.technologyPlots);
      actualCounts.greenAreas = arrayLength(sources.layout.greenAreas);
      actualCounts.parkingAreas = arrayLength(sources.layout.parkingAreas);
      actualCounts.pavedAreas = arrayLength(sources.layout.pavedAreas);
    }
    function copyExpected(source, mapping) {
      var countsObject = source && source.expectedCounts;
      Object.keys(mapping).forEach(function (targetKey) {
        actualCounts[targetKey] = countsObject ? Number(countsObject[mapping[targetKey]]) : -1;
      });
    }
    copyExpected(sources.staticProps, {
      staticProps: "totalProps", trees: "tree", shrubs: "shrub", benches: "bench", lamps: "lamp",
      directionSigns: "sign", bollards: "bollard", buildingSigns: "buildingSigns"
    });
    copyExpected(sources.traffic, {
      civilianRoutes: "routes", civilianVehicles: "vehicles", civilianCars: "cars", civilianVans: "vans", civilianWheels: "wheels"
    });
    copyExpected(sources.pedestrians, { pedestrianRoutes: "routes", civilianPedestrians: "pedestrians" });
    copyExpected(sources.response, {
      responseRoutes: "routes", responseVehicles: "vehicles", fireTrucks: "fireTrucks", policeCars: "policeCars",
      responseWheels: "wheels", lightbars: "lightbars", ladders: "ladders"
    });
    copyExpected(sources.incident, {
      controlledTrafficConflicts: "controlledCivilTrafficConflicts", yieldRequests: "yieldRequests", incidentBuildings: "incidentBuildings"
    });
    copyExpected(sources.mission, {
      missionStates: "states", smokePuffs: "smokePuffs", flames: "flames", windowGlows: "windowGlows",
      automaticBOSActivations: "automaticBOSActivations"
    });
    copyExpected(sources.missionScene, {
      incidentActors: "actors", firefighters: "firefighters", policeOfficers: "policeOfficers", spectators: "spectators",
      smartphones: "phones", barriers: "barriers", cones: "cones", hoseLines: "hoseLines"
    });
    copyExpected(sources.communication, {
      communicationEndpoints: "endpoints", bosLinks: "bosLinks", civilianLinks: "civilianLinks", bosPackets: "bosPackets",
      civilianPackets: "civilianPackets", statePresentations: "statePresentations", productPerformanceClaims: "productPerformanceClaims"
    });
    copyExpected(sources.presenter, {
      cameraBookmarks: "cameraBookmarks", presenterStateHints: "stateHints", presenterActionableStates: "actionableStates",
      automaticCameraTransitions: "automaticCameraTransitions", automaticMissionActions: "automaticMissionActions"
    });

    Object.keys(expected).forEach(function (key) {
      if (Number(actualCounts[key]) !== Number(expected[key])) {
        addError(errors, "Source count", key, { expected: expected[key], actual: actualCounts[key] });
        counts.sourceCountErrors += 1;
      }
    });

    if (!sources.mission || !sameArray(sources.mission.stateOrder, plan.requiredMissionStates || [])) {
      addError(errors, "Mission states", "stateOrder", sources.mission ? sources.mission.stateOrder : null);
      counts.missionStateErrors += 1;
    }

    var requiredConfig = plan.requiredConfig || {};
    Object.keys(requiredConfig).forEach(function (key) {
      if (config[key] !== requiredConfig[key]) {
        addError(errors, "Config", key, { expected: requiredConfig[key], actual: config[key] });
        counts.configErrors += 1;
      }
    });

    (plan.requiredDomIds || []).forEach(function (id) {
      if (!documentRef || typeof documentRef.getElementById !== "function" || !documentRef.getElementById(id)) {
        addError(errors, "DOM", id, "Required element missing.");
        counts.domErrors += 1;
      }
    });

    var hashPattern = /^[0-9a-f]{64}$/;
    var frozenSourceFiles = plan.frozenSourceFiles || {};
    Object.keys(frozenSourceFiles).forEach(function (fileName) {
      if (!hashPattern.test(String(frozenSourceFiles[fileName] || ""))) {
        addError(errors, "Hash declaration", fileName, frozenSourceFiles[fileName]);
        counts.hashDeclarationErrors += 1;
      }
    });
    if (Object.keys(frozenSourceFiles).length < 30) {
      addError(errors, "Hash declaration", "frozenSourceFiles", "Too few frozen files declared.");
      counts.hashDeclarationErrors += 1;
    }

    (plan.requiredRuntimeChecks || []).forEach(function (id) {
      var status = objectStatus(runtimeChecks[id]);
      if (status !== "PASSED") {
        addError(errors, "Runtime check", id, status);
        counts.runtimeCheckErrors += 1;
      }
    });

    [
      "unifiedBosConnectivityValidation",
      "mission003ConnectivityParityPlanValidation",
      "mission003ConnectivityParityRuntimeValidation",
      "stadtwerkeBeaconPolishValidation",
      "unifiedBosConnectivityManifest",
      "unifiedBosConnectivitySafety",
      "bosBackhaulManifest",
      "bosBackhaulSafety"
    ].forEach(function (id) {
      if (!Object.prototype.hasOwnProperty.call(runtimeChecks, id)) return;
      var status = objectStatus(runtimeChecks[id]);
      if (status !== "PASSED") {
        addError(errors, "Runtime check", id, status);
        counts.runtimeCheckErrors += 1;
      }
    });

    [
      ["unifiedFireSnapshot", "NET_FIRE_01"],
      ["unifiedPoliceSnapshot", "NET_POLICE_01"],
      ["unifiedAmbulanceSnapshot", "NET_AMBULANCE_01"],
      ["unifiedStadtwerkeSnapshot", "NET_STADTWERKE_01"]
    ].forEach(function (entry) {
      if (!Object.prototype.hasOwnProperty.call(runtimeChecks, entry[0])) return;
      var snapshot = runtimeChecks[entry[0]];
      if (!snapshot || snapshot.endpointId !== entry[1] || Number(snapshot.visiblePackets) !== 4 ||
          Number(snapshot.forwardPackets) !== 2 || Number(snapshot.reversePackets) !== 2 ||
          (entry[1] === "NET_STADTWERKE_01" && snapshot.priorityActive === true)) {
        addError(errors, "Runtime check", entry[0], snapshot || "MISSING");
        counts.runtimeCheckErrors += 1;
      }
    });

    var presenterSafety = runtimeChecks.presenterRuntimeSafety;
    if (presenterSafety) {
      if (Number(presenterSafety.automaticCameraTransitions || 0) !== 0 ||
          Number(presenterSafety.automaticMissionActions || 0) !== 0 ||
          Number(presenterSafety.unauthorizedActionAttempts || 0) !== 0) {
        addError(errors, "Presenter policy", "runtimeCounters", presenterSafety);
        counts.presenterPolicyErrors += 1;
      }
    }

    if (Object.keys(expected).length < 40) {
      addError(errors, "Expected count", "expectedCounts", "Release manifest is incomplete.");
      counts.expectedCountErrors += 1;
    }

    return createResult(errors, counts, actualCounts);
  }

  function createResult(errors, counts, actualCounts) {
    return {
      title: "MISSION BOS BUILD 008R.12 RELEASE AUDIT",
      status: errors.length === 0 ? "PASSED" : "FAILED",
      errors: errors,
      counts: counts,
      actualCounts: actualCounts
    };
  }

  function logResult(result) {
    var method = result && result.status === "PASSED" ? "log" : "error";
    console.group(result ? result.title : "MISSION BOS BUILD 008R.12 RELEASE AUDIT");
    if (!result) {
      console.error("Release audit result missing.");
      console.groupEnd();
      return;
    }
    Object.keys(result.counts || {}).forEach(function (key) {
      console[method](key + ": " + result.counts[key]);
    });
    (result.errors || []).forEach(function (error) {
      console.error(error.category + " · " + error.id, error.detail);
    });
    console[method]("STATUS: " + result.status);
    console.groupEnd();
  }

  window.MissionBosReleaseValidator = {
    validate: validate,
    logResult: logResult
  };
})();
