/* Mission BOS - Build 013M.7 preparation
   Frozen final-polish contract for Mission 004 and initial camera spawn.
   Copy unchanged into the implementation build.
*/
(function () {
  "use strict";
  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  window.MISSION_BOS_MISSION_004_POLISH_CONTRACT = deepFreeze({
    schemaVersion: "1.0.0",
    project: "Mission BOS - Connected Response",
    build: "013M.7",
    sourceBuildRequired: "Mission-BOS-Build-013M.6",
    sourceArchiveSha256Required: "15a305fd6ea10cad70e39837ca45dda47240614afe5c4ff89bb849c4a4a3691e",

    scope: {
      mission004OnlyExceptInitialCameraSpawn: true,
      preserveCustomerDashboard013M6: true,
      preserveMission001: true,
      preserveMission002: true,
      preserveMission003: true,
      preserveNetworkAssociationLoadCapacityPriority: true,
      preserveMission004IncidentXZRotationAndRadioCalibration: true,
      noNewExternalDependencies: true
    },

    missionButton: {
      missionId: "MISSION_004",
      readyLabel: "Mission 004 starten",
      genericReadyFallbackNotAcceptedForMission004: true
    },

    accidentVehicles: {
      ids: ["M004_ACCIDENT_CAR_01", "M004_ACCIDENT_CAR_02"],
      rootY: 0.42,
      wheelLocalY: -0.20,
      wheelRadius: 0.22,
      expectedWheelWorldBottomY: 0.0,
      bodyLocalY: 0.28,
      cabinLocalY: 0.70,
      crushedLocalY: 0.27,
      preserveXZAndRotation: true,
      preserveCollisionFootprints: true,
      visualOnly: true
    },

    incidentCard: {
      keepTitleId: "mission-title",
      keepStatusId: "mission-status",
      keepStageId: "mission-stage",
      keepDescriptionId: "mission-description",
      compactStatusBadgeRequired: true,
      fullRuntimeStatusBelongsInDescription: true,
      titleMinimumUsableWidthPixelsAt420Panel: 150,
      titleMayNotUseOverflowWrapAnywhere: true,
      stageMayWrapByWords: true,
      longStatusMayNotForceCharacterByCharacterTitleWrap: true,
      compactBadgeByState: {
        READY: "Bereit", CALL_RECEIVED: "Aktiv", ALARMING: "Aktiv", ROAD_CLOSURE: "Aktiv",
        ENROUTE: "Aktiv", ON_SCENE: "Vor Ort", OVERLOADED: "Netzlast", BOS_ACTIVE: "BOS aktiv",
        COMMS_STABLE: "Stabil", EXTRICATION: "Rettung", PATIENT_READY: "Transport", COMPLETED: "Abschluss",
        TRANSPORTING: "Transport", AT_HOSPITAL: "Übergabe", RETURNING: "Rückfahrt", FAILED: "Stopp"
      }
    },

    returnCorridor: {
      civilianVehicleId: "CAR_DOWNTOWN_01",
      civilianRouteId: "DOWNTOWN_LOOP",
      northExitHoldDistance: 4.0,
      eastBypassHoldDistance: 27.0,
      southApproachHoldDistance: 50.0,
      safeHoldDistances: [4.0, 27.0, 50.0],
      assignmentRule: "NEXT_FORWARD_SAFE_HOLD_FROM_4_27_50",
      maximumForwardTravelMeters: 27.876551,
      maximumReservationWaitSeconds: 8.0,
      ambulanceTransportStartsImmediately: true,
      firePoliceWaitForConfirmedYield: true,
      firePoliceRemainStationaryWhileWaiting: true,
      releaseOnlyAfterFirePoliceAtBase: true,
      collisionSafetyMustRemainEnabled: true,
      noTeleport: true,
      phaseSweepStepSeconds: 0.25,
      phaseSweepDurationSeconds: 300,
      expectedResponseCivilianSatCollisions: 0
    },

    completion: {
      operationalCompleteRequiresAllVehiclesAtBase: true,
      operationalCompleteRequiresTrafficReleased: true,
      operationalCompleteRequiresSceneCleared: true,
      endMissionNetworkOnceOperationalComplete: true,
      maximumNetworkSettlementSeconds: 8.0,
      readyRequiresLoadAtOrBelow: 55,
      readyRequiresNoPriority: true,
      unboundedReturningStateAllowed: false,
      expectedReadyDeadlineAfterOperationalCompleteSeconds: 8.0
    },

    startupCamera: {
      sourceBookmarkId: "CAM_CITY_OVERVIEW",
      position: { x: 0, y: 40, z: 50 },
      target: { x: 0, y: 1.5, z: 0 },
      fov: 54,
      expectedYaw: 0,
      expectedPitch: -0.6561787179913949,
      initialFreeCameraHeight: 40,
      minimumBuildingClearanceMetersXZ: 1.0,
      initialAnimationAllowed: false,
      automaticBookmarkSelectionAllowed: false,
      freeCameraMustRemainAvailable: true
    }
  });
})();
