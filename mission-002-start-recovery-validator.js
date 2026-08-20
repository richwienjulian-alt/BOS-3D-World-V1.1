#!/usr/bin/env node
/* Mission BOS 013M.11 - execute the real prepared Mission 002 controller with stubs. */
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const root = __dirname;
const sourceRoot = process.argv[2] ? path.resolve(process.argv[2]) : root;
const baselineRoot = process.argv[3] ? path.resolve(process.argv[3]) : path.resolve(root, "../m013m10");
function readFrom(name) {
  const p1 = path.join(sourceRoot, name);
  if (fs.existsSync(p1)) return fs.readFileSync(p1, "utf8");
  const p2 = path.join(baselineRoot, name);
  if (fs.existsSync(p2)) return fs.readFileSync(p2, "utf8");
  throw new Error("Missing source: " + name);
}
const ctx = { window: {}, console: { log(){}, error(){}, group(){}, groupEnd(){} } };
vm.createContext(ctx);
vm.runInContext(readFrom("city-mission-002-plan.js"), ctx);
vm.runInContext(readFrom("city-mission-002-controller.js"), ctx);
const plan = ctx.window.MISSION_BOS_MISSION_002_PLAN;
function safe(extra) { return Object.assign({ status: "PASSED", fatal: false }, extra || {}); }
function makeRuntime(cellSafety, networkReady) {
  const scene = { setState(){}, update(){}, reset(){return true;}, getManifest(){return {status:"PASSED"};}, getSafetyStatus(){return safe();}, dispose(){} };
  let arenaActive = false, owner = null;
  const arena = { activateForMission(id){arenaActive=true;owner=id;return true;}, deactivateForMission(){arenaActive=false;owner=null;return true;}, isActive(){return arenaActive;}, getOwnerMissionId(){return owner;}, getAllAssociations(){return [];}, getSafetyStatus(){return safe();} };
  const ambulance = { startClearingCorridor(){return true;}, dispatchToArena(){return true;}, transportToHospital(){return true;}, returnToStation(){return true;}, getState(){return "AT_STATION";}, getSafetyStatus(){return safe();} };
  const traffic = { requestYieldAtDistance(){return true;}, isVehicleYielded(){return true;}, releaseYield(){return true;}, getYieldStatus(){return {};} };
  const mission001 = { getState(){return "READY";} };
  const registry = { getSelectedMissionId(){return "MISSION_002";}, getActiveMissionId(){return null;} };
  const foundation = { isActive(){return false;} };
  const network = { beginMission(){return true;}, setTargetLoad(){return true;}, activateBOS(){return false;}, endMission(){return true;}, getLoad(){return 38;}, isBOSActive(){return false;}, isReadyForMissionStart(){return networkReady;}, isCapacityPrioritySettled(){return true;}, getSafetyStatus(){return safe();} };
  const cell = { getSafetyStatus(){return cellSafety;} };
  const capacity = { getSafetyStatus(){return safe();} };
  return ctx.window.MissionBosMission002Controller.create({ plan, validation:{status:"PASSED"}, sceneRuntime:scene, arenaEventRuntime:arena, ambulanceRuntime:ambulance, trafficRuntime:traffic, mission001Runtime:mission001, missionRegistryRuntime:registry, ambulanceFoundationRuntime:foundation, networkAdapter:network, cellLoadRuntime:cell, capacityRuntime:capacity });
}
const recoverable = makeRuntime(safe({status:"FAILED", fatal:false, recoverableWarnings:1}), true);
const fatal = makeRuntime(safe({status:"FAILED", fatal:true}), true);
const resetting = makeRuntime(safe(), false);
const checks = {
  recoverableWarningDoesNotBlock: recoverable.canStart() === true && recoverable.getSafetyStatus().status === "PASSED" && recoverable.getSafetyStatus().recoverableWarnings >= 1,
  fatalWarningBlocks: fatal.canStart() === false && fatal.getSafetyStatus().status === "FAILED",
  sharedNetworkResetBlocksUntilSettled: resetting.canStart() === false
};
const errors = Object.keys(checks).filter(k => !checks[k]);
console.log("MISSION BOS 013M.11 MISSION 002 START RECOVERY VALIDATION");
Object.keys(checks).forEach(k => console.log(k + ": " + (checks[k] ? "PASSED" : "FAILED")));
console.log("STATUS: " + (errors.length ? "FAILED" : "PASSED"));
if (errors.length) process.exit(1);
