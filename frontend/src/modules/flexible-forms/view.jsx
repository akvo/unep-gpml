import { UIStore } from "../../store";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Row, Col, Select, Button, Switch, Radio, Popover, Steps } from "antd";
import { DownloadOutlined, InfoOutlined } from "@ant-design/icons";
import StickyBox from "react-sticky-box";
import "./styles.scss";
import common from "./common";
import ExampleIcon from "../../images/examples.png";
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
    selectedMainContentType: s.selectedMainContentType,
    currencies: s.currencies,
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
    selectedMainContentType,
    currencies,
  } = storeData;

  const tabsData = tabs;

  const formData = initialFormData.useState();
  const { editId, data } = formData;
  const { status, id } = formEdit.flexible;
  const btnSubmit = useRef();
  const [sending, setSending] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [mainType, setMainType] = useState("initiative");
  const [label, setLabel] = useState("");
  const [subType, setSubType] = useState("");
  const [manageResource, setManageResource] = useState("");
  const [owners, setOwners] = useState([]);
  const [subContentType, setSubContentType] = useState([]);
  const [disabledBtn, setDisabledBtn] = useState({
    disabled: true,
    type: "default",
  });

  const [formSchema, setFormSchema] = useState({
    schema: schema[selectedMainContentType],
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
    setFormSchema({ schema: schema[selectedMainContentType] });
  }, [schema, highlight, selectedMainContentType]);

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

  const handleMainContentType = (e) => {
    setMainType(e.target.value);
    const search = mainContentType.find(
      (element) => element.code === e.target.value
    ).childs;
    setSubContentType(search);
    setLabel(
      mainContentType.find((element) => element.code === e.target.value).name
    );
    setFormSchema({ schema: schema[selectedMainContentType] });
    UIStore.update((event) => {
      event.selectedMainContentType = e.target.value;
    });
  };

  const handleSubContentType = (e) => {
    setSubType(e.target.value);
  };

  const onChangeSubmitter = (e) => {
    setManageResource(e.target.value);
    if (e.target.value === "Yes") {
      setOwners([profile.id]);
    } else {
      setOwners([]);
    }
  };

  const onChangeOwners = (e) => {
    let arr = owners;
    if (!arr.some((r) => e.includes(r))) {
      arr = [...arr, ...e];
    }
    setOwners(arr);
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
                      // disabled={disabledBtn.disabled}
                      loading={sending}
                      type={disabledBtn.type}
                      size="large"
                      onClick={(e) => handleOnClickBtnSubmit(e)}
                    >
                      Submit
                    </Button>
                    <div className="form-title">
                      <span className="title">Add {label} Content</span>
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
                    <p>
                      Once submitted resources go through a review process which
                      is being fine-tuned via consultations to assess content
                      accuracy and quality. The current validation mechanism
                      draft can be found under{" "}
                      <a href="https://wedocs.unep.org/bitstream/handle/20.500.11822/34453/UNEP%20GPML%20Digital%20Platform%20Concept%20for%20User%20and%20Partner%20Consultations%20May%202021.pdf">
                        Annex C of the Concept Document.
                      </a>
                    </p>
                    <p>
                      You can access existing content via the{" "}
                      <a href="https://digital.gpmarinelitter.org/browse?country=&transnational=&topic=project%2Caction_plan%2Cpolicy%2Ctechnical_resource%2Cfinancing_resource%2Cevent%2Ctechnology&tag=&q=&offset=0">
                        Knowledge Exchange Library.
                      </a>
                      Make sure to browse around and leave a review under the
                      resources you enjoy the most!
                    </p>
                    <p>To get started sign up or log in now.</p>
                  </div>
                </Row>
              ) : getTabStepIndex().tabIndex === 1 ? (
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
                    <Radio.Group
                      className="ant-row"
                      onChange={handleMainContentType}
                      value={mainType}
                    >
                      {mainContentType.map((item) => {
                        const img = require(`../../images/${item.code}.svg`)
                          .default;
                        const imgSelected = require(`../../images/${item.code}-selected.svg`)
                          .default;
                        return (
                          <Col
                            className="gutter-row"
                            xs={12}
                            lg={6}
                            key={item.code}
                          >
                            <Radio.Button
                              value="large"
                              className="custom-radio"
                              id={item.code}
                              value={item.code}
                              key={item.code}
                            >
                              <div className="content-circle-wrapper">
                                <div className="content-circle">
                                  <img
                                    src={
                                      mainType === item.code ? imgSelected : img
                                    }
                                    alt={`${item.name} Image`}
                                  />
                                </div>
                                <div className="info-icon-container">
                                  <h2>{item.name}</h2>
                                  <Popover content={item.desc}>
                                    <div className="info-icon-wrapper">
                                      <img src={InfoBlue} />
                                    </div>
                                  </Popover>
                                </div>
                              </div>
                            </Radio.Button>
                          </Col>
                        );
                      })}
                    </Radio.Group>
                  </div>
                  <div className="sub-content">
                    <div className="sub-content-top">
                      <h5>Pick the sub-content type</h5>
                      <span>Optional</span>
                    </div>
                    {subContentType.length > 0 ? (
                      <div className="sub-content-topics">
                        <Radio.Group
                          className="ant-row"
                          onChange={handleSubContentType}
                          value={subType}
                        >
                          {subContentType.map((item, index) => (
                            <Col
                              className="gutter-row"
                              xs={12}
                              lg={6}
                              key={index}
                            >
                              <Radio.Button
                                id={item}
                                value={item.title}
                                key={index}
                              >
                                {item.title}
                                <Popover content={item.des}>
                                  <div className="info-icon-wrapper">
                                    <img src={InfoBlue} />
                                  </div>
                                </Popover>
                              </Radio.Button>
                            </Col>
                          ))}
                        </Radio.Group>
                      </div>
                    ) : (
                      <div className="before-selection">
                        <p>
                          Select a Main Content Type above to see sub-content
                          type options
                        </p>
                      </div>
                    )}
                  </div>
                </Row>
              ) : (
                <Row className="main-content">
                  <FlexibleForm
                    formType={props.formType}
                    btnSubmit={btnSubmit}
                    sending={sending}
                    setSending={setSending}
                    highlight={highlight}
                    setHighlight={setHighlight}
                    formSchema={formSchema}
                    setDisabledBtn={setDisabledBtn}
                    tabsData={tabsData}
                    mainType={label}
                    owners={owners}
                  />
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
