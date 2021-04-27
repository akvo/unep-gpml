import { Store } from "pullstate";
import { UIStore } from "../../store";
import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Card, Steps, Tabs, Switch, Button } from "antd";
import "./styles.scss";
import AddInitiativeForm from "./form";
import { schema } from "./schema";
import cloneDeep from "lodash/cloneDeep";

const { Step } = Steps;
const { TabPane } = Tabs;

const tabsData = [
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
    steps: tabsData[0].steps,
    S1: {
      steps: 0,
    },
    S2: {
      steps: 0,
    },
    S3: {
      steps: 0,
    },
  },
});

const getSchema = ({ countries, organisations, tags, currencies }, loading) => {
  const prop = cloneDeep(schema.properties);
  const orgs = [...organisations, { id: -1, name: "Other" }].map((x) => x);
  // TODO:: Load options below
  // [Pop up a full list of SDGs] ? where can get this data? Question S2_G2 number 7.1
  // [in the UI show a list of tags they can choose to add] Question S3_G3 number 32
  // END OF TODO

  // organisation options
  prop.S3.properties.S3_G1.properties["S3_G1_16"].enum = orgs?.map(
    (it) => it.id
  );
  prop.S3.properties.S3_G1.properties["S3_G1_16"].enumNames = orgs?.map(
    (it) => it.name
  );
  prop.S3.properties.S3_G1.properties["S3_G1_18"].enum = orgs?.map(
    (it) => it.id
  );
  prop.S3.properties.S3_G1.properties["S3_G1_18"].enumNames = orgs?.map(
    (it) => it.name
  );
  prop.S3.properties.S3_G1.properties["S3_G1_20"].enum = orgs?.map(
    (it) => it.id
  );
  prop.S3.properties.S3_G1.properties["S3_G1_20"].enumNames = orgs?.map(
    (it) => it.name
  );
  // currency options
  prop.S3.properties.S3_G5.properties["S3_G5_36.1"].enum = currencies?.map(
    (x) => x.value
  );
  prop.S3.properties.S3_G5.properties["S3_G5_36.1"].enumNames = currencies?.map(
    (x) => x.label
  );
  prop.S3.properties.S3_G5.properties["S3_G5_37.1"].enum = currencies?.map(
    (x) => x.value
  );
  prop.S3.properties.S3_G5.properties["S3_G5_37.1"].enumNames = currencies?.map(
    (x) => x.label
  );
  // country options
  prop.S3.properties.S3_G2.properties["S3_G2_23"].enum = countries?.map(
    (x) => x.id
  );
  prop.S3.properties.S3_G2.properties["S3_G2_23"].enumNames = countries?.map(
    (x) => x.name
  );
  // geocoverage national options
  prop.S3.properties.S3_G2.properties["S3_G2_24.2"].enum = countries?.map(
    (x) => x.id
  );
  prop.S3.properties.S3_G2.properties["S3_G2_24.2"].enumNames = countries?.map(
    (x) => x.name
  );
  // geocoverage transnational options
  prop.S3.properties.S3_G2.properties["S3_G2_24.4"].enum = countries?.map((x) =>
    String(x.id)
  );
  prop.S3.properties.S3_G2.properties["S3_G2_24.4"].enumNames = countries?.map(
    (x) => x.name
  );
  return {
    schema: {
      ...schema,
      properties: prop,
    },
    loading: loading,
  };
};

const AddInitiative = ({ ...props }) => {
  const { data } = initiativeData.useState();
  const { countries, organisations, tags } = UIStore.currentState;
  const [formSchema, setFormSchema] = useState({
    schema: schema,
    loading: true,
  });
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
    setFormSchema({ schema: schema, loading: true });
  }, [highlight]);

  useEffect(() => {
    if (
      formSchema.loading &&
      countries.length > 0 &&
      organisations.length > 0
    ) {
      setFormSchema(getSchema(UIStore.currentState, false));
    }
  }, [countries, organisations, tags, formSchema]);

  const renderSteps = (steps) => {
    if (steps.length === 0) return;
    return steps.map(({ key, title, desc }) => (
      <Step key={key} title={title} description={desc} />
    ));
  };

  const handleOnTabChange = (key) => {
    const tabActive = tabsData.filter((x) => x.key === key);
    initiativeData.update((e) => {
      e.data = {
        ...e.data,
        tabs: [key],
        steps: tabActive[0].steps,
      };
    });
  };

  const handleOnStepClick = (current, section) => {
    initiativeData.update((e) => {
      e.data = {
        ...e.data,
        [section]: {
          ...e.data[section],
          steps: current,
        },
      };
    });
  };

  const handleOnClickBtnSubmit = (e) => {
    setHighlight(true);
    btnSubmit.current.click();
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
        <div className="form-container">
          <Tabs
            type="card"
            activeKey={data.tabs[0]}
            onChange={(e) => handleOnTabChange(e)}
          >
            {tabsData.map(({ key, title, desc, steps }) => (
              <TabPane tab={title} key={key} size="large"></TabPane>
            ))}
          </Tabs>
          <Row
            style={{
              minHeight: `${innerHeight * 0.8}px`,
              padding: "20px 10px 20px 16px",
              backgroundColor: "#fff",
              borderRadius: "0 0 6px 6px",
            }}
          >
            <Col
              xs={24}
              lg={6}
              style={{
                borderRight: "1px solid #D3DBDF",
                minHeight: "100%",
              }}
            >
              <Steps
                direction="vertical"
                size="small"
                current={data[data.tabs[0]]?.steps}
                onChange={(e) => handleOnStepClick(e, data.tabs[0])}
              >
                {data?.steps && renderSteps(data.steps)}
              </Steps>
            </Col>
            <Col xs={24} lg={18}>
              <Card
                style={{
                  minHeight: `${innerHeight * 0.75}px`,
                  overflow: "auto",
                }}
              >
                <AddInitiativeForm
                  btnSubmit={btnSubmit}
                  sending={sending}
                  setSending={setSending}
                  highlight={highlight}
                  setHighlight={setHighlight}
                  formSchema={formSchema}
                  setDisabledBtn={setDisabledBtn}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default AddInitiative;
