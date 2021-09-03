import React from "react";
import { withRouter } from "react-router";
import { Drawer, Menu, Button } from "antd";
import { topicNames } from "../../utils/misc";
import humps from "humps";
import sumBy from "lodash/sumBy";

const { SubMenu } = Menu;

const ResponsiveMenu = withRouter(
  ({
    history,
    showResponsiveMenu,
    setShowResponsiveMenu,
    topicsCount,
    resources,
    profile,
    setWarningModalVisible,
    isAuthenticated,
    setStakeholderSignupModalVisible,
    loginWithPopup,
  }) => {
    const loading = !resources;
    const allResources = sumBy(resources, "count");

    const handleOnClickNeedAuth = ({ key }) => {
      {
        if (key === "stakeholder" || key === "organisation") {
          profile?.reviewStatus === "APPROVED"
            ? history.push(`/stakeholders?topic=${key}`)
            : Object.keys(profile).length > 1
            ? setWarningModalVisible(true)
            : isAuthenticated
            ? setStakeholderSignupModalVisible(true)
            : loginWithPopup();
        } else {
          history.push(`/${key}`);
        }
        setShowResponsiveMenu(false);
      }
    };

    return (
      <Drawer
        title="Menu"
        placement="right"
        width="300px"
        className="responsive-menu-wrapper"
        onClose={() => setShowResponsiveMenu(false)}
        visible={showResponsiveMenu}
      >
        <Menu onClick={handleOnClickNeedAuth} mode="inline">
          {/* About */}
          <Menu.Item key="about-us" className="nav-link">
            About
          </Menu.Item>
          {/* Explore */}
          <SubMenu key="explore" title="Explore" className="nav-link">
            <Menu.Item
              key="topics"
              className="nav-link"
              disabled={!topicsCount}
            >
              Topics
              <Button
                className="badge-count"
                size="small"
                type="ghost"
                shape="circle"
                icon={topicsCount}
                loading={!topicsCount}
              />
            </Menu.Item>
            <Menu.Item key="glossary" className="nav-link">
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
          </SubMenu>
          {/* Data Hub */}
          <SubMenu key="data-hub" title="Data Hub" className="nav-link">
            <Menu.Item disabled={true} className="nav-link">
              Data Map & Layers
            </Menu.Item>
            <Menu.Item disabled={true} className="nav-link">
              Data Catalogue
            </Menu.Item>
            <Menu.Item disabled={true} className="nav-link">
              Join Data Hub
            </Menu.Item>
          </SubMenu>
          {/* Knowledge Exchange */}
          <SubMenu
            key="knowledge-exchange"
            title="Knowledge Exchange"
            className="nav-link"
          >
            <Menu.Item key="browse" className="nav-link">
              All Resources
              <Button
                className="badge-count"
                size="small"
                type="ghost"
                shape="circle"
                icon={allResources}
                loading={loading}
              />
            </Menu.Item>
            {resources &&
              resources.map((x, i) => {
                const { name, count } = x;
                return (
                  <Menu.Item
                    key={`browse?topic=${humps.decamelize(name)}`}
                    className="indent-right nav-link"
                    disabled={loading}
                  >
                    {topicNames(name)}
                    <Button
                      className="badge-count"
                      size="small"
                      type="ghost"
                      shape="circle"
                      icon={count}
                      loading={loading}
                    />
                  </Menu.Item>
                );
              })}
          </SubMenu>
          {/* Connect Stakeholders */}
          <SubMenu
            key="connect-stakeholders"
            title="Connect Stakeholders"
            className="nav-link"
          >
            <Menu.Item key="stakeholder" className="nav-link">
              Individuals
            </Menu.Item>
            <Menu.Item key="organisation" className="nav-link">
              Entities
            </Menu.Item>
          </SubMenu>
        </Menu>
      </Drawer>
    );
  }
);

export default ResponsiveMenu;
