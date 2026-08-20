/* Mission BOS - Build 008R.7
   Validated Traffic Foundation with deterministic yielding

   Production renderer for window.MISSION_BOS_TRAFFIC_PLAN.
   No modules. No fetch. No random movement. No route generation.
*/

(function () {
  "use strict";

  function createFailedResult(message, validation, plan) {
    var expected = (plan && plan.expectedCounts) || {};
    var rendered = { routes: 0, vehicles: 0, cars: 0, vans: 0, wheels: 0 };
    var manifest = createManifest(rendered, expected);

    if (message) console.error(message);
    logManifest(manifest);

    return {
      root: null,
      groups: null,
      vehiclesById: Object.create(null),
      validation: validation || null,
      renderedCounts: rendered,
      update: function () {},
      requestYieldAtDistance: function () { return false; },
      requestMissionRelocation: function () { return false; },
      releaseYield: function () { return false; },
      releaseAllYields: function () { return false; },
      isVehicleYielded: function () { return false; },
      getYieldStatus: function () { return null; },
      getRoutePose: function () { return null; },
      getVehicleCount: function () { return 0; },
      getWheelCount: function () { return 0; },
      getManifest: function () { return manifest; },
      getSafetyStatus: function () {
        return {
          title: "MISSION BOS RUNTIME TRAFFIC SAFETY",
          collisionCount: 0,
          status: "FAILED",
          collisions: [],
          halted: true
        };
      },
      dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};

    try {
      if (typeof THREE === "undefined") {
        return createFailedResult("MISSION BOS TRAFFIC RENDERING ABORTED: THREE is not loaded.", null, options.plan);
      }

      var scene = options.scene;
      var layout = options.layout;
      var propsPlan = options.propsPlan;
      var plan = options.plan;
      var validator = options.validator;

      if (!scene || typeof scene.add !== "function") {
        return createFailedResult("MISSION BOS TRAFFIC RENDERING ABORTED: valid scene missing.", null, plan);
      }
      if (!layout || !propsPlan || !plan) {
        return createFailedResult("MISSION BOS TRAFFIC RENDERING ABORTED: source data missing.", null, plan);
      }
      if (!validator || typeof validator.validate !== "function") {
        return createFailedResult("MISSION BOS TRAFFIC RENDERING ABORTED: validator missing.", null, plan);
      }

      var validation = validator.validate(layout, propsPlan, plan);
      validator.logResult(validation);

      if (validation.status !== "PASSED") {
        return createFailedResult("MISSION BOS TRAFFIC RENDERING ABORTED: validation failed.", validation, plan);
      }

      var root = new THREE.Group();
      root.name = "MissionBosValidatedTraffic";
      root.position.set(0, 0, 0);
      root.rotation.set(0, 0, 0);
      root.scale.set(1, 1, 1);

      var vehicleGroup = new THREE.Group();
      vehicleGroup.name = "ValidatedTraffic_Vehicles";
      root.add(vehicleGroup);

      var routesById = Object.create(null);
      (plan.routes || []).forEach(function (routeDefinition) {
        routesById[routeDefinition.id] = validator.prepareRoute(routeDefinition);
      });

      var vehiclesById = Object.create(null);
      var vehicleStates = [];
      var renderedCounts = {
        routes: Object.keys(routesById).length,
        vehicles: 0,
        cars: 0,
        vans: 0,
        wheels: 0
      };

      var shared = createSharedResources();
      var vehicleY = Number(plan.simulation && plan.simulation.vehicleY);
      if (!isFinite(vehicleY)) vehicleY = 0.42;

      (plan.vehicles || []).forEach(function (definition) {
        var route = routesById[definition.routeId];
        if (!route) return;

        var vehicleObject = createVehicleModel(definition, shared);
        var initialDistance = Number(definition.startDistance || 0);
        var initialPose = validator.sampleRoute(route, initialDistance);

        vehicleObject.root.position.set(initialPose.x, vehicleY, initialPose.z);
        vehicleObject.root.rotation.y = initialPose.angle;
        vehicleObject.root.name = definition.id;
        vehicleObject.root.userData.id = definition.id;
        vehicleObject.root.userData.kind = definition.kind;
        vehicleObject.root.userData.routeId = definition.routeId;
        vehicleObject.root.userData.wheels = vehicleObject.wheels;

        vehicleGroup.add(vehicleObject.root);

        var state = {
          definition: definition,
          route: route,
          distance: initialDistance,
          lastDistance: initialDistance,
          pose: initialPose,
          mesh: vehicleObject.root,
          wheels: vehicleObject.wheels,
          wheelRadius: vehicleObject.wheelRadius,
          wheelRotation: 0,
          yieldControl: {
            requested: false,
            yielded: false,
            holdDistance: null,
            status: "NOT_REQUESTED"
          },
          missionRelocation: null
        };

        vehicleStates.push(state);
        vehiclesById[definition.id] = state;
        renderedCounts.vehicles += 1;
        renderedCounts.wheels += vehicleObject.wheels.length;
        if (definition.kind === "car") renderedCounts.cars += 1;
        if (definition.kind === "van") renderedCounts.vans += 1;
      });

      scene.add(root);

      var manifest = createManifest(renderedCounts, plan.expectedCounts || {});
      logManifest(manifest);

      var safety = {
        title: "MISSION BOS RUNTIME TRAFFIC SAFETY",
        collisionCount: 0,
        status: "PASSED",
        collisions: [],
        halted: false,
        elapsedSinceCheck: 0
      };

      var safetyMargin = Number(plan.simulation && plan.simulation.collisionSafetyMargin);
      if (!isFinite(safetyMargin)) safetyMargin = 0.05;

      function evaluateSafety(logPassed) {
        var collisions = [];

        for (var i = 0; i < vehicleStates.length; i += 1) {
          for (var j = i + 1; j < vehicleStates.length; j += 1) {
            var first = vehicleStates[i];
            var second = vehicleStates[j];
            var firstPolygon = validator.rectangleCorners(
              first.pose,
              Number(first.definition.footprintLength),
              Number(first.definition.footprintWidth),
              safetyMargin
            );
            var secondPolygon = validator.rectangleCorners(
              second.pose,
              Number(second.definition.footprintLength),
              Number(second.definition.footprintWidth),
              safetyMargin
            );

            if (validator.polygonsOverlapSAT(firstPolygon, secondPolygon)) {
              collisions.push({
                vehicleA: first.definition.id,
                vehicleB: second.definition.id
              });
            }
          }
        }

        safety.collisionCount = collisions.length;
        safety.collisions = collisions;
        safety.status = collisions.length === 0 ? "PASSED" : "FAILED";

        if (collisions.length > 0) {
          safety.halted = true;
          logSafety(safety, true);
        } else if (logPassed) {
          logSafety(safety, false);
        }

        return safety;
      }

      function positiveModulo(value, divisor) {
        if (!isFinite(divisor) || divisor <= 0) return 0;
        return ((value % divisor) + divisor) % divisor;
      }

      function getForwardDistanceToHold(state) {
        if (!state || !state.yieldControl || !state.yieldControl.requested) return null;
        var routeLength = Number(state.route && state.route.length);
        if (!isFinite(routeLength) || routeLength <= 0) return null;
        var currentDistance = positiveModulo(state.distance, routeLength);
        return positiveModulo(state.yieldControl.holdDistance - currentDistance, routeLength);
      }

      function cleanRelocationPose(pose) {
        if (!pose || !isFinite(Number(pose.x)) || !isFinite(Number(pose.z)) || !isFinite(Number(pose.angle))) return null;
        return { x: Number(pose.x), z: Number(pose.z), angle: Number(pose.angle) };
      }

      function setVehiclePose(state, pose) {
        state.pose = { x: pose.x, z: pose.z, angle: pose.angle };
        state.mesh.position.x = pose.x;
        state.mesh.position.z = pose.z;
        state.mesh.rotation.y = pose.angle;
      }

      function routePoseForState(state) {
        return validator.sampleRoute(state.route, positiveModulo(state.distance, state.route.length));
      }

      function requestMissionRelocation(vehicleId, trajectory, relocationOptions) {
        var state = vehiclesById[vehicleId];
        if (!state || !Array.isArray(trajectory) || !trajectory.length || (state.missionRelocation && state.missionRelocation.active)) return false;
        var clean = trajectory.map(cleanRelocationPose).filter(Boolean);
        if (!clean.length) return false;
        relocationOptions = relocationOptions || {};
        var currentRoutePose = routePoseForState(state);
        var immediate = relocationOptions.preSceneRelocation === true;
        state.yieldControl.requested = true;
        state.yieldControl.yielded = false;
        state.yieldControl.holdDistance = positiveModulo(state.distance, state.route.length);
        state.yieldControl.status = immediate ? "YIELDED" : "ESCAPING";
        state.missionRelocation = {
          active: true,
          phase: immediate ? "HOLDING" : "ESCAPING",
          trajectory: clean,
          nextIndex: 0,
          routePose: cleanRelocationPose(currentRoutePose),
          speed: Math.max(0.5, Number(relocationOptions.speed) || 3.6),
          rejoinSpeed: Math.max(0.5, Number(relocationOptions.rejoinSpeed) || 3.6),
          preSceneRelocation: immediate
        };
        if (immediate) {
          setVehiclePose(state, clean[clean.length - 1]);
          state.missionRelocation.nextIndex = clean.length;
          state.yieldControl.yielded = true;
        }
        return true;
      }

      function advanceMissionRelocation(state, clampedDelta) {
        var control = state.missionRelocation;
        if (!control || !control.active || control.phase === "HOLDING") return 0;
        var remainingMove = Math.max(0, (control.phase === "REJOINING" ? control.rejoinSpeed : control.speed) * clampedDelta);
        var traveled = 0;
        while (remainingMove > 1e-9 && control.nextIndex < control.trajectory.length) {
          var target = control.trajectory[control.nextIndex];
          var dx = target.x - state.pose.x;
          var dz = target.z - state.pose.z;
          var distance = Math.sqrt(dx * dx + dz * dz);
          if (distance <= 1e-7) {
            setVehiclePose(state, target);
            control.nextIndex += 1;
            continue;
          }
          var step = Math.min(distance, remainingMove);
          var ratio = step / distance;
          setVehiclePose(state, {
            x: state.pose.x + dx * ratio,
            z: state.pose.z + dz * ratio,
            angle: target.angle
          });
          traveled += step;
          remainingMove -= step;
          if (step + 1e-9 >= distance) {
            setVehiclePose(state, target);
            control.nextIndex += 1;
          }
        }
        if (control.nextIndex >= control.trajectory.length) {
          if (control.phase === "ESCAPING") {
            control.phase = "HOLDING";
            state.yieldControl.yielded = true;
            state.yieldControl.status = "YIELDED";
          } else if (control.phase === "REJOINING") {
            setVehiclePose(state, control.routePose);
            state.missionRelocation = null;
            state.yieldControl.requested = false;
            state.yieldControl.yielded = false;
            state.yieldControl.holdDistance = null;
            state.yieldControl.status = "NOT_REQUESTED";
          }
        }
        return traveled;
      }

      function requestYieldAtDistance(vehicleId, holdDistance) {
        var state = vehiclesById[vehicleId];
        if (!state) {
          console.error("MISSION BOS TRAFFIC YIELD: unknown vehicle ID " + vehicleId + ".");
          return false;
        }
        var normalizedHold = Number(holdDistance);
        if (!isFinite(normalizedHold) || normalizedHold < 0 || normalizedHold >= state.route.length) {
          console.error("MISSION BOS TRAFFIC YIELD: invalid hold distance for " + vehicleId + ".");
          return false;
        }
        state.yieldControl.requested = true;
        state.yieldControl.yielded = false;
        state.yieldControl.holdDistance = normalizedHold;
        state.yieldControl.status = "REQUESTED";
        return true;
      }

      function releaseYield(vehicleId) {
        var state = vehiclesById[vehicleId];
        if (!state) {
          console.error("MISSION BOS TRAFFIC YIELD: unknown vehicle ID " + vehicleId + ".");
          return false;
        }
        if (state.missionRelocation && state.missionRelocation.active) {
          if (state.missionRelocation.phase === "REJOINING") return true;
          state.missionRelocation.phase = "REJOINING";
          state.missionRelocation.trajectory = [cleanRelocationPose(state.missionRelocation.routePose)];
          state.missionRelocation.nextIndex = 0;
          state.yieldControl.requested = true;
          state.yieldControl.yielded = false;
          state.yieldControl.status = "REJOINING";
          return true;
        }
        state.yieldControl.requested = false;
        state.yieldControl.yielded = false;
        state.yieldControl.holdDistance = null;
        state.yieldControl.status = "NOT_REQUESTED";
        return true;
      }

      function releaseAllYields() {
        vehicleStates.forEach(function (state) {
          if (state.missionRelocation && state.missionRelocation.active && state.missionRelocation.routePose) {
            setVehiclePose(state, state.missionRelocation.routePose);
          }
          state.missionRelocation = null;
          state.yieldControl.requested = false;
          state.yieldControl.yielded = false;
          state.yieldControl.holdDistance = null;
          state.yieldControl.status = "NOT_REQUESTED";
        });
        return true;
      }

      function isVehicleYielded(vehicleId) {
        var state = vehiclesById[vehicleId];
        return Boolean(state && state.yieldControl && state.yieldControl.yielded);
      }

      function getYieldStatus(vehicleId) {
        var state = vehiclesById[vehicleId];
        if (!state) return null;
        var remainingDistance = state.yieldControl.requested
          ? getForwardDistanceToHold(state)
          : null;
        return {
          vehicleId: vehicleId,
          status: state.yieldControl.status,
          requested: state.yieldControl.requested,
          yielded: state.yieldControl.yielded,
          holdDistance: state.yieldControl.holdDistance,
          currentDistance: positiveModulo(state.distance, state.route.length),
          remainingDistance: remainingDistance,
          missionRelocated: !!(state.missionRelocation && state.missionRelocation.active && state.missionRelocation.phase === "HOLDING"),
          relocationPhase: state.missionRelocation && state.missionRelocation.active ? state.missionRelocation.phase : "NONE"
        };
      }

      function update(delta, elapsed, cityState) {
        if (safety.halted || manifest.status !== "PASSED") return;

        var maxDelta = Number(plan.simulation && plan.simulation.maxDeltaSeconds);
        if (!isFinite(maxDelta) || maxDelta <= 0) maxDelta = 0.05;
        var clampedDelta = Math.max(0, Math.min(Number(delta) || 0, maxDelta));

        var factors = (plan.simulation && plan.simulation.trafficStateSpeedFactors) || {};
        var speedFactor = Number(factors[cityState]);
        if (!isFinite(speedFactor)) speedFactor = 1;

        vehicleStates.forEach(function (state) {
          if (state.missionRelocation && state.missionRelocation.active) {
            var relocationDistance = advanceMissionRelocation(state, clampedDelta);
            if (relocationDistance > 0) {
              state.wheelRotation -= relocationDistance / state.wheelRadius;
              state.wheels.forEach(function (wheelHolder) { wheelHolder.rotation.x = state.wheelRotation; });
            }
            return;
          }
          var plannedDistance = Number(state.definition.speed) * speedFactor * clampedDelta;
          var traveledDistance = plannedDistance;
          var yieldControl = state.yieldControl;
          var reachedHoldPoint = false;

          if (yieldControl.requested) {
            if (yieldControl.yielded) {
              traveledDistance = 0;
              yieldControl.status = "YIELDED";
            } else {
              var remainingDistance = getForwardDistanceToHold(state);
              if (remainingDistance === null) {
                yieldControl.status = "FAILED";
                traveledDistance = 0;
              } else if (remainingDistance <= 1e-9 || plannedDistance >= remainingDistance - 1e-9) {
                traveledDistance = Math.max(0, remainingDistance);
                reachedHoldPoint = true;
              } else {
                yieldControl.status = "APPROACHING";
              }
            }
          }

          state.lastDistance = state.distance;

          if (reachedHoldPoint) {
            var routeLength = state.route.length;
            var normalizedCurrent = positiveModulo(state.distance, routeLength);
            var cycleBase = state.distance - normalizedCurrent;
            if (yieldControl.holdDistance < normalizedCurrent - 1e-9) cycleBase += routeLength;
            state.distance = cycleBase + yieldControl.holdDistance;
            yieldControl.yielded = true;
            yieldControl.status = "YIELDED";
            state.pose = validator.sampleRoute(state.route, yieldControl.holdDistance);
          } else if (traveledDistance > 0) {
            state.distance += traveledDistance;
            state.pose = validator.sampleRoute(state.route, state.distance);
          }

          state.mesh.position.x = state.pose.x;
          state.mesh.position.z = state.pose.z;
          state.mesh.rotation.y = state.pose.angle;

          if (traveledDistance > 0) {
            state.wheelRotation -= traveledDistance / state.wheelRadius;
            state.wheels.forEach(function (wheelHolder) {
              wheelHolder.rotation.x = state.wheelRotation;
            });
          }
        });

        safety.elapsedSinceCheck += clampedDelta;
        if (safety.elapsedSinceCheck >= 0.5) {
          safety.elapsedSinceCheck = 0;
          evaluateSafety(false);
        }
      }

      function dispose() {
        if (root.parent) root.parent.remove(root);
        root.traverse(function (object) {
          if (object.geometry && typeof object.geometry.dispose === "function") {
            object.geometry.dispose();
          }
          if (object.material) {
            var materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach(function (material) {
              if (material && typeof material.dispose === "function") material.dispose();
            });
          }
        });
        vehicleStates.length = 0;
      }

      evaluateSafety(true);

      return {
        root: root,
        groups: { vehicles: vehicleGroup },
        vehiclesById: vehiclesById,
        validation: validation,
        renderedCounts: renderedCounts,
        update: update,
        requestYieldAtDistance: requestYieldAtDistance,
        requestMissionRelocation: requestMissionRelocation,
        releaseYield: releaseYield,
        releaseAllYields: releaseAllYields,
        isVehicleYielded: isVehicleYielded,
        getYieldStatus: getYieldStatus,
        getRoutePose: function (vehicleId, distance) {
          var state = vehiclesById[vehicleId];
          return state ? cleanRelocationPose(validator.sampleRoute(state.route, distance)) : null;
        },
        getVehicleCount: function () { return vehicleStates.length; },
        getWheelCount: function () { return renderedCounts.wheels; },
        getManifest: function () { return manifest; },
        getSafetyStatus: function () {
          return {
            title: safety.title,
            collisionCount: safety.collisionCount,
            status: safety.status,
            collisions: safety.collisions.slice(),
            halted: safety.halted
          };
        },
        dispose: dispose
      };
    } catch (error) {
      console.error("MISSION BOS TRAFFIC RENDERING ABORTED:", error);
      return createFailedResult("Traffic renderer returned a safe failed state.", null, options.plan);
    }
  }

  function createSharedResources() {
    return {
      tireMaterial: new THREE.MeshStandardMaterial({ color: 0x1f2328, roughness: 0.88 }),
      rimMaterial: new THREE.MeshStandardMaterial({ color: 0xaeb8c2, roughness: 0.45, metalness: 0.45 }),
      glassMaterial: new THREE.MeshStandardMaterial({
        color: 0x9fc8df,
        roughness: 0.22,
        metalness: 0.08,
        transparent: true,
        opacity: 0.82
      }),
      headlightMaterial: new THREE.MeshStandardMaterial({
        color: 0xfff5c4,
        emissive: 0xffd66d,
        emissiveIntensity: 1.0,
        roughness: 0.25
      }),
      tailLightMaterial: new THREE.MeshStandardMaterial({
        color: 0xc92e35,
        emissive: 0x7d1015,
        emissiveIntensity: 0.8,
        roughness: 0.3
      })
    };
  }

  function createVehicleModel(definition, shared) {
    var root = new THREE.Group();
    var bodyLength = Number(definition.bodyLength);
    var bodyWidth = Number(definition.bodyWidth);
    var footprintWidth = Number(definition.footprintWidth);
    var isVan = definition.kind === "van";
    var bodyColor = new THREE.Color(definition.color || "#808080");
    var bodyMaterial = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.48,
      metalness: 0.08
    });
    var trimMaterial = new THREE.MeshStandardMaterial({
      color: bodyColor.clone().multiplyScalar(0.82),
      roughness: 0.52,
      metalness: 0.06
    });

    var lowerHeight = isVan ? 0.5 : 0.43;
    var lowerBody = new THREE.Mesh(
      new THREE.BoxGeometry(bodyWidth, lowerHeight, bodyLength),
      bodyMaterial
    );
    lowerBody.name = definition.id + "_BODY";
    lowerBody.position.y = lowerHeight / 2 + 0.02;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    root.add(lowerBody);

    if (isVan) {
      var vanBoxLength = bodyLength * 0.61;
      var vanBox = new THREE.Mesh(
        new THREE.BoxGeometry(bodyWidth * 0.94, 0.88, vanBoxLength),
        trimMaterial
      );
      vanBox.name = definition.id + "_CARGO_BOX";
      vanBox.position.set(0, 0.83, -bodyLength * 0.13);
      vanBox.castShadow = true;
      root.add(vanBox);

      var vanCabin = new THREE.Mesh(
        new THREE.BoxGeometry(bodyWidth * 0.92, 0.65, bodyLength * 0.31),
        bodyMaterial
      );
      vanCabin.name = definition.id + "_CABIN";
      vanCabin.position.set(0, 0.7, bodyLength * 0.31);
      vanCabin.castShadow = true;
      root.add(vanCabin);

      addWindows(root, definition, shared, bodyWidth * 0.82, 0.46, bodyLength * 0.465, -bodyLength * 0.435, 0.76);
    } else {
      var cabinLength = bodyLength * 0.47;
      var cabin = new THREE.Mesh(
        new THREE.BoxGeometry(bodyWidth * 0.82, 0.43, cabinLength),
        trimMaterial
      );
      cabin.name = definition.id + "_CABIN";
      cabin.position.set(0, 0.58, -bodyLength * 0.04);
      cabin.castShadow = true;
      root.add(cabin);

      addWindows(
        root,
        definition,
        shared,
        bodyWidth * 0.7,
        0.31,
        -bodyLength * 0.04 + cabinLength / 2 + 0.012,
        -bodyLength * 0.04 - cabinLength / 2 - 0.012,
        0.61
      );
    }

    addVehicleLights(root, definition, shared, bodyWidth, bodyLength, lowerHeight);

    var wheelRadius = Math.min(0.22, Math.max(0.19, bodyLength * 0.085));
    var availableSideMargin = Math.max(0.08, footprintWidth - bodyWidth);
    var wheelThickness = Math.min(0.12, availableSideMargin);
    var wheelCenterX = footprintWidth / 2 - wheelThickness / 2;
    var axleZ = bodyLength / 2 - wheelRadius - 0.1;
    var wheels = [];

    [-1, 1].forEach(function (side) {
      [-1, 1].forEach(function (axle) {
        var holder = new THREE.Group();
        holder.name = definition.id + "_WHEEL_" + (side < 0 ? "L" : "R") + (axle < 0 ? "R" : "F");
        holder.position.set(side * wheelCenterX, -0.2, axle * axleZ);

        var tire = new THREE.Mesh(
          new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 16),
          shared.tireMaterial
        );
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        holder.add(tire);

        var rim = new THREE.Mesh(
          new THREE.CylinderGeometry(wheelRadius * 0.46, wheelRadius * 0.46, wheelThickness + 0.006, 12),
          shared.rimMaterial
        );
        rim.rotation.z = Math.PI / 2;
        holder.add(rim);

        root.add(holder);
        wheels.push(holder);
      });
    });

    return {
      root: root,
      wheels: wheels,
      wheelRadius: wheelRadius
    };
  }

  function addWindows(root, definition, shared, width, height, frontZ, rearZ, y) {
    var front = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      shared.glassMaterial
    );
    front.name = definition.id + "_FRONT_WINDSHIELD";
    front.position.set(0, y, frontZ);
    root.add(front);

    var rear = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      shared.glassMaterial
    );
    rear.name = definition.id + "_REAR_WINDSHIELD";
    rear.position.set(0, y, rearZ);
    rear.rotation.y = Math.PI;
    root.add(rear);
  }

  function addVehicleLights(root, definition, shared, bodyWidth, bodyLength, bodyHeight) {
    [-1, 1].forEach(function (side) {
      var headlight = new THREE.Mesh(
        new THREE.BoxGeometry(bodyWidth * 0.18, 0.12, 0.045),
        shared.headlightMaterial
      );
      headlight.name = definition.id + "_HEADLIGHT_" + (side < 0 ? "L" : "R");
      headlight.position.set(side * bodyWidth * 0.3, bodyHeight * 0.58, bodyLength / 2 - 0.018);
      root.add(headlight);

      var tailLight = new THREE.Mesh(
        new THREE.BoxGeometry(bodyWidth * 0.18, 0.12, 0.045),
        shared.tailLightMaterial
      );
      tailLight.name = definition.id + "_TAILLIGHT_" + (side < 0 ? "L" : "R");
      tailLight.position.set(side * bodyWidth * 0.3, bodyHeight * 0.58, -bodyLength / 2 + 0.018);
      root.add(tailLight);
    });
  }

  function createManifest(rendered, expected) {
    var passed =
      rendered.routes === Number(expected.routes || 0) &&
      rendered.vehicles === Number(expected.vehicles || 0) &&
      rendered.cars === Number(expected.cars || 0) &&
      rendered.vans === Number(expected.vans || 0) &&
      rendered.wheels === Number(expected.wheels || 0);

    var lines = [
      "MISSION BOS TRAFFIC RENDER MANIFEST",
      "Rendered routes: " + rendered.routes + " / " + Number(expected.routes || 0),
      "Rendered vehicles: " + rendered.vehicles + " / " + Number(expected.vehicles || 0),
      "Rendered cars: " + rendered.cars + " / " + Number(expected.cars || 0),
      "Rendered vans: " + rendered.vans + " / " + Number(expected.vans || 0),
      "Rendered wheels: " + rendered.wheels + " / " + Number(expected.wheels || 0),
      "STATUS: " + (passed ? "PASSED" : "FAILED")
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
    console[method]("Collision count: " + safety.collisionCount);
    console[method]("STATUS: " + safety.status);
    if (safety.collisions.length > 0) {
      safety.collisions.forEach(function (collision) {
        console.error("Collision: " + collision.vehicleA + " <-> " + collision.vehicleB);
      });
    }
    console.groupEnd();
  }

  window.MissionBosTrafficRenderer = {
    create: create
  };
})();
