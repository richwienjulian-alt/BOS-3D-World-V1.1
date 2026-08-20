#!/usr/bin/env node
/* Mission BOS - Build 013M.9 preparation
   Source-level regression gate. Usage:
   node build-013m9-source-regression-validator.js /path/to/implemented/build
*/
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const root=path.resolve(process.argv[2]||"."); const failures=[];
function read(name){const p=path.join(root,name);if(!fs.existsSync(p)){failures.push("Missing "+name);return "";}return fs.readFileSync(p,"utf8");}
function has(text,re,msg){if(!re.test(text))failures.push(msg);} function sha(name){const p=path.join(root,name);return fs.existsSync(p)?crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"):null;}
const plan=read("city-mission-004-plan.js"), response=read("city-mission-004-response-controller.js"), app=read("app.js");
has(plan,/build:\s*["']013M\.9["']/,"Mission 004 plan is not Build 013M.9.");
has(plan,/sourceBuildRequired:\s*["']Mission-BOS-Build-013M\.8["']/,"013M.8 is not frozen as source build.");
has(plan,/AMBULANCE_M004_TO_HOSPITAL_ROUTE/,"Mission 004 hospital route missing.");
has(plan,/NORTH_CONNECTOR/,"Corrected hospital route does not use NORTH_CONNECTOR.");
has(plan,/HOSPITAL_AMBULANCE_ACCESS/,"Corrected hospital route does not use the dedicated hospital ambulance access.");
const hospitalBlock=(plan.match(/ambulanceHospitalRoute:\s*\{[\s\S]*?\n\s*\},\s*\n\s*ambulanceReturnRouteId:/)||[])[0]||"";
if(/HOSPITAL_FORECOURT/.test(hospitalBlock)) failures.push("Corrected Mission 004 hospital route still traverses HOSPITAL_FORECOURT.");
has(plan,/outerRingTrafficReleaseRequiresAmbulanceAtHospital:\s*true/,"Plan does not freeze the outer-ring traffic release gate.");
has(response,/ambulanceAtHospital\(\)|ambulanceAtHospitalOrBeyond|AT_HOSPITAL/,"Response controller does not visibly gate traffic release on ambulance hospital progress.");
if(/firePoliceAtBase\(\)\s*&&\s*isSceneCleared\(\)\s*&&\s*ambulanceOutsideClosureZone\(\)\s*\)\s*\{\s*releaseTrafficYields/s.test(response)) failures.push("013M.8 early ring-traffic release condition is still active without the hospital-arrival gate.");
has(app,/ambulanceSafetyStatus|ambulanceSafetyErrors/,"Real Mission 004 ambulance completion trace does not expose ambulance runtime safety details.");
has(app,/MissionBosMission004AmbulanceCompletionTrace|MissionBosMission004AmbulanceReturnTrace/,"Mission 004 real ambulance completion trace is missing.");
const protectedHashes={
  "city-mission-001-controller.js":"96f753267f4fe3bb398faf954103ffd911de104d0ea096422e68464c5ddc9bfc",
  "city-mission-002-controller.js":"626e05115aead65238dbbef45b12b898d75a1e09afa24a2351be74c3e5f18a30",
  "city-mission-003-controller.js":"bd084223be8e8e12288e21df32b8e38fe631dc27c0c64071902e5a94cfa266b3",
  "city-customer-dashboard-plan.js":"6006d4d94472f55b18464d09d690914ad3617744de51db93f343258eae05f52c",
  "city-customer-dashboard-contract.js":"2e1689867aee21004aff11f50e7ceafc40db72fedeb24b84cd60925c65b294ad",
  "city-network-radio-model.js":"d41607faa2c1d36419f070033f727376b2a8445bd9c93c35abc5148071142294",
  "city-network-association-controller.js":"1d75f1f0e8fa8e3e66f3460ee9b02d7bf36ce032afe3b3daae2ab23716fb1bef",
  "city-cell-load-controller.js":"dda0622f910aeee757d969217a437136fdafa9122b2f8fbb8105bd2ca5df9235",
  "city-auto-bos-priority-controller.js":"f68560e1281dd7463304ec188986984f4629b9db028c5dcef9f86f88f338e0df",
  "city-response-vehicle-renderer.js":"2fe4038a2aa9d67ac459ebb47e6f62c05dd39dd8291574d78121e438064cdc0a",
  "city-mission-004-controller.js":"cb21cd882caccb59afa685d8c7d005b10f1af9fad6ea67a1aee4753714babe6d",
  "city-mission-004-return-maneuver-contract.js":"966f2ed6ce070ba597e12359e23797d3a84633f00ad05b8e6a6602eeca1ca61e",
  "city-mission-004-polish-contract.js":"d254ba32e4fa53e31239e9e43bcf782ef32cd172aaa5437e53467ca3afd89658",
  "city-initial-camera-contract.js":"ac02a6bc7726418433c245ba3756a35ca8492045de6b7f003f50d8126e7b67de",
  "city-ambulance-renderer.js":"a8a01a6a3f6310267c6808960cb0118397827844fb179e319fd08614205ded79",
  "city-ambulance-plan.js":"5bf854db7dc2a39da577c4e9f18fd7caf4bf7256ae13fae82e66dc400a93adda",
  "city-pedestrian-plan.js":"ca979d6b379bb7d8c3fc3a0f522617f4029a296333680b10fb2c2301cb8a44b7",
  "city-pedestrian-renderer.js":"634c5b48b36c5df0af347fe96eeed573ba323d189e77e202545cf0122c7c950d",
  "city-traffic-plan.js":"617b4ffa560859e0a11e54b009e159f34b73b71f7201617f92a1611568b54a65"
};
for(const [name,expected] of Object.entries(protectedHashes)){const actual=sha(name);if(actual!==expected)failures.push("Protected file changed: "+name+" ("+actual+")");}
console.log("MISSION BOS BUILD 013M.9 SOURCE REGRESSION");console.log("Build directory: "+root);
if(failures.length){console.error("STATUS: FAILED");failures.forEach(x=>console.error("- "+x));process.exit(1);}console.log("STATUS: PASSED");
