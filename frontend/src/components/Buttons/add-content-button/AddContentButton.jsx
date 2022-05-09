import React, { useEffect, useState } from "react";
import { Link, withRouter } from "react-router-dom";
import "./styles.scss";
import { Button } from "antd";
import { ReactComponent as AddIcon } from "../../../../images/workspace/add-icon.svg";

const AddContentButton = withRouter(({ history }) => {
  const [didMount, setDidMount] = useState(false);
  const pageHistory = history?.location?.pathname;

  const displayButton =
    pageHistory === "/workspace" ||
    pageHistory === "/knowledge-library" ||
    pageHistory === "/events" ||
    pageHistory === "/case-studies" ||
    pageHistory === "/capacity-building";

  // Note: this will fix the warning on the console
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  return (
    displayButton && (
      <Link to="/flexible-forms">
        <div className="workspace-button-wrapper">
          <Button className="add-button">
            <AddIcon /> <span className="button-text">Add content</span>
          </Button>
        </div>
      </Link>
    )
  );
});

export default AddContentButton;
