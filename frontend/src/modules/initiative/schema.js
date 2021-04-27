import { UIStore } from "../../store";
import specificAreasOptions from "../events/specific-areas.json";

const { regionOptions, geoCoverageTypeOptions } = UIStore.currentState;

export const schema = {
  type: "object",
  version: "1",
  properties: {
    S1: {
      title: "SUBMITTER",
      type: "object",
      depend: {
        id: "tabs",
        value: ["S1"],
      },
      required: ["S1_1"],
      properties: {
        S1_1: {
          title:
            "1. Are you submitting as an individual or on behalf of an Entity?",
          type: "string",
          enum: ["1-0", "1-1"],
          enumNames: ["As an individual", "On behalf of an entity"],
        },
      },
    },
    S2: {
      title: "TYPE OF INITIATIVE",
      type: "object",
      depend: {
        id: "tabs",
        value: ["S2"],
      },
      properties: {
        S2_G1: {
          title: "G1. General",
          type: "object",
          depend: {
            id: "steps",
            value: 0,
          },
          required: [
            "S2_G1_2",
            "S2_G1_3",
            "S2_G1_4",
            "S2_G1_4.1.1",
            "S2_G1_4.1.2",
            "S2_G1_4.2.1",
            "S2_G1_4.2.2",
            "S2_G1_4.3.1",
            "S2_G1_4.3.2",
            "S2_G1_4.4.1",
            "S2_G1_4.4.2",
            "S2_G1_4.4.3",
            "S2_G1_4.4.4",
            "S2_G1_4.4.5",
          ],
          properties: {
            S2_G1_2: {
              title:
                "2. Initiative Title. Please enter a name/title for this Initiative.",
              type: "string",
            },
            S2_G1_3: {
              title:
                "3. Short Summary. Please provide a very short summary of the Initiative (approx. 200 words).",
              type: "string",
            },
            S2_G1_4: {
              title:
                "4. Type of initiative. What is the MAIN focus of the initiative? (Please tick ALL that apply).",
              type: "array",
              dependencies: [
                {
                  value: ["4-0"],
                  questions: ["S2_G1_4.1.1", "S2_G1_4.1.2"],
                },
                {
                  value: ["4-1"],
                  questions: ["S2_G1_4.2.1", "S2_G1_4.2.2"],
                },
                {
                  value: ["4-2"],
                  questions: ["S2_G1_4.3.1", "S2_G1_4.3.2"],
                },
                {
                  value: ["4-3"],
                  questions: [
                    "S2_G1_4.4.1",
                    "S2_G1_4.4.2",
                    "S2_G1_4.4.3",
                    "S2_G1_4.4.4",
                    "S2_G1_4.4.5",
                  ],
                },
              ],
              items: {
                enum: ["4-0", "4-1", "4-2", "4-3"],
                enumNames: [
                  "LEGISLATION, STANDARDS, RULES (e.g., agreeing new or changing rules or standards that others should comply with, new regulation, agreements, policies, economic instruments etc. including voluntary commitments).",
                  "WORKING WITH PEOPLE (encouraging or enabling others, e.g., education, training, communication, awareness raising, behaviour change programmes).",
                  "TECHNOLOGY and PROCESSES (new technical developments/innovation, e.g., research and development, new product design, new materials, processes etc., changes in practice, operations, environmental management and planning).",
                  "MONITORING and ANALYSIS (collecting evidence around plastic discharge to the ocean/waterways, e.g., monitoring, analysis).",
                ],
              },
              uniqueItems: true,
            },
            "S2_G1_4.1.1": {
              title:
                "4.1.1. Legislation, Standards and Rules. You have selected legislation, standards and rules as the type of initiative. What did the initiative specifically involve? (Please tick ALL that apply):",
              type: "array",
              dependencies: [
                {
                  value: ["4.1.1-10"],
                  questions: ["S2_G1_4.1.2"],
                },
              ],
              depend: {
                id: "S2_G1_4",
                value: ["4-0"],
              },
              items: {
                enum: [
                  "4.1.1-0",
                  "4.1.1-1",
                  "4.1.1-2",
                  "4.1.1-3",
                  "4.1.1-4",
                  "4.1.1-5",
                  "4.1.1-6",
                  "4.1.1-7",
                  "4.1.1-8",
                  "4.1.1-9",
                  "4.1.1-10",
                ],
                enumNames: [
                  "Official agreements",
                  "Policy change or development",
                  "High-level strategy",
                  "Legislation or regulations",
                  "Voluntary commitments",
                  "New standard(s) or guideline(s)",
                  "Change in taxes/subsidies",
                  "Subsidy/financial incentives",
                  "Ban(s)",
                  "Package of measures combining incentives and infrastructure (e.g. deposit reward schemes)",
                  "Other",
                ],
              },
              uniqueItems: true,
            },
            "S2_G1_4.1.2": {
              title: '4.1.2. If you selected "Other", please specify',
              type: "string",
              depend: {
                id: "S2_G1_4.1.1",
                value: ["4.1.1-10"],
              },
            },
            "S2_G1_4.2.1": {
              title:
                "4.2.1. Working with People. You have chosen working with people as the type of initiative. What did the initiative specifically involve? (Please tick ALL that apply):",
              type: "array",
              dependencies: [
                {
                  value: ["4.2.1-18"],
                  questions: ["S2_G1_4.2.2"],
                },
              ],
              depend: {
                id: "S2_G1_4",
                value: ["4-1"],
              },
              items: {
                enum: [
                  "4.2.1-0",
                  "4.2.1-1",
                  "4.2.1-2",
                  "4.2.1-3",
                  "4.2.1-4",
                  "4.2.1-5",
                  "4.2.1-6",
                  "4.2.1-7",
                  "4.2.1-8",
                  "4.2.1-9",
                  "4.2.1-10",
                  "4.2.1-11",
                  "4.2.1-12",
                  "4.2.1-13",
                  "4.2.1-14",
                  "4.2.1-15",
                  "4.2.1-16",
                  "4.2.1-17",
                  "4.2.1-18",
                ],
                enumNames: [
                  "Awareness raising and behaviour change",
                  "Education/Training",
                  "Workshops",
                  "Conferences",
                  "Information campaign",
                  "Behaviour change campaign/programme",
                  "Community engagement",
                  "Stakeholder engagement",
                  "Citizen science",
                  "Curriculum development",
                  "Professional skills training",
                  "Other training programmes",
                  "Life-long learning",
                  "Institutional development",
                  "Primary school",
                  "Secondary school",
                  "Tertiary higher education",
                  "Creative/arts event/exhibition",
                  "Other",
                ],
              },
              uniqueItems: true,
            },
            "S2_G1_4.2.2": {
              title: '4.2.2. If you selected "Other", please specify:',
              type: "string",
              depend: {
                id: "S2_G1_4.2.1",
                value: ["4.2.1-18"],
              },
            },
            "S2_G1_4.3.1": {
              title:
                "4.3.1. Technology and Processes. You have chosen technology and processes as the type of initiative. What did the initiative specifically involve? (Please tick ALL that apply):",
              type: "array",
              dependencies: [
                {
                  value: ["4.3.1-21"],
                  questions: ["S2_G1_4.3.2"],
                },
              ],
              depend: {
                id: "S2_G1_4",
                value: ["4-2"],
              },
              items: {
                enum: [
                  "4.3.1-0",
                  "4.3.1-1",
                  "4.3.1-2",
                  "4.3.1-3",
                  "4.3.1-4",
                  "4.3.1-5",
                  "4.3.1-6",
                  "4.3.1-7",
                  "4.3.1-8",
                  "4.3.1-9",
                  "4.3.1-10",
                  "4.3.1-11",
                  "4.3.1-12",
                  "4.3.1-13",
                  "4.3.1-14",
                  "4.3.1-15",
                  "4.3.1-16",
                  "4.3.1-17",
                  "4.3.1-18",
                  "4.3.1-19",
                  "4.3.1-20",
                  "4.3.1-21",
                ],
                enumNames: [
                  "New product design",
                  "Change in service provision",
                  "Environmental social planning",
                  "Change in practice",
                  "Change in operations",
                  "Industrial or production standard",
                  "Different environmental management of land-based environments",
                  "Different environmental management of aquatic environments",
                  "Research and Development",
                  "New infrastructure",
                  "The use of compostable plastic",
                  "The use of bio-based plastic",
                  "The use of biodegradable plastic",
                  "Reducing the environmental impact",
                  "Developing a new material",
                  "Developing a new process",
                  "Manufacturing and production",
                  "Standards",
                  "Waste management",
                  "Compostable plastic",
                  "Bio-based plastic or bio-degradable plastic",
                  "Other",
                ],
              },
              uniqueItems: true,
            },
            "S2_G1_4.3.2": {
              title: '4.3.2. If you selected "Other", please specify:',
              type: "string",
              depend: {
                id: "S2_G1_4.3.1",
                value: ["4.3.1-21"],
              },
            },
            "S2_G1_4.4.1": {
              title:
                "4.4.1. Monitoring and Analysis. You have chosen monitoring and analysis as the type of initiatives. What did the initiative specifically involve? (Please tick ALL that apply):",
              type: "array",
              dependencies: [
                {
                  value: ["4.4.1-9"],
                  questions: ["S2_G1_4.4.2"],
                },
              ],
              depend: {
                id: "S2_G1_4",
                value: ["4-3"],
              },
              items: {
                enum: [
                  "4.4.1-0",
                  "4.4.1-1",
                  "4.4.1-2",
                  "4.4.1-3",
                  "4.4.1-4",
                  "4.4.1-5",
                  "4.4.1-6",
                  "4.4.1-7",
                  "4.4.1-8",
                  "4.4.1-9",
                ],
                enumNames: [
                  "Monitoring: On or near ocean surface",
                  "Monitoring: Water column",
                  "Monitoring: On the seafloor",
                  "Monitoring: On the shoreline",
                  "Monitoring: Entanglement/ ingested/ in biota",
                  "Monitoring: Air",
                  "Review and synthesis: Environmental",
                  "Review and synthesis: Economic",
                  "Review and synthesis: Materials/Other",
                  "Other",
                ],
              },
              uniqueItems: true,
            },
            "S2_G1_4.4.2": {
              title: '4.4.2. If you selected "Other", please specify:',
              type: "string",
              depend: {
                id: "S2_G1_4.4.1",
                value: ["4.4.1-9"],
              },
            },
            "S2_G1_4.4.3": {
              title:
                "4.4.3. For monitoring, which programme/protocol did you use? Please, indicate the name of the programme/protocol (e.g. OSPAR, CSIRO, NOAA, Beach watch, EU-MSFD, Ocean Conservancy...etc.) and if different programmes/protocols were used to monitor near ocean surfaces, water column, seafloor, shoreline, Biota, air monitoring.",
              type: "string",
              depend: {
                id: "S2_G1_4",
                value: ["4-3"],
              },
            },
            "S2_G1_4.4.4": {
              title:
                "4.4.4. How can the data and information from your monitoring programme be accessed? (If the monitoring data is available on request, please provide information on how to access the data)",
              type: "string",
              depend: {
                id: "S2_G1_4",
                value: ["4-3"],
              },
            },
            "S2_G1_4.4.5": {
              title:
                "4.4.5. Please provide the URL's for any links to the monitoring data and information.",
              type: "string",
              depend: {
                id: "S2_G1_4",
                value: ["4-3"],
              },
            },
          },
        },
        S2_G2: {
          title: "G2. Reporting and Measuring Progress",
          type: "object",
          depend: {
            id: "steps",
            value: 1,
          },
          required: [
            "S2_G2_5",
            "S2_G2_6",
            "S2_G2_7",
            "S2_G2_7.1.0",
            "S2_G2_7.1.1",
            "S2_G2_7.1.2",
            "S2_G2_7.2",
            "S2_G2_7.3",
            "S2_G2_8",
            "S2_G2_9",
            "S2_G2_10",
          ],
          properties: {
            S2_G2_5: {
              title: "5. Do you report and measure the initiative progress?",
              type: "string",
              dependencies: [
                {
                  value: ["5-6"],
                  questions: ["S2_G2_6"],
                },
              ],
              enum: ["5-0", "5-1", "5-2", "5-3", "5-4", "5-5", "5-6"],
              enumNames: [
                "Yes, reporting is voluntary",
                "Yes, it is a requirement",
                "No, there is no reporting mechanism",
                "No, reporting is voluntary",
                "No, there is not enough resources to support reporting",
                "No, reporting is too time-consuming",
                "Other",
              ],
            },
            S2_G2_6: {
              title: '6. If you selected "Other", please specify.',
              type: "string",
              depend: {
                id: "S2_G2_5",
                value: ["5-6"],
              },
            },
            S2_G2_7: {
              title:
                "7. If yes, who do you report to? (Please tick ALL that apply):",
              type: "array",
              dependencies: [
                {
                  value: ["7-0"],
                  questions: ["S2_G2_7.1.0"],
                },
                {
                  value: ["7-1"],
                  questions: ["S2_G2_7.1.1"],
                },
                {
                  value: ["7-2"],
                  questions: ["S2_G2_7.1.2"],
                },
                {
                  value: ["7-3"],
                  questions: ["S2_G2_7.2"],
                },
                {
                  value: ["7-4"],
                  questions: ["S2_G2_7.3"],
                },
              ],
              depend: {
                id: "S2_G2_5",
                value: ["5-0", "5-1"],
              },
              items: {
                enum: ["7-0", "7-1", "7-2", "7-3", "7-4"],
                enumNames: [
                  "Global Sustainable Development Goals (SDGs)",
                  "Regional Sustainable Development Goals (SDGs)",
                  "National Sustainable Development Goals (SDGs)",
                  "Multilateral Environmental Agreements (MEAs)",
                  "Other",
                ],
              },
              uniqueItems: true,
            },
            "S2_G2_7.1.0": {
              title:
                "7.1. Which Sustainable Development Goals (SDGs) does your initiative apply to? (Please tick ALL that apply):",
              type: "array",
              depend: {
                id: "S2_G2_7",
                value: ["7-0"],
              },
              items: {
                enum: ["7.1-0"],
                enumNames: ["[Pop up a full list of SDGs]"],
              },
              uniqueItems: true,
            },
            "S2_G2_7.1.1": {
              $ref: "#/properties/S2/properties/S2_G2/properties/S2_G2_7.1.0",
              depend: {
                id: "S2_G2_7",
                value: ["7-1"],
              },
            },
            "S2_G2_7.1.2": {
              $ref: "#/properties/S2/properties/S2_G2/properties/S2_G2_7.1.0",
              depend: {
                id: "S2_G2_7",
                value: ["7-2"],
              },
            },
            "S2_G2_7.2": {
              title:
                "7.2. Which Multilateral Environmental Agreements (MEAs) does your initiative apply to? (Please tick ALL that apply):",
              type: "array",
              depend: {
                id: "S2_G2_7",
                value: ["7-3"],
              },
              items: {
                enum: specificAreasOptions,
              },
              uniqueItems: true,
            },
            "S2_G2_7.3": {
              title: '7.3. If you selected "Other", please specify.',
              type: "string",
              depend: {
                id: "S2_G2_7",
                value: ["7-4"],
              },
            },
            S2_G2_8: {
              title:
                "8. Are the actual outcomes and impacts of the initiative evaluated?",
              type: "string",
              dependencies: [
                {
                  value: ["8-2"],
                  questions: ["S2_G2_9"],
                },
              ],
              enum: ["8-0", "8-1", "8-2"],
              enumNames: ["Yes", "No", "Other"],
            },
            S2_G2_9: {
              title: '9. If you selected "Other", please specify.',
              type: "string",
              depend: {
                id: "S2_G2_8",
                value: ["8-2"],
              },
            },
            S2_G2_10: {
              title:
                "10. When do you expect the impact of the initiative to be evident?",
              type: "string",
              enum: ["10-0", "10-1", "10-2", "10-3"],
              enumNames: [
                "Immediately (less than 1 year)",
                "In 1 to 3 years",
                "In 4 to 10 years",
                "In more than 10 years",
              ],
            },
            S2_G2_11: {
              title:
                "11. If applicable, please specify when and how the outcomes will be evaluated (tick ALL that apply).",
              type: "array",
              items: {
                enum: ["11-0", "11-1", "11-2", "11-3", "11-4", "11-5", "11-6"],
                enumNames: [
                  "Outcomes will be assessed once, when the initiative is completed",
                  "Outcomes are being assessed at regular intervals",
                  "Outcomes will be compared to a baseline measurement",
                  "Outcomes will be compared to other sites or initiatives",
                  "Environmental impacts will be evaluated",
                  "Social impacts will be evaluated",
                  "Economic impacts will be evaluated",
                ],
              },
              uniqueItems: true,
            },
            S2_G2_12: {
              title:
                "12. Do you have specific key performance indicators (KPIs) for your initiative? If yes, please list up to 5.",
              type: "string",
            },
            S2_G2_13: {
              title:
                "13. Please, describe if any co-benefits and/or side-effects of the initiative are captured in the evaluation.",
              type: "string",
            },
          },
        },
        S2_G3: {
          title: "G3. Drivers and Barriers",
          type: "object",
          depend: {
            id: "steps",
            value: 2,
          },
          required: ["S2_G3_14", "S2_G3_15"],
          properties: {
            S2_G3_14: {
              title:
                "14. Please, indicate which DRIVERS apply to this initiative? (Please tick ALL that apply).",
              type: "array",
              items: {
                enum: [
                  "14-0",
                  "14-1",
                  "14-2",
                  "14-3",
                  "14-4",
                  "14-5",
                  "14-6",
                  "14-7",
                  "14-8",
                  "14-9",
                  "14-10",
                  "14-11",
                  "14-12",
                  "14-13",
                  "14-14",
                  "14-15",
                  "14-16",
                  "14-17",
                  "14-18",
                  "14-19",
                ],
                enumNames: [
                  "Cost considerations (e.g., reducing costs of existing processes or of disposal)",
                  "Protecting economy / livelihoods or shareholder value",
                  "Economic drivers (e.g., fines, subsidies, taxes)",
                  "A change in public opinion",
                  "Members of the public have actively complained / asked for change",
                  "Media coverage, wide exposure of marine litter and plastic pollution",
                  "Campaigning with or through NGOs",
                  "Reputation / image of the member state or organisation",
                  "Leadership by specific individuals in the member state or organisation (who personallydrove change)",
                  "Existing policy or recent policy change",
                  "Anticipating a future policy change",
                  "National or organisational values",
                  "Peer pressure from similar actors",
                  "Transnational or global agreements and momentum towards change (e.g.,UN resolutions)",
                  "Concern about environmental impact (e.g.,harm to animals and plants)",
                  "Concern about potential human health impacts",
                  "Protecting future generations",
                  "Spiritual or religious values",
                  "Moral considerations",
                  "Sustainable Development Goals",
                ],
              },
              uniqueItems: true,
            },
            S2_G3_15: {
              title:
                "15. Please,indicate which BARRIERS apply to this initiative? (Please tick ALLthat apply).",
              type: "array",
              items: {
                enum: [
                  "15-0",
                  "15-1",
                  "15-2",
                  "15-3",
                  "15-4",
                  "15-5",
                  "15-6",
                  "15-7",
                  "15-8",
                  "15-9",
                  "15-10",
                  "15-11",
                  "15-12",
                  "15-13",
                  "15-14",
                  "15-15",
                  "15-16",
                  "15-17",
                  "15-18",
                ],
                enumNames: [
                  "So-called 'perverse incentives' (e.g.,subsidies and taxes) that encourage wasteful use of plastic",
                  "Not enough regulation/control mechanisms",
                  "Existing regulation is not enforced",
                  "Conflicting regulation",
                  "Initiative depends on other actors who are not cooperating",
                  "Lobbying by business/industry",
                  "Not enough reliable information",
                  "Not enough support from within the member state/organisation",
                  "Not enough support from outside the member state/organisation",
                  "Technological/technical resources",
                  "Problems with alternative materials and supplies",
                  "Gaps in expertise in member state/organisation ",
                  "Gaps in leadership/political will",
                  "Not enough infrastructure",
                  "Conflicting goals/other priorities more urgent",
                  "Fragmentation",
                  "Gaps in public awareness/public not interested",
                  "Habits in society too slow to change",
                  "People like plastics (convenience, hygiene etc.)",
                ],
              },
              uniqueItems: true,
            },
          },
        },
      },
    },
    S3: {
      title: "SECTION 3: INITIATIVE DETAILS",
      type: "object",
      depend: {
        id: "tabs",
        value: ["S3"],
      },
      properties: {
        S3_G1: {
          title: "G1. Part 1: Entities Involved",
          type: "object",
          depend: {
            id: "steps",
            value: 0,
          },
          required: [
            "S3_G1_16",
            "S3_G1_17",
            "S3_G1_18",
            "S3_G1_19",
            "S3_G1_20",
            "S3_G1_21",
          ],
          properties: {
            S3_G1_16: {
              title:
                "16. Which Entity is implementing the initiative? (Please indicate the name of the Implementing Entities).",
              type: "string",
              enum: [],
              enumNames: [],
            },
            S3_G1_17: {
              title: '17. If you selected "Other", please specify.',
              type: "string",
              depend: {
                id: "S3_G1_16",
                value: [-1],
              },
            },
            S3_G1_18: {
              title:
                "18. Are you working with Partners to implement the initiative? (Please indicate the name of the Partner Entities involved).",
              type: "string",
              enum: [],
              enumNames: [],
            },
            S3_G1_19: {
              title: '19. If you selected "Other", please specify.',
              type: "string",
              depend: {
                id: "S3_G1_18",
                value: [-1],
              },
            },
            S3_G1_20: {
              title:
                "20. Do you have Donors funding the Initiative? (Please indicate the name of the Donor Entities).",
              type: "string",
              enum: [],
              enumNames: [],
            },
            S3_G1_21: {
              title: '21. If you selected "Other", please specify.',
              type: "string",
              depend: {
                id: "S3_G1_20",
                value: [-1],
              },
            },
          },
        },
        S3_G2: {
          title: "G2. Part 2: Location & Coverage",
          type: "object",
          depend: {
            id: "steps",
            value: 1,
          },
          required: [
            "S3_G2_22",
            "S3_G2_23",
            "S3_G2_24",
            "S3_G2_24.1",
            "S3_G2_24.2",
            "S3_G2_24.3",
            "S3_G2_24.4",
            "S3_G2_24.5",
          ],
          properties: {
            S3_G2_22: {
              title: "22. City",
              type: "string",
            },
            S3_G2_23: {
              title: "23. Country",
              type: "string",
              enum: ["23-0"],
              enumNames: ["List of country"],
            },
            S3_G2_24: {
              title: "24. Geo coverage type",
              type: "string",
              enum: geoCoverageTypeOptions,
              enumNames: geoCoverageTypeOptions,
            },
            "S3_G2_24.1": {
              title: "24.1. Geo Coverage",
              type: "string",
              depend: {
                id: "S3_G2_24",
                value: ["regional"],
              },
              enum: regionOptions,
              enumNames: regionOptions,
            },
            "S3_G2_24.2": {
              title: "24.1. Geo Coverage",
              type: "string",
              depend: {
                id: "S3_G2_24",
                value: ["national"],
              },
              enum: [],
              enumNames: [],
            },
            "S3_G2_24.3": {
              title: "24.1. Geo Coverage",
              type: "string",
              depend: {
                id: "S3_G2_24",
                value: ["sub-national"],
              },
            },
            "S3_G2_24.4": {
              title: "24.1. Geo Coverage",
              type: "string",
              depend: {
                id: "S3_G2_24",
                value: ["transnational"],
              },
              enum: [],
              enumNames: [],
            },
            "S3_G2_24.5": {
              title: "24.1. Geo Coverage",
              type: "string",
              depend: {
                id: "S3_G2_24",
                value: ["global with elements in specific areas"],
              },
              enum: specificAreasOptions,
              enumNames: specificAreasOptions,
            },
          },
        },
        S3_G3: {
          title: "G3. Part 3: Initiative Scope & Target",
          type: "object",
          depend: {
            id: "steps",
            value: 2,
          },
          required: [
            "S3_G3_26",
            "S3_G3_27",
            "S3_G3_28",
            "S3_G3_29",
            "S3_G3_30",
            "S3_G3_31",
            "S3_G3_32",
          ],
          properties: {
            S3_G3_26: {
              title:
                "26. Lifecycle. Which specific part of the lifecycle/plastic supply chain is your initiative targeting? (Please tick ALL that apply).",
              type: "array",
              dependencies: [
                {
                  value: ["26-7"],
                  questions: ["S3_G3_27"],
                },
              ],
              items: {
                enum: [
                  "26-0",
                  "26-1",
                  "26-2",
                  "26-3",
                  "26-4",
                  "26-5",
                  "26-6",
                  "26-7",
                ],
                enumNames: [
                  "Raw materials",
                  "Design",
                  "Production / manufacture",
                  "Use / consumption",
                  "Collection / sorting of plastics after use",
                  "Management of collected plastics",
                  "Clean-up of marine litter and plasticpollutionfrom the environment",
                  "Other",
                ],
              },
              uniqueItems: true,
            },
            S3_G3_27: {
              title: '27. If you selected "Other", please specify.',
              type: "string",
              depend: {
                id: "S3_G3_26",
                value: ["26-7"],
              },
            },
            S3_G3_28: {
              title:
                "28. Impact. What impacts or harms does the initiative relate to? (Please tick ALL that apply).",
              type: "array",
              dependencies: [
                {
                  value: ["28-8"],
                  questions: ["S3_G3_29"],
                },
              ],
              items: {
                enum: [
                  "28-0",
                  "28-1",
                  "28-2",
                  "28-3",
                  "28-4",
                  "28-5",
                  "28-6",
                  "28-7",
                  "28-8",
                ],
                enumNames: [
                  "Human health and wellbeing",
                  "Biodiversity",
                  "Marine organisms",
                  "Ecosystem Services",
                  "Food chain",
                  "Economics and Trade",
                  "All of the above",
                  "Not applicable",
                  "Other",
                ],
              },
              uniqueItems: true,
            },
            S3_G3_29: {
              title: '29. If you selected "Other", please specify.',
              type: "string",
              depend: {
                id: "S3_G3_28",
                value: ["28-8"],
              },
            },
            S3_G3_30: {
              title:
                "30. Sector. Does your initiative target a specific sector? (Please tick ALL that apply).",
              type: "array",
              dependencies: [
                {
                  value: ["30-17"],
                  questions: ["S3_G3_31"],
                },
              ],
              items: {
                enum: [
                  "30-0",
                  "30-1",
                  "30-2",
                  "30-3",
                  "30-4",
                  "30-5",
                  "30-6",
                  "30-7",
                  "30-8",
                  "30-9",
                  "30-10",
                  "30-11",
                  "30-12",
                  "30-13",
                  "30-14",
                  "30-15",
                  "30-16",
                  "30-17",
                ],
                enumNames: [
                  "Packaging",
                  "Textiles",
                  "Transportation",
                  "Building, construction, demolition,industrial machinery",
                  "Automotive",
                  "Electrical and electronics",
                  "Agriculture",
                  "Fisheries",
                  "Aquaculture",
                  "Food & Beverages",
                  "Personal Healthcare",
                  "Medical",
                  "Retail",
                  "Tourism",
                  "Wastewater/Sewage management",
                  "All of the above",
                  "Not applicable",
                  "Other",
                ],
              },
              uniqueItems: true,
            },
            S3_G3_31: {
              title: '31. If you selected "Other", please specify.',
              type: "string",
              depend: {
                id: "S3_G3_30",
                value: ["30-17"],
              },
            },
            S3_G3_32: {
              title:
                "32. Tags. Choose the Tags applicable to your initiative targeting. (Please select ALL that apply).",
              type: "string",
              enum: [
                "32-0",
                "32-1",
                "32-2",
                "32-3",
                "32-4",
                "32-5",
                "32-6",
                "32-7",
                "32-8",
                "32-9",
                "32-10",
                "32-11",
                "32-12",
                "32-13",
                "32-14",
                "32-15",
                "32-16",
                "32-17",
                "32-18",
                "32-19",
                "32-20",
                "32-21",
                "32-22",
                "32-23",
                "32-24",
                "32-25",
                "32-26",
                "32-27",
                "32-28",
                "32-29",
                "32-30",
              ],
              enumNames: [
                "Mountains and upland area",
                "Agricultural land/soils",
                "Entire water catchment",
                "Forests or Mangroves",
                "Freshwater rivers and lakes",
                "Urban environment",
                "Waste disposal sites",
                "Coastal zone",
                "Maritime area within national jurisdiction",
                "Areas beyond national jurisdiction",
                "Open ocean and high seas",
                "Air",
                "Reducing plastics",
                "Reusing plastic",
                "Recycling plastics",
                "Macroplastic",
                "Microplastics",
                "Additives incorporated into plastic items",
                "Bottles",
                "Plastic bags",
                "Food packaging",
                "Non-food packaging",
                "Smoking related litter",
                "Fishing related items",
                "Shipping related items",
                "Cups",
                "Plastic straws, stirrers, cutlery",
                "Sewage-related items",
                "Natural disaster/hazard related debris",
                "Polystyrene items",
                "Not applicable",
              ],
              uniqueItems: true,
            },
          },
        },
        S3_G4: {
          title: "G4. Part 4: Total Stakeholders Engaged",
          type: "object",
          depend: {
            id: "steps",
            value: 3,
          },
          required: ["S3_G4_33", "S3_G4_34"],
          properties: {
            S3_G4_33: {
              title:
                "33. How many different groups and organisations (e.g.20 retailers, 150 schools) have you engaged with in total? (Please estimate)",
              type: "number",
            },
            S3_G4_34: {
              title:
                "34. How many stakeholders (number of individuals) have you engaged in total? (Please estimate).",
              type: "number",
            },
          },
        },
        S3_G5: {
          title: "G5. Part 5: Funding",
          type: "object",
          depend: {
            id: "steps",
            value: 4,
          },
          required: [
            "S3_G5_35",
            "S3_G5_36",
            "S3_G5_36.1",
            "S3_G5_37",
            "S3_G5_37.1",
          ],
          properties: {
            S3_G5_35: {
              title: "35. What funding sources did you use?",
              type: "string",
              enum: [
                "35-0",
                "35-1",
                "35-2",
                "35-3",
                "35-4",
                "35-5",
                "35-6",
                "35-7",
              ],
              enumNames: [
                "Crowdfunded",
                "Voluntary donations",
                "Public Financing",
                "Private Sector",
                "Mixed",
                "All of the above",
                "Not applicable",
                "Other",
              ],
            },
            S3_G5_36: {
              title:
                "36. How much money (amount) has been invested in the initiative so far? (please give us an estimate if you are unsure and only submit numbers, e.g., 5,000 should be entered as 5000)",
              type: "number",
            },
            "S3_G5_36.1": {
              title: "36.1. Currency",
              type: "string",
              enum: [],
              enumNames: [],
            },
            S3_G5_37: {
              title:
                "37. Are there in-kind contributions as well? (Please tell us the equivalent amount and only submit numbers, e.g., 5,000 should be entered as 5000).",
              type: "number",
            },
            "S3_G5_37.1": {
              title: "37.1. Currency",
              type: "string",
              enum: [],
              enumNames: [],
            },
          },
        },
        S3_G6: {
          title: "G6. Part 6: Duration",
          type: "object",
          depend: {
            id: "steps",
            value: 5,
          },
          required: ["S3_G6_38", "S3_G6_39"],
          properties: {
            S3_G6_38: {
              title: "38. Is your initiative a one-off activity or ongoing?",
              type: "string",
              dependencies: [
                {
                  value: ["38-5"],
                  questions: ["S3_G6_39"],
                },
              ],
              enum: ["38-0", "38-1", "38-2", "38-3", "38-4", "38-5"],
              enumNames: [
                "Single event",
                "Ongoing activity less than one year",
                "Ongoing activity 1-3 years",
                "Ongoing activity more than 3 years long",
                "Not applicable",
                "Other",
              ],
            },
            S3_G6_39: {
              title: '39. If you selected "Other", please specify.',
              type: "string",
              depend: {
                id: "S3_G6_38",
                value: ["38-5"],
              },
            },
          },
        },
        S3_G7: {
          title: "G7. Part 5: Related Resources and Contact",
          type: "object",
          depend: {
            id: "steps",
            value: 6,
          },
          required: ["S3_G7_41.1"],
          properties: {
            S3_G7_40: {
              title:
                "40. Links to further information (websites, reports etc). Please provide links, URL's, website links etc to documents about your initiative. We are interested in websites, reports, images, media articles etc. Please copy and paste one link per box provided.",
              type: "array",
              items: {
                type: "string",
                string: true,
              },
              add: "Add Link",
            },
            S3_G7_41: {
              title: "41. Where can users best contact you to learn more?",
              type: "string",
              enum: ["41-0", "41-1", "41-2", "41-3", "41-4", "41-5"],
              enumNames: [
                "Email",
                "LinkedIn",
                "Twitter",
                "Facebook",
                "Instagram",
                "Other",
              ],
            },
            "S3_G7_41.1": {
              title: "41.1. Please provide the URL",
              type: "string",
              string: true,
              depend: {
                id: "S3_G7_41",
                value: ["41-0", "41-1", "41-2", "41-3", "41-4", "41-5"],
              },
            },
          },
        },
      },
    },
  },
};
