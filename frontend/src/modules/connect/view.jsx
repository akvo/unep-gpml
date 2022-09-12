import React from "react";
import { Redirect, Switch, Route, useHistory } from "react-router-dom";
import EventPage from "../event-page/view";
import StakeholderOverview from "../stakeholder-overview/view";
import Partners from "../partners/view";
import Experts from "../experts/view";

function Connect({
  filters,
  setFilters,
  isAuthenticated,
  setLoginVisible,
  loadingProfile,
}) {
  const history = useHistory();
  return (
    <div id="siteWrapper">
      <div id="appWrapper">
        <div id="appInnerWrapper">
          <div id="bodyContent">
            <Switch>
              <Route exact path="/connect">
                <Redirect to="/connect/events" exact={true} />
              </Route>
              <Route path="/connect/events" component={EventPage} />
              <Route path="/connect/community">
                <StakeholderOverview
                  setLoginVisible={setLoginVisible}
                  filters={filters}
                  setFilters={setFilters}
                  isAuthenticated={isAuthenticated}
                  history={history}
                  loadingProfile={loadingProfile}
                />
              </Route>
              <Route path="/connect/partners" component={Partners} />
              <Route path="/connect/experts">
                <Experts
                  setLoginVisible={setLoginVisible}
                  isAuthenticated={isAuthenticated}
                  loadingProfile={loadingProfile}
                />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Connect;
