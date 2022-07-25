import React from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import EventPage from "../event-page/view";
import StakeholderOverview from "../stakeholder-overview/view";
import Partners from "../partners/view";
import Experts from "../experts/view";
import LeftSidebar from "../../components/left-sidebar/left-sidebar";
import { ReactComponent as IconEvent } from "../../images/events/event-icon.svg";
import { ReactComponent as IconForum } from "../../images/events/forum-icon.svg";
import { ReactComponent as IconCommunity } from "../../images/events/community-icon.svg";
import { ReactComponent as IconPartner } from "../../images/stakeholder-overview/partner-icon.svg";
import { ReactComponent as ExpertIcon } from "../../images/stakeholder-overview/expert-icon.svg";

const sidebar = [
  { id: 1, title: "Events", url: "/connect/events", icon: <IconEvent /> },
  {
    id: 2,
    title: "Community",
    url: "/connect/community",
    icon: <IconCommunity />,
  },
  { id: 3, title: "Forums", url: null, icon: <IconForum /> },
  {
    id: 4,
    title: "Partners",
    url: "/connect/partners",
    icon: <IconPartner />,
  },
  {
    id: 5,
    title: "Experts",
    url: "/connect/experts",
    icon: <ExpertIcon />,
  },
];

function Connect({ filters, setFilters, isAuthenticated, setLoginVisible }) {
  return (
    <div id="siteWrapper">
      <LeftSidebar sidebar={sidebar} />
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
