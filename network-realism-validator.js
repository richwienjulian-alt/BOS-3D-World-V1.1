/* Mission BOS - Build 012M.1
   Structural validator for the extended 41-endpoint network realism contract.
*/
(function(){
  "use strict";
  function add(errors, counts, key, detail){ counts[key]=(counts[key]||0)+1; errors.push({category:key,detail:detail||null}); }
  function groups(plan){ var p=(plan||{}).participants||{}; return {bos:p.bos||[],always:p.alwaysOnCivilian||[],m1:p.mission001Civilian||[],arena:p.arenaCivilian||[],utility:p.utility||[],m3:p.mission003Civilian||[]}; }
  function flatten(plan){ var g=groups(plan); return [].concat(g.bos,g.always,g.m1,g.arena,g.utility,g.m3); }
  function sum(a){return (a||[]).reduce(function(s,e){return s+Number((e||{}).demandUnits||0);},0);}
  function validate(options){
    options=options||{}; var plan=options.plan||window.MISSION_BOS_NETWORK_REALISM_PLAN; var errors=[]; var counts={sourceDependencyErrors:0,policyErrors:0,thresholdErrors:0,endpointDefinitionErrors:0,endpointReferenceErrors:0,duplicateEndpointErrors:0,demandAccountingErrors:0,visualLanguageErrors:0,automaticPriorityErrors:0,sameCellPolicyErrors:0,expectedCountErrors:0,fixedServingTowerErrors:0,utilityPolicyErrors:0};
    if(!plan){add(errors,counts,"sourceDependencyErrors","Plan missing");return result(errors,counts,{});} var p=plan.policy||{};
    if(p.cityGeometryChangesAllowed!==false||p.trafficRouteChangesAllowed!==false||p.fixedServingTowerAllowed!==false)add(errors,counts,"policyErrors","Frozen-world policy violated");
    if(p.automaticBOSPriorityRequired!==true||p.manualBOSActivationAllowed!==false)add(errors,counts,"automaticPriorityErrors","Automatic/manual BOS policy invalid");
    var th=(plan.loadIndicator||{}).thresholds||[]; if(th.length!==4||Number(th[0].min)!==0||Number(th[0].maxExclusive)!==55||Number(th[1].maxExclusive)!==75||Number(th[2].maxExclusive)!==90||Number(th[3].min)!==90)add(errors,counts,"thresholdErrors",th);
    var lane=((plan.loadIndicator||{}).priorityLane)||{}; if(lane.color!=="#0066CC"||Number(lane.visibleAtOrAboveLoad)!==90||Number(lane.prioritySegmentStartPercent)!==85||lane.visibleOnlyWhenPriorityActive!==true||Number(lane.availableOpacityWithoutBosEndpoint)!==0)add(errors,counts,"automaticPriorityErrors",lane);
    var g=groups(plan),all=flatten(plan),ids=Object.create(null);
    all.forEach(function(e){if(!e||!e.id||!e.referenceId||!e.channel||!isFinite(Number(e.demandUnits))||Number(e.demandUnits)<0)add(errors,counts,"endpointDefinitionErrors",e);if(e&&e.id){if(ids[e.id])add(errors,counts,"duplicateEndpointErrors",e.id);ids[e.id]=true;}if(e&&(Object.prototype.hasOwnProperty.call(e,"servingTowerId")||Object.prototype.hasOwnProperty.call(e,"towerId")||Object.prototype.hasOwnProperty.call(e,"fixedTowerId")))add(errors,counts,"fixedServingTowerErrors",e.id);});
    var refs=options.references||{}; function has(kind,id){return (refs[kind]||[]).indexOf(id)>=0;}
    g.always.forEach(function(e){if(e.kind==="civilian-vehicle"&&!has("traffic",e.referenceId))add(errors,counts,"endpointReferenceErrors",e.referenceId);if(e.kind==="civilian-pedestrian"&&!has("pedestrians",e.referenceId))add(errors,counts,"endpointReferenceErrors",e.referenceId);});
    g.m1.forEach(function(e){if(!has("mission1Spectators",e.referenceId))add(errors,counts,"endpointReferenceErrors",e.referenceId);});
    g.arena.forEach(function(e){if(!has("arenaVisitors",e.referenceId))add(errors,counts,"endpointReferenceErrors",e.referenceId);});
    if(g.utility.length){var u=g.utility[0];if(g.utility.length!==1||u.id!=="NET_STADTWERKE_01"||u.channel!=="UTILITY"||u.activeMode!=="always"||u.priorityEligible!==false||Number(u.demandUnits)!==1.5)add(errors,counts,"utilityPolicyErrors",u);if(refs.utility&&refs.utility.indexOf(u.referenceId)<0)add(errors,counts,"endpointReferenceErrors",u.referenceId);}
    g.m3.forEach(function(e){if(e.kind!=="mission3-phone"||e.activeMode!=="mission-003-scene")add(errors,counts,"endpointDefinitionErrors",e);if(refs.mission3Bystanders&&refs.mission3Bystanders.indexOf(e.referenceId)<0)add(errors,counts,"endpointReferenceErrors",e.referenceId);});
    var da=(plan.participants||{}).demandAccounting||{};
    if(Math.abs(sum(g.always)-Number(da.alwaysOnTotalUnits))>1e-9||Math.abs(sum(g.m1)-Number(da.mission001VisibleTotalUnits))>1e-9||Math.abs(sum(g.arena)-Number(da.arenaVisibleTotalUnits))>1e-9||Math.abs(sum(g.utility)-Number(da.utilityAlwaysOnUnits||0))>1e-9||Math.abs(sum(g.m3)-Number(da.mission003VisibleTotalUnits||0))>1e-9)add(errors,counts,"demandAccountingErrors",da);
    var v=plan.visualLanguage||{},cv=v.civilian||{},bv=v.bos||{},pre=bv.prePriority||{},active=bv.activePriority||{};
    if(cv.lineGeometry!=="continuous-solid"||cv.lineMustNeverBeDashed!==true||Number(cv.normalParticleCyclesPerSecond)<=0||Number(cv.defaultOpacity)!==0.075||Number(cv.overloadedOpacity)!==0.14||Number(cv.deprioritizedOpacity)!==0.18)add(errors,counts,"visualLanguageErrors",cv);
    if(bv.color!=="#0066CC"||bv.packetColor!=="#E20074"||pre.lineColor!=="#9BDFFF"||pre.packetColor!=="#B9E6FF"||pre.magentaPacketsVisible!==false||Number(pre.packetCountPerVisiblePath)!==4||Number(pre.packetsPerDirection)!==2||active.lineColor!=="#0066CC"||active.packetColor!=="#E20074"||Number(active.packetCountPerVisiblePath)!==4||Number(active.packetsPerDirection)!==2||Number(active.packetCyclesPerSecond)<=Number(pre.packetCyclesPerSecond))add(errors,counts,"visualLanguageErrors",bv);
    ["NET_FIRE_01","NET_POLICE_01","NET_AMBULANCE_01"].forEach(function(id){var e=g.bos.filter(function(x){return x&&x.id===id;})[0];if(!e||e.activeMode!=="always")add(errors,counts,"endpointDefinitionErrors",e||id+" missing");});
    if(((plan.sameCellCompetition||{}).mission001||{}).required!==true||((plan.sameCellCompetition||{}).mission002||{}).required!==true)add(errors,counts,"sameCellPolicyErrors",plan.sameCellCompetition);
    var exp=plan.expectedCounts||{},actual={towerIndicators:5,bosEndpoints:g.bos.length,alwaysOnCivilianEndpoints:g.always.length,mission001CivilianEndpoints:g.m1.length,arenaCivilianEndpoints:g.arena.length,utilityEndpoints:g.utility.length,mission003CivilianEndpoints:g.m3.length,allCivilianEndpoints:g.always.length+g.m1.length+g.arena.length+g.utility.length+g.m3.length,allNonBosEndpoints:g.always.length+g.m1.length+g.arena.length+g.utility.length+g.m3.length,allNetworkEndpoints:all.length,maximumUtilityLines:g.utility.length,fixedServingTowerDefinitions:0};
    Object.keys(actual).forEach(function(k){if(Object.prototype.hasOwnProperty.call(exp,k)&&Number(exp[k])!==Number(actual[k]))add(errors,counts,"expectedCountErrors",{key:k,expected:exp[k],actual:actual[k]});}); return result(errors,counts,actual);
  }
  function result(errors,counts,actual){return{title:"MISSION BOS NETWORK REALISM 012M.1 VALIDATION",counts:counts,actual:actual||{},errors:errors,status:errors.length?"FAILED":"PASSED"};}
  function logResult(r){var m=r.status==="PASSED"?"log":"error";console.group(r.title);Object.keys(r.counts).forEach(function(k){console[m](k+": "+r.counts[k]);});console[m]("Network endpoints: "+Number((r.actual||{}).allNetworkEndpoints||0));console[m]("Non-BOS endpoints: "+Number((r.actual||{}).allNonBosEndpoints||0));console[m]("STATUS: "+r.status);if(r.errors.length)console.error(r.errors);console.groupEnd();}
  window.MissionBosNetworkRealismValidator={validate:validate,logResult:logResult};
})();
