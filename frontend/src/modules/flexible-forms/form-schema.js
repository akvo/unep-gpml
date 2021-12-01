import { UIStore } from "../../store";

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
      required: ["mainContentType"],
      properties: {
        mainContentType: {
          title: "Pick the main content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        initiative: {
          depend: {
            id: "mainContentType",
            value: ["initiative"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        action: {
          depend: {
            id: "mainContentType",
            value: ["action"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        policy: {
          depend: {
            id: "mainContentType",
            value: ["policy"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        financing: {
          depend: {
            id: "mainContentType",
            value: ["financing"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        technical: {
          depend: {
            id: "mainContentType",
            value: ["technical"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        event_flexible: {
          depend: {
            id: "mainContentType",
            value: ["event_flexible"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        technology: {
          depend: {
            id: "mainContentType",
            value: ["technology"],
          },
          title: "Pick the sub-content type",
          type: "string",
          enum: [],
          enumNames: [],
        },
        capacity_building: {
          depend: {
            id: "mainContentType",
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
      },
    },
  },
};
