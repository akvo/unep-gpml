import React from "react";
import {
  Col,
  Row,
  Button,
  Typography,
  Form,
  Input,
  Select,
  Upload,
  Checkbox,
} from "antd";
const { Title, Link } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;
import {
  LinkedinOutlined,
  TwitterOutlined,
  InboxOutlined,
} from "@ant-design/icons";

function FormFour({ handleOnClickBtnBack, handleOnClickBtnNext }) {
  const [form] = Form.useForm();
  return (
    <div className="ui container step-form step-form-final">
      <Row justify="center" align="middle">
        <Col span={24}>
          <div className="text-wrapper">
            <Title level={2}>
              Finally, please tell us a little more about yourself!
            </Title>
          </div>
          <Form form={form} layout="vertical">
            <Form.Item label="Bio" name="jobTitle">
              <TextArea
                placeholder="About yourself (Max 100 words)"
                maxLength={100}
                style={{ height: 120, padding: "10px 11px" }}
              />
            </Form.Item>
            <Form.Item
              label={
                <p>
                  Linkedin <span>OPTIONAL</span>
                </p>
              }
              name="linkedin"
            >
              <Input
                placeholder="Your linkedin username"
                prefix={<LinkedinOutlined />}
              />
            </Form.Item>
            <Form.Item
              label={
                <p>
                  Twitter <span>OPTIONAL</span>
                </p>
              }
              name="linkedin"
            >
              <Input
                placeholder="Your twitter username"
                prefix={<TwitterOutlined />}
              />
            </Form.Item>
            <Form.Item
              label={
                <p>
                  CV / Portfolio <span>OPTIONAL</span>
                </p>
              }
              name="photo"
            >
              <Dragger>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Drag file here</p>
                <p className="ant-upload-hint">
                  <span>or</span> Browse your computer
                </p>
              </Dragger>
            </Form.Item>
            <Form.Item style={{ paddingTop: 20 }}>
              <Checkbox>
                By submitting this form, I will be included in the public
                database of GPML Digital Platform members and acknowledge that
                the provided information will be made public and used to find
                and connect via smart-matchmaking functionalities with other
                stakeholders and resources.
              </Checkbox>
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <Row className="button-bottom-panel">
        <Button className="step-button-back" onClick={handleOnClickBtnBack}>
          {"<"} Back
        </Button>
        <Button className="step-button-next" onClick={handleOnClickBtnNext}>
          Submit {">"}
        </Button>
      </Row>
    </div>
  );
}

export default FormFour;
