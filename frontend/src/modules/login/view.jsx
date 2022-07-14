import React, { useState, useEffect, useRef } from "react";
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
  Modal,
} from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import "./styles.scss";
import DataHubIcon from "../../images/auth/data-hub.png";
import NetworkIcon from "../../images/auth/network.png";
import { ReactComponent as LinkedinIcon } from "../../images/auth/linkedin.svg";
import { ReactComponent as GoogleIcon } from "../../images/auth/google.svg";
import { ReactComponent as EmailIcon } from "../../images/auth/email.svg";
import { useHistory, useLocation } from "react-router-dom";
const { Title, Link } = Typography;
import { Form as FinalForm, Field } from "react-final-form";
import { auth0Client } from "../../utils/misc";
import ForgotPassword from "./forgot-password";
import SignUp from "../email-signup/view";
import { eventTrack } from "../../utils/misc";

function Login({ handleOnClickBtnNext, visible, close }) {
  const history = useHistory();
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
    eventTrack("Authentication", "Email", "Button");
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
    eventTrack("Authentication", "Google", "Button");
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
          <div className="signin-button">
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
                className="connect-back-button"
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
                className="connect-back-button"
                onClick={() => setSignUp(!signup)}
              >
                {"<"} Back to connect options
              </Button>
            ) : (
              <Button
                type="text"
                className="connect-back-button"
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
      className="login"
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
              <div className="auth-container">
                {!signin ? (
                  <div className="signup-wrapper">
                    <div className="auth-buttons">
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
                      organisation and apply for GPML membership
                    </p>
                  </div>
                ) : (
                  <div className="login-wrapper">
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
                                loading={loading}
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
    </Modal>
  );
}

export default Login;
