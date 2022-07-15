import React, { useRef } from "react";
import "./invite-expert-modal.scss";
import { Modal, Button, Col, Row, Input } from "antd";
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import CatTagSelect from "../../components/cat-tag-select/cat-tag-select";

const InviteExpertModal = ({ setIsShownModal, isShownModal }) => {
  const formRef = useRef();
  const required = (value) => (value ? undefined : "Required");
  return (
    <Modal
      className="invite-expert-modal"
      title="Suggest an expert"
      visible={isShownModal}
      onCancel={() => setIsShownModal(false)}
    >
      <p className="paragraph">
        Thank you for suggesting an expert!
        <br /> Please give us some basic details about this person below. Don't
        worry all details will be kept anonymous.
      </p>
      <div>
        <Form
          onSubmit={() => null}
          mutators={{
            ...arrayMutators,
          }}
          initialValues={{
            invites: [
              {
                fullName: "",
                email: "",
                expertiseCategory: "",
                suggestCategory: "",
              },
            ],
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
              <form className="invite-expert-form" onSubmit={handleSubmit}>
                <FieldArray name="invites">
                  {({ fields }) =>
                    fields.map((name, index) => (
                      <div key={index}>
                        <div className="invite-expert-input" key="name">
                          {index === 0 && (
                            <div className="invite-label-wrapper">
                              <label htmlFor="name" className="" title="">
                                Full Name
                              </label>
                            </div>
                          )}
                          <Field name={`${name}.full-name`} validate={required}>
                            {({ input, meta }) => {
                              return (
                                <>
                                  <Input
                                    onChange={(e) =>
                                      input.onChange(e.target.value)
                                    }
                                    placeholder="Full Name"
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

                        <div className="invite-expert-input" key="email">
                          {index === 0 && (
                            <div className="invite-label-wrapper">
                              <label htmlFor="email" className="" title="">
                                Email
                              </label>
                            </div>
                          )}
                          <Field
                            name={`${name}.invitation-email`}
                            validate={required}
                          >
                            {({ input, meta }) => {
                              return (
                                <>
                                  <Input
                                    onChange={(e) =>
                                      input.onChange(e.target.value)
                                    }
                                    placeholder="martin@email.com"
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

                        <div className="invite-expert-input" key="expertise">
                          {index === 0 && (
                            <div className="invite-label-wrapper">
                              <label htmlFor="Expertises" className="" title="">
                                Expertise category
                              </label>
                            </div>
                          )}
                          <Field
                            name={`${name}.invitation-expertise`}
                            style={{ width: "100%" }}
                            placeholder="Pick categories"
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
                                  value={input.value ? input.value : undefined}
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
                        </div>

                        <div className="invite-expert-input" key="category">
                          {index === 0 && (
                            <div className="invite-label-wrapper">
                              <label htmlFor="Expertises" className="" title="">
                                Can't see the categories you're looking for,
                                type them in:
                              </label>
                            </div>
                          )}
                          <Field
                            name={`${name}.suggest-category`}
                            validate={required}
                          >
                            {({ input }) => {
                              return (
                                <>
                                  <Input
                                    onChange={(e) =>
                                      input.onChange(e.target.value)
                                    }
                                    placeholder="Suggest categories"
                                  />
                                </>
                              );
                            }}
                          </Field>
                        </div>
                      </div>
                    ))
                  }
                </FieldArray>
                <div className="invite-expert-buttons">
                  <Button
                    className="invite-submit-button"
                    size="large"
                    shape="round"
                  >
                    Submit
                  </Button>
                  <Button
                    className="invite-cancel-button"
                    size="large"
                    shape="round"
                    onClick={() => setIsShownModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            );
          }}
        />
      </div>
    </Modal>
  );
};

export default InviteExpertModal;
