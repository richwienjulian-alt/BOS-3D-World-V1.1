#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const root=process.argv[2]?path.resolve(process.argv[2]):process.cwd();
const baseline=JSON.parse(fs.readFileSync(path.resolve(__dirname,"..","PROTECTED_SHA256_BASELINE.json"),"utf8"));
const checks=[];
for(const [file,expected] of Object.entries(baseline.protectedFiles)){
  const p=path.join(root,file); let actual=null,ok=false;
  if(fs.existsSync(p)){actual=crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");ok=actual===expected;}
  checks.push({file,ok,expected,actual});
}
const failed=checks.filter(x=>!x.ok);
console.log(JSON.stringify({title:"BUILD 013M.14 PROTECTED SOURCE REGRESSION",status:failed.length?"FAILED":"PASSED",checked:checks.length,changed:failed.map(x=>x.file)},null,2));
process.exit(failed.length?1:0);
