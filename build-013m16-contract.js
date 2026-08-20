/* Mission BOS - Build 013M.16 Preparation Contract
   Read-only implementation and acceptance reference.
*/
(function(){
  "use strict";
  function deepFreeze(v){if(!v||typeof v!=="object"||Object.isFrozen(v))return v;Object.keys(v).forEach(function(k){deepFreeze(v[k]);});return Object.freeze(v);}
  window.MISSION_BOS_BUILD_013M16_CONTRACT=deepFreeze({
    build:"013M.16",
    baseArchive:"Mission-BOS-Build-013M.15(2).zip",
    baseSha256:"a1d3a21a280a8d0d5bbc9e7947926893662820bdcb5c1e24f80233a31e4311ac",
    scope:[
      "MISSION_003_SUPPORT_TRAFFIC_YIELD",
      "MISSION_004_OUTBOUND_DOWNTOWN_YIELD",
      "CROSS_MISSION_PRESENTER",
      "CUSTOMER_DASHBOARD_TYPOGRAPHY",
      "MOUSE_WHEEL_FOV_ZOOM"
    ],
    mission003:{
      trafficVehicleId:"VAN_SUPPORT_01",routeId:"SOUTH_SUPPORT_LOOP",
      safeHoldDistances:[4,25,43],maximumForwardTravelToHoldMeters:29.116551,maximumWaitSeconds:8,
      dispatchRequiresDowntownAndSupportYield:true,releaseOnlyAfterAllRespondersAtBase:true
    },
    mission004:{
      trafficVehicleId:"CAR_DOWNTOWN_01",routeId:"DOWNTOWN_LOOP",
      safeHoldDistances:[4,27,50],maximumForwardTravelToHoldMeters:27.876551,maximumWaitSeconds:8,
      dispatchRequiresOutboundYield:true,releaseAfterFirePoliceAtScene:true,
      existingReturnCorridorMustRemain:true
    },
    presenter:{
      missionIds:["MISSION_001","MISSION_002","MISSION_003","MISSION_004"],
      startAction:"START_MISSION",finishAction:"FINISH_AND_RETURN",
      manualOnly:true,guidedModeEntryStartsReadyMission:true,noAutomaticMissionStart:true,noAutomaticCameraTakeover:true
    },
    typography:{summaryFontSizePx:11,summaryFontWeight:800,markerFontSizePx:14,lineHeight:1.2},
    zoom:{input:"MOUSE_WHEEL",minFov:36,maxFov:78,sensitivity:0.025,maxNormalizedDelta:120,preventDefault:true},
    frozenPolicies:{
      responseRoutesMayChange:false,responseSpeedsMayChange:false,trafficRoutesMayChange:false,
      missionStateMachinesMayChange:false,networkAlgorithmsMayChange:false,bosPriorityAlgorithmsMayChange:false
    }
  });
})();
