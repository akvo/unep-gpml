import React from 'react'
import { Form } from 'antd'
import { FieldErrorIcon, FieldSuccessIcon } from './icons'

const Feedback = ({ status }) => {
  const items = {
    success: {
      text: 'Success',
      icon: <FieldSuccessIcon />,
    },
    error: {
      text: 'Error',
      icon: <FieldErrorIcon />,
    },
  }
  const statusItem = items?.[status] || items.success
  return (
    <span className="feedback-wrapper">
      <span className={`feedback-text ${status}`}>{statusItem.text}</span>
      <span>{statusItem.icon}</span>
    </span>
  )
}

const FormLabel = ({
  children,
  meta,
  label,
  validateStatus = null,
  className = null,
  isOptional = false,
  ...props
}) => {
  const statusText =
    meta?.touched && meta?.error
      ? 'error'
      : meta?.touched && !meta?.error && !isOptional
      ? 'success'
      : null
  const status = validateStatus || statusText
  return (
    <Form.Item
      className={className}
      label={
        <span className="hasFeedback">
          <span>{label}</span>
          {isOptional && !meta.error && (
            <span className="feedback-wrapper">
              <span className="optional">(Optional)</span>
            </span>
          )}
          {status && <Feedback status={status} />}
        </span>
      }
      {...props}
    >
      {children}
    </Form.Item>
  )
}

export default FormLabel
