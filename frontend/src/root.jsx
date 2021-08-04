import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  withRouter,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Input, Button, Menu, Dropdown, Avatar, Popover } from "antd";
import { RightOutlined } from "@ant-design/icons";
import Landing from "./modules/landing/view";
import Browse from "./modules/browse/view";
import AddEvent from "./modules/events/view";
import logo from "./images/GPML-temporary-logo-horiz.jpg";
import StakeholderSignupModal from "./modules/stakeholder-signup/signup-modal";
import ModalWarningUser from "./utils/modal-warning-user";
import api from "./utils/api";
import { storage } from "./utils/storage";
import { UIStore } from "./store.js";
import ProfileView from "./modules/profile/view";
import StakeholderSignupView from "./modules/stakeholder-signup/view";
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

api.get("/tag").then((resp) => {
  UIStore.update((e) => {
    e.tags = resp.data;
  });
});
api.get("/currency").then((resp) => {
  UIStore.update((e) => {
    e.currencies = resp.data;
  });
});
api.get("/country").then((resp) => {
  UIStore.update((e) => {
    e.countries = uniqBy(resp.data).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  });
});
api.get("/country-group").then((resp) => {
  UIStore.update((e) => {
    e.regionOptions = resp.data.filter((x) => x.type === "region");
  });
  UIStore.update((e) => {
    e.meaOptions = resp.data.filter((x) => x.type === "mea");
  });
});
api.get("/organisation").then((resp) => {
  UIStore.update((e) => {
    e.organisations = uniqBy(sortBy(resp.data, ["name"])).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
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

const Root = () => {
  const {
    isAuthenticated,
    getIdTokenClaims,
    loginWithPopup,
    logout,
    user,
  } = useAuth0();
  const { profile, disclaimer } = UIStore.useState();
  const [
    stakeholderSignupModalVisible,
    setStakeholderSignupModalVisible,
  ] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(null);

  useEffect(() => {
    api.get("/landing").then((resp) => {
      setData(resp.data);
      UIStore.update((e) => {
        e.loading = false;
      });
    });
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
            setStakeholderSignupModalVisible(
              Object.keys(resp.data).length === 0
            );
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
  }, [getIdTokenClaims, isAuthenticated]);

  return (
    <Router>
      <div id="root">
        {disclaimerContent?.[disclaimer] && (
          <div className="panel-disclaimer">
            <p className="ui container">{disclaimerContent?.[disclaimer]}</p>
          </div>
        )}
        <div className="topbar">
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
            {!isAuthenticated ? (
              <div className="rightside">
                <Link to="/stakeholder-signup">Join the GPML</Link>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <Link to="/" onClick={loginWithPopup}>
                  Sign in
                </Link>
              </div>
            ) : (
              <div className="rightside">
                <Popover
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
                  <Link to="/profile">
                    {profile ? profile.firstName : user.nickname}
                  </Link>
                </Popover>
                <Button
                  type="link"
                  onClick={() => logout({ returnTo: window.location.origin })}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
        <header>
          <div className="ui container">
            <Link to="/">
              <img src={logo} className="logo" alt="GPML" />
            </Link>
            <Switch>
              <Route path="/browse" />
              <Route>
                <Search />
              </Route>
            </Switch>
            <nav>
              <AddButton
                {...{
                  setStakeholderSignupModalVisible,
                  isAuthenticated,
                  loginWithPopup,
                  setWarningModalVisible,
                }}
              />
            </nav>
          </div>
        </header>
        <Route
          path="/"
          exact
          render={(props) => (
            <Landing
              {...{
                data,
                setWarningModalVisible,
                setStakeholderSignupModalVisible,
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
              setStakeholderSignupModalVisible={
                setStakeholderSignupModalVisible
              }
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
        <Route
          path="/stakeholder-signup"
          render={(props) => <StakeholderSignupView {...props} />}
        />
        <Route
          path="/:type(project|action_plan|policy|technical_resource|financing_resource|technology|event|organisation|stakeholder)/:id"
          render={(props) => (
            <DetailsView
              {...props}
              setStakeholderSignupModalVisible={
                setStakeholderSignupModalVisible
              }
            />
          )}
        />
        <Footer
          setStakeholderSignupModalVisible={setStakeholderSignupModalVisible}
          setWarningModalVisible={setWarningModalVisible}
          isAuthenticated={isAuthenticated}
          loginWithPopup={loginWithPopup}
        />
      </div>
      <StakeholderSignupModal
        visible={stakeholderSignupModalVisible}
        onCancel={() => setStakeholderSignupModalVisible(false)}
      />
      <ModalWarningUser
        visible={warningModalVisible}
        close={() => setWarningModalVisible(false)}
      />
    </Router>
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
      placeholder="Search for resources and stakeholders"
      size="large"
    />
  );
});

const AddButton = withRouter(
  ({
    isAuthenticated,
    setStakeholderSignupModalVisible,
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
            <Button type="primary" size="large" placement="bottomRight">
              + Add
            </Button>
          </Dropdown>
        );
      }
      return (
        <Button
          type="primary"
          size="large"
          onClick={() => {
            Object.keys(profile).length > 1
              ? setWarningModalVisible(true)
              : setStakeholderSignupModalVisible(true);
          }}
        >
          + Add
        </Button>
      );
    }
    return (
      <Button type="primary" size="large" onClick={loginWithPopup}>
        + Add
      </Button>
    );
  }
);

export default Root;
