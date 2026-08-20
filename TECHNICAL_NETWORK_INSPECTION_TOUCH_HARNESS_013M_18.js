const fs=require('fs'),vm=require('vm'),path=require('path');
const buildDir=__dirname;
let lastRayPoint=null;
class Vector2{constructor(x,y){this.x=x;this.y=y;}}
class Raycaster{
  constructor(){this.far=80;}
  setFromCamera(point){lastRayPoint={x:point.x,y:point.y};}
  intersectObjects(roots){return roots.length?[{distance:10,object:roots[0]}]:[];}
}
function element(){return {textContent:'',hidden:false,scrollWidth:300,clientWidth:300,classList:{contains(){return true;}},contains(){return true;}};}
const listeners={};
const ctx={console:{log(){},error(){},group(){},groupEnd(){}},THREE:{Raycaster,Vector2},document:{getElementById(){return null;}}};
ctx.window=ctx;
ctx.addEventListener=(type,fn)=>{(listeners[type] ||= []).push(fn);};
ctx.removeEventListener=(type,fn)=>{listeners[type]=(listeners[type]||[]).filter(x=>x!==fn);};
vm.createContext(ctx);
for(const f of ['city-network-exploration-plan.js','city-network-inspection-controller.js']) vm.runInContext(fs.readFileSync(path.join(buildDir,f),'utf8'),ctx,{filename:f});
const plan=ctx.MISSION_BOS_NETWORK_EXPLORATION_PLAN;
function root(id){return {id,parent:null};}
const recoveryCity={towersById:{},buildingsById:{}};
const response={vehiclesById:{},getVehicleStatus(){return 'In Bereitschaft';},getSafetyStatus(){return {status:'PASSED'};}};
const traffic={vehiclesById:{},getSafetyStatus(){return {status:'PASSED'};}};
const pedestrian={personsById:{},getSafetyStatus(){return {status:'PASSED'};}};
for(const t of plan.inspection.selectableTargets){
 if(t.kind==='tower') recoveryCity.towersById[t.referenceId]=root(t.referenceId);
 if(t.kind==='incident-building') recoveryCity.buildingsById[t.referenceId]=root(t.referenceId);
 if(t.kind==='response-vehicle') response.vehiclesById[t.referenceId]={mesh:root(t.referenceId)};
 if(t.kind==='civilian-vehicle') traffic.vehiclesById[t.referenceId]={mesh:root(t.referenceId)};
 if(t.kind==='civilian-pedestrian') pedestrian.personsById[t.referenceId]=root(t.referenceId);
}
const association={getSafetyStatus(){return {status:'PASSED'};},getHandoverHistory(){return [];},getAssociation(){return {servingTowerId:'MAST_A'};}};
const civilian={getSafetyStatus(){return {status:'PASSED'};},getHandoverHistory(){return [];},getAllAssociations(){return [];},getAssociation(){return {servingTowerId:'MAST_A',activityLabel:'Zivile Nutzung',demandUnits:1};}};
const load={getSafetyStatus(){return {status:'FAILED',fatal:false};},getCell(){return {baseLoad:30,dynamicCivilianLoad:3,currentLoad:33,status:'NORMAL'};}};
const capacity={getSafetyStatus(){return {status:'PASSED'};},getCell(){return {priorityApplied:false,civilianEndpointIds:[],bosEndpointIds:[],affectedCivilianEndpointIds:[]};},getEndpointServiceState(){return {label:'Best Effort'};}};
const mission={state:'READY',getState(){return this.state;}};
const visual={getSafetyStatus(){return {status:'PASSED'};},clearSelection(){},setSelectedTower(){},setSelectedEndpoint(){}};
const els={infoPanel:element(),panel:element(),name:element(),type:element(),servingCell:element(),cellLoad:element(),serviceState:element(),lastHandover:element(),note:element()};
els.infoPanel.contains=()=>true; els.panel.hidden=true;
const camera={position:{x:0,y:9,z:46},rotation:{x:-0.18,y:0,z:0},fov:56};
const runtime=ctx.MissionBosNetworkInspectionController.create({plan,camera,recoveryCity,responseRuntime:response,trafficRuntime:traffic,pedestrianRuntime:pedestrian,associationRuntime:association,civilianConnectivityRuntime:civilian,cellLoadRuntime:load,capacityRuntime:capacity,missionRuntime:mission,civilianVisualRuntime:visual,elements:els});
const manifest=runtime.getManifest(), initialSafety=runtime.getSafetyStatus();
let errors=[]; const check=(cond,msg)=>{if(!cond)errors.push(msg)};
check(manifest.status==='PASSED','manifest failed');
check(initialSafety.status==='PASSED','recoverable load warning poisoned inspection');
const selected=runtime.selectAtClientPoint(200,150,{left:0,top:0,width:800,height:600});
check(selected===true,'client-point selection failed');
check(Math.abs(lastRayPoint.x-(-0.5))<1e-9 && Math.abs(lastRayPoint.y-0.5)<1e-9,'client-point NDC conversion mismatch: '+JSON.stringify(lastRayPoint));
check(runtime.getSelection() && runtime.getSelection().id==='INSPECT_MAST_A','selection pipeline did not select existing target');
check(els.panel.hidden===false,'selection panel did not become visible');
check(camera.position.x===0&&camera.position.y===9&&camera.position.z===46&&camera.fov===56,'selection mutated camera');
check(mission.state==='READY','selection mutated mission');
const empty=runtime.selectAtNormalizedDeviceCoordinates(2,0);
check(empty===false,'out-of-range NDC should reject');
const result={status:errors.length?'FAILED':'PASSED',errors,manifest,initialSafety,lastRayPoint,selection:runtime.getSelection(),panelVisible:!els.panel.hidden};
console.log(JSON.stringify(result,null,2));
if(errors.length) process.exit(1);
