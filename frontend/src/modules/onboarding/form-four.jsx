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
  FileTextOutlined,
} from "@ant-design/icons";
import { Field } from "react-final-form";

function FormFour({ validate }) {
  const [form] = Form.useForm();
  return (
    <>
      <Row justify="center" align="middle">
        <Col span={24}>
          <div className="text-wrapper">
            <Title level={2}>
              Finally, please tell us a little more about yourself!
            </Title>
          </div>
          <div className="ant-form ant-form-vertical">
            <Field name="about" validate={validate}>
              {({ input, meta }) => (
                <div className="field-wrapper">
                  <div class="ant-col ant-form-item-label">
                    <label for="about" class="" title="">
                      Bio
                    </label>
                  </div>
                  <TextArea
                    onChange={(e) => input.onChange(e.target.value)}
                    placeholder="About yourself (Max 100 words)"
                    maxLength={100}
                    style={{ height: 120, padding: "10px 11px" }}
                    className={`${
                      meta.touched && meta.error ? "ant-input-status-error" : ""
                    }`}
                  />
                </div>
              )}
            </Field>
            <Field name="linkedin">
              {({ input, meta }) => (
                <div className="field-wrapper">
                  <div class="ant-col ant-form-item-label">
                    <label for="bio" class="" title="">
                      <p>
                        Linkedin <span>OPTIONAL</span>
                      </p>
                    </label>
                  </div>
                  <Input
                    onChange={(e) => input.onChange(e.target.value)}
                    placeholder="Your linkedin username"
                    prefix={<LinkedinOutlined />}
                  />
                </div>
              )}
            </Field>
            <Field name="twitter">
              {({ input, meta }) => (
                <div className="field-wrapper">
                  <div class="ant-col ant-form-item-label">
                    <label for="twitter" class="" title="">
                      <p>
                        Twitter <span>OPTIONAL</span>
                      </p>
                    </label>
                  </div>
                  <Input
                    onChange={(e) => input.onChange(e.target.value)}
                    placeholder="Your twitter username"
                    prefix={<TwitterOutlined />}
                  />
                </div>
              )}
            </Field>
            <Field name="cv">
              {({ input, meta }) => (
                <div className="field-wrapper">
                  <div class="ant-col ant-form-item-label">
                    <label for="cv" class="" title="">
                      <p>
                        CV / Portfolio <span>OPTIONAL</span>
                      </p>
                    </label>
                  </div>
                  <Dragger>
                    <p className="ant-upload-drag-icon">
                      <FileTextOutlined />
                    </p>
                    <p className="ant-upload-text">Drag file here</p>
                    <p className="ant-upload-hint">
                      <span>or</span> Browse your computer
                    </p>
                  </Dragger>
                </div>
              )}
            </Field>
            <Field name="publicDatabase" type="checkbox" validate={validate}>
              {({ input, meta }) => (
                <div className="field-wrapper public-database">
                  <Checkbox
                    onChange={(checked) => input.onChange(checked)}
                    className={`${
                      meta.touched && meta.error ? "ant-input-status-error" : ""
                    }`}
                  />
                  <p>
                    By submitting this form, I will be included in the public
                    database of GPML Digital Platform members and acknowledge
                    that the provided information will be made public and used
                    to find and connect via smart-matchmaking functionalities
                    with other stakeholders and resources.
                  </p>
                </div>
              )}
            </Field>
          </div>
        </Col>
      </Row>
    </>
  );
}

export default FormFour;
