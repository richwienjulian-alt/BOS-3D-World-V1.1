/* Mission BOS - Build 012M.2
   Mission 001 civilian communication and dashboard snapshot only.
   BOS vehicle-to-cell paths are owned exclusively by the unified BOS runtime.
*/
(function () {
  "use strict";

  var EPSILON = 1e-9;
  var SAFETY_INTERVAL_SECONDS = 0.25;
  var KNOWN_STATES = [
    "READY", "CALL_RECEIVED", "CLEARING_CORRIDOR", "DISPATCHING", "ENROUTE",
    "ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED",
    "RETURNING", "FAILED"
  ];

  function finite(value, fallback) {
    value = Number(value);
    return isFinite(value) ? value : fallback;
  }

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function emptySafety() {
    return {
      title: "MISSION BOS TELEKOM COMMUNICATION 012M.2 RUNTIME SAFETY",
      endpointResolutionErrors: 0,
      invalidRuntimeStateErrors: 0,
      renderCountErrors: 0,
      associationErrors: 0,
      cellLoadErrors: 0,
      capacityErrors: 0,
      dashedCivilianLineErrors: 0,
      duplicateBosPathErrors: 0,
      stalePathErrors: 0,
      status: "PASSED",
      failed: false,
      errors: []
    };
  }

  function finish(safety) {
    safety.failed = safety.errors.length > 0;
    safety.status = safety.failed ? "FAILED" : "PASSED";
    return safety;
  }

  function log(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    if (result.actual) {
      Object.keys(result.actual).forEach(function (key) {
        console[method](key + ": " + result.actual[key] + " / " + result.expected[key]);
      });
    }
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  function fallback() {
    return {
      pathLabel: "Leitstelle ↔ dynamische Funkzelle ↔ Feuerwehr + Polizei",
      civilianStatus: "Nicht aktiv",
      bosStatus: "Standby verbunden",
      comparisonText: "Die Verbindungen folgen der dynamisch ausgewählten Funkzelle.",
      symbolicHint: "Vereinfachte symbolische Visualisierung.",
      priorityActive: false,
      civilianFill: 0,
      bosFill: 0.35,
      civilianMode: "standby",
      bosMode: "standby",
      linkStatus: "Bereit",
      fireTowerId: null,
      fireTowerLabel: "Nicht verfügbar",
      policeTowerId: null,
      policeTowerLabel: "Nicht verfügbar",
      lastHandoverLabel: "Noch kein Handover"
    };
  }

  function failed(message) {
    var safety = emptySafety();
    safety.associationErrors = 1;
    safety.errors.push(message || "Communication initialization failed.");
    safety = finish(safety);
    log(safety);
    var snapshot = fallback();
    return {
      root: null,
      groups: {},
      validation: null,
      update: function () {},
      setState: function () { return false; },
      getDashboardSnapshot: function () { return copy(snapshot); },
      getRuntimeSnapshot: function () { return []; },
      getManifest: function () { return { status: "FAILED" }; },
      getSafetyStatus: function () { return copy(safety); },
      dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var THREE = options.THREE || window.THREE;
    var scene = options.scene;
    var layout = options.layout;
    var recoveryCity = options.recoveryCity;
    var associationRuntime = options.associationRuntime;
    var associationPlan = options.associationPlan || window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN;
    var cellLoadRuntime = options.cellLoadRuntime;
    var cellLoadPlan = options.cellLoadPlan || window.MISSION_BOS_CELL_LOAD_PLAN;
    var capacityRuntime = options.capacityRuntime;
    var priorityRuntime = options.priorityRuntime;
    var unifiedBosRuntime = options.unifiedBosRuntime || null;
    var missionPlan = options.missionPlan;
    var scenePlan = options.scenePlan;
    var legacyPlan = options.plan;
    var validator = options.validator;
    var networkPlan = options.networkRealismPlan || window.MISSION_BOS_NETWORK_REALISM_PLAN;

    if (!THREE || !scene || !layout || !recoveryCity || !recoveryCity.towersById ||
        !associationRuntime || !cellLoadRuntime || !capacityRuntime || !priorityRuntime ||
        !missionPlan || !scenePlan || !legacyPlan || !validator || !networkPlan) {
      return failed("Communication dependencies are incomplete.");
    }

    var validation = validator.validate(
      layout,
      window.MISSION_BOS_RESPONSE_VEHICLE_PLAN,
      missionPlan,
      scenePlan,
      legacyPlan,
      associationPlan,
      cellLoadPlan
    );
    validator.logResult(validation);
    if (!validation || validation.status !== "PASSED") {
      return failed("Frozen communication validation returned FAILED.");
    }

    var civilianStyle = (networkPlan.visualLanguage || {}).civilian || {};
    var civilianDefinitions = (((networkPlan.participants || {}).mission001Civilian) || []).map(copy);
    var root = new THREE.Group();
    root.name = "MISSION_BOS_TELEKOM_CIVILIAN_COMMUNICATION_012M2";
    scene.add(root);

    var groups = {
      bosLinks: new THREE.Group(),
      civilianLinks: new THREE.Group(),
      bosPackets: new THREE.Group(),
      civilianPackets: new THREE.Group(),
      endpointMarkers: new THREE.Group(),
      towerHalos: new THREE.Group()
    };
    Object.keys(groups).forEach(function (key) {
      groups[key].name = key;
      root.add(groups[key]);
    });

    var packetGeometry = new THREE.SphereGeometry(0.085, 8, 6);
    var states = [];
    var currentState = "READY";
    var safety = emptySafety();
    var safetyAccumulator = 0;
    var disposed = false;
    var dashboard = fallback();
    var towerBeaconYOffset = finite((((networkPlan.visualLanguage || {}).anchors || {}).towerBeaconYOffset), 0.35);

    function lineGeometry() {
      var geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      return geometry;
    }

    function createCivilian(definition, index) {
      var geometry = lineGeometry();
      var material = new THREE.LineBasicMaterial({
        color: civilianStyle.defaultColor || "#7A263A",
        transparent: true,
        opacity: finite(civilianStyle.defaultOpacity, 0.075),
        depthTest: civilianStyle.depthTest !== false,
        depthWrite: false
      });
      var line = new THREE.Line(geometry, material);
      line.name = definition.id + "_SOLID_CIVILIAN";
      line.frustumCulled = false;
      line.renderOrder = 9;
      line.visible = false;
      groups.civilianLinks.add(line);

      var packetMaterial = new THREE.MeshBasicMaterial({
        color: civilianStyle.defaultColor || "#7A263A",
        transparent: true,
        opacity: 0.32,
        depthTest: civilianStyle.depthTest !== false,
        depthWrite: false
      });
      var packet = new THREE.Mesh(packetGeometry, packetMaterial);
      packet.name = definition.id + "_DATA_POINT";
      packet.visible = false;
      packet.renderOrder = 10;
      groups.civilianPackets.add(packet);

      return {
        definition: definition,
        index: index,
        geometry: geometry,
        material: material,
        line: line,
        packet: packet,
        packetMaterial: packetMaterial,
        start: new THREE.Vector3(),
        end: new THREE.Vector3(),
        serviceStatus: "SERVED",
        towerId: null
      };
    }

    civilianDefinitions.forEach(function (definition, index) {
      states.push(createCivilian(definition, index));
    });

    var manifest = {
      title: "MISSION BOS TELEKOM COMMUNICATION 012M.2 RENDER MANIFEST",
      actual: {
        civilianLinks: civilianDefinitions.length,
        civilianPackets: civilianDefinitions.length,
        bosVehiclePathsOwned: 0,
        bosVehiclePacketsOwned: 0,
        bosLinks: 0,
        bosPackets: 0,
        dashedCivilianLinks: 0
      },
      expected: {
        civilianLinks: 6,
        civilianPackets: 6,
        bosVehiclePathsOwned: 0,
        bosVehiclePacketsOwned: 0,
        bosLinks: 0,
        bosPackets: 0,
        dashedCivilianLinks: 0
      },
      status: "PASSED"
    };
    manifest.status = Object.keys(manifest.expected).every(function (key) {
      return Number(manifest.actual[key]) === Number(manifest.expected[key]);
    }) ? "PASSED" : "FAILED";
    log(manifest);

    function beacon(towerId, target) {
      var tower = recoveryCity.towersById[towerId];
      var beaconObject = tower && tower.userData ? tower.userData.beacon : null;
      if (!beaconObject || typeof beaconObject.getWorldPosition !== "function") return false;
      beaconObject.getWorldPosition(target);
      target.y += towerBeaconYOffset;
      return true;
    }

    function setGeometry(geometry, start, end) {
      var attribute = geometry.getAttribute("position");
      attribute.array[0] = start.x;
      attribute.array[1] = start.y;
      attribute.array[2] = start.z;
      attribute.array[3] = end.x;
      attribute.array[4] = end.y;
      attribute.array[5] = end.z;
      attribute.needsUpdate = true;
      if (geometry.computeBoundingSphere) geometry.computeBoundingSphere();
    }

    function hide(state) {
      state.line.visible = false;
      state.packet.visible = false;
      state.towerId = null;
    }

    function applyServiceStyle(state, association) {
      var service = capacityRuntime.getEndpointServiceState(state.definition.id);
      var status = service && service.status ? service.status : "SERVED";
      var cell = association.servingTowerId ? capacityRuntime.getCell(association.servingTowerId) : null;
      var color = civilianStyle.defaultColor || "#7A263A";
      var opacity = finite(civilianStyle.defaultOpacity, 0.075);
      var speed = finite(civilianStyle.normalParticleCyclesPerSecond, 0.18);
      var packetOpacity = 0.28;
      if (status === "DEFERRED") {
        color = civilianStyle.deferredColor || "#8F1D2C";
        opacity = finite(civilianStyle.defaultOpacity, 0.075) * 0.72;
        speed = finite(civilianStyle.deferredParticleCyclesPerSecond, 0);
        packetOpacity = 0.12;
      } else if (status === "DEPRIORITIZED") {
        color = civilianStyle.deprioritizedColor || "#E56B6F";
        opacity = finite(civilianStyle.deprioritizedOpacity, 0.18);
        speed = finite(civilianStyle.deprioritizedParticleCyclesPerSecond, 0.045);
        packetOpacity = 0.48;
      } else if (status === "BEST_EFFORT" || (cell && cell.status === "OVERLOADED")) {
        color = civilianStyle.loadedColor || "#B33A3A";
        opacity = finite(civilianStyle.overloadedOpacity, 0.14);
        speed = finite(civilianStyle.loadedParticleCyclesPerSecond, 0.1);
        packetOpacity = 0.38;
      }
      state.material.color.set(color);
      state.material.opacity = opacity;
      state.packetMaterial.color.set(color);
      state.packetMaterial.opacity = packetOpacity;
      state.serviceStatus = status;
      return speed;
    }

    function updateState(state, elapsed) {
      var association = associationRuntime.getAssociation(state.definition.id);
      if (!association || !association.active || !association.position || !association.servingTowerId ||
          !beacon(association.servingTowerId, state.end)) {
        hide(state);
        return;
      }
      state.start.set(
        Number(association.position.x),
        Number(association.position.y),
        Number(association.position.z)
      );
      state.towerId = association.servingTowerId;
      setGeometry(state.geometry, state.start, state.end);
      state.line.visible = true;
      var speed = applyServiceStyle(state, association);
      if (speed <= EPSILON) {
        state.packet.visible = false;
      } else {
        var phase = (finite(elapsed, 0) * speed + state.index / Math.max(1, civilianDefinitions.length)) % 1;
        state.packet.position.lerpVectors(state.start, state.end, phase);
        state.packet.visible = true;
      }
    }

    function towerLabel(endpointId) {
      var association = associationRuntime.getAssociation(endpointId);
      var towerId = association && association.active ? association.servingTowerId : null;
      return { id: towerId, label: towerId ? towerId + " · dynamisch" : "Nicht verfügbar" };
    }

    function endpointPriority(endpointId, towerId) {
      if (unifiedBosRuntime && typeof unifiedBosRuntime.getEndpointSnapshot === "function") {
        var unifiedSnapshot = unifiedBosRuntime.getEndpointSnapshot(endpointId);
        return !!unifiedSnapshot && unifiedSnapshot.priorityActive === true;
      }
      var priority = towerId && priorityRuntime.getCellState ? priorityRuntime.getCellState(towerId) : null;
      return !!priority && priority.active === true && Array.isArray(priority.bosEndpointIds) &&
        priority.bosEndpointIds.indexOf(endpointId) >= 0;
    }

    function refreshDashboard() {
      var fire = towerLabel("NET_FIRE_01");
      var police = towerLabel("NET_POLICE_01");
      var last = associationRuntime.getLastHandover ? associationRuntime.getLastHandover() : null;
      var critical = cellLoadRuntime.getCriticalCell ? cellLoadRuntime.getCriticalCell() : null;
      var priorityActive = endpointPriority("NET_FIRE_01", fire.id) || endpointPriority("NET_POLICE_01", police.id);
      dashboard = {
        pathLabel: fire.id && police.id && fire.id === police.id
          ? "Leitstelle ↔ " + fire.id + " ↔ Feuerwehr + Polizei"
          : "Leitstelle ↔ " + (fire.id || "–") + " / " + (police.id || "–"),
        civilianStatus: critical && critical.status === "OVERLOADED"
          ? "Zivile Sitzungen verlangsamt" : "Zivile Sitzungen aktiv",
        bosStatus: priorityActive ? "BOS priorisiert und stabil" : "BOS dauerhaft verbunden",
        comparisonText: priorityActive
          ? "Schnelle bidirektionale Prioritätspakete laufen auf allen aktiven Segmenten."
          : "Ruhige hellblaue Signalisierung läuft in beide Richtungen.",
        symbolicHint: "Symbolische Simulationseinheiten; keine technische Leistungskennzahl.",
        priorityActive: priorityActive,
        civilianFill: critical ? clamp(finite(critical.currentLoad, 0) / 100, 0, 1) : 0,
        bosFill: priorityActive ? 1 : 0.42,
        civilianMode: priorityActive ? "deprioritized" : (critical && critical.status === "OVERLOADED" ? "congested" : "normal"),
        bosMode: priorityActive ? "stable" : "standby",
        linkStatus: priorityActive ? "BOS stabil" : "Standby verbunden",
        fireTowerId: fire.id,
        fireTowerLabel: fire.label,
        policeTowerId: police.id,
        policeTowerLabel: police.label,
        lastHandoverLabel: last
          ? last.label + " · " + last.fromTowerId + " → " + last.toTowerId
          : "Noch kein Handover"
      };
    }

    function runSafety(initial) {
      var result = emptySafety();
      if (KNOWN_STATES.indexOf(currentState) < 0) {
        result.invalidRuntimeStateErrors += 1;
        result.errors.push("Unknown mission state: " + currentState);
      }
      if (civilianDefinitions.length !== 6 || states.length !== 6) {
        result.renderCountErrors += 1;
        result.errors.push("Mission 001 civilian communication counts changed.");
      }
      if (groups.bosLinks.children.length !== 0 || groups.bosPackets.children.length !== 0) {
        result.duplicateBosPathErrors += 1;
        result.errors.push("Telekom renderer still owns BOS vehicle objects.");
      }
      states.forEach(function (state) {
        var association = associationRuntime.getAssociation(state.definition.id);
        if (state.material.isLineDashedMaterial) {
          result.dashedCivilianLineErrors += 1;
          result.errors.push("Dashed civilian line: " + state.definition.id);
        }
        if (association && association.active && (!association.position || !association.servingTowerId)) {
          result.endpointResolutionErrors += 1;
          result.errors.push("Active endpoint unresolved: " + state.definition.id);
        }
        if (!state.line.visible && state.packet.visible) {
          result.stalePathErrors += 1;
          result.errors.push("Packet visible without civilian path: " + state.definition.id);
        }
      });
      var associationSafety = associationRuntime.getSafetyStatus && associationRuntime.getSafetyStatus();
      var loadSafety = cellLoadRuntime.getSafetyStatus && cellLoadRuntime.getSafetyStatus();
      var capacitySafety = capacityRuntime.getSafetyStatus && capacityRuntime.getSafetyStatus();
      if (!associationSafety || associationSafety.status !== "PASSED") {
        result.associationErrors += 1;
        result.errors.push("Association runtime unsafe.");
      }
      if (!loadSafety || loadSafety.status !== "PASSED") {
        result.cellLoadErrors += 1;
        result.errors.push("Cell-load runtime unsafe.");
      }
      if (!capacitySafety || capacitySafety.status !== "PASSED") {
        result.capacityErrors += 1;
        result.errors.push("Capacity runtime unsafe.");
      }
      safety = finish(result);
      if (initial || safety.failed) log(safety);
    }

    function update(delta, elapsed, runtimeState) {
      if (disposed) return;
      runtimeState = runtimeState || {};
      currentState = String(runtimeState.missionState || currentState || "READY");
      states.forEach(function (state) { updateState(state, elapsed); });
      refreshDashboard();
      safetyAccumulator += Math.max(0, Math.min(finite(delta, 0), 0.25));
      if (safetyAccumulator >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafety(false);
      }
    }

    function setState(stateId) {
      if (KNOWN_STATES.indexOf(stateId) < 0) return false;
      currentState = stateId;
      return true;
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      states.forEach(function (state) {
        state.geometry.dispose();
        state.material.dispose();
        state.packetMaterial.dispose();
      });
      packetGeometry.dispose();
      if (root.parent) root.parent.remove(root);
    }

    refreshDashboard();
    runSafety(true);
    return {
      root: root,
      groups: groups,
      validation: validation,
      update: update,
      setState: setState,
      getDashboardSnapshot: function () { return copy(dashboard); },
      getRuntimeSnapshot: function () { return []; },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: dispose
    };
  }

  window.MissionBosTelekomCommunicationExperience = {
    create: create
  };
})();
