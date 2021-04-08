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

const AddResourceForm = () => {
  const {
    formData,
    countries,
    organisations,
    tags,
    currencies,
  } = UIStore.currentState;
  const [dependValue, setDependValue] = useState([]);
  const [formSchema, setFormSchema] = useState({
    schema: schema,
    loading: true,
  });
  const [formUiSchema, setFormUiSchema] = useState(uiSchema);
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(1);
  const btnSubmit = useRef();

  const findCountryIsoCode = (value) => {
    const country = countries.find((x) => x.id === value);
    return country?.isoCode;
  };

  const handleGeoCoverageValue = (data, currentValue) => {
    delete data.geoCoverageValueNational;
    delete data.geoCoverageValueRegional;
    delete data.geoCoverageValueGlobalSpesific;
    delete data.geoCoverageValueSubNational;
    if (
      data.geoCoverageType === "national" ||
      data.geoCoverageType === "transnational"
    ) {
      data.geoCoverageValue = [
        findCountryIsoCode(currentValue.geoCoverageValueNational),
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

  const handleOnSubmit = ({ formData }) => {
    let data = { ...formData, resourceType: "Financing Resource" };

    data?.newOrg && delete data.newOrg;
    data.org = { id: formData.org };
    if (formData.org === -1) {
      data.org = {
        ...formData.newOrg,
        id: formData.org,
      };
      data.org.country = findCountryIsoCode(formData.newOrg.country);
      data.org = handleGeoCoverageValue(data.org, formData.newOrg);
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

    data = handleGeoCoverageValue(data, formData);
    data?.image === "" && delete data.image;
    data.tags = formData.tags && formData.tags.map((x) => parseInt(x));

    setSending(true);
    api.post("/resource", data).then(() => {
      setSending(false);
      setStep(2);
    });
  };

  useEffect(() => {
    if (
      formSchema.loading &&
      countries.length > 0 &&
      tags?.financingMechanism
    ) {
      const newSchema = cloneDeep(formSchema);
      const newOrganisations = [...organisations, { id: -1, name: "Other" }]
        .map((x) => x)
        .sort((a, b) => a.name.localeCompare(b.name));
      newSchema.schema.properties.org = {
        ...newSchema.schema.properties.org,
        enum: newOrganisations.map((it) => it.id),
        enumNames: newOrganisations.map((it) => it.name),
      };
      newSchema.schema.properties.value.properties.valueCurrency = {
        ...newSchema.schema.properties.value.properties.valueCurrency,
        enum: currencies.map((x, i) => x.value),
        enumNames: currencies.map((x) => x.label),
      };
      newSchema.schema.properties.country = {
        ...newSchema.schema.properties.country,
        enum: sortedCountries(countries).map((x, i) => x.id),
        enumNames: sortedCountries(countries).map((x) => x.name),
      };
      newSchema.schema.properties.geoCoverageValueNational = {
        ...newSchema.schema.properties.geoCoverageValueNational,
        enum: sortedCountries(countries).map((x, i) => x.id),
        enumNames: sortedCountries(countries).map((x) => x.name),
      };
      newSchema.schema.properties.tags = {
        ...newSchema.schema.properties.tags,
        enum: tags.financingMechanism.map((x) => String(x.id)),
        enumNames: tags.financingMechanism.map((x) => x.tag),
      };
      newSchema.loading = false;
      setFormSchema(newSchema);
    }
  }, [tags, organisations, countries]);

  const sortedCountries = (countries) => {
    return countries.map((x) => x).sort((a, b) => a.name.localeCompare(b.name));
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

  const handleValidation = (errors) => {
    return overideValidation(errors, dependValue);
  };

  return (
    <div className="add-resource-form">
      {step === 1 && (
        <>
          <Form
            idPrefix="resource_"
            schema={formSchema.schema}
            uiSchema={formUiSchema}
            formData={formData}
            onChange={(e) => handleFormOnChange(e)}
            onSubmit={(e) => handleOnSubmit(e)}
            ArrayFieldTemplate={ArrayFieldTemplate}
            ObjectFieldTemplate={ObjectFieldTemplate}
            FieldTemplate={FieldTemplate}
            widgets={widgets}
            transformErrors={(errors) => handleValidation(errors)}
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
