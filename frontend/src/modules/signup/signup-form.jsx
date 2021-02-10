import React, { useState, useEffect } from "react";
import { Form } from "antd";
import { Form as FinalForm, FormSpy } from 'react-final-form'
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
import cloneDeep from 'lodash/cloneDeep'
import api from "../../utils/api";
import { offeringKeys, seekingKeys } from "../../utils/misc";
import GeoCoverageInput from "./comp/geo-coverage-input";
import { useRef } from "react";

const geoCoverageTypeOptions = ['Global', 'Regional', 'National', 'Sub-national', 'Transnational', 'Global with elements in specific areas']

const sectorOptions = ['Governments', 'Private Sector', 'NGOs and MGS', 'Academia and Scientific Community', 'IGOs and multi - lateral processes', 'Other']

const defaultFormSchema = [
  {
    title: { label: 'Title', required: true, control: 'select', options: ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'].map(it => ({ value: it, label: it })) },
    firstName: { label: 'First name', required: true },
    lastName: { label: 'Last name', required: true },
    linkedIn: { label: 'LinkedIn', prefix: <LinkedinOutlined /> },
    twitter: { label: 'Twitter', prefix: <TwitterOutlined /> },
    photo: { label: 'Photo', control: 'file', maxFileSize: 1, accept: "image/*" },
    representation: { label: 'Representative sector', required: true, control: 'select', options: sectorOptions.map(it => ({ value: it, label: it })) },

  },
  {
    'org.id': {
      label: 'Organisation', control: 'select', showSearch: true, options: [], placeholder: 'Start typing...', order: 0, required: true,
    },
    'org.type': { label: 'Type', control: 'select', options: ['Government', 'Private Sector', 'Academia and Scientific Community', 'NGO and Major Groups and Stakeholders', 'IGO and Multilateral Process Actor', 'Other'].map(it => ({ value: it, label: it })) },
    'org.country': { label: 'Country', order: 3, control: 'select', required: true, showSearch: true, options: Object.keys(countries).map(iso2 => ({ value: countries2to3[iso2], label: countries[iso2].name })), autoComplete: 'off' },
    'org.url': { label: 'Organisation URL', order: 4, addonBefore: 'https://', required: true },
    'org.geoCoverageType': { label: 'Geo coverage type', order: 5, required: true, control: 'select', options: geoCoverageTypeOptions.map(it => ({ value: it.toLowerCase(), label: it })) },
    'org.geoCoverageValue': {
      order: 6,
      required: true,
      label: 'Geo coverage',
      render: GeoCoverageInput
    }
  },
  {
    seeking: { label: 'Seeking', control: 'select', mode: 'multiple', options: seekingKeys.map(it => ({ value: it, label: it })) },
    offering: { label: 'Offering', control: 'select', mode: 'multiple', options: offeringKeys.map(it => ({ value: it, label: it })) },
    about: { label: 'About yourself', control: 'textarea', placeholder: 'Max 150 words' },
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
    onSubmit
  })
  const prevVals = useRef()

  useEffect(() => {
    api.get('/organisation')
    .then(d => {
      const newSchema = cloneDeep(formSchema)
      newSchema[1]['org.id'].options = [...d.data.map(it => ({ value: it.id, label: it.name })), { value: -1, label: 'Other' }]
      newSchema[1]['org.id'].filterOption = (input, option) => {
        return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.value === -1
      }
      setFormSchema(newSchema)
    })
  }, [])

  useEffect(() => {
      if (tagsRef) {
          const newSchema = cloneDeep(formSchema);
          newSchema[2].tags.options = tagsRef.map(x => ({ value: x.id, label: x.tag }))
          newSchema[2].tags.loading = false
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
        validate={validateSchema(formSchema.reduce((acc, val) => ({ ...acc, ...val }), {}))}
        render={
          ({ handleSubmit, form }) => {
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
                  <FormSpy
                    subscription={{ values: true }}
                    onChange={({ values }) => {
                      const newSchema = cloneDeep(formSchema)
                      let changedSchema = false
                      if(values?.org?.id === -1 && prevVals.current?.org?.id !== -1){
                        // Add Name field
                        newSchema[1].name = { label: 'Name', required: true, order: 1 }
                        Object.keys(newSchema[1]).forEach(it => { newSchema[1][it].required = true })
                        if(values.org.geoCoverageType === 'global') newSchema[1]['org.geoCoverageValue'].required = false
                        changedSchema = true
                      }
                      if (values?.org != null && values?.org?.id !== -1 && prevVals.current?.org?.id !== values?.org?.id){
                        if (prevVals.current?.org?.id === -1){
                          delete newSchema[1].name
                        }
                        Object.keys(newSchema[1]).filter(it => it !== 'org.id').forEach(it => { newSchema[1][it].required = false})
                        changedSchema = true
                        api.get(`/organisation/${values.org.id}`)
                        .then(({ data }) => {
                          ['country', 'geoCoverageType', 'geoCoverageValue', 'type', 'url'].forEach(propKey => {
                            form.change(`org.${propKey}`, data[propKey])
                          })
                        })
                      }
                      if(values.org != null && values?.org?.geoCoverageType !== prevVals.current?.org?.geoCoverageType){
                        if(values.org.geoCoverageType === 'global'){
                          newSchema[1]['org.geoCoverageValue'].required = false
                        } else {
                          newSchema[1]['org.geoCoverageValue'].required = true
                        }
                        changedSchema = true
                      }
                      if(changedSchema){
                        setFormSchema(newSchema)
                      }
                      prevVals.current = values
                    }}
                  />
                </div>
                <div className="section">
                  <h2>Expertise and activities</h2>
                  <FieldsFromSchema schema={formSchema[2]} />
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
