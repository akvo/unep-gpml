import React, { useState } from "react";

const ActionPlan = ({ plans, classNames }) => {
  const [activeStep, setActiveStep] = useState(0);

  const selectedStep = plans?.find((plan) => plan.id === activeStep);

  return (
    <div className="action-plan">
      <h3 className="create-action-plan text-white">
        Get Started: Create and Manage Your Action Plan
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

          <article className="plan-content">{selectedStep.content}</article>
          <div className="line" />
        </div>
      </div>
    </div>
  );
};

export default ActionPlan;
