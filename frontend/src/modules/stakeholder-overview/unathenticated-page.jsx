import React from "react";
import { Button, Modal } from "antd";
import styles from "./unathenticated-page.module.scss";

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
      maskStyle={{ backgroundColor: "rgb(24 22 47 / 90%)" }}
      footer={
        <>
          <Button onClick={() => setLoginVisible(true)}>Sign In</Button>
        </>
      }
      closable={false}
      maskClosable={false}
      keyboard={false}
    >
      <div className="unathenticated-page">
        <p>You need to have an account and be signed in to see this page</p>
      </div>
    </Modal>
  );
};

export default UnathenticatedPage;
