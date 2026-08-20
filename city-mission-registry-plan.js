/* Mission BOS - Build 010P.4
   Dual-mission registry plan for Mission 001 and Mission 002.
   No modules. No fetch. No automatic mission or BOS actions.
*/
(function () {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  window.MISSION_BOS_MISSION_REGISTRY_PLAN = deepFreeze({
    schemaVersion: "1.1.0",
    project: "Mission BOS – Connected Response",
    buildBase: "010P.3 PASSED",
    phase: "010P.4 Dual-Mission Registry",
    sourceBuild: "Mission-BOS-Build-010P.3",
    policy: {
      fileProtocolRequired: true,
      existingRightDashboardMustRemain: true,
      secondDashboardAllowed: false,
      floatingMissionPanelAllowed: false,
      onlyOneActiveMissionAllowed: true,
      defaultMissionId: "MISSION_001",
      missionSelectionOnlyWhileReady: true,
      automaticMissionSelectionAllowed: false,
      automaticMissionStartAllowed: false,
      automaticMissionFinishAllowed: false,
      automaticBOSActivationAllowed: false,
      automaticCameraMovementAllowed: false,
      mission001PlanMayBeModified: false,
      mission001ControllerMayBeModified: false,
      mission001StateMachineMayBeModified: false,
      mission002RuntimeRequiredInThisBuild: true,
      mission002MayBeSelectedInThisBuild: true,
      mission002MayBeStartedInThisBuild: true,
      mission002ActorsAllowedInThisBuild: true,
      mission002VehiclesAllowedInThisBuild: false,
      cityGeometryChangesAllowed: false,
      networkAlgorithmChangesAllowed: false,
      missionSpecificServingTowerDefinitionsAllowed: false,
      stagedRuntimeRegistrationRequired: true
    },
    missions: [
      {
        id: "MISSION_001",
        number: "001",
        shortTitle: "Wohnungsbrand",
        title: "Wohnungsbrand Innenstadt",
        description: "Bestehende validierte Mission am Einsatzgebäude W14.",
        status: "AVAILABLE",
        statusLabel: "Bereit",
        selectable: true,
        startable: true,
        runtimeKey: "MISSION_001",
        planGlobal: "MISSION_BOS_MISSION_001_PLAN",
        controllerGlobal: "MissionBosMission001Controller",
        incidentReferenceId: "W14",
        regressionReference: true
      },
      {
        id: "MISSION_002",
        number: "002",
        shortTitle: "Arena-Notfall",
        title: "Arena · Medizinischer Notfall",
        description: "Medizinischer Notfall während einer stark ausgelasteten Arena-Veranstaltung.",
        status: "AVAILABLE",
        statusLabel: "Bereit",
        selectable: true,
        startable: true,
        runtimeKey: "MISSION_002",
        planGlobal: "MISSION_BOS_MISSION_002_PLAN",
        controllerGlobal: "MissionBosMission002Controller",
        incidentReferenceId: "E01",
        regressionReference: false
      }
    ],
    dashboard: {
      hostSectionSelector: ".mission-card",
      registryPanelId: "mission-registry-panel",
      registryListId: "mission-registry-list",
      registryStatusId: "mission-registry-status",
      sectionHeadingText: "Missionen",
      existingMissionButtonId: "mission-button",
      existingBOSButtonId: "bos-button",
      existingOverloadButtonId: "overload-button",
      existingMissionTitleId: "mission-title",
      existingMissionStatusId: "mission-status",
      existingMissionStageId: "mission-stage",
      rightDashboardWidthPx: 390,
      compactRowsRequired: true,
      plannedMissionMustAppearDisabled: false
    },
    runtimeContract: {
      registryGlobal: "MissionBosMissionRegistryController",
      requiredRegistryMethods: [
        "selectMission", "registerRuntime", "finalizeRuntimeRegistration",
        "getSelectedMissionId", "getSelectedDefinition", "getSelectedRuntime",
        "getActiveMissionId", "startSelected", "activateBOS", "finishSelected",
        "reset", "update", "getManifest", "getSafetyStatus"
      ],
      requiredMissionRuntimeMethods: [
        "start", "activateBOS", "finishAndReturn", "update", "reset",
        "getState", "getPhaseLabel", "getStageLabel", "getStatusLabel",
        "getDescription", "getProgress", "isActive", "isCompleted",
        "canStart", "canActivateBOS", "canFinish", "getSafetyStatus"
      ],
      controllerMustNotUpdateMissionRuntime: true,
      missionRuntimeRemainsUpdatedByApp: true,
      presenterRemainsBoundToMission001InThisBuild: true,
      stagedRuntimeRegistrationSupported: true
    },
    expectedCounts: {
      missions: 2,
      availableMissions: 2,
      plannedMissions: 0,
      selectableMissions: 2,
      startableMissions: 2,
      regressionReferenceMissions: 1,
      registeredRuntimesAfterFinalization: 2,
      mission002Runtimes: 1,
      automaticMissionSelections: 0,
      automaticMissionStarts: 0,
      automaticMissionFinishes: 0,
      automaticBOSActivations: 0,
      automaticCameraMovements: 0,
      missionSpecificServingTowerDefinitions: 0,
      newStandalonePanels: 0
    }
  });
})();
