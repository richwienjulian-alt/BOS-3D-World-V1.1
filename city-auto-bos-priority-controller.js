/* Mission BOS - Build 011N.1
   Automatic per-cell BOS priority. Priority is derived exclusively from the
   current cell load and confirmed serving-cell associations.
*/
(function () {
  "use strict";

  var EPSILON = 1e-9;
  var SAFETY_INTERVAL_SECONDS = 0.25;

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

  function emptySafety() {
    return {
      title: "MISSION BOS AUTOMATIC PRIORITY RUNTIME SAFETY",
      dependencyErrors: 0,
      expectedCountErrors: 0,
      unknownCellErrors: 0,
      priorityWithoutBosErrors: 0,
      activationTimingErrors: 0,
      releaseTimingErrors: 0,
      invalidLoadErrors: 0,
      resetLeakErrors: 0,
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
    safety.fatal = safety.dependencyErrors > 0 || safety.expectedCountErrors > 0 ||
      safety.unknownCellErrors > 0 || safety.invalidLoadErrors > 0;
    safety.status = safety.failed ? "FAILED" : "PASSED";
    return safety;
  }

  function logSafety(safety) {
    var method = safety.status === "PASSED" ? "log" : "error";
    console.group(safety.title);
    console[method]("Cells: " + (safety.expectedCountErrors ? "FAILED" : "5 / 5"));
    console[method]("Priority without BOS: " + safety.priorityWithoutBosErrors);
    console[method]("Activation timing errors: " + safety.activationTimingErrors);
    console[method]("Release timing errors: " + safety.releaseTimingErrors);
    console[method]("Reset leaks: " + safety.resetLeakErrors);
    console[method]("STATUS: " + safety.status);
    if (safety.errors.length) console.error(safety.errors);
    console.groupEnd();
  }

  function createFailedRuntime(message) {
    var safety = emptySafety();
    safety.dependencyErrors = 1;
    safety.errors.push(message || "Automatic BOS priority initialization failed.");
    finalizeSafety(safety);
    safety.fatal = true;
    logSafety(safety);
    return {
      update: function () {},
      reset: function () {},
      getCellState: function () { return null; },
      getAllCellStates: function () { return []; },
      getSafetyStatus: function () { return copy(safety); },
      dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var plan = options.plan || window.MISSION_BOS_NETWORK_REALISM_PLAN;
    var mission003Plan = options.mission003Plan || window.MISSION_BOS_MISSION_003_PLAN || null;
    var connectivityRecoveryPlan = options.connectivityRecoveryPlan || window.MISSION_BOS_MISSION_003_CONNECTIVITY_RECOVERY_PLAN || null;
    var cellLoadRuntime = options.cellLoadRuntime;
    var associationRuntime = options.associationRuntime;
    if (!plan || !plan.automaticBOSPriority || !cellLoadRuntime || !associationRuntime ||
        typeof cellLoadRuntime.getAllCells !== "function" ||
        typeof associationRuntime.getAssociation !== "function") {
      return createFailedRuntime("Automatic BOS priority dependencies are incomplete.");
    }

    var policy = plan.automaticBOSPriority;
    var overloadThreshold = finite(policy.overloadThreshold, 90);
    var activationDelay = finite(policy.activationDelaySeconds, 0.6);
    var releaseThreshold = finite(policy.releaseThreshold, 85);
    var releaseDelay = finite(policy.releaseDelaySeconds, 1.5);
    var participants = plan.participants || {};
    var bosDefinitions = (participants.bos || []).slice();
    var utilityDefinitions = (participants.utility || []).slice();
    var bosDefinitionIds = bosDefinitions.map(function (definition) { return definition.id; });
    var utilityDefinitionIds = utilityDefinitions.map(function (definition) { return definition.id; });
    var cellsByTowerId = Object.create(null);
    var transitionHistory = [];
    var safety = emptySafety();
    var safetyAccumulator = 0;
    var disposed = false;
    var resetPending = false;

    function ensureCells() {
      (cellLoadRuntime.getAllCells() || []).forEach(function (cell) {
        if (!cell || !cell.towerId || cellsByTowerId[cell.towerId]) return;
        cellsByTowerId[cell.towerId] = {
          towerId: cell.towerId,
          cellId: cell.cellId || cell.towerId,
          load: finite(cell.currentLoad, 0),
          overloaded: false,
          laneVisible: false,
          active: false,
          bosEndpointIds: [],
          overloadStableSeconds: 0,
          releaseStableSeconds: 0,
          activationProgress: 0,
          releaseProgress: 0,
          lastTransitionReason: "INITIALIZED",
          lastTransitionElapsed: 0
        };
      });
    }

    function missionScopedUtilityAllowed(endpointId, runtimeState) {
      var recoveryPriority = connectivityRecoveryPlan && connectivityRecoveryPlan.mission003Priority || {};
      var missionNetwork = mission003Plan && mission003Plan.network || {};
      var ids = recoveryPriority.endpointIds || missionNetwork.missionScopedPriorityEndpointIds || [];
      var validStates = recoveryPriority.validStates || missionNetwork.priorityValidStates || [];
      return utilityDefinitionIds.indexOf(endpointId) >= 0 && ids.indexOf(endpointId) >= 0 &&
        runtimeState.activeMissionId === (recoveryPriority.validMissionId || "MISSION_003") &&
        validStates.indexOf(runtimeState.missionState) >= 0;
    }

    function endpointPriorityAllowed(endpointId, runtimeState) {
      if (bosDefinitionIds.indexOf(endpointId) >= 0) return true;
      return missionScopedUtilityAllowed(endpointId, runtimeState);
    }

    function activeBosIdsForCell(towerId, allowedIds, runtimeState) {
      var allowed = Array.isArray(allowedIds) ? allowedIds.slice() : bosDefinitionIds.slice();
      return allowed.filter(function (endpointId) {
        if (!endpointPriorityAllowed(endpointId, runtimeState)) return false;
        var association = associationRuntime.getAssociation(endpointId);
        return !!association && association.active === true && association.servingTowerId === towerId;
      }).sort();
    }

    function setActive(state, active, reason, elapsed) {
      if (state.active === active) return;
      state.active = active;
      state.lastTransitionReason = reason;
      state.lastTransitionElapsed = finite(elapsed, 0);
      transitionHistory.push({
        towerId: state.towerId,
        active: active,
        reason: reason,
        elapsed: finite(elapsed, 0),
        bosEndpointIds: state.bosEndpointIds.slice(),
        load: state.load
      });
      if (transitionHistory.length > 120) transitionHistory.shift();
    }

    function update(delta, elapsed, runtimeState) {
      if (disposed) return;
      ensureCells();
      runtimeState = runtimeState || {};
      var step = Math.max(0, Math.min(finite(delta, 0), 0.25));
      var activeBosEndpointIds = Array.isArray(runtimeState.activeBosEndpointIds)
        ? runtimeState.activeBosEndpointIds.slice()
        : null;
      var priorityContext = {
        activeMissionId: runtimeState.activeMissionId || null,
        missionState: String(runtimeState.missionState || "READY")
      };

      Object.keys(cellsByTowerId).forEach(function (towerId) {
        var state = cellsByTowerId[towerId];
        var loadCell = cellLoadRuntime.getCell(towerId);
        state.load = loadCell ? clamp(finite(loadCell.currentLoad, 0), 0, 100) : 0;
        state.overloaded = state.load + EPSILON >= overloadThreshold;
        state.laneVisible = state.overloaded;
        state.bosEndpointIds = activeBosIdsForCell(towerId, activeBosEndpointIds, priorityContext);

        if (state.bosEndpointIds.length === 0) {
          state.overloadStableSeconds = 0;
          state.releaseStableSeconds = 0;
          state.activationProgress = 0;
          state.releaseProgress = 0;
          setActive(state, false, "NO_BOS_ENDPOINT_IN_CELL", elapsed);
          return;
        }

        if (state.overloaded) {
          state.releaseStableSeconds = 0;
          state.releaseProgress = 0;
          if (!state.active) {
            state.overloadStableSeconds += step;
            state.activationProgress = clamp(state.overloadStableSeconds / Math.max(EPSILON, activationDelay), 0, 1);
            if (state.overloadStableSeconds + EPSILON >= activationDelay) {
              setActive(state, true, "STABLE_OVERLOAD_WITH_BOS", elapsed);
              state.activationProgress = 1;
            }
          } else {
            state.overloadStableSeconds = Math.max(state.overloadStableSeconds, activationDelay);
            state.activationProgress = 1;
          }
          return;
        }

        state.overloadStableSeconds = 0;
        state.activationProgress = state.active ? 1 : 0;
        if (state.active && state.load < releaseThreshold - EPSILON) {
          state.releaseStableSeconds += step;
          state.releaseProgress = clamp(state.releaseStableSeconds / Math.max(EPSILON, releaseDelay), 0, 1);
          if (state.releaseStableSeconds + EPSILON >= releaseDelay) {
            setActive(state, false, "STABLE_RELEASE_BELOW_THRESHOLD", elapsed);
            state.releaseStableSeconds = 0;
            state.releaseProgress = 0;
            state.activationProgress = 0;
          }
        } else {
          state.releaseStableSeconds = 0;
          state.releaseProgress = 0;
        }
      });

      safetyAccumulator += step;
      if (safetyAccumulator + EPSILON >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafety(false);
      }
    }

    function snapshot(state) {
      return state ? {
        towerId: state.towerId,
        cellId: state.cellId,
        load: state.load,
        overloaded: state.overloaded,
        laneVisible: state.laneVisible,
        active: state.active,
        bosEndpointIds: state.bosEndpointIds.slice(),
        overloadStableSeconds: state.overloadStableSeconds,
        releaseStableSeconds: state.releaseStableSeconds,
        activationProgress: state.activationProgress,
        releaseProgress: state.releaseProgress,
        lastTransitionReason: state.lastTransitionReason,
        lastTransitionElapsed: state.lastTransitionElapsed
      } : null;
    }

    function runSafety(initial) {
      var next = emptySafety();
      var loadSafety = cellLoadRuntime.getSafetyStatus && cellLoadRuntime.getSafetyStatus();
      var associationSafety = associationRuntime.getSafetyStatus && associationRuntime.getSafetyStatus();
      if (!loadSafety || loadSafety.fatal === true || !associationSafety || associationSafety.fatal === true) {
        next.dependencyErrors += 1;
        next.errors.push("Cell-load or association dependency has a fatal error.");
      }
      var ids = Object.keys(cellsByTowerId);
      if (ids.length !== finite((plan.expectedCounts || {}).towerIndicators, 5)) {
        next.expectedCountErrors += 1;
        next.errors.push("Automatic priority does not track exactly five cells.");
      }
      ids.forEach(function (towerId) {
        var state = cellsByTowerId[towerId];
        if (!cellLoadRuntime.getCell(towerId)) {
          next.unknownCellErrors += 1;
          next.errors.push("Unknown priority cell: " + towerId);
        }
        if (!isFinite(state.load) || state.load < 0 || state.load > 100) {
          next.invalidLoadErrors += 1;
          next.errors.push("Invalid cell load: " + towerId);
        }
        if (state.active && state.bosEndpointIds.length === 0) {
          next.priorityWithoutBosErrors += 1;
          next.errors.push("Priority active without a BOS endpoint: " + towerId);
        }
        if (state.active && state.overloaded && state.overloadStableSeconds + EPSILON < activationDelay) {
          next.activationTimingErrors += 1;
          next.errors.push("Priority activated before the stable overload delay: " + towerId);
        }
        if (state.active && state.load < releaseThreshold && state.releaseStableSeconds > releaseDelay + 0.26) {
          next.releaseTimingErrors += 1;
          next.errors.push("Priority remained active beyond the release delay: " + towerId);
        }
      });
      if (resetPending) {
        var leaked = ids.some(function (towerId) {
          var state = cellsByTowerId[towerId];
          return state.active || state.overloadStableSeconds > EPSILON || state.releaseStableSeconds > EPSILON;
        });
        if (leaked) {
          next.resetLeakErrors += 1;
          next.errors.push("Automatic priority state leaked after reset.");
        }
        resetPending = false;
      }
      safety = finalizeSafety(next);
      if (initial || safety.failed) logSafety(safety);
    }

    function reset() {
      if (disposed) return false;
      Object.keys(cellsByTowerId).forEach(function (towerId) {
        var state = cellsByTowerId[towerId];
        state.load = 0;
        state.overloaded = false;
        state.laneVisible = false;
        state.active = false;
        state.bosEndpointIds = [];
        state.overloadStableSeconds = 0;
        state.releaseStableSeconds = 0;
        state.activationProgress = 0;
        state.releaseProgress = 0;
        state.lastTransitionReason = "RESET";
        state.lastTransitionElapsed = 0;
      });
      transitionHistory.length = 0;
      safetyAccumulator = 0;
      resetPending = true;
      runSafety(false);
      return safety.status === "PASSED";
    }

    function dispose() {
      disposed = true;
      cellsByTowerId = Object.create(null);
      transitionHistory.length = 0;
    }

    ensureCells();
    runSafety(true);

    return {
      update: update,
      reset: reset,
      getCellState: function (towerId) { return snapshot(cellsByTowerId[towerId]); },
      getAllCellStates: function () { return Object.keys(cellsByTowerId).sort().map(function (towerId) { return snapshot(cellsByTowerId[towerId]); }); },
      getActiveCellForEndpoint: function (endpointId) {
        var association = associationRuntime.getAssociation(endpointId);
        return association && association.active ? snapshot(cellsByTowerId[association.servingTowerId]) : null;
      },
      isPriorityActiveForEndpoint: function (endpointId) {
        var association = associationRuntime.getAssociation(endpointId);
        var state = association && association.active ? cellsByTowerId[association.servingTowerId] : null;
        return !!state && state.active && state.bosEndpointIds.indexOf(endpointId) >= 0;
      },
      hasAnyActivePriority: function () { return Object.keys(cellsByTowerId).some(function (towerId) { return cellsByTowerId[towerId].active; }); },
      getTransitionHistory: function () { return copy(transitionHistory); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: dispose
    };
  }

  window.MissionBosAutomaticBOSPriorityController = { create: create };
})();
