import React from "react";
import { Col, Row, Button, Typography } from "antd";
const { Title, Link } = Typography;

function AffiliationOption({ handleOnClickBtnBack, handleOnClickBtnNext }) {
  return (
    <div className="ui container step-form">
      <Row justify="center" align="middle">
        <Col span={24}>
          <div className="text-wrapper">
            <Title level={2}>Are you affiliated to an entity?</Title>
          </div>
          <div className="buttons-wrapper">
            <div>
              <Button onClick={handleOnClickBtnNext}>Yes</Button>
            </div>
            <div>
              <Button onClick={handleOnClickBtnNext}>No</Button>
              <Title level={5}>I’m a private citizen</Title>
            </div>
          </div>
        </Col>
      </Row>
      <Row className="button-bottom-panel">
        <Col span={24}>
          <Button className="step-button-back" onClick={handleOnClickBtnBack}>
            {"<"} Back
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default AffiliationOption;
