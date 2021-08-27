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
import { withRouter } from "react-router-dom";

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
  const tagsPlusTopics = tags.technology?.concat(tags.topics);
  prop.tags.enum = tagsPlusTopics?.map((x) => String(x.id));
  prop.tags.enumNames = tagsPlusTopics?.map((x) => x.tag);
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
    type: "year",
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

export const technologyData = new Store({ data: {}, editId: null });

const AddTechnologyForm = withRouter(
  ({
    btnSubmit,
    sending,
    setSending,
    highlight,
    setHighlight,
    setDisabledBtn,
    history,
    match: { params },
  }) => {
    const {
      countries,
      isDataFetched,
      formStep,
      formEdit,
    } = UIStore.currentState;

    const formData = technologyData.useState();
    const { data, editId } = formData;
    const { status, id } = formEdit.technology;
    const [dependValue, setDependValue] = useState([]);
    const [formSchema, setFormSchema] = useState({
      schema: schema,
      loading: true,
    });

    useEffect(() => {
      const dataId = Number(params?.id || id);
      if (formSchema.loading && isDataFetched) {
        setFormSchema(getSchema(UIStore.currentState, false));
        // Manage form status, add/edit
        if (
          (status === "edit" || dataId) &&
          (editId !== dataId || !Object.keys(data).includes("name"))
        ) {
          api;
          api.get(`/detail/technology/${dataId}`).then((d) => {
            technologyData.update((e) => {
              e.data = revertFormData(formDataMapping, d.data);
              e.editId = dataId;
            });
          });
        }
      }
      // Manage form status, add/edit
      if (status === "add" && !dataId && editId !== null) {
        technologyData.update((e) => {
          e.data = {};
        });
      }
    }, [isDataFetched, formSchema, status, id, data, editId, params]);

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
      if (status === "add" && !params?.id) {
        data?.image && data?.image === "" && delete data.image;
        data?.logo && data?.logo === "" && delete data.logo;
      }
      if (status === "edit" || params?.id) {
        data?.image &&
          data?.image.match(customFormats.url) &&
          delete data.image;
        data?.logo && data?.logo.match(customFormats.url) && delete data.logo;
      }
      data.tags = formData.tags && formData.tags.map((x) => parseInt(x));

      if (data?.yearFounded) {
        const yearFounded = new Date(formData.yearFounded);
        data.yearFounded = yearFounded.getFullYear();
      }

      setSending(true);
      if (status === "add" && !params?.id) {
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
      }
      if (status === "edit" || params?.id) {
        api
          .put(`/detail/technology/${id || params?.id}`, data)
          .then(() => {
            notification.success({ message: "Update success" });
            UIStore.update((e) => {
              e.formEdit = {
                ...e.formEdit,
                technology: {
                  status: "add",
                  id: null,
                },
              };
            });
            // scroll top
            window.scrollTo({ top: 0 });
            technologyData.update((e) => {
              e.data = {};
              e.editId = null;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            history.push(`/technology/${id || params?.id}`);
          })
          .catch(() => {
            notification.error({ message: "An error occured" });
          })
          .finally(() => {
            setSending(false);
          });
      }
    };

    const handleFormOnChange = ({ formData }) => {
      // remove logo & image property when user remove logo from form
      if (status === "add" && !params?.id) {
        formData?.image === "" && delete formData.image;
        formData?.logo === "" && delete formData.logo;
      }
      if (
        (status === "edit" || params?.id) &&
        (formData?.image || formData?.image === "")
      ) {
        formData.image = formData?.image !== "" ? formData?.image : null;
      }
      if (
        (status === "edit" || params?.id) &&
        (formData?.logo || formData?.logo === "")
      ) {
        formData.logo = formData?.logo !== "" ? formData?.logo : null;
      }
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
      let res = overideValidation(errors, dependValue);
      // overiding image validation when edit
      if (
        res.length > 0 &&
        (status === "edit" || params?.id) &&
        ((data?.image && data?.image.match(customFormats.url)) ||
          !data.image ||
          (data?.logo && data?.logo.match(customFormats.url)) ||
          !data.logo)
      ) {
        res = res.filter(
          (x) => x?.params && x.params?.format && x.params.format !== "data-url"
        );
      }
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
            formData={data}
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
  }
);

export default AddTechnologyForm;
