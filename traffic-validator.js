/* Mission BOS - Build 008R.4
   Deterministic traffic geometry and collision validator.
   No Three.js dependency.
*/

(function () {
  "use strict";

  var EPSILON = 1e-7;
  var ROUTE_SAMPLE_STEP = 0.15;
  var FOOTPRINT_LENGTH_SAMPLES = 9;
  var FOOTPRINT_WIDTH_SAMPLES = 5;
  var SIMULATION_SECONDS = 240;
  var SIMULATION_STEP = 0.1;

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

  function prepareRoute(routeDefinition) {
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
      closed: routeDefinition.closed === true,
      points: points,
      segments: segments,
      length: length
    };
  }

  function positiveModulo(value, divisor) {
    if (!isFinite(divisor) || divisor <= 0) return 0;
    return ((value % divisor) + divisor) % divisor;
  }

  function sampleRoute(route, distance) {
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

  function footprintPoints(pose, length, width) {
    var points = [];
    var forwardX = Math.sin(pose.angle);
    var forwardZ = Math.cos(pose.angle);
    var rightX = Math.cos(pose.angle);
    var rightZ = -Math.sin(pose.angle);

    for (var i = 0; i < FOOTPRINT_LENGTH_SAMPLES; i += 1) {
      var along = -length / 2 + (length * i) / (FOOTPRINT_LENGTH_SAMPLES - 1);
      for (var j = 0; j < FOOTPRINT_WIDTH_SAMPLES; j += 1) {
        var across = -width / 2 + (width * j) / (FOOTPRINT_WIDTH_SAMPLES - 1);
        points.push({
          x: pose.x + forwardX * along + rightX * across,
          z: pose.z + forwardZ * along + rightZ * across
        });
      }
    }

    return points;
  }

  function rectangleCorners(pose, length, width, margin) {
    var halfLength = length / 2 + margin;
    var halfWidth = width / 2 + margin;
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

  function countVehicleKinds(vehicles) {
    var result = { car: 0, van: 0, wheels: 0 };
    vehicles.forEach(function (vehicle) {
      if (vehicle.kind === "car") result.car += 1;
      if (vehicle.kind === "van") result.van += 1;
      result.wheels += Number(vehicle.wheelCount || 0);
    });
    return result;
  }

  function validate(layout, propsPlan, plan) {
    var errors = [];
    var checks = Object.create(null);

    function addError(check, data) {
      if (!checks[check]) checks[check] = [];
      checks[check].push(data);
      errors.push({ check: check, data: data });
    }

    function ensureCheck(check) {
      if (!checks[check]) checks[check] = [];
    }

    [
      "Route closure",
      "Route centerline outside road",
      "Vehicle footprint outside road",
      "Vehicle / building",
      "Vehicle / tower",
      "Vehicle / technology plot",
      "Vehicle / static prop",
      "Initial vehicle overlap",
      "Simulated vehicle collision",
      "Invalid vehicle specification",
      "Same-route start separation",
      "Expected counts",
      "Source phase"
    ].forEach(ensureCheck);

    if (!layout || !plan) {
      addError("Source phase", { message: "Layout or traffic plan missing." });
      return createResult(checks, errors, {}, {});
    }

    var roads = rectsFrom(layout.roadSurfaces);
    var buildings = rectsFrom(layout.buildings);
    var towers = rectsFrom(layout.mobileTowers);
    var technologyPlots = rectsFrom(layout.technologyPlots);
    var props = rectsFrom((propsPlan && propsPlan.props) || []);
    var routes = Object.create(null);

    (plan.routes || []).forEach(function (definition) {
      var route = prepareRoute(definition);
      routes[definition.id] = route;

      var first = route.points[0];
      var last = route.points[route.points.length - 1];
      var closedByCoordinates = !!first && !!last &&
        Math.abs(first.x - last.x) <= EPSILON &&
        Math.abs(first.z - last.z) <= EPSILON;

      if (!route.closed || !closedByCoordinates || route.length <= EPSILON) {
        addError("Route closure", {
          routeId: definition.id,
          declaredClosed: definition.closed === true,
          coordinateClosed: closedByCoordinates,
          length: route.length
        });
      }

      for (var p = 0; p < route.points.length; p += 1) {
        var routePoint = route.points[p];
        if (!pointInAnyRect(roads, routePoint.x, routePoint.z, EPSILON)) {
          addError("Route centerline outside road", {
            routeId: definition.id,
            pointIndex: p,
            x: routePoint.x,
            z: routePoint.z
          });
        }
      }
    });

    var vehicles = plan.vehicles || [];

    vehicles.forEach(function (vehicle) {
      var route = routes[vehicle.routeId];
      var bodyLength = Number(vehicle.bodyLength);
      var bodyWidth = Number(vehicle.bodyWidth);
      var footprintLength = Number(vehicle.footprintLength);
      var footprintWidth = Number(vehicle.footprintWidth);
      var speed = Number(vehicle.speed);
      var wheelCount = Number(vehicle.wheelCount);

      if (
        !route ||
        !isFinite(bodyLength) || bodyLength <= 0 ||
        !isFinite(bodyWidth) || bodyWidth <= 0 ||
        !isFinite(footprintLength) || footprintLength < bodyLength ||
        !isFinite(footprintWidth) || footprintWidth < bodyWidth ||
        !isFinite(speed) || speed <= 0 ||
        wheelCount !== 4
      ) {
        addError("Invalid vehicle specification", {
          vehicleId: vehicle.id,
          routeId: vehicle.routeId,
          bodyLength: bodyLength,
          bodyWidth: bodyWidth,
          footprintLength: footprintLength,
          footprintWidth: footprintWidth,
          speed: speed,
          wheelCount: wheelCount
        });
        return;
      }

      for (var distance = 0; distance < route.length; distance += ROUTE_SAMPLE_STEP) {
        var pose = sampleRoute(route, distance);
        var footprint = footprintPoints(pose, footprintLength, footprintWidth);
        var roadFailure = null;
        var buildingFailure = null;
        var towerFailure = null;
        var technologyFailure = null;
        var propFailure = null;

        for (var i = 0; i < footprint.length; i += 1) {
          var point = footprint[i];
          if (!roadFailure && !pointInAnyRect(roads, point.x, point.z, EPSILON)) {
            roadFailure = point;
          }
          if (!buildingFailure && pointInAnyRect(buildings, point.x, point.z, EPSILON)) {
            buildingFailure = point;
          }
          if (!towerFailure && pointInAnyRect(towers, point.x, point.z, EPSILON)) {
            towerFailure = point;
          }
          if (!technologyFailure && pointInAnyRect(technologyPlots, point.x, point.z, EPSILON)) {
            technologyFailure = point;
          }
          if (!propFailure && pointInAnyRect(props, point.x, point.z, EPSILON)) {
            propFailure = point;
          }
        }

        if (roadFailure) {
          addError("Vehicle footprint outside road", {
            vehicleId: vehicle.id,
            routeId: vehicle.routeId,
            distance: distance,
            point: roadFailure
          });
          break;
        }
        if (buildingFailure) {
          addError("Vehicle / building", {
            vehicleId: vehicle.id,
            routeId: vehicle.routeId,
            distance: distance,
            point: buildingFailure
          });
          break;
        }
        if (towerFailure) {
          addError("Vehicle / tower", {
            vehicleId: vehicle.id,
            routeId: vehicle.routeId,
            distance: distance,
            point: towerFailure
          });
          break;
        }
        if (technologyFailure) {
          addError("Vehicle / technology plot", {
            vehicleId: vehicle.id,
            routeId: vehicle.routeId,
            distance: distance,
            point: technologyFailure
          });
          break;
        }
        if (propFailure) {
          addError("Vehicle / static prop", {
            vehicleId: vehicle.id,
            routeId: vehicle.routeId,
            distance: distance,
            point: propFailure
          });
          break;
        }
      }
    });

    var safetyMargin = Number(
      plan.simulation && plan.simulation.collisionSafetyMargin != null
        ? plan.simulation.collisionSafetyMargin
        : 0.05
    );

    function poseForVehicle(vehicle, time) {
      var route = routes[vehicle.routeId];
      return sampleRoute(route, Number(vehicle.startDistance || 0) + Number(vehicle.speed || 0) * time);
    }

    function vehiclePolygon(vehicle, time) {
      return rectangleCorners(
        poseForVehicle(vehicle, time),
        Number(vehicle.footprintLength),
        Number(vehicle.footprintWidth),
        safetyMargin
      );
    }

    for (var a = 0; a < vehicles.length; a += 1) {
      for (var b = a + 1; b < vehicles.length; b += 1) {
        if (polygonsOverlapSAT(vehiclePolygon(vehicles[a], 0), vehiclePolygon(vehicles[b], 0))) {
          addError("Initial vehicle overlap", {
            vehicleA: vehicles[a].id,
            vehicleB: vehicles[b].id
          });
        }
      }
    }

    var minimumStartSeparation = Number(
      plan.trafficPolicy && plan.trafficPolicy.minimumSameRouteStartSeparation != null
        ? plan.trafficPolicy.minimumSameRouteStartSeparation
        : 0
    );

    for (var i = 0; i < vehicles.length; i += 1) {
      for (var j = i + 1; j < vehicles.length; j += 1) {
        var vehicleA = vehicles[i];
        var vehicleB = vehicles[j];
        if (vehicleA.routeId !== vehicleB.routeId) continue;
        var sharedRoute = routes[vehicleA.routeId];
        var raw = Math.abs(Number(vehicleA.startDistance) - Number(vehicleB.startDistance));
        var circularDistance = Math.min(raw, sharedRoute.length - raw);
        if (circularDistance < minimumStartSeparation - EPSILON) {
          addError("Same-route start separation", {
            vehicleA: vehicleA.id,
            vehicleB: vehicleB.id,
            distance: circularDistance,
            required: minimumStartSeparation
          });
        }
        if (
          plan.trafficPolicy &&
          plan.trafficPolicy.sharedRouteVehiclesUseIdenticalSpeed === true &&
          Math.abs(Number(vehicleA.speed) - Number(vehicleB.speed)) > EPSILON
        ) {
          addError("Invalid vehicle specification", {
            vehicleA: vehicleA.id,
            vehicleB: vehicleB.id,
            message: "Vehicles sharing a route must use identical speed."
          });
        }
      }
    }

    simulationLoop:
    for (var time = 0; time <= SIMULATION_SECONDS; time += SIMULATION_STEP) {
      for (var firstIndex = 0; firstIndex < vehicles.length; firstIndex += 1) {
        for (var secondIndex = firstIndex + 1; secondIndex < vehicles.length; secondIndex += 1) {
          var firstVehicle = vehicles[firstIndex];
          var secondVehicle = vehicles[secondIndex];
          if (
            polygonsOverlapSAT(
              vehiclePolygon(firstVehicle, time),
              vehiclePolygon(secondVehicle, time)
            )
          ) {
            addError("Simulated vehicle collision", {
              time: Number(time.toFixed(2)),
              vehicleA: firstVehicle.id,
              vehicleB: secondVehicle.id
            });
            break simulationLoop;
          }
        }
      }
    }

    var actualKinds = countVehicleKinds(vehicles);
    var expected = plan.expectedCounts || {};
    var actualCounts = {
      routes: (plan.routes || []).length,
      vehicles: vehicles.length,
      cars: actualKinds.car,
      vans: actualKinds.van,
      wheels: actualKinds.wheels
    };

    Object.keys(actualCounts).forEach(function (key) {
      if (Number(expected[key] || 0) !== actualCounts[key]) {
        addError("Expected counts", {
          key: key,
          expected: Number(expected[key] || 0),
          actual: actualCounts[key]
        });
      }
    });

    if (plan.sourceLayoutPhase !== layout.phase) {
      addError("Source phase", {
        source: "layout",
        expected: plan.sourceLayoutPhase,
        actual: layout.phase
      });
    }

    if (propsPlan && plan.sourcePropsPhase !== propsPlan.phase) {
      addError("Source phase", {
        source: "props",
        expected: plan.sourcePropsPhase,
        actual: propsPlan.phase
      });
    }

    return createResult(checks, errors, actualCounts, {
      routes: routes,
      routeSampleStep: ROUTE_SAMPLE_STEP,
      simulationSeconds: SIMULATION_SECONDS,
      simulationStep: SIMULATION_STEP
    });
  }

  function createResult(checks, errors, actualCounts, metadata) {
    var counts = {
      routeClosure: checks["Route closure"].length,
      routeCenterlineOutsideRoad: checks["Route centerline outside road"].length,
      vehicleFootprintOutsideRoad: checks["Vehicle footprint outside road"].length,
      vehicleBuilding: checks["Vehicle / building"].length,
      vehicleTower: checks["Vehicle / tower"].length,
      vehicleTechnologyPlot: checks["Vehicle / technology plot"].length,
      vehicleStaticProp: checks["Vehicle / static prop"].length,
      initialVehicleOverlap: checks["Initial vehicle overlap"].length,
      simulatedVehicleCollision: checks["Simulated vehicle collision"].length,
      invalidVehicleSpecification: checks["Invalid vehicle specification"].length,
      sameRouteStartSeparation: checks["Same-route start separation"].length,
      expectedCounts: checks["Expected counts"].length,
      sourcePhase: checks["Source phase"].length
    };

    var status = errors.length === 0 ? "PASSED" : "FAILED";
    var result = {
      title: "MISSION BOS TRAFFIC VALIDATION",
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
      "Route closure errors: " + counts.routeClosure,
      "Route centerline outside road errors: " + counts.routeCenterlineOutsideRoad,
      "Vehicle footprint outside road errors: " + counts.vehicleFootprintOutsideRoad,
      "Vehicle / building overlap errors: " + counts.vehicleBuilding,
      "Vehicle / tower overlap errors: " + counts.vehicleTower,
      "Vehicle / technology plot overlap errors: " + counts.vehicleTechnologyPlot,
      "Vehicle / static prop overlap errors: " + counts.vehicleStaticProp,
      "Initial vehicle overlap errors: " + counts.initialVehicleOverlap,
      "Simulated vehicle collision errors: " + counts.simulatedVehicleCollision,
      "Invalid vehicle specification errors: " + counts.invalidVehicleSpecification,
      "Same-route start separation errors: " + counts.sameRouteStartSeparation,
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
      console.group("Affected traffic objects");
      result.errors.forEach(function (error) {
        console.error(error.check, error.data);
      });
      console.groupEnd();
    }
    console.groupEnd();
  }

  window.MissionBosTrafficValidator = {
    validate: validate,
    logResult: logResult,
    prepareRoute: prepareRoute,
    sampleRoute: sampleRoute,
    footprintPoints: footprintPoints,
    rectangleCorners: rectangleCorners,
    polygonsOverlapSAT: polygonsOverlapSAT
  };
})();
