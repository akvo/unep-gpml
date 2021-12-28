import { UIStore } from "../../store";
const {
  geoCoverageTypeOptions,
  newGeoCoverageFormatStakeholder,
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
            properties: {
              entity_connection: {
                title: "Entity connection",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual_connection: {
                title: "Individual connection",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
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
            properties: {
              entity_connection: {
                title: "",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual_connection: {
                title: "",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
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
  policy: {
    type: "object",
    version: "2",
    label: "policy",
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
            properties: {
              entity_connection: {
                title: "",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual_connection: {
                title: "",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
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
  financing: {
    type: "object",
    version: "2",
    label: "financing",
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
            properties: {
              entity_connection: {
                title: "",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual_connection: {
                title: "",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
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
        required: ["publishYear"],
        properties: {
          publishYear: {
            title: "YEAR FOUNDED / YEAR OF COMMENCEMENT",
            type: "string",
          },
          value: {
            type: "object",
            title: "",
            required: ["valueAmount", "valueCurrency"],
            properties: {
              valueAmount: {
                title: "VALUE AMOUNT",
                type: "number",
              },
              valueCurrency: {
                title: "VALUE CURRENCY",
                enum: [],
              },
              valueRemark: {
                title: "VALUE REMARK",
                type: "string",
              },
            },
          },
          date: {
            type: "object",
            title: "",
            required: ["validFrom"],
            properties: {
              validFrom: {
                title: "VALID FROM",
                type: "string",
                format: "date",
              },
              validTo: {
                title: "VALID TO",
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
            required: ["individual_connection"],
            properties: {
              entity_connection: {
                title: "",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual_connection: {
                title: "",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
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
            properties: {
              entity_connection: {
                title: "",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual_connection: {
                title: "",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
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
  technology: {
    type: "object",
    version: "2",
    label: "technology",
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
            properties: {
              entity_connection: {
                title: "",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual_connection: {
                title: "",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
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
            properties: {
              entity_connection: {
                title: "Entity connection",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual_connection: {
                title: "Individual connection",
                type: "array",
                items: {
                  title: "",
                  type: "object",
                  required: ["role", "entity"],
                  properties: {
                    role: {
                      title: "Entity role",
                      enum: [],
                      enumNames: [],
                    },
                    entity: {
                      title: "Entity",
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
