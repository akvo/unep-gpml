import { Store } from "pullstate";
import { UIStore } from "../../store";
import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Card, Steps, Switch, Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./styles.scss";
import AddInitiativeForm from "./form";
import StickyBox from "react-sticky-box";
import { schema } from "./schema";
import cloneDeep from "lodash/cloneDeep";

const { Step } = Steps;

const tabsData = [
  {
    key: "S1",
    title: "Submitter",
    desc: "",
    steps: [
      {
        group: "S1",
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
        group: "S2_G1",
        key: "S2-p1-general",
        title: "Part 1: General",
        desc: "",
      },
      {
        group: "S2_G2",
        key: "S2-p2-reporting-and-measuring",
        title: "Part 2: Reporting and Measuring",
        desc: "",
      },
      {
        group: "S2_G3",
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
        group: "S3_G1",
        key: "S3-p1-entities-involved",
        title: "Part 1: Entities Involved",
        desc: "",
      },
      {
        group: "S3_G2",
        key: "S3-p2-location-and-coverage",
        title: "Part 2: Location & Coverage",
        desc: "",
      },
      {
        group: "S3_G3",
        key: "S3-p3-initiative-scope-and-target",
        title: "Part 3: Initiative Scope & Target",
        desc: "",
      },
      {
        group: "S3_G4",
        key: "S3-p4-total-stakeholders-engaged",
        title: "Part 4: Total Stakeholders Engaged",
        desc: "",
      },
      {
        group: "S3_G5",
        key: "S3-p5-funding",
        title: "Part 5: Funding",
        desc: "",
      },
      {
        group: "S3_G6",
        key: "S3-p6-duration",
        title: "Part 6: Duration",
        desc: "",
      },
      {
        group: "S3_G7",
        key: "S3-p7-related-resource-and-contact",
        title: "Part 7: Related Resource and Contact",
        desc: "",
      },
    ],
  },
];

export const initialFormData = {
  tabs: ["S1"],
  required: {
    S1: [],
    S2: [],
    S3: [],
  },
  S1: {
    steps: 0,
    required: {},
  },
  S2: {
    steps: 0,
    required: {},
  },
  S3: {
    steps: 0,
    required: {},
  },
};

export const initiativeData = new Store({
  data: initialFormData,
});

const getSchema = (
  { countries, organisations, tags, currencies, regionOptions, meaOptions },
  loading
) => {
  const prop = cloneDeep(schema.properties);
  const orgs = [...organisations];
  // const orgs = [...organisations, { id: -1, name: "Other" }].map((x) => x);
  // organisation options
  prop.S1.properties["S1_G1_1.1"].enum = orgs?.map((it) => it.id);
  prop.S1.properties["S1_G1_1.1"].enumNames = orgs?.map((it) => it.name);
  prop.S3.properties.S3_G1.properties["S3_G1_16"].enum = orgs?.map((it) =>
    String(it.id)
  );
  prop.S3.properties.S3_G1.properties["S3_G1_16"].enumNames = orgs?.map(
    (it) => it.name
  );
  prop.S3.properties.S3_G1.properties["S3_G1_18"].enum = orgs?.map((it) =>
    String(it.id)
  );
  prop.S3.properties.S3_G1.properties["S3_G1_18"].enumNames = orgs?.map(
    (it) => it.name
  );
  prop.S3.properties.S3_G1.properties["S3_G1_20"].enum = orgs?.map((it) =>
    String(it.id)
  );
  prop.S3.properties.S3_G1.properties["S3_G1_20"].enumNames = orgs?.map(
    (it) => it.name
  );
  // MEA options
  prop.S2.properties.S2_G2.properties[
    "S2_G2_7.2"
  ].items.enum = meaOptions?.map((x) => String(x.id));
  prop.S2.properties.S2_G2.properties[
    "S2_G2_7.2"
  ].items.enumNames = meaOptions?.map((x) => x.name);
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
  // geocoverage regional options
  prop.S3.properties.S3_G2.properties["S3_G2_24.1"].enum = regionOptions;
  prop.S3.properties.S3_G2.properties["S3_G2_24.1"].enumNames = regionOptions;
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
  const minHeightContainer = innerHeight * 0.8;
  const minHeightCard = innerHeight * 0.75;
  const { data } = initiativeData.useState();
  const {
    countries,
    organisations,
    tags,
    loading,
    formStep,
  } = UIStore.currentState;
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
    if (formSchema.loading && !loading) {
      setFormSchema(getSchema(UIStore.currentState, false));
    }
  }, [loading, formSchema]);

  const renderSteps = (parentTitle, section, steps) => {
    const totalRequiredFields = data?.required?.[section]?.length || 0;
    if (section !== data.tabs[0]) {
      return (
        <Step
          key={section}
          title={`${parentTitle}`}
          subTitle={`Total Required fields: ${totalRequiredFields}`}
          className={
            totalRequiredFields === 0
              ? "step-section step-section-finish"
              : "step-section"
          }
          status={totalRequiredFields === 0 ? "finish" : "wait"}
        />
      );
    }
    const childs = steps.map(({ group, key, title, desc }) => {
      const requiredFields = data?.[section]?.required?.[group]?.length || 0;
      return (
        <Step
          key={section + key}
          title={`${title}`}
          subTitle={`Required fields: ${requiredFields}`}
          status={requiredFields === 0 ? "finish" : "process"}
        />
      );
    });
    return [
      <Step
        key={section}
        title={`${parentTitle}`}
        subTitle={`Total Required fields: ${totalRequiredFields}`}
        className={
          totalRequiredFields === 0
            ? "step-section step-section-finish"
            : "step-section"
        }
        status={totalRequiredFields === 0 ? "finish" : "process"}
      />,
      ...childs,
    ];
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
      <StickyBox style={{ zIndex: 10 }}>
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
                <div
                  className={`form-meta ${
                    formStep.initiative === 2 ? "submitted" : ""
                  }`}
                >
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
      </StickyBox>
      {loading ? (
        <h2 className="loading">
          <LoadingOutlined spin /> Loading
        </h2>
      ) : (
        <div className="ui container">
          <div className="form-container">
            {formStep.initiative === 1 && (
              <Row
                style={{
                  minHeight: `${minHeightContainer}px`,
                  padding: "20px 10px 20px 16px",
                  backgroundColor: "#fff",
                  borderRadius: "6px",
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
                  {tabsData.map(({ key, title, desc, steps }) => (
                    <Steps
                      key={`steps-section-${key}`}
                      direction="vertical"
                      size="small"
                      current={data[key]?.steps}
                      initial={-1}
                      onChange={(e) => {
                        e === -1
                          ? handleOnTabChange(key)
                          : handleOnStepClick(e, data.tabs[0]);
                      }}
                      className={key === data.tabs[0] ? "current-tabs" : ""}
                    >
                      {renderSteps(title, key, steps)}
                    </Steps>
                  ))}
                </Col>
                <Col xs={24} lg={18}>
                  <Card
                    style={{
                      paddingTop: 0,
                      paddingBottom: "275px",
                      paddingRight: "24px",
                      paddingLeft: "30px",
                      minHeight: `${minHeightCard}px`,
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
            )}
            {formStep.initiative === 2 && (
              <Row>
                <Col span={24}>
                  <Card
                    style={{
                      padding: "30px",
                    }}
                  >
                    <div>
                      <h3>Thank you for adding the Initiative</h3>
                      <p>we'll let you know once an admin has approved it</p>
                    </div>
                  </Card>
                </Col>
              </Row>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddInitiative;
