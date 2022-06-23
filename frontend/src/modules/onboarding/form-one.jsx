import React from "react";
import { UIStore } from "../../store";
import { Col, Row, Button, Typography, Input, Select } from "antd";
import { Field } from "react-final-form";
const { Title, Link } = Typography;

function FormOne({ validate, error }) {
  const storeData = UIStore.useState((s) => ({
    organisations: s.organisations,
    nonMemberOrganisations: s.nonMemberOrganisations,
  }));

  const { organisations, nonMemberOrganisations } = storeData;

  return (
    <>
      <div className="text-wrapper">
        <Title level={2}>Enter your entity and job title</Title>
      </div>
      <div className="ant-form ant-form-vertical">
        <div className="field-wrapper">
          <Field name="jobTitle" validate={validate}>
            {({ input, meta }) => {
              console.log(meta);
              return (
                <>
                  <Input
                    onChange={(e) => input.onChange(e.target.value)}
                    placeholder="Enter job title"
                    className={`${
                      error && !meta.valid ? "ant-input-status-error" : ""
                    }`}
                  />
                </>
              );
            }}
          </Field>
        </div>
        <Field name="orgName" style={{ width: "100%" }} validate={validate}>
          {({ input, meta }) => (
            <>
              <Select
                placeholder="Enter the name of your entity"
                allowClear
                showSearch
                name="orgName"
                onChange={(value) => input.onChange(value)}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                className={`${
                  error && !meta.valid ? "ant-input-status-error" : ""
                }`}
              >
                {[...organisations, ...nonMemberOrganisations]?.map((item) => (
                  <Select.Option value={item.id} key={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </>
          )}
        </Field>
      </div>
    </>
  );
}

export default FormOne;
