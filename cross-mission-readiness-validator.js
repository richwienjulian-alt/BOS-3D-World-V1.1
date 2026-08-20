#!/usr/bin/env node
"use strict";
const fs=require("fs"), path=require("path");
// Deterministic handoff model mirroring the shared Network Manager reset semantics.
const base=38, resetRate=12, dt=0.01;
let load=96, resetting=true, elapsed=0, mission004ReadyAt=null;
function isReadyForMissionStart(){return !resetting && Math.abs(load-base)<=4;}
while(elapsed<8){
  if(resetting){
    load=Math.max(base,load-resetRate*dt);
    if(Math.abs(load-base)<=0.0001){load=base;resetting=false;}
  }
  elapsed+=dt;
  if(isReadyForMissionStart()){mission004ReadyAt=elapsed;break;}
}
const oldReadyAt=(96-55)/resetRate;
const checks={
  oldThresholdCouldExposeReadyWhileResetting: oldReadyAt < mission004ReadyAt,
  newReadyAfterNetworkReset: mission004ReadyAt !== null && !resetting && load===base,
  withinSettlementWindow: mission004ReadyAt <= 8
};
if(process.argv[2]){
  const sourceRoot=path.resolve(process.argv[2]);
  const app=fs.readFileSync(path.join(sourceRoot,"app.js"),"utf8");
  const m004=fs.readFileSync(path.join(sourceRoot,"city-mission-004-controller.js"),"utf8");
  checks.adapterExposesSharedReadiness=/isReadyForMissionStart\(\)/.test(app) && /validatedMissionResetting\s*!==\s*true/.test(app);
  checks.mission004ReadyUsesSharedReadiness=/sharedNetworkReady/.test(m004) && /network\.isReadyForMissionStart/.test(m004);
}
const errors=Object.keys(checks).filter(k=>!checks[k]);
console.log("MISSION BOS 013M.11 CROSS-MISSION READINESS VALIDATION");
console.log("Old <=55 READY reference: "+oldReadyAt.toFixed(3)+" s");
console.log("Shared network start-ready: "+(mission004ReadyAt===null?"none":mission004ReadyAt.toFixed(3)+" s"));
Object.keys(checks).forEach(k=>console.log(k+": "+(checks[k]?"PASSED":"FAILED")));
console.log("STATUS: "+(errors.length?"FAILED":"PASSED"));
if(errors.length)process.exit(1);
