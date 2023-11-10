import React, { useState, useRef } from 'react'
import { Form, Input, notification } from 'antd'
import styles from './styles.module.scss'
import { Form as FinalForm, Field } from 'react-final-form'
import { auth0Client } from '../../utils/misc'
import Button from '../../components/button'
import FormLabel from '../../components/form-label'
import { Trans, t } from '@lingui/macro'

function ForgotPassword({ setSignIn, setForgotPassword, children }) {
  const [form] = Form.useForm()

  const [initialValues, setInitialValues] = useState({})
  const formRef = useRef()

  const handleOnForgotPassword = async (values) => {
    const email = values.email
    auth0Client.changePassword(
      {
        connection: 'Username-Password-Authentication',
        email: email,
      },
      (err, authResult) => {
        if (err) {
          console.log(err)
        }
        if (authResult) {
          notification.success({
            message: authResult,
          })
          setForgotPassword(false)
          console.log(authResult)
          //window.origin = window.location.origin;
        }
      }
    )
  }

  const checkValidation = (values) => {
    const errors = {}
    if (!values.email?.trim()) {
      errors.email = 'Please enter email address'
    }
    return errors
  }

  return (
    <div className={styles.authContainer} style={{ paddingBottom: 40 }}>
      <div className={styles.loginWrapper}>
        {children && children}
        <div className={styles.loginForm}>
          <FinalForm
            initialValues={initialValues}
            validate={checkValidation}
            onSubmit={handleOnForgotPassword}
            render={({ handleSubmit, submitting, form }) => {
              formRef.current = form
              return (
                <Form layout="vertical">
                  <Field name="email">
                    {({ input, meta }) => {
                      const hasError = meta.touched && !meta.valid
                      const validVal =
                        input?.value && meta.valid ? 'success' : null
                      const validateStatus = hasError ? 'error' : validVal
                      return (
                        <FormLabel
                          htmlFor="email"
                          label={<Trans>Email</Trans>}
                          meta={meta}
                          validateStatus={validateStatus}
                        >
                          <Input
                            {...input}
                            size="small"
                            placeholder={t`Enter your email`}
                          />
                          {meta.touched && meta.error && (
                            <p color="error" className={styles.error}>
                              {meta.error}
                            </p>
                          )}
                        </FormLabel>
                      )
                    }}
                  </Field>
                  <Button
                    className={styles.loginButton}
                    onClick={() => handleSubmit()}
                    style={{ marginTop: 20 }}
                  >
                    <Trans>SEND ME A LINK</Trans>
                  </Button>{' '}
                </Form>
              )
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
