#!/usr/bin/env node
"use strict";
const fs=require("fs"), vm=require("vm"), path=require("path");
const file=path.resolve(__dirname,"..","city-mission-004-finalization-contract.js");
const code=fs.readFileSync(file,"utf8");
const context={window:{},Object:Object}; vm.createContext(context); vm.runInContext(code,context,{filename:file});
const c=context.window.MISSION_BOS_MISSION_004_FINALIZATION_CONTRACT;
const errors=[];
if(!c) errors.push("contract missing");
if(c && c.build!=="013M.14") errors.push("wrong build");
if(c && c.sourceArchiveSha256!=="5783108e6d7b96e1b77859a9bdc90a5c549b1ea8621912df950fb54d48532d1f") errors.push("wrong source hash");
if(c && c.settlement.maximumSeconds!==8.0) errors.push("8s guard changed");
if(c && c.settlement.deterministicFinalizationAtSeconds!==6.0) errors.push("fallback timing mismatch");
if(c && c.ownership.mission004PreCommitMayNotRequire.indexOf("MISSION_002_SHARED_BASELINE_READY")<0) errors.push("M2 ownership rule missing");
if(c && c.ownership.mission004PreCommitMayNotRequire.indexOf("ALL_CELL_LOADS_AT_OR_BELOW_PRESENTATION_THRESHOLD")<0) errors.push("cell-load ownership rule missing");
if(c && c.settlement.networkAdapterMethod!=="finalizeMissionSettlement") errors.push("network finalizer missing");
console.log(JSON.stringify({title:"MISSION 004 FINALIZATION CONTRACT",status:errors.length?"FAILED":"PASSED",errors},null,2));
process.exit(errors.length?1:0);
