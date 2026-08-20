/* Mission BOS - Build 013M.1
   Visual-only BOS activation impact. Reads false -> true priority edges and
   never modifies missions, radio, associations, cell load, capacity or camera.
*/
(function () {
  "use strict";

  function finite(value, fallback) {
    value = Number(value);
    return isFinite(value) ? value : fallback;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function makeSafety() {
    return {
      title: "MISSION BOS BOS ACTIVATION IMPACT RUNTIME SAFETY",
      dependencyErrors: 0,
      towerCountErrors: 0,
      duplicateEffectErrors: 0,
      dashboardErrors: 0,
      depthErrors: 0,
      staleEffectErrors: 0,
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

  function logResult(title, result, manifest) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(title);
    if (manifest) {
      console[method]("Tower candidates: " + manifest.actual.towerCandidates + " / " + manifest.expected.towerCandidates);
      console[method]("Dashboard banners: " + manifest.actual.dashboardBanners + " / " + manifest.expected.dashboardBanners);
    }
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  function failedRuntime(scene, message) {
    var root = typeof THREE !== "undefined" ? new THREE.Group() : null;
    if (root && scene) scene.add(root);
    var safety = makeSafety();
    safety.dependencyErrors = 1;
    safety.errors.push(message || "BOS activation impact dependencies are incomplete.");
    finishSafety(safety);
    var manifest = {
      title: "MISSION BOS BOS ACTIVATION IMPACT RUNTIME MANIFEST",
      actual: { towerCandidates: 0, dashboardBanners: 0, worldRings: 0, beaconGlows: 0 },
      expected: { towerCandidates: 5, dashboardBanners: 1, worldRings: 5, beaconGlows: 5 },
      status: "FAILED"
    };
    logResult(safety.title, safety, manifest);
    return {
      root: root,
      update: function () {},
      reset: function () { return false; },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      getEventHistory: function () { return []; },
      dispose: function () { if (root && root.parent) root.parent.remove(root); }
    };
  }

  function create(options) {
    options = options || {};
    var THREE = options.THREE || window.THREE;
    var scene = options.scene;
    var recoveryCity = options.recoveryCity;
    var priorityRuntime = options.priorityRuntime;
    var towerIndicatorRuntime = options.towerIndicatorRuntime;
    var plan = options.plan || window.MISSION_BOS_BOS_ACTIVATION_IMPACT_PLAN;
    var validation = options.validation;
    var documentRef = options.documentRef || document;

    if (!THREE || !scene || !recoveryCity || !recoveryCity.towersById ||
        !priorityRuntime || typeof priorityRuntime.getAllCellStates !== "function" ||
        !plan || !validation || validation.status !== "PASSED") {
      return failedRuntime(scene, "BOS activation impact plan, validation, city or priority runtime is unavailable.");
    }

    var root = new THREE.Group();
    root.name = "MISSION_BOS_BOS_ACTIVATION_IMPACT_ROOT";
    scene.add(root);

    var towerPlan = plan.towerImpact || {};
    var dashboardPlan = plan.dashboardImpact || {};
    var expected = plan.expectedCounts || {};
    var effectsByTowerId = Object.create(null);
    var previousActiveByTowerId = Object.create(null);
    var rowPulseUntilByTowerId = Object.create(null);
    var eventHistory = [];
    var disposed = false;
    var currentElapsed = 0;
    var bannerUntil = -Infinity;
    var banner = documentRef.getElementById(dashboardPlan.bannerId || "bos-activation-impact");
    var host = documentRef.querySelector(dashboardPlan.hostSelector || ".communication-card");

    function createEffect(towerId, towerGroup) {
      var beacon = towerGroup && towerGroup.userData ? towerGroup.userData.beacon : null;
      if (!towerGroup || !beacon) return null;

      var ringGeometry = new THREE.RingGeometry(0.82, 1.0, 48);
      var ringMaterial = new THREE.MeshBasicMaterial({
        color: towerPlan.worldRingColor || "#168BFF",
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthTest: towerPlan.depthTest !== false,
        depthWrite: towerPlan.depthWrite === true
      });
      var ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.name = towerId + "_BOS_ACTIVATION_RING";
      ring.rotation.x = -Math.PI / 2;
      ring.visible = false;
      ring.renderOrder = 5;
      root.add(ring);

      var glowGeometry = new THREE.SphereGeometry(0.48, 16, 10);
      var glowMaterial = new THREE.MeshBasicMaterial({
        color: towerPlan.beaconGlowColor || "#8FD3FF",
        transparent: true,
        opacity: 0,
        depthTest: towerPlan.depthTest !== false,
        depthWrite: towerPlan.depthWrite === true,
        blending: THREE.AdditiveBlending
      });
      var glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.name = towerId + "_BOS_ACTIVATION_BEACON_GLOW";
      glow.visible = false;
      glow.renderOrder = 6;
      root.add(glow);

      return {
        towerId: towerId,
        towerGroup: towerGroup,
        beacon: beacon,
        ring: ring,
        ringMaterial: ringMaterial,
        ringGeometry: ringGeometry,
        glow: glow,
        glowMaterial: glowMaterial,
        glowGeometry: glowGeometry,
        startedAt: -Infinity,
        active: false,
        triggers: 0
      };
    }

    Object.keys(recoveryCity.towersById).sort().forEach(function (towerId) {
      var effect = createEffect(towerId, recoveryCity.towersById[towerId]);
      if (effect) effectsByTowerId[towerId] = effect;
    });

    (priorityRuntime.getAllCellStates() || []).forEach(function (state) {
      if (state && state.towerId) previousActiveByTowerId[state.towerId] = state.active === true;
    });

    function setBannerVisible(visible) {
      if (!banner) return;
      banner.hidden = !visible;
      if (visible) banner.classList.add("active");
      else banner.classList.remove("active");
    }

    function findCellRow(towerId) {
      var rows = documentRef.querySelectorAll("#cell-load-rows .cell-load-row");
      for (var i = 0; i < rows.length; i += 1) {
        if (rows[i].getAttribute("data-tower-id") === towerId) return rows[i];
      }
      return null;
    }

    function trigger(towerId, elapsed, state) {
      var effect = effectsByTowerId[towerId];
      if (!effect) return false;
      effect.startedAt = finite(elapsed, currentElapsed);
      effect.active = true;
      effect.triggers += 1;
      effect.ring.visible = true;
      effect.glow.visible = true;
      effect.ringMaterial.opacity = finite(towerPlan.worldRingStartOpacity, 0.72);
      effect.glowMaterial.opacity = 0.65;
      if (towerIndicatorRuntime && typeof towerIndicatorRuntime.triggerActivationImpact === "function") {
        towerIndicatorRuntime.triggerActivationImpact(towerId, effect.startedAt);
      }
      bannerUntil = Math.max(bannerUntil, effect.startedAt + finite(dashboardPlan.bannerVisibleSeconds, 1.4));
      rowPulseUntilByTowerId[towerId] = effect.startedAt + finite(dashboardPlan.activeCellRowPulseSeconds, 1.2);
      setBannerVisible(true);
      eventHistory.push({
        towerId: towerId,
        elapsed: effect.startedAt,
        reason: state && state.lastTransitionReason || "ACTIVE_FALSE_TO_TRUE",
        load: state && finite(state.load, null),
        triggerIndex: effect.triggers
      });
      if (eventHistory.length > 120) eventHistory.shift();
      return true;
    }

    function updateEffect(effect, elapsed) {
      if (!effect.active) return;
      var age = Math.max(0, elapsed - effect.startedAt);
      var ringDuration = Math.max(0.001, finite(towerPlan.worldRingSeconds, 0.95));
      var glowDuration = Math.max(0.001, finite(towerPlan.beaconGlowSeconds, 0.55));
      var ringProgress = clamp(age / ringDuration, 0, 1);
      var glowProgress = clamp(age / glowDuration, 0, 1);
      var startRadius = finite(towerPlan.worldRingStartRadius, 0.9);
      var endRadius = finite(towerPlan.worldRingEndRadius, 5.8);
      var radius = startRadius + (endRadius - startRadius) * (1 - Math.pow(1 - ringProgress, 2));
      var ringBaseRadius = 1.0;
      var towerPosition = new THREE.Vector3();
      var beaconPosition = new THREE.Vector3();
      effect.towerGroup.getWorldPosition(towerPosition);
      effect.beacon.getWorldPosition(beaconPosition);
      effect.ring.position.set(towerPosition.x, Math.max(0.07, towerPosition.y + 0.08), towerPosition.z);
      effect.ring.scale.setScalar(radius / ringBaseRadius);
      effect.ringMaterial.opacity = finite(towerPlan.worldRingStartOpacity, 0.72) * (1 - ringProgress);
      effect.glow.position.copy(beaconPosition);
      effect.glow.scale.setScalar(0.75 + glowProgress * 1.9);
      effect.glowMaterial.opacity = 0.62 * (1 - glowProgress);
      effect.ring.visible = ringProgress < 1;
      effect.glow.visible = glowProgress < 1;
      if (ringProgress >= 1 && glowProgress >= 1) {
        effect.active = false;
        effect.ring.visible = false;
        effect.glow.visible = false;
        effect.ringMaterial.opacity = 0;
        effect.glowMaterial.opacity = 0;
      }
    }

    function updateDashboard(elapsed) {
      setBannerVisible(elapsed < bannerUntil);
      Object.keys(rowPulseUntilByTowerId).forEach(function (towerId) {
        var row = findCellRow(towerId);
        var active = elapsed < rowPulseUntilByTowerId[towerId];
        if (row) row.classList.toggle(dashboardPlan.activeCellRowPulseClass || "bos-activation-pulse", active);
        if (!active) delete rowPulseUntilByTowerId[towerId];
      });
    }

    function update(delta, elapsed) {
      if (disposed) return;
      currentElapsed = finite(elapsed, currentElapsed + Math.max(0, finite(delta, 0)));
      var states = priorityRuntime.getAllCellStates() || [];
      states.forEach(function (state) {
        if (!state || !state.towerId) return;
        var wasActive = previousActiveByTowerId[state.towerId] === true;
        var isActive = state.active === true;
        if (!wasActive && isActive) trigger(state.towerId, currentElapsed, state);
        previousActiveByTowerId[state.towerId] = isActive;
      });
      Object.keys(effectsByTowerId).forEach(function (towerId) {
        updateEffect(effectsByTowerId[towerId], currentElapsed);
      });
      updateDashboard(currentElapsed);
    }

    function reset() {
      if (disposed) return false;
      bannerUntil = -Infinity;
      rowPulseUntilByTowerId = Object.create(null);
      setBannerVisible(false);
      documentRef.querySelectorAll("#cell-load-rows .cell-load-row").forEach(function (row) {
        row.classList.remove(dashboardPlan.activeCellRowPulseClass || "bos-activation-pulse");
      });
      Object.keys(effectsByTowerId).forEach(function (towerId) {
        var effect = effectsByTowerId[towerId];
        effect.startedAt = -Infinity;
        effect.active = false;
        effect.ring.visible = false;
        effect.glow.visible = false;
        effect.ringMaterial.opacity = 0;
        effect.glowMaterial.opacity = 0;
      });
      previousActiveByTowerId = Object.create(null);
      (priorityRuntime.getAllCellStates() || []).forEach(function (state) {
        if (state && state.towerId) previousActiveByTowerId[state.towerId] = state.active === true;
      });
      return true;
    }

    function runSafety() {
      var safety = makeSafety();
      var towerIds = Object.keys(effectsByTowerId);
      if (towerIds.length !== finite(expected.towerCandidates, 5)) {
        safety.towerCountErrors += 1;
        safety.errors.push("Activation impact must track exactly five tower candidates.");
      }
      if (!host || !banner || banner.parentElement !== host) {
        safety.dashboardErrors += 1;
        safety.errors.push("Activation dashboard banner is missing from the existing communication card.");
      }
      var names = Object.create(null);
      towerIds.forEach(function (towerId) {
        var effect = effectsByTowerId[towerId];
        [effect.ring, effect.glow].forEach(function (object) {
          if (!object || names[object.name]) {
            safety.duplicateEffectErrors += 1;
            safety.errors.push("Missing or duplicate activation visual for " + towerId + ".");
          }
          if (object) names[object.name] = true;
        });
        if (!effect.ringMaterial.depthTest || effect.ringMaterial.depthWrite ||
            !effect.glowMaterial.depthTest || effect.glowMaterial.depthWrite) {
          safety.depthErrors += 1;
          safety.errors.push("Activation world effects must use building occlusion for " + towerId + ".");
        }
      });
      return finishSafety(safety);
    }

    function dispose() {
      if (disposed) return;
      reset();
      disposed = true;
      Object.keys(effectsByTowerId).forEach(function (towerId) {
        var effect = effectsByTowerId[towerId];
        if (effect.ring.parent) effect.ring.parent.remove(effect.ring);
        if (effect.glow.parent) effect.glow.parent.remove(effect.glow);
        effect.ringGeometry.dispose();
        effect.ringMaterial.dispose();
        effect.glowGeometry.dispose();
        effect.glowMaterial.dispose();
      });
      effectsByTowerId = Object.create(null);
      if (root.parent) root.parent.remove(root);
    }

    var manifest = {
      title: "MISSION BOS BOS ACTIVATION IMPACT RUNTIME MANIFEST",
      actual: {
        towerCandidates: Object.keys(effectsByTowerId).length,
        dashboardBanners: banner ? 1 : 0,
        worldRings: Object.keys(effectsByTowerId).length,
        beaconGlows: Object.keys(effectsByTowerId).length,
        newMissionStates: 0,
        newNetworkEndpoints: 0,
        newUserActions: 0,
        fixedServingTowerDefinitions: 0
      },
      expected: {
        towerCandidates: finite(expected.towerCandidates, 5),
        dashboardBanners: finite(expected.dashboardBanners, 1),
        worldRings: finite(expected.towerCandidates, 5),
        beaconGlows: finite(expected.towerCandidates, 5),
        newMissionStates: 0,
        newNetworkEndpoints: 0,
        newUserActions: 0,
        fixedServingTowerDefinitions: 0
      },
      status: "PASSED"
    };
    var safety = runSafety();
    manifest.status = safety.status;
    logResult(manifest.title, safety, manifest);

    return {
      root: root,
      update: update,
      reset: reset,
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      getEventHistory: function () { return copy(eventHistory); },
      dispose: dispose
    };
  }

  window.MissionBosBOSActivationImpactRenderer = { create: create };
})();
