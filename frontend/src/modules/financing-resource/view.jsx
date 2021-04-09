import React, { useEffect } from "react";
import { Row, Col, Card } from "antd";
import "./styles.scss";
import AddResourceForm from "./form";

const AddFinancingResource = ({ ...props }) => {
  useEffect(() => {
    props.updateDisclaimer(null);
  }, []);

  return (
    <div id="add-resource">
      <div className="ui container">
        <Row>
          <Col xs={24} lg={11}>
            <h1>Add Financing Resource</h1>
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

export default AddFinancingResource;
