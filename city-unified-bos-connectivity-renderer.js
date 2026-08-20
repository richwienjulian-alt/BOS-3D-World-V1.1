/* Mission BOS - Build 012M.4
   Unified operational vehicle-to-serving-cell links with direct per-frame
   vehicle anchors and cell-local, mission-scoped priority styling.
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
    var manifest = {
      title: "MISSION BOS UNIFIED OPERATIONAL CONNECTIVITY 012M.4 MANIFEST",
      endpoints: 0, operationalEndpoints: 0, vehiclePaths: 0, packetsPerPath: 0,
      totalVehiclePackets: 0, forwardPackets: 0, reversePackets: 0,
      duplicatePaths: 0, alwaysOnTopPaths: 0, utilityPriorityPaths: 0,
      status: "FAILED"
    };
    var safety = {
      title: "MISSION BOS UNIFIED OPERATIONAL CONNECTIVITY 012M.4 SAFETY",
      dependencyErrors: 1, endpointErrors: 0, livePositionErrors: 0,
      servingTowerErrors: 0, priorityStyleErrors: 0, utilityPriorityErrors: 0,
      renderCountErrors: 0, depthPolicyErrors: 0, packetDirectionErrors: 0,
      stalePathErrors: 0, recoverableWarnings: 0, fatalErrors: 1,
      status: "FAILED", errors: [message], warnings: []
    };
    console.error(message);
    return {
      root: null, update: function () {}, reset: function () { return false; },
      getEndpointSnapshot: function () { return null; }, getRuntimeSnapshot: function () { return []; },
      getManifest: function () { return copy(manifest); }, getSafetyStatus: function () { return copy(safety); },
      getEndpointRuntime: function () { return null; }, dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var THREE = options.THREE || window.THREE;
    var scene = options.scene;
    var recoveryCity = options.recoveryCity;
    var associationRuntime = options.associationRuntime;
    var priorityRuntime = options.priorityRuntime;
    var responseRuntime = options.responseRuntime;
    var ambulanceRuntime = options.ambulanceRuntime;
    var stadtwerkeRuntime = options.stadtwerkeRuntime;
    var networkPlan = options.networkRealismPlan || window.MISSION_BOS_NETWORK_REALISM_PLAN;
    var recoveryPlan = options.recoveryPlan || window.MISSION_BOS_NETWORK_RECOVERY_PLAN;
    var connectivityRecoveryPlan = options.connectivityRecoveryPlan || window.MISSION_BOS_MISSION_003_CONNECTIVITY_RECOVERY_PLAN;
    var plan = options.plan || window.MISSION_BOS_UNIFIED_BOS_CONNECTIVITY_PLAN;
    var factory = options.visualFactory || window.MissionBosBosLinkVisualFactory;

    if (!THREE || !scene || !recoveryCity || !recoveryCity.towersById ||
        !associationRuntime || !priorityRuntime || !responseRuntime || !responseRuntime.vehiclesById ||
        !ambulanceRuntime || typeof ambulanceRuntime.getCommsPosition !== "function" ||
        !stadtwerkeRuntime || typeof stadtwerkeRuntime.getCommsPosition !== "function" ||
        !networkPlan || !recoveryPlan || !connectivityRecoveryPlan || !plan ||
        !factory || typeof factory.create !== "function") {
      return failed("Unified operational connectivity dependencies are incomplete.");
    }

    var endpointDefinitions = (plan.endpoints || []).map(copy);
    if (!endpointDefinitions.length) return failed("Unified operational connectivity plan has no endpoints.");

    var root = new THREE.Group();
    root.name = "MISSION_BOS_UNIFIED_OPERATIONAL_CONNECTIVITY_012M4";
    scene.add(root);

    var statesById = Object.create(null);
    var stateList = [];
    var disposed = false;
    var lastElapsed = 0;
    var safetyAccumulator = 0;
    var lastRuntimeState = { activeMissionId: null, missionState: "READY" };
    var towerBeaconYOffset = finite((((networkPlan.visualLanguage || {}).anchors || {}).towerBeaconYOffset), 0.35);
    var scratch = new THREE.Vector3();

    endpointDefinitions.forEach(function (definition) {
      var visual = factory.create({
        THREE: THREE,
        parent: root,
        name: definition.endpointId + "_TO_SERVING_CELL",
        recoveryPlan: recoveryPlan,
        renderOrders: {
          glow: finite((plan.renderingContract || {}).glowRenderOrder, 40),
          core: finite((plan.renderingContract || {}).coreRenderOrder, 41),
          packet: finite((plan.renderingContract || {}).packetRenderOrder, 42)
        }
      });
      var state = {
        definition: definition,
        visual: visual,
        start: new THREE.Vector3(),
        end: new THREE.Vector3(),
        visible: false,
        servingTowerId: null,
        priorityActive: false,
        anchorResolved: false,
        recoverableWarning: null
      };
      statesById[definition.endpointId] = state;
      stateList.push(state);
    });

    var expected = plan.expected || {};
    var expectedEndpoints = finite(expected.operationalVehicleEndpoints, endpointDefinitions.length);
    var expectedPaths = finite(expected.operationalVehiclePaths, endpointDefinitions.length);
    var expectedPackets = finite(expected.totalVehiclePackets, endpointDefinitions.length * 4);
    var expectedForward = finite(expected.forwardPackets, endpointDefinitions.length * 2);
    var expectedReverse = finite(expected.reversePackets, endpointDefinitions.length * 2);

    var manifest = {
      title: "MISSION BOS UNIFIED OPERATIONAL CONNECTIVITY 012M.4 MANIFEST",
      endpoints: endpointDefinitions.length,
      operationalEndpoints: endpointDefinitions.length,
      vehiclePaths: stateList.length,
      packetsPerPath: finite((plan.packetContract || {}).packetsPerPath, 4),
      totalVehiclePackets: stateList.length * 4,
      forwardPackets: stateList.length * 2,
      reversePackets: stateList.length * 2,
      duplicatePaths: 0,
      alwaysOnTopPaths: 0,
      utilityPriorityPaths: 0,
      updateFrequency: "EVERY_RENDER_FRAME",
      associationSource: "MissionBosNetworkAssociationController",
      liveAnchorSource: "DIRECT_VEHICLE_RUNTIMES",
      prioritySource: "MissionBosAutomaticBOSPriorityController",
      status: "PASSED"
    };
    if (manifest.endpoints !== expectedEndpoints || manifest.vehiclePaths !== expectedPaths ||
        manifest.totalVehiclePackets !== expectedPackets || manifest.forwardPackets !== expectedForward ||
        manifest.reversePackets !== expectedReverse) manifest.status = "FAILED";

    var safety = null;

    function towerBeacon(towerId, target) {
      var tower = recoveryCity.towersById[towerId];
      var beacon = tower && tower.userData ? tower.userData.beacon : null;
      if (!beacon || typeof beacon.getWorldPosition !== "function") return false;
      beacon.getWorldPosition(target);
      target.y += towerBeaconYOffset;
      return isFinite(target.x) && isFinite(target.y) && isFinite(target.z);
    }

    function objectWorldPosition(object, target, yOffset) {
      if (!object) return false;
      if (typeof object.getWorldPosition === "function") object.getWorldPosition(target);
      else if (object.position) target.set(Number(object.position.x), Number(object.position.y), Number(object.position.z));
      else return false;
      target.y += finite(yOffset, 0);
      return isFinite(target.x) && isFinite(target.y) && isFinite(target.z);
    }

    function resolveLiveAnchor(definition, target) {
      if (!definition) return false;
      if (definition.endpointId === "NET_FIRE_01" || definition.endpointId === "NET_POLICE_01") {
        var responseState = responseRuntime.vehiclesById[definition.vehicleId];
        return objectWorldPosition(responseState && responseState.mesh, target, finite(definition.vehicleAnchorYOffset, 1.35));
      }
      if (definition.endpointId === "NET_AMBULANCE_01") {
        var ambulancePosition = ambulanceRuntime.getCommsPosition();
        if (!ambulancePosition) return false;
        target.set(Number(ambulancePosition.x), Number(ambulancePosition.y), Number(ambulancePosition.z));
        return isFinite(target.x) && isFinite(target.y) && isFinite(target.z);
      }
      if (definition.endpointId === "NET_STADTWERKE_01") {
        var utilityPosition = stadtwerkeRuntime.getCommsPosition(scratch);
        if (!utilityPosition) return false;
        target.set(Number(utilityPosition.x), Number(utilityPosition.y), Number(utilityPosition.z));
        return isFinite(target.x) && isFinite(target.y) && isFinite(target.z);
      }
      return false;
    }

    function endpointPriority(definition, towerId) {
      if (!definition || !towerId) return false;
      var cellState = priorityRuntime.getCellState ? priorityRuntime.getCellState(towerId) : null;
      return !!cellState && cellState.active === true && Array.isArray(cellState.bosEndpointIds) &&
        cellState.bosEndpointIds.indexOf(definition.endpointId) >= 0;
    }

    function hideState(state, warning) {
      state.visible = false;
      state.priorityActive = false;
      state.anchorResolved = false;
      state.recoverableWarning = warning || null;
      state.visual.hide();
    }

    function updateState(state, elapsed) {
      var endpointId = state.definition.endpointId;
      var association = associationRuntime.getAssociation(endpointId);
      if (!association || association.active !== true || !association.servingTowerId) {
        state.servingTowerId = null;
        hideState(state, "TRANSIENT_SERVING_CELL_UNAVAILABLE");
        return;
      }
      if (!resolveLiveAnchor(state.definition, state.start)) {
        state.servingTowerId = association.servingTowerId;
        hideState(state, "TRANSIENT_ENDPOINT_POSITION_UNAVAILABLE");
        return;
      }
      if (!towerBeacon(association.servingTowerId, state.end)) {
        state.servingTowerId = association.servingTowerId;
        hideState(state, "INVALID_TOWER_REFERENCE");
        return;
      }
      state.anchorResolved = true;
      state.recoverableWarning = null;
      state.servingTowerId = association.servingTowerId;
      state.priorityActive = endpointPriority(state.definition, association.servingTowerId);
      state.visible = state.visual.update(state.start, state.end, state.priorityActive, elapsed, true);
    }

    function addError(result, key, message, fatal) {
      result[key] += 1;
      result.errors.push(message);
      if (fatal) result.fatalErrors += 1;
    }

    function addWarning(result, message) {
      result.recoverableWarnings += 1;
      result.warnings.push(message);
    }

    function mission003PriorityStateValid() {
      var contract = connectivityRecoveryPlan.mission003Priority || {};
      return lastRuntimeState.activeMissionId === contract.validMissionId &&
        (contract.validStates || []).indexOf(lastRuntimeState.missionState) >= 0;
    }

    function runSafety(initial) {
      var result = {
        title: "MISSION BOS UNIFIED OPERATIONAL CONNECTIVITY 012M.4 SAFETY",
        dependencyErrors: 0, endpointErrors: 0, livePositionErrors: 0,
        servingTowerErrors: 0, priorityStyleErrors: 0, utilityPriorityErrors: 0,
        renderCountErrors: 0, depthPolicyErrors: 0, packetDirectionErrors: 0,
        stalePathErrors: 0, recoverableWarnings: 0, fatalErrors: 0,
        status: "PASSED", errors: [], warnings: []
      };
      var seen = Object.create(null);
      var utilityPriorityPaths = 0;
      if (root.children.length !== expectedPaths || stateList.length !== expectedPaths) {
        addError(result, "renderCountErrors", "Unified operational path count changed.", true);
      }
      stateList.forEach(function (state) {
        var endpointId = state.definition.endpointId;
        if (seen[endpointId]) addError(result, "renderCountErrors", "Duplicate endpoint path: " + endpointId, true);
        seen[endpointId] = true;
        var association = associationRuntime.getAssociation(endpointId);
        if (!association || association.active !== true) {
          addWarning(result, "Permanent operational association is temporarily unavailable: " + endpointId);
        } else if (!association.servingTowerId) {
          addWarning(result, "Serving tower is temporarily unavailable: " + endpointId);
        } else if (!recoveryCity.towersById[association.servingTowerId]) {
          addError(result, "servingTowerErrors", "Serving tower reference is invalid: " + endpointId, true);
        }
        if (!resolveLiveAnchor(state.definition, scratch)) {
          addWarning(result, "Direct live vehicle anchor is temporarily unavailable: " + endpointId);
        }
        var expectedPriority = !!association && !!association.servingTowerId && endpointPriority(state.definition, association.servingTowerId);
        if (state.visible && state.priorityActive !== expectedPriority) {
          addError(result, "priorityStyleErrors", "Cell-local priority style mismatch: " + endpointId, false);
        }
        if (endpointId === "NET_STADTWERKE_01" && state.priorityActive === true) {
          utilityPriorityPaths += 1;
          if (!mission003PriorityStateValid()) {
            addError(result, "utilityPriorityErrors", "Mission-scoped Stadtwerke priority leaked outside Mission 003.", false);
          }
        }
        var visualManifest = state.visual.getManifest();
        var visualSafety = state.visual.getSafetyStatus();
        if (!visualManifest || visualManifest.status !== "PASSED" || Number(visualManifest.alwaysOnTopMaterials) !== 0 ||
            !visualSafety || visualSafety.status !== "PASSED") {
          addError(result, "depthPolicyErrors", "World-occluded shared visual failed: " + endpointId, true);
        }
        var snapshot = state.visual.getSnapshot();
        if (snapshot.visiblePackets !== 0 && snapshot.visiblePackets !== 4) {
          addError(result, "packetDirectionErrors", "Visible packet count invalid: " + endpointId, false);
        }
        if (snapshot.visible && (snapshot.forwardPackets !== 2 || snapshot.reversePackets !== 2)) {
          addError(result, "packetDirectionErrors", "Packet directions invalid: " + endpointId, false);
        }
        if (!state.visible && snapshot.visiblePackets !== 0) {
          addError(result, "stalePathErrors", "Stale packets remain: " + endpointId, false);
        }
      });
      manifest.utilityPriorityPaths = utilityPriorityPaths;
      var associationSafety = associationRuntime.getSafetyStatus && associationRuntime.getSafetyStatus();
      var prioritySafety = priorityRuntime.getSafetyStatus && priorityRuntime.getSafetyStatus();
      if (!associationSafety || associationSafety.fatal === true || !prioritySafety || prioritySafety.fatal === true) {
        addError(result, "dependencyErrors", "Association or priority runtime has a fatal safety error.", true);
      } else {
        if (associationSafety.status !== "PASSED") addWarning(result, "Association runtime reported a recoverable warning.");
        if (prioritySafety.status !== "PASSED") addWarning(result, "Priority runtime reported a recoverable warning.");
      }
      if (result.errors.length) result.status = "FAILED";
      safety = result;
      if (initial || result.status === "FAILED") {
        var method = result.status === "PASSED" ? "log" : "error";
        console.group(result.title);
        console[method]("Endpoints: " + manifest.endpoints + " / " + expectedEndpoints);
        console[method]("Vehicle paths: " + manifest.vehiclePaths + " / " + expectedPaths);
        console[method]("Total packets: " + manifest.totalVehiclePackets + " / " + expectedPackets);
        console[method]("Forward/reverse: " + manifest.forwardPackets + "/" + manifest.reversePackets +
          " / " + expectedForward + "/" + expectedReverse);
        console[method]("Utility priority paths: " + manifest.utilityPriorityPaths + " / mission-scoped maximum 1");
        console[method]("Recoverable warnings: " + result.recoverableWarnings);
        console[method]("Always-on-top paths: " + manifest.alwaysOnTopPaths + " / 0");
        console[method]("STATUS: " + result.status);
        if (result.errors.length) console.error(result.errors);
        console.groupEnd();
      }
      return result.status === "PASSED";
    }

    function update(delta, elapsed, runtimeState) {
      if (disposed) return;
      lastElapsed = finite(elapsed, lastElapsed);
      runtimeState = runtimeState || {};
      lastRuntimeState = {
        activeMissionId: runtimeState.activeMissionId || null,
        missionState: String(runtimeState.missionState || "READY")
      };
      stateList.forEach(function (state) { updateState(state, lastElapsed); });
      safetyAccumulator += Math.max(0, Math.min(finite(delta, 0), 0.25));
      if (safetyAccumulator >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafety(false);
      }
    }

    function reset() {
      if (disposed) return false;
      stateList.forEach(function (state) {
        state.visual.reset();
        state.visible = false;
        state.servingTowerId = null;
        state.priorityActive = false;
        state.anchorResolved = false;
        state.recoverableWarning = null;
      });
      safetyAccumulator = 0;
      stateList.forEach(function (state) { updateState(state, lastElapsed); });
      return runSafety(false);
    }

    function endpointSnapshot(endpointId) {
      var state = statesById[endpointId];
      if (!state) return null;
      var visual = state.visual.getSnapshot();
      return {
        endpointId: endpointId,
        vehicleId: state.definition.vehicleId,
        role: state.definition.role,
        channel: state.definition.channel,
        priorityEligible: state.definition.priorityEligible === true,
        mission003PriorityEligible: state.definition.mission003PriorityEligible === true,
        visible: state.visible,
        anchorResolved: state.anchorResolved,
        anchorSource: state.definition.directAnchorSource || null,
        recoverableWarning: state.recoverableWarning,
        servingTowerId: state.servingTowerId,
        priorityActive: state.priorityActive,
        visiblePackets: visual.visiblePackets,
        forwardPackets: visual.forwardPackets,
        reversePackets: visual.reversePackets,
        start: visual.start,
        target: visual.end,
        packetPositions: visual.packetPositions
      };
    }

    function endpointFacade(endpointId) {
      if (!statesById[endpointId]) return null;
      return {
        root: statesById[endpointId].visual.root,
        update: function () {}, reset: function () { return true; },
        getRuntimeSnapshot: function () { return endpointSnapshot(endpointId); },
        getManifest: function () {
          return {
            title: "MISSION BOS UNIFIED ENDPOINT FACADE 012M.4 MANIFEST",
            endpointId: endpointId, endpointCount: 1, coreLines: 1, glowLines: 1,
            packetMarkers: 4, forwardPackets: 2, reversePackets: 2,
            fixedTowerDefinitions: 0, alwaysVisibleAssociation: true, facadeOnly: true,
            legacyAmbulanceCompatibility: endpointId === "NET_AMBULANCE_01",
            ownsSceneObjects: false, status: "PASSED"
          };
        },
        getSafetyStatus: function () {
          var snapshot = endpointSnapshot(endpointId);
          return {
            title: "MISSION BOS UNIFIED ENDPOINT FACADE 012M.4 SAFETY",
            endpointId: endpointId, duplicateObjectErrors: 0,
            status: snapshot ? "PASSED" : "FAILED", errors: snapshot ? [] : ["Endpoint is unavailable."]
          };
        },
        dispose: function () {}
      };
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      stateList.forEach(function (state) { state.visual.dispose(); });
      if (root.parent) root.parent.remove(root);
    }

    update(0, 0, { activeMissionId: null, missionState: "READY" });
    runSafety(true);

    return {
      root: root, update: update, reset: reset,
      getEndpointSnapshot: endpointSnapshot,
      getRuntimeSnapshot: function () { return endpointDefinitions.map(function (definition) { return endpointSnapshot(definition.endpointId); }); },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { runSafety(false); return copy(safety); },
      getEndpointRuntime: endpointFacade,
      dispose: dispose
    };
  }

  window.MissionBosUnifiedBosConnectivityRenderer = { create: create };
})();
