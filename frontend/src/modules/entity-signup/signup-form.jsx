import { UIStore } from "../../store";
import React, { useState, useEffect, useContext } from "react";
import { Form, Switch, Select } from "antd";
import { Form as FinalForm, FormSpy, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import "./styles.scss";
import Checkbox from "antd/lib/checkbox/Checkbox";
import {
  LinkedinOutlined,
  TwitterOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { FieldsFromSchema } from "../../utils/form-utils";
import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import { storage } from "../../utils/storage";
import GeoCoverageInput from "../stakeholder-signup/comp/geo-coverage-input";
import { useRef } from "react";
import api from "../../utils/api";

api.get("/stakeholder").then((resp) => {
  UIStore.update((e) => {
    e.stakeholders = resp.data;
  });
});

const { sectorOptions } = UIStore.currentState;
const defaultFormSchema = {
  entityDetails: {
    account: {
      name: {
        label: "Name",
        required: true,
      },
      url: {
        label: "Url",
        order: 2,
        required: true,
      },
    },
    socialLocation: {
      country: {
        label: "Country",
        required: true,
        order: 3,
        control: "select",
        showSearch: true,
        options: [],
        autoComplete: "on",
      },
    },
    contactDetails: {
      stakeholder: {
        label: "stakeholder email",
        required: true,
        control: "autocomplete",
        showSearch: true,
        onSearch: null,
        onChange: null,
        onSelect: null,
        options: [],
      },
    },
    geoCoverage: {
      geoCoverageValue: {
        label: "Geo coverage",
        render: GeoCoverageInput,
      },
    },
  },
};

const ReviewText = ({ reviewStatus }) => {
  if (reviewStatus === "SUBMITTED") {
    return <div className="review-status">WAITING FOR APPROVAL</div>;
  }
  const reviewIcon =
    reviewStatus === "APPROVED" ? (
      <CheckCircleOutlined />
    ) : (
      <ExclamationCircleOutlined />
    );
  if (
    storage.getCookie("profileMessage") === "0" &&
    reviewStatus === "APPROVED"
  ) {
    return "";
  }
  return (
    <div className={`review-status ${reviewStatus.toLowerCase()}`}>
      {reviewIcon} SUBMISSION IS {reviewStatus}
    </div>
  );
};

const SignupForm = ({
  onSubmit,
  handleFormRef,
  initialValues,
  handleSubmitRef,
  isModal,
}) => {
  const {
    countries,
    stakeholders,
    tags,
    profile,
    organisations,
    organisationType,
    geoCoverageTypeOptions,
  } = UIStore.currentState;
  const [geoType, setGeoType] = useState({ value: null, error: false });
  const [stakeholder, setStakeholder] = useState({ value: "", error: false });
  const prevVals = useRef();
  const formRef = useRef();
  const formSchemaRef = useRef(defaultFormSchema);
  const formContainer = !isModal
    ? "entity-signup-form-grid"
    : "entity-signup-form";
  const sectionGrid = !isModal ? "section-grid" : "section";

  const newSchema = cloneDeep(defaultFormSchema);

  newSchema["entityDetails"]["geoCoverage"].geoCoverageValue = {
    ...newSchema["entityDetails"]["geoCoverage"].geoCoverageValue,
    countries: countries,
  };
  newSchema["entityDetails"]["socialLocation"].country.options = countries.map(
    (x) => ({
      value: x.id,
      label: x.name,
    })
  );
  newSchema["entityDetails"][
    "contactDetails"
  ].stakeholder.options = stakeholders.map((x) => ({
    value: x.email,
    label: x.email,
  }));

  const handleSearchStakeholder = (searchText) => {
    console.log("searching....", searchText);
    const newSchema = cloneDeep(formSchema);
    newSchema["entityDetails"][
      "contactDetails"
    ].stakeholder.options = stakeholders
      .map((x) => ({
        value: x.email,
        label: x.email,
      }))
      .filter((x) => String(x.label).includes(searchText));
    setFormSchema(newSchema);
  };

  const handleSelectStakeholder = (selectedText, setError = true) => {
    console.log("selecting....", selectedText);
    // todo: double check is an email
    setStakeholder({
      selectedText,
      error: setError ? !selectedText : setError,
    });
    return selectedText;
  };

  newSchema["entityDetails"][
    "contactDetails"
  ].stakeholder.onSearch = handleSearchStakeholder;
  newSchema["entityDetails"][
    "contactDetails"
  ].stakeholder.onChange = handleSelectStakeholder;

  const [formSchema, setFormSchema] = useState(newSchema);

  useEffect(() => {
    formSchemaRef.current = formSchema;
  }, [formSchema]);

  const handleChangeGeoType = (value, setError = true) => {
    setGeoType({ value, error: setError ? !value : setError });
    const newSchema = cloneDeep(formSchema);
    Object.keys(newSchema["entityDetails"]["geoCoverage"]).forEach((key) => {
      newSchema["entityDetails"]["geoCoverage"][key].required =
        value !== "global";
    });
    setFormSchema(newSchema);
    setTimeout(() => {
      formRef.current?.change("ts", new Date().getTime());
      formRef.current?.change("geoCoverageType", value);
      // set geoCoverageValue to null when geoCoverageType change
      initialValues?.geoCoverageType !== value &&
        initialValues?.geoCoverageValue &&
        formRef.current?.change("geoCoverageValue", null);
    });
  };

  useEffect(() => {
    if (initialValues) {
      handleChangeGeoType(initialValues?.geoCoverageType, false);
    }
  }, [initialValues]); // eslint-disable-line

  return (
    <Form layout="vertical">
      <FinalForm
        initialValues={initialValues || {}}
        subscription={{}}
        mutators={{ ...arrayMutators }}
        onSubmit={onSubmit}
        render={({ handleSubmit, form, ...props }) => {
          if (handleSubmitRef) {
            handleSubmitRef(handleSubmit);
          }
          if (handleFormRef) {
            handleFormRef(form);
          }
          formRef.current = form;
          return (
            <>
              {initialValues?.reviewStatus && <ReviewText {...initialValues} />}
              <div className={formContainer}>
                <div className={sectionGrid}>
                  <h2>Entity details</h2>
                  <FieldsFromSchema
                    schema={formSchema["entityDetails"]["account"]}
                  />
                  <FieldsFromSchema
                    schema={formSchema["entityDetails"]["socialLocation"]}
                  />
                  <Field
                    name="geoCoverageType"
                    options={geoCoverageTypeOptions}
                    component={(props) => {
                      return (
                        <Form.Item
                          label="Geo coverage type"
                          name={props.input.name}
                          validateStatus={
                            props.meta.error && props.meta.touched
                              ? "error"
                              : ""
                          }
                          help={
                            props.meta.error &&
                            props.meta.touched &&
                            props.meta.error
                          }
                        >
                          <Select
                            onChange={(val) => handleChangeGeoType(val)}
                            defaultValue={props.input.value}
                          >
                            {props.options.map((it) => (
                              <Select.Option
                                key={it.toLocaleLowerCase()}
                                value={it.toLocaleLowerCase()}
                              >
                                {it}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      );
                    }}
                    validate={(value) => {
                      if (!value) {
                        return "Required";
                      } else {
                        return undefined;
                      }
                    }}
                  />
                  <FieldsFromSchema
                    schema={formSchema["entityDetails"]["geoCoverage"]}
                  />
                </div>
                <div className={sectionGrid}>
                  <h2>First Contact details</h2>
                  <div>
                    <h5>
                      {profile.title} {profile.firstName} {profile.lastName}
                    </h5>
                    <h5>{profile.email}</h5>
                  </div>
                </div>
                <div className={sectionGrid}>
                  <h2>Second Contact details</h2>
                  <FieldsFromSchema
                    schema={formSchema["entityDetails"]["contactDetails"]}
                  />
                </div>
              </div>
            </>
          );
        }}
      />
    </Form>
  );
};

export default SignupForm;
