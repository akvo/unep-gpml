import React from "react";
import { withRouter } from "react-router";
import { Button, Menu, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";

const DataHubDropdownMenu = withRouter(({ history }) => {
  return (
    <a
      href="https://digital-gpmarinelitter.hub.arcgis.com/"
      rel="noreferrer"
      className="menu-btn nav-link menu-dropdown"
    >
      Data Hub
    </a>
  );
});

export default DataHubDropdownMenu;
