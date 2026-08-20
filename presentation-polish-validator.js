/* Mission BOS - Build 011N.1
   Presentation polish and final visual feedback validator.
*/
(function () {
  "use strict";

  function copy(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function normalizeColor(value) { return String(value || "").trim().toLowerCase(); }
  function finite(value, fallback) { var n = Number(value); return isFinite(n) ? n : fallback; }
  function add(result, bucket, code, detail) {
    result[bucket] += 1;
    result.errors.push({ code: code, detail: detail == null ? null : copy(detail) });
  }
  function findById(list, id) {
    return (list || []).find(function (item) { return item && item.id === id; }) || null;
  }
  function runtimeStatus(runtime) {
    if (!runtime || typeof runtime.getSafetyStatus !== "function") return "FAILED";
    var safety = runtime.getSafetyStatus();
    return safety && safety.status ? safety.status : "FAILED";
  }
  function emptyResult() {
    return {
      title: "MISSION BOS BUILD 012M.4 PRESENTATION VALIDATION",
      sourceErrors: 0,
      preservedFeedbackErrors: 0,
      dashboardDomErrors: 0,
      dashboardStyleErrors: 0,
      bosColorPolicyErrors: 0,
      arenaAnchorErrors: 0,
      connectivityManifestErrors: 0,
      connectivitySafetyErrors: 0,
      unifiedConnectivityErrors: 0,
      registryErrors: 0,
      fixedServingTowerErrors: 0,
      automaticActionErrors: 0,
      automaticPriorityErrors: 0,
      status: "PASSED",
      errors: []
    };
  }

  function countFixedServingTowerDefinitions(value) {
    var count = 0;
    function walk(node, key) {
      if (!node || typeof node !== "object") return;
      Object.keys(node).forEach(function (name) {
        var child = node[name];
        var path = key ? key + "." + name : name;
        if ((name === "servingTowerId" || name === "fixedTowerId") && child) count += 1;
        if (child && typeof child === "object") walk(child, path);
      });
    }
    walk(value, "");
    return count;
  }

  function validate(options) {
    options = options || {};
    var result = emptyResult();
    var plan = options.plan || window.MISSION_BOS_PRESENTATION_POLISH_PLAN;
    var mission001Plan = options.mission001Plan || window.MISSION_BOS_MISSION_001_PLAN;
    var mission002Plan = options.mission002Plan || window.MISSION_BOS_MISSION_002_PLAN;
    var associationPlan = options.associationPlan || window.MISSION_BOS_NETWORK_ASSOCIATION_PLAN;
    var communicationPlan = options.communicationPlan || window.MISSION_BOS_TELEKOM_COMMUNICATION_PLAN;
    var networkRealismPlan = options.networkRealismPlan || window.MISSION_BOS_NETWORK_REALISM_PLAN;
    var doc = options.document || (typeof document !== "undefined" ? document : null);

    if (!plan || !mission001Plan || !mission002Plan || !associationPlan || !communicationPlan || !networkRealismPlan) {
      add(result, "sourceErrors", "SOURCE_MISSING", "One or more Build 011N.1 source plans are missing.");
    }

    var returning = findById(mission001Plan && mission001Plan.states, "RETURNING");
    if (!returning || returning.fireVisible !== false || returning.smokeVisible !== false) {
      add(result, "preservedFeedbackErrors", "MISSION_001_RETURNING_VISUALS", returning || null);
    }

    var visualStyle = communicationPlan && communicationPlan.visualStyle ? communicationPlan.visualStyle : {};
    var expectedMagenta = normalizeColor(plan && plan.bosVisualPersistence && plan.bosVisualPersistence.activeColor);
    if (normalizeColor(visualStyle.priorityColor) !== expectedMagenta || normalizeColor(visualStyle.stableColor) !== expectedMagenta) {
      add(result, "bosColorPolicyErrors", "DASHBOARD_BRAND_COLOR_CHANGED", visualStyle);
    }
    var bosWorld = networkRealismPlan && networkRealismPlan.visualLanguage ? networkRealismPlan.visualLanguage.bos || {} : {};
    if (normalizeColor(bosWorld.color) !== "#0066cc" || normalizeColor(bosWorld.highlightColor) !== "#4db3ff") {
      add(result, "bosColorPolicyErrors", "WORLD_BOS_COLOR_NOT_BLUE", bosWorld);
    }
    var automaticPolicy = networkRealismPlan && networkRealismPlan.automaticBOSPriority || {};
    if (Number(automaticPolicy.activationDelaySeconds) !== 0.6 || Number(automaticPolicy.releaseThreshold) !== 85 ||
        Number(automaticPolicy.releaseDelaySeconds) !== 1.5 || networkRealismPlan.policy.manualBOSActivationAllowed !== false) {
      add(result, "automaticPriorityErrors", "AUTOMATIC_PRIORITY_POLICY", automaticPolicy);
    }

    if (doc && plan && plan.dashboardPolish) {
      (plan.dashboardPolish.requiredElementIds || []).forEach(function (id) {
        if (!doc.getElementById(id)) add(result, "dashboardDomErrors", "REQUIRED_ELEMENT_MISSING", id);
      });
      var title = doc.querySelector("#info-panel .version");
      var titleText = title ? String(title.textContent || "").trim() : "";
      if (!title || (titleText !== plan.dashboardPolish.buildLabel && titleText.indexOf("Build 012M.4 ·") !== 0)) {
        add(result, "dashboardDomErrors", "BUILD_LABEL", title ? title.textContent : null);
      }
    }

    if (doc && typeof getComputedStyle === "function" && plan && plan.dashboardPolish) {
      var rootStyle = getComputedStyle(doc.documentElement);
      Object.keys(plan.dashboardPolish.cssTokens || {}).forEach(function (token) {
        var expected = normalizeColor(plan.dashboardPolish.cssTokens[token]);
        var actual = normalizeColor(rootStyle.getPropertyValue(token));
        if (actual !== expected) add(result, "dashboardStyleErrors", "CSS_TOKEN_" + token, { expected: expected, actual: actual });
      });
      var panel = doc.getElementById("info-panel");
      if (panel) {
        var panelStyle = getComputedStyle(panel);
        var width = parseFloat(panelStyle.width);
        if (window.innerWidth > 980 && Math.abs(width - finite(plan.dashboardPolish.widthPx, 390)) > 1.1) {
          add(result, "dashboardStyleErrors", "DASHBOARD_WIDTH", width);
        }
        if (panel.scrollWidth > panel.clientWidth + 1) {
          add(result, "dashboardStyleErrors", "HORIZONTAL_OVERFLOW", { scrollWidth: panel.scrollWidth, clientWidth: panel.clientWidth });
        }
        var panelBackground = normalizeColor(panelStyle.backgroundColor);
        if (panelBackground === "rgb(11, 23, 38)" || panelBackground === "#0b1726") {
          add(result, "dashboardStyleErrors", "DARK_DASHBOARD_BACKGROUND_REMAINS", panelBackground);
        }
      }
      ["stable", "priority", "bos-active"].forEach(function (className) {
        var probe = doc.createElement("div");
        probe.className = "communication-channel-fill bos-fill " + className;
        probe.style.position = "absolute";
        probe.style.left = "-9999px";
        doc.body.appendChild(probe);
        var background = normalizeColor(getComputedStyle(probe).backgroundColor);
        var backgroundImage = normalizeColor(getComputedStyle(probe).backgroundImage);
        doc.body.removeChild(probe);
        if (background.indexOf("226, 0, 116") < 0 && backgroundImage.indexOf("226, 0, 116") < 0) {
          add(result, "bosColorPolicyErrors", "DASHBOARD_BOS_FILL_NOT_MAGENTA_" + className.toUpperCase(), { background: background, backgroundImage: backgroundImage });
        }
      });
    }

    var ambulanceConnectivity = options.ambulanceConnectivityRuntime;
    var arenaConnectivity = options.arenaConnectivityRuntime;
    var unifiedConnectivity = options.unifiedBosConnectivityRuntime;
    var ambulanceManifest = ambulanceConnectivity && ambulanceConnectivity.getManifest ? ambulanceConnectivity.getManifest() : null;
    var arenaManifest = arenaConnectivity && arenaConnectivity.getManifest ? arenaConnectivity.getManifest() : null;
    if (!ambulanceManifest || ambulanceManifest.status !== "PASSED") {
      add(result, "connectivityManifestErrors", "AMBULANCE_CONNECTIVITY_MANIFEST", ambulanceManifest);
    }
    if (!arenaManifest || arenaManifest.status !== "PASSED" || Number(arenaManifest.endpointCount) !== 12 ||
        !arenaManifest.actual || Number(arenaManifest.actual.dashedLines) !== 0) {
      add(result, "connectivityManifestErrors", "ARENA_CONNECTIVITY_MANIFEST", arenaManifest);
    }
    if (!arenaManifest || arenaManifest.towerAnchorMode !== "ACTUAL_UPPER_BEACON" || Number(arenaManifest.towerBeaconYOffset) !== 0.35) {
      add(result, "arenaAnchorErrors", "ARENA_TOWER_ANCHOR_POLICY", arenaManifest);
    }
    if (arenaConnectivity && typeof arenaConnectivity.getConnectionSnapshot === "function") {
      var snapshot = arenaConnectivity.getConnectionSnapshot() || [];
      if (snapshot.length !== 12) add(result, "arenaAnchorErrors", "ARENA_CONNECTION_SNAPSHOT_COUNT", snapshot.length);
      snapshot.forEach(function (entry) {
        if (!entry || !entry.target || !entry.servingTowerId) {
          add(result, "arenaAnchorErrors", "ARENA_CONNECTION_TARGET", entry || null);
        }
      });
    } else {
      add(result, "arenaAnchorErrors", "ARENA_CONNECTION_SNAPSHOT_API_MISSING", null);
    }

    if (runtimeStatus(ambulanceConnectivity) !== "PASSED") {
      add(result, "connectivitySafetyErrors", "AMBULANCE_CONNECTIVITY_SAFETY", runtimeStatus(ambulanceConnectivity));
    }
    if (runtimeStatus(arenaConnectivity) !== "PASSED") {
      add(result, "connectivitySafetyErrors", "ARENA_CONNECTIVITY_SAFETY", runtimeStatus(arenaConnectivity));
    }

    var unifiedManifest = unifiedConnectivity && unifiedConnectivity.getManifest ? unifiedConnectivity.getManifest() : null;
    if (!unifiedManifest || unifiedManifest.status !== "PASSED" ||
        Number(unifiedManifest.endpoints) !== 4 || Number(unifiedManifest.vehiclePaths) !== 4 ||
        Number(unifiedManifest.totalVehiclePackets) !== 16 || Number(unifiedManifest.alwaysOnTopPaths) !== 0 ||
        Number(unifiedManifest.utilityPriorityPaths || 0) !== 0 ||
        runtimeStatus(unifiedConnectivity) !== "PASSED") {
      add(result, "unifiedConnectivityErrors", "UNIFIED_OPERATIONAL_CONNECTIVITY", unifiedManifest);
    }

    var registry = options.missionRegistryRuntime;
    var registryManifest = registry && registry.getManifest ? registry.getManifest() : null;
    if (!registryManifest || registryManifest.status !== "PASSED" ||
        Number(registryManifest.registeredRuntimes) !== 3 || Number(registryManifest.unavailableMissions) !== 0 ||
        registryManifest.registrationFinalized !== true) {
      add(result, "registryErrors", "THREE_MISSION_REGISTRY", registryManifest);
    }

    var fixedCount = countFixedServingTowerDefinitions(mission002Plan) + countFixedServingTowerDefinitions(associationPlan);
    if (fixedCount !== 0) {
      result.fixedServingTowerErrors = fixedCount;
      result.errors.push({ code: "FIXED_SERVING_TOWER", detail: fixedCount });
    }

    if (options.automaticMissionStarts && Number(options.automaticMissionStarts) !== 0) {
      add(result, "automaticActionErrors", "AUTOMATIC_MISSION_START", options.automaticMissionStarts);
    }
    var automaticPriorityRuntime = options.automaticBOSPriorityRuntime;
    if (!automaticPriorityRuntime || runtimeStatus(automaticPriorityRuntime) !== "PASSED") {
      add(result, "automaticPriorityErrors", "AUTOMATIC_PRIORITY_RUNTIME", runtimeStatus(automaticPriorityRuntime));
    }

    if (result.errors.length) result.status = "FAILED";
    return result;
  }

  function logResult(result) {
    var method = result && result.status === "PASSED" ? "log" : "error";
    console.group(result.title);
    console[method]("Source errors: " + result.sourceErrors);
    console[method]("Preserved feedback errors: " + result.preservedFeedbackErrors);
    console[method]("Dashboard DOM errors: " + result.dashboardDomErrors);
    console[method]("Dashboard style errors: " + result.dashboardStyleErrors);
    console[method]("BOS color policy errors: " + result.bosColorPolicyErrors);
    console[method]("Arena anchor errors: " + result.arenaAnchorErrors);
    console[method]("Connectivity manifest errors: " + result.connectivityManifestErrors);
    console[method]("Connectivity safety errors: " + result.connectivitySafetyErrors);
    console[method]("Unified connectivity errors: " + result.unifiedConnectivityErrors);
    console[method]("Registry errors: " + result.registryErrors);
    console[method]("Fixed serving-tower errors: " + result.fixedServingTowerErrors);
    console[method]("Automatic action errors: " + result.automaticActionErrors);
    console[method]("Automatic priority errors: " + result.automaticPriorityErrors);
    console[method]("STATUS: " + result.status);
    if (result.errors.length) console.error(result.errors);
    console.groupEnd();
  }

  window.MissionBosPresentationPolishValidator = {
    validate: validate,
    logResult: logResult,
    copy: copy
  };
})();
