#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm");const root=path.resolve(process.argv[2]||".");const errors=[];const ctx={window:{},console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,"..","build-013m17-contract.js"),"utf8"),ctx,{filename:"build-013m17-contract.js"});
vm.runInContext(fs.readFileSync(path.join(root,"city-presenter-plan.js"),"utf8"),ctx,{filename:"city-presenter-plan.js"});
const c=ctx.window.MISSION_BOS_BUILD_013M17_CONTRACT,p=ctx.window.MISSION_BOS_PRESENTER_PLAN;
if(!c||!p)errors.push("contract or presenter plan missing");
else{
 const profiles=(p.camera||{}).missionCameraProfiles||{};const slots=((p.camera||{}).bookmarks||[]).map(x=>x.id);
 if(Object.keys(profiles).length!==c.expectedCounts.missionProfiles)errors.push("mission profile count mismatch");
 if(slots.length!==c.expectedCounts.cameraSlots)errors.push("camera slot count mismatch");
 for(const id of Object.keys(c.missionProfiles)){const q=profiles[id];if(!q)errors.push(id+": profile missing");else if(q.networkTowerId!==c.missionProfiles[id].tower)errors.push(id+": network tower mismatch");}
 if(c.protectedPrinciples.automaticCameraTakeoverAllowed!==false)errors.push("automatic camera takeover policy changed");
 if(c.protectedPrinciples.manualCameraSelectionRequired!==true)errors.push("manual camera selection contract changed");
}
console.log(JSON.stringify({validator:"BUILD_013M17_CONTRACT",status:errors.length?"FAILED":"PASSED",errors},null,2));if(errors.length)process.exit(1);
