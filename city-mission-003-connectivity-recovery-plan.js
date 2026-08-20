/* Mission BOS - Build 012M.4 preparation
   Frozen recovery contract for Mission 003 operational connectivity.
   Copy unchanged into the implementation build.
*/
(function () {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  window.MISSION_BOS_MISSION_003_CONNECTIVITY_RECOVERY_PLAN = deepFreeze({
    schemaVersion: "1.0",
    project: "Mission BOS - Connected Response",
    build: "012M.4",
    sourceBuild: "Mission-BOS-Build-012M.3",
    title: "Mission 003 Connectivity Lifecycle Recovery",

    policy: {
      cityGeometryChangesAllowed: false,
      routeChangesAllowed: false,
      mission001ChangesAllowed: false,
      mission002ChangesAllowed: false,
      fixedServingTowerAllowed: false,
      duplicateOperationalPathAllowed: false,
      visualRuntimeMayGateMissionCompletion: false,
      recoverableSafetyMayFreezeAssociation: false,
      recoverableSafetyMayFreezeCellLoad: false,
      directVehicleRenderAnchorsRequired: true,
      worldOcclusionRequired: true
    },

    operationalEndpoints: [
      {
        endpointId: "NET_FIRE_01",
        vehicleId: "RESPONSE_FIRE_01",
        channel: "BOS",
        permanentConnection: true,
        directAnchorSource: "responseRuntime.vehiclesById.RESPONSE_FIRE_01.mesh",
        mission003PriorityEligible: true,
        backhaulBuildingId: "B01"
      },
      {
        endpointId: "NET_POLICE_01",
        vehicleId: "RESPONSE_POLICE_01",
        channel: "BOS",
        permanentConnection: true,
        directAnchorSource: "responseRuntime.vehiclesById.RESPONSE_POLICE_01.mesh",
        mission003PriorityEligible: true,
        backhaulBuildingId: "B01"
      },
      {
        endpointId: "NET_AMBULANCE_01",
        vehicleId: "AMBULANCE_01",
        channel: "BOS",
        permanentConnection: true,
        directAnchorSource: "ambulanceRuntime.getCommsPosition",
        mission003PriorityEligible: false,
        backhaulBuildingId: "G02"
      },
      {
        endpointId: "NET_STADTWERKE_01",
        vehicleId: "STADTWERKE_01",
        channel: "UTILITY",
        permanentConnection: true,
        directAnchorSource: "stadtwerkeRuntime.getCommsPosition",
        mission003PriorityEligible: true,
        missionScopedPriorityOnly: true,
        backhaulBuildingId: null
      }
    ],

    mission003Priority: {
      endpointIds: ["NET_FIRE_01", "NET_POLICE_01", "NET_STADTWERKE_01"],
      validMissionId: "MISSION_003",
      validStates: [
        "ON_SCENE", "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE",
        "COMMS_STABLE", "WATER_ISOLATED", "REPAIRING", "COMPLETED", "RETURNING"
      ],
      activationThresholdPercent: 90,
      releaseThresholdPercent: 85,
      preserveExistingReleaseDelay: true,
      servingCellSource: "dynamic-association-runtime",
      fixedServingTowerDefinitions: 0,
      priorityMayTriggerHandover: false,
      utilityPriorityOutsideMission003: false
    },

    visualLifecycle: {
      standbyStyle: "LIGHT_BLUE_BIDIRECTIONAL",
      priorityStyle: "BLUE_CORE_MAGENTA_BIDIRECTIONAL_PACKETS",
      packetsPerPath: 4,
      forwardPacketsPerPath: 2,
      reversePacketsPerPath: 2,
      anchorUpdateFrequency: "EVERY_RENDER_FRAME",
      associationEvaluationCadencePreserved: true,
      packetPhasePreservedAcrossStyleChange: true,
      packetPhasePreservedAcrossHandover: true,
      packetPhasePreservedAcrossMissionStateChange: true,
      returnPathMustFollowVehicle: true,
      standbyConnectionAfterReturn: true,
      staleScenePathAllowed: false,
      depthTest: true,
      depthWrite: false
    },

    failSoftRuntime: {
      fatalConditions: [
        "MISSING_REQUIRED_DEPENDENCY",
        "INVALID_FROZEN_PLAN",
        "INVALID_TOWER_REFERENCE",
        "NON_FINITE_LOAD_VALUE",
        "DESTROYED_RUNTIME_STRUCTURE"
      ],
      recoverableConditions: [
        "TRANSIENT_ENDPOINT_POSITION_UNAVAILABLE",
        "TRANSIENT_SERVING_CELL_UNAVAILABLE",
        "HANDOVER_IN_PROGRESS",
        "MISSION_PARTICIPANT_VISIBILITY_CHANGE",
        "VEHICLE_STATE_TRANSITION"
      ],
      recoverableConditionStopsGlobalUpdate: false,
      retryRecoverableConditionNextFrame: true,
      unrelatedEndpointsContinueUpdating: true,
      loadReleaseContinuesDuringWarning: true
    },

    returnAndCompletion: {
      returningState: "RETURNING",
      disableSaturationImmediately: true,
      keepVehiclePathsVisible: true,
      keepVehiclePathsLive: true,
      priorityReleaseUsesThreshold: true,
      requiredReleaseThresholdPercent: 85,
      readyMaximumNetworkLoadPercent: 55,
      requireAllVehiclesAtBase: true,
      requireNoActivePriority: true,
      rendererStateMayBlockReady: false,
      expectedFinalState: "READY"
    },

    ownership: {
      unifiedRuntimeOwnsOperationalVehiclePaths: true,
      mission003RendererOwnsCivilianPathsOnly: true,
      backhaulRuntimeOwnsCellToBasePaths: true,
      legacyAmbulanceRuntimeActive: false,
      separateUtilityVehicleConnectivityRuntimeActive: false
    },

    expected: {
      operationalEndpoints: 4,
      mission003ResponseEndpoints: 3,
      mission003PriorityEndpoints: 3,
      permanentOperationalPaths: 4,
      packetsPerPath: 4,
      totalOperationalPackets: 16,
      mission003ForwardPackets: 6,
      mission003ReversePackets: 6,
      fixedServingTowerDefinitions: 0,
      duplicateOperationalPaths: 0,
      stalePathsAfterReturn: 0
    }
  });
})();
