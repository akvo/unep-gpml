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
}) => {
  const prop = cloneDeep(schema.properties);
  const orgs = [...organisations];

  prop.S2.properties["S2_G1_1.1"].enum = orgs?.map((it) => it.id);
  prop.S2.properties["S2_G1_1.1"].enumNames = orgs?.map((it) => it.name);

  prop.S3.properties["S3_G1"].enum = mainContentType?.map((x) => x.code);
  prop.S3.properties["S3_G1"].enumNames = mainContentType?.map((x) => x.name);

  prop.S3.properties["S3_G2"].enum = mainContentType.find(
    (x) => x.code === "initiative"
  )?.childs;

  prop.S3.properties["S3_G3"].enum = mainContentType.find(
    (x) => x.code === "action"
  )?.childs;

  prop.S3.properties["S3_G4"].enum = mainContentType.find(
    (x) => x.code === "policy"
  )?.childs;

  prop.S3.properties["S3_G5"].enum = mainContentType.find(
    (x) => x.code === "financing"
  )?.childs;
  prop.S3.properties["S3_G6"].enum = mainContentType.find(
    (x) => x.code === "technical"
  )?.childs;
  prop.S3.properties["S3_G7"].enum = mainContentType.find(
    (x) => x.code === "event_flexible"
  )?.childs;
  prop.S3.properties["S3_G8"].enum = mainContentType.find(
    (x) => x.code === "technology"
  )?.childs;
  prop.S3.properties["S3_G9"].enum = mainContentType.find(
    (x) => x.code === "capacity_building"
  )?.childs;

  // country options
  prop.S4.properties.S4_G2.properties["S4_G2_5"].enum = countries?.map(
    (x) => x.id
  );
  prop.S4.properties.S4_G2.properties["S4_G2_5"].enumNames = countries?.map(
    (x) => x.name
  );

  prop.S4.properties.S4_G5.properties["S4_G5_11"].enum = organisations?.map(
    (x) => x.id
  );
  prop.S4.properties.S4_G5.properties[
    "S4_G5_11"
  ].enumNames = organisations?.map((x) => x.name);

  prop.S4.properties.S4_G5.properties["S4_G5_13"].enum = [-1].concat(
    nonMemberOrganisations.map((x) => x.id)
  );
  prop.S4.properties.S4_G5.properties["S4_G5_13"].enumNames = ["Other"].concat(
    nonMemberOrganisations.map((x) => x.name)
  );

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

console.log(schema);

export default {
  initialData,
  initialFormData,
  getSchema,
  tabs,
  schema,
};
