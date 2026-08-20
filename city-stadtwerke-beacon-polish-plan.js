/* Mission BOS - Build 012M.2
   Frozen visual-only polish contract for the existing Stadtwerke beacon.
*/
(function () {
  "use strict";
  window.MISSION_BOS_STADTWERKE_BEACON_POLISH_PLAN = Object.freeze({
    schemaVersion: "1.0",
    project: "Mission BOS - Connected Response",
    build: "012M.2",
    sourceBuild: "Mission-BOS-Build-012M.1",
    title: "Stadtwerke Amber Beacon Visibility Polish",
    policy: Object.freeze({
      vehicleGeometryRedesignAllowed: false,
      routeChangesAllowed: false,
      mission003StateChangesAllowed: false,
      blueEmergencyLightAllowed: false,
      additionalVehicleAllowed: false,
      beaconMayRenderThroughBuildings: false
    }),
    beacon: Object.freeze({
      color: "#FFB000",
      inactiveEmissiveIntensity: 0.45,
      activeEmissiveMinimum: 1.15,
      activeEmissiveMaximum: 2.35,
      activeOpacityMinimum: 0.82,
      activeOpacityMaximum: 1.0,
      pulseCyclesPerSecond: 1.5,
      slightlyLargerLensAllowed: true,
      maximumLensRadius: 0.20,
      maximumLensHeight: 0.30
    }),
    halo: Object.freeze({
      required: true,
      color: "#FFC247",
      maximumRadius: 0.30,
      inactiveOpacity: 0.04,
      activeOpacityMinimum: 0.10,
      activeOpacityMaximum: 0.30,
      depthTest: true,
      depthWrite: false,
      externalTextureRequired: false
    }),
    behavior: Object.freeze({
      inactiveWhileParked: true,
      activeFromMission003PreparationUntilReturnComplete: true,
      followsVehicleRoot: true,
      visibleFromPresentationCamera: true,
      noMissionTransitionDependency: true
    }),
    expected: Object.freeze({
      stadtwerkeVehicles: 1,
      amberBeaconLenses: 1,
      amberBeaconHalos: 1,
      blueBeaconObjects: 0,
      routeChanges: 0
    })
  });
})();
