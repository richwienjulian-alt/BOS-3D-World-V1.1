#!/usr/bin/env node
"use strict";
const fs=require('fs'),vm=require('vm'),path=require('path');
const app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
const match=app.match(/const presenterCameraAdapter = \{([\s\S]*?)\n\};\n\nlet ambientLight/);
if(!match) throw new Error('presenterCameraAdapter block not found');
const code='presenterCameraAdapter = {'+match[1]+'\n};';
class V3 { constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;} set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;} }
const ctx={console,Number,Math,THREE:{Vector3:V3,MathUtils:{clamp:(v,a,b)=>Math.max(a,Math.min(b,v))}},camera:{position:new V3(0.78,9,46),rotation:{x:-0.17863100651394934,y:0,set(p,y){this.x=p;this.y=y;}},fov:56,updateProjectionMatrix(){this.projectionUpdates=(this.projectionUpdates||0)+1;}},cameraVelocity:new V3(),targetYaw:0,currentYaw:0,targetPitch:-0.17863100651394934,currentPitch:-0.17863100651394934,freeCameraHeight:9,validatedPresenter:{calls:[],notifyManualInput(x){this.calls.push(x);return true;}},window:{MISSION_BOS_INITIAL_CAMERA_CONTRACT_013M8:{initialPose:{position:{x:0.78,y:9,z:46},yaw:0,pitch:-0.17863100651394934,fov:56}}},presenterCameraAdapter:null};
vm.createContext(ctx);vm.runInContext(code,ctx,{filename:'app.js#presenterCameraAdapter'});
const a=ctx.presenterCameraAdapter, step=Math.PI/12, eps=1e-10, checks=[];function check(name,c,d){checks.push({name,passed:!!c,detail:d});if(!c)throw new Error(name+': '+JSON.stringify(d));}
const initial={pitch:ctx.currentPitch,height:ctx.camera.position.y,fov:ctx.camera.fov,currentYaw:ctx.currentYaw};
a.rotateYaw(step,'DASHBOARD_CAMERA'); check('actual adapter left is +15deg',Math.abs(ctx.targetYaw-step)<eps,{targetYaw:ctx.targetYaw});
check('actual adapter only changes target yaw',ctx.currentYaw===initial.currentYaw&&ctx.currentPitch===initial.pitch&&ctx.camera.position.y===initial.height&&ctx.camera.fov===initial.fov,{currentYaw:ctx.currentYaw,pitch:ctx.currentPitch,height:ctx.camera.position.y,fov:ctx.camera.fov});
a.rotateYaw(-step,'DASHBOARD_CAMERA'); check('actual adapter right returns target',Math.abs(ctx.targetYaw)<eps,{targetYaw:ctx.targetYaw});
ctx.targetYaw=0;for(let i=0;i<24;i++)a.rotateYaw(step,'DASHBOARD_CAMERA');check('actual adapter 24 left = 2pi',Math.abs(ctx.targetYaw-2*Math.PI)<1e-9,{targetYaw:ctx.targetYaw});
ctx.targetYaw=0;for(let i=0;i<24;i++)a.rotateYaw(-step,'DASHBOARD_CAMERA');check('actual adapter 24 right = -2pi',Math.abs(ctx.targetYaw+2*Math.PI)<1e-9,{targetYaw:ctx.targetYaw});
check('manual presenter release path used',ctx.validatedPresenter.calls.length===50 && ctx.validatedPresenter.calls.every(x=>x==='MOUSE_WHEEL'),{calls:ctx.validatedPresenter.calls.length,values:[...new Set(ctx.validatedPresenter.calls)]});
check('translation velocity remains stopped',ctx.cameraVelocity.x===0&&ctx.cameraVelocity.y===0&&ctx.cameraVelocity.z===0,ctx.cameraVelocity);
const result={status:'PASSED',checks,metrics:{stepDegrees:15,leftFullTurn:2*Math.PI,rightFullTurn:-2*Math.PI,presenterReleaseCalls:ctx.validatedPresenter.calls.length,pitch:ctx.currentPitch,height:ctx.camera.position.y,fov:ctx.camera.fov}};
fs.writeFileSync(path.join(__dirname,'TECHNICAL_APP_CAMERA_ADAPTER_RUNTIME_RESULTS_013M_19.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
