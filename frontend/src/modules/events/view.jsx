import { UIStore } from "../../store";
import React, { useEffect } from "react";
import { Row, Col, Card } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./styles.scss";
import AddEventForm from "./form";

const AddEvent = ({ ...props }) => {
  const { loading, formEdit, countries } = UIStore.currentState;

  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = null;
    });
  }, [props]);

  return (
    <div id="add-event">
      {loading && !countries.length ? (
        <h2 className="loading">
          <LoadingOutlined spin /> Loading
        </h2>
      ) : (
        <div className="ui container">
          <Row>
            <Col xs={24} lg={12}>
              <h1>{formEdit.event.status === "add" ? "Add" : "Edit"} event</h1>
            </Col>
            <Col xs={24} lg={12}>
              <Card>
                <AddEventForm />
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default AddEvent;
