import { UIStore } from "../../store";
const {
  geoCoverageTypeOptions,
  newGeoCoverageFormatStakeholder,
  entityRoleOptions,
  individualRoleOptions,
} = UIStore.currentState;

import { newGeoCoverageFormat } from "../../utils/geo";

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
              "geoCoverageValueTransnational",
              "geoCoverageValueNational",
              "geoCoverageValueSubnational",
              "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "subnational"],
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
                  value: ["transnational"],
                },
              },
              geoCoverageValueNational: {
                title: "National",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national"],
                },
              },
              geoCoverageValueSubnational: {
                title: "Subnational",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
                },
              },
              geoCoverageValueSubnationalCity: {
                title: "Subnational Area",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
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
            required: ["individual"],
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
                      enum: individualRoleOptions.map((x) => x.toLowerCase()),
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
              "geoCoverageValueNational",
              "geoCoverageValueSubnational",
              "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "subnational"],
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
                  value: ["transnational"],
                },
              },
              geoCoverageValueNational: {
                title: "National",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national"],
                },
              },
              geoCoverageValueSubnational: {
                title: "Subnational",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
                },
              },
              geoCoverageValueSubnationalCity: {
                title: "Subnational Area",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
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
            required: ["individual"],
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
                      enum: individualRoleOptions.map((x) => x.toLowerCase()),
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
              "geoCoverageValueNational",
              "geoCoverageValueSubnational",
              "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "subnational"],
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
                  value: ["transnational"],
                },
              },
              geoCoverageValueNational: {
                title: "National",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national"],
                },
              },
              geoCoverageValueSubnational: {
                title: "Subnational",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
                },
              },
              geoCoverageValueSubnationalCity: {
                title: "Subnational Area",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
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
            required: ["individual"],
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
                      enum: individualRoleOptions.map((x) => x.toLowerCase()),
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
            title: "Related Resources",
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
              originalTitle: {
                title: "Original Title",
                type: "string",
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
              "geoCoverageValueNational",
              "geoCoverageValueSubnational",
              "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "subnational"],
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
                  value: ["transnational"],
                },
              },
              geoCoverageValueNational: {
                title: "National",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national"],
                },
              },
              geoCoverageValueSubnational: {
                title: "Subnational",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
                },
              },
              geoCoverageValueSubnationalCity: {
                title: "Subnational Area",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
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
            required: ["individual"],
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
                      enum: individualRoleOptions.map((x) => x.toLowerCase()),
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
            title: "Related Resources",
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
          publishYear: {
            title: "Year",
            type: "string",
          },
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
              "geoCoverageValueNational",
              "geoCoverageValueSubnational",
              "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "subnational"],
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
                  value: ["transnational"],
                },
              },
              geoCoverageValueNational: {
                title: "National",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national"],
                },
              },
              geoCoverageValueSubnational: {
                title: "Subnational Area",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
                },
              },
              geoCoverageValueSubnationalCity: {
                title: "City",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
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
            required: ["individual"],
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
                      enum: individualRoleOptions.map((x) => x.toLowerCase()),
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
            title: "Related Resources",
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
              publishYear: {
                title: "PUBLICATION YEAR",
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
              "geoCoverageValueNational",
              "geoCoverageValueSubnational",
              "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "subnational"],
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
                  value: ["transnational"],
                },
              },
              geoCoverageValueNational: {
                title: "National",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national"],
                },
              },
              geoCoverageValueSubnational: {
                title: "Subnational",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
                },
              },
              geoCoverageValueSubnationalCity: {
                title: "Subnational Area",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
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
            required: ["individual"],
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
                      enum: individualRoleOptions.map((x) => x.toLowerCase()),
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
            title: "Related Resources",
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
          eventType: {
            title: "Event Type",
            enum: ["Online", "In Person", "Hybrid"],
          },
          recording: {
            title: "URL",
            type: "string",
            format: "url",
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
              "geoCoverageValueNational",
              "geoCoverageValueSubnational",
              "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: "Select Geo-Coverage Type",
                type: "string",
                enum: ["global", "transnational", "national", "subnational"],
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
                  value: ["transnational"],
                },
              },
              geoCoverageValueNational: {
                title: "National",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["national"],
                },
              },
              geoCoverageValueSubnational: {
                title: "Subnational",
                enum: [],
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
                },
              },
              geoCoverageValueSubnationalCity: {
                title: "Subnational Area",
                type: "string",
                depend: {
                  id: "geoCoverageType",
                  value: ["subnational"],
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
            required: ["individual"],
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
                      enum: individualRoleOptions.map((x) => x.toLowerCase()),
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
            title: "Related Resources",
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
    },
  },
};
