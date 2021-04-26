import { UIStore } from "../../store";
import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Card, Button, Switch } from "antd";
import "./styles.scss";
import AddActionPlanForm from "./form";

const AddActionPlan = ({ ...props }) => {
  const btnSubmit = useRef();
  const [sending, setSending] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [disabledBtn, setDisabledBtn] = useState({
    disabled: true,
    type: "default",
  });

  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = null;
    });
  }, [props]);

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
    <div id="add-action-plan">
      <div className="form-info-wrapper">
        <div className="ui container">
          <Row>
            <Col xs={24} lg={11}>
              <div className="form-title">
                <span className="subtitle">Add New</span>
                <span className="title">Action Plan</span>
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
                  disabled={disabledBtn.disabled}
                  loading={sending}
                  type={disabledBtn.type}
                  size="large"
                  onClick={(e) => handleOnClickBtnSubmit(e)}
                >
                  SUBMIT
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <div className="ui container">
        <Row>
          <Col xs={24} lg={11}>
            <h1>Add Action Plan</h1>
          </Col>
          <Col xs={24} lg={13}>
            <Card>
              <AddActionPlanForm
                btnSubmit={btnSubmit}
                sending={sending}
                setSending={setSending}
                highlight={highlight}
                setHighlight={setHighlight}
                setDisabledBtn={setDisabledBtn}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AddActionPlan;
