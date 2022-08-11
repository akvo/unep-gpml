/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import "./modal.scss";
import DetailsView from "./view";
import bodyScrollLock from "./scroll-utils";

const DetailModal = ({
  match,
  setLoginVisible,
  setFilterMenu,
  isAuthenticated,
  visible,
  setVisible,
}) => {
  return (
    <Modal
      zIndex={99999}
      visible={visible}
      onCancel={() => {
        setVisible(false);
        bodyScrollLock.disable();
      }}
      className="detail-modal"
      destroyOnClose={true}
      centered={window.innerWidth > 600 ? false : true}
    >
      <DetailsView
        {...{
          match,
          setFilterMenu,
          isAuthenticated,
          setLoginVisible,
        }}
      />
    </Modal>
  );
};

export default DetailModal;
