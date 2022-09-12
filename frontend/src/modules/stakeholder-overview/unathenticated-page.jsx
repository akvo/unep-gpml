import React from "react";
import { Button, Modal } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./unathenticated-page.scss";
import { Link } from "react-router-dom";

const UnathenticatedPage = ({
  unAthenticatedModal,
  setUnathenticatedModal,
  setLoginVisible,
}) => {
  return (
    <Modal
      centered
      className="unathenticated-modal"
      visible={unAthenticatedModal}
      onCancel={() => setUnathenticatedModal(false)}
      footer={
        <>
          <Button onClick={() => setLoginVisible(true)}>Sign In</Button>
        </>
      }
      closable={false}
    >
      <div className="unathenticated-page">
        <p>You need to have an account and be signed in to see this page</p>
      </div>
    </Modal>
  );
};

export default UnathenticatedPage;
