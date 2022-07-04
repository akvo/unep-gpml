import React from "react";
import { Row, Col, Carousel, Avatar, Typography, Button, List } from "antd";
const { Title, Link } = Typography;

import "./styles.scss";
import Header from "./header";
import LeftSidebar from "../../components/left-sidebar/left-sidebar";
import ActionPlan from "./action-plan";

// Icons
import { ReactComponent as IconHome } from "../../images/workspace/home-icon.svg";
import { ReactComponent as IconAdmin } from "../../images/workspace/admin-icon.svg";
// import DownloadPdf from "../../images/workspace/download-pdf.svg";
import DownloadPdf from "../../images/workspace/pdf.png";
import NetworkIcon from "../../images/auth/network.png";
import Video from "../../images/workspace/video.png";
import FAQ from "../../images/workspace/faq.png";

const Workspace = ({ profile }) => {
  const userName =
    profile?.firstName !== undefined &&
    profile?.lastName !== undefined &&
    `${profile.firstName} ${profile.lastName}`;

  const sidebar = [
    { id: 1, title: "Home", url: "/workspace", icon: <IconHome /> },
    {
      id: 4,
      title: "Admin",
      url: profile.role !== "USER" ? "/profile/admin-section" : "",
      icon: <IconAdmin />,
    },
  ];

  return (
    <div id="workspace">
      <Row type="flex">
        <LeftSidebar profile={profile}>
          {/* <Header userName={userName} /> */}
          <div className="workspace-content-wrapper">
            <div className="workspace-container">
              {profile.org && (
                <Row className="bg-white">
                  <Col lg={12} sm={24}>
                    <div className="content-container">
                      <p className="recommend-text">RECOMMENDED</p>
                      <Title level={2}>GPML Partnership​</Title>
                      <p className="registration-text">
                        Hello, It looks like your entity: <b>Entity Name,</b> is
                        not yet part <br /> of the GPML partnership.
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
                          >
                            JOIN GPML
                          </Button>
                          <Button className="focal-point">
                            I AM NOT THE FOCAL POINT
                          </Button>
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
              <Row gutter={[8, 16]} className="action-plan-container">
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
                          title={`Add data >`}
                          description="Curabitur est gravida et libero vitae dictum."
                        />
                      </List.Item>
                      <List.Item>
                        <List.Item.Meta
                          title={`Add resources >`}
                          description="A communi observantia non est recedendum."
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
                          title={`Network and collaborate >`}
                          description="Fictum, deserunt mollit anim laborum astutumque!"
                        />
                      </List.Item>
                    </List>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="video-panel">
              <div className="workspace-container">
                <Row gutter={[10, 16]} style={{ marginBottom: 0 }}>
                  <Col lg={14} sm={24}>
                    <div>
                      <Title level={2}>
                        If you are getting started, watch this video
                      </Title>
                      <iframe
                        width="100%"
                        height="390px"
                        src="https://www.youtube.com/embed/xSYkLgoHqVQ"
                        title="YouTube video player"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                      ></iframe>
                    </div>
                  </Col>
                  <Col lg={10} sm={24}>
                    <div className="faq-section-container">
                      <Title level={2}>
                        If you are getting started, watch this video
                      </Title>
                      <div className="faq-section">
                        <div className="faq-section-content">
                          <p>
                            All FAQs, tutorials and more on the GPML digital
                            platform.
                          </p>
                          <div>
                            <img src={FAQ} alt="FAQ" />
                          </div>
                        </div>
                        <Button>Find your answers {">"}</Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
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
