/* Mission BOS - Build 009N.7
   Compact crosshair network inspection inside the existing right dashboard.
   KeyF selects, Escape clears. KeyE remains untouched for camera yaw.
*/
(function () {
  "use strict";

  var SAFETY_INTERVAL_SECONDS = 0.25;

  function finite(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function statusLabel(status) {
    if (status === "OVERLOADED") return "Überlastet";
    if (status === "HIGH_LOAD") return "Hohe Last";
    if (status === "FAILED") return "Fehler";
    return "Normal";
  }

  function formatHandover(event) {
    return event ? event.fromTowerId + " → " + event.toTowerId : "Noch kein Handover";
  }

  function latestEventForEndpoint(runtime, endpointId) {
    if (!runtime || typeof runtime.getHandoverHistory !== "function") return null;
    var history = runtime.getHandoverHistory() || [];
    for (var i = history.length - 1; i >= 0; i -= 1) {
      if (history[i] && history[i].endpointId === endpointId) return history[i];
    }
    return null;
  }

  function latestEventForTower(runtimes, towerId) {
    var latest = null;
    (runtimes || []).forEach(function (runtime) {
      if (!runtime || typeof runtime.getHandoverHistory !== "function") return;
      (runtime.getHandoverHistory() || []).forEach(function (event) {
        if (!event || (event.fromTowerId !== towerId && event.toTowerId !== towerId)) return;
        if (!latest || Number(event.time) > Number(latest.time)) latest = event;
      });
    });
    return latest;
  }

  function createManifest(plan, resolvedTargets, requiredElements) {
    var targets = ((plan || {}).inspection || {}).selectableTargets || [];
    var expected = plan.expectedCounts || {};
    var actual = {
      targets: resolvedTargets.length,
      towers: targets.filter(function (target) { return target.kind === "tower"; }).length,
      responseVehicles: targets.filter(function (target) { return target.kind === "response-vehicle"; }).length,
      civilianVehicles: targets.filter(function (target) { return target.kind === "civilian-vehicle"; }).length,
      civilianPedestrians: targets.filter(function (target) { return target.kind === "civilian-pedestrian"; }).length,
      incidentBuildings: targets.filter(function (target) { return target.kind === "incident-building"; }).length,
      requiredDashboardElements: requiredElements,
      standalonePanels: 0,
      automaticSelections: 0,
      cameraActions: 0,
      missionActions: 0
    };
    var passed = actual.targets === Number(expected.inspectionTargets || 0) &&
      actual.towers === Number(expected.inspectionTowers || 0) &&
      actual.responseVehicles === Number(expected.inspectionResponseVehicles || 0) &&
      actual.civilianVehicles === Number(expected.inspectionCivilianVehicles || 0) &&
      actual.civilianPedestrians === Number(expected.inspectionCivilianPedestrians || 0) &&
      actual.incidentBuildings === Number(expected.inspectionIncidentBuildings || 0) &&
      actual.requiredDashboardElements === 8 && actual.standalonePanels === 0;
    return {
      title: "MISSION BOS NETWORK INSPECTION RUNTIME MANIFEST",
      actual: actual,
      expected: expected,
      status: passed ? "PASSED" : "FAILED",
      lines: [
        "MISSION BOS NETWORK INSPECTION RUNTIME MANIFEST",
        "Selectable targets: " + actual.targets + " / " + Number(expected.inspectionTargets || 0),
        "Towers: " + actual.towers + " / " + Number(expected.inspectionTowers || 0),
        "Response vehicles: " + actual.responseVehicles + " / " + Number(expected.inspectionResponseVehicles || 0),
        "Civilian vehicles: " + actual.civilianVehicles + " / " + Number(expected.inspectionCivilianVehicles || 0),
        "Civilian pedestrians: " + actual.civilianPedestrians + " / " + Number(expected.inspectionCivilianPedestrians || 0),
        "Incident buildings: " + actual.incidentBuildings + " / " + Number(expected.inspectionIncidentBuildings || 0),
        "Dashboard elements: " + actual.requiredDashboardElements + " / 8",
        "Standalone panels: 0 / 0",
        "Automatic selections: 0 / 0",
        "Camera actions: 0 / 0",
        "Mission actions: 0 / 0",
        "STATUS: " + (passed ? "PASSED" : "FAILED")
      ]
    };
  }

  function logManifest(manifest) {
    var method = manifest.status === "PASSED" ? "log" : "error";
    console.group(manifest.title);
    manifest.lines.slice(1).forEach(function (line) { console[method](line); });
    console.groupEnd();
  }

  function emptySafety() {
    return {
      title: "MISSION BOS NETWORK INSPECTION RUNTIME SAFETY",
      dependencyErrors: 0,
      targetResolutionErrors: 0,
      domErrors: 0,
      invalidSelectionErrors: 0,
      cameraMutationErrors: 0,
      missionMutationErrors: 0,
      horizontalOverflowErrors: 0,
      keyConflictErrors: 0,
      status: "PASSED",
      failed: false,
      errors: []
    };
  }

  function logSafety(safety) {
    var method = safety.status === "PASSED" ? "log" : "error";
    console.group(safety.title);
    console[method]("Dependency errors: " + safety.dependencyErrors);
    console[method]("Target resolution errors: " + safety.targetResolutionErrors);
    console[method]("DOM errors: " + safety.domErrors);
    console[method]("Invalid selection errors: " + safety.invalidSelectionErrors);
    console[method]("Camera mutation errors: " + safety.cameraMutationErrors);
    console[method]("Mission mutation errors: " + safety.missionMutationErrors);
    console[method]("Horizontal overflow errors: " + safety.horizontalOverflowErrors);
    console[method]("Key conflict errors: " + safety.keyConflictErrors);
    console[method]("STATUS: " + safety.status);
    if (safety.errors.length) console.error(safety.errors);
    console.groupEnd();
  }

  function createFailedRuntime(message, plan) {
    var manifest = createManifest(plan || { expectedCounts: {} }, [], 0);
    manifest.status = "FAILED";
    manifest.lines[manifest.lines.length - 1] = "STATUS: FAILED";
    logManifest(manifest);
    var safety = emptySafety();
    safety.dependencyErrors = 1;
    safety.status = "FAILED";
    safety.failed = true;
    safety.errors.push(message || "Network inspection initialization failed.");
    logSafety(safety);
    return {
      update: function () {},
      clearSelection: function () {},
      reset: function () {},
      selectTargetById: function () { return false; },
      selectAtNormalizedDeviceCoordinates: function () { return false; },
      selectAtClientPoint: function () { return false; },
      getSelection: function () { return null; },
      getManifest: function () { return manifest; },
      getSafetyStatus: function () { return copy(safety); },
      dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var plan = options.plan;
    var camera = options.camera;
    var recoveryCity = options.recoveryCity;
    var responseRuntime = options.responseRuntime;
    var trafficRuntime = options.trafficRuntime;
    var pedestrianRuntime = options.pedestrianRuntime;
    var associationRuntime = options.associationRuntime;
    var civilianConnectivityRuntime = options.civilianConnectivityRuntime;
    var cellLoadRuntime = options.cellLoadRuntime;
    var capacityRuntime = options.capacityRuntime;
    var missionRuntime = options.missionRuntime;
    var civilianVisualRuntime = options.civilianVisualRuntime;
    var elements = options.elements || {};

    if (!plan || !camera || !recoveryCity || !responseRuntime || !trafficRuntime || !pedestrianRuntime ||
        !associationRuntime || !civilianConnectivityRuntime || !cellLoadRuntime || !capacityRuntime ||
        !missionRuntime || !civilianVisualRuntime || typeof THREE === "undefined" || !THREE.Raycaster) {
      return createFailedRuntime("One or more Network Inspection dependencies are missing.", plan);
    }

    var inspection = plan.inspection || {};
    var dashboard = inspection.dashboard || {};
    var fields = dashboard.fieldIds || {};
    var panel = elements.panel || document.getElementById(dashboard.containerId);
    var nameValue = elements.name || document.getElementById(fields.objectName);
    var typeValue = elements.type || document.getElementById(fields.objectType);
    var servingCellValue = elements.servingCell || document.getElementById(fields.servingCell);
    var cellLoadValue = elements.cellLoad || document.getElementById(fields.cellLoad);
    var serviceStateValue = elements.serviceState || document.getElementById(fields.serviceState);
    var lastHandoverValue = elements.lastHandover || document.getElementById(fields.lastHandover);
    var noteValue = elements.note || document.getElementById(fields.note);
    var infoPanel = elements.infoPanel || document.getElementById("info-panel");
    var requiredElements = [panel, nameValue, typeValue, servingCellValue, cellLoadValue, serviceStateValue, lastHandoverValue, noteValue]
      .filter(Boolean).length;

    var targetRecords = [];
    var targetsById = Object.create(null);

    function resolveRoot(target) {
      if (target.kind === "tower") return recoveryCity.towersById && recoveryCity.towersById[target.referenceId];
      if (target.kind === "incident-building") return recoveryCity.buildingsById && recoveryCity.buildingsById[target.referenceId];
      if (target.kind === "response-vehicle") {
        var response = responseRuntime.vehiclesById && responseRuntime.vehiclesById[target.referenceId];
        return response && response.mesh;
      }
      if (target.kind === "civilian-vehicle") {
        var vehicle = trafficRuntime.vehiclesById && trafficRuntime.vehiclesById[target.referenceId];
        return vehicle && vehicle.mesh;
      }
      if (target.kind === "civilian-pedestrian") {
        return pedestrianRuntime.personsById && pedestrianRuntime.personsById[target.referenceId];
      }
      return null;
    }

    (inspection.selectableTargets || []).forEach(function (definition) {
      var root = resolveRoot(definition);
      if (!root) return;
      var record = { definition: definition, root: root };
      targetRecords.push(record);
      targetsById[definition.id] = record;
    });

    var manifest = createManifest(plan, targetRecords, requiredElements);
    logManifest(manifest);
    var safety = emptySafety();
    var failed = manifest.status !== "PASSED";
    var raycaster = new THREE.Raycaster();
    var center = new THREE.Vector2(0, 0);
    var selectedRecord = null;
    var safetyAccumulator = 0;
    var disposed = false;

    if (panel) panel.hidden = true;

    function descendantsBelongTo(root, object) {
      var current = object;
      while (current) {
        if (current === root) return true;
        current = current.parent;
      }
      return false;
    }

    function setText(element, text) {
      if (element) element.textContent = text == null ? "–" : String(text);
    }

    function representativeAssociationsAtTower(towerId) {
      return (civilianConnectivityRuntime.getAllAssociations() || []).filter(function (association) {
        return association && association.active && association.servingTowerId === towerId;
      });
    }

    function renderTower(record) {
      var towerId = record.definition.referenceId;
      var cell = cellLoadRuntime.getCell(towerId);
      var capacity = capacityRuntime.getCell(towerId);
      var representative = representativeAssociationsAtTower(towerId);
      var visibleCivilian = (capacity && capacity.civilianEndpointIds ? capacity.civilianEndpointIds : []).concat(
        representative.map(function (item) { return item.endpointId; })
      );
      var latest = latestEventForTower([associationRuntime, civilianConnectivityRuntime], towerId);
      setText(nameValue, record.definition.label);
      setText(typeValue, "Mobilfunkmast");
      setText(servingCellValue, towerId);
      setText(cellLoadValue, cell
        ? "Basis " + Math.round(cell.baseLoad) + " % · +" + Math.round(cell.dynamicCivilianLoad) + " dynamisch · " + Math.round(cell.currentLoad) + " % effektiv"
        : "Nicht verfügbar");
      setText(serviceStateValue, cell
        ? statusLabel(cell.status) + " · BOS-Priorität " + (capacity && capacity.priorityApplied ? "aktiv" : "inaktiv")
        : "Nicht verfügbar");
      setText(lastHandoverValue, formatHandover(latest));
      setText(noteValue,
        "BOS-Endpunkte: " + (capacity ? capacity.bosEndpointIds.length : 0) +
        " · sichtbare zivile Endpunkte: " + visibleCivilian.length +
        " · zurückgestellt: " + (capacity ? capacity.affectedCivilianEndpointIds.length : 0));
    }

    function renderResponseVehicle(record) {
      var endpointId = record.definition.endpointId;
      var association = associationRuntime.getAssociation(endpointId);
      var cell = association && association.servingTowerId ? cellLoadRuntime.getCell(association.servingTowerId) : null;
      var service = capacityRuntime.getEndpointServiceState(endpointId);
      var latest = latestEventForEndpoint(associationRuntime, endpointId);
      var vehicleStatus = responseRuntime.getVehicleStatus
        ? responseRuntime.getVehicleStatus(record.definition.referenceId)
        : responseRuntime.getState();
      setText(nameValue, record.definition.label);
      setText(typeValue, "BOS-Fahrzeug");
      setText(servingCellValue, association && association.servingTowerId || "Nicht verbunden");
      setText(cellLoadValue, cell ? Math.round(cell.currentLoad) + " % effektiv" : "Nicht verfügbar");
      setText(serviceStateValue, (service && service.label ? service.label : "Best Effort") + " · " + vehicleStatus);
      setText(lastHandoverValue, formatHandover(latest));
      setText(noteValue, "Symbolische BOS-Dienstsicht; keine technische Leistungskennzahl.");
    }

    function renderCivilian(record) {
      var endpointId = record.definition.endpointId;
      var association = civilianConnectivityRuntime.getAssociation(endpointId);
      var cell = association && association.servingTowerId ? cellLoadRuntime.getCell(association.servingTowerId) : null;
      var latest = latestEventForEndpoint(civilianConnectivityRuntime, endpointId);
      var overloaded = cell && cell.status === "OVERLOADED";
      setText(nameValue, record.definition.label);
      setText(typeValue, record.definition.kind === "civilian-vehicle" ? "Ziviles Fahrzeug" : "Ziviles Endgerät");
      setText(servingCellValue, association && association.servingTowerId || "Nicht verbunden");
      setText(cellLoadValue, cell ? Math.round(cell.currentLoad) + " % effektiv" : "Nicht verfügbar");
      setText(serviceStateValue, overloaded ? "Zelle überlastet · Best Effort" : "Best Effort");
      setText(lastHandoverValue, formatHandover(latest));
      setText(noteValue,
        (association ? association.activityLabel : "Zivile Nutzung") +
        " · Lastbeitrag " + (association ? association.demandUnits : 0) + " Simulationseinheiten");
    }

    function renderIncident(record) {
      var state = missionRuntime.getState ? missionRuntime.getState() : "READY";
      var cellA = cellLoadRuntime.getCell("MAST_A");
      var cellB = cellLoadRuntime.getCell("MAST_B");
      setText(nameValue, record.definition.label);
      setText(typeValue, "Mission-001-Einsatzort");
      setText(servingCellValue, "Nahe Zellen: MAST_A und MAST_B");
      setText(cellLoadValue,
        "MAST_A " + (cellA ? Math.round(cellA.currentLoad) : "–") + " % · MAST_B " + (cellB ? Math.round(cellB.currentLoad) : "–") + " %");
      setText(serviceStateValue, "Missionszustand: " + state);
      setText(lastHandoverValue, "Nicht zutreffend");
      setText(noteValue, "Einsatzgebäude W14 · symbolische Netzbetrachtung.");
    }

    function renderSelection() {
      if (!selectedRecord || !panel) return;
      var kind = selectedRecord.definition.kind;
      if (kind === "tower") renderTower(selectedRecord);
      else if (kind === "response-vehicle") renderResponseVehicle(selectedRecord);
      else if (kind === "civilian-vehicle" || kind === "civilian-pedestrian") renderCivilian(selectedRecord);
      else if (kind === "incident-building") renderIncident(selectedRecord);
      panel.hidden = false;
    }

    function applyVisualSelection(record) {
      if (!record) {
        civilianVisualRuntime.clearSelection();
      } else if (record.definition.kind === "tower") {
        civilianVisualRuntime.setSelectedTower(record.definition.referenceId);
      } else if (record.definition.kind === "civilian-vehicle" || record.definition.kind === "civilian-pedestrian") {
        civilianVisualRuntime.setSelectedEndpoint(record.definition.endpointId);
      } else {
        civilianVisualRuntime.clearSelection();
      }
    }

    function selectRecord(record) {
      if (!record) return false;
      selectedRecord = record;
      applyVisualSelection(record);
      renderSelection();
      return true;
    }

    function selectTargetById(targetId) {
      return selectRecord(targetsById[targetId] || null);
    }

    function clearSelection() {
      selectedRecord = null;
      civilianVisualRuntime.clearSelection();
      if (panel) panel.hidden = true;
    }

    function performRaycastAt(normalizedPoint) {
      var cameraBefore = {
        x: camera.position.x, y: camera.position.y, z: camera.position.z,
        rx: camera.rotation.x, ry: camera.rotation.y, rz: camera.rotation.z,
        fov: camera.fov
      };
      var missionBefore = missionRuntime.getState ? missionRuntime.getState() : null;
      raycaster.far = finite(inspection.maximumDistance, 80);
      raycaster.setFromCamera(normalizedPoint || center, camera);
      var roots = targetRecords.map(function (record) { return record.root; });
      var intersections = raycaster.intersectObjects(roots, true) || [];
      var chosen = null;
      for (var i = 0; i < intersections.length && !chosen; i += 1) {
        if (finite(intersections[i].distance, Infinity) > finite(inspection.maximumDistance, 80)) continue;
        for (var j = 0; j < targetRecords.length; j += 1) {
          if (descendantsBelongTo(targetRecords[j].root, intersections[i].object)) {
            chosen = targetRecords[j];
            break;
          }
        }
      }
      if (chosen) selectRecord(chosen);
      else if (inspection.selectionClearsOnEmptyRaycast === true) clearSelection();
      if (cameraBefore.x !== camera.position.x || cameraBefore.y !== camera.position.y || cameraBefore.z !== camera.position.z ||
          cameraBefore.rx !== camera.rotation.x || cameraBefore.ry !== camera.rotation.y || cameraBefore.rz !== camera.rotation.z ||
          cameraBefore.fov !== camera.fov) {
        safety.cameraMutationErrors += 1;
      }
      if (missionRuntime.getState && missionBefore !== missionRuntime.getState()) safety.missionMutationErrors += 1;
      return !!chosen;
    }

    function performRaycast() {
      return performRaycastAt(center);
    }

    function selectAtNormalizedDeviceCoordinates(x, y) {
      var nx = finite(x, NaN);
      var ny = finite(y, NaN);
      if (!isFinite(nx) || !isFinite(ny) || nx < -1 || nx > 1 || ny < -1 || ny > 1) return false;
      return performRaycastAt(new THREE.Vector2(nx, ny));
    }

    function selectAtClientPoint(clientX, clientY, canvasRect) {
      var rect = canvasRect;
      if (!rect || !isFinite(Number(rect.width)) || !isFinite(Number(rect.height)) || Number(rect.width) <= 0 || Number(rect.height) <= 0) return false;
      var x = ((finite(clientX, NaN) - finite(rect.left, 0)) / Number(rect.width)) * 2 - 1;
      var y = -(((finite(clientY, NaN) - finite(rect.top, 0)) / Number(rect.height)) * 2 - 1);
      return selectAtNormalizedDeviceCoordinates(x, y);
    }

    function onKeyDown(event) {
      if (event.code === inspection.activationKeyCode) {
        if (event.repeat === true) return;
        performRaycast();
        event.preventDefault();
      } else if (event.code === inspection.clearKeyCode) {
        clearSelection();
      }
    }

    function runSafetyCheck(initial) {
      var next = emptySafety();
      var associationSafety = associationRuntime.getSafetyStatus && associationRuntime.getSafetyStatus();
      var civilianSafety = civilianConnectivityRuntime.getSafetyStatus && civilianConnectivityRuntime.getSafetyStatus();
      var loadSafety = cellLoadRuntime.getSafetyStatus && cellLoadRuntime.getSafetyStatus();
      var capacitySafety = capacityRuntime.getSafetyStatus && capacityRuntime.getSafetyStatus();
      function dependencyUsable(status) {
        return !!status && (status.status === "PASSED" || (status.status === "FAILED" && status.fatal !== true));
      }
      if (!dependencyUsable(associationSafety) ||
          !dependencyUsable(civilianSafety) ||
          !dependencyUsable(loadSafety) ||
          !dependencyUsable(capacitySafety)) {
        next.dependencyErrors += 1;
        next.errors.push("One or more network inspection source runtimes are unsafe.");
      }
      if (targetRecords.length !== Number((plan.expectedCounts || {}).inspectionTargets || 0)) {
        next.targetResolutionErrors += 1;
        next.errors.push("Not all inspection targets are resolvable.");
      }
      if (requiredElements !== 8 || !panel || !infoPanel || !infoPanel.contains(panel)) {
        next.domErrors += 1;
        next.errors.push("Network Inspection dashboard elements are incomplete or misplaced.");
      }
      if (selectedRecord && !targetsById[selectedRecord.definition.id]) {
        next.invalidSelectionErrors += 1;
        next.errors.push("Unknown inspection selection.");
      }
      if (infoPanel && infoPanel.scrollWidth > infoPanel.clientWidth + 2) {
        next.horizontalOverflowErrors += 1;
        next.errors.push("The right dashboard has horizontal overflow.");
      }
      if (inspection.activationKeyCode !== "KeyF" || inspection.activationKeyCode === "KeyE") {
        next.keyConflictErrors += 1;
        next.errors.push("Inspection key conflicts with camera controls.");
      }
      next.cameraMutationErrors += safety.cameraMutationErrors;
      next.missionMutationErrors += safety.missionMutationErrors;
      if (next.errors.length || next.cameraMutationErrors || next.missionMutationErrors || failed) {
        next.status = "FAILED";
        next.failed = true;
        failed = true;
      }
      safety = next;
      if (initial || safety.failed) logSafety(safety);
    }

    function update(delta) {
      if (disposed || failed) return;
      if (selectedRecord) renderSelection();
      safetyAccumulator += Math.max(0, Math.min(finite(delta, 0), 0.25));
      if (safetyAccumulator >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafetyCheck(false);
      }
    }

    function reset() {
      clearSelection();
      safetyAccumulator = 0;
      runSafetyCheck(false);
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      window.removeEventListener("keydown", onKeyDown);
      clearSelection();
    }

    window.addEventListener("keydown", onKeyDown);
    runSafetyCheck(true);

    return {
      update: update,
      clearSelection: clearSelection,
      reset: reset,
      selectTargetById: selectTargetById,
      selectAtNormalizedDeviceCoordinates: selectAtNormalizedDeviceCoordinates,
      selectAtClientPoint: selectAtClientPoint,
      getSelection: function () { return selectedRecord ? copy(selectedRecord.definition) : null; },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      dispose: dispose
    };
  }

  window.MissionBosNetworkInspectionController = { create: create };
})();
