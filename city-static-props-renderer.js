/* Mission BOS - Build 008R.3
   Validated Static World Detailing

   Production renderer for window.MISSION_BOS_STATIC_PROPS.
   No modules. No fetch. No random placement. No dynamic updates.
*/

(function () {
  "use strict";

  function assertDependency(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function create(options) {
    options = options || {};

    assertDependency(typeof THREE !== "undefined", "THREE is not loaded.");
    assertDependency(options.scene && typeof options.scene.add === "function", "A valid Three.js scene is required.");
    assertDependency(options.recoveryCity && options.recoveryCity.buildingsById, "A valid recovery city is required.");
    assertDependency(options.layout, "MISSION_BOS_RECOVERY_LAYOUT is required.");
    assertDependency(options.plan, "MISSION_BOS_STATIC_PROPS is required.");
    assertDependency(
      options.validator && typeof options.validator.validate === "function",
      "MissionBosStaticPropsValidator is required."
    );

    var scene = options.scene;
    var recoveryCity = options.recoveryCity;
    var layout = options.layout;
    var plan = options.plan;
    var validator = options.validator;
    var validation = validator.validate(layout, plan);

    validator.logResult(validation);

    var renderedCounts = createEmptyCounts();
    var expectedCounts = plan.expectedCounts || {};

    if (validation.status !== "PASSED") {
      console.error("MISSION BOS STATIC PROPS RENDERING ABORTED: validation failed.");

      var failedManifest = createRenderManifest(renderedCounts, expectedCounts);
      logRenderManifest(failedManifest);

      return {
        root: null,
        groups: null,
        propsById: Object.create(null),
        buildingSignsById: Object.create(null),
        validation: validation,
        renderedCounts: renderedCounts,
        manifest: failedManifest
      };
    }

    var root = new THREE.Group();
    root.name = "MissionBosStaticProps";
    root.position.set(0, 0, 0);
    root.rotation.set(0, 0, 0);
    root.scale.set(1, 1, 1);

    var groups = {
      trees: new THREE.Group(),
      shrubs: new THREE.Group(),
      benches: new THREE.Group(),
      lamps: new THREE.Group(),
      signs: new THREE.Group(),
      bollards: new THREE.Group(),
      buildingSigns: new THREE.Group()
    };

    Object.keys(groups).forEach(function (key) {
      groups[key].name = "StaticProps_" + key;
      root.add(groups[key]);
    });

    var propsById = Object.create(null);
    var buildingSignsById = Object.create(null);
    var resources = createSharedResources();
    var context = {
      scene: scene,
      recoveryCity: recoveryCity,
      layout: layout,
      plan: plan,
      root: root,
      groups: groups,
      propsById: propsById,
      buildingSignsById: buildingSignsById,
      renderedCounts: renderedCounts,
      resources: resources
    };

    (plan.props || []).forEach(function (prop) {
      var object = createGroundProp(context, prop);
      if (!object) return;

      object.name = prop.id;
      object.userData.id = prop.id;
      object.userData.sourceData = prop;
      object.position.set(prop.worldRect.x, 0, prop.worldRect.z);
      object.rotation.y = typeof prop.rotation === "number" ? prop.rotation : 0;

      var targetGroup = getTargetGroup(groups, prop.type);
      targetGroup.add(object);
      propsById[prop.id] = object;
      renderedCounts[prop.type] += 1;
    });

    (plan.buildingSigns || []).forEach(function (signDefinition) {
      var signObject = createBuildingSign(context, signDefinition);
      if (!signObject) return;

      buildingSignsById[signDefinition.id] = signObject;
      groups.buildingSigns.userData.attachedSignIds = groups.buildingSigns.userData.attachedSignIds || [];
      groups.buildingSigns.userData.attachedSignIds.push(signDefinition.id);
      renderedCounts.buildingSigns += 1;
    });

    scene.add(root);

    var manifest = createRenderManifest(renderedCounts, expectedCounts);
    logRenderManifest(manifest);

    return {
      root: root,
      groups: groups,
      propsById: propsById,
      buildingSignsById: buildingSignsById,
      validation: validation,
      renderedCounts: renderedCounts,
      manifest: manifest
    };
  }

  function createEmptyCounts() {
    return {
      tree: 0,
      shrub: 0,
      bench: 0,
      lamp: 0,
      sign: 0,
      bollard: 0,
      buildingSigns: 0
    };
  }

  function createSharedResources() {
    return {
      geometries: {
        treeTrunk: new THREE.CylinderGeometry(0.1, 0.14, 1.55, 8),
        deciduousCrown: new THREE.DodecahedronGeometry(0.56, 1),
        urbanCrownLower: new THREE.DodecahedronGeometry(0.49, 1),
        urbanCrownUpper: new THREE.DodecahedronGeometry(0.38, 1),
        shrub: new THREE.DodecahedronGeometry(0.23, 0),
        lampPole: new THREE.CylinderGeometry(0.045, 0.06, 3.05, 8),
        lampArm: new THREE.BoxGeometry(0.52, 0.055, 0.055),
        lampHead: new THREE.BoxGeometry(0.28, 0.12, 0.18),
        signPole: new THREE.CylinderGeometry(0.04, 0.055, 1.55, 8),
        bollard: new THREE.CylinderGeometry(0.085, 0.1, 0.52, 10),
        bollardBand: new THREE.CylinderGeometry(0.102, 0.102, 0.075, 10)
      },
      materials: {
        trunk: new THREE.MeshStandardMaterial({ color: 0x6f482d, roughness: 0.9 }),
        deciduousLeaf: new THREE.MeshStandardMaterial({ color: 0x3f8b51, roughness: 0.94 }),
        urbanLeaf: new THREE.MeshStandardMaterial({ color: 0x4d985b, roughness: 0.94 }),
        shrub: new THREE.MeshStandardMaterial({ color: 0x4c9854, roughness: 0.96 }),
        benchWood: new THREE.MeshStandardMaterial({ color: 0x8a5a32, roughness: 0.84 }),
        benchMetal: new THREE.MeshStandardMaterial({ color: 0x47515c, roughness: 0.58, metalness: 0.2 }),
        lampMetal: new THREE.MeshStandardMaterial({ color: 0x485460, roughness: 0.52, metalness: 0.34 }),
        lampGlow: new THREE.MeshStandardMaterial({
          color: 0xffe7a8,
          emissive: 0xffcf68,
          emissiveIntensity: 1.15,
          roughness: 0.3
        }),
        signMetal: new THREE.MeshStandardMaterial({ color: 0x596675, roughness: 0.55, metalness: 0.22 }),
        bollard: new THREE.MeshStandardMaterial({ color: 0x4d5660, roughness: 0.58, metalness: 0.18 }),
        reflector: new THREE.MeshBasicMaterial({ color: 0xf7f1cf })
      }
    };
  }

  function getTargetGroup(groups, type) {
    if (type === "tree") return groups.trees;
    if (type === "shrub") return groups.shrubs;
    if (type === "bench") return groups.benches;
    if (type === "lamp") return groups.lamps;
    if (type === "sign") return groups.signs;
    if (type === "bollard") return groups.bollards;
    throw new Error("Unsupported static prop type: " + type);
  }

  function createGroundProp(context, prop) {
    if (prop.type === "tree") return createTree(context, prop);
    if (prop.type === "shrub") return createShrub(context, prop);
    if (prop.type === "bench") return createBench(context, prop);
    if (prop.type === "lamp") return createLamp(context, prop);
    if (prop.type === "sign") return createDirectionalSign(context, prop);
    if (prop.type === "bollard") return createBollard(context, prop);
    throw new Error("Unsupported static prop type: " + prop.type);
  }

  function createTree(context, prop) {
    var group = new THREE.Group();
    var resources = context.resources;
    var style = prop.style || "deciduous";

    var trunk = new THREE.Mesh(resources.geometries.treeTrunk, resources.materials.trunk);
    trunk.name = prop.id + "_TRUNK";
    trunk.position.y = 0.775;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    if (style === "urban") {
      var lowerCrown = new THREE.Mesh(resources.geometries.urbanCrownLower, resources.materials.urbanLeaf);
      lowerCrown.name = prop.id + "_CROWN_LOWER";
      lowerCrown.position.y = 1.95;
      lowerCrown.scale.set(0.92, 1.08, 0.92);
      lowerCrown.castShadow = true;
      group.add(lowerCrown);

      var upperCrown = new THREE.Mesh(resources.geometries.urbanCrownUpper, resources.materials.urbanLeaf);
      upperCrown.name = prop.id + "_CROWN_UPPER";
      upperCrown.position.y = 2.62;
      upperCrown.scale.set(0.9, 1.08, 0.9);
      upperCrown.castShadow = true;
      group.add(upperCrown);
    } else {
      var crown = new THREE.Mesh(resources.geometries.deciduousCrown, resources.materials.deciduousLeaf);
      crown.name = prop.id + "_CROWN";
      crown.position.y = 2.03;
      crown.scale.set(1.0, 1.08, 1.0);
      crown.castShadow = true;
      group.add(crown);
    }

    return group;
  }

  function createShrub(context, prop) {
    var group = new THREE.Group();
    var geometry = context.resources.geometries.shrub;
    var material = context.resources.materials.shrub;
    var positions = [
      [-0.17, 0.25, 0.0, 1.0],
      [0.16, 0.24, -0.05, 0.92],
      [0.0, 0.3, 0.15, 0.82]
    ];

    positions.forEach(function (entry, index) {
      var leaf = new THREE.Mesh(geometry, material);
      leaf.name = prop.id + "_PART_" + (index + 1);
      leaf.position.set(entry[0], entry[1], entry[2]);
      leaf.scale.set(entry[3], entry[3] * 0.8, entry[3]);
      leaf.castShadow = true;
      group.add(leaf);
    });

    return group;
  }

  function createBench(context, prop) {
    var group = new THREE.Group();
    var rect = prop.worldRect;
    var length = Math.max(rect.width, rect.depth);
    var depth = Math.min(rect.width, rect.depth);
    var wood = context.resources.materials.benchWood;
    var metal = context.resources.materials.benchMetal;

    var seat = new THREE.Mesh(new THREE.BoxGeometry(length * 0.9, 0.12, depth * 0.62), wood);
    seat.name = prop.id + "_SEAT";
    seat.position.y = 0.48;
    seat.castShadow = true;
    group.add(seat);

    var back = new THREE.Mesh(new THREE.BoxGeometry(length * 0.9, 0.48, 0.1), wood);
    back.name = prop.id + "_BACK";
    back.position.set(0, 0.76, -depth * 0.24);
    back.rotation.x = -0.08;
    back.castShadow = true;
    group.add(back);

    [-1, 1].forEach(function (side, index) {
      var leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.46, 0.12), metal);
      leg.name = prop.id + "_LEG_" + (index + 1);
      leg.position.set(side * length * 0.31, 0.23, 0);
      leg.castShadow = true;
      group.add(leg);
    });

    return group;
  }

  function createLamp(context, prop) {
    var group = new THREE.Group();
    var resources = context.resources;

    var pole = new THREE.Mesh(resources.geometries.lampPole, resources.materials.lampMetal);
    pole.name = prop.id + "_POLE";
    pole.position.y = 1.525;
    pole.castShadow = true;
    group.add(pole);

    var arm = new THREE.Mesh(resources.geometries.lampArm, resources.materials.lampMetal);
    arm.name = prop.id + "_ARM";
    arm.position.set(0.24, 3.0, 0);
    group.add(arm);

    var head = new THREE.Mesh(resources.geometries.lampHead, resources.materials.lampGlow);
    head.name = prop.id + "_HEAD";
    head.position.set(0.48, 2.94, 0);
    group.add(head);

    return group;
  }

  function createDirectionalSign(context, prop) {
    var group = new THREE.Group();
    var pole = new THREE.Mesh(context.resources.geometries.signPole, context.resources.materials.signMetal);
    pole.name = prop.id + "_POLE";
    pole.position.y = 0.775;
    pole.castShadow = true;
    group.add(pole);

    var panelWidth = Math.min(3.8, Math.max(1.8, String(prop.text || "").length * 0.21));
    var panel = createTextPanel(prop.text || "", panelWidth, 0.58, {
      background: "#425b73",
      foreground: "#ffffff",
      border: "rgba(255,255,255,0.82)",
      fontSize: 42
    });
    panel.name = prop.id + "_PANEL";
    panel.position.set(0, 1.48, 0.035);
    group.add(panel);

    return group;
  }

  function createBollard(context, prop) {
    var group = new THREE.Group();

    var body = new THREE.Mesh(context.resources.geometries.bollard, context.resources.materials.bollard);
    body.name = prop.id + "_BODY";
    body.position.y = 0.26;
    body.castShadow = true;
    group.add(body);

    var band = new THREE.Mesh(context.resources.geometries.bollardBand, context.resources.materials.reflector);
    band.name = prop.id + "_REFLECTOR";
    band.position.y = 0.39;
    group.add(band);

    return group;
  }

  function createBuildingSign(context, signDefinition) {
    var buildingGroup = context.recoveryCity.buildingsById[signDefinition.buildingId];
    var buildingData = findById(context.layout.buildings || [], signDefinition.buildingId);

    if (!buildingGroup || !buildingData) {
      console.error("Building sign target missing: " + signDefinition.id + " → " + signDefinition.buildingId);
      return null;
    }

    var rect = buildingData.worldRect;
    var panelWidth = Math.min(rect.width * 0.82, Math.max(1.7, String(signDefinition.text || "").length * 0.24));
    var panelHeight = Math.min(0.68, Math.max(0.48, buildingData.height * 0.1));
    var panel = createTextPanel(signDefinition.text || "", panelWidth, panelHeight, {
      background: getBuildingSignColor(signDefinition.buildingId),
      foreground: "#ffffff",
      border: "rgba(255,255,255,0.88)",
      fontSize: 40
    });

    panel.name = signDefinition.id;
    panel.userData.id = signDefinition.id;
    panel.userData.sourceData = signDefinition;

    var y = Math.max(1.15, Math.min(buildingData.height - 0.65, buildingData.height * 0.68));
    attachPanelToFacade(panel, signDefinition.side || "front", rect.width, rect.depth, y);
    buildingGroup.add(panel);

    return panel;
  }

  function getBuildingSignColor(buildingId) {
    if (buildingId === "B01") return "#2d8db8";
    if (buildingId === "B02") return "#2269a8";
    if (buildingId === "B03") return "#9c2d75";
    if (buildingId === "B04") return "#b93c3c";
    if (buildingId === "G01" || buildingId === "G02") return "#b6464f";
    if (buildingId === "E01" || buildingId === "E03") return "#7459a4";
    if (buildingId === "I01" || buildingId === "I02") return "#8a6b2f";
    return "#44586d";
  }

  function attachPanelToFacade(panel, side, width, depth, y) {
    var offset = 0.026;

    if (side === "back") {
      panel.position.set(0, y, -depth / 2 - offset);
      panel.rotation.y = Math.PI;
      return;
    }

    if (side === "left") {
      panel.position.set(-width / 2 - offset, y, 0);
      panel.rotation.y = -Math.PI / 2;
      return;
    }

    if (side === "right") {
      panel.position.set(width / 2 + offset, y, 0);
      panel.rotation.y = Math.PI / 2;
      return;
    }

    panel.position.set(0, y, depth / 2 + offset);
    panel.rotation.y = 0;
  }

  function createTextPanel(text, width, height, palette) {
    var canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 192;

    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = palette.background;
    drawRoundedRect(context, 10, 18, 748, 156, 22);
    context.fill();
    context.strokeStyle = palette.border;
    context.lineWidth = 6;
    drawRoundedRect(context, 10, 18, 748, 156, 22);
    context.stroke();
    context.fillStyle = palette.foreground;
    context.font = "700 " + palette.fontSize + "px Arial, Helvetica, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    fitText(context, String(text), 710, palette.fontSize);
    context.fillText(String(text), 384, 98);

    var texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;

    return new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
  }

  function fitText(context, text, maximumWidth, initialSize) {
    var size = initialSize;

    while (size > 20 && context.measureText(text).width > maximumWidth) {
      size -= 2;
      context.font = "700 " + size + "px Arial, Helvetica, sans-serif";
    }
  }

  function drawRoundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  function findById(collection, id) {
    for (var i = 0; i < collection.length; i += 1) {
      if (collection[i].id === id) return collection[i];
    }
    return null;
  }

  function createRenderManifest(renderedCounts, expectedCounts) {
    var lines = [
      "MISSION BOS STATIC PROPS RENDER MANIFEST",
      "Rendered trees: " + renderedCounts.tree + " / " + (expectedCounts.tree || 0),
      "Rendered shrubs: " + renderedCounts.shrub + " / " + (expectedCounts.shrub || 0),
      "Rendered benches: " + renderedCounts.bench + " / " + (expectedCounts.bench || 0),
      "Rendered lamps: " + renderedCounts.lamp + " / " + (expectedCounts.lamp || 0),
      "Rendered signs: " + renderedCounts.sign + " / " + (expectedCounts.sign || 0),
      "Rendered bollards: " + renderedCounts.bollard + " / " + (expectedCounts.bollard || 0),
      "Rendered building signs: " + renderedCounts.buildingSigns + " / " + (expectedCounts.buildingSigns || 0)
    ];

    var passed =
      renderedCounts.tree === (expectedCounts.tree || 0) &&
      renderedCounts.shrub === (expectedCounts.shrub || 0) &&
      renderedCounts.bench === (expectedCounts.bench || 0) &&
      renderedCounts.lamp === (expectedCounts.lamp || 0) &&
      renderedCounts.sign === (expectedCounts.sign || 0) &&
      renderedCounts.bollard === (expectedCounts.bollard || 0) &&
      renderedCounts.buildingSigns === (expectedCounts.buildingSigns || 0);

    lines.push("STATIC PROPS RENDER MANIFEST: " + (passed ? "PASSED" : "FAILED"));

    return {
      title: lines[0],
      status: passed ? "PASSED" : "FAILED",
      lines: lines,
      renderedCounts: renderedCounts,
      expectedCounts: expectedCounts
    };
  }

  function logRenderManifest(manifest) {
    var method = manifest.status === "PASSED" ? "log" : "error";
    console.group(manifest.title);
    manifest.lines.slice(1).forEach(function (line) {
      console[method](line);
    });
    console.groupEnd();
  }

  window.MissionBosStaticPropsRenderer = {
    create: create
  };
})();
