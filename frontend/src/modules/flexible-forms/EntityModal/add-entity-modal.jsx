import React, { useEffect, useState, useRef } from "react";
import { UIStore } from "../../../store";
import { Store } from "pullstate";
import { Modal, Button } from "antd";
import "./modal-style.scss";
import { withTheme } from "@rjsf/core";
import { Theme as AntDTheme } from "@rjsf/antd";
import { schema, uiSchema } from "./form-schema";
import ObjectFieldTemplate from "../../../utils/forms/object-template";
import ArrayFieldTemplate from "../../../utils/forms/array-template";
import FieldTemplate from "../../../utils/forms/field-template";
import widgets from "../../../utils/forms";
import {
  collectDependSchema,
  overideValidation,
  checkRequiredFieldFilledIn,
  handleGeoCoverageValue,
  customFormats,
} from "../../../utils/forms";
import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import api from "../../../utils/api";
import { notification } from "antd";

const Form = withTheme(AntDTheme);

const getSchema = (
  { countries, regionOptions, meaOptions, transnationalOptions },
  loading
) => {
  const prop = cloneDeep(schema.properties);
  prop.country.enum = countries?.map((x, i) => x.id);
  prop.country.enumNames = countries?.map((x, i) => x.name);

  prop.geoCoverageValueRegional.enum = regionOptions?.map((x) => String(x.id));
  prop.geoCoverageValueRegional.enumNames = regionOptions?.map((x) => x.name);
  prop.geoCoverageValueNational.enum = countries?.map((x, i) => x.id);
  prop.geoCoverageValueNational.enumNames = countries?.map((x, i) => x.name);
  prop.geoCoverageValueTransnational.enum = transnationalOptions?.map((x, i) =>
    String(x.id)
  );
  prop.geoCoverageValueTransnational.enumNames = transnationalOptions?.map(
    (x, i) => x.name
  );
  prop.geoCoverageCountries.enum = countries?.map((x) => String(x.id));
  prop.geoCoverageCountries.enumNames = countries?.map((x) => x.name);
  prop.geoCoverageValueGlobalSpesific.enum = meaOptions?.map((x) =>
    String(x.id)
  );
  prop.geoCoverageValueGlobalSpesific.enumNames = meaOptions?.map(
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

export const entityData = new Store({
  data: {},
  editId: null,
});

const ModalAddEntity = ({ visible, close }) => {
  const {
    countries,
    organisations,
    tags,
    regionOptions,
    meaOptions,
    transnationalOptions,
    formStep,
    formEdit,
  } = UIStore.useState((s) => ({
    countries: s.countries,
    organisations: s.organisations,
    tags: s.tags,
    regionOptions: s.regionOptions,
    meaOptions: s.meaOptions,
    transnationalOptions: s.transnationalOptions,
    formStep: s.formStep,
    formEdit: s.formEdit,
  }));

  const formData = entityData.useState();
  const { editId, data } = formData;
  const { status, id } = formEdit.entity;
  const [dependValue, setDependValue] = useState([]);
  const [formSchema, setFormSchema] = useState({
    schema: schema,
    loading: true,
  });
  const [disabledBtn, setDisabledBtn] = useState({
    disabled: true,
    type: "default",
  });
  const btnSubmit = useRef();

  const [sending, setSending] = useState(false);

  useEffect(() => {
    const isLoaded = () =>
      Boolean(
        !isEmpty(countries) &&
          !isEmpty(organisations) &&
          !isEmpty(tags) &&
          !isEmpty(regionOptions) &&
          !isEmpty(meaOptions) &&
          !isEmpty(transnationalOptions)
      );
    if (formSchema.loading && isLoaded) {
      setFormSchema(
        getSchema(
          {
            countries,
            organisations,
            tags,
            regionOptions,
            meaOptions,
            transnationalOptions,
          },
          false
        )
      );
    }
  }, [
    formSchema,
    countries,
    organisations,
    tags,
    regionOptions,
    meaOptions,
    transnationalOptions,
  ]);

  const handleOnClickBtnSubmit = (e) => {
    btnSubmit.current.click();
  };

  const handleOnSubmit = ({ formData }) => {
    let data = { ...formData };
    data = handleGeoCoverageValue(data, formData, countries);

    if (data.geoCoverageType === "transnational") {
      data.geoCoverageCountryGroups = data.geoCoverageValue;
      data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
        parseInt(x)
      );
    }

    if (data.geoCoverageType === "national") {
      data.geoCoverageCountries = data.geoCoverageValue;
    }

    delete data.geoCoverageValue;

    setSending(true);
    api
      .post("//api/organisation", data)
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
  };

  const handleFormOnChange = ({ formData }) => {
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
    return res;
  };

  return (
    <Modal
      width={600}
      visible={visible}
      title="Create New Entity"
      footer={
        <div>
          <Button className="close-button" onClick={(e) => close()}>
            Close
          </Button>
          <Button
            className="custom-button"
            onClick={(e) => handleOnClickBtnSubmit(e)}
            loading={sending}
            disabled={disabledBtn.disabled}
          >
            Submit
          </Button>
        </div>
      }
      closable={false}
    >
      <div className="add-entity-modal">
        <Form
          idPrefix="action-plan"
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
      </div>
    </Modal>
  );
};

export default ModalAddEntity;
