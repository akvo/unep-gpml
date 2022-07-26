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
    <Modal visible={isShowModal} className="detail-modal">
      <DetailsView
        onCloseModal={() => setIsShowModal(false)}
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
