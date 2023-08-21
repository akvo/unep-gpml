import React, { useState } from "react";
import { Button, Tabs, Collapse } from "antd";
import styles from "./index.module.scss";
import { CirclePointer } from "../../components/icons";
import { whoAreWe } from "../../ui-text";

const Landing = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState("1");
  console.log("active", activeAccordion);
  return (
    <div id="landing" className={styles.landing}>
      <div className="hero">
        <div className="container">
          <div className="text">
            <h1>
              Empowering <b>governments</b>
              <br />
              to end plastic pollution
            </h1>
            <p className="p-l">
              The plastic action platform empowers all countries to create and
              implement successful plastic strategies to end plastic pollution.
            </p>
            <Button type="primary" size="large">
              Join Now <CirclePointer />
            </Button>
          </div>
        </div>
      </div>
      <div className={styles.whoAreWe}>
        <div className="container">
          <div className="who-are-we-lg-md">
            <Tabs
              tabPosition="left"
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key)}
              items={whoAreWe.map((item) => {
                return {
                  label: (
                    <span className={styles.whoAreWeItem}>
                      <span className="heading-s bold">{item.title}</span>
                      <CirclePointer />
                    </span>
                  ),
                  key: item.id,
                  children: activeTab === item.id && (
                    <React.Fragment>
                      <div>
                        <strong className="caps-heading-1">{item.title}</strong>
                        <p className="p-l">{item.description}</p>
                      </div>
                    </React.Fragment>
                  ),
                };
              })}
            />
          </div>
          <div className="who-are-we-mobile">
            <Collapse
              bordered={false}
              activeKey={activeAccordion}
              onChange={setActiveAccordion}
              expandIcon={({ isActive }) => (
                <CirclePointer rotate={isActive ? -90 : 90} />
              )}
              accordion
            >
              {whoAreWe.map((item) => (
                <Collapse.Panel
                  header={
                    <strong className="heading-s bold">{item.title}</strong>
                  }
                  key={`${item.id}`}
                >
                  {activeAccordion === `${item.id}` && (
                    <p className="p-s">{item.description}</p>
                  )}
                </Collapse.Panel>
              ))}
            </Collapse>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
