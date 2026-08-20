/* Mission BOS - Build 013M.2 preparation. Frozen four-mission registry extension. */
(function () {
  "use strict";
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function deepFreeze(v) { if (!v || typeof v !== "object" || Object.isFrozen(v)) return v; Object.keys(v).forEach(function (k) { deepFreeze(v[k]); }); return Object.freeze(v); }
  var base = window.MISSION_BOS_MISSION_REGISTRY_PLAN;
  var mission = window.MISSION_BOS_MISSION_004_PLAN;
  if (!base || !mission || !mission.registryUpgrade) { window.MISSION_BOS_MISSION_004_REGISTRY_EXTENSION = null; return; }
  window.MISSION_BOS_MISSION_REGISTRY_PLAN_013M1_BASELINE = base;
  var extended = clone(base);
  extended.schemaVersion = "1.3.0";
  extended.buildBase = "013M.1 PASSED";
  extended.phase = "013M.2 Four-Mission Registry";
  extended.sourceBuild = "Mission-BOS-Build-013M.1";
  extended.policy = extended.policy || {};
  extended.policy.mission004RuntimeRequiredInAcceptedBuild = true;
  extended.policy.mission004MayBeSelectedInThisBuild = true;
  extended.policy.mission004MayBeStartedInThisBuild = true;
  extended.policy.mission004FailSoftMayNotBlockExistingMissions = true;
  extended.policy.onlyOneActiveMissionAllowed = true;
  extended.policy.automaticMissionSelectionAllowed = false;
  extended.policy.automaticMissionStartAllowed = false;
  extended.policy.automaticMissionFinishAllowed = false;
  if (!(extended.missions || []).some(function (item) { return item && item.id === "MISSION_004"; })) extended.missions.push(clone(mission.registryUpgrade));
  extended.runtimeContract = extended.runtimeContract || {};
  extended.runtimeContract.requiredMissionIds = ["MISSION_001", "MISSION_002", "MISSION_003"];
  extended.runtimeContract.failSoftMissionIds = ["MISSION_004"];
  extended.runtimeContract.finalizationRequiresEveryDefinitionResolved = true;
  extended.runtimeContract.acceptedBuildRequiresAllFourRuntimes = true;
  extended.runtimeContract.controllerMustNotUpdateMissionRuntime = true;
  extended.runtimeContract.missionRuntimeRemainsUpdatedByApp = true;
  extended.expectedCounts = extended.expectedCounts || {};
  extended.expectedCounts.missions = 4;
  extended.expectedCounts.availableMissions = 4;
  extended.expectedCounts.plannedMissions = 0;
  extended.expectedCounts.selectableMissions = 4;
  extended.expectedCounts.startableMissions = 4;
  extended.expectedCounts.registeredRuntimesAfterFinalization = 4;
  extended.expectedCounts.mission004Runtimes = 1;
  extended.expectedCounts.maximumUnavailableMissionsInFailSoftMode = 1;
  extended.expectedCounts.automaticMissionSelections = 0;
  extended.expectedCounts.automaticMissionStarts = 0;
  extended.expectedCounts.automaticMissionFinishes = 0;
  extended.expectedCounts.automaticCameraMovements = 0;
  extended.expectedCounts.missionSpecificServingTowerDefinitions = 0;
  extended.expectedCounts.newStandalonePanels = 0;
  extended.mission004Extension = { build: "013M.2", missionId: "MISSION_004", baselineMissionCount: Number((base.expectedCounts || {}).missions || 3), acceptedMissionCount: 4, requiredExistingMissionIds: ["MISSION_001", "MISSION_002", "MISSION_003"], failSoftMissionIds: ["MISSION_004"] };
  window.MISSION_BOS_MISSION_REGISTRY_PLAN = deepFreeze(extended);
  window.MISSION_BOS_MISSION_004_REGISTRY_EXTENSION = deepFreeze({ status: "READY", baselinePlan: base, extendedPlan: window.MISSION_BOS_MISSION_REGISTRY_PLAN, missionDefinition: clone(mission.registryUpgrade) });
})();
