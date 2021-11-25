import { newGeoCoverageFormat } from "../../utils/geo";

export const schema = {
  title: "",
  type: "object",
  required: [
    "name",
    "representativeGroup",
    "representativeGroupGovernment",
    "representativeGroupPrivateSector",
    "representativeGroupAcademiaResearch",
    "representativeGroupCivilSociety",
    "representativeGroupOther",
    "program",
    "url",
    "expertise",
    "headquarter",
    "geoCoverageType",
    "geoCoverageValueTransnational",
    "geoCoverageCountries",
    "geoCoverageValueNational",
  ],
  properties: {
    name: {
      title: "What is the name of your Entity?",
      type: "string",
    },
    representativeGroup: {
      title: "Which representative group fits your Entity?",
      type: "string",
      enum: [],
    },
    representativeGroupGovernment: {
      depend: {
        id: "representativeGroup",
        value: ["government"],
      },
      title: "Select representative group",
      type: "string",
      enum: [],
    },
    representativeGroupPrivateSector: {
      depend: {
        id: "representativeGroup",
        value: ["private sector (for-profit)"],
      },
      title: "Select representative group",
      type: "string",
      enum: [],
    },
    representativeGroupAcademiaResearch: {
      depend: {
        id: "representativeGroup",
        value: ["academia & research"],
      },
      title: "Select representative group",
      type: "string",
      enum: [],
    },
    representativeGroupCivilSociety: {
      depend: {
        id: "representativeGroup",
        value: ["civil society (not-for-profit)"],
      },
      title: "Select representative group",
      type: "string",
      enum: [],
    },
    representativeGroupOther: {
      depend: {
        id: "representativeGroup",
        value: ["-1"],
      },
      title: "Please specify your representative group",
      type: "string",
    },
    program: {
      title: "Briefly describe your Entity (200 words max)",
      type: "string",
    },
    url: {
      title: "Your Entity’s website",
      type: "string",
      format: "url",
    },
    logo: {
      title: "Upload your Entity’s logo",
      type: "string",
      format: "data-url",
    },
    expertise: {
      title:
        "What areas of interest or expertise does your entity have or offer?",
      enum: [],
    },
    headquarter: {
      title: "In which country are you headquarters?",
      enum: [],
    },
    ...newGeoCoverageFormat,
    geoCoverageType: {
      ...newGeoCoverageFormat.geoCoverageType,
      title: "What is the geographical coverage of your Entity?",
    },
    subnationalArea: {
      title:
        "Please indicate if your Entity operates in a Subnational area only",
      type: "string",
    },
  },
};

export const uiSchema = {
  name: {
    "ui:placeholder": "Entity name",
  },
  representativeGroup: {
    "ui:widget": "radio",
  },
  representativeGroupGovernment: {
    "ui:placeholder": "Search Entity representative",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  representativeGroupPrivateSector: {
    "ui:placeholder": "Search Entity representative",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  representativeGroupAcademiaResearch: {
    "ui:placeholder": "Search Entity representative",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  representativeGroupCivilSociety: {
    "ui:placeholder": "Search Entity representative",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  representativeGroupOther: {
    "ui:placeholder": "Entity representative",
  },
  program: {
    "ui:placeholder": "Organisartion brief",
    "ui:widget": "textarea",
    "ui:maxWord": 200,
  },
  url: {
    "ui:addOnBefore": "https://",
    "ui:widget": "URLWidget",
    "ui:placeholder": "Url",
  },
  logo: {
    "ui:options": { accept: "image/*" },
    "ui:widget": "file",
  },
  expertise: {
    "ui:placeholder": "Search",
    "ui:widget": "select",
    "ui:mode": "multiple",
    "ui:showSearch": true,
  },
  headquarter: {
    "ui:widget": "select",
    "ui:placeholder": "Search",
    "ui:showSearch": true,
  },
  geoCoverageType: {
    "ui:placeholder": "Choose the coverage type",
    "ui:widget": "select",
  },
  geoCoverageValueTransnational: {
    "ui:placeholder": "Choose the coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  geoCoverageValueNational: {
    "ui:placeholder": "Choose the coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
  },
  geoCoverageCountries: {
    "ui:placeholder": "Choose the coverage",
    "ui:widget": "select",
    "ui:showSearch": true,
    "ui:mode": "multiple",
  },
  subnationalArea: {},
  "ui:order": [
    "name",
    "representativeGroup",
    "representativeGroupGovernment",
    "representativeGroupPrivateSector",
    "representativeGroupAcademiaResearch",
    "representativeGroupCivilSociety",
    "representativeGroupOther",
    "program",
    "url",
    "logo",
    "expertise",
    "headquarter",
    "geoCoverageType",
    "geoCoverageValueTransnational",
    "geoCoverageCountries",
    "geoCoverageValueNational",
    "subnationalArea",
  ],
};
