import { Tabs } from "antd";
import React, { useState } from "react";
import "./styles.scss";
const { TabPane } = Tabs;

function HelpCenter() {
  return (
    <div id="helpCenter">
      <div className="section-container">
        <div className="ui container">
          <Tabs
            // onChange={(key) => setTab(key)}
            size="large"
            tabPosition={"top"}
          >
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
              How to Guides
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
              Frequently Asked Questions
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;
