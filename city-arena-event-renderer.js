/* Mission BOS - Build 010P.3
   Deterministic Arena Event crowd renderer.
   Creates the planned crowd exactly once and controls visibility only.
   No modules. No fetch. No randomization.
*/
(function () {
  "use strict";

  var SAFETY_INTERVAL_SECONDS = 0.25;
  var EPSILON = 1e-9;

  function finite(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function finitePosition(position) {
    return !!position && isFinite(Number(position.x)) && isFinite(Number(position.y)) && isFinite(Number(position.z));
  }

  function createMaterial(color, extra) {
    var options = {
      color: color,
      roughness: 0.72,
      metalness: 0.04
    };
    Object.keys(extra || {}).forEach(function (key) { options[key] = extra[key]; });
    return new THREE.MeshStandardMaterial(options);
  }

  function createFailedRuntime(scene, message, validation) {
    var root = typeof THREE !== "undefined" ? new THREE.Group() : null;
    if (root) {
      root.name = "ArenaEventCrowdRootFailed";
      root.visible = false;
      if (scene && typeof scene.add === "function") scene.add(root);
    }
    var safety = {
      title: "MISSION BOS ARENA EVENT RENDER RUNTIME SAFETY",
      status: "FAILED",
      failed: true,
      errors: [message || "Arena event renderer initialization failed."]
    };
    var manifest = {
      title: "MISSION BOS ARENA EVENT RENDER MANIFEST",
      status: "FAILED",
      actual: { crowdActors: 0, phones: 0, randomizedActors: 0, mission002Actors: 0 },
      expected: { crowdActors: 0, phones: 0, randomizedActors: 0, mission002Actors: 0 }
    };
    console.error(message || "MISSION BOS ARENA EVENT RENDERER: FAILED");
    return {
      root: root,
      groups: {},
      actorsById: Object.create(null),
      phonesByEndpointId: Object.create(null),
      validation: validation || null,
      setVisible: function () { return false; },
      update: function () {},
      reset: function () { return false; },
      getActorPosition: function () { return null; },
      getPhonePosition: function () { return null; },
      getVisibleActorCount: function () { return 0; },
      getVisiblePhoneCount: function () { return 0; },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: function () {
        if (root && root.parent) root.parent.remove(root);
      }
    };
  }

  function createPerson(definition, index, phoneDefinition) {
    var group = new THREE.Group();
    group.name = definition.id;
    group.position.set(
      finite(definition.position && definition.position.x, 0),
      finite(definition.position && definition.position.y, 0),
      finite(definition.position && definition.position.z, 0)
    );
    group.rotation.y = finite(definition.rotation, 0);

    var bodyMaterial = createMaterial(definition.bodyColor || "#55779a");
    var trouserMaterial = createMaterial(definition.trouserColor || "#2d3746");
    var skinMaterial = createMaterial(definition.skinColor || "#e0ad86");
    var hairMaterial = createMaterial(definition.hairColor || "#392820");
    var shoeMaterial = createMaterial(0x20252d);

    var torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.74, 0.30), bodyMaterial);
    torso.position.set(0, 1.25, 0);
    torso.castShadow = true;
    group.add(torso);

    var head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 9), skinMaterial);
    head.position.set(0, 1.83, 0);
    head.castShadow = true;
    group.add(head);

    var hair = new THREE.Mesh(new THREE.SphereGeometry(0.198, 12, 7, 0, Math.PI * 2, 0, Math.PI * 0.52), hairMaterial);
    hair.position.set(0, 1.89, -0.006);
    hair.castShadow = true;
    group.add(hair);

    var leftArmPivot = new THREE.Group();
    var rightArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.34, 1.48, 0);
    rightArmPivot.position.set(0.34, 1.48, 0);
    var leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.62, 0.15), bodyMaterial);
    var rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.62, 0.15), bodyMaterial);
    leftArm.position.y = -0.27;
    rightArm.position.y = -0.27;
    leftArm.castShadow = true;
    rightArm.castShadow = true;
    leftArmPivot.add(leftArm);
    rightArmPivot.add(rightArm);
    group.add(leftArmPivot, rightArmPivot);

    var leftLegPivot = new THREE.Group();
    var rightLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.15, 0.91, 0);
    rightLegPivot.position.set(0.15, 0.91, 0);
    var leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.70, 0.22), trouserMaterial);
    var rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.70, 0.22), trouserMaterial);
    leftLeg.position.y = -0.31;
    rightLeg.position.y = -0.31;
    leftLeg.castShadow = true;
    rightLeg.castShadow = true;
    leftLegPivot.add(leftLeg);
    rightLegPivot.add(rightLeg);
    group.add(leftLegPivot, rightLegPivot);

    var leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.34), shoeMaterial);
    var rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.34), shoeMaterial);
    leftShoe.position.set(-0.15, 0.25, 0.055);
    rightShoe.position.set(0.15, 0.25, 0.055);
    leftShoe.castShadow = true;
    rightShoe.castShadow = true;
    group.add(leftShoe, rightShoe);

    var phone = null;
    if (definition.phone === true && phoneDefinition) {
      var phoneGroup = new THREE.Group();
      phoneGroup.name = phoneDefinition.id;
      phoneGroup.position.set(0.36, 1.25, 0.16);
      phoneGroup.rotation.set(-0.18, -0.12, -0.15);

      var phoneBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.28, 0.035),
        createMaterial(0x151a22, { roughness: 0.48, metalness: 0.18 })
      );
      phoneBody.castShadow = true;
      phoneGroup.add(phoneBody);

      var screenMaterial = new THREE.MeshBasicMaterial({
        color: 0x7edaff,
        transparent: true,
        opacity: 0.72,
        depthWrite: false
      });
      var screen = new THREE.Mesh(new THREE.PlaneGeometry(0.125, 0.225), screenMaterial);
      screen.position.z = 0.019;
      phoneGroup.add(screen);
      group.add(phoneGroup);

      rightArmPivot.rotation.x = -0.68;
      rightArmPivot.rotation.z = -0.18;
      phone = {
        endpointId: phoneDefinition.id,
        actorId: definition.id,
        group: phoneGroup,
        screen: screen
      };
    }

    group.userData.initialPosition = {
      x: group.position.x,
      y: group.position.y,
      z: group.position.z
    };
    group.userData.arenaVisitorId = definition.id;

    return {
      id: definition.id,
      group: group,
      head: head,
      leftArm: leftArmPivot,
      rightArm: rightArmPivot,
      leftLeg: leftLegPivot,
      rightLeg: rightLegPivot,
      phone: phone,
      phase: index * 0.73,
      frequency: 0.55 + (index % 6) * 0.07
    };
  }

  function disposeObject(root) {
    if (!root || typeof root.traverse !== "function") return;
    root.traverse(function (object) {
      if (object.geometry && typeof object.geometry.dispose === "function") object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(function (material) {
            if (material && typeof material.dispose === "function") material.dispose();
          });
        } else if (typeof object.material.dispose === "function") {
          object.material.dispose();
        }
      }
    });
  }

  function create(options) {
    options = options || {};
    var scene = options.scene;
    var plan = options.plan;
    var validation = options.validation || null;

    if (typeof THREE === "undefined" || !scene || !plan) {
      return createFailedRuntime(scene, "Arena event renderer dependencies are incomplete.", validation);
    }
    if (validation && validation.status !== "PASSED") {
      return createFailedRuntime(scene, "Arena event validation did not pass.", validation);
    }

    var root = new THREE.Group();
    root.name = "ArenaEventCrowdRoot";
    root.visible = false;
    var crowdGroup = new THREE.Group();
    crowdGroup.name = "ArenaEventCrowdActors";
    var phoneGroup = new THREE.Group();
    phoneGroup.name = "ArenaEventPhones";
    root.add(crowdGroup, phoneGroup);
    scene.add(root);

    var actorsById = Object.create(null);
    var phonesByEndpointId = Object.create(null);
    var actorStates = [];
    var phoneDefinitionsByActorId = Object.create(null);
    (plan.visiblePhoneEndpoints || []).forEach(function (definition) {
      phoneDefinitionsByActorId[definition.actorId] = definition;
    });

    (plan.crowd || []).forEach(function (definition, index) {
      var actor = createPerson(definition, index, phoneDefinitionsByActorId[definition.id] || null);
      actorsById[definition.id] = actor.group;
      actorStates.push(actor);
      crowdGroup.add(actor.group);
      if (actor.phone) {
        phonesByEndpointId[actor.phone.endpointId] = actor.phone;
      }
    });

    var expected = plan.expectedCounts || {};
    var actual = {
      crowdActors: actorStates.length,
      phones: Object.keys(phonesByEndpointId).length,
      randomizedActors: 0,
      mission002Actors: 0
    };
    var manifestStatus =
      actual.crowdActors === Number(expected.crowdActors || 0) &&
      actual.phones === Number(expected.phones || 0) &&
      actual.randomizedActors === 0 &&
      actual.mission002Actors === Number(expected.mission002Actors || 0)
        ? "PASSED" : "FAILED";
    var manifest = {
      title: "MISSION BOS ARENA EVENT RENDER MANIFEST",
      status: manifestStatus,
      actual: actual,
      expected: {
        crowdActors: Number(expected.crowdActors || 0),
        phones: Number(expected.phones || 0),
        randomizedActors: 0,
        mission002Actors: Number(expected.mission002Actors || 0)
      }
    };

    console.group(manifest.title);
    console[manifest.status === "PASSED" ? "log" : "error"]("Crowd actors: " + actual.crowdActors + " / " + manifest.expected.crowdActors);
    console[manifest.status === "PASSED" ? "log" : "error"]("Phones: " + actual.phones + " / " + manifest.expected.phones);
    console[manifest.status === "PASSED" ? "log" : "error"]("Randomized actors: 0 / 0");
    console[manifest.status === "PASSED" ? "log" : "error"]("Mission 002 actors: 0 / 0");
    console[manifest.status === "PASSED" ? "log" : "error"]("STATUS: " + manifest.status);
    console.groupEnd();

    var visible = false;
    var failed = manifestStatus !== "PASSED";
    var disposed = false;
    var safetyAccumulator = 0;
    var safety = {
      title: "MISSION BOS ARENA EVENT RENDER RUNTIME SAFETY",
      invalidActorPositionErrors: 0,
      actorRootMovementErrors: 0,
      renderCountErrors: failed ? 1 : 0,
      duplicateActorErrors: 0,
      hiddenStateErrors: 0,
      status: failed ? "FAILED" : "PASSED",
      failed: failed,
      errors: failed ? ["Arena event render manifest failed."] : []
    };

    function runSafetyCheck(initial) {
      var next = {
        title: safety.title,
        invalidActorPositionErrors: 0,
        actorRootMovementErrors: 0,
        renderCountErrors: 0,
        duplicateActorErrors: 0,
        hiddenStateErrors: 0,
        status: "PASSED",
        failed: false,
        errors: []
      };
      var seen = Object.create(null);
      actorStates.forEach(function (actor) {
        var initialPosition = actor.group.userData.initialPosition;
        if (!finitePosition(actor.group.position)) {
          next.invalidActorPositionErrors += 1;
          next.errors.push("Invalid actor position: " + actor.id);
        }
        if (Math.abs(actor.group.position.x - initialPosition.x) > EPSILON ||
            Math.abs(actor.group.position.y - initialPosition.y) > EPSILON ||
            Math.abs(actor.group.position.z - initialPosition.z) > EPSILON) {
          next.actorRootMovementErrors += 1;
          next.errors.push("Actor root moved: " + actor.id);
        }
        if (seen[actor.id]) {
          next.duplicateActorErrors += 1;
          next.errors.push("Duplicate actor ID: " + actor.id);
        }
        seen[actor.id] = true;
      });
      if (actorStates.length !== Number(expected.crowdActors || 0) ||
          Object.keys(phonesByEndpointId).length !== Number(expected.phones || 0)) {
        next.renderCountErrors += 1;
        next.errors.push("Arena crowd render counts changed.");
      }
      if (!visible && root.visible) {
        next.hiddenStateErrors += 1;
        next.errors.push("Arena crowd root remained visible while event was inactive.");
      }
      if (next.errors.length) {
        next.status = "FAILED";
        next.failed = true;
        failed = true;
        root.visible = false;
      }
      safety = next;
      if (initial || safety.failed) {
        console.group(safety.title);
        console[safety.status === "PASSED" ? "log" : "error"]("STATUS: " + safety.status);
        if (safety.errors.length) console.error(safety.errors);
        console.groupEnd();
      }
    }

    function setVisible(nextVisible) {
      if (disposed || failed) return false;
      visible = nextVisible === true;
      root.visible = visible;
      return true;
    }

    function update(delta, elapsed) {
      if (disposed || failed) return;
      var safeDelta = Math.max(0, Math.min(finite(delta, 0), 0.25));
      var safeElapsed = finite(elapsed, 0);
      safetyAccumulator += safeDelta;
      if (visible) {
        var amplitude = finite((plan.simulation || {}).idleAnimationAmplitude, 0.025);
        actorStates.forEach(function (actor, index) {
          var phase = safeElapsed * actor.frequency + actor.phase;
          actor.leftArm.rotation.x = Math.sin(phase) * amplitude;
          if (!actor.phone) actor.rightArm.rotation.x = -Math.sin(phase) * amplitude;
          actor.head.rotation.y = Math.sin(phase * 0.61) * amplitude * 0.65;
          if (actor.phone && actor.phone.screen && actor.phone.screen.material) {
            actor.phone.screen.material.opacity = 0.62 + 0.12 * (0.5 + 0.5 * Math.sin(safeElapsed * 1.75 + index * 0.63));
          }
        });
      }
      if (safetyAccumulator + EPSILON >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafetyCheck(false);
      }
    }

    function getActorPosition(actorId) {
      var actor = actorsById[actorId];
      if (!actor) return null;
      return { x: actor.position.x, y: actor.position.y, z: actor.position.z };
    }

    function getPhonePosition(endpointId) {
      var phone = phonesByEndpointId[endpointId];
      if (!phone || !phone.group) return null;
      var world = new THREE.Vector3();
      if (typeof phone.group.getWorldPosition === "function") {
        phone.group.getWorldPosition(world);
        return { x: world.x, y: world.y, z: world.z };
      }
      var actorPosition = getActorPosition(phone.actorId);
      return actorPosition ? {
        x: actorPosition.x + phone.group.position.x,
        y: actorPosition.y + phone.group.position.y,
        z: actorPosition.z + phone.group.position.z
      } : null;
    }

    function reset() {
      if (disposed) return false;
      visible = false;
      root.visible = false;
      actorStates.forEach(function (actor) {
        actor.leftArm.rotation.x = 0;
        if (!actor.phone) actor.rightArm.rotation.x = 0;
        actor.head.rotation.y = 0;
      });
      runSafetyCheck(false);
      return safety.status === "PASSED";
    }

    function dispose() {
      if (disposed) return;
      visible = false;
      root.visible = false;
      if (root.parent) root.parent.remove(root);
      disposeObject(root);
      disposed = true;
    }

    runSafetyCheck(true);

    return {
      root: root,
      groups: { crowd: crowdGroup, phones: phoneGroup },
      actorsById: actorsById,
      phonesByEndpointId: phonesByEndpointId,
      validation: validation,
      setVisible: setVisible,
      update: update,
      reset: reset,
      getActorPosition: getActorPosition,
      getPhonePosition: getPhonePosition,
      getVisibleActorCount: function () { return visible ? actorStates.length : 0; },
      getVisiblePhoneCount: function () { return visible ? Object.keys(phonesByEndpointId).length : 0; },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: dispose
    };
  }

  window.MissionBosArenaEventRenderer = { create: create };
})();
