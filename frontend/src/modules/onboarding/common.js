import { Store } from "pullstate";

const initialData = {
  tabs: ["S1"],
  required: {
    S1: [],
    S3: [],
    S4: [],
    S5: [],
  },
  S1: {
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
  S6: {
    steps: 0,
    required: {},
  },
  S7: {
    steps: 0,
    required: {},
  },
  S8: {
    steps: 0,
    required: {},
  },
};

const initialFormData = new Store({
  data: initialData,
  editId: null,
});

const tabs = [
  {
    key: "S1",
    title: "Main",
    desc: "",
    steps: [],
  },
  {
    key: "S3",
    title: "Getting Started",
    desc: "",
    steps: [],
  },
  {
    key: "S4",
    title: "Affilation",
    desc: "",
    steps: [],
  },
  {
    key: "S5",
    title: "Entity",
    desc: "",
    steps: [],
  },
  {
    key: "S6",
    title: "Offering",
    desc: "",
    steps: [],
  },
  {
    key: "S7",
    title: "Seeking",
    desc: "",
    steps: [],
  },
  {
    key: "S8",
    title: "About",
    desc: "",
    steps: [],
  },
];

export default {
  initialData,
  tabs,
  initialFormData,
};
