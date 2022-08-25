import { Store } from "pullstate";
import { schema } from "./form-schema";
import cloneDeep from "lodash/cloneDeep";
import { Form, Input } from "antd";
import RichTextEditor from "react-rte";

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
  S6: {
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
  S6: {
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

  prop.S4.properties.S4_G6.properties["related"].enum = relatedResource?.map(
    (x) => x.id
  );
  prop.S4.properties.S4_G6.properties[
    "related"
  ].enumNames = relatedResource?.map((x) => x.title);

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
  {
    key: "S6",
    title: "Translation",
    desc: "",
    steps: [],
  },
];

const formDataMapping = [
  {
    key: "title",
    name: "title",
    type: "string",
    question: "title",
    section: "S4",
    group: "S4_G1",
  },
  {
    key: "summary",
    name: "summary",
    type: "string",
    question: "summary",
    section: "S4",
    group: "S4_G1",
  },
  {
    key: "url",
    name: "url",
    type: "string",
    question: "url",
    section: "S4",
    group: "S4_G1",
  },
  {
    key: "geoCoverageType",
    name: "geoCoverageType",
    type: "string",
    question: "geoCoverageType",
    section: "S4",
    group: "S4_G2",
  },
  {
    key: "geoCoverageCountries",
    name: "geoCoverageCountries",
    question: "geoCoverageCountries",
    type: "array",
    section: "S4",
    group: "S4_G2",
  },
  {
    key: "geoCoverageCountryGroups",
    name: "geoCoverageCountryGroups",
    question: "geoCoverageValueTransnational",
    type: "array",
    section: "S4",
    group: "S4_G2",
  },
  {
    key: "tags",
    name: "tags",
    question: "tags",
    type: "array",
    section: "S4",
    group: "S4_G3",
  },
  {
    key: "stakeholderConnections",
    name: "stakeholderConnections",
    question: "individual",
    type: "array",
    section: "S4",
    group: "S4_G5",
  },
  {
    key: "entityConnections",
    name: "entityConnections",
    question: "entity",
    type: "array",
    section: "S4",
    group: "S4_G5",
  },
  {
    key: "validFrom",
    name: "validFrom",
    type: "date",
    section: "S5",
    group: "date",
    question: "validFrom",
  },
  {
    key: "validTo",
    name: "validTo",
    type: "date",
    section: "S5",
    group: "date",
    question: "validTo",
  },
  {
    key: "relatedContent",
    name: "relatedContent",
    type: "array",
    section: "S4",
    group: "S4_G6",
    question: "related",
  },
  {
    key: "infoDocs",
    name: "infoDocs",
    type: "string",
    section: "S4",
    group: "S4_G6",
    question: "info",
  },
  {
    key: "publishYear",
    name: "publishYear",
    type: "year",
    group: "dateOne",
    section: "S5",
    question: "publishYear",
  },
  {
    key: "value",
    name: "value",
    group: "value",
    type: "integer",
    section: "S5",
    question: "valueAmount",
  },
  {
    key: "valueCurrency",
    name: "valueCurrency",
    group: "value",
    type: "string",
    section: "S5",
    question: "valueCurrency",
  },
  {
    key: "valueRemarks",
    name: "valueRemarks",
    group: "value",
    type: "string",
    section: "S5",
    question: "valueRemark",
  },
  {
    key: "image",
    name: "image",
    type: "image",
    section: "S4",
    group: "S4_G4",
    question: "image",
  },
  {
    key: "qimage",
    name: "qimage",
    type: "image",
    section: "S4",
    group: "S4_G4",
    question: "image",
  },
  {
    key: "thumbnail",
    name: "thumbnail",
    type: "thumbnail",
    section: "S4",
    group: "S4_G4",
    question: "thumbnail",
  },
  {
    key: "originalTitle",
    name: "originalTitle",
    group: null,
    type: "string",
    section: "S5",
    question: "originalTitle",
  },
  {
    key: "dataSource",
    name: "dataSource",
    group: null,
    type: "string",
    section: "S5",
    question: "dataSource",
  },
  {
    key: "typeOfLaw",
    name: "typeOfLaw",
    group: null,
    type: "string",
    section: "S5",
    question: "typeOfLaw",
  },
  {
    key: "recordNumber",
    name: "recordNumber",
    group: null,
    type: "string",
    section: "S5",
    question: "recordNumber",
  },
  {
    key: "implementingMea",
    name: "implementingMea",
    group: null,
    type: "integer",
    section: "S5",
    question: "implementingMea",
  },
  {
    key: "status",
    name: "status",
    group: null,
    type: "string",
    section: "S5",
    question: "status",
  },
  {
    key: "topics",
    name: "topics",
    group: null,
    type: "string",
    section: "S5",
    question: "topics",
  },
  {
    key: "firstPublicationDate",
    name: "firstPublicationDate",
    group: "date",
    type: "date",
    section: "S5",
    question: "firstPublicationDate",
  },
  {
    key: "latestAmendmentDate",
    name: "latestAmendmentDate",
    group: "date",
    type: "date",
    section: "S5",
    question: "latestAmendmentDate",
  },
  {
    key: "startDate",
    name: "startDate",
    group: "date",
    type: "date",
    section: "S5",
    question: "startDate",
  },
  {
    key: "endDate",
    name: "endDate",
    group: "date",
    type: "date",
    section: "S5",
    question: "endDate",
  },
  {
    key: "eventType",
    name: "eventType",
    group: null,
    type: "string",
    section: "S5",
    question: "eventType",
  },
  {
    key: "yearFounded",
    name: "yearFounded",
    group: null,
    type: "year",
    section: "S5",
    question: "yearFounded",
  },
  {
    key: "organisationType",
    name: "organisationType",
    group: null,
    type: "string",
    section: "S5",
    question: "organisationType",
  },
  {
    name: "q24_3",
    group: "S4_G2",
    type: "option",
    section: "S4",
    question: "S4_G2_24.4",
  },
  {
    name: "q24_2",
    group: "S4_G2",
    type: "option",
    section: "S4",
    question: "geoCoverageValueSubnational",
  },
  {
    name: "q24_2",
    group: "S4_G2",
    type: "option",
    section: "S4",
    question: "S4_G2_24.2",
  },
  {
    name: "q24_subnational_city",
    group: "S4_G2",
    type: "string",
    section: "S4",
    question: "geoCoverageValueSubnationalCity",
  },
  {
    name: "q24_4",
    group: "S4_G2",
    type: "option",
    section: "S4",
    question: "S4_G2_24.3",
  },
  {
    name: "q24",
    section: "S4",
    group: "S4_G2",
    question: "geoCoverageType",
    type: "option",
  },
  {
    name: "q2",
    section: "S4",
    group: "S4_G1",
    question: "title",
    type: "string",
  },
  {
    name: "q3",
    section: "S4",
    group: "S4_G1",
    question: "summary",
    type: "string",
  },
  {
    name: "tags",
    section: "S4",
    group: "S4_G3",
    question: "tags",
    type: "array",
  },
  {
    key: "stakeholder_connections",
    name: "stakeholder_connections",
    question: "individual",
    type: "array",
    section: "S4",
    group: "S4_G5",
  },
  {
    key: "info_docs",
    name: "info_docs",
    type: "string",
    section: "S4",
    group: "S4_G6",
    question: "info",
  },
  {
    key: "entity_connections",
    name: "entity_connections",
    question: "entity",
    type: "array",
    section: "S4",
    group: "S4_G5",
  },
  {
    name: "q4",
    section: "S5",
    group: "S5_G1",
    question: "S5_G1_4",
    type: "multiple-option",
  },
  {
    key: "related_content",
    name: "related_content",
    type: "array",
    section: "S4",
    group: "S4_G6",
    question: "related",
  },
  {
    name: "q4_1_1",
    section: "S5",
    group: "S5_G1",
    question: "S5_G1_4.1.1",
    type: "multiple-option",
  },
  {
    name: "q5",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_5",
    type: "option",
  },
  {
    name: "q4",
    section: "S5",
    group: "S5_G1",
    question: "S5_G1_4",
    type: "multiple-option",
  },
  {
    name: "q4_4_1",
    section: "S5",
    group: "S5_G1",
    question: "S5_G1_4.4.1",
    type: "multiple-option",
  },
  {
    name: "q4_4_2",
    section: "S5",
    group: "S5_G1",
    question: "S5_G1_4.4.2",
    type: "string",
  },
  {
    name: "q4_4_3",
    section: "S5",
    group: "S5_G1",
    question: "S5_G1_4.4.3",
    type: "string",
  },
  {
    name: "q4_4_4",
    section: "S5",
    group: "S5_G1",
    question: "S5_G1_4.4.4",
    type: "string",
  },
  {
    name: "q4_4_5",
    section: "S5",
    group: "S5_G1",
    question: "S5_G1_4.4.5",
    type: "string",
  },
  {
    name: "q5",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_5",
    type: "option",
  },
  {
    name: "q6",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_6",
    type: "string",
  },
  {
    name: "q7",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_7",
    type: "multiple-option",
  },
  {
    name: "q7_1_0",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_7.1.0",
    type: "multiple-option",
  },
  {
    name: "q7_1_1",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_7.1.1",
    type: "multiple-option",
  },
  {
    name: "q7_1_2",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_7.1.2",
    type: "multiple-option",
  },
  {
    name: "q7_2",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_7.2",
    type: "multiple-option",
  },
  {
    name: "q7_3",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_7.3",
    type: "string",
  },
  {
    name: "q8",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_8",
    type: "option",
  },
  {
    name: "q9",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_9",
    type: "string",
  },
  {
    name: "q10",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_10",
    type: "option",
  },
  {
    name: "q11",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_11",
    type: "multiple-option",
  },
  {
    name: "q12",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_12",
    type: "string",
  },
  {
    name: "q13",
    section: "S5",
    group: "S5_G1",
    question: "S5_G2_13",
    type: "string",
  },
  {
    name: "q14",
    section: "S5",
    group: "S5_G1",
    question: "S5_G3_14",
    type: "multiple-option",
  },
  {
    name: "q15",
    section: "S5",
    group: "S5_G1",
    question: "S5_G3_15",
    type: "multiple-option",
  },
  {
    name: "q26",
    section: "S5",
    group: "S5_G1",
    question: "S5_G3_26",
    type: "multiple-option",
  },
  {
    name: "q27",
    section: "S5",
    group: "S5_G1",
    question: "S5_G3_27",
    type: "string",
  },
  {
    name: "q28",
    section: "S5",
    group: "S5_G1",
    question: "S5_G3_28",
    type: "multiple-option",
  },
  {
    name: "q29",
    section: "S5",
    group: "S5_G1",
    question: "S5_G3_29",
    type: "string",
  },
  {
    name: "q30",
    section: "S5",
    group: "S5_G1",
    question: "S5_G3_30",
    type: "multiple-option",
  },
  {
    name: "q31",
    section: "S5",
    group: "S5_G1",
    question: "S5_G3_31",
    type: "string",
  },
  {
    name: "q33",
    section: "S5",
    group: "S5_G1",
    question: "S5_G4_33",
    type: "string",
  },
  {
    name: "q34",
    section: "S5",
    group: "S5_G1",
    question: "S5_G4_34",
    type: "number",
  },
  {
    name: "q35",
    section: "S5",
    group: "S5_G1",
    question: "S5_G5_35",
    type: "option",
  },
  {
    name: "q35_1",
    section: "S5",
    group: "S5_G1",
    question: "S5_G5_35.1",
    type: "string",
  },
  {
    name: "q36",
    section: "S5",
    group: "S5_G1",
    question: "S5_G5_36",
    type: "number",
  },
  {
    name: "q36_1",
    section: "S5",
    group: "S5_G1",
    question: "S5_G5_36.1",
    type: "option",
  },
  {
    name: "q37",
    section: "S5",
    group: "S5_G1",
    question: "S5_G5_37",
    type: "number",
  },
  {
    name: "q37_1",
    section: "S5",
    group: "S5_G1",
    question: "S5_G5_37.1",
    type: "option",
  },
  {
    name: "q38",
    section: "S5",
    group: "S5_G1",
    question: "S5_G6_38",
    type: "option",
  },
  {
    name: "q39",
    section: "S5",
    group: "S5_G1",
    question: "S5_G6_39",
    type: "string",
  },
  {
    name: "q41",
    section: "S5",
    group: "S5_G1",
    question: "S5_G7_41",
    type: "option",
  },
  {
    name: "q41_1",
    section: "S5",
    group: "S5_G1",
    question: "S5_G7_41.1",
    type: "string",
  },
  {
    name: "q4_2_1",
    section: "S5",
    group: "S5_G1",
    question: "S5_G1_4.2.1",
    type: "multiple-option",
  },
];

const getTranslationForm = (
  type,
  handleTranslationChange,
  item,
  toolbarConfig,
  handleChange,
  value
) => {
  switch (type) {
    case "Action Plan":
      return (
        <>
          <Form.Item label="Title">
            <Input
              placeholder="Title"
              onChange={(e) =>
                handleTranslationChange("title", item, e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input
              placeholder="Description"
              onChange={(e) =>
                handleTranslationChange("summary", item, e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="Documents & Info">
            <RichTextEditor
              toolbarConfig={toolbarConfig}
              onChange={(v) => handleChange(v, item)}
              placeholder="Start typing here...."
              value={
                value.find(({ lang }) => lang === item)
                  ? value.find(({ lang }) => lang === item).value
                  : value[0].value
              }
            />
          </Form.Item>
        </>
      );
    case "Technical Resource":
      return (
        <>
          <Form.Item label="Title">
            <Input
              placeholder="Title"
              onChange={(e) =>
                handleTranslationChange("title", item, e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input
              placeholder="Description"
              onChange={(e) =>
                handleTranslationChange("summary", item, e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="Documents & Info">
            <RichTextEditor
              toolbarConfig={toolbarConfig}
              onChange={(v) => handleChange(v, item)}
              placeholder="Start typing here...."
              value={
                value.find(({ lang }) => lang === item)
                  ? value.find(({ lang }) => lang === item).value
                  : value[0].value
              }
            />
          </Form.Item>
        </>
      );
    case "Policy":
      return (
        <>
          <Form.Item label="Title">
            <Input
              placeholder="Title"
              onChange={(e) =>
                handleTranslationChange("title", item, e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input
              placeholder="Description"
              onChange={(e) =>
                handleTranslationChange("abstract", item, e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="Documents & Info">
            <RichTextEditor
              toolbarConfig={toolbarConfig}
              onChange={(v) => handleChange(v, item)}
              placeholder="Start typing here...."
              value={
                value.find(({ lang }) => lang === item)
                  ? value.find(({ lang }) => lang === item).value
                  : value[0].value
              }
            />
          </Form.Item>
        </>
      );
    case "Event":
      return (
        <>
          <Form.Item label="Title">
            <Input
              placeholder="Title"
              onChange={(e) =>
                handleTranslationChange("title", item, e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input
              placeholder="Description"
              onChange={(e) =>
                handleTranslationChange("description", item, e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="Documents & Info">
            <RichTextEditor
              toolbarConfig={toolbarConfig}
              onChange={(v) => handleChange(v, item)}
              placeholder="Start typing here...."
              value={
                value.find(({ lang }) => lang === item)
                  ? value.find(({ lang }) => lang === item).value
                  : value[0].value
              }
            />
          </Form.Item>
        </>
      );
    case "Technology":
      return (
        <>
          <Form.Item label="Title">
            <Input
              placeholder="Title"
              onChange={(e) =>
                handleTranslationChange("title", item, e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input
              placeholder="Description"
              onChange={(e) =>
                handleTranslationChange("remarks", item, e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="Documents & Info">
            <RichTextEditor
              toolbarConfig={toolbarConfig}
              onChange={(v) => handleChange(v, item)}
              placeholder="Start typing here...."
              value={
                value.find(({ lang }) => lang === item)
                  ? value.find(({ lang }) => lang === item).value
                  : value[0].value
              }
            />
          </Form.Item>
        </>
      );
    case "Financing Resource":
      return (
        <>
          <Form.Item label="Title">
            <Input
              placeholder="Title"
              onChange={(e) =>
                handleTranslationChange("title", item, e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input
              placeholder="Description"
              onChange={(e) =>
                handleTranslationChange("summary", item, e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="Value Remark">
            <Input
              placeholder="Value Remark"
              onChange={(e) =>
                handleTranslationChange("value_remark", item, e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="Documents & Info">
            <RichTextEditor
              toolbarConfig={toolbarConfig}
              onChange={(v) => handleChange(v, item)}
              placeholder="Start typing here...."
              value={
                value.find(({ lang }) => lang === item)
                  ? value.find(({ lang }) => lang === item).value
                  : value[0].value
              }
            />
          </Form.Item>
        </>
      );
    default:
      return null;
  }
};

export default {
  initialData,
  initialFormData,
  getSchema,
  tabs,
  schema,
  initialDataEdit,
  formDataMapping,
  getTranslationForm,
};
