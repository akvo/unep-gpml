import React from "react";
import { withRouter } from "react-router";
import { Button, Menu, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";

const DataHubDropdownMenu = withRouter(({ history }) => {
  return (
    <Dropdown
      overlayClassName="menu-dropdown-wrapper"
      overlay={
        <Menu className="menu-dropdown">
          <Menu.Item className="nav-link">Data Map & Layers</Menu.Item>
          <Menu.Item className="nav-link">Data Catalogue</Menu.Item>
          <Menu.Item className="nav-link">Join Data Hub</Menu.Item>
        </Menu>
      }
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button type="link" className="menu-btn nav-link">
        Data Hub <DownOutlined />
      </Button>
    </Dropdown>
  );
});

export default DataHubDropdownMenu;
