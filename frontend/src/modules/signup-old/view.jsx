import { UIStore } from "../../store";
import React, { useEffect, useState } from "react";
import { Button, Row, Col, Card, Avatar } from "antd";
import { UserOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import "./view-style.scss";
import { useAuth0 } from "@auth0/auth0-react";

const SignupView = ({ ...props }) => {
  const { isAuthenticated, loginWithPopup } = useAuth0();
  const { profile, history, setLoginVisible } = props;
  const [typeSignUp, setTypeSignUp] = useState(null);
  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = null;
    });
  }, [props]);

  useEffect(() => {
    if (typeSignUp && profile.email && !profile.about) {
      if (typeSignUp === "entity") {
        history.push("/entity-signup");
      } else {
        history.push("/stakeholder-signup");
      }
    }
  }, [profile, typeSignUp, history]);

  return (
    <div id="signup-view">
      <div className="ui container">
        <Row justify="space-between" gutter={[10, 10]}>
          <Col sm={24} md={12} lg={9} xl={12}>
            <h1 className="joining-header">Joining the GPML</h1>
            <h2>Global Partnership on Marine Litter (GPML)</h2>
            <ul>
              <li>Tap into a global network of like-minded members</li>
              <li>Discover opportunities to showcase your work</li>
              <li>Avoid duplication of effort and optimise impact​​</li>
            </ul>
            <h2>GPML Digital Platform</h2>
            <ul>
              <li>Access a data hub to guide efforts towards SDGs and more</li>
              <li>Utilise an array of resources at your fingertips​</li>
              <li>Network with other stakeholders</li>
            </ul>
          </Col>
          <Col sm={24} md={12} lg={15} xl={12}>
            <Card className="green-overlay">
              <h2>How do I join the GPML?</h2>
              <Row
                className="choices"
                align="middle"
                justify="space-between"
                gutter={[10, 10]}
              >
                <Col
                  sm={24}
                  md={24}
                  lg={12}
                  align="center"
                  className="choices-item"
                >
                  <Card>
                    <Avatar size="large" icon={<UsergroupAddOutlined />} />
                    <p className="body-text">
                      I represent an Entity and I wish to submit an application
                      for this Entity to become a member of the Global
                      Partnership on Marine Litter (GPML)​.
                    </p>
                    <Button
                      type="ghost"
                      className="green"
                      onClick={() => {
                        setTypeSignUp("entity");
                        if (!isAuthenticated) {
                          loginWithPopup({ action: "mixed" });
                        } else {
                          history.push("/entity-signup");
                        }
                      }}
                    >
                      Apply for an Entity
                    </Button>
                  </Card>
                </Col>
                <Col
                  sm={24}
                  md={24}
                  lg={12}
                  align="center"
                  className="choices-item"
                >
                  {!profile?.reviewStatus && (
                    <Card>
                      <Avatar size="large" icon={<UserOutlined />} />
                      <p className="body-text">
                        I wish to sign up to the GPML Digital Platform in my own
                        individual capacity.
                      </p>
                      <Button
                        type="ghost"
                        className="green"
                        onClick={() => {
                          setTypeSignUp("stakeholder");
                          if (!isAuthenticated) {
                            loginWithPopup({ action: "signup" });
                          } else {
                            history.push("/stakeholder-signup");
                          }
                        }}
                      >
                        Sign up as an Individual
                      </Button>
                    </Card>
                  )}
                </Col>
              </Row>
              <div className="login">
                *Note: The GPML is a Partnership of Organizations and
                Governments, whereas the GPML Digital Platform is open to any
                individual sign up without necessarily reppresenting an Entity.
                <br />
                <br />
                *Note: The term Entity includes both governmental,
                non-governmental, for profit and non-for-profit organizations.
                <br />
                <br />
                Already have an account?
                <br />
                <br />
                <div>
                  <Button
                    type="ghost"
                    onClick={() => loginWithPopup({ action: "login" })}
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SignupView;
