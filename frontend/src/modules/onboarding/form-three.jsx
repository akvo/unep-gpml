import React from "react";
import { UIStore } from "../../store";
import { Col, Row, Button, Typography, Form, Input, Select, List } from "antd";
const { Title, Link } = Typography;

function FormThree({}) {
  const [form] = Form.useForm();

  const storeData = UIStore.useState((s) => ({
    entitySuggestedTags: s.entitySuggestedTags,
  }));

  const { entitySuggestedTags } = storeData;

  return (
    <>
      <Row justify="center" align="middle">
        <Col span={24}>
          <div className="text-wrapper">
            <Title level={2}>
              What are the expertises you are looking for?
            </Title>
          </div>
          <Form form={form} layout="vertical">
            <Form.Item name="entity">
              <Select placeholder="Search expertises" allowClear showSearch>
                <Option value="male">male</Option>
                <Option value="female">female</Option>
                <Option value="other">other</Option>
              </Select>
            </Form.Item>
          </Form>
          <div className="list tag-list">
            <h5>Suggested tags</h5>
            <List itemLayout="horizontal">
              <List.Item>
                <List.Item.Meta
                  title={
                    <ul>
                      {entitySuggestedTags.map((tag) => (
                        <li key={tag}>{tag}</li>
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
