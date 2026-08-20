/* Mission BOS - Build 012M.1 preparation
   Frozen deterministic multi-agency response contract for Mission 003.
   This file is a specification and may be copied unchanged into the build.
*/
(function () {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  window.MISSION_BOS_MISSION_003_RESPONSE_PLAN = deepFreeze({
    schemaVersion: "1.0",
    project: "Mission BOS - Connected Response",
    build: "012M.1",
    sourceBuild: "Mission-BOS-Build-011N.4",
    title: "Mission 003 Multi-Agency Response Routes",
    policy: {
      runtimeRandomizationAllowed: false,
      cityGeometryChangesAllowed: false,
      existingRouteMutationAllowed: false,
      duplicateResponseVehicleModelsAllowed: false,
      fixedServingTowerAllowed: false,
      automaticCameraMovementAllowed: false,
      routeProfilesMustUseExistingVehicleRoots: true,
      routeProfileSelectionOnlyAtBase: true,
      trafficYieldRequiredBeforeDispatch: true
    },
    incident: {
      id: "MISSION_003_WATER_MAIN_LEAK",
      surfaceId: "STADTALLEE",
      landmarkId: "TOWN_HALL_SQUARE",
      position: { x: -7.26, y: 0.07, z: 6.36 },
      safetyRadius: 1.15
    },
    customAccessSurfaces: [
      {
        id: "STADTWERKE_DEPOT_ACCESS",
        type: "utility-access",
        connects: ["B06_READY_AREA", "RING_SOUTH"],
        worldRect: { x: -7.32, z: -38.04, width: 2.10, depth: 3.20 },
        color: "#3B4148",
        markingColor: "#D9E1E7"
      }
    ],
    trafficYield: {
      vehicleId: "CAR_DOWNTOWN_01",
      routeId: "DOWNTOWN_LOOP",
      holdDistance: 31.9,
      approximateHoldPosition: { x: 0.78, z: 11.0 },
      mustBeConfirmedBeforeDispatch: true,
      releaseOnlyAfterAllRespondersAtBase: true
    },
    supportTrafficYield: {
      vehicleId: "VAN_SUPPORT_01",
      routeId: "SOUTH_SUPPORT_LOOP",
      safeHoldDistances: [4.0, 25.0, 43.0],
      assignmentRule: "NEXT_FORWARD_SAFE_HOLD",
      maximumForwardTravelToHoldMeters: 29.116551,
      maximumWaitSeconds: 8.0,
      mustBeConfirmedBeforeDispatch: true,
      releaseOnlyAfterAllRespondersAtBase: true
    },
    routeProfile: {
      id: "MISSION_003_WATER_LEAK_PROFILE",
      ownerMissionId: "MISSION_003",
      defaultProfileToRestore: "MISSION_001_DEFAULT",
      turnRadius: 1.05,
      sampleStep: 0.05,
      vehicles: [
        {
          vehicleId: "RESPONSE_FIRE_01",
          kind: "fire-truck",
          sourceRuntime: "validatedResponseVehicles",
          baselinePrefixRouteId: "FIRE_FOUNDATION_ROUTE",
          baselinePrefixEnd: { x: -17.04, z: -32.20 },
          extensionWaypoints: [
            { x: -17.04, z: 6.36 },
            { x: -11.00, z: 6.36 }
          ],
          allowedSurfaceIds: ["FIRE_APRON", "FIRE_STATION_ACCESS", "BOS_BOULEVARD", "STADTALLEE"],
          dispatchDelaySeconds: 0.0,
          returnDelaySeconds: 3.2,
          outboundSpeed: 5.0,
          returnSpeed: 5.4,
          stagePosition: { x: -11.00, y: 0.42, z: 6.36 },
          stageRotationY: 1.5707963267948966
        },
        {
          vehicleId: "RESPONSE_POLICE_01",
          kind: "police-car",
          sourceRuntime: "validatedResponseVehicles",
          baselinePrefixRouteId: "POLICE_FOUNDATION_ROUTE",
          baselinePrefixEnd: { x: -17.04, z: -21.70 },
          extensionWaypoints: [
            { x: -17.04, z: 6.36 },
            { x: -15.70, z: 6.36 }
          ],
          allowedSurfaceIds: ["BOS_FORECOURT", "POLICE_STATION_ACCESS", "LOGISTIKSPANGE", "BOS_BOULEVARD", "STADTALLEE"],
          dispatchDelaySeconds: 3.4,
          returnDelaySeconds: 0.0,
          outboundSpeed: 4.6,
          returnSpeed: 4.8,
          stagePosition: { x: -15.70, y: 0.42, z: 6.36 },
          stageRotationY: 1.5707963267948966
        },
        {
          vehicleId: "STADTWERKE_01",
          kind: "utility-service-van",
          sourceRuntime: "validatedStadtwerkeVehicle",
          routeWaypoints: [
            { x: -7.32, z: -34.80 },
            { x: -7.32, z: -40.48 },
            { x: 0.78, z: -40.48 },
            { x: 0.78, z: 6.36 },
            { x: -3.70, z: 6.36 }
          ],
          allowedSurfaceIds: ["B06_READY_AREA", "STADTWERKE_DEPOT_ACCESS", "RING_SOUTH", "STADTACHSE", "STADTALLEE"],
          dispatchDelaySeconds: 1.4,
          returnDelaySeconds: 1.0,
          outboundSpeed: 4.2,
          returnSpeed: 4.5,
          stagePosition: { x: -3.70, y: 0.42, z: 6.36 },
          stageRotationY: -1.5707963267948966,
          amberBeaconActiveFromAlarmThroughReturn: true
        }
      ]
    },
    arrivalContract: {
      allThreeVehiclesRequired: true,
      stateWhenAllArrived: "ON_SCENE",
      maximumStageVehicleOverlap: 0,
      minimumVehicleToLeakClearance: 1.0,
      responseRuntimeMustRemainSingleInstance: true,
      permanentNetworkAssociationsMustFollowLiveVehicleRoots: true
    },
    returnContract: {
      reverseValidatedRoutes: true,
      policeLeavesBeforeFire: true,
      utilityReturnsIndependently: true,
      restoreMission001RouteProfileAfterReturn: true,
      allVehiclesAtBaseRequiredBeforeReady: true,
      noTeleportAllowed: true
    },
    expectedCounts: {
      responseVehicles: 3,
      existingBosVehicles: 2,
      utilityVehicles: 1,
      newVehicleModels: 0,
      customAccessSurfaces: 1,
      yieldedCivilianVehicles: 2,
      routeProfiles: 1,
      fixedServingTowerDefinitions: 0
    }
  });
})();
