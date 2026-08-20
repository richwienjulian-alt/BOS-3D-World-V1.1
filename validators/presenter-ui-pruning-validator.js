#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path");
const root=path.resolve(process.argv[2]||".");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const errors=[];
if(html.includes('class="presenter-actions"')) errors.push("visible presenter-actions block still exists");
if(html.includes('class="presenter-network-controls"')) errors.push("visible presenter-network-controls block still exists");
for(const required of ['id="presenter-mode-button"','id="presenter-camera-buttons"','id="presenter-hint-title"','id="presenter-hint-message"','id="presenter-status"']) if(!html.includes(required)) errors.push("required visible presenter element missing: "+required);
if(!html.includes('id="presenter-compatibility-controls" hidden aria-hidden="true"')) errors.push("hidden compatibility container missing");
for(const id of ['presenter-next-button','presenter-reset-button','overload-button','bos-button']){
  const re=new RegExp('id="'+id+'"[^>]*tabindex="-1"');
  if(!re.test(html)) errors.push(id+" is not preserved as hidden non-focusable compatibility control");
}
const result={validator:"PRESENTER_UI_PRUNING_013M20",status:errors.length?"FAILED":"PASSED",errors};
console.log(JSON.stringify(result,null,2));if(errors.length)process.exit(1);
