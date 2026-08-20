/* Mission BOS - Build 012M.2
   Municipal utility-service vehicle with validated Mission 003 route mode and
   world-occluded amber beacon visibility polish.
*/
(function () {
  "use strict";

  var POSITION_EPSILON = 1e-9;
  var SAFETY_INTERVAL_SECONDS = 0.5;

  function finite(value, fallback) {
    value = Number(value);
    return isFinite(value) ? value : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function rectBounds(rect) {
    if (!rect) return null;
    return {
      minX: Number(rect.x) - Number(rect.width) / 2,
      maxX: Number(rect.x) + Number(rect.width) / 2,
      minZ: Number(rect.z) - Number(rect.depth) / 2,
      maxZ: Number(rect.z) + Number(rect.depth) / 2
    };
  }

  function overlaps(a, b) {
    return !!a && !!b &&
      a.minX < b.maxX && a.maxX > b.minX &&
      a.minZ < b.maxZ && a.maxZ > b.minZ;
  }

  function pointInsideRect(point, rect) {
    return point && rect &&
      Number(point.x) >= rect.minX && Number(point.x) <= rect.maxX &&
      Number(point.z) >= rect.minZ && Number(point.z) <= rect.maxZ;
  }

  function segmentIntersectsRect(a, b, rect) {
    if (!a || !b || !rect) return false;
    if (pointInsideRect(a, rect) || pointInsideRect(b, rect)) return true;

    var x0 = Number(a.x), z0 = Number(a.z);
    var dx = Number(b.x) - x0, dz = Number(b.z) - z0;
    var t0 = 0, t1 = 1;
    var p = [-dx, dx, -dz, dz];
    var q = [x0 - rect.minX, rect.maxX - x0, z0 - rect.minZ, rect.maxZ - z0];

    for (var i = 0; i < 4; i += 1) {
      if (Math.abs(p[i]) < POSITION_EPSILON) {
        if (q[i] < 0) return false;
      } else {
        var r = q[i] / p[i];
        if (p[i] < 0) {
          if (r > t1) return false;
          if (r > t0) t0 = r;
        } else {
          if (r < t0) return false;
          if (r < t1) t1 = r;
        }
      }
    }
    return true;
  }

  function createFailedResult(message) {
    var root = typeof THREE !== "undefined" ? new THREE.Group() : null;
    if (root) root.visible = false;
    var manifest = {
      title: "MISSION BOS STADTWERKE VEHICLE 012M.2 RENDER MANIFEST",
      vehicles: 0,
      wheels: 0,
      sideLabels: 0,
      amberBeacons: 0,
      amberBeaconHalos: 0,
      blueBeaconObjects: 0,
      routes: 0,
      mission003RouteProfiles: 0,
      networkEndpoints: 0,
      missionRegistrations: 0,
      status: "FAILED"
    };
    var safety = {
      title: "MISSION BOS STADTWERKE VEHICLE 012M.2 RUNTIME SAFETY",
      vehicleErrors: 1,
      positionErrors: 0,
      parkingErrors: 0,
      buildingOverlapErrors: 0,
      roadOverlapErrors: 0,
      routeOverlapErrors: 0,
      renderCountErrors: 0,
      sourceMutationErrors: 0,
      movementErrors: 0,
      networkRegistrationErrors: 0,
      missionRegistrationErrors: 0,
      beaconPolishErrors: 0,
      status: "FAILED",
      errors: [message]
    };
    console.error(message);
    return {
      root: root,
      vehiclesById: Object.create(null),
      update: function () {},
      getVehicleCount: function () { return 0; },
      prepareMission003: function () { return false; },
      dispatchMission003: function () { return false; },
      returnMission003ToBase: function () { return false; },
      resetMission003: function () { return false; },
      getState: function () { return "FAILED"; },
      isAtScene: function () { return false; },
      isAtBase: function () { return false; },
      getCommsPosition: function () { return null; },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: function () { if (root && root.parent) root.parent.remove(root); }
    };
  }

  function createLabelTexture(text, accentColor) {
    var canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = accentColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(255,255,255,0.72)";
    context.lineWidth = 7;
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    context.fillStyle = "#FFFFFF";
    context.font = "bold 62px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 3);
    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    if (typeof THREE.SRGBColorSpace !== "undefined") texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  function create(options) {
    options = options || {};
    if (typeof THREE === "undefined") return createFailedResult("Three.js is unavailable for the Stadtwerke vehicle.");

    var scene = options.scene;
    var layout = options.layout;
    var plan = options.plan || window.MISSION_BOS_MISSION_003_STADTWERKE_FOUNDATION_PLAN;
    var responsePlan = options.responsePlan || null;
    var incidentPlan = options.incidentPlan || null;
    var mission003ResponsePlan = options.mission003ResponsePlan || window.MISSION_BOS_MISSION_003_RESPONSE_PLAN || null;
    var beaconPolishPlan = options.beaconPolishPlan || window.MISSION_BOS_STADTWERKE_BEACON_POLISH_PLAN || null;
    if (!scene || !layout || !plan || !plan.vehicle) {
      return createFailedResult("Stadtwerke vehicle dependencies are incomplete.");
    }

    var definition = plan.vehicle;
    var dimensions = definition.dimensions || {};
    var colors = definition.colors || {};
    var beaconPolish = beaconPolishPlan && beaconPolishPlan.beacon ? beaconPolishPlan.beacon : {};
    var haloPolish = beaconPolishPlan && beaconPolishPlan.halo ? beaconPolishPlan.halo : {};
    var resources = [];
    var textures = [];
    var root = new THREE.Group();
    root.name = "MISSION_BOS_STADTWERKE_VEHICLE_011N4";
    root.position.set(
      finite(definition.position && definition.position.x, 0),
      finite(definition.position && definition.position.y, 0),
      finite(definition.position && definition.position.z, 0)
    );
    root.rotation.y = finite(definition.rotationY, 0);
    root.userData.vehicleId = definition.id;
    root.userData.role = definition.role;
    root.userData.state = "PARKED";

    function material(parameters) {
      var value = new THREE.MeshStandardMaterial(parameters);
      resources.push(value);
      return value;
    }

    function geometry(value) {
      resources.push(value);
      return value;
    }

    function addBox(name, size, position, mat, parent) {
      var mesh = new THREE.Mesh(
        geometry(new THREE.BoxGeometry(size.x, size.y, size.z)),
        mat
      );
      mesh.name = name;
      mesh.position.set(position.x, position.y, position.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      (parent || root).add(mesh);
      return mesh;
    }

    var bodyMaterial = material({ color: colors.body || "#F7F7F7", roughness: 0.42, metalness: 0.05 });
    var accentMaterial = material({ color: colors.accent || "#0086A8", roughness: 0.38, metalness: 0.06 });
    var darkMaterial = material({ color: colors.dark || "#26313A", roughness: 0.62, metalness: 0.04 });
    var glassMaterial = material({ color: colors.glass || "#1B2A38", roughness: 0.16, transparent: true, opacity: 0.88 });
    var tireMaterial = material({ color: colors.tire || "#171A1F", roughness: 0.88, metalness: 0.01 });
    var rimMaterial = material({ color: colors.rim || "#B7C0C8", roughness: 0.36, metalness: 0.46 });
    var beaconColor = beaconPolish.color || "#FFB000";
    var beaconMaterial = material({
      color: beaconColor,
      emissive: beaconColor,
      emissiveIntensity: finite(beaconPolish.inactiveEmissiveIntensity, 0.45),
      transparent: true,
      opacity: 0.90,
      roughness: 0.20,
      depthTest: true,
      depthWrite: false
    });
    var beaconHaloMaterial = material({
      color: haloPolish.color || "#FFC247",
      transparent: true,
      opacity: finite(haloPolish.inactiveOpacity, 0.04),
      depthTest: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    var lightMaterial = material({ color: "#FFF4C8", emissive: "#FFD66E", emissiveIntensity: 0.7, roughness: 0.28 });
    var tailMaterial = material({ color: "#B9232D", emissive: "#6E1117", emissiveIntensity: 0.65, roughness: 0.34 });

    var length = finite(dimensions.length, 4.4);
    var width = finite(dimensions.width, 1.85);
    var height = finite(dimensions.height, 2.05);

    addBox(definition.id + "_LOWER_BODY", { x: width, y: 0.68, z: length }, { x: 0, y: 0.68, z: 0 }, bodyMaterial);
    addBox(definition.id + "_DARK_CHASSIS", { x: width * 0.96, y: 0.18, z: length * 0.94 }, { x: 0, y: 0.28, z: 0 }, darkMaterial);
    addBox(definition.id + "_SERVICE_BODY", { x: width * 0.96, y: 1.12, z: length * 0.62 }, { x: 0, y: 1.51, z: -0.58 }, bodyMaterial);
    addBox(definition.id + "_CABIN", { x: width * 0.94, y: 0.96, z: length * 0.32 }, { x: 0, y: 1.42, z: 1.28 }, bodyMaterial);

    addBox(definition.id + "_WINDSHIELD", { x: width * 0.76, y: 0.52, z: 0.035 }, { x: 0, y: 1.57, z: length / 2 + 0.019 }, glassMaterial);
    addBox(definition.id + "_REAR_WINDOW", { x: width * 0.58, y: 0.42, z: 0.035 }, { x: 0, y: 1.53, z: -length / 2 - 0.019 }, glassMaterial);

    [-1, 1].forEach(function (side) {
      addBox(
        definition.id + "_SIDE_WINDOW_" + (side < 0 ? "L" : "R"),
        { x: 0.03, y: 0.45, z: length * 0.22 },
        { x: side * (width / 2 + 0.016), y: 1.58, z: 1.24 },
        glassMaterial
      );
      addBox(
        definition.id + "_ACCENT_STRIPE_" + (side < 0 ? "L" : "R"),
        { x: 0.032, y: 0.22, z: length * 0.86 },
        { x: side * (width / 2 + 0.018), y: 0.88, z: -0.05 },
        accentMaterial
      );
    });

    addBox(definition.id + "_FRONT_BUMPER", { x: width * 0.92, y: 0.22, z: 0.16 }, { x: 0, y: 0.46, z: length / 2 + 0.08 }, darkMaterial);
    addBox(definition.id + "_REAR_BUMPER", { x: width * 0.92, y: 0.22, z: 0.16 }, { x: 0, y: 0.46, z: -length / 2 - 0.08 }, darkMaterial);

    [-1, 1].forEach(function (side) {
      addBox(definition.id + "_HEADLIGHT_" + (side < 0 ? "L" : "R"), { x: 0.32, y: 0.16, z: 0.05 }, { x: side * width * 0.28, y: 0.74, z: length / 2 + 0.031 }, lightMaterial);
      addBox(definition.id + "_TAILLIGHT_" + (side < 0 ? "L" : "R"), { x: 0.25, y: 0.18, z: 0.05 }, { x: side * width * 0.31, y: 0.73, z: -length / 2 - 0.031 }, tailMaterial);
    });

    var wheels = [];
    var wheelRadius = 0.30;
    var wheelThickness = 0.12;
    var wheelX = 0.91;
    var axleZ = 1.48;
    [-1, 1].forEach(function (side) {
      [-1, 1].forEach(function (axle) {
        var holder = new THREE.Group();
        holder.name = definition.id + "_WHEEL_" + (side < 0 ? "L" : "R") + (axle < 0 ? "R" : "F");
        holder.position.set(side * wheelX, 0.30, axle * axleZ);
        var tire = new THREE.Mesh(geometry(new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 20)), tireMaterial);
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        holder.add(tire);
        var rim = new THREE.Mesh(geometry(new THREE.CylinderGeometry(wheelRadius * 0.45, wheelRadius * 0.45, wheelThickness + 0.008, 16)), rimMaterial);
        rim.rotation.z = Math.PI / 2;
        holder.add(rim);
        root.add(holder);
        wheels.push(holder);
      });
    });

    var roofRack = new THREE.Group();
    roofRack.name = definition.id + "_ROOF_RACK";
    roofRack.position.set(0, 2.08, -0.55);
    [-1, 1].forEach(function (side) {
      addBox(definition.id + "_ROOF_RAIL_" + side, { x: 0.055, y: 0.055, z: 2.25 }, { x: side * 0.57, y: 0, z: 0 }, darkMaterial, roofRack);
    });
    [-0.75, 0, 0.75].forEach(function (z, index) {
      addBox(definition.id + "_ROOF_CROSSBAR_" + index, { x: 1.20, y: 0.045, z: 0.055 }, { x: 0, y: 0.015, z: z }, darkMaterial, roofRack);
    });
    root.add(roofRack);

    var beaconBase = addBox(definition.id + "_AMBER_BEACON_BASE", { x: 0.38, y: 0.08, z: 0.30 }, { x: 0, y: 2.12, z: -0.15 }, darkMaterial);
    beaconBase.castShadow = false;
    var beaconRadiusTop = Math.min(0.16, finite(beaconPolish.maximumLensRadius, 0.20));
    var beaconRadiusBottom = Math.min(0.19, finite(beaconPolish.maximumLensRadius, 0.20));
    var beaconHeight = Math.min(0.25, finite(beaconPolish.maximumLensHeight, 0.30));
    var beacon = new THREE.Mesh(geometry(new THREE.CylinderGeometry(beaconRadiusTop, beaconRadiusBottom, beaconHeight, 20)), beaconMaterial);
    beacon.name = definition.id + "_AMBER_BEACON";
    beacon.position.set(0, 2.29, -0.15);
    beacon.castShadow = true;
    beacon.renderOrder = 16;
    root.add(beacon);

    var haloRadius = Math.min(0.26, finite(haloPolish.maximumRadius, 0.30));
    var beaconHalo = new THREE.Mesh(geometry(new THREE.SphereGeometry(haloRadius, 16, 10)), beaconHaloMaterial);
    beaconHalo.name = definition.id + "_AMBER_BEACON_HALO";
    beaconHalo.position.copy(beacon.position);
    beaconHalo.scale.set(1, 0.72, 1);
    beaconHalo.castShadow = false;
    beaconHalo.receiveShadow = false;
    beaconHalo.frustumCulled = false;
    beaconHalo.renderOrder = 15;
    root.add(beaconHalo);

    var labelTexture = createLabelTexture((definition.markings || {}).sideText || "STADTWERKE", colors.accent || "#0086A8");
    textures.push(labelTexture);
    var labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    resources.push(labelMaterial);
    var sideLabels = [];
    [-1, 1].forEach(function (side) {
      var label = new THREE.Mesh(geometry(new THREE.PlaneGeometry(2.18, 0.54)), labelMaterial);
      label.name = definition.id + "_SIDE_LABEL_" + (side < 0 ? "L" : "R");
      label.position.set(side * (width / 2 + 0.023), 1.53, -0.58);
      label.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      label.renderOrder = 12;
      label.frustumCulled = false;
      root.add(label);
      sideLabels.push(label);
    });

    var commsAnchor = new THREE.Object3D();
    commsAnchor.name = definition.id + "_FUTURE_COMMS_ANCHOR";
    commsAnchor.position.set(0, Math.max(height + 0.48, 2.55), 0);
    root.add(commsAnchor);

    scene.add(root);

    var routeDefinition = null;
    if (mission003ResponsePlan && mission003ResponsePlan.routeProfile && Array.isArray(mission003ResponsePlan.routeProfile.vehicles)) {
      mission003ResponsePlan.routeProfile.vehicles.forEach(function (candidate) {
        if (candidate && candidate.vehicleId === definition.id) routeDefinition = candidate;
      });
    }
    var routePoints = routeDefinition && Array.isArray(routeDefinition.routeWaypoints)
      ? routeDefinition.routeWaypoints.map(function (point) { return { x: Number(point.x), z: Number(point.z) }; }) : [];
    var routeSegments = [];
    var routeLength = 0;
    for (var routeIndex = 1; routeIndex < routePoints.length; routeIndex += 1) {
      var routeA = routePoints[routeIndex - 1], routeB = routePoints[routeIndex];
      var routeDx = routeB.x - routeA.x, routeDz = routeB.z - routeA.z;
      var routeSegmentLength = Math.sqrt(routeDx * routeDx + routeDz * routeDz);
      routeSegments.push({ start: routeA, end: routeB, startDistance: routeLength, length: routeSegmentLength });
      routeLength += routeSegmentLength;
    }
    function sampleRoute(distance, returning) {
      if (!routeSegments.length) return { x: root.position.x, z: root.position.z, angle: root.rotation.y };
      distance = Math.max(0, Math.min(routeLength, Number(distance) || 0));
      var segment = routeSegments[routeSegments.length - 1];
      for (var si = 0; si < routeSegments.length; si += 1) {
        if (distance <= routeSegments[si].startDistance + routeSegments[si].length + 1e-9) { segment = routeSegments[si]; break; }
      }
      var local = segment.length > 1e-9 ? (distance - segment.startDistance) / segment.length : 0;
      local = Math.max(0, Math.min(1, local));
      var dx = segment.end.x - segment.start.x, dz = segment.end.z - segment.start.z;
      return { x: segment.start.x + dx * local, z: segment.start.z + dz * local,
        angle: Math.atan2(returning ? -dx : dx, returning ? -dz : dz) };
    }

    var vehiclesById = Object.create(null);
    vehiclesById[definition.id] = {
      id: definition.id,
      root: root,
      position: root.position,
      rotationY: root.rotation.y,
      state: "PARKED",
      phase: "PARKED",
      distance: 0
    };

    var parkingArea = null;
    (layout.parkingAreas || []).forEach(function (area) {
      if (area && area.id === plan.parkingAreaId) parkingArea = area;
    });
    var buildingB06 = null;
    (layout.buildings || []).forEach(function (building) {
      if (building && building.id === "B06") buildingB06 = building;
    });
    var ringSouth = null;
    (layout.roadSurfaces || []).forEach(function (road) {
      if (road && road.id === "RING_SOUTH") ringSouth = road;
    });

    var sourceSignature = JSON.stringify({
      plan: plan,
      parkingArea: parkingArea,
      buildingB06: buildingB06,
      ringSouth: ringSouth,
      responseRoutes: responsePlan && responsePlan.routes,
      incidentRoutes: incidentPlan && incidentPlan.routes
    });
    var expectedTransform = {
      x: root.position.x,
      y: root.position.y,
      z: root.position.z,
      rotationY: root.rotation.y
    };
    var disposed = false;
    var safetyAccumulator = 0;
    var mission003State = "PARKED";
    var mission003Distance = 0;
    var mission003DispatchElapsed = 0;
    var mission003ReturnElapsed = 0;
    var amberActive = false;
    var wheelRotation = 0;
    var manifest = {
      title: "MISSION BOS STADTWERKE VEHICLE 012M.2 RENDER MANIFEST",
      vehicles: 1,
      wheels: wheels.length,
      sideLabels: sideLabels.length,
      amberBeacons: 1,
      amberBeaconHalos: 1,
      blueBeaconObjects: 0,
      routes: 0,
      mission003RouteProfiles: routeDefinition && routePoints.length >= 2 ? 1 : 0,
      networkEndpoints: 0,
      missionRegistrations: 0,
      status: "PASSED"
    };
    manifest.status = manifest.vehicles === 1 && manifest.wheels === 4 &&
      manifest.sideLabels === 2 && manifest.amberBeacons === 1 &&
      manifest.amberBeaconHalos === 1 && manifest.blueBeaconObjects === 0 &&
      manifest.routes === 0 && manifest.networkEndpoints === 0 &&
      manifest.missionRegistrations === 0 ? "PASSED" : "FAILED";

    var safety = null;

    function addError(result, key, message) {
      result[key] += 1;
      result.errors.push(message);
    }

    function vehicleFootprint() {
      var halfX = finite(dimensions.footprintLength, 4.60) / 2;
      var halfZ = finite(dimensions.footprintWidth, 1.95) / 2;
      return {
        minX: expectedTransform.x - halfX,
        maxX: expectedTransform.x + halfX,
        minZ: expectedTransform.z - halfZ,
        maxZ: expectedTransform.z + halfZ
      };
    }

    function routeIntersectsFootprint(routePlan, footprint) {
      var routes = routePlan && Array.isArray(routePlan.routes) ? routePlan.routes : [];
      for (var r = 0; r < routes.length; r += 1) {
        var points = routes[r] && Array.isArray(routes[r].points) ? routes[r].points : [];
        for (var p = 1; p < points.length; p += 1) {
          if (segmentIntersectsRect(points[p - 1], points[p], footprint)) return true;
        }
      }
      return false;
    }

    function currentTransformMatches() {
      return Math.abs(root.position.x - expectedTransform.x) <= POSITION_EPSILON &&
        Math.abs(root.position.y - expectedTransform.y) <= POSITION_EPSILON &&
        Math.abs(root.position.z - expectedTransform.z) <= POSITION_EPSILON &&
        Math.abs(root.rotation.y - expectedTransform.rotationY) <= POSITION_EPSILON;
    }

    function runSafety(initial) {
      var result = {
        title: "MISSION BOS STADTWERKE VEHICLE 012M.2 RUNTIME SAFETY",
        vehicleErrors: 0,
        positionErrors: 0,
        parkingErrors: 0,
        buildingOverlapErrors: 0,
        roadOverlapErrors: 0,
        routeOverlapErrors: 0,
        renderCountErrors: 0,
        sourceMutationErrors: 0,
        movementErrors: 0,
        networkRegistrationErrors: 0,
        missionRegistrationErrors: 0,
        beaconPolishErrors: 0,
        status: "PASSED",
        errors: []
      };
      var footprint = vehicleFootprint();
      var parkingBounds = parkingArea && parkingArea.worldRect ? rectBounds(parkingArea.worldRect) : null;
      var buildingBounds = buildingB06 && buildingB06.worldRect ? rectBounds(buildingB06.worldRect) : null;
      var roadBounds = ringSouth && ringSouth.worldRect ? rectBounds(ringSouth.worldRect) : null;

      if (!vehiclesById.STADTWERKE_01 || vehiclesById.STADTWERKE_01.root !== root) {
        addError(result, "vehicleErrors", "STADTWERKE_01 is unavailable.");
      }
      if (!isFinite(root.position.x) || !isFinite(root.position.y) || !isFinite(root.position.z)) {
        addError(result, "positionErrors", "Vehicle position is not finite.");
      }
      if (!parkingBounds || footprint.minX < parkingBounds.minX || footprint.maxX > parkingBounds.maxX ||
          footprint.minZ < parkingBounds.minZ || footprint.maxZ > parkingBounds.maxZ) {
        addError(result, "parkingErrors", "Vehicle footprint is outside B06_READY_AREA.");
      }
      if (overlaps(footprint, buildingBounds)) {
        addError(result, "buildingOverlapErrors", "Vehicle overlaps building B06.");
      }
      if (overlaps(footprint, roadBounds)) {
        addError(result, "roadOverlapErrors", "Vehicle overlaps RING_SOUTH.");
      }
      if (routeIntersectsFootprint(responsePlan, footprint) || routeIntersectsFootprint(incidentPlan, footprint)) {
        addError(result, "routeOverlapErrors", "Vehicle intersects a protected response route.");
      }
      if (wheels.length !== 4 || sideLabels.length !== 2 || root.children.indexOf(beacon) < 0 ||
          root.children.indexOf(beaconHalo) < 0) {
        addError(result, "renderCountErrors", "Vehicle render counts changed.");
      }
      if (!beaconPolishPlan || beaconMaterial.depthTest !== true || beaconMaterial.depthWrite !== false ||
          beaconHaloMaterial.depthTest !== true || beaconHaloMaterial.depthWrite !== false ||
          beacon.geometry.parameters.radiusTop > finite(beaconPolish.maximumLensRadius, 0.20) + 1e-9 ||
          beacon.geometry.parameters.radiusBottom > finite(beaconPolish.maximumLensRadius, 0.20) + 1e-9 ||
          beacon.geometry.parameters.height > finite(beaconPolish.maximumLensHeight, 0.30) + 1e-9 ||
          beaconHalo.geometry.parameters.radius > finite(haloPolish.maximumRadius, 0.30) + 1e-9) {
        addError(result, "beaconPolishErrors", "Stadtwerke beacon polish contract is invalid.");
      }
      if (JSON.stringify({
        plan: plan,
        parkingArea: parkingArea,
        buildingB06: buildingB06,
        ringSouth: ringSouth,
        responseRoutes: responsePlan && responsePlan.routes,
        incidentRoutes: incidentPlan && incidentPlan.routes
      }) !== sourceSignature) {
        addError(result, "sourceMutationErrors", "Source plan or layout data was mutated.");
      }
      if (mission003State === "PARKED" && !currentTransformMatches()) {
        addError(result, "movementErrors", "STADTWERKE_01 moved from its approved parked transform outside Mission 003.");
      }
      if (mission003State !== "PARKED" && (!routeDefinition || routeLength <= 0 || !isFinite(mission003Distance))) {
        addError(result, "movementErrors", "Mission 003 utility route state is invalid.");
      }
      if (manifest.networkEndpoints !== 0) {
        addError(result, "networkRegistrationErrors", "Unexpected Stadtwerke network registration.");
      }
      if (manifest.missionRegistrations !== 0) {
        addError(result, "missionRegistrationErrors", "Unexpected Mission 003 registration.");
      }
      if (result.errors.length) result.status = "FAILED";
      safety = result;
      if (initial || result.status === "FAILED") logResult(result);
    }

    function logResult(result) {
      var method = result.status === "PASSED" ? "log" : "error";
      console.group(result.title);
      if (Object.prototype.hasOwnProperty.call(result, "vehicles")) {
        console[method]("Vehicles: " + result.vehicles + " / 1");
        console[method]("Wheels: " + result.wheels + " / 4");
        console[method]("Side labels: " + result.sideLabels + " / 2");
        console[method]("Amber beacons / halos: " + result.amberBeacons + " / " + result.amberBeaconHalos + " / 1 / 1");
        console[method]("Routes / network / missions: " + result.routes + " / " + result.networkEndpoints + " / " + result.missionRegistrations);
      } else {
        [
          "vehicleErrors", "positionErrors", "parkingErrors", "buildingOverlapErrors",
          "roadOverlapErrors", "routeOverlapErrors", "renderCountErrors",
          "sourceMutationErrors", "movementErrors", "networkRegistrationErrors",
          "missionRegistrationErrors", "beaconPolishErrors"
        ].forEach(function (key) { console[method](key + ": " + Number(result[key] || 0)); });
      }
      console[method]("STATUS: " + result.status);
      if (result.errors && result.errors.length) console.error(result.errors);
      console.groupEnd();
    }

    function setAmber(active, elapsed) {
      amberActive = active === true;
      var cycles = finite(beaconPolish.pulseCyclesPerSecond, 1.5);
      var pulse = amberActive ? 0.5 + 0.5 * Math.sin((Number(elapsed) || 0) * Math.PI * 2 * cycles) : 0;
      if (amberActive) {
        beaconMaterial.opacity = THREE.MathUtils.lerp(
          finite(beaconPolish.activeOpacityMinimum, 0.82),
          finite(beaconPolish.activeOpacityMaximum, 1.0),
          pulse
        );
        beaconMaterial.emissiveIntensity = THREE.MathUtils.lerp(
          finite(beaconPolish.activeEmissiveMinimum, 1.15),
          finite(beaconPolish.activeEmissiveMaximum, 2.35),
          pulse
        );
        beaconHaloMaterial.opacity = THREE.MathUtils.lerp(
          finite(haloPolish.activeOpacityMinimum, 0.10),
          finite(haloPolish.activeOpacityMaximum, 0.30),
          pulse
        );
      } else {
        beaconMaterial.opacity = 0.90;
        beaconMaterial.emissiveIntensity = finite(beaconPolish.inactiveEmissiveIntensity, 0.45);
        beaconHaloMaterial.opacity = finite(haloPolish.inactiveOpacity, 0.04);
      }
    }

    function applyMission003Pose(sample, traveled) {
      root.position.x = sample.x;
      root.position.z = sample.z;
      root.rotation.y = sample.angle;
      if (traveled > 0) {
        wheelRotation -= traveled / wheelRadius;
        wheels.forEach(function (wheel) { wheel.rotation.x = wheelRotation; });
      }
      vehiclesById[definition.id].state = mission003State;
      vehiclesById[definition.id].phase = mission003State;
      vehiclesById[definition.id].distance = mission003Distance;
      vehiclesById[definition.id].rotationY = root.rotation.y;
    }

    function prepareMission003() {
      if (disposed || mission003State !== "PARKED" || !routeDefinition || routeLength <= 0 || !currentTransformMatches()) return false;
      mission003State = "PREPARED";
      mission003Distance = 0;
      mission003DispatchElapsed = 0;
      mission003ReturnElapsed = 0;
      setAmber(true, 0);
      vehiclesById[definition.id].state = mission003State;
      return true;
    }

    function dispatchMission003() {
      if (disposed || mission003State !== "PREPARED") return false;
      mission003State = finite(routeDefinition.dispatchDelaySeconds, 0) > 0 ? "WAITING" : "ENROUTE";
      mission003DispatchElapsed = 0;
      vehiclesById[definition.id].state = mission003State;
      return true;
    }

    function returnMission003ToBase() {
      if (disposed || mission003State !== "AT_SCENE") return false;
      mission003State = finite(routeDefinition.returnDelaySeconds, 0) > 0 ? "RETURN_WAITING" : "RETURNING";
      mission003ReturnElapsed = 0;
      vehiclesById[definition.id].state = mission003State;
      return true;
    }

    function resetMission003() {
      if (disposed || mission003State !== "PARKED") return false;
      mission003Distance = 0;
      mission003DispatchElapsed = 0;
      mission003ReturnElapsed = 0;
      root.position.set(expectedTransform.x, expectedTransform.y, expectedTransform.z);
      root.rotation.y = expectedTransform.rotationY;
      wheelRotation = 0;
      wheels.forEach(function (wheel) { wheel.rotation.x = 0; });
      setAmber(false, 0);
      vehiclesById[definition.id].state = "PARKED";
      vehiclesById[definition.id].phase = "PARKED";
      vehiclesById[definition.id].distance = 0;
      return true;
    }

    function update(delta, elapsed) {
      if (disposed) return;
      var step = Math.max(0, Math.min(finite(delta, 0), 0.05));
      var priorDistance = mission003Distance;
      if (mission003State === "WAITING") {
        mission003DispatchElapsed += step;
        if (mission003DispatchElapsed >= finite(routeDefinition.dispatchDelaySeconds, 0)) mission003State = "ENROUTE";
      }
      if (mission003State === "ENROUTE") {
        mission003Distance = Math.min(routeLength, mission003Distance + finite(routeDefinition.outboundSpeed, 4.2) * step);
        applyMission003Pose(sampleRoute(mission003Distance, false), Math.abs(mission003Distance - priorDistance));
        if (mission003Distance >= routeLength - 1e-7) { mission003Distance = routeLength; mission003State = "AT_SCENE"; applyMission003Pose(sampleRoute(routeLength, false), 0); }
      } else if (mission003State === "RETURN_WAITING") {
        mission003ReturnElapsed += step;
        if (mission003ReturnElapsed >= finite(routeDefinition.returnDelaySeconds, 0)) mission003State = "RETURNING";
      } else if (mission003State === "RETURNING") {
        mission003Distance = Math.max(0, mission003Distance - finite(routeDefinition.returnSpeed, 4.5) * step);
        applyMission003Pose(sampleRoute(mission003Distance, true), Math.abs(mission003Distance - priorDistance));
        if (mission003Distance <= 1e-7) {
          mission003Distance = 0;
          mission003State = "PARKED";
          root.position.set(expectedTransform.x, expectedTransform.y, expectedTransform.z);
          root.rotation.y = expectedTransform.rotationY;
          setAmber(false, elapsed);
          vehiclesById[definition.id].state = "PARKED";
          vehiclesById[definition.id].phase = "PARKED";
          vehiclesById[definition.id].distance = 0;
        }
      }
      if (mission003State !== "PARKED") setAmber(true, elapsed);
      safetyAccumulator += Math.max(0, Math.min(finite(delta, 0), 0.25));
      if (safetyAccumulator >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafety(false);
      }
    }

    function getCommsPosition(target) {
      if (disposed) return null;
      target = target || new THREE.Vector3();
      commsAnchor.getWorldPosition(target);
      return target;
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      if (root.parent) root.parent.remove(root);
      resources.forEach(function (resource) {
        if (resource && typeof resource.dispose === "function") resource.dispose();
      });
      textures.forEach(function (texture) {
        if (texture && typeof texture.dispose === "function") texture.dispose();
      });
    }

    logResult(manifest);
    runSafety(true);

    return {
      root: root,
      vehiclesById: vehiclesById,
      update: update,
      getVehicleCount: function () { return 1; },
      prepareMission003: prepareMission003,
      dispatchMission003: dispatchMission003,
      returnMission003ToBase: returnMission003ToBase,
      resetMission003: resetMission003,
      getState: function () { return mission003State; },
      isAtScene: function () { return mission003State === "AT_SCENE"; },
      isAtBase: function () { return mission003State === "PARKED" && currentTransformMatches(); },
      getCommsPosition: getCommsPosition,
      getBeaconSnapshot: function () {
        return {
          active: amberActive,
          lensOpacity: beaconMaterial.opacity,
          lensEmissiveIntensity: beaconMaterial.emissiveIntensity,
          haloOpacity: beaconHaloMaterial.opacity,
          lensDepthTest: beaconMaterial.depthTest,
          haloDepthTest: beaconHaloMaterial.depthTest,
          blueBeaconObjects: 0
        };
      },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: dispose
    };
  }

  window.MissionBosStadtwerkeVehicleRenderer = {
    create: create
  };
})();
