/* Mission BOS - Build 011N.4
   Frozen structural contract for Mission 001 vehicle-link parity with the
   approved Mission 002 ambulance connection.
*/
window.MISSION_BOS_MISSION_001_CONNECTIVITY_PARITY_PLAN = Object.freeze({
  schemaVersion: "1.0",
  project: "Mission BOS - Connected Response",
  build: "011N.4",
  sourceBuild: "Mission-BOS-Build-011N.3R.1",
  title: "Mission 001 Communication Parity",
  policy: Object.freeze({
    mission002ReferenceMustRemainUnchanged: true,
    associationChangesAllowed: false,
    radioModelChangesAllowed: false,
    cellLoadChangesAllowed: false,
    capacityChangesAllowed: false,
    priorityThresholdChangesAllowed: false,
    routeChangesAllowed: false,
    missionStateChangesAllowed: false,
    fixedCellAssignmentAllowed: false,
    duplicateBosPathsAllowed: false,
    rendererMayGateMissionCompletion: false
  }),
  reference: Object.freeze({
    file: "city-ambulance-connectivity-renderer.js",
    endpointId: "NET_AMBULANCE_01",
    approvedByUser: true
  }),
  targetEndpoints: Object.freeze([
    Object.freeze({ endpointId: "NET_FIRE_01", vehicleId: "RESPONSE_FIRE_01" }),
    Object.freeze({ endpointId: "NET_POLICE_01", vehicleId: "RESPONSE_POLICE_01" })
  ]),
  packetContract: Object.freeze({
    geometryRadius: 0.15,
    geometryWidthSegments: 8,
    geometryHeightSegments: 6,
    packetsPerPath: 4,
    forwardPackets: 2,
    reversePackets: 2,
    directions: Object.freeze([1, 1, -1, -1]),
    offsets: Object.freeze([0, 0.5, 0.25, 0.75]),
    clock: "global-render-elapsed",
    updateFrequency: "every-render-frame",
    preservePhaseAcrossVisualStateChange: true,
    preservePhaseAcrossMissionStateChange: true,
    sharedPacketMeshesAcrossPathsAllowed: false
  }),
  renderContract: Object.freeze({
    depthTest: false,
    depthWrite: false,
    glowRenderOrder: 40,
    coreRenderOrder: 41,
    packetRenderOrder: 42,
    liveVehicleAnchorEveryFrame: true,
    liveTowerBeaconAnchorEveryFrame: true,
    stalePathHiddenImmediately: true,
    visibleOutsideMissions: true
  }),
  visualContract: Object.freeze({
    standbyLineColor: "#9BDFFF",
    standbyPacketColor: "#B9E6FF",
    priorityLineColor: "#0066CC",
    priorityPacketColor: "#E20074",
    colorsReadFromExistingVisualPlan: true,
    priorityReadOnlyFromCellPriorityRuntime: true,
    magentaWithoutActiveCellPriorityAllowed: false
  }),
  backhaulContract: Object.freeze({
    buildingId: "B01",
    followConfirmedCells: true,
    uniquePathPerServingCell: true,
    permanentlyVisible: true,
    preserveExistingRenderer: true
  }),
  expected: Object.freeze({
    mission001BosVehiclePaths: 2,
    packetsPerVehiclePath: 4,
    packetsEachDirection: 2,
    fixedCellAssignments: 0,
    mission002FilesChanged: 0,
    newMissionRegistrations: 0
  })
});
