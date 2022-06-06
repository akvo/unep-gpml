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
import { useRef } from "react";

const { sectorOptions } = UIStore.currentState;
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
  },
  organisation: {
    "org.id": {
      label: "GPML Entity",
      control: "select",
      showSearch: true,
      options: [],
      placeholder: "Start typing...",
      order: 0,
      required: false,
    },
    jobTitle: {
      label: "Job Tilte",
    },
    nonMemberOrganisation: {
      label: "Non Member Entity",
      control: "select",
      showSearch: true,
      options: [],
      placeholder: "Start typing...",
      required: false,
    },
  },
  expertiesActivities: {
    seeking: {
      label: "Seeking",
      required: true,
      control: "select",
      mode: "multiple",
      showSearch: true,
      options: [],
    },
    offering: {
      label: "Offering",
      required: true,
      control: "select",
      mode: "multiple",
      showSearch: true,
      options: [],
    },
    about: {
      label: "About yourself",
      required: true,
      control: "textarea",
      placeholder: "Max 150 words",
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
    tags,
    organisations,
    organisationType,
    nonMemberOrganisations,
  } = UIStore.useState((s) => ({
    countries: s.countries,
    tags: s.tags,
    organisations: s.organisations,
    organisationType: s.organisationType,
    nonMemberOrganisations: s.nonMemberOrganisations,
  }));

  const [noOrg, setNoOrg] = useState(false);
  const [formInitialValues, setInitialValues] = useState(false);
  const [pubEmail, setPubEmail] = useState({
    checked: false,
    text: "Show my email address on public listing",
  });

  const prevVals = useRef();
  const formRef = useRef();
  const formSchemaRef = useRef(defaultFormSchema);
  const formContainer = !isModal ? "signup-form-grid" : "signup-form";
  const sectionGrid = !isModal ? "section-grid" : "section";

  const newSchema = cloneDeep(defaultFormSchema);

  newSchema["organisation"]["org.id"].options = [
    ...organisations.map((it) => ({ value: it.id, label: it.name })),
    { value: -1, label: "Other" },
  ];
  newSchema["organisation"]["nonMemberOrganisation"].options = [
    ...nonMemberOrganisations.map((it) => ({ value: it.id, label: it.name })),
  ];

  newSchema["organisation"]["org.id"].filterOption = (input, option) => {
    return (
      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
      option.value === -1
    );
  };
  newSchema["organisation"]["nonMemberOrganisation"].filterOption = (
    input,
    option
  ) => {
    return (
      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
      option.value === -1
    );
  };

  const array = Object.keys(tags)
    .map((k) => tags[k])
    .flat();

  newSchema["expertiesActivities"].offering.options = array?.map((x) => ({
    value: x.id,
    label: x.tag,
  }));
  newSchema["expertiesActivities"].seeking.options = array?.map((x) => ({
    value: x.id,
    label: x.tag,
  }));

  newSchema["personalDetails"][
    "socialLocation"
  ].country.options = countries.map((x) => ({
    value: x.id,
    label: x.name,
  }));

  const [formSchema, setFormSchema] = useState(newSchema);

  useEffect(() => {
    formSchemaRef.current = formSchema;
  }, [formSchema]);

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
        formRef.current?.change("nonMemberOrganisation", null);
      }
    });
  };

  const handleChangePublicEmail = (checked) => {
    const preffix = !checked ? "Don't show" : "Show";
    setPubEmail({
      checked: checked,
      text: `${preffix} my email address on public listing`,
    });
    setTimeout(() => {
      formRef.current?.change("ts", new Date().getTime());
      formRef.current?.change("publicEmail", checked);
    });
  };

  const changeOrganisationFormSchema = (key) => {
    newSchema["organisation"][key].disabled = true;
    newSchema["organisation"][key].required = false;
    setFormSchema(newSchema);
  };

  useEffect(() => {
    if (initialValues) {
      handleChangePublicEmail(initialValues.publicEmail);
    }
    if (
      initialValues &&
      initialValues?.org === null &&
      initialValues?.nonMemberOrganisation === null
    ) {
      handleChangePrivateCitizen({ target: { checked: true } });
    } else if (initialValues?.org === null) {
      changeOrganisationFormSchema("org.id");
    } else {
      changeOrganisationFormSchema("nonMemberOrganisation");
    }
  }, [initialValues]); // eslint-disable-line

  useEffect(() => {
    setInitialValues({
      ...initialValues,
      seeking: initialValues?.tags
        ?.filter((item) => item.tagRelationCategory === "seeking")
        .map((x) => x.id),
      offering: initialValues?.tags
        ?.filter((item) => item.tagRelationCategory === "offering")
        .map((x) => x.id),
    });
  }, [initialValues]);

  return (
    <Form layout="vertical">
      <FinalForm
        initialValues={formInitialValues || {}}
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
                  <h2>Entity details</h2>
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
                          label: "Type of the entity",
                          required: true,
                          control: "select",
                          options: organisationType.map((it) => ({
                            value: it,
                            label: it,
                          })),
                        };
                        newSchema["organisation"]["org.country"] = {
                          label: "Country",
                          order: 3,
                          control: "select",
                          required: true,
                          showSearch: true,
                          options: countries.map((it) => ({
                            value: it.id,
                            label: it.name,
                          })),
                          autoComplete: "off",
                        };
                        newSchema["organisation"]["org.url"] = {
                          label: "Entity URL",
                          order: 4,
                          addonBefore: "https://",
                          required: true,
                        };
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
                        ["country", "type", "url"].forEach((propKey) => {
                          delete newSchema["organisation"][`org.${propKey}`];
                        });
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
