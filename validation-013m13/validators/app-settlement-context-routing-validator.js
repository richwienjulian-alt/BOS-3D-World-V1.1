#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path");
const build=path.resolve(process.argv[2]||path.join(__dirname,"..","..","m013m12_inspect"));
const app=fs.readFileSync(path.join(build,"app.js"),"utf8");
const checks={
  contextReadsNetworkState:/const networkState = activeRuntime[\s\S]{0,180}getNetworkState/.test(app),
  contextReadsCellLoadProfileState:/const cellLoadProfileState = activeRuntime[\s\S]{0,180}getCellLoadProfileState/.test(app),
  contextReadsBosEndpointIds:/activeBosEndpointIds = activeRuntime\.getBosEndpointIds\(\)/.test(app),
  associationUsesNetworkState:/missionState: networkAssociationState/.test(app),
  cellLoadUsesCellLoadProfile:/missionState: missionContext\.cellLoadProfileState/.test(app),
  priorityUsesBosEndpointIds:/activeBosEndpointIds: missionContext\.activeBosEndpointIds/.test(app)
};
const bad=Object.keys(checks).filter(k=>!checks[k]);
console.log("MISSION BOS 013M.13 APP SETTLEMENT CONTEXT ROUTING");
Object.entries(checks).forEach(([k,v])=>console.log(k+": "+(v?"PASSED":"FAILED")));
console.log("STATUS: "+(bad.length?"FAILED":"PASSED"));
if(bad.length)process.exit(1);
