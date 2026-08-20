#!/usr/bin/env node
"use strict";
// Conservative pure settlement model. It deliberately starts from 100% global/cell load
// although the real mission normally enters final settlement much lower.
const step=0.005;
const resetRate=12;
const baseGlobal=38;
const startGlobal=100;
const startCell=100;
const cellReadyLimit=55;
const worstBaselineCurrentLoad=50; // highest static base 42 + all eight M004 civilian units as a conservative upper bound
const priorityReleaseThreshold=85;
const priorityReleaseDelay=1.5;
const deadline=8;
let t=0,global=startGlobal,cell=startCell,priorityActive=true,releaseStable=0;
function move(v,target,max){if(Math.abs(target-v)<=max)return target;return v+Math.sign(target-v)*max;}
let networkReadyAt=null,cellReadyAt=null,priorityReadyAt=null;
while(t<=deadline+step){
  global=move(global,baseGlobal,resetRate*step);
  cell=move(cell,worstBaselineCurrentLoad,resetRate*step);
  if(networkReadyAt===null && Math.abs(global-baseGlobal)<=1e-9) networkReadyAt=t+step;
  if(cellReadyAt===null && cell<=cellReadyLimit+1e-9) cellReadyAt=t+step;
  if(priorityActive){
    if(cell<priorityReleaseThreshold){releaseStable+=step;} else {releaseStable=0;}
    if(releaseStable+1e-9>=priorityReleaseDelay){priorityActive=false;priorityReadyAt=t+step;}
  }
  t+=step;
  if(networkReadyAt!==null&&cellReadyAt!==null&&!priorityActive)break;
}
const readyAt=Math.max(networkReadyAt??Infinity,cellReadyAt??Infinity,priorityReadyAt??Infinity);
const checks={
  networkConverges:networkReadyAt!==null,
  cellLoadConverges:cellReadyAt!==null,
  priorityReleases:priorityReadyAt!==null,
  allWithinDeadline:Number.isFinite(readyAt)&&readyAt<deadline,
  safetyMarginSeconds:Number.isFinite(readyAt)&&(deadline-readyAt)>2.5
};
console.log("MISSION BOS 013M.13 CONSERVATIVE SETTLEMENT CONVERGENCE");
console.log("networkReadyAt="+networkReadyAt.toFixed(3)+"s");
console.log("cellReadyAt="+cellReadyAt.toFixed(3)+"s");
console.log("priorityReadyAt="+priorityReadyAt.toFixed(3)+"s");
console.log("allReadyAt="+readyAt.toFixed(3)+"s; deadline="+deadline.toFixed(1)+"s");
Object.entries(checks).forEach(([k,v])=>console.log(k+": "+(v?"PASSED":"FAILED")));
const bad=Object.keys(checks).filter(k=>!checks[k]);
console.log("STATUS: "+(bad.length?"FAILED":"PASSED"));
if(bad.length)process.exit(1);
