/* Mission BOS - Build 013M.10 preparation
   Frozen shared outbound response sequencing safety contract.
   This is a specification. Copy unchanged into the implementation build.
*/
(function(){
  "use strict";
  function freeze(v){if(!v||typeof v!=="object"||Object.isFrozen(v))return v;Object.keys(v).forEach(k=>freeze(v[k]));return Object.freeze(v);}
  window.MISSION_BOS_RESPONSE_OUTBOUND_SEQUENCING_CONTRACT=freeze({
    schemaVersion:"1.0",
    build:"013M.10",
    sourceBuildRequired:"Mission-BOS-Build-013M.9",
    sourceArchiveSha256Required:"faa562ef67e48ac5613704dc1f200a0855304105e469064f9198b84b0bfd2d7f",
    scope:{
      affectedProfiles:["MISSION_003_WATER_LEAK_PROFILE","MISSION_004_RING_COLLISION_PROFILE"],
      leadVehicleId:"RESPONSE_FIRE_01",
      trailingVehicleId:"RESPONSE_POLICE_01",
      routeGeometryMayChange:false,
      vehicleFootprintsMayChange:false,
      responseSpeedsMayChange:false,
      stationPositionsMayChange:false,
      mission003UtilityTimingMayChange:false,
      mission004AmbulanceTimingMayChange:false
    },
    calibration:{
      strategy:"GEOMETRY_DERIVED_DELAY_WITH_RESERVE",
      validationStepSeconds:0.005,
      collisionCalibrationMarginMeters:0.25,
      calibrationIncrementSeconds:0.05,
      dispatchReserveSeconds:0.20,
      calibrationLimitSeconds:8.0,
      existingConfiguredPoliceDelaySeconds:3.40,
      referenceCoarseEffectiveDelaySeconds:4.60,
      minimumAcceptedEffectivePoliceDelaySeconds:4.95,
      referenceEffectivePoliceDelaySeconds:5.00,
      staticDelayAloneIsNotAuthority:true,
      strictSweptSATValidationRequired:true
    },
    runtime:{
      policeMustRemainWaitingUntilEffectiveDelay:true,
      noResponseResponseOverlapAllowed:true,
      noSafetyHaltAllowedDuringOutbound:true,
      runtimeSafetyMustRemainEnabled:true,
      collisionSafetyBypassAllowed:false,
      forcedVehicleTeleportAllowed:false,
      preserveAutomaticRouteProfileSelection:true
    },
    acceptance:{
      mission003OutboundCycles:10,
      mission004OutboundCycles:10,
      responseResponseCollisionCount:0,
      safetyHaltCount:0,
      bothVehiclesReachHolding:true,
      mission003MustContinueNormally:true,
      mission004MustContinueNormally:true
    }
  });
})();
