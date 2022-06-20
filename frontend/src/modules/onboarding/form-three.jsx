import React from "react";
import { UIStore } from "../../store";
import { Col, Row, Typography, Select, List } from "antd";
import { Field } from "react-final-form";
const { Title, Link } = Typography;

function FormThree({ handleSeekingSuggestedTag, validate }) {
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
            <Title level={2}>
              What are the expertises you are looking for?
            </Title>
          </div>
          <div className="ant-form ant-form-vertical">
            <Field name="seeking" style={{ width: "100%" }} validate={validate}>
              {({ input, meta }) => {
                return (
                  <>
                    <Select
                      placeholder="Search expertises"
                      allowClear
                      showSearch
                      mode="tags"
                      value={input.value ? input.value : undefined}
                      onChange={(value) => input.onChange(value)}
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className={`${
                        meta.touched && meta.error
                          ? "ant-input-status-error"
                          : ""
                      }`}
                    >
                      {array?.map((item) => (
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
                      {entitySuggestedTags.map((tag) => (
                        <li
                          key={tag}
                          onClick={() =>
                            handleSeekingSuggestedTag(tag.toLowerCase())
                          }
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

export default FormThree;
