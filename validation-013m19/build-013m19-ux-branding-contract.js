(function (root) {
  "use strict";
  root.MISSION_BOS_BUILD_013M19_UX_BRANDING_CONTRACT = Object.freeze({
    build: "013M.19",
    sourceBuild: "Mission-BOS-Build-013M.18",
    sourceArchiveSha256: "97147af448390db29d8028a6c0353e37783a1eb71839a4acc0c1ba5224d12cd0",
    logo: Object.freeze({
      preparationPath: "assets/telekom-logo-current-user-provided.png",
      productionPath: "assets/telekom-logo-current.png",
      sha256: "230eb275ac48962b6a555ef886bad448e75741fd34336e8ffe9a80c5b0e62d0d",
      visibleBrand: "T MISSION",
      browserTitle: "T Mission | Connected Response"
    }),
    camera: Object.freeze({
      dashboardRotationEnabled: true,
      directTouchTwistEnabled: false,
      rotateStepDegrees: 15,
      rotateLeftId: "camera-control-rotate-left",
      rotateRightId: "camera-control-rotate-right",
      minimumTargetCssPx: 44,
      useExistingYawState: true
    }),
    protected: Object.freeze({
      missionLogic: true,
      routesAndTimings: true,
      desktopControls: true,
      touchPanPinchTap: true,
      presenterProfiles: true,
      networkAndBosPriority: true
    })
  });
})(typeof window !== "undefined" ? window : globalThis);
