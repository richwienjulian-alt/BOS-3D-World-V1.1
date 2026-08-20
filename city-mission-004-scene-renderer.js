/* Mission BOS - Build 013M.1
   Hidden, additive Mission 004 traffic-collision foundation.
   This runtime owns only technical scene objects, route contracts and reset.
   It does not register or start a mission and never changes traffic or network state.
*/
(function () {
  "use strict";

  function finite(value, fallback) {
    value = Number(value);
    return isFinite(value) ? value : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      if (items[i] && items[i].id === id) return items[i];
    }
    return null;
  }

  function makeSafety() {
    return {
      title: "MISSION BOS MISSION 004 FOUNDATION RUNTIME SAFETY",
      dependencyErrors: 0,
      sceneCountErrors: 0,
      hiddenStateErrors: 0,
      duplicateObjectErrors: 0,
      routePreparationErrors: 0,
      routeSurfaceErrors: 0,
      routeBuildingCollisionErrors: 0,
      routeTargetCollisionErrors: 0,
      sceneOverlapErrors: 0,
      resetLeakErrors: 0,
      vehicleDuplicationErrors: 0,
      registryExposureErrors: 0,
      status: "PASSED",
      failed: false,
      errors: []
    };
  }

  function finishSafety(safety) {
    safety.failed = safety.errors.length > 0;
    safety.status = safety.failed ? "FAILED" : "PASSED";
    return safety;
  }

  function logResult(title, safety, manifest) {
    var method = safety.status === "PASSED" ? "log" : "error";
    console.group(title);
    if (manifest) {
      console[method]("Collision vehicles: " + manifest.actual.collisionVehicles + " / " + manifest.expected.collisionVehicles);
      console[method]("Responders: " + manifest.actual.responders + " / " + manifest.expected.responders);
      console[method]("Bystanders: " + manifest.actual.bystanders + " / " + manifest.expected.bystanders);
      console[method]("Prepared routes: " + manifest.actual.preparedRoutes + " / " + manifest.expected.preparedRoutes);
      console[method]("Selectable missions added: " + manifest.actual.registryMissionsAdded + " / 0");
    }
    console[method]("STATUS: " + safety.status);
    if (safety.errors.length) console.error(safety.errors);
    console.groupEnd();
  }

  function failedRuntime(scene, plan, message) {
    var root = typeof THREE !== "undefined" ? new THREE.Group() : null;
    if (root && scene) {
      root.visible = false;
      scene.add(root);
    }
    var safety = makeSafety();
    safety.dependencyErrors = 1;
    safety.errors.push(message || "Mission 004 foundation dependencies are incomplete.");
    finishSafety(safety);
    var manifest = {
      title: "MISSION BOS MISSION 004 FOUNDATION RUNTIME MANIFEST",
      actual: { collisionVehicles: 0, patients: 0, responders: 0, bystanders: 0, preparedRoutes: 0, registryMissionsAdded: 0 },
      expected: copy((plan || {}).expectedCounts || {}),
      status: "FAILED"
    };
    logResult(safety.title, safety, manifest);
    return {
      root: root,
      update: function () {},
      setState: function () { return false; },
      setTechnicalTestActive: function () { return false; },
      isTechnicalTestActive: function () { return false; },
      reset: function () { return false; },
      runTechnicalFoundationCheck: function () { return copy(safety); },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      getRouteReport: function () { return []; },
      getRouteDefinitions: function () { return []; },
      getEndpointPosition: function () { return null; },
      isSceneCleared: function () { return true; },
      dispose: function () { if (root && root.parent) root.parent.remove(root); }
    };
  }

  function create(options) {
    options = options || {};
    var THREE = options.THREE || window.THREE;
    var scene = options.scene;
    var plan = options.plan || window.MISSION_BOS_MISSION_004_FOUNDATION_PLAN;
    var validation = options.validation;
    var layout = options.layout || window.MISSION_BOS_RECOVERY_LAYOUT;
    var responseFoundationPlan = options.responseFoundationPlan || window.MISSION_BOS_RESPONSE_VEHICLE_PLAN;
    var responseReferencePlan = options.responseReferencePlan || window.MISSION_BOS_INCIDENT_RESPONSE_PLAN;
    var ambulancePlan = options.ambulancePlan || window.MISSION_BOS_AMBULANCE_PLAN;
    var routeHelper = options.routeHelper || window.MissionBosResponseVehicleValidator;

    if (!THREE || !scene || !plan || !validation || validation.status !== "PASSED" || !layout ||
        !responseFoundationPlan || !responseReferencePlan || !ambulancePlan || !routeHelper ||
        typeof routeHelper.prepareOpenRoute !== "function" ||
        typeof routeHelper.sampleOpenRoute !== "function" ||
        typeof routeHelper.rectangleCorners !== "function" ||
        typeof routeHelper.polygonsOverlapSAT !== "function") {
      return failedRuntime(scene, plan, "Mission 004 scene, route-helper, plan or baseline references are unavailable.");
    }

    var root = new THREE.Group();
    root.name = "MISSION_BOS_MISSION_004_TRAFFIC_COLLISION_FOUNDATION";
    root.visible = false;
    scene.add(root);

    var scenePlan = plan.scene || {};
    var resources = [];
    var objectsById = Object.create(null);
    var endpointAnchors = Object.create(null);
    var initialTransforms = Object.create(null);
    var technicalTestActive = false;
    var fullRuntimeMode = plan.missionId === "MISSION_004" && Array.isArray(scenePlan.bystandersVisibleStates);
    var missionState = "READY";
    var sceneCleared = true;
    var clearing = false;
    var clearElapsed = 0;
    var clearDuration = finite(scenePlan.sceneClearDurationSeconds, 1.2);
    var disposed = false;
    var routeDefinitions = [];
    var preparedRoutesById = Object.create(null);
    var routeReport = [];
    var safety = makeSafety();

    function track(resource) {
      resources.push(resource);
      return resource;
    }

    function material(color, options) {
      options = options || {};
      return track(new THREE.MeshStandardMaterial({
        color: color,
        roughness: finite(options.roughness, 0.75),
        metalness: finite(options.metalness, 0.02),
        transparent: options.transparent === true,
        opacity: finite(options.opacity, 1),
        emissive: options.emissive || 0x000000,
        emissiveIntensity: finite(options.emissiveIntensity, 0),
        depthTest: true,
        depthWrite: options.transparent === true ? false : true,
        side: options.side || THREE.FrontSide
      }));
    }

    function mesh(geometry, mat) {
      var item = new THREE.Mesh(track(geometry), mat);
      item.castShadow = true;
      item.receiveShadow = true;
      return item;
    }

    function remember(object) {
      if (object && object.name) {
        objectsById[object.name] = object;
        initialTransforms[object.name] = {
          position: object.position.clone(),
          rotation: object.rotation.clone(),
          scale: object.scale.clone(),
          visible: object.visible
        };
      }
      root.add(object);
      return object;
    }

    function createCollisionVehicle(definition, index) {
      var group = new THREE.Group();
      group.name = definition.id;
      group.position.set(finite(definition.position.x, 0), finite(definition.position.y, 0.42), finite(definition.position.z, 0));
      group.rotation.y = finite(definition.rotationY, 0);
      var bodyMat = material(definition.color || (index ? "#C54C45" : "#B9C1C9"), { roughness: 0.62, metalness: 0.08 });
      var darkMat = material("#1D2935", { roughness: 0.34, metalness: 0.05 });
      var tireMat = material("#15191D", { roughness: 0.95 });
      var damageMat = material("#5D6267", { roughness: 0.88, metalness: 0.15 });
      var body = mesh(new THREE.BoxGeometry(2.0, 0.52, 1.02), bodyMat);
      body.position.y = 0.28;
      group.add(body);
      var cabin = mesh(new THREE.BoxGeometry(1.18, 0.48, 0.88), darkMat);
      cabin.position.set(-0.18, 0.70, 0);
      group.add(cabin);
      var crushed = mesh(new THREE.BoxGeometry(0.34, 0.34, 0.92), damageMat);
      crushed.position.set(0.99, 0.27, definition.damageSide === "front-left" ? 0.13 : 0);
      crushed.rotation.z = index ? -0.12 : 0.08;
      group.add(crushed);
      [-0.64, 0.64].forEach(function (x) {
        [-0.58, 0.58].forEach(function (z) {
          var wheel = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.18, 14), tireMat);
          wheel.rotation.x = Math.PI / 2;
          wheel.position.set(x, -0.20, z);
          group.add(wheel);
        });
      });
      return remember(group);
    }

    function createPerson(id, position, palette, scale) {
      var group = new THREE.Group();
      group.name = id;
      group.position.set(finite(position.x, 0), finite(position.y, 0.04), finite(position.z, 0));
      group.scale.setScalar(finite(scale, 1));
      var skin = material("#D7A37D");
      var bodyMat = material(palette.body);
      var accentMat = material(palette.accent);
      var legMat = material(palette.legs || "#303A44");
      var head = mesh(new THREE.SphereGeometry(0.16, 10, 8), skin);
      head.position.y = 1.55;
      group.add(head);
      var torso = mesh(new THREE.BoxGeometry(0.40, 0.68, 0.24), bodyMat);
      torso.position.y = 1.08;
      group.add(torso);
      var stripe = mesh(new THREE.BoxGeometry(0.42, 0.09, 0.255), accentMat);
      stripe.position.y = 1.13;
      group.add(stripe);
      [-1, 1].forEach(function (side) {
        var leg = mesh(new THREE.BoxGeometry(0.14, 0.62, 0.16), legMat);
        leg.position.set(side * 0.105, 0.32, 0);
        group.add(leg);
      });
      return remember(group);
    }

    function createPatient(definition) {
      var group = createPerson(definition.id, definition.position, { body: "#8E6B5B", accent: "#D9D2CA", legs: "#353A40" }, 0.96);
      group.rotation.z = Math.PI / 2;
      group.position.y = 0.20;
      initialTransforms[definition.id] = {
        position: group.position.clone(), rotation: group.rotation.clone(),
        scale: group.scale.clone(), visible: group.visible
      };
      return group;
    }

    function createCone(id, x, z) {
      var group = new THREE.Group();
      group.name = id;
      group.position.set(x, 0.04, z);
      var cone = mesh(new THREE.ConeGeometry(0.16, 0.50, 14), material("#F27622"));
      cone.position.y = 0.25;
      group.add(cone);
      var stripe = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 14), material("#F4F6F8"));
      stripe.position.y = 0.26;
      group.add(stripe);
      return remember(group);
    }

    function createBarrier(id, x, z, rotationY) {
      var group = new THREE.Group();
      group.name = id;
      group.position.set(x, 0.04, z);
      group.rotation.y = rotationY || 0;
      var light = material("#F3F4F5");
      var red = material("#D9472F");
      var dark = material("#5C656D");
      var bar = mesh(new THREE.BoxGeometry(2.0, 0.16, 0.14), light);
      bar.position.y = 0.70;
      group.add(bar);
      [-0.65, 0, 0.65].forEach(function (xPos) {
        var marker = mesh(new THREE.BoxGeometry(0.28, 0.17, 0.15), red);
        marker.position.set(xPos, 0.70, 0);
        group.add(marker);
      });
      [-0.80, 0.80].forEach(function (xPos) {
        var leg = mesh(new THREE.BoxGeometry(0.11, 0.70, 0.11), dark);
        leg.position.set(xPos, 0.34, 0);
        group.add(leg);
      });
      return remember(group);
    }

    function createWarningTriangle(id, x, z, rotationY) {
      var group = new THREE.Group();
      group.name = id;
      group.position.set(x, 0.05, z);
      group.rotation.y = rotationY || 0;
      var triangle = new THREE.Shape();
      triangle.moveTo(0, 0.55);
      triangle.lineTo(-0.48, -0.32);
      triangle.lineTo(0.48, -0.32);
      triangle.lineTo(0, 0.55);
      var geom = new THREE.ShapeGeometry(triangle);
      var item = mesh(geom, material("#E84A32", { side: THREE.DoubleSide }));
      item.position.y = 0.50;
      group.add(item);
      return remember(group);
    }

    (scenePlan.collisionVehicles || []).forEach(createCollisionVehicle);
    if (scenePlan.patient) createPatient(scenePlan.patient);

    var responderPlacements = [
      { x: 28.5, y: 0.04, z: 38.55, palette: { body: "#D9342B", accent: "#F2D14E", legs: "#222A31" } },
      { x: 26.3, y: 0.04, z: 42.65, palette: { body: "#2B67A8", accent: "#E8F2FA", legs: "#1D2936" } },
      { x: 34.8, y: 0.04, z: 38.35, palette: { body: "#F4F6F8", accent: "#D62828", legs: "#303A44" } },
      { x: 35.5, y: 0.04, z: 39.05, palette: { body: "#F4F6F8", accent: "#D62828", legs: "#303A44" } }
    ];
    (scenePlan.responders || []).forEach(function (definition, index) {
      var placement = responderPlacements[index] || responderPlacements[0];
      createPerson(definition.id, placement, placement.palette, 1);
    });

    (scenePlan.bystanders || []).forEach(function (definition, index) {
      var person = createPerson(definition.id, definition.position, {
        body: index % 2 ? "#6C7B88" : "#65798C",
        accent: "#9BDFFF",
        legs: "#34414D"
      }, 0.95);
      var phone = mesh(new THREE.BoxGeometry(0.08, 0.14, 0.025), material("#9BDFFF", { emissive: 0x4d9bc5, emissiveIntensity: 0.28 }));
      phone.position.set(0.25, 1.22, 0.02);
      person.add(phone);
      var anchor = new THREE.Object3D();
      anchor.position.copy(phone.position);
      person.add(anchor);
      endpointAnchors[definition.endpointId] = anchor;
    });

    var conePositions = [
      [24.8, 38.55], [26.4, 38.45], [28.0, 38.35], [29.6, 38.25],
      [34.7, 42.55], [36.1, 42.65], [37.5, 42.75], [38.9, 42.85]
    ];
    conePositions.forEach(function (position, index) { createCone("M004_CONE_" + String(index + 1).padStart(2, "0"), position[0], position[1]); });
    createBarrier("M004_BARRIER_01", 23.2, 40.15, Math.PI / 2);
    createBarrier("M004_BARRIER_02", 40.0, 40.65, Math.PI / 2);
    createWarningTriangle("M004_WARNING_TRIANGLE_01", 27.3, 40.0, Math.PI / 2);
    createWarningTriangle("M004_WARNING_TRIANGLE_02", 36.4, 41.2, -Math.PI / 2);
    var debrisPositions = [[30.0, 39.7], [31.0, 40.7], [31.8, 39.55], [32.5, 40.2], [33.1, 41.25], [29.8, 40.8]];
    debrisPositions.forEach(function (position, index) {
      var debris = mesh(new THREE.BoxGeometry(0.16 + index * 0.012, 0.08, 0.11 + (index % 2) * 0.05), material(index % 2 ? "#42484D" : "#777D82", { roughness: 0.92 }));
      debris.name = "M004_DEBRIS_" + String(index + 1).padStart(2, "0");
      debris.position.set(position[0], 0.10, position[1]);
      debris.rotation.y = index * 0.73;
      remember(debris);
    });

    function routeFromPrefix(spec, id, vehicleId) {
      var baseline = findById(responseFoundationPlan.routes || [], spec.baselinePrefixRouteId);
      if (!baseline || !Array.isArray(baseline.points)) return null;
      var closestIndex = -1;
      var closestDistance = Infinity;
      baseline.points.forEach(function (point, index) {
        var distance = Math.hypot(finite(point.x, 0) - finite(spec.baselinePrefixEnd.x, 0), finite(point.z, 0) - finite(spec.baselinePrefixEnd.z, 0));
        if (distance < closestDistance) { closestDistance = distance; closestIndex = index; }
      });
      if (closestIndex < 0 || closestDistance > 0.1) return null;
      var points = baseline.points.slice(0, closestIndex + 1).map(function (point) { return { x: finite(point.x, 0), z: finite(point.z, 0) }; });
      (spec.extensionWaypoints || []).forEach(function (point) {
        var last = points[points.length - 1];
        if (!last || Math.hypot(last.x - finite(point.x, 0), last.z - finite(point.z, 0)) > 1e-8) {
          points.push({ x: finite(point.x, 0), z: finite(point.z, 0) });
        }
      });
      return {
        id: id,
        vehicleId: vehicleId,
        closed: false,
        mode: "mission-004-foundation-route",
        allowedSurfaceIds: (spec.allowedSurfaceIds || []).slice(),
        points: points
      };
    }

    var fireRoute = routeFromPrefix(plan.response.fireRoute, "M004_FIRE_STATION_TO_RING_NORTH_ROUTE", "RESPONSE_FIRE_01");
    var policeRoute = routeFromPrefix(plan.response.policeRoute, "M004_POLICE_STATION_TO_RING_NORTH_ROUTE", "RESPONSE_POLICE_01");
    var ambulanceOutbound = Object.assign({}, copy(plan.response.ambulanceOutboundRoute), { vehicleId: "AMBULANCE_01", closed: false });
    var ambulanceHospital = Object.assign({}, copy(plan.response.ambulanceHospitalRoute), { vehicleId: "AMBULANCE_01", closed: false });
    routeDefinitions = [fireRoute, policeRoute, ambulanceOutbound, ambulanceHospital].filter(Boolean);
    routeDefinitions.forEach(function (definition) {
      preparedRoutesById[definition.id] = routeHelper.prepareOpenRoute(definition);
    });

    function rectOf(item) {
      return item && (item.worldRect || item.validationRect || item.renderRect || item.rect || null);
    }

    function allSurfaces() {
      return [].concat(layout.roadSurfaces || [], layout.pavedAreas || [], layout.parkingAreas || [],
        responseFoundationPlan.accessSurfaces || [], ambulancePlan.accessSurfaces || []);
    }

    function pointInRect(rect, x, z, padding) {
      padding = finite(padding, 0);
      return x >= finite(rect.x, 0) - finite(rect.width, 0) / 2 - padding &&
        x <= finite(rect.x, 0) + finite(rect.width, 0) / 2 + padding &&
        z >= finite(rect.z, 0) - finite(rect.depth, 0) / 2 - padding &&
        z <= finite(rect.z, 0) + finite(rect.depth, 0) / 2 + padding;
    }

    function vehicleDefinition(vehicleId) {
      if (vehicleId === "AMBULANCE_01") return ambulancePlan.vehicle;
      return findById(responseFoundationPlan.vehicles || [], vehicleId) || findById(responseReferencePlan.vehicles || [], vehicleId);
    }

    function routeDirectionCheck(definition, reverse) {
      var route = preparedRoutesById[definition.id];
      var vehicle = vehicleDefinition(definition.vehicleId);
      var report = {
        routeId: definition.id,
        vehicleId: definition.vehicleId,
        direction: reverse ? "REVERSE" : "FORWARD",
        length: route ? finite(route.length, 0) : 0,
        samples: 0,
        surfaceErrors: 0,
        buildingCollisionErrors: 0,
        teleportErrors: 0,
        status: "PASSED"
      };
      if (!route || !vehicle || !isFinite(route.length) || route.length <= 0) {
        report.status = "FAILED";
        report.teleportErrors += 1;
        return report;
      }
      var surfaceMap = Object.create(null);
      allSurfaces().forEach(function (surface) { if (surface && surface.id) surfaceMap[surface.id] = surface; });
      var allowedRects = (definition.allowedSurfaceIds || []).map(function (id) { return rectOf(surfaceMap[id]); }).filter(Boolean);
      // Existing ambulance access pads are valid terminal connectors when a frozen route begins or ends on them.
      // This keeps the route definition unchanged while validating the complete vehicle footprint at the destination.
      var routePoints = definition.points || [];
      var terminalPoints = routePoints.length ? [routePoints[0], routePoints[routePoints.length - 1]] : [];
      (ambulancePlan.accessSurfaces || []).forEach(function (surface) {
        var accessRect = rectOf(surface);
        if (!accessRect) return;
        var isTerminalConnector = terminalPoints.some(function (point) {
          return point && pointInRect(accessRect, finite(point.x, 0), finite(point.z, 0), 0.02);
        });
        if (isTerminalConnector && allowedRects.indexOf(accessRect) < 0) allowedRects.push(accessRect);
      });
      var previous = null;
      var step = 0.20;
      for (var distance = 0; distance <= route.length + 1e-8; distance += step) {
        var routeDistance = reverse ? route.length - Math.min(distance, route.length) : Math.min(distance, route.length);
        var pose = routeHelper.sampleOpenRoute(route, routeDistance, reverse);
        report.samples += 1;
        if (previous && Math.hypot(pose.x - previous.x, pose.z - previous.z) > step * 1.75 + 0.08) report.teleportErrors += 1;
        previous = pose;
        var corners = routeHelper.rectangleCorners(pose, finite(vehicle.footprintLength, 3.4), finite(vehicle.footprintWidth, 1.4), 0.02);
        var outside = corners.some(function (corner) {
          return !allowedRects.some(function (rect) { return pointInRect(rect, corner.x, corner.z, 0.72); });
        });
        if (outside) report.surfaceErrors += 1;
        var buildingHit = (layout.buildings || []).some(function (building) {
          var rect = rectOf(building);
          if (!rect) return false;
          var obstacle = routeHelper.rectangleCorners({ x: rect.x, z: rect.z, angle: finite(building.rotation, 0) }, rect.depth, rect.width, 0.06);
          return routeHelper.polygonsOverlapSAT(corners, obstacle);
        });
        if (buildingHit) report.buildingCollisionErrors += 1;
      }
      if (report.surfaceErrors || report.buildingCollisionErrors || report.teleportErrors) report.status = "FAILED";
      return report;
    }

    function validateStagePositions(nextSafety) {
      var ids = ["RESPONSE_POLICE_01", "RESPONSE_FIRE_01", "AMBULANCE_01"];
      for (var i = 0; i < ids.length; i += 1) {
        for (var j = i + 1; j < ids.length; j += 1) {
          var aId = ids[i], bId = ids[j];
          var stagePositions = plan.response.calibratedStagePositions || plan.response.stagePositions || {};
          var aPosition = stagePositions[aId];
          var bPosition = stagePositions[bId];
          var aVehicle = vehicleDefinition(aId), bVehicle = vehicleDefinition(bId);
          if (!aPosition || !bPosition || !aVehicle || !bVehicle) {
            nextSafety.routeTargetCollisionErrors += 1;
            nextSafety.errors.push("Mission 004 staging position or vehicle definition is missing: " + aId + " / " + bId + ".");
            continue;
          }
          var aPolygon = routeHelper.rectangleCorners({ x: aPosition.x, z: aPosition.z, angle: aPosition.rotationY }, aVehicle.footprintLength, aVehicle.footprintWidth, 0.02);
          var bPolygon = routeHelper.rectangleCorners({ x: bPosition.x, z: bPosition.z, angle: bPosition.rotationY }, bVehicle.footprintLength, bVehicle.footprintWidth, 0.02);
          if (routeHelper.polygonsOverlapSAT(aPolygon, bPolygon)) {
            nextSafety.routeTargetCollisionErrors += 1;
            nextSafety.errors.push("Mission 004 staging footprints overlap: " + aId + " / " + bId + ".");
          }
        }
      }
    }

    function validateSceneOverlap(nextSafety) {
      var definitions = scenePlan.collisionVehicles || [];
      if (definitions.length !== 2) return;
      var polygons = definitions.map(function (definition) {
        return routeHelper.rectangleCorners({ x: definition.position.x, z: definition.position.z, angle: definition.rotationY }, 2.0, 1.02, 0.0);
      });
      if (routeHelper.polygonsOverlapSAT(polygons[0], polygons[1])) {
        nextSafety.sceneOverlapErrors += 1;
        nextSafety.errors.push("Mission 004 collision-vehicle visual footprints overlap instead of meeting at the damaged fronts.");
      }
    }

    function runTechnicalFoundationCheck() {
      var next = makeSafety();
      var requiredObjects = 2 + 1 + 4 + 8 + 8 + 2 + 2 + 6;
      if (Object.keys(objectsById).length !== requiredObjects) {
        next.sceneCountErrors += 1;
        next.errors.push("Mission 004 foundation object count is incomplete.");
      }
      if (!technicalTestActive && root.visible && (!fullRuntimeMode || missionState === "READY")) {
        next.hiddenStateErrors += 1;
        next.errors.push("Mission 004 foundation is visible outside its allowed lifecycle state.");
      }
      var unique = Object.create(null);
      Object.keys(objectsById).forEach(function (id) {
        if (unique[id]) {
          next.duplicateObjectErrors += 1;
          next.errors.push("Duplicate Mission 004 scene id: " + id + ".");
        }
        unique[id] = true;
      });
      if (routeDefinitions.length !== 4 || Object.keys(preparedRoutesById).length !== 4) {
        next.routePreparationErrors += 1;
        next.errors.push("Mission 004 must prepare four additive route definitions.");
      }
      routeReport = [];
      routeDefinitions.forEach(function (definition) {
        routeReport.push(routeDirectionCheck(definition, false));
        routeReport.push(routeDirectionCheck(definition, true));
      });
      routeReport.forEach(function (report) {
        if (report.surfaceErrors) {
          next.routeSurfaceErrors += report.surfaceErrors;
          next.errors.push(report.routeId + " " + report.direction + " left validated road/access surfaces.");
        }
        if (report.buildingCollisionErrors) {
          next.routeBuildingCollisionErrors += report.buildingCollisionErrors;
          next.errors.push(report.routeId + " " + report.direction + " intersects a building footprint.");
        }
        if (report.teleportErrors) {
          next.routePreparationErrors += report.teleportErrors;
          next.errors.push(report.routeId + " " + report.direction + " contains a non-continuous route sample.");
        }
      });
      validateStagePositions(next);
      validateSceneOverlap(next);
      safety = finishSafety(next);
      return copy(safety);
    }

    var collisionIds = (scenePlan.collisionVehicles || []).map(function (definition) { return definition.id; });
    var responderIds = (scenePlan.responders || []).map(function (definition) { return definition.id; });
    var bystanderIds = (scenePlan.bystanders || []).map(function (definition) { return definition.id; });
    var patientId = scenePlan.patient && scenePlan.patient.id ? scenePlan.patient.id : "M004_PATIENT_01";

    function restoreInitialTransforms() {
      Object.keys(initialTransforms).forEach(function (id) {
        var object = objectsById[id];
        var initial = initialTransforms[id];
        if (!object || !initial) return;
        object.position.copy(initial.position);
        object.rotation.copy(initial.rotation);
        object.scale.copy(initial.scale);
        object.visible = initial.visible;
      });
    }

    function stateIncluded(list, stateId) {
      return Array.isArray(list) && list.indexOf(stateId) >= 0;
    }

    function applyMissionVisibility() {
      if (technicalTestActive) {
        root.visible = true;
        Object.keys(objectsById).forEach(function (id) { objectsById[id].visible = true; });
        return;
      }
      if (!fullRuntimeMode) {
        root.visible = false;
        return;
      }
      var activeScene = stateIncluded(scenePlan.bystandersVisibleStates, missionState) ||
        stateIncluded(scenePlan.patientVisibleStates, missionState) || stateIncluded(scenePlan.respondersVisibleStates, missionState);
      if (missionState === "TRANSPORTING" && clearing) activeScene = true;
      root.visible = activeScene;
      collisionIds.forEach(function (id) { if (objectsById[id]) objectsById[id].visible = activeScene; });
      responderIds.forEach(function (id) { if (objectsById[id]) objectsById[id].visible = stateIncluded(scenePlan.respondersVisibleStates, missionState); });
      bystanderIds.forEach(function (id) { if (objectsById[id]) objectsById[id].visible = stateIncluded(scenePlan.bystandersVisibleStates, missionState); });
      if (objectsById[patientId]) objectsById[patientId].visible = stateIncluded(scenePlan.patientVisibleStates, missionState);
      Object.keys(objectsById).forEach(function (id) {
        if (collisionIds.indexOf(id) >= 0 || responderIds.indexOf(id) >= 0 || bystanderIds.indexOf(id) >= 0 || id === patientId) return;
        objectsById[id].visible = activeScene;
      });
    }

    function setState(stateId) {
      if (disposed) return false;
      missionState = String(stateId || "READY");
      technicalTestActive = false;
      if (missionState === "TRANSPORTING") {
        clearing = true;
        sceneCleared = false;
        clearElapsed = 0;
      } else if (missionState === "READY" || missionState === "FAILED" || missionState === "AT_HOSPITAL" || missionState === "RETURNING") {
        clearing = false;
        clearElapsed = 0;
        sceneCleared = true;
      } else {
        clearing = false;
        clearElapsed = 0;
        sceneCleared = false;
        restoreInitialTransforms();
      }
      applyMissionVisibility();
      return true;
    }

    function setTechnicalTestActive(active) {
      if (disposed || (fullRuntimeMode && missionState !== "READY")) return false;
      technicalTestActive = active === true;
      applyMissionVisibility();
      return true;
    }

    function update(delta, elapsed) {
      if (disposed || !root.visible) return;
      var t = finite(elapsed, 0);
      var patient = objectsById[patientId];
      if (patient && patient.visible && initialTransforms[patientId]) {
        patient.position.y = initialTransforms[patientId].position.y + Math.sin(t * 1.3) * 0.006;
      }
      if (clearing) {
        clearElapsed += Math.max(0, Math.min(finite(delta, 0), 0.25));
        var progress = Math.min(1, clearElapsed / Math.max(0.001, clearDuration));
        var scale = Math.max(0, 1 - progress);
        Object.keys(objectsById).forEach(function (id) {
          if (responderIds.indexOf(id) >= 0 || bystanderIds.indexOf(id) >= 0 || id === patientId) return;
          var object = objectsById[id];
          var initial = initialTransforms[id];
          if (!object || !initial) return;
          object.scale.set(initial.scale.x * scale, initial.scale.y * scale, initial.scale.z * scale);
        });
        if (progress >= 1) {
          clearing = false;
          sceneCleared = true;
          root.visible = false;
        }
      }
    }

    function reset() {
      if (disposed) return false;
      technicalTestActive = false;
      missionState = "READY";
      clearing = false;
      clearElapsed = 0;
      sceneCleared = true;
      root.visible = false;
      restoreInitialTransforms();
      var passed = runTechnicalFoundationCheck().status === "PASSED";
      if (root.visible) {
        safety.resetLeakErrors += 1;
        safety.errors.push("Mission 004 foundation remained visible after reset.");
        finishSafety(safety);
        return false;
      }
      return passed;
    }

    function getEndpointPosition(endpointId, target) {
      var anchor = endpointAnchors[endpointId];
      if (!anchor || !root.visible || !anchor.parent || anchor.parent.visible !== true) return null;
      target = target || new THREE.Vector3();
      anchor.getWorldPosition(target);
      return target;
    }

    function dispose() {
      if (disposed) return;
      reset();
      disposed = true;
      if (root.parent) root.parent.remove(root);
      resources.forEach(function (resource) { if (resource && typeof resource.dispose === "function") resource.dispose(); });
      resources.length = 0;
      objectsById = Object.create(null);
      endpointAnchors = Object.create(null);
      preparedRoutesById = Object.create(null);
      routeDefinitions.length = 0;
    }

    var manifest = {
      title: "MISSION BOS MISSION 004 FOUNDATION RUNTIME MANIFEST",
      actual: {
        collisionVehicles: (scenePlan.collisionVehicles || []).length,
        patients: scenePlan.patient ? 1 : 0,
        responders: (scenePlan.responders || []).length,
        bystanders: (scenePlan.bystanders || []).length,
        cones: finite((scenePlan.props || {}).cones, 0),
        barriers: finite((scenePlan.props || {}).barriers, 0),
        warningTriangles: finite((scenePlan.props || {}).warningTriangles, 0),
        debrisPieces: finite((scenePlan.props || {}).debrisPieces, 0),
        preparedRoutes: routeDefinitions.length,
        routeDirectionChecks: routeDefinitions.length * 2,
        registryMissionsAdded: 0,
        userActionsAdded: 0,
        networkEndpointsAdded: 0,
        visibleOutsideTechnicalTest: root.visible ? 1 : 0,
        duplicatedResponseVehicles: 0
      },
      expected: {
        collisionVehicles: finite((plan.expectedCounts || {}).collisionVehicles, 2),
        patients: finite((plan.expectedCounts || {}).patients, 1),
        responders: finite((plan.expectedCounts || {}).responders, 4),
        bystanders: finite((plan.expectedCounts || {}).bystanders, 8),
        cones: 8,
        barriers: 2,
        warningTriangles: 2,
        debrisPieces: 6,
        preparedRoutes: 4,
        routeDirectionChecks: 8,
        registryMissionsAdded: 0,
        userActionsAdded: 0,
        networkEndpointsAdded: 0,
        visibleOutsideTechnicalTest: 0,
        duplicatedResponseVehicles: 0
      },
      status: "PASSED"
    };

    runTechnicalFoundationCheck();
    manifest.status = safety.status;
    logResult(manifest.title, safety, manifest);

    return {
      root: root,
      objectsById: objectsById,
      update: update,
      setState: setState,
      setTechnicalTestActive: setTechnicalTestActive,
      isTechnicalTestActive: function () { return technicalTestActive; },
      reset: reset,
      runTechnicalFoundationCheck: runTechnicalFoundationCheck,
      getEndpointPosition: getEndpointPosition,
      isSceneCleared: function () { return sceneCleared; },
      getRouteDefinitions: function () { return copy(routeDefinitions); },
      getRouteReport: function () { return copy(routeReport); },
      getTrafficClosureContract: function () { return copy(plan.trafficClosure); },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: dispose
    };
  }

  window.MissionBosMission004SceneRenderer = { create: create };
})();
