import { UIStore } from "../../store";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { List, Row, Col, Card, Steps, Switch, Button } from "antd";
import {
  CheckOutlined,
  EditOutlined,
  LeftOutlined,
  LoadingOutlined,
  RightOutlined,
} from "@ant-design/icons";
import "./styles.scss";
import SignUpForm from "./form";
import StickyBox from "react-sticky-box";

import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import xor from "lodash/xor";
import api from "../../utils/api";
import entity from "./entity";
import stakeholder from "./stakeholder";

const { Step } = Steps;

const SignUp = ({ match: { params }, ...props }) => {
  const isEntityType = props.formType === "entity" ? true : false;
  const isStakeholderType = !isEntityType;
  const {
    tabs,
    getSchema,
    schema,
    initialSignUpData,
    signUpData,
    loadTabs,
  } = isEntityType ? entity : stakeholder;

  const minHeightContainer = innerHeight * 0.8;
  const minHeightCard = innerHeight * 0.75;

  const storeData = UIStore.useState((s) => ({
    stakeholders: s.stakeholders?.stakeholders,
    countries: s.countries,
    tags: s.tags,
    entitySuggestedTags: s.entitySuggestedTags,
    regionOptions: s.regionOptions,
    transnationalOptions: s.transnationalOptions,
    sectorOptions: s.sectorOptions,
    organisationType: s.organisationType,
    representativeGroup: s.representativeGroup,
    meaOptions: s.meaOptions,
    nonMemberOrganisations: s.nonMemberOrganisations,
    organisations: s.organisations,
    profile: s.profile,
    formStep: s.formStep,
    formEdit: s.formEdit,
    stakeholderSuggestedTags: s.stakeholderSuggestedTags,
  }));

  const {
    stakeholders,
    countries,
    tags,
    entitySuggestedTags,
    regionOptions,
    transnationalOptions,
    sectorOptions,
    organisationType,
    representativeGroup,
    meaOptions,
    nonMemberOrganisations,
    organisations,
    formStep,
    formEdit,
    profile,
    stakeholderSuggestedTags,
  } = storeData;

  const formData = signUpData.useState();
  const { editId, data } = formData;
  const { status, id } = formEdit.signUp;

  // hide personal details when user already registered
  const hasProfile = profile?.reviewStatus;
  const hideEntityPersonalDetail = hasProfile && isEntityType;
  hideEntityPersonalDetail &&
    schema?.properties?.["S2"] &&
    delete schema?.properties?.["S2"];
  const tabsData = hideEntityPersonalDetail
    ? tabs.filter((x) => x?.key !== "S2")
    : tabs;
  const [formSchema, setFormSchema] = useState({
    schema: schema,
  });

  const btnSubmit = useRef();
  const [sending, setSending] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [disabledBtn, setDisabledBtn] = useState({
    disabled: true,
    type: "default",
  });

  // force required authorizeSubmission for entity before fill next step
  const isAuthorizeSubmission = isEntityType
    ? formData?.data?.S1?.authorizeSubmission
    : true;

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
    return Boolean(!isEmpty(profile));
  }, [profile]);

  useEffect(() => {
    const dataId = Number(params?.id || id);
    if (isLoaded()) {
      setFormSchema(getSchema(storeData, hideEntityPersonalDetail));
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
  }, [
    initialSignUpData,
    getSchema,
    signUpData,
    storeData,
    status,
    id,
    data,
    editId,
    params,
    isLoaded,
    hideEntityPersonalDetail,
  ]);

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
          disabled={!isAuthorizeSubmission}
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
          disabled={!isAuthorizeSubmission}
          key={section + key}
          title={`${title}`}
          subTitle={`Required fields: ${requiredFields}`}
          status={requiredFields === 0 ? "finish" : "process"}
        />
      );
    });
    return [
      <Step
        disabled={!isAuthorizeSubmission}
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

  const selectTags = (tag) => {
    let array =
      Object.values(tags)
        .flat()
        .find((o) => o.tag === tag.toLowerCase())?.id || tag.toLowerCase();

    signUpData.update((e) => {
      e.data = {
        ...e.data,
        S4: {
          ...e.data.S4,
          orgExpertise: [
            ...(e.data.S4.orgExpertise ? e.data.S4.orgExpertise : []),
            array,
          ],
        },
      };
    });
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
                      loading={sending}
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
        <StickyBox style={{ zIndex: 9 }} offsetTop={20} offsetBottom={20}>
          <div className="ui container">
            <div className="form-container">
              {formStep.signUp === 1 && (
                <Row
                  style={{
                    minHeight: `${minHeightContainer}px`,
                    borderRadius: "18px",
                  }}
                >
                  <Col
                    xs={24}
                    lg={6}
                    style={{
                      minHeight: "100%",
                      background: "rgba(3, 155, 120, 0.4)",
                      borderRadius: "15px 0 0 15px",
                      padding: "13px 0",
                    }}
                  >
                    <StickyBox style={{ zIndex: 9 }} offsetTop={100}>
                      {tabsData.map(({ key, title, desc, steps }, i) => (
                        <>
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
                            className={
                              key === data.tabs[0] ? "current-tabs" : ""
                            }
                          >
                            {renderSteps(title, key, steps, i)}
                          </Steps>
                          <hr className="step-line" />
                        </>
                      ))}
                    </StickyBox>
                  </Col>

                  <Col
                    xs={24}
                    lg={18}
                    style={{
                      padding: "20px 10px 20px 16px",
                      backgroundColor: "#fff",
                      borderRadius: "0 15px 15px 0",
                    }}
                  >
                    <Card
                      style={{
                        paddingTop: 0,
                        paddingBottom: "100px",
                        paddingRight: "24px",
                        paddingLeft: "30px",
                        minHeight: `${minHeightCard}px`,
                      }}
                    >
                      {getTabStepIndex().tabIndex === 0 && isEntityType ? (
                        <Row className="entity-getting-started-heading">
                          <div>
                            This is the application for of an Entity becoming a
                            Member of the GPML, the person submitting the
                            information is identifying themselves as Entity
                            Focal Points.
                          </div>
                          <div>
                            Membership applications are reviewed by the GPML
                            Secreteriat on a weekly basis and confirmation will
                            be communicated via email.
                          </div>
                          <div>
                            More information on Entity Focal Points rights can
                            be found{" "}
                            <a
                              href="https://wedocs.unep.org/bitstream/handle/20.500.11822/36688/Phase%20II%20Focal%20Point%20Roles%2031-08-2021%20-%20Copy.pdf?sequence=1&isAllowed=y"
                              target="_blank"
                              rel="noreferrer"
                            >
                              here
                            </a>
                            .
                          </div>
                        </Row>
                      ) : (
                        <span></span>
                      )}
                      <SignUpForm
                        isEntityType={isEntityType}
                        isStakeholderType={isStakeholderType}
                        formType={props.formType}
                        btnSubmit={btnSubmit}
                        sending={sending}
                        setSending={setSending}
                        highlight={highlight}
                        setHighlight={setHighlight}
                        formSchema={formSchema}
                        setDisabledBtn={setDisabledBtn}
                        hideEntityPersonalDetail={hideEntityPersonalDetail}
                        tabsData={tabsData}
                      />
                      {((getTabStepIndex().tabIndex === 2 &&
                        isEntityType &&
                        hasProfile) ||
                        (getTabStepIndex().tabIndex === 3 && !hasProfile)) && (
                        <div className="list tag-list">
                          <h5>Suggested tags</h5>
                          <List itemLayout="horizontal">
                            <List.Item>
                              <List.Item.Meta
                                title={
                                  <ul>
                                    {entitySuggestedTags.map((tag) => (
                                      <li
                                        key={tag}
                                        onClick={() => selectTags(tag)}
                                      >
                                        {tag}
                                      </li>
                                    ))}
                                  </ul>
                                }
                              />
                            </List.Item>
                          </List>
                        </div>
                      )}
                      <div className="button-row">
                        {!isFirstStep() && (
                          <Button
                            className="back-button"
                            type="ghost"
                            onClick={(e) => handleOnClickBtnBack(e)}
                          >
                            <LeftOutlined /> Back
                          </Button>
                        )}
                        {!isLastStep() && isAuthorizeSubmission && (
                          <Button
                            className="next-button"
                            type="primary"
                            onClick={(e) => handleOnClickBtnNext(e)}
                          >
                            Next <RightOutlined />
                          </Button>
                        )}
                        {isLastStep() && (
                          <Button
                            disabled={disabledBtn.disabled}
                            loading={!isLoaded()}
                            type={disabledBtn.type}
                            onClick={(e) => handleOnClickBtnSubmit(e)}
                          >
                            Submit
                          </Button>
                        )}
                      </div>
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
        </StickyBox>
      )}
    </div>
  );
};

export default SignUp;
