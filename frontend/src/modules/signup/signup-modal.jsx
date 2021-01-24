import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import { Form as FinalForm, Field } from 'react-final-form'
import { createForm } from 'final-form'
import api from "../../utils/api";
import { cloneDeep } from "lodash";
import './styles.scss'
import Checkbox from "antd/lib/checkbox/Checkbox";
import { LinkedinOutlined, TwitterOutlined } from "@ant-design/icons";
import { FieldsFromSchema, validateSchema } from "../../utils/form-utils";

const sectorOptions = ['Governments', 'Private Sector', 'NGOs and MGS', 'Academia and Scientific Community', 'IGOs and multi - lateral processes', 'Other']
const TitleNameGroup = (props) => {
  return (
    <Input.Group compact className="title-name-group">
      <Field
        name="title"
        render={({ input }) => <Select {...input} defaultValue="Mr" options={['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'].map(it => ({ value: it, label: it }))} />}
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
    firstName: { label: 'First name', required: true, render: TitleNameGroup },
    lastName: { label: 'Last name', required: true},
    linkedIn: { label: 'LinkedIn', prefix: <LinkedinOutlined />},
    twitter: { label: 'Twitter', prefix: <TwitterOutlined /> },
    photo: { label: 'Photo', control: 'file' },
    representation: { label: 'Representative sector', control: 'select', options: sectorOptions.map(it => ({ value: it, label: it })) },
    country: { label: 'Country', control: 'select', showSearch: true, options: [{ value: 'loading', label: 'Loading' }], autoComplete: 'off' }
  },
  {
    'org.name': { label: 'Organisation name'},
    'org.url': { label: 'Organisation URL', addonBefore: 'https://' },
  },
  {
    about: { label: 'About yourself', control: 'textarea', required: true }
  }
]

const SignupModal = ({ visible, onCancel }) => {
  const [formSchema, setFormSchema] = useState(defaultFormSchema)
  const [noOrg, setNoOrg] = useState(false)
  useEffect(() => {
    (async function fetchData() {
      const response = await api.get('/country')
      const newSchema = cloneDeep(defaultFormSchema);
      newSchema[0].country.options = response.data.map(x => ({ value: x.isoCode, label: x.name}));
      setFormSchema(newSchema);
    })()
  }, []);
    const onSubmit = (vals) => {
      api.post('/profile', vals)
    }
    const form = createForm({
      subscription: {},
      initialValues: { title: 'Mr' },
      onSubmit, validate: validateSchema(formSchema.reduce((acc, val) => ({...acc, ...val}), {})) // combined formSchema sections
    })
    return (
        <Modal
          {...{ visible, onCancel }}
          width={600}
          title="Complete your signup"
          okText="Submit"
          className="signup-modal"
          onOk={() => {
            form.submit()
          }}
        >
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
        </Modal>
    );
};


export default SignupModal;
