import React, { useState, useRef } from 'react'
import { Col, Row, Typography, Form, Input, Divider, notification } from 'antd'
import styles from './login-style.module.scss'
import LinkedinIcon from '../../images/auth/linkedin.svg'
import GoogleIcon from '../../images/auth/google.svg'
import EmailIcon from '../../images/auth/email.svg'
const { Title } = Typography
import { Form as FinalForm, Field } from 'react-final-form'
import { auth0Client } from '../../utils/misc'
import ForgotPassword from './forgot-password'
import SignUp from '../email-signup/view'
import { Trans, t } from '@lingui/macro'
import Button from '../../components/button'

function Login({}) {
  const [loading, setLoading] = useState(false)
  const [signin, setSignIn] = useState(false)
  const [signup, setSignUp] = useState(false)
  const [forgotPassword, setForgotPassword] = useState(false)
  const [form] = Form.useForm()

  const [initialValues, setInitialValues] = useState({})
  const formRef = useRef()

  // useEffect(() => {
  //   if (location?.state) {
  //     setSignIn(true);
  //   }
  // }, [location]);

  const handleOnLogin = async (values) => {
    setLoading(true)
    const username = values.email
    const password = values.password
    auth0Client.login(
      {
        realm: 'Username-Password-Authentication',
        username,
        password,
      },
      (err, authResult) => {
        if (err) {
          console.log(err)
          setLoading(false)
          notification.error({
            message: err.description,
          })
          return
        }
        if (authResult) {
          // window.origin = window.location.origin;
          console.log(authResult)
          setLoading(false)
          //window.origin = window.location.origin;
        }
      }
    )
  }

  const handleGoogleLogin = () => {
    try {
      auth0Client.authorize(
        {
          connection: 'google-oauth2',
        },
        (error, response) => {
          console.log(response)
        }
      )
    } catch (error) {
      console.log(error)
    }
  }

  const handleLinkedinLogin = () => {
    try {
      auth0Client.authorize(
        {
          connection: 'linkedin',
        },
        (error, response) => {
          console.log(response)
        }
      )
    } catch (error) {
      console.log(error)
    }
  }

  const checkValidation = (values) => {
    const errors = {}
    if (!values.email?.trim()) {
      errors.email = 'Please enter email address'
    }
    if (!values.password?.trim()) {
      errors.password = 'Please enter password'
    }
    return errors
  }

  return (
    <div className={styles.login}>
      <div className="ui container wave-background">
        <Row>
          <Col span={24}>
            {forgotPassword ? (
              <ForgotPassword
                setSignIn={setSignIn}
                setForgotPassword={setForgotPassword}
              >
                <div className="connect-button">
                  <p className="header-text">
                    <Trans>FORGOT PASSWORD</Trans>
                  </p>
                  <Button
                    type="link"
                    className="connect-back-button"
                    onClick={() => {
                      setSignIn(true)
                      setForgotPassword(false)
                    }}
                  >
                    {'<'}
                    <Trans>Back to connect options</Trans>
                  </Button>
                </div>
              </ForgotPassword>
            ) : signup ? (
              <SignUp setSignUp={setSignUp}>
                <div className="connect-button">
                  <p className="header-text">
                    <Trans>SIGN UP</Trans>
                  </p>
                  <Button
                    type="link"
                    className="connect-back-button"
                    onClick={() => setSignUp(!signup)}
                  >
                    {'<'} <Trans>Back to connect options</Trans>
                  </Button>
                </div>
              </SignUp>
            ) : (
              <div className="auth-container">
                {!signin ? (
                  <div className="signup-wrapper">
                    <div className="signinButton">
                      <p className="header-text">
                        <Trans>SIGN IN</Trans>
                      </p>
                    </div>
                    <div className="auth-buttons">
                      <Button
                        ghost
                        icon={
                          <div className="icon">
                            <LinkedinIcon />
                          </div>
                        }
                        onClick={handleLinkedinLogin}
                      >
                        <Trans>CONTINUE WITH LINKEDIN</Trans>
                      </Button>
                      <Button
                        ghost
                        icon={
                          <div className="icon">
                            <GoogleIcon />
                          </div>
                        }
                        onClick={handleGoogleLogin}
                      >
                        <Trans>CONTINUE WITH GOOGLE</Trans>
                      </Button>
                      <div className="separator">
                        <Title level={4}>or</Title>
                      </div>
                      <Button
                        ghost
                        icon={
                          <div className="icon">
                            <EmailIcon />
                          </div>
                        }
                        onClick={() => setSignIn(!signin)}
                      >
                        <Trans>CONTINUE WITH EMAIL</Trans>
                      </Button>
                    </div>
                    <p className="register-text">
                      <Trans>
                        Once you have an account you can register your
                        organisation and apply for GPML membership
                      </Trans>
                    </p>
                  </div>
                ) : (
                  <div className="login-wrapper">
                    <div className="connect-button">
                      <p className="header-text">
                        <Trans>CONTINUE WITH EMAIL</Trans>
                      </p>
                      <Button
                        type="link"
                        className={styles.connectBackButton}
                        onClick={() => setSignIn(!signin)}
                      >
                        {'<'} <Trans>Back to connect options</Trans>
                      </Button>
                    </div>
                    <div className="login-form">
                      <FinalForm
                        initialValues={initialValues}
                        validate={checkValidation}
                        onSubmit={handleOnLogin}
                        render={({ handleSubmit, submitting, form }) => {
                          formRef.current = form
                          return (
                            <Form layout="vertical">
                              <Form.Item label="Email">
                                <Field name="email">
                                  {({ input, meta }) => (
                                    <>
                                      <Input
                                        {...input}
                                        size="small"
                                        placeholder={t`Enter your email`}
                                      />
                                      {meta.touched && meta.error && (
                                        <p color="error" className="error">
                                          {meta.error}
                                        </p>
                                      )}
                                    </>
                                  )}
                                </Field>
                              </Form.Item>
                              <Form.Item label="Password">
                                <Field name="password">
                                  {({ input, meta }) => (
                                    <>
                                      <Input.Password
                                        {...input}
                                        size="small"
                                        placeholder={t`Enter your password`}
                                      />
                                      {meta.touched && meta.error && (
                                        <p color="error" className="error">
                                          {meta.error}
                                        </p>
                                      )}
                                    </>
                                  )}
                                </Field>
                              </Form.Item>
                              <Button
                                style={{ marginTop: 50 }}
                                ghost
                                className="login-button"
                                loading={loading}
                                onClick={() => handleSubmit()}
                              >
                                <Trans>LOGIN WITH EMAIL</Trans>
                              </Button>{' '}
                              <Button
                                type="link"
                                className="forgot-password"
                                onClick={() =>
                                  setForgotPassword(!forgotPassword)
                                }
                              >
                                <Trans>Forgot password?</Trans>
                              </Button>
                            </Form>
                          )
                        }}
                      />
                      <Divider />
                      <div className="join-wrapper">
                        <Title level={2}>
                          <Trans>Don’t have an account yet?</Trans>
                        </Title>
                        <Button
                          shape="round"
                          className="login-button"
                          onClick={() => setSignUp(true)}
                        >
                          <Trans>JOIN WITH EMAIL</Trans>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>
        <div className="terms">
          <Title level={4}>
            <Trans>By signing up you are agreeing to our</Trans>{' '}
            <a
              href="/privacy-policy-and-terms-of-use.pdf"
              target="_blank"
              rel="noreferrer"
              className="copy-right"
            >
              <Trans>terms and services</Trans>
            </a>
          </Title>
        </div>
      </div>
    </div>
  )
}

export default Login
