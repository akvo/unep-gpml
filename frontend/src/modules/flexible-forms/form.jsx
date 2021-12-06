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
import { notification } from "antd";
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
    match: { params },
  }) => {
    const {
      countries,
      organisations,
      tags,
      formEdit,
      profile,
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
      let data = { ...formData, resourceType: mainType, owners: owners };

      transformFormData(data, formData, formSchema.schema.properties, true);

      data.version = parseInt(formSchema.schema.version);

      delete data?.S1;
      delete data?.S2;
      delete data?.S3;
      delete data?.S4;
      delete data?.S5;

      data.country = parseInt(Object.keys(data.country)[0]);
      data.geoCoverageType =
        data.geoCoverageType[Object.keys(data.geoCoverageType)[0]];

      data.org = {
        id: parseInt(Object.keys(data.orgName)[0]),
      };

      delete data.orgName;

      data.tags =
        formData.S4.S4_G3.tags &&
        formData.S4.S4_G3.tags.map((x) => parseInt(x));

      if (data?.publishYear) {
        const publishYear = new Date(data.publishYear);
        data.publishYear = publishYear.getFullYear();
      }

      if (data?.urls) {
        data.urls = data.urls.map((x) => {
          return {
            url: x,
          };
        });
      }

      console.log(data);

      const d = {
        title: "test",
        org: {
          id: 1000,
        },
        publishYear: 2020,
        country: 1029,
        geoCoverageType: "transnational",
        geoCoverageCountries: [1098],
        tags: [143],
        resourceType: "Technical Resource",
        geoCoverageCountryGroups: [157],
      };
    };

    const handleFormOnChange = useCallback(
      ({ formData, schema }) => {
        console.log(formData, "HandleChange");
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
      },
      [initialFormData, formSchema]
    );

    const handleTransformErrors = (errors, dependValue) => {
      // custom errors handle
      [".S1", ".S3", ".S4", ".S5"].forEach((x) => {
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
            uiSchema={uiSchema["initiative"]}
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
