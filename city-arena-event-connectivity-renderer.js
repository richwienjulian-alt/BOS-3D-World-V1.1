/* Mission BOS - Build 011N.1
   Continuous civilian connectivity for all twelve visible Arena participants.
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
      title: "MISSION BOS ARENA CONNECTIVITY RENDERER SAFETY",
      endpointResolutionErrors: 0,
      unknownTowerErrors: 0,
      renderCountErrors: 0,
      hiddenStateErrors: 0,
      duplicateLineErrors: 0,
      capacityErrors: 0,
      associationErrors: 0,
      towerAnchorErrors: 0,
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

  function failedRuntime(message) {
    var safety = emptySafety();
    safety.associationErrors = 1;
    safety.errors.push(message || "Arena connectivity initialization failed.");
    finishSafety(safety);
    logResult(safety);
    return {
      root: null,
      update: function () {},
      setVisible: function () { return false; },
      reset: function () { return false; },
      getManifest: function () { return { status: "FAILED" }; },
      getSafetyStatus: function () { return copy(safety); },
      getConnectionSnapshot: function () { return []; },
      dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var THREE = options.THREE || window.THREE;
    var scene = options.scene;
    var recoveryCity = options.recoveryCity;
    var associationRuntime = options.associationRuntime;
    var capacityRuntime = options.capacityRuntime;
    var networkPlan = options.networkRealismPlan || window.MISSION_BOS_NETWORK_REALISM_PLAN;
    if (!THREE || !scene || !recoveryCity || !recoveryCity.towersById || !associationRuntime || !capacityRuntime || !networkPlan) {
      return failedRuntime("Arena renderer requires shared association, capacity and recovery-city runtimes.");
    }

    var visual = (networkPlan.visualLanguage || {}).civilian || {};
    var definitions = (((networkPlan.participants || {}).arenaCivilian) || []).map(copy);
    var root = new THREE.Group();
    root.name = "ARENA_ALL_PARTICIPANT_CONNECTIVITY_ROOT";
    root.visible = false;
    scene.add(root);
    var particleGeometry = new THREE.SphereGeometry(0.08, 8, 6);
    var states = [];
    var statesByEndpointId = Object.create(null);
    var visible = false;
    var disposed = false;
    var safetyAccumulator = 0;
    var safety = emptySafety();

    definitions.forEach(function (definition, index) {
      var geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      var material = new THREE.LineBasicMaterial({
        color: visual.defaultColor || "#7A263A",
        transparent: true,
        opacity: finite(visual.defaultOpacity, 0.075),
        depthTest: visual.depthTest !== false,
        depthWrite: false
      });
      var line = new THREE.Line(geometry, material);
      line.name = "ARENA_CIVILIAN_LINK_" + definition.id;
      line.frustumCulled = false;
      line.renderOrder = 7;
      line.visible = false;
      root.add(line);
      var particleMaterial = new THREE.MeshBasicMaterial({
        color: visual.defaultColor || "#7A263A",
        transparent: true,
        opacity: 0.3,
        depthTest: visual.depthTest !== false,
        depthWrite: false
      });
      var particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.name = "ARENA_CIVILIAN_DATA_POINT_" + definition.id;
      particle.visible = false;
      particle.renderOrder = 8;
      root.add(particle);
      var state = {
        definition: definition,
        index: index,
        geometry: geometry,
        material: material,
        line: line,
        particleMaterial: particleMaterial,
        particle: particle,
        start: new THREE.Vector3(),
        target: new THREE.Vector3(),
        servingTowerId: null,
        serviceStatus: "SERVED"
      };
      states.push(state);
      statesByEndpointId[definition.id] = state;
    });

    var manifest = {
      title: "MISSION BOS ARENA CONNECTIVITY RENDER MANIFEST",
      endpointCount: states.length,
      towerAnchorMode: "ACTUAL_UPPER_BEACON",
      towerBeaconYOffset: finite((((networkPlan.visualLanguage || {}).anchors || {}).towerBeaconYOffset), 0.35),
      actual: { civilianLines: states.length, dataPoints: states.length, dashedLines: 0 },
      expected: { civilianLines: finite((networkPlan.expectedCounts || {}).arenaCivilianEndpoints, 12), dataPoints: 12, dashedLines: 0 },
      status: "PASSED"
    };
    manifest.status = Object.keys(manifest.expected).every(function (key) { return Number(manifest.actual[key]) === Number(manifest.expected[key]); }) ? "PASSED" : "FAILED";
    logResult(manifest);

    function beaconPosition(towerId, target) {
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
      attribute.array[3] = state.target.x;
      attribute.array[4] = state.target.y;
      attribute.array[5] = state.target.z;
      attribute.needsUpdate = true;
      if (state.geometry.computeBoundingSphere) state.geometry.computeBoundingSphere();
    }

    function hide(state) {
      state.line.visible = false;
      state.particle.visible = false;
      state.servingTowerId = null;
    }

    function style(state, association) {
      var service = capacityRuntime.getEndpointServiceState(state.definition.id);
      var status = service && service.status ? service.status : "SERVED";
      var cell = association.servingTowerId ? capacityRuntime.getCell(association.servingTowerId) : null;
      var color = visual.defaultColor || "#7A263A";
      var opacity = finite(visual.defaultOpacity, 0.075);
      var speed = finite(visual.normalParticleCyclesPerSecond, 0.18);
      var particleOpacity = 0.28;
      if (status === "DEFERRED") {
        color = visual.deferredColor || "#8F1D2C";
        opacity *= 0.72;
        speed = finite(visual.deferredParticleCyclesPerSecond, 0);
        particleOpacity = 0.12;
      } else if (status === "DEPRIORITIZED") {
        color = visual.deprioritizedColor || "#E56B6F";
        opacity = finite(visual.deprioritizedOpacity, 0.18);
        speed = finite(visual.deprioritizedParticleCyclesPerSecond, 0.045);
        particleOpacity = 0.46;
      } else if (status === "BEST_EFFORT" || (cell && cell.status === "OVERLOADED")) {
        color = visual.loadedColor || "#B33A3A";
        opacity = finite(visual.overloadedOpacity, 0.14);
        speed = finite(visual.loadedParticleCyclesPerSecond, 0.1);
        particleOpacity = 0.38;
      }
      state.material.color.set(color);
      state.material.opacity = opacity;
      state.particleMaterial.color.set(color);
      state.particleMaterial.opacity = particleOpacity;
      state.serviceStatus = status;
      return speed;
    }

    function updateState(state, elapsed) {
      var association = associationRuntime.getAssociation(state.definition.id);
      if (!visible || !association || !association.active || !association.position || !association.servingTowerId) {
        hide(state);
        return;
      }
      state.start.set(Number(association.position.x), Number(association.position.y), Number(association.position.z));
      if (!beaconPosition(association.servingTowerId, state.target)) {
        hide(state);
        return;
      }
      state.servingTowerId = association.servingTowerId;
      setLine(state);
      var speed = style(state, association);
      state.line.visible = true;
      if (speed <= EPSILON) {
        state.particle.visible = false;
      } else {
        var phase = (finite(elapsed, 0) * speed + state.index / Math.max(1, states.length)) % 1;
        state.particle.position.lerpVectors(state.start, state.target, phase);
        state.particle.visible = true;
      }
    }

    function runSafety(initial) {
      var next = emptySafety();
      if (states.length !== 12) {
        next.renderCountErrors += 1;
        next.errors.push("Arena renderer must contain exactly twelve civilian links.");
      }
      var seen = Object.create(null);
      states.forEach(function (state) {
        if (seen[state.definition.id]) {
          next.duplicateLineErrors += 1;
          next.errors.push("Duplicate Arena connection: " + state.definition.id);
        }
        seen[state.definition.id] = true;
        if (state.material && state.material.isLineDashedMaterial) {
          next.dashedLineErrors += 1;
          next.errors.push("Dashed Arena line detected: " + state.definition.id);
        }
        if (visible) {
          var association = associationRuntime.getAssociation(state.definition.id);
          if (!association || !association.active || !association.position) {
            next.endpointResolutionErrors += 1;
            next.errors.push("Arena endpoint unresolved: " + state.definition.id);
          } else if (!association.servingTowerId || !recoveryCity.towersById[association.servingTowerId]) {
            next.unknownTowerErrors += 1;
            next.errors.push("Arena serving tower unresolved: " + state.definition.id);
          }
        } else if (state.line.visible || state.particle.visible) {
          next.hiddenStateErrors += 1;
          next.errors.push("Arena visuals remained visible after reset: " + state.definition.id);
        }
      });
      var associationSafety = associationRuntime.getSafetyStatus && associationRuntime.getSafetyStatus();
      var capacitySafety = capacityRuntime.getSafetyStatus && capacityRuntime.getSafetyStatus();
      if (!associationSafety || associationSafety.status !== "PASSED") {
        next.associationErrors += 1;
        next.errors.push("Shared association runtime is unsafe.");
      }
      if (!capacitySafety || capacitySafety.status !== "PASSED") {
        next.capacityErrors += 1;
        next.errors.push("Capacity runtime is unsafe.");
      }
      safety = finishSafety(next);
      if (initial || safety.failed) logResult(safety);
    }

    function setVisible(nextVisible) {
      if (disposed) return false;
      visible = nextVisible === true;
      root.visible = visible;
      if (!visible) states.forEach(hide);
      return true;
    }

    function update(delta, elapsed) {
      if (disposed) return;
      root.visible = visible;
      states.forEach(function (state) { updateState(state, elapsed); });
      safetyAccumulator += Math.max(0, Math.min(finite(delta, 0), 0.25));
      if (safetyAccumulator >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafety(false);
      }
    }

    function reset() {
      if (disposed) return false;
      visible = false;
      root.visible = false;
      states.forEach(hide);
      safetyAccumulator = 0;
      runSafety(false);
      return safety.status === "PASSED";
    }

    function getConnectionSnapshot() {
      return states.map(function (state) {
        return {
          endpointId: state.definition.id,
          referenceId: state.definition.referenceId,
          servingTowerId: state.servingTowerId,
          status: state.serviceStatus,
          target: { x: state.target.x, y: state.target.y, z: state.target.z }
        };
      });
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      states.forEach(function (state) {
        state.geometry.dispose();
        state.material.dispose();
        state.particleMaterial.dispose();
      });
      particleGeometry.dispose();
      if (root.parent) root.parent.remove(root);
    }

    runSafety(true);

    return {
      root: root,
      linesByEndpointId: statesByEndpointId,
      update: update,
      setVisible: setVisible,
      reset: reset,
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      getConnectionSnapshot: getConnectionSnapshot,
      dispose: dispose
    };
  }

  window.MissionBosArenaEventConnectivityRenderer = { create: create };
})();
