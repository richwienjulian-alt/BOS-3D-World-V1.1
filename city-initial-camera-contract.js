/* Mission BOS - Build 013M.8 preparation
   Frozen low customer-start camera contract.
*/
(function () {
  "use strict";
  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }
  window.MISSION_BOS_INITIAL_CAMERA_CONTRACT_013M8 = deepFreeze({
    build: "013M.8",
    sourceBuildRequired: "Mission-BOS-Build-013M.7",
    mode: "LOW_OBLIQUE_CUSTOMER_START",
    initialPose: {
      position: { x: 0.78, y: 9.0, z: 46.0 },
      target: { x: 0.78, y: 2.5, z: 10.0 },
      yaw: 0.0,
      pitch: -0.17863100651394934,
      fov: 56
    },
    requirements: {
      heightMustRemainNearPreviousExperience: true,
      allowedHeightRange: { min: 8.0, max: 12.0 },
      mustNotStartInsideBuilding: true,
      minimumHorizontalBuildingClearanceMeters: 3.0,
      noAutomaticCameraFlightOnLoad: true,
      freeCameraAvailableImmediately: true,
      existingManualCameraBookmarksRemainAvailable: true,
      demoResetReturnsToCustomerStart: true,
      existingCityOverviewBirdViewMayRemainAsManualBookmark: true
    },
    referenceClearance: {
      nearestBuildingId: "I05",
      nearestHorizontalClearanceMeters: 10.171214283457013
    }
  });
})();
