import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button } from "antd";
import { Form as FinalForm, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { createForm } from "final-form";
import { FieldsFromSchema, validateSchema } from "../../utils/form-utils";
import { languages } from "countries-list";
import specificAreasOptions from "./specific-areas.json";
import api from "../../utils/api";
import { cloneDeep } from "lodash";

const geoCoverageTypeOptions = [
  "Global",
  "Regional",
  "National",
  "Sub-national",
  "Transnational",
  "Global with elements in specific areas",
];
const regionOptions = [
  "Africa",
  "Asia and the Pacific",
  "East Asia",
  "Europe",
  "Latin America and Carribean",
  "North America",
  "West Asia",
];

const GeoCoverageInput = (props) => {
  const { countries } = props;
  return (
    <Field
      name="geoCoverageType"
      render={({ input: typeInput }) => {
        return (
          <Field
            name="geoCoverageValue"
            render={({ input }) => {
              if (typeInput.value === "global") return <Input disabled />;
              if (typeInput.value === "sub-national")
                return <Input placeholder="Type regions here..." {...input} />;
              if (typeInput.value === "Other")
                return <Input placeholder="Type here..." {...input} />;
              const selectProps = { ...input };
              if (typeInput.value === "regional") {
                if (input.value === "" || input?.[0] === "") input.onChange([]);
                selectProps.options = regionOptions.map((it) => ({
                  value: it,
                  label: it,
                }));
                selectProps.mode = "multiple";
              } else if (
                typeInput.value === "national" ||
                typeInput.value === "transnational"
              ) {
                selectProps.options =
                  countries &&
                  countries
                    .map((it) => ({
                      value: it.isoCode,
                      label: it.name,
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));
                selectProps.showSearch = true;
                selectProps.filterOption = (input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                if (typeInput.value === "transnational") {
                  if (input.value === "" || input?.[0] === "")
                    input.onChange([]);
                  selectProps.mode = "multiple";
                }
              } else if (
                typeInput.value === "global with elements in specific areas"
              ) {
                selectProps.options = specificAreasOptions.map((it) => ({
                  value: it,
                  label: it,
                }));
                selectProps.mode = "multiple";
                if (input.value === "" || input?.[0] === "") input.onChange([]);
              }
              return <Select {...selectProps} />;
            }}
          />
        );
      }}
    />
  );
};

const defaultFormSchema = [
  {
    title: { label: "Title", required: true },
    date: { label: "Date", required: true, control: "date-range" },
    urls: {
      type: "array",
      addLabel: "Add language",
      items: {
        url: { label: "URL", required: true, addonBefore: "https://" },
        lang: {
          label: "Language",
          required: true,
          control: "select",
          showSearch: true,
          options: Object.keys(languages).map((langCode) => ({
            value: langCode,
            label: languages[langCode].name,
          })),
        },
      },
    },
    description: { label: "Event description", control: "textarea" },
    photo: {
      label: "Photo",
      control: "file",
      accept: "image/*",
      maxFileSize: 1,
    },
  },
  {
    city: { label: "City" },
    country: {
      label: "Country",
      control: "select",
      showSearch: true,
      options: [],
    },
    geoCoverageType: {
      label: "Geo coverage type",
      required: true,
      control: "select",
      options: geoCoverageTypeOptions.map((it) => ({
        value: it.toLowerCase(),
        label: it,
      })),
    },
    geoCoverageValue: {
      label: "Geo coverage",
      render: GeoCoverageInput,
    },
  },
  {
    remarks: { label: "Additional info", control: "textarea" },
    tags: {
      label: "Tags",
      control: "select",
      options: [],
      loading: true,
      mode: "multiple",
      showSearch: true,
    },
  },
];

const validation = (formSchema) => {
  return validateSchema(
    formSchema.reduce((acc, val) => ({ ...acc, ...val }), {})
  );
};

const AddEventForm = ({ countries }) => {
  const [formSchema, setFormSchema] = useState(defaultFormSchema);
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(1);
  const onSubmit = (vals) => {
    const data = { ...vals };
    delete data.date;
    data.urls = vals.urls.filter((it) => it.url.length > 0);
    data.startDate = vals.date[0].toISOString();
    data.endDate = vals.date[1].toISOString();
    if (data.geoCoverageType === "national") {
      data.geoCoverageValue = [data.geoCoverageValue];
    }
    setSending(true);
    api.post("/event", data).then(() => {
      setSending(false);
      setStep(2);
    });
  };
  useEffect(() => {
    (async function fetchData() {
      const response = await api.get("/tag/event");
      const newSchema = cloneDeep(defaultFormSchema);
      newSchema[2].tags.options = response.data.map((x) => ({
        value: x.id,
        label: x.tag,
      }));
      newSchema[2].tags.loading = false;
      if (countries) {
        newSchema[1].country.options = countries
          .map((x) => ({
            value: x.isoCode,
            label: x.name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        newSchema[1].geoCoverageValue = {
          ...newSchema[1].geoCoverageValue,
          countries: countries,
        };
      }
      setFormSchema(newSchema);
    })();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (countries) {
      const newSchema = cloneDeep(defaultFormSchema);
      newSchema[1].country.options = countries
        .map((x) => ({
          value: x.isoCode,
          label: x.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      newSchema[1].geoCoverageValue = {
        ...newSchema[1].geoCoverageValue,
        countries: countries,
      };
      setFormSchema(newSchema);
    }
  }, [countries]); // eslint-disable-line

  const form = createForm({
    subscription: {},
    initialValues: { urls: [{ url: "", lang: "en" }] },
    mutators: {
      ...arrayMutators,
    },
    onSubmit,
    validate: validation(formSchema),
  });
  return (
    <div className="add-event-form">
      {step === 1 && (
        <Form layout="vertical">
          <FinalForm
            form={form}
            render={({ form: { mutators }, handleSubmit }) => {
              return (
                <div>
                  <div className="section">
                    <h3>Event details</h3>
                    <FieldsFromSchema
                      schema={formSchema[0]}
                      mutators={mutators}
                    />
                  </div>
                  <div className="section">
                    <h2>Location & coverage</h2>
                    <FieldsFromSchema schema={formSchema[1]} />
                  </div>
                  <div className="section">
                    <h2>Other</h2>
                    <FieldsFromSchema schema={formSchema[2]} />
                  </div>
                  <Button
                    loading={sending}
                    type="primary"
                    size="large"
                    onClick={() => handleSubmit()}
                  >
                    Add event
                  </Button>
                </div>
              );
            }}
          />
        </Form>
      )}
      {step === 2 && (
        <div>
          <h3>Thank you for adding the event</h3>
          <p>we'll let you know once an admin has approved it</p>
        </div>
      )}
    </div>
  );
};

export default AddEventForm;
