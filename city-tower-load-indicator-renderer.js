/* Mission BOS - Build 013M.1
   Camera-facing load indicator attached to the real beacon of every tower.
   Blue capacity is shown only for the actively prioritized share above 85%.
*/
(function () {
  "use strict";

  function finite(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function thresholdForLoad(thresholds, load) {
    for (var i = 0; i < (thresholds || []).length; i += 1) {
      var threshold = thresholds[i];
      var minimumOk = load >= finite(threshold.min, 0);
      var maximumOk = threshold.maxExclusive != null
        ? load < finite(threshold.maxExclusive, 101)
        : load <= finite(threshold.maxInclusive, 100);
      if (minimumOk && maximumOk) return threshold;
    }
    return { state: "OVERLOADED", color: "#D63031" };
  }

  function roundedRect(context, x, y, width, height, radius) {
    var r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function emptySafety() {
    return {
      title: "MISSION BOS TOWER LOAD INDICATOR RUNTIME SAFETY",
      expectedCountErrors: 0,
      missingTowerErrors: 0,
      missingBeaconErrors: 0,
      invalidLoadErrors: 0,
      dependencyErrors: 0,
      duplicateIndicatorErrors: 0,
      priorityDisplayErrors: 0,
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

  function logResult(title, result, actual, expected) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(title);
    console[method]("Tower indicators: " + actual + " / " + expected);
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  function createFailedRuntime(message) {
    var safety = emptySafety();
    safety.dependencyErrors = 1;
    safety.errors.push(message || "Tower load indicator initialization failed.");
    finishSafety(safety);
    var manifest = { title: "MISSION BOS TOWER LOAD INDICATOR RUNTIME MANIFEST", actual: { indicators: 0 }, expected: { indicators: 5 }, status: "FAILED" };
    logResult(manifest.title, manifest, 0, 5);
    return {
      update: function () {},
      reset: function () {},
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var THREE = options.THREE || window.THREE;
    var recoveryCity = options.recoveryCity;
    var cellLoadRuntime = options.cellLoadRuntime;
    var priorityRuntime = options.priorityRuntime;
    var plan = options.plan || window.MISSION_BOS_NETWORK_REALISM_PLAN;
    var networkPolishPlan = options.networkPolishPlan || window.MISSION_BOS_MISSION_001_NETWORK_POLISH_PLAN;
    var activationImpactPlan = options.activationImpactPlan || window.MISSION_BOS_BOS_ACTIVATION_IMPACT_PLAN || null;
    if (!THREE || !recoveryCity || !recoveryCity.towersById || !cellLoadRuntime || !priorityRuntime ||
        !plan || !plan.loadIndicator || !networkPolishPlan) {
      return createFailedRuntime("Tower renderer, cell-load runtime or realism plan is missing.");
    }

    var indicatorPlan = plan.loadIndicator;
    var indicatorPolish = networkPolishPlan.towerIndicator || {};
    var prioritySegmentStart = finite(indicatorPolish.prioritySegmentStartPercent, 85);
    var activationTowerPlan = activationImpactPlan && activationImpactPlan.towerImpact || {};
    var activationFlashSeconds = finite(activationTowerPlan.indicatorFlashSeconds, 0.18);
    var activationBounceSeconds = finite(activationTowerPlan.indicatorBounceSeconds, 0.65);
    var activationMaximumScale = finite(activationTowerPlan.indicatorMaximumScale, 1.15);
    var expectedCount = finite((plan.expectedCounts || {}).towerIndicators, 5);
    var entries = [];
    var entriesByTowerId = Object.create(null);
    var disposed = false;
    var safety = emptySafety();

    function draw(entry, elapsed, force) {
      var cell = cellLoadRuntime.getCell(entry.towerId);
      var state = priorityRuntime && typeof priorityRuntime.getCellState === "function"
        ? priorityRuntime.getCellState(entry.towerId)
        : null;
      var load = cell ? Math.max(0, Math.min(100, finite(cell.currentLoad, 0))) : 0;
      var roundedLoad = Math.round(load);
      var threshold = thresholdForLoad(indicatorPlan.thresholds || [], load);
      var lane = indicatorPlan.priorityLane || {};
      var active = !!state && state.active === true;
      var laneVisible = active && load >= prioritySegmentStart;
      var pulse = laneVisible && lane.activePulse !== false
        ? (0.86 + (Math.sin(finite(elapsed, 0) * 4.2) + 1) * 0.07)
        : 1;
      var activationAge = finite(elapsed, 0) - finite(entry.activationStartedAt, -Infinity);
      var activationActive = activationAge >= 0 && activationAge <= Math.max(activationFlashSeconds, activationBounceSeconds);
      var bounceProgress = activationAge >= 0 && activationAge <= activationBounceSeconds
        ? Math.sin(Math.PI * Math.max(0, Math.min(1, activationAge / Math.max(0.001, activationBounceSeconds))))
        : 0;
      var bounceScale = 1 + Math.max(0, activationMaximumScale - 1) * bounceProgress;
      entry.sprite.scale.set(entry.baseScale.x * bounceScale, entry.baseScale.y * bounceScale, 1);
      var signature = [roundedLoad, threshold.state, laneVisible ? 1 : 0, active ? 1 : 0,
        Math.round(pulse * 10), activationActive ? Math.round(activationAge * 60) : -1].join("|");
      if (!force && signature === entry.signature) return;
      entry.signature = signature;

      var context = entry.context;
      var canvas = entry.canvas;
      var width = canvas.width;
      var height = canvas.height;
      context.clearRect(0, 0, width, height);

      context.save();
      context.shadowColor = "rgba(0,0,0,0.42)";
      context.shadowBlur = 14;
      context.fillStyle = "rgba(13,20,31,0.92)";
      roundedRect(context, 5, 5, width - 10, height - 10, 18);
      context.fill();
      context.restore();

      var barX = 18;
      var barY = 20;
      var barWidth = width - 36;
      var barHeight = height - 40;
      context.fillStyle = "rgba(255,255,255,0.10)";
      roundedRect(context, barX, barY, barWidth, barHeight, 13);
      context.fill();

      var fillWidth = Math.max(12, barWidth * load / 100);
      context.fillStyle = threshold.color;
      roundedRect(context, barX, barY, fillWidth, barHeight, 13);
      context.fill();

      if (laneVisible) {
        var segmentStartX = barX + barWidth * prioritySegmentStart / 100;
        var segmentEndX = barX + barWidth * load / 100;
        var segmentWidth = Math.max(0, segmentEndX - segmentStartX);
        if (segmentWidth > 0) {
          context.save();
          context.fillStyle = indicatorPolish.prioritySegmentColor || lane.color || "#0066CC";
          context.fillRect(segmentStartX, barY, segmentWidth, barHeight);
          context.restore();
        }
        var laneWidth = barWidth * finite(lane.relativeWidth, 0.22);
        var laneX = barX + (barWidth - laneWidth) / 2;
        var opacity = finite(lane.activeOpacityWithBosEndpoint, 1) * pulse;
        context.save();
        context.globalAlpha = Math.max(0, Math.min(1, opacity));
        context.fillStyle = lane.color || "#0066CC";
        roundedRect(context, laneX, barY + 2, laneWidth, barHeight - 4, 9);
        context.fill();
        context.shadowColor = lane.highlightColor || "#4DB3FF";
        context.shadowBlur = 18;
        context.strokeStyle = lane.highlightColor || "#4DB3FF";
        context.lineWidth = 4;
        roundedRect(context, laneX + 1, barY + 3, laneWidth - 2, barHeight - 6, 8);
        context.stroke();
        context.restore();
      }

      if (activationAge >= 0 && activationAge <= activationFlashSeconds) {
        var flashProgress = 1 - Math.max(0, Math.min(1, activationAge / Math.max(0.001, activationFlashSeconds)));
        context.save();
        context.globalAlpha = 0.34 * flashProgress;
        context.fillStyle = activationTowerPlan.indicatorFlashColor || "#EAF7FF";
        roundedRect(context, 5, 5, width - 10, height - 10, 18);
        context.fill();
        context.restore();
      }
      if (activationAge >= 0 && activationAge <= activationBounceSeconds) {
        context.save();
        context.globalAlpha = 0.28 + 0.66 * bounceProgress;
        context.strokeStyle = activationTowerPlan.indicatorOutlineColor || "#4DB3FF";
        context.lineWidth = 7;
        context.shadowColor = activationTowerPlan.indicatorOutlineColor || "#4DB3FF";
        context.shadowBlur = 18;
        roundedRect(context, 7.5, 7.5, width - 15, height - 15, 17);
        context.stroke();
        context.restore();
      }

      entry.visualState = {
        load: load,
        priorityRuntimeActive: active,
        blueVisible: laneVisible,
        prioritySegmentStartPercent: prioritySegmentStart,
        prioritySegmentEndPercent: laneVisible ? load : null,
        activationImpactActive: activationActive,
        activationScale: bounceScale
      };

      context.font = "700 48px Arial, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.lineWidth = 8;
      context.strokeStyle = "rgba(0,0,0,0.72)";
      context.strokeText(roundedLoad + " %", width / 2, height / 2 + 1);
      context.fillStyle = "#FFFFFF";
      context.fillText(roundedLoad + " %", width / 2, height / 2 + 1);

      entry.texture.needsUpdate = true;
      entry.sprite.visible = true;
    }

    Object.keys(recoveryCity.towersById).sort().forEach(function (towerId) {
      var towerGroup = recoveryCity.towersById[towerId];
      var beacon = towerGroup && towerGroup.userData ? towerGroup.userData.beacon : null;
      if (!towerGroup || !beacon) return;
      var canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 112;
      var context = canvas.getContext("2d");
      var texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      var material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });
      var sprite = new THREE.Sprite(material);
      sprite.name = towerId + "_LOAD_INDICATOR";
      sprite.position.copy(beacon.position);
      sprite.position.y += finite(indicatorPlan.verticalOffsetAboveBeacon, 2.2);
      sprite.scale.set(finite(indicatorPlan.widthWorldUnits, 6.4), finite(indicatorPlan.heightWorldUnits, 1.05), 1);
      sprite.renderOrder = 80;
      towerGroup.add(sprite);
      var entry = { towerId: towerId, towerGroup: towerGroup, beacon: beacon, canvas: canvas, context: context, texture: texture, material: material, sprite: sprite,
        baseScale: sprite.scale.clone(), activationStartedAt: -Infinity, signature: "", visualState: null };
      entries.push(entry);
      entriesByTowerId[towerId] = entry;
      draw(entry, 0, true);
    });

    var manifest = {
      title: "MISSION BOS TOWER LOAD INDICATOR RUNTIME MANIFEST",
      actual: { indicators: entries.length, beaconAnchors: entries.filter(function (entry) { return !!entry.beacon; }).length },
      expected: { indicators: expectedCount, beaconAnchors: expectedCount },
      status: entries.length === expectedCount ? "PASSED" : "FAILED"
    };

    function runSafety(initial) {
      var next = emptySafety();
      if (entries.length !== expectedCount) {
        next.expectedCountErrors += 1;
        next.errors.push("Exactly five tower indicators are required.");
      }
      var unique = Object.create(null);
      entries.forEach(function (entry) {
        if (!entry.towerGroup) {
          next.missingTowerErrors += 1;
          next.errors.push("Indicator has no tower group: " + entry.towerId);
        }
        if (!entry.beacon) {
          next.missingBeaconErrors += 1;
          next.errors.push("Indicator has no beacon anchor: " + entry.towerId);
        }
        if (unique[entry.towerId]) {
          next.duplicateIndicatorErrors += 1;
          next.errors.push("Duplicate indicator: " + entry.towerId);
        }
        unique[entry.towerId] = true;
        var cell = cellLoadRuntime.getCell(entry.towerId);
        if (!cell || !isFinite(Number(cell.currentLoad))) {
          next.invalidLoadErrors += 1;
          next.errors.push("Indicator has no valid cell load: " + entry.towerId);
        }
        var priority = priorityRuntime.getCellState(entry.towerId);
        var blueExpected = !!priority && priority.active === true && Number(cell && cell.currentLoad) >= prioritySegmentStart;
        if (!entry.visualState || entry.visualState.blueVisible !== blueExpected ||
            (entry.visualState.blueVisible && entry.visualState.prioritySegmentStartPercent !== 85)) {
          next.priorityDisplayErrors += 1;
          next.errors.push("Tower priority segment does not match active cell priority: " + entry.towerId);
        }
      });
      safety = finishSafety(next);
      if (initial || safety.failed) logResult(safety.title, safety, entries.length, expectedCount);
    }

    function triggerActivationImpact(towerId, elapsed) {
      if (disposed) return false;
      var entry = entriesByTowerId[towerId];
      if (!entry) return false;
      entry.activationStartedAt = finite(elapsed, 0);
      entry.signature = "";
      draw(entry, elapsed, true);
      return true;
    }

    function update(delta, elapsed) {
      if (disposed) return;
      entries.forEach(function (entry) { draw(entry, elapsed, false); });
    }

    function reset() {
      if (disposed) return false;
      entries.forEach(function (entry) {
        entry.activationStartedAt = -Infinity;
        entry.sprite.scale.copy(entry.baseScale);
        entry.signature = "";
        draw(entry, 0, true);
      });
      runSafety(false);
      return safety.status === "PASSED";
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      entries.forEach(function (entry) {
        if (entry.sprite && entry.sprite.parent) entry.sprite.parent.remove(entry.sprite);
        if (entry.material) entry.material.dispose();
        if (entry.texture) entry.texture.dispose();
      });
      entries.length = 0;
      entriesByTowerId = Object.create(null);
    }

    logResult(manifest.title, manifest, entries.length, expectedCount);
    runSafety(true);

    return {
      update: update,
      triggerActivationImpact: triggerActivationImpact,
      reset: reset,
      getManifest: function () { return copy(manifest); },
      getRuntimeSnapshot: function () {
        return entries.map(function (entry) {
          return { towerId: entry.towerId, visualState: copy(entry.visualState),
            activationStartedAt: entry.activationStartedAt,
            scale: { x: entry.sprite.scale.x, y: entry.sprite.scale.y, z: entry.sprite.scale.z } };
        });
      },
      getSafetyStatus: function () { return copy(safety); },
      dispose: dispose
    };
  }

  window.MissionBosTowerLoadIndicatorRenderer = { create: create };
})();
