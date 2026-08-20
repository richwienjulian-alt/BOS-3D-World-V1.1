/* Mission BOS - Build 011N.1
   Local Cell Load, deterministic saturation breathing and BOS priority with
   bounded, whitelisted civilian contribution sources.

   Simplified symbolic visualization layer only. No modules. No fetch.
   This controller reads the existing mission, global load and association state.
   It never changes the mission, global load, BOS state, vehicles, people or city.
*/
(function () {
  "use strict";

  var SAFETY_INTERVAL_SECONDS = 0.25;
  var EPSILON = 1e-9;

  function finite(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      if (items[i] && items[i].id === id) return items[i];
    }
    return null;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function statusForLoad(load, model) {
    if (!isFinite(Number(load))) return "FAILED";
    if (Number(load) >= finite(model.overloadedAtOrAbove, 90)) return "OVERLOADED";
    if (Number(load) >= finite(model.normalBelow, 55)) return "HIGH_LOAD";
    return "NORMAL";
  }

  function statusLabel(status) {
    if (status === "OVERLOADED") return "Überlastet";
    if (status === "HIGH_LOAD") return "Hohe Last";
    if (status === "FAILED") return "Fehler";
    return "Normal";
  }

  function profileByState(plan, stateId) {
    var profiles = (plan || {}).missionStateProfiles || [];
    for (var i = 0; i < profiles.length; i += 1) {
      if (profiles[i] && profiles[i].stateId === stateId) return profiles[i];
    }
    return null;
  }

  function sourceSignature(layout, missionPlan, scenePlan, incidentPlan, associationPlan, plan) {
    return JSON.stringify({
      towers: (layout.mobileTowers || []).map(function (tower) {
        return { id: tower.id, worldRect: tower.worldRect, height: tower.height };
      }),
      missionStates: missionPlan.stateOrder,
      scenePhones: (scenePlan.actors || []).filter(function (actor) {
        return actor.role === "spectator" && actor.phone === true;
      }).map(function (actor) {
        return { id: actor.id, position: actor.position, phone: actor.phone };
      }),
      incidentVehicles: incidentPlan.vehicles,
      associationTowers: associationPlan.towers,
      associationEndpoints: associationPlan.mobileEndpoints,
      plan: plan
    });
  }

  function createManifest(plan) {
    var expected = plan.expectedCounts || {};
    var actual = {
      cells: (plan.cells || []).length,
      missionStateProfiles: (plan.missionStateProfiles || []).length,
      dashboardRows: ((plan.dashboard || {}).rows || []).length,
      priorityEligibleEndpoints: ((plan.bosPriority || {}).eligibleAssociationEndpointIds || []).length,
      automaticBOSActivations: plan.policy && plan.policy.automaticBOSActivationAllowed === true ? 1 : 0,
      civilianLoadReductionsAfterBOS: Number((plan.bosPriority || {}).civilianLoadReduction || 0) !== 0 ? 1 : 0
    };
    var status =
      actual.cells === Number(expected.cells || 0) &&
      actual.missionStateProfiles === Number(expected.missionStateProfiles || 0) &&
      actual.dashboardRows === Number(expected.dashboardRows || 0) &&
      actual.priorityEligibleEndpoints === Number(expected.priorityEligibleEndpoints || 0) &&
      actual.automaticBOSActivations === Number(expected.automaticBOSActivations || 0) &&
      actual.civilianLoadReductionsAfterBOS === Number(expected.civilianLoadReductionsAfterBOS || 0)
        ? "PASSED" : "FAILED";
    return {
      title: "MISSION BOS LOCAL CELL LOAD RUNTIME MANIFEST",
      actual: actual,
      expected: expected,
      status: status,
      lines: [
        "MISSION BOS LOCAL CELL LOAD RUNTIME MANIFEST",
        "Cells: " + actual.cells + " / " + Number(expected.cells || 0),
        "Mission profiles: " + actual.missionStateProfiles + " / " + Number(expected.missionStateProfiles || 0),
        "Dashboard rows: " + actual.dashboardRows + " / " + Number(expected.dashboardRows || 0),
        "Priority-eligible BOS endpoints: " + actual.priorityEligibleEndpoints + " / " + Number(expected.priorityEligibleEndpoints || 0),
        "Automatic BOS activations: " + actual.automaticBOSActivations + " / " + Number(expected.automaticBOSActivations || 0),
        "Civilian load reductions after BOS: " + actual.civilianLoadReductionsAfterBOS + " / " + Number(expected.civilianLoadReductionsAfterBOS || 0),
        "STATUS: " + status
      ]
    };
  }

  function logManifest(manifest) {
    var method = manifest.status === "PASSED" ? "log" : "error";
    console.group(manifest.title);
    manifest.lines.slice(1).forEach(function (line) { console[method](line); });
    console.groupEnd();
  }

  function emptySafety() {
    return {
      title: "MISSION BOS LOCAL CELL LOAD RUNTIME SAFETY",
      invalidLoadErrors: 0,
      towerReferenceErrors: 0,
      sourceMutationErrors: 0,
      priorityCellErrors: 0,
      priorityWithoutBosErrors: 0,
      bosLoadReductionErrors: 0,
      associationRuntimeErrors: 0,
      dynamicContributionErrors: 0,
      expectedCountErrors: 0,
      status: "PASSED",
      failed: false,
      fatal: false,
      recoverableWarnings: 0,
      warnings: [],
      errors: []
    };
  }

  function copySafety(safety) {
    return {
      title: safety.title,
      invalidLoadErrors: safety.invalidLoadErrors,
      towerReferenceErrors: safety.towerReferenceErrors,
      sourceMutationErrors: safety.sourceMutationErrors,
      priorityCellErrors: safety.priorityCellErrors,
      priorityWithoutBosErrors: safety.priorityWithoutBosErrors,
      bosLoadReductionErrors: safety.bosLoadReductionErrors,
      associationRuntimeErrors: safety.associationRuntimeErrors,
      dynamicContributionErrors: safety.dynamicContributionErrors,
      expectedCountErrors: safety.expectedCountErrors,
      status: safety.status,
      failed: safety.failed,
      fatal: safety.fatal === true,
      recoverableWarnings: Number(safety.recoverableWarnings || 0),
      warnings: (safety.warnings || []).slice(),
      errors: safety.errors.slice()
    };
  }

  function logSafety(safety) {
    var method = safety.status === "PASSED" ? "log" : "error";
    console.group(safety.title);
    console[method]("Invalid load errors: " + safety.invalidLoadErrors);
    console[method]("Tower reference errors: " + safety.towerReferenceErrors);
    console[method]("Source mutation errors: " + safety.sourceMutationErrors);
    console[method]("Priority cell errors: " + safety.priorityCellErrors);
    console[method]("Priority without BOS errors: " + safety.priorityWithoutBosErrors);
    console[method]("BOS load reduction errors: " + safety.bosLoadReductionErrors);
    console[method]("Association runtime errors: " + safety.associationRuntimeErrors);
    console[method]("Dynamic contribution errors: " + safety.dynamicContributionErrors);
    console[method]("Expected count errors: " + safety.expectedCountErrors);
    console[method]("Recoverable warnings: " + Number(safety.recoverableWarnings || 0));
    console[method]("STATUS: " + safety.status);
    if (safety.errors.length) console.error(safety.errors);
    console.groupEnd();
  }

  function createFailedRuntime(message, validation, plan) {
    var manifest = createManifest(plan || { expectedCounts: {} });
    manifest.status = "FAILED";
    manifest.lines[manifest.lines.length - 1] = "STATUS: FAILED";
    logManifest(manifest);
    var safety = emptySafety();
    safety.invalidLoadErrors = 1;
    safety.status = "FAILED";
    safety.failed = true;
    safety.fatal = true;
    safety.errors.push(message || "Local cell-load initialization failed.");
    logSafety(safety);
    return {
      validation: validation || null,
      cellsByTowerId: Object.create(null),
      update: function () {},
      getCell: function () { return null; },
      getCellLoad: function () { return null; },
      getAllCells: function () { return []; },
      getCriticalCell: function () { return null; },
      getPriorityCells: function () { return []; },
      getDashboardSnapshot: function () { return { rows: [], criticalCellLabel: "Nicht verfügbar" }; },
      setDynamicCivilianContributions: function () { return false; },
      reset: function () { return false; },
      getManifest: function () { return manifest; },
      getSafetyStatus: function () { return copySafety(safety); },
      dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var layout = options.layout;
    var missionPlan = options.missionPlan;
    var scenePlan = options.scenePlan;
    var incidentPlan = options.incidentPlan;
    var associationPlan = options.associationPlan;
    var plan = options.plan;
    var validator = options.validator;
    var recoveryPlan = options.recoveryPlan || null;
    var networkRealismPlan = options.networkRealismPlan || null;
    var mission003Plan = options.mission003Plan || window.MISSION_BOS_MISSION_003_PLAN || null;
    var mission004Plan = options.mission004Plan || window.MISSION_BOS_MISSION_004_PLAN || null;
    var recoveryEnabled = options.recoveryEnabled === true && !!recoveryPlan;
    var additionalDynamicCivilianSources = Array.isArray(options.additionalDynamicCivilianSources)
      ? options.additionalDynamicCivilianSources
      : [];

    if (!layout || !missionPlan || !scenePlan || !incidentPlan || !associationPlan || !plan) {
      return createFailedRuntime("One or more frozen cell-load sources are missing.", null, plan);
    }
    if (!validator || typeof validator.validate !== "function" || typeof validator.logResult !== "function") {
      return createFailedRuntime("MissionBosCellLoadValidator is incomplete.", null, plan);
    }

    var validation = validator.validate(layout, missionPlan, scenePlan, incidentPlan, associationPlan, plan);
    validator.logResult(validation);
    if (!validation || validation.status !== "PASSED") {
      return createFailedRuntime("Local cell-load validation returned FAILED.", validation, plan);
    }

    var model = plan.loadModel || {};
    var cellsByTowerId = Object.create(null);
    var cells = (plan.cells || []).map(function (definition) {
      var state = {
        definition: definition,
        towerId: definition.towerId,
        cellId: definition.id,
        label: definition.label,
        baseLoad: Number(definition.baseLoad),
        baseTargetLoad: Number(definition.baseLoad),
        dynamicCivilianLoad: 0,
        redistributionAdjustment: 0,
        currentLoad: Number(definition.baseLoad),
        targetLoad: Number(definition.baseLoad),
        status: statusForLoad(definition.baseLoad, model),
        bosPriorityActive: false,
        bosEndpointIds: []
      };
      cellsByTowerId[state.towerId] = state;
      return state;
    });

    var source = sourceSignature(layout, missionPlan, scenePlan, incidentPlan, associationPlan, plan);
    var manifest = createManifest(plan);
    logManifest(manifest);
    var safety = emptySafety();
    var fatalFailed = manifest.status !== "PASSED";
    if (fatalFailed) {
      safety.expectedCountErrors = 1;
      safety.status = "FAILED";
      safety.failed = true;
      safety.fatal = true;
      safety.errors.push("Local cell-load manifest does not match expected counts.");
    }

    var currentMissionState = "READY";
    var currentGlobalLoad = 38;
    var currentBosActive = false;
    var currentManualLoadActive = false;
    var currentActiveMissionId = null;
    var currentActualMissionState = "READY";
    var currentArenaActive = false;
    var currentMission004AmbulanceAtScene = false;
    var saturationSnapshot = {
      active: false,
      mode: "NONE",
      towerId: null,
      towerIds: [],
      minimumLoad: null,
      maximumLoad: null,
      targetLoad: null,
      elapsed: 0
    };
    var currentActiveBosEndpointIds = [];
    var previousBosActive = false;
    var evaluationAccumulator = 0;
    var safetyAccumulator = 0;
    var disposed = false;
    var lastBosActivationTargets = null;
    var dynamicContributionsBySource = Object.create(null);
    var mission001ReserveByTowerId = null;
    var dynamicContributionErrorCount = 0;
    var allowedDynamicSources = Object.create(null);
    allowedDynamicSources.REPRESENTATIVE_CIVILIAN_ENDPOINTS = 6;
    allowedDynamicSources.MISSION_001_VISIBLE_ENDPOINTS = 6;
    additionalDynamicCivilianSources.forEach(function (definition) {
      var id = definition && definition.id;
      var maximum = Number(definition && definition.maxDemandUnits);
      if (!id || id === "REPRESENTATIVE_CIVILIAN_ENDPOINTS" || id === "MISSION_001_VISIBLE_ENDPOINTS" ||
          Object.prototype.hasOwnProperty.call(allowedDynamicSources, id) ||
          !isFinite(maximum) || maximum < 0) {
        dynamicContributionErrorCount += 1;
        return;
      }
      allowedDynamicSources[id] = maximum;
    });
    var additionalDynamicSourceSignature = JSON.stringify(additionalDynamicCivilianSources);

    function recomputeDynamicLoads() {
      cells.forEach(function (cell) {
        var total = 0;
        Object.keys(dynamicContributionsBySource).forEach(function (sourceId) {
          if (sourceId === "MISSION_001_VISIBLE_ENDPOINTS") return;
          total += finite((dynamicContributionsBySource[sourceId] || {})[cell.towerId], 0);
        });
        var currentMission001 = finite(((dynamicContributionsBySource.MISSION_001_VISIBLE_ENDPOINTS || {})[cell.towerId]), 0);
        var reservedMission001 = finite(((mission001ReserveByTowerId || {})[cell.towerId]), 0);
        cell.dynamicCivilianLoad = Math.max(0, total);
        cell.redistributionAdjustment = currentMission001 - reservedMission001;
        cell.currentLoad = clamp(cell.baseLoad + cell.dynamicCivilianLoad + cell.redistributionAdjustment, finite(model.rangeMin, 0), finite(model.rangeMax, 100));
        cell.targetLoad = clamp(cell.baseTargetLoad + cell.dynamicCivilianLoad + cell.redistributionAdjustment, finite(model.rangeMin, 0), finite(model.rangeMax, 100));
        cell.status = statusForLoad(cell.currentLoad, model);
      });
    }

    function setDynamicCivilianContributions(sourceId, contributionsByTowerId) {
      if (disposed || fatalFailed || !Object.prototype.hasOwnProperty.call(allowedDynamicSources, sourceId)) return false;
      var sourceValues = contributionsByTowerId || {};
      var normalized = Object.create(null);
      var total = 0;
      var valid = true;
      Object.keys(sourceValues).forEach(function (towerId) {
        var value = Number(sourceValues[towerId]);
        if (!cellsByTowerId[towerId] || !isFinite(value) || value < 0) {
          valid = false;
          return;
        }
        normalized[towerId] = value;
        total += value;
      });
      if (total > Number(allowedDynamicSources[sourceId]) + EPSILON) valid = false;
      if (!valid) {
        dynamicContributionErrorCount += 1;
        return false;
      }
      if (Object.keys(normalized).length === 0) {
        delete dynamicContributionsBySource[sourceId];
        if (sourceId === "MISSION_001_VISIBLE_ENDPOINTS") mission001ReserveByTowerId = null;
      } else {
        dynamicContributionsBySource[sourceId] = normalized;
        if (sourceId === "MISSION_001_VISIBLE_ENDPOINTS" && !mission001ReserveByTowerId) {
          mission001ReserveByTowerId = Object.create(null);
          cells.forEach(function (cell) {
            mission001ReserveByTowerId[cell.towerId] = finite(normalized[cell.towerId], 0);
          });
        }
      }
      recomputeDynamicLoads();
      return true;
    }

    function smoothStep(value) {
      value = clamp(value, 0, 1);
      return value * value * (3 - 2 * value);
    }

    function saturationWave(elapsed, minimumLoad, maximumLoad, cycleOverride) {
      var points = [0, 0.6, 1, 1, 0.7, 0.1, 0.5, 1, 1, 0.4, 0];
      var cycleSeconds = finite(cycleOverride, finite(((recoveryPlan || {}).saturation || {}).cycleSeconds, 8));
      var phase = ((finite(elapsed, 0) % cycleSeconds) + cycleSeconds) % cycleSeconds / cycleSeconds;
      var scaled = phase * (points.length - 1);
      var index = Math.min(points.length - 2, Math.floor(scaled));
      var local = smoothStep(scaled - index);
      var factor = points[index] + (points[index + 1] - points[index]) * local;
      return minimumLoad + (maximumLoad - minimumLoad) * factor;
    }

    function endpointTower(associationRuntime, endpointId) {
      if (!associationRuntime || typeof associationRuntime.getAssociation !== "function") return null;
      var association = associationRuntime.getAssociation(endpointId);
      return association && association.active === true && association.servingTowerId && cellsByTowerId[association.servingTowerId]
        ? association.servingTowerId : null;
    }

    function rankedTowerForGroups(associationRuntime, primaryIds, secondaryIds, requirePrimary) {
      var scores = Object.create(null);
      function add(ids, field) {
        (ids || []).forEach(function (endpointId) {
          var towerId = endpointTower(associationRuntime, endpointId);
          if (!towerId) return;
          if (!scores[towerId]) scores[towerId] = { towerId: towerId, primary: 0, secondary: 0 };
          scores[towerId][field] += 1;
        });
      }
      add(primaryIds, "primary");
      add(secondaryIds, "secondary");
      return Object.keys(scores).map(function (towerId) { return scores[towerId]; }).filter(function (entry) {
        return (!requirePrimary || entry.primary > 0) && entry.secondary > 0;
      }).sort(function (a, b) {
        if (a.primary !== b.primary) return b.primary - a.primary;
        if (a.secondary !== b.secondary) return b.secondary - a.secondary;
        var loadA = finite((cellsByTowerId[a.towerId] || {}).currentLoad, 0);
        var loadB = finite((cellsByTowerId[b.towerId] || {}).currentLoad, 0);
        if (Math.abs(loadA - loadB) > EPSILON) return loadB - loadA;
        return String(a.towerId).localeCompare(String(b.towerId));
      })[0] || null;
    }

    function resolveSaturation(associationRuntime, elapsed) {
      if (!networkRealismPlan) return null;
      var saturation = recoveryEnabled && recoveryPlan ? recoveryPlan.saturation || {} : {};
      var participants = networkRealismPlan.participants || {};
      if (recoveryEnabled && recoveryPlan && currentActiveMissionId === "MISSION_001") {
        var m1 = saturation.mission001 || {};
        if ((m1.enabledStates || []).indexOf(currentActualMissionState) < 0 || currentActualMissionState === "RETURNING") return null;
        var m1Bos = ["NET_FIRE_01", "NET_POLICE_01"];
        var m1Civilian = (participants.mission001Civilian || []).map(function (entry) { return entry.id; });
        var m1Hotspot = rankedTowerForGroups(associationRuntime, m1Bos, m1Civilian, true);
        if (!m1Hotspot) return null;
        return { mode: "MISSION_001", towerId: m1Hotspot.towerId, minimumLoad: finite(m1.minimumLoad, 98), maximumLoad: finite(m1.maximumLoad, 100), targetLoad: saturationWave(elapsed, finite(m1.minimumLoad, 98), finite(m1.maximumLoad, 100)) };
      }
      if (recoveryEnabled && recoveryPlan && currentActiveMissionId === "MISSION_002" && currentArenaActive && currentActualMissionState !== "RETURNING" && currentActualMissionState !== "READY" && currentActualMissionState !== "FAILED") {
        var m2 = saturation.mission002 || {};
        var arenaIds = (participants.arenaCivilian || []).map(function (entry) { return entry.id; });
        var arenaHotspot = rankedTowerForGroups(associationRuntime, [], arenaIds, false);
        if (!arenaHotspot) return null;
        var ambulanceTowerId = endpointTower(associationRuntime, "NET_AMBULANCE_01");
        var common = ambulanceTowerId && ambulanceTowerId === arenaHotspot.towerId;
        var minimum = common ? finite(m2.eventWithBosMinimumLoad, 98) : finite(m2.eventWithoutBosMinimumLoad, 96);
        return { mode: common ? "MISSION_002_WITH_BOS" : "MISSION_002_EVENT", towerId: arenaHotspot.towerId, minimumLoad: minimum, maximumLoad: finite(m2.maximumLoad, 100), targetLoad: saturationWave(elapsed, minimum, finite(m2.maximumLoad, 100)) };
      }
      if (currentActiveMissionId === "MISSION_003" && mission003Plan && mission003Plan.network) {
        var m3 = mission003Plan.network;
        if ((m3.saturationEnabledStates || []).indexOf(currentActualMissionState) < 0 || currentActualMissionState === "RETURNING") return null;
        var responseIds = (m3.missionScopedPriorityEndpointIds || m3.activeBosEndpointIds || []).slice();
        var actualTowerIds = [];
        responseIds.forEach(function (endpointId) {
          var towerId = endpointTower(associationRuntime, endpointId);
          if (towerId && actualTowerIds.indexOf(towerId) < 0) actualTowerIds.push(towerId);
        });
        if (!actualTowerIds.length) return null;
        actualTowerIds.sort();
        var m3Minimum = finite(m3.saturationMinimumLoad, 98);
        var m3Maximum = finite(m3.saturationMaximumLoad, 100);
        return {
          mode: "MISSION_003",
          towerId: actualTowerIds[0],
          towerIds: actualTowerIds,
          minimumLoad: m3Minimum,
          maximumLoad: m3Maximum,
          targetLoad: saturationWave(elapsed, m3Minimum, m3Maximum, finite(m3.saturationCycleSeconds, 8))
        };
      }
      if (currentActiveMissionId === "MISSION_004" && mission004Plan && mission004Plan.network) {
        var m4 = mission004Plan.network;
        var m4AllowedStates = (m4.preOverloadEnabledStates || []).concat(m4.saturationEnabledStates || []);
        if (m4AllowedStates.indexOf(currentActualMissionState) < 0) return null;
        var m4CivilianIds = (m4.missionCivilianEndpointIds || []).slice();
        var m4Hotspot = rankedTowerForGroups(associationRuntime, [], m4CivilianIds, false);
        if (!m4Hotspot || !m4Hotspot.towerId) return null;
        var m4IncidentTowerId = m4Hotspot.towerId;
        var m4Targets = m4.incidentLoadTargets || {};
        var m4AmbulanceTowerId = endpointTower(associationRuntime, m4.ambulanceArrivalEndpointId || "NET_AMBULANCE_01");
        var m4AmbulanceConfirmed = currentMission004AmbulanceAtScene === true &&
          !!m4AmbulanceTowerId && m4AmbulanceTowerId === m4IncidentTowerId;
        if (m4AmbulanceConfirmed) {
          var m4TargetLoads = Object.create(null);
          m4TargetLoads[m4IncidentTowerId] = finite(m4Targets.AMBULANCE_AT_INCIDENT, 100);
          var m4ApproachSupportLoad = Math.min(finite(m4.preAmbulanceMaximumLoad, 89), finite(m4Targets.ENROUTE_BEFORE_AMBULANCE, 88));
          ["NET_FIRE_01", "NET_POLICE_01"].forEach(function (endpointId) {
            var approachTowerId = endpointTower(associationRuntime, endpointId);
            if (approachTowerId && approachTowerId !== m4IncidentTowerId && cellsByTowerId[approachTowerId]) {
              m4TargetLoads[approachTowerId] = Math.max(finite(m4TargetLoads[approachTowerId], 0), m4ApproachSupportLoad);
            }
          });
          return {
            mode: "MISSION_004_AMBULANCE_OVERLOAD",
            towerId: m4IncidentTowerId,
            towerIds: Object.keys(m4TargetLoads),
            boostTowerIds: [m4IncidentTowerId],
            targetLoadsByTowerId: m4TargetLoads,
            minimumLoad: finite(m4.saturationMinimumLoad, 98),
            maximumLoad: finite(m4.saturationMaximumLoad, 100),
            targetLoad: finite(m4Targets.AMBULANCE_AT_INCIDENT, 100)
          };
        }
        if ((m4.preOverloadEnabledStates || []).indexOf(currentActualMissionState) < 0) return null;
        var m4Target = null;
        if (currentActualMissionState === "CALL_RECEIVED") m4Target = finite(m4Targets.CALL_RECEIVED, 62);
        else if (currentActualMissionState === "ALARMING") m4Target = finite(m4Targets.ALARMING, 70);
        else if (currentActualMissionState === "ROAD_CLOSURE") m4Target = finite(m4Targets.ROAD_CLOSURE, 80);
        else if (currentActualMissionState === "ENROUTE") m4Target = finite(m4Targets.ENROUTE_BEFORE_AMBULANCE, 88);
        if (!isFinite(m4Target)) return null;
        m4Target = Math.min(finite(m4.preAmbulanceMaximumLoad, 89), m4Target);
        return {
          mode: "MISSION_004_PRE_OVERLOAD",
          towerId: m4IncidentTowerId,
          towerIds: [m4IncidentTowerId],
          minimumLoad: m4Target,
          maximumLoad: m4Target,
          targetLoad: m4Target
        };
      }
      return null;
    }

    function applySaturation(associationRuntime, elapsed) {
      var resolved = resolveSaturation(associationRuntime, elapsed);
      var towerIds = resolved ? (Array.isArray(resolved.towerIds) && resolved.towerIds.length ? resolved.towerIds.slice() : [resolved.towerId]) : [];
      towerIds = towerIds.filter(function (towerId) { return !!cellsByTowerId[towerId]; });
      if (!resolved || !towerIds.length) {
        saturationSnapshot = { active: false, mode: "NONE", towerId: null, towerIds: [], minimumLoad: null, maximumLoad: null, targetLoad: null, elapsed: finite(elapsed, 0) };
        return;
      }
      towerIds.forEach(function (towerId) {
        var cell = cellsByTowerId[towerId];
        var resolvedTarget = resolved.targetLoadsByTowerId && isFinite(Number(resolved.targetLoadsByTowerId[towerId]))
          ? Number(resolved.targetLoadsByTowerId[towerId]) : resolved.targetLoad;
        cell.baseTargetLoad = clamp(resolvedTarget - cell.dynamicCivilianLoad - cell.redistributionAdjustment,
          finite(model.rangeMin, 0), finite(model.rangeMax, 100));
      });
      recomputeDynamicLoads();
      saturationSnapshot = {
        active: true,
        mode: resolved.mode,
        towerId: towerIds[0],
        towerIds: towerIds,
        minimumLoad: resolved.minimumLoad,
        maximumLoad: resolved.maximumLoad,
        targetLoad: resolved.targetLoad,
        targetLoadsByTowerId: copy(resolved.targetLoadsByTowerId || null),
        boostTowerIds: (resolved.boostTowerIds || []).slice(),
        elapsed: finite(elapsed, 0)
      };
    }

    function severityForLoad(load) {
      load = clamp(finite(load, 0), 0, 100);
      if (load >= 90) return { severity: "OVERLOADED", severityLabel: "Überlastet", severityColor: "#D63031" };
      if (load >= 75) return { severity: "VERY_HIGH", severityLabel: "Sehr hoch", severityColor: "#E67E22" };
      if (load >= 55) return { severity: "HIGH", severityLabel: "Hoch", severityColor: "#D6A400" };
      return { severity: "NORMAL", severityLabel: "Normal", severityColor: "#1E9E55" };
    }

    function setTargets(missionState, globalLoad, manualLoadActive) {
      var manual = plan.manualLoadProfile || {};
      var baseGlobal = finite(manual.referenceGlobalBase, 38);
      var stateProfile = profileByState(plan, missionState) || profileByState(plan, "READY");
      cells.forEach(function (cell) {
        var baseLoad = Number(cell.definition.baseLoad);
        var target = baseLoad;
        if (missionState === "READY" && manualLoadActive === true && globalLoad > finite(manual.activationAboveGlobalLoad, 44)) {
          var manualProgress = clamp(
            (globalLoad - finite(manual.referenceGlobalBase, 38)) /
            Math.max(EPSILON, finite(manual.referenceGlobalPeak, 98) - finite(manual.referenceGlobalBase, 38)),
            0,
            1
          );
          var peak = finite((manual.peakTargets || {})[cell.towerId], baseLoad);
          target = baseLoad + (peak - baseLoad) * manualProgress;
        } else if (missionState === "RETURNING") {
          var returnProgress = clamp((globalLoad - 38) / (96 - 38), 0, 1);
          var returnPeak = finite((stateProfile.targets || {})[cell.towerId], baseLoad);
          target = baseLoad + (returnPeak - baseLoad) * returnProgress;
        } else if (missionState === "FAILED" || missionState === "READY") {
          target = baseLoad;
        } else {
          var profileGlobal = finite(stateProfile.expectedGlobalLoad, baseGlobal);
          var denominator = profileGlobal - baseGlobal;
          var progress = denominator <= EPSILON ? 1 : clamp((globalLoad - baseGlobal) / denominator, 0, 1);
          var profileTarget = finite((stateProfile.targets || {})[cell.towerId], baseLoad);
          target = baseLoad + (profileTarget - baseLoad) * progress;
        }
        cell.baseTargetLoad = clamp(target, finite(model.rangeMin, 0), finite(model.rangeMax, 100));
      });
      recomputeDynamicLoads();
    }

    function updatePriorities(bosActive, associationRuntime, activeBosEndpointIds, priorityRuntime) {
      cells.forEach(function (cell) {
        cell.bosPriorityActive = false;
        cell.bosEndpointIds.length = 0;
      });
      if (priorityRuntime && typeof priorityRuntime.getAllCellStates === "function") {
        priorityRuntime.getAllCellStates().forEach(function (state) {
          var cell = state && cellsByTowerId[state.towerId];
          if (!cell) return;
          cell.bosPriorityActive = state.active === true;
          cell.bosEndpointIds = Array.isArray(state.bosEndpointIds) ? state.bosEndpointIds.slice().sort() : [];
        });
        return;
      }
      if (!bosActive || !associationRuntime || typeof associationRuntime.getAssociation !== "function") return;
      var allowedActiveIds = Array.isArray(activeBosEndpointIds) ? activeBosEndpointIds : [];
      ((plan.bosPriority || {}).eligibleAssociationEndpointIds || []).forEach(function (endpointId) {
        if (allowedActiveIds.indexOf(endpointId) < 0) return;
        var association = associationRuntime.getAssociation(endpointId);
        if (!association || !association.active || !association.servingTowerId) return;
        var cell = cellsByTowerId[association.servingTowerId];
        if (!cell) return;
        cell.bosPriorityActive = true;
        if (cell.bosEndpointIds.indexOf(endpointId) < 0) cell.bosEndpointIds.push(endpointId);
      });
    }

    function smoothLoads(delta) {
      var riseRate = finite(model.riseRatePerSecond, 10);
      var fallRate = finite(model.fallRatePerSecond, 12);
      cells.forEach(function (cell) {
        var difference = cell.baseTargetLoad - cell.baseLoad;
        var mission004ArrivalBoost = saturationSnapshot.active === true &&
          saturationSnapshot.mode === "MISSION_004_AMBULANCE_OVERLOAD" &&
          (saturationSnapshot.boostTowerIds || [saturationSnapshot.towerId]).indexOf(cell.towerId) >= 0;
        var effectiveRiseRate = mission004ArrivalBoost ? Math.max(riseRate, 28) : riseRate;
        var maxStep = (difference >= 0 ? effectiveRiseRate : fallRate) * delta;
        if (Math.abs(difference) <= maxStep) cell.baseLoad = cell.baseTargetLoad;
        else cell.baseLoad += difference > 0 ? maxStep : -maxStep;
        cell.baseLoad = clamp(cell.baseLoad, finite(model.rangeMin, 0), finite(model.rangeMax, 100));
      });
      recomputeDynamicLoads();
    }

    function runSafetyCheck(associationRuntime, initial) {
      var next = emptySafety();
      next.dynamicContributionErrors = dynamicContributionErrorCount;
      if (dynamicContributionErrorCount > 0) next.errors.push("Invalid dynamic civilian contribution was rejected.");
      if (sourceSignature(layout, missionPlan, scenePlan, incidentPlan, associationPlan, plan) !== source ||
          JSON.stringify(additionalDynamicCivilianSources) !== additionalDynamicSourceSignature) {
        next.sourceMutationErrors += 1;
        next.errors.push("A frozen cell-load source or dynamic-source whitelist changed during runtime.");
      }
      if (cells.length !== Number((plan.expectedCounts || {}).cells || 0)) {
        next.expectedCountErrors += 1;
        next.errors.push("Unexpected local cell count.");
      }
      cells.forEach(function (cell) {
        if (!findById(layout.mobileTowers || [], cell.towerId)) {
          next.towerReferenceErrors += 1;
          next.errors.push("Unknown tower: " + cell.towerId);
        }
        if (!isFinite(cell.baseLoad) || !isFinite(cell.baseTargetLoad) || !isFinite(cell.dynamicCivilianLoad) ||
            !isFinite(cell.redistributionAdjustment) || !isFinite(cell.currentLoad) || !isFinite(cell.targetLoad) ||
            cell.baseLoad < 0 || cell.baseLoad > 100 || cell.baseTargetLoad < 0 || cell.baseTargetLoad > 100 ||
            cell.dynamicCivilianLoad < 0 || cell.currentLoad < 0 || cell.currentLoad > 100 ||
            cell.targetLoad < 0 || cell.targetLoad > 100) {
          next.invalidLoadErrors += 1;
          next.errors.push("Invalid load value: " + cell.towerId);
        }
        if (cell.bosPriorityActive && !currentBosActive) {
          next.priorityWithoutBosErrors += 1;
          next.errors.push("Priority active without BOS: " + cell.towerId);
        }
        if (cell.bosPriorityActive && !cellsByTowerId[cell.towerId]) {
          next.priorityCellErrors += 1;
          next.errors.push("Unknown priority cell: " + cell.towerId);
        }
        if (cell.bosPriorityActive && cell.bosEndpointIds.some(function (endpointId) {
          return currentActiveBosEndpointIds.indexOf(endpointId) < 0;
        })) {
          next.priorityCellErrors += 1;
          next.errors.push("Priority cell contains a mission-inactive BOS endpoint: " + cell.towerId);
        }
      });
      if (associationRuntime) {
        var associationSafety = typeof associationRuntime.getSafetyStatus === "function" ? associationRuntime.getSafetyStatus() : null;
        if (!associationSafety) {
          next.associationRuntimeErrors += 1;
          next.errors.push("Network association runtime is unavailable.");
        } else if (associationSafety.fatal === true) {
          next.associationRuntimeErrors += 1;
          next.errors.push("Network association runtime has a fatal error.");
        } else if (associationSafety.status !== "PASSED") {
          next.associationRuntimeErrors += 1;
          next.recoverableWarnings += 1;
          next.warnings.push("Network association runtime reported a recoverable warning.");
        }
      }
      var invariantStates = ((plan.bosPriority || {}).loadValuesRemainUnchangedInStates || []);
      if (currentBosActive && lastBosActivationTargets && invariantStates.indexOf(currentMissionState) >= 0) {
        cells.forEach(function (cell) {
          var breathingCell = saturationSnapshot.active === true &&
            (saturationSnapshot.towerIds || [saturationSnapshot.towerId]).indexOf(cell.towerId) >= 0;
          var belowRecoveryFloor = breathingCell && cell.targetLoad + EPSILON < finite(saturationSnapshot.minimumLoad, 0);
          if ((!breathingCell && cell.baseTargetLoad + EPSILON < lastBosActivationTargets[cell.towerId]) || belowRecoveryFloor) {
            next.bosLoadReductionErrors += 1;
            next.errors.push("Civilian target load was reduced through BOS activation: " + cell.towerId);
          }
        });
      }
      if (next.errors.length) {
        next.status = "FAILED";
        next.failed = true;
      }
      next.fatal = next.invalidLoadErrors > 0 || next.towerReferenceErrors > 0 ||
        next.sourceMutationErrors > 0 || next.expectedCountErrors > 0;
      if (next.fatal) {
        fatalFailed = true;
        cells.forEach(function (cell) { cell.status = "FAILED"; });
      }
      safety = next;
      if (initial || safety.failed) logSafety(safety);
    }

    function snapshot(cell) {
      if (!cell) return null;
      var severity = severityForLoad(cell.currentLoad);
      return {
        towerId: cell.towerId,
        cellId: cell.cellId,
        label: cell.label,
        baseLoad: cell.baseLoad,
        baseTargetLoad: cell.baseTargetLoad,
        dynamicCivilianLoad: cell.dynamicCivilianLoad,
        redistributionAdjustment: cell.redistributionAdjustment,
        currentLoad: cell.currentLoad,
        targetLoad: cell.targetLoad,
        status: cell.status,
        statusLabel: statusLabel(cell.status),
        bosPriorityActive: cell.bosPriorityActive,
        bosEndpointIds: cell.bosEndpointIds.slice(),
        severity: severity.severity,
        severityLabel: severity.severityLabel,
        severityColor: severity.severityColor
      };
    }

    function update(delta, elapsed, runtimeState) {
      if (disposed || fatalFailed) return;
      runtimeState = runtimeState || {};
      var clampedDelta = Math.max(0, Math.min(finite(delta, 0), 0.25));
      currentMissionState = typeof runtimeState.missionState === "string" ? runtimeState.missionState : "READY";
      currentGlobalLoad = clamp(finite(runtimeState.globalLoad, 38), 0, 100);
      currentBosActive = runtimeState.bosActive === true;
      currentManualLoadActive = runtimeState.manualLoadActive === true;
      currentActiveMissionId = runtimeState.activeMissionId || null;
      currentActualMissionState = typeof runtimeState.actualMissionState === "string" ? runtimeState.actualMissionState : currentMissionState;
      currentArenaActive = runtimeState.arenaActive === true;
      currentMission004AmbulanceAtScene = runtimeState.mission004AmbulanceAtScene === true;
      currentActiveBosEndpointIds = Array.isArray(runtimeState.activeBosEndpointIds)
        ? runtimeState.activeBosEndpointIds.slice() : [];
      if (saturationSnapshot.active === true &&
          (currentActualMissionState === "TRANSPORTING" || currentActualMissionState === "AT_HOSPITAL" ||
           currentActualMissionState === "RETURNING" || currentActualMissionState === "READY" ||
           currentActualMissionState === "FAILED" || !currentActiveMissionId)) {
        setTargets(currentMissionState, currentGlobalLoad, currentManualLoadActive);
        applySaturation(runtimeState.associationRuntime || null, elapsed);
      }
      if (!currentBosActive && previousBosActive) {
        updatePriorities(false, null, [], runtimeState.priorityRuntime || null);
      }
      evaluationAccumulator += clampedDelta;
      safetyAccumulator += clampedDelta;

      if (evaluationAccumulator + EPSILON >= finite(model.evaluationIntervalSeconds, 0.1)) {
        evaluationAccumulator %= finite(model.evaluationIntervalSeconds, 0.1);
        setTargets(currentMissionState, currentGlobalLoad, currentManualLoadActive);
        applySaturation(runtimeState.associationRuntime || null, elapsed);
        updatePriorities(currentBosActive, runtimeState.associationRuntime || null, currentActiveBosEndpointIds, runtimeState.priorityRuntime || null);
        if (runtimeState.priorityRuntime && typeof runtimeState.priorityRuntime.getAllCellStates === "function") {
          currentBosActive = runtimeState.priorityRuntime.getAllCellStates().some(function (state) { return state && state.active === true; });
        }
      }
      if (currentBosActive && !previousBosActive) {
        lastBosActivationTargets = Object.create(null);
        cells.forEach(function (cell) { lastBosActivationTargets[cell.towerId] = cell.baseTargetLoad; });
      }
      if (!currentBosActive) lastBosActivationTargets = null;
      previousBosActive = currentBosActive;
      smoothLoads(clampedDelta);

      if (safetyAccumulator + EPSILON >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafetyCheck(runtimeState.associationRuntime || null, false);
      }
    }

    function getCriticalCell() {
      var ranked = cells.slice().sort(function (a, b) {
        if (Math.abs(a.currentLoad - b.currentLoad) > EPSILON) return b.currentLoad - a.currentLoad;
        return String(a.towerId).localeCompare(String(b.towerId));
      });
      return ranked.length ? snapshot(ranked[0]) : null;
    }

    function getDashboardSnapshot() {
      var rows = ((plan.dashboard || {}).rows || []).map(function (towerId) {
        return snapshot(cellsByTowerId[towerId]);
      }).filter(Boolean);
      var critical = getCriticalCell();
      return {
        title: (plan.dashboard || {}).sectionTitle || "Funkzellen-Auslastung",
        rows: rows,
        criticalCell: critical,
        criticalCellLabel: critical
          ? critical.towerId + " · " + Math.round(critical.currentLoad) + " %"
          : "Nicht verfügbar"
      };
    }

    function reset() {
      if (disposed || fatalFailed) return false;
      currentMissionState = "READY";
      currentGlobalLoad = 38;
      currentBosActive = false;
      currentManualLoadActive = false;
      currentActiveMissionId = null;
      currentActualMissionState = "READY";
      currentArenaActive = false;
      currentMission004AmbulanceAtScene = false;
      currentActiveBosEndpointIds = [];
      saturationSnapshot = { active: false, mode: "NONE", towerId: null, towerIds: [], minimumLoad: null, maximumLoad: null, targetLoad: null, elapsed: 0 };
      previousBosActive = false;
      lastBosActivationTargets = null;
      evaluationAccumulator = 0;
      safetyAccumulator = 0;
      dynamicContributionsBySource = Object.create(null);
      mission001ReserveByTowerId = null;
      dynamicContributionErrorCount = 0;
      cells.forEach(function (cell) {
        cell.baseLoad = Number(cell.definition.baseLoad);
        cell.baseTargetLoad = Number(cell.definition.baseLoad);
        cell.dynamicCivilianLoad = 0;
        cell.redistributionAdjustment = 0;
        cell.currentLoad = Number(cell.definition.baseLoad);
        cell.targetLoad = Number(cell.definition.baseLoad);
        cell.status = statusForLoad(cell.currentLoad, model);
        cell.bosPriorityActive = false;
        cell.bosEndpointIds.length = 0;
      });
      runSafetyCheck(null, false);
      return !fatalFailed;
    }

    function dispose() {
      dynamicContributionsBySource = Object.create(null);
      mission001ReserveByTowerId = null;
      recomputeDynamicLoads();
      disposed = true;
      cells.length = 0;
    }

    setTargets("READY", 38, false);
    runSafetyCheck(null, true);

    return {
      validation: validation,
      cellsByTowerId: cellsByTowerId,
      update: update,
      getCell: function (towerId) { return snapshot(cellsByTowerId[towerId]); },
      getCellLoad: function (towerId) {
        var cell = cellsByTowerId[towerId];
        return cell ? cell.currentLoad : null;
      },
      getAllCells: function () { return cells.map(snapshot); },
      getCriticalCell: getCriticalCell,
      getPriorityCells: function () { return cells.filter(function (cell) { return cell.bosPriorityActive; }).map(snapshot); },
      getDashboardSnapshot: getDashboardSnapshot,
      getSaturationSnapshot: function () { return copy(saturationSnapshot); },
      setDynamicCivilianContributions: setDynamicCivilianContributions,
      reset: reset,
      getManifest: function () { return manifest; },
      getSafetyStatus: function () { return copySafety(safety); },
      dispose: dispose
    };
  }

  window.MissionBosCellLoadController = { create: create };
})();
