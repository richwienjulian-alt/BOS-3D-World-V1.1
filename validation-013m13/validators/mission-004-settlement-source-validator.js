#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path");
const root=path.resolve(process.argv[2]||path.join(__dirname,"..","reference"));
const src=fs.readFileSync(path.join(root,"city-mission-004-controller.js"),"utf8");
const checks={
  settlementContextFunction:/function settlementContextActive\(\)/.test(src),
  diagnosticStatusExported:/getCompletionSettlementStatus:\s*getCompletionSettlementStatus/.test(src),
  networkReadyDuringSettlement:/getNetworkState:\s*function \(\) \{ return settlementContextActive\(\) \? "READY" : state; \}/.test(src),
  cellLoadReadyDuringSettlement:/getCellLoadProfileState:\s*function \(\) \{ return settlementContextActive\(\) \? "READY" : state; \}/.test(src),
  bosEndpointsEmptyDuringSettlement:/getBosEndpointIds:\s*function \(\) \{ return settlementContextActive\(\) \? \[\] :/.test(src),
  settlementStartsOnlyAfterResponseHandoff:/operationalComplete && preSettlementHandoff && preSettlementHandoff\.ready === true/.test(src),
  endMissionCheckedBeforeCommit:/var endResult = network\.endMission\(\);[\s\S]{0,180}if \(endResult === false\)/.test(src),
  concreteBlockers:/SHARED_NETWORK_NOT_READY/.test(src)&&/CELL_LOADS_NOT_BASELINE/.test(src)&&/BOS_PRIORITY_NOT_RELEASED/.test(src)&&/RESPONSE_HANDOFF_NOT_READY/.test(src)&&/MISSION_002_BASELINE_NOT_READY/.test(src),
  genericErrorRemoved:!/Mission 004 network settlement exceeded the 8 second safety deadline\./.test(src),
  boundedEightSecondGuard:/completionSettlementMaximumSeconds, 8\.0/.test(src)
};
const bad=Object.keys(checks).filter(k=>!checks[k]);
console.log("MISSION BOS 013M.13 SETTLEMENT SOURCE CONTRACT");
Object.entries(checks).forEach(([k,v])=>console.log(k+": "+(v?"PASSED":"FAILED")));
console.log("STATUS: "+(bad.length?"FAILED":"PASSED"));
if(bad.length) process.exit(1);
