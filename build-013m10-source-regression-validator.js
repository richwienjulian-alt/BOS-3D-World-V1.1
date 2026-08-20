#!/usr/bin/env node
/* Mission BOS - Build 013M.10 preparation
   Source-level regression gate. Usage:
   node build-013m10-source-regression-validator.js /path/to/implemented/build
*/
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const root=path.resolve(process.argv[2]||".");const failures=[];
function read(name){const p=path.join(root,name);if(!fs.existsSync(p)){failures.push("Missing "+name);return "";}return fs.readFileSync(p,"utf8");}
function sha(name){const p=path.join(root,name);return fs.existsSync(p)?crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"):null;}
function has(text,re,msg){if(!re.test(text))failures.push(msg);}
const renderer=read("city-response-vehicle-renderer.js");
has(renderer,/OUTBOUND_COLLISION_VALIDATION_STEP_SECONDS\s*=\s*0\.005/,"Outbound validation step is not 0.005 s.");
has(renderer,/OUTBOUND_COLLISION_CALIBRATION_MARGIN_METERS[\s\S]{0,180}0\.25/,"Outbound calibration margin is not at least 0.25 m.");
has(renderer,/OUTBOUND_DISPATCH_RESERVE_SECONDS\s*=\s*0\.20/,"Outbound dispatch reserve is not 0.20 s.");
has(renderer,/calibrateOutboundDispatchDelays\s*\(/,"Shared outbound delay calibrator is missing.");
has(renderer,/routeProfileCollision\(prepared, effectiveDispatchDelays,[\s\S]*OUTBOUND_COLLISION_VALIDATION_STEP_SECONDS[\s\S]*OUTBOUND_COLLISION_CALIBRATION_MARGIN_METERS/,"Strict post-calibration SAT check is missing.");
if(/calibrateMission003DispatchDelays\s*\(/.test(renderer))failures.push("Legacy mission-003-only calibrator is still active.");
const protectedHashes={
 "city-mission-004-plan.js":"dd497caef6a3ea1869a589e463c930d37abd9b884543195eb4d3a288e2b90834",
 "city-mission-003-response-plan.js":"3fb3620b7cb9504f14d3b1050d97ef0c23c73591c3e226b577ef356dfa5eb36d",
 "city-mission-004-response-controller.js":"5c0b745abdaf68a2197dd1426f3d0548931322a38533ac766af437bf0237fe81",
 "city-ambulance-renderer.js":"a8a01a6a3f6310267c6808960cb0118397827844fb179e319fd08614205ded79",
 "city-ambulance-plan.js":"5bf854db7dc2a39da577c4e9f18fd7caf4bf7256ae13fae82e66dc400a93adda",
 "city-mission-003-controller.js":"bd084223be8e8e12288e21df32b8e38fe631dc27c0c64071902e5a94cfa266b3",
 "city-mission-004-controller.js":"cb21cd882caccb59afa685d8c7d005b10f1af9fad6ea67a1aee4753714babe6d",
 "city-customer-dashboard-plan.js":"6006d4d94472f55b18464d09d690914ad3617744de51db93f343258eae05f52c",
 "city-customer-dashboard-contract.js":"2e1689867aee21004aff11f50e7ceafc40db72fedeb24b84cd60925c65b294ad",
 "city-cell-load-controller.js":"dda0622f910aeee757d969217a437136fdafa9122b2f8fbb8105bd2ca5df9235",
 "city-network-association-controller.js":"1d75f1f0e8fa8e3e66f3460ee9b02d7bf36ce032afe3b3daae2ab23716fb1bef",
 "city-auto-bos-priority-controller.js":"f68560e1281dd7463304ec188986984f4629b9db028c5dcef9f86f88f338e0df",
 "city-traffic-renderer.js":"b50f20ac51227d4a78dda5e7af9133ce6161867977947f5cba70cc36f20c6ee4",
 "city-traffic-plan.js":"617b4ffa560859e0a11e54b009e159f34b73b71f7201617f92a1611568b54a65",
 "city-pedestrian-plan.js":"ca979d6b379bb7d8c3fc3a0f522617f4029a296333680b10fb2c2301cb8a44b7",
 "city-pedestrian-renderer.js":"634c5b48b36c5df0af347fe96eeed573ba323d189e77e202545cf0122c7c950d",
 "app.js":"30bf7cc3386e6466a037c1517e79709185e8118f892611599b122138e5327c12",
 "index.html":"b78b4cb0938fc4b083e028717577d64d02d3bda24370a84aba3bd4bba2f58f53",
 "style.css":"44aaa0da36ab312a8df0953e9760d120fb9c82ddc8b58ad87c704d7f881def95",
 "city-mission-004-return-maneuver-contract.js":"966f2ed6ce070ba597e12359e23797d3a84633f00ad05b8e6a6602eeca1ca61e",
 "city-mission-004-ambulance-corridor-contract.js":"53659c0880b664a068e6267148e27ffb85a701c4f265b701f95f8dc3b4067f52",
 "city-mission-004-ambulance-return-contract.js":"15ddf83d185d4621aabcb74d69e46140387012b38842126556e31a705a3b670e"
};
for(const [name,expected] of Object.entries(protectedHashes)){const actual=sha(name);if(actual!==expected)failures.push("Protected file changed: "+name+" ("+actual+")");}
console.log("MISSION BOS BUILD 013M.10 SOURCE REGRESSION");console.log("Build directory: "+root);
if(failures.length){console.error("STATUS: FAILED");failures.forEach(x=>console.error("- "+x));process.exit(1);}console.log("STATUS: PASSED");
