/* Mission BOS - Build 013M.1
   BOS Activation Impact Polish & Mission 004 Traffic Collision Foundation

   Implementierungsbasis: Build 012M.4 (geschützte Drei-Missionen- und Unified-Baseline).
   Portable HTML-Demo:
   - kein Node.js
   - kein npm
   - kein Build-Prozess
   - kein lokaler Webserver
   - keine ES-Module
   - kein fetch()
   - Three.js ausschließlich per CDN
*/

if (typeof THREE === "undefined") {
  document.body.innerHTML = `
    <div style="padding: 32px; font-family: Arial; color: white; background: #07111f; min-height: 100vh;">
      <h1>Three.js konnte nicht geladen werden.</h1>
      <p>Prüfe bitte deine Internetverbindung, da diese Version Three.js per CDN lädt.</p>
    </div>
  `;
  throw new Error("THREE is not loaded.");
}

const RECOVERY_CONFIG = Object.freeze({
  useRecoveryCity: true,
  enableStaticProps: true,
  enableValidatedTraffic: true,
  enableValidatedPedestrians: true,
  enableValidatedResponseVehicles: true,
  enableValidatedAmbulanceFoundation: true,
  enableArenaEventFoundation: true,
  enableValidatedIncidentAccess: true,
  enableValidatedMission001: true,
  enableMissionRegistry: true,
  enableMission002: true,
  enableValidatedTelekomCommunication: true,
  enableValidatedPresenter: true,
  enableExplorationInterface: true,
  enableDynamicNetworkAssociation: true,
  enableLocalCellLoad: true,
  enableCellCapacityAllocation: true,
  enableHandoverVisualization: true,
  enableRepresentativeCivilianConnectivity: true,
  enableNetworkInspection: false,
  enableReleaseAudit: false,
  enableLegacyTraffic: false,
  enablePedestrians: false,
  enableResponseVehicles: false,
  enableMissionVisuals: false,
  enableLegacyWorld: false,
  enableCommunicationRenderer: false
});

window.MISSION_BOS_LEGACY_COMMUNICATION_ACTIVE = RECOVERY_CONFIG.enableCommunicationRenderer;

/* -------------------------------------------------------------------------- */
/* DOM                                                                        */
/* -------------------------------------------------------------------------- */

const container = document.getElementById("scene-container");
const infoPanel = document.getElementById("info-panel");

const missionButton = document.getElementById("mission-button");
const bosButton = document.getElementById("bos-button");
const overloadButton = document.getElementById("overload-button");
const missionRegistryPanel = document.getElementById("mission-registry-panel");
const missionRegistryList = document.getElementById("mission-registry-list");
const missionRegistryStatus = document.getElementById("mission-registry-status");
const ambulanceTestButton = document.getElementById("ambulance-test-button");
const ambulanceTestStatus = document.getElementById("ambulance-test-status");
const ambulanceServingCell = document.getElementById("ambulance-serving-cell");
const arenaEventCard = document.getElementById("arena-event-foundation-card");
const arenaEventStatus = document.getElementById("arena-event-status");
const arenaEventVisibleCount = document.getElementById("arena-event-visible-count");
const arenaEventPhoneCount = document.getElementById("arena-event-phone-count");
const arenaEventServingCell = document.getElementById("arena-event-serving-cell");
const arenaEventCellLoad = document.getElementById("arena-event-cell-load");
const arenaEventTestButton = document.getElementById("arena-event-test-button");

const presenterPanel = document.getElementById("presenter-panel");
const presenterModeButton = document.getElementById("presenter-mode-button");
const presenterHintTitle = document.getElementById("presenter-hint-title");
const presenterHintMessage = document.getElementById("presenter-hint-message");
const presenterCameraButtons = document.getElementById("presenter-camera-buttons");
const presenterNextButton = document.getElementById("presenter-next-button");
const presenterResetButton = document.getElementById("presenter-reset-button");
const presenterStatus = document.getElementById("presenter-status");

const activeModeValue = document.getElementById("active-mode");
const missionPhaseValue = document.getElementById("mission-phase-value");
const missionStageValue = document.getElementById("mission-stage");
const networkStatus = document.getElementById("network-status");
const loadValue = document.getElementById("load-value");
const loadFill = document.getElementById("load-fill");
const missionProgressFill = document.getElementById("mission-progress-fill");

const missionTitleValue = document.getElementById("mission-title");
const missionStatusValue = document.getElementById("mission-status");
const missionDescriptionValue = document.getElementById("mission-description");
const fireUnitStatusValue = document.getElementById("fire-unit-status");
const cityStatusValue = document.getElementById("city-status");

const communicationPathValue = document.getElementById("communication-path");
const communicationStatusValue = document.getElementById("communication-status");
const mobileStatusValue = document.getElementById("mobile-status");
const priorityStatusValue = document.getElementById("priority-status");
const priorityValue = document.getElementById("priority-value");
const bosExplanation = document.getElementById("bos-explanation");
const dispatchLinkStatusValue = document.getElementById("dispatch-link-status");
const communicationComparison = document.getElementById("communication-comparison");
const civilianChannelStatusValue = document.getElementById("civilian-channel-status");
const civilianChannelFill = document.getElementById("civilian-channel-fill");
const bosChannelStatusValue = document.getElementById("bos-channel-status");
const bosChannelFill = document.getElementById("bos-channel-fill");
const communicationComparisonNote = document.getElementById("communication-comparison-note");
const communicationSymbolicHint = document.getElementById("communication-symbolic-hint");
const fireServingCellRow = document.getElementById("fire-serving-cell-row");
const policeServingCellRow = document.getElementById("police-serving-cell-row");
const ambulanceServingCellRow = document.getElementById("ambulance-serving-cell-row");
const fireServingCellValue = document.getElementById("fire-serving-cell");
const policeServingCellValue = document.getElementById("police-serving-cell");
const lastHandoverValue = document.getElementById("last-handover");
const cellLoadSection = document.getElementById("cell-load-section");
const cellLoadRows = document.getElementById("cell-load-rows");
const criticalCellValue = document.getElementById("critical-cell-value");
const customerMaxCellLoadValue = document.getElementById("customer-max-cell-load");
const customerNetworkStory = document.getElementById("customer-network-story");
const customerNetworkStoryTitle = document.getElementById("customer-network-story-title");
const customerNetworkStoryText = document.getElementById("customer-network-story-text");
let lastValidCellLoadDashboardSnapshot = null;
const capacityAllocationSummary = document.getElementById("capacity-allocation-summary");
const capacityAllocationState = document.getElementById("capacity-allocation-state");
const capacityAllocationRows = document.getElementById("capacity-allocation-rows");
const capacityAllocationNote = document.getElementById("capacity-allocation-note");
const capacityAllocationHint = document.getElementById("capacity-allocation-hint");

const dispatchStatusValue = document.getElementById("dispatch-status");
const stationStatusValue = document.getElementById("station-status");
const vehicleCountValue = document.getElementById("vehicle-count");
const pedestrianCountValue = document.getElementById("pedestrian-count");

/* -------------------------------------------------------------------------- */
/* Zustände                                                                   */
/* -------------------------------------------------------------------------- */

const CITY_STATES = Object.freeze({
  NORMAL: "NORMAL",
  HIGH_LOAD: "HIGH_LOAD",
  OVERLOADED: "OVERLOADED",
  BOS_ACTIVE: "BOS_ACTIVE"
});

const MISSION_PHASES = Object.freeze({
  READY: "READY",
  ALERTING: "ALERTING",
  ENROUTE: "ENROUTE",
  SCENE: "SCENE",
  NETWORK_OVERLOAD: "NETWORK_OVERLOAD",
  BOS_ACTIVE: "BOS_ACTIVE",
  COMMS_STABLE: "COMMS_STABLE",
  COMPLETED: "COMPLETED"
});

const VEHICLE_STATES = Object.freeze({
  STATION: "station",
  ALARMED: "alarmed",
  ENROUTE: "enroute",
  ARRIVED: "arrived",
  RETURNING: "returning"
});

const incidentSite = {
  x: -16,
  z: 16,
  frontZ: 19.4,
  baseY: 5.2,
  roofY: 14.2,
  holdX: -12,
  holdZ: 24
};

let networkLoad = 38;
let simulatedMinutes = 8 * 60 + 15;
let panelUpdateTimer = 0;
let missionVisuals = null;
let recoveryCity = null;
let recoveryStaticProps = null;
let validatedTraffic = null;
let validatedPedestrians = null;
let validatedResponseVehicles = null;
let validatedAmbulance = null;
let validatedAmbulanceFoundation = null;
let validatedAmbulanceConnectivity = null;
let validatedArenaEventRenderer = null;
let validatedArenaEvent = null;
let validatedArenaEventConnectivity = null;
let validatedArenaEventValidation = null;
let combinedNetworkVehicleRuntime = null;
let combinedNetworkReferencePlan = null;
let validatedCellLoad = null;
let validatedNetworkAssociation = null;
let validatedNetworkRealismValidation = null;
let validatedBOSActivationImpactPlanValidation = null;
let validatedMission004FoundationValidation = null;
let validatedMission004PlanValidation = null;
let validatedMission004NetworkExtensionValidation = null;
let validatedMission004RegistryExtensionValidation = null;
let validatedMission004IntegrationValidation = null;
let validatedMission004CorrectionContractValidation = null;
let validatedMission004ReturnManeuverContractValidation = null;
let validatedMission004TrafficClosureRegressionValidation = null;
let validatedMission004TrafficSweptPathValidation = null;
let validatedMission004ReturnRouteValidation = null;
let mission004NetworkTraceLastSampleElapsed = -Infinity;
let mission004NetworkTraceWasActive = false;
let mission004AmbulanceReturnTraceLastSampleElapsed = -Infinity;
let mission004AmbulanceReturnTraceWasActive = false;
let mission004AmbulanceReturnTraceLastCommandSequence = 0;
window.MissionBosMission004AmbulanceReturnTrace = [];
window.MissionBosMission004AmbulanceReturnTraceValidation = null;
window.MissionBosMission004NetworkTimingTrace = [];
window.MissionBosMission004NetworkTimingValidation = null;
window.validateMission004NetworkTimingTrace = function () {
  if (!window.MissionBosMission004NetworkTimingValidator || !window.MISSION_BOS_MISSION_004_PLAN) return null;
  const result = window.MissionBosMission004NetworkTimingValidator.validate({
    missionPlan: window.MISSION_BOS_MISSION_004_PLAN,
    trace: window.MissionBosMission004NetworkTimingTrace || [],
    fixedTowerAssignmentDetected: false
  });
  window.MissionBosMission004NetworkTimingValidator.logResult(result);
  window.MissionBosMission004NetworkTimingValidation = result;
  return result;
};
let validatedBuild013M1CombinedValidation = null;
let validatedBOSActivationImpact = null;
let validatedMission004Foundation = null;
let validatedMission001NetworkPolishValidation = null;
let validatedNetworkRecovery = null;
let validatedUnifiedBosConnectivityValidation = null;
let validatedMission003ConnectivityParityPlanValidation = null;
let validatedMission003ConnectivityParityRuntimeValidation = null;
let validatedMission003ConnectivityRecoveryPlanValidation = null;
let validatedMission003ConnectivityRecoveryRuntimeValidation = null;
let validatedStadtwerkeBeaconPolishValidation = null;
let validatedMission001ConnectivityParityValidation = null;
let validatedStadtwerkeFoundationValidation = null;
let validatedStadtwerkeVehicle = null;
let networkRecoveryPolishEnabled = false;
let unifiedBosConnectivityEnabled = false;
let stadtwerkeBeaconPolishEnabled = false;
let validatedAutomaticBOSPriority = null;
let validatedUnifiedBosConnectivity = null;
let validatedTowerLoadIndicators = null;
let validatedBosBackhaul = null;
let validatedCivilianConnectivity = null;
let validatedCivilianConnectivityVisuals = null;
let validatedCellCapacity = null;
let validatedIncidentAccess = null;
let validatedMission001PlanValidation = null;
let validatedMission001CoreVisuals = null;
let validatedMission001Scene = null;
let validatedMission001Visuals = null;
let validatedMission001 = null;
let validatedMission002PlanValidation = null;
let validatedMission002Scene = null;
let validatedMission002NetworkAdapter = null;
let validatedMission002 = null;
let validatedMission003ResponseValidation = null;
let validatedMission003PlanValidation = null;
let validatedMission003NetworkExtensionValidation = null;
let validatedMission003RegistryExtensionValidation = null;
let validatedMission003Scene = null;
let validatedMission003Response = null;
let validatedMission003Connectivity = null;
let validatedMission003NetworkAdapter = null;
let validatedMission003 = null;
let validatedMission003IntegrationValidation = null;
let validatedMission004Response = null;
let validatedMission004Connectivity = null;
let validatedMission004NetworkAdapter = null;
let validatedMission004 = null;
let validatedMissionRegistry = null;
let validatedDualMissionRecoveryValidation = null;
let validatedPresentationPolish = null;
let mission002InitializationUnavailable = false;
let mission002InitializationFailureReason = "";
let validatedTelekomCommunication = null;
let validatedHandoverVisualization = null;
let previousMissionStateForHandoverVisualization = "READY";
let previousMissionStateForCellCapacity = "READY";
let previousBosStateForCellCapacity = false;
let validatedPresenter = null;
let validatedExplorationInterface = null;
let validatedNetworkInspection = null;
let previousMissionStateForNetworkInspection = "READY";
let validatedReleaseAudit = null;

/* -------------------------------------------------------------------------- */
/* City State Engine                                                          */
/* -------------------------------------------------------------------------- */

const cityStateEngine = {
  current: CITY_STATES.NORMAL,
  previous: CITY_STATES.NORMAL,

  set(nextState) {
    if (!Object.values(CITY_STATES).includes(nextState)) return;

    if (this.current !== nextState) {
      this.previous = this.current;
      this.current = nextState;
    }
  },

  get() {
    return this.current;
  },

  is(state) {
    return this.current === state;
  }
};

/* -------------------------------------------------------------------------- */
/* Architektur-Vorbereitung                                                   */
/* -------------------------------------------------------------------------- */

class CityDistrictManager {
  constructor() {
    this.districts = {
      residential: {
        label: "Wohngebiet",
        center: new THREE.Vector3(-38, 0, 32),
        color: 0x78a965
      },
      downtown: {
        label: "Innenstadt",
        center: new THREE.Vector3(0, 0, 0),
        color: 0x7d9278
      },
      bosCampus: {
        label: "BOS-Campus",
        center: new THREE.Vector3(39, 0, -35),
        color: 0x6f8d7d
      }
    };
  }

  createDistrictGrounds() {
    createDistrictPatch(-38, 32, 34, 30, this.districts.residential.color);
    createDistrictPatch(0, 0, 40, 40, this.districts.downtown.color);
    createDistrictPatch(39, -35, 36, 32, this.districts.bosCampus.color);
  }

  createLandmarks() {
    createTownHall(-13, -35);
    createSupermarket(12, -38);
    createBusStop(8, -7, Math.PI / 2);
    createSmallParkFeature(-38, 35);
    createOrientationSigns();
  }
}

class RoadNetwork {
  constructor() {
    this.waypoints = {
      fire_station_bay: [38, -42],
      fire_station_exit: [38, -36],
      bos_campus_gate: [32, -36],
      campus_junction: [24, -36],
      south_east_junction: [24, -24],
      east_center_junction: [24, 0],
      city_center: [0, 0],
      north_center_junction: [0, 24],
      incident_hold: [incidentSite.holdX, incidentSite.holdZ]
    };

    this.routes = {
      fire_station_to_incident: [
        "fire_station_bay",
        "fire_station_exit",
        "bos_campus_gate",
        "campus_junction",
        "south_east_junction",
        "east_center_junction",
        "city_center",
        "north_center_junction",
        "incident_hold"
      ],
      incident_to_fire_station: [
        "incident_hold",
        "north_center_junction",
        "city_center",
        "east_center_junction",
        "south_east_junction",
        "campus_junction",
        "bos_campus_gate",
        "fire_station_exit",
        "fire_station_bay"
      ]
    };
  }

  getPoint(id) {
    return this.waypoints[id] || [0, 0];
  }

  getRoute(routeId) {
    const waypointIds = this.routes[routeId] || [];
    return waypointIds.map((id) => this.getPoint(id));
  }

  createRoute(routeId) {
    return prepareRoute(this.getRoute(routeId));
  }

  drawDebugRoute(routeId, group, color = 0x00a6ff) {
    const routePoints = this.getRoute(routeId);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.12,
      depthWrite: false
    });

    routePoints.forEach(([x, z]) => {
      const marker = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 24), material.clone());
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(x, 0.13, z);
      group.add(marker);
    });
  }
}

class WaypointManager {
  constructor(roadNetwork) {
    this.roadNetwork = roadNetwork;
  }

  getEmergencyRoute() {
    return this.roadNetwork.createRoute("fire_station_to_incident");
  }

  getReturnRoute() {
    return this.roadNetwork.createRoute("incident_to_fire_station");
  }

  getIncidentHoldPoint() {
    const [x, z] = this.roadNetwork.getPoint("incident_hold");
    return new THREE.Vector3(x, 0, z);
  }
}

class StationManager {
  constructor() {
    this.fireStation = {
      id: "fire_station_1",
      label: "Feuerwehrwache Innenstadt",
      position: new THREE.Vector3(38, 0, -44),
      bays: 3,
      status: "Bereit"
    };

    this.dispatchCenter = {
      id: "dispatch_center_1",
      label: "Leitstelle BOS",
      position: new THREE.Vector3(44, 0, -16),
      commsPosition: new THREE.Vector3(44, 8.4, -16),
      status: "Online"
    };

    this.mobileTower = {
      id: "mobile_tower_1",
      label: "Mobilfunkmast BOS-Campus",
      position: new THREE.Vector3(30, 0, -28),
      commsPosition: new THREE.Vector3(30, 10.8, -28)
    };

    this.policeStation = {
      id: "police_station_1",
      label: "Polizeiwache Innenstadt",
      position: new THREE.Vector3(44, 0, 10),
      commsPosition: new THREE.Vector3(44, 2.4, 3.6),
      status: "Bereit"
    };

    this.dispatchGroup = null;
    this.fireStationGroup = null;
    this.policeStationGroup = null;
    this.policeVehicle = null;
    this.recoveryBound = false;
  }

  init(recoveryCityInstance = null) {
    if (recoveryCityInstance) {
      const layout = window.MISSION_BOS_RECOVERY_LAYOUT;
      const findBuildingById = (id) => layout.buildings.find((building) => building.id === id);
      const findTowerById = (id) => layout.mobileTowers.find((tower) => tower.id === id);

      const dispatchData = findBuildingById("B01");
      const policeData = findBuildingById("B02");
      const fireData = findBuildingById("B04");
      const towerData = findTowerById("MAST_D");

      if (!dispatchData || !policeData || !fireData || !towerData) {
        throw new Error("Recovery infrastructure IDs B01, B02, B04 or MAST_D are missing.");
      }

      this.dispatchCenter.position.set(dispatchData.worldRect.x, 0, dispatchData.worldRect.z);
      this.dispatchCenter.commsPosition.set(
        dispatchData.worldRect.x,
        dispatchData.height + 1.1,
        dispatchData.worldRect.z
      );
      this.dispatchCenter.label = dispatchData.name;

      this.policeStation.position.set(policeData.worldRect.x, 0, policeData.worldRect.z);
      this.policeStation.commsPosition.set(
        policeData.worldRect.x,
        policeData.height + 1.0,
        policeData.worldRect.z
      );
      this.policeStation.label = policeData.name;

      this.fireStation.position.set(fireData.worldRect.x, 0, fireData.worldRect.z);
      this.fireStation.commsPosition = new THREE.Vector3(
        fireData.worldRect.x,
        fireData.height + 1.0,
        fireData.worldRect.z
      );
      this.fireStation.label = fireData.name;

      this.mobileTower.position.set(towerData.worldRect.x, 0, towerData.worldRect.z);
      this.mobileTower.commsPosition.set(
        towerData.worldRect.x,
        towerData.height + 0.35,
        towerData.worldRect.z
      );
      this.mobileTower.label = towerData.id;

      this.dispatchGroup = recoveryCityInstance.buildingsById.B01;
      this.policeStationGroup = recoveryCityInstance.buildingsById.B02;
      this.fireStationGroup = recoveryCityInstance.buildingsById.B04;
      this.policeVehicle = null;
      this.recoveryBound = true;
      return;
    }

    this.fireStationGroup = createFireStation(this.fireStation.position);
    this.dispatchGroup = createDispatchCenter(this.dispatchCenter.position);
    this.policeStationGroup = createPoliceStation(this.policeStation.position);
    this.policeVehicle = this.policeStationGroup.userData.policeVehicle || null;
    this.recoveryBound = false;
  }

  getDispatchCommsPosition() {
    return this.dispatchCenter.commsPosition.clone();
  }

  getMobileTowerCommsPosition() {
    return this.mobileTower.commsPosition.clone();
  }

  getPolicePreparedCommsPosition() {
    return this.policeStation.commsPosition.clone();
  }

  getFireStationCommsPosition() {
    if (this.fireStation.commsPosition) {
      return this.fireStation.commsPosition.clone();
    }

    return new THREE.Vector3(
      this.fireStation.position.x,
      1.7,
      this.fireStation.position.z
    );
  }

  getFireStationStatus() {
    return this.fireStation.status;
  }

  getDispatchStatus() {
    return this.dispatchCenter.status;
  }

  getStaticVehicleCount() {
    if (this.recoveryBound) return 0;
    return this.policeVehicle ? 1 : 0;
  }
}

class BOSNetworkRegistry {
  constructor() {
    this.units = {};
    this.links = [];
  }

  registerUnit(id, label, positionGetter, active = true) {
    this.units[id] = {
      id,
      label,
      positionGetter,
      active
    };
  }

  registerLink(id, from, to, active = true) {
    this.links.push({
      id,
      from,
      to,
      active
    });
  }

  getPosition(id) {
    const unit = this.units[id];

    if (!unit || typeof unit.positionGetter !== "function") {
      return new THREE.Vector3();
    }

    return unit.positionGetter();
  }

  getActiveLinks() {
    return this.links.filter((link) => link.active);
  }

  getPreparedLinks() {
    return this.links.filter((link) => !link.active);
  }

  getPathLabel() {
    return "Leitstelle → Mobilfunk → Feuerwehr · Polizei vorbereitet";
  }
}

class DispatchManagerClass {
  constructor(stationManager) {
    this.stationManager = stationManager;
  }

  getPosition() {
    return this.stationManager.getDispatchCommsPosition();
  }

  update(elapsed) {
    const group = this.stationManager.dispatchGroup;
    if (!group) return;

    group.traverse((child) => {
      if (child.userData.isDispatchBeacon && child.material) {
        child.material.opacity = 0.58 + Math.sin(elapsed * 2.5) * 0.25;
      }
    });
  }
}

class EmergencyVehicle {
  constructor(mesh, options) {
    this.mesh = mesh;
    this.outboundRoute = options.outboundRoute;
    this.returnRoute = options.returnRoute;
    this.speed = options.speed || 8;
    this.returnSpeed = options.returnSpeed || 9;
    this.state = VEHICLE_STATES.STATION;
    this.routeProgress = 0;
    this.alarmTimer = 0;
    this.activeRoute = this.outboundRoute;

    this.placeAtRouteStart();
  }

  placeAtRouteStart() {
    const sample = sampleRouteClamped(this.outboundRoute, 0);
    this.mesh.position.set(sample.x, 0.42, sample.z);
    this.mesh.rotation.y = sample.angle;
  }

  dispatch() {
    if (this.state !== VEHICLE_STATES.STATION) return;

    this.state = VEHICLE_STATES.ALARMED;
    this.alarmTimer = 0;
    this.activeRoute = this.outboundRoute;
    this.routeProgress = 0;
  }

  returnToStation() {
    if (this.state === VEHICLE_STATES.STATION || this.state === VEHICLE_STATES.RETURNING) return;

    this.state = VEHICLE_STATES.RETURNING;
    this.activeRoute = this.returnRoute;
    this.routeProgress = 0;
  }

  forceStation() {
    this.state = VEHICLE_STATES.STATION;
    this.activeRoute = this.outboundRoute;
    this.routeProgress = 0;
    this.alarmTimer = 0;
    this.placeAtRouteStart();
  }

  update(delta) {
    if (this.state === VEHICLE_STATES.ALARMED) {
      this.alarmTimer += delta;

      if (this.alarmTimer >= 1.1) {
        this.state = VEHICLE_STATES.ENROUTE;
      }
    }

    if (this.state === VEHICLE_STATES.ENROUTE) {
      const remaining = this.outboundRoute.length - this.routeProgress;
      const speedFactor = remaining < 8 ? THREE.MathUtils.clamp(remaining / 8, 0.35, 1) : 1;

      this.routeProgress += this.speed * speedFactor * delta;

      if (this.routeProgress >= this.outboundRoute.length) {
        this.routeProgress = this.outboundRoute.length;
        this.state = VEHICLE_STATES.ARRIVED;
      }
    }

    if (this.state === VEHICLE_STATES.RETURNING) {
      const remaining = this.returnRoute.length - this.routeProgress;
      const speedFactor = remaining < 8 ? THREE.MathUtils.clamp(remaining / 8, 0.35, 1) : 1;

      this.routeProgress += this.returnSpeed * speedFactor * delta;

      if (this.routeProgress >= this.returnRoute.length) {
        this.routeProgress = this.returnRoute.length;
        this.state = VEHICLE_STATES.STATION;
        this.activeRoute = this.outboundRoute;
        this.routeProgress = 0;
      }
    }

    const sample = this.state === VEHICLE_STATES.STATION
      ? sampleRouteClamped(this.outboundRoute, 0)
      : sampleRouteClamped(this.activeRoute, this.routeProgress);

    this.mesh.position.set(sample.x, 0.42, sample.z);
    this.mesh.rotation.y = sample.angle;
  }

  getStatus() {
    if (this.state === VEHICLE_STATES.ALARMED) return "Alarmiert";
    if (this.state === VEHICLE_STATES.ENROUTE) return "Auf Anfahrt";
    if (this.state === VEHICLE_STATES.ARRIVED) return "Einsatzstelle erreicht";
    if (this.state === VEHICLE_STATES.RETURNING) return "Rückfahrt zur Wache";
    return "In Wache";
  }

  isReturning() {
    return this.state === VEHICLE_STATES.RETURNING;
  }

  hasArrived() {
    return this.state === VEHICLE_STATES.ARRIVED;
  }

  getCommsPosition() {
    return new THREE.Vector3(
      this.mesh.position.x,
      this.mesh.position.y + 1.7,
      this.mesh.position.z
    );
  }
}

class TrafficManager {
  init() {
    createTrafficVehicles();
  }

  update(elapsed) {
    updateTraffic(elapsed);
  }

  getVehicleCount() {
    return trafficVehicles.length;
  }
}

class PedestrianManager {
  init() {
    createPedestrians();
  }

  update(delta, elapsed) {
    updatePedestrians(delta, elapsed);
  }

  getCount() {
    return pedestrians.length;
  }
}

/* -------------------------------------------------------------------------- */
/* Szenario- und Missionsmanager                                              */
/* -------------------------------------------------------------------------- */

const scenarioManager = {
  activeScenarioId: "normal",

  scenarios: {
    normal: {
      id: "normal",
      title: "Normalbetrieb",
      prepared: true,
      description: "Regulärer Stadtbetrieb ohne aktiven Einsatz."
    },
    fire: {
      id: "fire",
      title: "Wohnungsbrand Innenstadt",
      prepared: true,
      missionNumber: "Mission 001",
      description: "Ein Wohnhaus in der Innenstadt gerät in Brand. Die Netzlast steigt durch Zuschauer mit Smartphones."
    },
    accident: {
      id: "accident",
      title: "Verkehrsunfall",
      prepared: true,
      description: "Platzhalter für ein späteres Unfallszenario."
    },
    concert: {
      id: "concert",
      title: "Großveranstaltung",
      prepared: true,
      description: "Platzhalter für ein späteres Konzert-/Event-Szenario."
    }
  },

  setScenario(id) {
    if (!this.scenarios[id]) return;
    this.activeScenarioId = id;
  },

  getActiveScenario() {
    return this.scenarios[this.activeScenarioId];
  }
};

/* -------------------------------------------------------------------------- */
/* Network Manager                                                            */
/* -------------------------------------------------------------------------- */

const networkManager = {
  baseLoad: 38,

  manualLoadMilestones: [38, 55, 72, 91, 98],
  manualMilestoneIndex: 0,
  manualMilestoneTimer: 0,
  manualLoadActive: false,

  missionLoadMilestones: [40, 58, 71, 84, 96, 100],
  missionMilestoneIndex: 0,
  missionMilestoneTimer: 0,
  missionLoadActive: false,

  validatedMissionActive: false,
  validatedMissionTarget: 38,
  validatedMissionResetting: false,
  validatedMissionBaseHold: false,
  validatedMissionRiseRate: 7,
  validatedMissionResetRate: 12,

  bosPriorityActive: false,

  toggleManualLoad() {
    if (
      MissionManager.isActive() ||
      this.validatedMissionActive ||
      this.validatedMissionResetting
    ) return false;

    this.validatedMissionBaseHold = false;
    this.manualLoadActive = !this.manualLoadActive;

    if (this.manualLoadActive) {
      this.manualMilestoneIndex = 0;
      this.manualMilestoneTimer = 0;
    }
    return true;
  },

  startMissionLoad() {
    this.manualLoadActive = false;
    this.missionLoadActive = true;
    this.missionMilestoneIndex = 0;
    this.missionMilestoneTimer = 0;
  },

  setBOSPriority(active) {
    this.bosPriorityActive = active;
  },

  toggleBOSPriority() {
    // Build 011N.1: retained for compatibility, but manual BOS activation is disabled.
    return false;
  },

  reset() {
    this.manualLoadActive = false;
    this.manualMilestoneIndex = 0;
    this.manualMilestoneTimer = 0;

    this.missionLoadActive = false;
    this.missionMilestoneIndex = 0;
    this.missionMilestoneTimer = 0;

    this.validatedMissionActive = false;
    this.validatedMissionTarget = this.baseLoad;
    this.validatedMissionResetting = false;
    this.validatedMissionBaseHold = false;

    this.bosPriorityActive = false;

    networkLoad = this.baseLoad;
    cityStateEngine.set(CITY_STATES.NORMAL);
  },

  update(delta, elapsed) {
    let targetLoad = this.baseLoad;

    if (this.validatedMissionActive) {
      targetLoad = THREE.MathUtils.clamp(this.validatedMissionTarget, 0, 100);
      const rate = targetLoad >= networkLoad
        ? this.validatedMissionRiseRate
        : this.validatedMissionResetRate;
      networkLoad = moveTowards(networkLoad, targetLoad, Math.max(0, rate * delta));
    } else if (this.validatedMissionResetting) {
      targetLoad = this.baseLoad;
      networkLoad = moveTowards(
        networkLoad,
        targetLoad,
        Math.max(0, this.validatedMissionResetRate * delta)
      );
      if (Math.abs(networkLoad - targetLoad) <= 0.0001) {
        networkLoad = targetLoad;
        this.validatedMissionResetting = false;
        this.validatedMissionBaseHold = true;
      }
    } else if (this.validatedMissionBaseHold) {
      networkLoad = this.baseLoad;
    } else if (this.missionLoadActive) {
      targetLoad = this.missionLoadMilestones[this.missionMilestoneIndex];
      this.missionMilestoneTimer += delta;

      const closeToMilestone = Math.abs(networkLoad - targetLoad) < 1.1;
      const hasNext = this.missionMilestoneIndex < this.missionLoadMilestones.length - 1;

      if (closeToMilestone && hasNext && this.missionMilestoneTimer > 0.85) {
        this.missionMilestoneIndex += 1;
        this.missionMilestoneTimer = 0;
        targetLoad = this.missionLoadMilestones[this.missionMilestoneIndex];
      }

      const wave = Math.sin(elapsed * 1.6) * 0.8;
      const targetWithWave = THREE.MathUtils.clamp(targetLoad + wave, 0, 100);
      networkLoad = THREE.MathUtils.lerp(networkLoad, targetWithWave, delta * 0.56);
    } else if (this.manualLoadActive) {
      targetLoad = this.manualLoadMilestones[this.manualMilestoneIndex];
      this.manualMilestoneTimer += delta;

      const closeToMilestone = Math.abs(networkLoad - targetLoad) < 1.15;
      const hasNext = this.manualMilestoneIndex < this.manualLoadMilestones.length - 1;

      if (closeToMilestone && hasNext && this.manualMilestoneTimer > 0.6) {
        this.manualMilestoneIndex += 1;
        this.manualMilestoneTimer = 0;
        targetLoad = this.manualLoadMilestones[this.manualMilestoneIndex];
      }

      const wave = Math.sin(elapsed * 1.6) * 1.5;
      const targetWithWave = THREE.MathUtils.clamp(targetLoad + wave, 0, 100);
      networkLoad = THREE.MathUtils.lerp(networkLoad, targetWithWave, delta * 0.72);
    } else {
      const wave = Math.sin(elapsed * 1.6) * 3.0;
      const targetWithWave = THREE.MathUtils.clamp(this.baseLoad + wave, 0, 100);
      networkLoad = THREE.MathUtils.lerp(networkLoad, targetWithWave, delta * 1.1);
    }

    networkLoad = THREE.MathUtils.clamp(networkLoad, 0, 100);

    let nextState = CITY_STATES.NORMAL;

    if (networkLoad >= 75) {
      nextState = CITY_STATES.OVERLOADED;
    } else if (networkLoad >= 55) {
      nextState = CITY_STATES.HIGH_LOAD;
    }

    if (this.bosPriorityActive) {
      nextState = CITY_STATES.BOS_ACTIVE;
    }

    cityStateEngine.set(nextState);
  }
};

function moveTowards(current, target, maximumDelta) {
  if (Math.abs(target - current) <= maximumDelta) return target;
  return current + Math.sign(target - current) * maximumDelta;
}

function createValidatedMissionNetworkAdapter(missionPlan) {
  const networkPlan = missionPlan && missionPlan.network ? missionPlan.network : {};
  return {
    beginMission(initialTarget) {
      if (networkManager.validatedMissionActive || networkManager.validatedMissionResetting) return false;
      networkManager.manualLoadActive = false;
      networkManager.missionLoadActive = false;
      networkManager.validatedMissionRiseRate = Number(networkPlan.riseRatePerSecond) || 7;
      networkManager.validatedMissionResetRate = Number(networkPlan.resetRatePerSecond) || 12;
      networkManager.validatedMissionTarget = THREE.MathUtils.clamp(Number(initialTarget), 0, 100);
      networkManager.validatedMissionResetting = false;
      networkManager.validatedMissionBaseHold = false;
      networkManager.validatedMissionActive = true;
      networkManager.bosPriorityActive = false;
      return true;
    },
    setTargetLoad(percent) {
      const value = Number(percent);
      if (!Number.isFinite(value)) return false;
      if (!networkManager.validatedMissionActive && !networkManager.validatedMissionResetting) return false;
      networkManager.validatedMissionTarget = THREE.MathUtils.clamp(value, 0, 100);
      return true;
    },
    activateBOS() {
      // Compatibility-only. Automatic cell-local controller owns activation.
      return false;
    },
    endMission() {
      networkManager.validatedMissionActive = false;
      networkManager.validatedMissionTarget = Number(networkPlan.baseLoad) || networkManager.baseLoad;
      networkManager.validatedMissionResetting = true;
      networkManager.bosPriorityActive = false;
      return true;
    },
    getLoad() { return networkLoad; },
    isBOSActive() { return networkManager.bosPriorityActive; },
    isReadyForMissionStart() {
      const baseLoad = Number(networkPlan.baseLoad) || networkManager.baseLoad;
      return networkManager.validatedMissionActive !== true &&
        networkManager.validatedMissionResetting !== true &&
        networkManager.manualLoadActive !== true &&
        networkManager.missionLoadActive !== true &&
        networkManager.bosPriorityActive !== true &&
        Math.abs(networkLoad - baseLoad) <= 4;
    },
    finalizeMissionSettlement() {
      const baseLoad = Number(networkPlan.baseLoad) || networkManager.baseLoad;
      if (networkManager.validatedMissionActive === true) return false;
      if (networkManager.manualLoadActive === true || networkManager.missionLoadActive === true) return false;
      if (networkManager.validatedMissionResetting !== true && networkManager.validatedMissionBaseHold !== true) return false;
      networkManager.validatedMissionTarget = baseLoad;
      networkManager.validatedMissionResetting = false;
      networkManager.validatedMissionBaseHold = true;
      networkManager.bosPriorityActive = false;
      networkLoad = baseLoad;
      cityStateEngine.set(CITY_STATES.NORMAL);
      return true;
    },
    isCapacityPrioritySettled() {
      if (!validatedAutomaticBOSPriority || !validatedCellCapacity) return false;
      const activeCells = validatedAutomaticBOSPriority.getAllCellStates().filter((cell) => cell.active);
      if (!activeCells.length) return false;
      return activeCells.every((cell) => {
        const capacityCell = validatedCellCapacity.getCell(cell.towerId);
        return !!capacityCell && capacityCell.prioritySettled === true;
      });
    },
    getSafetyStatus() {
      const valuesFinite = [networkLoad, networkManager.validatedMissionTarget,
        networkManager.validatedMissionRiseRate, networkManager.validatedMissionResetRate]
        .every((value) => Number.isFinite(Number(value)));
      return {
        status: valuesFinite ? "PASSED" : "FAILED",
        active: networkManager.validatedMissionActive,
        resetting: networkManager.validatedMissionResetting,
        baseHold: networkManager.validatedMissionBaseHold,
        targetLoad: networkManager.validatedMissionTarget,
        load: networkLoad,
        bosActive: networkManager.bosPriorityActive
      };
    }
  };
}

const validatedMissionNetworkAdapter = createValidatedMissionNetworkAdapter(
  window.MISSION_BOS_MISSION_001_PLAN
);

/* -------------------------------------------------------------------------- */
/* Mission Manager                                                            */
/* -------------------------------------------------------------------------- */

const MissionManager = {
  active: false,
  activeMissionId: null,
  phase: MISSION_PHASES.READY,
  elapsed: 0,
  bosElapsed: 0,
  pedestriansAssigned: false,

  start(id = "fire") {
    if (this.active || VehicleManager.isReturning()) return;

    this.active = true;
    this.activeMissionId = id;
    this.phase = MISSION_PHASES.ALERTING;
    this.elapsed = 0;
    this.bosElapsed = 0;
    this.pedestriansAssigned = false;

    scenarioManager.setScenario(id);
    networkManager.setBOSPriority(false);
    networkManager.startMissionLoad();
    VehicleManager.dispatchFireTruck();

    uiManager.updateAll(true);
  },

  reset() {
    if (!this.isCompleted()) return;

    this.active = false;
    this.activeMissionId = null;
    this.phase = MISSION_PHASES.READY;
    this.elapsed = 0;
    this.bosElapsed = 0;
    this.pedestriansAssigned = false;

    scenarioManager.setScenario("normal");
    networkManager.reset();
    resetPedestrianMissionBehaviors();

    if (missionVisuals) {
      missionVisuals.visible = false;
    }

    VehicleManager.returnFireTruckToStation();
    uiManager.updateAll(true);
  },

  noteBOSActivated() {
    if (!this.active) return;
    this.bosElapsed = 0;
    this.phase = MISSION_PHASES.BOS_ACTIVE;
  },

  update(delta) {
    if (!this.active) return;

    this.elapsed += delta;

    if (!this.pedestriansAssigned && this.elapsed >= 6.5) {
      assignPedestrianMissionBehaviors();
      this.pedestriansAssigned = true;
    }

    if (networkManager.bosPriorityActive) {
      this.bosElapsed += delta;

      if (this.bosElapsed >= 7.5) {
        this.phase = MISSION_PHASES.COMPLETED;
      } else if (this.bosElapsed >= 3.0) {
        this.phase = MISSION_PHASES.COMMS_STABLE;
      } else {
        this.phase = MISSION_PHASES.BOS_ACTIVE;
      }

      return;
    }

    this.bosElapsed = 0;

    if (networkLoad >= 84) {
      this.phase = MISSION_PHASES.NETWORK_OVERLOAD;
    } else if (VehicleManager.hasArrived()) {
      this.phase = MISSION_PHASES.SCENE;
    } else if (VehicleManager.isEnroute()) {
      this.phase = MISSION_PHASES.ENROUTE;
    } else {
      this.phase = MISSION_PHASES.ALERTING;
    }
  },

  isActive() {
    return this.active;
  },

  isCompleted() {
    return this.phase === MISSION_PHASES.COMPLETED;
  },

  isSmokeVisible() {
    return this.active && this.elapsed >= 2.2;
  },

  isFireVisible() {
    return this.active && this.elapsed >= 5.2;
  },

  getPhaseLabel() {
    const labels = {
      [MISSION_PHASES.READY]: "Bereitschaft",
      [MISSION_PHASES.ALERTING]: "Alarmierung",
      [MISSION_PHASES.ENROUTE]: "Anfahrt",
      [MISSION_PHASES.SCENE]: "Lage",
      [MISSION_PHASES.NETWORK_OVERLOAD]: "Netzüberlast",
      [MISSION_PHASES.BOS_ACTIVE]: "BOS aktiviert",
      [MISSION_PHASES.COMMS_STABLE]: "Kommunikation stabil",
      [MISSION_PHASES.COMPLETED]: "Einsatz abgeschlossen"
    };

    return labels[this.phase] || "Bereitschaft";
  },

  getStageLabel() {
    if (this.phase === MISSION_PHASES.ALERTING) return "Alarmierung";
    if (this.phase === MISSION_PHASES.ENROUTE) return "Anfahrt";
    if (this.phase === MISSION_PHASES.SCENE) return "Lage";
    if (
      this.phase === MISSION_PHASES.NETWORK_OVERLOAD ||
      this.phase === MISSION_PHASES.BOS_ACTIVE ||
      this.phase === MISSION_PHASES.COMMS_STABLE
    ) {
      return "Kommunikation";
    }
    if (this.phase === MISSION_PHASES.COMPLETED) return "Abschluss";
    return "Bereitschaft";
  },

  getProgress() {
    const progress = {
      [MISSION_PHASES.READY]: 0,
      [MISSION_PHASES.ALERTING]: 16,
      [MISSION_PHASES.ENROUTE]: 32,
      [MISSION_PHASES.SCENE]: 48,
      [MISSION_PHASES.NETWORK_OVERLOAD]: 64,
      [MISSION_PHASES.BOS_ACTIVE]: 78,
      [MISSION_PHASES.COMMS_STABLE]: 90,
      [MISSION_PHASES.COMPLETED]: 100
    };

    return progress[this.phase] || 0;
  },

  getTitle() {
    if (!this.active) return "Kein aktiver Einsatz";
    return "Wohnungsbrand Innenstadt";
  },

  getStatusLabel() {
    if (!this.active) {
      return VehicleManager.isReturning() ? "Rückstellung" : "Bereit";
    }

    if (this.phase === MISSION_PHASES.COMPLETED) return "Abgeschlossen";
    if (this.phase === MISSION_PHASES.COMMS_STABLE) return "Kommunikation stabil";
    if (this.phase === MISSION_PHASES.BOS_ACTIVE) return "Priorisierung aktiv";
    if (this.phase === MISSION_PHASES.NETWORK_OVERLOAD) return "Kommunikation instabil";
    if (this.phase === MISSION_PHASES.SCENE) return "Lage vor Ort";
    if (this.phase === MISSION_PHASES.ENROUTE) return "Kräfte auf Anfahrt";
    return "Alarmierung läuft";
  },

  getDescription() {
    if (VehicleManager.isReturning()) {
      return "Rücksetzung läuft: Das Feuerwehrfahrzeug fährt über das Straßennetz zurück in die Wache.";
    }

    if (!this.active) {
      return "BOS-Infrastruktur bereit. Polizei ist als nächste BOS-Einheit sichtbar vorbereitet.";
    }

    if (this.phase === MISSION_PHASES.COMPLETED) {
      return "Kommunikationsziel erreicht. Die BOS-Verbindung ist stabil; der Brand bleibt unverändert sichtbar.";
    }

    if (this.phase === MISSION_PHASES.COMMS_STABLE) {
      return "Priorisierte Datenpakete erreichen Feuerwehr und Leitstelle zuverlässig.";
    }

    if (this.phase === MISSION_PHASES.BOS_ACTIVE) {
      return "BOS-Kommunikation wird priorisiert. Die Verbindung wird sichtbar stabiler.";
    }

    if (this.phase === MISSION_PHASES.NETWORK_OVERLOAD) {
      return "Normale Datenübertragung bricht sichtbar ein. Priorisierung ist noch nicht aktiv.";
    }

    if (this.phase === MISSION_PHASES.SCENE) {
      return "Feuerwehrfahrzeug hat den Haltepunkt erreicht. Lagekommunikation läuft über Mobilfunk.";
    }

    if (this.phase === MISSION_PHASES.ENROUTE) {
      return "Das Feuerwehrfahrzeug folgt den Straßen-Wegpunkten vom BOS-Campus zur Einsatzstelle.";
    }

    return "Alarmierung ausgelöst. Fahrzeug bereitet Ausfahrt aus der Wache vor.";
  }
};

/* -------------------------------------------------------------------------- */
/* Vehicle Manager                                                            */
/* -------------------------------------------------------------------------- */

const VehicleManager = {
  fireTruck: null,
  fireTruckVehicle: null,

  init() {
    const mesh = createFireTruck();

    this.fireTruckVehicle = new EmergencyVehicle(mesh, {
      outboundRoute: waypointManager.getEmergencyRoute(),
      returnRoute: waypointManager.getReturnRoute(),
      speed: 8.2,
      returnSpeed: 9.2
    });

    this.fireTruck = this.fireTruckVehicle.mesh;
    responseVehicleGroup.add(this.fireTruck);
  },

  dispatchFireTruck() {
    if (this.fireTruckVehicle) {
      this.fireTruckVehicle.dispatch();
    }
  },

  returnFireTruckToStation() {
    if (this.fireTruckVehicle) {
      this.fireTruckVehicle.returnToStation();
    }
  },

  update(delta) {
    if (this.fireTruckVehicle) {
      this.fireTruckVehicle.update(delta);
    }
  },

  getFireTruckStatus() {
    return this.fireTruckVehicle ? this.fireTruckVehicle.getStatus() : "In Wache";
  },

  getVehicleCount() {
    return this.fireTruck ? 1 : 0;
  },

  getFireTruckCommsPosition() {
    if (!this.fireTruckVehicle) {
      return stationManager.getFireStationCommsPosition();
    }

    return this.fireTruckVehicle.getCommsPosition();
  },

  isReturning() {
    return this.fireTruckVehicle ? this.fireTruckVehicle.isReturning() : false;
  },

  hasArrived() {
    return this.fireTruckVehicle ? this.fireTruckVehicle.hasArrived() : false;
  },

  isEnroute() {
    if (!this.fireTruckVehicle) return false;
    return (
      this.fireTruckVehicle.state === VEHICLE_STATES.ALARMED ||
      this.fireTruckVehicle.state === VEHICLE_STATES.ENROUTE
    );
  }
};

/* -------------------------------------------------------------------------- */
/* Communication Renderer                                                     */
/* -------------------------------------------------------------------------- */

function getActiveFireCommsPosition() {
  if (
    validatedResponseVehicles &&
    typeof validatedResponseVehicles.getFireTruckCommsPosition === "function"
  ) {
    return validatedResponseVehicles.getFireTruckCommsPosition();
  }
  return VehicleManager.getFireTruckCommsPosition();
}

function getValidatedTelekomCommunicationSnapshot() {
  if (
    !validatedTelekomCommunication ||
    typeof validatedTelekomCommunication.getDashboardSnapshot !== "function" ||
    typeof validatedTelekomCommunication.getSafetyStatus !== "function"
  ) {
    return null;
  }

  const safety = validatedTelekomCommunication.getSafetyStatus();
  if (!safety || safety.status !== "PASSED") return null;
  return validatedTelekomCommunication.getDashboardSnapshot();
}

function getTowerDashboardLabel(towerId) {
  if (!towerId) return "Nicht aktiv";
  const plan = window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN;
  const tower = plan && Array.isArray(plan.towers)
    ? plan.towers.find((entry) => entry && (entry.id === towerId || entry.referenceId === towerId))
    : null;
  const raw = tower && tower.label ? String(tower.label) : towerId;
  const area = raw.replace(/^Funkzelle\s+/i, "");
  return `${towerId} · ${area}`;
}

function getEndpointServingTowerLabel(endpointId) {
  if (!validatedNetworkAssociation || typeof validatedNetworkAssociation.getServingTowerId !== "function") {
    return "Nicht verfügbar";
  }
  return getTowerDashboardLabel(validatedNetworkAssociation.getServingTowerId(endpointId));
}

function getEndpointLastHandoverLabel(endpointId, fallback) {
  if (!validatedNetworkAssociation || typeof validatedNetworkAssociation.getHandoverHistory !== "function") {
    return fallback || "Noch kein Handover";
  }
  const history = validatedNetworkAssociation.getHandoverHistory()
    .filter((event) => event && event.endpointId === endpointId);
  if (!history.length) return fallback || "Noch kein Handover";
  const event = history[history.length - 1];
  return `${event.label || "Rettungsdienst"} · ${event.fromTowerId} → ${event.toTowerId}`;
}

function getValidatedCellLoadSnapshot() {
  if (!validatedCellLoad || typeof validatedCellLoad.getDashboardSnapshot !== "function" ||
      typeof validatedCellLoad.getSafetyStatus !== "function") return null;
  const safety = validatedCellLoad.getSafetyStatus();
  // Build 013M.11: recoverable association/cell-load warnings must not blank the
  // customer dashboard. Only a fatal cell-load condition invalidates the live snapshot.
  if (!safety || safety.fatal === true) return null;
  const snapshot = validatedCellLoad.getDashboardSnapshot();
  if (snapshot && Array.isArray(snapshot.rows)) lastValidCellLoadDashboardSnapshot = snapshot;
  return snapshot;
}

function getValidatedCellCapacitySnapshot() {
  if (!validatedCellCapacity ||
      typeof validatedCellCapacity.getDashboardSnapshot !== "function" ||
      typeof validatedCellCapacity.getSafetyStatus !== "function") return null;
  const safety = validatedCellCapacity.getSafetyStatus();
  if (!safety || safety.status !== "PASSED") return null;
  return validatedCellCapacity.getDashboardSnapshot();
}

function getValidatedHandoverVisualizationSnapshot() {
  if (!validatedHandoverVisualization ||
      typeof validatedHandoverVisualization.getDashboardSnapshot !== "function" ||
      typeof validatedHandoverVisualization.getSafetyStatus !== "function") return null;
  const safety = validatedHandoverVisualization.getSafetyStatus();
  if (!safety || safety.status !== "PASSED") return null;
  return validatedHandoverVisualization.getDashboardSnapshot();
}

function renderCellLoadDashboard(snapshot) {
  if (!cellLoadSection || !cellLoadRows || !criticalCellValue) return;
  const liveSnapshotValid = !!(snapshot && Array.isArray(snapshot.rows));
  if (liveSnapshotValid) lastValidCellLoadDashboardSnapshot = snapshot;
  const effectiveSnapshot = liveSnapshotValid ? snapshot : lastValidCellLoadDashboardSnapshot;

  // Build 013M.11: the customer-facing network card is a persistent dashboard
  // surface. A transient/recoverable telemetry warning must never remove it.
  cellLoadSection.hidden = false;
  cellLoadSection.dataset.snapshotState = liveSnapshotValid ? "live" : "stale";
  if (!effectiveSnapshot || !Array.isArray(effectiveSnapshot.rows)) {
    criticalCellValue.textContent = "Netzdaten werden geprüft";
    return;
  }

  cellLoadRows.innerHTML = "";
  effectiveSnapshot.rows.forEach((cell) => {
    const severity = String(cell.severity || cell.status || "FAILED").toLowerCase();
    const row = document.createElement("div");
    row.className = `cell-load-row severity-${severity}`;
    row.setAttribute("data-tower-id", cell.towerId);
    row.style.setProperty("--cell-severity-color", cell.severityColor || "#8394A5");

    const severityMark = document.createElement("span");
    severityMark.className = "cell-load-severity-mark";
    severityMark.setAttribute("aria-hidden", "true");

    const identity = document.createElement("div");
    identity.className = "cell-load-identity";
    const id = document.createElement("strong");
    id.textContent = cell.towerId;
    const label = document.createElement("span");
    label.textContent = cell.label;
    const track = document.createElement("div");
    track.className = "cell-load-track";
    track.setAttribute("aria-hidden", "true");
    const trackFill = document.createElement("div");
    trackFill.className = "cell-load-track-fill";
    trackFill.style.width = `${Math.max(0, Math.min(100, Number(cell.currentLoad) || 0))}%`;
    track.appendChild(trackFill);
    identity.appendChild(id);
    identity.appendChild(label);
    identity.appendChild(track);

    const metrics = document.createElement("div");
    metrics.className = "cell-load-metrics";
    const value = document.createElement("strong");
    value.className = "cell-load-percent-pill";
    value.textContent = `${Math.round(cell.currentLoad)} %`;
    const status = document.createElement("span");
    status.className = "cell-load-status";
    status.textContent = cell.severityLabel || cell.statusLabel;
    metrics.appendChild(value);
    metrics.appendChild(status);
    if (cell.bosPriorityActive) {
      const badge = document.createElement("span");
      badge.className = "cell-load-bos-badge";
      badge.textContent = "BOS aktiv";
      metrics.appendChild(badge);
    }

    row.appendChild(severityMark);
    row.appendChild(identity);
    row.appendChild(metrics);
    cellLoadRows.appendChild(row);
  });
  criticalCellValue.textContent = effectiveSnapshot.criticalCellLabel || "Nicht verfügbar";
}

function renderCustomerNetworkSummary(snapshot, communicationSnapshot) {
  const effectiveSnapshot = snapshot && Array.isArray(snapshot.rows)
    ? snapshot
    : lastValidCellLoadDashboardSnapshot;
  const rows = effectiveSnapshot && Array.isArray(effectiveSnapshot.rows) ? effectiveSnapshot.rows : [];
  const validRows = rows.filter((cell) => cell && Number.isFinite(Number(cell.currentLoad)) && cell.towerId);
  const maxCell = validRows.reduce((best, cell) => {
    if (!best) return cell;
    return Number(cell.currentLoad) > Number(best.currentLoad) ? cell : best;
  }, null);

  if (customerMaxCellLoadValue) {
    customerMaxCellLoadValue.textContent = maxCell
      ? `${Math.round(Number(maxCell.currentLoad))} % · ${maxCell.towerId}`
      : "Nicht verfügbar";
  }

  if (!customerNetworkStory || !customerNetworkStoryTitle || !customerNetworkStoryText) return;

  const currentState = cityStateEngine.get();
  const priorityActive = !!(
    (communicationSnapshot && communicationSnapshot.priorityActive) ||
    validRows.some((cell) => cell.bosPriorityActive === true) ||
    currentState === CITY_STATES.BOS_ACTIVE
  );
  const maxLoad = maxCell ? Number(maxCell.currentLoad) : 0;
  let storyState = "normal";
  let title = "Netz im Normalbetrieb";
  let text = "Die automatische BOS-Priorisierung steht für kritische Zelllast bereit.";

  if (priorityActive) {
    storyState = "bos-active";
    title = "BOS-Kommunikation priorisiert";
    text = "Einsatzkräfte bleiben auch bei hoher ziviler Zelllast priorisiert verbunden.";
  } else if (currentState === CITY_STATES.OVERLOADED || maxLoad >= 90) {
    storyState = "overloaded";
    title = "Funkzelle ausgelastet";
    text = "Die automatische BOS-Priorisierung wird durch die bestehende Netzlogik ausgelöst.";
  } else if (currentState === CITY_STATES.HIGH_LOAD || maxLoad >= 70) {
    storyState = "high-load";
    title = "Zivile Nachfrage steigt";
    text = "Die lokale Funkzelle nähert sich ihrer Kapazitätsgrenze.";
  }

  customerNetworkStory.dataset.storyState = storyState;
  customerNetworkStoryTitle.textContent = title;
  customerNetworkStoryText.textContent = text;
}

function renderCellCapacityDashboard(snapshot) {
  if (!capacityAllocationSummary || !capacityAllocationState || !capacityAllocationRows ||
      !capacityAllocationNote || !capacityAllocationHint) return;
  if (!snapshot || snapshot.visible !== true || !Array.isArray(snapshot.rows)) {
    capacityAllocationSummary.hidden = true;
    capacityAllocationRows.innerHTML = "";
    return;
  }

  capacityAllocationSummary.hidden = false;
  capacityAllocationState.textContent = snapshot.stateLabel || "Gemeinsame Zellkapazität";
  capacityAllocationNote.textContent = snapshot.note || "";
  capacityAllocationHint.textContent = snapshot.hint ||
    "Symbolische Simulationseinheiten; keine technische Leistungskennzahl.";
  capacityAllocationRows.innerHTML = "";

  const labels = snapshot.labels || {};
  snapshot.rows.slice(0, 2).forEach((cell) => {
    const row = document.createElement("div");
    row.className = `capacity-allocation-row${cell.priorityApplied ? " priority" : ""}`;

    const header = document.createElement("div");
    header.className = "capacity-allocation-row-header";
    const identity = document.createElement("strong");
    identity.textContent = `${cell.towerId} · ${cell.label}`;
    const status = document.createElement("span");
    status.textContent = cell.priorityApplied
      ? (cell.prioritySettled ? "BOS priorisiert" : `${Math.round(cell.priorityProgress * 100)} % Aufbau`)
      : cell.statusLabel;
    header.appendChild(identity);
    header.appendChild(status);

    const metrics = document.createElement("div");
    metrics.className = "capacity-allocation-metrics";
    [
      [labels.civilianDemand || "Zivile Nachfrage", cell.civilianDemand, ""],
      [labels.civilianServed || "Zivil bedient", cell.civilianServed, ""],
      [labels.civilianUnserved || "Zurückgestellt", cell.civilianUnserved, "unserved"],
      [cell.bosServedLabel || labels.bosServed || "BOS priorisiert", cell.bosServed, "bos"]
    ].forEach(([label, value, className]) => {
      const metric = document.createElement("div");
      metric.className = `capacity-allocation-metric ${className}`.trim();
      const name = document.createElement("span");
      name.textContent = label;
      const amount = document.createElement("strong");
      amount.textContent = `${value} SE`;
      metric.appendChild(name);
      metric.appendChild(amount);
      metrics.appendChild(metric);
    });
    if (cell.bosUnserved > 0) {
      const metric = document.createElement("div");
      metric.className = "capacity-allocation-metric unserved";
      const name = document.createElement("span");
      name.textContent = labels.bosUnserved || "BOS nicht bedient";
      const amount = document.createElement("strong");
      amount.textContent = `${cell.bosUnserved} SE`;
      metric.appendChild(name);
      metric.appendChild(amount);
      metrics.appendChild(metric);
    }

    row.appendChild(header);
    row.appendChild(metrics);
    capacityAllocationRows.appendChild(row);
  });
}

class CommunicationRendererClass {
  constructor() {
    this.group = null;
    this.lineDispatchTower = null;
    this.lineTowerTruck = null;
    this.lineDispatchTowerGlow = null;
    this.lineTowerTruckGlow = null;
    this.preparedTowerPoliceLine = null;
    this.preparedFirePoliceLine = null;
    this.packets = [];
    this.endpointMarkers = [];
  }

  init() {
    this.group = new THREE.Group();
    scene.add(this.group);

    this.lineDispatchTowerGlow = this.createDynamicLine(0.08);
    this.lineTowerTruckGlow = this.createDynamicLine(0.08);
    this.lineDispatchTower = this.createDynamicLine(0.25);
    this.lineTowerTruck = this.createDynamicLine(0.25);
    this.preparedTowerPoliceLine = this.createPreparedLine();
    this.preparedFirePoliceLine = this.createPreparedLine();

    this.group.add(this.lineDispatchTowerGlow);
    this.group.add(this.lineTowerTruckGlow);
    this.group.add(this.lineDispatchTower);
    this.group.add(this.lineTowerTruck);
    this.group.add(this.preparedTowerPoliceLine);
    this.group.add(this.preparedFirePoliceLine);

    for (let i = 0; i < 10; i++) {
      const packet = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 8),
        new THREE.MeshBasicMaterial({
          color: 0x9bdfff,
          transparent: true,
          opacity: 0.45,
          depthWrite: false
        })
      );

      packet.userData.segment = i < 5 ? "dispatch-tower" : "tower-truck";
      packet.userData.offset = (i % 5) / 5;
      this.packets.push(packet);
      this.group.add(packet);
    }

    for (let i = 0; i < 4; i++) {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 16, 10),
        new THREE.MeshBasicMaterial({
          color: 0x9bdfff,
          transparent: true,
          opacity: 0.4,
          depthWrite: false
        })
      );
      this.endpointMarkers.push(marker);
      this.group.add(marker);
    }

    bosNetworkRegistry.registerUnit("dispatch", "Leitstelle", () => DispatchManager.getPosition(), true);
    bosNetworkRegistry.registerUnit("tower", "Mobilfunkmast", () => getTowerCommsPosition(), true);
    bosNetworkRegistry.registerUnit("fire", "Feuerwehr", () => getActiveFireCommsPosition(), true);
    bosNetworkRegistry.registerUnit("police", "Polizei", () => stationManager.getPolicePreparedCommsPosition(), false);

    bosNetworkRegistry.registerLink("dispatch-tower", "dispatch", "tower", true);
    bosNetworkRegistry.registerLink("tower-fire", "tower", "fire", true);
    bosNetworkRegistry.registerLink("tower-police-prepared", "tower", "police", false);
    bosNetworkRegistry.registerLink("fire-police-prepared", "fire", "police", false);
  }

  createDynamicLine(opacity) {
    const positions = new Float32Array(6);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0x9bdfff,
      transparent: true,
      opacity
    });

    return new THREE.Line(geometry, material);
  }

  createPreparedLine() {
    const line = this.createDynamicLine(0.08);
    line.material.color.setHex(0x7aaac8);
    line.material.opacity = 0.1;
    return line;
  }

  updateLine(line, start, end) {
    const positions = line.geometry.attributes.position.array;

    positions[0] = start.x;
    positions[1] = start.y;
    positions[2] = start.z;
    positions[3] = end.x;
    positions[4] = end.y;
    positions[5] = end.z;

    line.geometry.attributes.position.needsUpdate = true;
  }

  getMode() {
    if (cityStateEngine.is(CITY_STATES.BOS_ACTIVE)) return "bos";
    if (cityStateEngine.is(CITY_STATES.OVERLOADED)) return "overloaded";
    if (cityStateEngine.is(CITY_STATES.HIGH_LOAD)) return "high-load";
    return "normal";
  }

  getModeConfig(mode, elapsed) {
    if (mode === "bos") {
      return {
        color: 0x00d4ff,
        glowOpacity: 0.2 + Math.sin(elapsed * 3.5) * 0.04,
        lineOpacity: 0.76 + Math.sin(elapsed * 3.5) * 0.08,
        speed: 0.36,
        packetOpacity: 0.9,
        dropout: false
      };
    }

    if (mode === "overloaded") {
      return {
        color: 0xff6b5c,
        glowOpacity: 0.06 + Math.max(0, Math.sin(elapsed * 8.0)) * 0.08,
        lineOpacity: 0.1 + Math.max(0, Math.sin(elapsed * 8.0)) * 0.2,
        speed: 0.12,
        packetOpacity: 0.26,
        dropout: true
      };
    }

    if (mode === "high-load") {
      return {
        color: 0xffc15c,
        glowOpacity: 0.1 + Math.sin(elapsed * 4) * 0.03,
        lineOpacity: 0.3 + Math.sin(elapsed * 4) * 0.07,
        speed: 0.22,
        packetOpacity: 0.52,
        dropout: false
      };
    }

    return {
      color: 0x9bdfff,
      glowOpacity: 0.08,
      lineOpacity: 0.24,
      speed: 0.18,
      packetOpacity: 0.44,
      dropout: false
    };
  }

  update(elapsed) {
    if (!this.group) return;

    const dispatch = DispatchManager.getPosition();
    const tower = getTowerCommsPosition();
    const truck = getActiveFireCommsPosition();
    const police = stationManager.getPolicePreparedCommsPosition();

    this.updateLine(this.lineDispatchTower, dispatch, tower);
    this.updateLine(this.lineTowerTruck, tower, truck);
    this.updateLine(this.lineDispatchTowerGlow, dispatch, tower);
    this.updateLine(this.lineTowerTruckGlow, tower, truck);

    this.updateLine(this.preparedTowerPoliceLine, tower, police);
    this.updateLine(this.preparedFirePoliceLine, truck, police);

    const mode = this.getMode();
    const config = this.getModeConfig(mode, elapsed);

    [this.lineDispatchTower, this.lineTowerTruck].forEach((line) => {
      line.material.color.setHex(config.color);
      line.material.opacity = config.lineOpacity;
    });

    [this.lineDispatchTowerGlow, this.lineTowerTruckGlow].forEach((line) => {
      line.material.color.setHex(config.color);
      line.material.opacity = config.glowOpacity;
    });

    [this.preparedTowerPoliceLine, this.preparedFirePoliceLine].forEach((line) => {
      line.material.color.setHex(mode === "bos" ? 0x00a6ff : 0x7aaac8);
      line.material.opacity = mode === "bos" ? 0.14 : 0.08;
    });

    this.packets.forEach((packet, index) => {
      const start = packet.userData.segment === "dispatch-tower" ? dispatch : tower;
      const end = packet.userData.segment === "dispatch-tower" ? tower : truck;
      const t = (elapsed * config.speed + packet.userData.offset) % 1;

      packet.position.lerpVectors(start, end, t);
      packet.material.color.setHex(config.color);

      if (config.dropout) {
        packet.visible = Math.sin(elapsed * 8 + index * 1.7) > 0.15;
      } else {
        packet.visible = true;
      }

      packet.material.opacity = config.packetOpacity;
      packet.scale.setScalar(1 + Math.sin(elapsed * 6 + index) * 0.18);
    });

    const endpoints = [dispatch, tower, truck, police];

    this.endpointMarkers.forEach((marker, index) => {
      marker.position.copy(endpoints[index]);
      marker.material.color.setHex(index === 3 ? 0x7aaac8 : config.color);
      marker.material.opacity = index === 3 ? 0.28 : mode === "bos" ? 0.8 : 0.38;
      marker.scale.setScalar(mode === "bos" && index < 3 ? 1.2 + Math.sin(elapsed * 5 + index) * 0.12 : 1);
    });
  }
}

/* -------------------------------------------------------------------------- */
/* City Manager                                                               */
/* -------------------------------------------------------------------------- */

const cityManager = {
  update(delta) {
    const meta = getCityStateMeta(cityStateEngine.get());
    const blend = 1 - Math.exp(-delta * 1.8);

    if (ambientLight) {
      ambientLight.intensity = THREE.MathUtils.lerp(
        ambientLight.intensity,
        meta.ambientIntensity,
        blend
      );
    }

    if (sunLight) {
      sunLight.intensity = THREE.MathUtils.lerp(
        sunLight.intensity,
        meta.sunIntensity,
        blend
      );
      sunLight.color.lerp(new THREE.Color(meta.sunColor), blend);
    }

    if (softSkyLight) {
      softSkyLight.intensity = THREE.MathUtils.lerp(
        softSkyLight.intensity,
        meta.hemisphereIntensity,
        blend
      );
    }

    scene.fog.color.lerp(new THREE.Color(meta.fogColor), blend);
    scene.background.lerp(new THREE.Color(meta.fogColor), blend);

    if (skyDome && skyDome.material && skyDome.material.uniforms) {
      skyDome.material.uniforms.topColor.value.lerp(new THREE.Color(meta.skyTop), blend);
      skyDome.material.uniforms.horizonColor.value.lerp(new THREE.Color(meta.skyHorizon), blend);
      skyDome.material.uniforms.bottomColor.value.lerp(new THREE.Color(meta.skyBottom), blend);
    }
  }
};

/* -------------------------------------------------------------------------- */
/* Active Mission Context                                                     */
/* -------------------------------------------------------------------------- */

function isMissionRegistryFinalized() {
  if (!validatedMissionRegistry || typeof validatedMissionRegistry.getManifest !== "function") return false;
  const manifest = validatedMissionRegistry.getManifest();
  const expected = Number(((window.MISSION_BOS_MISSION_REGISTRY_PLAN || {}).expectedCounts || {}).registeredRuntimesAfterFinalization || 0);
  return !!manifest && manifest.status === "PASSED" &&
    manifest.registrationFinalized === true && manifest.registeredRuntimes === expected;
}

function setMission002InitializationUnavailable(reason) {
  mission002InitializationUnavailable = true;
  mission002InitializationFailureReason = reason || "Mission 002 konnte nicht initialisiert werden.";
  applyMissionRegistryFailSoftStatus();
}

function applyMissionRegistryFailSoftStatus() {
  if (!mission002InitializationUnavailable || isMissionRegistryFinalized()) return;
  const mission001State = validatedMission001 && typeof validatedMission001.getState === "function"
    ? validatedMission001.getState() : "UNAVAILABLE";
  const mission001Row = missionRegistryList
    ? missionRegistryList.querySelector('[data-mission-id="MISSION_001"]') : null;
  const mission002Row = missionRegistryList
    ? missionRegistryList.querySelector('[data-mission-id="MISSION_002"]') : null;
  if (mission001Row) {
    mission001Row.disabled = true;
    mission001Row.setAttribute("aria-disabled", "true");
    const status = mission001Row.querySelector(".mission-registry-row-status");
    if (status) status.textContent = mission001State === "READY" ? "Bereit" : "Aktiv";
  }
  if (mission002Row) {
    mission002Row.disabled = true;
    mission002Row.setAttribute("aria-disabled", "true");
    const status = mission002Row.querySelector(".mission-registry-row-status");
    if (status) status.textContent = "Nicht verfügbar";
  }
  if (missionRegistryPanel) missionRegistryPanel.dataset.registryStatus = "degraded";
  if (missionRegistryStatus) {
    missionRegistryStatus.textContent = mission001State === "READY"
      ? "Mission 001 bereit · Mission 002 nicht verfügbar"
      : "Mission 001 aktiv · Mission 002 nicht verfügbar";
    missionRegistryStatus.title = mission002InitializationFailureReason;
  }
}

function createLegacyTwoMissionRegistryValidationFacade() {
  if (!validatedMissionRegistry) return null;
  return {
    getManifest() {
      const manifest = validatedMissionRegistry.getManifest();
      return Object.assign({}, manifest, { registeredRuntimes: 2, unavailableMissions: 0 });
    },
    getSafetyStatus() {
      const safety = validatedMissionRegistry.getSafetyStatus();
      return Object.assign({}, safety, { registeredRuntimeCount: 2, unavailableMissionCount: 0 });
    },
    getSelectedMissionId: () => validatedMissionRegistry.getSelectedMissionId(),
    getActiveMissionId: () => validatedMissionRegistry.getActiveMissionId()
  };
}

function runDualMissionRecoveryValidation() {
  if (!window.MISSION_BOS_DUAL_MISSION_RECOVERY_PLAN ||
      !window.MissionBosDualMissionRecoveryValidator) {
    console.error("Dual-mission recovery validation files are unavailable.");
    return null;
  }
  validatedDualMissionRecoveryValidation = window.MissionBosDualMissionRecoveryValidator.validate({
    plan: window.MISSION_BOS_DUAL_MISSION_RECOVERY_PLAN,
    registryRuntime: createLegacyTwoMissionRegistryValidationFacade(),
    mission001Runtime: validatedMission001,
    mission002Runtime: validatedMission002,
    mission002SceneRuntime: validatedMission002Scene,
    mission002Plan: window.MISSION_BOS_MISSION_002_PLAN,
    arenaEventRuntime: validatedArenaEvent,
    ambulanceFoundationRuntime: validatedAmbulanceFoundation
  });
  window.MissionBosDualMissionRecoveryValidator.logResult(validatedDualMissionRecoveryValidation);
  return validatedDualMissionRecoveryValidation;
}

function runPresentationPolishValidation() {
  if (!window.MISSION_BOS_PRESENTATION_POLISH_PLAN ||
      !window.MissionBosPresentationPolishValidator) {
    console.error("Build 011N.1 presentation validation files are unavailable.");
    return null;
  }
  validatedPresentationPolish = window.MissionBosPresentationPolishValidator.validate({
    plan: window.MISSION_BOS_PRESENTATION_POLISH_PLAN,
    mission001Plan: window.MISSION_BOS_MISSION_001_PLAN,
    ambulancePlan: window.MISSION_BOS_AMBULANCE_PLAN,
    associationPlan: window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN,
    communicationPlan: window.MISSION_BOS_TELEKOM_COMMUNICATION_PLAN,
    mission002Plan: window.MISSION_BOS_MISSION_002_PLAN,
    ambulanceConnectivityRuntime: validatedAmbulanceConnectivity,
    arenaConnectivityRuntime: validatedArenaEventConnectivity,
    ambulanceFoundationRuntime: validatedAmbulanceFoundation,
    arenaEventRuntime: validatedArenaEvent,
    missionRegistryRuntime: validatedMissionRegistry,
    unifiedBosConnectivityRuntime: validatedUnifiedBosConnectivity,
    networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN,
    automaticBOSPriorityRuntime: validatedAutomaticBOSPriority,
    document: document,
    networkInspectionEnabled: RECOVERY_CONFIG.enableNetworkInspection,
    networkInspectionRuntime: validatedNetworkInspection,
    automaticMissionStarts: 0,
    automaticBOSActivations: 0
  });
  window.MISSION_BOS_PRESENTATION_VALIDATION = validatedPresentationPolish;
  window.MissionBosPresentationPolishValidator.logResult(validatedPresentationPolish);
  return validatedPresentationPolish;
}

function getSelectedMissionId() {
  return isMissionRegistryFinalized() && typeof validatedMissionRegistry.getSelectedMissionId === "function"
    ? validatedMissionRegistry.getSelectedMissionId()
    : "MISSION_001";
}

function getSelectedMissionRuntime() {
  return isMissionRegistryFinalized() && typeof validatedMissionRegistry.getSelectedRuntime === "function"
    ? validatedMissionRegistry.getSelectedRuntime()
    : validatedMission001;
}

function getActiveMissionId() {
  return isMissionRegistryFinalized() && typeof validatedMissionRegistry.getActiveMissionId === "function"
    ? validatedMissionRegistry.getActiveMissionId()
    : (validatedMission001 && validatedMission001.isActive() ? "MISSION_001" : null);
}

function getActiveMissionRuntime() {
  const activeId = getActiveMissionId();
  if (activeId === "MISSION_004") return validatedMission004;
  if (activeId === "MISSION_003") return validatedMission003;
  if (activeId === "MISSION_002") return validatedMission002;
  if (activeId === "MISSION_001") return validatedMission001;
  return null;
}

function getMissionPlanForId(missionId) {
  if (missionId === "MISSION_004") return window.MISSION_BOS_MISSION_004_PLAN;
  if (missionId === "MISSION_003") return window.MISSION_BOS_MISSION_003_PLAN;
  if (missionId === "MISSION_002") return window.MISSION_BOS_MISSION_002_PLAN;
  return window.MISSION_BOS_MISSION_001_PLAN;
}

function getCurrentMissionContext() {
  const selectedId = getSelectedMissionId();
  const activeId = getActiveMissionId();
  const activeRuntime = getActiveMissionRuntime();
  const selectedRuntime = getSelectedMissionRuntime();
  const displayRuntime = activeRuntime || selectedRuntime || validatedMission001;
  const missionState = activeRuntime && typeof activeRuntime.getState === "function"
    ? activeRuntime.getState()
    : "READY";
  const networkState = activeRuntime && typeof activeRuntime.getNetworkState === "function"
    ? activeRuntime.getNetworkState()
    : missionState;
  const cellLoadProfileState = activeRuntime && typeof activeRuntime.getCellLoadProfileState === "function"
    ? activeRuntime.getCellLoadProfileState()
    : missionState;
  let activeBosEndpointIds = [];
  if (activeRuntime && typeof activeRuntime.getBosEndpointIds === "function") {
    activeBosEndpointIds = activeRuntime.getBosEndpointIds();
  } else if (activeId === "MISSION_001" && window.MISSION_BOS_CELL_CAPACITY_PLAN) {
    activeBosEndpointIds = (window.MISSION_BOS_CELL_CAPACITY_PLAN.incidentReference.expectedBosEndpointIdsOnSharedCell || []).slice();
  }
  return {
    selectedId,
    activeId,
    activeRuntime,
    selectedRuntime,
    displayRuntime,
    missionState,
    networkState,
    cellLoadProfileState,
    activeBosEndpointIds
  };
}

function isStandaloneArenaEventActive() {
  return !!(validatedArenaEvent && validatedArenaEvent.isActive() &&
    (!validatedArenaEvent.getOwnerMissionId || !validatedArenaEvent.getOwnerMissionId()));
}

/* -------------------------------------------------------------------------- */
/* UI Manager                                                                 */
/* -------------------------------------------------------------------------- */

const uiManager = {
  updateAll(force = false) {
    this.updateButtons();
    this.updateNetworkPanel();
    this.updateMissionPanel();
    this.updateDashboard(force);
  },

  updateButtons() {
    missionButton.classList.remove("running", "reset");
    const context = getCurrentMissionContext();
    const selectedMissionRuntime = context.displayRuntime;
    const selectedMissionPlan = getMissionPlanForId(context.activeId || context.selectedId);

    if (RECOVERY_CONFIG.enableValidatedMission001 && selectedMissionRuntime) {
      const missionState = selectedMissionRuntime.getState();
      const missionLabels = selectedMissionPlan && selectedMissionPlan.controls
        ? selectedMissionPlan.controls.missionButtonLabels : {};
      missionButton.textContent = missionLabels[missionState] ||
        (missionState === "COMPLETED" ? "Einsatz abschließen" :
          (missionState === "READY" ? "Mission starten" : "Mission läuft"));
      missionButton.disabled = !(
        (missionState === "READY" && selectedMissionRuntime.canStart()) ||
        (missionState === "COMPLETED" && selectedMissionRuntime.canFinish())
      );
      if (missionState === "COMPLETED") missionButton.classList.add("reset");
      else if (missionState !== "READY") missionButton.classList.add("running");
    } else if (RECOVERY_CONFIG.enableValidatedMission001) {
      missionButton.disabled = true;
      missionButton.textContent = "Mission nicht verfügbar";
      missionButton.classList.add("running");
    }

    const anyMissionActive = !!context.activeRuntime;
    overloadButton.disabled = anyMissionActive || networkManager.validatedMissionResetting ||
      MissionManager.isActive() || VehicleManager.isReturning() || isStandaloneArenaEventActive() ||
      !!(validatedAmbulanceFoundation && validatedAmbulanceFoundation.isActive());
    overloadButton.classList.toggle("active", networkManager.manualLoadActive);
    overloadButton.textContent = networkManager.manualLoadActive ? "Netzlast normalisieren" : "Netzlast simulieren";

    const bosLabels = selectedMissionPlan && selectedMissionPlan.controls
      ? selectedMissionPlan.controls.bosButtonLabels : null;
    bosButton.disabled = true;
    bosButton.classList.toggle("active", networkManager.bosPriorityActive);
    if (networkManager.bosPriorityActive) {
      bosButton.textContent = bosLabels && bosLabels.ACTIVE ? bosLabels.ACTIVE : "BOS-Spur automatisch aktiv";
    } else if (context.activeRuntime) {
      bosButton.textContent = "BOS-Spur: automatische Aktivierung";
    } else {
      bosButton.textContent = "BOS-Spur: bereit";
    }

    const ambulanceFoundationActive = validatedAmbulanceFoundation && validatedAmbulanceFoundation.isActive();
    if (ambulanceFoundationActive) {
      missionButton.disabled = true;
      missionButton.textContent = "Rettungswagentest aktiv";
      missionButton.classList.add("running");
      overloadButton.disabled = true;
      bosButton.disabled = true;
    }

    const standaloneArenaEventActive = isStandaloneArenaEventActive();
    if (missionRegistryPanel) missionRegistryPanel.classList.toggle("arena-event-locked", standaloneArenaEventActive);
    if (standaloneArenaEventActive) {
      missionButton.disabled = true;
      missionButton.textContent = "Arena-Veranstaltung aktiv";
      missionButton.classList.add("running");
      overloadButton.disabled = true;
      bosButton.disabled = true;
      if (ambulanceTestButton) ambulanceTestButton.disabled = true;
    }

    const nonMission001SelectedOrActive = (context.activeId || context.selectedId) !== "MISSION_001";
    if (presenterNextButton) presenterNextButton.disabled = nonMission001SelectedOrActive || ambulanceFoundationActive || standaloneArenaEventActive;
    if (presenterResetButton && nonMission001SelectedOrActive) presenterResetButton.disabled = true;
    if (ambulanceTestButton && context.activeId) ambulanceTestButton.disabled = true;
    if (arenaEventTestButton && context.activeId) arenaEventTestButton.disabled = true;
  },
  updateNetworkPanel() {
    const state = cityStateEngine.get();
    const meta = getCityStateMeta(state);

    activeModeValue.textContent = meta.modeLabel;
    networkStatus.textContent = meta.networkLabel;
    loadValue.textContent = `${Math.round(networkLoad)}%`;

    loadFill.style.width = `${networkLoad}%`;
    loadFill.className = "";
    loadFill.classList.add(meta.loadClass);

    const missionContext = getCurrentMissionContext();
    const missionProgress = missionContext.displayRuntime
      ? missionContext.displayRuntime.getProgress()
      : MissionManager.getProgress();
    missionProgressFill.style.width = `${missionProgress}%`;

    const communicationSnapshot = getValidatedTelekomCommunicationSnapshot();
    priorityValue.textContent = communicationSnapshot
      ? (communicationSnapshot.priorityActive ? "Aktiv" : "Inaktiv")
      : (networkManager.bosPriorityActive ? "Aktiv" : "Inaktiv");

    bosExplanation.textContent = communicationSnapshot
      ? communicationSnapshot.comparisonText
      : meta.explanation;
    bosExplanation.className = `mode-hint ${meta.loadClass}`;

    infoPanel.dataset.cityState = state;
  },

  updateMissionPanel() {
    if (RECOVERY_CONFIG.enableValidatedMission001) {
      const context = getCurrentMissionContext();
      const runtime = context.displayRuntime;
      const missionId = context.activeId || context.selectedId;
      if (runtime) {
        missionPhaseValue.textContent = runtime.getPhaseLabel();
        missionStageValue.textContent = runtime.getStageLabel();
        const selectedPlan = getMissionPlanForId(missionId);
        missionTitleValue.textContent = selectedPlan
          ? (selectedPlan.shortTitle || (selectedPlan.incidentReference && selectedPlan.incidentReference.title) || selectedPlan.title)
          : "Missionen";
        const customerStatusByState = selectedPlan && selectedPlan.customerPresentation
          ? selectedPlan.customerPresentation.statusBadgeByState : null;
        const runtimeState = typeof runtime.getState === "function" ? runtime.getState() : null;
        missionStatusValue.textContent = customerStatusByState && runtimeState && customerStatusByState[runtimeState]
          ? customerStatusByState[runtimeState]
          : runtime.getStatusLabel();
        missionDescriptionValue.textContent = runtime.getDescription();
        if (missionId === "MISSION_002" && validatedAmbulance) {
          fireUnitStatusValue.textContent = validatedAmbulance.getVehicleStatus();
        } else if (missionId === "MISSION_004" && validatedResponseVehicles && validatedAmbulance) {
          const fireStatus = validatedResponseVehicles.getVehicleStatus("RESPONSE_FIRE_01");
          const policeStatus = validatedResponseVehicles.getVehicleStatus("RESPONSE_POLICE_01");
          const ambulanceStatus = validatedAmbulance.getVehicleStatus();
          fireUnitStatusValue.textContent = `Feuerwehr: ${fireStatus} · Polizei: ${policeStatus} · Rettungswagen: ${ambulanceStatus}`;
        } else if (missionId === "MISSION_003" && validatedResponseVehicles && validatedStadtwerkeVehicle) {
          const fireStatus = validatedResponseVehicles.getVehicleStatus("RESPONSE_FIRE_01");
          const policeStatus = validatedResponseVehicles.getVehicleStatus("RESPONSE_POLICE_01");
          const utilityState = validatedStadtwerkeVehicle.getState();
          const utilityLabels = {
            PARKED: "in Bereitschaft",
            PREPARED: "alarmiert",
            WAITING: "Abfahrt vorbereitet",
            ENROUTE: "auf Anfahrt",
            AT_SCENE: "vor Ort",
            RETURN_WAITING: "Rückfahrt vorbereitet",
            RETURNING: "auf Rückfahrt"
          };
          fireUnitStatusValue.textContent = `Feuerwehr: ${fireStatus} · Polizei: ${policeStatus} · Stadtwerke: ${utilityLabels[utilityState] || utilityState}`;
        } else {
          fireUnitStatusValue.textContent = validatedResponseVehicles
            ? validatedResponseVehicles.getFireTruckStatus()
            : "Nicht verfügbar";
        }
      } else {
        missionPhaseValue.textContent = "Fehler";
        missionStageValue.textContent = "Mission nicht verfügbar";
        missionTitleValue.textContent = "Missionen";
        missionStatusValue.textContent = "Deaktiviert";
        missionDescriptionValue.textContent = "Die ausgewählte Mission konnte nicht initialisiert werden.";
        fireUnitStatusValue.textContent = "Nicht verfügbar";
      }
      return;
    }
  },
  updateDashboard(force = false) {
    if (!force && panelUpdateTimer < 0.25) return;

    panelUpdateTimer = 0;

    const meta = getCityStateMeta(cityStateEngine.get());

    cityStatusValue.textContent = meta.cityStatus;

    const communicationSnapshot = getValidatedTelekomCommunicationSnapshot();
    const cellLoadSnapshot = getValidatedCellLoadSnapshot();
    const cellCapacitySnapshot = getValidatedCellCapacitySnapshot();
    const handoverVisualizationSnapshot = getValidatedHandoverVisualizationSnapshot();
    renderCellLoadDashboard(cellLoadSnapshot);
    renderCellCapacityDashboard(cellCapacitySnapshot);
    renderCustomerNetworkSummary(cellLoadSnapshot, communicationSnapshot);

    if (communicationSnapshot) {
      communicationPathValue.textContent = communicationSnapshot.pathLabel;
      communicationStatusValue.textContent = communicationSnapshot.bosStatus;
      mobileStatusValue.textContent = communicationSnapshot.civilianStatus;
      priorityStatusValue.textContent = communicationSnapshot.priorityActive ? "Aktiv" : "Inaktiv";
      dispatchLinkStatusValue.textContent = communicationSnapshot.linkStatus;

      civilianChannelStatusValue.textContent = communicationSnapshot.civilianStatus;
      bosChannelStatusValue.textContent = communicationSnapshot.bosStatus;
      civilianChannelFill.style.width = `${Math.round(communicationSnapshot.civilianFill * 100)}%`;
      bosChannelFill.style.width = `${Math.round(communicationSnapshot.bosFill * 100)}%`;
      civilianChannelFill.className = `communication-channel-fill civilian-fill ${communicationSnapshot.civilianMode}`;
      bosChannelFill.className = `communication-channel-fill bos-fill ${communicationSnapshot.bosMode}`;
      communicationComparisonNote.textContent = communicationSnapshot.comparisonText;
      communicationSymbolicHint.textContent = communicationSnapshot.symbolicHint;
      communicationComparison.dataset.civilianMode = communicationSnapshot.civilianMode;
      communicationComparison.dataset.bosMode = communicationSnapshot.bosMode;
      if (fireServingCellValue) fireServingCellValue.textContent = communicationSnapshot.fireTowerLabel || "Nicht aktiv";
      if (policeServingCellValue) policeServingCellValue.textContent = communicationSnapshot.policeTowerLabel || "Nicht aktiv";
      if (lastHandoverValue) lastHandoverValue.textContent = communicationSnapshot.lastHandoverLabel || "Noch kein Handover";
    } else {
      communicationPathValue.textContent = bosNetworkRegistry.getPathLabel();
      communicationStatusValue.textContent = meta.communicationStatus;
      mobileStatusValue.textContent = meta.mobileStatus;
      priorityStatusValue.textContent = meta.priorityStatus;
      dispatchLinkStatusValue.textContent = meta.linkStatus;

      civilianChannelStatusValue.textContent = meta.mobileStatus;
      bosChannelStatusValue.textContent = meta.communicationStatus;
      civilianChannelFill.style.width = "38%";
      bosChannelFill.style.width = "72%";
      civilianChannelFill.className = "communication-channel-fill civilian-fill normal";
      bosChannelFill.className = "communication-channel-fill bos-fill standby";
      communicationComparisonNote.textContent = meta.explanation;
      communicationSymbolicHint.textContent =
        "Vereinfachte symbolische Visualisierung; keine technische Leistungskennzahl.";
      communicationComparison.dataset.civilianMode = "normal";
      communicationComparison.dataset.bosMode = "standby";
      if (fireServingCellValue) fireServingCellValue.textContent = "Nicht verfügbar";
      if (policeServingCellValue) policeServingCellValue.textContent = "Nicht verfügbar";
      if (lastHandoverValue) lastHandoverValue.textContent = "Nicht verfügbar";
    }

    const dashboardMissionContext = getCurrentMissionContext();
    const mission002DashboardActive =
      (dashboardMissionContext.activeId || dashboardMissionContext.selectedId) === "MISSION_002";
    const mission004DashboardActive =
      (dashboardMissionContext.activeId || dashboardMissionContext.selectedId) === "MISSION_004";
    if (fireServingCellRow) fireServingCellRow.hidden = mission002DashboardActive;
    if (policeServingCellRow) policeServingCellRow.hidden = mission002DashboardActive;
    if (ambulanceServingCellRow) ambulanceServingCellRow.hidden = !(mission002DashboardActive || mission004DashboardActive);

    if (mission002DashboardActive) {
      const ambulanceTowerId = validatedNetworkAssociation &&
        typeof validatedNetworkAssociation.getServingTowerId === "function"
        ? validatedNetworkAssociation.getServingTowerId("NET_AMBULANCE_01")
        : null;
      const ambulanceTowerLabel = getTowerDashboardLabel(ambulanceTowerId);
      if (ambulanceServingCell) ambulanceServingCell.textContent = ambulanceTowerLabel;
      if (lastHandoverValue) {
        lastHandoverValue.textContent = getEndpointLastHandoverLabel(
          "NET_AMBULANCE_01",
          "Noch kein Rettungswagen-Handover"
        );
      }

      const mission002State = dashboardMissionContext.displayRuntime &&
        typeof dashboardMissionContext.displayRuntime.getState === "function"
        ? dashboardMissionContext.displayRuntime.getState()
        : "READY";
      const criticalStates = ["ON_SCENE", "OVERLOADED"];
      const priorityStates = ["BOS_ACTIVE"];
      const stableStates = ["COMMS_STABLE", "TREATMENT", "COMPLETED", "TRANSPORTING", "AT_HOSPITAL", "RETURNING"];
      const isCritical = criticalStates.indexOf(mission002State) >= 0;
      const isPriority = priorityStates.indexOf(mission002State) >= 0;
      const isStable = stableStates.indexOf(mission002State) >= 0;

      communicationPathValue.textContent = `Rettungswagen → ${ambulanceTowerId || "Funkzelle"} → Leitstelle`;
      communicationStatusValue.textContent = isStable ? "Stabil" : (isPriority ? "Priorisierung" : (isCritical ? "Instabil" : "Bereit"));
      mobileStatusValue.textContent = validatedArenaEvent && validatedArenaEvent.isActive()
        ? "Arena-Last hoch" : "Normalbetrieb";
      priorityStatusValue.textContent = networkManager.bosPriorityActive ? "Aktiv" : "Inaktiv";
      dispatchLinkStatusValue.textContent = isStable ? "Stabil" : (isCritical ? "Eingeschränkt" : "Bereit");
      bosChannelStatusValue.textContent = communicationStatusValue.textContent;
      civilianChannelStatusValue.textContent = mobileStatusValue.textContent;
      bosChannelFill.style.width = isStable ? "100%" : (isPriority ? "76%" : (isCritical ? "38%" : "72%"));
      civilianChannelFill.style.width = validatedArenaEvent && validatedArenaEvent.isActive() ? "92%" : "38%";
      bosChannelFill.className = `communication-channel-fill bos-fill ${isStable ? "stable" : (isPriority ? "priority" : (isCritical ? "overloaded" : "standby"))}`;
      civilianChannelFill.className = `communication-channel-fill civilian-fill ${validatedArenaEvent && validatedArenaEvent.isActive() ? "overloaded" : "normal"}`;
      communicationComparisonNote.textContent = isStable
        ? "Die Rettungsdienst-Kommunikation ist priorisiert; die zivile Arena-Nachfrage bleibt hoch."
        : (isCritical
          ? "Die belastete Arena-Zelle bedient die Rettungsdienst-Kommunikation zunächst nur teilweise."
          : "Die Rettungswagen-Verbindung folgt dynamisch der aktuell bestätigten Funkzelle.");
      communicationSymbolicHint.textContent =
        "Linien zeigen bestätigte Verbindungen; Last und Kapazität sind symbolische Simulationseinheiten.";
      communicationComparison.dataset.civilianMode = validatedArenaEvent && validatedArenaEvent.isActive()
        ? "overloaded" : "normal";
      communicationComparison.dataset.bosMode = isStable ? "stable" : (isPriority ? "priority" : (isCritical ? "overloaded" : "standby"));
    }

    if (mission004DashboardActive) {
      const fireTowerId = validatedNetworkAssociation && validatedNetworkAssociation.getServingTowerId
        ? validatedNetworkAssociation.getServingTowerId("NET_FIRE_01") : null;
      const policeTowerId = validatedNetworkAssociation && validatedNetworkAssociation.getServingTowerId
        ? validatedNetworkAssociation.getServingTowerId("NET_POLICE_01") : null;
      const ambulanceTowerId = validatedNetworkAssociation && validatedNetworkAssociation.getServingTowerId
        ? validatedNetworkAssociation.getServingTowerId("NET_AMBULANCE_01") : null;
      if (fireServingCellValue) fireServingCellValue.textContent = getTowerDashboardLabel(fireTowerId);
      if (policeServingCellValue) policeServingCellValue.textContent = getTowerDashboardLabel(policeTowerId);
      if (ambulanceServingCell) ambulanceServingCell.textContent = getTowerDashboardLabel(ambulanceTowerId);

      const mission004State = dashboardMissionContext.displayRuntime && dashboardMissionContext.displayRuntime.getState
        ? dashboardMissionContext.displayRuntime.getState() : "READY";
      const saturationStates = ["ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "EXTRICATION", "PATIENT_READY", "COMPLETED"];
      const saturated = saturationStates.indexOf(mission004State) >= 0;
      const priorityActive = networkManager.bosPriorityActive === true;
      const sameIncidentCell = fireTowerId && fireTowerId === policeTowerId && policeTowerId === ambulanceTowerId;
      communicationPathValue.textContent = sameIncidentCell
        ? `Feuerwehr · Polizei · Rettungswagen → ${fireTowerId} → Leitstelle`
        : "BOS-Fahrzeuge → dynamische Funkzellen → Leitstelle";
      communicationStatusValue.textContent = priorityActive ? "Stabil priorisiert" : (saturated ? "Überlastet" : "Bereit");
      mobileStatusValue.textContent = saturated ? "8 Unfall-Smartphones + Zivilverkehr" : "Zivile Konkurrenz aktiv";
      priorityStatusValue.textContent = priorityActive ? "Aktiv" : "Inaktiv";
      dispatchLinkStatusValue.textContent = priorityActive ? "Stabil" : (saturated ? "Eingeschränkt" : "Bereit");
      civilianChannelStatusValue.textContent = saturated ? "Überlastet" : "Best Effort";
      bosChannelStatusValue.textContent = priorityActive ? "Priorisiert" : (saturated ? "Wartet auf automatische BOS-Spur" : "Bereit");
      civilianChannelFill.style.width = saturated ? "98%" : "52%";
      bosChannelFill.style.width = priorityActive ? "100%" : (saturated ? "42%" : "72%");
      civilianChannelFill.className = `communication-channel-fill civilian-fill ${saturated ? "overloaded" : "normal"}`;
      bosChannelFill.className = `communication-channel-fill bos-fill ${priorityActive ? "stable" : (saturated ? "overloaded" : "standby")}`;
      communicationComparisonNote.textContent = priorityActive
        ? "Die gemeinsame BOS-Runtime hält alle drei Einsatzfahrzeuge trotz überlasteter Einsatzfunkzelle priorisiert verbunden."
        : (saturated
          ? "Die Einsatzfunkzelle ist durch sichtbare zivile Nachfrage ausgelastet; die BOS-Spur wird ausschließlich durch die automatische 90/85-Logik gesteuert."
          : "Alle Verbindungen folgen der jeweils bestätigten Funkzelle; Mission 004 besitzt keine feste Zellzuweisung.");
      communicationSymbolicHint.textContent =
        "Mission 004 nutzt dieselbe Association-, Last-, Kapazitäts- und BOS-Priority-Architektur wie die bestehenden Missionen.";
      communicationComparison.dataset.civilianMode = saturated ? "overloaded" : "normal";
      communicationComparison.dataset.bosMode = priorityActive ? "stable" : (saturated ? "overloaded" : "standby");
      if (lastHandoverValue) {
        lastHandoverValue.textContent = getEndpointLastHandoverLabel(
          "NET_AMBULANCE_01",
          "Noch kein Mission-004-Handover"
        );
      }
    }

    if (handoverVisualizationSnapshot) {
      if (communicationSymbolicHint && handoverVisualizationSnapshot.symbolicHint) {
        communicationSymbolicHint.textContent = handoverVisualizationSnapshot.symbolicHint;
      }
      if (lastHandoverValue) {
        lastHandoverValue.classList.toggle(
          "handover-visualization-emphasis",
          handoverVisualizationSnapshot.emphasizeLastHandover === true
        );
      }
    } else if (lastHandoverValue) {
      lastHandoverValue.classList.remove("handover-visualization-emphasis");
    }

    dispatchStatusValue.textContent = stationManager.getDispatchStatus();
    stationStatusValue.textContent = stationManager.getFireStationStatus();

    const civilianVehicleCount = validatedTraffic
      ? validatedTraffic.getVehicleCount()
      : (RECOVERY_CONFIG.enableLegacyTraffic ? trafficManager.getVehicleCount() : 0);

    const responseVehicleCount = validatedResponseVehicles
      ? validatedResponseVehicles.getVehicleCount()
      : (RECOVERY_CONFIG.enableResponseVehicles ? VehicleManager.getVehicleCount() : 0);

    const ambulanceVehicleCount = validatedAmbulance &&
      validatedAmbulance.getManifest &&
      validatedAmbulance.getManifest().status === "PASSED"
      ? 1
      : 0;

    const stadtwerkeVehicleCount = validatedStadtwerkeVehicle &&
      typeof validatedStadtwerkeVehicle.getVehicleCount === "function" &&
      validatedStadtwerkeVehicle.getManifest &&
      validatedStadtwerkeVehicle.getManifest().status === "PASSED"
      ? validatedStadtwerkeVehicle.getVehicleCount()
      : 0;

    vehicleCountValue.textContent = String(
      civilianVehicleCount +
      responseVehicleCount +
      ambulanceVehicleCount +
      stadtwerkeVehicleCount +
      stationManager.getStaticVehicleCount()
    );

    const activePedestrianCount = validatedPedestrians
      ? validatedPedestrians.getPedestrianCount()
      : (RECOVERY_CONFIG.enablePedestrians ? pedestrianManager.getCount() : 0);

    const visibleMissionSpectators = validatedMission001Scene &&
      typeof validatedMission001Scene.getVisibleSpectatorCount === "function"
      ? validatedMission001Scene.getVisibleSpectatorCount()
      : 0;

    const visibleArenaVisitors = validatedArenaEventRenderer && validatedArenaEvent && validatedArenaEvent.isActive() &&
      typeof validatedArenaEventRenderer.getVisibleActorCount === "function"
      ? validatedArenaEventRenderer.getVisibleActorCount()
      : 0;

    pedestrianCountValue.textContent = String(
      activePedestrianCount + visibleMissionSpectators + visibleArenaVisitors
    );
  }
};

/* -------------------------------------------------------------------------- */
/* Three.js Setup                                                             */
/* -------------------------------------------------------------------------- */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb7d9f2);
scene.fog = new THREE.Fog(0xb7d9f2, 55, 145);

const camera = new THREE.PerspectiveCamera(
  56,
  container.clientWidth / container.clientHeight,
  0.1,
  280
);

camera.position.set(0.78, 9, 46);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

const clock = new THREE.Clock();

const keys = {};
let targetYaw = 0;
let targetPitch = -0.17863100651394934;
let currentYaw = 0;
let currentPitch = -0.17863100651394934;
let freeCameraHeight = 9;
camera.rotation.set(currentPitch, currentYaw, 0);
let isMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

const cameraVelocity = new THREE.Vector3();

const presenterCameraAdapter = {
  getPose() {
    return {
      position: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      },
      yaw: currentYaw,
      pitch: currentPitch,
      fov: camera.fov
    };
  },

  applyPose(pose) {
    if (!pose || !pose.position) return false;
    camera.position.set(
      Number(pose.position.x),
      Number(pose.position.y),
      Number(pose.position.z)
    );
    currentYaw = targetYaw = Number(pose.yaw);
    currentPitch = targetPitch = Number(pose.pitch);
    camera.rotation.set(currentPitch, currentYaw, 0);
    const nextFov = Number(pose.fov);
    if (Number.isFinite(nextFov) && Math.abs(camera.fov - nextFov) > 0.0001) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }
    cameraVelocity.set(0, 0, 0);
    return true;
  },

  stopVelocity() {
    cameraVelocity.set(0, 0, 0);
  },

  releaseToFree() {
    targetYaw = currentYaw = camera.rotation.y;
    targetPitch = currentPitch = camera.rotation.x;
    freeCameraHeight = camera.position.y;
    cameraVelocity.set(0, 0, 0);
    return true;
  }
};

let ambientLight = null;
let sunLight = null;
let softSkyLight = null;

const cityGroup = new THREE.Group();
const roadGroup = new THREE.Group();
const treeGroup = new THREE.Group();
const bushGroup = new THREE.Group();
const streetLightGroup = new THREE.Group();
const parkGroup = new THREE.Group();
const stationGroup = new THREE.Group();
const signGroup = new THREE.Group();
const landmarkGroup = new THREE.Group();
const roadNetworkDebugGroup = new THREE.Group();
const responseVehicleGroup = new THREE.Group();
const signalGroup = new THREE.Group();
const vehicleGroup = new THREE.Group();
const pedestrianGroup = new THREE.Group();

const trafficVehicles = [];
const pedestrians = [];
const animatedBulbs = [];
const billboards = [];

let skyDome = null;
let towerGroup = null;
let towerBeacon = null;
let towerBeaconGlow = null;

scene.add(cityGroup);
scene.add(roadGroup);
scene.add(treeGroup);
scene.add(bushGroup);
scene.add(streetLightGroup);
scene.add(parkGroup);
scene.add(stationGroup);
scene.add(signGroup);
scene.add(landmarkGroup);
scene.add(roadNetworkDebugGroup);
scene.add(responseVehicleGroup);
scene.add(signalGroup);
scene.add(vehicleGroup);
scene.add(pedestrianGroup);

const cityDistrictManager = new CityDistrictManager();
const roadNetwork = new RoadNetwork();
const waypointManager = new WaypointManager(roadNetwork);
const stationManager = new StationManager();
const trafficManager = new TrafficManager();
const pedestrianManager = new PedestrianManager();
const bosNetworkRegistry = new BOSNetworkRegistry();
const DispatchManager = new DispatchManagerClass(stationManager);
const CommunicationRenderer = new CommunicationRendererClass();

const presenterResetAdapter = {
  resetReadyBaseline() {
    if (validatedAmbulanceFoundation && validatedAmbulanceFoundation.isActive()) return false;
    if (validatedAmbulance && validatedAmbulance.getState() !== "AT_STATION") return false;
    if (!validatedMission001 || validatedMission001.getState() !== "READY") return false;
    if (validatedMission002 && validatedMission002.getState() !== "READY") return false;
    if (validatedMission003 && validatedMission003.getState() !== "READY") return false;
    if (validatedMission004 && validatedMission004.getState() !== "READY") return false;
    if (!validatedIncidentAccess || validatedIncidentAccess.getState() !== "AT_STATIONS") return false;
    if (!validatedResponseVehicles || validatedResponseVehicles.getState() !== "AT_STATIONS") return false;

    if (validatedAmbulanceFoundation && typeof validatedAmbulanceFoundation.reset === "function") {
      validatedAmbulanceFoundation.reset();
    }
    if (validatedUnifiedBosConnectivity && typeof validatedUnifiedBosConnectivity.reset === "function") {
      validatedUnifiedBosConnectivity.reset();
    }
    if (validatedBosBackhaul && typeof validatedBosBackhaul.reset === "function") {
      validatedBosBackhaul.reset();
    }
    if (validatedTraffic && typeof validatedTraffic.releaseAllYields === "function") {
      validatedTraffic.releaseAllYields();
    }
    if (validatedArenaEvent && typeof validatedArenaEvent.reset === "function") {
      validatedArenaEvent.reset();
    }
    if (validatedArenaEventConnectivity && typeof validatedArenaEventConnectivity.reset === "function") {
      validatedArenaEventConnectivity.reset();
    }
    if (validatedMission003Connectivity && typeof validatedMission003Connectivity.reset === "function") validatedMission003Connectivity.reset();
    if (validatedMission004Connectivity && typeof validatedMission004Connectivity.reset === "function") validatedMission004Connectivity.reset();
    if (validatedArenaEventRenderer && typeof validatedArenaEventRenderer.reset === "function") {
      validatedArenaEventRenderer.reset();
    }
    if (validatedAutomaticBOSPriority && typeof validatedAutomaticBOSPriority.reset === "function") {
      validatedAutomaticBOSPriority.reset();
    }
    if (validatedBOSActivationImpact && typeof validatedBOSActivationImpact.reset === "function") {
      validatedBOSActivationImpact.reset();
    }
    if (validatedCellLoad && typeof validatedCellLoad.reset === "function") {
      validatedCellLoad.reset();
    }
    if (validatedNetworkAssociation && typeof validatedNetworkAssociation.reset === "function") {
      validatedNetworkAssociation.reset();
    }
    if (validatedCivilianConnectivity && typeof validatedCivilianConnectivity.reset === "function") {
      validatedCivilianConnectivity.reset();
    }
    if (validatedCellCapacity && typeof validatedCellCapacity.reset === "function") {
      validatedCellCapacity.reset();
    }
    if (validatedHandoverVisualization && typeof validatedHandoverVisualization.reset === "function") {
      validatedHandoverVisualization.reset();
    }
    if (validatedCivilianConnectivityVisuals && typeof validatedCivilianConnectivityVisuals.reset === "function") {
      validatedCivilianConnectivityVisuals.reset();
    }
    if (validatedTowerLoadIndicators && typeof validatedTowerLoadIndicators.reset === "function") {
      validatedTowerLoadIndicators.reset();
    }
    if (validatedMission004Foundation && typeof validatedMission004Foundation.reset === "function") {
      validatedMission004Foundation.reset();
    }
    if (validatedMission004 && typeof validatedMission004.reset === "function") validatedMission004.reset();
    if (validatedNetworkInspection && typeof validatedNetworkInspection.reset === "function") {
      validatedNetworkInspection.reset();
    }
    if (validatedMission001Visuals && typeof validatedMission001Visuals.reset === "function") {
      validatedMission001Visuals.reset();
      if (typeof validatedMission001Visuals.setState === "function") {
        validatedMission001Visuals.setState("READY");
      }
    }
    if (validatedMissionRegistry && typeof validatedMissionRegistry.reset === "function") {
      validatedMissionRegistry.reset();
    }
    networkManager.reset();
    uiManager.updateAll(true);
    return true;
  }
};


function collectMissionBosReleaseRuntimeChecks() {
  return {
    geometryValidation: recoveryCity ? recoveryCity.validation : null,
    recoveryRenderManifest: recoveryCity ? recoveryCity.manifest : null,
    staticPropsValidation: recoveryStaticProps ? recoveryStaticProps.validation : null,
    staticPropsRenderManifest: recoveryStaticProps ? recoveryStaticProps.manifest : null,
    trafficValidation: validatedTraffic ? validatedTraffic.validation : null,
    trafficRenderManifest: validatedTraffic ? validatedTraffic.getManifest() : null,
    trafficRuntimeSafety: validatedTraffic ? validatedTraffic.getSafetyStatus() : null,
    pedestrianValidation: validatedPedestrians ? validatedPedestrians.validation : null,
    pedestrianRenderManifest: validatedPedestrians ? validatedPedestrians.getManifest() : null,
    pedestrianRuntimeSafety: validatedPedestrians ? validatedPedestrians.getSafetyStatus() : null,
    responseValidation: validatedResponseVehicles ? validatedResponseVehicles.validation : null,
    responseRenderManifest: validatedResponseVehicles ? validatedResponseVehicles.getManifest() : null,
    responseRuntimeSafety: validatedResponseVehicles ? validatedResponseVehicles.getSafetyStatus() : null,
    unifiedBosConnectivityValidation: validatedUnifiedBosConnectivityValidation,
    mission003ConnectivityParityPlanValidation: validatedMission003ConnectivityParityPlanValidation,
    mission003ConnectivityParityRuntimeValidation: validatedMission003ConnectivityParityRuntimeValidation,
    stadtwerkeBeaconPolishValidation: validatedStadtwerkeBeaconPolishValidation,
    unifiedBosConnectivityManifest: validatedUnifiedBosConnectivity ? validatedUnifiedBosConnectivity.getManifest() : null,
    unifiedBosConnectivitySafety: validatedUnifiedBosConnectivity ? validatedUnifiedBosConnectivity.getSafetyStatus() : null,
    unifiedFireSnapshot: validatedUnifiedBosConnectivity ? validatedUnifiedBosConnectivity.getEndpointSnapshot("NET_FIRE_01") : null,
    unifiedPoliceSnapshot: validatedUnifiedBosConnectivity ? validatedUnifiedBosConnectivity.getEndpointSnapshot("NET_POLICE_01") : null,
    unifiedAmbulanceSnapshot: validatedUnifiedBosConnectivity ? validatedUnifiedBosConnectivity.getEndpointSnapshot("NET_AMBULANCE_01") : null,
    unifiedStadtwerkeSnapshot: validatedUnifiedBosConnectivity ? validatedUnifiedBosConnectivity.getEndpointSnapshot("NET_STADTWERKE_01") : null,
    bosBackhaulManifest: validatedBosBackhaul ? validatedBosBackhaul.getManifest() : null,
    bosBackhaulSafety: validatedBosBackhaul ? validatedBosBackhaul.getSafetyStatus() : null,
    stadtwerkeFoundationValidation: validatedStadtwerkeFoundationValidation,
    stadtwerkeRenderManifest: validatedStadtwerkeVehicle ? validatedStadtwerkeVehicle.getManifest() : null,
    stadtwerkeRuntimeSafety: validatedStadtwerkeVehicle ? validatedStadtwerkeVehicle.getSafetyStatus() : null,
    incidentRuntimeSafety: validatedIncidentAccess ? validatedIncidentAccess.getSafetyStatus() : null,
    missionPlanValidation: validatedMission001PlanValidation,
    missionVisualManifest: validatedMission001Visuals ? validatedMission001Visuals.getManifest() : null,
    missionVisualSafety: validatedMission001Visuals ? validatedMission001Visuals.getSafetyStatus() : null,
    missionRuntimeSafety: validatedMission001 ? validatedMission001.getSafetyStatus() : null,
    mission003ResponseValidation: validatedMission003ResponseValidation,
    mission003PlanValidation: validatedMission003PlanValidation,
    mission003NetworkExtensionValidation: validatedMission003NetworkExtensionValidation,
    mission003RegistryExtensionValidation: validatedMission003RegistryExtensionValidation,
    mission003RuntimeSafety: validatedMission003 ? validatedMission003.getSafetyStatus() : null,
    mission003IntegrationValidation: validatedMission003IntegrationValidation,
    bosActivationImpactPlanValidation: validatedBOSActivationImpactPlanValidation,
    bosActivationImpactRuntimeSafety: validatedBOSActivationImpact ? validatedBOSActivationImpact.getSafetyStatus() : null,
    mission004FoundationPlanValidation: validatedMission004FoundationValidation,
    mission004FoundationRuntimeSafety: validatedMission004Foundation ? validatedMission004Foundation.getSafetyStatus() : null,
    mission004PlanValidation: validatedMission004PlanValidation,
    mission004NetworkExtensionValidation: validatedMission004NetworkExtensionValidation,
    mission004RegistryExtensionValidation: validatedMission004RegistryExtensionValidation,
    mission004RuntimeManifest: validatedMission004 ? validatedMission004.getManifest() : null,
    mission004RuntimeSafety: validatedMission004 ? validatedMission004.getSafetyStatus() : null,
    mission004ResponseSafety: validatedMission004Response ? validatedMission004Response.getSafetyStatus() : null,
    mission004ConnectivityManifest: validatedMission004Connectivity ? validatedMission004Connectivity.getManifest() : null,
    mission004ConnectivitySafety: validatedMission004Connectivity ? validatedMission004Connectivity.getSafetyStatus() : null,
    mission004IntegrationValidation: validatedMission004IntegrationValidation,
    build013M1CombinedValidation: validatedBuild013M1CombinedValidation,
    communicationValidation: validatedTelekomCommunication ? validatedTelekomCommunication.validation : null,
    communicationRenderManifest: validatedTelekomCommunication
      ? validatedTelekomCommunication.getManifest()
      : null,
    communicationRuntimeSafety: validatedTelekomCommunication
      ? validatedTelekomCommunication.getSafetyStatus()
      : null,
    presenterValidation: validatedPresenter ? validatedPresenter.validation : null,
    presenterManifest: validatedPresenter ? validatedPresenter.getManifest() : null,
    presenterRuntimeSafety: validatedPresenter ? validatedPresenter.getSafetyStatus() : null
  };
}

function runMissionBosReleaseAudit() {
  if (!RECOVERY_CONFIG.enableReleaseAudit) return null;

  if (
    !window.MISSION_BOS_RELEASE_PLAN ||
    !window.MissionBosReleaseValidator ||
    typeof window.MissionBosReleaseValidator.validate !== "function" ||
    typeof window.MissionBosReleaseValidator.logResult !== "function"
  ) {
    console.error(
      "Mission BOS release audit is unavailable. Expected city-release-plan.js and release-validator.js."
    );
    return null;
  }

  const result = window.MissionBosReleaseValidator.validate({
    plan: window.MISSION_BOS_RELEASE_PLAN,
    sources: {
      layout: window.MISSION_BOS_RECOVERY_LAYOUT,
      staticProps: window.MISSION_BOS_STATIC_PROPS,
      traffic: window.MISSION_BOS_TRAFFIC_PLAN,
      pedestrians: window.MISSION_BOS_PEDESTRIAN_PLAN,
      response: window.MISSION_BOS_RESPONSE_VEHICLE_PLAN,
      incident: window.MISSION_BOS_INCIDENT_RESPONSE_PLAN,
      mission: window.MISSION_BOS_MISSION_001_PLAN,
      missionScene: window.MISSION_BOS_MISSION_001_SCENE_PLAN,
      communication: window.MISSION_BOS_TELEKOM_COMMUNICATION_PLAN,
      presenter: window.MISSION_BOS_PRESENTER_PLAN
    },
    config: RECOVERY_CONFIG,
    documentRef: document,
    runtimeChecks: collectMissionBosReleaseRuntimeChecks()
  });

  validatedReleaseAudit = result;
  window.MissionBosReleaseValidator.logResult(result);

  if (!result || result.status !== "PASSED") {
    console.error(
      "Mission BOS Build 008R.12 release audit failed. The running demo was not modified."
    );
  }

  return result;
}

window.runMissionBosReleaseAudit = runMissionBosReleaseAudit;

/* -------------------------------------------------------------------------- */
/* Initialisierung                                                            */
/* -------------------------------------------------------------------------- */

initLights();
createSkyDome();

if (RECOVERY_CONFIG.useRecoveryCity) {
  recoveryCity = window.MissionBosRecoveryRenderer.createCity({
    scene,
    layout: window.MISSION_BOS_RECOVERY_LAYOUT,
    validator: window.MissionBosGeometryValidator,
    showDebugLabels: false,
    showCollisionOverlays: false
  });

  stationManager.init(recoveryCity);
  towerGroup = recoveryCity.primaryTowerGroup;
  towerBeacon = recoveryCity.primaryTowerBeacon;
  towerBeaconGlow = recoveryCity.primaryTowerGlow;

  if (RECOVERY_CONFIG.enableStaticProps) {
    recoveryStaticProps = window.MissionBosStaticPropsRenderer.create({
      scene,
      recoveryCity,
      layout: window.MISSION_BOS_RECOVERY_LAYOUT,
      plan: window.MISSION_BOS_STATIC_PROPS,
      validator: window.MissionBosStaticPropsValidator
    });
  }

  if (RECOVERY_CONFIG.enableValidatedTraffic) {
    validatedTraffic = window.MissionBosTrafficRenderer.create({
      scene,
      layout: window.MISSION_BOS_RECOVERY_LAYOUT,
      propsPlan: window.MISSION_BOS_STATIC_PROPS,
      plan: window.MISSION_BOS_TRAFFIC_PLAN,
      validator: window.MissionBosTrafficValidator
    });
  }

  if (RECOVERY_CONFIG.enableValidatedPedestrians) {
    if (
      !window.MISSION_BOS_PEDESTRIAN_PLAN ||
      !window.MissionBosPedestrianValidator ||
      !window.MissionBosPedestrianRenderer
    ) {
      throw new Error(
        "Validated pedestrian files are missing. Expected city-pedestrian-plan.js, " +
        "pedestrian-validator.js and city-pedestrian-renderer.js."
      );
    }

    validatedPedestrians = window.MissionBosPedestrianRenderer.create({
      scene: scene,
      layout: window.MISSION_BOS_RECOVERY_LAYOUT,
      propsPlan: window.MISSION_BOS_STATIC_PROPS,
      trafficPlan: window.MISSION_BOS_TRAFFIC_PLAN,
      plan: window.MISSION_BOS_PEDESTRIAN_PLAN,
      validator: window.MissionBosPedestrianValidator
    });
  }

  if (RECOVERY_CONFIG.enableValidatedResponseVehicles) {
    if (
      !window.MISSION_BOS_RESPONSE_VEHICLE_PLAN ||
      !window.MissionBosResponseVehicleValidator ||
      !window.MISSION_BOS_INCIDENT_RESPONSE_PLAN ||
      !window.MissionBosIncidentResponseValidator ||
      !window.MissionBosResponseVehicleRenderer
    ) {
      throw new Error(
        "Validated incident response files are missing. Expected the R.6 response base, " +
        "city-incident-response-plan.js, incident-response-validator.js and " +
        "city-response-vehicle-renderer.js."
      );
    }

    if (!validatedTraffic || !validatedPedestrians) {
      throw new Error(
        "Validated response vehicles require validated traffic and pedestrian runtimes."
      );
    }

    validatedResponseVehicles = window.MissionBosResponseVehicleRenderer.create({
      scene: scene,
      layout: window.MISSION_BOS_RECOVERY_LAYOUT,
      propsPlan: window.MISSION_BOS_STATIC_PROPS,
      trafficPlan: window.MISSION_BOS_TRAFFIC_PLAN,
      pedestrianPlan: window.MISSION_BOS_PEDESTRIAN_PLAN,
      plan: window.MISSION_BOS_INCIDENT_RESPONSE_PLAN,
      validator: window.MissionBosIncidentResponseValidator,
      trafficRuntime: validatedTraffic,
      pedestrianRuntime: validatedPedestrians
    });
  }

  if (RECOVERY_CONFIG.enableValidatedAmbulanceFoundation) {
    const ambulanceDependenciesAvailable =
      !!window.MISSION_BOS_AMBULANCE_PLAN &&
      !!window.MissionBosAmbulanceValidator &&
      !!window.MissionBosAmbulanceRenderer &&
      !!window.MISSION_BOS_AMBULANCE_NETWORK_EXTENSION &&
      !!validatedTraffic &&
      !!validatedPedestrians &&
      !!validatedResponseVehicles;

    if (!ambulanceDependenciesAvailable) {
      console.error(
        "Validated ambulance foundation files or runtimes are missing. Mission 001 remains available without the ambulance foundation."
      );
    } else {
      validatedAmbulance = window.MissionBosAmbulanceRenderer.create({
        scene: scene,
        layout: window.MISSION_BOS_RECOVERY_LAYOUT,
        propsPlan: window.MISSION_BOS_STATIC_PROPS,
        trafficPlan: window.MISSION_BOS_TRAFFIC_PLAN,
        pedestrianPlan: window.MISSION_BOS_PEDESTRIAN_PLAN,
        plan: window.MISSION_BOS_AMBULANCE_PLAN,
        validator: window.MissionBosAmbulanceValidator,
        trafficRuntime: validatedTraffic,
        pedestrianRuntime: validatedPedestrians,
        responseRuntime: validatedResponseVehicles
      });

      const ambulanceManifest = validatedAmbulance.getManifest();
      const ambulanceSafety = validatedAmbulance.getSafetyStatus();
      if (!ambulanceManifest || ambulanceManifest.status !== "PASSED" ||
          !ambulanceSafety || ambulanceSafety.status !== "PASSED") {
        console.error("Validated ambulance renderer is unavailable; no unsafe fallback vehicle was created.");
      } else {
        combinedNetworkVehicleRuntime = {
          vehiclesById: Object.assign(
            Object.create(null),
            validatedResponseVehicles.vehiclesById,
            validatedAmbulance.vehiclesById
          )
        };

        const incidentReferencePlan = window.MISSION_BOS_INCIDENT_RESPONSE_PLAN;
        const ambulanceVehicleReference = Object.freeze(Object.assign(
          {},
          window.MISSION_BOS_AMBULANCE_PLAN.vehicle,
          { routeId: window.MISSION_BOS_AMBULANCE_PLAN.routes[0].id }
        ));
        combinedNetworkReferencePlan = Object.freeze(Object.assign(
          {},
          incidentReferencePlan,
          {
            vehicles: Object.freeze((incidentReferencePlan.vehicles || []).concat([ambulanceVehicleReference])),
            routes: Object.freeze((incidentReferencePlan.routes || []).concat(window.MISSION_BOS_AMBULANCE_PLAN.routes || []))
          }
        ));
      }
    }
  }

  if (window.MISSION_BOS_NETWORK_REALISM_PLAN && window.MissionBosNetworkRealismValidator) {
    validatedNetworkRealismValidation = window.MissionBosNetworkRealismValidator.validate({
      // The 012M.x validator remains a regression check for the frozen 013M.1
      // network baseline. Mission 004's additive endpoints are validated by the
      // dedicated 013M.2 network-extension validator below.
      plan: window.MISSION_BOS_NETWORK_REALISM_PLAN_013M1_BASELINE || window.MISSION_BOS_NETWORK_REALISM_PLAN,
      references: {
        traffic: (window.MISSION_BOS_TRAFFIC_PLAN.vehicles || []).map((item) => item.id),
        pedestrians: (window.MISSION_BOS_PEDESTRIAN_PLAN.pedestrians || []).map((item) => item.id),
        mission1Spectators: (window.MISSION_BOS_MISSION_001_SCENE_PLAN.actors || [])
          .filter((item) => item.role === "spectator").map((item) => item.id),
        arenaVisitors: (window.MISSION_BOS_ARENA_EVENT_PLAN.crowd || []).map((item) => item.id),
        utility: ["STADTWERKE_01"],
        mission3Bystanders: ((window.MISSION_BOS_MISSION_003_PLAN || {}).scene || {}).bystanders
          ? window.MISSION_BOS_MISSION_003_PLAN.scene.bystanders.map((item) => item.id) : []
      }
    });
    window.MissionBosNetworkRealismValidator.logResult(validatedNetworkRealismValidation);
    window.MissionBosNetworkRealismValidation = validatedNetworkRealismValidation;
  } else {
    console.error("Network realism plan or validator is missing.");
  }

  if (window.MISSION_BOS_BOS_ACTIVATION_IMPACT_PLAN &&
      window.MissionBosBOSActivationImpactValidator &&
      window.MISSION_BOS_NETWORK_REALISM_PLAN) {
    validatedBOSActivationImpactPlanValidation = window.MissionBosBOSActivationImpactValidator.validate(
      window.MISSION_BOS_BOS_ACTIVATION_IMPACT_PLAN,
      window.MISSION_BOS_NETWORK_REALISM_PLAN
    );
    window.MissionBosBOSActivationImpactValidator.logResult(validatedBOSActivationImpactPlanValidation);
    window.MissionBosBOSActivationImpactPlanValidation = validatedBOSActivationImpactPlanValidation;
  } else {
    validatedBOSActivationImpactPlanValidation = { status: "FAILED", errors: ["Activation-impact plan or validator is missing."] };
    console.error("BOS activation-impact validation is unavailable. Existing missions remain fail-soft available.");
  }

  if (window.MISSION_BOS_MISSION_004_FOUNDATION_PLAN &&
      window.MissionBosMission004FoundationValidator &&
      window.MISSION_BOS_RECOVERY_LAYOUT) {
    validatedMission004FoundationValidation = window.MissionBosMission004FoundationValidator.validate(
      window.MISSION_BOS_RECOVERY_LAYOUT,
      window.MISSION_BOS_MISSION_004_FOUNDATION_PLAN
    );
    window.MissionBosMission004FoundationValidator.logResult(validatedMission004FoundationValidation);
    window.MissionBosMission004FoundationValidation = validatedMission004FoundationValidation;
  } else {
    validatedMission004FoundationValidation = { status: "FAILED", errors: ["Mission 004 foundation plan or validator is missing."] };
    console.error("Mission 004 foundation validation is unavailable. Existing missions remain unaffected.");
  }

  if (window.MISSION_BOS_MISSION_004_PLAN && window.MissionBosMission004Validator &&
      window.MISSION_BOS_MISSION_004_FOUNDATION_PLAN && window.MISSION_BOS_RECOVERY_LAYOUT &&
      window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN && window.MissionBosNetworkRadioModel) {
    validatedMission004PlanValidation = window.MissionBosMission004Validator.validate(
      window.MISSION_BOS_MISSION_004_PLAN,
      window.MISSION_BOS_MISSION_004_FOUNDATION_PLAN,
      window.MISSION_BOS_RECOVERY_LAYOUT,
      window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN,
      window.MissionBosNetworkRadioModel
    );
    window.MissionBosMission004Validator.logResult(validatedMission004PlanValidation);
    window.MissionBosMission004PlanValidation = validatedMission004PlanValidation;
  } else {
    validatedMission004PlanValidation = { status: "FAILED", errors: ["Mission 004 full-runtime plan validation is unavailable."] };
    console.error("Mission 004 full-runtime plan validation is unavailable. Missions 001-003 remain available fail-soft.");
  }

  if (validatedMission004PlanValidation && validatedMission004PlanValidation.status === "PASSED" &&
      window.MISSION_BOS_MISSION_004_CORRECTION_CONTRACT && window.MissionBosMission004CorrectionContractValidator) {
    validatedMission004CorrectionContractValidation = window.MissionBosMission004CorrectionContractValidator.validate(
      window.MISSION_BOS_MISSION_004_CORRECTION_CONTRACT,
      window.MISSION_BOS_MISSION_004_PLAN
    );
    window.MissionBosMission004CorrectionContractValidator.logResult(validatedMission004CorrectionContractValidation);
    window.MissionBosMission004CorrectionContractValidation = validatedMission004CorrectionContractValidation;
  } else {
    validatedMission004CorrectionContractValidation = { status: "FAILED", errors: ["Mission 004 correction contract validation is unavailable."] };
  }

  if (validatedMission004PlanValidation && validatedMission004PlanValidation.status === "PASSED" &&
      window.MISSION_BOS_MISSION_004_RETURN_MANEUVER_CONTRACT && window.MissionBosMission004ReturnManeuverContractValidator) {
    validatedMission004ReturnManeuverContractValidation = window.MissionBosMission004ReturnManeuverContractValidator.validate(
      window.MISSION_BOS_MISSION_004_RETURN_MANEUVER_CONTRACT,
      window.MISSION_BOS_MISSION_004_PLAN
    );
    window.MissionBosMission004ReturnManeuverContractValidator.logResult(validatedMission004ReturnManeuverContractValidation);
    window.MissionBosMission004ReturnManeuverContractValidation = validatedMission004ReturnManeuverContractValidation;
  } else {
    validatedMission004ReturnManeuverContractValidation = { status: "FAILED", errors: ["Mission 004 return-maneuver contract validation is unavailable."] };
  }

  if (validatedMission004PlanValidation && validatedMission004PlanValidation.status === "PASSED" &&
      window.MissionBosMission004TrafficSweptPathValidator && window.MissionBosMission004ResponseController) {
    validatedMission004TrafficSweptPathValidation = window.MissionBosMission004TrafficSweptPathValidator.validate({
      missionPlan: window.MISSION_BOS_MISSION_004_PLAN,
      trafficPlan: window.MISSION_BOS_TRAFFIC_PLAN,
      trafficValidator: window.MissionBosTrafficValidator,
      responseValidator: window.MissionBosResponseVehicleValidator,
      responseController: window.MissionBosMission004ResponseController
    });
    window.MissionBosMission004TrafficSweptPathValidator.logResult(validatedMission004TrafficSweptPathValidation);
    window.MissionBosMission004TrafficSweptPathValidation = validatedMission004TrafficSweptPathValidation;
  } else {
    validatedMission004TrafficSweptPathValidation = { status: "FAILED", errors: ["Mission 004 swept-path validation is unavailable."] };
  }

  if (validatedMission004PlanValidation && validatedMission004PlanValidation.status === "PASSED" &&
      window.MissionBosMission004ReturnRouteValidator) {
    validatedMission004ReturnRouteValidation = window.MissionBosMission004ReturnRouteValidator.validate({
      missionPlan: window.MISSION_BOS_MISSION_004_PLAN,
      responsePlan: window.MISSION_BOS_RESPONSE_VEHICLE_PLAN,
      responseValidator: window.MissionBosResponseVehicleValidator
    });
    window.MissionBosMission004ReturnRouteValidator.logResult(validatedMission004ReturnRouteValidation);
    window.MissionBosMission004ReturnRouteValidation = validatedMission004ReturnRouteValidation;
  } else {
    validatedMission004ReturnRouteValidation = { status: "FAILED", errors: ["Mission 004 return-route validation is unavailable."] };
  }

  if (validatedMission004PlanValidation && validatedMission004PlanValidation.status === "PASSED" &&
      window.MissionBosMission004TrafficClosureRegressionValidator && window.MissionBosMission004ResponseController) {
    validatedMission004TrafficClosureRegressionValidation = window.MissionBosMission004TrafficClosureRegressionValidator.validate({
      missionPlan: window.MISSION_BOS_MISSION_004_PLAN,
      trafficPlan: window.MISSION_BOS_TRAFFIC_PLAN,
      responsePlan: window.MISSION_BOS_RESPONSE_VEHICLE_PLAN,
      ambulancePlan: window.MISSION_BOS_AMBULANCE_PLAN,
      trafficValidator: window.MissionBosTrafficValidator,
      responseValidator: window.MissionBosResponseVehicleValidator,
      responseController: window.MissionBosMission004ResponseController,
      sweptPathValidator: window.MissionBosMission004TrafficSweptPathValidator
    });
    window.MissionBosMission004TrafficClosureRegressionValidator.logResult(validatedMission004TrafficClosureRegressionValidation);
    window.MissionBosMission004TrafficClosureRegressionValidation = validatedMission004TrafficClosureRegressionValidation;
  } else {
    validatedMission004TrafficClosureRegressionValidation = { status: "FAILED", errors: ["Mission 004 traffic-closure regression validation is unavailable."] };
  }

  if (window.MISSION_BOS_MISSION_004_NETWORK_EXTENSION && window.MissionBosMission004NetworkExtensionValidator) {
    validatedMission004NetworkExtensionValidation = window.MissionBosMission004NetworkExtensionValidator.validate(
      window.MISSION_BOS_MISSION_004_NETWORK_EXTENSION,
      window.MISSION_BOS_MISSION_004_PLAN
    );
    window.MissionBosMission004NetworkExtensionValidator.logResult(validatedMission004NetworkExtensionValidation);
    window.MissionBosMission004NetworkExtensionValidation = validatedMission004NetworkExtensionValidation;
  } else {
    validatedMission004NetworkExtensionValidation = { status: "FAILED", errors: ["Mission 004 network extension validation is unavailable."] };
  }

  if (window.MISSION_BOS_MISSION_004_REGISTRY_EXTENSION && window.MissionBosMission004RegistryExtensionValidator) {
    validatedMission004RegistryExtensionValidation = window.MissionBosMission004RegistryExtensionValidator.validate(
      window.MISSION_BOS_MISSION_004_REGISTRY_EXTENSION
    );
    window.MissionBosMission004RegistryExtensionValidator.logResult(validatedMission004RegistryExtensionValidation);
    window.MissionBosMission004RegistryExtensionValidation = validatedMission004RegistryExtensionValidation;
  } else {
    validatedMission004RegistryExtensionValidation = { status: "FAILED", errors: ["Mission 004 registry extension validation is unavailable."] };
  }

  if (window.MissionBosBuild013M1CombinedValidator &&
      window.MISSION_BOS_BOS_ACTIVATION_IMPACT_PLAN &&
      window.MISSION_BOS_MISSION_004_FOUNDATION_PLAN) {
    validatedBuild013M1CombinedValidation = window.MissionBosBuild013M1CombinedValidator.validate(
      window.MISSION_BOS_BOS_ACTIVATION_IMPACT_PLAN,
      window.MISSION_BOS_MISSION_004_FOUNDATION_PLAN
    );
    window.MissionBosBuild013M1CombinedValidator.logResult(validatedBuild013M1CombinedValidation);
    window.MissionBosBuild013M1CombinedValidation = validatedBuild013M1CombinedValidation;
  } else {
    validatedBuild013M1CombinedValidation = { status: "FAILED", errors: ["Combined 013M.1 validator is missing."] };
    console.error("Combined Build 013M.1 validation is unavailable. Existing missions remain unaffected.");
  }

  if (validatedMission004FoundationValidation &&
      validatedMission004FoundationValidation.status === "PASSED" &&
      validatedMission004PlanValidation && validatedMission004PlanValidation.status === "PASSED" &&
      validatedBuild013M1CombinedValidation && validatedBuild013M1CombinedValidation.status === "PASSED" &&
      window.MissionBosMission004SceneRenderer) {
    validatedMission004Foundation = window.MissionBosMission004SceneRenderer.create({
      scene: scene,
      plan: window.MISSION_BOS_MISSION_004_PLAN,
      validation: validatedMission004PlanValidation,
      layout: window.MISSION_BOS_RECOVERY_LAYOUT,
      responseFoundationPlan: window.MISSION_BOS_RESPONSE_VEHICLE_PLAN,
      responseReferencePlan: window.MISSION_BOS_INCIDENT_RESPONSE_PLAN,
      ambulancePlan: window.MISSION_BOS_AMBULANCE_PLAN,
      routeHelper: window.MissionBosResponseVehicleValidator
    });
    const mission004FoundationManifest = validatedMission004Foundation.getManifest();
    const mission004FoundationSafety = validatedMission004Foundation.getSafetyStatus();
    if (!mission004FoundationManifest || mission004FoundationManifest.status !== "PASSED" ||
        !mission004FoundationSafety || mission004FoundationSafety.status !== "PASSED") {
      console.error("Mission 004 foundation runtime failed. It remains hidden and the three existing missions remain available.");
      if (validatedMission004Foundation && typeof validatedMission004Foundation.dispose === "function") {
        validatedMission004Foundation.dispose();
      }
      validatedMission004Foundation = null;
    } else {
      window.MissionBosMission004FoundationRuntime = validatedMission004Foundation;
    }
  } else if (validatedMission004FoundationValidation && validatedMission004FoundationValidation.status === "PASSED") {
    console.error("Mission 004 foundation renderer is missing. Mission 004 remains unavailable as required.");
  }

  if (window.MISSION_BOS_MISSION_001_NETWORK_POLISH_PLAN &&
      window.MissionBosMission001NetworkPolishValidator &&
      window.MISSION_BOS_NETWORK_REALISM_PLAN) {
    validatedMission001NetworkPolishValidation = window.MissionBosMission001NetworkPolishValidator.validate({
      plan: window.MISSION_BOS_MISSION_001_NETWORK_POLISH_PLAN,
      networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN
    });
    window.MissionBosMission001NetworkPolishValidator.logResult(validatedMission001NetworkPolishValidation);
    window.MissionBosMission001NetworkPolishValidation = validatedMission001NetworkPolishValidation;
  } else {
    console.error("Mission 001 network-polish plan or validator is missing.");
  }

  if (window.MISSION_BOS_NETWORK_RECOVERY_PLAN && window.MissionBosNetworkRecoveryValidator &&
      window.MISSION_BOS_NETWORK_REALISM_PLAN && window.MISSION_BOS_MISSION_001_NETWORK_POLISH_PLAN) {
    validatedNetworkRecovery = window.MissionBosNetworkRecoveryValidator.validate(
      window.MISSION_BOS_NETWORK_RECOVERY_PLAN,
      window.MISSION_BOS_NETWORK_REALISM_PLAN,
      window.MISSION_BOS_MISSION_001_NETWORK_POLISH_PLAN
    );
    window.MissionBosNetworkRecoveryValidator.logResult(validatedNetworkRecovery);
    window.MissionBosNetworkRecoveryValidation = validatedNetworkRecovery;
    networkRecoveryPolishEnabled = validatedNetworkRecovery && validatedNetworkRecovery.status === "PASSED";
  } else {
    validatedNetworkRecovery = { status: "FAILED", errors: ["Network recovery plan or validator is missing."] };
    networkRecoveryPolishEnabled = false;
    console.error("Network recovery validation is unavailable. Recovery polish is disabled fail-soft; missions remain available.");
  }

  if (window.MISSION_BOS_MISSION_003_CONNECTIVITY_RECOVERY_PLAN &&
      window.MissionBosMission003ConnectivityRecoveryValidator) {
    validatedMission003ConnectivityRecoveryPlanValidation =
      window.MissionBosMission003ConnectivityRecoveryValidator.validatePlan(
        window.MISSION_BOS_MISSION_003_CONNECTIVITY_RECOVERY_PLAN
      );
    window.MissionBosMission003ConnectivityRecoveryValidator.logResult(
      validatedMission003ConnectivityRecoveryPlanValidation
    );
    window.MissionBosMission003ConnectivityRecoveryPlanValidation =
      validatedMission003ConnectivityRecoveryPlanValidation;
  } else {
    validatedMission003ConnectivityRecoveryPlanValidation = {
      status: "FAILED",
      errors: ["Mission 003 connectivity recovery plan or validator is missing."]
    };
    console.error("Mission 003 connectivity recovery plan validation is unavailable. Missions remain fail-soft available.");
  }

  if (window.MISSION_BOS_UNIFIED_BOS_CONNECTIVITY_PLAN &&
      window.MissionBosUnifiedBosConnectivityValidator) {
    validatedUnifiedBosConnectivityValidation =
      window.MissionBosUnifiedBosConnectivityValidator.validate(
        window.MISSION_BOS_UNIFIED_BOS_CONNECTIVITY_PLAN
      );
    window.MissionBosUnifiedBosConnectivityValidator.logResult(
      validatedUnifiedBosConnectivityValidation
    );
    window.MissionBosUnifiedBosConnectivityValidation = validatedUnifiedBosConnectivityValidation;
    unifiedBosConnectivityEnabled = validatedUnifiedBosConnectivityValidation.status === "PASSED" &&
      validatedMission003ConnectivityRecoveryPlanValidation &&
      validatedMission003ConnectivityRecoveryPlanValidation.status === "PASSED";
  } else {
    validatedUnifiedBosConnectivityValidation = {
      status: "FAILED",
      errors: ["Unified BOS connectivity plan or validator is missing."]
    };
    unifiedBosConnectivityEnabled = false;
    console.error("Unified BOS connectivity validation is unavailable. Mission controls remain fail-soft available.");
  }

  if (window.MISSION_BOS_MISSION_003_CONNECTIVITY_PARITY_PLAN &&
      window.MissionBosMission003ConnectivityParityValidator &&
      window.MISSION_BOS_UNIFIED_BOS_CONNECTIVITY_PLAN) {
    validatedMission003ConnectivityParityPlanValidation =
      window.MissionBosMission003ConnectivityParityValidator.validatePlan(
        window.MISSION_BOS_MISSION_003_CONNECTIVITY_PARITY_PLAN,
        window.MISSION_BOS_UNIFIED_BOS_CONNECTIVITY_PLAN,
        window.MISSION_BOS_MISSION_003_CONNECTIVITY_RECOVERY_PLAN
      );
    window.MissionBosMission003ConnectivityParityValidator.logResult(
      validatedMission003ConnectivityParityPlanValidation
    );
    window.MissionBosMission003ConnectivityParityPlanValidation =
      validatedMission003ConnectivityParityPlanValidation;
  } else {
    validatedMission003ConnectivityParityPlanValidation = {
      status: "FAILED",
      errors: ["Mission 003 connectivity parity plan or validator is missing."]
    };
    console.error("Mission 003 connectivity parity plan validation is unavailable. Missions remain fail-soft available.");
  }

  if (window.MISSION_BOS_STADTWERKE_BEACON_POLISH_PLAN &&
      window.MissionBosStadtwerkeBeaconPolishValidator) {
    validatedStadtwerkeBeaconPolishValidation =
      window.MissionBosStadtwerkeBeaconPolishValidator.validate(
        window.MISSION_BOS_STADTWERKE_BEACON_POLISH_PLAN
      );
    window.MissionBosStadtwerkeBeaconPolishValidator.logResult(
      validatedStadtwerkeBeaconPolishValidation
    );
    window.MissionBosStadtwerkeBeaconPolishValidation = validatedStadtwerkeBeaconPolishValidation;
    stadtwerkeBeaconPolishEnabled = validatedStadtwerkeBeaconPolishValidation.status === "PASSED";
  } else {
    validatedStadtwerkeBeaconPolishValidation = {
      status: "FAILED",
      errors: ["Stadtwerke beacon-polish plan or validator is missing."]
    };
    stadtwerkeBeaconPolishEnabled = false;
    console.error("Stadtwerke beacon-polish validation is unavailable. Mission 003 remains fail-soft available.");
  }

  // Historical Mission-001 parity files remain archived but are superseded by the unified 012M.4 recovery contract.
  validatedMission001ConnectivityParityValidation = null;

  if (window.MISSION_BOS_MISSION_003_STADTWERKE_FOUNDATION_PLAN &&
      window.MissionBosMission003StadtwerkeFoundationValidator &&
      window.MISSION_BOS_RECOVERY_LAYOUT) {
    validatedStadtwerkeFoundationValidation =
      window.MissionBosMission003StadtwerkeFoundationValidator.validate(
        window.MISSION_BOS_MISSION_003_STADTWERKE_FOUNDATION_PLAN,
        window.MISSION_BOS_RECOVERY_LAYOUT
      );
    window.MissionBosMission003StadtwerkeFoundationValidator.logResult(
      validatedStadtwerkeFoundationValidation
    );
    window.MissionBosMission003StadtwerkeFoundationValidation =
      validatedStadtwerkeFoundationValidation;
  } else {
    validatedStadtwerkeFoundationValidation = {
      status: "FAILED",
      errors: ["Stadtwerke foundation plan, validator or layout is missing."]
    };
    console.error(
      "Stadtwerke foundation validation is unavailable. Mission 001, Mission 002 and the network remain active."
    );
  }

  if (window.MISSION_BOS_MISSION_003_RESPONSE_PLAN && window.MissionBosMission003ResponseValidator) {
    validatedMission003ResponseValidation = window.MissionBosMission003ResponseValidator.validate(
      window.MISSION_BOS_MISSION_003_RESPONSE_PLAN,
      window.MISSION_BOS_RECOVERY_LAYOUT,
      window.MISSION_BOS_RESPONSE_VEHICLE_PLAN,
      window.MISSION_BOS_TRAFFIC_PLAN,
      window.MISSION_BOS_MISSION_003_STADTWERKE_FOUNDATION_PLAN
    );
    window.MissionBosMission003ResponseValidator.logResult(validatedMission003ResponseValidation);
  }
  if (window.MISSION_BOS_MISSION_003_PLAN && window.MissionBosMission003WaterLeakValidator) {
    validatedMission003PlanValidation = window.MissionBosMission003WaterLeakValidator.validate(
      window.MISSION_BOS_MISSION_003_PLAN,
      window.MISSION_BOS_MISSION_003_RESPONSE_PLAN,
      window.MISSION_BOS_RECOVERY_LAYOUT,
      window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN,
      window.MISSION_BOS_NETWORK_REALISM_PLAN,
      window.MissionBosNetworkRadioModel
    );
    window.MissionBosMission003WaterLeakValidator.logResult(validatedMission003PlanValidation);
  }
  if (window.MISSION_BOS_MISSION_003_NETWORK_EXTENSION && window.MissionBosMission003NetworkExtensionValidator) {
    validatedMission003NetworkExtensionValidation = window.MissionBosMission003NetworkExtensionValidator.validate(
      window.MISSION_BOS_MISSION_003_NETWORK_EXTENSION,
      (window.MISSION_BOS_MISSION_004_NETWORK_EXTENSION && window.MISSION_BOS_MISSION_004_NETWORK_EXTENSION.baselinePlan) || window.MISSION_BOS_NETWORK_REALISM_PLAN,
      window.MISSION_BOS_MISSION_003_PLAN
    );
    window.MissionBosMission003NetworkExtensionValidator.logResult(validatedMission003NetworkExtensionValidation);
  }
  if (window.MISSION_BOS_MISSION_003_REGISTRY_EXTENSION && window.MissionBosMission003RegistryExtensionValidator) {
    validatedMission003RegistryExtensionValidation = window.MissionBosMission003RegistryExtensionValidator.validate(
      window.MISSION_BOS_MISSION_003_REGISTRY_EXTENSION,
      (window.MISSION_BOS_MISSION_004_REGISTRY_EXTENSION && window.MISSION_BOS_MISSION_004_REGISTRY_EXTENSION.baselinePlan) || window.MISSION_BOS_MISSION_REGISTRY_PLAN,
      window.MISSION_BOS_MISSION_001_PLAN,
      window.MISSION_BOS_MISSION_002_PLAN,
      window.MISSION_BOS_MISSION_003_PLAN
    );
    window.MissionBosMission003RegistryExtensionValidator.logResult(validatedMission003RegistryExtensionValidation);
  }

  if (validatedStadtwerkeFoundationValidation &&
      validatedStadtwerkeFoundationValidation.status === "PASSED" &&
      window.MissionBosStadtwerkeVehicleRenderer) {
    validatedStadtwerkeVehicle = window.MissionBosStadtwerkeVehicleRenderer.create({
      scene: scene,
      layout: window.MISSION_BOS_RECOVERY_LAYOUT,
      plan: window.MISSION_BOS_MISSION_003_STADTWERKE_FOUNDATION_PLAN,
      responsePlan: window.MISSION_BOS_RESPONSE_VEHICLE_PLAN,
      incidentPlan: window.MISSION_BOS_INCIDENT_RESPONSE_PLAN,
      mission003ResponsePlan: window.MISSION_BOS_MISSION_003_RESPONSE_PLAN,
      beaconPolishPlan: stadtwerkeBeaconPolishEnabled
        ? window.MISSION_BOS_STADTWERKE_BEACON_POLISH_PLAN : null
    });
    const stadtwerkeManifest = validatedStadtwerkeVehicle.getManifest();
    const stadtwerkeSafety = validatedStadtwerkeVehicle.getSafetyStatus();
    if (!stadtwerkeManifest || stadtwerkeManifest.status !== "PASSED" ||
        !stadtwerkeSafety || stadtwerkeSafety.status !== "PASSED") {
      console.error(
        "Stadtwerke vehicle foundation failed its runtime checks. Existing missions and network systems remain active."
      );
      if (validatedStadtwerkeVehicle && typeof validatedStadtwerkeVehicle.dispose === "function") {
        validatedStadtwerkeVehicle.dispose();
      }
      validatedStadtwerkeVehicle = null;
    }
  } else if (validatedStadtwerkeFoundationValidation &&
             validatedStadtwerkeFoundationValidation.status === "PASSED") {
    console.error(
      "Stadtwerke vehicle renderer is missing. Existing missions and network systems remain active."
    );
  }

  if (RECOVERY_CONFIG.enableLocalCellLoad) {
    const cellLoadDependenciesAvailable =
      !!window.MISSION_BOS_CELL_LOAD_PLAN &&
      !!window.MissionBosCellLoadValidator &&
      !!window.MissionBosCellLoadController &&
      !!window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN &&
      !!window.MissionBosNetworkRadioModel &&
      !!window.MISSION_BOS_MISSION_001_PLAN &&
      !!window.MISSION_BOS_MISSION_002_PLAN &&
      !!window.MISSION_BOS_MISSION_001_SCENE_PLAN &&
      !!window.MISSION_BOS_ARENA_EVENT_PLAN &&
      !!window.MISSION_BOS_INCIDENT_RESPONSE_PLAN;

    if (!cellLoadDependenciesAvailable) {
      console.error(
        "Local cell-load files are missing. Expected plan, validator, controller and frozen mission sources."
      );
    } else {
      validatedCellLoad = window.MissionBosCellLoadController.create({
        layout: window.MISSION_BOS_RECOVERY_LAYOUT,
        missionPlan: window.MISSION_BOS_MISSION_001_PLAN,
        mission002Plan: window.MISSION_BOS_MISSION_002_PLAN,
        scenePlan: window.MISSION_BOS_MISSION_001_SCENE_PLAN,
        arenaPlan: window.MISSION_BOS_ARENA_EVENT_PLAN,
        incidentPlan: window.MISSION_BOS_INCIDENT_RESPONSE_PLAN,
        associationPlan: window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN_009N7_BASELINE || window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN,
        plan: window.MISSION_BOS_CELL_LOAD_PLAN,
        validator: window.MissionBosCellLoadValidator,
        recoveryPlan: networkRecoveryPolishEnabled ? window.MISSION_BOS_NETWORK_RECOVERY_PLAN : null,
        networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN,
        mission003Plan: window.MISSION_BOS_MISSION_003_PLAN,
        mission004Plan: window.MISSION_BOS_MISSION_004_PLAN,
        recoveryEnabled: networkRecoveryPolishEnabled,
        additionalDynamicCivilianSources: [].concat(
          window.MISSION_BOS_ARENA_EVENT_PLAN ? window.MISSION_BOS_ARENA_EVENT_PLAN.dynamicLoadSources || [] : [],
          window.MISSION_BOS_MISSION_003_PLAN ? window.MISSION_BOS_MISSION_003_PLAN.network.dynamicLoadSources || [] : [],
          window.MISSION_BOS_MISSION_004_PLAN ? [{
            id: window.MISSION_BOS_MISSION_004_PLAN.network.dynamicLoadSourceId,
            maxDemandUnits: window.MISSION_BOS_MISSION_004_PLAN.network.dynamicCivilianDemandUnits
          }] : []
        )
      });

      const cellLoadManifest = validatedCellLoad.getManifest();
      const cellLoadSafety = validatedCellLoad.getSafetyStatus();
      if (!cellLoadManifest || cellLoadManifest.status !== "PASSED" ||
          !cellLoadSafety || cellLoadSafety.status !== "PASSED") {
        console.error("Local cell-load runtime is unavailable; dynamic association will remain disabled.");
      }
    }
  }

  if (RECOVERY_CONFIG.enableDynamicNetworkAssociation) {
    const associationDependenciesAvailable =
      !!window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN &&
      !!window.MissionBosNetworkRadioModel &&
      !!window.MissionBosNetworkAssociationValidator &&
      !!window.MissionBosNetworkAssociationController &&
      !!window.MISSION_BOS_MISSION_001_SCENE_PLAN &&
      !!window.MISSION_BOS_CELL_LOAD_PLAN &&
      !!validatedCellLoad &&
      !!validatedResponseVehicles &&
      !!validatedAmbulance &&
      !!combinedNetworkVehicleRuntime &&
      !!combinedNetworkReferencePlan;

    if (!associationDependenciesAvailable) {
      console.error(
        "Dynamic network association files or runtimes are missing. Expected association plan, " +
        "validator, controller, mission scene plan and validated response vehicles."
      );
    } else {
      validatedNetworkAssociation = window.MissionBosNetworkAssociationController.create({
        layout: window.MISSION_BOS_RECOVERY_LAYOUT,
        plan: window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN,
        networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN,
        validator: window.MissionBosNetworkAssociationValidator,
        radioModel: window.MissionBosNetworkRadioModel,
        responseRuntime: combinedNetworkVehicleRuntime,
        trafficRuntime: validatedTraffic,
        pedestrianRuntime: validatedPedestrians,
        ambulanceRuntime: validatedAmbulance,
        stadtwerkeRuntime: validatedStadtwerkeVehicle,
        mission003SceneRuntimeProvider: () => validatedMission003Scene,
        mission003Plan: window.MISSION_BOS_MISSION_003_PLAN,
        mission004SceneRuntimeProvider: () => validatedMission004Foundation,
        mission004Plan: window.MISSION_BOS_MISSION_004_PLAN,
        responsePlan: combinedNetworkReferencePlan,
        incidentPlan: combinedNetworkReferencePlan,
        scenePlan: window.MISSION_BOS_MISSION_001_SCENE_PLAN,
        sceneRuntimeProvider: () => validatedMission001Scene,
        arenaRuntimeProvider: () => validatedArenaEventRenderer,
        communicationPlan: window.MISSION_BOS_TELEKOM_COMMUNICATION_PLAN,
        cellLoadRuntime: validatedCellLoad,
        cellLoadPlan: window.MISSION_BOS_CELL_LOAD_PLAN
      });

      const associationManifest = validatedNetworkAssociation.getManifest();
      const associationSafety = validatedNetworkAssociation.getSafetyStatus();
      if (
        !associationManifest || associationManifest.status !== "PASSED" ||
        !associationSafety || associationSafety.status !== "PASSED"
      ) {
        console.error("Dynamic network association is unavailable; the base mission remains active.");
      }
    }
  }

  if (validatedNetworkAssociation && validatedCellLoad &&
      window.MissionBosAutomaticBOSPriorityController && window.MISSION_BOS_NETWORK_REALISM_PLAN) {
    validatedAutomaticBOSPriority = window.MissionBosAutomaticBOSPriorityController.create({
      plan: window.MISSION_BOS_NETWORK_REALISM_PLAN,
      mission003Plan: window.MISSION_BOS_MISSION_003_PLAN,
      connectivityRecoveryPlan: window.MISSION_BOS_MISSION_003_CONNECTIVITY_RECOVERY_PLAN,
      cellLoadRuntime: validatedCellLoad,
      associationRuntime: validatedNetworkAssociation
    });
    const autoPrioritySafety = validatedAutomaticBOSPriority.getSafetyStatus();
    if (!autoPrioritySafety || autoPrioritySafety.status !== "PASSED") {
      console.error("Automatic cell-local BOS priority controller is unavailable.");
    }
  }

  if (unifiedBosConnectivityEnabled && recoveryCity && validatedNetworkAssociation &&
      validatedAutomaticBOSPriority && window.MissionBosBosLinkVisualFactory &&
      window.MissionBosUnifiedBosConnectivityRenderer) {
    validatedUnifiedBosConnectivity = window.MissionBosUnifiedBosConnectivityRenderer.create({
      scene: scene,
      recoveryCity: recoveryCity,
      associationRuntime: validatedNetworkAssociation,
      priorityRuntime: validatedAutomaticBOSPriority,
      responseRuntime: validatedResponseVehicles,
      ambulanceRuntime: validatedAmbulance,
      stadtwerkeRuntime: validatedStadtwerkeVehicle,
      connectivityRecoveryPlan: window.MISSION_BOS_MISSION_003_CONNECTIVITY_RECOVERY_PLAN,
      networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN,
      recoveryPlan: networkRecoveryPolishEnabled ? window.MISSION_BOS_NETWORK_RECOVERY_PLAN : null,
      plan: window.MISSION_BOS_UNIFIED_BOS_CONNECTIVITY_PLAN,
      visualFactory: window.MissionBosBosLinkVisualFactory
    });
    const unifiedManifest = validatedUnifiedBosConnectivity.getManifest();
    const unifiedSafety = validatedUnifiedBosConnectivity.getSafetyStatus();
    if (!unifiedManifest || unifiedManifest.status !== "PASSED" ||
        !unifiedSafety || unifiedSafety.status !== "PASSED") {
      console.error("Unified operational connectivity runtime failed. Missions remain operable without the new visual runtime.");
      if (validatedUnifiedBosConnectivity && typeof validatedUnifiedBosConnectivity.dispose === "function") {
        validatedUnifiedBosConnectivity.dispose();
      }
      validatedUnifiedBosConnectivity = null;
    } else {
      validatedAmbulanceConnectivity = validatedUnifiedBosConnectivity.getEndpointRuntime("NET_AMBULANCE_01");
    }
  } else if (unifiedBosConnectivityEnabled) {
    console.error("Unified operational connectivity runtime dependencies are incomplete. Missions remain fail-soft available.");
  }

  if (recoveryCity && validatedCellLoad && validatedAutomaticBOSPriority &&
      window.MissionBosTowerLoadIndicatorRenderer) {
    validatedTowerLoadIndicators = window.MissionBosTowerLoadIndicatorRenderer.create({
      scene: scene,
      recoveryCity: recoveryCity,
      cellLoadRuntime: validatedCellLoad,
      priorityRuntime: validatedAutomaticBOSPriority,
      plan: window.MISSION_BOS_NETWORK_REALISM_PLAN,
      networkPolishPlan: window.MISSION_BOS_MISSION_001_NETWORK_POLISH_PLAN,
      activationImpactPlan: window.MISSION_BOS_BOS_ACTIVATION_IMPACT_PLAN
    });
    const towerIndicatorManifest = validatedTowerLoadIndicators.getManifest();
    const towerIndicatorSafety = validatedTowerLoadIndicators.getSafetyStatus();
    if (!towerIndicatorManifest || towerIndicatorManifest.status !== "PASSED" ||
        !towerIndicatorSafety || towerIndicatorSafety.status !== "PASSED") {
      console.error("Five tower load indicators could not be validated.");
    }
  }

  if (validatedBOSActivationImpactPlanValidation &&
      validatedBOSActivationImpactPlanValidation.status === "PASSED" &&
      validatedBuild013M1CombinedValidation && validatedBuild013M1CombinedValidation.status === "PASSED" &&
      recoveryCity && validatedAutomaticBOSPriority && validatedTowerLoadIndicators &&
      window.MissionBosBOSActivationImpactRenderer) {
    validatedBOSActivationImpact = window.MissionBosBOSActivationImpactRenderer.create({
      scene: scene,
      recoveryCity: recoveryCity,
      priorityRuntime: validatedAutomaticBOSPriority,
      towerIndicatorRuntime: validatedTowerLoadIndicators,
      plan: window.MISSION_BOS_BOS_ACTIVATION_IMPACT_PLAN,
      validation: validatedBOSActivationImpactPlanValidation,
      documentRef: document
    });
    const activationImpactManifest = validatedBOSActivationImpact.getManifest();
    const activationImpactSafety = validatedBOSActivationImpact.getSafetyStatus();
    if (!activationImpactManifest || activationImpactManifest.status !== "PASSED" ||
        !activationImpactSafety || activationImpactSafety.status !== "PASSED") {
      console.error("BOS activation impact is unavailable. Priority and all missions remain fully operable.");
      if (validatedBOSActivationImpact && typeof validatedBOSActivationImpact.dispose === "function") {
        validatedBOSActivationImpact.dispose();
      }
      validatedBOSActivationImpact = null;
    }
  }

  if (RECOVERY_CONFIG.enableRepresentativeCivilianConnectivity) {
    const civilianConnectivityDependenciesAvailable =
      !!window.MISSION_BOS_NETWORK_EXPLORATION_PLAN &&
      !!window.MissionBosNetworkExplorationValidator &&
      !!window.MissionBosCivilianConnectivityController &&
      !!window.MissionBosCivilianConnectivityRenderer &&
      !!window.MISSION_BOS_TRAFFIC_PLAN &&
      !!window.MISSION_BOS_PEDESTRIAN_PLAN &&
      !!window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN &&
      !!window.MISSION_BOS_CELL_LOAD_PLAN &&
      !!window.MISSION_BOS_CELL_CAPACITY_PLAN &&
      !!window.MISSION_BOS_EXPLORATION_INTERFACE_PLAN &&
      !!window.MissionBosNetworkRadioModel &&
      !!validatedTraffic &&
      !!validatedPedestrians &&
      !!validatedCellLoad &&
      typeof validatedCellLoad.setDynamicCivilianContributions === "function";

    if (!civilianConnectivityDependenciesAvailable) {
      console.error(
        "Representative civilian connectivity dependencies are missing. Existing city and mission systems remain active."
      );
    } else {
      const civilianRuntime = window.MissionBosCivilianConnectivityController.create({
        layout: window.MISSION_BOS_RECOVERY_LAYOUT,
        trafficPlan: window.MISSION_BOS_TRAFFIC_PLAN,
        pedestrianPlan: window.MISSION_BOS_PEDESTRIAN_PLAN,
        associationPlan: window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN_009N7_BASELINE || window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN,
        cellLoadPlan: window.MISSION_BOS_CELL_LOAD_PLAN,
        capacityPlan: window.MISSION_BOS_CELL_CAPACITY_PLAN,
        explorationInterfacePlan: window.MISSION_BOS_EXPLORATION_INTERFACE_PLAN,
        plan: window.MISSION_BOS_NETWORK_EXPLORATION_PLAN,
        networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN,
        validator: window.MissionBosNetworkExplorationValidator,
        radioModel: window.MissionBosNetworkRadioModel,
        trafficRuntime: validatedTraffic,
        pedestrianRuntime: validatedPedestrians,
        associationRuntime: validatedNetworkAssociation,
        cellLoadRuntime: validatedCellLoad,
        mission004Plan: window.MISSION_BOS_MISSION_004_PLAN
      });
      const civilianManifest = civilianRuntime.getManifest();
      const civilianSafety = civilianRuntime.getSafetyStatus();
      if (!civilianManifest || civilianManifest.status !== "PASSED" ||
          !civilianSafety || civilianSafety.status !== "PASSED") {
        console.error(
          "Representative civilian connectivity is unavailable; the existing mission remains active without representative endpoints."
        );
      } else {
        validatedCivilianConnectivity = civilianRuntime;
      }
    }
  }

  if (RECOVERY_CONFIG.enableCellCapacityAllocation) {
    const capacityDependenciesAvailable =
      !!window.MISSION_BOS_CELL_CAPACITY_PLAN &&
      !!window.MissionBosCellCapacityValidator &&
      !!window.MissionBosCellCapacityController &&
      !!window.MISSION_BOS_RECOVERY_LAYOUT &&
      !!window.MISSION_BOS_MISSION_001_PLAN &&
      !!window.MISSION_BOS_MISSION_002_PLAN &&
      !!window.MISSION_BOS_MISSION_001_SCENE_PLAN &&
      !!window.MISSION_BOS_ARENA_EVENT_PLAN &&
      !!window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN &&
      !!window.MISSION_BOS_CELL_LOAD_PLAN &&
      !!window.MISSION_BOS_TELEKOM_COMMUNICATION_PLAN &&
      !!validatedCellLoad &&
      !!validatedNetworkAssociation;

    const cellLoadSafety = validatedCellLoad && validatedCellLoad.getSafetyStatus
      ? validatedCellLoad.getSafetyStatus()
      : null;
    const associationSafety = validatedNetworkAssociation && validatedNetworkAssociation.getSafetyStatus
      ? validatedNetworkAssociation.getSafetyStatus()
      : null;

    if (!capacityDependenciesAvailable || !cellLoadSafety || cellLoadSafety.status !== "PASSED" ||
        !associationSafety || associationSafety.status !== "PASSED") {
      console.error(
        "Shared-cell capacity dependencies are missing or unsafe. Existing mission systems remain active."
      );
    } else {
      validatedCellCapacity = window.MissionBosCellCapacityController.create({
        layout: window.MISSION_BOS_RECOVERY_LAYOUT,
        missionPlan: window.MISSION_BOS_MISSION_001_PLAN,
        mission002Plan: window.MISSION_BOS_MISSION_002_PLAN,
        scenePlan: window.MISSION_BOS_MISSION_001_SCENE_PLAN,
        arenaPlan: window.MISSION_BOS_ARENA_EVENT_PLAN,
        associationPlan: window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN,
        cellLoadPlan: window.MISSION_BOS_CELL_LOAD_PLAN,
        communicationPlan: window.MISSION_BOS_TELEKOM_COMMUNICATION_PLAN,
        capacityPlan: window.MISSION_BOS_CELL_CAPACITY_PLAN,
        validator: window.MissionBosCellCapacityValidator,
        cellLoadRuntime: validatedCellLoad,
        associationRuntime: validatedNetworkAssociation,
        priorityRuntime: validatedAutomaticBOSPriority,
        networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN
      });

      const capacityManifest = validatedCellCapacity.getManifest();
      const capacitySafety = validatedCellCapacity.getSafetyStatus();
      if (!capacityManifest || capacityManifest.status !== "PASSED" ||
          !capacitySafety || capacitySafety.status !== "PASSED") {
        console.error(
          "Shared-cell capacity runtime is unavailable; city and mission remain active without capacity effects."
        );
      }
    }
  }

  if (validatedCivilianConnectivity && validatedCellCapacity && recoveryCity &&
      window.MissionBosCivilianConnectivityRenderer) {
    const civilianVisualRuntime = window.MissionBosCivilianConnectivityRenderer.create({
      scene: scene,
      recoveryCity: recoveryCity,
      connectivityRuntime: validatedCivilianConnectivity,
      associationRuntime: validatedNetworkAssociation,
      capacityRuntime: validatedCellCapacity,
      networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN
    });
    const civilianVisualManifest = civilianVisualRuntime.getManifest();
    const civilianVisualSafety = civilianVisualRuntime.getSafetyStatus();
    if (!civilianVisualManifest || civilianVisualManifest.status !== "PASSED" ||
        !civilianVisualSafety || civilianVisualSafety.status !== "PASSED") {
      console.error("All-participant civilian connectivity lines are unavailable; no fallback lines were created.");
    } else {
      validatedCivilianConnectivityVisuals = civilianVisualRuntime;
    }
  }

  if (RECOVERY_CONFIG.enableValidatedIncidentAccess) {
    if (
      !window.MISSION_BOS_INCIDENT_RESPONSE_PLAN ||
      !window.MissionBosIncidentResponseValidator ||
      !window.MissionBosIncidentAccessController
    ) {
      throw new Error(
        "Incident access files are missing. Expected city-incident-response-plan.js, " +
        "incident-response-validator.js and city-incident-access-controller.js."
      );
    }
    if (!validatedTraffic || !validatedResponseVehicles) {
      throw new Error("Incident access requires validated traffic and response runtimes.");
    }
    [
      "requestYieldAtDistance",
      "releaseYield",
      "releaseAllYields",
      "isVehicleYielded",
      "getYieldStatus"
    ].forEach((methodName) => {
      if (typeof validatedTraffic[methodName] !== "function") {
        throw new Error("Traffic runtime is missing deterministic Yield API: " + methodName);
      }
    });
    ["dispatch", "returnToStations", "getState"].forEach((methodName) => {
      if (typeof validatedResponseVehicles[methodName] !== "function") {
        throw new Error("Response runtime is missing incident access API: " + methodName);
      }
    });

    validatedIncidentAccess = window.MissionBosIncidentAccessController.create({
      trafficRuntime: validatedTraffic,
      responseRuntime: validatedResponseVehicles,
      plan: window.MISSION_BOS_INCIDENT_RESPONSE_PLAN
    });
  }

  if (RECOVERY_CONFIG.enableValidatedMission001) {
    const missionDependenciesAvailable =
      !!window.MISSION_BOS_MISSION_001_PLAN &&
      !!window.MissionBosMission001Validator &&
      !!window.MISSION_BOS_MISSION_001_SCENE_PLAN &&
      !!window.MissionBosMission001SceneValidator &&
      !!window.MissionBosMission001Visuals &&
      !!window.MissionBosMission001Scene &&
      !!window.MissionBosMission001Controller &&
      !!validatedIncidentAccess &&
      !!validatedPedestrians;

    if (!missionDependenciesAvailable) {
      console.error(
        "Validated Mission 001 files or runtimes are missing. Expected Mission 001 plan, " +
        "incident scene plan, validators, visual runtimes and mission controller."
      );
    } else {
      validatedMission001PlanValidation = window.MissionBosMission001Validator.validate(
        window.MISSION_BOS_RECOVERY_LAYOUT,
        window.MISSION_BOS_INCIDENT_RESPONSE_PLAN,
        window.MISSION_BOS_MISSION_001_PLAN
      );
      window.MissionBosMission001Validator.logResult(validatedMission001PlanValidation);

      if (validatedMission001PlanValidation.status !== "PASSED") {
        console.error("Validated Mission 001 was not created because plan validation failed.");
      } else {
        validatedMission001CoreVisuals = window.MissionBosMission001Visuals.create({
          scene: scene,
          plan: window.MISSION_BOS_MISSION_001_PLAN
        });

        validatedMission001Scene = window.MissionBosMission001Scene.create({
          scene: scene,
          layout: window.MISSION_BOS_RECOVERY_LAYOUT,
          propsPlan: window.MISSION_BOS_STATIC_PROPS,
          responsePlan: window.MISSION_BOS_RESPONSE_VEHICLE_PLAN,
          incidentPlan: window.MISSION_BOS_INCIDENT_RESPONSE_PLAN,
          missionPlan: window.MISSION_BOS_MISSION_001_PLAN,
          plan: window.MISSION_BOS_MISSION_001_SCENE_PLAN,
          validator: window.MissionBosMission001SceneValidator
        });

        validatedMission001Visuals = window.MissionBosMission001Scene.compose(
          validatedMission001CoreVisuals,
          validatedMission001Scene
        );

        const missionVisualManifest = validatedMission001Visuals.getManifest();
        const missionVisualSafety = validatedMission001Visuals.getSafetyStatus();
        if (
          !missionVisualManifest || missionVisualManifest.status !== "PASSED" ||
          !missionVisualSafety || missionVisualSafety.status !== "PASSED"
        ) {
          console.error("Validated Mission 001 was not created because visual validation failed.");
        } else {
          validatedMission001 = window.MissionBosMission001Controller.create({
            incidentAccessRuntime: validatedIncidentAccess,
            pedestrianRuntime: validatedPedestrians,
            networkAdapter: validatedMissionNetworkAdapter,
            visualsRuntime: validatedMission001Visuals,
            plan: window.MISSION_BOS_MISSION_001_PLAN
          });
        }
      }
    }
  }

  if (RECOVERY_CONFIG.enableMissionRegistry) {
    const registryDependenciesAvailable =
      !!window.MISSION_BOS_MISSION_REGISTRY_PLAN &&
      !!window.MissionBosMissionRegistryValidator &&
      !!window.MissionBosMissionRegistryController &&
      !!window.MISSION_BOS_MISSION_001_PLAN &&
      !!window.MISSION_BOS_MISSION_002_PLAN &&
      !!window.MISSION_BOS_PRESENTER_PLAN &&
      !!window.MISSION_BOS_EXPLORATION_INTERFACE_PLAN &&
      !!window.MISSION_BOS_NETWORK_EXPLORATION_PLAN &&
      !!validatedMission001 &&
      !!missionRegistryPanel &&
      !!missionRegistryList &&
      !!missionRegistryStatus;

    if (!registryDependenciesAvailable) {
      console.error(
        "Validated mission registry files, Mission 001 runtime or registry dashboard elements are missing. " +
        "Mission 001 remains available through its existing controls."
      );
    } else {
      const registryRuntime = window.MissionBosMissionRegistryController.create({
        plan: window.MISSION_BOS_MISSION_REGISTRY_PLAN,
        validator: window.MissionBosMissionRegistryValidator,
        mission001Plan: window.MISSION_BOS_MISSION_001_PLAN,
        mission002Plan: window.MISSION_BOS_MISSION_002_PLAN,
        mission003Plan: window.MISSION_BOS_MISSION_003_PLAN,
        presenterPlan: window.MISSION_BOS_PRESENTER_PLAN,
        explorationInterfacePlan: window.MISSION_BOS_EXPLORATION_INTERFACE_PLAN,
        networkExplorationPlan: window.MISSION_BOS_NETWORK_EXPLORATION_PLAN,
        missionRuntimes: {
          MISSION_001: validatedMission001
        },
        ui: {
          panel: missionRegistryPanel,
          list: missionRegistryList,
          status: missionRegistryStatus
        }
      });
      const registryManifest = registryRuntime.getManifest();
      const registrySafety = registryRuntime.getSafetyStatus();
      if (
        !registryManifest || registryManifest.status !== "PASSED" ||
        !registrySafety || registrySafety.status !== "PASSED"
      ) {
        console.error(
          "Mission registry validation or runtime safety failed. Mission 001 remains bound to the existing direct runtime."
        );
      } else {
        validatedMissionRegistry = registryRuntime;
      }
    }
  }

  if (RECOVERY_CONFIG.enableValidatedAmbulanceFoundation && validatedAmbulance) {
    const ambulanceFoundationDependenciesAvailable =
      !!window.MissionBosAmbulanceFoundationController &&
      !!validatedTraffic &&
      !!validatedMission001 &&
      !!validatedMissionRegistry &&
      !!validatedNetworkAssociation;

    if (!ambulanceFoundationDependenciesAvailable) {
      console.error(
        "Ambulance foundation controller dependencies are missing. The ambulance remains parked and Mission 001 stays available."
      );
    } else {
      validatedAmbulanceFoundation = window.MissionBosAmbulanceFoundationController.create({
        plan: window.MISSION_BOS_AMBULANCE_PLAN,
        validator: window.MissionBosAmbulanceValidator,
        ambulanceRuntime: validatedAmbulance,
        trafficRuntime: validatedTraffic,
        mission001Runtime: validatedMission001,
        missionRegistryRuntime: validatedMissionRegistry,
        associationRuntime: validatedNetworkAssociation,
        ui: {
          button: ambulanceTestButton,
          status: ambulanceTestStatus,
          servingCell: ambulanceServingCell
        }
      });
      const ambulanceFoundationManifest = validatedAmbulanceFoundation.getManifest();
      const ambulanceFoundationSafety = validatedAmbulanceFoundation.getSafetyStatus();
      if (!ambulanceFoundationManifest || ambulanceFoundationManifest.status !== "PASSED" ||
          !ambulanceFoundationSafety || ambulanceFoundationSafety.status !== "PASSED") {
        console.error("Ambulance foundation controller validation failed. Mission 001 remains unaffected.");
      }
    }
  }

  if (RECOVERY_CONFIG.enableArenaEventFoundation) {
    const arenaEventDependenciesAvailable =
      !!window.MISSION_BOS_ARENA_EVENT_PLAN &&
      !!window.MissionBosArenaEventValidator &&
      !!window.MissionBosArenaEventRenderer &&
      !!window.MissionBosArenaEventController &&
      !!window.MissionBosArenaEventConnectivityRenderer &&
      !!window.MissionBosNetworkRadioModel &&
      !!window.MISSION_BOS_AMBULANCE_PLAN &&
      !!window.MISSION_BOS_MISSION_REGISTRY_PLAN &&
      !!window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN &&
      !!window.MISSION_BOS_CELL_LOAD_PLAN &&
      !!validatedCellLoad &&
      !!validatedMission001 &&
      !!validatedMissionRegistry &&
      !!validatedAmbulanceFoundation;

    if (!arenaEventDependenciesAvailable) {
      console.error(
        "Arena Event Foundation dependencies are missing. Mission 001 and the ambulance foundation remain available."
      );
    } else {
      // The frozen 010P.3 Arena Foundation validator intentionally verifies the
      // pre-runtime registry boundary. Validate against a derived compatibility
      // view without mutating the live 010P.4 dual-mission registry plan.
      const arenaFoundationCompatibilityRegistryPlan = Object.assign(
        {},
        window.MISSION_BOS_MISSION_REGISTRY_PLAN_011N4_BASELINE || window.MISSION_BOS_MISSION_REGISTRY_PLAN,
        {
          missions: window.MISSION_BOS_MISSION_REGISTRY_PLAN.missions.map(function (definition) {
            if (!definition || definition.id !== "MISSION_002") {
              return definition;
            }
            return Object.assign({}, definition, {
              status: "PLANNED",
              statusLabel: "In Vorbereitung",
              selectable: false,
              startable: false,
              runtimeKey: null
            });
          })
        }
      );

      validatedArenaEventValidation = window.MissionBosArenaEventValidator.validate(
        window.MISSION_BOS_RECOVERY_LAYOUT,
        window.MISSION_BOS_STATIC_PROPS,
        window.MISSION_BOS_TRAFFIC_PLAN,
        window.MISSION_BOS_PEDESTRIAN_PLAN,
        window.MISSION_BOS_AMBULANCE_PLAN,
        arenaFoundationCompatibilityRegistryPlan,
        window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN,
        window.MISSION_BOS_CELL_LOAD_PLAN,
        window.MISSION_BOS_ARENA_EVENT_PLAN
      );
      window.MissionBosArenaEventValidator.logResult(validatedArenaEventValidation);

      if (!validatedArenaEventValidation || validatedArenaEventValidation.status !== "PASSED") {
        console.error("Arena Event Foundation validation failed. No arena crowd or event load was activated.");
      } else {
        validatedArenaEventRenderer = window.MissionBosArenaEventRenderer.create({
          scene: scene,
          plan: window.MISSION_BOS_ARENA_EVENT_PLAN,
          validation: validatedArenaEventValidation
        });

        const arenaRenderManifest = validatedArenaEventRenderer.getManifest();
        const arenaRenderSafety = validatedArenaEventRenderer.getSafetyStatus();
        if (!arenaRenderManifest || arenaRenderManifest.status !== "PASSED" ||
            !arenaRenderSafety || arenaRenderSafety.status !== "PASSED") {
          console.error("Arena event crowd renderer is unavailable; no unsafe fallback crowd was created.");
        } else {
          validatedArenaEvent = window.MissionBosArenaEventController.create({
            plan: window.MISSION_BOS_ARENA_EVENT_PLAN,
            validation: validatedArenaEventValidation,
            validator: window.MissionBosArenaEventValidator,
            renderer: validatedArenaEventRenderer,
            layout: window.MISSION_BOS_RECOVERY_LAYOUT,
            propsPlan: window.MISSION_BOS_STATIC_PROPS,
            trafficPlan: window.MISSION_BOS_TRAFFIC_PLAN,
            pedestrianPlan: window.MISSION_BOS_PEDESTRIAN_PLAN,
            ambulancePlan: window.MISSION_BOS_AMBULANCE_PLAN,
            missionRegistryPlan: window.MISSION_BOS_MISSION_REGISTRY_PLAN,
            associationPlan: window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN,
            radioModel: window.MissionBosNetworkRadioModel,
            cellLoadPlan: window.MISSION_BOS_CELL_LOAD_PLAN,
            cellLoadRuntime: validatedCellLoad,
            sharedAssociationRuntime: validatedNetworkAssociation,
            networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN,
            mission001Runtime: validatedMission001,
            missionRegistryRuntime: validatedMissionRegistry,
            ambulanceFoundationRuntime: validatedAmbulanceFoundation,
            isBosActive: () => networkManager.bosPriorityActive,
            isManualLoadActive: () => networkManager.manualLoadActive,
            ui: {
              container: arenaEventCard,
              status: arenaEventStatus,
              visibleCount: arenaEventVisibleCount,
              phoneCount: arenaEventPhoneCount,
              servingCell: arenaEventServingCell,
              cellLoad: arenaEventCellLoad,
              button: arenaEventTestButton
            }
          });

          const arenaControllerManifest = validatedArenaEvent.getManifest();
          const arenaControllerSafety = validatedArenaEvent.getSafetyStatus();
          if (!arenaControllerManifest || arenaControllerManifest.status !== "PASSED" ||
              !arenaControllerSafety || arenaControllerSafety.status !== "PASSED") {
            console.error("Arena event controller is unavailable; Mission 001 remains unaffected.");
          } else {
            const arenaProviderRegistered = validatedCellCapacity &&
              typeof validatedCellCapacity.registerAssociationProvider === "function" &&
              validatedCellCapacity.registerAssociationProvider(
                "ARENA_EVENT",
                validatedArenaEvent,
                (window.MISSION_BOS_ARENA_EVENT_PLAN.visiblePhoneEndpoints || []).map((endpoint) => endpoint.id)
              );
            if (!arenaProviderRegistered) {
              console.error("Arena association provider could not be registered with the shared capacity runtime.");
            }
            validatedArenaEventConnectivity = window.MissionBosArenaEventConnectivityRenderer.create({
              scene: scene,
              recoveryCity: recoveryCity,
              associationRuntime: validatedNetworkAssociation,
              capacityRuntime: validatedCellCapacity,
              networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN
            });
            const arenaConnectivityManifest = validatedArenaEventConnectivity.getManifest();
            const arenaConnectivitySafety = validatedArenaEventConnectivity.getSafetyStatus();
            if (!arenaConnectivityManifest || arenaConnectivityManifest.status !== "PASSED" ||
                !arenaConnectivitySafety || arenaConnectivitySafety.status !== "PASSED") {
              console.error("Arena event connectivity visualization is unavailable; event activation remains disabled.");
              validatedArenaEvent = null;
            } else {
              validatedArenaEvent.setConnectivityRuntime(validatedArenaEventConnectivity);
            }
          }
        }
      }
    }
  }

  if (RECOVERY_CONFIG.enableMission002) {
    const mission002DependenciesAvailable =
      !!window.MISSION_BOS_MISSION_002_PLAN &&
      !!window.MissionBosMission002Validator &&
      !!window.MissionBosMission002SceneRenderer &&
      !!window.MissionBosMission002Controller &&
      !!validatedMission001 && !!validatedMissionRegistry &&
      !!validatedAmbulance && !!validatedAmbulanceFoundation &&
      !!validatedArenaEvent && !!validatedCellLoad && !!validatedCellCapacity &&
      !!validatedTraffic;

    if (!mission002DependenciesAvailable) {
      console.error("Mission 002 dependencies are missing. Mission 001 remains fully available.");
      setMission002InitializationUnavailable("Mission 002 dependencies are missing.");
    } else {
      validatedMission002PlanValidation = window.MissionBosMission002Validator.validate(
        window.MISSION_BOS_RECOVERY_LAYOUT,
        window.MISSION_BOS_STATIC_PROPS,
        window.MISSION_BOS_TRAFFIC_PLAN,
        window.MISSION_BOS_PEDESTRIAN_PLAN,
        window.MISSION_BOS_AMBULANCE_PLAN,
        window.MISSION_BOS_ARENA_EVENT_PLAN,
        window.MISSION_BOS_MISSION_REGISTRY_PLAN_011N4_BASELINE || window.MISSION_BOS_MISSION_REGISTRY_PLAN,
        window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN,
        window.MISSION_BOS_CELL_LOAD_PLAN,
        window.MISSION_BOS_CELL_CAPACITY_PLAN,
        window.MISSION_BOS_MISSION_002_PLAN
      );
      window.MissionBosMission002Validator.logResult(validatedMission002PlanValidation);

      if (validatedMission002PlanValidation.status !== "PASSED") {
        console.error("Mission 002 plan validation failed. No Mission 002 runtime was registered.");
        setMission002InitializationUnavailable("Mission 002 plan validation failed.");
      } else {
        validatedMission002Scene = window.MissionBosMission002SceneRenderer.create({
          scene: scene,
          plan: window.MISSION_BOS_MISSION_002_PLAN,
          validation: validatedMission002PlanValidation
        });
        const mission002SceneManifest = validatedMission002Scene.getManifest();
        const mission002SceneSafety = validatedMission002Scene.getSafetyStatus();
        if (!mission002SceneManifest || mission002SceneManifest.status !== "PASSED" ||
            !mission002SceneSafety || mission002SceneSafety.status !== "PASSED") {
          console.error("Mission 002 scene renderer is unavailable. Mission 001 remains fully available.");
          setMission002InitializationUnavailable("Mission 002 scene renderer is unavailable.");
        } else {
          validatedMission002NetworkAdapter = createValidatedMissionNetworkAdapter(
            window.MISSION_BOS_MISSION_002_PLAN
          );
          validatedMission002 = window.MissionBosMission002Controller.create({
            plan: window.MISSION_BOS_MISSION_002_PLAN,
            validation: validatedMission002PlanValidation,
            sceneRuntime: validatedMission002Scene,
            arenaEventRuntime: validatedArenaEvent,
            ambulanceRuntime: validatedAmbulance,
            trafficRuntime: validatedTraffic,
            mission001Runtime: validatedMission001,
            missionRegistryRuntime: validatedMissionRegistry,
            ambulanceFoundationRuntime: validatedAmbulanceFoundation,
            networkAdapter: validatedMission002NetworkAdapter,
            cellLoadRuntime: validatedCellLoad,
            capacityRuntime: validatedCellCapacity
          });
          const mission002Manifest = validatedMission002.getManifest();
          const mission002Safety = validatedMission002.getSafetyStatus();
          if (!mission002Manifest || mission002Manifest.status !== "PASSED" ||
              !mission002Safety || mission002Safety.status !== "PASSED") {
            console.error("Mission 002 runtime initialization failed. Mission 001 remains fully available.");
            if (validatedMission002 && typeof validatedMission002.dispose === "function") validatedMission002.dispose();
            validatedMission002 = null;
            if (validatedMission002Scene && typeof validatedMission002Scene.dispose === "function") validatedMission002Scene.dispose();
            validatedMission002Scene = null;
            setMission002InitializationUnavailable("Mission 002 runtime initialization failed.");
          } else if (!validatedMissionRegistry.registerRuntime("MISSION_002", validatedMission002)) {
            console.error("Mission 002 could not be registered in the multi-mission registry. Mission 001 remains fully available.");
            setMission002InitializationUnavailable("Mission 002 registry registration failed.");
          } else {
            mission002InitializationUnavailable = false;
            mission002InitializationFailureReason = "";
          }
        }
      }
    }
  }

  if (validatedMissionRegistry && validatedMission002 &&
      validatedMission003ResponseValidation && validatedMission003ResponseValidation.status === "PASSED" &&
      validatedMission003PlanValidation && validatedMission003PlanValidation.status === "PASSED" &&
      validatedMission003NetworkExtensionValidation && validatedMission003NetworkExtensionValidation.status === "PASSED" &&
      validatedMission003RegistryExtensionValidation && validatedMission003RegistryExtensionValidation.status === "PASSED" &&
      validatedMission003ConnectivityParityPlanValidation && validatedMission003ConnectivityParityPlanValidation.status === "PASSED" &&
      validatedUnifiedBosConnectivity && validatedStadtwerkeVehicle && validatedResponseVehicles && validatedTraffic && validatedCellLoad &&
      validatedCellCapacity && validatedAutomaticBOSPriority && window.MissionBosMission003SceneRenderer &&
      window.MissionBosMission003ResponseController && window.MissionBosMission003ConnectivityRenderer &&
      window.MissionBosMission003Controller) {
    validatedMission003Scene = window.MissionBosMission003SceneRenderer.create({
      scene: scene,
      plan: window.MISSION_BOS_MISSION_003_PLAN,
      validation: validatedMission003PlanValidation
    });
    validatedMission003Response = window.MissionBosMission003ResponseController.create({
      plan: window.MISSION_BOS_MISSION_003_RESPONSE_PLAN,
      validation: validatedMission003ResponseValidation,
      trafficRuntime: validatedTraffic,
      responseVehicleRuntime: validatedResponseVehicles,
      stadtwerkeRuntime: validatedStadtwerkeVehicle
    });
    validatedMission003Connectivity = window.MissionBosMission003ConnectivityRenderer.create({
      scene: scene,
      recoveryCity: recoveryCity,
      associationRuntime: validatedNetworkAssociation,
      capacityRuntime: validatedCellCapacity,
      networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN
    });
    validatedMission003NetworkAdapter = createValidatedMissionNetworkAdapter(window.MISSION_BOS_MISSION_003_PLAN);
    validatedMission003 = window.MissionBosMission003Controller.create({
      plan: window.MISSION_BOS_MISSION_003_PLAN,
      validation: validatedMission003PlanValidation,
      sceneRuntime: validatedMission003Scene,
      responseRuntime: validatedMission003Response,
      networkAdapter: validatedMission003NetworkAdapter,
      cellLoadRuntime: validatedCellLoad,
      capacityRuntime: validatedCellCapacity,
      priorityRuntime: validatedAutomaticBOSPriority,
      mission001Runtime: validatedMission001,
      mission002Runtime: validatedMission002,
      missionRegistryRuntime: validatedMissionRegistry
    });
    const mission003Manifest = validatedMission003.getManifest();
    const mission003Safety = validatedMission003.getSafetyStatus();
    const mission003SceneSafety = validatedMission003Scene.getSafetyStatus();
    const mission003ResponseSafety = validatedMission003Response.getSafetyStatus();
    const mission003ConnectivitySafety = validatedMission003Connectivity.getSafetyStatus();
    if (!mission003Manifest || mission003Manifest.status !== "PASSED" || !mission003Safety || mission003Safety.status !== "PASSED" ||
        !mission003SceneSafety || mission003SceneSafety.status !== "PASSED" || !mission003ResponseSafety || mission003ResponseSafety.status !== "PASSED" ||
        !mission003ConnectivitySafety || mission003ConnectivitySafety.status !== "PASSED" ||
        !validatedMissionRegistry.registerRuntime("MISSION_003", validatedMission003)) {
      console.error("Mission 003 initialization failed. Mission 001 and Mission 002 remain available.");
      validatedMissionRegistry.registerUnavailable("MISSION_003", "Mission 003 initialization failed.");
    }
  } else if (validatedMissionRegistry) {
    console.error("Mission 003 dependencies are incomplete. Mission 001 and Mission 002 remain available.");
    validatedMissionRegistry.registerUnavailable("MISSION_003", "Mission 003 dependencies are incomplete.");
  }

  if (validatedMissionRegistry && validatedMission001 && validatedMission002 && validatedMission003 &&
      validatedMission004Foundation &&
      validatedMission004PlanValidation && validatedMission004PlanValidation.status === "PASSED" &&
      validatedMission004ReturnManeuverContractValidation && validatedMission004ReturnManeuverContractValidation.status === "PASSED" &&
      validatedMission004ReturnRouteValidation && validatedMission004ReturnRouteValidation.status === "PASSED" &&
      validatedMission004NetworkExtensionValidation && validatedMission004NetworkExtensionValidation.status === "PASSED" &&
      validatedMission004RegistryExtensionValidation && validatedMission004RegistryExtensionValidation.status === "PASSED" &&
      validatedResponseVehicles && validatedAmbulance && validatedTraffic && validatedNetworkAssociation &&
      validatedCellLoad && validatedCellCapacity && validatedAutomaticBOSPriority && validatedUnifiedBosConnectivity &&
      window.MissionBosMission004ResponseController && window.MissionBosMission004ConnectivityRenderer &&
      window.MissionBosMission004Controller) {
    try {
      validatedMission004Response = window.MissionBosMission004ResponseController.create({
        plan: window.MISSION_BOS_MISSION_004_PLAN,
        validation: validatedMission004PlanValidation,
        trafficRuntime: validatedTraffic,
        responseVehicleRuntime: validatedResponseVehicles,
        ambulanceRuntime: validatedAmbulance,
        sceneRuntime: validatedMission004Foundation
      });
      validatedMission004Connectivity = window.MissionBosMission004ConnectivityRenderer.create({
        scene: scene,
        recoveryCity: recoveryCity,
        associationRuntime: validatedNetworkAssociation,
        capacityRuntime: validatedCellCapacity,
        networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN
      });
      validatedMission004NetworkAdapter = createValidatedMissionNetworkAdapter(window.MISSION_BOS_MISSION_004_PLAN);
      validatedMission004 = window.MissionBosMission004Controller.create({
        plan: window.MISSION_BOS_MISSION_004_PLAN,
        validation: validatedMission004PlanValidation,
        sceneRuntime: validatedMission004Foundation,
        responseRuntime: validatedMission004Response,
        networkAdapter: validatedMission004NetworkAdapter,
        associationRuntime: validatedNetworkAssociation,
        cellLoadRuntime: validatedCellLoad,
        capacityRuntime: validatedCellCapacity,
        priorityRuntime: validatedAutomaticBOSPriority,
        mission001Runtime: validatedMission001,
        mission002Runtime: validatedMission002,
        mission003Runtime: validatedMission003,
        missionRegistryRuntime: validatedMissionRegistry
      });

      const mission004Manifest = validatedMission004.getManifest();
      const mission004Safety = validatedMission004.getSafetyStatus();
      const mission004ResponseSafety = validatedMission004Response.getSafetyStatus();
      const mission004SceneSafety = validatedMission004Foundation.getSafetyStatus();
      const mission004ConnectivityManifest = validatedMission004Connectivity.getManifest();
      const mission004ConnectivitySafety = validatedMission004Connectivity.getSafetyStatus();
      if (!mission004Manifest || mission004Manifest.status !== "PASSED" ||
          !mission004Safety || mission004Safety.status !== "PASSED" ||
          !mission004ResponseSafety || mission004ResponseSafety.status !== "PASSED" ||
          !mission004SceneSafety || mission004SceneSafety.status !== "PASSED" ||
          !mission004ConnectivityManifest || mission004ConnectivityManifest.status !== "PASSED" ||
          !mission004ConnectivitySafety || mission004ConnectivitySafety.status !== "PASSED" ||
          !validatedMissionRegistry.registerRuntime("MISSION_004", validatedMission004)) {
        throw new Error("Mission 004 runtime safety, manifest or registry registration failed.");
      }
    } catch (error) {
      console.error("Mission 004 initialization failed. Missions 001-003 remain available fail-soft.", error);
      if (validatedMission004 && typeof validatedMission004.dispose === "function") validatedMission004.dispose();
      if (validatedMission004Connectivity && typeof validatedMission004Connectivity.dispose === "function") validatedMission004Connectivity.dispose();
      validatedMission004 = null;
      validatedMission004Connectivity = null;
      validatedMission004Response = null;
      validatedMission004NetworkAdapter = null;
      validatedMissionRegistry.registerUnavailable("MISSION_004", "Mission 004 initialization failed.");
    }
  } else if (validatedMissionRegistry) {
    console.error("Mission 004 dependencies are incomplete. Missions 001-003 remain available fail-soft.");
    validatedMissionRegistry.registerUnavailable("MISSION_004", "Mission 004 dependencies are incomplete.");
  }

  if (validatedMissionRegistry) {
    if (!validatedMissionRegistry.finalizeRuntimeRegistration()) {
      console.error("The four-mission registry could not be finalized.");
    } else {
      runDualMissionRecoveryValidation();
    }
  }

  if (validatedMissionRegistry && isMissionRegistryFinalized() && validatedMission004 &&
      window.MISSION_BOS_MISSION_004_INTEGRATION_CONTRACT && window.MissionBosMission004IntegrationValidator) {
    validatedMission004IntegrationValidation = window.MissionBosMission004IntegrationValidator.validate({
      contract: window.MISSION_BOS_MISSION_004_INTEGRATION_CONTRACT,
      mission004Runtime: validatedMission004,
      responseRuntime: validatedMission004Response,
      sceneRuntime: validatedMission004Foundation,
      connectivityRuntime: validatedMission004Connectivity,
      registryRuntime: validatedMissionRegistry,
      associationRuntime: validatedNetworkAssociation,
      cellLoadRuntime: validatedCellLoad,
      capacityRuntime: validatedCellCapacity,
      ambulanceRuntime: validatedAmbulance
    });
    window.MissionBosMission004IntegrationValidator.logResult(validatedMission004IntegrationValidation);
    window.MissionBosMission004IntegrationValidation = validatedMission004IntegrationValidation;
  } else {
    validatedMission004IntegrationValidation = {
      status: "FAILED",
      errors: ["Mission 004 integration validation could not run with a finalized four-runtime registry."]
    };
  }

  if (RECOVERY_CONFIG.enableValidatedTelekomCommunication) {
    const communicationDependenciesAvailable =
      !!window.MISSION_BOS_TELEKOM_COMMUNICATION_PLAN &&
      !!window.MissionBosTelekomCommunicationValidator &&
      !!window.MissionBosTelekomCommunicationExperience &&
      !!window.MISSION_BOS_MISSION_001_PLAN &&
      !!window.MISSION_BOS_MISSION_001_SCENE_PLAN &&
      !!window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN &&
      !!window.MISSION_BOS_CELL_LOAD_PLAN &&
      !!window.MISSION_BOS_CELL_CAPACITY_PLAN &&
      !!validatedCellLoad &&
      !!validatedCellCapacity &&
      !!validatedAutomaticBOSPriority &&
      !!window.MISSION_BOS_MISSION_001_NETWORK_POLISH_PLAN &&
      !!validatedResponseVehicles &&
      !!validatedNetworkAssociation;

    if (!communicationDependenciesAvailable) {
      console.error(
        "Validated Telekom communication files or runtimes are missing. Expected communication " +
        "plan, validator, renderer and validated response vehicles."
      );
    } else {
      validatedTelekomCommunication = window.MissionBosTelekomCommunicationExperience.create({
        scene: scene,
        layout: window.MISSION_BOS_RECOVERY_LAYOUT,
        recoveryCity: recoveryCity,
        networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN,
        networkPolishPlan: window.MISSION_BOS_MISSION_001_NETWORK_POLISH_PLAN,
        recoveryPlan: networkRecoveryPolishEnabled ? window.MISSION_BOS_NETWORK_RECOVERY_PLAN : null,
        responseRuntime: validatedResponseVehicles,
        associationRuntime: validatedNetworkAssociation,
        associationPlan: window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN_009N7_BASELINE || window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN,
        cellLoadRuntime: validatedCellLoad,
        cellLoadPlan: window.MISSION_BOS_CELL_LOAD_PLAN,
        capacityRuntime: validatedCellCapacity,
        priorityRuntime: validatedAutomaticBOSPriority,
        unifiedBosRuntime: validatedUnifiedBosConnectivity,
        capacityPlan: window.MISSION_BOS_CELL_CAPACITY_PLAN,
        missionPlan: window.MISSION_BOS_MISSION_001_PLAN,
        scenePlan: window.MISSION_BOS_MISSION_001_SCENE_PLAN,
        plan: window.MISSION_BOS_TELEKOM_COMMUNICATION_PLAN,
        validator: window.MissionBosTelekomCommunicationValidator
      });

      const communicationManifest = validatedTelekomCommunication.getManifest();
      const communicationSafety = validatedTelekomCommunication.getSafetyStatus();
      if (
        !communicationManifest || communicationManifest.status !== "PASSED" ||
        !communicationSafety || communicationSafety.status !== "PASSED"
      ) {
        console.error(
          "Validated Telekom communication visualization is unavailable; mission and city remain active."
        );
      }
    }
  }

  // The historical ambulance connectivity renderer remains archived but is not instantiated in 012M.4.
  if (unifiedBosConnectivityEnabled && recoveryCity && validatedNetworkAssociation && validatedAutomaticBOSPriority &&
      window.MissionBosBosBackhaulRenderer && window.MISSION_BOS_MISSION_001_NETWORK_POLISH_PLAN) {
    validatedBosBackhaul = window.MissionBosBosBackhaulRenderer.create({
      scene: scene,
      recoveryCity: recoveryCity,
      associationRuntime: validatedNetworkAssociation,
      priorityRuntime: validatedAutomaticBOSPriority,
      networkRealismPlan: window.MISSION_BOS_NETWORK_REALISM_PLAN,
      recoveryPlan: networkRecoveryPolishEnabled ? window.MISSION_BOS_NETWORK_RECOVERY_PLAN : null,
      unifiedPlan: window.MISSION_BOS_UNIFIED_BOS_CONNECTIVITY_PLAN,
      visualFactory: window.MissionBosBosLinkVisualFactory,
      plan: window.MISSION_BOS_MISSION_001_NETWORK_POLISH_PLAN
    });
    const backhaulManifest = validatedBosBackhaul.getManifest();
    const backhaulSafety = validatedBosBackhaul.getSafetyStatus();
    if (!backhaulManifest || backhaulManifest.status !== "PASSED" ||
        !backhaulSafety || backhaulSafety.status !== "PASSED") {
      console.error("BOS backhaul renderer validation failed.");
    }
  } else {
    console.error("BOS backhaul renderer dependencies are missing.");
  }

  if (window.MissionBosMission003ConnectivityParityValidator &&
      validatedMission003ConnectivityParityPlanValidation &&
      validatedMission003ConnectivityParityPlanValidation.status === "PASSED") {
    validatedMission003ConnectivityParityRuntimeValidation =
      window.MissionBosMission003ConnectivityParityValidator.validateRuntime({
        unifiedRuntime: validatedUnifiedBosConnectivity,
        associationRuntime: validatedNetworkAssociation,
        mission003ConnectivityRuntime: validatedMission003Connectivity,
        backhaulRuntime: validatedBosBackhaul,
        mission003Runtime: validatedMission003,
        recoveryPlan: window.MISSION_BOS_MISSION_003_CONNECTIVITY_RECOVERY_PLAN
      });
    window.MissionBosMission003ConnectivityParityValidator.logResult(
      validatedMission003ConnectivityParityRuntimeValidation
    );
    window.MissionBosMission003ConnectivityParityRuntimeValidation =
      validatedMission003ConnectivityParityRuntimeValidation;
  } else {
    validatedMission003ConnectivityParityRuntimeValidation = {
      status: "FAILED",
      errors: ["Mission 003 connectivity parity runtime validation is unavailable."]
    };
    console.error("Mission 003 connectivity parity runtime validation is unavailable.");
  }

  if (window.MissionBosMission003ConnectivityRecoveryValidator &&
      validatedMission003ConnectivityRecoveryPlanValidation &&
      validatedMission003ConnectivityRecoveryPlanValidation.status === "PASSED") {
    validatedMission003ConnectivityRecoveryRuntimeValidation =
      window.MissionBosMission003ConnectivityRecoveryValidator.validateRuntime({
        plan: window.MISSION_BOS_MISSION_003_CONNECTIVITY_RECOVERY_PLAN,
        mission003Runtime: validatedMission003,
        responseRuntime: validatedMission003Response,
        associationRuntime: validatedNetworkAssociation,
        priorityRuntime: validatedAutomaticBOSPriority,
        cellLoadRuntime: validatedCellLoad,
        capacityRuntime: validatedCellCapacity,
        unifiedConnectivityRuntime: validatedUnifiedBosConnectivity,
        stadtwerkeRuntime: validatedStadtwerkeVehicle
      });
    window.MissionBosMission003ConnectivityRecoveryValidator.logResult(
      validatedMission003ConnectivityRecoveryRuntimeValidation
    );
    window.MissionBosMission003ConnectivityRecoveryRuntimeValidation =
      validatedMission003ConnectivityRecoveryRuntimeValidation;
  } else {
    validatedMission003ConnectivityRecoveryRuntimeValidation = {
      status: "FAILED",
      errors: ["Mission 003 connectivity recovery runtime validation is unavailable."]
    };
    console.error("Mission 003 connectivity recovery runtime validation is unavailable.");
  }

  if (window.MissionBosMission003IntegrationValidator) {
    validatedMission003IntegrationValidation = window.MissionBosMission003IntegrationValidator.validate({
      responsePlanValidation: validatedMission003ResponseValidation,
      missionPlanValidation: validatedMission003PlanValidation,
      networkExtensionValidation: validatedMission003NetworkExtensionValidation,
      registryExtensionValidation: validatedMission003RegistryExtensionValidation,
      connectivityParityPlanValidation: validatedMission003ConnectivityParityPlanValidation,
      connectivityParityRuntimeValidation: validatedMission003ConnectivityParityRuntimeValidation,
      connectivityRecoveryPlanValidation: validatedMission003ConnectivityRecoveryPlanValidation,
      connectivityRecoveryRuntimeValidation: validatedMission003ConnectivityRecoveryRuntimeValidation,
      registryRuntime: validatedMissionRegistry,
      registryPlan: window.MISSION_BOS_MISSION_REGISTRY_PLAN,
      mission001Runtime: validatedMission001,
      mission002Runtime: validatedMission002,
      mission003Runtime: validatedMission003,
      mission003SceneRuntime: validatedMission003Scene,
      mission003ResponseRuntime: validatedMission003Response,
      mission003ConnectivityRuntime: validatedMission003Connectivity,
      unifiedRuntime: validatedUnifiedBosConnectivity,
      backhaulRuntime: validatedBosBackhaul,
      stadtwerkeRuntime: validatedStadtwerkeVehicle,
      associationRuntime: validatedNetworkAssociation,
      cellLoadRuntime: validatedCellLoad,
      capacityRuntime: validatedCellCapacity
    });
    window.MissionBosMission003IntegrationValidator.logResult(validatedMission003IntegrationValidation);
  }

  if (RECOVERY_CONFIG.enableHandoverVisualization) {
    const handoverVisualizationDependenciesAvailable =
      !!window.MISSION_BOS_HANDOVER_VISUALIZATION_PLAN &&
      !!window.MissionBosHandoverVisualizationValidator &&
      !!window.MissionBosHandoverVisualization &&
      !!window.MISSION_BOS_RECOVERY_LAYOUT &&
      !!window.MISSION_BOS_INCIDENT_RESPONSE_PLAN &&
      !!window.MISSION_BOS_MISSION_001_PLAN &&
      !!window.MISSION_BOS_MISSION_001_SCENE_PLAN &&
      !!window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN &&
      !!window.MISSION_BOS_CELL_LOAD_PLAN &&
      !!window.MISSION_BOS_TELEKOM_COMMUNICATION_PLAN &&
      !!validatedResponseVehicles &&
      !!validatedCellLoad &&
      !!validatedNetworkAssociation &&
      !!validatedTelekomCommunication;

    if (!handoverVisualizationDependenciesAvailable) {
      console.error(
        "Validated handover visualization dependencies are missing. Existing mission systems remain active."
      );
    } else {
      const handoverRuntime = window.MissionBosHandoverVisualization.create({
        scene: scene,
        layout: window.MISSION_BOS_RECOVERY_LAYOUT,
        responseRuntime: validatedResponseVehicles,
        associationRuntime: validatedNetworkAssociation,
        cellLoadRuntime: validatedCellLoad,
        communicationRuntime: validatedTelekomCommunication,
        incidentPlan: window.MISSION_BOS_INCIDENT_RESPONSE_PLAN,
        missionPlan: window.MISSION_BOS_MISSION_001_PLAN,
        scenePlan: window.MISSION_BOS_MISSION_001_SCENE_PLAN,
        associationPlan: window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN_009N7_BASELINE || window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN,
        cellLoadPlan: window.MISSION_BOS_CELL_LOAD_PLAN,
        communicationPlan: window.MISSION_BOS_TELEKOM_COMMUNICATION_PLAN,
        plan: window.MISSION_BOS_HANDOVER_VISUALIZATION_PLAN,
        validator: window.MissionBosHandoverVisualizationValidator
      });
      const handoverManifest = handoverRuntime.getManifest();
      const handoverSafety = handoverRuntime.getSafetyStatus();
      if (!handoverManifest || handoverManifest.status !== "PASSED" ||
          !handoverSafety || handoverSafety.status !== "PASSED") {
        console.error(
          "Validated handover visualization is unavailable; existing mission systems remain active."
        );
        if (typeof handoverRuntime.dispose === "function") handoverRuntime.dispose();
      } else {
        validatedHandoverVisualization = handoverRuntime;
        previousMissionStateForHandoverVisualization = validatedMission001
          ? validatedMission001.getState()
          : "READY";
      }
    }
  }

  if (RECOVERY_CONFIG.enableValidatedPresenter) {
    const presenterRequiredRuntimes = [
      validatedMission001,
      validatedIncidentAccess,
      validatedTraffic,
      validatedResponseVehicles,
      validatedTelekomCommunication
    ];
    const presenterRuntimesPassed = presenterRequiredRuntimes.every((runtime) => {
      if (!runtime || typeof runtime.getSafetyStatus !== "function") return false;
      const safety = runtime.getSafetyStatus();
      return !!safety && safety.status === "PASSED";
    });
    const presenterDependenciesAvailable =
      !!window.MISSION_BOS_PRESENTER_PLAN &&
      !!window.MissionBosPresenterValidator &&
      !!window.MissionBosPresenterController &&
      !!window.MISSION_BOS_MISSION_001_PLAN &&
      presenterRuntimesPassed;

    if (!presenterDependenciesAvailable) {
      console.error(
        "Validated presenter files or runtimes are missing. Presenter controls remain disabled."
      );
      if (presenterPanel) presenterPanel.hidden = true;
    } else {
      validatedPresenter = window.MissionBosPresenterController.create({
        layout: window.MISSION_BOS_RECOVERY_LAYOUT,
        missionPlan: window.MISSION_BOS_MISSION_001_PLAN,
        plan: window.MISSION_BOS_PRESENTER_PLAN,
        validator: window.MissionBosPresenterValidator,
        missionRuntime: validatedMission001,
        incidentAccessRuntime: validatedIncidentAccess,
        trafficRuntime: validatedTraffic,
        responseRuntime: validatedResponseVehicles,
        communicationRuntime: validatedTelekomCommunication,
        cameraAdapter: presenterCameraAdapter,
        resetAdapter: presenterResetAdapter,
        elements: {
          panel: presenterPanel,
          modeButton: presenterModeButton,
          hintTitle: presenterHintTitle,
          hintMessage: presenterHintMessage,
          cameraButtons: presenterCameraButtons,
          nextButton: presenterNextButton,
          resetButton: presenterResetButton,
          status: presenterStatus
        }
      });

      const presenterManifest = validatedPresenter.getManifest();
      const presenterSafety = validatedPresenter.getSafetyStatus();
      if (
        !presenterManifest || presenterManifest.status !== "PASSED" ||
        !presenterSafety || presenterSafety.status !== "PASSED"
      ) {
        console.error("Validated presenter controls are unavailable; the base demo remains active.");
      }
    }
  }

  if (RECOVERY_CONFIG.enableExplorationInterface) {
    const explorationDependenciesAvailable =
      !!window.MISSION_BOS_EXPLORATION_INTERFACE_PLAN &&
      !!window.MissionBosExplorationInterfaceValidator &&
      !!window.MissionBosExplorationInterface &&
      !!window.MISSION_BOS_RECOVERY_LAYOUT &&
      !!window.MISSION_BOS_MISSION_001_PLAN &&
      !!window.MISSION_BOS_PRESENTER_PLAN &&
      !!window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN &&
      !!window.MISSION_BOS_CELL_LOAD_PLAN &&
      !!window.MISSION_BOS_HANDOVER_VISUALIZATION_PLAN &&
      !!validatedPresenter;

    if (!explorationDependenciesAvailable) {
      console.error(
        "Exploration interface dependencies are missing. The right dashboard remains available without a fallback overlay."
      );
    } else {
      const explorationRuntime = window.MissionBosExplorationInterface.create({
        plan: window.MISSION_BOS_EXPLORATION_INTERFACE_PLAN,
        validator: window.MissionBosExplorationInterfaceValidator,
        layout: window.MISSION_BOS_RECOVERY_LAYOUT,
        missionPlan: window.MISSION_BOS_MISSION_001_PLAN,
        presenterPlan: window.MISSION_BOS_PRESENTER_PLAN,
        associationPlan: window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN_009N7_BASELINE || window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN,
        cellLoadPlan: window.MISSION_BOS_CELL_LOAD_PLAN,
        handoverPlan: window.MISSION_BOS_HANDOVER_VISUALIZATION_PLAN,
        presenterRuntime: validatedPresenter,
        elements: {
          app: document.getElementById("app"),
          sceneContainer: document.getElementById("scene-container"),
          infoPanel: document.getElementById("info-panel"),
          presenterPanel: document.getElementById("presenter-panel"),
          summary: document.getElementById("exploration-control-summary"),
          summaryState: document.getElementById("exploration-control-summary-state")
        }
      });
      const explorationManifest = explorationRuntime.getManifest();
      const explorationSafety = explorationRuntime.getSafetyStatus();
      if (!explorationManifest || explorationManifest.status !== "PASSED" ||
          !explorationSafety || explorationSafety.status !== "PASSED") {
        console.error(
          "Compact exploration interface validation failed. Existing mission and dashboard systems remain active."
        );
      } else {
        validatedExplorationInterface = explorationRuntime;
      }
    }
  }

  if (RECOVERY_CONFIG.enableNetworkInspection) {
    const inspectionDependenciesAvailable =
      !!window.MISSION_BOS_NETWORK_EXPLORATION_PLAN &&
      !!window.MissionBosNetworkInspectionController &&
      !!recoveryCity &&
      !!validatedResponseVehicles &&
      !!validatedTraffic &&
      !!validatedPedestrians &&
      !!validatedNetworkAssociation &&
      !!validatedCivilianConnectivity &&
      !!validatedCellLoad &&
      !!validatedCellCapacity &&
      !!validatedMission001 &&
      !!validatedCivilianConnectivityVisuals;

    if (!inspectionDependenciesAvailable) {
      console.error(
        "Network inspection dependencies are missing. The existing city, mission and dashboard remain active."
      );
    } else {
      const inspectionRuntime = window.MissionBosNetworkInspectionController.create({
        plan: window.MISSION_BOS_NETWORK_EXPLORATION_PLAN,
        camera: camera,
        recoveryCity: recoveryCity,
        responseRuntime: validatedResponseVehicles,
        trafficRuntime: validatedTraffic,
        pedestrianRuntime: validatedPedestrians,
        associationRuntime: validatedNetworkAssociation,
        civilianConnectivityRuntime: validatedCivilianConnectivity,
        cellLoadRuntime: validatedCellLoad,
        capacityRuntime: validatedCellCapacity,
        missionRuntime: validatedMission001,
        civilianVisualRuntime: validatedCivilianConnectivityVisuals,
        elements: {
          infoPanel: document.getElementById("info-panel"),
          panel: document.getElementById("network-inspection-panel"),
          name: document.getElementById("network-inspection-name"),
          type: document.getElementById("network-inspection-type"),
          servingCell: document.getElementById("network-inspection-serving-cell"),
          cellLoad: document.getElementById("network-inspection-cell-load"),
          serviceState: document.getElementById("network-inspection-service-state"),
          lastHandover: document.getElementById("network-inspection-last-handover"),
          note: document.getElementById("network-inspection-note")
        }
      });
      const inspectionManifest = inspectionRuntime.getManifest();
      const inspectionSafety = inspectionRuntime.getSafetyStatus();
      if (!inspectionManifest || inspectionManifest.status !== "PASSED" ||
          !inspectionSafety || inspectionSafety.status !== "PASSED") {
        console.error(
          "Network inspection validation failed. No fallback inspection overlay was created."
        );
      } else {
        validatedNetworkInspection = inspectionRuntime;
      }
    }
  }

  runPresentationPolishValidation();

  if (RECOVERY_CONFIG.enableReleaseAudit) {
    runMissionBosReleaseAudit();
  } else {
    console.info(
      "MISSION BOS 009N DEVELOPMENT: 008R.12 release audit intentionally disabled; FINAL baseline remains archived."
    );
  }
} else if (RECOVERY_CONFIG.enableLegacyWorld) {
  createGround();
  cityDistrictManager.createDistrictGrounds();
  createRoads();
  createParksAndParking();
  createBuildings();
  stationManager.init();
  cityDistrictManager.createLandmarks();
  roadNetwork.drawDebugRoute("fire_station_to_incident", roadNetworkDebugGroup, 0x00a6ff);
  createTrees();
  createBushes();
  createStreetLights();
  createMobileTower();
}

if (RECOVERY_CONFIG.enableResponseVehicles) VehicleManager.init();
if (RECOVERY_CONFIG.enableMissionVisuals) createMissionIncidentVisuals();
if (RECOVERY_CONFIG.enableLegacyTraffic) trafficManager.init();
if (RECOVERY_CONFIG.enablePedestrians) pedestrianManager.init();
if (RECOVERY_CONFIG.enableCommunicationRenderer) CommunicationRenderer.init();

bindControls();
uiManager.updateAll(true);
window.addEventListener("beforeunload", function () {
  if (validatedBOSActivationImpact && typeof validatedBOSActivationImpact.dispose === "function") validatedBOSActivationImpact.dispose();
  if (validatedMission004 && typeof validatedMission004.dispose === "function") validatedMission004.dispose();
  if (validatedMission004Connectivity && typeof validatedMission004Connectivity.dispose === "function") validatedMission004Connectivity.dispose();
  if (validatedMission004Foundation && typeof validatedMission004Foundation.dispose === "function") validatedMission004Foundation.dispose();
  if (validatedMission003Connectivity && typeof validatedMission003Connectivity.dispose === "function") validatedMission003Connectivity.dispose();
  if (validatedBosBackhaul && typeof validatedBosBackhaul.dispose === "function") validatedBosBackhaul.dispose();
  if (validatedUnifiedBosConnectivity && typeof validatedUnifiedBosConnectivity.dispose === "function") validatedUnifiedBosConnectivity.dispose();
  if (validatedTelekomCommunication && typeof validatedTelekomCommunication.dispose === "function") validatedTelekomCommunication.dispose();
  if (validatedMission003 && typeof validatedMission003.dispose === "function") validatedMission003.dispose();
  if (validatedStadtwerkeVehicle && typeof validatedStadtwerkeVehicle.dispose === "function") {
    validatedStadtwerkeVehicle.dispose();
  }
});

animate();

/* -------------------------------------------------------------------------- */
/* Licht und Himmel                                                           */
/* -------------------------------------------------------------------------- */

function initLights() {
  ambientLight = new THREE.AmbientLight(0xffffff, 0.64);
  scene.add(ambientLight);

  sunLight = new THREE.DirectionalLight(0xfff5dc, 1.28);
  sunLight.position.set(32, 48, 24);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.left = -70;
  sunLight.shadow.camera.right = 70;
  sunLight.shadow.camera.top = 70;
  sunLight.shadow.camera.bottom = -70;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 120;
  scene.add(sunLight);

  softSkyLight = new THREE.HemisphereLight(0xcfefff, 0x6d8662, 0.68);
  scene.add(softSkyLight);
}

function createSkyDome() {
  const geometry = new THREE.SphereGeometry(190, 32, 16);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(0x7fb9ee) },
      horizonColor: { value: new THREE.Color(0xf6e4c9) },
      bottomColor: { value: new THREE.Color(0xb7d9f2) }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        vec3 lower = mix(bottomColor, horizonColor, smoothstep(-0.25, 0.28, h));
        vec3 color = mix(lower, topColor, smoothstep(0.18, 0.95, h));
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  skyDome = new THREE.Mesh(geometry, material);
  scene.add(skyDome);

  const sunDisc = new THREE.Mesh(
    new THREE.CircleGeometry(5.4, 32),
    new THREE.MeshBasicMaterial({
      color: 0xfff0be,
      transparent: true,
      opacity: 0.72,
      depthWrite: false
    })
  );
  sunDisc.position.set(64, 58, -82);
  sunDisc.lookAt(0, 0, 0);
  scene.add(sunDisc);
}

/* -------------------------------------------------------------------------- */
/* Boden, Bezirke und Straßen                                                 */
/* -------------------------------------------------------------------------- */

function createGround() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(118, 118),
    new THREE.MeshStandardMaterial({
      color: 0x6e9a5b,
      roughness: 0.92
    })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}

function createDistrictPatch(x, z, width, depth, color) {
  const patch = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.94
    })
  );
  patch.rotation.x = -Math.PI / 2;
  patch.position.set(x, 0.012, z);
  patch.receiveShadow = true;
  parkGroup.add(patch);
}

function createRoads() {
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x28303a,
    roughness: 0.88
  });

  const secondaryRoadMaterial = new THREE.MeshStandardMaterial({
    color: 0x303844,
    roughness: 0.9
  });

  const campusRoadMaterial = new THREE.MeshStandardMaterial({
    color: 0x36414c,
    roughness: 0.9
  });

  const sidewalkMaterial = new THREE.MeshStandardMaterial({
    color: 0xc8bfad,
    roughness: 0.92
  });

  const curbMaterial = new THREE.MeshBasicMaterial({
    color: 0xe5dfcc,
    transparent: true,
    opacity: 0.5
  });

  const markingMaterial = new THREE.MeshBasicMaterial({
    color: 0xf2f5d0,
    transparent: true,
    opacity: 0.86
  });

  addRoadWithSidewalk(8, 104, 0, 0, roadMaterial, sidewalkMaterial, curbMaterial, 0.018);
  addRoadWithSidewalk(104, 8, 0, 0, roadMaterial, sidewalkMaterial, curbMaterial, 0.02);

  addRoadWithSidewalk(5.4, 84, -24, 0, secondaryRoadMaterial, sidewalkMaterial, curbMaterial, 0.019);
  addRoadWithSidewalk(5.4, 84, 24, 0, secondaryRoadMaterial, sidewalkMaterial, curbMaterial, 0.019);
  addRoadWithSidewalk(84, 5.4, 0, -24, secondaryRoadMaterial, sidewalkMaterial, curbMaterial, 0.022);
  addRoadWithSidewalk(84, 5.4, 0, 24, secondaryRoadMaterial, sidewalkMaterial, curbMaterial, 0.022);

  addRoadWithSidewalk(5.4, 26, 38, -39, campusRoadMaterial, sidewalkMaterial, curbMaterial, 0.024);
  addRoadWithSidewalk(30, 5.4, 35, -36, campusRoadMaterial, sidewalkMaterial, curbMaterial, 0.026);
  addRoadWithSidewalk(30, 5.0, 38, 0, campusRoadMaterial, sidewalkMaterial, curbMaterial, 0.026);

  addRoadWithSidewalk(5.0, 26, -42, 24, secondaryRoadMaterial, sidewalkMaterial, curbMaterial, 0.021);
  addRoadWithSidewalk(24, 5.0, -36, 36, secondaryRoadMaterial, sidewalkMaterial, curbMaterial, 0.021);

  addRoundabout(0, 0, 7.3, 4.1, roadMaterial, markingMaterial);
  addRoadCurve(24, -36, 6.8, 3.6, 0, Math.PI / 2, campusRoadMaterial);

  for (let z = -46; z <= 46; z += 8) {
    addRoadDash(0, z, 0.28, 3.5, markingMaterial);
  }

  for (let x = -46; x <= 46; x += 8) {
    addRoadDash(x, 0, 3.5, 0.28, markingMaterial);
  }

  [-24, 24, 38].forEach((x) => {
    for (let z = -44; z <= 36; z += 10) {
      addRoadDash(x, z, 0.22, 2.6, markingMaterial);
    }
  });

  [-24, 24, -36, 36].forEach((z) => {
    for (let x = -44; x <= 46; x += 10) {
      addRoadDash(x, z, 2.6, 0.22, markingMaterial);
    }
  });

  createCrosswalk(-7, 0, "vertical");
  createCrosswalk(7, 0, "vertical");
  createCrosswalk(0, -7, "horizontal");
  createCrosswalk(0, 7, "horizontal");
  createCrosswalk(-24, 0, "horizontal");
  createCrosswalk(24, 0, "horizontal");
  createCrosswalk(0, -24, "vertical");
  createCrosswalk(0, 24, "vertical");
  createCrosswalk(24, -24, "vertical");
  createCrosswalk(24, -36, "horizontal");
  createCrosswalk(38, -36, "horizontal");
  createCrosswalk(44, 0, "horizontal");
}

function addRoadWithSidewalk(width, depth, x, z, roadMaterial, sidewalkMaterial, curbMaterial, y) {
  const sidewalk = new THREE.Mesh(
    new THREE.PlaneGeometry(width + 2.8, depth + 2.8),
    sidewalkMaterial
  );
  sidewalk.rotation.x = -Math.PI / 2;
  sidewalk.position.set(x, y - 0.006, z);
  sidewalk.receiveShadow = true;
  roadGroup.add(sidewalk);

  addRoadPlane(width, depth, x, z, roadMaterial, y);
  addRoadCurbs(width, depth, x, z, curbMaterial);
}

function addRoadCurbs(width, depth, x, z, material) {
  const isVertical = depth >= width;

  if (isVertical) {
    [-1, 1].forEach((side) => {
      const curb = new THREE.Mesh(new THREE.PlaneGeometry(0.15, depth), material);
      curb.rotation.x = -Math.PI / 2;
      curb.position.set(x + side * (width / 2 + 0.18), 0.063, z);
      roadGroup.add(curb);
    });
  } else {
    [-1, 1].forEach((side) => {
      const curb = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.15), material);
      curb.rotation.x = -Math.PI / 2;
      curb.position.set(x, 0.063, z + side * (depth / 2 + 0.18));
      roadGroup.add(curb);
    });
  }
}

function addRoadPlane(width, depth, x, z, material, y) {
  const road = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
  road.rotation.x = -Math.PI / 2;
  road.position.set(x, y, z);
  road.receiveShadow = true;
  roadGroup.add(road);
}

function addRoadCurve(x, z, radius, width, thetaStart, thetaLength, material) {
  const curve = new THREE.Mesh(
    new THREE.RingGeometry(radius - width / 2, radius + width / 2, 48, 2, thetaStart, thetaLength),
    material
  );
  curve.rotation.x = -Math.PI / 2;
  curve.position.set(x, 0.028, z);
  curve.receiveShadow = true;
  roadGroup.add(curve);
}

function addRoundabout(x, z, outerRadius, innerRadius, material, markingMaterial) {
  const asphalt = new THREE.Mesh(
    new THREE.RingGeometry(innerRadius, outerRadius, 72),
    material
  );
  asphalt.rotation.x = -Math.PI / 2;
  asphalt.position.set(x, 0.031, z);
  asphalt.receiveShadow = true;
  roadGroup.add(asphalt);

  const innerGreen = new THREE.Mesh(
    new THREE.CircleGeometry(innerRadius - 0.25, 48),
    new THREE.MeshStandardMaterial({
      color: 0x5f985b,
      roughness: 0.9
    })
  );
  innerGreen.rotation.x = -Math.PI / 2;
  innerGreen.position.set(x, 0.034, z);
  roadGroup.add(innerGreen);

  const laneRing = new THREE.Mesh(
    new THREE.RingGeometry(outerRadius - 0.28, outerRadius - 0.2, 72),
    markingMaterial
  );
  laneRing.rotation.x = -Math.PI / 2;
  laneRing.position.set(x, 0.04, z);
  roadGroup.add(laneRing);
}

function addRoadDash(x, z, width, depth, material) {
  const dash = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
  dash.rotation.x = -Math.PI / 2;
  dash.position.set(x, 0.055, z);
  roadGroup.add(dash);
}

function createCrosswalk(x, z, direction) {
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.72
  });

  for (let i = -3; i <= 3; i++) {
    const stripe = new THREE.Mesh(
      direction === "vertical"
        ? new THREE.PlaneGeometry(0.55, 4.8)
        : new THREE.PlaneGeometry(4.8, 0.55),
      material
    );

    stripe.rotation.x = -Math.PI / 2;

    if (direction === "vertical") {
      stripe.position.set(x + i * 0.9, 0.07, z);
    } else {
      stripe.position.set(x, 0.07, z + i * 0.9);
    }

    roadGroup.add(stripe);
  }
}

/* -------------------------------------------------------------------------- */
/* Stadtobjekte                                                               */
/* -------------------------------------------------------------------------- */

function createParksAndParking() {
  createGreenArea(-38, 35, 20, 12, 0x7db96b);
  createGreenArea(-37, 18, 14, 10, 0x79ad62);
  createGreenArea(8, 18, 14, 10, 0x75aa60);
  createGreenArea(36, -50, 30, 8, 0x6cae67);
  createGreenArea(46, -31, 10, 9, 0x75aa60);

  createParkingLot(50, -19, 10, 8, Math.PI / 2);
  createParkingLot(31, -28, 10, 7, Math.PI / 2);
  createParkingLot(-42, 8, 10, 8, Math.PI / 2);

  createWalkingPath(-38, 35, 17, 1.1, 0);
  createWalkingPath(-37, 18, 11, 1.1, Math.PI / 2);
  createWalkingPath(8, 18, 11, 0.9, 0);
  createWalkingPath(36, -50, 24, 0.9, 0);
}

function createGreenArea(x, z, width, depth, color) {
  const area = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshStandardMaterial({ color, roughness: 0.95 })
  );
  area.rotation.x = -Math.PI / 2;
  area.position.set(x, 0.035, z);
  area.receiveShadow = true;
  parkGroup.add(area);

  const borderMaterial = new THREE.MeshBasicMaterial({
    color: 0xe3dec5,
    transparent: true,
    opacity: 0.65
  });

  const borders = [
    [width, 0.22, 0, depth / 2],
    [width, 0.22, 0, -depth / 2],
    [0.22, depth, width / 2, 0],
    [0.22, depth, -width / 2, 0]
  ];

  borders.forEach(([w, d, ox, oz]) => {
    const border = new THREE.Mesh(new THREE.PlaneGeometry(w, d), borderMaterial);
    border.rotation.x = -Math.PI / 2;
    border.position.set(x + ox, 0.052, z + oz);
    parkGroup.add(border);
  });
}

function createWalkingPath(x, z, length, width, rotation) {
  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(length, width),
    new THREE.MeshStandardMaterial({ color: 0xd6c7a8, roughness: 0.9 })
  );
  path.rotation.x = -Math.PI / 2;
  path.rotation.z = rotation;
  path.position.set(x, 0.06, z);
  path.receiveShadow = true;
  parkGroup.add(path);
}

function createParkingLot(x, z, width, depth, rotation) {
  const asphalt = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshStandardMaterial({ color: 0x3a414b, roughness: 0.88 })
  );
  asphalt.rotation.x = -Math.PI / 2;
  asphalt.rotation.z = rotation;
  asphalt.position.set(x, 0.045, z);
  asphalt.receiveShadow = true;
  parkGroup.add(asphalt);

  const stripeMaterial = new THREE.MeshBasicMaterial({
    color: 0xf4f2dc,
    transparent: true,
    opacity: 0.7
  });

  for (let i = -2; i <= 2; i++) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.12, depth - 1.2), stripeMaterial);
    stripe.rotation.x = -Math.PI / 2;
    stripe.rotation.z = rotation;

    const offset = new THREE.Vector3(i * 2.2, 0, 0);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotation);
    stripe.position.set(x + offset.x, 0.07, z + offset.z);
    parkGroup.add(stripe);
  }
}

function createBuildings() {
  const buildingColors = [
    0x8c9aaa,
    0x74889c,
    0xa38a73,
    0x81927f,
    0x7890ab,
    0xae9a83,
    0x9ca6a8,
    0x747d88
  ];

  const buildings = [
    [-16, -15, 5.4, 5.6, 13],
    [-9, -15, 4.4, 5.2, 9],
    [9, -15, 4.8, 5.4, 10],
    [16, -15, 5.8, 6.0, 15],
    [-16, 15, 5.2, 5.4, 14],
    [-9, 15, 4.2, 5.2, 10],
    [9, 15, 4.5, 5.2, 11],
    [16, 15, 5.4, 5.6, 16],

    [-49, 29, 4.8, 5.0, 7],
    [-40, 29, 5.2, 5.0, 8],
    [-31, 31, 4.7, 4.8, 7],
    [-49, 17, 4.5, 4.8, 7],
    [-39, 17, 5.0, 5.0, 8],
    [-31, 17, 4.6, 4.6, 7],
    [-48, 43, 4.7, 4.8, 8],
    [-37, 44, 5.2, 5.0, 10],
    [-18, 41, 5.0, 5.0, 9],
    [-10, 40, 4.4, 4.8, 7],
    [-43, -42, 4.8, 4.8, 7],
    [-33, -40, 5.4, 5.0, 10],
    [-17, -40, 5.0, 5.0, 8],
    [-9, -40, 4.4, 4.8, 7],

    [31, 17, 5.0, 5.6, 9],
    [31, 30, 5.4, 5.2, 11],
    [42, 31, 4.8, 5.0, 9],
    [9, 40, 4.6, 4.8, 8],
    [17, 40, 5.2, 5.0, 9]
  ];

  buildings.forEach(([x, z, width, depth, height], index) => {
    createBuilding(x, z, width, depth, height, buildingColors[index % buildingColors.length]);
  });
}

function createBuilding(x, z, width, depth, height, color) {
  const building = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.78,
      metalness: 0.04
    })
  );

  building.position.set(x, height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  cityGroup.add(building);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.3, 0.35, depth + 0.3),
    new THREE.MeshStandardMaterial({
      color: 0x3a404a,
      roughness: 0.82
    })
  );

  roof.position.set(x, height + 0.18, z);
  roof.castShadow = true;
  cityGroup.add(roof);

  addWindows(x, z, width, depth, height);
}

function addWindows(x, z, width, depth, height) {
  const litWindowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffe9af,
    transparent: true,
    opacity: 0.68
  });

  const mutedWindowMaterial = new THREE.MeshBasicMaterial({
    color: 0xbfd6e8,
    transparent: true,
    opacity: 0.32
  });

  const floors = Math.max(2, Math.floor(height / 2));
  const columns = Math.max(2, Math.floor(width / 1.4));

  for (let floor = 1; floor < floors; floor++) {
    for (let col = 0; col < columns; col++) {
      const offsetX = -width / 2 + 0.8 + col * ((width - 1.6) / Math.max(1, columns - 1));
      const y = floor * 1.7;
      const material = (floor + col) % 3 === 0 ? litWindowMaterial : mutedWindowMaterial;

      const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.65), material);
      frontWindow.position.set(x + offsetX, y, z + depth / 2 + 0.011);
      cityGroup.add(frontWindow);

      const backWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.65), material);
      backWindow.rotation.y = Math.PI;
      backWindow.position.set(x + offsetX, y, z - depth / 2 - 0.011);
      cityGroup.add(backWindow);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* BOS-Standorte                                                              */
/* -------------------------------------------------------------------------- */

function createFireStation(position) {
  const group = new THREE.Group();
  group.position.copy(position);
  stationGroup.add(group);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(13, 5, 8),
    new THREE.MeshStandardMaterial({
      color: 0xb83a2d,
      roughness: 0.72
    })
  );
  body.position.y = 2.5;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(13.6, 0.45, 8.6),
    new THREE.MeshStandardMaterial({
      color: 0x61251f,
      roughness: 0.78
    })
  );
  roof.position.y = 5.25;
  roof.castShadow = true;
  group.add(roof);

  const garageMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8e4dc,
    roughness: 0.55
  });

  [-3.7, 0, 3.7].forEach((x) => {
    const door = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.1, 0.12), garageMaterial);
    door.position.set(x, 1.75, 4.06);
    group.add(door);

    for (let i = 0; i < 3; i++) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(3.05, 0.05, 0.14),
        new THREE.MeshBasicMaterial({ color: 0x9fa8b3 })
      );
      stripe.position.set(x, 0.95 + i * 0.72, 4.14);
      group.add(stripe);
    }
  });

  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 8, 2.4),
    new THREE.MeshStandardMaterial({
      color: 0x9f2f27,
      roughness: 0.72
    })
  );
  tower.position.set(-7.1, 4, -1.4);
  tower.castShadow = true;
  group.add(tower);

  const light = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 10),
    new THREE.MeshBasicMaterial({
      color: 0xffe0a3,
      transparent: true,
      opacity: 0.95
    })
  );
  light.position.set(-7.1, 8.25, -1.4);
  light.userData.isStationLight = true;
  group.add(light);

  const apron = new THREE.Mesh(
    new THREE.PlaneGeometry(17, 12),
    new THREE.MeshStandardMaterial({
      color: 0x3a414b,
      roughness: 0.88
    })
  );
  apron.rotation.x = -Math.PI / 2;
  apron.position.set(0, 0.04, 8.8);
  apron.receiveShadow = true;
  group.add(apron);

  const laneMaterial = new THREE.MeshBasicMaterial({
    color: 0xf4f2dc,
    transparent: true,
    opacity: 0.68
  });

  [-3.7, 0, 3.7].forEach((x) => {
    const bayMark = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.16), laneMaterial);
    bayMark.rotation.x = -Math.PI / 2;
    bayMark.position.set(x, 0.08, 11.7);
    group.add(bayMark);
  });

  const sign = createTextSignTexture("FEUERWEHR", 0xfff1f1, 0xb83a2d);
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.4, 0.8),
    new THREE.MeshBasicMaterial({
      map: sign,
      transparent: true
    })
  );
  signMesh.position.set(0, 4.45, 4.16);
  group.add(signMesh);

  return group;
}

function createDispatchCenter(position) {
  const group = new THREE.Group();
  group.position.copy(position);
  scene.add(group);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(9, 4.8, 6.6),
    new THREE.MeshStandardMaterial({
      color: 0x526985,
      roughness: 0.72
    })
  );
  body.position.y = 2.4;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const upper = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 2.2, 4.8),
    new THREE.MeshStandardMaterial({
      color: 0x344d6b,
      roughness: 0.68
    })
  );
  upper.position.set(0, 5.6, 0);
  upper.castShadow = true;
  group.add(upper);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(9.6, 0.35, 7.2),
    new THREE.MeshStandardMaterial({
      color: 0x22334a,
      roughness: 0.75
    })
  );
  roof.position.y = 4.98;
  roof.castShadow = true;
  group.add(roof);

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 3.2, 10),
    new THREE.MeshStandardMaterial({
      color: 0xd7e5ef,
      roughness: 0.4,
      metalness: 0.4
    })
  );
  antenna.position.set(2.4, 7.2, 1.6);
  antenna.castShadow = true;
  group.add(antenna);

  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 14, 10),
    new THREE.MeshBasicMaterial({
      color: 0x67d6ff,
      transparent: true,
      opacity: 0.9
    })
  );
  beacon.position.set(2.4, 8.9, 1.6);
  beacon.userData.isDispatchBeacon = true;
  group.add(beacon);

  const windowMaterial = new THREE.MeshBasicMaterial({
    color: 0x9bdfff,
    transparent: true,
    opacity: 0.62
  });

  for (let i = -2; i <= 2; i++) {
    const window = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.55), windowMaterial);
    window.position.set(i * 1.25, 2.8, -3.32);
    group.add(window);
  }

  const sign = createTextSignTexture("LEITSTELLE", 0xffffff, 0x00a6ff);
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.0, 0.75),
    new THREE.MeshBasicMaterial({
      map: sign,
      transparent: true
    })
  );
  signMesh.position.set(0, 3.9, -3.36);
  group.add(signMesh);

  const satellite = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 10),
    new THREE.MeshBasicMaterial({
      color: 0x00a6ff,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    })
  );
  satellite.position.set(2.4, 8.9, 1.6);
  satellite.userData.isDispatchBeacon = true;
  group.add(satellite);

  return group;
}

function createPoliceStation(position) {
  const group = new THREE.Group();
  group.position.copy(position);
  stationGroup.add(group);

  const forecourt = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 8),
    new THREE.MeshStandardMaterial({
      color: 0x3a414b,
      roughness: 0.88
    })
  );
  forecourt.rotation.x = -Math.PI / 2;
  forecourt.position.set(0, 0.035, -6.5);
  forecourt.receiveShadow = true;
  group.add(forecourt);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(8, 4.4, 6),
    new THREE.MeshStandardMaterial({
      color: 0x2f4f73,
      roughness: 0.72
    })
  );
  body.position.y = 2.2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 0.35, 6.5),
    new THREE.MeshStandardMaterial({
      color: 0x1d2e44,
      roughness: 0.78
    })
  );
  roof.position.y = 4.58;
  roof.castShadow = true;
  group.add(roof);

  const entry = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 2.2, 0.14),
    new THREE.MeshStandardMaterial({
      color: 0xc8d5df,
      roughness: 0.5
    })
  );
  entry.position.set(0, 1.15, -3.08);
  group.add(entry);

  const sign = createTextSignTexture("POLIZEI", 0xffffff, 0x1f73c9);
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 0.7),
    new THREE.MeshBasicMaterial({
      map: sign,
      transparent: true
    })
  );
  signMesh.position.set(0, 3.6, -3.1);
  group.add(signMesh);

  const policeVehicle = createParkedPoliceCar();
  policeVehicle.position.set(-2.2, 0.42, -6.6);
  policeVehicle.rotation.y = Math.PI / 2;
  group.add(policeVehicle);
  group.userData.policeVehicle = policeVehicle;

  const reservedSpace = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.16),
    new THREE.MeshBasicMaterial({
      color: 0xf4f2dc,
      transparent: true,
      opacity: 0.65
    })
  );
  reservedSpace.rotation.x = -Math.PI / 2;
  reservedSpace.position.set(1.9, 0.08, -6.4);
  group.add(reservedSpace);

  return group;
}

function createParkedPoliceCar() {
  const car = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.55, 2.8),
    new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.5
    })
  );
  body.position.y = 0.42;
  body.castShadow = true;
  body.receiveShadow = true;
  car.add(body);

  const blueStripe = new THREE.Mesh(
    new THREE.BoxGeometry(1.46, 0.16, 1.75),
    new THREE.MeshBasicMaterial({
      color: 0x1f73c9
    })
  );
  blueStripe.position.set(0, 0.56, 0);
  car.add(blueStripe);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.42, 1.1),
    new THREE.MeshStandardMaterial({
      color: 0xbfe6ff,
      roughness: 0.3
    })
  );
  cabin.position.set(0, 0.9, -0.18);
  car.add(cabin);

  const lightbar = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.12, 0.22),
    new THREE.MeshBasicMaterial({
      color: 0x1e9bff
    })
  );
  lightbar.position.set(0, 1.18, -0.15);
  lightbar.userData.isPoliceLight = true;
  car.add(lightbar);

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.74
  });

  [
    [-0.78, 0.22, -0.92],
    [0.78, 0.22, -0.92],
    [-0.78, 0.22, 0.92],
    [0.78, 0.22, 0.92]
  ].forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 12), wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    car.add(wheel);
  });

  return car;
}

/* -------------------------------------------------------------------------- */
/* Orientierung                                                               */
/* -------------------------------------------------------------------------- */

function createTownHall(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  landmarkGroup.add(group);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 5.5, 5.8),
    new THREE.MeshStandardMaterial({
      color: 0xb9a47d,
      roughness: 0.78
    })
  );
  body.position.y = 2.75;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(4.8, 2.4, 4),
    new THREE.MeshStandardMaterial({
      color: 0x6b3f2c,
      roughness: 0.72
    })
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 6.5;
  roof.castShadow = true;
  group.add(roof);

  const clock = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 24),
    new THREE.MeshBasicMaterial({
      color: 0xfff6d5,
      transparent: true,
      opacity: 0.9
    })
  );
  clock.position.set(0, 4.3, 2.92);
  group.add(clock);

  const sign = createBillboardLabel("Rathaus", 0xffd166);
  sign.position.set(x, 7.8, z + 1.6);
  landmarkGroup.add(sign);
}

function createSupermarket(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  landmarkGroup.add(group);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(8, 3.2, 6),
    new THREE.MeshStandardMaterial({
      color: 0x78906c,
      roughness: 0.76
    })
  );
  body.position.y = 1.6;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const front = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 1.0, 0.12),
    new THREE.MeshBasicMaterial({
      color: 0xcfffcf,
      transparent: true,
      opacity: 0.68
    })
  );
  front.position.set(0, 1.7, 3.05);
  group.add(front);

  const sign = createBillboardLabel("Supermarkt", 0x8ee58e);
  sign.position.set(x, 4.5, z + 1.5);
  landmarkGroup.add(sign);
}

function createBusStop(x, z, rotation) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  landmarkGroup.add(group);

  const shelter = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 0.12, 1.2),
    new THREE.MeshStandardMaterial({
      color: 0x9bdfff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.35
    })
  );
  shelter.position.set(0, 1.5, 0);
  shelter.castShadow = true;
  group.add(shelter);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.16, 1.5),
    new THREE.MeshStandardMaterial({
      color: 0x374151,
      roughness: 0.7
    })
  );
  roof.position.set(0, 2.3, 0);
  roof.castShadow = true;
  group.add(roof);

  const sign = createBillboardLabel("Bushaltestelle", 0x6ed6ff);
  sign.position.set(x, 3.5, z);
  landmarkGroup.add(sign);
}

function createSmallParkFeature(x, z) {
  const fountain = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.25, 0.35, 24),
    new THREE.MeshStandardMaterial({
      color: 0xb9c4cd,
      roughness: 0.55
    })
  );
  fountain.position.set(x, 0.18, z);
  fountain.castShadow = true;
  landmarkGroup.add(fountain);

  const water = new THREE.Mesh(
    new THREE.CircleGeometry(0.9, 24),
    new THREE.MeshBasicMaterial({
      color: 0x65c7ff,
      transparent: true,
      opacity: 0.55
    })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(x, 0.38, z);
  landmarkGroup.add(water);

  const sign = createBillboardLabel("Kleiner Park", 0x8ee58e);
  sign.position.set(x, 3.0, z + 2);
  landmarkGroup.add(sign);
}

function createTrees() {
  const treePositions = [
    [-50, -8], [-44, 8], [-34, 7], [-28, -7], [-17, 7], [-12, -7],
    [12, 7], [17, -7], [28, 7], [34, -7], [42, 8], [49, -8],
    [-50, 28], [-42, 34], [-35, 30], [-29, 35], [-14, 32], [-7, 34],
    [7, 34], [14, 32], [29, 35], [35, 30], [42, 34], [48, 28],
    [-50, -28], [-42, -34], [-35, -30], [-29, -35], [-14, -32], [-7, -34],
    [7, -34], [14, -32], [31, -47], [42, -48], [50, -36],
    [-48, 42], [-42, 44], [-32, 43], [-22, 42], [-18, 22], [-15, 27],
    [-29, 19], [-30, 27], [29, -31], [32, -25], [47, -28], [50, -22],
    [40, -51], [28, -51]
  ];

  treePositions.forEach(([x, z], index) => {
    createTree(x, z, 0.9 + (index % 4) * 0.12);
  });
}

function createTree(x, z, scale) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16 * scale, 0.24 * scale, 1.45 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x6b4426, roughness: 0.84 })
  );
  trunk.position.set(x, 0.72 * scale, z);
  trunk.castShadow = true;
  treeGroup.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.05 * scale, 0),
    new THREE.MeshStandardMaterial({ color: 0x347d48, roughness: 0.92 })
  );
  crown.position.set(x, 2.05 * scale, z);
  crown.castShadow = true;
  crown.receiveShadow = true;
  treeGroup.add(crown);
}

function createBushes() {
  const bushPositions = [
    [-42, -39], [-38, -32], [-33, -34], [-30, -42], [-17, 35], [-12, 39], [-8, 36],
    [35, 29], [40, 32], [42, 38], [33, 38], [9, -36], [13, -39], [18, -36],
    [-19, 20], [-15, 23], [-18, 29], [-29, 18], [-31, 29], [31, -12], [39, -10],
    [-42, 10], [-35, 13], [-39, 16], [14, 11], [18, 12], [-14, -12], [-18, -12],
    [28, -42], [30, -29], [45, -42], [48, -26], [36, -50], [46, 6], [51, 8]
  ];

  bushPositions.forEach(([x, z], index) => {
    createBush(x, z, 0.75 + (index % 3) * 0.12);
  });
}

function createBush(x, z, scale) {
  const bush = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.62 * scale, 0),
    new THREE.MeshStandardMaterial({
      color: indexSafeColor(x, z),
      roughness: 0.95
    })
  );

  bush.scale.set(1.35, 0.55, 0.9);
  bush.position.set(x, 0.42 * scale, z);
  bush.castShadow = true;
  bush.receiveShadow = true;
  bushGroup.add(bush);
}

function indexSafeColor(x, z) {
  return Math.round(Math.abs(x * 13 + z * 7)) % 2 === 0 ? 0x3f8d48 : 0x4a9850;
}

function createStreetLights() {
  const positions = [];

  for (let z = -46; z <= 46; z += 14) {
    positions.push([-5.8, z, 0]);
    positions.push([5.8, z, Math.PI]);
  }

  for (let x = -46; x <= 46; x += 14) {
    positions.push([x, -5.8, Math.PI / 2]);
    positions.push([x, 5.8, -Math.PI / 2]);
  }

  [-24, 24].forEach((roadX) => {
    for (let z = -34; z <= 34; z += 20) {
      positions.push([roadX - 3.8, z, 0]);
      positions.push([roadX + 3.8, z, Math.PI]);
    }
  });

  for (let x = 26; x <= 46; x += 10) {
    positions.push([x, -39.6, Math.PI / 2]);
    positions.push([x, -32.4, -Math.PI / 2]);
  }

  positions.forEach(([x, z, rotation], index) => {
    createStreetLight(x, z, rotation, index);
  });
}

function createStreetLight(x, z, rotation, index) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  streetLightGroup.add(group);

  const poleMaterial = new THREE.MeshStandardMaterial({
    color: 0x526070,
    roughness: 0.52,
    metalness: 0.35
  });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.4, 8), poleMaterial);
  pole.position.y = 1.7;
  pole.castShadow = true;
  group.add(pole);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.08), poleMaterial);
  arm.position.set(0.48, 3.25, 0);
  arm.castShadow = true;
  group.add(arm);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 8),
    new THREE.MeshBasicMaterial({
      color: 0xfff1b8,
      transparent: true,
      opacity: 0.78
    })
  );

  bulb.position.set(1.05, 3.17, 0);
  bulb.userData.phase = index * 0.37;
  animatedBulbs.push(bulb);
  group.add(bulb);
}

function createOrientationSigns() {
  createSignPost("BOS-Campus", 35, -52, 0x00a6ff);
  createSignPost("Feuerwehr", 44, -37, 0xff6a5c);
  createSignPost("Leitstelle", 51, -18, 0x6ed6ff);
  createSignPost("Polizei", 50, 8, 0x1f73c9);
  createSignPost("Wohngebiet", -45, 33, 0x8ee58e);
  createSignPost("Innenstadt", -4, 12, 0xffd166);
  createSignPost("Einsatzstelle", -20, 24, 0xff8f3d);
}

function createSignPost(text, x, z, colorHex) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  signGroup.add(group);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.06, 1.9, 8),
    new THREE.MeshStandardMaterial({
      color: 0x4f5b66,
      roughness: 0.55,
      metalness: 0.2
    })
  );
  pole.position.y = 0.95;
  group.add(pole);

  const texture = createTextSignTexture(text, 0xffffff, colorHex);
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(Math.min(5.2, 1.8 + text.length * 0.24), 0.72),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    })
  );
  panel.position.y = 1.9;
  group.add(panel);

  const light = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 8),
    new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.7
    })
  );
  light.position.y = 2.32;
  light.userData.signPulse = true;
  group.add(light);

  group.userData.isBillboardSign = true;
  billboards.push(group);
}

function createBillboardLabel(text, colorHex) {
  const texture = createTextSignTexture(text, 0xffffff, colorHex);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(Math.min(6.4, 2.2 + text.length * 0.25), 0.75),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    })
  );

  mesh.userData.isBillboardLabel = true;
  billboards.push(mesh);

  return mesh;
}

function createTextSignTexture(text, textColorHex, backgroundHex) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;

  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = `#${backgroundHex.toString(16).padStart(6, "0")}`;
  drawRoundedRect(context, 12, 22, 488, 84, 18);
  context.fill();

  context.strokeStyle = "rgba(255,255,255,0.75)";
  context.lineWidth = 4;
  drawRoundedRect(context, 12, 22, 488, 84, 18);
  context.stroke();

  context.fillStyle = `#${textColorHex.toString(16).padStart(6, "0")}`;
  context.font = "bold 38px Arial, Helvetica, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 256, 66);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawRoundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function updateBillboards() {
  billboards.forEach((item) => {
    if (item.userData.isBillboardSign) {
      item.lookAt(camera.position.x, item.position.y, camera.position.z);
    } else {
      item.lookAt(camera.position);
    }
  });
}

/* -------------------------------------------------------------------------- */
/* Mobilfunkmast                                                              */
/* -------------------------------------------------------------------------- */

function createMobileTower() {
  towerGroup = new THREE.Group();
  towerGroup.position.copy(stationManager.mobileTower.position);
  scene.add(towerGroup);

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0xdfe6ed,
    roughness: 0.42,
    metalness: 0.42
  });

  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x34404c,
    roughness: 0.72
  });

  const redMaterial = new THREE.MeshStandardMaterial({
    color: 0xd34b3f,
    roughness: 0.55,
    metalness: 0.08
  });

  const techPad = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.MeshStandardMaterial({
      color: 0x3a414b,
      roughness: 0.9
    })
  );
  techPad.rotation.x = -Math.PI / 2;
  techPad.position.y = 0.035;
  techPad.receiveShadow = true;
  towerGroup.add(techPad);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.55, 0.55, 24), darkMaterial);
  base.position.y = 0.28;
  base.castShadow = true;
  towerGroup.add(base);

  const fencedBase = new THREE.Mesh(
    new THREE.RingGeometry(3.8, 4.0, 32),
    new THREE.MeshBasicMaterial({
      color: 0xd8e3ed,
      transparent: true,
      opacity: 0.55
    })
  );
  fencedBase.rotation.x = -Math.PI / 2;
  fencedBase.position.y = 0.09;
  towerGroup.add(fencedBase);

  const cabinetMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8e3ed,
    roughness: 0.65,
    metalness: 0.1
  });

  [[-2.7, 0.55, 2.1], [2.6, 0.55, -2.0]].forEach(([x, y, z]) => {
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.75), cabinetMaterial);
    cabinet.position.set(x, y, z);
    cabinet.castShadow = true;
    towerGroup.add(cabinet);
  });

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.25, 14, 16), metalMaterial);
  mast.position.y = 7.2;
  mast.castShadow = true;
  towerGroup.add(mast);

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const leg = createTowerLine(
      new THREE.Vector3(Math.cos(angle) * 1.05, 0.55, Math.sin(angle) * 1.05),
      new THREE.Vector3(Math.cos(angle) * 0.18, 13.25, Math.sin(angle) * 0.18),
      0xdde5ec
    );
    towerGroup.add(leg);
  }

  for (let level = 0; level < 4; level++) {
    const y = 3.2 + level * 2.7;
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(1.45 - level * 0.16, 1.45 - level * 0.16, 0.08, 24),
      metalMaterial
    );
    platform.position.y = y;
    platform.castShadow = true;
    towerGroup.add(platform);
  }

  for (let i = 0; i < 3; i++) {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.38, 16), redMaterial);
    band.position.y = 5.2 + i * 3.2;
    towerGroup.add(band);
  }

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const antenna = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.6, 0.46),
      new THREE.MeshStandardMaterial({
        color: 0xf7fbff,
        roughness: 0.36,
        metalness: 0.12
      })
    );

    antenna.position.set(Math.cos(angle) * 1.35, 9.3 + (i % 2) * 1.45, Math.sin(angle) * 1.35);
    antenna.rotation.y = -angle;
    antenna.castShadow = true;
    towerGroup.add(antenna);
  }

  towerBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xff4d4d,
      transparent: true,
      opacity: 1
    })
  );
  towerBeacon.position.y = 14.35;
  towerGroup.add(towerBeacon);

  towerBeaconGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xff6a5c,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    })
  );
  towerBeaconGlow.position.y = 14.35;
  towerGroup.add(towerBeaconGlow);

  for (let i = 0; i < 5; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2 + i * 1.15, 0.035, 8, 80),
      new THREE.MeshBasicMaterial({
        color: 0x00a6ff,
        transparent: true,
        opacity: 0.12,
        depthWrite: false
      })
    );

    ring.rotation.x = Math.PI / 2;
    ring.position.copy(stationManager.getMobileTowerCommsPosition());
    ring.userData.offset = i * 0.19;
    signalGroup.add(ring);
  }
}

function createTowerLine(start, end, color) {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.85
  });
  return new THREE.Line(geometry, material);
}

function getTowerCommsPosition() {
  return stationManager.getMobileTowerCommsPosition();
}

/* -------------------------------------------------------------------------- */
/* Fahrzeuge                                                                  */
/* -------------------------------------------------------------------------- */

function createTrafficVehicles() {
  const cityLoopClockwise = [
    [-2.8, -46], [-2.8, -24], [-24, -24], [-24, 0], [-24, 24],
    [0, 24], [24, 24], [24, 0], [24, -24], [2.8, -24], [2.8, -46]
  ];

  const cityLoopCounter = [
    [2.8, 46], [2.8, 24], [24, 24], [24, 0], [24, -24],
    [0, -24], [-24, -24], [-24, 0], [-24, 24], [-2.8, 24], [-2.8, 46]
  ];

  const campusLoop = [
    [50, -36], [32, -36], [24, -36], [24, -24], [24, 0],
    [0, 0], [0, -24], [24, -24], [32, -36], [50, -36]
  ];

  addTrafficVehicle({
    route: cityLoopClockwise,
    speed: 7.4,
    offset: 0,
    laneOffset: -1.05,
    color: 0xe8a23a,
    length: 2.7,
    width: 1.35,
    kind: "car"
  });

  addTrafficVehicle({
    route: cityLoopClockwise,
    speed: 7.4,
    offset: 48,
    laneOffset: -1.05,
    color: 0x4d8ccf,
    length: 2.55,
    width: 1.32,
    kind: "car"
  });

  addTrafficVehicle({
    route: cityLoopCounter,
    speed: 7.0,
    offset: 22,
    laneOffset: 1.05,
    color: 0xd6d6d2,
    length: 2.65,
    width: 1.34,
    kind: "car"
  });

  addTrafficVehicle({
    route: campusLoop,
    speed: 5.2,
    offset: 18,
    laneOffset: -0.85,
    color: 0x7b8794,
    length: 3.55,
    width: 1.55,
    kind: "van"
  });
}

function addTrafficVehicle(options) {
  const vehicle = createVehicle(options);
  vehicle.userData.route = prepareRoute(options.route);
  vehicle.userData.speed = options.speed;
  vehicle.userData.offset = options.offset;
  vehicle.userData.kind = options.kind;
  vehicle.userData.laneOffset = options.laneOffset || 0;
  vehicleGroup.add(vehicle);
  trafficVehicles.push(vehicle);
}

function createVehicle({ color, length, width, kind }) {
  const group = new THREE.Group();
  group.position.y = 0.42;

  const bodyHeight = kind === "van" ? 0.9 : 0.55;
  const cabinHeight = kind === "van" ? 0.62 : 0.45;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, bodyHeight, length),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.46,
      metalness: 0.08
    })
  );
  body.position.y = bodyHeight / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.74, cabinHeight, length * (kind === "van" ? 0.42 : 0.48)),
    new THREE.MeshStandardMaterial({
      color: 0xc7dff0,
      roughness: 0.24,
      metalness: 0.05
    })
  );
  cabin.position.set(0, bodyHeight + cabinHeight / 2 - 0.05, -length * 0.08);
  cabin.castShadow = true;
  group.add(cabin);

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.72
  });

  const wheelPositions = [
    [-width / 2 - 0.04, 0.2, -length / 2 + 0.45],
    [width / 2 + 0.04, 0.2, -length / 2 + 0.45],
    [-width / 2 - 0.04, 0.2, length / 2 - 0.45],
    [width / 2 + 0.04, 0.2, length / 2 - 0.45]
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 12), wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    group.add(wheel);
  });

  return group;
}

function createFireTruck() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.75, 0.9, 4.2),
    new THREE.MeshStandardMaterial({
      color: 0xc51f1a,
      roughness: 0.42,
      metalness: 0.08
    })
  );
  body.position.y = 0.65;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.75, 0.95, 1.45),
    new THREE.MeshStandardMaterial({
      color: 0xe14137,
      roughness: 0.42
    })
  );
  cabin.position.set(0, 1.05, 1.22);
  cabin.castShadow = true;
  group.add(cabin);

  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.42, 0.06),
    new THREE.MeshBasicMaterial({
      color: 0xbfe6ff,
      transparent: true,
      opacity: 0.75
    })
  );
  windshield.position.set(0, 1.18, 1.96);
  group.add(windshield);

  const ladder = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.16, 3.4),
    new THREE.MeshStandardMaterial({
      color: 0xe7edf2,
      roughness: 0.36,
      metalness: 0.35
    })
  );
  ladder.position.set(0, 1.25, -0.42);
  group.add(ladder);

  const lightbar = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.14, 0.28),
    new THREE.MeshBasicMaterial({
      color: 0x1e9bff
    })
  );
  lightbar.position.set(0, 1.64, 1.35);
  lightbar.userData.isEmergencyLight = true;
  group.add(lightbar);

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.74
  });

  const wheelPositions = [
    [-0.95, 0.26, -1.45],
    [0.95, 0.26, -1.45],
    [-0.95, 0.26, 1.3],
    [0.95, 0.26, 1.3]
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 12), wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    group.add(wheel);
  });

  return group;
}

/* -------------------------------------------------------------------------- */
/* Fußgänger                                                                  */
/* -------------------------------------------------------------------------- */

function createPedestrians() {
  const residentialSidewalk = [[-50, 36], [-40, 36], [-32, 42], [-48, 42], [-50, 36]];
  const downtownNorthSidewalk = [[-20, 22], [-8, 22], [4, 22], [20, 22], [20, 26], [-20, 26], [-20, 22]];
  const downtownSouthSidewalk = [[-20, -22], [-8, -22], [8, -22], [20, -22], [20, -26], [-20, -26], [-20, -22]];
  const campusSidewalk = [[31, -29], [47, -29], [47, -40], [32, -40], [31, -29]];

  addPedestrian(residentialSidewalk, 0.9, 0, 0x2d7dd2, 0xf0c59b);
  addPedestrian(residentialSidewalk, 0.78, 8, 0xe85d75, 0xe2b18d);
  addPedestrian(downtownNorthSidewalk, 1.05, 4, 0x4caf50, 0xd9a77f);
  addPedestrian(downtownNorthSidewalk, 0.88, 13, 0xf2a65a, 0xf0c59b);
  addPedestrian(downtownSouthSidewalk, 0.82, 10, 0x6a4c93, 0xc98f74);
  addPedestrian(campusSidewalk, 0.86, 6, 0x3d405b, 0xe2b18d);
}

function addPedestrian(routePoints, speed, offset, bodyColor, skinColor) {
  const person = createPedestrian(bodyColor, skinColor);
  person.userData.route = prepareRoute(routePoints);
  person.userData.speed = speed;
  person.userData.offset = offset;
  pedestrianGroup.add(person);
  pedestrians.push(person);
}

function createPedestrian(bodyColor, skinColor) {
  const group = new THREE.Group();

  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x263142, roughness: 0.72 });
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.62 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.65 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.82, 10), bodyMaterial);
  body.position.y = 1.05;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), skinMaterial);
  head.position.y = 1.58;
  head.castShadow = true;
  group.add(head);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.58, 0.12), legMaterial);
  leftLeg.position.set(-0.09, 0.44, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.58, 0.12), legMaterial);
  rightLeg.position.set(0.09, 0.44, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.5, 0.09), bodyMaterial);
  leftArm.position.set(-0.33, 1.04, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.5, 0.09), bodyMaterial);
  rightArm.position.set(0.33, 1.04, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  group.userData.leftLeg = leftLeg;
  group.userData.rightLeg = rightLeg;
  group.userData.leftArm = leftArm;
  group.userData.rightArm = rightArm;

  return group;
}

/* -------------------------------------------------------------------------- */
/* Mission 001 Visuals                                                        */
/* -------------------------------------------------------------------------- */

function createMissionIncidentVisuals() {
  missionVisuals = new THREE.Group();
  missionVisuals.visible = false;
  scene.add(missionVisuals);

  const radius = new THREE.Mesh(
    new THREE.RingGeometry(7.4, 7.7, 80),
    new THREE.MeshBasicMaterial({
      color: 0xff8f3d,
      transparent: true,
      opacity: 0,
      depthWrite: false
    })
  );
  radius.rotation.x = -Math.PI / 2;
  radius.position.set(incidentSite.x, 0.105, incidentSite.z);
  radius.userData.type = "incident-radius";
  missionVisuals.add(radius);

  const marker = new THREE.Mesh(
    new THREE.RingGeometry(4.2, 4.5, 64),
    new THREE.MeshBasicMaterial({
      color: 0xff8f3d,
      transparent: true,
      opacity: 0,
      depthWrite: false
    })
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.set(incidentSite.x, 0.13, incidentSite.z);
  marker.userData.type = "incident-marker";
  missionVisuals.add(marker);

  const holdMarker = new THREE.Mesh(
    new THREE.RingGeometry(1.0, 1.14, 40),
    new THREE.MeshBasicMaterial({
      color: 0x00a6ff,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    })
  );
  holdMarker.rotation.x = -Math.PI / 2;
  holdMarker.position.set(incidentSite.holdX, 0.14, incidentSite.holdZ);
  holdMarker.userData.type = "hold-point";
  missionVisuals.add(holdMarker);

  createIncidentBarrier(-21, 12, 0);
  createIncidentBarrier(-16, 10, Math.PI / 2);
  createIncidentBarrier(-11, 12, 0);
  createIncidentBarrier(-22, 20, Math.PI / 2);
  createIncidentBarrier(-16, 22, 0);
  createIncidentBarrier(-10, 20, Math.PI / 2);

  const fireArea = new THREE.Mesh(
    new THREE.PlaneGeometry(3.1, 1.2),
    new THREE.MeshBasicMaterial({
      color: 0xff4d1f,
      transparent: true,
      opacity: 0,
      depthWrite: false
    })
  );
  fireArea.rotation.x = -Math.PI / 2;
  fireArea.position.set(incidentSite.x, 0.15, incidentSite.frontZ + 0.6);
  fireArea.userData.type = "brand-area";
  missionVisuals.add(fireArea);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(2.8, 16, 12),
    new THREE.MeshBasicMaterial({
      color: 0xff6a2d,
      transparent: true,
      opacity: 0,
      depthWrite: false
    })
  );
  glow.position.set(incidentSite.x, incidentSite.baseY + 1.8, incidentSite.frontZ);
  glow.scale.set(1.0, 0.65, 0.75);
  glow.userData.type = "fire-glow";
  missionVisuals.add(glow);

  const smokeMaterial = new THREE.MeshStandardMaterial({
    color: 0x5f6670,
    transparent: true,
    opacity: 0,
    roughness: 1
  });

  const smokeOffsets = [
    [-0.9, 0.0, 0.0, 0.75],
    [0.2, 0.5, 0.1, 0.95],
    [0.9, 1.0, -0.2, 0.82],
    [-0.3, 1.6, 0.2, 1.05],
    [0.6, 2.3, 0.0, 0.88],
    [-0.8, 2.9, -0.2, 1.15]
  ];

  smokeOffsets.forEach(([x, y, z, scale], index) => {
    const puff = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.9, 0),
      smokeMaterial.clone()
    );
    puff.position.set(
      incidentSite.x + x,
      incidentSite.baseY + 2.2 + y,
      incidentSite.frontZ + z
    );
    puff.scale.setScalar(scale);
    puff.userData.type = "smoke";
    puff.userData.offset = index * 0.17;
    puff.userData.baseX = x;
    puff.userData.baseY = y;
    puff.userData.baseZ = z;
    puff.userData.baseScale = scale;
    missionVisuals.add(puff);
  });

  const flameMaterials = [
    new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: 0,
      depthWrite: false
    }),
    new THREE.MeshBasicMaterial({
      color: 0xffcf4a,
      transparent: true,
      opacity: 0,
      depthWrite: false
    })
  ];

  const flameData = [
    [-0.8, 0.0, 0.95],
    [-0.2, 0.15, 1.15],
    [0.45, -0.05, 0.9],
    [0.95, 0.1, 1.05]
  ];

  flameData.forEach(([x, y, scale], index) => {
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.35 * scale, 1.25 * scale, 8),
      flameMaterials[index % flameMaterials.length].clone()
    );
    flame.position.set(
      incidentSite.x + x,
      incidentSite.baseY + 1.0 + y,
      incidentSite.frontZ + 0.08
    );
    flame.rotation.x = 0.06;
    flame.userData.type = "flame";
    flame.userData.offset = index * 0.45;
    flame.userData.baseScale = scale;
    missionVisuals.add(flame);
  });
}

function createIncidentBarrier(x, z, rotation) {
  const barrier = new THREE.Group();
  barrier.position.set(x, 0.25, z);
  barrier.rotation.y = rotation;
  barrier.userData.type = "barrier";

  const rail = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.22, 0.18),
    new THREE.MeshBasicMaterial({
      color: 0xff8f3d,
      transparent: true,
      opacity: 0.85
    })
  );
  rail.position.y = 0.55;
  barrier.add(rail);

  [-0.85, 0.85].forEach((offset) => {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.75, 0.16),
      new THREE.MeshStandardMaterial({
        color: 0x4a3a31,
        roughness: 0.7
      })
    );
    leg.position.set(offset, 0.22, 0);
    barrier.add(leg);
  });

  missionVisuals.add(barrier);
}

/* -------------------------------------------------------------------------- */
/* Routen                                                                     */
/* -------------------------------------------------------------------------- */

function prepareRoute(points) {
  const route = {
    points: points.map(([x, z]) => new THREE.Vector2(x, z)),
    segments: [],
    length: 0
  };

  for (let i = 0; i < route.points.length - 1; i++) {
    const start = route.points[i];
    const end = route.points[i + 1];
    const length = start.distanceTo(end);
    route.segments.push({ start, end, length });
    route.length += length;
  }

  return route;
}

function sampleRoute(route, distance, laneOffset = 0) {
  if (!route || route.length <= 0) {
    return { x: 0, z: 0, angle: 0 };
  }

  return sampleRouteInternal(route, positiveModulo(distance, route.length), laneOffset);
}

function sampleRouteClamped(route, distance, laneOffset = 0) {
  if (!route || route.length <= 0) {
    return { x: 0, z: 0, angle: 0 };
  }

  return sampleRouteInternal(route, THREE.MathUtils.clamp(distance, 0, route.length), laneOffset);
}

function sampleRouteInternal(route, distance, laneOffset = 0) {
  let remaining = distance;

  for (const segment of route.segments) {
    if (remaining <= segment.length) {
      const t = segment.length === 0 ? 0 : remaining / segment.length;
      const x = THREE.MathUtils.lerp(segment.start.x, segment.end.x, t);
      const z = THREE.MathUtils.lerp(segment.start.y, segment.end.y, t);
      const dx = segment.end.x - segment.start.x;
      const dz = segment.end.y - segment.start.y;
      const angle = Math.atan2(dx, dz);

      const rightX = Math.cos(angle);
      const rightZ = -Math.sin(angle);

      return {
        x: x + rightX * laneOffset,
        z: z + rightZ * laneOffset,
        angle
      };
    }

    remaining -= segment.length;
  }

  const lastSegment = route.segments[route.segments.length - 1];
  const angle = Math.atan2(
    lastSegment.end.x - lastSegment.start.x,
    lastSegment.end.y - lastSegment.start.y
  );

  return {
    x: lastSegment.end.x + Math.cos(angle) * laneOffset,
    z: lastSegment.end.y - Math.sin(angle) * laneOffset,
    angle
  };
}

function positiveModulo(value, modulo) {
  return ((value % modulo) + modulo) % modulo;
}

/* -------------------------------------------------------------------------- */
/* Steuerung                                                                  */
/* -------------------------------------------------------------------------- */

function bindControls() {
  window.addEventListener("keydown", (event) => {
    if (validatedPresenter && window.MISSION_BOS_PRESENTER_PLAN) {
      const bookmark = window.MISSION_BOS_PRESENTER_PLAN.camera.bookmarks.find(
        (item) => item.keyCode === event.code
      );
      if (bookmark) {
        if (!event.repeat) validatedPresenter.selectBookmark(bookmark.id, "keyboard");
        event.preventDefault();
        return;
      }
      validatedPresenter.notifyManualInput(event.code);
    }
    keys[event.code] = true;
  });

  window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });

  renderer.domElement.addEventListener("mousedown", (event) => {
    isMouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    event.preventDefault();
  });

  window.addEventListener("mouseup", () => {
    isMouseDown = false;
  });

  window.addEventListener("mousemove", (event) => {
    if (!isMouseDown) return;

    const deltaX = event.clientX - lastMouseX;
    const deltaY = event.clientY - lastMouseY;

    if (validatedPresenter && (Math.abs(deltaX) > 0.25 || Math.abs(deltaY) > 0.25)) {
      validatedPresenter.notifyManualInput("MOUSE_MOVE");
    }

    targetYaw -= deltaX * 0.0028;
    targetPitch -= deltaY * 0.0022;
    targetPitch = THREE.MathUtils.clamp(targetPitch, -1.08, -0.05);

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  });

  if (presenterNextButton) {
    presenterNextButton.addEventListener("click", (event) => {
      const context = getCurrentMissionContext();
      if ((context.activeId || context.selectedId) !== "MISSION_001") {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }
  if (presenterResetButton) {
    presenterResetButton.addEventListener("click", (event) => {
      const context = getCurrentMissionContext();
      if ((context.activeId || context.selectedId) !== "MISSION_001") {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  missionButton.addEventListener("click", () => {
    if (isStandaloneArenaEventActive()) {
      if (arenaEventStatus) arenaEventStatus.textContent = "Veranstaltung zuerst beenden";
      return;
    }
    if (validatedAmbulanceFoundation && validatedAmbulanceFoundation.isActive()) {
      if (ambulanceTestStatus) ambulanceTestStatus.textContent = "Rettungswagentest aktiv – Mission 001 gesperrt";
      return;
    }
    if (RECOVERY_CONFIG.enableValidatedMission001) {
      const registryReady = isMissionRegistryFinalized();
      const selectedMissionRuntime = registryReady
        ? validatedMissionRegistry.getSelectedRuntime()
        : validatedMission001;
      if (!selectedMissionRuntime) {
        if (missionRegistryStatus) missionRegistryStatus.textContent = "Keine startfähige Mission verfügbar";
        uiManager.updateAll(true);
        return;
      }
      const missionState = selectedMissionRuntime.getState();
      let actionAccepted = false;
      if (missionState === "READY") {
        actionAccepted = registryReady
          ? validatedMissionRegistry.startSelected() === true
          : validatedMission001.start() === true;
      } else if (missionState === "COMPLETED") {
        actionAccepted = registryReady
          ? validatedMissionRegistry.finishSelected() === true
          : validatedMission001.finishAndReturn() === true;
      }
      if (!actionAccepted && missionRegistryStatus) {
        missionRegistryStatus.textContent = registryReady
          ? "Missionsaktion aktuell nicht zulässig"
          : "Mission 001 bleibt bereit · Mission 002 nicht verfügbar";
      }
      uiManager.updateAll(true);
      applyMissionRegistryFailSoftStatus();
      return;
    }

    if (
      RECOVERY_CONFIG.enableValidatedIncidentAccess &&
      validatedIncidentAccess
    ) {
      const incidentState = validatedIncidentAccess.getState();

      if (incidentState === "AT_STATIONS") {
        validatedIncidentAccess.start();
      } else if (incidentState === "HOLDING") {
        validatedIncidentAccess.returnToStations();
      }

      uiManager.updateAll(true);
      return;
    }

    if (
      RECOVERY_CONFIG.enableValidatedResponseVehicles &&
      validatedResponseVehicles
    ) {
      const responseState = validatedResponseVehicles.getState();

      if (responseState === "AT_STATIONS") {
        validatedResponseVehicles.dispatch();
      } else if (responseState === "HOLDING") {
        validatedResponseVehicles.returnToStations();
      }

      uiManager.updateAll(true);
      return;
    }

    if (!RECOVERY_CONFIG.enableMissionVisuals || !RECOVERY_CONFIG.enableResponseVehicles) {
      return;
    }

    if (MissionManager.isCompleted()) {
      MissionManager.reset();
      return;
    }

    MissionManager.start("fire");
  });

  bosButton.addEventListener("click", () => {
    // Status-only control in Build 011N.1. Automatic priority owns all activation decisions.
    uiManager.updateAll(true);
  });

  overloadButton.addEventListener("click", () => {
    if (validatedArenaEvent && validatedArenaEvent.isActive()) return;
    if (validatedAmbulanceFoundation && validatedAmbulanceFoundation.isActive()) return;
    if (getActiveMissionRuntime()) return;
    networkManager.toggleManualLoad();
    uiManager.updateAll(true);
  });

  window.addEventListener("resize", onWindowResize);
}

/* -------------------------------------------------------------------------- */
/* Updates                                                                    */
/* -------------------------------------------------------------------------- */

function updateCamera(delta) {
  if (validatedPresenter && validatedPresenter.updateCamera(delta)) return;

  if (keys.KeyQ) targetYaw += 1.35 * delta;
  if (keys.KeyE) targetYaw -= 1.35 * delta;

  currentYaw = THREE.MathUtils.lerp(currentYaw, targetYaw, 1 - Math.exp(-delta * 12));
  currentPitch = THREE.MathUtils.lerp(currentPitch, targetPitch, 1 - Math.exp(-delta * 12));

  const baseSpeed = keys.ShiftLeft || keys.ShiftRight ? 19 : 10.5;
  const forward = new THREE.Vector3(-Math.sin(currentYaw), 0, -Math.cos(currentYaw));
  const right = new THREE.Vector3(Math.cos(currentYaw), 0, -Math.sin(currentYaw));
  const desiredVelocity = new THREE.Vector3();

  if (keys.KeyW) desiredVelocity.add(forward);
  if (keys.KeyS) desiredVelocity.addScaledVector(forward, -1);
  if (keys.KeyA) desiredVelocity.addScaledVector(right, -1);
  if (keys.KeyD) desiredVelocity.add(right);

  if (desiredVelocity.lengthSq() > 0) {
    desiredVelocity.normalize().multiplyScalar(baseSpeed);
  }

  cameraVelocity.lerp(desiredVelocity, 1 - Math.exp(-delta * 7.5));
  camera.position.addScaledVector(cameraVelocity, delta);

  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -54, 54);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -54, 54);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, freeCameraHeight, 1 - Math.exp(-delta * 5));

  camera.rotation.set(currentPitch, currentYaw, 0);
}

function updateNetwork(delta, elapsed) {
  networkManager.update(delta, elapsed);
  uiManager.updateNetworkPanel();
  updateTowerSignal(elapsed);
}

function updateTowerSignal(elapsed) {
  const state = cityStateEngine.get();
  const meta = getCityStateMeta(state);
  const isBOS = state === CITY_STATES.BOS_ACTIVE;

  signalGroup.children.forEach((ring) => {
    const pulseSpeed = isBOS ? 0.72 : 0.42;
    const pulse = (elapsed * pulseSpeed + ring.userData.offset) % 1;
    const scale = 1 + pulse * (isBOS ? 2.45 : 1.55);

    ring.scale.set(scale, scale, scale);
    ring.material.opacity = meta.signalStrength * (1 - pulse);
    ring.material.color.setHex(meta.signalColor);
  });
}

function updateTraffic(elapsed) {
  const state = cityStateEngine.get();

  trafficVehicles.forEach((vehicle, index) => {
    let trafficFactor = 1;

    if (state === CITY_STATES.HIGH_LOAD) trafficFactor = 0.96;
    if (state === CITY_STATES.OVERLOADED) trafficFactor = 0.9;
    if (state === CITY_STATES.BOS_ACTIVE) trafficFactor = 1;

    const microOffset = Math.sin(elapsed * 0.35 + index) * 0.03;
    const routeSample = sampleRoute(
      vehicle.userData.route,
      elapsed * vehicle.userData.speed * trafficFactor + vehicle.userData.offset,
      vehicle.userData.laneOffset + microOffset
    );

    vehicle.position.x = routeSample.x;
    vehicle.position.z = routeSample.z;
    vehicle.rotation.y = routeSample.angle;
  });
}

function updatePedestrians(delta, elapsed) {
  pedestrians.forEach((person, index) => {
    if (
      MissionManager.isActive() &&
      person.userData.missionBehavior &&
      MissionManager.elapsed >= 6.5
    ) {
      updateMissionPedestrian(person, index, delta, elapsed);
      return;
    }

    updateRoutePedestrian(person, index, elapsed);
  });
}

function updateRoutePedestrian(person, index, elapsed) {
  const routeSample = sampleRoute(
    person.userData.route,
    elapsed * person.userData.speed + person.userData.offset
  );

  const walkCycle = elapsed * person.userData.speed * 6 + index;
  const bob = Math.sin(walkCycle * 2) * 0.035;

  person.position.set(routeSample.x, bob, routeSample.z);
  person.rotation.y = routeSample.angle;

  animateWalkingPerson(person, elapsed, index, 1);
}

function assignPedestrianMissionBehaviors() {
  const behaviors = [
    { type: "watch", target: new THREE.Vector3(-25, 0, 21) },
    { type: "watch", target: new THREE.Vector3(-28, 0, 17) },
    { type: "watch", target: new THREE.Vector3(-23, 0, 14) },
    { type: "flee", target: new THREE.Vector3(-34, 0, 24) },
    { type: "flee", target: new THREE.Vector3(-6, 0, 26) },
    { type: "watch", target: new THREE.Vector3(-30, 0, 18) }
  ];

  pedestrians.forEach((person, index) => {
    const config = behaviors[index % behaviors.length];
    person.userData.missionBehavior = config.type;
    person.userData.missionTarget = config.target;
    person.userData.missionReactionDelay = MissionManager.elapsed + index * 0.35;
    person.userData.missionStarted = false;
  });
}

function resetPedestrianMissionBehaviors() {
  pedestrians.forEach((person) => {
    delete person.userData.missionBehavior;
    delete person.userData.missionTarget;
    delete person.userData.missionReactionDelay;
    delete person.userData.missionStarted;
    delete person.userData.missionStartPosition;
  });
}

function updateMissionPedestrian(person, index, delta, elapsed) {
  if (MissionManager.elapsed < person.userData.missionReactionDelay) {
    updateRoutePedestrian(person, index, elapsed);
    return;
  }

  if (!person.userData.missionStarted) {
    person.userData.missionStarted = true;
    person.userData.missionStartPosition = person.position.clone();
  }

  const behavior = person.userData.missionBehavior;
  const target = person.userData.missionTarget;

  if (!target) {
    updateRoutePedestrian(person, index, elapsed);
    return;
  }

  const moveSpeed = behavior === "flee" ? 1.35 : 0.7;
  const distanceToTarget = person.position.distanceTo(target);

  if (distanceToTarget > 0.35) {
    const previousPosition = person.position.clone();
    person.position.lerp(target, 1 - Math.exp(-delta * moveSpeed));

    const movement = person.position.clone().sub(previousPosition);
    if (movement.lengthSq() > 0.0001) {
      person.rotation.y = Math.atan2(movement.x, movement.z);
    }

    animateWalkingPerson(person, elapsed, index, behavior === "flee" ? 1.3 : 0.8);
  } else {
    facePosition(person, new THREE.Vector3(incidentSite.x, 0, incidentSite.frontZ));
    animateStandingPerson(person, elapsed, index);
  }
}

function animateWalkingPerson(person, elapsed, index, multiplier) {
  const walkCycle = elapsed * person.userData.speed * 6 * multiplier + index;
  const swing = Math.sin(walkCycle) * 0.45;

  person.userData.leftLeg.rotation.x = swing;
  person.userData.rightLeg.rotation.x = -swing;
  person.userData.leftArm.rotation.x = -swing * 0.7;
  person.userData.rightArm.rotation.x = swing * 0.7;
}

function animateStandingPerson(person, elapsed, index) {
  const idle = Math.sin(elapsed * 2.4 + index) * 0.08;

  person.userData.leftLeg.rotation.x = idle * 0.2;
  person.userData.rightLeg.rotation.x = -idle * 0.2;
  person.userData.leftArm.rotation.x = idle;
  person.userData.rightArm.rotation.x = -idle;
}

function facePosition(object, target) {
  const dx = target.x - object.position.x;
  const dz = target.z - object.position.z;
  object.rotation.y = Math.atan2(dx, dz);
}

function updateMissionVisuals(delta, elapsed) {
  if (!missionVisuals) return;

  missionVisuals.visible = MissionManager.isActive();

  if (!MissionManager.isActive()) return;

  missionVisuals.children.forEach((object) => {
    if (object.userData.type === "barrier") {
      object.visible = MissionManager.elapsed >= 0.5;
      return;
    }

    if (!object.material) return;

    if (object.userData.type === "incident-radius") {
      object.material.opacity = 0.16 + Math.sin(elapsed * 2.1) * 0.035;
      object.scale.setScalar(1 + Math.sin(elapsed * 1.4) * 0.02);
    }

    if (object.userData.type === "incident-marker") {
      object.material.opacity = 0.3 + Math.sin(elapsed * 3.2) * 0.08;
      object.scale.setScalar(1 + Math.sin(elapsed * 2.4) * 0.04);
    }

    if (object.userData.type === "hold-point") {
      object.material.opacity = 0.35 + Math.sin(elapsed * 4.5) * 0.1;
    }

    if (object.userData.type === "brand-area") {
      const visible = MissionManager.isFireVisible();
      object.material.opacity = visible ? 0.18 + Math.sin(elapsed * 8.5) * 0.06 : 0;
    }

    if (object.userData.type === "fire-glow") {
      const visible = MissionManager.isFireVisible();
      const flicker = 0.5 + 0.5 * Math.sin(elapsed * 8.5);
      object.material.opacity = visible ? 0.12 + flicker * 0.1 : 0;
      object.scale.set(
        1.0 + flicker * 0.08,
        0.65 + flicker * 0.05,
        0.75 + flicker * 0.05
      );
    }

    if (object.userData.type === "smoke") {
      const visible = MissionManager.isSmokeVisible();
      const smokePhase = (elapsed * 0.12 + object.userData.offset) % 1;
      const drift = Math.sin(elapsed * 0.7 + object.userData.offset * 8) * 0.35;

      object.material.opacity = visible
        ? THREE.MathUtils.clamp(0.2 + MissionManager.elapsed * 0.015, 0.2, 0.48) * (1 - smokePhase * 0.45)
        : 0;

      object.position.set(
        incidentSite.x + object.userData.baseX + drift,
        incidentSite.baseY + 2.2 + object.userData.baseY + smokePhase * 3.2,
        incidentSite.frontZ + object.userData.baseZ
      );

      const scale = object.userData.baseScale * (1 + smokePhase * 1.4);
      object.scale.setScalar(scale);
      object.rotation.y += delta * 0.18;
    }

    if (object.userData.type === "flame") {
      const visible = MissionManager.isFireVisible();
      const flicker = 0.72 + Math.sin(elapsed * 10 + object.userData.offset) * 0.22;
      const baseScale = object.userData.baseScale;

      object.material.opacity = visible ? 0.72 + flicker * 0.22 : 0;
      object.scale.set(
        baseScale * (0.85 + flicker * 0.22),
        baseScale * (0.9 + flicker * 0.45),
        baseScale * (0.85 + flicker * 0.18)
      );
    }
  });
}

function updateTowerAndAtmosphere(delta, elapsed) {
  cityManager.update(delta);

  const state = cityStateEngine.get();
  const meta = getCityStateMeta(state);
  const isBOS = state === CITY_STATES.BOS_ACTIVE;

  if (skyDome) {
    skyDome.position.copy(camera.position);
  }

  if (towerGroup) {
    const baseMotion = Math.sin(elapsed * 0.18) * 0.012;
    const bosMotion = isBOS ? Math.sin(elapsed * 1.1) * 0.01 : 0;
    towerGroup.rotation.y = baseMotion + bosMotion;
  }

  if (towerBeacon && towerBeaconGlow) {
    const blinkSpeed = isBOS ? 7.0 : 5.2;
    const blink = 0.5 + 0.5 * Math.sin(elapsed * blinkSpeed);
    const glowScale = isBOS ? 1.05 + blink * 0.55 : 0.85 + blink * 0.35;

    towerBeacon.material.color.setHex(isBOS ? 0x00d4ff : 0xff4d4d);
    towerBeacon.material.opacity = isBOS ? 0.65 + blink * 0.35 : 0.45 + blink * 0.55;

    towerBeaconGlow.material.color.setHex(meta.signalColor);
    towerBeaconGlow.material.opacity = isBOS ? 0.16 + blink * 0.34 : 0.08 + blink * 0.22;
    towerBeaconGlow.scale.set(glowScale, glowScale, glowScale);
  }

  animatedBulbs.forEach((bulb) => {
    bulb.material.opacity = 0.66 + Math.sin(elapsed * 0.9 + bulb.userData.phase) * 0.08;
  });

  stationGroup.traverse((object) => {
    if (object.userData.isStationLight && object.material) {
      object.material.opacity = 0.65 + Math.sin(elapsed * 2.4) * 0.22;
    }

    if (object.userData.isPoliceLight && object.material) {
      object.material.color.setHex(Math.sin(elapsed * 2.8) > 0 ? 0x1e9bff : 0xffffff);
    }
  });

  signGroup.traverse((object) => {
    if (object.userData.signPulse && object.material) {
      object.material.opacity = 0.58 + Math.sin(elapsed * 1.8) * 0.12;
    }
  });

  if (VehicleManager.fireTruck) {
    VehicleManager.fireTruck.traverse((object) => {
      if (object.userData.isEmergencyLight && object.material) {
        object.material.color.setHex(Math.sin(elapsed * 8) > 0 ? 0x1e9bff : 0xffffff);
      }
    });
  }
}

function updateSimulatedTime(delta) {
  simulatedMinutes = positiveModulo(simulatedMinutes + delta * 2.2, 24 * 60);
}

/* -------------------------------------------------------------------------- */
/* State-Metadaten                                                            */
/* -------------------------------------------------------------------------- */

function getCityStateMeta(state) {
  const validatedMissionActive = validatedMission001
    ? validatedMission001.isActive()
    : false;
  const missionActive = validatedMissionActive || MissionManager.isActive();
  const bosMissionActive = missionActive && networkManager.bosPriorityActive;
  const completed = validatedMission001
    ? validatedMission001.isCompleted()
    : MissionManager.isCompleted();

  const states = {
    [CITY_STATES.NORMAL]: {
      modeLabel: "NORMAL",
      networkLabel: missionActive ? "Einsatzlage" : "Normal",
      loadClass: "normal",
      cityStatus: missionActive ? "Alarmierung" : "Normalbetrieb",
      communicationStatus: "Stabil",
      mobileStatus: "Normalbetrieb",
      priorityStatus: "Inaktiv",
      linkStatus: "Ruhig",
      explanation: missionActive
        ? "Aktive Verbindung Leitstelle → Mobilfunk → Feuerwehr. Polizei ist vorbereitet."
        : "BOS-Netz vorbereitet: Leitstelle, Mobilfunkmast, Feuerwehr und Polizeiwache sind sichtbar verortet.",
      ambientIntensity: 0.64,
      sunIntensity: 1.28,
      hemisphereIntensity: 0.68,
      sunColor: 0xfff5dc,
      fogColor: 0xb7d9f2,
      skyTop: 0x7fb9ee,
      skyHorizon: 0xf6e4c9,
      skyBottom: 0xb7d9f2,
      signalColor: 0x9bdfff,
      signalStrength: 0.1
    },

    [CITY_STATES.HIGH_LOAD]: {
      modeLabel: "HIGH LOAD",
      networkLabel: missionActive ? "Zuschauerlast" : "Hohe Last",
      loadClass: "high-load",
      cityStatus: missionActive ? "Einsatz läuft" : "Erhöhte Auslastung",
      communicationStatus: missionActive ? "Belastet" : "Stabil",
      mobileStatus: "Hohe Auslastung",
      priorityStatus: "Inaktiv",
      linkStatus: "Belastet",
      explanation: missionActive
        ? "Smartphone-Nutzung im Umfeld belastet die Übertragung zur Feuerwehr."
        : "Das System beobachtet die steigende Netzlast.",
      ambientIntensity: 0.6,
      sunIntensity: 1.18,
      hemisphereIntensity: 0.62,
      sunColor: 0xffe1b0,
      fogColor: 0xc4d3dc,
      skyTop: 0x7faee0,
      skyHorizon: 0xffd6a3,
      skyBottom: 0xc4d3dc,
      signalColor: 0xffc15c,
      signalStrength: 0.16
    },

    [CITY_STATES.OVERLOADED]: {
      modeLabel: "OVERLOAD",
      networkLabel: missionActive ? "BOS beeinträchtigt" : "Überlastet",
      loadClass: "overloaded",
      cityStatus: missionActive ? "Netzüberlast" : "Kapazität kritisch",
      communicationStatus: missionActive ? "Instabil" : "Verzögert",
      mobileStatus: "Überlastet",
      priorityStatus: "Nicht aktiv",
      linkStatus: "Instabil",
      explanation: missionActive
        ? "Datenpakete zur Feuerwehr brechen sichtbar ein. Priorisierung ist noch nicht aktiv."
        : "Die Netzlast ist kritisch. Priorisierung ist nicht aktiv.",
      ambientIntensity: 0.56,
      sunIntensity: 1.05,
      hemisphereIntensity: 0.56,
      sunColor: 0xffc8a8,
      fogColor: 0xc8c1bd,
      skyTop: 0x8ca8c4,
      skyHorizon: 0xffb39a,
      skyBottom: 0xc8c1bd,
      signalColor: 0xff6b5c,
      signalStrength: 0.2
    },

    [CITY_STATES.BOS_ACTIVE]: {
      modeLabel: "BOS ACTIVE",
      networkLabel: bosMissionActive ? "BOS gesichert" : "Priorisiert",
      loadClass: "bos",
      cityStatus: completed ? "Abschluss" : "BOS priorisiert",
      communicationStatus: "Stabil",
      mobileStatus: bosMissionActive ? "BOS priorisiert" : "Priorisierung aktiv",
      priorityStatus: "Aktiv",
      linkStatus: "Stabil",
      explanation: bosMissionActive
        ? "Priorisierte Datenpakete bleiben stabil zwischen Leitstelle, Mast und Feuerwehr. Polizei ist als nächste Einheit vorbereitet."
        : "BOS-Kommunikation wird priorisiert.",
      ambientIntensity: 0.68,
      sunIntensity: 1.32,
      hemisphereIntensity: 0.74,
      sunColor: 0xe8f8ff,
      fogColor: 0xaedbf2,
      skyTop: 0x55b9f2,
      skyHorizon: 0xcdf6ff,
      skyBottom: 0xaedbf2,
      signalColor: 0x00d4ff,
      signalStrength: bosMissionActive ? 0.68 : 0.52
    }
  };

  return states[state] || states[CITY_STATES.NORMAL];
}

/* -------------------------------------------------------------------------- */
/* Render Loop                                                                */
/* -------------------------------------------------------------------------- */

function animate() {
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();

  panelUpdateTimer += delta;

  if (RECOVERY_CONFIG.enableMissionVisuals) MissionManager.update(delta);
  updateCamera(delta);
  updateNetwork(delta, elapsed);
  if (RECOVERY_CONFIG.enableResponseVehicles) VehicleManager.update(delta);
  if (RECOVERY_CONFIG.enableLegacyTraffic) trafficManager.update(elapsed);
  if (validatedTraffic) validatedTraffic.update(delta, elapsed, cityStateEngine.get());
  if (validatedPedestrians) validatedPedestrians.update(delta, elapsed);
  if (validatedResponseVehicles) validatedResponseVehicles.update(delta, elapsed);
  if (validatedAmbulance) validatedAmbulance.update(delta, elapsed);
  if (validatedStadtwerkeVehicle) validatedStadtwerkeVehicle.update(delta, elapsed);
  if (validatedAmbulanceFoundation && !getActiveMissionId()) {
    validatedAmbulanceFoundation.update(delta, elapsed);
  }
  if (validatedIncidentAccess) validatedIncidentAccess.update(delta, elapsed);
  if (validatedMission001) validatedMission001.update(delta, elapsed);
  if (validatedMission002) validatedMission002.update(delta, elapsed);
  if (validatedMission003) validatedMission003.update(delta, elapsed);
  if (validatedMission004Response) validatedMission004Response.update(delta, elapsed);
  if (validatedMission004) validatedMission004.update(delta, elapsed);

  if (validatedMission004 && validatedMission004Response && validatedAmbulance) {
    const m004ReturnMissionState = validatedMission004.getState();
    const m004ReturnRelevant = ["TRANSPORTING", "AT_HOSPITAL", "RETURNING"].indexOf(m004ReturnMissionState) >= 0;
    if (m004ReturnRelevant && !mission004AmbulanceReturnTraceWasActive) {
      window.MissionBosMission004AmbulanceReturnTrace = [];
      window.MissionBosMission004AmbulanceReturnTraceValidation = null;
      mission004AmbulanceReturnTraceLastSampleElapsed = -Infinity;
      mission004AmbulanceReturnTraceLastCommandSequence = 0;
      mission004AmbulanceReturnTraceWasActive = true;
    }
    if (mission004AmbulanceReturnTraceWasActive) {
      const ambulanceReturnStatus = validatedMission004Response.getAmbulanceReturnStatus
        ? validatedMission004Response.getAmbulanceReturnStatus() : null;
      const ambulanceVehicleState = validatedAmbulance.vehiclesById && validatedAmbulance.vehiclesById.AMBULANCE_01
        ? validatedAmbulance.vehiclesById.AMBULANCE_01 : null;
      const ambulanceState = validatedAmbulance.getState ? validatedAmbulance.getState() : null;
      const ambulanceSafety = validatedAmbulance.getSafetyStatus ? validatedAmbulance.getSafetyStatus() : null;
      const commandSequence = ambulanceReturnStatus ? Number(ambulanceReturnStatus.commandSequence) || 0 : 0;
      const commandChanged = commandSequence > mission004AmbulanceReturnTraceLastCommandSequence;
      const terminalReady = m004ReturnMissionState === "READY" && ambulanceState === "AT_STATION";
      const terminalFailed = m004ReturnMissionState === "FAILED";
      if (commandChanged || terminalReady || terminalFailed || elapsed - mission004AmbulanceReturnTraceLastSampleElapsed >= 0.05 - 1e-9) {
        const returnSample = {
          time: elapsed,
          missionState: m004ReturnMissionState,
          responseState: validatedMission004Response.getState ? validatedMission004Response.getState() : null,
          ambulanceState: ambulanceState,
          routeId: ambulanceVehicleState ? ambulanceVehicleState.routeId : null,
          distance: ambulanceVehicleState ? Number(ambulanceVehicleState.distance) : null,
          ambulanceSafetyStatus: ambulanceSafety ? ambulanceSafety.status : null,
          ambulanceSafetyErrors: ambulanceSafety && Array.isArray(ambulanceSafety.errors) ? ambulanceSafety.errors.slice() : []
        };
        if (commandChanged) {
          returnSample.returnCommandResult = ambulanceReturnStatus && ambulanceReturnStatus.lastCommandResult === true;
          mission004AmbulanceReturnTraceLastCommandSequence = commandSequence;
        }
        window.MissionBosMission004AmbulanceReturnTrace.push(returnSample);
        mission004AmbulanceReturnTraceLastSampleElapsed = elapsed;
      }
      if (terminalReady || terminalFailed) {
        if (window.MissionBosMission004AmbulanceCompletionTraceValidator && window.MISSION_BOS_MISSION_004_AMBULANCE_CORRIDOR_CONTRACT) {
          window.MissionBosMission004AmbulanceReturnTraceValidation = window.MissionBosMission004AmbulanceCompletionTraceValidator.validate(
            window.MissionBosMission004AmbulanceReturnTrace,
            window.MISSION_BOS_MISSION_004_AMBULANCE_CORRIDOR_CONTRACT
          );
          window.MissionBosMission004AmbulanceCompletionTraceValidator.logResult(window.MissionBosMission004AmbulanceReturnTraceValidation);
        }
        mission004AmbulanceReturnTraceWasActive = false;
      }
    }
  }
  if (validatedMissionRegistry) validatedMissionRegistry.update(delta, elapsed);
  applyMissionRegistryFailSoftStatus();
  if (validatedMission001Visuals) validatedMission001Visuals.update(delta, elapsed);
  if (validatedMission002Scene) validatedMission002Scene.update(delta, elapsed);
  if (validatedMission003Scene) validatedMission003Scene.update(delta, elapsed);
  if (validatedMission004Foundation) validatedMission004Foundation.update(delta, elapsed);
  if (validatedArenaEventRenderer) validatedArenaEventRenderer.update(delta, elapsed);
  const missionContext = getCurrentMissionContext();
  const validatedMissionState = missionContext.missionState;
  const networkAssociationState = validatedAmbulanceFoundation && validatedAmbulanceFoundation.isActive()
    ? "ENROUTE"
    : missionContext.networkState;

  if (validatedNetworkAssociation) {
    validatedNetworkAssociation.update(delta, elapsed, {
      missionState: networkAssociationState,
      activeMissionId: missionContext.activeId,
      arenaActive: !!(validatedArenaEvent && validatedArenaEvent.isActive())
    });
  }
  if (validatedCivilianConnectivity) {
    validatedCivilianConnectivity.update(delta, elapsed, {
      missionState: validatedMissionState,
      activeMissionId: missionContext.activeId
    });
  }
  if (validatedArenaEvent) {
    validatedArenaEvent.update(delta, elapsed, {
      bosActive: networkManager.bosPriorityActive,
      manualLoadActive: networkManager.manualLoadActive
    });
  }
  let mission004ConfirmedAmbulanceMilestone = false;
  if (missionContext.activeId === "MISSION_004" && validatedMission004Response &&
      validatedMission004Response.ambulanceAtScene && validatedMission004Response.ambulanceAtScene() &&
      validatedNetworkAssociation && validatedCellLoad && validatedCellLoad.getSaturationSnapshot) {
    const m004PreLoadHotspot = validatedCellLoad.getSaturationSnapshot();
    const m004AmbulanceAssociationBeforeLoad = validatedNetworkAssociation.getAssociation("NET_AMBULANCE_01");
    mission004ConfirmedAmbulanceMilestone = !!(m004PreLoadHotspot && m004PreLoadHotspot.active &&
      m004PreLoadHotspot.towerId && m004AmbulanceAssociationBeforeLoad &&
      m004AmbulanceAssociationBeforeLoad.servingTowerId === m004PreLoadHotspot.towerId);
  }
  if (validatedCellLoad) {
    validatedCellLoad.update(delta, elapsed, {
      missionState: missionContext.cellLoadProfileState,
      actualMissionState: validatedMissionState,
      activeMissionId: missionContext.activeId,
      arenaActive: !!(validatedArenaEvent && validatedArenaEvent.isActive()),
      globalLoad: networkLoad,
      bosActive: networkManager.bosPriorityActive,
      activeBosEndpointIds: missionContext.activeBosEndpointIds,
      manualLoadActive: networkManager.manualLoadActive,
      associationRuntime: validatedNetworkAssociation,
      priorityRuntime: validatedAutomaticBOSPriority,
      mission004AmbulanceAtScene: mission004ConfirmedAmbulanceMilestone
    });
  }
  if (validatedAutomaticBOSPriority) {
    validatedAutomaticBOSPriority.update(delta, elapsed, {
      activeMissionId: missionContext.activeId,
      missionState: validatedMissionState,
      activeBosEndpointIds: missionContext.activeBosEndpointIds
    });
    networkManager.bosPriorityActive = validatedAutomaticBOSPriority.hasAnyActivePriority();
  } else {
    networkManager.bosPriorityActive = false;
  }
  if (missionContext.activeId === "MISSION_004" && validatedMission004 && validatedMission004Response &&
      validatedCellLoad && validatedNetworkAssociation && validatedAutomaticBOSPriority) {
    if (!mission004NetworkTraceWasActive) {
      window.MissionBosMission004NetworkTimingTrace = [];
      window.MissionBosMission004NetworkTimingValidation = null;
      mission004NetworkTraceLastSampleElapsed = -Infinity;
    }
    mission004NetworkTraceWasActive = true;
    if (elapsed - mission004NetworkTraceLastSampleElapsed >= 0.05 - 1e-9) {
      var m004Saturation = validatedCellLoad.getSaturationSnapshot ? validatedCellLoad.getSaturationSnapshot() : null;
      var m004IncidentTowerId = m004Saturation && m004Saturation.active ? m004Saturation.towerId : null;
      var m004AmbulanceAssociation = validatedNetworkAssociation.getAssociation("NET_AMBULANCE_01");
      var m004FireAssociation = validatedNetworkAssociation.getAssociation("NET_FIRE_01");
      var m004PoliceAssociation = validatedNetworkAssociation.getAssociation("NET_POLICE_01");
      var m004PriorityState = m004IncidentTowerId && validatedAutomaticBOSPriority.getCellState
        ? validatedAutomaticBOSPriority.getCellState(m004IncidentTowerId) : null;
      window.MissionBosMission004NetworkTimingTrace.push({
        time: elapsed,
        missionState: validatedMission004.getState(),
        ambulanceState: mission004ConfirmedAmbulanceMilestone ? "AT_INCIDENT" : "ENROUTE",
        incidentTowerId: m004IncidentTowerId,
        incidentLoad: m004IncidentTowerId ? validatedCellLoad.getCellLoad(m004IncidentTowerId) : null,
        ambulanceServingTowerId: m004AmbulanceAssociation && m004AmbulanceAssociation.servingTowerId || null,
        fireServingTowerId: m004FireAssociation && m004FireAssociation.servingTowerId || null,
        policeServingTowerId: m004PoliceAssociation && m004PoliceAssociation.servingTowerId || null,
        fireAtScene: !!(validatedResponseVehicles && validatedResponseVehicles.getVehicleStatus("RESPONSE_FIRE_01") === "Bereitstellung erreicht" &&
          m004IncidentTowerId && m004FireAssociation && m004FireAssociation.servingTowerId === m004IncidentTowerId),
        policeAtScene: !!(validatedResponseVehicles && validatedResponseVehicles.getVehicleStatus("RESPONSE_POLICE_01") === "Bereitstellung erreicht" &&
          m004IncidentTowerId && m004PoliceAssociation && m004PoliceAssociation.servingTowerId === m004IncidentTowerId),
        priorityActive: !!(m004PriorityState && m004PriorityState.active === true)
      });
      mission004NetworkTraceLastSampleElapsed = elapsed;
    }
  } else if (mission004NetworkTraceWasActive) {
    mission004NetworkTraceWasActive = false;
  }


  if (validatedBOSActivationImpact) {
    validatedBOSActivationImpact.update(delta, elapsed);
  }
  if (validatedCellCapacity) {
    if ((previousMissionStateForCellCapacity !== "READY" && validatedMissionState === "READY") ||
        (previousBosStateForCellCapacity === true && networkManager.bosPriorityActive !== true)) {
      validatedCellCapacity.reset();
    }
    validatedCellCapacity.update(delta, elapsed, {
      missionState: validatedMissionState,
      activeMissionId: missionContext.activeId,
      bosActive: networkManager.bosPriorityActive,
      activeBosEndpointIds: missionContext.activeBosEndpointIds,
      priorityRuntime: validatedAutomaticBOSPriority
    });
    previousMissionStateForCellCapacity = validatedMissionState;
    previousBosStateForCellCapacity = networkManager.bosPriorityActive === true;
  }
  if (validatedUnifiedBosConnectivity) {
    validatedUnifiedBosConnectivity.update(delta, elapsed, {
      activeMissionId: missionContext.activeId,
      missionState: validatedMissionState
    });
  }
  if (validatedTelekomCommunication) {
    const communicationMissionState = missionContext.activeId === "MISSION_001"
      ? validatedMissionState : "READY";
    validatedTelekomCommunication.update(delta, elapsed, {
      missionState: communicationMissionState,
      networkLoad: networkLoad,
      bosActive: missionContext.activeId === "MISSION_001" && networkManager.bosPriorityActive
    });
  }
  if (validatedBosBackhaul) validatedBosBackhaul.update(delta, elapsed);
  if (validatedArenaEventConnectivity) validatedArenaEventConnectivity.update(delta, elapsed);
  if (validatedMission003Connectivity) validatedMission003Connectivity.update(delta, elapsed);
  if (validatedMission004Connectivity) validatedMission004Connectivity.update(delta, elapsed);
  if (validatedTowerLoadIndicators) validatedTowerLoadIndicators.update(delta, elapsed);
  if (validatedHandoverVisualization) {
    const handoverMissionState = missionContext.activeId === "MISSION_001" ? validatedMissionState : "READY";
    if (previousMissionStateForHandoverVisualization !== "READY" && handoverMissionState === "READY") {
      validatedHandoverVisualization.reset();
    }
    validatedHandoverVisualization.update(delta, elapsed, {
      missionState: handoverMissionState,
      networkLoad: networkLoad,
      bosActive: missionContext.activeId === "MISSION_001" && networkManager.bosPriorityActive
    });
    previousMissionStateForHandoverVisualization = handoverMissionState;
  }
  if (validatedCivilianConnectivityVisuals) {
    validatedCivilianConnectivityVisuals.update(delta, elapsed);
  }
  if (validatedNetworkInspection) {
    if (previousMissionStateForNetworkInspection !== "READY" && validatedMissionState === "READY") {
      validatedNetworkInspection.reset();
    }
    validatedNetworkInspection.update(delta, elapsed);
    previousMissionStateForNetworkInspection = validatedMissionState;
  }
  if (validatedPresenter) validatedPresenter.update(delta, elapsed);
  if (validatedExplorationInterface) validatedExplorationInterface.update(delta, elapsed);
  if (RECOVERY_CONFIG.enablePedestrians) pedestrianManager.update(delta, elapsed);
  if (RECOVERY_CONFIG.enableMissionVisuals) updateMissionVisuals(delta, elapsed);
  updateTowerAndAtmosphere(delta, elapsed);
  DispatchManager.update(elapsed);
  if (RECOVERY_CONFIG.enableCommunicationRenderer) CommunicationRenderer.update(elapsed);
  updateBillboards();
  updateSimulatedTime(delta);

  uiManager.updateButtons();
  uiManager.updateMissionPanel();
  uiManager.updateDashboard();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function onWindowResize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}