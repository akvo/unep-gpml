import { UIStore } from "../../store";
import specificAreasOptions from "./specific-areas.json";

const {
  languages,
  geoCoverageTypeOptions,
  regionOptions,
  organisationType,
} = UIStore.currentState;

export const schema = {
  type: "object",
  required: [
    "title",
    "org",
    "country",
    "geoCoverageType",
    "geoCoverageValueNational",
    "geoCoverageValueRegional",
    "geoCoverageValueGlobalSpesific",
    "geoCoverageValueSubNational",
    "tags",
  ],
  properties: {
    title: {
      title: "TITLE",
      type: "string",
    },
    org: {
      title: "ENTITY",
      enum: [],
    },
    newOrg: {
      title: "ENTITY DETAILS",
      type: "object",
      depend: {
        id: "org",
        value: [-1],
      },
      required: [
        "name",
        "type",
        "country",
        "url",
        "geoCoverageType",
        "geoCoverageValueNational",
        "geoCoverageValueRegional",
        "geoCoverageValueGlobalSpesific",
        "geoCoverageValueSubNational",
      ],
      properties: {
        name: {
          title: "NAME",
          type: "string",
        },
        type: {
          title: "TYPE OF THE ENTITY",
          enum: organisationType.map((x) => x.toLocaleLowerCase()),
          enumNames: organisationType,
        },
        country: {
          $ref: "#/properties/country",
        },
        url: {
          title: "ENTITY URL",
          type: "string",
        },
        geoCoverageType: {
          $ref: "#/properties/geoCoverageType",
        },
        geoCoverageValueRegional: {
          $ref: "#/properties/geoCoverageValueRegional",
          depend: {
            id: "geoCoverageType",
            value: ["regional"],
          },
        },
        geoCoverageValueNational: {
          $ref: "#/properties/geoCoverageValueNational",
          depend: {
            id: "geoCoverageType",
            value: ["national", "transnational"],
          },
        },
        geoCoverageValueSubNational: {
          $ref: "#/properties/geoCoverageValueSubNational",
          depend: {
            id: "geoCoverageType",
            value: ["sub-national"],
          },
        },
        geoCoverageValueGlobalSpesific: {
          $ref: "#/properties/geoCoverageValueGlobalSpesific",
          depend: {
            id: "geoCoverageType",
            value: ["global with elements in specific areas"],
          },
        },
      },
    },
    publishYear: {
      title: "PUBLICATION YEAR",
      type: "number",
    },
    value: {
      type: "object",
      title: "",
      required: ["valueAmount", "valueCurrency"],
      properties: {
        valueAmount: {
          title: "VALUE AMOUNT",
          type: "number",
        },
        valueCurrency: {
          title: "VALUE CURRENCY",
          enum: [],
        },
        valueRemark: {
          title: "VALUE REMARK",
          type: "string",
        },
      },
    },
    date: {
      type: "object",
      title: "",
      required: ["validFrom"],
      properties: {
        validFrom: {
          title: "VALID FROM",
          type: "string",
        },
        validTo: {
          title: "VALID TO",
          type: "string",
        },
      },
    },
    country: {
      title: "COUNTRY",
      enum: [],
    },
    geoCoverageType: {
      title: "RESOURCE GEO_COVERAGE TYPE",
      enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
      enumNames: geoCoverageTypeOptions,
    },
    // create separate geocoverage value foreach geocoveragetype and used the depend option
    geoCoverageValueRegional: {
      title: "RESOURCE GEO_COVERAGE",
      enum: regionOptions,
      depend: {
        id: "geoCoverageType",
        value: ["regional"],
      },
    },
    geoCoverageValueNational: {
      title: "RESOURCE GEO_COVERAGE",
      enum: [],
      depend: {
        id: "geoCoverageType",
        value: ["national", "transnational"],
      },
    },
    geoCoverageValueSubNational: {
      title: "RESOURCE GEO_COVERAGE",
      type: "string",
      depend: {
        id: "geoCoverageType",
        value: ["sub-national"],
      },
    },
    geoCoverageValueGlobalSpesific: {
      title: "RESOURCE GEO_COVERAGE",
      enum: specificAreasOptions.map((x) => x.toLocaleLowerCase()),
      enumNames: specificAreasOptions,
      depend: {
        id: "geoCoverageType",
        value: ["global with elements in specific areas"],
      },
    },
    summary: {
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
    urls: {
      title: "",
      type: "array",
      items: {
        type: "object",
        properties: {
          url: {
            title: "RESOURCE EXTERNAL LINKS",
            type: "string",
          },
          lang: {
            title: "LANGUAGES",
            type: "string",
            enum: Object.keys(languages).map((langCode) => langCode),
            enumNames: Object.keys(languages).map(
              (langCode) => languages[langCode].name
            ),
          },
        },
      },
    },
  },
};

export const uiSchema = {
  title: {
    "ui:placeholder": "Type in resource title",
  },
  org: {
    "ui:showSearch": true,
    "ui:placeholder": "Choose organisation",
  },
  newOrg: {
    "ui:group": "border",
    name: {
      "ui:placeholder": "Type in entity name",
    },
    type: {
      "ui:placeholder": "Choose entity type",
    },
    country: {
      "ui:showSearch": true,
      "ui:widget": "select",
      "ui:placeholder": "Choose the resource country",
    },
    url: {
      "ui:placeholder": "URL Address",
    },
    geoCoverageType: {
      "ui:placeholder": "Choose the entity coverage type",
    },
    geoCoverageValueRegional: {
      "ui:placeholder": "Choose the entity coverage",
      "ui:showSearch": true,
      "ui:mode": "multiple",
    },
    geoCoverageValueNational: {
      "ui:placeholder": "Choose the entity coverage",
      "ui:showSearch": true,
    },
    geoCoverageValueSubNational: {
      "ui:placeholder": "Type regions here...",
    },
    geoCoverageValueGlobalSpesific: {
      "ui:placeholder": "Choose the entity coverage",
      "ui:showSearch": true,
      "ui:mode": "multiple",
    },
  },
  publishYear: {
    "ui:placeholder": "YYYY",
  },
  value: {
    "ui:group": "border",
    valueAmount: {
      "ui:placeholder": "Type in the value amount",
      "ui:span": 14,
    },
    valueCurrency: {
      "ui:span": 10,
      "ui:showSearch": true,
    },
    valueRemark: {
      "ui:placeholder": "Value remark",
    },
  },
  date: {
    validFrom: {
      "ui:placeholder": "YYYY-MM-DD",
      "ui:widget": "date",
      "ui:span": 12,
    },
    validTo: {
      "ui:placeholder": "YYYY-MM-DD - Leave empty if ongoing",
      "ui:widget": "date",
      "ui:span": 12,
    },
  },
  country: {
    "ui:showSearch": true,
    "ui:widget": "select",
    "ui:placeholder": "Choose the resource country",
  },
  geoCoverageType: {
    "ui:placeholder": "Choose the resource coverage type",
  },
  geoCoverageValueRegional: {
    "ui:placeholder": "Choose the resource coverage",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  geoCoverageValueNational: {
    "ui:placeholder": "Choose the resource coverage",
    "ui:showSearch": true,
  },
  geoCoverageValueSubNational: {
    "ui:placeholder": "Type regions here...",
  },
  geoCoverageValueGlobalSpesific: {
    "ui:placeholder": "Choose the resource coverage",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  summary: {
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
  urls: {
    "ui:options": {
      orderable: false,
    },
    "ui:group": "border",
    items: {
      url: {
        "ui:placeholder": "URL Address",
        "ui:span": 16,
      },
      lang: {
        "ui:showSearch": true,
        "ui:placeholder": "Choose the language",
        "ui:span": 8,
      },
    },
  },
};
