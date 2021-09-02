import { Store } from "pullstate";
import { UIStore } from "../../store";
import React, { useEffect, useRef, useState } from "react";
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
import { schema } from "../signup/schema";
import cloneDeep from "lodash/cloneDeep";
import xor from "lodash/xor";
import api from "../../utils/api";
import isEmpty from "lodash/isEmpty";

const { Step } = Steps;

export const initialSignUpData = {
  tabs: ["S1"],
  required: {
    S1: [],
    S2: [],
    S3: [],
    S4: [],
    S5: [],
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
  S4: {
    steps: 0,
    required: {},
  },
  S5: {
    steps: 0,
    required: {},
  },
};

export const signUpData = new Store({
  data: initialSignUpData,
  editId: null,
});

const getSchema = (
  {
    stakeholders,
    countries,
    tags,
    regionOptions,
    meaOptions,
    sectorOptions,
    organisationType,
    profile,
  },
  loading
) => {
  const prop = cloneDeep(schema.properties);
  prop.S1.properties.email.default = profile.email;
  prop.S1.properties.S1_ExpertisesAndActivities.properties[
    "seeking"
  ].enum = tags?.seeking?.map((it) => String(it.id));
  prop.S1.properties.S1_ExpertisesAndActivities.properties[
    "seeking"
  ].enumNames = tags?.seeking?.map((it) => it.tag);
  prop.S1.properties.S1_ExpertisesAndActivities.properties[
    "offering"
  ].enum = tags?.offering?.map((it) => String(it.id));
  prop.S1.properties.S1_ExpertisesAndActivities.properties[
    "offering"
  ].enumNames = tags?.offering?.map((it) => it.tag);

  prop.S1.properties.S1_ExpertisesAndActivities.properties[
    "tags"
  ].enum = tags?.general?.map((it) => String(it.id));
  prop.S1.properties.S1_ExpertisesAndActivities.properties[
    "tags"
  ].enumNames = tags?.general?.map((it) => it.tag);

  prop.S1.properties[
    "representativeSector"
  ].enum = sectorOptions?.map((it, idx) => String(idx));
  prop.S1.properties["representativeSector"].enumNames = sectorOptions?.map(
    (it) => it
  );

  // // country options
  prop.S1.properties["country"].enum = countries?.map((x) => x.id);
  prop.S1.properties["country"].enumNames = countries?.map((x) => x.name);
  // geocoverage regional options
  prop.S1.properties["geoCoverageValueRegional"].enum = regionOptions.map((x) =>
    String(x.id)
  );
  prop.S1.properties["geoCoverageValueRegional"].enumNames = regionOptions.map(
    (x) => x.name
  );
  // // geocoverage national options
  prop.S1.properties["geoCoverageValueNational"].enum = countries?.map(
    (x) => x.id
  );
  prop.S1.properties["geoCoverageValueNational"].enumNames = countries?.map(
    (x) => x.name
  );
  // // geocoverage sub-national options
  prop.S1.properties["geoCoverageValueSubNational"].enum = countries?.map(
    (x) => x.id
  );
  prop.S1.properties["geoCoverageValueSubNational"].enumNames = countries?.map(
    (x) => x.name
  );
  // // geocoverage transnational options
  prop.S1.properties[
    "geoCoverageValueTransnational"
  ].enum = countries?.map((x) => String(x.id));
  prop.S1.properties[
    "geoCoverageValueTransnational"
  ].enumNames = countries?.map((x) => x.name);
  // // geocoverage global with elements in specific areas options
  prop.S1.properties[
    "geoCoverageValueGlobalSpesific"
  ].enum = meaOptions?.map((x) => String(x.id));
  prop.S1.properties[
    "geoCoverageValueGlobalSpesific"
  ].enumNames = meaOptions?.map((x) => x.name);

  prop.S2.properties["orgRepresentative"].enum = organisationType;

  prop.S3.properties["orgExpertise"].enum = tags?.offering?.map((it) => it.id);
  prop.S3.properties["orgExpertise"].enumNames = tags?.offering?.map(
    (it) => it.tag
  );
  prop.S4.properties["orgHeadquarter"].enum = countries?.map((x) => x.id);

  prop.S4.properties["orgHeadquarter"].enumNames = countries?.map(
    (x) => x.name
  );
  prop.S5.properties["registeredStakeholders"].enum = stakeholders?.map((it) =>
    String(it.id)
  );
  prop.S5.properties["registeredStakeholders"].enumNames = stakeholders?.map(
    (it) =>
      `${it.firstName} ${it.lastName} ${it.email ? "<" + it.email + ">" : ""}`
  );

  return {
    schema: {
      ...schema,
      properties: prop,
    },
    loading: loading,
  };
};

const SignUp = ({ match: { params }, ...props }) => {
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

  const tabsDataRaw = [
    {
      key: "S1",
      title: "Personal Details",
      desc: "",
      steps: [],
    },
    {
      key: "S2",
      title: "Entity Details",
      desc: "",
      steps: [],
    },
    {
      key: "S3",
      title: "Area of Expertise",
      desc: "",
      steps: [],
    },
    {
      key: "S4",
      title: "Geo Coverage",
      desc: "",
      steps: [],
    },
    {
      key: "S5",
      title: "Additional contact person",
      desc: "",
      steps: [],
    },
  ];
  const [tabsData, setTabsData] = useState(tabsDataRaw);
  const [formSchema, setFormSchema] = useState({
    schema: schema,
    loading: true,
  });
  const btnSubmit = useRef();
  const [sending, setSending] = useState(false);
  const [representEntity, setRepresentEntity] = useState(true);
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

  const isLoaded = () => {
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
  };

  useEffect(() => {
    const dataId = Number(params?.id || id);
    if (formSchema.loading && isLoaded()) {
      setFormSchema(getSchema(storeData, false));
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
    //loading,
    storeData,
    formSchema,
    status,
    id,
    data,
    editId,
    params,
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
                    formStep.signup === 2 ? "submitted" : ""
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
                  {formStep.signup === 1 && (
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
        <div className="ui container">
          <div className="form-container">
            {formStep.signup === 1 && (
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
                  <div className="represent-checkbox-wrapper">
                    <Checkbox
                      checked={representEntity}
                      onChange={(e) => {
                        setRepresentEntity(e.target.checked);
                        if (e.target.checked) {
                          setTabsData(tabsDataRaw);
                        } else {
                          setTabsData(([t1]) => {
                            handleOnTabChange("S1");
                            return [t1];
                          });
                        }
                      }}
                    >
                      I represent an entity
                    </Checkbox>
                  </div>
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
            {formStep.signup === 2 && (
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
