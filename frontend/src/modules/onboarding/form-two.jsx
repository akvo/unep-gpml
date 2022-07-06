import React, { useState } from "react";
import { UIStore } from "../../store";
import { Typography, Select } from "antd";
import { Field } from "react-final-form";
import CatTagSelect from "../../components/cat-tag-select/cat-tag-select";
const { Title } = Typography;

function FormTwo({
  handleOfferingSuggestedTag,
  validate,
  error,
  handleRemove,
}) {
  const [filteredOptions, setFilteredOptions] = useState([]);
  const storeData = UIStore.useState((s) => ({
    tags: s.tags,
  }));

  const { tags } = storeData;

  const allOptions = Object.keys(tags)
    .map((k) => tags[k])
    .flat()
    .map((it) => it.tag);
  return (
    <>
      <div className="text-wrapper">
        <Title level={2}>What are the expertises you can provide?</Title>
      </div>
      <div className="ant-form ant-form-vertical">
        <Field name="offering" style={{ width: "100%" }} validate={validate}>
          {({ input, meta }) => {
            return (
              <>
                <CatTagSelect
                  handleChange={handleOfferingSuggestedTag}
                  meta={meta}
                  error={error}
                  value={input.value ? input.value : undefined}
                  handleRemove={handleRemove}
                />
              </>
            );
          }}
        </Field>
        <Field
          name="offeringSuggested"
          style={{ width: "100%" }}
          validate={validate}
        >
          {({ input, meta }) => {
            const handleSearch = (value) => {
              if (value.length < 2) {
                setFilteredOptions([]);
              } else {
                const filtered = allOptions.filter(
                  (item) => item.toLowerCase().indexOf(value.toLowerCase()) > -1
                );
                setFilteredOptions(
                  filtered.filter((it, index) => filtered.indexOf(it) === index)
                );
              }
            };
            return (
              <>
                <div style={{ marginTop: 20, color: "#A5B0C9" }}>
                  Can't see what you're looking for?
                </div>
                <Select
                  placeholder="Suggest categories"
                  allowClear
                  showSearch
                  labelInValue
                  mode="tags"
                  notFoundContent={null}
                  onChange={(value) => input.onChange(value)}
                  onSearch={handleSearch}
                  value={input.value ? input.value : undefined}
                  className={`dont-show ${
                    error && !meta.valid ? "ant-input-status-error" : ""
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
    </>
  );
}

export default FormTwo;
