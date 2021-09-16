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
      required: ["authorizeSubmission"],
      properties: {
        authorizeSubmission: {
          title:
            "By completing this form I confirm that I have the authorization to submit an application on behalf of this Entity to become a member of the Global Partnership on Marine Litter (GPML)​.",
          type: "boolean",
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
      value: ["S2"],
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

        S1_ExpertisesAndActivities: {
          title: "Expertises and activities",
          type: "object",
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
            cv: {
              title: "CV / Portfolio",
              type: "string",
              format: "data-url",
            },
          },
          required: ["seeking", "offering", "about"],
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
      required: ["orgName", "orgRepresentative", "orgDescription", "orgUrl"],
      properties: {
        orgName: {
          title: "What is the name of your Entity?",
          type: "string",
        },
        orgRepresentative: {
          title: "Which representative group fits your Entity?",
          type: "string",
          enum: [],
        },
        orgDescription: {
          title: "Briefly describe your Entity (200 words max)",
          type: "string",
        },
        orgUrl: {
          title: "Your Entity’s website",
          type: "string",
        },
        orgLogo: {
          title: "Upload your Entity’s logo",
          type: "string",
          format: "data-url",
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
      required: ["orgExpertise"],
      properties: {
        orgExpertise: {
          title: "What services/ expertise does your organisation offer",
          enum: [],
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
      required: [
        "orgHeadquarter",
        "geoCoverageType",
        "geoCoverageValueRegional",
        "geoCoverageValueNational",
        "geoCoverageValueTransnational",
        "geoCoverageValueSubNational",
        "geoCoverageValueGlobalSpesific",
        "publicDatabase",
      ],
      properties: {
        orgHeadquarter: {
          title: "In which country are you headquarters?",
          enum: [],
        },
        ...geoCoverage,
        publicDatabase: {
          title:
            "By submitting this form, I will be included in the public database of GPML Digital Platform members and acknowledge that the provided information will be made public and used to find and connect via smart-matchmaking functionalities with other stakeholders and resources.",
          type: "boolean",
        },
      },
    },
  },
};
