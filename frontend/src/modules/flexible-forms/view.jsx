import { UIStore } from "../../store";
import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Card, Button, Switch, Radio } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import StickyBox from "react-sticky-box";
import "./styles.scss";
import ExampleIcon from "../../images/examples.png";
import InitiativeImage from "../../images/initiative.png";
import ActionPlanImage from "../../images/action-plan.png";
import FinancingResourceImage from "../../images/financing-resource.png";
import TechnicalResourceImage from "../../images/technical-resource.png";
import CapacityBuildingImage from "../../images/capacity-building.png";

const FlexibleForms = ({ match: { params }, ...props }) => {
  const btnSubmit = useRef();
  const [sending, setSending] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [disabledBtn, setDisabledBtn] = useState({
    disabled: true,
    type: "default",
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

  const style = { background: "#0092ff", padding: "8px 0" };

  return (
    <div id="flexible-forms">
      <StickyBox style={{ zIndex: 10 }}>
        <div className="form-info-wrapper">
          <div className="ui container">
            <Row>
              <Col xs={24} lg={24}>
                <div className={`form-meta `}>
                  <div className="d-flex">
                    <Button className="draft-button" size="large">
                      Save as draft
                    </Button>
                    <Button
                      className="custom-button"
                      disabled={disabledBtn.disabled}
                      loading={sending}
                      type={disabledBtn.type}
                      size="large"
                      onClick={(e) => handleOnClickBtnSubmit(e)}
                    >
                      Submit
                    </Button>
                    <div className="form-title">
                      <span className="title">Add Content</span>
                    </div>
                  </div>
                  <div className="highlight">
                    <Switch
                      checked={highlight}
                      size="small"
                      onChange={(status) => setHighlight(status)}
                    />{" "}
                    {highlight
                      ? "Required fields highlighted"
                      : "Highlight required fields"}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </StickyBox>

      <StickyBox style={{ zIndex: 9 }} offsetTop={20} offsetBottom={20}>
        <div className="ui container">
          <div className="form-container">
            <Row>
              <Col
                className="step-panel"
                xs={24}
                lg={6}
                style={{
                  minHeight: "100%",
                  padding: "13px 0",
                }}
              >
                Left Panel
              </Col>
              <Col
                className="content-panel"
                xs={24}
                lg={18}
                style={{
                  minHeight: "100%",
                  padding: "13px 10px",
                }}
              >
                <Row>
                  <div className="main-content">
                    <div className="button-wrapper">
                      <h5>Pick the main content type</h5>
                      <Button
                        icon={<img src={ExampleIcon} alt="Example button" />}
                        size="large"
                      >
                        SHOW EXAMPLES
                      </Button>
                    </div>
                    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                      <Col className="gutter-row" xs={12} lg={6}>
                        <div className="content-circle-wrapper">
                          <div className="content-circle">
                            <img src={InitiativeImage} alt="Initiative Image" />
                          </div>
                          <h2>initiative</h2>
                        </div>
                      </Col>
                      <Col className="gutter-row" xs={12} lg={6}>
                        <div className="content-circle-wrapper">
                          <div className="content-circle">
                            <img
                              src={ActionPlanImage}
                              alt="Action Plan Image"
                            />
                          </div>
                          <h2>Action plan</h2>
                        </div>
                      </Col>
                      <Col className="gutter-row" xs={12} lg={6}>
                        <div className="content-circle-wrapper">
                          <div className="content-circle">
                            <img
                              src={FinancingResourceImage}
                              alt="Financing Resource Image"
                            />
                          </div>
                          <h2>Policy</h2>
                        </div>
                      </Col>
                      <Col className="gutter-row" xs={12} lg={6}>
                        <div className="content-circle-wrapper">
                          <div className="content-circle">
                            <img
                              src={FinancingResourceImage}
                              alt="Financing Resource Image"
                            />
                          </div>
                          <h2>Financing resource</h2>
                        </div>
                      </Col>
                      <Col className="gutter-row" xs={12} lg={6}>
                        <div className="content-circle-wrapper selected">
                          <div className="content-circle">
                            <img
                              src={TechnicalResourceImage}
                              alt="Technical Resource Image"
                            />
                          </div>
                          <h2>Technical Resource</h2>
                        </div>
                      </Col>
                      <Col className="gutter-row" xs={12} lg={6}>
                        <div className="content-circle-wrapper">
                          <div className="content-circle">
                            <img
                              src={CapacityBuildingImage}
                              alt="Capacity Building Image"
                            />
                          </div>
                          <h2>Event</h2>
                        </div>
                      </Col>
                      <Col className="gutter-row" xs={12} lg={6}>
                        <div className="content-circle-wrapper">
                          <div className="content-circle">
                            <img
                              src={CapacityBuildingImage}
                              alt="Capacity Building Image"
                            />
                          </div>
                          <h2>Technology</h2>
                        </div>
                      </Col>
                      <Col className="gutter-row" xs={12} lg={6}>
                        <div className="content-circle-wrapper">
                          <div className="content-circle">
                            <img
                              src={CapacityBuildingImage}
                              alt="Capacity Building Image"
                            />
                          </div>
                          <h2>Capacity Building</h2>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Row>
                <Row>
                  <div className="sub-content">test</div>
                </Row>
              </Col>
            </Row>
          </div>
        </div>
      </StickyBox>
    </div>
  );
};

export default FlexibleForms;
