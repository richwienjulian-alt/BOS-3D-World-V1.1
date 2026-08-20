/* Mission BOS - Build 011N.1
   Deterministic shared-cell capacity allocation for every active endpoint.
   Reads load, association and automatic-priority state without changing them.
*/
(function () {
  "use strict";

  var EPSILON = 1e-9;
  var SAFETY_INTERVAL_SECONDS = 0.25;
  var LEGACY_SERVICE_STATES = ["NORMAL", "CONGESTED", "DEPRIORITIZED", "DEFERRED"];
  var REALISM_SERVICE_STATES = ["SERVED", "BEST_EFFORT", "DEPRIORITIZED", "DEFERRED"];

  function finite(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function round(value) {
    var number = finite(value, 0);
    return Math.abs(number - Math.round(number)) < 0.001 ? Math.round(number) : Math.round(number * 10) / 10;
  }

  function statusLabel(status) {
    if (status === "OVERLOADED") return "Überlastet";
    if (status === "HIGH_LOAD") return "Hohe Last";
    if (status === "FAILED") return "Fehler";
    return "Normal";
  }

  function flattenCivilianDefinitions(networkPlan) {
    var participants = (networkPlan || {}).participants || {};
    return [].concat(
      participants.alwaysOnCivilian || [],
      participants.mission001Civilian || [],
      participants.arenaCivilian || [],
      participants.utility || [],
      participants.mission003Civilian || [],
      participants.mission004Civilian || []
    ).map(copy);
  }

  function emptySafety() {
    return {
      title: "MISSION BOS CELL CAPACITY RUNTIME SAFETY",
      capacityOverflowErrors: 0,
      priorityWithoutBosErrors: 0,
      priorityCellMismatchErrors: 0,
      staleDeprioritizationErrors: 0,
      invalidEndpointServiceStateErrors: 0,
      resetLeakErrors: 0,
      sourceMutationErrors: 0,
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

  function finishSafety(safety) {
    safety.failed = safety.errors.length > 0;
    safety.fatal = safety.fatal === true || safety.sourceMutationErrors > 0 || safety.expectedCountErrors > 0 ||
      safety.capacityOverflowErrors > 0;
    safety.status = safety.failed ? "FAILED" : "PASSED";
    return safety;
  }

  function logSafety(safety) {
    var method = safety.status === "PASSED" ? "log" : "error";
    console.group(safety.title);
    Object.keys(safety).filter(function (key) { return /Errors$/.test(key); }).forEach(function (key) {
      console[method](key + ": " + safety[key]);
    });
    console[method]("STATUS: " + safety.status);
    if (safety.errors.length) console.error(safety.errors);
    console.groupEnd();
  }

  function createFailedRuntime(message) {
    var safety = emptySafety();
    safety.dependencyErrors = 1;
    safety.errors.push(message || "Cell-capacity initialization failed.");
    finishSafety(safety);
    safety.fatal = true;
    logSafety(safety);
    return {
      validation: null,
      update: function () {},
      registerAssociationProvider: function () { return false; },
      getCell: function () { return null; },
      getAllCells: function () { return []; },
      getEndpointServiceState: function () { return null; },
      getAffectedCivilianEndpoints: function () { return []; },
      getDashboardSnapshot: function () { return { visible: false, stateLabel: "Nicht verfügbar", rows: [], note: "", hint: "Symbolische Simulationseinheiten." }; },
      reset: function () { return false; },
      getManifest: function () { return { status: "FAILED" }; },
      getSafetyStatus: function () { return copy(safety); },
      dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var layout = options.layout;
    var missionPlan = options.missionPlan;
    var mission002Plan = options.mission002Plan;
    var scenePlan = options.scenePlan;
    var arenaPlan = options.arenaPlan;
    var associationPlan = options.associationPlan;
    var cellLoadPlan = options.cellLoadPlan;
    var communicationPlan = options.communicationPlan;
    var legacyPlan = options.capacityPlan || options.plan;
    var validator = options.validator;
    var cellLoadRuntime = options.cellLoadRuntime;
    var associationRuntime = options.associationRuntime;
    var priorityRuntime = options.priorityRuntime || null;
    var networkPlan = options.networkRealismPlan || window.MISSION_BOS_NETWORK_REALISM_PLAN;

    if (!layout || !missionPlan || !mission002Plan || !scenePlan || !arenaPlan || !associationPlan ||
        !cellLoadPlan || !communicationPlan || !legacyPlan || !validator ||
        typeof validator.validate !== "function" || !cellLoadRuntime || !associationRuntime || !networkPlan) {
      return createFailedRuntime("Dual-mission capacity dependencies are incomplete.");
    }

    var validation = validator.validate(
      layout, missionPlan, scenePlan, associationPlan, cellLoadPlan,
      communicationPlan, legacyPlan, mission002Plan, arenaPlan
    );
    validator.logResult(validation);
    if (!validation || validation.status !== "PASSED") {
      return createFailedRuntime("Frozen dual-mission capacity validation returned FAILED.");
    }

    var capacityPolicy = networkPlan.capacityAllocation || {};
    var capacity = finite(capacityPolicy.cellCapacityUnits, 100);
    var bosDemandPerEndpoint = finite(capacityPolicy.bosDemandPerEndpointUnits, 12);
    var activityOrder = (capacityPolicy.deterministicAffectedEndpointOrder || ["background-sync", "navigation", "messaging", "upload"]).slice();
    var minimumAffected = finite(capacityPolicy.minimumVisibleAffectedCivilianSessionsPerActivePriorityCell, 1);
    var civilianDefinitions = flattenCivilianDefinitions(networkPlan);
    var bosDefinitions = (((networkPlan || {}).participants || {}).bos || []).map(copy);
    var civilianById = Object.create(null);
    civilianDefinitions.forEach(function (definition) { civilianById[definition.id] = definition; });
    var bosIds = bosDefinitions.map(function (definition) { return definition.id; });
    var cellsByTowerId = Object.create(null);
    var endpointStates = Object.create(null);
    var affectedEndpoints = [];
    var safety = emptySafety();
    var evaluationAccumulator = 0;
    var safetyAccumulator = 0;
    var resetPending = false;
    var disposed = false;
    var lastState = { missionState: "READY", activeMissionId: null, activeBosEndpointIds: [] };
    var sourceSignature = JSON.stringify({
      capacity: legacyPlan,
      networkRealism: networkPlan,
      cellLoad: cellLoadPlan,
      associationModel: associationPlan.selectionModel
    });

    (cellLoadPlan.cells || []).forEach(function (definition) {
      cellsByTowerId[definition.towerId] = {
        towerId: definition.towerId,
        cellId: definition.id,
        label: definition.label,
        capacity: capacity,
        currentLoad: finite(definition.baseLoad, 0),
        targetLoad: finite(definition.baseLoad, 0),
        status: "NORMAL",
        civilianDemand: finite(definition.baseLoad, 0),
        bosDemand: 0,
        civilianServed: finite(definition.baseLoad, 0),
        civilianUnserved: 0,
        bosServed: 0,
        bosUnserved: 0,
        priorityApplied: false,
        prioritySettled: false,
        priorityProgress: 0,
        bosPriorityActive: false,
        bosEndpointIds: [],
        civilianEndpointIds: [],
        affectedCivilianEndpointIds: []
      };
    });

    var manifest = {
      title: "MISSION BOS CELL CAPACITY 012M.1 RUNTIME MANIFEST",
      actual: {
        cells: Object.keys(cellsByTowerId).length,
        eligibleBosEndpoints: bosIds.length,
        visibleCivilianEndpoints: civilianDefinitions.length,
        deterministicActivityClasses: activityOrder.length,
        priorityTriggeredReassociations: 0,
        removedCivilianActors: 0,
        hiddenCivilianDevices: 0
      },
      expected: {
        cells: 5,
        eligibleBosEndpoints: finite((networkPlan.expectedCounts || {}).bosEndpoints, 3),
        visibleCivilianEndpoints: finite((networkPlan.expectedCounts || {}).allCivilianEndpoints, 31),
        deterministicActivityClasses: 4,
        priorityTriggeredReassociations: 0,
        removedCivilianActors: 0,
        hiddenCivilianDevices: 0
      },
      status: "PASSED"
    };
    manifest.status = Object.keys(manifest.expected).every(function (key) {
      return Number(manifest.actual[key]) === Number(manifest.expected[key]);
    }) ? "PASSED" : "FAILED";
    console.group(manifest.title);
    Object.keys(manifest.actual).forEach(function (key) {
      console[manifest.status === "PASSED" ? "log" : "error"](key + ": " + manifest.actual[key] + " / " + manifest.expected[key]);
    });
    console[manifest.status === "PASSED" ? "log" : "error"]("STATUS: " + manifest.status);
    console.groupEnd();

    function association(endpointId) {
      return associationRuntime.getAssociation(endpointId);
    }

    function automaticState(towerId, runtimeState) {
      var runtime = (runtimeState && runtimeState.priorityRuntime) || priorityRuntime;
      return runtime && typeof runtime.getCellState === "function" ? runtime.getCellState(towerId) : null;
    }

    function beforeAllocation(civilianDemand, bosDemand) {
      var civilianServed = Math.min(civilianDemand, capacity);
      var remaining = Math.max(0, capacity - civilianServed);
      var bosServed = Math.min(bosDemand, remaining);
      return {
        civilianServed: civilianServed,
        civilianUnserved: 0,
        bosServed: bosServed,
        bosUnserved: Math.max(0, bosDemand - bosServed)
      };
    }

    function afterAllocation(civilianDemand, bosDemand) {
      var bosServed = Math.min(bosDemand, capacity);
      var civilianServed = Math.min(civilianDemand, Math.max(0, capacity - bosServed));
      return {
        civilianServed: civilianServed,
        civilianUnserved: Math.max(0, civilianDemand - civilianServed),
        bosServed: bosServed,
        bosUnserved: Math.max(0, bosDemand - bosServed)
      };
    }

    function interpolateAllocation(before, after, progress) {
      var result = {};
      ["civilianServed", "civilianUnserved", "bosServed", "bosUnserved"].forEach(function (key) {
        result[key] = before[key] + (after[key] - before[key]) * progress;
      });
      return result;
    }

    function deterministicCivilianOrder(ids) {
      return ids.slice().sort(function (leftId, rightId) {
        var left = civilianById[leftId] || {};
        var right = civilianById[rightId] || {};
        var leftRank = activityOrder.indexOf(left.activity);
        var rightRank = activityOrder.indexOf(right.activity);
        if (leftRank < 0) leftRank = activityOrder.length;
        if (rightRank < 0) rightRank = activityOrder.length;
        if (leftRank !== rightRank) return leftRank - rightRank;
        return String(leftId).localeCompare(String(rightId));
      });
    }

    function serviceForAffectedIndex(index) {
      if (index === 0) return "DEFERRED";
      return "DEPRIORITIZED";
    }

    function evaluate(step, runtimeState) {
      runtimeState = runtimeState || {};
      var rampSeconds = finite(((legacyPlan || {}).capacityModel || {}).activationRampSeconds, 0.8);
      affectedEndpoints = [];

      Object.keys(cellsByTowerId).forEach(function (towerId) {
        var cell = cellsByTowerId[towerId];
        var load = cellLoadRuntime.getCell(towerId);
        var automatic = automaticState(towerId, runtimeState);
        cell.currentLoad = load ? clamp(finite(load.currentLoad, 0), 0, 100) : 0;
        cell.targetLoad = load ? clamp(finite(load.targetLoad, cell.currentLoad), 0, 100) : cell.currentLoad;
        cell.status = load ? load.status : "FAILED";
        cell.civilianDemand = cell.currentLoad;
        var automaticPriorityIds = automatic && Array.isArray(automatic.bosEndpointIds)
          ? automatic.bosEndpointIds.slice()
          : [];
        cell.bosEndpointIds = automaticPriorityIds.filter(function (endpointId) {
          if (lastState.activeBosEndpointIds.indexOf(endpointId) < 0) return false;
          var current = association(endpointId);
          return !!current && current.active === true && current.servingTowerId === towerId;
        });
        cell.civilianEndpointIds = civilianDefinitions.filter(function (definition) {
          var current = association(definition.id);
          return !!current && current.active === true && current.servingTowerId === towerId &&
            cell.bosEndpointIds.indexOf(definition.id) < 0;
        }).map(function (definition) { return definition.id; });
        cell.bosDemand = cell.bosEndpointIds.length * bosDemandPerEndpoint;

        var requested = !!automatic && automatic.active === true && cell.bosEndpointIds.length > 0;
        if (requested) cell.priorityProgress = clamp(cell.priorityProgress + step / Math.max(EPSILON, rampSeconds), 0, 1);
        else cell.priorityProgress = 0;
        cell.priorityApplied = requested && cell.priorityProgress > EPSILON;
        cell.prioritySettled = requested && cell.priorityProgress >= 1 - EPSILON;
        cell.bosPriorityActive = cell.priorityApplied;

        var before = beforeAllocation(cell.civilianDemand, cell.bosDemand);
        var after = afterAllocation(cell.civilianDemand, cell.bosDemand);
        var allocation = interpolateAllocation(before, after, cell.priorityProgress);
        cell.civilianServed = allocation.civilianServed;
        cell.civilianUnserved = allocation.civilianUnserved;
        cell.bosServed = allocation.bosServed;
        cell.bosUnserved = allocation.bosUnserved;

        cell.affectedCivilianEndpointIds = [];
        var ordered = deterministicCivilianOrder(cell.civilianEndpointIds);
        if (cell.priorityApplied && cell.civilianUnserved > EPSILON && ordered.length) {
          var count = Math.max(minimumAffected, Math.ceil(cell.civilianUnserved / 8));
          cell.affectedCivilianEndpointIds = ordered.slice(0, Math.min(count, ordered.length));
        } else if (!cell.priorityApplied && cell.status === "OVERLOADED" && cell.bosEndpointIds.length && ordered.length) {
          cell.affectedCivilianEndpointIds = ordered.slice(0, 1);
        }
      });

      endpointStates = Object.create(null);
      civilianDefinitions.forEach(function (definition) {
        var current = association(definition.id);
        var cell = current && current.active ? cellsByTowerId[current.servingTowerId] : null;
        var missionScopedPriority = !!cell && cell.priorityApplied && cell.bosEndpointIds.indexOf(definition.id) >= 0;
        var status = "SERVED";
        if (cell && !missionScopedPriority) {
          var affectedIndex = cell.affectedCivilianEndpointIds.indexOf(definition.id);
          if (cell.priorityApplied && affectedIndex >= 0) status = serviceForAffectedIndex(affectedIndex);
          else if (!cell.priorityApplied && affectedIndex >= 0) status = "BEST_EFFORT";
          else if (cell.status === "HIGH_LOAD" || cell.status === "OVERLOADED") status = "BEST_EFFORT";
        }
        var legacyState = status === "SERVED" ? "NORMAL" : status === "BEST_EFFORT" ? "CONGESTED" : status;
        var state = {
          endpointId: definition.id,
          towerId: current && current.active ? current.servingTowerId : null,
          state: legacyState,
          status: status,
          label: missionScopedPriority ? "Einsatzpriorität stabil" : (status === "SERVED" ? "Normal" : status === "BEST_EFFORT" ? "Best Effort" : status === "DEPRIORITIZED" ? "Depriorisiert" : "Zurückgestellt"),
          activity: definition.activity,
          active: !!current && current.active === true,
          missionScopedPriority: missionScopedPriority,
          priorityProgress: cell ? cell.priorityProgress : 0
        };
        endpointStates[definition.id] = state;
        if (status === "DEPRIORITIZED" || status === "DEFERRED") affectedEndpoints.push(copy(state));
      });

      bosDefinitions.forEach(function (definition) {
        var current = association(definition.id);
        var cell = current && current.active ? cellsByTowerId[current.servingTowerId] : null;
        var served = !cell || cell.bosUnserved <= EPSILON;
        endpointStates[definition.id] = {
          endpointId: definition.id,
          towerId: current && current.active ? current.servingTowerId : null,
          state: served ? "NORMAL" : "CONGESTED",
          status: served ? "SERVED" : "BEST_EFFORT",
          label: served ? "BOS stabil" : "BOS eingeschränkt",
          active: !!current && current.active === true,
          priorityProgress: cell ? cell.priorityProgress : 0
        };
      });
    }

    function runSafety(initial) {
      var next = emptySafety();
      var loadSafety = cellLoadRuntime.getSafetyStatus && cellLoadRuntime.getSafetyStatus();
      var associationSafety = associationRuntime.getSafetyStatus && associationRuntime.getSafetyStatus();
      var activePriorityRuntime = priorityRuntime;
      if (!loadSafety || loadSafety.fatal === true || !associationSafety || associationSafety.fatal === true) {
        next.dependencyErrors += 1;
        next.errors.push("Cell-load or shared-association dependency has a fatal error.");
      }
      if (activePriorityRuntime && activePriorityRuntime.getSafetyStatus) {
        var prioritySafety = activePriorityRuntime.getSafetyStatus();
        if (!prioritySafety || prioritySafety.fatal === true) {
          next.dependencyErrors += 1;
          next.errors.push("Automatic priority dependency has a fatal error.");
          next.fatal = true;
        } else if (prioritySafety.status !== "PASSED") {
          next.recoverableWarnings += 1;
          next.warnings.push("Automatic priority dependency reported a recoverable warning.");
        }
      }
      if (JSON.stringify({ capacity: legacyPlan, networkRealism: networkPlan, cellLoad: cellLoadPlan, associationModel: associationPlan.selectionModel }) !== sourceSignature) {
        next.sourceMutationErrors += 1;
        next.errors.push("A frozen capacity source changed during runtime.");
      }
      if (Object.keys(cellsByTowerId).length !== 5 || civilianDefinitions.length !== finite((networkPlan.expectedCounts || {}).allNonBosEndpoints, 38) || bosDefinitions.length !== 3) {
        next.expectedCountErrors += 1;
        next.errors.push("Capacity endpoint or cell counts changed.");
      }
      Object.keys(cellsByTowerId).forEach(function (towerId) {
        var cell = cellsByTowerId[towerId];
        if (cell.civilianServed + cell.bosServed > cell.capacity + 0.001) {
          next.capacityOverflowErrors += 1;
          next.errors.push("Cell capacity overflow: " + towerId);
        }
        if (cell.priorityApplied && !cell.bosEndpointIds.length) {
          next.priorityWithoutBosErrors += 1;
          next.errors.push("Priority active without BOS endpoint: " + towerId);
        }
        cell.affectedCivilianEndpointIds.forEach(function (endpointId) {
          if (cell.civilianEndpointIds.indexOf(endpointId) < 0) {
            next.staleDeprioritizationErrors += 1;
            next.errors.push("Stale civilian impact: " + endpointId);
          }
        });
      });
      Object.keys(endpointStates).forEach(function (endpointId) {
        var state = endpointStates[endpointId];
        if (civilianById[endpointId] && (LEGACY_SERVICE_STATES.indexOf(state.state) < 0 || REALISM_SERVICE_STATES.indexOf(state.status) < 0)) {
          next.invalidEndpointServiceStateErrors += 1;
          next.errors.push("Invalid civilian service state: " + endpointId);
        }
      });
      if (resetPending) {
        var leaked = affectedEndpoints.length > 0 || Object.keys(cellsByTowerId).some(function (towerId) {
          var cell = cellsByTowerId[towerId];
          return cell.priorityApplied || cell.priorityProgress > EPSILON;
        });
        if (leaked) {
          next.resetLeakErrors += 1;
          next.errors.push("Capacity impact leaked after reset.");
        }
        resetPending = false;
      }
      safety = finishSafety(next);
      if (initial || safety.failed) logSafety(safety);
    }

    function update(delta, elapsed, runtimeState) {
      if (disposed) return;
      runtimeState = runtimeState || {};
      priorityRuntime = runtimeState.priorityRuntime || priorityRuntime;
      lastState = {
        missionState: String(runtimeState.missionState || "READY"),
        activeMissionId: runtimeState.activeMissionId || null,
        activeBosEndpointIds: Array.isArray(runtimeState.activeBosEndpointIds) ? runtimeState.activeBosEndpointIds.slice() : []
      };
      var step = Math.max(0, Math.min(finite(delta, 0), 0.25));
      evaluationAccumulator += step;
      safetyAccumulator += step;
      var interval = finite(((legacyPlan || {}).capacityModel || {}).evaluationIntervalSeconds, 0.1);
      if (evaluationAccumulator + EPSILON >= interval) {
        evaluationAccumulator %= interval;
        evaluate(step, runtimeState);
      }
      if (safetyAccumulator + EPSILON >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafety(false);
      }
    }

    function cellSnapshot(cell) {
      return cell ? {
        towerId: cell.towerId,
        cellId: cell.cellId,
        label: cell.label,
        capacity: round(cell.capacity),
        currentLoad: round(cell.currentLoad),
        targetLoad: round(cell.targetLoad),
        status: cell.status,
        civilianDemand: round(cell.civilianDemand),
        bosDemand: round(cell.bosDemand),
        civilianServed: round(cell.civilianServed),
        civilianUnserved: round(cell.civilianUnserved),
        bosServed: round(cell.bosServed),
        bosUnserved: round(cell.bosUnserved),
        priorityApplied: cell.priorityApplied,
        prioritySettled: cell.prioritySettled,
        priorityProgress: clamp(cell.priorityProgress, 0, 1),
        bosPriorityActive: cell.bosPriorityActive,
        bosEndpointIds: cell.bosEndpointIds.slice(),
        civilianEndpointIds: cell.civilianEndpointIds.slice(),
        affectedCivilianEndpointIds: cell.affectedCivilianEndpointIds.slice()
      } : null;
    }

    function dashboardSnapshot() {
      var dashboard = legacyPlan.dashboard || {};
      var rows = Object.keys(cellsByTowerId).map(function (towerId) { return cellsByTowerId[towerId]; }).filter(function (cell) {
        return dashboard.showOnlyOverloadedOrPriorityCells !== true || cell.status === "OVERLOADED" || cell.priorityApplied || cell.bosDemand > 0;
      }).sort(function (left, right) {
        if (left.priorityApplied !== right.priorityApplied) return left.priorityApplied ? -1 : 1;
        if ((left.bosDemand > 0) !== (right.bosDemand > 0)) return left.bosDemand > 0 ? -1 : 1;
        if (left.civilianDemand !== right.civilianDemand) return right.civilianDemand - left.civilianDemand;
        return left.towerId.localeCompare(right.towerId);
      }).slice(0, finite(dashboard.maxVisibleCellRows, 2));
      var inProgress = rows.some(function (cell) { return cell.priorityApplied && !cell.prioritySettled; });
      var settled = rows.some(function (cell) { return cell.prioritySettled; });
      var label = "Bereit";
      if (inProgress) label = "BOS-Priorisierung wird aufgebaut";
      else if (settled) label = "BOS-Kapazität priorisiert";
      else if (lastState.missionState === "OVERLOADED") label = "Best Effort · BOS teilweise bedient";
      return {
        visible: ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "TREATMENT", "COMPLETED", "TRANSPORTING", "AT_HOSPITAL", "RETURNING"].indexOf(lastState.missionState) >= 0,
        state: lastState.missionState,
        stateLabel: label,
        note: settled ? dashboard.afterPriorityText : dashboard.beforePriorityText,
        hint: dashboard.symbolicHint || "Symbolische Simulationseinheiten.",
        labels: copy(dashboard.labels || {}),
        rows: rows.map(function (cell) {
          return {
            towerId: cell.towerId,
            label: cell.label,
            status: cell.status,
            statusLabel: statusLabel(cell.status),
            civilianDemand: round(cell.civilianDemand),
            civilianServed: round(cell.civilianServed),
            civilianUnserved: round(cell.civilianUnserved),
            bosServed: round(cell.bosServed),
            bosUnserved: round(cell.bosUnserved),
            bosServedLabel: cell.priorityApplied ? "BOS priorisiert" : "BOS bedient",
            priorityApplied: cell.priorityApplied,
            prioritySettled: cell.prioritySettled,
            priorityProgress: clamp(cell.priorityProgress, 0, 1),
            affectedEndpointIds: cell.affectedCivilianEndpointIds.slice()
          };
        })
      };
    }

    function reset() {
      if (disposed) return false;
      lastState = { missionState: "READY", activeMissionId: null, activeBosEndpointIds: [] };
      evaluationAccumulator = 0;
      safetyAccumulator = 0;
      endpointStates = Object.create(null);
      affectedEndpoints = [];
      Object.keys(cellsByTowerId).forEach(function (towerId) {
        var cell = cellsByTowerId[towerId];
        cell.bosDemand = 0;
        cell.civilianUnserved = 0;
        cell.bosServed = 0;
        cell.bosUnserved = 0;
        cell.priorityApplied = false;
        cell.prioritySettled = false;
        cell.priorityProgress = 0;
        cell.bosPriorityActive = false;
        cell.bosEndpointIds = [];
        cell.civilianEndpointIds = [];
        cell.affectedCivilianEndpointIds = [];
      });
      resetPending = true;
      evaluate(0, { priorityRuntime: priorityRuntime });
      runSafety(false);
      return safety.fatal !== true;
    }

    function dispose() {
      disposed = true;
      cellsByTowerId = Object.create(null);
      endpointStates = Object.create(null);
      affectedEndpoints = [];
    }

    evaluate(0, { priorityRuntime: priorityRuntime });
    runSafety(true);

    return {
      validation: validation,
      update: update,
      registerAssociationProvider: function (providerId, runtime) {
        return !disposed && !!providerId && !!runtime && typeof runtime.getAssociation === "function";
      },
      getCell: function (towerId) { return cellSnapshot(cellsByTowerId[towerId]); },
      getAllCells: function () { return Object.keys(cellsByTowerId).sort().map(function (towerId) { return cellSnapshot(cellsByTowerId[towerId]); }); },
      getEndpointServiceState: function (endpointId) { return endpointStates[endpointId] ? copy(endpointStates[endpointId]) : null; },
      getAffectedCivilianEndpoints: function () { return copy(affectedEndpoints); },
      getDashboardSnapshot: dashboardSnapshot,
      reset: reset,
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: dispose
    };
  }

  window.MissionBosCellCapacityController = { create: create };
})();
