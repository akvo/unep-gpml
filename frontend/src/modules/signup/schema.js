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
      required: ["titleAndLastName", "firstName", "email"],
      properties: {
        titleAndLastName: {
          title: "",
          type: "object",
          required: ["title", "lastName"],
          properties: {
            title: titleField,
            lastName: {
              title: "Last name",
              type: "string",
            },
          },
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
        linkedin: {
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
        representativeSector: {
          title: "Representative sector",
          enum: [],
          enumNames: [],
        },
        country: {
          title: "Country",
          type: "integer",
        },
        ...geoCoverage,
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
      required: [
        "orgName",
        "orgRepresentative",
        "orgDescription",
        "orgUrl",
        "orgLogo",
      ],
      properties: {
        orgName: {
          title: "What is the name of your organisation?",
          type: "string",
        },
        orgRepresentative: {
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
        orgDescription: {
          title: "Briefly describe your organisation",
          type: "string",
        },
        orgUrl: {
          title: "Your organisation website",
          type: "string",
        },
        orgLogo: {
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
      required: ["orgExpertise", "orgContribution"],
      properties: {
        orgExpertise: {
          title: "What services/ expertise does your organisation offer*",
          enum: [],
        },
        orgContribution: {
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
      title: "",
      type: "object",
      depend: {
        id: "tabs",
        value: ["S4"],
      },
      required: [
        "orgHeadquarter",
        "orgGeocoverageType",
        "orgGeoCoverageValueRegional",
        "orgGeoCoverageValueNational",
        "orgGeoCoverageValueTransnational",
        "orgGeoCoverageValueSubNational",
        "orgGeoCoverageValueGlobalSpesific",
      ],
      properties: {
        orgHeadquarter: {
          title: "In which country are you headquarters?",
          enum: [],
        },
        orgGeocoverageType: {
          title: "What is the geographical coverage of your organisation?*",
          type: "string",
          enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
          enumNames: geoCoverageTypeOptions,
        },
        orgGeoCoverageValueRegional: {
          $ref: "#/properties/S1/properties/geoCoverageValueRegional",
          title: "Regional",
          depend: {
            id: "orgGeocoverageType",
            value: ["regional"],
          },
        },
        orgGeoCoverageValueNational: {
          $ref: "#/properties/S1/properties/geoCoverageValueNational",
          title: "National",
          depend: {
            id: "orgGeocoverageType",
            value: ["national"],
          },
        },
        orgGeoCoverageValueTransnational: {
          $ref: "#/properties/S1/properties/geoCoverageValueTransnational",
          title: "Transnational",
          depend: {
            id: "orgGeocoverageType",
            value: ["transnational"],
          },
        },
        orgGeoCoverageValueSubNational: {
          $ref: "#/properties/S1/properties/geoCoverageValueSubNational",
          title: "Sub-national",
          depend: {
            id: "orgGeocoverageType",
            value: ["sub-national"],
          },
        },
        orgGeoCoverageValueGlobalSpesific: {
          $ref: "#/properties/S1/properties/geoCoverageValueGlobalSpesific",
          title: "Global with elements in specific areas",
          depend: {
            id: "orgGeocoverageType",
            value: ["global with elements in specific areas"],
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
      required: ["registeredStakeholder"],
      properties: {
        registeredStakeholder: {
          title: "Link a registered GPML stakeholder",
          type: "string",
        },
        otherStakeholder: {
          title: "",
          type: "array",
          items: {
            title: "Add a new stakeholder from your entity",
            description:
              "This person will get an email with a link to invite him to complete registration",
            type: "object",
            depend: {},
            required: [],
            properties: {
              stakeholderTitle: titleField,
              stakeholderLastName: {
                title: "Last name",
                type: "string",
              },
              stakeholderFirstName: {
                title: "First name",
                type: "string",
              },
              stakeholderEmail: {
                title: "Email",
                type: "string",
              },
              stakeholderOrgRole: {
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
