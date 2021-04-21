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
    // "org",
    "country",
    "geoCoverageType",
    "geoCoverageValueRegional",
    "geoCoverageValueNational",
    "geoCoverageValueGlobalSpesific",
    "geoCoverageValueSubNational",
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
    // org: {
    //   title: "ENTITY",
    //   enum: [],
    // },
    // newOrg: {
    //   title: "ENTITY DETAILS",
    //   type: "object",
    //   depend: {
    //     id: "org",
    //     value: [-1],
    //   },
    //   required: [
    //     "name",
    //     "type",
    //     "country",
    //     "url",
    //     "geoCoverageType",
    //     "geoCoverageValueNational",
    //     "geoCoverageValueRegional",
    //     "geoCoverageValueGlobalSpesific",
    //     "geoCoverageValueSubNational",
    //   ],
    //   properties: {
    //     name: {
    //       title: "NAME",
    //       type: "string",
    //     },
    //     type: {
    //       title: "TYPE OF THE ENTITY",
    //       enum: organisationType,
    //       enumNames: organisationType,
    //     },
    //     country: {
    //       $ref: "#/properties/country",
    //     },
    //     url: {
    //       title: "ENTITY URL",
    //       type: "string",
    //     },
    //     geoCoverageType: {
    //       $ref: "#/properties/geoCoverageType",
    //     },
    //     geoCoverageValueRegional: {
    //       $ref: "#/properties/geoCoverageValueRegional",
    //       depend: {
    //         id: "geoCoverageType",
    //         value: ["regional"],
    //       },
    //     },
    //     geoCoverageValueNational: {
    //       $ref: "#/properties/geoCoverageValueNational",
    //       depend: {
    //         id: "geoCoverageType",
    //         value: ["national"],
    //       },
    //     },
    //     geoCoverageValueTransnational: {
    //       $ref: "#/properties/geoCoverageValueTransnational",
    //       depend: {
    //         id: "geoCoverageType",
    //         value: ["transnational"],
    //       },
    //     },
    //     geoCoverageValueSubNational: {
    //       $ref: "#/properties/geoCoverageValueSubNational",
    //       depend: {
    //         id: "geoCoverageType",
    //         value: ["sub-national"],
    //       },
    //     },
    //     geoCoverageValueGlobalSpesific: {
    //       $ref: "#/properties/geoCoverageValueGlobalSpesific",
    //       depend: {
    //         id: "geoCoverageType",
    //         value: ["global with elements in specific areas"],
    //       },
    //     },
    //   },
    // },
    dataSource: {
      title: "DATA SOURCE",
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
  // org: {
  //   "ui:showSearch": true,
  //   "ui:placeholder": "Choose organisation",
  // },
  // newOrg: {
  //   "ui:group": "border",
  //   name: {
  //     "ui:placeholder": "Type in entity name",
  //   },
  //   type: {
  //     "ui:placeholder": "Choose entity type",
  //     "ui:widget": "select",
  //   },
  //   country: {
  //     "ui:showSearch": true,
  //     "ui:widget": "select",
  //     "ui:placeholder": "Choose the resource country",
  //   },
  //   url: {
  //     "ui:placeholder": "URL Address",
  //   },
  //   geoCoverageType: {
  //     "ui:placeholder": "Choose the entity coverage type",
  //     "ui:widget": "select",
  //   },
  //   geoCoverageValueRegional: {
  //     "ui:placeholder": "Choose the entity coverage",
  //     "ui:widget": "select",
  //     "ui:showSearch": true,
  //     "ui:mode": "multiple",
  //   },
  //   geoCoverageValueNational: {
  //     "ui:placeholder": "Choose the entity coverage",
  //     "ui:widget": "select",
  //     "ui:showSearch": true,
  //   },
  //   geoCoverageValueTransnational: {
  //     "ui:placeholder": "Choose the resource coverage",
  //     "ui:widget": "select",
  //     "ui:showSearch": true,
  //     "ui:mode": "multiple",
  //   },
  //   geoCoverageValueSubNational: {
  //     "ui:placeholder": "Type regions here...",
  //   },
  //   geoCoverageValueGlobalSpesific: {
  //     "ui:placeholder": "Choose the entity coverage",
  //     "ui:widget": "select",
  //     "ui:showSearch": true,
  //     "ui:mode": "multiple",
  //   },
  // },
  dataSource: {
    "ui:placeholder": "Type in data source",
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
