#!/usr/bin/env node
/* Mission BOS - Build 013M.10 preparation contract validator.
   Usage: node response-outbound-sequencing-contract-validator.js /path/to/implemented/build
*/
"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm");const root=path.resolve(process.argv[2]||".");const ctx={window:{},console};vm.createContext(ctx);
function load(n){const p=path.join(root,n);if(!fs.existsSync(p))throw new Error("Missing "+n);vm.runInContext(fs.readFileSync(p,"utf8"),ctx,{filename:n});}
load("city-response-outbound-sequencing-contract.js");const c=ctx.window.MISSION_BOS_RESPONSE_OUTBOUND_SEQUENCING_CONTRACT;const f=[];
function req(ok,msg){if(!ok)f.push(msg);}req(c&&c.build==="013M.10","Wrong contract build.");req(c&&c.sourceBuildRequired==="Mission-BOS-Build-013M.9","Wrong source build.");req(c.calibration.validationStepSeconds<=0.005,"Validation step is too coarse.");req(c.calibration.collisionCalibrationMarginMeters>=0.25,"Calibration margin is too small.");req(c.calibration.dispatchReserveSeconds>=0.20,"Dispatch reserve is too small.");req(c.calibration.minimumAcceptedEffectivePoliceDelaySeconds>=4.95,"Minimum effective police delay is too small.");req(c.runtime.runtimeSafetyMustRemainEnabled===true,"Runtime safety must remain enabled.");req(c.runtime.collisionSafetyBypassAllowed===false,"Safety bypass must remain forbidden.");req(c.scope.routeGeometryMayChange===false,"Routes must remain protected.");req(c.scope.mission004AmbulanceTimingMayChange===false,"Mission 004 ambulance timing must remain protected.");
console.log("MISSION BOS BUILD 013M.10 OUTBOUND SEQUENCING CONTRACT");if(f.length){console.error("STATUS: FAILED");f.forEach(x=>console.error("- "+x));process.exit(1);}console.log("STATUS: PASSED");
