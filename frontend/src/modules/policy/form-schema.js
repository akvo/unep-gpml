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
    "originalTitle",
    "recordNumber",
    "status",
    "country",
    "geoCoverageType",
    "geoCoverageValueRegional",
    "geoCoverageValueNational",
    "geoCoverageValueTransnational",
    "geoCoverageValueGlobalSpesific",
    "geoCoverageValueSubNational",
    "implementingMea",
    "tags",
  ],
  properties: {
    title: {
      title: "TITLE",
      type: "string",
    },
    originalTitle: {
      title: "ORIGINAL TITLE",
      type: "string",
    },
    dataSource: {
      title: "DATA SOURCE",
      type: "string",
    },
    url: {
      title: "POLICY URL",
      type: "string",
      format: "url",
    },
    typeOfLaw: {
      title: "TYPE OF LAW",
      enum: ["Miscellaneous", "Legislation", "Regulation", "Constitution"],
    },
    recordNumber: {
      title: "RECORD NUMBER",
      type: "string",
    },
    date: {
      type: "object",
      title: "",
      required: ["firstPublicationDate", "latestAmendmentDate"],
      properties: {
        firstPublicationDate: {
          title: "FIRST PUBLICATION DATE",
          type: "string",
          format: "date",
        },
        latestAmendmentDate: {
          title: "LAST AMENDMENT DATE",
          type: "string",
          format: "date",
        },
      },
    },
    status: {
      title: "STATUS",
      enum: ["Repealed", "In force", "Not yet in force"],
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
    abstract: {
      title: "DESCRIPTION",
      type: "string",
    },
    image: {
      title: "IMAGE",
      type: "string",
      format: "data-url",
    },
    implementingMea: {
      title: "IMPLEMENTING MEA",
      enum: [],
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
    "ui:placeholder": "Type in the policy title",
  },
  originalTitle: {
    "ui:placeholder": "Type in the policy original title",
  },
  dataSource: {
    "ui:placeholder": "Type in the data source",
  },
  url: {
    "ui:placeholder": "URL Address (e.g. example.com)",
    "ui:widget": "uri",
    "ui:addOnBefore": "https://",
  },
  typeOfLaw: {
    "ui:placeholder": "Choose the type of law",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  recordNumber: {
    "ui:placeholder": "Type in the record number",
  },
  date: {
    firstPublicationDate: {
      "ui:placeholder": "YYYY-MM-DD",
      "ui:widget": "date",
      "ui:span": 12,
      "ui:options": {
        disableDate: "future",
      },
    },
    latestAmendmentDate: {
      "ui:placeholder": "YYYY-MM-DD",
      "ui:widget": "date",
      "ui:span": 12,
      "ui:options": {
        disableDate: "future",
      },
    },
  },
  status: {
    "ui:placeholder": "Choose the policy status",
    "ui:widget": "select",
  },
  country: {
    "ui:placeholder": "Choose the policy country",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  geoCoverageType: {
    "ui:placeholder": "Choose the policy coverage type",
    "ui:widget": "select",
  },
  geoCoverageValueRegional: {
    "ui:placeholder": "Choose the policy coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  geoCoverageValueNational: {
    "ui:placeholder": "Choose the policy coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  geoCoverageValueTransnational: {
    "ui:placeholder": "Choose the policy coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  geoCoverageValueSubNational: {
    "ui:placeholder": "Choose the policy coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  geoCoverageValueGlobalSpesific: {
    "ui:placeholder": "Choose the policy coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  abstract: {
    "ui:placeholder": "Max 9999 characters",
    "ui:widget": "textarea",
  },
  image: {
    "ui:options": { accept: "image/*" },
    "ui:widget": "file",
  },
  implementingMea: {
    "ui:placeholder": "Choose the implementing MEA",
    "ui:widget": "select",
    "ui:showSearch": true,
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
