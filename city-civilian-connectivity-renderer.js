/* Mission BOS - Build 011N.1
   Continuous low-opacity civilian links for the five civilian vehicles and
   eight base pedestrians. One deterministic data point per active link.
*/
(function () {
  "use strict";

  var EPSILON = 1e-9;
  var SAFETY_INTERVAL_SECONDS = 0.25;

  function finite(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function emptySafety() {
    return {
      title: "MISSION BOS BASE CIVILIAN CONNECTIVITY RENDERER SAFETY",
      dependencyErrors: 0,
      endpointResolutionErrors: 0,
      towerReferenceErrors: 0,
      lineCountErrors: 0,
      duplicateLineErrors: 0,
      particleErrors: 0,
      dashedLineErrors: 0,
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

  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    if (result.actual) Object.keys(result.actual).forEach(function (key) { console[method](key + ": " + result.actual[key] + " / " + result.expected[key]); });
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  function createFailedRuntime(message) {
    var safety = emptySafety();
    safety.dependencyErrors = 1;
    safety.errors.push(message || "Civilian connectivity renderer initialization failed.");
    finishSafety(safety);
    logResult(safety);
    return {
      root: null,
      groups: {},
      update: function () {},
      setSelectedEndpoint: function () {},
      setSelectedTower: function () {},
      clearSelection: function () {},
      reset: function () {},
      dispose: function () {},
      getManifest: function () { return { status: "FAILED" }; },
      getSafetyStatus: function () { return copy(safety); }
    };
  }

  function create(options) {
    options = options || {};
    var THREE = options.THREE || window.THREE;
    var scene = options.scene;
    var recoveryCity = options.recoveryCity;
    var connectivityRuntime = options.connectivityRuntime;
    var associationRuntime = options.associationRuntime || connectivityRuntime;
    var capacityRuntime = options.capacityRuntime;
    var networkPlan = options.networkRealismPlan || window.MISSION_BOS_NETWORK_REALISM_PLAN;
    if (!THREE || !scene || !recoveryCity || !recoveryCity.towersById || !connectivityRuntime || !associationRuntime || !capacityRuntime || !networkPlan) {
      return createFailedRuntime("Shared association, capacity, recovery-city or realism plan is missing.");
    }

    var visual = (networkPlan.visualLanguage || {}).civilian || {};
    var definitions = (((networkPlan.participants || {}).alwaysOnCivilian) || []).map(copy);
    var root = new THREE.Group();
    root.name = "FULL_BASE_CIVILIAN_CONNECTIVITY_ROOT";
    scene.add(root);
    var lineGroup = new THREE.Group();
    var particleGroup = new THREE.Group();
    root.add(lineGroup);
    root.add(particleGroup);

    var sharedParticleGeometry = new THREE.SphereGeometry(0.075, 8, 6);
    var states = [];
    var statesByEndpointId = Object.create(null);
    var selectedEndpointId = null;
    var selectedTowerId = null;
    var safety = emptySafety();
    var safetyAccumulator = 0;
    var disposed = false;

    function createState(definition, index) {
      var positions = new Float32Array(6);
      var geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      var material = new THREE.LineBasicMaterial({
        color: visual.defaultColor || "#7A263A",
        transparent: true,
        opacity: finite(visual.defaultOpacity, 0.075),
        depthTest: visual.depthTest !== false,
        depthWrite: false
      });
      var line = new THREE.Line(geometry, material);
      line.name = "CIVILIAN_LINK_" + definition.id;
      line.frustumCulled = false;
      line.renderOrder = 7;
      line.visible = false;
      lineGroup.add(line);

      var particleMaterial = new THREE.MeshBasicMaterial({
        color: visual.defaultColor || "#7A263A",
        transparent: true,
        opacity: 0.28,
        depthTest: visual.depthTest !== false,
        depthWrite: false
      });
      var particle = new THREE.Mesh(sharedParticleGeometry, particleMaterial);
      particle.name = "CIVILIAN_DATA_POINT_" + definition.id;
      particle.renderOrder = 8;
      particle.visible = false;
      particleGroup.add(particle);
      return {
        definition: definition,
        index: index,
        line: line,
        geometry: geometry,
        material: material,
        particle: particle,
        particleMaterial: particleMaterial,
        start: new THREE.Vector3(),
        end: new THREE.Vector3(),
        servingTowerId: null,
        serviceStatus: "SERVED"
      };
    }

    definitions.forEach(function (definition, index) {
      var state = createState(definition, index);
      states.push(state);
      statesByEndpointId[definition.id] = state;
    });

    function towerBeaconPosition(towerId, target) {
      var tower = recoveryCity.towersById[towerId];
      var beacon = tower && tower.userData ? tower.userData.beacon : null;
      if (!beacon) return false;
      beacon.getWorldPosition(target);
      target.y += finite((((networkPlan.visualLanguage || {}).anchors || {}).towerBeaconYOffset), 0.35);
      return true;
    }

    function setLine(state) {
      var attribute = state.geometry.getAttribute("position");
      attribute.array[0] = state.start.x;
      attribute.array[1] = state.start.y;
      attribute.array[2] = state.start.z;
      attribute.array[3] = state.end.x;
      attribute.array[4] = state.end.y;
      attribute.array[5] = state.end.z;
      attribute.needsUpdate = true;
      if (state.geometry.computeBoundingSphere) state.geometry.computeBoundingSphere();
    }

    function serviceVisual(state, association, selected) {
      var service = capacityRuntime.getEndpointServiceState(state.definition.id);
      var status = service && service.status ? service.status : "SERVED";
      var cell = association && association.servingTowerId ? capacityRuntime.getCell(association.servingTowerId) : null;
      var color = visual.defaultColor || "#7A263A";
      var opacity = finite(visual.defaultOpacity, 0.075);
      var speed = finite(visual.normalParticleCyclesPerSecond, 0.18);
      var particleOpacity = 0.24;
      if (status === "DEFERRED") {
        color = visual.deferredColor || "#8F1D2C";
        opacity = finite(visual.defaultOpacity, 0.075) * 0.72;
        speed = finite(visual.deferredParticleCyclesPerSecond, 0);
        particleOpacity = 0.12;
      } else if (status === "DEPRIORITIZED") {
        color = visual.deprioritizedColor || "#E56B6F";
        opacity = finite(visual.deprioritizedOpacity, 0.18);
        speed = finite(visual.deprioritizedParticleCyclesPerSecond, 0.045);
        particleOpacity = 0.44;
      } else if (status === "BEST_EFFORT" || (cell && cell.status === "OVERLOADED")) {
        color = visual.loadedColor || "#B33A3A";
        opacity = finite(visual.overloadedOpacity, 0.14);
        speed = finite(visual.loadedParticleCyclesPerSecond, 0.1);
        particleOpacity = 0.36;
      }
      if (selected) opacity = finite(visual.selectedOpacity, 0.55);
      state.material.color.set(color);
      state.material.opacity = opacity;
      state.particleMaterial.color.set(color);
      state.particleMaterial.opacity = particleOpacity;
      state.serviceStatus = status;
      return speed;
    }

    function hide(state) {
      state.line.visible = false;
      state.particle.visible = false;
      state.servingTowerId = null;
    }

    function updateState(state, elapsed) {
      var association = associationRuntime.getAssociation(state.definition.id);
      if (!association || !association.active || !association.position || !association.servingTowerId) {
        hide(state);
        return;
      }
      state.start.set(Number(association.position.x), Number(association.position.y), Number(association.position.z));
      if (!towerBeaconPosition(association.servingTowerId, state.end)) {
        hide(state);
        return;
      }
      state.servingTowerId = association.servingTowerId;
      setLine(state);
      var selectionActive = !!selectedEndpointId || !!selectedTowerId;
      var selected = selectedEndpointId === state.definition.id || selectedTowerId === association.servingTowerId;
      var speed = serviceVisual(state, association, selectionActive && selected);
      if (selectionActive && !selected) state.material.opacity *= 0.55;
      state.line.visible = true;
      if (speed <= EPSILON) {
        state.particle.visible = false;
      } else {
        var phase = (finite(elapsed, 0) * speed + state.index / Math.max(1, states.length)) % 1;
        state.particle.position.lerpVectors(state.start, state.end, phase);
        state.particle.visible = true;
      }
    }

    var manifest = {
      title: "MISSION BOS BASE CIVILIAN CONNECTIVITY RENDER MANIFEST",
      actual: { civilianLines: states.length, dataPoints: states.length, dashedLines: 0 },
      expected: { civilianLines: finite((networkPlan.expectedCounts || {}).alwaysOnCivilianEndpoints, 13), dataPoints: 13, dashedLines: 0 },
      status: "PASSED"
    };
    manifest.status = Object.keys(manifest.expected).every(function (key) { return Number(manifest.actual[key]) === Number(manifest.expected[key]); }) ? "PASSED" : "FAILED";
    logResult(manifest);

    function runSafety(initial) {
      var next = emptySafety();
      if (states.length !== 13) {
        next.lineCountErrors += 1;
        next.errors.push("Base civilian renderer must contain exactly 13 links.");
      }
      var seen = Object.create(null);
      states.forEach(function (state) {
        if (seen[state.definition.id]) {
          next.duplicateLineErrors += 1;
          next.errors.push("Duplicate civilian line: " + state.definition.id);
        }
        seen[state.definition.id] = true;
        if (!state.particle) {
          next.particleErrors += 1;
          next.errors.push("Missing civilian data point: " + state.definition.id);
        }
        if (state.material && state.material.isLineDashedMaterial) {
          next.dashedLineErrors += 1;
          next.errors.push("Dashed civilian line detected: " + state.definition.id);
        }
        var association = associationRuntime.getAssociation(state.definition.id);
        if (association && association.active) {
          if (!association.position) {
            next.endpointResolutionErrors += 1;
            next.errors.push("Civilian endpoint position missing: " + state.definition.id);
          }
          if (!association.servingTowerId || !recoveryCity.towersById[association.servingTowerId]) {
            next.towerReferenceErrors += 1;
            next.errors.push("Civilian serving tower missing: " + state.definition.id);
          }
        }
      });
      var associationSafety = associationRuntime.getSafetyStatus && associationRuntime.getSafetyStatus();
      var capacitySafety = capacityRuntime.getSafetyStatus && capacityRuntime.getSafetyStatus();
      if (!associationSafety || associationSafety.status !== "PASSED" || !capacitySafety || capacitySafety.status !== "PASSED") {
        next.dependencyErrors += 1;
        next.errors.push("Association or capacity dependency is unsafe.");
      }
      safety = finishSafety(next);
      if (initial || safety.failed) logResult(safety);
    }

    function update(delta, elapsed) {
      if (disposed) return;
      states.forEach(function (state) { updateState(state, elapsed); });
      safetyAccumulator += Math.max(0, Math.min(finite(delta, 0), 0.25));
      if (safetyAccumulator >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafety(false);
      }
    }

    function reset() {
      states.forEach(hide);
      selectedEndpointId = null;
      selectedTowerId = null;
      safetyAccumulator = 0;
      runSafety(false);
      return safety.status === "PASSED";
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      states.forEach(function (state) {
        state.geometry.dispose();
        state.material.dispose();
        state.particleMaterial.dispose();
      });
      sharedParticleGeometry.dispose();
      if (root.parent) root.parent.remove(root);
    }

    runSafety(true);

    return {
      root: root,
      groups: { lines: lineGroup, particles: particleGroup },
      linesByEndpointId: statesByEndpointId,
      update: update,
      setSelectedEndpoint: function (endpointId) { selectedEndpointId = statesByEndpointId[endpointId] ? endpointId : null; },
      setSelectedTower: function (towerId) { selectedTowerId = recoveryCity.towersById[towerId] ? towerId : null; },
      clearSelection: function () { selectedEndpointId = null; selectedTowerId = null; },
      reset: reset,
      dispose: dispose,
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); }
    };
  }

  window.MissionBosCivilianConnectivityRenderer = { create: create };
})();
