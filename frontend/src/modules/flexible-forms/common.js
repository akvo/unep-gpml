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
  representativeGroup,
  profile,
  mainContentType,
}) => {
  const prop = cloneDeep(schema.properties);

  prop.S3.properties["mainContentType"].enum = mainContentType?.map(
    (x) => x.code
  );
  prop.S3.properties["mainContentType"].enumNames = mainContentType?.map(
    (x) => x.name
  );

  prop.S3.properties["initiative"].enum = mainContentType.find(
    (x) => x.code === "initiative"
  )?.childs;

  prop.S3.properties["action"].enum = mainContentType.find(
    (x) => x.code === "action"
  )?.childs;

  prop.S3.properties["policy"].enum = mainContentType.find(
    (x) => x.code === "policy"
  )?.childs;

  prop.S3.properties["financing"].enum = mainContentType.find(
    (x) => x.code === "financing"
  )?.childs;
  prop.S3.properties["technical"].enum = mainContentType.find(
    (x) => x.code === "technical"
  )?.childs;
  prop.S3.properties["event"].enum = mainContentType.find(
    (x) => x.code === "event"
  )?.childs;
  prop.S3.properties["technology"].enum = mainContentType.find(
    (x) => x.code === "technology"
  )?.childs;
  prop.S3.properties["capacity_building"].enum = mainContentType.find(
    (x) => x.code === "capacity_building"
  )?.childs;

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
    steps: [],
  },
  {
    key: "S3",
    title: "Content type",
    desc: "",
    steps: [],
  },
  {
    key: "S4",
    title: "Basic info",
    desc: "",
    steps: [],
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
