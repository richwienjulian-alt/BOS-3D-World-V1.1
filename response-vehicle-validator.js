/* Mission BOS - Build 008R.6
   Deterministic response vehicle geometry, route and collision validator.
   No Three.js dependency. No modules. No fetch.
*/

(function () {
  "use strict";

  var EPSILON = 1e-7;

  function numericRect(item, preferredKey) {
    var source = item && (item[preferredKey] || item.worldRect || item.rect || item);
    return {
      id: item && item.id ? item.id : "UNKNOWN",
      x: Number(source && source.x),
      z: Number(source && source.z),
      width: Number(source && source.width),
      depth: Number(source && source.depth)
    };
  }

  function rectsFrom(items, preferredKey) {
    return (items || []).map(function (item) {
      return numericRect(item, preferredKey);
    });
  }

  function validRect(rect) {
    return (
      rect &&
      isFinite(rect.x) &&
      isFinite(rect.z) &&
      isFinite(rect.width) && rect.width > 0 &&
      isFinite(rect.depth) && rect.depth > 0
    );
  }

  function pointInRect(rect, x, z, epsilon) {
    var e = epsilon == null ? EPSILON : epsilon;
    return (
      Math.abs(x - rect.x) <= rect.width / 2 + e &&
      Math.abs(z - rect.z) <= rect.depth / 2 + e
    );
  }

  function pointInAnyRect(rects, x, z, epsilon) {
    for (var i = 0; i < rects.length; i += 1) {
      if (pointInRect(rects[i], x, z, epsilon)) return true;
    }
    return false;
  }

  function rectAreaOverlap(a, b) {
    var overlapX = Math.min(a.x + a.width / 2, b.x + b.width / 2) -
      Math.max(a.x - a.width / 2, b.x - b.width / 2);
    var overlapZ = Math.min(a.z + a.depth / 2, b.z + b.depth / 2) -
      Math.max(a.z - a.depth / 2, b.z - b.depth / 2);
    return overlapX > EPSILON && overlapZ > EPSILON;
  }

  function rectContained(inner, outer) {
    return (
      inner.x - inner.width / 2 >= outer.x - outer.width / 2 - EPSILON &&
      inner.x + inner.width / 2 <= outer.x + outer.width / 2 + EPSILON &&
      inner.z - inner.depth / 2 >= outer.z - outer.depth / 2 - EPSILON &&
      inner.z + inner.depth / 2 <= outer.z + outer.depth / 2 + EPSILON
    );
  }

  function prepareOpenRoute(routeDefinition) {
    var points = (routeDefinition.points || []).map(function (point) {
      return { x: Number(point.x), z: Number(point.z) };
    });
    var segments = [];
    var length = 0;

    for (var i = 0; i < points.length - 1; i += 1) {
      var start = points[i];
      var end = points[i + 1];
      var dx = end.x - start.x;
      var dz = end.z - start.z;
      var segmentLength = Math.sqrt(dx * dx + dz * dz);
      if (segmentLength <= EPSILON) continue;
      segments.push({
        start: start,
        end: end,
        length: segmentLength,
        accumulatedStart: length
      });
      length += segmentLength;
    }

    return {
      id: routeDefinition.id,
      points: points,
      segments: segments,
      length: length,
      closed: routeDefinition.closed === true
    };
  }

  function sampleOpenRoute(route, distance, reverseHeading) {
    if (!route || route.length <= EPSILON || route.segments.length === 0) {
      return { x: 0, z: 0, angle: 0 };
    }

    var target = Math.max(0, Math.min(Number(distance) || 0, route.length));
    var selected = route.segments[route.segments.length - 1];

    for (var i = 0; i < route.segments.length; i += 1) {
      var segment = route.segments[i];
      if (target <= segment.accumulatedStart + segment.length + EPSILON) {
        selected = segment;
        break;
      }
    }

    var local = target - selected.accumulatedStart;
    var t = selected.length <= EPSILON ? 0 : Math.max(0, Math.min(1, local / selected.length));
    var dx = selected.end.x - selected.start.x;
    var dz = selected.end.z - selected.start.z;
    var angle = Math.atan2(dx, dz);
    if (reverseHeading) angle += Math.PI;

    return {
      x: selected.start.x + dx * t,
      z: selected.start.z + dz * t,
      angle: angle
    };
  }

  function footprintPoints(pose, length, width, lengthSamples, widthSamples) {
    var points = [];
    var forwardX = Math.sin(pose.angle);
    var forwardZ = Math.cos(pose.angle);
    var rightX = Math.cos(pose.angle);
    var rightZ = -Math.sin(pose.angle);
    var lSamples = Math.max(3, Number(lengthSamples) || 11);
    var wSamples = Math.max(3, Number(widthSamples) || 7);

    for (var i = 0; i < lSamples; i += 1) {
      var along = -length / 2 + (length * i) / (lSamples - 1);
      for (var j = 0; j < wSamples; j += 1) {
        var across = -width / 2 + (width * j) / (wSamples - 1);
        points.push({
          x: pose.x + forwardX * along + rightX * across,
          z: pose.z + forwardZ * along + rightZ * across
        });
      }
    }

    return points;
  }

  function rectangleCorners(pose, length, width, margin) {
    var halfLength = length / 2 + (Number(margin) || 0);
    var halfWidth = width / 2 + (Number(margin) || 0);
    var forwardX = Math.sin(pose.angle);
    var forwardZ = Math.cos(pose.angle);
    var rightX = Math.cos(pose.angle);
    var rightZ = -Math.sin(pose.angle);
    var combinations = [
      [-halfLength, -halfWidth],
      [-halfLength, halfWidth],
      [halfLength, halfWidth],
      [halfLength, -halfWidth]
    ];

    return combinations.map(function (pair) {
      return {
        x: pose.x + forwardX * pair[0] + rightX * pair[1],
        z: pose.z + forwardZ * pair[0] + rightZ * pair[1]
      };
    });
  }

  function projectPolygon(axisX, axisZ, polygon) {
    var min = Infinity;
    var max = -Infinity;
    for (var i = 0; i < polygon.length; i += 1) {
      var projection = polygon[i].x * axisX + polygon[i].z * axisZ;
      min = Math.min(min, projection);
      max = Math.max(max, projection);
    }
    return { min: min, max: max };
  }

  function polygonsOverlapSAT(a, b) {
    var polygons = [a, b];

    for (var p = 0; p < polygons.length; p += 1) {
      var polygon = polygons[p];
      for (var i = 0; i < polygon.length; i += 1) {
        var current = polygon[i];
        var next = polygon[(i + 1) % polygon.length];
        var edgeX = next.x - current.x;
        var edgeZ = next.z - current.z;
        var axisX = -edgeZ;
        var axisZ = edgeX;
        var magnitude = Math.sqrt(axisX * axisX + axisZ * axisZ);
        if (magnitude <= EPSILON) continue;
        axisX /= magnitude;
        axisZ /= magnitude;

        var projectionA = projectPolygon(axisX, axisZ, a);
        var projectionB = projectPolygon(axisX, axisZ, b);
        if (projectionA.max < projectionB.min || projectionB.max < projectionA.min) {
          return false;
        }
      }
    }

    return true;
  }

  function circleOrientedRectOverlap(circle, radius, pose, length, width, margin) {
    var forwardX = Math.sin(pose.angle);
    var forwardZ = Math.cos(pose.angle);
    var rightX = Math.cos(pose.angle);
    var rightZ = -Math.sin(pose.angle);
    var dx = circle.x - pose.x;
    var dz = circle.z - pose.z;
    var localForward = dx * forwardX + dz * forwardZ;
    var localRight = dx * rightX + dz * rightZ;
    var halfLength = length / 2 + (Number(margin) || 0);
    var halfWidth = width / 2 + (Number(margin) || 0);
    var closestForward = Math.max(-halfLength, Math.min(halfLength, localForward));
    var closestRight = Math.max(-halfWidth, Math.min(halfWidth, localRight));
    var differenceForward = localForward - closestForward;
    var differenceRight = localRight - closestRight;
    return differenceForward * differenceForward + differenceRight * differenceRight <= radius * radius;
  }

  function routeSamples(route, step, reverseHeading) {
    var samples = [];
    var increment = Math.max(0.02, Number(step) || 0.1);
    for (var distance = 0; distance < route.length; distance += increment) {
      samples.push(sampleOpenRoute(route, distance, reverseHeading));
    }
    samples.push(sampleOpenRoute(route, route.length, reverseHeading));
    return samples;
  }

  function countKinds(vehicles) {
    var result = {
      vehicles: vehicles.length,
      fireTrucks: 0,
      policeCars: 0,
      wheels: 0,
      lightbars: 0,
      ladders: 0
    };

    vehicles.forEach(function (vehicle) {
      if (vehicle.kind === "fire-truck") result.fireTrucks += 1;
      if (vehicle.kind === "police-car") result.policeCars += 1;
      result.wheels += Number(vehicle.wheelCount || 0);
      result.lightbars += Number(vehicle.modelDetails && vehicle.modelDetails.lightbars || 0);
      result.ladders += Number(vehicle.modelDetails && vehicle.modelDetails.ladders || 0);
    });

    return result;
  }

  function validate(layout, propsPlan, trafficPlan, pedestrianPlan, plan) {
    var errors = [];
    var checks = Object.create(null);

    function ensureCheck(name) {
      if (!checks[name]) checks[name] = [];
    }

    function addError(name, data) {
      ensureCheck(name);
      checks[name].push(data);
      errors.push({ check: name, data: data });
    }

    [
      "Access surface definition",
      "Access surface / obstacle",
      "Route definition",
      "Route surface reference",
      "Response footprint outside allowed surface",
      "Response / building",
      "Response / tower",
      "Response / technology plot",
      "Response / parking",
      "Response / green",
      "Response / static prop",
      "Response / civilian traffic swept path",
      "Response / pedestrian swept path",
      "Initial response vehicle overlap",
      "Simulated response vehicle collision",
      "Invalid response vehicle specification",
      "Expected counts",
      "Source phase"
    ].forEach(ensureCheck);

    if (!layout || !propsPlan || !trafficPlan || !pedestrianPlan || !plan) {
      addError("Source phase", { message: "One or more source plans are missing." });
      return createResult(checks, errors, {}, {});
    }

    var buildings = rectsFrom(layout.buildings);
    var towers = rectsFrom(layout.mobileTowers);
    var technologyPlots = rectsFrom(layout.technologyPlots);
    var parkingAreas = rectsFrom(layout.parkingAreas);
    var greenAreas = rectsFrom(layout.greenAreas);
    var roadSurfaces = rectsFrom(layout.roadSurfaces);
    var pavedAreas = rectsFrom(layout.pavedAreas);
    var staticProps = rectsFrom(propsPlan.props);
    var accessSurfaces = (plan.accessSurfaces || []).map(function (item) {
      return {
        id: item.id,
        validationRect: numericRect(item, "validationRect"),
        renderRect: numericRect(item, "renderRect"),
        stationBuildingId: item.stationBuildingId
      };
    });

    var accessById = Object.create(null);
    accessSurfaces.forEach(function (access) {
      if (!access.id || accessById[access.id]) {
        addError("Access surface definition", { id: access.id, issue: "missing or duplicate ID" });
        return;
      }
      accessById[access.id] = access;
      if (!validRect(access.validationRect) || !validRect(access.renderRect)) {
        addError("Access surface definition", { id: access.id, issue: "invalid rectangle" });
      } else if (!rectContained(access.renderRect, access.validationRect)) {
        addError("Access surface definition", { id: access.id, issue: "renderRect is not inside validationRect" });
      }
      if (!(layout.buildings || []).some(function (building) { return building.id === access.stationBuildingId; })) {
        addError("Access surface definition", { id: access.id, issue: "station building reference missing" });
      }
    });

    var accessObstacles = [
      { kind: "building", rects: buildings },
      { kind: "tower", rects: towers },
      { kind: "technology plot", rects: technologyPlots },
      { kind: "parking", rects: parkingAreas },
      { kind: "green", rects: greenAreas },
      { kind: "static prop", rects: staticProps }
    ];

    accessSurfaces.forEach(function (access) {
      if (!validRect(access.validationRect)) return;
      accessObstacles.forEach(function (collection) {
        collection.rects.forEach(function (obstacle) {
          if (rectAreaOverlap(access.validationRect, obstacle)) {
            addError("Access surface / obstacle", {
              accessId: access.id,
              obstacleKind: collection.kind,
              obstacleId: obstacle.id
            });
          }
        });
      });
    });

    var surfaceById = Object.create(null);
    roadSurfaces.forEach(function (rect) { surfaceById[rect.id] = rect; });
    pavedAreas.forEach(function (rect) { surfaceById[rect.id] = rect; });
    accessSurfaces.forEach(function (access) { surfaceById[access.id] = access.validationRect; });

    var routeDefinitions = plan.routes || [];
    var routesById = Object.create(null);
    routeDefinitions.forEach(function (definition) {
      if (!definition.id || routesById[definition.id]) {
        addError("Route definition", { id: definition.id, issue: "missing or duplicate ID" });
        return;
      }
      var prepared = prepareOpenRoute(definition);
      routesById[definition.id] = prepared;
      if (definition.closed === true || prepared.segments.length < 1 || prepared.length <= EPSILON) {
        addError("Route definition", { id: definition.id, issue: "route must be open and non-empty" });
      }
      if (Math.abs(Number(definition.length) - prepared.length) > 0.02) {
        addError("Route definition", {
          id: definition.id,
          issue: "stored route length differs from calculated length",
          stored: Number(definition.length),
          calculated: prepared.length
        });
      }
      (definition.allowedSurfaceIds || []).forEach(function (surfaceId) {
        if (!surfaceById[surfaceId]) {
          addError("Route surface reference", { routeId: definition.id, surfaceId: surfaceId });
        }
      });
    });

    var vehicles = plan.vehicles || [];
    var vehicleById = Object.create(null);
    var margin = Number(plan.simulation && plan.simulation.collisionSafetyMargin) || 0;
    var sampleStep = Number(plan.simulation && plan.simulation.routeSampleStep) || 0.05;
    var lengthSamples = Number(plan.simulation && plan.simulation.footprintLengthSamples) || 11;
    var widthSamples = Number(plan.simulation && plan.simulation.footprintWidthSamples) || 7;

    vehicles.forEach(function (vehicle) {
      if (!vehicle.id || vehicleById[vehicle.id]) {
        addError("Invalid response vehicle specification", { id: vehicle.id, issue: "missing or duplicate ID" });
        return;
      }
      vehicleById[vehicle.id] = vehicle;
      var route = routesById[vehicle.routeId];
      if (!route) {
        addError("Invalid response vehicle specification", { id: vehicle.id, issue: "route missing" });
        return;
      }
      if (
        [vehicle.outboundSpeed, vehicle.returnSpeed, vehicle.bodyLength, vehicle.bodyWidth,
          vehicle.footprintLength, vehicle.footprintWidth].some(function (value) {
          return !isFinite(Number(value)) || Number(value) <= 0;
        }) ||
        Number(vehicle.wheelCount) !== 4 ||
        (vehicle.kind !== "fire-truck" && vehicle.kind !== "police-car") ||
        Number(vehicle.footprintLength) < Number(vehicle.bodyLength) ||
        Number(vehicle.footprintWidth) < Number(vehicle.bodyWidth) ||
        !isFinite(Number(vehicle.dispatchDelaySeconds)) || Number(vehicle.dispatchDelaySeconds) < 0
      ) {
        addError("Invalid response vehicle specification", { id: vehicle.id, issue: "invalid dimensions, speed, delay, kind or wheel count" });
      }
    });

    routeDefinitions.forEach(function (routeDefinition) {
      var vehicle = vehicleById[routeDefinition.vehicleId];
      var route = routesById[routeDefinition.id];
      if (!vehicle || !route) {
        addError("Route definition", { id: routeDefinition.id, issue: "vehicle reference missing" });
        return;
      }
      if (vehicle.routeId !== routeDefinition.id) {
        addError("Route definition", { id: routeDefinition.id, issue: "vehicle route reference mismatch" });
      }

      var allowedRects = (routeDefinition.allowedSurfaceIds || []).map(function (id) {
        return surfaceById[id];
      }).filter(Boolean);
      var samples = routeSamples(route, sampleStep, false);
      var outsideFailure = null;
      var obstacleFailures = {
        building: null,
        tower: null,
        technology: null,
        parking: null,
        green: null,
        prop: null
      };

      samples.forEach(function (pose) {
        if (outsideFailure && obstacleFailures.building && obstacleFailures.tower &&
            obstacleFailures.technology && obstacleFailures.parking &&
            obstacleFailures.green && obstacleFailures.prop) return;

        var footprint = footprintPoints(
          pose,
          Number(vehicle.footprintLength) + margin * 2,
          Number(vehicle.footprintWidth) + margin * 2,
          lengthSamples,
          widthSamples
        );

        footprint.forEach(function (point) {
          if (!outsideFailure && !pointInAnyRect(allowedRects, point.x, point.z, EPSILON)) {
            outsideFailure = { x: point.x, z: point.z, pose: pose };
          }
          if (!obstacleFailures.building && pointInAnyRect(buildings, point.x, point.z, EPSILON)) {
            obstacleFailures.building = { x: point.x, z: point.z, pose: pose };
          }
          if (!obstacleFailures.tower && pointInAnyRect(towers, point.x, point.z, EPSILON)) {
            obstacleFailures.tower = { x: point.x, z: point.z, pose: pose };
          }
          if (!obstacleFailures.technology && pointInAnyRect(technologyPlots, point.x, point.z, EPSILON)) {
            obstacleFailures.technology = { x: point.x, z: point.z, pose: pose };
          }
          if (!obstacleFailures.parking && pointInAnyRect(parkingAreas, point.x, point.z, EPSILON)) {
            obstacleFailures.parking = { x: point.x, z: point.z, pose: pose };
          }
          if (!obstacleFailures.green && pointInAnyRect(greenAreas, point.x, point.z, EPSILON)) {
            obstacleFailures.green = { x: point.x, z: point.z, pose: pose };
          }
          if (!obstacleFailures.prop && pointInAnyRect(staticProps, point.x, point.z, EPSILON)) {
            obstacleFailures.prop = { x: point.x, z: point.z, pose: pose };
          }
        });
      });

      if (outsideFailure) addError("Response footprint outside allowed surface", { vehicleId: vehicle.id, routeId: route.id, failure: outsideFailure });
      if (obstacleFailures.building) addError("Response / building", { vehicleId: vehicle.id, routeId: route.id, failure: obstacleFailures.building });
      if (obstacleFailures.tower) addError("Response / tower", { vehicleId: vehicle.id, routeId: route.id, failure: obstacleFailures.tower });
      if (obstacleFailures.technology) addError("Response / technology plot", { vehicleId: vehicle.id, routeId: route.id, failure: obstacleFailures.technology });
      if (obstacleFailures.parking) addError("Response / parking", { vehicleId: vehicle.id, routeId: route.id, failure: obstacleFailures.parking });
      if (obstacleFailures.green) addError("Response / green", { vehicleId: vehicle.id, routeId: route.id, failure: obstacleFailures.green });
      if (obstacleFailures.prop) addError("Response / static prop", { vehicleId: vehicle.id, routeId: route.id, failure: obstacleFailures.prop });
    });

    /* Spatial separation from every possible civilian traffic phase. */
    var trafficRoutesById = Object.create(null);
    (trafficPlan.routes || []).forEach(function (definition) {
      trafficRoutesById[definition.id] = prepareOpenRoute(definition);
    });

    vehicles.forEach(function (responseVehicle) {
      var responseRoute = routesById[responseVehicle.routeId];
      if (!responseRoute) return;
      var responseSamples = routeSamples(responseRoute, 0.15, false);
      var responseRadius = Math.sqrt(
        Math.pow(Number(responseVehicle.footprintLength) / 2 + margin, 2) +
        Math.pow(Number(responseVehicle.footprintWidth) / 2 + margin, 2)
      );
      var conflictFound = false;

      (trafficPlan.vehicles || []).forEach(function (civilVehicle) {
        if (conflictFound) return;
        var civilRoute = trafficRoutesById[civilVehicle.routeId];
        if (!civilRoute) return;
        var civilSamples = routeSamples(civilRoute, 0.25, false);
        var civilLength = Number(civilVehicle.footprintLength);
        var civilWidth = Number(civilVehicle.footprintWidth);
        var civilRadius = Math.sqrt(Math.pow(civilLength / 2 + margin, 2) + Math.pow(civilWidth / 2 + margin, 2));

        for (var r = 0; r < responseSamples.length && !conflictFound; r += 1) {
          var responsePose = responseSamples[r];
          var responsePolygon = rectangleCorners(
            responsePose,
            Number(responseVehicle.footprintLength),
            Number(responseVehicle.footprintWidth),
            margin
          );

          for (var c = 0; c < civilSamples.length; c += 1) {
            var civilPose = civilSamples[c];
            var dx = responsePose.x - civilPose.x;
            var dz = responsePose.z - civilPose.z;
            var maxDistance = responseRadius + civilRadius;
            if (dx * dx + dz * dz > maxDistance * maxDistance) continue;
            var civilPolygon = rectangleCorners(civilPose, civilLength, civilWidth, margin);
            if (polygonsOverlapSAT(responsePolygon, civilPolygon)) {
              addError("Response / civilian traffic swept path", {
                responseVehicleId: responseVehicle.id,
                civilVehicleId: civilVehicle.id,
                responsePose: responsePose,
                civilPose: civilPose
              });
              conflictFound = true;
              break;
            }
          }
        }
      });
    });

    /* Spatial separation from every pedestrian position, independent of phase. */
    var pedestrianRoutesById = Object.create(null);
    (pedestrianPlan.routes || []).forEach(function (definition) {
      pedestrianRoutesById[definition.id] = prepareOpenRoute(definition);
    });

    vehicles.forEach(function (responseVehicle) {
      var responseRoute = routesById[responseVehicle.routeId];
      if (!responseRoute) return;
      var responseSamples = routeSamples(responseRoute, 0.1, false);
      var conflictFound = false;

      (pedestrianPlan.pedestrians || []).forEach(function (pedestrian) {
        if (conflictFound) return;
        var pedestrianRoute = pedestrianRoutesById[pedestrian.routeId];
        if (!pedestrianRoute) return;
        var pedestrianSamples = routeSamples(pedestrianRoute, 0.1, false);
        var radius = Number(pedestrian.personalSpaceRadius) + margin;

        for (var r = 0; r < responseSamples.length && !conflictFound; r += 1) {
          for (var p = 0; p < pedestrianSamples.length; p += 1) {
            if (circleOrientedRectOverlap(
              pedestrianSamples[p],
              radius,
              responseSamples[r],
              Number(responseVehicle.footprintLength),
              Number(responseVehicle.footprintWidth),
              margin
            )) {
              addError("Response / pedestrian swept path", {
                responseVehicleId: responseVehicle.id,
                pedestrianId: pedestrian.id,
                responsePose: responseSamples[r],
                pedestrianPose: pedestrianSamples[p]
              });
              conflictFound = true;
              break;
            }
          }
        }
      });
    });

    /* Initial parked response vehicle separation. */
    for (var firstIndex = 0; firstIndex < vehicles.length; firstIndex += 1) {
      for (var secondIndex = firstIndex + 1; secondIndex < vehicles.length; secondIndex += 1) {
        var firstVehicle = vehicles[firstIndex];
        var secondVehicle = vehicles[secondIndex];
        var firstRoute = routesById[firstVehicle.routeId];
        var secondRoute = routesById[secondVehicle.routeId];
        if (!firstRoute || !secondRoute) continue;
        var firstPose = sampleOpenRoute(firstRoute, 0, false);
        var secondPose = sampleOpenRoute(secondRoute, 0, false);
        if (polygonsOverlapSAT(
          rectangleCorners(firstPose, Number(firstVehicle.footprintLength), Number(firstVehicle.footprintWidth), margin),
          rectangleCorners(secondPose, Number(secondVehicle.footprintLength), Number(secondVehicle.footprintWidth), margin)
        )) {
          addError("Initial response vehicle overlap", { vehicleA: firstVehicle.id, vehicleB: secondVehicle.id });
        }
      }
    }

    /* Deterministic outbound and return sequence collision simulation. */
    var validationStep = Number(plan.simulation && plan.simulation.validationStep) || 0.05;
    var outboundDuration = 0;
    var returnDuration = 0;
    vehicles.forEach(function (vehicle) {
      var route = routesById[vehicle.routeId];
      if (!route) return;
      outboundDuration = Math.max(outboundDuration, Number(vehicle.dispatchDelaySeconds) + route.length / Number(vehicle.outboundSpeed));
      returnDuration = Math.max(returnDuration, route.length / Number(vehicle.returnSpeed));
    });

    function simulateSequence(duration, returning) {
      var collisionFound = false;
      for (var time = 0; time <= duration + EPSILON && !collisionFound; time += validationStep) {
        var poses = vehicles.map(function (vehicle) {
          var route = routesById[vehicle.routeId];
          var distance;
          if (returning) {
            distance = Math.max(0, route.length - Number(vehicle.returnSpeed) * time);
            return { vehicle: vehicle, pose: sampleOpenRoute(route, distance, true) };
          }
          distance = Math.max(0, Number(vehicle.outboundSpeed) * Math.max(0, time - Number(vehicle.dispatchDelaySeconds)));
          distance = Math.min(route.length, distance);
          return { vehicle: vehicle, pose: sampleOpenRoute(route, distance, false) };
        });

        for (var i = 0; i < poses.length && !collisionFound; i += 1) {
          for (var j = i + 1; j < poses.length; j += 1) {
            var first = poses[i];
            var second = poses[j];
            if (polygonsOverlapSAT(
              rectangleCorners(first.pose, Number(first.vehicle.footprintLength), Number(first.vehicle.footprintWidth), margin),
              rectangleCorners(second.pose, Number(second.vehicle.footprintLength), Number(second.vehicle.footprintWidth), margin)
            )) {
              addError("Simulated response vehicle collision", {
                phase: returning ? "RETURN" : "OUTBOUND",
                time: time,
                vehicleA: first.vehicle.id,
                vehicleB: second.vehicle.id,
                poseA: first.pose,
                poseB: second.pose
              });
              collisionFound = true;
              break;
            }
          }
        }
      }
    }

    simulateSequence(outboundDuration, false);
    simulateSequence(returnDuration, true);

    var kinds = countKinds(vehicles);
    var actualCounts = {
      accessSurfaces: accessSurfaces.length,
      routes: routeDefinitions.length,
      vehicles: kinds.vehicles,
      fireTrucks: kinds.fireTrucks,
      policeCars: kinds.policeCars,
      wheels: kinds.wheels,
      lightbars: kinds.lightbars,
      ladders: kinds.ladders
    };
    var expected = plan.expectedCounts || {};
    Object.keys(actualCounts).forEach(function (key) {
      if (Number(expected[key] || 0) !== actualCounts[key]) {
        addError("Expected counts", { key: key, expected: Number(expected[key] || 0), actual: actualCounts[key] });
      }
    });

    if (plan.sourceLayoutPhase !== layout.phase) addError("Source phase", { source: "layout", expected: plan.sourceLayoutPhase, actual: layout.phase });
    if (plan.sourcePropsPhase !== propsPlan.phase) addError("Source phase", { source: "props", expected: plan.sourcePropsPhase, actual: propsPlan.phase });
    if (plan.sourceTrafficPhase !== trafficPlan.phase) addError("Source phase", { source: "traffic", expected: plan.sourceTrafficPhase, actual: trafficPlan.phase });
    if (plan.sourcePedestrianPhase !== pedestrianPlan.phase) addError("Source phase", { source: "pedestrian", expected: plan.sourcePedestrianPhase, actual: pedestrianPlan.phase });

    return createResult(checks, errors, actualCounts, {
      routesById: routesById,
      outboundSimulationSeconds: outboundDuration,
      returnSimulationSeconds: returnDuration,
      routeSampleStep: sampleStep,
      validationStep: validationStep
    });
  }

  function createResult(checks, errors, actualCounts, metadata) {
    var counts = {
      accessSurfaceDefinition: checks["Access surface definition"].length,
      accessSurfaceObstacle: checks["Access surface / obstacle"].length,
      routeDefinition: checks["Route definition"].length,
      routeSurfaceReference: checks["Route surface reference"].length,
      responseFootprintOutsideAllowedSurface: checks["Response footprint outside allowed surface"].length,
      responseBuilding: checks["Response / building"].length,
      responseTower: checks["Response / tower"].length,
      responseTechnologyPlot: checks["Response / technology plot"].length,
      responseParking: checks["Response / parking"].length,
      responseGreen: checks["Response / green"].length,
      responseStaticProp: checks["Response / static prop"].length,
      responseCivilTrafficSweptPath: checks["Response / civilian traffic swept path"].length,
      responsePedestrianSweptPath: checks["Response / pedestrian swept path"].length,
      initialResponseVehicleOverlap: checks["Initial response vehicle overlap"].length,
      simulatedResponseVehicleCollision: checks["Simulated response vehicle collision"].length,
      invalidResponseVehicleSpecification: checks["Invalid response vehicle specification"].length,
      expectedCounts: checks["Expected counts"].length,
      sourcePhase: checks["Source phase"].length
    };
    var status = errors.length === 0 ? "PASSED" : "FAILED";
    var result = {
      title: "MISSION BOS RESPONSE VEHICLE VALIDATION",
      status: status,
      counts: counts,
      actualCounts: actualCounts,
      checks: checks,
      errors: errors,
      metadata: metadata,
      lines: []
    };

    result.lines = [
      result.title,
      "Access surface definition errors: " + counts.accessSurfaceDefinition,
      "Access surface / obstacle overlap errors: " + counts.accessSurfaceObstacle,
      "Route definition errors: " + counts.routeDefinition,
      "Route surface reference errors: " + counts.routeSurfaceReference,
      "Response footprint outside allowed surface errors: " + counts.responseFootprintOutsideAllowedSurface,
      "Response / building overlap errors: " + counts.responseBuilding,
      "Response / tower overlap errors: " + counts.responseTower,
      "Response / technology plot overlap errors: " + counts.responseTechnologyPlot,
      "Response / parking overlap errors: " + counts.responseParking,
      "Response / green overlap errors: " + counts.responseGreen,
      "Response / static prop overlap errors: " + counts.responseStaticProp,
      "Response / civilian traffic swept-path conflicts: " + counts.responseCivilTrafficSweptPath,
      "Response / pedestrian swept-path conflicts: " + counts.responsePedestrianSweptPath,
      "Initial response vehicle overlap errors: " + counts.initialResponseVehicleOverlap,
      "Simulated response vehicle collision errors: " + counts.simulatedResponseVehicleCollision,
      "Invalid response vehicle specification errors: " + counts.invalidResponseVehicleSpecification,
      "Expected count errors: " + counts.expectedCounts,
      "Source phase errors: " + counts.sourcePhase,
      "STATUS: " + status
    ];

    return result;
  }

  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    result.lines.slice(1).forEach(function (line) {
      console[method](line);
    });
    if (result.errors.length > 0) {
      console.group("Affected response vehicle objects");
      result.errors.forEach(function (error) {
        console.error(error.check, error.data);
      });
      console.groupEnd();
    }
    console.groupEnd();
  }

  window.MissionBosResponseVehicleValidator = {
    validate: validate,
    logResult: logResult,
    prepareOpenRoute: prepareOpenRoute,
    sampleOpenRoute: sampleOpenRoute,
    footprintPoints: footprintPoints,
    rectangleCorners: rectangleCorners,
    polygonsOverlapSAT: polygonsOverlapSAT,
    circleOrientedRectOverlap: circleOrientedRectOverlap,
    pointInRect: pointInRect
  };
})();
