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
import FormLabel from '../../components/form-label'
import { Trans, t } from '@lingui/macro'

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
              <FormLabel
                label={<Trans>Short Bio</Trans>}
                for="about"
                meta={meta}
              >
                <TextArea
                  onChange={(e) => input.onChange(e.target.value)}
                  placeholder={t`Max 500 letters`}
                  maxLength={500}
                  className={`${
                    meta.touched && meta.error ? 'ant-input-status-error' : ''
                  }`}
                />
              </FormLabel>
            </div>
          )}
        </Field>
        <Row gutter={16}>
          <Col sm={24} md={12}>
            <Field name="linkedin">
              {({ input, meta }) => (
                <FormLabel
                  for="linkedin"
                  label={<Trans>Linkedin</Trans>}
                  meta={meta}
                  isOptional
                >
                  <Input
                    size="small"
                    onChange={(e) => input.onChange(e.target.value)}
                    placeholder="Username"
                    prefix={<LinkedinOutlined />}
                  />{' '}
                </FormLabel>
              )}
            </Field>
          </Col>
          <Col sm={24} md={12}>
            <Field name="twitter">
              {({ input, meta }) => (
                <FormLabel
                  for="twitter"
                  label={<Trans>Twitter</Trans>}
                  meta={meta}
                  isOptional
                >
                  <Input
                    size="small"
                    onChange={(e) => input.onChange(e.target.value)}
                    placeholder="Username"
                    prefix={<TwitterOutlined />}
                  />
                </FormLabel>
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
                    <p>
                      <Trans>CV / Portfolio</Trans>
                    </p>{' '}
                    <span style={{ paddingLeft: '20px' }}>
                      <Trans>(OPTIONAL)</Trans>
                    </span>
                  </div>
                </label>
              </div>
              <br />
              <Upload>
                <Button size="small">
                  <Trans>Click to Upload</Trans>
                  <UploadOutlined />
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
                  <Trans>
                    By submitting this form, I will be included in the public
                    database of GPML Digital Platform members and acknowledge
                    that the provided information will be made public and used
                    to find and connect via smart-matchmaking functionalities
                    with other stakeholders and resources.
                  </Trans>
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
