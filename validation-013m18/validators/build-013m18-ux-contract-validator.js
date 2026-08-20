const fs=require('fs'),vm=require('vm'),path=require('path');
const contractPath=path.join(__dirname,'..','contracts','build-013m18-ux-contract.js');
const src=fs.readFileSync(contractPath,'utf8');
const ctx={globalThis:{}}; ctx.window=undefined; vm.createContext(ctx); vm.runInContext(src,ctx);
const c=ctx.globalThis.MISSION_BOS_BUILD_013M18_UX_CONTRACT;
let e=[]; const fail=m=>e.push(m);
if(!c) fail('contract missing');
else {
 if(c.mode!=='PREPARATION_ONLY') fail('must remain preparation-only');
 if(c.touch.noVisibleTouchMode!==true) fail('visible touch mode forbidden');
 if(c.touch.oneFingerGesture!=='GROUND_PLANE_PAN') fail('one finger pan mismatch');
 if(c.touch.pinchGesture!=='FOV_ZOOM'||c.touch.minFov!==36||c.touch.maxFov!==78) fail('pinch/FOV contract mismatch');
 if(c.touch.touchRotationInFirstBuild!==false) fail('touch rotation must be deferred');
 if(c.touch.dashboardControls.defaultOpen!==false||c.touch.dashboardControls.minTargetCssPx<44) fail('dashboard control accessibility mismatch');
 if(c.incidentCard.presentationLayerOnly!==true||c.incidentCard.missionControllerChangesAllowed!==false) fail('incident copy must remain presentation-only');
 const mids=['MISSION_001','MISSION_002','MISSION_003','MISSION_004'];
 mids.forEach(m=>{ if(!c.incidentCard.titles[m]) fail('title missing '+m); const states=c.incidentCard.missions[m]&&c.incidentCard.missions[m].states; if(!states||!states.READY||!states.FAILED) fail('state coverage missing '+m); });
 if(!c.protected.missionStateMachines||!c.protected.networkAlgorithms||!c.protected.presenterProfiles013M17||!c.protected.desktopInputSemantics) fail('protected contract incomplete');
}
console.log(JSON.stringify({validator:'BUILD_013M18_UX_PREPARATION_CONTRACT',status:e.length?'FAILED':'PASSED',errors:e},null,2));
process.exit(e.length?1:0);