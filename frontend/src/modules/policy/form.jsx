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
  // const orgs = [...organisations, { id: -1, name: "Other" }].map((x) => x);
  // prop.org.enum = orgs?.map((it) => it.id);
  // prop.org.enumNames = orgs?.map((it) => it.name);
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
  prop.implementingMea.enum = tags.mea?.map((x) => x.id);
  prop.implementingMea.enumNames = tags.mea?.map((x) => x.tag);
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
}) => {
  const { countries, organisations, tags, currencies } = UIStore.currentState;
  const [dependValue, setDependValue] = useState([]);
  const [step, setStep] = useState(1);
  const [formSchema, setFormSchema] = useState({
    schema: schema,
    loading: true,
  });

  useEffect(() => {
    if (formSchema.loading && tags?.policy && tags?.mea) {
      setFormSchema(getSchema(UIStore.currentState, false));
    }
  }, [tags?.policy, tags?.mea, formSchema]);

  useEffect(() => {
    if (!formSchema.loading) {
      setFormSchema({ schema: schema, loading: true });
    }
    if (formSchema.loading && tags?.policy && tags?.mea) {
      setFormSchema(getSchema(UIStore.currentState, false));
    }
  }, [highlight]);

  const handleOnSubmit = ({ formData }) => {
    let data = { ...formData };

    // data?.newOrg && delete data.newOrg;
    // data.org = { id: formData.org };
    // if (formData.org === -1) {
    //   data.org = {
    //     ...formData.newOrg,
    //     id: formData.org,
    //   };
    //   data.org.country = findCountryIsoCode(formData.newOrg.country, countries);
    //   data.org = handleGeoCoverageValue(data.org, formData.newOrg, countries);
    // }

    delete data.date;
    data.firstPublicationDate = formData.date.firstPublicationDate;
    data.latestAmendmentDate = formData?.date?.latestAmendmentDate || null;

    if (data?.urls[0]?.url)
      data.urls = formData.urls.filter((it) => it.url.length > 0);
    if (!data?.urls[0]?.url) delete data.urls;

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
    policyData.update((e) => {
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
            formData={policyData.currentState.data}
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

export default AddPolicyForm;
