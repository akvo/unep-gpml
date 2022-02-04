import React from "react";
import { withRouter } from "react-router";
import { Button, Menu, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import humps from "humps";
import { topicNames } from "../../utils/misc";

const ConnectStakeholdersDropdownMenu = withRouter(
  ({
    history,
    profile,
    setWarningModalVisible,
    isAuthenticated,
    setStakeholderSignupModalVisible,
    loginWithPopup,
    stakeholderCounts,
    setFilterMenu,
  }) => {
    const redirectPage = (topic) => {
      setFilterMenu([topic]);
      return history.push(`/stakeholders?topic=${topic}`);
    };

    const handleOnClickNeedAuth = (topic) => {
      {
        redirectPage(topic);
      }
    };

    const handleComunityClick = () => {
      window.open("https://communities.gpmarinelitter.org/", "_blank");
    };

    const loading = !stakeholderCounts;

    return (
      <Dropdown
        overlayClassName="menu-dropdown-wrapper"
        overlay={
          <Menu className="menu-dropdown">
            {!loading ? (
              stakeholderCounts.map((x, i) => {
                const { name, count } = x;
                return (
                  <Menu.Item
                    key={`${name}-${i}`}
                    className="nav-link"
                    disabled={loading}
                    onClick={() =>
                      handleOnClickNeedAuth(humps.decamelize(name))
                    }
                  >
                    {topicNames(name)}
                  </Menu.Item>
                );
              })
            ) : (
              <Menu.Item className="nav-link">
                Loading
                <Button
                  className="badge-count"
                  size="small"
                  type="ghost"
                  shape="circle"
                  loading={loading}
                />
              </Menu.Item>
            )}
            <Menu.Item
              className="nav-link"
              disabled={loading}
              onClick={() => handleComunityClick()}
            >
              Community
            </Menu.Item>
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
