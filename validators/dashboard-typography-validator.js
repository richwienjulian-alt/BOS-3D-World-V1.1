#!/usr/bin/env node
"use strict";
const fs=require('fs'),path=require('path');const root=path.resolve(process.argv[2]||'.');const css=fs.readFileSync(path.join(root,'style.css'),'utf8');const errors=[];
function need(re,msg){if(!re.test(css))errors.push(msg);}
need(/#info-panel\.customer-dashboard \.customer-details-panel > summary,[\s\S]*?#info-panel\.customer-dashboard \.demo-control-summary\s*\{[\s\S]*?font-size:\s*11px;[\s\S]*?font-weight:\s*800;[\s\S]*?line-height:\s*1\.2;/,'Customer detail and presenter summaries do not share the frozen 11px/800 typography.');
need(/#info-panel\.customer-dashboard \.demo-control-summary > span:first-of-type\s*\{[\s\S]*?font-size:\s*inherit;[\s\S]*?font-weight:\s*inherit;[\s\S]*?line-height:\s*inherit;/,'Presenter summary label still overrides customer summary typography.');
need(/#info-panel\.customer-dashboard \.customer-details-panel > summary::before,[\s\S]*?#info-panel\.customer-dashboard \.demo-control-summary::before\s*\{[\s\S]*?font-size:\s*14px;[\s\S]*?line-height:\s*1;/,'Summary plus markers are not normalized.');
console.log(JSON.stringify({validator:'DASHBOARD_TYPOGRAPHY',status:errors.length?'FAILED':'PASSED',errors},null,2));if(errors.length)process.exit(1);
