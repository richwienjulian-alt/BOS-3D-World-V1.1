/* Mission BOS - Build 010P.4
   Mission 002 Arena Medical Emergency Core - deterministic plan.
   No modules. No fetch. No fixed serving tower assignments.
*/
(function () {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  window.MISSION_BOS_MISSION_002_PLAN = deepFreeze({
    schemaVersion: "1.0.0",
    project: "Mission BOS – Connected Response",
    buildBase: "010P.3 PASSED",
    phase: "010P.4 Mission 002 Arena Core",
    sourceBuild: "Mission-BOS-Build-010P.3",

    sourceFiles: [
      { name: "city-layout-recovery.js", sha256: "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17" },
      { name: "city-static-props-plan.js", sha256: "e31ad502cf411bd586dad47d2e5c00f7e845ee2be0422d8c1966cd7b07ca96f8" },
      { name: "city-traffic-plan.js", sha256: "617b4ffa560859e0a11e54b009e159f34b73b71f7201617f92a1611568b54a65" },
      { name: "city-pedestrian-plan.js", sha256: "ca979d6b379bb7d8c3fc3a0f522617f4029a296333680b10fb2c2301cb8a44b7" },
      { name: "city-ambulance-plan.js", sha256: "65cf1140a39bd2a1d7d7129492a43f982e3d89d81dfda1e909f1e2a68a493cfa" },
      { name: "city-ambulance-renderer.js", sha256: "2673747ab77006fe8b70a8a9da37d093b7edadf51374f1c7c486d8533bd05005" },
      { name: "city-arena-event-plan.js", sha256: "2e62a21e5577ff52e864a73c2d9bd1430bc53a5968dc2948402130571be73d72" },
      { name: "city-arena-event-controller.js", sha256: "32d37d826e998edc1e0a7bcea82f55390ae65a8819bb567a0b94465716f2a556" },
      { name: "city-mission-registry-plan.js", sha256: "911dc8e8a2703ebc5de5c7d5c8380e2667e6be7b274db487abbae9c7f06e0c10" },
      { name: "city-cell-load-plan.js", sha256: "73d5b8b36673bad5d8f998b146710a44d17fccd9d3f938326df30325828d0524" },
      { name: "city-cell-capacity-plan.js", sha256: "9d4d85c9c15a1b9e9407d10d8174eca7ec8272e6da0e3abce1e74c76e95008e4" },
      { name: "city-network-association-plan.js", sha256: "dea2e31b8bbc8f820d65c8d2f4a181c9a6afc83bd50a47b98adf70257f286dc4" },
      { name: "city-network-radio-model.js", sha256: "d41607faa2c1d36419f070033f727376b2a8445bd9c93c35abc5148071142294" },
      { name: "app.js", sha256: "b5b42912d4547956b28a4abc679205ff0f57f3ebe6471fa398e14fa9eb5a874b" },
      { name: "index.html", sha256: "05c565c7011e63ae0b0dfefe6d684ee36b6e872374a5f37135849015555acbe4" },
      { name: "style.css", sha256: "a7a771a92d7c7fb32a7d1298a579deb9308f4984ac6488ecc9a85030040ab0d8" }
    ],

    policy: {
      runtimeRandomization: false,
      fileProtocolRequired: true,
      onlyOneActiveMissionAllowed: true,
      mission001MayBeModified: false,
      mission001RuntimeMayBeRewritten: false,
      cityGeometryChangesAllowed: false,
      staticPropChangesAllowed: false,
      trafficRouteChangesAllowed: false,
      pedestrianRouteChangesAllowed: false,
      ambulanceRouteChangesAllowed: false,
      networkAlgorithmChangesAllowed: false,
      handoverParameterChangesAllowed: false,
      fixedServingTowerAllowed: false,
      missionSpecificRadioAlgorithmAllowed: false,
      automaticMissionStartAllowed: false,
      automaticBOSActivationAllowed: false,
      automaticCameraMovementAllowed: false,
      manualBOSActivationRequired: true,
      civilianDemandMayDropAfterBOSActivation: false,
      eventCrowdMustRemainVisibleDuringMission: true,
      arenaEventOwnedByMission002WhileActive: true,
      separateArenaTestControlMustBeLockedDuringMission: true,
      ambulanceFoundationTestMustBeLockedDuringMission: true,
      policeResponseIncludedInThisBuild: false,
      complexMedicalSimulationAllowed: false,
      newStandaloneDashboardAllowed: false,
      existingRightDashboardMustRemain: true,
      symbolicCapacityModelRequired: true,
      presentationScopeLimited: true
    },

    references: {
      missionId: "MISSION_002",
      arenaEventId: "ARENA_EVENT_01",
      arenaBuildingId: "E01",
      arenaForecourtId: "ARENA_FORECOURT",
      validationReferenceCellId: "MAST_E",
      ambulanceId: "AMBULANCE_01",
      ambulanceEndpointId: "NET_AMBULANCE_01",
      ambulanceStationBuildingId: "G02",
      hospitalBuildingId: "G01",
      routeToArenaId: "AMBULANCE_STATION_TO_ARENA_ROUTE",
      routeToHospitalId: "AMBULANCE_ARENA_TO_HOSPITAL_ROUTE",
      routeToStationId: "AMBULANCE_HOSPITAL_TO_STATION_ROUTE",
      yieldVehicleId: "VAN_SUPPORT_01"
    },

    stateOrder: [
      "READY",
      "EVENT_ACTIVE",
      "CALL_RECEIVED",
      "CLEARING_CORRIDOR",
      "ENROUTE",
      "ON_SCENE",
      "OVERLOADED",
      "BOS_ACTIVE",
      "COMMS_STABLE",
      "TREATMENT",
      "COMPLETED",
      "TRANSPORTING",
      "AT_HOSPITAL",
      "RETURNING",
      "FAILED"
    ],

    states: [
      { id: "READY", phaseLabel: "Bereitschaft", stageLabel: "Bereit", statusLabel: "Bereit", progress: 0, globalNetworkTarget: 38, userGate: "START" },
      { id: "EVENT_ACTIVE", phaseLabel: "Arena", stageLabel: "Veranstaltung läuft", statusLabel: "Arena-Veranstaltung aktiv", progress: 8, globalNetworkTarget: 72, minimumDurationSeconds: 1.5 },
      { id: "CALL_RECEIVED", phaseLabel: "Notruf", stageLabel: "Medizinischer Notfall", statusLabel: "Notfall gemeldet", progress: 16, globalNetworkTarget: 78, minimumDurationSeconds: 1.5 },
      { id: "CLEARING_CORRIDOR", phaseLabel: "Alarmierung", stageLabel: "Korridor räumen", statusLabel: "Rettungsweg wird freigegeben", progress: 25, globalNetworkTarget: 82 },
      { id: "ENROUTE", phaseLabel: "Anfahrt", stageLabel: "Rettungswagen unterwegs", statusLabel: "Rettungsdienst auf Anfahrt", progress: 38, globalNetworkTarget: 86 },
      { id: "ON_SCENE", phaseLabel: "Arena", stageLabel: "Versorgung beginnt", statusLabel: "Rettungsdienst vor Ort", progress: 52, globalNetworkTarget: 92, minimumDurationSeconds: 2.0 },
      { id: "OVERLOADED", phaseLabel: "Kommunikation", stageLabel: "Arena-Zelle überlastet", statusLabel: "BOS-Kommunikation instabil", progress: 65, globalNetworkTarget: 96, userGate: "ACTIVATE_BOS" },
      { id: "BOS_ACTIVE", phaseLabel: "BOS-Spur", stageLabel: "Priorisierung", statusLabel: "BOS-Priorisierung aktiv", progress: 76, globalNetworkTarget: 96, minimumDurationSeconds: 2.5 },
      { id: "COMMS_STABLE", phaseLabel: "BOS-Spur", stageLabel: "Kommunikation stabil", statusLabel: "Rettungsdienst priorisiert", progress: 84, globalNetworkTarget: 96, minimumDurationSeconds: 2.5 },
      { id: "TREATMENT", phaseLabel: "Versorgung", stageLabel: "Patientenversorgung", statusLabel: "Patient wird versorgt", progress: 90, globalNetworkTarget: 96, minimumDurationSeconds: 4.0 },
      { id: "COMPLETED", phaseLabel: "Mission 002", stageLabel: "Transport bereit", statusLabel: "Patient transportbereit", progress: 94, globalNetworkTarget: 96, userGate: "FINISH_AND_RETURN" },
      { id: "TRANSPORTING", phaseLabel: "Transport", stageLabel: "Fahrt zum Krankenhaus", statusLabel: "Patiententransport läuft", progress: 97, globalNetworkTarget: 76 },
      { id: "AT_HOSPITAL", phaseLabel: "Krankenhaus", stageLabel: "Übergabe", statusLabel: "Patient wird übergeben", progress: 99, globalNetworkTarget: 58, minimumDurationSeconds: 2.5 },
      { id: "RETURNING", phaseLabel: "Rückstellung", stageLabel: "Rückfahrt", statusLabel: "Rettungswagen kehrt zurück", progress: 100, globalNetworkTarget: 48 },
      { id: "FAILED", phaseLabel: "Fehler", stageLabel: "Sicherheitsstopp", statusLabel: "Mission angehalten", progress: 0, globalNetworkTarget: 38 }
    ],

    sequence: {
      initialState: "READY",
      startAction: "START_MISSION",
      eventLeadInSeconds: 1.5,
      callDurationSeconds: 1.5,
      dispatchRequiresConfirmedYield: true,
      onSceneRequiresAmbulanceState: "AT_ARENA",
      onSceneHoldSeconds: 2.0,
      bosActivationState: "OVERLOADED",
      bosActivationAction: "ACTIVATE_BOS",
      bosActiveToStableSeconds: 2.5,
      stableToTreatmentSeconds: 2.5,
      treatmentSeconds: 4.0,
      finishAction: "FINISH_AND_RETURN",
      finishRequiresState: "COMPLETED",
      finishStartsAmbulanceTransport: true,
      hospitalHoldSeconds: 2.5,
      returnStartsAutomaticallyAfterHospitalHold: true,
      resetRequiresAmbulanceState: "AT_STATION",
      resetRequiresArenaEventInactive: true,
      releaseYieldAfterAmbulanceReturns: true
    },

    network: {
      baseLoad: 38,
      minimumOverloadLoad: 90,
      maximumGlobalLoad: 96,
      riseRatePerSecond: 8,
      resetRatePerSecond: 12,
      activeBosEndpointIds: ["NET_AMBULANCE_01"],
      localCellProfileStrategy: "BASE_PLUS_ARENA_EVENT_CONTRIBUTIONS",
      cellLoadProfileStateDuringMission: "READY",
      associationRuntimeStateDuringMission: "ENROUTE",
      bosActivationDoesNotReduceCivilianDemand: true,
      priorityMustFollowCurrentAmbulanceCell: true,
      priorityMayNotTriggerHandover: true,
      expectedArenaCellLoadMin: 92,
      expectedArenaCellLoadMax: 94,
      expectedReferenceCellAtArena: "MAST_E",
      visibleArenaCivilianEndpointIds: [
        "ARENA_PHONE_01", "ARENA_PHONE_02", "ARENA_PHONE_03", "ARENA_PHONE_04",
        "ARENA_PHONE_05", "ARENA_PHONE_06", "ARENA_PHONE_07", "ARENA_PHONE_08"
      ],
      symbolicCapacityUnits: 100,
      ambulanceDemandUnits: 12,
      minimumAffectedArenaSessionsAfterPriority: 1
    },

    scene: {
      allowedSurfaceId: "ARENA_FORECOURT",
      visibleStates: ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "TREATMENT", "COMPLETED"],
      patientVisibleStates: ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "TREATMENT", "COMPLETED"],
      paramedicVisibleStates: ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "TREATMENT", "COMPLETED"],
      hidePatientAtTransportStart: true,
      actors: [
        { id: "MISSION_002_PATIENT", role: "patient", position: { x: 41.15, y: 0.16, z: -26.65 }, rotation: 1.5708, pose: "lying", bodyColor: "#5877a8", trouserColor: "#2d3645", skinColor: "#e4b28b" },
        { id: "MISSION_002_PARAMEDIC_01", role: "paramedic", position: { x: 40.10, y: 0, z: -27.45 }, rotation: 0.45, pose: "treating", bodyColor: "#f4f6f8", accentColor: "#d62828", trouserColor: "#263142" },
        { id: "MISSION_002_PARAMEDIC_02", role: "paramedic", position: { x: 42.25, y: 0, z: -27.65 }, rotation: -0.55, pose: "treating", bodyColor: "#f4f6f8", accentColor: "#d62828", trouserColor: "#263142" }
      ],
      props: [
        { id: "MISSION_002_STRETCHER", kind: "stretcher", position: { x: 41.15, y: 0.09, z: -26.65 }, rotation: 1.5708, width: 1.80, depth: 0.66, height: 0.38 }
      ]
    },

    controls: {
      missionButtonLabels: {
        READY: "Mission 002 starten",
        EVENT_ACTIVE: "Arena-Veranstaltung läuft",
        CALL_RECEIVED: "Notruf wird verarbeitet",
        CLEARING_CORRIDOR: "Rettungsweg wird geräumt",
        ENROUTE: "Rettungswagen auf Anfahrt",
        ON_SCENE: "Rettungsdienst vor Ort",
        OVERLOADED: "BOS-Spur aktivieren",
        BOS_ACTIVE: "BOS-Priorisierung aktiv",
        COMMS_STABLE: "Kommunikation stabil",
        TREATMENT: "Patientenversorgung",
        COMPLETED: "Transport zum Krankenhaus",
        TRANSPORTING: "Patiententransport läuft",
        AT_HOSPITAL: "Patientenübergabe",
        RETURNING: "Rettungswagen kehrt zurück",
        FAILED: "Mission 002 fehlgeschlagen"
      },
      bosButtonLabels: {
        LOCKED: "BOS-Spur noch nicht verfügbar",
        AVAILABLE: "BOS-Spur aktivieren",
        ACTIVE: "BOS-Spur aktiv"
      }
    },

    registryUpgrade: {
      missionId: "MISSION_002",
      status: "AVAILABLE",
      statusLabel: "Bereit",
      selectable: true,
      startable: true,
      runtimeKey: "MISSION_002",
      planGlobal: "MISSION_BOS_MISSION_002_PLAN",
      controllerGlobal: "MissionBosMission002Controller",
      incidentReferenceId: "E01"
    },

    runtimeContract: {
      controllerGlobal: "MissionBosMission002Controller",
      rendererGlobal: "MissionBosMission002SceneRenderer",
      requiredControllerMethods: [
        "start", "activateBOS", "finishAndReturn", "update", "reset",
        "getState", "getNetworkState", "getCellLoadProfileState", "getBosEndpointIds",
        "getPhaseLabel", "getStageLabel", "getStatusLabel", "getDescription", "getProgress",
        "isActive", "isCompleted", "canStart", "canActivateBOS", "canFinish",
        "getManifest", "getSafetyStatus", "dispose"
      ],
      requiredSceneMethods: ["setState", "update", "reset", "getManifest", "getSafetyStatus", "dispose"],
      requiredArenaEventMethods: ["activateForMission", "deactivateForMission", "isActive", "getAllAssociations", "getSafetyStatus"],
      requiredAmbulanceMethods: ["startClearingCorridor", "dispatchToArena", "transportToHospital", "returnToStation", "getState", "getSafetyStatus"],
      requiredTrafficMethods: ["requestYieldAtDistance", "isVehicleYielded", "releaseYield", "getYieldStatus"],
      requiredNetworkAdapterMethods: ["beginMission", "setTargetLoad", "activateBOS", "endMission", "getLoad", "isBOSActive", "getSafetyStatus"]
    },

    expectedCounts: {
      states: 15,
      sceneActors: 3,
      patients: 1,
      paramedics: 2,
      sceneProps: 1,
      ambulances: 1,
      ambulanceWheels: 4,
      activeBosEndpoints: 1,
      visibleArenaCivilianEndpoints: 8,
      fixedServingTowerDefinitions: 0,
      automaticBOSActivations: 0,
      automaticCameraMovements: 0,
      policeResponseVehicles: 0,
      newStandalonePanels: 0
    }
  });
})();
