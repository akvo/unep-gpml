import { UIStore } from "../../store";
import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Card, Button, Switch } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./styles.scss";
import AddTechnologyForm from "./form";

const AddTechnology = ({ ...props }) => {
  const { loading } = UIStore.currentState;
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
    <div id="add-technology">
      <div className="form-info-wrapper">
        <div className="ui container">
          <Row>
            <Col xs={24} lg={11}>
              <div className="form-title">
                <span className="subtitle">Add New</span>
                <span className="title">Technology</span>
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
      {loading ? (
        <h2 className="loading">
          <LoadingOutlined spin /> Loading
        </h2>
      ) : (
        <div className="ui container">
          <Row>
            <Col xs={24} lg={11}>
              <h1>Add Technology</h1>
            </Col>
            <Col xs={24} lg={13}>
              <Card>
                <AddTechnologyForm
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
      )}
    </div>
  );
};

export default AddTechnology;
