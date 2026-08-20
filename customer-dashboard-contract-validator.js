/* Mission BOS - Build 013M.6 preparation
   Validates the frozen dashboard plan/contract pair.
*/
(function (root) {
  "use strict";

  function fail(message) {
    throw new Error("Customer dashboard contract validation failed: " + message);
  }

  var plan = root.MISSION_BOS_CUSTOMER_DASHBOARD_PLAN;
  var contract = root.MISSION_BOS_CUSTOMER_DASHBOARD_CONTRACT;
  if (!plan) fail("plan missing");
  if (!contract) fail("contract missing");
  if (plan.build !== "013M.6" || contract.build !== "013M.6") fail("build mismatch");
  if (plan.sourceBuildRequired !== "Mission-BOS-Build-013M.5") fail("plan source build mismatch");
  if (contract.sourceBuildRequired !== "Mission-BOS-Build-013M.5") fail("contract source build mismatch");
  if (plan.sourceArchiveSha256Required !== contract.sourceArchiveSha256Required) fail("source checksum mismatch");
  if (plan.visualTokens.brandAccent.toLowerCase() !== contract.style.brandAccentHex) fail("brand color mismatch");
  if (plan.primaryAction.keepMissionButtonId !== "mission-button") fail("mission button id changed");
  if (plan.presenterControls.existingId !== "presenter-panel") fail("presenter panel id changed");
  if (plan.technicalDetails.id !== "technical-details-panel") fail("technical details id mismatch");
  if (!plan.cameraControls || plan.cameraControls.id !== "camera-control-panel" || plan.cameraControls.openByDefault !== false) fail("camera controls contract missing");
  if (Number(plan.cameraControls.minimumTargetCssPx) < 44) fail("camera controls accessibility mismatch");
  if (plan.cameraControls.noRotationControls !== false || !plan.cameraControls.rotationControls || plan.cameraControls.rotationControls.enabled !== true) fail("dashboard rotation controls missing");
  if (Number(plan.cameraControls.rotationControls.rotateStepDegrees) !== 15 || plan.cameraControls.rotationControls.directTouchRotationEnabled !== false) fail("dashboard rotation contract mismatch");
  if (plan.acceptance.onlyOnePrimaryActionVisible !== true) fail("primary action policy missing");
  if (plan.networkAndPriority.cellLoadSectionMustRemainPrimary !== true) fail("cell load no longer primary");
  if (plan.protectedRuntime.mission004ReturnManeuverMustRemainUnchanged !== true) fail("Mission 004 return not protected");
  if (plan.protectedRuntime.automaticBosPriorityMustRemainUnchanged !== true) fail("automatic BOS priority not protected");
  if (contract.runtime.noNewNetworkAlgorithm !== true) fail("network algorithm protection missing");
  if (contract.runtime.noMissionStateMachineChange !== true) fail("mission state machine protection missing");
  if (contract.dom.overloadButtonMustBeInsidePresenterPanel !== true) fail("overload control placement not frozen");
  if (contract.dom.bosButtonMustBeInsidePresenterPanel !== true) fail("BOS status control placement not frozen");
  if (contract.dom.missionButtonMustBeInsideCustomerPrimaryActions !== true) fail("mission CTA placement not frozen");

  root.MISSION_BOS_CUSTOMER_DASHBOARD_CONTRACT_VALIDATION = Object.freeze({
    status: "PASSED",
    build: "013M.6",
    sourceBuild: "Mission-BOS-Build-013M.5",
    requiredNewDomIds: contract.dom.requiredNewIds.length,
    protectedMissionCount: plan.protectedRuntime.missions.length,
    primaryVisibleSectionsMaximum: plan.acceptance.primaryVisibleSectionsMaximum,
    customerStoryStates: Object.keys(plan.networkAndPriority.customerStoryStates).length
  });
})(typeof window !== "undefined" ? window : globalThis);
