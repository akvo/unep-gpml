import React, { useEffect, useState } from "react";
import { Modal, Form } from "antd";
import { Form as FinalForm } from 'react-final-form'
import { createForm } from 'final-form'
import FinalField from '../../utils/final-field'
import api from "../../utils/api";
import { cloneDeep } from "lodash";
import './styles.scss'

const sectorOptions = ['Governments', 'Private Sector', 'NGOs and MGS', 'Academia and Scientific Community', 'IGOs and multi - lateral processes', 'Other']
const defaultFormSchema = [
  {
    firstName: { label: 'First name', required: true },
    lastName: { label: 'Last name', required: true},
    linkedIn: { label: 'LinkedIn'},
    twitter: { label: 'Twitter' },
    photo: { label: 'Photo', control: 'file' }
  },
  {
    orgName: { label: 'Organisation name'},
    orgUrl: { label: 'Organisation URL'},
    sector: { label: 'Representative sector', control: 'select', options: sectorOptions.map(it => ({ value: it, label: it })) },
    country: { label: 'Country', control: 'select', showSearch: true, options: [{ value: 'loading', label: 'Loading' }], autoComplete: 'off' }
  },
  {
    about: { label: 'About yourself', control: 'textarea', required: true }
  }
]

const validate = (schema) => (values) => {
  const errors = {}
  Object.keys(schema).filter(it => schema[it].required).forEach(itemName => {
    if(!values[itemName]){
      errors[itemName] = 'Required'
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
      newSchema[1].country.options = response.data.map(x => ({ value: x.isoCode, label: x.name}));
      setFormSchema(newSchema);
    })()
  }, []);
    const onSubmit = (vals) => {
      console.log('SUBMIT', vals)
    }
    const form = createForm({
      subscription: {},
      onSubmit, validate: validate(formSchema.reduce((acc, val) => ({...acc, ...val}), {})) // combined formSchema sections
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
                      <FieldsFromSchema schema={formSchema[1]} />
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

const FieldsFromSchema = ({schema}) => {
  return Object.keys(schema).map(name => {
    return <FinalField {...{ name, ...schema[name] }} />
  })
}

export default SignupModal;
