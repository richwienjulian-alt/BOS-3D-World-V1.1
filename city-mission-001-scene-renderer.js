/* Mission BOS - Build 008R.9
   Validated Incident Scene & Crowd Load Foundation.
   Deterministic, stationary Mission 001 scene objects only.
   No modules. No fetch. No randomization.
*/
(function () {
  "use strict";

  var ACTIVE_STATES = ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"];
  var HIDDEN_STATES = ["READY", "CALL_RECEIVED", "CLEARING_CORRIDOR", "DISPATCHING", "ENROUTE", "RETURNING", "FAILED"];
  var HEADING_Y = {
    north: 0,
    northeast: -Math.PI / 4,
    east: -Math.PI / 2,
    southeast: -Math.PI * 3 / 4,
    south: Math.PI,
    southwest: Math.PI * 3 / 4,
    west: Math.PI / 2,
    northwest: Math.PI / 4
  };

  var SPECTATOR_COLORS = [
    { body: 0x4776a8, legs: 0x29394d },
    { body: 0x9b5b50, legs: 0x38363d },
    { body: 0x698b55, legs: 0x313e35 },
    { body: 0x8b6aa8, legs: 0x343246 },
    { body: 0xc18445, legs: 0x414044 },
    { body: 0x4f8d8b, legs: 0x2e3a42 }
  ];

  function create(options) {
    options = options || {};
    var scene = options.scene;
    var layout = options.layout;
    var propsPlan = options.propsPlan;
    var responsePlan = options.responsePlan;
    var incidentPlan = options.incidentPlan;
    var missionPlan = options.missionPlan;
    var plan = options.plan;
    var validator = options.validator;

    if (
      typeof THREE === "undefined" || !scene || !layout || !propsPlan ||
      !responsePlan || !incidentPlan || !missionPlan || !plan || !validator ||
      typeof validator.validate !== "function" || typeof validator.logResult !== "function"
    ) {
      console.error("MISSION BOS MISSION 001 INCIDENT SCENE: Missing required dependency.");
      return createFailedRuntime(scene, "Missing incident scene dependency.");
    }

    var validation = validator.validate(
      layout,
      propsPlan,
      responsePlan,
      incidentPlan,
      missionPlan,
      plan
    );
    validator.logResult(validation);

    if (!validation || validation.status !== "PASSED") {
      console.error("MISSION BOS MISSION 001 INCIDENT SCENE: Validation failed. No scene objects were rendered.");
      return createFailedRuntime(scene, "Incident scene validation failed.", validation);
    }

    var root = new THREE.Group();
    root.name = "Mission001IncidentSceneRoot";
    root.position.set(0, 0, 0);
    root.rotation.set(0, 0, 0);
    root.scale.set(1, 1, 1);

    var actorGroup = new THREE.Group();
    actorGroup.name = "Mission001IncidentActors";
    var firefighterGroup = new THREE.Group();
    firefighterGroup.name = "Mission001Firefighters";
    var policeGroup = new THREE.Group();
    policeGroup.name = "Mission001PoliceOfficers";
    var spectatorGroup = new THREE.Group();
    spectatorGroup.name = "Mission001Spectators";
    var closureGroup = new THREE.Group();
    closureGroup.name = "Mission001RoadClosure";
    var barrierGroup = new THREE.Group();
    barrierGroup.name = "Mission001Barriers";
    var coneGroup = new THREE.Group();
    coneGroup.name = "Mission001Cones";
    var hoseGroup = new THREE.Group();
    hoseGroup.name = "Mission001HoseLine";

    actorGroup.add(firefighterGroup, policeGroup, spectatorGroup);
    closureGroup.add(barrierGroup, coneGroup, hoseGroup);
    root.add(actorGroup, closureGroup);
    scene.add(root);

    var actorsById = Object.create(null);
    var actorStates = [];
    var phones = [];
    var barriers = [];
    var cones = [];
    var hoseLines = [];
    var currentState = "READY";
    var safety = { status: "PASSED", message: "" };
    var safetyTimer = 0;
    var safetyLogged = false;

    var shared = createSharedResources();

    (plan.actors || []).forEach(function (definition, index) {
      var actor = createActor(definition, index, shared);
      actor.group.userData.missionActorId = definition.id;
      actor.group.userData.role = definition.role;
      actor.group.userData.initialPosition = {
        x: Number(definition.position.x),
        y: Number(definition.position.y),
        z: Number(definition.position.z)
      };
      actor.group.userData.visibleStates = (definition.visibleStates || []).slice();
      actorsById[definition.id] = actor.group;
      actorStates.push(actor);

      if (definition.role === "firefighter") firefighterGroup.add(actor.group);
      else if (definition.role === "police") policeGroup.add(actor.group);
      else spectatorGroup.add(actor.group);

      if (actor.phone) phones.push(actor.phone);
    });

    var closure = plan.roadClosure || {};
    (closure.barriers || []).forEach(function (definition) {
      var barrier = createBarrier(definition, shared);
      barrier.userData.visibleStates = (closure.visibleStates || []).slice();
      barrierGroup.add(barrier);
      barriers.push(barrier);
    });

    (closure.cones || []).forEach(function (definition) {
      var cone = createCone(definition, shared);
      cone.userData.visibleStates = (closure.visibleStates || []).slice();
      coneGroup.add(cone);
      cones.push(cone);
    });

    if (plan.hoseLine) {
      var hose = createHoseLine(plan.hoseLine, shared);
      hose.userData.visibleStates = (plan.hoseLine.visibleStates || []).slice();
      hoseGroup.add(hose);
      hoseLines.push(hose);
    }

    var expected = plan.expectedCounts || {};
    var rendered = {
      zones: (plan.zones || []).length,
      actors: actorStates.length,
      firefighters: actorStates.filter(function (item) { return item.role === "firefighter"; }).length,
      policeOfficers: actorStates.filter(function (item) { return item.role === "police"; }).length,
      spectators: actorStates.filter(function (item) { return item.role === "spectator"; }).length,
      phones: phones.length,
      barriers: barriers.length,
      cones: cones.length,
      hoseLines: hoseLines.length
    };

    var manifestKeys = ["zones", "actors", "firefighters", "policeOfficers", "spectators", "phones", "barriers", "cones", "hoseLines"];
    var manifestPassed = manifestKeys.every(function (key) {
      return Number(rendered[key]) === Number(expected[key]);
    });
    var manifest = {
      title: "MISSION BOS MISSION 001 INCIDENT SCENE RENDER MANIFEST",
      status: manifestPassed ? "PASSED" : "FAILED",
      rendered: rendered,
      expected: {
        zones: Number(expected.zones) || 0,
        actors: Number(expected.actors) || 0,
        firefighters: Number(expected.firefighters) || 0,
        policeOfficers: Number(expected.policeOfficers) || 0,
        spectators: Number(expected.spectators) || 0,
        phones: Number(expected.phones) || 0,
        barriers: Number(expected.barriers) || 0,
        cones: Number(expected.cones) || 0,
        hoseLines: Number(expected.hoseLines) || 0
      }
    };
    logManifest(manifest);

    if (!manifestPassed) {
      fail("Incident scene render manifest failed.");
    }

    function setState(stateId) {
      if (!plan.statePresentation || !plan.statePresentation[stateId]) {
        fail("Unknown incident scene state: " + stateId);
        return false;
      }

      currentState = stateId;
      applyStatePresentation();
      runSafetyCheck(true);
      return safety.status === "PASSED";
    }

    function applyStatePresentation() {
      var presentation = plan.statePresentation[currentState] || { sceneVisible: false, phoneGlow: 0 };
      var sceneVisible = presentation.sceneVisible === true && manifestPassed && safety.status === "PASSED";

      actorStates.forEach(function (actor) {
        actor.group.visible = sceneVisible && actor.visibleStates.indexOf(currentState) >= 0;
      });
      barriers.forEach(function (barrier) {
        barrier.visible = sceneVisible && barrier.userData.visibleStates.indexOf(currentState) >= 0;
      });
      cones.forEach(function (cone) {
        cone.visible = sceneVisible && cone.userData.visibleStates.indexOf(currentState) >= 0;
      });
      hoseLines.forEach(function (hose) {
        hose.visible = sceneVisible && hose.userData.visibleStates.indexOf(currentState) >= 0;
      });

      actorGroup.visible = sceneVisible;
      closureGroup.visible = sceneVisible;
      root.visible = sceneVisible;

      phones.forEach(function (phone) {
        setPhoneGlow(phone, Number(presentation.phoneGlow) || 0, 0);
      });
    }

    function update(delta, elapsed) {
      if (safety.status !== "PASSED") return;

      var safeDelta = Math.max(0, finiteNumber(delta, 0));
      var safeElapsed = finiteNumber(elapsed, 0);
      safetyTimer += safeDelta;

      if (root.visible) {
        actorStates.forEach(function (actor) {
          if (!actor.group.visible) return;
          var phase = safeElapsed * 1.15 + actor.phase;
          var armSwing = Math.sin(phase) * 0.035;
          var headTurn = Math.sin(phase * 0.47) * 0.022;
          actor.leftArm.rotation.x = armSwing;
          actor.rightArm.rotation.x = -armSwing;
          actor.head.rotation.y = headTurn;
        });

        var presentation = plan.statePresentation[currentState] || { phoneGlow: 0 };
        var baseGlow = Number(presentation.phoneGlow) || 0;
        phones.forEach(function (phone, index) {
          setPhoneGlow(phone, baseGlow, 0.5 + 0.5 * Math.sin(safeElapsed * 2.4 + index * 0.83));
        });
      }

      if (safetyTimer >= 0.25) {
        safetyTimer = 0;
        runSafetyCheck(false);
      }
    }

    function setPhoneGlow(phone, baseGlow, pulse) {
      var intensity = Math.max(0, baseGlow) * (0.88 + 0.12 * pulse);
      phone.screen.visible = phone.owner.visible && baseGlow > 0;
      phone.screen.material.opacity = Math.min(1, 0.18 + intensity * 0.82);
      if (phone.screen.material.color && typeof phone.screen.material.color.setHex === "function") {
        phone.screen.material.color.setHex(intensity > 0.75 ? 0x8feeff : 0x6fc5e8);
      }
    }

    function reset() {
      currentState = "READY";
      safetyTimer = 0;
      if (safety.status === "PASSED") applyStatePresentation();
      else hideAll();
      return safety.status === "PASSED";
    }

    function getVisibleSpectatorCount() {
      var count = 0;
      actorStates.forEach(function (actor) {
        if (actor.role === "spectator" && actor.group.visible && root.visible) count += 1;
      });
      return count;
    }

    function runSafetyCheck(forceLog) {
      if (safety.status !== "PASSED") return safety;
      var errors = [];
      var presentation = plan.statePresentation[currentState];
      var shouldBeVisible = !!(presentation && presentation.sceneVisible === true);

      if (!isFiniteVector(root.position) || !isZeroTransform(root)) {
        errors.push("Scene root transform changed or became invalid.");
      }

      actorStates.forEach(function (actor) {
        var initial = actor.group.userData.initialPosition;
        if (!isFiniteVector(actor.group.position)) {
          errors.push(actor.id + " position is not finite.");
        } else if (
          Math.abs(actor.group.position.x - initial.x) > 1e-9 ||
          Math.abs(actor.group.position.y - initial.y) > 1e-9 ||
          Math.abs(actor.group.position.z - initial.z) > 1e-9
        ) {
          errors.push(actor.id + " root position changed.");
        }
        var actorShouldBeVisible = shouldBeVisible && actor.visibleStates.indexOf(currentState) >= 0;
        if (actor.group.visible !== actorShouldBeVisible) {
          errors.push(actor.id + " has invalid visibility for " + currentState + ".");
        }
      });

      if (currentState === "RETURNING") {
        if (barriers.some(function (item) { return item.visible; })) errors.push("Barrier visible during RETURNING.");
        if (cones.some(function (item) { return item.visible; })) errors.push("Cone visible during RETURNING.");
        if (hoseLines.some(function (item) { return item.visible; })) errors.push("Hose visible during RETURNING.");
      }

      var phoneOwners = Object.create(null);
      phones.forEach(function (phone) {
        if (!phone.owner || phone.owner.userData.role !== "spectator") {
          errors.push("Phone without spectator owner.");
          return;
        }
        var ownerId = phone.owner.userData.missionActorId;
        phoneOwners[ownerId] = (phoneOwners[ownerId] || 0) + 1;
      });
      actorStates.forEach(function (actor) {
        if (actor.role === "spectator" && phoneOwners[actor.id] !== 1) {
          errors.push(actor.id + " does not own exactly one phone.");
        }
      });

      manifestKeys.forEach(function (key) {
        if (Number(rendered[key]) !== Number(manifest.expected[key])) {
          errors.push("Runtime count mismatch: " + key + ".");
        }
      });

      if (
        firefighterGroup.children.length !== rendered.firefighters ||
        policeGroup.children.length !== rendered.policeOfficers ||
        spectatorGroup.children.length !== rendered.spectators ||
        barrierGroup.children.length !== rendered.barriers ||
        coneGroup.children.length !== rendered.cones ||
        hoseGroup.children.length !== rendered.hoseLines
      ) {
        errors.push("Unexpected incident scene object count.");
      }

      if (errors.length) {
        fail(errors.join(" "));
      }

      if (forceLog || !safetyLogged) {
        safetyLogged = true;
        logSafety(safety);
      }
      return safety;
    }

    function fail(message) {
      safety = { status: "FAILED", message: message || "Incident scene safety failed." };
      hideAll();
      console.error("MISSION BOS MISSION 001 INCIDENT SCENE FAILED: " + safety.message);
      logSafety(safety);
      return false;
    }

    function hideAll() {
      root.visible = false;
      actorGroup.visible = false;
      closureGroup.visible = false;
      actorStates.forEach(function (actor) { actor.group.visible = false; });
      barriers.forEach(function (item) { item.visible = false; });
      cones.forEach(function (item) { item.visible = false; });
      hoseLines.forEach(function (item) { item.visible = false; });
    }

    function dispose() {
      if (root.parent) root.parent.remove(root);
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

    applyStatePresentation();
    runSafetyCheck(true);

    return {
      root: root,
      groups: {
        actors: actorGroup,
        firefighters: firefighterGroup,
        police: policeGroup,
        spectators: spectatorGroup,
        roadClosure: closureGroup,
        barriers: barrierGroup,
        cones: coneGroup,
        hose: hoseGroup
      },
      actorsById: actorsById,
      validation: validation,
      setState: setState,
      update: update,
      reset: reset,
      getManifest: function () { return cloneData(manifest); },
      getSafetyStatus: function () { return cloneData(safety); },
      getVisibleSpectatorCount: getVisibleSpectatorCount,
      dispose: dispose
    };
  }

  function createActor(definition, index, shared) {
    var group = new THREE.Group();
    group.name = definition.id;
    group.position.set(
      Number(definition.position.x),
      Number(definition.position.y),
      Number(definition.position.z)
    );
    group.rotation.y = HEADING_Y[definition.heading] !== undefined ? HEADING_Y[definition.heading] : 0;
    group.scale.setScalar(finiteNumber(definition.heightScale, 1));

    var role = definition.role;
    var palette;
    if (role === "firefighter") {
      palette = { body: 0x27313a, legs: 0x20272e, accent: 0xe9d34b, helmet: definition.id === "MISSION_FIREFIGHTER_LEAD" ? 0xffffff : 0xf1d037 };
    } else if (role === "police") {
      palette = { body: 0x17375c, legs: 0x152b45, accent: 0xd6e75a, helmet: 0x1b2f4e };
    } else {
      palette = SPECTATOR_COLORS[index % SPECTATOR_COLORS.length];
      palette = { body: palette.body, legs: palette.legs, accent: 0xffffff, helmet: 0x000000 };
    }

    var bodyMaterial = new THREE.MeshStandardMaterial({ color: palette.body, roughness: 0.82 });
    var legMaterial = new THREE.MeshStandardMaterial({ color: palette.legs, roughness: 0.88 });
    var skinMaterial = shared.skinMaterial;
    var accentMaterial = new THREE.MeshBasicMaterial({ color: palette.accent });

    var body = new THREE.Mesh(shared.bodyGeometry, bodyMaterial);
    body.position.y = 1.12;
    body.castShadow = true;
    group.add(body);

    var head = new THREE.Mesh(shared.headGeometry, skinMaterial);
    head.position.y = 1.67;
    head.castShadow = true;
    group.add(head);

    var leftArm = new THREE.Mesh(shared.armGeometry, bodyMaterial);
    var rightArm = new THREE.Mesh(shared.armGeometry, bodyMaterial);
    leftArm.position.set(-0.18, 1.12, 0);
    rightArm.position.set(0.18, 1.12, 0);
    leftArm.castShadow = true;
    rightArm.castShadow = true;
    group.add(leftArm, rightArm);

    var leftLeg = new THREE.Mesh(shared.legGeometry, legMaterial);
    var rightLeg = new THREE.Mesh(shared.legGeometry, legMaterial);
    leftLeg.position.set(-0.105, 0.48, 0);
    rightLeg.position.set(0.105, 0.48, 0);
    leftLeg.castShadow = true;
    rightLeg.castShadow = true;
    group.add(leftLeg, rightLeg);

    if (role === "firefighter") {
      var helmet = new THREE.Mesh(shared.helmetGeometry, new THREE.MeshStandardMaterial({ color: palette.helmet, roughness: 0.55 }));
      helmet.position.y = 1.87;
      helmet.castShadow = true;
      group.add(helmet);
      addReflectiveBands(group, accentMaterial);
      if (definition.id === "MISSION_FIREFIGHTER_LEAD") {
        var vest = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.34, 0.035), new THREE.MeshBasicMaterial({ color: 0xe8d54a }));
        vest.position.set(0, 1.2, 0.185);
        group.add(vest);
      }
    } else if (role === "police") {
      var cap = new THREE.Mesh(shared.capGeometry, new THREE.MeshStandardMaterial({ color: palette.helmet, roughness: 0.65 }));
      cap.position.y = 1.86;
      group.add(cap);
      var marking = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.10, 0.03), accentMaterial);
      marking.position.set(0, 1.25, 0.18);
      group.add(marking);
    }

    var phone = null;
    if (definition.phone === true) {
      phone = createPhone(group, rightArm, shared, definition.id);
    }

    return {
      id: definition.id,
      role: role,
      group: group,
      body: body,
      head: head,
      leftArm: leftArm,
      rightArm: rightArm,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      phone: phone,
      visibleStates: (definition.visibleStates || []).slice(),
      phase: index * 0.71
    };
  }

  function addReflectiveBands(group, material) {
    var chest = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.065, 0.035), material);
    chest.position.set(0, 1.18, 0.185);
    var waist = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.055, 0.035), material);
    waist.position.set(0, 0.98, 0.185);
    group.add(chest, waist);
  }

  function createPhone(owner, arm, shared, ownerId) {
    var phoneGroup = new THREE.Group();
    phoneGroup.name = ownerId + "_PHONE";
    phoneGroup.position.set(0.0, -0.23, 0.10);
    phoneGroup.rotation.x = -0.22;
    arm.add(phoneGroup);

    var body = new THREE.Mesh(shared.phoneGeometry, shared.phoneBodyMaterial);
    phoneGroup.add(body);
    var screen = new THREE.Mesh(shared.phoneScreenGeometry, new THREE.MeshBasicMaterial({
      color: 0x6fc5e8,
      transparent: true,
      opacity: 0,
      depthWrite: false
    }));
    screen.name = ownerId + "_PHONE_SCREEN";
    screen.position.z = 0.022;
    phoneGroup.add(screen);

    phoneGroup.userData.ownerId = ownerId;
    return { group: phoneGroup, screen: screen, owner: owner };
  }

  function createBarrier(definition, shared) {
    var group = new THREE.Group();
    group.name = definition.id;
    group.position.set(Number(definition.position.x), Number(definition.position.y), Number(definition.position.z));
    group.rotation.y = finiteNumber(definition.rotation, 0);

    var width = Number(definition.footprint.width);
    var rail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, 0.12), shared.barrierWhiteMaterial);
    rail.position.y = 0.62;
    group.add(rail);

    for (var i = -1; i <= 1; i += 1) {
      var panel = new THREE.Mesh(new THREE.BoxGeometry(width / 3.15, 0.13, 0.125), i % 2 === 0 ? shared.barrierRedMaterial : shared.barrierWhiteMaterial);
      panel.position.set(i * width / 3.15, 0.62, 0.005);
      group.add(panel);
    }

    [-width * 0.38, width * 0.38].forEach(function (x) {
      var leg = new THREE.Mesh(shared.barrierLegGeometry, shared.barrierDarkMaterial);
      leg.position.set(x, 0.28, 0);
      group.add(leg);
      var foot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.28), shared.barrierDarkMaterial);
      foot.position.set(x, 0.03, 0);
      group.add(foot);
    });
    return group;
  }

  function createCone(definition, shared) {
    var group = new THREE.Group();
    group.name = definition.id;
    group.position.set(Number(definition.position.x), Number(definition.position.y), Number(definition.position.z));
    var base = new THREE.Mesh(shared.coneBaseGeometry, shared.coneDarkMaterial);
    base.position.y = 0.035;
    var cone = new THREE.Mesh(shared.coneGeometry, shared.coneOrangeMaterial);
    cone.position.y = 0.24;
    var band = new THREE.Mesh(shared.coneBandGeometry, shared.coneWhiteMaterial);
    band.position.y = 0.28;
    group.add(base, cone, band);
    return group;
  }

  function createHoseLine(definition, shared) {
    var group = new THREE.Group();
    group.name = definition.id;
    var points = definition.points || [];
    var radius = Math.max(0.01, Number(definition.radius) || 0.065);
    var material = new THREE.MeshStandardMaterial({ color: definition.color || "#24394f", roughness: 0.8 });

    for (var i = 0; i < points.length - 1; i += 1) {
      var start = points[i];
      var end = points[i + 1];
      var dx = Number(end.x) - Number(start.x);
      var dy = Number(end.y) - Number(start.y);
      var dz = Number(end.z) - Number(start.z);
      var horizontal = Math.sqrt(dx * dx + dz * dz);
      var length = Math.sqrt(dx * dx + dy * dy + dz * dz);
      var segment = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 10), material);
      segment.position.set(
        (Number(start.x) + Number(end.x)) / 2,
        (Number(start.y) + Number(end.y)) / 2,
        (Number(start.z) + Number(end.z)) / 2
      );
      segment.rotation.z = -Math.PI / 2 + Math.atan2(dy, Math.max(horizontal, 1e-9));
      segment.rotation.y = -Math.atan2(dz, dx);
      group.add(segment);
    }
    return group;
  }

  function createSharedResources() {
    return {
      bodyGeometry: new THREE.BoxGeometry(0.34, 0.65, 0.28),
      headGeometry: new THREE.SphereGeometry(0.16, 12, 9),
      armGeometry: new THREE.BoxGeometry(0.08, 0.60, 0.09),
      legGeometry: new THREE.BoxGeometry(0.14, 0.72, 0.16),
      helmetGeometry: new THREE.SphereGeometry(0.19, 12, 7),
      capGeometry: new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12),
      phoneGeometry: new THREE.BoxGeometry(0.11, 0.20, 0.035),
      phoneScreenGeometry: new THREE.PlaneGeometry(0.075, 0.15),
      barrierLegGeometry: new THREE.BoxGeometry(0.07, 0.56, 0.07),
      coneBaseGeometry: new THREE.BoxGeometry(0.24, 0.07, 0.24),
      coneGeometry: new THREE.ConeGeometry(0.10, 0.40, 12),
      coneBandGeometry: new THREE.CylinderGeometry(0.077, 0.087, 0.07, 12),
      skinMaterial: new THREE.MeshStandardMaterial({ color: 0xd6a77b, roughness: 0.9 }),
      phoneBodyMaterial: new THREE.MeshStandardMaterial({ color: 0x15191f, roughness: 0.45 }),
      barrierWhiteMaterial: new THREE.MeshStandardMaterial({ color: 0xf3f4ef, roughness: 0.65 }),
      barrierRedMaterial: new THREE.MeshStandardMaterial({ color: 0xd93434, roughness: 0.65 }),
      barrierDarkMaterial: new THREE.MeshStandardMaterial({ color: 0x32383f, roughness: 0.85 }),
      coneOrangeMaterial: new THREE.MeshStandardMaterial({ color: 0xf06d20, roughness: 0.72 }),
      coneWhiteMaterial: new THREE.MeshBasicMaterial({ color: 0xf4f4e8 }),
      coneDarkMaterial: new THREE.MeshStandardMaterial({ color: 0x262b31, roughness: 0.9 })
    };
  }

  function compose(primaryVisualRuntime, sceneRuntime) {
    if (!primaryVisualRuntime || !sceneRuntime) {
      console.error("MISSION BOS MISSION 001 VISUAL COMPOSITE: Missing runtime.");
      return createFailedComposite(primaryVisualRuntime, sceneRuntime);
    }

    function setState(stateId) {
      var sceneResult;
      var primaryResult;
      if (stateId === "RETURNING" || stateId === "FAILED" || stateId === "READY") {
        sceneResult = sceneRuntime.setState(stateId);
        primaryResult = primaryVisualRuntime.setState(stateId);
      } else {
        primaryResult = primaryVisualRuntime.setState(stateId);
        sceneResult = sceneRuntime.setState(stateId);
      }
      return primaryResult !== false && sceneResult !== false;
    }

    function update(delta, elapsed) {
      primaryVisualRuntime.update(delta, elapsed);
      sceneRuntime.update(delta, elapsed);
    }

    function reset() {
      var sceneResult = sceneRuntime.reset();
      var primaryResult = primaryVisualRuntime.reset();
      return sceneResult !== false && primaryResult !== false;
    }

    function getSafetyStatus() {
      var primary = primaryVisualRuntime.getSafetyStatus();
      var incident = sceneRuntime.getSafetyStatus();
      var passed = primary && primary.status === "PASSED" && incident && incident.status === "PASSED";
      return {
        status: passed ? "PASSED" : "FAILED",
        primaryVisualSafety: primary && primary.status ? primary.status : "FAILED",
        incidentSceneSafety: incident && incident.status ? incident.status : "FAILED",
        message: passed ? "" : [primary && primary.message, incident && incident.message].filter(Boolean).join(" ")
      };
    }

    function getManifest() {
      return {
        title: "MISSION BOS MISSION 001 COMPOSITE VISUAL MANIFEST",
        status: getSafetyStatus().status,
        core: primaryVisualRuntime.getManifest(),
        incidentScene: sceneRuntime.getManifest()
      };
    }

    return {
      primary: primaryVisualRuntime,
      incidentScene: sceneRuntime,
      setState: setState,
      update: update,
      reset: reset,
      getSafetyStatus: getSafetyStatus,
      getManifest: getManifest
    };
  }

  function createFailedRuntime(scene, message, validation) {
    var root = typeof THREE !== "undefined" ? new THREE.Group() : null;
    if (root) root.name = "Mission001IncidentSceneFailedRoot";
    if (scene && root) scene.add(root);
    if (root) root.visible = false;
    return {
      root: root,
      groups: {},
      actorsById: Object.create(null),
      validation: validation || { status: "FAILED" },
      setState: function () { return false; },
      update: function () {},
      reset: function () { return false; },
      getManifest: function () { return { title: "MISSION BOS MISSION 001 INCIDENT SCENE RENDER MANIFEST", status: "FAILED" }; },
      getSafetyStatus: function () { return { status: "FAILED", message: message || "Incident scene runtime failed." }; },
      getVisibleSpectatorCount: function () { return 0; },
      dispose: function () { if (root && root.parent) root.parent.remove(root); }
    };
  }

  function createFailedComposite(primary, incident) {
    return {
      primary: primary || null,
      incidentScene: incident || null,
      setState: function () { return false; },
      update: function () {},
      reset: function () { return false; },
      getSafetyStatus: function () { return { status: "FAILED", message: "Composite visual runtime failed." }; },
      getManifest: function () { return { title: "MISSION BOS MISSION 001 COMPOSITE VISUAL MANIFEST", status: "FAILED" }; }
    };
  }

  function logManifest(manifest) {
    var method = manifest.status === "PASSED" ? "log" : "error";
    console.group(manifest.title);
    console[method]("Zones: " + manifest.rendered.zones + " / " + manifest.expected.zones);
    console[method]("Actors: " + manifest.rendered.actors + " / " + manifest.expected.actors);
    console[method]("Firefighters: " + manifest.rendered.firefighters + " / " + manifest.expected.firefighters);
    console[method]("Police officers: " + manifest.rendered.policeOfficers + " / " + manifest.expected.policeOfficers);
    console[method]("Spectators: " + manifest.rendered.spectators + " / " + manifest.expected.spectators);
    console[method]("Phones: " + manifest.rendered.phones + " / " + manifest.expected.phones);
    console[method]("Barriers: " + manifest.rendered.barriers + " / " + manifest.expected.barriers);
    console[method]("Cones: " + manifest.rendered.cones + " / " + manifest.expected.cones);
    console[method]("Hose lines: " + manifest.rendered.hoseLines + " / " + manifest.expected.hoseLines);
    console[method]("STATUS: " + manifest.status);
    console.groupEnd();
  }

  function logSafety(status) {
    var method = status.status === "PASSED" ? "log" : "error";
    console.group("MISSION BOS MISSION 001 INCIDENT SCENE RUNTIME SAFETY");
    console[method]("STATUS: " + status.status);
    if (status.message) console[method](status.message);
    console.groupEnd();
  }

  function isFiniteVector(vector) {
    return vector && isFinite(Number(vector.x)) && isFinite(Number(vector.y)) && isFinite(Number(vector.z));
  }

  function isZeroTransform(object) {
    return object &&
      Math.abs(object.position.x) <= 1e-9 && Math.abs(object.position.y) <= 1e-9 && Math.abs(object.position.z) <= 1e-9 &&
      Math.abs(object.rotation.x) <= 1e-9 && Math.abs(object.rotation.y) <= 1e-9 && Math.abs(object.rotation.z) <= 1e-9 &&
      Math.abs(object.scale.x - 1) <= 1e-9 && Math.abs(object.scale.y - 1) <= 1e-9 && Math.abs(object.scale.z - 1) <= 1e-9;
  }

  function finiteNumber(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function cloneData(value) {
    return JSON.parse(JSON.stringify(value));
  }

  window.MissionBosMission001Scene = {
    create: create,
    compose: compose
  };
})();
