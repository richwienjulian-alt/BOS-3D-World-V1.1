/* Mission BOS - Build 013M.16 reference
   Multi-agency response coordinator for Mission 003.
   Adds deterministic support-loop yielding so STADTWERKE_01 cannot collide with VAN_SUPPORT_01.
*/
(function () {
  "use strict";
  function copy(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function finite(v,f){v=Number(v);return isFinite(v)?v:f;}
  function normalize(v,len){if(!(len>0))return 0;return((finite(v,0)%len)+len)%len;}
  function nextSafeHold(config,currentDistance,routeLength){
    var holds=((config||{}).safeHoldDistances||[]).map(Number).filter(isFinite).sort(function(a,b){return a-b;});
    if(!holds.length||!isFinite(Number(currentDistance))||!(routeLength>0))return null;
    var current=normalize(currentDistance,routeLength),best=null;
    holds.forEach(function(hold){var forward=((hold-current)%routeLength+routeLength)%routeLength;if(!best||forward<best.forward-1e-9)best={hold:hold,forward:forward};});
    if(!best||best.forward>finite(config.maximumForwardTravelToHoldMeters,Infinity)+0.01)return null;
    return best;
  }
  function createFailed(message){var safety={title:"MISSION BOS MISSION 003 RESPONSE RUNTIME SAFETY",status:"FAILED",dependencyErrors:1,trafficYieldErrors:0,profileErrors:0,dispatchErrors:0,returnErrors:0,releaseErrors:0,errors:[message]};return{prepare:function(){return false;},dispatch:function(){return false;},returnToBases:function(){return false;},update:function(){},reset:function(){return false;},getState:function(){return"FAILED";},isPrepared:function(){return false;},isTrafficYieldConfirmed:function(){return false;},isTrafficReleased:function(){return false;},allAtScene:function(){return false;},allAtBase:function(){return false;},getSafetyStatus:function(){return copy(safety);}};}
  function create(options){
    options=options||{};var plan=options.plan,validation=options.validation,traffic=options.trafficRuntime,response=options.responseVehicleRuntime,utility=options.stadtwerkeRuntime;
    if(!plan||!validation||validation.status!=="PASSED"||!traffic||!response||!utility||typeof traffic.requestYieldAtDistance!=="function"||typeof traffic.getYieldStatus!=="function"||typeof traffic.releaseYield!=="function"||typeof response.setRouteProfile!=="function"||typeof utility.prepareMission003!=="function")return createFailed("Mission 003 response dependencies are incomplete.");
    var state="IDLE",primaryYieldRequested=false,supportYieldRequested=false,dispatchIssued=false,returnIssued=false,released=false,profilePrepared=false,supportHoldDistance=null;
    var safety={title:"MISSION BOS MISSION 003 RESPONSE RUNTIME SAFETY",status:"PASSED",dependencyErrors:0,trafficYieldErrors:0,profileErrors:0,dispatchErrors:0,returnErrors:0,releaseErrors:0,errors:[]};
    function yielded(vehicleId){var status=traffic.getYieldStatus(vehicleId);return !!status&&status.yielded===true;}
    function trafficYielded(){return yielded(plan.trafficYield.vehicleId)&&yielded(plan.supportTrafficYield.vehicleId);}
    function responseAtScene(){return response.getState&&response.getState()==="HOLDING";}
    function responseAtBase(){return response.getState&&response.getState()==="AT_STATIONS";}
    function allAtScene(){return responseAtScene()&&utility.isAtScene&&utility.isAtScene();}
    function allAtBase(){return responseAtBase()&&utility.isAtBase&&utility.isAtBase();}
    function addError(key,msg){safety[key]+=1;safety.errors.push(msg);safety.status="FAILED";}
    function releaseRequestedYields(){
      var ok=true;
      if(primaryYieldRequested){ok=traffic.releaseYield(plan.trafficYield.vehicleId)&&ok;primaryYieldRequested=false;}
      if(supportYieldRequested){ok=traffic.releaseYield(plan.supportTrafficYield.vehicleId)&&ok;supportYieldRequested=false;}
      return ok;
    }
    function prepare(){
      if(state!=="IDLE"||!allAtBase())return false;
      if(!response.setRouteProfile(plan.routeProfile.id,plan.routeProfile)){addError("profileErrors","Mission 003 response profile could not be prepared.");return false;}
      profilePrepared=true;
      if(!utility.prepareMission003()){addError("profileErrors","Stadtwerke route could not be prepared.");response.restoreDefaultRouteProfile();profilePrepared=false;return false;}
      if(!traffic.requestYieldAtDistance(plan.trafficYield.vehicleId,plan.trafficYield.holdDistance)){addError("trafficYieldErrors","Downtown traffic yield request failed.");return false;}
      primaryYieldRequested=true;
      var supportStatus=traffic.getYieldStatus(plan.supportTrafficYield.vehicleId);
      var supportVehicle=(window.MISSION_BOS_TRAFFIC_PLAN&&window.MISSION_BOS_TRAFFIC_PLAN.vehicles||[]).filter(function(v){return v.id===plan.supportTrafficYield.vehicleId;})[0];
      var supportRoute=(window.MISSION_BOS_TRAFFIC_PLAN&&window.MISSION_BOS_TRAFFIC_PLAN.routes||[]).filter(function(r){return r.id===plan.supportTrafficYield.routeId;})[0];
      var routeLength=supportRoute&&finite(supportRoute.length,0);
      var assignment=nextSafeHold(plan.supportTrafficYield,supportStatus&&supportStatus.currentDistance,routeLength);
      if(!supportVehicle||!assignment||!traffic.requestYieldAtDistance(plan.supportTrafficYield.vehicleId,assignment.hold)){
        releaseRequestedYields();addError("trafficYieldErrors","Support-loop traffic yield request failed.");return false;
      }
      supportYieldRequested=true;supportHoldDistance=assignment.hold;state="PREPARING";return true;
    }
    function dispatch(){
      if(state!=="PREPARING"||!trafficYielded())return false;
      if(!response.dispatch()||!utility.dispatchMission003()){addError("dispatchErrors","Multi-agency dispatch failed.");return false;}
      dispatchIssued=true;state="ENROUTE";return true;
    }
    function returnToBases(){
      if(state!=="AT_SCENE"||!allAtScene())return false;
      if(!response.returnToStations()||!utility.returnMission003ToBase()){addError("returnErrors","Multi-agency return failed.");return false;}
      returnIssued=true;state="RETURNING";return true;
    }
    function releaseAndRestore(){
      if(!allAtBase())return false;
      if(!releaseRequestedYields()){addError("releaseErrors","Civilian traffic release failed.");return false;}
      released=true;
      if(!response.restoreDefaultRouteProfile()){addError("profileErrors","Mission 001 default response profile was not restored.");return false;}
      profilePrepared=false;state="COMPLETE";return true;
    }
    function update(){if(state==="ENROUTE"&&allAtScene())state="AT_SCENE";if(state==="RETURNING"&&allAtBase())releaseAndRestore();}
    function reset(){
      if(!allAtBase()&&state!=="IDLE")return false;
      releaseRequestedYields();dispatchIssued=false;returnIssued=false;released=false;supportHoldDistance=null;
      if(response.getRouteProfileId&&response.getRouteProfileId()!=="MISSION_001_DEFAULT")response.restoreDefaultRouteProfile();
      if(utility.getState&&utility.getState()==="PARKED"&&utility.resetMission003)utility.resetMission003();
      profilePrepared=false;state="IDLE";safety.status=safety.errors.length?"FAILED":"PASSED";return safety.status==="PASSED";
    }
    function getSafetyStatus(){
      var result=copy(safety),responseSafety=response.getSafetyStatus&&response.getSafetyStatus(),utilitySafety=utility.getSafetyStatus&&utility.getSafetyStatus();
      if(!responseSafety||responseSafety.status!=="PASSED"||!utilitySafety||utilitySafety.status!=="PASSED"){result.dependencyErrors+=1;result.errors.push("Vehicle dependency is unsafe.");result.status="FAILED";}
      if(state==="RETURNING"&&released){result.releaseErrors+=1;result.errors.push("Traffic was released before all responders returned.");result.status="FAILED";}
      return result;
    }
    return{prepare:prepare,dispatch:dispatch,returnToBases:returnToBases,update:update,reset:reset,getState:function(){return state;},isPrepared:function(){return profilePrepared;},isTrafficYieldConfirmed:trafficYielded,isTrafficReleased:function(){return released;},allAtScene:allAtScene,allAtBase:allAtBase,getSafetyStatus:getSafetyStatus,getTrafficYieldStatus:function(){return{downtown:copy(traffic.getYieldStatus(plan.trafficYield.vehicleId)),support:copy(traffic.getYieldStatus(plan.supportTrafficYield.vehicleId)),supportHoldDistance:supportHoldDistance};}};
  }
  window.MissionBosMission003ResponseController={create:create};
})();
