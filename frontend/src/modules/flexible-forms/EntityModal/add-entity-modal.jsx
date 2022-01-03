import { Modal, Button } from "antd";
import "./modal-style.scss";

const ModalAddEntity = ({ visible, close }) => {
  return (
    <Modal
      width={600}
      visible={visible}
      title="Create New Entity"
      footer={
        <div>
          <Button className="close-button" onClick={(e) => close()}>
            Close
          </Button>
          <Button className="custom-button" onClick={(e) => close()}>
            Submit
          </Button>
        </div>
      }
      closable={false}
    >
      <div className="add-entity-modal">ss</div>
    </Modal>
  );
};

export default ModalAddEntity;
