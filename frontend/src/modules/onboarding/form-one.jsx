import React from "react";
import { Col, Row, Button, Typography, Form, Input, Select } from "antd";
const { Title, Link } = Typography;

function FormOne({ handleOnClickBtnBack, handleOnClickBtnNext }) {
  const [form] = Form.useForm();
  return (
    <>
      <Row justify="center" align="middle">
        <Col span={24}>
          <div className="text-wrapper">
            <Title level={2}>Enter your entity and job title</Title>
          </div>
          <Form form={form} layout="vertical">
            <Form.Item name="jobTitle" style={{ paddingBottom: 30 }}>
              <Input placeholder="Enter job title" />
            </Form.Item>
            <Form.Item name="entity">
              <Select
                placeholder="Enter the name of your entity"
                allowClear
                showSearch
              >
                <Option value="male">male</Option>
                <Option value="female">female</Option>
                <Option value="other">other</Option>
              </Select>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </>
  );
}

export default FormOne;
