/* Mission BOS - Build 011N.3R.1
   Structural validator for the frozen recovery contract.
*/
(function () {
  "use strict";

  function finite(value) {
    return typeof value === "number" && isFinite(value);
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function containsFixedTowerDefinition(value, path, errors) {
    if (!value || typeof value !== "object") return;
    Object.keys(value).forEach(function (key) {
      var nextPath = path ? path + "." + key : key;
      var lower = key.toLowerCase();
      if (lower === "fixedservingtowerid" || lower === "fixedtowerid" || lower === "servingtowerid") {
        errors.push("Fixed serving tower field detected: " + nextPath);
      }
      containsFixedTowerDefinition(value[key], nextPath, errors);
    });
  }

  function validate(plan, networkRealismPlan, mission001PolishPlan) {
    var result = {
      title: "MISSION BOS NETWORK RECOVERY 011N.3R.1 VALIDATION",
      dependencyErrors: 0,
      baselineErrors: 0,
      policyErrors: 0,
      endpointErrors: 0,
      visualStateErrors: 0,
      packetAnimationErrors: 0,
      priorityThresholdErrors: 0,
      saturationErrors: 0,
      returnReleaseErrors: 0,
      dashboardErrors: 0,
      missionCompletionErrors: 0,
      fixedTowerErrors: 0,
      expectedCountErrors: 0,
      status: "PASSED",
      errors: []
    };

    function add(key, message) {
      result[key] += 1;
      result.errors.push(message);
    }

    if (!plan || !networkRealismPlan || !mission001PolishPlan) {
      add("dependencyErrors", "Recovery plan, network realism plan or Mission 001 polish plan is missing.");
      result.status = "FAILED";
      return result;
    }

    if (plan.sourceBuild !== "Mission-BOS-Build-011N.2" || plan.cleanRebuildRequired !== true) {
      add("baselineErrors", "Recovery must be a clean rebuild from Build 011N.2.");
    }
    if (plan.rejectedBuild !== "Mission-BOS-Build-011N.3") {
      add("baselineErrors", "Rejected Build 011N.3 is not documented.");
    }

    var policy = plan.policy || {};
    [
      "useRejectedBuildAsSourceAllowed",
      "cityGeometryChangesAllowed",
      "routeChangesAllowed",
      "missionStoryChangesAllowed",
      "newMissionAllowed",
      "newCommunicationTypeAllowed",
      "fixedServingTowerAllowed",
      "runtimeRandomizationAllowed",
      "manualBosActivationAllowed",
      "rendererMayGateMissionCompletion"
    ].forEach(function (key) {
      if (policy[key] !== false) add("policyErrors", "Policy must be false: " + key);
    });
    if (policy.fileProtocolRequired !== true) add("policyErrors", "file:// portability must remain required.");

    var permanent = plan.permanentBosConnectivity || {};
    var endpointIds = permanent.endpointIds || [];
    var requiredIds = ["NET_FIRE_01", "NET_POLICE_01", "NET_AMBULANCE_01"];
    requiredIds.forEach(function (id) {
      if (endpointIds.indexOf(id) < 0) add("endpointErrors", "Missing permanent BOS endpoint: " + id);
    });
    if (endpointIds.length !== 3 || permanent.associationMode !== "always") {
      add("endpointErrors", "Exactly three always-associated BOS endpoints are required.");
    }
    if (permanent.standbyAssociationAddsFullMissionDemand !== false || permanent.priorityEligibilityRemainsMissionScoped !== true) {
      add("endpointErrors", "Permanent association must remain separate from mission demand and priority eligibility.");
    }

    var participants = (((networkRealismPlan || {}).participants || {}).bos || []);
    requiredIds.forEach(function (id) {
      if (!participants.some(function (definition) { return definition && definition.id === id; })) {
        add("endpointErrors", "Network realism source is missing BOS endpoint: " + id);
      }
    });

    var visual = plan.visualStateMachine || {};
    var standby = visual.standbyConnected || {};
    var active = visual.priorityActive || {};
    if (standby.lineColor !== "#9BDFFF" || standby.towerPriorityLaneVisible !== false || standby.dashboardBosBadgeVisible !== false) {
      add("visualStateErrors", "Standby visual state is invalid.");
    }
    if (active.lineColor !== "#0066CC" || active.packetColor !== "#E20074" || active.towerPriorityLaneVisible !== true) {
      add("visualStateErrors", "Active priority visual state is invalid.");
    }
    if (standby.packetsPerDirection !== 2 || active.packetsPerDirection !== 2) {
      add("visualStateErrors", "Both visual states require two packets per direction.");
    }
    if (!(active.packetCyclesPerSecond > standby.packetCyclesPerSecond)) {
      add("visualStateErrors", "Active packets must be faster than standby packets.");
    }

    var packets = plan.packetAnimation || {};
    if (packets.clock !== "global-render-elapsed" || packets.updateFrequency !== "every-render-frame") {
      add("packetAnimationErrors", "Packets must use global render elapsed time and frame updates.");
    }
    if (packets.packetsPerPath !== 4 || packets.forwardPackets !== 2 || packets.reversePackets !== 2) {
      add("packetAnimationErrors", "Each BOS path must own four packets in two directions.");
    }
    if (packets.sharedPacketMeshesAcrossPathsAllowed !== false || packets.missionStateElapsedAllowedAsClock !== false) {
      add("packetAnimationErrors", "Packet meshes cannot be shared and mission state elapsed cannot be the clock.");
    }
    if (packets.preservePhaseAcrossMissionStateChange !== true || packets.hideStalePathImmediately !== true) {
      add("packetAnimationErrors", "Continuous phase and stale-path cleanup are required.");
    }

    var priority = plan.priorityLifecycle || {};
    if (priority.activationThreshold !== 90 || priority.releaseThreshold !== 85) {
      add("priorityThresholdErrors", "Priority thresholds must remain 90/85.");
    }
    if (!finite(priority.activationDelaySeconds) || !finite(priority.releaseDelaySeconds) ||
        priority.activationDelaySeconds <= 0 || priority.releaseDelaySeconds <= 0) {
      add("priorityThresholdErrors", "Priority delays must be positive finite values.");
    }
    if (priority.noPriorityWithoutMissionEligibleBos !== true || priority.noMagentaWithoutActivePriority !== true) {
      add("priorityThresholdErrors", "Priority eligibility and magenta leakage safeguards are required.");
    }

    var saturation = plan.saturation || {};
    var m1 = saturation.mission001 || {};
    var m2 = saturation.mission002 || {};
    if (saturation.deterministic !== true || saturation.randomValuesAllowed !== false || saturation.cycleSeconds !== 8) {
      add("saturationErrors", "Saturation must be deterministic with an eight-second cycle.");
    }
    if (m1.minimumLoad !== 98 || m1.maximumLoad !== 100 || (m1.enabledStates || []).indexOf("COMPLETED") < 0) {
      add("saturationErrors", "Mission 001 saturation range or states are invalid.");
    }
    if ((m1.disabledStates || []).indexOf("RETURNING") < 0 || saturation.stopImmediatelyOnReturning !== true) {
      add("returnReleaseErrors", "Saturation must stop immediately in RETURNING.");
    }
    if (m2.eventWithoutBosMinimumLoad !== 96 || m2.eventWithBosMinimumLoad !== 98 || m2.maximumLoad !== 100) {
      add("saturationErrors", "Mission 002 saturation ranges are invalid.");
    }

    var dashboard = plan.dashboardSeverity || {};
    if (dashboard.rows !== 5 || (dashboard.thresholds || []).length !== 4) {
      add("dashboardErrors", "Dashboard must contain five rows and four severity bands.");
    }
    var expectedThresholds = [0, 55, 75, 90];
    (dashboard.thresholds || []).forEach(function (entry, index) {
      if (!entry || entry.minimum !== expectedThresholds[index]) {
        add("dashboardErrors", "Dashboard threshold mismatch at index " + index + ".");
      }
    });
    if (dashboard.overloadedCellRemainsRedWhenPriorityActive !== true || dashboard.activePriorityAddsBlueBadge !== true) {
      add("dashboardErrors", "Overload red plus BOS blue badge is required.");
    }
    if (dashboard.newPanelAllowed !== false || dashboard.dashboardWidthChangeAllowed !== false) {
      add("dashboardErrors", "No new dashboard panel or width change is allowed.");
    }

    var completion = plan.missionCompletion || {};
    if (completion.mission001MustReachCompleted !== true || completion.mission001MustReachReturning !== true ||
        completion.mission001MustReturnToReady !== true || completion.immediateReplayRequired !== true) {
      add("missionCompletionErrors", "Mission 001 completion and replay requirements are incomplete.");
    }
    if (completion.saturationAllowedInReturning !== false || completion.rendererVisibilityMayBlockCompletion !== false ||
        completion.rendererPacketProgressMayBlockCompletion !== false) {
      add("missionCompletionErrors", "Renderer and RETURNING safeguards are invalid.");
    }

    var fixedErrors = [];
    containsFixedTowerDefinition(plan, "recoveryPlan", fixedErrors);
    if (fixedErrors.length) {
      result.fixedTowerErrors += fixedErrors.length;
      Array.prototype.push.apply(result.errors, fixedErrors);
    }

    var expected = plan.expectedCounts || {};
    if (expected.permanentBosEndpoints !== 3 || expected.mission001BosEndpoints !== 2 || expected.ambulanceEndpoints !== 1 ||
        expected.dashboardRows !== 5 || expected.packetsPerBosPath !== 4 || expected.packetDirections !== 2 ||
        expected.fixedServingTowerDefinitions !== 0 || expected.randomSaturationSources !== 0) {
      add("expectedCountErrors", "Expected recovery counts are invalid.");
    }

    result.status = result.errors.length ? "FAILED" : "PASSED";
    return result;
  }

  function logResult(result) {
    result = result || { title: "MISSION BOS NETWORK RECOVERY 011N.3R.1 VALIDATION", status: "FAILED", errors: ["No validation result."] };
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    [
      "dependencyErrors",
      "baselineErrors",
      "policyErrors",
      "endpointErrors",
      "visualStateErrors",
      "packetAnimationErrors",
      "priorityThresholdErrors",
      "saturationErrors",
      "returnReleaseErrors",
      "dashboardErrors",
      "missionCompletionErrors",
      "fixedTowerErrors",
      "expectedCountErrors"
    ].forEach(function (key) {
      console[method](key + ": " + Number(result[key] || 0));
    });
    console[method]("STATUS: " + result.status);
    if (result.errors && result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosNetworkRecoveryValidator = {
    validate: validate,
    logResult: logResult,
    copy: copy
  };
})();
