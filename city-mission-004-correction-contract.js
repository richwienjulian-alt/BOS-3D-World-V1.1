/* Mission BOS - Build 013M.4 preparation
   Frozen correction / acceptance contract. Copy unchanged into the implementation build.
*/
(function () {
  "use strict";
  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }
  window.MISSION_BOS_MISSION_004_CORRECTION_CONTRACT = deepFreeze({
    schemaVersion: "1.0.0",
    build: "013M.4",
    sourceBuildRequired: "Mission-BOS-Build-013M.3",
    sourceArchiveSha256Required: "03388ae6b1fde38a9bb622622afdc7434ba4fb648f3ba2f378c06c48e2bf975b",
    protectedMissions: ["MISSION_001", "MISSION_002", "MISSION_003"],
    traffic: {
      affectedVehicleIds: ["CAR_RING_01", "CAR_RING_02", "CAR_RING_03"],
      noVisibleIncidentCrossingRequired: true,
      noFullRingWrapRequired: true,
      continuousSweptFootprintValidationRequired: true,
      validationStepMaximum: 0.05,
      incidentExclusionDistanceRange: { min: 78.0, max: 88.0 },
      criticalApproachDistanceRange: { min: 30.5, max: 88.0 },
      downstreamClearAllowedOnlyAfterDistance: 88.0
    },
    returnSequence: {
      fireFirstRequired: true,
      fireVehicleId: "RESPONSE_FIRE_01",
      policeVehicleId: "RESPONSE_POLICE_01",
      configuredFireDelaySeconds: 0.0,
      configuredPoliceDelaySeconds: 1.5,
      referenceMinimumSafePoliceDelaySeconds: 1.05,
      acceptanceMinimumPoliceDelaySeconds: 1.1,
      satCollisionCountRequired: 0,
      collisionSafetyMargin: 0.05,
      validationStepSeconds: 0.01
    },
    network: {
      incidentCellMustBeDynamic: true,
      referenceTowerForPlausibilityOnly: "MAST_C",
      referenceTowerMayNotBeAssigned: true,
      preAmbulanceTargetRange: { min: 85, max: 89 },
      ambulanceArrivalTarget: 100,
      ambulanceArrivalDeadlineSeconds: 0.75,
      priorityActivationThreshold: 90,
      priorityActivationDelayReferenceSeconds: 0.6,
      priorityMustActivateAutomatically: true,
      fireMustArriveAfterOverload: true,
      policeMustArriveAfterOverload: true,
      entryLoadRangeAfterOverload: { min: 98, max: 100 },
      allThreeBosSameCellRequiredOnlyAsLateStageValidation: true
    },
    requiredNewValidators: [
      "MissionBosMission004TrafficSweptPathValidator",
      "MissionBosMission004ReturnRouteValidator",
      "MissionBosMission004NetworkTimingValidator"
    ],
    release: {
      sceneClearedRequired: true,
      firePoliceReturnIssuedRequired: true,
      firePoliceAtBaseRequired: true,
      ambulanceOutsideClosureZoneRequired: true
    }
  });
})();
