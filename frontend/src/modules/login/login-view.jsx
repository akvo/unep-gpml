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
} from "antd";
import styles from "./login-style.module.scss";
import { ReactComponent as LinkedinIcon } from "../../images/auth/linkedin.svg";
import { ReactComponent as GoogleIcon } from "../../images/auth/google.svg";
import { ReactComponent as EmailIcon } from "../../images/auth/email.svg";
import { useHistory, useLocation } from "react-router-dom";
const { Title, Link } = Typography;
import { Form as FinalForm, Field } from "react-final-form";
import { auth0Client } from "../../utils/misc";
import ForgotPassword from "./forgot-password";
import SignUp from "../email-signup/view";

function Login({ handleOnClickBtnNext, visible, close }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [signin, setSignIn] = useState(false);
  const [signup, setSignUp] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [form] = Form.useForm();

  const [initialValues, setInitialValues] = useState({});
  const formRef = useRef();

  useEffect(() => {
    if (location?.state) {
      setSignIn(true);
    }
  }, [location]);

  const handleOnLogin = async (values) => {
    setLoading(true);
    const username = values.email;
    const password = values.password;
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
          window.origin = window.location.origin;
          console.log(authResult);
          setLoading(false);
          //window.origin = window.location.origin;
        }
      }
    );
  };

  const handleGoogleLogin = () => {
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
    <div id="login">
      <div className="ui container wave-background">
        <Row>
          <Col span={24}>
            {forgotPassword ? (
              <ForgotPassword
                setSignIn={setSignIn}
                setForgotPassword={setForgotPassword}
              >
                <div className="connect-button">
                  <Button type="text">FORGOT PASSWORD</Button>
                  <Button
                    type="text"
                    className="connect-back-button"
                    onClick={() => {
                      setSignIn(true);
                      setForgotPassword(false);
                    }}
                  >
                    {"<"} Back to connect options
                  </Button>
                </div>
              </ForgotPassword>
            ) : signup ? (
              <SignUp setSignUp={setSignUp}>
                <div className="connect-button">
                  <Button type="text">SIGN UP</Button>
                  <Button
                    type="text"
                    className="connect-back-button"
                    onClick={() => setSignUp(!signup)}
                  >
                    {"<"} Back to connect options
                  </Button>
                </div>
              </SignUp>
            ) : (
              <div className="auth-container">
                {!signin ? (
                  <div className="signup-wrapper">
                    <div className="signin-button">
                      <Button type="text">SIGN IN</Button>
                    </div>
                    <div className="auth-buttons">
                      <Button
                        type="primary"
                        shape="round"
                        icon={<LinkedinIcon />}
                        onClick={handleOnClickBtnNext}
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
                      organisation and apply for GPML membership
                    </p>
                  </div>
                ) : (
                  <div className="login-wrapper">
                    <div className="connect-button">
                      <Button type="text">CONTINUE WITH EMAIL</Button>
                      <Button
                        type="text"
                        className="connect-back-button"
                        onClick={() => setSignIn(!signin)}
                      >
                        {"<"} Back to connect options
                      </Button>
                    </div>
                    <div className="login-form">
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
                                className="login-button"
                                onClick={() => handleSubmit()}
                              >
                                LOGIN WITH EMAIL
                              </Button>{" "}
                              <Button
                                type="text"
                                className="forgot-password"
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
                      <div className="join-wrapper">
                        <Title level={2}>Don’t have an account yet?</Title>
                        <Button
                          type="primary"
                          shape="round"
                          className="login-button"
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
            By signing up you are agreeing to our terms and services.
          </Title>
        </div>
      </div>
    </div>
  );
}

export default Login;
