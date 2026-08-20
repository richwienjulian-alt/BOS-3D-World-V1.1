/* Mission BOS - Build 012M.1
   Generic staged three-mission registry with fail-soft Mission 003 resolution.
   The app remains the sole owner of mission runtime updates.
*/
(function () {
  "use strict";

  function finite(value, fallback) { var n = Number(value); return isFinite(n) ? n : fallback; }
  function copy(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function count(items, key, value) { return (items || []).filter(function (item) { return item && item[key] === value; }).length; }
  function forbidden(value) {
    var total = 0;
    function walk(node) {
      if (!node || typeof node !== "object") return;
      Object.keys(node).forEach(function (key) {
        var k = String(key).toLowerCase();
        if (k === "servingtowerid" || k === "servingcellid" || k === "fixedtowerid" || k === "missiontowerid") total += 1;
        walk(node[key]);
      });
    }
    walk(value); return total;
  }

  function create(options) {
    options = options || {};
    var plan = options.plan || null;
    var validator = options.validator || null;
    var mission001Plan = options.mission001Plan || null;
    var mission002Plan = options.mission002Plan || null;
    var mission003Plan = options.mission003Plan || null;
    var presenterPlan = options.presenterPlan || null;
    var explorationPlan = options.explorationInterfacePlan || null;
    var networkExplorationPlan = options.networkExplorationPlan || null;
    var ui = options.ui || {};
    var runtimes = Object.create(null);
    var unavailable = Object.create(null);
    var rows = Object.create(null);
    var selectedMissionId = plan && plan.policy ? plan.policy.defaultMissionId : null;
    var finalized = false;
    var invalidSelectionAttempts = 0;
    var automaticActionErrors = 0;
    var runtimeContractErrors = 0;
    var lastSafetySignature = "";
    var safetyAccumulator = 0;
    var disposed = false;

    var validation = validator && typeof validator.validate === "function"
      ? validator.validate(mission001Plan, mission002Plan, presenterPlan, explorationPlan, networkExplorationPlan, plan, mission003Plan)
      : { title: "MISSION BOS MULTI-MISSION REGISTRY VALIDATION", status: "FAILED", errors: ["Validator unavailable"] };
    if (validator && typeof validator.logResult === "function") validator.logResult(validation);

    function definitions() { return plan && Array.isArray(plan.missions) ? plan.missions : []; }
    function definitionById(id) { var list=definitions(); for(var i=0;i<list.length;i+=1) if(list[i]&&list[i].id===id)return list[i]; return null; }
    function requiredMethods() { return plan&&plan.runtimeContract&&Array.isArray(plan.runtimeContract.requiredMissionRuntimeMethods)?plan.runtimeContract.requiredMissionRuntimeMethods:[]; }
    function runtimeValid(runtime) { return !!runtime&&typeof runtime==="object"&&requiredMethods().every(function(name){return typeof runtime[name]==="function";}); }
    function registeredIds() { return Object.keys(runtimes).sort(); }
    function unavailableIds() { return Object.keys(unavailable).sort(); }
    function resolvedIds() { var map=Object.create(null); registeredIds().concat(unavailableIds()).forEach(function(id){map[id]=true;}); return Object.keys(map).sort(); }
    function activeIds() { return registeredIds().filter(function(id){return runtimes[id]&&runtimes[id].isActive()===true;}); }
    function allReady() { var ids=registeredIds(); return !!ids.length&&ids.every(function(id){return runtimes[id]&&runtimes[id].getState()==="READY";}); }
    function allowedUnavailable(missionId) { var ids=((plan.runtimeContract||{}).failSoftMissionIds||[]); return ids.indexOf(missionId)>=0; }

    function registerRuntime(missionId, runtime) {
      if (disposed || validation.status !== "PASSED" || finalized) return false;
      var definition=definitionById(missionId);
      if(!definition||definition.runtimeKey!==missionId||runtimes[missionId]||unavailable[missionId]||!runtimeValid(runtime)){runtimeContractErrors+=1;updateUI();return false;}
      runtimes[missionId]=runtime; updateUI(); return true;
    }
    function registerUnavailable(missionId, reason) {
      if(disposed||validation.status!=="PASSED"||finalized||!definitionById(missionId)||runtimes[missionId]||unavailable[missionId]||!allowedUnavailable(missionId)){runtimeContractErrors+=1;updateUI();return false;}
      unavailable[missionId]={missionId:missionId,reason:String(reason||"Initialisierung fehlgeschlagen")}; updateUI(); return true;
    }
    function ensureSelectedResolved() {
      if(runtimes[selectedMissionId])return;
      var candidate=definitions().filter(function(d){return d&&runtimes[d.id];})[0];
      if(candidate)selectedMissionId=candidate.id;
    }
    function finalizeRuntimeRegistration() {
      if(disposed||validation.status!=="PASSED"||finalized)return false;
      var required=((plan.runtimeContract||{}).requiredMissionIds||[]);
      var everyResolved=definitions().every(function(d){return !!runtimes[d.id]||!!unavailable[d.id];});
      var requiredReady=required.every(function(id){return runtimeValid(runtimes[id]);});
      var unavailableLimit=finite((plan.expectedCounts||{}).maximumUnavailableMissionsInFailSoftMode,0);
      if(!everyResolved||!requiredReady||unavailableIds().length>unavailableLimit||!registeredIds().every(function(id){return runtimeValid(runtimes[id]);})){runtimeContractErrors+=1;updateUI();return false;}
      finalized=true; ensureSelectedResolved(); updateUI(); logManifest(getManifest()); logSafety(getSafetyStatus(),true); return true;
    }

    function selectMission(missionId) {
      if(disposed||validation.status!=="PASSED")return false;
      var definition=definitionById(missionId);
      if(!finalized||!definition||definition.selectable!==true||!runtimes[missionId]){invalidSelectionAttempts+=1;setStatus(!finalized?"Missionssystem wird initialisiert":"Mission kann nicht ausgewählt werden");updateUI();return false;}
      if(activeIds().length||!allReady()){invalidSelectionAttempts+=1;setStatus("Missionswechsel erst in Bereitschaft möglich");updateUI();return false;}
      selectedMissionId=missionId;updateUI();return true;
    }
    function getSelectedMissionId(){return selectedMissionId;}
    function getSelectedDefinition(){return definitionById(selectedMissionId);}
    function getSelectedRuntime(){return selectedMissionId?runtimes[selectedMissionId]||null:null;}
    function getActiveMissionId(){var ids=activeIds();return ids.length===1?ids[0]:null;}
    function startSelected(){if(!finalized||disposed||validation.status!=="PASSED"||activeIds().length)return false;var d=getSelectedDefinition(),r=getSelectedRuntime();if(!d||d.startable!==true||!r||r.canStart()!==true)return false;var ok=r.start()===true;updateUI();return ok;}
    function activateBOS(){if(!finalized||disposed||validation.status!=="PASSED")return false;var id=getActiveMissionId(),r=id?runtimes[id]:null;updateUI();return !!(r&&r.activateBOS&&r.activateBOS()===true);}
    function finishSelected(){if(!finalized||disposed||validation.status!=="PASSED")return false;var id=getActiveMissionId(),r=getSelectedRuntime();if(!id||id!==selectedMissionId||!r||r.canFinish()!==true)return false;var ok=r.finishAndReturn()===true;updateUI();return ok;}
    function reset(){if(disposed||validation.status!=="PASSED"||!finalized||!allReady())return false;selectedMissionId=plan.policy.defaultMissionId;ensureSelectedResolved();updateUI();return true;}

    function renderRows(){if(!ui.list)return;ui.list.innerHTML="";rows=Object.create(null);definitions().forEach(function(definition){var row=document.createElement("button");row.type="button";row.className="mission-registry-row";row.dataset.missionId=definition.id;var number=document.createElement("span");number.className="mission-registry-number";number.textContent=definition.number;var title=document.createElement("span");title.className="mission-registry-title";title.textContent=definition.shortTitle;var status=document.createElement("span");status.className="mission-registry-row-status";status.textContent=definition.statusLabel;row.appendChild(number);row.appendChild(title);row.appendChild(status);row.addEventListener("click",function(){selectMission(definition.id);});ui.list.appendChild(row);rows[definition.id]={row:row,status:status};});}
    function setStatus(text){if(ui.status)ui.status.textContent=text;}
    function updateUI(){
      if(!ui.panel||!ui.list||!ui.status||!plan)return;var activeId=getActiveMissionId(),ready=allReady();
      definitions().forEach(function(definition){var entry=rows[definition.id];if(!entry)return;var runtime=runtimes[definition.id]||null,isUnavailable=!!unavailable[definition.id],selected=selectedMissionId===definition.id,active=activeId===definition.id;entry.row.disabled=!(finalized&&definition.selectable===true&&runtime&&!activeId&&ready);entry.row.classList.toggle("selected",selected);entry.row.classList.toggle("active",active);entry.row.classList.toggle("planned",definition.status==="PLANNED");entry.row.classList.toggle("unavailable",isUnavailable);entry.row.setAttribute("aria-pressed",selected?"true":"false");entry.row.setAttribute("aria-disabled",entry.row.disabled?"true":"false");entry.status.textContent=isUnavailable?"Nicht verfügbar":runtime&&runtime.getState()!=="READY"?runtime.getStatusLabel():definition.statusLabel;entry.row.title=isUnavailable?unavailable[definition.id].reason:"";});
      if(validation.status!=="PASSED"){ui.panel.dataset.registryStatus="failed";setStatus("Missionsauswahl nicht verfügbar");return;}
      ui.panel.dataset.registryStatus=!finalized?"registering":(activeId?"active":unavailableIds().length?"degraded":"ready");
      if(!finalized)setStatus("Missionsruntimes werden registriert");else if(activeId){var ad=definitionById(activeId);setStatus(ad.number+" · "+ad.shortTitle+" aktiv · "+runtimes[activeId].getStatusLabel());}else{var sd=getSelectedDefinition();setStatus(sd.number+" · "+sd.shortTitle+" ausgewählt"+(unavailableIds().length?" · "+unavailableIds().length+" nicht verfügbar":""));}
    }

    function getManifest(){
      var list=definitions(),expected=plan&&plan.expectedCounts?plan.expectedCounts:{},registered=registeredIds(),missing=list.filter(function(d){return !runtimes[d.id]&&!unavailable[d.id];}).map(function(d){return d.id;});
      var manifest={title:"MISSION BOS THREE-MISSION REGISTRY RUNTIME MANIFEST",missions:list.length,availableMissions:count(list,"status","AVAILABLE"),plannedMissions:count(list,"status","PLANNED"),selectableMissions:count(list,"selectable",true),startableMissions:count(list,"startable",true),registeredRuntimes:registered.length,unavailableMissions:unavailableIds().length,unresolvedMissions:missing.length,selectedMissionId:selectedMissionId,registrationFinalized:finalized,automaticMissionStarts:0,automaticBOSActivations:0,fixedServingTowerDefinitions:forbidden(list),status:"PASSED"};
      var structureOk=validation.status==="PASSED"&&manifest.missions===Number(expected.missions)&&manifest.availableMissions===Number(expected.availableMissions)&&manifest.plannedMissions===Number(expected.plannedMissions)&&manifest.selectableMissions===Number(expected.selectableMissions)&&manifest.startableMissions===Number(expected.startableMissions)&&!!manifest.selectedMissionId&&manifest.fixedServingTowerDefinitions===0;
      var maxUnavailable=finite(expected.maximumUnavailableMissionsInFailSoftMode,0);var registrationOk=finalized?manifest.unresolvedMissions===0&&manifest.unavailableMissions<=maxUnavailable:manifest.registeredRuntimes<=Number(expected.registeredRuntimesAfterFinalization)&&manifest.unavailableMissions<=maxUnavailable;
      if(!structureOk||!registrationOk||runtimeContractErrors!==0)manifest.status="FAILED";return manifest;
    }
    function getSafetyStatus(){var ids=activeIds(),manifest=getManifest(),registered=registeredIds(),contractsOk=registered.every(function(id){return runtimeValid(runtimes[id]);}),required=((plan.runtimeContract||{}).requiredMissionIds||[]),requiredOk=!finalized||required.every(function(id){return !!runtimes[id];}),registrationOk=finalized?resolvedIds().length===definitions().length:true,unauthorized=ids.some(function(id){var d=definitionById(id);return !d||d.status!=="AVAILABLE"||d.startable!==true;});return{title:"MISSION BOS MISSION REGISTRY RUNTIME SAFETY",status:validation.status==="PASSED"&&manifest.status==="PASSED"&&contractsOk&&requiredOk&&registrationOk&&runtimeContractErrors===0&&automaticActionErrors===0&&ids.length<=1&&!unauthorized&&!!getSelectedDefinition()&&!!ui.panel&&!!ui.list&&!!ui.status?"PASSED":"FAILED",selectedMissionId:selectedMissionId,activeMissionId:ids.length===1?ids[0]:null,registeredRuntimeCount:registered.length,unavailableMissionCount:unavailableIds().length,registrationFinalized:finalized,invalidSelectionAttempts:invalidSelectionAttempts,automaticActionErrors:automaticActionErrors,runtimeContractErrors:runtimeContractErrors};}
    function logManifest(manifest){var method=manifest.status==="PASSED"?"log":"error",expected=(plan.expectedCounts||{}).registeredRuntimesAfterFinalization;console.group(manifest.title);console[method]("Missions: "+manifest.missions+" / "+Number((plan.expectedCounts||{}).missions));console[method]("Registered runtimes: "+manifest.registeredRuntimes+" / "+(manifest.registrationFinalized?expected:"1.."+expected));console[method]("Unavailable missions: "+manifest.unavailableMissions);console[method]("Unresolved missions: "+manifest.unresolvedMissions);console[method]("Registration finalized: "+manifest.registrationFinalized);console[method]("STATUS: "+manifest.status);console.groupEnd();}
    function logSafety(safety,force){var signature=[safety.status,safety.selectedMissionId,safety.activeMissionId,safety.registeredRuntimeCount,safety.unavailableMissionCount,safety.registrationFinalized,safety.invalidSelectionAttempts,safety.automaticActionErrors,safety.runtimeContractErrors].join("|");if(!force&&signature===lastSafetySignature)return;lastSafetySignature=signature;var method=safety.status==="PASSED"?"log":"error";console.group(safety.title);console[method]("Selected mission: "+safety.selectedMissionId);console[method]("Active mission: "+(safety.activeMissionId||"none"));console[method]("Registered runtimes: "+safety.registeredRuntimeCount);console[method]("Unavailable missions: "+safety.unavailableMissionCount);console[method]("Registration finalized: "+safety.registrationFinalized);console[method]("STATUS: "+safety.status);console.groupEnd();}
    function update(delta){if(disposed||validation.status!=="PASSED")return;updateUI();safetyAccumulator+=Math.max(0,finite(delta,0));if(safetyAccumulator>=0.25){safetyAccumulator%=0.25;logSafety(getSafetyStatus(),false);}}

    if(validation.status==="PASSED"){renderRows();Object.keys(options.missionRuntimes||{}).forEach(function(id){registerRuntime(id,options.missionRuntimes[id]);});updateUI();}else{setStatus("Missionsauswahl nicht verfügbar");if(ui.panel)ui.panel.dataset.registryStatus="failed";}
    logManifest(getManifest());logSafety(getSafetyStatus(),true);
    return{selectMission:selectMission,registerRuntime:registerRuntime,registerUnavailable:registerUnavailable,finalizeRuntimeRegistration:finalizeRuntimeRegistration,getSelectedMissionId:getSelectedMissionId,getSelectedDefinition:getSelectedDefinition,getSelectedRuntime:getSelectedRuntime,getActiveMissionId:getActiveMissionId,startSelected:startSelected,activateBOS:activateBOS,finishSelected:finishSelected,reset:reset,update:update,getManifest:function(){return copy(getManifest());},getSafetyStatus:function(){return copy(getSafetyStatus());}};
  }
  window.MissionBosMissionRegistryController={create:create};
})();
