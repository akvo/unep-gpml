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
import { useHistory } from "react-router-dom";
import { SwitchTransition, CSSTransition } from "react-transition-group";

function Authentication() {
  const formRef = useRef();
  const location = useLocation();
  let history = useHistory();
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
      ...(location?.state?.data &&
        !location?.state.data.hasOwnProperty("exp") &&
        location?.state?.data),
      ...(location?.state?.data &&
        location?.state.data.hasOwnProperty(
          "https://digital.gpmarinelitter.org/user_metadata"
        ) &&
        location?.state?.data?.[
          "https://digital.gpmarinelitter.org/user_metadata"
        ]),
    };

    data.seeking = values?.seeking?.map((x) => {
      return {
        ...(Object.values(tags)
          .flat()
          .find((o) => o.id === parseInt(x.key)) && { id: parseInt(x.key) }),
        tag:
          Object.values(tags)
            .flat()
            .find((o) => o.id === parseInt(x.key))?.tag ||
          x?.label?.toLowerCase(),
        tag_category: "seeking",
      };
    });
    data.offering = values?.offering?.map((x) => {
      return {
        ...(Object.values(tags)
          .flat()
          .find((o) => o.id === parseInt(x.key)) && { id: parseInt(x.key) }),
        tag:
          Object.values(tags)
            .flat()
            .find((o) => o.id === parseInt(x.key))?.tag ||
          x?.label?.toLowerCase(),
        tag_category: "offering",
      };
    });

    data.tags = [...data.seeking, ...data.offering];
    delete data.seeking;
    delete data.offering;
    delete data.confirm;
    delete data.password;
    delete data.privateCitizen;
    if (location?.state?.data.hasOwnProperty("given_name")) {
      data.firstName = location?.state?.data.given_name;
    }
    if (location?.state?.data.hasOwnProperty("family_name")) {
      data.lastName = location?.state?.data.family_name;
    }
    if (location?.state?.data.hasOwnProperty("email")) {
      data.email = location?.state?.data.email;
    }
    if (location?.state?.data.hasOwnProperty("picture")) {
      data.photo = location?.state?.data.picture;
    }
    if (data.country) {
      data.country = Number(data.country);
    }
    if (data.publicEmail) {
      data.publicEmail = data.publicEmail === "true" ? true : false;
    }

    api
      .post("/profile", data)
      .then((res) => {
        window.scrollTo({ top: 0 });
        history.push("workspace");
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

  const array = Object.keys(tags)
    .map((k) => tags[k])
    .flat();

  const handleSeekingSuggestedTag = (value) => {
    let find = array.find((o) => o.tag === value);
    if (find) {
      value = {
        id: find.id,
        label: find.tag,
        key: find.key,
      };
    } else {
      value = {
        id: Math.floor(Date.now() * 100),
        label: value,
        key: Math.floor(Date.now() * 100),
      };
    }
    formRef?.current?.change("seeking", [
      ...(formRef?.current?.getFieldState("seeking")?.value
        ? formRef?.current?.getFieldState("seeking")?.value
        : []),
      value,
    ]);
  };

  const handleOfferingSuggestedTag = (value) => {
    let find = array.find((o) => o.tag === value);
    if (find) {
      value = {
        id: find.id,
        label: find.tag,
        key: find.key,
      };
    } else {
      value = {
        id: Math.floor(Date.now() * 100),
        label: value,
        key: Math.floor(Date.now() * 100),
      };
    }
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
