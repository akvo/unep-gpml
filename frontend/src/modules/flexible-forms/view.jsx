/* eslint-disable react-hooks/exhaustive-deps */
import { UIStore } from "../../store";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Row, Col, Button, Switch, Radio, Popover, Steps } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  LoadingOutlined,
  EditOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import StickyBox from "react-sticky-box";
import "./styles.scss";
import common from "./common";
import ExampleIcon from "../../images/examples.png";
import InfoBlue from "../../images/i-blue.png";
import FlexibleForm from "./form";
import isEmpty from "lodash/isEmpty";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../../utils/api";
import { revertFormData } from "../../utils/forms";
import { useLocation } from "react-router-dom";
import moment from "moment";
import RichTextEditor from "react-rte";

const { Step } = Steps;

const getType = (type) => {
  let t = "";
  switch (type) {
    case "action":
      t = "action_plan";
      break;
    case "event_flexible":
      t = "event";
      break;
    case "initiative":
      t = "project";
      break;
    case "policy":
      t = "policy";
      break;
    case "financing":
      t = "financing_resource";
      break;
    case "technical":
      t = "technical_resource";
      break;
    case "technology":
      t = "technology";
      break;
  }
  return t;
};

const getTypeByResource = (type) => {
  let t = "";
  let name = "";
  switch (type) {
    case "action_plan":
      t = "action";
      name = "Action Plan";
      break;
    case "event":
      t = "eventevent_flexible";
      name = "Event";
      break;
    case "project":
      t = "initiative";
      name = "Initiative";
      break;
    case "policy":
      t = "policy";
      name = "Policy";
      break;
    case "financing_resource":
      t = "financing";
      name = "Financing Resource";
      break;
    case "technical_resource":
      t = "technical";
      name = "Technical Resource";
      break;
    case "technology":
      t = "technology";
      name = "Technology";
      break;
  }
  return { type: t, name: name };
};

const formDataMapping = [
  {
    key: "title",
    name: "title",
    type: "string",
    question: "title",
    section: "S4",
    group: "S4_G1",
  },
  {
    key: "summary",
    name: "summary",
    type: "string",
    question: "summary",
    section: "S4",
    group: "S4_G1",
  },
  {
    key: "url",
    name: "url",
    type: "string",
    question: "url",
    section: "S4",
    group: "S4_G1",
  },
  {
    key: "geoCoverageType",
    name: "geoCoverageType",
    type: "string",
    question: "geoCoverageType",
    section: "S4",
    group: "S4_G2",
  },
  {
    key: "geoCoverageCountries",
    name: "geoCoverageCountries",
    question: "geoCoverageCountries",
    type: "array",
    section: "S4",
    group: "S4_G2",
  },
  {
    key: "geoCoverageCountryGroups",
    name: "geoCoverageCountryGroups",
    question: "geoCoverageValueTransnational",
    type: "array",
    section: "S4",
    group: "S4_G2",
  },
  {
    key: "tags",
    name: "tags",
    question: "tags",
    type: "array",
    section: "S4",
    group: "S4_G3",
  },
  {
    key: "stakeholderConnections",
    name: "stakeholderConnections",
    question: "individual",
    type: "array",
    section: "S4",
    group: "S4_G5",
  },
  {
    key: "entityConnections",
    name: "entityConnections",
    question: "entity",
    type: "array",
    section: "S4",
    group: "S4_G5",
  },
  {
    key: "validFrom",
    name: "validFrom",
    type: "date",
    section: "S5",
    group: "date",
    question: "validFrom",
  },
  {
    key: "validTo",
    name: "validTo",
    type: "date",
    section: "S5",
    group: "date",
    question: "validTo",
  },
  {
    key: "firstPublicationDate",
    name: "firstPublicationDate",
    type: "date",
    section: "S5",
    group: "dateOne",
    question: "firstPublicationDate",
  },
  {
    key: "latestAmendmentDate",
    name: "latestAmendmentDate",
    type: "date",
    section: "S5",
    group: "dateOne",
    question: "latestAmendmentDate",
  },
  {
    key: "relatedContent",
    name: "relatedContent",
    type: "array",
    section: "S4",
    group: "S4_G6",
    question: "related",
  },
  {
    key: "infoDocs",
    name: "infoDocs",
    type: "string",
    section: "S4",
    group: "S4_G6",
    question: "info",
  },
  {
    key: "publishYear",
    name: "publishYear",
    group: "S5_G1",
    type: "year",
    section: "S5",
    question: "publishYear",
  },
  {
    key: "value",
    name: "value",
    group: "value",
    type: "integer",
    section: "S5",
    question: "valueAmount",
  },
  {
    key: "valueCurrency",
    name: "valueCurrency",
    group: "value",
    type: "string",
    section: "S5",
    question: "valueCurrency",
  },
  {
    key: "valueRemarks",
    name: "valueRemarks",
    group: "value",
    type: "string",
    section: "S5",
    question: "valueRemark",
  },
  {
    key: "image",
    name: "image",
    type: "image",
    section: "S4",
    group: "S4_G4",
    question: "image",
  },
];

const FlexibleForms = ({ match: { params }, ...props }) => {
  const {
    tabs,
    getSchema,
    schema,
    initialData,
    initialFormData,
    initialDataEdit,
  } = common;

  const { loginWithPopup } = useAuth0();

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
    relatedResource: s.relatedResource,
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
    relatedResource,
  } = storeData;

  const tabsData = tabs;
  const state = useLocation();
  const formData = initialFormData.useState();
  const { editId, data } = formData;
  const { status, id } = formEdit.flexible;
  const btnSubmit = useRef();
  const [alert, setAlert] = useState("");
  const [displayModal, setDisplayModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [capacityBuilding, setCapacityBuilding] = useState(false);
  const [mainType, setMainType] = useState("initiative");
  const [label, setLabel] = useState("Initiative");
  const [subType, setSubType] = useState("");
  const [subContentType, setSubContentType] = useState([]);
  const [disabledBtn, setDisabledBtn] = useState({
    disabled: true,
    type: "default",
  });

  const [formSchema, setFormSchema] = useState({
    schema: schema[selectedMainContentType],
  });

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

  const getResourceByType = (type) => {
    const t = getType(type);

    api.get(`/list/${t}`).then((res) => {
      UIStore.update((e) => {
        e.relatedResource = res.data;
      });
    });
  };

  useEffect(() => {
    if (mainType && isLoaded()) {
      getResourceByType(mainType);
    }
  }, [mainType, isLoaded]);

  const getRevertValue = (type, value, name) => {
    let res = value;
    const isObject = typeof value === "object";
    const isArray = Array.isArray(value);
    if (type === "number") {
      res = Number(value);
    }
    if (type === "option" && isObject && !isArray) {
      res = Object.keys(value)[0];
      // case for geocoveragetype
      if (name === "q24") {
        res = Object.values(value)?.[0]?.toLowerCase();
      }
      res = isNaN(Number(res)) ? res : Number(res);
      // case for currency code
      if (name === "q36_1" || name === "q37_1") {
        res = res.split("_").join("");
        res = String(res).toUpperCase();
      }
    }
    if (name === "tags") {
      res = value ? value.map((x) => x.id) : "";
    }

    if (name === "infoDocs") {
      res = value ? value : "";
    }

    if (name === "relatedContent") {
      res = value && value[0].id !== null ? value.map((x) => x.id) : "";
    }

    if (name === "stakeholderConnections") {
      res =
        value.length > 0
          ? value.map((x) => ({ role: x.role, stakeholder: x.stakeholderId }))
          : [{}];
    }

    if (name === "entityConnections") {
      res =
        value.length > 0
          ? value.map((x) => ({ role: x.role, entity: x.id }))
          : [{}];
    }

    if (type === "date") {
      if (name === "validTo" || name === "firstPublicationDate") {
        res =
          !value || value === "Ongoing"
            ? ""
            : moment(value).format("YYYY-MM-DD");
      } else {
        res = value ? moment(value).format("YYYY-MM-DD") : "";
      }
    }

    if (type === "integer") {
      res = value !== "Not  Specified" ? parseInt(value) : value;
    }

    // Geo Transnational handle
    // case for transnational geo value
    if (type === "option" && isArray && name === "q24_4") {
      const transnationalValue = isArray
        ? value.map((item) => {
            const enumKey = Object.keys(item)[0];
            return enumKey;
          })
        : Object.keys(value);
      res = transnationalValue.map((x) => parseInt(x));
    }
    if (type === "option" && isArray && name === "q24_2") {
      const transnationalValue = isArray
        ? value.map((item) => {
            const enumKey = Object.keys(item)[0];
            return enumKey;
          })
        : Object.keys(value);
      res = transnationalValue.map((x) => parseInt(x));
    }
    // EOL Geo Transnational handle

    if (type === "multiple-option" && isObject && isArray) {
      res = value.map((item) => {
        const enumKey =
          typeof item === "object" ? Object.keys(item)?.[0] : item;
        return enumKey;
      });
    }
    if (type === "item-array" && isObject && isArray) {
      res = value;
    }
    console.log(name);
    console.log(res);
    return res;
  };

  const revertFormData = (data) => {
    let formData = initialDataEdit;
    formDataMapping.forEach((item) => {
      const { name, section, group, question, type } = item;

      const value = data?.[name];
      if (!group && value && value !== "Ongoing") {
        formData = {
          ...formData,
          [section]: {
            ...formData[section],
            [question]: getRevertValue(type, value, name),
          },
        };
      }
      if (group && value && value !== "Ongoing") {
        formData = {
          ...formData,
          [section]: {
            ...formData[section],
            [group]: {
              ...formData[section][group],
              [question]: getRevertValue(type, value, name),
            },
          },
        };
      }
    });
    return formData;
  };

  useEffect(() => {
    if (status === "edit") {
      const dataId = Number(params?.id || id);
      setMainType(getTypeByResource(state?.state.type).type);
      setLabel(getTypeByResource(state?.state.type).name);
      setFormSchema({
        schema: schema[getTypeByResource(state?.state.type).type],
      });
      UIStore.update((event) => {
        event.selectedMainContentType = getTypeByResource(
          state?.state.type
        ).type;
      });
      api.get(`/detail/${state?.state.type}/${dataId}`).then((d) => {
        initialFormData.update((e) => {
          e.data = revertFormData(d.data);
        });
      });
    }
  }, [status, schema, initialFormData, state]);

  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = null;
      e.formEdit = {
        ...e.formEdit,
        flexible: {
          status: "add",
          id: null,
        },
      };
    });
  }, [props]);

  useEffect(() => {
    const search = mainContentType.find((element) => element.code === mainType)
      .childs;
    setSubContentType(search);
  }, [mainContentType, mainType]);

  useEffect(() => {
    UIStore.update((e) => {
      e.highlight = highlight;
    });
    setFormSchema({ schema: schema[selectedMainContentType] });
  }, [schema, highlight, selectedMainContentType]);

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
    profile,
  ]);

  useEffect(() => {
    if (isLoaded()) {
      initialFormData.update((e) => {
        e.data = {
          ...e.data,
          S4: {
            ...e.data.S4,
            S4_G5: {
              ...e.data.S4.S4_G5,
              individual: [
                { role: "owner", stakeholder: profile.id },
                ...e.data.S4.S4_G5.individual,
              ],
            },
          },
        };
      });
    }
  }, [initialFormData, isLoaded, profile]);

  // Todo ask to login if not login

  // useEffect(() => {
  //   if (Object.keys(profile).length === 0) {
  //     loginWithPopup({ action: "login" });
  //   }
  // }, [profile, loginWithPopup, isLoaded]);

  const renderSteps = (parentTitle, section, steps, index) => {
    const totalRequiredFields = data?.required?.[section]?.length || 0;
    const customTitle = (status) => {
      const color = totalRequiredFields === 0 ? "#fff" : "#255B87";
      const background = totalRequiredFields === 0 ? "#1CA585" : "#fff";
      const display =
        status === "active"
          ? "unset"
          : totalRequiredFields === 0
          ? "unset"
          : "none";
      return (
        <div className="custom-step-title">
          <span>{parentTitle}</span>
          {parentTitle === "Basic info" ? (
            <Button
              type="ghost"
              size="small"
              shape="circle"
              icon={
                totalRequiredFields === 0 &&
                data?.S4?.S4_G5.individual.length > 0 &&
                data?.S4?.S4_G5.individual[0].hasOwnProperty("role") ? (
                  <CheckOutlined />
                ) : (
                  <EditOutlined />
                )
              }
              style={{
                right: "0",
                position: "absolute",
                color: color,
                borderColor: "#1CA585",
                backgroundColor: background,
                display: display,
              }}
            />
          ) : (
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
                borderColor: "#1CA585",
                backgroundColor: background,
                display: display,
              }}
            />
          )}
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
      const customChildTitle = (status) => {
        const color = requiredFields === 0 ? "#255B87" : "#fff";
        const background = requiredFields === 0 ? "#fff" : "#fff";
        const display =
          status === "active"
            ? "unset"
            : requiredFields === 0
            ? "unset"
            : "none";
        return (
          <div className="custom-child-title">
            <span>{title}</span>
            {title === "Stakeholders connections" ? (
              <Button
                type="ghost"
                size="small"
                shape="circle"
                icon={
                  data?.[section]?.S4_G5.individual.length > 0 &&
                  data?.[section]?.S4_G5.individual[0].hasOwnProperty(
                    "role"
                  ) ? (
                    <CheckOutlined />
                  ) : (
                    <EditOutlined />
                  )
                }
                style={{
                  right: "0",
                  position: "absolute",
                  color:
                    data?.[section]?.S4_G5.individual &&
                    data?.[section]?.S4_G5.individual[0].hasOwnProperty("role")
                      ? "#255B87"
                      : "#fff",
                  borderColor: "#255B87",
                  backgroundColor: background,
                  display: display,
                }}
              />
            ) : (
              <Button
                type="ghost"
                size="small"
                shape="circle"
                icon={
                  requiredFields === 0 ? <CheckOutlined /> : <EditOutlined />
                }
                style={{
                  right: "0",
                  position: "absolute",
                  color: color,
                  borderColor: "#255B87",
                  backgroundColor: background,
                  display: display,
                }}
              />
            )}
          </div>
        );
      };
      return (
        <Step
          key={section + key}
          title={customChildTitle("active")}
          className={"child-item"}
          status={requiredFields === 0 ? "finish" : "process"}
        />
      );
    });
    return [
      <Step
        key={section}
        title={customTitle("active")}
        className={
          totalRequiredFields === 0
            ? "step-section step-section-finish parent-item"
            : "step-section parent-item"
        }
        status={totalRequiredFields === 0 ? "finish" : "process"}
        icon={customIcon("active")}
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
    setCapacityBuilding(false);
    if (e.target.value === "capacity_building") {
      setMainType(e.target.value);
      const search = mainContentType.find(
        (element) => element.code === e.target.value
      ).childs;
      setSubContentType(search);
      return;
    }
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
    setSubType(e);
    if (
      mainType === "capacity_building" &&
      (e === "Guidance Documents" ||
        e === "Tools & toolkits" ||
        e === "Courses & Trainings" ||
        e === "Educational & Outreach resources" ||
        e === "Case studies")
    ) {
      setLabel("Technical Resource");
      setFormSchema({ schema: schema["technical"] });
      setCapacityBuilding(true);
      UIStore.update((event) => {
        event.selectedMainContentType = "technical";
      });
    }
    if (mainType === "capacity_building" && e === "Financing Resources") {
      setLabel("Financing Resource");
      setFormSchema({ schema: schema["financing"] });
      setCapacityBuilding(true);
      UIStore.update((event) => {
        event.selectedMainContentType = "financing";
      });
    }
    if (mainType === "capacity_building" && e === "Events") {
      setLabel("Event");
      setFormSchema({ schema: schema["event_flexible"] });
      setCapacityBuilding(true);
      UIStore.update((event) => {
        event.selectedMainContentType = "event_flexible";
      });
    }
    if (mainType === "capacity_building" && e === "Initiatives") {
      setLabel("Initiatives");
      setFormSchema({ schema: schema["initiative"] });
      setCapacityBuilding(true);
      UIStore.update((event) => {
        event.selectedMainContentType = "initiative";
      });
    }
    if (mainType === "initiative") {
      if (e === "Working with people") {
        initialFormData.update((e) => {
          e.data = {
            ...e.data,
            S5: {
              ...e.data.S5,
              S5_G1: {
                ...e.data.S4.S5_G1,
                S5_G1_4: ["4-1"],
              },
            },
          };
        });
      }
      if (e === "Legislation, standards, rules") {
        initialFormData.update((e) => {
          e.data = {
            ...e.data,
            S5: {
              ...e.data.S5,
              S5_G1: {
                ...e.data.S4.S5_G1,
                S5_G1_4: ["4-0"],
              },
            },
          };
        });
      }
      if (e === "Technology and Processes") {
        initialFormData.update((e) => {
          e.data = {
            ...e.data,
            S5: {
              ...e.data.S5,
              S5_G1: {
                ...e.data.S4.S5_G1,
                S5_G1_4: ["4-2"],
              },
            },
          };
        });
      }
      if (e === "Monitoring and Analysis") {
        initialFormData.update((e) => {
          e.data = {
            ...e.data,
            S5: {
              ...e.data.S5,
              S5_G1: {
                ...e.data.S4.S5_G1,
                S5_G1_4: ["4-3"],
              },
            },
          };
        });
      }
    }
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

            {!isLoaded() ? (
              <h2 className="loading">
                <LoadingOutlined spin /> Loading
              </h2>
            ) : (
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
                        We are excited to hear from the members of our
                        community. The GPML Digital Platform is crowdsourced and
                        allows everyone to submit new content via this form.
                      </p>
                      <p>
                        A wide range of resources can be submitted, and these
                        include Action Plans, Initiatives, Technical resources,
                        Financing resources, Policies, Events, and Technologies.
                        Learn more about each category and sub-categories
                        definitions in the “Content Type” section of this form.
                        A quick summary sheet with categories and sub-categories
                        can be downloaded{" "}
                        <a
                          href="https://wedocs.unep.org/bitstream/handle/20.500.11822/37512/Categories%20and%20Sub%20Categories%20for%20the%20forms.pdf?sequence=3&isAllowed=y"
                          target="_blank"
                        >
                          here
                        </a>
                        .
                      </p>
                      <p>
                        Once submitted resources go through a review process
                        which is being fine-tuned via consultations to assess
                        content accuracy and quality. The current validation
                        mechanism draft can be found under{" "}
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
                    </div>
                  </Row>
                ) : getTabStepIndex().tabIndex === 1 ? (
                  <Row>
                    <div
                      className="main-content"
                      style={{
                        position:
                          getTabStepIndex().tabIndex === 1 && "relative",
                        overflow: getTabStepIndex().tabIndex === 1 && "hidden",
                      }}
                    >
                      <div className="button-wrapper">
                        <h5>Pick the main content type</h5>
                        {/* <Button
                          icon={<img src={ExampleIcon} alt="Example button" />}
                          size="large"
                          onClick={() => setDisplayModal(!displayModal)}
                        >
                          SHOW EXAMPLES
                        </Button> */}
                      </div>
                      <div>
                        <div className={`Modal ${displayModal ? "Show" : ""}`}>
                          <Button
                            icon={
                              <img src={ExampleIcon} alt="Example button" />
                            }
                            size="large"
                            onClick={() => setDisplayModal(!displayModal)}
                            className="hide-button"
                          >
                            HIDE EXAMPLES
                          </Button>
                        </div>
                        <div
                          className={`Overlay ${displayModal ? "Show" : ""}`}
                          onClick={() => setDisplayModal(!displayModal)}
                        />
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
                                        mainType === item.code
                                          ? imgSelected
                                          : img
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
                        <div className="sub-content-wrapper">
                          <h5>Pick the sub-content type</h5>
                          <span>Optional</span>
                        </div>
                      </div>
                      {subContentType.length > 0 ? (
                        <div className="sub-content-topics">
                          <div className="ant-row" value={subType}>
                            {subContentType.map((item, index) => (
                              <Col
                                className="gutter-row"
                                xs={12}
                                lg={6}
                                key={index}
                              >
                                <div
                                  className={`ant-radio-button-wrapper ${
                                    item.title === subType ? "selected" : ""
                                  }`}
                                  key={index}
                                  onClick={() => {
                                    if (item.title === subType) {
                                      setSubType("");
                                    } else {
                                      handleSubContentType(item.title);
                                    }
                                  }}
                                >
                                  {item.title}
                                  <Popover content={item.des}>
                                    <div className="info-icon-wrapper">
                                      <img src={InfoBlue} />
                                    </div>
                                  </Popover>
                                </div>
                              </Col>
                            ))}
                          </div>
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
                      subContentType={subType}
                      capacityBuilding={capacityBuilding}
                      type={state && state?.state ? state?.state.type : ""}
                    />
                  </Row>
                )}
                {getTabStepIndex().tabIndex === 0 ? (
                  <div className="bottom-panel">
                    <div className="center-content">
                      <p>Getting Started</p>
                    </div>
                    <div
                      className="next-button"
                      onClick={(e) => handleOnClickBtnNext(e)}
                    >
                      <p>Next</p>
                      <RightOutlined />
                    </div>
                  </div>
                ) : getTabStepIndex().tabIndex === 1 ? (
                  <div className="bottom-panel">
                    <div
                      className="back-button"
                      onClick={(e) => handleOnClickBtnBack(e)}
                    >
                      <LeftOutlined />
                      <p>Back</p>
                    </div>
                    <div className="center-content">
                      <p>Field to submit</p>
                      <h6>0 of 1</h6>
                    </div>
                    <div
                      className="next-button"
                      onClick={(e) => handleOnClickBtnNext(e)}
                    >
                      <p>Next</p>
                      <RightOutlined />
                    </div>
                  </div>
                ) : getTabStepIndex().tabIndex === 2 ? (
                  <div className="bottom-panel">
                    <div
                      className="back-button"
                      onClick={(e) => handleOnClickBtnBack(e)}
                    >
                      <LeftOutlined />
                      <p>Back</p>
                    </div>
                    <div className="center-content">
                      <p>Field to submit</p>
                      <h6>
                        {data?.[data.tabs[0]]?.required?.[
                          Object.keys(data?.[data.tabs[0]]?.required)[
                            getTabStepIndex().stepIndex
                          ]
                        ]?.length || 0}
                      </h6>
                    </div>
                    <div
                      className="next-button"
                      onClick={(e) => handleOnClickBtnNext(e)}
                    >
                      <p>Next</p>
                      <RightOutlined />
                    </div>
                  </div>
                ) : (
                  <div className="bottom-panel">
                    <div
                      className="back-button"
                      onClick={(e) => handleOnClickBtnBack(e)}
                    >
                      <LeftOutlined />
                      <p>Back</p>
                    </div>
                  </div>
                )}
              </Col>
            )}
          </Row>
        </div>
      </div>
      {/* </StickyBox> */}
    </div>
  );
};

export default FlexibleForms;
