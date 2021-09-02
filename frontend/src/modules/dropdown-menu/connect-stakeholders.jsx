import React from "react";
import { withRouter } from "react-router";
import { Button, Menu, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";

const ConnectStakeholdersDropdownMenu = withRouter(
  ({
    history,
    profile,
    setWarningModalVisible,
    isAuthenticated,
    setStakeholderSignupModalVisible,
    loginWithPopup,
  }) => {
    const handleOnClickNeedAuth = (topic) => {
      {
        profile?.reviewStatus === "APPROVED"
          ? history.push(`/${topic === 'stakeholder' ? 'stakeholders':'browse'}?topic=${topic}`)
          : Object.keys(profile).length > 1
          ? setWarningModalVisible(true)
          : isAuthenticated
          ? setStakeholderSignupModalVisible(true)
          : loginWithPopup();
      }
    };

    return (
      <Dropdown
        overlayClassName="menu-dropdown-wrapper"
        overlay={
          <Menu className="menu-dropdown">
            {/* <Menu.Item
            className="nav-link"
            onClick={() => history.push("/browse?topic=event")}
          >
            Events
          </Menu.Item> */}
            <Menu.Item
              className="nav-link"
              onClick={() => handleOnClickNeedAuth("stakeholder")}
            >
              Individuals
            </Menu.Item>
            <Menu.Item
              className="nav-link"
              onClick={() => handleOnClickNeedAuth("organisation")}
            >
              Entities
            </Menu.Item>
            {/* <Menu.Item className="nav-link">Forums</Menu.Item>
          <Menu.Item className="nav-link">Partners</Menu.Item>
          <Menu.Item className="nav-link">Sponsors</Menu.Item> */}
          </Menu>
        }
        trigger={["click"]}
        placement="bottomRight"
      >
        <Button type="link" className="menu-btn nav-link">
          Connect Stakeholders <DownOutlined />
        </Button>
      </Dropdown>
    );
  }
);

export default ConnectStakeholdersDropdownMenu;
