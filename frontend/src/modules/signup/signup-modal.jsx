import React, { useEffect, useState } from "react";
import { Modal, Form } from "antd";
import { Form as FinalForm } from 'react-final-form'
import { createForm } from 'final-form'
import FinalField from '../../utils/final-field'
import api from "../../utils/api";
import { cloneDeep } from "lodash";

const defaultFormSchema = [
  [
    { name: 'firstName', label: 'First name', required: true },
    { name: 'lastName', label: 'Last name', required: true },
    { name: 'linkedIn', label: 'LinkedIn' },
    { name: 'twitter', label: 'Twitter' },
    { name: 'photo', label: 'Photo', control: 'file' }
  ],
  [
    { name: 'orgName', label: 'Organisation Name' },
    { name: 'orgUrl', label: 'Organisation URL', prefix: 'https://' },
    { name: 'sector', label: 'Representative sector', control: 'select', mode: 'multiple', options: ['Sector 1', 'Sector 2'].map(it => ({ value: it, label: it}))},
    { name: 'country', label: 'Country', control: 'select', showSearch: true, options: [{ value: 'loading', label: 'Loading' }] }
  ],
  [
    { name: 'about', label: 'About yourself', control: 'textarea', required: true }
  ]
]

const validate = (schema) => (values) => {
  const errors = {}
  schema.filter(it => it.required).forEach(item => {
    if(!values[item.name]){
      errors[item.name] = 'Required'
    }
  })
  return errors
}

const SignupModal = ({ visible, onCancel }) => {
  const [formSchema, setFormSchema] = useState(defaultFormSchema)
  useEffect(() => {
    (async function fetchData() {
      const response = await api.get('/country')
      const newSchema = cloneDeep(defaultFormSchema);
      newSchema[1].find(it => it.name === 'country').options = response.data.map(x => ({ value: x.name, label: x.name}));
      setFormSchema(newSchema);
    })()
  }, []);
    const onSubmit = (vals) => {
      console.log(vals)
    }
    const form = createForm({
      subscription: {},
      onSubmit, validate: validate(formSchema.reduce((acc, val) => [...acc, ...val], []))
    })
    return (
        <Modal
          {...{ visible, onCancel }}
          width={600}
          title="Complete your signup"
          okText="Submit"
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
                      {formSchema[0].map(field => <FinalField {...field} />)}
                    </div>
                    <div className="section">
                      <h2>Organisation details</h2>
                      {formSchema[1].map(field => <FinalField {...field} />)}
                    </div>
                    <div className="section">
                      <h2>Additional</h2>
                      {formSchema[2].map(field => <FinalField {...field} />)}
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
