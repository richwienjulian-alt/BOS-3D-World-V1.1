/* Mission BOS - Build 008R.3
   Static props validator.
   No modules. No fetch. No automatic correction.
   Exposes: window.MissionBosStaticPropsValidator
*/

(function () {
  "use strict";

  var EPSILON = 1e-9;

  function getId(item) {
    return item && (item.id || item.name || item.type || "UNKNOWN");
  }

  function toRect(item) {
    if (!item || !item.worldRect) {
      throw new Error("Invalid item without worldRect: " + getId(item));
    }

    var r = item.worldRect;
    var halfW = r.width / 2;
    var halfD = r.depth / 2;

    return {
      id: getId(item),
      source: item,
      x: r.x,
      z: r.z,
      width: r.width,
      depth: r.depth,
      minX: r.x - halfW,
      maxX: r.x + halfW,
      minZ: r.z - halfD,
      maxZ: r.z + halfD
    };
  }

  function hasAreaOverlap(a, b) {
    return (
      a.minX < b.maxX - EPSILON &&
      a.maxX > b.minX + EPSILON &&
      a.minZ < b.maxZ - EPSILON &&
      a.maxZ > b.minZ + EPSILON
    );
  }

  function intersectionRect(a, b) {
    var minX = Math.max(a.minX, b.minX);
    var maxX = Math.min(a.maxX, b.maxX);
    var minZ = Math.max(a.minZ, b.minZ);
    var maxZ = Math.min(a.maxZ, b.maxZ);

    if (maxX <= minX || maxZ <= minZ) return null;

    return {
      x: (minX + maxX) / 2,
      z: (minZ + maxZ) / 2,
      width: maxX - minX,
      depth: maxZ - minZ,
      minX: minX,
      maxX: maxX,
      minZ: minZ,
      maxZ: maxZ
    };
  }

  function compareCollections(check, groupA, groupB, sameCollection) {
    var errors = [];

    for (var i = 0; i < groupA.length; i += 1) {
      var a = toRect(groupA[i]);

      for (var j = 0; j < groupB.length; j += 1) {
        if (sameCollection && j <= i) continue;

        var b = toRect(groupB[j]);
        if (!hasAreaOverlap(a, b)) continue;

        errors.push({
          check: check,
          a: a.id,
          b: b.id,
          intersection: intersectionRect(a, b)
        });
      }
    }

    return errors;
  }

  function filterByType(props, allowedTypes) {
    return props.filter(function (prop) {
      return allowedTypes.indexOf(prop.type) !== -1;
    });
  }

  function validate(layout, plan) {
    if (!layout) throw new Error("MISSION_BOS_RECOVERY_LAYOUT is required.");
    if (!plan) throw new Error("MISSION_BOS_STATIC_PROPS is required.");

    var props = plan.props || [];
    var buildingSigns = plan.buildingSigns || [];
    var roads = layout.roadSurfaces || [];
    var buildings = layout.buildings || [];
    var towers = layout.mobileTowers || [];
    var technologyPlots = layout.technologyPlots || [];
    var parkingAreas = layout.parkingAreas || [];
    var corridors = layout.noBuildCorridors || [];
    var pavedAreas = layout.pavedAreas || [];

    var allErrors = [];
    var checks = Object.create(null);

    function addCheck(name, errors) {
      checks[name] = errors;
      Array.prototype.push.apply(allErrors, errors);
    }

    addCheck("Prop / road", compareCollections("Prop / road", props, roads, false));
    addCheck("Prop / building", compareCollections("Prop / building", props, buildings, false));
    addCheck("Prop / tower", compareCollections("Prop / tower", props, towers, false));
    addCheck("Prop / technology plot", compareCollections("Prop / technology plot", props, technologyPlots, false));
    addCheck("Prop / parking", compareCollections("Prop / parking", props, parkingAreas, false));

    var corridorSensitive = filterByType(props, ["tree", "shrub", "bench"]);
    addCheck(
      "Tree/Shrub/Bench / corridor",
      compareCollections("Tree/Shrub/Bench / corridor", corridorSensitive, corridors, false)
    );

    var pavedSensitive = filterByType(props, ["tree", "shrub"]);
    addCheck(
      "Tree/Shrub / paved",
      compareCollections("Tree/Shrub / paved", pavedSensitive, pavedAreas, false)
    );

    addCheck("Prop / prop", compareCollections("Prop / prop", props, props, true));

    var buildingIds = Object.create(null);
    buildings.forEach(function (building) {
      buildingIds[building.id] = true;
    });

    var signReferenceErrors = [];
    buildingSigns.forEach(function (sign) {
      if (!sign.buildingId || !buildingIds[sign.buildingId]) {
        signReferenceErrors.push({
          check: "Building sign reference",
          a: sign.id || "UNKNOWN_SIGN",
          b: sign.buildingId || "MISSING_BUILDING_ID",
          intersection: null
        });
      }
    });
    addCheck("Building sign reference", signReferenceErrors);

    var countsByType = Object.create(null);
    props.forEach(function (prop) {
      countsByType[prop.type] = (countsByType[prop.type] || 0) + 1;
    });

    var expected = plan.expectedCounts || {};
    var countErrors = [];

    if (typeof expected.totalProps === "number" && expected.totalProps !== props.length) {
      countErrors.push({ check: "Expected counts", a: "totalProps", b: String(props.length), intersection: null });
    }

    Object.keys(expected).forEach(function (key) {
      if (key === "totalProps" || key === "buildingSigns") return;
      if (typeof expected[key] !== "number") return;
      if ((countsByType[key] || 0) !== expected[key]) {
        countErrors.push({ check: "Expected counts", a: key, b: String(countsByType[key] || 0), intersection: null });
      }
    });

    if (typeof expected.buildingSigns === "number" && expected.buildingSigns !== buildingSigns.length) {
      countErrors.push({ check: "Expected counts", a: "buildingSigns", b: String(buildingSigns.length), intersection: null });
    }

    addCheck("Expected counts", countErrors);

    var phaseErrors = [];
    if (plan.sourceLayoutPhase !== layout.phase) {
      phaseErrors.push({
        check: "Source layout phase",
        a: String(plan.sourceLayoutPhase),
        b: String(layout.phase),
        intersection: null
      });
    }
    addCheck("Source layout phase", phaseErrors);

    var counts = {
      propRoad: checks["Prop / road"].length,
      propBuilding: checks["Prop / building"].length,
      propTower: checks["Prop / tower"].length,
      propTechnologyPlot: checks["Prop / technology plot"].length,
      propParking: checks["Prop / parking"].length,
      treeShrubBenchCorridor: checks["Tree/Shrub/Bench / corridor"].length,
      treeShrubPaved: checks["Tree/Shrub / paved"].length,
      propProp: checks["Prop / prop"].length,
      buildingSignReference: checks["Building sign reference"].length,
      expectedCounts: checks["Expected counts"].length,
      sourceLayoutPhase: checks["Source layout phase"].length
    };

    var result = {
      title: "MISSION BOS STATIC PROPS VALIDATION",
      status: allErrors.length === 0 ? "PASSED" : "FAILED",
      counts: counts,
      countsByType: countsByType,
      checks: checks,
      errors: allErrors,
      metadata: {
        totalProps: props.length,
        buildingSigns: buildingSigns.length,
        runtimeRandomization: plan.runtimeRandomization === true
      },
      lines: []
    };

    result.lines = [
      result.title,
      "Prop / road overlaps: " + counts.propRoad,
      "Prop / building overlaps: " + counts.propBuilding,
      "Prop / tower overlaps: " + counts.propTower,
      "Prop / technology plot overlaps: " + counts.propTechnologyPlot,
      "Prop / parking overlaps: " + counts.propParking,
      "Tree/Shrub/Bench / corridor overlaps: " + counts.treeShrubBenchCorridor,
      "Tree/Shrub / paved overlaps: " + counts.treeShrubPaved,
      "Prop / prop overlaps: " + counts.propProp,
      "Building sign reference errors: " + counts.buildingSignReference,
      "Expected count errors: " + counts.expectedCounts,
      "Source layout phase errors: " + counts.sourceLayoutPhase,
      "STATUS: " + result.status
    ];

    return result;
  }

  function logResult(result) {
    var method = result.status === "PASSED" ? "log" : "error";

    console.group(result.title);
    result.lines.slice(1).forEach(function (line) {
      console[method](line);
    });

    if (result.errors.length > 0) {
      console.group("Affected objects");
      result.errors.forEach(function (error) {
        console.error(error.check + ": " + error.a + " ↔ " + error.b, error);
      });
      console.groupEnd();
    }

    console.groupEnd();
  }

  window.MissionBosStaticPropsValidator = {
    validate: validate,
    logResult: logResult,
    toRect: toRect,
    hasAreaOverlap: hasAreaOverlap,
    intersectionRect: intersectionRect
  };
})();
