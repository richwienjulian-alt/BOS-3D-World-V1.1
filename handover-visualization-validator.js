/* Mission BOS - Build 009N.5
   Structural validator for candidate and confirmed handover visualization.
   Association references are validated by the shared V3 radio-model validator.
*/
(function () {
  "use strict";

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      var item = items[i];
      if (item && (item.id === id || item.referenceId === id || item.towerId === id)) return item;
    }
    return null;
  }

  function sameArray(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
    return true;
  }

  function unique(items) {
    var seen = Object.create(null);
    var duplicates = [];
    (items || []).forEach(function (item) {
      var id = item && (item.id || item);
      if (!id) return;
      if (seen[id]) duplicates.push(id);
      seen[id] = true;
    });
    return duplicates;
  }

  function addError(errors, counts, key, id, detail) {
    counts[key] += 1;
    errors.push({ category: key, id: id || "", detail: detail || null });
  }

  function countFixedServingTowerDefinitions(communicationPlan) {
    var count = 0;
    if (communicationPlan && communicationPlan.communicationStory && communicationPlan.communicationStory.servingTowerId) count += 1;
    ((communicationPlan && communicationPlan.endpoints) || []).forEach(function (endpoint) {
      if (endpoint && endpoint.kind === "tower") count += 1;
    });
    (((communicationPlan && communicationPlan.bosLinks) || []).concat((communicationPlan && communicationPlan.civilianLinks) || [])).forEach(function (link) {
      if (!link) return;
      if (link.fixedTowerId || link.servingTowerId) count += 1;
      if (/COMM_TOWER_/i.test(String(link.from || "")) || /COMM_TOWER_/i.test(String(link.to || ""))) count += 1;
    });
    return count;
  }

  function profileByState(cellLoadPlan, stateId) {
    return ((cellLoadPlan && cellLoadPlan.missionStateProfiles) || []).filter(function (profile) {
      return profile && profile.stateId === stateId;
    })[0] || null;
  }

  function validate(layout, incidentPlan, missionPlan, scenePlan, associationPlan, cellLoadPlan, communicationPlan, plan) {
    var keys = [
      "sourceDependencyErrors", "sourcePhaseErrors", "policyErrors", "handoverPolicyErrors",
      "endpointReferenceErrors", "towerReferenceErrors", "sequenceErrors", "duplicateIdErrors",
      "ambientLoadPolicyErrors", "sameCellPriorityStoryErrors", "spectatorStoryErrors",
      "dashboardPolicyErrors", "fixedServingTowerErrors", "stateVisibilityErrors", "expectedCountErrors"
    ];
    var counts = {};
    keys.forEach(function (key) { counts[key] = 0; });
    var errors = [];
    var associationValidator = window.MissionBosNetworkAssociationValidator;
    var radioModel = window.MissionBosNetworkRadioModel;
    var responsePlan = window.MISSION_BOS_RESPONSE_VEHICLE_PLAN;

    if (!layout || !incidentPlan || !missionPlan || !scenePlan || !associationPlan || !cellLoadPlan ||
        !communicationPlan || !plan || !associationValidator || !radioModel || !responsePlan) {
      addError(errors, counts, "sourceDependencyErrors", "sources", "One or more source plans, validators or the shared radio model are missing.");
      return createResult(errors, counts, {});
    }

    if (plan.buildBase !== "009N.4 PASSED" || plan.phase !== "009N.5 Realistic Handover Decision Visualization" ||
        associationPlan.buildBase !== "009N.4 PASSED" || associationPlan.phase !== "009N.5 Realistic Association, Handover & Same-Cell Calibration" ||
        cellLoadPlan.phase !== "009N.5 Local Cell Load Compatibility" ||
        communicationPlan.phase !== "009N.5 Realistic Association Communication Compatibility") {
      addError(errors, counts, "sourcePhaseErrors", "phase", {
        plan: plan.phase,
        association: associationPlan.phase,
        cellLoad: cellLoadPlan.phase,
        communication: communicationPlan.phase
      });
    }

    var policy = plan.policy || {};
    ["cityGeometryChangesAllowed", "staticPropChangesAllowed", "trafficChangesAllowed", "pedestrianChangesAllowed",
      "responseVehicleChangesAllowed", "missionStateChangesAllowed", "cellLoadValuesChangesAllowed",
      "automaticBOSActivationAllowed", "automaticCameraMovementAllowed", "newPhysicalActorsAllowed",
      "inventedIndividualNetworkEndpointsAllowed", "fixedServingTowerAllowed", "fullRadioPlanningClaimed",
      "newStandalonePanelAllowed", "runtimeRandomization"].forEach(function (key) {
      if (policy[key] !== false) addError(errors, counts, "policyErrors", key, policy[key]);
    });
    ["visualizationOnly", "associationAlgorithmChangesAllowed", "visualizationIsSimplifiedAndSymbolic",
      "rightDashboardMustRemain", "fileProtocolRequired"].forEach(function (key) {
      if (policy[key] !== true) addError(errors, counts, "policyErrors", key, policy[key]);
    });

    var handover = plan.handoverVisualization || {};
    var decision = plan.decisionVisualization || {};
    var candidateLine = decision.candidateLine || {};
    if (handover.eventSource !== "MissionBosNetworkAssociationController.getHandoverHistory" ||
        handover.candidateSource !== "MissionBosNetworkAssociationController.getCandidateState" ||
        !Array.isArray(handover.trackedEndpointIds) || handover.trackedEndpointIds.length !== 2 ||
        Number(handover.crossFadeSeconds) !== 0.9 || Number(handover.maxConcurrentEffects) !== 2 ||
        handover.consumeEachEventOnce !== true || handover.clearEffectsOnMissionReset !== true ||
        decision.candidateSource !== "MissionBosNetworkAssociationController.getCandidateState" ||
        decision.confirmedEventSource !== "MissionBosNetworkAssociationController.getHandoverHistory" ||
        decision.candidateIsNotConfirmedHandover !== true ||
        Number(candidateLine.visibleAfterProgress) !== 0.25 || Number(candidateLine.maximumOpacity) > 0.32 ||
        candidateLine.mustDisappearIfCandidateResets !== true || decision.noDualFullStrengthLinks !== true ||
        decision.clearAllCandidateVisualsOnReset !== true ||
        !decision.servingLineDuringCandidate || decision.servingLineDuringCandidate.remainsPrimary !== true) {
      addError(errors, counts, "handoverPolicyErrors", "handoverVisualization", { handover: handover, decision: decision });
    }

    unique(handover.trackedEndpointIds || []).forEach(function (id) {
      addError(errors, counts, "duplicateIdErrors", id, "Duplicate tracked endpoint.");
    });
    unique(handover.expectedSequences || []).forEach(function (id) {
      addError(errors, counts, "duplicateIdErrors", id, "Duplicate sequence definition.");
    });

    (handover.trackedEndpointIds || []).forEach(function (endpointId) {
      var endpoint = findById(associationPlan.mobileEndpoints || [], endpointId);
      if (!endpoint || endpoint.kind !== "response-vehicle" || endpoint.channel !== "BOS") {
        addError(errors, counts, "endpointReferenceErrors", endpointId, endpoint);
      }
    });

    (plan.ambientCivilianLoadVisualization && plan.ambientCivilianLoadVisualization.towerIds || []).forEach(function (towerId) {
      if (!findById(layout.mobileTowers || [], towerId) || !findById(cellLoadPlan.cells || [], towerId)) {
        addError(errors, counts, "towerReferenceErrors", towerId, "Tower or cell-load reference missing.");
      }
    });

    var associationValidation = associationValidator.validate(layout, responsePlan, incidentPlan, scenePlan, associationPlan, cellLoadPlan);
    if (!associationValidation || associationValidation.status !== "PASSED") {
      addError(errors, counts, "sequenceErrors", "associationV3", associationValidation && associationValidation.errors);
    } else {
      (handover.expectedSequences || []).forEach(function (expected) {
        var result = (associationValidation.routeResults || []).filter(function (route) { return route.id === expected.id; })[0];
        if (!result || !sameArray(result.sequence, expected.expectedSequence) ||
            result.events.length !== Number(expected.expectedConfirmedHandovers)) {
          addError(errors, counts, "sequenceErrors", expected.id, result);
        }
      });
    }

    var ambient = plan.ambientCivilianLoadVisualization || {};
    var visibleMap = ambient.visibleParticlesByStatus || {};
    if (ambient.enabled !== true || ambient.source !== "MissionBosCellLoadController" ||
        !Array.isArray(ambient.towerIds) || ambient.towerIds.length !== 5 ||
        Number(ambient.fixedParticlesPerTower) !== 12 || Number(ambient.totalParticleMeshes) !== 60 ||
        Number(visibleMap.NORMAL) !== 4 || Number(visibleMap.HIGH_LOAD) !== 8 ||
        Number(visibleMap.OVERLOADED) !== 12 || Number(visibleMap.FAILED) !== 0 ||
        ambient.deterministicPlacement !== true || ambient.noLinesToInventedEndpoints !== true ||
        ambient.civilianLoadMustRemainVisibleAfterBOS !== true ||
        !sameArray(ambient.missionPeakOverloadedTowerIds, ["MAST_A", "MAST_B"])) {
      addError(errors, counts, "ambientLoadPolicyErrors", "ambientCivilianLoadVisualization", ambient);
    }

    var story = plan.priorityStory || {};
    var assignments = associationValidation && associationValidation.incidentAssignments || {};
    var sharedCount = Object.keys(assignments).filter(function (id) {
      return id.indexOf("NET_PHONE_") === 0 && assignments[id] === story.incidentServingTowerId;
    }).length;
    var secondaryCount = Object.keys(assignments).filter(function (id) {
      return id.indexOf("NET_PHONE_") === 0 && assignments[id] === "MAST_B";
    }).length;
    var bosCount = (story.bosEndpointIds || []).filter(function (id) {
      return assignments[id] === story.incidentServingTowerId;
    }).length;
    var overloaded = profileByState(cellLoadPlan, "OVERLOADED");
    var threshold = Number((cellLoadPlan.loadModel || {}).overloadedAtOrAbove);
    if (!overloaded || Number(overloaded.targets.MAST_A) < threshold || Number(overloaded.targets.MAST_B) < threshold ||
        story.incidentServingTowerId !== "MAST_A" || story.incidentServingTowerMustBeOverloaded !== true ||
        bosCount !== 2 || sharedCount !== 2 || secondaryCount !== 4 ||
        Number(story.visibleCivilianEndpointsAtIncidentServingTower) !== 2 ||
        Number(story.visibleCivilianEndpointsAtSecondaryTower) !== 4 ||
        story.priorityFollowsCurrentServingCell !== true || Number(story.civilianLoadReductionAfterBOS) !== 0 ||
        story.showBOSStableWhileCivilianLoadRemainsHigh !== true) {
      addError(errors, counts, "sameCellPriorityStoryErrors", "priorityStory", {
        assignments: assignments, bosCount: bosCount, sharedCount: sharedCount, secondaryCount: secondaryCount, story: story
      });
    }

    var phoneEndpoints = (associationPlan.mobileEndpoints || []).filter(function (item) { return item && item.kind === "mission-phone"; });
    var phoneActors = (scenePlan.actors || []).filter(function (actor) { return actor && actor.role === "spectator" && actor.phone === true; });
    if (phoneEndpoints.length !== 6 || phoneActors.length !== 6 || Number(story.visibleSpectatorPhoneCount) !== 6 ||
        story.spectatorPhoneServingTowerId !== null) {
      addError(errors, counts, "spectatorStoryErrors", "phones", { phoneEndpoints: phoneEndpoints.length, phoneActors: phoneActors.length, story: story });
    }

    var dashboard = plan.dashboard || {};
    if (dashboard.placement !== "inside-existing-right-dashboard" || dashboard.reuseExistingLastHandoverField !== true ||
        dashboard.newStandalonePanelAllowed !== false || dashboard.dashboardRedesignAllowed !== false ||
        dashboard.compactEventEmphasisAllowed !== true || !dashboard.symbolicHint ||
        dashboard.permanentNewExplanationBlocksAllowed !== false) {
      addError(errors, counts, "dashboardPolicyErrors", "dashboard", dashboard);
    }

    var fixedDefinitions = countFixedServingTowerDefinitions(communicationPlan);
    if (fixedDefinitions !== 0) addError(errors, counts, "fixedServingTowerErrors", "communicationPlan", fixedDefinitions);

    var stateOrder = missionPlan.stateOrder || [];
    var visibility = plan.visibilityPolicy || {};
    stateOrder.forEach(function (stateId) {
      var item = visibility[stateId];
      if (!item || typeof item.handoverEffects !== "boolean" || typeof item.ambientLoadFields !== "boolean") {
        addError(errors, counts, "stateVisibilityErrors", stateId, item);
      }
    });
    Object.keys(visibility).forEach(function (stateId) {
      if (stateOrder.indexOf(stateId) < 0) addError(errors, counts, "stateVisibilityErrors", stateId, "Unknown state.");
    });

    var expectedSequences = handover.expectedSequences || [];
    var actual = {
      trackedEndpoints: (handover.trackedEndpointIds || []).length,
      sequenceDefinitions: expectedSequences.length,
      outboundSequences: expectedSequences.filter(function (item) { return item.direction === "outbound"; }).length,
      returnSequences: expectedSequences.filter(function (item) { return item.direction === "return"; }).length,
      ambientCellFields: (ambient.towerIds || []).length,
      ambientParticleMeshes: Number(ambient.totalParticleMeshes || 0),
      missionPeakOverloadedCells: (ambient.missionPeakOverloadedTowerIds || []).length,
      visibleSpectatorPhones: phoneEndpoints.length,
      bosEndpointsAtOverloadedIncidentCell: bosCount,
      fixedServingTowerDefinitions: fixedDefinitions,
      automaticBOSActivations: policy.automaticBOSActivationAllowed === true ? 1 : 0,
      automaticCameraMovements: policy.automaticCameraMovementAllowed === true ? 1 : 0,
      newStandalonePanels: policy.newStandalonePanelAllowed === true ? 1 : 0,
      newPhysicalActors: policy.newPhysicalActorsAllowed === true ? 1 : 0,
      newIndividualNetworkEndpoints: policy.inventedIndividualNetworkEndpointsAllowed === true ? 1 : 0,
      candidateEffectSlots: Number(handover.maxConcurrentEffects || 0),
      sharedCellVisibleCivilianEndpoints: sharedCount,
      secondaryCellVisibleCivilianEndpoints: secondaryCount,
      confirmedHandoverEventsPerFullMissionCycle: expectedSequences.reduce(function (sum, item) {
        return sum + Number(item.expectedConfirmedHandovers || 0);
      }, 0)
    };
    Object.keys(plan.expectedCounts || {}).forEach(function (key) {
      if (Number(actual[key]) !== Number(plan.expectedCounts[key])) {
        addError(errors, counts, "expectedCountErrors", key, { expected: plan.expectedCounts[key], actual: actual[key] });
      }
    });

    return createResult(errors, counts, actual);
  }

  function createResult(errors, counts, actual) {
    return {
      title: "MISSION BOS COMMUNICATION & HANDOVER VISUALIZATION VALIDATION",
      counts: counts,
      actual: actual || {},
      errors: errors,
      status: errors.length === 0 ? "PASSED" : "FAILED"
    };
  }

  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    Object.keys(result.counts || {}).forEach(function (key) { console[method](key + ": " + result.counts[key]); });
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosHandoverVisualizationValidator = { validate: validate, logResult: logResult };
})();
