import { UIStore } from "../../store";
import React, { useEffect, useState } from "react";
import specificAreasOptions from "./specific-areas.json";
import api from "../../utils/api";
import { withTheme } from "@rjsf/core";
import { Theme as AntDTheme } from "@rjsf/antd";
import { schema, uiSchema } from "./form-schema";
import ObjectFieldTemplate from "../../utils/forms/object-template";
import ArrayFieldTemplate from "../../utils/forms/array-template";
import widgets, { CustomFieldTemplate } from "../../utils/forms";
import cloneDeep from "lodash/cloneDeep";

const Form = withTheme(AntDTheme);

const geoCoverageTypeOptions = [
  "Global",
  "Regional",
  "National",
  "Sub-national",
  "Transnational",
  "Global with elements in specific areas",
];

const regionOptions = [
  "Africa",
  "Asia and the Pacific",
  "East Asia",
  "Europe",
  "Latin America and Carribean",
  "North America",
  "West Asia",
];

const AddResourceForm = () => {
  const {
    formData,
    languages,
    countries,
    organisations,
  } = UIStore.currentState;
  const [formSchema, setFormSchema] = useState({
    schema: schema,
    loading: true,
  });
  const [formUiSchema, setFormUiSchema] = useState(uiSchema);
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(1);

  const onSubmit = (vals) => {
    const data = { ...vals };
    delete data.date;
    data.urls = vals.urls.filter((it) => it.url.length > 0);
    data.startDate = vals.date[0].toISOString();
    data.endDate = vals.date[1].toISOString();
    if (data.geoCoverageType === "national") {
      data.geoCoverageValue = [data.geoCoverageValue];
    }
    setSending(true);
    api.post("/resource", data).then(() => {
      setSending(false);
      setStep(2);
    });
  };

  useEffect(() => {
    if (formSchema.loading && countries.length > 0) {
      const newSchema = cloneDeep(formSchema);
      api
        .get("/tag/financing mechanism")
        .then((res) => {
          newSchema.schema.properties.tags.enum = res.data.map((x) => x.id);
          newSchema.schema.properties.tags.enumNames = res.data.map(
            (x) => x.tag
          );
          return true;
        })
        .then((res) => {
          newSchema.schema.properties.organisation.enum = organisations.map(
            (it) => it.id
          );
          newSchema.schema.properties.organisation.enumNames = organisations.map(
            (it) => it.name
          );
          newSchema.schema.properties.country.enum = sortedCountries(
            countries
          ).map((x) => x.value);
          newSchema.schema.properties.country.enumNames = sortedCountries(
            countries
          ).map((x) => x.label);
          newSchema.schema.properties.geoCoverageType.enum = geoCoverageTypeOptions;
          newSchema.schema.properties.urls.items.properties.languages.enum = Object.keys(
            languages
          ).map((langCode) => langCode);
          newSchema.schema.properties.urls.items.properties.languages.enumNames = Object.keys(
            languages
          ).map((langCode) => languages[langCode].name);
          newSchema.loading = false;
          setFormSchema(newSchema);
        });
    }
  }, [countries, formSchema]);

  const sortedCountries = (countries) => {
    return countries
      .map((x) => ({
        value: x.isoCode,
        label: x.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const handleFormOnChange = ({ formData }) => {
    UIStore.update((e) => {
      e.formData = formData;
    });
    const type =
      formData?.geoCoverageType && formData?.geoCoverageType.toLowerCase();
    const newUiSchema = cloneDeep(formUiSchema);
    const newSchema = cloneDeep(formSchema);

    if (type === "global") {
      // revert to default value
      newSchema.schema.required = schema.required;
      newSchema.schema.properties.geoCoverageValue =
        schema.properties.geoCoverageValue;
      newUiSchema.geoCoverageValue = uiSchema.geoCoverageValue;
      newUiSchema.geoCoverageValue = { "ui:disabled": true };
    } else if (type === "sub-national") {
      newSchema.schema.required = [
        ...newSchema.schema.required,
        "geoCoverageValue",
      ];
      newSchema.schema.properties.geoCoverageValue = {
        title: "RESOURCE GEO_COVERAGE",
        type: "string",
      };
      newUiSchema.geoCoverageValue = uiSchema.geoCoverageValue;
      newUiSchema.geoCoverageValue = {
        "ui:placeholder": "Type regions here...",
      };
    } else if (type === "national" || type === "transnational") {
      newSchema.schema.required = [
        ...newSchema.schema.required,
        "geoCoverageValue",
      ];
      newSchema.schema.properties.geoCoverageValue.enum = sortedCountries(
        countries
      ).map((x) => x.value);
      newSchema.schema.properties.geoCoverageValue.enumNames = sortedCountries(
        countries
      ).map((x) => x.label);
      newUiSchema.geoCoverageValue = {
        "ui:showSearch": true,
        "ui:mode": "multiple",
      };
    } else if (type === "regional") {
      newSchema.schema.required = [
        ...newSchema.schema.required,
        "geoCoverageValue",
      ];
      newSchema.schema.properties.geoCoverageValue.enum = regionOptions;
      newUiSchema.geoCoverageValue = {
        "ui:showSearch": true,
        "ui:mode": "multiple",
      };
    } else if (type === "global with elements in specific areas") {
      newSchema.schema.required = [
        ...newSchema.schema.required,
        "geoCoverageValue",
      ];
      newSchema.schema.properties.geoCoverageValue.enum = specificAreasOptions;
      newUiSchema.geoCoverageValue = {
        "ui:showSearch": true,
        "ui:mode": "multiple",
      };
    }
    setFormUiSchema(newUiSchema);
    setFormSchema(newSchema);
  };

  useEffect(() => {
    // console.log(formData);
  }, [formData]);

  return (
    <div className="add-resource-form">
      {step === 1 && (
        <Form
          idPrefix="resource_"
          schema={formSchema.schema}
          uiSchema={formUiSchema}
          formData={formData}
          onChange={(e) => handleFormOnChange(e)}
          onSubmit={(e) => console.log(e)}
          // onError={(error) => console.log(error)}
          ArrayFieldTemplate={ArrayFieldTemplate}
          ObjectFieldTemplate={ObjectFieldTemplate}
          FieldTemplate={CustomFieldTemplate}
          widgets={widgets}
        />
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
