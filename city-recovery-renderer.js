/* Mission BOS - Build 008R.2
   Static City Integration - Frozen Geometry

   Production renderer for window.MISSION_BOS_RECOVERY_LAYOUT.
   No modules. No fetch. No procedural placement. No coordinate overrides.
*/

(function () {
  "use strict";

  function assertDependency(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function createCity(options) {
    options = options || {};

    assertDependency(typeof THREE !== "undefined", "THREE is not loaded.");
    assertDependency(options.scene && typeof options.scene.add === "function", "A valid Three.js scene is required.");
    assertDependency(options.layout, "MISSION_BOS_RECOVERY_LAYOUT is required.");
    assertDependency(options.validator && typeof options.validator.validate === "function", "MissionBosGeometryValidator is required.");

    var scene = options.scene;
    var layout = options.layout;
    var validator = options.validator;
    var showDebugLabels = options.showDebugLabels === true;
    var showCollisionOverlays = options.showCollisionOverlays === true;

    var validation = validator.validate(layout);

    var root = new THREE.Group();
    root.name = "MissionBosRecoveryCity";
    root.position.set(0, 0, 0);
    root.rotation.set(0, 0, 0);
    root.scale.set(1, 1, 1);

    var groups = {
      ground: new THREE.Group(),
      districts: new THREE.Group(),
      corridors: new THREE.Group(),
      roads: new THREE.Group(),
      greenAreas: new THREE.Group(),
      parkingAreas: new THREE.Group(),
      pavedAreas: new THREE.Group(),
      technologyPlots: new THREE.Group(),
      buildings: new THREE.Group(),
      towers: new THREE.Group(),
      labels: new THREE.Group(),
      collisionOverlays: new THREE.Group()
    };

    Object.keys(groups).forEach(function (key) {
      groups[key].name = "Recovery_" + key;
      root.add(groups[key]);
    });

    var buildingsById = Object.create(null);
    var towersById = Object.create(null);
    var renderedCounts = {
      buildings: 0,
      towers: 0,
      roads: 0,
      greenAreas: 0,
      parkingAreas: 0,
      pavedAreas: 0
    };

    var context = {
      layout: layout,
      groups: groups,
      buildingsById: buildingsById,
      towersById: towersById,
      renderedCounts: renderedCounts,
      materials: createMaterials(layout)
    };

    createGround(context);
    createDistricts(context);
    createCorridors(context);
    createRoads(context);
    createGreenAreas(context);
    createParkingAreas(context);
    createPavedAreas(context);
    createTechnologyPlots(context);
    createBuildings(context);
    createTowers(context);

    if (showDebugLabels) {
      createDebugLabels(context);
    }

    if (showCollisionOverlays) {
      createCollisionOverlays(context, validation);
    }

    groups.labels.visible = showDebugLabels;
    groups.collisionOverlays.visible = showCollisionOverlays;

    scene.add(root);

    logIntegratedValidation(validation);

    var manifest = createRenderManifest(layout, renderedCounts);
    logRenderManifest(manifest);

    var primaryTowerGroup = towersById.MAST_D || null;

    return {
      root: root,
      groups: groups,
      buildingsById: buildingsById,
      towersById: towersById,
      validation: validation,
      renderedCounts: renderedCounts,
      manifest: manifest,
      primaryTowerGroup: primaryTowerGroup,
      primaryTowerBeacon: primaryTowerGroup ? primaryTowerGroup.userData.beacon || null : null,
      primaryTowerGlow: primaryTowerGroup ? primaryTowerGroup.userData.beaconGlow || null : null
    };
  }

  function createMaterials(layout) {
    var materials = layout.materials || {};

    return {
      ground: new THREE.MeshStandardMaterial({ color: 0xf2f0eb, roughness: 0.96 }),
      corridor: new THREE.MeshStandardMaterial({ color: materials.sidewalk || "#ddd7cc", roughness: 0.92 }),
      road: new THREE.MeshStandardMaterial({ color: materials.road || "#4b5563", roughness: 0.88 }),
      green: new THREE.MeshStandardMaterial({ color: materials.green || "#cfe3bd", roughness: 0.95 }),
      parking: new THREE.MeshStandardMaterial({ color: materials.parking || "#dfe3e7", roughness: 0.88 }),
      paved: new THREE.MeshStandardMaterial({ color: materials.paved || "#e8e2d5", roughness: 0.9 }),
      technology: new THREE.MeshStandardMaterial({ color: 0xf3d6e6, roughness: 0.92 }),
      flatRoof: new THREE.MeshStandardMaterial({ color: 0x3c4652, roughness: 0.82 }),
      pitchedRoof: new THREE.MeshStandardMaterial({ color: 0x7b4c37, roughness: 0.78 }),
      window: new THREE.MeshBasicMaterial({
        color: 0xfff0ba,
        transparent: true,
        opacity: 0.56,
        side: THREE.DoubleSide
      }),
      roadMarking: new THREE.MeshBasicMaterial({
        color: 0xf3f6d0,
        transparent: true,
        opacity: 0.58
      }),
      parkingMarking: new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.56
      }),
      collision: new THREE.MeshBasicMaterial({
        color: 0xff1935,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    };
  }

  function createGround(context) {
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(125, 100), context.materials.ground);
    mesh.name = "Recovery_Ground";
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.03;
    mesh.receiveShadow = true;
    context.groups.ground.add(mesh);
  }

  function createDistricts(context) {
    (context.layout.districts || []).forEach(function (district) {
      var material = new THREE.MeshStandardMaterial({
        color: district.color || 0xf1eee7,
        roughness: 0.96
      });
      var mesh = createPlaneFromRect(district.worldRect, material, 0.0);
      mesh.name = district.id;
      mesh.userData.sourceData = district;
      context.groups.districts.add(mesh);
    });
  }

  function createCorridors(context) {
    (context.layout.noBuildCorridors || []).forEach(function (corridor) {
      var mesh = createPlaneFromRect(corridor.worldRect, context.materials.corridor, 0.012);
      mesh.name = corridor.id;
      mesh.userData.sourceData = corridor;
      context.groups.corridors.add(mesh);
    });
  }

  function createRoads(context) {
    (context.layout.roadSurfaces || []).forEach(function (road, index) {
      var mesh = createPlaneFromRect(road.worldRect, context.materials.road, 0.026 + index * 0.0002);
      mesh.name = road.id;
      mesh.userData.sourceData = road;
      context.groups.roads.add(mesh);
      addRoadMarkings(context, road);
      context.renderedCounts.roads += 1;
    });
  }

  function addRoadMarkings(context, road) {
    var rect = road.worldRect;
    var isHorizontal = rect.width >= rect.depth;
    var step = 7.5;
    var start = isHorizontal ? rect.x - rect.width / 2 + 4 : rect.z - rect.depth / 2 + 4;
    var end = isHorizontal ? rect.x + rect.width / 2 - 4 : rect.z + rect.depth / 2 - 4;

    for (var value = start; value <= end; value += step) {
      var dash = new THREE.Mesh(
        isHorizontal ? new THREE.PlaneGeometry(1.8, 0.16) : new THREE.PlaneGeometry(0.16, 1.8),
        context.materials.roadMarking
      );
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(isHorizontal ? value : rect.x, 0.055, isHorizontal ? rect.z : value);
      dash.userData.parentRoadId = road.id;
      context.groups.roads.add(dash);
    }
  }

  function createGreenAreas(context) {
    (context.layout.greenAreas || []).forEach(function (area) {
      var material = area.color
        ? new THREE.MeshStandardMaterial({ color: area.color, roughness: 0.96 })
        : context.materials.green;
      var mesh = createPlaneFromRect(area.worldRect, material, 0.04);
      mesh.name = area.id;
      mesh.userData.sourceData = area;
      context.groups.greenAreas.add(mesh);
      context.renderedCounts.greenAreas += 1;
    });
  }

  function createParkingAreas(context) {
    (context.layout.parkingAreas || []).forEach(function (area) {
      var mesh = createPlaneFromRect(area.worldRect, context.materials.parking, 0.045);
      mesh.name = area.id;
      mesh.userData.sourceData = area;
      context.groups.parkingAreas.add(mesh);
      addParkingMarkings(context, area);
      context.renderedCounts.parkingAreas += 1;
    });
  }

  function addParkingMarkings(context, area) {
    var rect = area.worldRect;
    var count = Math.max(2, Math.floor(rect.width / 1.6));
    var left = rect.x - rect.width / 2;

    for (var i = 1; i < count; i += 1) {
      var x = left + rect.width / count * i;
      var stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(0.08, Math.max(0.4, rect.depth - 0.35)),
        context.materials.parkingMarking
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(x, 0.068, rect.z);
      stripe.userData.parentParkingId = area.id;
      context.groups.parkingAreas.add(stripe);
    }
  }

  function createPavedAreas(context) {
    (context.layout.pavedAreas || []).forEach(function (area) {
      var mesh = createPlaneFromRect(area.worldRect, context.materials.paved, 0.05);
      mesh.name = area.id;
      mesh.userData.sourceData = area;
      context.groups.pavedAreas.add(mesh);
      context.renderedCounts.pavedAreas += 1;
    });
  }

  function createTechnologyPlots(context) {
    (context.layout.technologyPlots || []).forEach(function (plot) {
      var mesh = createPlaneFromRect(plot.worldRect, context.materials.technology, 0.052);
      mesh.name = plot.id;
      mesh.userData.sourceData = plot;
      context.groups.technologyPlots.add(mesh);
    });
  }

  function createBuildings(context) {
    (context.layout.buildings || []).forEach(function (building) {
      var group = building.roof === "oval"
        ? createOvalBuilding(context, building)
        : createRectangularBuilding(context, building);

      group.name = building.id;
      group.userData.id = building.id;
      group.userData.sourceData = building;
      context.groups.buildings.add(group);
      context.buildingsById[building.id] = group;
      context.renderedCounts.buildings += 1;
    });
  }

  function createRectangularBuilding(context, building) {
    var rect = building.worldRect;
    var group = new THREE.Group();
    group.position.set(rect.x, 0, rect.z);

    var bodyHeight = building.roof === "pitched"
      ? Math.max(1.4, building.height - 1.15)
      : building.height;

    var body = new THREE.Mesh(
      new THREE.BoxGeometry(rect.width, bodyHeight, rect.depth),
      new THREE.MeshStandardMaterial({
        color: building.color || 0xcccccc,
        roughness: 0.74,
        metalness: 0.02
      })
    );
    body.name = building.id + "_BODY";
    body.position.y = bodyHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    addFacadeGrid(context, group, rect.width, rect.depth, bodyHeight, building.type);

    if (building.roof === "pitched") {
      var pitchedRoof = createPitchedRoof(rect.width + 0.22, rect.depth + 0.22, 1.15, context.materials.pitchedRoof);
      pitchedRoof.name = building.id + "_ROOF";
      pitchedRoof.position.y = bodyHeight;
      pitchedRoof.castShadow = true;
      group.add(pitchedRoof);
    } else {
      var flatRoof = new THREE.Mesh(
        new THREE.BoxGeometry(rect.width + 0.22, 0.24, rect.depth + 0.22),
        context.materials.flatRoof
      );
      flatRoof.name = building.id + "_ROOF";
      flatRoof.position.y = bodyHeight + 0.13;
      flatRoof.castShadow = true;
      group.add(flatRoof);
    }

    return group;
  }

  function createPitchedRoof(width, depth, height, material) {
    var halfWidth = width / 2;
    var halfDepth = depth / 2;
    var vertices = new Float32Array([
      -halfWidth, 0, -halfDepth,
       halfWidth, 0, -halfDepth,
       0, height, -halfDepth,
      -halfWidth, 0, halfDepth,
       halfWidth, 0, halfDepth,
       0, height, halfDepth
    ]);
    var indices = [
      0, 3, 5, 0, 5, 2,
      1, 2, 5, 1, 5, 4,
      0, 2, 1,
      3, 4, 5,
      0, 1, 4, 0, 4, 3
    ];
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return new THREE.Mesh(geometry, material);
  }

  function createOvalBuilding(context, building) {
    var rect = building.worldRect;
    var group = new THREE.Group();
    group.position.set(rect.x, 0, rect.z);

    var base = new THREE.Mesh(
      new THREE.CylinderGeometry(rect.width / 2, rect.width / 2, building.height, 64),
      new THREE.MeshStandardMaterial({
        color: building.color || 0xb8addb,
        roughness: 0.74
      })
    );
    base.name = building.id + "_BODY";
    base.scale.z = rect.depth / rect.width;
    base.position.y = building.height / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    var roof = new THREE.Mesh(
      new THREE.CylinderGeometry(rect.width / 2 + 0.25, rect.width / 2 + 0.25, 0.25, 64),
      context.materials.flatRoof
    );
    roof.name = building.id + "_ROOF";
    roof.scale.z = (rect.depth + 0.5) / (rect.width + 0.5);
    roof.position.y = building.height + 0.16;
    roof.castShadow = true;
    group.add(roof);

    var infield = new THREE.Mesh(
      new THREE.CylinderGeometry(rect.width / 3.8, rect.width / 3.8, 0.08, 48),
      new THREE.MeshStandardMaterial({ color: 0x8ec77b, roughness: 0.85 })
    );
    infield.name = building.id + "_INFIELD";
    infield.scale.z = 0.58;
    infield.position.y = building.height + 0.32;
    group.add(infield);

    return group;
  }

  function addFacadeGrid(context, group, width, depth, height, type) {
    var floors = Math.max(1, Math.floor(height / 2.0));
    var columns = Math.max(2, Math.floor(width / 1.2));
    var frontZ = depth / 2 + 0.012;
    var backZ = -depth / 2 - 0.012;
    var windowWidth = type === "detached_house" ? 0.28 : 0.36;
    var windowHeight = type === "detached_house" ? 0.38 : 0.46;

    for (var floor = 1; floor <= floors; floor += 1) {
      var y = Math.min(height - 0.75, floor * (height / (floors + 1)) + 0.2);
      for (var column = 0; column < columns; column += 1) {
        var x = -width / 2 + 0.55 + column * ((width - 1.1) / Math.max(1, columns - 1));
        addWindow(context, group, x, y, frontZ, 0, windowWidth, windowHeight);
        addWindow(context, group, x, y, backZ, Math.PI, windowWidth, windowHeight);
      }
    }

    var sideRows = Math.max(1, Math.floor(depth / 1.4));
    for (var row = 0; row < sideRows; row += 1) {
      var z = -depth / 2 + 0.65 + row * ((depth - 1.3) / Math.max(1, sideRows - 1));
      var sideY = Math.min(height - 0.8, height * 0.52);
      addWindow(context, group, width / 2 + 0.012, sideY, z, Math.PI / 2, windowWidth, windowHeight);
      addWindow(context, group, -width / 2 - 0.012, sideY, z, -Math.PI / 2, windowWidth, windowHeight);
    }
  }

  function addWindow(context, group, x, y, z, rotationY, width, height) {
    var windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), context.materials.window);
    windowMesh.position.set(x, y, z);
    windowMesh.rotation.y = rotationY;
    group.add(windowMesh);
  }

  function createTowers(context) {
    (context.layout.mobileTowers || []).forEach(function (tower) {
      var group = createTower(context, tower);
      group.name = tower.id;
      group.userData.id = tower.id;
      group.userData.sourceData = tower;
      context.groups.towers.add(group);
      context.towersById[tower.id] = group;
      context.renderedCounts.towers += 1;
    });
  }

  function createTower(context, tower) {
    var rect = tower.worldRect;
    var group = new THREE.Group();
    group.position.set(rect.x, 0, rect.z);

    var mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.18, tower.height, 14),
      new THREE.MeshStandardMaterial({
        color: 0xdbe4eb,
        roughness: 0.45,
        metalness: 0.35
      })
    );
    mast.name = tower.id + "_MAST";
    mast.position.y = tower.height / 2;
    mast.castShadow = true;
    group.add(mast);

    var platform = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.12, 1.2),
      new THREE.MeshStandardMaterial({
        color: 0xb4c2cc,
        roughness: 0.5,
        metalness: 0.25
      })
    );
    platform.name = tower.id + "_PLATFORM";
    platform.position.y = tower.height * 0.66;
    group.add(platform);

    [-0.55, 0.55].forEach(function (x) {
      var antenna = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 2.1, 0.18),
        new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.35 })
      );
      antenna.position.set(x, tower.height * 0.73, 0.55);
      group.add(antenna);
    });

    var beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 14, 10),
      new THREE.MeshBasicMaterial({
        color: 0xff2f9a,
        transparent: true,
        opacity: 0.9
      })
    );
    beacon.name = tower.id + "_BEACON";
    beacon.position.y = tower.height + 0.35;
    beacon.userData.isTowerBeacon = true;
    group.add(beacon);

    var beaconGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 16, 12),
      new THREE.MeshBasicMaterial({
        color: 0xff2f9a,
        transparent: true,
        opacity: 0.14,
        depthWrite: false
      })
    );
    beaconGlow.name = tower.id + "_BEACON_GLOW";
    beaconGlow.position.y = tower.height + 0.35;
    group.add(beaconGlow);

    var cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.82, 0.58),
      new THREE.MeshStandardMaterial({ color: 0xd6e1ea, roughness: 0.68 })
    );
    cabinet.name = tower.id + "_CABINET";
    cabinet.position.set(rect.width / 2 - 0.55, 0.41, -rect.depth / 2 + 0.65);
    cabinet.castShadow = true;
    group.add(cabinet);

    group.userData.beacon = beacon;
    group.userData.beaconGlow = beaconGlow;
    group.userData.cabinet = cabinet;

    return group;
  }

  function createPlaneFromRect(rect, material, y) {
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(rect.width, rect.depth), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(rect.x, y, rect.z);
    mesh.receiveShadow = true;
    return mesh;
  }

  function createDebugLabels(context) {
    (context.layout.buildings || []).forEach(function (building) {
      var label = createTextSprite(building.id, "#213145");
      label.position.set(building.worldRect.x, building.height + 1.1, building.worldRect.z);
      context.groups.labels.add(label);
    });

    (context.layout.mobileTowers || []).forEach(function (tower) {
      var label = createTextSprite(tower.id, "#b00063");
      label.position.set(tower.worldRect.x, tower.height + 1.2, tower.worldRect.z);
      context.groups.labels.add(label);
    });
  }

  function createTextSprite(text, backgroundColor) {
    var canvas = document.createElement("canvas");
    canvas.width = 384;
    canvas.height = 96;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = backgroundColor;
    context.fillRect(8, 18, 368, 60);
    context.fillStyle = "#ffffff";
    context.font = "bold 30px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 192, 49);

    var texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    var sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    }));
    sprite.scale.set(5.0, 1.25, 1);
    return sprite;
  }

  function createCollisionOverlays(context, validation) {
    (validation.errors || []).forEach(function (error) {
      if (!error.intersection) return;
      var intersection = error.intersection;
      var mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(Math.max(intersection.width, 0.08), Math.max(intersection.depth, 0.08)),
        context.materials.collision
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(intersection.x, 0.38, intersection.z);
      mesh.name = "COLLISION_" + error.a + "_" + error.b;
      context.groups.collisionOverlays.add(mesh);
    });
  }

  function createRenderManifest(layout, renderedCounts) {
    var expectedCounts = {
      buildings: (layout.buildings || []).length,
      towers: (layout.mobileTowers || []).length,
      roads: (layout.roadSurfaces || []).length,
      greenAreas: (layout.greenAreas || []).length,
      parkingAreas: (layout.parkingAreas || []).length,
      pavedAreas: (layout.pavedAreas || []).length
    };

    var passed = Object.keys(expectedCounts).every(function (key) {
      return renderedCounts[key] === expectedCounts[key];
    });

    return {
      status: passed ? "PASSED" : "FAILED",
      expectedCounts: expectedCounts,
      renderedCounts: renderedCounts
    };
  }

  function logIntegratedValidation(validation) {
    var counts = validation.counts;
    var logMethod = validation.status === "PASSED" ? "log" : "error";

    console.group("MISSION BOS INTEGRATED GEOMETRY VALIDATION");
    console[logMethod]("Building / corridor overlaps: " + counts.buildingCorridor);
    console[logMethod]("Building / building overlaps: " + counts.buildingBuilding);
    console[logMethod]("Tower / corridor overlaps: " + counts.towerCorridor);
    console[logMethod]("Tower / building overlaps: " + counts.towerBuilding);
    console[logMethod]("Green / road overlaps: " + counts.greenRoad);
    console[logMethod]("Parking / road overlaps: " + counts.parkingRoad);
    console[logMethod]("Paved / road overlaps: " + counts.pavedRoad);
    console[logMethod]("STATUS: " + validation.status);
    console.groupEnd();
  }

  function logRenderManifest(manifest) {
    var rendered = manifest.renderedCounts;
    var expected = manifest.expectedCounts;
    var logMethod = manifest.status === "PASSED" ? "log" : "error";

    console.group("MISSION BOS RECOVERY RENDER MANIFEST");
    console[logMethod]("Rendered buildings: " + rendered.buildings + " / " + expected.buildings);
    console[logMethod]("Rendered towers: " + rendered.towers + " / " + expected.towers);
    console[logMethod]("Rendered roads: " + rendered.roads + " / " + expected.roads);
    console[logMethod]("Rendered green areas: " + rendered.greenAreas + " / " + expected.greenAreas);
    console[logMethod]("Rendered parking areas: " + rendered.parkingAreas + " / " + expected.parkingAreas);
    console[logMethod]("Rendered paved areas: " + rendered.pavedAreas + " / " + expected.pavedAreas);
    console[logMethod]("RENDER MANIFEST: " + manifest.status);
    console.groupEnd();
  }

  window.MissionBosRecoveryRenderer = {
    createCity: createCity
  };
})();
