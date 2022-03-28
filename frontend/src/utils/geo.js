import { UIStore } from "../store";

const {
  languages,
  geoCoverageTypeOptions,
  organisationType,
} = UIStore.currentState;

const geoCoverage = {
  geoCoverageType: {
    title: "Geo Coverage Type",
    enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
    enumNames: geoCoverageTypeOptions,
  },
  geoCoverageValueRegional: {
    title: "Geo Coverage",
    enum: [],
    depend: {
      id: "geoCoverageType",
      value: ["regional"],
    },
  },
  geoCoverageValueNational: {
    title: "Geo Coverage",
    enum: [],
    depend: {
      id: "geoCoverageType",
      value: ["national"],
    },
  },
  geoCoverageValueTransnational: {
    title: "Geo Coverage",
    enum: [],
    depend: {
      id: "geoCoverageType",
      value: ["transnational"],
    },
  },
  geoCoverageValueSubNational: {
    title: "Geo Coverage",
    enum: [],
    depend: {
      id: "geoCoverageType",
      value: ["sub-national"],
    },
  },
  geoCoverageValueGlobalSpesific: {
    title: "Geo Coverage",
    enum: [],
    depend: {
      id: "geoCoverageType",
      value: ["global with elements in specific areas"],
    },
  },
};

const newGeoOptions = ["Global", "Transnational", "National"];

const newGeoCoverageFormat = {
  geoCoverageType: {
    title: "Geo Coverage Type",
    enum: newGeoOptions.map((x) => x.toLowerCase()),
    enumNames: newGeoOptions,
  },
  geoCoverageValueTransnational: {
    title: "Geo Coverage (Transnational)",
    enum: [],
    depend: {
      id: "geoCoverageType",
      value: ["transnational"],
    },
  },
  geoCoverageCountries: {
    title: "Geo Coverage (countries)",
    enum: [],
    depend: {
      id: "geoCoverageType",
      value: ["transnational", "national"],
    },
  },
};

const newGeoCoverageFormatStakeholder = {
  geoCoverageType: {
    title: "Geo Coverage Type",
    enum: newGeoOptions.map((x) => x.toLowerCase()),
    enumNames: newGeoOptions,
  },
  geoCoverageValueTransnational: {
    title: "Geo Coverage",
    enum: [],
    depend: {
      id: "geoCoverageType",
      value: ["transnational"],
    },
  },
  geoCoverageValueNational: {
    title: "Geo Coverage",
    enum: [],
    depend: {
      id: "geoCoverageType",
      value: ["national"],
    },
  },
};

export { geoCoverage, newGeoCoverageFormat, newGeoCoverageFormatStakeholder };
