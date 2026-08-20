#!/usr/bin/env node
/* Mission BOS - Build 013M.10 preparation
   Deterministic strict SAT validator for shared Fire/Police outbound sequencing.
   Usage: node response-outbound-collision-validator.js /path/to/implemented/build
*/
"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.resolve(process.argv[2]||".");const ctx={window:{},console};vm.createContext(ctx);
function load(n){const p=path.join(root,n);if(!fs.existsSync(p))throw new Error("Missing "+n);vm.runInContext(fs.readFileSync(p,"utf8"),ctx,{filename:n});}
["response-vehicle-validator.js","city-response-vehicle-plan.js","city-mission-004-foundation-plan.js","city-mission-004-plan.js","city-mission-003-response-plan.js"].forEach(load);
const V=ctx.window.MissionBosResponseVehicleValidator,B=ctx.window.MISSION_BOS_RESPONSE_VEHICLE_PLAN,M4=ctx.window.MISSION_BOS_MISSION_004_PLAN,M3=ctx.window.MISSION_BOS_MISSION_003_RESPONSE_PLAN;
const routes=Object.fromEntries(B.routes.map(r=>[r.id,r])),vehicles=Object.fromEntries(B.vehicles.map(v=>[v.id,v]));
function prefix(route,end){const pts=route.points.map(p=>({x:+p.x,z:+p.z}));let bi=0,bd=Infinity;pts.forEach((p,i)=>{const d=(p.x-end.x)**2+(p.z-end.z)**2;if(d<bd){bd=d;bi=i;}});return pts.slice(0,bi+1);}
function entries(plan){return ["RESPONSE_FIRE_01","RESPONSE_POLICE_01"].map(id=>{let vp=plan.routeProfile?plan.routeProfile.vehicles.find(v=>v.vehicleId===id):(id==="RESPONSE_FIRE_01"?plan.response.fireRoute:plan.response.policeRoute);const def={...vehicles[id],outboundSpeed:+vp.outboundSpeed};const route=V.prepareOpenRoute({points:prefix(routes[vp.baselinePrefixRouteId],vp.baselinePrefixEnd).concat(vp.extensionWaypoints)});return{id,route,def,configured:+vp.dispatchDelaySeconds};});}
function collision(es,delays,step=0.005,margin=0.25){let duration=0;es.forEach((e,i)=>duration=Math.max(duration,delays[i]+e.route.length/e.def.outboundSpeed+0.5));for(let t=0;t<=duration+1e-9;t+=step){const poses=es.map((e,i)=>V.sampleOpenRoute(e.route,Math.min(e.route.length,Math.max(0,t-delays[i])*e.def.outboundSpeed),false));const A=V.rectangleCorners(poses[0],es[0].def.footprintLength,es[0].def.footprintWidth,margin),P=V.rectangleCorners(poses[1],es[1].def.footprintLength,es[1].def.footprintWidth,margin);if(V.polygonsOverlapSAT(A,P))return{time:t,poses};}return null;}
function calibrate(es){const ds=es.map(e=>e.configured);if(!collision(es,ds))return ds;const order=ds.map((d,i)=>({i,d})).sort((a,b)=>a.d-b.d||a.i-b.i);const later=order[order.length-1].i,base=ds[later];let firstSafe=null;for(let extra=0.05;extra<=8.0+1e-9;extra+=0.05){ds[later]=base+extra;if(!collision(es,ds)){firstSafe=ds[later];break;}}if(firstSafe===null)return null;ds[later]=firstSafe+0.20;return collision(es,ds)?null:ds;}
const failures=[];
for(const [name,plan] of [["MISSION_003",M3],["MISSION_004",M4]]){const es=entries(plan),ds=calibrate(es);if(!ds){failures.push(name+" has no safe outbound calibration.");continue;}const hit=collision(es,ds);console.log(name+" effective delays fire="+ds[0].toFixed(2)+"s police="+ds[1].toFixed(2)+"s; strict SAT="+(hit?"COLLISION":"CLEAR"));if(hit)failures.push(name+" still collides at "+hit.time.toFixed(3)+"s.");if(ds[1]<4.95)failures.push(name+" police delay below 4.95s.");if(Math.abs(ds[1]-5.00)>0.051)failures.push(name+" reference effective police delay is not approximately 5.00s.");}
console.log("MISSION BOS BUILD 013M.10 OUTBOUND COLLISION VALIDATION");if(failures.length){console.error("STATUS: FAILED");failures.forEach(x=>console.error("- "+x));process.exit(1);}console.log("STATUS: PASSED");
