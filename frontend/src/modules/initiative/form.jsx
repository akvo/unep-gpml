import { initiativeData } from "./view";
import React, { useEffect, useState } from "react";
import { notification } from "antd";
import { withTheme } from "@rjsf/core";
import api from "../../utils/api";
import { Theme as AntDTheme } from "@rjsf/antd";
import ObjectFieldTemplate from "../../utils/forms/object-template";
import ArrayFieldTemplate from "../../utils/forms/array-template";
import FieldTemplate from "../../utils/forms/field-template";
import widgets from "../../utils/forms";
import { overideValidation } from "../../utils/forms";
import {
  findCountryIsoCode,
  handleGeoCoverageValue,
  checkRequiredFieldFilledIn,
} from "../../utils/forms";
import intersection from "lodash/intersection";
import difference from "lodash/difference";
import uiSchema from "./uiSchema.json";

const Form = withTheme(AntDTheme);

// # Refactor, still need to figure out how to make this as global function
const checkAnswer = (dependValue, answer) => {
  if (Array.isArray(answer)) {
    dependValue = intersection(dependValue, answer).length !== 0;
  }
  if (!Array.isArray(answer)) {
    dependValue = Array.isArray(dependValue)
      ? dependValue.includes(answer)
      : dependValue === answer;
  }
  return !dependValue;
};

const collectDependSchemaRefactor = (
  tmp,
  formData,
  schema,
  required,
  index = null,
  oldIndex = null
) => {
  if (!schema?.properties) {
    return;
  }
  if (schema?.required) {
    required.push({ group: oldIndex, key: index, required: schema.required });
  }
  const { properties } = schema;
  Object.keys(properties).forEach((key) => {
    if (
      !index &&
      properties?.[key]?.depend &&
      checkAnswer(
        properties?.[key]?.depend.value,
        formData?.[properties?.[key]?.depend.id]
      )
    ) {
      tmp.push(`.${key}`);
    }
    if (
      index &&
      !oldIndex &&
      properties?.[key]?.depend &&
      checkAnswer(
        properties?.[key]?.depend.value,
        formData?.[index]?.[properties?.[key]?.depend.id]
      )
    ) {
      tmp.push(`.${index}.${key}`);
    }
    if (
      index &&
      oldIndex &&
      properties?.[key]?.depend &&
      checkAnswer(
        properties?.[key]?.depend.value,
        formData?.[oldIndex][index]?.[properties?.[key]?.depend.id]
      )
    ) {
      if (key.includes(".")) {
        tmp.push(`.${oldIndex}.${index}['${key}']`);
      } else {
        tmp.push(`.${oldIndex}.${index}.${key}`);
      }
    }
    if (properties?.[key]?.properties) {
      collectDependSchemaRefactor(
        tmp,
        formData,
        properties?.[key],
        required,
        key,
        index
      );
    }
  });
  return;
};
// End of refactor

const transformFormData = (data, formData, schema) => {
  delete formData?.tabs;
  delete formData?.steps;
  delete formData?.required;
  delete formData?.filledIn;
  Object.keys(formData).forEach((key) => {
    if (formData?.[key]) {
      delete formData[key]?.steps;
      delete formData[key]?.required;
      if (
        formData[key] === Object(formData[key]) &&
        !Array.isArray(formData[key])
      ) {
        // loop
        transformFormData(data, formData[key], schema[key]?.properties);
      } else {
        // collect the value
        let qKey = key.split("_");
        qKey = qKey[qKey.length - 1];
        qKey = qKey.split(".").join("_");
        data[`q${qKey}`] = formData[key];
        if (Array.isArray(formData[key])) {
          data[`q${qKey}`] = formData[key].map((d) => {
            if (schema?.[key].type === "array" && schema?.[key].items?.enum) {
              return {
                [d]:
                  schema?.[key].items.enumNames?.[
                    schema?.[key].items.enum.indexOf(d)
                  ],
              };
            }
            if (schema?.[key].type === "string") {
              return {
                [d]: schema?.[key].enumNames?.[schema?.[key].enum.indexOf(d)],
              };
            }
            return d;
          });
        } else {
          if (
            schema?.[key]?.enum &&
            schema?.[key]?.enumNames &&
            schema?.[key]?.enum.length > 0 &&
            schema[key].enumNames.length > 0
          ) {
            data[`q${qKey}`] = {
              [formData[key]]:
                schema?.[key].enumNames?.[
                  schema[key].enum.indexOf(formData[key])
                ],
            };
          }
        }
      }
    }
  });
  return;
};

const AddInitiativeForm = ({
  btnSubmit,
  sending,
  setSending,
  highlight,
  setHighlight,
  formSchema,
  setDisabledBtn,
}) => {
  const initiativeFormData = initiativeData.useState();
  const [dependValue, setDependValue] = useState([]);
  const [step, setStep] = useState(1);

  const handleOnSubmit = ({ formData }) => {
    // # Transform data before sending to endpoint
    let data = {};
    transformFormData(data, formData, formSchema.schema.properties);
    data.version = parseInt(formSchema.schema.version);
    setSending(true);
    api
      .post("/initiative", data)
      .then(() => {
        setStep(2);
      })
      .catch(() => {
        notification.error({ message: "An error occured" });
      })
      .finally(() => {
        setSending(false);
      });
  };

  const handleFormOnChange = ({ formData, schema }) => {
    initiativeData.update((e) => {
      e.data = {
        ...e.data,
        ...formData,
      };
    });
    // to overide validation
    let dependFields = [];
    let requiredFields = [];
    // this function eliminate required key from list when that required form appear (show)
    collectDependSchemaRefactor(
      dependFields,
      formData,
      formSchema.schema,
      requiredFields
    );
    setDependValue(dependFields);
    const requiredFilledIn = checkRequiredFieldFilledIn(
      formData,
      dependFields,
      requiredFields
    );
    let sectionRequiredFields = {};
    let groupRequiredFields = {};
    requiredFields.forEach(({ group, key, required }) => {
      let index = group ? group : key;
      let filterRequired = required.filter((r) => requiredFilledIn.includes(r));
      sectionRequiredFields = {
        ...sectionRequiredFields,
        [index]: sectionRequiredFields?.[index]
          ? sectionRequiredFields?.[index].concat(filterRequired)
          : filterRequired,
      };
      if (!group) {
        groupRequiredFields = {
          ...groupRequiredFields,
          [key]: {
            ...groupRequiredFields[key],
            required: {
              [key]: filterRequired,
            },
          },
        };
      }
      if (group) {
        groupRequiredFields = {
          ...groupRequiredFields,
          [group]: {
            ...groupRequiredFields[group],
            required: {
              ...groupRequiredFields?.[group]?.required,
              [key]: filterRequired,
            },
          },
        };
      }
    });
    initiativeData.update((e) => {
      e.data = {
        ...e.data,
        required: sectionRequiredFields,
        S1: {
          ...e.data.S1,
          required: groupRequiredFields["S1"].required,
        },
        S2: {
          ...e.data.S2,
          required: groupRequiredFields["S2"].required,
        },
        S3: {
          ...e.data.S3,
          required: groupRequiredFields["S3"].required,
        },
      };
    });
    // enable btn submit
    if (requiredFilledIn.length === 0) {
      setDisabledBtn({ disabled: false, type: "primary" });
    }
  };

  const handleTransformErrors = (errors, dependValue) => {
    // custom errors handle
    [
      ".S1",
      ".S2",
      ".S3",
      ".S2.S2_G1",
      ".S2.S2_G2",
      ".S2.S2_G3",
      ".S3.S3_G1",
      ".S3.S3_G2",
      ".S3.S3_G3",
      ".S3.S3_G4",
      ".S3.S3_G5",
      ".S3.S3_G6",
      ".S3.S3_G7",
    ].forEach((x) => {
      let index = dependValue.indexOf(x);
      index !== -1 && dependValue.splice(index, 1);
    });
    const res = overideValidation(errors, dependValue);
    res.length === 0 && setHighlight(false);
    return res;
  };

  return (
    <div className="add-initiative-form">
      {step === 1 && (
        <>
          <Form
            idPrefix="initiative"
            schema={formSchema.schema}
            uiSchema={uiSchema}
            formData={initiativeFormData.data}
            onChange={(e) => handleFormOnChange(e)}
            onSubmit={(e) => handleOnSubmit(e)}
            ArrayFieldTemplate={ArrayFieldTemplate}
            ObjectFieldTemplate={ObjectFieldTemplate}
            FieldTemplate={FieldTemplate}
            widgets={widgets}
            transformErrors={(errors) =>
              handleTransformErrors(errors, dependValue)
            }
            showErrorList={false}
          >
            <button ref={btnSubmit} type="submit" style={{ display: "none" }}>
              Fire
            </button>
          </Form>
        </>
      )}
      {step === 2 && (
        <div>
          <h3>Thank you for adding the resource</h3>
          <p>we'll let you know once an admin has approved it</p>
        </div>
      )}
    </div>
  );
};

export default AddInitiativeForm;
