import React, { useState } from "react";
import { UIStore } from "../../store";
import { Col, Row, Button, Typography, Form, Input, Select, List } from "antd";
import { Field } from "react-final-form";
const { Title, Link } = Typography;

function FormTwo({ handleOfferingSuggestedTag, validate }) {
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
      <Row justify="center" align="middle">
        <Col span={24}>
          <div className="text-wrapper">
            <Title level={2}>What are the expertises you can provide?</Title>
          </div>
          <div className="ant-form ant-form-vertical">
            <Field
              name="offering"
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
                    <Select
                      placeholder="Search expertises"
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
                        meta.touched && meta.error
                          ? "ant-input-status-error"
                          : ""
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
            <List itemLayout="horizontal">
              <List.Item>
                <List.Item.Meta
                  title={
                    <ul>
                      {entitySuggestedTags
                        ?.filter((item) => !selectedItems.includes(item))
                        .map((tag) => (
                          <li
                            onClick={() => {
                              if (!selectedItems.includes(tag)) {
                                setSelectedItems([...selectedItems, tag]);
                              }
                              handleOfferingSuggestedTag(tag);
                            }}
                            key={tag}
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
        </Col>
      </Row>
    </>
  );
}

export default FormTwo;
