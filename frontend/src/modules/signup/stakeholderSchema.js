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
      required: ["title", "lastName", "firstName", "email", "country"],
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
      required: [
        "orgName",
        "companyName",
        "newCompanyName",
        "newCompanyHeadquarter",
        "geoCoverageType",
        "geoCoverageValueRegional",
        "geoCoverageValueNational",
        "geoCoverageValueTransnational",
        "geoCoverageValueSubNational",
        "geoCoverageValueGlobalSpesific",
      ],
      properties: {
        privateCitizen: {
          title: "I am a private citizen",
          type: "boolean",
        },
        orgName: {
          depend: {
            id: "privateCitizen",
            value: false,
            andDepend: {
              id: "companyName",
              value: false, // companyName not filled in
            },
          },
          title: "Search for a GPML Member Entity",
          enum: [],
        },
        orgDisabled: {
          depend: {
            id: "privateCitizen",
            value: true,
            orDepend: {
              id: "companyName",
              value: true, // companyName filled in
            },
          },
          title: "Search for a GPML Member Entity",
          enum: [],
        },
        companyName: {
          depend: {
            id: "privateCitizen",
            value: false,
            andDepend: {
              id: "orgName",
              value: false, // companyName not filled in
            },
          },
          title: "Is your Entity not a GPML Member yet?",
          enum: [],
        },
        companyDisabled: {
          depend: {
            id: "privateCitizen",
            value: true,
            orDepend: {
              id: "orgName",
              value: true, // companyName filled in
            },
          },
          title: "Is your Entity not a GPML Member yet?",
          enum: [],
        },
        newCompanyName: {
          depend: {
            id: "companyName",
            value: [-1],
          },
          title: "Entity Name",
          type: "string",
        },
        newCompanyHeadquarter: {
          depend: {
            id: "companyName",
            value: [-1],
          },
          title: "In which country are your headquarters?",
          enum: [],
        },
        ...geoCoverage,
        geoCoverageType: {
          ...geoCoverage.geoCoverageType,
          depend: {
            id: "companyName",
            value: [-1],
          },
          title: "What is the geographical coverage of your Entity?",
        },
        newCompanySubnationalAreaOnly: {
          depend: {
            id: "companyName",
            value: [-1],
          },
          title:
            "Please indicate if your Entity operates in a Subnational area only",
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
      required: ["seeking", "offering", "about", "publicDatabase"],
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
        publicDatabase: {
          title:
            "By submitting this form, I will be included in the public database of GPML Digital Platform members and acknowledge that the provided information will be made public and used to find and connect via smart-matchmaking functionalities with other stakeholders and resources.",
          type: "boolean",
        },
      },
    },
  },
};
