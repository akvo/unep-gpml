import { UIStore } from "../../store";
import React, { useEffect } from "react";
import { Row, Col, Card } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./styles.scss";
import AddEventForm from "./form";
import isEmpty from "lodash/isEmpty";

const AddEvent = ({ ...props }) => {
  const {
    countries,
    tags,
    regionOptions,
    meaOptions,
    formEdit,
  } = UIStore.useState((s) => ({
    countries: s.countries,
    tags: s.tags,
    regionOptions: s.regionOptions,
    meaOptions: s.meaOptions,
    formEdit: s.formEdit,
  }));
  const isLoaded = () =>
    Boolean(
      countries.length &&
        !isEmpty(tags) &&
        regionOptions.length &&
        meaOptions.length
    );

  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = null;
    });
  }, [props]);

  return (
    <div id="add-event">
      {!isLoaded() ? (
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
