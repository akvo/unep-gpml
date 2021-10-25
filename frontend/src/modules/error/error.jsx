import React from "react";
import { Row, Col, Result, Button } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";

import "./error.scss";

const ErrorIcon = () => <InfoCircleFilled className="error-icon" />;

const RefreshButton = () => {
  return (
    <Button
      type="ghost"
      className="try-again-btn"
      onClick={() => window.location.reload()}
      danger
    >
      Try Again
    </Button>
  );
};

const pageProps = (status) => {
  switch (status) {
    case 404:
      return {
        status: "warning",
        title: "Page not found",
        subTitle: (
          <>
            <div>Sorry, we couldn't find that page</div>
            <div>
              <a href="mailto:unep-gpmarinelitter@un.org">
                unep-gpmarinelitter@un.org
              </a>
            </div>
          </>
        ),
      };
    case 403:
      return {
        status: "warning",
        title: "Not Authorized",
        subTitle: "Sorry, you are not allowed to access this page",
      };
    default:
      return {
        status: "info",
        icon: <ErrorIcon />,
        title: "Oops, Something went wrong",
        subTitle: (
          <div>
            Try to refresh this page or feel free to{" "}
            <a href="mailto:unep-gpmarinelitter@un.org">contact us</a> if the
            problem persist.
          </div>
        ),
        extra: <RefreshButton />,
      };
  }
};

const Error = ({ status }) => {
  const props = pageProps(status);
  return (
    <Row className="error-container" align="middle" justify="center">
      <Col span={24}>
        <Result {...props} />;
      </Col>
    </Row>
  );
};

export default Error;
