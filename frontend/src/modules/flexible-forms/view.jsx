import { UIStore } from "../../store";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Row, Col, Card, Button, Switch, Radio, Steps } from "antd";
import { DownloadOutlined, InfoOutlined } from "@ant-design/icons";
import StickyBox from "react-sticky-box";
import "./styles.scss";
import common from "./common";
import ExampleIcon from "../../images/examples.png";
import InitiativeImage from "../../images/initiative.png";
import ActionPlanImage from "../../images/action-plan.png";
import FinancingResourceImage from "../../images/financing-resource.png";
import TechnicalResourceImage from "../../images/technical-resource.png";
import CapacityBuildingImage from "../../images/capacity-building.png";
import InfoGreen from "../../images/i-green.png";
import InfoBlue from "../../images/i-blue.png";
import FlexibleForm from "./form";
import isEmpty from "lodash/isEmpty";

const { Step } = Steps;

const FlexibleForms = ({ match: { params }, ...props }) => {
  const { tabs, getSchema, schema, initialData, initialFormData } = common;

  const storeData = UIStore.useState((s) => ({
    stakeholders: s.stakeholders?.stakeholders,
    countries: s.countries,
    tags: s.tags,
    regionOptions: s.regionOptions,
    transnationalOptions: s.transnationalOptions,
    sectorOptions: s.sectorOptions,
    organisationType: s.organisationType,
    representativeGroup: s.representativeGroup,
    mainContentType: s.mainContentType,
    meaOptions: s.meaOptions,
    nonMemberOrganisations: s.nonMemberOrganisations,
    organisations: s.organisations,
    profile: s.profile,
    formStep: s.formStep,
    formEdit: s.formEdit,
  }));

  const {
    stakeholders,
    countries,
    tags,
    regionOptions,
    transnationalOptions,
    sectorOptions,
    organisationType,
    representativeGroup,
    mainContentType,
    meaOptions,
    nonMemberOrganisations,
    organisations,
    formStep,
    formEdit,
    profile,
  } = storeData;

  const tabsData = tabs;

  const formData = initialFormData.useState();
  const { editId, data } = formData;
  const { status, id } = formEdit.flexible;

  const btnSubmit = useRef();
  const [sending, setSending] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [disabledBtn, setDisabledBtn] = useState({
    disabled: true,
    type: "default",
  });

  const [formSchema, setFormSchema] = useState({
    schema: schema,
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
  }, [schema, highlight]);

  const isLoaded = useCallback(() => {
    return Boolean(
      !isEmpty(countries) &&
        !isEmpty(tags) &&
        !isEmpty(profile) &&
        !isEmpty(regionOptions) &&
        !isEmpty(transnationalOptions) &&
        !isEmpty(organisations) &&
        !isEmpty(sectorOptions) &&
        !isEmpty(organisationType) &&
        !isEmpty(meaOptions) &&
        !isEmpty(stakeholders) &&
        !isEmpty(representativeGroup)
    );
  }, [
    countries,
    tags,
    profile,
    regionOptions,
    transnationalOptions,
    sectorOptions,
    organisations,
    organisationType,
    meaOptions,
    stakeholders,
    representativeGroup,
  ]);

  useEffect(() => {
    if (isLoaded()) {
      setFormSchema(getSchema(storeData));
    }
  }, [
    initialFormData,
    getSchema,
    initialData,
    storeData,
    id,
    data,
    editId,
    params,
    isLoaded,
  ]);

  const renderSteps = (parentTitle, section, steps, index) => {
    const totalRequiredFields = data?.required?.[section]?.length || 0;
    const customTitle = (status) => {
      return (
        <div className="custom-step-title">
          <span>{parentTitle}</span>
        </div>
      );
    };
    const customIcon = () => {
      index += 1;
      return (
        <Button className="custom-step-icon" shape="circle">
          {index}
        </Button>
      );
    };
    if (section !== data.tabs[0]) {
      return (
        <Step
          key={section}
          title={customTitle("waiting")}
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
          className={"child-item"}
          status={requiredFields === 0 ? "finish" : "process"}
        />
      );
    });
    return [
      <Step
        key={section}
        title={customTitle("active")}
        icon={customIcon("active")}
        className={
          totalRequiredFields === 0
            ? "step-section step-section-finish parent-item"
            : "step-section parent-item"
        }
        status={totalRequiredFields === 0 ? "finish" : "process"}
      />,
      ...childs,
    ];
  };

  const handleOnTabChange = (key) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const tabActive = tabsData.filter((x) => x.key === key);
    initialFormData.update((e) => {
      e.data = {
        ...e.data,
        tabs: [key],
        steps: tabActive[0].steps,
      };
    });
  };

  const handleOnStepClick = (current, section) => {
    console.log(current);
    initialFormData.update((e) => {
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
    const { tabIndex } = getTabStepIndex();
    return tabsData.length === tabIndex + 1;
  };

  const isFirstStep = () => {
    const { tabIndex } = getTabStepIndex();
    return tabIndex === 0;
  };

  const handleOnClickBtnNext = (e) => {
    window.scrollTo(0, 0);
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

  const handleOnClickBtnBack = (e) => {
    window.scrollTo(0, 0);
    const { tabIndex, stepIndex, steps } = getTabStepIndex();
    if (stepIndex > 0 && steps.length > 0) {
      // Prev step, same section
      handleOnStepClick(stepIndex - 1, tabsData[tabIndex].key);
    } else if (tabIndex > 0) {
      // Prev section, first step
      handleOnTabChange(tabsData[tabIndex - 1].key);
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
      {/* 
      <StickyBox style={{ zIndex: 9 }} offsetTop={20} offsetBottom={20}> */}
      <div className="ui container">
        <div className="form-container">
          <Row>
            <Col
              className="step-panel"
              xs={24}
              lg={6}
              style={{
                minHeight: "100%",
              }}
            >
              <StickyBox style={{ zIndex: 9 }} offsetTop={60}>
                {tabsData.map(({ key, title, desc, steps }, i) => (
                  <Steps
                    key={`steps-section-${key}`}
                    current={data[key]?.steps}
                    initial={-1}
                    direction="vertical"
                    className={key === data.tabs[0] ? "current-tabs" : ""}
                    onChange={(e) => {
                      e === -1
                        ? handleOnTabChange(key)
                        : handleOnStepClick(e, data.tabs[0]);
                    }}
                  >
                    {renderSteps(title, key, steps, i)}
                  </Steps>
                ))}
              </StickyBox>
            </Col>
            <Col
              className="content-panel"
              xs={24}
              lg={18}
              style={{
                minHeight: "100%",
              }}
            >
              {getTabStepIndex().tabIndex === 0 ? (
                <Row>
                  <div className="getting-started-content main-content">
                    <h5>Welcome to the GPML Digital Platform!</h5>
                    <p>
                      We are excited to hear from the members of our community.
                      The GPML Digital Platform is crowdsourced and allows
                      everyone to submit new content via this form.
                    </p>
                    <p>
                      A wide range of resources can be submitted, and these
                      include Action Plans, Initiatives, Technical resources,
                      Financing resources, Policies, Events, and Technologies.
                      Learn more about each category and sub-categories
                      definitions in the “Content Type” section of this form. A
                      quick summary sheet with categories and sub-categories can
                      be downloaded <a href="#">here</a>.
                    </p>
                  </div>
                </Row>
              ) : (
                <Row className="main-content">
                  <FlexibleForm
                    // formType={props.formType}
                    // btnSubmit={btnSubmit}
                    // sending={sending}
                    // setSending={setSending}
                    // highlight={highlight}
                    // setHighlight={setHighlight}
                    formSchema={formSchema}
                    // setDisabledBtn={setDisabledBtn}
                    tabsData={tabsData}
                  />
                  {/* <div className="main-content">
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
                  <div className="sub-content">
                    <div className="sub-content-top">
                      <h5>Pick the sub-content type</h5>
                      <span>Optional</span>
                    </div>
                    <div className="sub-content-topics">
                      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 16 }}>
                        <Col className="gutter-row" xs={12} lg={6}>
                          <Radio.Button value="large">
                            Capacity building initiatives
                            <div className="info-icon-wrapper">
                              <img src={InfoBlue} />
                            </div>
                          </Radio.Button>
                        </Col>
                        <Col className="gutter-row" xs={12} lg={6}>
                          <Radio.Button value="large" className="selected">
                            Courses and trainings
                            <div className="info-icon-wrapper selected">
                              <img src={InfoGreen} />
                            </div>
                          </Radio.Button>
                        </Col>
                        <Col className="gutter-row" xs={12} lg={6}>
                          <Radio.Button value="large">
                            Educational events
                            <div className="info-icon-wrapper">
                              <img src={InfoBlue} />
                            </div>
                          </Radio.Button>
                        </Col>
                        <Col className="gutter-row" xs={12} lg={6}>
                          <Radio.Button value="large">
                            Tools and toolkits
                            <div className="info-icon-wrapper">
                              <img src={InfoBlue} />
                            </div>
                          </Radio.Button>
                        </Col>
                        <Col className="gutter-row" xs={12} lg={6}>
                          <Radio.Button value="large">
                            Case studies
                            <div className="info-icon-wrapper">
                              <img src={InfoBlue} />
                            </div>
                          </Radio.Button>
                        </Col>
                        <Col className="gutter-row" xs={12} lg={6}>
                          <Radio.Button value="large">
                            Opportunities
                            <div className="info-icon-wrapper">
                              <img src={InfoBlue} />
                            </div>
                          </Radio.Button>
                        </Col>
                        <Col className="gutter-row" xs={12} lg={6}>
                          <Radio.Button value="large">
                            Stakeholders
                            <div className="info-icon-wrapper">
                              <img src={InfoBlue} />
                            </div>
                          </Radio.Button>
                        </Col>
                        <Col className="gutter-row" xs={12} lg={6}>
                          <Radio.Button value="large">
                            Large
                            <div className="info-icon-wrapper">
                              <img src={InfoBlue} />
                            </div>
                          </Radio.Button>
                        </Col>
                      </Row>
                    </div> */}
                  {/* <div className="before-selection">
                      <p>
                        Select a Main Content Type above to see sub-content type
                        options
                      </p>
                    </div> */}
                  {/* </div> */}
                </Row>
              )}
            </Col>
          </Row>
        </div>
      </div>
      {/* </StickyBox> */}
    </div>
  );
};

export default FlexibleForms;
