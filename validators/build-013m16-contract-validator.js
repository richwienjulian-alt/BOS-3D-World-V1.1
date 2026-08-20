#!/usr/bin/env node
"use strict";
const fs=require('fs'),path=require('path'),vm=require('vm');const file=path.resolve(process.argv[2]||path.join(__dirname,'..','build-013m16-contract.js'));const c={window:{},console};vm.createContext(c);vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});const x=c.window.MISSION_BOS_BUILD_013M16_CONTRACT,e=[];
if(!x||x.build!=='013M.16')e.push('Build identity mismatch.');if(!x||x.baseSha256!=='a1d3a21a280a8d0d5bbc9e7947926893662820bdcb5c1e24f80233a31e4311ac')e.push('Baseline SHA mismatch.');
if(JSON.stringify(Array.from(x&&x.mission003.safeHoldDistances||[]))!==JSON.stringify([4,25,43]))e.push('M003 holds mismatch.');if(JSON.stringify(Array.from(x&&x.mission004.safeHoldDistances||[]))!==JSON.stringify([4,27,50]))e.push('M004 holds mismatch.');if(!x||!x.presenter.guidedModeEntryStartsReadyMission||x.presenter.missionIds.length!==4)e.push('Presenter contract incomplete.');if(!x||x.zoom.minFov!==36||x.zoom.maxFov!==78||x.zoom.sensitivity!==0.025)e.push('Zoom contract mismatch.');
console.log(JSON.stringify({validator:'BUILD_013M16_CONTRACT',status:e.length?'FAILED':'PASSED',errors:e},null,2));if(e.length)process.exit(1);
