#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const build=path.resolve(process.argv[2]||".");
const baselinePath=path.join(build,"BASELINE_PROTECTED_SHA256SUMS_013M_18.json");
const baseline=JSON.parse(fs.readFileSync(baselinePath,"utf8"));
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const errors=[];
let checked=0;
for(const [file,expected] of Object.entries(baseline.protectedFiles||{})){
  const p=path.join(build,file);
  if(!fs.existsSync(p)){errors.push(`${file}: missing`);continue;}
  const actual=sha(p); checked++;
  if(actual!==expected) errors.push(`${file}: sha mismatch expected=${expected} actual=${actual}`);
}
const requiredNew=[
  "city-touch-camera-plan.js","touch-camera-validator.js","city-touch-camera-controller.js",
  "city-customer-incident-presentation-plan.js","customer-incident-presentation-validator.js"
];
for(const file of requiredNew){if(!fs.existsSync(path.join(build,file))) errors.push(`${file}: required new file missing`);}
console.log(JSON.stringify({validator:"BUILD_013M18_SOURCE_REGRESSION",sourceBuild:baseline.sourceBuild,protectedChecked:checked,allowedExistingProductionChanges:baseline.allowedExistingProductionChanges,requiredNewFiles:requiredNew,status:errors.length?"FAILED":"PASSED",errors},null,2));
process.exit(errors.length?1:0);
