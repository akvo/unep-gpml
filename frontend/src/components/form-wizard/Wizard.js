import React, { useState } from "react";
import { Form } from "react-final-form";
import { Col, Row, Button, Typography } from "antd";
import {
  SwitchTransition,
  CSSTransition,
  TransitionGroup,
} from "react-transition-group";
import WaveOneImage from "../../images/auth/wave-one.png";
import WaveTwoImage from "../../images/auth/wave-two.png";
import WaveThreeImage from "../../images/auth/wave-three.png";
import WaveFourImage from "../../images/auth/wave-four.png";
import WaveFiveImage from "../../images/auth/wave-five.png";

const Wizard = ({
  children,
  initialValues,
  onSubmit,
  formRef,
  next,
  previous,
  currentStep,
}) => {
  const steps = React.Children.toArray(children);

  const isLastPage = () => currentStep === steps.length - 1;

  const validate = (values) => {
    let activeStep = steps[currentStep];

    return activeStep && activeStep.props.validate
      ? activeStep.props.validate(values)
      : {};
  };

  const handleSubmit = (values) => {
    if (isLastPage()) {
      return onSubmit(values);
    } else {
      next(steps.length);
    }
  };

  const backgrounds = [
    {
      currentStep: 1,
      src: WaveOneImage,
    },
    {
      currentStep: 2,
      src: WaveTwoImage,
    },
    {
      currentStep: 3,
      src: WaveFourImage,
    },
    {
      currentStep: 4,
      src: WaveFourImage,
    },
    {
      currentStep: 5,
      src: WaveFiveImage,
    },
  ];

  const background = backgrounds.find((bg) => bg.currentStep === currentStep);

  return (
    <Form
      initialValues={initialValues}
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, submitting, form }) => {
        formRef.current = form;
        return (
          <form
            onSubmit={handleSubmit}
            className={`ui container ${
              currentStep === 0 ? "getting-started" : "step-form"
            } ${isLastPage() ? "step-form-final" : ""}`}
          >
            {currentStep !== 0 ? (
              <>
                <SwitchTransition mode="out-in">
                  <CSSTransition
                    key={currentStep}
                    addEndListener={(node, done) => {
                      node.addEventListener("transitionend", done, false);
                    }}
                    classNames="fade"
                  >
                    <div className="animation-container">
                      <div className="animate">{steps[currentStep]}</div>
                    </div>
                  </CSSTransition>
                </SwitchTransition>
                <TransitionGroup>
                  <CSSTransition
                    classNames="slide"
                    timeout={{ enter: 5000, exit: 5000 }}
                    key={currentStep}
                  >
                    <img
                      className="background"
                      src={background.src}
                      alt={background.src}
                    />
                    {/* <div className="wave" /> */}
                  </CSSTransition>
                </TransitionGroup>
              </>
            ) : (
              <>{steps[currentStep]}</>
            )}
            {currentStep !== 0 && (
              <Row className="button-bottom-panel">
                {currentStep > 0 && (
                  <Button className="step-button-back" onClick={previous}>
                    {"<"} Back
                  </Button>
                )}
                {!isLastPage() && currentStep !== 1 && (
                  <Button className="step-button-next" onClick={handleSubmit}>
                    Next {">"}
                  </Button>
                )}
                {isLastPage() && (
                  <Button
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="step-button-next"
                  >
                    Submit {">"}
                  </Button>
                )}
              </Row>
            )}
            {currentStep === 0 && (
              <Row
                justify="center"
                align="middle"
                className="button-bottom-panel"
              >
                <Col span={24}>
                  <Button
                    onClick={() => next(steps.length)}
                    className="step-button"
                  >
                    Next {">"}
                  </Button>
                </Col>
              </Row>
            )}
          </form>
        );
      }}
    </Form>
  );
};

export default Wizard;
