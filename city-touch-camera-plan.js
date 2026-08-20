/* Mission BOS - Build 013M.19
   Additive touch/tablet camera interaction plan. Desktop controls remain authoritative and unchanged.
*/
(function (root) {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  root.MISSION_BOS_TOUCH_CAMERA_PLAN = deepFreeze({
    build: "013M.19",
    sourceBuildRequired: "Mission-BOS-Build-013M.18",
    sourceArchiveSha256Required: "97147af448390db29d8028a6c0353e37783a1eb71839a4acc0c1ba5224d12cd0",
    mode: "ADDITIVE_POINTER_TOUCH",
    pointerTypes: ["touch", "pen"],
    canvas: {
      touchAction: "none",
      overscrollBehavior: "contain"
    },
    gesture: {
      oneFinger: "GROUND_PLANE_PAN",
      tapThresholdCssPx: 8,
      tapMaximumDurationMs: 350,
      panMetersPerCssPixel: 0.04,
      pinch: "FOV_ZOOM",
      pinchDegreesPerCssPixel: 0.08,
      rotationEnabled: false
    },
    camera: {
      minFov: 36,
      maxFov: 78,
      worldBounds: { minX: -54, maxX: 54, minZ: -54, maxZ: 54 },
      preserveHeightOnPan: true,
      preserveYawOnPan: true,
      preservePitchOnPan: true,
      homeSource: "MISSION_BOS_INITIAL_CAMERA_CONTRACT_013M8.initialPose"
    },
    inspection: {
      inputMethod: "CLIENT_POINT_RAYCAST",
      emptyTapClearsSelection: false,
      tapAfterPanAllowed: false,
      tapAfterPinchAllowed: false
    },
    dashboard: {
      detailsId: "camera-control-panel",
      openByDefault: false,
      minimumTargetCssPx: 44,
      panStepMeters: 2,
      zoomStepDegrees: 4,
      rotateStepDegrees: 15,
      controls: {
        forward: "camera-control-forward",
        backward: "camera-control-backward",
        left: "camera-control-left",
        right: "camera-control-right",
        rotateLeft: "camera-control-rotate-left",
        rotateRight: "camera-control-rotate-right",
        zoomOut: "camera-control-zoom-out",
        zoomIn: "camera-control-zoom-in",
        home: "camera-control-home"
      }
    },
    presenter: {
      manualInputReason: "TOUCH_CAMERA",
      dashboardManualInputReason: "DASHBOARD_CAMERA",
      automaticCameraMovementAllowed: false,
      automaticMissionStartAllowed: false
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
