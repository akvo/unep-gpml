import { Tabs } from "antd";
import React, { useState } from "react";
import "./styles.scss";
const { TabPane } = Tabs;

function HelpCenter() {
  return (
    <div id="helpCenter">
      <div className="section-container">
        <div className="ui container">
          <Tabs size="large" tabPosition={"top"}>
            <TabPane
              tab="Get Started"
              key="getStarted"
              className="help-center-tab-pane"
            >
              Get Started
            </TabPane>
            <TabPane
              tab="How to Guides"
              key="howTo"
              className="help-center-tab-pane"
            >
              <Tabs size="large" tabPosition={"left"}>
                <TabPane
                  tab="Guidance on how to add resources on the GPML Digital Platform"
                  key="addResources"
                  className="help-center-tab-pane"
                >
                  <iframe
                    frameBorder="0"
                    height="500px"
                    width="100%"
                    src={
                      "https://dev-digital-platform-help-center.pantheonsite.io/sites/default/files/2022-08/Add%20Content%20Guideline.pdf"
                    }
                  />
                </TabPane>
                <TabPane
                  tab="Guidance on how to sign up on the GPML Digital Platform"
                  key="signUp"
                  className="help-center-tab-pane"
                >
                  <iframe
                    frameBorder="0"
                    height="500px"
                    width="100%"
                    src={
                      "https://dev-digital-platform-help-center.pantheonsite.io/sites/default/files/2022-08/Sign%20In%20Document.pdf"
                    }
                  />
                </TabPane>
              </Tabs>
            </TabPane>
            <TabPane
              tab="Video Tutorials"
              key="video"
              className="help-center-tab-pane"
            >
              Video Tutorials
            </TabPane>
            <TabPane
              tab="GPML Tools"
              key="tools"
              className="help-center-tab-pane"
            >
              Tools
            </TabPane>
            <TabPane
              tab="Frequently Asked Questions"
              key="faq"
              className="help-center-tab-pane"
            >
              <div>
                <h5>
                  <strong>WHAT IS THE GPML DIGITAL PLATFORM?</strong>
                </h5>
                <p>
                  The GPML Digital Platform is multi-stakeholder and partly open
                  source, compiling and crowdsourcing different resources,
                  integrating data and connecting stakeholders to guide action.
                </p>
              </div>
              <div>
                <h5>
                  <strong>WHAT DOES THE DIGITAL PLATFORM OFFER?</strong>
                </h5>
                <p>
                  The Digital Platform offers a single point of access for
                  current, accurate data and information on plastic pollution,
                  marine litter and related topics. It provides a wide range of
                  materials to support stakeholders’ needs, ranging from
                  scientific research to technological innovation and public
                  outreach, in order to inform decision-making, educate and
                  raise awareness, facilitate target setting, and advance
                  cooperation. An additional feature is a virtual networking
                  forum for stakeholders.
                </p>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;
