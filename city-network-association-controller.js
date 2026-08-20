/* Mission BOS - Build 011N.2
   Shared deterministic association and handover runtime for every visible
   network endpoint. Live render anchors refresh every frame while radio
   decisions remain on SIMPLIFIED_RADIO_HANDOVER_V3's 0.25-second cadence.
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

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      var item = items[i];
      if (item && (item.id === id || item.referenceId === id || item.towerId === id)) return item;
    }
    return null;
  }

  function isFinitePosition(position) {
    return !!position && isFinite(Number(position.x)) && isFinite(Number(position.y || 0)) && isFinite(Number(position.z));
  }

  function flattenDefinitions(networkPlan, legacyPlan) {
    if (networkPlan && networkPlan.participants) {
      return [].concat(
        networkPlan.participants.bos || [],
        networkPlan.participants.alwaysOnCivilian || [],
        networkPlan.participants.mission001Civilian || [],
        networkPlan.participants.arenaCivilian || [],
        networkPlan.participants.utility || [],
        networkPlan.participants.mission003Civilian || [],
        networkPlan.participants.mission004Civilian || []
      ).map(function (definition) { return copy(definition); });
    }
    return (legacyPlan.mobileEndpoints || []).map(function (definition) { return copy(definition); });
  }

  function countKinds(definitions) {
    var actual = {
      towers: 5,
      mobileEndpoints: definitions.length,
      responseVehicleEndpoints: 0,
      missionPhoneEndpoints: 0,
      bosEndpoints: 0,
      civilianEndpoints: 0,
      alwaysOnCivilianEndpoints: 0,
      mission001CivilianEndpoints: 0,
      arenaCivilianEndpoints: 0,
      utilityEndpoints: 0,
      mission003CivilianEndpoints: 0,
      mission004CivilianEndpoints: 0,
      nonBosEndpoints: 0,
      fixedServingTowerDefinitions: 0
    };
    definitions.forEach(function (definition) {
      if (definition.channel === "BOS") actual.bosEndpoints += 1;
      else { actual.civilianEndpoints += 1; actual.nonBosEndpoints += 1; }
      if (definition.kind === "response-vehicle" || definition.kind === "ambulance") actual.responseVehicleEndpoints += 1;
      if (definition.kind === "mission-phone") actual.missionPhoneEndpoints += 1;
      if (definition.channel === "CIVILIAN" && definition.activeMode === "always") actual.alwaysOnCivilianEndpoints += 1;
      if (definition.channel !== "BOS" && definition.activeMode === "mission-001-scene") actual.mission001CivilianEndpoints += 1;
      if (definition.channel !== "BOS" && definition.activeMode === "arena-event") actual.arenaCivilianEndpoints += 1;
      if (definition.channel === "UTILITY" || definition.kind === "utility-vehicle") actual.utilityEndpoints += 1;
      if (definition.channel !== "BOS" && definition.activeMode === "mission-003-scene") actual.mission003CivilianEndpoints += 1;
      if (definition.channel !== "BOS" && definition.activeMode === "mission-004-scene") actual.mission004CivilianEndpoints += 1;
      if (Object.prototype.hasOwnProperty.call(definition, "servingTowerId") ||
          Object.prototype.hasOwnProperty.call(definition, "towerId") ||
          Object.prototype.hasOwnProperty.call(definition, "fixedTowerId")) {
        actual.fixedServingTowerDefinitions += 1;
      }
    });
    return actual;
  }

  function createManifest(definitions, towerCount, networkPlan, legacyPlan) {
    var actual = countKinds(definitions);
    actual.towers = towerCount;
    var expected = networkPlan && networkPlan.expectedCounts ? {
      towers: 5,
      mobileEndpoints: finite(networkPlan.expectedCounts.allNetworkEndpoints, 34),
      responseVehicleEndpoints: finite(networkPlan.expectedCounts.bosEndpoints, 3),
      missionPhoneEndpoints: finite(networkPlan.expectedCounts.mission001CivilianEndpoints, 6),
      bosEndpoints: finite(networkPlan.expectedCounts.bosEndpoints, 3),
      civilianEndpoints: finite(networkPlan.expectedCounts.allCivilianEndpoints, 31),
      alwaysOnCivilianEndpoints: finite(networkPlan.expectedCounts.alwaysOnCivilianEndpoints, 13),
      mission001CivilianEndpoints: finite(networkPlan.expectedCounts.mission001CivilianEndpoints, 6),
      arenaCivilianEndpoints: finite(networkPlan.expectedCounts.arenaCivilianEndpoints, 12),
      utilityEndpoints: finite(networkPlan.expectedCounts.utilityEndpoints, 0),
      mission003CivilianEndpoints: finite(networkPlan.expectedCounts.mission003CivilianEndpoints, 0),
      mission004CivilianEndpoints: finite(networkPlan.expectedCounts.mission004CivilianEndpoints, 0),
      nonBosEndpoints: finite(networkPlan.expectedCounts.allNonBosEndpoints, networkPlan.expectedCounts.allCivilianEndpoints || 31),
      fixedServingTowerDefinitions: finite(networkPlan.expectedCounts.fixedServingTowerDefinitions, 0)
    } : {
      towers: finite((legacyPlan.expectedCounts || {}).towers, 0),
      mobileEndpoints: finite((legacyPlan.expectedCounts || {}).mobileEndpoints, 0),
      responseVehicleEndpoints: finite((legacyPlan.expectedCounts || {}).responseVehicleEndpoints, 0),
      missionPhoneEndpoints: finite((legacyPlan.expectedCounts || {}).missionPhoneEndpoints, 0),
      bosEndpoints: 0,
      civilianEndpoints: 0,
      alwaysOnCivilianEndpoints: 0,
      mission001CivilianEndpoints: 0,
      arenaCivilianEndpoints: 0,
      utilityEndpoints: 0,
      mission003CivilianEndpoints: 0,
      mission004CivilianEndpoints: 0,
      nonBosEndpoints: 0,
      fixedServingTowerDefinitions: finite((legacyPlan.expectedCounts || {}).fixedServingTowerDefinitions, 0)
    };
    var keys = networkPlan ? [
      "towers", "mobileEndpoints", "responseVehicleEndpoints", "missionPhoneEndpoints",
      "bosEndpoints", "civilianEndpoints", "alwaysOnCivilianEndpoints",
      "mission001CivilianEndpoints", "arenaCivilianEndpoints", "utilityEndpoints",
      "mission003CivilianEndpoints", "mission004CivilianEndpoints", "nonBosEndpoints", "fixedServingTowerDefinitions"
    ] : ["towers", "mobileEndpoints", "responseVehicleEndpoints", "missionPhoneEndpoints", "fixedServingTowerDefinitions"];
    var passed = keys.every(function (key) { return Number(actual[key]) === Number(expected[key]); });
    return {
      title: "MISSION BOS NETWORK ASSOCIATION V3 RUNTIME MANIFEST",
      selectionModel: String((legacyPlan.selectionModel || {}).id || ""),
      actual: actual,
      expected: expected,
      status: passed ? "PASSED" : "FAILED"
    };
  }

  function logManifest(manifest) {
    var method = manifest.status === "PASSED" ? "log" : "error";
    console.group(manifest.title);
    console[method]("Selection model: " + manifest.selectionModel);
    console[method]("Towers: " + manifest.actual.towers + " / " + manifest.expected.towers);
    console[method]("Network endpoints: " + manifest.actual.mobileEndpoints + " / " + manifest.expected.mobileEndpoints);
    if (manifest.expected.bosEndpoints) console[method]("BOS endpoints: " + manifest.actual.bosEndpoints + " / " + manifest.expected.bosEndpoints);
    if (manifest.expected.civilianEndpoints) console[method]("Civilian endpoints: " + manifest.actual.civilianEndpoints + " / " + manifest.expected.civilianEndpoints);
    console[method]("Fixed serving-tower definitions: " + manifest.actual.fixedServingTowerDefinitions + " / " + manifest.expected.fixedServingTowerDefinitions);
    console[method]("STATUS: " + manifest.status);
    console.groupEnd();
  }

  function emptySafety() {
    return {
      title: "MISSION BOS NETWORK ASSOCIATION V3 RUNTIME SAFETY",
      invalidScoreErrors: 0,
      missingServingCellErrors: 0,
      handoverBeforeTimeToTriggerErrors: 0,
      handoverBeforeDwellErrors: 0,
      pingPongErrors: 0,
      fixedServingTowerErrors: 0,
      candidateStateLeakErrors: 0,
      sourceMutationErrors: 0,
      endpointResolutionErrors: 0,
      expectedCountErrors: 0,
      dependencyErrors: 0,
      status: "PASSED",
      failed: false,
      fatal: false,
      recoverableWarnings: 0,
      warnings: [],
      errors: []
    };
  }

  function finalizeSafety(safety) {
    safety.failed = safety.errors.length > 0;
    safety.fatal = safety.invalidScoreErrors > 0 || safety.fixedServingTowerErrors > 0 ||
      safety.sourceMutationErrors > 0 || safety.expectedCountErrors > 0;
    safety.status = safety.failed ? "FAILED" : "PASSED";
    return safety;
  }

  function logSafety(safety) {
    var method = safety.status === "PASSED" ? "log" : "error";
    console.group(safety.title);
    console[method]("Invalid scores: " + safety.invalidScoreErrors);
    console[method]("Missing serving cells: " + safety.missingServingCellErrors);
    console[method]("TTT violations: " + safety.handoverBeforeTimeToTriggerErrors);
    console[method]("Dwell violations: " + safety.handoverBeforeDwellErrors);
    console[method]("Ping-pong handovers: " + safety.pingPongErrors);
    console[method]("Endpoint resolution warnings: " + safety.endpointResolutionErrors);
    console[method]("Recoverable warnings: " + Number(safety.recoverableWarnings || 0));
    console[method]("Expected count errors: " + safety.expectedCountErrors);
    console[method]("STATUS: " + safety.status);
    if (safety.errors.length) console.error(safety.errors);
    console.groupEnd();
  }

  function createFailedRuntime(message, validation) {
    var safety = emptySafety();
    safety.dependencyErrors = 1;
    safety.errors.push(message || "Network association initialization failed.");
    finalizeSafety(safety);
    logSafety(safety);
    return {
      validation: validation || null,
      towersById: Object.create(null),
      endpointsById: Object.create(null),
      update: function () {},
      getAssociation: function () { return null; },
      getLiveEndpointPosition: function () { return null; },
      getServingTowerId: function () { return null; },
      getServingTower: function () { return null; },
      getAllAssociations: function () { return []; },
      getCandidateState: function () { return null; },
      getAllCandidateStates: function () { return []; },
      getLastHandover: function () { return null; },
      getHandoverHistory: function () { return []; },
      getEndpointDefinition: function () { return null; },
      reset: function () { return false; },
      getManifest: function () { return { status: "FAILED", message: message }; },
      getSafetyStatus: function () { return copy(safety); },
      dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var layout = options.layout;
    var plan = options.plan;
    var networkPlan = options.networkRealismPlan || window.MISSION_BOS_NETWORK_REALISM_PLAN;
    var validator = options.validator;
    var radioModel = options.radioModel || window.MissionBosNetworkRadioModel;
    var responseRuntime = options.responseRuntime;
    var trafficRuntime = options.trafficRuntime;
    var pedestrianRuntime = options.pedestrianRuntime;
    var sceneRuntimeProvider = typeof options.sceneRuntimeProvider === "function"
      ? options.sceneRuntimeProvider
      : function () { return options.sceneRuntime || null; };
    var scenePlan = options.scenePlan || window.MISSION_BOS_MISSION_001_SCENE_PLAN;
    var arenaRuntimeProvider = typeof options.arenaRuntimeProvider === "function"
      ? options.arenaRuntimeProvider
      : function () { return options.arenaRuntime || null; };
    var ambulanceRuntime = options.ambulanceRuntime || null;
    var stadtwerkeRuntime = options.stadtwerkeRuntime || null;
    var mission003SceneRuntimeProvider = typeof options.mission003SceneRuntimeProvider === "function"
      ? options.mission003SceneRuntimeProvider
      : function () { return options.mission003SceneRuntime || null; };
    var mission003Plan = options.mission003Plan || window.MISSION_BOS_MISSION_003_PLAN || null;
    var mission004SceneRuntimeProvider = typeof options.mission004SceneRuntimeProvider === "function"
      ? options.mission004SceneRuntimeProvider
      : function () { return options.mission004SceneRuntime || null; };
    var mission004Plan = options.mission004Plan || window.MISSION_BOS_MISSION_004_PLAN || null;
    var responsePlan = options.responsePlan || window.MISSION_BOS_RESPONSE_VEHICLE_PLAN;
    var incidentPlan = options.incidentPlan || window.MISSION_BOS_INCIDENT_RESPONSE_PLAN;
    var cellLoadPlan = options.cellLoadPlan || window.MISSION_BOS_CELL_LOAD_PLAN;
    var cellLoadRuntime = options.cellLoadRuntime;

    if (!layout || !plan || !scenePlan || !cellLoadPlan || !responseRuntime || !responseRuntime.vehiclesById ||
        !cellLoadRuntime || typeof cellLoadRuntime.getCellLoad !== "function" ||
        !radioModel || typeof radioModel.createDecisionState !== "function" ||
        typeof radioModel.updateDecision !== "function") {
      return createFailedRuntime("One or more association dependencies are missing.", null);
    }

    var validation = null;
    if (validator && typeof validator.validate === "function" && typeof validator.logResult === "function") {
      validation = validator.validate(layout, responsePlan, incidentPlan, scenePlan, plan, cellLoadPlan);
      validator.logResult(validation);
      if (!validation || validation.status !== "PASSED") {
        return createFailedRuntime("Network association plan validation returned FAILED.", validation);
      }
    }

    var definitions = flattenDefinitions(networkPlan, plan);
    var actorsById = Object.create(null);
    (scenePlan.actors || []).forEach(function (actor) { actorsById[actor.id] = actor; });

    var towerRecords = [];
    var towersById = Object.create(null);
    (plan.towers || []).forEach(function (definition) {
      var source = findById(layout.mobileTowers || [], definition.referenceId);
      if (!source || !source.worldRect) return;
      var record = {
        id: definition.referenceId,
        cellId: definition.id,
        label: definition.label,
        available: definition.available === true,
        siteCalibrationOffset: finite(definition.siteCalibrationOffset, 0),
        coverageInfluences: copy(definition.coverageInfluences || []),
        source: source,
        position: {
          x: Number(source.worldRect.x),
          y: finite(source.height, 0) + 0.35,
          z: Number(source.worldRect.z)
        }
      };
      towersById[record.id] = record;
      towerRecords.push(record);
    });

    var model = plan.selectionModel || {};
    var evaluationInterval = Math.max(EPSILON, finite(model.evaluationIntervalSeconds, 0.25));
    var timeToTrigger = finite(model.timeToTriggerSeconds, 0.75);
    var minimumDwell = finite(model.minimumDwellSeconds, 3.0);
    var endpointsById = Object.create(null);
    var endpointStates = [];
    definitions.forEach(function (definition) {
      var state = {
        definition: definition,
        endpointId: definition.id,
        referenceId: definition.referenceId,
        channel: definition.channel,
        active: false,
        position: null,
        radioState: radioModel.createDecisionState(),
        previousTowerId: null,
        handoverHistory: [],
        lastEvaluationTime: 0
      };
      endpointsById[state.endpointId] = state;
      endpointStates.push(state);
    });

    var manifest = createManifest(definitions, towerRecords.length, networkPlan, plan);
    logManifest(manifest);
    var safety = emptySafety();
    if (manifest.status !== "PASSED" || String((plan.selectionModel || {}).id) !== "SIMPLIFIED_RADIO_HANDOVER_V3") {
      safety.expectedCountErrors += 1;
      safety.errors.push("Association runtime contract or endpoint count mismatch.");
    }
    if (manifest.actual.fixedServingTowerDefinitions !== 0) {
      safety.fixedServingTowerErrors = manifest.actual.fixedServingTowerDefinitions;
      safety.errors.push("Fixed serving-tower definition detected.");
    }
    finalizeSafety(safety);

    var currentTime = 0;
    var evaluationAccumulator = 0;
    var safetyAccumulator = 0;
    var context = { missionState: "READY", activeMissionId: null, arenaActive: false };
    var handoverHistory = [];
    var lastHandover = null;
    var resetGeneration = 0;
    var disposed = false;

    function normalizeContext(runtimeState) {
      runtimeState = runtimeState || {};
      if (typeof runtimeState === "string") runtimeState = { missionState: runtimeState };
      return {
        missionState: String(runtimeState.missionState || "READY"),
        activeMissionId: runtimeState.activeMissionId || null,
        arenaActive: runtimeState.arenaActive === true
      };
    }

    function endpointIsActive(definition) {
      var mode = definition.activeMode;
      var stateId = context.missionState;
      var activeMissionId = context.activeMissionId;
      if (mode === "always") return true;
      if (mode === "mission-001") {
        return activeMissionId === "MISSION_001" && stateId !== "READY" && stateId !== "FAILED";
      }
      if (mode === "mission-002") {
        return activeMissionId === "MISSION_002" && stateId !== "READY" && stateId !== "FAILED";
      }
      if (mode === "mission-001-scene") {
        return activeMissionId === "MISSION_001" && ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"].indexOf(stateId) >= 0;
      }
      if (mode === "arena-event") {
        return activeMissionId === "MISSION_002" && stateId !== "READY" && stateId !== "FAILED";
      }
      if (mode === "mission-003-scene") {
        var states = mission003Plan && mission003Plan.scene && mission003Plan.scene.visibilitySchedule
          ? mission003Plan.scene.visibilitySchedule.bystandersVisibleStates : [];
        return activeMissionId === "MISSION_003" && states.indexOf(stateId) >= 0;
      }
      if (mode === "mission-004-scene") {
        var mission004States = mission004Plan && mission004Plan.scene && mission004Plan.scene.bystandersVisibleStates
          ? mission004Plan.scene.bystandersVisibleStates : [];
        return activeMissionId === "MISSION_004" && mission004States.indexOf(stateId) >= 0;
      }
      if (definition.kind === "response-vehicle") return definition.active !== false;
      return Array.isArray(definition.activeStates) && definition.activeStates.indexOf(stateId) >= 0;
    }

    function objectPosition(object, yOffset) {
      if (!object || !object.position) return null;
      return {
        x: Number(object.position.x),
        y: Number(object.position.y) + finite(yOffset, 0),
        z: Number(object.position.z)
      };
    }

    function resolvePosition(state) {
      var definition = state.definition;
      var kind = definition.kind;
      var referenceId = definition.referenceId;

      if (kind === "response-vehicle") {
        var responseState = responseRuntime.vehiclesById[referenceId];
        return responseState && responseState.mesh ? objectPosition(responseState.mesh, 1.35) : null;
      }
      if (kind === "ambulance") {
        if (ambulanceRuntime && typeof ambulanceRuntime.getCommsPosition === "function") {
          var commsPosition = ambulanceRuntime.getCommsPosition();
          if (commsPosition) return { x: Number(commsPosition.x), y: Number(commsPosition.y), z: Number(commsPosition.z) };
        }
        var ambulanceState = responseRuntime.vehiclesById[referenceId];
        return ambulanceState && ambulanceState.mesh ? objectPosition(ambulanceState.mesh, 1.42) : null;
      }
      if (kind === "utility-vehicle") {
        if (stadtwerkeRuntime && typeof stadtwerkeRuntime.getCommsPosition === "function") {
          var utilityPosition = stadtwerkeRuntime.getCommsPosition();
          return utilityPosition ? { x: Number(utilityPosition.x), y: Number(utilityPosition.y), z: Number(utilityPosition.z) } : null;
        }
        return null;
      }
      if (kind === "civilian-vehicle") {
        var civilianVehicle = trafficRuntime && trafficRuntime.vehiclesById && trafficRuntime.vehiclesById[referenceId];
        return civilianVehicle && civilianVehicle.mesh ? objectPosition(civilianVehicle.mesh, 1.25) : null;
      }
      if (kind === "civilian-pedestrian") {
        var pedestrian = pedestrianRuntime && pedestrianRuntime.personsById && pedestrianRuntime.personsById[referenceId];
        return objectPosition(pedestrian, 1.5);
      }
      if (kind === "mission-phone") {
        var sceneRuntime = sceneRuntimeProvider();
        var sceneActor = sceneRuntime && sceneRuntime.actorsById && sceneRuntime.actorsById[referenceId];
        if (sceneActor) return objectPosition(sceneActor, 1.48);
        var actor = actorsById[referenceId];
        return actor && actor.position ? {
          x: Number(actor.position.x),
          y: Number(actor.position.y || 0) + 1.48,
          z: Number(actor.position.z)
        } : null;
      }
      if (kind === "mission3-phone") {
        var mission003Scene = mission003SceneRuntimeProvider();
        if (mission003Scene && typeof mission003Scene.getEndpointPosition === "function") {
          var mission003Position = mission003Scene.getEndpointPosition(definition.id);
          return mission003Position ? { x: Number(mission003Position.x), y: Number(mission003Position.y), z: Number(mission003Position.z) } : null;
        }
        return null;
      }
      if (kind === "mission4-phone") {
        var mission004Scene = mission004SceneRuntimeProvider();
        if (mission004Scene && typeof mission004Scene.getEndpointPosition === "function") {
          var mission004Position = mission004Scene.getEndpointPosition(definition.id);
          return mission004Position ? { x: Number(mission004Position.x), y: Number(mission004Position.y), z: Number(mission004Position.z) } : null;
        }
        return null;
      }
      if (kind === "arena-phone" || kind === "arena-idle-device") {
        var arenaRuntime = arenaRuntimeProvider();
        if (arenaRuntime && typeof arenaRuntime.getActorPosition === "function") {
          var arenaPosition = arenaRuntime.getActorPosition(referenceId);
          return arenaPosition ? {
            x: Number(arenaPosition.x),
            y: Number(arenaPosition.y || 0) + 1.48,
            z: Number(arenaPosition.z)
          } : null;
        }
      }
      return null;
    }

    function loadMap() {
      var values = Object.create(null);
      towerRecords.forEach(function (tower) {
        values[tower.id] = finite(cellLoadRuntime.getCellLoad(tower.id), 0);
      });
      return values;
    }

    function deactivate(state) {
      state.active = false;
      state.position = null;
      state.previousTowerId = state.radioState.servingTowerId;
      state.radioState = radioModel.createDecisionState();
    }

    function refreshLiveEndpointPositions() {
      endpointStates.forEach(function (state) {
        if (!endpointIsActive(state.definition)) {
          if (state.active || state.radioState.servingTowerId || state.position) deactivate(state);
          return;
        }
        state.active = true;
        state.position = resolvePosition(state);
        if (!isFinitePosition(state.position)) state.radioState.status = "UNRESOLVED";
      });
    }

    function recordHandover(state, event, priorLastHandoverTime) {
      var runtimeEvent = {
        endpointId: state.endpointId,
        referenceId: state.referenceId,
        label: state.definition.label,
        channel: state.channel,
        fromTowerId: event.fromTowerId,
        toTowerId: event.toTowerId,
        time: currentTime,
        x: Number(state.position.x),
        z: Number(state.position.z),
        servingScore: event.servingScore,
        candidateScore: event.candidateScore,
        candidateAdvantage: event.candidateAdvantage,
        triggerDurationSeconds: event.triggerDurationSeconds,
        dwellDurationSeconds: currentTime - priorLastHandoverTime,
        reason: event.reason,
        resetGeneration: resetGeneration
      };
      state.previousTowerId = event.fromTowerId;
      state.handoverHistory.push(runtimeEvent);
      handoverHistory.push(runtimeEvent);
      lastHandover = runtimeEvent;
      console.log("MISSION BOS NETWORK HANDOVER CONFIRMED: " + state.definition.label + " · " + event.fromTowerId + " -> " + event.toTowerId);
    }

    function evaluateState(state, loads) {
      if (!endpointIsActive(state.definition)) {
        if (state.active || state.radioState.servingTowerId) deactivate(state);
        return;
      }
      state.active = true;
      state.lastEvaluationTime = currentTime;
      if (!isFinitePosition(state.position)) {
        state.radioState.status = "UNRESOLVED";
        return;
      }
      var priorLastHandoverTime = state.radioState.lastHandoverTime;
      var result = radioModel.updateDecision(state.radioState, {
        time: currentTime,
        position: state.position,
        towers: towerRecords,
        loadsByTowerId: loads,
        model: model
      });
      if (result.event) recordHandover(state, result.event, priorLastHandoverTime);
    }

    function evaluateAll(force) {
      if (disposed || safety.fatal) return;
      if (!force && evaluationAccumulator + EPSILON < evaluationInterval) return;
      if (!force) evaluationAccumulator = Math.max(0, evaluationAccumulator - evaluationInterval);
      var loads = loadMap();
      endpointStates.forEach(function (state) { evaluateState(state, loads); });
    }

    function addError(next, key, message) {
      next[key] += 1;
      next.errors.push(message);
    }

    function addWarning(next, key, message) {
      next[key] += 1;
      next.recoverableWarnings += 1;
      next.warnings.push(message);
    }

    function runSafety(initial) {
      var next = emptySafety();
      var dependencySafety = cellLoadRuntime.getSafetyStatus && cellLoadRuntime.getSafetyStatus();
      if (!dependencySafety) addError(next, "dependencyErrors", "Cell-load dependency is unavailable.");
      else if (dependencySafety.fatal === true) addError(next, "dependencyErrors", "Cell-load dependency has a fatal error.");
      else if (dependencySafety.status !== "PASSED") addWarning(next, "dependencyErrors", "Cell-load dependency reported a recoverable warning.");
      if (endpointStates.length !== manifest.expected.mobileEndpoints || towerRecords.length !== manifest.expected.towers) {
        addError(next, "expectedCountErrors", "Endpoint or tower count changed.");
      }
      endpointStates.forEach(function (state) {
        var rs = state.radioState;
        if (!state.active) {
          if (rs.candidateTowerId || rs.candidateSince !== null || rs.candidateProgress > EPSILON) {
            addError(next, "candidateStateLeakErrors", "Inactive endpoint retained candidate state: " + state.endpointId);
          }
          return;
        }
        if (!isFinitePosition(state.position)) {
          addWarning(next, "endpointResolutionErrors", "Endpoint position temporarily unavailable: " + state.endpointId);
          return;
        }
        if (!rs.servingTowerId || !towersById[rs.servingTowerId]) {
          addWarning(next, "missingServingCellErrors", "Serving cell temporarily unavailable: " + state.endpointId);
        }
        if (!isFinite(Number(rs.servingScore))) addError(next, "invalidScoreErrors", "Serving score invalid: " + state.endpointId);
        for (var i = 0; i < state.handoverHistory.length; i += 1) {
          var event = state.handoverHistory[i];
          if (Number(event.triggerDurationSeconds) + EPSILON < timeToTrigger) addError(next, "handoverBeforeTimeToTriggerErrors", "TTT violated: " + state.endpointId);
          if (Number(event.dwellDurationSeconds) + EPSILON < minimumDwell) addError(next, "handoverBeforeDwellErrors", "Dwell time violated: " + state.endpointId);
          if (i > 0) {
            var previous = state.handoverHistory[i - 1];
            var dt = Number(event.time) - Number(previous.time);
            var dx = Number(event.x) - Number(previous.x);
            var dz = Number(event.z) - Number(previous.z);
            if (event.toTowerId === previous.fromTowerId && (dt + EPSILON < minimumDwell || Math.sqrt(dx * dx + dz * dz) < 1)) {
              addError(next, "pingPongErrors", "Ping-pong handover: " + state.endpointId);
            }
          }
        }
      });
      safety = finalizeSafety(next);
      if (initial || safety.failed) logSafety(safety);
    }

    function update(delta, elapsed, runtimeState) {
      if (disposed || safety.fatal) return;
      var step = Math.max(0, Math.min(finite(delta, 0), 0.25));
      currentTime += step;
      evaluationAccumulator += step;
      safetyAccumulator += step;
      var nextContext = normalizeContext(runtimeState);
      var changed = nextContext.missionState !== context.missionState ||
        nextContext.activeMissionId !== context.activeMissionId || nextContext.arenaActive !== context.arenaActive;
      context = nextContext;
      refreshLiveEndpointPositions();
      evaluateAll(changed);
      evaluateAll(false);
      if (safetyAccumulator + EPSILON >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafety(false);
      }
    }

    function associationSnapshot(state) {
      if (!state) return null;
      var rs = state.radioState;
      var cell = rs.servingTowerId ? cellLoadRuntime.getCell(rs.servingTowerId) : null;
      return {
        endpointId: state.endpointId,
        referenceId: state.referenceId,
        kind: state.definition.kind,
        activity: state.definition.activity || null,
        demandUnits: finite(state.definition.demandUnits, 0),
        label: state.definition.label,
        channel: state.channel,
        active: state.active,
        servingTowerId: rs.servingTowerId,
        previousTowerId: state.previousTowerId,
        score: rs.servingScore,
        servingScore: rs.servingScore,
        candidateTowerId: rs.candidateTowerId,
        candidateScore: rs.candidateScore,
        candidateAdvantage: rs.candidateAdvantage,
        candidateProgress: rs.candidateProgress,
        candidateSince: rs.candidateSince,
        lastHandoverTime: rs.lastHandoverTime,
        handoverCount: rs.confirmedHandoverCount,
        status: state.active ? rs.status : "INACTIVE",
        servingCellLoad: cell ? cell.currentLoad : null,
        servingCellStatus: cell ? cell.status : null,
        servingCellBosPriority: cell ? cell.bosPriorityActive === true : false,
        position: state.position ? copy(state.position) : null
      };
    }

    function candidateSnapshot(state) {
      if (!state) return null;
      var rs = state.radioState;
      return {
        endpointId: state.endpointId,
        servingTowerId: rs.servingTowerId,
        candidateTowerId: rs.candidateTowerId,
        candidateAdvantage: rs.candidateAdvantage,
        candidateProgress: rs.candidateProgress,
        status: state.active && rs.candidateTowerId ? "HANDOVER_CANDIDATE" : (state.active ? "ATTACHED" : "INACTIVE")
      };
    }

    function reset() {
      if (disposed) return false;
      currentTime = 0;
      evaluationAccumulator = 0;
      safetyAccumulator = 0;
      context = { missionState: "READY", activeMissionId: null, arenaActive: false };
      handoverHistory.length = 0;
      lastHandover = null;
      resetGeneration += 1;
      endpointStates.forEach(function (state) {
        state.active = false;
        state.position = null;
        state.previousTowerId = null;
        state.handoverHistory.length = 0;
        state.lastEvaluationTime = 0;
        state.radioState = radioModel.createDecisionState();
      });
      refreshLiveEndpointPositions();
      evaluateAll(true);
      runSafety(false);
      return safety.fatal !== true;
    }

    function dispose() {
      disposed = true;
      endpointStates.length = 0;
      handoverHistory.length = 0;
    }

    refreshLiveEndpointPositions();
    evaluateAll(true);
    runSafety(true);

    return {
      validation: validation,
      towersById: towersById,
      endpointsById: endpointsById,
      update: update,
      getAssociation: function (endpointId) { return associationSnapshot(endpointsById[endpointId]); },
      getLiveEndpointPosition: function (endpointId) {
        var state = endpointsById[endpointId];
        return state && state.active && state.position ? copy(state.position) : null;
      },
      getServingTowerId: function (endpointId) {
        var state = endpointsById[endpointId];
        return state && state.active ? state.radioState.servingTowerId : null;
      },
      getServingTower: function (endpointId) {
        var state = endpointsById[endpointId];
        var id = state && state.active ? state.radioState.servingTowerId : null;
        var tower = id ? towersById[id] : null;
        return tower ? {
          id: tower.id,
          cellId: tower.cellId,
          label: tower.label,
          available: tower.available,
          position: copy(tower.position),
          source: tower.source
        } : null;
      },
      getAllAssociations: function () { return endpointStates.map(associationSnapshot); },
      getCandidateState: function (endpointId) { return candidateSnapshot(endpointsById[endpointId]); },
      getAllCandidateStates: function () { return endpointStates.map(candidateSnapshot); },
      getLastHandover: function () { return lastHandover ? copy(lastHandover) : null; },
      getHandoverHistory: function () { return handoverHistory.map(copy); },
      getEndpointDefinition: function (endpointId) { return endpointsById[endpointId] ? copy(endpointsById[endpointId].definition) : null; },
      reset: reset,
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: dispose
    };
  }

  window.MissionBosNetworkAssociationController = { create: create };
})();
