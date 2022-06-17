import React from "react";
import { Col, Row, Button, Typography } from "antd";
import GettingStartedIcon from "../../images/auth/getting-started.png";
const { Title, Link } = Typography;

function GettingStarted({ handleOnClickBtnNext }) {
  return (
    <>
      <Row justify="center" align="middle">
        <Col span={12}>
          <div className="text-wrapper">
            <Title level={2}>
              You’re almost set! <br /> We need to ask a few more questions to
              make the platform relevant to you.
            </Title>
          </div>
        </Col>
        <Col span={12}>
          <div className="image-wrapper">
            <img src={GettingStartedIcon} alt="getting-started" />
          </div>
        </Col>
      </Row>
    </>
  );
}

export default GettingStarted;
