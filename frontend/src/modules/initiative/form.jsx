import { UIStore } from "../../store";
import { initiativeData } from "./view";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "antd";
import api from "../../utils/api";
import { withTheme } from "@rjsf/core";
import { Theme as AntDTheme } from "@rjsf/antd";
import ObjectFieldTemplate from "../../utils/forms/object-template";
import ArrayFieldTemplate from "../../utils/forms/array-template";
import FieldTemplate from "../../utils/forms/field-template";
import widgets from "../../utils/forms";
import { overideValidation } from "../../utils/forms";
import { findCountryIsoCode, handleGeoCoverageValue } from "../../utils/forms";
import cloneDeep from "lodash/cloneDeep";
import intersection from "lodash/intersection";
import specificAreasOptions from "../financing-resource/specific-areas.json";
import schema from "./schema.json";
import uiSchema from "./uiSchema.json";

const Form = withTheme(AntDTheme);

const getSchema = (
  { countries, organisations, tags, currencies, regionOptions },
  loading
) => {
  const prop = cloneDeep(schema.properties);
  const orgs = [...organisations, { id: -1, name: "Other" }].map((x) => x);
  // TODO:: Load options below
  // [Pop up a full list of SDGs] ? where can get this data? Question S2_G2 number 7.1
  // [Pop up a full list of MEAs that’s provided with the Policy Resource type] Question S2_G2 number 7.2
  prop.S2.properties.S2_G2.properties["S2_G2_7.2"].items.enum = tags?.mea?.map(
    (it) => it.id
  );
  prop.S2.properties.S2_G2.properties[
    "S2_G2_7.2"
  ].items.enumNames = tags?.mea?.map((it) => it.tag);
  // [in the UI show a list of tags they can choose to add] Question S3_G3 number 32
  // END OF TODO

  // organisation options
  prop.S3.properties.S3_G1.properties["S3_G1_16"].enum = orgs?.map(
    (it) => it.id
  );
  prop.S3.properties.S3_G1.properties["S3_G1_16"].enumNames = orgs?.map(
    (it) => it.name
  );
  prop.S3.properties.S3_G1.properties["S3_G1_18"].enum = orgs?.map(
    (it) => it.id
  );
  prop.S3.properties.S3_G1.properties["S3_G1_18"].enumNames = orgs?.map(
    (it) => it.name
  );
  prop.S3.properties.S3_G1.properties["S3_G1_20"].enum = orgs?.map(
    (it) => it.id
  );
  prop.S3.properties.S3_G1.properties["S3_G1_20"].enumNames = orgs?.map(
    (it) => it.name
  );
  // currency options
  prop.S3.properties.S3_G5.properties["S3_G5_36.1"].enum = currencies?.map(
    (x, i) => x.value
  );
  prop.S3.properties.S3_G5.properties["S3_G5_36.1"].enumNames = currencies?.map(
    (x, i) => x.label
  );
  prop.S3.properties.S3_G5.properties["S3_G5_37.1"].enum = currencies?.map(
    (x, i) => x.value
  );
  prop.S3.properties.S3_G5.properties["S3_G5_37.1"].enumNames = currencies?.map(
    (x, i) => x.label
  );
  // country options
  prop.S3.properties.S3_G2.properties["S3_G2_23"].enum = countries?.map(
    (x, i) => x.id
  );
  prop.S3.properties.S3_G2.properties["S3_G2_23"].enumNames = countries?.map(
    (x, i) => x.name
  );
  // geocoverage regional options
  prop.S3.properties.S3_G2.properties["S3_G2_24.1"].enum = regionOptions;
  // geocoverage national options
  prop.S3.properties.S3_G2.properties["S3_G2_24.2"].enum = countries?.map(
    (x, i) => x.id
  );
  prop.S3.properties.S3_G2.properties["S3_G2_24.2"].enumNames = countries?.map(
    (x, i) => x.name
  );
  // geocoverage transnational options
  prop.S3.properties.S3_G2.properties["S3_G2_24.4"].enum = countries?.map(
    (x, i) => x.id
  );
  prop.S3.properties.S3_G2.properties["S3_G2_24.4"].enumNames = countries?.map(
    (x, i) => x.name
  );
  // geocoverage transnational options
  prop.S3.properties.S3_G2.properties["S3_G2_24.4"].enum = countries?.map(
    (x, i) => x.id
  );
  prop.S3.properties.S3_G2.properties["S3_G2_24.4"].enumNames = countries?.map(
    (x, i) => x.name
  );
  // geocoverage global with spesific area options
  prop.S3.properties.S3_G2.properties["S3_G2_24.5"].enum = specificAreasOptions;
  return {
    schema: {
      ...schema,
      properties: prop,
    },
    loading: loading,
  };
};

const AddInitiativeForm = ({
  btnSubmit,
  sending,
  setSending,
  highlight,
  setHighlight,
}) => {
  const initiativeFormData = initiativeData.useState();
  const { countries, organisations, tags, currencies } = UIStore.currentState;
  const [dependValue, setDependValue] = useState([]);
  const [step, setStep] = useState(1);
  const [formSchema, setFormSchema] = useState({
    schema: schema,
    loading: true,
  });

  useEffect(() => {
    if (
      formSchema.loading &&
      countries.length > 0 &&
      organisations.length > 0 &&
      tags?.mea
    ) {
      setFormSchema(getSchema(UIStore.currentState, false));
    }
  }, [countries, organisations, tags]);

  useEffect(() => {
    if (!formSchema.loading) {
      setFormSchema({ schema: schema, loading: true });
    }
    if (
      formSchema.loading &&
      countries.length > 0 &&
      organisations.length > 0 &&
      tags?.mea
    ) {
      setFormSchema(getSchema(UIStore.currentState, false));
    }
  }, [highlight]);

  const handleOnSubmit = ({ formData }) => {
    console.log(formData);
    // setSending(true);
    // api.post("/resource", data).then(() => {
    //   setSending(false);
    //   setStep(2);
    // });
  };

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
        collectDependSchemaRefactor(
          tmp,
          formData,
          properties?.[key],
          key,
          index
        );
      }
    });
    return;
  };

  const handleFormOnChange = ({ formData }) => {
    initiativeData.update((e) => {
      e.data = {
        ...e.data,
        ...formData,
      };
    });
    // # TODO:: Need to check and refactor this function. can't map deep more than 2 children
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
