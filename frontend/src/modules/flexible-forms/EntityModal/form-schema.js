import { UIStore } from "../../../store";

const { geoCoverageTypeOptions, representativeGroup } = UIStore.currentState;

export const schema = {
  title: "",
  type: "object",
  required: [
    "name",
    "url",
    "country",
    "type",
    "geoCoverageType",
    "geoCoverageValueRegional",
    "geoCoverageValueNational",
    "geoCoverageValueTransnational",
    "geoCoverageCountries",
    "geoCoverageValueGlobalSpesific",
    "geoCoverageValueSubNational",
  ],
  properties: {
    name: {
      title: "Name",
      type: "string",
    },
    type: {
      title: "Type of the entity",
      enum: representativeGroup?.map((x) => x.name),
      enumNames: representativeGroup?.map((x) => x.name),
    },
    url: {
      title: "Entity URL",
      type: "string",
      format: "url",
    },
    country: {
      title: "Country",
      enum: [],
    },
    geoCoverageType: {
      title: "Geo coverage type",
      enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
      enumNames: geoCoverageTypeOptions,
    },
    geoCoverageValueRegional: {
      title: "Geo coverage",
      enum: [],
      depend: {
        id: "geoCoverageType",
        value: ["regional"],
      },
    },
    geoCoverageValueNational: {
      title: "Geo coverage",
      enum: [],
      depend: {
        id: "geoCoverageType",
        value: ["national"],
      },
    },
    geoCoverageValueTransnational: {
      title: "Geo coverage",
      enum: [],
      depend: {
        id: "geoCoverageType",
        value: ["transnational"],
      },
    },
    geoCoverageCountries: {
      title: "Geo coverage (Countries)",
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
      title: "Geo coverage",
      enum: [],
      depend: {
        id: "geoCoverageType",
        value: ["global with elements in specific areas"],
      },
    },
  },
};

export const uiSchema = {
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
    "ui:mode": "multiple",
  },
  geoCoverageCountries: {
    "ui:placeholder": "Choose the transnational country",
    "ui:widget": "select",
    "ui:showSearch": true,
    "ui:mode": "multiple",
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
};
