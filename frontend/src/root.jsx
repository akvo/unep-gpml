import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Link,
  Switch,
  withRouter,
  useLocation,
  useHistory,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Input, Button, Menu, Dropdown, Layout } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  CloseCircleOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Landing, JoinGPMLButton } from "./modules/landing/new-home";
import Browse from "./modules/browse/view";
import Stakeholders from "./modules/stakeholders/view";
import AddEvent from "./modules/events/view";
import SignupView from "./modules/signup/view";
import LandingSignupView from "./modules/signup-old/view";
import logo from "./images/GPML-logo-white.png";
// add auth0 logo pop-up
// eslint-disable-next-line
import tmpLogo from "./images/GPML-temporary-logo-horiz.jpg";
import ModalWarningUser from "./utils/modal-warning-user";
import api from "./utils/api";
import { updateStatusProfile, isRegistered } from "./utils/profile";
import { redirectError } from "./modules/error/error-util";
import { useQuery } from "./modules/knowledge-library/common";
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
import Topic from "./modules/topics/topic";
import AboutUs from "./modules/about/about-us";
import Glossary from "./modules/glossary/glossary";
import Error from "./modules/error/error";
import EntityFormView from "./modules/entity-edit-signup/view";
import Workspace from "./modules/workspace/view";
import EventPage from "./modules/event-page/view";
import StakeholderDetail from "./modules/stakeholder-detail/view";
import EntityDetail from "./modules/entity-detail/view";

// Menu dropdown
import AboutDropdownMenu from "./modules/dropdown-menu/about";
import ExploreDropdownMenu from "./modules/dropdown-menu/explore";
import DataHubDropdownMenu from "./modules/dropdown-menu/data-hub";
import KnowledgeExchangeDropdownMenu from "./modules/dropdown-menu/knowledge-exchange";
import ConnectStakeholdersDropdownMenu from "./modules/dropdown-menu/connect-stakeholders";
import ResponsiveMenu from "./modules/dropdown-menu/responsive-menu";
import WorkspaceButton from "./modules/dropdown-menu/WorkspaceButton";

// Discourse Forum
import DiscourseForum from "./modules/discourse-forum/discourse-forum";

// Flexible Form
import FlexibleForms from "./modules/flexible-forms/view";
import CapacityBuilding from "./modules/capacity-building/view";

// New Details Page
import NewDetailsView from "./modules/detailsPage/view";
import CaseStudies from "./modules/case-studies/view";
import KnowledgeLibrary from "./modules/knowledge-library/view";

// Buttons
import AddContentButton from "./modules/add-content-button/AddContentButton";
import StakeholderOverview from "./modules/stakeholder-overview/view";

let tmid;

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
    isAuthenticated,
    getIdTokenClaims,
    loginWithPopup,
    logout,
    user,
  } = useAuth0();

  const query = useQuery();
  const history = useHistory();

  const { profile, disclaimer, nav, tags } = UIStore.useState((s) => ({
    profile: s.profile,
    disclaimer: s.disclaimer,
    nav: s.nav,
    tags: s.tags,
  }));

  const [signupModalVisible, setSignupModalVisible] = useState(false);
  const [
    stakeholderSignupModalVisible,
    setStakeholderSignupModalVisible,
  ] = useState(false);

  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [filters, setFilters] = useState(null);
  const [filterMenu, setFilterMenu] = useState(null);
  const [showResponsiveMenu, setShowResponsiveMenu] = useState(false);

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

  useEffect(() => {
    (async function fetchData() {
      const response = await getIdTokenClaims();
      if (isAuthenticated) {
        api.setToken(response.__raw);
      } else {
        api.setToken(null);
      }
      if (isAuthenticated) {
        let resp = await api.get("/profile");
        if (!resp.data?.org?.isMember) {
          resp.data.org = null;
        } else if (resp?.data) {
          resp.data.non_member_organisation = null;
        }
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
          updateStatusProfile(resp.data);
        }
      }
    })();
  }, [getIdTokenClaims, isAuthenticated]);

  // Here we retrieve the resources data
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCountries, setFilterCountries] = useState([]);
  const location = useLocation();
  const [relations, setRelations] = useState([]);
  const { isLoading } = useAuth0();
  const [warningVisible, setWarningVisible] = useState(false);
  const pageSize = 8;
  const [countData, setCountData] = useState([]);
  const [multiCountryCountries, setMultiCountryCountries] = useState([]);
  const [landingQuery, setLandingQuery] = useState("");
  const getResults = (query, isSorted) => {
    const searchParms = new URLSearchParams(window.location.search);
    searchParms.set("limit", pageSize);

    const topic = [
      "action_plan",
      "project",
      "policy",
      "technical_resource",
      "technology",
      "event",
      "financing_resource",
      // "capacity_building",
    ];
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
    setFilters(newQuery);
    const newParams = new URLSearchParams(newQuery);
    history.push(`/knowledge-library?${newParams.toString()}`);
    setLandingQuery(newParams.toString());

    clearTimeout(tmid);
    tmid = setTimeout(getResults(newQuery), 1000);
    if (param === "country") {
      setFilterCountries(value);
    }
  };

  return (
    <>
      <ScrollToTop />
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
            {isAuthenticated && <WorkspaceButton />}
            <div className="menu-dropdown-container">
              <AboutDropdownMenu />
              <ExploreDropdownMenu topicsCount={topicsCount} />
              <DataHubDropdownMenu />
              <KnowledgeExchangeDropdownMenu
                resources={resourceCounts}
                setFilterMenu={setFilterMenu}
              />
              <ConnectStakeholdersDropdownMenu
                {...{
                  profile,
                  setWarningModalVisible,
                  isAuthenticated,
                  setStakeholderSignupModalVisible,
                  loginWithPopup,
                  stakeholderCounts,
                  setFilterMenu,
                }}
              />
            </div>
            <Switch>
              <Route path="/browse" />
              <Route>
                <Search updateQuery={updateQuery} />
              </Route>
            </Switch>
            <div className="rightside">
              {!isAuthenticated || !isRegistered(profile) ? (
                <div className="rightside btn-wrapper">
                  <JoinGPMLButton loginWithPopup={loginWithPopup} />
                  {isAuthenticated && !isRegistered(profile) ? (
                    <UserButton {...{ logout, isRegistered, profile }} />
                  ) : (
                    <Button type="ghost" className="left">
                      <Link
                        to="/"
                        onClick={() => loginWithPopup({ action: "login" })}
                      >
                        Sign in
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rightside btn-wrapper">
                  <AddButton
                    {...{
                      setStakeholderSignupModalVisible,
                      isAuthenticated,
                      loginWithPopup,
                      setWarningModalVisible,
                    }}
                  />
                  <UserButton {...{ logout, isRegistered, profile }} />
                </div>
              )}
              {/* Drawer/ Menu for responsive design */}
              <div className="responsive-menu-trigger">
                <Button
                  type="ghost"
                  icon={<MenuOutlined />}
                  onClick={() => setShowResponsiveMenu(true)}
                />
              </div>
            </div>
          </div>
        </Header>
        <Switch>
          <Route
            profile={profile}
            path="/"
            exact
            render={(props) => (
              <Landing
                {...{
                  setWarningModalVisible,
                  setStakeholderSignupModalVisible,
                  loginWithPopup,
                  isAuthenticated,
                  setFilterMenu,
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
            exact
            path="/knowledge-library"
            render={(props) => (
              <KnowledgeLibrary
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
                  getResults,
                  updateQuery,
                  setFilters,
                  setRelations,
                  setFilterCountries,
                  setMultiCountryCountries,
                  setWarningModalVisible,
                  setStakeholderSignupModalVisible,
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
            render={(props) => <FlexibleForms {...props} />}
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
            render={(props) => <SignupView {...props} formType="stakeholder" />}
          />
          <Route
            path="/signup"
            render={(props) => (
              <LandingSignupView {...props} profile={profile} />
            )}
          />
          <Route
            path="/flexible-forms"
            render={(props) => <FlexibleForms {...props} />}
          />
          <Route
            path="/details-view"
            render={(props) => <NewDetailsView {...props} />}
          />
          <Route
            path="/discourse-forum"
            render={(props) => <DiscourseForum />}
          />
          <Route
            path="/capacity-building"
            render={(props) => <CapacityBuilding {...props} />}
          />
          <Route
            exact
            path="/case-studies"
            render={(props) => <CaseStudies {...props} />}
          />

          <Route
            exact
            render={(props) =>
              isAuthenticated && <Workspace {...props} profile={profile} />
            }
            path="/workspace"
          />

          <Route
            exact
            render={(props) => <EventPage {...props} />}
            path="/events"
          />
          <Route
            exact
            render={(props) => <StakeholderDetail {...props} />}
            path="/stakeholder-detail"
          />
          <Route
            exact
            render={(props) => (
              <StakeholderOverview
                {...props}
                loginWithPopup={loginWithPopup}
                filters={filters}
                setFilters={setFilters}
              />
            )}
            path="/stakeholder-overview"
          />
          <Route
            path="/:type(stakeholder)/:id"
            render={(props) => (
              <StakeholderDetail
                {...props}
                setStakeholderSignupModalVisible={
                  setStakeholderSignupModalVisible
                }
                setFilterMenu={setFilterMenu}
              />
            )}
          />
          <Route
            path="/:type(project|action_plan|policy|technical_resource|financing_resource|technology|event)/:id"
            render={(props) => (
              <NewDetailsView
                {...props}
                setStakeholderSignupModalVisible={
                  setStakeholderSignupModalVisible
                }
                setFilterMenu={setFilterMenu}
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
        />
      </div>
      <ModalWarningUser
        visible={warningModalVisible}
        close={() => setWarningModalVisible(false)}
      />
      <ResponsiveMenu
        {...{
          profile,
          setWarningModalVisible,
          isAuthenticated,
          setStakeholderSignupModalVisible,
          loginWithPopup,
          logout,
          setFilterMenu,
        }}
        showResponsiveMenu={showResponsiveMenu}
        setShowResponsiveMenu={setShowResponsiveMenu}
        topicsCount={topicsCount}
        resources={resourceCounts}
        stakeholderCounts={stakeholderCounts}
      />
    </>
  );
};

const renderDropdownMenu = (
  tags,
  landing,
  profile,
  setWarningModalVisible,
  isAuthenticated,
  setStakeholderSignupModalVisible,
  loginWithPopup
) => {
  const excludeSummary = ["event", "organisation", "stakeholder"];
  const summary =
    landing?.summary &&
    landing.summary
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
      <ExploreDropdownMenu
        topicsCount={tags?.topics ? tags.topics.length : 0}
      />
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

const Search = withRouter(({ history, updateQuery }) => {
  const [search, setSearch] = useState("");
  const [isShownForm, setIsShownForm] = useState(false);

  const handleSearch = (src) => {
    const path = history.location.pathname;
    if (src) {
      setIsShownForm(false);
      history.push(`/knowledge-library?q=${src.trim()}`);
      updateQuery("q", src.trim());
    } else {
      updateQuery("q", src.trim());
    }
    setIsShownForm(!isShownForm);
  };

  return (
    <div className={isShownForm ? "src" : "src toggle-icon"}>
      {!isShownForm ? (
        <Button
          onClick={() => setIsShownForm(!isShownForm)}
          type="primary"
          shape="circle"
          size="small"
          icon={<SearchOutlined />}
        />
      ) : (
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
          onSubmit={(e) => setSearch(e.target.value)}
        />
      )}
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
              history.push(`/${isRegistered(profile) ? "profile" : "signup"}`);
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
          <>
            {!profile?.org && (
              <JoinGPMLButton loginWithPopup={loginWithPopup} />
            )}
            <Link to="/flexible-forms">
              <Button type="primary" placement="bottomRight">
                Add Content
              </Button>
            </Link>
          </>
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
      <Button
        type="primary"
        onClick={() => loginWithPopup({ action: "login" })}
      >
        Add Content
      </Button>
    );
  }
);

export default Root;
