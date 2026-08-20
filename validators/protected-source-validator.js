#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const root=path.resolve(process.argv[2]||".");
const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,"..","BASELINE_PROTECTED_SHA256SUMS_013M_20.json"),"utf8"));
const errors=[];for(const [name,hash] of Object.entries(manifest.files)){const p=path.join(root,name);if(!fs.existsSync(p)){errors.push(name+": missing");continue;}const got=crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");if(got!==hash)errors.push(name+": changed");}
console.log(JSON.stringify({validator:"PROTECTED_SOURCE_013M20",status:errors.length?"FAILED":"PASSED",protectedCount:Object.keys(manifest.files).length,errors},null,2));if(errors.length)process.exit(1);
