import React, { useRef, useEffect, useState } from "react";
import { Typography, Row, Col, Input, notification, Button } from "antd";
const { Title } = Typography;
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import CatTagSelect from "../../components/cat-tag-select/cat-tag-select";
import api from "../../utils/api";

function Expert() {
  const formRef = useRef();
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values) => {
    setLoading(true);

    values = values.invites.map((item, index) => {
      return {
        ...(item.name.split(" ").length > 1 && {
          firstName: item.name.split(" ")[0],
          lastName: item.name.split(" ")[1],
        }),
        email: item.email,
        expertise: item.expertise,
      };
    });

    api
      .post("/stakeholder/expert/invite", values)
      .then((res) => {
        window.scrollTo({ top: 0 });
        setLoading(false);
        notification.success({ message: "Invites successfully sent" });
        loadExperts();
      })
      .catch((err) => {
        setLoading(false);
        notification.error({ message: "An error occured" });
        console.log(err);
      });
  };

  const required = (value) => (value ? undefined : "Required");

  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = () => {
    api.get("/stakeholder/expert/list").then((res) => {
      setPendingInvites(res.data.experts);
    });
  };

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
                invites: [{ name: "", email: "", expertise: "" }],
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
                          <Row key={index} gutter={[16, 16]}>
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
                                name={`${name}.expertise`}
                                style={{ width: "100%" }}
                                validate={required}
                              >
                                {({ input, meta }) => {
                                  return (
                                    <CatTagSelect
                                      handleChange={(value) => {
                                        formRef?.current?.change(
                                          `${name}.expertise`,
                                          [
                                            ...(formRef?.current?.getFieldState(
                                              `${name}.expertise`
                                            )?.value
                                              ? formRef?.current?.getFieldState(
                                                  `${name}.expertise`
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
                                          `${name}.expertise`,
                                          formRef?.current
                                            ?.getFieldState(`${name}.expertise`)
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
                        loading={loading}
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

      {pendingInvites && pendingInvites.length > 0 && (
        <Row>
          <Col span={24}>
            <div className="invitation-container">
              <Title level={2} className="expert-headings">
                Pending invitations
              </Title>
              {pendingInvites.map((item) => (
                <Row key={item.id}>
                  <Col span={8}>
                    <p>
                      {item.firstName} {item.lastName}
                    </p>
                  </Col>
                  <Col span={8}>
                    <p>{item.email}</p>
                  </Col>
                  <Col span={8}>
                    <p>{item.tags.map((item) => item.tag).join(", ")}</p>
                  </Col>
                </Row>
              ))}
            </div>
          </Col>
        </Row>
      )}
    </>
  );
}

export default Expert;
