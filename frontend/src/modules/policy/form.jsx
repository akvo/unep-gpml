import { UIStore } from "../../store";
import { Store } from "pullstate";
import { notification } from "antd";
import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/api";
import { withTheme } from "@rjsf/core";
import { Theme as AntDTheme } from "@rjsf/antd";
import { schema, uiSchema } from "./form-schema";
import ObjectFieldTemplate from "../../utils/forms/object-template";
import ArrayFieldTemplate from "../../utils/forms/array-template";
import FieldTemplate from "../../utils/forms/field-template";
import widgets from "../../utils/forms";
import {
  collectDependSchema,
  overideValidation,
  checkRequiredFieldFilledIn,
  findCountryIsoCode,
  handleGeoCoverageValue,
  customFormats,
} from "../../utils/forms";
import cloneDeep from "lodash/cloneDeep";

const Form = withTheme(AntDTheme);

const getSchema = ({ countries, tags, regionOptions, meaOptions }, loading) => {
  const prop = cloneDeep(schema.properties);
  prop.country.enum = countries?.map((x, i) => x.id);
  prop.country.enumNames = countries?.map((x, i) => x.name);
  prop.geoCoverageValueRegional.enum = regionOptions?.map((x) => String(x.id));
  prop.geoCoverageValueRegional.enumNames = regionOptions?.map((x) => x.name);
  prop.geoCoverageValueNational.enum = countries?.map((x, i) => x.id);
  prop.geoCoverageValueNational.enumNames = countries?.map((x, i) => x.name);
  prop.geoCoverageValueTransnational.enum = countries?.map((x, i) =>
    String(x.id)
  );
  prop.geoCoverageValueTransnational.enumNames = countries?.map(
    (x, i) => x.name
  );
  prop.geoCoverageValueGlobalSpesific.enum = meaOptions?.map((x) =>
    String(x.id)
  );
  prop.geoCoverageValueGlobalSpesific.enumNames = meaOptions?.map(
    (x) => x.name
  );
  prop.implementingMea.enum = meaOptions?.map((x) => x.id);
  prop.implementingMea.enumNames = meaOptions?.map((x) => x.name);
  prop.tags.enum = tags.policy?.map((x) => String(x.id));
  prop.tags.enumNames = tags.policy?.map((x) => x.tag);
  return {
    schema: {
      ...schema,
      properties: prop,
    },
    loading: loading,
  };
};

export const policyData = new Store({ data: {} });

const AddPolicyForm = ({
  btnSubmit,
  sending,
  setSending,
  highlight,
  setHighlight,
  setDisabledBtn,
}) => {
  const {
    countries,
    organisations,
    tags,
    loading,
    formStep,
  } = UIStore.currentState;
  const [dependValue, setDependValue] = useState([]);
  const [formSchema, setFormSchema] = useState({
    schema: schema,
    loading: true,
  });

  useEffect(() => {
    if (formSchema.loading && !loading) {
      setFormSchema(getSchema(UIStore.currentState, false));
    }
  }, [loading, formSchema]);

  useEffect(() => {
    setFormSchema({ schema: schema, loading: true });
  }, [highlight]);

  const handleOnSubmit = ({ formData }) => {
    let data = { ...formData };

    delete data.date;
    data.firstPublicationDate = formData.date.firstPublicationDate;
    data.latestAmendmentDate = formData?.date?.latestAmendmentDate || "Ongoing";

    if (data?.urls[0]?.url) {
      data.urls = formData.urls.filter((it) => it?.url && it.url.length > 0);
    }
    if (!data?.urls[0]?.url) {
      delete data.urls;
    }

    data = handleGeoCoverageValue(data, formData, countries);
    data?.image === "" && delete data.image;
    data.tags = formData.tags && formData.tags.map((x) => parseInt(x));

    setSending(true);
    api
      .post("/policy", data)
      .then(() => {
        UIStore.update((e) => {
          e.formStep = {
            ...e.formStep,
            policy: 2,
          };
        });
        // scroll top
        window.scrollTo({ top: 0 });
        policyData.update((e) => {
          e.data = {};
        });
        setDisabledBtn({ disabled: true, type: "default" });
      })
      .catch(() => {
        notification.error({ message: "An error occured" });
      })
      .finally(() => {
        setSending(false);
      });
  };

  const handleFormOnChange = ({ formData }) => {
    // remove image property when user remove image from form
    formData?.image === "" && delete formData.image;
    policyData.update((e) => {
      e.data = formData;
    });
    // to overide validation
    let dependFields = [];
    let requiredFields = [];
    collectDependSchema(
      dependFields,
      formData,
      formSchema.schema,
      requiredFields
    );
    setDependValue(dependFields);
    // enable btn submit
    const requiredFilledIn = checkRequiredFieldFilledIn(
      formData,
      dependFields,
      requiredFields
    );
    requiredFilledIn.length === 0 &&
      setDisabledBtn({ disabled: false, type: "primary" });
    requiredFilledIn.length !== 0 &&
      setDisabledBtn({ disabled: true, type: "default" });
  };

  const handleTransformErrors = (errors, dependValue) => {
    const { data } = policyData.currentState;
    let res = overideValidation(errors, dependValue);
    // publication and amandment date validation
    const { firstPublicationDate, latestAmendmentDate } = data?.date;
    if (firstPublicationDate && latestAmendmentDate) {
      if (new Date(firstPublicationDate) > new Date(latestAmendmentDate)) {
        res.push({
          message:
            "First publication date must be date before last amandment date",
          name: "required",
          params: { missingProperty: "firstPublicationDate" },
          property: ".date.firstPublicationDate",
          schemaPath: "#/properties/date/required",
          stack: ".date.firstPublicationDate is a required property",
        });
      }
    }
    res.length === 0 && setHighlight(false);
    return res;
  };

  return (
    <div className="add-policy-form">
      {formStep.policy === 1 && (
        <Form
          idPrefix="policy"
          schema={formSchema.schema}
          uiSchema={uiSchema}
          formData={policyData.currentState.data}
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
      )}
      {formStep.policy === 2 && (
        <div>
          <h3>Thank you for adding the Policy</h3>
          <p>we'll let you know once an admin has approved it</p>
        </div>
      )}
    </div>
  );
};

export default AddPolicyForm;
