#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=__dirname,errors=[],checks=[];
function elem(){return{hidden:false,dataset:{},textContent:"",title:"",disabled:false,children:[],attrs:{},classList:{toggle(){},add(){},remove(){}},addEventListener(){},removeEventListener(){},appendChild(x){this.children.push(x);},setAttribute(k,v){this.attrs[k]=v;},get innerHTML(){return"";},set innerHTML(v){if(v==="")this.children=[];}};}
const document={createElement(){return elem();}};const ctx={window:{},document,console};vm.createContext(ctx);
for(const n of ["city-presenter-plan.js","city-presenter-controller.js"])vm.runInContext(fs.readFileSync(path.join(root,n),"utf8"),ctx,{filename:n});
const plan=ctx.window.MISSION_BOS_PRESENTER_PLAN,Controller=ctx.window.MissionBosPresenterController;let missionId="MISSION_001",state="READY";
const missionRuntime={getState:()=>state,getPresenterContext:()=>({missionId,state,hint:{title:missionId,message:"test",recommendedBookmarkId:"CAM_CITY_OVERVIEW",nextAction:"NONE",nextActionLabel:"test"}}),isPresenterActionAllowed:()=>false,start:()=>false,activateBOS:()=>false,finishAndReturn:()=>false};
let pose={position:{x:0.78,y:9,z:46},target:{x:0.78,y:2.5,z:10},yaw:0,pitch:0,fov:56},releases=0;const applied=[];
const cameraAdapter={getPose:()=>JSON.parse(JSON.stringify(pose)),applyPose:p=>{pose=JSON.parse(JSON.stringify(p));applied.push({missionId,pose:JSON.parse(JSON.stringify(p))});},releaseToFree:()=>{releases++;},stopVelocity:()=>{}};
const elements={panel:elem(),modeButton:elem(),hintTitle:elem(),hintMessage:elem(),cameraButtons:elem(),nextButton:elem(),resetButton:elem(),status:elem()};
const runtime=Controller.create({layout:{},missionPlan:{},plan,validator:{validate:()=>({status:"PASSED"}),logResult:()=>{}},missionRuntime,cameraAdapter,resetAdapter:{resetReadyBaseline:()=>true},elements});
const expected={
MISSION_001:{city:[-34,16,49,-10.68,3.2,33.9,60],incident:[-25,10,47,-10.68,4.8,33.9,54],network:[22,16,46,3,7,24,66]},
MISSION_002:{city:[53,21,8,36,2.5,3,72],incident:[50,9,-41,41.15,1.6,-26.65,52],network:[11,15,-4,31,6,-18,62]},
MISSION_003:{city:[-29,16,25,-7.26,2,6.36,60],incident:[-21,9,16,-7.26,1.8,6.36,52],network:[27,15,-3,4,5,10,62]},
MISSION_004:{city:[7,16,53,31.6,2,40.3,61],incident:[18,9,52,31.6,1.8,40.3,52],network:[53,16,53,43,7,38,62]}}
;
const ids={city:"CAM_CITY_OVERVIEW",incident:"CAM_INCIDENT_W14",network:"CAM_COMMUNICATION_MAST_B"};
function close(a,b){return Math.abs(Number(a)-Number(b))<0.001;}
function check(name,ok,detail){checks.push({name,passed:!!ok,detail});if(!ok)errors.push(name+": "+JSON.stringify(detail));}
function checkPose(mid,kind,e){const p=pose.position;const dx=e[3]-e[0],dy=e[4]-e[1],dz=e[5]-e[2],horizontal=Math.sqrt(dx*dx+dz*dz),yaw=Math.atan2(-dx,-dz),pitch=Math.atan2(dy,Math.max(horizontal,0.000001));check(mid+" "+kind+" position",close(p.x,e[0])&&close(p.y,e[1])&&close(p.z,e[2]),p);check(mid+" "+kind+" yaw/pitch",close(pose.yaw,yaw)&&close(pose.pitch,pitch),{actual:{yaw:pose.yaw,pitch:pose.pitch},expected:{yaw,pitch}});check(mid+" "+kind+" fov",close(pose.fov,e[6]),pose.fov);}
const mids=Object.keys(expected);
for(let i=0;i<mids.length;i++){
 const mid=mids[i];missionId=mid;runtime.update(0,0);check(mid+" profile dataset",elements.cameraButtons.dataset.missionCameraProfile===mid,elements.cameraButtons.dataset.missionCameraProfile);
 for(const kind of ["city","incident","network"]){runtime.selectBookmark(ids[kind],"api");runtime.updateCamera(2);checkPose(mid,kind,expected[mid][kind]);}
 const before=applied.length,beforeRelease=releases;const next=mids[(i+1)%mids.length];missionId=next;runtime.update(0,0);check(mid+" mission change releases bookmark",runtime.getCameraState()==="FREE"&&releases>beforeRelease,{cameraState:runtime.getCameraState(),releases});check(mid+" mission change has no automatic pose",applied.length===before,{before,after:applied.length});
}
const safety=runtime.getSafetyStatus();check("runtime safety",safety&&safety.status==="PASSED",safety);
const result={validator:"TECHNICAL_CAMERA_RUNTIME_013M20",status:errors.length?"FAILED":"PASSED",resolvedViews:12,releases,checks,errors};
fs.writeFileSync(path.join(root,"TECHNICAL_CAMERA_RUNTIME_RESULTS_013M_20.json"),JSON.stringify(result,null,2)+"\n");console.log(JSON.stringify(result,null,2));if(errors.length)process.exit(1);
