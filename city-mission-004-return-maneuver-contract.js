/* Mission BOS - Build 013M.7 preparation
   Frozen runtime correction contract for Mission 004 fire/police return maneuver.
*/
(function () {
  "use strict";
  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }
  window.MISSION_BOS_MISSION_004_RETURN_MANEUVER_CONTRACT = deepFreeze({
    schemaVersion: "1.0.0",
    build: "013M.7",
    sourceBuildRequired: "Mission-BOS-Build-013M.6",
    sourceArchiveSha256Required: "15a305fd6ea10cad70e39837ca45dda47240614afe5c4ff89bb849c4a4a3691e",
    regressionSourceScreenshot: "Mission 004 visible fire/police overlap during finish-and-return",
    protectedMissions: ["MISSION_001", "MISSION_002", "MISSION_003"],
    stagePositionsMustRemainUnchangedFrom013M4: true,
    fire: {
      vehicleId: "RESPONSE_FIRE_01",
      initialReturnDelaySeconds: 0.0,
      initialManeuver: "BACKOUT_WITH_OUTBOUND_HEADING",
      backoutDistanceMeters: 6.0,
      backoutSpeedMetersPerSecond: 2.0,
      keepOutboundHeadingDuringBackout: true,
      turnOnlyAfterBackout: true,
      clearanceGateId: "M004_FIRE_CLEARANCE_TURN_COMPLETE"
    },
    police: {
      vehicleId: "RESPONSE_POLICE_01",
      minimumReturnDelaySeconds: 4.0,
      waitForVehicleId: "RESPONSE_FIRE_01",
      waitForGateId: "M004_FIRE_CLEARANCE_TURN_COMPLETE",
      mayNotRotateBeforeGate: true
    },
    validation: {
      collisionSafetyMarginMeters: 0.05,
      maximumTimeStepSeconds: 0.01,
      validateIntermediateTurnAngles: true,
      validateBackoutTranslation: true,
      validateCompleteReturnRoute: true,
      responseResponseCollisionCountRequired: 0,
      runtimeSafetyStopAllowed: false,
      missionMustReachReturningAndThenResettable: true
    },
    protected013M4Behavior: {
      trafficNoCrossMustRemainPassed: true,
      ambulanceTriggeredEarlyOverloadMustRemainPassed: true,
      dynamicIncidentCellRequired: true,
      automaticBosPriorityRequired: true,
      fixedServingTowerAllowed: false
    }
  });
})();
