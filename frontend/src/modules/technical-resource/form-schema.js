import { UIStore } from "../../store";

const {
  languages,
  geoCoverageTypeOptions,
  organisationType,
} = UIStore.currentState;

export const schema = {
  title: "",
  type: "object",
  required: [
    "title",
    "org",
    "publishYear",
    "country",
    "geoCoverageType",
    "geoCoverageValueRegional",
    "geoCoverageValueNational",
    "geoCoverageValueTransnational",
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
        "geoCoverageValueTransnational",
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
          enum: organisationType,
          enumNames: organisationType,
        },
        country: {
          $ref: "#/properties/country",
        },
        url: {
          title: "ENTITY URL",
          type: "string",
          format: "url",
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
            value: ["national"],
          },
        },
        geoCoverageValueTransnational: {
          $ref: "#/properties/geoCoverageValueTransnational",
          depend: {
            id: "geoCoverageType",
            value: ["transnational"],
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
      type: "string",
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
      $ref: "#/properties/geoCoverageValueNational",
      depend: {
        id: "geoCoverageType",
        value: ["sub-national"],
      },
    },
    geoCoverageValueGlobalSpesific: {
      title: "GEO COVERAGE",
      enum: [],
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
      title: "IMAGE",
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
        title: "",
        type: "object",
        properties: {
          url: {
            title: "RESOURCE EXTERNAL LINKS",
            type: "string",
            format: "url",
          },
          lang: {
            title: "LANGUAGES",
            default: "en",
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
    "ui:placeholder": "Type in the resource title",
  },
  org: {
    "ui:showSearch": true,
    "ui:placeholder": "Choose the entity",
  },
  newOrg: {
    "ui:group": "border",
    name: {
      "ui:placeholder": "Type in the entity name",
    },
    type: {
      "ui:placeholder": "Choose the entity type",
      "ui:widget": "select",
    },
    country: {
      "ui:showSearch": true,
      "ui:widget": "select",
      "ui:placeholder": "Choose the entity country",
    },
    url: {
      "ui:placeholder": "URL Address (e.g. example.com)",
      "ui:widget": "uri",
      "ui:addOnBefore": "https://",
    },
    geoCoverageType: {
      "ui:placeholder": "Choose the entity coverage type",
      "ui:widget": "select",
    },
    geoCoverageValueRegional: {
      "ui:placeholder": "Choose the entity coverage",
      "ui:widget": "select",
      "ui:showSearch": true,
      "ui:mode": "multiple",
    },
    geoCoverageValueNational: {
      "ui:placeholder": "Choose the entity coverage",
      "ui:widget": "select",
      "ui:showSearch": true,
    },
    geoCoverageValueTransnational: {
      "ui:placeholder": "Choose the entity coverage",
      "ui:widget": "select",
      "ui:showSearch": true,
    },
    geoCoverageValueSubNational: {
      "ui:placeholder": "Choose the entity coverage",
      "ui:widget": "select",
      "ui:showSearch": true,
    },
    geoCoverageValueGlobalSpesific: {
      "ui:placeholder": "Choose the entity coverage",
      "ui:widget": "select",
      "ui:showSearch": true,
      "ui:mode": "multiple",
    },
  },
  publishYear: {
    "ui:widget": "date",
    "ui:showSearch": true,
    "ui:span": 12,
    "ui:options": {
      mode: "year",
      disableDate: "future",
    },
  },
  country: {
    "ui:placeholder": "Choose the resource country",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  geoCoverageType: {
    "ui:placeholder": "Choose the resource coverage type",
    "ui:widget": "select",
  },
  geoCoverageValueRegional: {
    "ui:placeholder": "Choose the resource coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  geoCoverageValueNational: {
    "ui:placeholder": "Choose the resource coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  geoCoverageValueTransnational: {
    "ui:placeholder": "Choose the resource coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  geoCoverageValueSubNational: {
    "ui:placeholder": "Choose the resource coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  geoCoverageValueGlobalSpesific: {
    "ui:placeholder": "Choose the resource coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  summary: {
    "ui:placeholder": "Max 9999 characters",
    "ui:widget": "textarea",
  },
  image: {
    "ui:options": { accept: "image/*" },
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
};
