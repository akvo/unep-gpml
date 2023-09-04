import React from 'react'
import classNames from 'classnames'
import { FieldErrorIcon, FieldSuccessIcon } from './icons'

const ErrorSign = () => {
  return (
    <span className="feedback-wrapper">
      <span className="feedback-text error">Error</span>
      <span>
        <FieldErrorIcon />
      </span>
    </span>
  )
}

const SuccessSign = () => {
  return (
    <span className="feedback-wrapper">
      <span className="feedback-text success">Success</span>
      <span>
        <FieldSuccessIcon />
      </span>
    </span>
  )
}

const FormLabel = ({
  children,
  className = null,
  status = null,
  meta,
  ...props
}) => {
  const statusText =
    meta.touched && meta.error
      ? 'error'
      : meta.touched && !meta.error
      ? 'success'
      : status
  return (
    <div class={classNames('ant-col ant-form-item-label', className)}>
      <label {...props}>{children}</label>
      <span>
        {statusText === 'error' && <ErrorSign />}
        {statusText === 'success' && <SuccessSign />}
      </span>
    </div>
  )
}

export default FormLabel
