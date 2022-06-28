import React from "react";
import { Typography, Row, Col, Input, Select, Button } from "antd";
const { Title } = Typography;
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";

function Expert() {
  const onSubmit = async (values) => {
    window.alert(JSON.stringify(values, 0, 2));
  };

  const required = (value) => (value ? undefined : "Required");

  return (
    <>
      <Row>
        <Col span={24}>
          <div className="form-container">
            <Title level={2} className="expert-headings">
              Invite experts
            </Title>

            <Form
              onSubmit={onSubmit}
              mutators={{
                ...arrayMutators,
              }}
              initialValues={{
                invites: [{ name: "", email: "", expertises: "" }],
              }}
              render={({
                handleSubmit,
                form: {
                  mutators: { push, pop },
                },
                pristine,
                form,
                submitting,
                values,
              }) => {
                return (
                  <form onSubmit={handleSubmit}>
                    <FieldArray name="invites">
                      {({ fields }) =>
                        fields.map((name, index) => (
                          <Row key={name} gutter={[16, 16]}>
                            <Col span={8}>
                              {index === 0 && (
                                <div className="ant-col ant-form-item-label">
                                  <label for="name" className="" title="">
                                    Name
                                  </label>
                                </div>
                              )}
                              <Field name={`${name}.name`} validate={required}>
                                {({ input, meta }) => {
                                  return (
                                    <>
                                      <Input
                                        onChange={(e) =>
                                          input.onChange(e.target.value)
                                        }
                                        placeholder="Enter Name"
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
                            </Col>
                            <Col span={8}>
                              {index === 0 && (
                                <div className="ant-col ant-form-item-label">
                                  <label for="email" className="" title="">
                                    Email
                                  </label>
                                </div>
                              )}
                              <Field name={`${name}.email`} validate={required}>
                                {({ input, meta }) => {
                                  return (
                                    <>
                                      <Input
                                        onChange={(e) =>
                                          input.onChange(e.target.value)
                                        }
                                        placeholder="Enter Email"
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
                            </Col>
                            <Col span={8}>
                              {index === 0 && (
                                <div className="ant-col ant-form-item-label">
                                  <label for="Expertises" className="" title="">
                                    Expertises
                                  </label>
                                </div>
                              )}
                              <Field
                                name={`${name}.expertises`}
                                style={{ width: "100%" }}
                                validate={required}
                              >
                                {({ input, meta }) => {
                                  return (
                                    <Select
                                      placeholder="Enter the name of your entity"
                                      allowClear
                                      showSearch
                                      name={`${name}.expertises`}
                                      onChange={(value) =>
                                        input.onChange(value)
                                      }
                                      filterOption={(input, option) =>
                                        option.children
                                          .toLowerCase()
                                          .includes(input.toLowerCase())
                                      }
                                      className={`${
                                        meta.touched && meta.error
                                          ? "ant-input-status-error"
                                          : ""
                                      }`}
                                    >
                                      {[{ id: "2", name: "test" }]?.map(
                                        (item) => (
                                          <Select.Option
                                            value={item.id}
                                            key={item.id}
                                          >
                                            {item.name}
                                          </Select.Option>
                                        )
                                      )}
                                    </Select>
                                  );
                                }}
                              </Field>
                            </Col>
                          </Row>
                        ))
                      }
                    </FieldArray>

                    <div className="buttons">
                      <Button
                        icon={<PlusOutlined />}
                        type="button"
                        onClick={() => push("invites", undefined)}
                        className="icon-button"
                      >
                        Add row
                      </Button>
                      <Button
                        icon={<MinusOutlined />}
                        type="button"
                        onClick={() => pop("invites")}
                        className="icon-button"
                        disabled={values.invites.length === 1}
                      >
                        Remove row
                      </Button>
                    </div>

                    <div className="buttons">
                      <Button
                        className="submit"
                        disabled={submitting}
                        onClick={() => handleSubmit()}
                      >
                        Send invites
                      </Button>
                    </div>
                  </form>
                );
              }}
            />
          </div>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <div className="invitation-container">
            <Title level={2} className="expert-headings">
              Pending invitations
            </Title>

            <Row>
              <Col span={8}>
                <p>Ivan Bogdanov</p>
              </Col>
              <Col span={8}>
                <p>ivan.bogdanov@gmail.com</p>
              </Col>
              <Col span={8}>
                <p>Ocean & coast Soil, Atmosphere Biota</p>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </>
  );
}

export default Expert;
