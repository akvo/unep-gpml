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
  urls: [
    { lang: "en", url: "google.com" },
    { lang: "cs", url: "google.com" },
  ],
  title: "New Technical Resource",
  org: { id: 10001 },
  publishYear: 2020,
  country: 106,
  geoCoverageType: "transnational",
  summary: "Description",
  tags: [301, 302, 303],
  resourceType: "Technical Resource",
  geoCoverageValue: [106, 1, 6],
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

const revertFormData = () => {
  const formData = {};
  formDataMapping.forEach((item) => {
    const { name, group, type } = item;
    let key = name;
    let data = null;
    if (!group) {
      data = editDataSample[key];
    }
    if (group) {
      data = editDataSample[key];
    }
    if (key === "org") {
      data = data?.id;
    }
    if (type === "string") {
      data = String(data);
    }
    if (type === "integer") {
      data = parseInt(data);
    }
    if (key === "geoCoverageValue") {
      const geoCoverageType = editDataSample["geoCoverageType"];
      if (geoCoverageType === "national") {
        key = "geoCoverageValueNational";
      }
      if (geoCoverageType === "regional") {
        key = "geoCoverageValueRegional";
      }
      if (geoCoverageType === "transnational") {
        key = "geoCoverageValueTransnational";
      }
      if (geoCoverageType === "global with elements in specific areas") {
        key = "geoCoverageValueGlobalSpesific";
      }
      if (geoCoverageType === "sub-national") {
        key = "geoCoverageValueSubNational";
      }
    }
    if (!group) {
      formData[key] = data;
    }
    if (group) {
      formData[group] = { ...formData[group], [key]: data };
    }
  });
  return formData;
};

const transformPostData = (formData, countries) => {
  const postData = {};
  formDataMapping.forEach((item) => {
    const { name, group, type } = item;
    let key = name;
    let data = null;
    if (!group) {
      data = formData[key];
    }
    if (group) {
      data = formData[group][key];
    }
    if (type === "string") {
      data = String(data);
    }
    if (type === "integer") {
      data = parseInt(data);
    }
    if (key === "org") {
      data = { id: formData[key] };
      if (formData[key] === -1) {
        data = {
          ...formData.newOrg,
          id: formData.org,
        };
        const temp = handleGeoCoverageValue(data, formData.newOrg, countries);
        data["geoCoverageValue"] = temp["geoCoverageValue"];
      }
    }
    if (key === "publishYear") {
      data = parseInt(data);
    }
    if (key === "geoCoverageValue") {
      const temp = handleGeoCoverageValue(postData, formData, countries);
      data = temp[key];
    }
    postData[key] = data;
  });
  return postData;
};

export const resourceData = new Store({ data: revertFormData() });

const AddResourceForm = ({
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
    // let data = { ...formData, resourceType: "Technical Resource" };

    // data?.newOrg && delete data.newOrg;
    // data.org = { id: formData.org };
    // if (formData.org === -1) {
    //   data.org = {
    //     ...formData.newOrg,
    //     id: formData.org,
    //   };
    //   data.org = handleGeoCoverageValue(data.org, formData.newOrg, countries);
    // }

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
    const data = transformPostData(formData, countries);
    data["resourceType"] = "Technical Resource";
    setSending(true);
    api
      .post("/resource", data)
      .then(() => {
        UIStore.update((e) => {
          e.formStep = {
            ...e.formStep,
            technicalResource: 2,
          };
        });
        // scroll top
        window.scrollTo({ top: 0 });
        resourceData.update((e) => {
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
    resourceData.update((e) => {
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
    const res = overideValidation(errors, dependValue);
    res.length === 0 && setHighlight(false);
    return res;
  };

  return (
    <div className="add-resource-form">
      {formStep.technicalResource === 1 && (
        <Form
          idPrefix="technical-resource_"
          schema={formSchema.schema}
          uiSchema={uiSchema}
          formData={resourceData.currentState.data}
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
      {formStep.technicalResource === 2 && (
        <div>
          <h3>Thank you for adding the resource</h3>
          <p>we'll let you know once an admin has approved it</p>
        </div>
      )}
    </div>
  );
};

export default AddResourceForm;
