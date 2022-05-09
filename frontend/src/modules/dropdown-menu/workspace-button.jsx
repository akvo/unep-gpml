import React from "react";
import { withRouter } from "react-router";
import { HomeOutlined } from "@ant-design/icons";

const WorkspaceButton = withRouter(({ history }) => {
  return (
    <button
      className="btn-workspace"
      onClick={() => history.push("/workspace")}
    >
      <HomeOutlined />
      Workspace
    </button>
  );
});

export default WorkspaceButton;
