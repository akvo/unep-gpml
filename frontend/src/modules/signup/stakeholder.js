import { Store } from "pullstate";
import { schema } from "./stakeholderSchema";
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
  meaOptions,
  sectorOptions,
  organisationType,
  profile,
}) => {
  const prop = cloneDeep(schema.properties);
  prop.S1.properties.email.default = profile.email;

  // // country options
  prop.S1.properties["country"].enum = countries?.map((x) => x.id);
  prop.S1.properties["country"].enumNames = countries?.map((x) => x.name);

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
    title: "Afiliation",
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
