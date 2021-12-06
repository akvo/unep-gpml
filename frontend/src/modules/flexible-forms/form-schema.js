import { UIStore } from "../../store";
const {
  geoCoverageTypeOptions,
  newGeoCoverageFormatStakeholder,
} = UIStore.currentState;

export const schema = {
  initiative: {
    type: "object",
    version: "2",
    label: "initiative",
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
            type: "string",
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
            required: ["S4_G1_2", "S4_G1_3", "S4_G1_4"],
            properties: {
              S4_G1_2: {
                title: "Title",
                type: "string",
              },
              S4_G1_3: {
                title: "Description",
                type: "string",
              },
              S4_G1_4: {
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
            required: ["S4_G2_5", "S4_G2_6"],
            properties: {
              S4_G2_5: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              S4_G2_6: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                dependency: [
                  {
                    value: ["national"],
                    questions: ["S4_G2_6.1"],
                  },
                  {
                    value: ["transnational"],
                    questions: ["S4_G2_6.2"],
                  },
                ],
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              S4_G2_7: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
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
            required: ["S4_G3_8"],
            properties: {
              S4_G3_8: {
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
            required: [""],
            properties: {
              S4_G4_9: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              S4_G4_10: {
                title: "Banner",
                type: "string",
                format: "data-url",
                depend: {
                  id: "S3_G1",
                  value: ["technical"],
                },
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
            required: ["S4_G5_11", "S4_G5_13", "S4_G5_14"],
            properties: {
              S4_G5_11: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              S4_G5_12: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              S4_G5_13: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              S4_G5_14: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
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
            required: [""],
            properties: {
              S5_G1_17: {
                title: "PUBLICATION YEAR",
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
            type: "string",
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
            required: ["S4_G1_2", "S4_G1_3", "S4_G1_4"],
            properties: {
              S4_G1_2: {
                title: "Title",
                type: "string",
              },
              S4_G1_3: {
                title: "Description",
                type: "string",
              },
              S4_G1_4: {
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
            required: ["S4_G2_5", "S4_G2_6"],
            properties: {
              S4_G2_5: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              S4_G2_6: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                dependency: [
                  {
                    value: ["national"],
                    questions: ["S4_G2_6.1"],
                  },
                  {
                    value: ["transnational"],
                    questions: ["S4_G2_6.2"],
                  },
                ],
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              S4_G2_7: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
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
            required: ["S4_G3_8"],
            properties: {
              S4_G3_8: {
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
            required: [""],
            properties: {
              S4_G4_9: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              S4_G4_10: {
                title: "Banner",
                type: "string",
                format: "data-url",
                depend: {
                  id: "S3_G1",
                  value: ["technical"],
                },
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
            required: ["S4_G5_11", "S4_G5_13", "S4_G5_14"],
            properties: {
              S4_G5_11: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              S4_G5_12: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              S4_G5_13: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              S4_G5_14: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
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
            required: [""],
            properties: {
              S5_G1_17: {
                title: "PUBLICATION YEAR",
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
            type: "string",
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
            required: ["S4_G1_2", "S4_G1_3", "S4_G1_4"],
            properties: {
              S4_G1_2: {
                title: "Title",
                type: "string",
              },
              S4_G1_3: {
                title: "Description",
                type: "string",
              },
              S4_G1_4: {
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
            required: ["S4_G2_5", "S4_G2_6"],
            properties: {
              S4_G2_5: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              S4_G2_6: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                dependency: [
                  {
                    value: ["national"],
                    questions: ["S4_G2_6.1"],
                  },
                  {
                    value: ["transnational"],
                    questions: ["S4_G2_6.2"],
                  },
                ],
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              S4_G2_7: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
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
            required: ["S4_G3_8"],
            properties: {
              S4_G3_8: {
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
            required: [""],
            properties: {
              S4_G4_9: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              S4_G4_10: {
                title: "Banner",
                type: "string",
                format: "data-url",
                depend: {
                  id: "S3_G1",
                  value: ["technical"],
                },
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
            required: ["S4_G5_11", "S4_G5_13", "S4_G5_14"],
            properties: {
              S4_G5_11: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              S4_G5_12: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              S4_G5_13: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              S4_G5_14: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
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
            required: [""],
            properties: {
              S5_G1_17: {
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
            type: "string",
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
            required: ["S4_G1_2", "S4_G1_3", "S4_G1_4"],
            properties: {
              S4_G1_2: {
                title: "Title",
                type: "string",
              },
              S4_G1_3: {
                title: "Description",
                type: "string",
              },
              S4_G1_4: {
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
            required: ["S4_G2_5", "S4_G2_6"],
            properties: {
              S4_G2_5: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              S4_G2_6: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                dependency: [
                  {
                    value: ["national"],
                    questions: ["S4_G2_6.1"],
                  },
                  {
                    value: ["transnational"],
                    questions: ["S4_G2_6.2"],
                  },
                ],
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              S4_G2_7: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
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
            required: ["S4_G3_8"],
            properties: {
              S4_G3_8: {
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
            required: [""],
            properties: {
              S4_G4_9: {
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
            required: ["S4_G5_11", "S4_G5_13", "S4_G5_14"],
            properties: {
              S4_G5_11: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              S4_G5_12: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              S4_G5_13: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              S4_G5_14: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
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
            title: "YEAR FOUNDED / YEAR OF COMMENCEMENT",
            type: "string",
          },
          S5_G2: {
            type: "object",
            title: "",
            required: [],
            properties: {
              S5_G2_15: {
                title: "VALUE AMOUNT",
                type: "number",
              },
              S5_G2_16: {
                title: "VALUE CURRENCY",
                enum: [],
              },
              S5_G2_17: {
                title: "VALUE REMARK",
                type: "string",
              },
            },
          },
          S5_G3: {
            type: "object",
            title: "",
            required: [""],
            properties: {
              S5_G3_18: {
                title: "VALID FROM",
                type: "string",
                format: "date",
              },
              S5_G3_19: {
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
            type: "string",
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
            required: ["S4_G1_2", "S4_G1_3", "S4_G1_4"],
            properties: {
              S4_G1_2: {
                title: "Title",
                type: "string",
              },
              S4_G1_3: {
                title: "Description",
                type: "string",
              },
              S4_G1_4: {
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
            required: ["S4_G2_5", "S4_G2_6"],
            properties: {
              S4_G2_5: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              S4_G2_6: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                dependency: [
                  {
                    value: ["national"],
                    questions: ["S4_G2_6.1"],
                  },
                  {
                    value: ["transnational"],
                    questions: ["S4_G2_6.2"],
                  },
                ],
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              S4_G2_7: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
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
            required: ["S4_G3_8"],
            properties: {
              S4_G3_8: {
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
            required: [""],
            properties: {
              S4_G4_9: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              S4_G4_10: {
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
            required: ["S4_G5_11", "S4_G5_13", "S4_G5_14"],
            properties: {
              S4_G5_11: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              S4_G5_12: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              S4_G5_13: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              S4_G5_14: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
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
            required: [""],
            properties: {
              S5_G1_17: {
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
            type: "string",
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
            required: ["S4_G1_2", "S4_G1_3", "S4_G1_4"],
            properties: {
              S4_G1_2: {
                title: "Title",
                type: "string",
              },
              S4_G1_3: {
                title: "Description",
                type: "string",
              },
              S4_G1_4: {
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
            required: ["S4_G2_5", "S4_G2_6"],
            properties: {
              S4_G2_5: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              S4_G2_6: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                dependency: [
                  {
                    value: ["national"],
                    questions: ["S4_G2_6.1"],
                  },
                  {
                    value: ["transnational"],
                    questions: ["S4_G2_6.2"],
                  },
                ],
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              S4_G2_7: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
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
            required: ["S4_G3_8"],
            properties: {
              S4_G3_8: {
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
            required: [""],
            properties: {
              S4_G4_9: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              S4_G4_10: {
                title: "Banner",
                type: "string",
                format: "data-url",
                depend: {
                  id: "S3_G1",
                  value: ["technical"],
                },
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
            required: ["S4_G5_11", "S4_G5_13", "S4_G5_14"],
            properties: {
              S4_G5_11: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              S4_G5_12: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              S4_G5_13: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              S4_G5_14: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
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
            required: [""],
            properties: {
              S5_G1_17: {
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
            type: "string",
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
            required: ["S4_G1_2", "S4_G1_3", "S4_G1_4"],
            properties: {
              S4_G1_2: {
                title: "Title",
                type: "string",
              },
              S4_G1_3: {
                title: "Description",
                type: "string",
              },
              S4_G1_4: {
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
            required: ["S4_G2_5", "S4_G2_6"],
            properties: {
              S4_G2_5: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              S4_G2_6: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                dependency: [
                  {
                    value: ["national"],
                    questions: ["S4_G2_6.1"],
                  },
                  {
                    value: ["transnational"],
                    questions: ["S4_G2_6.2"],
                  },
                ],
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              S4_G2_7: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
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
            required: ["S4_G3_8"],
            properties: {
              S4_G3_8: {
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
            required: [""],
            properties: {
              S4_G4_9: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              S4_G4_10: {
                title: "Banner",
                type: "string",
                format: "data-url",
                depend: {
                  id: "S3_G1",
                  value: ["technical"],
                },
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
            required: ["S4_G5_11", "S4_G5_13", "S4_G5_14"],
            properties: {
              S4_G5_11: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              S4_G5_12: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              S4_G5_13: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              S4_G5_14: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
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
            required: [""],
            properties: {
              S5_G1_17: {
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
            type: "string",
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
            required: ["S4_G1_2", "S4_G1_3", "S4_G1_4"],
            properties: {
              S4_G1_2: {
                title: "Title",
                type: "string",
              },
              S4_G1_3: {
                title: "Description",
                type: "string",
              },
              S4_G1_4: {
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
            required: ["S4_G2_5", "S4_G2_6"],
            properties: {
              S4_G2_5: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              S4_G2_6: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                dependency: [
                  {
                    value: ["national"],
                    questions: ["S4_G2_6.1"],
                  },
                  {
                    value: ["transnational"],
                    questions: ["S4_G2_6.2"],
                  },
                ],
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              S4_G2_7: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
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
            required: ["S4_G3_8"],
            properties: {
              S4_G3_8: {
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
            required: [""],
            properties: {
              S4_G4_9: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              S4_G4_10: {
                title: "Banner",
                type: "string",
                format: "data-url",
                depend: {
                  id: "S3_G1",
                  value: ["technical"],
                },
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
            required: ["S4_G5_11", "S4_G5_13", "S4_G5_14"],
            properties: {
              S4_G5_11: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              S4_G5_12: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              S4_G5_13: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              S4_G5_14: {
                depend: {
                  id: "S4_G5_12",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
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
            required: [""],
            properties: {
              S5_G1_17: {
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
