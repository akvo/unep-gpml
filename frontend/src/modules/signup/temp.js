const formDataMapping = [
  /**
   * Type Notes:
   * radio, single option -> option
   * checkbox, multiple option -> multiple-option
   * text, textarea, url -> string
   * number -> number
   * dynamic field -> item-array
   */
  // {
  //     key: "S1_9",
  //     name: "S1_9",
  //     group: "S1",
  //     type: "array",
  // },
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
    question: "S1_1.1",
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
    type: "multiple-option",
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
      res = Object.values(value)[0];
    }
    res = isNaN(Number(res)) ? res : Number(res);
    // case for currency code
    if (name === "q36_1" || name === "q37_1") {
      res = res.split("_").join("");
      res = String(res).toUpperCase();
    }
  }
  if (type === "multiple-option" && isObject && isArray) {
    res = value.map((item) => {
      const enumKey = Object.keys(item)[0];
      return enumKey;
    });
  }
  if (type === "item-array" && isObject && isArray) {
    res = value;
  }
  return res;
};

export const revertFormData = (formData) => (data) => {
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
  return formData;
};
