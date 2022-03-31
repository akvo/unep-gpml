import { Store } from "pullstate";
import { schema } from "./form-schema";
import cloneDeep from "lodash/cloneDeep";

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
    S4_G5: { entity: [{}], individual: [] },
  },
  S5: {
    steps: 0,
    required: {},
  },
};

const initialDataEdit = {
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
    S4_G5: { entity: [{}], individual: [{}] },
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
  currencies,
  relatedResource,
}) => {
  const prop = cloneDeep(schema[selectedMainContentType].properties);

  let array = [...organisations, ...nonMemberOrganisations];

  prop.S4.properties.S4_G5.properties[
    "entity"
  ].items.properties.entity.enum = array.map((x) => x.id);
  prop.S4.properties.S4_G5.properties[
    "entity"
  ].items.properties.entity.enumNames = array.map((x) => x.name);

  prop.S4.properties.S4_G5.properties[
    "individual"
  ].items.properties.stakeholder.enum = stakeholders.map((x) => x.id);
  prop.S4.properties.S4_G5.properties[
    "individual"
  ].items.properties.stakeholder.enumNames = stakeholders.map(
    (x) => x.firstName + " " + x.lastName
  );

  // Related Resource
  prop.S4.properties.S4_G6.properties[
    "related"
  ].enum = relatedResource.map((x) => String(x.id));

  prop.S4.properties.S4_G6.properties[
    "related"
  ].enumNames = relatedResource.map((x) => x.title);

  // Related Resource

  if (selectedMainContentType === "initiative") {
    // geocoverage national options
    prop.S4.properties.S4_G2.properties[
      "S4_G2_24.2"
    ].enum = countries?.map((x) => String(x.id));
    prop.S4.properties.S4_G2.properties[
      "S4_G2_24.2"
    ].enumNames = countries?.map((x) => x.name);

    // geocoverage transnational options
    prop.S4.properties.S4_G2.properties[
      "S4_G2_24.3"
    ].enum = transnationalOptions?.map((x) => String(x.id));
    prop.S4.properties.S4_G2.properties[
      "S4_G2_24.3"
    ].enumNames = transnationalOptions?.map((x) => x.name);
    prop.S4.properties.S4_G2.properties[
      "S4_G2_24.3"
    ].countries = transnationalOptions;

    prop.S4.properties.S4_G2.properties[
      "S4_G2_24.4"
    ].enum = countries?.map((x) => String(x.id));
    prop.S4.properties.S4_G2.properties[
      "S4_G2_24.4"
    ].enumNames = countries?.map((x) => x.name);

    prop.S4.properties.S4_G2.properties[
      "geoCoverageValueSubnational"
    ].enum = countries?.map((x) => String(x.id));
    prop.S4.properties.S4_G2.properties[
      "geoCoverageValueSubnational"
    ].enumNames = countries?.map((x) => x.name);

    prop.S5.properties.S5_G1.properties["S5_G5_36.1"].enum = currencies?.map(
      (x) => x.value
    );
    prop.S5.properties.S5_G1.properties[
      "S5_G5_36.1"
    ].enumNames = currencies?.map((x) => x.label);

    prop.S5.properties.S5_G1.properties["S5_G5_37.1"].enum = currencies?.map(
      (x) => x.value
    );
    prop.S5.properties.S5_G1.properties[
      "S5_G5_37.1"
    ].enumNames = currencies?.map((x) => x.label);

    // MEA options
    prop.S5.properties.S5_G1.properties[
      "S5_G2_7.2"
    ].items.enum = meaOptions?.map((x) => String(x.id));
    prop.S5.properties.S5_G1.properties[
      "S5_G2_7.2"
    ].items.enumNames = meaOptions?.map((x) => x.name);
  } else {
    // geocoverage national options
    // prop.S4.properties.S4_G2.properties[
    //   "geoCoverageValueNational"
    // ].enum = countries?.map((x) => String(x.id));
    // prop.S4.properties.S4_G2.properties[
    //   "geoCoverageValueNational"
    // ].enumNames = countries?.map((x) => x.name);

    // geocoverage transnational options

    prop.S4.properties.S4_G2.properties[
      "geoCoverageValueTransnational"
    ].enum = transnationalOptions?.map((x) => String(x.id));
    prop.S4.properties.S4_G2.properties[
      "geoCoverageValueTransnational"
    ].enumNames = transnationalOptions?.map((x) => x.name);
    prop.S4.properties.S4_G2.properties[
      "geoCoverageValueTransnational"
    ].countries = transnationalOptions;

    prop.S4.properties.S4_G2.properties[
      "geoCoverageCountries"
    ].enum = countries?.map((x) => String(x.id));
    prop.S4.properties.S4_G2.properties[
      "geoCoverageCountries"
    ].enumNames = countries?.map((x) => x.name);

    // prop.S4.properties.S4_G2.properties[
    //   "geoCoverageValueSubnational"
    // ].enum = countries?.map((x) => String(x.id));
    // prop.S4.properties.S4_G2.properties[
    //   "geoCoverageValueSubnational"
    // ].enumNames = countries?.map((x) => x.name);
  }

  if (
    selectedMainContentType === "technical" ||
    selectedMainContentType === "action"
  ) {
    let array = Object.keys(tags)
      .map((k) => tags[k])
      .flat();
    const tagsPlusTopics = tags?.topics ? array : array;
    prop.S4.properties.S4_G3.properties[
      "tags"
    ].enum = tagsPlusTopics?.map((x) => String(x.id));
    prop.S4.properties.S4_G3.properties["tags"].enumNames = tagsPlusTopics?.map(
      (x) => x.tag
    );
  }

  if (selectedMainContentType === "event_flexible") {
    let array = Object.keys(tags)
      .map((k) => tags[k])
      .flat();
    const tagsPlusTopics = tags?.topics ? array : array;
    prop.S4.properties.S4_G3.properties[
      "tags"
    ].enum = tagsPlusTopics?.map((x) => String(x.id));
    prop.S4.properties.S4_G3.properties["tags"].enumNames = tagsPlusTopics?.map(
      (x) => x.tag
    );
  }

  if (selectedMainContentType === "initiative") {
    let array = Object.keys(tags)
      .map((k) => tags[k])
      .flat();
    const tagsPlusTopics = tags?.topics ? array : array;
    prop.S4.properties.S4_G3.properties[
      "tags"
    ].enum = tagsPlusTopics?.map((x) => String(x.id));
    prop.S4.properties.S4_G3.properties["tags"].enumNames = tagsPlusTopics?.map(
      (x) => x.tag
    );
  }

  if (selectedMainContentType === "technology") {
    let array = Object.keys(tags)
      .map((k) => tags[k])
      .flat();
    const tagsPlusTopics = tags?.topics ? array : array;
    prop.S4.properties.S4_G3.properties[
      "tags"
    ].enum = tagsPlusTopics?.map((x) => String(x.id));
    prop.S4.properties.S4_G3.properties["tags"].enumNames = tagsPlusTopics?.map(
      (x) => x.tag
    );
  }

  if (selectedMainContentType === "policy") {
    let array = Object.keys(tags)
      .map((k) => tags[k])
      .flat();
    const tagsPlusTopics = tags?.topics ? array : array;
    prop.S4.properties.S4_G3.properties[
      "tags"
    ].enum = tagsPlusTopics?.map((x) => String(x.id));
    prop.S4.properties.S4_G3.properties["tags"].enumNames = tagsPlusTopics?.map(
      (x) => x.tag
    );
    prop.S5.properties["implementingMea"].enum = meaOptions?.map((x) => x.id);
    prop.S5.properties["implementingMea"].enumNames = meaOptions?.map(
      (x) => x.name
    );
  }

  if (selectedMainContentType === "financing") {
    let array = Object.keys(tags)
      .map((k) => tags[k])
      .flat();
    const tagsPlusTopics = tags?.topics ? array : array;
    prop.S4.properties.S4_G3.properties[
      "tags"
    ].enum = tagsPlusTopics?.map((x) => String(x.id));
    prop.S4.properties.S4_G3.properties["tags"].enumNames = tagsPlusTopics?.map(
      (x) => x.tag
    );

    prop.S5.properties.value.properties["valueCurrency"].enum = currencies?.map(
      (x) => x.value
    );
    prop.S5.properties.value.properties[
      "valueCurrency"
    ].enumNames = currencies?.map((x) => x.label);
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
    key: "S3",
    title: "Content type",
    desc: "",
    steps: [
      {
        group: "S3",
        key: "S3-p1-main-content",
        title: "Main & Sub Content",
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
  initialDataEdit,
};
