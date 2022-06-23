import React, { useState } from "react";
import { UIStore } from "../../store";
import { Col, Row, Typography, Select, List } from "antd";
import { Field } from "react-final-form";
const { Title, Link } = Typography;

function FormThree({ handleSeekingSuggestedTag, validate, error }) {
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
        <Title level={2}>What are the expertises you are looking for?</Title>
      </div>
      <div className="ant-form ant-form-vertical">
        <Field name="seeking" style={{ width: "100%" }} validate={validate}>
          {({ input, meta }) => {
            const filteredOptions = array.filter((ad) =>
              input.value
                ? input.value.every((fd) => fd.value !== ad.id)
                : array
            );
            return (
              <>
                <Select
                  placeholder="Search expertises"
                  allowClear
                  labelInValue
                  showSearch
                  mode="tags"
                  value={input.value ? input.value : undefined}
                  onChange={(value) => {
                    setSelectedItems(value.map((item) => item.label));
                    input.onChange(value);
                  }}
                  filterOption={(i, option) =>
                    option.children.toLowerCase().includes(i.toLowerCase())
                  }
                  className={`${
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
      <div className="list tag-list" style={{ marginTop: 20 }}>
        <h5>Suggested tags</h5>
        <div className="tags-container">
          <List itemLayout="horizontal">
            <List.Item>
              <List.Item.Meta
                title={
                  <ul>
                    {entitySuggestedTags
                      ?.filter((item) => !selectedItems.includes(item))
                      .map((tag) => (
                        <li
                          key={tag}
                          onClick={() => {
                            if (!selectedItems.includes(tag)) {
                              setSelectedItems([...selectedItems, tag]);
                            }
                            handleSeekingSuggestedTag(tag);
                          }}
                        >
                          {tag}
                        </li>
                      ))}
                  </ul>
                }
              />
            </List.Item>
          </List>
        </div>
      </div>
    </>
  );
}

export default FormThree;
