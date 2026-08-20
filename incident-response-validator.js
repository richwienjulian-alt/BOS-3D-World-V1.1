/* Mission BOS - Build 008R.7
   Validator adapter for deterministic incident access with declared traffic yielding.
   Requires MissionBosResponseVehicleValidator and MissionBosTrafficValidator.
   No Three.js dependency. No modules. No fetch.
*/
(function () {
  "use strict";

  function finiteNumber(value) {
    var number = Number(value);
    return isFinite(number) ? number : null;
  }

  function findById(items, id) {
    for (var i = 0; i < (items || []).length; i += 1) {
      if (items[i].id === id) return items[i];
    }
    return null;
  }

  function pairKey(responseVehicleId, civilVehicleId) {
    return String(responseVehicleId) + "::" + String(civilVehicleId);
  }

  function validate(layout, propsPlan, trafficPlan, pedestrianPlan, plan) {
    var base = window.MissionBosResponseVehicleValidator;
    var trafficValidator = window.MissionBosTrafficValidator;
    var extraErrors = [];
    var controlledConflicts = [];
    var uncontrolledBaseErrors = [];

    if (!base || typeof base.validate !== "function") {
      return createResult(null, [], [{ check: "Source dependency", data: { message: "Base response validator missing." } }], [], {}, {});
    }
    if (!trafficValidator || typeof trafficValidator.prepareRoute !== "function") {
      return createResult(null, [], [{ check: "Source dependency", data: { message: "Traffic validator missing." } }], [], {}, {});
    }

    var baseResult = base.validate(layout, propsPlan, trafficPlan, pedestrianPlan, plan);
    var control = plan && plan.trafficControl ? plan.trafficControl : {};
    var expectedPairs = Object.create(null);
    (control.expectedControlledConflictPairs || []).forEach(function (pair) {
      expectedPairs[pairKey(pair.responseVehicleId, pair.civilVehicleId)] = true;
    });

    (baseResult.errors || []).forEach(function (error) {
      if (error.check === "Response / civilian traffic swept path") {
        var data = error.data || {};
        var key = pairKey(data.responseVehicleId, data.civilVehicleId);
        if (expectedPairs[key]) {
          controlledConflicts.push(error);
          return;
        }
      }
      uncontrolledBaseErrors.push(error);
    });

    var buildings = layout && layout.buildings ? layout.buildings : [];
    var incident = plan && plan.incident ? plan.incident : null;
    var incidentBuilding = incident ? findById(buildings, incident.buildingId) : null;
    if (!incident || !incidentBuilding) {
      extraErrors.push({ check: "Incident reference", data: { buildingId: incident && incident.buildingId, issue: "incident building missing" } });
    } else {
      var rect = incidentBuilding.worldRect;
      var facade = incident.facadeAnchor || {};
      var smoke = incident.roofSmokeAnchor || {};
      var xMin = Number(rect.x) - Number(rect.width) / 2;
      var xMax = Number(rect.x) + Number(rect.width) / 2;
      var zMin = Number(rect.z) - Number(rect.depth) / 2;
      var zMax = Number(rect.z) + Number(rect.depth) / 2;
      var facadeX = finiteNumber(facade.x);
      var facadeY = finiteNumber(facade.y);
      var facadeZ = finiteNumber(facade.z);
      var smokeX = finiteNumber(smoke.x);
      var smokeY = finiteNumber(smoke.y);
      var smokeZ = finiteNumber(smoke.z);
      if (
        facadeX === null || facadeY === null || facadeZ === null ||
        facadeX < xMin - 0.05 || facadeX > xMax + 0.05 ||
        facadeZ < zMin - 0.05 || facadeZ > zMax + 0.05 ||
        facadeY <= 0 || facadeY >= Number(incidentBuilding.height)
      ) {
        extraErrors.push({ check: "Incident anchor", data: { anchor: "facadeAnchor", issue: "anchor outside incident building facade bounds" } });
      }
      if (
        smokeX === null || smokeY === null || smokeZ === null ||
        smokeX < xMin || smokeX > xMax || smokeZ < zMin || smokeZ > zMax ||
        smokeY < Number(incidentBuilding.height)
      ) {
        extraErrors.push({ check: "Incident anchor", data: { anchor: "roofSmokeAnchor", issue: "smoke anchor not above incident building" } });
      }
    }

    var trafficRoutesById = Object.create(null);
    (trafficPlan.routes || []).forEach(function (routeDefinition) {
      trafficRoutesById[routeDefinition.id] = trafficValidator.prepareRoute(routeDefinition);
    });
    var responseRoutesById = Object.create(null);
    (plan.routes || []).forEach(function (routeDefinition) {
      responseRoutesById[routeDefinition.id] = base.prepareOpenRoute(routeDefinition);
    });

    var yieldVehiclesSeen = Object.create(null);
    (control.yieldRequests || []).forEach(function (request) {
      var vehicle = findById(trafficPlan.vehicles, request.vehicleId);
      var route = trafficRoutesById[request.routeId];
      if (!vehicle || vehicle.routeId !== request.routeId || !route) {
        extraErrors.push({ check: "Yield reference", data: { vehicleId: request.vehicleId, routeId: request.routeId, issue: "vehicle or route reference invalid" } });
        return;
      }
      yieldVehiclesSeen[request.vehicleId] = true;
      var holdDistance = finiteNumber(request.holdDistance);
      if (holdDistance === null || holdDistance < 0 || holdDistance >= route.length) {
        extraErrors.push({ check: "Yield hold point", data: { vehicleId: request.vehicleId, issue: "hold distance outside route" } });
        return;
      }
      var holdPose = trafficValidator.sampleRoute(route, holdDistance);
      var holdPosition = request.holdPosition || {};
      if (
        Math.abs(holdPose.x - Number(holdPosition.x)) > 0.03 ||
        Math.abs(holdPose.z - Number(holdPosition.z)) > 0.03
      ) {
        extraErrors.push({ check: "Yield hold point", data: { vehicleId: request.vehicleId, issue: "stored hold position differs from route sample", sampled: holdPose, stored: holdPosition } });
      }

      var holdPolygon = base.rectangleCorners(
        holdPose,
        Number(vehicle.footprintLength),
        Number(vehicle.footprintWidth),
        Number(plan.simulation && plan.simulation.collisionSafetyMargin) || 0
      );
      (plan.vehicles || []).forEach(function (responseVehicle) {
        var responseRoute = responseRoutesById[responseVehicle.routeId];
        if (!responseRoute) return;
        for (var distance = 0; distance <= responseRoute.length + 1e-7; distance += 0.1) {
          var pose = base.sampleOpenRoute(responseRoute, Math.min(distance, responseRoute.length), false);
          var responsePolygon = base.rectangleCorners(
            pose,
            Number(responseVehicle.footprintLength),
            Number(responseVehicle.footprintWidth),
            Number(plan.simulation && plan.simulation.collisionSafetyMargin) || 0
          );
          if (base.polygonsOverlapSAT(holdPolygon, responsePolygon)) {
            extraErrors.push({ check: "Yield hold point / response corridor", data: { vehicleId: request.vehicleId, responseVehicleId: responseVehicle.id, pose: pose } });
            return;
          }
        }
      });
    });

    Object.keys(expectedPairs).forEach(function (key) {
      var found = controlledConflicts.some(function (error) {
        var data = error.data || {};
        return pairKey(data.responseVehicleId, data.civilVehicleId) === key;
      });
      if (!found) extraErrors.push({ check: "Controlled conflict expectation", data: { pair: key, issue: "declared conflict pair was not detected" } });
    });

    var expectedCounts = plan.expectedCounts || {};
    if (Number(expectedCounts.controlledCivilTrafficConflicts || 0) !== controlledConflicts.length) {
      extraErrors.push({ check: "Controlled conflict expectation", data: { expected: Number(expectedCounts.controlledCivilTrafficConflicts || 0), actual: controlledConflicts.length } });
    }
    if (Number(expectedCounts.yieldRequests || 0) !== (control.yieldRequests || []).length) {
      extraErrors.push({ check: "Expected counts", data: { key: "yieldRequests", expected: Number(expectedCounts.yieldRequests || 0), actual: (control.yieldRequests || []).length } });
    }
    if (Number(expectedCounts.incidentBuildings || 0) !== (incidentBuilding ? 1 : 0)) {
      extraErrors.push({ check: "Expected counts", data: { key: "incidentBuildings", expected: Number(expectedCounts.incidentBuildings || 0), actual: incidentBuilding ? 1 : 0 } });
    }

    return createResult(baseResult, controlledConflicts, uncontrolledBaseErrors, extraErrors, {
      yieldVehicles: Object.keys(yieldVehiclesSeen).length,
      incidentBuildingId: incident && incident.buildingId
    }, expectedCounts);
  }

  function createResult(baseResult, controlledConflicts, uncontrolledBaseErrors, extraErrors, metadata, expectedCounts) {
    var errors = (uncontrolledBaseErrors || []).concat(extraErrors || []);
    var counts = {
      uncontrolledBaseErrors: (uncontrolledBaseErrors || []).length,
      controlledCivilTrafficConflicts: (controlledConflicts || []).length,
      yieldReferenceErrors: errors.filter(function (e) { return e.check === "Yield reference"; }).length,
      yieldHoldPointErrors: errors.filter(function (e) { return e.check === "Yield hold point"; }).length,
      yieldHoldPointResponseCorridorErrors: errors.filter(function (e) { return e.check === "Yield hold point / response corridor"; }).length,
      incidentReferenceErrors: errors.filter(function (e) { return e.check === "Incident reference"; }).length,
      incidentAnchorErrors: errors.filter(function (e) { return e.check === "Incident anchor"; }).length,
      controlledConflictExpectationErrors: errors.filter(function (e) { return e.check === "Controlled conflict expectation"; }).length,
      expectedCountErrors: errors.filter(function (e) { return e.check === "Expected counts"; }).length,
      sourceDependencyErrors: errors.filter(function (e) { return e.check === "Source dependency"; }).length
    };
    var status = errors.length === 0 ? "PASSED" : "FAILED";
    var result = {
      title: "MISSION BOS INCIDENT RESPONSE VALIDATION",
      status: status,
      counts: counts,
      errors: errors,
      controlledConflicts: controlledConflicts || [],
      baseResult: baseResult || null,
      metadata: metadata || {},
      expectedCounts: expectedCounts || {},
      lines: []
    };
    result.lines = [
      result.title,
      "Uncontrolled base validation errors: " + counts.uncontrolledBaseErrors,
      "Controlled civilian traffic conflicts: " + counts.controlledCivilTrafficConflicts,
      "Yield vehicle reference errors: " + counts.yieldReferenceErrors,
      "Yield hold point errors: " + counts.yieldHoldPointErrors,
      "Yield hold point / response corridor errors: " + counts.yieldHoldPointResponseCorridorErrors,
      "Incident building reference errors: " + counts.incidentReferenceErrors,
      "Incident anchor errors: " + counts.incidentAnchorErrors,
      "Controlled conflict expectation errors: " + counts.controlledConflictExpectationErrors,
      "Expected count errors: " + counts.expectedCountErrors,
      "Source dependency errors: " + counts.sourceDependencyErrors,
      "STATUS: " + status
    ];
    return result;
  }

  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    result.lines.slice(1).forEach(function (line) { console[method](line); });
    if (result.controlledConflicts && result.controlledConflicts.length) {
      console.log("Declared traffic conflicts are controlled by deterministic yielding:", result.controlledConflicts.map(function (entry) { return entry.data; }));
    }
    if (result.errors.length) {
      result.errors.forEach(function (error) { console.error(error.check, error.data); });
    }
    console.groupEnd();
  }

  var base = window.MissionBosResponseVehicleValidator || {};
  window.MissionBosIncidentResponseValidator = {
    validate: validate,
    logResult: logResult,
    prepareOpenRoute: base.prepareOpenRoute,
    sampleOpenRoute: base.sampleOpenRoute,
    footprintPoints: base.footprintPoints,
    rectangleCorners: base.rectangleCorners,
    polygonsOverlapSAT: base.polygonsOverlapSAT,
    circleOrientedRectOverlap: base.circleOrientedRectOverlap,
    pointInRect: base.pointInRect
  };
})();
