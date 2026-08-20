/* Mission BOS - Build 012M.1
   Deterministic Mission 003 water-leak scene. Visual-only and fail-soft.
*/
(function () {
  "use strict";

  function copy(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function finite(value, fallback) { value = Number(value); return isFinite(value) ? value : fallback; }
  function listHas(list, value) { return Array.isArray(list) && list.indexOf(value) >= 0; }
  function mat(color, options) {
    options = options || {};
    return new THREE.MeshStandardMaterial({ color: color, roughness: finite(options.roughness, 0.72), metalness: finite(options.metalness, 0.02), transparent: options.transparent === true, opacity: finite(options.opacity, 1), emissive: options.emissive || 0x000000, emissiveIntensity: finite(options.emissiveIntensity, 0) });
  }
  function mesh(geometry, material) { var item = new THREE.Mesh(geometry, material); item.castShadow = true; item.receiveShadow = true; return item; }

  function failed(scene, plan, message) {
    var root = typeof THREE !== "undefined" ? new THREE.Group() : null;
    if (root && scene) scene.add(root);
    var manifest = { title: "MISSION BOS MISSION 003 SCENE RENDER MANIFEST", status: "FAILED", actual: {}, expected: copy((plan || {}).expectedCounts || {}), errors: [message] };
    var safety = { title: "MISSION BOS MISSION 003 SCENE RUNTIME SAFETY", status: "FAILED", dependencyErrors: 1, renderCountErrors: 0, endpointErrors: 0, waterStateErrors: 0, sourceMutationErrors: 0, errors: [message] };
    return { root: root, actorsById: Object.create(null), setState: function () {}, update: function () {}, reset: function () { return false; }, getEndpointPosition: function () { return null; }, isWaterJetActive: function () { return false; }, getManifest: function () { return copy(manifest); }, getSafetyStatus: function () { return copy(safety); }, dispose: function () { if (root && root.parent) root.parent.remove(root); } };
  }

  function createPerson(definition, role) {
    var root = new THREE.Group(); root.name = definition.id; root.position.set(Number(definition.position.x), Number(definition.position.y || 0), Number(definition.position.z)); root.rotation.y = Number(definition.rotationY || 0);
    var palette = role === "utility-worker" ? { body: "#007F9E", accent: "#F5A623", legs: "#27313A" } : role === "firefighter" ? { body: "#D9342B", accent: "#F2D14E", legs: "#222A31" } : role === "police" ? { body: "#2B67A8", accent: "#E8F2FA", legs: "#1D2936" } : { body: "#667788", accent: "#9BDFFF", legs: "#34414D" };
    var skin = mat("#DDAA82"), body = mat(palette.body), accent = mat(palette.accent), legs = mat(palette.legs);
    var head = mesh(new THREE.SphereGeometry(0.16, 10, 8), skin); head.position.y = 1.55; root.add(head);
    var torso = mesh(new THREE.BoxGeometry(0.40, 0.68, 0.24), body); torso.position.y = 1.08; root.add(torso);
    var stripe = mesh(new THREE.BoxGeometry(0.42, 0.09, 0.255), accent); stripe.position.y = 1.12; root.add(stripe);
    [-1, 1].forEach(function (side) { var leg = mesh(new THREE.BoxGeometry(0.14, 0.62, 0.16), legs); leg.position.set(side * 0.105, 0.32, 0); root.add(leg); });
    return root;
  }

  function create(options) {
    options = options || {};
    var scene = options.scene, plan = options.plan || window.MISSION_BOS_MISSION_003_PLAN, validation = options.validation;
    if (typeof THREE === "undefined" || !scene || !plan || !validation || validation.status !== "PASSED") return failed(scene, plan, "Mission 003 scene dependencies are incomplete.");
    var root = new THREE.Group(); root.name = "MISSION_BOS_MISSION_003_WATER_LEAK_SCENE"; root.visible = false; scene.add(root);
    var scenePlan = plan.scene || {}, actorsById = Object.create(null), endpointActors = Object.create(null), resources = [];
    function track(value) { resources.push(value); return value; }
    function add(item) { root.add(item); return item; }

    var puddleMaterial = track(new THREE.MeshStandardMaterial({ color: 0x4db9e6, transparent: true, opacity: finite((scenePlan.puddle || {}).opacity, 0.48), roughness: 0.18, metalness: 0.02 }));
    var puddle = add(mesh(track(new THREE.PlaneGeometry(finite((scenePlan.puddle || {}).width, 3.2), finite((scenePlan.puddle || {}).depth, 1.6))), puddleMaterial));
    puddle.name = (scenePlan.puddle || {}).id || "MISSION_003_PUDDLE"; puddle.rotation.x = -Math.PI / 2; puddle.position.set(scenePlan.incidentPosition.x, 0.075, scenePlan.incidentPosition.z); puddle.scale.set(0.08, 0.08, 0.08);

    var leakMaterial = track(new THREE.MeshStandardMaterial({ color: 0x7bdcff, emissive: 0x126da0, emissiveIntensity: 0.55, transparent: true, opacity: 0.82, roughness: 0.12 }));
    var leak = add(mesh(track(new THREE.CylinderGeometry(0.07, finite((scenePlan.leakSource || {}).radius, 0.34), finite((scenePlan.leakSource || {}).maximumJetHeight, 2.1), 12)), leakMaterial));
    leak.name = (scenePlan.leakSource || {}).id || "MISSION_003_LEAK_SOURCE"; leak.position.set(scenePlan.incidentPosition.x, 1.05, scenePlan.incidentPosition.z); leak.rotation.z = -0.28;

    var patch = add(mesh(track(new THREE.BoxGeometry(finite((scenePlan.repairPatch || {}).width, 1.5), 0.08, finite((scenePlan.repairPatch || {}).depth, 0.9))), track(mat("#3F454A", { roughness: 0.95 }))));
    patch.name = (scenePlan.repairPatch || {}).id || "MISSION_003_REPAIR_PATCH"; patch.position.set(scenePlan.incidentPosition.x, 0.11, scenePlan.incidentPosition.z);

    (scenePlan.barriers || []).forEach(function (definition) {
      var barrier = new THREE.Group(); barrier.name = definition.id; barrier.position.set(definition.position.x, definition.position.y, definition.position.z); barrier.rotation.y = Number(definition.rotationY || 0);
      var bar = mesh(track(new THREE.BoxGeometry(2.1, 0.16, 0.14)), track(mat("#F3F4F5"))); bar.position.y = 0.72; barrier.add(bar);
      [-0.7, 0, 0.7].forEach(function (x) { var marker = mesh(track(new THREE.BoxGeometry(0.28, 0.17, 0.15)), track(mat("#D9472F"))); marker.position.set(x, 0.72, 0); barrier.add(marker); });
      [-0.82, 0.82].forEach(function (x) { var leg = mesh(track(new THREE.BoxGeometry(0.11, 0.72, 0.11)), track(mat("#626B73"))); leg.position.set(x, 0.34, 0); barrier.add(leg); });
      add(barrier);
    });
    (scenePlan.cones || []).forEach(function (definition) { var cone = mesh(track(new THREE.ConeGeometry(0.15, 0.48, 12)), track(mat("#F47A1F"))); cone.name = definition.id; cone.position.set(definition.position.x, definition.position.y + 0.24, definition.position.z); add(cone); });

    (scenePlan.crew || []).forEach(function (definition) { var person = createPerson(definition, definition.role); actorsById[definition.id] = person; add(person); });
    (scenePlan.bystanders || []).forEach(function (definition, index) {
      var actorDefinition = { id: definition.id, position: definition.position, rotationY: index % 2 ? 2.7 : -2.7 };
      var person = createPerson(actorDefinition, "bystander");
      var phone = mesh(track(new THREE.BoxGeometry(0.08, 0.14, 0.025)), track(new THREE.MeshBasicMaterial({ color: 0x9bdfff })));
      phone.position.set(index % 2 ? -0.24 : 0.24, 1.2, 0.06); person.add(phone);
      var anchor = new THREE.Object3D(); anchor.position.copy(phone.position); person.add(anchor);
      actorsById[definition.id] = person; endpointActors[definition.endpointId] = anchor; add(person);
    });

    var actual = { sceneCrew: (scenePlan.crew || []).length, bystanders: (scenePlan.bystanders || []).length, barriers: (scenePlan.barriers || []).length, cones: (scenePlan.cones || []).length, waterJets: 1, puddles: 1, repairPatches: 1 };
    var expected = plan.expectedCounts || {};
    var manifest = { title: "MISSION BOS MISSION 003 SCENE RENDER MANIFEST", actual: actual, expected: { sceneCrew: Number(expected.sceneCrew), bystanders: Number(expected.bystanders), barriers: Number(expected.barriers), cones: Number(expected.cones), waterJets: Number(expected.waterJets), puddles: Number(expected.puddles), repairPatches: Number(expected.repairPatches) }, status: "PASSED" };
    Object.keys(manifest.expected).forEach(function (key) { if (Number(actual[key]) !== Number(manifest.expected[key])) manifest.status = "FAILED"; });
    var sourceSignature = JSON.stringify(scenePlan), state = "READY", stateElapsed = 0, disposed = false;
    var safety = { title: "MISSION BOS MISSION 003 SCENE RUNTIME SAFETY", dependencyErrors: 0, renderCountErrors: manifest.status === "PASSED" ? 0 : 1, endpointErrors: 0, waterStateErrors: 0, sourceMutationErrors: 0, status: manifest.status, errors: [] };

    function setVisibility(next) {
      root.visible = listHas(scenePlan.visibleStates, next);
      leak.visible = listHas(scenePlan.waterJetStates, next) || next === scenePlan.waterJetMustFadeDuringState;
      puddle.visible = root.visible;
      patch.visible = listHas((scenePlan.repairPatch || {}).visibleStates, next);
      Object.keys(actorsById).forEach(function (id) {
        var bystander = /^MISSION3_BYSTANDER_/.test(id);
        actorsById[id].visible = bystander ? listHas((scenePlan.visibilitySchedule || {}).bystandersVisibleStates, next) : listHas((scenePlan.visibilitySchedule || {}).responseCrewVisibleStates, next);
      });
      (scenePlan.barriers || []).forEach(function (definition) { var object = root.getObjectByName(definition.id); if (object) object.visible = listHas((scenePlan.visibilitySchedule || {}).barriersAndConesVisibleStates, next); });
      (scenePlan.cones || []).forEach(function (definition) { var object = root.getObjectByName(definition.id); if (object) object.visible = listHas((scenePlan.visibilitySchedule || {}).barriersAndConesVisibleStates, next); });
    }
    function setState(next) { if (disposed) return false; state = String(next || "READY"); stateElapsed = 0; setVisibility(state); return true; }
    function update(delta, elapsed) {
      if (disposed) return; stateElapsed += Math.max(0, Math.min(finite(delta, 0), 0.1));
      var t = finite(elapsed, 0); if (root.visible) {
        var growth = Math.min(1, 0.08 + stateElapsed * 0.16); puddle.scale.set(growth, growth, growth);
        leak.scale.y = 0.88 + Math.sin(t * 5.2) * 0.12;
        if (state === scenePlan.waterJetMustFadeDuringState) leakMaterial.opacity = Math.max(0, 0.82 * (1 - stateElapsed / finite(scenePlan.waterJetFadeSeconds, 1.2)));
        else leakMaterial.opacity = leak.visible ? 0.82 : 0;
        (scenePlan.bystanders || []).forEach(function (definition, index) { var actor = actorsById[definition.id]; if (actor && actor.visible) actor.rotation.z = Math.sin(t * 1.5 + index) * 0.015; });
      }
      if (["REPAIRING", "COMPLETED", "RETURNING", "READY", "FAILED"].indexOf(state) >= 0) leak.visible = false;
      if (JSON.stringify(scenePlan) !== sourceSignature) { safety.sourceMutationErrors = 1; safety.status = "FAILED"; safety.errors = ["Mission 003 scene plan was mutated."]; }
    }
    function getEndpointPosition(endpointId, target) { var anchor = endpointActors[endpointId]; if (!anchor || !anchor.parent || !anchor.parent.visible || !root.visible) return null; target = target || new THREE.Vector3(); anchor.getWorldPosition(target); return target; }
    function isWaterJetActive() { return !disposed && leak.visible === true && leakMaterial.opacity > 0.001; }
    function reset() { if (disposed) return false; state = "READY"; stateElapsed = 0; puddle.scale.set(0.08, 0.08, 0.08); leakMaterial.opacity = 0.82; setVisibility("READY"); return true; }
    function dispose() { if (disposed) return; disposed = true; if (root.parent) root.parent.remove(root); root.traverse(function (object) { if (object.geometry && object.geometry.dispose) object.geometry.dispose(); if (object.material && object.material.dispose) object.material.dispose(); }); resources.forEach(function (resource) { if (resource && resource.dispose) resource.dispose(); }); }

    console.group(manifest.title); console.log("STATUS: " + manifest.status); console.groupEnd();
    setVisibility("READY");
    return { root: root, actorsById: actorsById, setState: setState, update: update, reset: reset, getEndpointPosition: getEndpointPosition, isWaterJetActive: isWaterJetActive, getManifest: function () { return copy(manifest); }, getSafetyStatus: function () { return copy(safety); }, dispose: dispose };
  }
  window.MissionBosMission003SceneRenderer = { create: create };
})();
