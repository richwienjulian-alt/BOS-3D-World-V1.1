/* Mission BOS - Build 009N.5
   Pure deterministic radio score and handover decision model.
   Shared by runtime controller and validators. No Three.js dependency.
*/
(function () {
  "use strict";

  var EPSILON = 1e-9;

  function finite(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function distanceXZ(a, b) {
    var dx = Number(a.x) - Number(b.x);
    var dz = Number(a.z) - Number(b.z);
    return Math.sqrt(dx * dx + dz * dz);
  }

  function ellipseGain(position, influence) {
    var radiusX = Math.max(EPSILON, finite(influence.radiusX, 0));
    var radiusZ = Math.max(EPSILON, finite(influence.radiusZ, 0));
    var center = influence.center || {};
    var nx = (Number(position.x) - finite(center.x, 0)) / radiusX;
    var nz = (Number(position.z) - finite(center.z, 0)) / radiusZ;
    var q = nx * nx + nz * nz;
    if (q >= 1) return 0;
    var strength = 1 - q;
    return finite(influence.peakGain, 0) * strength * strength;
  }

  function spatialGain(position, towerDefinition) {
    var total = 0;
    (towerDefinition.coverageInfluences || []).forEach(function (influence) {
      if (influence && influence.type === "ellipse") total += ellipseGain(position, influence);
    });
    return total;
  }

  function scoreTower(position, towerRecord, loadPercent, model) {
    if (!towerRecord || towerRecord.available !== true) return -Infinity;
    var distance = distanceXZ(position, towerRecord.position || towerRecord);
    var maximum = finite(model.maxServiceDistance, 90);
    if (!isFinite(distance) || distance > maximum) return -Infinity;
    var referenceDistance = Math.max(EPSILON, finite(model.referenceDistance, 1));
    var normalizedDistance = Math.max(referenceDistance, distance) / referenceDistance;
    var pathLoss = 10 * finite(model.pathLossExponent, 2.05) * Math.log(normalizedDistance) / Math.LN10;
    var loadPenalty = finite(loadPercent, 0) * finite(model.localCellLoadPenaltyPerPercent, 0.015);
    var calibration = finite(towerRecord.siteCalibrationOffset, 0) + spatialGain(position, towerRecord);
    return finite(model.referenceScore, 0) - pathLoss - loadPenalty + calibration;
  }

  function rankTowers(position, towerRecords, loadsByTowerId, model) {
    var ranked = (towerRecords || []).map(function (tower) {
      return {
        tower: tower,
        towerId: tower.id,
        score: scoreTower(position, tower, loadsByTowerId ? loadsByTowerId[tower.id] : 0, model)
      };
    }).filter(function (entry) {
      return isFinite(entry.score);
    });
    ranked.sort(function (a, b) {
      if (Math.abs(a.score - b.score) > EPSILON) return b.score - a.score;
      return String(a.towerId).localeCompare(String(b.towerId));
    });
    return ranked;
  }

  function createDecisionState() {
    return {
      servingTowerId: null,
      servingScore: null,
      candidateTowerId: null,
      candidateScore: null,
      candidateAdvantage: null,
      candidateSince: null,
      candidateProgress: 0,
      lastHandoverTime: -Infinity,
      confirmedHandoverCount: 0,
      status: "UNATTACHED"
    };
  }

  function clearCandidate(state) {
    state.candidateTowerId = null;
    state.candidateScore = null;
    state.candidateAdvantage = null;
    state.candidateSince = null;
    state.candidateProgress = 0;
  }

  function updateDecision(state, observation) {
    var model = observation.model || {};
    var now = finite(observation.time, 0);
    var ranked = rankTowers(observation.position, observation.towers, observation.loadsByTowerId, model);
    var best = ranked.length ? ranked[0] : null;
    var event = null;

    if (!best) {
      state.servingTowerId = null;
      state.servingScore = null;
      clearCandidate(state);
      state.status = "UNSERVED";
      return { state: state, event: null, ranked: ranked };
    }

    if (!state.servingTowerId) {
      state.servingTowerId = best.towerId;
      state.servingScore = best.score;
      state.lastHandoverTime = now;
      state.status = "ATTACHED";
      clearCandidate(state);
      return { state: state, event: null, ranked: ranked, initialAttach: true };
    }

    var servingEntry = null;
    for (var i = 0; i < ranked.length; i += 1) {
      if (ranked[i].towerId === state.servingTowerId) servingEntry = ranked[i];
    }
    if (!servingEntry) {
      state.servingTowerId = best.towerId;
      state.servingScore = best.score;
      state.lastHandoverTime = now;
      state.status = "RECOVERED_ATTACH";
      clearCandidate(state);
      return { state: state, event: null, ranked: ranked, recoveredAttach: true };
    }

    state.servingScore = servingEntry.score;
    var advantage = best.score - servingEntry.score;
    var dwellSatisfied = now - state.lastHandoverTime + EPSILON >= finite(model.minimumDwellSeconds, 3);
    var marginSatisfied = best.towerId !== state.servingTowerId && advantage + EPSILON >= finite(model.handoverMargin, 1.2);

    if (!dwellSatisfied || !marginSatisfied) {
      clearCandidate(state);
      state.status = "ATTACHED";
      return { state: state, event: null, ranked: ranked };
    }

    if (state.candidateTowerId !== best.towerId) {
      state.candidateTowerId = best.towerId;
      state.candidateScore = best.score;
      state.candidateAdvantage = advantage;
      state.candidateSince = now;
      state.candidateProgress = 0;
      state.status = "HANDOVER_CANDIDATE";
      return { state: state, event: null, ranked: ranked, candidateStarted: true };
    }

    state.candidateScore = best.score;
    state.candidateAdvantage = advantage;
    state.candidateProgress = Math.max(0, Math.min(1, (now - state.candidateSince) / Math.max(EPSILON, finite(model.timeToTriggerSeconds, 0.75))));
    state.status = "HANDOVER_CANDIDATE";

    if (state.candidateProgress + EPSILON >= 1) {
      event = {
        fromTowerId: state.servingTowerId,
        toTowerId: state.candidateTowerId,
        time: now,
        servingScore: state.servingScore,
        candidateScore: state.candidateScore,
        candidateAdvantage: state.candidateAdvantage,
        triggerDurationSeconds: now - state.candidateSince,
        reason: "margin-and-time-to-trigger"
      };
      state.servingTowerId = state.candidateTowerId;
      state.servingScore = state.candidateScore;
      state.lastHandoverTime = now;
      state.confirmedHandoverCount += 1;
      state.status = "HANDOVER_CONFIRMED";
      clearCandidate(state);
    }

    return { state: state, event: event, ranked: ranked };
  }

  function snapshot(state) {
    return copy(state);
  }

  window.MissionBosNetworkRadioModel = {
    distanceXZ: distanceXZ,
    scoreTower: scoreTower,
    rankTowers: rankTowers,
    createDecisionState: createDecisionState,
    updateDecision: updateDecision,
    snapshot: snapshot
  };
})();
