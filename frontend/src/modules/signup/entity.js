import { Store } from "pullstate";
import { schema } from "./entitySchema";
import cloneDeep from "lodash/cloneDeep";

const initialSignUpData = {
  tabs: ["S1"],
  required: {
    S1: [],
    S2: [],
    S3: [],
    S4: [],
    S5: [],
  },
  S1: {
    steps: 0,
    required: {},
  },
  S2: {
    steps: 0,
    required: {},
  },
  S3: {
    steps: 0,
    required: {},
  },
  S4: {
    steps: 0,
    required: {},
  },
  S5: {
    steps: 0,
    required: {},
  },
};
const signUpData = new Store({
  data: initialSignUpData,
  editId: null,
});
const getSchema = ({
  stakeholders,
  countries,
  tags,
  regionOptions,
  meaOptions,
  sectorOptions,
  organisationType,
  profile,
}) => {
  const prop = cloneDeep(schema.properties);
  prop.S2.properties.email.default = profile.email;
  prop.S2.properties.S1_ExpertisesAndActivities.properties[
    "seeking"
  ].enum = tags?.seeking?.map((it) => String(it.id));
  prop.S2.properties.S1_ExpertisesAndActivities.properties[
    "seeking"
  ].enumNames = tags?.seeking?.map((it) => it.tag);
  prop.S2.properties.S1_ExpertisesAndActivities.properties[
    "offering"
  ].enum = tags?.offering?.map((it) => String(it.id));
  prop.S2.properties.S1_ExpertisesAndActivities.properties[
    "offering"
  ].enumNames = tags?.offering?.map((it) => it.tag);

  // // country options
  prop.S2.properties["country"].enum = countries?.map((x) => x.id);
  prop.S2.properties["country"].enumNames = countries?.map((x) => x.name);

  prop.S3.properties["orgRepresentative"].enum = organisationType;

  prop.S4.properties["orgExpertise"].enum = tags?.offering?.map((it) => it.id);
  prop.S4.properties["orgExpertise"].enumNames = tags?.offering?.map(
    (it) => it.tag
  );
  prop.S5.properties["orgHeadquarter"].enum = countries?.map((x) => x.id);

  prop.S5.properties["orgHeadquarter"].enumNames = countries?.map(
    (x) => x.name
  );
  // prop.S1.properties["registeredStakeholders"].enum = stakeholders?.map((it) =>
  //   String(it.id)
  // );
  // prop.S1.properties["registeredStakeholders"].enumNames = stakeholders?.map(
  //   (it) =>
  //     `${it.firstName} ${it.lastName} ${it.email ? "<" + it.email + ">" : ""}`
  // );

  // geocoverage regional options
  prop.S5.properties["geoCoverageValueRegional"].enum = regionOptions.map((x) =>
    String(x.id)
  );
  prop.S5.properties["geoCoverageValueRegional"].enumNames = regionOptions.map(
    (x) => x.name
  );
  // // geocoverage national options
  prop.S5.properties["geoCoverageValueNational"].enum = countries?.map(
    (x) => x.id
  );
  prop.S5.properties["geoCoverageValueNational"].enumNames = countries?.map(
    (x) => x.name
  );
  // // geocoverage sub-national options
  prop.S5.properties["geoCoverageValueSubNational"].enum = countries?.map(
    (x) => x.id
  );
  prop.S5.properties["geoCoverageValueSubNational"].enumNames = countries?.map(
    (x) => x.name
  );
  // // geocoverage transnational options
  prop.S5.properties[
    "geoCoverageValueTransnational"
  ].enum = countries?.map((x) => String(x.id));
  prop.S5.properties[
    "geoCoverageValueTransnational"
  ].enumNames = countries?.map((x) => x.name);
  // // geocoverage global with elements in specific areas options
  prop.S5.properties[
    "geoCoverageValueGlobalSpesific"
  ].enum = meaOptions?.map((x) => String(x.id));
  prop.S5.properties[
    "geoCoverageValueGlobalSpesific"
  ].enumNames = meaOptions?.map((x) => x.name);

  return {
    schema: {
      ...schema,
      properties: prop,
    },
  };
};

const tabs = [
  {
    key: "S1",
    title: "Getting Started",
    desc: "",
    steps: [],
  },
  {
    key: "S2",
    title: "Personal Details",
    desc: "",
    steps: [],
  },
  {
    key: "S3",
    title: "Entity Details",
    desc: "",
    steps: [],
  },
  {
    key: "S4",
    title: "Area of Expertise",
    desc: "",
    steps: [],
  },
  {
    key: "S5",
    title: "Geo Coverage",
    desc: "",
    steps: [],
  },
];

export default {
  me: "entity",
  initialSignUpData,
  signUpData,
  getSchema,
  tabs,
  schema,
};
