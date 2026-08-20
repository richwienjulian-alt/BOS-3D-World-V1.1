/* Mission BOS - Build 012M.2
   Permanent B01/G02 backhaul using the shared world-occluded BOS link primitive.
*/
(function () {
  "use strict";

  var SAFETY_INTERVAL_SECONDS = 0.25;

  function finite(value, fallback) {
    value = Number(value);
    return isFinite(value) ? value : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function failed(message) {
    var safety = {
      title: "MISSION BOS BACKHAUL 012M.2 RUNTIME SAFETY",
      buildingAnchorErrors: 1,
      dependencyErrors: 0,
      fixedTowerErrors: 0,
      duplicatePathErrors: 0,
      livePositionErrors: 0,
      priorityStyleErrors: 0,
      packetDirectionErrors: 0,
      packetLeakErrors: 0,
      stalePathErrors: 0,
      renderCountErrors: 0,
      depthPolicyErrors: 0,
      status: "FAILED",
      errors: [message]
    };
    var manifest = {
      title: "MISSION BOS BACKHAUL 012M.2 RENDER MANIFEST",
      controlBuildingSources: 0,
      ambulanceBaseSources: 0,
      maximumMission001TowerLinks: 0,
      maximumAmbulanceBaseLinks: 0,
      maximumVisiblePaths: 0,
      packetsPerPath: 0,
      forwardPacketsPerPath: 0,
      reversePacketsPerPath: 0,
      fixedServingTowerDefinitions: 0,
      alwaysOnTopPaths: 0,
      status: "FAILED"
    };
    console.error(message);
    return {
      root: null,
      update: function () {},
      reset: function () { return false; },
      getRuntimeSnapshot: function () { return []; },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: function () {}
    };
  }

  function containsFixedTower(value) {
    if (!value || typeof value !== "object") return false;
    var keys = Object.keys(value);
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      var lower = String(key).toLowerCase();
      if (lower === "servingtowerid" || lower === "fixedtowerid" ||
          lower === "fixedservingtowerid" || lower === "fixedcellid") return true;
      if (containsFixedTower(value[key])) return true;
    }
    return false;
  }

  function create(options) {
    options = options || {};
    var THREE = options.THREE || window.THREE;
    var scene = options.scene;
    var recoveryCity = options.recoveryCity;
    var associationRuntime = options.associationRuntime;
    var priorityRuntime = options.priorityRuntime;
    var networkPlan = options.networkRealismPlan || window.MISSION_BOS_NETWORK_REALISM_PLAN;
    var plan = options.plan || window.MISSION_BOS_MISSION_001_NETWORK_POLISH_PLAN;
    var recoveryPlan = options.recoveryPlan || window.MISSION_BOS_NETWORK_RECOVERY_PLAN;
    var unifiedPlan = options.unifiedPlan || window.MISSION_BOS_UNIFIED_BOS_CONNECTIVITY_PLAN;
    var factory = options.visualFactory || window.MissionBosBosLinkVisualFactory;

    if (!THREE || !scene || !recoveryCity || !recoveryCity.towersById ||
        !recoveryCity.buildingsById || !associationRuntime || !priorityRuntime ||
        !networkPlan || !plan || !recoveryPlan || !unifiedPlan || !factory ||
        typeof factory.create !== "function") {
      return failed("BOS backhaul dependencies are incomplete.");
    }

    var missionBackhaul = plan.mission001Backhaul || {};
    var ambulanceBackhaul = plan.ambulanceStandbyConnectivity || {};
    var missionEndpointIds = (missionBackhaul.bosEndpointIds || []).slice();
    var ambulanceEndpointId = ambulanceBackhaul.endpointId;
    var controlBuildingId = missionBackhaul.controlBuildingId;
    var ambulanceBaseId = ambulanceBackhaul.baseBuildingId;
    var towerBeaconYOffset = finite((((networkPlan.visualLanguage || {}).anchors || {}).towerBeaconYOffset), 0.35);

    var root = new THREE.Group();
    root.name = "MISSION_BOS_BACKHAUL_012M2";
    scene.add(root);

    function createSlot(name, purpose, buildingId) {
      return {
        name: name,
        purpose: purpose,
        buildingId: buildingId,
        visual: factory.create({
          THREE: THREE,
          parent: root,
          name: name,
          recoveryPlan: recoveryPlan,
          renderOrders: {
            glow: finite((unifiedPlan.renderingContract || {}).glowRenderOrder, 40),
            core: finite((unifiedPlan.renderingContract || {}).coreRenderOrder, 41),
            packet: finite((unifiedPlan.renderingContract || {}).packetRenderOrder, 42)
          }
        }),
        start: new THREE.Vector3(),
        end: new THREE.Vector3(),
        visible: false,
        towerId: null,
        endpointIds: [],
        priorityActive: false
      };
    }

    var slots = [
      createSlot("B01_BACKHAUL_SLOT_1", "MISSION_001_CONTROL", controlBuildingId),
      createSlot("B01_BACKHAUL_SLOT_2", "MISSION_001_CONTROL", controlBuildingId),
      createSlot("G02_BACKHAUL_SLOT_1", "AMBULANCE_BASE", ambulanceBaseId)
    ];
    var disposed = false;
    var safetyAccumulator = 0;
    var lastElapsed = 0;

    function towerAnchor(towerId, target) {
      var tower = recoveryCity.towersById[towerId];
      var beacon = tower && tower.userData ? tower.userData.beacon : null;
      if (!beacon || typeof beacon.getWorldPosition !== "function") return false;
      beacon.getWorldPosition(target);
      target.y += towerBeaconYOffset;
      return true;
    }

    function buildingAnchor(buildingId, target) {
      var building = recoveryCity.buildingsById[buildingId];
      if (!building) return false;
      var roof = null;
      for (var i = 0; i < building.children.length; i += 1) {
        if (building.children[i] && building.children[i].name === buildingId + "_ROOF") {
          roof = building.children[i];
          break;
        }
      }
      if (roof && typeof roof.getWorldPosition === "function") {
        roof.getWorldPosition(target);
        target.y += 0.35;
        return true;
      }
      if (typeof building.getWorldPosition !== "function") return false;
      building.getWorldPosition(target);
      target.y += finite((((building.userData || {}).sourceData || {}).height), 5.5) + 0.48;
      return true;
    }

    function pathPriority(towerId, endpointIds) {
      var cell = towerId && priorityRuntime.getCellState
        ? priorityRuntime.getCellState(towerId) : null;
      if (!cell || cell.active !== true || !Array.isArray(cell.bosEndpointIds)) return false;
      return endpointIds.some(function (endpointId) {
        return cell.bosEndpointIds.indexOf(endpointId) >= 0;
      });
    }

    function hide(slot) {
      slot.visible = false;
      slot.towerId = null;
      slot.endpointIds = [];
      slot.priorityActive = false;
      slot.visual.hide();
    }

    function render(slot, towerId, endpointIds, elapsed) {
      if (!towerAnchor(towerId, slot.start) || !buildingAnchor(slot.buildingId, slot.end)) {
        hide(slot);
        return;
      }
      slot.towerId = towerId;
      slot.endpointIds = endpointIds.slice().sort();
      slot.priorityActive = pathPriority(towerId, slot.endpointIds);
      slot.visible = slot.visual.update(
        slot.start,
        slot.end,
        slot.priorityActive,
        elapsed,
        true
      );
    }

    function updatePaths(elapsed) {
      lastElapsed = finite(elapsed, lastElapsed);
      slots.forEach(hide);

      var missionByTower = Object.create(null);
      missionEndpointIds.forEach(function (endpointId) {
        var association = associationRuntime.getAssociation(endpointId);
        if (!association || association.active !== true || !association.servingTowerId) return;
        if (!missionByTower[association.servingTowerId]) missionByTower[association.servingTowerId] = [];
        missionByTower[association.servingTowerId].push(endpointId);
      });
      Object.keys(missionByTower).sort().slice(0, 2).forEach(function (towerId, index) {
        render(slots[index], towerId, missionByTower[towerId], lastElapsed);
      });

      var ambulanceAssociation = associationRuntime.getAssociation(ambulanceEndpointId);
      if (ambulanceAssociation && ambulanceAssociation.active === true && ambulanceAssociation.servingTowerId) {
        render(slots[2], ambulanceAssociation.servingTowerId, [ambulanceEndpointId], lastElapsed);
      }
    }

    var manifest = {
      title: "MISSION BOS BACKHAUL 012M.2 RENDER MANIFEST",
      controlBuildingSources: recoveryCity.buildingsById[controlBuildingId] ? 1 : 0,
      ambulanceBaseSources: recoveryCity.buildingsById[ambulanceBaseId] ? 1 : 0,
      maximumMission001TowerLinks: 2,
      maximumAmbulanceBaseLinks: 1,
      maximumVisiblePaths: 3,
      packetsPerPath: 4,
      forwardPacketsPerPath: 2,
      reversePacketsPerPath: 2,
      fixedServingTowerDefinitions: containsFixedTower(plan) || containsFixedTower(unifiedPlan) ? 1 : 0,
      alwaysOnTopPaths: 0,
      visualFactory: "MissionBosBosLinkVisualFactory",
      status: "PASSED"
    };
    if (manifest.controlBuildingSources !== 1 || manifest.ambulanceBaseSources !== 1 ||
        manifest.fixedServingTowerDefinitions !== 0 || manifest.alwaysOnTopPaths !== 0) {
      manifest.status = "FAILED";
    }

    var safety = null;

    function addError(result, key, message) {
      result[key] += 1;
      result.errors.push(message);
    }

    function runSafety(initial) {
      var result = {
        title: "MISSION BOS BACKHAUL 012M.2 RUNTIME SAFETY",
        buildingAnchorErrors: 0,
        dependencyErrors: 0,
        fixedTowerErrors: 0,
        duplicatePathErrors: 0,
        livePositionErrors: 0,
        priorityStyleErrors: 0,
        packetDirectionErrors: 0,
        packetLeakErrors: 0,
        stalePathErrors: 0,
        renderCountErrors: 0,
        depthPolicyErrors: 0,
        status: "PASSED",
        errors: []
      };
      if (!recoveryCity.buildingsById[controlBuildingId]) {
        addError(result, "buildingAnchorErrors", "B01 unavailable.");
      }
      if (!recoveryCity.buildingsById[ambulanceBaseId]) {
        addError(result, "buildingAnchorErrors", "G02 unavailable.");
      }
      if (manifest.fixedServingTowerDefinitions !== 0) {
        addError(result, "fixedTowerErrors", "Fixed serving tower in backhaul configuration.");
      }
      if (root.children.length !== 3) {
        addError(result, "renderCountErrors", "Backhaul visual slot count changed.");
      }

      var seenControlTowers = Object.create(null);
      slots.forEach(function (slot) {
        var snapshot = slot.visual.getSnapshot();
        var visualManifest = slot.visual.getManifest();
        var visualSafety = slot.visual.getSafetyStatus();
        if (!visualManifest || visualManifest.status !== "PASSED" ||
            Number(visualManifest.alwaysOnTopMaterials) !== 0 ||
            !visualSafety || visualSafety.status !== "PASSED") {
          addError(result, "depthPolicyErrors", "Shared visual contract failed: " + slot.name);
        }
        if (!slot.visible) {
          if (snapshot.visiblePackets !== 0) {
            addError(result, "stalePathErrors", "Packet without visible path: " + slot.name);
          }
          return;
        }
        if (slot.purpose === "MISSION_001_CONTROL") {
          if (seenControlTowers[slot.towerId]) {
            addError(result, "duplicatePathErrors", "Duplicate B01 path: " + slot.towerId);
          }
          seenControlTowers[slot.towerId] = true;
        }
        var expectedPriority = pathPriority(slot.towerId, slot.endpointIds);
        if (slot.priorityActive !== expectedPriority || snapshot.priorityActive !== expectedPriority) {
          addError(result, "priorityStyleErrors", "Priority style mismatch: " + slot.name);
        }
        if (snapshot.visiblePackets !== 4 || snapshot.forwardPackets !== 2 || snapshot.reversePackets !== 2) {
          addError(result, "packetDirectionErrors", "Packet directions invalid: " + slot.name);
        }
      });

      missionEndpointIds.concat([ambulanceEndpointId]).forEach(function (endpointId) {
        var association = associationRuntime.getAssociation(endpointId);
        if (association && association.active === true && !association.position) {
          addError(result, "livePositionErrors", "Live position unavailable: " + endpointId);
        }
      });
      var associationSafety = associationRuntime.getSafetyStatus && associationRuntime.getSafetyStatus();
      var prioritySafety = priorityRuntime.getSafetyStatus && priorityRuntime.getSafetyStatus();
      if (!associationSafety || associationSafety.status !== "PASSED" ||
          !prioritySafety || prioritySafety.status !== "PASSED") {
        addError(result, "dependencyErrors", "Association or priority runtime unsafe.");
      }
      if (result.errors.length) result.status = "FAILED";
      safety = result;
      if (initial || result.status === "FAILED") {
        var method = result.status === "PASSED" ? "log" : "error";
        console.group(result.title);
        console[method]("B01 sources: " + manifest.controlBuildingSources + " / 1");
        console[method]("G02 sources: " + manifest.ambulanceBaseSources + " / 1");
        console[method]("Packets per path: " + manifest.packetsPerPath + " / 4");
        console[method]("Always-on-top paths: " + manifest.alwaysOnTopPaths + " / 0");
        console[method]("STATUS: " + result.status);
        if (result.errors.length) console.error(result.errors);
        console.groupEnd();
      }
      return result.status === "PASSED";
    }

    function update(delta, elapsed) {
      if (disposed) return;
      updatePaths(elapsed);
      safetyAccumulator += Math.max(0, Math.min(finite(delta, 0), 0.25));
      if (safetyAccumulator >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafety(false);
      }
    }

    function reset() {
      if (disposed) return false;
      slots.forEach(function (slot) {
        slot.visual.reset();
        hide(slot);
      });
      safetyAccumulator = 0;
      updatePaths(lastElapsed);
      return runSafety(false);
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      slots.forEach(function (slot) { slot.visual.dispose(); });
      if (root.parent) root.parent.remove(root);
    }

    updatePaths(0);
    runSafety(true);

    return {
      root: root,
      update: update,
      reset: reset,
      getRuntimeSnapshot: function () {
        return slots.filter(function (slot) { return slot.visible; }).map(function (slot) {
          var snapshot = slot.visual.getSnapshot();
          return {
            name: slot.name,
            purpose: slot.purpose,
            buildingId: slot.buildingId,
            servingTowerId: slot.towerId,
            endpointIds: slot.endpointIds.slice(),
            priorityActive: slot.priorityActive,
            visiblePackets: snapshot.visiblePackets,
            forwardPackets: snapshot.forwardPackets,
            reversePackets: snapshot.reversePackets,
            start: snapshot.start,
            end: snapshot.end
          };
        });
      },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { runSafety(false); return copy(safety); },
      dispose: dispose
    };
  }

  window.MissionBosBosBackhaulRenderer = {
    create: create
  };
})();
