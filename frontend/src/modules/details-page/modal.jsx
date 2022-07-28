import React from "react";
import { Modal } from "antd";
import "./modal.scss";
import DetailsView from "./view";

const DetailModal = ({
  match,
  setStakeholderSignupModalVisible,
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
    >
      <DetailsView
        {...{
          match,
          setStakeholderSignupModalVisible,
          setFilterMenu,
          isAuthenticated,
        }}
      />
    </Modal>
  );
};

export default DetailModal;
