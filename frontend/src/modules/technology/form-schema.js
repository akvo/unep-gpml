import { UIStore } from "../../store";
import specificAreasOptions from "../financing-resource/specific-areas.json";

const {
  languages,
  geoCoverageTypeOptions,
  organisationType,
} = UIStore.currentState;

export const schema = {
  title: "",
  type: "object",
  required: [
    "name",
    "yearFounded",
    "country",
    "geoCoverageType",
    "geoCoverageValueRegional",
    "geoCoverageValueNational",
    "geoCoverageValueGlobalSpesific",
    "geoCoverageValueSubNational",
    "tags",
  ],
  properties: {
    name: {
      title: "TITLE",
      type: "string",
    },
    yearFounded: {
      title: "YEAR FOUNDED",
      type: "string",
    },
    organisationType: {
      title: "ORGANISATION TYPE",
      enum: [
        "Established Company",
        "Research Lab",
        "Academic Institution",
        "Startup",
        "Non-Profit Org",
        "Partnerships",
      ],
    },
    developmentStage: {
      title: "DEVELOPMENT STAGE",
      enum: [
        "In market",
        "Scale up",
        "Prototype",
        "Pilot",
        "Development",
        "Research",
      ],
    },
    specificationProvided: {
      title: "SPECIFICATION PROVIDED",
      type: "boolean",
    },
    url: {
      title: "TECHNOLOGY URL",
      type: "string",
    },
    logo: {
      title: "LOGO",
      type: "string",
      format: "data-url",
    },
    country: {
      title: "COUNTRY",
      enum: [],
    },
    geoCoverageType: {
      title: "GEO COVERAGE TYPE",
      enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
      enumNames: geoCoverageTypeOptions,
    },
    geoCoverageValueRegional: {
      title: "GEO COVERAGE",
      enum: [],
      depend: {
        id: "geoCoverageType",
        value: ["regional"],
      },
    },
    geoCoverageValueNational: {
      title: "GEO COVERAGE",
      enum: [],
      depend: {
        id: "geoCoverageType",
        value: ["national"],
      },
    },
    geoCoverageValueTransnational: {
      title: "GEO COVERAGE",
      enum: [],
      depend: {
        id: "geoCoverageType",
        value: ["transnational"],
      },
    },
    geoCoverageValueSubNational: {
      title: "GEO COVERAGE",
      type: "string",
      depend: {
        id: "geoCoverageType",
        value: ["sub-national"],
      },
    },
    geoCoverageValueGlobalSpesific: {
      title: "GEO COVERAGE",
      enum: specificAreasOptions,
      depend: {
        id: "geoCoverageType",
        value: ["global with elements in specific areas"],
      },
    },
    remarks: {
      title: "DESCRIPTION",
      type: "string",
    },
    image: {
      title: "RESOURCE IMAGE",
      type: "string",
      format: "data-url",
    },
    tags: {
      title: "TAGS",
      enum: [],
    },
    relatedInfo: {
      title: "RELATED INFO & CONTACT",
      type: "object",
      properties: {
        email: {
          title: "EMAIL",
          type: "string",
          format: "email",
        },
        urls: {
          title: "",
          type: "array",
          items: {
            title: "",
            type: "object",
            properties: {
              url: {
                title: "RESOURCE EXTERNAL LINKS",
                type: "string",
              },
              lang: {
                title: "LANGUAGES",
                enum: Object.keys(languages).map((langCode) => langCode),
                enumNames: Object.keys(languages).map(
                  (langCode) => languages[langCode].name
                ),
              },
            },
          },
        },
      },
    },
  },
};

export const uiSchema = {
  name: {
    "ui:placeholder": "Type in the technology title",
  },
  yearFounded: {
    "ui:widget": "date",
    "ui:showSearch": true,
    "ui:span": 12,
    "ui:options": {
      mode: "year",
      allowFuture: true,
    },
  },
  organisationType: {
    "ui:placeholder": "Choose the organisation type",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  developmentStage: {
    "ui:placeholder": "Choose the development stage",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  url: {
    "ui:placeholder": "URL Address (e.g. example.com)",
    "ui:widget": "uri",
    "ui:addOnBefore": "https://",
  },
  logo: {
    "ui:options": { accept: [".jpg", ".png", ".webp"] },
    "ui:widget": "file",
  },
  country: {
    "ui:placeholder": "Choose the technology country",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  geoCoverageType: {
    "ui:placeholder": "Choose the technology coverage type",
    "ui:widget": "select",
  },
  geoCoverageValueRegional: {
    "ui:placeholder": "Choose the technology coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  geoCoverageValueNational: {
    "ui:placeholder": "Choose the technology coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  geoCoverageValueTransnational: {
    "ui:placeholder": "Choose the technology coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  geoCoverageValueSubNational: {
    "ui:placeholder": "Type regions here...",
  },
  geoCoverageValueGlobalSpesific: {
    "ui:placeholder": "Choose the technology coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  remarks: {
    "ui:placeholder": "Max 9999 characters",
    "ui:widget": "textarea",
  },
  image: {
    "ui:options": { accept: [".jpg", ".png", ".webp"] },
    "ui:widget": "file",
  },
  tags: {
    "ui:placeholder": "Pick at least one tag",
    "ui:widget": "select",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  relatedInfo: {
    "ui:group": "border",
    email: {
      "ui:placeholder": "Type in the contact email",
    },
    urls: {
      "ui:options": {
        orderable: false,
      },
      "ui:group": "border",
      items: {
        url: {
          "ui:placeholder": "URL Address (e.g. example.com)",
          "ui:span": 16,
          "ui:widget": "uri",
          "ui:addOnBefore": "https://",
        },
        lang: {
          "ui:showSearch": true,
          "ui:widget": "select",
          "ui:placeholder": "Choose the language",
          "ui:span": 8,
        },
      },
    },
  },
};
