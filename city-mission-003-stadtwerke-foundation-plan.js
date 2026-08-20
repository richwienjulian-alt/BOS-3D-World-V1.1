/* Mission BOS - Build 011N.4
   Frozen visual foundation for the future Mission 003 municipal utility vehicle.
   This plan does not register or implement Mission 003.
*/
window.MISSION_BOS_MISSION_003_STADTWERKE_FOUNDATION_PLAN = Object.freeze({
  schemaVersion: "1.0",
  project: "Mission BOS - Connected Response",
  build: "011N.4",
  sourceBuild: "Mission-BOS-Build-011N.3R.1",
  title: "Mission 003 Stadtwerke Vehicle Foundation",
  policy: Object.freeze({
    missionRegistrationAllowed: false,
    routeCreationAllowed: false,
    movementAllowed: false,
    networkRegistrationAllowed: false,
    networkDemandAllowed: false,
    dashboardCardAllowed: false,
    cityGeometryChangesAllowed: false,
    existingRouteChangesAllowed: false,
    externalAssetsAllowed: false,
    runtimeRandomizationAllowed: false
  }),
  parkingAreaId: "B06_READY_AREA",
  vehicle: Object.freeze({
    id: "STADTWERKE_01",
    role: "municipal-utility-service",
    className: "utility-service-van",
    state: "PARKED",
    position: Object.freeze({ x: -7.32, y: 0.42, z: -34.80 }),
    rotationY: 1.5707963267948966,
    dimensions: Object.freeze({
      length: 4.40,
      width: 1.85,
      height: 2.05,
      footprintLength: 4.60,
      footprintWidth: 1.95
    }),
    colors: Object.freeze({
      body: "#F7F7F7",
      accent: "#0086A8",
      dark: "#26313A",
      glass: "#1B2A38",
      tire: "#171A1F",
      rim: "#B7C0C8",
      beacon: "#F5A623"
    }),
    markings: Object.freeze({
      sideText: "STADTWERKE",
      sideLabels: 2,
      localCanvasTextureRequired: true
    }),
    equipment: Object.freeze({
      wheels: 4,
      amberBeacons: 1,
      blueEmergencyLights: 0,
      beaconFlashingInStandby: false
    })
  }),
  runtimeContract: Object.freeze({
    visibleAtStartup: true,
    staticPositionRequired: true,
    vehiclesByIdRequired: true,
    futureCommsPositionRequired: true,
    updateMethodRequired: true,
    manifestRequired: true,
    safetyRequired: true,
    disposeRequired: true
  }),
  expected: Object.freeze({
    vehicles: 1,
    wheels: 4,
    sideLabels: 2,
    amberBeacons: 1,
    routes: 0,
    networkEndpoints: 0,
    missionRegistrations: 0
  })
});
