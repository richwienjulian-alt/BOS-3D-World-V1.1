window.MISSION_BOS_RECOVERY_LAYOUT = {
  "schemaVersion": "1.0",
  "project": "Mission BOS – Connected Response",
  "buildBase": "Build 008",
  "phase": "008R.1.1 MAST_B Site Alignment Correction",
  "source": {
    "authoritativeFile": "City Blueprint Version 1.0 FINAL – PNG supplied in conversation",
    "sha256": "bb6ed472edc84ae59171e3b7466491ac0032786095f3440c5353c74c9dfb4734",
    "pixelSize": {
      "width": 1233,
      "height": 890
    },
    "note": "The separately available SVG is an older, visually different plan and is explicitly not authoritative."
  },
  "coordinateSystem": {
    "originPixel": {
      "x": 485.0,
      "y": 440.5
    },
    "worldUnitsPerPixel": 0.12,
    "conversion": "worldX=(pixelCenterX-485.0)*0.12; worldZ=(440.5-pixelCenterY)*0.12",
    "north": "positive Z"
  },
  "materials": {
    "road": "#4b5563",
    "sidewalk": "#ddd7cc",
    "parking": "#dfe3e7",
    "paved": "#e8e2d5",
    "green": "#cfe3bd"
  },
  "districts": [
    {
      "id": "RESIDENTIAL",
      "pixelRect": {
        "x": 65,
        "y": 120,
        "width": 258,
        "height": 352
      },
      "worldRect": {
        "x": -34.92,
        "z": 17.34,
        "width": 30.96,
        "depth": 42.24
      },
      "color": "#e7f0df",
      "name": "Wohngebiet"
    },
    {
      "id": "DOWNTOWN",
      "pixelRect": {
        "x": 364,
        "y": 120,
        "width": 255,
        "height": 352
      },
      "worldRect": {
        "x": 0.78,
        "z": 17.34,
        "width": 30.6,
        "depth": 42.24
      },
      "color": "#f4ead2",
      "name": "Innenstadt"
    },
    {
      "id": "HEALTH",
      "pixelRect": {
        "x": 667,
        "y": 120,
        "width": 243,
        "height": 349
      },
      "worldRect": {
        "x": 36.42,
        "z": 17.52,
        "width": 29.16,
        "depth": 41.88
      },
      "color": "#dfeef1",
      "name": "Gesundheitsbereich"
    },
    {
      "id": "BOS_CAMPUS",
      "pixelRect": {
        "x": 66,
        "y": 525,
        "width": 257,
        "height": 232
      },
      "worldRect": {
        "x": -34.86,
        "z": -24.06,
        "width": 30.84,
        "depth": 27.84
      },
      "color": "#f1e2e8",
      "name": "BOS Campus"
    },
    {
      "id": "SERVICE_STRIP",
      "pixelRect": {
        "x": 364,
        "y": 525,
        "width": 255,
        "height": 232
      },
      "worldRect": {
        "x": 0.78,
        "z": -24.06,
        "width": 30.6,
        "depth": 27.84
      },
      "color": "#f4ead2",
      "name": "BOS / Event Support"
    },
    {
      "id": "EVENT_ARENA",
      "pixelRect": {
        "x": 667,
        "y": 525,
        "width": 243,
        "height": 232
      },
      "worldRect": {
        "x": 36.42,
        "z": -24.06,
        "width": 29.16,
        "depth": 27.84
      },
      "color": "#e8e4f2",
      "name": "Event Arena"
    }
  ],
  "noBuildCorridors": [
    {
      "id": "C_RING_NORTH",
      "pixelRect": {
        "x": 20,
        "y": 75,
        "width": 930,
        "height": 45
      },
      "worldRect": {
        "x": 0.0,
        "z": 41.16,
        "width": 111.6,
        "depth": 5.4
      },
      "orientation": "horizontal"
    },
    {
      "id": "C_RING_SOUTH",
      "pixelRect": {
        "x": 20,
        "y": 762,
        "width": 930,
        "height": 45
      },
      "worldRect": {
        "x": 0.0,
        "z": -41.28,
        "width": 111.6,
        "depth": 5.4
      },
      "orientation": "horizontal"
    },
    {
      "id": "C_RING_WEST",
      "pixelRect": {
        "x": 20,
        "y": 75,
        "width": 45,
        "height": 732
      },
      "worldRect": {
        "x": -53.1,
        "z": -0.06,
        "width": 5.4,
        "depth": 87.84
      },
      "orientation": "vertical"
    },
    {
      "id": "C_RING_EAST",
      "pixelRect": {
        "x": 905,
        "y": 75,
        "width": 45,
        "height": 732
      },
      "worldRect": {
        "x": 53.1,
        "z": -0.06,
        "width": 5.4,
        "depth": 87.84
      },
      "orientation": "vertical"
    },
    {
      "id": "C_BOS_BOULEVARD",
      "pixelRect": {
        "x": 324,
        "y": 75,
        "width": 38,
        "height": 732
      },
      "worldRect": {
        "x": -17.04,
        "z": -0.06,
        "width": 4.56,
        "depth": 87.84
      },
      "orientation": "vertical"
    },
    {
      "id": "C_STADTACHSE",
      "pixelRect": {
        "x": 477,
        "y": 75,
        "width": 29,
        "height": 732
      },
      "worldRect": {
        "x": 0.78,
        "z": -0.06,
        "width": 3.48,
        "depth": 87.84
      },
      "orientation": "vertical"
    },
    {
      "id": "C_KLINIKALLEE",
      "pixelRect": {
        "x": 621,
        "y": 75,
        "width": 38,
        "height": 732
      },
      "worldRect": {
        "x": 18.6,
        "z": -0.06,
        "width": 4.56,
        "depth": 87.84
      },
      "orientation": "vertical"
    },
    {
      "id": "C_NORTH_CONNECTOR",
      "pixelRect": {
        "x": 20,
        "y": 206,
        "width": 930,
        "height": 34
      },
      "worldRect": {
        "x": 0.0,
        "z": 26.1,
        "width": 111.6,
        "depth": 4.08
      },
      "orientation": "horizontal"
    },
    {
      "id": "C_STADTALLEE",
      "pixelRect": {
        "x": 20,
        "y": 369,
        "width": 930,
        "height": 37
      },
      "worldRect": {
        "x": 0.0,
        "z": 6.36,
        "width": 111.6,
        "depth": 4.44
      },
      "orientation": "horizontal"
    },
    {
      "id": "C_EINSATZALLEE",
      "pixelRect": {
        "x": 20,
        "y": 473,
        "width": 930,
        "height": 38
      },
      "worldRect": {
        "x": 0.0,
        "z": -6.18,
        "width": 111.6,
        "depth": 4.56
      },
      "orientation": "horizontal"
    },
    {
      "id": "C_LOGISTIKSPANGE",
      "pixelRect": {
        "x": 324,
        "y": 615,
        "width": 335,
        "height": 34
      },
      "worldRect": {
        "x": 0.78,
        "z": -22.98,
        "width": 40.2,
        "depth": 4.08
      },
      "orientation": "horizontal"
    }
  ],
  "roadSurfaces": [
    {
      "id": "RING_NORTH",
      "pixelRect": {
        "x": 27,
        "y": 82,
        "width": 916,
        "height": 32
      },
      "worldRect": {
        "x": 0.0,
        "z": 41.1,
        "width": 109.92,
        "depth": 3.84
      },
      "orientation": "horizontal"
    },
    {
      "id": "RING_SOUTH",
      "pixelRect": {
        "x": 27,
        "y": 769,
        "width": 916,
        "height": 31
      },
      "worldRect": {
        "x": 0.0,
        "z": -41.28,
        "width": 109.92,
        "depth": 3.72
      },
      "orientation": "horizontal"
    },
    {
      "id": "RING_WEST",
      "pixelRect": {
        "x": 27,
        "y": 82,
        "width": 31,
        "height": 718
      },
      "worldRect": {
        "x": -53.1,
        "z": -0.06,
        "width": 3.72,
        "depth": 86.16
      },
      "orientation": "vertical"
    },
    {
      "id": "RING_EAST",
      "pixelRect": {
        "x": 912,
        "y": 82,
        "width": 32,
        "height": 718
      },
      "worldRect": {
        "x": 53.16,
        "z": -0.06,
        "width": 3.84,
        "depth": 86.16
      },
      "orientation": "vertical"
    },
    {
      "id": "BOS_BOULEVARD",
      "pixelRect": {
        "x": 331,
        "y": 82,
        "width": 24,
        "height": 718
      },
      "worldRect": {
        "x": -17.04,
        "z": -0.06,
        "width": 2.88,
        "depth": 86.16
      },
      "orientation": "vertical"
    },
    {
      "id": "STADTACHSE",
      "pixelRect": {
        "x": 481,
        "y": 82,
        "width": 21,
        "height": 718
      },
      "worldRect": {
        "x": 0.78,
        "z": -0.06,
        "width": 2.52,
        "depth": 86.16
      },
      "orientation": "vertical"
    },
    {
      "id": "KLINIKALLEE",
      "pixelRect": {
        "x": 628,
        "y": 82,
        "width": 24,
        "height": 718
      },
      "worldRect": {
        "x": 18.6,
        "z": -0.06,
        "width": 2.88,
        "depth": 86.16
      },
      "orientation": "vertical"
    },
    {
      "id": "NORTH_CONNECTOR",
      "pixelRect": {
        "x": 27,
        "y": 213,
        "width": 917,
        "height": 20
      },
      "worldRect": {
        "x": 0.06,
        "z": 26.1,
        "width": 110.04,
        "depth": 2.4
      },
      "orientation": "horizontal",
      "labels": [
        "PARKSTRASSE",
        "RATHAUSALLEE",
        "KLINIKSTRASSE"
      ]
    },
    {
      "id": "STADTALLEE",
      "pixelRect": {
        "x": 27,
        "y": 375,
        "width": 917,
        "height": 25
      },
      "worldRect": {
        "x": 0.06,
        "z": 6.36,
        "width": 110.04,
        "depth": 3.0
      },
      "orientation": "horizontal"
    },
    {
      "id": "EINSATZALLEE",
      "pixelRect": {
        "x": 27,
        "y": 480,
        "width": 917,
        "height": 24
      },
      "worldRect": {
        "x": 0.06,
        "z": -6.18,
        "width": 110.04,
        "depth": 2.88
      },
      "orientation": "horizontal"
    },
    {
      "id": "LOGISTIKSPANGE",
      "pixelRect": {
        "x": 331,
        "y": 622,
        "width": 321,
        "height": 21
      },
      "worldRect": {
        "x": 0.78,
        "z": -23.04,
        "width": 38.52,
        "depth": 2.52
      },
      "orientation": "horizontal"
    }
  ],
  "buildings": [
    {
      "id": "W01",
      "pixelRect": {
        "x": 130,
        "y": 155,
        "width": 19,
        "height": 20
      },
      "worldRect": {
        "x": -41.46,
        "z": 33.06,
        "width": 2.28,
        "depth": 2.4
      },
      "type": "detached_house",
      "height": 4.8,
      "roof": "pitched",
      "color": "#d8b98f",
      "name": "Wohnhaus W01",
      "rotation": 0
    },
    {
      "id": "W02",
      "pixelRect": {
        "x": 170,
        "y": 155,
        "width": 20,
        "height": 20
      },
      "worldRect": {
        "x": -36.6,
        "z": 33.06,
        "width": 2.4,
        "depth": 2.4
      },
      "type": "detached_house",
      "height": 4.8,
      "roof": "pitched",
      "color": "#d8b98f",
      "name": "Wohnhaus W02",
      "rotation": 0
    },
    {
      "id": "W03",
      "pixelRect": {
        "x": 211,
        "y": 155,
        "width": 19,
        "height": 20
      },
      "worldRect": {
        "x": -31.74,
        "z": 33.06,
        "width": 2.28,
        "depth": 2.4
      },
      "type": "detached_house",
      "height": 4.8,
      "roof": "pitched",
      "color": "#d8b98f",
      "name": "Wohnhaus W03",
      "rotation": 0
    },
    {
      "id": "W04",
      "pixelRect": {
        "x": 251,
        "y": 155,
        "width": 20,
        "height": 20
      },
      "worldRect": {
        "x": -26.88,
        "z": 33.06,
        "width": 2.4,
        "depth": 2.4
      },
      "type": "detached_house",
      "height": 4.8,
      "roof": "pitched",
      "color": "#d8b98f",
      "name": "Wohnhaus W04",
      "rotation": 0
    },
    {
      "id": "W05",
      "pixelRect": {
        "x": 292,
        "y": 155,
        "width": 19,
        "height": 20
      },
      "worldRect": {
        "x": -22.02,
        "z": 33.06,
        "width": 2.28,
        "depth": 2.4
      },
      "type": "detached_house",
      "height": 4.8,
      "roof": "pitched",
      "color": "#d8b98f",
      "name": "Wohnhaus W05",
      "rotation": 0
    },
    {
      "id": "W06",
      "pixelRect": {
        "x": 76,
        "y": 265,
        "width": 39,
        "height": 41
      },
      "worldRect": {
        "x": -46.74,
        "z": 18.6,
        "width": 4.68,
        "depth": 4.92
      },
      "type": "apartment",
      "height": 9.0,
      "roof": "flat",
      "color": "#b99a78",
      "name": "Mehrfamilienhaus W06",
      "rotation": 0
    },
    {
      "id": "W07",
      "pixelRect": {
        "x": 141,
        "y": 265,
        "width": 39,
        "height": 41
      },
      "worldRect": {
        "x": -38.94,
        "z": 18.6,
        "width": 4.68,
        "depth": 4.92
      },
      "type": "apartment",
      "height": 9.5,
      "roof": "flat",
      "color": "#b99a78",
      "name": "Mehrfamilienhaus W07",
      "rotation": 0
    },
    {
      "id": "W08",
      "pixelRect": {
        "x": 205,
        "y": 265,
        "width": 40,
        "height": 41
      },
      "worldRect": {
        "x": -31.2,
        "z": 18.6,
        "width": 4.8,
        "depth": 4.92
      },
      "type": "apartment",
      "height": 9.0,
      "roof": "flat",
      "color": "#b99a78",
      "name": "Mehrfamilienhaus W08",
      "rotation": 0
    },
    {
      "id": "W10",
      "pixelRect": {
        "x": 75,
        "y": 426,
        "width": 41,
        "height": 23
      },
      "worldRect": {
        "x": -46.74,
        "z": 0.36,
        "width": 4.92,
        "depth": 2.76
      },
      "type": "residential_block",
      "height": 7.5,
      "roof": "flat",
      "color": "#d8b98f",
      "name": "Wohnblock W10",
      "rotation": 0
    },
    {
      "id": "W11",
      "pixelRect": {
        "x": 140,
        "y": 426,
        "width": 41,
        "height": 23
      },
      "worldRect": {
        "x": -38.94,
        "z": 0.36,
        "width": 4.92,
        "depth": 2.76
      },
      "type": "residential_block",
      "height": 8.0,
      "roof": "flat",
      "color": "#d8b98f",
      "name": "Wohnblock W11",
      "rotation": 0
    },
    {
      "id": "W12",
      "pixelRect": {
        "x": 205,
        "y": 426,
        "width": 41,
        "height": 23
      },
      "worldRect": {
        "x": -31.14,
        "z": 0.36,
        "width": 4.92,
        "depth": 2.76
      },
      "type": "residential_block",
      "height": 8.0,
      "roof": "flat",
      "color": "#d8b98f",
      "name": "Wohnblock W12",
      "rotation": 0
    },
    {
      "id": "W13",
      "pixelRect": {
        "x": 269,
        "y": 426,
        "width": 41,
        "height": 23
      },
      "worldRect": {
        "x": -23.46,
        "z": 0.36,
        "width": 4.92,
        "depth": 2.76
      },
      "type": "residential_block",
      "height": 7.5,
      "roof": "flat",
      "color": "#d8b98f",
      "name": "Wohnblock W13",
      "rotation": 0
    },
    {
      "id": "W14",
      "pixelRect": {
        "x": 380,
        "y": 140,
        "width": 32,
        "height": 36
      },
      "worldRect": {
        "x": -10.68,
        "z": 33.9,
        "width": 3.84,
        "depth": 4.32
      },
      "type": "residential_tower",
      "height": 12.0,
      "roof": "flat",
      "color": "#c8b08b",
      "name": "Wohnblock W14",
      "rotation": 0
    },
    {
      "id": "W15",
      "pixelRect": {
        "x": 433,
        "y": 140,
        "width": 33,
        "height": 36
      },
      "worldRect": {
        "x": -4.26,
        "z": 33.9,
        "width": 3.96,
        "depth": 4.32
      },
      "type": "residential_tower",
      "height": 10.0,
      "roof": "flat",
      "color": "#c8b08b",
      "name": "Wohnblock W15",
      "rotation": 0
    },
    {
      "id": "I05",
      "pixelRect": {
        "x": 517,
        "y": 138,
        "width": 41,
        "height": 29
      },
      "worldRect": {
        "x": 6.3,
        "z": 34.56,
        "width": 4.92,
        "depth": 3.48
      },
      "type": "office",
      "height": 8.0,
      "roof": "flat",
      "color": "#c5b1d8",
      "name": "Bürohaus I05",
      "rotation": 0
    },
    {
      "id": "I06",
      "pixelRect": {
        "x": 565,
        "y": 138,
        "width": 36,
        "height": 29
      },
      "worldRect": {
        "x": 11.76,
        "z": 34.56,
        "width": 4.32,
        "depth": 3.48
      },
      "type": "hotel",
      "height": 7.0,
      "roof": "flat",
      "color": "#e8c980",
      "name": "Hotel I06",
      "rotation": 0
    },
    {
      "id": "G01",
      "pixelRect": {
        "x": 691,
        "y": 136,
        "width": 182,
        "height": 43
      },
      "worldRect": {
        "x": 35.64,
        "z": 33.96,
        "width": 21.84,
        "depth": 5.16
      },
      "type": "hospital",
      "height": 6.5,
      "roof": "flat",
      "color": "#d99d9d",
      "name": "Krankenhaus G01",
      "rotation": 0
    },
    {
      "id": "G02",
      "pixelRect": {
        "x": 681,
        "y": 264,
        "width": 80,
        "height": 40
      },
      "worldRect": {
        "x": 28.32,
        "z": 18.78,
        "width": 9.6,
        "depth": 4.8
      },
      "type": "ems_station",
      "height": 5.5,
      "roof": "flat",
      "color": "#e8b564",
      "name": "Rettungswache G02",
      "rotation": 0
    },
    {
      "id": "I01",
      "pixelRect": {
        "x": 384,
        "y": 321,
        "width": 80,
        "height": 29
      },
      "worldRect": {
        "x": -7.32,
        "z": 12.6,
        "width": 9.6,
        "depth": 3.48
      },
      "type": "town_hall",
      "height": 7.0,
      "roof": "flat",
      "color": "#c6b1d8",
      "name": "Rathaus I01",
      "rotation": 0
    },
    {
      "id": "I02",
      "pixelRect": {
        "x": 519,
        "y": 321,
        "width": 55,
        "height": 26
      },
      "worldRect": {
        "x": 7.38,
        "z": 12.78,
        "width": 6.6,
        "depth": 3.12
      },
      "type": "supermarket",
      "height": 4.5,
      "roof": "flat",
      "color": "#e8c980",
      "name": "Supermarkt I02",
      "rotation": 0
    },
    {
      "id": "I03",
      "pixelRect": {
        "x": 384,
        "y": 417,
        "width": 41,
        "height": 25
      },
      "worldRect": {
        "x": -9.66,
        "z": 1.32,
        "width": 4.92,
        "depth": 3.0
      },
      "type": "cafe",
      "height": 4.0,
      "roof": "pitched",
      "color": "#e8c980",
      "name": "Café I03",
      "rotation": 0
    },
    {
      "id": "B05",
      "pixelRect": {
        "x": 384,
        "y": 543,
        "width": 80,
        "height": 31
      },
      "worldRect": {
        "x": -7.32,
        "z": -14.16,
        "width": 9.6,
        "depth": 3.72
      },
      "type": "training",
      "height": 5.5,
      "roof": "flat",
      "color": "#b9c5cf",
      "name": "BOS Schulung B05",
      "rotation": 0
    },
    {
      "id": "E03",
      "pixelRect": {
        "x": 519,
        "y": 543,
        "width": 80,
        "height": 31
      },
      "worldRect": {
        "x": 8.88,
        "z": -14.16,
        "width": 9.6,
        "depth": 3.72
      },
      "type": "event_control",
      "height": 5.0,
      "roof": "flat",
      "color": "#b9c5cf",
      "name": "Eventleitung E03",
      "rotation": 0
    },
    {
      "id": "B01",
      "pixelRect": {
        "x": 76,
        "y": 570,
        "width": 59,
        "height": 25
      },
      "worldRect": {
        "x": -45.54,
        "z": -17.04,
        "width": 7.08,
        "depth": 3.0
      },
      "type": "dispatch",
      "height": 5.5,
      "roof": "flat",
      "color": "#a9c6d7",
      "name": "Leitstelle B01",
      "rotation": 0
    },
    {
      "id": "B02",
      "pixelRect": {
        "x": 160,
        "y": 570,
        "width": 60,
        "height": 25
      },
      "worldRect": {
        "x": -35.4,
        "z": -17.04,
        "width": 7.2,
        "depth": 3.0
      },
      "type": "police",
      "height": 5.2,
      "roof": "flat",
      "color": "#8fb6d3",
      "name": "Polizei B02",
      "rotation": 0
    },
    {
      "id": "B03",
      "pixelRect": {
        "x": 241,
        "y": 571,
        "width": 18,
        "height": 25
      },
      "worldRect": {
        "x": -28.2,
        "z": -17.16,
        "width": 2.16,
        "depth": 3.0
      },
      "type": "network",
      "height": 4.5,
      "roof": "flat",
      "color": "#b9c5cf",
      "name": "Netztechnik B03",
      "rotation": 0
    },
    {
      "id": "E01",
      "pixelRect": {
        "x": 736,
        "y": 567,
        "width": 159,
        "height": 71
      },
      "worldRect": {
        "x": 39.66,
        "z": -19.44,
        "width": 19.08,
        "depth": 8.52
      },
      "type": "arena",
      "height": 7.0,
      "roof": "oval",
      "color": "#b8addb",
      "name": "Event Arena E01",
      "rotation": 0
    },
    {
      "id": "B04",
      "pixelRect": {
        "x": 78,
        "y": 673,
        "width": 185,
        "height": 43
      },
      "worldRect": {
        "x": -37.74,
        "z": -30.48,
        "width": 22.2,
        "depth": 5.16
      },
      "type": "fire_station",
      "height": 5.8,
      "roof": "flat",
      "color": "#dc8888",
      "name": "Feuerwehr B04",
      "rotation": 0
    },
    {
      "id": "B04_TECH",
      "pixelRect": {
        "x": 299,
        "y": 673,
        "width": 16,
        "height": 43
      },
      "worldRect": {
        "x": -21.36,
        "z": -30.48,
        "width": 1.92,
        "depth": 5.16
      },
      "type": "fire_tower",
      "height": 10.0,
      "roof": "flat",
      "color": "#b9c5cf",
      "name": "Feuerwehr Übungsturm",
      "rotation": 0
    },
    {
      "id": "B06",
      "pixelRect": {
        "x": 384,
        "y": 677,
        "width": 80,
        "height": 30
      },
      "worldRect": {
        "x": -7.32,
        "z": -30.18,
        "width": 9.6,
        "depth": 3.6
      },
      "type": "logistics",
      "height": 5.0,
      "roof": "flat",
      "color": "#b9c5cf",
      "name": "BOS Logistik B06",
      "rotation": 0
    },
    {
      "id": "E02",
      "pixelRect": {
        "x": 519,
        "y": 674,
        "width": 80,
        "height": 28
      },
      "worldRect": {
        "x": 8.88,
        "z": -29.7,
        "width": 9.6,
        "depth": 3.36
      },
      "type": "event_logistics",
      "height": 5.0,
      "roof": "flat",
      "color": "#b9c5cf",
      "name": "Eventlogistik E02",
      "rotation": 0
    }
  ],
  "mobileTowers": [
    {
      "id": "MAST_A",
      "pixelRect": {
        "x": 74,
        "y": 149,
        "width": 28,
        "height": 42
      },
      "worldRect": {
        "x": -47.64,
        "z": 32.46,
        "width": 3.36,
        "depth": 5.04
      },
      "district": "RESIDENTIAL",
      "height": 15.0,
      "type": "mobile_tower"
    },
    {
      "id": "MAST_B",
      "pixelRect": {
        "x": 587,
        "y": 314,
        "width": 28,
        "height": 40
      },
      "worldRect": {
        "x": 13.92,
        "z": 12.78,
        "width": 3.36,
        "depth": 4.8
      },
      "district": "DOWNTOWN",
      "height": 15.0,
      "type": "mobile_tower"
    },
    {
      "id": "MAST_C",
      "pixelRect": {
        "x": 874,
        "y": 149,
        "width": 28,
        "height": 42
      },
      "worldRect": {
        "x": 48.36,
        "z": 32.46,
        "width": 3.36,
        "depth": 5.04
      },
      "district": "HEALTH",
      "height": 15.0,
      "type": "mobile_tower"
    },
    {
      "id": "MAST_D",
      "pixelRect": {
        "x": 272,
        "y": 557,
        "width": 28,
        "height": 42
      },
      "worldRect": {
        "x": -23.88,
        "z": -16.5,
        "width": 3.36,
        "depth": 5.04
      },
      "district": "BOS_CAMPUS",
      "height": 15.0,
      "type": "mobile_tower"
    },
    {
      "id": "MAST_E",
      "pixelRect": {
        "x": 675,
        "y": 562,
        "width": 28,
        "height": 42
      },
      "worldRect": {
        "x": 24.48,
        "z": -17.1,
        "width": 3.36,
        "depth": 5.04
      },
      "district": "EVENT_ARENA",
      "height": 15.0,
      "type": "mobile_tower"
    }
  ],
  "technologyPlots": [
    {
      "id": "TECH_A",
      "pixelRect": {
        "x": 64,
        "y": 136,
        "width": 48,
        "height": 65
      },
      "worldRect": {
        "x": -47.64,
        "z": 32.64,
        "width": 5.76,
        "depth": 7.8
      },
      "tower": "MAST_A"
    },
    {
      "id": "TECH_B",
      "pixelRect": {
        "x": 583,
        "y": 309,
        "width": 37,
        "height": 51
      },
      "worldRect": {
        "x": 13.98,
        "z": 12.72,
        "width": 4.44,
        "depth": 6.12
      },
      "tower": "MAST_B"
    },
    {
      "id": "TECH_C",
      "pixelRect": {
        "x": 863,
        "y": 132,
        "width": 51,
        "height": 75
      },
      "worldRect": {
        "x": 48.42,
        "z": 32.52,
        "width": 6.12,
        "depth": 9.0
      },
      "tower": "MAST_C"
    },
    {
      "id": "TECH_D",
      "pixelRect": {
        "x": 262,
        "y": 544,
        "width": 48,
        "height": 67
      },
      "worldRect": {
        "x": -23.88,
        "z": -16.44,
        "width": 5.76,
        "depth": 8.04
      },
      "tower": "MAST_D"
    },
    {
      "id": "TECH_E",
      "pixelRect": {
        "x": 665,
        "y": 550,
        "width": 49,
        "height": 65
      },
      "worldRect": {
        "x": 24.54,
        "z": -17.04,
        "width": 5.88,
        "depth": 7.8
      },
      "tower": "MAST_E"
    }
  ],
  "greenAreas": [
    {
      "id": "W09_SMALL_PARK",
      "pixelRect": {
        "x": 261,
        "y": 246,
        "width": 62,
        "height": 118
      },
      "worldRect": {
        "x": -23.16,
        "z": 16.26,
        "width": 7.44,
        "depth": 14.16
      },
      "type": "park",
      "color": "#cfe3bd"
    },
    {
      "id": "I07_CITY_GARDEN_W",
      "pixelRect": {
        "x": 372,
        "y": 243,
        "width": 105,
        "height": 33
      },
      "worldRect": {
        "x": -7.26,
        "z": 21.72,
        "width": 12.6,
        "depth": 3.96
      },
      "type": "park",
      "color": "#cfe3bd"
    },
    {
      "id": "I07_CITY_GARDEN_E",
      "pixelRect": {
        "x": 506,
        "y": 243,
        "width": 105,
        "height": 33
      },
      "worldRect": {
        "x": 8.82,
        "z": 21.72,
        "width": 12.6,
        "depth": 3.96
      },
      "type": "park",
      "color": "#cfe3bd"
    },
    {
      "id": "G02_CLINIC_GARDEN",
      "pixelRect": {
        "x": 787,
        "y": 342,
        "width": 122,
        "height": 21
      },
      "worldRect": {
        "x": 43.56,
        "z": 10.56,
        "width": 14.64,
        "depth": 2.52
      },
      "type": "garden",
      "color": "#cfe3bd"
    },
    {
      "id": "G03_CLINIC_PROMENADE",
      "pixelRect": {
        "x": 667,
        "y": 411,
        "width": 243,
        "height": 58
      },
      "worldRect": {
        "x": 36.42,
        "z": 0.06,
        "width": 29.16,
        "depth": 6.96
      },
      "type": "park",
      "color": "#cfe3bd"
    }
  ],
  "parkingAreas": [
    {
      "id": "G02_VISITOR_PARKING",
      "pixelRect": {
        "x": 787,
        "y": 259,
        "width": 122,
        "height": 77
      },
      "worldRect": {
        "x": 43.56,
        "z": 17.16,
        "width": 14.64,
        "depth": 9.24
      },
      "type": "parking"
    },
    {
      "id": "B04_TECH_PARKING",
      "pixelRect": {
        "x": 270,
        "y": 673,
        "width": 23,
        "height": 43
      },
      "worldRect": {
        "x": -24.42,
        "z": -30.48,
        "width": 2.76,
        "depth": 5.16
      },
      "type": "parking"
    },
    {
      "id": "B06_READY_AREA",
      "pixelRect": {
        "x": 384,
        "y": 715,
        "width": 80,
        "height": 31
      },
      "worldRect": {
        "x": -7.32,
        "z": -34.8,
        "width": 9.6,
        "depth": 3.72
      },
      "type": "parking"
    },
    {
      "id": "E02_DELIVERY_AREA",
      "pixelRect": {
        "x": 519,
        "y": 713,
        "width": 80,
        "height": 33
      },
      "worldRect": {
        "x": 8.88,
        "z": -34.68,
        "width": 9.6,
        "depth": 3.96
      },
      "type": "parking"
    },
    {
      "id": "E_VISITOR_PARKING_W",
      "pixelRect": {
        "x": 668,
        "y": 722,
        "width": 113,
        "height": 29
      },
      "worldRect": {
        "x": 28.74,
        "z": -35.52,
        "width": 13.56,
        "depth": 3.48
      },
      "type": "parking"
    },
    {
      "id": "E_VISITOR_PARKING_E",
      "pixelRect": {
        "x": 790,
        "y": 722,
        "width": 119,
        "height": 29
      },
      "worldRect": {
        "x": 43.74,
        "z": -35.52,
        "width": 14.28,
        "depth": 3.48
      },
      "type": "parking"
    }
  ],
  "pavedAreas": [
    {
      "id": "HOSPITAL_FORECOURT",
      "pixelRect": {
        "x": 677,
        "y": 181,
        "width": 232,
        "height": 24
      },
      "worldRect": {
        "x": 36.96,
        "z": 29.7,
        "width": 27.84,
        "depth": 2.88
      },
      "type": "forecourt"
    },
    {
      "id": "TOWN_HALL_SQUARE",
      "pixelRect": {
        "x": 377,
        "y": 351,
        "width": 95,
        "height": 17
      },
      "worldRect": {
        "x": -7.26,
        "z": 9.72,
        "width": 11.4,
        "depth": 2.04
      },
      "type": "plaza"
    },
    {
      "id": "BOS_FORECOURT",
      "pixelRect": {
        "x": 66,
        "y": 615,
        "width": 257,
        "height": 30
      },
      "worldRect": {
        "x": -34.86,
        "z": -22.74,
        "width": 30.84,
        "depth": 3.6
      },
      "type": "forecourt"
    },
    {
      "id": "FIRE_APRON",
      "pixelRect": {
        "x": 66,
        "y": 720,
        "width": 257,
        "height": 37
      },
      "worldRect": {
        "x": -34.86,
        "z": -35.76,
        "width": 30.84,
        "depth": 4.44
      },
      "type": "apron"
    },
    {
      "id": "ARENA_FORECOURT",
      "pixelRect": {
        "x": 667,
        "y": 658,
        "width": 243,
        "height": 56
      },
      "worldRect": {
        "x": 36.42,
        "z": -29.46,
        "width": 29.16,
        "depth": 6.72
      },
      "type": "forecourt"
    }
  ],
  "validationRules": {
    "buildingVsNoBuildCorridor": 0,
    "buildingVsBuilding": 0,
    "towerVsNoBuildCorridor": 0,
    "towerVsBuilding": 0,
    "greenVsRoadSurface": 0,
    "parkingVsRoadSurface": 0,
    "touchingEdgesAllowed": true,
    "runtimeValidationRequired": true
  }
};
