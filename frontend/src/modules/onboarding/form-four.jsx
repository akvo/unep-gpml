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
  UploadOutlined,
} from "@ant-design/icons";
import { Field } from "react-final-form";

function FormFour({ validate }) {
  return (
    <>
      <div className="text-wrapper">
        <Title level={2}>And lastly...</Title>
      </div>
      <div className="ant-form ant-form-vertical">
        <Field name="about" validate={validate}>
          {({ input, meta }) => (
            <div className="field-wrapper">
              <div class="ant-col ant-form-item-label">
                <label for="about" class="" title="">
                  Short Bio
                </label>
              </div>
              <TextArea
                onChange={(e) => input.onChange(e.target.value)}
                placeholder="Max 500 letters"
                maxLength={500}
                className={`${
                  meta.touched && meta.error ? "ant-input-status-error" : ""
                }`}
              />
            </div>
          )}
        </Field>
        <Row gutter={16}>
          <Col sm={24} md={12}>
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
                    placeholder="Username"
                    prefix={<LinkedinOutlined />}
                  />
                </div>
              )}
            </Field>
          </Col>
          <Col sm={24} md={12}>
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
                    placeholder="Username"
                    prefix={<TwitterOutlined />}
                  />
                </div>
              )}
            </Field>
          </Col>
        </Row>
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
              <br />
              <Upload>
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
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
              >
                <p>
                  By submitting this form, I will be included in the public
                  database of GPML Digital Platform members and acknowledge that
                  the provided information will be made public and used to find
                  and connect via smart-matchmaking functionalities with other
                  stakeholders and resources.
                </p>
              </Checkbox>
            </div>
          )}
        </Field>
      </div>
    </>
  );
}

export default FormFour;
