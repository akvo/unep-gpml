import { Col, Row, Tabs } from "antd";
import React from "react";
import styles from "./styles.module.scss";
const { TabPane } = Tabs;

function HelpCenter() {
  return (
    <div className={styles.helpCenter}>
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
              // if (key === "glossary") {
              //   history.push("/glossary");
              // }
            }}
          >
            <TabPane
              tab="Get Started"
              key="getStarted"
              className="help-center-tab-pane"
            >
              <iframe
                src={
                  "https://docs.google.com/document/d/e/2PACX-1vSsL8Pou0JXSh9qCMnUcGMhaEkj1oULd12ZZq81vxArBhFPYiDePV5JMxXsewTYPmcxXUMX0yntYBX7/pub?embedded=true"
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
                      "https://dev-digital-platform-help-center.pantheonsite.io/sites/default/files/2023-06/Add%20Content%20Guideline%20%285%29.pdf"
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
                      "https://dev-digital-platform-help-center.pantheonsite.io/sites/default/files/2023-06/How%20to%20sign%20up%20%281%29.pdf"
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
                <Col span={24}>
                  <iframe
                    width="100%"
                    height="600"
                    src="https://www.youtube.com/embed/videoseries?list=PLOlw9GG0Pf9iilXoal3dNxnRlM4xn8pII"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
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
                  "https://docs.google.com/document/d/e/2PACX-1vT553Y4g-Xo5nG5llgf5FbGFzxCaZkOPlZ2MOvyPFY7PeQuqGCpDZP6_J2negT7RY9PkblAJrifYw9Y/pub?embedded=true"
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
                  "https://docs.google.com/document/d/e/2PACX-1vTrJhxqW49qwLE_JOT9EnJWpGlGOtdjZOAyqlPoSSUBOlPvTbckHkejld80YtTYYjvAgSCDQrg3hxad/pub?embedded=true"
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
                  "https://docs.google.com/document/d/e/2PACX-1vRoIYUcPZT9Eg2idGgytRPT222Nwia4kKNmRbCOY-PiNJqSo9X_BLccEqx3YParFbAQK2ewHRqzqquI/pub?embedded=true"
                }
                title="file"
                width="100%"
                height="600"
              />
            </TabPane>
            {/* <TabPane
              tab="Glossary"
              key="glossary"
              className="help-center-tab-pane"
            >
              <iframe
                src={"https://dev-gpmlglossary.pantheonsite.io/"}
                title="file"
                width="100%"
                height="600"
              />
            </TabPane>
            <TabPane
              tab="Forums"
              key="forums"
              className="help-center-tab-pane"
            /> */}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;
