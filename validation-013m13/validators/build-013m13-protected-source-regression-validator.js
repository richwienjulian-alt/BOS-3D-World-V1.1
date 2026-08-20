#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const prep=path.resolve(__dirname,"..");
const build=path.resolve(process.argv[2]||process.cwd());
const expected=JSON.parse(fs.readFileSync(path.join(prep,"PROTECTED_SHA256_BASELINE.json"),"utf8"));
const failures=[];
for(const [name,hash] of Object.entries(expected)){
  const p=path.join(build,name);
  if(!fs.existsSync(p)){failures.push(name+": MISSING");continue;}
  const actual=crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
  if(actual!==hash) failures.push(name+": CHANGED");
}
console.log("MISSION BOS 013M.13 PROTECTED SOURCE REGRESSION");
console.log("Protected files checked: "+Object.keys(expected).length);
if(failures.length) failures.forEach(x=>console.log("FAILED: "+x));
console.log("STATUS: "+(failures.length?"FAILED":"PASSED"));
if(failures.length)process.exit(1);
