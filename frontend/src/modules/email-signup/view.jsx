import React, { useState, useRef } from 'react'
import { Col, Row, Form, Input, Switch, Select, notification } from 'antd'
import styles from './styles.module.scss'
import { Form as FinalForm, Field } from 'react-final-form'
import { auth0Client } from '../../utils/misc'
import { UIStore } from '../../store'
import { useRouter } from 'next/router'
import Button from '../../components/button'
import FormLabel from '../../components/form-label'
import {
  DropDownIcon,
  SearchIcon,
  PasswordVisibleIcon,
  PasswordIcon,
} from '../../components/icons'

const mountedStyle = {
  animation: 'inAnimation 250ms ease-in',
}
const unmountedStyle = {
  animation: 'outAnimation 270ms ease-out',
  animationFillMode: 'forwards',
}

function EmailJoin({ setSignUp, children }) {
  const router = useRouter()
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
  }))
  const [initialValues, setInitialValues] = useState({ publicEmail: false })
  const [loading, setLoading] = useState(false)
  const formRef = useRef()

  const checkValidation = (values) => {
    const errors = {}
    if (!values.email?.trim()) {
      errors.email = 'Please enter email address'
    }
    if (!values.title?.trim()) {
      errors.title = 'Please select title'
    }
    if (!values.firstName?.trim()) {
      errors.firstName = 'Please enter first name'
    }
    if (!values.lastName?.trim()) {
      errors.lastName = 'Please enter last name'
    }
    if (!values.password) {
      const uppercaseRegExp = /(?=.*?[A-Z])/
      const lowercaseRegExp = /(?=.*?[a-z])/
      const digitsRegExp = /(?=.*?[0-9])/
      const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/
      const minLengthRegExp = /.{8,}/
      const passwordLength = values?.password?.length
      const uppercasePassword = uppercaseRegExp.test(values.password)
      const lowercasePassword = lowercaseRegExp.test(values.password)
      const digitsPassword = digitsRegExp.test(values.password)
      const specialCharPassword = specialCharRegExp.test(values.password)
      const minLengthPassword = minLengthRegExp.test(values.password)
      let errMsg = ''
      if (passwordLength === 0) {
        errMsg = 'Password is empty'
      } else if (!uppercasePassword) {
        errMsg = 'At least one Uppercase'
      } else if (!lowercasePassword) {
        errMsg = 'At least one Lowercase'
      } else if (!digitsPassword) {
        errMsg = 'At least one digit'
      } else if (!specialCharPassword) {
        errMsg = 'At least one Special Characters'
      } else if (!minLengthPassword) {
        errMsg = 'At least minumum 8 characters'
      } else {
        errMsg = ''
      }
      errors.password = errMsg
    }
    if (!values.confirm) {
      errors.confirm = 'Required'
    } else if (values.confirm !== values.password) {
      errors.confirm = 'Must match'
    }
    return errors
  }

  const passwordValidation = (value) => {
    const uppercaseRegExp = /(?=.*?[A-Z])/
    const lowercaseRegExp = /(?=.*?[a-z])/
    const digitsRegExp = /(?=.*?[0-9])/
    const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/
    const minLengthRegExp = /.{8,}/
    const passwordLength = value?.length
    const uppercasePassword = uppercaseRegExp.test(value)
    const lowercasePassword = lowercaseRegExp.test(value)
    const digitsPassword = digitsRegExp.test(value)
    const specialCharPassword = specialCharRegExp.test(value)
    const minLengthPassword = minLengthRegExp.test(value)
    if (passwordLength === 0) {
      return 'Password is empty'
    } else if (!uppercasePassword) {
      return 'At least one Uppercase'
    } else if (!lowercasePassword) {
      return 'At least one Lowercase'
    } else if (!digitsPassword) {
      return 'At least one digit'
    } else if (!specialCharPassword) {
      return 'At least one Special Characters'
    } else if (!minLengthPassword) {
      return 'At least minumum 8 characters'
    } else {
      return ''
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    localStorage.setItem(
      'redirect_on_login',
      JSON.stringify({
        pathname: router.pathname,
        query: router.query,
      })
    )
    auth0Client.redirect.signupAndLogin(
      {
        connection: 'Username-Password-Authentication',
        email: data.email,
        password: data.password,
        user_metadata: {
          ...data,
          publicEmail: false.toString(),
          country: '',
        },
      },
      function (err) {
        if (err) {
          setLoading(false)
          if (err?.code === 'invalid_signup') {
            notification.error({
              message: 'user already exist',
            })
          }
          return err
        } else {
          setLoading(false)
          router.push(
            {
              pathname: '/onboarding',
              query: { data: data },
            },
            '/onboarding'
          )
        }
      }
    )
  }

  const handleFileChange = ({ file, fileList }) => {
    formRef.current?.change('photo', file)
  }

  const handleFileRemove = ({ file }) => {
    formRef.current?.change('photo', '')
  }

  return (
    <div className={`${styles.signup} signup`}>
      {children && children}
      <Row className="join-form">
        <Col span={24}>
          <FinalForm
            initialValues={initialValues}
            validate={checkValidation}
            onSubmit={onSubmit}
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
                          label="Email"
                          meta={meta}
                          validateStatus={validateStatus}
                        >
                          <Input
                            {...input}
                            size="small"
                            placeholder="Enter your email"
                          />
                          {meta.touched && meta.error && (
                            <p
                              color="error"
                              className="error transitionDiv"
                              style={
                                meta.touched && meta.error
                                  ? mountedStyle
                                  : unmountedStyle
                              }
                            >
                              {meta.error}
                            </p>
                          )}
                        </FormLabel>
                      )
                    }}
                  </Field>
                  <Field name="password" validate={passwordValidation}>
                    {({ input, meta }) => {
                      const hasError = meta.touched && !meta.valid
                      const validVal =
                        input?.value && meta.valid ? 'success' : null
                      const validateStatus = hasError ? 'error' : validVal
                      return (
                        <FormLabel
                          htmlFor="password"
                          label="Password"
                          meta={meta}
                          validateStatus={validateStatus}
                        >
                          <Input.Password
                            size="small"
                            {...input}
                            placeholder="Choose your password"
                          />
                          {meta.touched && meta.error && (
                            <p
                              color="error"
                              className="error transitionDiv"
                              style={
                                meta.touched && meta.error
                                  ? mountedStyle
                                  : unmountedStyle
                              }
                            >
                              {meta.error}
                            </p>
                          )}
                        </FormLabel>
                      )
                    }}
                  </Field>
                  <Field name="confirm">
                    {({ input, meta }) => {
                      const hasError = meta.touched && !meta.valid
                      const validVal =
                        input?.value && meta.valid ? 'success' : null
                      const validateStatus = hasError ? 'error' : validVal
                      return (
                        <FormLabel
                          htmlFor="retypePassword"
                          label="Retype your password"
                          meta={meta}
                          validateStatus={validateStatus}
                        >
                          <Input.Password
                            {...input}
                            size="small"
                            placeholder="Retype your password"
                          />
                          {meta.touched && meta.error && (
                            <p
                              color="error"
                              className="error transitionDiv"
                              style={
                                meta.touched && meta.error
                                  ? mountedStyle
                                  : unmountedStyle
                              }
                            >
                              {meta.error}
                            </p>
                          )}
                        </FormLabel>
                      )
                    }}
                  </Field>
                  <Input.Group compact className="title-group">
                    <Field name="title">
                      {({ input, meta }) => {
                        const hasError = meta.touched && !meta.valid
                        const validVal =
                          input?.value && meta.valid ? 'success' : null
                        const validateStatus = hasError ? 'error' : validVal
                        return (
                          <FormLabel
                            htmlFor="title"
                            label="Title"
                            meta={meta}
                            validateStatus={validateStatus}
                          >
                            <Select
                              onChange={(value) => input.onChange(value)}
                              virtual={false}
                              placeholder="Title"
                              allowClear
                              size="small"
                              showArrow
                              suffixIcon={<DropDownIcon />}
                            >
                              {['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'].map((it) => (
                                <Select.Option value={it} key={it}>
                                  {it}
                                </Select.Option>
                              ))}
                            </Select>
                            {meta.touched && meta.error && (
                              <p
                                color="error"
                                className="error transitionDiv"
                                style={
                                  meta.touched && meta.error
                                    ? mountedStyle
                                    : unmountedStyle
                                }
                              >
                                {meta.error}
                              </p>
                            )}
                          </FormLabel>
                        )
                      }}
                    </Field>
                    <Field name="lastName">
                      {({ input, meta }) => {
                        const hasError = meta.touched && !meta.valid
                        const validVal =
                          input?.value && meta.valid ? 'success' : null
                        const validateStatus = hasError ? 'error' : validVal
                        return (
                          <FormLabel
                            htmlFor="lastName"
                            label="Last Name"
                            meta={meta}
                            validateStatus={validateStatus}
                          >
                            <Input
                              {...input}
                              size="small"
                              placeholder="Last Name"
                            />
                            {meta.touched && meta.error && (
                              <p
                                color="error"
                                className="error transitionDiv"
                                style={
                                  meta.touched && meta.error
                                    ? mountedStyle
                                    : unmountedStyle
                                }
                              >
                                {meta.error}
                              </p>
                            )}
                          </FormLabel>
                        )
                      }}
                    </Field>
                  </Input.Group>
                  <Field name="firstName">
                    {({ input, meta }) => {
                      const hasError = meta.touched && !meta.valid
                      const validVal =
                        input?.value && meta.valid ? 'success' : null
                      const validateStatus = hasError ? 'error' : validVal
                      return (
                        <FormLabel
                          htmlFor="firstName"
                          label="First Name"
                          meta={meta}
                          validateStatus={validateStatus}
                        >
                          <Input {...input} placeholder="First Name" />
                          {meta.touched && meta.error && (
                            <p
                              color="error"
                              className="error transitionDiv"
                              style={
                                meta.touched && meta.error
                                  ? mountedStyle
                                  : unmountedStyle
                              }
                            >
                              {meta.error}
                            </p>
                          )}
                        </FormLabel>
                      )
                    }}
                  </Field>
                  <Button
                    ghost
                    disabled={submitting}
                    loading={loading}
                    htmlType="submit"
                    className="next-button"
                    onClick={() => handleSubmit()}
                    withArrow
                  >
                    Sign Up
                  </Button>
                </Form>
              )
            }}
          />
        </Col>
      </Row>
    </div>
  )
}

export default EmailJoin
