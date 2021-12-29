import React, { useEffect, useState, useCallback } from "react";
import ObjectFieldTemplate from "../../utils/forms/object-template";
import ArrayFieldTemplate from "../../utils/forms/array-template";
import FieldTemplate from "../../utils/forms/field-template";
import widgets from "../../utils/forms";
import { overideValidation } from "../../utils/forms";
import uiSchema from "./uiSchema.json";
import common from "./common";
import cloneDeep from "lodash/cloneDeep";
import { withRouter } from "react-router-dom";
import { UIStore } from "../../store";
import { Store } from "pullstate";
import { notification, Typography } from "antd";
import { Theme as AntDTheme } from "@rjsf/antd";
import { withTheme } from "@rjsf/core";
import {
  transformFormData,
  collectDependSchemaRefactor,
} from "../initiative/form";
import {
  handleGeoCoverageValue,
  checkRequiredFieldFilledIn,
  checkDependencyAnswer,
  customFormats,
  collectDependSchema,
} from "../../utils/forms";
import api from "../../utils/api";

const Form = withTheme(AntDTheme);

const FlexibleForm = withRouter(
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
    mainType,
    owners,
    subContentType,
    match: { params },
  }) => {
    const {
      countries,
      organisations,
      tags,
      formEdit,
      profile,
      selectedMainContentType,
    } = UIStore.currentState;

    const { status, id } = formEdit.flexible;

    const { initialData, initialFormData } = common;

    const flexibleFormData = initialFormData.useState();

    const [dependValue, setDependValue] = useState([]);
    const [editCheck, setEditCheck] = useState(true);

    const handleOnSubmit = ({ formData }) => {
      console.log(formData);

      delete formData?.tabs;
      delete formData?.steps;
      delete formData?.required;

      // # Transform data before sending to endpoint
      let data = {
        ...formData,
        resourceType: mainType,
        subContentType: subContentType,
      };

      transformFormData(data, formData, formSchema.schema.properties, true);

      data.version = parseInt(formSchema.schema.version);

      delete data?.S1;
      delete data?.S2;
      delete data?.S3;
      delete data?.S4;
      delete data?.S5;

      data.geoCoverageType = Object.keys(data.geoCoverageType)[0];
      // data.org = {
      //   id: parseInt(Object.keys(data.orgName)[0]),
      // };
      if (data.resourceType === "Financing Resource") {
        data.valueCurrency = Object.keys(data.valueCurrency)[0];
        data.validTo = data.validTo || "Ongoing";
        data.value = data.valueAmount;
        delete data.valueAmount;
        if (data.valueRemark) {
          data.valueRemarks = data.valueRemark;
          delete data.valueRemark;
        }
      }
      delete data.orgName;

      data.tags =
        formData.S4.S4_G3.tags &&
        formData.S4.S4_G3.tags.map((x) => parseInt(x));

      if (data?.publishYear) {
        const publishYear = new Date(data.publishYear);
        data.publishYear = publishYear.getFullYear();
      }

      if (data.geoCoverageType === "transnational") {
        data.geoCoverageCountryGroups = data.geoCoverageValueTransnational.map(
          (x) => parseInt(x)
        );
        data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
          parseInt(x)
        );
        delete data.geoCoverageValueTransnational;
      }

      if (data.geoCoverageType === "national") {
        data.geoCoverageCountries = [
          parseInt(Object.keys(data.geoCoverageValueNational)[0]),
        ];

        delete data.geoCoverageValueNational;
      }

      if (data?.urls) {
        data.urls = data.urls.map((x) => {
          return {
            url: x,
            lang: "en",
          };
        });
      }

      if (data?.entity) {
        data.entityConnections = data.entity;
        delete data.entity;
      }
      if (data?.individual) {
        data.individualConnections = data.individual;
        delete data.individual;
      }
      if (data?.info) {
        data.infoDocs = data.info;
        delete data.info;
      }
      if (status === "add" && !params?.id) {
        api
          .post("/resource", data)
          .then(() => {
            // scroll top
            window.scrollTo({ top: 0 });
            initialFormData.update((e) => {
              e.data = initialData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            notification.success({ message: "Resource successfully created" });
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
        initialFormData.update((e) => {
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
        initialFormData.update((e) => {
          e.data = {
            ...e.data,
            required: sectionRequiredFields,
            S4: {
              ...e.data.S4,
              required: groupRequiredFields["S4"].required,
            },
            S5: {
              ...e.data.S5,
              required: groupRequiredFields["S5"].required,
            },
          };
        });
        // enable btn submit
        requiredFilledIn.length === 0 &&
          setDisabledBtn({ disabled: false, type: "primary" });
        requiredFilledIn.length !== 0 &&
          setDisabledBtn({ disabled: true, type: "default" });
      },
      [initialFormData, formSchema, setDisabledBtn]
    );

    const handleTransformErrors = (errors, dependValue) => {
      // custom errors handle
      [".S4", ".S5"].forEach((x) => {
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

    return (
      <div className="add-flexible-form">
        <>
          <Form
            idPrefix="flexibleForm"
            schema={formSchema.schema}
            uiSchema={uiSchema[selectedMainContentType]}
            formData={flexibleFormData.data}
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

export default FlexibleForm;
