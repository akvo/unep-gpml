import React, { useState } from "react";
import "./create-project-modal.scss";
import { Select, Input, Button, Modal, notification } from "antd";
import { Field, Form } from "react-final-form";
import api from "../../utils/api";
import { useHistory } from "react-router-dom";
import { stagesChecklist } from "../projects/view";
import { UIStore } from "../../store";

const geoCoverageTypeOptions = [
  { label: "Global", value: "global" },
  { label: "Transnational", value: "transnational" },
  { label: "National", value: "national" },
  { label: "Sub-national", value: "sub-national" },
];

const CreateProjectModal = ({
  setShowCreateProjectModal,
  showCreateProjectModal,
  stage,
  answers
}) => {
  const { countries, transnationalOptions } = UIStore.currentState;
  const history = useHistory();
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(false);

  const required = (value) => {
    return value ? undefined : "Required";
  };

  const handleSubmit = (values) => {
    onSubmit(values);
  };
  const onSubmit = async (values) => {
    setLoading(true);

    const data = {
      type: "action-plan",
      stage,
      answers,
      geoCoverageType: values.geoCoverageType,
      title: values.title,
      ...(values.geoCoverageType === "national" && {
        geoCoverageCountries: [values.geoCoverageCountries],
      }),
      ...(values.geoCoverageType === "transnational" && {
        geoCoverageCountryGroups: values.geoCoverageCountryGroups,
      }),
    };

    api
      .post("/project", data)
      .then((res) => {
        setLoading(false);
        setShowCreateProjectModal(false);
        history.push(`/projects/${res?.data.projectId}`);
      })
      .catch((err) => {
        notification.error({
          message: err?.response?.message
            ? err?.response?.message
            : "Oops, something went wrong",
        });
        setLoading(false);
        setShowCreateProjectModal(false);
      });
  };

  return (
    <Modal
      centered
      className="create-project-modal"
      title="New project"
      visible={showCreateProjectModal}
      onCancel={() => setShowCreateProjectModal(false)}
      footer={false}
    >
      <Form
        initialValues={initialValues}
        validate={required}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, submitting, form, values }) => {
          return (
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <Field name="title" validate={required}>
                  {({ input, meta }) => {
                    return (
                      <>
                        <Input
                          placeholder="Project name"
                          onChange={(e) => input.onChange(e.target.value)}
                          className={`${
                            meta.touched && meta.error
                              ? "ant-input-status-error"
                              : ""
                          }`}
                        />
                      </>
                    );
                  }}
                </Field>
              </div>
              <div className="form-field">
                <Field
                  name="geoCoverageType"
                  style={{ width: "100%" }}
                  validate={required}
                >
                  {({ input, meta }) => {
                    return (
                      <>
                        <Select
                          placeholder="Geo-location"
                          allowClear
                          showSearch
                          name="geoCoverageType"
                          onChange={(value) => input.onChange(value)}
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={input.value ? input.value : undefined}
                          className={`${
                            meta.touched && meta.error
                              ? "ant-input-status-error"
                              : ""
                          }`}
                        >
                          {geoCoverageTypeOptions?.map((item) => (
                            <Select.Option value={item.value} key={item.value}>
                              {item.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </>
                    );
                  }}
                </Field>
              </div>
              {values.geoCoverageType === "national" && (
                <div className="form-field">
                  <Field
                    name="geoCoverageCountries"
                    style={{ width: "100%" }}
                    validate={required}
                  >
                    {({ input, meta }) => {
                      return (
                        <>
                          <Select
                            placeholder="Select country"
                            allowClear
                            showSearch
                            name="geoCoverageCountries"
                            onChange={(value) => input.onChange(value)}
                            filterOption={(input, option) =>
                              option.children
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            value={input.value ? input.value : undefined}
                            className={`${
                              meta.touched && meta.error
                                ? "ant-input-status-error"
                                : ""
                            }`}
                          >
                            {countries?.map((item) => (
                              <Select.Option value={item.id} key={item.id}>
                                {item.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </>
                      );
                    }}
                  </Field>
                </div>
              )}
              {values.geoCoverageType === "transnational" && (
                <div className="form-field">
                  <Field
                    name="geoCoverageCountryGroups"
                    style={{ width: "100%" }}
                    validate={required}
                  >
                    {({ input, meta }) => {
                      return (
                        <>
                          <Select
                            mode="multiple"
                            placeholder="Select geo coverage"
                            allowClear
                            showSearch
                            name="geoCoverageCountryGroups"
                            onChange={(value) => input.onChange(value)}
                            filterOption={(input, option) =>
                              option.children
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            value={input.value ? input.value : undefined}
                            className={`${
                              meta.touched && meta.error
                                ? "ant-input-status-error"
                                : ""
                            }`}
                          >
                            {transnationalOptions?.map((item) => (
                              <Select.Option value={item.id} key={item.id}>
                                {item.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </>
                      );
                    }}
                  </Field>
                </div>
              )}
              <div className="ant-modal-footer">
                <Button
                  key="submit"
                  type="primary"
                  className="create-button"
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Create project
                </Button>
                <Button
                  className="clear-button"
                  onClick={() => setShowCreateProjectModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          );
        }}
      </Form>
    </Modal>
  );
};

export default CreateProjectModal;
