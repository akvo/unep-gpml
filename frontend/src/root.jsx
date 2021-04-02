import React, { useState, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  withRouter,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Input, Button, Menu, Dropdown } from "antd";
import Landing from "./modules/landing/view";
import Browse from "./modules/browse/view";
import AddEvent from "./modules/events/view";
import logo from "./images/GPML-temporary-logo-horiz.jpg";
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
// import AddResource from "./modules/resources/view";

api.get("/tag").then((resp) => {
  UIStore.update((e) => {
    e.tags = resp.data;
  });
});
api.get("/country").then((resp) => {
  UIStore.update((e) => {
    e.countries = uniqBy(resp.data);
  });
});
api.get("/organisation").then((resp) => {
  UIStore.update((e) => {
    e.organisations = uniqBy(sortBy(resp.data, ["name"]));
  });
});

const disclaimerHome = (
  <>
    The GPML Digital Platform Phase 1 is now live and currently a Beta Version.
    Help us test the platform and let us know what you think at{" "}
    <a style={{ color: "white" }} href="mailto:unep-gpmarinelitter@un.org">
      unep-gpmarinelitter@un.org
    </a>
    . Take part in shaping the platform’s next releases, until its final launch
    scheduled for 2023. Stay tuned!
  </>
);

const disclaimerBrowse = (
  <>
    UNEP shall not be liable for third party content hosted on the platform.
    Contact us if you have any concerns with the content at:{" "}
    <a style={{ color: "white" }} href="mailto:unep-gpmarinelitter@un.org">
      unep-gpmarinelitter@un.org
    </a>
    . Please note that during Beta Testing, content and functionality issues may
    persist.
  </>
);

const Root = () => {
  const {
    isAuthenticated,
    getIdTokenClaims,
    loginWithPopup,
    logout,
    user,
  } = useAuth0();
  const { countries, tags, profile, organisations } = UIStore.currentState;
  const [signupModalVisible, setSignupModalVisible] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [data, setData] = useState(null);
  const [initLandingCount, setInitLandingCount] = useState("project");
  const [disclaimer, setDisclaimer] = useState(null);
  const [filters, setFilters] = useState(null);

  useEffect(() => {
    api.get("/landing").then((resp) => {
      setData(resp.data);
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
  }, [getIdTokenClaims, isAuthenticated]);

  useEffect(() => {
    if (window.location.pathname === "/") setDisclaimer(disclaimerHome);
    else if (window.location.pathname === "/browse")
      setDisclaimer(disclaimerBrowse);
    else if (window.location.pathname === "/browse/")
      setDisclaimer(disclaimerBrowse);
    else setDisclaimer(null);
  }, [disclaimer]);

  const updateDisclaimer = (page) => {
    if (page === "/") setDisclaimer(disclaimerHome);
    if (page === "/browse") setDisclaimer(disclaimerBrowse);
    if (page === null) setDisclaimer(null);
  };

  return (
    <Router>
      <div id="root">
        {disclaimer && (
          <div className="panel-disclaimer">
            <p className="ui container">{disclaimer}</p>
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
                <Link to="/signup">Join the GPML</Link>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <Link to="/" onClick={loginWithPopup}>
                  Sign in
                </Link>
              </div>
            ) : (
              <div className="rightside">
                <Link to="/profile">
                  {profile ? profile.firstName : user.nickname}
                </Link>
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
                  setSignupModalVisible,
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
                initLandingCount,
                setInitLandingCount,
                setWarningModalVisible,
                setSignupModalVisible,
                loginWithPopup,
                isAuthenticated,
                setFilters,
                ...props,
              }}
              updateDisclaimer={updateDisclaimer}
            />
          )}
        />
        <Route
          path="/browse"
          render={(props) => (
            <Browse
              {...props}
              countData={data}
              setSignupModalVisible={setSignupModalVisible}
              updateDisclaimer={updateDisclaimer}
              filters={filters}
              setFilters={setFilters}
            />
          )}
        />
        <Route
          path="/add-event"
          render={(props) => (
            <AddEvent {...props} updateDisclaimer={updateDisclaimer} />
          )}
        />
        {/* <Route
          path="/add-resource"
          render={(props) => (
            <AddResource {...props} updateDisclaimer={updateDisclaimer} />
          )}
        /> */}
        <Route
          path="/profile"
          render={(props) => (
            <ProfileView
              {...{ ...props }}
              updateDisclaimer={updateDisclaimer}
            />
          )}
        />
        <Route
          path="/signup"
          render={(props) => (
            <SignupView {...props} updateDisclaimer={updateDisclaimer} />
          )}
        />
        <Route
          path="/:type/:id"
          render={(props) => (
            <DetailsView
              {...props}
              setSignupModalVisible={setSignupModalVisible}
              updateDisclaimer={updateDisclaimer}
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
            overlay={
              <Menu className="add-dropdown">
                <Menu.Item onClick={() => history.push("/add-event")}>
                  Event
                </Menu.Item>
                {/* <Menu.Item onClick={() => history.push("/add-resource")}>
                  Resource
                </Menu.Item> */}
              </Menu>
            }
            trigger={["click"]}
          >
            <Button type="primary" size="large">
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
              : setSignupModalVisible(true);
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
