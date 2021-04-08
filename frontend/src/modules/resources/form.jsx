import { UIStore } from "../../store";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "antd";
import specificAreasOptions from "./specific-areas.json";
import api from "../../utils/api";
import { withTheme } from "@rjsf/core";
import { Theme as AntDTheme } from "@rjsf/antd";
import { schema, uiSchema } from "./form-schema";
import ObjectFieldTemplate from "../../utils/forms/object-template";
import ArrayFieldTemplate from "../../utils/forms/array-template";
import FieldTemplate from "../../utils/forms/field-template";
import widgets from "../../utils/forms";
import { collectDependSchema, overideValidation } from "../../utils/forms";
import cloneDeep from "lodash/cloneDeep";

const Form = withTheme(AntDTheme);

const findCountryIsoCode = (value, countries) => {
  const country = countries.find((x) => x.id === value);
  return country?.isoCode;
};

const handleGeoCoverageValue = (data, currentValue, countries) => {
  delete data.geoCoverageValueNational;
  delete data.geoCoverageValueRegional;
  delete data.geoCoverageValueGlobalSpesific;
  delete data.geoCoverageValueSubNational;
  if (
    data.geoCoverageType === "national" ||
    data.geoCoverageType === "transnational"
  ) {
    data.geoCoverageValue = [
      findCountryIsoCode(currentValue.geoCoverageValueNational, countries),
    ];
  }
  if (data.geoCoverageType === "regional")
    data.geoCoverageValue = currentValue.geoCoverageValueRegional;
  if (data.geoCoverageType === "global with elements in specific areas")
    data.geoCoverageValue = currentValue.geoCoverageValueGlobalSpesific;
  if (data.geoCoverageType === "sub-national")
    data.geoCoverageValue = currentValue.geoCoverageValueSubNational;

  return data;
};

const getSchema = ({ countries, organisations, tags, currencies }) => {
  const prop = cloneDeep(schema.properties);
  const orgs = [...organisations, { id: -1, name: "Other" }].map((x) => x);
  prop.org.enum = orgs?.map((it) => it.id);
  prop.org.enumNames = orgs?.map((it) => it.name);
  prop.value.properties.valueCurrency = {
    ...prop.value.properties.valueCurrency,
    enum: currencies?.map((x, i) => x.value),
    enumNames: currencies?.map((x, i) => x.label),
  };
  prop.country.enum = countries?.map((x, i) => x.id);
  prop.country.enumNames = countries?.map((x, i) => x.name);
  prop.geoCoverageValueNational.enum = countries?.map((x, i) => x.id);
  prop.geoCoverageValueNational.enumNames = countries?.map((x, i) => x.name);
  prop.tags.enum = tags.financingMechanism?.map((x) => String(x.id));
  prop.tags.enumNames = tags.financingMechanism?.map((x) => x.tag);
  return {
    schema: {
      ...schema,
      properties: prop,
    },
  };
};

const AddResourceForm = () => {
  const {
    formData,
    countries,
    organisations,
    tags,
    currencies,
  } = UIStore.currentState;
  const [dependValue, setDependValue] = useState([]);
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(1);
  const btnSubmit = useRef();
  const formSchema = getSchema(UIStore.currentState);

  const handleOnSubmit = ({ formData }) => {
    let data = { ...formData, resourceType: "Financing Resource" };

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

    delete data.value;
    data.value = formData.value.valueAmount;
    data.valueCurrency = formData.value.valueCurrency;
    if (formData?.value?.valueRemark)
      data.valueRemarks = formData.value.valueRemark;

    delete data.date;
    data.validFrom = formData.date.validFrom;
    data.validTo = formData?.date?.validTo ? formData.date.validTo : "Ongoing";

    if (data?.urls[0]?.url)
      data.urls = formData.urls.filter((it) => it.url.length > 0);
    if (!data?.urls[0]?.url) delete data.urls;

    data = handleGeoCoverageValue(data, formData, countries);
    data?.image === "" && delete data.image;
    data.tags = formData.tags && formData.tags.map((x) => parseInt(x));

    setSending(true);
    api.post("/resource", data).then(() => {
      setSending(false);
      setStep(2);
    });
  };

  const handleFormOnChange = ({ formData }) => {
    UIStore.update((e) => {
      e.formData = formData;
    });
    // to overide validation
    let tmp = [];
    collectDependSchema(tmp, formData, formSchema.schema);
    setDependValue(tmp);
  };

  return (
    <div className="add-resource-form">
      {step === 1 && (
        <>
          <Form
            idPrefix="resource_"
            schema={formSchema.schema}
            uiSchema={uiSchema}
            formData={formData}
            onChange={(e) => handleFormOnChange(e)}
            onSubmit={(e) => handleOnSubmit(e)}
            ArrayFieldTemplate={ArrayFieldTemplate}
            ObjectFieldTemplate={ObjectFieldTemplate}
            FieldTemplate={FieldTemplate}
            widgets={widgets}
            transformErrors={(errors) => overideValidation(errors, dependValue)}
            showErrorList={false}
          >
            <button ref={btnSubmit} type="submit" style={{ display: "none" }}>
              Fire
            </button>
          </Form>
          <Button
            loading={sending}
            type="primary"
            size="large"
            onClick={(e) => btnSubmit.current.click()}
          >
            Submit
          </Button>
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

export default AddResourceForm;
