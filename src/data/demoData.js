// Auto-extracted from ai-abps.html (reference implementation). DO NOT hand-edit; rerun scripts/extract-data.mjs.
export const DEMO_DATA = {
  "meta": {
    "source": "synthetic_demo",
    "label": "Synthetic Demo Dataset",
    "disclaimer": "Synthetic demo data — not live Indian Railways operational data.",
    "generatedFrom": "ai-abps.html (reference implementation)"
  },
  "DEMO_SNAPSHOT": {
    "tasks": {
      "T102": {
        "title": "T102 · Critical Track Defect",
        "priority": "CRITICAL",
        "department": "Engineering",
        "corridor": "C1",
        "duration": "60 min",
        "due": "Overdue by 3 days",
        "risk": 92,
        "block": "B-042",
        "reason": "High safety criticality, overdue maintenance, high asset importance and potential operational impact."
      },
      "S143": {
        "title": "S143 · Signal Maintenance",
        "priority": "HIGH",
        "department": "S&T",
        "corridor": "C1",
        "duration": "45 min",
        "due": "Due today",
        "risk": 89,
        "block": "B-042",
        "reason": "High asset criticality and located in the same C1 planning area as T102, creating a possible coordination opportunity."
      },
      "O221": {
        "title": "O221 · OHE Inspection",
        "priority": "MEDIUM",
        "department": "Traction",
        "corridor": "C1",
        "duration": "60 min",
        "due": "Due tomorrow",
        "risk": 84,
        "block": "B-042",
        "reason": "Important traction asset inspection. It can potentially be coordinated with other C1 work subject to crew and safety checks."
      },
      "T119": {
        "title": "T119 · Track Inspection",
        "priority": "HIGH",
        "department": "Engineering",
        "corridor": "C3",
        "duration": "90 min",
        "due": "Due tomorrow",
        "risk": 81,
        "block": "B-043",
        "reason": "High-priority inspection requiring a longer work duration. A separate block provides better execution time."
      },
      "S201": {
        "title": "S201 · Routine Signal Check",
        "priority": "LOW",
        "department": "S&T",
        "corridor": "C2",
        "duration": "30 min",
        "due": "Friday",
        "risk": 42,
        "block": "B-041",
        "reason": "Routine work with lower urgency. It can be combined with compatible C2 maintenance."
      },
      "T130": {
        "title": "T130 · Track Fastener Check",
        "priority": "MEDIUM",
        "department": "Engineering",
        "corridor": "C2",
        "duration": "55 min",
        "due": "Friday",
        "risk": 58,
        "block": "B-045",
        "reason": "Preventive maintenance task that can be bundled with signal work in C2."
      },
      "S205": {
        "title": "S205 · Signal Relay Inspection",
        "priority": "MEDIUM",
        "department": "S&T",
        "corridor": "C2",
        "duration": "45 min",
        "due": "Wednesday",
        "risk": 61,
        "block": "B-041",
        "reason": "Signal maintenance compatible with S201 for combined execution."
      },
      "O310": {
        "title": "O310 · OHE Preventive Inspection",
        "priority": "HIGH",
        "department": "Traction",
        "corridor": "C3",
        "duration": "85 min",
        "due": "Tuesday",
        "risk": 76,
        "block": "B-046",
        "reason": "Requires dedicated traction equipment and longer duration window."
      },
      "S210": {
        "title": "S210 · Signal Cabinet Inspection",
        "priority": "MEDIUM",
        "department": "S&T",
        "corridor": "C2",
        "duration": "50 min",
        "due": "Friday",
        "risk": 55,
        "block": "B-045",
        "reason": "Can be combined with track work in same corridor and time window."
      },
      "T140": {
        "title": "T140 · Track Geometry Inspection",
        "priority": "HIGH",
        "department": "Engineering",
        "corridor": "C1",
        "duration": "85 min",
        "due": "Tuesday",
        "risk": 78,
        "block": "B-048",
        "reason": "Requires dedicated engineering crew and uninterrupted track access."
      },
      "T155": {
        "title": "T155 · Track Joint Inspection",
        "priority": "MEDIUM",
        "department": "Engineering",
        "corridor": "C2",
        "duration": "50 min",
        "due": "Wednesday",
        "risk": 52,
        "block": "B-049",
        "reason": "Compatible with signal point check for bundling."
      },
      "S220": {
        "title": "S220 · Signal Point Check",
        "priority": "MEDIUM",
        "department": "S&T",
        "corridor": "C2",
        "duration": "45 min",
        "due": "Wednesday",
        "risk": 48,
        "block": "B-049",
        "reason": "Signal maintenance that pairs well with track joint inspection."
      },
      "S401": {
        "title": "S401 · Signal Testing",
        "priority": "MEDIUM",
        "department": "S&T",
        "corridor": "C4",
        "duration": "50 min",
        "due": "Thursday",
        "risk": 56,
        "block": "B-047",
        "reason": "Signal testing that can be coordinated with cable inspection."
      },
      "S402": {
        "title": "S402 · Signal Cable Inspection",
        "priority": "MEDIUM",
        "department": "S&T",
        "corridor": "C4",
        "duration": "45 min",
        "due": "Thursday",
        "risk": 53,
        "block": "B-047",
        "reason": "Cable work compatible with signal testing in C4."
      },
      "S450": {
        "title": "S450 · Signal Preventive Check",
        "priority": "LOW",
        "department": "S&T",
        "corridor": "C4",
        "duration": "80 min",
        "due": "Friday",
        "risk": 38,
        "block": "B-050",
        "reason": "Lower-priority preventive work kept separate due to duration."
      }
    },
    "trains": [
      {
        "id": "T-204",
        "corridor": "C1",
        "date": "Monday",
        "start": "13:00",
        "end": "13:30",
        "type": "Express"
      },
      {
        "id": "T-211",
        "corridor": "C1",
        "date": "Tuesday",
        "start": "10:30",
        "end": "11:00",
        "type": "Freight"
      },
      {
        "id": "T-305",
        "corridor": "C2",
        "date": "Monday",
        "start": "11:00",
        "end": "11:45",
        "type": "Passenger"
      },
      {
        "id": "T-412",
        "corridor": "C3",
        "date": "Wednesday",
        "start": "11:30",
        "end": "12:00",
        "type": "Express"
      },
      {
        "id": "T-518",
        "corridor": "C2",
        "date": "Friday",
        "start": "11:00",
        "end": "11:30",
        "type": "Goods"
      },
      {
        "id": "T-620",
        "corridor": "C4",
        "date": "Thursday",
        "start": "13:00",
        "end": "13:40",
        "type": "Passenger"
      },
      {
        "id": "T-701",
        "corridor": "C1",
        "date": "Monday",
        "start": "15:00",
        "end": "15:30",
        "type": "Freight"
      },
      {
        "id": "T-805",
        "corridor": "C3",
        "date": "Tuesday",
        "start": "13:30",
        "end": "14:00",
        "type": "Rajdhani"
      }
    ],
    "crew": [
      {
        "name": "Engineering Team 1",
        "department": "Engineering",
        "status": "available",
        "available": 5,
        "required": 4,
        "corridor": "C1",
        "currentBlock": "B-042",
        "subStatus": "Assigned",
        "skills": [
          "Track repair",
          "Inspection",
          "Emergency"
        ]
      },
      {
        "name": "S&T Team 2",
        "department": "S&T",
        "status": "available",
        "available": 3,
        "required": 2,
        "corridor": "C1",
        "currentBlock": "B-042",
        "subStatus": "Assigned",
        "skills": [
          "Signal testing",
          "Relay work",
          "Cable"
        ]
      },
      {
        "name": "Traction Team 3",
        "department": "Traction/OHE",
        "status": "limited",
        "available": 2,
        "required": 3,
        "corridor": "C1",
        "currentBlock": "B-042",
        "subStatus": "On another block",
        "skills": [
          "OHE inspection",
          "Traction repair"
        ]
      },
      {
        "name": "Engineering Team 4",
        "department": "Engineering",
        "status": "available",
        "available": 6,
        "required": 0,
        "corridor": "C3",
        "currentBlock": null,
        "subStatus": "Available now",
        "skills": [
          "Track inspection",
          "Geometry"
        ]
      },
      {
        "name": "S&T Team 5",
        "department": "S&T",
        "status": "available",
        "available": 4,
        "required": 0,
        "corridor": "C2",
        "currentBlock": null,
        "subStatus": "Available now",
        "skills": [
          "Signal cabinet",
          "Point check"
        ]
      },
      {
        "name": "Traction Team 6",
        "department": "Traction/OHE",
        "status": "available",
        "available": 4,
        "required": 2,
        "corridor": "C3",
        "currentBlock": "B-046",
        "subStatus": "Assigned",
        "skills": [
          "OHE preventive",
          "Traction equipment"
        ]
      },
      {
        "name": "Engineering Team 7",
        "department": "Engineering",
        "status": "available",
        "available": 5,
        "required": 1,
        "corridor": "C4",
        "currentBlock": null,
        "subStatus": "Maintenance/inspection",
        "skills": [
          "Track inspection",
          "Track repair"
        ]
      },
      {
        "name": "Traction Team 8",
        "department": "Traction/OHE",
        "status": "unavailable",
        "available": 0,
        "required": 2,
        "corridor": "C4",
        "currentBlock": null,
        "subStatus": "Rest/shift",
        "skills": [
          "OHE preventive"
        ]
      },
      {
        "name": "Engineering Team 9",
        "department": "Engineering",
        "status": "limited",
        "available": 3,
        "required": 4,
        "corridor": "C2",
        "currentBlock": "B-045",
        "subStatus": "On another block",
        "skills": [
          "Track fastener",
          "Joint inspection"
        ]
      },
      {
        "name": "S&T Team 10",
        "department": "S&T",
        "status": "available",
        "available": 3,
        "required": 1,
        "corridor": "C3",
        "currentBlock": null,
        "subStatus": "Available now",
        "skills": [
          "Signal cabinet",
          "Point check",
          "Cable"
        ]
      }
    ],
    "equipment": [
      {
        "name": "Track Inspection Unit",
        "department": "Engineering",
        "corridor": "C2",
        "available": 2,
        "required": 1,
        "status": "AVAILABLE",
        "assignedBlock": null
      },
      {
        "name": "Signal Test Equipment",
        "department": "S&T",
        "corridor": "C1",
        "available": 1,
        "required": 1,
        "status": "AVAILABLE",
        "assignedBlock": null
      },
      {
        "name": "OHE Maintenance Unit",
        "department": "Traction/OHE",
        "corridor": "C1",
        "available": 1,
        "required": 1,
        "status": "RESERVED",
        "assignedBlock": "B-042"
      },
      {
        "name": "Rail Grinding Machine",
        "department": "Engineering",
        "corridor": "C3",
        "available": 1,
        "required": 0,
        "status": "AVAILABLE",
        "assignedBlock": null
      },
      {
        "name": "Ultrasonic Flaw Detector",
        "department": "Engineering",
        "corridor": "C2",
        "available": 2,
        "required": 1,
        "status": "AVAILABLE",
        "assignedBlock": null
      },
      {
        "name": "Track Geometry Car",
        "department": "Engineering",
        "corridor": "C1",
        "available": 1,
        "required": 2,
        "status": "LIMITED",
        "assignedBlock": "B-048"
      },
      {
        "name": "Diesel Locomotive (Works)",
        "department": "Engineering",
        "corridor": "C3",
        "available": 0,
        "required": 1,
        "status": "UNAVAILABLE",
        "assignedBlock": "B-043"
      }
    ],
    "blocks": {
      "B-041": {
        "corridor": "C2",
        "date": "Monday",
        "window": "10:00–12:00",
        "duration": "120 min",
        "utilization": "82%",
        "type": "COMBINED",
        "tasks": [
          {
            "id": "S201",
            "name": "Routine Signal Check",
            "department": "S&T",
            "duration": "30 min"
          },
          {
            "id": "S205",
            "name": "Signal Relay Inspection",
            "department": "S&T",
            "duration": "45 min"
          }
        ],
        "reason": "Both tasks are located within Corridor C2 and can be completed within the available maintenance window."
      },
      "B-042": {
        "corridor": "C1",
        "date": "Monday",
        "window": "12:00–14:00",
        "duration": "120 min",
        "utilization": "92%",
        "type": "COMBINED",
        "tasks": [
          {
            "id": "T102",
            "name": "Track Defect Repair",
            "department": "Engineering",
            "duration": "60 min"
          },
          {
            "id": "S143",
            "name": "Signal Maintenance",
            "department": "S&T",
            "duration": "45 min"
          },
          {
            "id": "O221",
            "name": "OHE Inspection",
            "department": "Traction",
            "duration": "60 min"
          }
        ],
        "reason": "These tasks are associated with the same C1 planning area. The AI identified an opportunity for coordinated execution after checking location, available duration, resources and operational constraints."
      },
      "B-043": {
        "corridor": "C3",
        "date": "Wednesday",
        "window": "10:00–12:00",
        "duration": "120 min",
        "utilization": "75%",
        "type": "SINGLE",
        "tasks": [
          {
            "id": "T119",
            "name": "Track Inspection",
            "department": "Engineering",
            "duration": "90 min"
          }
        ],
        "reason": "T119 requires a longer uninterrupted work period. Keeping it separate reduces execution risk and provides operational buffer."
      },
      "B-045": {
        "corridor": "C2",
        "date": "Friday",
        "window": "10:00–12:00",
        "duration": "120 min",
        "utilization": "88%",
        "type": "COMBINED",
        "tasks": [
          {
            "id": "S210",
            "name": "Signal Cabinet Inspection",
            "department": "S&T",
            "duration": "50 min"
          },
          {
            "id": "T130",
            "name": "Track Fastener Check",
            "department": "Engineering",
            "duration": "55 min"
          }
        ],
        "reason": "These two C2 tasks are geographically close and can share the same maintenance window without exceeding available block capacity."
      },
      "B-046": {
        "corridor": "C3",
        "date": "Tuesday",
        "window": "12:00–14:00",
        "duration": "120 min",
        "utilization": "70%",
        "type": "SINGLE",
        "tasks": [
          {
            "id": "O310",
            "name": "OHE Preventive Inspection",
            "department": "Traction",
            "duration": "85 min"
          }
        ],
        "reason": "The task requires dedicated traction equipment, so the optimizer keeps it separate from other work."
      },
      "B-047": {
        "corridor": "C4",
        "date": "Thursday",
        "window": "12:00–14:00",
        "duration": "120 min",
        "utilization": "85%",
        "type": "COMBINED",
        "tasks": [
          {
            "id": "S401",
            "name": "Signal Testing",
            "department": "S&T",
            "duration": "50 min"
          },
          {
            "id": "S402",
            "name": "Signal Cable Inspection",
            "department": "S&T",
            "duration": "45 min"
          }
        ],
        "reason": "Both signal tasks require the same department and are located in the same C4 work area."
      },
      "B-048": {
        "corridor": "C1",
        "date": "Tuesday",
        "window": "15:00–17:00",
        "duration": "120 min",
        "utilization": "72%",
        "type": "SINGLE",
        "tasks": [
          {
            "id": "T140",
            "name": "Track Geometry Inspection",
            "department": "Engineering",
            "duration": "85 min"
          }
        ],
        "reason": "The inspection requires a dedicated engineering crew and uninterrupted access to the track."
      },
      "B-049": {
        "corridor": "C2",
        "date": "Wednesday",
        "window": "15:00–17:00",
        "duration": "120 min",
        "utilization": "86%",
        "type": "COMBINED",
        "tasks": [
          {
            "id": "T155",
            "name": "Track Joint Inspection",
            "department": "Engineering",
            "duration": "50 min"
          },
          {
            "id": "S220",
            "name": "Signal Point Check",
            "department": "S&T",
            "duration": "45 min"
          }
        ],
        "reason": "Both tasks are within the C2 planning area and fit comfortably inside the available window."
      },
      "B-050": {
        "corridor": "C4",
        "date": "Friday",
        "window": "15:00–17:00",
        "duration": "120 min",
        "utilization": "68%",
        "type": "SINGLE",
        "tasks": [
          {
            "id": "S450",
            "name": "Signal Preventive Check",
            "department": "S&T",
            "duration": "80 min"
          }
        ],
        "reason": "Lower-priority preventive work is kept separate because there is no strong bundling benefit with nearby tasks."
      }
    },
    "approvals": {},
    "audit": []
  },
  "taskData": {
    "T102": {
      "title": "T102 · Critical Track Defect",
      "priority": "CRITICAL",
      "department": "Engineering",
      "corridor": "C1",
      "duration": "60 min",
      "due": "Overdue by 3 days",
      "risk": 92,
      "block": "B-042",
      "reason": "High safety criticality, overdue maintenance, high asset importance and potential operational impact."
    },
    "S143": {
      "title": "S143 · Signal Maintenance",
      "priority": "HIGH",
      "department": "S&T",
      "corridor": "C1",
      "duration": "45 min",
      "due": "Due today",
      "risk": 89,
      "block": "B-042",
      "reason": "High asset criticality and located in the same C1 planning area as T102, creating a possible coordination opportunity."
    },
    "O221": {
      "title": "O221 · OHE Inspection",
      "priority": "MEDIUM",
      "department": "Traction",
      "corridor": "C1",
      "duration": "60 min",
      "due": "Due tomorrow",
      "risk": 84,
      "block": "B-042",
      "reason": "Important traction asset inspection. It can potentially be coordinated with other C1 work subject to crew and safety checks."
    },
    "T119": {
      "title": "T119 · Track Inspection",
      "priority": "HIGH",
      "department": "Engineering",
      "corridor": "C3",
      "duration": "90 min",
      "due": "Due tomorrow",
      "risk": 81,
      "block": "B-043",
      "reason": "High-priority inspection requiring a longer work duration. A separate block provides better execution time."
    },
    "S201": {
      "title": "S201 · Routine Signal Check",
      "priority": "LOW",
      "department": "S&T",
      "corridor": "C2",
      "duration": "30 min",
      "due": "Friday",
      "risk": 42,
      "block": "B-041",
      "reason": "Routine work with lower urgency. It can be combined with compatible C2 maintenance."
    },
    "T130": {
      "title": "T130 · Track Fastener Check",
      "priority": "MEDIUM",
      "department": "Engineering",
      "corridor": "C2",
      "duration": "55 min",
      "due": "Friday",
      "risk": 58,
      "block": "B-045",
      "reason": "Preventive maintenance task that can be bundled with signal work in C2."
    },
    "S205": {
      "title": "S205 · Signal Relay Inspection",
      "priority": "MEDIUM",
      "department": "S&T",
      "corridor": "C2",
      "duration": "45 min",
      "due": "Wednesday",
      "risk": 61,
      "block": "B-041",
      "reason": "Signal maintenance compatible with S201 for combined execution."
    },
    "O310": {
      "title": "O310 · OHE Preventive Inspection",
      "priority": "HIGH",
      "department": "Traction",
      "corridor": "C3",
      "duration": "85 min",
      "due": "Tuesday",
      "risk": 76,
      "block": "B-046",
      "reason": "Requires dedicated traction equipment and longer duration window."
    },
    "S210": {
      "title": "S210 · Signal Cabinet Inspection",
      "priority": "MEDIUM",
      "department": "S&T",
      "corridor": "C2",
      "duration": "50 min",
      "due": "Friday",
      "risk": 55,
      "block": "B-045",
      "reason": "Can be combined with track work in same corridor and time window."
    },
    "T140": {
      "title": "T140 · Track Geometry Inspection",
      "priority": "HIGH",
      "department": "Engineering",
      "corridor": "C1",
      "duration": "85 min",
      "due": "Tuesday",
      "risk": 78,
      "block": null,
      "reason": "Requires dedicated engineering crew and uninterrupted track access."
    },
    "T155": {
      "title": "T155 · Track Joint Inspection",
      "priority": "MEDIUM",
      "department": "Engineering",
      "corridor": "C2",
      "duration": "50 min",
      "due": "Wednesday",
      "risk": 52,
      "block": "B-049",
      "reason": "Compatible with signal point check for bundling."
    },
    "S220": {
      "title": "S220 · Signal Point Check",
      "priority": "MEDIUM",
      "department": "S&T",
      "corridor": "C2",
      "duration": "45 min",
      "due": "Wednesday",
      "risk": 48,
      "block": "B-049",
      "reason": "Signal maintenance that pairs well with track joint inspection."
    },
    "S401": {
      "title": "S401 · Signal Testing",
      "priority": "MEDIUM",
      "department": "S&T",
      "corridor": "C4",
      "duration": "50 min",
      "due": "Thursday",
      "risk": 56,
      "block": "B-047",
      "reason": "Signal testing that can be coordinated with cable inspection."
    },
    "S402": {
      "title": "S402 · Signal Cable Inspection",
      "priority": "MEDIUM",
      "department": "S&T",
      "corridor": "C4",
      "duration": "45 min",
      "due": "Thursday",
      "risk": 53,
      "block": "B-047",
      "reason": "Cable work compatible with signal testing in C4."
    },
    "S450": {
      "title": "S450 · Signal Preventive Check",
      "priority": "LOW",
      "department": "S&T",
      "corridor": "C4",
      "duration": "80 min",
      "due": "Friday",
      "risk": 38,
      "block": null,
      "reason": "Lower-priority preventive work kept separate due to duration."
    }
  },
  "blockData": {
    "B-041": {
      "corridor": "C2",
      "date": "Monday",
      "window": "10:00–12:00",
      "duration": "120 min",
      "utilization": "82%",
      "type": "COMBINED",
      "tasks": [
        {
          "id": "S201",
          "name": "Routine Signal Check",
          "department": "S&T",
          "duration": "30 min"
        },
        {
          "id": "S205",
          "name": "Signal Relay Inspection",
          "department": "S&T",
          "duration": "45 min"
        }
      ],
      "reason": "Both tasks are located within Corridor C2 and can be completed within the available maintenance window."
    },
    "B-042": {
      "corridor": "C1",
      "date": "Monday",
      "window": "12:00–14:00",
      "duration": "120 min",
      "utilization": "92%",
      "type": "COMBINED",
      "tasks": [
        {
          "id": "T102",
          "name": "Track Defect Repair",
          "department": "Engineering",
          "duration": "60 min"
        },
        {
          "id": "S143",
          "name": "Signal Maintenance",
          "department": "S&T",
          "duration": "45 min"
        },
        {
          "id": "O221",
          "name": "OHE Inspection",
          "department": "Traction",
          "duration": "60 min"
        }
      ],
      "reason": "These tasks are associated with the same C1 planning area. The AI identified an opportunity for coordinated execution after checking location, available duration, resources and operational constraints."
    },
    "B-043": {
      "corridor": "C3",
      "date": "Wednesday",
      "window": "10:00–12:00",
      "duration": "120 min",
      "utilization": "75%",
      "type": "SINGLE",
      "tasks": [
        {
          "id": "T119",
          "name": "Track Inspection",
          "department": "Engineering",
          "duration": "90 min"
        }
      ],
      "reason": "T119 requires a longer uninterrupted work period. Keeping it separate reduces execution risk and provides operational buffer."
    },
    "B-045": {
      "corridor": "C2",
      "date": "Friday",
      "window": "10:00–12:00",
      "duration": "120 min",
      "utilization": "88%",
      "type": "COMBINED",
      "tasks": [
        {
          "id": "S210",
          "name": "Signal Cabinet Inspection",
          "department": "S&T",
          "duration": "50 min"
        },
        {
          "id": "T130",
          "name": "Track Fastener Check",
          "department": "Engineering",
          "duration": "55 min"
        }
      ],
      "reason": "These two C2 tasks are geographically close and can share the same maintenance window without exceeding available block capacity."
    },
    "B-046": {
      "corridor": "C3",
      "date": "Tuesday",
      "window": "12:00–14:00",
      "duration": "120 min",
      "utilization": "70%",
      "type": "SINGLE",
      "tasks": [
        {
          "id": "O310",
          "name": "OHE Preventive Inspection",
          "department": "Traction",
          "duration": "85 min"
        }
      ],
      "reason": "The task requires dedicated traction equipment, so the optimizer keeps it separate from other work."
    },
    "B-047": {
      "corridor": "C4",
      "date": "Thursday",
      "window": "12:00–14:00",
      "duration": "120 min",
      "utilization": "85%",
      "type": "COMBINED",
      "tasks": [
        {
          "id": "S401",
          "name": "Signal Testing",
          "department": "S&T",
          "duration": "50 min"
        },
        {
          "id": "S402",
          "name": "Signal Cable Inspection",
          "department": "S&T",
          "duration": "45 min"
        }
      ],
      "reason": "Both signal tasks require the same department and are located in the same C4 work area."
    },
    "B-048": {
      "corridor": "C1",
      "date": "Tuesday",
      "window": "15:00–17:00",
      "duration": "120 min",
      "utilization": "72%",
      "type": "SINGLE",
      "tasks": [
        {
          "id": "T140",
          "name": "Track Geometry Inspection",
          "department": "Engineering",
          "duration": "85 min"
        }
      ],
      "reason": "The inspection requires a dedicated engineering crew and uninterrupted access to the track."
    },
    "B-049": {
      "corridor": "C2",
      "date": "Wednesday",
      "window": "15:00–17:00",
      "duration": "120 min",
      "utilization": "86%",
      "type": "COMBINED",
      "tasks": [
        {
          "id": "T155",
          "name": "Track Joint Inspection",
          "department": "Engineering",
          "duration": "50 min"
        },
        {
          "id": "S220",
          "name": "Signal Point Check",
          "department": "S&T",
          "duration": "45 min"
        }
      ],
      "reason": "Both tasks are within the C2 planning area and fit comfortably inside the available window."
    },
    "B-050": {
      "corridor": "C4",
      "date": "Friday",
      "window": "15:00–17:00",
      "duration": "120 min",
      "utilization": "68%",
      "type": "SINGLE",
      "tasks": [
        {
          "id": "S450",
          "name": "Signal Preventive Check",
          "department": "S&T",
          "duration": "80 min"
        }
      ],
      "reason": "Lower-priority preventive work is kept separate because there is no strong bundling benefit with nearby tasks."
    }
  },
  "crewData": [
    {
      "name": "Engineering Team 1",
      "department": "Engineering",
      "status": "available",
      "available": 5,
      "required": 4,
      "corridor": "C1",
      "currentBlock": "B-042",
      "subStatus": "Assigned",
      "skills": [
        "Track repair",
        "Inspection",
        "Emergency"
      ]
    },
    {
      "name": "S&T Team 2",
      "department": "S&T",
      "status": "available",
      "available": 3,
      "required": 2,
      "corridor": "C1",
      "currentBlock": "B-042",
      "subStatus": "Assigned",
      "skills": [
        "Signal testing",
        "Relay work",
        "Cable"
      ]
    },
    {
      "name": "Traction Team 3",
      "department": "Traction/OHE",
      "status": "limited",
      "available": 2,
      "required": 3,
      "corridor": "C1",
      "currentBlock": "B-042",
      "subStatus": "On another block",
      "skills": [
        "OHE inspection",
        "Traction repair"
      ]
    },
    {
      "name": "Engineering Team 4",
      "department": "Engineering",
      "status": "available",
      "available": 6,
      "required": 0,
      "corridor": "C3",
      "currentBlock": null,
      "subStatus": "Available now",
      "skills": [
        "Track inspection",
        "Geometry"
      ]
    },
    {
      "name": "S&T Team 5",
      "department": "S&T",
      "status": "available",
      "available": 4,
      "required": 0,
      "corridor": "C2",
      "currentBlock": null,
      "subStatus": "Available now",
      "skills": [
        "Signal cabinet",
        "Point check"
      ]
    },
    {
      "name": "Traction Team 6",
      "department": "Traction/OHE",
      "status": "available",
      "available": 4,
      "required": 2,
      "corridor": "C3",
      "currentBlock": "B-046",
      "subStatus": "Assigned",
      "skills": [
        "OHE preventive",
        "Traction equipment"
      ]
    },
    {
      "name": "Engineering Team 7",
      "department": "Engineering",
      "status": "available",
      "available": 5,
      "required": 1,
      "corridor": "C4",
      "currentBlock": null,
      "subStatus": "Maintenance/inspection",
      "skills": [
        "Track inspection",
        "Track repair"
      ]
    },
    {
      "name": "Traction Team 8",
      "department": "Traction/OHE",
      "status": "unavailable",
      "available": 0,
      "required": 2,
      "corridor": "C4",
      "currentBlock": null,
      "subStatus": "Rest/shift",
      "skills": [
        "OHE preventive"
      ]
    },
    {
      "name": "Engineering Team 9",
      "department": "Engineering",
      "status": "limited",
      "available": 3,
      "required": 4,
      "corridor": "C2",
      "currentBlock": "B-045",
      "subStatus": "On another block",
      "skills": [
        "Track fastener",
        "Joint inspection"
      ]
    },
    {
      "name": "S&T Team 10",
      "department": "S&T",
      "status": "available",
      "available": 3,
      "required": 1,
      "corridor": "C3",
      "currentBlock": null,
      "subStatus": "Available now",
      "skills": [
        "Signal cabinet",
        "Point check",
        "Cable"
      ]
    }
  ],
  "equipmentData": [
    {
      "name": "Track Inspection Unit",
      "department": "Engineering",
      "corridor": "C2",
      "available": 2,
      "required": 1,
      "status": "AVAILABLE",
      "assignedBlock": null
    },
    {
      "name": "Signal Test Equipment",
      "department": "S&T",
      "corridor": "C1",
      "available": 1,
      "required": 1,
      "status": "AVAILABLE",
      "assignedBlock": null
    },
    {
      "name": "OHE Maintenance Unit",
      "department": "Traction/OHE",
      "corridor": "C1",
      "available": 1,
      "required": 1,
      "status": "RESERVED",
      "assignedBlock": "B-042"
    },
    {
      "name": "Rail Grinding Machine",
      "department": "Engineering",
      "corridor": "C3",
      "available": 1,
      "required": 0,
      "status": "AVAILABLE",
      "assignedBlock": null
    },
    {
      "name": "Ultrasonic Flaw Detector",
      "department": "Engineering",
      "corridor": "C2",
      "available": 2,
      "required": 1,
      "status": "AVAILABLE",
      "assignedBlock": null
    },
    {
      "name": "Track Geometry Car",
      "department": "Engineering",
      "corridor": "C1",
      "available": 1,
      "required": 2,
      "status": "LIMITED",
      "assignedBlock": "B-048"
    },
    {
      "name": "Diesel Locomotive (Works)",
      "department": "Engineering",
      "corridor": "C3",
      "available": 0,
      "required": 1,
      "status": "UNAVAILABLE",
      "assignedBlock": "B-043"
    }
  ],
  "conflictsByDefault": [
    {
      "type": "train",
      "task": "T102",
      "severity": "critical",
      "description": "Requested maintenance window overlaps with scheduled train movement",
      "resolution": "AI alternative: 12:00–14:00 on Corridor C1"
    },
    {
      "type": "resource",
      "task": "O221",
      "severity": "critical",
      "description": "Traction Team 3 does not have sufficient crew",
      "resolution": "AI suggested resource reallocation from reserve"
    },
    {
      "type": "duration",
      "task": "S143",
      "severity": "warning",
      "description": "Estimated duration may leave limited buffer",
      "resolution": "Monitor execution time closely"
    },
    {
      "type": "equipment",
      "task": "T119",
      "severity": "warning",
      "description": "Track Inspection Unit reserved for another task",
      "resolution": "Use alternative equipment or reschedule"
    }
  ],
  "presentationSlides": [
    {
      "title": "AI-ABPS",
      "subtitle": "AI-Powered Automatic Block Planning System for Indian Railways",
      "icon": "<i data-lucide=\"train-front\" style=\"width:14px;height:14px;vertical-align:middle;\"></i>"
    },
    {
      "title": "The Problem",
      "subtitle": "Decentralized planning, fragmented data, manual scheduling, poor coordination",
      "icon": "<i data-lucide=\"alert-triangle\" style=\"width:14px;height:14px;vertical-align:middle;\"></i>"
    },
    {
      "title": "Our Solution",
      "subtitle": "Unified intelligence layer integrating Engineering, S&T, and Traction",
      "icon": "<i data-lucide=\"bot\" style=\"width:14px;height:14px;vertical-align:middle;\"></i>"
    },
    {
      "title": "AI Optimization",
      "subtitle": "Priority scoring, conflict detection, task bundling, constraint optimization",
      "icon": "<i data-lucide=\"zap\" style=\"width:14px;height:14px;vertical-align:middle;\"></i>"
    },
    {
      "title": "Key Benefits",
      "subtitle": "Better block utilization, reduced downtime, improved coordination, explainable AI",
      "icon": "<i data-lucide=\"trending-up\" style=\"width:14px;height:14px;vertical-align:middle;\"></i>"
    },
    {
      "title": "Human in Control",
      "subtitle": "All AI recommendations subject to authorized human approval",
      "icon": "<i data-lucide=\"check\" style=\"width:14px;height:14px;vertical-align:middle;\"></i>"
    }
  ],
  "trainSchedule": [
    {
      "id": "T-204",
      "corridor": "C1",
      "date": "Monday",
      "start": "13:00",
      "end": "13:30",
      "type": "Express"
    },
    {
      "id": "T-211",
      "corridor": "C1",
      "date": "Tuesday",
      "start": "10:30",
      "end": "11:00",
      "type": "Freight"
    },
    {
      "id": "T-305",
      "corridor": "C2",
      "date": "Monday",
      "start": "11:00",
      "end": "11:45",
      "type": "Passenger"
    },
    {
      "id": "T-412",
      "corridor": "C3",
      "date": "Wednesday",
      "start": "11:30",
      "end": "12:00",
      "type": "Express"
    },
    {
      "id": "T-518",
      "corridor": "C2",
      "date": "Friday",
      "start": "11:00",
      "end": "11:30",
      "type": "Goods"
    },
    {
      "id": "T-620",
      "corridor": "C4",
      "date": "Thursday",
      "start": "13:00",
      "end": "13:40",
      "type": "Passenger"
    },
    {
      "id": "T-701",
      "corridor": "C1",
      "date": "Monday",
      "start": "15:00",
      "end": "15:30",
      "type": "Freight"
    },
    {
      "id": "T-805",
      "corridor": "C3",
      "date": "Tuesday",
      "start": "13:30",
      "end": "14:00",
      "type": "Rajdhani"
    }
  ],
  "demoAssets": [
    {
      "id": "A-01",
      "type": "Track Section",
      "deptName": "Engineering",
      "location": "C1 (S1-A → S1-C)",
      "condition": "Good",
      "criticality": "High",
      "lastMaintenance": "45 days ago",
      "riskScore": 72,
      "corridor": "C1"
    },
    {
      "id": "A-02",
      "type": "Points & Crossings",
      "deptName": "Engineering",
      "location": "C1 (S1-A → S1-C)",
      "condition": "Fair",
      "criticality": "Medium",
      "lastMaintenance": "45 days ago",
      "riskScore": 55,
      "corridor": "C1"
    },
    {
      "id": "A-03",
      "type": "Signal System",
      "deptName": "S&T",
      "location": "C1 (S1-A → S1-C)",
      "condition": "Good",
      "criticality": "Critical",
      "lastMaintenance": "45 days ago",
      "riskScore": 68,
      "corridor": "C1"
    },
    {
      "id": "A-04",
      "type": "OHE Equipment",
      "deptName": "Traction",
      "location": "C1 (S1-A → S1-C)",
      "condition": "Fair",
      "criticality": "Medium",
      "lastMaintenance": "45 days ago",
      "riskScore": 50,
      "corridor": "C1"
    },
    {
      "id": "A-05",
      "type": "Track Section",
      "deptName": "Engineering",
      "location": "C2 (S2-A → S2-C)",
      "condition": "Good",
      "criticality": "High",
      "lastMaintenance": "45 days ago",
      "riskScore": 72,
      "corridor": "C2"
    },
    {
      "id": "A-06",
      "type": "Points & Crossings",
      "deptName": "Engineering",
      "location": "C2 (S2-A → S2-C)",
      "condition": "Fair",
      "criticality": "Medium",
      "lastMaintenance": "45 days ago",
      "riskScore": 55,
      "corridor": "C2"
    },
    {
      "id": "A-07",
      "type": "Signal System",
      "deptName": "S&T",
      "location": "C2 (S2-A → S2-C)",
      "condition": "Good",
      "criticality": "Critical",
      "lastMaintenance": "45 days ago",
      "riskScore": 68,
      "corridor": "C2"
    },
    {
      "id": "A-08",
      "type": "OHE Equipment",
      "deptName": "Traction",
      "location": "C2 (S2-A → S2-C)",
      "condition": "Fair",
      "criticality": "Medium",
      "lastMaintenance": "45 days ago",
      "riskScore": 50,
      "corridor": "C2"
    },
    {
      "id": "A-09",
      "type": "Track Section",
      "deptName": "Engineering",
      "location": "C3 (S3-A → S3-C)",
      "condition": "Good",
      "criticality": "High",
      "lastMaintenance": "45 days ago",
      "riskScore": 72,
      "corridor": "C3"
    },
    {
      "id": "A-10",
      "type": "Points & Crossings",
      "deptName": "Engineering",
      "location": "C3 (S3-A → S3-C)",
      "condition": "Fair",
      "criticality": "Medium",
      "lastMaintenance": "45 days ago",
      "riskScore": 55,
      "corridor": "C3"
    },
    {
      "id": "A-11",
      "type": "Signal System",
      "deptName": "S&T",
      "location": "C3 (S3-A → S3-C)",
      "condition": "Good",
      "criticality": "Critical",
      "lastMaintenance": "45 days ago",
      "riskScore": 68,
      "corridor": "C3"
    },
    {
      "id": "A-12",
      "type": "OHE Equipment",
      "deptName": "Traction",
      "location": "C3 (S3-A → S3-C)",
      "condition": "Fair",
      "criticality": "Medium",
      "lastMaintenance": "45 days ago",
      "riskScore": 50,
      "corridor": "C3"
    },
    {
      "id": "A-13",
      "type": "Track Section",
      "deptName": "Engineering",
      "location": "C4 (S4-A → S4-C)",
      "condition": "Good",
      "criticality": "High",
      "lastMaintenance": "45 days ago",
      "riskScore": 72,
      "corridor": "C4"
    },
    {
      "id": "A-14",
      "type": "Points & Crossings",
      "deptName": "Engineering",
      "location": "C4 (S4-A → S4-C)",
      "condition": "Fair",
      "criticality": "Medium",
      "lastMaintenance": "45 days ago",
      "riskScore": 55,
      "corridor": "C4"
    },
    {
      "id": "A-15",
      "type": "Signal System",
      "deptName": "S&T",
      "location": "C4 (S4-A → S4-C)",
      "condition": "Good",
      "criticality": "Critical",
      "lastMaintenance": "45 days ago",
      "riskScore": 68,
      "corridor": "C4"
    },
    {
      "id": "A-16",
      "type": "OHE Equipment",
      "deptName": "Traction",
      "location": "C4 (S4-A → S4-C)",
      "condition": "Fair",
      "criticality": "Medium",
      "lastMaintenance": "45 days ago",
      "riskScore": 50,
      "corridor": "C4"
    }
  ],
  "networkDemo": {
    "label": "Nashik Road · Central Railway",
    "sat": {
      "lng0": 73.8425,
      "lat0": 19.9491,
      "lonSpan": 0.05
    },
    "stations": [
      {
        "id": "S1-A",
        "lat": 19.957,
        "lng": 73.829
      },
      {
        "id": "S1-B",
        "lat": 19.949,
        "lng": 73.831
      },
      {
        "id": "S1-C",
        "lat": 19.941,
        "lng": 73.829
      },
      {
        "id": "S2-A",
        "lat": 19.957,
        "lng": 73.843
      },
      {
        "id": "S2-B",
        "lat": 19.9495,
        "lng": 73.8435
      },
      {
        "id": "S2-C",
        "lat": 19.94,
        "lng": 73.843
      },
      {
        "id": "S3-A",
        "lat": 19.957,
        "lng": 73.856
      },
      {
        "id": "S3-B",
        "lat": 19.949,
        "lng": 73.855
      },
      {
        "id": "S3-C",
        "lat": 19.9395,
        "lng": 73.8565
      },
      {
        "id": "S4-A",
        "lat": 19.945,
        "lng": 73.851
      },
      {
        "id": "S4-B",
        "lat": 19.951,
        "lng": 73.853
      }
    ],
    "corridors": [
      {
        "id": "C1",
        "color": "#38bdf8",
        "stations": [
          "S1-A",
          "S1-B",
          "S1-C"
        ],
        "coordinates": [
          [19.96, 73.8288],
          [19.957, 73.829],
          [19.949, 73.831],
          [19.941, 73.829],
          [19.9385, 73.8289]
        ]
      },
      {
        "id": "C2",
        "color": "#34d399",
        "stations": [
          "S2-A",
          "S2-B",
          "S2-C"
        ],
        "coordinates": [
          [19.96, 73.8428],
          [19.957, 73.843],
          [19.9495, 73.8435],
          [19.94, 73.843],
          [19.9375, 73.8432]
        ]
      },
      {
        "id": "C3",
        "color": "#fbbf24",
        "stations": [
          "S3-A",
          "S3-B",
          "S3-C"
        ],
        "coordinates": [
          [19.96, 73.8562],
          [19.957, 73.856],
          [19.949, 73.855],
          [19.9395, 73.8565],
          [19.937, 73.8568]
        ]
      },
      {
        "id": "C4",
        "color": "#a78bfa",
        "stations": [
          "S2-C",
          "S4-A",
          "S4-B"
        ],
        "coordinates": [
          [19.94, 73.843],
          [19.945, 73.851],
          [19.951, 73.853],
          [19.953, 73.8535]
        ]
      }
    ],
    "blocks": [
      {
        "id": "B-041",
        "corridor": "C2",
        "from": "S2-A",
        "to": "S2-B",
      },
      {
        "id": "B-042",
        "corridor": "C1",
        "from": "S1-A",
        "to": "S1-B",
      },
      {
        "id": "B-043",
        "corridor": "C3",
        "from": "S3-A",
        "to": "S3-B",
      },
      {
        "id": "B-045",
        "corridor": "C2",
        "from": "S2-B",
        "to": "S2-C",
      },
      {
        "id": "B-046",
        "corridor": "C3",
        "from": "S3-B",
        "to": "S3-C",
      },
      {
        "id": "B-047",
        "corridor": "C4",
        "from": "S2-C",
        "to": "S4-A",
      },
      {
        "id": "B-048",
        "corridor": "C1",
        "from": "S1-B",
        "to": "S1-C",
      },
      {
        "id": "B-049",
        "corridor": "C2",
        "from": "S2-B",
        "to": "S2-C",
      },
      {
        "id": "B-050",
        "corridor": "C4",
        "from": "S4-A",
        "to": "S4-B",
      }
    ]
  }
};
