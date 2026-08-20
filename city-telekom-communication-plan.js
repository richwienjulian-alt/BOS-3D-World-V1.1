/* Mission BOS - Build 009N.2
   Local Cell Load & BOS Priority Communication - deterministic symbolic plan.
   No modules. No fetch. No fixed serving-tower definition.
*/

window.MISSION_BOS_TELEKOM_COMMUNICATION_PLAN = {
  "schemaVersion": "2.0",
  "project": "Mission BOS – Connected Response",
  "buildBase": "009N.4 PASSED",
  "phase": "009N.5 Realistic Association Communication Compatibility",
  "sourceMissionPhase": "009N.1 Dynamic Network Association",
  "sourceFiles": {
    "city-layout-recovery.js": "54c1c4eb578eb66a8d8a2978711ec414a5711e1ed5b571094fa2ec776c968d17",
    "city-static-props-plan.js": "e31ad502cf411bd586dad47d2e5c00f7e845ee2be0422d8c1966cd7b07ca96f8",
    "city-traffic-plan.js": "617b4ffa560859e0a11e54b009e159f34b73b71f7201617f92a1611568b54a65",
    "city-pedestrian-plan.js": "ca979d6b379bb7d8c3fc3a0f522617f4029a296333680b10fb2c2301cb8a44b7",
    "city-response-vehicle-plan.js": "484eb5908a62b4916a01ba7c7939b3fa34cb5fccf1b7e9a7a5c86c4642ba5796",
    "city-incident-response-plan.js": "ae9fb7cd3ed3b97509cb9c5e3cac8ede9febef6f435c50c43cb67ff56d1f396e",
    "city-mission-001-plan.js": "83a6c387c9f34380010de403a8afb29bb80961367eb30d411523d6c9b4fbc5ab",
    "city-mission-001-scene-plan.js": "79e9728d6b071655a6c0f3309c638fdcb5ac8f4cba01fc457828e13347390930",
    "city-network-association-plan.js": "4e3da70af3cb4c0a16535ab636904314970761b5d3f06e377a973f6150eb2017",
    "city-cell-load-plan.js": "2fe4906a8cc720e0b7c67cd3f3c7a6771973882ace98f67a4dafda3ea86edb3d"
  },
  "experiencePolicy": {
    "runtimeRandomization": false,
    "cameraTakeoverAllowed": false,
    "cityGeometryChangesAllowed": false,
    "staticPropChangesAllowed": false,
    "trafficRouteChangesAllowed": false,
    "pedestrianRouteChangesAllowed": false,
    "responseRouteChangesAllowed": false,
    "missionStateChangesAllowed": false,
    "networkLoadPolicyChangesAllowed": false,
    "automaticBOSActivationAllowed": false,
    "civilianLoadMayDropAfterBOSActivation": false,
    "spectatorPhonesRemainVisibleAfterBOS": true,
    "legacyCommunicationRendererAllowed": false,
    "visualizationIsSymbolic": true,
    "productPerformanceClaimsAllowed": false,
    "fixedTechnicalKpiClaimsAllowed": false,
    "fileProtocolRequired": true,
    "fixedServingTowerAllowed": false,
    "dynamicNetworkAssociationRequired": true,
    "localCellLoadRequired": true
  },
  "communicationStory": {
    "title": "Zivile Netzlast und priorisierte BOS-Kommunikation",
    "servingTowerMode": "dynamic-network-association",
    "associationModelId": "SIMPLIFIED_RADIO_HANDOVER_V3",
    "incidentBuildingId": "W14",
    "logicalPathLabel": "Leitstelle → dynamische Funkzelle → Feuerwehr und Polizei",
    "disclaimer": "Vereinfachte symbolische Darstellung der dynamischen Funkzellenzuordnung; keine physische Netz- oder Leistungszusage.",
    "coreMessageBeforeBOS": "MAST_A und MAST_B tragen lokale zivile Umfeldlast; sichtbare Geräte teilen sich positionsabhängig auf beide Zellen auf.",
    "coreMessageAfterBOS": "Die zivile Last bleibt an MAST_A und MAST_B hoch; BOS-Priorität stabilisiert ausschließlich die Kommunikation der Einsatzkräfte in ihrer aktuellen Zelle."
  },
  "endpoints": [
    {
      "id": "COMM_DISPATCH_B01",
      "kind": "building",
      "referenceId": "B01",
      "label": "Leitstelle",
      "yOffset": 1.2
    },
    {
      "id": "COMM_FIRE_RESPONSE",
      "kind": "response-vehicle",
      "referenceId": "RESPONSE_FIRE_01",
      "associationEndpointId": "NET_FIRE_01",
      "label": "Feuerwehr",
      "yOffset": 1.75
    },
    {
      "id": "COMM_POLICE_RESPONSE",
      "kind": "response-vehicle",
      "referenceId": "RESPONSE_POLICE_01",
      "associationEndpointId": "NET_POLICE_01",
      "label": "Polizei",
      "yOffset": 1.45
    },
    {
      "id": "COMM_PHONE_01",
      "kind": "mission-phone",
      "referenceId": "MISSION_SPECTATOR_01",
      "associationEndpointId": "NET_PHONE_01",
      "label": "Zuschauer-Smartphone 1",
      "yOffset": 1.48
    },
    {
      "id": "COMM_PHONE_02",
      "kind": "mission-phone",
      "referenceId": "MISSION_SPECTATOR_02",
      "associationEndpointId": "NET_PHONE_02",
      "label": "Zuschauer-Smartphone 2",
      "yOffset": 1.48
    },
    {
      "id": "COMM_PHONE_03",
      "kind": "mission-phone",
      "referenceId": "MISSION_SPECTATOR_03",
      "associationEndpointId": "NET_PHONE_03",
      "label": "Zuschauer-Smartphone 3",
      "yOffset": 1.48
    },
    {
      "id": "COMM_PHONE_04",
      "kind": "mission-phone",
      "referenceId": "MISSION_SPECTATOR_04",
      "associationEndpointId": "NET_PHONE_04",
      "label": "Zuschauer-Smartphone 4",
      "yOffset": 1.48
    },
    {
      "id": "COMM_PHONE_05",
      "kind": "mission-phone",
      "referenceId": "MISSION_SPECTATOR_05",
      "associationEndpointId": "NET_PHONE_05",
      "label": "Zuschauer-Smartphone 5",
      "yOffset": 1.48
    },
    {
      "id": "COMM_PHONE_06",
      "kind": "mission-phone",
      "referenceId": "MISSION_SPECTATOR_06",
      "associationEndpointId": "NET_PHONE_06",
      "label": "Zuschauer-Smartphone 6",
      "yOffset": 1.48
    }
  ],
  "bosLinks": [
    {
      "id": "BOS_LINK_DISPATCH_FIRE_CELL",
      "role": "dispatch-to-serving-tower",
      "associationEndpointId": "NET_FIRE_01",
      "from": "COMM_DISPATCH_B01",
      "packetCount": 5,
      "logicalBidirectional": true
    },
    {
      "id": "BOS_LINK_FIRE_CELL_RESPONSE",
      "role": "serving-tower-to-mobile",
      "associationEndpointId": "NET_FIRE_01",
      "to": "COMM_FIRE_RESPONSE",
      "packetCount": 5,
      "logicalBidirectional": true
    },
    {
      "id": "BOS_LINK_DISPATCH_POLICE_CELL",
      "role": "dispatch-to-serving-tower",
      "associationEndpointId": "NET_POLICE_01",
      "from": "COMM_DISPATCH_B01",
      "packetCount": 5,
      "logicalBidirectional": true
    },
    {
      "id": "BOS_LINK_POLICE_CELL_RESPONSE",
      "role": "serving-tower-to-mobile",
      "associationEndpointId": "NET_POLICE_01",
      "to": "COMM_POLICE_RESPONSE",
      "packetCount": 5,
      "logicalBidirectional": true
    }
  ],
  "civilianLinks": [
    {
      "id": "CIV_LINK_PHONE_01",
      "role": "mobile-to-serving-tower",
      "associationEndpointId": "NET_PHONE_01",
      "from": "COMM_PHONE_01",
      "packetCount": 1
    },
    {
      "id": "CIV_LINK_PHONE_02",
      "role": "mobile-to-serving-tower",
      "associationEndpointId": "NET_PHONE_02",
      "from": "COMM_PHONE_02",
      "packetCount": 1
    },
    {
      "id": "CIV_LINK_PHONE_03",
      "role": "mobile-to-serving-tower",
      "associationEndpointId": "NET_PHONE_03",
      "from": "COMM_PHONE_03",
      "packetCount": 1
    },
    {
      "id": "CIV_LINK_PHONE_04",
      "role": "mobile-to-serving-tower",
      "associationEndpointId": "NET_PHONE_04",
      "from": "COMM_PHONE_04",
      "packetCount": 1
    },
    {
      "id": "CIV_LINK_PHONE_05",
      "role": "mobile-to-serving-tower",
      "associationEndpointId": "NET_PHONE_05",
      "from": "COMM_PHONE_05",
      "packetCount": 1
    },
    {
      "id": "CIV_LINK_PHONE_06",
      "role": "mobile-to-serving-tower",
      "associationEndpointId": "NET_PHONE_06",
      "from": "COMM_PHONE_06",
      "packetCount": 1
    }
  ],
  "visualStyle": {
    "standbyColor": "#9bdfff",
    "highLoadColor": "#ffc15c",
    "overloadedColor": "#ff6b5c",
    "priorityColor": "#e20074",
    "stableColor": "#e20074",
    "civilianCongestionColor": "#ff6b5c",
    "lineHeightOffset": 0.15,
    "endpointMarkerRadius": 0.25,
    "packetRadius": 0.14,
    "towerHaloRadii": [
      1.35,
      2.15,
      2.95
    ],
    "deterministicDropoutFrequency": 8,
    "deterministicPulseFrequency": 3.5,
    "depthWrite": false
  },
  "statePresentation": {
    "READY": {
      "experienceVisible": true,
      "civilianLinksVisible": false,
      "bosMode": "standby",
      "civilianMode": "normal",
      "priorityActive": false,
      "bosStatus": "Bereit",
      "civilianStatus": "Normalbetrieb",
      "comparisonText": "BOS-Kommunikation ist vorbereitet; keine Einsatzlast aktiv."
    },
    "CALL_RECEIVED": {
      "experienceVisible": true,
      "civilianLinksVisible": false,
      "bosMode": "normal",
      "civilianMode": "normal",
      "priorityActive": false,
      "bosStatus": "Stabil",
      "civilianStatus": "Normalbetrieb",
      "comparisonText": "Der Notruf wird über den vorbereiteten Kommunikationspfad verarbeitet."
    },
    "CLEARING_CORRIDOR": {
      "experienceVisible": true,
      "civilianLinksVisible": false,
      "bosMode": "normal",
      "civilianMode": "normal",
      "priorityActive": false,
      "bosStatus": "Stabil",
      "civilianStatus": "Normalbetrieb",
      "comparisonText": "Leitstelle und Einsatzkräfte bleiben während der Korridorräumung verbunden."
    },
    "DISPATCHING": {
      "experienceVisible": true,
      "civilianLinksVisible": false,
      "bosMode": "high-load",
      "civilianMode": "rising",
      "priorityActive": false,
      "bosStatus": "Belastet",
      "civilianStatus": "Last steigt",
      "comparisonText": "Die allgemeine Nutzung steigt; Priorisierung ist noch nicht aktiv."
    },
    "ENROUTE": {
      "experienceVisible": true,
      "civilianLinksVisible": false,
      "bosMode": "high-load",
      "civilianMode": "rising",
      "priorityActive": false,
      "bosStatus": "Belastet",
      "civilianStatus": "Hohe Auslastung",
      "comparisonText": "Die Verbindung folgt den Einsatzfahrzeugen auf der Anfahrt."
    },
    "ON_SCENE": {
      "experienceVisible": true,
      "civilianLinksVisible": true,
      "bosMode": "high-load",
      "civilianMode": "rising",
      "priorityActive": false,
      "bosStatus": "Belastet",
      "civilianStatus": "Zuschauerlast steigt",
      "comparisonText": "Sechs Zuschauer-Smartphones erhöhen sichtbar die zivile Last."
    },
    "OVERLOADED": {
      "experienceVisible": true,
      "civilianLinksVisible": true,
      "bosMode": "degraded",
      "civilianMode": "congested",
      "priorityActive": false,
      "bosStatus": "Instabil",
      "civilianStatus": "Überlastet",
      "comparisonText": "Die zivile Last ist kritisch; BOS-Datenpakete werden sichtbar unterbrochen."
    },
    "BOS_ACTIVE": {
      "experienceVisible": true,
      "civilianLinksVisible": true,
      "bosMode": "prioritizing",
      "civilianMode": "congested",
      "priorityActive": true,
      "bosStatus": "Priorisierung wird aufgebaut",
      "civilianStatus": "Weiterhin überlastet",
      "comparisonText": "Die zivile Last bleibt hoch; die BOS-Verbindung wird priorisiert."
    },
    "COMMS_STABLE": {
      "experienceVisible": true,
      "civilianLinksVisible": true,
      "bosMode": "stable",
      "civilianMode": "congested",
      "priorityActive": true,
      "bosStatus": "Priorisiert und stabil",
      "civilianStatus": "Weiterhin überlastet",
      "comparisonText": "Trotz unverändert hoher ziviler Last ist die BOS-Kommunikation wieder stabil."
    },
    "COMPLETED": {
      "experienceVisible": true,
      "civilianLinksVisible": true,
      "bosMode": "stable",
      "civilianMode": "congested",
      "priorityActive": true,
      "bosStatus": "Kommunikationsziel erreicht",
      "civilianStatus": "Weiterhin überlastet",
      "comparisonText": "Die priorisierte BOS-Kommunikation bleibt stabil bis zum kontrollierten Einsatzende."
    },
    "RETURNING": {
      "experienceVisible": true,
      "civilianLinksVisible": false,
      "bosMode": "returning-priority",
      "civilianMode": "recovering",
      "priorityActive": true,
      "bosStatus": "Priorisiert während Rückfahrt",
      "civilianStatus": "Last normalisiert sich",
      "comparisonText": "Die BOS-Priorisierung bleibt bis zur vollständigen Rückkehr aktiv."
    },
    "FAILED": {
      "experienceVisible": false,
      "civilianLinksVisible": false,
      "bosMode": "failed",
      "civilianMode": "failed",
      "priorityActive": false,
      "bosStatus": "Sicherheitsstopp",
      "civilianStatus": "Nicht verfügbar",
      "comparisonText": "Die Kommunikationsdarstellung wurde kontrolliert angehalten."
    }
  },
  "dashboard": {
    "sectionTitle": "Kommunikationsvergleich",
    "civilianChannelLabel": "Zivile Netzlast",
    "bosChannelLabel": "BOS-Verbindung",
    "pathLabel": "Leitstelle → Mobilfunknetz → Feuerwehr + Polizei",
    "symbolicHint": "Vereinfachte symbolische Visualisierung; keine technische Leistungskennzahl.",
    "civilianFillByMode": {
      "normal": 0.38,
      "rising": 0.72,
      "congested": 0.96,
      "recovering": 0.7,
      "failed": 0
    },
    "bosFillByMode": {
      "standby": 0.72,
      "normal": 0.86,
      "high-load": 0.58,
      "degraded": 0.24,
      "prioritizing": 0.72,
      "stable": 1,
      "returning-priority": 0.9,
      "failed": 0
    },
    "fireCellLabel": "Feuerwehr – aktuelle Funkzelle",
    "policeCellLabel": "Polizei – aktuelle Funkzelle",
    "lastHandoverLabel": "Letzter Handover",
    "cellLoadSectionTitle": "Funkzellen-Auslastung",
    "criticalCellLabel": "Kritische Funkzelle",
    "cellLoadRows": ["MAST_A", "MAST_B", "MAST_C", "MAST_D", "MAST_E"],
    "cellLoadPlacement": "inside-existing-right-dashboard",
    "newStandaloneCellLoadPanelAllowed": false
  },
  "expectedCounts": {
    "endpoints": 14,
    "logicalEndpoints": 9,
    "buildingEndpoints": 1,
    "towerEndpoints": 0,
    "associationTowerMarkers": 5,
    "responseVehicleEndpoints": 2,
    "missionPhoneEndpoints": 6,
    "bosLinks": 4,
    "civilianLinks": 6,
    "bosPackets": 20,
    "civilianPackets": 6,
    "statePresentations": 12,
    "endpointMarkers": 14,
    "towerHalos": 15,
    "servingTowers": 5,
    "fixedServingTowerDefinitions": 0,
    "automaticBOSActivations": 0,
    "productPerformanceClaims": 0
  }
};
