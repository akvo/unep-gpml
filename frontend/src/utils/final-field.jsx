import React from 'react'
import {
  Input,
  InputNumber,
  Select,
  DatePicker,
  Form,
  Switch,
  AutoComplete,
} from 'antd'
import { Field } from 'react-final-form'
// import moment from 'moment'
import FileWidget from './forms/form-file'

const { Item } = Form

const inputNumberAmountFormatting = (currencySymbol) => {
  const step = 1000
  if (currencySymbol !== undefined) {
    const currencyRegExp = new RegExp(`\\${currencySymbol}\\s?|(,*)`, 'g')
    return {
      formatter: (value) =>
        `${currencySymbol} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      parser: (value) => value.replace(currencyRegExp, ''),
      step,
    }
  }
  return {
    formatter: (value) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    parser: (value) => value.replace(/(,*)/g, ''),
    step,
  }
}

const validateNumber = (string) => {
  if (string === '') {
    return false
  }
  const regex = /[0-9]|\./
  return String(string)
    .split('')
    .map((char) => regex.test(char))
    .reduce((val, acc) => val && acc)
}

const CONTROLS = {
  input: ({ input, meta, control, ...props }) => {
    return <Input size="small" {...{ ...input, ...props }} />
  },
  'input-number': ({ input, meta, control, currencySymbol, ...props }) => {
    return (
      <InputNumber
        {...{
          value: input.value,
          onChange: (val) => {
            if (validateNumber(val)) {
              input.onChange(val)
            }
          },
          ...inputNumberAmountFormatting(currencySymbol),
          min: 1,
          ...props,
        }}
      />
    )
  },
  textarea: ({ input, meta, control, ...props }) => (
    <Input.TextArea {...{ ...input, ...props }} />
  ),
  select: ({ options, input, meta, control, ...props }) => {
    const allProps = {
      ...input,
      ...props,
    }
    if (props.mode === 'multiple' && input.value === '') {
      allProps.value = []
    }
    if (props.showSearch && !props.filterOption) {
      allProps.filterOption = (input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
    return (
      <Select {...allProps} virtual={false}>
        {options?.map(({ label, value }, i) => (
          <Select.Option
            key={`${label}-${value}-${i.toString(36)}`}
            value={value}
          >
            {label}
          </Select.Option>
        ))}
      </Select>
    )
  },
  autocomplete: ({ input, options, ...props }) => {
    const allProps = {
      ...input,
      options,
      onSearch: props.onSearch,
      onChange: (v, e) => {
        props.onChange && props.onChange(v, true)
        return input.onChange(v, e)
      },
      onSelect: (v, e) => {
        props.onSelect && props.onSelect(v, true)
      },
    }
    return <AutoComplete {...allProps} />
  },
  file: ({ input, accept, maxFileSize, ...props }) => {
    return <FileWidget {...input} accept={accept} maxFileSize={maxFileSize} />
  },
  'date-range': ({ input, ...props }) => {
    return (
      <DatePicker.RangePicker {...{ ...input, ...props }} format="DD/MM/YYYY" />
    )
  },
  switch: ({ input, ...props }) => {
    return (
      <>
        <Switch key={props.text} {...{ ...input, ...props }} />
        &nbsp;&nbsp;&nbsp;{props.text}{' '}
      </>
    )
  },
  // datepicker: ({ input, disabled, dispatch, ...props }) => {
  //   // transform value to be stored to formatted string
  //   let value = (input.value && typeof input.value === 'string') ? moment(input.value, datePickerConfig.format) : input.value
  //   if (!value) {value = null}
  //   const _props = { ...props }
  //   for (let i = 1; i <= 11; i += 1) {delete _props[`section${i}`]}
  //   const onChange = val => input.onChange(val !== null ? val.format(datePickerConfig.format) : null)
  //   return <DatePicker {...{ value, onChange, disabled, ...datePickerConfig, ..._props }} />
  // }
}

const FinalField = ({ name, ...props }) => {
  return (
    <Field
      name={name}
      component={Control}
      validate={(value, allValues) => {
        if (props.required && !value) {
          return 'Required'
        } else if (
          props.required &&
          Array.isArray(value) &&
          value.length === 0
        ) {
          return 'Required'
        } else {
          return undefined
        }
      }}
      {...props}
    />
  )
}

const Control = (props) => {
  if (props.fullRender) {
    return props.render(props)
  }
  const { required, label, control = 'input', meta, render, ..._props } = props
  return (
    <Item
      validateStatus={meta.error && meta.touched ? 'error' : ''}
      help={meta.error && meta.touched && meta.error}
      label={[
        <span key={label}>{label}</span>,
        required ? '' : <i key={1}> - optional</i>,
      ]}
    >
      {!render ? CONTROLS[control]({ ..._props }) : render(_props)}
    </Item>
  )
}

export default FinalField
