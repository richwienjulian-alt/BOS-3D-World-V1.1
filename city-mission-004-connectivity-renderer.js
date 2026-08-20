/* Mission BOS - Build 013M.2
   Mission 004 civilian connectivity visualization. This runtime owns exactly
   eight accident-smartphone links; operational BOS vehicle links remain owned
   by city-unified-bos-connectivity-renderer.js.
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

  function failed(message) {
    var manifest = {
      title: "MISSION BOS MISSION 004 CONNECTIVITY MANIFEST 013M.2",
      actual: { civilianLines: 0, operationalVehicleLines: 0, totalLines: 0, dataPoints: 0 },
      expected: { civilianLines: 8, operationalVehicleLines: 0, totalLines: 8, dataPoints: 8 },
      status: "FAILED"
    };
    var safety = {
      title: "MISSION BOS MISSION 004 CONNECTIVITY SAFETY 013M.2",
      dependencyErrors: 1,
      ownershipErrors: 0,
      renderCountErrors: 0,
      depthPolicyErrors: 0,
      staleVisualErrors: 0,
      status: "FAILED",
      errors: [message]
    };
    console.error(message);
    return {
      root: null,
      update: function () {},
      reset: function () { return false; },
      dispose: function () {},
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); }
    };
  }

  function create(options) {
    options = options || {};
    var THREE = options.THREE || window.THREE;
    var scene = options.scene;
    var recoveryCity = options.recoveryCity;
    var association = options.associationRuntime;
    var capacity = options.capacityRuntime;
    var plan = options.networkRealismPlan || window.MISSION_BOS_NETWORK_REALISM_PLAN;
    if (!THREE || !scene || !recoveryCity || !association || !capacity || !plan) {
      return failed("Mission 004 civilian connectivity dependencies are incomplete.");
    }

    var participants = plan.participants || {};
    var definitions = (participants.mission004Civilian || []).map(copy);
    var visual = (plan.visualLanguage || {}).civilian || {};
    var root = new THREE.Group();
    root.name = "MISSION_004_CIVILIAN_CONNECTIVITY_ROOT_013M2";
    scene.add(root);
    var packetGeometry = new THREE.SphereGeometry(0.075, 8, 6);
    var states = [];
    var disposed = false;
    var safety = null;

    function towerPosition(towerId, target) {
      var tower = recoveryCity.towersById && recoveryCity.towersById[towerId];
      var beacon = tower && tower.userData && tower.userData.beacon;
      if (!beacon || typeof beacon.getWorldPosition !== "function") return false;
      beacon.getWorldPosition(target);
      target.y += finite((((plan.visualLanguage || {}).anchors || {}).towerBeaconYOffset), 0.35);
      return true;
    }

    definitions.forEach(function (definition, index) {
      var positions = new Float32Array(6);
      var geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      var lineMaterial = new THREE.LineBasicMaterial({
        color: visual.defaultColor || "#7A263A",
        transparent: true,
        opacity: finite(visual.defaultOpacity, 0.075),
        depthTest: true,
        depthWrite: false
      });
      var line = new THREE.Line(geometry, lineMaterial);
      line.name = "MISSION_004_CIVILIAN_LINK_" + definition.id;
      line.frustumCulled = false;
      line.renderOrder = 7;
      line.visible = false;
      root.add(line);

      var packetMaterial = new THREE.MeshBasicMaterial({
        color: visual.defaultColor || "#7A263A",
        transparent: true,
        opacity: 0.3,
        depthTest: true,
        depthWrite: false
      });
      var packet = new THREE.Mesh(packetGeometry, packetMaterial);
      packet.name = "MISSION_004_CIVILIAN_PACKET_" + definition.id;
      packet.frustumCulled = false;
      packet.renderOrder = 8;
      packet.visible = false;
      root.add(packet);

      states.push({
        definition: definition,
        index: index,
        geometry: geometry,
        lineMaterial: lineMaterial,
        line: line,
        packetMaterial: packetMaterial,
        packet: packet,
        start: new THREE.Vector3(),
        end: new THREE.Vector3()
      });
    });

    var manifest = {
      title: "MISSION BOS MISSION 004 CONNECTIVITY MANIFEST 013M.2",
      actual: {
        civilianLines: definitions.length,
        operationalVehicleLines: 0,
        totalLines: states.length,
        dataPoints: states.length
      },
      expected: { civilianLines: 8, operationalVehicleLines: 0, totalLines: 8, dataPoints: 8 },
      status: "PASSED"
    };
    Object.keys(manifest.expected).forEach(function (key) {
      if (Number(manifest.actual[key]) !== Number(manifest.expected[key])) manifest.status = "FAILED";
    });

    function hide(state) {
      state.line.visible = false;
      state.packet.visible = false;
    }

    function updateState(state, elapsed) {
      var current = association.getAssociation(state.definition.id);
      if (!current || current.active !== true || !current.position || !current.servingTowerId) {
        hide(state);
        return;
      }
      state.start.set(Number(current.position.x), Number(current.position.y), Number(current.position.z));
      if (!towerPosition(current.servingTowerId, state.end)) {
        hide(state);
        return;
      }
      var attribute = state.geometry.getAttribute("position");
      attribute.array.set([
        state.start.x, state.start.y, state.start.z,
        state.end.x, state.end.y, state.end.z
      ]);
      attribute.needsUpdate = true;

      var service = capacity.getEndpointServiceState(state.definition.id);
      var status = service && service.status || "SERVED";
      var color = visual.defaultColor || "#7A263A";
      var opacity = finite(visual.defaultOpacity, 0.075);
      var speed = finite(visual.normalParticleCyclesPerSecond, 0.18);
      if (status === "DEPRIORITIZED") {
        color = visual.deprioritizedColor || "#E56B6F";
        opacity = finite(visual.deprioritizedOpacity, 0.18);
        speed = finite(visual.deprioritizedParticleCyclesPerSecond, 0.045);
      } else if (status === "DEFERRED") {
        color = visual.deferredColor || "#8F1D2C";
        opacity = finite(visual.defaultOpacity, 0.075) * 0.72;
        speed = 0;
      } else if (status === "BEST_EFFORT") {
        color = visual.loadedColor || "#B33A3A";
        opacity = finite(visual.overloadedOpacity, 0.14);
        speed = finite(visual.loadedParticleCyclesPerSecond, 0.1);
      }
      state.lineMaterial.color.set(color);
      state.lineMaterial.opacity = opacity;
      state.packetMaterial.color.set(color);
      state.line.visible = true;
      if (speed > 0) {
        var phase = (finite(elapsed, 0) * speed + state.index / Math.max(1, states.length)) % 1;
        state.packet.position.lerpVectors(state.start, state.end, phase);
        state.packet.visible = true;
      } else {
        state.packet.visible = false;
      }
    }

    function runSafety() {
      var result = {
        title: "MISSION BOS MISSION 004 CONNECTIVITY SAFETY 013M.2",
        dependencyErrors: 0,
        ownershipErrors: 0,
        renderCountErrors: 0,
        depthPolicyErrors: 0,
        staleVisualErrors: 0,
        status: "PASSED",
        errors: []
      };
      if (states.length !== 8 || root.children.length !== 16) {
        result.renderCountErrors += 1;
        result.errors.push("Mission 004 connectivity must contain exactly eight lines and eight data points.");
      }
      states.forEach(function (state) {
        if (state.definition.channel !== "CIVILIAN" || state.definition.kind !== "mission4-phone") {
          result.ownershipErrors += 1;
          result.errors.push("Mission 004 renderer owns a non-civilian endpoint: " + state.definition.id);
        }
        if (state.lineMaterial.depthTest !== true || state.lineMaterial.depthWrite !== false ||
            state.packetMaterial.depthTest !== true || state.packetMaterial.depthWrite !== false) {
          result.depthPolicyErrors += 1;
          result.errors.push("Mission 004 civilian path violates world occlusion: " + state.definition.id);
        }
        if (!state.line.visible && state.packet.visible) {
          result.staleVisualErrors += 1;
          result.errors.push("Mission 004 civilian packet remains visible without its line: " + state.definition.id);
        }
      });
      if (manifest.status !== "PASSED") {
        result.renderCountErrors += 1;
        result.errors.push("Mission 004 connectivity manifest is invalid.");
      }
      if (result.errors.length) result.status = "FAILED";
      safety = result;
      return result.status === "PASSED";
    }

    function update(delta, elapsed) {
      if (disposed) return;
      states.forEach(function (state) { updateState(state, elapsed); });
    }

    function reset() {
      if (disposed) return false;
      states.forEach(hide);
      return runSafety();
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      states.forEach(function (state) {
        state.geometry.dispose();
        state.lineMaterial.dispose();
        state.packetMaterial.dispose();
      });
      packetGeometry.dispose();
      if (root.parent) root.parent.remove(root);
    }

    runSafety();
    console.group(manifest.title);
    console.log("Civilian lines: " + manifest.actual.civilianLines + " / 8");
    console.log("Operational vehicle lines: " + manifest.actual.operationalVehicleLines + " / 0");
    console.log("STATUS: " + manifest.status);
    console.groupEnd();

    return {
      root: root,
      update: update,
      reset: reset,
      dispose: dispose,
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); }
    };
  }

  window.MissionBosMission004ConnectivityRenderer = { create: create };
})();
