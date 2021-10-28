import React from "react";
import { useHistory } from "react-router";
import { Row, Col, Result, Button } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";

import "./error.scss";

const ErrorIcon = () => <InfoCircleFilled className="error-icon" />;

const RefreshButton = ({ history }) => {
  return (
    <Button
      type="ghost"
      className="try-again-btn"
      onClick={() => history.goBack()}
      danger
    >
      Try Again
    </Button>
  );
};

const pageProps = (status, history) => {
  switch (status) {
    case 404:
      return {
        status: "warning",
        title: "Page not found",
        subTitle: "Sorry, we couldn't find that page",
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
        extra: <RefreshButton history={history} />,
      };
  }
};

const Error = ({ status }) => {
  const history = useHistory();
  console.log(history);
  const props = pageProps(status, history);
  return (
    <Row className="error-container" align="middle" justify="center">
      <Col span={24}>
        <Result {...props} />;
      </Col>
    </Row>
  );
};

export default Error;
