import React, { useEffect, useState } from "react";
import { Row, Col, Carousel, Avatar, Typography, Button, List } from "antd";
const { Title } = Typography;
import "./styles.scss";
import Header from "./header";
import LeftSidebar from "../../components/left-sidebar/left-sidebar";
import { useHistory, Link } from "react-router-dom";
// import DownloadPdf from "../../images/workspace/download-pdf.svg";
import DownloadPdf from "../../images/workspace/pdf.png";
import NetworkIcon from "../../images/auth/network.png";
import Video from "../../images/workspace/video.png";
import FAQ from "../../images/workspace/faq.png";

const Workspace = ({ profile }) => {
  const history = useHistory();
  const [isFocal, setIsFocal] = useState(false);

  const handleFocalPoint = (id) => {
    setIsFocal(true);
    localStorage.setItem("is_focal", JSON.stringify({ id: id, status: true }));
  };

  useEffect(() => {
    const item = localStorage.getItem("is_focal");
    if (item && profile) {
      setIsFocal(profile?.org?.id === JSON.parse(item).id ? true : false);
    }
  }, [profile]);

  return (
    <div id="workspace">
      <Row type="flex">
        <LeftSidebar profile={profile}>
          {/* <Header userName={userName} /> */}
          <div className="workspace-content-wrapper">
            <div className="workspace-container">
              {profile &&
                profile?.emailVerified &&
                profile?.reviewStatus === "SUBMITTED" && (
                  <Row>
                    <Col lg={24} sm={24}>
                      <div className="pending-stripe">
                        <Title level={4}>
                          Your account is pending reviewal. You can still
                          explore the platform.
                        </Title>
                      </div>
                    </Col>
                  </Row>
                )}
              {profile && !profile?.emailVerified && (
                <Row>
                  <Col lg={24} sm={24}>
                    <div className="pending-stripe">
                      <Title level={4}>
                        We sent you a confirmation email, Please take a moment
                        and validate your address to confirm your account.
                      </Title>
                    </div>
                  </Col>
                </Row>
              )}
              {profile && profile.org && !profile?.org?.isMember && (
                <Row
                  className="bg-white gpml-section"
                  style={{ order: isFocal && 2 }}
                >
                  <Col lg={12} sm={24}>
                    <div className="content-container">
                      <p className="recommend-text">RECOMMENDED</p>
                      <Title level={2}>GPML Partnership​</Title>
                      <p className="registration-text">
                        Hello, It looks like your entity:{" "}
                        <b>{profile?.org?.name},</b> is not yet part <br /> of
                        the GPML partnership.
                        <br /> If you are the focal point, submit your
                        application below
                      </p>
                      <div className="join-box">
                        <div>
                          <p>
                            By completing this form I confirm that I have the
                            authorization to submit an application on behalf of
                            this Entity to become a member of the Global
                            Partnership on Marine Litter (GPML)​.
                          </p>
                        </div>
                        <div className="button-container">
                          <Button
                            className="join-button"
                            type="primary"
                            shape="round"
                            onClick={() =>
                              history.push({
                                pathname: "entity-signup",
                                state: { data: profile.org },
                              })
                            }
                          >
                            JOIN GPML
                          </Button>
                          {!isFocal && (
                            <Button
                              className="focal-point"
                              onClick={() => handleFocalPoint(profile?.org?.id)}
                            >
                              I AM NOT THE FOCAL POINT
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg={12} sm={24}>
                    <div className="slider-container">
                      <Carousel effect="fade">
                        <div>
                          <div className="slider-wrapper">
                            <Avatar
                              src={NetworkIcon}
                              style={{
                                borderRadius: "initial",
                                margin: "0 auto 40px auto",
                                display: "block",
                                width: 160,
                                height: 140,
                              }}
                            />
                            <Title level={2}>
                              Tap into a global network of like-minded members​
                            </Title>
                          </div>
                        </div>
                        <div>
                          <div className="slider-wrapper">
                            <Avatar
                              src={NetworkIcon}
                              style={{
                                borderRadius: "initial",
                                margin: "0 auto 40px auto",
                                display: "block",
                                width: 160,
                                height: 140,
                              }}
                            />
                            <Title level={2}>
                              Network with other stakeholders
                            </Title>
                          </div>
                        </div>
                      </Carousel>
                    </div>
                  </Col>
                </Row>
              )}
              <Row className="action-plan-container">
                <Col lg={12} sm={24}>
                  <div className="content-container">
                    <p className="recommend-text">Download</p>
                    <Title level={2}>Action Plan Workflow Guidance</Title>
                    <div className="action-plan-wrapper">
                      <div>
                        <p>
                          This one-pager document outlines how the functionality
                          of the Global Partnership on Marine Litter (GPML)
                          Digital Platform supports the development of national
                          marine litter and plastic pollution action plans,
                          within the different phases of the Action Plan
                          Creation Workflow.
                        </p>
                      </div>
                      <a
                        href="https://wedocs.unep.org/bitstream/handle/20.500.11822/37900/Action%20Plan%20Guidance%20document%20.pdf?sequence=1&isAllowed=y"
                        target="_blank"
                        className="download-link"
                      >
                        <div>
                          <img src={DownloadPdf} alt="download-pdf-document" />
                        </div>
                      </a>
                    </div>
                  </div>
                </Col>
                <Col lg={12} sm={24}>
                  <div
                    className="content-container"
                    style={{ backgroundColor: "#fff" }}
                  >
                    <p className="recommend-text">ACTIONS</p>
                    <Title level={2}>Your next steps on GPML</Title>
                    <List itemLayout="horizontal">
                      <List.Item>
                        <List.Item.Meta
                          className={`${
                            profile &&
                            (!profile?.emailVerified ||
                              profile?.reviewStatus === "SUBMITTED")
                              ? "disabled"
                              : ""
                          }`}
                          disabled={
                            profile &&
                            (!profile?.emailVerified ||
                              profile?.reviewStatus === "SUBMITTED")
                          }
                          title={
                            <a
                              href="https://unep-gpml.eu.auth0.com/authorize?response_type=code&client_id=lmdxuDGdQjUsbLbMFpjDCulTP1w5Z4Gi&redirect_uri=https%3A//apps.unep.org/data-catalog/oauth2/callback&scope=openid+profile+email&state=eyJjYW1lX2Zyb20iOiAiL2Rhc2hib2FyZCJ9"
                              target="_blank"
                            >
                              Add data {">"}
                            </a>
                          }
                          description="Contribute to the DataHub maps & dashboard"
                        />
                      </List.Item>
                      <List.Item>
                        <List.Item.Meta
                          className={`${
                            profile &&
                            (!profile?.emailVerified ||
                              profile?.reviewStatus === "SUBMITTED")
                              ? "disabled"
                              : ""
                          }`}
                          disabled={
                            profile &&
                            (!profile?.emailVerified ||
                              profile?.reviewStatus === "SUBMITTED")
                          }
                          title={
                            <Link to="/flexible-forms">
                              Share your knowledge {">"}
                            </Link>
                          }
                          description="Contribute to the global library of initiatives, action plans, financing & tech resources & more"
                        />
                      </List.Item>
                      {/* <List.Item>
                        <List.Item.Meta
                          title={`Suggest an expert >`}
                          description="Tu quoque, Brute, fili mi, nihil timor populi, nihil!"
                        />
                      </List.Item> */}
                      <List.Item>
                        <List.Item.Meta
                          className={`${
                            profile &&
                            (!profile?.emailVerified ||
                              profile?.reviewStatus === "SUBMITTED")
                              ? "disabled"
                              : ""
                          }`}
                          disabled={
                            profile &&
                            (!profile?.emailVerified ||
                              profile?.reviewStatus === "SUBMITTED")
                          }
                          title={
                            <Link to="/connect/community">
                              Match with new opportunities {">"}
                            </Link>
                          }
                          // description="Fictum, deserunt mollit anim laborum astutumque!"
                        />
                      </List.Item>
                    </List>
                  </div>
                </Col>
              </Row>
              <Row className="video-panel">
                <Col lg={24} sm={24}>
                  <Title level={2}>Watch this video to get started</Title>
                  <iframe
                    width="100%"
                    height="640px"
                    src="https://www.youtube.com/embed/xSYkLgoHqVQ"
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </Col>
              </Row>
            </div>
          </div>
          {/* <Col lg={24} md={24} xs={24} order={2}>
            <Row>
              <Col span={24} style={{ position: "relative" }}>
                <div className="section-download text-white">
                  <div className="card">
                    <article className="content">
                      <h3 className="download-guidance text-white">
                        Download the Action Plan Workflow Guidance
                      </h3>
                      <p className="paragraph">
                        This one-pager document outlines how the functionality
                        of the Global Partnership on Marine Litter (GPML)
                        Digital Platform supports the development of national
                        marine litter and plastic pollution action plans, within
                        the different phases of the Action Plan Creation
                        Workflow.
                      </p>
                    </article>
                    <a
                      href="https://wedocs.unep.org/bitstream/handle/20.500.11822/37900/Action%20Plan%20Guidance%20document%20.pdf?sequence=1&isAllowed=y"
                      target="_blank"
                      className="download-link"
                    >
                      <img src={DownloadPdf} alt="download-pdf-document" />
                      <span className="download-text text-white">Download</span>
                    </a>
                  </div>
                </div>
              </Col>
              <ActionPlan />
            </Row>
          </Col> */}
        </LeftSidebar>
      </Row>
    </div>
  );
};

export default Workspace;
