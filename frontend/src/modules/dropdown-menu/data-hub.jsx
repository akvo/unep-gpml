import React from "react";
import { withRouter } from "react-router";
import { Button, Menu, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";

const DataHubDropdownMenu = withRouter(({ history }) => {
  return (
    <Button
      type="link"
      className="menu-btn nav-link menu-dropdown"
      onClick={() => {
        window.location.href = "http://datahub.gpmarinelitter.org/";
      }}
      style={{ display: "flex", alignItems: "center", height: "50px" }}
    >
      Data Hub
    </Button>
  );
});

export default DataHubDropdownMenu;
