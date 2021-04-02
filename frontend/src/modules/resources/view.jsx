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
          <Col span={12}>
            <h1>Add resource</h1>
          </Col>
          <Col span={12}>
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
