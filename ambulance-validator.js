/* Mission BOS - Build 010P.2
   Structural and spatial validator for the Validated Ambulance Foundation.
   No Three.js dependency. No modules. No fetch.
*/
(function () {
  "use strict";

  var EPSILON = 1e-6;

  function addError(errors, counts, key, id, detail) {
    counts[key] += 1;
    errors.push({ category: key, id: id || "", detail: detail == null ? null : detail });
  }

  function finite(value) {
    var number = Number(value);
    return isFinite(number) ? number : null;
  }

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      if (items[i] && items[i].id === id) return items[i];
    }
    return null;
  }

  function rectOf(item, key) {
    var source = item && (key ? item[key] : item.worldRect);
    if (!source) return null;
    return {
      id: item.id,
      x: Number(source.x),
      z: Number(source.z),
      width: Number(source.width),
      depth: Number(source.depth)
    };
  }

  function validRect(rect) {
    return !!rect && [rect.x, rect.z, rect.width, rect.depth].every(function (value) {
      return isFinite(Number(value));
    }) && rect.width > 0 && rect.depth > 0;
  }

  function pointInRect(rect, x, z, padding) {
    padding = Number(padding || 0);
    return x >= rect.x - rect.width / 2 - padding && x <= rect.x + rect.width / 2 + padding &&
      z >= rect.z - rect.depth / 2 - padding && z <= rect.z + rect.depth / 2 + padding;
  }

  function rectsOverlap(a, b, padding) {
    padding = Number(padding || 0);
    return Math.abs(a.x - b.x) < (a.width + b.width) / 2 + padding &&
      Math.abs(a.z - b.z) < (a.depth + b.depth) / 2 + padding;
  }

  function countForbiddenServingTowerKeys(value) {
    var count = 0;
    function walk(node) {
      if (!node || typeof node !== "object") return;
      Object.keys(node).forEach(function (key) {
        var normalized = String(key).toLowerCase();
        if (normalized === "servingtowerid" || normalized === "servingcellid" ||
            normalized === "fixedtowerid" || normalized === "missiontowerid") count += 1;
        walk(node[key]);
      });
    }
    walk(value);
    return count;
  }

  function routeSamples(prepared, step) {
    var samples = [];
    for (var distance = 0; distance < prepared.length; distance += step) {
      samples.push(window.MissionBosResponseVehicleValidator.sampleOpenRoute(prepared, distance));
    }
    samples.push(window.MissionBosResponseVehicleValidator.sampleOpenRoute(prepared, prepared.length));
    return samples;
  }

  function surfaceMap(layout, plan) {
    var map = Object.create(null);
    (layout.roadSurfaces || []).forEach(function (item) { map[item.id] = rectOf(item); });
    (layout.pavedAreas || []).forEach(function (item) { map[item.id] = rectOf(item); });
    (plan.accessSurfaces || []).forEach(function (item) { map[item.id] = rectOf(item, "validationRect"); });
    return map;
  }

  function pointInAny(rects, point) {
    return rects.some(function (rect) { return pointInRect(rect, point.x, point.z, EPSILON); });
  }

  function routeFootprintConflicts(prepared, vehicle, rects, step) {
    var validator = window.MissionBosResponseVehicleValidator;
    var margin = 0.05;
    var samples = routeSamples(prepared, step);
    for (var i = 0; i < samples.length; i += 1) {
      var footprint = validator.footprintPoints(
        samples[i],
        Number(vehicle.footprintLength) + margin * 2,
        Number(vehicle.footprintWidth) + margin * 2,
        11,
        7
      );
      for (var j = 0; j < footprint.length; j += 1) {
        for (var k = 0; k < rects.length; k += 1) {
          if (pointInRect(rects[k], footprint[j].x, footprint[j].z, EPSILON)) {
            return { pose: samples[i], point: footprint[j], obstacleId: rects[k].id };
          }
        }
      }
    }
    return null;
  }

  function routeOutsideAllowed(prepared, vehicle, allowedRects, step) {
    var validator = window.MissionBosResponseVehicleValidator;
    var margin = 0.05;
    var samples = routeSamples(prepared, step);
    for (var i = 0; i < samples.length; i += 1) {
      var footprint = validator.footprintPoints(
        samples[i],
        Number(vehicle.footprintLength) + margin * 2,
        Number(vehicle.footprintWidth) + margin * 2,
        11,
        7
      );
      for (var j = 0; j < footprint.length; j += 1) {
        if (!pointInAny(allowedRects, footprint[j])) {
          return { pose: samples[i], point: footprint[j] };
        }
      }
    }
    return null;
  }

  function pedestrianRouteConflicts(prepared, vehicle, pedestrianPlan) {
    var validator = window.MissionBosResponseVehicleValidator;
    var preparedPedestrians = Object.create(null);
    (pedestrianPlan.routes || []).forEach(function (route) {
      preparedPedestrians[route.id] = window.MissionBosPedestrianValidator.prepareOpenRoute(route);
    });
    var ambulanceSamples = routeSamples(prepared, 0.15);
    var conflicts = [];
    (pedestrianPlan.pedestrians || []).forEach(function (pedestrian) {
      var route = preparedPedestrians[pedestrian.routeId];
      if (!route) return;
      var radius = Number(pedestrian.personalSpaceRadius || pedestrian.footprintRadius || 0.5);
      var hit = false;
      for (var distance = 0; distance <= route.length + EPSILON && !hit; distance += 0.2) {
        var p = window.MissionBosPedestrianValidator.samplePathDistance(route, Math.min(distance, route.length));
        for (var i = 0; i < ambulanceSamples.length; i += 1) {
          if (validator.circleOrientedRectOverlap(
            { x: p.x, z: p.z, radius: radius },
            ambulanceSamples[i],
            Number(vehicle.footprintLength),
            Number(vehicle.footprintWidth),
            0.05
          )) {
            conflicts.push(pedestrian.id);
            hit = true;
            break;
          }
        }
      }
    });
    return conflicts;
  }

  function trafficRouteConflicts(routes, vehicle, trafficPlan) {
    var responseValidator = window.MissionBosResponseVehicleValidator;
    var trafficValidator = window.MissionBosTrafficValidator;
    var ambulancePoses = [];
    routes.forEach(function (route) {
      var prepared = responseValidator.prepareOpenRoute(route);
      routeSamples(prepared, 0.18).forEach(function (pose) { ambulancePoses.push(pose); });
    });
    var conflicts = [];
    (trafficPlan.vehicles || []).forEach(function (civilian) {
      var routeDefinition = findById(trafficPlan.routes || [], civilian.routeId);
      if (!routeDefinition) return;
      var route = trafficValidator.prepareRoute(routeDefinition);
      var hit = false;
      for (var distance = 0; distance <= route.length + EPSILON && !hit; distance += 0.18) {
        var civilPose = trafficValidator.sampleRoute(route, distance);
        var civilPoly = trafficValidator.rectangleCorners(
          civilPose,
          Number(civilian.footprintLength),
          Number(civilian.footprintWidth),
          0.05
        );
        for (var i = 0; i < ambulancePoses.length; i += 1) {
          var ambulancePoly = responseValidator.rectangleCorners(
            ambulancePoses[i],
            Number(vehicle.footprintLength),
            Number(vehicle.footprintWidth),
            0.05
          );
          if (responseValidator.polygonsOverlapSAT(ambulancePoly, civilPoly)) {
            conflicts.push(civilian.id);
            hit = true;
            break;
          }
        }
      }
    });
    return conflicts;
  }

  function towerRecords(layout, associationPlan) {
    return (associationPlan.towers || []).map(function (definition) {
      var source = findById(layout.mobileTowers || [], definition.referenceId);
      return source ? {
        id: definition.referenceId,
        cellId: definition.id,
        label: definition.label,
        available: definition.available === true,
        siteCalibrationOffset: Number(definition.siteCalibrationOffset || 0),
        coverageInfluences: definition.coverageInfluences || [],
        source: source,
        position: { x: Number(source.worldRect.x), y: Number(source.height || 0) + 0.35, z: Number(source.worldRect.z) }
      } : null;
    }).filter(Boolean);
  }

  function profileByState(cellLoadPlan, stateId) {
    return (cellLoadPlan.missionStateProfiles || []).filter(function (item) { return item.stateId === stateId; })[0] || null;
  }

  function simulateRadioSequence(route, state, startTime, speed, towers, loads, model) {
    var prepared = window.MissionBosResponseVehicleValidator.prepareOpenRoute(route);
    var distance = 0;
    var time = startTime;
    var sequence = [];
    var events = [];
    while (distance <= prepared.length + EPSILON) {
      var pose = window.MissionBosResponseVehicleValidator.sampleOpenRoute(prepared, Math.min(distance, prepared.length));
      var result = window.MissionBosNetworkRadioModel.updateDecision(state, {
        time: time,
        position: { x: pose.x, z: pose.z },
        towers: towers,
        loadsByTowerId: loads,
        model: model
      });
      if (!sequence.length || sequence[sequence.length - 1] !== state.servingTowerId) sequence.push(state.servingTowerId);
      if (result.event) events.push(result.event);
      distance += speed * Number(model.evaluationIntervalSeconds);
      time += Number(model.evaluationIntervalSeconds);
    }
    return { state: state, time: time, sequence: sequence, events: events };
  }

  function arraysEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
    return true;
  }

  function validate(layout, propsPlan, trafficPlan, pedestrianPlan, baseAssociationPlan, extendedAssociationPlan, cellLoadPlan, ambulancePlan) {
    var keys = [
      "sourceDependencyErrors", "sourcePhaseErrors", "policyErrors",
      "referenceErrors", "accessSurfaceErrors", "routeDefinitionErrors",
      "routeSurfaceErrors", "routeFootprintErrors", "buildingConflictErrors",
      "towerConflictErrors", "technologyPlotConflictErrors", "parkingConflictErrors",
      "greenConflictErrors", "staticPropConflictErrors", "pedestrianConflictErrors",
      "trafficConflictErrors", "yieldPolicyErrors", "vehicleSpecificationErrors",
      "networkExtensionErrors", "radioReferenceErrors", "runtimeContractErrors",
      "fixedServingTowerErrors", "expectedCountErrors"
    ];
    var counts = {};
    keys.forEach(function (key) { counts[key] = 0; });
    var errors = [];

    if (!layout || !propsPlan || !trafficPlan || !pedestrianPlan || !baseAssociationPlan || !extendedAssociationPlan || !cellLoadPlan || !ambulancePlan ||
        !window.MissionBosResponseVehicleValidator || !window.MissionBosTrafficValidator || !window.MissionBosPedestrianValidator || !window.MissionBosNetworkRadioModel) {
      addError(errors, counts, "sourceDependencyErrors", "root", "One or more required plans or shared validators are missing.");
      return createResult(errors, counts, {});
    }

    if (ambulancePlan.buildBase !== "010P.1 PASSED" || ambulancePlan.phase !== "010P.2 Validated Ambulance Foundation") {
      addError(errors, counts, "sourcePhaseErrors", "ambulancePlan", { buildBase: ambulancePlan.buildBase, phase: ambulancePlan.phase });
    }

    var policy = ambulancePlan.policy || {};
    ["runtimeRandomization", "cityGeometryChangesAllowed", "staticPropChangesAllowed", "civilianTrafficRouteChangesAllowed", "pedestrianRouteChangesAllowed", "mission001ChangesAllowed", "mission002RuntimeAllowed", "mission002SceneAllowed", "arenaCrowdAllowed", "arenaLoadProfileAllowed", "automaticMissionStartAllowed", "automaticBOSActivationAllowed", "fixedServingTowerAllowed", "networkBaselineControllerMayBeRewritten", "existingResponseVehicleRuntimeMayBeModified", "newStandaloneDashboardAllowed"].forEach(function (key) {
      if (policy[key] !== false) addError(errors, counts, "policyErrors", key, policy[key]);
    });
    ["fileProtocolRequired", "sharedRadioModelRequired", "singleAmbulanceOnly", "controlledYieldRequired", "rightDashboardMustRemain", "ambulanceTestControlTemporary"].forEach(function (key) {
      if (policy[key] !== true) addError(errors, counts, "policyErrors", key, policy[key]);
    });

    var refs = ambulancePlan.references || {};
    [refs.stationBuildingId, refs.hospitalBuildingId, refs.arenaBuildingId].forEach(function (id) {
      if (!findById(layout.buildings || [], id)) addError(errors, counts, "referenceErrors", id, "Building reference missing.");
    });
    if (!findById(layout.roadSurfaces || [], refs.primaryRoadSurfaceId) || !findById(layout.pavedAreas || [], refs.arenaForecourtId) || !findById(layout.pavedAreas || [], refs.hospitalForecourtId)) {
      addError(errors, counts, "referenceErrors", "surfaces", refs);
    }

    var obstacles = {
      building: (layout.buildings || []).map(function (item) { return rectOf(item); }),
      tower: (layout.mobileTowers || []).map(function (item) { return rectOf(item); }),
      technology: (layout.technologyPlots || []).map(function (item) { return rectOf(item); }),
      parking: (layout.parkingAreas || []).map(function (item) { return rectOf(item); }),
      green: (layout.greenAreas || []).map(function (item) { return rectOf(item); }),
      prop: (propsPlan.props || []).map(function (item) { return rectOf(item); })
    };

    var accessIds = Object.create(null);
    (ambulancePlan.accessSurfaces || []).forEach(function (surface) {
      var validationRect = rectOf(surface, "validationRect");
      var renderRect = rectOf(surface, "renderRect");
      if (!surface.id || accessIds[surface.id] || !validRect(validationRect) || !validRect(renderRect) || !findById(layout.buildings || [], surface.referenceBuildingId)) {
        addError(errors, counts, "accessSurfaceErrors", surface.id, surface);
        return;
      }
      accessIds[surface.id] = true;
      if (!pointInRect(validationRect, renderRect.x - renderRect.width / 2, renderRect.z - renderRect.depth / 2) ||
          !pointInRect(validationRect, renderRect.x + renderRect.width / 2, renderRect.z + renderRect.depth / 2)) {
        addError(errors, counts, "accessSurfaceErrors", surface.id, "renderRect outside validationRect");
      }
      Object.keys(obstacles).forEach(function (kind) {
        obstacles[kind].forEach(function (obstacle) {
          if (rectsOverlap(validationRect, obstacle, -EPSILON)) {
            addError(errors, counts, "accessSurfaceErrors", surface.id, { obstacleKind: kind, obstacleId: obstacle.id });
          }
        });
      });
    });

    var surfaceById = surfaceMap(layout, ambulancePlan);
    var routes = ambulancePlan.routes || [];
    var preparedById = Object.create(null);
    routes.forEach(function (route) {
      if (!route.id || preparedById[route.id] || route.vehicleId !== "AMBULANCE_01" || route.closed === true || !Array.isArray(route.points) || route.points.length < 2) {
        addError(errors, counts, "routeDefinitionErrors", route.id, route);
        return;
      }
      var prepared = window.MissionBosResponseVehicleValidator.prepareOpenRoute(route);
      preparedById[route.id] = prepared;
      if (Math.abs(prepared.length - Number(route.length)) > 0.02) addError(errors, counts, "routeDefinitionErrors", route.id, { stored: route.length, calculated: prepared.length });
      (route.allowedSurfaceIds || []).forEach(function (surfaceId) {
        if (!surfaceById[surfaceId]) addError(errors, counts, "routeSurfaceErrors", route.id, surfaceId);
      });
    });

    var vehicle = ambulancePlan.vehicle || {};
    if (vehicle.id !== "AMBULANCE_01" || vehicle.kind !== "ambulance" || Number(vehicle.wheelCount) !== 4 || Number(vehicle.lightbarCount) !== 1 ||
        [vehicle.bodyLength, vehicle.bodyWidth, vehicle.footprintLength, vehicle.footprintWidth, vehicle.outboundSpeed, vehicle.transportSpeed, vehicle.returnSpeed].some(function (value) { return finite(value) === null || Number(value) <= 0; }) ||
        Number(vehicle.footprintLength) < Number(vehicle.bodyLength) || Number(vehicle.footprintWidth) < Number(vehicle.bodyWidth)) {
      addError(errors, counts, "vehicleSpecificationErrors", vehicle.id, vehicle);
    }

    routes.forEach(function (route) {
      var prepared = preparedById[route.id];
      if (!prepared) return;
      var allowedRects = (route.allowedSurfaceIds || []).map(function (id) { return surfaceById[id]; }).filter(Boolean);
      var outside = routeOutsideAllowed(prepared, vehicle, allowedRects, 0.05);
      if (outside) addError(errors, counts, "routeFootprintErrors", route.id, outside);
      [
        ["buildingConflictErrors", obstacles.building],
        ["towerConflictErrors", obstacles.tower],
        ["technologyPlotConflictErrors", obstacles.technology],
        ["parkingConflictErrors", obstacles.parking],
        ["greenConflictErrors", obstacles.green],
        ["staticPropConflictErrors", obstacles.prop]
      ].forEach(function (entry) {
        var conflict = routeFootprintConflicts(prepared, vehicle, entry[1], 0.05);
        if (conflict) addError(errors, counts, entry[0], route.id, conflict);
      });
      var pedConflicts = pedestrianRouteConflicts(prepared, vehicle, pedestrianPlan);
      pedConflicts.forEach(function (id) { addError(errors, counts, "pedestrianConflictErrors", route.id, id); });
    });

    var trafficConflicts = trafficRouteConflicts(routes, vehicle, trafficPlan);
    var expectedYieldId = ambulancePlan.yielding && ambulancePlan.yielding.trafficVehicleId;
    trafficConflicts.forEach(function (id) {
      if (id !== expectedYieldId) addError(errors, counts, "trafficConflictErrors", id, "Unexpected traffic conflict.");
    });
    if (trafficConflicts.length !== 1 || trafficConflicts[0] !== expectedYieldId) {
      addError(errors, counts, "trafficConflictErrors", "controlledConflictSet", trafficConflicts);
    }

    var yielding = ambulancePlan.yielding || {};
    var yieldVehicle = findById(trafficPlan.vehicles || [], yielding.trafficVehicleId);
    var yieldRouteDef = findById(trafficPlan.routes || [], yielding.trafficRouteId);
    if (yielding.required !== true || !yieldVehicle || !yieldRouteDef || yieldVehicle.routeId !== yieldRouteDef.id || finite(yielding.holdDistance) === null || yielding.teleportationAllowed !== false || yielding.releaseOnReset !== true || yielding.holdUntilAmbulanceReturnsToStation !== true) {
      addError(errors, counts, "yieldPolicyErrors", "yielding", yielding);
    } else {
      var yieldRoute = window.MissionBosTrafficValidator.prepareRoute(yieldRouteDef);
      var holdPose = window.MissionBosTrafficValidator.sampleRoute(yieldRoute, Number(yielding.holdDistance));
      var expectedPoint = yielding.holdPointReference || {};
      if (Math.hypot(holdPose.x - Number(expectedPoint.x), holdPose.z - Number(expectedPoint.z)) > 0.08) {
        addError(errors, counts, "yieldPolicyErrors", "holdPoint", { expected: expectedPoint, actual: holdPose });
      }
    }

    var extension = ambulancePlan.networkExtension || {};
    var endpoint = findById(extendedAssociationPlan.mobileEndpoints || [], extension.associationEndpointId);
    if (!window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN_009N7_BASELINE || baseAssociationPlan !== window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN_009N7_BASELINE ||
        !endpoint || endpoint.referenceId !== vehicle.id || endpoint.kind !== "response-vehicle" || endpoint.channel !== "BOS" || endpoint.active !== true ||
        (baseAssociationPlan.mobileEndpoints || []).length !== 8 || (extendedAssociationPlan.mobileEndpoints || []).length !== 9 ||
        Number(extendedAssociationPlan.expectedCounts.mobileEndpoints) !== 9 || Number(extendedAssociationPlan.expectedCounts.responseVehicleEndpoints) !== 3) {
      addError(errors, counts, "networkExtensionErrors", "associationExtension", { endpoint: endpoint, expected: extension.expectedCountsAfterExtension });
    }

    var fixedServingTowerDefinitions = countForbiddenServingTowerKeys(endpoint || {});
    if (fixedServingTowerDefinitions !== 0) addError(errors, counts, "fixedServingTowerErrors", endpoint && endpoint.id, fixedServingTowerDefinitions);

    var readyProfile = profileByState(cellLoadPlan, "READY");
    var model = extendedAssociationPlan.selectionModel || {};
    var towers = towerRecords(layout, extendedAssociationPlan);
    if (!readyProfile || towers.length !== 5) {
      addError(errors, counts, "radioReferenceErrors", "radioSources", { readyProfile: readyProfile, towers: towers.length });
    } else {
      var state = window.MissionBosNetworkRadioModel.createDecisionState();
      var currentTime = 0;
      var speedByRoute = {
        AMBULANCE_STATION_TO_ARENA_ROUTE: Number(vehicle.outboundSpeed),
        AMBULANCE_ARENA_TO_HOSPITAL_ROUTE: Number(vehicle.transportSpeed),
        AMBULANCE_HOSPITAL_TO_STATION_ROUTE: Number(vehicle.returnSpeed)
      };
      var sequenceKeyByRoute = {
        AMBULANCE_STATION_TO_ARENA_ROUTE: "stationToArena",
        AMBULANCE_ARENA_TO_HOSPITAL_ROUTE: "arenaToHospital",
        AMBULANCE_HOSPITAL_TO_STATION_ROUTE: "hospitalToStation"
      };
      routes.forEach(function (route) {
        var result = simulateRadioSequence(route, state, currentTime, speedByRoute[route.id], towers, readyProfile.targets, model);
        state = result.state;
        currentTime = result.time + 4;
        var expectedSequence = (extension.expectedReadyRouteSequences || {})[sequenceKeyByRoute[route.id]];
        if (!arraysEqual(result.sequence, expectedSequence)) addError(errors, counts, "radioReferenceErrors", route.id, { expected: expectedSequence, actual: result.sequence });
      });
    }

    var contract = ambulancePlan.runtimeContract || {};
    if (contract.rendererGlobal !== "MissionBosAmbulanceRenderer" || contract.controllerGlobal !== "MissionBosAmbulanceFoundationController" || contract.connectivityRendererGlobal !== "MissionBosAmbulanceConnectivityRenderer" ||
        contract.vehiclesByIdRequired !== true || contract.combinedNetworkVehicleRuntimeRequired !== true || contract.combinedAssociationReferencePlanRequired !== true ||
        !Array.isArray(contract.requiredRendererMethods) || !Array.isArray(contract.requiredControllerMethods)) {
      addError(errors, counts, "runtimeContractErrors", "runtimeContract", contract);
    }

    var actualCounts = {
      accessSurfaces: (ambulancePlan.accessSurfaces || []).length,
      routes: routes.length,
      ambulances: vehicle.id === "AMBULANCE_01" ? 1 : 0,
      wheels: Number(vehicle.wheelCount || 0),
      lightbars: Number(vehicle.lightbarCount || 0),
      controlledCivilianTrafficConflicts: trafficConflicts.length,
      pedestrianRouteConflicts: counts.pedestrianConflictErrors,
      buildingConflicts: counts.buildingConflictErrors,
      towerConflicts: counts.towerConflictErrors,
      technologyPlotConflicts: counts.technologyPlotConflictErrors,
      staticPropConflicts: counts.staticPropConflictErrors,
      fixedServingTowerDefinitions: fixedServingTowerDefinitions,
      mission002Runtimes: 0,
      mission002Actors: 0,
      mission002LoadProfiles: 0,
      newStandalonePanels: policy.newStandaloneDashboardAllowed === true ? 1 : 0
    };
    Object.keys(ambulancePlan.expectedCounts || {}).forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(actualCounts, key) && Number(actualCounts[key]) !== Number(ambulancePlan.expectedCounts[key])) {
        addError(errors, counts, "expectedCountErrors", key, { expected: ambulancePlan.expectedCounts[key], actual: actualCounts[key] });
      }
    });

    return createResult(errors, counts, actualCounts);
  }

  function createResult(errors, counts, actualCounts) {
    return {
      title: "MISSION BOS VALIDATED AMBULANCE FOUNDATION VALIDATION",
      status: errors.length === 0 ? "PASSED" : "FAILED",
      counts: counts,
      actualCounts: actualCounts || {},
      errors: errors
    };
  }

  function logResult(result) {
    var method = result && result.status === "PASSED" ? "log" : "error";
    console.group(result ? result.title : "MISSION BOS VALIDATED AMBULANCE FOUNDATION VALIDATION");
    if (!result) {
      console.error("Validation result missing.");
      console.groupEnd();
      return;
    }
    Object.keys(result.counts || {}).forEach(function (key) { console[method](key + ": " + result.counts[key]); });
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosAmbulanceValidator = { validate: validate, logResult: logResult };
})();
