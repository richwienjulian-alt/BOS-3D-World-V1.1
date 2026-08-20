/* Mission BOS - Build 010P.2
   Safe network-plan extension for the single ambulance endpoint.
   Keeps the 009N.7 baseline object available and exposes one derived plan.
*/
(function () {
  "use strict";
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }
  var base = window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN;
  var ambulancePlan = window.MISSION_BOS_AMBULANCE_PLAN;
  if (!base || !ambulancePlan) {
    window.MISSION_BOS_AMBULANCE_NETWORK_EXTENSION = null;
    return;
  }
  window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN_009N7_BASELINE = base;
  var extended = clone(base);
  var endpoint = {
    id: ambulancePlan.networkExtension.associationEndpointId,
    kind: ambulancePlan.networkExtension.kind,
    referenceId: ambulancePlan.networkExtension.referenceId,
    label: ambulancePlan.networkExtension.label,
    channel: ambulancePlan.networkExtension.channel,
    active: true
  };
  if (!extended.mobileEndpoints.some(function (item) { return item.id === endpoint.id; })) {
    extended.mobileEndpoints.push(endpoint);
  }

  var healthTower = extended.towers.find(function (tower) {
    return tower && (tower.referenceId === "MAST_C" || tower.id === "MAST_C");
  });
  var healthInfluence = {
    id: "C_HEALTH_CAMPUS_APPROACH",
    type: "ellipse",
    center: { x: 24, z: 30 },
    radiusX: 16,
    radiusZ: 10,
    peakGain: 10,
    meaning: "Vereinfachte lokale Ausbreitungs- und Antennenausrichtungswirkung im Gesundheitsbereich; ausschließlich zur plausiblen Serving-Cell-Auswahl, keine physikalische Funkplanung."
  };
  if (healthTower) {
    healthTower.coverageInfluences = healthTower.coverageInfluences || [];
    if (!healthTower.coverageInfluences.some(function (influence) { return influence && influence.id === healthInfluence.id; })) {
      healthTower.coverageInfluences.push(healthInfluence);
    }
  }

  extended.expectedCounts.mobileEndpoints = 9;
  extended.expectedCounts.responseVehicleEndpoints = 3;
  extended.expectedCounts.missionPhoneEndpoints = 6;
  extended.ambulanceExtension = {
    build: "010P.6",
    endpointId: endpoint.id,
    baselineEndpointCount: base.mobileEndpoints.length,
    fixedServingTowerDefinitions: 0,
    healthCampusInfluenceId: healthInfluence.id
  };
  window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN = deepFreeze(extended);
  window.MISSION_BOS_AMBULANCE_NETWORK_EXTENSION = deepFreeze({
    status: "READY",
    endpoint: endpoint,
    baselinePlan: base,
    extendedPlan: window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN
  });
})();
