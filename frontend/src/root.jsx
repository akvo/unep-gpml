import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  withRouter,
  useLocation,
  useHistory,
} from "react-router-dom";
import ReactGA from "react-ga";
import { useAuth0 } from "@auth0/auth0-react";
import { Input, Button, Menu, Dropdown, Layout } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import OldLanding from "./modules/landing/new-home";
import Browse from "./modules/browse/view";
import Stakeholders from "./modules/stakeholders/view";
import AddEvent from "./modules/events/view";
import SignupView from "./modules/signup/view";
import SignupViewNew from "./modules/email-signup/view";
import Login from "./modules/login/view";
import LoginView from "./modules/login/login-view";
import logo from "./images/gpml.svg";
// add auth0 logo pop-up
// eslint-disable-next-line
import tmpLogo from "./images/GPML-temporary-logo-horiz.jpg";
import ModalWarningUser from "./utils/modal-warning-user";
import api from "./utils/api";
import { updateStatusProfile, isRegistered } from "./utils/profile";
import { useQuery } from "./modules/knowledge-library/common";
import { storage } from "./utils/storage";
import { UIStore } from "./store.js";
import ProfileView from "./modules/profile/view";
import Footer from "./footer";
import uniqBy from "lodash/uniqBy";
import sortBy from "lodash/sortBy";
import AddFinancingResource from "./modules/financing-resource/view";
import AddTechnicalResource from "./modules/technical-resource/view";
import AddInitiative from "./modules/initiative/view";
import AddActionPlan from "./modules/action-plan/view";
import AddTechnology from "./modules/technology/view";
import AddPolicy from "./modules/policy/view";
import Topic from "./modules/topics/topic";
import AboutUs from "./modules/about/about-us";
import Glossary from "./modules/glossary/glossary";
import Error from "./modules/error/error";
import EntityFormView from "./modules/entity-edit-signup/view";
import Workspace from "./modules/workspace/view";
import StakeholderDetail from "./modules/stakeholder-detail/view";
import EntityDetail from "./modules/entity-detail/view";
import Connect from "./modules/connect/view";
import Knowledge from "./modules/knowledge/view";

// Menu dropdown
import ResponsiveMenu from "./modules/dropdown-menu/responsive-menu";

// Discourse Forum
import DiscourseForum from "./modules/discourse-forum/discourse-forum";

// Flexible Form
import FlexibleForms from "./modules/flexible-forms/view";

// New Details Page
import NewDetailsView from "./modules/details-page/view";

// Buttons
import AddContentButton from "./components/add-content-button/add-content-button";

// Auth
import Onboarding from "./modules/onboarding/view";

//Help
import HelpCenter from "./modules/help-center/view";

let tmid;

const TRACKING_ID = "G-NCNKDZ0R29";

import { auth0Client } from "./utils/misc";
import Landing from "./modules/landing/landing";
import GetStarted from "./modules/projects/get-started";
import Project from "./modules/projects/view";
import MenuBar from "./modules/landing/menu-bar";

Promise.all([
  api.get("/tag"),
  api.get("/currency"),
  api.get("/country"),
  api.get("/country-group"),
  api.get("/organisation"),
  api.get("/nav"),
  api.get("/stakeholder"),
  api.get("/non-member-organisation"),
]).then((res) => {
  const [
    tag,
    currency,
    country,
    countryGroup,
    organisation,
    nav,
    stakeholder,
    nonMemberOrganisations,
  ] = res;
  UIStore.update((e) => {
    e.tags = tag.data;
    e.currencies = currency.data;
    e.countries = uniqBy(country.data).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    e.regionOptions = countryGroup.data.filter((x) => x.type === "region");
    e.meaOptions = countryGroup.data.filter((x) => x.type === "mea");
    e.transnationalOptions = countryGroup.data.filter(
      (x) => x.type === "transnational"
    );
    e.organisations = uniqBy(sortBy(organisation.data, ["name"])).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    e.nonMemberOrganisations = uniqBy(
      sortBy(nonMemberOrganisations.data, ["name"])
    ).sort((a, b) => a.name.localeCompare(b.name));
    e.nav = nav.data;
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
        The GPML Digital Platform Phase 3 is now live and currently a Beta
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

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const { Header } = Layout;

const Root = () => {
  const {
    // isAuthenticated,
    getIdTokenClaims,
    loginWithPopup,
    logout,
    user,
  } = useAuth0();

  const query = useQuery();
  const history = useHistory();
  const path = history.location.pathname;

  const { profile, disclaimer, nav, tags } = UIStore.useState((s) => ({
    profile: s.profile,
    disclaimer: s.disclaimer,
    nav: s.nav,
    tags: s.tags,
  }));
  const [setStakeholderSignupModalVisible] = useState(false);

  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [filters, setFilters] = useState(null);
  const [filterMenu, setFilterMenu] = useState(null);
  const [showResponsiveMenu, setShowResponsiveMenu] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [_expiresAt, setExpiresAt] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [authResult, setAuthResult] = useState(null);

  const topicsCount = tags?.topics ? tags.topics.length : 0;
  const excludeSummary = ["organisation", "stakeholder"];

  const filterNav = (include) => {
    return nav?.resourceCounts
      ?.filter((x) =>
        include
          ? excludeSummary.includes(Object.keys(x)[0])
          : !excludeSummary.includes(Object.keys(x)[0])
      )
      .map((x) => {
        return {
          name: Object.keys(x)[0],
          count: x[Object.keys(x)[0]],
        };
      });
  };
  const resourceCounts = filterNav(false);
  const stakeholderCounts = filterNav(true);

  const isAuthenticated = new Date().getTime() < _expiresAt;

  const setSession = (authResult) => {
    setExpiresAt(authResult.expiresIn * 1000 + new Date().getTime());
    setIdToken(authResult.idToken);
    setAuthResult(authResult);
    scheduleTokenRenewal();
  };

  const renewToken = (cb) => {
    auth0Client.checkSession({}, (err, result) => {
      if (err) {
        console.log(`Error: ${err.error} - ${err.error_description}.`);
      } else {
        setSession(result);
      }

      if (cb) {
        cb(err, result);
      }
    });
  };

  const scheduleTokenRenewal = () => {
    const delay = _expiresAt - Date.now();
    if (delay > 0) {
      setTimeout(() => renewToken(), delay);
    }
  };

  useEffect(() => {
    auth0Client.parseHash((err, authResult) => {
      if (err) {
        return console.log(err);
      }
      if (authResult) {
        const redirectLocation =
          localStorage.getItem("redirect_on_login") === "undefined"
            ? "/"
            : JSON.parse(localStorage.getItem("redirect_on_login"));
        history.push({
          pathname: redirectLocation?.pathname,
          ...(redirectLocation?.search && { search: redirectLocation?.search }),
        });
        setSession(authResult);
        api.setToken(authResult.idToken);
        if (
          authResult?.idTokenPayload?.hasOwnProperty(
            "https://digital.gpmarinelitter.org/is_new"
          )
        ) {
          if (
            authResult?.idTokenPayload?.[
              "https://digital.gpmarinelitter.org/is_new"
            ]
          ) {
            UIStore.update((e) => {
              e.profile = {
                emailVerified: authResult?.idTokenPayload?.email_verified,
              };
            });
            history.push({
              pathname: "/onboarding",
              state: { data: authResult?.idTokenPayload },
            });
          }
        }
      }
      localStorage.removeItem("redirect_on_login");
    });
  }, []);

  useEffect(() => {
    auth0Client.checkSession({}, async (err, authResult) => {
      if (err) {
        console.log(err);
        setLoadingProfile(true);
        // history.push("/login");
      }
      if (authResult) {
        setSession(authResult);
      }
    });
  }, []);

  useEffect(() => {
    (async function fetchData() {
      if (isAuthenticated && idToken) {
        api.setToken(idToken);
      } else {
        api.setToken(null);
      }
      if (isAuthenticated && idToken && authResult) {
        let resp = await api.get("/profile");
        setLoadingProfile(false);
        if (resp.data && Object.keys(resp.data).length === 0) {
          history.push({
            pathname: "/onboarding",
            state: { data: authResult?.idTokenPayload },
          });
        }
        UIStore.update((e) => {
          e.profile = {
            ...resp.data,
            email: authResult?.idTokenPayload?.email,
            emailVerified: authResult?.idTokenPayload?.email_verified,
          };
        });
        updateStatusProfile(resp.data);
      }
    })();
  }, [idToken, authResult]);

  useEffect(() => {
    if (window.location.host === "digital.gpmarinelitter.org") {
      ReactGA.initialize(TRACKING_ID);
      ReactGA.pageview(window.location.pathname + window.location.search);
    }
  }, []);

  // Remove scroll effect after displaying the detail modal
  useEffect(() => {
    const body = document.querySelector("body");
    if (!path.includes("/knowledge")) {
      body.classList.remove("scroll-disabled");
      body.style.top = "unset";
    }
  }, [path]);

  // Here we retrieve the resources data
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginVisible, setLoginVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [filterCountries, setFilterCountries] = useState([]);
  const [relations, setRelations] = useState([]);
  const { isLoading } = useAuth0();
  const pageSize = 8;
  const [countData, setCountData] = useState([]);
  const [multiCountryCountries, setMultiCountryCountries] = useState([]);
  const [landingQuery, setLandingQuery] = useState("");
  const getResults = (query) => {
    const searchParms = new URLSearchParams(window.location.search);
    searchParms.set("limit", pageSize);
    const topic = [
      "action_plan",
      "initiative",
      "policy",
      "technical_resource",
      "technology",
      "event",
      "financing_resource",
    ];

    const popularTags = [
      "plastics",
      "waste management",
      "marine litter",
      "capacity building",
      "product by design",
      "source to sea",
    ];

    searchParms.set("incCountsForTags", popularTags);

    if (query?.topic?.length === 0) {
      if (
        (query?.startDate && query?.startDate?.length !== 0) ||
        (query?.endDate && query?.endDate?.length !== 0)
      ) {
        searchParms.set("topic", "event");
      } else if (
        query?.hasOwnProperty("favorites") &&
        query?.favorites === true
      ) {
        searchParms.set("topic", []);
      } else {
        searchParms.set("topic", topic);
      }
    }
    const url = `/browse?${String(searchParms)}`;
    api
      .get(url)
      .then((resp) => {
        setResults(resp?.data?.results);
        setCountData(resp?.data?.counts);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const updateQuery = (param, value) => {
    const topScroll = window.innerWidth < 640 ? 996 : 207;
    window.scrollTo({
      top: window.pageYOffset < topScroll ? window.pageYOffset : topScroll,
    });
    setLoading(true);
    const newQuery = { ...query };
    newQuery[param] = value;

    if (param !== "offset") {
      newQuery["offset"] = 0;
    }

    // Remove empty query
    const arrayOfQuery = Object.entries(newQuery)?.filter(
      (item) => item[1]?.length !== 0
    );

    const pureQuery = Object.fromEntries(arrayOfQuery);

    setFilters(pureQuery);

    const newParams = new URLSearchParams(pureQuery);

    history.push(`/knowledge/library?${newParams.toString()}`);

    setLandingQuery(newParams.toString());

    clearTimeout(tmid);

    tmid = setTimeout(getResults(pureQuery), 1000);

    if (param === "country") {
      setFilterCountries(value);
    }
  };

  return (
    <>
      <Login visible={loginVisible} close={() => setLoginVisible(false)} />
      <Switch>
        <Route
          path="/"
          exact
          render={(props) => (
            <Landing
              {...{
                ...props,
                setLoginVisible,
                profile,
                updateQuery,
                isRegistered,
                logout,
                isAuthenticated,
                auth0Client,
                setWarningModalVisible,
                history,
                showMenu,
                setShowMenu,
              }}
            />
          )}
        />
        <Route>
          <ScrollToTop />
          {storage.getCookie("showDisclaimer") !== "false" &&
            disclaimerContent?.[disclaimer] && (
              <div className="panel-disclaimer">
                <div className="ui container">
                  {disclaimerContent?.[disclaimer]}
                </div>
              </div>
            )}
          <MenuBar
            {...{
              setLoginVisible,
              isAuthenticated,
              auth0Client,
              profile,
              isRegistered,
              setWarningModalVisible,
              showMenu,
              setShowMenu,
            }}
          />
          <Switch>
            <Route
              path="/"
              exact
              render={(props) => (
                <OldLanding
                  {...{
                    setWarningModalVisible,
                    setStakeholderSignupModalVisible,
                    isAuthenticated,
                    setFilterMenu,
                    setLoginVisible,
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
              path="/knowledge"
              render={(props) => (
                <Knowledge
                  {...{
                    history,
                    query,
                    results,
                    countData,
                    pageSize,
                    loading,
                    filters,
                    filterMenu,
                    filterCountries,
                    isAuthenticated,
                    loginWithPopup,
                    multiCountryCountries,
                    isLoading,
                    setLoading,
                    landingQuery,

                    //Functions
                    setFilterMenu,
                    getResults,
                    updateQuery,
                    setFilters,
                    setRelations,
                    setFilterCountries,
                    setMultiCountryCountries,
                    setWarningModalVisible,
                    setLoginVisible,
                    ...props,
                  }}
                  filters={filters}
                  setFilters={setFilters}
                  filterMenu={filterMenu}
                />
              )}
            />

            <Route
              path="/browse"
              render={(props) => (
                <Browse
                  {...{
                    setWarningModalVisible,
                    ...props,
                  }}
                  setStakeholderSignupModalVisible={
                    setStakeholderSignupModalVisible
                  }
                  filters={filters}
                  setFilters={setFilters}
                  filterMenu={filterMenu}
                />
              )}
            />
            <Route
              exact
              path="/topics"
              render={(props) => (
                <Topic {...props} filters={filters} setFilters={setFilters} />
              )}
            />
            <Route
              path="/stakeholders"
              render={(props) => (
                <Stakeholders
                  {...props}
                  setStakeholderSignupModalVisible={
                    setStakeholderSignupModalVisible
                  }
                  filters={filters}
                  setFilters={setFilters}
                  filterMenu={filterMenu}
                />
              )}
            />
            <Route
              path="/add-event"
              render={(props) => <AddEvent {...props} />}
            />
            <Route
              exact
              path="/edit-event/:id"
              render={(props) => (
                <FlexibleForms {...props} setLoginVisible={setLoginVisible} />
              )}
            />
            <Route
              exact
              path="/edit-case-study/:id"
              render={(props) => (
                <FlexibleForms {...props} setLoginVisible={setLoginVisible} />
              )}
            />
            <Route
              path="/add-technology"
              render={(props) => <AddTechnology {...props} />}
            />
            <Route
              exact
              path="/edit-technology/:id"
              render={(props) => <FlexibleForms {...props} />}
            />

            <Route
              path="/add-policy"
              render={(props) => <AddPolicy {...props} />}
            />
            <Route
              exact
              path="/edit-policy/:id"
              render={(props) => <FlexibleForms {...props} />}
            />

            <Route
              path="/add-action-plan"
              render={(props) => <AddActionPlan {...props} />}
            />
            <Route
              exact
              path="/edit-action-plan/:id"
              render={(props) => <FlexibleForms {...props} />}
            />

            <Route
              path="/add-financing-resource"
              render={(props) => <AddFinancingResource {...props} />}
            />
            <Route
              exact
              path="/edit-financing-resource/:id"
              render={(props) => <FlexibleForms {...props} />}
            />

            <Route
              path="/add-technical-resource"
              render={(props) => <AddTechnicalResource {...props} />}
            />
            <Route
              exact
              path="/edit-technical-resource/:id"
              render={(props) => <FlexibleForms {...props} />}
            />

            <Route
              path="/add-initiative"
              render={(props) => <AddInitiative {...props} />}
            />
            <Route
              exact
              path="/edit-initiative/:id"
              render={(props) => <FlexibleForms {...props} />}
            />

            <Route
              exact
              path="/:type(edit-entity|edit-stakeholder)/:id"
              render={(props) => <EntityFormView {...props} />}
            />

            <Route
              path="/profile"
              render={(props) => <ProfileView {...{ ...props, relations }} />}
            />
            <Route
              path="/entity-signup"
              render={(props) => <SignupView {...props} formType="entity" />}
            />
            <Route
              path="/stakeholder-signup"
              render={(props) => (
                <SignupView {...props} formType="stakeholder" />
              )}
            />
            <Route
              path="/stakeholder-signup-new"
              render={(props) => <SignupViewNew {...props} />}
            />
            <Route path="/login" render={(props) => <LoginView {...props} />} />
            <Route
              path="/flexible-forms"
              render={(props) => (
                <FlexibleForms
                  {...props}
                  setLoginVisible={setLoginVisible}
                  isAuthenticated={isAuthenticated}
                  loadingProfile={loadingProfile}
                />
              )}
            />
            <Route
              path="/details-view"
              render={(props) => (
                <NewDetailsView {...props} isAuthenticated={isAuthenticated} />
              )}
            />
            <Route
              path="/discourse-forum"
              render={(props) => <DiscourseForum />}
            />

            <Route path="/help-center" render={(props) => <HelpCenter />} />

            <Route
              exact
              render={(props) =>
                isAuthenticated && <Workspace {...props} profile={profile} />
              }
              path="/workspace"
            />
            <Route path="/projects/get-started">
              <GetStarted />
            </Route>
            <Route
              exact
              path="/projects/:id"
              render={(props) => <Project {...props} profile={profile} />}
            />
            <Route
              exact
              render={(props) => (
                <StakeholderDetail
                  {...props}
                  isAuthenticated={isAuthenticated}
                />
              )}
              path="/stakeholder-detail"
            />
            <Route
              exact
              render={(props) => <Onboarding {...props} />}
              path="/onboarding"
            />

            <Route
              path="/connect"
              render={(props) => (
                <Connect
                  {...props}
                  setLoginVisible={setLoginVisible}
                  filters={filters}
                  setFilters={setFilters}
                  isAuthenticated={isAuthenticated}
                  loadingProfile={loadingProfile}
                />
              )}
            />

            <Route
              path="/:type(stakeholder)/:id"
              render={(props) => (
                <StakeholderDetail
                  {...props}
                  setLoginVisible={setLoginVisible}
                  setFilterMenu={setFilterMenu}
                  isAuthenticated={isAuthenticated}
                />
              )}
            />
            <Route
              path="/:type(initiative|action-plan|policy|technical-resource|financing-resource|technology|event|case-study)/:id"
              render={(props) => (
                <NewDetailsView
                  {...props}
                  setLoginVisible={setLoginVisible}
                  setFilterMenu={setFilterMenu}
                  isAuthenticated={isAuthenticated}
                />
              )}
            />
            <Route
              path="/:type(organisation)/:id"
              render={(props) => (
                <EntityDetail
                  {...props}
                  setStakeholderSignupModalVisible={
                    setStakeholderSignupModalVisible
                  }
                  setFilterMenu={setFilterMenu}
                  isAuthenticated={isAuthenticated}
                />
              )}
            />
            <Route exact path="/not-found">
              <Error status={404} />
            </Route>
            <Route exact path="/not-authorized">
              <Error status={403} />
            </Route>
            <Route exact path="/error">
              <Error />
            </Route>
            <Route component={(props) => <Error {...props} status={404} />} />
          </Switch>
          {isAuthenticated && <AddContentButton />}
          <Footer
            setStakeholderSignupModalVisible={setStakeholderSignupModalVisible}
            setWarningModalVisible={setWarningModalVisible}
            isAuthenticated={isAuthenticated}
            loginWithPopup={loginWithPopup}
            setFilterMenu={setFilterMenu}
            setLoginVisible={setLoginVisible}
            setShowMenu={setShowMenu}
          />
          <ModalWarningUser
            visible={warningModalVisible}
            close={() => setWarningModalVisible(false)}
          />
          <ResponsiveMenu
            {...{
              profile,
              updateQuery,
              setWarningModalVisible,
              isAuthenticated,
              setLoginVisible,
              loginWithPopup,
              logout,
              setFilterMenu,
              showResponsiveMenu,
              setShowResponsiveMenu,
              topicsCount,
              stakeholderCounts,
            }}
            resources={resourceCounts}
          />
        </Route>
      </Switch>
    </>
  );
};

const Search = withRouter(({ history, updateQuery }) => {
  const [search, setSearch] = useState("");

  const handleSearch = (src) => {
    const path = history.location.pathname;
    if (src) {
      history.push(`/knowledge/library?q=${src.trim()}`);
      updateQuery("q", src.trim());
    } else {
      updateQuery("q", src.trim());
    }
  };

  return (
    <div className="src">
      <Input
        className="input-src"
        placeholder="Search"
        suffix={<SearchOutlined />}
        onPressEnter={(e) => handleSearch(e.target.value)}
        onSubmit={(e) => setSearch(e.target.value)}
      />
    </div>
  );
});

const UserButton = withRouter(({ history, logout, isRegistered, profile }) => {
  return (
    <Dropdown
      overlayClassName="user-btn-dropdown-wrapper"
      overlay={
        <Menu className="user-btn-dropdown">
          <Menu.Item
            onClick={() => {
              history.push(
                `/${isRegistered(profile) ? "profile" : "onboarding"}`
              );
            }}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            onClick={() =>
              auth0Client.logout({ returnTo: window.location.origin })
            }
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
    setLoginVisible,
  }) => {
    const profile = UIStore.useState((s) => s.profile);
    if (isAuthenticated) {
      if (profile?.reviewStatus === "APPROVED") {
        return (
          <>
            <Link to="/flexible-forms">
              <Button type="primary">Add Content</Button>
            </Link>
          </>
        );
      }
      return (
        <Button
          type="primary"
          onClick={() => {
            profile?.reviewStatus === "SUBMITTED"
              ? setWarningModalVisible(true)
              : history.push("/onboarding");
          }}
        >
          Add Content
        </Button>
      );
    }
    return (
      <Button type="primary" onClick={() => setLoginVisible(true)}>
        Add Content
      </Button>
    );
  }
);

export default Root;
