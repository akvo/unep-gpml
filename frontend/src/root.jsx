import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  withRouter,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Input, Button, Menu, Dropdown, Avatar, Popover, Layout } from "antd";
import { RightOutlined, DownOutlined, UserOutlined } from "@ant-design/icons";
import Landing from "./modules/landing/new-home";
import Browse from "./modules/browse/view";
import AddEvent from "./modules/events/view";
import logo from "./images/GPML-logo-white.png";
import SignupModal from "./modules/signup/signup-modal";
import ModalWarningUser from "./utils/modal-warning-user";
import api from "./utils/api";
import { storage } from "./utils/storage";
import { UIStore } from "./store.js";
import ProfileView from "./modules/profile/view";
import SignupView from "./modules/signup/view";
import DetailsView from "./modules/details/view";
import Footer from "./footer";
import uniqBy from "lodash/uniqBy";
import sortBy from "lodash/sortBy";
import AddFinancingResource from "./modules/financing-resource/view";
import AddTechnicalResource from "./modules/technical-resource/view";
import AddInitiative from "./modules/initiative/view";
import AddActionPlan from "./modules/action-plan/view";
import AddTechnology from "./modules/technology/view";
import AddPolicy from "./modules/policy/view";

api
  .get("/tag")
  .then((resp) => {
    return resp.data;
  })
  .then((tags) => {
    api
      .get("/currency")
      .then((resp) => {
        return resp.data;
      })
      .then((currencies) => {
        api
          .get("/country")
          .then((resp) => {
            return uniqBy(resp.data).sort((a, b) =>
              a.name.localeCompare(b.name)
            );
          })
          .then((countries) => {
            api
              .get("/country-group")
              .then((resp) => {
                return resp.data;
              })
              .then((countryGroups) => {
                api
                  .get("/organisation")
                  .then((resp) => {
                    return uniqBy(sortBy(resp.data, ["name"])).sort((a, b) =>
                      a.name.localeCompare(b.name)
                    );
                  })
                  .then((organisations) => {
                    UIStore.update((e) => {
                      e.tags = tags;
                      e.currencies = currencies;
                      e.countries = countries;
                      e.regionOptions = countryGroups.filter(
                        (x) => x.type === "region"
                      );
                      e.meaOptions = countryGroups.filter(
                        (x) => x.type === "mea"
                      );
                      e.organisations = organisations;
                    });
                  });
              });
          });
      });
  });

const disclaimerContent = {
  home: (
    <>
      The GPML Digital Platform Phase 1 is now live and currently a Beta
      Version. Help us test the platform and let us know what you think at{" "}
      <a style={{ color: "white" }} href="mailto:unep-gpmarinelitter@un.org">
        unep-gpmarinelitter@un.org
      </a>
      . Take part in shaping the platform’s next releases, until its final
      launch scheduled for 2023. Stay tuned!
    </>
  ),
  browse: (
    <>
      UNEP shall not be liable for third party content hosted on the platform.
      Contact us if you have any concerns with the content at:{" "}
      <a style={{ color: "white" }} href="mailto:unep-gpmarinelitter@un.org">
        unep-gpmarinelitter@un.org
      </a>
      . Please note that during Beta Testing, content and functionality issues
      may persist.
    </>
  ),
};

const { Header } = Layout;

const Root = () => {
  const {
    isAuthenticated,
    getIdTokenClaims,
    loginWithPopup,
    logout,
    user,
  } = useAuth0();
  const { profile, disclaimer, loading } = UIStore.useState((s) => s);
  const [signupModalVisible, setSignupModalVisible] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(null);

  useEffect(() => {
    if (loading) {
      api.get("browse?topic=event").then((resp) => {
        setData(resp.data);
        UIStore.update((e) => {
          e.loading = false;
        });
      });
    }
    (async function fetchData() {
      const response = await getIdTokenClaims();
      if (isAuthenticated) {
        api.setToken(response.__raw);
      } else {
        api.setToken(null);
      }
      if (isAuthenticated) {
        const resp = await api.get("/profile");
        if (Object.keys(resp.data).length === 0) {
          UIStore.update((e) => {
            e.profile = { email: response.email };
          });
          setTimeout(() => {
            setSignupModalVisible(Object.keys(resp.data).length === 0);
          }, 100);
        } else {
          UIStore.update((e) => {
            e.profile = { ...resp.data, email: response.email };
          });
          if (
            storage.getCookie("profile") === "SUBMITTED" &&
            resp.data.reviewStatus === "APPROVED"
          ) {
            document.cookie = "profileMessage=1";
          }
          if (
            storage.getCookie("profile") === "APPROVED" &&
            resp.data.reviewStatus === "APPROVED"
          ) {
            document.cookie = "profileMessage=0";
          }
          document.cookie = `profile=${resp.data.reviewStatus}`;
        }
      }
    })();
  }, [getIdTokenClaims, isAuthenticated, loading]);

  return (
    <Router>
      <div id="root">
        {disclaimerContent?.[disclaimer] && (
          <div className="panel-disclaimer">
            <p className="ui container">{disclaimerContent?.[disclaimer]}</p>
          </div>
        )}
        {/* <div className="topbar">
          <div className="ui container">
            <div className="leftside">
              <a href="https://www.unep.org/" target="_blank" rel="noreferrer">
                UN Environment Programme
              </a>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <a
                href="https://www.gpmarinelitter.org"
                target="_blank"
                rel="noreferrer"
              >
                GPML
              </a>
            </div>
          </div>
        </div> */}
        <Header
          className="nav-header-container"
          // style={{ width: "100%", position: "sticky", top: 0, zIndex: 3 }}
        >
          <div className="ui container">
            <div className="logo-wrapper">
              <Link to="/">
                <img src={logo} className="logo" alt="GPML" />
              </Link>
            </div>
            {renderDropdownMenu()}
            {/* {renderMenu()} */}
            <Switch>
              <Route path="/browse" />
              <Route>
                <Search />
              </Route>
            </Switch>
            {!isAuthenticated ? (
              <div className="rightside">
                <Button
                  type="primary"
                  onClick={() => loginWithPopup({ screen_hint: "signup" })}
                >
                  Join GPML
                </Button>
                <Button type="ghost" className="left">
                  <Link to="/" onClick={loginWithPopup}>
                    Sign in
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="rightside">
                <AddButton
                  {...{
                    setSignupModalVisible,
                    isAuthenticated,
                    loginWithPopup,
                    setWarningModalVisible,
                  }}
                />
                {/* <Popover
                  placement="bottom"
                  content={
                    <div>
                      {profile?.photo && (
                        <Avatar src={profile?.photo} size={25} />
                      )}{" "}
                      {profile?.email}
                    </div>
                  }
                >
                  <Button type="primary">
                    <Link to="/profile">
                      {profile ? profile.firstName : user.nickname}
                    </Link>
                  </Button>
                </Popover> */}
                {/* <Button
                  type="ghost"
                  className="left"
                  onClick={() => logout({ returnTo: window.location.origin })}
                >
                  Logout
                </Button> */}
                <UserButton {...{ logout }} />
              </div>
            )}
          </div>
        </Header>
        <Route
          path="/"
          exact
          render={(props) => (
            <Landing
              {...{
                data,
                setWarningModalVisible,
                setSignupModalVisible,
                loginWithPopup,
                isAuthenticated,
                setFilters,
                ...props,
              }}
            />
          )}
        />
        <Route
          path="/browse"
          render={(props) => (
            <Browse
              {...props}
              setSignupModalVisible={setSignupModalVisible}
              filters={filters}
              setFilters={setFilters}
            />
          )}
        />
        <Route path="/add-event" render={(props) => <AddEvent {...props} />} />
        <Route
          exact
          path="/edit-event/:id"
          render={(props) => <AddEvent {...props} />}
        />

        <Route
          path="/add-technology"
          render={(props) => <AddTechnology {...props} />}
        />
        <Route
          exact
          path="/edit-technology/:id"
          render={(props) => <AddTechnology {...props} />}
        />

        <Route
          path="/add-policy"
          render={(props) => <AddPolicy {...props} />}
        />
        <Route
          exact
          path="/edit-policy/:id"
          render={(props) => <AddPolicy {...props} />}
        />

        <Route
          path="/add-action-plan"
          render={(props) => <AddActionPlan {...props} />}
        />
        <Route
          exact
          path="/edit-action-plan/:id"
          render={(props) => <AddActionPlan {...props} />}
        />

        <Route
          path="/add-financing-resource"
          render={(props) => <AddFinancingResource {...props} />}
        />
        <Route
          exact
          path="/edit-financing-resource/:id"
          render={(props) => <AddFinancingResource {...props} />}
        />

        <Route
          path="/add-technical-resource"
          render={(props) => <AddTechnicalResource {...props} />}
        />
        <Route
          exact
          path="/edit-technical-resource/:id"
          render={(props) => <AddTechnicalResource {...props} />}
        />

        <Route
          path="/add-initiative"
          render={(props) => <AddInitiative {...props} />}
        />
        <Route
          exact
          path="/edit-initiative/:id"
          render={(props) => <AddInitiative {...props} />}
        />

        <Route
          path="/profile"
          render={(props) => <ProfileView {...{ ...props }} />}
        />
        <Route path="/signup" render={(props) => <SignupView {...props} />} />
        <Route
          path="/:type(project|action_plan|policy|technical_resource|financing_resource|technology|event|organisation|stakeholder)/:id"
          render={(props) => (
            <DetailsView
              {...props}
              setSignupModalVisible={setSignupModalVisible}
            />
          )}
        />
        <Footer
          setSignupModalVisible={setSignupModalVisible}
          setWarningModalVisible={setWarningModalVisible}
          isAuthenticated={isAuthenticated}
          loginWithPopup={loginWithPopup}
        />
      </div>
      <SignupModal
        visible={signupModalVisible}
        onCancel={() => setSignupModalVisible(false)}
      />
      <ModalWarningUser
        visible={warningModalVisible}
        close={() => setWarningModalVisible(false)}
      />
    </Router>
  );
};

const renderDropdownMenu = () => {
  return (
    <div className="menu-dropdown-wrapper">
      <AboutDropdownMenu />
      <ExploreDropdownMenu />
      <DataHubDropdownMenu />
      <KnowledgeExchangeDropdownMenu />
      <ConnectStakeholdersDropdownMenu />
    </div>
  );
};

const AboutDropdownMenu = withRouter(({ history }) => {
  return (
    <Dropdown
      overlayClassName="menu-dropdown-wrapper"
      overlay={
        <Menu className="menu-dropdown">
          <Menu.Item>Partnership</Menu.Item>
          <Menu.Item>Digital Platform</Menu.Item>
        </Menu>
      }
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button type="link" className="menu-btn">
        About <DownOutlined />
      </Button>
    </Dropdown>
  );
});

const ExploreDropdownMenu = withRouter(({ history }) => {
  return (
    <Dropdown
      overlayClassName="menu-dropdown-wrapper"
      overlay={
        <Menu className="menu-dropdown">
          <Menu.Item>
            Topics <span className="badge-count">6</span>
          </Menu.Item>
          <Menu.Item>
            Goals <span className="badge-count">11</span>
          </Menu.Item>
          <Menu.Item>
            Stories <span className="badge-count">8</span>
          </Menu.Item>
          <Menu.Item>
            Glossary <span className="badge-count">54</span>
          </Menu.Item>
        </Menu>
      }
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button type="link" className="menu-btn">
        Explore <DownOutlined />
      </Button>
    </Dropdown>
  );
});

const DataHubDropdownMenu = withRouter(({ history }) => {
  return (
    <Dropdown
      overlayClassName="menu-dropdown-wrapper"
      overlay={
        <Menu className="menu-dropdown">
          <Menu.Item>Data Map & Layers</Menu.Item>
          <Menu.Item>Dashboards</Menu.Item>
          <Menu.Item>Data Catalogue</Menu.Item>
          <Menu.Item>Data Content</Menu.Item>
        </Menu>
      }
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button type="link" className="menu-btn">
        Data Hub <DownOutlined />
      </Button>
    </Dropdown>
  );
});

const KnowledgeExchangeDropdownMenu = withRouter(({ history }) => {
  return (
    <Dropdown
      overlayClassName="menu-dropdown-wrapper"
      overlay={
        <Menu className="menu-dropdown">
          <Menu.Item>
            All Resources <span className="badge-count">54</span>
          </Menu.Item>
          <Menu.Item className="indent-right">
            Inititative <span className="badge-count">54</span>
          </Menu.Item>
          <Menu.Item className="indent-right">
            Action Plan <span className="badge-count">54</span>
          </Menu.Item>
          <Menu.Item className="indent-right">
            Policy <span className="badge-count">54</span>
          </Menu.Item>
          <Menu.Item className="indent-right">
            Technical resource <span className="badge-count">54</span>
          </Menu.Item>
          <Menu.Item className="indent-right">
            Financing resource <span className="badge-count">54</span>
          </Menu.Item>
          <Menu.Item className="indent-right">
            Technology <span className="badge-count">54</span>
          </Menu.Item>
          <Menu.Item>
            Capacity building <span className="badge-count">54</span>
          </Menu.Item>
        </Menu>
      }
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button type="link" className="menu-btn">
        Knowledge Exchange <DownOutlined />
      </Button>
    </Dropdown>
  );
});

const ConnectStakeholdersDropdownMenu = withRouter(({ history }) => {
  return (
    <Dropdown
      overlayClassName="menu-dropdown-wrapper"
      overlay={
        <Menu className="menu-dropdown">
          <Menu.Item>Events</Menu.Item>
          <Menu.Item>Stakeholders Directory</Menu.Item>
          <Menu.Item>Forums</Menu.Item>
          <Menu.Item>Partners</Menu.Item>
          <Menu.Item>Sponsors</Menu.Item>
        </Menu>
      }
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button type="link" className="menu-btn">
        Connect Stakeholders <DownOutlined />
      </Button>
    </Dropdown>
  );
});

const renderMenu = () => {
  return (
    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[]}>
      <Menu.Item key="about">
        About <DownOutlined style={{ fontSize: "0.65rem", fontWeight: 600 }} />
      </Menu.Item>
      <Menu.Item key="explore">
        Explore{" "}
        <DownOutlined style={{ fontSize: "0.65rem", fontWeight: 600 }} />
      </Menu.Item>
      <Menu.Item key="data-hub">
        Data Hub{" "}
        <DownOutlined style={{ fontSize: "0.65rem", fontWeight: 600 }} />
      </Menu.Item>
      <Menu.Item key="knowledge-exchange">
        Knowledge Exchange{" "}
        <DownOutlined style={{ fontSize: "0.65rem", fontWeight: 600 }} />
      </Menu.Item>
      <Menu.Item key="connect-stakeholders">
        Connect Stakeholders{" "}
        <DownOutlined style={{ fontSize: "0.65rem", fontWeight: 600 }} />
      </Menu.Item>
    </Menu>
  );
};

const Search = withRouter(({ history }) => {
  const handleSearch = (src) => {
    if (src?.trim().length > 0) {
      history.push(`/browse/?q=${src}`);
    }
  };

  return (
    <Input.Search
      onPressEnter={(e) => handleSearch(e.target.value)}
      onSearch={handleSearch}
      enterButton
      className="src"
      placeholder="Search"
      // size="large"
    />
  );
});

const UserButton = withRouter(({ history, logout }) => {
  return (
    <Dropdown
      overlayClassName="user-btn-dropdown-wrapper"
      overlay={
        <Menu className="user-btn-dropdown">
          <Menu.Item
            onClick={() => {
              history.push("/profile");
            }}
          >
            Profile <RightOutlined />
          </Menu.Item>
          <Menu.Item
            onClick={() => logout({ returnTo: window.location.origin })}
          >
            Logout <RightOutlined />
          </Menu.Item>
        </Menu>
      }
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        type="ghost"
        placement="bottomRight"
        className="left"
        shape="circle"
        icon={<UserOutlined />}
      />
    </Dropdown>
  );
});

const AddButton = withRouter(
  ({
    isAuthenticated,
    setSignupModalVisible,
    setWarningModalVisible,
    loginWithPopup,
    history,
  }) => {
    const { profile } = UIStore.currentState;
    if (isAuthenticated) {
      if (profile?.reviewStatus === "APPROVED") {
        return (
          <Dropdown
            overlayClassName="add-dropdown-wrapper"
            overlay={
              <Menu className="add-dropdown">
                <Menu.Item
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
                    history.push("/add-initiative");
                  }}
                >
                  Initiative <RightOutlined />
                </Menu.Item>
                <Menu.Item
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
                    history.push("/add-action-plan");
                  }}
                >
                  Action Plan <RightOutlined />
                </Menu.Item>
                <Menu.Item
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
                    history.push("/add-policy");
                  }}
                >
                  Policy <RightOutlined />
                </Menu.Item>
                <Menu.Item
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
                    history.push("/add-technical-resource");
                  }}
                >
                  Technical Resource <RightOutlined />
                </Menu.Item>
                <Menu.Item
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
                    history.push("/add-financing-resource");
                  }}
                >
                  Financing Resource <RightOutlined />
                </Menu.Item>
                <Menu.Item
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
                  Event <RightOutlined />
                </Menu.Item>
                <Menu.Item
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
                    history.push("/add-technology");
                  }}
                >
                  Technology <RightOutlined />
                </Menu.Item>
              </Menu>
            }
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button type="primary" placement="bottomRight">
              Add Content
            </Button>
          </Dropdown>
        );
      }
      return (
        <Button
          type="primary"
          onClick={() => {
            Object.keys(profile).length > 1
              ? setWarningModalVisible(true)
              : setSignupModalVisible(true);
          }}
        >
          Add Content
        </Button>
      );
    }
    return (
      <Button type="primary" onClick={loginWithPopup}>
        Add Content
      </Button>
    );
  }
);

export default Root;
