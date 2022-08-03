import React from "react";
import { Modal } from "antd";
import "./modal.scss";
import DetailsView from "./view";

const DetailModal = ({
  match,
  setLoginVisible,
  setFilterMenu,
  isAuthenticated,
  isShowModal,
  setIsShowModal,
}) => {
  return (
    <Modal
      visible={isShowModal}
      onCancel={() => setIsShowModal(false)}
      className="detail-modal"
      destroyOnClose={true}
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
