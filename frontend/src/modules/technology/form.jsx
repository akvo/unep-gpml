import { UIStore } from "../../store";
import { Store } from "pullstate";
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
  findCountryIsoCode,
  handleGeoCoverageValue,
} from "../../utils/forms";
import cloneDeep from "lodash/cloneDeep";

const Form = withTheme(AntDTheme);

const getSchema = ({ countries, organisations, tags, currencies }, loading) => {
  const prop = cloneDeep(schema.properties);
  const orgs = [...organisations, { id: -1, name: "Other" }].map((x) => x);
  prop.org.enum = orgs?.map((it) => it.id);
  prop.org.enumNames = orgs?.map((it) => it.name);
  // prop.value.properties.valueCurrency = {
  //   ...prop.value.properties.valueCurrency,
  //   enum: currencies?.map((x, i) => x.value),
  //   enumNames: currencies?.map((x, i) => x.label),
  // };
  prop.country.enum = countries?.map((x, i) => x.id);
  prop.country.enumNames = countries?.map((x, i) => x.name);
  prop.geoCoverageValueNational.enum = countries?.map((x, i) => x.id);
  prop.geoCoverageValueNational.enumNames = countries?.map((x, i) => x.name);
  prop.geoCoverageValueTransnational.enum = countries?.map((x, i) =>
    String(x.id)
  );
  prop.geoCoverageValueTransnational.enumNames = countries?.map(
    (x, i) => x.name
  );
  prop.tags.enum = tags.technology?.map((x) => String(x.id));
  prop.tags.enumNames = tags.technology?.map((x) => x.tag);
  return {
    schema: {
      ...schema,
      properties: prop,
    },
    loading: loading,
  };
};

export const technologyData = new Store({ data: {} });

const AddTechnologyForm = ({
  btnSubmit,
  sending,
  setSending,
  highlight,
  setHighlight,
}) => {
  const { countries, organisations, tags, currencies } = UIStore.currentState;
  const [dependValue, setDependValue] = useState([]);
  const [step, setStep] = useState(1);
  const [formSchema, setFormSchema] = useState({
    schema: schema,
    loading: true,
  });

  useEffect(() => {
    if (formSchema.loading && tags?.technology) {
      setFormSchema(getSchema(UIStore.currentState, false));
    }
  }, [tags?.technology, formSchema]);

  useEffect(() => {
    if (!formSchema.loading) {
      console.log(tags);
      setFormSchema({ schema: schema, loading: true });
    }
    if (formSchema.loading && tags?.technology) {
      setFormSchema(getSchema(UIStore.currentState, false));
    }
  }, [highlight]);

  const handleOnSubmit = ({ formData }) => {
    let data = { ...formData, resourceType: "Action Plan" };

    data?.newOrg && delete data.newOrg;
    data.org = { id: formData.org };
    if (formData.org === -1) {
      data.org = {
        ...formData.newOrg,
        id: formData.org,
      };
      data.org.country = findCountryIsoCode(formData.newOrg.country, countries);
      data.org = handleGeoCoverageValue(data.org, formData.newOrg, countries);
    }

    // delete data.value;
    // data.value = formData.value.valueAmount;
    // data.valueCurrency = formData.value.valueCurrency;
    // if (formData?.value?.valueRemark)
    //   data.valueRemarks = formData.value.valueRemark;

    // delete data.date;
    // data.validFrom = formData.date.validFrom;
    // data.validTo = formData?.date?.validTo || "Ongoing";

    if (data?.relatedInfo?.email) data.email = formData.relatedInfo.email;
    if (data?.relatedInfo?.urls[0]?.url)
      data.urls = formData.relatedInfo.urls.filter((it) => it.url.length > 0);
    delete data.relatedInfo;

    data = handleGeoCoverageValue(data, formData, countries);
    data?.image === "" && delete data.image;
    data.tags = formData.tags && formData.tags.map((x) => parseInt(x));

    console.log(data);
    // setSending(true);
    // api.post("/resource", data).then(() => {
    //   setSending(false);
    //   setStep(2);
    // });
  };

  const handleFormOnChange = ({ formData }) => {
    technologyData.update((e) => {
      e.data = formData;
    });
    // to overide validation
    let tmp = [];
    collectDependSchema(tmp, formData, formSchema.schema);
    setDependValue(tmp);
  };

  const handleTransformErrors = (errors, dependValue) => {
    const res = overideValidation(errors, dependValue);
    res.length === 0 && setHighlight(false);
    return res;
  };

  return (
    <div className="add-action-plan-form">
      {step === 1 && (
        <>
          <Form
            idPrefix="action-plan"
            schema={formSchema.schema}
            uiSchema={uiSchema}
            formData={technologyData.currentState.data}
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

export default AddTechnologyForm;
