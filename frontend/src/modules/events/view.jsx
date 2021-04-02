import React, { useEffect } from "react";
import { Row, Col, Card } from "antd";
import "./styles.scss";
import AddEventForm from "./form";

const AddEvent = ({ ...props }) => {
  useEffect(() => {
    props.updateDisclaimer(null);
  }, [props]);

  return (
    <div id="add-event">
      <div className="ui container">
        <Row>
          <Col xs={24} lg={12}>
            <h1>Add event</h1>
          </Col>
          <Col xs={24} lg={12}>
            <Card>
              <AddEventForm />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AddEvent;
