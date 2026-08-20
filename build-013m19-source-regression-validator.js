#!/usr/bin/env node
"use strict";
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const build=path.resolve(process.argv[2]||'.'); const base=path.resolve(process.argv[3]||'');
if(!base||!fs.existsSync(base)){console.error('usage: node build-013m19-source-regression-validator.js <build-dir> <013m18-base-dir>');process.exit(2);}
const allowed=new Set(['index.html','style.css','app.js','city-touch-camera-plan.js','city-touch-camera-controller.js','touch-camera-validator.js','city-customer-dashboard-plan.js','customer-dashboard-dom-validator.js','customer-dashboard-contract-validator.js']);
const ext=/\.(?:js|html|css)$/i; const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function walk(dir,out=[],prefix=''){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const rel=prefix?prefix+'/'+ent.name:ent.name;const abs=path.join(dir,ent.name); if(ent.isDirectory())walk(abs,out,rel); else out.push(rel);}return out;}
const baseFiles=walk(base).filter(f=>ext.test(f)); const errors=[]; let protectedChecked=0, allowedChanged=[];
for(const file of baseFiles){const bp=path.join(base,file), wp=path.join(build,file); if(!fs.existsSync(wp)){errors.push(file+': missing');continue;} const same=sha(bp)===sha(wp); if(allowed.has(file)){if(!same)allowedChanged.push(file);} else {protectedChecked++; if(!same) errors.push(file+': protected source changed');}}
for(const file of allowed){if(!baseFiles.includes(file)) errors.push(file+': allowed file absent from baseline');}
const requiredAsset=path.join(build,'assets/telekom-logo-current.png'); if(!fs.existsSync(requiredAsset)) errors.push('assets/telekom-logo-current.png missing');
const expectedAsset='230eb275ac48962b6a555ef886bad448e75741fd34336e8ffe9a80c5b0e62d0d'; if(fs.existsSync(requiredAsset)&&sha(requiredAsset)!==expectedAsset) errors.push('production logo SHA mismatch');
console.log(JSON.stringify({validator:'BUILD_013M19_SOURCE_REGRESSION',protectedChecked,allowedExistingProductionChanges:[...allowed].sort(),actualAllowedChanges:allowedChanged.sort(),status:errors.length?'FAILED':'PASSED',errors},null,2));
process.exit(errors.length?1:0);
