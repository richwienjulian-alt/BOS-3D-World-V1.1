#!/usr/bin/env node
"use strict";
const fs=require('fs'),path=require('path');const root=path.resolve(process.argv[2]||'.'),src=fs.readFileSync(path.join(root,'city-mission-004-response-controller.js'),'utf8');const e=[];function n(re,m){if(!re.test(src))e.push(m);}
n(/responsePlan\.outboundCorridorReservation/,'Mission 004 outbound corridor plan is not consumed.');
n(/requestOutboundCorridorReservation/,'Outbound green-car reservation function is missing.');
n(/updateOutboundCorridor/,'Outbound green-car yield state is not updated.');
n(/outboundCorridor\.yielded\s*!==\s*true/,'Mission 004 dispatch is not gated on confirmed downtown yield.');
n(/responseAtScene\(\)[\s\S]{0,100}releaseOutboundCorridorReservation/,'Outbound green-car yield is not released after responders reach scene.');
n(/returnCorridorPlan/,'Existing Mission 004 return corridor logic was removed.');
console.log(JSON.stringify({validator:'MISSION_004_OUTBOUND_YIELD_SOURCE',status:e.length?'FAILED':'PASSED',errors:e},null,2));if(e.length)process.exit(1);
