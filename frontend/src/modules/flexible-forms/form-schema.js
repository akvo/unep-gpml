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
              "geoCoverageCountries",
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
              banner: {
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
              urls: {
                title:
                  "Links to further information (websites, reports etc). Please provide links, URL's, website links etc to documents about your initiative. We are interested in websites, reports, images, media articles etc.",
                type: "array",
                items: {
                  type: "string",
                  string: true,
                  format: "url",
                },
                add: "Add Link",
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
                title: "PUBLICATION YEARS ",
                type: "string",
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
              banner: {
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
              urls: {
                title:
                  "Links to further information (websites, reports etc). Please provide links, URL's, website links etc to documents about your initiative. We are interested in websites, reports, images, media articles etc.",
                type: "array",
                items: {
                  type: "string",
                  string: true,
                  format: "url",
                },
                add: "Add Link",
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
            title: "Publication Year",
            type: "string",
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
              banner: {
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
              urls: {
                title:
                  "Links to further information (websites, reports etc). Please provide links, URL's, website links etc to documents about your initiative. We are interested in websites, reports, images, media articles etc.",
                type: "array",
                items: {
                  type: "string",
                  string: true,
                  format: "url",
                },
                add: "Add Link",
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
              "geoCoverageCountries",
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
              banner: {
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
              urls: {
                title:
                  "Links to further information (websites, reports etc). Please provide links, URL's, website links etc to documents about your initiative. We are interested in websites, reports, images, media articles etc.",
                type: "array",
                items: {
                  type: "string",
                  string: true,
                  format: "url",
                },
                add: "Add Link",
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
            title: "Year Founded",
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
              "geoCoverageCountries",
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
              urls: {
                title:
                  "Links to further information (websites, reports etc). Please provide links, URL's, website links etc to documents about your initiative. We are interested in websites, reports, images, media articles etc.",
                type: "array",
                items: {
                  type: "string",
                  string: true,
                  format: "url",
                },
                add: "Add Link",
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
              "geoCoverageCountries",
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
              banner: {
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
              urls: {
                title:
                  "Links to further information (websites, reports etc). Please provide links, URL's, website links etc to documents about your initiative. We are interested in websites, reports, images, media articles etc.",
                type: "array",
                items: {
                  type: "string",
                  string: true,
                  format: "url",
                },
                add: "Add Link",
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
            required: [],
            properties: {
              startDate: {
                title: "Start Data",
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
              "geoCoverageCountries",
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
              banner: {
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
              urls: {
                title:
                  "Links to further information (websites, reports etc). Please provide links, URL's, website links etc to documents about your initiative. We are interested in websites, reports, images, media articles etc.",
                type: "array",
                items: {
                  type: "string",
                  string: true,
                  format: "url",
                },
                add: "Add Link",
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
  capacity_building: {
    type: "object",
    version: "2",
    label: "capacity_building",
    properties: {
      S2: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S2"],
        },
        required: ["S2_1"],
        properties: {
          S2_1: {
            title: "Are you directly managing this resource?",
            type: "string",
            enum: ["1-0", "1-1"],
            enumNames: [
              "You are granting editing and deleting rights ",
              "You are categorized as a submitter ",
            ],
          },
          "S2_G1_1.1": {
            title:
              "Please select other individuals that will support in managing the resource.",
            enum: [],
            enumNames: [],
          },
        },
      },
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
              "country",
              "geoCoverageType",
              "geoCoverageValueTransnational",
              "geoCoverageCountries",
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
              banner: {
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
              urls: {
                title:
                  "Links to further information (websites, reports etc). Please provide links, URL's, website links etc to documents about your initiative. We are interested in websites, reports, images, media articles etc.",
                type: "array",
                items: {
                  type: "string",
                  string: true,
                  format: "url",
                },
                add: "Add Link",
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
};
