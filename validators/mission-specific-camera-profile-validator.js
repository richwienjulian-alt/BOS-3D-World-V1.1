#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.resolve(process.argv[2]||".");
const errors=[];
function load(name,ctx){vm.runInContext(fs.readFileSync(path.join(root,name),"utf8"),ctx,{filename:name});}
function finite(v){return Number.isFinite(Number(v));}
function dist(a,b){return Math.hypot(Number(a.x)-Number(b.x),Number(a.y)-Number(b.y),Number(a.z)-Number(b.z));}
function inside(p,r,m){return Number(p.x)>=Number(r.x)-m&&Number(p.x)<=Number(r.x)+Number(r.width)+m&&Number(p.z)>=Number(r.z)-m&&Number(p.z)<=Number(r.z)+Number(r.depth)+m;}
function find(items,id){return (items||[]).find(x=>x&&x.id===id)||null;}
function angle(cam,a,b){const va=[a.x-cam.x,a.y-cam.y,a.z-cam.z],vb=[b.x-cam.x,b.y-cam.y,b.z-cam.z];const dot=va[0]*vb[0]+va[1]*vb[1]+va[2]*vb[2],na=Math.hypot(...va),nb=Math.hypot(...vb);return Math.acos(Math.max(-1,Math.min(1,dot/(na*nb))))*180/Math.PI;}
const ctx={window:{},console};vm.createContext(ctx);load("city-layout-recovery.js",ctx);load("city-presenter-plan.js",ctx);
const layout=ctx.window.MISSION_BOS_RECOVERY_LAYOUT,plan=ctx.window.MISSION_BOS_PRESENTER_PLAN;
if(!layout||!plan){console.error("missing layout or presenter plan");process.exit(1);}
const camera=plan.camera||{},base=camera.bookmarks||[],profiles=camera.missionCameraProfiles||{},expected=["MISSION_001","MISSION_002","MISSION_003","MISSION_004"];
if(base.length!==4)errors.push("base bookmark count must remain 4");
for(const mid of expected){
  const p=profiles[mid]; if(!p){errors.push(mid+": profile missing");continue;}
  const tower=find(layout.mobileTowers,p.networkTowerId);if(!tower)errors.push(mid+": network tower missing: "+p.networkTowerId);
  const ov=p.bookmarkOverrides||{};
  for(const b of base){
    const o=ov[b.id]||{};const r={id:b.id,label:o.label||b.label,shortLabel:o.shortLabel||b.shortLabel,keyCode:o.keyCode||b.keyCode,position:o.position||b.position,target:o.target||b.target,fov:Number(o.fov)||Number(b.fov),purpose:o.purpose||b.purpose};
    if(!r.label||!r.purpose||!r.position||!r.target||!finite(r.fov))errors.push(mid+":"+b.id+": incomplete resolved bookmark");
    if(r.fov<35||r.fov>75)errors.push(mid+":"+b.id+": fov out of bounds");
    const q=r.position,t=r.target,wb=camera.worldBounds||{};
    if(q.x<wb.xMin||q.x>wb.xMax||q.y<wb.yMin||q.y>wb.yMax||q.z<wb.zMin||q.z>wb.zMax)errors.push(mid+":"+b.id+": camera outside world bounds");
    if(t.x<wb.xMin||t.x>wb.xMax||t.z<wb.zMin||t.z>wb.zMax)errors.push(mid+":"+b.id+": target outside world bounds");
    if(q.y<20){for(const building of layout.buildings||[])if(building.worldRect&&inside(q,building.worldRect,1))errors.push(mid+":"+b.id+": camera intersects building "+building.id);for(const mast of layout.mobileTowers||[])if(mast.worldRect&&inside(q,mast.worldRect,1))errors.push(mid+":"+b.id+": camera intersects tower "+mast.id);}
  }
  const incidentBase=find(base,"CAM_INCIDENT_W14"),networkBase=find(base,"CAM_COMMUNICATION_MAST_B");
  const incident={...incidentBase,...(ov.CAM_INCIDENT_W14||{})},network={...networkBase,...(ov.CAM_COMMUNICATION_MAST_B||{})};
  if(dist(incident.target,p.incidentReference)>2.6)errors.push(mid+": incident bookmark is not focused on mission incident");
  if(tower){const tc={x:tower.worldRect.x+tower.worldRect.width/2,y:tower.height||15,z:tower.worldRect.z+tower.worldRect.depth/2};const sep=angle(network.position,p.incidentReference,tc);if(sep>70)errors.push(mid+": network bookmark cannot frame incident and "+p.networkTowerId+" together; separation="+sep.toFixed(2));}
  if(mid!=="MISSION_001"&&String(incident.label).includes("W14"))errors.push(mid+": customer incident label still references W14");
  if(mid==="MISSION_002"&&String(network.label).includes("MAST_B"))errors.push(mid+": network label still references MAST_B");
  if(mid==="MISSION_004"&&String(network.label).includes("MAST_B"))errors.push(mid+": network label still references MAST_B");
  const rec=p.recommendedBookmarkByState||{};for(const [state,id] of Object.entries(rec))if(!find(base,id))errors.push(mid+": invalid recommendation "+state+" -> "+id);
}
const result={validator:"MISSION_SPECIFIC_CAMERA_PROFILES",status:errors.length?"FAILED":"PASSED",profiles:Object.keys(profiles).length,baseBookmarks:base.length,resolvedBookmarks:Object.keys(profiles).length*base.length,errors};
console.log(JSON.stringify(result,null,2));if(errors.length)process.exit(1);
