import { UIStore } from "../../store";
const {
  geoCoverageTypeOptions,
  newGeoCoverageFormatStakeholder,
} = UIStore.currentState;

export const schema = {
  type: "object",
  version: "2",
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
    S3: {
      title: "",
      type: "object",
      depend: {
        id: "tabs",
        value: ["S3"],
      },
      required: ["S3_G1"],
      properties: {
        S3_G1: {
          title: "Pick the main content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        S3_G2: {
          depend: {
            id: "S3_G1",
            value: ["initiative"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        S3_G3: {
          depend: {
            id: "S3_G1",
            value: ["action"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        S3_G4: {
          depend: {
            id: "S3_G1",
            value: ["policy"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        S3_G5: {
          depend: {
            id: "S3_G1",
            value: ["financing"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        S3_G6: {
          depend: {
            id: "S3_G1",
            value: ["technical"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        S3_G7: {
          depend: {
            id: "S3_G1",
            value: ["event_flexible"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        S3_G8: {
          depend: {
            id: "S3_G1",
            value: ["technology"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        S3_G9: {
          depend: {
            id: "S3_G1",
            value: ["capacity_building"],
          },
          title: "Pick the sub-content type",
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
          required: ["S4_G5_11", "S4_G5_13", "S4_G5_15", "S4_G5_16"],
          properties: {
            S4_G5_11: {
              depend: {
                id: "S4_G5_13",
                value: "not-filled-in",
              },
              title: "Search for a GPML Member Entity",
              enum: [],
            },
            S4_G5_12: {
              depend: {
                id: "S4_G5_13",
                value: "filled-in",
              },
              title: "Search for a GPML Member Entity",
              enum: [],
            },
            S4_G5_13: {
              depend: {
                id: "S4_G5_11",
                value: "not-filled-in",
              },
              title: "Is your Entity not a GPML Member yet?",
              enum: [],
            },
            S4_G5_14: {
              depend: {
                id: "S4_G5_11",
                value: "filled-in",
              },
              title: "Is your Entity not a GPML Member yet?",
              enum: [],
            },
            S4_G5_15: {
              depend: {
                id: "S4_G5_13",
                value: [-1],
              },
              title: "Entity Name",
              type: "string",
            },
            S4_G5_16: {
              depend: {
                id: "S4_G5_13",
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
};
