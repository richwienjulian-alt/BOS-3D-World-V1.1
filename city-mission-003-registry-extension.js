/* Mission BOS - Build 012M.1 preparation
   Frozen additive extension of the existing mission registry to Mission 003.
*/
(function () {
  "use strict";

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  var base = window.MISSION_BOS_MISSION_REGISTRY_PLAN;
  var missionPlan = window.MISSION_BOS_MISSION_003_PLAN;
  if (!base || !missionPlan || !missionPlan.registryUpgrade) {
    window.MISSION_BOS_MISSION_003_REGISTRY_EXTENSION = null;
    return;
  }

  window.MISSION_BOS_MISSION_REGISTRY_PLAN_011N4_BASELINE = base;
  var extended = clone(base);
  extended.schemaVersion = "1.2.0";
  extended.buildBase = "011N.4 PASSED";
  extended.phase = "012M.1 Three-Mission Registry";
  extended.sourceBuild = "Mission-BOS-Build-011N.4";
  extended.policy = extended.policy || {};
  extended.policy.mission003RuntimeRequiredInAcceptedBuild = true;
  extended.policy.mission003MayBeSelectedInThisBuild = true;
  extended.policy.mission003MayBeStartedInThisBuild = true;
  extended.policy.mission003FailSoftMayNotBlockMission001OrMission002 = true;
  extended.policy.mission003IsOnlyOptionalDuringInitializationFailure = true;
  extended.policy.onlyOneActiveMissionAllowed = true;
  extended.policy.automaticMissionSelectionAllowed = false;
  extended.policy.automaticMissionStartAllowed = false;
  extended.policy.automaticMissionFinishAllowed = false;
  extended.policy.automaticBOSActivationAllowed = true;

  var definition = clone(missionPlan.registryUpgrade);
  definition.regressionReference = false;
  if (!(extended.missions || []).some(function (item) { return item && item.id === definition.id; })) {
    extended.missions.push(definition);
  }

  extended.runtimeContract = extended.runtimeContract || {};
  extended.runtimeContract.requiredRegistryMethods = [
    "selectMission", "registerRuntime", "registerUnavailable", "finalizeRuntimeRegistration",
    "getSelectedMissionId", "getSelectedDefinition", "getSelectedRuntime", "getActiveMissionId",
    "startSelected", "activateBOS", "finishSelected", "reset", "update", "getManifest", "getSafetyStatus"
  ];
  extended.runtimeContract.requiredMissionIds = ["MISSION_001", "MISSION_002"];
  extended.runtimeContract.failSoftMissionIds = ["MISSION_003"];
  extended.runtimeContract.finalizationRequiresEveryDefinitionResolved = true;
  extended.runtimeContract.acceptedBuildRequiresAllThreeRuntimes = true;
  extended.runtimeContract.controllerMustNotUpdateMissionRuntime = true;
  extended.runtimeContract.missionRuntimeRemainsUpdatedByApp = true;

  extended.expectedCounts = extended.expectedCounts || {};
  extended.expectedCounts.missions = 3;
  extended.expectedCounts.availableMissions = 3;
  extended.expectedCounts.plannedMissions = 0;
  extended.expectedCounts.selectableMissions = 3;
  extended.expectedCounts.startableMissions = 3;
  extended.expectedCounts.regressionReferenceMissions = 1;
  extended.expectedCounts.registeredRuntimesAfterFinalization = 3;
  extended.expectedCounts.mission002Runtimes = 1;
  extended.expectedCounts.mission003Runtimes = 1;
  extended.expectedCounts.maximumUnavailableMissionsInFailSoftMode = 1;
  extended.expectedCounts.automaticMissionSelections = 0;
  extended.expectedCounts.automaticMissionStarts = 0;
  extended.expectedCounts.automaticMissionFinishes = 0;
  extended.expectedCounts.automaticBOSActivations = 0;
  extended.expectedCounts.automaticCameraMovements = 0;
  extended.expectedCounts.missionSpecificServingTowerDefinitions = 0;
  extended.expectedCounts.newStandalonePanels = 0;

  extended.mission003Extension = {
    build: "012M.1",
    missionId: "MISSION_003",
    baselineMissionCount: Number((base.expectedCounts || {}).missions || 2),
    acceptedMissionCount: 3,
    requiredExistingMissionIds: ["MISSION_001", "MISSION_002"],
    failSoftMissionIds: ["MISSION_003"]
  };

  window.MISSION_BOS_MISSION_REGISTRY_PLAN = deepFreeze(extended);
  window.MISSION_BOS_MISSION_003_REGISTRY_EXTENSION = deepFreeze({
    status: "READY",
    baselinePlan: base,
    extendedPlan: window.MISSION_BOS_MISSION_REGISTRY_PLAN,
    missionDefinition: definition
  });
})();
