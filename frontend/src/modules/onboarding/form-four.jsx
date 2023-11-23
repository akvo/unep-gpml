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
import { UIStore } from '../../store'
import { SearchIcon } from '../../components/icons'

function FormFour({ validate, containsOAuthProvider }) {
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
  }))

  return (
    <>
      <div className="text-wrapper">
        <Title level={2}>And lastly...</Title>
      </div>
      <div className="ant-form ant-form-vertical">
        {containsOAuthProvider && (
          <Row gutter={16}>
            <Col sm={24} md={12}>
              <Field name="firstName" validate={validate}>
                {({ input, meta }) => (
                  <FormLabel
                    htmlFor="firstName"
                    label={<Trans>First Name</Trans>}
                    meta={meta}
                  >
                    <Input
                      size="small"
                      onChange={(e) => input.onChange(e.target.value)}
                      placeholder="First Name"
                      className={`${
                        meta.touched && meta.error
                          ? 'ant-input-status-error'
                          : ''
                      }`}
                    />{' '}
                  </FormLabel>
                )}
              </Field>
            </Col>
            <Col sm={24} md={12}>
              <Field name="lastName" validate={validate}>
                {({ input, meta }) => (
                  <FormLabel
                    htmlFor="lastName"
                    label={<Trans>Last Name</Trans>}
                    meta={meta}
                  >
                    <Input
                      size="small"
                      onChange={(e) => input.onChange(e.target.value)}
                      placeholder="Last Name"
                    />
                  </FormLabel>
                )}
              </Field>
            </Col>
            <Col sm={24} md={24}>
              <Field name="country" validate={validate}>
                {({ options, input, meta, control, ...props }) => {
                  const hasError = meta.touched && !meta.valid
                  const validVal = input?.value && meta.valid ? 'success' : null
                  const validateStatus = hasError ? 'error' : validVal
                  return (
                    <FormLabel
                      htmlFor="country"
                      label="Country"
                      meta={meta}
                      validateStatus={validateStatus}
                    >
                      <Select
                        size="small"
                        onChange={(value) => input.onChange(value)}
                        placeholder="Search Country"
                        allowClear
                        showSearch
                        virtual={false}
                        showArrow
                        suffixIcon={<SearchIcon />}
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {countries?.map((it) => (
                          <Select.Option value={it.id} key={it.id}>
                            {it.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </FormLabel>
                  )
                }}
              </Field>
            </Col>
          </Row>
        )}
        <Field name="about" validate={validate}>
          {({ input, meta }) => (
            <div className="field-wrapper">
              <FormLabel
                label={<Trans>Short Bio</Trans>}
                htmlFor="about"
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
                  htmlFor="linkedin"
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
                  htmlFor="twitter"
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
                <label htmlFor="twitter" class="" title="">
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
