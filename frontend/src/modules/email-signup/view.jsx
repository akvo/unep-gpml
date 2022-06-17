import React, { useState, useRef } from "react";
import {
  Col,
  Row,
  Typography,
  Button,
  Form,
  Input,
  Upload,
  Switch,
  Select,
  Tag,
} from "antd";
const { Title } = Typography;
const { Dragger } = Upload;
import "./styles.scss";
import { FileTextOutlined } from "@ant-design/icons";
import { Form as FinalForm, Field } from "react-final-form";
import { auth0Client } from "../../utils/misc";
import { UIStore } from "../../store";
import { useHistory } from "react-router-dom";

function EmailJoin({ setJoinEmail, handleOnClickBtnNext }) {
  let history = useHistory();
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
  }));

  const [initialValues, setInitialValues] = useState({ publicEmail: false });
  const formRef = useRef();

  const checkValidation = (values) => {
    const errors = {};
    if (!values.email?.trim()) {
      errors.email = "Please enter email address";
    }
    if (!values.title?.trim()) {
      errors.title = "Please select title";
    }
    if (!values.firstName?.trim()) {
      errors.firstName = "Please select first name";
    }
    if (!values.lastName?.trim()) {
      errors.lastName = "Please select last name";
    }
    if (!values.country) {
      errors.country = "Please select country";
    }
    if (!values.password) {
      errors.password = "Required";
    }
    if (!values.confirm) {
      errors.confirm = "Required";
    } else if (values.confirm !== values.password) {
      errors.confirm = "Must match";
    }
    return errors;
  };

  const onSubmit = async (data) => {
    auth0Client.signup(
      {
        connection: "Username-Password-Authentication",
        email: data.email,
        password: data.password,
      },
      function (err) {
        if (err) {
          return err;
        } else {
          history.push({
            pathname: "onboarding",
            state: { data: data },
          });
        }
      }
    );
  };

  const handleFileChange = ({ file, fileList }) => {
    formRef.current?.change("photo", file);
  };

  const handleFileRemove = ({ file }) => {
    formRef.current?.change("photo", "");
  };

  return (
    <div id="signup">
      <div className="ui container wave-background bg-white">
        <Row className="join-form">
          <Col span={24}>
            <div className="join-button">
              <Title level={2}>JOIN WITH EMAIL</Title>
              <Button
                type="text"
                className="connect-back-button"
                onClick={() => {
                  history.push({
                    pathname: "login",
                    state: {
                      login: true,
                    },
                  });
                }}
              >
                {"<"} Back to connect options
              </Button>
            </div>
            <FinalForm
              initialValues={initialValues}
              validate={checkValidation}
              onSubmit={onSubmit}
              render={({ handleSubmit, submitting, form }) => {
                formRef.current = form;
                return (
                  <Form layout="vertical">
                    <Form.Item label="Email">
                      <Field name="email">
                        {({ input, meta }) => (
                          <>
                            <Input {...input} placeholder="Enter your email" />
                            {meta.touched && meta.error && (
                              <p color="error" className="error">
                                {meta.error}
                              </p>
                            )}
                            <div className="public-email-switch">
                              <Switch
                                key="publicEmail"
                                name="publicEmail"
                                onChange={(checked) =>
                                  formRef.current?.change(
                                    "publicEmail",
                                    checked
                                  )
                                }
                              />
                              &nbsp;&nbsp;&nbsp;
                              {"Show my email address on public listing"}
                            </div>
                          </>
                        )}
                      </Field>
                    </Form.Item>
                    <Form.Item label="Password" name="password">
                      <Field name="password">
                        {({ input, meta }) => (
                          <>
                            <Input.Password
                              {...input}
                              placeholder="Choose your password"
                            />
                            {meta.touched && meta.error && (
                              <p color="error" className="error">
                                {meta.error}
                              </p>
                            )}
                          </>
                        )}
                      </Field>
                    </Form.Item>
                    <Form.Item label="Retype Password" name="confirm">
                      <Field name="confirm">
                        {({ input, meta }) => (
                          <>
                            <Input.Password
                              {...input}
                              placeholder="Retype your password"
                            />
                            {meta.touched && meta.error && (
                              <p color="error" className="error">
                                {meta.error}
                              </p>
                            )}
                          </>
                        )}
                      </Field>
                    </Form.Item>
                    <Input.Group compact className="title-group">
                      <Form.Item label="Title" name={"title"}>
                        <Field name="title">
                          {({ input, meta }) => (
                            <>
                              {" "}
                              <Select
                                onChange={(value) => input.onChange(value)}
                                virtual={false}
                                placeholder="Title"
                                allowClear
                              >
                                {["Mr", "Mrs", "Ms", "Dr", "Prof"].map((it) => (
                                  <Select.Option value={it} key={it}>
                                    {it}
                                  </Select.Option>
                                ))}
                              </Select>
                              {meta.touched && meta.error && (
                                <p color="error" className="error">
                                  {meta.error}
                                </p>
                              )}
                            </>
                          )}
                        </Field>
                      </Form.Item>
                      <Form.Item label="Last Name" name="lastName">
                        <Field name="lastName">
                          {({ input, meta }) => (
                            <>
                              <Input {...input} placeholder="Last Name" />
                              {meta.touched && meta.error && (
                                <p color="error" className="error">
                                  {meta.error}
                                </p>
                              )}
                            </>
                          )}
                        </Field>
                      </Form.Item>
                    </Input.Group>
                    <Form.Item label="First Name" name="firstName">
                      <Field name="firstName">
                        {({ input, meta }) => (
                          <>
                            <Input {...input} placeholder="First Name" />
                            {meta.touched && meta.error && (
                              <p color="error" className="error">
                                {meta.error}
                              </p>
                            )}
                          </>
                        )}
                      </Field>
                    </Form.Item>
                    <Form.Item
                      label={
                        <p>
                          Photo <span>OPTIONAL</span>
                        </p>
                      }
                      name="photo"
                    >
                      <Dragger
                        accept="image/png, image/jpeg"
                        onChange={handleFileChange}
                        onRemove={handleFileRemove}
                        beforeUpload={() => false}
                        maxCount={1}
                      >
                        <p className="ant-upload-drag-icon">
                          <FileTextOutlined />
                        </p>
                        <p className="ant-upload-text">Drag file here</p>
                        <p className="ant-upload-hint">
                          <span>or</span> Browse your computer
                        </p>
                      </Dragger>
                    </Form.Item>
                    <Form.Item label="Country" name="country">
                      <Field name="country">
                        {({ options, input, meta, control, ...props }) => {
                          return (
                            <>
                              <Select
                                onChange={(value) => input.onChange(value)}
                                placeholder="Search Country"
                                allowClear
                                showSearch
                                virtual={false}
                                filterOption={(input, option) =>
                                  option.children
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              >
                                {countries?.map((it) => (
                                  <Select.Option value={it.id} key={it.id}>
                                    {it.name}
                                  </Select.Option>
                                ))}
                              </Select>
                              {meta.touched && meta.error && (
                                <p color="error" className="error">
                                  {meta.error}
                                </p>
                              )}
                            </>
                          );
                        }}
                      </Field>
                    </Form.Item>
                    <Button
                      disabled={submitting}
                      htmlType="submit"
                      className="next-button"
                      onClick={() => handleSubmit()}
                    >
                      Next {">"}
                    </Button>
                  </Form>
                );
              }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default EmailJoin;
