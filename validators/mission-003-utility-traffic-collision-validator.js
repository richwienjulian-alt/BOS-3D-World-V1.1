#!/usr/bin/env node
"use strict";
const path=require('path'),G=require('./geometry-utils');const root=path.resolve(process.argv[2]||'.');
const W=G.loadGlobals(root,['city-traffic-plan.js','city-mission-003-response-plan.js','city-mission-003-stadtwerke-foundation-plan.js']);
const T=W.MISSION_BOS_TRAFFIC_PLAN,P=W.MISSION_BOS_MISSION_003_RESPONSE_PLAN,F=W.MISSION_BOS_MISSION_003_STADTWERKE_FOUNDATION_PLAN;
const failures=[];if(!T||!P||!F)failures.push('Required plans unavailable.');
const vanDef=T.vehicles.find(v=>v.id==='VAN_SUPPORT_01'),vanDefRoute=T.routes.find(r=>r.id==='SOUTH_SUPPORT_LOOP');const cfg=P&&P.supportTrafficYield;
if(!cfg||cfg.vehicleId!=='VAN_SUPPORT_01'||cfg.routeId!=='SOUTH_SUPPORT_LOOP')failures.push('Mission 003 support traffic yield is missing.');
if(!cfg||JSON.stringify(Array.from(cfg.safeHoldDistances||[]).map(Number))!==JSON.stringify([4,25,43]))failures.push('Mission 003 safe support hold distances differ from 4/25/43m.');
if(!cfg||cfg.mustBeConfirmedBeforeDispatch!==true||cfg.releaseOnlyAfterAllRespondersAtBase!==true)failures.push('Mission 003 dispatch/release yield gates are incomplete.');
const vanRoute=G.prepare(vanDefRoute.points,true);const utilEntry=P.routeProfile.vehicles.find(v=>v.vehicleId==='STADTWERKE_01');const utilRoute=G.prepare(utilEntry.routeWaypoints,false);const utilDims=F.vehicle.dimensions;
function hitAtHold(hold,margin=.10){const vp=G.sample(vanRoute,hold),vc=G.corners(vp,vanDef.footprintLength,vanDef.footprintWidth,margin);for(let d=0;d<=utilRoute.length+1e-9;d+=.02){const up=G.sample(utilRoute,d),uc=G.corners(up,utilDims.footprintLength,utilDims.footprintWidth,margin);if(G.overlap(vc,uc))return true;}return false;}
for(const h of (cfg&&cfg.safeHoldDistances||[]))if(hitAtHold(+h))failures.push('Safe support hold '+h+'m overlaps the Stadtwerke swept path.');
let baselineHits=0,first=null;const period=vanRoute.length/Number(vanDef.speed),uSpeed=Number(utilEntry.outboundSpeed),uDelay=Number(utilEntry.dispatchDelaySeconds);for(let phase=0;phase<period-1e-9;phase+=.05){let hit=false;for(let t=uDelay;t<=uDelay+utilRoute.length/uSpeed+.5;t+=.01){const up=G.sample(utilRoute,Math.max(0,t-uDelay)*uSpeed),vp=G.sample(vanRoute,phase*Number(vanDef.speed)+t*Number(vanDef.speed));if(G.overlap(G.corners(up,utilDims.footprintLength,utilDims.footprintWidth,.10),G.corners(vp,vanDef.footprintLength,vanDef.footprintWidth,.10))){hit=true;if(!first)first={phase,t};break;}}if(hit)baselineHits++;}
if(baselineHits===0)failures.push('Baseline collision reproduction did not detect the known VAN_SUPPORT_01 conflict.');
const maxGap=29.116551,maxWait=maxGap/Number(vanDef.speed);if(maxWait>8.001)failures.push('Support yield can exceed 8s wait.');
console.log(JSON.stringify({validator:'MISSION_003_UTILITY_TRAFFIC',baselineCollisionPhases:baselineHits,firstCollision:first,safeHolds:Array.from((cfg&&cfg.safeHoldDistances)||[]),maxWaitSeconds:+maxWait.toFixed(6),status:failures.length?'FAILED':'PASSED'},null,2));
if(failures.length){failures.forEach(x=>console.error('- '+x));process.exit(1);}
