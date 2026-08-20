#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path");const root=path.resolve(process.argv[2]||path.join(__dirname,"..","reference"));
function read(n){return fs.readFileSync(path.join(root,n),"utf8")}
const m4=read("city-mission-004-controller.js"),r=read("city-mission-004-response-controller.js"),m2=read("city-mission-002-controller.js");
const checks={
  m2ExportsSharedBaseline:/getSharedStartBaselineStatus: getSharedStartBaselineStatus/.test(m2),
  m4RequiresM2Baseline:/mission002\.getSharedStartBaselineStatus/.test(m4)&&/sharedRuntimeHandoffReady/.test(m4),
  m4UsesNonMutatingFinalizer:/response\.finalizeForSharedHandoff/.test(m4),
  m4NoLongerFullResetsResponseAtReady:!/Mission 004 response reset failed before READY/.test(m4),
  responseHasHandoffInspection:/function getCrossMissionHandoffStatus\(\)/.test(r),
  responseFinalizerDoesNotCallSharedReset:/function finalizeForSharedHandoff\(\)[\s\S]*?clearMission004LocalReturnState\(\);[\s\S]*?return true/.test(r),
  resetChecksAmbulanceResult:/ambulance\.reset && ambulance\.reset\(\) !== true/.test(r),
  resetChecksResponseResult:/response\.reset && response\.reset\(\) !== true/.test(r)
};
const bad=Object.keys(checks).filter(k=>!checks[k]);console.log("MISSION BOS 013M.12 HANDOFF SOURCE CONTRACT");Object.entries(checks).forEach(([k,v])=>console.log(k+": "+(v?"PASSED":"FAILED")));console.log("STATUS: "+(bad.length?"FAILED":"PASSED"));if(bad.length)process.exit(1);
