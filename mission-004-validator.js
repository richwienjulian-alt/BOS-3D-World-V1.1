/* Mission BOS - Build 013M.9 preparation Mission 004 validator.
   Copy unchanged into the implementation build.
*/
(function () {
  "use strict";
  function finite(v, f) { v = Number(v); return isFinite(v) ? v : f; }
  function copy(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function result() {
    return { title: "MISSION BOS MISSION 004 PLAN VALIDATION", dependencyErrors: 0, policyErrors: 0, stateErrors: 0, responseErrors: 0, routeErrors: 0, returnSequenceErrors: 0, trafficErrors: 0, sceneErrors: 0, networkErrors: 0, registryErrors: 0, radioCalibrationErrors: 0, fixedTowerErrors: 0, runtimeContractErrors: 0, expectedCountErrors: 0, status: "PASSED", errors: [] };
  }
  function add(r, key, message) { r[key] += 1; r.errors.push(message); }
  function finish(r) { if (r.errors.length) r.status = "FAILED"; return r; }
  function validate(plan, foundation, layout, associationPlan, radioModel) {
    var r = result();
    if (!plan || !foundation || !layout || !associationPlan || !radioModel) {
      add(r, "dependencyErrors", "Mission 004 plan, foundation, layout, association plan or radio model is missing.");
      return finish(r);
    }
    if (plan.missionId !== "MISSION_004" || plan.build !== "013M.9" || plan.sourceBuildRequired !== "Mission-BOS-Build-013M.8" ||
        plan.sourceArchiveSha256Required !== "b2a230e8ed98928538153f1476dd86c29501d7ccd033e9475050154f03fa2409") {
      add(r, "dependencyErrors", "Mission 004 source identity is invalid for Build 013M.9.");
    }
    var p = plan.policy || {};
    ["cityGeometryChangesAllowed", "existingMissionChangesAllowed", "existingVehicleDuplicationAllowed", "networkAlgorithmChangesAllowed", "fixedServingTowerAllowed", "automaticCameraMovementAllowed", "automaticMissionSelectionAllowed", "automaticMissionStartAllowed", "automaticMissionFinishAllowed"].forEach(function (key) {
      if (p[key] !== false) add(r, "policyErrors", key + " must be false.");
    });
    if (p.automaticBOSPriorityRequired !== true || p.sharedOperationalConnectivityRequired !== true || p.manualFinishGateRequired !== true) {
      add(r, "policyErrors", "Automatic priority, shared connectivity and manual finish gate are required.");
    }

    var stateIds = (plan.states || []).map(function (s) { return s.id; });
    var expectedStates = ["READY", "CALL_RECEIVED", "ALARMING", "ROAD_CLOSURE", "ENROUTE", "ON_SCENE", "OVERLOADED", "BOS_ACTIVE", "COMMS_STABLE", "EXTRICATION", "PATIENT_READY", "COMPLETED", "TRANSPORTING", "AT_HOSPITAL", "RETURNING", "FAILED"];
    if (JSON.stringify(stateIds) !== JSON.stringify(expectedStates)) add(r, "stateErrors", "Mission 004 state sequence must contain the frozen 16 states in order.");
    if ((plan.sequence || {}).finishRequiresState !== "COMPLETED" || (plan.sequence || {}).finishAction !== "FINISH_AND_RETURN") add(r, "stateErrors", "Mission 004 must use the manual COMPLETED finish gate.");

    var response = plan.response || {};
    var responseIds = (response.activeVehicleIds || []).slice().sort();
    if (JSON.stringify(responseIds) !== JSON.stringify(["AMBULANCE_01", "RESPONSE_FIRE_01", "RESPONSE_POLICE_01"])) add(r, "responseErrors", "Mission 004 must reuse exactly the three existing response vehicles.");
    var stage = response.calibratedStagePositions || {};
    if (Object.keys(stage).length !== 3) add(r, "responseErrors", "Three calibrated stage positions are required.");
    [response.fireRoute, response.policeRoute, response.ambulanceOutboundRoute, response.ambulanceHospitalRoute].forEach(function (route) {
      if (!route || !route.id) add(r, "routeErrors", "A required Mission 004 route is missing.");
    });
    var hospitalRoute = response.ambulanceHospitalRoute || {};
    var expectedHospitalSurfaces = ["RING_NORTH", "RING_EAST", "NORTH_CONNECTOR", "KLINIKALLEE", "HOSPITAL_AMBULANCE_ACCESS"];
    if (hospitalRoute.id !== "AMBULANCE_M004_TO_HOSPITAL_ROUTE" || !Array.isArray(hospitalRoute.points) || hospitalRoute.points.length < 50 ||
        JSON.stringify(hospitalRoute.allowedSurfaceIds || []) !== JSON.stringify(expectedHospitalSurfaces) ||
        (hospitalRoute.allowedSurfaceIds || []).indexOf("HOSPITAL_FORECOURT") >= 0 ||
        finite(hospitalRoute.speed, -1) !== 5.65 || finite(hospitalRoute.lengthReferenceMeters, -1) < 75.45 ||
        hospitalRoute.hospitalForecourtPedestrianTraversalAllowed !== false || hospitalRoute.outerRingTrafficMustRemainYieldedUntilHospitalArrival !== true) {
      add(r, "routeErrors", "Mission 004 corrected pedestrian-free hospital transport route is incomplete.");
    }
    var ambulanceReturnRoute = response.ambulanceReturnRoute || {};
    if (response.ambulanceReturnRouteId !== "AMBULANCE_M004_HOSPITAL_TO_STATION_ROUTE" ||
        ambulanceReturnRoute.id !== response.ambulanceReturnRouteId || !Array.isArray(ambulanceReturnRoute.points) || ambulanceReturnRoute.points.length < 2 ||
        !Array.isArray(ambulanceReturnRoute.allowedSurfaceIds) || ambulanceReturnRoute.allowedSurfaceIds.length !== 3 ||
        finite(ambulanceReturnRoute.speed, -1) !== 5.25 || ambulanceReturnRoute.mustBePreparedInsideMissionRouteProfile !== true ||
        ambulanceReturnRoute.mayNotDependOnMission002FoundationController !== true) {
      add(r, "routeErrors", "Mission 004 explicit ambulance hospital return route is incomplete.");
    }
    if (finite((plan.sequence || {}).ambulanceReturnCommandStateDeadlineSeconds, -1) !== 0.35 ||
        finite((plan.sequence || {}).ambulanceReturnMaximumSeconds, -1) !== 6.0 ||
        finite((plan.sequence || {}).ambulanceHospitalTransportMaximumSeconds, -1) !== 16.5 ||
        (plan.sequence || {}).ambulanceHospitalTransportRequiresRuntimeSafetyPassed !== true ||
        (plan.sequence || {}).hospitalTransportUsesPedestrianFreeAccessCorridor !== true ||
        (plan.sequence || {}).outerRingTrafficReleaseRequiresAmbulanceAtHospital !== true ||
        (plan.sequence || {}).ambulanceReturnRequiresActualRuntimeState !== true || (plan.sequence || {}).ambulanceReturnTraceRequired !== true) {
      add(r, "responseErrors", "Mission 004 real ambulance transport/return runtime contract is incomplete.");
    }
    var returnSequence = response.returnSequencing || {};
    if (returnSequence.strategy !== "FIRE_BACKOUT_TURN_THEN_POLICE_GATE" || returnSequence.fireVehicleId !== "RESPONSE_FIRE_01" ||
        returnSequence.policeVehicleId !== "RESPONSE_POLICE_01" || returnSequence.stagePositionsFrozenForRadioParity !== true ||
        finite(response.fireRoute && response.fireRoute.returnDelaySeconds, -1) !== 0 ||
        finite(response.policeRoute && response.policeRoute.returnDelaySeconds, -1) < 4.0 ||
        finite(returnSequence.policeReturnDelaySeconds, -1) < 4.0 ||
        finite(returnSequence.fireBackoutDistanceMeters, 0) < 6.0 ||
        finite(returnSequence.fireBackoutSpeedMetersPerSecond, 0) <= 0 ||
        returnSequence.fireBackoutKeepsOutboundHeading !== true || returnSequence.fireTurnsOnlyAfterBackout !== true ||
        returnSequence.fireGateId !== "M004_FIRE_CLEARANCE_TURN_COMPLETE" ||
        returnSequence.policeGateVehicleId !== "RESPONSE_FIRE_01" ||
        returnSequence.policeGateId !== "M004_FIRE_CLEARANCE_TURN_COMPLETE" ||
        finite(returnSequence.policeMinimumReleaseDelaySeconds, -1) < 4.0 ||
        returnSequence.policeMayNotRotateBeforeGate !== true || returnSequence.runtimeTurnSweepValidationRequired !== true ||
        returnSequence.fullReturnSatValidationRequired !== true) {
      add(r, "returnSequenceErrors", "Mission 004 must back fire out before turning and release police only after the fire clearance-turn gate.");
    }
    var corridor = response.returnCorridorReservation || {};
    if (corridor.strategy !== "YIELD_DOWNTOWN_BEFORE_FIRE_POLICE_RETURN" || corridor.vehicleId !== "CAR_DOWNTOWN_01" ||
        corridor.routeId !== "DOWNTOWN_LOOP" || finite(corridor.southApproachHoldDistance, -1) !== 50 ||
        finite(corridor.northExitHoldDistance, -1) !== 4 || finite(corridor.eastBypassHoldDistance, -1) !== 27 ||
        JSON.stringify(corridor.safeHoldDistances || []) !== JSON.stringify([4, 27, 50]) ||
        corridor.assignmentRule !== "NEXT_FORWARD_SAFE_HOLD_FROM_4_27_50" || corridor.firePoliceReturnRequiresConfirmedYield !== true ||
        corridor.firePoliceRemainStationaryUntilConfirmedYield !== true || corridor.ambulanceTransportMayStartBeforeReservation !== true ||
        corridor.releaseRequiresFirePoliceAtBase !== true || corridor.releaseRequiresAmbulanceAtHospitalOrBeyond !== true ||
        corridor.outerRingYieldsRemainActiveDuringHospitalTransport !== true || corridor.releaseMayNotDisableRuntimeCollisionSafety !== true ||
        corridor.visibleTeleportAllowed !== false || corridor.deterministicPhaseSweepRequired !== true ||
        finite(corridor.maximumWaitSeconds, 99) > 8.0) {
      add(r, "returnSequenceErrors", "Mission 004 downtown return-corridor reservation is incomplete.");
    }
    var customer = plan.customerPresentation || {}, labels = customer.statusBadgeByState || {}, controls = plan.controls || {}, buttonLabels = controls.missionButtonLabels || {};
    if (buttonLabels.READY !== "Mission 004 starten") add(r, "stateErrors", "Mission 004 READY button label must be 'Mission 004 starten'.");
    if (customer.headerBadgeUsesCompactStatus !== true || customer.longStatusMayNotOccupyHeaderPill !== true ||
        customer.fullStatusLabelRemainsDescriptionSource !== true || customer.titleUsesNormalWordWrapping !== true ||
        labels.READY !== "Bereit" || labels.RETURNING !== "Rückfahrt" || labels.FAILED !== "Stopp") {
      add(r, "stateErrors", "Mission 004 compact customer incident-card presentation contract is incomplete.");
    }
    var sequence = plan.sequence || {};
    if (sequence.ambulanceTransportStartsImmediatelyOnFinish !== true || sequence.firePoliceReturnWaitsForReturnCorridorReservation !== true ||
        finite(sequence.returnCorridorPreparationMaximumWaitSeconds, 99) > 8 || sequence.operationalReturnCompletionEndsNetworkMission !== true ||
        finite(sequence.completionSettlementMaximumSeconds, 99) > 8 || sequence.readyRequiresBoundedNetworkSettlement !== true) {
      add(r, "returnSequenceErrors", "Mission 004 bounded return/completion settlement contract is incomplete.");
    }

    var tc = plan.trafficClosure || {};
    if ((tc.affectedVehicleIds || []).length !== 3 || (tc.queueHoldDistances || []).length !== 3 ||
        tc.dispatchWaitsOnlyForLeadVehicle !== false || tc.dispatchWaitsForProtectedCorridorClear !== true ||
        tc.currentPositionHoldAllowedOutsideProtectedCorridor !== true || tc.noVehicleMayWrapThroughProtectedCorridorToReachHold !== true ||
        tc.protectedCorridorMayNotBeClearedThroughIncident !== true || tc.criticalApproachRequiresNonCrossingEscape !== true ||
        tc.visibleIncidentRequiresExclusionClear !== true || tc.visibleTeleportThroughIncidentAllowed !== false ||
        tc.fullRingWrapToReachHoldAllowed !== false || tc.releaseRequiresFirePoliceAtBase !== true || tc.allYieldsMustBeReleasedBeforeReady !== true) {
      add(r, "trafficErrors", "Traffic no-cross / queue contract is incomplete.");
    }
    var protectedRange = tc.protectedCorridorDistanceRange || {};
    var exclusion = tc.incidentExclusionDistanceRange || {};
    var critical = tc.criticalApproachDistanceRange || {};
    var protectedMin = finite(protectedRange.min, -1), protectedMax = finite(protectedRange.max, -1);
    var exclusionMin = finite(exclusion.min, -1), exclusionMax = finite(exclusion.max, -1);
    var criticalMin = finite(critical.min, -1), criticalMax = finite(critical.max, -1);
    var downstreamHold = finite(tc.downstreamClearHoldDistance, -1), downstreamGate = finite(tc.downstreamClearAllowedOnlyAfterDistance, -1), routeLength = finite(tc.routeLength, -1);
    if (!(protectedMin > 0 && protectedMax > protectedMin && exclusionMin > protectedMin && exclusionMax > exclusionMin &&
          exclusionMax < protectedMax && criticalMin === protectedMin && criticalMax >= exclusionMax && downstreamGate >= exclusionMax &&
          downstreamHold > protectedMax && downstreamHold < routeLength)) add(r, "trafficErrors", "Mission 004 traffic distance ranges are invalid.");
    if ((tc.queueHoldDistances || []).some(function (distance) { return !(finite(distance, Infinity) >= 0 && finite(distance, Infinity) < protectedMin); })) add(r, "trafficErrors", "All queue holds must remain west of the protected BOS approach corridor.");
    if (finite((plan.sequence || {}).roadClosureMaximumWaitSeconds, 0) < 18 || (plan.sequence || {}).dispatchRequiresProtectedCorridorClear !== true) add(r, "trafficErrors", "Road-closure dispatch safety window is incomplete.");

    if ((plan.scene.bystanders || []).length !== 8 || plan.scene.patientHiddenAtTransportStart !== true || plan.scene.accidentSceneClearsDuringTransport !== true) add(r, "sceneErrors", "Mission 004 scene lifecycle is incomplete.");
    var grounding = plan.scene.collisionVehicleVisualGrounding || {};
    if (finite(grounding.preserveRootY, -1) !== 0.42 || grounding.preserveXZAndRotation !== true ||
        finite(grounding.wheelLocalY, 99) !== -0.20 || finite(grounding.wheelRadius, 0) !== 0.22 ||
        Math.abs(finite(grounding.expectedWheelWorldBottomY, 99)) > 0.001 || grounding.visualOnlyNoCollisionGeometryChange !== true) {
      add(r, "sceneErrors", "Mission 004 collision-vehicle road-grounding contract is incomplete.");
    }

    var n = plan.network || {}, targets = n.incidentLoadTargets || {};
    if ((n.activeBosEndpointIds || []).length !== 3 || (n.missionCivilianEndpointIds || []).length !== 8 || n.priorityActivationThreshold !== 90 || n.priorityReleaseThreshold !== 85 || n.sameCellCompetitionRequired !== true || n.noMissionSpecificServingTowerDefinitions !== true) add(r, "networkErrors", "Mission 004 network contract is incomplete.");
    if (finite(targets.CALL_RECEIVED, 0) < 55 || finite(targets.ALARMING, 0) <= finite(targets.CALL_RECEIVED, 0) ||
        finite(targets.ROAD_CLOSURE, 0) < 75 || finite(targets.ENROUTE_BEFORE_AMBULANCE, 0) < 85 ||
        finite(targets.ENROUTE_BEFORE_AMBULANCE, 0) >= 90 || finite(targets.AMBULANCE_AT_INCIDENT, 0) !== 100 ||
        finite(n.preAmbulanceMaximumLoad, 100) >= 90 || finite(n.ambulanceArrivalOverloadDeadlineSeconds, 99) > 0.75 ||
        n.ambulanceArrivalRequiredForSaturation !== true || n.overloadMayStartWhileMissionStateEnroute !== true ||
        n.fireAndPoliceMustEnterAlreadyOverloadedIncidentCell !== true || n.incidentHotspotDerivedFromCivilianAssociations !== true ||
        n.sameCellCompetitionRequiredForInitialOverload !== false || n.minimumBosEndpointsForInitialOverload !== 1 ||
        n.initialOverloadBosEndpointId !== "NET_AMBULANCE_01" || n.allThreeBosEndpointsEventuallyShareDynamicIncidentCellRequired !== true) {
      add(r, "networkErrors", "Early incident-load / ambulance-triggered overload contract is incomplete.");
    }
    if ((n.priorityValidStates || []).indexOf("ENROUTE") < 0 || (n.saturationEnabledStates || []).indexOf("ENROUTE") < 0) add(r, "networkErrors", "Mission 004 must permit overload and priority while the mission is still ENROUTE.");

    var requiredResponseMethods = ((plan.runtimeContract || {}).requiredResponseMethods || []);
    ["ambulanceAtScene", "getTrafficClearanceTrajectory", "getReturnManeuverStatus", "getReturnCorridorStatus", "isReturnCorridorReady"].forEach(function (name) {
      if (requiredResponseMethods.indexOf(name) < 0) add(r, "runtimeContractErrors", "Response runtime contract must require " + name + ".");
    });

    if (!plan.registryUpgrade || plan.registryUpgrade.id !== "MISSION_004" || plan.registryUpgrade.selectable !== true || plan.registryUpgrade.startable !== true) add(r, "registryErrors", "Mission 004 registry definition is invalid.");
    var serialized = JSON.stringify(plan);
    if (/servingTower(Id)?\s*[:=]/i.test(serialized) || /fixedServingTower/i.test(serialized) && plan.expectedCounts.fixedServingTowerDefinitions !== 0) add(r, "fixedTowerErrors", "Mission 004 contains a fixed serving-tower definition.");

    var towers = (associationPlan.towers || []).map(function (definition) {
      var source = (layout.mobileTowers || []).filter(function (tower) { return tower.id === definition.referenceId; })[0];
      return { id: definition.id, referenceId: definition.referenceId, available: definition.available, siteCalibrationOffset: definition.siteCalibrationOffset, coverageInfluences: definition.coverageInfluences || [], position: source && source.worldRect ? { x: source.worldRect.x, z: source.worldRect.z } : null };
    });
    var loads = {}; towers.forEach(function (tower) { loads[tower.id] = 38; });
    var serving = [];
    Object.keys(stage).forEach(function (vehicleId) {
      var ranked = radioModel.rankTowers(stage[vehicleId], towers, loads, associationPlan.selectionModel || {});
      if (ranked.length < 2) { add(r, "radioCalibrationErrors", vehicleId + " has no valid radio ranking."); return; }
      serving.push(ranked[0].towerId);
      if (ranked[0].score - ranked[1].score + 1e-9 < finite(n.minimumHandoverAdvantageAtStage, 1.2)) add(r, "radioCalibrationErrors", vehicleId + " does not meet the handover margin at its stage position.");
    });
    if (serving.length === 3 && !(serving[0] === serving[1] && serving[1] === serving[2])) add(r, "radioCalibrationErrors", "The three responders do not dynamically select the same incident cell at their final stage positions.");

    var counts = plan.expectedCounts || {};
    if (counts.missionStates !== 16 || counts.responseVehicles !== 3 || counts.bosEndpoints !== 3 || counts.newMissionCivilianEndpoints !== 8 || counts.registryMissionsAfterIntegration !== 4 || counts.totalNetworkEndpointsAfterIntegration !== 49) add(r, "expectedCountErrors", "Mission 004 expected counts are invalid.");
    return finish(r);
  }
  function logResult(r) { console.group(r.title); Object.keys(r).filter(function (k) { return /Errors$/.test(k); }).forEach(function (k) { console.log(k + ": " + r[k]); }); console[r.status === "PASSED" ? "log" : "error"]("STATUS: " + r.status); if (r.errors.length) console.error(r.errors); console.groupEnd(); }
  window.MissionBosMission004Validator = { validate: validate, logResult: logResult, copy: copy };
})();
