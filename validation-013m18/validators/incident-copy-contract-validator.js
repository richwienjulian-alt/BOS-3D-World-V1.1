const fs=require('fs'),vm=require('vm'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','contracts','build-013m18-ux-contract.js'),'utf8');
const ctx={globalThis:{}};ctx.window=undefined;vm.createContext(ctx);vm.runInContext(src,ctx);const c=ctx.globalThis.MISSION_BOS_BUILD_013M18_UX_CONTRACT;
let e=[];const forbidden=[/\bW14\b/i,/validierte Routen/i,/\bRuntime\b/i,/\bState\b/i,/Simulationseinheiten/i,/zivile Sitzungen/i,/Mission 00[1-4]/i];
for(const [mid,m] of Object.entries(c.incidentCard.missions)) for(const [state,x] of Object.entries(m.states)){
 if(!x.summaryPhase||!x.statusBadge||!x.stage||!x.description)e.push(`${mid}/${state}: missing field`);
 if(x.statusBadge.length>16)e.push(`${mid}/${state}: badge too long`);
 if(x.stage.length>36)e.push(`${mid}/${state}: stage too long`);
 if(x.description.length>150)e.push(`${mid}/${state}: description too long`);
 if(!/[.!?]$/.test(x.description))e.push(`${mid}/${state}: description punctuation missing`);
 forbidden.forEach(r=>{if(r.test(x.description)||r.test(x.stage)||r.test(x.statusBadge))e.push(`${mid}/${state}: forbidden customer term ${r}`)});
}
console.log(JSON.stringify({validator:'INCIDENT_COPY_CONTRACT_013M18',status:e.length?'FAILED':'PASSED',errors:e},null,2));process.exit(e.length?1:0);