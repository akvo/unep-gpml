import React from "react";
import { Link } from "react-router-dom";
import "./styles.scss";
import { Button } from "antd";
import { ReactComponent as AddIcon } from "../../images/workspace/add-icon.svg";

const AddContentButton = () => {
  return (
    <Link to="/flexible-forms">
      <div className="workspace-button-wrapper">
        <Button className="add-button">
          <AddIcon /> <span className="button-text">Add content</span>
        </Button>
      </div>
    </Link>
  );
};

export default AddContentButton;
