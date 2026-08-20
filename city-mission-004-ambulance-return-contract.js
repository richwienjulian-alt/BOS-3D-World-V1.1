/* Mission BOS - Build 013M.8 preparation
   Frozen runtime contract for the Mission 004 ambulance hospital return.
   This contract protects the working Mission 004 return-corridor logic and
   makes AT_HOSPITAL -> RETURNING -> AT_STATION an observable real-runtime sequence.
*/
(function () {
  "use strict";
  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  window.MISSION_BOS_MISSION_004_AMBULANCE_RETURN_CONTRACT = deepFreeze({
    schemaVersion: "1.0.0",
    build: "013M.8",
    sourceBuildRequired: "Mission-BOS-Build-013M.7",
    sourceArchiveSha256Required: "ca554c9a64d1d9e9446b3bada499b450f6d4b656c7ad652399daa1dc316091d4",
    missionId: "MISSION_004",
    vehicleId: "AMBULANCE_01",

    observedBaseline: {
      planAlreadyRequestsAutomaticReturn: true,
      baselineHospitalHoldSeconds: 2.5,
      responseControllerAlreadyCallsReturnToStation: true,
      baselineProfileCarriesOnlyHospitalReturnRouteId: true,
      baselineBrowserReturnTraceRequired: false,
      baselineControllerHarnessIsNotRealRendererProof: true
    },

    routeProfile: {
      profileId: "MISSION_004_AMBULANCE_PROFILE",
      returnRouteId: "AMBULANCE_M004_HOSPITAL_TO_STATION_ROUTE",
      fullReturnRouteDefinitionRequired: true,
      prepareReturnRouteInsideSetRouteProfile: true,
      mission002DefaultProfileMustRemainCompatible: true,
      mission002FoundationControllerMustNotBeRequired: true,
      routeStart: { x: 21.55, z: 29.70 },
      routeEnd: { x: 21.55, z: 18.78 },
      lengthReferenceMeters: 16.037019,
      speedMetersPerSecond: 5.25,
      allowedSurfaceIds: ["HOSPITAL_AMBULANCE_ACCESS", "KLINIKALLEE", "EMS_AMBULANCE_ACCESS"]
    },

    stateMachine: {
      requiredObservedSequence: ["AT_HOSPITAL", "RETURNING", "AT_STATION"],
      hospitalHoldSeconds: 2.5,
      returnCommandStateDeadlineSeconds: 0.35,
      returnMaximumSeconds: 6.0,
      exactlyOneSuccessfulReturnCommand: true,
      mainMissionReturningMayUseCommandFlagAsProof: false,
      actualAmbulanceRuntimeStateRequired: true,
      completionRequiresAmbulanceAtStation: true,
      completionMayNotTeleportAmbulance: true,
      completionMayNotForceStateToStation: true
    },

    diagnostics: {
      actualRuntimeTraceRequired: true,
      traceGlobal: "MissionBosMission004AmbulanceReturnTrace",
      traceSampleMaximumSeconds: 0.10,
      recordFields: ["time", "missionState", "responseState", "ambulanceState", "routeId", "distance"],
      noInfiniteHospitalWait: true,
      noInfiniteReturningWait: true,
      visibleSafetyFailureInsteadOfSilentHang: true
    },

    protectedBehavior: {
      fireBackoutDistanceMeters: 6.0,
      policeMinimumReleaseDelaySeconds: 4.0,
      downtownReturnCorridorMustRemain: true,
      trafficClosureMustRemain: true,
      mission004NetworkTimingMustRemain: true,
      automaticBosPriorityMustRemain: true,
      dashboard013M6PolishMustRemain: true,
      missions001To003MustRemainUnchanged: true
    }
  });
})();
