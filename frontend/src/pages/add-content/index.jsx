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
import { UploadOutlined } from '@ant-design/icons'
import styles from './index.module.scss'
import { UploadFileIcon } from '../../components/icons'
import FormLabel from '../../components/form-label'
import { Trans } from '@lingui/macro'

const { Dragger } = Upload
const { Title } = Typography
const { Option } = Select

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
    fields: [
      { name: 'title', layout: 'full' },
      { name: 'description', layout: 'full' },
      { name: 'geoCoverageType', layout: 'full' },
      { name: 'tags', layout: 'half' },
      { name: 'lifecycleStage', layout: 'half' },
      { name: 'photo', layout: 'half' },
      { name: 'thumbnail', layout: 'half' },
      { name: 'owner', layout: 'half' },
      { name: 'partners', layout: 'half' },
      { name: 'publicationYear', layout: 'half' },
    ],
  },
  Legislation: {
    fields: [
      { name: 'title', layout: 'half' },
      { name: 'geoCoverageType', layout: 'half' },
      { name: 'description', layout: 'full' },
      { name: 'tags', layout: 'half' },
      { name: 'lifecycleStage', layout: 'half' },
      { name: 'photo', layout: 'full' },
    ],
  },
  // Add other content types as needed
}

// Default configuration
const defaultConfig = {
  fields: [
    { name: 'title', layout: 'half' },
    { name: 'geoCoverageType', layout: 'half' },
    { name: 'description', layout: 'full' },
    { name: 'tags', layout: 'full' },
    { name: 'photo', layout: 'full' },
  ],
}

// Select options
const selectOptions = {
  geoCoverageType: ['Global', 'Transnational', 'National'],
  lifecycleStage: ['Design', 'Implementation', 'Evaluation'],
  tags: ['Health', 'Technology', 'Environment'],
}

const FormField = ({ name, input, meta }) => {
  const renderFieldContent = () => {
    switch (name) {
      case 'title':
      case 'description':
        return (
          <FormLabel
            label={name.charAt(0).toUpperCase() + name.slice(1)}
            htmlFor={name}
          >
            {name === 'description' ? (
              <Input.TextArea {...input} rows={4} />
            ) : (
              <Input {...input} />
            )}
          </FormLabel>
        )

      case 'geoCoverageType':
        return (
          <FormLabel label="Geo-coverage type" htmlFor="geoCoverageType">
            <Select
              {...input}
              size="small"
              value={input.value}
              allowClear
              onChange={input.onChange}
              onBlur={input.onBlur}
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
          </FormLabel>
        )

      case 'tags':
        return (
          <FormLabel label="Tags" htmlFor="tags">
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
              {selectOptions.tags.map((opt) => (
                <Option key={opt} value={opt}>
                  <Trans>{opt}</Trans>
                </Option>
              ))}
            </Select>
          </FormLabel>
        )

      case 'lifecycleStage':
        return (
          <FormLabel label="Lifecycle Stage" htmlFor="lifecycleStage">
            <Select
              {...input}
              size="small"
              value={input.value}
              allowClear
              onChange={input.onChange}
              onBlur={input.onBlur}
              className={
                meta.touched && !meta.valid ? 'ant-input-status-error' : ''
              }
            >
              {selectOptions.lifecycleStage.map((opt) => (
                <Option key={opt} value={opt}>
                  <Trans>{opt}</Trans>
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
      case 'partners':
        return (
          <FormLabel
            label={name.charAt(0).toUpperCase() + name.slice(1)}
            htmlFor={name}
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
              {['Option 1', 'Option 2', 'Option 3'].map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
              ))}
            </Select>
          </FormLabel>
        )

      case 'publicationYear':
        return (
          <FormLabel label="Publication Year" htmlFor="publicationYear">
            <Input {...input} type="number" />
          </FormLabel>
        )

      default:
        return null
    }
  }

  return <div className="mb-4">{renderFieldContent()}</div>
}

const FormFields = ({ selectedType }) => {
  const config = formConfigs[selectedType] || defaultConfig

  // Group fields into rows based on layout
  const groupFieldsIntoRows = (fields) => {
    const rows = []
    let currentRow = []

    fields.forEach((field) => {
      if (field.layout === 'full') {
        if (currentRow.length > 0) {
          rows.push(currentRow)
          currentRow = []
        }
        rows.push([field])
      } else {
        currentRow.push(field)
        if (currentRow.length === 2) {
          rows.push(currentRow)
          currentRow = []
        }
      }
    })

    if (currentRow.length > 0) {
      rows.push(currentRow)
    }

    return rows
  }

  const rows = groupFieldsIntoRows(config.fields)

  return (
    <div className="space-y-4">
      {rows.map((row, rowIndex) => (
        <Row key={rowIndex} gutter={16}>
          {row.map(({ name, layout }) => (
            <Col key={name} span={layout === 'half' ? 12 : 24}>
              <Field name={name}>
                {({ input, meta }) => (
                  <FormField name={name} input={input} meta={meta} />
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

  const onSubmit = (values) => {
    console.log('Submitted values:', values)
  }

  const validate = (values) => {
    const errors = {}
    if (!values.title) errors.title = 'Required'
    if (!values.description) errors.description = 'Required'
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
                    <FormFields selectedType={selectedType} />
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
