import React from "react";
import { Row, Col } from "antd";
import "./styles.scss";
import EventCalendar from "../../components/event-calendar/view";

const EventPage = () => {
  return (
    <div id="events">
      <Row type="flex" className="body-wrapper">
        <Col lg={24} xs={24} order={2}>
          <EventCalendar />
        </Col>
      </Row>
    </div>
  );
};

export default EventPage;
