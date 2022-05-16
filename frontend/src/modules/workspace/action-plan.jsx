import React, { useState } from "react";
import classNames from "classnames";
import plans from "./action-plan-content";

const ActionPlan = ({ active = 1 }) => {
  const [activeStep, setActiveStep] = useState(active);

  const selectedStep = plans?.find((plan) => plan.id === activeStep);

  return (
    <div className="action-plan">
      <h3 className="create-action-plan text-white">
        Get Started: Create and Manage Your Action Plan
      </h3>
      <div className="container">
        <div className="card">
          <ul className="plan-list">
            {plans.map((plan) => (
              <li
                className={classNames("plan-list-item", {
                  active: activeStep === plan.id,
                })}
                key={plan.id}
                onClick={() => setActiveStep(plan.id)}
              >
                <div className="plan-number">{plan.id}</div>
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
