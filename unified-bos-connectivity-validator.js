/* Mission BOS - Build 012M.4
   Structural validator for the unified operational-vehicle connectivity contract.
*/
(function () {
  "use strict";

  function add(result, key, message) {
    result[key] += 1;
    result.errors.push(message);
  }

  function sameNumbers(actual, expected) {
    if (!Array.isArray(actual) || actual.length !== expected.length) return false;
    for (var i = 0; i < expected.length; i += 1) {
      if (Number(actual[i]) !== Number(expected[i])) return false;
    }
    return true;
  }

  function sameStrings(actual, expected) {
    return Array.isArray(actual) && actual.join("|") === expected.join("|");
  }

  function containsFixedTower(value, path, result) {
    if (!value || typeof value !== "object") return;
    Object.keys(value).forEach(function (key) {
      var lower = String(key).toLowerCase();
      var next = path ? path + "." + key : key;
      if (lower === "servingtowerid" || lower === "fixedtowerid" ||
          lower === "fixedservingtowerid" || lower === "fixedcellid") {
        add(result, "fixedTowerErrors", "Forbidden fixed-tower field: " + next);
      }
      containsFixedTower(value[key], next, result);
    });
  }

  function validate(plan) {
    var result = {
      title: "MISSION BOS UNIFIED OPERATIONAL CONNECTIVITY 012M.4 VALIDATION",
      dependencyErrors: 0,
      baselineErrors: 0,
      policyErrors: 0,
      implementationErrors: 0,
      endpointErrors: 0,
      packetErrors: 0,
      renderErrors: 0,
      priorityErrors: 0,
      mission003Errors: 0,
      backhaulErrors: 0,
      ownershipErrors: 0,
      expectedCountErrors: 0,
      fixedTowerErrors: 0,
      status: "PASSED",
      errors: []
    };

    if (!plan) {
      add(result, "dependencyErrors", "Unified operational connectivity plan is missing.");
      result.status = "FAILED";
      return result;
    }
    if (plan.sourceBuild !== "Mission-BOS-Build-012M.3" || plan.build !== "012M.4") {
      add(result, "baselineErrors", "Unexpected source build or target build.");
    }

    var policy = plan.policy || {};
    [
      "cityGeometryChangesAllowed", "routeChangesAllowed", "missionStateChangesAllowed",
      "associationAlgorithmChangesAllowed", "radioModelChangesAllowed", "cellLoadChangesAllowed",
      "capacityChangesAllowed", "priorityThresholdChangesAllowed", "fixedServingTowerAllowed",
      "duplicateVehiclePathsAllowed", "duplicateBackhaulPathsAllowed", "rendererMayGateMissionCompletion",
      "mission001VisualRegressionAllowed", "mission002VisualRegressionAllowed", "utilityMayUseBosPriority"
    ].forEach(function (key) {
      if (policy[key] !== false) add(result, "policyErrors", "Policy must be false: " + key);
    });

    var shared = plan.sharedImplementation || {};
    if (shared.visualFactoryGlobal !== "MissionBosBosLinkVisualFactory" ||
        shared.rendererGlobal !== "MissionBosUnifiedBosConnectivityRenderer" ||
        shared.singleOperationalVehicleRendererRuntime !== true ||
        shared.legacyAmbulanceRendererRuntimeAllowed !== false ||
        shared.telekomRendererMayOwnOperationalVehiclePaths !== false ||
        shared.mission003RendererMayOwnUtilityVehiclePath !== false ||
        shared.backhaulMustUseSameVisualFactory !== true ||
        shared.updateFrequency !== "every-render-frame" || shared.clock !== "global-render-elapsed") {
      add(result, "implementationErrors", "Shared implementation contract is invalid.");
    }

    var endpoints = plan.endpoints || [];
    var ids = endpoints.map(function (entry) { return entry && entry.endpointId; });
    var requiredIds = ["NET_FIRE_01", "NET_POLICE_01", "NET_AMBULANCE_01", "NET_STADTWERKE_01"];
    if (endpoints.length !== 4 || requiredIds.some(function (id) { return ids.indexOf(id) < 0; })) {
      add(result, "endpointErrors", "Exactly four operational vehicle endpoints are required.");
    }
    endpoints.forEach(function (entry) {
      if (!entry || entry.permanentAssociation !== true || !entry.directAnchorSource) {
        add(result, "endpointErrors", "Every operational vehicle endpoint must remain permanently associated and use a direct vehicle anchor.");
      }
    });
    var utility = endpoints.filter(function (entry) { return entry && entry.endpointId === "NET_STADTWERKE_01"; })[0];
    if (!utility || utility.channel !== "UTILITY" || utility.priorityEligible !== false || utility.backhaulBuildingId !== null ||
        utility.mission003PriorityEligible !== true || utility.missionScopedPriorityOnly !== true) {
      add(result, "endpointErrors", "Stadtwerke endpoint policy or mission-scoped priority contract is invalid.");
    }
    endpoints.filter(function (entry) { return entry && entry.channel === "BOS"; }).forEach(function (entry) {
      if (entry.priorityEligible !== true) add(result, "endpointErrors", "BOS endpoint is not priority eligible: " + entry.endpointId);
    });

    var packets = plan.packetContract || {};
    if (Number(packets.geometryRadius) !== 0.15 || Number(packets.geometryWidthSegments) !== 8 ||
        Number(packets.geometryHeightSegments) !== 6 || Number(packets.packetsPerPath) !== 4 ||
        Number(packets.forwardPackets) !== 2 || Number(packets.reversePackets) !== 2 ||
        !sameNumbers(packets.directions, [1, 1, -1, -1]) ||
        !sameNumbers(packets.offsets, [0, 0.5, 0.25, 0.75])) {
      add(result, "packetErrors", "Packet geometry, directions or counts are invalid.");
    }
    ["preservePhaseAcrossStyleChange", "preservePhaseAcrossMissionStateChange", "preservePhaseAcrossHandover",
      "stalePathHiddenImmediately", "packetsRemainAnimatedInStandby"].forEach(function (key) {
      if (packets[key] !== true) add(result, "packetErrors", "Packet rule must be true: " + key);
    });

    var render = plan.renderingContract || {};
    if (render.depthTest !== true || render.depthWrite !== false || render.buildingOcclusionRequired !== true ||
        render.alwaysOnTopAllowed !== false || Number(render.coreRenderOrder) !== 41 ||
        Number(render.glowRenderOrder) !== 40 || Number(render.packetRenderOrder) !== 42 ||
        render.liveVehicleAnchorEveryFrame !== true || render.liveTowerBeaconAnchorEveryFrame !== true ||
        render.frustumCulled !== false) {
      add(result, "renderErrors", "World-occluded render contract is invalid.");
    }

    var priority = plan.priorityContract || {};
    if (priority.source !== "cell-local-priority-runtime" || Number(priority.activationThresholdPercent) !== 90 ||
        Number(priority.releaseThresholdPercent) !== 85 || priority.endpointMustBePriorityEligible !== true ||
        priority.endpointMustBelongToActiveCellBosSet !== true || priority.noMagentaWithoutActivePriority !== true ||
        priority.noBluePriorityStyleWithoutActivePriority !== true || priority.utilityPriorityAlwaysFalse !== true ||
        priority.missionScopedUtilityPriorityAllowed !== true || priority.utilityPriorityOutsideMission003 !== false ||
        priority.priorityRuntimeIsSingleSourceOfTruth !== true || priority.standbyConnectionRemainsVisibleAfterRelease !== true) {
      add(result, "priorityErrors", "Priority contract is invalid.");
    }

    var mission003 = plan.mission003Contract || {};
    if (!sameStrings(mission003.responseEndpointIds, ["NET_FIRE_01", "NET_POLICE_01", "NET_STADTWERKE_01"]) ||
        !sameStrings(mission003.bosPriorityEndpointIds, ["NET_FIRE_01", "NET_POLICE_01"]) ||
        !sameStrings(mission003.mission003PriorityEndpointIds, ["NET_FIRE_01", "NET_POLICE_01", "NET_STADTWERKE_01"]) ||
        mission003.utilityEndpointId !== "NET_STADTWERKE_01" ||
        mission003.allResponsePathsVisibleInReady !== true || mission003.allResponsePathsVisibleDuringMission !== true ||
        mission003.allResponsePathsVisibleDuringReturn !== true ||
        mission003.firePoliceUseSamePriorityVisualAsAmbulance !== true ||
        mission003.utilityUsesSameStandbyVisualAsOtherOperationalVehicles !== true ||
        mission003.utilityRemainsNonBosDuringOverload !== true ||
        mission003.utilityUsesMissionScopedPriorityStyle !== true || mission003.utilityPriorityValidOnlyInMission003 !== true ||
        mission003.firePoliceBackhaulToB01Required !== true || mission003.utilityBackhaulRequired !== false) {
      add(result, "mission003Errors", "Mission 003 operational connectivity contract is invalid.");
    }

    var backhaul = plan.backhaulContract || {};
    if (backhaul.fireAndPoliceControlBuildingId !== "B01" || backhaul.ambulanceBaseBuildingId !== "G02" ||
        backhaul.deduplicateFireAndPoliceByServingCell !== true ||
        Number(backhaul.maximumFirePoliceBackhaulPaths) !== 2 || Number(backhaul.ambulanceBackhaulPaths) !== 1 ||
        Number(backhaul.utilityBackhaulPaths) !== 0 || backhaul.sameStandbyAndPriorityVisualsAsVehiclePaths !== true ||
        backhaul.depthTest !== true || backhaul.depthWrite !== false) {
      add(result, "backhaulErrors", "Backhaul contract is invalid.");
    }

    var ownership = plan.ownershipContract || {};
    if (ownership.telekomCommunicationRendererOwnsCivilianMission001LinksOnly !== true ||
        ownership.mission003ConnectivityRendererOwnsMission003CivilianLinksOnly !== true ||
        ownership.unifiedRendererOwnsAllOperationalVehicleToCellLinks !== true ||
        ownership.bosBackhaulRendererOwnsBosCellToBaseLinks !== true ||
        Number(ownership.activeLegacyAmbulanceConnectivityRuntimes) !== 0 ||
        Number(ownership.activeLegacyFirePoliceConnectivityRuntimes) !== 0 ||
        Number(ownership.activeSeparateUtilityConnectivityRuntimes) !== 0) {
      add(result, "ownershipErrors", "Renderer ownership contract is invalid.");
    }

    var expected = plan.expected || {};
    if (Number(expected.operationalVehicleEndpoints) !== 4 || Number(expected.bosVehicleEndpoints) !== 3 ||
        Number(expected.utilityVehicleEndpoints) !== 1 || Number(expected.operationalVehiclePaths) !== 4 ||
        Number(expected.packetsPerVehiclePath) !== 4 || Number(expected.totalVehiclePackets) !== 16 ||
        Number(expected.forwardPackets) !== 8 || Number(expected.reversePackets) !== 8 ||
        Number(expected.maximumBackhaulPaths) !== 3 || Number(expected.fixedServingTowerDefinitions) !== 0 ||
        Number(expected.duplicateVehiclePaths) !== 0 || Number(expected.alwaysOnTopOperationalMaterials) !== 0 ||
        Number(expected.utilityBosEndpoints) !== 0 || Number(expected.missionScopedUtilityPriorityEndpoints) !== 1 ||
        Number(expected.maximumUtilityPriorityPathsDuringMission003) !== 1 ||
        Number(expected.utilityPriorityPathsOutsideMission003) !== 0) {
      add(result, "expectedCountErrors", "Expected counts are invalid.");
    }

    containsFixedTower(plan, "unifiedOperationalConnectivityPlan", result);
    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }

  function logResult(result) {
    result = result || { title: "MISSION BOS UNIFIED OPERATIONAL CONNECTIVITY 012M.4 VALIDATION", status: "FAILED", errors: ["No result."] };
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    ["dependencyErrors", "baselineErrors", "policyErrors", "implementationErrors", "endpointErrors", "packetErrors",
      "renderErrors", "priorityErrors", "mission003Errors", "backhaulErrors", "ownershipErrors",
      "expectedCountErrors", "fixedTowerErrors"].forEach(function (key) {
      console[method](key + ": " + Number(result[key] || 0));
    });
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosUnifiedBosConnectivityValidator = { validate: validate, logResult: logResult };
})();
