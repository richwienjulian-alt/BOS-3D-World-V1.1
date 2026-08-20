#!/usr/bin/env node
"use strict";
const fs=require("fs"),vm=require("vm"),path=require("path");
const controllerPath=process.argv[2]?path.resolve(process.argv[2]):path.resolve(__dirname,"..","reference","city-mission-004-controller.js");
const code=fs.readFileSync(controllerPath,"utf8");
function state(id){return {id,phaseLabel:id,stageLabel:id,statusLabel:id,progress:id==="READY"?0:100,globalNetworkTarget:id==="READY"?38:100};}
const stateIds=["READY","CALL_RECEIVED","ALARMING","ROAD_CLOSURE","ENROUTE","ON_SCENE","OVERLOADED","BOS_ACTIVE","COMMS_STABLE","EXTRICATION","PATIENT_READY","COMPLETED","TRANSPORTING","AT_HOSPITAL","RETURNING","FAILED"];
function runCase(name,opts={}){
  const context={window:{},console:{group(){},groupEnd(){},log(){},error(){}},JSON,Math,Object,Array,Number,isFinite}; vm.createContext(context); vm.runInContext(code,context,{filename:controllerPath});
  const counters={end:0,finalizeNetwork:0,priorityReset:0,capacityReset:0,loadReset:0,responseFinalize:0,sceneReset:0};
  let networkReady=!!opts.networkReadyInitially, readyChecks=0, priorityActive=!!opts.priorityActive, loadsHigh=opts.loadsHigh!==false;
  const plan={description:"test",states:stateIds.map(state),sequence:{initialState:"READY",callDurationSeconds:0,alarmDurationSeconds:0,roadClosureMaximumWaitSeconds:1,onSceneHoldSeconds:0,bosActiveToStableSeconds:0,stableToExtricationSeconds:0,extricationSeconds:0,patientReadySeconds:0,resetRequiresNetworkLoadAtOrBelow:55,completionSettlementMaximumSeconds:8},network:{baseLoad:38,activeBosEndpointIds:["A","B","C"],missionCivilianEndpointIds:[]}};
  const scene={setState(){return true;},reset(){counters.sceneReset++;return true;},getSafetyStatus(){return {status:"PASSED"};}};
  const response={
    allAtBase(){return true;},firePoliceAtBase(){return true;},isTrafficReleased(){return true;},isSceneCleared(){return true;},allAtScene(){return true;},
    getSafetyStatus(){return {status:"PASSED",fatal:false,errors:[]};},reset(){return true;},prepare(){return true;},isPrepared(){return true;},dispatch(){return true;},
    beginReturnAndTransport(){return true;},ambulanceAtHospital(){return true;},isAmbulanceReturning(){return true;},
    getCrossMissionHandoffStatus(){return {ready:opts.responseHandoffReady!==false,blockers:opts.responseHandoffReady===false?["TEST_RESPONSE_UNSAFE"]:[]};},
    finalizeForSharedHandoff(){counters.responseFinalize++;return true;},getState(){return "COMPLETE";}
  };
  const network={
    beginMission(){return true;},setTargetLoad(){return true;},endMission(){counters.end++;return true;},isBOSActive(){return true;},getLoad(){return networkReady?38:100;},
    isReadyForMissionStart(){readyChecks++; if(opts.networkReadyAfterChecks && readyChecks>=opts.networkReadyAfterChecks) networkReady=true; return networkReady;},
    finalizeMissionSettlement(){counters.finalizeNetwork++; if(opts.finalizerReject) return false; networkReady=true; return true;},
    isCapacityPrioritySettled(){return true;},getSafetyStatus(){return {status:"PASSED",fatal:false};}
  };
  const association={getAssociation(){return {active:true,servingTowerId:"MAST_C"};},getSafetyStatus(){return {status:"PASSED",fatal:false};}};
  const load={getCellLoad(){return 100;},getAllCells(){return [{currentLoad:loadsHigh?90:40},{currentLoad:loadsHigh?88:39}];},reset(){counters.loadReset++;loadsHigh=false;return true;},getSafetyStatus(){return {status:"PASSED",fatal:false};}};
  const capacity={reset(){counters.capacityReset++;return true;},getSafetyStatus(){return {status:"PASSED",fatal:false};}};
  const priority={getAllCellStates(){return [{active:priorityActive}];},reset(){counters.priorityReset++;priorityActive=false;return true;},getSafetyStatus(){return {status:"PASSED",fatal:false};}};
  const mReady={getState(){return "READY";}};
  const m2={getState(){return "READY";},getSharedStartBaselineStatus(){return opts.mission002BaselineReady===false?{ready:false,blockers:["TEST_M2_PENDING"]}:{ready:true,blockers:[]};}};
  const registry={getSelectedMissionId(){return "MISSION_004";}};
  const runtime=context.window.MissionBosMission004Controller.create({plan,validation:{status:"PASSED"},sceneRuntime:scene,responseRuntime:response,networkAdapter:network,associationRuntime:association,cellLoadRuntime:load,capacityRuntime:capacity,priorityRuntime:priority,mission001Runtime:mReady,mission002Runtime:m2,mission003Runtime:mReady,missionRegistryRuntime:registry});
  if(!runtime.start()) throw new Error(name+": start failed");
  let sim=0,finishSent=false;
  while(sim<25 && runtime.getState()!=="READY" && runtime.getState()!=="FAILED"){
    runtime.update(0.1); sim+=0.1;
    if(runtime.getState()==="COMPLETED" && !finishSent){ if(!runtime.finishAndReturn()) throw new Error(name+": finish command failed"); finishSent=true; }
  }
  return {name,state:runtime.getState(),seconds:Number(sim.toFixed(2)),settlement:runtime.getCompletionSettlementStatus(),counters};
}
const results=[];
results.push(runCase("normal-network-cell-load-nonblocking",{networkReadyAfterChecks:50,loadsHigh:true,mission002BaselineReady:false}));
results.push(runCase("deterministic-finalization",{networkReadyInitially:false,priorityActive:true,loadsHigh:true,mission002BaselineReady:false}));
results.push(runCase("m2-baseline-not-precommit",{networkReadyInitially:true,priorityActive:false,loadsHigh:true,mission002BaselineReady:false}));
results.push(runCase("response-safety-still-blocks",{networkReadyInitially:false,priorityActive:true,responseHandoffReady:false}));
const errors=[];
for(const r of results){
  if(r.name!=="response-safety-still-blocks" && r.state!=="READY") errors.push(r.name+" did not reach READY");
  if(r.name==="response-safety-still-blocks" && r.state!=="RETURNING") errors.push("unsafe response handoff was not held in RETURNING");
  if(r.name!=="response-safety-still-blocks" && r.counters.end!==1) errors.push(r.name+" network.endMission count="+r.counters.end);
  if(r.name==="response-safety-still-blocks" && (r.counters.end!==0 || r.counters.finalizeNetwork!==0)) errors.push("network settlement started before safe response handoff");
  if(r.name==="deterministic-finalization" && r.counters.finalizeNetwork!==1) errors.push("deterministic finalizer count="+r.counters.finalizeNetwork);
  if(r.name==="deterministic-finalization" && (r.counters.priorityReset!==1||r.counters.capacityReset!==1||r.counters.loadReset!==1)) errors.push("shared baseline runtimes not reset exactly once");
  if(r.name==="m2-baseline-not-precommit" && r.state!=="READY") errors.push("M2 baseline still blocks M4");
  if(r.name==="normal-network-cell-load-nonblocking" && r.state!=="READY") errors.push("cell load easing still blocks M4");
}
console.log(JSON.stringify({title:"MISSION 004 FINALIZATION RUNTIME",status:errors.length?"FAILED":"PASSED",results,errors},null,2));
process.exit(errors.length?1:0);
