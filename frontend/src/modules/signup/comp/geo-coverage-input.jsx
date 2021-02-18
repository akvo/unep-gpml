import React from "react";
import { Input, Select } from "antd";
import { Field } from 'react-final-form'
import specificAreasOptions from '../../events/specific-areas.json'
import { countries } from 'countries-list'
import countries2to3 from 'countries-list/dist/countries2to3.json'
const regionOptions = ['Africa', 'Asia and the Pacific', 'East Asia', 'Europe', 'Latin America and Caribbean', 'North America', 'West Asia']

const GeoCoverageInput = (props) => {
  const { disabled } = props
  return (
    <Field key={props.name} name={props.input.name.replace('Value', 'Type')} render={
      ({ input: typeInput, name }) => {
        return <Field key={name} name={props.input.name} render={
          ({ input }) => {
            if (typeInput.value === 'global') return <Input disabled />
            if (typeInput.value === 'sub-national') return <Input placeholder="Type regions here..." {...input} disabled={disabled} />
            if (typeInput.value === 'Other') return <Input placeholder="Type here..." {...input} disabled={disabled} />
            const selectProps = { ...input, disabled }
            if (typeInput.value === 'regional') {
              if(input.value === '' || input?.[0] === '') input.onChange([])
              selectProps.options = regionOptions.map(it => ({ value: it, label: it }))
              selectProps.mode = 'multiple'
            }
            else if (typeInput.value === 'national' || typeInput.value === 'transnational') {
              selectProps.options = Object.keys(countries).map(iso2 => ({ value: countries2to3[iso2], label: countries[iso2].name }))
              selectProps.showSearch = true
              selectProps.filterOption = (input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              if (typeInput.value === 'transnational') {
                if (input.value === '' || input?.[0] === '') input.onChange([])
                selectProps.mode = 'multiple'
              }
            }
            else if (typeInput.value === 'global with elements in specific areas') {
              selectProps.options = specificAreasOptions.map(it => ({ value: it, label: it }))
              selectProps.mode = 'multiple'
              if (input.value === '' || input?.[0] === '') input.onChange([])
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

export default GeoCoverageInput
