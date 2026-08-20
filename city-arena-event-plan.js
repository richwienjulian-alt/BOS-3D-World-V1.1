/* Mission BOS - Build 010P.3
   Arena Event & Cell Load Foundation plan.
   Deterministic data only. No modules. No fetch. No fixed serving tower.
*/
(function () {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  window.MISSION_BOS_ARENA_EVENT_PLAN = deepFreeze({
    buildBase: "010P.2 PASSED",
    phase: "010P.3 Arena Event & Cell Load Foundation",
    sourceFiles: [
      { name: "city-layout-recovery.js", sha256: "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17" },
      { name: "city-static-props-plan.js", sha256: "e31ad502cf411bd586dad47d2e5c00f7e845ee2be0422d8c1966cd7b07ca96f8" },
      { name: "city-traffic-plan.js", sha256: "617b4ffa560859e0a11e54b009e159f34b73b71f7201617f92a1611568b54a65" },
      { name: "city-pedestrian-plan.js", sha256: "ca979d6b379bb7d8c3fc3a0f522617f4029a296333680b10fb2c2301cb8a44b7" },
      { name: "city-ambulance-plan.js", sha256: "65cf1140a39bd2a1d7d7129492a43f982e3d89d81dfda1e909f1e2a68a493cfa" },
      { name: "city-mission-registry-plan.js", sha256: "911dc8e8a2703ebc5de5c7d5c8380e2667e6be7b274db487abbae9c7f06e0c10" },
      { name: "city-cell-load-plan.js", sha256: "73d5b8b36673bad5d8f998b146710a44d17fccd9d3f938326df30325828d0524" },
      { name: "city-network-association-plan.js", sha256: "dea2e31b8bbc8f820d65c8d2f4a181c9a6afc83bd50a47b98adf70257f286dc4" },
      { name: "city-network-radio-model.js", sha256: "d41607faa2c1d36419f070033f727376b2a8445bd9c93c35abc5148071142294" },
      { name: "city-cell-capacity-plan.js", sha256: "9d4d85c9c15a1b9e9407d10d8174eca7ec8272e6da0e3abce1e74c76e95008e4" }
    ],
    policy: {
      runtimeRandomization: false,
      fileProtocolRequired: true,
      cityGeometryChangesAllowed: false,
      staticPropChangesAllowed: false,
      trafficRouteChangesAllowed: false,
      pedestrianRouteChangesAllowed: false,
      ambulancePlanChangesAllowed: false,
      mission001ChangesAllowed: false,
      mission002RuntimeAllowed: false,
      mission002StateMachineAllowed: false,
      medicalIncidentAllowed: false,
      patientAllowed: false,
      ambulanceMovementDuringEventTestAllowed: false,
      arenaBuildingChangesAllowed: false,
      visibleArenaCrowdAllowed: true,
      visibleArenaPhonesAllowed: true,
      aggregatedArenaDemandAllowed: true,
      sharedRadioModelRequired: true,
      fixedServingTowerAllowed: false,
      localCellLoadThresholdChangesAllowed: false,
      existingRepresentativeSourceMustRemain: true,
      automaticEventStartAllowed: false,
      automaticMissionStartAllowed: false,
      automaticBOSActivationAllowed: false,
      newStandaloneDashboardAllowed: false,
      rightDashboardMustRemain: true,
      temporaryTestControl: true
    },
    references: {
      arenaBuildingId: "E01",
      arenaForecourtId: "ARENA_FORECOURT",
      arenaTowerReferenceId: "MAST_E",
      ambulanceAccessId: "ARENA_AMBULANCE_ACCESS",
      ambulanceRouteId: "AMBULANCE_STATION_TO_ARENA_ROUTE",
      mission002Id: "MISSION_002",
      existingArenaPedestrianIds: ["PED_ARENA_01", "PED_ARENA_02"]
    },
    event: {
      id: "ARENA_EVENT_01",
      label: "Arena-Veranstaltung",
      states: ["INACTIVE", "ACTIVE"],
      initialState: "INACTIVE",
      activationMode: "manual-toggle-only",
      visibleOnlyWhileActive: true,
      mission002RuntimeCreated: false,
      eventTestRequiresMission001Ready: true,
      eventTestRequiresNoActiveMission: true,
      eventTestRequiresAmbulanceAtStation: true
    },
    simulation: {
      evaluationIntervalSeconds: 0.25,
      runtimeSafetyCheckIntervalSeconds: 0.25,
      idleAnimationAmplitude: 0.025,
      idleAnimationFrequencyMin: 0.55,
      idleAnimationFrequencyMax: 0.9,
      weakLinkOpacity: 0.10,
      weakLinkSelectedOpacity: 0.36,
      weakLinkWidth: 1,
      phoneDemandUnits: 1,
      crowdFootprintRadius: 0.28,
      crowdPersonalSpaceRadius: 0.48,
      pedestrianRouteSafetyMargin: 0.36,
      ambulanceRouteSafetyMargin: 0.18
    },
    crowd: [
      { id: "ARENA_VISITOR_01", position: { x: 25.0, y: 0, z: -30.0 }, rotation: 0, phone: true, bodyColor: "#2d6cdf", trouserColor: "#253247", skinColor: "#efc09a", hairColor: "#3b2b24" },
      { id: "ARENA_VISITOR_02", position: { x: 27.2, y: 0, z: -31.3 }, rotation: 0, phone: false, bodyColor: "#d06b3c", trouserColor: "#303c50", skinColor: "#d9a77f", hairColor: "#5a3a2d" },
      { id: "ARENA_VISITOR_03", position: { x: 29.5, y: 0, z: -30.2 }, rotation: 0, phone: true, bodyColor: "#008f8c", trouserColor: "#263142", skinColor: "#efc09a", hairColor: "#3b2b24" },
      { id: "ARENA_VISITOR_04", position: { x: 31.8, y: 0, z: -31.4 }, rotation: 0, phone: true, bodyColor: "#7a5cc7", trouserColor: "#2f3746", skinColor: "#d6a47c", hairColor: "#34251f" },
      { id: "ARENA_VISITOR_05", position: { x: 34.0, y: 0, z: -30.0 }, rotation: 0, phone: false, bodyColor: "#4f8a4f", trouserColor: "#2e394a", skinColor: "#f0bd96", hairColor: "#49342b" },
      { id: "ARENA_VISITOR_06", position: { x: 36.8, y: 0, z: -28.8 }, rotation: 0, phone: true, bodyColor: "#c24f62", trouserColor: "#263142", skinColor: "#e7b38c", hairColor: "#392820" },
      { id: "ARENA_VISITOR_07", position: { x: 39.0, y: 0, z: -29.1 }, rotation: 0, phone: true, bodyColor: "#2f79a8", trouserColor: "#303c50", skinColor: "#d8a47d", hairColor: "#4a3127" },
      { id: "ARENA_VISITOR_08", position: { x: 41.2, y: 0, z: -28.8 }, rotation: 0, phone: false, bodyColor: "#d28d2f", trouserColor: "#263142", skinColor: "#efc09a", hairColor: "#3b2b24" },
      { id: "ARENA_VISITOR_09", position: { x: 43.4, y: 0, z: -29.1 }, rotation: 0, phone: true, bodyColor: "#684ea0", trouserColor: "#2f3746", skinColor: "#d6a47c", hairColor: "#34251f" },
      { id: "ARENA_VISITOR_10", position: { x: 45.6, y: 0, z: -28.8 }, rotation: 0, phone: true, bodyColor: "#3f8a6b", trouserColor: "#303c50", skinColor: "#f0bd96", hairColor: "#49342b" },
      { id: "ARENA_VISITOR_11", position: { x: 47.8, y: 0, z: -29.1 }, rotation: 0, phone: true, bodyColor: "#bd5e3f", trouserColor: "#263142", skinColor: "#e7b38c", hairColor: "#392820" },
      { id: "ARENA_VISITOR_12", position: { x: 49.2, y: 0, z: -28.0 }, rotation: 0, phone: false, bodyColor: "#3c6fba", trouserColor: "#2e394a", skinColor: "#d8a47d", hairColor: "#4a3127" }
    ],
    visiblePhoneEndpoints: [
      { id: "ARENA_PHONE_01", actorId: "ARENA_VISITOR_01", kind: "arena-phone", channel: "CIVILIAN", demandUnits: 1 },
      { id: "ARENA_PHONE_02", actorId: "ARENA_VISITOR_03", kind: "arena-phone", channel: "CIVILIAN", demandUnits: 1 },
      { id: "ARENA_PHONE_03", actorId: "ARENA_VISITOR_04", kind: "arena-phone", channel: "CIVILIAN", demandUnits: 1 },
      { id: "ARENA_PHONE_04", actorId: "ARENA_VISITOR_06", kind: "arena-phone", channel: "CIVILIAN", demandUnits: 1 },
      { id: "ARENA_PHONE_05", actorId: "ARENA_VISITOR_07", kind: "arena-phone", channel: "CIVILIAN", demandUnits: 1 },
      { id: "ARENA_PHONE_06", actorId: "ARENA_VISITOR_09", kind: "arena-phone", channel: "CIVILIAN", demandUnits: 1 },
      { id: "ARENA_PHONE_07", actorId: "ARENA_VISITOR_10", kind: "arena-phone", channel: "CIVILIAN", demandUnits: 1 },
      { id: "ARENA_PHONE_08", actorId: "ARENA_VISITOR_11", kind: "arena-phone", channel: "CIVILIAN", demandUnits: 1 }
    ],
    aggregateDemandSources: [
      { id: "ARENA_AGGREGATE_WEST", position: { x: 27.5, z: -30.4 }, demandUnits: 14, meaning: "symbolische aggregierte Nutzung westlicher Besucherbereiche" },
      { id: "ARENA_AGGREGATE_CENTRE_W", position: { x: 34.8, z: -29.8 }, demandUnits: 13, meaning: "symbolische aggregierte Nutzung mittlerer Besucherbereiche" },
      { id: "ARENA_AGGREGATE_CENTRE_E", position: { x: 42.0, z: -29.1 }, demandUnits: 13, meaning: "symbolische aggregierte Nutzung mittlerer Besucherbereiche" },
      { id: "ARENA_AGGREGATE_EAST", position: { x: 48.0, z: -28.8 }, demandUnits: 13, meaning: "symbolische aggregierte Nutzung östlicher Besucherbereiche" }
    ],
    dynamicLoadSources: [
      { id: "ARENA_EVENT_VISIBLE_PHONES", maxDemandUnits: 8, requiredDemandUnits: 8 },
      { id: "ARENA_EVENT_AGGREGATE", maxDemandUnits: 53, requiredDemandUnits: 53 }
    ],
    loadCalibration: {
      arenaCellBaseLoad: 30,
      visiblePhoneDemandUnits: 8,
      aggregateDemandUnits: 53,
      totalEventDemandUnits: 61,
      existingRepresentativeArenaDemandMin: 1,
      existingRepresentativeArenaDemandMax: 3,
      expectedArenaCellLoadMin: 92,
      expectedArenaCellLoadMax: 94,
      overloadedAtOrAbove: 90,
      maximumCellLoad: 100,
      globalLoadMustRemainUnchanged: true,
      capacityPriorityMustRemainInactive: true
    },
    dashboard: {
      containerId: "arena-event-foundation-card",
      statusId: "arena-event-status",
      visibleCountId: "arena-event-visible-count",
      phoneCountId: "arena-event-phone-count",
      servingCellElementId: "arena-event-serving-cell",
      cellLoadId: "arena-event-cell-load",
      buttonId: "arena-event-test-button",
      startLabel: "Arena-Veranstaltung testen",
      stopLabel: "Veranstaltung beenden",
      inactiveLabel: "Inaktiv",
      activeLabel: "Veranstaltung aktiv"
    },
    runtimeContract: {
      requiredRendererMethods: ["setVisible", "update", "reset", "getActorPosition", "getPhonePosition", "getManifest", "getSafetyStatus"],
      requiredControllerMethods: ["activate", "deactivate", "toggle", "update", "reset", "isActive", "getAssociation", "getServingTowerId", "getManifest", "getSafetyStatus"],
      requiredConnectivityMethods: ["update", "setVisible", "reset", "getManifest", "getSafetyStatus"],
      requiredCellLoadMethods: ["setDynamicCivilianContributions", "getCellLoad", "getCell", "getAllCells"]
    },
    expectedCounts: {
      crowdActors: 12,
      phones: 8,
      aggregateDemandSources: 4,
      dynamicLoadSources: 2,
      visiblePhoneDemandUnits: 8,
      aggregateDemandUnits: 53,
      totalEventDemandUnits: 61,
      expectedServingTowers: 1,
      mission002Runtimes: 0,
      mission002Actors: 0,
      patients: 0,
      automaticEventStarts: 0,
      automaticMissionStarts: 0,
      automaticBOSActivations: 0,
      fixedServingTowerDefinitions: 0,
      newStandalonePanels: 0
    }
  });
})();
