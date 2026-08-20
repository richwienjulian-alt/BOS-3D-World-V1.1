/* Mission BOS - Build 008R.5
   Deterministic pedestrian geometry, movement and traffic-separation validator.
   No Three.js dependency.
*/

(function () {
  "use strict";

  var EPSILON = 1e-7;
  var DEFAULT_ROUTE_SAMPLE_STEP = 0.10;
  var DEFAULT_ANGULAR_SAMPLES = 24;
  var DEFAULT_RADIAL_RINGS = 3;
  var DEFAULT_SIMULATION_SECONDS = 240;
  var DEFAULT_SIMULATION_STEP = 0.10;

  function positiveModulo(value, divisor) {
    if (!isFinite(divisor) || divisor <= 0) return 0;
    return ((value % divisor) + divisor) % divisor;
  }

  function pointInRect(rect, x, z, expansion) {
    var e = Number(expansion || 0);
    return (
      Math.abs(x - rect.x) <= rect.width / 2 + e + EPSILON &&
      Math.abs(z - rect.z) <= rect.depth / 2 + e + EPSILON
    );
  }

  function pointInAnyRect(rects, x, z, expansion) {
    for (var i = 0; i < rects.length; i += 1) {
      if (pointInRect(rects[i], x, z, expansion)) return true;
    }
    return false;
  }

  function rectsFrom(items) {
    return (items || []).map(function (item) {
      var rect = item.worldRect || item.rect || item;
      return {
        id: item.id || "UNKNOWN",
        x: Number(rect.x),
        z: Number(rect.z),
        width: Number(rect.width),
        depth: Number(rect.depth)
      };
    });
  }

  function mapRectsById(items) {
    var result = Object.create(null);
    rectsFrom(items).forEach(function (rect) {
      result[rect.id] = rect;
    });
    return result;
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
      mode: routeDefinition.mode,
      surfaceKind: routeDefinition.surfaceKind,
      allowedSurfaceIds: (routeDefinition.allowedSurfaceIds || []).slice(),
      points: points,
      segments: segments,
      length: length
    };
  }

  function samplePathDistance(route, localDistance) {
    if (!route || route.length <= EPSILON || route.segments.length === 0) {
      return { x: 0, z: 0, angle: 0 };
    }

    var target = Math.max(0, Math.min(route.length, Number(localDistance) || 0));

    for (var i = 0; i < route.segments.length; i += 1) {
      var segment = route.segments[i];
      var segmentEnd = segment.accumulatedStart + segment.length;
      if (target <= segmentEnd + EPSILON) {
        var local = target - segment.accumulatedStart;
        var t = segment.length <= EPSILON ? 0 : local / segment.length;
        var dx = segment.end.x - segment.start.x;
        var dz = segment.end.z - segment.start.z;
        return {
          x: segment.start.x + dx * t,
          z: segment.start.z + dz * t,
          angle: Math.atan2(dx, dz)
        };
      }
    }

    var last = route.segments[route.segments.length - 1];
    return {
      x: last.end.x,
      z: last.end.z,
      angle: Math.atan2(last.end.x - last.start.x, last.end.z - last.start.z)
    };
  }

  function samplePingPong(route, travelDistance, directionMultiplier) {
    if (!route || route.length <= EPSILON) {
      return { x: 0, z: 0, angle: 0, localDistance: 0, movementDirection: 1 };
    }

    var cycleLength = route.length * 2;
    var phase = positiveModulo(Number(travelDistance) || 0, cycleLength);
    var intrinsicDirection = phase <= route.length ? 1 : -1;
    var localDistance = phase <= route.length ? phase : cycleLength - phase;
    var movementDirection = intrinsicDirection * (Number(directionMultiplier) === -1 ? -1 : 1);
    var sample = samplePathDistance(route, localDistance);

    if (movementDirection < 0) sample.angle += Math.PI;

    sample.localDistance = localDistance;
    sample.movementDirection = movementDirection;
    return sample;
  }

  function footprintPoints(pose, radius, angularSamples, radialRings) {
    var points = [{ x: pose.x, z: pose.z }];
    var angles = Math.max(8, Number(angularSamples) || DEFAULT_ANGULAR_SAMPLES);
    var rings = Math.max(1, Number(radialRings) || DEFAULT_RADIAL_RINGS);

    for (var ring = 1; ring <= rings; ring += 1) {
      var ringRadius = radius * ring / rings;
      for (var i = 0; i < angles; i += 1) {
        var angle = Math.PI * 2 * i / angles;
        points.push({
          x: pose.x + Math.cos(angle) * ringRadius,
          z: pose.z + Math.sin(angle) * ringRadius
        });
      }
    }

    return points;
  }

  function prepareClosedTrafficRoute(routeDefinition) {
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
      segments.push({ start: start, end: end, length: segmentLength, accumulatedStart: length });
      length += segmentLength;
    }

    return { id: routeDefinition.id, points: points, segments: segments, length: length };
  }

  function sampleClosedTrafficRoute(route, distance) {
    if (!route || route.length <= EPSILON || route.segments.length === 0) {
      return { x: 0, z: 0, angle: 0 };
    }
    var target = positiveModulo(distance, route.length);

    for (var i = 0; i < route.segments.length; i += 1) {
      var segment = route.segments[i];
      var segmentEnd = segment.accumulatedStart + segment.length;
      if (target <= segmentEnd + EPSILON) {
        var local = target - segment.accumulatedStart;
        var t = segment.length <= EPSILON ? 0 : local / segment.length;
        var dx = segment.end.x - segment.start.x;
        var dz = segment.end.z - segment.start.z;
        return {
          x: segment.start.x + dx * t,
          z: segment.start.z + dz * t,
          angle: Math.atan2(dx, dz)
        };
      }
    }

    var last = route.segments[route.segments.length - 1];
    return {
      x: last.end.x,
      z: last.end.z,
      angle: Math.atan2(last.end.x - last.start.x, last.end.z - last.start.z)
    };
  }

  function circleCircleOverlap(first, firstRadius, second, secondRadius, margin) {
    var dx = first.x - second.x;
    var dz = first.z - second.z;
    var required = firstRadius + secondRadius + Number(margin || 0);
    return dx * dx + dz * dz < required * required - EPSILON;
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
    var outsideForward = Math.max(Math.abs(localForward) - (length / 2 + margin), 0);
    var outsideRight = Math.max(Math.abs(localRight) - (width / 2 + margin), 0);
    return outsideForward * outsideForward + outsideRight * outsideRight <= radius * radius + EPSILON;
  }

  function validate(layout, propsPlan, trafficPlan, plan) {
    var checks = Object.create(null);
    var errors = [];

    function ensureCheck(name) {
      if (!checks[name]) checks[name] = [];
    }

    function addError(name, data) {
      ensureCheck(name);
      checks[name].push(data);
      errors.push({ check: name, data: data });
    }

    [
      "Route definition",
      "Route surface reference",
      "Route footprint outside allowed surface",
      "Pedestrian / road",
      "Pedestrian / green",
      "Pedestrian / building",
      "Pedestrian / tower",
      "Pedestrian / technology plot",
      "Pedestrian / parking",
      "Pedestrian / static prop",
      "Initial pedestrian overlap",
      "Simulated pedestrian collision",
      "Simulated pedestrian / vehicle collision",
      "Invalid pedestrian specification",
      "Route assignment",
      "Expected counts",
      "Source phase"
    ].forEach(ensureCheck);

    if (!layout || !propsPlan || !trafficPlan || !plan) {
      addError("Source phase", { message: "Layout, props, traffic plan or pedestrian plan missing." });
      return createResult(checks, errors, {}, {});
    }

    var roads = rectsFrom(layout.roadSurfaces);
    var corridorsById = mapRectsById(layout.noBuildCorridors);
    var pavedById = mapRectsById(layout.pavedAreas);
    var greens = rectsFrom(layout.greenAreas);
    var buildings = rectsFrom(layout.buildings);
    var towers = rectsFrom(layout.mobileTowers);
    var technologyPlots = rectsFrom(layout.technologyPlots);
    var parking = rectsFrom(layout.parkingAreas);
    var props = rectsFrom(propsPlan.props);

    var routeSampleStep = Number(plan.simulation && plan.simulation.routeSampleStep) || DEFAULT_ROUTE_SAMPLE_STEP;
    var angularSamples = Number(plan.simulation && plan.simulation.footprintAngularSamples) || DEFAULT_ANGULAR_SAMPLES;
    var radialRings = Number(plan.simulation && plan.simulation.footprintRadialRings) || DEFAULT_RADIAL_RINGS;
    var roadClearance = Number(plan.simulation && plan.simulation.roadSafetyClearance) || 0;
    var obstacleClearance = Number(plan.simulation && plan.simulation.obstacleSafetyClearance) || 0;
    var collisionMargin = Number(plan.simulation && plan.simulation.collisionSafetyMargin) || 0;

    var routeDefinitions = plan.routes || [];
    var routes = Object.create(null);

    function pointAllowedForRoute(route, point) {
      if (route.surfaceKind === "sidewalk-corridor") {
        var inAllowedCorridor = false;
        for (var i = 0; i < route.allowedSurfaceIds.length; i += 1) {
          var corridor = corridorsById[route.allowedSurfaceIds[i]];
          if (corridor && pointInRect(corridor, point.x, point.z, 0)) {
            inAllowedCorridor = true;
            break;
          }
        }
        return inAllowedCorridor && !pointInAnyRect(roads, point.x, point.z, roadClearance);
      }

      if (route.surfaceKind === "paved-area") {
        for (var j = 0; j < route.allowedSurfaceIds.length; j += 1) {
          var paved = pavedById[route.allowedSurfaceIds[j]];
          if (paved && pointInRect(paved, point.x, point.z, 0)) {
            return !pointInAnyRect(roads, point.x, point.z, roadClearance);
          }
        }
      }

      return false;
    }

    routeDefinitions.forEach(function (definition) {
      var route = prepareOpenRoute(definition);
      routes[definition.id] = route;

      if (
        !definition.id ||
        definition.mode !== "ping-pong" ||
        route.points.length < 2 ||
        route.segments.length < 1 ||
        route.length <= EPSILON ||
        !isFinite(Number(definition.length)) ||
        Math.abs(Number(definition.length) - route.length) > 0.001
      ) {
        addError("Route definition", {
          routeId: definition.id,
          mode: definition.mode,
          pointCount: route.points.length,
          segmentCount: route.segments.length,
          declaredLength: definition.length,
          calculatedLength: route.length
        });
      }

      if (definition.surfaceKind !== "sidewalk-corridor" && definition.surfaceKind !== "paved-area") {
        addError("Route surface reference", {
          routeId: definition.id,
          surfaceKind: definition.surfaceKind,
          message: "Unsupported surface kind."
        });
      }

      (definition.allowedSurfaceIds || []).forEach(function (surfaceId) {
        var exists = definition.surfaceKind === "sidewalk-corridor"
          ? !!corridorsById[surfaceId]
          : !!pavedById[surfaceId];
        if (!exists) {
          addError("Route surface reference", {
            routeId: definition.id,
            surfaceId: surfaceId,
            surfaceKind: definition.surfaceKind
          });
        }
      });

      if (!definition.allowedSurfaceIds || definition.allowedSurfaceIds.length === 0) {
        addError("Route surface reference", {
          routeId: definition.id,
          message: "No allowed surface IDs declared."
        });
      }
    });

    var pedestrians = plan.pedestrians || [];
    var routeUseCounts = Object.create(null);

    pedestrians.forEach(function (pedestrian) {
      var route = routes[pedestrian.routeId];
      var speed = Number(pedestrian.speed);
      var startDistance = Number(pedestrian.startDistance);
      var direction = Number(pedestrian.initialDirection);
      var radius = Number(pedestrian.footprintRadius);
      var personalSpace = Number(pedestrian.personalSpaceRadius);
      var heightScale = Number(pedestrian.heightScale);

      routeUseCounts[pedestrian.routeId] = (routeUseCounts[pedestrian.routeId] || 0) + 1;

      if (
        !pedestrian.id || !route ||
        !isFinite(speed) || speed <= 0 || speed > 2.0 ||
        !isFinite(startDistance) || startDistance < 0 || (route && startDistance > route.length + EPSILON) ||
        (direction !== 1 && direction !== -1) ||
        !isFinite(radius) || radius < 0.2 || radius > 0.38 ||
        !isFinite(personalSpace) || personalSpace < radius || personalSpace > 0.8 ||
        !isFinite(heightScale) || heightScale < 0.85 || heightScale > 1.15
      ) {
        addError("Invalid pedestrian specification", {
          pedestrianId: pedestrian.id,
          routeId: pedestrian.routeId,
          speed: speed,
          startDistance: startDistance,
          initialDirection: direction,
          footprintRadius: radius,
          personalSpaceRadius: personalSpace,
          heightScale: heightScale
        });
        return;
      }

      for (var distance = 0; distance <= route.length + EPSILON; distance += routeSampleStep) {
        var pose = samplePathDistance(route, Math.min(distance, route.length));
        var footprint = footprintPoints(pose, radius, angularSamples, radialRings);
        var failures = {
          allowed: null,
          road: null,
          green: null,
          building: null,
          tower: null,
          technology: null,
          parking: null,
          prop: null
        };

        for (var i = 0; i < footprint.length; i += 1) {
          var point = footprint[i];
          if (!failures.allowed && !pointAllowedForRoute(route, point)) failures.allowed = point;
          if (!failures.road && pointInAnyRect(roads, point.x, point.z, roadClearance)) failures.road = point;
          if (!failures.green && pointInAnyRect(greens, point.x, point.z, obstacleClearance)) failures.green = point;
          if (!failures.building && pointInAnyRect(buildings, point.x, point.z, obstacleClearance)) failures.building = point;
          if (!failures.tower && pointInAnyRect(towers, point.x, point.z, obstacleClearance)) failures.tower = point;
          if (!failures.technology && pointInAnyRect(technologyPlots, point.x, point.z, obstacleClearance)) failures.technology = point;
          if (!failures.parking && pointInAnyRect(parking, point.x, point.z, obstacleClearance)) failures.parking = point;
          if (!failures.prop && pointInAnyRect(props, point.x, point.z, obstacleClearance)) failures.prop = point;
        }

        if (failures.allowed) {
          addError("Route footprint outside allowed surface", { pedestrianId: pedestrian.id, routeId: route.id, distance: distance, point: failures.allowed });
          break;
        }
        if (failures.road) {
          addError("Pedestrian / road", { pedestrianId: pedestrian.id, routeId: route.id, distance: distance, point: failures.road });
          break;
        }
        if (failures.green) {
          addError("Pedestrian / green", { pedestrianId: pedestrian.id, routeId: route.id, distance: distance, point: failures.green });
          break;
        }
        if (failures.building) {
          addError("Pedestrian / building", { pedestrianId: pedestrian.id, routeId: route.id, distance: distance, point: failures.building });
          break;
        }
        if (failures.tower) {
          addError("Pedestrian / tower", { pedestrianId: pedestrian.id, routeId: route.id, distance: distance, point: failures.tower });
          break;
        }
        if (failures.technology) {
          addError("Pedestrian / technology plot", { pedestrianId: pedestrian.id, routeId: route.id, distance: distance, point: failures.technology });
          break;
        }
        if (failures.parking) {
          addError("Pedestrian / parking", { pedestrianId: pedestrian.id, routeId: route.id, distance: distance, point: failures.parking });
          break;
        }
        if (failures.prop) {
          addError("Pedestrian / static prop", { pedestrianId: pedestrian.id, routeId: route.id, distance: distance, point: failures.prop });
          break;
        }
      }
    });

    Object.keys(routes).forEach(function (routeId) {
      var useCount = routeUseCounts[routeId] || 0;
      if (useCount !== 1) {
        addError("Route assignment", { routeId: routeId, assignedPedestrians: useCount, required: 1 });
      }
    });

    function pedestrianPoseAt(pedestrian, time) {
      var route = routes[pedestrian.routeId];
      var travel = Number(pedestrian.startDistance) + Number(pedestrian.initialDirection) * Number(pedestrian.speed) * time;
      return samplePingPong(route, travel, Number(pedestrian.initialDirection));
    }

    for (var a = 0; a < pedestrians.length; a += 1) {
      for (var b = a + 1; b < pedestrians.length; b += 1) {
        var firstInitial = pedestrianPoseAt(pedestrians[a], 0);
        var secondInitial = pedestrianPoseAt(pedestrians[b], 0);
        if (circleCircleOverlap(
          firstInitial,
          Number(pedestrians[a].personalSpaceRadius),
          secondInitial,
          Number(pedestrians[b].personalSpaceRadius),
          collisionMargin
        )) {
          addError("Initial pedestrian overlap", {
            pedestrianA: pedestrians[a].id,
            pedestrianB: pedestrians[b].id
          });
        }
      }
    }

    var simulationSeconds = Number(plan.simulation && plan.simulation.validationSeconds) || DEFAULT_SIMULATION_SECONDS;
    var simulationStep = Number(plan.simulation && plan.simulation.validationStep) || DEFAULT_SIMULATION_STEP;
    var pedestrianCollisionFound = false;

    pedestrianSimulation:
    for (var time = 0; time <= simulationSeconds + EPSILON; time += simulationStep) {
      for (var firstIndex = 0; firstIndex < pedestrians.length; firstIndex += 1) {
        for (var secondIndex = firstIndex + 1; secondIndex < pedestrians.length; secondIndex += 1) {
          var firstPedestrian = pedestrians[firstIndex];
          var secondPedestrian = pedestrians[secondIndex];
          if (circleCircleOverlap(
            pedestrianPoseAt(firstPedestrian, time),
            Number(firstPedestrian.personalSpaceRadius),
            pedestrianPoseAt(secondPedestrian, time),
            Number(secondPedestrian.personalSpaceRadius),
            collisionMargin
          )) {
            addError("Simulated pedestrian collision", {
              time: Number(time.toFixed(2)),
              pedestrianA: firstPedestrian.id,
              pedestrianB: secondPedestrian.id
            });
            pedestrianCollisionFound = true;
            break pedestrianSimulation;
          }
        }
      }
    }

    var trafficRoutes = Object.create(null);
    (trafficPlan.routes || []).forEach(function (routeDefinition) {
      trafficRoutes[routeDefinition.id] = prepareClosedTrafficRoute(routeDefinition);
    });
    var trafficFactors = (plan.simulation && plan.simulation.trafficSpeedFactorsToValidate) || [1];
    var vehicleCollisionFound = false;

    pedestrianVehicleSimulation:
    for (var factorIndex = 0; factorIndex < trafficFactors.length; factorIndex += 1) {
      var speedFactor = Number(trafficFactors[factorIndex]);
      for (var trafficTime = 0; trafficTime <= simulationSeconds + EPSILON; trafficTime += simulationStep) {
        for (var pedestrianIndex = 0; pedestrianIndex < pedestrians.length; pedestrianIndex += 1) {
          var currentPedestrian = pedestrians[pedestrianIndex];
          var pedestrianPose = pedestrianPoseAt(currentPedestrian, trafficTime);
          for (var vehicleIndex = 0; vehicleIndex < (trafficPlan.vehicles || []).length; vehicleIndex += 1) {
            var vehicle = trafficPlan.vehicles[vehicleIndex];
            var trafficRoute = trafficRoutes[vehicle.routeId];
            if (!trafficRoute) continue;
            var vehiclePose = sampleClosedTrafficRoute(
              trafficRoute,
              Number(vehicle.startDistance || 0) + Number(vehicle.speed || 0) * speedFactor * trafficTime
            );
            if (circleOrientedRectOverlap(
              pedestrianPose,
              Number(currentPedestrian.personalSpaceRadius),
              vehiclePose,
              Number(vehicle.footprintLength),
              Number(vehicle.footprintWidth),
              collisionMargin
            )) {
              addError("Simulated pedestrian / vehicle collision", {
                time: Number(trafficTime.toFixed(2)),
                trafficSpeedFactor: speedFactor,
                pedestrianId: currentPedestrian.id,
                vehicleId: vehicle.id
              });
              vehicleCollisionFound = true;
              break pedestrianVehicleSimulation;
            }
          }
        }
      }
    }

    var expected = plan.expectedCounts || {};
    var actualCounts = {
      routes: routeDefinitions.length,
      pedestrians: pedestrians.length,
      heads: pedestrians.length,
      bodies: pedestrians.length,
      arms: pedestrians.length * 2,
      legs: pedestrians.length * 2
    };

    Object.keys(actualCounts).forEach(function (key) {
      if (Number(expected[key] || 0) !== actualCounts[key]) {
        addError("Expected counts", { key: key, expected: Number(expected[key] || 0), actual: actualCounts[key] });
      }
    });

    if (plan.sourceLayoutPhase !== layout.phase) {
      addError("Source phase", { source: "layout", expected: plan.sourceLayoutPhase, actual: layout.phase });
    }
    if (plan.sourcePropsPhase !== propsPlan.phase) {
      addError("Source phase", { source: "props", expected: plan.sourcePropsPhase, actual: propsPlan.phase });
    }
    if (plan.sourceTrafficPhase !== trafficPlan.phase) {
      addError("Source phase", { source: "traffic", expected: plan.sourceTrafficPhase, actual: trafficPlan.phase });
    }

    return createResult(checks, errors, actualCounts, {
      routes: routes,
      routeSampleStep: routeSampleStep,
      simulationSeconds: simulationSeconds,
      simulationStep: simulationStep,
      trafficSpeedFactors: trafficFactors.slice(),
      pedestrianCollisionSimulationCompleted: !pedestrianCollisionFound,
      pedestrianVehicleSimulationCompleted: !vehicleCollisionFound
    });
  }

  function createResult(checks, errors, actualCounts, metadata) {
    var counts = {
      routeDefinition: checks["Route definition"].length,
      routeSurfaceReference: checks["Route surface reference"].length,
      routeFootprintOutsideAllowedSurface: checks["Route footprint outside allowed surface"].length,
      pedestrianRoad: checks["Pedestrian / road"].length,
      pedestrianGreen: checks["Pedestrian / green"].length,
      pedestrianBuilding: checks["Pedestrian / building"].length,
      pedestrianTower: checks["Pedestrian / tower"].length,
      pedestrianTechnologyPlot: checks["Pedestrian / technology plot"].length,
      pedestrianParking: checks["Pedestrian / parking"].length,
      pedestrianStaticProp: checks["Pedestrian / static prop"].length,
      initialPedestrianOverlap: checks["Initial pedestrian overlap"].length,
      simulatedPedestrianCollision: checks["Simulated pedestrian collision"].length,
      simulatedPedestrianVehicleCollision: checks["Simulated pedestrian / vehicle collision"].length,
      invalidPedestrianSpecification: checks["Invalid pedestrian specification"].length,
      routeAssignment: checks["Route assignment"].length,
      expectedCounts: checks["Expected counts"].length,
      sourcePhase: checks["Source phase"].length
    };

    var status = errors.length === 0 ? "PASSED" : "FAILED";
    var result = {
      title: "MISSION BOS PEDESTRIAN VALIDATION",
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
      "Route definition errors: " + counts.routeDefinition,
      "Route surface reference errors: " + counts.routeSurfaceReference,
      "Route footprint outside allowed surface errors: " + counts.routeFootprintOutsideAllowedSurface,
      "Pedestrian / road overlap errors: " + counts.pedestrianRoad,
      "Pedestrian / green overlap errors: " + counts.pedestrianGreen,
      "Pedestrian / building overlap errors: " + counts.pedestrianBuilding,
      "Pedestrian / tower overlap errors: " + counts.pedestrianTower,
      "Pedestrian / technology plot overlap errors: " + counts.pedestrianTechnologyPlot,
      "Pedestrian / parking overlap errors: " + counts.pedestrianParking,
      "Pedestrian / static prop overlap errors: " + counts.pedestrianStaticProp,
      "Initial pedestrian overlap errors: " + counts.initialPedestrianOverlap,
      "Simulated pedestrian collision errors: " + counts.simulatedPedestrianCollision,
      "Simulated pedestrian / vehicle collision errors: " + counts.simulatedPedestrianVehicleCollision,
      "Invalid pedestrian specification errors: " + counts.invalidPedestrianSpecification,
      "Route assignment errors: " + counts.routeAssignment,
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
      console.group("Affected pedestrian objects");
      result.errors.forEach(function (error) {
        console.error(error.check, error.data);
      });
      console.groupEnd();
    }
    console.groupEnd();
  }

  window.MissionBosPedestrianValidator = {
    validate: validate,
    logResult: logResult,
    prepareOpenRoute: prepareOpenRoute,
    samplePathDistance: samplePathDistance,
    samplePingPong: samplePingPong,
    footprintPoints: footprintPoints,
    circleCircleOverlap: circleCircleOverlap,
    circleOrientedRectOverlap: circleOrientedRectOverlap
  };
})();
