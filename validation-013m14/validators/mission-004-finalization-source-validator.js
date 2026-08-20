#!/usr/bin/env node
"use strict";
const fs=require("fs"), path=require("path");
const root=process.argv[2]?path.resolve(process.argv[2]):path.resolve(__dirname,"..","reference");
const c=fs.readFileSync(path.join(root,"city-mission-004-controller.js"),"utf8");
const a=fs.readFileSync(path.join(root,"app.js"),"utf8");
const checks=[]; function add(label,ok){checks.push({label,ok:!!ok});}
add("M2 baseline is diagnostic/post-commit only", !/mission002BaselineReady/.test(c) && /completionPostCommitMission002Baseline/.test(c));
add("Cell load threshold is non-blocking", /CELL_LOADS_STILL_EASING_NON_BLOCKING/.test(c) && !/sharedNetworkReady\s*&&\s*cellLoadsReady\s*&&/.test(c));
add("Commit requires shared network + priority + response handoff", /if \(sharedNetworkReady && priorityReady && responseHandoffReady\)/.test(c));
add("Deterministic finalizer exists", /function finalizeSharedSettlementBaseline\(\)/.test(c));
add("Fallback starts before unchanged 8s deadline", /deterministicFinalizeAt[\s\S]{0,120}6\.0/.test(c) && /completionSettlementMaximumSeconds/.test(c));
add("Shared vehicle reset not added", !/finalizeSharedSettlementBaseline[\s\S]{0,1400}(ambulance\.reset|response\.reset)/.test(c));
add("Network adapter has guarded finalizer", /finalizeMissionSettlement\(\)[\s\S]{0,900}validatedMissionActive[\s\S]{0,900}manualLoadActive[\s\S]{0,900}validatedMissionBaseHold/.test(a));
add("Network finalizer pins exact base", /finalizeMissionSettlement\(\)[\s\S]{0,1200}networkLoad = baseLoad/.test(a));
const failed=checks.filter(x=>!x.ok);
console.log(JSON.stringify({title:"MISSION 004 FINALIZATION SOURCE",status:failed.length?"FAILED":"PASSED",checks},null,2));
process.exit(failed.length?1:0);
