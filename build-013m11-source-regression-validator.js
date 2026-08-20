#!/usr/bin/env node
"use strict";
const fs=require("fs"), path=require("path"), crypto=require("crypto");
const root=process.argv[2] ? path.resolve(process.argv[2]) : __dirname;
const expected={
"city-response-vehicle-renderer.js":"fcbdacf8c87b25b73aed4d247f10d5af770078600c532671e9f34cdf8fe2459d",
"city-mission-004-response-controller.js":"5c0b745abdaf68a2197dd1426f3d0548931322a38533ac766af437bf0237fe81",
"city-mission-004-plan.js":"dd497caef6a3ea1869a589e463c930d37abd9b884543195eb4d3a288e2b90834",
"city-ambulance-renderer.js":"a8a01a6a3f6310267c6808960cb0118397827844fb179e319fd08614205ded79",
"city-cell-load-controller.js":"dda0622f910aeee757d969217a437136fdafa9122b2f8fbb8105bd2ca5df9235",
"city-network-association-controller.js":"1d75f1f0e8fa8e3e66f3460ee9b02d7bf36ce032afe3b3daae2ab23716fb1bef",
"city-auto-bos-priority-controller.js":"f68560e1281dd7463304ec188986984f4629b9db028c5dcef9f86f88f338e0df",
"index.html":"b78b4cb0938fc4b083e028717577d64d02d3bda24370a84aba3bd4bba2f58f53",
"style.css":"44aaa0da36ab312a8df0953e9760d120fb9c82ddc8b58ad87c704d7f881def95",
"city-mission-002-plan.js":"53fb4ea72002871424b170b33425a63bd9fe58cfddaf26fd779fb244b9daa2c8",
"city-mission-registry-controller.js":"64a04248b99daf645998f72d265cf3e528295a4e31efe8a447e5c4277c2aaa7a",
"city-mission-003-controller.js":"bd084223be8e8e12288e21df32b8e38fe631dc27c0c64071902e5a94cfa266b3",
"city-mission-003-response-plan.js":"3fb3620b7cb9504f14d3b1050d97ef0c23c73591c3e226b577ef356dfa5eb36d",
"city-mission-004-scene-renderer.js":"935c17aaaff48fdaccf287d3cdd480a0c20bc622c185957a24fa698a7ae24675",
"city-customer-dashboard-plan.js":"6006d4d94472f55b18464d09d690914ad3617744de51db93f343258eae05f52c",
"city-customer-dashboard-contract.js":"2e1689867aee21004aff11f50e7ceafc40db72fedeb24b84cd60925c65b294ad"
};
const results=[];
for(const [name,hash] of Object.entries(expected)){
 const file=path.join(root,name); let actual="MISSING";
 if(fs.existsSync(file)) actual=crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
 results.push({name,passed:actual===hash,actual,expected:hash});
}
const failed=results.filter(r=>!r.passed);
console.log("MISSION BOS BUILD 013M.11 SOURCE REGRESSION VALIDATION");
results.forEach(r=>console.log((r.passed?"PASS":"FAIL")+" "+r.name));
console.log("STATUS: "+(failed.length?"FAILED":"PASSED"));
if(failed.length)process.exit(1);
