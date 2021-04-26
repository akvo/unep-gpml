import { UIStore } from "../../store";
import specificAreasOptions from "../financing-resource/specific-areas.json";

const {
  languages,
  geoCoverageTypeOptions,
  regionOptions,
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
      title: "RESOURCE GEO_COVERAGE TYPE",
      enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
      enumNames: geoCoverageTypeOptions,
    },
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
        value: ["national"],
      },
    },
    geoCoverageValueTransnational: {
      title: "RESOURCE GEO_COVERAGE",
      enum: [],
      depend: {
        id: "geoCoverageType",
        value: ["transnational"],
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
      enum: specificAreasOptions,
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
      title: "RESOURCE IMAGE",
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
};

export const uiSchema = {
  title: {
    "ui:placeholder": "Type in resource title",
  },
  originalTitle: {
    "ui:placeholder": "Type in resource original title",
  },
  dataSource: {
    "ui:placeholder": "Type in data source",
  },
  url: {
    "ui:placeholder": "URL Address",
  },
  typeOfLaw: {
    "ui:placeholder": "Choose the organisation type",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  recordNumber: {
    "ui:placeholder": "Type in record number",
  },
  date: {
    firstPublicationDate: {
      "ui:placeholder": "YYYY-MM-DD",
      "ui:widget": "date",
      "ui:span": 12,
    },
    latestAmendmentDate: {
      "ui:placeholder": "YYYY-MM-DD",
      "ui:widget": "date",
      "ui:span": 12,
    },
  },
  status: {
    "ui:placeholder": "Choose the policy status",
    "ui:widget": "select",
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
    "ui:mode": "multiple",
  },
  geoCoverageValueSubNational: {
    "ui:placeholder": "Type regions here...",
  },
  geoCoverageValueGlobalSpesific: {
    "ui:placeholder": "Choose the resource coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  abstract: {
    "ui:placeholder": "Max 9999 characters",
    "ui:widget": "textarea",
  },
  image: {
    "ui:options": { accept: [".jpg", ".png", ".webp"] },
    "ui:widget": "file",
  },
  implementingMea: {
    "ui:placeholder": "Choose implementing MEA",
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
        "ui:placeholder": "URL Address",
        "ui:span": 16,
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
