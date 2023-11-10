import React, { useState, useEffect, useRef } from 'react'
import {
  Col,
  Row,
  Typography,
  Form,
  Input,
  Divider,
  notification,
  Modal,
} from 'antd'
import { CloseCircleOutlined } from '@ant-design/icons'
import styles from './styles.module.scss'
import LinkedinIcon from '../../images/auth/linkedin.svg'
import GoogleIcon from '../../images/auth/google.svg'
import EmailIcon from '../../images/auth/email.svg'
const { Title } = Typography
import { Form as FinalForm, Field } from 'react-final-form'
import { auth0Client } from '../../utils/misc'
import ForgotPassword from './forgot-password'
import SignUp from '../email-signup/view'
import { eventTrack } from '../../utils/misc'
import { useRouter } from 'next/router'
import Button from '../../components/button'
import FormLabel from '../../components/form-label'
import { Trans, t } from '@lingui/macro'

function Login({ visible, close }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [signin, setSignIn] = useState(false)
  const [signup, setSignUp] = useState(false)
  const [forgotPassword, setForgotPassword] = useState(false)
  const [form] = Form.useForm()

  const [initialValues, setInitialValues] = useState({})
  const formRef = useRef()

  useEffect(() => {
    if (Object.keys(router?.query).length) {
      setSignIn(true)
    }
  }, [router])

  const handleOnLogin = async (values) => {
    eventTrack('Authentication', 'Email', 'Button')
    setLoading(true)
    const username = values.email
    const password = values.password
    localStorage.setItem('redirect_on_login', JSON.stringify(router.asPath))
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
          setLoading(false)
        }
      }
    )
  }

  const handleGoogleLogin = () => {
    eventTrack('Authentication', 'Google', 'Button')
    localStorage.setItem('redirect_on_login', JSON.stringify(router.asPath))
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
    eventTrack('Authentication', 'Linkedin', 'Button')
    localStorage.setItem('redirect_on_login', JSON.stringify(router.asPath))
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
    <Modal
      title={
        <>
          <div className="signinButton">
            <p className="header-text">
              {!signin
                ? t`SIGN IN`
                : forgotPassword
                ? t`FORGOT PASSWORD`
                : signup
                ? t`JOIN WITH EMAIL`
                : t`CONTINUE WITH EMAIL`}
            </p>
            {!signin ? (
              <Button type="link" onClick={close}>
                <Trans>CANCEL</Trans>
                <CloseCircleOutlined />
              </Button>
            ) : forgotPassword ? (
              <Button
                type="link"
                className={styles.connectBackButton}
                onClick={() => {
                  setSignIn(true)
                  setForgotPassword(false)
                }}
              >
                {'<'} <Trans>Back to connect options</Trans>
              </Button>
            ) : signup ? (
              <Button
                type="link"
                className={styles.connectBackButton}
                onClick={() => setSignUp(!signup)}
              >
                {'<'} <Trans>Back to connect options</Trans>
              </Button>
            ) : (
              <Button
                type="link"
                className={styles.connectBackButton}
                onClick={() => setSignIn(!signin)}
              >
                {'<'} <Trans>Back to connect options</Trans>
              </Button>
            )}
          </div>
        </>
      }
      centered
      visible={visible}
      footer={false}
      className={styles.login}
      closable={false}
      onCancel={close}
    >
      <div>
        <Row>
          <Col span={24}>
            {forgotPassword ? (
              <ForgotPassword
                setSignIn={setSignIn}
                setForgotPassword={setForgotPassword}
              />
            ) : signup ? (
              <SignUp setSignUp={setSignUp} />
            ) : (
              <div className={styles.authContainer}>
                {!signin ? (
                  <div className={styles.signupWrapper}>
                    <div className={styles.authButtons}>
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
                        organisation and apply for Global Partnership on Plastic
                        Pollution and Marine Litter membership
                      </Trans>
                    </p>
                  </div>
                ) : (
                  <div className={styles.loginWrapper}>
                    <div className={styles.loginForm}>
                      <FinalForm
                        initialValues={initialValues}
                        validate={checkValidation}
                        onSubmit={handleOnLogin}
                        render={({ handleSubmit, submitting, form }) => {
                          formRef.current = form
                          return (
                            <Form layout="vertical">
                              <Field name="email">
                                {({ input, meta }) => {
                                  const hasError = meta.touched && !meta.valid
                                  const validVal =
                                    input?.value && meta.valid
                                      ? 'success'
                                      : null
                                  const validateStatus = hasError
                                    ? 'error'
                                    : validVal
                                  return (
                                    <>
                                      <FormLabel
                                        htmlFor="email"
                                        label={<Trans>Email</Trans>}
                                        meta={meta}
                                        validateStatus={validateStatus}
                                      >
                                        <Input
                                          size="small"
                                          {...input}
                                          placeholder={t`Enter your email`}
                                        />
                                        {meta.touched && meta.error && (
                                          <p color="error" className="error">
                                            {meta.error}
                                          </p>
                                        )}
                                      </FormLabel>
                                    </>
                                  )
                                }}
                              </Field>
                              <Field name="password">
                                {({ input, meta }) => {
                                  const hasError = meta.touched && !meta.valid
                                  const validVal =
                                    input?.value && meta.valid
                                      ? 'success'
                                      : null
                                  const validateStatus = hasError
                                    ? 'error'
                                    : validVal
                                  return (
                                    <>
                                      <FormLabel
                                        htmlFor="password"
                                        label={<Trans>Password</Trans>}
                                        meta={meta}
                                        validateStatus={validateStatus}
                                      >
                                        <Input.Password
                                          size="small"
                                          {...input}
                                          placeholder={t`Enter your password`}
                                        />
                                        {meta.touched && meta.error && (
                                          <p color="error" className="error">
                                            {meta.error}
                                          </p>
                                        )}
                                      </FormLabel>
                                    </>
                                  )
                                }}
                              </Field>
                              <Button
                                style={{ marginTop: 50 }}
                                ghost
                                className={styles.loginButton}
                                loading={loading}
                                onClick={() => handleSubmit()}
                              >
                                <Trans>LOGIN WITH EMAIL</Trans>
                              </Button>{' '}
                              <Button
                                type="link"
                                className={styles.forgotPassword}
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
                      <div className={styles.joinWrapper}>
                        <Title level={2}>
                          <Trans>Don’t have an account yet?</Trans>
                        </Title>
                        <Button
                          ghost
                          className={styles.loginButton}
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
    </Modal>
  )
}

export default Login
