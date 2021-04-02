export const schema = {
  type: "object",
  required: [
    "title",
    "organisation",
    "valueAmount",
    "valueCurrency",
    "validFrom",
    "languages",
    "country",
    "geoCoverageType",
    "tags",
  ],
  properties: {
    title: {
      title: "TITLE",
      type: "string",
    },
    organisation: {
      title: "ORGANISATION",
      type: "string",
      enum: [],
    },
    publicationYear: {
      title: "PUBLICATION YEAR",
      type: "number",
    },
    value: {
      type: "object",
      title: null,
      required: ["valueAmount", "valueCurrency"],
      properties: {
        valueAmount: {
          title: "VALUE AMOUNT",
          type: "number",
        },
        valueCurrency: {
          title: "VALUE CURRENCY",
          enum: [1, 2],
          enumNames: ["$ US dollars", "Rp Rupiah"],
          default: 1,
        },
        valueRemark: {
          title: "VALUE REMARK",
          type: "string",
        },
      },
    },
    date: {
      type: "object",
      title: null,
      properties: {
        required: ["validFrom"],
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
      type: "string",
      enum: [],
    },
    geoCoverageType: {
      title: "RESOURCE GEO_COVERAGE TYPE",
      enum: [],
    },
    geoCoverageValue: {
      title: "RESOURCE GEO_COVERAGE",
      enum: [],
      depend: {
        id: "geoCoverageType",
        value: [
          "regional",
          "national",
          "sub-national",
          "transnational",
          "global with elements in specific areas",
        ],
      },
    },
    description: {
      title: "DESCRIPTION",
      type: "string",
    },
    image: {
      title: "RESOURCE IMAGE",
      type: "string",
    },
    tags: {
      title: "TAGS",
      type: "string",
      enum: [],
    },
    urls: {
      title: null,
      type: "array",
      items: {
        type: "object",
        properties: {
          link: {
            title: "RESOURCE EXTERNAL LINKS",
            type: "string",
          },
          languages: {
            title: "LANGUAGES",
            enum: [],
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
  organisation: {
    "ui:placeholder": "Chose organisation",
  },
  publicationYear: {
    "ui:placeholder": "YYYY",
  },
  value: {
    "ui:group": "border",
    valueAmount: {
      "ui:placeholder": "Type in the value amount",
      "ui:span": 16,
    },
    valueCurrency: {
      "ui:span": 8,
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
    "ui:placeholder": "Choose the resource country",
  },
  geoCoverageType: {
    "ui:placeholder": "Choose the resource coverage type",
  },
  geoCoverageValue: {
    "ui:placeholder": "Choose the resource coverage",
  },
  description: {
    "ui:placeholder": "Max 9999 characters",
    "ui:widget": "textarea",
  },
  image: {
    "ui:options": { accept: [".jpg", ".png", ".webp"] },
    "ui:widget": "file",
  },
  tags: {
    "ui:placeholder": "Pick at least one tag",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  urls: {
    "ui:options": {
      orderable: false,
    },
    items: {
      link: {
        "ui:placeholder": "URL Address",
        "ui:span": 16,
      },
      languages: {
        "ui:showSearch": true,
        "ui:placeholder": "Choose the language",
        "ui:span": 8,
      },
    },
  },
};
