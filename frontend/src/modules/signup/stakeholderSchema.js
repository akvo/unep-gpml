import { UIStore } from "../../store";
import { geoCoverage } from "../../utils/geo";

const {
  languages,
  geoCoverageTypeOptions,
  organisationType,
} = UIStore.currentState;

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
      required: ["title", "lastName", "firstName", "email"],
      properties: {
        title: titleField,

        lastName: {
          title: "Last name",
          type: "string",
        },
        firstName: {
          title: "First name",
          type: "string",
        },
        email: {
          title: "Email",
          type: "string",
        },
        publicEmail: {
          title: "Show my email address on public listing",
          type: "boolean",
        },
        linkedIn: {
          title: "LinkedIn",
          type: "string",
        },
        twitter: {
          title: "Twitter",
          type: "string",
        },
        photo: {
          title: "Photo",
          type: "string",
          format: "data-url",
        },
        country: {
          title: "Country",
          type: "integer",
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
      required: [],
      properties: {
        orgName: {
          title: "Search Your Entity",
          type: "string",
        },
        memberName: {
          title: "Is your Entity not a GPML Member yet?",
          type: "string",
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
      required: ["seeking", "offering", "about"],
      properties: {
        seeking: {
          title: "Seeking",
          enum: [],
        },
        offering: {
          title: "Offering",
          enum: [],
        },
        about: {
          title: "About yourself (Bio) (max 100 words)",
          type: "string",
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
    },
  },
};
