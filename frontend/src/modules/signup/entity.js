import { Store } from "pullstate";
import { schema } from "./entity-schema";
import cloneDeep from "lodash/cloneDeep";
import { isEmpty } from "lodash";

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
const getSchema = (
  {
    stakeholders,
    countries,
    tags,
    regionOptions,
    transnationalOptions,
    meaOptions,
    sectorOptions,
    organisationType,
    representativeGroup,
    profile,
    nonMemberOrganisations,
  },
  hideEntityPersonalDetail = false
) => {
  const prop = cloneDeep(schema.properties);
  if (!hideEntityPersonalDetail) {
    prop.S2.properties.email.default = profile.email;
    prop.S2.properties.S1_ExpertisesAndActivities.properties[
      "seeking"
    ].enum = !isEmpty(tags) ? tags?.seeking?.map((it) => String(it.id)) : [];
    prop.S2.properties.S1_ExpertisesAndActivities.properties[
      "seeking"
    ].enumNames = !isEmpty(tags) ? tags?.seeking?.map((it) => it.tag) : [];
    prop.S2.properties.S1_ExpertisesAndActivities.properties[
      "offering"
    ].enum = !isEmpty(tags) ? tags?.offering?.map((it) => String(it.id)) : [];
    prop.S2.properties.S1_ExpertisesAndActivities.properties[
      "offering"
    ].enumNames = !isEmpty(tags) ? tags?.offering?.map((it) => it.tag) : [];

    // // country options
    prop.S2.properties["country"].enum = !isEmpty(countries)
      ? countries?.map((x) => x.id)
      : [];
    prop.S2.properties["country"].enumNames = !isEmpty(countries)
      ? countries?.map((x) => x.name)
      : [];
  }

  prop.S3.properties["org.name"].enum = !isEmpty(nonMemberOrganisations)
    ? nonMemberOrganisations?.map((x) => x.name)
    : [];
  prop.S3.properties["org.name"].enumNames = !isEmpty(nonMemberOrganisations)
    ? nonMemberOrganisations?.map((x) => x.name)
    : [];

  const representative = !isEmpty(representativeGroup)
    ? representativeGroup?.map((x) => x.name)
    : [];
  prop.S3.properties["org.representativeGroup"].enum = [...representative, -1];
  prop.S3.properties["org.representativeGroup"].enumNames = [
    ...representative,
    "Other",
  ];
  prop.S3.properties["org.representativeGroupGovernment"].enum = !isEmpty(
    representativeGroup
  )
    ? representativeGroup.find((x) => x.code === "government")?.childs
    : [];
  prop.S3.properties["org.representativeGroupPrivateSector"].enum = !isEmpty(
    tags
  )
    ? tags?.sector?.map((it) => String(it.id))
    : [];
  prop.S3.properties[
    "org.representativeGroupPrivateSector"
  ].enumNames = !isEmpty(tags) ? tags?.sector?.map((it) => it.tag) : [];
  prop.S3.properties["org.representativeGroupAcademiaResearch"].enum = !isEmpty(
    representativeGroup
  )
    ? representativeGroup.find((x) => x.code === "academia-research")?.childs
    : [];
  prop.S3.properties["org.representativeGroupCivilSociety"].enum = !isEmpty(
    representativeGroup
  )
    ? representativeGroup.find((x) => x.code === "civil-society")?.childs
    : [];

  const array = Object.keys(tags)
    .map((k) => tags[k])
    .flat();

  prop.S4.properties["orgExpertise"].enum = array?.map((it) => String(it.id));
  prop.S4.properties["orgExpertise"].enumNames = array?.map((it) => it.tag);
  prop.S5.properties["orgHeadquarter"].enum = !isEmpty(countries)
    ? countries?.map((x) => x.id)
    : [];

  prop.S5.properties["orgHeadquarter"].enumNames = !isEmpty(countries)
    ? countries?.map((x) => x.name)
    : [];
  // prop.S1.properties["registeredStakeholders"].enum = stakeholders?.map((it) =>
  //   String(it.id)
  // );
  // prop.S1.properties["registeredStakeholders"].enumNames = stakeholders?.map(
  //   (it) =>
  //     `${it.firstName} ${it.lastName} ${it.email ? "<" + it.email + ">" : ""}`
  // );

  // geocoverage regional options
  // prop.S5.properties["geoCoverageValueRegional"].enum = regionOptions.map((x) =>
  //   String(x.id)
  // );
  // prop.S5.properties["geoCoverageValueRegional"].enumNames = regionOptions.map(
  //   (x) => x.name
  // );
  // geocoverage national options
  // prop.S5.properties["geoCoverageValueNational"].enum = countries?.map((x) =>
  //   String(x.id)
  // );
  // prop.S5.properties["geoCoverageValueNational"].enumNames = countries?.map(
  //   (x) => x.name
  // );
  // geocoverage sub-national options
  // prop.S5.properties["geoCoverageValueSubNational"].enum = countries?.map(
  //   (x) => x.id
  // );
  // prop.S5.properties["geoCoverageValueSubNational"].enumNames = countries?.map(
  //   (x) => x.name
  // );
  // geocoverage transnational options
  prop.S5.properties["geoCoverageValueTransnational"].enum = !isEmpty(
    transnationalOptions
  )
    ? transnationalOptions?.map((x) => String(x.id))
    : [];
  prop.S5.properties["geoCoverageValueTransnational"].enumNames = !isEmpty(
    transnationalOptions
  )
    ? transnationalOptions?.map((x) => x.name)
    : [];

  prop.S5.properties["geoCoverageCountries"].enum = !isEmpty(countries)
    ? countries?.map((x) => String(x.id))
    : [];
  prop.S5.properties["geoCoverageCountries"].enumNames = !isEmpty(countries)
    ? countries?.map((x) => x.name)
    : [];
  // geocoverage global with elements in specific areas options
  // prop.S5.properties[
  //   "geoCoverageValueGlobalSpesific"
  // ].enum = meaOptions?.map((x) => String(x.id));
  // prop.S5.properties[
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
