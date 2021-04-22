import { UIStore } from "../../store";
import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Card, Button, Switch } from "antd";
import "./styles.scss";
import AddResourceForm from "./form";

const AddFinancingResource = ({ ...props }) => {
  const btnSubmit = useRef();
  const [sending, setSending] = useState(false);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    props.updateDisclaimer(null);
  });

  useEffect(() => {
    UIStore.update((e) => {
      e.highlight = highlight;
    });
  }, [highlight]);

  const handleOnClickBtnSubmit = (e) => {
    setHighlight(true);
    btnSubmit.current.click();
  };

  return (
    <div id="add-resource">
      <div className="form-info-wrapper">
        <div className="ui container">
          <Row>
            <Col xs={24} lg={11}>
              <div className="form-title">
                <span className="subtitle">Add New</span>
                <span className="title">Financing Resource</span>
              </div>
            </Col>
            <Col xs={24} lg={13}>
              <div className="form-meta">
                <div className="highlight">
                  <Switch
                    checked={highlight}
                    size="small"
                    onChange={(status) => setHighlight(status)}
                  />{" "}
                  {highlight
                    ? "Required fields highlighted"
                    : "Highlight required"}
                </div>
                <Button
                  loading={sending}
                  type="primary"
                  size="large"
                  onClick={(e) => handleOnClickBtnSubmit(e)}
                >
                  Submit
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <div className="ui container">
        <Row>
          <Col xs={24} lg={11}>
            <h1>Add Financing Resource</h1>
          </Col>
          <Col xs={24} lg={13}>
            <Card>
              <AddResourceForm
                btnSubmit={btnSubmit}
                sending={sending}
                setSending={setSending}
                highlight={highlight}
                setHighlight={setHighlight}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AddFinancingResource;
