import React, { useRef } from "react";
import { Typography, Row, Col, Input, Select, Button } from "antd";
const { Title } = Typography;
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import CatTagSelect from "../../components/cat-tag-select/cat-tag-select";

function Expert() {
  const formRef = useRef();
  const onSubmit = async (values) => {
    window.alert(JSON.stringify(values, 0, 2));
  };

  const required = (value) => (value ? undefined : "Required");

  const handleExpert = (value) => {
    formRef?.current?.change("offering", [
      ...(formRef?.current?.getFieldState("offering")?.value
        ? formRef?.current?.getFieldState("offering")?.value
        : []),
      value,
    ]);
  };

  const handleExpertRemove = (value) => {};

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
                formRef.current = form;
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
                                    <CatTagSelect
                                      handleChange={(value) => {
                                        formRef?.current?.change(
                                          `${name}.expertises`,
                                          [
                                            ...(formRef?.current?.getFieldState(
                                              `${name}.expertises`
                                            )?.value
                                              ? formRef?.current?.getFieldState(
                                                  `${name}.expertises`
                                                )?.value
                                              : []),
                                            value,
                                          ]
                                        );
                                      }}
                                      meta={meta}
                                      error={meta.touched && meta.error}
                                      value={
                                        input.value ? input.value : undefined
                                      }
                                      handleRemove={(v) => {
                                        formRef?.current?.change(
                                          `${name}.expertises`,
                                          formRef?.current
                                            ?.getFieldState(
                                              `${name}.expertises`
                                            )
                                            ?.value.filter(function (item) {
                                              return item !== v;
                                            })
                                        );
                                      }}
                                    />
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
