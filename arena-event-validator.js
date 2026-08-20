/* Mission BOS - Build 010P.3
   Structural, spatial and radio-reference validator for the Arena Event & Cell Load Foundation.
   No Three.js dependency. No modules. No fetch.
*/
(function () {
  "use strict";

  var EPSILON = 1e-7;

  function addError(errors, counts, key, id, detail) {
    counts[key] += 1;
    errors.push({ category: key, id: id || "", detail: detail == null ? null : detail });
  }

  function finite(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      if (items[i] && items[i].id === id) return items[i];
    }
    return null;
  }

  function rectOf(item) {
    var source = item && (item.worldRect || item.validationRect || item.renderRect || item);
    if (!source) return null;
    return {
      id: item.id || "UNKNOWN",
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

  function pointInRect(rect, x, z, margin) {
    var m = finite(margin, 0);
    return x >= rect.x - rect.width / 2 + m - EPSILON &&
      x <= rect.x + rect.width / 2 - m + EPSILON &&
      z >= rect.z - rect.depth / 2 + m - EPSILON &&
      z <= rect.z + rect.depth / 2 - m + EPSILON;
  }

  function circleRectOverlap(x, z, radius, rect) {
    var nearestX = Math.max(rect.x - rect.width / 2, Math.min(x, rect.x + rect.width / 2));
    var nearestZ = Math.max(rect.z - rect.depth / 2, Math.min(z, rect.z + rect.depth / 2));
    var dx = x - nearestX;
    var dz = z - nearestZ;
    return dx * dx + dz * dz < radius * radius - EPSILON;
  }

  function distance(a, b) {
    var dx = Number(a.x) - Number(b.x);
    var dz = Number(a.z) - Number(b.z);
    return Math.sqrt(dx * dx + dz * dz);
  }

  function pointSegmentDistance(point, start, end) {
    var dx = Number(end.x) - Number(start.x);
    var dz = Number(end.z) - Number(start.z);
    var lengthSquared = dx * dx + dz * dz;
    if (lengthSquared <= EPSILON) return distance(point, start);
    var t = ((Number(point.x) - Number(start.x)) * dx + (Number(point.z) - Number(start.z)) * dz) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    return distance(point, { x: Number(start.x) + dx * t, z: Number(start.z) + dz * t });
  }

  function minimumDistanceToRoute(point, route) {
    var minimum = Infinity;
    var points = (route || {}).points || [];
    for (var i = 0; i < points.length - 1; i += 1) {
      minimum = Math.min(minimum, pointSegmentDistance(point, points[i], points[i + 1]));
    }
    return minimum;
  }

  function duplicateIds(items) {
    var seen = Object.create(null);
    var duplicates = [];
    (items || []).forEach(function (item) {
      var id = item && item.id;
      if (!id) return;
      if (seen[id]) duplicates.push(id);
      seen[id] = true;
    });
    return duplicates;
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

  function sum(items, key) {
    return (items || []).reduce(function (total, item) {
      return total + finite(item && item[key], 0);
    }, 0);
  }

  function buildTowerRecords(layout, associationPlan) {
    return (associationPlan.towers || []).map(function (definition) {
      var source = findById(layout.mobileTowers || [], definition.referenceId);
      if (!source || !source.worldRect) return null;
      return {
        id: definition.referenceId,
        available: definition.available === true,
        siteCalibrationOffset: finite(definition.siteCalibrationOffset, 0),
        coverageInfluences: JSON.parse(JSON.stringify(definition.coverageInfluences || [])),
        position: { x: Number(source.worldRect.x), z: Number(source.worldRect.z) }
      };
    }).filter(Boolean);
  }

  function validate(layout, propsPlan, trafficPlan, pedestrianPlan, ambulancePlan, missionRegistryPlan,
                    associationPlan, cellLoadPlan, arenaPlan) {
    var keys = [
      "sourceDependencyErrors", "sourcePhaseErrors", "policyErrors", "referenceErrors",
      "crowdDefinitionErrors", "crowdSurfaceErrors", "crowdCollisionErrors",
      "pedestrianRouteConflictErrors", "ambulanceCorridorConflictErrors", "phoneReferenceErrors",
      "aggregateSourceErrors", "dynamicSourcePolicyErrors", "radioReferenceErrors",
      "loadCalibrationErrors", "missionBoundaryErrors", "dashboardPolicyErrors",
      "runtimeContractErrors", "fixedServingTowerErrors", "expectedCountErrors"
    ];
    var counts = {};
    keys.forEach(function (key) { counts[key] = 0; });
    var errors = [];

    if (!layout || !propsPlan || !trafficPlan || !pedestrianPlan || !ambulancePlan ||
        !missionRegistryPlan || !associationPlan || !cellLoadPlan || !arenaPlan ||
        !window.MissionBosNetworkRadioModel) {
      addError(errors, counts, "sourceDependencyErrors", "root", "One or more required plans or the shared radio model are missing.");
      return createResult(errors, counts, {});
    }

    if (arenaPlan.buildBase !== "010P.2 PASSED" ||
        arenaPlan.phase !== "010P.3 Arena Event & Cell Load Foundation") {
      addError(errors, counts, "sourcePhaseErrors", "buildBase/phase", {
        buildBase: arenaPlan.buildBase,
        phase: arenaPlan.phase
      });
    }

    var policy = arenaPlan.policy || {};
    [
      "fileProtocolRequired", "visibleArenaCrowdAllowed", "visibleArenaPhonesAllowed",
      "aggregatedArenaDemandAllowed", "sharedRadioModelRequired",
      "existingRepresentativeSourceMustRemain", "rightDashboardMustRemain", "temporaryTestControl"
    ].forEach(function (key) {
      if (policy[key] !== true) addError(errors, counts, "policyErrors", key, policy[key]);
    });
    [
      "runtimeRandomization", "cityGeometryChangesAllowed", "staticPropChangesAllowed",
      "trafficRouteChangesAllowed", "pedestrianRouteChangesAllowed", "ambulancePlanChangesAllowed",
      "mission001ChangesAllowed", "mission002RuntimeAllowed", "mission002StateMachineAllowed",
      "medicalIncidentAllowed", "patientAllowed", "ambulanceMovementDuringEventTestAllowed",
      "arenaBuildingChangesAllowed", "fixedServingTowerAllowed", "localCellLoadThresholdChangesAllowed",
      "automaticEventStartAllowed", "automaticMissionStartAllowed", "automaticBOSActivationAllowed",
      "newStandaloneDashboardAllowed"
    ].forEach(function (key) {
      if (policy[key] !== false) addError(errors, counts, "policyErrors", key, policy[key]);
    });

    var references = arenaPlan.references || {};
    var arenaBuilding = findById(layout.buildings || [], references.arenaBuildingId);
    var forecourt = findById(layout.pavedAreas || [], references.arenaForecourtId);
    var arenaTower = findById(layout.mobileTowers || [], references.arenaTowerReferenceId);
    var ambulanceAccess = findById(ambulancePlan.accessSurfaces || [], references.ambulanceAccessId);
    var ambulanceRoute = findById(ambulancePlan.routes || [], references.ambulanceRouteId);
    var mission002 = findById(missionRegistryPlan.missions || [], references.mission002Id);
    if (!arenaBuilding || !forecourt || !arenaTower || !ambulanceAccess || !ambulanceRoute || !mission002) {
      addError(errors, counts, "referenceErrors", "references", {
        arenaBuilding: !!arenaBuilding,
        forecourt: !!forecourt,
        arenaTower: !!arenaTower,
        ambulanceAccess: !!ambulanceAccess,
        ambulanceRoute: !!ambulanceRoute,
        mission002: !!mission002
      });
    }

    var crowd = arenaPlan.crowd || [];
    var phones = arenaPlan.visiblePhoneEndpoints || [];
    var aggregateSources = arenaPlan.aggregateDemandSources || [];
    var dynamicSources = arenaPlan.dynamicLoadSources || [];
    duplicateIds(crowd.concat(phones).concat(aggregateSources).concat(dynamicSources)).forEach(function (id) {
      addError(errors, counts, "crowdDefinitionErrors", id, "Duplicate ID.");
    });

    var footprintRadius = finite((arenaPlan.simulation || {}).crowdFootprintRadius, 0.28);
    var personalRadius = finite((arenaPlan.simulation || {}).crowdPersonalSpaceRadius, 0.48);
    var forecourtRect = rectOf(forecourt);
    var obstacleRects = [];
    (layout.buildings || []).forEach(function (item) { obstacleRects.push(rectOf(item)); });
    (layout.mobileTowers || []).forEach(function (item) { obstacleRects.push(rectOf(item)); });
    (layout.technologyPlots || []).forEach(function (item) { obstacleRects.push(rectOf(item)); });
    (layout.roadSurfaces || []).forEach(function (item) { obstacleRects.push(rectOf(item)); });
    (layout.parkingAreas || []).forEach(function (item) { obstacleRects.push(rectOf(item)); });
    (propsPlan.props || []).forEach(function (item) { obstacleRects.push(rectOf(item)); });
    obstacleRects = obstacleRects.filter(validRect);

    crowd.forEach(function (actor) {
      var position = actor.position || {};
      if (!actor.id || !isFinite(Number(position.x)) || !isFinite(Number(position.z)) || typeof actor.phone !== "boolean") {
        addError(errors, counts, "crowdDefinitionErrors", actor.id, actor);
        return;
      }
      if (!forecourtRect || !pointInRect(forecourtRect, Number(position.x), Number(position.z), footprintRadius)) {
        addError(errors, counts, "crowdSurfaceErrors", actor.id, position);
      }
      obstacleRects.forEach(function (rect) {
        if (circleRectOverlap(Number(position.x), Number(position.z), footprintRadius, rect)) {
          addError(errors, counts, "crowdCollisionErrors", actor.id, rect.id);
        }
      });
    });

    for (var i = 0; i < crowd.length; i += 1) {
      for (var j = i + 1; j < crowd.length; j += 1) {
        if (distance(crowd[i].position, crowd[j].position) + EPSILON < personalRadius * 2) {
          addError(errors, counts, "crowdCollisionErrors", crowd[i].id + "/" + crowd[j].id, distance(crowd[i].position, crowd[j].position));
        }
      }
    }

    var pedestrianSafety = personalRadius + finite((arenaPlan.simulation || {}).pedestrianRouteSafetyMargin, 0.36);
    (pedestrianPlan.routes || []).forEach(function (route) {
      if ((references.existingArenaPedestrianIds || []).length === 0 && String(route.id).indexOf("ARENA") < 0) return;
      var usedByArenaPedestrian = (pedestrianPlan.pedestrians || []).some(function (person) {
        return (references.existingArenaPedestrianIds || []).indexOf(person.id) >= 0 && person.routeId === route.id;
      });
      if (!usedByArenaPedestrian) return;
      crowd.forEach(function (actor) {
        var routeDistance = minimumDistanceToRoute(actor.position, route);
        if (routeDistance + EPSILON < pedestrianSafety) {
          addError(errors, counts, "pedestrianRouteConflictErrors", actor.id, { routeId: route.id, distance: routeDistance });
        }
      });
    });

    var ambulanceHalfWidth = finite((ambulancePlan.vehicle || {}).footprintWidth, 1.35) / 2;
    var ambulanceSafety = footprintRadius + ambulanceHalfWidth + finite((arenaPlan.simulation || {}).ambulanceRouteSafetyMargin, 0.18);
    crowd.forEach(function (actor) {
      var routeDistance = minimumDistanceToRoute(actor.position, ambulanceRoute);
      if (routeDistance + EPSILON < ambulanceSafety) {
        addError(errors, counts, "ambulanceCorridorConflictErrors", actor.id, { routeId: ambulanceRoute.id, distance: routeDistance, required: ambulanceSafety });
      }
    });

    phones.forEach(function (phone) {
      var actor = findById(crowd, phone.actorId);
      if (!phone.id || !actor || actor.phone !== true || phone.channel !== "CIVILIAN" ||
          phone.kind !== "arena-phone" || finite(phone.demandUnits, -1) !== 1) {
        addError(errors, counts, "phoneReferenceErrors", phone.id, phone);
      }
    });
    crowd.filter(function (actor) { return actor.phone === true; }).forEach(function (actor) {
      if (!phones.some(function (phone) { return phone.actorId === actor.id; })) {
        addError(errors, counts, "phoneReferenceErrors", actor.id, "Phone actor has no endpoint.");
      }
    });

    aggregateSources.forEach(function (source) {
      if (!source.id || !source.position || !isFinite(Number(source.position.x)) || !isFinite(Number(source.position.z)) ||
          finite(source.demandUnits, 0) <= 0 || !pointInRect(forecourtRect, Number(source.position.x), Number(source.position.z), 0)) {
        addError(errors, counts, "aggregateSourceErrors", source.id, source);
      }
    });

    var sourceById = Object.create(null);
    dynamicSources.forEach(function (source) {
      sourceById[source.id] = source;
      if (!source.id || finite(source.maxDemandUnits, -1) < 0 || finite(source.requiredDemandUnits, -1) < 0 ||
          finite(source.requiredDemandUnits, 0) > finite(source.maxDemandUnits, -1)) {
        addError(errors, counts, "dynamicSourcePolicyErrors", source.id, source);
      }
    });
    if (!sourceById.ARENA_EVENT_VISIBLE_PHONES || !sourceById.ARENA_EVENT_AGGREGATE) {
      addError(errors, counts, "dynamicSourcePolicyErrors", "required-source-ids", Object.keys(sourceById));
    }

    var towers = buildTowerRecords(layout, associationPlan);
    var loads = Object.create(null);
    (cellLoadPlan.cells || []).forEach(function (cell) { loads[cell.towerId] = Number(cell.baseLoad); });
    var model = associationPlan.selectionModel || {};
    var referenceTowerIds = [];
    function validateRadioPoint(id, position) {
      var ranked = window.MissionBosNetworkRadioModel.rankTowers(position, towers, loads, model);
      var best = ranked.length ? ranked[0].towerId : null;
      referenceTowerIds.push(best);
      if (best !== references.arenaTowerReferenceId) {
        addError(errors, counts, "radioReferenceErrors", id, { best: best, expected: references.arenaTowerReferenceId, ranked: ranked.slice(0, 3) });
      }
    }
    phones.forEach(function (phone) {
      var actor = findById(crowd, phone.actorId);
      if (actor) validateRadioPoint(phone.id, actor.position);
    });
    aggregateSources.forEach(function (source) { validateRadioPoint(source.id, source.position); });

    var visibleDemand = sum(phones, "demandUnits");
    var aggregateDemand = sum(aggregateSources, "demandUnits");
    var totalDemand = visibleDemand + aggregateDemand;
    var calibration = arenaPlan.loadCalibration || {};
    var arenaCell = (cellLoadPlan.cells || []).filter(function (cell) { return cell && cell.towerId === references.arenaTowerReferenceId; })[0] || null;
    var projectedMin = arenaCell ? Number(arenaCell.baseLoad) + totalDemand + finite(calibration.existingRepresentativeArenaDemandMin, 0) : NaN;
    var projectedMax = arenaCell ? Number(arenaCell.baseLoad) + totalDemand + finite(calibration.existingRepresentativeArenaDemandMax, 0) : NaN;
    if (!arenaCell || Number(arenaCell.baseLoad) !== Number(calibration.arenaCellBaseLoad) ||
        visibleDemand !== Number(calibration.visiblePhoneDemandUnits) ||
        aggregateDemand !== Number(calibration.aggregateDemandUnits) ||
        totalDemand !== Number(calibration.totalEventDemandUnits) ||
        projectedMin !== Number(calibration.expectedArenaCellLoadMin) ||
        projectedMax !== Number(calibration.expectedArenaCellLoadMax) ||
        projectedMax > Number(calibration.maximumCellLoad) ||
        projectedMin < Number(calibration.overloadedAtOrAbove) ||
        calibration.globalLoadMustRemainUnchanged !== true ||
        calibration.capacityPriorityMustRemainInactive !== true) {
      addError(errors, counts, "loadCalibrationErrors", "arena-load", {
        arenaBase: arenaCell && arenaCell.baseLoad,
        visibleDemand: visibleDemand,
        aggregateDemand: aggregateDemand,
        totalDemand: totalDemand,
        projectedMin: projectedMin,
        projectedMax: projectedMax,
        calibration: calibration
      });
    }

    if (!mission002 || mission002.status !== "PLANNED" || mission002.runtimeKey != null ||
        arenaPlan.event.mission002RuntimeCreated !== false ||
        arenaPlan.expectedCounts.mission002Runtimes !== 0 ||
        arenaPlan.expectedCounts.mission002Actors !== 0 ||
        arenaPlan.expectedCounts.patients !== 0) {
      addError(errors, counts, "missionBoundaryErrors", "MISSION_002", mission002);
    }

    var dashboard = arenaPlan.dashboard || {};
    ["containerId", "statusId", "visibleCountId", "phoneCountId", "servingCellElementId", "cellLoadId", "buttonId"].forEach(function (key) {
      if (!dashboard[key]) addError(errors, counts, "dashboardPolicyErrors", key, dashboard[key]);
    });
    if (policy.newStandaloneDashboardAllowed !== false || policy.rightDashboardMustRemain !== true) {
      addError(errors, counts, "dashboardPolicyErrors", "policy", policy);
    }

    var contract = arenaPlan.runtimeContract || {};
    ["requiredRendererMethods", "requiredControllerMethods", "requiredConnectivityMethods", "requiredCellLoadMethods"].forEach(function (key) {
      if (!Array.isArray(contract[key]) || contract[key].length === 0) {
        addError(errors, counts, "runtimeContractErrors", key, contract[key]);
      }
    });

    var forbidden = countForbiddenServingTowerKeys(arenaPlan);
    if (forbidden !== 0) addError(errors, counts, "fixedServingTowerErrors", "arenaPlan", forbidden);

    var expected = arenaPlan.expectedCounts || {};
    var actual = {
      crowdActors: crowd.length,
      phones: phones.length,
      aggregateDemandSources: aggregateSources.length,
      dynamicLoadSources: dynamicSources.length,
      visiblePhoneDemandUnits: visibleDemand,
      aggregateDemandUnits: aggregateDemand,
      totalEventDemandUnits: totalDemand,
      expectedServingTowers: Array.from(new Set(referenceTowerIds.filter(Boolean))).length,
      mission002Runtimes: arenaPlan.event.mission002RuntimeCreated === true ? 1 : 0,
      mission002Actors: 0,
      patients: 0,
      automaticEventStarts: policy.automaticEventStartAllowed === true ? 1 : 0,
      automaticMissionStarts: policy.automaticMissionStartAllowed === true ? 1 : 0,
      automaticBOSActivations: policy.automaticBOSActivationAllowed === true ? 1 : 0,
      fixedServingTowerDefinitions: forbidden,
      newStandalonePanels: policy.newStandaloneDashboardAllowed === true ? 1 : 0
    };
    Object.keys(expected).forEach(function (key) {
      if (Number(actual[key]) !== Number(expected[key])) {
        addError(errors, counts, "expectedCountErrors", key, { actual: actual[key], expected: expected[key] });
      }
    });

    return createResult(errors, counts, actual);
  }

  function createResult(errors, counts, actualCounts) {
    return {
      title: "MISSION BOS ARENA EVENT & CELL LOAD FOUNDATION VALIDATION",
      status: errors.length === 0 ? "PASSED" : "FAILED",
      counts: counts,
      actualCounts: actualCounts || {},
      errors: errors
    };
  }

  function logResult(result) {
    var method = result && result.status === "PASSED" ? "log" : "error";
    console.group(result ? result.title : "MISSION BOS ARENA EVENT & CELL LOAD FOUNDATION VALIDATION");
    if (!result) {
      console.error("Validation result missing.");
      console.groupEnd();
      return;
    }
    Object.keys(result.counts || {}).forEach(function (key) { console[method](key + ": " + result.counts[key]); });
    Object.keys(result.actualCounts || {}).forEach(function (key) { console[method](key + ": " + result.actualCounts[key]); });
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosArenaEventValidator = { validate: validate, logResult: logResult };
})();
