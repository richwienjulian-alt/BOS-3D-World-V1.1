#!/usr/bin/env node
"use strict";
const fs=require("fs"),vm=require("vm"),path=require("path");
const buildDir=process.argv[2], controllerPath=process.argv[3];
if(!buildDir||!controllerPath){console.error("Usage: node mission-002-post-m004-start-validator.js <buildDir> <arena-controller.js>");process.exit(2);}
function ctx(){const q={log(){},error(){},warn(){},group(){},groupEnd(){}};const c={window:{},console:q,Math,JSON,Object,Array,Number,String,Boolean,Date,isFinite,parseInt,parseFloat,setTimeout,clearTimeout};c.window.window=c.window;vm.createContext(c);return c;}
function load(c,f){vm.runInContext(fs.readFileSync(f,"utf8"),c,{filename:f});}
function createArena(c){
 const plan=c.window.MISSION_BOS_ARENA_EVENT_PLAN,towerIds=["MAST_A","MAST_B","MAST_C","MAST_D","MAST_E"];
 const layout={mobileTowers:towerIds.map((id,i)=>({id,worldRect:{x:i*10,z:i*5,width:2,depth:2},height:18}))};
 const associationPlan={towers:towerIds.map(id=>({referenceId:id,available:true,coverageInfluences:[]})),selectionModel:{}};
 const pos={};(plan.crowd||[]).forEach(a=>pos[a.id]={x:a.position.x,y:0,z:a.position.z});
 const renderer={setVisible(){return true;},update(){},reset(){return true;},getActorPosition(id){return pos[id]||{x:30,z:-30};},getPhonePosition(id){const d=(plan.visiblePhoneEndpoints||[]).find(e=>e.id===id);return d&&pos[d.actorId]||{x:30,z:-30};},getManifest(){return{status:"PASSED",actual:{crowdActors:12}};},getSafetyStatus(){return{status:"PASSED",fatal:false};}};
 const cellSafety={status:"FAILED",fatal:false,recoverableWarnings:1,warnings:["association handover"]};
 const cells=towerIds.map(id=>({towerId:id,currentLoad:35}));
 const cellLoad={setDynamicCivilianContributions(){return true;},getCellLoad(){return 35;},getCell(id){return cells.find(c=>c.towerId===id)||null;},getAllCells(){return cells;},getSafetyStatus(){return Object.assign({},cellSafety);}};
 const radio={createDecisionState(){return{};},updateDecision(s){s.servingTowerId="MAST_E";s.servingScore=1;return s;}};
 const runtime=c.window.MissionBosArenaEventController.create({plan,validation:{status:"PASSED"},validator:{},renderer,layout,propsPlan:{},trafficPlan:{},pedestrianPlan:{},ambulancePlan:{},missionRegistryPlan:{},associationPlan,radioModel:radio,cellLoadPlan:{},cellLoadRuntime:cellLoad,mission001Runtime:{getState(){return"READY";}},missionRegistryRuntime:{getActiveMissionId(){return null;}},ambulanceFoundationRuntime:{getState(){return"AT_STATION";},isActive(){return false;}},isBosActive(){return false;},isManualLoadActive(){return false;},ui:{}});
 runtime.update(0.30,0.30,"READY"); return {runtime,cellLoad};
}
const c=ctx();load(c,path.join(buildDir,"city-arena-event-plan.js"));load(c,controllerPath);load(c,path.join(buildDir,"city-mission-002-plan.js"));load(c,path.join(buildDir,"city-mission-002-controller.js"));
const {runtime:arena,cellLoad}=createArena(c);
const passSafety={getSafetyStatus(){return{status:"PASSED",fatal:false};}};
const scene={setState(){return true;},update(){},reset(){return true;},getManifest(){return{status:"PASSED"};},getSafetyStatus:passSafety.getSafetyStatus,dispose(){}};
const ambulance={startClearingCorridor(){return true;},dispatchToArena(){return true;},transportToHospital(){return true;},returnToStation(){return true;},getState(){return"AT_STATION";},getSafetyStatus:passSafety.getSafetyStatus};
const traffic={requestYieldAtDistance(){return true;},isVehicleYielded(){return true;},releaseYield(){return true;},getYieldStatus(){return{status:"YIELDED"};}};
const registry={getSelectedMissionId(){return"MISSION_002";},getActiveMissionId(){return null;}};
const network={beginMission(){return true;},setTargetLoad(){return true;},activateBOS(){return false;},endMission(){return true;},getLoad(){return 38;},isBOSActive(){return false;},isReadyForMissionStart(){return true;},getSafetyStatus:passSafety.getSafetyStatus};
const capacity={getSafetyStatus:passSafety.getSafetyStatus};
const m2=c.window.MissionBosMission002Controller.create({plan:c.window.MISSION_BOS_MISSION_002_PLAN,validation:{status:"PASSED"},sceneRuntime:scene,arenaEventRuntime:arena,ambulanceRuntime:ambulance,trafficRuntime:traffic,mission001Runtime:{getState(){return"READY";}},missionRegistryRuntime:registry,ambulanceFoundationRuntime:{isActive(){return false;}},networkAdapter:network,cellLoadRuntime:cellLoad,capacityRuntime:capacity});
const baseline=typeof m2.getSharedStartBaselineStatus==="function"?m2.getSharedStartBaselineStatus():null;
const canStart=m2.canStart()===true; const started=m2.start()===true;
const ok=!!baseline&&baseline.ready===true&&canStart&&started;
console.log(JSON.stringify({status:ok?"PASSED":"FAILED",arenaSafety:arena.getSafetyStatus(),baseline,canStart,started,mission002State:m2.getState()},null,2));
process.exit(ok?0:1);
