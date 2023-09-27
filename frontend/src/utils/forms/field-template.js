import { UIStore } from '../../store'
import React from 'react'
import Form from 'antd/lib/form'
import WrapIfAdditional from './wrap-if-additional'

const VERTICAL_LABEL_COL = { span: 24 }
const VERTICAL_WRAPPER_COL = { span: 24 }
const LABEL_STYLE = { marginBottom: '-3px' }

const FieldTemplate = ({
  children,
  classNames,
  description,
  disabled,
  displayLabel,
  // errors,
  // fields,
  formContext,
  help,
  hidden,
  id,
  label,
  onDropPropertyClick,
  onKeyChange,
  rawDescription,
  rawErrors,
  rawHelp,
  readonly,
  required,
  schema,
  // uiSchema,
}) => {
  const {
    colon,
    labelCol = VERTICAL_LABEL_COL,
    wrapperCol = VERTICAL_WRAPPER_COL,
    wrapperStyle,
  } = formContext

  // custom
  const highlight = UIStore.useState((s) => s.highlight)

  if (hidden) {
    return <div className="field-hidden">{children}</div>
  }

  const subTitle = schema?.subTitle

  const renderFieldErrors = () =>
    [...new Set(rawErrors)].map((error) => (
      <div key={`field-${id}-error-${error}`}>{error}</div>
    ))

  // custom
  const handleCustomLabel = () => {
    if (displayLabel) {
      if (!required) {
        return (
          <p className="field-label" style={LABEL_STYLE}>
            {label}
            <span
              style={{
                color: '#c2c2c2',
                fontStyle: 'italic',
                fontWeight: 'normal',
                marginLeft: '3px',
              }}
            >
              {' '}
              - Optional
            </span>
          </p>
        )
      }
      return (
        <p className="field-label" style={LABEL_STYLE}>
          {label}
        </p>
      )
    }
    return ''
  }

  return (
    <WrapIfAdditional
      classNames={classNames}
      disabled={disabled}
      formContext={formContext}
      id={id}
      label={label}
      onDropPropertyClick={onDropPropertyClick}
      onKeyChange={onKeyChange}
      readonly={readonly}
      required={required}
      schema={schema}
    >
      {id === 'root' ? (
        children
      ) : (
        <>
          {subTitle && <h4 style={{ marginBottom: 0 }}>{subTitle}</h4>}
          <Form.Item
            colon={colon}
            // extra={!!rawDescription && description}
            // hasFeedback={schema.type !== "array" && schema.type !== "object"}
            help={(!!rawHelp && help) || (!!rawErrors && renderFieldErrors())}
            htmlFor={id}
            label={handleCustomLabel()}
            labelCol={labelCol}
            // required={required}
            style={wrapperStyle}
            validateStatus={
              (!!rawErrors && required) ||
              (!!rawErrors && !required) ||
              (!!rawErrors &&
                required &&
                schema.type !== 'array' &&
                schema.type !== 'object')
                ? 'error'
                : highlight &&
                  required &&
                  schema.type !== 'array' &&
                  schema.type !== 'object' &&
                  !!rawErrors === false
                ? 'success'
                : undefined
            }
            wrapperCol={wrapperCol}
          >
            {children}
          </Form.Item>
        </>
      )}
    </WrapIfAdditional>
  )
}

export default FieldTemplate
