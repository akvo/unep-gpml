import { UIStore } from "../../store";
import React, { useEffect, useState, useContext, useRef } from "react";
import { Form, Input, Select, Button, notification } from "antd";
import { Form as FinalForm, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { createForm } from "final-form";
import { FieldsFromSchema, validateSchema } from "../../utils/form-utils";
import { languages } from "countries-list";
import api from "../../utils/api";
import { cloneDeep } from "lodash";
import moment from "moment";
import { withRouter } from "react-router-dom";
import { customFormats } from "../../utils/forms";

const GeoCoverageInput = (props) => {
  const { countries, regionOptions, meaOptions } = UIStore.useState((s) => ({
    countries: s.countries,
    regionOptions: s.regionOptions,
    meaOptions: s.meaOptions,
  }));
  const national =
    countries &&
    countries
      .map((it) => ({
        value: it.id,
        label: it.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <Field
      name="geoCoverageType"
      render={({ input: typeInput }) => {
        return (
          <Field
            name="geoCoverageValue"
            render={({ input }) => {
              if (typeInput.value === "global") {
                return <Input disabled />;
              }
              if (typeInput.value === "Other") {
                return <Input placeholder="Type here..." {...input} />;
              }
              const selectProps = { ...input };
              if (typeInput.value === "sub-national") {
                selectProps.options = national;
                selectProps.showSearch = true;
                selectProps.filterOption = (input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
              if (typeInput.value === "regional") {
                if (input.value === "" || input?.[0] === "") {
                  input.onChange([]);
                }
                selectProps.options = regionOptions.map((it) => ({
                  value: it.id,
                  label: it.name,
                }));
                selectProps.mode = "multiple";
              } else if (
                typeInput.value === "national" ||
                typeInput.value === "transnational"
              ) {
                selectProps.options = national;
                selectProps.showSearch = true;
                selectProps.filterOption = (input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                if (typeInput.value === "transnational") {
                  if (input.value === "" || input?.[0] === "") {
                    input.onChange([]);
                  }
                  selectProps.mode = "multiple";
                }
              } else if (
                typeInput.value === "global with elements in specific areas"
              ) {
                selectProps.options = meaOptions.map((it) => ({
                  value: it.id,
                  label: it.name,
                }));
                selectProps.mode = "multiple";
                if (input.value === "" || input?.[0] === "") {
                  input.onChange([]);
                }
              }
              return <Select {...selectProps} virtual={false} />;
            }}
          />
        );
      }}
    />
  );
};

function disablePastDate(current) {
  // Can not select days before today
  return current && current < moment().subtract(1, "days").endOf("day");
}

const defaultFormSchema = [
  {
    title: { label: "Title", required: true },
    date: {
      label: "Date",
      required: true,
      control: "date-range",
      disabledDate: disablePastDate,
    },
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
  },
  {
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

const AddEventForm = withRouter(({ match: { params }, history }) => {
  const {
    countries,
    geoCoverageTypeOptions,
    tags,
    formStep,
    formEdit,
  } = UIStore.useState((s) => ({
    countries: s.countries,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    tags: s.tags,
    formStep: s.formStep,
    formEdit: s.formEdit,
  }));
  const { status, id } = formEdit.event;
  const [formSchema, setFormSchema] = useState(defaultFormSchema);
  const [sending, setSending] = useState(false);
  const [geoType, setGeoType] = useState({ value: null, error: false });
  const formRef = useRef();

  const onSubmit = (vals) => {
    const data = { ...vals };
    delete data.date;
    data.urls = vals.urls.filter((it) => it.url.length > 0);
    data.startDate = vals.date[0].toISOString();
    data.endDate = vals.date[1].toISOString();
    if (
      data.geoCoverageType === "national" ||
      data.geoCoverageType === "sub-national"
    ) {
      data.geoCoverageValue = [data.geoCoverageValue];
    } else if (data.geoCoverageType === "global") {
      delete data.geoCoverageValue;
    }
    if (status === "add") {
      data?.photo && data?.photo === "" && delete data.photo;
    } else if (status === "edit" || params?.id) {
      if (!data?.photo) {
        data.photo = null;
      } else {
        data?.photo.match(customFormats.url) && delete data.photo;
      }
    }
    data?.ts && delete data.ts;

    setSending(true);
    if (status === "add" && !params?.id) {
      api
        .post("/event", data)
        .then(() => {
          UIStore.update((e) => {
            e.formStep = {
              ...e.formStep,
              event: 2,
            };
          });
          // scroll top
          window.scrollTo({ top: 0 });
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
        .put(`/detail/event/${id || params?.id}`, data)
        .then(() => {
          notification.success({ message: "Update success" });
          UIStore.update((e) => {
            e.formEdit = {
              ...e.formEdit,
              event: {
                status: "add",
                id: null,
              },
            };
          });
          // scroll top
          window.scrollTo({ top: 0 });
          history.push(`/event/${id || params?.id}`);
        })
        .catch(() => {
          notification.error({ message: "An error occured" });
        })
        .finally(() => {
          setSending(false);
        });
    }
  };

  useEffect(() => {
    const newSchema = cloneDeep(defaultFormSchema);
    const tagsPlusTopics = tags.events?.concat(tags.topics);
    newSchema[3].tags.options = tagsPlusTopics?.map((x) => ({
      value: x.id,
      label: x.tag,
    }));
    newSchema[3].tags.loading = false;
    if (countries) {
      newSchema[1].country.options = countries
        .map((x) => ({
          value: x.id,
          label: x.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    setFormSchema(newSchema);

    // Manage form status, add/edit
    if (status === "edit" || params?.id) {
      api.get(`/detail/event/${id || params?.id}`).then((d) => {
        setFormData(d.data);
      });
    }
    if (status === "add" && !params?.id) {
      setTimeout(() => {
        formRef.current?.change("ts", new Date().getTime());
        formRef.current?.restart({ urls: [{ url: "", lang: "en" }] });
      });
    }
  }, [countries, tags, status, id, params]);

  const setFormData = (data) => {
    const dateFormat = "YYYY/MM/DD";
    setTimeout(() => {
      formRef.current?.change("ts", new Date().getTime());
      data?.title && formRef.current?.change("title", data?.title);
      if (data?.startDate && data?.endDate) {
        formRef.current?.change("date", [
          moment(data?.startDate, dateFormat),
          moment(data?.endDate, dateFormat),
        ]);
      } else {
        formRef.current?.change("date", "");
      }
      data?.languages &&
        formRef.current?.change(
          "urls",
          data?.languages.map((x) => ({ url: x.url, lang: x.isoCode }))
        );
      data?.description &&
        formRef.current?.change("description", data?.description);
      data?.image && formRef.current?.change("photo", data?.image);
      data?.city && formRef.current?.change("city", data?.city);
      data?.country && formRef.current?.change("country", data?.country);
      data?.geoCoverageType &&
        formRef.current?.change("geoCoverageType", data?.geoCoverageType);
      let geoCoverageValue = null;
      if (
        data.geoCoverageType === "national" ||
        data.geoCoverageType === "sub-national"
      ) {
        geoCoverageValue = data?.geoCoverageValues[0];
      } else {
        geoCoverageValue = data?.geoCoverageValues;
      }
      data?.geoCoverageValues &&
        formRef.current?.change("geoCoverageValue", geoCoverageValue);
      data?.remarks && formRef.current?.change("remarks", data?.remarks);
      data?.tags &&
        formRef.current?.change(
          "tags",
          data.tags.map((x) => Number(Object.keys(x)[0]))
        );
    });
  };

  const form = createForm({
    subscription: {},
    initialValues: { urls: [{ url: "", lang: "en" }] },
    mutators: {
      ...arrayMutators,
    },
    onSubmit,
    validate: validation(formSchema),
  });

  const handleChangeGeoType = (value, setError = true) => {
    setGeoType({ value, error: setError ? !value : setError });
    const newSchema = cloneDeep(formSchema);
    Object.keys(newSchema[2]).forEach((key) => {
      newSchema[2][key].required = value !== "global";
    });
    setFormSchema(newSchema);
    setTimeout(() => {
      formRef.current?.change("ts", new Date().getTime());
      formRef.current?.change("geoCoverageType", value);
      // set geoCoverageValue to null when geoCoverageType change
      formRef.current?.change("geoCoverageValue", null);
    });
  };

  return (
    <div className="add-event-form">
      {formStep.event === 1 && (
        <Form layout="vertical">
          <FinalForm
            form={form}
            render={({ form, handleSubmit }) => {
              formRef.current = form;
              return (
                <div>
                  <div className="section">
                    <h3>Event details</h3>
                    <FieldsFromSchema
                      schema={formSchema[0]}
                      mutators={form.mutators}
                    />
                  </div>
                  <div className="section">
                    <h3>Location & coverage</h3>
                    <FieldsFromSchema schema={formSchema[1]} />
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
                    <FieldsFromSchema schema={formSchema[2]} />
                  </div>
                  <div className="section">
                    <h3>Other</h3>
                    <FieldsFromSchema schema={formSchema[3]} />
                  </div>
                  <Button
                    loading={sending}
                    type="primary"
                    size="large"
                    onClick={() => handleSubmit()}
                  >
                    {status === "add" && !params?.id ? "Add" : "Update"} event
                  </Button>
                </div>
              );
            }}
          />
        </Form>
      )}
      {formStep.event === 2 && (
        <div>
          <h3>Thank you for adding the event</h3>
          <p>we'll let you know once an admin has approved it</p>
        </div>
      )}
    </div>
  );
});

export default AddEventForm;
