(function(){
  "use strict";
  window.MISSION_BOS_013M12_CROSS_MISSION_HANDOFF_CONTRACT = Object.freeze({
    id: "M004_TO_M002_SHARED_BASELINE_V1",
    sourceBuild: "Mission-BOS-Build-013M.11",
    targetBuild: "Mission-BOS-Build-013M.12",
    policy: Object.freeze({
      mission004MayExposeReadyOnlyAfterSharedHandoff: true,
      mission002SafetyBypassAllowed: false,
      sharedRuntimeResetResultMayBeIgnored: false,
      ambulanceMustBeAtStation: true,
      ambulanceRouteProfileMustBe: "MISSION_002_DEFAULT",
      firePoliceRouteProfileMustBe: "MISSION_001_DEFAULT",
      sharedNetworkMustBeStartReady: true,
      recoverableCellWarningsRemainUsable: true,
      fatalRuntimeSafetyStillBlocks: true
    }),
    acceptance: Object.freeze({
      consecutiveMission004ToMission002Runs: 10,
      maximumUserWaitAfterMission004ReadySeconds: 0.25,
      mission002StartSuccessRequired: 10,
      safetyBypassCount: 0
    })
  });
})();
