import React, { useState } from "react";

import { Carousel, PageHeader, Row, Col, List, Card, Button } from "antd";

const ActionPlan = ({ plans, classNames }) => {
  const [activeStep, setActiveStep] = useState(0);

  const selectedStep = plans?.find((plan) => plan.id === activeStep);

  return (
    <div className="action-plan">
      <h3 className="create-action-plan text-white">
        Get Started: Create Your Action Plan
      </h3>
      <div className="container">
        <div className="card">
          <ul className="plan-list">
            {plans.map((plan, index) => (
              <li
                className={classNames("plan-list-item", {
                  active: activeStep === index,
                })}
                key={index}
                onClick={() => setActiveStep(index)}
              >
                <div className="plan-number">{index + 1}</div>
                {plan.title}
              </li>
            ))}
          </ul>

          <article className="plan-content">
            <h3 className="plan-heading">Text to be confirmed</h3>
            <p className="plan-paragraph">{selectedStep.content}</p>
          </article>
          <div className="line" />
        </div>
      </div>
    </div>
  );
};

export default ActionPlan;
