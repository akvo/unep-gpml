import React from 'react'
import { Input, InputNumber, Select, DatePicker, Form } from 'antd'
import { Field } from 'react-final-form'
// import moment from 'moment'
import FileWidget from './forms/form-file'

const { Item } = Form

const inputNumberAmountFormatting = (currencySymbol) => {
  const step = 1000
  if (currencySymbol !== undefined) {
    const currencyRegExp = new RegExp(`\\${currencySymbol}\\s?|(,*)`, 'g')
    return ({
      formatter: value => `${currencySymbol} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      parser: value => value.replace(currencyRegExp, ''),
      step
    })
  }
  return ({
    formatter: value => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    parser: value => value.replace(/(,*)/g, ''),
    step
  })
}

const validateNumber = (string) => {
  if (string === '') return false
  const regex = /[0-9]|\./
  return String(string).split('').map(char => regex.test(char)).reduce((val, acc) => val && acc)
}
const CONTROLS = {
  input: ({ input, meta, control, ...props }) => {
    return <Input {...{ ...input, ...props }} />
  },
  'input-number': ({ input, meta, control, currencySymbol, ...props }) => {
    return <InputNumber {...{ value: input.value, onChange: (val) => { if (validateNumber(val)) input.onChange(val) }, ...inputNumberAmountFormatting(currencySymbol), min: 1, ...props }} />
  },
  textarea: ({ input, meta, control, ...props }) => <Input.TextArea {...{ ...input, ...props }} />,
  select: ({ options, input, meta, control, ...props }) => {
    const allProps = {
      ...input, ...props
    }
    if(props.mode === 'multiple' && input.value === '') allProps.value = []
    if(props.showSearch){
      allProps.filterOption = (input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
    return (
      <Select {...allProps}>
        {options.map(({ label, value }) => <Select.Option key={value} value={value}>{label}</Select.Option>)}
      </Select>
    )
  },
  file: ({ input }) => {
    return (
      <FileWidget {...input} />
    )
  }
  // datepicker: ({ input, disabled, dispatch, ...props }) => {
  //   // transform value to be stored to formatted string
  //   let value = (input.value && typeof input.value === 'string') ? moment(input.value, datePickerConfig.format) : input.value
  //   if (!value) value = null
  //   const _props = { ...props }
  //   for (let i = 1; i <= 11; i += 1) delete _props[`section${i}`]
  //   const onChange = val => input.onChange(val !== null ? val.format(datePickerConfig.format) : null)
  //   return <DatePicker {...{ value, onChange, disabled, ...datePickerConfig, ..._props }} />
  // }
}

const FinalField = ({ name, ...props }) => {
  return (
    <Field
      name={name}
      component={Control}
      {...props}
    />
  )
}

const Control = (props) => {
  const { required, label, control = 'input', meta, render, ..._props } = props
  return (
    <Item
      validateStatus={(meta.error && meta.touched) ? 'error' : ''}
      help={meta.error && meta.touched && meta.error}
      label={[<span key={label}>{label}</span>, required ? '' : <i key={1}> - optional</i>]}
    >
      {control != null ? CONTROLS[control]({ ..._props }) : render({ ..._props })}
    </Item>
  )
}

export default FinalField
