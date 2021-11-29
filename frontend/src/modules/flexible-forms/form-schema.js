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
        subContentType: {
          depend: {
            id: "mainContentType",
          },
          title: "Pick the sub-content type",
          type: "array",
          items: {
            enum: [],
            enumNames: [],
          },
          uniqueItems: true,
        },
      },
    },
  },
};
