import { Store } from "pullstate";
import { schema } from "./stakeholder-schema";
import cloneDeep from "lodash/cloneDeep";

const initialSignUpData = {
  tabs: ["S1"],
  required: {
    S1: [],
    S2: [],
    S3: [],
  },
  S1: {
    steps: 0,
    required: {},
  },
  S2: {
    steps: 0,
    required: {},
    privateCitizen: false,
  },
  S3: {
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
  transnationalOptions,
  meaOptions,
  sectorOptions,
  organisations,
  nonMemberOrganisations,
  organisationType,
  profile,
}) => {
  const prop = cloneDeep(schema.properties);
  prop.S1.properties.email.default = profile.email;

  // // country options
  prop.S1.properties["country"].enum = countries?.map((x) => x.id);
  prop.S1.properties["country"].enumNames = countries?.map((x) => x.name);

  prop.S2.properties["orgName"].enum = [
    ...organisations,
    ...nonMemberOrganisations,
  ]?.map((x) => x.id);
  prop.S2.properties["orgName"].enumNames = [
    ...organisations,
    ...nonMemberOrganisations,
  ]?.map((x) => x.name);

  prop.S3.properties["seeking"].enum = tags?.seeking?.map((it) =>
    String(it.id)
  );
  prop.S3.properties["seeking"].enumNames = tags?.seeking?.map((it) => it.tag);
  prop.S3.properties["offering"].enum = tags?.offering?.map((it) =>
    String(it.id)
  );
  prop.S3.properties["offering"].enumNames = tags?.offering?.map(
    (it) => it.tag
  );

  // New Entity S2
  // prop.S2.properties["companyName"].enum = [-1].concat(
  //   nonMemberOrganisations.map((x) => x.id)
  // );
  // prop.S2.properties["companyName"].enumNames = ["Other"].concat(
  //   nonMemberOrganisations.map((x) => x.name)
  // );

  prop.S2.properties["newCompanyHeadquarter"].enum = countries?.map(
    (x) => x.id
  );
  prop.S2.properties["newCompanyHeadquarter"].enumNames = countries?.map(
    (x) => x.name
  );
  // geocoverage regional options
  // prop.S2.properties["geoCoverageValueRegional"].enum = regionOptions.map((x) =>
  //   String(x.id)
  // );
  // prop.S2.properties["geoCoverageValueRegional"].enumNames = regionOptions.map(
  //   (x) => x.name
  // );
  // geocoverage national options
  prop.S2.properties["geoCoverageValueNational"].enum = countries?.map((x) =>
    String(x.id)
  );
  prop.S2.properties["geoCoverageValueNational"].enumNames = countries?.map(
    (x) => x.name
  );
  // geocoverage sub-national options
  // prop.S2.properties["geoCoverageValueSubNational"].enum = countries?.map(
  //   (x) => x.id
  // );
  // prop.S2.properties["geoCoverageValueSubNational"].enumNames = countries?.map(
  //   (x) => x.name
  // );
  // geocoverage transnational options
  prop.S2.properties[
    "geoCoverageValueTransnational"
  ].enum = transnationalOptions?.map((x) => x.id);
  prop.S2.properties[
    "geoCoverageValueTransnational"
  ].enumNames = transnationalOptions?.map((x) => x.name);
  // geocoverage global with elements in specific areas options
  // prop.S2.properties[
  //   "geoCoverageValueGlobalSpesific"
  // ].enum = meaOptions?.map((x) => String(x.id));
  // prop.S2.properties[
  //   "geoCoverageValueGlobalSpesific"
  // ].enumNames = meaOptions?.map((x) => x.name);

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
    title: "Personal Details",
    desc: "",
    steps: [],
  },
  {
    key: "S2",
    title: "Affiliation",
    desc: "",
    steps: [],
  },
  {
    key: "S3",
    title: "Expertise & Activities",
    desc: "",
    steps: [],
  },
];

export default {
  me: "stakeholder",
  initialSignUpData,
  signUpData,
  getSchema,
  tabs,
  schema,
};
