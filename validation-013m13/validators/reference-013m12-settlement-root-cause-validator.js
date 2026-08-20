#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path");
const root=path.resolve(process.argv[2]||path.join(__dirname,"..","..","m013m12_inspect"));
const src=fs.readFileSync(path.join(root,"city-mission-004-controller.js"),"utf8");
const checks={
  baselineReturnsLifecycleStateAsNetworkState:/getNetworkState:\s*function\s*\(\)\s*\{\s*return state;\s*\}/.test(src),
  baselineReturnsLifecycleStateAsCellLoadProfile:/getCellLoadProfileState:\s*function\s*\(\)\s*\{\s*return state;\s*\}/.test(src),
  baselineKeepsMission004BosIdsDuringSettlement:/getBosEndpointIds:\s*function\s*\(\)\s*\{\s*return \(plan\.network\.activeBosEndpointIds \|\| \[\]\)\.slice\(\);\s*\}/.test(src),
  baselineHasGenericEightSecondFailure:/Mission 004 network settlement exceeded the 8 second safety deadline\./.test(src),
  baselineLacksDedicatedSettlementContext:!/function settlementContextActive\(\)/.test(src)
};
const bad=Object.keys(checks).filter(k=>!checks[k]);
console.log("MISSION BOS 013M.12 SETTLEMENT ROOT-CAUSE REPRODUCTION");
Object.entries(checks).forEach(([k,v])=>console.log(k+": "+(v?"REPRODUCED":"NOT REPRODUCED")));
console.log("STATUS: "+(bad.length?"FAILED":"REPRODUCED"));
if(bad.length) process.exit(1);
