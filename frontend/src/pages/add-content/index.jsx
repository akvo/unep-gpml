import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import {
  Button,
  Input,
  Upload,
  Card,
  Typography,
  Space,
  Select,
  Row,
  Col,
} from 'antd'
import styles from './index.module.scss'
import { UploadFileIcon } from '../../components/icons'
import FormLabel from '../../components/form-label'
import { Trans } from '@lingui/macro'
import { UIStore } from '../../store'
import DatePicker from 'antd/lib/date-picker'
import moment from 'moment'

const { Dragger } = Upload
const { Title } = Typography
const { Option } = Select

const mountedStyle = {
  animation: 'inAnimation 250ms ease-in',
}
const unmountedStyle = {
  animation: 'outAnimation 270ms ease-out',
  animationFillMode: 'forwards',
}

// Content Types
const contentTypes = [
  'Project',
  'Initiative',
  'Action Plan',
  'Legislation',
  'Financing Resource',
  'Technical Resource',
  'Technology',
  'Event',
  'Dataset',
]

// Form configurations with layout
const formConfigs = {
  Project: {
    rows: [
      [{ name: 'title', span: 24, required: true }],
      [{ name: 'description', span: 24, required: true }],
      [{ name: 'geoCoverageType', span: 24, required: true }],
      [
        { name: 'tags', span: 12, required: true },
        { name: 'lifecycleStage', span: 12 },
      ],
      [
        { name: 'photo', span: 12 },
        { name: 'thumbnail', span: 12 },
      ],
      [
        { name: 'owner', span: 12, required: true },
        { name: 'partners', span: 12 },
      ],
      [{ name: 'publicationYear', span: 12 }],
    ],
  },
  Legislation: {
    rows: [
      [{ name: 'title', span: 24 }],
      [{ name: 'description', span: 24 }],
      [{ name: 'geoCoverageType', span: 12 }],
      [
        { name: 'tags', span: 12 },
        { name: 'lifecycleStage', span: 12 },
      ],
      [{ name: 'photo', span: 12 }],
    ],
  },
  'Technical Resource': {
    rows: [
      [{ name: 'title', span: 24, required: true }],
      [{ name: 'description', span: 24, required: true }],
      [{ name: 'geoCoverageType', span: 12, required: true }],
      [
        { name: 'lifecycleStage', span: 12 },
        { name: 'tags', span: 12, required: true },
      ],
      [
        { name: 'photo', span: 12 },
        { name: 'thumbnail', span: 12 },
      ],
      [
        { name: 'owner', span: 12, required: true },
        { name: 'partners', span: 12 },
      ],
      [{ name: 'publicationYear', span: 12 }],
    ],
  },
}

// Default configuration
const defaultConfig = {
  rows: [
    [{ name: 'title', span: 24, required: true }],
    [{ name: 'description', span: 24, required: true }],
    [{ name: 'geoCoverageType', span: 12, required: true }],
    [
      { name: 'tags', span: 12, required: true },
      { name: 'lifecycleStage', span: 12 },
    ],
    [{ name: 'photo', span: 12 }],
  ],
}

// Select options
const selectOptions = {
  geoCoverageType: ['Global', 'Transnational', 'National'],
  lifecycleStage: ['Design', 'Implementation', 'Evaluation'],
  tags: ['Health', 'Technology', 'Environment'],
}

const getSelectOptions = (storeData) => ({
  geoCoverageType: [
    ...(storeData.countries || []),
    ...(storeData.regionOptions || []),
    ...(storeData.transnationalOptions || []),
  ],
  lifecycleStage: ['Design', 'Implementation', 'Evaluation'],
  tags: storeData.tags || [],
  owner: [
    ...(storeData.organisations || []),
    ...(storeData.nonMemberOrganisations || []),
  ],
})

const FormField = ({ name, input, meta, storeData }) => {
  const tags = Object.keys(getSelectOptions(storeData).tags)
    .map((k) => getSelectOptions(storeData).tags[k])
    .flat()

  const entity = getSelectOptions(storeData).owner || []

  const renderFieldContent = () => {
    switch (name) {
      case 'title':
      case 'description':
        return (
          <FormLabel
            label={name.charAt(0).toUpperCase() + name.slice(1)}
            htmlFor={name}
            meta={meta}
          >
            {name === 'description' ? (
              <Input.TextArea
                {...input}
                rows={4}
                className={`${
                  meta.touched && meta.error && !meta.valid
                    ? 'ant-input-status-error'
                    : ''
                }`}
              />
            ) : (
              <Input
                {...input}
                className={`${
                  meta.touched && meta.error && !meta.valid
                    ? 'ant-input-status-error'
                    : ''
                }`}
              />
            )}{' '}
            {meta.touched && meta.error && (
              <p
                color="error"
                className="error transitionDiv"
                style={
                  meta.touched && meta.error ? mountedStyle : unmountedStyle
                }
              >
                {meta.error}
              </p>
            )}
          </FormLabel>
        )

      case 'geoCoverageType':
        return (
          <FormLabel
            label="Geo-coverage type"
            htmlFor="geoCoverageType"
            meta={meta}
          >
            <Select
              {...input}
              size="small"
              value={input.value || undefined}
              allowClear
              onChange={input.onChange}
              onBlur={input.onBlur}
              placeholder="Select Geo-coverage type"
              className={
                meta.touched && !meta.valid ? 'ant-input-status-error' : ''
              }
            >
              {selectOptions.geoCoverageType.map((opt) => (
                <Option key={opt} value={opt}>
                  <Trans>{opt}</Trans>
                </Option>
              ))}
            </Select>
            {meta.touched && meta.error && (
              <p
                color="error"
                className="error transitionDiv"
                style={
                  meta.touched && meta.error ? mountedStyle : unmountedStyle
                }
              >
                {meta.error}
              </p>
            )}
          </FormLabel>
        )

      case 'tags':
        return (
          <FormLabel label="Tags" htmlFor="tags" meta={meta}>
            <Select
              {...input}
              size="small"
              mode="multiple"
              value={input.value ? input.value : []}
              allowClear
              onChange={input.onChange}
              onBlur={input.onBlur}
              placeholder="Select at least one"
              className={
                meta.touched && !meta.valid ? 'ant-input-status-error' : ''
              }
            >
              {tags.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  <Trans>{opt.tag}</Trans>
                </Option>
              ))}
            </Select>{' '}
            {meta.touched && meta.error && (
              <p
                color="error"
                className="error transitionDiv"
                style={
                  meta.touched && meta.error ? mountedStyle : unmountedStyle
                }
              >
                {meta.error}
              </p>
            )}
          </FormLabel>
        )

      case 'lifecycleStage':
        return (
          <FormLabel label="Lifecycle Stage" htmlFor="lifecycleStage">
            <Select
              {...input}
              size="small"
              value={input.value ? input.value : []}
              allowClear
              mode="multiple"
              placeholder="Select at least one"
              onChange={input.onChange}
              onBlur={input.onBlur}
              className={
                meta.touched && !meta.valid ? 'ant-input-status-error' : ''
              }
            >
              {tags.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  <Trans>{opt.tag}</Trans>
                </Option>
              ))}
            </Select>
          </FormLabel>
        )

      case 'photo':
        return (
          <FormLabel label="Photo" htmlFor="photo">
            <Dragger
              {...input}
              beforeUpload={() => false}
              onChange={({ fileList }) => input.onChange(fileList)}
              multiple={false}
              accept=".jpg,.png"
            >
              <p className="ant-upload-drag-icon">
                <UploadFileIcon />
              </p>
              <p className="ant-upload-text">Accepts .jpg and .png</p>
              <p className="add-btn">Add a File</p>
            </Dragger>
          </FormLabel>
        )

      case 'thumbnail':
        return (
          <FormLabel
            label="Cover Thumbnail -  portrait format 300x400"
            htmlFor="thumbnail"
          >
            <Dragger
              {...input}
              beforeUpload={() => false}
              onChange={({ fileList }) => input.onChange(fileList)}
              multiple={false}
              accept=".jpg,.png"
            >
              <p className="ant-upload-drag-icon">
                <UploadFileIcon />
              </p>
              <p className="ant-upload-text">Accepts .jpg and .png</p>
              <p className="add-btn">Add a File</p>
            </Dragger>
          </FormLabel>
        )

      case 'owner':
        return (
          <FormLabel
            label={name.charAt(0).toUpperCase() + name.slice(1)}
            htmlFor={name}
            meta={meta}
          >
            <Select
              {...input}
              size="small"
              mode="multiple"
              value={input.value ? input.value : []}
              allowClear
              onChange={input.onChange}
              onBlur={input.onBlur}
              placeholder={`Select ${name}`}
              className={
                meta.touched && !meta.valid ? 'ant-input-status-error' : ''
              }
            >
              {entity.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {opt.name}
                </Option>
              ))}
            </Select>
          </FormLabel>
        )

      case 'partners':
        return (
          <FormLabel
            label={name.charAt(0).toUpperCase() + name.slice(1)}
            htmlFor={name}
            isOptional={true}
            meta={meta}
          >
            <Select
              {...input}
              size="small"
              mode="multiple"
              value={input.value ? input.value : []}
              allowClear
              onChange={input.onChange}
              onBlur={input.onBlur}
              placeholder={`Select ${name}`}
              className={
                meta.touched && !meta.valid ? 'ant-input-status-error' : ''
              }
            >
              {entity.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {opt.name}
                </Option>
              ))}
            </Select>
          </FormLabel>
        )

      case 'publicationYear':
        return (
          <FormLabel label="Publication Year" htmlFor="publicationYear">
            <DatePicker
              {...input}
              size="small"
              picker="year"
              className={
                meta.touched && !meta.valid ? 'ant-input-status-error' : ''
              }
              placeholder="Select year"
              value={input.value ? moment(input.value) : undefined}
              onChange={(date) =>
                input.onChange(date ? date.format('YYYY') : null)
              }
            />
            {meta.touched && meta.error && (
              <p
                className="error transitionDiv"
                style={
                  meta.touched && meta.error ? mountedStyle : unmountedStyle
                }
              >
                {meta.error}
              </p>
            )}
          </FormLabel>
        )

      default:
        return null
    }
  }

  return <div className="mb-4">{renderFieldContent()}</div>
}

const FormFields = ({ selectedType, storeData }) => {
  const config = formConfigs[selectedType] || defaultConfig

  return (
    <div className="space-y-4">
      {config.rows.map((row, rowIndex) => (
        <Row key={rowIndex} gutter={16}>
          {row.map(({ name, span }) => (
            <Col key={name} span={span}>
              <Field name={name}>
                {({ input, meta }) => (
                  <FormField
                    name={name}
                    input={input}
                    meta={meta}
                    storeData={storeData}
                  />
                )}
              </Field>
            </Col>
          ))}
        </Row>
      ))}
    </div>
  )
}

const DynamicContentForm = () => {
  const [selectedType, setSelectedType] = useState(null)

  const storeData = UIStore.useState((s) => ({
    stakeholders: s.stakeholders?.stakeholders,
    countries: s.countries,
    tags: s.tags,
    regionOptions: s.regionOptions,
    transnationalOptions: [
      ...s.transnationalOptions,
      { id: -1, type: 'transnational', name: 'Other', countries: [] },
    ],
    sectorOptions: s.sectorOptions,
    organisationType: s.organisationType,
    representativeGroup: s.representativeGroup,
    mainContentType: s.mainContentType,
    meaOptions: s.meaOptions,
    nonMemberOrganisations: s.nonMemberOrganisations,
    organisations: s.organisations,
    profile: s.profile,
    formStep: s.formStep,
    formEdit: s.formEdit,
    selectedMainContentType: s.selectedMainContentType,
    currencies: s.currencies,
    relatedResource: s.relatedResource,
  }))

  const onSubmit = (values) => {
    console.log('Submitted values:', values)
  }

  const validate = (values) => {
    const config = formConfigs[selectedType] || defaultConfig
    const errors = {}
    if (!config) return errors

    config.rows.flat().forEach((field) => {
      if (field.required && !values[field.name]) {
        errors[field.name] = 'Required'
      }
    })

    return errors
  }

  return (
    <div className={styles.addContentForm}>
      <div className="container">
        <Form
          onSubmit={onSubmit}
          validate={validate}
          initialValues={{}}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Title className="title" level={3}>
                Add Content
              </Title>

              <div className="form-description">
                <p>
                  The GPML Digital Platform is crowdsourced and allows everyone
                  to submit new content via this form.
                </p>
                <p>
                  A wide range of resources can be submitted, and these include
                  Action Plans, Initiatives, Technical resources, Financing
                  resources, Policies, Events, and Technologies. Learn more
                  about each category and sub-categories definitions in the
                  "Content Type" section of this form. A quick summary sheet
                  with categories and sub-categories can be downloaded here.
                </p>
                <p>
                  You can access existing content via the Knowledge Exchange
                  Library. Make sure to browse around and leave a review under
                  the resources you enjoy the most!
                </p>
              </div>

              <Space direction="vertical" size="large" className="w-full">
                <div className="form-container">
                  <Title level={4}>What type of content is this?</Title>
                  <div
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                  >
                    {contentTypes.map((type) => (
                      <Button
                        key={type}
                        className={`content-type-btn ${
                          selectedType === type ? 'selected' : ''
                        }`}
                        onClick={() =>
                          setSelectedType(selectedType === type ? null : type)
                        }
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedType && (
                  <Card className="mt-8">
                    <Title className="form-title" level={4}>
                      All details of the technical resource
                    </Title>
                    <FormFields
                      selectedType={selectedType}
                      storeData={storeData}
                    />
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="w-full mt-6"
                    >
                      Submit
                    </Button>
                  </Card>
                )}
              </Space>
            </form>
          )}
        />
      </div>
    </div>
  )
}

export default DynamicContentForm
