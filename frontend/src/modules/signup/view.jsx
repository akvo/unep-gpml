import { UIStore } from "../../store";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Checkbox, Row, Col, Card, Steps, Switch, Button } from "antd";
import {
  CheckOutlined,
  EditOutlined,
  LoadingOutlined,
  RightOutlined,
} from "@ant-design/icons";
import "./styles.scss";
import SignUpForm from "./form";
import StickyBox from "react-sticky-box";
import { schema } from "./schema";
import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import xor from "lodash/xor";
import api from "../../utils/api";
import entity from "./entity";
import stakeholder from "./stakeholder";

const { Step } = Steps;

const SignUp = ({ match: { params }, ...props }) => {
  console.log(props.formType);
  const { tabs, getSchema, initialSignUpData, signUpData, loadTabs } =
    props.formType === "entity" ? entity : stakeholder;

  const minHeightContainer = innerHeight * 0.8;
  const minHeightCard = innerHeight * 0.75;

  const storeData = UIStore.useState((s) => ({
    stakeholders: s.stakeholders?.stakeholders,
    countries: s.countries,
    tags: s.tags,
    regionOptions: s.regionOptions,
    sectorOptions: s.sectorOptions,
    organisationType: s.organisationType,
    meaOptions: s.meaOptions,
    profile: s.profile,
    formStep: s.formStep,
    formEdit: s.formEdit,
  }));

  const {
    stakeholders,
    countries,
    tags,
    regionOptions,
    sectorOptions,
    organisationType,
    meaOptions,
    formStep,
    formEdit,
    profile,
  } = storeData;

  const formData = signUpData.useState();
  const { editId, data } = formData;
  const { status, id } = formEdit.signUp;

  const tabsData = tabs;
  const [formSchema, setFormSchema] = useState({
    schema: schema,
  });
  const btnSubmit = useRef();
  const [sending, setSending] = useState(false);
  const [representEntity, setRepresentEntity] = useState(
    props.formType === "entity" ? true : false
  );
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
    setFormSchema({ schema: schema });
  }, [highlight]);

  const isLoaded = useCallback(() => {
    return Boolean(
      !isEmpty(countries) &&
        !isEmpty(tags) &&
        !isEmpty(profile) &&
        !isEmpty(regionOptions) &&
        !isEmpty(sectorOptions) &&
        !isEmpty(organisationType) &&
        !isEmpty(meaOptions) &&
        !isEmpty(stakeholders)
    );
  }, [
    countries,
    tags,
    profile,
    regionOptions,
    sectorOptions,
    organisationType,
    meaOptions,
    stakeholders,
  ]);

  useEffect(() => {
    const dataId = Number(params?.id || id);
    if (isLoaded()) {
      setFormSchema(getSchema(storeData));
      // Manage form status, add/edit
      if (
        (status === "edit" || dataId) &&
        // data.S1 has the same keys as initialSignUpData.S1?
        (xor(Object.keys(data?.S1), Object.keys(initialSignUpData?.S1))
          .length === 0 ||
          editId !== dataId)
      ) {
        api.getRaw(`/signup/${dataId}`).then((d) => {
          // signUpData.update((e) => {
          //   e.data = revertFormData(initialSignUpData)(JSON.parse(d.data));
          //   e.editId = dataId;
          // });
        });
      }
    }
    // Manage form status, add/edit
    if (status === "add" && !dataId && editId !== null) {
      signUpData.update((e) => {
        e.data = initialSignUpData;
        e.editId = null;
      });
    }
  }, [storeData, status, id, data, editId, params, isLoaded]);

  const renderSteps = (parentTitle, section, steps, index) => {
    const totalRequiredFields = data?.required?.[section]?.length || 0;
    const customTitle = (status) => {
      const color = totalRequiredFields === 0 ? "#4DFFA5" : "#fff";
      const display =
        status === "active"
          ? "unset"
          : totalRequiredFields === 0
          ? "unset"
          : "none";
      return (
        <div className="custom-step-title">
          <span>{parentTitle}</span>
          <Button
            type="ghost"
            size="small"
            shape="circle"
            icon={
              totalRequiredFields === 0 ? <CheckOutlined /> : <EditOutlined />
            }
            style={{
              right: "0",
              position: "absolute",
              color: color,
              borderColor: color,
              display: display,
            }}
          />
        </div>
      );
    };
    const customIcon = (status) => {
      index += 1;
      const opacity = status === "active" ? 1 : 0.5;
      return (
        <Button
          className="custom-step-icon"
          shape="circle"
          style={{
            color: "#255B87",
            fontWeight: "600",
            opacity: opacity,
          }}
        >
          {index}
        </Button>
      );
    };
    if (section !== data.tabs[0]) {
      return (
        <Step
          key={section}
          title={customTitle("waiting")}
          subTitle={`Total Required fields: ${totalRequiredFields}`}
          className={
            totalRequiredFields === 0
              ? "step-section step-section-finish"
              : "step-section"
          }
          status={totalRequiredFields === 0 ? "finish" : "wait"}
          icon={customIcon("waiting")}
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
        title={customTitle("active")}
        subTitle={`Total Required fields: ${totalRequiredFields}`}
        className={
          totalRequiredFields === 0
            ? "step-section step-section-finish"
            : "step-section"
        }
        status={totalRequiredFields === 0 ? "finish" : "process"}
        icon={customIcon("active")}
      />,
      ...childs,
    ];
  };

  const handleOnTabChange = (key) => {
    const tabActive = tabsData.filter((x) => x.key === key);
    signUpData.update((e) => {
      e.data = {
        ...e.data,
        tabs: [key],
        steps: tabActive[0].steps,
      };
    });
  };

  const handleOnStepClick = (current, section) => {
    signUpData.update((e) => {
      e.data = {
        ...e.data,
        [section]: {
          ...e.data[section],
          steps: current,
        },
      };
    });
  };

  const getTabStepIndex = () => {
    const section = data.tabs[0];
    const stepIndex = data[section].steps;
    const tabIndex = tabsData.findIndex((tab) => tab.key === section);
    const steps = tabsData[tabIndex]?.steps || [];
    return { tabIndex, stepIndex, steps };
  };

  const isLastStep = () => {
    const { tabIndex, stepIndex, steps } = getTabStepIndex();
    return tabsData.length === tabIndex + 1 && steps.length === stepIndex + 1;
  };

  const handleOnClickBtnNext = (e) => {
    const { tabIndex, stepIndex, steps } = getTabStepIndex();
    if (stepIndex < steps.length - 1) {
      // Next step, same section
      handleOnStepClick(stepIndex + 1, tabsData[tabIndex].key);
    } else if (tabIndex < tabsData.length - 1) {
      // Next section, first step
      handleOnTabChange(tabsData[tabIndex + 1].key);
    } else {
      // We shouldn't get here, since the button should be hidden
      console.error("Last step:", tabIndex, stepIndex);
    }
  };

  const handleOnClickBtnSubmit = (e) => {
    setHighlight(true);
    btnSubmit.current.click();
  };

  return (
    <div id="add-sign-up">
      <StickyBox style={{ zIndex: 10 }}>
        <div className="form-info-wrapper">
          <div className="ui container">
            <Row>
              <Col xs={24} lg={24}>
                <div
                  className={`form-meta ${
                    formStep.signUp === 2 ? "submitted" : ""
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
                  {formStep.signUp === 1 && (
                    <Button
                      disabled={disabledBtn.disabled}
                      loading={!isLoaded()}
                      type={disabledBtn.type}
                      size="large"
                      onClick={(e) => handleOnClickBtnSubmit(e)}
                    >
                      SUBMIT
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </StickyBox>
      {!isLoaded() ? (
        <h2 className="loading">
          <LoadingOutlined spin /> Loading
        </h2>
      ) : (
        <div className="ui container">
          <div className="form-container">
            {formStep.signUp === 1 && (
              <Row
                style={{
                  minHeight: `${minHeightContainer}px`,
                  backgroundColor: "#fff",
                  borderRadius: "18px",
                }}
              >
                <Col
                  xs={24}
                  lg={6}
                  style={{
                    borderRight: "1px solid #D3DBDF",
                    minHeight: "100%",
                    background: "#2D6796",
                    borderRadius: "15px 0px 0px 15px",
                  }}
                >
                  {tabsData.map(({ key, title, desc, steps }, i) => (
                    <>
                      <hr className="step-line" />
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
                        {renderSteps(title, key, steps, i)}
                      </Steps>
                    </>
                  ))}
                </Col>
                <Col
                  xs={24}
                  lg={18}
                  style={{
                    padding: "20px 10px 20px 16px",
                  }}
                >
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
                    <SignUpForm
                      formType={props.formType}
                      btnSubmit={btnSubmit}
                      representEntity={representEntity}
                      sending={sending}
                      setSending={setSending}
                      highlight={highlight}
                      setHighlight={setHighlight}
                      formSchema={formSchema}
                      setDisabledBtn={setDisabledBtn}
                    />
                    {!isLastStep() && representEntity && (
                      <Button
                        className="next-button"
                        type="ghost"
                        onClick={(e) => handleOnClickBtnNext(e)}
                      >
                        Next <RightOutlined />
                      </Button>
                    )}
                  </Card>
                </Col>
              </Row>
            )}
            {formStep.signUp === 2 && (
              <Row>
                <Col span={24}>
                  <Card
                    style={{
                      padding: "30px",
                    }}
                  >
                    <div>
                      <h3>Thank you for signing up!</h3>
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

export default SignUp;
