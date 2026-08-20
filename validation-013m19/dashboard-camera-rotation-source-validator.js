#!/usr/bin/env node
"use strict";
const fs=require("fs"), path=require("path");
const root=path.resolve(process.argv[2]||".");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");
const errors=[];
const app=read("app.js"), plan=read("city-touch-camera-plan.js"), controller=read("city-touch-camera-controller.js"), html=read("index.html"), css=read("style.css");
function need(cond,msg){if(!cond) errors.push(msg);}
need(app.includes('const cameraControlRotateLeft = document.getElementById("camera-control-rotate-left")'),"app rotate-left DOM reference missing");
need(app.includes('const cameraControlRotateRight = document.getElementById("camera-control-rotate-right")'),"app rotate-right DOM reference missing");
const m=app.match(/rotateYaw\(deltaRadians, reason\) \{([\s\S]*?)\n  \},\n\n  panGround/);
need(!!m,"presenterCameraAdapter.rotateYaw missing");
if(m){
  const body=m[1];
  need(body.includes('this.releasePresenterCamera(reason || "DASHBOARD_CAMERA")'),"rotateYaw must release presenter camera");
  need(body.includes('cameraVelocity.set(0, 0, 0)'),"rotateYaw must stop translation velocity");
  need(body.includes('targetYaw += delta'),"rotateYaw must change targetYaw additively");
  need(!/targetPitch|currentPitch|camera\.fov|camera\.position|freeCameraHeight/.test(body),"rotateYaw must not change pitch/FOV/position/height");
}
need(app.includes('if (keys.KeyQ) targetYaw += 1.35 * delta;'),"Q direction changed");
need(app.includes('if (keys.KeyE) targetYaw -= 1.35 * delta;'),"E direction changed");
need(app.includes('currentYaw = THREE.MathUtils.lerp(currentYaw, targetYaw'),"smooth targetYaw/currentYaw path missing");
need(plan.includes('rotateStepDegrees: 15'),"15 degree dashboard step missing");
need(plan.includes('rotationEnabled: false'),"direct touch twist must remain disabled");
need(controller.includes('cameraAdapter.rotateYaw(rotateStepRadians'),"rotate-left binding missing");
need(controller.includes('cameraAdapter.rotateYaw(-rotateStepRadians'),"rotate-right binding missing");
need(html.includes('id="camera-control-rotate-left"'),"rotate-left button missing");
need(html.includes('aria-label="Kamera nach links drehen"'),"rotate-left ARIA mismatch");
need(html.includes('id="camera-control-rotate-right"'),"rotate-right button missing");
need(html.includes('aria-label="Kamera nach rechts drehen"'),"rotate-right ARIA mismatch");
need(html.indexOf('camera-control-rotate-row')>html.indexOf('camera-control-dpad') && html.indexOf('camera-control-rotate-row')<html.indexOf('camera-control-zoom-row'),"rotation row must sit between D-pad and zoom row");
need(css.includes('#info-panel.customer-dashboard .camera-control-button') && css.includes('min-width: 44px') && css.includes('min-height: 44px'),"44px camera target contract missing");
console.log(JSON.stringify({validator:"DASHBOARD_CAMERA_ROTATION_SOURCE",status:errors.length?"FAILED":"PASSED",errors},null,2));
process.exit(errors.length?1:0);
