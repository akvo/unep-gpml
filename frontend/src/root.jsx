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
  UserOutlined,
  SearchOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import Landing from "./modules/landing/new-home";
import Browse from "./modules/browse/view";
import AddEvent from "./modules/events/view";
import SignupView from "./modules/signup/view";
import logo from "./images/GPML-logo-white.png";
import ModalWarningUser from "./utils/modal-warning-user";
import api from "./utils/api";
import { storage } from "./utils/storage";
import { UIStore } from "./store.js";
import ProfileView from "./modules/profile/view";
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
import AboutUs from "./modules/about/about-us";
import Glossary from "./modules/glossary/glossary";

// Menu dropdown
import AboutDropdownMenu from "./modules/dropdown-menu/about";
import ExploreDropdownMenu from "./modules/dropdown-menu/explore";
import DataHubDropdownMenu from "./modules/dropdown-menu/data-hub";
import KnowledgeExchangeDropdownMenu from "./modules/dropdown-menu/knowledge-exchange";
import ConnectStakeholdersDropdownMenu from "./modules/dropdown-menu/connect-stakeholders";

Promise.all([
  api.get("/tag"),
  api.get("/currency"),
  api.get("/country"),
  api.get("/country-group"),
  api.get("/organisation"),
  api.get("/landing"),
  api.get("/stakeholder"),
]).then((res) => {
  const [
    tag,
    currency,
    country,
    countryGroup,
    organisation,
    landing,
    stakeholder,
  ] = res;
  UIStore.update((e) => {
    e.tags = tag.data;
    e.currencies = currency.data;
    e.countries = uniqBy(country.data).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    e.regionOptions = countryGroup.data.filter((x) => x.type === "region");
    e.meaOptions = countryGroup.data.filter((x) => x.type === "mea");
    e.organisations = uniqBy(sortBy(organisation.data, ["name"])).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    e.summary = landing.data?.summary ? landing.data.summary : [];
    e.stakeholders = stakeholder.data;
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
  const { profile, disclaimer, summary, tags } = UIStore.useState((s) => ({
    profile: s.profile,
    disclaimer: s.disclaimer,
    summary: s.summary,
    tags: s.tags,
  }));
  const [signupModalVisible, setSignupModalVisible] = useState(false);
  const [
    stakeholderSignupModalVisible,
    setStakeholderSignupModalVisible,
  ] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [filters, setFilters] = useState(null);

  useEffect(() => {
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
            {renderDropdownMenu(
              tags,
              summary,
              profile,
              setWarningModalVisible,
              isAuthenticated,
              setStakeholderSignupModalVisible,
              loginWithPopup
            )}
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
                    setStakeholderSignupModalVisible,
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
        <Route path="/signup" render={(props) => <SignupView {...props} />} />
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
      <ModalWarningUser
        visible={warningModalVisible}
        close={() => setWarningModalVisible(false)}
      />
    </Router>
  );
};

const renderDropdownMenu = (
  tags,
  summary,
  profile,
  setWarningModalVisible,
  isAuthenticated,
  setStakeholderSignupModalVisible,
  loginWithPopup
) => {
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
      <ConnectStakeholdersDropdownMenu
        {...{
          profile,
          setWarningModalVisible,
          isAuthenticated,
          setStakeholderSignupModalVisible,
          loginWithPopup,
        }}
      />
    </div>
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
    setStakeholderSignupModalVisible,
    setWarningModalVisible,
    loginWithPopup,
    history,
  }) => {
    const profile = UIStore.useState((s) => s.profile);
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
              : setStakeholderSignupModalVisible(true);
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
