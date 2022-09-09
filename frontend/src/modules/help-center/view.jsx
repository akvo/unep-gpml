import { Col, Row, Tabs } from "antd";
import React, { Fragment, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import "./styles.scss";
const { TabPane } = Tabs;

function HelpCenter() {
  const history = useHistory();
  return (
    <div id="helpCenter">
      <div className="section-container">
        <div className="ui container">
          <Tabs
            size="large"
            tabPosition={"top"}
            onTabClick={(key, e) => {
              if (key === "forums") {
                window.open(
                  "https://communities.gpmarinelitter.org/",
                  "_blank"
                );
              }
              if (key === "glossary") {
                history.push("/glossary");
              }
            }}
          >
            <TabPane
              tab="Get Started"
              key="getStarted"
              className="help-center-tab-pane"
            >
              <iframe
                src={
                  "https://docs.google.com/document/d/1nopNTzzsYJkiJKVog0E75BQrT0NfBuPrt9ZO-FyK3LQ&embedded=true"
                }
                title="file"
                width="100%"
                height="600"
              />
            </TabPane>
            <TabPane
              tab="How to Guides"
              key="howTo"
              className="help-center-tab-pane"
            >
              <ul className="how-to-guide">
                <li>
                  <h2>
                    Guidance on how to add resources on the GPML Digital
                    Platform
                  </h2>
                  <iframe
                    frameBorder="0"
                    height="500px"
                    width="100%"
                    src={
                      "https://dev-digital-platform-help-center.pantheonsite.io/sites/default/files/2022-08/Add%20Content%20Guideline.pdf"
                    }
                  />
                </li>
                <li>
                  <h2>
                    Guidance on how to sign up on the GPML Digital Platform
                  </h2>
                  <iframe
                    frameBorder="0"
                    height="500px"
                    width="100%"
                    src={
                      "https://dev-digital-platform-help-center.pantheonsite.io/sites/default/files/2022-08/Sign%20In%20Document.pdf"
                    }
                  />
                </li>
              </ul>
            </TabPane>
            <TabPane
              tab="Video Tutorials"
              key="video"
              className="help-center-tab-pane"
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <iframe
                    width="100%"
                    height="480"
                    src={`https://www.youtube.com/embed/xSYkLgoHqVQ`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded youtube"
                  />
                </Col>
                <Col span={12}>
                  <iframe
                    width="100%"
                    height="480"
                    src={`https://www.youtube.com/embed/AOOpIn9-zIw`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded youtube"
                  />
                </Col>
                <Col span={12}>
                  <iframe
                    width="100%"
                    height="480"
                    src={`https://www.youtube.com/embed/ka0lbripFJU`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded youtube"
                  />
                </Col>
                <Col span={12}>
                  <iframe
                    width="100%"
                    height="480"
                    src={`https://www.youtube.com/embed/oET7Ham4KV8`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded youtube"
                  />
                </Col>
                <Col span={12}>
                  <iframe
                    width="100%"
                    height="480"
                    src={`https://www.youtube.com/embed/NNGiHD5X3Qo`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded youtube"
                  />
                </Col>
              </Row>
            </TabPane>
            <TabPane
              tab="GPML Tools"
              key="tools"
              className="help-center-tab-pane"
            >
              <iframe
                src={
                  "https://docs.google.com/document/d/1NdbsIjrXxNaGsNt5lcVbWWj3jiY4NiJErOlBPwI-pr8&embedded=true"
                }
                title="file"
                width="100%"
                height="600"
              />
            </TabPane>
            <TabPane
              tab="Frequently Asked Questions"
              key="faq"
              className="help-center-tab-pane faq"
            >
              <iframe
                src={
                  "https://docs.google.com/document/d/1Dl3ZbXn5mK-5dpxBNT2-vZXWZ0Fnb0d82XQMmXKqn94&embedded=true"
                }
                title="file"
                width="100%"
                height="600"
              />
            </TabPane>
            <TabPane
              tab="Validation Mechanism"
              key="validation"
              className="help-center-tab-pane"
            >
              <iframe
                src={
                  "https://docs.google.com/document/d/1n8_mrPU6ETnNAfAQKCK8ldrRAqLysrGKB88u_oMimsM/edit&embedded=true"
                }
                title="file"
                width="100%"
                height="600"
              />
            </TabPane>
            <TabPane
              tab="Glossary"
              key="glossary"
              className="help-center-tab-pane"
            />
            <TabPane
              tab="Forums"
              key="forums"
              className="help-center-tab-pane"
            />
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;
