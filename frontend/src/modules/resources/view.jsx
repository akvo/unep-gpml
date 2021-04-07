import React, { useEffect } from "react";
import { Row, Col, Card } from "antd";
import "./styles.scss";
import AddResourceForm from "./form";

const AddResource = ({ ...props }) => {
  useEffect(() => {
    props.updateDisclaimer(null);
  }, []);

  return (
    <div id="add-resource">
      <div className="ui container">
        <Row>
          <Col xs={24} lg={11}>
            <h1>Add resource</h1>
          </Col>
          <Col xs={24} lg={13}>
            <Card>
              <AddResourceForm countries={props.countries} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AddResource;
