import { Store } from "pullstate";
import { schema } from "./stakeholder-schema";
import cloneDeep from "lodash/cloneDeep";
import { isEmpty } from "lodash";

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
  stakeholderSuggestedTags,
}) => {
  const prop = cloneDeep(schema.properties);
  prop.S1.properties.email.default = profile.email;

  // // country options
  prop.S1.properties["country"].enum = !isEmpty(countries)
    ? countries?.map((x) => x.id)
    : [];
  prop.S1.properties["country"].enumNames = !isEmpty(countries)
    ? countries?.map((x) => x.name)
    : [];

  prop.S2.properties["orgName"].enum = !isEmpty(organisations)
    ? [...organisations, ...nonMemberOrganisations]?.map((x) => x.id)
    : [];
  prop.S2.properties["orgName"].enumNames = !isEmpty(organisations)
    ? [...organisations, ...nonMemberOrganisations]?.map((x) => x.name)
    : [];

  const array = Object.keys(tags)
    .map((k) => tags[k])
    .flat();

  prop.S3.properties["seeking"].enum = array?.map((it) => String(it.id));
  prop.S3.properties["seeking"].enumNames = array?.map((it) => it.tag);

  prop.S3.properties["seekingSuggestedTags"].enum = stakeholderSuggestedTags;
  prop.S3.properties[
    "seekingSuggestedTags"
  ].enumNames = stakeholderSuggestedTags;

  prop.S3.properties["offeringSuggestedTags"].enum = stakeholderSuggestedTags;
  prop.S3.properties[
    "offeringSuggestedTags"
  ].enumNames = stakeholderSuggestedTags;

  prop.S3.properties["offering"].enum = array?.map((it) => String(it.id));
  prop.S3.properties["offering"].enumNames = array?.map((it) => it.tag);

  // New Entity S2
  // prop.S2.properties["companyName"].enum = [-1].concat(
  //   nonMemberOrganisations.map((x) => x.id)
  // );
  // prop.S2.properties["companyName"].enumNames = ["Other"].concat(
  //   nonMemberOrganisations.map((x) => x.name)
  // );

  prop.S2.properties["newCompanyHeadquarter"].enum = !isEmpty(countries)
    ? countries?.map((x) => x.id)
    : [];
  prop.S2.properties["newCompanyHeadquarter"].enumNames = !isEmpty(countries)
    ? countries?.map((x) => x.name)
    : [];
  // geocoverage regional options
  // prop.S2.properties["geoCoverageValueRegional"].enum = regionOptions.map((x) =>
  //   String(x.id)
  // );
  // prop.S2.properties["geoCoverageValueRegional"].enumNames = regionOptions.map(
  //   (x) => x.name
  // );
  // geocoverage national options
  prop.S2.properties["geoCoverageValueNational"].enum = !isEmpty(countries)
    ? countries?.map((x) => String(x.id))
    : [];
  prop.S2.properties["geoCoverageValueNational"].enumNames = !isEmpty(countries)
    ? countries?.map((x) => x.name)
    : [];
  // geocoverage sub-national options
  // prop.S2.properties["geoCoverageValueSubNational"].enum = countries?.map(
  //   (x) => x.id
  // );
  // prop.S2.properties["geoCoverageValueSubNational"].enumNames = countries?.map(
  //   (x) => x.name
  // );
  // geocoverage transnational options
  prop.S2.properties["geoCoverageValueTransnational"].enum = !isEmpty(
    transnationalOptions
  )
    ? transnationalOptions?.map((x) => x.id)
    : [];
  prop.S2.properties["geoCoverageValueTransnational"].enumNames = !isEmpty(
    transnationalOptions
  )
    ? transnationalOptions?.map((x) => x.name)
    : [];
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
