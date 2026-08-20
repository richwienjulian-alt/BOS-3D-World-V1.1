/* Mission BOS - Build 013M.2 preparation. Frozen additive Mission 004 network extension. */
(function () {
  "use strict";
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function deepFreeze(v) { if (!v || typeof v !== "object" || Object.isFrozen(v)) return v; Object.keys(v).forEach(function (k) { deepFreeze(v[k]); }); return Object.freeze(v); }
  var base = window.MISSION_BOS_NETWORK_REALISM_PLAN;
  var mission = window.MISSION_BOS_MISSION_004_PLAN;
  if (!base || !mission) { window.MISSION_BOS_MISSION_004_NETWORK_EXTENSION = null; return; }
  window.MISSION_BOS_NETWORK_REALISM_PLAN_013M1_BASELINE = base;
  var extended = clone(base);
  extended.buildBase = "013M.1 PASSED";
  extended.phase = "013M.2 Mission 004 Traffic Collision";
  extended.sourceBuild = "Mission-BOS-Build-013M.1";
  extended.participants = extended.participants || {};
  extended.participants.mission004Civilian = (mission.scene.bystanders || []).map(function (actor, index) {
    return { id: actor.endpointId, kind: "mission4-phone", referenceId: actor.id, label: "Unfall-Smartphone " + (index + 1), channel: "CIVILIAN", demandUnits: 1.0, activity: "upload", activeMode: "mission-004-scene" };
  });
  extended.participants.demandAccounting = extended.participants.demandAccounting || {};
  extended.participants.demandAccounting.mission004VisibleTotalUnits = 8.0;
  extended.participants.demandAccounting.mission004VisibleDemandIsSubtractedFromSaturationBase = true;
  extended.sameCellCompetition = extended.sameCellCompetition || {};
  extended.sameCellCompetition.mission004 = { required: true, minimumBosEndpoints: 3, minimumCivilianEndpoints: 4, minimumCellLoad: 90, allBosEndpointsUseSharedOperationalRuntime: true };
  extended.missionIntegration = extended.missionIntegration || {};
  extended.missionIntegration.mission004StatesPreserved = true;
  extended.missionIntegration.mission004AutomaticPriorityEndpoints = mission.network.activeBosEndpointIds.slice();
  extended.expectedCounts = extended.expectedCounts || {};
  extended.expectedCounts.towerIndicators = 5;
  extended.expectedCounts.bosEndpoints = 3;
  extended.expectedCounts.utilityEndpoints = 1;
  extended.expectedCounts.alwaysOnCivilianEndpoints = 13;
  extended.expectedCounts.mission001CivilianEndpoints = 6;
  extended.expectedCounts.arenaCivilianEndpoints = 12;
  extended.expectedCounts.mission003CivilianEndpoints = 6;
  extended.expectedCounts.mission004CivilianEndpoints = 8;
  extended.expectedCounts.allCivilianEndpoints = 46;
  extended.expectedCounts.allNonBosEndpoints = 46;
  extended.expectedCounts.allNetworkEndpoints = 49;
  extended.expectedCounts.maximumCivilianLines = 45;
  extended.expectedCounts.maximumUtilityLines = 1;
  extended.expectedCounts.maximumBosLines = 3;
  extended.expectedCounts.fixedServingTowerDefinitions = 0;
  extended.mission004Extension = { build: "013M.2", missionId: "MISSION_004", missionCivilianEndpointIds: mission.network.missionCivilianEndpointIds.slice(), baselineNetworkEndpointCount: Number((base.expectedCounts || {}).allNetworkEndpoints || 41), extendedNetworkEndpointCount: 49, fixedServingTowerDefinitions: 0 };
  window.MISSION_BOS_NETWORK_REALISM_PLAN = deepFreeze(extended);
  window.MISSION_BOS_MISSION_004_NETWORK_EXTENSION = deepFreeze({ status: "READY", baselinePlan: base, extendedPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN, civilianEndpoints: extended.participants.mission004Civilian.slice() });
})();
