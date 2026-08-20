#!/usr/bin/env node
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const buildDir = process.argv[2];
const controllerPath = process.argv[3];
if (!buildDir || !controllerPath) {
  console.error("Usage: node arena-event-recoverable-warning-validator.js <buildDir> <arena-controller.js>");
  process.exit(2);
}

function makeContext() {
  const quiet = { log(){}, error(){}, warn(){}, group(){}, groupEnd(){} };
  const context = { window: {}, console: quiet, Math, JSON, Object, Array, Number, String, Boolean, Date, isFinite, parseInt, parseFloat, setTimeout, clearTimeout };
  context.window.window = context.window;
  vm.createContext(context);
  return context;
}
function load(context, file) {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
}
function arenaOptions(context, cellSafety) {
  const plan = context.window.MISSION_BOS_ARENA_EVENT_PLAN;
  const towerIds = ["MAST_A","MAST_B","MAST_C","MAST_D","MAST_E"];
  const layout = { mobileTowers: towerIds.map((id,i)=>({id, worldRect:{x:i*10,z:i*5,width:2,depth:2}, height:18})) };
  const associationPlan = { towers: towerIds.map(id=>({referenceId:id,available:true,siteCalibrationOffset:0,coverageInfluences:[]})), selectionModel:{} };
  const actorPos = Object.create(null);
  (plan.crowd||[]).forEach(a=>{ actorPos[a.id] = {x:a.position.x,y:a.position.y||0,z:a.position.z}; });
  const renderer = {
    visible:false,
    setVisible(v){this.visible=!!v; return true;}, update(){}, reset(){this.visible=false; return true;},
    getActorPosition(id){return actorPos[id] || {x:30,y:0,z:-30};},
    getPhonePosition(endpointId){
      const def=(plan.visiblePhoneEndpoints||[]).find(e=>e.id===endpointId);
      return def && actorPos[def.actorId] ? actorPos[def.actorId] : {x:30,y:1.4,z:-30};
    },
    getManifest(){return {status:"PASSED", actual:{crowdActors:12}};},
    getSafetyStatus(){return {status:"PASSED",fatal:false};}
  };
  let currentCellSafety = Object.assign({}, cellSafety);
  const cells = towerIds.map(id=>({towerId:id,currentLoad: id==="MAST_E"?32:35}));
  const cellLoadRuntime = {
    setDynamicCivilianContributions(){return true;}, getCellLoad(id){const c=cells.find(x=>x.towerId===id); return c?c.currentLoad:0;},
    getCell(id){return cells.find(x=>x.towerId===id)||null;}, getAllCells(){return cells.map(x=>Object.assign({},x));},
    getSafetyStatus(){return Object.assign({}, currentCellSafety);},
    _setSafety(v){currentCellSafety=Object.assign({},v);}
  };
  const radioModel = {
    createDecisionState(){return {servingTowerId:null,servingScore:0};},
    updateDecision(state){state.servingTowerId="MAST_E";state.servingScore=1;state.status="PASSED";return state;}
  };
  return {
    plan, validation:{status:"PASSED"}, validator:{validate(){return {status:"PASSED"};},logResult(){}}, renderer, layout,
    propsPlan:{}, trafficPlan:{}, pedestrianPlan:{}, ambulancePlan:{}, missionRegistryPlan:{}, associationPlan, radioModel,
    cellLoadPlan:{}, cellLoadRuntime, mission001Runtime:{getState(){return "READY";}},
    missionRegistryRuntime:{getActiveMissionId(){return null;}}, ambulanceFoundationRuntime:{getState(){return "AT_STATION";},isActive(){return false;}},
    isBosActive(){return false;}, isManualLoadActive(){return false;}, ui:{}
  };
}
function createArena(controllerSource, cellSafety) {
  const context = makeContext();
  load(context, path.join(buildDir,"city-arena-event-plan.js"));
  load(context, controllerSource);
  const options = arenaOptions(context, cellSafety);
  const runtime = context.window.MissionBosArenaEventController.create(options);
  return {context, runtime, options};
}
function testController(controllerSource) {
  const recoverable = createArena(controllerSource,{status:"FAILED",fatal:false,recoverableWarnings:1,warnings:["handover"]});
  recoverable.runtime.update(0.30,0.30,"READY");
  const recoverableAfterUpdate = recoverable.runtime.getSafetyStatus();
  const stateAfterWarning = recoverable.runtime.getState();
  const activateRecoverable = recoverable.runtime.activateForMission("MISSION_002") === true;

  const fatal = createArena(controllerSource,{status:"FAILED",fatal:true,errors:["fatal"]});
  fatal.runtime.update(0.30,0.30,"READY");
  const fatalSafety = fatal.runtime.getSafetyStatus();
  const fatalState = fatal.runtime.getState();
  const activateFatal = fatal.runtime.activateForMission("MISSION_002") === true;

  return { stateAfterWarning, recoverableSafety:recoverableAfterUpdate, activateRecoverable, fatalState, fatalSafety, activateFatal };
}
const result = testController(controllerPath);
const pass = result.stateAfterWarning === "INACTIVE" && result.recoverableSafety.status === "PASSED" &&
  Number(result.recoverableSafety.recoverableWarnings||0) >= 1 && result.activateRecoverable === true &&
  result.fatalState === "FAILED" && result.activateFatal === false;
console.log(JSON.stringify({status:pass?"PASSED":"FAILED",controller:controllerPath,result},null,2));
process.exit(pass?0:1);
