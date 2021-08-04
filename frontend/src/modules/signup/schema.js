import { UIStore } from "../../store";
import { geoCoverage } from "../../utils/geo";

const titleField = {
  title: "Title",
  type: "string",
  dependency: [],
  enum: ["Mr", "Mrs", "Ms", "Dr", "Prof"], //["1-0", "1-1"],
  enumNames: ["Mr", "Mrs", "Ms", "Dr", "Prof"],
};

export const schema = {
  type: "object",
  version: "2",
  properties: {
    S1: {
      title: "",
      type: "object",
      depend: {
        id: "tabs",
        value: ["S1"],
      },
      value: ["S1"],
      required: ["S1_LN", "S1_2", "S1_4"],
      properties: {
        S1_LN: {
          title: "",
          type: "object",
          required: ["S1_1", "S1_3"],
          properties: {
            S1_1: titleField,
            S1_3: {
              title: "Last name",
              type: "string",
            },
          },
        },

        S1_2: {
          title: "First name",
          type: "string",
        },
        S1_4: {
          title: "Email",
          type: "string",
        },
        S1_5: {
          title: "Show my email address on public listing",
          type: "boolean",
        },
        S1_6: {
          title: "LinkedIn",
          type: "string",
        },
        S1_7: {
          title: "Twitter",
          type: "string",
        },
        S1_8: {
          title: "Photo",
          type: "string",
          format: "data-url",
        },
        S1_9: {
          title: "Representative sector",
          enum: [],
          enumNames: [],
        },
        S1_10: {
          title: "Country",
          enum: [],
          enumNames: [],
        },
        ...geoCoverage,
        S1_ExpertisesAndActivities: {
          title: "Expertises and activities",
          type: "object",
          properties: {
            seeking: {
              title: "Seeking",
              enum: [],
              enumNames: [],
            },
            offering: {
              title: "Offering",
              enum: [],
            },
            about: {
              title: "About yourself",
              type: "string",
            },
            tags: {
              title: "Tags",
              enum: [],
            },
            portfolio: {
              title: "CV / Portfolio",
              type: "string",
              format: "data-url",
            },
            public_database: {
              title:
                "By submitting this form, I will be included in the public database of GPML Digital Platform members and acknowledge that the provided information will be made public and used to find and connect via smart-matchmaking functionalities with other stakeholders and resources.",
              type: "boolean",
            },
          },
          required: ["seeking", "offering", "about"],
        },
      },
    },
    S2: {
      title: "",
      type: "object",
      depend: {
        id: "tabs",
        value: ["S2"],
      },
      required: ["S2_1", "S2_2", "S2_3", "S2_4", "S2_5"],
      properties: {
        S2_1: {
          title: "What is the name of your organisation?",
          type: "string",
        },
        S2_2: {
          title: "Which representative groups fits your organisation?",
          type: "string",
          enum: [
            "Governments",
            "IGOs and MEAs",
            "Scientific and technological community and academia",
            "Private sector and Foundations",
            "NGOs, MGS, Foundations and private citizens",
          ],
        },
        S2_3: {
          title: "Briefly describe your organisation",
          type: "string",
        },
        S2_4: {
          title: "Your organisation website",
          type: "string",
        },
        S2_5: {
          title: "Upload your organisation’s logo",
          type: "string",
          format: "data-url",
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
      required: ["S3_1", "S3_2"],
      properties: {
        S3_1: {
          title: "What services/ expertise does your organisation offer*",
          enum: [],
        },

        S3_2: {
          title:
            "What focus area would your organization like to contribute towards?*",
          type: "array",
          uniqueItems: true,
          items: {
            type: "string",
            enum: ["A", "B", "C"],
            enumNames: [
              "Reducing levels and impacts of land-based litter and solid waste introduced into the aquatic environment.",
              "Reducing levels and impacts of sea-based sources of marine debris including solid waste, lost cargo, abandoned lost or discarded fishing gear, and abandoned vessels introduced into the aquatic environment",
              "Reduced levels and impacts of (accumulated) marine debris on shorelines, aquatic habitats, and biodiversity.",
            ],
          },
        },
      },
    },
    S4: {
      title: "SECTION 4: Geo Coverage",
      type: "object",
      depend: {
        id: "tabs",
        value: ["S4"],
      },
      required: ["S4_1", "S4_2"],
      properties: {
        S4_1: {
          title: "In which country are you headquarters?",
          enum: [],
        },
        S4_2: {
          title: "What is the geographical coverage of your organisation?*",
          type: "string",
          enum: ["Global", "Transnational"],
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
      required: ["S5_1"],
      properties: {
        S5_1: {
          title: "Link a registered GPML stakeholder",
          type: "string",
        },
        S5_G1: {
          title: "",
          type: "array",
          items: {
            title: "Add a new stakeholder from your entity",
            type: "object",
            depend: {},
            required: [],
            properties: {
              S5_G1_1: titleField,
              S5_G1_2: {
                title: "Last name",
                type: "string",
              },
              S5_G1_3: {
                title: "First name",
                type: "string",
              },
              S5_G1_4: {
                title: "Email",
                type: "string",
              },
              S5_G1_5: {
                title: "Entity Role",
                type: "string",
              },
            },
          },
        },
      },
    },
  },
};
