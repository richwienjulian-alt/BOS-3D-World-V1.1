#!/usr/bin/env node
/* Mission BOS - Build 013M.9 preparation
   Reproduces the Build 013M.8 hospital-corridor safety defect from source geometry.
   Usage: node reference-013m8-hospital-corridor-analysis.js /path/to/Build-013M.8
*/
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.resolve(process.argv[2] || ".");
const ctx = { window: {}, console }; vm.createContext(ctx);
function load(name) { vm.runInContext(fs.readFileSync(path.join(root, name), "utf8"), ctx, { filename: name }); }
["response-vehicle-validator.js", "pedestrian-validator.js", "city-pedestrian-plan.js", "city-mission-004-foundation-plan.js", "city-mission-004-plan.js"].forEach(load);
const V = ctx.window.MissionBosResponseVehicleValidator;
const PV = ctx.window.MissionBosPedestrianValidator;
const PP = ctx.window.MISSION_BOS_PEDESTRIAN_PLAN;
const M = ctx.window.MISSION_BOS_MISSION_004_PLAN;
if (!V || !PV || !PP || !M) throw new Error("Required Build 013M.8 sources missing.");
const route = V.prepareOpenRoute(M.response.ambulanceHospitalRoute);
const pRoutes = Object.create(null); for (const r of PP.routes) pRoutes[r.id] = PV.prepareOpenRoute(r);
const pById = Object.fromEntries(PP.pedestrians.map(p => [p.id, p]));
function d(a,b){return Math.hypot(Number(a.x)-Number(b.x),Number(a.z)-Number(b.z));}
function minimumSpatial(id) {
  const ped = pById[id], pr = pRoutes[ped.routeId]; let best = Infinity;
  for (let ad=0; ad<=route.length+1e-9; ad+=0.05) {
    const ap = V.sampleOpenRoute(route, Math.min(ad, route.length), false);
    for (let pd=0; pd<=pr.length+1e-9; pd+=0.05) {
      const pp = PV.samplePathDistance(pr, Math.min(pd, pr.length)); best = Math.min(best,d(ap,pp));
    }
  }
  return best;
}
const threshold = 0.72;
const segmentStartX = 50.88, segmentEndX = 21.55, segmentZ = 29.70, speed = 5.65;
const segmentDuration = (segmentStartX - segmentEndX) / speed;
function phaseHits(id, phase) {
  const ped = pById[id], pr = pRoutes[ped.routeId];
  for (let dt=0; dt<=segmentDuration+1e-9; dt+=0.01) {
    const ambulance = { x: segmentStartX - speed*dt, z: segmentZ };
    const travel = Number(ped.startDistance) + Number(ped.initialDirection) * Number(ped.speed) * (phase + dt);
    const pp = PV.samplePingPong(pr, travel, Number(ped.initialDirection));
    if (d(ambulance,pp) < threshold) return true;
  }
  return false;
}
const ids=["PED_HEALTH_01","PED_HEALTH_02"];
const mins=Object.fromEntries(ids.map(id=>[id,minimumSpatial(id)]));
let samples=0, combinedHits=0, individual=Object.fromEntries(ids.map(id=>[id,0]));
for(let phase=0; phase<60-1e-9; phase+=0.05){samples++; let any=false; for(const id of ids){if(phaseHits(id,phase)){individual[id]++;any=true;}} if(any)combinedHits++;}
console.log("MISSION BOS 013M.8 HOSPITAL CORRIDOR ROOT-CAUSE ANALYSIS");
console.log("Runtime pedestrian stop distance: " + threshold.toFixed(2) + " m");
for(const id of ids) console.log(id+" minimum route-center distance: "+mins[id].toFixed(6)+" m; phase hits: "+individual[id]+"/"+samples);
console.log("Combined sampled entry phases with >=1 conflict: "+combinedHits+"/"+samples);
const failed = ids.some(id=>mins[id] >= threshold) || combinedHits !== samples;
console.log("STATUS: "+(failed?"FAILED":"REPRODUCED"));
process.exit(failed?1:0);
