import React from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import EventPage from "../event-page/view";
import StakeholderOverview from "../stakeholder-overview/view";
import Partners from "../partners/view";
import Experts from "../experts/view";
import LeftSidebar from "../../components/left-sidebar/left-sidebar";

function Connect({ filters, setFilters, isAuthenticated, setLoginVisible }) {
  return (
    <div id="siteWrapper">
      <LeftSidebar />
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
                />
              </Route>
              <Route path="/connect/partners" component={Partners} />
              <Route path="/connect/experts" component={Experts} />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Connect;
