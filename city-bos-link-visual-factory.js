/* Mission BOS - Build 012M.2
   Shared world-occluded BOS communication link primitive.
   One path owns one core line, one glow line and four bidirectional packets.
*/
(function () {
  "use strict";

  var EPSILON = 1e-9;
  var DIRECTIONS = [1, 1, -1, -1];
  var OFFSETS = [0, 0.5, 0.25, 0.75];

  function finite(value, fallback) {
    value = Number(value);
    return isFinite(value) ? value : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function createLine(THREE, name, material, renderOrder) {
    var positions = new Float32Array(6);
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var line = new THREE.Line(geometry, material);
    line.name = name;
    line.visible = false;
    line.frustumCulled = false;
    line.renderOrder = renderOrder;
    return { line: line, geometry: geometry, positions: positions };
  }

  function create(options) {
    options = options || {};
    var THREE = options.THREE || window.THREE;
    if (!THREE) throw new Error("Three.js is unavailable for BOS link visuals.");

    var name = String(options.name || "BOS_LINK");
    var parent = options.parent || null;
    var recoveryPlan = options.recoveryPlan || window.MISSION_BOS_NETWORK_RECOVERY_PLAN || null;
    var standby = options.standbyStyle || (recoveryPlan && recoveryPlan.visualStateMachine
      ? recoveryPlan.visualStateMachine.standbyConnected : null) || {};
    var priority = options.priorityStyle || (recoveryPlan && recoveryPlan.visualStateMachine
      ? recoveryPlan.visualStateMachine.priorityActive : null) || {};
    var orders = options.renderOrders || {};
    var glowOrder = finite(orders.glow, 40);
    var coreOrder = finite(orders.core, 41);
    var packetOrder = finite(orders.packet, 42);

    var root = new THREE.Group();
    root.name = name + "_VISUAL";

    var coreMaterial = new THREE.LineBasicMaterial({
      color: standby.lineColor || "#9BDFFF",
      transparent: true,
      opacity: finite(standby.lineOpacity, 0.46),
      depthTest: true,
      depthWrite: false
    });
    var glowMaterial = new THREE.LineBasicMaterial({
      color: standby.glowColor || standby.lineColor || "#9BDFFF",
      transparent: true,
      opacity: finite(standby.glowOpacity, 0.11),
      depthTest: true,
      depthWrite: false
    });
    var core = createLine(THREE, name + "_CORE", coreMaterial, coreOrder);
    var glow = createLine(THREE, name + "_GLOW", glowMaterial, glowOrder);
    root.add(glow.line);
    root.add(core.line);

    var packetGeometry = new THREE.SphereGeometry(0.15, 8, 6);
    var packets = [];
    var packetMaterials = [];
    DIRECTIONS.forEach(function (direction, index) {
      var material = new THREE.MeshBasicMaterial({
        color: standby.packetColor || "#B9E6FF",
        transparent: true,
        opacity: finite(standby.packetOpacity, 0.70),
        depthTest: true,
        depthWrite: false
      });
      var packet = new THREE.Mesh(packetGeometry, material);
      packet.name = name + "_PACKET_" + (index + 1);
      packet.userData.direction = direction;
      packet.userData.offset = OFFSETS[index];
      packet.visible = false;
      packet.frustumCulled = false;
      packet.renderOrder = packetOrder;
      packetMaterials.push(material);
      packets.push(packet);
      root.add(packet);
    });

    if (parent) parent.add(root);

    var start = new THREE.Vector3();
    var end = new THREE.Vector3();
    var visible = false;
    var priorityActive = false;
    var disposed = false;
    var lastElapsed = 0;
    var clock = {
      initialized: false,
      speed: 0,
      originElapsed: 0,
      originPhase: 0
    };

    var manifest = {
      title: "MISSION BOS SHARED LINK VISUAL 012M.2 MANIFEST",
      coreLines: 1,
      glowLines: 1,
      packets: 4,
      forwardPackets: 2,
      reversePackets: 2,
      packetRadius: 0.15,
      packetWidthSegments: 8,
      packetHeightSegments: 6,
      depthTestMaterials: 6,
      alwaysOnTopMaterials: 0,
      status: "PASSED"
    };
    var safety = {
      title: "MISSION BOS SHARED LINK VISUAL 012M.2 SAFETY",
      renderCountErrors: 0,
      packetDirectionErrors: 0,
      depthPolicyErrors: 0,
      staleVisualErrors: 0,
      status: "PASSED",
      errors: []
    };

    function setLine(record, a, b) {
      var p = record.positions;
      p[0] = a.x; p[1] = a.y; p[2] = a.z;
      p[3] = b.x; p[4] = b.y; p[5] = b.z;
      record.geometry.attributes.position.needsUpdate = true;
      if (record.geometry.computeBoundingSphere) record.geometry.computeBoundingSphere();
    }

    function basePhase(elapsed, speed) {
      elapsed = finite(elapsed, lastElapsed);
      lastElapsed = elapsed;
      if (!clock.initialized) {
        clock.initialized = true;
        clock.speed = speed;
        clock.originElapsed = elapsed;
        clock.originPhase = 0;
      } else if (Math.abs(clock.speed - speed) > EPSILON) {
        clock.originPhase = (clock.originPhase + (elapsed - clock.originElapsed) * clock.speed) % 1;
        if (clock.originPhase < 0) clock.originPhase += 1;
        clock.originElapsed = elapsed;
        clock.speed = speed;
      }
      var value = (clock.originPhase + (elapsed - clock.originElapsed) * clock.speed) % 1;
      return value < 0 ? value + 1 : value;
    }

    function hide() {
      visible = false;
      priorityActive = false;
      core.line.visible = false;
      glow.line.visible = false;
      packets.forEach(function (packet) { packet.visible = false; });
    }

    function update(a, b, isPriority, elapsed, shouldShow) {
      if (disposed) return false;
      if (shouldShow === false || !a || !b || !isFinite(a.x) || !isFinite(a.y) || !isFinite(a.z) ||
          !isFinite(b.x) || !isFinite(b.y) || !isFinite(b.z)) {
        hide();
        return false;
      }

      start.copy(a);
      end.copy(b);
      setLine(core, start, end);
      setLine(glow, start, end);
      priorityActive = isPriority === true;
      visible = true;

      var style = priorityActive ? priority : standby;
      var speed = finite(style.packetCyclesPerSecond, priorityActive ? 0.95 : 0.25);
      var phaseBase = basePhase(elapsed, speed);
      coreMaterial.color.set(style.lineColor || (priorityActive ? "#0066CC" : "#9BDFFF"));
      coreMaterial.opacity = finite(style.lineOpacity, priorityActive ? 0.88 : 0.46);
      glowMaterial.color.set(style.glowColor || style.lineColor || (priorityActive ? "#0066CC" : "#9BDFFF"));
      glowMaterial.opacity = finite(style.glowOpacity, priorityActive ? 0.21 : 0.11) *
        (priorityActive ? (0.94 + 0.06 * Math.sin(finite(elapsed, 0) * 4)) : 1);
      core.line.visible = true;
      glow.line.visible = true;

      packets.forEach(function (packet, index) {
        packetMaterials[index].color.set(style.packetColor || (priorityActive ? "#E20074" : "#B9E6FF"));
        packetMaterials[index].opacity = finite(style.packetOpacity, priorityActive ? 0.95 : 0.70);
        var phase = (phaseBase + packet.userData.offset) % 1;
        var progress = packet.userData.direction > 0 ? phase : 1 - phase;
        packet.position.lerpVectors(start, end, progress);
        packet.visible = true;
      });
      return true;
    }

    function runSafety() {
      var result = {
        title: safety.title,
        renderCountErrors: 0,
        packetDirectionErrors: 0,
        depthPolicyErrors: 0,
        staleVisualErrors: 0,
        status: "PASSED",
        errors: []
      };
      if (root.children.length !== 6 || packets.length !== 4) {
        result.renderCountErrors += 1;
        result.errors.push("Shared link object count changed.");
      }
      if (packets.filter(function (packet) { return packet.userData.direction > 0; }).length !== 2 ||
          packets.filter(function (packet) { return packet.userData.direction < 0; }).length !== 2) {
        result.packetDirectionErrors += 1;
        result.errors.push("Shared link packet directions are invalid.");
      }
      var materials = [coreMaterial, glowMaterial].concat(packetMaterials);
      if (materials.some(function (material) { return material.depthTest !== true || material.depthWrite !== false; })) {
        result.depthPolicyErrors += 1;
        result.errors.push("A BOS material violates world-occlusion policy.");
      }
      if (!visible && (core.line.visible || glow.line.visible || packets.some(function (packet) { return packet.visible; }))) {
        result.staleVisualErrors += 1;
        result.errors.push("Hidden shared link retains visible objects.");
      }
      if (result.errors.length) result.status = "FAILED";
      safety = result;
      return result.status === "PASSED";
    }

    function reset() {
      if (disposed) return false;
      hide();
      return runSafety();
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      hide();
      if (root.parent) root.parent.remove(root);
      core.geometry.dispose();
      glow.geometry.dispose();
      coreMaterial.dispose();
      glowMaterial.dispose();
      packetGeometry.dispose();
      packetMaterials.forEach(function (material) { material.dispose(); });
    }

    runSafety();
    return {
      root: root,
      update: update,
      hide: hide,
      reset: reset,
      getSnapshot: function () {
        return {
          name: name,
          visible: visible,
          priorityActive: priorityActive,
          visiblePackets: packets.filter(function (packet) { return packet.visible; }).length,
          forwardPackets: packets.filter(function (packet) { return packet.visible && packet.userData.direction > 0; }).length,
          reversePackets: packets.filter(function (packet) { return packet.visible && packet.userData.direction < 0; }).length,
          start: visible ? { x: start.x, y: start.y, z: start.z } : null,
          end: visible ? { x: end.x, y: end.y, z: end.z } : null,
          packetPositions: packets.map(function (packet) {
            return { x: packet.position.x, y: packet.position.y, z: packet.position.z, visible: packet.visible };
          })
        };
      },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { runSafety(); return copy(safety); },
      dispose: dispose
    };
  }

  window.MissionBosBosLinkVisualFactory = {
    create: create,
    directions: DIRECTIONS.slice(),
    offsets: OFFSETS.slice()
  };
})();
