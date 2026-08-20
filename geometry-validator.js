/* Mission BOS - Build 008R.1
   Deterministic Geometry Proof - Validator

   No modules. No fetch. No automatic correction.
   Exposes: window.MissionBosGeometryValidator
*/

(function () {
  "use strict";

  var EPSILON = 1e-9;

  function getId(item) {
    return item && (item.id || item.name || item.type || "UNKNOWN");
  }

  function toRect(item) {
    if (!item || !item.worldRect) {
      throw new Error("Invalid geometry item without worldRect: " + getId(item));
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

  function compareCollections(label, groupA, groupB, options) {
    var errors = [];
    var sameCollection = groupA === groupB;
    var skipSameId = options && options.skipSameId;

    for (var i = 0; i < groupA.length; i++) {
      var a = toRect(groupA[i]);

      for (var j = 0; j < groupB.length; j++) {
        if (sameCollection && j <= i) continue;

        var b = toRect(groupB[j]);
        if (skipSameId && a.id === b.id) continue;

        if (hasAreaOverlap(a, b)) {
          errors.push({
            check: label,
            a: a.id,
            b: b.id,
            aRect: a,
            bRect: b,
            intersection: intersectionRect(a, b)
          });
        }
      }
    }

    return errors;
  }

  function validateLayout(layout) {
    if (!layout) {
      throw new Error("MISSION_BOS_RECOVERY_LAYOUT is missing.");
    }

    var buildings = layout.buildings || [];
    var noBuildCorridors = layout.noBuildCorridors || [];
    var towers = layout.mobileTowers || [];
    var roads = layout.roadSurfaces || [];
    var greenAreas = layout.greenAreas || [];
    var parkingAreas = layout.parkingAreas || [];
    var pavedAreas = layout.pavedAreas || [];

    var checks = [
      {
        key: "buildingCorridor",
        label: "Building / corridor overlaps",
        errors: compareCollections("Building / corridor overlaps", buildings, noBuildCorridors)
      },
      {
        key: "buildingBuilding",
        label: "Building / building overlaps",
        errors: compareCollections("Building / building overlaps", buildings, buildings)
      },
      {
        key: "towerCorridor",
        label: "Tower / corridor overlaps",
        errors: compareCollections("Tower / corridor overlaps", towers, noBuildCorridors)
      },
      {
        key: "towerBuilding",
        label: "Tower / building overlaps",
        errors: compareCollections("Tower / building overlaps", towers, buildings)
      },
      {
        key: "greenRoad",
        label: "Green / road overlaps",
        errors: compareCollections("Green / road overlaps", greenAreas, roads)
      },
      {
        key: "parkingRoad",
        label: "Parking / road overlaps",
        errors: compareCollections("Parking / road overlaps", parkingAreas, roads)
      },
      {
        key: "pavedRoad",
        label: "Paved / road overlaps",
        errors: compareCollections("Paved / road overlaps", pavedAreas, roads)
      }
    ];

    var allErrors = [];
    var counts = {};

    checks.forEach(function (check) {
      counts[check.key] = check.errors.length;
      allErrors = allErrors.concat(check.errors);
    });

    var result = {
      title: "MISSION BOS GEOMETRY VALIDATION",
      status: allErrors.length === 0 ? "PASSED" : "FAILED",
      counts: counts,
      checks: checks,
      errors: allErrors,
      metadata: {
        buildings: buildings.length,
        mobileTowers: towers.length,
        noBuildCorridors: noBuildCorridors.length,
        roadSurfaces: roads.length,
        greenAreas: greenAreas.length,
        parkingAreas: parkingAreas.length,
        pavedAreas: pavedAreas.length,
        touchingEdgesAllowed: true
      },
      lines: []
    };

    result.lines = [
      result.title,
      "Building / corridor overlaps: " + counts.buildingCorridor,
      "Building / building overlaps: " + counts.buildingBuilding,
      "Tower / corridor overlaps: " + counts.towerCorridor,
      "Tower / building overlaps: " + counts.towerBuilding,
      "Green / road overlaps: " + counts.greenRoad,
      "Parking / road overlaps: " + counts.parkingRoad,
      "Paved / road overlaps: " + counts.pavedRoad,
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

  window.MissionBosGeometryValidator = {
    validate: validateLayout,
    logResult: logResult,
    toRect: toRect,
    hasAreaOverlap: hasAreaOverlap,
    intersectionRect: intersectionRect
  };
})();
