import { initiativeData } from "./view";
import React, { useEffect, useState } from "react";
import { notification } from "antd";
import { withTheme } from "@rjsf/core";
import { Theme as AntDTheme } from "@rjsf/antd";
import ObjectFieldTemplate from "../../utils/forms/object-template";
import ArrayFieldTemplate from "../../utils/forms/array-template";
import FieldTemplate from "../../utils/forms/field-template";
import widgets from "../../utils/forms";
import { overideValidation } from "../../utils/forms";
import { findCountryIsoCode, handleGeoCoverageValue } from "../../utils/forms";
import intersection from "lodash/intersection";
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
  index = null,
  oldIndex = null
) => {
  if (!schema?.properties) {
    return;
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
      collectDependSchemaRefactor(tmp, formData, properties?.[key], key, index);
    }
  });
  return;
};
// End of refactor

const AddInitiativeForm = ({
  btnSubmit,
  sending,
  setSending,
  highlight,
  setHighlight,
  formSchema,
}) => {
  const initiativeFormData = initiativeData.useState();
  const [dependValue, setDependValue] = useState([]);
  const [step, setStep] = useState(1);

  const handleOnSubmit = ({ formData }) => {
    console.log(formData);
    // setSending(true);
    // api.post("/resource", data).then(() => {
    //   setStep(2);
    // }).catch(() => {
    //   notification.error({ message: "An error occured" });
    // }).finally(() => {
    //   setSending(false);
    // });
  };

  const handleFormOnChange = ({ formData }) => {
    initiativeData.update((e) => {
      e.data = {
        ...e.data,
        ...formData,
      };
    });
    // to overide validation
    let tmp = [];
    // this function eliminate required key from list when that required form appear (show)
    collectDependSchemaRefactor(tmp, formData, formSchema.schema);
    setDependValue(tmp);
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
    <div className="add-resource-form">
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
