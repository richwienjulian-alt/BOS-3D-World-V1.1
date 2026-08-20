const fs=require('fs'),path=require('path');
const base=process.argv[2]; if(!base){console.error('usage: node baseline-ux-architecture-validator.js <build-dir>');process.exit(2)}
function read(f){return fs.readFileSync(path.join(base,f),'utf8')}
let e=[];const ok=(cond,msg)=>{if(!cond)e.push(msg)};
const app=read('app.js'),html=read('index.html'),css=read('style.css'),inspect=read('city-network-inspection-controller.js'),explore=read('city-network-exploration-plan.js');
ok(/keys\.KeyW/.test(app)&&/keys\.KeyS/.test(app)&&/keys\.KeyA/.test(app)&&/keys\.KeyD/.test(app),'WASD baseline missing');
ok(/keys\.KeyQ/.test(app)&&/keys\.KeyE/.test(app),'Q/E baseline missing');
ok(/addEventListener\("mousedown"/.test(app)&&/addEventListener\("mousemove"/.test(app),'mouse drag baseline missing');
ok(/addEventListener\("wheel"/.test(app)&&/36, 78/.test(app),'wheel FOV baseline missing');
ok(/presenterCameraAdapter/.test(app)&&/releaseToFree/.test(app),'presenter camera adapter missing');
ok(/id="technical-details-panel"/.test(html)&&/id="presenter-panel"/.test(html),'dashboard details baseline missing');
ok(/id="mission-title"/.test(html)&&/id="mission-stage"/.test(html)&&/id="mission-description"/.test(html),'incident card DOM baseline missing');
ok(/activationKeyCode:\s*"KeyF"/.test(explore)&&/raycastOrigin:\s*"camera-center-crosshair"/.test(explore),'F inspection plan baseline missing');
ok(/function performRaycast/.test(inspect)&&/selectTargetById/.test(inspect),'inspection selection pipeline missing');
ok(/@media \(max-width: 980px\)/.test(css),'tablet responsive baseline missing');
console.log(JSON.stringify({validator:'BASELINE_UX_ARCHITECTURE_013M17',status:e.length?'FAILED':'PASSED',errors:e},null,2));
process.exit(e.length?1:0);