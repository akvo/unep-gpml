import React, { useEffect } from "react";
import { Row, Col, Card } from "antd";
import "./styles.scss";
import AddResourceForm from "./form";

const AddTechnicalResource = ({ ...props }) => {
  useEffect(() => {
    props.updateDisclaimer(null);
  }, []);

  return (
    <div id="add-technical-resource">
      <div className="ui container">
        <Row>
          <Col xs={24} lg={11}>
            <h1>Add Technical Resource</h1>
          </Col>
          <Col xs={24} lg={13}>
            <Card>
              <AddResourceForm />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AddTechnicalResource;
