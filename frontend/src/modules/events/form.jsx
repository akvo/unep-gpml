import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Button } from "antd";
import { Form as FinalForm, Field } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
import { createForm } from 'final-form'
import { FieldsFromSchema, validateSchema } from "../../utils/form-utils";
import { languages, countries } from 'countries-list'
import countries2to3 from 'countries-list/dist/countries2to3.json'
import specificAreasOptions from './specific-areas.json'
import api from '../../utils/api';
import { cloneDeep } from 'lodash';

const geoCoverageTypeOptions = [
  'Global', 'Regional', 'National', 'Sub-national', 'Transnational', 'Global with elements in specific areas'
]
const regionOptions = ['Africa', 'Asia and the Pacific', 'East Asia', 'Europe', 'Latin America and Carribean', 'North America', 'West Asia']

const GeoCoverageInput = (props) => {
  return (
    <Field name="geoCoverageType" render={
      ({ input: typeInput }) => {
        return <Field name="geoCoverageValue" render={
          ({ input }) => {
            if(typeInput.value === 'Global') return <Input disabled />
            if (typeInput.value === 'Sub-national') return <Input placeholder="Type regions here..." {...input} />
            if(typeInput.value === 'Other') return <Input placeholder="Type here..." {...input} />
            const selectProps = {...input}
            if(typeInput.value === 'Regional'){
              selectProps.options = regionOptions.map(it => ({ value: it, label: it }))
            }
            else if(typeInput.value === 'National' || typeInput.value === 'Transnational'){
              selectProps.options = Object.keys(countries).map(iso2 => ({ value: countries2to3[iso2], label: countries[iso2].name }))
              selectProps.showSearch = true
              selectProps.filterOption = (input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              if (typeInput.value === 'Transnational'){
                selectProps.mode = 'multiple'
              }
            }
            else if (typeInput.value === 'Global with elements in specific areas'){
              selectProps.options = specificAreasOptions.map(it => ({ value: it, label: it }))
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

const defaultFormSchema = [
  {
    title: { label: 'Title', required: true },
    date: { label: 'Date', required: true, control: 'date-range' },
    urls: {
      type: 'array',
      addLabel: 'Add language',
      items: {
        url: { label: 'URL', required: true, addonBefore: 'https://' },
        lang: { label: 'Language', required: true, control: 'select', showSearch: true, options: Object.keys(languages).map(langCode => ({ value: langCode, label: languages[langCode].name })) }
      }
    },
    description: { label: 'Event description', control: 'textarea' },
    photo: { label: 'Photo', control: 'file' }
  },
  {
    city: { label: 'City' },
    country: { label: 'Country', control: 'select', showSearch: true, options: Object.keys(countries).map(iso2 => ({ value: countries2to3[iso2], label: countries[iso2].name})) },
    geoCoverageType: { label: 'Geo coverage type', required: true, control: 'select', options: geoCoverageTypeOptions.map(it => ({ value: it.toLowerCase(), label: it })) },
    geoCoverageValue: {
      label: 'Geo coverage',
      render: GeoCoverageInput
    },
    language: { label: 'Event language', control: 'select', showSearch: true, options: Object.keys(languages).map(langCode => ({ value: langCode, label: languages[langCode].name })) }
  },
  {
    info: { label: 'Additional info', control: 'textarea'},
    tags: { label: 'Tags', control: 'select', options: [], loading: true, mode: 'multiple' }
  }
]

const AddEventForm = () => {
  const [formSchema, setFormSchema] = useState(defaultFormSchema)
  const onSubmit = (vals) => {
    const data = {...vals}
    delete data.date
    data.urls = vals.urls.filter(it => it.url.length > 0)
    data.startDate = vals.date[0].toISOString()
    data.endDate = vals.date[1].toISOString()
    api.post('/event', data)
  }
  useEffect(() => {
    (async function fetchData() {
      const response = await api.get('/tag/event')
      const newSchema = cloneDeep(defaultFormSchema);
      newSchema[2].tags.options = response.data.map(x => ({ value: x, label: x }))
      newSchema[2].tags.loading = false
      setFormSchema(newSchema);
    })()
  }, [])
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
            ({ form: { mutators }, handleSubmit }) => {
              return (
                <div>
                  <div className="section">
                    <h3>Event details</h3>
                    <FieldsFromSchema schema={formSchema[0]} mutators={mutators} />
                  </div>
                  <div className="section">
                    <h2>Location & coverage</h2>
                    <FieldsFromSchema schema={formSchema[1]} />
                  </div>
                  <div className="section">
                    <h2>Other</h2>
                    <FieldsFromSchema schema={formSchema[2]} />
                  </div>
                  <Button type="primary" size="large" onClick={() => handleSubmit()}>Add event</Button>
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