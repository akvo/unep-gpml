import React, { useState, useRef, useEffect } from "react";
import "./styles.scss";
import { Carousel, Col, Row, Typography, Button, Steps, Avatar } from "antd";
const { Title, Link } = Typography;
import common from "./common";
const { Step } = Steps;
import Main from "./main";
import GettingStarted from "./getting-started";
import AffiliationOption from "./affiliation-option";
import FormOne from "./form-one";
import FormTwo from "./form-two";
import FormThree from "./form-three";
import FormFour from "./form-four";
import { UIStore } from "../../store";
import Wizard from "../../components/form-wizard/Wizard";
import { useLocation } from "react-router-dom";
import api from "../../utils/api";

function Authentication() {
  const formRef = useRef();
  const location = useLocation();
  const [affiliation, setAffiliation] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const { tags } = UIStore.currentState;

  const next = (steps) => {
    setCurrentStep(Math.min(currentStep + 1, steps - 1));
  };
  const previous = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  const onSubmit = async (values) => {
    let data = {
      ...values,
      ...location?.state?.data,
    };
    data.seeking = values?.seeking?.map((x) => {
      return {
        ...(!isNaN(parseInt(x)) && { id: parseInt(x) }),
        tag:
          Object.values(tags)
            .flat()
            .find((o) => o.id === parseInt(x))?.tag || x?.toLowerCase(),
        tag_category: "seeking",
      };
    });
    data.offering = values?.offering?.map((x) => {
      return {
        ...(!isNaN(parseInt(x)) && { id: parseInt(x) }),
        tag:
          Object.values(tags)
            .flat()
            .find((o) => o.id === parseInt(x))?.tag || x?.toLowerCase(),
        tag_category: "offering",
      };
    });
    data.tags = [...data.seeking, ...data.offering];
    delete data.seeking;
    delete data.offering;
    delete data.confirm;
    delete data.password;
    delete data.privateCitizen;
    api
      .post("/profile", data)
      .then((res) => {
        window.scrollTo({ top: 0 });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const required = (value, name) => {
    if (name === "jobTitle" && !value) {
      return "Please enter job title";
    }
    if (name === "orgName" && !value) {
      return "Please enter the name of entity";
    }
    return value ? undefined : "Required";
  };

  const handleAffiliationChange = (value) => {
    setAffiliation(value);
    formRef?.current?.change("privateCitizen", value);
  };

  const handleSeekingSuggestedTag = (value) => {
    formRef?.current?.change("seeking", [
      ...(formRef?.current?.getFieldState("seeking")?.value
        ? formRef?.current?.getFieldState("seeking")?.value
        : []),
      value,
    ]);
  };

  const handleOfferingSuggestedTag = (value) => {
    console.log(formRef?.current?.getFieldState("offering"));
    formRef?.current?.change("offering", [
      ...(formRef?.current?.getFieldState("offering")?.value
        ? formRef?.current?.getFieldState("offering")?.value
        : []),
      value,
    ]);
  };

  return (
    <div id="authentication">
      <Wizard
        initialValues={{}}
        onSubmit={onSubmit}
        formRef={formRef}
        next={next}
        previous={previous}
        currentStep={currentStep}
      >
        <GettingStarted />
        <AffiliationOption
          handleAffiliationChange={handleAffiliationChange}
          affiliation={affiliation}
          next={next}
        />
        {!affiliation && <FormOne validate={required} />}
        <FormTwo
          handleOfferingSuggestedTag={handleOfferingSuggestedTag}
          validate={required}
        />
        <FormThree
          handleSeekingSuggestedTag={handleSeekingSuggestedTag}
          validate={required}
        />
        <FormFour validate={required} />
      </Wizard>
    </div>
  );
}

export default Authentication;
