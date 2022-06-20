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
} from "antd";
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

function Login({ handleOnClickBtnNext }) {
  const history = useHistory();
  const location = useLocation();
  const [singin, setSignIn] = useState(false);
  const [form] = Form.useForm();

  const [initialValues, setInitialValues] = useState({});
  const formRef = useRef();

  useEffect(() => {
    if (location?.state) {
      setSignIn(true);
    }
  }, [location]);

  const handleOnLogin = async (values) => {
    const username = values.email;
    const password = values.password;
    console.log(auth0Client);
    auth0Client.login(
      {
        realm: "Username-Password-Authentication",
        username,
        password,
      },
      (err, authResult) => {
        if (err) {
          console.log(err);
          alert("Error", err.description);
          return;
        }
        if (authResult) {
          window.origin = window.location.origin;
          console.log(authResult);
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
      <div
        className="ui container wave-background"
        style={{
          background:
            "linear-gradient(to left,#fff 50%,rgba(255, 255, 255, 0.51) 50%)",
        }}
      >
        <Row>
          <Col span={12}>
            <div className="slider-container">
              <Carousel effect="fade">
                <div>
                  <div className="slider-wrapper">
                    <Avatar
                      src={DataHubIcon}
                      size={100}
                      style={{
                        borderRadius: "initial",
                        margin: "0 auto 40px auto",
                        display: "block",
                      }}
                    />
                    <Title level={2}>
                      Access a data hub to guide efforts towards SDGs and more
                    </Title>
                  </div>
                </div>
                <div>
                  <div className="slider-wrapper">
                    <Avatar
                      src={NetworkIcon}
                      size={100}
                      style={{
                        borderRadius: "initial",
                        margin: "0 auto 40px auto",
                        display: "block",
                      }}
                    />
                    <Title level={2}>Network with other stakeholders</Title>
                  </div>
                </div>
              </Carousel>
              <div className="slider-bottom-panel">
                <Title level={2}>
                  Once you have an account you can register your organisation
                  and apply for the GPML membership
                </Title>
                <Link href="https://ant.design" target="_blank">
                  FIND OUT MORE {">"}
                </Link>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="auth-container">
              {!singin ? (
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
                      onClick={() => setSignIn(!singin)}
                    >
                      CONTINUE WITH EMAIL
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="login-wrapper">
                  <div className="connect-button">
                    <Button type="text">CONTINUE WITH EMAIL</Button>
                    <Button
                      type="text"
                      className="connect-back-button"
                      onClick={() => setSignIn(!singin)}
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
                              onClick={() => setSignIn(!singin)}
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
                        onClick={() => history.push("/stakeholder-signup-new")}
                      >
                        JOIN WITH EMAIL
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="terms">
                <Title level={4}>
                  By signing up you are agreeing to our terms and services.
                </Title>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Login;
