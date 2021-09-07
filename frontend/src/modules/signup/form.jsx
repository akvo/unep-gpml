import React, { useEffect, useState, useCallback } from "react";

import { notification } from "antd";
import { withTheme } from "@rjsf/core";
import api from "../../utils/api";
import { Theme as AntDTheme } from "@rjsf/antd";
import cloneDeep from "lodash/cloneDeep";
import ObjectFieldTemplate from "../../utils/forms/object-template";
import ArrayFieldTemplate from "../../utils/forms/array-template";
import FieldTemplate from "../../utils/forms/field-template";
import widgets from "../../utils/forms";
import { overideValidation } from "../../utils/forms";
import {
  transformFormData,
  collectDependSchemaRefactor,
} from "../initiative/form";
import {
  handleGeoCoverageValue,
  checkRequiredFieldFilledIn,
  checkDependencyAnswer,
  customFormats,
} from "../../utils/forms";
import entity from "./entity";
import stakeholder from "./stakeholder";
import entityUiSchema from "./entityUiSchema.json";
import stakeholderUiSchema from "./stakeholderUiSchema.json";

import { UIStore } from "../../store";
import { withRouter } from "react-router-dom";

const Form = withTheme(AntDTheme);

const SignUpForm = withRouter(
  ({
    btnSubmit,
    sending,
    setSending,
    representEntity,
    formType,
    highlight,
    setHighlight,
    formSchema,
    setDisabledBtn,
    history,
    match: { params },
  }) => {
    const { countries, organisations, tags, formEdit } = UIStore.currentState;
    const { status, id } = formEdit.signUp;
    const { initialSignUpData, signUpData } =
      formType === "entity" ? entity : stakeholder;
    const uiSchema =
      formType === "entity" ? entityUiSchema : stakeholderUiSchema;
    const signUpFormData = signUpData.useState();
    const [dependValue, setDependValue] = useState([]);
    const [editCheck, setEditCheck] = useState(true);

    const handleOnSubmit = ({ formData }) => {
      // # Transform data before sending to endpoint
      let data = {};
      transformFormData(data, formData, formSchema.schema.properties, true);
      data.version = parseInt(formSchema.schema.version);

      setSending(true);

      let data2 = handleGeoCoverageValue(
        cloneDeep(formData.S1),
        formData.S1,
        countries
      );
      console.log(data2);

      let orgGeo = handleGeoCoverageValue(
        cloneDeep(formData.S4),
        formData.S4,
        countries,
        "org"
      );

      if (data.country?.[formData.S1.country]) {
        data.country = formData.S1.country;
      }
      if (data.title?.[formData.S1.titleAndLastName.title]) {
        data.title = formData.S1.titleAndLastName.title;
      }
      if (data2.geoCoverageType) {
        data.geoCoverageType = data2.geoCoverageType;
      }
      if (data2.geoCoverageValue) {
        data.geoCoverageValue = data2.geoCoverageValue;
      }
      if (data.seeking) {
        data.seeking = data.seeking.map((x) => Number(x));
      }
      if (data.offering) {
        data.offering = data.offering.map((x) => Number(x));
      }
      if (data.tags) {
        data.tags = data.tags.map((x) => Number(x));
      }
      data.org = {};

      if (data.orgName) {
        data.org.name = data.orgName;
        data.org.type = data.orgRepresentative;
        data.org.program = data.orgDescription;
        data.org.url = data.orgUrl;
        data.org.logo = data.orgLogo;

        if (data.orgHeadquarter?.[formData.S4.orgHeadquarter]) {
          data.org.country = formData.S4.orgHeadquarter;
        }
        if (orgGeo.orggeoCoverageType) {
          data.org.geoCoverageType = orgGeo.orggeoCoverageType;
          data.org.geoCoverageValue = orgGeo.orggeoCoverageValue;
        }
        delete data.orgHeadquarter;
        delete data.orgName;
        delete data.orgRepresentative;
        delete data.orgDescription;
        delete data.orgUrl;
        delete data.orgLogo;

        if (data.registeredStakeholders) {
          data.org.registeredStakeholders = formData.S5.registeredStakeholders.map(
            (x) => Number(x)
          );
          delete data.registeredStakeholders;
        }
        if (data.otherStakeholders) {
          data.org.otherStakeholders = data.otherStakeholders;
          delete data.otherStakeholders;
        }
      }

      console.log("data.qcountry", data.country);
      console.log(data, formData);

      if (status === "add" && !params?.id) {
        api
          .post("/profile", data)
          .then(() => {
            UIStore.update((e) => {
              e.formStep = {
                ...e.formStep,
                signup: 2,
              };
            });
            //            scroll top
            window.scrollTo({ top: 0 });
            signUpData.update((e) => {
              e.data = initialSignUpData;
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
      // if (status === "edit" || params?.id) {
      //   api
      //     .put(`/detail/project/${id || params?.id}`, data)
      //     .then(() => {
      //       notification.success({ message: "Update success" });
      //       UIStore.update((e) => {
      //         e.formEdit = {
      //           ...e.formEdit,
      //           signup: {
      //             status: "add",
      //             id: null,
      //           },
      //         };
      //       });
      //       // scroll top
      //       window.scrollTo({ top: 0 });
      //       signUpData.update((e) => {
      //         e.data = initialSignUpData;
      //       });
      //       setDisabledBtn({ disabled: true, type: "default" });
      //       history.push(`/project/${id || params?.id}`);
      //     })
      //     .catch(() => {
      //       notification.error({ message: "An error occured" });
      //     })
      //     .finally(() => {
      //       setSending(false);
      //     });
      // }
    };

    const handleFormOnChange = useCallback(
      ({ formData, schema }) => {
        //        console.log("handleFormOnChange representEntity", representEntity);
        signUpData.update((e) => {
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
          representEntity
            ? requiredFields
            : requiredFields.filter((x) => x.key.indexOf("S1") >= 0)
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
        signUpData.update((e) => {
          let entitySections = {
            S2: {
              ...e.data.S2,
              required: groupRequiredFields["S2"].required,
            },
            S3: {
              ...e.data.S3,
              required: groupRequiredFields["S3"].required,
            },
            S4: {
              ...e.data.S4,
              required: groupRequiredFields["S4"].required,
            },
            S5: {
              ...e.data.S5,
              required: groupRequiredFields["S5"].required,
            },
          };
          const stakeholderSections = {
            S1: {
              ...e.data.S1,
              required: groupRequiredFields["S1"].required,
            },
          };
          if (representEntity) {
            e.data = {
              ...e.data,
              required: sectionRequiredFields,
              ...stakeholderSections,
              ...entitySections,
            };
          } else {
            e.data = {
              ...e.data,
              required: sectionRequiredFields,
              ...stakeholderSections,
            };
          }
        });
        // enable btn submit
        requiredFilledIn.length === 0 &&
          setDisabledBtn({ disabled: false, type: "primary" });
        requiredFilledIn.length !== 0 &&
          setDisabledBtn({ disabled: true, type: "default" });
      },
      [formSchema, setDisabledBtn, representEntity]
    );

    const handleTransformErrors = (errors, dependValue) => {
      // custom errors handle
      [
        // ".S1",
        // ".S2",
        // ".S3",
        // ".S2.S2_G1",
        // ".S2.S2_G2",
        // ".S2.S2_G3",
        // ".S3.S3_G1",
        // ".S3.S3_G2",
        // ".S3.S3_G3",
        // ".S3.S3_G4",
        // ".S3.S3_G5",
        // ".S3.S3_G6",
        // ".S3.S3_G7",
      ].forEach((x) => {
        let index = dependValue.indexOf(x);
        index !== -1 && dependValue.splice(index, 1);
      });
      const res = overideValidation(errors, dependValue);
      res.length === 0 && setHighlight(false);
      return res;
    };

    useEffect(() => {
      handleFormOnChange({
        formData: signUpFormData.data,
        schema: formSchema.schema,
      });
    }, [formSchema, signUpFormData, handleFormOnChange, representEntity]);

    useEffect(() => {
      if (
        (status === "edit" || params?.id) &&
        editCheck &&
        signUpFormData.data?.["S1"]?.["S1_LN"]["S1_1"]
        //TODO: review this condition
      ) {
        handleFormOnChange({
          formData: signUpFormData.data,
          schema: formSchema.schema,
        });
        setEditCheck(false);
      }
    }, [
      handleFormOnChange,
      editCheck,
      status,
      signUpFormData,
      formSchema,
      params,
    ]);

    return (
      <div className="add-sign-up-form">
        <>
          <Form
            idPrefix="signUp"
            schema={formSchema.schema}
            uiSchema={uiSchema}
            formData={signUpFormData.data}
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

export default SignUpForm;
