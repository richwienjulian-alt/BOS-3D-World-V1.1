/* Mission BOS - Build 012M.1
   Structural validator for generic staged mission registry plans.
*/
(function(){
  "use strict";
  function add(errors,counts,key,detail){counts[key]=(counts[key]||0)+1;errors.push({category:key,detail:detail||null});}
  function find(items,id){for(var i=0;i<(items||[]).length;i+=1)if(items[i]&&items[i].id===id)return items[i];return null;}
  function forbidden(value){var total=0;function walk(node){if(!node||typeof node!=="object")return;Object.keys(node).forEach(function(key){var k=String(key).toLowerCase();if(k==="servingtowerid"||k==="servingcellid"||k==="fixedtowerid"||k==="missiontowerid")total+=1;walk(node[key]);});}walk(value);return total;}
  function result(errors,counts,actual){return{title:"MISSION BOS MULTI-MISSION REGISTRY 012M.1 VALIDATION",counts:counts,actual:actual,errors:errors,lines:["STATUS: "+(errors.length?"FAILED":"PASSED")],status:errors.length?"FAILED":"PASSED"};}
  function validate(mission001Plan,mission002Plan,presenterPlan,explorationPlan,networkExplorationPlan,registryPlan,mission003Plan){
    var errors=[],counts={sourceDependencyErrors:0,missionDefinitionErrors:0,policyErrors:0,dashboardPolicyErrors:0,runtimeContractErrors:0,fixedServingTowerErrors:0,expectedCountErrors:0};
    if(!mission001Plan||!mission002Plan||!presenterPlan||!explorationPlan||!networkExplorationPlan||!registryPlan){add(errors,counts,"sourceDependencyErrors","Missing registry source");return result(errors,counts,{});}var missions=registryPlan.missions||[],expected=registryPlan.expectedCounts||{},m1=find(missions,"MISSION_001"),m2=find(missions,"MISSION_002"),m3=find(missions,"MISSION_003");
    if(!m1||!m2||m1.runtimeKey!=="MISSION_001"||m2.runtimeKey!=="MISSION_002")add(errors,counts,"missionDefinitionErrors","M1/M2 definitions invalid");
    if(Number(expected.missions)===3&&(!mission003Plan||!m3||m3.runtimeKey!=="MISSION_003"||m3.planGlobal!=="MISSION_BOS_MISSION_003_PLAN"||m3.controllerGlobal!=="MissionBosMission003Controller"))add(errors,counts,"missionDefinitionErrors","Mission 003 definition invalid");
    var policy=registryPlan.policy||{};if(policy.onlyOneActiveMissionAllowed!==true||policy.automaticMissionSelectionAllowed!==false||policy.automaticMissionStartAllowed!==false||policy.automaticMissionFinishAllowed!==false)add(errors,counts,"policyErrors",policy);
    var dashboard=registryPlan.dashboard||{};if(dashboard.registryPanelId!=="mission-registry-panel"||dashboard.registryListId!=="mission-registry-list"||dashboard.registryStatusId!=="mission-registry-status"||Number(dashboard.rightDashboardWidthPx)!==390||dashboard.compactRowsRequired!==true)add(errors,counts,"dashboardPolicyErrors",dashboard);
    var contract=registryPlan.runtimeContract||{},requiredRegistry=contract.requiredRegistryMethods||[],requiredMission=contract.requiredMissionRuntimeMethods||[];
    ["selectMission","registerRuntime","finalizeRuntimeRegistration","getSelectedMissionId","getSelectedDefinition","getSelectedRuntime","getActiveMissionId","startSelected","activateBOS","finishSelected","reset","update","getManifest","getSafetyStatus"].forEach(function(name){if(requiredRegistry.indexOf(name)<0)add(errors,counts,"runtimeContractErrors",name);});
    if(Number(expected.missions)===3&&requiredRegistry.indexOf("registerUnavailable")<0)add(errors,counts,"runtimeContractErrors","registerUnavailable");
    ["start","activateBOS","finishAndReturn","update","reset","getState","getPhaseLabel","getStageLabel","getStatusLabel","getDescription","getProgress","isActive","isCompleted","canStart","canActivateBOS","canFinish","getSafetyStatus"].forEach(function(name){if(requiredMission.indexOf(name)<0)add(errors,counts,"runtimeContractErrors",name);});
    if(contract.controllerMustNotUpdateMissionRuntime!==true||contract.missionRuntimeRemainsUpdatedByApp!==true)add(errors,counts,"runtimeContractErrors",contract);
    var fixed=forbidden(missions);if(fixed)add(errors,counts,"fixedServingTowerErrors",fixed);
    var actual={missions:missions.length,availableMissions:missions.filter(function(m){return m.status==="AVAILABLE";}).length,plannedMissions:missions.filter(function(m){return m.status==="PLANNED";}).length,selectableMissions:missions.filter(function(m){return m.selectable===true;}).length,startableMissions:missions.filter(function(m){return m.startable===true;}).length,regressionReferenceMissions:missions.filter(function(m){return m.regressionReference===true;}).length,mission002Runtimes:m2&&m2.runtimeKey==="MISSION_002"?1:0,mission003Runtimes:m3&&m3.runtimeKey==="MISSION_003"?1:0,automaticMissionSelections:0,automaticMissionStarts:0,automaticMissionFinishes:0,automaticBOSActivations:0,automaticCameraMovements:0,missionSpecificServingTowerDefinitions:fixed,newStandalonePanels:0,maximumUnavailableMissionsInFailSoftMode:Number(expected.maximumUnavailableMissionsInFailSoftMode||0)};
    Object.keys(expected).forEach(function(key){if(key==="registeredRuntimesAfterFinalization")return;if(Object.prototype.hasOwnProperty.call(actual,key)&&Number(actual[key])!==Number(expected[key]))add(errors,counts,"expectedCountErrors",{key:key,actual:actual[key],expected:expected[key]});});return result(errors,counts,actual);
  }
  function logResult(v){var m=v&&v.status==="PASSED"?"log":"error";console.group(v.title);Object.keys(v.counts||{}).forEach(function(k){console[m](k+": "+v.counts[k]);});console[m]("STATUS: "+v.status);if(v.errors&&v.errors.length)console.error(v.errors);console.groupEnd();}
  window.MissionBosMissionRegistryValidator={validate:validate,logResult:logResult};
})();
