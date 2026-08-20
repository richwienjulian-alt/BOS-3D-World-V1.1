/* Mission BOS - Build 013M.10 preparation
   Shared outbound response sequencing safety correction.
   Based on the validated response vehicle renderer foundation from Build 008R.6.

   Original foundation marker: Mission BOS - Build 008R.6
   Validated Response Vehicle Foundation - deterministic production renderer.

   No modules. No fetch. No random placement. No legacy routes.
   Access surfaces, routes, vehicle dimensions, colors, speeds and dispatch
   timing are read exclusively from window.MISSION_BOS_RESPONSE_VEHICLE_PLAN.
*/

(function () {
  "use strict";

  var STATES = Object.freeze({
    AT_STATIONS: "AT_STATIONS",
    DISPATCHING: "DISPATCHING",
    ENROUTE: "ENROUTE",
    HOLDING: "HOLDING",
    RETURNING: "RETURNING",
    RETURN_WAITING: "RETURN_WAITING",
    FAILED: "FAILED"
  });

  var VEHICLE_PHASES = Object.freeze({
    AT_STATION: "AT_STATION",
    WAITING: "WAITING",
    ENROUTE: "ENROUTE",
    HOLDING: "HOLDING",
    RETURNING: "RETURNING",
    RETURN_WAITING: "RETURN_WAITING",
    RETURN_CLEARING: "RETURN_CLEARING",
    RETURN_TURNING: "RETURN_TURNING",
    FAILED: "FAILED"
  });

  function createFailedResult(message, validation, plan) {
    var root = typeof THREE !== "undefined" ? new THREE.Group() : null;
    if (root) root.name = "MISSION_BOS_VALIDATED_RESPONSE_VEHICLES_FAILED";

    var expected = plan && plan.expectedCounts ? plan.expectedCounts : {};
    var rendered = {
      accessSurfaces: 0,
      routes: 0,
      responseVehicles: 0,
      fireTrucks: 0,
      policeCars: 0,
      wheels: 0,
      lightbars: 0,
      ladders: 0
    };
    var manifest = createManifest(rendered, expected);
    manifest.status = "FAILED";
    manifest.lines[manifest.lines.length - 1] = "RENDER MANIFEST: FAILED";
    logManifest(manifest);

    var safety = {
      title: "MISSION BOS RUNTIME RESPONSE VEHICLE SAFETY",
      responseResponseCollisions: 0,
      responseCivilianVehicleCollisions: 0,
      responsePedestrianCollisions: 0,
      status: "FAILED",
      collisions: [],
      halted: true,
      message: message || "Response vehicle renderer failed."
    };

    console.error("MISSION BOS RESPONSE VEHICLE RENDERING ABORTED: " + safety.message);

    return {
      root: root,
      groups: { accessSurfaces: null, vehicles: null },
      vehiclesById: Object.create(null),
      validation: validation || null,
      renderedCounts: rendered,
      update: function () {},
      dispatch: function () { return false; },
      returnToStations: function () { return false; },
      setRouteProfile: function () { return false; },
      restoreDefaultRouteProfile: function () { return false; },
      getRouteProfileId: function () { return "MISSION_001_DEFAULT"; },
      allAtBase: function () { return false; },
      reset: function () { return false; },
      getVehicleCount: function () { return 0; },
      getWheelCount: function () { return 0; },
      getState: function () { return STATES.FAILED; },
      getVehicleStatus: function () { return "Fehlgeschlagen"; },
      getReturnManeuverStatus: function () { return { strategy: "UNAVAILABLE", fireSubphase: "FAILED", policeSubphase: "FAILED", fireClearanceGate: false }; },
      getFireTruckStatus: function () { return "Fehlgeschlagen"; },
      getFireTruckCommsPosition: function () {
        return typeof THREE !== "undefined" ? new THREE.Vector3() : null;
      },
      getManifest: function () { return manifest; },
      getSafetyStatus: function () { return copySafety(safety); },
      dispose: function () {
        if (root && root.parent) root.parent.remove(root);
      }
    };
  }

  function create(options) {
    options = options || {};

    try {
      if (typeof THREE === "undefined") {
        return createFailedResult("Three.js is not available.", null, options.plan);
      }

      var scene = options.scene;
      var layout = options.layout;
      var propsPlan = options.propsPlan;
      var trafficPlan = options.trafficPlan;
      var pedestrianPlan = options.pedestrianPlan;
      var plan = options.plan;
      var routeProfileSourcePlan = options.routeProfileSourcePlan || window.MISSION_BOS_RESPONSE_VEHICLE_PLAN || null;
      var validator = options.validator;
      var trafficRuntime = options.trafficRuntime;
      var pedestrianRuntime = options.pedestrianRuntime;

      if (!scene || typeof scene.add !== "function") {
        return createFailedResult("A valid Three.js scene is required.", null, plan);
      }
      if (!layout || !propsPlan || !trafficPlan || !pedestrianPlan || !plan) {
        return createFailedResult("One or more frozen source plans are missing.", null, plan);
      }
      if (
        !validator ||
        typeof validator.validate !== "function" ||
        typeof validator.logResult !== "function" ||
        typeof validator.prepareOpenRoute !== "function" ||
        typeof validator.sampleOpenRoute !== "function" ||
        typeof validator.rectangleCorners !== "function" ||
        typeof validator.polygonsOverlapSAT !== "function" ||
        typeof validator.circleOrientedRectOverlap !== "function"
      ) {
        return createFailedResult("MissionBosResponseVehicleValidator is incomplete.", null, plan);
      }
      if (!trafficRuntime || !trafficRuntime.vehiclesById) {
        return createFailedResult("Validated civilian traffic runtime is required.", null, plan);
      }
      if (!pedestrianRuntime || !pedestrianRuntime.personsById) {
        return createFailedResult("Validated pedestrian runtime is required.", null, plan);
      }

      var validation = validator.validate(
        layout,
        propsPlan,
        trafficPlan,
        pedestrianPlan,
        plan
      );
      validator.logResult(validation);

      if (validation.status !== "PASSED") {
        return createFailedResult("Response vehicle validation returned FAILED.", validation, plan);
      }

      var root = new THREE.Group();
      root.name = "MISSION_BOS_VALIDATED_RESPONSE_VEHICLES";
      root.position.set(0, 0, 0);
      root.rotation.set(0, 0, 0);
      root.scale.set(1, 1, 1);

      var accessGroup = new THREE.Group();
      accessGroup.name = "RESPONSE_STATION_ACCESS_SURFACES";
      root.add(accessGroup);

      var vehicleGroup = new THREE.Group();
      vehicleGroup.name = "VALIDATED_RESPONSE_VEHICLE_MODELS";
      root.add(vehicleGroup);

      scene.add(root);

      var routesById = Object.create(null);
      var routeDefinitionsById = Object.create(null);
      (plan.routes || []).forEach(function (routeDefinition) {
        routeDefinitionsById[routeDefinition.id] = routeDefinition;
        routesById[routeDefinition.id] = validator.prepareOpenRoute(routeDefinition);
      });
      ((routeProfileSourcePlan && routeProfileSourcePlan.routes) || []).forEach(function (routeDefinition) {
        if (!routeDefinitionsById[routeDefinition.id]) routeDefinitionsById[routeDefinition.id] = routeDefinition;
      });

      var renderedCounts = {
        accessSurfaces: 0,
        routes: Object.keys(routesById).length,
        responseVehicles: 0,
        fireTrucks: 0,
        policeCars: 0,
        wheels: 0,
        lightbars: 0,
        ladders: 0
      };

      createAccessSurfaces(plan, accessGroup, renderedCounts);

      var shared = createSharedResources();
      var vehiclesById = Object.create(null);
      var vehicleStates = [];
      var vehicleY = finiteNumber(plan.simulation && plan.simulation.vehicleY, 0.42);
      var turnSmoothing = finiteNumber(plan.simulation && plan.simulation.turnSmoothing, 10.0);
      var maxDelta = finiteNumber(plan.simulation && plan.simulation.maxDeltaSeconds, 0.05);
      var safetyInterval = finiteNumber(plan.simulation && plan.simulation.runtimeSafetyCheckInterval, 0.2);
      var safetyMargin = finiteNumber(plan.simulation && plan.simulation.collisionSafetyMargin, 0.05);
      var flashHz = finiteNumber(plan.simulation && plan.simulation.blueLightFlashHz, 4.5);

      (plan.vehicles || []).forEach(function (definition) {
        var route = routesById[definition.routeId];
        if (!route) return;

        var model = createResponseVehicleModel(definition, shared);
        var initialSample = validator.sampleOpenRoute(route, 0, false);

        model.root.name = definition.id;
        model.root.userData.id = definition.id;
        model.root.userData.kind = definition.kind;
        model.root.userData.routeId = definition.routeId;
        model.root.userData.wheels = model.wheels;
        model.root.position.set(initialSample.x, vehicleY, initialSample.z);
        model.root.rotation.y = normalizeAngle(initialSample.angle);
        vehicleGroup.add(model.root);

        var state = {
          definition: JSON.parse(JSON.stringify(definition)),
          defaultDefinition: JSON.parse(JSON.stringify(definition)),
          defaultRoute: route,
          route: route,
          mesh: model.root,
          wheels: model.wheels,
          lightbarMaterials: model.lightbarMaterials,
          wheelRadius: model.wheelRadius,
          wheelRotation: 0,
          distance: 0,
          lastDistance: 0,
          currentAngle: normalizeAngle(initialSample.angle),
          targetPose: initialSample,
          pose: {
            x: initialSample.x,
            z: initialSample.z,
            angle: normalizeAngle(initialSample.angle)
          },
          phase: VEHICLE_PHASES.AT_STATION,
          dispatchDelaySeconds: finiteNumber(definition.dispatchDelaySeconds, 0),
          returnDelaySeconds: 0,
          returnManeuverRole: null,
          returnBackoutStartDistance: 0,
          returnBackoutTargetDistance: 0,
          started: false
        };

        vehicleStates.push(state);
        vehiclesById[definition.id] = state;
        renderedCounts.responseVehicles += 1;
        renderedCounts.wheels += model.wheels.length;
        renderedCounts.lightbars += model.counts.lightbars;
        renderedCounts.ladders += model.counts.ladders;
        if (definition.kind === "fire-truck") renderedCounts.fireTrucks += 1;
        if (definition.kind === "police-car") renderedCounts.policeCars += 1;
      });

      var manifest = createManifest(renderedCounts, plan.expectedCounts || {});
      logManifest(manifest);

      var globalState = manifest.status === "PASSED" ? STATES.AT_STATIONS : STATES.FAILED;
      var dispatchElapsed = 0;
      var returnElapsed = 0;
      var activeRouteProfileId = "MISSION_001_DEFAULT";
      var activeReturnManeuver = null;
      var fireClearanceGate = false;
      var movementEnabled = manifest.status === "PASSED";
      var safety = {
        title: "MISSION BOS RUNTIME RESPONSE VEHICLE SAFETY",
        responseResponseCollisions: 0,
        responseCivilianVehicleCollisions: 0,
        responsePedestrianCollisions: 0,
        status: movementEnabled ? "PASSED" : "FAILED",
        collisions: [],
        halted: !movementEnabled,
        elapsedSinceCheck: 0,
        loggedFailure: false
      };

      function setLightbarActive(state, active, elapsed) {
        var pulse = active ? (0.5 + 0.5 * Math.sin(elapsed * Math.PI * 2 * flashHz)) : 0;
        state.lightbarMaterials.forEach(function (material, index) {
          var alternate = index % 2 === 0 ? pulse : 1 - pulse;
          var intensity = active ? 0.35 + alternate * 1.9 : 0;
          material.opacity = active ? 0.48 + alternate * 0.52 : 0.16;
          if ("emissiveIntensity" in material) material.emissiveIntensity = intensity;
        });
      }

      function applyPose(state, sample, delta) {
        var targetAngle = normalizeAngle(sample.angle);
        var blend = 1 - Math.exp(-turnSmoothing * delta);
        state.currentAngle = lerpAngle(state.currentAngle, targetAngle, blend);
        state.targetPose = sample;
        state.pose = {
          x: sample.x,
          z: sample.z,
          angle: state.currentAngle
        };
        state.mesh.position.x = sample.x;
        state.mesh.position.z = sample.z;
        state.mesh.rotation.y = state.currentAngle;
      }

      function applyRoutePose(state, sample) {
        state.currentAngle = normalizeAngle(sample.angle);
        state.targetPose = sample;
        state.pose = {
          x: sample.x,
          z: sample.z,
          angle: state.currentAngle
        };
        state.mesh.position.x = sample.x;
        state.mesh.position.z = sample.z;
        state.mesh.rotation.y = state.currentAngle;
      }

      function rotateWheels(state, traveledDistance) {
        if (traveledDistance <= 0 || state.wheelRadius <= 0) return;
        state.wheelRotation -= traveledDistance / state.wheelRadius;
        state.wheels.forEach(function (wheelHolder) {
          wheelHolder.rotation.x = state.wheelRotation;
        });
      }

      function moveOutbound(state, clampedDelta) {
        var oldDistance = state.distance;
        state.distance = Math.min(
          state.route.length,
          state.distance + finiteNumber(state.definition.outboundSpeed, 0) * clampedDelta
        );
        var sample = validator.sampleOpenRoute(state.route, state.distance, false);
        applyRoutePose(state, sample);
        rotateWheels(state, Math.abs(state.distance - oldDistance));

        if (state.distance >= state.route.length - 1e-7) {
          state.distance = state.route.length;
          state.phase = VEHICLE_PHASES.HOLDING;
        }
      }

      function completeReturnTurn(state, targetSample) {
        state.currentAngle = normalizeAngle(targetSample.angle);
        state.targetPose = targetSample;
        state.pose = { x: targetSample.x, z: targetSample.z, angle: state.currentAngle };
        state.mesh.position.x = targetSample.x;
        state.mesh.position.z = targetSample.z;
        state.mesh.rotation.y = state.currentAngle;
        state.phase = VEHICLE_PHASES.RETURNING;
        state.started = true;
        if (activeReturnManeuver && state.definition.id === activeReturnManeuver.fireVehicleId) {
          fireClearanceGate = true;
        }
      }

      function moveReturnClearing(state, clampedDelta) {
        var maneuver = activeReturnManeuver || {};
        var speed = Math.max(0, finiteNumber(maneuver.fireBackoutSpeedMetersPerSecond, 0));
        var oldDistance = state.distance;
        state.distance = Math.max(state.returnBackoutTargetDistance, state.distance - speed * clampedDelta);
        var sample = validator.sampleOpenRoute(state.route, state.distance, false);
        applyRoutePose(state, sample);
        rotateWheels(state, Math.abs(state.distance - oldDistance));
        if (state.distance <= state.returnBackoutTargetDistance + 1e-7) {
          state.distance = state.returnBackoutTargetDistance;
          state.phase = VEHICLE_PHASES.RETURN_TURNING;
        }
      }

      function moveReturnTurning(state, clampedDelta) {
        var reverseSample = validator.sampleOpenRoute(state.route, state.distance, true);
        var targetAngle = normalizeAngle(reverseSample.angle);
        var angleDifference = Math.abs(shortestAngleDifference(state.currentAngle, targetAngle));
        if (angleDifference <= 0.12) {
          completeReturnTurn(state, reverseSample);
          return;
        }
        applyPose(state, reverseSample, clampedDelta);
      }

      function moveReturning(state, clampedDelta) {
        var sampleBeforeMove = validator.sampleOpenRoute(state.route, state.distance, true);
        var targetAngle = normalizeAngle(sampleBeforeMove.angle);
        var angleDifference = Math.abs(shortestAngleDifference(state.currentAngle, targetAngle));

        applyPose(state, sampleBeforeMove, clampedDelta);

        if (angleDifference > 0.12) {
          return;
        }

        var oldDistance = state.distance;
        state.distance = Math.max(
          0,
          state.distance - finiteNumber(state.definition.returnSpeed, 0) * clampedDelta
        );
        var sample = validator.sampleOpenRoute(state.route, state.distance, true);
        applyRoutePose(state, sample);
        rotateWheels(state, Math.abs(state.distance - oldDistance));

        if (state.distance <= 1e-7) {
          state.distance = 0;
          state.phase = VEHICLE_PHASES.AT_STATION;
          state.returnManeuverRole = null;
          state.returnBackoutStartDistance = 0;
          state.returnBackoutTargetDistance = 0;
          state.started = false;
          var stationSample = validator.sampleOpenRoute(state.route, 0, false);
          state.currentAngle = normalizeAngle(stationSample.angle);
          state.pose = {
            x: stationSample.x,
            z: stationSample.z,
            angle: state.currentAngle
          };
          state.mesh.position.x = stationSample.x;
          state.mesh.position.z = stationSample.z;
          state.mesh.rotation.y = state.currentAngle;
        }
      }

      function updateGlobalState() {
        if (globalState === STATES.FAILED) return;

        if (globalState === STATES.DISPATCHING || globalState === STATES.ENROUTE) {
          var allHolding = vehicleStates.every(function (state) {
            return state.phase === VEHICLE_PHASES.HOLDING;
          });
          if (allHolding) {
            globalState = STATES.HOLDING;
            return;
          }

          var anyWaiting = vehicleStates.some(function (state) {
            return state.phase === VEHICLE_PHASES.WAITING;
          });
          globalState = anyWaiting ? STATES.DISPATCHING : STATES.ENROUTE;
          return;
        }

        if (globalState === STATES.RETURNING) {
          var allAtStations = vehicleStates.every(function (state) {
            return state.phase === VEHICLE_PHASES.AT_STATION;
          });
          if (allAtStations) globalState = STATES.AT_STATIONS;
        }
      }

      function evaluateSafety(forceLog) {
        if (globalState === STATES.FAILED && safety.collisions.length > 0) return copySafety(safety);

        var responseResponse = [];
        var responseCivilian = [];
        var responsePedestrian = [];

        for (var i = 0; i < vehicleStates.length; i += 1) {
          for (var j = i + 1; j < vehicleStates.length; j += 1) {
            var first = vehicleStates[i];
            var second = vehicleStates[j];
            var firstPolygon = validator.rectangleCorners(
              first.pose,
              finiteNumber(first.definition.footprintLength, 0),
              finiteNumber(first.definition.footprintWidth, 0),
              safetyMargin
            );
            var secondPolygon = validator.rectangleCorners(
              second.pose,
              finiteNumber(second.definition.footprintLength, 0),
              finiteNumber(second.definition.footprintWidth, 0),
              safetyMargin
            );
            if (validator.polygonsOverlapSAT(firstPolygon, secondPolygon)) {
              responseResponse.push({
                type: "response-response",
                responseVehicleA: first.definition.id,
                responseVehicleB: second.definition.id
              });
            }
          }
        }

        vehicleStates.forEach(function (responseState) {
          var responsePolygon = validator.rectangleCorners(
            responseState.pose,
            finiteNumber(responseState.definition.footprintLength, 0),
            finiteNumber(responseState.definition.footprintWidth, 0),
            safetyMargin
          );

          Object.keys(trafficRuntime.vehiclesById).forEach(function (civilianId) {
            var civilianState = trafficRuntime.vehiclesById[civilianId];
            if (!civilianState || !civilianState.pose || !civilianState.definition) return;
            var civilianPolygon = validator.rectangleCorners(
              civilianState.pose,
              finiteNumber(civilianState.definition.footprintLength, 0),
              finiteNumber(civilianState.definition.footprintWidth, 0),
              safetyMargin
            );
            if (validator.polygonsOverlapSAT(responsePolygon, civilianPolygon)) {
              responseCivilian.push({
                type: "response-civilian",
                responseVehicleId: responseState.definition.id,
                civilianVehicleId: civilianId
              });
            }
          });

          Object.keys(pedestrianRuntime.personsById).forEach(function (pedestrianId) {
            var personRoot = pedestrianRuntime.personsById[pedestrianId];
            var pedestrianDefinition = findById(pedestrianPlan.pedestrians, pedestrianId);
            if (!personRoot || !pedestrianDefinition) return;
            var circle = { x: personRoot.position.x, z: personRoot.position.z };
            var radius = finiteNumber(pedestrianDefinition.personalSpaceRadius, 0.28);
            if (validator.circleOrientedRectOverlap(
              circle,
              radius,
              responseState.pose,
              finiteNumber(responseState.definition.footprintLength, 0),
              finiteNumber(responseState.definition.footprintWidth, 0),
              safetyMargin
            )) {
              responsePedestrian.push({
                type: "response-pedestrian",
                responseVehicleId: responseState.definition.id,
                pedestrianId: pedestrianId
              });
            }
          });
        });

        safety.responseResponseCollisions = responseResponse.length;
        safety.responseCivilianVehicleCollisions = responseCivilian.length;
        safety.responsePedestrianCollisions = responsePedestrian.length;
        safety.collisions = responseResponse.concat(responseCivilian, responsePedestrian);
        safety.status = safety.collisions.length === 0 ? "PASSED" : "FAILED";

        if (safety.collisions.length > 0) {
          safety.halted = true;
          movementEnabled = false;
          globalState = STATES.FAILED;
          vehicleStates.forEach(function (state) {
            state.phase = VEHICLE_PHASES.FAILED;
            setLightbarActive(state, false, 0);
          });
          if (!safety.loggedFailure) {
            logSafety(safety, true);
            safety.loggedFailure = true;
          }
        } else if (forceLog) {
          logSafety(safety, false);
        }

        return copySafety(safety);
      }

      function dispatch() {
        if (!movementEnabled || safety.halted || globalState !== STATES.AT_STATIONS) return false;

        dispatchElapsed = 0;
        vehicleStates.forEach(function (state) {
          state.phase = state.dispatchDelaySeconds > 0
            ? VEHICLE_PHASES.WAITING
            : VEHICLE_PHASES.ENROUTE;
          state.started = state.dispatchDelaySeconds <= 0;
        });
        globalState = STATES.DISPATCHING;
        return true;
      }

      function returnToStations() {
        if (!movementEnabled || safety.halted || globalState !== STATES.HOLDING) return false;

        returnElapsed = 0;
        fireClearanceGate = false;
        vehicleStates.forEach(function (state) {
          state.returnBackoutStartDistance = state.distance;
          state.returnBackoutTargetDistance = state.distance;
          if (activeReturnManeuver && state.definition.id === activeReturnManeuver.fireVehicleId) {
            state.returnManeuverRole = "FIRE";
            state.returnBackoutTargetDistance = Math.max(0, state.distance - Math.max(0, finiteNumber(activeReturnManeuver.fireBackoutDistanceMeters, 0)));
            state.phase = VEHICLE_PHASES.RETURN_CLEARING;
            state.started = true;
          } else if (activeReturnManeuver && state.definition.id === activeReturnManeuver.policeVehicleId) {
            state.returnManeuverRole = "POLICE";
            state.phase = VEHICLE_PHASES.RETURN_WAITING;
            state.started = false;
          } else {
            state.returnManeuverRole = null;
            state.phase = state.returnDelaySeconds > 0 ? VEHICLE_PHASES.RETURN_WAITING : VEHICLE_PHASES.RETURNING;
            state.started = state.returnDelaySeconds <= 0;
          }
        });
        globalState = STATES.RETURNING;
        return true;
      }

      function routePrefixPoints(routeDefinition, prefixEnd) {
        var points = (routeDefinition && routeDefinition.points ? routeDefinition.points : []).map(function (point) {
          return { x: Number(point.x), z: Number(point.z) };
        });
        if (!prefixEnd) return points;
        var bestIndex = 0;
        var bestDistance = Infinity;
        points.forEach(function (point, index) {
          var dx = point.x - Number(prefixEnd.x);
          var dz = point.z - Number(prefixEnd.z);
          var distance = dx * dx + dz * dz;
          if (distance < bestDistance) { bestDistance = distance; bestIndex = index; }
        });
        return points.slice(0, bestIndex + 1);
      }

      var OUTBOUND_COLLISION_VALIDATION_STEP_SECONDS = 0.005;
      var OUTBOUND_COLLISION_CALIBRATION_MARGIN_METERS = Math.max(
        finiteNumber((plan.simulation || {}).collisionSafetyMargin, 0.05),
        0.25
      );
      var OUTBOUND_DISPATCH_RESERVE_SECONDS = 0.20;
      var OUTBOUND_DISPATCH_CALIBRATION_LIMIT_SECONDS = 8.0;

      function routeProfileCollision(entries, delays, options) {
        options = options || {};
        var step = Math.max(0.001, Math.min(0.05, finiteNumber(options.stepSeconds, 0.05)));
        var margin = finiteNumber(
          options.marginMeters,
          finiteNumber((plan.simulation || {}).collisionSafetyMargin, 0.05)
        );
        var duration = 0;
        entries.forEach(function (entry, index) {
          duration = Math.max(duration, Number(delays[index] || 0) + entry.route.length / Math.max(0.01, finiteNumber(entry.definition.outboundSpeed, 1)) + 0.5);
        });
        for (var time = 0; time <= duration + 1e-9; time += step) {
          var poses = entries.map(function (entry, index) {
            var distance = Math.max(0, time - Number(delays[index] || 0)) * Math.max(0.01, finiteNumber(entry.definition.outboundSpeed, 1));
            distance = Math.min(entry.route.length, distance);
            return validator.sampleOpenRoute(entry.route, distance, false);
          });
          for (var a = 0; a < entries.length; a += 1) {
            for (var b = a + 1; b < entries.length; b += 1) {
              var polygonA = validator.rectangleCorners(
                poses[a],
                finiteNumber(entries[a].definition.footprintLength, 1),
                finiteNumber(entries[a].definition.footprintWidth, 1),
                margin
              );
              var polygonB = validator.rectangleCorners(
                poses[b],
                finiteNumber(entries[b].definition.footprintLength, 1),
                finiteNumber(entries[b].definition.footprintWidth, 1),
                margin
              );
              if (validator.polygonsOverlapSAT(polygonA, polygonB)) return true;
            }
          }
        }
        return false;
      }

      function responseEntriesOverlap(first, firstPose, second, secondPose, margin) {
        var polygonA = validator.rectangleCorners(firstPose,
          finiteNumber(first.definition.footprintLength, 1), finiteNumber(first.definition.footprintWidth, 1), margin);
        var polygonB = validator.rectangleCorners(secondPose,
          finiteNumber(second.definition.footprintLength, 1), finiteNumber(second.definition.footprintWidth, 1), margin);
        return validator.polygonsOverlapSAT(polygonA, polygonB);
      }

      function routeProfileReturnCollision(entries) {
        var step = 0.01;
        var margin = finiteNumber((plan.simulation || {}).collisionSafetyMargin, 0.05);
        var duration = 0;
        entries.forEach(function (entry) {
          duration = Math.max(duration, Number(entry.returnDelaySeconds || 0) +
            entry.route.length / Math.max(0.01, finiteNumber(entry.definition.returnSpeed, 1)) + 0.5);
        });
        for (var time = 0; time <= duration + 1e-9; time += step) {
          var poses = entries.map(function (entry) {
            var traveled = Math.max(0, time - Number(entry.returnDelaySeconds || 0)) *
              Math.max(0.01, finiteNumber(entry.definition.returnSpeed, 1));
            var distance = Math.max(0, entry.route.length - traveled);
            return validator.sampleOpenRoute(entry.route, distance, true);
          });
          for (var a = 0; a < entries.length; a += 1) {
            for (var b = a + 1; b < entries.length; b += 1) {
              if (responseEntriesOverlap(entries[a], poses[a], entries[b], poses[b], margin)) return true;
            }
          }
        }
        return false;
      }

      function routeProfileManeuverCollision(entries, maneuver) {
        if (!maneuver || maneuver.strategy !== "FIRE_BACKOUT_TURN_THEN_POLICE_GATE") return true;
        var fireEntry = null;
        var policeEntry = null;
        entries.forEach(function (entry) {
          if (entry.definition.id === maneuver.fireVehicleId) fireEntry = entry;
          if (entry.definition.id === maneuver.policeVehicleId) policeEntry = entry;
        });
        if (!fireEntry || !policeEntry) return true;
        var backout = finiteNumber(maneuver.fireBackoutDistanceMeters, 0);
        var backoutSpeed = finiteNumber(maneuver.fireBackoutSpeedMetersPerSecond, 0);
        var policeDelay = Math.max(finiteNumber(policeEntry.returnDelaySeconds, 0), finiteNumber(maneuver.policeMinimumReleaseDelaySeconds, 0));
        if (backout < 6.0 - 1e-9 || !(backoutSpeed > 0) || policeDelay < 4.0 - 1e-9) return true;

        var step = Math.min(0.01, Math.max(0.001, finiteNumber(maneuver.runtimeValidationStepSeconds, 0.01)));
        var margin = finiteNumber(maneuver.collisionSafetyMarginMeters, finiteNumber((plan.simulation || {}).collisionSafetyMargin, 0.05));
        var fireEnd = validator.sampleOpenRoute(fireEntry.route, fireEntry.route.length, false);
        var policeEnd = validator.sampleOpenRoute(policeEntry.route, policeEntry.route.length, false);
        var fire = { distance: fireEntry.route.length, angle: normalizeAngle(fireEnd.angle), phase: "BACKOUT" };
        var police = { distance: policeEntry.route.length, angle: normalizeAngle(policeEnd.angle), phase: "WAITING" };
        var fireGate = false;
        var elapsed = 0;
        while (elapsed <= 90 + 1e-9) {
          elapsed += step;
          if (fire.phase === "BACKOUT") {
            fire.distance = Math.max(fireEntry.route.length - backout, fire.distance - backoutSpeed * step);
            var fireBackPose = validator.sampleOpenRoute(fireEntry.route, fire.distance, false);
            fire.angle = normalizeAngle(fireBackPose.angle);
            if (fire.distance <= fireEntry.route.length - backout + 1e-9) fire.phase = "TURNING";
          } else if (fire.phase === "TURNING") {
            var fireTurnPose = validator.sampleOpenRoute(fireEntry.route, fire.distance, true);
            var fireTarget = normalizeAngle(fireTurnPose.angle);
            var fireDifference = Math.abs(shortestAngleDifference(fire.angle, fireTarget));
            fire.angle = lerpAngle(fire.angle, fireTarget, 1 - Math.exp(-turnSmoothing * step));
            if (fireDifference <= 0.12) { fire.angle = fireTarget; fire.phase = "RETURNING"; fireGate = true; }
          } else if (fire.phase === "RETURNING") {
            fire.distance = Math.max(0, fire.distance - finiteNumber(fireEntry.definition.returnSpeed, 1) * step);
            var fireReturnPose = validator.sampleOpenRoute(fireEntry.route, fire.distance, true);
            fire.angle = normalizeAngle(fireReturnPose.angle);
            if (fire.distance <= 1e-9) fire.phase = "AT_STATION";
          }

          if (police.phase === "WAITING" && fireGate && elapsed + 1e-9 >= policeDelay) {
            police.phase = "TURNING";
          } else if (police.phase === "TURNING") {
            var policeTurnPose = validator.sampleOpenRoute(policeEntry.route, police.distance, true);
            var policeTarget = normalizeAngle(policeTurnPose.angle);
            var policeDifference = Math.abs(shortestAngleDifference(police.angle, policeTarget));
            police.angle = lerpAngle(police.angle, policeTarget, 1 - Math.exp(-turnSmoothing * step));
            if (policeDifference <= 0.12) { police.angle = policeTarget; police.phase = "RETURNING"; }
          } else if (police.phase === "RETURNING") {
            police.distance = Math.max(0, police.distance - finiteNumber(policeEntry.definition.returnSpeed, 1) * step);
            var policeReturnPose = validator.sampleOpenRoute(policeEntry.route, police.distance, true);
            police.angle = normalizeAngle(policeReturnPose.angle);
            if (police.distance <= 1e-9) police.phase = "AT_STATION";
          }

          var firePosition = validator.sampleOpenRoute(fireEntry.route, fire.distance, false);
          var policePosition = validator.sampleOpenRoute(policeEntry.route, police.distance, false);
          if (responseEntriesOverlap(fireEntry, { x: firePosition.x, z: firePosition.z, angle: fire.angle },
              policeEntry, { x: policePosition.x, z: policePosition.z, angle: police.angle }, margin)) return true;
          if (fire.phase === "AT_STATION" && police.phase === "AT_STATION") return false;
        }
        return true;
      }

      function calibrateOutboundDispatchDelays(entries) {
        var delays = entries.map(function (entry) { return finiteNumber(entry.dispatchDelaySeconds, 0); });
        if (entries.length < 2) return delays;

        var strictOptions = {
          stepSeconds: OUTBOUND_COLLISION_VALIDATION_STEP_SECONDS,
          marginMeters: OUTBOUND_COLLISION_CALIBRATION_MARGIN_METERS
        };
        if (!routeProfileCollision(entries, delays, strictOptions)) return delays;

        var order = entries.map(function (entry, index) { return { index: index, delay: delays[index] }; })
          .sort(function (a, b) { return a.delay - b.delay || a.index - b.index; });
        var later = order[order.length - 1].index;
        var baseDelay = delays[later];
        var firstSafeDelay = null;

        for (var extra = 0.05; extra <= OUTBOUND_DISPATCH_CALIBRATION_LIMIT_SECONDS + 1e-9; extra += 0.05) {
          delays[later] = baseDelay + extra;
          if (!routeProfileCollision(entries, delays, strictOptions)) {
            firstSafeDelay = delays[later];
            break;
          }
        }
        if (firstSafeDelay === null) return null;

        delays[later] = firstSafeDelay + OUTBOUND_DISPATCH_RESERVE_SECONDS;
        while (delays[later] <= baseDelay + OUTBOUND_DISPATCH_CALIBRATION_LIMIT_SECONDS + 1e-9 &&
               routeProfileCollision(entries, delays, strictOptions)) {
          delays[later] += 0.05;
        }
        if (delays[later] > baseDelay + OUTBOUND_DISPATCH_CALIBRATION_LIMIT_SECONDS + 1e-9) return null;
        return delays;
      }

      function setRouteProfile(profileId, profile) {
        if (!movementEnabled || safety.halted || globalState !== STATES.AT_STATIONS ||
            !vehicleStates.every(function (state) { return state.phase === VEHICLE_PHASES.AT_STATION; })) return false;
        if (profileId === "MISSION_001_DEFAULT") return restoreDefaultRouteProfile();
        if (!profile || profile.id !== profileId || !Array.isArray(profile.vehicles)) return false;
        var profileReturnManeuver = profile.returnManeuver ? JSON.parse(JSON.stringify(profile.returnManeuver)) : null;
        var prepared = [];
        for (var i = 0; i < vehicleStates.length; i += 1) {
          var state = vehicleStates[i];
          var vehicleProfile = null;
          for (var j = 0; j < profile.vehicles.length; j += 1) {
            if (profile.vehicles[j] && profile.vehicles[j].vehicleId === state.defaultDefinition.id) vehicleProfile = profile.vehicles[j];
          }
          if (!vehicleProfile || !Array.isArray(vehicleProfile.extensionWaypoints)) return false;
          var baselineDefinition = routeDefinitionsById[vehicleProfile.baselinePrefixRouteId];
          if (!baselineDefinition) return false;
          var points = routePrefixPoints(baselineDefinition, vehicleProfile.baselinePrefixEnd)
            .concat(vehicleProfile.extensionWaypoints.map(function (point) { return { x: Number(point.x), z: Number(point.z) }; }));
          var routeDefinition = {
            id: profileId + "_" + state.defaultDefinition.id,
            vehicleId: state.defaultDefinition.id,
            closed: false,
            mode: "mission-003-water-leak-response",
            points: points
          };
          var preparedRoute = validator.prepareOpenRoute(routeDefinition);
          if (!preparedRoute || !isFinite(preparedRoute.length) || preparedRoute.length <= 0) return false;
          var nextDefinition = JSON.parse(JSON.stringify(state.defaultDefinition));
          nextDefinition.routeId = routeDefinition.id;
          nextDefinition.outboundSpeed = finiteNumber(vehicleProfile.outboundSpeed, nextDefinition.outboundSpeed);
          nextDefinition.returnSpeed = finiteNumber(vehicleProfile.returnSpeed, nextDefinition.returnSpeed);
          nextDefinition.dispatchDelaySeconds = finiteNumber(vehicleProfile.dispatchDelaySeconds, 0);
          prepared.push({ state: state, route: preparedRoute, definition: nextDefinition,
            dispatchDelaySeconds: finiteNumber(vehicleProfile.dispatchDelaySeconds, 0),
            returnDelaySeconds: finiteNumber(vehicleProfile.returnDelaySeconds, 0) });
        }
        var effectiveDispatchDelays = calibrateOutboundDispatchDelays(prepared);
        if (!effectiveDispatchDelays || routeProfileCollision(prepared, effectiveDispatchDelays, {
          stepSeconds: OUTBOUND_COLLISION_VALIDATION_STEP_SECONDS,
          marginMeters: OUTBOUND_COLLISION_CALIBRATION_MARGIN_METERS
        })) return false;
        if (profileId === "MISSION_004_RING_COLLISION_PROFILE" &&
            (!profileReturnManeuver || routeProfileManeuverCollision(prepared, profileReturnManeuver))) return false;
        prepared.forEach(function (entry, index) {
          entry.state.route = entry.route;
          entry.state.definition = entry.definition;
          entry.state.dispatchDelaySeconds = effectiveDispatchDelays[index];
          entry.state.plannedDispatchDelaySeconds = entry.dispatchDelaySeconds;
          entry.state.returnDelaySeconds = entry.returnDelaySeconds;
          entry.state.returnManeuverRole = null;
          entry.state.distance = 0;
          entry.state.lastDistance = 0;
        });
        activeRouteProfileId = profileId;
        activeReturnManeuver = profileReturnManeuver;
        fireClearanceGate = false;
        return reset(false);
      }

      function restoreDefaultRouteProfile() {
        if (globalState !== STATES.AT_STATIONS || !vehicleStates.every(function (state) { return state.phase === VEHICLE_PHASES.AT_STATION; })) return false;
        vehicleStates.forEach(function (state) {
          state.route = state.defaultRoute;
          state.definition = JSON.parse(JSON.stringify(state.defaultDefinition));
          state.dispatchDelaySeconds = finiteNumber(state.defaultDefinition.dispatchDelaySeconds, 0);
          state.returnDelaySeconds = 0;
          state.returnManeuverRole = null;
        });
        activeRouteProfileId = "MISSION_001_DEFAULT";
        activeReturnManeuver = null;
        fireClearanceGate = false;
        return reset(false);
      }

      function reset(restoreProfile) {
        if (manifest.status !== "PASSED") return false;
        if (restoreProfile !== false && activeRouteProfileId !== "MISSION_001_DEFAULT" && globalState === STATES.AT_STATIONS) {
          vehicleStates.forEach(function (state) {
            state.route = state.defaultRoute;
            state.definition = JSON.parse(JSON.stringify(state.defaultDefinition));
            state.dispatchDelaySeconds = finiteNumber(state.defaultDefinition.dispatchDelaySeconds, 0);
            state.returnDelaySeconds = 0;
            state.returnManeuverRole = null;
          });
          activeRouteProfileId = "MISSION_001_DEFAULT";
          activeReturnManeuver = null;
          fireClearanceGate = false;
        }

        safety.halted = false;
        safety.status = "PASSED";
        safety.responseResponseCollisions = 0;
        safety.responseCivilianVehicleCollisions = 0;
        safety.responsePedestrianCollisions = 0;
        safety.collisions = [];
        safety.elapsedSinceCheck = 0;
        safety.loggedFailure = false;
        movementEnabled = true;
        dispatchElapsed = 0;
        returnElapsed = 0;
        fireClearanceGate = false;

        vehicleStates.forEach(function (state) {
          var stationSample = validator.sampleOpenRoute(state.route, 0, false);
          state.distance = 0;
          state.lastDistance = 0;
          state.currentAngle = normalizeAngle(stationSample.angle);
          state.targetPose = stationSample;
          state.pose = {
            x: stationSample.x,
            z: stationSample.z,
            angle: state.currentAngle
          };
          state.phase = VEHICLE_PHASES.AT_STATION;
          state.returnManeuverRole = null;
          state.returnBackoutStartDistance = 0;
          state.returnBackoutTargetDistance = 0;
          state.started = false;
          state.mesh.position.set(stationSample.x, vehicleY, stationSample.z);
          state.mesh.rotation.y = state.currentAngle;
          state.wheelRotation = 0;
          state.wheels.forEach(function (wheel) { wheel.rotation.x = 0; });
          setLightbarActive(state, false, 0);
        });

        globalState = STATES.AT_STATIONS;
        evaluateSafety(false);
        return globalState !== STATES.FAILED;
      }

      function update(delta, elapsed) {
        if (!movementEnabled || safety.halted || globalState === STATES.FAILED) return;

        var clampedDelta = Math.max(0, Math.min(finiteNumber(delta, 0), maxDelta));
        var safeElapsed = finiteNumber(elapsed, 0);

        if (globalState === STATES.DISPATCHING || globalState === STATES.ENROUTE) {
          dispatchElapsed += clampedDelta;

          vehicleStates.forEach(function (state) {
            if (state.phase === VEHICLE_PHASES.WAITING && dispatchElapsed >= state.dispatchDelaySeconds) {
              state.phase = VEHICLE_PHASES.ENROUTE;
              state.started = true;
            }
            if (state.phase === VEHICLE_PHASES.ENROUTE) {
              moveOutbound(state, clampedDelta);
            }
          });
        } else if (globalState === STATES.RETURNING) {
          returnElapsed += clampedDelta;
          vehicleStates.forEach(function (state) {
            if (state.phase === VEHICLE_PHASES.RETURN_WAITING) {
              if (activeReturnManeuver && state.definition.id === activeReturnManeuver.policeVehicleId) {
                var policeReleaseDelay = Math.max(state.returnDelaySeconds, finiteNumber(activeReturnManeuver.policeMinimumReleaseDelaySeconds, 0));
                if (fireClearanceGate && returnElapsed >= policeReleaseDelay) {
                  state.phase = VEHICLE_PHASES.RETURN_TURNING;
                  state.started = true;
                }
              } else if (returnElapsed >= state.returnDelaySeconds) {
                state.phase = VEHICLE_PHASES.RETURNING;
                state.started = true;
              }
            }
            if (state.phase === VEHICLE_PHASES.RETURN_CLEARING) {
              moveReturnClearing(state, clampedDelta);
            } else if (state.phase === VEHICLE_PHASES.RETURN_TURNING) {
              moveReturnTurning(state, clampedDelta);
            } else if (state.phase === VEHICLE_PHASES.RETURNING) {
              moveReturning(state, clampedDelta);
            }
          });
        }

        vehicleStates.forEach(function (state) {
          var lightsActive =
            state.phase === VEHICLE_PHASES.ENROUTE ||
            state.phase === VEHICLE_PHASES.HOLDING ||
            state.phase === VEHICLE_PHASES.RETURN_WAITING ||
            state.phase === VEHICLE_PHASES.RETURN_CLEARING ||
            state.phase === VEHICLE_PHASES.RETURN_TURNING ||
            state.phase === VEHICLE_PHASES.RETURNING;
          setLightbarActive(state, lightsActive, safeElapsed);
        });

        updateGlobalState();

        safety.elapsedSinceCheck += clampedDelta;
        if (safety.elapsedSinceCheck >= safetyInterval) {
          safety.elapsedSinceCheck = 0;
          evaluateSafety(false);
        }
      }

      function getVehicleStatus(vehicleId) {
        var state = vehiclesById[vehicleId];
        if (!state) return "Nicht verfügbar";
        if (state.phase === VEHICLE_PHASES.AT_STATION) return "In Station";
        if (state.phase === VEHICLE_PHASES.WAITING) return "Alarmiert – Start verzögert";
        if (state.phase === VEHICLE_PHASES.ENROUTE) return "Auf Anfahrt";
        if (state.phase === VEHICLE_PHASES.HOLDING) return "Bereitstellung erreicht";
        if (state.phase === VEHICLE_PHASES.RETURN_WAITING) return "Rückfahrt vorbereitet";
        if (state.phase === VEHICLE_PHASES.RETURN_CLEARING) return "Rangiert rückwärts";
        if (state.phase === VEHICLE_PHASES.RETURN_TURNING) return "Dreht für Rückfahrt";
        if (state.phase === VEHICLE_PHASES.RETURNING) return "Rückfahrt zur Station";
        return "Fehlgeschlagen";
      }

      function getReturnManeuverStatus() {
        var maneuver = activeReturnManeuver || {};
        var fire = vehiclesById[maneuver.fireVehicleId] || null;
        var police = vehiclesById[maneuver.policeVehicleId] || null;
        return {
          strategy: maneuver.strategy || "STANDARD_RETURN",
          fireSubphase: fire ? fire.phase : null,
          policeSubphase: police ? police.phase : null,
          fireClearanceGate: fireClearanceGate === true,
          fireClearanceGateId: maneuver.fireGateId || null,
          fireBackoutDistanceMeters: finiteNumber(maneuver.fireBackoutDistanceMeters, 0),
          fireBackoutSpeedMetersPerSecond: finiteNumber(maneuver.fireBackoutSpeedMetersPerSecond, 0),
          fireReturnDelaySeconds: fire ? finiteNumber(fire.returnDelaySeconds, 0) : 0,
          policeReturnDelaySeconds: police ? finiteNumber(police.returnDelaySeconds, 0) : 0,
          policeMinimumReleaseDelaySeconds: finiteNumber(maneuver.policeMinimumReleaseDelaySeconds, 0),
          returnElapsedSeconds: returnElapsed
        };
      }

      function getFireTruckState() {
        for (var i = 0; i < vehicleStates.length; i += 1) {
          if (vehicleStates[i].definition.kind === "fire-truck") return vehicleStates[i];
        }
        return null;
      }

      function getFireTruckCommsPosition() {
        var fireState = getFireTruckState();
        if (!fireState) return new THREE.Vector3();
        return new THREE.Vector3(
          fireState.mesh.position.x,
          fireState.mesh.position.y + 1.75,
          fireState.mesh.position.z
        );
      }

      function dispose() {
        if (root.parent) root.parent.remove(root);
        var geometries = [];
        var materials = [];
        root.traverse(function (object) {
          if (object.geometry && geometries.indexOf(object.geometry) === -1) {
            geometries.push(object.geometry);
          }
          if (object.material) {
            var objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
            objectMaterials.forEach(function (material) {
              if (material && materials.indexOf(material) === -1) materials.push(material);
            });
          }
        });
        geometries.forEach(function (geometry) {
          if (geometry && typeof geometry.dispose === "function") geometry.dispose();
        });
        materials.forEach(function (material) {
          if (material && typeof material.dispose === "function") material.dispose();
        });
        vehicleStates.length = 0;
      }

      evaluateSafety(true);

      return {
        root: root,
        groups: { accessSurfaces: accessGroup, vehicles: vehicleGroup },
        vehiclesById: vehiclesById,
        validation: validation,
        renderedCounts: renderedCounts,
        update: update,
        dispatch: dispatch,
        returnToStations: returnToStations,
        setRouteProfile: setRouteProfile,
        restoreDefaultRouteProfile: restoreDefaultRouteProfile,
        getRouteProfileId: function () { return activeRouteProfileId; },
        allAtBase: function () { return globalState === STATES.AT_STATIONS && vehicleStates.every(function (state) { return state.phase === VEHICLE_PHASES.AT_STATION; }); },
        reset: reset,
        getVehicleCount: function () { return vehicleStates.length; },
        getWheelCount: function () { return renderedCounts.wheels; },
        getState: function () { return globalState; },
        getVehicleStatus: getVehicleStatus,
        getReturnManeuverStatus: getReturnManeuverStatus,
        getFireTruckStatus: function () {
          var fire = getFireTruckState();
          return fire ? getVehicleStatus(fire.definition.id) : "Nicht verfügbar";
        },
        getFireTruckCommsPosition: getFireTruckCommsPosition,
        getManifest: function () { return manifest; },
        getSafetyStatus: function () { return copySafety(safety); },
        dispose: dispose
      };
    } catch (error) {
      console.error("MISSION BOS RESPONSE VEHICLE RENDERING ABORTED:", error);
      return createFailedResult("Response vehicle renderer returned a safe failed state.", null, options.plan);
    }
  }

  function createAccessSurfaces(plan, group, counts) {
    (plan.accessSurfaces || []).forEach(function (definition) {
      var rect = definition.renderRect;
      if (!rect) return;

      var surface = new THREE.Mesh(
        new THREE.PlaneGeometry(Number(rect.width), Number(rect.depth)),
        new THREE.MeshStandardMaterial({
          color: definition.color || "#343b43",
          roughness: 0.9
        })
      );
      surface.name = definition.id;
      surface.rotation.x = -Math.PI / 2;
      surface.position.set(Number(rect.x), 0.061, Number(rect.z));
      surface.receiveShadow = true;
      group.add(surface);

      var isVertical = Number(rect.depth) >= Number(rect.width);
      var marking = new THREE.Mesh(
        isVertical
          ? new THREE.PlaneGeometry(Math.min(0.11, Number(rect.width) * 0.12), Number(rect.depth) * 0.72)
          : new THREE.PlaneGeometry(Number(rect.width) * 0.72, Math.min(0.11, Number(rect.depth) * 0.12)),
        new THREE.MeshBasicMaterial({
          color: definition.markingColor || "#f0f3f5",
          transparent: true,
          opacity: 0.55
        })
      );
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(Number(rect.x), 0.066, Number(rect.z));
      group.add(marking);

      counts.accessSurfaces += 1;
    });
  }

  function createSharedResources() {
    return {
      tireMaterial: new THREE.MeshStandardMaterial({ color: 0x171a1f, roughness: 0.9 }),
      rimMaterial: new THREE.MeshStandardMaterial({ color: 0xb8c2cc, roughness: 0.38, metalness: 0.52 }),
      darkTrimMaterial: new THREE.MeshStandardMaterial({ color: 0x27313a, roughness: 0.58, metalness: 0.08 }),
      headlightMaterial: new THREE.MeshStandardMaterial({
        color: 0xfff7cf,
        emissive: 0xffd36b,
        emissiveIntensity: 0.9,
        roughness: 0.24
      }),
      tailLightMaterial: new THREE.MeshStandardMaterial({
        color: 0xc72e35,
        emissive: 0x7d1015,
        emissiveIntensity: 0.75,
        roughness: 0.3
      })
    };
  }

  function createResponseVehicleModel(definition, shared) {
    if (definition.kind === "fire-truck") {
      return createFireTruckModel(definition, shared);
    }
    return createPoliceCarModel(definition, shared);
  }

  function createFireTruckModel(definition, shared) {
    var root = new THREE.Group();
    var bodyLength = Number(definition.bodyLength);
    var bodyWidth = Number(definition.bodyWidth);
    var footprintWidth = Number(definition.footprintWidth);

    var bodyMaterial = new THREE.MeshStandardMaterial({
      color: definition.bodyColor,
      roughness: 0.46,
      metalness: 0.06
    });
    var cabinMaterial = new THREE.MeshStandardMaterial({
      color: definition.cabinColor,
      roughness: 0.44,
      metalness: 0.05
    });
    var glassMaterial = new THREE.MeshStandardMaterial({
      color: definition.glassColor,
      roughness: 0.18,
      transparent: true,
      opacity: 0.84
    });
    var ladderMaterial = new THREE.MeshStandardMaterial({
      color: definition.ladderColor,
      roughness: 0.45,
      metalness: 0.48
    });

    var lowerBody = new THREE.Mesh(
      new THREE.BoxGeometry(bodyWidth, 0.72, bodyLength),
      bodyMaterial
    );
    lowerBody.name = definition.id + "_BODY";
    lowerBody.position.y = 0.36;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    root.add(lowerBody);

    var equipmentBody = new THREE.Mesh(
      new THREE.BoxGeometry(bodyWidth * 0.94, 0.78, bodyLength * 0.58),
      bodyMaterial
    );
    equipmentBody.name = definition.id + "_EQUIPMENT_BODY";
    equipmentBody.position.set(0, 1.03, -bodyLength * 0.17);
    equipmentBody.castShadow = true;
    root.add(equipmentBody);

    var cabin = new THREE.Mesh(
      new THREE.BoxGeometry(bodyWidth * 0.96, 0.82, bodyLength * 0.31),
      cabinMaterial
    );
    cabin.name = definition.id + "_CABIN";
    cabin.position.set(0, 0.96, bodyLength * 0.32);
    cabin.castShadow = true;
    root.add(cabin);

    var windshield = new THREE.Mesh(
      new THREE.PlaneGeometry(bodyWidth * 0.78, 0.45),
      glassMaterial
    );
    windshield.name = definition.id + "_WINDSHIELD";
    windshield.position.set(0, 1.11, bodyLength / 2 + 0.012);
    root.add(windshield);

    var rearPanel = new THREE.Mesh(
      new THREE.BoxGeometry(bodyWidth * 0.72, 0.34, 0.04),
      shared.darkTrimMaterial
    );
    rearPanel.name = definition.id + "_REAR_PANEL";
    rearPanel.position.set(0, 0.75, -bodyLength / 2 - 0.012);
    root.add(rearPanel);

    var ladderGroup = createRoofLadder(definition, ladderMaterial, bodyLength, bodyWidth);
    root.add(ladderGroup);

    var lightbar = createLightbar(definition, bodyWidth * 0.62, definition.lightColor);
    lightbar.group.position.set(0, 1.55, bodyLength * 0.31);
    root.add(lightbar.group);

    addFrontRearLights(root, definition, shared, bodyWidth, bodyLength, 0.53);
    var wheels = createWheels(root, definition, shared, bodyLength, bodyWidth, footprintWidth, 0.275);

    return {
      root: root,
      wheels: wheels.items,
      wheelRadius: wheels.radius,
      lightbarMaterials: lightbar.materials,
      counts: { lightbars: 1, ladders: 1 }
    };
  }

  function createPoliceCarModel(definition, shared) {
    var root = new THREE.Group();
    var bodyLength = Number(definition.bodyLength);
    var bodyWidth = Number(definition.bodyWidth);
    var footprintWidth = Number(definition.footprintWidth);

    var bodyMaterial = new THREE.MeshStandardMaterial({
      color: definition.bodyColor,
      roughness: 0.45,
      metalness: 0.08
    });
    var stripeMaterial = new THREE.MeshStandardMaterial({
      color: definition.stripeColor,
      roughness: 0.42,
      metalness: 0.06
    });
    var glassMaterial = new THREE.MeshStandardMaterial({
      color: definition.glassColor,
      roughness: 0.18,
      transparent: true,
      opacity: 0.84
    });

    var lowerBody = new THREE.Mesh(
      new THREE.BoxGeometry(bodyWidth, 0.48, bodyLength),
      bodyMaterial
    );
    lowerBody.name = definition.id + "_BODY";
    lowerBody.position.y = 0.28;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    root.add(lowerBody);

    var cabinLength = bodyLength * 0.48;
    var cabin = new THREE.Mesh(
      new THREE.BoxGeometry(bodyWidth * 0.82, 0.48, cabinLength),
      bodyMaterial
    );
    cabin.name = definition.id + "_CABIN";
    cabin.position.set(0, 0.65, -bodyLength * 0.03);
    cabin.castShadow = true;
    root.add(cabin);

    [-1, 1].forEach(function (side) {
      var stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.026, 0.17, bodyLength * 0.72),
        stripeMaterial
      );
      stripe.name = definition.id + "_POLICE_STRIPE_" + (side < 0 ? "L" : "R");
      stripe.position.set(side * (bodyWidth / 2 + 0.012), 0.42, 0);
      root.add(stripe);
    });

    var frontWindshield = new THREE.Mesh(
      new THREE.PlaneGeometry(bodyWidth * 0.68, 0.31),
      glassMaterial
    );
    frontWindshield.name = definition.id + "_WINDSHIELD";
    frontWindshield.position.set(0, 0.72, -bodyLength * 0.03 + cabinLength / 2 + 0.012);
    root.add(frontWindshield);

    var rearWindshield = new THREE.Mesh(
      new THREE.PlaneGeometry(bodyWidth * 0.68, 0.29),
      glassMaterial
    );
    rearWindshield.name = definition.id + "_REAR_WINDSHIELD";
    rearWindshield.position.set(0, 0.72, -bodyLength * 0.03 - cabinLength / 2 - 0.012);
    rearWindshield.rotation.y = Math.PI;
    root.add(rearWindshield);

    var lightbar = createLightbar(definition, bodyWidth * 0.58, definition.lightColor);
    lightbar.group.position.set(0, 0.96, -bodyLength * 0.05);
    root.add(lightbar.group);

    addFrontRearLights(root, definition, shared, bodyWidth, bodyLength, 0.36);
    var wheels = createWheels(root, definition, shared, bodyLength, bodyWidth, footprintWidth, 0.215);

    return {
      root: root,
      wheels: wheels.items,
      wheelRadius: wheels.radius,
      lightbarMaterials: lightbar.materials,
      counts: { lightbars: 1, ladders: 0 }
    };
  }

  function createLightbar(definition, width, lightColor) {
    var group = new THREE.Group();
    group.name = definition.id + "_LIGHTBAR";
    var materials = [];

    [-1, 1].forEach(function (side, index) {
      var material = new THREE.MeshStandardMaterial({
        color: lightColor,
        emissive: lightColor,
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0.16,
        roughness: 0.24
      });
      materials.push(material);

      var lens = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.46, 0.12, 0.24),
        material
      );
      lens.name = definition.id + "_LIGHTBAR_LENS_" + index;
      lens.position.x = side * width * 0.245;
      group.add(lens);
    });

    var base = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.055, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x303942, roughness: 0.55 })
    );
    base.position.y = -0.07;
    group.add(base);

    return { group: group, materials: materials };
  }

  function createRoofLadder(definition, material, bodyLength, bodyWidth) {
    var group = new THREE.Group();
    group.name = definition.id + "_ROOF_LADDER";
    group.position.set(0, 1.52, -bodyLength * 0.16);

    var railX = bodyWidth * 0.22;
    [-1, 1].forEach(function (side) {
      var rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, 0.055, bodyLength * 0.52),
        material
      );
      rail.position.x = side * railX;
      group.add(rail);
    });

    for (var i = -3; i <= 3; i += 1) {
      var rung = new THREE.Mesh(
        new THREE.BoxGeometry(railX * 2, 0.045, 0.055),
        material
      );
      rung.position.z = i * bodyLength * 0.072;
      group.add(rung);
    }

    return group;
  }

  function addFrontRearLights(root, definition, shared, bodyWidth, bodyLength, y) {
    [-1, 1].forEach(function (side) {
      var headlight = new THREE.Mesh(
        new THREE.BoxGeometry(bodyWidth * 0.18, 0.12, 0.045),
        shared.headlightMaterial
      );
      headlight.name = definition.id + "_HEADLIGHT_" + (side < 0 ? "L" : "R");
      headlight.position.set(side * bodyWidth * 0.3, y, bodyLength / 2 + 0.012);
      root.add(headlight);

      var tailLight = new THREE.Mesh(
        new THREE.BoxGeometry(bodyWidth * 0.18, 0.12, 0.045),
        shared.tailLightMaterial
      );
      tailLight.name = definition.id + "_TAILLIGHT_" + (side < 0 ? "L" : "R");
      tailLight.position.set(side * bodyWidth * 0.3, y, -bodyLength / 2 - 0.012);
      root.add(tailLight);
    });
  }

  function createWheels(root, definition, shared, bodyLength, bodyWidth, footprintWidth, requestedRadius) {
    var wheelRadius = requestedRadius;
    var availableMargin = Math.max(0.08, footprintWidth - bodyWidth);
    var wheelThickness = Math.min(0.14, Math.max(0.09, availableMargin * 0.56));
    var wheelCenterX = footprintWidth / 2 - wheelThickness / 2;
    var axleZ = bodyLength / 2 - wheelRadius - 0.12;
    var wheels = [];

    [-1, 1].forEach(function (side) {
      [-1, 1].forEach(function (axle) {
        var holder = new THREE.Group();
        holder.name = definition.id + "_WHEEL_" + (side < 0 ? "L" : "R") + (axle < 0 ? "R" : "F");
        holder.position.set(side * wheelCenterX, -0.15, axle * axleZ);

        var tire = new THREE.Mesh(
          new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 18),
          shared.tireMaterial
        );
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        holder.add(tire);

        var rim = new THREE.Mesh(
          new THREE.CylinderGeometry(wheelRadius * 0.46, wheelRadius * 0.46, wheelThickness + 0.008, 14),
          shared.rimMaterial
        );
        rim.rotation.z = Math.PI / 2;
        holder.add(rim);

        root.add(holder);
        wheels.push(holder);
      });
    });

    return { items: wheels, radius: wheelRadius };
  }

  function createManifest(rendered, expected) {
    var passed =
      rendered.accessSurfaces === Number(expected.accessSurfaces || 0) &&
      rendered.responseVehicles === Number(expected.vehicles || 0) &&
      rendered.fireTrucks === Number(expected.fireTrucks || 0) &&
      rendered.policeCars === Number(expected.policeCars || 0) &&
      rendered.wheels === Number(expected.wheels || 0) &&
      rendered.lightbars === Number(expected.lightbars || 0) &&
      rendered.ladders === Number(expected.ladders || 0);

    var lines = [
      "MISSION BOS RESPONSE VEHICLE RENDER MANIFEST",
      "Rendered access surfaces: " + rendered.accessSurfaces + " / " + Number(expected.accessSurfaces || 0),
      "Rendered response vehicles: " + rendered.responseVehicles + " / " + Number(expected.vehicles || 0),
      "Rendered fire trucks: " + rendered.fireTrucks + " / " + Number(expected.fireTrucks || 0),
      "Rendered police cars: " + rendered.policeCars + " / " + Number(expected.policeCars || 0),
      "Rendered wheels: " + rendered.wheels + " / " + Number(expected.wheels || 0),
      "Rendered lightbars: " + rendered.lightbars + " / " + Number(expected.lightbars || 0),
      "Rendered ladders: " + rendered.ladders + " / " + Number(expected.ladders || 0),
      "RENDER MANIFEST: " + (passed ? "PASSED" : "FAILED")
    ];

    return {
      title: lines[0],
      status: passed ? "PASSED" : "FAILED",
      lines: lines,
      renderedCounts: rendered,
      expectedCounts: expected
    };
  }

  function logManifest(manifest) {
    var method = manifest.status === "PASSED" ? "log" : "error";
    console.group(manifest.title);
    manifest.lines.slice(1).forEach(function (line) {
      console[method](line);
    });
    console.groupEnd();
  }

  function logSafety(safety, failed) {
    var method = failed ? "error" : "log";
    console.group(safety.title);
    console[method]("Response / response collisions: " + safety.responseResponseCollisions);
    console[method]("Response / civilian vehicle collisions: " + safety.responseCivilianVehicleCollisions);
    console[method]("Response / pedestrian collisions: " + safety.responsePedestrianCollisions);
    console[method]("STATUS: " + safety.status);
    safety.collisions.forEach(function (collision) {
      console.error("Response vehicle safety conflict", collision);
    });
    console.groupEnd();
  }

  function copySafety(safety) {
    return {
      title: safety.title,
      responseResponseCollisions: safety.responseResponseCollisions,
      responseCivilianVehicleCollisions: safety.responseCivilianVehicleCollisions,
      responsePedestrianCollisions: safety.responsePedestrianCollisions,
      status: safety.status,
      collisions: safety.collisions.slice(),
      halted: safety.halted,
      message: safety.message || ""
    };
  }

  function finiteNumber(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      if (items[i].id === id) return items[i];
    }
    return null;
  }

  function normalizeAngle(angle) {
    var value = Number(angle) || 0;
    while (value > Math.PI) value -= Math.PI * 2;
    while (value < -Math.PI) value += Math.PI * 2;
    return value;
  }

  function shortestAngleDifference(from, to) {
    return normalizeAngle(to - from);
  }

  function lerpAngle(from, to, amount) {
    return normalizeAngle(from + shortestAngleDifference(from, to) * Math.max(0, Math.min(1, amount)));
  }

  window.MissionBosResponseVehicleRenderer = {
    create: create,
    STATES: STATES
  };
})();
