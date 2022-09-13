import React from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import CaseStudies from "../case-studies/view";
import KnowledgeLibrary from "../knowledge-library/view";
import CapacityBuilding from "../capacity-building/view";
import LeftSidebar from "../../components/left-sidebar/left-sidebar";
import { ReactComponent as IconLibrary } from "../../images/capacity-building/ic-knowledge-library.svg";
import { ReactComponent as IconLearning } from "../../images/capacity-building/ic-capacity-building.svg";
import { ReactComponent as IconCaseStudies } from "../../images/capacity-building/ic-case-studies.svg";
import KnowledgeLib from "../knowledge-lib/view";

const sidebar = [
  {
    id: 1,
    title: "Library",
    url: "/knowledge/library",
    icon: <IconLibrary />,
  },
  {
    id: 2,
    title: "Learning",
    url: "/knowledge/capacity-development",
    icon: <IconLearning />,
  },
  {
    id: 4,
    title: "Case studies",
    url: "/knowledge/case-studies",
    icon: <IconCaseStudies />,
  },
];

function Knowledge({
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
  setLoginVisible,
}) {
  return (
    <div id="siteWrapper">
      <div id="appWrapper">
        <div id="appInnerWrapper">
          <div id="bodyContent">
            <Switch>
              <Route exact path="/knowledge">
                <Redirect to="/knowledge/library" exact={true} />
              </Route>
              <Route
                path="/knowledge/library"
                render={(props) => (
                  <KnowledgeLib
                    {...{
                      isAuthenticated,
                      setLoginVisible,
                      ...props,
                    }}
                  />
                )}
              />
              <Route
                path="/knowledge/library-old"
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
                      setLoginVisible,
                      ...props,
                    }}
                  />
                )}
              />
              <Route
                path="/knowledge/capacity-development"
                render={(props) => <CapacityBuilding {...props} />}
              />
              <Route
                exact
                path="/knowledge/case-studies"
                render={(props) => <CaseStudies {...props} />}
              />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Knowledge;
