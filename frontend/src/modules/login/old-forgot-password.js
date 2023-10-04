import React, { useState, useEffect, useRef } from 'react'
import {
  Carousel,
  Col,
  Row,
  Typography,
  Button,
  Avatar,
  Form,
  Input,
  Divider,
  notification,
} from 'antd'
import styles from './oldStyles.module.scss'
import { Form as FinalForm, Field } from 'react-final-form'
import { auth0Client } from '../../utils/misc'

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
                  <Form.Item label="Email" style={{ marginBottom: 40 }}>
                    <Field name="email">
                      {({ input, meta }) => (
                        <>
                          <Input {...input} placeholder="Enter your email" />
                          {meta.touched && meta.error && (
                            <p color="error" className={styles.error}>
                              {meta.error}
                            </p>
                          )}
                        </>
                      )}
                    </Field>
                  </Form.Item>
                  <Button
                    type="primary"
                    shape="round"
                    className={styles.loginButton}
                    onClick={() => handleSubmit()}
                    style={{ marginTop: 20 }}
                  >
                    SEND ME A LINK
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
