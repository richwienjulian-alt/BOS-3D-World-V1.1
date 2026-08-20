/* Mission BOS - Build 013M.19
   Additive pointer/touch camera controller. Mouse/keyboard handlers remain owned by app.js.
*/
(function (root) {
  "use strict";

  function finite(value, fallback) {
    value = Number(value);
    return Number.isFinite(value) ? value : fallback;
  }

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function distance(a, b) {
    if (!a || !b) return 0;
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function createFailedRuntime(message) {
    return {
      update: function () {},
      reset: function () { return false; },
      getManifest: function () { return { status: "FAILED", message: message }; },
      getSafetyStatus: function () { return { status: "FAILED", errors: [message] }; },
      getGestureState: function () { return "FAILED"; },
      dispose: function () {}
    };
  }

  function create(options) {
    options = options || {};
    var plan = options.plan;
    var validation = options.validation;
    var canvas = options.canvas;
    var cameraAdapter = options.cameraAdapter;
    var inspectionRuntime = options.inspectionRuntime || null;
    var controls = options.controls || {};

    if (!plan || !validation || validation.status !== "PASSED" || !canvas || !cameraAdapter ||
        typeof cameraAdapter.panGround !== "function" || typeof cameraAdapter.setFov !== "function" ||
        typeof cameraAdapter.getFov !== "function" || typeof cameraAdapter.goHome !== "function" ||
        typeof cameraAdapter.rotateYaw !== "function" || typeof cameraAdapter.releasePresenterCamera !== "function") {
      return createFailedRuntime("Touch camera dependencies are incomplete.");
    }

    var allowedPointerTypes = (plan.pointerTypes || []).slice();
    var pointers = Object.create(null);
    var pointerCount = 0;
    var gestureMode = "IDLE";
    var primaryPointerId = null;
    var singleGesture = null;
    var pinchStartDistance = 0;
    var pinchStartFov = finite(cameraAdapter.getFov(), 56);
    var pinchOccurred = false;
    var disposed = false;
    var safety = {
      status: "PASSED",
      pointerCancelCount: 0,
      tapCount: 0,
      panCount: 0,
      pinchCount: 0,
      dashboardCommandCount: 0,
      rejectedMousePointerCount: 0,
      errors: []
    };
    var listeners = [];

    function isAllowedPointer(event) {
      return event && allowedPointerTypes.indexOf(String(event.pointerType || "")) >= 0;
    }

    function addListener(target, type, handler, optionsValue) {
      if (!target || typeof target.addEventListener !== "function") return;
      target.addEventListener(type, handler, optionsValue);
      listeners.push({ target: target, type: type, handler: handler, options: optionsValue });
    }

    function releasePresenter(reason) {
      cameraAdapter.releasePresenterCamera(reason || plan.presenter.manualInputReason);
    }

    function updatePointer(event) {
      var record = pointers[event.pointerId];
      if (!record) return null;
      record.previousX = record.x;
      record.previousY = record.y;
      record.x = finite(event.clientX, record.x);
      record.y = finite(event.clientY, record.y);
      record.totalDistance = Math.max(record.totalDistance, Math.hypot(record.x - record.startX, record.y - record.startY));
      return record;
    }

    function getPointerRecords() {
      return Object.keys(pointers).map(function (key) { return pointers[key]; });
    }

    function beginSingle(record, tapBlocked) {
      gestureMode = "SINGLE";
      primaryPointerId = record.id;
      singleGesture = {
        id: record.id,
        startX: record.x,
        startY: record.y,
        startTime: record.startTime,
        lastX: record.x,
        lastY: record.y,
        tapBlocked: tapBlocked === true
      };
    }

    function beginPinch() {
      var records = getPointerRecords();
      if (records.length < 2) return;
      gestureMode = "PINCH";
      primaryPointerId = null;
      singleGesture = null;
      pinchOccurred = true;
      pinchStartDistance = Math.max(1, distance(records[0], records[1]));
      pinchStartFov = finite(cameraAdapter.getFov(), 56);
      releasePresenter(plan.presenter.manualInputReason);
      cameraAdapter.stopVelocity && cameraAdapter.stopVelocity();
    }

    function onPointerDown(event) {
      if (!isAllowedPointer(event)) {
        if (event && event.pointerType === "mouse") safety.rejectedMousePointerCount += 1;
        return;
      }
      var now = finite(event.timeStamp, Date.now());
      var record = {
        id: event.pointerId,
        x: finite(event.clientX, 0),
        y: finite(event.clientY, 0),
        previousX: finite(event.clientX, 0),
        previousY: finite(event.clientY, 0),
        startX: finite(event.clientX, 0),
        startY: finite(event.clientY, 0),
        startTime: now,
        totalDistance: 0
      };
      if (!pointers[event.pointerId]) pointerCount += 1;
      pointers[event.pointerId] = record;
      if (typeof canvas.setPointerCapture === "function") {
        try { canvas.setPointerCapture(event.pointerId); } catch (error) {}
      }
      if (pointerCount === 1) {
        pinchOccurred = false;
        beginSingle(record, false);
      } else if (pointerCount === 2) {
        beginPinch();
      }
      if (typeof event.preventDefault === "function") event.preventDefault();
    }

    function onPointerMove(event) {
      if (!isAllowedPointer(event) || !pointers[event.pointerId]) return;
      var record = updatePointer(event);
      if (pointerCount >= 2) {
        if (gestureMode !== "PINCH") beginPinch();
        var records = getPointerRecords();
        if (records.length >= 2) {
          var currentDistance = Math.max(1, distance(records[0], records[1]));
          var distanceDelta = currentDistance - pinchStartDistance;
          var nextFov = pinchStartFov - distanceDelta * finite(plan.gesture.pinchDegreesPerCssPixel, 0.08);
          cameraAdapter.setFov(nextFov, plan.presenter.manualInputReason);
          safety.pinchCount += 1;
        }
        if (typeof event.preventDefault === "function") event.preventDefault();
        return;
      }

      if (pointerCount === 1 && singleGesture && record.id === singleGesture.id) {
        var total = Math.hypot(record.x - singleGesture.startX, record.y - singleGesture.startY);
        if (gestureMode === "SINGLE" && total > finite(plan.gesture.tapThresholdCssPx, 8)) {
          gestureMode = "PAN";
          singleGesture.tapBlocked = true;
          releasePresenter(plan.presenter.manualInputReason);
          cameraAdapter.stopVelocity && cameraAdapter.stopVelocity();
        }
        if (gestureMode === "PAN") {
          var deltaX = record.x - singleGesture.lastX;
          var deltaY = record.y - singleGesture.lastY;
          if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
            var scale = finite(plan.gesture.panMetersPerCssPixel, 0.04);
            // Grab/map semantics: moving the map right moves the camera left; moving it up moves the camera backward.
            cameraAdapter.panGround(deltaY * scale, -deltaX * scale, plan.presenter.manualInputReason);
            safety.panCount += 1;
          }
          singleGesture.lastX = record.x;
          singleGesture.lastY = record.y;
        }
      }
      if (typeof event.preventDefault === "function") event.preventDefault();
    }

    function attemptTap(record, event) {
      if (!record || !singleGesture || singleGesture.tapBlocked || pinchOccurred) return false;
      var duration = Math.max(0, finite(event.timeStamp, Date.now()) - finite(singleGesture.startTime, 0));
      var movement = Math.hypot(record.x - singleGesture.startX, record.y - singleGesture.startY);
      if (movement > finite(plan.gesture.tapThresholdCssPx, 8) || duration > finite(plan.gesture.tapMaximumDurationMs, 350)) return false;
      if (!inspectionRuntime || typeof inspectionRuntime.selectAtClientPoint !== "function") return false;
      var rect = typeof canvas.getBoundingClientRect === "function" ? canvas.getBoundingClientRect() : null;
      var selected = inspectionRuntime.selectAtClientPoint(record.x, record.y, rect);
      safety.tapCount += 1;
      return selected === true;
    }

    function finishPointer(event, cancelled) {
      if (!isAllowedPointer(event) || !pointers[event.pointerId]) return;
      var record = updatePointer(event) || pointers[event.pointerId];
      var wasOnlyPointer = pointerCount === 1;
      if (!cancelled && wasOnlyPointer && gestureMode === "SINGLE") attemptTap(record, event);
      delete pointers[event.pointerId];
      pointerCount = Math.max(0, pointerCount - 1);
      if (typeof canvas.releasePointerCapture === "function") {
        try { canvas.releasePointerCapture(event.pointerId); } catch (error) {}
      }
      if (cancelled) safety.pointerCancelCount += 1;

      if (pointerCount === 1) {
        var remaining = getPointerRecords()[0];
        remaining.startX = remaining.x;
        remaining.startY = remaining.y;
        remaining.startTime = finite(event.timeStamp, Date.now());
        beginSingle(remaining, true);
      } else if (pointerCount === 0) {
        gestureMode = "IDLE";
        primaryPointerId = null;
        singleGesture = null;
        pinchOccurred = false;
      }
      if (typeof event.preventDefault === "function") event.preventDefault();
    }

    function bindDashboardControl(element, command, commandOwnsPresenterRelease) {
      if (!element) return;
      addListener(element, "click", function (event) {
        if (commandOwnsPresenterRelease !== true) releasePresenter(plan.presenter.dashboardManualInputReason);
        cameraAdapter.stopVelocity && cameraAdapter.stopVelocity();
        command();
        safety.dashboardCommandCount += 1;
        if (event && typeof event.preventDefault === "function") event.preventDefault();
      });
    }

    addListener(canvas, "pointerdown", onPointerDown, { passive: false });
    addListener(canvas, "pointermove", onPointerMove, { passive: false });
    addListener(canvas, "pointerup", function (event) { finishPointer(event, false); }, { passive: false });
    addListener(canvas, "pointercancel", function (event) { finishPointer(event, true); }, { passive: false });
    addListener(canvas, "lostpointercapture", function (event) {
      if (isAllowedPointer(event) && pointers[event.pointerId]) finishPointer(event, true);
    }, { passive: false });

    var step = finite(plan.dashboard.panStepMeters, 2);
    var zoomStep = finite(plan.dashboard.zoomStepDegrees, 4);
    var rotateStepRadians = finite(plan.dashboard.rotateStepDegrees, 15) * Math.PI / 180;
    bindDashboardControl(controls.forward, function () { cameraAdapter.panGround(step, 0, plan.presenter.dashboardManualInputReason); });
    bindDashboardControl(controls.backward, function () { cameraAdapter.panGround(-step, 0, plan.presenter.dashboardManualInputReason); });
    bindDashboardControl(controls.left, function () { cameraAdapter.panGround(0, -step, plan.presenter.dashboardManualInputReason); });
    bindDashboardControl(controls.right, function () { cameraAdapter.panGround(0, step, plan.presenter.dashboardManualInputReason); });
    bindDashboardControl(controls.rotateLeft, function () { cameraAdapter.rotateYaw(rotateStepRadians, plan.presenter.dashboardManualInputReason); }, true);
    bindDashboardControl(controls.rotateRight, function () { cameraAdapter.rotateYaw(-rotateStepRadians, plan.presenter.dashboardManualInputReason); }, true);
    bindDashboardControl(controls.zoomOut, function () { cameraAdapter.setFov(cameraAdapter.getFov() + zoomStep, plan.presenter.dashboardManualInputReason); });
    bindDashboardControl(controls.zoomIn, function () { cameraAdapter.setFov(cameraAdapter.getFov() - zoomStep, plan.presenter.dashboardManualInputReason); });
    bindDashboardControl(controls.home, function () { cameraAdapter.goHome(plan.presenter.dashboardManualInputReason); });

    var manifest = Object.freeze({
      status: "PASSED",
      build: plan.build,
      pointerTypes: Object.freeze(allowedPointerTypes.slice()),
      dashboardControls: Object.keys(plan.dashboard.controls || {}).length,
      inspectionAvailable: !!(inspectionRuntime && typeof inspectionRuntime.selectAtClientPoint === "function")
    });

    function reset() {
      pointers = Object.create(null);
      pointerCount = 0;
      gestureMode = "IDLE";
      primaryPointerId = null;
      singleGesture = null;
      pinchOccurred = false;
      cameraAdapter.stopVelocity && cameraAdapter.stopVelocity();
      return true;
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      listeners.forEach(function (entry) {
        entry.target.removeEventListener(entry.type, entry.handler, entry.options);
      });
      listeners.length = 0;
      reset();
    }

    return {
      update: function () {},
      reset: reset,
      getManifest: function () { return copy(manifest); },
      getSafetyStatus: function () { return copy(safety); },
      getGestureState: function () { return gestureMode; },
      dispose: dispose
    };
  }

  root.MissionBosTouchCameraController = { create: create };
})(typeof window !== "undefined" ? window : globalThis);
