import React from "react";
import { HomeOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";

const WorkspaceButton = () => (
  <NavLink
    to="/workspace"
    className="btn-workspace menu-btn"
    activeClassName="selected"
  >
    <HomeOutlined />
    <span className="text">Workspace</span>
  </NavLink>
);

export default WorkspaceButton;
