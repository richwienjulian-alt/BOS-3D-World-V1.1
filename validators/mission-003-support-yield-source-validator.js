#!/usr/bin/env node
"use strict";
const fs=require('fs'),path=require('path');const root=path.resolve(process.argv[2]||'.'),src=fs.readFileSync(path.join(root,'city-mission-003-response-controller.js'),'utf8');const e=[];function n(re,m){if(!re.test(src))e.push(m);}
n(/plan\.supportTrafficYield/,'Support traffic yield plan is not consumed.');
n(/yielded\(plan\.trafficYield\.vehicleId\)\s*&&\s*yielded\(plan\.supportTrafficYield\.vehicleId\)/,'Dispatch readiness does not require both civilian yields.');
n(/requestYieldAtDistance\(plan\.supportTrafficYield\.vehicleId,\s*assignment\.hold\)/,'VAN_SUPPORT_01 yield is not requested.');
n(/state!=="PREPARING"\|\|!trafficYielded\(\)/,'Mission 003 dispatch is not gated on both yields.');
n(/releaseYield\(plan\.supportTrafficYield\.vehicleId\)/,'Support traffic yield is not released.');
console.log(JSON.stringify({validator:'MISSION_003_SUPPORT_YIELD_SOURCE',status:e.length?'FAILED':'PASSED',errors:e},null,2));if(e.length)process.exit(1);
