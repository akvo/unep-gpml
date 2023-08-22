import { Store } from "pullstate";
import { UIStore } from "../../store";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Row, Col, Card, Steps, Switch, Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./style.module.scss";
import AddInitiativeForm from "./form";
import StickyBox from "react-sticky-box";
import { schema } from "./schema";
import cloneDeep from "lodash/cloneDeep";
import xor from "lodash/xor";
import isEmpty from "lodash/isEmpty";
import api from "../../utils/api";

const { Step } = Steps;

const tabsData = [
  {
    key: "S1",
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
    key: "S2",
    title: "Type of Initiative",
    desc: "",
    steps: [
      {
        group: "S2_G1",
        key: "S2-p1-general",
        title: "Part 1: General",
        desc: "",
      },
      {
        group: "S2_G2",
        key: "S2-p2-reporting-and-measuring",
        title: "Part 2: Reporting and Measuring",
        desc: "",
      },
      {
        group: "S2_G3",
        key: "S2-p3-drivers-and-barriers",
        title: "Part 3: Drivers and Barriers",
        desc: "",
      },
    ],
  },
  {
    key: "S3",
    title: "Initiative Details",
    desc: "",
    steps: [
      {
        group: "S3_G1",
        key: "S3-p1-entities-involved",
        title: "Part 1: Entities Involved",
        desc: "",
      },
      {
        group: "S3_G2",
        key: "S3-p2-location-and-coverage",
        title: "Part 2: Location & Coverage",
        desc: "",
      },
      {
        group: "S3_G3",
        key: "S3-p3-initiative-scope-and-target",
        title: "Part 3: Initiative Scope & Target",
        desc: "",
      },
      {
        group: "S3_G4",
        key: "S3-p4-total-stakeholders-engaged",
        title: "Part 4: Total Stakeholders Engaged",
        desc: "",
      },
      {
        group: "S3_G5",
        key: "S3-p5-funding",
        title: "Part 5: Funding",
        desc: "",
      },
      {
        group: "S3_G6",
        key: "S3-p6-duration",
        title: "Part 6: Duration",
        desc: "",
      },
      {
        group: "S3_G7",
        key: "S3-p7-related-resource-and-contact",
        title: "Part 7: Related Resource and Contact",
        desc: "",
      },
    ],
  },
];

export const initialFormData = {
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

/**
 * This edit testing not include issue #280,
 * we need to aware, all geo_coverage_value will saved as [{"id":"name"}]
 */
const editInitiative = {
  q1: { "1-1": "On behalf of an entity" },
  q1_1: { 10001: "Akvo" },
  q4: [
    {
      "4-2":
        "TECHNOLOGY and PROCESSES (new technical developments/innovation, e.g., research and development, new product design, new materials, processes etc., changes in practice, operations, environmental management and planning).",
    },
  ],
  q4_3_1: [
    { "4.3.1-0": "New product design" },
    { "4.3.1-19": "Compostable plastic" },
    { "4.3.1-20": "Bio-based plastic or bio-degradable plastic" },
  ],
  q2: "Initiative Title",
  q3: "Summary",
  q7: [{ "7-3": "Multilateral Environmental Agreements (MEAs)" }],
  q7_2: [
    { 17: "ASEAN Agreement on Transboundary Haze Pollution" },
    { 9: "Abidjan Convention" },
  ],
  q11: [{ "11-1": "Outcomes are being assessed at regular intervals" }],
  q5: { "5-0": "Yes, reporting is voluntary" },
  q8: { "8-1": "No" },
  q10: { "10-1": "In 1 to 3 years" },
  q14: [
    { "14-3": "A change in public opinion" },
    {
      "14-4":
        "Members of the public have actively complained / asked for change",
    },
  ],
  q15: [
    { "15-7": "Not enough support from within the member state/organisation" },
    { "15-5": "Lobbying by business/industry" },
  ],
  q16: [
    { 10001: "Akvo" },
    { 1003: "Airtable" },
    { 159: "Agenda del Mar Comunicaciones" },
    { 169: "Adult commercial secondary School" },
    { 1002: "Agence Française de Developpement (AFD)" },
  ],
  q18: [{ 1000: "3M" }, { 2: "5 Gyres Institute" }],
  q20: [{ 1000: "3M" }],
  q22: "City",
  q23: { 106: "Indonesia" },
  q24: { National: "National" },
  q24_2: { 106: "Indonesia" },
  q26: [
    { "26-2": "Production / manufacture" },
    { "26-3": "Use / consumption" },
  ],
  q28: [{ "28-1": "Biodiversity" }, { "28-3": "Ecosystem Services" }],
  q30: [
    { "30-2": "Transportation" },
    { "30-4": "Automotive" },
    { "30-14": "Wastewater/Sewage management" },
  ],
  q32: [
    { "32-0": "Mountains and upland area" },
    { "32-1": "Agricultural land/soils" },
  ],
  q33: 1111,
  q34: 1111,
  q35: { "35-2": "Public Financing" },
  q36: 1111,
  q36_1: { AED: "AED UAE dirham" },
  q37: 1111,
  q37_1: { AED: "AED UAE dirham" },
  q38: { "38-0": "Single event" },
  q40: ["google.com", "akvo.org"],
  q41: { "41-5": "Other" },
  q41_1: "contact.com",
  version: 2,
};

const formDataMapping = [
  /**
   * Type Notes:
   * radio, single option -> option
   * checkbox, multiple option -> multiple-option
   * text, textarea, url -> string
   * number -> number
   * dynamic field -> item-array
   */

  // S1
  {
    name: "q1",
    section: "S1",
    group: null,
    question: "S1_1",
    type: "option",
  },
  {
    name: "q1_1",
    section: "S1",
    group: null,
    question: "S1_G1_1.1",
    type: "option",
  },
  // S2 - S2_G1
  {
    name: "q2",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_2",
    type: "string",
  },
  {
    name: "q3",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_3",
    type: "string",
  },
  {
    name: "q4",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_4",
    type: "multiple-option",
  },
  {
    name: "q4_1_1",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_4.1.1",
    type: "multiple-option",
  },
  {
    name: "q4_1_2",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_4.1.2",
    type: "string",
  },
  {
    name: "q4_2_1",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_4.2.1",
    type: "multiple-option",
  },
  {
    name: "q4_2_2",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_4.2.2",
    type: "string",
  },
  {
    name: "q4_3_1",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_4.3.1",
    type: "multiple-option",
  },
  {
    name: "q4_3_2",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_4.3.2",
    type: "string",
  },
  {
    name: "q4_4_1",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_4.4.1",
    type: "multiple-option",
  },
  {
    name: "q4_4_2",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_4.4.2",
    type: "string",
  },
  {
    name: "q4_4_3",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_4.4.3",
    type: "string",
  },
  {
    name: "q4_4_4",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_4.4.4",
    type: "string",
  },
  {
    name: "q4_4_5",
    section: "S2",
    group: "S2_G1",
    question: "S2_G1_4.4.5",
    type: "string",
  },
  // S2 - S2_G2
  {
    name: "q5",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_5",
    type: "option",
  },
  {
    name: "q6",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_6",
    type: "string",
  },
  {
    name: "q7",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_7",
    type: "multiple-option",
  },
  {
    name: "q7_1_0",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_7.1.0",
    type: "multiple-option",
  },
  {
    name: "q7_1_1",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_7.1.1",
    type: "multiple-option",
  },
  {
    name: "q7_1_2",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_7.1.2",
    type: "multiple-option",
  },
  {
    name: "q7_2",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_7.2",
    type: "multiple-option",
  },
  {
    name: "q7_3",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_7.3",
    type: "string",
  },
  {
    name: "q8",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_8",
    type: "option",
  },
  {
    name: "q9",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_9",
    type: "string",
  },
  {
    name: "q10",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_10",
    type: "option",
  },
  {
    name: "q11",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_11",
    type: "multiple-option",
  },
  {
    name: "q12",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_12",
    type: "string",
  },
  {
    name: "q13",
    section: "S2",
    group: "S2_G2",
    question: "S2_G2_13",
    type: "string",
  },
  // S2 - S2_G3
  {
    name: "q14",
    section: "S2",
    group: "S2_G3",
    question: "S2_G3_14",
    type: "multiple-option",
  },
  {
    name: "q15",
    section: "S2",
    group: "S2_G3",
    question: "S2_G3_15",
    type: "multiple-option",
  },
  // S3 - S3_G1
  {
    name: "q16",
    section: "S3",
    group: "S3_G1",
    question: "S3_G1_16",
    type: "multiple-option",
  },
  {
    name: "q17",
    section: "S3",
    group: "S3_G1",
    question: "S3_G1_17",
    type: "string",
  },
  {
    name: "q18",
    section: "S3",
    group: "S3_G1",
    question: "S3_G1_18",
    type: "multiple-option",
  },
  {
    name: "q19",
    section: "S3",
    group: "S3_G1",
    question: "S3_G1_19",
    type: "string",
  },
  {
    name: "q20",
    section: "S3",
    group: "S3_G1",
    question: "S3_G1_20",
    type: "multiple-option",
  },
  {
    name: "q21",
    section: "S3",
    group: "S3_G1",
    question: "S3_G1_21",
    type: "string",
  },
  // S3 - S3_G2
  {
    name: "q22",
    section: "S3",
    group: "S3_G2",
    question: "S3_G2_22",
    type: "string",
  },
  {
    name: "q23",
    section: "S3",
    group: "S3_G2",
    question: "S3_G2_23",
    type: "option",
  },
  {
    name: "q24",
    section: "S3",
    group: "S3_G2",
    question: "S3_G2_24",
    type: "option",
  },
  {
    name: "q24_1",
    section: "S3",
    group: "S3_G2",
    question: "S3_G2_24.1",
    type: "multiple-option",
  },
  {
    name: "q24_2",
    section: "S3",
    group: "S3_G2",
    question: "S3_G2_24.2",
    type: "option",
  },
  {
    name: "q24_3",
    section: "S3",
    group: "S3_G2",
    question: "S3_G2_24.3",
    type: "option",
  },
  {
    name: "q24_4",
    section: "S3",
    group: "S3_G2",
    question: "S3_G2_24.4",
    type: "option",
  },
  {
    name: "q24_5",
    section: "S3",
    group: "S3_G2",
    question: "S3_G2_24.5",
    type: "multiple-option",
  },
  // S3 - S3_G3
  {
    name: "q26",
    section: "S3",
    group: "S3_G3",
    question: "S3_G3_26",
    type: "multiple-option",
  },
  {
    name: "q27",
    section: "S3",
    group: "S3_G3",
    question: "S3_G3_27",
    type: "string",
  },
  {
    name: "q28",
    section: "S3",
    group: "S3_G3",
    question: "S3_G3_28",
    type: "multiple-option",
  },
  {
    name: "q29",
    section: "S3",
    group: "S3_G3",
    question: "S3_G3_29",
    type: "string",
  },
  {
    name: "q30",
    section: "S3",
    group: "S3_G3",
    question: "S3_G3_30",
    type: "multiple-option",
  },
  {
    name: "q31",
    section: "S3",
    group: "S3_G3",
    question: "S3_G3_31",
    type: "string",
  },
  {
    name: "q32",
    section: "S3",
    group: "S3_G3",
    question: "S3_G3_32",
    type: "multiple-option",
  },
  // S3 - S3_G4
  {
    name: "q33",
    section: "S3",
    group: "S3_G4",
    question: "S3_G4_33",
    type: "number",
  },
  {
    name: "q34",
    section: "S3",
    group: "S3_G4",
    question: "S3_G4_34",
    type: "number",
  },
  // S3 - S3_G5
  {
    name: "q35",
    section: "S3",
    group: "S3_G5",
    question: "S3_G5_35",
    type: "option",
  },
  {
    name: "q35_1",
    section: "S3",
    group: "S3_G5",
    question: "S3_G5_35.1",
    type: "string",
  },
  {
    name: "q36",
    section: "S3",
    group: "S3_G5",
    question: "S3_G5_36",
    type: "number",
  },
  {
    name: "q36_1",
    section: "S3",
    group: "S3_G5",
    question: "S3_G5_36.1",
    type: "option",
  },
  {
    name: "q37",
    section: "S3",
    group: "S3_G5",
    question: "S3_G5_37",
    type: "number",
  },
  {
    name: "q37_1",
    section: "S3",
    group: "S3_G5",
    question: "S3_G5_37.1",
    type: "option",
  },
  // S3 - S3_G6
  {
    name: "q38",
    section: "S3",
    group: "S3_G6",
    question: "S3_G6_38",
    type: "option",
  },
  {
    name: "q39",
    section: "S3",
    group: "S3_G6",
    question: "S3_G6_39",
    type: "string",
  },
  // S3 - S3_G7
  {
    name: "q40",
    section: "S3",
    group: "S3_G7",
    question: "S3_G7_40",
    type: "item-array",
  },
  {
    name: "q41",
    section: "S3",
    group: "S3_G7",
    question: "S3_G7_41",
    type: "option",
  },
  {
    name: "q41_1",
    section: "S3",
    group: "S3_G7",
    question: "S3_G7_41.1",
    type: "string",
  },
];

const getRevertValue = (type, value, name) => {
  let res = value;
  const isObject = typeof value === "object";
  const isArray = Array.isArray(value);
  if (type === "number") {
    res = Number(value);
  }
  if (type === "option" && isObject && !isArray) {
    res = Object.keys(value)[0];
    // case for geocoveragetype
    if (name === "q24") {
      res = Object.values(value)?.[0]?.toLowerCase();
    }
    res = isNaN(Number(res)) ? res : Number(res);
    // case for currency code
    if (name === "q36_1" || name === "q37_1") {
      res = res.split("_").join("");
      res = String(res).toUpperCase();
    }
  }

  // Geo Transnational handle
  // case for transnational geo value
  if (type === "option" && isArray && name === "q24_4") {
    const transnationalValue = isArray
      ? value.map((item) => {
          const enumKey = Object.keys(item)[0];
          return enumKey;
        })
      : Object.keys(value);
    res = transnationalValue.map((x) => parseInt(x));
  }
  if (type === "option" && isArray && name === "q24_2") {
    const transnationalValue = isArray
      ? value.map((item) => {
          const enumKey = Object.keys(item)[0];
          return enumKey;
        })
      : Object.keys(value);
    res = transnationalValue.map((x) => parseInt(x));
  }
  // EOL Geo Transnational handle

  if (type === "multiple-option" && isObject && isArray) {
    res = value.map((item) => {
      const enumKey = typeof item === "object" ? Object.keys(item)?.[0] : item;
      return enumKey;
    });
  }
  if (type === "item-array" && isObject && isArray) {
    res = value;
  }
  return res;
};

const revertFormData = (data) => {
  let formData = initialFormData;
  formDataMapping.forEach((item) => {
    const { name, section, group, question, type } = item;
    const value = data?.[name];
    if (!group && value) {
      formData = {
        ...formData,
        [section]: {
          ...formData[section],
          [question]: getRevertValue(type, value, name),
        },
      };
    }
    if (group && value) {
      formData = {
        ...formData,
        [section]: {
          ...formData[section],
          [group]: {
            ...formData[section][group],
            [question]: getRevertValue(type, value, name),
          },
        },
      };
    }
  });
  let newData = {};
  if (formData.S3.S3_G2.S3_G2_24 === "transnational") {
    newData = {
      ...formData,
      S3: {
        ...formData.S3,
        S3_G2: {
          ...formData.S3.S3_G2,
          "S3_G2_24.3": formData.S3.S3_G2["S3_G2_24.4"].map((num) => {
            return num.toString();
          }),
          "S3_G2_24.4": formData.S3.S3_G2["S3_G2_24.2"].map((num) => {
            return num.toString();
          }),
          "S3_G2_24.2": null,
        },
      },
    };
  } else {
    newData = formData;
  }
  return newData;
};

export const initiativeData = new Store({
  data: initialFormData,
  editId: null,
});

const getSchema = (
  {
    countries,
    organisations,
    tags,
    currencies,
    regionOptions,
    meaOptions,
    transnationalOptions,
  },
  loading
) => {
  const prop = cloneDeep(schema.properties);
  const orgs = [...organisations];
  // const orgs = [...organisations, { id: -1, name: "Other" }].map((x) => x);
  // organisation options
  prop.S1.properties["S1_G1_1.1"].enum = orgs?.map((it) => it.id);
  prop.S1.properties["S1_G1_1.1"].enumNames = orgs?.map((it) => it.name);
  prop.S3.properties.S3_G1.properties["S3_G1_16"].enum = orgs?.map((it) =>
    String(it.id)
  );
  prop.S3.properties.S3_G1.properties["S3_G1_16"].enumNames = orgs?.map(
    (it) => it.name
  );
  prop.S3.properties.S3_G1.properties["S3_G1_18"].enum = orgs?.map((it) =>
    String(it.id)
  );
  prop.S3.properties.S3_G1.properties["S3_G1_18"].enumNames = orgs?.map(
    (it) => it.name
  );
  prop.S3.properties.S3_G1.properties["S3_G1_20"].enum = orgs?.map((it) =>
    String(it.id)
  );
  prop.S3.properties.S3_G1.properties["S3_G1_20"].enumNames = orgs?.map(
    (it) => it.name
  );
  // MEA options
  prop.S2.properties.S2_G2.properties[
    "S2_G2_7.2"
  ].items.enum = meaOptions?.map((x) => String(x.id));
  prop.S2.properties.S2_G2.properties[
    "S2_G2_7.2"
  ].items.enumNames = meaOptions?.map((x) => x.name);
  // currency options
  prop.S3.properties.S3_G5.properties["S3_G5_36.1"].enum = currencies?.map(
    (x) => x.value
  );
  prop.S3.properties.S3_G5.properties["S3_G5_36.1"].enumNames = currencies?.map(
    (x) => x.label
  );
  prop.S3.properties.S3_G5.properties["S3_G5_37.1"].enum = currencies?.map(
    (x) => x.value
  );
  prop.S3.properties.S3_G5.properties["S3_G5_37.1"].enumNames = currencies?.map(
    (x) => x.label
  );
  // country options
  prop.S3.properties.S3_G2.properties["S3_G2_23"].enum = countries?.map(
    (x) => x.id
  );
  prop.S3.properties.S3_G2.properties["S3_G2_23"].enumNames = countries?.map(
    (x) => x.name
  );
  // geocoverage regional options
  prop.S3.properties.S3_G2.properties[
    "S3_G2_24.1"
  ].enum = regionOptions.map((x) => String(x.id));
  prop.S3.properties.S3_G2.properties[
    "S3_G2_24.1"
  ].enumNames = regionOptions.map((x) => x.name);
  // geocoverage national options
  prop.S3.properties.S3_G2.properties["S3_G2_24.2"].enum = countries?.map(
    (x) => x.id
  );
  prop.S3.properties.S3_G2.properties["S3_G2_24.2"].enumNames = countries?.map(
    (x) => x.name
  );
  // geocoverage sub-national options
  prop.S3.properties.S3_G2.properties["S3_G2_24.4"].enum = countries?.map((x) =>
    String(x.id)
  );
  prop.S3.properties.S3_G2.properties["S3_G2_24.4"].enumNames = countries?.map(
    (x) => x.name
  );
  // geocoverage transnational options
  prop.S3.properties.S3_G2.properties[
    "S3_G2_24.3"
  ].enum = transnationalOptions?.map((x) => String(x.id));
  prop.S3.properties.S3_G2.properties[
    "S3_G2_24.3"
  ].enumNames = transnationalOptions?.map((x) => x.name);

  // prop.S3.properties.S3_G2.properties["S3_G2_24.6"].enum = countries?.map((x) =>
  //   String(x.id)
  // );
  // prop.S3.properties.S3_G2.properties["S3_G2_24.6"].enumNames = countries?.map(
  //   (x) => x.name
  // );

  // geocoverage global with elements in specific areas options
  prop.S3.properties.S3_G2.properties[
    "S3_G2_24.5"
  ].enum = meaOptions?.map((x) => String(x.id));
  prop.S3.properties.S3_G2.properties["S3_G2_24.5"].enumNames = meaOptions?.map(
    (x) => x.name
  );
  return {
    schema: {
      ...schema,
      properties: prop,
    },
    loading: loading,
  };
};

const AddInitiative = ({ match: { params }, ...props }) => {
  const minHeightContainer = innerHeight * 0.8;
  const minHeightCard = innerHeight * 0.75;
  const {
    countries,
    organisations,
    tags,
    regionOptions,
    meaOptions,
    transnationalOptions,
    currencies,
    formStep,
    formEdit,
  } = UIStore.useState((s) => ({
    countries: s.countries,
    organisations: s.organisations,
    tags: s.tags,
    regionOptions: s.regionOptions,
    meaOptions: s.meaOptions,
    transnationalOptions: s.transnationalOptions,
    currencies: s.currencies,
    formStep: s.formStep,
    formEdit: s.formEdit,
  }));

  const formData = initiativeData.useState();
  const { editId, data } = formData;
  const { status, id } = formEdit.initiative;
  const [formSchema, setFormSchema] = useState({
    schema: schema,
    loading: true,
  });
  const btnSubmit = useRef();
  const [sending, setSending] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [disabledBtn, setDisabledBtn] = useState({
    disabled: true,
    type: "default",
  });
  const isLoaded = useCallback(() => {
    return Boolean(
      !isEmpty(countries) &&
        !isEmpty(organisations) &&
        !isEmpty(tags) &&
        !isEmpty(regionOptions) &&
        !isEmpty(meaOptions) &&
        !isEmpty(currencies) &&
        !isEmpty(transnationalOptions)
    );
  }, [
    countries,
    organisations,
    tags,
    regionOptions,
    meaOptions,
    currencies,
    transnationalOptions,
  ]);

  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = null;
    });
  }, [props]);

  useEffect(() => {
    UIStore.update((e) => {
      e.highlight = highlight;
    });
    setFormSchema({ schema: schema, loading: true });
  }, [highlight]);

  useEffect(() => {
    const dataId = Number(params?.id || id);
    if (formSchema.loading && isLoaded()) {
      setFormSchema(
        getSchema(
          {
            countries,
            organisations,
            tags,
            currencies,
            regionOptions,
            meaOptions,
            transnationalOptions,
          },
          false
        )
      );
      // Manage form status, add/edit
      if (
        (status === "edit" || dataId) &&
        // data.S1 has the same keys as initialFormData.S1?
        (xor(Object.keys(data?.S1), Object.keys(initialFormData?.S1)).length ===
          0 ||
          editId !== dataId)
      ) {
        api.getRaw(`/initiative/${dataId}`).then((d) => {
          initiativeData.update((e) => {
            e.data = revertFormData(JSON.parse(d.data));
            e.editId = dataId;
          });
        });
      }
    }
    // Manage form status, add/edit
    if (status === "add" && !dataId && editId !== null) {
      initiativeData.update((e) => {
        e.data = initialFormData;
        e.editId = null;
      });
    }
  }, [
    formSchema,
    status,
    id,
    data,
    editId,
    params,
    isLoaded,
    countries,
    organisations,
    tags,
    currencies,
    regionOptions,
    meaOptions,
    transnationalOptions,
  ]);

  const renderSteps = (parentTitle, section, steps) => {
    const totalRequiredFields = data?.required?.[section]?.length || 0;
    if (section !== data.tabs[0]) {
      return (
        <Step
          key={section}
          title={`${parentTitle}`}
          subTitle={`Total Required fields: ${totalRequiredFields}`}
          className={
            totalRequiredFields === 0
              ? "step-section step-section-finish"
              : "step-section"
          }
          status={totalRequiredFields === 0 ? "finish" : "wait"}
        />
      );
    }
    const childs = steps.map(({ group, key, title, desc }) => {
      const requiredFields = data?.[section]?.required?.[group]?.length || 0;
      return (
        <Step
          key={section + key}
          title={`${title}`}
          subTitle={`Required fields: ${requiredFields}`}
          status={requiredFields === 0 ? "finish" : "process"}
        />
      );
    });
    return [
      <Step
        key={section}
        title={`${parentTitle}`}
        subTitle={`Total Required fields: ${totalRequiredFields}`}
        className={
          totalRequiredFields === 0
            ? "step-section step-section-finish"
            : "step-section"
        }
        status={totalRequiredFields === 0 ? "finish" : "process"}
      />,
      ...childs,
    ];
  };

  const handleOnTabChange = (key) => {
    const tabActive = tabsData.filter((x) => x.key === key);
    initiativeData.update((e) => {
      e.data = {
        ...e.data,
        tabs: [key],
        steps: tabActive[0].steps,
      };
    });
  };

  const handleOnStepClick = (current, section) => {
    initiativeData.update((e) => {
      e.data = {
        ...e.data,
        [section]: {
          ...e.data[section],
          steps: current,
        },
      };
    });
  };

  const getTabStepIndex = () => {
    const section = data.tabs[0];
    const stepIndex = data[section].steps;
    const tabIndex = tabsData.findIndex((tab) => tab.key === section);
    const steps = tabsData[tabIndex].steps;
    return { tabIndex, stepIndex, steps };
  };

  const isLastStep = () => {
    const { tabIndex, stepIndex, steps } = getTabStepIndex();
    return tabsData.length === tabIndex + 1 && steps.length === stepIndex + 1;
  };

  const handleOnClickBtnNext = (e) => {
    const { tabIndex, stepIndex, steps } = getTabStepIndex();
    if (stepIndex < steps.length - 1) {
      // Next step, same section
      handleOnStepClick(stepIndex + 1, tabsData[tabIndex].key);
    } else if (tabIndex < tabsData.length - 1) {
      // Next section, first step
      handleOnTabChange(tabsData[tabIndex + 1].key);
    } else {
      // We shouldn't get here, since the button should be hidden
      console.error("Last step:", tabIndex, stepIndex);
    }
  };

  const handleOnClickBtnSubmit = (e) => {
    setHighlight(true);
    btnSubmit.current.click();
  };

  return (
    <div id="add-initiative">
      <StickyBox style={{ zIndex: 10 }}>
        <div className="form-info-wrapper">
          <div className="ui container">
            <Row>
              <Col xs={24} lg={14}>
                <div className="form-title-wrapper">
                  <div className="form-title">
                    <span className="title">Initiative</span>
                  </div>
                  <div className="initiative-title">
                    {data?.S2?.S2_G1?.S2_G1_2
                      ? data?.S2?.S2_G1?.S2_G1_2
                      : "Untitled Initiative"}
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={10}>
                <div
                  className={`form-meta ${
                    formStep.initiative === 2 ? "submitted" : ""
                  }`}
                >
                  <div className="highlight">
                    <Switch
                      checked={highlight}
                      size="small"
                      onChange={(status) => setHighlight(status)}
                    />{" "}
                    {highlight
                      ? "Required fields highlighted"
                      : "Highlight required"}
                  </div>
                  <Button
                    disabled={disabledBtn.disabled}
                    loading={sending}
                    type={disabledBtn.type}
                    size="large"
                    onClick={(e) => handleOnClickBtnSubmit(e)}
                  >
                    SUBMIT
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </StickyBox>
      {!isLoaded ? (
        <h2 className="loading">
          <LoadingOutlined spin /> Loading
        </h2>
      ) : (
        <div className="ui container">
          <div className="form-container">
            {formStep.initiative === 1 && (
              <Row
                style={{
                  minHeight: `${minHeightContainer}px`,
                  padding: "20px 10px 20px 16px",
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                }}
              >
                <Col
                  xs={24}
                  lg={6}
                  style={{
                    borderRight: "1px solid #D3DBDF",
                    minHeight: "100%",
                  }}
                >
                  {tabsData.map(({ key, title, desc, steps }) => (
                    <Steps
                      key={`steps-section-${key}`}
                      direction="vertical"
                      size="small"
                      current={data[key]?.steps}
                      initial={-1}
                      onChange={(e) => {
                        e === -1
                          ? handleOnTabChange(key)
                          : handleOnStepClick(e, data.tabs[0]);
                      }}
                      className={key === data.tabs[0] ? "current-tabs" : ""}
                    >
                      {renderSteps(title, key, steps)}
                    </Steps>
                  ))}
                </Col>
                <Col xs={24} lg={18}>
                  <Card
                    style={{
                      paddingTop: 0,
                      paddingBottom: "275px",
                      paddingRight: "24px",
                      paddingLeft: "30px",
                      minHeight: `${minHeightCard}px`,
                      overflow: "auto",
                    }}
                  >
                    <AddInitiativeForm
                      btnSubmit={btnSubmit}
                      sending={sending}
                      setSending={setSending}
                      highlight={highlight}
                      setHighlight={setHighlight}
                      formSchema={formSchema}
                      setDisabledBtn={setDisabledBtn}
                    />
                    {!isLastStep() && (
                      <Button
                        className="next-button"
                        type="primary"
                        size="large"
                        onClick={(e) => handleOnClickBtnNext(e)}
                      >
                        Next
                      </Button>
                    )}
                  </Card>
                </Col>
              </Row>
            )}
            {formStep.initiative === 2 && (
              <Row>
                <Col span={24}>
                  <Card
                    style={{
                      padding: "30px",
                    }}
                  >
                    <div>
                      <h3>Thank you for adding the Initiative</h3>
                      <p>we'll let you know once an admin has approved it</p>
                    </div>
                  </Card>
                </Col>
              </Row>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddInitiative;
