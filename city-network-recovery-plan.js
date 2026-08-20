/* Mission BOS - Build 011N.3R.1
   Frozen recovery contract. Clean rebuild on Build 011N.2 only.
   No modules. No fetch. No runtime randomization.
*/
(function () {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  window.MISSION_BOS_NETWORK_RECOVERY_PLAN = deepFreeze({
    schemaVersion: "1.0",
    project: "Mission BOS - Connected Response",
    build: "011N.3R.1",
    title: "Clean Recovery: Permanent BOS Connectivity and Continuous Bidirectional Communication",
    sourceBuild: "Mission-BOS-Build-011N.2",
    rejectedBuild: "Mission-BOS-Build-011N.3",
    cleanRebuildRequired: true,

    policy: {
      useRejectedBuildAsSourceAllowed: false,
      cityGeometryChangesAllowed: false,
      routeChangesAllowed: false,
      missionStoryChangesAllowed: false,
      newMissionAllowed: false,
      newCommunicationTypeAllowed: false,
      fixedServingTowerAllowed: false,
      runtimeRandomizationAllowed: false,
      manualBosActivationAllowed: false,
      rendererMayGateMissionCompletion: false,
      fileProtocolRequired: true
    },

    permanentBosConnectivity: {
      endpointIds: ["NET_FIRE_01", "NET_POLICE_01", "NET_AMBULANCE_01"],
      associationMode: "always",
      standbyAssociationAddsFullMissionDemand: false,
      priorityEligibilityRemainsMissionScoped: true,
      standbyConnectivityVisibleWithoutMission: true,
      backhaul: {
        mission001ControlBuildingId: "B01",
        ambulanceBaseBuildingId: "G02",
        maximumMission001BackhaulPaths: 2,
        sharedServingCellUsesSingleBackhaul: true
      }
    },

    visualStateMachine: {
      standbyConnected: {
        id: "STANDBY_CONNECTED",
        lineColor: "#9BDFFF",
        lineOpacity: 0.46,
        glowColor: "#9BDFFF",
        glowOpacity: 0.11,
        packetColor: "#B9E6FF",
        packetOpacity: 0.70,
        packetCyclesPerSecond: 0.25,
        packetsPerDirection: 2,
        towerPriorityLaneVisible: false,
        dashboardBosBadgeVisible: false
      },
      priorityActive: {
        id: "PRIORITY_ACTIVE",
        lineColor: "#0066CC",
        lineOpacity: 0.88,
        glowColor: "#0066CC",
        glowOpacity: 0.21,
        packetColor: "#E20074",
        packetOpacity: 0.95,
        packetCyclesPerSecond: 0.95,
        packetsPerDirection: 2,
        towerPriorityLaneVisible: true,
        dashboardBosBadgeVisible: true
      },
      priorityHold: {
        id: "PRIORITY_HOLD",
        minimumLoadInclusive: 85,
        maximumLoadExclusive: 90,
        preservePriorityVisuals: true
      },
      releasedConnected: {
        id: "RELEASED_CONNECTED",
        returnsTo: "STANDBY_CONNECTED",
        connectionRemainsVisible: true
      }
    },

    priorityLifecycle: {
      activationThreshold: 90,
      activationDelaySeconds: 0.6,
      releaseThreshold: 85,
      releaseDelaySeconds: 1.5,
      noPriorityWithoutMissionEligibleBos: true,
      noMagentaWithoutActivePriority: true
    },

    packetAnimation: {
      clock: "global-render-elapsed",
      updateFrequency: "every-render-frame",
      handoverDecisionIntervalUnchanged: true,
      packetsPerPath: 4,
      forwardPackets: 2,
      reversePackets: 2,
      preservePhaseAcrossStyleChange: true,
      preservePhaseAcrossMissionStateChange: true,
      preservePhaseAcrossHandover: true,
      hideStalePathImmediately: true,
      sharedPacketMeshesAcrossPathsAllowed: false,
      missionStateElapsedAllowedAsClock: false
    },

    mission001CommunicationChain: {
      endpointIds: ["NET_FIRE_01", "NET_POLICE_01"],
      controlBuildingId: "B01",
      mobileToCellBidirectional: true,
      cellToControlBidirectional: true,
      activePriorityMustAnimateAllSegments: true,
      commonCellUsesSingleControlPath: true,
      maximumControlPaths: 2
    },

    ambulanceCommunicationChain: {
      endpointId: "NET_AMBULANCE_01",
      baseBuildingId: "G02",
      mobileToCellBidirectional: true,
      cellToBaseBidirectional: true,
      permanentlyVisible: true
    },

    saturation: {
      deterministic: true,
      cycleSeconds: 8,
      mission001: {
        enabledStates: ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "COMPLETED"],
        disabledStates: ["READY", "CALL_RECEIVED", "CLEARING_CORRIDOR", "DISPATCHING", "ENROUTE", "RETURNING", "FAILED"],
        minimumLoad: 98,
        maximumLoad: 100
      },
      mission002: {
        eventWithoutBosMinimumLoad: 96,
        eventWithBosMinimumLoad: 98,
        maximumLoad: 100,
        noPriorityWithoutBosEndpoint: true
      },
      sourceOfTruth: "cell-currentLoad",
      stopImmediatelyOnReturning: true,
      randomValuesAllowed: false
    },

    visibility: {
      civilianDefaultOpacity: 0.075,
      civilianLoadedOpacity: 0.14,
      civilianDeprioritizedOpacity: 0.18,
      activeBosMustRemainMostVisible: true,
      civilianPermanentGlowAllowed: false
    },

    dashboardSeverity: {
      rows: 5,
      thresholds: [
        { id: "NORMAL", minimum: 0, maximum: 54.999, color: "#1E9E55" },
        { id: "HIGH", minimum: 55, maximum: 74.999, color: "#D6A400" },
        { id: "VERY_HIGH", minimum: 75, maximum: 89.999, color: "#E67E22" },
        { id: "OVERLOADED", minimum: 90, maximum: 100, color: "#D63031" }
      ],
      overloadedCellRemainsRedWhenPriorityActive: true,
      activePriorityAddsBlueBadge: true,
      newPanelAllowed: false,
      dashboardWidthChangeAllowed: false
    },

    missionCompletion: {
      mission001MustReachCompleted: true,
      mission001MustReachReturning: true,
      mission001MustReturnToReady: true,
      saturationAllowedInReturning: false,
      rendererVisibilityMayBlockCompletion: false,
      rendererPacketProgressMayBlockCompletion: false,
      immediateReplayRequired: true
    },

    regression: {
      mission001Required: true,
      mission002Required: true,
      sequence: ["MISSION_001", "RESET", "MISSION_002", "RESET", "MISSION_001"],
      idleConnectivityObservationSeconds: 60,
      stabilityTestMinutes: 20,
      ambulanceHealthHandoverMustRemain: true,
      mission002ActivePriorityIsGoldenReference: true
    },

    expectedCounts: {
      permanentBosEndpoints: 3,
      mission001BosEndpoints: 2,
      ambulanceEndpoints: 1,
      dashboardRows: 5,
      packetsPerBosPath: 4,
      packetDirections: 2,
      fixedServingTowerDefinitions: 0,
      randomSaturationSources: 0
    }
  });
})();
