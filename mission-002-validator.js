/* Mission BOS - Build 010P.4
   Mission 002 Arena Core validator.
   Validates the deterministic plan and final integration contracts.
*/
(function () {
  "use strict";

  function finite(value) { return Number.isFinite(Number(value)); }
  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) if (items[i] && items[i].id === id) return items[i];
    return null;
  }
  function rectOf(item) {
    var r = item && (item.worldRect || item.validationRect || item.renderRect);
    if (!r) return null;
    return { minX: Number(r.x) - Number(r.width) / 2, maxX: Number(r.x) + Number(r.width) / 2,
      minZ: Number(r.z) - Number(r.depth) / 2, maxZ: Number(r.z) + Number(r.depth) / 2 };
  }
  function pointInRect(point, rect, margin) {
    margin = Number(margin) || 0;
    return !!point && !!rect && Number(point.x) >= rect.minX + margin && Number(point.x) <= rect.maxX - margin &&
      Number(point.z) >= rect.minZ + margin && Number(point.z) <= rect.maxZ - margin;
  }
  function countForbiddenServingTowerKeys(value) {
    var count = 0;
    function walk(node) {
      if (!node || typeof node !== "object") return;
      Object.keys(node).forEach(function (key) {
        var k = String(key).toLowerCase();
        if (k === "servingtowerid" || k === "servingcellid" || k === "fixedtowerid" || k === "missiontowerid") count += 1;
        walk(node[key]);
      });
    }
    walk(value);
    return count;
  }
  function finalize(result) {
    var total = Object.keys(result.counts).reduce(function (sum, key) { return sum + Number(result.counts[key] || 0); }, 0);
    result.status = total === 0 ? "PASSED" : "FAILED";
    result.lines = [result.title].concat(Object.keys(result.counts).map(function (key) {
      return key + ": " + result.counts[key];
    })).concat(["STATUS: " + result.status]);
    return result;
  }

  function validate(layout, propsPlan, trafficPlan, pedestrianPlan, ambulancePlan, arenaPlan,
      registryPlan, associationPlan, cellLoadPlan, capacityPlan, missionPlan) {
    var result = {
      title: "MISSION BOS MISSION 002 ARENA CORE VALIDATION",
      counts: {
        sourceDependencyErrors: 0,
        sourcePhaseErrors: 0,
        policyErrors: 0,
        stateDefinitionErrors: 0,
        stateSequenceErrors: 0,
        referenceErrors: 0,
        sceneSurfaceErrors: 0,
        sceneCollisionErrors: 0,
        ambulanceContractErrors: 0,
        arenaContractErrors: 0,
        registryUpgradeErrors: 0,
        networkIntegrationErrors: 0,
        fixedServingTowerErrors: 0,
        runtimeContractErrors: 0,
        expectedCountErrors: 0
      },
      actual: {},
      errors: [],
      status: "FAILED",
      lines: []
    };
    function add(category, id, detail) {
      result.counts[category] += 1;
      result.errors.push({ category: category, id: id, detail: detail });
    }

    if (!layout || !propsPlan || !trafficPlan || !pedestrianPlan || !ambulancePlan || !arenaPlan ||
        !registryPlan || !associationPlan || !cellLoadPlan || !capacityPlan || !missionPlan) {
      add("sourceDependencyErrors", "sources", "One or more required plans are missing.");
      return finalize(result);
    }
    if (String(missionPlan.phase).indexOf("010P.4") < 0 || String(missionPlan.buildBase).indexOf("010P.3") < 0) {
      add("sourcePhaseErrors", "phase", { buildBase: missionPlan.buildBase, phase: missionPlan.phase });
    }

    var policy = missionPlan.policy || {};
    ["mission001MayBeModified", "cityGeometryChangesAllowed", "trafficRouteChangesAllowed",
      "pedestrianRouteChangesAllowed", "ambulanceRouteChangesAllowed", "networkAlgorithmChangesAllowed",
      "handoverParameterChangesAllowed", "fixedServingTowerAllowed", "automaticMissionStartAllowed",
      "automaticBOSActivationAllowed", "automaticCameraMovementAllowed", "newStandaloneDashboardAllowed"].forEach(function (key) {
      if (policy[key] !== false) add("policyErrors", key, policy[key]);
    });
    if (policy.manualBOSActivationRequired !== true || policy.arenaEventOwnedByMission002WhileActive !== true ||
        policy.existingRightDashboardMustRemain !== true) add("policyErrors", "requiredPolicy", policy);

    var stateOrder = missionPlan.stateOrder || [];
    var states = missionPlan.states || [];
    var stateIds = states.map(function (state) { return state.id; });
    if (stateOrder.length !== 15 || states.length !== 15 || JSON.stringify(stateOrder) !== JSON.stringify(stateIds)) {
      add("stateDefinitionErrors", "stateOrder", { stateOrder: stateOrder, stateIds: stateIds });
    }
    ["READY", "EVENT_ACTIVE", "CALL_RECEIVED", "CLEARING_CORRIDOR", "ENROUTE", "ON_SCENE",
      "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "TREATMENT", "COMPLETED", "TRANSPORTING",
      "AT_HOSPITAL", "RETURNING", "FAILED"].forEach(function (id) {
      var definition = findById(states, id);
      if (!definition || !finite(definition.progress) || !finite(definition.globalNetworkTarget)) {
        add("stateDefinitionErrors", id, definition || null);
      }
    });
    var sequence = missionPlan.sequence || {};
    if (sequence.initialState !== "READY" || sequence.bosActivationState !== "OVERLOADED" ||
        sequence.finishRequiresState !== "COMPLETED" || sequence.finishStartsAmbulanceTransport !== true ||
        sequence.returnStartsAutomaticallyAfterHospitalHold !== true) {
      add("stateSequenceErrors", "sequence", sequence);
    }

    var refs = missionPlan.references || {};
    if (!findById(layout.buildings, refs.arenaBuildingId) || !findById(layout.buildings, refs.ambulanceStationBuildingId) ||
        !findById(layout.buildings, refs.hospitalBuildingId) || !findById(layout.pavedAreas, refs.arenaForecourtId)) {
      add("referenceErrors", "layout", refs);
    }
    if (!findById(ambulancePlan.routes, refs.routeToArenaId) || !findById(ambulancePlan.routes, refs.routeToHospitalId) ||
        !findById(ambulancePlan.routes, refs.routeToStationId) || !ambulancePlan.vehicle || ambulancePlan.vehicle.id !== refs.ambulanceId) {
      add("referenceErrors", "ambulance", refs);
    }
    if (!arenaPlan.event || arenaPlan.event.id !== refs.arenaEventId || (arenaPlan.visiblePhoneEndpoints || []).length !== 8) {
      add("referenceErrors", "arenaEvent", refs);
    }
    if (!findById(associationPlan.mobileEndpoints, refs.ambulanceEndpointId)) {
      add("referenceErrors", "ambulanceEndpoint", refs.ambulanceEndpointId);
    }

    var forecourt = rectOf(findById(layout.pavedAreas, refs.arenaForecourtId));
    (missionPlan.scene.actors || []).forEach(function (actor) {
      if (!pointInRect(actor.position, forecourt, 0.2)) add("sceneSurfaceErrors", actor.id, actor.position);
    });
    (missionPlan.scene.props || []).forEach(function (prop) {
      if (!pointInRect(prop.position, forecourt, 0.3)) add("sceneSurfaceErrors", prop.id, prop.position);
    });

    var ambulanceEnd = findById(ambulancePlan.routes, refs.routeToArenaId);
    var ambulanceStop = ambulanceEnd && ambulanceEnd.points && ambulanceEnd.points[ambulanceEnd.points.length - 1];
    var ambulanceHalfLength = Number(ambulancePlan.vehicle.footprintLength || 3.4) / 2;
    var ambulanceHalfWidth = Number(ambulancePlan.vehicle.footprintWidth || 1.35) / 2;
    (missionPlan.scene.actors || []).filter(function (actor) { return actor.role !== "patient"; }).forEach(function (actor) {
      if (ambulanceStop && Math.abs(Number(actor.position.x) - Number(ambulanceStop.x)) < ambulanceHalfLength + 0.35 &&
          Math.abs(Number(actor.position.z) - Number(ambulanceStop.z)) < ambulanceHalfWidth + 0.35) {
        add("sceneCollisionErrors", actor.id, "Ambulance stop footprint");
      }
    });
    var crowd = arenaPlan.crowd || [];
    (missionPlan.scene.actors || []).forEach(function (actor) {
      crowd.forEach(function (visitor) {
        var dx = Number(actor.position.x) - Number(visitor.position.x);
        var dz = Number(actor.position.z) - Number(visitor.position.z);
        if (Math.sqrt(dx * dx + dz * dz) < 0.85) add("sceneCollisionErrors", actor.id, visitor.id);
      });
    });

    var requiredAmbulanceMethods = (missionPlan.runtimeContract || {}).requiredAmbulanceMethods || [];
    if (requiredAmbulanceMethods.length !== 6 || refs.yieldVehicleId !== ambulancePlan.yielding.trafficVehicleId ||
        ambulancePlan.vehicle.wheelCount !== 4) add("ambulanceContractErrors", "ambulance", ambulancePlan.vehicle);
    var requiredArenaMethods = (missionPlan.runtimeContract || {}).requiredArenaEventMethods || [];
    if (requiredArenaMethods.indexOf("activateForMission") < 0 || requiredArenaMethods.indexOf("deactivateForMission") < 0) {
      add("arenaContractErrors", "missionOwnership", requiredArenaMethods);
    }

    var registryDefinition = findById(registryPlan.missions, "MISSION_002");
    if (!registryDefinition) add("registryUpgradeErrors", "MISSION_002", null);
    var upgrade = missionPlan.registryUpgrade || {};
    if (upgrade.status !== "AVAILABLE" || upgrade.selectable !== true || upgrade.startable !== true ||
        upgrade.runtimeKey !== "MISSION_002") add("registryUpgradeErrors", "upgrade", upgrade);

    var network = missionPlan.network || {};
    if (JSON.stringify(network.activeBosEndpointIds) !== JSON.stringify(["NET_AMBULANCE_01"]) ||
        network.cellLoadProfileStateDuringMission !== "READY" ||
        network.priorityMustFollowCurrentAmbulanceCell !== true ||
        network.bosActivationDoesNotReduceCivilianDemand !== true ||
        (network.visibleArenaCivilianEndpointIds || []).length !== 8) {
      add("networkIntegrationErrors", "network", network);
    }
    if (countForbiddenServingTowerKeys(missionPlan) !== 0) {
      add("fixedServingTowerErrors", "plan", countForbiddenServingTowerKeys(missionPlan));
    }

    var contract = missionPlan.runtimeContract || {};
    if ((contract.requiredControllerMethods || []).length < 20 || (contract.requiredSceneMethods || []).length < 5 ||
        (contract.requiredNetworkAdapterMethods || []).length !== 7) add("runtimeContractErrors", "contract", contract);

    var actual = {
      states: states.length,
      sceneActors: (missionPlan.scene.actors || []).length,
      patients: (missionPlan.scene.actors || []).filter(function (a) { return a.role === "patient"; }).length,
      paramedics: (missionPlan.scene.actors || []).filter(function (a) { return a.role === "paramedic"; }).length,
      sceneProps: (missionPlan.scene.props || []).length,
      activeBosEndpoints: (network.activeBosEndpointIds || []).length,
      visibleArenaCivilianEndpoints: (network.visibleArenaCivilianEndpointIds || []).length,
      fixedServingTowerDefinitions: countForbiddenServingTowerKeys(missionPlan),
      policeResponseVehicles: 0
    };
    result.actual = actual;
    var expected = missionPlan.expectedCounts || {};
    ["states", "sceneActors", "patients", "paramedics", "sceneProps", "activeBosEndpoints",
      "visibleArenaCivilianEndpoints", "fixedServingTowerDefinitions", "policeResponseVehicles"].forEach(function (key) {
      if (Number(actual[key]) !== Number(expected[key])) add("expectedCountErrors", key, { actual: actual[key], expected: expected[key] });
    });

    return finalize(result);
  }

  function logResult(result) {
    var method = result && result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    (result.lines || []).slice(1).forEach(function (line) { console[method](line); });
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosMission002Validator = { validate: validate, logResult: logResult };
})();
