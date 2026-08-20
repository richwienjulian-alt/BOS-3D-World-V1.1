#!/usr/bin/env node
"use strict";
const fs=require("fs"),vm=require("vm"),path=require("path");
const root=path.resolve(process.argv[2]||path.join(__dirname,".."));
const ctx={window:{},Object};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,"city-mission-004-settlement-contract.js"),"utf8"),ctx);
const c=ctx.window.MISSION_BOS_MISSION_004_SETTLEMENT_CONTRACT;
const checks={
  contractExists:!!c,
  build:c&&c.build==="013M.13",
  sourceBuild:c&&c.sourceBuildRequired==="Mission-BOS-Build-013M.12",
  singleProductionDelta:c&&JSON.stringify(c.implementationScope.requiredModifiedProductionFiles)===JSON.stringify(["city-mission-004-controller.js"]),
  lifecycleRemainsReturning:c&&c.settlementEntry.missionStateRemains==="RETURNING",
  networkNeutral:c&&c.neutralSharedContext.networkState==="READY",
  cellLoadNeutral:c&&c.neutralSharedContext.cellLoadProfileState==="READY",
  bosIdsReleased:c&&Array.isArray(c.neutralSharedContext.activeBosEndpointIds)&&c.neutralSharedContext.activeBosEndpointIds.length===0,
  timeoutStillBounded:c&&c.timeout.maximumSeconds===8&&c.timeout.mustRemainBounded===true,
  blockersRequired:c&&c.timeout.diagnosticBlockersRequired===true,
  mission002ReadyRequired:c&&c.finalCommitRequires.includes("MISSION_002_SHARED_BASELINE_READY")
};
const bad=Object.keys(checks).filter(k=>!checks[k]);
console.log("MISSION BOS 013M.13 SETTLEMENT CONTRACT");
Object.entries(checks).forEach(([k,v])=>console.log(k+": "+(v?"PASSED":"FAILED")));
console.log("STATUS: "+(bad.length?"FAILED":"PASSED"));
if(bad.length)process.exit(1);
