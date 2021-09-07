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
            <h1>Joining the GPML</h1>
            <h3>Global Partnership on Marine Litter (GPML)</h3>
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
              <h2>How do I Join the GPML?</h2>
              <div className="choices">
                <div>
                  <h4>
                    I represent an Entity and I wish to submit an application for this Entity to become a member of the Global Partnership on Marine Litter (GPML)​.
                  </h4>
                  <Button
                    type="default"
                    onClick={() => {
                      setTypeSignUp("entity");
                      loginWithPopup({ screen_hint: "signup" });
                      //                  history.push("/entity-signup");
                    }}
                  >
                    Apply for an Entity
                  </Button>
                </div>
                <div>
                  <h4>
                    I wish to sign up to the GPML Digital Platform in my own individual capacity.
                  </h4>
                  <Button
                    type="default"
                    onClick={() => {
                      setTypeSignUp("stakeholder");
                      loginWithPopup({ screen_hint: "signup" });
                      //                  history.push("/entity-signup");
                    }}
                  >
                    Sign up as an Individual
                  </Button>
                </div>
              </div>
              <div className="login">
                *Note: The GPML is a Partnership of Organizations and Governments, whereas the GPML Digital Platform is open to any individual sign up without necessarily reppresenting an Entity.
                <br />
                <br />
*Note: The term Entity includes both governmental, non-governmental, for profit and non-for-profit organizations.
                <br />
                <br />
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
