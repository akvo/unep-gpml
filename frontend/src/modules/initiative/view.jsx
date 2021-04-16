import { Store } from "pullstate";
import React, { useEffect } from "react";
import { Row, Col, Card, Menu, Steps, Tabs } from "antd";
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
      <div className="ui container">
        <div className="form-container">
          <Tabs type="card" onChange={(e) => handleOnTabChange(e)}>
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
                      <AddInitiativeForm />
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
