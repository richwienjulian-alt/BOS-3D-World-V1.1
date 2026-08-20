/* Mission BOS - Build 013M.11 Preparation
   Frozen contract for cross-mission readiness and persistent customer network telemetry. */
(function () {
  "use strict";
  window.MISSION_BOS_013M11_RECOVERABLE_WARNING_CONTRACT = Object.freeze({
    buildId: "Mission-BOS-Build-013M.11",
    sourceBuildId: "Mission-BOS-Build-013M.10",
    mission002: Object.freeze({
      recoverableDependencyPolicy: "ALLOW_NON_FATAL_CELL_LOAD_AND_CAPACITY_WARNINGS",
      fatalDependencyPolicy: "BLOCK_START",
      requiredSelectedMissionId: "MISSION_002",
      requiredAmbulanceState: "AT_STATION",
      requiresNoActiveMission: true,
      requiresArenaInactive: true,
      requiresAmbulanceFoundationInactive: true,
      requiresSharedNetworkStartReady: true
    }),
    networkReadiness: Object.freeze({
      maximumBaseLoadDeviation: 4,
      validatedMissionActiveMustBeFalse: true,
      validatedMissionResettingMustBeFalse: true,
      manualLoadActiveMustBeFalse: true,
      legacyMissionLoadActiveMustBeFalse: true,
      bosPriorityActiveMustBeFalse: true,
      mission004MayReportReadyOnlyAfterSharedNetworkStartReady: true
    }),
    dashboard: Object.freeze({
      customerNetworkSectionPersistent: true,
      hideOnRecoverableWarning: false,
      hideOnFatalWarning: false,
      useLiveSnapshotWhenFatalFalse: true,
      retainLastKnownGoodSnapshotAsFallback: true,
      fatalFallbackLabel: "Netzdaten werden geprüft"
    }),
    protected: Object.freeze({
      mission004OperationalSequence: true,
      mission004AmbulanceRoute: true,
      mission003And004OutboundSequencing: true,
      customerDashboardLayout: true,
      cellLoadMath: true,
      associationAlgorithm: true,
      automaticBosPriorityAlgorithm: true
    })
  });
})();
