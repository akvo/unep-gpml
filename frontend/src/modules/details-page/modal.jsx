/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import "./modal.scss";
import DetailsView from "./view";

const DetailModal = ({
  match,
  setLoginVisible,
  setFilterMenu,
  isAuthenticated,
  visible,
  setVisible,
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    setScrollPosition(window.pageYOffset);
    window.scrollTo(0, scrollPosition);
  }, [visible]);

  return (
    <Modal
      visible={visible}
      onCancel={() => setVisible(false)}
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
