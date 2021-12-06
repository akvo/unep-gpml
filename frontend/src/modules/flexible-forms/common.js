import { Store } from "pullstate";
import { schema } from "./form-schema";
import cloneDeep from "lodash/cloneDeep";

const initialData = {
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
const initialFormData = new Store({
  data: initialData,
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
  organisationType,
  organisations,
  representativeGroup,
  profile,
  mainContentType,
  nonMemberOrganisations,
  selectedMainContentType,
}) => {
  const prop = cloneDeep(schema[selectedMainContentType].properties);
  const orgs = [...organisations];

  prop.S2.properties["S2_G1_1.1"].enum = stakeholders?.map((it) => it.id);
  prop.S2.properties["S2_G1_1.1"].enumNames = stakeholders?.map(
    (it) => it.firstName
  );

  // country options
  prop.S4.properties.S4_G2.properties["country"].enum = countries?.map(
    (x) => x.id
  );
  prop.S4.properties.S4_G2.properties["country"].enumNames = countries?.map(
    (x) => x.name
  );

  let otherArray = [
    {
      id: -1,
      name: "Other",
    },
    {
      id: -2,
      name: "NA",
    },
  ];

  let array = [...organisations, ...nonMemberOrganisations, ...otherArray];

  prop.S4.properties.S4_G5.properties["orgName"].enum = array.map((x) => x.id);
  prop.S4.properties.S4_G5.properties["orgName"].enumNames = array.map(
    (x) => x.name
  );

  prop.S4.properties.S4_G5.properties[
    "newCompanyHeadquarter"
  ].enum = countries?.map((x) => x.id);
  prop.S4.properties.S4_G5.properties[
    "newCompanyHeadquarter"
  ].enumNames = countries?.map((x) => x.name);

  // geocoverage national options
  prop.S4.properties.S4_G2.properties[
    "geoCoverageValueNational"
  ].enum = countries?.map((x) => String(x.id));
  prop.S4.properties.S4_G2.properties[
    "geoCoverageValueNational"
  ].enumNames = countries?.map((x) => x.name);
  // geocoverage transnational options
  prop.S4.properties.S4_G2.properties[
    "geoCoverageValueTransnational"
  ].enum = transnationalOptions?.map((x) => String(x.id));
  prop.S4.properties.S4_G2.properties[
    "geoCoverageValueTransnational"
  ].enumNames = transnationalOptions?.map((x) => x.name);

  prop.S4.properties.S4_G2.properties[
    "geoCoverageCountries"
  ].enum = countries?.map((x) => String(x.id));
  prop.S4.properties.S4_G2.properties[
    "geoCoverageCountries"
  ].enumNames = countries?.map((x) => x.name);

  if (selectedMainContentType === "technical") {
    const tagsPlusTopics = tags?.topics
      ? tags.technicalResourceType?.concat(tags.topics)
      : tags.technicalResourceType;
    prop.S4.properties.S4_G3.properties[
      "tags"
    ].enum = tagsPlusTopics?.map((x) => String(x.id));
    prop.S4.properties.S4_G3.properties["tags"].enumNames = tagsPlusTopics?.map(
      (x) => x.tag
    );
  }

  return {
    schema: {
      ...schema[selectedMainContentType],
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
    title: "Submitter",
    desc: "",
    steps: [
      {
        group: "S1",
        key: "S1-p1-personal-information",
        title: "Personal Information",
        desc: "",
      },
    ],
  },
  {
    key: "S3",
    title: "Content type",
    desc: "",
    steps: [
      {
        group: "S3",
        key: "S3-p1-main-content",
        title: "Main Content",
        desc: "",
      },
      {
        group: "S3",
        key: "S3-p2-sub-content",
        title: "Sub Content",
        desc: "",
      },
    ],
  },
  {
    key: "S4",
    title: "Basic info",
    desc: "",
    steps: [
      {
        group: "S4_G1",
        key: "S4-p1-title-desc",
        title: "Title, Description & Link",
        desc: "",
      },
      {
        group: "S4_G2",
        key: "S4-p2-location",
        title: "Location and Geo-coverage",
        desc: "",
      },
      {
        group: "S4_G3",
        key: "S4-p3-tags",
        title: "Tags",
        desc: "",
      },
      {
        group: "S4_G4",
        key: "S4-p4-img",
        title: "Image",
        desc: "",
      },
      {
        group: "S4_G5",
        key: "S4-p5-stakeholder",
        title: "Stakeholders connections",
        desc: "",
      },
      {
        group: "S4_G6",
        key: "S4-p6-related-content",
        title: "Related Content, Documents & Info",
        desc: "",
      },
    ],
  },
  {
    key: "S5",
    title: "Detail info",
    desc: "",
    steps: [],
  },
];

export default {
  initialData,
  initialFormData,
  getSchema,
  tabs,
  schema,
};
