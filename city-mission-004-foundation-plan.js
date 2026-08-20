/* Mission BOS - Build 013M.1 consolidated preparation
   Frozen foundation contract for Mission 004: traffic collision on Ring North.
   The foundation establishes scene, routes and traffic-closure contracts only.
*/
(function () {
  "use strict";
  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  window.MISSION_BOS_MISSION_004_FOUNDATION_PLAN = deepFreeze({
    schemaVersion: "1.0.0",
    project: "Mission BOS - Connected Response",
    build: "013M.1",
    sourceBuildRequired: "Mission-BOS-Build-012M.4",
    sourceArchiveSha256Required: "cb03ba4df4f13cd1b3156de7497b77256440fff5420e58c20262670d16eb815f",
    includesBOSActivationImpactPolish: true,
    missionId: "MISSION_004",
    number: "004",
    shortTitle: "Verkehrsunfall",
    title: "Verkehrsunfall Ringstraße Nord",
    policy: {
      cityGeometryChangesAllowed: false,
      existingMissionChangesAllowed: false,
      existingVehicleDuplicationAllowed: false,
      existingNetworkAlgorithmChangesAllowed: false,
      fixedServingTowerAllowed: false,
      automaticCameraMovementAllowed: false,
      automaticMissionStartAllowed: false,
      automaticMissionFinishAllowed: false,
      automaticBOSPriorityRequired: true,
      sharedOperationalConnectivityRequired: true,
      fileProtocolRequired: true,
      runtimeRandomizationAllowed: false,
      foundationMustRemainHiddenUntilMissionRuntimeOwnsIt: true
    },
    incident: {
      id: "MISSION_004_RING_NORTH_COLLISION",
      surfaceId: "RING_NORTH",
      position: { x: 31.6, y: 0.08, z: 40.30 },
      sceneRadius: 7.8,
      likelyCellForPlausibilityOnly: "MAST_C",
      likelyCellMayNotBeHardCoded: true
    },
    scene: {
      collisionVehicles: [
        { id: "M004_ACCIDENT_CAR_01", kind: "civilian-car", position: { x: 30.75, y: 0.42, z: 40.05 }, rotationY: 1.5707963267948966, color: "#B9C1C9", damageSide: "front" },
        { id: "M004_ACCIDENT_CAR_02", kind: "civilian-car", position: { x: 32.65, y: 0.42, z: 41.05 }, rotationY: 0.95, color: "#C54C45", damageSide: "front-left" }
      ],
      patient: { id: "M004_PATIENT_01", role: "injured-person", position: { x: 33.8, y: 0.04, z: 39.15 }, visibleStates: ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "EXTRICATION", "PATIENT_READY"] },
      responders: [
        { id: "M004_FIREFIGHTER_01", role: "firefighter" },
        { id: "M004_POLICE_OFFICER_01", role: "police" },
        { id: "M004_PARAMEDIC_01", role: "paramedic" },
        { id: "M004_PARAMEDIC_02", role: "paramedic" }
      ],
      bystanders: [
        { id: "M004_BYSTANDER_01", endpointId: "NET_M004_PHONE_01", position: { x: 27.2, y: 0.04, z: 44.0 } },
        { id: "M004_BYSTANDER_02", endpointId: "NET_M004_PHONE_02", position: { x: 28.7, y: 0.04, z: 44.35 } },
        { id: "M004_BYSTANDER_03", endpointId: "NET_M004_PHONE_03", position: { x: 30.2, y: 0.04, z: 43.95 } },
        { id: "M004_BYSTANDER_04", endpointId: "NET_M004_PHONE_04", position: { x: 31.7, y: 0.04, z: 44.4 } },
        { id: "M004_BYSTANDER_05", endpointId: "NET_M004_PHONE_05", position: { x: 33.2, y: 0.04, z: 44.0 } },
        { id: "M004_BYSTANDER_06", endpointId: "NET_M004_PHONE_06", position: { x: 34.7, y: 0.04, z: 44.35 } },
        { id: "M004_BYSTANDER_07", endpointId: "NET_M004_PHONE_07", position: { x: 36.2, y: 0.04, z: 43.95 } },
        { id: "M004_BYSTANDER_08", endpointId: "NET_M004_PHONE_08", position: { x: 37.7, y: 0.04, z: 44.35 } }
      ],
      props: {
        cones: 8,
        barriers: 2,
        warningTriangles: 2,
        debrisPieces: 6,
        roadMarkingOverlayAllowed: true,
        fireOrSmokeEffectAllowed: false
      }
    },
    response: {
      activeVehicleIds: ["RESPONSE_FIRE_01", "RESPONSE_POLICE_01", "AMBULANCE_01"],
      routeProfileId: "MISSION_004_RING_COLLISION_PROFILE",
      dispatchOrder: ["RESPONSE_FIRE_01", "AMBULANCE_01", "RESPONSE_POLICE_01"],
      stagePositions: {
        RESPONSE_POLICE_01: { x: 17.0, y: 0.42, z: 40.95, rotationY: 1.5707963267948966 },
        RESPONSE_FIRE_01: { x: 21.0, y: 0.42, z: 39.75, rotationY: 1.5707963267948966 },
        AMBULANCE_01: { x: 25.2, y: 0.42, z: 40.95, rotationY: 1.5707963267948966 }
      },
      fireRoute: {
        baselinePrefixRouteId: "FIRE_FOUNDATION_ROUTE",
        baselinePrefixEnd: { x: -17.04, z: -32.20 },
        extensionWaypoints: [
          { x: -17.04, z: 40.30 },
          { x: 21.00, z: 40.30 }
        ],
        allowedSurfaceIds: ["FIRE_APRON", "FIRE_STATION_ACCESS", "BOS_BOULEVARD", "RING_NORTH"],
        dispatchDelaySeconds: 0.0,
        returnDelaySeconds: 1.0,
        outboundSpeed: 5.1,
        returnSpeed: 5.4
      },
      policeRoute: {
        baselinePrefixRouteId: "POLICE_FOUNDATION_ROUTE",
        baselinePrefixEnd: { x: -17.04, z: -21.70 },
        extensionWaypoints: [
          { x: -17.04, z: 40.30 },
          { x: 17.00, z: 40.30 }
        ],
        allowedSurfaceIds: ["BOS_FORECOURT", "POLICE_STATION_ACCESS", "LOGISTIKSPANGE", "BOS_BOULEVARD", "RING_NORTH"],
        dispatchDelaySeconds: 3.4,
        returnDelaySeconds: 0.0,
        outboundSpeed: 4.8,
        returnSpeed: 5.0
      },
      ambulanceOutboundRoute: {
        id: "AMBULANCE_STATION_TO_M004_ROUTE",
        points: [
          { x: 21.55, z: 18.78 },
          { x: 18.60, z: 18.78 },
          { x: 18.60, z: 40.30 },
          { x: 25.20, z: 40.30 }
        ],
        allowedSurfaceIds: ["EMS_AMBULANCE_ACCESS", "KLINIKALLEE", "RING_NORTH"],
        speed: 5.35
      },
      ambulanceHospitalRoute: {
        id: "AMBULANCE_M004_TO_HOSPITAL_ROUTE",
        points: [
          { x: 25.20, z: 40.30 },
          { x: 50.88, z: 40.30 },
          { x: 52.36, z: 39.15 },
          { x: 52.36, z: 29.70 },
          { x: 50.88, z: 29.70 },
          { x: 21.55, z: 29.70 }
        ],
        allowedSurfaceIds: ["RING_NORTH", "RING_EAST", "HOSPITAL_FORECOURT"],
        speed: 5.65
      },
      ambulanceReturnRouteId: "AMBULANCE_HOSPITAL_TO_STATION_ROUTE",
      allThreeAtSceneRequired: true,
      allThreeAtBaseRequiredBeforeReady: true,
      liveCommsAnchorsRequired: true
    },
    trafficClosure: {
      routeId: "OUTER_RING_ONE_WAY",
      closureCenterDistance: 82.75,
      closureZone: { xMin: 28.4, xMax: 35.2, zMin: 39.0, zMax: 43.2 },
      affectedVehicleIds: ["CAR_RING_01", "CAR_RING_02", "CAR_RING_03"],
      leadVehicleId: "CAR_RING_01",
      dispatchMayWaitOnlyForLeadVehicle: true,
      remainingVehiclesJoinQueueWithoutBlockingDispatch: true,
      queueHoldDistances: [76.2, 72.5, 68.8],
      releaseOnlyAfterAccidentSceneCleared: true,
      releaseOnlyAfterFireAndPoliceReturnIssued: true
    },
    futureRuntime: {
      states: [
        "READY", "CALL_RECEIVED", "ALARMING", "ROAD_CLOSURE", "ENROUTE",
        "ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "EXTRICATION",
        "PATIENT_READY", "COMPLETED", "TRANSPORTING", "AT_HOSPITAL", "RETURNING", "FAILED"
      ],
      activeBosEndpointIds: ["NET_FIRE_01", "NET_POLICE_01", "NET_AMBULANCE_01"],
      missionCivilianEndpointIds: [
        "NET_M004_PHONE_01", "NET_M004_PHONE_02", "NET_M004_PHONE_03", "NET_M004_PHONE_04",
        "NET_M004_PHONE_05", "NET_M004_PHONE_06", "NET_M004_PHONE_07", "NET_M004_PHONE_08"
      ],
      saturationStates: ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "EXTRICATION", "PATIENT_READY", "COMPLETED"],
      saturationRangePercent: [98, 100],
      activationThresholdPercent: 90,
      releaseThresholdPercent: 85,
      finishGate: "COMPLETED",
      finishStartsAmbulanceTransportAndFirePoliceReturn: true,
      hospitalHoldSeconds: 2.5,
      trafficReleaseAfterSceneCleared: true,
      readyRequiresAllVehiclesAtBaseAndPriorityReleased: true
    },
    stagedDelivery: {
      build013M1: "Scene, route and traffic-closure foundation; not selectable.",
      build013M2: "Mission runtime, ambulance route API, registry upgrade and automatic BOS network integration.",
      build013M3: "Four-mission regression, route calibration and presentation polish.",
      intermediateBuildInspectionRequired: true
    },
    expectedCounts: {
      collisionVehicles: 2,
      patients: 1,
      responders: 4,
      bystanders: 8,
      responseVehicles: 3,
      bosEndpoints: 3,
      newMissionCivilianEndpoints: 8,
      registryMissionsAfterFullIntegration: 4,
      fixedServingTowerDefinitions: 0,
      automaticMissionStarts: 0,
      automaticCameraMovements: 0
    }
  });
})();
