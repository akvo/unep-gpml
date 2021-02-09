import React, { useState, useEffect } from "react";
import { Form, Input, Select } from "antd";
import { Form as FinalForm, Field } from 'react-final-form'
import { createForm } from 'final-form'
import arrayMutators from 'final-form-arrays'
import './styles.scss'
import Checkbox from "antd/lib/checkbox/Checkbox";
import {
  LinkedinOutlined,
  TwitterOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { FieldsFromSchema, validateSchema } from "../../utils/form-utils";
import { countries } from 'countries-list'
import countries2to3 from 'countries-list/dist/countries2to3.json'
import specificAreasOptions from '../events/specific-areas.json'
import cloneDeep from 'lodash/cloneDeep'
import api from "../../utils/api";
import { offeringKeys, seekingKeys } from "../../utils/misc";

const geoCoverageTypeOptions = ['Global', 'Regional', 'National', 'Sub-national', 'Transnational', 'Global with elements in specific areas']
const regionOptions = ['Africa', 'Asia and the Pacific', 'East Asia', 'Europe', 'Latin America and Carribean', 'North America', 'West Asia']
const GeoCoverageInput = (props) => {
  return (
    <Field key={props.name} name="geoCoverageType" render={
        ({input: typeInput, name}) => {
        return <Field key={name} name="geoCoverageValue" render={
          ({ input }) => {
            if(typeInput.value === 'global') return <Input disabled />
            if (typeInput.value === 'sub-national') return <Input placeholder="Type regions here..." {...input} />
            if(typeInput.value === 'Other') return <Input placeholder="Type here..." {...input} />
            const selectProps = {...input}
            if(typeInput.value === 'regional'){
              selectProps.options = regionOptions.map(it => ({ value: it, label: it }))
              selectProps.mode = 'multiple'
            }
            else if(typeInput.value === 'national' || typeInput.value === 'transnational'){
              selectProps.options = Object.keys(countries).map(iso2 => ({ value: countries2to3[iso2], label: countries[iso2].name }))
              selectProps.showSearch = true
              selectProps.filterOption = (input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              if (typeInput.value === 'transnational'){
                selectProps.mode = 'multiple'
              }
            }
            else if (typeInput.value === 'global with elements in specific areas'){
              selectProps.options = specificAreasOptions.map(it => ({ value: it, label: it }))
              selectProps.mode = 'multiple'
            }
            return <Select {...selectProps} />
          }
        }
        />
      }
    }
    />
  )
}


const sectorOptions = ['Governments', 'Private Sector', 'NGOs and MGS', 'Academia and Scientific Community', 'IGOs and multi - lateral processes', 'Other']
const TitleNameGroup = (props) => {
  return (
    <Input.Group compact className="title-name-group">
      <Field
        name="title"
        render={({ input }) => <Select {...input} placeholder="Title" options={['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'].map(it => ({ value: it, label: it }))} />}
      />
      <Field
        name="firstName"
        render={({ input }) => <Input {...input} style={{ flex: 1 }} />}
      />
    </Input.Group>
  )
}

const defaultFormSchema = [
  {
    title: { label: 'Title', required: true, control: 'select', options: ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'].map(it => ({ value: it, label: it })) },
    firstName: { label: 'First name', required: true },
    lastName: { label: 'Last name', required: true },
    linkedIn: { label: 'LinkedIn', prefix: <LinkedinOutlined /> },
    twitter: { label: 'Twitter', prefix: <TwitterOutlined /> },
    photo: { label: 'Photo', control: 'file', maxFileSize: 1, accept: "image/*" },
    representation: { label: 'Representative sector', required: true, control: 'select', options: sectorOptions.map(it => ({ value: it, label: it })) },
    country: { label: 'Country', control: 'select', showSearch: true, options: Object.keys(countries).map(iso2 => ({ value: countries2to3[iso2], label: countries[iso2].name })), autoComplete: 'off' }
  },
  {
    // 'org.role': { label: '' },
    'org.id': { label: 'Organisation name', control: 'select', showSearch: true, options: [], placeholder: 'Start typing...' },
    // 'org.name': { label: 'Organisation name' },
    'org.url': { label: 'Organisation URL', addonBefore: 'https://' },
  },
  {
    geoCoverageType: { label: 'Geo coverage type', required: true, control: 'select', options: geoCoverageTypeOptions.map(it => ({ value: it.toLowerCase(), label: it })) },
    geoCoverageValue: {
      label: 'Geo coverage',
      render: GeoCoverageInput
    }
  },
  {
    seeking: { label: 'Seeking', control: 'select', mode: 'multiple', options: seekingKeys.map(it => ({ value: it, label: it })) },
    offering: { label: 'Offering', control: 'select', mode: 'multiple', options: offeringKeys.map(it => ({ value: it, label: it })) },
    about: { label: 'About yourself', control: 'textarea' },
    tags: { label: 'Tags', control: 'select', options: [], mode: 'multiple' },
    cv: { label: 'CV / Portfolio', control: 'file', maxFileSize: 5, accept: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain" },
  }
]

const ReviewText = ({reviewStatus}) => {
    if (reviewStatus === "SUBMITTED") return <div className="review-status">WAITING FOR APPROVAL</div>
 const reviewIcon = reviewStatus === "APPROVED"
        ? (<CheckCircleOutlined/>)
        : (<ExclamationCircleOutlined/>)
 return (<div className={`review-status ${reviewStatus.toLowerCase()}`}>{reviewIcon} SUBMISSION IS {reviewStatus}</div>)
}

const SignupForm = ({ onSubmit, formRef, initialValues, handleSubmitRef, tagsRef }) => {
  const [formSchema, setFormSchema] = useState(defaultFormSchema)
  const [noOrg, setNoOrg] = useState(false)
  const form = createForm({
    subscription: {},
    mutators: {
    ...arrayMutators
    },
    onSubmit, validate: validateSchema(formSchema.reduce((acc, val) => ({ ...acc, ...val }), {})) // combined formSchema sections
  })

  useEffect(() => {
    api.get('/organisation')
    .then(d => {
      const newSchema = cloneDeep(formSchema)
      newSchema[1]['org.id'].options = d.data.map(it => ({ value: it.id, label: it.name }))
      setFormSchema(newSchema)
    })
  }, [])

  useEffect(() => {
      if (tagsRef) {
          const newSchema = cloneDeep(formSchema);
          newSchema[3].tags.options = tagsRef.map(x => ({ value: x.id, label: x.tag }))
          newSchema[3].tags.loading = false
          setFormSchema(newSchema);
      }
  }, [tagsRef])

  const handleChangePrivateCitizen = ({ target: { checked } }) => {
    setNoOrg(checked)
    const newSchema = cloneDeep(formSchema)
    Object.keys(newSchema[1]).forEach(key => {
      newSchema[1][key].disabled = checked
      newSchema[1][key].required = !checked
    })
    setFormSchema(newSchema)
  }

  if(formRef) formRef(form)
  return (
    <Form layout="vertical">
      <FinalForm
        initialValues={initialValues}
        form={form}
        render={
          ({ handleSubmit }) => {
            if(handleSubmitRef) handleSubmitRef(handleSubmit)
            return (
              <div className="signup-form">
                {initialValues?.reviewStatus && <ReviewText {...initialValues}/> }
                <div className="section">
                  <h2>Personal details</h2>
                  <FieldsFromSchema schema={formSchema[0]} />
                </div>
                <div className="section">
                  <h2>Organisation details</h2>
                  <Checkbox className="org-check" checked={noOrg} onChange={handleChangePrivateCitizen}>I am a private citizen</Checkbox>
                  <FieldsFromSchema schema={formSchema[1]} />
                </div>
                <div className="section">
                  <h2>Location and Coverage</h2>
                  <FieldsFromSchema schema={formSchema[2]} />
                </div>
                <div className="section">
                  <h2>Expertise and activities</h2>
                  <FieldsFromSchema schema={formSchema[3]} />
                </div>
              </div>
            )
          }
        }
      />
    </Form>
  )
}

export default SignupForm
