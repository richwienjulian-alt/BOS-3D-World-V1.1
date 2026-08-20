/* Mission BOS - Build 013M.8 preparation - frozen low-start camera validator */
(function () {
  "use strict";
  function finite(v) { v=Number(v); return isFinite(v) ? v : null; }
  function validate(layout, contract, actualPose) {
    var r={title:"MISSION BOS 013M.8 INITIAL CAMERA SPAWN",dependencyErrors:0,poseErrors:0,heightErrors:0,buildingClearanceErrors:0,boundsErrors:0,status:"PASSED",errors:[],nearestBuilding:null};
    function add(k,m){r[k]+=1;r.errors.push(m);r.status="FAILED";}
    if(!layout||!contract||!actualPose||!actualPose.position){add("dependencyErrors","Layout, camera contract or actual pose missing.");return r;}
    var expected=contract.initialPose||{}, p=actualPose.position||{}, req=contract.requirements||{};
    ["x","y","z"].forEach(function(k){if(finite(p[k])===null)add("poseErrors","Non-finite camera position " + k + ".");});
    if(Math.abs(Number(p.x)-Number(expected.position.x))>0.05||Math.abs(Number(p.y)-Number(expected.position.y))>0.05||Math.abs(Number(p.z)-Number(expected.position.z))>0.05)add("poseErrors","Initial camera position differs from frozen customer start.");
    if(Math.abs(Number(actualPose.yaw)-Number(expected.yaw))>0.01||Math.abs(Number(actualPose.pitch)-Number(expected.pitch))>0.01||Math.abs(Number(actualPose.fov)-Number(expected.fov))>0.1)add("poseErrors","Initial camera orientation/FOV differs from frozen customer start.");
    if(Number(p.y)<Number(req.allowedHeightRange.min)||Number(p.y)>Number(req.allowedHeightRange.max))add("heightErrors","Camera is not at the required low customer height.");
    var bounds=((window.MISSION_BOS_PRESENTER_PLAN||{}).camera||{}).worldBounds||{xMin:-54,xMax:54,zMin:-54,zMax:54,yMin:6,yMax:48};
    if(Number(p.x)<bounds.xMin||Number(p.x)>bounds.xMax||Number(p.z)<bounds.zMin||Number(p.z)>bounds.zMax||Number(p.y)<bounds.yMin||Number(p.y)>bounds.yMax)add("boundsErrors","Camera start is outside world bounds.");
    var best=null;
    (layout.buildings||[]).forEach(function(b){var q=b.worldRect;if(!q)return;var dx=Math.max(Math.abs(Number(p.x)-Number(q.x))-Number(q.width)/2,0);var dz=Math.max(Math.abs(Number(p.z)-Number(q.z))-Number(q.depth)/2,0);var d=Math.hypot(dx,dz);if(!best||d<best.distance)best={id:b.id,distance:d,height:Number(b.height)||0};});
    r.nearestBuilding=best;
    if(!best||best.distance<Number(req.minimumHorizontalBuildingClearanceMeters||3))add("buildingClearanceErrors","Camera start is too close to/inside a building footprint.");
    return r;
  }
  function logResult(r){var m=r.status==="PASSED"?"log":"error";console.group(r.title);console.log("Nearest building:",r.nearestBuilding);console[m]("STATUS: "+r.status);if(r.errors.length)console.error(r.errors);console.groupEnd();}
  window.MissionBosInitialCameraSpawnValidator013M8={validate:validate,logResult:logResult};
  window.MissionBosInitialCameraSpawnValidator=window.MissionBosInitialCameraSpawnValidator013M8;
})();
