import React, { useState, useRef } from 'react'
import {
  Col,
  Row,
  Typography,
  Form,
  Input,
  Upload,
  Switch,
  Select,
  Tag,
  notification,
} from 'antd'
const { Title } = Typography
const { Dragger } = Upload
import styles from './styles.module.scss'
import { FileTextOutlined } from '@ant-design/icons'
import { Form as FinalForm, Field } from 'react-final-form'
import { auth0Client } from '../../utils/misc'
import { UIStore } from '../../store'
import { useRouter } from 'next/router'
import Button from '../../components/button'

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
      errors.firstName = 'Please select first name'
    }
    if (!values.lastName?.trim()) {
      errors.lastName = 'Please select last name'
    }
    if (!values.country) {
      errors.country = 'Please select country'
    }
    if (!values.password) {
      console.log(values)
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
    setLoading(true);
    localStorage.setItem(
      "redirect_on_login",
      JSON.stringify({
        pathname: router.pathname,
        query: router.query,
      })
    );
    auth0Client.redirect.signupAndLogin(
      {
        connection: 'Username-Password-Authentication',
        email: data.email,
        password: data.password,
        user_metadata: {
          ...data,
          publicEmail: data.publicEmail.toString(),
          country: data.country.toString(),
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
          setLoading(false);
          router.push(
            {
              pathname: "/onboarding",
              query: { data: data },
            },
            "/onboarding"
          );
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
    <div className={styles.signup}>
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
                    {({ input, meta }) => (
                      <Form.Item label="Email">
                        <Input
                          {...input}
                          status={meta.touched && meta.error ? 'error' : null}
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
                        <div className="public-email-switch">
                          <Switch
                            key="publicEmail"
                            name="publicEmail"
                            onChange={(checked) =>
                              formRef.current?.change('publicEmail', checked)
                            }
                          />
                          &nbsp;&nbsp;&nbsp;
                          {'Show my email address on public listing'}
                        </div>
                      </Form.Item>
                    )}
                  </Field>
                  <Form.Item label="Password" name="password">
                    <Field name="password" validate={passwordValidation}>
                      {({ input, meta }) => (
                        <>
                          <Input.Password
                            {...input}
                            status={meta.touched && meta.error ? 'error' : null}
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
                        </>
                      )}
                    </Field>
                  </Form.Item>
                  <Form.Item label="Retype Password" name="confirm">
                    <Field name="confirm">
                      {({ input, meta }) => (
                        <>
                          <Input.Password
                            {...input}
                            status={meta.touched && meta.error ? 'error' : null}
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
                        </>
                      )}
                    </Field>
                  </Form.Item>
                  <Input.Group compact className="title-group">
                    <Form.Item
                      label="Title"
                      name={'title'}
                      className="title-dropdown-container"
                    >
                      <Field name="title">
                        {({ input, meta }) => (
                          <>
                            {' '}
                            <Select
                              status={
                                meta.touched && meta.error ? 'error' : null
                              }
                              onChange={(value) => input.onChange(value)}
                              virtual={false}
                              placeholder="Title"
                              allowClear
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
                          </>
                        )}
                      </Field>
                    </Form.Item>
                    <Form.Item label="Last Name" name="lastName">
                      <Field name="lastName">
                        {({ input, meta }) => (
                          <>
                            <Input
                              {...input}
                              status={
                                meta.touched && meta.error ? 'error' : null
                              }
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
                          </>
                        )}
                      </Field>
                    </Form.Item>
                  </Input.Group>
                  <Form.Item label="First Name" name="firstName">
                    <Field name="firstName">
                      {({ input, meta }) => (
                        <>
                          <Input
                            {...input}
                            status={meta.touched && meta.error ? 'error' : null}
                            placeholder="First Name"
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
                        </>
                      )}
                    </Field>
                  </Form.Item>
                  {/* <Form.Item
                    label={
                      <p>
                        Photo <span>OPTIONAL</span>
                      </p>
                    }
                    name="photo"
                  >
                    <Dragger
                      accept="image/png, image/jpeg"
                      onChange={handleFileChange}
                      onRemove={handleFileRemove}
                      beforeUpload={() => false}
                      maxCount={1}
                    >
                      <p className="ant-upload-drag-icon">
                        <FileTextOutlined />
                      </p>
                      <p className="ant-upload-text">Drag file here</p>
                      <p className="ant-upload-hint">
                        <span>or</span> Browse your computer
                      </p>
                    </Dragger>
                  </Form.Item> */}
                  <Form.Item label="Country" name="country">
                    <Field name="country">
                      {({ options, input, meta, control, ...props }) => {
                        return (
                          <>
                            <Select
                              onChange={(value) => input.onChange(value)}
                              placeholder="Search Country"
                              allowClear
                              showSearch
                              virtual={false}
                              filterOption={(input, option) =>
                                option.children
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                              status={
                                meta.touched && meta.error ? 'error' : null
                              }
                            >
                              {countries?.map((it) => (
                                <Select.Option value={it.id} key={it.id}>
                                  {it.name}
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
                          </>
                        )
                      }}
                    </Field>
                  </Form.Item>
                  <Button
                    disabled={submitting}
                    loading={loading}
                    htmlType="submit"
                    className="next-button"
                    onClick={() => handleSubmit()}
                    withArrow="link"
                  >
                    Next
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
