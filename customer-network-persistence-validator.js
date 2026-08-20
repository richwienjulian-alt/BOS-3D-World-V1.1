#!/usr/bin/env node
"use strict";
const fs=require("fs"), path=require("path");
const root=process.argv[2] ? path.resolve(process.argv[2]) : __dirname;
const source=fs.readFileSync(path.join(root,"app.js"),"utf8");
const checks={
  noTransientCellLoadHide: !/cellLoadSection\.hidden\s*=\s*true/.test(source),
  persistentCellLoadSurface: /cellLoadSection\.hidden\s*=\s*false/.test(source),
  fatalAwareSnapshotGate: /safety\.fatal\s*===\s*true/.test(source) && !/if\s*\(!safety\s*\|\|\s*safety\.status\s*!==\s*["']PASSED["']\)\s*return\s+null/.test(source.slice(source.indexOf("function getValidatedCellLoadSnapshot"), source.indexOf("function getValidatedCellCapacitySnapshot"))),
  lastKnownGoodFallback: /lastValidCellLoadDashboardSnapshot/.test(source) && /snapshotState/.test(source),
  networkReadinessMethod: /isReadyForMissionStart\(\)/.test(source) && /validatedMissionResetting\s*!==\s*true/.test(source)
};
const errors=Object.keys(checks).filter(k=>!checks[k]);
console.log("MISSION BOS 013M.11 CUSTOMER NETWORK PERSISTENCE VALIDATION");
Object.keys(checks).forEach(k=>console.log(k+": "+(checks[k]?"PASSED":"FAILED")));
console.log("STATUS: "+(errors.length?"FAILED":"PASSED"));
if(errors.length)process.exit(1);
