/* Mission BOS - Build 010P.4
   Dual-mission validator for the symbolic shared-cell capacity model.
*/
(function () {
  "use strict";
  function add(errors, counts, key, id, detail) { counts[key] += 1; errors.push({ category: key, id: id || "", detail: detail == null ? null : detail }); }
  function find(items, id) { for (var i = 0; i < (items || []).length; i += 1) { var x = items[i]; if (x && (x.id === id || x.towerId === id || x.referenceId === id)) return x; } return null; }
  function equal(a, b) { return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every(function (v, i) { return v === b[i]; }); }
  function profile(plan, id) { return ((plan || {}).missionStateProfiles || []).filter(function (x) { return x && x.stateId === id; })[0] || null; }
  function allocate(capacity, civilianDemand, bosDemand, priorityApplied) {
    capacity = Number(capacity); civilianDemand = Number(civilianDemand); bosDemand = Number(bosDemand);
    var civilianServed, civilianUnserved, bosServed, bosUnserved;
    if (priorityApplied) {
      bosServed = Math.min(bosDemand, capacity);
      bosUnserved = Math.max(0, bosDemand - bosServed);
      civilianServed = Math.min(civilianDemand, Math.max(0, capacity - bosServed));
      civilianUnserved = Math.max(0, civilianDemand - civilianServed);
    } else {
      civilianServed = Math.min(civilianDemand, capacity);
      civilianUnserved = Math.max(0, civilianDemand - civilianServed);
      bosServed = Math.min(bosDemand, Math.max(0, capacity - civilianServed));
      bosUnserved = Math.max(0, bosDemand - bosServed);
    }
    return { civilianDemand: civilianDemand, bosDemand: bosDemand, civilianServed: civilianServed,
      civilianUnserved: civilianUnserved, bosServed: bosServed, bosUnserved: bosUnserved,
      totalServed: civilianServed + bosServed };
  }
  function makeResult(errors, counts, actual) {
    return { title: "MISSION BOS CELL CAPACITY DUAL-MISSION VALIDATION", status: errors.length ? "FAILED" : "PASSED",
      counts: counts, actualCounts: actual || {}, errors: errors };
  }

  function validate(layout, mission001Plan, scenePlan, associationPlan, cellLoadPlan, communicationPlan, capacityPlan, mission002Plan, arenaPlan) {
    var keys = ["sourceDependencyErrors", "sourcePhaseErrors", "policyErrors", "modelErrors", "towerReferenceErrors",
      "endpointReferenceErrors", "sameCellStoryErrors", "loadCompatibilityErrors", "allocationFormulaErrors",
      "civilianImpactErrors", "dashboardPolicyErrors", "runtimeContractErrors", "expectedCountErrors"];
    var counts = {}; keys.forEach(function (key) { counts[key] = 0; }); var errors = [];
    if (!layout || !mission001Plan || !scenePlan || !associationPlan || !cellLoadPlan || !communicationPlan || !capacityPlan || !mission002Plan || !arenaPlan) {
      add(errors, counts, "sourceDependencyErrors", "root", "One or more dual-mission capacity sources are missing.");
      return makeResult(errors, counts, {});
    }
    if (capacityPlan.buildBase !== "010P.3 PASSED" || capacityPlan.phase !== "009N.6 Capacity Allocation, Civilian Deprioritization & BOS Priority" ||
        capacityPlan.dualMissionPhase !== "010P.4 Dual-Mission Cell Capacity Compatibility" ||
        cellLoadPlan.phase !== "009N.5 Local Cell Load Compatibility" ||
        cellLoadPlan.dualMissionPhase !== "010P.4 Dual-Mission Local Cell Load Compatibility" || String(mission002Plan.phase).indexOf("010P.4") < 0) {
      add(errors, counts, "sourcePhaseErrors", "phase", { capacity: capacityPlan.phase, cellLoad: cellLoadPlan.phase, mission002: mission002Plan.phase });
    }
    var policy = capacityPlan.policy || {};
    ["cityGeometryChangesAllowed", "staticPropChangesAllowed", "trafficChangesAllowed", "pedestrianChangesAllowed",
      "responseVehicleChangesAllowed", "missionStateChangesAllowed", "associationAlgorithmChangesAllowed",
      "handoverParameterChangesAllowed", "localCellLoadValueChangesAllowed", "automaticBOSActivationAllowed",
      "priorityTriggeredReassociationAllowed", "priorityTriggeredHandoverAllowed", "civilianActorsMayBeRemoved",
      "civilianDevicesMayBeHidden", "newStandalonePanelAllowed", "fullRadioPlanningClaimed", "technicalPerformanceClaimed"].forEach(function (key) {
      if (policy[key] !== false) add(errors, counts, "policyErrors", key, policy[key]);
    });
    ["explicitCivilianDeprioritizationRequired", "sameCellCivilianAndBosRequired", "civilianDemandMustRemainHighAfterPriority",
      "rightDashboardMustRemain", "visualizationIsSimplifiedAndSymbolic", "fileProtocolRequired"].forEach(function (key) {
      if (policy[key] !== true) add(errors, counts, "policyErrors", key, policy[key]);
    });

    var model = capacityPlan.capacityModel || {};
    if (model.id !== "SYMBOLIC_SHARED_CELL_CAPACITY_V1" || Number(model.cellCapacityUnits) !== 100 ||
        Number(model.bosDemandPerEligibleEndpointUnits) !== 12 || Number(model.activationRampSeconds) !== 0.8 ||
        Number(model.evaluationIntervalSeconds) !== 0.1 || Number(model.explicitImpactUnitsPerVisibleSession) !== 8 ||
        Number(model.maximumExplicitAffectedSessionsPerCell) !== 2 ||
        !equal(model.impactModesInOrder, ["DEPRIORITIZED", "DEFERRED"]) ||
        !equal(model.eligibleBosEndpointIds, ["NET_FIRE_01", "NET_POLICE_01", "NET_AMBULANCE_01"]) ||
        (model.visibleCivilianEndpointIds || []).length !== 14) {
      add(errors, counts, "modelErrors", "capacityModel", model);
    }

    if ((cellLoadPlan.cells || []).length !== 5) add(errors, counts, "towerReferenceErrors", "cells", (cellLoadPlan.cells || []).length);
    (cellLoadPlan.cells || []).forEach(function (cell) { if (!find(layout.mobileTowers, cell.towerId)) add(errors, counts, "towerReferenceErrors", cell.towerId, null); });
    var primaryIds = (associationPlan.mobileEndpoints || []).map(function (x) { return x.id; });
    (model.baseVisibleCivilianEndpointIds || []).concat(model.eligibleBosEndpointIds || []).forEach(function (id) {
      if (primaryIds.indexOf(id) < 0) add(errors, counts, "endpointReferenceErrors", id, "Missing primary association endpoint.");
    });
    var arenaIds = (arenaPlan.visiblePhoneEndpoints || []).map(function (x) { return x.id; });
    (model.additionalVisibleCivilianEndpointIds || []).forEach(function (id) {
      if (arenaIds.indexOf(id) < 0) add(errors, counts, "endpointReferenceErrors", id, "Missing Arena association endpoint.");
    });

    var incident = capacityPlan.incidentReference || {};
    var assignments = (cellLoadPlan.associationIntegration || {}).expectedIncidentAssignments || {};
    (incident.expectedBosEndpointIdsOnSharedCell || []).concat(incident.expectedCivilianEndpointIdsOnSharedCell || []).forEach(function (id) {
      if (assignments[id] !== incident.sharedCellId) add(errors, counts, "sameCellStoryErrors", id, assignments[id]);
    });
    (incident.expectedCivilianEndpointIdsOnNeighborCell || []).forEach(function (id) {
      if (assignments[id] !== incident.neighboringHotspotCellId) add(errors, counts, "sameCellStoryErrors", id, assignments[id]);
    });
    var overloaded = profile(cellLoadPlan, "OVERLOADED");
    ["OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE"].forEach(function (stateId) {
      var p = profile(cellLoadPlan, stateId);
      if (!p || !overloaded || JSON.stringify(p.targets) !== JSON.stringify(overloaded.targets)) add(errors, counts, "loadCompatibilityErrors", stateId, p);
    });

    var cap = Number(model.cellCapacityUnits), perBos = Number(model.bosDemandPerEligibleEndpointUnits);
    Object.keys((incident.expectedSettledAllocations || {})).forEach(function (stateId) {
      var priority = stateId !== "OVERLOADED";
      Object.keys(incident.expectedSettledAllocations[stateId] || {}).forEach(function (towerId) {
        var expected = incident.expectedSettledAllocations[stateId][towerId];
        var bosCount = towerId === incident.sharedCellId ? (incident.expectedBosEndpointIdsOnSharedCell || []).length : 0;
        var actual = allocate(cap, expected.civilianDemand, bosCount * perBos, priority);
        ["civilianDemand", "bosDemand", "civilianServed", "civilianUnserved", "bosServed", "bosUnserved"].forEach(function (key) {
          if (Number(actual[key]) !== Number(expected[key])) add(errors, counts, "allocationFormulaErrors", stateId + ":" + towerId + ":" + key, { expected: expected[key], actual: actual[key] });
        });
      });
    });
    var arena = capacityPlan.arenaReference || {};
    if (arena.sharedCellId !== "MAST_E" || !equal(arena.expectedBosEndpointIdsOnSharedCell, ["NET_AMBULANCE_01"]) ||
        (arena.expectedCivilianEndpointIdsOnSharedCell || []).length !== 8 || Number(arena.expectedBosDemand) !== 12 ||
        Number(arena.minimumAffectedVisibleCivilianSessions) < 1) {
      add(errors, counts, "sameCellStoryErrors", "arenaReference", arena);
    }
    [92, 93, 94].forEach(function (demand) {
      var before = allocate(100, demand, 12, false);
      var after = allocate(100, demand, 12, true);
      if (before.bosUnserved < 4 || before.bosUnserved > 6 || after.bosServed !== 12 ||
          after.civilianServed !== 88 || after.civilianUnserved < 4 || after.civilianUnserved > 6) {
        add(errors, counts, "allocationFormulaErrors", "arena:" + demand, { before: before, after: after });
      }
    });

    var impact = capacityPlan.civilianImpact || {};
    if (impact.keepActorVisible !== true || impact.keepPhoneVisible !== true || impact.keepAssociationUnchanged !== true ||
        !impact.states || !impact.states.DEPRIORITIZED || !impact.states.DEFERRED) add(errors, counts, "civilianImpactErrors", "impact", impact);
    var dashboard = capacityPlan.dashboard || {};
    if (dashboard.placement !== "inside-existing-right-dashboard" || dashboard.containerId !== "capacity-allocation-summary" ||
        dashboard.newStandalonePanelAllowed !== false || Number(dashboard.maxVisibleCellRows) !== 2) add(errors, counts, "dashboardPolicyErrors", "dashboard", dashboard);
    var runtime = capacityPlan.runtime || {};
    var required = ["update", "registerAssociationProvider", "getCell", "getAllCells", "getEndpointServiceState",
      "getAffectedCivilianEndpoints", "getDashboardSnapshot", "reset", "getManifest", "getSafetyStatus", "dispose"];
    if (runtime.controllerGlobal !== "MissionBosCellCapacityController" || !equal(runtime.requiredMethods, required)) add(errors, counts, "runtimeContractErrors", "runtime", runtime);

    var actual = {
      cells: (cellLoadPlan.cells || []).length,
      eligibleBosEndpoints: (model.eligibleBosEndpointIds || []).length,
      visibleCivilianEndpoints: (model.visibleCivilianEndpointIds || []).length,
      statePolicies: Object.keys(capacityPlan.statePolicy || {}).length,
      priorityStates: (model.priorityStates || []).length,
      impactModes: Object.keys((capacityPlan.civilianImpact || {}).states || {}).length,
      sameCellBosEndpointsAtIncident: (incident.expectedBosEndpointIdsOnSharedCell || []).length,
      sameCellCivilianEndpointsAtIncident: (incident.expectedCivilianEndpointIdsOnSharedCell || []).length,
      affectedVisibleCivilianSessionsAtIncident: Number((((incident.expectedSettledAllocations || {}).BOS_ACTIVE || {}).MAST_A || {}).affectedVisibleCivilianSessions || 0),
      automaticBOSActivations: policy.automaticBOSActivationAllowed === true ? 1 : 0,
      priorityTriggeredReassociations: policy.priorityTriggeredReassociationAllowed === true ? 1 : 0,
      removedCivilianActors: policy.civilianActorsMayBeRemoved === true ? 1 : 0,
      standalonePanels: policy.newStandalonePanelAllowed === true ? 1 : 0
    };
    Object.keys(capacityPlan.expectedCounts || {}).forEach(function (key) {
      if (Number(actual[key]) !== Number(capacityPlan.expectedCounts[key])) add(errors, counts, "expectedCountErrors", key, { expected: capacityPlan.expectedCounts[key], actual: actual[key] });
    });
    return makeResult(errors, counts, actual);
  }

  function logResult(result) {
    var method = result && result.status === "PASSED" ? "log" : "error";
    console.group(result ? result.title : "MISSION BOS CELL CAPACITY DUAL-MISSION VALIDATION");
    Object.keys((result && result.counts) || {}).forEach(function (key) { console[method](key + ": " + result.counts[key]); });
    console[method]("STATUS: " + (result ? result.status : "FAILED"));
    if (result && result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }
  window.MissionBosCellCapacityValidator = { validate: validate, logResult: logResult, allocate: allocate };
})();
