#!/usr/bin/env node
/* Mission BOS - Build 013M.10 preparation
   Reproduces the shared Fire/Police outbound sequencing weakness from Build 013M.9.
   Usage: node reference-013m9-outbound-collision-analysis.js /path/to/Build-013M.9
*/
"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.resolve(process.argv[2]||".");
const ctx={window:{},console};vm.createContext(ctx);
function load(name){vm.runInContext(fs.readFileSync(path.join(root,name),"utf8"),ctx,{filename:name});}
["response-vehicle-validator.js","city-response-vehicle-plan.js","city-mission-004-foundation-plan.js","city-mission-004-plan.js","city-mission-003-response-plan.js"].forEach(load);
const V=ctx.window.MissionBosResponseVehicleValidator;
const B=ctx.window.MISSION_BOS_RESPONSE_VEHICLE_PLAN;
const M4=ctx.window.MISSION_BOS_MISSION_004_PLAN;
const M3=ctx.window.MISSION_BOS_MISSION_003_RESPONSE_PLAN;
if(!V||!B||!M4||!M3)throw new Error("Required Build 013M.9 sources missing.");
const routes=Object.fromEntries(B.routes.map(r=>[r.id,r]));
const vehicles=Object.fromEntries(B.vehicles.map(v=>[v.id,v]));
function prefix(route,end){const pts=route.points.map(p=>({x:+p.x,z:+p.z}));let best=0,bestD=Infinity;pts.forEach((p,i)=>{const d=(p.x-end.x)**2+(p.z-end.z)**2;if(d<bestD){bestD=d;best=i;}});return pts.slice(0,best+1);}
function buildEntries(plan){return ["RESPONSE_FIRE_01","RESPONSE_POLICE_01"].map(id=>{let vp;if(plan.routeProfile)vp=plan.routeProfile.vehicles.find(v=>v.vehicleId===id);else vp=id==="RESPONSE_FIRE_01"?plan.response.fireRoute:plan.response.policeRoute;const def={...vehicles[id],outboundSpeed:+vp.outboundSpeed};const points=prefix(routes[vp.baselinePrefixRouteId],vp.baselinePrefixEnd).concat(vp.extensionWaypoints.map(p=>({x:+p.x,z:+p.z})));return{id,definition:def,route:V.prepareOpenRoute({id:id+"_ANALYSIS",points}),configuredDelay:+vp.dispatchDelaySeconds};});}
function firstCollision(entries,delays,step,margin){let duration=0;entries.forEach((e,i)=>duration=Math.max(duration,delays[i]+e.route.length/e.definition.outboundSpeed+0.5));for(let t=0;t<=duration+1e-9;t+=step){const poses=entries.map((e,i)=>V.sampleOpenRoute(e.route,Math.min(e.route.length,Math.max(0,t-delays[i])*e.definition.outboundSpeed),false));const a=V.rectangleCorners(poses[0],entries[0].definition.footprintLength,entries[0].definition.footprintWidth,margin);const b=V.rectangleCorners(poses[1],entries[1].definition.footprintLength,entries[1].definition.footprintWidth,margin);if(V.polygonsOverlapSAT(a,b))return{time:t,poses};}return null;}
function coarseCalibrate(entries){const delays=entries.map(e=>e.configuredDelay);if(!firstCollision(entries,delays,0.05,0.05))return delays;const order=delays.map((d,i)=>({i,d})).sort((a,b)=>a.d-b.d||a.i-b.i);const later=order[order.length-1].i,base=delays[later];for(let extra=0.05;extra<=6.0+1e-9;extra+=0.05){delays[later]=base+extra;if(!firstCollision(entries,delays,0.05,0.05))return delays;}delays[later]=base;return delays;}
function proposedCalibrate(entries){const delays=entries.map(e=>e.configuredDelay),opts={step:0.005,margin:0.25};if(!firstCollision(entries,delays,opts.step,opts.margin))return delays;const order=delays.map((d,i)=>({i,d})).sort((a,b)=>a.d-b.d||a.i-b.i);const later=order[order.length-1].i,base=delays[later];let firstSafe=null;for(let extra=0.05;extra<=8.0+1e-9;extra+=0.05){delays[later]=base+extra;if(!firstCollision(entries,delays,opts.step,opts.margin)){firstSafe=delays[later];break;}}if(firstSafe===null)return null;delays[later]=firstSafe+0.20;return firstCollision(entries,delays,opts.step,opts.margin)?null:delays;}
let reproduced=true;
for(const [name,plan] of [["MISSION_003",M3],["MISSION_004",M4]]){
 const e=buildEntries(plan),configured=e.map(x=>x.configuredDelay),coarse=coarseCalibrate(e),fineAtCoarse=firstCollision(e,coarse,0.005,0.25),proposed=proposedCalibrate(e),proposedCollision=proposed?firstCollision(e,proposed,0.005,0.25):{time:-1};
 console.log(name);
 console.log("  configured delays: fire="+configured[0].toFixed(2)+"s police="+configured[1].toFixed(2)+"s");
 console.log("  Build 013M.9 coarse calibrated police delay: "+coarse[1].toFixed(2)+"s");
 console.log("  strict 0.005s / 0.25m check at coarse result: "+(fineAtCoarse?"COLLISION @ "+fineAtCoarse.time.toFixed(3)+"s":"NO COLLISION"));
 console.log("  proposed effective police delay: "+(proposed?proposed[1].toFixed(2)+"s":"NONE"));
 console.log("  proposed strict result: "+(proposedCollision?"COLLISION":"CLEAR"));
 if(!fineAtCoarse||!proposed||proposedCollision||proposed[1]<4.95)reproduced=false;
}
console.log("STATUS: "+(reproduced?"REPRODUCED":"FAILED"));
process.exit(reproduced?0:1);
