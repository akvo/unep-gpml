import React from "react";
import { Row, Col } from "antd";
import "./styles.scss";
import EventCalendar from "../../components/event-calendar/view";
import LeftSidebar from "../../components/left-sidebar/left-sidebar";
// Icons
import { ReactComponent as IconEvent } from "../../images/events/event-icon.svg";
import { ReactComponent as IconForum } from "../../images/events/forum-icon.svg";
import { ReactComponent as IconCommunity } from "../../images/events/community-icon.svg";
import { ReactComponent as IconPartner } from "../../images/stakeholder-overview/partner-icon.svg";
import { ReactComponent as ExpertIcon } from "../../images/stakeholder-overview/expert-icon.svg";

const EventPage = () => {
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

  return (
    <div id="events">
      <Row type="flex" className="body-wrapper">
        <LeftSidebar active={1} sidebar={sidebar}>
          <Col lg={24} xs={24} order={2}>
            <EventCalendar />
          </Col>
        </LeftSidebar>
      </Row>
    </div>
  );
};

export default EventPage;
