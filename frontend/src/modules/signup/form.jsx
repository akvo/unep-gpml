import React, { useEffect, useState, useCallback } from "react";
import { notification, Typography } from "antd";
import { withTheme } from "@rjsf/core";
import api from "../../utils/api";
import { updateStatusProfile } from "../../utils/profile";
import { Theme as AntDTheme } from "@rjsf/antd";
import cloneDeep from "lodash/cloneDeep";
import ObjectFieldTemplate from "../../utils/forms/object-template";
import ArrayFieldTemplate from "../../utils/forms/array-template";
import FieldTemplate from "../../utils/forms/field-template";
import widgets from "../../utils/forms";
import { overideValidation } from "../../utils/forms";
import common from "./common";
const { feedCountry, feedSeeking, feedOffering, feedTitle } = common;
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
    formType,
    highlight,
    setHighlight,
    isStakeholderType,
    isEntityType,
    formSchema,
    setDisabledBtn,
    history,
    hideEntityPersonalDetail,
    tabsData,
    match: { params },
  }) => {
    const {
      countries,
      organisations,
      tags,
      formEdit,
      profile,
    } = UIStore.currentState;
    const { status, id } = formEdit.signUp;
    const { initialSignUpData, signUpData } = isEntityType
      ? entity
      : stakeholder;
    const uiSchema = isEntityType ? entityUiSchema : stakeholderUiSchema;
    const signUpFormData = signUpData.useState();
    const [dependValue, setDependValue] = useState([]);
    const [editCheck, setEditCheck] = useState(true);

    const handleOnSubmit = ({ formData }) => {
      // # Transform data before sending to endpoint
      let data = {};

      transformFormData(data, formData, formSchema.schema.properties, true);

      data.version = parseInt(formSchema.schema.version);

      setSending(true);

      if (isEntityType) {
        let data2 = handleGeoCoverageValue(
          cloneDeep(formData.S5),
          formData.S5,
          countries
        );

        feedCountry(data, formData, "S2");

        data.title = formData.S2.title;

        if (data2.geoCoverageType) {
          data.geoCoverageType = data2.geoCoverageType;
        }
        if (data2.geoCoverageValue) {
          data.geoCoverageValue = data2.geoCoverageValue;
        }
        feedSeeking(data, formData); // TODO check paths

        feedOffering(data, formData); // TODO check paths

        if (formData.S3["org.name"]) {
          data.org = {};
          data.org.name = formData.S3["org.name"];
          data.org.type = formData.S3["org.representativeGroup"];
          data.org.representativeGroupGovernment =
            formData.S3["org.representativeGroupGovernment"];
          data.org.representativeGroupPrivateSector =
            formData.S3["org.representativeGroupPrivateSector"];
          data.org.representativeGroupAcademiaResearch =
            formData.S3["org.representativeGroupAcademiaResearch"];
          data.org.representativeGroupCivilSociety =
            formData.S3["org.representativeGroupCivilSociety"];
          data.org.representativeGroupOther =
            formData.S3["org.representativeGroupOther"];
          data.org.program = formData.S3["org.program"];
          data.org.url = formData.S3["org.url"];
          data.org.logo = data.orgLogo;

          delete data.org_name;
          delete data.org_representativeGroup;
          delete data.org_representativeGroupGovernment;
          delete data.org_representativeGroupPrivateSector;
          delete data.org_representativeGroupAcademiaResearch;
          delete data.org_representativeGroupCivilSociety;
          delete data.org_representativeGroupOther;
          delete data.org_program;
          delete data.org_url;

          if (data.orgHeadquarter?.[formData.S5.orgHeadquarter]) {
            data.org.country = formData.S5.orgHeadquarter;
          }
          if (data.orgSubnationalArea) {
            data.org.subnationalArea = data.orgSubnationalArea;
          }
          delete data.orgSubnationalArea;
          if (data.geoCoverageType) {
            data.org.geoCoverageType = data.geoCoverageType;
            data.org.geoCoverageValue = data.geoCoverageValue;
            if (data.geoCoverageType === "transnational") {
              if (data.geoCoverageValue && data.geoCoverageValue.length > 0) {
                data.org.geoCoverageCountryGroups = data.geoCoverageValue;
              }
              if (
                formData.S5.geoCoverageCountries &&
                formData.S5.geoCoverageCountries.length > 0
              ) {
                data.org.geoCoverageCountries = formData.S5.geoCoverageCountries.map(
                  (x) => parseInt(x)
                );
              }
            }
            if (data.geoCoverageType === "national") {
              data.org.geoCoverageCountries = formData.S5.geoCoverageCountries.map(
                (x) => parseInt(x)
              );
              delete data.org.geoCoverageValue;
            }
          }
          delete data.geoCoverageType;
          delete data.geoCoverageValue;
          delete data.orgHeadquarter;
          delete data.orgName;
          delete data.orgRepresentative;
          delete data.orgDescription;
          delete data.orgUrl;
          delete data.orgLogo;
          delete data.geoCoverageValueTransnational;
          delete data.geoCoverageCountries;

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
          data.org.authorizeSubmission = data.authorizeSubmission;
          delete data.authorizeSubmission;

          if (data.orgExpertise) {
            data.org.expertise = data.orgExpertise.map((x) => Number(x));
            delete data.orgExpertise;
          }
        }
      } else {
        data.org = {};
        feedCountry(data, formData, "S1");
        feedSeeking(data, formData);
        data.title = formData.S1.title;
        feedOffering(data, formData);
        if (data.companyName?.[formData["S2"].companyName]) {
          data.nonMemberOrganisation = formData["S2"].companyName;
          delete data.org;
        }
        delete data.companyName;
        if (data.orgName) {
          data.org.id = formData.S2.orgName;
        }
        if (data.privateCitizen) {
          delete data.privateCitizen;
          delete data.org;
        }
        data.representation = "";
        if (formData.S2["newCompanyName"]) {
          let data2 = handleGeoCoverageValue(
            cloneDeep(formData.S2),
            formData.S2,
            countries
          );
          data2.name = data2.newCompanyName;
          data2.country = data2.newCompanyHeadquarter;
          data2.subnationalAreaOnly = data2.newCompanySubnationalAreaOnly;
          delete data2.newCompanySubnationalAreaOnly;
          delete data2.newCompanyName;
          delete data2.newCompanyHeadquarter;
          delete data2.companyName;
          delete data2.privateCitizen;
          data.new_org = data2;
          delete data.geoCoverageType;
          delete data.geoCoverageValue;
          delete data.newCompanyHeadquarter;
          delete data.newCompanySubnationalAreaOnly;
          delete data.newCompanyName;
          delete data.geoCoverageValueTransnational;
        }
      }

      if (hideEntityPersonalDetail) {
        delete data.title;
        // get personal details data from profile
        // filter null value
        let filteredProfile = {};
        Object.keys(profile).forEach((key) => {
          if (profile[key]) {
            filteredProfile = {
              ...filteredProfile,
              [key]: profile[key],
            };
          }
        });
        // add filtered profile to data payload
        data = { ...filteredProfile, ...data };
      }

      if (status === "add" && !params?.id) {
        api
          .post("/profile", data)
          .then((res) => {
            UIStore.update((e) => {
              e.formStep = {
                ...e.formStep,
                signUp: 2,
              };
              e.profile = { ...res.data };
            });
            updateStatusProfile(res.data);

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
      if (status === "edit" || params?.id) {
        api
          .put(`/detail/project/${id || params?.id}`, data)
          .then(() => {
            notification.success({ message: "Update success" });
            UIStore.update((e) => {
              e.formEdit = {
                ...e.formEdit,
                signup: {
                  status: "add",
                  id: null,
                },
              };
            });
            // scroll top
            window.scrollTo({ top: 0 });
            signUpData.update((e) => {
              e.data = initialSignUpData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            history.push(`/project/${id || params?.id}`);
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
        // delete members/non-members value when private citizen true
        if (!isEntityType && formData?.S2?.privateCitizen) {
          formData?.S2?.orgName && delete formData?.S2?.orgName;
          formData?.S2?.companyName && delete formData?.S2?.companyName;
        }
        // delete members value when non-members selected
        if (!isEntityType && formData?.S2?.companyName) {
          formData?.S2?.orgName && delete formData?.S2?.orgName;
        }
        // delete non-members value when members selected
        if (!isEntityType && formData?.S2?.orgName) {
          formData?.S2?.companyName && delete formData?.S2?.companyName;
          formData?.S2?.newCompanyName && delete formData?.S2?.newCompanyName;
          formData?.S2?.newCompanyHeadquarter &&
            delete formData?.S2?.newCompanyHeadquarter;
          formData?.S2?.geoCoverageType && delete formData?.S2?.geoCoverageType;
          formData?.S2?.newCompanySubnationalAreaOnly &&
            delete formData?.S2?.newCompanySubnationalAreaOnly;
        }

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
        const stakeholderSections = new Set(["S1", "S2", "S3"]);
        const requiredFilledIn = checkRequiredFieldFilledIn(
          formData,
          dependFields,
          isEntityType
            ? requiredFields
            : requiredFields.filter((x) => stakeholderSections.has(x.key))
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
          let formSections = null;
          if (isEntityType) {
            formSections = {
              S1: {
                ...e.data.S1,
                required: groupRequiredFields["S1"].required,
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
            // add S2- Personal Details here
            if (!hideEntityPersonalDetail) {
              formSections = {
                ...formSections,
                S2: {
                  ...e.data.S2,
                  required: groupRequiredFields["S2"].required,
                },
              };
            }
          } else {
            formSections = {
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
          }

          e.data = {
            ...e.data,
            required: sectionRequiredFields,
            ...formSections,
          };
        });
        // enable btn submit
        requiredFilledIn.length === 0 &&
          setDisabledBtn({ disabled: false, type: "primary" });
        requiredFilledIn.length !== 0 &&
          setDisabledBtn({ disabled: true, type: "default" });
      },
      [
        isEntityType,
        signUpData,
        formSchema,
        setDisabledBtn,
        hideEntityPersonalDetail,
      ]
    );

    const handleTransformErrors = (errors, dependValue) => {
      // custom errors handle
      [".S1", ".S3", ".S4"].forEach((x) => {
        let index = dependValue.indexOf(x);
        index !== -1 && dependValue.splice(index, 1);
      });
      const res = overideValidation(errors, dependValue);
      res.length === 0 && setHighlight(false);
      if (res.length > 0) {
        const descriptionList = res.map((r, index) => {
          const { property, message } = r;
          const tabSection = property
            .replace(".", "")
            .replace("['", "_")
            .replace("']", "_")
            .split("_")[0];
          const tabSectionTitle = tabsData.find((x) => x.key === tabSection)
            ?.title;
          return (
            <li key={`${property}-${index}`}>
              {tabSectionTitle}:{" "}
              <Typography.Text type="danger">{message}</Typography.Text>
            </li>
          );
        });
        notification.error({
          message: "Error",
          description: <ul>{descriptionList}</ul>,
        });
      }
      return res;
    };

    useEffect(() => {
      handleFormOnChange({
        formData: signUpFormData.data,
        schema: formSchema.schema,
      });
    }, [formSchema, signUpFormData, handleFormOnChange]);

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
