import { UIStore } from "../store";

const {
  languages,
  geoCoverageTypeOptions,
  organisationType,
} = UIStore.currentState;

const geoCoverage = {
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
    //    $ref: "#/properties/geoCoverageValueNational",
    depend: {
      id: "geoCoverageType",
      value: ["sub-national"],
    },
  },
  geoCoverageValueGlobalSpecific: {
    title: "GEO COVERAGE",
    enum: [],
    depend: {
      id: "geoCoverageType",
      value: ["global with elements in specific areas"],
    },
  },
};

export { geoCoverage };
