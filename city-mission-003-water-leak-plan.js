/* Mission BOS - Build 012M.1 preparation
   Frozen Mission 003 mission, scene and network contract.
   This file is a specification and may be copied unchanged into the build.
*/
(function () {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  window.MISSION_BOS_MISSION_003_PLAN = deepFreeze({
    schemaVersion: "1.0",
    project: "Mission BOS - Connected Response",
    build: "012M.1",
    sourceBuild: "Mission-BOS-Build-011N.4",
    title: "Mission 003 - Wasserleitungsleck Innenstadt",
    shortTitle: "Wasserleitungsleck",
    missionId: "MISSION_003",
    policy: {
      fileProtocolRequired: true,
      runtimeRandomizationAllowed: false,
      cityGeometryChangesAllowed: false,
      existingMissionChangesAllowed: false,
      fixedServingTowerAllowed: false,
      automaticCameraMovementAllowed: false,
      automaticMissionStartAllowed: false,
      automaticMissionFinishAllowed: false,
      manualBosActivationAllowed: false,
      onlyMobileCommunicationInThisBuild: true,
      videoOrSensorCommunicationAllowed: false,
      ambulanceIncluded: false,
      utilityVehicleIsBosEndpoint: false,
      utilityVehicleUsesBluePriorityLane: false,
      existingRightDashboardMustRemain: true,
      newStandalonePanelAllowed: false
    },
    references: {
      incidentId: "MISSION_003_WATER_MAIN_LEAK",
      incidentSurfaceId: "STADTALLEE",
      landmarkId: "TOWN_HALL_SQUARE",
      fireVehicleId: "RESPONSE_FIRE_01",
      policeVehicleId: "RESPONSE_POLICE_01",
      utilityVehicleId: "STADTWERKE_01",
      fireEndpointId: "NET_FIRE_01",
      policeEndpointId: "NET_POLICE_01",
      utilityEndpointId: "NET_STADTWERKE_01",
      trafficYieldVehicleId: "CAR_DOWNTOWN_01",
      controlBuildingId: "B01",
      validationReferenceCellId: "MAST_B"
    },
    registryUpgrade: {
      id: "MISSION_003",
      number: "003",
      shortTitle: "Wasserleitungsleck",
      title: "Wasserleitungsleck Innenstadt",
      description: "Leck an einer Hauptwasserleitung nahe dem Rathaus. Stadtwerke, Feuerwehr und Polizei werden gemeinsam alarmiert.",
      status: "AVAILABLE",
      statusLabel: "Bereit",
      selectable: true,
      startable: true,
      runtimeKey: "MISSION_003",
      planGlobal: "MISSION_BOS_MISSION_003_PLAN",
      controllerGlobal: "MissionBosMission003Controller",
      incidentReferenceId: "MISSION_003_WATER_MAIN_LEAK"
    },
    stateOrder: [
      "READY",
      "CALL_RECEIVED",
      "ALARMING",
      "CLEARING_CORRIDOR",
      "ENROUTE",
      "ON_SCENE",
      "LEAK_ESCALATING",
      "OVERLOADED",
      "BOS_ACTIVE",
      "COMMS_STABLE",
      "WATER_ISOLATED",
      "REPAIRING",
      "COMPLETED",
      "RETURNING",
      "FAILED"
    ],
    states: [
      { id: "READY", phaseLabel: "Bereitschaft", stageLabel: "Bereit", statusLabel: "Mission 003 bereit", progress: 0, globalNetworkTarget: 38, userGate: "START" },
      { id: "CALL_RECEIVED", phaseLabel: "Störungsmeldung", stageLabel: "Wasserleck gemeldet", statusLabel: "Leck an Hauptwasserleitung", progress: 8, globalNetworkTarget: 54, minimumDurationSeconds: 1.5 },
      { id: "ALARMING", phaseLabel: "Alarmierung", stageLabel: "Drei Organisationen alarmiert", statusLabel: "Stadtwerke, Feuerwehr und Polizei alarmiert", progress: 16, globalNetworkTarget: 62, minimumDurationSeconds: 1.5 },
      { id: "CLEARING_CORRIDOR", phaseLabel: "Verkehr", stageLabel: "Einsatzweg sichern", statusLabel: "Innenstadtverkehr wird angehalten", progress: 24, globalNetworkTarget: 68 },
      { id: "ENROUTE", phaseLabel: "Anfahrt", stageLabel: "Einsatzkräfte unterwegs", statusLabel: "Stadtwerke, Feuerwehr und Polizei auf Anfahrt", progress: 38, globalNetworkTarget: 78 },
      { id: "ON_SCENE", phaseLabel: "Einsatzstelle", stageLabel: "Kräfte eingetroffen", statusLabel: "Einsatzstelle wird gesichert", progress: 52, globalNetworkTarget: 90, minimumDurationSeconds: 2.0 },
      { id: "LEAK_ESCALATING", phaseLabel: "Wasserleck", stageLabel: "Leck verschärft sich", statusLabel: "Wasseraustritt und Publikumsverkehr erhöhen die Zelllast", progress: 62, globalNetworkTarget: 96, minimumDurationSeconds: 2.5 },
      { id: "OVERLOADED", phaseLabel: "Kommunikation", stageLabel: "Innenstadtzelle überlastet", statusLabel: "BOS-Kommunikation konkurriert mit zivilen Nutzern", progress: 70, globalNetworkTarget: 100 },
      { id: "BOS_ACTIVE", phaseLabel: "BOS-Spur", stageLabel: "Priorisierung aktiv", statusLabel: "Feuerwehr und Polizei werden priorisiert", progress: 78, globalNetworkTarget: 100, minimumDurationSeconds: 2.0 },
      { id: "COMMS_STABLE", phaseLabel: "Koordination", stageLabel: "Kommunikation stabil", statusLabel: "Einsatzkoordination ist zuverlässig", progress: 84, globalNetworkTarget: 100, minimumDurationSeconds: 2.5 },
      { id: "WATER_ISOLATED", phaseLabel: "Absperrung", stageLabel: "Leitung geschlossen", statusLabel: "Wasseraustritt wird gestoppt", progress: 90, globalNetworkTarget: 94, minimumDurationSeconds: 2.5 },
      { id: "REPAIRING", phaseLabel: "Reparatur", stageLabel: "Leitung wird repariert", statusLabel: "Stadtwerke sichern und reparieren die Leitung", progress: 96, globalNetworkTarget: 88, minimumDurationSeconds: 5.0 },
      { id: "COMPLETED", phaseLabel: "Mission 003", stageLabel: "Einsatz abgeschlossen", statusLabel: "Wasserleitung gesichert", progress: 100, globalNetworkTarget: 86, userGate: "FINISH_AND_RETURN" },
      { id: "RETURNING", phaseLabel: "Rückstellung", stageLabel: "Rückfahrt", statusLabel: "Einsatzfahrzeuge kehren zurück", progress: 100, globalNetworkTarget: 52 },
      { id: "FAILED", phaseLabel: "Fehler", stageLabel: "Sicherheitsstopp", statusLabel: "Mission 003 angehalten", progress: 0, globalNetworkTarget: 38 }
    ],
    sequence: {
      initialState: "READY",
      callDurationSeconds: 1.5,
      alarmDurationSeconds: 1.5,
      dispatchRequiresConfirmedTrafficYield: true,
      onSceneRequiresAllThreeVehicles: true,
      onSceneHoldSeconds: 2.0,
      leakEscalationSeconds: 2.5,
      automaticBosActivationState: "OVERLOADED",
      bosActiveToStableSeconds: 2.0,
      stableToWaterIsolationSeconds: 2.5,
      waterIsolationSeconds: 2.5,
      repairSeconds: 5.0,
      finishAction: "FINISH_AND_RETURN",
      finishRequiresState: "COMPLETED",
      waterMustBeOffBeforeReturn: true,
      resetRequiresAllVehiclesAtBase: true,
      resetRequiresTrafficYieldReleased: true
    },
    network: {
      baseLoad: 38,
      riseRatePerSecond: 8,
      resetRatePerSecond: 12,
      saturationCycleSeconds: 8,
      saturationMinimumLoad: 98,
      saturationMaximumLoad: 100,
      saturationEnabledStates: ["ON_SCENE", "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "WATER_ISOLATED", "REPAIRING", "COMPLETED"],
      saturationDisabledStates: ["READY", "CALL_RECEIVED", "ALARMING", "CLEARING_CORRIDOR", "ENROUTE", "RETURNING", "FAILED"],
      activeBosEndpointIds: ["NET_FIRE_01", "NET_POLICE_01", "NET_STADTWERKE_01"],
      organizationalBosEndpointIds: ["NET_FIRE_01", "NET_POLICE_01"],
      missionScopedPriorityEndpointIds: ["NET_FIRE_01", "NET_POLICE_01", "NET_STADTWERKE_01"],
      missionScopedUtilityPriorityEndpointId: "NET_STADTWERKE_01",
      priorityValidStates: ["ON_SCENE", "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "WATER_ISOLATED", "REPAIRING", "COMPLETED", "RETURNING"],
      utilityEndpoint: {
        id: "NET_STADTWERKE_01",
        kind: "utility-vehicle",
        referenceId: "STADTWERKE_01",
        label: "Stadtwerke Einsatzfahrzeug",
        channel: "UTILITY",
        activity: "utility-operations",
        activeMode: "always",
        demandUnits: 1.5,
        priorityEligible: false,
        connectionVisibleAlways: true
      },
      dynamicLoadSources: [
        { id: "STADTWERKE_UTILITY_ENDPOINT", maxDemandUnits: 1.5 },
        { id: "MISSION_003_VISIBLE_ENDPOINTS", maxDemandUnits: 6.0 }
      ],
      missionCivilianEndpointIds: [
        "MISSION3_PHONE_01", "MISSION3_PHONE_02", "MISSION3_PHONE_03",
        "MISSION3_PHONE_04", "MISSION3_PHONE_05", "MISSION3_PHONE_06"
      ],
      sameCellCompetitionRequired: true,
      priorityMustFollowConfirmedServingCell: true,
      priorityMayNotTriggerHandover: true,
      priorityActivationThreshold: 90,
      priorityReleaseThreshold: 85,
      civilianDemandMustRemainVisibleDuringPriority: true,
      utilityConnectionMustRemainNonBos: true,
      referenceIncidentCellIdForValidationOnly: "MAST_B"
    },
    scene: {
      incidentPosition: { x: -7.26, y: 0.07, z: 6.36 },
      allowedSurfaceId: "STADTALLEE",
      landmarkId: "TOWN_HALL_SQUARE",
      visibleStates: ["CALL_RECEIVED", "ALARMING", "CLEARING_CORRIDOR", "ENROUTE", "ON_SCENE", "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "WATER_ISOLATED", "REPAIRING", "COMPLETED", "RETURNING"],
      waterJetStates: ["CALL_RECEIVED", "ALARMING", "CLEARING_CORRIDOR", "ENROUTE", "ON_SCENE", "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE"],
      waterJetMustFadeDuringState: "WATER_ISOLATED",
      waterJetFadeSeconds: 1.2,
      waterJetHiddenStates: ["READY", "REPAIRING", "COMPLETED", "RETURNING", "FAILED"],
      puddle: { id: "MISSION_003_PUDDLE", width: 3.2, depth: 1.6, opacity: 0.48, remainsVisibleThroughReturn: true },
      leakSource: { id: "MISSION_003_LEAK_SOURCE", radius: 0.34, maximumJetHeight: 2.1 },
      repairPatch: { id: "MISSION_003_REPAIR_PATCH", width: 1.5, depth: 0.9, visibleStates: ["REPAIRING", "COMPLETED", "RETURNING"] },
      barriers: [
        { id: "MISSION_003_BARRIER_W", position: { x: -13.45, y: 0.18, z: 7.62 }, rotationY: 0 },
        { id: "MISSION_003_BARRIER_E", position: { x: -1.15, y: 0.18, z: 5.10 }, rotationY: 0 }
      ],
      cones: [
        { id: "MISSION_003_CONE_01", position: { x: -8.9, y: 0.12, z: 5.05 } },
        { id: "MISSION_003_CONE_02", position: { x: -8.9, y: 0.12, z: 7.65 } },
        { id: "MISSION_003_CONE_03", position: { x: -5.6, y: 0.12, z: 5.05 } },
        { id: "MISSION_003_CONE_04", position: { x: -5.6, y: 0.12, z: 7.65 } },
        { id: "MISSION_003_CONE_05", position: { x: -7.25, y: 0.12, z: 4.98 } },
        { id: "MISSION_003_CONE_06", position: { x: -7.25, y: 0.12, z: 7.74 } }
      ],
      crew: [
        { id: "MISSION_003_UTILITY_WORKER_01", role: "utility-worker", position: { x: -5.55, y: 0, z: 7.55 }, rotationY: -2.2 },
        { id: "MISSION_003_UTILITY_WORKER_02", role: "utility-worker", position: { x: -5.75, y: 0, z: 5.15 }, rotationY: 2.2 },
        { id: "MISSION_003_FIRE_CREW_01", role: "firefighter", position: { x: -9.25, y: 0, z: 7.55 }, rotationY: 1.2 },
        { id: "MISSION_003_POLICE_OFFICER_01", role: "police", position: { x: -13.2, y: 0, z: 8.15 }, rotationY: 1.5 }
      ],
      visibilitySchedule: {
        incidentRootVisibleStates: ["CALL_RECEIVED", "ALARMING", "CLEARING_CORRIDOR", "ENROUTE", "ON_SCENE", "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "WATER_ISOLATED", "REPAIRING", "COMPLETED", "RETURNING"],
        bystandersVisibleStates: ["CALL_RECEIVED", "ALARMING", "CLEARING_CORRIDOR", "ENROUTE", "ON_SCENE", "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "WATER_ISOLATED", "REPAIRING", "COMPLETED"],
        responseCrewVisibleStates: ["ON_SCENE", "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "WATER_ISOLATED", "REPAIRING", "COMPLETED", "RETURNING"],
        barriersAndConesVisibleStates: ["ON_SCENE", "LEAK_ESCALATING", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "WATER_ISOLATED", "REPAIRING", "COMPLETED", "RETURNING"]
      },
      bystanders: [
        { id: "MISSION3_BYSTANDER_01", endpointId: "MISSION3_PHONE_01", position: { x: -11.1, y: 0, z: 9.35 } },
        { id: "MISSION3_BYSTANDER_02", endpointId: "MISSION3_PHONE_02", position: { x: -9.6, y: 0, z: 10.15 } },
        { id: "MISSION3_BYSTANDER_03", endpointId: "MISSION3_PHONE_03", position: { x: -8.1, y: 0, z: 9.15 } },
        { id: "MISSION3_BYSTANDER_04", endpointId: "MISSION3_PHONE_04", position: { x: -6.4, y: 0, z: 10.25 } },
        { id: "MISSION3_BYSTANDER_05", endpointId: "MISSION3_PHONE_05", position: { x: -4.8, y: 0, z: 9.25 } },
        { id: "MISSION3_BYSTANDER_06", endpointId: "MISSION3_PHONE_06", position: { x: -3.3, y: 0, z: 10.05 } }
      ]
    },
    controls: {
      missionButtonLabels: {
        READY: "Mission 003 starten",
        CALL_RECEIVED: "Störungsmeldung wird verarbeitet",
        ALARMING: "Einsatzkräfte werden alarmiert",
        CLEARING_CORRIDOR: "Einsatzweg wird gesichert",
        ENROUTE: "Einsatzkräfte auf Anfahrt",
        ON_SCENE: "Einsatzstelle wird gesichert",
        LEAK_ESCALATING: "Wasserleck verschärft sich",
        OVERLOADED: "BOS-Spur wird automatisch aktiviert",
        BOS_ACTIVE: "BOS-Priorisierung aktiv",
        COMMS_STABLE: "Kommunikation stabil",
        WATER_ISOLATED: "Wasserleitung wird geschlossen",
        REPAIRING: "Wasserleitung wird repariert",
        COMPLETED: "Einsatz beenden und zurückfahren",
        RETURNING: "Einsatzkräfte kehren zurück",
        FAILED: "Mission 003 fehlgeschlagen"
      }
    },
    runtimeContract: {
      controllerGlobal: "MissionBosMission003Controller",
      rendererGlobal: "MissionBosMission003SceneRenderer",
      requiredControllerMethods: [
        "start", "activateBOS", "finishAndReturn", "update", "reset",
        "getState", "getNetworkState", "getCellLoadProfileState", "getBosEndpointIds",
        "getPhaseLabel", "getStageLabel", "getStatusLabel", "getDescription", "getProgress",
        "isActive", "isCompleted", "canStart", "canActivateBOS", "canFinish",
        "getManifest", "getSafetyStatus", "dispose"
      ],
      requiredSceneMethods: ["setState", "update", "reset", "getEndpointPosition", "getManifest", "getSafetyStatus", "dispose"],
      requiredResponseMethods: ["prepare", "dispatch", "returnToBases", "update", "reset", "getState", "allAtScene", "allAtBase", "getSafetyStatus"],
      requiredNetworkAdapterMethods: ["beginMission", "setTargetLoad", "activateBOS", "endMission", "getLoad", "isBOSActive", "getSafetyStatus"]
    },
    expectedCounts: {
      states: 15,
      alarmedOrganizations: 3,
      responseVehicles: 3,
      bosEndpoints: 2,
      utilityEndpoints: 1,
      missionCivilianEndpoints: 6,
      missionScopedPriorityEndpoints: 3,
      sceneCrew: 4,
      bystanders: 6,
      barriers: 2,
      cones: 6,
      waterJets: 1,
      puddles: 1,
      repairPatches: 1,
      fixedServingTowerDefinitions: 0,
      automaticMissionStarts: 0,
      automaticMissionFinishes: 0,
      manualBosActivations: 0,
      newStandalonePanels: 0
    }
  });
})();
