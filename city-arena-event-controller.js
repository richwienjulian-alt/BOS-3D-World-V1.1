/* Mission BOS - Build 011N.1
   Arena Event foundation with controlled Mission-002 ownership.
   Reads frozen plans and existing runtimes only.
   No modules. No fetch. No randomization.
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

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      if (items[i] && items[i].id === id) return items[i];
    }
    return null;
  }

  function finitePosition(position) {
    return !!position && isFinite(Number(position.x)) && isFinite(Number(position.z));
  }

  function countForbiddenServingTowerKeys(value) {
    var count = 0;
    function walk(node) {
      if (!node || typeof node !== "object") return;
      Object.keys(node).forEach(function (key) {
        var normalized = String(key).toLowerCase();
        if (normalized === "servingtowerid" || normalized === "servingcellid" ||
            normalized === "fixedtowerid" || normalized === "missiontowerid") count += 1;
        walk(node[key]);
      });
    }
    walk(value);
    return count;
  }

  function sourceSignature(options) {
    return JSON.stringify({
      layout: (options.layout.mobileTowers || []).map(function (item) {
        return { id: item.id, worldRect: item.worldRect, height: item.height };
      }),
      props: options.propsPlan,
      traffic: options.trafficPlan,
      pedestrians: options.pedestrianPlan,
      ambulance: options.ambulancePlan,
      registry: options.missionRegistryPlan,
      association: options.associationPlan,
      cellLoad: options.cellLoadPlan,
      arena: options.plan
    });
  }

  function buildTowerRecords(layout, associationPlan) {
    return (associationPlan.towers || []).map(function (definition) {
      var source = findById(layout.mobileTowers || [], definition.referenceId);
      if (!source || !source.worldRect) return null;
      return {
        id: definition.referenceId,
        available: definition.available === true,
        siteCalibrationOffset: finite(definition.siteCalibrationOffset, 0),
        coverageInfluences: copy(definition.coverageInfluences || []),
        position: {
          x: Number(source.worldRect.x),
          y: finite(source.height, 15),
          z: Number(source.worldRect.z)
        }
      };
    }).filter(Boolean);
  }

  function createManifest(plan) {
    var expected = plan.expectedCounts || {};
    var actual = {
      crowdActors: (plan.crowd || []).length,
      phones: (plan.visiblePhoneEndpoints || []).length,
      aggregateDemandSources: (plan.aggregateDemandSources || []).length,
      dynamicLoadSources: (plan.dynamicLoadSources || []).length,
      visiblePhoneDemandUnits: (plan.visiblePhoneEndpoints || []).reduce(function (sum, item) { return sum + finite(item.demandUnits, 0); }, 0),
      aggregateDemandUnits: (plan.aggregateDemandSources || []).reduce(function (sum, item) { return sum + finite(item.demandUnits, 0); }, 0),
      totalEventDemandUnits: 0,
      expectedServingTowers: (plan.references && plan.references.arenaTowerReferenceId) ? 1 : 0,
      mission002Runtimes: 0,
      mission002Actors: 0,
      patients: 0,
      automaticEventStarts: 0,
      automaticMissionStarts: 0,
      automaticBOSActivations: 0,
      fixedServingTowerDefinitions: countForbiddenServingTowerKeys(plan),
      newStandalonePanels: 0
    };
    actual.totalEventDemandUnits = actual.visiblePhoneDemandUnits + actual.aggregateDemandUnits;
    var keys = [
      "crowdActors", "phones", "aggregateDemandSources", "dynamicLoadSources",
      "visiblePhoneDemandUnits", "aggregateDemandUnits", "totalEventDemandUnits",
      "expectedServingTowers", "mission002Runtimes", "mission002Actors", "patients",
      "automaticEventStarts", "automaticMissionStarts",
      "automaticBOSActivations", "fixedServingTowerDefinitions", "newStandalonePanels"
    ];
    var status = keys.every(function (key) {
      return Number(actual[key]) === Number(expected[key] || 0);
    }) ? "PASSED" : "FAILED";
    return {
      title: "MISSION BOS ARENA EVENT CONTROLLER MANIFEST",
      status: status,
      actual: actual,
      expected: copy(expected)
    };
  }

  function logManifest(manifest) {
    var method = manifest.status === "PASSED" ? "log" : "error";
    console.group(manifest.title);
    console[method]("Crowd actors: " + manifest.actual.crowdActors + " / " + Number(manifest.expected.crowdActors || 0));
    console[method]("Visible phones: " + manifest.actual.phones + " / " + Number(manifest.expected.phones || 0));
    console[method]("Aggregate demand sources: " + manifest.actual.aggregateDemandSources + " / " + Number(manifest.expected.aggregateDemandSources || 0));
    console[method]("Visible demand units: " + manifest.actual.visiblePhoneDemandUnits + " / " + Number(manifest.expected.visiblePhoneDemandUnits || 0));
    console[method]("Aggregate demand units: " + manifest.actual.aggregateDemandUnits + " / " + Number(manifest.expected.aggregateDemandUnits || 0));
    console[method]("Total event demand units: " + manifest.actual.totalEventDemandUnits + " / " + Number(manifest.expected.totalEventDemandUnits || 0));
    console[method]("Expected serving towers: " + manifest.actual.expectedServingTowers + " / " + Number(manifest.expected.expectedServingTowers || 0));
    console[method]("Mission 002 runtimes: 0 / 0");
    console[method]("Mission 002 actors: 0 / 0");
    console[method]("Patients: 0 / 0");
    console[method]("Automatic event starts: 0 / 0");
    console[method]("Automatic mission starts: 0 / 0");
    console[method]("Automatic BOS activations: 0 / 0");
    console[method]("Fixed serving-tower definitions: " + manifest.actual.fixedServingTowerDefinitions + " / 0");
    console[method]("STATUS: " + manifest.status);
    console.groupEnd();
  }

  function emptySafety() {
    return {
      title: "MISSION BOS ARENA EVENT CONTROLLER RUNTIME SAFETY",
      dependencyErrors: 0,
      actorReferenceErrors: 0,
      phoneReferenceErrors: 0,
      invalidRadioErrors: 0,
      unknownTowerErrors: 0,
      visibleDemandErrors: 0,
      aggregateDemandErrors: 0,
      cellLoadRangeErrors: 0,
      eventStartConflictErrors: 0,
      missionStartDuringEventErrors: 0,
      remainingLoadErrors: 0,
      remainingLineErrors: 0,
      duplicateCrowdErrors: 0,
      sourceMutationErrors: 0,
      automaticActionErrors: 0,
      fixedServingTowerErrors: 0,
      recoverableWarnings: 0,
      status: "PASSED",
      failed: false,
      fatal: false,
      warnings: [],
      errors: []
    };
  }

  function logSafety(safety) {
    var method = safety.status === "PASSED" ? "log" : "error";
    console.group(safety.title);
    Object.keys(safety).forEach(function (key) {
      if (/Errors$/.test(key)) console[method](key + ": " + safety[key]);
    });
    console[method]("Recoverable warnings: " + Number(safety.recoverableWarnings || 0));
    console[method]("STATUS: " + safety.status);
    if (safety.warnings && safety.warnings.length) console.warn(safety.warnings);
    if (safety.errors.length) console.error(safety.errors);
    console.groupEnd();
  }

  function createFailedRuntime(message, validation, plan, ui) {
    var manifest = createManifest(plan || { expectedCounts: {} });
    manifest.status = "FAILED";
    logManifest(manifest);
    var safety = emptySafety();
    safety.dependencyErrors = 1;
    safety.status = "FAILED";
    safety.failed = true;
    safety.fatal = true;
    safety.errors.push(message || "Arena event controller initialization failed.");
    logSafety(safety);
    if (ui && ui.status) ui.status.textContent = "Nicht verfügbar";
    return {
      validation: validation || null,
      activate: function () { return false; },
      activateForMission: function () { return false; },
      deactivate: function () { return false; },
      deactivateForMission: function () { return false; },
      toggle: function () { return false; },
      update: function () {},
      reset: function () { return false; },
      isActive: function () { return false; },
      getState: function () { return "FAILED"; },
      getOwnerMissionId: function () { return null; },
      getAssociation: function () { return null; },
      getServingTowerId: function () { return null; },
      getAllAssociations: function () { return []; },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      setConnectivityRuntime: function () { return false; },
      dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var plan = options.plan;
    var validation = options.validation || null;
    var validator = options.validator;
    var renderer = options.renderer;
    var layout = options.layout;
    var propsPlan = options.propsPlan;
    var trafficPlan = options.trafficPlan;
    var pedestrianPlan = options.pedestrianPlan;
    var ambulancePlan = options.ambulancePlan;
    var missionRegistryPlan = options.missionRegistryPlan;
    var associationPlan = options.associationPlan;
    var radioModel = options.radioModel || window.MissionBosNetworkRadioModel;
    var cellLoadPlan = options.cellLoadPlan;
    var cellLoadRuntime = options.cellLoadRuntime;
    var sharedAssociationRuntime = options.sharedAssociationRuntime || null;
    var networkRealismPlan = options.networkRealismPlan || window.MISSION_BOS_NETWORK_REALISM_PLAN || null;
    var mission001Runtime = options.mission001Runtime;
    var missionRegistryRuntime = options.missionRegistryRuntime;
    var ambulanceFoundationRuntime = options.ambulanceFoundationRuntime;
    var isBosActive = typeof options.isBosActive === "function" ? options.isBosActive : function () { return false; };
    var isManualLoadActive = typeof options.isManualLoadActive === "function" ? options.isManualLoadActive : function () { return false; };
    var ui = options.ui || {};

    if (!plan || !validator || !renderer || !layout || !propsPlan || !trafficPlan || !pedestrianPlan ||
        !ambulancePlan || !missionRegistryPlan || !associationPlan || !radioModel || !cellLoadPlan ||
        !cellLoadRuntime || !mission001Runtime || !missionRegistryRuntime || !ambulanceFoundationRuntime) {
      return createFailedRuntime("Arena event controller dependencies are incomplete.", validation, plan, ui);
    }
    if (!validation) {
      validation = validator.validate(
        layout, propsPlan, trafficPlan, pedestrianPlan, ambulancePlan,
        missionRegistryPlan, associationPlan, cellLoadPlan, plan
      );
      validator.logResult(validation);
    }
    if (!validation || validation.status !== "PASSED") {
      return createFailedRuntime("Arena event plan validation returned FAILED.", validation, plan, ui);
    }
    var rendererMethods = (plan.runtimeContract || {}).requiredRendererMethods || [];
    var rendererContractValid = rendererMethods.every(function (method) { return typeof renderer[method] === "function"; });
    var cellMethods = (plan.runtimeContract || {}).requiredCellLoadMethods || [];
    var cellContractValid = cellMethods.every(function (method) { return typeof cellLoadRuntime[method] === "function"; });
    if (!rendererContractValid || !cellContractValid ||
        typeof radioModel.createDecisionState !== "function" || typeof radioModel.updateDecision !== "function") {
      return createFailedRuntime("Arena event runtime contract is incomplete.", validation, plan, ui);
    }

    var towerRecords = buildTowerRecords(layout, associationPlan);
    var towersById = Object.create(null);
    towerRecords.forEach(function (tower) { towersById[tower.id] = tower; });
    var selectionModel = associationPlan.selectionModel || {};
    var state = "INACTIVE";
    var currentTime = 0;
    var evaluationAccumulator = 0;
    var safetyAccumulator = 0;
    var disposed = false;
    var failed = false;
    var automaticEventStarts = 0;
    var automaticMissionStarts = 0;
    var automaticBOSActivations = 0;
    var connectivityRuntime = null;
    var ownerMissionId = null;
    var lastVisibleContributions = Object.create(null);
    var lastAggregateContributions = Object.create(null);
    var source = sourceSignature(options);

    var endpointsById = Object.create(null);
    var endpointStates = [];
    (plan.visiblePhoneEndpoints || []).forEach(function (definition) {
      var endpoint = {
        id: definition.id,
        kind: "visible-phone",
        actorId: definition.actorId,
        demandUnits: finite(definition.demandUnits, 0),
        radioState: radioModel.createDecisionState(),
        position: null
      };
      endpointsById[endpoint.id] = endpoint;
      endpointStates.push(endpoint);
    });
    (plan.aggregateDemandSources || []).forEach(function (definition) {
      var endpoint = {
        id: definition.id,
        kind: "aggregate",
        demandUnits: finite(definition.demandUnits, 0),
        fixedPosition: copy(definition.position),
        radioState: radioModel.createDecisionState(),
        position: null
      };
      endpointsById[endpoint.id] = endpoint;
      endpointStates.push(endpoint);
    });

    var manifest = createManifest(plan);
    logManifest(manifest);
    if (manifest.status !== "PASSED") failed = true;
    var safety = emptySafety();
    var buttonHandler = function () { toggle(); };
    if (ui.button && typeof ui.button.addEventListener === "function") ui.button.addEventListener("click", buttonHandler);

    function getMissionState() {
      return mission001Runtime && typeof mission001Runtime.getState === "function" ? mission001Runtime.getState() : "FAILED";
    }

    function getActiveMissionId() {
      return missionRegistryRuntime && typeof missionRegistryRuntime.getActiveMissionId === "function"
        ? missionRegistryRuntime.getActiveMissionId() : null;
    }

    function getAmbulanceState() {
      return ambulanceFoundationRuntime && typeof ambulanceFoundationRuntime.getState === "function"
        ? ambulanceFoundationRuntime.getState() : "FAILED";
    }

    function getCellLoadSafety() {
      return cellLoadRuntime && typeof cellLoadRuntime.getSafetyStatus === "function"
        ? cellLoadRuntime.getSafetyStatus() : null;
    }

    function cellLoadRuntimeUsable() {
      var status = getCellLoadSafety();
      if (!status) return false;
      if (status.status === "PASSED") return true;
      return status.fatal !== true;
    }

    function canActivate(ownerId) {
      var missionOwned = ownerId === "MISSION_002";
      var activeMissionId = getActiveMissionId();
      return !disposed && !failed && state === "INACTIVE" && !ownerMissionId &&
        getMissionState() === "READY" && (!activeMissionId || (missionOwned && activeMissionId === "MISSION_002")) &&
        getAmbulanceState() === "AT_STATION" &&
        !(ambulanceFoundationRuntime.isActive && ambulanceFoundationRuntime.isActive()) &&
        isBosActive() !== true && isManualLoadActive() !== true &&
        renderer.getSafetyStatus().status === "PASSED" &&
        cellLoadRuntimeUsable();
    }

    function resolvePosition(endpoint) {
      if (endpoint.kind === "visible-phone") return renderer.getPhonePosition(endpoint.id);
      return endpoint.fixedPosition ? { x: Number(endpoint.fixedPosition.x), y: 1.4, z: Number(endpoint.fixedPosition.z) } : null;
    }

    function loadSnapshot() {
      var loads = Object.create(null);
      towerRecords.forEach(function (tower) {
        loads[tower.id] = cellLoadRuntime.getCellLoad(tower.id);
      });
      return loads;
    }

    function evaluateAssociations(force) {
      var interval = finite((plan.simulation || {}).evaluationIntervalSeconds, 0.25);
      if (!force && evaluationAccumulator + EPSILON < interval) return;
      evaluationAccumulator = force ? 0 : evaluationAccumulator % interval;
      var loads = loadSnapshot();
      endpointStates.forEach(function (endpoint) {
        endpoint.position = resolvePosition(endpoint);
        if (!finitePosition(endpoint.position)) {
          endpoint.radioState.status = "FAILED";
          return;
        }
        radioModel.updateDecision(endpoint.radioState, {
          time: currentTime,
          position: endpoint.position,
          towers: towerRecords,
          loadsByTowerId: loads,
          model: selectionModel
        });
      });
      publishContributions();
    }

    function contributionMap(kind) {
      var values = Object.create(null);
      towerRecords.forEach(function (tower) { values[tower.id] = 0; });
      if (kind === "visible-phone" && sharedAssociationRuntime && networkRealismPlan &&
          typeof sharedAssociationRuntime.getAssociation === "function") {
        (((networkRealismPlan.participants || {}).arenaCivilian) || []).forEach(function (definition) {
          var association = sharedAssociationRuntime.getAssociation(definition.id);
          var towerId = association && association.active ? association.servingTowerId : null;
          if (towerId && Object.prototype.hasOwnProperty.call(values, towerId)) {
            values[towerId] += finite(definition.demandUnits, 0);
          }
        });
        return values;
      }
      endpointStates.forEach(function (endpoint) {
        if (endpoint.kind !== kind) return;
        var towerId = endpoint.radioState.servingTowerId;
        if (towerId && Object.prototype.hasOwnProperty.call(values, towerId)) {
          values[towerId] += endpoint.demandUnits;
        }
      });
      return values;
    }

    function publishContributions() {
      if (state !== "ACTIVE") return;
      var visible = contributionMap("visible-phone");
      var aggregate = contributionMap("aggregate");
      var okVisible = cellLoadRuntime.setDynamicCivilianContributions("ARENA_EVENT_VISIBLE_PHONES", visible);
      var okAggregate = cellLoadRuntime.setDynamicCivilianContributions("ARENA_EVENT_AGGREGATE", aggregate);
      if (okVisible) lastVisibleContributions = copy(visible);
      if (okAggregate) lastAggregateContributions = copy(aggregate);
      if (!okVisible || !okAggregate) {
        fail("Arena event dynamic load contribution was rejected.");
      }
    }

    function clearContributions() {
      var first = cellLoadRuntime.setDynamicCivilianContributions("ARENA_EVENT_VISIBLE_PHONES", {});
      var second = cellLoadRuntime.setDynamicCivilianContributions("ARENA_EVENT_AGGREGATE", {});
      if (first) lastVisibleContributions = Object.create(null);
      if (second) lastAggregateContributions = Object.create(null);
      return first && second;
    }

    function resetRadioStates() {
      endpointStates.forEach(function (endpoint) {
        endpoint.radioState = radioModel.createDecisionState();
        endpoint.position = null;
      });
      evaluationAccumulator = 0;
    }

    function activateInternal(ownerId) {
      if (!canActivate(ownerId)) {
        if (ui.status) {
          if (getMissionState() !== "READY" || getActiveMissionId()) ui.status.textContent = "Mission zuerst abschließen";
          else if (getAmbulanceState() !== "AT_STATION" || (ambulanceFoundationRuntime.isActive && ambulanceFoundationRuntime.isActive())) ui.status.textContent = "Rettungswagentest zuerst abschließen";
          else if (isBosActive()) ui.status.textContent = "BOS-Spur zuerst deaktivieren";
          else if (isManualLoadActive()) ui.status.textContent = "Netzlastsimulation zuerst beenden";
          else ui.status.textContent = "Aktivierung nicht verfügbar";
        }
        return false;
      }
      ownerMissionId = ownerId || null;
      state = "ACTIVE";
      resetRadioStates();
      renderer.setVisible(true);
      evaluateAssociations(true);
      updateUi();
      runSafetyCheck(false);
      return !failed;
    }

    function activate() {
      return activateInternal(null);
    }

    function activateForMission(missionId) {
      if (missionId !== "MISSION_002") return false;
      return activateInternal(missionId);
    }

    function deactivateInternal(ownerId) {
      if (disposed || state === "FAILED") return false;
      if (ownerMissionId && ownerMissionId !== ownerId) return false;
      var cleared = clearContributions();
      renderer.setVisible(false);
      if (connectivityRuntime && typeof connectivityRuntime.setVisible === "function") connectivityRuntime.setVisible(false);
      if (connectivityRuntime && typeof connectivityRuntime.reset === "function") connectivityRuntime.reset();
      resetRadioStates();
      state = "INACTIVE";
      ownerMissionId = null;
      updateUi();
      runSafetyCheck(false);
      return cleared && !failed;
    }

    function deactivate() {
      if (ownerMissionId) return false;
      return deactivateInternal(null);
    }

    function deactivateForMission(missionId) {
      if (missionId !== "MISSION_002" || ownerMissionId !== missionId) return false;
      return deactivateInternal(missionId);
    }

    function toggle() {
      if (ownerMissionId) return false;
      return state === "ACTIVE" ? deactivate() : activate();
    }

    function associationSnapshot(endpoint) {
      if (!endpoint) return null;
      var towerId = endpoint.radioState.servingTowerId;
      var cell = towerId ? cellLoadRuntime.getCell(towerId) : null;
      return {
        endpointId: endpoint.id,
        kind: endpoint.kind,
        active: state === "ACTIVE",
        servingTowerId: towerId,
        servingScore: endpoint.radioState.servingScore,
        candidateTowerId: endpoint.radioState.candidateTowerId,
        candidateProgress: endpoint.radioState.candidateProgress,
        status: state === "ACTIVE" ? endpoint.radioState.status : "INACTIVE",
        demandUnits: endpoint.demandUnits,
        position: endpoint.position ? copy(endpoint.position) : null,
        servingCellLoad: cell ? cell.currentLoad : null,
        servingCellStatus: cell ? cell.status : null
      };
    }

    function updateUi() {
      var active = state === "ACTIVE";
      if (ui.status) ui.status.textContent = state === "FAILED"
        ? "Fehler" : (active ? (plan.dashboard || {}).activeLabel : (plan.dashboard || {}).inactiveLabel);
      if (ui.visibleCount) ui.visibleCount.textContent = (active ? (plan.crowd || []).length : 0) + " / " + (plan.crowd || []).length;
      if (ui.phoneCount) ui.phoneCount.textContent = (active ? (plan.visiblePhoneEndpoints || []).length : 0) + " / " + (plan.visiblePhoneEndpoints || []).length;
      var towerIds = [];
      endpointStates.forEach(function (endpoint) {
        if (active && endpoint.radioState.servingTowerId && towerIds.indexOf(endpoint.radioState.servingTowerId) < 0) towerIds.push(endpoint.radioState.servingTowerId);
      });
      towerIds.sort();
      if (ui.servingCell) ui.servingCell.textContent = active
        ? (towerIds.length === 1 ? towerIds[0] : (towerIds.length ? towerIds.join(" / ") : "Wird ermittelt"))
        : "–";
      var referenceTowerId = (plan.references || {}).arenaTowerReferenceId;
      var arenaCell = referenceTowerId ? cellLoadRuntime.getCell(referenceTowerId) : null;
      if (ui.cellLoad) ui.cellLoad.textContent = active && arenaCell ? Math.round(arenaCell.currentLoad) + " %" : "–";
      if (ui.button) {
        ui.button.textContent = ownerMissionId ? "Mission 002 aktiv" : (active ? (plan.dashboard || {}).stopLabel : (plan.dashboard || {}).startLabel);
        ui.button.classList.toggle("active", active);
        ui.button.disabled = state === "FAILED" || !!ownerMissionId || (!active && !canActivate(null));
      }
      if (ui.container) ui.container.dataset.arenaEventState = state.toLowerCase();
    }

    function fail(message) {
      if (failed) return;
      failed = true;
      state = "FAILED";
      clearContributions();
      renderer.setVisible(false);
      if (connectivityRuntime && typeof connectivityRuntime.setVisible === "function") connectivityRuntime.setVisible(false);
      console.error("MISSION BOS ARENA EVENT FOUNDATION FAILED: " + message);
      updateUi();
    }

    function runSafetyCheck(initial) {
      var next = emptySafety();
      var rendererSafety = renderer && typeof renderer.getSafetyStatus === "function"
        ? renderer.getSafetyStatus() : null;
      var cellLoadSafety = getCellLoadSafety();
      if (!validation || validation.status !== "PASSED" || towerRecords.length !== 5 ||
          !rendererSafety || rendererSafety.status !== "PASSED") {
        next.dependencyErrors += 1;
        next.errors.push("One or more structural arena event dependencies are not safe.");
      }
      if (!cellLoadSafety) {
        next.dependencyErrors += 1;
        next.errors.push("Cell-load runtime safety is unavailable.");
      } else if (cellLoadSafety.fatal === true) {
        next.dependencyErrors += 1;
        next.errors.push("Cell-load runtime reported a fatal error.");
      } else if (cellLoadSafety.status !== "PASSED") {
        next.recoverableWarnings += 1;
        next.warnings.push("Cell-load runtime reported a recoverable association warning.");
      }
      if (sourceSignature(options) !== source) {
        next.sourceMutationErrors += 1;
        next.errors.push("A frozen arena event source changed during runtime.");
      }
      if (countForbiddenServingTowerKeys(plan) !== 0) {
        next.fixedServingTowerErrors += 1;
        next.errors.push("A fixed serving-tower definition was detected.");
      }
      var actorManifest = renderer.getManifest();
      if (!actorManifest || actorManifest.status !== "PASSED" || actorManifest.actual.crowdActors !== 12) {
        next.duplicateCrowdErrors += 1;
        next.errors.push("Arena crowd manifest is invalid.");
      }
      var visibleSum = 0;
      var aggregateSum = 0;
      endpointStates.forEach(function (endpoint) {
        if (endpoint.kind === "visible-phone") visibleSum += endpoint.demandUnits;
        else aggregateSum += endpoint.demandUnits;
        if (state === "ACTIVE") {
          if (!finitePosition(endpoint.position)) {
            if (endpoint.kind === "visible-phone") next.phoneReferenceErrors += 1;
            else next.actorReferenceErrors += 1;
            next.errors.push("Arena endpoint position is invalid: " + endpoint.id);
          }
          if (!endpoint.radioState.servingTowerId || !towersById[endpoint.radioState.servingTowerId]) {
            next.unknownTowerErrors += 1;
            next.errors.push("Arena endpoint has no known serving cell: " + endpoint.id);
          }
          if (!isFinite(Number(endpoint.radioState.servingScore))) {
            next.invalidRadioErrors += 1;
            next.errors.push("Arena endpoint has an invalid radio score: " + endpoint.id);
          }
        }
      });
      if (visibleSum !== Number((plan.loadCalibration || {}).visiblePhoneDemandUnits)) {
        next.visibleDemandErrors += 1;
        next.errors.push("Visible arena demand sum is invalid.");
      }
      if (aggregateSum !== Number((plan.loadCalibration || {}).aggregateDemandUnits)) {
        next.aggregateDemandErrors += 1;
        next.errors.push("Aggregate arena demand sum is invalid.");
      }
      cellLoadRuntime.getAllCells().forEach(function (cell) {
        if (!isFinite(Number(cell.currentLoad)) || cell.currentLoad < 0 || cell.currentLoad > 100) {
          next.cellLoadRangeErrors += 1;
          next.errors.push("Cell load outside 0..100: " + cell.towerId);
        }
      });
      if (state === "ACTIVE") {
        var activeMissionId = getActiveMissionId();
        var missionOwned = ownerMissionId === "MISSION_002";
        var invalidActiveMission = missionOwned ? (activeMissionId && activeMissionId !== "MISSION_002") : !!activeMissionId;
        var invalidBos = missionOwned ? false : isBosActive() === true;
        if (getMissionState() !== "READY" || invalidActiveMission ||
            (ambulanceFoundationRuntime.isActive && ambulanceFoundationRuntime.isActive()) ||
            invalidBos || isManualLoadActive() === true) {
          next.missionStartDuringEventErrors += 1;
          next.errors.push("A blocked action became active during the arena event.");
        }
      } else if (state === "INACTIVE") {
        var remaining = Object.keys(lastVisibleContributions).reduce(function (sum, key) {
          return sum + finite(lastVisibleContributions[key], 0);
        }, 0) + Object.keys(lastAggregateContributions).reduce(function (sum, key) {
          return sum + finite(lastAggregateContributions[key], 0);
        }, 0);
        if (remaining !== 0) {
          next.remainingLoadErrors += 1;
          next.errors.push("Arena dynamic-load sources were not fully cleared.");
        }
        if (connectivityRuntime && connectivityRuntime.getSafetyStatus && connectivityRuntime.getSafetyStatus().status !== "PASSED") {
          next.remainingLineErrors += 1;
          next.errors.push("Arena connectivity runtime is not safe after deactivation.");
        }
      }
      if (automaticEventStarts !== 0 || automaticMissionStarts !== 0 || automaticBOSActivations !== 0) {
        next.automaticActionErrors += 1;
        next.errors.push("An automatic action was detected.");
      }
      if (next.errors.length) {
        next.status = "FAILED";
        next.failed = true;
        next.fatal = true;
        safety = next;
        if (!failed) fail(next.errors[0]);
      } else {
        next.status = "PASSED";
        next.failed = false;
        next.fatal = false;
        safety = next;
      }
      if (initial || safety.failed) logSafety(safety);
    }

    function update(delta, elapsed, runtimeState) {
      if (disposed || failed) return;
      var safeDelta = Math.max(0, Math.min(finite(delta, 0), 0.25));
      currentTime = finite(elapsed, currentTime + safeDelta);
      evaluationAccumulator += safeDelta;
      safetyAccumulator += safeDelta;
      if (state === "ACTIVE") evaluateAssociations(false);
      if (connectivityRuntime && typeof connectivityRuntime.setVisible === "function") {
        connectivityRuntime.setVisible(state === "ACTIVE");
      }
      if (safetyAccumulator + EPSILON >= SAFETY_INTERVAL_SECONDS) {
        safetyAccumulator %= SAFETY_INTERVAL_SECONDS;
        runSafetyCheck(false);
      }
      updateUi();
    }

    function reset() {
      if (disposed || ownerMissionId) return false;
      if (state === "ACTIVE") deactivate();
      else {
        clearContributions();
        renderer.reset();
        if (connectivityRuntime && typeof connectivityRuntime.reset === "function") connectivityRuntime.reset();
        resetRadioStates();
        state = failed ? "FAILED" : "INACTIVE";
        updateUi();
      }
      return !failed;
    }

    function setConnectivityRuntime(runtime) {
      if (!runtime || typeof runtime.setVisible !== "function" || typeof runtime.reset !== "function" ||
          typeof runtime.getSafetyStatus !== "function") return false;
      connectivityRuntime = runtime;
      connectivityRuntime.setVisible(state === "ACTIVE");
      return true;
    }

    function dispose() {
      if (disposed) return;
      clearContributions();
      renderer.setVisible(false);
      if (ui.button && typeof ui.button.removeEventListener === "function") ui.button.removeEventListener("click", buttonHandler);
      disposed = true;
    }

    updateUi();
    runSafetyCheck(true);

    return {
      validation: validation,
      activate: activate,
      activateForMission: activateForMission,
      deactivate: deactivate,
      deactivateForMission: deactivateForMission,
      toggle: toggle,
      update: update,
      reset: reset,
      isActive: function () { return state === "ACTIVE"; },
      getState: function () { return state; },
      getOwnerMissionId: function () { return ownerMissionId; },
      getAssociation: function (endpointId) { return associationSnapshot(endpointsById[endpointId]); },
      getServingTowerId: function (endpointId) {
        var endpoint = endpointsById[endpointId];
        return state === "ACTIVE" && endpoint ? endpoint.radioState.servingTowerId : null;
      },
      getAllAssociations: function () { return endpointStates.map(associationSnapshot); },
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      setConnectivityRuntime: setConnectivityRuntime,
      dispose: dispose
    };
  }

  window.MissionBosArenaEventController = { create: create };
})();
