/* Mission BOS - Build 012M.3 preparation
   Frozen Mission 003 end-to-end connectivity parity contract.
*/
(function () {
  "use strict";
  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }
  window.MISSION_BOS_MISSION_003_CONNECTIVITY_PARITY_PLAN = deepFreeze({
    schemaVersion: "1.0",
    project: "Mission BOS - Connected Response",
    build: "012M.3",
    sourceBuild: "Mission-BOS-Build-012M.2",
    title: "Mission 003 Operational Connectivity Parity",
    requiredOperationalEndpoints: ["NET_FIRE_01", "NET_POLICE_01", "NET_STADTWERKE_01"],
    protectedReferenceEndpoint: "NET_AMBULANCE_01",
    priorityEligibleEndpoints: ["NET_FIRE_01", "NET_POLICE_01"],
    priorityForbiddenEndpoints: ["NET_STADTWERKE_01"],
    permanentEndpointIds: ["NET_FIRE_01", "NET_POLICE_01", "NET_AMBULANCE_01", "NET_STADTWERKE_01"],
    mission003StatesRequiringVisibleOperationalLinks: [
      "READY", "CALL_RECEIVED", "ALARMING", "CLEARING_CORRIDOR", "ENROUTE", "ON_SCENE",
      "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "WATER_ISOLATED",
      "REPAIRING", "COMPLETED", "RETURNING"
    ],
    visualContract: {
      sameFactoryForAllOperationalVehicles: true,
      samePacketGeometryForAllOperationalVehicles: true,
      packetsPerPath: 4,
      forwardPackets: 2,
      reversePackets: 2,
      updateEveryRenderFrame: true,
      depthTest: true,
      depthWrite: false,
      handoverUsesConfirmedServingCell: true,
      noMissionSpecificDuplicatePaths: true,
      noStaleObjectsAfterHandover: true
    },
    mission003Contract: {
      fireAndPolicePriorityStyleMatchesMission002Reference: true,
      utilityStandbyStyleMatchesOperationalStandbyReference: true,
      utilityPriorityMustRemainFalse: true,
      fireAndPoliceBackhaulToB01Visible: true,
      utilityVehicleToCellVisibleWithoutMission: true,
      mission003CivilianRendererUtilityPaths: 0,
      mission003CivilianRendererCivilianPaths: 6
    },
    runtimeAcceptance: {
      unifiedManifestEndpoints: 4,
      unifiedManifestPaths: 4,
      unifiedManifestPackets: 16,
      requiredVisiblePacketsPerOperationalPath: 4,
      requiredForwardPacketsPerOperationalPath: 2,
      requiredReversePacketsPerOperationalPath: 2,
      maximumDuplicateOperationalPaths: 0,
      maximumUtilityPriorityPaths: 0,
      fixedServingTowerDefinitions: 0
    }
  });
})();
