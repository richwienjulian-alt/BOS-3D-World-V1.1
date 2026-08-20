/* Mission BOS - Build 011N.3R.1
   Structural validator for the recovery-compatible Mission 001 network plan.
*/
(function () {
  "use strict";
  function add(result,key,detail){result.counts[key]+=1;result.errors.push({category:key,detail:detail||null});}
  function validate(options){
    options=options||{}; var plan=options.plan||window.MISSION_BOS_MISSION_001_NETWORK_POLISH_PLAN; var realism=options.networkRealismPlan||window.MISSION_BOS_NETWORK_REALISM_PLAN;
    var result={title:"MISSION BOS 011N.3R.1 NETWORK POLISH VALIDATION",counts:{dependencyErrors:0,policyErrors:0,realtimeAnchorErrors:0,thresholdErrors:0,visualLanguageErrors:0,backhaulContractErrors:0,ambulanceContractErrors:0,permanentConnectivityErrors:0,fixedServingTowerErrors:0,expectedCountErrors:0},errors:[],status:"PASSED"};
    if(!plan||!realism){add(result,"dependencyErrors","Required network plans missing.");result.status="FAILED";return result;}
    var p=plan.policy||{}; if(p.cityGeometryChangesAllowed!==false||p.routeChangesAllowed!==false||p.fixedServingTowerAllowed!==false||p.manualBosActivationAllowed!==false)add(result,"policyErrors",p);
    var rt=plan.realtimeAnchoring||{}; if(rt.endpointPositionRefresh!=="every-render-frame"||Number(rt.handoverDecisionIntervalSeconds)!==0.25||rt.handoverDecisionTimingMustRemainUnchanged!==true||rt.renderersMustNotUseQuarterSecondStalePositions!==true)add(result,"realtimeAnchorErrors",rt);
    var lc=plan.priorityLifecycle||{}; if(Number(lc.activationThresholdPercent)!==90||Number(lc.releaseThresholdPercent)!==85||Number(lc.activationDelaySeconds)!==0.6||Number(lc.releaseDelaySeconds)!==1.5||lc.noPriorityAtDepartureBelowActivationThreshold!==true||lc.noPriorityLatchAfterRelease!==true)add(result,"thresholdErrors",lc);
    var v=plan.bosVisualLanguage||{}, pre=v.prePriority||{}, active=v.activePriority||{}; if(pre.lineColor!=="#9BDFFF"||pre.packetColor!=="#B9E6FF"||Number(pre.packetCountPerVisiblePath)!==4||Number(pre.packetsPerDirection)!==2||pre.magentaPacketsVisible!==false||active.lineColor!=="#0066CC"||active.packetColor!=="#E20074"||Number(active.packetCountPerVisiblePath)!==4||Number(active.packetsPerDirection)!==2)add(result,"visualLanguageErrors",v);
    var indicator=plan.towerIndicator||{}; if(Number(indicator.prioritySegmentStartPercent)!==85||indicator.prioritySegmentOnlyOnActiveBosCell!==true||indicator.noBlueOnCellsWithoutActiveBos!==true)add(result,"thresholdErrors",indicator);
    var b=plan.mission001Backhaul||{}; if(b.controlBuildingId!=="B01"||JSON.stringify(b.bosEndpointIds||[])!==JSON.stringify(["NET_FIRE_01","NET_POLICE_01"])||b.uniqueServingTowerLinks!==true||b.followConfirmedServingCell!==true||b.permanentlyVisible!==true)add(result,"backhaulContractErrors",b);
    var a=plan.ambulanceStandbyConnectivity||{}; if(a.endpointId!=="NET_AMBULANCE_01"||a.vehicleId!=="AMBULANCE_01"||a.baseBuildingId!=="G02"||a.associationActiveMode!=="always"||a.vehicleToServingTowerAlwaysVisible!==true||a.baseToServingTowerAlwaysVisible!==true)add(result,"ambulanceContractErrors",a);
    var pc=plan.permanentBosConnectivity||{}; if(JSON.stringify(pc.endpointIds||[])!==JSON.stringify(["NET_FIRE_01","NET_POLICE_01","NET_AMBULANCE_01"])||pc.associationActiveMode!=="always"||pc.priorityEligibilityRemainsMissionScoped!==true||pc.standbyAddsFullMissionDemand!==false)add(result,"permanentConnectivityErrors",pc);
    var bos=((realism.participants||{}).bos)||[]; ['NET_FIRE_01','NET_POLICE_01','NET_AMBULANCE_01'].forEach(function(id){var e=bos.filter(function(x){return x&&x.id===id;})[0];if(!e||e.activeMode!=="always")add(result,"permanentConnectivityErrors",e||id+" missing");});
    var automatic=realism.automaticBOSPriority||{}; if(Number(automatic.overloadThreshold)!==90||Number(automatic.releaseThreshold)!==85||automatic.priorityActiveRequiresBosEndpointInCell!==true)add(result,"thresholdErrors",automatic);
    [].concat(bos,((realism.participants||{}).alwaysOnCivilian)||[],((realism.participants||{}).mission001Civilian)||[],((realism.participants||{}).arenaCivilian)||[]).forEach(function(e){if(e&&(Object.prototype.hasOwnProperty.call(e,"servingTowerId")||Object.prototype.hasOwnProperty.call(e,"fixedTowerId")||Object.prototype.hasOwnProperty.call(e,"towerId")))add(result,"fixedServingTowerErrors",e.id);});
    var ex=plan.expected||{}; if(ex.fixedServingTowerDefinitions!==0||ex.alwaysAssociatedBosEndpoints!==3||ex.packetsPerBosPath!==4||ex.packetDirections!==2)add(result,"expectedCountErrors",ex);
    result.status=result.errors.length?"FAILED":"PASSED"; return result;
  }
  function logResult(r){var m=r.status==="PASSED"?"log":"error";console.group(r.title);Object.keys(r.counts).forEach(function(k){console[m](k+": "+r.counts[k]);});console[m]("STATUS: "+r.status);if(r.errors.length)console.error(r.errors);console.groupEnd();}
  window.MissionBosMission001NetworkPolishValidator={validate:validate,logResult:logResult};
})();
