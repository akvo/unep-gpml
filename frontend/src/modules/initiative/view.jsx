import React, { useEffect } from "react";
import { Row, Col, Card, Menu, Steps, Tabs } from "antd";
import "./styles.scss";
import AddInitiativeForm from "./form";

const { Step } = Steps;
const { TabPane } = Tabs;

const tabs = [
  {
    key: "submitter",
    title: "Submitter",
    desc: "",
    steps: [
      {
        key: "personal-information",
        title: "Personal Information",
        desc: "",
      },
    ],
  },
  {
    key: "type-of-initiative",
    title: "Type of Initiative",
    desc: "",
    steps: [
      {
        key: "general",
        title: "General",
        desc: "",
      },
      {
        key: "reporting-and-measuring",
        title: "Reporting and Measuring",
        desc: "",
      },
      {
        key: "drivers-and-barriers",
        title: "Drivers and Barriers",
        desc: "",
      },
    ],
  },
  {
    key: "initiative-details",
    title: "Initiative Details",
    desc: "",
    steps: [],
  },
];

const AddInitiative = ({ ...props }) => {
  useEffect(() => {
    props.updateDisclaimer(null);
  }, []);

  const renderSteps = (steps) => {
    if (steps.length === 0) return;
    return steps.map(({ key, title, desc }) => (
      <Step title={title} description={desc} />
    ));
  };

  return (
    <div id="add-initiative">
      <div className="ui container">
        <div className="form-container">
          <Tabs type="card">
            {tabs.map(({ key, title, desc, steps }) => (
              <TabPane tab={title} key={key}>
                <Row>
                  <Col xs={4} lg={8}>
                    <Steps
                      direction="vertical"
                      size="small"
                      onChange={(e) => console.log(e)}
                    >
                      {renderSteps(steps)}
                    </Steps>
                  </Col>
                  <Col xs={20} lg={16}>
                    <Card>
                      <AddInitiativeForm countries={props.countries} />
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            ))}
          </Tabs>
        </div>
        {/* <Row className="form-container">
          <Col xs={4} lg={8}>
            <Menu
              defaultSelectedKeys={["submitter"]}
              style={{
                width: "100%",
                color: "#046799",
                fontWeight: "bold",
                backgroundColor: "#fff",
              }}
            >
              <Menu.Item key="submitter" onClick={() => console.log("click")}>
                <Steps direction="vertical" size="small" current={1}>
                  <Step
                    title="Submitter"
                    description="Total Required fields: 1 out of 1 filled in."
                  />
                  <Step
                    title="Personal information"
                    description="Required fields: 0 out of 1 filled in."
                  />
                </Steps>
              </Menu.Item>
              <Menu.Item
                key="type-of-initiative"
                onClick={() => console.log("click")}
              >
                <Steps direction="vertical" size="small">
                  <Step
                    title="Type of Initiative"
                    description="Total Required fields: 1 out of 1 filled in."
                  />
                </Steps>
              </Menu.Item>
              <Menu.Item
                key="initiative-details"
                onClick={() => console.log("click")}
              >
                <Steps direction="vertical" size="small">
                  <Step
                    title="Initiative Details"
                    description="Total Required fields: 1 out of 1 filled in."
                  />
                </Steps>
              </Menu.Item>
            </Menu>
          </Col>
          <Col xs={20} lg={16}>
            <Card>
              <AddInitiativeForm countries={props.countries} />
            </Card>
          </Col>
        </Row> */}
      </div>
    </div>
  );
};

export default AddInitiative;
