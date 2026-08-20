/* Mission BOS - Build 013M.9 preparation
   Frozen correction contract for the Mission 004 ambulance transport corridor.
   The Build 013M.8 return renderer is preserved. The correction removes the
   deterministic pedestrian safety conflict on the incident -> hospital leg.
*/
(function () {
  "use strict";
  function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { freeze(value[key]); });
    return Object.freeze(value);
  }
  window.MISSION_BOS_MISSION_004_AMBULANCE_CORRIDOR_CONTRACT = freeze({
    build: "013M.9",
    sourceBuildRequired: "Mission-BOS-Build-013M.8",
    sourceArchiveSha256Required: "b2a230e8ed98928538153f1476dd86c29501d7ccd033e9475050154f03fa2409",
    rootCause: {
      unsafeRouteId: "AMBULANCE_M004_TO_HOSPITAL_ROUTE",
      runtimePedestrianStopDistanceMeters: 0.72,
      conflictingPedestrians: ["PED_HEALTH_01", "PED_HEALTH_02"],
      baselineMinimumCenterlineDistancesMeters: {
        PED_HEALTH_01: 0.600428,
        PED_HEALTH_02: 0.400641
      },
      oldAllowedSurfaceIds: ["RING_NORTH", "RING_EAST", "HOSPITAL_FORECOURT"],
      oldHospitalForecourtTraversalMustBeRemoved: true
    },
    targetHospitalRoute: {
      id: "AMBULANCE_M004_TO_HOSPITAL_ROUTE",
      start: { x: 28.0, z: 42.0 },
      end: { x: 21.55, z: 29.70 },
      speedMetersPerSecond: 5.65,
      referenceLengthMeters: 75.513595,
      allowedSurfaceIds: ["RING_NORTH", "RING_EAST", "NORTH_CONNECTOR", "KLINIKALLEE", "HOSPITAL_AMBULANCE_ACCESS"],
      forbiddenSurfaceIds: ["HOSPITAL_FORECOURT"],
      minimumHealthPedestrianRouteClearanceMeters: 2.52,
      footprintMustRemainOnAllowedSurfacesWithoutMissionPadding: true,
      buildingAndStaticPropCollisionsAllowed: false,
      healthPedestrianRouteConflictsAllowed: false
    },
    trafficRelease: {
      outerRingYieldsRemainActiveDuringHospitalTransport: true,
      releaseRequiresFirePoliceAtBase: true,
      releaseRequiresSceneCleared: true,
      releaseRequiresAmbulanceAtHospitalOrBeyond: true,
      ambulanceOutsideIncidentClosureAloneMayNotReleaseRingTraffic: true
    },
    returnLeg: {
      routeId: "AMBULANCE_M004_HOSPITAL_TO_STATION_ROUTE",
      mustRemainUnchangedFrom013M8: true,
      requiredObservedSequence: ["AT_HOSPITAL", "RETURNING", "AT_STATION"],
      hospitalHoldSeconds: 2.5,
      returnCommandStateDeadlineSeconds: 0.35,
      returnMaximumSeconds: 6.0
    },
    runtime: {
      hospitalTransportMaximumSeconds: 16.5,
      safetyMustRemainPassedFromTransportStartThroughAtStation: true,
      traceMustIncludeAmbulanceSafety: true,
      noTeleport: true,
      noForcedState: true,
      noSafetyBypass: true
    },
    protected: {
      missions001To003: true,
      dashboard013M8: true,
      initialCamera013M8: true,
      networkAndBosPriority: true,
      firePoliceReturnManeuver: true,
      ambulanceRenderer013M8ReturnSupport: true,
      pedestrianRoutesAndPositions: true,
      cityGeometry: true
    }
  });
})();
