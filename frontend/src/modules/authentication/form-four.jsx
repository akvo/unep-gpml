import React from "react";
import { Col, Row, Button, Typography, Form, Input, Select } from "antd";
const { Title, Link } = Typography;

function FormFour({ handleOnClickBtnBack, handleOnClickBtnNext }) {
  const [form] = Form.useForm();
  return (
    <div className="ui container step-form">
      <Row justify="center" align="middle">
        <Col span={24}>
          <div className="text-wrapper">
            <Title level={2}>
              Finally, please tell us a little more about yourself!
            </Title>
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
      <Row className="button-bottom-panel">
        <Button className="step-button-back" onClick={handleOnClickBtnBack}>
          {"<"} Back
        </Button>
        <Button className="step-button-next" onClick={handleOnClickBtnNext}>
          Next {">"}
        </Button>
      </Row>
    </div>
  );
}

export default FormFour;
