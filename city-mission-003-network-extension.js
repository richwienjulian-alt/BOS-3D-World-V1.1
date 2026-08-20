/* Mission BOS - Build 012M.1 preparation
   Frozen additive network extension for Mission 003.
   Keeps the validated 011N.4 network plan available as a protected baseline.
*/
(function () {
  "use strict";

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  var base = window.MISSION_BOS_NETWORK_REALISM_PLAN;
  var missionPlan = window.MISSION_BOS_MISSION_003_PLAN;
  if (!base || !missionPlan || !missionPlan.network || !missionPlan.scene) {
    window.MISSION_BOS_MISSION_003_NETWORK_EXTENSION = null;
    return;
  }

  window.MISSION_BOS_NETWORK_REALISM_PLAN_011N4_BASELINE = base;
  var extended = clone(base);
  extended.buildBase = "011N.4 PRESENTATION BASELINE";
  extended.phase = "012M.1 Mission 003 Water Main Leak";
  extended.sourceBuild = "Mission-BOS-Build-011N.4";
  extended.participants = extended.participants || {};

  extended.participants.utility = [clone(missionPlan.network.utilityEndpoint)];
  extended.participants.mission003Civilian = (missionPlan.scene.bystanders || []).map(function (actor, index) {
    return {
      id: actor.endpointId,
      kind: "mission3-phone",
      referenceId: actor.id,
      label: "Wasserleck-Smartphone " + (index + 1),
      channel: "CIVILIAN",
      demandUnits: 1.0,
      activity: "upload",
      activeMode: "mission-003-scene"
    };
  });

  extended.participants.demandAccounting = extended.participants.demandAccounting || {};
  extended.participants.demandAccounting.utilityAlwaysOnUnits = 1.5;
  extended.participants.demandAccounting.mission003VisibleTotalUnits = 6.0;
  extended.participants.demandAccounting.mission003VisibleDemandIsSubtractedFromSaturationBase = true;

  extended.sameCellCompetition = extended.sameCellCompetition || {};
  extended.sameCellCompetition.mission003 = {
    required: true,
    minimumBosEndpoints: 1,
    minimumCivilianEndpoints: 2,
    minimumCellLoad: 90,
    utilityEndpointIsNotBos: true
  };

  extended.missionIntegration = extended.missionIntegration || {};
  extended.missionIntegration.mission003StatesPreserved = true;
  extended.missionIntegration.mission003AutomaticPriorityEndpoints = ["NET_FIRE_01", "NET_POLICE_01"];
  extended.missionIntegration.utilityEndpointUsesBosPriority = false;

  extended.expectedCounts = extended.expectedCounts || {};
  extended.expectedCounts.towerIndicators = 5;
  extended.expectedCounts.bosEndpoints = 3;
  extended.expectedCounts.utilityEndpoints = 1;
  extended.expectedCounts.alwaysOnCivilianEndpoints = 13;
  extended.expectedCounts.mission001CivilianEndpoints = 6;
  extended.expectedCounts.arenaCivilianEndpoints = 12;
  extended.expectedCounts.mission003CivilianEndpoints = 6;
  extended.expectedCounts.allCivilianEndpoints = 38;
  extended.expectedCounts.allNonBosEndpoints = 38;
  extended.expectedCounts.allNetworkEndpoints = 41;
  extended.expectedCounts.maximumCivilianLines = 37;
  extended.expectedCounts.maximumUtilityLines = 1;
  extended.expectedCounts.maximumBosLines = 3;
  extended.expectedCounts.fixedServingTowerDefinitions = 0;

  extended.mission003Extension = {
    build: "012M.1",
    missionId: "MISSION_003",
    utilityEndpointId: "NET_STADTWERKE_01",
    missionCivilianEndpointIds: missionPlan.network.missionCivilianEndpointIds.slice(),
    baselineNetworkEndpointCount: Number((base.expectedCounts || {}).allNetworkEndpoints || 34),
    extendedNetworkEndpointCount: 41,
    fixedServingTowerDefinitions: 0
  };

  window.MISSION_BOS_NETWORK_REALISM_PLAN = deepFreeze(extended);
  window.MISSION_BOS_MISSION_003_NETWORK_EXTENSION = deepFreeze({
    status: "READY",
    baselinePlan: base,
    extendedPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN,
    utilityEndpoint: extended.participants.utility[0],
    civilianEndpoints: extended.participants.mission003Civilian.slice()
  });
})();
