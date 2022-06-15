import React, { useState } from "react";
import "./styles.scss";
import { Carousel, Col, Row, Typography, Button, Steps, Avatar } from "antd";
const { Title, Link } = Typography;
import common from "./common";
const { Step } = Steps;
import Main from "./main";
import GettingStarted from "./getting-started";

function Authentication() {
  const { tabs, initialData, initialFormData } = common;
  const tabsData = tabs;
  const formData = initialFormData.useState();
  const { editId, data } = formData;

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

  const getTabStepIndex = () => {
    const section = data.tabs[0];
    const stepIndex = data[section].steps;
    const tabIndex = tabsData.findIndex((tab) => tab.key === section);
    const steps = tabsData[tabIndex]?.steps || [];
    return { tabIndex, stepIndex, steps };
  };

  const renderStep = (step, handleOnClickBtnNext, handleOnClickBtnBack) => {
    switch (step) {
      case 0:
        return <Main handleOnClickBtnNext={handleOnClickBtnNext} />;
      case 1:
        return <GettingStarted handleOnClickBtnBack={handleOnClickBtnBack} />;
      default:
        return null;
    }
  };

  return (
    <div id="authentication">
      {renderStep(
        getTabStepIndex().tabIndex,
        handleOnClickBtnNext,
        handleOnClickBtnBack
      )}
    </div>
  );
}

export default Authentication;
