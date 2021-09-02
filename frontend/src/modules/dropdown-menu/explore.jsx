import React from "react";
import { withRouter } from "react-router";
import { Button, Menu, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";

const ExploreDropdownMenu = withRouter(({ history, topics }) => {
  return (
    <Dropdown
      overlayClassName="menu-dropdown-wrapper"
      overlay={
        <Menu className="menu-dropdown">
          <Menu.Item
            className="nav-link"
            disabled={!topics}
            onClick={() => history.push("/topics")}
          >
            Topics
            <Button
              className="badge-count"
              size="small"
              type="ghost"
              shape="circle"
              icon={topics}
              loading={!topics}
            />
          </Menu.Item>
          {/* <Menu.Item className="nav-link">
            Goals <span className="badge-count">11</span>
          </Menu.Item>
          <Menu.Item className="nav-link">
            Stories <span className="badge-count">8</span>
          </Menu.Item> */}
          <Menu.Item
            className="nav-link"
            onClick={() => history.push("/glossary")}
          >
            Glossary
            <Button
              className="badge-count"
              size="small"
              type="ghost"
              shape="circle"
              // icon={10}
              loading={false}
            />
          </Menu.Item>
        </Menu>
      }
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button type="link" className="menu-btn nav-link">
        Explore <DownOutlined />
      </Button>
    </Dropdown>
  );
});

export default ExploreDropdownMenu;
