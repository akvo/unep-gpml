import { initiativeData, initialFormData } from "./view";
import React, { useEffect, useState, useCallback } from "react";
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
  handleGeoCoverageValue,
  checkRequiredFieldFilledIn,
  checkDependencyAnswer,
  customFormats,
} from "../../utils/forms";
import uiSchema from "./uiSchema.json";
import { UIStore } from "../../store";
import { withRouter } from "react-router-dom";

const Form = withTheme(AntDTheme);

// # Refactor, still need to figure out how to make this as global function
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
      !checkDependencyAnswer(
        formData?.[properties?.[key]?.depend.id],
        properties?.[key]?.depend
      )
    ) {
      tmp.push(`.${key}`);
    }
    if (
      index &&
      !oldIndex &&
      properties?.[key]?.depend &&
      !checkDependencyAnswer(
        formData?.[index]?.[properties?.[key]?.depend.id],
        properties?.[key]?.depend
      )
    ) {
      if (key.includes(".")) {
        tmp.push(`.${index}['${key}']`);
      } else {
        tmp.push(`.${index}.${key}`);
      }
    }
    if (
      index &&
      oldIndex &&
      properties?.[key]?.depend &&
      !checkDependencyAnswer(
        formData?.[oldIndex][index]?.[properties?.[key]?.depend.id],
        properties?.[key]?.depend
      )
    ) {
      if (key.includes(".")) {
        tmp.push(`.${oldIndex}.${index}['${key}']`);
      } else {
        tmp.push(`.${oldIndex}.${index}.${key}`);
      }
    }
    if (properties?.[key]?.properties) {
      !collectDependSchemaRefactor(
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
            if (schema?.[key]?.type === "array" && schema?.[key].items?.enum) {
              return {
                [d]:
                  schema?.[key].items.enumNames?.[
                    schema?.[key].items.enum.indexOf(d)
                  ],
              };
            }
            if (schema?.[key]?.type === "string") {
              const answer = String(d).includes("-")
                ? d
                : schema?.[key]?.enum
                ? d
                : parseInt(d);
              return {
                [d]:
                  schema?.[key].enumNames?.[schema?.[key].enum.indexOf(answer)],
              };
            }
            return d;
          });
        } else {
          if (
            schema?.[key]?.enum &&
            schema?.[key]?.enumNames &&
            schema[key]?.enum.length > 0 &&
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

const AddInitiativeForm = withRouter(
  ({
    btnSubmit,
    sending,
    setSending,
    highlight,
    setHighlight,
    formSchema,
    setDisabledBtn,
    history,
  }) => {
    const { formEdit } = UIStore.currentState;
    const { status, id } = formEdit.initiative;
    const initiativeFormData = initiativeData.useState();
    const [dependValue, setDependValue] = useState([]);
    const [editCheck, setEditCheck] = useState(true);

    const handleOnSubmit = ({ formData }) => {
      // # Transform data before sending to endpoint
      let data = {};
      transformFormData(data, formData, formSchema.schema.properties);
      data.version = parseInt(formSchema.schema.version);

      setSending(true);
      if (status === "add") {
        api
          .post("/initiative", data)
          .then(() => {
            UIStore.update((e) => {
              e.formStep = {
                ...e.formStep,
                initiative: 2,
              };
            });
            // scroll top
            window.scrollTo({ top: 0 });
            initiativeData.update((e) => {
              e.data = initialFormData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
          })
          .catch(() => {
            notification.error({ message: "An error occured" });
          })
          .finally(() => {
            setSending(false);
          });
      }
      if (status === "edit") {
        api
          .put(`/detail/project/${id}`, data)
          .then(() => {
            notification.success({ message: "Update success" });
            UIStore.update((e) => {
              e.formEdit = {
                ...e.formEdit,
                initiative: {
                  status: "add",
                  id: null,
                },
              };
            });
            // scroll top
            window.scrollTo({ top: 0 });
            initiativeData.update((e) => {
              e.data = initialFormData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            history.push(`/project/${id}`);
          })
          .catch(() => {
            notification.error({ message: "An error occured" });
          })
          .finally(() => {
            setSending(false);
          });
      }
    };

    const handleFormOnChange = useCallback(
      ({ formData, schema }) => {
        initiativeData.update((e) => {
          e.data = {
            ...e.data,
            ...formData,
          };
        });
        // to overide validation
        let dependFields = [];
        let requiredFields = [];
        // this function eliminate required key from required list when that required form appear (show)
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
          let filterRequired = required.filter((r) =>
            requiredFilledIn.includes(r)
          );
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
        requiredFilledIn.length === 0 &&
          setDisabledBtn({ disabled: false, type: "primary" });
        requiredFilledIn.length !== 0 &&
          setDisabledBtn({ disabled: true, type: "default" });
      },
      [formSchema, setDisabledBtn]
    );

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

    useEffect(() => {
      if (
        status === "edit" &&
        editCheck &&
        initiativeFormData.data?.["S1"]?.["S1_1"]
      ) {
        handleFormOnChange({
          formData: initiativeFormData.data,
          schema: formSchema.schema,
        });
        setEditCheck(false);
      }
    }, [handleFormOnChange, editCheck, status, initiativeFormData, formSchema]);

    return (
      <div className="add-initiative-form">
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
            customFormats={customFormats}
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
      </div>
    );
  }
);

export default AddInitiativeForm;
