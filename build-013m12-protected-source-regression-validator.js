#!/usr/bin/env node
"use strict";
const fs=require("fs"),crypto=require("crypto"),path=require("path");
const root=path.resolve(process.argv[2]||path.join(__dirname,"..","..","m013m11"));
const expected={
  "app.js": "b256edca61e6df05fbad1390124667736443bcb235910c0f723f86cdd4734c7d",
  "city-response-vehicle-renderer.js": "fcbdacf8c87b25b73aed4d247f10d5af770078600c532671e9f34cdf8fe2459d",
  "city-ambulance-renderer.js": "a8a01a6a3f6310267c6808960cb0118397827844fb179e319fd08614205ded79",
  "city-cell-load-controller.js": "dda0622f910aeee757d969217a437136fdafa9122b2f8fbb8105bd2ca5df9235",
  "city-cell-capacity-controller.js": "60669b01e6e6d99a7e7f582d558734fd2705c548cb9476c989ccad5d935cfaec",
  "city-auto-bos-priority-controller.js": "f68560e1281dd7463304ec188986984f4629b9db028c5dcef9f86f88f338e0df",
  "city-network-association-controller.js": "1d75f1f0e8fa8e3e66f3460ee9b02d7bf36ce032afe3b3daae2ab23716fb1bef",
  "city-mission-003-controller.js": "bd084223be8e8e12288e21df32b8e38fe631dc27c0c64071902e5a94cfa266b3",
  "style.css": "44aaa0da36ab312a8df0953e9760d120fb9c82ddc8b58ad87c704d7f881def95",
  "index.html": "b78b4cb0938fc4b083e028717577d64d02d3bda24370a84aba3bd4bba2f58f53"
};
let bad=[];for(const [name,want] of Object.entries(expected)){const p=path.join(root,name);if(!fs.existsSync(p)){bad.push(name+":missing");continue;}const got=crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");if(got!==want)bad.push(name+":"+got);}
console.log("MISSION BOS 013M.12 PROTECTED SOURCE REGRESSION");console.log("Protected files: "+Object.keys(expected).length);console.log("STATUS: "+(bad.length?"FAILED":"PASSED"));if(bad.length){console.error(bad.join("\n"));process.exit(1);}
