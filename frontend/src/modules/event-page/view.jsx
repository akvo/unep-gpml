import React from "react";
import { Row, Col } from "antd";
import "./styles.scss";
import EventCalendar from "../reusable-components/event-calendar/view";
import LeftSidebar from "../reusable-components/left-sidebar/LeftSidebar";
// Icons
import { ReactComponent as IconEvent } from "../../images/events/event-icon.svg";
import { ReactComponent as IconForum } from "../../images/events/forum-icon.svg";
import { ReactComponent as IconCommunity } from "../../images/events/community-icon.svg";

const EventPage = () => {
  const sidebar = [
    { id: 1, title: "Events", url: "/events", icon: <IconEvent /> },
    {
      id: 2,
      title: "Community",
      url: "/stakeholder-overview",
      icon: <IconCommunity />,
    },
    { id: 3, title: "Forums", url: null, icon: <IconForum /> },
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
