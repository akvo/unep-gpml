import React, { useState } from "react";
import "./create-project-modal.scss";
import { Select, Input, Button, Modal } from "antd";
import { Field, Form } from "react-final-form";
import api from "../../utils/api";
import { useHistory } from "react-router-dom";

const geoCoverageTypeOptions = [
  { label: "Global", value: "global" },
  { label: "Transnational", value: "transnational" },
  { label: "National", value: "national" },
  { label: "Sub-national", value: "sub-national" },
];

const CreateProjectModal = ({
  setShowCreateProjectModal,
  showCreateProjectModal,
}) => {
  const history = useHistory();
  const [initialValues, setInitialValues] = useState({});

  const required = (value) => {
    return value ? undefined : "Required";
  };

  const handleSubmit = (values) => {
    onSubmit(values);
  };
  const onSubmit = async (values) => {
    const data = {
      ...values,
      type: "action-plan",
    };
    api
      .post("/project", data)
      .then((res) => {
        console.log(res);
        setShowCreateProjectModal(false);
        history.push(`/projects/${res?.data.project}`);
      })
      .catch((err) => {
        console.log(err);
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
        {({ handleSubmit, submitting, form }) => {
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
              <div className="ant-modal-footer">
                <Button
                  key="submit"
                  type="primary"
                  className="create-button"
                  onClick={handleSubmit}
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
