/* Mission BOS - Build 008R.9
   Structural and spatial validator for the deterministic incident scene plan.
   No Three.js dependency. No modules. No fetch.
*/
(function () {
  "use strict";

  var ACTIVE_SCENE_STATES = ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"];

  function finite(value) {
    var number = Number(value);
    return isFinite(number) ? number : null;
  }

  function rectFromWorldRect(item) {
    var source = item && item.worldRect ? item.worldRect : item;
    if (!source) return null;
    var x = finite(source.x);
    var z = finite(source.z);
    var width = finite(source.width);
    var depth = finite(source.depth);
    if (x === null || z === null || width === null || depth === null || width <= 0 || depth <= 0) return null;
    return { x: x, z: z, width: width, depth: depth };
  }

  function rectFromPosition(item) {
    if (!item || !item.position || !item.footprint) return null;
    var x = finite(item.position.x);
    var z = finite(item.position.z);
    var width = finite(item.footprint.width);
    var depth = finite(item.footprint.depth);
    if (x === null || z === null || width === null || depth === null || width <= 0 || depth <= 0) return null;
    return { x: x, z: z, width: width, depth: depth };
  }

  function intersects(a, b, margin) {
    if (!a || !b) return false;
    var m = finite(margin);
    if (m === null) m = 0;
    return Math.abs(a.x - b.x) < (a.width + b.width) / 2 + m &&
      Math.abs(a.z - b.z) < (a.depth + b.depth) / 2 + m;
  }

  function contains(outer, inner, tolerance) {
    if (!outer || !inner) return false;
    var t = finite(tolerance);
    if (t === null) t = 0.0001;
    return inner.x - inner.width / 2 >= outer.x - outer.width / 2 - t &&
      inner.x + inner.width / 2 <= outer.x + outer.width / 2 + t &&
      inner.z - inner.depth / 2 >= outer.z - outer.depth / 2 - t &&
      inner.z + inner.depth / 2 <= outer.z + outer.depth / 2 + t;
  }

  function pointInside(rect, point, tolerance) {
    if (!rect || !point) return false;
    var x = finite(point.x);
    var z = finite(point.z);
    if (x === null || z === null) return false;
    var t = finite(tolerance);
    if (t === null) t = 0.0001;
    return x >= rect.x - rect.width / 2 - t && x <= rect.x + rect.width / 2 + t &&
      z >= rect.z - rect.depth / 2 - t && z <= rect.z + rect.depth / 2 + t;
  }

  function distance2D(a, b) {
    if (!a || !b) return Infinity;
    var ax = finite(a.x), az = finite(a.z), bx = finite(b.x), bz = finite(b.z);
    if (ax === null || az === null || bx === null || bz === null) return Infinity;
    var dx = ax - bx;
    var dz = az - bz;
    return Math.sqrt(dx * dx + dz * dz);
  }

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      if (items[i] && items[i].id === id) return items[i];
    }
    return null;
  }

  function sameStateSet(actual, expected) {
    var a = (actual || []).slice().sort();
    var e = (expected || []).slice().sort();
    if (a.length !== e.length) return false;
    for (var i = 0; i < a.length; i += 1) if (a[i] !== e[i]) return false;
    return true;
  }

  function addError(errors, check, id, detail) {
    errors.push({ check: check, id: id || null, detail: detail || null });
  }

  function countBy(items, predicate) {
    var count = 0;
    for (var i = 0; i < (items || []).length; i += 1) if (predicate(items[i])) count += 1;
    return count;
  }

  function vehicleHoldRect(responsePlan, incidentPlan, vehicleId) {
    var vehicle = findById(responsePlan && responsePlan.vehicles, vehicleId);
    var incident = incidentPlan && incidentPlan.incident;
    if (!vehicle || !incident) return null;
    var staging = vehicleId === "RESPONSE_FIRE_01" ? incident.fireStaging : incident.policeStaging;
    if (!staging) return null;
    var width = finite(vehicle.footprintWidth);
    var depth = finite(vehicle.footprintLength);
    if (width === null || depth === null) return null;
    return { x: Number(staging.x), z: Number(staging.z), width: width, depth: depth };
  }

  function validate(layout, propsPlan, responsePlan, incidentPlan, missionPlan, scenePlan) {
    var errors = [];
    var counts = {
      sourceDependencyErrors: 0,
      sourcePhaseErrors: 0,
      incidentReferenceErrors: 0,
      zoneDefinitionErrors: 0,
      actorDefinitionErrors: 0,
      actorOutsideZoneErrors: 0,
      actorCorridorErrors: 0,
      actorRoadErrors: 0,
      actorBuildingErrors: 0,
      actorTowerErrors: 0,
      actorTechnologyPlotErrors: 0,
      actorStaticPropErrors: 0,
      actorResponseVehicleErrors: 0,
      actorActorErrors: 0,
      closureDefinitionErrors: 0,
      closureOutsideZoneErrors: 0,
      closureOutsideRoadErrors: 0,
      closureResponseVehicleErrors: 0,
      closureObjectOverlapErrors: 0,
      hoseDefinitionErrors: 0,
      hoseObstacleErrors: 0,
      statePolicyErrors: 0,
      expectedCountErrors: 0
    };

    if (!layout || !propsPlan || !responsePlan || !incidentPlan || !missionPlan || !scenePlan) {
      addError(errors, "Source dependency", null, {
        layout: !!layout,
        propsPlan: !!propsPlan,
        responsePlan: !!responsePlan,
        incidentPlan: !!incidentPlan,
        missionPlan: !!missionPlan,
        scenePlan: !!scenePlan
      });
      counts.sourceDependencyErrors += 1;
      return createResult(errors, counts, {});
    }

    if (scenePlan.buildBase !== "008R.8") {
      addError(errors, "Source phase", "buildBase", { expected: "008R.8", actual: scenePlan.buildBase });
      counts.sourcePhaseErrors += 1;
    }
    if (scenePlan.sourceMissionPhase !== missionPlan.phase) {
      addError(errors, "Source phase", "sourceMissionPhase", { expected: missionPlan.phase, actual: scenePlan.sourceMissionPhase });
      counts.sourcePhaseErrors += 1;
    }

    var incidentReference = scenePlan.incidentReference || {};
    var incident = incidentPlan.incident || {};
    if (incidentReference.missionId !== incident.id || incidentReference.buildingId !== incident.buildingId || incidentReference.responseRoadId !== incident.responseRoadId) {
      addError(errors, "Incident reference", incidentReference.missionId, { expected: incident, actual: incidentReference });
      counts.incidentReferenceErrors += 1;
    }
    if (distance2D(incidentReference.facadeAnchor, incident.facadeAnchor) > 0.001 ||
        distance2D(incidentReference.fireStaging, incident.fireStaging) > 0.001 ||
        distance2D(incidentReference.policeStaging, incident.policeStaging) > 0.001) {
      addError(errors, "Incident reference coordinates", incidentReference.missionId, null);
      counts.incidentReferenceErrors += 1;
    }

    var zones = scenePlan.zones || [];
    var zoneMap = Object.create(null);
    for (var zi = 0; zi < zones.length; zi += 1) {
      var zone = zones[zi];
      var zoneRect = rectFromWorldRect(zone);
      if (!zone || !zone.id || !zoneRect || zoneMap[zone.id]) {
        addError(errors, "Zone definition", zone && zone.id, zone);
        counts.zoneDefinitionErrors += 1;
        continue;
      }
      zoneMap[zone.id] = { data: zone, rect: zoneRect };
    }

    var roadRects = (layout.roadSurfaces || []).map(function (item) { return { id: item.id, rect: rectFromWorldRect(item) }; });
    var corridorRects = (layout.noBuildCorridors || []).map(function (item) { return { id: item.id, rect: rectFromWorldRect(item) }; });
    var buildingRects = (layout.buildings || []).map(function (item) { return { id: item.id, rect: rectFromWorldRect(item) }; });
    var towerRects = (layout.mobileTowers || []).map(function (item) { return { id: item.id, rect: rectFromWorldRect(item) }; });
    var technologyRects = (layout.technologyPlots || []).map(function (item) { return { id: item.id, rect: rectFromWorldRect(item) }; });
    var propRects = (propsPlan.props || []).map(function (item) { return { id: item.id, rect: rectFromWorldRect(item) }; });
    var fireHoldRect = vehicleHoldRect(responsePlan, incidentPlan, "RESPONSE_FIRE_01");
    var policeHoldRect = vehicleHoldRect(responsePlan, incidentPlan, "RESPONSE_POLICE_01");

    var actors = scenePlan.actors || [];
    var actorRects = [];
    for (var ai = 0; ai < actors.length; ai += 1) {
      var actor = actors[ai];
      var actorRect = rectFromPosition(actor);
      var actorZone = actor && zoneMap[actor.zoneId];
      if (!actor || !actor.id || !actor.role || !actorRect || !actorZone || !Array.isArray(actor.visibleStates)) {
        addError(errors, "Actor definition", actor && actor.id, actor);
        counts.actorDefinitionErrors += 1;
        continue;
      }
      actorRects.push({ id: actor.id, role: actor.role, rect: actorRect });
      if (!contains(actorZone.rect, actorRect, 0.001)) {
        addError(errors, "Actor outside zone", actor.id, { zoneId: actor.zoneId, actorRect: actorRect, zoneRect: actorZone.rect });
        counts.actorOutsideZoneErrors += 1;
      }
      for (var ci = 0; ci < corridorRects.length; ci += 1) {
        if (intersects(actorRect, corridorRects[ci].rect, 0.02)) {
          addError(errors, "Actor / corridor", actor.id, corridorRects[ci].id);
          counts.actorCorridorErrors += 1;
        }
      }
      for (var ri = 0; ri < roadRects.length; ri += 1) {
        if (intersects(actorRect, roadRects[ri].rect, 0.02)) {
          addError(errors, "Actor / road", actor.id, roadRects[ri].id);
          counts.actorRoadErrors += 1;
        }
      }
      for (var bi = 0; bi < buildingRects.length; bi += 1) {
        if (intersects(actorRect, buildingRects[bi].rect, 0.03)) {
          addError(errors, "Actor / building", actor.id, buildingRects[bi].id);
          counts.actorBuildingErrors += 1;
        }
      }
      for (var ti = 0; ti < towerRects.length; ti += 1) {
        if (intersects(actorRect, towerRects[ti].rect, 0.03)) {
          addError(errors, "Actor / tower", actor.id, towerRects[ti].id);
          counts.actorTowerErrors += 1;
        }
      }
      for (var techi = 0; techi < technologyRects.length; techi += 1) {
        if (intersects(actorRect, technologyRects[techi].rect, 0.03)) {
          addError(errors, "Actor / technology plot", actor.id, technologyRects[techi].id);
          counts.actorTechnologyPlotErrors += 1;
        }
      }
      for (var pi = 0; pi < propRects.length; pi += 1) {
        if (intersects(actorRect, propRects[pi].rect, 0.08)) {
          addError(errors, "Actor / static prop", actor.id, propRects[pi].id);
          counts.actorStaticPropErrors += 1;
        }
      }
      if (intersects(actorRect, fireHoldRect, 0.12)) {
        addError(errors, "Actor / fire vehicle", actor.id, "RESPONSE_FIRE_01");
        counts.actorResponseVehicleErrors += 1;
      }
      if (intersects(actorRect, policeHoldRect, 0.12)) {
        addError(errors, "Actor / police vehicle", actor.id, "RESPONSE_POLICE_01");
        counts.actorResponseVehicleErrors += 1;
      }
    }

    for (var a = 0; a < actorRects.length; a += 1) {
      for (var b = a + 1; b < actorRects.length; b += 1) {
        if (intersects(actorRects[a].rect, actorRects[b].rect, 0.18)) {
          addError(errors, "Actor / actor", actorRects[a].id, actorRects[b].id);
          counts.actorActorErrors += 1;
        }
      }
    }

    var closure = scenePlan.roadClosure || {};
    var closureZone = zoneMap[closure.zoneId];
    var responseRoad = findById(layout.roadSurfaces, incident.responseRoadId);
    var responseRoadRect = rectFromWorldRect(responseRoad);
    var closureObjects = [];
    if (!closureZone || !responseRoadRect || !sameStateSet(closure.visibleStates, ACTIVE_SCENE_STATES)) {
      addError(errors, "Closure definition", closure.zoneId, closure);
      counts.closureDefinitionErrors += 1;
    }
    ["barriers", "cones"].forEach(function (key) {
      var items = closure[key] || [];
      for (var i = 0; i < items.length; i += 1) {
        var item = items[i];
        var itemRect = rectFromPosition(item);
        if (!item || !item.id || !itemRect) {
          addError(errors, "Closure definition", item && item.id, item);
          counts.closureDefinitionErrors += 1;
          continue;
        }
        closureObjects.push({ id: item.id, rect: itemRect });
        if (!closureZone || !contains(closureZone.rect, itemRect, 0.001)) {
          addError(errors, "Closure outside zone", item.id, closure.zoneId);
          counts.closureOutsideZoneErrors += 1;
        }
        if (!contains(responseRoadRect, itemRect, 0.001)) {
          addError(errors, "Closure outside road", item.id, incident.responseRoadId);
          counts.closureOutsideRoadErrors += 1;
        }
        if (intersects(itemRect, fireHoldRect, 0.2) || intersects(itemRect, policeHoldRect, 0.2)) {
          addError(errors, "Closure / response vehicle", item.id, null);
          counts.closureResponseVehicleErrors += 1;
        }
      }
    });
    for (var co = 0; co < closureObjects.length; co += 1) {
      for (var cp = co + 1; cp < closureObjects.length; cp += 1) {
        if (intersects(closureObjects[co].rect, closureObjects[cp].rect, 0.04)) {
          addError(errors, "Closure object overlap", closureObjects[co].id, closureObjects[cp].id);
          counts.closureObjectOverlapErrors += 1;
        }
      }
    }

    var hose = scenePlan.hoseLine || {};
    var hosePoints = hose.points || [];
    if (!hose.id || hosePoints.length < 2 || !sameStateSet(hose.visibleStates, ACTIVE_SCENE_STATES) || finite(hose.radius) === null || Number(hose.radius) <= 0) {
      addError(errors, "Hose definition", hose.id, hose);
      counts.hoseDefinitionErrors += 1;
    } else {
      if (distance2D(hosePoints[0], incident.fireStaging) > 1.25) {
        addError(errors, "Hose start", hose.id, { expectedNear: incident.fireStaging, actual: hosePoints[0] });
        counts.hoseDefinitionErrors += 1;
      }
      if (distance2D(hosePoints[hosePoints.length - 1], incident.facadeAnchor) > 1.25) {
        addError(errors, "Hose facade end", hose.id, { expectedNear: incident.facadeAnchor, actual: hosePoints[hosePoints.length - 1] });
        counts.hoseDefinitionErrors += 1;
      }
      for (var hp = 0; hp < hosePoints.length; hp += 1) {
        if (finite(hosePoints[hp].x) === null || finite(hosePoints[hp].y) === null || finite(hosePoints[hp].z) === null) {
          addError(errors, "Hose finite point", hose.id, hosePoints[hp]);
          counts.hoseDefinitionErrors += 1;
        }
        for (var hb = 0; hb < buildingRects.length; hb += 1) {
          if (pointInside(buildingRects[hb].rect, hosePoints[hp], -0.02)) {
            addError(errors, "Hose / building", hose.id, buildingRects[hb].id);
            counts.hoseObstacleErrors += 1;
          }
        }
        for (var ht = 0; ht < towerRects.length; ht += 1) {
          if (pointInside(towerRects[ht].rect, hosePoints[hp], 0.02)) {
            addError(errors, "Hose / tower", hose.id, towerRects[ht].id);
            counts.hoseObstacleErrors += 1;
          }
        }
      }
    }

    var presentation = scenePlan.statePresentation || {};
    var missionStates = missionPlan.stateOrder || [];
    for (var si = 0; si < missionStates.length; si += 1) {
      var stateId = missionStates[si];
      var statePresentation = presentation[stateId];
      if (!statePresentation || typeof statePresentation.sceneVisible !== "boolean" || finite(statePresentation.phoneGlow) === null) {
        addError(errors, "State presentation", stateId, statePresentation);
        counts.statePolicyErrors += 1;
      }
    }
    for (var as = 0; as < actors.length; as += 1) {
      if (!sameStateSet(actors[as].visibleStates, ACTIVE_SCENE_STATES)) {
        addError(errors, "Actor visible states", actors[as].id, actors[as].visibleStates);
        counts.statePolicyErrors += 1;
      }
    }
    if (presentation.RETURNING && presentation.RETURNING.sceneVisible !== false) {
      addError(errors, "Return visibility", "RETURNING", presentation.RETURNING);
      counts.statePolicyErrors += 1;
    }
    if (!scenePlan.scenePolicy || scenePlan.scenePolicy.roadClosureHiddenBeforeReturn !== true || scenePlan.scenePolicy.bosDoesNotRemoveSpectators !== true) {
      addError(errors, "Scene policy", "scenePolicy", scenePlan.scenePolicy);
      counts.statePolicyErrors += 1;
    }

    var actual = {
      zones: zones.length,
      actors: actors.length,
      firefighters: countBy(actors, function (item) { return item.role === "firefighter"; }),
      policeOfficers: countBy(actors, function (item) { return item.role === "police"; }),
      spectators: countBy(actors, function (item) { return item.role === "spectator"; }),
      phones: countBy(actors, function (item) { return item.phone === true; }),
      barriers: (closure.barriers || []).length,
      cones: (closure.cones || []).length,
      hoseLines: hose.id ? 1 : 0,
      missionVisibleStates: ACTIVE_SCENE_STATES.length,
      returnVisibleMissionObjects: presentation.RETURNING && presentation.RETURNING.sceneVisible ? 1 : 0
    };
    var expected = scenePlan.expectedCounts || {};
    Object.keys(expected).forEach(function (key) {
      if (Number(actual[key]) !== Number(expected[key])) {
        addError(errors, "Expected count", key, { expected: expected[key], actual: actual[key] });
        counts.expectedCountErrors += 1;
      }
    });

    return createResult(errors, counts, actual);
  }

  function createResult(errors, counts, actual) {
    return {
      title: "MISSION BOS MISSION 001 INCIDENT SCENE VALIDATION",
      counts: counts,
      actual: actual || {},
      errors: errors,
      status: errors.length === 0 ? "PASSED" : "FAILED"
    };
  }

  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    Object.keys(result.counts || {}).forEach(function (key) {
      console[method](key + ": " + result.counts[key]);
    });
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosMission001SceneValidator = {
    validate: validate,
    logResult: logResult
  };
})();
