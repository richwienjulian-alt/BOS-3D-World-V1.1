/* Mission BOS - Build 011N.1
   Civilian connectivity coordinator for all visible civilian participants.
   Associations are read exclusively from the shared V3 association runtime.
*/
(function () {
  "use strict";

  var EPSILON = 1e-9;
  var SAFETY_INTERVAL_SECONDS = 0.25;

  function finite(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function sumDemand(definitions) {
    return (definitions || []).reduce(function (sum, definition) {
      return sum + finite(definition.demandUnits, 0);
    }, 0);
  }

  function emptyMap(towerIds) {
    var result = Object.create(null);
    (towerIds || []).forEach(function (towerId) { result[towerId] = 0; });
    return result;
  }

  function emptySafety() {
    return {
      title: "MISSION BOS FULL CIVILIAN CONNECTIVITY RUNTIME SAFETY",
      dependencyErrors: 0,
      endpointResolutionErrors: 0,
      missingServingCellErrors: 0,
      dynamicLoadTotalErrors: 0,
      dynamicContributionErrors: 0,
      duplicateEndpointErrors: 0,
      expectedCountErrors: 0,
      status: "PASSED",
      failed: false,
      errors: []
    };
  }

  function finishSafety(safety) {
    safety.failed = safety.errors.length > 0;
    safety.status = safety.failed ? "FAILED" : "PASSED";
    return safety;
  }

  function logSafety(safety) {
    var method = safety.status === "PASSED" ? "log" : "error";
    console.group(safety.title);
    console[method]("Dependency errors: " + safety.dependencyErrors);
    console[method]("Endpoint resolution errors: " + safety.endpointResolutionErrors);
    console[method]("Missing serving cells: " + safety.missingServingCellErrors);
    console[method]("Dynamic load errors: " + (safety.dynamicLoadTotalErrors + safety.dynamicContributionErrors));
    console[method]("Expected count errors: " + safety.expectedCountErrors);
    console[method]("STATUS: " + safety.status);
    if (safety.errors.length) console.error(safety.errors);
    console.groupEnd();
  }

  function failedRuntime(message) {
    var safety = emptySafety();
    safety.dependencyErrors = 1;
    safety.errors.push(message || "Civilian connectivity initialization failed.");
    finishSafety(safety);
    logSafety(safety);
    return {
      endpointsById: Object.create(null),
      update: function () {},
      getAssociation: function () { return null; },
      getServingTowerId: function () { return null; },
      getAllAssociations: function () { return []; },
      getLastHandover: function () { return null; },
      getHandoverHistory: function () { return []; },
      getDynamicLoadByTowerId: function () { return {}; },
      getEndpointDefinition: function () { return null; },
      reset: function () { return false; },
      dispose: function () {},
      getManifest: function () { return { status: "FAILED", message: message }; },
      getSafetyStatus: function () { return copy(safety); }
    };
  }

  function create(options) {
    options = options || {};
    var layout = options.layout;
    var networkPlan = options.networkRealismPlan || window.MISSION_BOS_NETWORK_REALISM_PLAN;
    var associationRuntime = options.associationRuntime;
    var cellLoadRuntime = options.cellLoadRuntime;
    var legacyValidator = options.validator;
    var legacyPlan = options.plan;
    var trafficPlan = options.trafficPlan;
    var pedestrianPlan = options.pedestrianPlan;
    var associationPlan = options.associationPlan;
    var cellLoadPlan = options.cellLoadPlan;
    var capacityPlan = options.capacityPlan;
    var explorationInterfacePlan = options.explorationInterfacePlan;
    var mission004Plan = options.mission004Plan || window.MISSION_BOS_MISSION_004_PLAN || null;

    if (!layout || !networkPlan || !associationRuntime || !cellLoadRuntime ||
        typeof associationRuntime.getAssociation !== "function" ||
        typeof cellLoadRuntime.setDynamicCivilianContributions !== "function") {
      return failedRuntime("Full civilian connectivity dependencies are missing.");
    }

    var validation = null;
    if (legacyValidator && typeof legacyValidator.validate === "function" && legacyPlan) {
      validation = legacyValidator.validate(
        layout, trafficPlan, pedestrianPlan, associationPlan, cellLoadPlan,
        capacityPlan, explorationInterfacePlan, legacyPlan
      );
      if (typeof legacyValidator.logResult === "function") legacyValidator.logResult(validation);
      if (!validation || validation.status !== "PASSED") return failedRuntime("Legacy civilian connectivity plan validation returned FAILED.");
    }

    var participants = networkPlan.participants || {};
    var alwaysOn = (participants.alwaysOnCivilian || []).map(copy);
    var mission001 = (participants.mission001Civilian || []).map(copy);
    var arena = (participants.arenaCivilian || []).map(copy);
    var utility = (participants.utility || []).map(copy);
    var mission003 = (participants.mission003Civilian || []).map(copy);
    var mission004 = (participants.mission004Civilian || []).map(copy);
    var civilianDefinitions = [].concat(alwaysOn, mission001, arena, utility, mission003, mission004);
    var endpointsById = Object.create(null);
    var duplicateCount = 0;
    civilianDefinitions.forEach(function (definition) {
      if (endpointsById[definition.id]) duplicateCount += 1;
      endpointsById[definition.id] = definition;
    });

    var towerIds = (layout.mobileTowers || []).map(function (tower) { return tower.id; });
    var expected = networkPlan.expectedCounts || {};
    var actual = {
      towers: towerIds.length,
      civilianEndpoints: civilianDefinitions.length,
      alwaysOnCivilianEndpoints: alwaysOn.length,
      mission001CivilianEndpoints: mission001.length,
      arenaCivilianEndpoints: arena.length,
      utilityEndpoints: utility.length,
      mission003CivilianEndpoints: mission003.length,
      mission004CivilianEndpoints: mission004.length,
      alwaysOnDemandUnits: sumDemand(alwaysOn),
      mission001DemandUnits: sumDemand(mission001),
      arenaDemandUnits: sumDemand(arena),
      utilityDemandUnits: sumDemand(utility),
      mission003DemandUnits: sumDemand(mission003),
      mission004DemandUnits: sumDemand(mission004),
      duplicateEndpoints: duplicateCount
    };
    var demand = participants.demandAccounting || {};
    var manifestPassed = actual.towers === 5 &&
      actual.civilianEndpoints === finite(expected.allCivilianEndpoints, 31) &&
      actual.alwaysOnCivilianEndpoints === finite(expected.alwaysOnCivilianEndpoints, 13) &&
      actual.mission001CivilianEndpoints === finite(expected.mission001CivilianEndpoints, 6) &&
      actual.arenaCivilianEndpoints === finite(expected.arenaCivilianEndpoints, 12) &&
      actual.utilityEndpoints === finite(expected.utilityEndpoints, 0) &&
      actual.mission003CivilianEndpoints === finite(expected.mission003CivilianEndpoints, 0) &&
      actual.mission004CivilianEndpoints === finite(expected.mission004CivilianEndpoints, 0) &&
      Math.abs(actual.alwaysOnDemandUnits - finite(demand.alwaysOnTotalUnits, 6)) <= EPSILON &&
      Math.abs(actual.mission001DemandUnits - finite(demand.mission001VisibleTotalUnits, 6)) <= EPSILON &&
      Math.abs(actual.arenaDemandUnits - finite(demand.arenaVisibleTotalUnits, 8)) <= EPSILON &&
      Math.abs(actual.utilityDemandUnits - finite(demand.utilityAlwaysOnUnits, 0)) <= EPSILON &&
      Math.abs(actual.mission003DemandUnits - finite(demand.mission003VisibleTotalUnits, 0)) <= EPSILON &&
      Math.abs(actual.mission004DemandUnits - finite(demand.mission004VisibleTotalUnits, 0)) <= EPSILON &&
      duplicateCount === 0;
    var manifest = {
      title: "MISSION BOS FULL CIVILIAN CONNECTIVITY RUNTIME MANIFEST",
      actual: actual,
      expected: copy(expected),
      status: manifestPassed ? "PASSED" : "FAILED"
    };
    console.group(manifest.title);
    console[manifest.status === "PASSED" ? "log" : "error"]("Civilian endpoints: " + actual.civilianEndpoints + " / " + finite(expected.allCivilianEndpoints, 31));
    console[manifest.status === "PASSED" ? "log" : "error"]("Always-on demand: " + actual.alwaysOnDemandUnits + " / " + finite(demand.alwaysOnTotalUnits, 6));
    console[manifest.status === "PASSED" ? "log" : "error"]("Mission 001 visible demand: " + actual.mission001DemandUnits + " / " + finite(demand.mission001VisibleTotalUnits, 6));
    console[manifest.status === "PASSED" ? "log" : "error"]("Arena visible demand: " + actual.arenaDemandUnits + " / " + finite(demand.arenaVisibleTotalUnits, 8));
    console[manifest.status === "PASSED" ? "log" : "error"]("STATUS: " + manifest.status);
    console.groupEnd();

    var safety = emptySafety();
    if (!manifestPassed) {
      safety.expectedCountErrors = 1;
      safety.errors.push("Civilian endpoint manifest mismatch.");
    }
    if (duplicateCount) {
      safety.duplicateEndpointErrors = duplicateCount;
      safety.errors.push("Duplicate civilian endpoint IDs detected.");
    }
    finishSafety(safety);

    var disposed = false;
    var safetyAccumulator = 0;
    var currentContext = { missionState: "READY", activeMissionId: null };
    var alwaysOnLoad = emptyMap(towerIds);
    var mission001Load = emptyMap(towerIds);
    var utilityLoad = emptyMap(towerIds);
    var mission003Load = emptyMap(towerIds);
    var mission004Load = emptyMap(towerIds);
    var lastHandoverIndex = 0;

    function association(definition) {
      return associationRuntime.getAssociation(definition.id);
    }

    function contributionMap(definitions, active) {
      var map = emptyMap(towerIds);
      if (!active) return map;
      definitions.forEach(function (definition) {
        var current = association(definition);
        if (!current || !current.active || !current.servingTowerId || !Object.prototype.hasOwnProperty.call(map, current.servingTowerId)) return;
        map[current.servingTowerId] += finite(definition.demandUnits, 0);
      });
      return map;
    }

    function mapTotal(map) {
      return Object.keys(map || {}).reduce(function (sum, key) { return sum + finite(map[key], 0); }, 0);
    }

    function applyDynamicLoads() {
      alwaysOnLoad = contributionMap(alwaysOn, true);
      var mission001Active = currentContext.activeMissionId === "MISSION_001" &&
        ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"].indexOf(currentContext.missionState) >= 0;
      mission001Load = contributionMap(mission001, mission001Active);
      utilityLoad = contributionMap(utility, true);
      var mission003States = ["CALL_RECEIVED", "ALARMING", "CLEARING_CORRIDOR", "ENROUTE", "ON_SCENE", "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "WATER_ISOLATED", "REPAIRING", "COMPLETED"];
      var mission003Active = currentContext.activeMissionId === "MISSION_003" && mission003States.indexOf(currentContext.missionState) >= 0;
      mission003Load = contributionMap(mission003, mission003Active);
      var mission004States = mission004Plan && mission004Plan.scene && mission004Plan.scene.bystandersVisibleStates
        ? mission004Plan.scene.bystandersVisibleStates : [];
      var mission004Active = currentContext.activeMissionId === "MISSION_004" && mission004States.indexOf(currentContext.missionState) >= 0;
      mission004Load = contributionMap(mission004, mission004Active);
      var okAlways = cellLoadRuntime.setDynamicCivilianContributions("REPRESENTATIVE_CIVILIAN_ENDPOINTS", alwaysOnLoad);
      var okMission = cellLoadRuntime.setDynamicCivilianContributions("MISSION_001_VISIBLE_ENDPOINTS", mission001Active ? mission001Load : {});
      var okUtility = cellLoadRuntime.setDynamicCivilianContributions("STADTWERKE_UTILITY_ENDPOINT", utilityLoad);
      var okMission003 = cellLoadRuntime.setDynamicCivilianContributions("MISSION_003_VISIBLE_ENDPOINTS", mission003Active ? mission003Load : {});
      var mission004SourceId = mission004Plan && mission004Plan.network && mission004Plan.network.dynamicLoadSourceId
        ? mission004Plan.network.dynamicLoadSourceId : "MISSION_004_VISIBLE_ENDPOINTS";
      var okMission004 = cellLoadRuntime.setDynamicCivilianContributions(mission004SourceId, mission004Active ? mission004Load : {});
      if (!okAlways || !okMission || !okUtility || !okMission003 || !okMission004) {
        safety.dynamicContributionErrors += 1;
        safety.errors.push("Cell-load runtime rejected civilian demand contributions.");
        finishSafety(safety);
      }
    }

    function runSafety(initial) {
      var next = emptySafety();
      var associationSafety = associationRuntime.getSafetyStatus && associationRuntime.getSafetyStatus();
      var loadSafety = cellLoadRuntime.getSafetyStatus && cellLoadRuntime.getSafetyStatus();
      if (!associationSafety || associationSafety.status !== "PASSED" || !loadSafety || loadSafety.status !== "PASSED") {
        next.dependencyErrors += 1;
        next.errors.push("Association or cell-load dependency is unsafe.");
      }
      if (civilianDefinitions.length !== finite(expected.allCivilianEndpoints, 31)) {
        next.expectedCountErrors += 1;
        next.errors.push("Civilian endpoint count changed.");
      }
      civilianDefinitions.forEach(function (definition) {
        var current = association(definition);
        var expectedActive = definition.activeMode === "always" ||
          (definition.activeMode === "mission-001-scene" && currentContext.activeMissionId === "MISSION_001" &&
            ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"].indexOf(currentContext.missionState) >= 0) ||
          (definition.activeMode === "arena-event" && currentContext.activeMissionId === "MISSION_002" && currentContext.missionState !== "READY" && currentContext.missionState !== "FAILED") ||
          (definition.activeMode === "mission-003-scene" && currentContext.activeMissionId === "MISSION_003" && ["CALL_RECEIVED", "ALARMING", "CLEARING_CORRIDOR", "ENROUTE", "ON_SCENE", "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "WATER_ISOLATED", "REPAIRING", "COMPLETED"].indexOf(currentContext.missionState) >= 0) ||
          (definition.activeMode === "mission-004-scene" && currentContext.activeMissionId === "MISSION_004" && mission004Plan && mission004Plan.scene && (mission004Plan.scene.bystandersVisibleStates || []).indexOf(currentContext.missionState) >= 0);
        if (expectedActive && (!current || !current.active)) {
          next.endpointResolutionErrors += 1;
          next.errors.push("Expected active civilian endpoint is unresolved: " + definition.id);
        } else if (expectedActive && !current.servingTowerId) {
          next.missingServingCellErrors += 1;
          next.errors.push("Expected active civilian endpoint has no serving cell: " + definition.id);
        }
      });
      if (Math.abs(mapTotal(alwaysOnLoad) - finite(demand.alwaysOnTotalUnits, 6)) > EPSILON) {
        next.dynamicLoadTotalErrors += 1;
        next.errors.push("Always-on dynamic demand does not total six units.");
      }
      var missionActive = currentContext.activeMissionId === "MISSION_001" &&
        ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"].indexOf(currentContext.missionState) >= 0;
      if (missionActive && Math.abs(mapTotal(mission001Load) - finite(demand.mission001VisibleTotalUnits, 6)) > EPSILON) {
        next.dynamicLoadTotalErrors += 1;
        next.errors.push("Mission 001 visible demand does not total six units.");
      }
      if (Math.abs(mapTotal(utilityLoad) - finite(demand.utilityAlwaysOnUnits, 0)) > EPSILON) {
        next.dynamicLoadTotalErrors += 1;
        next.errors.push("Utility dynamic demand does not match its frozen total.");
      }
      var mission003Active = currentContext.activeMissionId === "MISSION_003" && ["CALL_RECEIVED", "ALARMING", "CLEARING_CORRIDOR", "ENROUTE", "ON_SCENE", "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "WATER_ISOLATED", "REPAIRING", "COMPLETED"].indexOf(currentContext.missionState) >= 0;
      if (mission003Active && Math.abs(mapTotal(mission003Load) - finite(demand.mission003VisibleTotalUnits, 0)) > EPSILON) {
        next.dynamicLoadTotalErrors += 1;
        next.errors.push("Mission 003 visible demand does not match its frozen total.");
      }
      var mission004States = mission004Plan && mission004Plan.scene ? (mission004Plan.scene.bystandersVisibleStates || []) : [];
      var mission004Active = currentContext.activeMissionId === "MISSION_004" && mission004States.indexOf(currentContext.missionState) >= 0;
      if (mission004Active && Math.abs(mapTotal(mission004Load) - finite(demand.mission004VisibleTotalUnits, 0)) > EPSILON) {
        next.dynamicLoadTotalErrors += 1;
        next.errors.push("Mission 004 visible demand does not match its frozen total.");
      }
      safety = finishSafety(next);
      if (initial || safety.failed) logSafety(safety);
    }

    function update(delta, elapsed, runtimeState) {
      if (disposed || safety.failed) return;
      runtimeState = runtimeState || {};
      currentContext = {
        missionState: String(runtimeState.missionState || "READY"),
        activeMissionId: runtimeState.activeMissionId || null
      };
      applyDynamicLoads();
      safetyAccumulator += Math.max(0, Math.min(finite(delta, 0), 0.25));
      if (safetyAccumulator >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafety(false);
      }
    }

    function reset() {
      if (disposed) return false;
      currentContext = { missionState: "READY", activeMissionId: null };
      safetyAccumulator = 0;
      alwaysOnLoad = emptyMap(towerIds);
      mission001Load = emptyMap(towerIds);
      utilityLoad = emptyMap(towerIds);
      mission003Load = emptyMap(towerIds);
      mission004Load = emptyMap(towerIds);
      cellLoadRuntime.setDynamicCivilianContributions("MISSION_001_VISIBLE_ENDPOINTS", {});
      cellLoadRuntime.setDynamicCivilianContributions("MISSION_003_VISIBLE_ENDPOINTS", {});
      cellLoadRuntime.setDynamicCivilianContributions(mission004Plan && mission004Plan.network && mission004Plan.network.dynamicLoadSourceId ? mission004Plan.network.dynamicLoadSourceId : "MISSION_004_VISIBLE_ENDPOINTS", {});
      applyDynamicLoads();
      runSafety(false);
      return safety.status === "PASSED";
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      cellLoadRuntime.setDynamicCivilianContributions("MISSION_001_VISIBLE_ENDPOINTS", {});
      cellLoadRuntime.setDynamicCivilianContributions("MISSION_003_VISIBLE_ENDPOINTS", {});
      cellLoadRuntime.setDynamicCivilianContributions(mission004Plan && mission004Plan.network && mission004Plan.network.dynamicLoadSourceId ? mission004Plan.network.dynamicLoadSourceId : "MISSION_004_VISIBLE_ENDPOINTS", {});
    }

    applyDynamicLoads();
    runSafety(true);

    return {
      validation: validation,
      endpointsById: endpointsById,
      update: update,
      getAssociation: function (endpointId) {
        return endpointsById[endpointId] ? associationRuntime.getAssociation(endpointId) : null;
      },
      getServingTowerId: function (endpointId) {
        var current = endpointsById[endpointId] ? associationRuntime.getAssociation(endpointId) : null;
        return current && current.active ? current.servingTowerId : null;
      },
      getAllAssociations: function () {
        return civilianDefinitions.map(function (definition) { return associationRuntime.getAssociation(definition.id); });
      },
      getLastHandover: function () {
        var events = associationRuntime.getHandoverHistory ? associationRuntime.getHandoverHistory() : [];
        for (var i = events.length - 1; i >= 0; i -= 1) if (endpointsById[events[i].endpointId]) return copy(events[i]);
        return null;
      },
      getHandoverHistory: function () {
        return (associationRuntime.getHandoverHistory ? associationRuntime.getHandoverHistory() : []).filter(function (event) {
          return !!endpointsById[event.endpointId];
        }).map(copy);
      },
      getDynamicLoadByTowerId: function () {
        var combined = emptyMap(towerIds);
        towerIds.forEach(function (towerId) { combined[towerId] = finite(alwaysOnLoad[towerId], 0) + finite(mission001Load[towerId], 0) + finite(utilityLoad[towerId], 0) + finite(mission003Load[towerId], 0) + finite(mission004Load[towerId], 0); });
        return copy(combined);
      },
      getEndpointDefinition: function (endpointId) { return endpointsById[endpointId] ? copy(endpointsById[endpointId]) : null; },
      reset: reset,
      dispose: dispose,
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); }
    };
  }

  window.MissionBosCivilianConnectivityController = { create: create };
})();
