#!/usr/bin/env node
"use strict";
const fs=require("fs"),vm=require("vm"),path=require("path");
const root=path.resolve(process.argv[2]||path.join(__dirname,"..","reference"));
const base=path.resolve(process.argv[3]||path.join(__dirname,"..","..","m013m11"));
function read(name){const p=path.join(root,name);return fs.existsSync(p)?fs.readFileSync(p,"utf8"):fs.readFileSync(path.join(base,name),"utf8");}
const ctx={window:{},console:{log(){},error(){},group(){},groupEnd(){}}};vm.createContext(ctx);
vm.runInContext(read("city-mission-002-plan.js"),ctx);vm.runInContext(read("city-mission-002-controller.js"),ctx);
const plan=ctx.window.MISSION_BOS_MISSION_002_PLAN; let selected="MISSION_004", active="MISSION_004";
function safe(status="PASSED",fatal=false){return {status,fatal};}
let ambulanceState="AT_STATION", ambulanceSafety=safe(), networkReady=true;
const scene={setState(){},update(){},reset(){return true},getManifest(){return {status:"PASSED"}},getSafetyStatus(){return safe()},dispose(){}};
let arenaActive=false,owner=null;const arena={activateForMission(id){arenaActive=true;owner=id;return true},deactivateForMission(){arenaActive=false;owner=null;return true},isActive(){return arenaActive},getOwnerMissionId(){return owner},getAllAssociations(){return []},getSafetyStatus(){return safe()}};
const ambulance={startClearingCorridor(){return true},dispatchToArena(){return true},transportToHospital(){return true},returnToStation(){return true},getState(){return ambulanceState},getSafetyStatus(){return ambulanceSafety}};
const traffic={requestYieldAtDistance(){return true},isVehicleYielded(){return true},releaseYield(){return true},getYieldStatus(){return {}}};
const m1={getState(){return "READY"}};const registry={getSelectedMissionId(){return selected},getActiveMissionId(){return active}};const foundation={isActive(){return false}};
const network={beginMission(){return true},setTargetLoad(){return true},activateBOS(){return false},endMission(){return true},getLoad(){return 38},isBOSActive(){return false},isReadyForMissionStart(){return networkReady},isCapacityPrioritySettled(){return true},getSafetyStatus(){return safe()}};
const cell={getSafetyStatus(){return safe("FAILED",false)}};const cap={getSafetyStatus(){return safe()}};
const rt=ctx.window.MissionBosMission002Controller.create({plan,validation:{status:"PASSED"},sceneRuntime:scene,arenaEventRuntime:arena,ambulanceRuntime:ambulance,trafficRuntime:traffic,mission001Runtime:m1,missionRegistryRuntime:registry,ambulanceFoundationRuntime:foundation,networkAdapter:network,cellLoadRuntime:cell,capacityRuntime:cap});
const checks={};
checks.baselineReadyWhileMission004StillSelected=rt.getSharedStartBaselineStatus().ready===true;
checks.canStartStillUserGated=rt.canStart()===false;
active=null; selected="MISSION_002";
checks.immediateStartAfterSelection=rt.canStart()===true;
ambulanceSafety=safe("FAILED",true);
checks.fatalAmbulanceSafetyStillBlocks=rt.getSharedStartBaselineStatus().ready===false && rt.canStart()===false;
const bad=Object.keys(checks).filter(k=>!checks[k]);
console.log("MISSION BOS 013M.12 MISSION 002 SHARED BASELINE VALIDATION");Object.entries(checks).forEach(([k,v])=>console.log(k+": "+(v?"PASSED":"FAILED")));console.log("STATUS: "+(bad.length?"FAILED":"PASSED"));if(bad.length)process.exit(1);
