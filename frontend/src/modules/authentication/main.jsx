import React, { useState } from "react";
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
import { LinkedinOutlined, GoogleOutlined } from "@ant-design/icons";
import DataHubIcon from "../../images/auth/data-hub.png";
import NetworkIcon from "../../images/auth/network.png";
import { ReactComponent as LinkedinIcon } from "../../images/auth/linkedin.svg";
import { ReactComponent as GoogleIcon } from "../../images/auth/google.svg";
import { ReactComponent as EmailIcon } from "../../images/auth/email.svg";
const { Title, Link } = Typography;

function Main({ handleOnClickBtnNext }) {
  const [singin, setSignIn] = useState(false);
  const [form] = Form.useForm();

  return (
    <div className="ui container wave-background">
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
                Once you have an account you can register your organisation and
                apply for the GPML membership
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
                  <Button type="text" onClick={() => setSignIn(!singin)}>
                    SIGN IN
                  </Button>
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
                    onClick={handleOnClickBtnNext}
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
                    onClick={handleOnClickBtnNext}
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
                  <Form form={form} layout="vertical">
                    <Form.Item label="EMAIL">
                      <Input placeholder="Enter your email" />
                    </Form.Item>
                    <Form.Item label="Password" name="password">
                      <Input.Password placeholder="Enter your password" />
                    </Form.Item>
                    <Button
                      type="primary"
                      shape="round"
                      className="login-button"
                      onClick={handleOnClickBtnNext}
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
                  </Form>{" "}
                  <Divider />
                  <div className="join-wrapper">
                    <Title level={2}>Don’t have an account yet?</Title>
                    <Button
                      type="primary"
                      shape="round"
                      className="login-button"
                      onClick={() => setSignIn(!singin)}
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
  );
}

export default Main;
