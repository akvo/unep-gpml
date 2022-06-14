import React, { useState } from "react";
import "./styles.scss";
import { Carousel, Col, Row, Typography, Button, Avatar } from "antd";
const { Title, Link } = Typography;
import { LinkedinOutlined, GoogleOutlined } from "@ant-design/icons";
import DataHubIcon from "../../images/auth/data-hub.png";
import NetworkIcon from "../../images/auth/network.png";

function Authentication() {
  return (
    <div id="authentication">
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
            <div className="login-container">
              <div className="signin-button">
                <Button type="text">SIGN IN</Button>
              </div>
              <div className="auth-buttons">
                <Button
                  type="primary"
                  shape="round"
                  icon={<LinkedinOutlined />}
                >
                  CONTINUE WITH LINKEDIN
                </Button>
                <Button type="primary" shape="round" icon={<GoogleOutlined />}>
                  CONTINUE WITH GOOGLE
                </Button>
                <div className="separator">
                  <Title level={4}>or</Title>
                </div>
                <Button type="primary" shape="round" icon={<GoogleOutlined />}>
                  CONTINUE WITH EMAIL
                </Button>
              </div>
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

export default Authentication;
