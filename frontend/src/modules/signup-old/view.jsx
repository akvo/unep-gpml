import { UIStore } from "../../store";
import React, { useEffect } from "react";
import { Button, Row, Col, Card } from "antd";
import "./view-style.scss";
import { useAuth0 } from "@auth0/auth0-react";

const SignupView = ({ ...props }) => {
  const { loginWithPopup } = useAuth0();
  const { history, setTypeSignUp } = props;
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
                <div>
                  <h4>
                    I represent an <b>Entity</b> and I wish to become a member
                    of the <b>Global partnership on Marine Litter​</b>
                  </h4>
                  <h4>
                    You will need to join as a member of the GPML Digital
                    platform as well
                  </h4>
                  <Button
                    type="default"
                    onClick={() => {
                      setTypeSignUp("entity");
                      loginWithPopup({ screen_hint: "signup" });
                      //                  history.push("/entity-signup");
                    }}
                  >
                    Join as an entity
                  </Button>
                </div>
                <div>
                  <h4>
                    I am an <b>Individual</b> and I wish to sign up to the{" "}
                    <b>GPML Digital Platform​</b>
                  </h4>
                  <Button
                    type="default"
                    onClick={() => {
                      setTypeSignUp("stakeholder");
                      loginWithPopup({ screen_hint: "signup" });
                      //                  history.push("/entity-signup");
                    }}
                  >
                    Join as an individual
                  </Button>
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
