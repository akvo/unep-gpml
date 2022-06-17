import React from "react";
import { Col, Row, Button, Typography } from "antd";
const { Title, Link } = Typography;

function AffiliationOption({ handleAffiliationChange, next }) {
  return (
    <>
      <Row justify="center" align="middle">
        <Col span={24}>
          <div className="text-wrapper">
            <Title level={2}>Are you affiliated to an entity?</Title>
          </div>
          <div className="buttons-wrapper">
            <div>
              <Button
                onClick={() => {
                  handleAffiliationChange(false);
                  next(4);
                }}
              >
                Yes
              </Button>
            </div>
            <div>
              <Button
                onClick={() => {
                  handleAffiliationChange(true);
                  next(3);
                }}
              >
                No
              </Button>
              <Title level={5}>I’m a private citizen</Title>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
}

export default AffiliationOption;
