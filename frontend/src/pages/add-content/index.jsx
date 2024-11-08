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
  notification,
  Form as AntForm,
} from 'antd'
import styles from './index.module.scss'
import { PlusIcon, UploadFileIcon } from '../../components/icons'
import FormLabel from '../../components/form-label'
import { Trans } from '@lingui/macro'
import { UIStore } from '../../store'
import DatePicker from 'antd/lib/date-picker'
import moment from 'moment'
import api from '../../utils/api'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { lifecycleStageTags } from '../../utils/misc'

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
      [{ name: 'url', span: 24 }],
      [{ name: 'title', span: 24, required: true }],
      [{ name: 'summary', span: 24, required: true }],
      [{ name: 'geoCoverageType', span: 24, required: true }],
      [
        {
          name: 'geoCoverageValueTransnational',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
      ],
      [
        {
          name: 'geoCoverageCountries',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'national',
          },
        },
      ],
      [
        { name: 'tags', span: 12, required: true },
        { name: 'lifecycleStage', span: 12 },
      ],
      [
        { name: 'image', span: 12 },
        { name: 'thumbnail', span: 12 },
      ],
      [
        { name: 'gallery', span: 12 },
        {
          name: 'videos',
          label: 'Videos',
          span: 12,
          required: true,
          initialValue: [''],
        },
      ],
      [
        { name: 'donors', span: 12, required: true },
        { name: 'partners', span: 12 },
      ],
      [{ name: 'implementors', span: 12, required: true }],
      [
        { name: 'startDate', label: 'YYYY-MM-DD', span: 12 },
        {
          name: 'endDate',
          label: 'YYYY-MM-DD',
          span: 12,
        },
      ],
      [
        { name: 'background', span: 12, required: true },
        { name: 'purpose', span: 12, required: true },
      ],
      [{ name: 'highlights', span: 24, initialValue: [{ text: '', url: '' }] }],
      [{ name: 'outcomes', span: 24, required: true, initialValue: [''] }],
    ],
  },
  Legislation: {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'title', span: 24 }],
      [{ name: 'summary', span: 24 }],
      [{ name: 'geoCoverageType', span: 12 }],
      [
        {
          name: 'geoCoverageValueTransnational',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
      ],
      [
        {
          name: 'geoCoverageCountries',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'national',
          },
        },
      ],
      [
        { name: 'tags', span: 12 },
        { name: 'lifecycleStage', span: 12 },
      ],
      [{ name: 'image', span: 12 }],
    ],
  },
  'Technical Resource': {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'title', span: 24, required: true }],
      [{ name: 'summary', span: 24, required: true }],
      [{ name: 'geoCoverageType', span: 12, required: true }],
      [
        {
          name: 'geoCoverageValueTransnational',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
      ],
      [
        {
          name: 'geoCoverageCountries',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'national',
          },
        },
      ],
      [
        { name: 'lifecycleStage', span: 12, required: true },
        { name: 'tags', span: 12, required: true },
      ],
      [
        { name: 'image', span: 12, required: true },
        { name: 'thumbnail', span: 12 },
      ],
      [
        { name: 'owner', span: 12, required: true },
        { name: 'partners', span: 12 },
      ],
      [
        {
          name: 'publicationYear',
          span: 12,
          label: 'Publication Year',
          required: true,
        },
      ],
    ],
  },
  'Financing Resource': {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'title', span: 24, required: true }],
      [{ name: 'summary', span: 24, required: true }],
      [{ name: 'geoCoverageType', span: 12, required: true }],
      [
        {
          name: 'geoCoverageValueTransnational',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
      ],
      [
        {
          name: 'geoCoverageCountries',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'national',
          },
        },
      ],
      [
        { name: 'lifecycleStage', span: 12, required: true },
        { name: 'tags', span: 12, required: true },
      ],
      [
        { name: 'image', span: 12, required: true },
        { name: 'thumbnail', span: 12 },
      ],
      [
        { name: 'owner', span: 12, required: true },
        { name: 'partners', span: 12 },
      ],
      [
        { name: 'value', span: 12 },
        { name: 'valueCurrency', span: 12 },
      ],
      [
        { name: 'validFrom', label: 'YYYY-MM-DD', span: 12 },
        {
          name: 'validTo',
          label: 'YYYY-MM-DD Leave empty if ongoing',
          span: 12,
        },
      ],
    ],
  },
  'Action Plan': {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'title', span: 24, required: true }],
      [{ name: 'summary', span: 24, required: true }],
      [{ name: 'geoCoverageType', span: 12, required: true }],
      [
        {
          name: 'geoCoverageValueTransnational',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
      ],
      [
        {
          name: 'geoCoverageCountries',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'national',
          },
        },
      ],
      [
        { name: 'lifecycleStage', span: 12, required: true },
        { name: 'tags', span: 12, required: true },
      ],
      [
        { name: 'image', span: 12, required: true },
        { name: 'thumbnail', span: 12 },
      ],
      [
        { name: 'owner', span: 12, required: true },
        { name: 'partners', span: 12 },
      ],
      [
        {
          name: 'publicationYear',
          span: 12,
          label: 'Publication Year',
          required: true,
        },
      ],
      [
        { name: 'validFrom', label: 'YYYY-MM-DD', span: 12 },
        {
          name: 'validTo',
          label: 'YYYY-MM-DD Leave empty if ongoing',
          span: 12,
        },
      ],
    ],
  },
  Technology: {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'name', span: 24, required: true, label: 'Title' }],
      [{ name: 'remarks', span: 24, required: true, label: 'Description' }],
      [{ name: 'geoCoverageType', span: 12, required: true }],
      [
        {
          name: 'geoCoverageValueTransnational',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
      ],
      [
        {
          name: 'geoCoverageCountries',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'national',
          },
        },
      ],
      [
        { name: 'lifecycleStage', span: 12, required: true },
        { name: 'tags', span: 12, required: true },
      ],
      [
        { name: 'image', span: 12, required: true },
        { name: 'thumbnail', span: 12 },
      ],
      [
        { name: 'owner', span: 12, required: true },
        { name: 'partners', span: 12 },
      ],
      [{ name: 'yearFounded', span: 12, label: 'Year Founded' }],
    ],
  },
  Legislation: {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'name', span: 24, required: true, label: 'Title' }],
      [{ name: 'abstract', span: 24, required: true, label: 'Description' }],
      [{ name: 'geoCoverageType', span: 12, required: true }],
      [
        {
          name: 'geoCoverageValueTransnational',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
      ],
      [
        {
          name: 'geoCoverageCountries',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'national',
          },
        },
      ],
      [
        { name: 'lifecycleStage', span: 12, required: true },
        { name: 'tags', span: 12, required: true },
      ],
      [
        { name: 'image', span: 12, required: true },
        { name: 'thumbnail', span: 12 },
      ],
      [
        { name: 'owner', span: 12, required: true },
        { name: 'partners', span: 12 },
      ],
    ],
  },
  Dataset: {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'title', span: 24, required: true, label: 'Title' }],
      [{ name: 'summary', span: 24, required: true, label: 'Description' }],
      [{ name: 'geoCoverageType', span: 12, required: true }],
      [
        {
          name: 'geoCoverageValueTransnational',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
      ],
      [
        {
          name: 'geoCoverageCountries',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'national',
          },
        },
      ],
      [
        { name: 'lifecycleStage', span: 12, required: true },
        { name: 'tags', span: 12, required: true },
      ],
      [
        { name: 'image', span: 12, required: true },
        { name: 'thumbnail', span: 12 },
      ],
      [
        { name: 'owner', span: 12, required: true },
        { name: 'partners', span: 12 },
      ],
    ],
  },
  Event: {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'title', span: 24, required: true, label: 'Title' }],
      [{ name: 'description', span: 24, required: true, label: 'Description' }],
      [{ name: 'geoCoverageType', span: 12, required: true }],
      [
        {
          name: 'geoCoverageValueTransnational',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
      ],
      [
        {
          name: 'geoCoverageCountries',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'national',
          },
        },
      ],
      [
        { name: 'lifecycleStage', span: 12, required: true },
        { name: 'tags', span: 12, required: true },
      ],
      [
        { name: 'image', span: 12, required: true },
        { name: 'thumbnail', span: 12 },
      ],
      [
        { name: 'owner', span: 12, required: true },
        { name: 'partners', span: 12 },
      ],
      [
        { name: 'startDate', label: 'YYYY-MM-DD', span: 12, required: true },
        {
          name: 'endDate',
          label: 'YYYY-MM-DD',
          span: 12,
          required: true,
        },
      ],
      [
        {
          name: 'eventType',
          label: 'Event Type',
          span: 24,
          required: true,
        },
      ],
      [
        {
          name: 'registrationUrl',
          label: 'Registration URL',
          span: 24,
        },
        { name: 'recording', span: 24, label: 'Recording URL' },
      ],
    ],
  },
}

// Default configuration
const defaultConfig = {
  rows: [
    [{ name: 'url', span: 24, required: true }],
    [{ name: 'title', span: 24, required: true }],
    [{ name: 'summary', span: 24, required: true }],
    [{ name: 'geoCoverageType', span: 12, required: true }],
    [
      { name: 'tags', span: 12, required: true },
      { name: 'lifecycleStage', span: 12 },
    ],
    [{ name: 'image', span: 12 }],
  ],
}

// Select options
const selectOptions = {
  geoCoverageType: [
    { key: 'Global', value: 'global' },
    { key: 'Transnational', value: 'transnational' },
    { key: 'National', value: 'national' },
  ],
  lifecycleStage: lifecycleStageTags,
  tags: ['Health', 'Technology', 'Environment'],
  eventType: [
    'webinars/seminars',
    'workshops',
    'conferences',
    'courses/training',
    'campaigns/awareness raising',
  ],
}

const getSelectOptions = (storeData) => ({
  geoCoverageType: [
    ...(storeData.countries || []),
    ...(storeData.regionOptions || []),
    ...(storeData.transnationalOptions || []),
  ],
  tags: storeData.tags || [],
  currencies: storeData.currencies || [],
  owner: [
    ...(storeData.organisations || []),
    ...(storeData.nonMemberOrganisations || []),
  ],
})

const FormField = ({ name, input, meta, storeData, form, label }) => {
  const tags = Object.keys(getSelectOptions(storeData).tags)
    .map((k) => getSelectOptions(storeData).tags[k])
    .flat()

  const entity = getSelectOptions(storeData).owner || []

  const currenciesList = getSelectOptions(storeData).currencies?.map((x) => ({
    id: x.value,
    label: x.label,
  }))

  const renderFieldContent = () => {
    switch (name) {
      case 'title':
      case 'name':
      case 'summary':
      case 'description':
      case 'remarks':
      case 'abstract':
      case 'background':
      case 'purpose':
      case 'url':
      case 'registrationUrl':
      case 'recording':
        const optionalFields = {
          url: true,
        }
        return (
          <FormLabel
            label={label ? label : name.charAt(0).toUpperCase() + name.slice(1)}
            htmlFor={name}
            meta={meta}
            isOptional={optionalFields[name]}
          >
            {name === 'summary' ||
            name === 'remarks' ||
            name === 'abstract' ||
            name === 'description' ||
            name === 'purpose' ||
            name === 'background' ? (
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

      case 'value':
        return (
          <FormLabel label="Value Amount" htmlFor="value" meta={meta}>
            <Input
              {...input}
              type="number"
              className={`${
                meta.touched && meta.error && !meta.valid
                  ? 'ant-input-status-error'
                  : ''
              }`}
            />
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
              onChange={(value) => {
                input.onChange(value)
                form.change('geoCoverageValueTransnational', undefined)
                form.change('geoCoverageCountries', undefined)
              }}
              onBlur={input.onBlur}
              placeholder="Select Geo-coverage type"
              className={
                meta.touched && !meta.valid ? 'ant-input-status-error' : ''
              }
            >
              {selectOptions.geoCoverageType.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  <Trans>{opt.key}</Trans>
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

      case 'geoCoverageValueTransnational':
        return (
          <FormLabel
            label="GEO COVERAGE (Transnational)"
            htmlFor="geoCoverageValueTransnational"
            meta={meta}
          >
            <Select
              {...input}
              size="small"
              value={input.value || undefined}
              allowClear
              placeholder="Select transnational "
              className={
                meta.touched && !meta.valid ? 'ant-input-status-error' : ''
              }
            >
              {storeData.transnationalOptions.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {opt.name}
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

      case 'geoCoverageCountries':
        return (
          <FormLabel
            label="GEO COVERAGE (Countries)"
            htmlFor="geoCoverageCountries"
            meta={meta}
          >
            <Select
              {...input}
              size="small"
              mode="multiple"
              value={input.value || []}
              allowClear
              placeholder="Select countries"
              className={
                meta.touched && !meta.valid ? 'ant-input-status-error' : ''
              }
            >
              {storeData.countries.map((country) => (
                <Option key={country.id} value={country.id}>
                  {country.name}
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

      case 'valueCurrency':
        return (
          <FormLabel label="Value Currency" htmlFor="valueCurrency" meta={meta}>
            <Select
              {...input}
              size="small"
              value={input.value ? input.value : []}
              allowClear
              onChange={input.onChange}
              onBlur={input.onBlur}
              placeholder="Select value currency"
              className={
                meta.touched && !meta.valid ? 'ant-input-status-error' : ''
              }
            >
              {currenciesList?.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  <Trans>{opt.label}</Trans>
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

      case 'eventType':
        return (
          <FormLabel label="Event Type" htmlFor="eventType" meta={meta}>
            <Select
              {...input}
              size="small"
              value={input.value || undefined}
              allowClear
              onChange={input.onChange}
              onBlur={input.onBlur}
              placeholder="Select event type"
              className={
                meta.touched && !meta.valid ? 'ant-input-status-error' : ''
              }
            >
              {selectOptions.eventType.map((type) => (
                <Option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
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
              filterOption={(input, option) =>
                (option?.children?.toString() ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
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
          <FormLabel
            label="Lifecycle Stage"
            htmlFor="lifecycleStage"
            meta={meta}
          >
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
              {selectOptions.lifecycleStage.map((opt) => (
                <Option key={opt} value={opt}>
                  <Trans>{opt}</Trans>
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

      case 'image':
        return (
          <FormLabel label="Photo" htmlFor="image" meta={meta}>
            <Dragger
              {...input}
              beforeUpload={() => false}
              onChange={async ({ file, fileList }) => {
                try {
                  if (file) {
                    const base64 = await getBase64(file)
                    input.onChange(base64)
                  }
                } catch (err) {
                  console.error('Error converting to base64:', err)
                  input.onChange(null)
                }
              }}
              multiple={false}
              accept=".jpg,.png"
            >
              <p className="ant-upload-drag-icon">
                <UploadFileIcon />
              </p>
              <p className="ant-upload-text">Accepts .jpg and .png</p>
              <p className="add-btn">Add a File</p>
            </Dragger>{' '}
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

      case 'gallery':
        return (
          <FormLabel label="Gallery" htmlFor="gallery" meta={meta}>
            <Dragger
              {...input}
              beforeUpload={() => false}
              onChange={async ({ file, fileList }) => {
                try {
                  if (file) {
                    const base64 = await getBase64(file)
                    input.onChange(base64)
                  }
                } catch (err) {
                  console.error('Error converting to base64:', err)
                  input.onChange(null)
                }
              }}
              multiple={true}
              accept=".jpg,.png"
            >
              <p className="ant-upload-drag-icon">
                <UploadFileIcon />
              </p>
              <p className="ant-upload-text">Accepts .jpg and .png</p>
              <p className="add-btn">Add a File</p>
            </Dragger>{' '}
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

      case 'thumbnail':
        return (
          <FormLabel
            label="Cover Thumbnail -  portrait format 300x400"
            htmlFor="thumbnail"
            meta={meta}
            isOptional={true}
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
              filterOption={(input, option) =>
                (option?.children?.toString() ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
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
      case 'donors':
      case 'implementors':
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
              filterOption={(input, option) =>
                (option?.children?.toString() ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
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
      case 'yearFounded':
        return (
          <FormLabel label={label ? label : name} htmlFor={name}>
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

      case 'validFrom':
      case 'validTo':
      case 'startDate':
      case 'endDate':
        return (
          <FormLabel
            label={name
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase())}
            htmlFor={name}
            meta={meta}
          >
            <DatePicker
              {...input}
              size="small"
              className={
                meta.touched && !meta.valid ? 'ant-input-status-error' : ''
              }
              placeholder={label ? label : name}
              value={input.value ? moment(input.value) : undefined}
              onChange={(date) =>
                input.onChange(date ? date.format('YYYY-MM-DD') : null)
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

      case 'highlights':
        return (
          <FormLabel
            label="Key highlights (Optional)"
            htmlFor="keyHighlights"
            meta={meta}
          >
            <Field name="highlights">
              {({ input: { value = [], onChange } }) => (
                <div className="highlights-wrapper">
                  {(value || []).map((item, index) => (
                    <div key={index} className="highlights-input">
                      <Input
                        value={item.text || ''}
                        onChange={(e) => {
                          const newValue = [...value]
                          newValue[index] = {
                            ...newValue[index],
                            text: e.target.value,
                          }
                          onChange(newValue)
                        }}
                        placeholder="Enter highlight text"
                      />
                      <Input
                        value={item.url || ''}
                        onChange={(e) => {
                          const newValue = [...value]
                          newValue[index] = {
                            ...newValue[index],
                            url: e.target.value,
                          }
                          onChange(newValue)
                        }}
                        placeholder="Link to PDF, document, video, etc"
                      />
                      {index !== 0 && (
                        <Button
                          onClick={() => {
                            const newValue = value.filter((_, i) => i !== index)
                            onChange(newValue)
                          }}
                          type="link"
                        >
                          <DeleteOutlined />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="link"
                    onClick={() =>
                      onChange([...(value || []), { text: '', url: '' }])
                    }
                  >
                    <div className="icn">
                      <PlusIcon />
                    </div>
                    <Trans>Add Another</Trans>{' '}
                  </Button>
                </div>
              )}
            </Field>
          </FormLabel>
        )

      case 'outcomes':
      case 'videos':
        return (
          <FormLabel
            label={name === 'videos' ? 'Videos' : 'Expected outcomes'}
            htmlFor={name}
            meta={meta}
          >
            <Field name={name}>
              {({ input: { value = [], onChange } }) => (
                <div className="highlights-wrapper">
                  {(value || []).map((item, index) => (
                    <div key={index} className="highlights-input">
                      <Input
                        value={item || ''}
                        onChange={(e) => {
                          const newValue = [...(value || [])]
                          newValue[index] = e.target.value
                          onChange(newValue)
                        }}
                        placeholder={
                          name === 'videos'
                            ? 'YouTube URL'
                            : 'Enter expected outcome'
                        }
                      />

                      {index !== 0 && (
                        <Button
                          onClick={() => {
                            const newValue = value.filter((_, i) => i !== index)
                            onChange(newValue)
                          }}
                          type="link"
                        >
                          <DeleteOutlined />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="link"
                    onClick={() => onChange([...(value || []), ''])}
                  >
                    <div className="icn">
                      <PlusIcon />
                    </div>
                    <Trans>Add Another</Trans>{' '}
                  </Button>
                </div>
              )}
            </Field>
          </FormLabel>
        )

      default:
        return null
    }
  }

  return <div className="mb-4">{renderFieldContent()}</div>
}

const FormFields = ({ selectedType, storeData, form }) => {
  const config = formConfigs[selectedType] || defaultConfig

  return (
    <div className="space-y-4">
      <Field name="geoCoverageType">
        {({ input: { value: geoType } }) =>
          config.rows.map((row, rowIndex) => (
            <Row key={rowIndex} gutter={16}>
              {row.map(({ name, span, label }) => {
                if (
                  (name === 'geoCoverageValueTransnational' &&
                    geoType !== 'transnational') ||
                  (name === 'geoCoverageCountries' && geoType !== 'national')
                ) {
                  return null
                }

                return (
                  <Col key={name} span={span}>
                    <Field name={name}>
                      {({ input, meta }) => (
                        <FormField
                          name={name}
                          input={input}
                          meta={meta}
                          storeData={storeData}
                          form={form}
                          label={label}
                        />
                      )}
                    </Field>
                  </Col>
                )
              })}
            </Row>
          ))
        }
      </Field>
    </div>
  )
}

const DynamicContentForm = () => {
  const [selectedType, setSelectedType] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const onSubmit = (values, form) => {
    setLoading(true)
    const cleanValues = Object.fromEntries(
      Object.entries(values).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    )

    const entityConnections = [
      ...(values.owner?.map((id) => ({ role: 'owner', entity: id })) || []),
      ...(values.implementors?.map((id) => ({
        role: 'implementor',
        entity: id,
      })) || []),
      ...(values.donors?.map((id) => ({ role: 'donor', entity: id })) || []),
      ...(values.partners?.map((id) => ({ role: 'partner', entity: id })) ||
        []),
    ]

    const storeTags = Object.keys(getSelectOptions(storeData).tags)
      .map((k) => getSelectOptions(storeData).tags[k])
      .flat()

    const formattedTags = [...values.tags, ...values.lifecycleStage]?.map(
      (x) => {
        if (typeof x === 'number') {
          const tagInfo = storeTags.find((t) => t.id === x)
          return {
            id: x,
            ...(tagInfo && { tag: tagInfo.tag }),
          }
        } else {
          return {
            tag: x,
            ...(storeTags.find((o) => o.tag === x) && {
              id: storeTags.find((o) => o.tag === x)?.id,
            }),
          }
        }
      }
    )

    const data = {
      ...cleanValues,
      resourceType: selectedType === 'Dataset' ? 'Data Catalog' : selectedType,
      entityConnections,
      source: 'gpml',
      tags: formattedTags,
      ...(cleanValues.geoCoverageValueTransnational && {
        geoCoverageValueTransnational: [
          cleanValues.geoCoverageValueTransnational,
        ],
      }),
      ...(cleanValues.geoCoverageCountries && {
        geoCoverageCountries: cleanValues.geoCoverageCountries,
      }),
      ...(cleanValues.validFrom && {
        validTo: cleanValues.validTo ? cleanValues.validTo : 'ongoing',
      }),
      ...(cleanValues.value && {
        value: Number(cleanValues.value),
      }),
      ...(cleanValues.yearFounded && {
        yearFounded: Number(cleanValues.yearFounded),
      }),
      language: 'en',
    }

    delete data.lifecycleStage
    delete data.owner
    delete data.partners

    if (selectedType === 'Technology') {
      return handleOnSubmitTechnology(data, form)
    }

    if (selectedType === 'Legislation') {
      return handleOnSubmitPolicy(data, form)
    }

    if (selectedType === 'Project') {
      return handleOnSubmitProject(data, form)
    }

    if (selectedType === 'Event') {
      return handleOnSubmitEvent(data, form)
    }

    api
      .post('/resource', data)
      .then((res) => {
        notification.success({ message: 'Resource successfully created' })
        form.reset()
        setSelectedType(null)
      })
      .catch(() => {
        notification.error({ message: 'An error occured' })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const validate = (values) => {
    const config = formConfigs[selectedType] || defaultConfig
    const errors = {}
    if (!config) return errors

    config.rows.flat().forEach((field) => {
      if (field.dependsOn) {
        if (
          values[field.dependsOn.field] === field.dependsOn.value &&
          field.required &&
          !values[field.name]
        ) {
          errors[field.name] = 'Required'
        }
      } else if (field.required && !values[field.name]) {
        errors[field.name] = 'Required'
      }
    })

    return errors
  }

  const handleOnSubmitTechnology = (data, form) => {
    delete data.resourceType
    delete data.image
    data.version = 2
    data.subContentType = ''
    data.individualConnections = []

    api
      .post('/technology', data)
      .then((res) => {
        notification.success({ message: 'Resource successfully created' })
        form.reset()
        setSelectedType(null)
      })
      .catch(() => {
        notification.error({ message: 'An error occured' })
      })
      .finally(() => {
        setLoading(false)
      })

    return true
  }

  const handleOnSubmitPolicy = (data, form) => {
    delete data.resourceType
    delete data.image
    data.version = 2
    data.subContentType = 'Bans and Restrictions'
    data.individualConnections = []

    api
      .post('/policy', data)
      .then((res) => {
        notification.success({ message: 'Resource successfully created' })
        form.reset()
        setSelectedType(null)
      })
      .catch(() => {
        notification.error({ message: 'An error occured' })
      })
      .finally(() => {
        setLoading(false)
      })

    return true
  }

  const handleOnSubmitProject = (data, form) => {
    console.log(data)
    return
    // delete data.resourceType
    // delete data.image
    // data.version = 2
    // data.subContentType = 'Bans and Restrictions'
    // data.individualConnections = []

    api
      .post('/project', data)
      .then((res) => {
        notification.success({ message: 'Resource successfully created' })
        form.reset()
        setSelectedType(null)
      })
      .catch(() => {
        notification.error({ message: 'An error occured' })
      })
      .finally(() => {
        setLoading(false)
      })

    return true
  }

  const handleOnSubmitEvent = (data, form) => {
    delete data.highlights
    delete data.outcomes
    delete data.videos

    api
      .post('/event', data)
      .then((res) => {
        notification.success({ message: 'Resource successfully created' })
        form.reset()
        setSelectedType(null)
      })
      .catch(() => {
        notification.error({ message: 'An error occured' })
      })
      .finally(() => {
        setLoading(false)
      })

    return true
  }

  return (
    <div className={styles.addContentForm}>
      <div className="container">
        <div className="ant-form ant-form-vertical">
          <Form
            onSubmit={(values, form) => onSubmit(values, form)}
            validate={validate}
            initialValues={{
              highlights: [{ text: '', url: '' }],
              outcomes: [''],
              videos: [''],
            }}
            render={({ handleSubmit, form }) => (
              <form onSubmit={handleSubmit}>
                <Title className="title" level={3}>
                  Add Content
                </Title>

                {!selectedType && (
                  <div className="form-description">
                    <p>
                      The GPML Digital Platform is crowdsourced and allows
                      everyone to submit new content via this form.
                    </p>
                    <p>
                      A wide range of resources can be submitted, and these
                      include Action Plans, Initiatives, Technical resources,
                      Financing resources, Policies, Events, and Technologies.
                      Learn more about each category and sub-categories
                      definitions in the "Content Type" section of this form. A
                      quick summary sheet with categories and sub-categories can
                      be downloaded here.
                    </p>
                    <p>
                      You can access existing content via the Knowledge Exchange
                      Library. Make sure to browse around and leave a review
                      under the resources you enjoy the most!
                    </p>
                  </div>
                )}

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
                    <>
                      <Card className="mt-8">
                        <Title className="form-title" level={4}>
                          All details of the {selectedType.toLowerCase()}
                        </Title>
                        <FormFields
                          selectedType={selectedType}
                          storeData={storeData}
                          form={form}
                        />
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          disabled={loading}
                          className="submit-btn"
                        >
                          Save & Publish
                        </Button>
                      </Card>
                    </>
                  )}
                </Space>
              </form>
            )}
          />
        </div>
      </div>
    </div>
  )
}

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

export default DynamicContentForm
