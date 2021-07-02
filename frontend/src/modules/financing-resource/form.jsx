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

const getSchema = (
  { countries, organisations, tags, currencies, regionOptions, meaOptions },
  loading
) => {
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
  prop.tags.enum = tags.financingMechanism?.map((x) => String(x.id));
  prop.tags.enumNames = tags.financingMechanism?.map((x) => x.tag);
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
    key: "title",
    name: "title",
    group: null,
    type: "string",
  },
  {
    key: "organisations",
    name: "org",
    group: null,
    type: "integer",
  },
  {
    key: "publishYear",
    name: "publishYear",
    group: null,
    type: "year",
  },
  {
    key: "value",
    name: "valueAmount",
    group: "value",
    type: "integer",
  },
  {
    key: "valueCurrency",
    name: "valueCurrency",
    group: "value",
    type: "string",
  },
  {
    key: "valueRemarks",
    name: "valueRemarks",
    group: "value",
    type: "string",
  },
  {
    key: "validFrom",
    name: "validFrom",
    group: "date",
    type: "date",
  },
  {
    key: "validTo",
    name: "validTo",
    group: "date",
    type: "date",
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
    key: "summary",
    name: "summary",
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
    key: "languages",
    name: "urls",
    group: null,
    type: "array",
  },
];

export const resourceData = new Store({ data: {}, editId: null });

const AddResourceForm = withRouter(
  ({
    btnSubmit,
    sending,
    setSending,
    highlight,
    setHighlight,
    setDisabledBtn,
    history,
  }) => {
    const {
      countries,
      organisations,
      tags,
      currencies,
      loading,
      formStep,
      formEdit,
    } = UIStore.currentState;

    const formData = resourceData.useState();
    const { editId, data } = formData;
    const { status, id } = formEdit.financingResource;
    const [dependValue, setDependValue] = useState([]);
    const [formSchema, setFormSchema] = useState({
      schema: schema,
      loading: true,
    });

    useEffect(() => {
      if (formSchema.loading && !loading) {
        setFormSchema(getSchema(UIStore.currentState, false));
        // Manage form status, add/edit
        if (
          status === "edit" &&
          (Object.values(data).length === 0 || editId !== id)
        ) {
          api.get(`/detail/financing_resource/${id}`).then((d) => {
            resourceData.update((e) => {
              e.data = revertFormData(formDataMapping, d.data);
              e.editId = id;
            });
          });
        }
      }
      // Manage form status, add/edit
      if (status === "add" && editId !== null) {
        resourceData.update((e) => {
          e.data = {};
          e.editId = null;
        });
      }
    }, [loading, formSchema, status, id, data, editId]);

    useEffect(() => {
      setFormSchema({ schema: schema, loading: true });
    }, [highlight]);

    const handleOnSubmit = ({ formData }) => {
      let data = { ...formData, resourceType: "Financing Resource" };

      data?.newOrg && delete data.newOrg;
      data.org = { id: formData.org };
      if (formData.org === -1) {
        data.org = {
          ...formData.newOrg,
          id: formData.org,
        };
        data.org = handleGeoCoverageValue(data.org, formData.newOrg, countries);
      }

      delete data.value;
      data.value = formData.value.valueAmount;
      data.valueCurrency = formData.value.valueCurrency;
      if (formData?.value?.valueRemark) {
        data.valueRemarks = formData.value.valueRemark;
      }

      delete data.date;
      data.validFrom = formData.date.validFrom;
      data.validTo = formData?.date?.validTo || "Ongoing";

      if (data?.urls[0]?.url) {
        data.urls = formData.urls.filter((it) => it?.url && it.url.length > 0);
      }
      if (!data?.urls[0]?.url) {
        delete data.urls;
      }

      data = handleGeoCoverageValue(data, formData, countries);
      if (status === "add") {
        data?.image && data?.image === "" && delete data.image;
      }
      if (status === "edit") {
        data?.image &&
          data?.image.match(customFormats.url) &&
          delete data.image;
      }
      data.tags = formData.tags && formData.tags.map((x) => parseInt(x));

      if (data?.publishYear) {
        const publishYear = new Date(formData.publishYear);
        data.publishYear = publishYear.getFullYear();
      }

      setSending(true);
      if (status === "add") {
        api
          .post("/resource", data)
          .then(() => {
            UIStore.update((e) => {
              e.formStep = {
                ...e.formStep,
                financingResource: 2,
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
      }
      if (status === "edit") {
        api
          .put(`/detail/financing_resource/${id}`, data)
          .then(() => {
            notification.success({ message: "Update success" });
            UIStore.update((e) => {
              e.formEdit = {
                ...e.formEdit,
                financingResource: {
                  status: "add",
                  id: null,
                },
              };
            });
            // scroll top
            window.scrollTo({ top: 0 });
            resourceData.update((e) => {
              e.data = {};
              e.editId = null;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            history.push(`/financing_resource/${id}`);
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
      // remove image property when user remove image from form
      if (status === "add") {
        formData?.image === "" && delete formData.image;
      }
      if (status === "edit" && (formData?.image || formData?.image === "")) {
        formData.image = formData?.image !== "" ? formData?.image : null;
      }
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
      let res = overideValidation(errors, dependValue);
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
      // overiding image validation when edit
      if (
        (res.length > 0 &&
          status === "edit" &&
          data?.image &&
          data?.image.match(customFormats.url)) ||
        !data.image
      ) {
        res = res.filter(
          (x) => x?.params && x.params?.format && x.params.format !== "data-url"
        );
      }

      res.length === 0 && setHighlight(false);
      return res;
    };

    return (
      <div className="add-resource-form">
        {formStep.financingResource === 1 && (
          <Form
            idPrefix="financing-resource_"
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
        {formStep.financingResource === 2 && (
          <div>
            <h3>Thank you for adding the resource</h3>
            <p>we'll let you know once an admin has approved it</p>
          </div>
        )}
      </div>
    );
  }
);

export default AddResourceForm;
