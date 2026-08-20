#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm");const root=path.resolve(process.argv[2]||".");const errors=[];
function elem(){return{hidden:false,dataset:{},textContent:"",title:"",disabled:false,children:[],attrs:{},classList:{toggle(){},add(){},remove(){}},addEventListener(){},removeEventListener(){},appendChild(x){this.children.push(x);},setAttribute(k,v){this.attrs[k]=v;},get innerHTML(){return"";},set innerHTML(v){if(v==="")this.children=[];}};}
const document={createElement(){return elem();}};const ctx={window:{},document,console};vm.createContext(ctx);for(const n of ["city-presenter-plan.js","city-presenter-controller.js"])vm.runInContext(fs.readFileSync(path.join(root,n),"utf8"),ctx,{filename:n});
const plan=ctx.window.MISSION_BOS_PRESENTER_PLAN,Controller=ctx.window.MissionBosPresenterController;let missionId="MISSION_001",state="READY";
const missionRuntime={getState:()=>state,getPresenterContext:()=>({missionId,state,hint:{title:missionId,message:"test",recommendedBookmarkId:"CAM_CITY_OVERVIEW",nextAction:"NONE",nextActionLabel:"test"}}),isPresenterActionAllowed:()=>false,start:()=>false,activateBOS:()=>false,finishAndReturn:()=>false};
let pose={position:{x:0,y:9,z:46},yaw:0,pitch:0,fov:56},releases=0;const cameraAdapter={getPose:()=>JSON.parse(JSON.stringify(pose)),applyPose:p=>{pose=JSON.parse(JSON.stringify(p));},releaseToFree:()=>{releases++;},stopVelocity:()=>{}};
const elements={panel:elem(),modeButton:elem(),hintTitle:elem(),hintMessage:elem(),cameraButtons:elem(),nextButton:elem(),resetButton:elem(),status:elem()};
const runtime=Controller.create({layout:{},missionPlan:{},plan,validator:{validate:()=>({status:"PASSED"}),logResult:()=>{}},missionRuntime,cameraAdapter,resetAdapter:{resetReadyBaseline:()=>true},elements});
const expected={MISSION_001:{incident:[-27,11,46],network:[29,14,30]},MISSION_002:{incident:[52,10,-38],network:[47,15,-7]},MISSION_003:{incident:[-24,10,18],network:[26,14,2]},MISSION_004:{incident:[18,10,51],network:[52,14,50]}};
function close(a,b){return Math.abs(a-b)<0.001;}function checkPos(mid,kind,arr){const p=pose.position;if(!close(p.x,arr[0])||!close(p.y,arr[1])||!close(p.z,arr[2]))errors.push(mid+":"+kind+" pose mismatch: "+JSON.stringify(p));}
for(const mid of Object.keys(expected)){
  missionId=mid;runtime.update(0,0);
  if(elements.cameraButtons.dataset.missionCameraProfile!==mid)errors.push(mid+": profile dataset mismatch");
  runtime.selectBookmark("CAM_INCIDENT_W14","api");runtime.updateCamera(2);checkPos(mid,"incident",expected[mid].incident);
  const before=releases;const next=mid==="MISSION_004"?"MISSION_001":Object.keys(expected)[Object.keys(expected).indexOf(mid)+1];missionId=next;runtime.update(0,0);if(runtime.getCameraState()!=="FREE")errors.push(mid+": bookmark not released on mission change");if(releases<=before)errors.push(mid+": camera adapter release not called on mission change");
  missionId=mid;runtime.update(0,0);runtime.selectBookmark("CAM_COMMUNICATION_MAST_B","api");runtime.updateCamera(2);checkPos(mid,"network",expected[mid].network);
}
const s=runtime.getSafetyStatus();if(!s||s.status!=="PASSED")errors.push("runtime safety failed");
console.log(JSON.stringify({validator:"MISSION_CAMERA_RUNTIME_HARNESS",status:errors.length?"FAILED":"PASSED",releases,errors},null,2));if(errors.length)process.exit(1);
