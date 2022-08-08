import React from "react";
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
