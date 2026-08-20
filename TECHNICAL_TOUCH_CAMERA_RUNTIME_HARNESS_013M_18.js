const fs = require('fs');
const vm = require('vm');
const path = require('path');
const buildDir = __dirname;

class FakeTarget {
  constructor(rect) { this.listeners = {}; this.rect = rect || {left:0,top:0,width:800,height:600}; this.captures = new Set(); }
  addEventListener(type, handler) { (this.listeners[type] ||= []).push(handler); }
  removeEventListener(type, handler) { this.listeners[type] = (this.listeners[type] || []).filter(h => h !== handler); }
  dispatch(type, event) { (this.listeners[type] || []).forEach(h => h(event)); }
  getBoundingClientRect() { return this.rect; }
  setPointerCapture(id) { this.captures.add(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
}
function ev(pointerId, pointerType, x, y, timeStamp) {
  return { pointerId, pointerType, clientX:x, clientY:y, timeStamp, prevented:false, preventDefault(){this.prevented=true;} };
}

const ctx = { globalThis: {}, console };
ctx.window = ctx.globalThis;
vm.createContext(ctx);
for (const file of ['city-touch-camera-plan.js','touch-camera-validator.js','city-touch-camera-controller.js']) {
  vm.runInContext(fs.readFileSync(path.join(buildDir,file),'utf8'), ctx, {filename:file});
}
const root = ctx.globalThis;
const canvas = new FakeTarget();
const controls = {
  forward:new FakeTarget(), backward:new FakeTarget(), left:new FakeTarget(), right:new FakeTarget(),
  zoomOut:new FakeTarget(), zoomIn:new FakeTarget(), home:new FakeTarget()
};
let fov=56, pose={x:0,y:9,z:46}, releaseCount=0, panCalls=[], homeCalls=0, projectionUpdates=0;
const cameraAdapter = {
  panGround(f,r){ panCalls.push([f,r]); pose.x += r; pose.z -= f; return true; },
  setFov(v){ fov=Math.max(36,Math.min(78,Number(v))); projectionUpdates++; return fov; },
  getFov(){ return fov; },
  getPose(){ return {position:{x:pose.x,y:pose.y,z:pose.z},yaw:0,pitch:-0.18,fov}; },
  goHome(){ homeCalls++; pose={x:0.78,y:9,z:46}; fov=56; return true; },
  stopVelocity(){},
  releasePresenterCamera(){ releaseCount++; return true; }
};
let taps=[];
const inspectionRuntime = { selectAtClientPoint(x,y,rect){ taps.push({x,y,rect}); return true; } };
const runtime = root.MissionBosTouchCameraController.create({
  plan: root.MISSION_BOS_TOUCH_CAMERA_PLAN,
  validation: root.MISSION_BOS_TOUCH_CAMERA_PLAN_VALIDATION,
  canvas, cameraAdapter, inspectionRuntime, controls
});

const checks=[];
function check(name, condition, detail){ checks.push({name,passed:!!condition,detail}); if(!condition) throw new Error(name+': '+JSON.stringify(detail)); }

// Tap: small movement, short duration, exactly one pointer.
canvas.dispatch('pointerdown', ev(1,'touch',100,100,0));
canvas.dispatch('pointerup', ev(1,'touch',104,104,120));
check('tap selects once', taps.length===1, {taps});

// Pan: exceeds threshold and must never select.
const tapsBeforePan=taps.length;
canvas.dispatch('pointerdown', ev(2,'touch',200,200,200));
canvas.dispatch('pointermove', ev(2,'touch',220,202,230));
canvas.dispatch('pointermove', ev(2,'touch',240,205,260));
canvas.dispatch('pointerup', ev(2,'touch',240,205,280));
check('pan moves ground camera', panCalls.length>0, {panCalls});
check('pan does not tap', taps.length===tapsBeforePan, {taps});
check('pan preserves height in adapter harness', pose.y===9, pose);

// Pinch apart must zoom in (lower FOV); no tap may fire on release.
const tapsBeforePinch=taps.length;
fov=60;
canvas.dispatch('pointerdown', ev(3,'touch',300,300,400));
canvas.dispatch('pointerdown', ev(4,'touch',400,300,405));
canvas.dispatch('pointermove', ev(4,'touch',450,300,430));
const pinchFov=fov;
canvas.dispatch('pointerup', ev(4,'touch',450,300,450));
canvas.dispatch('pointerup', ev(3,'touch',300,300,470));
check('pinch apart lowers FOV', pinchFov<60, {pinchFov});
check('pinch does not tap', taps.length===tapsBeforePinch, {taps});

// Clamp FOV through dashboard zoom commands.
fov=37;
for(let i=0;i<20;i++) controls.zoomIn.dispatch('click',{preventDefault(){}});
check('zoom-in clamps at 36', fov===36, {fov});
for(let i=0;i<20;i++) controls.zoomOut.dispatch('click',{preventDefault(){}});
check('zoom-out clamps at 78', fov===78, {fov});

// Dashboard pan and Home.
const panBeforeButtons=panCalls.length;
controls.forward.dispatch('click',{preventDefault(){}});
controls.backward.dispatch('click',{preventDefault(){}});
controls.left.dispatch('click',{preventDefault(){}});
controls.right.dispatch('click',{preventDefault(){}});
check('four dashboard pan commands', panCalls.length===panBeforeButtons+4, {panCalls:panCalls.length});
controls.home.dispatch('click',{preventDefault(){}});
check('home uses adapter', homeCalls===1 && pose.x===0.78 && pose.y===9 && pose.z===46 && fov===56, {homeCalls,pose,fov});

// Cancel path and mouse rejection.
canvas.dispatch('pointerdown', ev(5,'touch',500,300,600));
canvas.dispatch('pointercancel', ev(5,'touch',500,300,610));
canvas.dispatch('pointerdown', ev(6,'mouse',500,300,620));
const safety=runtime.getSafetyStatus();
check('pointer cancel recorded', safety.pointerCancelCount>=1, safety);
check('mouse ignored by touch controller', safety.rejectedMousePointerCount>=1, safety);
check('presenter release used', releaseCount>0, {releaseCount});
check('runtime remains passed', safety.status==='PASSED', safety);

const result={status:'PASSED',checks,manifest:runtime.getManifest(),safety,metrics:{tapSelections:taps.length,panCalls:panCalls.length,pinchFov,projectionUpdates,releaseCount,homeCalls}};
console.log(JSON.stringify(result,null,2));
