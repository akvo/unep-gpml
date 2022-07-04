import React, { useState, useRef, useEffect } from "react";
import "./styles.scss";
import { Button, Typography, Steps } from "antd";
import { Form } from "react-final-form";
const { Title, Link } = Typography;
const { Step } = Steps;
import AffiliationOption from "./affiliation-option";
import FormOne from "./form-one";
import FormTwo from "./form-two";
import FormThree from "./form-three";
import FormFour from "./form-four";
import { UIStore } from "../../store";
import { useLocation } from "react-router-dom";
import api from "../../utils/api";
import { useHistory } from "react-router-dom";
import GettingStartedIcon from "../../images/auth/surfer.svg";
import waveSvg from "../../images/auth/wave.svg";


function Authentication() {
  const formRef = useRef();
  const surferRef = useRef();
  const location = useLocation();
  let history = useHistory();
  const [affiliation, setAffiliation] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [initialValues, setInitialValues] = useState({
    offering: [], offeringSuggested: [], seeking: [], seekingSuggested: []
  });
  const [error, setError] = useState(false);

  const { tags } = UIStore.currentState;

  const next = (skip = 0) => {
    if (
      formRef?.current?.getFieldState("jobTitle").valid &&
      formRef?.current?.getFieldState("orgName").valid &&
      formRef?.current?.getFieldState("offering").valid &&
      formRef?.current?.getFieldState("seeking").valid &&
      formRef?.current?.getFieldState("publicDatabase").valid &&
      formRef?.current?.getFieldState("about").valid
    ) {
      setError(false);
      setCurrentStep(currentStep + 1 + skip);
    } else {
      setError(true);
    }
  };
  const previous = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  const isLastPage = () => currentStep === (affiliation ? 5 : 6 - 1);

  const handleSubmit = (values) => {
    if (isLastPage()) {
      return onSubmit(values);
    } else {
      next();
    }
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

    data.offering = [
      ...values?.offering,
      ...values?.offeringSuggested,
    ];
    data.seeking = [
      ...values?.seeking,
      ...values?.seekingSuggested,
    ];
    delete data.confirm;
    delete data.offeringSuggested;
    delete data.seekingSuggested;
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
    if (name === "offering" && !value) {
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
    formRef?.current?.change("seeking", [
      ...(formRef?.current?.getFieldState("seeking")?.value
        ? formRef?.current?.getFieldState("seeking")?.value
        : []),
      value,
    ]);
  };

  const handleOfferingSuggestedTag = (value) => {
    formRef?.current?.change("offering", [
      ...(formRef?.current?.getFieldState("offering")?.value
        ? formRef?.current?.getFieldState("offering")?.value
        : []),
      value,
    ]);
  };

  const handleRemove = (v) => {
    formRef?.current?.change(
      "offering",
      formRef?.current
        ?.getFieldState("offering")
        ?.value.filter(function (item) {
          return item !== v;
        })
    );
  };

  const setEntity = (res) => {
    formRef?.current?.change("orgName", res.id);
  };

  return (
    <div id="onboarding">
      <Form
        initialValues={initialValues}
        validate={required}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, submitting, form }) => {
          formRef.current = form;
          return (
            <form onSubmit={handleSubmit} className="step-form">
              <div className={`waveboard s${currentStep}`}>
                <div
                  className="slide getting-started"
                  style={{
                    marginLeft: -(
                      currentStep *
                      (window.innerWidth -
                        2 * (window.innerWidth < 1024 ? 20 : 170))
                    ),
                  }}
                >
                  <div className="text-wrapper">
                    <h2>
                      You’re almost set! <br /> We need to ask a few more
                      questions to make the platform relevant to you.
                    </h2>
                  </div>
                  <div className="image-wrapper">
                    <img
                      src={GettingStartedIcon}
                      alt="getting-started"
                      ref={surferRef}
                    />
                  </div>
                  <div className="button-bottom-panel">
                    <Button className="step-button-next" onClick={() => next()}>
                      Next {">"}
                    </Button>
                  </div>
                </div>
                <div className="slide">
                  <AffiliationOption
                    {...{ handleAffiliationChange, affiliation, next }}
                  />
                </div>
                <div className="slide">
                  <FormOne
                    validate={currentStep === 2 ? required : null}
                    error={error}
                    setEntity={setEntity}
                  />
                </div>
                <div className="slide">
                  <FormTwo
                    handleOfferingSuggestedTag={handleOfferingSuggestedTag}
                    validate={currentStep === 3 ? required : null}
                    error={error}
                    handleRemove={handleRemove}
                  />
                </div>
                <div className="slide">
                  <FormThree
                    handleSeekingSuggestedTag={handleSeekingSuggestedTag}
                    validate={currentStep === 4 ? required : null}
                    error={error}
                  />
                </div>
                <div className="slide last">
                  <FormFour
                    validate={currentStep === 5 ? required : null}
                    error={error}
                  />
                </div>
                <Wave step={currentStep} surferRef={surferRef} />
                {currentStep > 0 && (
                  <Button className="step-button-back" onClick={previous}>
                    {"<"} Back
                  </Button>
                )}
                {currentStep < 5 && currentStep > 1 && (
                  <Button
                    className="step-button-next abs"
                    onClick={() => next()}
                  >
                    Next {">"}
                  </Button>
                )}
                {currentStep === 5 && (
                  <Button
                    className="step-button-next abs"
                    onClick={handleSubmit}
                  >
                    Submit {">"}
                  </Button>
                )}
              </div>
            </form>
          );
        }}
      </Form>
    </div>
  );
}

const Wave = ({ step, surferRef }) => {
  const ref = useRef();
  const listener = (e) => {
      const axx = (window.innerWidth / 2 - e.x) / (window.innerWidth / 2);
      const axy = Math.max(
        0,
        (window.innerHeight / 1.2 - e.y) / (window.innerHeight / 1.2)
      );
      ref.current.style.marginLeft = `${axx * 100}px`;
      ref.current.style.marginBottom = `${-axy * 100}px`;
      surferRef.current.style.transform = `translate(${axx * 70}px, ${
        axy * 200 - 50
      }px)`;
    }
  useEffect(() => {
    document.addEventListener("mousemove", listener);
    return () => {
      document.removeEventListener("mousemove", listener)
    }
  }, []);
  return (
    <div className="wave" style={{ left: -(step * (window.innerWidth + 200)) }}>
      <img src={waveSvg} ref={ref} />
    </div>
  );
};

export default Authentication;
