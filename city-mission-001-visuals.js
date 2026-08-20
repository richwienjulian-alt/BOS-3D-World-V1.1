/* Mission BOS - Build 008R.8
   Deterministic Mission 001 visuals for W14.
   No modules. No fetch. No randomization. No ground props.
*/
(function () {
  "use strict";

  function create(options) {
    options = options || {};
    var scene = options.scene;
    var plan = options.plan;

    if (typeof THREE === "undefined" || !scene || !plan || !plan.visuals) {
      console.error("MISSION BOS MISSION 001 VISUALS: Missing THREE, scene or mission plan.");
      return createFailedRuntime(scene);
    }

    var visualPlan = plan.visuals;
    var stateMap = Object.create(null);
    (plan.states || []).forEach(function (state) {
      if (state && state.id) stateMap[state.id] = state;
    });

    var root = new THREE.Group();
    root.name = "Mission001VisualsRoot";
    root.position.set(0, 0, 0);
    root.rotation.set(0, 0, 0);
    root.scale.set(1, 1, 1);
    scene.add(root);

    var smokeGroup = new THREE.Group();
    smokeGroup.name = "Mission001Smoke";
    var flameGroup = new THREE.Group();
    flameGroup.name = "Mission001Flames";
    var glowGroup = new THREE.Group();
    glowGroup.name = "Mission001WindowGlow";
    root.add(smokeGroup, flameGroup, glowGroup);

    var smokeItems = [];
    var flameItems = [];
    var glowItems = [];
    var currentState = "READY";
    var safety = { status: "PASSED", message: "" };

    var smokePlan = visualPlan.smoke || {};
    var smokeCount = Math.max(0, Number(smokePlan.count) || 0);
    var smokeRadius = Math.max(0, Number(smokePlan.horizontalRadius) || 0);
    var smokeSpan = Math.max(0, Number(smokePlan.verticalSpan) || 0);
    var smokeAnchor = visualPlan.roofSmokeAnchor || { x: 0, y: 0, z: 0 };
    var smokeGeometry = new THREE.DodecahedronGeometry(0.62, 0);

    for (var i = 0; i < smokeCount; i += 1) {
      var smokeMaterial = new THREE.MeshStandardMaterial({
        color: smokePlan.baseColor || "#5f6670",
        transparent: true,
        opacity: 0,
        roughness: 1,
        depthWrite: false
      });
      var puff = new THREE.Mesh(smokeGeometry, smokeMaterial);
      var angle = smokeCount > 0 ? (i / smokeCount) * Math.PI * 2 : 0;
      var radialFactor = 0.22 + (i % 4) * 0.12;
      var baseScale = 0.7 + (i % 3) * 0.13;
      puff.userData.missionSmoke = {
        index: i,
        angle: angle,
        radial: smokeRadius * radialFactor,
        verticalOffset: smokeCount > 1 ? (i / (smokeCount - 1)) * smokeSpan * 0.38 : 0,
        baseScale: baseScale
      };
      puff.position.set(
        Number(smokeAnchor.x) + Math.cos(angle) * puff.userData.missionSmoke.radial,
        Number(smokeAnchor.y) + puff.userData.missionSmoke.verticalOffset,
        Number(smokeAnchor.z) + Math.sin(angle) * puff.userData.missionSmoke.radial
      );
      puff.scale.setScalar(baseScale);
      puff.castShadow = false;
      smokeGroup.add(puff);
      smokeItems.push(puff);
    }

    var flamePlan = visualPlan.flames || {};
    var flameCount = Math.max(0, Number(flamePlan.count) || 0);
    var facadeAnchor = visualPlan.facadeAnchor || { x: 0, y: 0, z: 0 };
    var flameGeometry = new THREE.ConeGeometry(0.28, 1.15, 9);

    for (var j = 0; j < flameCount; j += 1) {
      var flameMaterial = new THREE.MeshBasicMaterial({
        color: j % 2 === 0 ? (flamePlan.outerColor || "#ff5a1f") : (flamePlan.innerColor || "#ffcf4a"),
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      var flame = new THREE.Mesh(flameGeometry, flameMaterial);
      var lateral = (j - (flameCount - 1) / 2) * 0.48;
      flame.position.set(
        Number(facadeAnchor.x) - 0.08,
        Number(facadeAnchor.y) + 0.15 + (j % 2) * 0.18,
        Number(facadeAnchor.z) + lateral
      );
      flame.userData.missionFlame = { index: j, baseY: flame.position.y };
      flame.rotation.z = (j % 2 === 0 ? -1 : 1) * 0.08;
      flameGroup.add(flame);
      flameItems.push(flame);
    }

    var glowPlan = visualPlan.windowGlow || {};
    var glowCount = Math.max(0, Number(glowPlan.count) || 0);
    for (var k = 0; k < glowCount; k += 1) {
      var glow = new THREE.Mesh(
        new THREE.PlaneGeometry(2.15, 1.7),
        new THREE.MeshBasicMaterial({
          color: glowPlan.color || "#ff6a2d",
          transparent: true,
          opacity: 0,
          depthWrite: false,
          side: THREE.DoubleSide
        })
      );
      glow.position.set(
        Number(facadeAnchor.x) - 0.1,
        Number(facadeAnchor.y),
        Number(facadeAnchor.z)
      );
      glow.rotation.y = Math.PI / 2;
      glowGroup.add(glow);
      glowItems.push(glow);
    }

    var renderedCounts = {
      smokePuffs: smokeItems.length,
      flames: flameItems.length,
      windowGlows: glowItems.length,
      groundProps: 0
    };
    var expectedCounts = {
      smokePuffs: smokeCount,
      flames: flameCount,
      windowGlows: glowCount,
      groundProps: (visualPlan.groundProps || []).length
    };
    var manifestPassed = Object.keys(expectedCounts).every(function (key) {
      return renderedCounts[key] === expectedCounts[key];
    });
    var manifest = {
      title: "MISSION BOS MISSION 001 VISUAL MANIFEST",
      status: manifestPassed ? "PASSED" : "FAILED",
      rendered: renderedCounts,
      expected: expectedCounts
    };

    logManifest(manifest);
    if (!manifestPassed) {
      safety = { status: "FAILED", message: "Mission visual manifest failed." };
    }

    function setState(stateId) {
      if (!stateMap[stateId]) {
        console.error("MISSION BOS MISSION 001 VISUALS: Unknown state " + stateId);
        safety = { status: "FAILED", message: "Unknown visual state: " + stateId };
        root.visible = false;
        return false;
      }
      currentState = stateId;
      applyVisibility();
      return true;
    }

    function applyVisibility() {
      var stateDefinition = stateMap[currentState] || stateMap.READY || {};
      var smokeVisible = manifestPassed && stateDefinition.smokeVisible === true;
      var fireVisible = manifestPassed && stateDefinition.fireVisible === true;
      smokeGroup.visible = smokeVisible;
      flameGroup.visible = fireVisible;
      glowGroup.visible = fireVisible;
      root.visible = smokeVisible || fireVisible;

      if (!smokeVisible) {
        smokeItems.forEach(function (item) { item.material.opacity = 0; });
      }
      if (!fireVisible) {
        flameItems.forEach(function (item) { item.material.opacity = 0; });
        glowItems.forEach(function (item) { item.material.opacity = 0; });
      }
    }

    function update(delta, elapsed) {
      if (!manifestPassed || safety.status !== "PASSED" || !root.visible) return;
      var safeElapsed = isFinite(Number(elapsed)) ? Number(elapsed) : 0;
      var stateDefinition = stateMap[currentState] || {};

      if (stateDefinition.smokeVisible === true) {
        smokeItems.forEach(function (puff) {
          var data = puff.userData.missionSmoke;
          var cycle = (safeElapsed * 0.11 + data.index / Math.max(1, smokeItems.length)) % 1;
          var driftAngle = data.angle + safeElapsed * 0.16;
          var driftRadius = smokeRadius * (0.12 + 0.12 * cycle);
          puff.position.set(
            Number(smokeAnchor.x) + Math.cos(driftAngle) * (data.radial + driftRadius),
            Number(smokeAnchor.y) + data.verticalOffset + cycle * smokeSpan * 0.62,
            Number(smokeAnchor.z) + Math.sin(driftAngle) * (data.radial + driftRadius)
          );
          var scale = data.baseScale * (1 + cycle * 0.85);
          puff.scale.setScalar(scale);
          puff.rotation.y = safeElapsed * 0.08 + data.index * 0.31;
          puff.material.opacity = Math.max(0, Number(smokePlan.maxOpacity) || 0) * (0.88 - cycle * 0.48);
        });
      }

      if (stateDefinition.fireVisible === true) {
        flameItems.forEach(function (flame) {
          var data = flame.userData.missionFlame;
          var wave = 0.5 + 0.5 * Math.sin(safeElapsed * 9.0 + data.index * 1.7);
          flame.position.y = data.baseY + wave * 0.08;
          flame.scale.set(0.82 + wave * 0.18, 0.82 + wave * 0.42, 0.82 + wave * 0.18);
          flame.material.opacity = Math.min(Number(flamePlan.maxOpacity) || 0, 0.7 + wave * 0.22);
        });
        glowItems.forEach(function (glow, index) {
          var pulse = 0.5 + 0.5 * Math.sin(safeElapsed * 6.2 + index);
          glow.material.opacity = (Number(glowPlan.maxOpacity) || 0) * (0.68 + pulse * 0.32);
        });
      }
    }

    function reset() {
      currentState = "READY";
      smokeItems.forEach(function (item) { item.material.opacity = 0; });
      flameItems.forEach(function (item) { item.material.opacity = 0; });
      glowItems.forEach(function (item) { item.material.opacity = 0; });
      applyVisibility();
      return true;
    }

    function getSafetyStatus() {
      var coordinatesFinite = [visualPlan.facadeAnchor, visualPlan.roofSmokeAnchor].every(function (point) {
        return point && isFinite(Number(point.x)) && isFinite(Number(point.y)) && isFinite(Number(point.z));
      });
      if (!coordinatesFinite) {
        return { status: "FAILED", message: "Mission visual anchors are not finite." };
      }
      return { status: safety.status, message: safety.message };
    }

    reset();

    return {
      root: root,
      groups: { smoke: smokeGroup, flames: flameGroup, windowGlow: glowGroup },
      setState: setState,
      update: update,
      reset: reset,
      getManifest: function () { return copyObject(manifest); },
      getSafetyStatus: getSafetyStatus
    };
  }

  function createFailedRuntime(scene) {
    var root = typeof THREE !== "undefined" ? new THREE.Group() : null;
    if (scene && root) scene.add(root);
    return {
      root: root,
      groups: {},
      setState: function () { return false; },
      update: function () {},
      reset: function () { return false; },
      getManifest: function () {
        return { title: "MISSION BOS MISSION 001 VISUAL MANIFEST", status: "FAILED" };
      },
      getSafetyStatus: function () {
        return { status: "FAILED", message: "Mission visual runtime could not be created." };
      }
    };
  }

  function logManifest(manifest) {
    var method = manifest.status === "PASSED" ? "log" : "error";
    console.group(manifest.title);
    console[method]("Rendered smoke puffs: " + manifest.rendered.smokePuffs + " / " + manifest.expected.smokePuffs);
    console[method]("Rendered flames: " + manifest.rendered.flames + " / " + manifest.expected.flames);
    console[method]("Rendered window glows: " + manifest.rendered.windowGlows + " / " + manifest.expected.windowGlows);
    console[method]("Rendered ground props: " + manifest.rendered.groundProps + " / " + manifest.expected.groundProps);
    console[method]("STATUS: " + manifest.status);
    console.groupEnd();
  }

  function copyObject(value) {
    return JSON.parse(JSON.stringify(value));
  }

  window.MissionBosMission001Visuals = { create: create };
})();
