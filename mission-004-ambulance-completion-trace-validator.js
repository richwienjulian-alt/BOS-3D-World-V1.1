/* Mission BOS - Build 013M.9 preparation
   Real-runtime trace gate covering the complete Mission 004 ambulance finish cycle.
*/
(function () {
  "use strict";
  function finite(v,f){v=Number(v);return isFinite(v)?v:f;}
  function make(){return {title:"MISSION BOS MISSION 004 AMBULANCE COMPLETION TRACE",dependencyErrors:0,sequenceErrors:0,safetyErrors:0,timingErrors:0,routeErrors:0,completionErrors:0,status:"PASSED",errors:[],metrics:{}};}
  function add(r,k,m){r[k]+=1;r.errors.push(m);} function finish(r){if(r.errors.length)r.status="FAILED";return r;}
  function validate(trace, contract){
    var r=make(); trace=Array.isArray(trace)?trace:[];
    if(!contract||trace.length<3){add(r,"dependencyErrors","Actual Mission 004 ambulance completion trace is missing.");return finish(r);}
    var firstTransport=-1, firstHospital=-1, firstReturning=-1, firstStation=-1, finalReady=-1;
    trace.forEach(function(s,i){
      if(firstTransport<0 && (s.ambulanceState==="TO_HOSPITAL" || s.routeId==="AMBULANCE_M004_TO_HOSPITAL_ROUTE")) firstTransport=i;
      if(firstHospital<0 && s.ambulanceState==="AT_HOSPITAL") firstHospital=i;
      if(firstHospital>=0 && firstReturning<0 && s.ambulanceState==="RETURNING") firstReturning=i;
      if(firstReturning>=0 && firstStation<0 && s.ambulanceState==="AT_STATION") firstStation=i;
      if(firstStation>=0 && s.missionState==="READY" && s.ambulanceState==="AT_STATION") finalReady=i;
      if(s.ambulanceSafetyStatus && s.ambulanceSafetyStatus!=="PASSED") add(r,"safetyErrors","Ambulance runtime safety failed at t="+finite(s.time,0).toFixed(2)+" s: "+(s.ambulanceSafetyErrors||[]).join(" | "));
    });
    if(!(firstTransport>=0 && firstHospital>firstTransport && firstReturning>firstHospital && firstStation>firstReturning && finalReady>=firstStation)) {
      add(r,"sequenceErrors","Required real sequence TO_HOSPITAL -> AT_HOSPITAL -> RETURNING -> AT_STATION -> Mission READY was not observed.");
    }
    if(firstTransport>=0 && firstHospital>=0){
      var hospitalTime=finite(trace[firstHospital].time,0)-finite(trace[firstTransport].time,0);r.metrics.hospitalTransportSeconds=Number(hospitalTime.toFixed(3));
      if(hospitalTime>finite(contract.runtime&&contract.runtime.hospitalTransportMaximumSeconds,16.5)+0.2) add(r,"timingErrors","Hospital transport exceeded the bounded runtime window.");
    }
    if(firstHospital>=0 && firstReturning>=0){
      var hold=finite(trace[firstReturning].time,0)-finite(trace[firstHospital].time,0);r.metrics.hospitalToReturningSeconds=Number(hold.toFixed(3));
      var maxHold=finite(contract.returnLeg&&contract.returnLeg.hospitalHoldSeconds,2.5)+finite(contract.returnLeg&&contract.returnLeg.returnCommandStateDeadlineSeconds,0.35)+0.2;
      if(hold>maxHold) add(r,"timingErrors","Ambulance did not enter real RETURNING state after the hospital hold in time.");
    }
    if(firstReturning>=0 && firstStation>=0){
      var ret=finite(trace[firstStation].time,0)-finite(trace[firstReturning].time,0);r.metrics.returnSeconds=Number(ret.toFixed(3));
      if(ret>finite(contract.returnLeg&&contract.returnLeg.returnMaximumSeconds,6.0)+0.2) add(r,"timingErrors","Ambulance return to station exceeded the bounded runtime window.");
    }
    var hospitalRouteSeen=trace.some(function(s){return s.routeId==="AMBULANCE_M004_TO_HOSPITAL_ROUTE";});
    var returnRouteSeen=trace.some(function(s){return s.routeId===(contract.returnLeg&&contract.returnLeg.routeId);});
    if(!hospitalRouteSeen||!returnRouteSeen) add(r,"routeErrors","Both corrected hospital route and explicit hospital-to-station return route must be observed in the real trace.");
    var last=trace[trace.length-1]||{};
    if(last.missionState!=="READY"||last.ambulanceState!=="AT_STATION") add(r,"completionErrors","Trace did not finish with Mission 004 READY and ambulance AT_STATION.");
    return finish(r);
  }
  function logResult(r){var fn=r.status==="PASSED"?"log":"error";console.group(r.title);console[fn]("STATUS: "+r.status);console[fn](r.metrics);if(r.errors.length)console.error(r.errors);console.groupEnd();}
  window.MissionBosMission004AmbulanceCompletionTraceValidator={validate:validate,logResult:logResult};
})();
