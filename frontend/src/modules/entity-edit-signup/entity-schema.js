import { UIStore } from "../../store";
import { geoCoverage, newGeoCoverageFormat } from "../../utils/geo";

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
        picture: {
          title: "picture",
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
      required: [
        "org.name",
        "org.representativeGroup",
        "org.representativeGroupGovernment",
        "org.representativeGroupPrivateSector",
        "org.representativeGroupAcademiaResearch",
        "org.representativeGroupCivilSociety",
        "org.representativeGroupOther",
        "org.program",
        "org.url",
      ],
      properties: {
        "org.name": {
          title: "What is the name of your Entity?",
          type: "string",
        },
        "org.representativeGroup": {
          title: "Which representative group fits your Entity?",
          type: "string",
          enum: [],
        },
        "org.representativeGroupGovernment": {
          depend: {
            id: "org.representativeGroup",
            value: ["government"],
          },
          title: "Select representative group",
          type: "string",
          enum: [],
        },
        "org.representativeGroupPrivateSector": {
          depend: {
            id: "org.representativeGroup",
            value: ["private sector (for-profit)"],
          },
          title: "Select representative group",
          type: "string",
          enum: [],
        },
        "org.representativeGroupAcademiaResearch": {
          depend: {
            id: "org.representativeGroup",
            value: ["academia and research"],
          },
          title: "Select representative group",
          type: "string",
          enum: [],
        },
        "org.representativeGroupCivilSociety": {
          depend: {
            id: "org.representativeGroup",
            value: ["civil society (not-for-profit)"],
          },
          title: "Select representative group",
          type: "string",
          enum: [],
        },
        "org.representativeGroupOther": {
          depend: {
            id: "org.representativeGroup",
            value: ["-1"],
          },
          title: "Please specify your representative group",
          type: "string",
        },
        "org.program": {
          title: "Briefly describe your Entity (200 words max)",
          type: "string",
        },
        "org.url": {
          title: "Your Entity’s website",
          type: "string",
          format: "url",
        },
        "org.logo": {
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
          title:
            "What areas of interest or expertise does your entity have or offer?",
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
        "geoCoverageValueTransnational",
        "geoCoverageCountries",
        "publicDatabase",
      ],
      properties: {
        orgHeadquarter: {
          title: "In which country are you headquarters?",
          enum: [],
        },
        ...newGeoCoverageFormat,
        geoCoverageType: {
          ...newGeoCoverageFormat.geoCoverageType,
          title: "What is the geographical coverage of your Entity?",
        },
        orgSubnationalArea: {
          title:
            "Please indicate if your Entity operates in a Subnational area only",
          type: "string",
        },
        publicDatabase: {
          title:
            "By submitting this form, I will be included in the public database of GPML Digital Platform members and acknowledge that the provided information will be made public and used to find and connect via smart-matchmaking functionalities with other stakeholders and resources.",
          type: "boolean",
        },
      },
    },
  },
};
