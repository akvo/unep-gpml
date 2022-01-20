import React from "react";
import { Row, Col } from "antd";
import "./styles.scss";
import EventCalendar from "../event-calendar/view";
import LeftSidebar from "./leftSidebar";

const EventPage = () => {
  return (
    <div id="events">
      <Row type="flex" className="body-wrapper">
        <LeftSidebar />
        <Col lg={22} xs={24} order={2}>
          <EventCalendar />
        </Col>
      </Row>
    </div>
  );
};

export default EventPage;
