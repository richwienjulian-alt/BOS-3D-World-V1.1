/* Mission BOS - Build 011N.4
   Structural validator for Mission 001 connectivity parity.
*/
(function () {
  "use strict";

  function add(result, key, message) {
    result[key] += 1;
    result.errors.push(message);
  }

  function containsForbiddenCellField(value, path, result) {
    if (!value || typeof value !== "object") return;
    Object.keys(value).forEach(function (key) {
      var lower = key.toLowerCase();
      var next = path ? path + "." + key : key;
      if (lower === "servingtowerid" || lower === "fixedtowerid" ||
          lower === "fixedservingtowerid" || lower === "fixedcellid") {
        add(result, "fixedCellErrors", "Forbidden fixed-cell field: " + next);
      }
      containsForbiddenCellField(value[key], next, result);
    });
  }

  function sameNumbers(actual, expected) {
    if (!Array.isArray(actual) || actual.length !== expected.length) return false;
    for (var i = 0; i < expected.length; i += 1) {
      if (Number(actual[i]) !== Number(expected[i])) return false;
    }
    return true;
  }

  function validate(plan) {
    var result = {
      title: "MISSION BOS MISSION 001 CONNECTIVITY PARITY 011N.4 VALIDATION",
      dependencyErrors: 0,
      baselineErrors: 0,
      policyErrors: 0,
      endpointErrors: 0,
      packetErrors: 0,
      renderErrors: 0,
      visualErrors: 0,
      backhaulErrors: 0,
      expectedCountErrors: 0,
      fixedCellErrors: 0,
      status: "PASSED",
      errors: []
    };

    if (!plan) {
      add(result, "dependencyErrors", "Parity plan is missing.");
      result.status = "FAILED";
      return result;
    }

    if (plan.sourceBuild !== "Mission-BOS-Build-011N.3R.1") {
      add(result, "baselineErrors", "Unexpected source build.");
    }

    var policy = plan.policy || {};
    [
      "associationChangesAllowed",
      "radioModelChangesAllowed",
      "cellLoadChangesAllowed",
      "capacityChangesAllowed",
      "priorityThresholdChangesAllowed",
      "routeChangesAllowed",
      "missionStateChangesAllowed",
      "fixedCellAssignmentAllowed",
      "duplicateBosPathsAllowed",
      "rendererMayGateMissionCompletion"
    ].forEach(function (key) {
      if (policy[key] !== false) add(result, "policyErrors", "Policy must be false: " + key);
    });
    if (policy.mission002ReferenceMustRemainUnchanged !== true) {
      add(result, "policyErrors", "Mission 002 must remain unchanged.");
    }

    var reference = plan.reference || {};
    if (reference.file !== "city-ambulance-connectivity-renderer.js" ||
        reference.endpointId !== "NET_AMBULANCE_01" ||
        reference.approvedByUser !== true) {
      add(result, "dependencyErrors", "Approved Mission 002 reference is invalid.");
    }

    var endpoints = plan.targetEndpoints || [];
    var endpointIds = endpoints.map(function (entry) { return entry && entry.endpointId; });
    if (endpoints.length !== 2 ||
        endpointIds.indexOf("NET_FIRE_01") < 0 ||
        endpointIds.indexOf("NET_POLICE_01") < 0) {
      add(result, "endpointErrors", "Exactly fire and police endpoints are required.");
    }

    var packets = plan.packetContract || {};
    if (Number(packets.geometryRadius) !== 0.15 ||
        Number(packets.geometryWidthSegments) !== 8 ||
        Number(packets.geometryHeightSegments) !== 6 ||
        Number(packets.packetsPerPath) !== 4 ||
        Number(packets.forwardPackets) !== 2 ||
        Number(packets.reversePackets) !== 2) {
      add(result, "packetErrors", "Packet geometry or counts differ from the reference.");
    }
    if (!sameNumbers(packets.directions, [1, 1, -1, -1]) ||
        !sameNumbers(packets.offsets, [0, 0.5, 0.25, 0.75])) {
      add(result, "packetErrors", "Packet direction or offset contract is invalid.");
    }
    if (packets.clock !== "global-render-elapsed" ||
        packets.updateFrequency !== "every-render-frame" ||
        packets.preservePhaseAcrossVisualStateChange !== true ||
        packets.preservePhaseAcrossMissionStateChange !== true ||
        packets.sharedPacketMeshesAcrossPathsAllowed !== false) {
      add(result, "packetErrors", "Packet clock contract is invalid.");
    }

    var render = plan.renderContract || {};
    if (render.depthTest !== false || render.depthWrite !== false ||
        Number(render.glowRenderOrder) !== 40 ||
        Number(render.coreRenderOrder) !== 41 ||
        Number(render.packetRenderOrder) !== 42 ||
        render.liveVehicleAnchorEveryFrame !== true ||
        render.liveTowerBeaconAnchorEveryFrame !== true ||
        render.stalePathHiddenImmediately !== true ||
        render.visibleOutsideMissions !== true) {
      add(result, "renderErrors", "Render contract differs from the Mission 002 reference.");
    }

    var visual = plan.visualContract || {};
    if (visual.standbyLineColor !== "#9BDFFF" ||
        visual.standbyPacketColor !== "#B9E6FF" ||
        visual.priorityLineColor !== "#0066CC" ||
        visual.priorityPacketColor !== "#E20074" ||
        visual.colorsReadFromExistingVisualPlan !== true ||
        visual.priorityReadOnlyFromCellPriorityRuntime !== true ||
        visual.magentaWithoutActiveCellPriorityAllowed !== false) {
      add(result, "visualErrors", "Visual parity contract is invalid.");
    }

    var backhaul = plan.backhaulContract || {};
    if (backhaul.buildingId !== "B01" ||
        backhaul.followConfirmedCells !== true ||
        backhaul.uniquePathPerServingCell !== true ||
        backhaul.permanentlyVisible !== true ||
        backhaul.preserveExistingRenderer !== true) {
      add(result, "backhaulErrors", "B01 backhaul contract is invalid.");
    }

    var expected = plan.expected || {};
    if (Number(expected.mission001BosVehiclePaths) !== 2 ||
        Number(expected.packetsPerVehiclePath) !== 4 ||
        Number(expected.packetsEachDirection) !== 2 ||
        Number(expected.fixedCellAssignments) !== 0 ||
        Number(expected.mission002FilesChanged) !== 0 ||
        Number(expected.newMissionRegistrations) !== 0) {
      add(result, "expectedCountErrors", "Expected parity counts are invalid.");
    }

    containsForbiddenCellField(plan, "parityPlan", result);
    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }

  function logResult(result) {
    result = result || {
      title: "MISSION BOS MISSION 001 CONNECTIVITY PARITY 011N.4 VALIDATION",
      status: "FAILED",
      errors: ["No result."]
    };
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    [
      "dependencyErrors", "baselineErrors", "policyErrors", "endpointErrors",
      "packetErrors", "renderErrors", "visualErrors", "backhaulErrors",
      "expectedCountErrors", "fixedCellErrors"
    ].forEach(function (key) {
      console[method](key + ": " + Number(result[key] || 0));
    });
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosMission001ConnectivityParityValidator = {
    validate: validate,
    logResult: logResult
  };
})();
