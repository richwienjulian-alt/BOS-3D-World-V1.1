/* Mission BOS - Build 011N.3R.1
   Recovery-compatible Mission 001 network continuity contract.
   No modules. No fetch. No runtime randomization.
*/
(function () {
  "use strict";
  window.MISSION_BOS_MISSION_001_NETWORK_POLISH_PLAN = Object.freeze({
    schemaVersion: "1.1",
    project: "Mission BOS – Connected Response",
    sourceBuild: "Mission-BOS-Build-011N.2",
    phase: "011N.3R.1 Clean Network Recovery",
    policy: {
      cityGeometryChangesAllowed: false,
      routeChangesAllowed: false,
      missionIncidentChangesAllowed: false,
      dashboardRedesignAllowed: false,
      mission002BehaviorChangesAllowed: false,
      fixedServingTowerAllowed: false,
      manualBosActivationAllowed: false,
      fullPhysicalRadioPlanningClaimed: false,
      visualizationIsSimplifiedAndSymbolic: true
    },
    realtimeAnchoring: {
      endpointPositionRefresh: "every-render-frame",
      handoverDecisionIntervalSeconds: 0.25,
      handoverDecisionTimingMustRemainUnchanged: true,
      associationSnapshotMustExposeLivePosition: true,
      renderersMustNotUseQuarterSecondStalePositions: true,
      interpolationLagAllowed: false,
      directVisibleMeshAnchorRequired: true
    },
    priorityLifecycle: {
      activationThresholdPercent: 90,
      activationDelaySeconds: 0.6,
      releaseThresholdPercent: 85,
      releaseDelaySeconds: 1.5,
      requiresBosEndpointInCell: true,
      followsConfirmedServingCell: true,
      resetClearsImmediately: true,
      noPriorityAtDepartureBelowActivationThreshold: true,
      noPriorityLatchAfterRelease: true
    },
    bosVisualLanguage: {
      prePriority: {
        lineColor: "#9BDFFF",
        glowColor: "#9BDFFF",
        lineOpacity: 0.46,
        glowOpacity: 0.11,
        packetColor: "#B9E6FF",
        packetOpacity: 0.70,
        packetCyclesPerSecond: 0.25,
        packetCountPerVisiblePath: 4,
        packetsPerDirection: 2,
        magentaPacketsVisible: false,
        meaning: "Dauerhafte normale BOS-Funkverbindung ohne aktive Priorisierung"
      },
      activePriority: {
        lineColor: "#0066CC",
        highlightColor: "#4DB3FF",
        packetColor: "#E20074",
        lineOpacity: 0.88,
        glowOpacity: 0.21,
        packetOpacity: 0.95,
        packetCyclesPerSecond: 0.95,
        packetCountPerVisiblePath: 4,
        packetsPerDirection: 2,
        meaning: "Aktive BOS-Priorisierung mit bidirektionaler Ende-zu-Ende-Kommunikation"
      }
    },
    towerIndicator: {
      activationVisibleAtOrAbovePercent: 90,
      prioritySegmentStartPercent: 85,
      prioritySegmentColor: "#0066CC",
      prioritySegmentOnlyOnActiveBosCell: true,
      centerLaneOnlyOnActiveBosCell: true,
      noBlueOnCellsWithoutActiveBos: true,
      removeAllBlueBelowReleaseThreshold: true,
      keepNormalLoadColorsOnNonBosCells: true
    },
    mission001Backhaul: {
      controlBuildingId: "B01",
      controlLabel: "Leitstelle BOS",
      bosEndpointIds: ["NET_FIRE_01", "NET_POLICE_01"],
      uniqueServingTowerLinks: true,
      followConfirmedServingCell: true,
      permanentlyVisible: true,
      visibleDuringMission: true,
      priorityStyleFollowsCellPriority: true,
      prePriorityUsesConnectedStyle: true,
      activePriorityUsesBlueLineAndMagentaPackets: true
    },
    ambulanceStandbyConnectivity: {
      endpointId: "NET_AMBULANCE_01",
      vehicleId: "AMBULANCE_01",
      baseBuildingId: "G02",
      baseLabel: "Rettungswache",
      associationActiveMode: "always",
      vehicleToServingTowerAlwaysVisible: true,
      baseToServingTowerAlwaysVisible: true,
      followConfirmedServingCell: true,
      prePriorityUsesConnectedStyle: true,
      activePriorityUsesBlueLineAndMagentaPackets: true,
      noPriorityLatchAfterRelease: true
    },
    permanentBosConnectivity: {
      endpointIds: ["NET_FIRE_01", "NET_POLICE_01", "NET_AMBULANCE_01"],
      associationActiveMode: "always",
      priorityEligibilityRemainsMissionScoped: true,
      standbyAddsFullMissionDemand: false
    },
    expected: {
      mission001BackhaulLogicalEndpoints: 1,
      ambulanceBaseLogicalEndpoints: 1,
      mission001BosEndpoints: 2,
      alwaysAssociatedBosEndpoints: 3,
      alwaysAssociatedAmbulances: 1,
      packetsPerBosPath: 4,
      packetDirections: 2,
      fixedServingTowerDefinitions: 0,
      activationThresholdPercent: 90,
      releaseThresholdPercent: 85
    }
  });
})();
