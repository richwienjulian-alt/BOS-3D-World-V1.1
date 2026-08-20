#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.resolve(process.argv[2]||".");
const ctx={window:{},console};vm.createContext(ctx);
for(const f of ["city-layout-recovery.js","city-presenter-plan.js"]) vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),ctx,{filename:f});
const layout=ctx.window.MISSION_BOS_RECOVERY_LAYOUT,plan=ctx.window.MISSION_BOS_PRESENTER_PLAN;const errors=[];
const expected={
 MISSION_001:{city:[-34,16,49,-10.68,3.2,33.9,60],incident:[-25,10,47,-10.68,4.8,33.9,54],network:[22,16,46,3,7,24,66]},
 MISSION_002:{city:[53,21,8,36,2.5,3,72],incident:[50,9,-41,41.15,1.6,-26.65,52],network:[11,15,-4,31,6,-18,62]},
 MISSION_003:{city:[-29,16,25,-7.26,2,6.36,60],incident:[-21,9,16,-7.26,1.8,6.36,52],network:[27,15,-3,4,5,10,62]},
 MISSION_004:{city:[7,16,53,31.6,2,40.3,61],incident:[18,9,52,31.6,1.8,40.3,52],network:[53,16,53,43,7,38,62]}
};
const ids={city:"CAM_CITY_OVERVIEW",incident:"CAM_INCIDENT_W14",network:"CAM_COMMUNICATION_MAST_B"};
function close(a,b){return Math.abs(Number(a)-Number(b))<0.001;}
function hitRect(p,r,m){return p.x>=r.x-r.width/2-m&&p.x<=r.x+r.width/2+m&&p.z>=r.z-r.depth/2-m&&p.z<=r.z+r.depth/2+m;}
for(const [mid,kinds] of Object.entries(expected)){
 const profile=plan.camera.missionCameraProfiles[mid];if(!profile){errors.push(mid+": profile missing");continue;}
 for(const [kind,e] of Object.entries(kinds)){
  const b=profile.bookmarkOverrides[ids[kind]];if(!b){errors.push(mid+":"+kind+" missing");continue;}
  const a=[b.position.x,b.position.y,b.position.z,b.target.x,b.target.y,b.target.z,b.fov];
  if(a.some((v,i)=>!close(v,e[i]))) errors.push(mid+":"+kind+" mismatch "+JSON.stringify(a));
  if(b.position.y<22){
    for(const obj of [...(layout.buildings||[]),...(layout.mobileTowers||[])]) if(obj.worldRect&&hitRect(b.position,obj.worldRect,1)) errors.push(mid+":"+kind+" camera intersects "+obj.id);
  }
  if(b.fov<35||b.fov>75) errors.push(mid+":"+kind+" FOV out of bounds");
 }
}
const base=plan.camera.bookmarks.find(b=>b.id==="CAM_CUSTOMER_START");
if(!base||!close(base.position.x,0.78)||!close(base.position.y,9)||!close(base.position.z,46)||!close(base.fov,56)) errors.push("shared customer start changed");
const result={validator:"PRESENTER_CAMERA_PROFILE_013M20",status:errors.length?"FAILED":"PASSED",profiles:Object.keys(expected).length,resolvedMissionSpecificViews:12,errors};
console.log(JSON.stringify(result,null,2));if(errors.length)process.exit(1);
