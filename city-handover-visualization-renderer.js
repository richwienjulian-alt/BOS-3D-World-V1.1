/* Mission BOS - Build 009N.5
   Candidate and confirmed handover visualization runtime.
   Visualization only. No modules. No fetch. No runtime randomization.
*/
(function () {
  "use strict";

  var SAFETY_INTERVAL_SECONDS = 0.25;
  var EPSILON = 1e-9;
  var KNOWN_STATES = [
    "READY", "CALL_RECEIVED", "CLEARING_CORRIDOR", "DISPATCHING", "ENROUTE",
    "ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED",
    "RETURNING", "FAILED"
  ];

  function finite(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      var item = items[i];
      if (item && (item.id === id || item.referenceId === id || item.towerId === id)) return item;
    }
    return null;
  }

  function copyObject(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function colorValue(value, fallback) {
    return new THREE.Color(value || fallback);
  }

  function isFiniteVector(value) {
    return !!value && isFinite(Number(value.x)) && isFinite(Number(value.y)) && isFinite(Number(value.z));
  }

  function setLinePoints(line, start, end) {
    line.geometry.setFromPoints([start, end]);
    if (line.geometry.attributes && line.geometry.attributes.position) {
      line.geometry.attributes.position.needsUpdate = true;
    }
    if (typeof line.computeLineDistances === "function") line.computeLineDistances();
    if (typeof line.geometry.computeBoundingSphere === "function") line.geometry.computeBoundingSphere();
  }

  function fixedServingTowerDefinitions(communicationPlan) {
    var count = 0;
    if (communicationPlan && communicationPlan.communicationStory && communicationPlan.communicationStory.servingTowerId) count += 1;
    ((communicationPlan && communicationPlan.endpoints) || []).forEach(function (endpoint) {
      if (endpoint && endpoint.kind === "tower") count += 1;
    });
    (((communicationPlan && communicationPlan.bosLinks) || []).concat((communicationPlan && communicationPlan.civilianLinks) || [])).forEach(function (link) {
      if (!link) return;
      if (link.fixedTowerId || link.servingTowerId) count += 1;
      if (/COMM_TOWER_/i.test(String(link.from || "")) || /COMM_TOWER_/i.test(String(link.to || ""))) count += 1;
    });
    return count;
  }

  function createManifest(plan, rendered) {
    var expected = plan.renderManifest || {};
    var passed =
      rendered.handoverEffectSlots === Number(expected.handoverEffectSlots || 0) &&
      rendered.ambientCellFields === Number(expected.ambientCellFields || 0) &&
      rendered.ambientParticleMeshes === Number(expected.ambientParticleMeshes || 0) &&
      rendered.newPhysicalActors === Number(expected.newPhysicalActors || 0) &&
      rendered.newIndividualNetworkEndpoints === Number(expected.newIndividualNetworkEndpoints || 0) &&
      rendered.newStandalonePanels === Number(expected.newStandalonePanels || 0);
    return {
      title: "MISSION BOS HANDOVER VISUALIZATION RENDER MANIFEST",
      actual: copyObject(rendered),
      expected: {
        handoverEffectSlots: Number(expected.handoverEffectSlots || 0),
        ambientCellFields: Number(expected.ambientCellFields || 0),
        ambientParticleMeshes: Number(expected.ambientParticleMeshes || 0),
        newPhysicalActors: Number(expected.newPhysicalActors || 0),
        newIndividualNetworkEndpoints: Number(expected.newIndividualNetworkEndpoints || 0),
        newStandalonePanels: Number(expected.newStandalonePanels || 0)
      },
      status: passed ? "PASSED" : "FAILED"
    };
  }

  function logManifest(manifest) {
    var method = manifest.status === "PASSED" ? "log" : "error";
    console.group(manifest.title);
    console[method]("Handover effect slots: " + manifest.actual.handoverEffectSlots + " / " + manifest.expected.handoverEffectSlots);
    console[method]("Ambient cell fields: " + manifest.actual.ambientCellFields + " / " + manifest.expected.ambientCellFields);
    console[method]("Ambient particle meshes: " + manifest.actual.ambientParticleMeshes + " / " + manifest.expected.ambientParticleMeshes);
    console[method]("New physical actors: " + manifest.actual.newPhysicalActors + " / " + manifest.expected.newPhysicalActors);
    console[method]("New individual endpoints: " + manifest.actual.newIndividualNetworkEndpoints + " / " + manifest.expected.newIndividualNetworkEndpoints);
    console[method]("New standalone panels: " + manifest.actual.newStandalonePanels + " / " + manifest.expected.newStandalonePanels);
    console[method]("RENDER MANIFEST: " + manifest.status);
    console.groupEnd();
  }

  function createSafety() {
    return {
      title: "MISSION BOS HANDOVER VISUALIZATION RUNTIME SAFETY",
      validationErrors: 0,
      associationRuntimeErrors: 0,
      cellLoadRuntimeErrors: 0,
      communicationRuntimeErrors: 0,
      invalidRuntimeStateErrors: 0,
      sourceMutationErrors: 0,
      vehicleMutationErrors: 0,
      duplicateEventErrors: 0,
      particleCountErrors: 0,
      activeEffectErrors: 0,
      candidateEffectErrors: 0,
      candidateStateLeakErrors: 0,
      fixedServingTowerErrors: 0,
      automaticBOSActivationErrors: 0,
      automaticCameraMovementErrors: 0,
      status: "PASSED",
      failed: false,
      errors: []
    };
  }

  function logSafety(safety) {
    var method = safety.status === "PASSED" ? "log" : "error";
    console.group(safety.title);
    console[method]("Validation errors: " + safety.validationErrors);
    console[method]("Association runtime errors: " + safety.associationRuntimeErrors);
    console[method]("Cell-load runtime errors: " + safety.cellLoadRuntimeErrors);
    console[method]("Communication runtime errors: " + safety.communicationRuntimeErrors);
    console[method]("Invalid runtime state errors: " + safety.invalidRuntimeStateErrors);
    console[method]("Source mutation errors: " + safety.sourceMutationErrors);
    console[method]("Vehicle mutation errors: " + safety.vehicleMutationErrors);
    console[method]("Duplicate handover event errors: " + safety.duplicateEventErrors);
    console[method]("Particle count errors: " + safety.particleCountErrors);
    console[method]("Active confirmed-effect errors: " + safety.activeEffectErrors);
    console[method]("Candidate-effect errors: " + safety.candidateEffectErrors);
    console[method]("Candidate-state leaks after reset: " + safety.candidateStateLeakErrors);
    console[method]("Fixed serving-tower errors: " + safety.fixedServingTowerErrors);
    console[method]("Automatic BOS activation errors: " + safety.automaticBOSActivationErrors);
    console[method]("Automatic camera movement errors: " + safety.automaticCameraMovementErrors);
    console[method]("STATUS: " + safety.status);
    if (safety.errors.length) console.error(safety.errors);
    console.groupEnd();
  }

  function createFailedRuntime(message, validation, plan) {
    var rendered = {
      handoverEffectSlots: 0,
      ambientCellFields: 0,
      ambientParticleMeshes: 0,
      newPhysicalActors: 0,
      newIndividualNetworkEndpoints: 0,
      newStandalonePanels: 0
    };
    var manifest = createManifest(plan || { renderManifest: {} }, rendered);
    manifest.status = "FAILED";
    logManifest(manifest);
    var safety = createSafety();
    safety.validationErrors = 1;
    safety.status = "FAILED";
    safety.failed = true;
    safety.errors.push(message || "Handover visualization initialization failed.");
    logSafety(safety);
    return {
      root: null,
      groups: {},
      validation: validation || null,
      update: function () {},
      reset: function () { return false; },
      getDashboardSnapshot: function () {
        return { emphasizeLastHandover: false, symbolicHint: plan && plan.dashboard ? plan.dashboard.symbolicHint : "" };
      },
      getManifest: function () { return manifest; },
      getSafetyStatus: function () { return copyObject(safety); },
      dispose: function () {}
    };
  }

  function createSourceSignature(layout, incidentPlan, missionPlan, scenePlan, associationPlan, cellLoadPlan, communicationPlan, plan) {
    return JSON.stringify({
      towers: (layout.mobileTowers || []).map(function (tower) { return { id: tower.id, worldRect: tower.worldRect, height: tower.height }; }),
      incidentPlan: incidentPlan,
      missionPlan: missionPlan,
      actors: (scenePlan.actors || []).map(function (actor) { return { id: actor.id, role: actor.role, phone: actor.phone, position: actor.position }; }),
      associationPlan: associationPlan,
      cellLoadPlan: cellLoadPlan,
      communicationPlan: communicationPlan,
      visualizationPlan: plan
    });
  }

  function captureResponsePositions(responseRuntime, trackedEndpointIds, associationPlan) {
    var result = {};
    (trackedEndpointIds || []).forEach(function (endpointId) {
      var definition = findById(associationPlan.mobileEndpoints || [], endpointId);
      if (!definition) return;
      var state = responseRuntime.vehiclesById[definition.referenceId];
      if (!state || !state.mesh || !state.mesh.position) return;
      result[definition.referenceId] = {
        x: Number(state.mesh.position.x), y: Number(state.mesh.position.y), z: Number(state.mesh.position.z)
      };
    });
    return result;
  }

  function positionsEqual(a, b) {
    var keysA = Object.keys(a || {}).sort();
    var keysB = Object.keys(b || {}).sort();
    if (keysA.length !== keysB.length) return false;
    for (var i = 0; i < keysA.length; i += 1) {
      if (keysA[i] !== keysB[i]) return false;
      var pa = a[keysA[i]];
      var pb = b[keysA[i]];
      if (!pb || Math.abs(pa.x - pb.x) > EPSILON || Math.abs(pa.y - pb.y) > EPSILON || Math.abs(pa.z - pb.z) > EPSILON) return false;
    }
    return true;
  }

  function createDynamicLine(color, opacity, dashed) {
    var geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]);
    var material;
    if (dashed && typeof THREE.LineDashedMaterial === "function") {
      material = new THREE.LineDashedMaterial({
        color: color, transparent: true, opacity: opacity, depthWrite: false, dashSize: 0.75, gapSize: 0.55
      });
    } else {
      material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity, depthWrite: false });
    }
    var line = new THREE.Line(geometry, material);
    line.visible = false;
    line.frustumCulled = false;
    return line;
  }

  function createEffectSlot(index, parent, handoverPlan) {
    var group = new THREE.Group();
    group.name = "HandoverEffectSlot_" + (index + 1);
    parent.add(group);

    var oldGlow = createDynamicLine(handoverPlan.oldServingLink.color, 0, false);
    var oldCore = createDynamicLine(handoverPlan.oldServingLink.color, 0, false);
    var newGlow = createDynamicLine(handoverPlan.newServingLink.color, 0, false);
    var newCore = createDynamicLine(handoverPlan.newServingLink.color, 0, false);
    group.add(oldGlow); group.add(oldCore); group.add(newGlow); group.add(newCore);

    var ringGeometry = new THREE.RingGeometry(0.58, 0.82, 32);
    var oldPulse = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({
      color: handoverPlan.towerTransitionPulse.oldTowerColor, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide
    }));
    var newPulse = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({
      color: handoverPlan.towerTransitionPulse.newTowerColor, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide
    }));
    oldPulse.rotation.x = -Math.PI / 2;
    newPulse.rotation.x = -Math.PI / 2;
    oldPulse.visible = false;
    newPulse.visible = false;
    group.add(oldPulse); group.add(newPulse);

    return {
      index: index,
      group: group,
      oldGlow: oldGlow,
      oldCore: oldCore,
      newGlow: newGlow,
      newCore: newCore,
      oldPulse: oldPulse,
      newPulse: newPulse,
      event: null,
      startElapsed: 0,
      active: false
    };
  }

  function clearEffectSlot(slot) {
    slot.active = false;
    slot.event = null;
    [slot.oldGlow, slot.oldCore, slot.newGlow, slot.newCore].forEach(function (line) {
      line.visible = false;
      line.material.opacity = 0;
    });
    slot.oldPulse.visible = false;
    slot.newPulse.visible = false;
    slot.oldPulse.material.opacity = 0;
    slot.newPulse.material.opacity = 0;
  }

  function createCandidateSlot(endpointId, parent, decisionPlan) {
    var group = new THREE.Group();
    group.name = "HandoverCandidate_" + endpointId;
    var line = createDynamicLine((decisionPlan.candidateLine || {}).color, 0, true);
    line.name = group.name + "_PREPARATORY_PATH";
    group.add(line);
    parent.add(group);
    return { endpointId: endpointId, group: group, line: line, active: false, candidateTowerId: null };
  }

  function clearCandidateSlot(slot) {
    slot.active = false;
    slot.candidateTowerId = null;
    slot.line.visible = false;
    slot.line.material.opacity = 0;
  }

  function create(options) {
    options = options || {};
    var scene = options.scene;
    var layout = options.layout;
    var responseRuntime = options.responseRuntime;
    var associationRuntime = options.associationRuntime;
    var cellLoadRuntime = options.cellLoadRuntime;
    var communicationRuntime = options.communicationRuntime;
    var incidentPlan = options.incidentPlan || window.MISSION_BOS_INCIDENT_RESPONSE_PLAN;
    var missionPlan = options.missionPlan;
    var scenePlan = options.scenePlan;
    var associationPlan = options.associationPlan || window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN;
    var cellLoadPlan = options.cellLoadPlan || window.MISSION_BOS_CELL_LOAD_PLAN;
    var communicationPlan = options.communicationPlan || window.MISSION_BOS_TELEKOM_COMMUNICATION_PLAN;
    var plan = options.plan;
    var validator = options.validator;

    if (!validator || typeof validator.validate !== "function" || typeof validator.logResult !== "function") {
      return createFailedRuntime("Handover visualization validator is unavailable.", null, plan);
    }
    var validation = validator.validate(layout, incidentPlan, missionPlan, scenePlan, associationPlan, cellLoadPlan, communicationPlan, plan);
    validator.logResult(validation);
    if (!validation || validation.status !== "PASSED") {
      return createFailedRuntime("Handover visualization validation returned FAILED.", validation, plan);
    }
    if (!scene || !layout || !responseRuntime || !responseRuntime.vehiclesById ||
        !associationRuntime || typeof associationRuntime.getHandoverHistory !== "function" ||
        typeof associationRuntime.getCandidateState !== "function" || typeof associationRuntime.getSafetyStatus !== "function" ||
        !cellLoadRuntime || typeof cellLoadRuntime.getCell !== "function" || typeof cellLoadRuntime.getSafetyStatus !== "function" ||
        !communicationRuntime || typeof communicationRuntime.getSafetyStatus !== "function" ||
        !missionPlan || !scenePlan || !associationPlan || !cellLoadPlan || !communicationPlan || !plan) {
      return createFailedRuntime("One or more handover visualization dependencies are unavailable.", validation, plan);
    }

    try {
      var root = new THREE.Group();
      root.name = "HandoverVisualizationRoot";
      var groups = {
        handoverEffects: new THREE.Group(),
        candidateEffects: new THREE.Group(),
        ambientLoadFields: new THREE.Group()
      };
      groups.handoverEffects.name = "HandoverEffects";
      groups.candidateEffects.name = "HandoverCandidates";
      groups.ambientLoadFields.name = "AmbientLoadFields";
      root.add(groups.handoverEffects);
      root.add(groups.candidateEffects);
      root.add(groups.ambientLoadFields);
      scene.add(root);

      var handoverPlan = plan.handoverVisualization || {};
      var decisionPlan = plan.decisionVisualization || {};
      var ambientPlan = plan.ambientCivilianLoadVisualization || {};
      var visibilityPolicy = plan.visibilityPolicy || {};
      var trackedEndpointIds = (handoverPlan.trackedEndpointIds || []).slice();
      var towerRecords = Object.create(null);
      var ambientFields = [];
      var particleGeometry = new THREE.SphereGeometry(0.085, 8, 6);
      var totalParticleMeshes = 0;

      (ambientPlan.towerIds || []).forEach(function (towerId, towerIndex) {
        var source = findById(layout.mobileTowers || [], towerId);
        if (!source || !source.worldRect) return;
        var fieldGroup = new THREE.Group();
        fieldGroup.name = "AmbientLoadField_" + towerId;
        fieldGroup.position.set(Number(source.worldRect.x), 0, Number(source.worldRect.z));
        groups.ambientLoadFields.add(fieldGroup);
        var particles = [];
        for (var particleIndex = 0; particleIndex < Number(ambientPlan.fixedParticlesPerTower || 0); particleIndex += 1) {
          var material = new THREE.MeshBasicMaterial({
            color: ambientPlan.normalColor, transparent: true, opacity: 0.42, depthWrite: false
          });
          var particle = new THREE.Mesh(particleGeometry, material);
          particle.name = towerId + "_AMBIENT_PARTICLE_" + String(particleIndex + 1).padStart(2, "0");
          particle.visible = false;
          fieldGroup.add(particle);
          particles.push({ mesh: particle, material: material, index: particleIndex });
          totalParticleMeshes += 1;
        }
        var record = {
          towerId: towerId,
          towerIndex: towerIndex,
          source: source,
          group: fieldGroup,
          particles: particles,
          topPosition: new THREE.Vector3(Number(source.worldRect.x), finite(source.height, 15) + 0.35, Number(source.worldRect.z)),
          groundPosition: new THREE.Vector3(Number(source.worldRect.x), 0.12, Number(source.worldRect.z))
        };
        towerRecords[towerId] = record;
        ambientFields.push(record);
      });

      var effectSlots = [];
      for (var slotIndex = 0; slotIndex < Number(handoverPlan.maxConcurrentEffects || 0); slotIndex += 1) {
        effectSlots.push(createEffectSlot(slotIndex, groups.handoverEffects, handoverPlan));
      }
      var candidateSlots = trackedEndpointIds.map(function (endpointId) {
        return createCandidateSlot(endpointId, groups.candidateEffects, decisionPlan);
      });

      var rendered = {
        handoverEffectSlots: effectSlots.length,
        ambientCellFields: ambientFields.length,
        ambientParticleMeshes: totalParticleMeshes,
        newPhysicalActors: 0,
        newIndividualNetworkEndpoints: 0,
        newStandalonePanels: 0
      };
      var manifest = createManifest(plan, rendered);
      logManifest(manifest);

      var safety = createSafety();
      var safetyTimer = 0;
      var disposed = false;
      var failed = manifest.status !== "PASSED";
      var currentState = "READY";
      var currentElapsed = 0;
      var historyCursor = 0;
      var processedEventKeys = Object.create(null);
      var duplicateEvents = 0;
      var lastEvent = null;
      var highlightUntil = -Infinity;
      var automaticBOSActivations = 0;
      var automaticCameraMovements = 0;
      var sourceSignature = createSourceSignature(layout, incidentPlan, missionPlan, scenePlan, associationPlan, cellLoadPlan, communicationPlan, plan);

      function resolveVehiclePosition(referenceId) {
        var state = responseRuntime.vehiclesById[referenceId];
        if (!state || !state.mesh || !state.mesh.position) return null;
        return new THREE.Vector3(Number(state.mesh.position.x), Number(state.mesh.position.y) + 1.42, Number(state.mesh.position.z));
      }

      function endpointReferenceId(endpointId) {
        var definition = findById(associationPlan.mobileEndpoints || [], endpointId);
        return definition ? definition.referenceId : null;
      }

      function eventKey(event) {
        return [event.endpointId, event.referenceId, event.fromTowerId, event.toTowerId, Number(event.time).toFixed(6)].join("|");
      }

      function acquireEffectSlot() {
        for (var i = 0; i < effectSlots.length; i += 1) if (!effectSlots[i].active) return effectSlots[i];
        var oldest = effectSlots[0];
        for (var j = 1; j < effectSlots.length; j += 1) {
          if (effectSlots[j].startElapsed < oldest.startElapsed) oldest = effectSlots[j];
        }
        clearEffectSlot(oldest);
        return oldest;
      }

      function activateEffect(event, elapsed) {
        var oldTower = towerRecords[event.fromTowerId];
        var newTower = towerRecords[event.toTowerId];
        var vehiclePosition = resolveVehiclePosition(event.referenceId);
        if (!oldTower || !newTower || !vehiclePosition) return false;
        var slot = acquireEffectSlot();
        slot.event = copyObject(event);
        slot.startElapsed = elapsed;
        slot.active = true;
        slot.oldPulse.position.copy(oldTower.groundPosition);
        slot.newPulse.position.copy(newTower.groundPosition);
        slot.oldPulse.scale.setScalar(1);
        slot.newPulse.scale.setScalar(1);
        slot.oldPulse.visible = true;
        slot.newPulse.visible = true;
        [slot.oldGlow, slot.oldCore, slot.newGlow, slot.newCore].forEach(function (line) { line.visible = true; });
        setLinePoints(slot.oldGlow, oldTower.topPosition, vehiclePosition);
        setLinePoints(slot.oldCore, oldTower.topPosition, vehiclePosition);
        setLinePoints(slot.newGlow, newTower.topPosition, vehiclePosition);
        setLinePoints(slot.newCore, newTower.topPosition, vehiclePosition);
        return true;
      }

      function processHandoverHistory(elapsed) {
        var history = associationRuntime.getHandoverHistory() || [];
        if (history.length < historyCursor) {
          historyCursor = 0;
          processedEventKeys = Object.create(null);
        }
        for (var i = historyCursor; i < history.length; i += 1) {
          var event = history[i];
          if (!event || trackedEndpointIds.indexOf(event.endpointId) < 0 || !event.fromTowerId || !event.toTowerId) continue;
          var key = eventKey(event);
          if (processedEventKeys[key]) {
            duplicateEvents += 1;
            continue;
          }
          processedEventKeys[key] = true;
          lastEvent = copyObject(event);
          highlightUntil = elapsed + finite(handoverPlan.dashboardEmphasisSeconds, 1.8);
          var statePolicy = visibilityPolicy[currentState] || {};
          if (statePolicy.handoverEffects === true) activateEffect(event, elapsed);
        }
        historyCursor = history.length;
      }

      function updateCandidateEffects(elapsed) {
        var statePolicy = visibilityPolicy[currentState] || {};
        var allowed = statePolicy.handoverEffects === true;
        var linePlan = decisionPlan.candidateLine || {};
        var threshold = finite(linePlan.visibleAfterProgress, 0.25);
        var maxOpacity = Math.min(0.32, finite(linePlan.maximumOpacity, 0.32));

        candidateSlots.forEach(function (slot) {
          var candidate = associationRuntime.getCandidateState(slot.endpointId);
          if (!allowed || !candidate || candidate.status !== "HANDOVER_CANDIDATE" ||
              !candidate.candidateTowerId || candidate.candidateProgress + EPSILON < threshold) {
            clearCandidateSlot(slot);
            return;
          }
          var tower = towerRecords[candidate.candidateTowerId];
          var referenceId = endpointReferenceId(slot.endpointId);
          var vehiclePosition = resolveVehiclePosition(referenceId);
          if (!tower || !vehiclePosition) {
            clearCandidateSlot(slot);
            return;
          }
          var normalized = clamp((candidate.candidateProgress - threshold) / Math.max(EPSILON, 1 - threshold), 0, 1);
          var pulse = 0.88 + 0.12 * Math.sin(elapsed * 9 + slot.endpointId.length);
          var opacity = Math.min(maxOpacity, maxOpacity * normalized * pulse);
          slot.active = true;
          slot.candidateTowerId = candidate.candidateTowerId;
          slot.line.visible = true;
          slot.line.material.opacity = opacity;
          setLinePoints(slot.line, tower.topPosition, vehiclePosition);
        });
      }

      function updateEffects(elapsed) {
        var statePolicy = visibilityPolicy[currentState] || {};
        var effectsVisible = statePolicy.handoverEffects === true;
        var crossFadeSeconds = finite((decisionPlan.confirmedTransition || {}).oldLinkFadeSeconds, finite(handoverPlan.crossFadeSeconds, 0.9));
        var newBuildSeconds = finite((decisionPlan.confirmedTransition || {}).newLinkBuildSeconds, crossFadeSeconds);
        var pulseSeconds = finite(handoverPlan.towerPulseSeconds, 1.25);
        effectSlots.forEach(function (slot) {
          if (!slot.active || !slot.event) return;
          var age = Math.max(0, elapsed - slot.startElapsed);
          var vehiclePosition = resolveVehiclePosition(slot.event.referenceId);
          var oldTower = towerRecords[slot.event.fromTowerId];
          var newTower = towerRecords[slot.event.toTowerId];
          if (!vehiclePosition || !oldTower || !newTower) {
            clearEffectSlot(slot);
            return;
          }

          if (age <= crossFadeSeconds && effectsVisible) {
            var oldProgress = clamp(age / crossFadeSeconds, 0, 1);
            var oldOpacity = finite(handoverPlan.oldServingLink.startOpacity, 0.68) * (1 - oldProgress);
            setLinePoints(slot.oldGlow, oldTower.topPosition, vehiclePosition);
            setLinePoints(slot.oldCore, oldTower.topPosition, vehiclePosition);
            slot.oldGlow.visible = true;
            slot.oldCore.visible = true;
            slot.oldGlow.material.opacity = oldOpacity * 0.38;
            slot.oldCore.material.opacity = oldOpacity;
          } else {
            slot.oldGlow.visible = false;
            slot.oldCore.visible = false;
          }

          if (age <= newBuildSeconds && effectsVisible) {
            var newProgress = clamp(age / newBuildSeconds, 0, 1);
            var emphasis = 0.08 + 0.28 * newProgress;
            setLinePoints(slot.newGlow, newTower.topPosition, vehiclePosition);
            setLinePoints(slot.newCore, newTower.topPosition, vehiclePosition);
            slot.newGlow.visible = true;
            slot.newCore.visible = true;
            slot.newGlow.material.opacity = emphasis * 0.35;
            slot.newCore.material.opacity = emphasis;
          } else {
            slot.newGlow.visible = false;
            slot.newCore.visible = false;
          }

          if (age <= pulseSeconds && effectsVisible) {
            var pulseProgress = clamp(age / pulseSeconds, 0, 1);
            var pulseWave = Math.sin(Math.PI * pulseProgress);
            slot.oldPulse.visible = true;
            slot.newPulse.visible = true;
            slot.oldPulse.material.opacity = (1 - pulseProgress) * 0.72;
            slot.newPulse.material.opacity = pulseWave * 0.78;
            slot.oldPulse.scale.setScalar(1 + pulseProgress * 1.45);
            slot.newPulse.scale.setScalar(0.72 + pulseProgress * 1.75);
          } else {
            slot.oldPulse.visible = false;
            slot.newPulse.visible = false;
          }

          if (age > Math.max(crossFadeSeconds, newBuildSeconds, pulseSeconds)) clearEffectSlot(slot);
        });
      }

      function updateAmbientFields(elapsed) {
        var statePolicy = visibilityPolicy[currentState] || {};
        var fieldsVisible = statePolicy.ambientLoadFields === true;
        var visibleByStatus = ambientPlan.visibleParticlesByStatus || {};
        var radiusMin = finite(ambientPlan.radiusMin, 2.4);
        var radiusMax = finite(ambientPlan.radiusMax, 5.2);
        var heightMin = finite(ambientPlan.heightMin, 1.0);
        var heightMax = finite(ambientPlan.heightMax, 4.8);
        var normalColor = colorValue(ambientPlan.normalColor, "#55c7ff");
        var highColor = colorValue(ambientPlan.highLoadColor, "#ffc15c");
        var overloadedColor = colorValue(ambientPlan.overloadedColor, "#ff5c5c");

        ambientFields.forEach(function (field) {
          var cell = cellLoadRuntime.getCell(field.towerId);
          var status = cell ? cell.status : "FAILED";
          var visibleCount = fieldsVisible ? Number(visibleByStatus[status] || 0) : 0;
          var statusColor = status === "OVERLOADED" ? overloadedColor : (status === "HIGH_LOAD" ? highColor : normalColor);
          field.group.visible = fieldsVisible && status !== "FAILED";
          field.particles.forEach(function (record) {
            var i = record.index;
            var particle = record.mesh;
            var visible = i < visibleCount;
            particle.visible = visible;
            if (!visible) return;
            var normalized = field.particles.length <= 1 ? 0 : i / (field.particles.length - 1);
            var radius = radiusMin + (radiusMax - radiusMin) * ((i % 6) / 5);
            var direction = ((i + field.towerIndex) % 2 === 0) ? 1 : -1;
            var angularSpeed = 0.16 + (i % 4) * 0.025;
            var angle = field.towerIndex * 0.83 + i * 1.61803398875 + elapsed * angularSpeed * direction;
            var verticalWave = 0.5 + 0.5 * Math.sin(elapsed * (0.55 + (i % 3) * 0.07) + i * 0.72);
            var height = heightMin + (heightMax - heightMin) * normalized;
            particle.position.set(Math.cos(angle) * radius, height + verticalWave * 0.28, Math.sin(angle) * radius);
            record.material.color.copy(statusColor);
            record.material.opacity = status === "OVERLOADED" ? 0.72 : (status === "HIGH_LOAD" ? 0.58 : 0.42);
            var scale = status === "OVERLOADED" ? 1.18 : (status === "HIGH_LOAD" ? 1.06 : 0.92);
            particle.scale.setScalar(scale * (0.94 + verticalWave * 0.12));
          });
        });
      }

      function fail(next, key, message) {
        next[key] += 1;
        next.errors.push(message);
      }

      function runSafetyCheck(vehiclePositionsBefore, initial) {
        var next = createSafety();
        if (!validation || validation.status !== "PASSED") fail(next, "validationErrors", "Visualization plan validation is not PASSED.");
        var associationSafety = associationRuntime.getSafetyStatus();
        if (!associationSafety || associationSafety.status !== "PASSED") fail(next, "associationRuntimeErrors", "Network association runtime is not safe.");
        var cellSafety = cellLoadRuntime.getSafetyStatus();
        if (!cellSafety || cellSafety.status !== "PASSED") fail(next, "cellLoadRuntimeErrors", "Cell-load runtime is not safe.");
        var communicationSafety = communicationRuntime.getSafetyStatus();
        if (!communicationSafety || communicationSafety.status !== "PASSED") fail(next, "communicationRuntimeErrors", "Telekom communication runtime is not safe.");
        if (KNOWN_STATES.indexOf(currentState) < 0) fail(next, "invalidRuntimeStateErrors", "Unknown mission state: " + currentState);
        if (createSourceSignature(layout, incidentPlan, missionPlan, scenePlan, associationPlan, cellLoadPlan, communicationPlan, plan) !== sourceSignature) {
          fail(next, "sourceMutationErrors", "A frozen visualization source changed during runtime.");
        }
        var positionsAfter = captureResponsePositions(responseRuntime, trackedEndpointIds, associationPlan);
        if (vehiclePositionsBefore && !positionsEqual(vehiclePositionsBefore, positionsAfter)) {
          fail(next, "vehicleMutationErrors", "Handover visualization changed a response-vehicle position.");
        }
        if (duplicateEvents !== 0) fail(next, "duplicateEventErrors", "A handover event was processed more than once.");
        if (ambientFields.length !== Number((plan.renderManifest || {}).ambientCellFields || 0) ||
            totalParticleMeshes !== Number((plan.renderManifest || {}).ambientParticleMeshes || 0)) {
          fail(next, "particleCountErrors", "Ambient load-field render counts changed.");
        }
        var activeEffectCount = effectSlots.filter(function (slot) { return slot.active; }).length;
        if (effectSlots.length !== Number((plan.renderManifest || {}).handoverEffectSlots || 0) ||
            activeEffectCount > Number(handoverPlan.maxConcurrentEffects || 0)) {
          fail(next, "activeEffectErrors", "Confirmed handover effect slot count is invalid.");
        }
        var activeCandidates = candidateSlots.filter(function (slot) { return slot.active; }).length;
        var expectedCandidateSlots = Number((plan.expectedCounts || {}).candidateEffectSlots || 0);
        if (candidateSlots.length !== expectedCandidateSlots || activeCandidates > expectedCandidateSlots) {
          fail(next, "candidateEffectErrors", "Candidate effect slot count is invalid.");
        }
        candidateSlots.forEach(function (slot) {
          if (slot.line.material.opacity > Math.min(0.32, finite((decisionPlan.candidateLine || {}).maximumOpacity, 0.32)) + EPSILON) {
            fail(next, "candidateEffectErrors", "Candidate path exceeded its maximum opacity: " + slot.endpointId);
          }
          if (currentState === "READY" && slot.active) {
            fail(next, "candidateStateLeakErrors", "Candidate path remained visible after reset: " + slot.endpointId);
          }
        });
        if (fixedServingTowerDefinitions(communicationPlan) !== 0) fail(next, "fixedServingTowerErrors", "A fixed serving-tower definition was added.");
        if (automaticBOSActivations !== 0) fail(next, "automaticBOSActivationErrors", "Visualization triggered an automatic BOS activation.");
        if (automaticCameraMovements !== 0) fail(next, "automaticCameraMovementErrors", "Visualization triggered an automatic camera movement.");
        if (next.errors.length) {
          next.status = "FAILED";
          next.failed = true;
          failed = true;
          root.visible = false;
        }
        safety = next;
        if (initial || safety.failed) logSafety(safety);
      }

      function update(delta, elapsed, runtimeState) {
        if (disposed || failed) return;
        var clampedDelta = Math.max(0, Math.min(finite(delta, 0), 0.25));
        currentElapsed = finite(elapsed, currentElapsed + clampedDelta);
        runtimeState = runtimeState || {};
        currentState = typeof runtimeState.missionState === "string" ? runtimeState.missionState : "READY";
        var policy = visibilityPolicy[currentState] || { handoverEffects: false, ambientLoadFields: false };
        root.visible = policy.handoverEffects === true || policy.ambientLoadFields === true;
        var positionsBefore = captureResponsePositions(responseRuntime, trackedEndpointIds, associationPlan);
        processHandoverHistory(currentElapsed);
        updateCandidateEffects(currentElapsed);
        updateEffects(currentElapsed);
        updateAmbientFields(currentElapsed);
        safetyTimer += clampedDelta;
        if (safetyTimer + EPSILON >= SAFETY_INTERVAL_SECONDS) {
          safetyTimer %= SAFETY_INTERVAL_SECONDS;
          runSafetyCheck(positionsBefore, false);
        }
      }

      function reset() {
        if (disposed || failed) return false;
        effectSlots.forEach(clearEffectSlot);
        candidateSlots.forEach(clearCandidateSlot);
        var history = associationRuntime.getHandoverHistory() || [];
        historyCursor = history.length;
        processedEventKeys = Object.create(null);
        for (var i = 0; i < history.length; i += 1) {
          var event = history[i];
          if (event && event.fromTowerId && event.toTowerId) processedEventKeys[eventKey(event)] = true;
        }
        duplicateEvents = 0;
        lastEvent = null;
        highlightUntil = -Infinity;
        currentState = "READY";
        updateAmbientFields(currentElapsed);
        return true;
      }

      function getDashboardSnapshot() {
        return {
          emphasizeLastHandover: currentElapsed < highlightUntil,
          endpointId: lastEvent ? lastEvent.endpointId : null,
          fromTowerId: lastEvent ? lastEvent.fromTowerId : null,
          toTowerId: lastEvent ? lastEvent.toTowerId : null,
          symbolicHint: plan.dashboard ? plan.dashboard.symbolicHint : ""
        };
      }

      function dispose() {
        if (disposed) return;
        disposed = true;
        if (root.parent) root.parent.remove(root);
        root.traverse(function (object) {
          if (object.geometry && object.geometry !== particleGeometry && typeof object.geometry.dispose === "function") object.geometry.dispose();
          if (object.material) {
            var materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach(function (material) { if (material && typeof material.dispose === "function") material.dispose(); });
          }
        });
        if (particleGeometry && typeof particleGeometry.dispose === "function") particleGeometry.dispose();
        ambientFields.length = 0;
        effectSlots.length = 0;
        candidateSlots.length = 0;
      }

      if (manifest.status !== "PASSED") failed = true;
      updateAmbientFields(0);
      runSafetyCheck(captureResponsePositions(responseRuntime, trackedEndpointIds, associationPlan), true);

      return {
        root: root,
        groups: groups,
        validation: validation,
        update: update,
        reset: reset,
        getDashboardSnapshot: getDashboardSnapshot,
        getManifest: function () { return manifest; },
        getSafetyStatus: function () { return copyObject(safety); },
        dispose: dispose
      };
    } catch (error) {
      console.error("MISSION BOS HANDOVER VISUALIZATION ABORTED:", error);
      return createFailedRuntime("Handover visualization returned a safe failed state.", validation, plan);
    }
  }

  window.MissionBosHandoverVisualization = { create: create };
})();
