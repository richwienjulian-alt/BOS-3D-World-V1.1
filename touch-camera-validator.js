/* Mission BOS - Build 013M.19
   Static validator for the additive touch/tablet camera plan.
*/
(function (root) {
  "use strict";

  function validate(plan) {
    var errors = [];
    if (!plan) errors.push("touch camera plan missing");
    else {
      if (plan.build !== "013M.19") errors.push("build mismatch");
      if (plan.sourceBuildRequired !== "Mission-BOS-Build-013M.18") errors.push("source build mismatch");
      if (plan.mode !== "ADDITIVE_POINTER_TOUCH") errors.push("touch mode must remain additive");
      if (!Array.isArray(plan.pointerTypes) || plan.pointerTypes.indexOf("touch") < 0 || plan.pointerTypes.indexOf("pen") < 0 || plan.pointerTypes.indexOf("mouse") >= 0) {
        errors.push("pointer type policy mismatch");
      }
      if (!plan.gesture || plan.gesture.oneFinger !== "GROUND_PLANE_PAN") errors.push("one-finger pan mismatch");
      if (!plan.gesture || plan.gesture.pinch !== "FOV_ZOOM") errors.push("pinch mismatch");
      if (Number(plan.gesture && plan.gesture.tapThresholdCssPx) !== 8) errors.push("tap threshold mismatch");
      if (Number(plan.gesture && plan.gesture.tapMaximumDurationMs) !== 350) errors.push("tap duration mismatch");
      if (plan.gesture && plan.gesture.rotationEnabled !== false) errors.push("touch rotation must remain disabled");
      if (!plan.camera || Number(plan.camera.minFov) !== 36 || Number(plan.camera.maxFov) !== 78) errors.push("FOV limits mismatch");
      if (!plan.camera || !plan.camera.worldBounds || Number(plan.camera.worldBounds.minX) !== -54 || Number(plan.camera.worldBounds.maxX) !== 54 || Number(plan.camera.worldBounds.minZ) !== -54 || Number(plan.camera.worldBounds.maxZ) !== 54) {
        errors.push("camera world bounds mismatch");
      }
      if (!plan.dashboard || plan.dashboard.detailsId !== "camera-control-panel" || plan.dashboard.openByDefault !== false) errors.push("dashboard panel contract mismatch");
      if (!plan.dashboard || Number(plan.dashboard.minimumTargetCssPx) < 44) errors.push("dashboard target size below 44 px");
      if (!plan.dashboard || Number(plan.dashboard.rotateStepDegrees) !== 15) errors.push("dashboard rotate step mismatch");
      if (!plan.dashboard || !plan.dashboard.controls || plan.dashboard.controls.rotateLeft !== "camera-control-rotate-left" || plan.dashboard.controls.rotateRight !== "camera-control-rotate-right") errors.push("dashboard rotation controls mismatch");
      if (!plan.presenter || plan.presenter.automaticCameraMovementAllowed !== false || plan.presenter.automaticMissionStartAllowed !== false) errors.push("presenter automation forbidden");
    }
    return Object.freeze({ status: errors.length ? "FAILED" : "PASSED", errors: Object.freeze(errors.slice()) });
  }

  root.MissionBosTouchCameraValidator = { validate: validate };
  root.MISSION_BOS_TOUCH_CAMERA_PLAN_VALIDATION = validate(root.MISSION_BOS_TOUCH_CAMERA_PLAN);
})(typeof window !== "undefined" ? window : globalThis);
