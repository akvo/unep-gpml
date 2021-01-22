import React from 'react'
import { Modal, Form, Input, Select } from "antd";
import { Form as FinalForm, Field } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
import { createForm } from 'final-form'
import { FieldsFromSchema, validateSchema } from "../../utils/form-utils";

const formSchema = [
  {
    title: { label: 'Title', required: true },
    date: { label: 'Date', required: true, control: 'date-range' },
    urls: {
      type: 'array',
      addLabel: 'Add language',
      items: {
        url: { label: 'URL', required: true, addonBefore: 'https://' },
        lang: { label: 'Language', required: true, control: 'select', options: [{ value: 'en', label: 'English'}] }
      }
    },
    description: { label: 'Event description', control: 'textarea' },
    photo: { label: 'Photo', control: 'file' }
  }
]

const AddEventForm = () => {
  const onSubmit = () => {

  }
  const form = createForm({
    subscription: {},
    initialValues: { urls: [{ url: '', lang: 'en' }] },
    mutators: {
    ...arrayMutators
    },
    onSubmit, validate: validateSchema(formSchema.reduce((acc, val) => ({ ...acc, ...val }), {})) // combined formSchema sections
  })
  return (
    <div className="add-event-form">
      <Form layout="vertical">
        <FinalForm
          form={form}
          render={
            ({ form: { mutators }}) => {
              return (
                <div>
                  <div className="section">
                    <h3>Event details</h3>
                    <FieldsFromSchema schema={formSchema[0]} mutators={mutators} />
                  </div>
                  {/* <div className="section">
                    <h2>Organisation details</h2>
                    <FieldsFromSchema schema={formSchema[1]} />
                  </div>
                  <div className="section">
                    <h2>Other</h2>
                    <FieldsFromSchema schema={formSchema[2]} />
                  </div> */}
                </div>
              )
            }
          }
        />
      </Form>
    </div>
  )
}

export default AddEventForm