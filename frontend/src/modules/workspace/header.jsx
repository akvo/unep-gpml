import React from "react";
import { PageHeader, Row, Col } from "antd";

const Header = ({ userName }) => {
  return (
    <Row type="flex" className="bg-dark-primary header-container">
      <Col>
        <PageHeader
          title={
            <span className="header-text text-white">
              {userName !== false && (
                <>Hi {userName}, welcome to your workspace</>
              )}
            </span>
          }
        />
      </Col>
    </Row>
  );
};

export default Header;
