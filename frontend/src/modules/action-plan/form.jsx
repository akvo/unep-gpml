import { UIStore } from "../../store";
import { Store } from "pullstate";
import { notification } from "antd";
import React, { useEffect, useState } from "react";
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
  handleGeoCoverageValue,
  customFormats,
  revertFormData,
  transformPostData,
} from "../../utils/forms";
import cloneDeep from "lodash/cloneDeep";

const Form = withTheme(AntDTheme);

const getSchema = (
  { countries, organisations, tags, regionOptions, meaOptions },
  loading
) => {
  const prop = cloneDeep(schema.properties);
  const orgs = [...organisations, { id: -1, name: "Other" }].map((x) => x);
  prop.org.enum = orgs?.map((it) => it.id);
  prop.org.enumNames = orgs?.map((it) => it.name);
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
  prop.tags.enum = tags.technicalResourceType?.map((x) => String(x.id));
  prop.tags.enumNames = tags.technicalResourceType?.map((x) => x.tag);
  return {
    schema: {
      ...schema,
      properties: prop,
    },
    loading: loading,
  };
};

const editDataSample = {
  urls: [{ lang: "en", url: "www.google.com" }],
  title: "New Action Plan",
  org: { id: 10001 },
  publishYear: 2020,
  country: 106,
  geoCoverageType: "sub-national",
  geoCoverageValueNational: 1,
  summary: "Description",
  tags: [301, 302, 303],
  resourceType: "Action Plan",
  validFrom: "2021-05-01",
  validTo: "2021-05-27",
  geoCoverageValue: [1],
};

const formDataMapping = [
  {
    name: "title",
    group: null,
    type: "string",
  },
  {
    name: "org",
    group: null,
    type: "integer",
  },
  {
    name: "publishYear",
    group: null,
    type: "string",
  },
  {
    name: "validFrom",
    group: "date",
    type: "string",
  },
  {
    name: "validTo",
    group: "date",
    type: "string",
  },
  {
    name: "country",
    group: null,
    type: "integer",
  },
  {
    name: "geoCoverageType",
    group: null,
    type: "string",
  },
  {
    name: "geoCoverageValue",
    group: null,
    type: "array",
  },
  {
    name: "summary",
    group: null,
    type: "string",
  },
  {
    name: "tags",
    group: null,
    type: "array",
  },
  {
    name: "urls",
    group: null,
    type: "array",
  },
];

export const actionPlanData = new Store({
  data: revertFormData(formDataMapping, editDataSample),
});

const AddActionPlanForm = ({
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
    // let data = { ...formData, resourceType: "Action Plan" };

    // data?.newOrg && delete data.newOrg;
    // data.org = { id: formData.org };
    // if (formData.org === -1) {
    //   data.org = {
    //     ...formData.newOrg,
    //     id: formData.org,
    //   };
    //   data.org = handleGeoCoverageValue(data.org, formData.newOrg, countries);
    // }

    // delete data.date;
    // data.validFrom = formData.date.validFrom;
    // data.validTo = formData?.date?.validTo || "Ongoing";

    // if (data?.urls[0]?.url) {
    //   data.urls = formData.urls.filter((it) => it?.url && it.url.length > 0);
    // }
    // if (!data?.urls[0]?.url) {
    //   delete data.urls;
    // }

    // data = handleGeoCoverageValue(data, formData, countries);
    // data?.image === "" && delete data.image;
    // data.tags = formData.tags && formData.tags.map((x) => parseInt(x));

    // if (data?.publishYear) {
    //   const publishYear = new Date(formData.publishYear);
    //   data.publishYear = publishYear.getFullYear();
    // }
    const data = transformPostData(formDataMapping, formData, countries);
    data["resourceType"] = "Action Plan";
    setSending(true);
    api
      .post("/resource", data)
      .then(() => {
        UIStore.update((e) => {
          e.formStep = {
            ...e.formStep,
            actionPlan: 2,
          };
        });
        // scroll top
        window.scrollTo({ top: 0 });
        actionPlanData.update((e) => {
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
    actionPlanData.update((e) => {
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
    const { data } = actionPlanData.currentState;
    const res = overideValidation(errors, dependValue);
    res.length === 0 && setHighlight(false);
    // valid from & valid to
    const { validFrom, validTo } = data?.date;
    if (validFrom && validTo) {
      if (new Date(validFrom) > new Date(validTo)) {
        res.push({
          message: "Valid from date must be date before valid to date",
          name: "required",
          params: { missingProperty: "validFrom" },
          property: ".date.validFrom",
          schemaPath: "#/properties/date/required",
          stack: ".date.validFrom is a required property",
        });
      }
    }
    return res;
  };

  return (
    <div className="add-action-plan-form">
      {formStep.actionPlan === 1 && (
        <Form
          idPrefix="action-plan"
          schema={formSchema.schema}
          uiSchema={uiSchema}
          formData={actionPlanData.currentState.data}
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
      {formStep.actionPlan === 2 && (
        <div>
          <h3>Thank you for adding the resource</h3>
          <p>we'll let you know once an admin has approved it</p>
        </div>
      )}
    </div>
  );
};

export default AddActionPlanForm;
