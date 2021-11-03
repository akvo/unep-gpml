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
import isEmpty from "lodash/isEmpty";
import { withRouter } from "react-router-dom";

const Form = withTheme(AntDTheme);

const getSchema = (
  { countries, tags, transnationalOptions, representativeGroup },
  loading
) => {
  const representative = representativeGroup?.map((x) => x.name);

  const prop = cloneDeep(schema.properties);
  prop.representativeGroup.enum = [...representative, -1];
  prop.representativeGroup.enumNames = [...representative, "Other"];

  prop.representativeGroupGovernment.enum = representativeGroup.find(
    (x) => x.code === "government"
  )?.childs;

  prop.representativeGroupPrivateSector.enum = tags?.sector?.map((it) =>
    String(it.id)
  );
  prop.representativeGroupPrivateSector.enumNames = tags?.sector?.map(
    (it) => it.tag
  );

  prop.representativeGroupAcademiaResearch.enum = representativeGroup.find(
    (x) => x.code === "academia-research"
  )?.childs;

  prop.representativeGroupCivilSociety.enum = representativeGroup.find(
    (x) => x.code === "civil-society"
  )?.childs;

  prop.expertise.enum = tags?.offering?.map((it) => String(it.id));
  prop.expertise.enumNames = tags?.offering?.map((it) => it.tag);

  prop.headquarter.enum = countries?.map((x) => x.id);
  prop.headquarter.enumNames = countries?.map((x) => x.name);

  prop.geoCoverageValueNational.enum = countries?.map((x) => String(x.id));
  prop.geoCoverageValueNational.enumNames = countries?.map((x) => x.name);

  prop.geoCoverageValueTransnational.enum = transnationalOptions?.map(
    (x) => x.id
  );
  prop.geoCoverageValueTransnational.enumNames = transnationalOptions?.map(
    (x) => x.name
  );

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
    key: "type", // be property
    name: "representativeGroup", // match to static formSchema
    group: null,
    type: "string",
  },
  {
    key: "program",
    name: "program",
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
    key: "expertise",
    name: "expertise",
    group: null,
    type: "array",
  },
  {
    key: "country",
    name: "headquarter",
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
];

export const entityData = new Store({ data: {}, editId: null });

const EntityForm = withRouter(
  ({
    btnSubmit,
    sending,
    setSending,
    highlight,
    setHighlight,
    setDisabledBtn,
    isLoaded,
    history,
    match: { params },
  }) => {
    const {
      countries,
      tags,
      transnationalOptions,
      formStep,
      formEdit,
      profile,
      representativeGroup,
    } = UIStore.useState((s) => ({
      countries: s.countries,
      tags: s.tags,
      regionOptions: s.regionOptions,
      meaOptions: s.meaOptions,
      transnationalOptions: s.transnationalOptions,
      formStep: s.formStep,
      formEdit: s.formEdit,
      profile: s.profile,
      representativeGroup: s.representativeGroup,
    }));
    const formData = entityData.useState();
    const { editId, data } = formData;
    const { status, id } = formEdit.entity;
    const [dependValue, setDependValue] = useState([]);
    const [formSchema, setFormSchema] = useState({
      schema: schema,
      loading: true,
    });

    useEffect(() => {
      const dataId = Number(params?.id || id);
      if (formSchema.loading && isLoaded) {
        setFormSchema(
          getSchema(
            {
              countries,
              tags,
              transnationalOptions,
              representativeGroup,
            },
            false
          )
        );
        // Manage form status, add/edit
        if (
          !isEmpty(profile) &&
          (status === "edit" || dataId) &&
          (editId !== dataId || Object.keys(data).includes("title") === 0)
        ) {
          api.get(`/organisation/${dataId}`).then((d) => {
            entityData.update((e) => {
              e.data = revertFormData(formDataMapping, d.data, {
                countries,
                tags,
                transnationalOptions,
              });
              e.editId = dataId;
            });
          });
        }
      }
      // Manage form status, add/edit
      if (status === "add" && !dataId && editId !== null) {
        entityData.update((e) => {
          e.data = {};
          e.editId = null;
        });
      }
    }, [
      profile,
      formSchema,
      status,
      id,
      data,
      editId,
      params,
      isLoaded,
      countries,
      tags,
      transnationalOptions,
      representativeGroup,
    ]);

    useEffect(() => {
      setFormSchema({ schema: schema, loading: true });
    }, [highlight]);

    const handleOnSubmit = ({ formData }) => {
      let data = { ...formData };

      data = handleGeoCoverageValue(data, formData, countries);
      if (status === "add" && !params?.id) {
        data?.logo && data?.logo === "" && delete data.logo;
      }
      if (status === "edit" || params?.id) {
        data?.logo && data?.logo.match(customFormats.url) && delete data.logo;
      }
      data.expertise =
        formData?.expertise && formData.expertise.map((x) => parseInt(x));

      data.country = formData.headquarter;
      delete data.headquarter;

      // handle representative group
      data.type = formData.representativeGroup;
      delete data.representativeGroup;

      setSending(true);
      if (status === "add" && !params?.id) {
        api
          .post("/organisation", data)
          .then(() => {
            UIStore.update((e) => {
              e.formStep = {
                ...e.formStep,
                entity: 2,
              };
            });
            // scroll top
            window.scrollTo({ top: 0 });
            entityData.update((e) => {
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
          .put(`/detail/organisation/${id || params?.id}`, data)
          .then(() => {
            notification.success({ message: "Update success" });
            UIStore.update((e) => {
              e.formEdit = {
                ...e.formEdit,
                entity: {
                  status: "add",
                  id: null,
                },
              };
            });
            // scroll top
            window.scrollTo({ top: 0 });
            entityData.update((e) => {
              e.data = {};
              e.editId = null;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            history.push(`/organisation/${id || params?.id}`);
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
      entityData.update((e) => {
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
        (res.length > 0 &&
          (status === "edit" || params?.id) &&
          data?.logo &&
          data?.logo.match(customFormats.url)) ||
        !data.logo
      ) {
        res = res.filter(
          (x) => x?.params && x.params?.format && x.params.format !== "data-url"
        );
      }
      res.length === 0 && setHighlight(false);
      return res;
    };

    return (
      <div className="add-entity-form">
        {formStep.entity === 1 && (
          <Form
            idPrefix="entity"
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
        {formStep.entity === 2 && (
          <div>
            <h3>Thank you for adding the Entity</h3>
            <p>we'll let you know once an admin has approved it</p>
          </div>
        )}
      </div>
    );
  }
);

export default EntityForm;
