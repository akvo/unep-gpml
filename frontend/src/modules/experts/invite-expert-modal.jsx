import React, { useState, useRef } from "react";
import styles from "./invite-expert-modal.module.scss";
import { Modal, Input, Select, notification } from "antd";
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import CatTagSelect from "../../components/cat-tag-select/cat-tag-select";
import api from "../../utils/api";
import { UIStore } from "../../store";
import Button from '../../components/button'
import FormLabel from '../../components/form-label'

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
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    expertise: [],
    suggestedCategory: [],
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values) => {
    setLoading(true);
    const [firstName, lastName] = values.name.split(" ")
    const data = {
      ...values,
      firstName,
      lastName: lastName || ' ',
      suggestedExpertise: values?.suggestedCategory?.map((item) => item.value),
    };

    api
      .post("/stakeholder/expert/suggest", data)
      .then((res) => {
        window.scrollTo({ top: 0 });
        setLoading(false);
        setInitialValues({
          name: "",
          email: "",
          expertise: [],
          suggestedCategory: [],
        });
        notification.success({ message: "Invite successfully sent" });
        setIsShownModal(false);
      })
      .catch((err) => {
        setLoading(false);
        setInitialValues({
          name: "",
          email: "",
          expertise: [],
          suggestedCategory: [],
        });
        notification.error({ message: "An error occured" });
        setIsShownModal(false);
      });
  };

  return (
    <Modal
      centered
      className={styles.inviteExpertModal}
      title="Suggest an expert"
      visible={isShownModal}
      onCancel={() => setIsShownModal(false)}
      footer={(
        <>
          <Button
            type="link"
            size="small"
            onClick={() => setIsShownModal(false)}
          >
            Cancel
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              formRef.current.submit()
            }}
            size="small"
            withArrow="link"
          >
            Submit
          </Button>
        </>
      )}
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
          initialValues={initialValues}
          render={({ handleSubmit, form }) => {
            formRef.current = form;
            return (
              <form className="invite-expert-form" onSubmit={handleSubmit}>
                <FieldArray name="invites">
                  {({ fields }) => (
                    <div>
                      <Field name={`name`} validate={required}>
                        {({ input, meta }) => {
                          const validVal =
                            input?.value && meta.valid ? 'success' : null
                          const validateStatus = !meta.valid && meta?.touched
                            ? 'error'
                            : validVal
                          return (
                            <FormLabel
                              for="name"
                              label="Fullname"
                              validateStatus={validateStatus}
                            >
                              <Input
                                onChange={(e) => input.onChange(e.target.value)}
                                value={input.value ? input.value : ''}
                                placeholder="Enter expert full name"
                                className={`${
                                  meta.touched && meta.error
                                    ? 'ant-input-status-error'
                                    : ''
                                }`}
                              />
                            </FormLabel>
                          )
                        }}
                      </Field>

                      <Field name={`email`} validate={required}>
                        {({ input, meta }) => {
                          const validVal =
                            input?.value && meta.valid ? 'success' : null
                          const validateStatus =
                            !meta.valid && meta?.touched ? 'error' : validVal
                          return (
                            <FormLabel
                              for="email"
                              label="Email"
                              validateStatus={validateStatus}
                            >
                              <Input
                                onChange={(e) => input.onChange(e.target.value)}
                                value={input.value ? input.value : ''}
                                placeholder="Enter expert email"
                                className={`${
                                  meta.touched && meta.error
                                    ? 'ant-input-status-error'
                                    : ''
                                }`}
                              />
                            </FormLabel>
                          )
                        }}
                      </Field>

                      <div className="invite-expert-input" key="expertise">
                        <div className="invite-label-wrapper">
                          <label htmlFor="Expertises" className="" title="">
                            Expertise category
                          </label>
                        </div>
                        <Field
                          name={`expertise`}
                          style={{ width: "100%" }}
                          validate={required}
                        >
                          {({ input, meta }) => {
                            return (
                              <CatTagSelect
                                placeholder="Pick"
                                handleChange={(value) => {
                                  formRef?.current?.change(`expertise`, [
                                    ...(formRef?.current?.getFieldState(
                                      `expertise`
                                    )?.value
                                      ? formRef?.current?.getFieldState(
                                          `expertise`
                                        )?.value
                                      : []),
                                    value,
                                  ]);
                                }}
                                meta={meta}
                                error={meta.touched && meta.error}
                                value={input.value ? input.value : undefined}
                                handleRemove={(v) => {
                                  formRef?.current?.change(
                                    `expertise`,
                                    formRef?.current
                                      ?.getFieldState(`expertise`)
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
                        <div className="invite-label-wrapper">
                          <label htmlFor="Expertises" className="" title="">
                            Can't see the categories you're looking for, type
                            them in:
                          </label>
                        </div>
                        <Field name={`suggestedCategory`}>
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
                  )}
                </FieldArray>
              </form>
            );
          }}
        />
      </div>
    </Modal>
  );
};

export default InviteExpertModal;
