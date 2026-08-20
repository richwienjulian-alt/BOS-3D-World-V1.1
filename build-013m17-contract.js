(function(){"use strict";window.MISSION_BOS_BUILD_013M17_CONTRACT={
  schemaVersion:"1.0",
  buildId:"Mission-BOS-Build-013M.17",
  baseBuildId:"Mission-BOS-Build-013M.16",
  title:"Mission-Specific Presenter Camera Profiles",
  allowedProductionFiles:["city-presenter-plan.js","city-presenter-controller.js"],
  protectedPrinciples:{
    missionLogicFrozen:true,
    trafficAndResponseLogicFrozen:true,
    networkAndBosPriorityFrozen:true,
    dashboardLayoutFrozen:true,
    mouseWheelZoomFrozen:true,
    freeExplorationFrozen:true,
    automaticCameraTakeoverAllowed:false,
    missionSelectionMayMoveCamera:false,
    manualCameraSelectionRequired:true
  },
  cameraSlots:["CAM_CUSTOMER_START","CAM_CITY_OVERVIEW","CAM_INCIDENT_W14","CAM_COMMUNICATION_MAST_B"],
  missionProfiles:{
    MISSION_001:{incident:"Wohnungsbrand",tower:"MAST_B"},
    MISSION_002:{incident:"Arena-Notfall",tower:"MAST_E"},
    MISSION_003:{incident:"Wasserleitungsleck",tower:"MAST_B"},
    MISSION_004:{incident:"Verkehrsunfall",tower:"MAST_C"}
  },
  expectedCounts:{missionProfiles:4,cameraSlots:4,resolvedCameraPoses:16}
};})();
