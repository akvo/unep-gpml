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
  const desktopViewport = window.innerWidth > 600;
  return (
    <Modal
      zIndex={99999}
      visible={visible}
      onCancel={() => {
        setVisible(false);
        bodyScrollLock.disable();
      }}
      className="detail-modal"
      wrapClassName='detail-modal-wrapper'
      destroyOnClose={true}
      centered={desktopViewport ? false : true}
      style={{
        top: desktopViewport ? 30 : 0,
      }}
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
