import React, { useState, useRef } from "react";
import "./invite-expert-modal.scss";
import { Modal, Button, Input, Select, notification } from "antd";
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import CatTagSelect from "../../components/cat-tag-select/cat-tag-select";
import api from "../../utils/api";
import { UIStore } from "../../store";

const InviteExpertModal = ({ setIsShownModal, isShownModal }) => {
  const storeData = UIStore.useState((s) => ({
    tags: s.tags,
  }));
  const { tags } = storeData;

  const allOptions = Object.keys(tags)
    .map((k) => tags[k])
    .flat()
    .map((it) => it.tag);
  const formRef = useRef();

  const required = (value) => (value ? undefined : "Required");

  const [filteredOptions, setFilteredOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values) => {
    setLoading(true);
    values = values.invites.map((item) => {
      return {
        ...(item.name.split(" ").length > 1 && {
          firstName: item?.name?.split(" ")[0],
          lastName: item?.name?.split(" ")[1],
        }),
        email: item?.email,
        expertise: item?.expertise,
      };
    });

    api
      .post("/stakeholder/expert/invite", values)
      .then((res) => {
        console.log(res, "RES");
        window.scrollTo({ top: 0 });
        setLoading(false);
        notification.success({ message: "Invites successfully sent" });
      })
      .catch((err) => {
        setLoading(false);
        notification.error({ message: "An error occured" });
        console.log(err);
      });
  };

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
          onSubmit={onSubmit}
          mutators={{
            ...arrayMutators,
          }}
          initialValues={{
            invites: [
              {
                name: "",
                email: "",
                expertise: "",
              },
            ],
          }}
          render={({ handleSubmit, form, submitting }) => {
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
                          <Field name={`${name}.name`} validate={required}>
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
                          <Field name={`${name}.email`} validate={required}>
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
                            name={`${name}.expertise`}
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
                          <Field name={`${name}.suggest-category`}>
                            {({ input, meta, error }) => {
                              const handleSearch = (value) => {
                                if (value.length < 2) {
                                  setFilteredOptions([]);
                                } else {
                                  const filtered = allOptions.filter(
                                    (item) =>
                                      item
                                        .toLowerCase()
                                        .indexOf(value.toLowerCase()) > -1
                                  );
                                  setFilteredOptions(
                                    filtered.filter(
                                      (it, index) =>
                                        filtered.indexOf(it) === index
                                    )
                                  );
                                }
                              };
                              return (
                                <>
                                  <Select
                                    placeholder="Suggest categories"
                                    allowClear
                                    showSearch
                                    labelInValue
                                    mode="tags"
                                    notFoundContent={null}
                                    onChange={(value) => input?.onChange(value)}
                                    onSearch={handleSearch}
                                    value={
                                      input?.value ? input?.value : undefined
                                    }
                                    className={`dont-show modal-suggest-category ${
                                      error && !meta.valid
                                        ? "ant-input-status-error"
                                        : ""
                                    }`}
                                  >
                                    {filteredOptions?.map((item) => (
                                      <Select.Option value={item} key={item}>
                                        {item}
                                      </Select.Option>
                                    ))}
                                  </Select>
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
                    loading={loading}
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="invite-submit-button"
                    size="large"
                    shape="round"
                  >
                    Submit &gt;
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
