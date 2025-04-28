import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  Spin,
  Divider,
} from 'antd'
import styles from './index.module.scss'
import { PlusIcon, UploadFileIcon } from '../../components/icons'
import FormLabel from '../../components/form-label'
import { Trans, t } from '@lingui/macro'
import { UIStore } from '../../store'
import DatePicker from 'antd/lib/date-picker'
import moment, { duration } from 'moment'
import api from '../../utils/api'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { lifecycleStageTags } from '../../utils/misc'
import { useRouter } from 'next/router'
import { loadCatalog } from '../../translations/utils'
import withAuth from '../../components/withAuth'
import ModalAddEntity from '../../modules/flexible-forms/entity-modal/add-entity-modal'
import debounce from 'lodash/debounce'
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('react-rte'), {
  ssr: false, // Disable server-side rendering for the editor
})

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
  'Case Study',
]

const contentTypeMap = {
  project: 'Project',
  initiative: 'Initiative',
  action_plan: 'Action Plan',
  policy: 'Legislation',
  financing_resource: 'Financing Resource',
  technical_resource: 'Technical Resource',
  case_study: 'Case Study',
  technology: 'Technology',
  event: 'Event',
  data_catalog: 'Dataset',
}

const getKeyByValue = (value) => {
  return Object.keys(contentTypeMap).find(
    (key) => contentTypeMap[key] === value
  )
}

// Form configurations with layout
const formConfigs = {
  Project: {
    rows: [
      [{ name: 'url', span: 24 }],
      [{ name: 'title', span: 24, required: true }],
      [
        { name: 'geoCoverageType', span: 12, required: true },
        {
          name: 'geoCoverageCountryGroups',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
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
        { name: 'image', span: 12 },
        { name: 'thumbnail', span: 12 },
      ],
      [
        { name: 'gallery', span: 12 },
        {
          name: 'videos',
          label: 'Videos',
          span: 12,
          initialValue: [''],
        },
      ],
      [
        { name: 'donors', span: 12, required: true },
        { name: 'partners', span: 12 },
      ],
      [
        { name: 'implementors', span: 12, required: true },
        { name: 'owner', span: 12, required: true },
      ],
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
      [{ name: 'outcomes', span: 24, initialValue: [''] }],
      [
        { name: 'relatedContent', span: 12 },
        { name: 'infoDocs', span: 12 },
      ],
    ],
  },
  'Technical Resource': {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'title', span: 24, required: true }],
      [{ name: 'summary', span: 24, required: true, label: 'Description' }],
      [
        { name: 'geoCoverageType', span: 12, required: true },
        {
          name: 'geoCoverageCountryGroups',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
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
          name: 'publishYear',
          span: 12,
          label: 'Publication Year',
          required: true,
        },
      ],
      [
        { name: 'relatedContent', span: 12 },
        { name: 'infoDocs', span: 12 },
      ],
    ],
  },
  'Financing Resource': {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'title', span: 24, required: true }],
      [{ name: 'summary', span: 24, required: true, label: 'Description' }],
      [
        { name: 'geoCoverageType', span: 12, required: true },
        {
          name: 'geoCoverageCountryGroups',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
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
      [
        { name: 'relatedContent', span: 12 },
        { name: 'infoDocs', span: 12 },
      ],
    ],
  },
  'Action Plan': {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'title', span: 24, required: true }],
      [{ name: 'summary', span: 24, required: true, label: 'Description' }],
      [
        { name: 'geoCoverageType', span: 12, required: true },
        {
          name: 'geoCoverageCountryGroups',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
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
          name: 'publishYear',
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
      [
        { name: 'relatedContent', span: 12 },
        { name: 'infoDocs', span: 12 },
      ],
    ],
  },
  Technology: {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'name', span: 24, required: true, label: 'Title' }],
      [{ name: 'remarks', span: 24, required: true, label: 'Description' }],
      [
        { name: 'geoCoverageType', span: 12, required: true },
        {
          name: 'geoCoverageCountryGroups',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
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
      [
        { name: 'relatedContent', span: 12 },
        { name: 'infoDocs', span: 12 },
      ],
    ],
  },
  Legislation: {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'name', span: 24, required: true, label: 'Title' }],
      [{ name: 'abstract', span: 24, required: true, label: 'Description' }],
      [
        { name: 'geoCoverageType', span: 12, required: true },
        {
          name: 'geoCoverageCountryGroups',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
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
        { name: 'relatedContent', span: 12 },
        { name: 'infoDocs', span: 12 },
      ],
    ],
  },
  Dataset: {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'title', span: 24, required: true, label: 'Title' }],
      [{ name: 'summary', span: 24, required: true, label: 'Description' }],
      [
        { name: 'geoCoverageType', span: 12, required: true },
        {
          name: 'geoCoverageCountryGroups',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
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
        { name: 'relatedContent', span: 12 },
        { name: 'infoDocs', span: 12 },
      ],
    ],
  },
  Event: {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'title', span: 24, required: true, label: 'Title' }],
      [{ name: 'description', span: 24, required: true, label: 'Description' }],
      [
        { name: 'geoCoverageType', span: 12, required: true },
        {
          name: 'geoCoverageCountryGroups',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
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
      [
        { name: 'relatedContent', span: 12 },
        { name: 'infoDocs', span: 12 },
      ],
    ],
  },
  Initiative: {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'title', span: 24, required: true, label: 'Title' }],
      [{ name: 'description', span: 24, required: true, label: 'Description' }],
      [
        { name: 'geoCoverageType', span: 12, required: true },
        {
          name: 'geoCoverageCountryGroups',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
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
        { name: 'implementors', span: 12, required: true },
        { name: 'duration', span: 12, required: true },
      ],
      [
        { name: 'owner', span: 12 },
        { name: 'partners', span: 12 },
      ],
      [
        { name: 'relatedContent', span: 12 },
        { name: 'infoDocs', span: 12 },
      ],
    ],
  },
  'Case Study': {
    rows: [
      [{ name: 'url', span: 24, required: true }],
      [{ name: 'title', span: 24, required: true }],
      [{ name: 'summary', span: 24, required: true, label: 'Description' }],
      [
        { name: 'geoCoverageType', span: 12, required: true },
        {
          name: 'geoCoverageCountryGroups',
          span: 12,
          required: true,
          dependsOn: {
            field: 'geoCoverageType',
            value: 'transnational',
          },
        },
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
          name: 'publishYear',
          span: 12,
          label: 'Publication Year',
          required: true,
        },
      ],
      [
        { name: 'relatedContent', span: 12 },
        { name: 'infoDocs', span: 12 },
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
    { key: t`Global`, value: 'global' },
    { key: t`Transnational`, value: 'transnational' },
    { key: t`National`, value: 'national' },
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
  duration: [
    `Single event`,
    `Ongoing activity less than one year`,
    `Ongoing activity 1-3 years`,
    `Ongoing activity more than 3 years long`,
    `Not applicable`,
    `Other`,
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

const FormField = React.memo(
  ({ name, input, meta, storeData, form, label, selectedType }) => {
    const tags = Object.keys(getSelectOptions(storeData).tags)
      .map((k) => getSelectOptions(storeData).tags[k])
      .flat()

    const entity = getSelectOptions(storeData).owner || []

    const currenciesList = getSelectOptions(storeData).currencies?.map((x) => ({
      id: x.value,
      label: x.label,
    }))

    const fieldConfig = formConfigs[selectedType]?.rows
      .flat()
      .find((field) => field.name === name)

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
          return (
            <FormLabel
              label={
                label ? label : name.charAt(0).toUpperCase() + name.slice(1)
              }
              htmlFor={name}
              meta={meta}
              isOptional={!fieldConfig?.required}
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
            <FormLabel
              label="Value Amount"
              htmlFor="value"
              isOptional={!fieldConfig?.required}
              meta={meta}
            >
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
              isOptional={!fieldConfig?.required}
            >
              <Select
                {...input}
                size="small"
                value={input.value || undefined}
                allowClear
                onChange={(value) => {
                  input.onChange(value)
                  form.change('geoCoverageCountryGroups', undefined)
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
                    {opt.key}
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

        case 'geoCoverageCountryGroups':
          return (
            <FormLabel
              label="GEO COVERAGE (Transnational)"
              htmlFor="geoCoverageCountryGroups"
              meta={meta}
              isOptional={!fieldConfig?.required}
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
              isOptional={!fieldConfig?.required}
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
            <FormLabel
              label="Value Currency"
              htmlFor="valueCurrency"
              meta={meta}
              isOptional={!fieldConfig?.required}
            >
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
            <FormLabel
              label="Event Type"
              htmlFor="eventType"
              isOptional={!fieldConfig?.required}
              meta={meta}
            >
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

        case 'duration':
          return (
            <FormLabel
              label="Duration"
              htmlFor="duration"
              isOptional={!fieldConfig?.required}
              meta={meta}
            >
              <Select
                {...input}
                size="small"
                value={input.value || undefined}
                allowClear
                onChange={input.onChange}
                onBlur={input.onBlur}
                placeholder="Select duration"
                className={
                  meta.touched && !meta.valid ? 'ant-input-status-error' : ''
                }
              >
                {selectOptions.duration.map((type) => (
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
            <FormLabel
              label="Tags"
              htmlFor="tags"
              isOptional={!fieldConfig?.required}
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
                    {opt.tag}
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
              label="Life Cycle Stage"
              htmlFor="lifecycleStage"
              meta={meta}
              isOptional={!fieldConfig?.required}
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
                    {opt}
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
            <FormLabel
              label="Photo"
              htmlFor="image"
              meta={meta}
              isOptional={!fieldConfig?.required}
            >
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
                accept=".jpg,.jpeg,.png,.webp"
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon">
                  <UploadFileIcon />
                </p>
                <p className="ant-upload-text">Accepts .jpg and .png</p>
                <p className="add-btn">Add a File</p>
              </Dragger>
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
              {input.value && (
                <div className="preview-img">
                  {input.value && <img src={input.value} alt="Preview" />}{' '}
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => input.onChange(null)}
                  />
                </div>
              )}
            </FormLabel>
          )

        case 'gallery':
          return (
            <FormLabel
              label="Gallery"
              htmlFor="gallery"
              meta={meta}
              isOptional={!fieldConfig?.required}
            >
              <Dragger
                {...input}
                beforeUpload={() => false}
                onChange={async ({ file, fileList }) => {
                  try {
                    if (fileList) {
                      async function processFiles(filesArray) {
                        const ret = []
                        for (const $file of filesArray) {
                          ret.push(await getBase64($file.originFileObj))
                        }
                        return ret
                      }
                      const value = await processFiles(fileList)
                      input.onChange(value)
                    }
                  } catch (err) {
                    console.error('Error converting to base64:', err)
                    input.onChange(null)
                  }
                }}
                multiple={true}
                accept=".jpg,.jpeg,.png,.webp"
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
              isOptional={!fieldConfig?.required}
            >
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
                accept=".jpg,.jpeg,.png,.webp"
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon">
                  <UploadFileIcon />
                </p>
                <p className="ant-upload-text">Accepts .jpg and .png</p>
                <p className="add-btn">Add a File</p>
              </Dragger>
              {input.value && (
                <div className="preview-img">
                  {input.value && <img src={input.value} alt="Preview" />}{' '}
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => input.onChange(null)}
                  />
                </div>
              )}
            </FormLabel>
          )
        case 'owner':
          return (
            <FormLabel
              label={name.charAt(0).toUpperCase() + name.slice(1)}
              htmlFor={name}
              meta={meta}
              isOptional={!fieldConfig?.required}
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
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Button
                      type="link"
                      size="small"
                      onClick={(e) => {
                        e.preventDefault()
                        form.mutators.setShowModal(true)
                      }}
                      icon={<PlusOutlined />}
                      style={{ padding: '4px 8px' }}
                    >
                      Add new entity
                    </Button>
                  </>
                )}
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
              isOptional={!fieldConfig?.required}
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

        case 'publishYear':
        case 'yearFounded':
          return (
            <FormLabel
              label={label ? label : name}
              htmlFor={name}
              isOptional={!fieldConfig?.required}
              meta={meta}
            >
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
              isOptional={!fieldConfig?.required}
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

        case 'relatedContent':
          return (
            <FormLabel
              label="Related Content"
              htmlFor={name}
              isOptional={!fieldConfig?.required}
              meta={meta}
            >
              <RelatedSelectWidget
                name={name}
                input={input}
                meta={meta}
                fieldConfig={fieldConfig}
                placeholder={`Select Related Content`}
                getSearchResults={(queryString) =>
                  api.get(`/list?${String(queryString)}`)
                }
              />
            </FormLabel>
          )
        case 'infoDocs':
          return (
            <FormLabel
              label="Info And Docs"
              htmlFor={name}
              isOptional={!fieldConfig?.required}
              meta={meta}
            >
              <InfoDocsWidget
                id={name}
                value={input.value || ''}
                onChange={input.onChange}
                onBlur={input.onBlur}
                required={fieldConfig?.required}
                readonly={false}
                options={{
                  emptyValue: '',
                }}
                rawErrors={meta.error ? [meta.error] : []}
              />
            </FormLabel>
          )

        case 'highlights':
          return (
            <FormLabel
              label="Key highlights"
              htmlFor="keyHighlights"
              meta={meta}
              isOptional={!fieldConfig?.required}
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
                              const newValue = value.filter(
                                (_, i) => i !== index
                              )
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
                      Add Another
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
              isOptional={!fieldConfig?.required}
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
                              const newValue = value.filter(
                                (_, i) => i !== index
                              )
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
                      Add Another
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
  },
  (prevProps, nextProps) => {
    const isStoreDataEqual =
      JSON.stringify(prevProps.storeData) ===
      JSON.stringify(nextProps.storeData)
    return (
      prevProps.input.value === nextProps.input.value &&
      prevProps.meta.error === nextProps.meta.error &&
      prevProps.meta.touched === nextProps.meta.touched &&
      prevProps.selectedType === nextProps.selectedType &&
      isStoreDataEqual
    )
  }
)
const FormFields = React.memo(({ selectedType, storeData, form }) => {
  const config = formConfigs[selectedType] || defaultConfig

  return (
    <div className="space-y-4">
      <Field name="geoCoverageType">
        {({ input: { value: geoType } }) =>
          config.rows.map((row, rowIndex) => (
            <Row key={rowIndex} gutter={16}>
              {row.map(({ name, span, label }) => {
                if (
                  (name === 'geoCoverageCountryGroups' &&
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
                          selectedType={selectedType}
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
})

const DynamicContentForm = () => {
  const router = useRouter()
  const { id, type } = router.query
  const [selectedType, setSelectedType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingEditData, setLoadingEditData] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const formRef = useRef()

  const [initialValues, setInitialValues] = useState({
    highlights: [{ text: '', url: '' }],
    outcomes: [''],
    videos: [''],
  })

  useEffect(() => {
    if (type && id) {
      setLoadingEditData(true)
      api.get(`/detail/${type}/${id}`).then((response) => {
        setLoadingEditData(false)
        const data = response.data

        const entityConnections = data.entityConnections || []
        const owner = entityConnections
          .filter((connection) => connection.role === 'owner')
          .map((connection) => connection.entityId)

        const partners = entityConnections
          .filter((connection) => connection.role === 'partner')
          .map((connection) => connection.entityId)

        const implementors = entityConnections
          .filter((connection) => connection.role === 'implementor')
          .map((connection) => connection.entityId)

        const donors = entityConnections
          .filter((connection) => connection.role === 'donor')
          .map((connection) => connection.entityId)

        const readableType = contentTypeMap[type.toLowerCase()] || null

        setSelectedType(readableType)

        setInitialValues({
          ...data,
          owner,
          partners,
          implementors,
          donors,
          ...((data.type === 'policy' || data.type === 'technology') && {
            name: data.title,
          }),
          ...(data.type === 'policy' && { abstract: data.summary }),
          ...(data.type === 'technology' && { remarks: data.summary }),
          ...((data.type === 'event' || data.type === 'initiative') && {
            description: data.summary,
          }),
          geoCoverageType: data.geoCoverageType || '',
          lifecycleStage: data.tags
            ? data.tags
                .filter((tag) =>
                  lifecycleStageTags.some(
                    (stage) => stage.toLowerCase() === tag.tag.toLowerCase()
                  )
                )
                .map((item) =>
                  item.tag
                    .toLowerCase()
                    .replace(/\b\w/g, (char) => char.toUpperCase())
                )
            : [],

          tags: data.tags
            ? data.tags
                .filter(
                  (tag) =>
                    !lifecycleStageTags.some(
                      (stage) => stage.toLowerCase() === tag.tag.toLowerCase()
                    )
                )
                .map((item) => item.id)
            : [],
          startDate: data.startDate ? moment(data.startDate) : null,
          endDate: data.endDate ? moment(data.endDate) : null,
        })
      })
    } else {
      setInitialValues({
        highlights: [{ text: '', url: '' }],
        outcomes: [''],
        videos: [''],
      })
    }
  }, [type, id])

  const storeData = UIStore.useState((s) => ({
    stakeholders: s.stakeholders?.stakeholders,
    countries: s.countries,
    tags: s.tags,
    regionOptions: s.regionOptions,
    transnationalOptions: [
      ...s.transnationalOptions,
      { id: -1, type: 'transnational', name: 'Other', countries: [] },
    ],
    nonMemberOrganisations: s.nonMemberOrganisations,
    organisations: s.organisations,
    selectedMainContentType: s.selectedMainContentType,
    currencies: s.currencies,
    relatedResource: s.relatedResource,
  }))

  const onSubmit = async (values, form) => {
    try {
      setLoading(true)
      const cleanValues = Object.fromEntries(
        Object.entries(values).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ''
        )
      )

      const updatedData = getUpdatedFields(initialValues, cleanValues)
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

      const formattedTags = [
        ...(values.tags || []),
        ...(values.lifecycleStage || []),
      ]?.map((x) => {
        if (typeof x === 'number') {
          const tagInfo = storeTags.find((t) => t.id === x)
          return {
            id: x,
            ...(tagInfo && { tag: tagInfo.tag }),
          }
        } else {
          return {
            tag: x,
            ...(storeTags.find(
              (o) => o.tag.toLowerCase() === x.toLowerCase()
            ) && {
              id: storeTags.find((o) => o.tag.toLowerCase() === x.toLowerCase())
                ?.id,
            }),
          }
        }
      })

      const data = {
        ...updatedData,
        ...(!id &&
          !type && {
            resourceType:
              selectedType === 'Dataset' ? 'Data Catalog' : selectedType,
          }),
        ...(!id &&
          !type && {
            source: 'gpml',
          }),
        ...(!id && !type
          ? { entityConnections: entityConnections }
          : {
              entityConnections: entityConnections.map((item) => ({
                entity: item.entity,
                role: item.role,
                id: values.entityConnections?.find(
                  (connection) => connection.entityId === item.entity
                )?.id,
              })),
            }),
        ...(formattedTags.length > 0 && { tags: formattedTags }),
        ...(updatedData.geoCoverageCountryGroups && {
          geoCoverageCountryGroups: [updatedData.geoCoverageCountryGroups],
        }),
        ...(updatedData.geoCoverageCountries && {
          geoCoverageCountries: updatedData.geoCoverageCountries,
        }),
        ...(updatedData.validFrom && {
          validTo: updatedData.validTo ? updatedData.validTo : 'ongoing',
        }),
        ...(updatedData.value && {
          value: Number(updatedData.value),
        }),
        ...(updatedData.yearFounded && {
          yearFounded: Number(updatedData.yearFounded),
        }),
        ...(updatedData.publishYear && {
          publishYear: Number(updatedData.publishYear),
        }),
        ...(id &&
          type === 'technology' && {
            name: values.name,
          }),
        language: 'en',
      }

      delete data.lifecycleStage
      delete data.owner
      delete data.partners

      const endpoint = id && type ? `/detail/${type}/${id}` : '/resource'
      const method = id && type ? 'put' : 'post'

      const submissionHandlers = {
        Technology: handleOnSubmitTechnology,
        Legislation: handleOnSubmitPolicy,
        Project: handleOnSubmitProject,
        Event: handleOnSubmitEvent,
        Initiative: handleOnSubmitInitiative,
        'Case Study': handleOnSubmitCaseStudy,
        default: (data) => api[method](endpoint, data),
      }

      const submitHandler =
        id && type && selectedType !== 'Initiative'
          ? submissionHandlers.default
          : submissionHandlers[selectedType] || submissionHandlers.default

      const response = await submitHandler(data, form)

      if (response) {
        if (id && type) {
          router.push(`/${type.replace('_', '-')}/${id}`)
        }
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
        }, 10000)
        form.reset()
        setSelectedType(null)
        return response
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create resource'

      notification.error({
        message: 'An error occurred',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const validate = useCallback(
    (values) => {
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
    },
    [selectedType]
  )

  const handleOnSubmitTechnology = async (data) => {
    delete data.resourceType
    delete data.image
    data.version = 2
    data.subContentType = ''
    data.individualConnections = []

    try {
      const response = await api.post('/technology', data)
      if (!response.data || response.error) {
        throw new Error(response.error || 'Failed to create technology')
      }
      return response
    } catch (error) {
      throw error
    }
  }

  const handleOnSubmitCaseStudy = async (data) => {
    delete data.resourceType
    delete data.image
    data.version = 2
    data.subContentType = ''
    data.individualConnections = []

    try {
      const response = await api.post('/case-study', data)
      if (!response.data || response.error) {
        throw new Error(response.error || 'Failed to create case study')
      }
      return response
    } catch (error) {
      throw error
    }
  }

  const handleOnSubmitPolicy = async (data, form) => {
    delete data.resourceType
    delete data.image
    data.version = 2
    data.subContentType = 'Bans and Restrictions'
    data.individualConnections = []

    try {
      const response = await api.post('/policy', data)
      if (!response.data || response.error) {
        throw new Error(response.error || 'Failed to create policy')
      }
      return response
    } catch (error) {
      throw error
    }
  }

  const handleOnSubmitProject = async (data, form) => {
    try {
      delete data.resourceType
      delete data.donors
      delete data.implementors
      data.version = 2
      data.subContentType = ''
      data.individualConnections = []

      const response = await api.post('/project', data)

      if (!response.data || response.error) {
        throw new Error(response.error || 'Failed to create project')
      }

      return response
    } catch (error) {
      throw error
    }
  }

  const handleOnSubmitEvent = async (data, form) => {
    try {
      delete data.highlights
      delete data.outcomes
      delete data.videos

      const response = await api.post('/event', data)

      if (!response.data || response.error) {
        throw new Error(response.error || 'Failed to create project')
      }

      return response
    } catch (error) {
      throw error
    }
  }

  const handleOnSubmitInitiative = async (data, form) => {
    data.q2 = data.title
    delete data.title
    data.q3 = data.description
    delete data.description
    data.q24 = {
      [data.geoCoverageType.toLowerCase()]: data.geoCoverageType,
    }
    data.qimage = data.image
    Object.assign(data, convertDurationToQ38Format(data.duration))

    if (data.geoCoverageCountryGroups) {
      data.q24_4 = convertGeoCoverageGroupsToQ24_4(
        data.geoCoverageCountryGroups,
        storeData
      )
      delete data.geoCoverageCountryGroups
    }
    if (data.geoCoverageCountries) {
      data.q24_2 = convertGeoCoverageCountriesToQ24_2(
        data.geoCoverageCountries,
        storeData
      )
      delete data.geoCoverageCountries
    }

    data.version = 2

    delete data.duration
    delete data.geoCoverageType
    delete data.highlights
    delete data.outcomes
    delete data.implementors
    delete data.videos
    delete data.resourceType
    delete data.image

    const endpoint = id && type ? `/detail/${type}/${id}` : '/initiative'
    const method = id && type ? 'put' : 'post'

    try {
      const response = await api[method](endpoint, data)

      if (!response.data || response.error) {
        throw new Error(response.error || 'Failed to create initiative')
      }

      return response
    } catch (error) {
      throw error
    }
  }

  const setOrg = (org) => {
    const form = formRef.current
    const currentOwners = form.getState().values.owner || []
    form.change('owner', [...currentOwners, org.id])
    setShowModal(false)
  }

  const formMutators = {
    setShowModal: ([value], state, { changeValue }) => {
      setShowModal(value)
    },
  }

  return (
    <div className={styles.addContentForm}>
      <div className="container">
        <div className="ant-form ant-form-vertical">
          <Title className="title" level={3}>
            {id && type ? 'Edit' : 'Add'} Content
          </Title>
          {showSuccess ? (
            <div className="success-block">
              <h4>Submitted Successfully!</h4>
              <p>Your newly added resource will be reviewed shortly.</p>
            </div>
          ) : (
            <Form
              onSubmit={(values, form) => onSubmit(values, form)}
              validate={validate}
              initialValues={initialValues}
              mutators={{ setShowModal: formMutators.setShowModal }}
              render={({ handleSubmit, form }) => {
                const onSubmit = async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  await handleSubmit(e)
                }
                formRef.current = form
                return (
                  <>
                    <form onSubmit={onSubmit}>
                      {loadingEditData && (
                        <div className="loading-form">
                          <Spin />
                        </div>
                      )}

                      {!loadingEditData && (
                        <>
                          {!selectedType && (
                            <div className="form-description">
                              <p>
                                The GPML Digital Platform is crowdsourced and
                                allows everyone to submit new content via this
                                form.
                              </p>
                              <p>
                                A wide range of resources can be submitted, and
                                these include Action Plans, Initiatives,
                                Technical resources, Financing resources,
                                Policies, Events, and Technologies. Learn more
                                about each category and sub-categories
                                definitions in the "Content Type" section of
                                this form. A quick summary sheet with categories
                                and sub-categories can be downloaded here.
                              </p>
                              <p>
                                You can access existing content via the
                                Knowledge Exchange Library. Make sure to browse
                                around and leave a review under the resources
                                you enjoy the most!
                              </p>
                            </div>
                          )}

                          <Space
                            direction="vertical"
                            size="large"
                            className="w-full"
                          >
                            <div className="form-container">
                              <Title level={4}>
                                What type of content is this?
                              </Title>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '10px',
                                  flexWrap: 'wrap',
                                }}
                              >
                                {contentTypes.map((type) => (
                                  <Button
                                    key={type}
                                    className={`content-type-btn ${
                                      selectedType === type ? 'selected' : ''
                                    }`}
                                    onClick={() => {
                                      if (selectedType !== type) {
                                        setSelectedType(type)
                                        form.restart(initialValues)
                                      } else {
                                        setSelectedType(null)
                                        form.restart(initialValues)
                                      }
                                    }}
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
                                    All details of the{' '}
                                    {selectedType.toLowerCase()}
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
                        </>
                      )}
                    </form>
                  </>
                )
              }}
            />
          )}
        </div>
      </div>
      <ModalAddEntity
        visible={showModal}
        close={() => setShowModal(!showModal)}
        setEntity={setOrg}
      />
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

const convertDurationToQ38Format = (selectedDuration) => {
  const durationMap = {
    'Single event': '38-0',
    'Ongoing activity less than one year': '38-1',
    'Ongoing activity 1-3 years': '38-2',
    'Ongoing activity more than 3 years long': '38-3',
    'Not applicable': '38-4',
    Other: '38-5',
  }

  const key = durationMap[selectedDuration]

  if (key) {
    return {
      q38: {
        [key]: selectedDuration,
      },
    }
  }

  return { q38: {} }
}

const convertGeoCoverageGroupsToQ24_4 = (groupIds, storeData) => {
  if (!groupIds || !Array.isArray(groupIds)) {
    return []
  }

  const allOptions = [...(storeData.transnationalOptions || [])]

  return groupIds
    .map((groupId) => {
      const option = allOptions.find((opt) => opt.id === groupId)
      if (option) {
        return {
          [option.id.toString()]: option.name,
        }
      }
      return null
    })
    .filter(Boolean)
}

const convertGeoCoverageCountriesToQ24_2 = (countryIds, storeData) => {
  if (!countryIds || !Array.isArray(countryIds)) {
    return {}
  }

  const allOptions = [...(storeData.countries || [])]

  return countryIds.reduce((acc, countryId) => {
    const country = allOptions.find((opt) => opt.id === countryId)
    if (country) {
      acc[country.id] = country.name
    }
    return acc
  }, {})
}

const excludedFields = ['geoCoverageType', 'geoCoverageCountries']

const getUpdatedFields = (initialValues, currentValues) => {
  const updatedFields = {}

  Object.keys(currentValues).forEach((key) => {
    if (
      !excludedFields.includes(key) &&
      JSON.stringify(initialValues[key]) !== JSON.stringify(currentValues[key])
    ) {
      updatedFields[key] = currentValues[key]
    }
  })

  excludedFields.forEach((field) => {
    if (currentValues[field] !== undefined) {
      updatedFields[field] = currentValues[field]
    }
  })

  return updatedFields
}

const RelatedSelectWidget = ({
  name,
  input,
  meta,
  placeholder,
  getSearchResults,
}) => {
  const [fetching, setFetching] = useState(false)
  const [data, setData] = useState([])
  const [searchStr, setSearchStr] = useState('')
  const fetchRef = useRef(0)

  const handleSearch = React.useMemo(() => {
    const loadOptions = async (value) => {
      setSearchStr(value)
      fetchRef.current += 1
      const fetchId = fetchRef.current

      setFetching(true)
      try {
        const searchParams = new URLSearchParams()
        searchParams.set('limit', 10)
        searchParams.set('q', value)

        const response = await getSearchResults(searchParams.toString())

        if (fetchId !== fetchRef.current) return

        const transformedData = response.data.map((item) => ({
          id: item.id,
          name: item.title,
          type: item.type,
        }))

        setData(transformedData)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setFetching(false)
      }
    }

    return debounce(loadOptions, 300)
  }, [getSearchResults])

  const handleChange = (values, options) => {
    const formattedValue = values
      .map((selectedValue) => {
        if (!selectedValue) return null

        const id = parseInt(selectedValue)
        if (isNaN(id)) return null

        const selectedItem = data.find((item) => item.id === id)
        if (selectedItem) {
          return {
            id: selectedItem.id,
            type: selectedItem.type,
          }
        }
        return null
      })
      .filter(Boolean)

    input.onChange(formattedValue)
  }

  return (
    <Select
      mode="multiple"
      showSearch
      size="small"
      value={input.value ? input.value.map((v) => v.id.toString()) : []}
      onChange={handleChange}
      onBlur={input.onBlur}
      onSearch={handleSearch}
      placeholder={placeholder || `Search ${name}`}
      style={{ width: '100%' }}
      filterOption={false}
      notFoundContent={
        fetching ? (
          <Spin size="small" />
        ) : searchStr.length > 0 ? (
          <div style={{ padding: '8px', textAlign: 'center' }}>
            No Results Found
          </div>
        ) : null
      }
      className={meta.touched && !meta.valid ? 'ant-input-status-error' : ''}
    >
      {data.map((item) => (
        <Option key={item.id} value={item.id.toString()}>
          {item.name}
        </Option>
      ))}
    </Select>
  )
}

const InfoDocsWidget = ({
  autofocus,
  disabled,
  formContext,
  id,
  onBlur,
  onChange,
  onFocus,
  options,
  readonly,
  required,
  schema,
  value,
  rawErrors,
}) => {
  const [editorValue, setEditorValue] = useState()
  const router = useRouter()

  const handleChange = (newValue) => {
    setEditorValue(newValue)
    if (onChange) {
      onChange(newValue === '' ? options.emptyValue : newValue.toString('html'))
    }
  }

  useEffect(() => {
    const initializeEditor = async () => {
      try {
        const module = await import('react-rte')
        const initialValue = module.createValueFromString(value || '', 'html')
        setEditorValue(initialValue)
      } catch (error) {
        console.error('Error initializing rich text editor:', error)
      }
    }

    initializeEditor()
  }, [router.pathname])

  const toolbarConfig = {
    display: [
      'INLINE_STYLE_BUTTONS',
      'BLOCK_TYPE_BUTTONS',
      'LINK_BUTTONS',
      'BLOCK_TYPE_DROPDOWN',
      'HISTORY_BUTTONS',
    ],
    INLINE_STYLE_BUTTONS: [
      {
        label: 'Bold',
        style: 'BOLD',
        className: 'custom-css-class',
        title: 'Make text bold (Ctrl+B)',
      },
      {
        label: 'Italic',
        style: 'ITALIC',
        title: 'Make text italic (Ctrl+I)',
      },
      {
        label: 'Underline',
        style: 'UNDERLINE',
        title: 'Underline text (Ctrl+U)',
      },
      {
        label: 'Code',
        style: 'CODE',
        title: 'Format as inline code',
      },
    ],
    BLOCK_TYPE_DROPDOWN: [
      { label: 'Normal', style: 'unstyled' },
      { label: 'Heading Large', style: 'header-one' },
      { label: 'Heading Medium', style: 'header-two' },
      { label: 'Heading Small', style: 'header-three' },
    ],
    BLOCK_TYPE_BUTTONS: [
      { label: 'UL', style: 'unordered-list-item', title: 'Bulleted List' },
      { label: 'OL', style: 'ordered-list-item', title: 'Numbered List' },
    ],
  }

  const editorStyle = {
    minHeight: '200px',
    border: rawErrors?.length ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
    borderRadius: '4px',
  }

  if (!editorValue) {
    return null
  }

  return (
    <div className="info-docs-editor">
      <RichTextEditor
        toolbarConfig={toolbarConfig}
        onChange={handleChange}
        value={editorValue}
        placeholder="Start typing your documentation here..."
        readOnly={readonly || disabled}
        autoFocus={autofocus}
        style={editorStyle}
      />
      {rawErrors?.length > 0 && (
        <div
          className="error-message"
          style={{ color: '#ff4d4f', marginTop: '4px' }}
        >
          {rawErrors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default withAuth(DynamicContentForm)
