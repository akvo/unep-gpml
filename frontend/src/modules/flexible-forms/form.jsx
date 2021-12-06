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

    const handleOnSubmit = ({ formData }) => {};

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

    const handleTransformErrors = (errors, dependValue) => {};

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
