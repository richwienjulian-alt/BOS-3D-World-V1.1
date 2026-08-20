#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path");
const root=path.resolve(process.argv[2]||__dirname);
const response=fs.readFileSync(path.join(root,"city-mission-004-response-controller.js"),"utf8");
const m4=fs.readFileSync(path.join(root,"city-mission-004-controller.js"),"utf8");
const checks={
  baselineCompletionCallsFullResponseReset:/if \(!response\.reset\(\)\) \{ fail\("Mission 004 response reset failed before READY/.test(m4),
  responseResetIgnoresAmbulanceResetResult:/if \(ambulance\.getState && ambulance\.getState\(\) === "AT_STATION"\) ambulance\.reset\(\);/.test(response),
  responseResetIgnoresFirePoliceResetResult:/if \(response\.getState && response\.getState\(\) === "AT_STATIONS"\) response\.reset\(\);/.test(response)
};
const reproduced=Object.values(checks).every(Boolean);
console.log("MISSION BOS 013M.11 M004->M002 HANDOFF ROOT CAUSE");
Object.entries(checks).forEach(([k,v])=>console.log(k+": "+(v?"REPRODUCED":"NOT FOUND")));
console.log("STATUS: "+(reproduced?"REPRODUCED":"FAILED"));
if(!reproduced)process.exit(1);
