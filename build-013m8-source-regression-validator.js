#!/usr/bin/env node
/* Mission BOS - Build 013M.8 preparation
   Source-level regression gate. Usage:
   node build-013m8-source-regression-validator.js /path/to/implemented/build
*/
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const root = path.resolve(process.argv[2] || ".");
const failures = [];
function read(name){ const p=path.join(root,name); if(!fs.existsSync(p)){failures.push("Missing " + name);return "";} return fs.readFileSync(p,"utf8"); }
function has(text,re,msg){ if(!re.test(text)) failures.push(msg); }
function sha(name){ const p=path.join(root,name); return fs.existsSync(p) ? crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex") : null; }
const plan=read("city-mission-004-plan.js");
const response=read("city-mission-004-response-controller.js");
const ambulance=read("city-ambulance-renderer.js");
const app=read("app.js");

has(plan,/build:\s*["']013M\.8["']/,"Mission 004 plan is not Build 013M.8.");
has(plan,/AMBULANCE_M004_HOSPITAL_TO_STATION_ROUTE/,"Mission-scoped ambulance hospital return route missing.");
has(plan,/ambulanceReturnCommandStateDeadlineSeconds:\s*0\.35/,"Ambulance return state deadline missing.");
has(plan,/ambulanceReturnMaximumSeconds:\s*6\.0/,"Ambulance return maximum missing.");
has(ambulance,/hospitalReturnRoute/,"Ambulance renderer does not accept a full profile hospitalReturnRoute.");
has(ambulance,/prepareOpenRoute\([^\n]*hospitalReturnRoute|preparedReturn|returnRouteDefinition/i,"Ambulance renderer does not visibly prepare the profile return route.");
has(response,/AT_HOSPITAL/,"Mission 004 response controller has no hospital return state handling.");
has(response,/ambulance\.getState\s*&&\s*ambulance\.getState\(\)\s*===\s*["']RETURNING["']|getState\(\)\s*===\s*["']RETURNING["']/,"Mission 004 must verify the actual ambulance RETURNING runtime state.");
if (/isAmbulanceReturning:\s*function\s*\(\)\s*\{[^}]*ambulanceReturnIssued\s*\|\|/s.test(response)) failures.push("isAmbulanceReturning still treats the command flag alone as proof of movement.");
has(app,/MissionBosMission004AmbulanceReturnTrace|Mission004AmbulanceReturnTrace/,"Actual Mission 004 ambulance return trace is not exposed from the real app runtime.");
has(app,/camera\.position\.set\(\s*0\.78\s*,\s*9(?:\.0)?\s*,\s*46(?:\.0)?\s*\)/,"Low initial camera position (0.78, 9, 46) not found.");
has(app,/currentPitch\s*=\s*-0\.1786310065|targetPitch\s*=\s*currentPitch\s*=\s*-0\.1786310065|let\s+targetPitch\s*=\s*-0\.1786310065/,"Low initial camera pitch not found.");

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
  "city-response-vehicle-renderer.js":"2fe4038a2aa9d67ac459ebb47e6f62c05dd39dd8291574d78121e438064cdc0a"
};
for(const [name,expected] of Object.entries(protectedHashes)){ const actual=sha(name); if(actual!==expected) failures.push("Protected file changed: " + name + " (" + actual + ")"); }

console.log("MISSION BOS BUILD 013M.8 SOURCE REGRESSION");
console.log("Build directory: " + root);
if(failures.length){ console.error("STATUS: FAILED"); failures.forEach(x=>console.error("- " + x)); process.exit(1); }
console.log("STATUS: PASSED");
