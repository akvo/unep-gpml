import React, { useState } from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import { Drawer, Menu, Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { topicNames } from "../../utils/misc";
import humps from "humps";
import sumBy from "lodash/sumBy";
import { UIStore } from "../../store";

const { SubMenu } = Menu;

const ResponsiveMenu = withRouter(
  ({
    history,
    updateQuery,
    showResponsiveMenu,
    setShowResponsiveMenu,
    topicsCount,
    resources,
    profile,
    setWarningModalVisible,
    isAuthenticated,
    setStakeholderSignupModalVisible,
    loginWithPopup,
    logout,
    setFilterMenu,
    stakeholderCounts,
  }) => {
    const [isShownForm, setIsShownForm] = useState(false);
    const [search, setSearch] = useState("");
    const loading = !resources;
    const allResources = sumBy(resources, "count");
    const loadingStakeholders = !stakeholderCounts;
    const viewport = window.innerWidth;

    const handleSearch = (src) => {
      if (src) {
        history.push(`?q=${src.trim()}`);
        updateQuery("q", src.trim());
      } else {
        updateQuery("q", "");
      }
      setSearch("");
      setIsShownForm(false);
      setShowResponsiveMenu(false);
    };

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
        } else if (key === "add-content-disabled") {
          Object.keys(profile).length > 1
            ? setWarningModalVisible(true)
            : setStakeholderSignupModalVisible(true);
        } else if (key === "join-gpml") {
          history.push("/signup");
        } else if (key === "sign-in" || key === "sign-in-mobile") {
          loginWithPopup();
        } else if (key === "logout" || key === "logout-mobile") {
          logout({ returnTo: window.location.origin });
        } else if (key === "data-hub" || key === "stakeholder-overview") {
        } else if (key.includes("knowledge-library")) {
          history.push(`/knowledge-library`);
        } else if (key.includes("search-button")) {
          return;
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
        width={viewport <= 540 ? "100%" : "300px"}
        className="responsive-menu-wrapper"
        onClose={() => setShowResponsiveMenu(false)}
        visible={showResponsiveMenu}
      >
        <Menu onClick={handleOnClickNeedAuth} mode="inline">
          {/* About */}

          <li className="small-screen-menu">
            <div className="src mobile-src">
              {!isShownForm && (
                <Button
                  onClick={() => setIsShownForm(!isShownForm)}
                  type="primary"
                  shape="circle"
                  size="small"
                  className="search-button"
                  icon={<SearchOutlined />}
                />
              )}
              {isShownForm && (
                <Input
                  className="input-src"
                  placeholder="Search resources"
                  value={search}
                  suffix={
                    <Button
                      onClick={() => handleSearch(search)}
                      type="primary"
                      shape="circle"
                      size="small"
                      icon={<SearchOutlined />}
                    />
                  }
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  onChange={(e) => setSearch(e.target.value)}
                />
              )}
            </div>
          </li>

          <Menu.Item key="about-us" className="nav-link">
            About
          </Menu.Item>
          {/* Explore */}
          <SubMenu
            key="explore"
            title="Explore"
            className="nav-link menu-explore"
          >
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
          <Menu.Item key="data-hub" className="nav-link">
            <a href="https://datahub.gpmarinelitter.org/" rel="noreferrer">
              Data Hub
            </a>
          </Menu.Item>
          {/* Knowledge Exchange */}
          <Menu.Item
            key="knowledge-library"
            className="nav-link small-screen-menu"
          >
            <Link to="/knowledge-library">Knowledge Exchange</Link>
          </Menu.Item>

          <SubMenu
            key="knowledge-exchange"
            title="Knowledge Exchange"
            className="nav-link big-screen-menu"
          >
            <Menu.Item
              key="knowledge-library"
              className="nav-link"
              onClick={() => setFilterMenu([])}
            >
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

                const topic = humps.decamelize(name);
                return (
                  name && (
                    <Menu.Item
                      key={`/knowledge-library?topic=${topic}`}
                      className="indent-right nav-link"
                      disabled={loading}
                      onClick={() => setFilterMenu([topic])}
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
                  )
                );
              })}
          </SubMenu>

          {/* Connect Stakeholders */}
          <Menu.Item key="stakeholder-overview" className="nav-link">
            <Link to="/events">Connect Stakeholders</Link>
          </Menu.Item>
          {/* <SubMenu
            key="connect-stakeholders"
            title="Connect Stakeholders"
            className="nav-link"
          >
            {!loadingStakeholders ? (
              stakeholderCounts.map((x, i) => {
                const { name, count } = x;
                const topic = humps.decamelize(name);
                return (
                  <Menu.Item
                    key={topic}
                    className="nav-link"
                    disabled={loadingStakeholders}
                    onClick={() => setFilterMenu([topic])}
                  >
                    {topicNames(name)} */}
          {/* <Button
                      className="badge-count"
                      size="small"
                      type="ghost"
                      shape="circle"
                      icon={count}
                      loading={loadingStakeholders}
                    /> */}
          {/* </Menu.Item>
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
                  loading={loadingStakeholders}
                />
              </Menu.Item>
            )} */}
          {/* <Menu.Item key="stakeholder" className="nav-link">
              Individuals
            </Menu.Item>
            <Menu.Item key="organisation" className="nav-link">
              Entities
            </Menu.Item> */}
          {/* </SubMenu> */}
          {/* Join GPML & Sign In */}
          {!isAuthenticated && (
            <>
              <Menu.Item key="join-gpml" className="auth-menu nav-link">
                Join GPML
              </Menu.Item>

              <Menu.Item
                key="sign-in"
                className="auth-menu nav-link big-screen-menu"
              >
                Sign in
              </Menu.Item>

              <Menu.Item
                key="sign-in-mobile"
                className="green-text green-border small-screen-menu"
              >
                Sign in
              </Menu.Item>
            </>
          )}
          {/* Add Content */}
          {isAuthenticated && profile?.reviewStatus === "APPROVED" && (
            <SubMenu
              key="add-content"
              title="Add Content"
              className="auth-menu nav-link menu-add-content big-screen-menu"
            >
              <Menu.Item
                key="add-initiative"
                className="nav-link"
                onClick={() => {
                  UIStore.update((e) => {
                    e.formStep = {
                      ...e.formStep,
                      initiative: 1,
                    };
                    e.formEdit = {
                      ...e.formEdit,
                      initiative: {
                        status: "add",
                        id: null,
                      },
                    };
                  });
                }}
              >
                Initiative
              </Menu.Item>
              <Menu.Item
                key="add-action-plan"
                className="nav-link"
                onClick={() => {
                  UIStore.update((e) => {
                    e.formStep = {
                      ...e.formStep,
                      actionPlan: 1,
                    };
                    e.formEdit = {
                      ...e.formEdit,
                      actionPlan: {
                        status: "add",
                        id: null,
                      },
                    };
                  });
                }}
              >
                Action Plan
              </Menu.Item>
              <Menu.Item
                key="add-policy"
                className="nav-link"
                onClick={() => {
                  UIStore.update((e) => {
                    e.formStep = {
                      ...e.formStep,
                      policy: 1,
                    };
                    e.formEdit = {
                      ...e.formEdit,
                      policy: {
                        status: "add",
                        id: null,
                      },
                    };
                  });
                }}
              >
                Policy
              </Menu.Item>
              <Menu.Item
                key="add-technical-resource"
                className="nav-link"
                onClick={() => {
                  UIStore.update((e) => {
                    e.formStep = {
                      ...e.formStep,
                      technicalResource: 1,
                    };
                    e.formEdit = {
                      ...e.formEdit,
                      technicalResource: {
                        status: "add",
                        id: null,
                      },
                    };
                  });
                }}
              >
                Technical Resource
              </Menu.Item>
              <Menu.Item
                key="add-financing-resource"
                className="nav-link"
                onClick={() => {
                  UIStore.update((e) => {
                    e.formStep = {
                      ...e.formStep,
                      financingResource: 1,
                    };
                    e.formEdit = {
                      ...e.formEdit,
                      financingResource: {
                        status: "add",
                        id: null,
                      },
                    };
                  });
                }}
              >
                Financing Resource
              </Menu.Item>
              <Menu.Item
                key="add-event"
                className="nav-link"
                onClick={() => {
                  UIStore.update((e) => {
                    e.formStep = {
                      ...e.formStep,
                      event: 1,
                    };
                    e.formEdit = {
                      ...e.formEdit,
                      event: {
                        status: "add",
                        id: null,
                      },
                    };
                  });
                  history.push("/add-event");
                }}
              >
                Event
              </Menu.Item>
              <Menu.Item
                key="add-technology"
                className="nav-link"
                onClick={() => {
                  UIStore.update((e) => {
                    e.formStep = {
                      ...e.formStep,
                      technology: 1,
                    };
                    e.formEdit = {
                      ...e.formEdit,
                      technology: {
                        status: "add",
                        id: null,
                      },
                    };
                  });
                }}
              >
                Technology
              </Menu.Item>
            </SubMenu>
          )}
          {/* Add Content Disabled */}
          {isAuthenticated && profile?.reviewStatus !== "APPROVED" && (
            <Menu.Item
              key="add-content-disabled"
              className="auth-menu nav-link"
            >
              Add Content
            </Menu.Item>
          )}
          {/* Profile & Logout */}
          {isAuthenticated && (
            <>
              <Menu.Item
                key="profile"
                className="auth-menu nav-link menu-profile big-screen-menu"
              >
                Profile
              </Menu.Item>

              <Menu.Item
                key="logout"
                className="auth-menu nav-link big-screen-menu"
              >
                Logout
              </Menu.Item>

              <Menu.Item
                key="logout-mobile"
                className="button-logout green-text green-border small-screen-menu"
              >
                Logout
              </Menu.Item>
            </>
          )}
        </Menu>
      </Drawer>
    );
  }
);

export default ResponsiveMenu;
