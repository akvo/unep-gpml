import React from "react";
import "./styles.scss";
import { Button } from "antd";
import { ReactComponent as AddIcon } from "../../images/workspace/add-icon.svg";

const AddContentButton = () => {
  return (
    <div className="workspace-button-wrapper">
      <Button className="add-button">
        <AddIcon />
      </Button>
    </div>
  );
};

export default AddContentButton;
