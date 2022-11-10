import { UIStore } from "../../store";
const {
  geoCoverageTypeOptions,
  languages,
  entityRoleOptions,
  individualRoleOptions,
} = UIStore.currentState;

import { newGeoCoverageFormat } from "../../utils/geo";

const sdgsOptions = [
  {
    goal: 1,
    name: "No Poverty",
  },
  {
    goal: 2,
    name: "Zero Hunger",
  },
  {
    goal: 3,
    name: "Good Health and Well-being",
  },
  {
    goal: 4,
    name: "Quality Education",
  },
  {
    goal: 5,
    name: "Gender Equality",
  },
  {
    goal: 6,
    name: "Clean Water and Sanitation",
  },
  {
    goal: 7,
    name: "Affordable and Clean Energy",
  },
  {
    goal: 8,
    name: "Decent Jobs and Economic Growth",
  },
  {
    goal: 9,
    name: "Industry, Innovation and Infrastructure",
  },
  {
    goal: 10,
    name: "Reduced Inequalities",
  },
  {
    goal: 11,
    name: "Sustainable Cities and Communities",
  },
  {
    goal: 12,
    name: "Responsible Consumption and Production",
  },
  {
    goal: 13,
    name: "Climate Action",
  },
  {
    goal: 14,
    name: "Life Below Water",
  },
  {
    goal: 15,
    name: "Life on Land",
  },
  {
    goal: 16,
    name: "Peace and Justice - Strong Institutions",
  },
  {
    goal: 17,
    name: "Partnerships for the Goals",
  },
];

export const schema = {
  initiative: {
    type: "object",
    version: "2",
    label: "initiative",
    properties: {
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: [
              "geoCoverageType",
              "S4_G2_24.4",
              "S4_G2_24.3",
              "S4_G2_24.2",
              "geoCoverageValueSubnational",
              "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "sub-national"],
                enumNames: [
                  "Global",
                  "Transnational",
                  "National",
                  "Subnational",
                ],
              },
              "S4_G2_24.3": {
                title: "GEO COVERAGE (Transnational)",
                type: "string",
                enum: [],
                enumNames: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["transnational"],
                },
              },
              "S4_G2_24.4": {
                title: "GEO COVERAGE (Countries)",
                type: "string",
                enum: [],
                enumNames: [],
                depend: {
                  id: "S4_G2_24.3",
                  value: ["-1"],
                },
              },
              "S4_G2_24.2": {
                title: "National",
                type: "string",
                enum: [],
                enumNames: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national"],
                },
              },
              geoCoverageValueSubnational: {
                title: "Subnational",
                type: "string",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["sub-national"],
                },
              },
              geoCoverageValueSubnationalCity: {
                title: "Subnational Area",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["sub-national"],
                },
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: "Banner",
                type: "string",
                format: "data-url",
              },
              thumbnail: {
                title: "Thumbnail (300x400)",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: "Entity connection",
                description: "entity",
                custom: "entity",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: "Individual connection",
                description: "individual",
                custom: "stakeholder",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "stakeholder"],
                  properties: {
                    role: {
                      title: "User role",
                      enum: individualRoleOptions.map((x) =>
                        x !== "Resource Editor"
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, "_")
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: "Indvidual",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 5,
            },
            properties: {
              info: {
                title: "Info And Docs",
                type: "string",
              },
              related: {
                title: "Related Resource",
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        properties: {
          S5_G1: {
            title: "",
            type: "object",
            required: [],
            properties: {
              S5_G1_4: {
                title:
                  "What is the MAIN focus of the initiative? (Please tick ALL that apply).",
                type: "array",
                dependency: [
                  {
                    value: ["4-0"],
                    questions: ["S5_G1_4.1.1", "S5_G1_4.1.2"],
                  },
                  {
                    value: ["4-1"],
                    questions: ["S5_G1_4.2.1", "S5_G1_4.2.2"],
                  },
                  {
                    value: ["4-2"],
                    questions: ["S5_G1_4.3.1", "S5_G1_4.3.2"],
                  },
                  {
                    value: ["4-3"],
                    questions: [
                      "S5_G1_4.4.1",
                      "S5_G1_4.4.2",
                      "S5_G1_4.4.3",
                      "S5_G1_4.4.4",
                      "S5_G1_4.4.5",
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
              "S5_G1_4.1.1": {
                title:
                  "Legislation, Standards and Rules. You have selected legislation, standards and rules as the type of initiative. What did the initiative specifically involve? (Please tick ALL that apply):",
                type: "array",
                dependency: [
                  {
                    value: ["4.1.1-10"],
                    questions: ["S5_G1_4.1.2"],
                  },
                ],
                depend: {
                  id: "S5_G1_4",
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
              "S5_G1_4.1.2": {
                title: 'If you selected "Other", please specify',
                type: "string",
                depend: {
                  id: "S5_G1_4.1.1",
                  value: ["4.1.1-10"],
                },
              },
              "S5_G1_4.2.1": {
                title:
                  "Working with People. You have chosen working with people as the type of initiative. What did the initiative specifically involve? (Please tick ALL that apply):",
                type: "array",
                dependency: [
                  {
                    value: ["4.2.1-18"],
                    questions: ["S5_G1_4.2.2"],
                  },
                ],
                depend: {
                  id: "S5_G1_4",
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
              "S5_G1_4.2.2": {
                title: 'If you selected "Other", please specify:',
                type: "string",
                depend: {
                  id: "S5_G1_4.2.1",
                  value: ["4.2.1-18"],
                },
              },
              "S5_G1_4.3.1": {
                title:
                  "Technology and Processes. You have chosen technology and processes as the type of initiative. What did the initiative specifically involve? (Please tick ALL that apply):",
                type: "array",
                dependency: [
                  {
                    value: ["4.3.1-21"],
                    questions: ["S5_G1_4.3.2"],
                  },
                ],
                depend: {
                  id: "S5_G1_4",
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
              "S5_G1_4.3.2": {
                title: 'If you selected "Other", please specify:',
                type: "string",
                depend: {
                  id: "S5_G1_4.3.1",
                  value: ["4.3.1-21"],
                },
              },
              "S5_G1_4.4.1": {
                title:
                  "Monitoring and Analysis. You have chosen monitoring and analysis as the type of initiatives. What did the initiative specifically involve? (Please tick ALL that apply):",
                type: "array",
                dependency: [
                  {
                    value: ["4.4.1-9"],
                    questions: ["S5_G1_4.4.2"],
                  },
                ],
                depend: {
                  id: "S5_G1_4",
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
              "S5_G1_4.4.2": {
                title: 'If you selected "Other", please specify:',
                type: "string",
                depend: {
                  id: "S5_G1_4.4.1",
                  value: ["4.4.1-9"],
                },
              },
              "S5_G1_4.4.3": {
                title: "For monitoring, which programme/protocol did you use?",
                type: "string",
                depend: {
                  id: "S5_G1_4",
                  value: ["4-3"],
                },
              },
              "S5_G1_4.4.4": {
                title:
                  "How can the data and information from your monitoring programme be accessed?",
                type: "string",
                depend: {
                  id: "S5_G1_4",
                  value: ["4-3"],
                },
              },
              "S5_G1_4.4.5": {
                title:
                  "Please provide the URL's for any links to the monitoring data and information.",
                type: "array",
                items: {
                  type: "string",
                  string: true,
                  format: "url",
                },
                add: "Add Link",
                depend: {
                  id: "S5_G1_4",
                  value: ["4-3"],
                },
              },
              S5_G2_5: {
                subTitle: "Reporting and Measuring Progress",
                title: "Do you report and measure the initiative progress?",
                type: "string",
                dependency: [
                  {
                    value: ["5-6"],
                    questions: ["S5_G2_6"],
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
              S5_G2_6: {
                title: 'If you selected "Other", please specify.',
                type: "string",
                depend: {
                  id: "S5_G2_5",
                  value: ["5-6"],
                },
              },
              S5_G2_7: {
                title:
                  "If yes, who do you report to? (Please tick ALL that apply):",
                type: "array",
                dependency: [
                  {
                    value: ["7-0"],
                    questions: ["S5_G2_7.1.0"],
                  },
                  {
                    value: ["7-1"],
                    questions: ["S5_G2_7.1.1"],
                  },
                  {
                    value: ["7-2"],
                    questions: ["S5_G2_7.1.2"],
                  },
                  {
                    value: ["7-3"],
                    questions: ["S5_G2_7.2"],
                  },
                  {
                    value: ["7-4"],
                    questions: ["S5_G2_7.3"],
                  },
                ],
                depend: {
                  id: "S5_G2_5",
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
              "S5_G2_7.1.0": {
                title:
                  "Which Sustainable Development Goals (SDGs) does your initiative apply to? (Please tick ALL that apply):",
                type: "array",
                depend: {
                  id: "S5_G2_7",
                  value: ["7-0"],
                },
                items: {
                  enum: sdgsOptions.map((x) => x.goal),
                  enumNames: sdgsOptions.map((x) => x.name),
                },
                uniqueItems: true,
              },
              "S5_G2_7.1.1": {
                title:
                  "Which Sustainable Development Goals (SDGs) does your initiative apply to? (Please tick ALL that apply):",
                type: "array",
                depend: {
                  id: "S5_G2_7",
                  value: ["7-0"],
                },
                items: {
                  enum: sdgsOptions.map((x) => x.goal),
                  enumNames: sdgsOptions.map((x) => x.name),
                },
                uniqueItems: true,
              },
              "S5_G2_7.1.2": {
                title:
                  "Which Sustainable Development Goals (SDGs) does your initiative apply to? (Please tick ALL that apply):",
                type: "array",
                depend: {
                  id: "S5_G2_7",
                  value: ["7-0"],
                },
                items: {
                  enum: sdgsOptions.map((x) => x.goal),
                  enumNames: sdgsOptions.map((x) => x.name),
                },
                uniqueItems: true,
              },
              "S5_G2_7.2": {
                title:
                  "Which Multilateral Environmental Agreements (MEAs) does your initiative apply to? (Please tick ALL that apply):",
                type: "array",
                depend: {
                  id: "S5_G2_7",
                  value: ["7-3"],
                },
                items: {
                  enum: [],
                  enumNames: [],
                },
                uniqueItems: true,
              },
              "S5_G2_7.3": {
                title: 'If you selected "Other", please specify.',
                type: "string",
                depend: {
                  id: "S5_G2_7",
                  value: ["7-4"],
                },
              },
              S5_G2_8: {
                title:
                  "Are the actual outcomes and impacts of the initiative evaluated?",
                type: "string",
                dependency: [
                  {
                    value: ["8-2"],
                    questions: ["S5_G2_9"],
                  },
                ],
                enum: ["8-0", "8-1", "8-2"],
                enumNames: ["Yes", "No", "Other"],
              },
              S5_G2_9: {
                title: 'If you selected "Other", please specify.',
                type: "string",
                depend: {
                  id: "S5_G2_8",
                  value: ["8-2"],
                },
              },
              S5_G2_10: {
                title:
                  "When do you expect the impact of the initiative to be evident?",
                type: "string",
                enum: ["10-0", "10-1", "10-2", "10-3"],
                enumNames: [
                  "Immediately (less than 1 year)",
                  "In 1 to 3 years",
                  "In 4 to 10 years",
                  "In more than 10 years",
                ],
              },
              S5_G2_11: {
                title:
                  "If applicable, please specify when and how the outcomes will be evaluated (tick ALL that apply).",
                type: "array",
                items: {
                  enum: [
                    "11-0",
                    "11-1",
                    "11-2",
                    "11-3",
                    "11-4",
                    "11-5",
                    "11-6",
                  ],
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
              S5_G2_12: {
                title:
                  "Do you have specific key performance indicators (KPIs) for your initiative? If yes, please list up to 5.",
                type: "string",
              },
              S5_G2_13: {
                title:
                  "Please, describe if any co-benefits and/or side-effects of the initiative are captured in the evaluation.",
                type: "string",
              },
              S5_G3_14: {
                subTitle: "Drivers and Barriers",
                title:
                  "Please, indicate which DRIVERS apply to this initiative? (Please tick ALL that apply).",
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
              S5_G3_15: {
                title:
                  "Please,indicate which BARRIERS apply to this initiative? (Please tick ALL that apply).",
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
              S5_G3_26: {
                subTitle: "Initiative Scope & Target",
                title:
                  "Lifecycle. Which specific part of the lifecycle/plastic supply chain is your initiative targeting? (Please tick ALL that apply).",
                type: "array",
                dependency: [
                  {
                    value: ["26-7"],
                    questions: ["S5_G3_27"],
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
              S5_G3_27: {
                title: 'If you selected "Other", please specify.',
                type: "string",
                depend: {
                  id: "S5_G3_26",
                  value: ["26-7"],
                },
              },
              S5_G3_28: {
                title:
                  "Impact. What impacts or harms does the initiative relate to? (Please tick ALL that apply).",
                type: "array",
                dependency: [
                  {
                    value: ["28-8"],
                    questions: ["S5_G3_29"],
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
              S5_G3_29: {
                title: 'If you selected "Other", please specify.',
                type: "string",
                depend: {
                  id: "S5_G3_28",
                  value: ["28-8"],
                },
              },
              S5_G3_30: {
                title:
                  "Sector. Does your initiative target a specific sector? (Please tick ALL that apply).",
                type: "array",
                dependency: [
                  {
                    value: ["30-17"],
                    questions: ["S5_G3_31"],
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
              S5_G3_31: {
                title: 'If you selected "Other", please specify.',
                type: "string",
                depend: {
                  id: "S5_G3_30",
                  value: ["30-17"],
                },
              },
              S5_G4_33: {
                subTitle: "Total Stakeholders Engaged",
                title:
                  "How many different groups and organisations have you engaged with in total?",
                type: "string",
              },
              S5_G4_34: {
                title: "How many stakeholders have you engaged in total?",
                type: "number",
              },
              S5_G5_35: {
                subTitle: "Funding",
                title: "What funding sources did you use?",
                type: "string",
                dependency: [
                  {
                    value: ["35-7"],
                    questions: ["S5_G5_35.1"],
                  },
                ],
                enum: ["35-0", "35-1", "35-2", "35-3", "35-4", "35-6", "35-7"],
                enumNames: [
                  "Crowdfunded",
                  "Voluntary donations",
                  "Public Financing",
                  "Private Sector",
                  "Mixed",
                  "Not applicable",
                  "Other",
                ],
              },
              "S5_G5_35.1": {
                title: 'If you selected "Other", please specify.',
                type: "string",
                depend: {
                  id: "S5_G5_35",
                  value: ["35-7"],
                },
              },
              S5_G5_36: {
                title:
                  "How much money (amount) has been invested in the initiative so far?",
                type: "number",
              },
              "S5_G5_36.1": {
                title: "Currency",
                type: "string",
                enum: [],
                enumNames: [],
              },
              S5_G5_37: {
                title: "Are there in-kind contributions as well?",
                type: "number",
              },
              "S5_G5_37.1": {
                title: "Currency",
                type: "string",
                enum: [],
                enumNames: [],
              },
              S5_G6_38: {
                subTitle: "Duration",
                title: "Is your initiative a one-off activity or ongoing?",
                type: "string",
                dependency: [
                  {
                    value: ["38-5"],
                    questions: ["S5_G6_39"],
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
              S5_G6_39: {
                title: 'If you selected "Other", please specify.',
                type: "string",
                depend: {
                  id: "S5_G6_38",
                  value: ["38-5"],
                },
              },
              S5_G7_41: {
                subTitle: "Contact Info",
                title: "Where can users best contact you to learn more?",
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
              "S5_G7_41.1": {
                title: "Please provide the details",
                type: "string",
                string: true,
                depend: {
                  id: "S5_G7_41",
                  value: ["41-0", "41-1", "41-2", "41-3", "41-4", "41-5"],
                },
              },
            },
          },
        },
      },
    },
  },
  action: {
    type: "object",
    version: "2",
    label: "action",
    properties: {
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: [
              "geoCoverageType",
              "geoCoverageValueTransnational",
              "geoCoverageCountries",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "sub-national"],
                enumNames: [
                  "Global",
                  "Transnational",
                  "National",
                  "Subnational",
                ],
              },
              geoCoverageValueTransnational: {
                title: "GEO COVERAGE (Transnational)",
                enum: [],
                countries: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["transnational"],
                },
              },
              geoCoverageCountries: {
                title: "GEO COVERAGE (Countries)",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national", "sub-national"],
                },
              },
              // geoCoverageValueNational: {
              //   title: "National",
              //   enum: [],
              //   depend: {
              //     id: "geoCoverageType",
              //     value: ["national"],
              //   },
              // },
              // geoCoverageValueSubnational: {
              //   title: "Subnational",
              //   enum: [],
              //   depend: {
              //     id: "geoCoverageType",
              //     value: ["sub-national"],
              //   },
              // },
              geoCoverageValueSubnationalCity: {
                title: "Subnational Area",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["sub-national"],
                },
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: "Entity connection",
                description: "entity",
                custom: "entity",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: "Individual connection",
                description: "individual",
                custom: "stakeholder",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "stakeholder"],
                  properties: {
                    role: {
                      title: "User role",
                      enum: individualRoleOptions.map((x) =>
                        x !== "Resource Editor"
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, "_")
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: "Indvidual",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 5,
            },
            properties: {
              info: {
                title: "Info And Docs",
                type: "string",
              },
              related: {
                title: "Related Resource",
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        required: [],
        properties: {
          dateOne: {
            type: "object",
            title: "",
            required: [],
            properties: {
              publishYear: {
                title: "Publication Year",
                type: "string",
              },
            },
          },
          date: {
            type: "object",
            title: "",
            required: [],
            properties: {
              validFrom: {
                title: "Valid From",
                type: "string",
                format: "date",
              },
              validTo: {
                title: "Valid To",
                type: "string",
                format: "date",
              },
            },
          },
        },
      },
    },
  },
  policy: {
    type: "object",
    version: "2",
    label: "policy",
    properties: {
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: [
              "geoCoverageType",
              "geoCoverageValueTransnational",
              "geoCoverageCountries",
              "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "sub-national"],
                enumNames: [
                  "Global",
                  "Transnational",
                  "National",
                  "Subnational",
                ],
              },
              geoCoverageValueTransnational: {
                title: "GEO COVERAGE (Transnational)",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["transnational"],
                },
              },
              geoCoverageCountries: {
                title: "GEO COVERAGE (Countries)",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national", "sub-national"],
                },
              },
              geoCoverageValueSubnationalCity: {
                title: "Subnational Area",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["sub-national"],
                },
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: "Entity connection",
                description: "entity",
                custom: "entity",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: "Individual connection",
                description: "individual",
                custom: "stakeholder",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "stakeholder"],
                  properties: {
                    role: {
                      title: "User role",
                      enum: individualRoleOptions.map((x) =>
                        x !== "Resource Editor"
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, "_")
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: "Indvidual",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 5,
            },
            properties: {
              info: {
                title: "Info And Docs",
                type: "string",
              },
              related: {
                title: "Related Resource",
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        properties: {
          titleGroup: {
            type: "object",
            title: "",
            required: [],
            properties: {
              originalTitle: {
                title: "Original Title",
                type: "string",
              },
              lang: {
                title: "Language",
                default: "en",
                enum: Object.keys(languages).map((langCode) => langCode),
                enumNames: Object.keys(languages).map(
                  (langCode) => languages[langCode].name
                ),
              },
            },
          },
          dataSource: {
            title: "Data Source",
            type: "string",
          },
          typeOfLaw: {
            title: "Type Of Law",
            enum: [
              "Miscellaneous",
              "Legislation",
              "Regulation",
              "Constitution",
            ],
          },
          recordNumber: {
            title: "Record Number",
            type: "string",
          },
          date: {
            type: "object",
            title: "",
            required: [],
            properties: {
              firstPublicationDate: {
                title: "First Publication Date",
                type: "string",
                format: "date",
              },
              latestAmendmentDate: {
                title: "Last Amendment Date",
                type: "string",
                format: "date",
              },
            },
          },
          status: {
            title: "Status",
            enum: ["Repealed", "In force", "Not yet in force"],
          },
          implementingMea: {
            title: "Implementing MEA",
            enum: [],
          },
          topics: {
            title: "Topics",
            enum: [
              "Trade and Investment",
              "Chemicals and waste",
              "Biological diversity",
              "Marine and Freshwater",
              "Climate and Atmosphere",
              "Land and Agriculture",
              "Environmental Governance",
            ],
          },
        },
      },
    },
  },
  financing: {
    type: "object",
    version: "2",
    label: "financing",
    properties: {
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: [
              "geoCoverageType",
              "geoCoverageValueTransnational",
              "geoCoverageCountries",
              // "geoCoverageValueNational",
              // "geoCoverageValueSubnational",
              // "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "sub-national"],
                enumNames: [
                  "Global",
                  "Transnational",
                  "National",
                  "Subnational",
                ],
              },
              geoCoverageValueTransnational: {
                title: "GEO COVERAGE (Transnational)",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["transnational"],
                },
              },
              geoCoverageCountries: {
                title: "GEO COVERAGE (Countries)",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national", "sub-national"],
                },
              },
              // geoCoverageValueNational: {
              //   title: "National",
              //   enum: [],
              //   depend: {
              //     id: "geoCoverageType",
              //     value: ["national"],
              //   },
              // },
              // geoCoverageValueSubnational: {
              //   title: "Subnational",
              //   enum: [],
              //   depend: {
              //     id: "geoCoverageType",
              //     value: ["sub-national"],
              //   },
              // },
              geoCoverageValueSubnationalCity: {
                title: "Subnational Area",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["sub-national"],
                },
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: "Banner",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: "Entity connection",
                description: "entity",
                custom: "entity",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: "Individual connection",
                description: "individual",
                custom: "stakeholder",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "stakeholder"],
                  properties: {
                    role: {
                      title: "User role",
                      enum: individualRoleOptions.map((x) =>
                        x !== "Resource Editor"
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, "_")
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: "Indvidual",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 5,
            },
            properties: {
              info: {
                title: "Info And Docs",
                type: "string",
              },
              related: {
                title: "Related Resource",
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        required: [],
        properties: {
          value: {
            type: "object",
            title: "",
            required: [],
            properties: {
              valueAmount: {
                title: "Value Amount",
                type: "number",
              },
              valueCurrency: {
                title: "Value Currency",
                enum: [],
              },
              valueRemark: {
                title: "Value Remark",
                type: "string",
              },
            },
          },
          date: {
            type: "object",
            title: "",
            required: [],
            properties: {
              validFrom: {
                title: "Valid From",
                type: "string",
                format: "date",
              },
              validTo: {
                title: "Valid To",
                type: "string",
                format: "date",
              },
            },
          },
        },
      },
    },
  },
  technical: {
    type: "object",
    version: "2",
    label: "technical",
    properties: {
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: [
              "geoCoverageType",
              "geoCoverageValueTransnational",
              "geoCoverageCountries",
              // "geoCoverageValueNational",
              // "geoCoverageValueSubnational",
              // "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "sub-national"],
                enumNames: [
                  "Global",
                  "Transnational",
                  "National",
                  "Subnational",
                ],
              },
              geoCoverageValueTransnational: {
                title: "GEO COVERAGE (Transnational)",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["transnational"],
                },
              },
              geoCoverageCountries: {
                title: "GEO COVERAGE (Countries)",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national", "sub-national"],
                },
              },
              // geoCoverageValueNational: {
              //   title: "National",
              //   enum: [],
              //   depend: {
              //     id: "geoCoverageType",
              //     value: ["national"],
              //   },
              // },
              // geoCoverageValueSubnational: {
              //   title: "Subnational Area",
              //   enum: [],
              //   depend: {
              //     id: "geoCoverageType",
              //     value: ["sub-national"],
              //   },
              // },
              geoCoverageValueSubnationalCity: {
                title: "City",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["sub-national"],
                },
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: "Entity connection",
                description: "entity",
                custom: "entity",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: "Individual connection",
                description: "individual",
                custom: "stakeholder",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "stakeholder"],
                  properties: {
                    role: {
                      title: "User role",
                      enum: individualRoleOptions.map((x) =>
                        x !== "Resource Editor"
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, "_")
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: "Indvidual",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 5,
            },
            properties: {
              info: {
                title: "Info And Docs",
                type: "string",
              },
              related: {
                title: "Related Resource",
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        properties: {
          dateOne: {
            type: "object",
            title: "",
            required: [],
            properties: {
              publishYear: {
                title: "Publication Year",
                type: "string",
              },
            },
          },
        },
      },
    },
  },
  case_study: {
    type: "object",
    version: "2",
    label: "case_study",
    properties: {
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: [
              "geoCoverageType",
              "geoCoverageValueTransnational",
              "geoCoverageCountries",
              // "geoCoverageValueNational",
              // "geoCoverageValueSubnational",
              // "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "sub-national"],
                enumNames: [
                  "Global",
                  "Transnational",
                  "National",
                  "Subnational",
                ],
              },
              geoCoverageValueTransnational: {
                title: "GEO COVERAGE (Transnational)",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["transnational"],
                },
              },
              geoCoverageCountries: {
                title: "GEO COVERAGE (Countries)",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national", "sub-national"],
                },
              },
              // geoCoverageValueNational: {
              //   title: "National",
              //   enum: [],
              //   depend: {
              //     id: "geoCoverageType",
              //     value: ["national"],
              //   },
              // },
              // geoCoverageValueSubnational: {
              //   title: "Subnational Area",
              //   enum: [],
              //   depend: {
              //     id: "geoCoverageType",
              //     value: ["sub-national"],
              //   },
              // },
              geoCoverageValueSubnationalCity: {
                title: "City",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["sub-national"],
                },
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: "Entity connection",
                description: "entity",
                custom: "entity",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: "Individual connection",
                description: "individual",
                custom: "stakeholder",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "stakeholder"],
                  properties: {
                    role: {
                      title: "User role",
                      enum: individualRoleOptions.map((x) =>
                        x !== "Resource Editor"
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, "_")
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: "Indvidual",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 5,
            },
            properties: {
              info: {
                title: "Info And Docs",
                type: "string",
              },
              related: {
                title: "Related Resource",
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        properties: {
          dateOne: {
            type: "object",
            title: "",
            required: [],
            properties: {
              publishYear: {
                title: "Publication Year",
                type: "string",
              },
            },
          },
        },
      },
    },
  },
  event_flexible: {
    type: "object",
    version: "2",
    label: "event_flexible",
    properties: {
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: [
              "geoCoverageType",
              "geoCoverageValueTransnational",
              "geoCoverageCountries",
              "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "sub-national"],
                enumNames: [
                  "Global",
                  "Transnational",
                  "National",
                  "Subnational",
                ],
              },
              geoCoverageValueTransnational: {
                title: "GEO COVERAGE (Transnational)",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["transnational"],
                },
              },
              geoCoverageCountries: {
                title: "GEO COVERAGE (Countries)",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national", "sub-national"],
                },
              },
              geoCoverageValueSubnationalCity: {
                title: "Subnational Area",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["sub-national"],
                },
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: "Banner",
                type: "string",
                format: "data-url",
              },
              thumbnail: {
                title: "Thumbnail",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: "Entity connection",
                description: "entity",
                custom: "entity",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: "Individual connection",
                description: "individual",
                custom: "stakeholder",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "stakeholder"],
                  properties: {
                    role: {
                      title: "User role",
                      enum: individualRoleOptions.map((x) =>
                        x !== "Resource Editor"
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, "_")
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: "Indvidual",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 5,
            },
            properties: {
              info: {
                title: "Info And Docs",
                type: "string",
              },
              related: {
                title: "Related Resource",
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        properties: {
          date: {
            type: "object",
            title: "",
            required: ["startDate", "endDate"],
            properties: {
              startDate: {
                title: "Start Date",
                type: "string",
                format: "date",
              },
              endDate: {
                title: "End Date",
                type: "string",
                format: "date",
              },
            },
          },
          recording: {
            title: "Event Recording",
            type: "string",
            format: "url",
          },
          eventType: {
            title: "Event Type",
            enum: ["Online", "In Person", "Hybrid"],
          },
        },
      },
    },
  },
  technology: {
    type: "object",
    version: "2",
    label: "technology",
    properties: {
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: [
              "geoCoverageType",
              "geoCoverageValueTransnational",
              "geoCoverageCountries",
              // "geoCoverageValueNational",
              // "geoCoverageValueSubnational",
              "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "sub-national"],
                enumNames: [
                  "Global",
                  "Transnational",
                  "National",
                  "Subnational",
                ],
              },
              geoCoverageValueTransnational: {
                title: "GEO COVERAGE (Transnational)",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["transnational"],
                },
              },
              geoCoverageCountries: {
                title: "GEO COVERAGE (Countries)",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national", "sub-national"],
                },
              },
              // geoCoverageValueNational: {
              //   title: "National",
              //   enum: [],
              //   depend: {
              //     id: "geoCoverageType",
              //     value: ["national"],
              //   },
              // },
              // geoCoverageValueSubnational: {
              //   title: "Subnational",
              //   enum: [],
              //   depend: {
              //     id: "geoCoverageType",
              //     value: ["sub-national"],
              //   },
              // },
              geoCoverageValueSubnationalCity: {
                title: "Subnational Area",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["sub-national"],
                },
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: "Banner",
                type: "string",
                format: "data-url",
              },
              thumbnail: {
                title: "Thumbnail",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: "Entity connection",
                description: "entity",
                custom: "entity",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: "Individual connection",
                description: "individual",
                custom: "stakeholder",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "stakeholder"],
                  properties: {
                    role: {
                      title: "User role",
                      enum: individualRoleOptions.map((x) =>
                        x !== "Resource Editor"
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, "_")
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: "Indvidual",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 5,
            },
            properties: {
              info: {
                title: "Info And Docs",
                type: "string",
              },
              related: {
                title: "Related Resource",
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        required: [],
        properties: {
          yearFounded: {
            title: "Year Founded",
            type: "string",
          },
          organisationType: {
            title: "ORGANISATION TYPE",
            enum: [
              "Established Company",
              "Research Lab",
              "Academic Institution",
              "Startup",
              "Non-Profit Org",
              "Partnerships",
            ],
          },
        },
      },
    },
  },
};
