import React, { useState } from "react";
import { Form, Input, Select } from "antd";
import { Form as FinalForm, Field } from 'react-final-form'
import { createForm } from 'final-form'
import './styles.scss'
import Checkbox from "antd/lib/checkbox/Checkbox";
import { LinkedinOutlined, TwitterOutlined } from "@ant-design/icons";
import { FieldsFromSchema, validateSchema } from "../../utils/form-utils";
import { countries } from 'countries-list'
import countries2to3 from 'countries-list/dist/countries2to3.json'

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
const formSchema = [
  {
    firstName: { label: 'First name', required: true, render: TitleNameGroup },
    lastName: { label: 'Last name', required: true },
    linkedIn: { label: 'LinkedIn', prefix: <LinkedinOutlined /> },
    twitter: { label: 'Twitter', prefix: <TwitterOutlined /> },
    photo: { label: 'Photo', control: 'file' },
    representation: { label: 'Representative sector', required: true, control: 'select', options: sectorOptions.map(it => ({ value: it, label: it })) },
    country: { label: 'Country', control: 'select', showSearch: true, options: Object.keys(countries).map(iso2 => ({ value: countries2to3[iso2], label: countries[iso2].name })), autoComplete: 'off' }
  },
  {
    'org.name': { label: 'Organisation name' },
    'org.url': { label: 'Organisation URL', addonBefore: 'https://' },
  },
  {
    about: { label: 'About yourself', control: 'textarea', required: true }
  }
]

const SignupForm = ({ onSubmit, formRef }) => {
  const [noOrg, setNoOrg] = useState(false)

  const form = createForm({
    subscription: {},
    initialValues: { title: null },
    onSubmit, validate: validateSchema(formSchema.reduce((acc, val) => ({ ...acc, ...val }), {})) // combined formSchema sections
  })

  if(formRef) formRef(form)
  return (
    <Form layout="vertical">
      <FinalForm
        form={form}
        render={
          () => {
            return (
              <div>
                <div className="section">
                  <h2>Personal details</h2>
                  <FieldsFromSchema schema={formSchema[0]} />
                </div>
                <div className="section">
                  <h2>Organisation details</h2>
                  <Checkbox className="org-check" checked={noOrg} onChange={({ target: { checked } }) => setNoOrg(checked)}>I don't belong to an organisation</Checkbox>
                  {!noOrg && <FieldsFromSchema schema={formSchema[1]} />}
                </div>
                <div className="section">
                  <h2>Other</h2>
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
