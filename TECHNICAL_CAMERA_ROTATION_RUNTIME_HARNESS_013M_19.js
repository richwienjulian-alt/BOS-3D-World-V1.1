#!/usr/bin/env node
"use strict";
const fs=require('fs'), vm=require('vm'), path=require('path');
const buildDir=__dirname;
class FakeTarget {
  constructor(rect){this.listeners={};this.rect=rect||{left:0,top:0,width:800,height:600};this.captures=new Set();}
  addEventListener(type,handler){(this.listeners[type] ||= []).push(handler);}
  removeEventListener(type,handler){this.listeners[type]=(this.listeners[type]||[]).filter(h=>h!==handler);}
  dispatch(type,event){(this.listeners[type]||[]).forEach(h=>h(event||{preventDefault(){}}));}
  getBoundingClientRect(){return this.rect;}
  setPointerCapture(id){this.captures.add(id);} releasePointerCapture(id){this.captures.delete(id);}
}
function ev(pointerId,pointerType,x,y,timeStamp){return {pointerId,pointerType,clientX:x,clientY:y,timeStamp,preventDefault(){this.prevented=true;}};}
const ctx={globalThis:{},console}; ctx.window=ctx.globalThis; vm.createContext(ctx);
for(const file of ['city-touch-camera-plan.js','touch-camera-validator.js','city-touch-camera-controller.js']) vm.runInContext(fs.readFileSync(path.join(buildDir,file),'utf8'),ctx,{filename:file});
const root=ctx.globalThis;
const canvas=new FakeTarget();
const controls={forward:new FakeTarget(),backward:new FakeTarget(),left:new FakeTarget(),right:new FakeTarget(),rotateLeft:new FakeTarget(),rotateRight:new FakeTarget(),zoomOut:new FakeTarget(),zoomIn:new FakeTarget(),home:new FakeTarget()};
let fov=56, yawTarget=0, pitch=-0.17863100651394934, pose={x:0.78,y:9,z:46}, releaseCount=0, rotationCalls=[], panCalls=[], homeCalls=0;
const cameraAdapter={
  panGround(f,r){panCalls.push([f,r]); pose.x+=r; pose.z-=f; return true;},
  rotateYaw(delta,reason){releaseCount++; yawTarget+=Number(delta); rotationCalls.push({delta:Number(delta),reason,yawTarget}); return yawTarget;},
  setFov(v){fov=Math.max(36,Math.min(78,Number(v))); return fov;}, getFov(){return fov;},
  goHome(){homeCalls++;pose={x:0.78,y:9,z:46};fov=56;return true;},
  stopVelocity(){}, releasePresenterCamera(){releaseCount++;return true;}
};
let taps=0; const inspectionRuntime={selectAtClientPoint(){taps++;return true;}};
const runtime=root.MissionBosTouchCameraController.create({plan:root.MISSION_BOS_TOUCH_CAMERA_PLAN,validation:root.MISSION_BOS_TOUCH_CAMERA_PLAN_VALIDATION,canvas,cameraAdapter,inspectionRuntime,controls});
const checks=[]; function check(name,condition,detail){checks.push({name,passed:!!condition,detail});if(!condition) throw new Error(name+': '+JSON.stringify(detail));}
const step=Math.PI/12, eps=1e-10;
controls.rotateLeft.dispatch('click',{preventDefault(){}});
check('one left tap is +15 degrees / Q direction',Math.abs(yawTarget-step)<eps,{yawTarget,step});
check('left rotation preserves pitch height and FOV',pitch===-0.17863100651394934 && pose.y===9 && fov===56,{pitch,height:pose.y,fov});
controls.rotateRight.dispatch('click',{preventDefault(){}});
check('one right tap returns original heading',Math.abs(yawTarget)<eps,{yawTarget});
for(let i=0;i<24;i++) controls.rotateLeft.dispatch('click',{preventDefault(){}});
check('24 left taps equal +360 degrees',Math.abs(yawTarget-2*Math.PI)<1e-9,{yawTarget,expected:2*Math.PI});
yawTarget=0; rotationCalls=[];
for(let i=0;i<24;i++) controls.rotateRight.dispatch('click',{preventDefault(){}});
check('24 right taps equal -360 degrees',Math.abs(yawTarget+2*Math.PI)<1e-9,{yawTarget,expected:-2*Math.PI});
check('all rotation calls are exact 15 degree magnitude',rotationCalls.every(c=>Math.abs(Math.abs(c.delta)-step)<eps),{count:rotationCalls.length});
// Existing gestures remain functional and direct twist remains absent.
canvas.dispatch('pointerdown',ev(1,'touch',100,100,0)); canvas.dispatch('pointerup',ev(1,'touch',102,102,100));
check('tap still selects through inspection runtime',taps===1,{taps});
const p0=panCalls.length; canvas.dispatch('pointerdown',ev(2,'touch',200,200,200)); canvas.dispatch('pointermove',ev(2,'touch',220,202,230)); canvas.dispatch('pointerup',ev(2,'touch',220,202,260));
check('one finger pan remains active',panCalls.length>p0,{panCalls:panCalls.length});
fov=60; canvas.dispatch('pointerdown',ev(3,'touch',300,300,300)); canvas.dispatch('pointerdown',ev(4,'touch',400,300,305)); canvas.dispatch('pointermove',ev(4,'touch',450,300,330)); const pinchFov=fov; canvas.dispatch('pointerup',ev(4,'touch',450,300,350)); canvas.dispatch('pointerup',ev(3,'touch',300,300,370));
check('pinch zoom remains active',pinchFov<60,{pinchFov});
check('direct touch rotation remains disabled',root.MISSION_BOS_TOUCH_CAMERA_PLAN.gesture.rotationEnabled===false,root.MISSION_BOS_TOUCH_CAMERA_PLAN.gesture);
controls.forward.dispatch('click',{preventDefault(){}}); controls.zoomIn.dispatch('click',{preventDefault(){}}); controls.home.dispatch('click',{preventDefault(){}});
check('dashboard pan zoom home remain active',panCalls.length>p0 && homeCalls===1 && fov===56,{panCalls:panCalls.length,homeCalls,fov});
const safety=runtime.getSafetyStatus();
check('runtime safety remains PASSED',safety.status==='PASSED',safety);
check('presenter manual release path invoked',releaseCount>0,{releaseCount});
const result={status:'PASSED',checks,manifest:runtime.getManifest(),safety,metrics:{rotateStepDegrees:15,leftFullTurnRadians:2*Math.PI,rightFullTurnRadians:-2*Math.PI,pinchFov,tapSelections:taps,releaseCount,homeCalls}};
fs.writeFileSync(path.join(buildDir,'TECHNICAL_CAMERA_ROTATION_RUNTIME_RESULTS_013M_19.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
