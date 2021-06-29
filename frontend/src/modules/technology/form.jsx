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

const formDataMapping = [
  {
    key: "name",
    name: "name",
    group: null,
    type: "string",
  },
  {
    key: "yearFounded",
    name: "yearFounded",
    group: null,
    type: "date",
  },
  {
    key: "organisationType",
    name: "organisationType",
    group: null,
    type: "string",
  },
  {
    key: "developmentStage",
    name: "developmentStage",
    group: null,
    type: "string",
  },
  {
    key: "url",
    name: "url",
    group: null,
    type: "string",
  },
  {
    key: "logo",
    name: "logo",
    group: null,
    type: "image",
  },
  {
    key: "country",
    name: "country",
    group: null,
    type: "integer",
  },
  {
    key: "geoCoverageType",
    name: "geoCoverageType",
    group: null,
    type: "string",
  },
  {
    key: "geoCoverageValues",
    name: "geoCoverageValue",
    group: null,
    type: "array",
  },
  {
    key: "remarks",
    name: "remarks",
    group: null,
    type: "string",
  },
  {
    key: "image",
    name: "image",
    group: null,
    type: "image",
  },
  {
    key: "tags",
    name: "tags",
    group: null,
    type: "array",
  },
  {
    key: "email",
    name: "email",
    group: "relatedInfo",
    type: "string",
  },
  {
    key: "languages",
    name: "urls",
    group: "relatedInfo",
    type: "array",
  },
];

export const technologyData = new Store({ data: {} });

const AddTechnologyForm = ({
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
    formEdit,
  } = UIStore.currentState;

  const formData = technologyData.useState();
  const { data } = formData;
  const { status, id } = formEdit.technology;
  const [dependValue, setDependValue] = useState([]);
  const [formSchema, setFormSchema] = useState({
    schema: schema,
    loading: true,
  });

  useEffect(() => {
    if (formSchema.loading && !loading) {
      setFormSchema(getSchema(UIStore.currentState, false));
      // Manage form status, add/edit
      if (status === "edit") {
        api.get(`/detail/technology/${id}`).then((d) => {
          technologyData.update((e) => {
            e.data = revertFormData(formDataMapping, d.data);
          });
        });
      }
    }
    // Manage form status, add/edit
    if (status === "add") {
      technologyData.update((e) => {
        e.data = {};
      });
    }
  }, [loading, formSchema, status, id]);

  useEffect(() => {
    setFormSchema({ schema: schema, loading: true });
  }, [highlight]);

  const handleOnSubmit = ({ formData }) => {
    let data = { ...formData };

    if (data?.relatedInfo?.email) {
      data.email = formData.relatedInfo.email;
    }
    if (data?.relatedInfo?.urls[0]?.url) {
      data.urls = formData.relatedInfo.urls.filter(
        (it) => it?.url && it.url.length > 0
      );
    }
    data?.relatedInfo && delete data.relatedInfo;

    data = handleGeoCoverageValue(data, formData, countries);
    data?.image === "" && delete data.image;
    data.tags = formData.tags && formData.tags.map((x) => parseInt(x));

    if (data?.yearFounded) {
      const yearFounded = new Date(formData.yearFounded);
      data.yearFounded = yearFounded.getFullYear();
    }
    if (status === "edit") {
      // ## TODO: need to submit to update endpoint
      return;
    }
    setSending(true);
    api
      .post("/technology", data)
      .then(() => {
        UIStore.update((e) => {
          e.formStep = {
            ...e.formStep,
            technology: 2,
          };
        });
        // scroll top
        window.scrollTo({ top: 0 });
        technologyData.update((e) => {
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
    // remove logo property when user remove logo from form
    formData?.logo === "" && delete formData.logo;
    // remove image property when user remove image from form
    formData?.image === "" && delete formData.image;
    technologyData.update((e) => {
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
    <div className="add-technology-form">
      {formStep.technology === 1 && (
        <Form
          idPrefix="technology"
          schema={formSchema.schema}
          uiSchema={uiSchema}
          formData={technologyData.currentState.data}
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
      {formStep.technology === 2 && (
        <div>
          <h3>Thank you for adding the Technology</h3>
          <p>we'll let you know once an admin has approved it</p>
        </div>
      )}
    </div>
  );
};

export default AddTechnologyForm;
