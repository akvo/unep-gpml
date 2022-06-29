import React, { useState, useEffect } from "react";
import { UIStore } from "../../store";
import { Col, Row, Button, Typography, Form, Input, Select, List } from "antd";
import { Field } from "react-final-form";
import CatTagSelect from "../../components/cat-tag-select/cat-tag-select";
const { Title, Link } = Typography;

function FormTwo({
  handleOfferingSuggestedTag,
  validate,
  error,
  handleRemove,
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const storeData = UIStore.useState((s) => ({
    entitySuggestedTags: s.entitySuggestedTags,
    tags: s.tags,
  }));

  const { entitySuggestedTags, tags } = storeData;

  const array = Object.keys(tags)
    .map((k) => tags[k])
    .flat();

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
            const filteredOptions = array.filter((ad) =>
              input.value
                ? input.value.every((fd) => fd.value !== ad.id)
                : array
            );
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
                  onChange={(value) => {
                    setSelectedItems(value.map((item) => item.label));
                    input.onChange(value);
                  }}
                  value={input.value ? input.value : undefined}
                  filterOption={(i, option) =>
                    option.children.toLowerCase().includes(i.toLowerCase())
                  }
                  className={`dont-show ${
                    error && !meta.valid ? "ant-input-status-error" : ""
                  }`}
                >
                  {filteredOptions?.map((item) => (
                    <Select.Option value={item.id} key={item.id}>
                      {item.tag}
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
