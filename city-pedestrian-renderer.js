/* Mission BOS - Build 008R.5
   Validated Pedestrian Foundation - deterministic production renderer.

   No modules. No fetch. No random placement.
   All routes, dimensions, colors and movement parameters are read from
   window.MISSION_BOS_PEDESTRIAN_PLAN.
*/

(function () {
  "use strict";

  function createFailedResult(message, validation, plan) {
    var root = typeof THREE !== "undefined" ? new THREE.Group() : null;
    var expected = plan && plan.expectedCounts ? plan.expectedCounts : {};
    var manifest = createManifest({
      routes: 0,
      pedestrians: 0,
      heads: 0,
      bodies: 0,
      arms: 0,
      legs: 0
    }, expected);

    manifest.status = "FAILED";
    manifest.lines[manifest.lines.length - 1] = "RENDER MANIFEST: FAILED";
    logManifest(manifest);

    var safety = {
      title: "MISSION BOS RUNTIME PEDESTRIAN SAFETY",
      pedestrianCollisionCount: 0,
      status: "FAILED",
      collisions: [],
      halted: true,
      message: message
    };

    console.error("MISSION BOS PEDESTRIAN RENDERING ABORTED: " + message);

    return {
      root: root,
      groups: { pedestrians: root },
      personsById: Object.create(null),
      validation: validation || null,
      renderedCounts: manifest.renderedCounts,
      update: function () {},
      getPedestrianCount: function () { return 0; },
      getManifest: function () { return manifest; },
      getSafetyStatus: function () { return copySafetyStatus(safety); },
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
      if (!options.scene || typeof options.scene.add !== "function") {
        return createFailedResult("A valid Three.js scene is required.", null, options.plan);
      }
      if (!options.layout || !options.propsPlan || !options.trafficPlan || !options.plan) {
        return createFailedResult("Layout, props, traffic and pedestrian plans are required.", null, options.plan);
      }
      if (
        !options.validator ||
        typeof options.validator.validate !== "function" ||
        typeof options.validator.logResult !== "function" ||
        typeof options.validator.prepareOpenRoute !== "function" ||
        typeof options.validator.samplePingPong !== "function" ||
        typeof options.validator.circleCircleOverlap !== "function"
      ) {
        return createFailedResult("MissionBosPedestrianValidator API is incomplete.", null, options.plan);
      }

      var validator = options.validator;
      var plan = options.plan;
      var validation = validator.validate(
        options.layout,
        options.propsPlan,
        options.trafficPlan,
        plan
      );
      validator.logResult(validation);

      if (!validation || validation.status !== "PASSED") {
        return createFailedResult("Pedestrian validation returned FAILED.", validation, plan);
      }

      var root = new THREE.Group();
      root.name = "MISSION_BOS_VALIDATED_PEDESTRIANS";
      root.position.set(0, 0, 0);
      root.rotation.set(0, 0, 0);
      root.scale.set(1, 1, 1);

      var pedestrianGroup = new THREE.Group();
      pedestrianGroup.name = "VALIDATED_PEDESTRIAN_MODELS";
      root.add(pedestrianGroup);
      options.scene.add(root);

      var routesById = Object.create(null);
      (plan.routes || []).forEach(function (routeDefinition) {
        routesById[routeDefinition.id] = validator.prepareOpenRoute(routeDefinition);
      });

      var shared = createSharedResources();
      var personsById = Object.create(null);
      var states = [];
      var renderedCounts = {
        routes: Object.keys(routesById).length,
        pedestrians: 0,
        heads: 0,
        bodies: 0,
        arms: 0,
        legs: 0
      };

      var pedestrianY = Number(plan.simulation && plan.simulation.pedestrianY) || 0;
      var gaitFrequencyScale = Number(plan.simulation && plan.simulation.gaitFrequencyScale) || 6.4;
      var turnSmoothing = Number(plan.simulation && plan.simulation.turnSmoothing) || 8.0;
      var maxDeltaSeconds = Number(plan.simulation && plan.simulation.maxDeltaSeconds) || 0.05;
      var safetyInterval = Number(plan.simulation && plan.simulation.runtimeSafetyCheckInterval) || 0.25;
      var collisionMargin = Number(plan.simulation && plan.simulation.collisionSafetyMargin) || 0;

      (plan.pedestrians || []).forEach(function (definition, index) {
        var route = routesById[definition.routeId];
        if (!route) return;

        var model = createPersonModel(definition, shared, index);
        model.root.name = definition.id;
        pedestrianGroup.add(model.root);

        var travelDistance = Number(definition.startDistance);
        var initialDirection = Number(definition.initialDirection) === -1 ? -1 : 1;
        var initialPose = validator.samplePingPong(route, travelDistance, initialDirection);

        model.root.position.set(initialPose.x, pedestrianY, initialPose.z);
        model.root.rotation.y = normalizeAngle(initialPose.angle);

        var state = {
          definition: definition,
          route: route,
          root: model.root,
          motionRoot: model.motionRoot,
          leftArm: model.leftArm,
          rightArm: model.rightArm,
          leftLeg: model.leftLeg,
          rightLeg: model.rightLeg,
          travelDistance: travelDistance,
          initialDirection: initialDirection,
          gaitDistance: 0,
          gaitOffset: index * 0.91,
          currentAngle: normalizeAngle(initialPose.angle),
          pose: initialPose
        };

        states.push(state);
        personsById[definition.id] = model.root;
        renderedCounts.pedestrians += 1;
        renderedCounts.heads += model.counts.heads;
        renderedCounts.bodies += model.counts.bodies;
        renderedCounts.arms += model.counts.arms;
        renderedCounts.legs += model.counts.legs;
      });

      var manifest = createManifest(renderedCounts, plan.expectedCounts || {});
      logManifest(manifest);

      var movementEnabled = manifest.status === "PASSED";
      var safety = {
        title: "MISSION BOS RUNTIME PEDESTRIAN SAFETY",
        pedestrianCollisionCount: 0,
        status: movementEnabled ? "PASSED" : "FAILED",
        collisions: [],
        halted: !movementEnabled,
        elapsedSinceCheck: 0,
        loggedFailure: false
      };

      function stopWalkingAnimation() {
        states.forEach(function (state) {
          state.leftArm.rotation.x = 0;
          state.rightArm.rotation.x = 0;
          state.leftLeg.rotation.x = 0;
          state.rightLeg.rotation.x = 0;
          state.motionRoot.position.y = 0;
        });
      }

      function evaluateSafety(forceLog) {
        if (safety.halted && safety.status === "FAILED" && safety.collisions.length > 0) {
          return;
        }

        var collisions = [];
        for (var firstIndex = 0; firstIndex < states.length; firstIndex += 1) {
          for (var secondIndex = firstIndex + 1; secondIndex < states.length; secondIndex += 1) {
            var first = states[firstIndex];
            var second = states[secondIndex];
            var firstPosition = { x: first.root.position.x, z: first.root.position.z };
            var secondPosition = { x: second.root.position.x, z: second.root.position.z };

            if (validator.circleCircleOverlap(
              firstPosition,
              Number(first.definition.personalSpaceRadius),
              secondPosition,
              Number(second.definition.personalSpaceRadius),
              collisionMargin
            )) {
              collisions.push({
                pedestrianA: first.definition.id,
                pedestrianB: second.definition.id
              });
            }
          }
        }

        safety.collisions = collisions;
        safety.pedestrianCollisionCount = collisions.length;
        safety.status = collisions.length === 0 ? "PASSED" : "FAILED";

        if (collisions.length > 0) {
          safety.halted = true;
          movementEnabled = false;
          stopWalkingAnimation();

          if (!safety.loggedFailure) {
            logSafety(safety, true);
            safety.loggedFailure = true;
          }
        } else if (forceLog) {
          logSafety(safety, false);
        }
      }

      function update(delta) {
        if (!movementEnabled || safety.halted) return;

        var clampedDelta = Math.max(0, Math.min(Number(delta) || 0, maxDeltaSeconds));
        if (clampedDelta <= 0) return;

        states.forEach(function (state) {
          var speed = Number(state.definition.speed);
          var signedDistance = state.initialDirection * speed * clampedDelta;
          state.travelDistance += signedDistance;
          state.gaitDistance += Math.abs(signedDistance);

          var sample = validator.samplePingPong(
            state.route,
            state.travelDistance,
            state.initialDirection
          );

          state.pose = sample;
          state.root.position.x = sample.x;
          state.root.position.z = sample.z;

          var targetAngle = normalizeAngle(sample.angle);
          var blend = 1 - Math.exp(-turnSmoothing * clampedDelta);
          state.currentAngle = lerpAngle(state.currentAngle, targetAngle, blend);
          state.root.rotation.y = state.currentAngle;

          var gaitPhase = state.gaitDistance * gaitFrequencyScale + state.gaitOffset;
          var swing = Math.sin(gaitPhase) * 0.42;
          state.leftLeg.rotation.x = swing;
          state.rightLeg.rotation.x = -swing;
          state.rightArm.rotation.x = swing * 0.78;
          state.leftArm.rotation.x = -swing * 0.78;
          state.motionRoot.position.y = Math.abs(Math.sin(gaitPhase)) * 0.024;
          state.motionRoot.rotation.z = Math.sin(gaitPhase * 0.5) * 0.012;
        });

        safety.elapsedSinceCheck += clampedDelta;
        if (safety.elapsedSinceCheck >= safetyInterval) {
          safety.elapsedSinceCheck = 0;
          evaluateSafety(false);
        }
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
        states.length = 0;
      }

      evaluateSafety(true);

      return {
        root: root,
        groups: { pedestrians: pedestrianGroup },
        personsById: personsById,
        validation: validation,
        renderedCounts: renderedCounts,
        update: update,
        getPedestrianCount: function () { return states.length; },
        getManifest: function () { return manifest; },
        getSafetyStatus: function () { return copySafetyStatus(safety); },
        dispose: dispose
      };
    } catch (error) {
      console.error("MISSION BOS PEDESTRIAN RENDERING ABORTED:", error);
      return createFailedResult("Pedestrian renderer returned a safe failed state.", null, options.plan);
    }
  }

  function createSharedResources() {
    return {
      headGeometry: new THREE.SphereGeometry(0.16, 12, 10),
      hairGeometry: new THREE.SphereGeometry(0.165, 12, 8),
      bodyGeometry: new THREE.BoxGeometry(0.36, 0.64, 0.22),
      armGeometry: new THREE.BoxGeometry(0.09, 0.50, 0.10),
      legGeometry: new THREE.BoxGeometry(0.11, 0.58, 0.13)
    };
  }

  function createPersonModel(definition, shared, index) {
    var root = new THREE.Group();
    var motionRoot = new THREE.Group();
    root.add(motionRoot);
    motionRoot.scale.setScalar(Number(definition.heightScale));

    var skinMaterial = new THREE.MeshStandardMaterial({
      color: definition.skinColor,
      roughness: 0.72
    });
    var bodyMaterial = new THREE.MeshStandardMaterial({
      color: definition.bodyColor,
      roughness: 0.66
    });
    var trouserMaterial = new THREE.MeshStandardMaterial({
      color: definition.trouserColor,
      roughness: 0.74
    });
    var hairMaterial = new THREE.MeshStandardMaterial({
      color: definition.hairColor,
      roughness: 0.78
    });

    var body = new THREE.Mesh(shared.bodyGeometry, bodyMaterial);
    body.name = definition.id + "_BODY";
    body.position.set(0, 0.95, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    motionRoot.add(body);

    var head = new THREE.Mesh(shared.headGeometry, skinMaterial);
    head.name = definition.id + "_HEAD";
    head.position.set(0, 1.47, 0);
    head.castShadow = true;
    motionRoot.add(head);

    var hair = new THREE.Mesh(shared.hairGeometry, hairMaterial);
    hair.name = definition.id + "_HAIR";
    hair.position.set(0, 1.555, -0.008);
    hair.scale.set(1.0, 0.56, 1.0);
    hair.castShadow = true;
    motionRoot.add(hair);

    var leftArm = createLimb(
      definition.id + "_ARM_LEFT",
      shared.armGeometry,
      bodyMaterial,
      -0.205,
      1.22,
      0,
      -0.245
    );
    var rightArm = createLimb(
      definition.id + "_ARM_RIGHT",
      shared.armGeometry,
      bodyMaterial,
      0.205,
      1.22,
      0,
      -0.245
    );
    var leftLeg = createLimb(
      definition.id + "_LEG_LEFT",
      shared.legGeometry,
      trouserMaterial,
      -0.095,
      0.58,
      0,
      -0.29
    );
    var rightLeg = createLimb(
      definition.id + "_LEG_RIGHT",
      shared.legGeometry,
      trouserMaterial,
      0.095,
      0.58,
      0,
      -0.29
    );

    motionRoot.add(leftArm, rightArm, leftLeg, rightLeg);
    root.userData.pedestrianId = definition.id;
    root.userData.routeId = definition.routeId;
    root.userData.deterministicIndex = index;

    return {
      root: root,
      motionRoot: motionRoot,
      leftArm: leftArm,
      rightArm: rightArm,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      counts: { heads: 1, bodies: 1, arms: 2, legs: 2 }
    };
  }

  function createLimb(name, geometry, material, x, y, z, meshCenterY) {
    var pivot = new THREE.Group();
    pivot.name = name + "_PIVOT";
    pivot.position.set(x, y, z);

    var mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.y = meshCenterY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    pivot.add(mesh);

    return pivot;
  }

  function createManifest(rendered, expected) {
    expected = expected || {};
    var passed =
      rendered.routes === Number(expected.routes || 0) &&
      rendered.pedestrians === Number(expected.pedestrians || 0) &&
      rendered.heads === Number(expected.heads || 0) &&
      rendered.bodies === Number(expected.bodies || 0) &&
      rendered.arms === Number(expected.arms || 0) &&
      rendered.legs === Number(expected.legs || 0);

    var lines = [
      "MISSION BOS PEDESTRIAN RENDER MANIFEST",
      "Rendered routes: " + rendered.routes + " / " + Number(expected.routes || 0),
      "Rendered pedestrians: " + rendered.pedestrians + " / " + Number(expected.pedestrians || 0),
      "Rendered heads: " + rendered.heads + " / " + Number(expected.heads || 0),
      "Rendered bodies: " + rendered.bodies + " / " + Number(expected.bodies || 0),
      "Rendered arms: " + rendered.arms + " / " + Number(expected.arms || 0),
      "Rendered legs: " + rendered.legs + " / " + Number(expected.legs || 0),
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
    console[method]("Pedestrian collision count: " + safety.pedestrianCollisionCount);
    console[method]("STATUS: " + safety.status);
    if (safety.collisions.length > 0) {
      safety.collisions.forEach(function (collision) {
        console.error(
          "Pedestrian collision: " + collision.pedestrianA + " <-> " + collision.pedestrianB
        );
      });
    }
    console.groupEnd();
  }

  function copySafetyStatus(safety) {
    return {
      title: safety.title,
      pedestrianCollisionCount: safety.pedestrianCollisionCount,
      status: safety.status,
      collisions: (safety.collisions || []).slice(),
      halted: !!safety.halted,
      message: safety.message || ""
    };
  }

  function normalizeAngle(angle) {
    var twoPi = Math.PI * 2;
    return ((Number(angle) + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
  }

  function lerpAngle(current, target, amount) {
    var difference = normalizeAngle(target - current);
    return normalizeAngle(current + difference * amount);
  }

  window.MissionBosPedestrianRenderer = {
    create: create
  };
})();
