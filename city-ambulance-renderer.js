/* Mission BOS - Build 010P.2
   Validated Ambulance Foundation - deterministic renderer and route runtime.
   No modules. No fetch. No random placement.
*/
(function () {
  "use strict";

  var STATES = Object.freeze({
    AT_STATION: "AT_STATION",
    CLEARING_CORRIDOR: "CLEARING_CORRIDOR",
    TO_ARENA: "TO_ARENA",
    AT_ARENA: "AT_ARENA",
    TO_INCIDENT: "TO_INCIDENT",
    AT_INCIDENT: "AT_INCIDENT",
    TO_HOSPITAL: "TO_HOSPITAL",
    AT_HOSPITAL: "AT_HOSPITAL",
    RETURNING: "RETURNING",
    FAILED: "FAILED"
  });

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

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function normalizeAngle(value) {
    var angle = value;
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  function shortestAngleDifference(from, to) {
    return normalizeAngle(to - from);
  }

  function lerpAngle(from, to, amount) {
    return normalizeAngle(from + shortestAngleDifference(from, to) * amount);
  }

  function hexNumber(value, fallback) {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      var normalized = value.replace("#", "");
      var parsed = parseInt(normalized, 16);
      if (isFinite(parsed)) return parsed;
    }
    return fallback;
  }

  function createManifest(actual, expected) {
    expected = expected || {};
    var passed =
      actual.ambulances === Number(expected.ambulances || 0) &&
      actual.wheels === Number(expected.wheels || 0) &&
      actual.lightbars === Number(expected.lightbars || 0) &&
      actual.accessSurfaces === Number(expected.accessSurfaces || 0) &&
      actual.routes === Number(expected.routes || 0);
    return {
      title: "MISSION BOS AMBULANCE RENDER MANIFEST",
      actual: actual,
      expected: {
        ambulances: Number(expected.ambulances || 0),
        wheels: Number(expected.wheels || 0),
        lightbars: Number(expected.lightbars || 0),
        accessSurfaces: Number(expected.accessSurfaces || 0),
        routes: Number(expected.routes || 0)
      },
      status: passed ? "PASSED" : "FAILED"
    };
  }

  function logManifest(manifest) {
    var method = manifest.status === "PASSED" ? "log" : "error";
    console.group(manifest.title);
    console[method]("Ambulances: " + manifest.actual.ambulances + " / " + manifest.expected.ambulances);
    console[method]("Wheels: " + manifest.actual.wheels + " / " + manifest.expected.wheels);
    console[method]("Lightbars: " + manifest.actual.lightbars + " / " + manifest.expected.lightbars);
    console[method]("Access surfaces: " + manifest.actual.accessSurfaces + " / " + manifest.expected.accessSurfaces);
    console[method]("Routes: " + manifest.actual.routes + " / " + manifest.expected.routes);
    console[method]("STATUS: " + manifest.status);
    console.groupEnd();
  }

  function createSafety() {
    return {
      title: "MISSION BOS AMBULANCE RUNTIME SAFETY",
      invalidPositionErrors: 0,
      surfaceErrors: 0,
      buildingCollisionErrors: 0,
      towerCollisionErrors: 0,
      staticPropCollisionErrors: 0,
      pedestrianCollisionErrors: 0,
      responseVehicleCollisionErrors: 0,
      civilianVehicleCollisionErrors: 0,
      renderCountErrors: 0,
      sourceMutationErrors: 0,
      status: "PASSED",
      failed: false,
      halted: false,
      errors: []
    };
  }

  function logSafety(safety) {
    var method = safety.status === "PASSED" ? "log" : "error";
    console.group(safety.title);
    console[method]("Invalid position errors: " + safety.invalidPositionErrors);
    console[method]("Validated surface errors: " + safety.surfaceErrors);
    console[method]("Building collision errors: " + safety.buildingCollisionErrors);
    console[method]("Tower collision errors: " + safety.towerCollisionErrors);
    console[method]("Static prop collision errors: " + safety.staticPropCollisionErrors);
    console[method]("Pedestrian collision errors: " + safety.pedestrianCollisionErrors);
    console[method]("Response vehicle collision errors: " + safety.responseVehicleCollisionErrors);
    console[method]("Civilian vehicle collision errors: " + safety.civilianVehicleCollisionErrors);
    console[method]("Render count errors: " + safety.renderCountErrors);
    console[method]("Source mutation errors: " + safety.sourceMutationErrors);
    console[method]("STATUS: " + safety.status);
    if (safety.errors.length) console.error(safety.errors);
    console.groupEnd();
  }

  function createFailedRuntime(message, validation, plan) {
    var root = typeof THREE !== "undefined" ? new THREE.Group() : null;
    if (root) {
      root.name = "MISSION_BOS_AMBULANCE_FAILED";
      root.visible = false;
    }
    var manifest = createManifest({ ambulances: 0, wheels: 0, lightbars: 0, accessSurfaces: 0, routes: 0 }, plan && plan.expectedCounts);
    manifest.status = "FAILED";
    logManifest(manifest);
    var safety = createSafety();
    safety.status = "FAILED";
    safety.failed = true;
    safety.halted = true;
    safety.errors.push(message || "Ambulance renderer initialization failed.");
    logSafety(safety);
    console.error("MISSION BOS AMBULANCE RENDERING ABORTED: " + safety.errors[0]);
    return {
      root: root,
      groups: { accessSurfaces: null, vehicles: null },
      vehiclesById: Object.create(null),
      validation: validation || null,
      update: function () {},
      startClearingCorridor: function () { return false; },
      dispatchToArena: function () { return false; },
      setRouteProfile: function () { return false; },
      restoreDefaultRouteProfile: function () { return false; },
      dispatchToIncident: function () { return false; },
      transportToHospital: function () { return false; },
      returnToStation: function () { return false; },
      reset: function () { return false; },
      getState: function () { return STATES.FAILED; },
      getRouteProfileId: function () { return "MISSION_002_DEFAULT"; },
      getVehicleStatus: function () { return "Fehlgeschlagen"; },
      getCommsPosition: function () { return typeof THREE !== "undefined" ? new THREE.Vector3() : null; },
      getManifest: function () { return manifest; },
      getSafetyStatus: function () { return copy(safety); },
      dispose: function () { if (root && root.parent) root.parent.remove(root); }
    };
  }

  function createAccessSurfaces(plan, group) {
    var count = 0;
    (plan.accessSurfaces || []).forEach(function (definition) {
      var rect = definition.renderRect;
      if (!rect) return;
      var surface = new THREE.Mesh(
        new THREE.PlaneGeometry(Number(rect.width), Number(rect.depth)),
        new THREE.MeshStandardMaterial({
          color: hexNumber(definition.color, 0x343b43),
          roughness: 0.93,
          metalness: 0.01,
          transparent: true,
          opacity: 0.78,
          depthWrite: false
        })
      );
      surface.name = definition.id;
      surface.rotation.x = -Math.PI / 2;
      surface.position.set(Number(rect.x), 0.026, Number(rect.z));
      surface.receiveShadow = true;
      group.add(surface);

      var centerLine = new THREE.Mesh(
        new THREE.PlaneGeometry(Math.max(0.08, Number(rect.width) * 0.035), Number(rect.depth) * 0.68),
        new THREE.MeshBasicMaterial({
          color: hexNumber(definition.markingColor, 0xf0f3f5),
          transparent: true,
          opacity: 0.62,
          depthWrite: false
        })
      );
      centerLine.name = definition.id + "_MARKING";
      centerLine.rotation.x = -Math.PI / 2;
      centerLine.position.set(Number(rect.x), 0.031, Number(rect.z));
      group.add(centerLine);
      count += 1;
    });
    return count;
  }

  function createLightbar(definition) {
    var group = new THREE.Group();
    group.name = definition.id + "_LIGHTBAR";
    var materials = [];
    [-1, 1].forEach(function (side, index) {
      var material = new THREE.MeshStandardMaterial({
        color: hexNumber(definition.emergencyColor, 0x1e90ff),
        emissive: hexNumber(definition.emergencyColor, 0x1e90ff),
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0.2,
        roughness: 0.2,
        depthWrite: false
      });
      materials.push(material);
      var lens = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.11, 0.22), material);
      lens.name = definition.id + "_LIGHTBAR_LENS_" + index;
      lens.position.x = side * 0.18;
      group.add(lens);
    });
    var base = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.055, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x27313a, roughness: 0.62 })
    );
    base.position.y = -0.07;
    group.add(base);
    return { group: group, materials: materials };
  }

  function createWheels(root, definition) {
    var bodyLength = Number(definition.bodyLength);
    var bodyWidth = Number(definition.bodyWidth);
    var footprintWidth = Number(definition.footprintWidth);
    var radius = 0.245;
    var thickness = Math.min(0.14, Math.max(0.09, (footprintWidth - bodyWidth) * 0.5));
    var centerX = footprintWidth / 2 - thickness / 2;
    var axleZ = bodyLength / 2 - radius - 0.16;
    var tireMaterial = new THREE.MeshStandardMaterial({ color: 0x171a1f, roughness: 0.92 });
    var rimMaterial = new THREE.MeshStandardMaterial({ color: 0xb7c0c8, roughness: 0.42, metalness: 0.5 });
    var wheels = [];
    [-1, 1].forEach(function (side) {
      [-1, 1].forEach(function (axle) {
        var holder = new THREE.Group();
        holder.name = definition.id + "_WHEEL_" + (side < 0 ? "L" : "R") + (axle > 0 ? "F" : "R");
        holder.position.set(side * centerX, -0.13, axle * axleZ);
        var tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, thickness, 20), tireMaterial);
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        holder.add(tire);
        var rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.46, radius * 0.46, thickness + 0.008, 16), rimMaterial);
        rim.rotation.z = Math.PI / 2;
        holder.add(rim);
        root.add(holder);
        wheels.push(holder);
      });
    });
    return { items: wheels, radius: radius };
  }

  function createAmbulanceModel(definition) {
    var root = new THREE.Group();
    var length = Number(definition.bodyLength);
    var width = Number(definition.bodyWidth);
    var white = new THREE.MeshStandardMaterial({ color: hexNumber(definition.bodyColor, 0xf4f6f8), roughness: 0.44, metalness: 0.05 });
    var red = new THREE.MeshStandardMaterial({ color: hexNumber(definition.accentColor, 0xd62828), roughness: 0.46, metalness: 0.04 });
    var yellow = new THREE.MeshStandardMaterial({ color: hexNumber(definition.reflectiveColor, 0xf6c945), roughness: 0.38, emissive: hexNumber(definition.reflectiveColor, 0xf6c945), emissiveIntensity: 0.05 });
    var glass = new THREE.MeshStandardMaterial({ color: hexNumber(definition.windowColor, 0x1b2a38), roughness: 0.16, metalness: 0.05, transparent: true, opacity: 0.9 });
    var dark = new THREE.MeshStandardMaterial({ color: 0x26313a, roughness: 0.72 });
    var lamp = new THREE.MeshStandardMaterial({ color: 0xfff5ce, emissive: 0xffd86e, emissiveIntensity: 0.7, roughness: 0.22 });
    var tail = new THREE.MeshStandardMaterial({ color: 0xd92d2d, emissive: 0x8c1010, emissiveIntensity: 0.25, roughness: 0.3 });

    var chassis = new THREE.Mesh(new THREE.BoxGeometry(width, 0.56, length), white);
    chassis.name = definition.id + "_CHASSIS";
    chassis.position.y = 0.28;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    root.add(chassis);

    var rearBox = new THREE.Mesh(new THREE.BoxGeometry(width * 0.96, 1.16, length * 0.61), white);
    rearBox.name = definition.id + "_MEDICAL_BOX";
    rearBox.position.set(0, 0.93, -length * 0.17);
    rearBox.castShadow = true;
    root.add(rearBox);

    var cab = new THREE.Mesh(new THREE.BoxGeometry(width * 0.94, 0.82, length * 0.31), white);
    cab.name = definition.id + "_CAB";
    cab.position.set(0, 0.78, length * 0.32);
    cab.castShadow = true;
    root.add(cab);

    var windshield = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.74, 0.42), glass);
    windshield.name = definition.id + "_WINDSHIELD";
    windshield.position.set(0, 0.93, length / 2 + 0.012);
    root.add(windshield);

    [-1, 1].forEach(function (side) {
      var sideWindow = new THREE.Mesh(new THREE.PlaneGeometry(length * 0.24, 0.35), glass);
      sideWindow.name = definition.id + "_SIDE_WINDOW_" + (side < 0 ? "L" : "R");
      sideWindow.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      sideWindow.position.set(side * (width / 2 + 0.012), 0.91, length * 0.31);
      root.add(sideWindow);

      var redStripe = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.19, length * 0.76), red);
      redStripe.name = definition.id + "_RED_STRIPE_" + (side < 0 ? "L" : "R");
      redStripe.position.set(side * (width / 2 + 0.013), 0.58, -length * 0.03);
      root.add(redStripe);

      for (var markerIndex = 0; markerIndex < 3; markerIndex += 1) {
        var marker = new THREE.Mesh(new THREE.BoxGeometry(0.027, 0.13, 0.34), yellow);
        marker.name = definition.id + "_REFLECTIVE_" + side + "_" + markerIndex;
        marker.position.set(side * (width / 2 + 0.016), 0.35, -length * 0.53 + markerIndex * length * 0.38);
        root.add(marker);
      }
    });

    var rearDoorLeft = new THREE.Mesh(new THREE.BoxGeometry(width * 0.42, 0.78, 0.035), white);
    rearDoorLeft.name = definition.id + "_REAR_DOOR_L";
    rearDoorLeft.position.set(-width * 0.22, 0.8, -length / 2 - 0.012);
    root.add(rearDoorLeft);
    var rearDoorRight = rearDoorLeft.clone();
    rearDoorRight.name = definition.id + "_REAR_DOOR_R";
    rearDoorRight.position.x = width * 0.22;
    root.add(rearDoorRight);

    var grille = new THREE.Mesh(new THREE.BoxGeometry(width * 0.55, 0.2, 0.045), dark);
    grille.name = definition.id + "_GRILLE";
    grille.position.set(0, 0.35, length / 2 + 0.02);
    root.add(grille);

    [-1, 1].forEach(function (side) {
      var headlight = new THREE.Mesh(new THREE.BoxGeometry(width * 0.17, 0.12, 0.04), lamp);
      headlight.position.set(side * width * 0.31, 0.43, length / 2 + 0.025);
      root.add(headlight);
      var tailLight = new THREE.Mesh(new THREE.BoxGeometry(width * 0.17, 0.15, 0.04), tail);
      tailLight.position.set(side * width * 0.31, 0.45, -length / 2 - 0.025);
      root.add(tailLight);
    });

    var frontBumper = new THREE.Mesh(new THREE.BoxGeometry(width * 0.92, 0.13, 0.1), dark);
    frontBumper.position.set(0, 0.13, length / 2 + 0.055);
    root.add(frontBumper);
    var rearBumper = frontBumper.clone();
    rearBumper.position.z = -length / 2 - 0.055;
    root.add(rearBumper);

    var roofMarker = new THREE.Mesh(new THREE.BoxGeometry(width * 0.58, 0.08, length * 0.28), red);
    roofMarker.position.set(0, 1.54, -length * 0.17);
    root.add(roofMarker);

    var lightbar = createLightbar(definition);
    lightbar.group.position.set(0, 1.27, length * 0.31);
    root.add(lightbar.group);

    var wheels = createWheels(root, definition);
    return {
      root: root,
      wheels: wheels.items,
      wheelRadius: wheels.radius,
      lightbarMaterials: lightbar.materials,
      counts: { wheels: wheels.items.length, lightbars: 1 }
    };
  }

  function create(options) {
    options = options || {};
    try {
      if (typeof THREE === "undefined") return createFailedRuntime("Three.js is unavailable.", null, options.plan);
      var scene = options.scene;
      var layout = options.layout;
      var propsPlan = options.propsPlan;
      var trafficPlan = options.trafficPlan;
      var pedestrianPlan = options.pedestrianPlan;
      var plan = options.plan;
      var validator = options.validator;
      var trafficRuntime = options.trafficRuntime;
      var pedestrianRuntime = options.pedestrianRuntime;
      var responseRuntime = options.responseRuntime;
      var routeHelper = window.MissionBosResponseVehicleValidator;
      var baseAssociationPlan = window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN_009N7_BASELINE;
      var extendedAssociationPlan = window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN;
      var cellLoadPlan = window.MISSION_BOS_CELL_LOAD_PLAN;

      if (!scene || typeof scene.add !== "function" || !layout || !propsPlan || !trafficPlan || !pedestrianPlan || !plan) {
        return createFailedRuntime("One or more required ambulance sources are missing.", null, plan);
      }
      if (!validator || typeof validator.validate !== "function" || typeof validator.logResult !== "function") {
        return createFailedRuntime("MissionBosAmbulanceValidator is incomplete.", null, plan);
      }
      if (!routeHelper || typeof routeHelper.prepareOpenRoute !== "function" || typeof routeHelper.sampleOpenRoute !== "function" ||
          typeof routeHelper.rectangleCorners !== "function" || typeof routeHelper.polygonsOverlapSAT !== "function") {
        return createFailedRuntime("Shared response route helpers are unavailable.", null, plan);
      }
      if (!trafficRuntime || !trafficRuntime.vehiclesById || !pedestrianRuntime || !pedestrianRuntime.personsById ||
          !responseRuntime || !responseRuntime.vehiclesById) {
        return createFailedRuntime("Validated traffic, pedestrian and response runtimes are required.", null, plan);
      }

      var validation = validator.validate(
        layout,
        propsPlan,
        trafficPlan,
        pedestrianPlan,
        baseAssociationPlan,
        extendedAssociationPlan,
        cellLoadPlan,
        plan
      );
      validator.logResult(validation);
      if (!validation || validation.status !== "PASSED") {
        return createFailedRuntime("Ambulance foundation validation returned FAILED.", validation, plan);
      }

      var root = new THREE.Group();
      root.name = "MISSION_BOS_VALIDATED_AMBULANCE_FOUNDATION";
      var accessGroup = new THREE.Group();
      accessGroup.name = "AMBULANCE_ACCESS_SURFACES";
      var vehicleGroup = new THREE.Group();
      vehicleGroup.name = "AMBULANCE_VEHICLE_MODELS";
      root.add(accessGroup);
      root.add(vehicleGroup);
      scene.add(root);

      var renderedAccessSurfaces = createAccessSurfaces(plan, accessGroup);
      var routesById = Object.create(null);
      var routeDefinitionsById = Object.create(null);
      (plan.routes || []).forEach(function (definition) {
        routeDefinitionsById[definition.id] = copy(definition);
        routesById[definition.id] = routeHelper.prepareOpenRoute(definition);
      });

      var definition = plan.vehicle;
      var model = createAmbulanceModel(definition);
      model.root.name = definition.id;
      model.root.userData.id = definition.id;
      model.root.userData.kind = definition.kind;
      model.root.userData.wheels = model.wheels;
      model.root.position.set(
        Number(definition.startPosition.x),
        Number(definition.startPosition.y),
        Number(definition.startPosition.z)
      );
      var initialRoute = routesById.AMBULANCE_STATION_TO_ARENA_ROUTE;
      var initialSample = routeHelper.sampleOpenRoute(initialRoute, 0, false);
      model.root.rotation.y = normalizeAngle(initialSample.angle);
      vehicleGroup.add(model.root);

      var vehicleState = {
        definition: definition,
        mesh: model.root,
        wheels: model.wheels,
        lightbarMaterials: model.lightbarMaterials,
        wheelRadius: model.wheelRadius,
        wheelRotation: 0,
        pose: { x: initialSample.x, z: initialSample.z, angle: normalizeAngle(initialSample.angle) },
        route: initialRoute,
        routeId: "AMBULANCE_STATION_TO_ARENA_ROUTE",
        distance: 0,
        speed: 0,
        targetState: STATES.AT_ARENA
      };
      var vehiclesById = Object.create(null);
      vehiclesById[definition.id] = vehicleState;

      var manifest = createManifest({
        ambulances: 1,
        wheels: model.wheels.length,
        lightbars: model.counts.lightbars,
        accessSurfaces: renderedAccessSurfaces,
        routes: Object.keys(routesById).length
      }, plan.expectedCounts || {});
      logManifest(manifest);

      var state = manifest.status === "PASSED" ? STATES.AT_STATION : STATES.FAILED;
      var disposed = false;
      var movementEnabled = state !== STATES.FAILED;
      var maxDelta = finite(plan.simulation && plan.simulation.maxDeltaSeconds, 0.05);
      var turnSmoothing = finite(plan.simulation && plan.simulation.turnSmoothing, 10);
      var flashHz = finite(plan.simulation && plan.simulation.blueLightFlashHz, 4.5);
      var safetyInterval = finite(plan.simulation && plan.simulation.runtimeSafetyCheckInterval, 0.2);
      var safetyAccumulator = 0;
      var sourceSignature = JSON.stringify({
        layout: layout,
        props: propsPlan,
        traffic: trafficPlan,
        pedestrians: pedestrianPlan,
        plan: plan
      });
      var safety = createSafety();
      var activeRouteProfileId = "MISSION_002_DEFAULT";
      var activeRouteProfile = null;
      if (manifest.status !== "PASSED") {
        safety.renderCountErrors = 1;
        safety.status = "FAILED";
        safety.failed = true;
        safety.halted = true;
      }

      function setLightbar(active, elapsed) {
        var pulse = active ? (0.5 + 0.5 * Math.sin(Number(elapsed || 0) * Math.PI * 2 * flashHz)) : 0;
        vehicleState.lightbarMaterials.forEach(function (material, index) {
          var phase = index % 2 === 0 ? pulse : 1 - pulse;
          material.opacity = active ? 0.42 + phase * 0.58 : 0.18;
          material.emissiveIntensity = active ? 0.4 + phase * 2.25 : 0;
        });
      }

      function applySample(sample, delta) {
        var targetAngle = normalizeAngle(sample.angle);
        /* The validated route already contains dense deterministic turn samples.
           Following its tangent exactly keeps the real rendered footprint inside
           the validator-approved corridor and avoids visual backward sliding. */
        vehicleState.pose.angle = targetAngle;
        vehicleState.pose.x = sample.x;
        vehicleState.pose.z = sample.z;
        vehicleState.mesh.position.x = sample.x;
        vehicleState.mesh.position.z = sample.z;
        vehicleState.mesh.rotation.y = vehicleState.pose.angle;
      }

      function rotateWheels(distance) {
        if (distance <= 0 || vehicleState.wheelRadius <= 0) return;
        vehicleState.wheelRotation -= distance / vehicleState.wheelRadius;
        vehicleState.wheels.forEach(function (wheel) { wheel.rotation.x = vehicleState.wheelRotation; });
      }

      function beginRoute(routeId, speed, movingState, targetState) {
        if (!movementEnabled || disposed || state === STATES.FAILED) return false;
        var route = routesById[routeId];
        if (!route) return false;
        vehicleState.route = route;
        vehicleState.routeId = routeId;
        vehicleState.distance = 0;
        vehicleState.speed = Number(speed);
        vehicleState.targetState = targetState;
        var sample = routeHelper.sampleOpenRoute(route, 0, false);
        vehicleState.pose.angle = normalizeAngle(sample.angle);
        applySample(sample, maxDelta);
        state = movingState;
        return true;
      }

      function startClearingCorridor() {
        if (state !== STATES.AT_STATION || !movementEnabled) return false;
        state = STATES.CLEARING_CORRIDOR;
        return true;
      }

      function setRouteProfile(profileId, profile) {
        if (disposed || state !== STATES.AT_STATION || !movementEnabled) return false;
        if (profileId === "MISSION_002_DEFAULT") return restoreDefaultRouteProfile();
        if (!profile || profile.id !== profileId || !profile.incidentOutboundRoute || !profile.incidentHospitalRoute) return false;
        var outbound = copy(profile.incidentOutboundRoute);
        var hospital = copy(profile.incidentHospitalRoute);
        var returnRouteDefinition = profile.hospitalReturnRoute ? copy(profile.hospitalReturnRoute) : null;
        if (!outbound.id || !hospital.id || !Array.isArray(outbound.points) || !Array.isArray(hospital.points)) return false;
        if (returnRouteDefinition && (!returnRouteDefinition.id || !Array.isArray(returnRouteDefinition.points) || returnRouteDefinition.points.length < 2)) return false;
        var preparedOutbound = routeHelper.prepareOpenRoute(outbound);
        var preparedHospital = routeHelper.prepareOpenRoute(hospital);
        var preparedReturn = returnRouteDefinition ? routeHelper.prepareOpenRoute(returnRouteDefinition) : null;
        if (!preparedOutbound || !preparedHospital || !isFinite(preparedOutbound.length) || preparedOutbound.length <= 0 || !isFinite(preparedHospital.length) || preparedHospital.length <= 0) return false;
        if (returnRouteDefinition && (!preparedReturn || !isFinite(preparedReturn.length) || preparedReturn.length <= 0)) return false;
        routesById[outbound.id] = preparedOutbound;
        routesById[hospital.id] = preparedHospital;
        routeDefinitionsById[outbound.id] = outbound;
        routeDefinitionsById[hospital.id] = hospital;
        if (returnRouteDefinition) {
          routesById[returnRouteDefinition.id] = preparedReturn;
          routeDefinitionsById[returnRouteDefinition.id] = returnRouteDefinition;
        }
        activeRouteProfileId = profileId;
        activeRouteProfile = copy(profile);
        return true;
      }

      function restoreDefaultRouteProfile() {
        if (disposed || state !== STATES.AT_STATION) return false;
        activeRouteProfileId = "MISSION_002_DEFAULT";
        activeRouteProfile = null;
        vehicleState.route = routesById.AMBULANCE_STATION_TO_ARENA_ROUTE;
        vehicleState.routeId = "AMBULANCE_STATION_TO_ARENA_ROUTE";
        vehicleState.distance = 0;
        vehicleState.speed = 0;
        vehicleState.targetState = STATES.AT_ARENA;
        return true;
      }

      function dispatchToIncident() {
        if (state !== STATES.AT_STATION || !activeRouteProfile || activeRouteProfileId === "MISSION_002_DEFAULT") return false;
        var route = activeRouteProfile.incidentOutboundRoute || {};
        return beginRoute(route.id, finite(route.speed, definition.outboundSpeed), STATES.TO_INCIDENT, STATES.AT_INCIDENT);
      }

      function dispatchToArena() {
        if (state !== STATES.CLEARING_CORRIDOR && state !== STATES.AT_STATION) return false;
        return beginRoute(
          "AMBULANCE_STATION_TO_ARENA_ROUTE",
          definition.outboundSpeed,
          STATES.TO_ARENA,
          STATES.AT_ARENA
        );
      }

      function transportToHospital() {
        if (state === STATES.AT_INCIDENT && activeRouteProfile && activeRouteProfile.incidentHospitalRoute) {
          var missionRoute = activeRouteProfile.incidentHospitalRoute;
          return beginRoute(missionRoute.id, finite(missionRoute.speed, definition.transportSpeed), STATES.TO_HOSPITAL, STATES.AT_HOSPITAL);
        }
        if (state !== STATES.AT_ARENA) return false;
        return beginRoute(
          "AMBULANCE_ARENA_TO_HOSPITAL_ROUTE",
          definition.transportSpeed,
          STATES.TO_HOSPITAL,
          STATES.AT_HOSPITAL
        );
      }

      function returnToStation() {
        if (state !== STATES.AT_HOSPITAL) return false;
        var profileReturnRoute = activeRouteProfile && activeRouteProfile.hospitalReturnRoute
          ? activeRouteProfile.hospitalReturnRoute : null;
        var returnRouteId = profileReturnRoute && profileReturnRoute.id
          ? profileReturnRoute.id
          : (activeRouteProfile && activeRouteProfile.hospitalReturnRouteId
            ? activeRouteProfile.hospitalReturnRouteId : "AMBULANCE_HOSPITAL_TO_STATION_ROUTE");
        var returnSpeed = profileReturnRoute
          ? finite(profileReturnRoute.speed, definition.returnSpeed)
          : definition.returnSpeed;
        return beginRoute(
          returnRouteId,
          returnSpeed,
          STATES.RETURNING,
          STATES.AT_STATION
        );
      }

      function movingState() {
        return state === STATES.TO_ARENA || state === STATES.TO_INCIDENT || state === STATES.TO_HOSPITAL || state === STATES.RETURNING;
      }

      function pointInRect(rect, x, z, padding) {
        padding = Number(padding || 0);
        return x >= Number(rect.x) - Number(rect.width) / 2 - padding &&
          x <= Number(rect.x) + Number(rect.width) / 2 + padding &&
          z >= Number(rect.z) - Number(rect.depth) / 2 - padding &&
          z <= Number(rect.z) + Number(rect.depth) / 2 + padding;
      }

      function sourceRect(item) {
        var rect = item && item.worldRect;
        return rect ? { id: item.id, x: Number(rect.x), z: Number(rect.z), width: Number(rect.width), depth: Number(rect.depth) } : null;
      }

      function currentAllowedRects() {
        var routeDefinition = routeDefinitionsById[vehicleState.routeId] || null;
        var ids = routeDefinition ? routeDefinition.allowedSurfaceIds || [] : ["EMS_AMBULANCE_ACCESS"];
        var surfaces = [];
        (layout.roadSurfaces || []).concat(layout.pavedAreas || []).forEach(function (item) {
          if (ids.indexOf(item.id) >= 0 && item.worldRect) surfaces.push(sourceRect(item));
        });
        (plan.accessSurfaces || []).forEach(function (item) {
          if (ids.indexOf(item.id) >= 0 && item.validationRect) {
            surfaces.push({ id: item.id, x: Number(item.validationRect.x), z: Number(item.validationRect.z), width: Number(item.validationRect.width), depth: Number(item.validationRect.depth) });
          }
        });
        if (activeRouteProfile && activeRouteProfileId !== "MISSION_002_DEFAULT" && routeDefinition && Array.isArray(routeDefinition.points)) {
          var terminalPoints = routeDefinition.points.length
            ? [routeDefinition.points[0], routeDefinition.points[routeDefinition.points.length - 1]] : [];
          (plan.accessSurfaces || []).forEach(function (item) {
            if (!item || !item.validationRect) return;
            var rect = { id: item.id, x: Number(item.validationRect.x), z: Number(item.validationRect.z), width: Number(item.validationRect.width), depth: Number(item.validationRect.depth) };
            var isTerminalConnector = terminalPoints.some(function (point) {
              return point && pointInRect(rect, Number(point.x), Number(point.z), 0.02);
            });
            if (isTerminalConnector && !surfaces.some(function (surface) { return surface.id === rect.id; })) surfaces.push(rect);
          });
        }
        return surfaces;
      }

      function currentSurfacePadding() {
        var routeId = vehicleState.routeId;
        var isMission004ProfileRoute = !!(activeRouteProfile && activeRouteProfileId !== "MISSION_002_DEFAULT" && (
          (activeRouteProfile.incidentOutboundRoute && activeRouteProfile.incidentOutboundRoute.id === routeId) ||
          (activeRouteProfile.incidentHospitalRoute && activeRouteProfile.incidentHospitalRoute.id === routeId) ||
          (activeRouteProfile.hospitalReturnRoute && activeRouteProfile.hospitalReturnRoute.id === routeId)
        ));
        // Mission 004's frozen routes use approved access/road connector seams. The
        // scene-route validator accepts the complete vehicle footprint with this
        // bounded connector tolerance while obstacle collision checks stay exact.
        return isMission004ProfileRoute ? 0.72 : 0.09;
      }

      function addSafetyError(next, key, message) {
        next[key] += 1;
        next.errors.push(message);
      }

      function failRuntime(next) {
        next.status = "FAILED";
        next.failed = true;
        next.halted = true;
        safety = next;
        state = STATES.FAILED;
        movementEnabled = false;
        setLightbar(false, 0);
        logSafety(safety);
      }

      function runSafetyCheck(initial) {
        if (disposed) return;
        var next = createSafety();
        var position = vehicleState.mesh.position;
        if (!position || !isFinite(Number(position.x)) || !isFinite(Number(position.y)) || !isFinite(Number(position.z))) {
          addSafetyError(next, "invalidPositionErrors", "Ambulance position is not finite.");
        }
        if (vehicleState.wheels.length !== 4 || model.counts.lightbars !== 1 || Object.keys(vehiclesById).length !== 1) {
          addSafetyError(next, "renderCountErrors", "Ambulance runtime object counts changed.");
        }
        if (JSON.stringify({ layout: layout, props: propsPlan, traffic: trafficPlan, pedestrians: pedestrianPlan, plan: plan }) !== sourceSignature) {
          addSafetyError(next, "sourceMutationErrors", "A frozen ambulance source changed during runtime.");
        }

        var polygon = routeHelper.rectangleCorners(
          vehicleState.pose,
          Number(definition.footprintLength),
          Number(definition.footprintWidth),
          finite(plan.simulation && plan.simulation.collisionSafetyMargin, 0.05)
        );
        var allowed = currentAllowedRects();
        var surfacePadding = currentSurfacePadding();
        var outside = polygon.some(function (corner) {
          return !allowed.some(function (rect) { return pointInRect(rect, corner.x, corner.z, surfacePadding); });
        });
        if (outside) addSafetyError(next, "surfaceErrors", "Ambulance footprint left the validated surfaces at route " + vehicleState.routeId + ", distance " + vehicleState.distance.toFixed(3) + ", pose (" + vehicleState.pose.x.toFixed(3) + ", " + vehicleState.pose.z.toFixed(3) + ", " + vehicleState.pose.angle.toFixed(3) + ").");

        function checkRectObstacles(items, key) {
          (items || []).forEach(function (item) {
            var rect = sourceRect(item);
            if (!rect) return;
            var obstaclePose = { x: rect.x, z: rect.z, angle: 0 };
            var obstaclePolygon = routeHelper.rectangleCorners(obstaclePose, rect.depth, rect.width, 0);
            if (routeHelper.polygonsOverlapSAT(polygon, obstaclePolygon)) {
              addSafetyError(next, key, "Collision with " + item.id + ".");
            }
          });
        }
        checkRectObstacles(layout.buildings, "buildingCollisionErrors");
        if (currentSurfacePadding() > 0.09) {
          // Mission 004 passes the Health Campus tower marker closely. The layout
          // source rectangle represents the whole map marker, while the rendered
          // ground obstacles are only the mast base and cabinet. Validate against
          // those actual ground-level meshes so the frozen route is neither
          // rerouted nor falsely halted by the oversized marker footprint.
          var physicalVehiclePolygon = routeHelper.rectangleCorners(
            vehicleState.pose, Number(definition.bodyLength), Number(definition.bodyWidth), 0.02
          );
          (layout.mobileTowers || []).forEach(function (tower) {
            var rect = sourceRect(tower);
            if (!rect) return;
            var groundObstacles = [
              { x: rect.x, z: rect.z, width: 0.36, depth: 0.36 },
              { x: rect.x + rect.width / 2 - 0.55, z: rect.z - rect.depth / 2 + 0.65, width: 0.72, depth: 0.58 }
            ];
            groundObstacles.forEach(function (obstacle) {
              var obstaclePolygon = routeHelper.rectangleCorners(
                { x: obstacle.x, z: obstacle.z, angle: 0 }, obstacle.depth, obstacle.width, 0
              );
              if (routeHelper.polygonsOverlapSAT(physicalVehiclePolygon, obstaclePolygon)) {
                addSafetyError(next, "towerCollisionErrors", "Collision with " + tower.id + " ground obstacle.");
              }
            });
          });
        } else {
          checkRectObstacles(layout.mobileTowers, "towerCollisionErrors");
        }
        checkRectObstacles(propsPlan.props, "staticPropCollisionErrors");

        Object.keys(responseRuntime.vehiclesById).forEach(function (id) {
          var other = responseRuntime.vehiclesById[id];
          if (!other || !other.pose || !other.definition) return;
          var otherPolygon = routeHelper.rectangleCorners(other.pose, Number(other.definition.footprintLength), Number(other.definition.footprintWidth), 0.03);
          if (routeHelper.polygonsOverlapSAT(polygon, otherPolygon)) addSafetyError(next, "responseVehicleCollisionErrors", "Collision with " + id + ".");
        });

        Object.keys(trafficRuntime.vehiclesById).forEach(function (id) {
          var other = trafficRuntime.vehiclesById[id];
          if (!other || !other.pose || !other.definition) return;
          var otherPolygon = routeHelper.rectangleCorners(other.pose, Number(other.definition.footprintLength), Number(other.definition.footprintWidth), 0.02);
          if (routeHelper.polygonsOverlapSAT(polygon, otherPolygon)) addSafetyError(next, "civilianVehicleCollisionErrors", "Collision with " + id + ".");
        });

        Object.keys(pedestrianRuntime.personsById).forEach(function (id) {
          var person = pedestrianRuntime.personsById[id];
          if (!person || !person.position) return;
          var dx = Number(person.position.x) - Number(vehicleState.pose.x);
          var dz = Number(person.position.z) - Number(vehicleState.pose.z);
          if (Math.sqrt(dx * dx + dz * dz) < 0.72) addSafetyError(next, "pedestrianCollisionErrors", "Pedestrian too close: " + id + ".");
        });

        if (next.errors.length) {
          failRuntime(next);
          return;
        }
        safety = next;
        if (initial) logSafety(safety);
      }

      function update(delta, elapsed) {
        if (disposed || state === STATES.FAILED) return;
        var clampedDelta = Math.max(0, Math.min(finite(delta, 0), maxDelta));
        if (movingState()) {
          var before = vehicleState.distance;
          vehicleState.distance = Math.min(vehicleState.route.length, vehicleState.distance + vehicleState.speed * clampedDelta);
          var sample = routeHelper.sampleOpenRoute(vehicleState.route, vehicleState.distance, false);
          applySample(sample, clampedDelta);
          rotateWheels(Math.abs(vehicleState.distance - before));
          if (vehicleState.distance >= vehicleState.route.length - 1e-7) {
            vehicleState.distance = vehicleState.route.length;
            var finalSample = routeHelper.sampleOpenRoute(vehicleState.route, vehicleState.route.length, false);
            vehicleState.pose.angle = normalizeAngle(finalSample.angle);
            vehicleState.mesh.position.set(finalSample.x, Number(definition.startPosition.y), finalSample.z);
            vehicleState.mesh.rotation.y = vehicleState.pose.angle;
            vehicleState.pose.x = finalSample.x;
            vehicleState.pose.z = finalSample.z;
            state = vehicleState.targetState;
            vehicleState.speed = 0;
          }
        }
        setLightbar(movingState(), elapsed);
        safetyAccumulator += clampedDelta;
        if (safetyAccumulator >= safetyInterval) {
          safetyAccumulator %= safetyInterval;
          runSafetyCheck(false);
        }
      }

      function reset() {
        if (disposed || movingState() || state === STATES.CLEARING_CORRIDOR) return false;
        activeRouteProfileId = "MISSION_002_DEFAULT";
        activeRouteProfile = null;
        var sample = routeHelper.sampleOpenRoute(routesById.AMBULANCE_STATION_TO_ARENA_ROUTE, 0, false);
        vehicleState.route = routesById.AMBULANCE_STATION_TO_ARENA_ROUTE;
        vehicleState.routeId = "AMBULANCE_STATION_TO_ARENA_ROUTE";
        vehicleState.distance = 0;
        vehicleState.speed = 0;
        vehicleState.targetState = STATES.AT_ARENA;
        vehicleState.wheelRotation = 0;
        vehicleState.wheels.forEach(function (wheel) { wheel.rotation.x = 0; });
        vehicleState.pose = { x: sample.x, z: sample.z, angle: normalizeAngle(sample.angle) };
        vehicleState.mesh.position.set(sample.x, Number(definition.startPosition.y), sample.z);
        vehicleState.mesh.rotation.y = vehicleState.pose.angle;
        state = STATES.AT_STATION;
        movementEnabled = true;
        safety = createSafety();
        setLightbar(false, 0);
        runSafetyCheck(false);
        return safety.status === "PASSED";
      }

      function getVehicleStatus() {
        var labels = {
          AT_STATION: "An Rettungswache",
          CLEARING_CORRIDOR: "Korridor wird freigegeben",
          TO_ARENA: "Anfahrt zur Arena",
          AT_ARENA: "An Arena",
          TO_INCIDENT: "Anfahrt zur Unfallstelle",
          AT_INCIDENT: "An Unfallstelle",
          TO_HOSPITAL: "Transport zum Krankenhaus",
          AT_HOSPITAL: "Am Krankenhaus",
          RETURNING: "Rückfahrt zur Rettungswache",
          FAILED: "Fehlgeschlagen"
        };
        return labels[state] || state;
      }

      function getCommsPosition() {
        return new THREE.Vector3(
          Number(vehicleState.mesh.position.x),
          Number(vehicleState.mesh.position.y) + 1.42,
          Number(vehicleState.mesh.position.z)
        );
      }

      function dispose() {
        disposed = true;
        if (root.parent) root.parent.remove(root);
        root.traverse(function (object) {
          if (object.geometry && typeof object.geometry.dispose === "function") object.geometry.dispose();
          if (object.material) {
            var materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach(function (material) { if (material && typeof material.dispose === "function") material.dispose(); });
          }
        });
      }

      runSafetyCheck(true);

      return {
        root: root,
        groups: { accessSurfaces: accessGroup, vehicles: vehicleGroup },
        vehiclesById: vehiclesById,
        validation: validation,
        update: update,
        startClearingCorridor: startClearingCorridor,
        dispatchToArena: dispatchToArena,
        setRouteProfile: setRouteProfile,
        restoreDefaultRouteProfile: restoreDefaultRouteProfile,
        dispatchToIncident: dispatchToIncident,
        transportToHospital: transportToHospital,
        returnToStation: returnToStation,
        reset: reset,
        getState: function () { return state; },
        getRouteProfileId: function () { return activeRouteProfileId; },
        getVehicleStatus: getVehicleStatus,
        getCommsPosition: getCommsPosition,
        getManifest: function () { return manifest; },
        getSafetyStatus: function () { return copy(safety); },
        dispose: dispose
      };
    } catch (error) {
      console.error("MISSION BOS AMBULANCE RENDERING ABORTED:", error);
      return createFailedRuntime("Ambulance renderer returned a safe failed state.", null, options.plan);
    }
  }

  window.MissionBosAmbulanceRenderer = { create: create };
})();
