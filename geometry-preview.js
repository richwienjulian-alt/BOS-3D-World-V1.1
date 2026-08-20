/* Mission BOS - Build 008R.1
   Deterministic Geometry Proof - Preview

   No modules. No fetch. No procedural placement.
   Reads all geometry from window.MISSION_BOS_RECOVERY_LAYOUT.
*/

(function () {
  "use strict";

  if (typeof THREE === "undefined") {
    document.body.innerHTML = "<div style='padding:32px;color:white;background:#07111f;font-family:Arial'>Three.js konnte nicht geladen werden.</div>";
    throw new Error("THREE is not loaded.");
  }

  if (!window.MISSION_BOS_RECOVERY_LAYOUT) {
    document.body.innerHTML = "<div style='padding:32px;color:white;background:#07111f;font-family:Arial'>city-layout-recovery.js wurde nicht geladen.</div>";
    throw new Error("MISSION_BOS_RECOVERY_LAYOUT is missing.");
  }

  if (!window.MissionBosGeometryValidator) {
    document.body.innerHTML = "<div style='padding:32px;color:white;background:#07111f;font-family:Arial'>geometry-validator.js wurde nicht geladen.</div>";
    throw new Error("MissionBosGeometryValidator is missing.");
  }

  var layout = window.MISSION_BOS_RECOVERY_LAYOUT;
  var validator = window.MissionBosGeometryValidator;
  var validationResult = validator.validate(layout);
  validator.logResult(validationResult);

  var container = document.getElementById("scene-container");
  var validationPanel = document.getElementById("validation-panel");
  var validationOutput = document.getElementById("validation-output");
  var validationErrors = document.getElementById("validation-errors");
  var objectCounts = document.getElementById("object-counts");
  var viewBadge = document.getElementById("view-badge");

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb9d7ec);
  scene.fog = new THREE.Fog(0xb9d7ec, 80, 210);

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  var clock = new THREE.Clock();

  var perspectiveCamera = new THREE.PerspectiveCamera(55, 1, 0.1, 260);
  var orthographicCamera = new THREE.OrthographicCamera(-65, 65, 65, -65, 0.1, 260);
  var activeCamera = orthographicCamera;
  var activeView = "top";

  var districtGroup = new THREE.Group();
  var corridorGroup = new THREE.Group();
  var roadGroup = new THREE.Group();
  var greenGroup = new THREE.Group();
  var parkingGroup = new THREE.Group();
  var pavedGroup = new THREE.Group();
  var buildingGroup = new THREE.Group();
  var towerGroup = new THREE.Group();
  var labelGroup = new THREE.Group();
  var collisionGroup = new THREE.Group();

  scene.add(districtGroup);
  scene.add(corridorGroup);
  scene.add(roadGroup);
  scene.add(greenGroup);
  scene.add(parkingGroup);
  scene.add(pavedGroup);
  scene.add(buildingGroup);
  scene.add(towerGroup);
  scene.add(labelGroup);
  scene.add(collisionGroup);

  var labelSprites = [];
  var orbit = {
    target: new THREE.Vector3(0, 0, 0),
    yaw: -0.74,
    pitch: 0.78,
    distance: 95,
    isDragging: false,
    lastX: 0,
    lastY: 0
  };

  var materials = createMaterials();

  initLights();
  buildPreviewScene();
  createErrorOverlays(validationResult);
  updateValidationPanel(validationResult);
  bindUi();
  resizeRenderer();
  setView("top");
  animate();

  function createMaterials() {
    return {
      districtDefault: new THREE.MeshStandardMaterial({ color: 0xf1eee7, roughness: 0.96 }),
      corridor: new THREE.MeshStandardMaterial({ color: colorFromLayout("sidewalk", "#ddd7cc"), roughness: 0.92 }),
      road: new THREE.MeshStandardMaterial({ color: colorFromLayout("road", "#4b5563"), roughness: 0.88 }),
      green: new THREE.MeshStandardMaterial({ color: colorFromLayout("green", "#cfe3bd"), roughness: 0.95 }),
      parking: new THREE.MeshStandardMaterial({ color: colorFromLayout("parking", "#dfe3e7"), roughness: 0.88 }),
      paved: new THREE.MeshStandardMaterial({ color: colorFromLayout("paved", "#e8e2d5"), roughness: 0.9 }),
      roofFlat: new THREE.MeshStandardMaterial({ color: 0x3c4652, roughness: 0.82 }),
      roofPitched: new THREE.MeshStandardMaterial({ color: 0x7b4c37, roughness: 0.78 }),
      window: new THREE.MeshBasicMaterial({ color: 0xfff0ba, transparent: true, opacity: 0.56, side: THREE.DoubleSide }),
      collision: new THREE.MeshBasicMaterial({ color: 0xff1935, transparent: true, opacity: 0.62, depthWrite: false, side: THREE.DoubleSide })
    };
  }

  function colorFromLayout(key, fallback) {
    return (layout.materials && layout.materials[key]) || fallback;
  }

  function initLights() {
    scene.add(new THREE.HemisphereLight(0xd8f1ff, 0x6f7b6a, 0.68));

    var sun = new THREE.DirectionalLight(0xfff3dc, 1.35);
    sun.position.set(45, 70, 35);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -80;
    sun.shadow.camera.right = 80;
    sun.shadow.camera.top = 80;
    sun.shadow.camera.bottom = -80;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 180;
    scene.add(sun);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  }

  function buildPreviewScene() {
    createGround();
    createDistricts();
    createCorridors();
    createRoadSurfaces();
    createGreenAreas();
    createParkingAreas();
    createPavedAreas();
    createTechnologyPlots();
    createBuildings();
    createMobileTowers();
    createLabels();
  }

  function createGround() {
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(125, 100),
      new THREE.MeshStandardMaterial({ color: 0xf2f0eb, roughness: 0.96 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.03;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  function createDistricts() {
    (layout.districts || []).forEach(function (district) {
      var mesh = makePlaneFromRect(district.worldRect, new THREE.MeshStandardMaterial({
        color: district.color || "#f1eee7",
        roughness: 0.96
      }), 0.0);
      districtGroup.add(mesh);
    });
  }

  function createCorridors() {
    (layout.noBuildCorridors || []).forEach(function (corridor) {
      var mesh = makePlaneFromRect(corridor.worldRect, materials.corridor, 0.012);
      mesh.userData.id = corridor.id;
      corridorGroup.add(mesh);
    });
  }

  function createRoadSurfaces() {
    (layout.roadSurfaces || []).forEach(function (road, index) {
      var mesh = makePlaneFromRect(road.worldRect, materials.road, 0.026 + index * 0.0002);
      mesh.userData.id = road.id;
      roadGroup.add(mesh);
      addRoadMarkings(road, index);
    });
  }

  function addRoadMarkings(road) {
    var rect = road.worldRect;
    var isHorizontal = rect.width >= rect.depth;
    var dashMaterial = new THREE.MeshBasicMaterial({ color: 0xf3f6d0, transparent: true, opacity: 0.58 });
    var step = 7.5;
    var start = isHorizontal ? rect.x - rect.width / 2 + 4 : rect.z - rect.depth / 2 + 4;
    var end = isHorizontal ? rect.x + rect.width / 2 - 4 : rect.z + rect.depth / 2 - 4;

    for (var value = start; value <= end; value += step) {
      var dash = new THREE.Mesh(
        isHorizontal ? new THREE.PlaneGeometry(1.8, 0.16) : new THREE.PlaneGeometry(0.16, 1.8),
        dashMaterial
      );
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(isHorizontal ? value : rect.x, 0.055, isHorizontal ? rect.z : value);
      roadGroup.add(dash);
    }
  }

  function createGreenAreas() {
    (layout.greenAreas || []).forEach(function (area) {
      var material = new THREE.MeshStandardMaterial({ color: area.color || colorFromLayout("green", "#cfe3bd"), roughness: 0.96 });
      var mesh = makePlaneFromRect(area.worldRect, material, 0.04);
      mesh.userData.id = area.id;
      greenGroup.add(mesh);
    });
  }

  function createParkingAreas() {
    (layout.parkingAreas || []).forEach(function (area) {
      var mesh = makePlaneFromRect(area.worldRect, materials.parking, 0.045);
      mesh.userData.id = area.id;
      parkingGroup.add(mesh);
      addParkingStripes(area.worldRect);
    });
  }

  function createPavedAreas() {
    (layout.pavedAreas || []).forEach(function (area) {
      var mesh = makePlaneFromRect(area.worldRect, materials.paved, 0.05);
      mesh.userData.id = area.id;
      pavedGroup.add(mesh);
    });
  }

  function createTechnologyPlots() {
    (layout.technologyPlots || []).forEach(function (plot) {
      var techMaterial = new THREE.MeshStandardMaterial({ color: 0xf3d6e6, roughness: 0.92 });
      var mesh = makePlaneFromRect(plot.worldRect, techMaterial, 0.052);
      mesh.userData.id = plot.id;
      pavedGroup.add(mesh);
    });
  }

  function addParkingStripes(rect) {
    var count = Math.max(2, Math.floor(rect.width / 1.6));
    var stripeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.56 });
    var left = rect.x - rect.width / 2;

    for (var i = 1; i < count; i++) {
      var x = left + (rect.width / count) * i;
      var stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.08, Math.max(0.4, rect.depth - 0.35)), stripeMaterial);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(x, 0.068, rect.z);
      parkingGroup.add(stripe);
    }
  }

  function makePlaneFromRect(rect, material, y) {
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(rect.width, rect.depth), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(rect.x, y, rect.z);
    mesh.receiveShadow = true;
    return mesh;
  }

  function createBuildings() {
    (layout.buildings || []).forEach(function (building) {
      var mesh;
      if (building.roof === "oval") {
        mesh = createOvalBuilding(building);
      } else {
        mesh = createRectangularBuilding(building);
      }

      mesh.userData.id = building.id;
      mesh.userData.name = building.name;
      buildingGroup.add(mesh);
    });
  }

  function createRectangularBuilding(building) {
    var rect = building.worldRect;
    var group = new THREE.Group();
    group.position.set(rect.x, 0, rect.z);

    var bodyHeight = building.roof === "pitched" ? Math.max(1.4, building.height - 1.15) : building.height;
    var body = new THREE.Mesh(
      new THREE.BoxGeometry(rect.width, bodyHeight, rect.depth),
      new THREE.MeshStandardMaterial({ color: building.color || "#cccccc", roughness: 0.74, metalness: 0.02 })
    );
    body.position.y = bodyHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    addFacadeGrid(group, rect.width, rect.depth, bodyHeight, building.type);

    if (building.roof === "pitched") {
      var roof = createPitchedRoof(rect.width + 0.22, rect.depth + 0.22, 1.15, materials.roofPitched);
      roof.position.y = bodyHeight;
      roof.castShadow = true;
      group.add(roof);
    } else {
      var flatRoof = new THREE.Mesh(
        new THREE.BoxGeometry(rect.width + 0.22, 0.24, rect.depth + 0.22),
        materials.roofFlat
      );
      flatRoof.position.y = bodyHeight + 0.13;
      flatRoof.castShadow = true;
      group.add(flatRoof);
    }

    return group;
  }

  function createPitchedRoof(width, depth, height, material) {
    var hw = width / 2;
    var hd = depth / 2;
    var vertices = new Float32Array([
      -hw, 0, -hd,
       hw, 0, -hd,
       0, height, -hd,
      -hw, 0,  hd,
       hw, 0,  hd,
       0, height,  hd
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

  function createOvalBuilding(building) {
    var rect = building.worldRect;
    var group = new THREE.Group();
    group.position.set(rect.x, 0, rect.z);

    var base = new THREE.Mesh(
      new THREE.CylinderGeometry(rect.width / 2, rect.width / 2, building.height, 64),
      new THREE.MeshStandardMaterial({ color: building.color || "#b8addb", roughness: 0.74 })
    );
    base.scale.z = rect.depth / rect.width;
    base.position.y = building.height / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    var roof = new THREE.Mesh(
      new THREE.CylinderGeometry(rect.width / 2 + 0.25, rect.width / 2 + 0.25, 0.25, 64),
      materials.roofFlat
    );
    roof.scale.z = (rect.depth + 0.5) / (rect.width + 0.5);
    roof.position.y = building.height + 0.16;
    roof.castShadow = true;
    group.add(roof);

    var infield = new THREE.Mesh(
      new THREE.CylinderGeometry(rect.width / 3.8, rect.width / 3.8, 0.08, 48),
      new THREE.MeshStandardMaterial({ color: 0x8ec77b, roughness: 0.85 })
    );
    infield.scale.z = 0.58;
    infield.position.y = building.height + 0.32;
    group.add(infield);

    return group;
  }

  function addFacadeGrid(group, width, depth, height, type) {
    var floors = Math.max(1, Math.floor(height / 2.0));
    var columns = Math.max(2, Math.floor(width / 1.2));
    var frontZ = depth / 2 + 0.012;
    var backZ = -depth / 2 - 0.012;
    var windowW = type === "detached_house" ? 0.28 : 0.36;
    var windowH = type === "detached_house" ? 0.38 : 0.46;

    for (var floor = 1; floor <= floors; floor++) {
      var y = Math.min(height - 0.75, floor * (height / (floors + 1)) + 0.2);
      for (var col = 0; col < columns; col++) {
        var x = -width / 2 + 0.55 + col * ((width - 1.1) / Math.max(1, columns - 1));
        addWindowPlane(group, x, y, frontZ, 0, windowW, windowH);
        addWindowPlane(group, x, y, backZ, Math.PI, windowW, windowH);
      }
    }

    var sideRows = Math.max(1, Math.floor(depth / 1.4));
    for (var row = 0; row < sideRows; row++) {
      var z = -depth / 2 + 0.65 + row * ((depth - 1.3) / Math.max(1, sideRows - 1));
      var sideY = Math.min(height - 0.8, height * 0.52);
      addWindowPlane(group, width / 2 + 0.012, sideY, z, Math.PI / 2, windowW, windowH);
      addWindowPlane(group, -width / 2 - 0.012, sideY, z, -Math.PI / 2, windowW, windowH);
    }
  }

  function addWindowPlane(group, x, y, z, rotationY, width, height) {
    var windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), materials.window);
    windowMesh.position.set(x, y, z);
    windowMesh.rotation.y = rotationY;
    group.add(windowMesh);
  }

  function createMobileTowers() {
    (layout.mobileTowers || []).forEach(function (tower) {
      var rect = tower.worldRect;
      var group = new THREE.Group();
      group.position.set(rect.x, 0, rect.z);

      var mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.18, tower.height, 14),
        new THREE.MeshStandardMaterial({ color: 0xdbe4eb, roughness: 0.45, metalness: 0.35 })
      );
      mast.position.y = tower.height / 2;
      mast.castShadow = true;
      group.add(mast);

      var platform = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.12, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xb4c2cc, roughness: 0.5, metalness: 0.25 })
      );
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
        new THREE.MeshBasicMaterial({ color: 0xff2f9a, transparent: true, opacity: 0.9 })
      );
      beacon.position.y = tower.height + 0.35;
      beacon.userData.isTowerBeacon = true;
      group.add(beacon);

      var cabinet = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.82, 0.58),
        new THREE.MeshStandardMaterial({ color: 0xd6e1ea, roughness: 0.68 })
      );
      cabinet.position.set(rect.width / 2 - 0.55, 0.41, -rect.depth / 2 + 0.65);
      cabinet.castShadow = true;
      group.add(cabinet);

      group.userData.id = tower.id;
      towerGroup.add(group);
    });
  }

  function createLabels() {
    (layout.districts || []).forEach(function (district) {
      addLabel(district.name, district.worldRect.x, 0.6, district.worldRect.z + district.worldRect.depth / 2 - 1.3, "#1b2c42");
    });

    (layout.buildings || []).forEach(function (building) {
      addLabel(building.id, building.worldRect.x, building.height + 1.1, building.worldRect.z, "#213145");
    });

    (layout.mobileTowers || []).forEach(function (tower) {
      addLabel(tower.id, tower.worldRect.x, tower.height + 1.2, tower.worldRect.z, "#b00063");
    });
  }

  function addLabel(text, x, y, z, color) {
    var sprite = createTextSprite(text, color);
    sprite.position.set(x, y, z);
    labelSprites.push(sprite);
    labelGroup.add(sprite);
  }

  function createTextSprite(text, backgroundColor) {
    var canvas = document.createElement("canvas");
    canvas.width = 384;
    canvas.height = 96;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor || "#213145";
    roundRect(ctx, 8, 18, 368, 60, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.72)";
    ctx.lineWidth = 3;
    roundRect(ctx, 8, 18, 368, 60, 16);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 192, 49);

    var texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    var material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    var sprite = new THREE.Sprite(material);
    sprite.scale.set(5.0, 1.25, 1);
    return sprite;
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function createErrorOverlays(result) {
    collisionGroup.clear();

    result.errors.forEach(function (error) {
      if (!error.intersection) return;
      var mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(Math.max(error.intersection.width, 0.08), Math.max(error.intersection.depth, 0.08)),
        materials.collision
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(error.intersection.x, 0.38, error.intersection.z);
      mesh.userData.id = error.a + "__" + error.b;
      collisionGroup.add(mesh);
    });
  }

  function updateValidationPanel(result) {
    validationOutput.textContent = result.lines.join("\n");
    validationPanel.classList.remove("passed", "failed");
    validationPanel.classList.add(result.status === "PASSED" ? "passed" : "failed");

    objectCounts.textContent =
      "Gebäude: " + result.metadata.buildings +
      " · Mobilfunkmasten: " + result.metadata.mobileTowers +
      " · Straßenflächen: " + result.metadata.roadSurfaces +
      " · Korridore: " + result.metadata.noBuildCorridors;

    if (result.errors.length === 0) {
      validationErrors.innerHTML = "<p class='status-pill passed'>STATUS: PASSED</p>";
      return;
    }

    var html = "<p class='status-pill failed'>STATUS: FAILED</p><ul id='error-list'>";
    result.errors.forEach(function (error) {
      html += "<li>" + escapeHtml(error.check) + ": <strong>" + escapeHtml(error.a) + "</strong> ↔ <strong>" + escapeHtml(error.b) + "</strong></li>";
    });
    html += "</ul>";
    validationErrors.innerHTML = html;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function bindUi() {
    document.getElementById("view-top").addEventListener("click", function () { setView("top"); });
    document.getElementById("view-iso").addEventListener("click", function () { setView("iso"); });
    document.getElementById("view-street").addEventListener("click", function () { setView("street"); });
    document.getElementById("reset-camera").addEventListener("click", function () { setView(activeView); });

    document.getElementById("toggle-labels").addEventListener("change", function (event) {
      labelGroup.visible = event.target.checked;
    });

    document.getElementById("toggle-collisions").addEventListener("change", function (event) {
      collisionGroup.visible = event.target.checked;
    });

    document.getElementById("toggle-corridors").addEventListener("change", function (event) {
      corridorGroup.visible = event.target.checked;
    });

    renderer.domElement.addEventListener("mousedown", function (event) {
      orbit.isDragging = true;
      orbit.lastX = event.clientX;
      orbit.lastY = event.clientY;
    });

    window.addEventListener("mouseup", function () {
      orbit.isDragging = false;
    });

    window.addEventListener("mousemove", function (event) {
      if (!orbit.isDragging || activeView === "top") return;
      var dx = event.clientX - orbit.lastX;
      var dy = event.clientY - orbit.lastY;
      orbit.lastX = event.clientX;
      orbit.lastY = event.clientY;
      orbit.yaw -= dx * 0.006;
      orbit.pitch = clamp(orbit.pitch + dy * 0.004, 0.16, 1.18);
      updatePerspectiveOrbit();
    });

    renderer.domElement.addEventListener("wheel", function (event) {
      event.preventDefault();
      if (activeView === "top") {
        var zoomFactor = event.deltaY > 0 ? 1.08 : 0.92;
        orthographicCamera.zoom = clamp(orthographicCamera.zoom / zoomFactor, 0.65, 2.4);
        orthographicCamera.updateProjectionMatrix();
      } else {
        orbit.distance = clamp(orbit.distance + event.deltaY * 0.05, 16, 140);
        updatePerspectiveOrbit();
      }
    }, { passive: false });

    window.addEventListener("resize", resizeRenderer);
  }

  function setView(view) {
    activeView = view;
    updateActiveButtons(view);

    if (view === "top") {
      activeCamera = orthographicCamera;
      viewBadge.textContent = "Draufsicht";
      orthographicCamera.position.set(0, 115, 0);
      orthographicCamera.up.set(0, 0, -1);
      orthographicCamera.lookAt(0, 0, 0);
      orthographicCamera.zoom = 0.95;
      resizeOrthographicCamera();
      return;
    }

    activeCamera = perspectiveCamera;
    perspectiveCamera.up.set(0, 1, 0);

    if (view === "iso") {
      viewBadge.textContent = "Isometrisch";
      orbit.target.set(0, 0, 0);
      orbit.yaw = -0.78;
      orbit.pitch = 0.72;
      orbit.distance = 86;
      updatePerspectiveOrbit();
      return;
    }

    viewBadge.textContent = "Straßenhöhe";
    orbit.target.set(-10, 1.4, 5);
    orbit.yaw = -1.35;
    orbit.pitch = 0.2;
    orbit.distance = 34;
    updatePerspectiveOrbit();
  }

  function updateActiveButtons(view) {
    ["view-top", "view-iso", "view-street"].forEach(function (id) {
      document.getElementById(id).classList.remove("active-view");
    });

    if (view === "top") document.getElementById("view-top").classList.add("active-view");
    if (view === "iso") document.getElementById("view-iso").classList.add("active-view");
    if (view === "street") document.getElementById("view-street").classList.add("active-view");
  }

  function updatePerspectiveOrbit() {
    var x = orbit.target.x + Math.sin(orbit.yaw) * Math.cos(orbit.pitch) * orbit.distance;
    var z = orbit.target.z + Math.cos(orbit.yaw) * Math.cos(orbit.pitch) * orbit.distance;
    var y = orbit.target.y + Math.sin(orbit.pitch) * orbit.distance;
    perspectiveCamera.position.set(x, y, z);
    perspectiveCamera.lookAt(orbit.target);
  }

  function resizeRenderer() {
    var width = Math.max(1, container.clientWidth || window.innerWidth);
    var height = Math.max(1, container.clientHeight || window.innerHeight);
    renderer.setSize(width, height);
    perspectiveCamera.aspect = width / height;
    perspectiveCamera.updateProjectionMatrix();
    resizeOrthographicCamera();
  }

  function resizeOrthographicCamera() {
    var width = Math.max(1, container.clientWidth || window.innerWidth);
    var height = Math.max(1, container.clientHeight || window.innerHeight);
    var aspect = width / height;
    var frustumHeight = 96;
    orthographicCamera.left = -frustumHeight * aspect / 2;
    orthographicCamera.right = frustumHeight * aspect / 2;
    orthographicCamera.top = frustumHeight / 2;
    orthographicCamera.bottom = -frustumHeight / 2;
    orthographicCamera.updateProjectionMatrix();
  }

  function animate() {
    var elapsed = clock.getElapsedTime();

    towerGroup.traverse(function (object) {
      if (object.userData.isTowerBeacon && object.material) {
        object.material.opacity = 0.55 + Math.sin(elapsed * 4.0) * 0.3;
      }
    });

    renderer.render(scene, activeCamera);
    requestAnimationFrame(animate);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
})();
