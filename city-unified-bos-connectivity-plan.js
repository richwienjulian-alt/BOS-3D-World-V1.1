/* Mission BOS - Build 012M.4
   Frozen replacement contract for one shared operational-vehicle connectivity runtime.
   The compatibility global name remains unchanged so the existing app integration can be upgraded without parallel runtimes.
*/
(function () {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  window.MISSION_BOS_UNIFIED_BOS_CONNECTIVITY_PLAN = deepFreeze({
    schemaVersion: "1.1",
    project: "Mission BOS - Connected Response",
    build: "012M.4",
    sourceBuild: "Mission-BOS-Build-012M.3",
    title: "Unified Operational Vehicle Connectivity and Mission-Scoped Utility Priority",

    policy: {
      cityGeometryChangesAllowed: false,
      routeChangesAllowed: false,
      missionStateChangesAllowed: false,
      associationAlgorithmChangesAllowed: false,
      radioModelChangesAllowed: false,
      cellLoadChangesAllowed: false,
      capacityChangesAllowed: false,
      priorityThresholdChangesAllowed: false,
      fixedServingTowerAllowed: false,
      duplicateVehiclePathsAllowed: false,
      duplicateBackhaulPathsAllowed: false,
      rendererMayGateMissionCompletion: false,
      mission001VisualRegressionAllowed: false,
      mission002VisualRegressionAllowed: false,
      utilityMayUseBosPriority: false
    },

    sharedImplementation: {
      visualFactoryGlobal: "MissionBosBosLinkVisualFactory",
      rendererGlobal: "MissionBosUnifiedBosConnectivityRenderer",
      rendererFile: "city-unified-bos-connectivity-renderer.js",
      factoryFile: "city-bos-link-visual-factory.js",
      singleOperationalVehicleRendererRuntime: true,
      legacyAmbulanceRendererRuntimeAllowed: false,
      telekomRendererMayOwnOperationalVehiclePaths: false,
      mission003RendererMayOwnUtilityVehiclePath: false,
      backhaulMustUseSameVisualFactory: true,
      updateFrequency: "every-render-frame",
      clock: "global-render-elapsed"
    },

    endpoints: [
      {
        endpointId: "NET_FIRE_01",
        vehicleId: "RESPONSE_FIRE_01",
        role: "FIRE",
        channel: "BOS",
        priorityEligible: true,
        permanentAssociation: true,
        backhaulBuildingId: "B01",
        directAnchorSource: "responseRuntime.vehiclesById.RESPONSE_FIRE_01.mesh",
        vehicleAnchorYOffset: 1.35
      },
      {
        endpointId: "NET_POLICE_01",
        vehicleId: "RESPONSE_POLICE_01",
        role: "POLICE",
        channel: "BOS",
        priorityEligible: true,
        permanentAssociation: true,
        backhaulBuildingId: "B01",
        directAnchorSource: "responseRuntime.vehiclesById.RESPONSE_POLICE_01.mesh",
        vehicleAnchorYOffset: 1.35
      },
      {
        endpointId: "NET_AMBULANCE_01",
        vehicleId: "AMBULANCE_01",
        role: "AMBULANCE",
        channel: "BOS",
        priorityEligible: true,
        permanentAssociation: true,
        backhaulBuildingId: "G02",
        directAnchorSource: "ambulanceRuntime.getCommsPosition",
        vehicleAnchorYOffset: 0
      },
      {
        endpointId: "NET_STADTWERKE_01",
        vehicleId: "STADTWERKE_01",
        role: "UTILITY",
        channel: "UTILITY",
        priorityEligible: false,
        mission003PriorityEligible: true,
        missionScopedPriorityOnly: true,
        permanentAssociation: true,
        backhaulBuildingId: null,
        directAnchorSource: "stadtwerkeRuntime.getCommsPosition",
        vehicleAnchorYOffset: 0
      }
    ],

    visualReference: {
      sourceFile: "city-bos-link-visual-factory.js",
      sourceBuild: "Mission-BOS-Build-012M.3",
      standbyLineColor: "#9BDFFF",
      standbyPacketColor: "#B9E6FF",
      priorityLineColor: "#0066CC",
      priorityPacketColor: "#E20074",
      allOperationalVehiclesUseSameStandbyPrimitive: true,
      utilityNeverUsesPriorityStyle: true
    },

    packetContract: {
      geometryRadius: 0.15,
      geometryWidthSegments: 8,
      geometryHeightSegments: 6,
      packetsPerPath: 4,
      forwardPackets: 2,
      reversePackets: 2,
      directions: [1, 1, -1, -1],
      offsets: [0, 0.5, 0.25, 0.75],
      preservePhaseAcrossStyleChange: true,
      preservePhaseAcrossMissionStateChange: true,
      preservePhaseAcrossHandover: true,
      stalePathHiddenImmediately: true,
      packetsRemainAnimatedInStandby: true
    },

    renderingContract: {
      depthTest: true,
      depthWrite: false,
      buildingOcclusionRequired: true,
      alwaysOnTopAllowed: false,
      coreRenderOrder: 41,
      glowRenderOrder: 40,
      packetRenderOrder: 42,
      liveVehicleAnchorEveryFrame: true,
      liveTowerBeaconAnchorEveryFrame: true,
      frustumCulled: false
    },

    priorityContract: {
      source: "cell-local-priority-runtime",
      activationThresholdPercent: 90,
      releaseThresholdPercent: 85,
      endpointMustBePriorityEligible: true,
      endpointMustBelongToActiveCellBosSet: true,
      noMagentaWithoutActivePriority: true,
      noBluePriorityStyleWithoutActivePriority: true,
      utilityPriorityAlwaysFalse: true,
      missionScopedUtilityPriorityAllowed: true,
      utilityPriorityOutsideMission003: false,
      priorityRuntimeIsSingleSourceOfTruth: true,
      standbyConnectionRemainsVisibleAfterRelease: true
    },

    mission003Contract: {
      responseEndpointIds: ["NET_FIRE_01", "NET_POLICE_01", "NET_STADTWERKE_01"],
      bosPriorityEndpointIds: ["NET_FIRE_01", "NET_POLICE_01"],
      mission003PriorityEndpointIds: ["NET_FIRE_01", "NET_POLICE_01", "NET_STADTWERKE_01"],
      utilityEndpointId: "NET_STADTWERKE_01",
      allResponsePathsVisibleInReady: true,
      allResponsePathsVisibleDuringMission: true,
      allResponsePathsVisibleDuringReturn: true,
      firePoliceUseSamePriorityVisualAsAmbulance: true,
      utilityUsesSameStandbyVisualAsOtherOperationalVehicles: true,
      utilityRemainsNonBosDuringOverload: true,
      utilityUsesMissionScopedPriorityStyle: true,
      utilityPriorityValidOnlyInMission003: true,
      firePoliceBackhaulToB01Required: true,
      utilityBackhaulRequired: false
    },

    backhaulContract: {
      fireAndPoliceControlBuildingId: "B01",
      ambulanceBaseBuildingId: "G02",
      deduplicateFireAndPoliceByServingCell: true,
      maximumFirePoliceBackhaulPaths: 2,
      ambulanceBackhaulPaths: 1,
      utilityBackhaulPaths: 0,
      sameStandbyAndPriorityVisualsAsVehiclePaths: true,
      depthTest: true,
      depthWrite: false
    },

    ownershipContract: {
      telekomCommunicationRendererOwnsCivilianMission001LinksOnly: true,
      mission003ConnectivityRendererOwnsMission003CivilianLinksOnly: true,
      unifiedRendererOwnsAllOperationalVehicleToCellLinks: true,
      bosBackhaulRendererOwnsBosCellToBaseLinks: true,
      activeLegacyAmbulanceConnectivityRuntimes: 0,
      activeLegacyFirePoliceConnectivityRuntimes: 0,
      activeSeparateUtilityConnectivityRuntimes: 0
    },

    expected: {
      operationalVehicleEndpoints: 4,
      bosVehicleEndpoints: 3,
      utilityVehicleEndpoints: 1,
      operationalVehiclePaths: 4,
      packetsPerVehiclePath: 4,
      totalVehiclePackets: 16,
      forwardPackets: 8,
      reversePackets: 8,
      maximumBackhaulPaths: 3,
      fixedServingTowerDefinitions: 0,
      duplicateVehiclePaths: 0,
      alwaysOnTopOperationalMaterials: 0,
      utilityBosEndpoints: 0,
      missionScopedUtilityPriorityEndpoints: 1,
      maximumUtilityPriorityPathsDuringMission003: 1,
      utilityPriorityPathsOutsideMission003: 0
    }
  });
})();
