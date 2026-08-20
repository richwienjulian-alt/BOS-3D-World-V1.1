#!/usr/bin/env node
"use strict";
const fs=require('fs'),crypto=require('crypto'),path=require('path');
const buildDir=process.argv[2];
if(!buildDir){console.error('Usage: node build-013m15-protected-source-regression-validator.js <buildDir>');process.exit(2);}
const expected={
'app.js':'4c019c939fddd53b508860511fe57f4439be06775b8a70d64164b45ce777a9d1',
'city-mission-004-controller.js':'0d14d100d2be586b3ec37366d04ac6ade7550f70f830e60569dce82d5bad3a94',
'city-mission-004-response-controller.js':'c6034a83df2232ef2a998d48b3015bee67a37a7b295932d855b5da2d57abe6c0',
'city-mission-002-controller.js':'34e2611cb05229919540e9918e89ca0c5b21d24d44e814586644db03c36678ba',
'city-cell-load-controller.js':'dda0622f910aeee757d969217a437136fdafa9122b2f8fbb8105bd2ca5df9235',
'city-network-association-controller.js':'1d75f1f0e8fa8e3e66f3460ee9b02d7bf36ce032afe3b3daae2ab23716fb1bef',
'city-auto-bos-priority-controller.js':'f68560e1281dd7463304ec188986984f4629b9db028c5dcef9f86f88f338e0df',
'city-cell-capacity-controller.js':'60669b01e6e6d99a7e7f582d558734fd2705c548cb9476c989ccad5d935cfaec',
'city-ambulance-renderer.js':'a8a01a6a3f6310267c6808960cb0118397827844fb179e319fd08614205ded79',
'city-response-vehicle-renderer.js':'fcbdacf8c87b25b73aed4d247f10d5af770078600c532671e9f34cdf8fe2459d',
'city-traffic-renderer.js':'b50f20ac51227d4a78dda5e7af9133ce6161867977947f5cba70cc36f20c6ee4',
'city-mission-registry-controller.js':'64a04248b99daf645998f72d265cf3e528295a4e31efe8a447e5c4277c2aaa7a',
'city-mission-003-controller.js':'bd084223be8e8e12288e21df32b8e38fe631dc27c0c64071902e5a94cfa266b3',
'city-mission-003-response-controller.js':'93a78e5fa39c1f93053f9c33a237aead651638f40129d3e52c18b36399c2228a',
'city-mission-001-controller.js':'96f753267f4fe3bb398faf954103ffd911de104d0ea096422e68464c5ddc9bfc',
'index.html':'b78b4cb0938fc4b083e028717577d64d02d3bda24370a84aba3bd4bba2f58f53',
'style.css':'44aaa0da36ab312a8df0953e9760d120fb9c82ddc8b58ad87c704d7f881def95'
};
const rows=[];let ok=true;
for(const [file,hash] of Object.entries(expected)){
 const p=path.join(buildDir,file);let actual='MISSING';if(fs.existsSync(p))actual=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
 const pass=actual===hash; if(!pass)ok=false; rows.push({file,pass,expected:hash,actual});
}
console.log(JSON.stringify({status:ok?'PASSED':'FAILED',checked:rows.length,rows},null,2));process.exit(ok?0:1);
