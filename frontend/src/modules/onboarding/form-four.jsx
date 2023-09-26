import React from 'react'
import {
  Col,
  Row,
  Typography,
  Form,
  Input,
  Select,
  Upload,
  Checkbox,
} from 'antd'
const { Title, Link } = Typography
const { Dragger } = Upload
const { TextArea } = Input
import {
  LinkedinOutlined,
  TwitterOutlined,
  FileTextOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Field } from 'react-final-form'
import Button from '../../components/button'

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
              <div class="ant-col" style={{ paddingBottom: '4px' }}>
                <label for="about" class="input-label" title="">
                  Short Bio
                </label>
              </div>
              <TextArea
                onChange={(e) => input.onChange(e.target.value)}
                placeholder="Max 500 letters"
                maxLength={500}
                className={`${
                  meta.touched && meta.error ? 'ant-input-status-error' : ''
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
                      <div className="input-label">
                        <p>Linkedin</p> <span>(OPTIONAL)</span>
                      </div>
                    </label>
                  </div>
                  <Input
                    size="small"
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
                      <div className="input-label">
                        <p>Twitter</p> <span>(OPTIONAL)</span>
                      </div>
                    </label>
                  </div>
                  <Input
                    size="small"
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
                <label for="twitter" class="" title="">
                  <div className="input-label" style={{ width: 'auto' }}>
                    <p>CV / Portfolio</p>{' '}
                    <span style={{ paddingLeft: '20px' }}>(OPTIONAL)</span>
                  </div>
                </label>
              </div>
              <br />
              <Upload>
                <Button size="small" withArrow={<UploadOutlined />}>
                  Click to Upload
                </Button>
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
                  meta.touched && meta.error ? 'ant-input-status-error' : ''
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
  )
}

export default FormFour
