import React, { useState } from "react";
import { Form } from "react-final-form";
import { Col, Row, Button, Typography } from "antd";

const Wizard = ({
  children,
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
      next();
    }
  };

  return (
    <Form validate={validate} onSubmit={handleSubmit}>
      {({ handleSubmit, submitting, form }) => {
        formRef.current = form;
        return (
          <form
            onSubmit={handleSubmit}
            className={`ui container ${
              currentStep === 0 ? "getting-started" : "step-form"
            }`}
          >
            {steps[currentStep]}
            {currentStep !== 0 && (
              <Row className="button-bottom-panel">
                {currentStep > 0 && (
                  <Button className="step-button-back" onClick={previous}>
                    {"<"} Back
                  </Button>
                )}
                {!isLastPage() && currentStep !== 1 && (
                  <Button
                    className="step-button-next"
                    onClick={() => next(steps.length)}
                  >
                    Next {">"}
                  </Button>
                )}
                {isLastPage() && (
                  <Button disabled={submitting} className="step-button-next">
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
