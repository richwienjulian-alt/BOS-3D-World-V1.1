#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");const root=path.resolve(process.argv[2]||".");const list=fs.readFileSync(path.join(__dirname,"..","PROTECTED_SOURCE_HASHES.txt"),"utf8").trim().split(/\r?\n/).filter(Boolean),errors=[];let checked=0;
for(const line of list){const m=line.match(/^([0-9a-f]{64})\s+(.+)$/);if(!m){errors.push("invalid hash line: "+line);continue;}const expected=m[1],name=m[2],file=path.join(root,name);if(!fs.existsSync(file)){errors.push("missing protected file: "+name);continue;}const actual=crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");checked++;if(actual!==expected)errors.push(name+": expected "+expected+" got "+actual);}
console.log(JSON.stringify({validator:"BUILD_013M17_PROTECTED_SOURCES",status:errors.length?"FAILED":"PASSED",checked,errors},null,2));if(errors.length)process.exit(1);
