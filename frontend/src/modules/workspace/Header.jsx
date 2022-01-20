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
                <>
                  Welcome back, <b className="user-name">{userName}</b>
                </>
              )}
            </span>
          }
        />
      </Col>
    </Row>
  );
};

export default Header;
