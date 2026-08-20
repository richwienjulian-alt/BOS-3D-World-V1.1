/* Mission BOS - Build 009N.5
   Structural validator for dynamic Telekom communication with realistic V3 association.
   Route and incident association references are delegated to the shared V3 validator,
   which uses MissionBosNetworkRadioModel as the only score implementation.
*/
(function () {
  "use strict";

  var VALID_ENDPOINT_KINDS = ["building", "response-vehicle", "mission-phone"];
  var VALID_LINK_ROLES = ["dispatch-to-serving-tower", "serving-tower-to-mobile", "mobile-to-serving-tower"];
  var VALID_BOS_MODES = ["standby", "normal", "high-load", "degraded", "prioritizing", "stable", "returning-priority", "failed"];
  var VALID_CIVILIAN_MODES = ["normal", "rising", "congested", "recovering", "failed"];

  function finite(value) {
    var number = Number(value);
    return isFinite(number) ? number : null;
  }

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      var item = items[i];
      if (item && (item.id === id || item.referenceId === id || item.towerId === id)) return item;
    }
    return null;
  }

  function addError(errors, counts, key, id, detail) {
    counts[key] += 1;
    errors.push({ category: key, id: id || "", detail: detail || null });
  }

  function uniqueIds(items) {
    var seen = Object.create(null);
    var duplicates = [];
    (items || []).forEach(function (item) {
      if (!item || !item.id) return;
      if (seen[item.id]) duplicates.push(item.id);
      seen[item.id] = true;
    });
    return duplicates;
  }

  function countBy(items, predicate) {
    var count = 0;
    (items || []).forEach(function (item) { if (predicate(item)) count += 1; });
    return count;
  }

  function countFixedServingTowerDefinitions(plan) {
    var count = 0;
    if (plan.communicationStory && plan.communicationStory.servingTowerId) count += 1;
    (plan.endpoints || []).forEach(function (endpoint) { if (endpoint && endpoint.kind === "tower") count += 1; });
    (plan.bosLinks || []).concat(plan.civilianLinks || []).forEach(function (link) {
      if (!link) return;
      if (link.fixedTowerId || link.servingTowerId) count += 1;
      if (/COMM_TOWER_/i.test(String(link.from || "")) || /COMM_TOWER_/i.test(String(link.to || ""))) count += 1;
    });
    return count;
  }

  function loadProfile(cellLoadPlan, stateId) {
    return (cellLoadPlan.missionStateProfiles || []).filter(function (profile) {
      return profile && profile.stateId === stateId;
    })[0] || null;
  }

  function validate(layout, responsePlan, missionPlan, scenePlan, communicationPlan, associationPlan, cellLoadPlan) {
    var errors = [];
    var counts = {
      sourceDependencyErrors: 0,
      sourcePhaseErrors: 0,
      experiencePolicyErrors: 0,
      endpointDefinitionErrors: 0,
      endpointReferenceErrors: 0,
      endpointDuplicateErrors: 0,
      associationReferenceErrors: 0,
      linkDefinitionErrors: 0,
      linkReferenceErrors: 0,
      linkDuplicateErrors: 0,
      spectatorPhoneReferenceErrors: 0,
      servingTowerSelectionErrors: 0,
      fixedServingTowerErrors: 0,
      statePresentationErrors: 0,
      networkPolicyErrors: 0,
      dashboardPolicyErrors: 0,
      cellLoadReferenceErrors: 0,
      cellLoadPolicyErrors: 0,
      expectedCountErrors: 0
    };
    var incidentPlan = window.MISSION_BOS_INCIDENT_RESPONSE_PLAN;
    var associationValidator = window.MissionBosNetworkAssociationValidator;
    var radioModel = window.MissionBosNetworkRadioModel;

    if (!layout || !responsePlan || !missionPlan || !scenePlan || !communicationPlan || !associationPlan || !cellLoadPlan ||
        !incidentPlan || !associationValidator || !radioModel) {
      addError(errors, counts, "sourceDependencyErrors", "root", "One or more plans, the V3 association validator or the shared radio model are missing.");
      return createResult(errors, counts, {});
    }

    if (communicationPlan.buildBase !== "009N.4 PASSED" ||
        communicationPlan.phase !== "009N.5 Realistic Association Communication Compatibility" ||
        associationPlan.buildBase !== "009N.4 PASSED" ||
        associationPlan.phase !== "009N.5 Realistic Association, Handover & Same-Cell Calibration") {
      addError(errors, counts, "sourcePhaseErrors", "phase", {
        communicationBuild: communicationPlan.buildBase,
        communicationPhase: communicationPlan.phase,
        associationBuild: associationPlan.buildBase,
        associationPhase: associationPlan.phase
      });
    }

    var policy = communicationPlan.experiencePolicy || {};
    ["runtimeRandomization", "cameraTakeoverAllowed", "cityGeometryChangesAllowed", "staticPropChangesAllowed",
      "trafficRouteChangesAllowed", "pedestrianRouteChangesAllowed", "responseRouteChangesAllowed",
      "missionStateChangesAllowed", "networkLoadPolicyChangesAllowed", "automaticBOSActivationAllowed",
      "civilianLoadMayDropAfterBOSActivation", "legacyCommunicationRendererAllowed",
      "productPerformanceClaimsAllowed", "fixedTechnicalKpiClaimsAllowed", "fixedServingTowerAllowed"].forEach(function (key) {
      if (policy[key] !== false) addError(errors, counts, "experiencePolicyErrors", key, policy[key]);
    });
    ["spectatorPhonesRemainVisibleAfterBOS", "visualizationIsSymbolic", "fileProtocolRequired",
      "dynamicNetworkAssociationRequired", "localCellLoadRequired"].forEach(function (key) {
      if (policy[key] !== true) addError(errors, counts, "experiencePolicyErrors", key, policy[key]);
    });

    if (!communicationPlan.communicationStory ||
        communicationPlan.communicationStory.associationModelId !== "SIMPLIFIED_RADIO_HANDOVER_V3" ||
        associationPlan.selectionModel.id !== "SIMPLIFIED_RADIO_HANDOVER_V3" ||
        associationPlan.selectionModel.radioModelProvider !== "MissionBosNetworkRadioModel") {
      addError(errors, counts, "cellLoadPolicyErrors", "associationModelId", communicationPlan.communicationStory);
    }

    var associationValidation = associationValidator.validate(
      layout,
      responsePlan,
      incidentPlan,
      scenePlan,
      associationPlan,
      cellLoadPlan
    );
    if (!associationValidation || associationValidation.status !== "PASSED") {
      addError(errors, counts, "servingTowerSelectionErrors", "associationV3", associationValidation && associationValidation.errors);
    } else {
      var assignments = associationValidation.incidentAssignments || {};
      var expectedAssignments = (associationPlan.referenceCalibration || {}).incidentAssignments || {};
      Object.keys(expectedAssignments).forEach(function (endpointId) {
        if (assignments[endpointId] !== expectedAssignments[endpointId]) {
          addError(errors, counts, "servingTowerSelectionErrors", endpointId, {
            expected: expectedAssignments[endpointId], actual: assignments[endpointId]
          });
        }
      });
    }

    var loadCells = cellLoadPlan.cells || [];
    if (loadCells.length !== 5) addError(errors, counts, "cellLoadReferenceErrors", "cells", loadCells.length);
    loadCells.forEach(function (cell) {
      if (!cell || !findById(layout.mobileTowers || [], cell.towerId)) {
        addError(errors, counts, "cellLoadReferenceErrors", cell && cell.id, cell && cell.towerId);
      }
    });
    var overloadedLoad = loadProfile(cellLoadPlan, "OVERLOADED");
    ["BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"].forEach(function (stateId) {
      var profile = loadProfile(cellLoadPlan, stateId);
      if (!profile || !overloadedLoad || JSON.stringify(profile.targets) !== JSON.stringify(overloadedLoad.targets)) {
        addError(errors, counts, "cellLoadPolicyErrors", stateId, profile);
      }
    });
    if (!cellLoadPlan.policy || cellLoadPlan.policy.civilianLoadMayDropAfterBOSActivation !== false ||
        !cellLoadPlan.bosPriority || Number(cellLoadPlan.bosPriority.civilianLoadReduction) !== 0 ||
        !cellLoadPlan.associationIntegration ||
        cellLoadPlan.associationIntegration.requiredSelectionModelId !== "SIMPLIFIED_RADIO_HANDOVER_V3" ||
        cellLoadPlan.associationIntegration.radioModelProvider !== "MissionBosNetworkRadioModel") {
      addError(errors, counts, "cellLoadPolicyErrors", "localCellLoadPolicy", cellLoadPlan.associationIntegration);
    }

    var associationEndpoints = associationPlan.mobileEndpoints || [];
    var associationById = Object.create(null);
    associationEndpoints.forEach(function (item) { associationById[item.id] = item; });

    var endpoints = communicationPlan.endpoints || [];
    var endpointById = Object.create(null);
    uniqueIds(endpoints).forEach(function (id) { addError(errors, counts, "endpointDuplicateErrors", id, null); });
    var buildings = layout.buildings || [];
    var responseVehicles = responsePlan.vehicles || [];
    var sceneActors = scenePlan.actors || [];

    endpoints.forEach(function (endpoint) {
      if (!endpoint || !endpoint.id || VALID_ENDPOINT_KINDS.indexOf(endpoint.kind) < 0 ||
          !endpoint.referenceId || finite(endpoint.yOffset) === null) {
        addError(errors, counts, "endpointDefinitionErrors", endpoint && endpoint.id, endpoint);
        return;
      }
      endpointById[endpoint.id] = endpoint;
      if (endpoint.kind === "building") {
        if (!findById(buildings, endpoint.referenceId)) addError(errors, counts, "endpointReferenceErrors", endpoint.id, endpoint.referenceId);
        if (endpoint.associationEndpointId) addError(errors, counts, "associationReferenceErrors", endpoint.id, "Fixed endpoint must not use association.");
      } else if (endpoint.kind === "response-vehicle") {
        if (!findById(responseVehicles, endpoint.referenceId)) addError(errors, counts, "endpointReferenceErrors", endpoint.id, endpoint.referenceId);
        var responseAssociation = associationById[endpoint.associationEndpointId];
        if (!responseAssociation || responseAssociation.kind !== "response-vehicle" || responseAssociation.referenceId !== endpoint.referenceId) {
          addError(errors, counts, "associationReferenceErrors", endpoint.id, endpoint.associationEndpointId);
        }
      } else if (endpoint.kind === "mission-phone") {
        var actor = findById(sceneActors, endpoint.referenceId);
        if (!actor || actor.role !== "spectator" || actor.phone !== true) {
          addError(errors, counts, "spectatorPhoneReferenceErrors", endpoint.id, endpoint.referenceId);
        }
        var phoneAssociation = associationById[endpoint.associationEndpointId];
        if (!phoneAssociation || phoneAssociation.kind !== "mission-phone" || phoneAssociation.referenceId !== endpoint.referenceId) {
          addError(errors, counts, "associationReferenceErrors", endpoint.id, endpoint.associationEndpointId);
        }
      }
    });

    var allLinks = [];
    (communicationPlan.bosLinks || []).forEach(function (link) { allLinks.push(link); });
    (communicationPlan.civilianLinks || []).forEach(function (link) { allLinks.push(link); });
    uniqueIds(allLinks).forEach(function (id) { addError(errors, counts, "linkDuplicateErrors", id, null); });
    allLinks.forEach(function (link) {
      if (!link || !link.id || VALID_LINK_ROLES.indexOf(link.role) < 0 ||
          !link.associationEndpointId || finite(link.packetCount) === null || Number(link.packetCount) < 1) {
        addError(errors, counts, "linkDefinitionErrors", link && link.id, link);
        return;
      }
      var association = associationById[link.associationEndpointId];
      if (!association) addError(errors, counts, "associationReferenceErrors", link.id, link.associationEndpointId);
      if (link.role === "dispatch-to-serving-tower") {
        if (!link.from || !endpointById[link.from] || endpointById[link.from].kind !== "building" || link.to) {
          addError(errors, counts, "linkReferenceErrors", link.id, link);
        }
      } else if (link.role === "serving-tower-to-mobile") {
        if (!link.to || !endpointById[link.to] || endpointById[link.to].associationEndpointId !== link.associationEndpointId || link.from) {
          addError(errors, counts, "linkReferenceErrors", link.id, link);
        }
      } else if (link.role === "mobile-to-serving-tower") {
        if (!link.from || !endpointById[link.from] || endpointById[link.from].associationEndpointId !== link.associationEndpointId || link.to ||
            !association || association.kind !== "mission-phone") {
          addError(errors, counts, "linkReferenceErrors", link.id, link);
        }
      }
    });

    var fixedDefinitions = countFixedServingTowerDefinitions(communicationPlan);
    if (fixedDefinitions !== 0 || !communicationPlan.communicationStory ||
        communicationPlan.communicationStory.servingTowerMode !== "dynamic-network-association") {
      addError(errors, counts, "fixedServingTowerErrors", "communicationStory", fixedDefinitions);
    }

    var towerReferences = associationPlan.towers || [];
    if (towerReferences.length !== 5) addError(errors, counts, "servingTowerSelectionErrors", "associationTowers", towerReferences.length);
    towerReferences.forEach(function (definition) {
      if (!findById(layout.mobileTowers || [], definition.referenceId)) {
        addError(errors, counts, "servingTowerSelectionErrors", definition.id, definition.referenceId);
      }
    });

    var stateOrder = missionPlan.stateOrder || [];
    var statePresentations = communicationPlan.statePresentation || {};
    stateOrder.forEach(function (stateId) {
      var presentation = statePresentations[stateId];
      if (!presentation || typeof presentation.experienceVisible !== "boolean" ||
          typeof presentation.civilianLinksVisible !== "boolean" ||
          VALID_BOS_MODES.indexOf(presentation.bosMode) < 0 ||
          VALID_CIVILIAN_MODES.indexOf(presentation.civilianMode) < 0 ||
          typeof presentation.priorityActive !== "boolean" || !presentation.bosStatus ||
          !presentation.civilianStatus || !presentation.comparisonText) {
        addError(errors, counts, "statePresentationErrors", stateId, presentation);
      }
    });
    Object.keys(statePresentations).forEach(function (stateId) {
      if (stateOrder.indexOf(stateId) < 0) addError(errors, counts, "statePresentationErrors", stateId, "Unknown state.");
    });

    var overloaded = statePresentations.OVERLOADED || {};
    var bosActive = statePresentations.BOS_ACTIVE || {};
    var stable = statePresentations.COMMS_STABLE || {};
    if (overloaded.bosMode !== "degraded" || overloaded.civilianMode !== "congested" || overloaded.priorityActive !== false) {
      addError(errors, counts, "networkPolicyErrors", "OVERLOADED", overloaded);
    }
    if (bosActive.bosMode !== "prioritizing" || bosActive.civilianMode !== "congested" || bosActive.priorityActive !== true) {
      addError(errors, counts, "networkPolicyErrors", "BOS_ACTIVE", bosActive);
    }
    if (stable.bosMode !== "stable" || stable.civilianMode !== "congested" || stable.priorityActive !== true) {
      addError(errors, counts, "networkPolicyErrors", "COMMS_STABLE", stable);
    }
    var missionNetwork = missionPlan.network || {};
    if (missionNetwork.bosActivationDoesNotReduceCivilianLoad !== true ||
        missionNetwork.bosMayBeActivatedOnlyInState !== "OVERLOADED") {
      addError(errors, counts, "networkPolicyErrors", "missionNetwork", missionNetwork);
    }

    var dashboard = communicationPlan.dashboard || {};
    ["sectionTitle", "civilianChannelLabel", "bosChannelLabel", "pathLabel", "symbolicHint",
      "fireCellLabel", "policeCellLabel", "lastHandoverLabel"].forEach(function (key) {
      if (!dashboard[key]) addError(errors, counts, "dashboardPolicyErrors", key, dashboard[key]);
    });
    if (!dashboard.civilianFillByMode || !dashboard.bosFillByMode ||
        dashboard.cellLoadPlacement !== "inside-existing-right-dashboard" ||
        dashboard.newStandaloneCellLoadPanelAllowed !== false ||
        !Array.isArray(dashboard.cellLoadRows) || dashboard.cellLoadRows.length !== 5 ||
        !dashboard.cellLoadSectionTitle || !dashboard.criticalCellLabel) {
      addError(errors, counts, "dashboardPolicyErrors", "dashboard", dashboard);
    }

    var bosLinks = communicationPlan.bosLinks || [];
    var civilianLinks = communicationPlan.civilianLinks || [];
    var actual = {
      endpoints: endpoints.length + towerReferences.length,
      logicalEndpoints: endpoints.length,
      buildingEndpoints: countBy(endpoints, function (item) { return item.kind === "building"; }),
      towerEndpoints: countBy(endpoints, function (item) { return item.kind === "tower"; }),
      associationTowerMarkers: towerReferences.length,
      responseVehicleEndpoints: countBy(endpoints, function (item) { return item.kind === "response-vehicle"; }),
      missionPhoneEndpoints: countBy(endpoints, function (item) { return item.kind === "mission-phone"; }),
      bosLinks: bosLinks.length,
      civilianLinks: civilianLinks.length,
      bosPackets: bosLinks.reduce(function (sum, link) { return sum + Number(link.packetCount || 0); }, 0),
      civilianPackets: civilianLinks.reduce(function (sum, link) { return sum + Number(link.packetCount || 0); }, 0),
      statePresentations: Object.keys(statePresentations).length,
      endpointMarkers: endpoints.length + towerReferences.length,
      towerHalos: towerReferences.length * ((communicationPlan.visualStyle || {}).towerHaloRadii || []).length,
      servingTowers: towerReferences.length,
      fixedServingTowerDefinitions: fixedDefinitions,
      automaticBOSActivations: policy.automaticBOSActivationAllowed === true ? 1 : 0,
      productPerformanceClaims: policy.productPerformanceClaimsAllowed === true || policy.fixedTechnicalKpiClaimsAllowed === true ? 1 : 0
    };
    Object.keys(communicationPlan.expectedCounts || {}).forEach(function (key) {
      if (Number(actual[key]) !== Number(communicationPlan.expectedCounts[key])) {
        addError(errors, counts, "expectedCountErrors", key, { expected: communicationPlan.expectedCounts[key], actual: actual[key] });
      }
    });

    return createResult(errors, counts, actual);
  }

  function createResult(errors, counts, actual) {
    return {
      title: "MISSION BOS TELEKOM COMMUNICATION EXPERIENCE VALIDATION",
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

  window.MissionBosTelekomCommunicationValidator = { validate: validate, logResult: logResult };
})();
