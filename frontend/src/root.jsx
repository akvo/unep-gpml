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
import {
  RightOutlined,
  DownOutlined,
  UserOutlined,
  SearchOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
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
import sumBy from "lodash/sumBy";
import AddFinancingResource from "./modules/financing-resource/view";
import AddTechnicalResource from "./modules/technical-resource/view";
import AddInitiative from "./modules/initiative/view";
import AddActionPlan from "./modules/action-plan/view";
import AddTechnology from "./modules/technology/view";
import AddPolicy from "./modules/policy/view";
import { topicNames } from "./utils/misc";
import humps from "humps";
import AboutUs from "./modules/about/about-us";
import Glossary from "./modules/glossary/glossary";

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
                    api
                      .get("/landing")
                      .then((resp) => {
                        return resp.data;
                      })
                      .then((landing) => {
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
                          e.summary = landing?.summary ? landing.summary : [];
                        });
                      });
                  });
              });
          });
      });
  });

const DisclaimerCloseBtn = () => (
  <Button
    type="link"
    icon={<CloseCircleOutlined />}
    onClick={() => {
      document.cookie = "showDisclaimer=false";
      UIStore.update((e) => {
        e.disclaimer = null;
      });
    }}
  />
);

const disclaimerContent = {
  home: (
    <>
      <span>
        The GPML Digital Platform Phase 1 is now live and currently a Beta
        Version. Help us test the platform and let us know what you think at{" "}
        <a style={{ color: "white" }} href="mailto:unep-gpmarinelitter@un.org">
          unep-gpmarinelitter@un.org
        </a>
        . Take part in shaping the platform’s next releases, until its final
        launch scheduled for 2023. Stay tuned!
      </span>
      <DisclaimerCloseBtn />
    </>
  ),
  browse: (
    <>
      <span>
        UNEP shall not be liable for third party content hosted on the platform.
        Contact us if you have any concerns with the content at:{" "}
        <a style={{ color: "white" }} href="mailto:unep-gpmarinelitter@un.org">
          unep-gpmarinelitter@un.org
        </a>
        . Please note that during Beta Testing, content and functionality issues
        may persist.
      </span>
      <DisclaimerCloseBtn />
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
  const { profile, disclaimer, loading, summary, tags } = UIStore.useState(
    (s) => s
  );
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
        {storage.getCookie("showDisclaimer") !== "false" &&
          disclaimerContent?.[disclaimer] && (
            <div className="panel-disclaimer">
              <div className="ui container">
                {disclaimerContent?.[disclaimer]}
              </div>
            </div>
          )}
        <Header className="nav-header-container">
          <div className="ui container">
            <div className="logo-wrapper">
              <Link to="/">
                <img src={logo} className="logo" alt="GPML" />
              </Link>
            </div>
            {renderDropdownMenu(tags, summary)}
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
          exact
          path="/about-us"
          render={(props) => <AboutUs {...props} />}
        />
        <Route
          exact
          path="/glossary"
          render={(props) => <Glossary {...props} />}
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

const renderDropdownMenu = (tags, summary) => {
  const excludeSummary = ["event", "organisation", "stakeholder"];
  summary = summary
    .filter((x) => !excludeSummary.includes(Object.keys(x)[0]))
    .map((x) => {
      return {
        name: Object.keys(x)[0],
        count: x[Object.keys(x)[0]],
      };
    });
  return (
    <div className="menu-dropdown-container">
      <AboutDropdownMenu />
      <ExploreDropdownMenu topics={tags?.topics ? tags.topics.length : 0} />
      <DataHubDropdownMenu />
      <KnowledgeExchangeDropdownMenu resources={summary} />
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
          {/* <Menu.Item className="nav-link">Partnership</Menu.Item> */}
          <Menu.Item
            className="nav-link"
            onClick={() => history.push("/about-us")}
          >
            Digital Platform
          </Menu.Item>
        </Menu>
      }
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button type="link" className="menu-btn nav-link">
        About <DownOutlined />
      </Button>
    </Dropdown>
  );
});

const ExploreDropdownMenu = withRouter(({ history, topics }) => {
  return (
    <Dropdown
      overlayClassName="menu-dropdown-wrapper"
      overlay={
        <Menu className="menu-dropdown">
          <Menu.Item className="nav-link" disabled={!topics}>
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

const DataHubDropdownMenu = withRouter(({ history }) => {
  return (
    <Dropdown
      overlayClassName="menu-dropdown-wrapper"
      overlay={
        <Menu className="menu-dropdown">
          <Menu.Item className="nav-link">Data Map & Layers</Menu.Item>
          <Menu.Item className="nav-link">Dashboards</Menu.Item>
          <Menu.Item className="nav-link">Data Catalogue</Menu.Item>
          <Menu.Item className="nav-link">Data Content</Menu.Item>
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

const KnowledgeExchangeDropdownMenu = withRouter(({ history, resources }) => {
  const loading = !resources.length;
  const allResources = sumBy(resources, "count");
  return (
    <Dropdown
      overlayClassName="menu-dropdown-wrapper"
      overlay={
        <Menu className="menu-dropdown">
          <Menu.Item
            className="nav-link"
            onClick={() => history.push("/browse")}
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
          {resources.map((x, i) => {
            const { name, count } = x;
            return (
              <Menu.Item
                key={`${name}-${i}`}
                className="indent-right nav-link"
                disabled={loading}
                onClick={() =>
                  history.push(`/browse?topic=${humps.decamelize(name)}`)
                }
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
          {/* <Menu.Item className="nav-link">
            Capacity building
            <Button
              className="badge-count"
              size="small"
              type="ghost"
              shape="circle"
              icon={10}
              loading={false}
            />
          </Menu.Item> */}
        </Menu>
      }
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button type="link" className="menu-btn nav-link">
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
          <Menu.Item
            className="nav-link"
            onClick={() => history.push("/browse?topic=event")}
          >
            Events
          </Menu.Item>
          <Menu.Item className="nav-link">Stakeholders Directory</Menu.Item>
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
  const [search, setSearch] = useState("");
  const handleSearch = (src) => {
    if (src) {
      history.push(`/browse/?q=${src.trim()}`);
    }
  };

  return (
    <div className="src">
      <Input
        className="input-src"
        placeholder="Search"
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
    </div>
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
            Profile
          </Menu.Item>
          <Menu.Item
            onClick={() => logout({ returnTo: window.location.origin })}
          >
            Logout
          </Menu.Item>
        </Menu>
      }
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        type="ghost"
        placement="bottomRight"
        className="left white"
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
                  Initiative
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
                  Action Plan
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
                  Policy
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
                  Technical Resource
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
                  Financing Resource
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
                  Event
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
                  Technology
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
