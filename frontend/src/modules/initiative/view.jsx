import { Store } from "pullstate";
import { UIStore } from "../../store";
import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Card, Menu, Steps, Tabs, Switch, Button } from "antd";
import "./styles.scss";
import AddInitiativeForm from "./form";

const { Step } = Steps;
const { TabPane } = Tabs;

const tabs = [
  {
    key: "S1",
    title: "Submitter",
    desc: "",
    steps: [
      {
        key: "S1-p1-personal-information",
        title: "Personal Information",
        desc: "",
      },
    ],
  },
  {
    key: "S2",
    title: "Type of Initiative",
    desc: "",
    steps: [
      {
        key: "S2-p1-general",
        title: "Part 1: General",
        desc: "",
      },
      {
        key: "S2-p2-reporting-and-measuring",
        title: "Part 2: Reporting and Measuring",
        desc: "",
      },
      {
        key: "S2-p3-drivers-and-barriers",
        title: "Part 3: Drivers and Barriers",
        desc: "",
      },
    ],
  },
  {
    key: "S3",
    title: "Initiative Details",
    desc: "",
    steps: [
      {
        key: "S3-p1-entities-involved",
        title: "Part 1: Entities Involved",
        desc: "",
      },
      {
        key: "S3-p2-location-and-coverage",
        title: "Part 2: Location & Coverage",
        desc: "",
      },
      {
        key: "S3-p3-initiative-scope-and-target",
        title: "Part 3: Initiative Scope & Target",
        desc: "",
      },
      {
        key: "S3-p4-total-stakeholders-engaged",
        title: "Part 4: Total Stakeholders Engaged",
        desc: "",
      },
      {
        key: "S3-p5-funding",
        title: "Part 5: Funding",
        desc: "",
      },
      {
        key: "S3-p6-duration",
        title: "Part 6: Duration",
        desc: "",
      },
      {
        key: "S3-p7-related-resource-and-contact",
        title: "Part 7: Related Resource and Contact",
        desc: "",
      },
    ],
  },
];

export const initiativeData = new Store({
  data: {
    tabs: ["S1"],
    steps: {
      S1: 0,
      S2: 0,
      S3: 0,
    },
  },
});

const AddInitiative = ({ ...props }) => {
  const { data } = initiativeData.useState();
  const btnSubmit = useRef();
  const [sending, setSending] = useState(false);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    props.updateDisclaimer(null);
  }, []);

  const renderSteps = (steps) => {
    if (steps.length === 0) return;
    return steps.map(({ key, title, desc }) => (
      <Step title={title} description={desc} />
    ));
  };

  const handleOnTabChange = (key) => {
    initiativeData.update((e) => {
      e.data = {
        ...e.data,
        tabs: [key],
      };
    });
  };

  const handleOnStepClick = (current, section) => {
    const id = `initiative_${section}_${section}_G${current + 1}`;
    // window.location.hash = `#${id}`;
    initiativeData.update((e) => {
      e.data = {
        ...e.data,
        steps: {
          ...e.data.steps,
          [section]: current,
        },
      };
    });
  };

  return (
    <div id="add-initiative">
      <div className="form-info-wrapper">
        <div className="ui container">
          <Row>
            <Col xs={24} lg={14}>
              <div className="form-title-wrapper">
                <div className="form-title">
                  <span className="subtitle">Add New</span>
                  <span className="title">Initiative</span>
                </div>
                <div className="initiative-title">
                  {data?.S2?.S2_G1?.S2_G1_2
                    ? data?.S2?.S2_G1?.S2_G1_2
                    : "Untitled Initiative"}
                </div>
              </div>
            </Col>
            <Col xs={24} lg={10}>
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
        <div className="form-container">
          <Tabs
            type="card"
            activeKey={data.tabs[0]}
            onChange={(e) => handleOnTabChange(e)}
          >
            {tabs.map(({ key, title, desc, steps }) => (
              <TabPane tab={title} key={key}>
                <Row>
                  <Col xs={4} lg={8}>
                    <Steps
                      direction="vertical"
                      size="small"
                      current={data.steps[key]}
                      onChange={(e) => handleOnStepClick(e, key)}
                    >
                      {renderSteps(steps)}
                    </Steps>
                  </Col>
                  <Col xs={20} lg={16}>
                    <Card>
                      <AddInitiativeForm
                        btnSubmit={btnSubmit}
                        sending={sending}
                        setSending={setSending}
                        highlight={highlight}
                        setHighlight={setHighlight}
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AddInitiative;
