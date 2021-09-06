import { UIStore } from "../../store";
import React, { useEffect } from "react";
import { Row, Col, Card } from "antd";
import "./view-style.scss";
import { useAuth0 } from "@auth0/auth0-react";

const SignupView = ({ ...props }) => {
  const { loginWithPopup } = useAuth0();
  const { history } = props;
  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = null;
    });
  }, [props]);

  return (
    <div id="signup-view">
      <div className="ui container">
        <Row>
          <Col span={12}>
            <h1>Join the GPML</h1>
            <h2>Benefits of joining the GPML:</h2>
            <h3>GPML partnership</h3>
            <ul>
              <li>Tap into a global network of like-minded members</li>
              <li>Discover opportunities to showcase your work</li>
              <li>Avoid duplication of effort and optimise impact​​</li>
            </ul>
            <h3>GPML digital platform</h3>
            <ul>
              <li>Access a data hub to guide efforts towards SDGs and more</li>
              <li>Utilise an array of resources at your fingertips​</li>
              <li>Network with other stakeholders</li>
            </ul>
          </Col>
          <Col span={12}>
            <Card>
              <h2>How do I join?</h2>
              <div className="choices">
                <div onClick={() => history.push("/entity-signup")}>
                  <h4>
                    I represent an <b>Entity</b> and I wish to become a member
                    of the <b>Global partnership on Marine Litter​</b>
                  </h4>
                  <div className="caption">Go to the Partnership</div>
                  <small>You will be taken to the GPML website</small>
                </div>
                <div onClick={() => history.push("/stakeholder-signup")}>
                  <h4>
                    YYYYYI am an <b>Individual</b> and I wish to sign up to the{" "}
                    <b>GPML Digital Platform​</b>
                  </h4>
                  <div className="caption">Join the digital platform</div>
                  <small>You will continue to the next step</small>
                </div>
              </div>
              <div className="login">
                Already have an account?
                <br />
                <div onClick={loginWithPopup}>Sign In</div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SignupView;
