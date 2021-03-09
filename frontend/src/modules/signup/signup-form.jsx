import React, { useState, useEffect } from "react";
import { Form, Switch } from "antd";
import { Form as FinalForm, FormSpy } from "react-final-form";
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
import api from "../../utils/api";
import { storage } from "../../utils/storage";
import GeoCoverageInput from "./comp/geo-coverage-input";
import { useRef } from "react";

const geoCoverageTypeOptions = [
  "Global",
  "Regional",
  "National",
  "Sub-national",
  "Transnational",
  "Global with elements in specific areas",
];

const sectorOptions = [
  "Governments",
  "Private Sector",
  "NGOs and MGS",
  "Academia and Scientific Community",
  "IGOs and multi - lateral processes",
  "Other",
];

const defaultFormSchema = {
  personalDetails: {
    account: {
      title: {
        label: "Title",
        required: true,
        control: "select",
        options: ["Mr", "Mrs", "Ms", "Dr", "Prof"].map((it) => ({
          value: it,
          label: it,
        })),
      },
      firstName: { label: "First name", required: true },
      lastName: { label: "Last name", required: true },
      email: {
        label: "Email",
        disabled: true,
        required: true,
      },
    },
    socialLocation: {
      linkedIn: { label: "LinkedIn", prefix: <LinkedinOutlined /> },
      twitter: { label: "Twitter", prefix: <TwitterOutlined /> },
      photo: {
        label: "Photo",
        control: "file",
        maxFileSize: 1,
        accept: "image/*",
      },
      representation: {
        label: "Representative sector",
        required: true,
        control: "select",
        options: sectorOptions.map((it) => ({ value: it, label: it })),
      },
      country: {
        label: "Country",
        order: 3,
        control: "select",
        showSearch: true,
        options: [],
        autoComplete: "on",
      },
      geoCoverageType: {
        label: "Geo coverage type",
        control: "select",
        options: geoCoverageTypeOptions.map((it) => ({
          value: it.toLowerCase(),
          label: it,
        })),
      },
      geoCoverageValue: { label: "Geo coverage", render: GeoCoverageInput },
    },
  },
  organisation: {
    "org.id": {
      label: "Organisation",
      control: "select",
      showSearch: true,
      options: [],
      placeholder: "Start typing...",
      order: 0,
      required: true,
    },
    organisationRole: {
      label: "Your role in the organisation",
      order: 2,
      required: true,
    },
  },
  expertiesActivities: {
    seeking: {
      label: "Seeking",
      control: "select",
      mode: "multiple",
      showSearch: true,
      options: [],
    },
    offering: {
      label: "Offering",
      control: "select",
      mode: "multiple",
      showSearch: true,
      options: [],
    },
    about: {
      label: "About yourself",
      control: "textarea",
      placeholder: "Max 150 words",
    },
    tags: {
      label: "Tags",
      control: "select",
      options: [],
      mode: "multiple",
      showSearch: true,
    },
    cv: {
      label: "CV / Portfolio",
      control: "file",
      maxFileSize: 5,
      accept:
        ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain",
    },
  },
};

const ReviewText = ({ reviewStatus }) => {
  if (reviewStatus === "SUBMITTED")
    return <div className="review-status">WAITING FOR APPROVAL</div>;
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
  tags,
  countries,
  isModal,
}) => {
  const [formSchema, setFormSchema] = useState(defaultFormSchema);
  const [noOrg, setNoOrg] = useState(false);
  const [pubEmail, setPubEmail] = useState({
    checked: false,
    text: "Show my email address on public listing",
  });
  const prevVals = useRef();
  const formRef = useRef();
  const formSchemaRef = useRef(defaultFormSchema);
  const formContainer = !isModal ? "signup-form-grid" : "signup-form";
  const sectionGrid = !isModal ? "section-grid" : "section";

  useEffect(() => {
    formSchemaRef.current = formSchema;
  }, [formSchema]);

  useEffect(() => {
    api.get("/organisation").then((d) => {
      const newSchema = cloneDeep(formSchemaRef.current);
      newSchema["organisation"]["org.id"].options = [
        ...d.data.map((it) => ({ value: it.id, label: it.name })),
        { value: -1, label: "Other" },
      ];
      newSchema["organisation"]["org.id"].filterOption = (input, option) => {
        return (
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
          option.value === -1
        );
      };
      if (tags) {
        newSchema["expertiesActivities"].tags.options = tags.general.map(
          (x) => ({
            value: x.id,
            label: x.tag,
          })
        );
        newSchema["expertiesActivities"].offering.options = tags.offering.map(
          (x) => ({
            value: x.id,
            label: x.tag,
          })
        );
        newSchema["expertiesActivities"].seeking.options = tags.seeking.map(
          (x) => ({
            value: x.id,
            label: x.tag,
          })
        );
      }
      if (countries) {
        newSchema["personalDetails"][
          "socialLocation"
        ].country.options = countries.map((x) => ({
          value: x.isoCode,
          label: x.name,
        }));
        newSchema["personalDetails"]["socialLocation"].geoCoverageValue = {
          ...newSchema["personalDetails"]["socialLocation"].geoCoverageValue,
          countries: countries,
        };
      }
      setFormSchema(newSchema);
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (countries) {
      const newSchema = cloneDeep(formSchema);
      newSchema["personalDetails"][
        "socialLocation"
      ].country.options = countries.map((x) => ({
        value: x.isoCode,
        label: x.name,
      }));
      newSchema["personalDetails"]["socialLocation"].geoCoverageValue = {
        ...newSchema["personalDetails"]["socialLocation"].geoCoverageValue,
        countries: countries,
      };
      setFormSchema(newSchema);
    }
  }, [countries]); // eslint-disable-line

  useEffect(() => {
    if (tags) {
      const newSchema = cloneDeep(formSchema);
      newSchema["expertiesActivities"].tags.options = tags.general.map((x) => ({
        value: x.id,
        label: x.tag,
      }));
      newSchema["expertiesActivities"].offering.options = tags.offering.map(
        (x) => ({
          value: x.id,
          label: x.tag,
        })
      );
      newSchema["expertiesActivities"].seeking.options = tags.seeking.map(
        (x) => ({
          value: x.id,
          label: x.tag,
        })
      );
      setFormSchema(newSchema);
    }
  }, [tags]); // eslint-disable-line

  const handleChangePrivateCitizen = ({ target: { checked } }) => {
    setNoOrg(checked);
    const newSchema = cloneDeep(formSchema);
    Object.keys(newSchema["organisation"]).forEach((key) => {
      newSchema["organisation"][key].disabled = checked;
      newSchema["organisation"][key].required = !checked;
    });
    setFormSchema(newSchema);
    setTimeout(() => {
      formRef.current?.change("ts", new Date().getTime());
      if (checked) {
        formRef.current?.change("org.id", null);
      }
    });
  };

  const handleChangePublicEmail = (checked) => {
    const preffix = checked ? "Dont' show" : "Show";
    setPubEmail({
      checked: checked,
      text: `${preffix} my email address on public listing`,
    });
    setTimeout(() => {
      formRef.current?.change("ts", new Date().getTime());
      formRef.current?.change("publicEmail", checked);
    });
  };

  useEffect(() => {
    if (initialValues) {
      handleChangePublicEmail(initialValues.publicEmail);
    }
    if (initialValues && initialValues.org === null) {
      handleChangePrivateCitizen({ target: { checked: true } });
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
          if (handleSubmitRef) handleSubmitRef(handleSubmit);
          if (handleFormRef) handleFormRef(form);
          formRef.current = form;
          return (
            <>
              {initialValues?.reviewStatus && <ReviewText {...initialValues} />}
              <div className={formContainer}>
                <div className={sectionGrid}>
                  <h2>Personal details</h2>
                  <FieldsFromSchema
                    schema={formSchema["personalDetails"]["account"]}
                  />
                  <div className="public-email-container">
                    <Switch
                      key="publicEmail"
                      name="publicEmail"
                      size="small"
                      checked={pubEmail.checked}
                      onChange={handleChangePublicEmail}
                    />
                    &nbsp;&nbsp;&nbsp;{pubEmail.text}
                  </div>
                  <FieldsFromSchema
                    schema={formSchema["personalDetails"]["socialLocation"]}
                  />
                </div>
                <div className={sectionGrid}>
                  <h2>Organisation details</h2>
                  <Checkbox
                    className="org-check"
                    checked={noOrg}
                    onChange={handleChangePrivateCitizen}
                  >
                    I am a private citizen
                  </Checkbox>
                  <FieldsFromSchema schema={formSchema["organisation"]} />
                  <FormSpy
                    subscription={{ values: true }}
                    onChange={({ values }) => {
                      const newSchema = cloneDeep(formSchema);
                      let changedSchema = false;
                      if (
                        values?.org?.id === -1 &&
                        prevVals.current?.org?.id !== -1
                      ) {
                        // Add Name field
                        newSchema["organisation"]["org.name"] = {
                          label: "Name",
                          required: true,
                          order: 1,
                        };
                        newSchema["organisation"]["org.type"] = {
                          label: "Type of the organisation",
                          required: true,
                          control: "select",
                          options: [
                            "Government",
                            "Private Sector",
                            "Academia and Scientific Community",
                            "NGO and Major Groups and Stakeholders",
                            "IGO and Multilateral Process Actor",
                            "Other",
                          ].map((it) => ({ value: it, label: it })),
                        };
                        newSchema["organisation"]["org.country"] = {
                          label: "Country",
                          order: 3,
                          control: "select",
                          required: true,
                          showSearch: true,
                          options: countries.map((it) => ({
                            value: it.isoCode,
                            label: it.name,
                          })),
                          autoComplete: "off",
                        };
                        newSchema["organisation"]["org.url"] = {
                          label: "Organisation URL",
                          order: 4,
                          addonBefore: "https://",
                          required: true,
                        };
                        newSchema["organisation"]["org.geoCoverageType"] = {
                          label: "Geo coverage type",
                          order: 6,
                          required: true,
                          control: "select",
                          options: geoCoverageTypeOptions.map((it) => ({
                            value: it.toLowerCase(),
                            label: it,
                          })),
                        };
                        newSchema["organisation"]["org.geoCoverageValue"] = {
                          order: 7,
                          required: true,
                          label: "Geo coverage",
                          render: GeoCoverageInput,
                        };
                        if (values.org.geoCoverageType === "global")
                          newSchema["organisation"][
                            "org.geoCoverageValue"
                          ].required = false;
                        changedSchema = true;
                      }
                      if (
                        values?.org != null &&
                        values?.org?.id !== -1 &&
                        values.org.id != null &&
                        prevVals.current?.org?.id !== values?.org?.id
                      ) {
                        if (prevVals.current?.org?.id === -1) {
                          delete newSchema["organisation"].name;
                        }
                        Object.keys(newSchema["organisation"])
                          .filter(
                            (it) => it !== "org.id" && it !== "organisationRole"
                          )
                          .forEach((it) => {
                            newSchema["organisation"][it].required = false;
                          });
                        changedSchema = true;
                        [
                          "country",
                          "geoCoverageType",
                          "geoCoverageValue",
                          "type",
                          "url",
                        ].forEach((propKey) => {
                          delete newSchema["organisation"][`org.${propKey}`];
                        });
                      }
                      if (
                        values.org != null &&
                        values?.org?.geoCoverageType !==
                          prevVals.current?.org?.geoCoverageType
                      ) {
                        if (values.org.geoCoverageType === "global") {
                          if (newSchema["organisation"]["org.geoCoverageValue"])
                            newSchema["organisation"][
                              "org.geoCoverageValue"
                            ].required = false;
                        } else {
                          if (newSchema["organisation"]["org.geoCoverageValue"])
                            newSchema["organisation"][
                              "org.geoCoverageValue"
                            ].required = true;
                        }
                        changedSchema = true;
                      }
                      if (changedSchema) {
                        setFormSchema(newSchema);
                      }
                      prevVals.current = values;
                    }}
                  />
                </div>
                <div className={sectionGrid}>
                  <h2>Expertise and activities</h2>
                  <FieldsFromSchema
                    schema={formSchema["expertiesActivities"]}
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
