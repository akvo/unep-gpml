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
import { Field } from "react-final-form";
import Wizard from "../../components/form-wizard/Wizard";

function Authentication() {
  const formRef = useRef();
  const [affiliation, setAffiliation] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const next = (steps) => {
    setCurrentStep(Math.min(currentStep + 1, steps - 1));
  };
  const previous = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const onSubmit = async (values) => {
    await sleep(300);
    window.alert(JSON.stringify(values, 0, 2));
  };

  const Error = ({ name }) => (
    <Field
      name={name}
      subscribe={{ touched: true, error: true }}
      render={({ meta: { touched, error } }) =>
        touched && error ? <span>{error}</span> : null
      }
    />
  );

  const required = (value) => (value ? undefined : "Required");

  const handleAffiliationChange = (value) => {
    setAffiliation(value);
    formRef?.current?.change("privateCitizen", value);
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
        {!affiliation && <FormOne />}
        <FormTwo />
        <FormThree />
        <FormFour />
      </Wizard>
    </div>
  );
}

export default Authentication;
