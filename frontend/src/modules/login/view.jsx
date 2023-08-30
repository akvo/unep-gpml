import React, { useState, useEffect, useRef } from "react";
import {
  Col,
  Row,
  Typography,
  Button,
  Form,
  Input,
  Divider,
  notification,
  Modal,
} from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import styles from "./styles.module.scss";
import LinkedinIcon from "../../images/auth/linkedin.svg";
import GoogleIcon from "../../images/auth/google.svg";
import EmailIcon from "../../images/auth/email.svg";
const { Title } = Typography;
import { Form as FinalForm, Field } from "react-final-form";
import { auth0Client } from "../../utils/misc";
import ForgotPassword from "./forgot-password";
import SignUp from "../email-signup/view";
import { eventTrack } from "../../utils/misc";
import { useRouter } from "next/router";

function Login({ visible, close }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [signin, setSignIn] = useState(false);
  const [signup, setSignUp] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [form] = Form.useForm();

  const [initialValues, setInitialValues] = useState({});
  const formRef = useRef();

  useEffect(() => {
    if (Object.keys(router?.query).length) {
      setSignIn(true);
    }
  }, [router]);

  const handleOnLogin = async (values) => {
    eventTrack("Authentication", "Email", "Button");
    setLoading(true);
    const username = values.email;
    const password = values.password;
    localStorage.setItem("redirect_on_login", JSON.stringify(router.asPath));
    auth0Client.login(
      {
        realm: "Username-Password-Authentication",
        username,
        password,
      },
      (err, authResult) => {
        if (err) {
          console.log(err);
          setLoading(false);
          notification.error({
            message: err.description,
          });
          return;
        }
        if (authResult) {
          setLoading(false);
        }
      }
    );
  };

  const handleGoogleLogin = () => {
    eventTrack("Authentication", "Google", "Button");
    localStorage.setItem("redirect_on_login", JSON.stringify(router.asPath));
    try {
      auth0Client.authorize(
        {
          connection: "google-oauth2",
        },
        (error, response) => {
          console.log(response);
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleLinkedinLogin = () => {
    eventTrack("Authentication", "Linkedin", "Button");
    localStorage.setItem("redirect_on_login", JSON.stringify(router.asPath));
    try {
      auth0Client.authorize(
        {
          connection: "linkedin",
        },
        (error, response) => {
          console.log(response);
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const checkValidation = (values) => {
    const errors = {};
    if (!values.email?.trim()) {
      errors.email = "Please enter email address";
    }
    if (!values.password?.trim()) {
      errors.password = "Please enter password";
    }
    return errors;
  };

  return (
    <Modal
      title={
        <>
          <div className="signinButton">
            <p className="header-text">
              {!signin
                ? "SIGN IN"
                : forgotPassword
                ? "FORGOT PASSWORD"
                : signup
                ? "JOIN WITH EMAIL"
                : "CONTINUE WITH EMAIL"}
            </p>
            {!signin ? (
              <div onClick={close}>
                <p>CANCEL</p>
                <CloseCircleOutlined />
              </div>
            ) : forgotPassword ? (
              <Button
                type="text"
                className={styles.connectBackButton}
                onClick={() => {
                  setSignIn(true);
                  setForgotPassword(false);
                }}
              >
                {"<"} Back to connect options
              </Button>
            ) : signup ? (
              <Button
                type="text"
                className={styles.connectBackButton}
                onClick={() => setSignUp(!signup)}
              >
                {"<"} Back to connect options
              </Button>
            ) : (
              <Button
                type="text"
                className={styles.connectBackButton}
                onClick={() => setSignIn(!signin)}
              >
                {"<"} Back to connect options
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
                        type="primary"
                        shape="round"
                        icon={<LinkedinIcon />}
                        onClick={handleLinkedinLogin}
                      >
                        CONTINUE WITH LINKEDIN
                      </Button>
                      <Button
                        type="primary"
                        shape="round"
                        icon={<GoogleIcon />}
                        onClick={handleGoogleLogin}
                      >
                        CONTINUE WITH GOOGLE
                      </Button>
                      <div className="separator">
                        <Title level={4}>or</Title>
                      </div>
                      <Button
                        type="primary"
                        shape="round"
                        icon={<EmailIcon />}
                        onClick={() => setSignIn(!signin)}
                      >
                        CONTINUE WITH EMAIL
                      </Button>
                    </div>
                    <p className="register-text">
                      Once you have an account you can register your
                      organisation and apply for Global Partnership on Plastic
                      Pollution and Marine Litter membership
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
                          formRef.current = form;
                          return (
                            <Form layout="vertical">
                              <Form.Item label="Email">
                                <Field name="email">
                                  {({ input, meta }) => (
                                    <>
                                      <Input
                                        {...input}
                                        placeholder="Enter your email"
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
                                        placeholder="Enter your password"
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
                                type="primary"
                                shape="round"
                                className={styles.loginButton}
                                loading={loading}
                                onClick={() => handleSubmit()}
                              >
                                LOGIN WITH EMAIL
                              </Button>{" "}
                              <Button
                                type="text"
                                className={styles.forgotPassword}
                                onClick={() =>
                                  setForgotPassword(!forgotPassword)
                                }
                              >
                                Forgot password?
                              </Button>
                            </Form>
                          );
                        }}
                      />
                      <Divider />
                      <div className={styles.joinWrapper}>
                        <Title level={2}>Don’t have an account yet?</Title>
                        <Button
                          type="primary"
                          shape="round"
                          className={styles.loginButton}
                          onClick={() => setSignUp(true)}
                        >
                          JOIN WITH EMAIL
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
            By signing up you are agreeing to our{" "}
            <a
              href="/privacy-policy-and-terms-of-use.pdf"
              target="_blank"
              rel="noreferrer"
              className="copy-right"
            >
              terms and services
            </a>
            .
          </Title>
        </div>
      </div>
    </Modal>
  );
}

export default Login;
