import { UIStore } from "../../store";
import { Store } from "pullstate";
import { notification } from "antd";
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
  prop.implementingMea.enum = meaOptions?.map((x) => x.id);
  prop.implementingMea.enumNames = meaOptions?.map((x) => x.name);
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

const formDataMapping = [
  {
    key: "title",
    name: "title",
    group: null,
    type: "string",
  },
  {
    key: "originalTitle",
    name: "originalTitle",
    group: null,
    type: "string",
  },
  {
    key: "dataSource",
    name: "dataSource",
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
    key: "typeOfLaw",
    name: "typeOfLaw",
    group: null,
    type: "string",
  },
  {
    key: "recordNumber",
    name: "recordNumber",
    group: null,
    type: "string",
  },
  {
    key: "firstPublicationDate",
    name: "firstPublicationDate",
    group: "date",
    type: "date",
  },
  {
    key: "latestAmendmentDate",
    name: "latestAmendmentDate",
    group: "date",
    type: "date",
  },
  {
    key: "status",
    name: "status",
    group: null,
    type: "string",
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
    key: "abstract",
    name: "abstract",
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
    key: "implementingMea",
    name: "implementingMea",
    group: null,
    type: "integer",
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

export const policyData = new Store({ data: {}, editId: null });

const AddPolicyForm = withRouter(
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
      organisations,
      tags,
      loading,
      formStep,
      formEdit,
    } = UIStore.currentState;

    const formData = policyData.useState();
    const { editId, data } = formData;
    const { status, id } = formEdit.policy;
    const [dependValue, setDependValue] = useState([]);
    const [formSchema, setFormSchema] = useState({
      schema: schema,
      loading: true,
    });

    useEffect(() => {
      const dataId = Number(params?.id || id);
      if (formSchema.loading && !loading) {
        setFormSchema(getSchema(UIStore.currentState, false));
        // Manage form status, add/edit
        if (
          (status === "edit" || dataId) &&
          (Object.values(data).length === 0 || editId !== dataId)
        ) {
          api.get(`/detail/policy/${dataId}`).then((d) => {
            policyData.update((e) => {
              e.data = revertFormData(
                formDataMapping,
                d.data,
                UIStore.currentState
              );
              e.editId = dataId;
            });
          });
        }
      }
      // Manage form status, add/edit
      if (status === "add" && !dataId && editId !== null) {
        policyData.update((e) => {
          e.data = {};
          e.editId = null;
        });
      }
    }, [loading, formSchema, status, id, data, editId, params]);

    useEffect(() => {
      setFormSchema({ schema: schema, loading: true });
    }, [highlight]);

    const handleOnSubmit = ({ formData }) => {
      let data = { ...formData };

      delete data.date;
      data.firstPublicationDate = formData.date.firstPublicationDate;
      data.latestAmendmentDate =
        formData?.date?.latestAmendmentDate || "Ongoing";

      if (data?.urls[0]?.url) {
        data.urls = formData.urls.filter((it) => it?.url && it.url.length > 0);
      }
      if (!data?.urls[0]?.url) {
        delete data.urls;
      }

      data = handleGeoCoverageValue(data, formData, countries);
      if (status === "add" && !params?.id) {
        data?.image && data?.image === "" && delete data.image;
      }
      if (status === "edit" || params?.id) {
        data?.image &&
          data?.image.match(customFormats.url) &&
          delete data.image;
      }
      data.tags = formData.tags && formData.tags.map((x) => parseInt(x));

      setSending(true);
      if (status === "add" && !params?.id) {
        api
          .post("/policy", data)
          .then(() => {
            UIStore.update((e) => {
              e.formStep = {
                ...e.formStep,
                policy: 2,
              };
            });
            // scroll top
            window.scrollTo({ top: 0 });
            policyData.update((e) => {
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
          .put(`/detail/policy/${id || params?.id}`, data)
          .then(() => {
            notification.success({ message: "Update success" });
            UIStore.update((e) => {
              e.formEdit = {
                ...e.formEdit,
                policy: {
                  status: "add",
                  id: null,
                },
              };
            });
            // scroll top
            window.scrollTo({ top: 0 });
            policyData.update((e) => {
              e.data = {};
              e.editId = null;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            history.push(`/policy/${id || params?.id}`);
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
      if (status === "add" && !params?.id) {
        formData?.image === "" && delete formData.image;
      }
      if (
        (status === "edit" || params?.id) &&
        (formData?.image || formData?.image === "")
      ) {
        formData.image = formData?.image !== "" ? formData?.image : null;
      }
      policyData.update((e) => {
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
      // publication and amandment date validation
      const { firstPublicationDate, latestAmendmentDate } = data?.date;
      if (firstPublicationDate && latestAmendmentDate) {
        if (new Date(firstPublicationDate) > new Date(latestAmendmentDate)) {
          res.push({
            message:
              "First publication date must be date before last amandment date",
            name: "required",
            params: { missingProperty: "firstPublicationDate" },
            property: ".date.firstPublicationDate",
            schemaPath: "#/properties/date/required",
            stack: ".date.firstPublicationDate is a required property",
          });
        }
      }
      // overiding image validation when edit
      if (
        (res.length > 0 &&
          (status === "edit" || params?.id) &&
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
      <div className="add-policy-form">
        {formStep.policy === 1 && (
          <Form
            idPrefix="policy"
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
        {formStep.policy === 2 && (
          <div>
            <h3>Thank you for adding the Policy</h3>
            <p>we'll let you know once an admin has approved it</p>
          </div>
        )}
      </div>
    );
  }
);

export default AddPolicyForm;
